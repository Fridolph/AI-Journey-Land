export type DemoRunStatus = 'success' | 'error'
export type DemoDisplayMode = 'custom-page' | 'generic-runner'

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
  sourceUrl?: string
  sourceCode?: string
  sourceLanguage?: string
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
