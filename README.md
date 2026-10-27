# pilipili-backend-mock

零依赖（Node 内置 `http`，**无需 `npm install`**）的 Mock 后端服务，镜像 `UI-` 前端 UI 复刻项目的 API 契约。

## 约束对齐
- 不引入 Spring Boot / MySQL / Redis / Elasticsearch / OSS，不写任何 SQL。
- 统一返回结构 `{ code, message, data }`（与前端 `request.js` + `mock/index.js` 完全一致）。
- 基础路径 `/api`，JWT 仅做演示（返回固定 token）。

## 启动

```bash
cd backend_
node server.js
# 默认监听 http://localhost:9090  （API base: /api）
# 自定义端口： PORT=8080 node server.js
```

## 与前端 UI- 的协作（前后端依赖关系）
- `UI-` 默认 `VUE_APP_USE_MOCK=true`，请求被 `client/src/mock/index.js` 拦截，不访问本服务。
- 关闭 Mock 后，前端直接访问本服务：在 `UI-/client/.env.development` 设置
  `VUE_APP_USE_MOCK=false`、`VUE_APP_API_BASE=http://localhost:9090/api`
  （管理端 `UI-/admin` 同理）。
- 前端所有 `get()` / `post()` 调用路径（如 `/search/video/only-pass`）即本服务的路由，二者路径一一对应。
- 本服务是“契约先行”的落地：先有接口路径与字段，前端 UI 才能稳定复刻；后续接真实后端只需替换服务实现，前端无需改代码。

## 目录

```text
backend_/
├── server.js                 # 零依赖 HTTP 服务：CORS / 路由分发 / 请求体解析 / 兜底
├── package.json              # 仅 scripts，无第三方依赖
├── src/
│   ├── response.js           # ok() / fail() 统一返回
│   ├── data.js               # 内存态种子数据（用户/视频/评论/弹幕/收藏夹…）
│   └── routes/
│       ├── core.js           # Day1~7 核心接口
│       ├── search.js         # Day8 搜索
│       └── user.js           # Day8 个人空间
└── docs/day08.md ... day14.md
```
