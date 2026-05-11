# Issue #6 API 基础设施优化：统一响应、异常过滤与鉴权入口

## Issue 创建信息

- 背景: 当前 API 已跑通 demo catalog、普通运行和 SSE，但普通响应、异常响应和鉴权入口还缺少统一工程约定。
- 目标: 建立统一 JSON 响应结构、全局异常过滤、SSE 排除策略和最小鉴权入口。
- 非目标: 不实现完整登录、用户表、权限模型；不改变 SSE 事件协议；不引入 Swagger/API client。
- 验收标准: health、demos、unknown demo、run 错误、stream SSE 均满足 issue #6 中定义的响应行为。
- 测试计划: 覆盖 ResponseUtil、ResponseInterceptor、AllExceptionsFilter、JwtAuthGuard，以及 API 级 health/demos/not-found/SSE smoke test。

## 基本信息

- Issue: https://github.com/Fridolph/AI-Journey-Land/issues/6
- 分支: `feat/#6-api-infrastructure`
- 类型: feat
- 状态: 已自测，待提交 / PR / 合并

## Plan / TDD

- 实现计划:
  - 在 `apps/api/src/common` 建立 response DTO/types/util、response interceptor、all exceptions filter。
  - 在 `apps/api/src/auth` 建立 `@Public()`、`JwtAuthGuard`、`JwtStrategy` 和 `AuthModule`，先预留鉴权边界。
  - 在 `main.ts` 注册全局 interceptor/filter，在 health/demos controller 标记 public，在 SSE handler 标记跳过响应包装。
  - 为 Vitest 补充 `.spec.ts` include，新增 `__tests__` 覆盖核心基础设施。
- 测试策略:
  - 单元测试验证响应构建、重复包装保护、SSE skip、异常归一化、public guard。
  - API 级测试启动 Nest application，验证 `/api/health`、`/api/demos`、unknown demo 和 SSE content-type。
- 回归风险:
  - 普通 JSON 响应结构会变化，前端如果直接读取原始字段需要适配。
  - SSE 必须跳过 interceptor，否则会破坏 `text/event-stream`。

## 开发范围

- 本次要做:
  - 统一普通 JSON API 成 `{ code, message, data, timestamp, path }`。
  - 统一 HttpException、Unauthorized、unknown error 响应。
  - 预留鉴权入口，但不强制启用完整 JWT 校验。
  - 保持 SSE 事件协议不变。
- 本次不做:
  - 用户系统、登录接口、权限模型。
  - 数据库、Swagger、API client、前端适配。
- 旁支问题:
  - Vitest 环境下 Nest 构造器元数据注入不稳定，已在 API 关键构造器补显式 `@Inject(...)`，属于本次测试稳定性阻塞项。

## 关键变更

- 文件或模块:
  - `apps/api/src/common/dto/response.types.ts`
  - `apps/api/src/common/utils/response.util.ts`
  - `apps/api/src/common/interceptors/response.interceptor.ts`
  - `apps/api/src/common/filters/all-exceptions.filter.ts`
  - `apps/api/src/auth/*`
  - `apps/api/src/main.ts`
  - `apps/api/src/demos/demos.controller.ts`
  - `apps/api/src/health.controller.ts`
  - `apps/api/src/**/__tests__/*`
- 说明:
  - `ResponseInterceptor` 负责普通 JSON 成功响应包装。
  - `AllExceptionsFilter` 负责错误响应归一化和 unknown error stack 隐藏。
  - `SkipApiResponse` 保证 SSE 不被普通 JSON 响应包装。
  - `Public` 和 `JwtAuthGuard` 为后续 auth issue 留入口。

## 实现记录

- 方案选择:
  - 使用 Nest 全局 interceptor/filter，而不是在每个 controller 中手动包装，保证后续 demo 接口默认一致。
  - 鉴权入口不引入 `passport-jwt`，避免本 issue 越界到完整登录体系。
- 核心逻辑:
  - 普通成功响应统一由 `ResponseUtil.success()` 生成。
  - 已经符合标准结构的数据不会重复包装。
  - SSE handler 使用 `@SkipApiResponse()`，且 interceptor 额外通过 content-type 做兜底判断。
  - HttpException 保留业务 message；unknown error 只返回“服务器内部错误。”。
- 安全与边界:
  - 未知错误不向调用方泄露 stack。
  - API Key、AI provider 配置仍只在后端读取。
  - 当前 guard 只做入口预留，不承诺 token 真实性校验。
- 可维护性考虑:
  - 响应类型拆到 `.types.ts`，后续分页、错误详情、trace id 都可以在 common 层扩展。
  - 测试按 `__tests__` 目录组织，符合新的 issue 开发规范。

## 特殊变更检查

- 数据库 / migration: 无。
- 环境变量 / `.env.example`: 无。
- 依赖 / lockfile: 无新增依赖。
- Docker / CI / 部署: 无。
- API 契约 / Swagger / API client: 普通 JSON 响应结构变为统一 envelope；SSE 协议不变；当前没有 Swagger/API client 需要同步。
- AI prompt / provider / model / schema: 无。
- 升级影响: 前端后续读取普通 run/demos/health 响应时，需要从 `body.data` 读取业务数据。
- 回滚方式: 移除 `main.ts` 中的 `ResponseInterceptor` / `AllExceptionsFilter` 注册，并撤回 common/auth 新增文件即可恢复旧响应行为。

## 自测记录

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm --filter @ai-journey-land/api typecheck
pnpm --filter @ai-journey-land/api test
pnpm --filter @ai-journey-land/api build
```

- 结果: 已通过。
- 失败与修复:
  - 首轮测试发现 Vitest 环境下 Nest 构造器注入 metadata 不稳定，补充显式 `@Inject(...)` 后通过。
  - 首轮 lint 提示测试 mock 的 async generator 无 `yield`，补充流式片段后通过。
  - 首轮 format 提示测试文件格式不一致，运行 `oxfmt` 后通过。

## 前端人工验证

- 桌面端关键路径: 本 issue 不改前端 UI，暂不需要。
- 移动端关键路径: 本 issue 不改前端 UI，暂不需要。
- 截图或浏览器验证记录: 无。

## Review 自查

- 是否符合 issue 验收标准: 是。
- 是否存在无关改动: 本次 API 文件存在 Oxfmt 机械格式调整，均发生在相关 API/test 文件内。
- 是否同步文档 / README / API 契约: 已补 issue 开发日志；README 暂不需要。
- 是否存在安全风险: 未新增密钥暴露；unknown error 不向客户端暴露 stack。

## 遗留问题

- 后续优化:
  - #7 可继续封装 AI provider/session/model factory。
  - 后续 auth issue 可引入真实 JWT 校验、用户上下文和 RBAC。
  - 后续可增加 trace id/request id，方便 API 观测。
- 风险:
  - Web 当前若仍按旧响应读取，需要在后续前端适配中切换到 `data` envelope。

## 合并与关闭

- PR: 待创建。
- Commit: 待提交。
- 合并到 `dev`: 待完成。
- Issue 关闭时间: 待完成。
