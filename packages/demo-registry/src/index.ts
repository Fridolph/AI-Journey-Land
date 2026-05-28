import type { DemoCatalogGroup, DemoListItem, DemoMeta } from '@ai-journey-land/shared'
import { promptTemplateWeeklyReportDemo, DEFAULT_PROMPT } from './demos/prompt-template-weekly-report'
import { chatDemo } from './demos/chat'
import { memoryChatDemo } from './demos/memory-chat'
import { cardCrudDemo } from './demos/card-crud'

export const demos: DemoMeta[] = [promptTemplateWeeklyReportDemo, chatDemo, memoryChatDemo, cardCrudDemo]

export function listDemoItems(): DemoListItem[] {
  return demos.map(
    ({
      id, title, description, learningGoal, category, tags,
      coverImageUrl, coverAlt, routePath, apiNamespace,
      displayMode, ownerPackage, supportsStreaming,
      rolePresets, reportTypePresets, sourceFiles, sourceUrl, knownLimits,
    }) => ({
      id, title, description, learningGoal, category, tags,
      coverImageUrl, coverAlt, routePath, apiNamespace,
      displayMode, ownerPackage, supportsStreaming,
      rolePresets, reportTypePresets, sourceFiles, sourceUrl, knownLimits,
    }),
  )
}

export function listDemoCatalog(): DemoCatalogGroup[] {
  const items = demos.map(
    ({
      id, title, description, learningGoal, category, tags,
      coverImageUrl, coverAlt, routePath, apiNamespace,
      displayMode, ownerPackage, supportsStreaming,
      rolePresets, reportTypePresets, sourceUrl, knownLimits,
    }) => ({
      id, title, description, learningGoal, category, tags,
      coverImageUrl, coverAlt, routePath, apiNamespace,
      displayMode, ownerPackage, supportsStreaming,
      rolePresets, reportTypePresets, sourceUrl, knownLimits,
    }),
  )

  const map = new Map<string, DemoListItem[]>()
  for (const item of items) {
    const cat = item.category || '其他'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(item)
  }

  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
}

export function getDemoById(id: string): DemoMeta | undefined {
  return demos.find((demo) => demo.id === id)
}

export { promptTemplateWeeklyReportDemo, DEFAULT_PROMPT }
export { chatDemo }
export { memoryChatDemo }
export { cardCrudDemo }
