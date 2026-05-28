# Issue #25 开发日志：PostgreSQL + Admin CRUD + DB 验证

## 开发目标

验证 PostgreSQL 连接可用，搭建 Admin CRUD 页面管理 Demo 和 Card，完成前后端→数据库完整闭环。

## 开发过程

### 1. PostgreSQL 连接验证

- Docker Compose 启动 `postgres:17-alpine`，端口映射 `15432:5432`
- Prisma 7 初始化：`npx prisma init` → `prisma.config.ts` + `schema.prisma`
- **踩坑**：Prisma 7 的 `PrismaClient` 构造函数与 v5/v6 完全不同
  - `super()` 空参 → `PrismaClientInitializationError`（需要一个 non-empty options）
  - `super({ datasourceUrl })` → `PrismaClientConstructorValidationError`（Unknown property）
  - 正确方式：安装 `@prisma/adapter-pg`，用 `new PrismaPg({ connectionString })` 创建 adapter，传入 `super({ adapter })`
- Seed 脚本：`prisma/seed.ts` 用 `dotenv` 加载 `.env`，upsert 3 个已有 Demo

### 2. Demos 数据从内存迁移到 PostgreSQL

- Prisma schema 新增 `Demo` model，JSONB 存储 `tags`/`rolePresets`/`sourceFiles` 等复杂字段
- `DemosService.listDemos()` 从 `prisma.demo.findMany()` 读取，按 `category` 分组
- `DemosService.getDemo()` 从 DB 读取单条
- DB 不可用时 fallback 空数组，不影响服务启动

### 3. Admin CRUD 页面

- `/admin` 路由，Tab 切换 Demo / Card 管理
- Demo 管理：创建/编辑/删除
- Card 管理：创建/编辑/删除/添加学习记录（Popover）
- 所有操作有 Toast 通知反馈
- DB 连接状态实时展示（健康检查按钮）

### 4. API 扩展

- `POST /api/demos` — 创建 Demo
- `PATCH /api/demos/:id` — 更新 Demo
- `DELETE /api/demos/:id` — 删除 Demo
- Cards CRUD 已有完整端点

## 自测结果

- `pnpm typecheck` ✅
- `pnpm test` ✅（全部通过）
- Admin 页面手动验证：
  - PostgreSQL 连接状态 ✅
  - Demo 列表加载 ✅
  - 创建/编辑/删除 Demo ✅
  - 创建/编辑/删除 Card ✅
  - 添加学习记录 ✅
  - 首页 catalog 正常展示 ✅

## 遇到的关键问题

| 问题                            | 根因                               | 解决                                  |
| ------------------------------- | ---------------------------------- | ------------------------------------- |
| PrismaClient 启动报错           | Prisma 7 构造函数 API 变更         | 使用 `@prisma/adapter-pg`             |
| Seed 读取不到 DATABASE_URL      | tsx 不自动加载 .env                | 安装 dotenv, `import 'dotenv/config'` |
| schema.prisma 报 "invalid line" | Card/Demo model 合并时产生重复字段 | 手写清理 schema                       |
| API List 返回空                 | DemosService 未注入 PrismaService  | 添加 `@Inject(PrismaService)`         |

## 提交

`d1a86bd` feat(#24): Demos 数据持久化到 PostgreSQL + Seed 脚本
