import { computed, shallowRef } from 'vue'
import type { ApiResponse, DemoCatalogGroup, DemoListItem, DemoListResponse } from '@ai-journey-land/shared'

export function useDemoCatalog() {
  const config = useRuntimeConfig()
  const apiBase = computed(() => config.public.apiBase)
  const demos = shallowRef<DemoListItem[]>([])
  const groups = shallowRef<DemoCatalogGroup[]>([])
  const isLoading = shallowRef(true)
  const errorMessage = shallowRef('')

  async function loadCatalog() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await $fetch<ApiResponse<DemoListResponse>>(`${apiBase.value}/demos`)
      const data = response.data as Record<string, unknown> | null
      demos.value = (data?.items as DemoListItem[]) ?? []
      groups.value = (data?.groups as DemoCatalogGroup[]) ?? []
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Demo 列表加载失败'
    } finally {
      isLoading.value = false
    }
  }

  return { demos, groups, isLoading, errorMessage, loadCatalog }
}
