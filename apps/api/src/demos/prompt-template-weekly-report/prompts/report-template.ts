export const REPORT_PROMPT = `
你是一名{role}，需要根据以下数据生成一份专业的 Markdown 文档。

【角色视角】{rolePerspective}

报告类型：{reportType}
{authorName}
{companyName}{teamName}{managerName}时间范围：{dateRange}

{teamGoal}

活动数据：
{devActivities}
{fewShotExample}
请生成一份格式规范的【{reportType}】，要求：
- 开头有简短的整体 summary（两三句话）
- {reportTypeGuide}
- 语气和视角贴合 {role} 的身份定位
- 适合作为给老板和团队传阅的专业文档
`.trim()
