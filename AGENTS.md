# AGENTS 协作规范

## 1. 项目定位

AI-Journey-Land 是 AI 学习成果的工程化展示平台。

它不是 AI-Journey-Fighting 的替代品，而是它的下一层：

- `AI-Journey-Fighting`：学习、实验、踩坑、草稿、知识沉淀
- `AI-Journey-Land`：二次验证、抽象封装、接口化、页面化、展示平台

协作时要始终保持这个边界，不要把两个仓库混成同一种职责。

## 2. 当前阶段

当前处于项目初始化与架构设计阶段。

优先级从高到低：

1. 明确项目目标、边界和目录结构
2. 搭建最小 monorepo
3. 创建 NestJS 后端和前端展示应用
4. 抽出统一 AI 调用能力
5. 接入第一个可交互 demo
6. 再逐步接入更多 demo

## 3. 工程原则

### 保持来源可追溯

从 AI-Journey-Fighting 迁移或重构 demo 时，要保留来源链接：

- 原始示例源码
- 学习草稿
- VitePress 正式文档
- 相关阶段总结

不要只留下重构后的代码，而丢失学习上下文。

### 不直接复制成混乱平台

Land 不是把 `examples/` 批量搬过来。

每个 demo 进入 Land 前，都应该做一层工程化整理：

- 明确输入
- 明确输出
- 明确运行方式
- 明确 UI 展示方式
- 明确是否支持 streaming
- 明确是否需要工具调用、记忆、RAG 或结构化输出

### 后端优先保护密钥

API Key、模型配置、数据库连接等敏感信息只能放在后端环境变量中。

禁止：

- 把密钥写进源码
- 把密钥暴露给前端
- 把 `.env` 提交到仓库

可以提供 `.env.example` 说明必要变量。

## 4. 推荐目录约定

```text
apps/
  api/                 # NestJS 后端
  web/                 # 前端展示平台

packages/
  ai-core/             # 模型调用与 provider adapter
  demo-registry/       # demo 元信息与路由注册
  shared/              # 共享类型、DTO、schema

docs/
  00-项目上下文.md
  01-AI演示平台架构设计.md
  02-工程化约定.md
  03-测试规范.md
  issues/             # GitHub issue 开发日志
  demos/              # demo 三件套复盘文档
```

后续如果目录调整，需要同步更新 README 和 docs。

## 5. Demo 接入规范

每接入一个 demo，建议至少包含：

1. demo id
2. 中文名称
3. 学习目标
4. 输入 schema
5. 输出 schema
6. 是否支持流式输出
7. 后端 service
8. 前端展示组件
9. 来源链接
10. 已知限制

初期不要追求复杂，先保证每个 demo 都能稳定运行、能解释、能展示。

## 6. 文档规范

- 文档以中文为主
- 文件名优先使用中文，便于后续整理
- 架构变化要写进 `docs/`
- 重要工程决策要留下背景、取舍和结论
- 不只写“怎么做”，也写“为什么这样做”

## 7. 协作要求

- 修改前先看现有目录和 README
- 不做与当前阶段无关的大规模重构
- 保持每次提交边界清晰
- 如果涉及 Fighting 与 Land 的职责边界，优先在文档中说明
- 对 demo 的工程化改造，要尊重原始学习路径，不丢上下文
- 每次改动后运行 `pnpm typecheck && pnpm test` 确保通过
- 新增/修改功能必须同步补充单元测试
- 新增 demo 必须补充三件套文档（总览、前端复盘、后端与AI复盘）
- 提交格式遵循 `docs/02-工程化约定.md` 中的 Commit 格式规范

## 8. GitHub Issue 开发流程

每个 issue 都按完整工程流程推进，避免在 `dev` 或 `main` 上直接堆改动。

### 开始前

1. 先有 issue，再开发；issue 至少写清背景、目标、非目标、验收标准和测试计划。
2. 查看 issue 描述，确认本次开发范围、验收标准和需要增删改的文件。
3. 进入实现前先拆 Plan / TDD，尤其关注 API、数据库、跨端契约、AI prompt、SSE、鉴权等容易回归的区域。
4. 检查工作区状态，确认不会覆盖用户或其他协作者的未提交改动。
5. 从最新 `dev` 分支切出 issue 分支：`feat/#<issue>-<short-desc>`、`fix/#<issue>-<short-desc>` 或 `docs/#<issue>-<short-desc>`。
6. API server 按 NestJS 最佳实践组织 module、controller、service、provider；前端按当前框架规范组织页面、组件、composable 和类型。

### 开发中

- 单个文件超过 3 个类型定义时，拆到同目录 `.types.ts` 文件。
- 类型字段、对外方法、API 方法必须添加标准 TSDoc；核心业务逻辑使用必要的 `//` 注释说明意图。
- 遵循 SOLID，单文件尽量不超过 500 行，超过时按职责拆分。
- 不做过度抽象和过早优化；同类逻辑出现 3 处以上重复，再提取公共能力。
- 可维护性和安全性优先，使用常见 API 和清晰的面向对象/函数式写法，避免生僻语法。
- 测试文件按 DDD 边界写入对应模块的 `__tests__` 目录；测试要验证真实行为，不写无意义模板测试，不用硬编码凑通过。
- 发现旁支问题时新建 issue，不混入当前 issue；除非它阻塞当前验收。
- 涉及数据库、环境变量、依赖、Docker、CI、API 契约或 AI prompt 时，记录升级影响和回滚方式。

### 完成后

1. Review 自查：是否符合 issue、是否有无关改动、是否需要同步文档、API client、Swagger/OpenAPI、README 或 `.env.example`。
2. 先自测，至少运行 `pnpm typecheck && pnpm test`；涉及 lint、格式或构建时同步运行对应脚本。
3. 涉及 UI 时，至少记录桌面端和移动端关键路径验证；必要时附截图或浏览器验证记录。
4. 自测通过后，在 `docs/issues/` 下按 issue 号补充开发日志。
5. 按规范提交 commit，并推送 issue 分支。
6. 创建 PR 或按团队约定合并回 `dev`，确保 issue、PR、commit 和开发日志互相可追溯。
7. 合并到 `dev` 后填写 issue 相关开发信息，确认验收后关闭 issue。

发布分支边界：issue 不从 `main` 开发，不直接合到 `main`；`main` 只接受稳定发布合并。
