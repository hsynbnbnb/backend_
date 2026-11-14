// 统一返回结构：与前端 UI 复刻项目一致 { code, message, data }
function ok(data = null, message = 'OK', code = 200) {
    return { code, message, data }
}

function fail(message = '请求失败', code = 500, data = null) {
    return { code, message, data }
}

module.exports = { ok, fail }
