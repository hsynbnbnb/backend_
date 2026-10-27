# Day 9：账号中心与消息中心 API（backend_）

## 目标与产出
- 新增 `src/routes/account.js`：账号资料读取 / 修改、密码修改、安全设置、头像更新。
- 新增 `src/routes/message.js`：消息列表（回复/@/赞/系统/动态）、私聊列表、私聊详情、发送私聊、已读。

## 具体任务
1. 账号中心：资料读写（昵称/性别/简介）、改密、绑定设置、头像。
2. 消息中心：5 类动态消息（feed）与私聊（whisper）两类数据，私聊支持按 `chatId` 拉取详情与发送。
3. `server.js` 挂载 `account` / `message` 路由。

## 涉及目录 / 模块
- `backend_/src/routes/account.js`、`backend_/src/routes/message.js`、`backend_/server.js`

## 验收标准
- `GET /api/user/account/info`、`GET /api/user/account/setting` 返回账号与设置。
- `POST /api/user/account/info` 修改后再次 GET 可见新昵称。
- `GET /api/message/list/reply`、`GET /api/message/whisper/list`、`GET /api/message/whisper/detail?chatId=101` 返回数据。
- `POST /api/message/whisper/send` 写入并返回新消息。

## 前后端依赖与协作
- 对应 `UI-` Day9 的 `AccountView` 与 `MessageView`：账号页表单提交 → `POST /user/account/info`；消息页 Tab 切换 → `GET /message/list/:type`，私聊窗口 → `GET /message/whisper/detail` + `POST /message/whisper/send`。
- 私聊实时性由前端 `WebSocket`（day03 store 中 `connectWebSocket`）兜底，后端仅提供历史与发送落库（此处内存态）。
