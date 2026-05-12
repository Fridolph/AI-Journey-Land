export type DemoRunStatus = 'success' | 'error'
export type DemoDisplayMode = 'custom-page' | 'generic-runner'

/**
 * API 标准响应结构，与后端 ResponseInterceptor 保持一致。
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
  timestamp: string
  path: string
}

export interface DemoInputField {
  name: string
  label: string
  component: 'input' | 'textarea'
  placeholder: string
  defaultValue: string
}

export interface DemoMeta {
  id: string
  title: string
  description: string
  learningGoal: string
  category: string
  tags: string[]
  coverImageUrl?: string
  coverAlt?: string
  routePath: string
  apiNamespace: string
  displayMode: DemoDisplayMode
  ownerPackage: string
  supportsStreaming: boolean
  inputFields: DemoInputField[]
  rolePresets?: string[]
  reportTypePresets?: string[]
  sourceUrl?: string
  docsUrl?: string
  draftUrl?: string
  knownLimits: string[]
}

export interface DemoListItem {
  id: string
  title: string
  description: string
  learningGoal: string
  category: string
  tags: string[]
  coverImageUrl?: string
  coverAlt?: string
  routePath: string
  apiNamespace: string
  displayMode: DemoDisplayMode
  ownerPackage: string
  supportsStreaming: boolean
  rolePresets?: string[]
  reportTypePresets?: string[]
  sourceUrl?: string
  knownLimits: string[]
}

export interface DemoListResponse {
  items: DemoListItem[]
}

export interface DemoRunResponse {
  demoId: string
  status: DemoRunStatus
  output: string
}

export type DemoStreamEvent =
  | {
      event: 'meta'
      data: {
        demoId: string
        status: 'started'
      }
    }
  | {
      event: 'token'
      data: {
        text: string
      }
    }
  | {
      event: 'done'
      data: {
        status: 'success'
      }
    }
  | {
      event: 'error'
      data: {
        status: 'error'
        message: string
      }
    }
