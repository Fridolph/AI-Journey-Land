# DTO 与 Zod 校验

> 以 Card Learning Demo 的 CRUD 为例，从"普通 NestJS class DTO"升级到"Zod schema DTO"的过程复盘。

---

## 1. 什么是 DTO

DTO（Data Transfer Object）= 数据传输对象。

在 NestJS 里，Controller 接收请求时用 DTO 定义"请求体长什么样"：

```typescript
@Post()
create(@Body() body: CreateCardDto) { ... }
```

DTO 做两件事：

1. **类型约束**——TypeScript 编译时检查字段类型
2. **运行时校验**——请求进来时拒绝不合法的数据

---

## 2. 旧方案：普通 class DTO 的问题

原来的 `CreateCardDto`：

```typescript
export class CreateCardDto {
  title!: string
  summary?: string
  content?: string
  category?: string
  difficulty?: string
  status?: string
}
```

问题：

| 问题                  | 例子                                                              |
| --------------------- | ----------------------------------------------------------------- |
| 没有运行时校验        | 传入 `{ title: "" }` 空字符串不会拦截                             |
| 没有默认值            | `difficulty` 不传就是 `undefined`，不是 `"basic"`                 |
| 没有严格模式          | 传入多余字段如 `{ title: "x", foo: "bar" }` 静默通过              |
| query string 类型不对 | `?page=abc` → `page` 是 `"abc"` 字符串，Service 要手动 `Number()` |

---

## 3. 新方案：Zod schema + `nestjs-zod`

### 安装

```bash
pnpm add zod nestjs-zod
```

### 核心模式

```typescript
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// 1. 定义 Zod schema
const createCardSchema = z
  .object({
    title: z.string().trim().min(1),
    difficulty: z.enum(['basic', 'medium', 'advanced']).default('basic'),
  })
  .strict()

// 2. 生成 NestJS DTO class
export class CreateCardDto extends createZodDto(createCardSchema) {}
```

三步走：**定义 schema → 调 `createZodDto()` → 得到 class**。

---

## 4. 当前项目的 DTO 文件结构

```
src/cards/dto/
├── card.schema.ts        # 集中定义复用 schema
├── create-card.dto.ts    # POST /cards
├── query-cards.dto.ts    # GET /cards?page=1&...
└── update-card.dto.ts    # PATCH /cards/:id
```

---

## 5. `card.schema.ts`：集中管理复用 schema

```typescript
import { z } from 'zod'

// 枚举 schema —— 一处定义，多处复用
export const cardStatusSchema = z.enum(['todo', 'doing', 'done'])
export const cardDifficultySchema = z.enum(['basic', 'medium', 'advanced'])

// 排序选项
export const cardSortBySchema = z.enum([
  'createdAt',
  'updatedAt',
  'title',
  'difficulty',
  'status',
])
export const sortOrderSchema = z.enum(['asc', 'desc'])

// 基础字段 schema —— 被 create/update 共用
export const cardBaseSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().optional(),
  content: z.string().trim().optional(),
  category: z.string().trim().min(1).optional(),
  difficulty: cardDifficultySchema.optional(),
  status: cardStatusSchema.optional(),
})
```

**关键概念**：用 `z.enum()` 而不是手写 `string`。好处：

- 运行时校验——传入 `"invalid"` 直接拦截
- TypeScript 类型自动推导——`CardDifficulty` 类型是 `'basic' | 'medium' | 'advanced'`

---

## 6. `create-card.dto.ts`：POST 请求体

```typescript
export const createCardSchema = z
  .object({
    title: z.string().trim().min(1),
    summary: z.string().trim().optional(),
    content: z.string().trim().optional(),
    category: z.string().trim().min(1).optional(),
    difficulty: cardDifficultySchema.default('basic'),
    status: cardStatusSchema.default('todo'),
  })
  .strict()

export class CreateCardDto extends createZodDto(createCardSchema) {}
```

| Zod 方法            | 作用                 | 场景               |
| ------------------- | -------------------- | ------------------ |
| `z.string()`        | 必须是字符串         | 基础类型           |
| `.trim()`           | 去除首尾空格         | 用户输入的字符串   |
| `.min(1)`           | 最少 1 字符          | 必填字段           |
| `.optional()`       | 可缺省               | 可选字段           |
| `.default('basic')` | 缺省时自动填充默认值 | 不会变成 undefined |
| `.strict()`         | 拒绝未声明的多余字段 | 安全               |

**与旧方案对比**：

| 场景                                 | 旧 class DTO        | 新 Zod DTO          |
| ------------------------------------ | ------------------- | ------------------- |
| `{ title: "" }`                      | 通过                | 拦截（`.min(1)`）   |
| `{ title: "hello" }` 不传 difficulty | `undefined`         | 自动填 `"basic"`    |
| `{ title: "x", foo: "bar" }`         | 静默通过            | 拦截（`.strict()`） |
| `{ difficulty: "invalid" }`          | 通过（只是 string） | 拦截（`z.enum`）    |

---

