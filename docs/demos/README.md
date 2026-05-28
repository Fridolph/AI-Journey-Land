# Demo 文档索引

这里维护 AI-Journey-Land 中每个 demo 的复盘、设计说明和后续优化记录。

每个 demo 使用独立目录，目录名与 registry 中的 `demo.id` 保持一致：

```text
docs/demos/
  prompt-template-weekly-report/
    总览.md
    前端复盘.md
    后端与AI复盘.md
```

## 当前 demo

### AI Demo
- [Prompt Template 周报生成：总览](./prompt-template-weekly-report/总览.md)
- [Prompt Template 周报生成：前端复盘](./prompt-template-weekly-report/前端复盘.md)
- [Prompt Template 周报生成：后端与 AI 复盘](./prompt-template-weekly-report/后端与AI复盘.md)

### 全栈 Demo
- [Card Learning Demo：总览](./card-learning-demo/总览.md)
- [Card Learning Demo：数据库环境](./card-learning-demo/数据库环境.md)

## 文档约定

每完成一个 demo，至少补三篇稳定文档：

- `总览.md`：概括 demo 目标、开发情况、难点要点和主要实现思路，不按前后端拆分。
- `前端复盘.md`：站在前端工程师视角，复盘页面分层、交互、展示方式、安全、性能、样式和可优化方案。
- `后端与AI复盘.md`：站在后端和 AI 工程视角，复盘 API、数据结构、模型调用封装、方案抉择、候选方案和后续服务扩展。

内容需要覆盖：

- 页面设计与分层：页面如何组织、主次信息如何安排、是否复用通用组件。
- 交互设计：普通运行、流式运行、Loading、滚动、错误态、空态等体验取舍。
- API 实现：接口、请求/响应、SSE 事件、错误处理、数据流转。
- 技术清单：前端、AI、后端分别使用了哪些技术与库。
- 三视角复盘：分别从前端、AI、后端角度说明已完成内容、可优化点和评估方式。

如果某个 demo 后续持续迭代，可以在同目录下继续增加 `优化记录.md`、`评测记录.md`、`设计草稿.md` 等文档。
