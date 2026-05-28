import {
  type AiMessage,
  type AiMessageRole,
  type AiSession,
  type CreateSessionOptions,
  type SessionManagerOptions,
} from './session.types'

const defaultSessionTtlMs = 1000 * 60 * 60

/**
 * 内存版 AI session 管理器，为后续 Redis / DB 落地保留统一契约。
 */
export class SessionManager {
  private readonly sessions = new Map<string, AiSession>()
  private readonly ttlMs: number
  private readonly sessionIdGenerator: () => string

  constructor(options: SessionManagerOptions = {}) {
    this.ttlMs = options.ttlMs ?? defaultSessionTtlMs
    this.sessionIdGenerator =
      options.sessionIdGenerator ??
      (() => `${Date.now()}-${Math.random().toString(16).slice(2)}`)
  }

  /**
   * 创建新会话。
   */
  createSession(demoId: string, options: CreateSessionOptions = {}): AiSession {
    const now = new Date()
    const session: AiSession = {
      sessionId: options.sessionId ?? this.sessionIdGenerator(),
      demoId,
      userId: options.userId,
      messages: [],
      createdAt: now,
      lastActivityAt: now,
    }

    this.sessions.set(session.sessionId, session)

    return session
  }

  /**
   * 追加一条消息并刷新会话活跃时间。
   */
  addMessage(
    sessionId: string,
    role: AiMessageRole,
    content: string,
    metadata?: Record<string, unknown>,
  ): AiMessage {
    const session = this.getSessionOrThrow(sessionId)
    const message: AiMessage = {
      role,
      content,
      metadata,
      createdAt: new Date(),
    }

    session.messages.push(message)
    session.lastActivityAt = message.createdAt

    return message
  }

  /**
   * 获取完整消息历史。
   */
  getHistory(sessionId: string): AiMessage[] {
    return [...this.getSessionOrThrow(sessionId).messages]
  }

  /**
   * 获取最近 N 条消息。
   */
  getRecentMessages(sessionId: string, count: number): AiMessage[] {
    const messages = this.getSessionOrThrow(sessionId).messages

    if (count <= 0) {
      return []
    }

    return messages.slice(-count)
  }

  /**
   * 结束会话并返回是否删除成功。
   */
  endSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  /**
   * 清理超时会话，返回清理数量。
   */
  cleanupExpiredSessions(now = new Date()): number {
    let deletedCount = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivityAt.getTime() > this.ttlMs) {
        this.sessions.delete(sessionId)
        deletedCount += 1
      }
    }

    return deletedCount
  }

  /**
   * 返回当前会话数量，便于测试和监控。
   */
  size(): number {
    return this.sessions.size
  }

  private getSessionOrThrow(sessionId: string): AiSession {
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new Error(`未找到 session：${sessionId}`)
    }

    return session
  }
}
