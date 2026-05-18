# Issue 开发日志规范

`docs/issues/` 用来记录每个 GitHub issue 的开发过程。它不是替代 issue 或 PR，而是沉淀 Land 项目内部的工程决策、验证记录和后续复盘线索。

## 文件命名

文件名使用 issue 号和简短英文/拼音描述，保持稳定、便于排序：

```text
issue-006-api-common.md
issue-007-ai-core.md
```

## 写作时机

- 开发开始前可以先创建草稿，记录范围和非目标。
- 代码自测通过后必须补齐实现说明和验证结果。
- 合并到 `dev` 并关闭 issue 后，补充合并、关闭记录。

## 建议模板

````markdown
# Issue #<number> <title>

## Issue 创建信息

- 背景:
- 目标:
- 非目标:
- 验收标准:
- 测试计划:

## 基本信息

- Issue: <url>
- 分支: `<branch>`
- 类型: feat / fix / refactor / docs / test / chore
- 状态: 开发中 / 已合并 / 已关闭

## Plan / TDD

- 实现计划:
- 测试策略:
- 回归风险:

## 开发范围

- 本次要做:
- 本次不做:
- 旁支问题:

## 关键变更

- 文件或模块:
- 说明:

## 实现记录

- 方案选择:
- 核心逻辑:
- 安全与边界:
- 可维护性考虑:

## 特殊变更检查

- 数据库 / migration:
- 环境变量 / `.env.example`:
- 依赖 / lockfile:
- Docker / CI / 部署:
- API 契约 / Swagger / API client:
- AI prompt / provider / model / schema:
- 升级影响:
- 回滚方式:

## 自测记录

```bash
pnpm typecheck
pnpm test
```

- 结果:
- 失败与修复:

## 前端人工验证

- 桌面端关键路径:
- 移动端关键路径:
- 截图或浏览器验证记录:

## Review 自查

- 是否符合 issue 验收标准:
- 是否存在无关改动:
- 是否同步文档 / README / API 契约:
- 是否存在安全风险:

## 遗留问题

- 后续优化:
- 风险:

## 合并与关闭

- PR:
- Commit:
- 合并到 `dev`:
- Issue 关闭时间:
````

## 质量要求

- 日志要写清楚“为什么这样实现”，不要只罗列改了哪些文件。
- 遗留风险必须真实记录，不能为了关闭 issue 而隐藏问题。
- 如果 issue 涉及 demo 接入，还要同步维护 `docs/demos/<demo-id>/` 下的三件套文档。
- 涉及数据库、环境变量、依赖、Docker、CI、API 契约或 AI prompt 的 issue，必须写清升级影响和回滚方式。
- 涉及 UI 的 issue，必须记录桌面端和移动端关键路径验证情况。
