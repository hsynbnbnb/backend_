# Day 10：创作中心与视频上传 API（backend_）

## 目标与产出
- 新增 `src/routes/creator.js`：创作中心概览、稿件列表、热门标签、分类列表、投稿提交。
- 新增 `src/routes/upload.js`：分片上传 `init` / `chunk` / `merge`（内存态记录，不落盘、不依赖 OSS）。

## 具体任务
1. 创作中心：概览统计、稿件管理列表、热门标签候选、投稿用分类树、投稿提交。
2. 上传：模拟大文件分片——前端先 `init` 拿 `uploadId`，逐片 `chunk` 上报，最后 `merge` 拿文件地址。
3. `server.js` 挂载 `creator` / `upload` 路由。

## 涉及目录 / 模块
- `backend_/src/routes/creator.js`、`backend_/src/routes/upload.js`、`backend_/server.js`

## 验收标准
- `GET /api/creator/overview`、`GET /api/creator/videos`、`GET /api/creator/tags/hot`、`GET /api/category/list` 返回数据。
- `POST /api/upload/init` 返回 `uploadId`；`POST /api/upload/chunk` 计数；`POST /api/upload/merge` 返回合并地址。
- `POST /api/video/submit` 返回新稿件 `vid` 与 `status`。

## 前后端依赖与协作
- 对应 `UI-` Day10 的 `PlatformView`（创作中心）、`PlatformUpload` / `VideoUpload`（上传表单与分片进度）、`TagInput`、`CategorySelect`。
- 前端 `VideoUpload` 用 `spark-md5` 计算文件指纹做秒传/断点续传，`upload.js` 的 `init/chunk/merge` 即后端落点；`CategorySelect` 用 `GET /category/list` 的二级分类树；`TagInput` 用 `GET /creator/tags/hot` 做联想。
