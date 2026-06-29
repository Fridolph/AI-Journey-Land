# Prisma Schema 语法入门

> 以 Card Learning Demo v0.1 的 `schema.prisma` 为素材，逐行拆解 Prisma Schema 语法。  
> 当前版本包含：Prisma Enum 类型、多对多关系（Card ↔ Tag）、一对多关系（Card → LearningRecord）。

---

## 1. Prisma 是什么

Prisma 是 TypeScript 项目里常用的数据库工具，把"数据库表"变成"代码里的模型"。

你不用写：

```sql
SELECT * FROM cards;
INSERT INTO cards (...) VALUES (...);
```

而是在 TS 里写：

```ts
prisma.card.findMany()
prisma.card.create({ data: { title: 'Test', content: 'Hello' } })
```

Prisma 做两件事：
1. 用 `schema.prisma` 描述数据库结构
2. 生成 TS 代码，让你类型安全地操作数据库

---

## 2. 当前完整 Schema 结构

```
datasource db → PostgreSQL
  │
  ├── enum CardStatus { todo, doing, done }
  ├── enum CardDifficulty { basic, medium, advanced }
  │
  ├── model Card       (主表，含 tags 关系和 records 关系)
  ├── model Demo       (Demo 元数据持久化)
  ├── model Tag        (标签表)
  ├── model CardTag    (多对多中间表)
  └── model LearningRecord  (学习记录表)
```

---

## 3. `model` 关键词

```prisma
model Tag {
  id   String @id @default(uuid())
  name String @unique
  @@map("tags")
}
```

一个 `model` 通常对应数据库里一张表。上面这个声明大致等价于：

```sql
CREATE TABLE tags (
  id   TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE
);
```

---

## 4. `@` 和 `@@` 的规则

| 写法 | 作用范围 | 用途 |
|---|---|---|
| `@id` `@unique` `@default(...)` `@map(...)` `@updatedAt` | **单个字段** | 字段级属性 |
| `@@map(...)` `@@id([...])` `@@index([...])` | **整个模型** | 模型级属性 |

记法：单 `@` 管字段，双 `@@` 管模型。

---

## 5. `@@map` 和 `@map` 的区别

### `@@map("tags")` —— 映射表名

```prisma
model Tag {
  id String @id
  @@map("tags")
}
```

Prisma 代码里叫 `Tag`，数据库表名叫 `tags`。

### `@map("created_at")` —— 映射字段名

```prisma
createdAt DateTime @map("created_at")
```

Prisma 里叫 `createdAt`，数据库字段叫 `created_at`。

**命名约定**：Prisma/TS 用 camelCase，数据库用 snake_case。`@@map` / `@map` 就是这层名字翻译。

---

## 6. 字段类型速查

| 类型 | 含义 | 示例 |
|---|---|---|
| `String` | 字符串 | `title String` |
| `String?` | 可为空的字符串 | `summary String?` |
| `DateTime` | 日期时间 | `createdAt DateTime` |
| `Json` | JSON 数据 | `inputFields Json?` |
| `Boolean` | 布尔值 | `supportsStreaming Boolean` |
| `Int` | 整数 | 本项目未用 |
| `CardStatus` | **Prisma 枚举** | `status CardStatus` |
| `CardDifficulty` | **Prisma 枚举** | `difficulty CardDifficulty` |

---

## 7. Prisma Enum 枚举

`schema.prisma` 顶部定义了两个枚举：

```prisma
enum CardStatus {
  todo
  doing
  done
}

enum CardDifficulty {
  basic
  medium
  advanced
}
```

### 为什么要用 enum

旧方案用 `String` 存状态：

```prisma
status String @default("todo")
```

问题是：可以写入 `"abc"` `"test"` 等任意字符串，数据库不会拦截。

用 enum 后：

```prisma
status CardStatus @default(todo)
```

PostgreSQL 层面创建了真正的枚举类型：

```sql
CREATE TYPE "CardStatus" AS ENUM ('todo', 'doing', 'done');
```

写入非法值直接报错。

### 枚举在 model 中的使用

```prisma
model Card {
  difficulty CardDifficulty @default(basic)
  status     CardStatus     @default(todo)
}
```

| 写法 | 含义 |
|---|---|
| `CardDifficulty` | 字段类型是枚举 |
| `@default(basic)` | 默认值是枚举成员 `basic`（不带引号） |

注意 `@default(basic)` 不带引号——这是 Prisma 枚举成员的引用方式，与 `@default("basic")`（字符串默认值）不同。

### TypeScript 自动推导

Prisma 生成的客户端会提供类型安全的值：

```ts
// 编译时报错："invalid" 不在 CardStatus 中
await prisma.card.create({
  data: {
    title: 'test',
    content: '...',
    status: 'invalid'  // ❌ TypeScript error
  }
})

// ✅ 正确
await prisma.card.create({
  data: {
    title: 'test',
    content: '...',
    status: 'doing'
  }
})
```

