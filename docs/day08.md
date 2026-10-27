# Day 8：基础服务 + 搜索与个人空间 API（backend_）

## 目标与产出
- 搭建零依赖 Node HTTP Mock 服务骨架（`server.js` / `src/response.js` / `src/data.js`），与 `UI-` 的 Mock 契约（`{ code, message, data }`、路径不带 `/v1`）完全一致。
- 落地 Day 1~7 核心接口（`core.js`），使前端在 `VUE_APP_USE_MOCK=false` 时整站可跑。
- 新增 Day 8 搜索（`search.js`）与个人空间（`user.js`）接口。

## 具体任务
1. `server.js`：实现 CORS、`/api` 前缀剥离、JSON / form-urlencoded / multipart 文本字段解析、路由分发、未实现接口兜底（返回 `code:200, data:null`，不阻断前端）。
2. `src/response.js`：`ok()` / `fail()` 统一返回。
3. `src/data.js`：内存态种子（频道、热搜、用户、视频池、评论、弹幕、收藏夹）。
4. `src/routes/core.js`：23 个 Day1~7 接口（登录/注册/热搜/推荐/详情/弹幕/评论/收藏/互动等）。
5. `src/routes/search.js`：热搜、搜索计数、搜索联想、视频搜索、用户搜索、搜索词上报。
6. `src/routes/user.js`：用户信息、投稿数、投稿列表、最近点赞、收藏夹视频。

## 涉及目录 / 模块
- `backend_/server.js`、`backend_/src/response.js`、`backend_/src/data.js`
- `backend_/src/routes/{core,search,user}.js`

## 验收标准
- `node server.js` 启动后监听 `:9090`，控制台打印 API base。
- `GET /api/category/getall`、`GET /api/search/video/only-pass?keyword=Vue`、`GET /api/user/info/get-one?uid=16` 均返回 `{code:200,...}`。
- `POST /api/comment/add` 写入并返回新评论（验证 multipart/JSON 双形态）。
- 未实现的路径返回 `code:200, data:null`（兜底，避免前端控制台报错）。

## 前后端依赖与协作
- **契约先行**：本服务定义的路径（如 `/search/video/only-pass`）与 `UI-/client/src/mock/index.js` 中的 Mock 键一一对应，前端切换 Mock 开关即可在“内存 Mock”与“真实服务”间无缝切换。
- **数据同源**：`data.js` 字段结构复刻自前端 mock（封面用 OSS 网络地址、头像用 elemecdn），保证两种模式下页面渲染一致。
- **后续接真实后端**：仅需把 `server.js` 的分发替换为 Spring Boot 实现，前端零改动（仍走 `VUE_APP_API_BASE`）。
