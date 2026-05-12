# AI-Journey-Land

AI-Journey-Land 是一个面向 AI Demo 工程化展示的平台仓库。

它和 [AI-Journey-Fighting](https://github.com/Fridolph/AI-Journey-Fighting) 的关系是：

- `AI-Journey-Fighting`：学习第一现场，保留原始 demo、踩坑记录、草稿和文档沉淀
- `AI-Journey-Land`：二次验证与工程化平台，把成熟 demo 包装成可交互、可展示、可复用的应用

换句话说，Fighting 负责“学会”，Land 负责“做稳、做顺、做成一个能展示的系统”。

## 项目目标

当前 AI 学习 demo 多数仍停留在本地脚本阶段，常见问题是：

- 每个 demo 都重复初始化模型
- `.env`、provider、streaming、tool calling 等逻辑散落在不同文件里
- 缺少统一交互页面，只能在终端观察输出
- 很难把学习成果变成可长期演示、可复盘、可复用的应用

AI-Journey-Land 的目标是把这些学习成果进一步工程化：

- 用 NestJS 封装统一后端接口
- 用前端应用展示每个 AI demo 的交互过程
- 支持普通请求、SSE 流式输出、结构化输出、工具调用、RAG 等能力
- 把 demo、源码、文档、学习记录连接起来
- 形成一个个人 AI 学习实验室与 Demo Hub

## 计划技术栈

这是一个全栈 monorepo，技术栈会优先选择熟悉、稳定、可维护的方案；当前阶段会适度激进地使用新版本工具，方便学习和验证新工程范式。

### 后端

- TypeScript
- NestJS
- OpenAI-compatible provider / LangChain / LangGraph 等 AI SDK
- SSE / Streaming Response
- DTO / Schema 校验
- 后续可接入数据库、向量数据库、任务队列与评测系统

### 前端

- TypeScript
- Nuxt 4
- Vue 3
- Nuxt UI
- SSE 流式交互展示
- Demo 橱窗首页、独立 demo 页面、输入面板、输出面板、运行日志、源码与文档链接

### 工程化

- pnpm workspace
- Turbo
- Oxlint
- Oxfmt
- monorepo 分层管理
- 共享类型与通用 AI 调用能力
- GitHub Actions
- 后续可部署到 Vercel、Render、Railway、Fly.io 或自有服务器

## 计划目录结构

```text
.
├── apps/
│   ├── api/                 # NestJS 后端服务
│   └── web/                 # 前端 Demo 展示平台
├── packages/
│   ├── ai-core/             # 模型初始化、provider adapter、stream helper
│   ├── demo-registry/       # demo 元信息、输入 schema、展示配置
│   └── shared/              # DTO、类型、通用 schema
├── docs/                    # 项目上下文、架构设计、issue 日志、demo 复盘
├── AGENTS.md                # 协作规范
└── README.md
```

当前仓库已落地第一版最小全栈闭环：NestJS API、Nuxt 展示应用、共享 schema、demo registry 与统一 AI 调用层。

当前架构采用“微服务思维、模块化单体落地”：`apps/web` 和 `apps/api` 仍是两个部署单元，但 demo 按 feature 边界组织。复杂 demo 可以拥有独立页面和独立 Nest module，先练清楚服务边界、契约和可替换性，再考虑拆成真实独立服务。

## 本地启动

要求：

- Node.js 22.18.0
- pnpm 11+

安装依赖：

```bash
pnpm install
```

配置后端环境变量：

```bash
cp apps/api/.env.example apps/api/.env
```

`apps/api/.env` 默认采用 DashScope OpenAI-compatible 模式：

```dotenv
API_PORT=4041
WEB_ORIGIN=http://localhost:4040

OPENAI_API_KEY=sk-xx
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
MODEL_NAME=qwen-plus
```

启动开发服务：

```bash
pnpm dev
```

默认地址：

- Web：http://localhost:4040
- API：http://localhost:4041/api

## 常用脚本

```bash
pnpm build          # 构建所有 package
pnpm lint           # oxlint 检查
pnpm format         # oxfmt 格式化
pnpm format:check   # 校验格式
pnpm typecheck      # TypeScript 类型检查
pnpm test           # 运行全部测试单元
```

单个 package 测试：

```bash
pnpm test --filter @ai-journey-land/ai-core
pnpm test --filter @ai-journey-land/shared
pnpm test --filter @ai-journey-land/demo-registry
pnpm test --filter @ai-journey-land/api
```

覆盖率报告：

```bash
pnpm --filter @ai-journey-land/ai-core exec vitest run --coverage
```

详细信息见 [测试规范](./docs/03-测试规范.md)。

## 当前已接入 demo

### prompt-template-weekly-report

Prompt Template 周报生成 demo。

- 后端接口：`GET /api/demos`、`GET /api/demos/:id`、`POST /api/demos/:id/run`、`POST /api/demos/:id/stream`
- 前端页面：`/` 橱窗卡片、`/demos/prompt-template-weekly-report` 独立 demo 页面
- Display mode：`custom-page`
- 来源：[AI-Journey-Fighting prompt-template1.mjs](https://github.com/Fridolph/AI-Journey-Fighting/blob/main/examples/prompt-template-test/src/prompt-template1.mjs)

## 第一阶段目标

第一阶段不追求“大而全”，重点是把最小闭环跑起来：

1. 搭建 monorepo 基础结构
2. 创建 NestJS API 服务
3. 创建前端 Demo 展示应用
4. 抽出统一模型调用层
5. 接入第一个 demo：Prompt Template 或 Structured Output
6. 支持一次普通请求和一次 SSE 流式输出
7. 在页面上关联源码、文档与学习记录

## Demo 接入优先级

初期建议优先从这些方向接入：

1. Prompt Template
   展示变量填充、Few-shot、Example Selector 等能力。
2. Structured Output
   展示 JSON Schema、Parser、模型输出修复等能力。
3. Runnable
   展示 chain、branch、retry、fallback 等编排能力。
4. Tool Calling
   展示工具选择、参数生成、工具结果回填。
5. RAG / Memory
   展示检索、上下文拼接、历史记忆和回答生成。

## 与 AI-Journey-Fighting 的协作方式

原则上：

- 不把 Fighting 的原始学习 demo 直接搬成生产代码
- 先在 Fighting 里学习、跑通、记录
- 再在 Land 里重构、抽象、接口化、页面化
- Land 里的每个 demo 尽量保留到 Fighting 中对应源码、草稿或正式文档的链接

这样两个仓库各自职责清晰：

- Fighting 保留学习路径与原始上下文
- Land 承接工程化升级与展示体验

## 当前文档

- [项目上下文](./docs/00-项目上下文.md)
- [AI 演示平台架构设计](./docs/01-AI演示平台架构设计.md)
- [工程化约定](./docs/02-工程化约定.md)
- [测试规范](./docs/03-测试规范.md)
- [Issue 开发日志规范](./docs/issues/README.md)
- [Demo 文档索引](./docs/demos/README.md)
- [Prompt Template 周报生成 Demo 总览](./docs/demos/prompt-template-weekly-report/总览.md)
- [Prompt Template 周报生成 Demo 前端复盘](./docs/demos/prompt-template-weekly-report/前端复盘.md)
- [Prompt Template 周报生成 Demo 后端与 AI 复盘](./docs/demos/prompt-template-weekly-report/后端与AI复盘.md)

## 当前状态

项目已完成第一版 monorepo scaffold，并接入 Prompt Template 的端到端验证。

下一步建议继续补强 demo 接入规范、测试覆盖和第二个 Structured Output demo。
