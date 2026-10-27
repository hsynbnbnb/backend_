// Day 9：账号中心接口（资料、密码、绑定、头像）。
const { ok } = require('../response')
const data = require('../data')

const routes = [
    {
        method: 'GET', pattern: /^\/user\/account\/info$/,
        handler: () => ok(data.PERSONAL_USER)
    },
    {
        method: 'POST', pattern: /^\/user\/account\/info$/,
        handler: (ctx) => {
            const nickname = ctx.body.nickname || data.PERSONAL_USER.nickname
            const gender = ctx.body.gender !== undefined ? ctx.body.gender : data.PERSONAL_USER.gender
            const description = ctx.body.description !== undefined ? ctx.body.description : data.PERSONAL_USER.description
            Object.assign(data.PERSONAL_USER, { nickname, gender, description })
            return ok(data.PERSONAL_USER, '资料已更新')
        }
    },
    {
        method: 'POST', pattern: /^\/user\/account\/password$/,
        handler: () => ok(null, '密码修改成功')
    },
    {
        method: 'GET', pattern: /^\/user\/account\/setting$/,
        handler: () => ok({
            bindPhone: '138****8888',
            bindEmail: 'pil****@example.com',
            twoFactor: false,
            privacy: 'public'
        })
    },
    {
        method: 'POST', pattern: /^\/user\/account\/avatar$/,
        handler: () => ok({ avatar_url: data.AVATAR }, '头像已更新')
    }
]

module.exports = { routes }
