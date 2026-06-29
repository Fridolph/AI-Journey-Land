# Prisma Service 操作入门

> 以 `cards.service.ts` 的实际代码为例，拆解 Prisma 在 NestJS Service 层的常用操作。

---

## 1. Service 文件结构

```typescript
import { Prisma } from '@prisma/client'      // Prisma 类型 namespace
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}
  // ...
}
```

`PrismaService` 通过 DI 注入，所有数据库操作通过 `this.prisma.xxx` 调用。

---

## 2. 查询列表 + 分页 + 排序：`findAll`

### 完整代码

```typescript
async findAll(query: QueryCardsDto) {
  const page = query.page                    // Zod 已保证 number
  const pageSize = query.pageSize            // Zod 已保证 1-100
  const skip = (page - 1) * pageSize
  const take = pageSize

  const where: Prisma.CardWhereInput = {}
  const orderBy = {
    [query.sortBy]: query.sortOrder,         // 动态 key 排序
  } satisfies Prisma.CardOrderByWithRelationInput

  // 关键词搜索
  if (query.keyword) {
    where.OR = [
      { title: { contains: query.keyword, mode: 'insensitive' } },
      { summary: { contains: query.keyword, mode: 'insensitive' } },
      { content: { contains: query.keyword, mode: 'insensitive' } },
    ]
  }

  // 等值筛选
  if (query.status) where.status = query.status
  if (query.category) where.category = query.category
  if (query.difficulty) where.difficulty = query.difficulty

  // 事务：并发查数据 + 查总数
  const [items, total] = await this.prisma.$transaction([
    this.prisma.card.findMany({ where, skip, take, orderBy }),
    this.prisma.card.count({ where }),
  ])

  return {
    items,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  }
}
```

### 概念拆解

| 概念 | 代码 | 说明 |
|---|---|---|
| **分页** | `skip / take` | `skip = (page-1) * pageSize`, `take = pageSize` |
| **模糊搜索** | `contains + mode: 'insensitive'` | 不区分大小写的 LIKE 查询 |
| **等值筛选** | `where.status = query.status` | 精确匹配 enum 值 |
| **动态排序** | `{ [query.sortBy]: query.sortOrder }` | 用计算属性名动态指定排序字段 |
| **事务** | `$transaction([...])` | 并发执行多个查询，保证数据一致性 |
| **总数统计** | `.count({ where })` | 返回符合条件的总行数（用于分页） |

---

## 3. `$transaction` 事务

```typescript
const [items, total] = await this.prisma.$transaction([
  this.prisma.card.findMany({ ... }),
  this.prisma.card.count({ ... }),
])
```

作用：**并发执行**两个查询，返回结果数组。这里不是 ACID 事务（读操作不需要），而是**批量查询**——一次网络往返执行两条 SQL，减少延迟。

如果操作涉及写（create + update），`$transaction` 会提供真正的 ACID 保证。

---

## 4. 动态排序：`satisfies` 用法

```typescript
const orderBy = {
  [query.sortBy]: query.sortOrder,
} satisfies Prisma.CardOrderByWithRelationInput
```

| 写法 | 效果 |
|---|---|
| `[query.sortBy]: query.sortOrder` | JavaScript 计算属性名，运行时展开为 `{ createdAt: 'desc' }` 等 |
| `satisfies Prisma.CardOrderByWithRelationInput` | TypeScript 类型检查：确保这个对象符合 Prisma 的类型定义 |

**为什么不用 `as` 断言**：

```typescript
// ❌ as 断言：欺骗编译器，不做检查
const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.CardOrderByWithRelationInput

// ✅ satisfies：检查类型，不改变推断
const orderBy = { [query.sortBy]: query.sortOrder } satisfies Prisma.CardOrderByWithRelationInput
```

`satisfies` 是 TypeScript 4.9+ 的特性：**先检查类型是否匹配，再保留原类型推断**。

---

## 5. 查询单条：`findOne`

```typescript
async findOne(id: string) {
  const card = await this.prisma.card.findUnique({ where: { id } })
  if (!card) throw new NotFoundException('卡片不存在')
  return card
}
```

| API | 场景 | 找不到时的返回值 |
|---|---|---|
| `findUnique()` | 通过主键或 unique 字段查询 | `null` |
| `findFirst()` | 通过非 unique 条件查第一条 | `null` |
| `findMany()` | 查多条 | `[]` 空数组 |

---

## 6. 创建：`create`

```typescript
async create(createCardDto: CreateCardDto) {
  return this.prisma.card.create({
    data: {
      title: createCardDto.title,
      summary: createCardDto.summary,
      content: createCardDto.content || '',
      category: createCardDto.category,
      difficulty: createCardDto.difficulty,
      status: createCardDto.status,
    },
  })
}
```

关键点：
- `content || ''`——DTO 允许 content 缺省，但数据库列是 NOT NULL，所以给默认空串
- `difficulty` 和 `status` 在 Zod DTO 层已有 `.default('basic')` / `.default('todo')`，传到这里一定有值

---

## 7. 更新：`update`

```typescript
async update(id: string, updateCardDto: UpdateCardDto) {
  await this.findOne(id)  // 先查是否存在（404 保护）

  return this.prisma.card.update({
    where: { id },
    data: {
      title: updateCardDto.title,
      summary: updateCardDto.summary,
      content: updateCardDto.content,
      category: updateCardDto.category,
      difficulty: updateCardDto.difficulty,
      status: updateCardDto.status,
    },
  })
}
```

`update` 的 `data` 只传了存在的字段——Prisma 会忽略 `undefined` 值，只更新实际提供了的字段（PATCH 语义）。

---

## 8. 删除：`delete`

```typescript
async remove(id: string) {
  await this.findOne(id)  // 先查是否存在（404 保护）
  return this.prisma.card.delete({ where: { id } })
}
```

---

## 9. 当前 Service 操作速查表

| 方法 | Prisma API | 特殊处理 |
|---|---|---|
| `findAll` | `findMany` + `count` + `$transaction` | 动态排序（satisfies）、模糊搜索（contains insensitive） |
| `findOne` | `findUnique` | 手动抛 NotFoundException |
| `create` | `create` | content 补默认空串 |
| `update` | `update` 后用 first + update | findOne 做 404 保护 |
| `remove` | `delete` | findOne 做 404 保护 |

---

## 10. Prisma 常用查询操作速查

| API | 用途 | 示例 |
|---|---|---|
| `findMany({ where, skip, take, orderBy })` | 列表查询 | 分页列表 |
| `findUnique({ where: { id } })` | 主键查询 | 详情页 |
| `findFirst({ where: { ... } })` | 条件查第一条 | 非主键查找 |
| `create({ data: { ... } })` | 创建 | POST |
| `update({ where, data })` | 更新 | PATCH/PUT |
| `delete({ where })` | 删除 | DELETE |
| `count({ where })` | 统计总数 | 分页 total |
| `upsert({ where, create, update })` | 有则更新无则创建 | seed 脚本 |
| `$transaction([...])` | 批量操作/事务 | 数据一致性 |

---

## 11. 筛选条件速查

| 条件 | 代码 | SQL 等价 |
|---|---|---|
| 等值 | `where.status = 'todo'` | `WHERE status = 'todo'` |
| 模糊搜索 | `{ contains: 'keyword', mode: 'insensitive' }` | `WHERE title ILIKE '%keyword%'` |
| OR 多字段 | `where.OR: [{ title: ... }, { content: ... }]` | `WHERE (title ILIKE ... OR content ILIKE ...)` |
| 条件构建 | `if (query.keyword) where.OR = [...]` | 动态拼接 WHERE |
