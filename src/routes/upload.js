// Day 10：分片上传接口（演示：仅记录分片数，不落盘，不依赖 OSS）。
const { ok } = require('../response')

const uploads = {}

function uploadIdOf(body) {
    return body && (body.uploadId || body.upload_id)
}

const routes = [
    {
        method: 'POST', pattern: /^\/upload\/init$/,
        handler: () => {
            const id = 'up_' + Date.now()
            uploads[id] = { chunks: 0 }
            return ok({ uploadId: id })
        }
    },
    {
        method: 'POST', pattern: /^\/upload\/chunk$/,
        handler: (ctx) => {
            const id = uploadIdOf(ctx.body)
            if (id && uploads[id]) uploads[id].chunks += 1
            return ok(null, 'chunk received')
        }
    },
    {
        method: 'POST', pattern: /^\/upload\/merge$/,
        handler: (ctx) => {
            const id = uploadIdOf(ctx.body)
            const chunks = id && uploads[id] ? uploads[id].chunks : 0
            delete uploads[id]
            return ok({ url: `https://teriteri.oss-cn-heyuan.aliyuncs.com/mock/${id}.mp4`, chunks }, '合并完成')
        }
    }
]

module.exports = { routes }