## 7. `query-cards.dto.ts`：GET 查询参数

```typescript
export const queryCardsSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),

    keyword: z.string().trim().min(1).optional(),
    status: cardStatusSchema.optional(),
    difficulty: cardDifficultySchema.optional(),
    category: z.string().trim().min(1).optional(),

    sortBy: cardSortBySchema.default('createdAt'),
    sortOrder: sortOrderSchema.default('desc'),
  })
  .strict()

export class QueryCardsDto extends createZodDto(queryCardsSchema) {}
```

**关键：`z.coerce.number()`**

Query string 传参时：

```
GET /cards?page=1&pageSize=20
```

Express 收到的 `req.query.page` 是**字符串** `"1"`，不是数字 `1`。

| 写法                | 效果                     |
| ------------------- | ------------------------ |
| `z.number()`        | `"1"` → 失败（期望数字） |
| `z.coerce.number()` | `"1"` → `1`（自动转换）  |

**为什么 Service 层可以简化**：

```typescript
// 旧：手动防御
const page = Math.max(Number(query.page) || 1, 1)
const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100)

// 新：Zod 已经保证了类型和边界
const page = query.page // 一定是 number ≥ 1
const pageSize = query.pageSize // 一定是 number ∈ [1, 100]
```

---

## 8. `update-card.dto.ts`：PATCH 请求体

```typescript
export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    summary: z.string().trim().optional(),
    content: z.string().trim().optional(),
    category: z.string().trim().min(1).optional(),
    difficulty: cardDifficultySchema.optional(),
    status: cardStatusSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少需要提供一个要更新的字段',
  })

export class UpdateCardDto extends createZodDto(updateCardSchema) {}
```

**关键：`.refine()`**

PATCH 更新时所有字段都是可选的，但**至少传一个**才合理。`.refine()` 提供了自定义校验：

```typescript
.refine(
  (data) => Object.keys(data).length > 0,  // 条件
  { message: '至少需要提供一个要更新的字段' }  // 失败消息
)
```

如果请求体是 `{}` → 拦截，返回 `"至少需要提供一个要更新的字段"`。

---

## 9. Prisma 枚举与 Zod 枚举的关系

在 `schema.prisma` 中定义了数据库层的枚举：

```prisma
enum CardStatus { todo doing done }
enum CardDifficulty { basic medium advanced }
```

在 `card.schema.ts` 中定义了校验层的枚举：

```typescript
export const cardStatusSchema = z.enum(['todo', 'doing', 'done'])
export const cardDifficultySchema = z.enum(['basic', 'medium', 'advanced'])
```

它们是**两层**：

| 层       | 位置             | 作用                               |
| -------- | ---------------- | ---------------------------------- |
| 数据库层 | `schema.prisma`  | 约束磁盘上存的值只能是 enum 成员   |
| 校验层   | `card.schema.ts` | 约束请求体中传的值只能是 enum 成员 |

双重保护：请求进来时 Zod 先拦，写入时 PostgreSQL 再拦。

---

## 10. nestjs-zod 原理

`createZodDto` 做了一件简单的事：

```typescript
class CreateCardDto extends createZodDto(createCardSchema) {
  // 自动生成了 validate() 方法
  // NestJS ValidationPipe 调用 validate() → 内部调 schema.parse()
}
```

NestJS 的 `ValidationPipe` 默认不会对普通 class DTO 做校验（需要配合 `class-validator`）。  
`createZodDto` 让它直接走 Zod 的 `parse()`，一步到位。

---

## 11. DTO 设计原则

| 原则               | 做法                                  |
| ------------------ | ------------------------------------- |
| 一处定义，多处复用 | 枚举、基础字段抽到 `card.schema.ts`   |
| 请求即校验         | 每个 DTO 用自己的 Zod schema 声明契约 |
| `.strict()`        | 拒绝未声明的字段，防止注入            |
| `.default()`       | 可选字段给默认值，不依赖 Service 判断 |
| `coerce`           | query string 类型自动转换             |
| `.refine()`        | 声明式表达复杂校验规则                |

---

## 附录：本次拆出来的关键概念

| 概念                | 说明                                                       |
| ------------------- | ---------------------------------------------------------- |
| DTO                 | 定义请求/响应的数据形状，做运行时校验                      |
| Zod schema          | 声明式描述数据约束（类型+规则）                            |
| `createZodDto`      | nestjs-zod 提供的工厂，把 Zod schema 变成 NestJS DTO class |
| `z.coerce.number()` | 把字符串 `"1"` 自动转为数字 `1`                            |
| `.strict()`         | 拒绝多余字段                                               |
| `.refine()`         | 自定义校验逻辑                                             |
| `z.enum()`          | 限定值只能是列表中的一个                                   |
| `.default()`        | 字段缺省时自动填充                                         |
| `.trim().min(1)`    | 去空格 + 非空约束                                          |
| Prisma enum         | 数据库层的枚举，约束磁盘数据                               |
| Zod enum            | 校验层的枚举，约束请求数据                                 |
