// Day 1~7 核心接口：镜像前端 UI 复刻项目 mock 层已实现的契约。
// 当 VUE_APP_USE_MOCK=false 时，前端会走到这里。每个 handler 返回 { code, message, data }。
const { ok, fail } = require('../response')
const data = require('../data')

// 评论自增主键
let commentSeq = 400

// 简单字段读取：兼容 JSON 与 multipart 文本字段
function field(body, key, def) {
    if (!body) return def
    if (typeof body.get === 'function') return body.get(key)
    return body[key] !== undefined ? body[key] : def
}

const routes = [
    {
        method: 'GET', pattern: /^\/category\/getall$/,
        handler: () => ok(data.CHANNELS)
    },
    {
        method: 'GET', pattern: /^\/user\/personal\/info$/,
        handler: () => ok(data.PERSONAL_USER)
    },
    {
        method: 'POST', pattern: /^\/user\/account\/login$/,
        handler: () => ok({ token: 'mock-pilipili-token', user: data.PERSONAL_USER }, '登录成功')
    },
    {
        method: 'POST', pattern: /^\/user\/account\/register$/,
        handler: () => ok(null, '注册成功')
    },
    {
        method: 'POST', pattern: /^\/user\/account\/send-code$/,
        handler: () => ok(null, '验证码已发送（Mock：123456）')
    },
    {
        method: 'POST', pattern: /^\/user\/account\/phone-login$/,
        handler: (ctx) => {
            const code = field(ctx.body, 'code', '')
            if (code !== '123456') return fail('验证码错误，请重新输入')
            return ok({ token: 'mock-pilipili-phone-token', user: data.PERSONAL_USER }, '登录成功')
        }
    },
    {
        method: 'GET', pattern: /^\/msg-unread\/all$/,
        handler: () => ok({ reply: 1, at: 0, love: 2, system: 1, whisper: 0, dynamic: 0 })
    },
    {
        method: 'GET', pattern: /^\/favorite\/get-all\/user$/,
        handler: () => ok(data.FAVORITES)
    },
    {
        method: 'GET', pattern: /^\/favorite\/get-all\/visitor$/,
        handler: () => ok(data.FAVORITES)
    },
    {
        method: 'POST', pattern: /^\/favorite\/create$/,
        handler: () => ok({ fid: 99, uid: 1, type: 0, visible: 1, title: 'Mock 新收藏夹', count: 0 }, '创建成功')
    },
    {
        method: 'GET', pattern: /^\/comment\/get-like-and-dislike$/,
        handler: () => ok({ userLike: [], userDislike: [] })
    },
    {
        method: 'GET', pattern: /^\/video\/random\/visitor$/,
        handler: () => {
            const shuffled = data.VIDEOS.slice().sort(() => Math.random() - 0.5)
            return ok(shuffled.slice(0, 11))
        }
    },
    {
        method: 'GET', pattern: /^\/video\/cumulative\/visitor$/,
        handler: (ctx) => {
            const seen = String(ctx.query.vids || '').split(',').filter(Boolean).map(Number)
            const rest = data.VIDEOS.filter(v => !seen.includes(v.video.vid))
            const videos = rest.slice(0, 10)
            return ok({ videos, vids: videos.map(v => v.video.vid), more: rest.length > 10 })
        }
    },
    {
        method: 'GET', pattern: /^\/video\/getone$/,
        handler: (ctx) => {
            const vid = Number(ctx.query.vid)
            const item = data.VIDEOS.find(v => v.video.vid === vid) || data.VIDEOS[0]
            const detail = data.clone(item)
            detail.video.videoUrl = ''
            detail.video.descr = 'backend Mock 视频简介（关闭 Mock 后由本服务返回）'
            return ok(detail)
        }
    },
    {
        method: 'GET', pattern: /^\/danmu-list\/(?<vid>\d+)$/,
        handler: () => ok(data.DANMUS.slice())
    },
    {
        method: 'POST', pattern: /^\/video\/love-or-not$/,
        handler: (ctx) => {
            const isLove = Number(field(ctx.body, 'isLove', 1))
            const isSet = Number(field(ctx.body, 'isSet', 1))
            return ok({ love: isLove && isSet ? 1 : 0, unlove: !isLove && isSet ? 1 : 0, coin: 12, collect: 0 })
        }
    },
    {
        method: 'GET', pattern: /^\/video\/collected-fids$/,
        handler: () => ok([2])
    },
    {
        method: 'POST', pattern: /^\/video\/collect$/,
        handler: () => ok(null, 'OK')
    },
    {
        method: 'POST', pattern: /^\/video\/cancel-collect$/,
        handler: () => ok(null, 'OK')
    },
    {
        method: 'GET', pattern: /^\/comment\/get$/,
        handler: (ctx) => {
            const offset = Number(ctx.query.offset || 0)
            const comments = data.ROOT_COMMENTS.slice(offset, offset + 5)
            return ok({ comments, more: offset + 5 < data.ROOT_COMMENTS.length })
        }
    },
    {
        method: 'GET', pattern: /^\/comment\/get-up-like$/,
        handler: () => ok([201, 202, 204])
    },
    {
        method: 'POST', pattern: /^\/comment\/add$/,
        handler: (ctx) => {
            const rootId = Number(field(ctx.body, 'root_id', 0)) || 0
            const parentId = Number(field(ctx.body, 'parent_id', 0)) || 0
            const toUserId = Number(field(ctx.body, 'to_user_id', 0)) || 0
            const newComment = {
                id: commentSeq++, vid: Number(field(ctx.body, 'vid', 16)) || 16, uid: data.PERSONAL_USER.uid,
                rootId, parentId, toUserId, content: field(ctx.body, 'content', '（空评论）'),
                love: 0, bad: 0, createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
                isTop: 0, isDeleted: 0, user: data.PERSONAL_USER,
                toUser: toUserId ? data.userById(toUserId) : null
            }
            if (rootId === 0) {
                data.ROOT_COMMENTS.unshift({ ...newComment, count: 0, replies: [] })
            } else {
                const root = data.ROOT_COMMENTS.find(c => c.id === rootId)
                if (root) {
                    root.replies.push(newComment)
                    root.count = root.replies.length
                }
            }
            return ok(newComment, '评论成功')
        }
    },
    {
        method: 'POST', pattern: /^\/comment\/delete$/,
        handler: () => ok(null, 'OK')
    },
    {
        method: 'POST', pattern: /^\/comment\/love-or-not$/,
        handler: () => ok(null, 'OK')
    },
    {
        method: 'GET', pattern: /^\/comment\/reply\/get-more$/,
        handler: (ctx) => {
            const root = data.ROOT_COMMENTS.find(c => c.id === Number(ctx.query.id))
            return data.clone(root || null)
        }
    },
    {
        method: 'POST', pattern: /^\/video\/play\/visitor$/,
        handler: () => ok(null, 'OK')
    },
    {
        method: 'POST', pattern: /^\/video\/play\/user$/,
        handler: () => ok(null, 'OK')
    }
]

module.exports = { routes }
