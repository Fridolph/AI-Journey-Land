# Issue 开发日志：Cards 动态排序接入 + Service 完善

## Issue 信息

- **关联 Issue**：#25 PostgreSQL + Admin CRUD 后续
- **分支**：`learn/cards-from-zero`
- **上一轮**：[#26 Cards DTO Zod 重构](./issue-026-cards-dto-zod-refactor.md)

## 开发范围

### 本轮变更

| 文件 | 变更 | 说明 |
|---|---|---|
| `cards.service.ts:18-20` | 动态排序 | 使用 `satisfies Prisma.CardOrderByWithRelationInput` 替代写死的 `createdAt: 'desc'` |
| `cards.service.ts:65-66` | 响应 meta 扩展 | 新增 `sortBy` / `sortOrder` 字段 |
| `cards.service.ts:87-89` | 创建字段补全 | `create()` 现在写入 `category` / `difficulty` / `status` |

### 之前已就绪的基础设施

| 层 | 内容 | 说明 |
|---|---|---|
| DTO (`query-cards.dto.ts`) | `sortBy`、`sortOrder` 的 Zod enum + default | 请求进来前就校验了合法值 |
| Schema (`card.schema.ts`) | `cardSortBySchema`、`sortOrderSchema` | 枚举值集中定义 |
| Database (`schema.prisma`) | `CardDifficulty`、`CardStatus` 枚举 | 数据层约束 |

### 非目标

- 不添加新的排序字段
- 不变更 Controller 路由

## 关键决策

### 1. 为什么用 `satisfies` 而不是显式类型注解

```typescript
// ✅ 使用 satisfies
const orderBy = {
  [query.sortBy]: query.sortOrder,
} satisfies Prisma.CardOrderByWithRelationInput

// ❌ 显式类型注解可能报错
const orderBy: Prisma.CardOrderByWithRelationInput = {
  [query.sortBy]: query.sortOrder,  // computed key 可能导致 TS 报错
}
```

`satisfies` 在编译时检查类型是否兼容，但不强制展开类型——computed key 能正常工作。

### 2. 排序安全由 Zod 保证

用户传非法 `sortBy` 值（如 `sortBy=password`）在进入 Service 前就被 Zod DTO 拦截返回 400。Service 层不需要额外防御。

### 3. 响应 meta 包含 sortBy/sortOrder

让前端知道当前排序状态，便于 UI 渲染排序箭头方向。

## 自测

### 测试用例

```bash
# 1. 默认排序（createdAt desc）
curl "http://localhost:5044/api/cards"
# 响应 meta: { sortBy: "createdAt", sortOrder: "desc" }

# 2. 按标题升序
curl "http://localhost:5044/api/cards?sortBy=title&sortOrder=asc"

# 3. 按更新时间降序
curl "http://localhost:5044/api/cards?sortBy=updatedAt&sortOrder=desc"

# 4. 非法排序字段 → 400
curl "http://localhost:5044/api/cards?sortBy=id"

# 5. 非法排序方向 → 400
curl "http://localhost:5044/api/cards?sortOrder=random"
```

### TypeScript

```bash
pnpm typecheck  # 9/9 ✅
```

## 学习收获

详见 `docs/demos/card-learning-demo/Prisma-Service操作入门.md`

- `findMany` + `count` + `$transaction` 分页查询模式
- `satisfies` 类型关键字处理 computed key
- `contains + mode: 'insensitive'` 模糊搜索
- `findUnique` / `findFirst` / `findMany` / `count` 的区别
