import { computed, shallowRef } from 'vue'
import type { ApiResponse, DemoCatalogGroup } from '@ai-journey-land/shared'

export function useDemoCatalog() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => config.public.apiBase)
  const groups = shallowRef<DemoCatalogGroup[]>([])
  const isLoading = shallowRef(true)
  const errorMessage = shallowRef('')

  async function loadCatalog() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await $fetch<ApiResponse<DemoCatalogGroup[]>>(
        `${apiBase.value}/demos`,
      )
      groups.value = response.data ?? []
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Demo 列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return { groups, isLoading, errorMessage, loadCatalog }
}
