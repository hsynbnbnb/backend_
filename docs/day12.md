# Day 12：管理端视频审核 API（backend_）

## 目标与产出
- 新增 `src/routes/review.js`：审核计数、审核分页列表、视频详情、修改审核状态、预览。

## 具体任务
1. 审核计数：按状态（待审/通过/驳回）汇总。
2. 审核列表：分页 + 状态过滤，返回视频概要 + 上传者 + 状态。
3. 视频详情：复用 `data.VIDEOS`，附带 `reviewStatus`。
4. 修改状态：`POST /admin/video/review`（vid + status + reason），写回内存态。

## 涉及目录 / 模块
- `backend_/src/routes/review.js`、`backend_/server.js`

## 验收标准
- `GET /api/admin/video/review/count` 返回 `{ pending, approved, rejected }`。
- `GET /api/admin/video/review/list?page=1&size=10&status=0` 返回分页列表（含 total/hasNext）。
- `GET /api/admin/video/detail?vid=16` 返回详情与 `reviewStatus`。
- `POST /api/admin/video/review` 修改后，`GET /api/admin/video/review/count` 对应计数变化。

## 前后端依赖与协作
- 对应 `UI-` Day12 的 `VideoReview`（列表 + 筛选 + 分页 + 计数徽标）与审核详情 `VideoDetail`（预览 + 通过/驳回）。
- 前端审核动作 → `POST /admin/video/review`；列表/计数/详情 → 对应 GET。
- 真实后端此处应做 RBAC + 操作日志 + 参数脱敏（API 设计文档 1.2 第 6 条），本项目用内存态演示流程。
