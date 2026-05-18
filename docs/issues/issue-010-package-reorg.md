# Issue #10 开发日志

## Issue 信息

- **标题**：整理 packages 分层：shared、demo-registry 跨包职责混乱
- **分支**：feat/#10-package-reorg
- **PR**：https://github.com/Fridolph/AI-Journey-Land/pull/11

## 开发范围

| 包 | 变更 |
|---|---|
| `packages/shared` | 移除 `promptTemplateWeeklyReportInputSchema`、`sourceCode`/`sourceLanguage` |
| `packages/demo-registry` | 移除 142 行 sourceCode 内联字符串 |
| `apps/api` | 新增 demo 专属 schema + 测试 |
| `apps/web` | 新增本地 demo-sources 数据文件，页面改用本地数据 |

## 非目标

- 不改变 ai-core 包结构
- 不改变前端展示逻辑
- 不改变 API 响应结构

## 关键决策

1. **schema 归属**：demo 专属 Zod schema 应跟 demo service 走（`apps/api/src/demos/<id>/`），不应放在声称共享的 `packages/shared`
2. **sourceCode 归属**：源码展示数据是前端关注点，从 `demo-registry` 迁入 `apps/web/app/data/`，registry 保持纯元信息注册
3. **DemoMeta 类型清理**：移除 `sourceCode`/`sourceLanguage` 字段，API 响应不再包含这些展示数据

## 自测结果

- `pnpm typecheck`: 8/8 ✅
- `pnpm test`: 76 tests passed ✅
- `pnpm lint`: 0 errors ✅

## 遗留风险

- `promptTemplateWeeklyReportInputSchema` 虽已迁到 API 模块，但 demo service 实际使用的仍是 `demoRunRequestSchema`（泛用），后续可将校验升级为专属 schema
- 前端 `index.vue` 中 `DemoCatalogCard` 展示时无需 sourceCode，无影响

## 合并记录

- 2026-05-11：合并到 dev（00719fc）
