/**
 * 会话中单条 AI 消息的角色类型。
 */
export type AiMessageRole = 'system' | 'user' | 'assistant' | 'tool'

/**
 * AI 会话中的消息结构。
 */
export interface AiMessage {
  /**
   * 消息角色。
   */
  role: AiMessageRole
  /**
   * 消息正文。
   */
  content: string
  /**
   * 附加元信息，例如 tool name、trace id、token 用量等。
   */
  metadata?: Record<string, unknown>
  /**
   * 写入消息的时间戳。
   */
  createdAt: Date
}

/**
 * 单个 demo 的 AI 会话结构。
 */
export interface AiSession {
  /**
   * 会话唯一标识。
   */
  sessionId: string
  /**
   * 当前会话归属的 demo id。
   */
  demoId: string
  /**
   * 预留的用户标识。
   */
  userId?: string
  /**
   * 消息历史。
   */
  messages: AiMessage[]
  /**
   * 会话创建时间。
   */
  createdAt: Date
  /**
   * 最近活跃时间。
   */
  lastActivityAt: Date
}

/**
 * 创建会话时的附加参数。
 */
export interface CreateSessionOptions {
  /**
   * 预留的用户标识。
   */
  userId?: string
  /**
   * 指定自定义 sessionId，便于外部系统透传。
   */
  sessionId?: string
}

/**
 * 内存 session manager 的运行选项。
 */
export interface SessionManagerOptions {
  /**
   * 空闲会话过期毫秒数。
   */
  ttlMs?: number
  /**
   * 测试或外部系统可注入自定义 sessionId 生成器。
   */
  sessionIdGenerator?: () => string
}
