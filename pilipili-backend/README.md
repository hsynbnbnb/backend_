# pilipili-backend

> **源码重建版（2026-11-12）**：本工程位于 `backend_/pilipili-backend/`。此前磁盘上只剩
> `target/classes/*.class` 与 fat jar，`pom.xml` 和全部 `src/` 源码已丢失；本版从历史交付记录
> 与编译资源完整恢复，并已**从源码重新构建、启动并跑通 72 端点冒烟**
> （`501=0`、系统异常 `500=0`、并发 120 请求全 `code:200`）。
> 顶层 `pilipili-backend/` 与 `pzhan/pilipili-backend/` 下的同名目录是历史编译产物副本，
> **本次交付以本目录为准**。

仿 B 站 pilipili **PC 端 + 移动端共用的后端**，契约 v1：`/api` + `{code, message, data}`。
技术栈：Spring Boot 2.7.18 / Java 17 / MySQL 8+ / JdbcTemplate / Maven。

## ⚠️ PC 联调前置条件：先启动后端，再 `npm run serve`

`UI-/client/.env.development` 是 `VUE_APP_USE_MOCK=false`，**所有请求都经 devServer 代理转发到 `http://localhost:9090`**。如果后端没启动，前端编译照样成功，但控制台会刷：

```
DONE  Compiled successfully in 14827ms
App running at: - Local: http://localhost:8787/
Proxy error: Could not proxy request /category/getall ... (ECONNREFUSED)
```

`ECONNREFUSED` 只表示 **9090 没有进程在监听**，不是前端代码、代理配置或 CORS 的问题。正确启动顺序：

```
1) MySQL 3306 已启动，且已存在 `pilipili` 库（全新环境见「快速开始」第 0 步）
2) 后端 9090  ← 最容易漏的一步
3) PC 端 npm run serve（8787）
```

**一键启动（推荐）**：双击 `start-backend.cmd`，按提示输入 MySQL 密码，保持窗口开着。脚本会显式传 `--server.port=9090`（避免环境变量覆盖 yml），密码只在当前进程内、不落盘。

PowerShell 手动启动等价写法：

```powershell
$env:PILIPILI_DB_PASSWORD="<你的MySQL密码>"
cd D:\软件工程\backend_\pilipili-backend
& "D:\datagrip\DataGrip 2022.3.3\jbr\bin\java.exe" -jar target\pilipili-backend-1.0.0.jar --server.port=9090
```

启动后验证：

```bash
curl http://localhost:9090/api/health
# {"code":200,...,"status":"UP","database":"MySQL","contractSeeds":76,...}
```

> **后端起来后不需要重启 devServer**：`http-proxy-middleware` 每次请求都重新建连，直接刷新浏览器即可恢复；`501` 与 `404` 才需要查契约表。`npm run serve` 那个终端窗口保持不动。
>
> 关掉后端窗口（或结束 java 进程）服务就停，下次联调需重新执行第 2 步——这是该报错反复出现的原因。

## 快速开始（3 步）

```bash
# 0) 仅全新环境需要：先建空库（任意 MySQL 客户端执行一次即可）
#    CREATE DATABASE IF NOT EXISTS pilipili DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
#    本机已存在 pilipili 库，可跳过。JDBC URL 固定连这个库，库不存在会报 Unknown database。

# 1) 确认 MySQL 已启动（本机 3306），设置密码环境变量（不要写进代码库）
export PILIPILI_DB_PASSWORD=<你的MySQL密码>       # Windows PowerShell: $env:PILIPILI_DB_PASSWORD="<pwd>"

# 2) 构建（需要 JDK 17 + Maven）
mvn -B -o -DskipTests clean package

# 3) 启动（自动建表灌种子，幂等可重复启动）
java -jar target/pilipili-backend-1.0.0.jar --server.port=9090
```

### 从源码构建（本机：Maven / Java 均不在 PATH）

本机 Maven 随 IntelliJ IDEA 安装、JDK 17 随 DataGrip 的 JBR 提供，用绝对路径即可；
`-o` 表示离线复用本地 `~/.m2` 缓存（已含 Spring Boot 2.7.18 全套依赖）。

```bash
export JAVA_HOME="/d/datagrip/DataGrip 2022.3.3/jbr"
export PATH="$JAVA_HOME/bin:$PATH"
cd "D:/软件工程/backend_/pilipili-backend"
"D:/idea/IntelliJ IDEA Community Edition 2025.2.2/plugins/maven/lib/maven3/bin/mvn" -B -o -DskipTests clean package
```

PowerShell 等价写法：

```powershell
$env:JAVA_HOME = "D:\datagrip\DataGrip 2022.3.3\jbr"
Set-Location "D:\软件工程\backend_\pilipili-backend"
& "D:\idea\IntelliJ IDEA Community Edition 2025.2.2\plugins\maven\lib\maven3\bin\mvn.cmd" -B -o -DskipTests clean package
```

