import { computed, shallowRef } from 'vue'
import type { DemoListItem, DemoListResponse } from '@ai-journey-land/shared'

export function useDemoCatalog() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => config.public.apiBase)
  const demos = shallowRef<DemoListItem[]>([])
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')

  async function loadCatalog() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await $fetch<DemoListResponse>(`${apiBase.value}/demos`)
      demos.value = response.items
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Demo 列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return {
    demos,
    isLoading,
    errorMessage,
    loadCatalog,
  }
}
