// pilipili 零依赖 Mock 服务（Node 内置 http，无需 npm install）。
// 镜像前端 UI 复刻项目的 API 契约：基础路径 /api，统一返回 { code, message, data }。
const http = require('http')
const { URL } = require('url')

const { ok } = require('./src/response')
const routeModules = [
    require('./src/routes/core'),
    require('./src/routes/search'),
    require('./src/routes/user'),
    require('./src/routes/account'),
    require('./src/routes/message'),
    require('./src/routes/creator'),
    require('./src/routes/upload'),
    require('./src/routes/admin'),
    require('./src/routes/review'),
    require('./src/routes/admin-manage')
]
const routes = routeModules.flatMap(m => m.routes)

const PORT = process.env.PORT || 9090

// 解析 multipart/form-data 中的文本字段（演示用，跳过文件字节）
function parseMultipart(buffer, contentType) {
    const result = {}
    const boundary = contentType.split('boundary=')[1]
    if (!boundary) return result
    const sep = Buffer.from('--' + boundary)
    const parts = buffer.split(sep)
    for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n')
        if (headerEnd === -1) continue
        const header = part.slice(0, headerEnd).toString('utf8')
        const nameMatch = header.match(/name="([^"]+)"/)
        if (!nameMatch) continue
        if (/filename="/.test(header)) continue // 跳过文件字段
        let value = part.slice(headerEnd + 4)
        // 去掉尾部 \r\n
        value = value.slice(0, value.length - 2)
        result[nameMatch[1]] = value.toString('utf8')
    }
    return result
}

function parseBody(buffer, contentType) {
    if (!buffer.length) return {}
    if (contentType && contentType.includes('application/json')) {
        try { return JSON.parse(buffer.toString('utf8')) } catch (e) { return {} }
    }
    if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(buffer.toString('utf8'))
        const obj = {}
        for (const [k, v] of params) obj[k] = v
        return obj
    }
    if (contentType && contentType.includes('multipart/form-data')) {
        return parseMultipart(buffer, contentType)
    }
    return {}
}

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Client-Version,X-Platform,X-Trace-Id')
    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }

    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const url = new URL(req.url, `http://${req.headers.host}`)
        let pathname = url.pathname
        if (pathname.startsWith('/api')) pathname = pathname.slice(4) || '/'
        const query = Object.fromEntries(url.searchParams.entries())
        const body = parseBody(buffer, req.headers['content-type'])

        const ctx = { params: {}, query, body }
        let matched = null
        for (const r of routes) {
            if (r.method !== req.method) continue
            const m = pathname.match(r.pattern)
            if (m) { matched = r; ctx.params = m.groups || {}; break }
        }

        const payload = matched ? matched.handler(ctx) : ok(null, 'not implemented')
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.writeHead(200)
        res.end(JSON.stringify(payload))
    })
})

server.listen(PORT, () => {
    console.log(`[pilipili-mock] listening on http://localhost:${PORT}  (API base: /api)`)
})
