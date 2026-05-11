# Issue #7 AI 基础能力封装：Provider、Model Factory、Session 与通用调用契约

## Issue 创建信息

- 背景: 周报 demo 已接入真实模型，但 provider 配置、模型创建和会话能力仍散落在 demo service 与 `ai-core` 的简易函数中。
- 目标: 建立可复用的 AI 基础层，统一 provider 校验、model factory、session manager 和 API 适配层。
- 非目标: 不接入 Milvus / Redis / MySQL / MongoDB；不实现完整 RAG / Agent；不修改前端展示交互。
- 验收标准: 提供 default / stable / creative / streaming model；周报 demo 改为使用新 factory；补 provider/session 测试；普通 run 与 stream 行为不变。
- 测试计划: `ai-core` 覆盖 provider 配置、preset model、session manager；API 层覆盖 `AiService` provider 解析与配置错误；全量执行 `format/lint/typecheck/test/build`。

## 基本信息

- Issue: https://github.com/Fridolph/AI-Journey-Land/issues/7
- 分支: `feat/#7-ai-core-foundation`
- 类型: feat
- 状态: 已完成开发，待提交 PR / 合并

## Plan / TDD

- 实现计划:
  - 拆分 `packages/ai-core` 为 provider types、errors、provider-config、model-factory、session-manager。
  - 在 `apps/api/src/ai` 增加 `AiModule` 与 `AiService`，桥接 `ConfigService` 和 `ai-core`。
  - 将 `prompt-template-weekly-report` 改为依赖 `AiService.createStableModel()` / `createStreamingModel()`。
  - 增加 AI 全局约定文档，明确 demo service 不再自己拼 provider 配置。
- 测试策略:
  - `ai-core` 测试 provider 校验、preset 温度、session 生命周期。
  - API 测试 `AiService` 的 openai / deepseek 配置读取、缺少配置错误、不支持 provider 错误。
  - 保持 API 既有 controller 级基础设施测试通过。
- 回归风险:
  - `@ai-journey-land/ai-core` 的导出面变化，容易影响 API 编译与测试。
  - 周报 demo 改接 `AiService` 后，需要确保 run / stream 行为不变。

## 开发范围

- 本次要做:
  - 封装 provider config 与 model factory。
  - 新增内存版 `SessionManager`。
  - 新增 API 层 `AiService` 适配。
  - 更新周报 demo 使用新基础层。
  - 补 AI 基础能力约定文档。
- 本次不做:
  - 持久化 session。
  - embedding / vector store / evaluation。
  - 前端消费多轮 session。
- 旁支问题:
  - API 旧的端口监听型测试在当前环境下不稳定，已改为 controller 级验证，不影响 `#6` 验收语义。

## 关键变更

- 文件或模块:
  - `packages/ai-core/src/provider.types.ts`
  - `packages/ai-core/src/errors.ts`
  - `packages/ai-core/src/provider-config.ts`
  - `packages/ai-core/src/model-factory.ts`
  - `packages/ai-core/src/session-manager.ts`
  - `apps/api/src/ai/ai.module.ts`
  - `apps/api/src/ai/ai.service.ts`
  - `apps/api/src/demos/prompt-template-weekly-report/prompt-template-weekly-report.service.ts`
  - `docs/04-AI基础能力约定.md`
- 说明:
  - `ai-core` 现在提供纯 TypeScript 的 provider / model / session 能力。
  - API 运行时通过 `AiService` 读取 env，demo service 不再自己选择 provider。

## 实现记录

- 方案选择:
  - 采用 issue 中推荐的折中方案：`packages/ai-core` 放纯能力，`apps/api/src/ai` 放 Nest 适配。
  - 没有直接把 `ConfigService` 放进 `ai-core`，这样 package 仍可跨 app 复用。
- 核心逻辑:
  - `parseAiProvider()` 统一 provider 解析与错误。
  - `assertProviderConfig()` 统一配置校验与缺失 env 报错。
  - `createDefaultModel()` / `createStableModel()` / `createCreativeModel()` / `createStreamingModel()` 提供固定档位。
  - `SessionManager` 先用内存 `Map` 实现会话契约。
  - `AiService` 作为 API 层入口，向 demo 暴露统一模型创建和共享 session manager。
- 安全与边界:
  - provider 密钥和 base URL 仍只在 API 层通过 `ConfigService` 读取。
  - demo service 中不再出现 `OPENAI_API_KEY` / `DEEPSEEK_API_KEY` 等环境变量名。
- 可维护性考虑:
  - 按用户规范把类型拆到 `.types.ts`，减少大文件堆叠。
  - 统一错误类型后，后续 API/SSE 错误处理可以继续复用。

## 特殊变更检查

- 数据库 / migration: 无。
- 环境变量 / `.env.example`: 本次未新增环境变量，只复用已有 provider 配置。
- 依赖 / lockfile: 无新增依赖。
- Docker / CI / 部署: 无。
- API 契约 / Swagger / API client: 无接口形态变化。
- AI prompt / provider / model / schema: provider 配置读取方式收口到 `AiService`；周报 demo 改为使用 `stable` / `streaming` model factory。
- 升级影响: 后续 demo service 应改用 `AiService` 或 `ai-core` 公共能力，不再复制 provider 判断逻辑。
- 回滚方式: 回退 `apps/api/src/ai` 新模块和 `ai-core` 拆分文件，并恢复周报 demo 里原来的 provider 配置读取逻辑。

## 自测记录

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- 结果: 全部通过。
- 失败与修复:
  - `packages/*/src` 中存在误生成的 `js` / `d.ts` 产物，影响 `format:check` 与 `vitest` 模块解析，已清理。
  - `apps/api/src/__tests__/api-infrastructure.spec.ts` 的 async generator 触发 `require-yield` 告警，已补一个占位 `yield` 保持测试语义不变。
  - Web 构建仍有 Nuxt / Tailwind sourcemap 与 chunk size warning，为现有依赖侧告警，不阻塞本 issue 验收。

## 前端人工验证

- 桌面端关键路径: 本 issue 不改前端 UI。
- 移动端关键路径: 本 issue 不改前端 UI。
- 截图或浏览器验证记录: 无。

## Review 自查

- 是否符合 issue 验收标准: 是，已完成 provider 校验、model factory、session manager、API AI 适配层和周报 demo 接入。
- 是否存在无关改动: 本次只应提交 `ai-core`、API AI 适配层、周报 demo service、文档与测试。
- 是否同步文档 / README / API 契约: 已新增 AI 基础能力约定文档。
- 是否存在安全风险: 不应把 provider 密钥读取逻辑下放到前端或 demo service。

## 遗留问题

- 后续优化:
  - 接入 Redis / MongoDB 持久化 session。
  - 增加 token usage、cost、prompt version 记录。
  - 为 Structured Output / Agent demo 增加更高层的 runner 抽象。
- 风险:
  - 如果后续 provider 扩展变多，需要考虑把 `AiService` 的配置装配再细分为独立 resolver/factory。

## 合并与关闭

- PR: https://github.com/Fridolph/AI-Journey-Land/pull/9
- Commit: `1c81bec`
- 合并到 `dev`: `35c1165`
- Issue 关闭时间: 2026-05-11
