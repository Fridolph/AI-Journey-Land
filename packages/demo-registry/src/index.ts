import type { DemoListItem, DemoMeta } from '@ai-journey-land/shared'
import { promptTemplateWeeklyReportDemo, DEFAULT_PROMPT } from './demos/prompt-template-weekly-report'
import { chatDemo } from './demos/chat'

export const demos: DemoMeta[] = [promptTemplateWeeklyReportDemo, chatDemo]

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
      rolePresets,
      reportTypePresets,
      sourceFiles,
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
      rolePresets,
      reportTypePresets,
      sourceFiles,
      sourceUrl,
      knownLimits,
    }),
  )
}

export function getDemoById(id: string): DemoMeta | undefined {
  return demos.find((demo) => demo.id === id)
}

export { promptTemplateWeeklyReportDemo, DEFAULT_PROMPT }
export { chatDemo }
