// Day 8：搜索与个人空间相关接口（搜索部分）。
const { ok } = require('../response')
const data = require('../data')

function decode(s) {
    return decodeURIComponent(String(s || ''))
}

const routes = [
    {
        method: 'GET', pattern: /^\/search\/hot\/get$/,
        handler: () => ok(data.TRENDINGS)
    },
    {
        method: 'GET', pattern: /^\/search\/count$/,
        handler: (ctx) => {
            const keyword = decode(ctx.query.keyword)
            const video = keyword
                ? data.VIDEOS.filter(v => v.video.title.includes(keyword) || v.user.nickname.includes(keyword)).length
                : data.VIDEOS.length
            const user = keyword
                ? Object.values(data.SPACE_USERS).filter(u => u.nickname.includes(keyword) || u.username.includes(keyword)).length
                : Object.values(data.SPACE_USERS).length
            return ok({ video, user })
        }
    },
    {
        method: 'GET', pattern: /^\/search\/word\/get$/,
        handler: (ctx) => {
            const keyword = decode(ctx.query.keyword)
            return ok(keyword ? [`${keyword} 视频`, `${keyword} 用户`] : [])
        }
    },
    {
        method: 'GET', pattern: /^\/search\/video\/only-pass$/,
        handler: (ctx) => {
            const keyword = decode(ctx.query.keyword)
            const list = keyword
                ? data.VIDEOS.filter(v => v.video.title.includes(keyword) || v.user.nickname.includes(keyword))
                : data.VIDEOS.slice()
            return ok(list.length ? list : data.VIDEOS.slice(0, 10))
        }
    },
    {
        method: 'GET', pattern: /^\/search\/user$/,
        handler: (ctx) => {
            const keyword = decode(ctx.query.keyword)
            const list = Object.values(data.SPACE_USERS).filter(u =>
                !keyword || u.nickname.includes(keyword) || u.username.includes(keyword))
            return ok(list.length ? list : Object.values(data.SPACE_USERS).slice(0, 5))
        }
    },
    {
        method: 'POST', pattern: /^\/search\/word\/add$/,
        handler: () => ok(null, 'OK')
    }
]

module.exports = { routes }
