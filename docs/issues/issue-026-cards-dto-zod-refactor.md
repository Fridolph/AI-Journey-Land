# Issue 开发日志：Cards CRUD 从普通 DTO 迁移到 Zod DTO + 枚举

## Issue 信息

- **关联 Issue**：#25 PostgreSQL + Admin CRUD 后续
- **分支**：`learn/cards-from-zero`
- **目标**：将 Cards CRUD 的 DTO 校验从普通 NestJS class 升级为 Zod schema，同时将 `difficulty` / `status` 从 String 字段改为 PostgreSQL 枚举

## 开发范围

### 1. 数据库层：String → Enum

**Prisma Schema** (`schema.prisma`)：

```diff
- difficulty String @default("basic")
- status     String @default("todo")
+ difficulty CardDifficulty @default(basic)
+ status     CardStatus     @default(todo)
```

新增两个 Prisma enum：

```prisma
enum CardStatus { todo, doing, done }
enum CardDifficulty { basic, medium, advanced }
```

Migration 自动生成：

- `CREATE TYPE "CardStatus" AS ENUM (...)`
- `CREATE TYPE "CardDifficulty" AS ENUM (...)`
- `ALTER TABLE` 将列类型从 `TEXT` 改为对应的 enum 类型

### 2. DTO 层：普通 class → Zod schema

| 文件                     | 旧方案                                       | 新方案                                                                  |
| ------------------------ | -------------------------------------------- | ----------------------------------------------------------------------- |
| `dto/create-card.dto.ts` | 普通 class，字段声明的类型不可靠             | `createZodDto(createCardSchema)`，运行时校验                            |
| `dto/query-cards.dto.ts` | 原名 `query-card.dto.ts`，字段全是 `string?` | `createZodDto(queryCardsSchema)`，`z.coerce.number()` 处理 query string |
| `dto/update-card.dto.ts` | 普通 class                                   | `createZodDto(updateCardSchema)`，`.refine()` 确保至少一个字段          |
| `dto/card.schema.ts`     | **不存在**                                   | **新增** 集中管理 enum schemas + 基础字段                               |

### 3. Service 层：简化边界判断

```diff
- const page = Math.max(Number(query.page) || 1, 1);
- const pageSize = Math.min(Math.max(Number(query.pageSize) || 10, 1), 100);
+ const page = query.page;
+ const pageSize = query.pageSize;
```

因为 Zod 已经在 DTO 层处理了 `coerce` + `min` + `max` + `default`，Service 不再需要防御式编程。

### 4. 非目标

- 不改 Controller 路由结构
- 不改 Service 业务逻辑（仅删除冗余边界判断）
- 不改前端 Admin 页面

## 关键文件

| 文件                                                | 变更类型    | 说明                                    |
| --------------------------------------------------- | ----------- | --------------------------------------- |
| `prisma/schema.prisma`                              | 修改        | difficulty/status 改为枚举              |
| `prisma/migrations/...add_card_enums/migration.sql` | 新增        | 创建枚举 + 修改列类型                   |
| `src/cards/dto/card.schema.ts`                      | **新增**    | 集中定义所有 Zod schema                 |
| `src/cards/dto/create-card.dto.ts`                  | 重写        | Zod DTO + `.strict()`                   |
| `src/cards/dto/query-cards.dto.ts`                  | 重写+重命名 | Zod DTO + `z.coerce` + sortBy/sortOrder |
| `src/cards/dto/update-card.dto.ts`                  | 重写        | Zod DTO + `.refine()`                   |
| `src/cards/dto/query-card.dto.ts`                   | 删除        | 被 query-cards.dto.ts 替代              |
| `src/cards/cards.controller.ts`                     | 修改        | import 路径更新                         |
| `src/cards/cards.service.ts`                        | 修改        | 删除冗余 Math.max/Math.min              |

## 自测

（待提交前执行）

```bash
pnpm typecheck
pnpm test
```

## 学习收获

详见 `docs/demos/card-learning-demo/DTO与Zod校验.md`

- `nestjs-zod` + `createZodDto` 的使用方式
- `z.coerce.number()` 处理 query string 传参
- `.strict()` 拒绝未声明字段
- `.refine()` 自定义校验规则
- Prisma enum 与 PostgreSQL enum 的对应
- 为什么 DTO 校验要从 class 升级到 zod
