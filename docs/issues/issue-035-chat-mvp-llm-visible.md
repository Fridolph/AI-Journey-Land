# Issue #35 开发日志：Chat MVP Prompt 可见

## Issue 创建信息

- 背景: `#34` 已跑通最小握手链路，下一步要打开 `chat-mvp` 最核心的 AI 黑盒，验证模型实际收到了什么、回了什么。
- 目标: 在 `chat-mvp` 实验线上接入真实 LLM，并把完整 Prompt / messages 与原始响应显性打印出来。
- 非目标:
  - 不做 SSE
  - 不做多轮上下文
  - 不做复杂 Prompt 工程
  - 不做历史会话管理
- 验收标准:
  - 后端 terminal 能看到完整 `messages`
  - 后端 terminal 能看到原始 `AIMessage` 响应对象
  - 前端页面能看到最终文本结果
  - 前端不暴露任何 provider 配置或 API key
- 测试计划:
  - `pnpm typecheck`
  - `pnpm test`
  - 至少发送两条不同消息完成人工验证

## 基本信息

- Issue: <https://github.com/Fridolph/AI-Journey-Land/issues/35>
- 分支: `feat/#35-chat-mvp-llm-visible`
- 类型: `feat`
- 状态: review-ready

## Plan / TDD

- 实现计划:
  - 在 `ChatMvpModule` 接入 `AiModule`
  - `ChatMvpService` 使用 `AiService.createStableModel()` 调用真实模型
  - 调用前打印完整 `messages`
  - 调用后打印原始 `AIMessage` 响应
  - 前端继续只展示一次性文本结果
- 测试策略:
  - 更新 controller 单测，改为 mock service 异步返回
  - 新增 service 单测，验证 LLM 调用、日志与文本解析
  - 浏览器手动验证两条不同消息
- 回归风险:
  - 当前仍保持 `chat-mvp` 独立，不侵入现有 `/chat` 与 `demos/chat`

## 开发范围

- 本次要做:
  - `apps/api/src/chat-mvp/` 接入真实 LLM
  - 页面文案更新为 Prompt 可见实验线
  - 补 service / controller 单测
- 本次不做:
  - SSE
  - 历史消息
  - Chat UI 扩展
  - provider 配置改造
- 旁支问题:
  - Nuxt 开发态仍有既有 `<NuxtLayout />` warning，与本 issue 无关
  - Playwright 过程中出现过一次 Vite dev server optimize 504，刷新后不影响本轮验证

## 关键变更

- `apps/api/src/chat-mvp/chat-mvp.module.ts`
  - 引入 `AiModule`
- `apps/api/src/chat-mvp/chat-mvp.service.ts`
  - 构造 `SystemMessage + HumanMessage`
  - 打印序列化后的 `messages`
  - 调用 `createStableModel().invoke(messages)`
  - 打印原始 `AIMessage` 与最终 response payload
- `apps/api/src/chat-mvp/chat-mvp.controller.ts`
  - 改为异步 controller
- `apps/api/src/chat-mvp/__tests__/chat-mvp.controller.test.ts`
  - 改为 mock 异步 service
- `apps/api/src/chat-mvp/__tests__/chat-mvp.service.test.ts`
  - 新增 service 级行为测试
- `apps/web/app/pages/chat-mvp.vue`
  - 页面文案从“握手实验线”更新为“Prompt 可见实验线”

## 实现记录

- 方案选择:
  - 不复用 `ai-chat` 端点，也不切到 AI SDK 路线
  - 直接在 `chat-mvp` 的最小 controller/service 上接 `AiService`
  - 这样最符合 `#35` 的学习目标：只看 Prompt 与原始响应
- 核心逻辑:
  - 用户输入 message
  - 后端创建 `SystemMessage` + `HumanMessage`
  - 在调用前打印 `serializeMessages(messages)`
  - 调用稳定模型 `invoke`
  - 打印原始 `AIMessage`
  - 用 `stringifyAiContent` 提取最终文本并返回前端
- 安全与边界:
  - API key 仍只保留在后端 `.env`
  - 前端只收到统一 API 响应，不含 provider 配置或密钥
- 可维护性考虑:
  - Prompt 序列化逻辑留在 service 内部，便于后续 `#36` / `#37` 继续演进

## 特殊变更检查

- 数据库 / migration: 无
- 环境变量 / `.env.example`: 无
- 依赖 / lockfile: 无
- Docker / CI / 部署: 无
- API 契约 / Swagger / API client: 路由未变，响应内容从固定字符串切为真实 LLM 结果
- AI prompt / provider / model / schema:
  - 使用当前后端 `.env` 中的 provider 配置
  - 默认跑在 `deepseek-v4-flash`
- 升级影响: `chat-mvp` 从假数据握手升级为真实 LLM 调用
- 回滚方式: 回退 `chat-mvp.service.ts` 到固定 `pong` 响应即可

## 自测记录

```bash
pnpm typecheck
pnpm test
```

- 结果: 通过
- 说明:
  - 运行环境仍是 Node `v25.6.0`，仓库期望 `22.18.0`，只产生 engine warning

## 前端人工验证

- 桌面端关键路径:
  - 使用真实 provider 发送消息“你好，请用一句话介绍你自己”
  - 页面显示模型最终回复
  - console 打印 request / response payload
- 移动端关键路径:
  - 在 `390 x 844` 下发送消息“请把‘前端联调’解释成一句适合新手理解的话”
  - 页面正确显示最终文本与 echoed message
- 后端关键验证:
  - terminal 可见完整 `messages`
  - terminal 可见原始 `AIMessage` 响应对象及 token/usage 元信息
- 敏感信息检查:
  - 前端 console 只看到统一 API 响应与业务文本
  - 未看到 provider 配置或 API key

## Review 自查

- 是否符合 issue 验收标准: 是
- 是否存在无关改动: 无
- 是否同步文档 / README / API 契约: 已补 `docs/issues/issue-035-chat-mvp-llm-visible.md`
- 是否存在安全风险: 未发现新增安全风险

## 遗留问题

- 后续优化:
  - `#36` 改造为 SSE，继续打开“回答怎么回来”的黑盒
  - 若后续需要，可在页面增加 Prompt/Response 调试面板，但不属于本轮
- 风险:
  - 当前前端页面仍沿用 `#34` 的极简壳，主要服务验证，不代表最终产品形态

## 合并与关闭

- PR: 本地 issue 分支合并到 `dev`
- Commit: 待提交
- 合并到 `dev`: 待合并
- Issue 关闭时间: 待回写后关闭
