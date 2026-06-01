import { defineStore } from 'pinia'

export interface PlanInfo {
  id: string
  label: string
  features: string[]
  maxContext: string
  maxSessions: string
}

export interface UserInfo {
  name: string
  email: string
  isLoggedIn: boolean
  currentPlan: string
  language: string
}

const MOCK_PLANS: Record<string, PlanInfo> = {
  free: {
    id: 'free',
    label: 'Free',
    features: ['基础对话', '1 个会话', '32K 上下文'],
    maxContext: '32K',
    maxSessions: '1',
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    features: ['无限对话', '100 个会话', '128K 上下文', 'Markdown/Mermaid 渲染', '自定义组件输出'],
    maxContext: '128K',
    maxSessions: '100',
  },
  max: {
    id: 'max',
    label: 'Max',
    features: ['无限对话', '无限会话', '1M 上下文', 'RAG 备忘录', '联网搜索', '全部高级功能'],
    maxContext: '1M',
    maxSessions: '无限',
  },
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      name: 'Fridolph',
      email: 'fridolph@ai-journey.dev',
      isLoggedIn: true,
      currentPlan: 'pro',
      language: 'zh-CN',
    } as UserInfo,

    isPlanDropdownOpen: false,
  }),

  getters: {
    currentPlanInfo: (state): PlanInfo => {
      return MOCK_PLANS[state.user.currentPlan] as PlanInfo
    },

    allPlans: (): PlanInfo[] => {
      return Object.values(MOCK_PLANS)
    },

    isLoggedIn: (state): boolean => {
      return state.user.isLoggedIn
    },
  },

  actions: {
    login() {
      this.user.isLoggedIn = true
    },

    logout() {
      this.user.isLoggedIn = false
    },

    switchPlan(planId: string) {
      if (planId in MOCK_PLANS) {
        this.user.currentPlan = planId
      }
    },

    setLanguage(lang: string) {
      this.user.language = lang
    },
  },
})
