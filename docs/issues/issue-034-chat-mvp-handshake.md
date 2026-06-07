# Issue #34 开发日志：Chat MVP 第一段握手可见

## Issue 创建信息

- 背景: 当前仓库已经有多条 chat 实验线，但 `Dao Chat MVP` 需要一条隔离的最小实验线，先验证 `web -> api` 的第一段数据流。
- 目标: 新增 `chat-mvp` 最小握手接口与极简页面，让请求与响应在前端 console 和后端 terminal 同时可见。
- 非目标:
  - 不接入 LLM
  - 不实现 SSE
  - 不实现多轮上下文
  - 不复用现有复杂 chat 页面
- 验收标准:
  - 页面输入消息后能拿到 `/api/chat-mvp` 返回
  - 前端 console 能看到请求与响应
  - 后端 terminal 能看到请求与响应 payload
- 测试计划:
  - `pnpm typecheck`
  - `pnpm test`
  - 桌面端 / 移动端关键路径人工验证

## 基本信息

- Issue: <https://github.com/Fridolph/AI-Journey-Land/issues/34>
- 分支: `feat/#34-chat-mvp-handshake`
- 类型: `feat`
- 状态: review-ready

## Plan / TDD

- 实现计划:
  - 在 `apps/api` 新增隔离的 `ChatMvpModule`
  - 提供 `POST /api/chat-mvp`，只接收 `message` 并返回固定握手文案
  - 在 `apps/web` 新增极简 `/chat-mvp` 页面
  - 保留前端 console 与后端 terminal 日志
- 测试策略:
  - 新增 controller 级单测，验证响应与日志调用
  - 保持全仓 `typecheck` / `test` 通过
  - 浏览器人工验证桌面端与移动端
- 回归风险:
  - 不侵入现有 `/chat` 与 `demos/chat`
  - 仅在 `AppModule` 注册独立 `ChatMvpModule`

## 开发范围

- 本次要做:
  - `apps/api/src/chat-mvp/` 最小模块
  - `apps/web/app/pages/chat-mvp.vue` 极简握手页面
  - 最小后端单测
- 本次不做:
  - LLM 接入
  - SSE 改造
  - 上下文管理
  - catalog 接入
- 旁支问题:
  - 本地 `5044` 端口曾被旧 API 进程占用，人工验证前已切换为当前分支进程

## 关键变更

- `apps/api/src/chat-mvp/chat-mvp.controller.ts`
  - 新增公开 `POST /api/chat-mvp`
  - 打印请求 payload
- `apps/api/src/chat-mvp/chat-mvp.service.ts`
  - 返回固定握手结果并打印响应 payload
- `apps/api/src/chat-mvp/dto/chat-mvp.dto.ts`
  - 使用 Zod DTO 约束 `message`
- `apps/api/src/chat-mvp/__tests__/chat-mvp.controller.test.ts`
  - 验证响应内容与日志调用
- `apps/api/src/app.module.ts`
  - 注册 `ChatMvpModule`
- `apps/web/app/pages/chat-mvp.vue`
  - 新增极简输入、发送、结果展示页面
  - 前端打印 request / response 日志

## 实现记录

- 方案选择:
  - 不复用现有 `/chat` 页面，也不挂进 `demos` 体系
  - 单独做 `chat-mvp`，保证 `#34` 的可见性实验线边界清晰
- 核心逻辑:
  - 用户输入消息
  - 前端调用 `POST /api/chat-mvp`
  - 后端记录请求并返回 `pong: <message>`
  - 前端记录响应并渲染结果
- 安全与边界:
  - 未接入任何 AI provider
  - 不暴露密钥
  - 不引入数据库状态
- 可维护性考虑:
  - DTO、module、controller、service 按 NestJS 结构拆开
  - 前端单页极简实现，后续可作为 `#35` 的演进起点

## 特殊变更检查

- 数据库 / migration: 无
- 环境变量 / `.env.example`: 无
- 依赖 / lockfile: 无
- Docker / CI / 部署: 无
- API 契约 / Swagger / API client: 新增 `POST /api/chat-mvp`
- AI prompt / provider / model / schema: 无
- 升级影响: 仅新增实验接口与页面，无破坏性影响
- 回滚方式: 删除 `chat-mvp` 模块、页面与注册代码即可

## 自测记录

```bash
pnpm typecheck
pnpm test
```

- 结果: 通过
- 说明:
  - 执行环境 Node 为 `v25.6.0`，仓库声明期望 `22.18.0`，本轮仅出现 engine warning，不影响通过

## 前端人工验证

- 桌面端关键路径:
  - 访问 `http://localhost:5033/chat-mvp`
  - 输入“你好，先和我握个手”
  - 页面展示 `pong: 你好，先和我握个手`
  - 浏览器 console 可见 request / response payload
  - 后端 terminal 可见 request / response payload
- 移动端关键路径:
  - 切换到 `390 x 844`
  - 输入框、发送按钮、结果区可正常展示与交互
- 截图或浏览器验证记录:
  - 已使用 Playwright 完成桌面端与移动端验证

## Review 自查

- 是否符合 issue 验收标准: 是
- 是否存在无关改动: 无
- 是否同步文档 / README / API 契约: 已补 `docs/issues/issue-034-chat-mvp-handshake.md`
- 是否存在安全风险: 未发现新增安全风险

## 遗留问题

- 后续优化:
  - `#35` 接入真实 LLM 并打印完整 Prompt / 原始响应
  - 若后续继续保留 `chat-mvp` 页面，可考虑补入口链接
- 风险:
  - 当前页面仍会看到 Nuxt 关于 `<NuxtLayout />` 的既有 warning，与本 issue 无关

## 合并与关闭

- PR: 本地 issue 分支合并到 `dev`
- Commit:
  - `842c1b2` `feat(#34): 新增 chat-mvp 握手实验线`
- 合并到 `dev`: 待合并
- Issue 关闭时间: 待回写后关闭