构建产物：`target/pilipili-backend-1.0.0.jar`（Spring Boot fat jar，约 25 MB，可直接 `java -jar`）。
只改了资源或契约种子、不想全量重编时，也可省略 `clean`。

启动后验证：

```bash
curl http://localhost:9090/api/health
# {"code":200,"message":"OK","data":{"status":"UP","database":"MySQL","contractSeeds":76,"migratedHandlers":45,"videos":30,"products":10}}
```

> **PC 端联调状态（2026-11-09）**：`UI-/client/.env.development` 已切为
> `VUE_APP_USE_MOCK=false` + `VUE_APP_API_BASE=/api`，`request.js` 按开关分流 mock / 真实 axios，
> 并预留了 `put()` / `del()` 对应本服务的 `PUT|DELETE /cart/{id}`。
> `vue.config.js` 的代理指向 `:9090` 且带 pathRewrite，后端 `ApiPrefixFilter` 已兼容，两种写法都能用。
> 已按前端真实调用路径跑完 72 个端点冒烟：`code:501` 未登记接口为 0。
> **回退纯 mock 演示**：把 `VUE_APP_USE_MOCK` 改回 `true` 并重启 devServer，业务代码零改动。
> 移动端仍为纯 mock，尚未接 API 层。

## 排错：接口间歇性 `{"code":500,"message":"系统异常"}`

**现象**：启动初期正常，运行一段时间后同一端点时好时坏；后端日志出现
`java.sql.SQLException: No database selected`（SQLState `3D000` / error `1046`）。

**根因**：早期 `application.yml` 的 JDBC URL 是 `jdbc:mysql://localhost:3306/?...`，**没带库名**，
只有 `schema.sql` 里执行 `USE pilipili` 的那一条初始化连接拥有默认 schema。Hikari 池
(`maximum-pool-size: 10`) 中其余连接没有默认库，请求随机分配到它们就报 1046 —— 所以表现为
「重启后好一阵、之后随机 500」，与前端、代理、CORS 都无关。

**修复（已完成 2026-11-10）**：默认 URL 改为 `jdbc:mysql://localhost:3306/pilipili?...`，
每条连接天生带默认库；已离线同步进 `target/pilipili-backend-1.0.0.jar`。验证：
120 个并发请求全部 `code:200`；72 端点全量冒烟 `501=0`、系统异常 `500=0`。

> 自定义 `PILIPILI_DB_URL` 时**必须保留 `/pilipili` 库名**，否则该问题会复现。
> 全新环境需先按「快速开始」第 0 步建空库（库不存在会报 `Unknown database`）。

## 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `PILIPILI_DB_URL` | `jdbc:mysql://localhost:3306/pilipili?useUnicode=true&...` | **必须带库名 `pilipili`**；见下方「间歇性 500」 |
| `PILIPILI_DB_USER` | `root` | 数据库用户 |
| `PILIPILI_DB_PASSWORD` | 空（**必填**） | 仅通过环境变量传入，勿写入配置文件 |
| `PILIPILI_PORT` | `9090` | 服务端口 |
| `PILIPILI_CORS_ORIGINS` | `localhost:8787,8788,5173,4173` | 显式来源，逗号分隔 |
| `PILIPILI_JWT_SECRET` | 开发占位值 | 生产必须替换为长随机串 |

环境变量样例见 `.env.example`，真实 `.env` 已在 `.gitignore` 中。

## 目录结构

```
src/main/java/com/pilipili/backend/
├── common/         Result / ErrorCode / BusinessException / GlobalExceptionHandler
├── config/         CorsConfig / ApiPrefixFilter / JwtService / JwtInterceptor / WebConfig
├── controller/     ApiController（统一 /api/** 入口 + /api/health）
├── service/        ApiContext / AuthService / ContentService / CommerceService / SocialService / ContractDispatcher
├── repository/     DataRepository / SeedRepository / SeedLoader
└── BackendApplication.java
src/main/resources/
├── application.yml         配置（全部环境变量化）
├── schema.sql              18 张表，可重复执行
├── data.sql                与两端对齐的种子数据，INSERT IGNORE 幂等
└── contract-seed.json      旧 backend_ 的 71 条契约响应快照 + 5 条预留接口 = 76 条
docs/接口契约v1对照表.md      ← 交付给后端开发的唯一依据
docs/接口入参清单.md          ← 自动生成：85 端点逐项入参 + 参数字典
docs/pilipili.postman_collection.json ← 自动生成：Postman v2.1，90 请求 / 76 响应样例
scripts/generate-contract.mjs ← 交付物生成器（node 直接跑，无第三方依赖）
start-backend.cmd            ← Windows 一键启动（联调前先跑这个，详见上方前置条件）
```

## 正式移交版 v1.1（2026-11-09）

后端接手按此顺序读：

