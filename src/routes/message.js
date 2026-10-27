// Day 9：消息中心接口（回复/@/赞/系统/动态 + 私聊）。
const { ok } = require('../response')
const data = require('../data')

// 模块内内存数据，保证 Day9 提交自包含
const feedMessages = {
    reply: [
        { id: 1, type: 'reply', fromUser: data.userById(20), content: '第一次这么早，UP主的更新频率太感人了', sourceTitle: '【Vue3】30分钟搭一个仿B站首页', createTime: '2026-10-18 09:20', isRead: 0 },
        { id: 2, type: 'reply', fromUser: data.userById(31), content: '这个播放器的进度条交互做得真细', sourceTitle: '从零手写一个视频播放器控件', createTime: '2026-10-17 21:15', isRead: 0 }
    ],
    at: [],
    love: [
        { id: 3, type: 'love', fromUser: data.userById(16), content: '赞了你的评论', sourceTitle: '弹幕字体和透明度都能调', createTime: '2026-10-16 14:48', isRead: 0 },
        { id: 4, type: 'love', fromUser: data.userById(36), content: '赞了你的动态', sourceTitle: '今天也在学前端', createTime: '2026-10-15 19:03', isRead: 1 }
    ],
    system: [
        { id: 5, type: 'system', content: '欢迎使用 pilipili，遵守社区规范哦～', createTime: '2026-10-01 00:00', isRead: 0 }
    ],
    dynamic: []
}

const chatList = [
    { chat: { id: 101, userId: 16, unread: 2, latestTime: '2026-10-18 10:00' }, user: data.userById(16), detail: { more: true, list: [] } },
    { chat: { id: 102, userId: 31, unread: 0, latestTime: '2026-10-17 22:00' }, user: data.userById(31), detail: { more: true, list: [] } }
]

const chatDetails = {
    101: [
        { id: 1, sendId: 16, acceptId: 1, content: '在吗？看了你的首页复刻', time: '2026-10-18 09:55', withdraw: 0 },
        { id: 2, sendId: 1, acceptId: 16, content: '在的，欢迎交流～', time: '2026-10-18 09:58', withdraw: 0 },
        { id: 3, sendId: 16, acceptId: 1, content: '弹幕引擎那期什么时候出', time: '2026-10-18 10:00', withdraw: 0 }
    ],
    102: [
        { id: 4, sendId: 31, acceptId: 1, content: 'CSS 布局那篇写得太好了', time: '2026-10-17 21:50', withdraw: 0 }
    ]
}

const routes = [
    {
        method: 'GET', pattern: /^\/message\/list\/(?<type>\w+)$/,
        handler: (ctx) => ok(feedMessages[ctx.params.type] || [])
    },
    {
        method: 'GET', pattern: /^\/message\/whisper\/list$/,
        handler: () => ok(chatList.slice())
    },
    {
        method: 'GET', pattern: /^\/message\/whisper\/detail$/,
        handler: (ctx) => ok(chatDetails[ctx.query.chatId] || [])
    },
    {
        method: 'POST', pattern: /^\/message\/whisper\/send$/,
        handler: (ctx) => {
            const chatId = ctx.body.chatId || ctx.body.acceptId || 101
            const content = ctx.body.content || ''
            const msg = { id: Date.now(), sendId: 1, acceptId: Number(chatId), content, time: new Date().toISOString().slice(0, 16).replace('T', ' '), withdraw: 0 }
            ;(chatDetails[chatId] = chatDetails[chatId] || []).push(msg)
            return ok(msg, '发送成功')
        }
    },
    {
        method: 'POST', pattern: /^\/message\/read$/,
        handler: () => ok(null, '已读')
    }
]

module.exports = { routes }