---

## 8. 常用字段属性速查

| 属性 | 含义 |
|---|---|
| `@id` | 主键 |
| `@default(uuid())` | 默认生成 UUID |
| `@default(now())` | 默认取当前时间 |
| `@default(basic)` | 枚举默认值（不带引号） |
| `@default("basic")` | 字符串默认值（带引号） |
| `@default("[]")` | 默认空 JSON 数组 |
| `@default(false)` | 默认 false |
| `@unique` | 唯一约束（值不能重复） |
| `@updatedAt` | 每次更新自动刷新为当前时间 |
| `@map("xxx")` | 字段名映射（单 `@`） |
| `@@map("xxx")` | 表名映射（双 `@`） |
| `@@id([a, b])` | 联合主键 |

---

## 9. 逐行解析 Card 模型（当前版本）

```prisma
model Card {
  id         String           @id @default(uuid())
  title      String
  summary    String?
  content    String
  category   String?
  difficulty CardDifficulty   @default(basic)
  status     CardStatus       @default(todo)
  createdAt  DateTime         @default(now()) @map("created_at")
  updatedAt  DateTime         @updatedAt @map("updated_at")

  tags    CardTag[]
  records LearningRecord[]

  @@map("cards")
}
```

| 行 | 拆解 |
|---|---|
| `id String @id @default(uuid())` | 主键，UUID 自动生成 |
| `title String` | 标题，必填 |
| `summary String?` | 摘要，可选 |
| `content String` | 正文，必填 |
| `category String?` | 分类，可选 |
| `difficulty CardDifficulty @default(basic)` | 难度，枚举类型，默认 basic |
| `status CardStatus @default(todo)` | 状态，枚举类型，默认 todo |
| `createdAt DateTime @default(now()) @map("created_at")` | 创建时间，自动填当前时间 |
| `updatedAt DateTime @updatedAt @map("updated_at")` | 更新时间，每次更新自动刷新 |
| `tags CardTag[]` | 标签关联（多对多） |
| `records LearningRecord[]` | 学习记录关联（一对多） |
| `@@map("cards")` | 数据库表名 cards |

---

## 10. 逐行解析 Tag 模型

```prisma
model Tag {
  id   String @id @default(uuid())
  name String @unique

  cards CardTag[]

  @@map("tags")
}
```

| 行 | 拆解 |
|---|---|
| `id String @id @default(uuid())` | id 字段，主键，默认 UUID |
| `name String @unique` | 标签名，不允许重复 |
| `cards CardTag[]` | 关系字段：一个 Tag 可关联多条 CardTag 记录 |
| `@@map("tags")` | 数据库表名 tags |

---

## 11. 时间字段

