// Day 12：管理端视频审核接口。
const { ok } = require('../response')
const data = require('../data')

// 给视频预置审核状态：0 待审 / 1 通过 / 2 驳回
const reviewStatus = {}
data.VIDEOS.forEach((v, i) => { reviewStatus[v.video.vid] = i % 5 === 0 ? 2 : (i % 3 === 0 ? 0 : 1) })

function toReviewItem(v) {
    return {
        vid: v.video.vid,
        title: v.video.title,
        coverUrl: v.video.coverUrl,
        uid: v.video.uid,
        nickname: v.user.nickname,
        duration: v.video.duration,
        uploadDate: v.video.uploadDate,
        play: v.stats.play,
        danmu: v.stats.danmu,
        status: reviewStatus[v.video.vid]
    }
}

const routes = [
    {
        method: 'GET', pattern: /^\/admin\/video\/review\/count$/,
        handler: () => {
            let pending = 0, approved = 0, rejected = 0;
            data.VIDEOS.forEach(v => {
                const s = reviewStatus[v.video.vid];
                if (s === 0) pending++;
                else if (s === 1) approved++;
                else rejected++;
            })
            return ok({ pending, approved, rejected })
        }
    },
    {
        method: 'GET', pattern: /^\/admin\/video\/review\/list$/,
        handler: (ctx) => {
            const page = Number(ctx.query.page || 1)
            const size = Number(ctx.query.size || 10)
            const status = ctx.query.status !== undefined && ctx.query.status !== '' ? Number(ctx.query.status) : null
            const filtered = data.VIDEOS.filter(v => status === null || reviewStatus[v.video.vid] === status)
            const start = (page - 1) * size
            const list = filtered.slice(start, start + size).map(toReviewItem)
            return ok({
                list,
                total: filtered.length,
                page,
                size,
                hasNext: start + size < filtered.length
            })
        }
    },
    {
        method: 'GET', pattern: /^\/admin\/video\/detail$/,
        handler: (ctx) => {
            const vid = Number(ctx.query.vid)
            const item = data.VIDEOS.find(v => v.video.vid === vid) || data.VIDEOS[0]
            const detail = data.clone(item)
            detail.video.videoUrl = ''
            detail.reviewStatus = reviewStatus[detail.video.vid]
            return ok(detail)
        }
    },
    {
        method: 'POST', pattern: /^\/admin\/video\/review$/,
        handler: (ctx) => {
            const vid = Number(ctx.body && (ctx.body.vid || ctx.body.videoId))
            const status = Number(ctx.body && (ctx.body.status || ctx.body.reviewStatus))
            const reason = (ctx.body && (ctx.body.reason || ctx.body.remark)) || ''
            if (vid) reviewStatus[vid] = status
            return ok({ vid, status, reason }, '审核完成')
        }
    },
    {
        method: 'POST', pattern: /^\/admin\/video\/preview$/,
        handler: () => ok(null, '预览成功')
    }
]

module.exports = { routes }
