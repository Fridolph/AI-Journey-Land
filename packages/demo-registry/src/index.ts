import type { DemoListItem, DemoMeta } from '@ai-journey-land/shared'
import { promptTemplateWeeklyReportDemo } from './demos/prompt-template-weekly-report'

export const demos: DemoMeta[] = [promptTemplateWeeklyReportDemo]

export function listDemoItems(): DemoListItem[] {
  return demos.map(
    ({
      id,
      title,
      description,
      learningGoal,
      category,
      tags,
      coverImageUrl,
      coverAlt,
      routePath,
      apiNamespace,
      displayMode,
      ownerPackage,
      supportsStreaming,
      sourceUrl,
      knownLimits,
    }) => ({
      id,
      title,
      description,
      learningGoal,
      category,
      tags,
      coverImageUrl,
      coverAlt,
      routePath,
      apiNamespace,
      displayMode,
      ownerPackage,
      supportsStreaming,
      sourceUrl,
      knownLimits,
    }),
  )
}

export function getDemoById(id: string): DemoMeta | undefined {
  return demos.find((demo) => demo.id === id)
}

export { promptTemplateWeeklyReportDemo }
