import { describe, expect, it } from 'vitest'
import { SessionManager } from './session-manager'

describe('SessionManager', () => {
  it('创建 session 并保存元信息', () => {
    const manager = new SessionManager({
      sessionIdGenerator: () => 'session-1',
    })

    const session = manager.createSession('prompt-template-weekly-report', {
      userId: 'user-1',
    })

    expect(session).toMatchObject({
      sessionId: 'session-1',
      demoId: 'prompt-template-weekly-report',
      userId: 'user-1',
    })
    expect(manager.size()).toBe(1)
  })

  it('追加消息并查询历史', () => {
    const manager = new SessionManager({
      sessionIdGenerator: () => 'session-1',
    })

    manager.createSession('demo-1')
    manager.addMessage('session-1', 'user', 'hello')
    manager.addMessage('session-1', 'assistant', 'world')

    expect(manager.getHistory('session-1')).toHaveLength(2)
    expect(manager.getRecentMessages('session-1', 1)).toEqual([
      expect.objectContaining({
        role: 'assistant',
        content: 'world',
      }),
    ])
  })

  it('结束 session', () => {
    const manager = new SessionManager({
      sessionIdGenerator: () => 'session-1',
    })

    manager.createSession('demo-1')

    expect(manager.endSession('session-1')).toBe(true)
    expect(manager.size()).toBe(0)
  })

  it('清理过期 session', () => {
    const manager = new SessionManager({
      ttlMs: 1000,
      sessionIdGenerator: () => 'session-1',
    })

    const session = manager.createSession('demo-1')
    session.lastActivityAt = new Date('2024-01-01T00:00:00.000Z')

    const deletedCount = manager.cleanupExpiredSessions(
      new Date('2024-01-01T00:00:02.000Z'),
    )

    expect(deletedCount).toBe(1)
    expect(manager.size()).toBe(0)
  })

  it('session 不存在时抛出错误', () => {
    const manager = new SessionManager()

    expect(() => manager.getHistory('unknown')).toThrow('未找到 session：unknown')
  })
})
