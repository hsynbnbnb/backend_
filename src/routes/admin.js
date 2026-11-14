// Day 11：管理端鉴权与框架接口。
const { ok } = require('../response')
const data = require('../data')

const ADMIN = {
    uid: 999, username: 'admin', nickname: '平台管理员', avatar: data.AVATAR, role: 'SUPER'
}

const MENU = [
    { id: 'dashboard', name: '仪表盘', path: '/dashboard', icon: 'Odometer' },
    { id: 'review', name: '视频审核', path: '/review', icon: 'VideoCamera' },
    { id: 'content', name: '内容管理', path: '/content', icon: 'Document' },
    { id: 'data', name: '数据统计', path: '/data', icon: 'DataLine' },
    { id: 'report', name: '举报处理', path: '/report', icon: 'Warning' },
    { id: 'appeal', name: '申诉处理', path: '/appeal', icon: 'Bell' },
    { id: 'user', name: '用户管理', path: '/user', icon: 'User' },
    { id: 'role', name: '角色权限', path: '/role', icon: 'Lock' }
]

const routes = [
    {
        method: 'POST', pattern: /^\/admin\/account\/login$/,
        handler: (ctx) => {
            const pwd = ctx.body && (ctx.body.password || ctx.body.pwd)
            // 演示：账号 admin / 任意密码均可登录（真实后端应校验）
            if (ctx.body && ctx.body.username && ctx.body.username !== 'admin') {
                return ok({ token: 'admin-token', admin: ADMIN }, '登录成功')
            }
            return ok({ token: 'admin-token', admin: ADMIN }, '登录成功')
        }
    },
    {
        method: 'GET', pattern: /^\/admin\/personal\/info$/,
        handler: () => ok(ADMIN)
    },
    {
        method: 'GET', pattern: /^\/admin\/menu\/list$/,
        handler: () => ok(MENU)
    },
    {
        method: 'GET', pattern: /^\/admin\/dashboard\/stats$/,
        handler: () => ok({
            users: 12800, videos: 5400, pendingReview: 36, reports: 12, todayUpload: 320, todayPlay: 1240000
        })
    },
    {
        method: 'POST', pattern: /^\/admin\/account\/logout$/,
        handler: () => ok(null, '已退出')
    }
]

module.exports = { routes }
