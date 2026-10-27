// Day 8：个人空间接口（用户信息、投稿、点赞、收藏夹）。
const { ok } = require('../response')
const data = require('../data')

const routes = [
    {
        method: 'GET', pattern: /^\/user\/info\/get-one$/,
        handler: (ctx) => {
            const uid = Number(ctx.query.uid) || 16
            return ok(data.SPACE_USERS[uid] || data.SPACE_USERS[16])
        }
    },
    {
        method: 'GET', pattern: /^\/video\/user-works-count$/,
        handler: (ctx) => {
            const uid = Number(ctx.query.uid) || 16
            return ok(data.VIDEOS.filter(v => v.video.uid === uid).length)
        }
    },
    {
        method: 'GET', pattern: /^\/video\/user-works$/,
        handler: (ctx) => {
            const uid = Number(ctx.query.uid) || 16
            const list = data.VIDEOS.filter(v => v.video.uid === uid)
            return ok({ count: list.length, list: list.slice() })
        }
    },
    {
        method: 'GET', pattern: /^\/video\/user-love$/,
        handler: () => ok(data.VIDEOS.slice(0, 6))
    },
    {
        method: 'GET', pattern: /^\/video\/user-collect$/,
        handler: (ctx) => {
            const fid = Number(ctx.query.fid) || 1
            return ok(data.VIDEOS.slice(2, 8).map(item => ({
                ...data.clone(item),
                info: { vid: item.video.vid, fid, time: '2026-10-20 20:30' }
            })))
        }
    }
]

module.exports = { routes }
