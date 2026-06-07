# AGENTS 协作规范

## 1. 项目定位

AI-Journey-Land 是 AI 学习成果的工程化展示平台。

它不是 AI-Journey-Fighting 的替代品，而是它的下一层：

- `AI-Journey-Fighting`：学习、实验、踩坑、草稿、知识沉淀
- `AI-Journey-Land`：二次验证、抽象封装、接口化、页面化、展示平台

协作时要始终保持这个边界，不要把两个仓库混成同一种职责。

## 2. 当前阶段

当前已从“项目初始化与架构设计”进入“平台能力验证 + Dao 实验线接入”阶段。

优先级从高到低：

1. 用 `Dao-is-Coding` 建立里程碑 → Issue → 分支 → 开发 → 收口的稳定节奏
2. 从最小可验证 demo 开始，优先验证 `web -> api -> LLM -> response` 完整数据流
3. 保持 Demo Hub、Admin、AI Chat 等实验线边界清晰，避免混成一条大杂烩主线
4. 在真实开发中沉淀可复用的 AI 调用能力、共享 schema、会话与流式协议
5. 每个 demo 都保证来源可追溯、运行可解释、验收可见

当前默认守则：

- 主线重于扩展
- 决策可见优先于功能完整
- 交接重于热闹
- 验证重于堆功能

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

### 7.1 Dao-is-Coding 进入方式

后续开发默认使用 `Dao-is-Coding` 指导推进，但只接入当前项目真正需要的最小骨架，不机械复制母仓全文。

最小对应关系如下：

- `L1`：本轮最重要的根意图。先回答“做完这一轮，什么感知会从模糊变清晰”。
- `L2`：当前阶段最重要的指导原则。它不是静态表，而是随阶段变化的当下树干。
- `L3`：语义锚点。Issue、开发日志、commit message、milestone 收口都要能说明“系统变成了什么”。
- `L4`：现场流转。负责状态、交接、不断棒，而不是替代实现。

当前 chat / demo 实验线默认 `L2`：

> 决策可见优先于功能完整。

这意味着：

- 优先把数据流、Prompt、SSE chunk、上下文组装过程看清楚
- 不为了“更像成品”而提前引入复杂 UI、数据库、RAG、工具调用
- 能拆成 4 个小 issue 的，不做成 1 个大需求

### 7.2 L4 最小状态机

每个 issue / 子任务默认按以下状态流转：

```text
planned
-> designed
-> in-progress
-> self-tested
-> review-ready
-> done
```

旁路状态：

```text
blocked
```

最小交接包固定为 6 项：

```text
目标 / 状态 / 下一步 / 自测 / 文档锚点 / Dao Commit 候选标题
```

## 8. GitHub Issue 开发流程

后续默认按 `Dao-is-Coding` 的里程碑节奏推进：

```text
Milestone -> Issue -> Branch -> Plan/L2 过门 -> 实现 -> Review -> 自测 -> Issue 评论回写 -> 合并 -> 关闭 Issue
```

禁止跳过 issue 直接开发，禁止在 `dev` 或 `main` 上直接堆改动。

### 8.0 先有 Milestone，再拆 Issue

1. 每一轮较完整实验先创建 milestone，再把 milestone 拆成多个单一职责 issue。
2. milestone 必须写清：
   - 这轮 `L1` 根意图
   - 当前阶段 `L2` 原则
   - 本轮边界与非目标
   - milestone 验收标准
3. issue 之间若存在依赖关系，必须在 issue 描述中写清前置依赖，不做平铺功能清单。

### 开始前

1. 先有 issue，再开发；issue 至少写清背景、目标、非目标、依赖、改动范围、验收标准和测试计划。
2. 查看 issue 描述，确认本次开发范围、验收标准和需要增删改的文件。
3. 进入实现前先做最小 `L2` 过门判断：
   - 这轮真正要成什么
   - 这轮明确不做什么
   - 当前最大风险是什么
   - 用什么来验
4. 需要时补一次轻量“发蒙扫描”：
   - 涉及哪些工程原则
   - 有哪些安全、性能、业务风险
   - 哪些决策必须留下理由
5. 检查工作区状态，确认不会覆盖用户或其他协作者的未提交改动。
6. 从最新 `dev` 分支切出 issue 分支：`feat/#<issue>-<short-desc>`、`fix/#<issue>-<short-desc>`、`docs/#<issue>-<short-desc>`、`test/#<issue>-<short-desc>`。
7. API server 按 NestJS 最佳实践组织 module、controller、service、provider；前端按当前框架规范组织页面、组件、composable 和类型。

