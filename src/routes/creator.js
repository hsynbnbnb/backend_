// Day 10：创作中心与视频上传接口。
const { ok } = require('../response')
const data = require('../data')

const routes = [
    {
        method: 'GET', pattern: /^\/creator\/overview$/,
        handler: () => ok({
            totalVideos: data.VIDEOS.length,
            totalPlay: 123456,
            totalFans: data.PERSONAL_USER.fansCount,
            pendingReview: 2
        })
    },
    {
        method: 'GET', pattern: /^\/creator\/videos$/,
        handler: () => ok(data.VIDEOS.slice(0, 10).map(v => ({
            vid: v.video.vid, title: v.video.title, coverUrl: v.video.coverUrl,
            status: 1, uploadDate: v.video.uploadDate, play: v.stats.play
        })))
    },
    {
        method: 'GET', pattern: /^\/creator\/tags\/hot$/,
        handler: () => ok(['前端', 'Vue3', 'CSS', 'Canvas', '弹幕', '播放器', '教程', 'Vlog', 'UI复刻'])
    },
    {
        method: 'GET', pattern: /^\/category\/list$/,
        handler: () => ok(data.CHANNELS)
    },
    {
        method: 'POST', pattern: /^\/video\/submit$/,
        handler: () => ok({ vid: 999, status: 1 }, '投稿成功')
    }
]

module.exports = { routes }
