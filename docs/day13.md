# Day 13：管理端全路由与兜底（backend_）

## 目标与产出
- 新增 `src/routes/admin-manage.js`：内容 / 数据 / 举报 / 申诉 / 用户 / 角色管理列表接口。
- 确认 `server.js` 已对未实现接口兜底（返回 `{ code:200, data:null }`），页面不因接口缺失报错。

## 具体任务
1. 内容管理：分页列表（复用视频池 + 状态）。
2. 数据统计：DAU / 新增视频 / 新增用户 / 播放趋势。
3. 举报 / 申诉：列表（含状态）。
4. 用户 / 角色：用户列表 + 角色权限列表。

## 涉及目录 / 模块
- `backend_/src/routes/admin-manage.js`、`backend_/server.js`

## 验收标准
- `GET /api/admin/content/list`、`/api/admin/data/overview`、`/api/admin/report/list`、`/api/admin/appeal/list`、`/api/admin/user/list`、`/api/admin/role/list` 均返回 `code:200`。
- 任意未实现的 `/api/xxx` 路径返回 `code:200, data:null`（兜底，不 500）。

## 前后端依赖与协作
- 对应 `UI-` Day13 的通用管理页 `AdminTableView`（按 `meta.endpoint` 拉取不同列表），覆盖内容/数据/举报/申诉/用户/角色六个菜单。
- 真实后端应在此层加 RBAC + 操作日志 + 参数脱敏（API 设计文档 1.2 第 6 条）；本项目用内存态演示。