```prisma
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

- `createdAt`：创建时自动取当前时间，数据库字段名 `created_at`
- `updatedAt`：每次更新自动刷新，数据库字段名 `updated_at`

示例：创建 Card 时两者都是 14:30，10 分钟后修改标题 → `createdAt` 仍是 14:30，`updatedAt` 变为 14:40。

---

## 12. 关系字段：`CardTag[]` 和 `LearningRecord[]`

```prisma
model Card {
  tags    CardTag[]
  records LearningRecord[]
}
```

这些不是数据库里真实的列，而是 **Prisma 的关系入口**。可以通过它们做嵌套查询：

```ts
prisma.card.findMany({
  include: {
    tags: { include: { tag: true } },
    records: true
  }
})
```

`[]` 表示"多个"，即一对多或多对多。

---

# 多对多关系：为什么需要 CardTag 中间表

## 1. 需求

一张卡片可以有多个标签：

```text
Card: PostgreSQL 索引
Tags: 数据库、PostgreSQL、性能优化
```

一个标签可以挂在多张卡片上：

```text
Tag: PostgreSQL
所在 Cards: PostgreSQL 索引、PostgreSQL 事务、PostgreSQL JSONB
```

这是**多对多关系**。

## 2. 为什么不能直接在 cards 表存 tags 数组

| 问题 | 说明 |
|---|---|
| 标签字符串重复 | `PostgreSQL` 出现多次，改名要逐行改 |
| 不好统计 | "PostgreSQL 标签下有多少张卡？" 数组查询别扭 |
| 不好管理 | 标签管理页（使用次数、删除、合并）很痛苦 |

## 3. 标准做法：三张表

```text
cards       存卡片本体
tags        存标签本体（name UNIQUE）
card_tags   存卡片和标签的绑定关系
```

## 4. 具体例子

创建 Card："PostgreSQL 索引"，标签：数据库、PostgreSQL、性能优化。

**cards**: `{ id: card1, title: "PostgreSQL 索引" }`

**tags**: `{ tag1: "数据库" }`, `{ tag2: "PostgreSQL" }`, `{ tag3: "性能优化" }`

**card_tags**: `{ card1→tag1 }`, `{ card1→tag2 }`, `{ card1→tag3 }`

再创建第二张 Card："PostgreSQL 事务"，标签：数据库、PostgreSQL。

**cards** 新增一行，**tags** 不变（name UNIQUE 阻止重复），**card_tags** 新增两条。

## 5. CardTag 模型详解

```prisma
model CardTag {
  cardId String
  tagId  String
  card   Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([cardId, tagId])
  @@map("card_tags")
}
```

| 部分 | 含义 |
|---|---|
| `cardId` + `tagId` | 两个外键，分别指向 Card 和 Tag |
| `@relation(...)` | 声明外键关系 |
| `onDelete: Cascade` | 删除 Card/Tag 时自动删除关联 |
| `@@id([cardId, tagId])` | 联合主键，cardId+tagId 唯一 |

---

# 深入 @relation 与外键

## 1. 核心语法

```prisma
card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
```

一句话解释：> 当前表里的 `cardId` 字段，去关联另一张表 `Card` 的 `id` 字段。

## 2. `cardId` 和 `card` 的分工

| 字段 | 是真实的数据库列吗 | 作用 |
|---|---|---|
| `cardId String` | 是 | 存所属 Card 的 ID |
| `card Card` | 不是 | Prisma 的关系入口，帮你取关联对象 |

查询时的效果：

```ts
const records = await prisma.learningRecord.findMany({
  include: { card: true }
})
// 返回: [{ id: "r1", cardId: "c1", card: { id: "c1", title: "PG索引" } }]
```

```text
cardId → 一个 ID 字符串
card   → Prisma 帮你取到的完整 Card 对象
```

## 3. 主键与外键

| 概念 | 例子 | 作用 |
|---|---|---|
| 主键 | `cards.id` | "我是谁"——唯一标识自己 |
| 外键 | `learning_records.card_id` | "我属于谁"——指向另一张表的主键 |

## 4. `@relation(...)` 逐段拆解

```prisma
card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
```

| 段落 | 含义 |
|---|---|
| `card Card` | 当前模型关联一个 Card |
| `fields: [cardId]` | 用 `cardId` 作为外键 |
| `references: [id]` | 外键引用 Card 的 `id` |
| `onDelete: Cascade` | 删 Card 时子数据一起删 |

## 5. CardTag 的双外键

```prisma
model CardTag {
  cardId String
  tagId  String
  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([cardId, tagId])
}
```

两个外键同时连接两张表：`cardId → Card.id` 和 `tagId → Tag.id`。

---

# 一对多关系：LearningRecord

## 1. 需求

一张 Card 可以有多条学习记录；一条学习记录只属于一张 Card。这是**一对多关系**。

## 2. 一对多不需要中间表

| 关系 | 做法 | 需要中间表？ |
|---|---|---|
| 一对多 | 在"多"的一方放外键 | 不需要 |
| 多对多 | 新建中间表 | 需要 |

LearningRecord 是"多"的一方，加 `card_id` 外键即可：

```prisma
model LearningRecord {
  id        String   @id @default(uuid())
  cardId    String   @map("card_id")
  action    String
  note      String?
  createdAt DateTime @default(now()) @map("created_at")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@map("learning_records")
}
```

## 3. 数据库里长什么样

**learning_records**:

| id | card_id | action | note |
|---|---|---|---|
| record1 | card1 | view | 第一次看 |
| record2 | card1 | review | 复习了一次 |
| record3 | card2 | view | 看了 Docker |

不需要中间表，每条记录都有明确的 `card_id`。

---

## 附录：Prisma 语法速查卡

| Prisma 写法 | 意思 |
|---|---|
| `model Card {}` | 定义模型（对应数据库表） |
| `enum CardStatus { todo doing done }` | 定义枚举 |
| `String` / `DateTime` / `Json` / `Boolean` / `Int` | 字段类型 |
| `CardStatus` / `CardDifficulty` | 枚举类型 |
| `String?` | 可为空字段 |
| `CardTag[]` | 多条关联记录 |
| `@id` | 主键 |
| `@default(uuid())` | 默认 UUID |
| `@default(now())` | 默认当前时间 |
| `@default(basic)` | 枚举默认值（不带引号） |
| `@default("basic")` | 字符串默认值（带引号） |
| `@unique` | 唯一约束 |
| `@updatedAt` | 更新时间自动刷新 |
| `@map("field_name")` | 字段名映射（单 `@`） |
| `@@map("table_name")` | 表名映射（双 `@`） |
| `@@id([a, b])` | 联合主键 |
| `@relation(fields: [x], references: [y])` | 定义外键关系 |
| `onDelete: Cascade` | 级联删除 |

---

## 当前 Migration 记录

| Migration | 说明 |
|---|---|
| `20260528031623_init` | 初始建表（Card/Tag/CardTag/LearningRecord） |
| `20260528034221_add_demos` | 新增 Demo 表（元数据持久化） |
| `20260528123007_add_card_enums` | difficulty/status 从 String 升级为枚举 |