1. **`docs/接口契约v1对照表.md`** —— 唯一开发依据，共 **14 节**：全局约定、85 个端点、数据库表、后端 TODO、冒烟验收、PC 联调、**请求参数规格、字段级数据字典、异常与错误码规范（含 HTTP 恒 200 / 异常处理链 / 场景矩阵）、鉴权矩阵、写操作状态机、已确认产品口径、接口日志与可观测性规范、层与层传输规范**。
   - **v1.1 新增补齐**：第 9 节异常处理链、第 13 节「所有接口日志」（access log 字段、级别、脱敏、审计、traceId、分级矩阵、验收口径）、第 14 节「层与层传输规范」（调用链、各层职责与禁止事项、命名转换、事务边界、自检清单）。
   - 第 13 / 14 节及事务注解是**规范已定、代码待实现**，已在文件内逐处标注，不冒充已完成。
2. **`docs/接口入参清单.md`** + **`docs/pilipili.postman_collection.json`** —— 从真实代码自动抽取，Collection 可直接导入 Postman（按模块 20 个文件夹、90 个请求、76 个带契约响应样例）。
3. **`交付文档/产品口径决策结论（已确认）.md`** —— 需求方已拍板的产品口径。
4. **`交付文档/pilipili前后端对接与问题整改解决方案.html`** —— 96 条问题整改矩阵 + 第九节联调 / 第十节正式移交。

刷新生成物（改了端点或前端调用点后重跑）：

```bash
node scripts/generate-contract.mjs
```

**已确认并落地**：B1 —— PC 顶栏个人中心面板新增「我的订单」→ `/orders`；B2 —— 购物车保留演示预置，契约标记 `seed_demo: true`，正式环境关闭并恢复空购物车。

**交付范围**：本次仅 **PC 客户端 + 后端**；`UI-/admin` 与 `Mobileapp` 仍为 mock，属下一阶段，不要求本次供数。

## 设计说明

- **分层**：Controller 只解析 HTTP，Service 承载业务，Repository 只做 SQL；服务层不依赖 Servlet API。**完整层间载体、职责边界、命名转换、事务边界与新增端点自检清单见对照表第 14 节**。
- **异常**：HTTP 状态恒 200，业务状态走 body.code；异常统一由 `GlobalExceptionHandler` 转 `Result.fail`，不返回堆栈。分类、场景矩阵与抛出规范见对照表第 9 节。
- **日志**：当前仅 7 条 log 语句、纯文本 console 输出，无 traceId / 耗时 / 业务 code / 审计 / 脱敏。**规范见对照表第 13 节，实现待落地**，迁移时按 13.8 顺序补齐。
- **契约分发**：已迁移端点走真实 SQL；未迁移端点读 `contract_seed` 表；都没登记则抛 `code:501`，
  **不再静默返回 200 + null**（旧 `backend_/server.js:91` 的坑），前端能立刻发现漏接口。
- **幂等初始化**：`spring.sql.init.mode=always` + 全部 `IF NOT EXISTS` / `INSERT IGNORE` / 唯一键；
  已实测二次重启不产生重复数据，用户写入的订单/购物车不会丢。
- **编码**：`spring.sql.init.encoding=UTF-8` 显式指定，避免 Windows 中文环境按 GBK 解码种子 SQL 导致乱码。
- **鉴权阶段**：JWT 已签发/校验，但拦截器当前为**宽松模式**（无 token 按 uid=1 放行），
  目的是不打断既有前端联调；上线前必须收紧（见对照表第 4 节）。

## 已知限制 / 待办

- `contract_seed` 中「待迁移」端点返回的是静态契约样例，不是真实业务写入 → 见对照表第 4 节。
- 76 条种子里有 **5 条是 2026-11-09 为 PC 联调补的预留接口**（`partition/list`、`user/account/logout`、`comment/reply/get-more`、`danmu/delete`、`video/coin`，module 以 `reserved:` 开头）：有真实前端调用点，但仍是静态样例，需后端按真实 SQL 实现。
- 订单状态机、动态互动、弹幕/IM WebSocket、文件上传、短信验证码尚未实现。
- 结构化日志 / traceId / 审计日志 / 脱敏 / 慢请求告警与 `@Transactional` 事务注解：**规范已定（对照表 13、14 节），代码尚未实现**。
- 密码明文、固定验证码 `123456`、JWT 宽松校验仅适用于本地演示。
- 端口若被环境变量 `SERVER_PORT` / `SERVER__PORT` 覆盖，用 `--server.port=9090` 显式指定。

## 相关文档

- `交付文档/pilipili前后端对接与问题整改解决方案.html` —— 总体方案 + 96 条走查问题整改矩阵 + 第九节 PC 联调收尾验收 + 第十节正式移交
- `交付文档/pilipili两端用户走查问题清单.html` —— 原始走查报告
- `交付文档/产品口径决策结论（已确认）.md` —— 已拍板的产品口径
- `docs/接口契约v1对照表.md` —— **唯一开发依据**，端点 / 入参 / 字段 / 异常与错误码 / 鉴权 / 状态机 / 日志规范 / 层间传输规范
- `docs/接口入参清单.md` · `docs/pilipili.postman_collection.json` —— 自动生成的入参与可导入请求集