### 开发中

- 单个文件超过 3 个类型定义时，拆到同目录 `.types.ts` 文件。
- 类型字段、对外方法、API 方法必须添加标准 TSDoc；核心业务逻辑使用必要的 `//` 注释说明意图。
- 遵循 SOLID，单文件尽量不超过 500 行，超过时按职责拆分。
- 不做过度抽象和过早优化；同类逻辑出现 3 处以上重复，再提取公共能力。
- 可维护性和安全性优先，使用常见 API 和清晰的面向对象/函数式写法，避免生僻语法。
- 测试文件按 DDD 边界写入对应模块的 `__tests__` 目录；测试要验证真实行为，不写无意义模板测试，不用硬编码凑通过。
- 发现旁支问题时新建 issue，不混入当前 issue；除非它阻塞当前验收。
- 涉及数据库、环境变量、依赖、Docker、CI、API 契约或 AI prompt 时，记录升级影响和回滚方式。
- 若发现一个 issue 已经跨出当前 `L2` 边界，必须先停下拆 issue，而不是继续硬做。

### 完成后

1. Review 自查：是否符合 issue、是否有无关改动、是否需要同步文档、API client、Swagger/OpenAPI、README 或 `.env.example`。
2. 先自测，至少运行 `pnpm typecheck && pnpm test`；涉及 lint、格式或构建时同步运行对应脚本。
3. 涉及 UI 时，至少记录桌面端和移动端关键路径验证；必要时附截图或浏览器验证记录。
4. 自测通过后，在 `docs/issues/` 下按 issue 号补充开发日志。
   - 文件名：`issue-<编号>-<简短描述>.md`
   - 内容：开发目标、过程、踩坑记录、自测结果
5. 在 GitHub issue 中评论回写：
   - 实际改动摘要
   - 自测与人工验证结果
   - 相关 commit / PR / 开发日志路径
   - 遗留风险或后续 issue
6. 按规范提交 commit，并推送 issue 分支。
7. 合并回 `dev`，确保 issue、commit 和开发日志互相可追溯。
8. 确认评论回写完成后，再关闭 issue。

### Milestone 发布流程

当一个 milestone 下的 issue 全部完成并验收通过后，按以下顺序发布：

```bash
# 1. 确认 milestone 下所有 issue 已评论回写并关闭

# 2. 自测确认全部通过
pnpm typecheck && pnpm test

# 3. 使用 dao-commit 起草并执行 squash merge
git checkout main
git merge --squash dev
git commit -m "[卦象][卦名] type(scope): subject ..."   # dao-commit 草案
git push origin main

# 4. 对齐 dev 到 main，继续开发
git checkout dev
git reset --hard main
git push origin dev --force
```

发布分支边界：issue 不从 `main` 开发，不直接合到 `main`；`main` 只接受稳定发布合并。

发布前提醒：

- `Dao Commit` 用于 milestone 收口，不用于 issue 日常小步提交
- squash merge 前先用 `dao-commit` skill 起草候选标题，由人定锚
- 合并到 `main` 后，再切回 `dev` 继续下一轮

## 9. Dao Commit 提交规范

**Dao Commit 不是每次提交都用**。日常 issue 内的小步提交仍用 conventional commit 格式（`feat(#1): xxx`）。只有在以下时刻启用 Dao Commit：

- Milestone 完成，阶段性收口
- Squash merge `dev` → `main`（发布）
- 系统发生本质变化（架构切换、方向调整）

### 起草顺序

```
❶ 辨真实变化 → ❷ 写 subject → ❸ 定 scope → ❹ 选 type → ❺ 推卦象 → ❻ 补 body/footer
```

禁止倒过来——先卦象后 subject 会让 commit 变成解释文，失去锚点价值。

### 格式

```
[卦象][卦名] type(scope): subject

背景：
判断：
停点：

Refs: #issue
#沉淀 ... → ...
```

### 核心要求

- **subject** 写"这一轮到底把什么往哪推了一步"，不写"做了什么"
- **scope** 写变化落在谁身上，不写碰了哪些目录
- **type** 从 `feat | fix | refactor | docs | test | chore` 中选，只保句法兼容
- **卦象** 提供 1-2 个候选，由人定锚（AI 不直接给唯一答案）

详细规则见 `dao-commit` skill。
