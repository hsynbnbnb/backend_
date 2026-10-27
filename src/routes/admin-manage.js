// Day 13：管理端全路由（内容 / 数据 / 举报 / 申诉 / 用户 / 角色）+ 兜底。
// 未实现接口由 server.js 的 catch-all 统一返回 { code:200, data:null }，前端不再报错。
const { ok } = require('../response')
const data = require('../data')

const CONTENT = data.VIDEOS.slice(0, 15).map((v, i) => ({
    vid: v.video.vid, title: v.video.title, coverUrl: v.video.coverUrl, uid: v.video.uid,
    nickname: v.user.nickname, status: i % 4 === 0 ? 0 : 1, uploadDate: v.video.uploadDate, play: v.stats.play
}))

const REPORTS = Array.from({ length: 8 }, (_, i) => ({
    id: 100 + i, type: ['视频', '评论', '私聊'][i % 3], targetId: 10 + i,
    reason: ['违规内容', '人身攻击', '垃圾广告'][i % 3], reporter: '用户' + (i + 1),
    status: i % 3 === 0 ? 0 : 1, createTime: `2026-10-${String(10 + i).padStart(2, '0')} 10:00`
}))

const APPEALS = Array.from({ length: 6 }, (_, i) => ({
    id: 200 + i, vid: 16 + i, reason: '误判申诉', status: i % 2,
    createTime: `2026-10-${String(20 + i).padStart(2, '0')} 14:00`
}))

const USERS = data.UPLOADERS.concat([data.PERSONAL_USER]).map((u, i) => ({
    uid: u.uid, nickname: u.nickname, username: u.username, role: u.role || 0,
    state: u.state || 0, regTime: `2026-0${i + 1}-01`
}))

const ROLES = [
    { id: 1, name: '超级管理员', desc: '全部权限', permissions: ['*'] },
    { id: 2, name: '内容审核员', desc: '审核视频/评论', permissions: ['review:video', 'review:comment'] },
    { id: 3, name: '普通运营', desc: '查看数据', permissions: ['data:view'] }
]

const routes = [
    {
        method: 'GET', pattern: /^\/admin\/content\/list$/,
        handler: (ctx) => {
            const page = Number(ctx.query.page || 1)
            const size = Number(ctx.query.size || 10)
            const start = (page - 1) * size
            return ok({
                list: CONTENT.slice(start, start + size),
                total: CONTENT.length, page, size, hasNext: start + size < CONTENT.length
            })
        }
    },
    {
        method: 'GET', pattern: /^\/admin\/data\/overview$/,
        handler: () => ok({
            dau: 32000, newVideos: 320, newUsers: 540,
            playTrend: [12, 19, 15, 23, 28, 25, 31].map(v => v * 40000)
        })
    },
    {
        method: 'GET', pattern: /^\/admin\/report\/list$/,
        handler: () => ok(REPORTS)
    },
    {
        method: 'GET', pattern: /^\/admin\/appeal\/list$/,
        handler: () => ok(APPEALS)
    },
    {
        method: 'GET', pattern: /^\/admin\/user\/list$/,
        handler: () => ok(USERS)
    },
    {
        method: 'GET', pattern: /^\/admin\/role\/list$/,
        handler: () => ok(ROLES)
    }
]

module.exports = { routes }
