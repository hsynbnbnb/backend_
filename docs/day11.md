# Day 11：管理端鉴权与框架 API（backend_）

## 目标与产出
- 新增 `src/routes/admin.js`：管理员登录、个人信息、菜单、仪表盘统计、登出。

## 具体任务
1. 登录：演示账号 `admin` / 任意密码返回 `token` 与 `admin` 信息（真实后端应校验）。
2. 框架：个人信息、菜单树（8 个一级菜单）、仪表盘统计、登出。

## 涉及目录 / 模块
- `backend_/src/routes/admin.js`、`backend_/server.js`

## 验收标准
- `POST /api/admin/account/login` 返回 `{ token, admin }`。
- `GET /api/admin/personal/info`、`GET /api/admin/menu/list`、`GET /api/admin/dashboard/stats` 返回数据。
- `POST /api/admin/account/logout` 返回已退出。

## 前后端依赖与协作
- 对应 `UI-` Day11 的 `LoginVue`（登录提交 → `POST /admin/account/login`，token 存 `localStorage`）、`IndexVue`（侧边栏 → `GET /admin/menu/list`、顶栏 → `GET /admin/personal/info`、仪表盘 → `GET /admin/dashboard/stats`）。
- 管理端同样受 `VUE_APP_USE_MOCK` 控制：`UI-/admin/.env.development` 关闭 Mock 即走本服务。
