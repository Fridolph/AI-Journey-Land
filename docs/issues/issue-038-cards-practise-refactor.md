# Issue #38 开发日志：Cards 模块自主重构

## Issue 创建信息

- 背景: 旧 cards 模块由 AI 生成，学习价值有限。通过 cards-practise 练习场独立实现并正式接管
- 目标: 从 cards-practise 练习到正式 cards 模块，删除旧代码
- 非目标: 不新增功能、不改 Prisma schema
- 验收标准: typecheck 通过、test 通过、CRUD 全链路可用

## 基本信息

- Issue: <https://github.com/Fridolph/AI-Journey-Land/issues/38>
- 分支: `feat/#38-cards-practise-refactor`
- 类型: `refactor`
- 状态: review-ready

## 开发范围

- 本次要做:
  - 删除 apps/api/src/cards/（旧 AI 生成代码）
  - cards-practise/ → cards/ 目录重命名
  - 全部类名/DTO 名/路由前缀同步修改
  - app.module.ts 注册新模块
- 本次不做:
  - 新增功能
  - Prisma schema 变更

## 关键变更

- 目录: cards-practise/ → cards/
- 类名: CardsPractiseService → CardsService 等
- 路由: /api/cards-practise → /api/cards
- 文件名: cards-practise.*.ts → cards.*.ts
- app.module.ts: 删除 CardsPractiseModule，保留 CardsModule

## 批改中发现并修复的问题

1. service.findAll: orderBy 字段写反 ([query.sortOrder] → [query.sortBy])
2. service.remove: 缺 await
3. controller.delete: @Param() 缺参数名
4. create DTO: category 缺 optional，status/difficulty 缺 default
5. update DTO: 字段全必填，缺 refine 校验
6. service: try/catch 滥用吞错误

## 自测记录

```bash
pnpm typecheck   # 4/4 通过
pnpm test        # 51/51 通过
```

## 人工验证

- POST /api/cards → 201 ✅
- GET /api/cards → 200 ✅（分页列表）
- GET /api/cards/:id → 200 ✅
- PATCH /api/cards/:id → 200 ✅（部分更新只改 title）
- DELETE /api/cards/:id → 200 ✅
- 重复 DELETE → 404 ✅（NotFoundException 工作正常）

## 合并与关闭

- PR: 待创建
- Commit: feat(#38): cards-practise 重命名为 cards
- 合并到 dev: squash merge
- Issue 关闭时间: 待回写后关闭
