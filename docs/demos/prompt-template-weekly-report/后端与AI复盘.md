# Prompt Template 周报生成 Demo 后端与 AI 复盘

## 1. 后端职责边界

当前 demo 的后端职责很清晰：

- 读取和保护模型 provider 配置。
- 校验前端传入的 demo input。
- 将业务字段填入 Prompt Template。
- 调用真实模型。
- 提供普通运行和 SSE 流式运行两条接口。
- 把配置错误转换成清晰的 API 错误，而不是让服务崩溃。

前端只负责收集输入和展示输出，不直接接触 API Key，也不直接调用模型 provider。

## 2. API 设计

当前 API 保持 demo hub 的统一接口形态：

- `GET /api/demos`
- `GET /api/demos/:id`
- `POST /api/demos/:id/run`
- `POST /api/demos/:id/stream`

普通运行返回完整结果：

```json
{
  "demoId": "prompt-template-weekly-report",
  "status": "success",
  "output": "..."
}
```

流式运行使用 SSE：

```text
event: meta
data: {"demoId":"prompt-template-weekly-report","status":"started"}

event: token
data: {"text":"..."}

event: done
data: {"status":"success"}
```

失败时输出 `error` 事件，前端按统一错误面板展示。

## 3. 数据结构与输入契约

当前输入字段包括：

- `companyName`
- `teamName`
- `managerName`
- `weekRange`
- `teamGoal`
- `devActivities`

这些字段来自共享 schema，而不是前后端各写一份。这样做的好处是：

- 前端表单字段有稳定来源。
- 后端 DTO 校验和页面输入保持一致。
- demo registry 可以直接描述学习目标、字段、路由、API namespace 和展示模式。

后续如果要接入结构化输出，可以在 shared package 里继续增加 output schema，例如：

- `summary`
- `highlights`
- `risks`
- `nextPlans`
- `metricsTable`

这样前端就能用组件渲染结果，而不是直接依赖 Markdown 格式。

## 4. AI 调用封装

当前 AI 调用链路是：

1. Demo service 读取 `AI_PROVIDER`。
2. 根据 provider 选择对应环境变量。
3. `ai-core` 的 `createChatModel()` 创建 `ChatOpenAI`。
4. `PromptTemplate` 将业务字段填入模板。
5. 普通运行调用 `model.invoke()`。
6. 流式运行调用 `model.stream()`。

当前支持：

- `openai`：使用 `OPENAI_API_KEY`、`OPENAI_BASE_URL`、`MODEL_NAME`。
- `deepseek`：使用 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL_NAME`。

这个实现适合第一版 demo，因为它足够直观，也能明确演示 provider 配置如何进入模型调用。

## 5. 实现方案抉择

### 为什么先用模块化单体

当前 demo 数量少，复杂度也不高。直接拆成独立服务会过早引入部署、网关、鉴权、日志聚合、跨服务调试等成本。

所以第一阶段采用模块化单体：

- 一个 NestJS app。
- 每个 demo 一个独立 service/module。
- 统一 `DemosService` 做路由分发。
- 统一 registry 维护 demo 元信息。

这能保留服务边界意识，也不会拖慢初始化。

### 为什么使用 OpenAI-compatible

OpenAI-compatible 接口能覆盖 DashScope、DeepSeek 等 provider，学习成本低，迁移成本也低。

当前没有引入 provider 专属 SDK，是为了保持 demo 轻量。等后续需要 tool calling 差异、embedding 差异、重试策略或模型能力探测时，再抽 provider adapter 更合适。

### 为什么普通和流式拆接口

普通接口适合简单调用和测试，也方便前端拿完整输出。

流式接口适合长文本和交互体验。两条接口都保留，可以让学习者直观看到 `invoke()` 和 `stream()` 的差异。

## 6. 可优化点

### AI 封装

- 把 provider 选择逻辑下沉到 `ai-core`，避免每个 demo service 都判断 provider。
- 增加统一 `createChatModelFromConfig(configService)` 或 provider factory。
- 增加模型能力描述，例如是否支持 streaming、tools、JSON mode、vision。
- 增加 prompt preview 和 prompt version，方便复盘输出质量。

### API 与运行时

- 增加请求耗时、首 token 延迟、总 token 数等指标。
- 对 SSE 增加客户端断开检测，避免无效生成继续占资源。
- 增加统一错误码，例如 `AI_CONFIG_MISSING`、`AI_PROVIDER_UNSUPPORTED`、`AI_PROVIDER_REQUEST_FAILED`。
- 后续可以接入队列处理长任务，避免 HTTP 请求一直占用连接。

### 数据服务扩展

后续复杂 demo 可能需要更多综合服务：

- Milvus：RAG 向量检索、相似示例选择。
- MySQL：保存 demo 运行记录、用户配置、评测结果。
- MongoDB：保存非结构化运行日志、复杂 Agent traces。
- Redis：缓存模型输出、限流、任务状态。
- Docker：统一本地依赖服务，降低环境差异。

当前 demo 暂时不引入这些服务，因为 Prompt Template 周报生成还不需要持久化、检索或队列。先把 API 契约和模型调用边界打稳更重要。

## 7. 候选方案与竞品思路

可以参考的实现方向：

- LangServe：适合快速把 LangChain runnable 暴露成 API，但对当前 demo hub 的自定义 registry、页面解释和复盘文档不够贴合。
- Dify / Coze 类平台：适合低代码编排，但 Land 的目标是学习工程化过程，所以需要保留源码、接口和实现细节。
- Vercel AI SDK：前端流式体验很成熟，但当前后端是 NestJS + LangChain，第一版先保持技术栈聚焦。

当前选择 NestJS + LangChain 的原因是：后端结构清楚，适合沉淀模块边界；LangChain 覆盖 Prompt Template、streaming、后续 runnable/tool/RAG 学习路径。

## 8. 评估方式

后端和 AI 侧可以用这些指标评估：

- 缺少 key、错误 provider、错误 base URL 时是否返回清晰错误。
- 普通运行是否稳定返回完整 Markdown。
- 流式运行是否稳定输出 `meta/token/done/error`。
- 首 token 延迟是否可接受。
- 同一输入在不同 provider/model 下输出结构是否稳定。
- 新增第二个 demo 时，是否还能复用当前 API、registry、schema 和 ai-core 结构。

## 9. 当前结论

当前实现已经满足第一个 demo 的工程化目标：真实模型调用、密钥保护、输入校验、普通输出、SSE 输出和清晰错误都已具备。

下一阶段后端最值得优化的是 provider factory、运行指标和结构化输出 schema。AI 侧最值得优化的是 prompt 版本管理、输出质量评估和结构化结果生成。
