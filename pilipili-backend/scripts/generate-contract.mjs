/**
 * pilipili 契约交付物生成器（可重复运行，无需第三方依赖）
 *
 * 数据来源全部是真实代码，不手写端点：
 *   1. src/main/resources/contract-seed.json        契约响应快照
 *   2. service/ContractDispatcher.java 的 ex()/pat() 已迁移端点登记
 *   3. UI-/client/src 下 get()/post() 真实调用点     请求入参
 *   4. service/*.java 的 c.str/lng/integer/bool()   后端实际读取的参数键
 *
 * 产出：
 *   docs/pilipili.postman_collection.json   Postman Collection v2.1（可直接导入）
 *   docs/接口入参清单.md                    逐端点入参规格（契约表第 7 节的依据）
 *
 * 用法：node scripts/generate-contract.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const backend = path.resolve(here, '..')
// 向上探测仓库根（兼容工程放在 <repo>/pilipili-backend 或 <repo>/backend_/pilipili-backend）
let repo = backend
for (let i = 0; i < 5; i++) {
  repo = path.resolve(repo, '..')
  if (fs.existsSync(path.join(repo, 'UI-/client/src'))) break
}
const docs = path.join(backend, 'docs')

const seeds = JSON.parse(fs.readFileSync(path.join(backend, 'src/main/resources/contract-seed.json'), 'utf8'))
const dispatcher = fs.readFileSync(path.join(backend, 'src/main/java/com/pilipili/backend/service/ContractDispatcher.java'), 'utf8')

const ex = [...dispatcher.matchAll(/ex\("(GET|POST|PUT|DELETE)",\s*"([^"]+)"/g)]
  .map(m => ({ method: m[1], path: m[2] }))
const pats = [...dispatcher.matchAll(/pat\("(GET|POST|PUT|DELETE)",\s*"([^"]+)"/g)]
  .map(m => ({ method: m[1], pattern: m[2] }))

// ---------- 1. 扫描前端真实调用点，抽取入参 ----------
const frontRoot = path.join(repo, 'UI-/client/src')
const frontFiles = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(js|vue)$/.test(e.name)) frontFiles.push(p)
  }
})(frontRoot)

/** 从 start 位置读取第一个实参（支持 {} 嵌套与字符串），返回原文 */
function firstArg(s, start) {
  let i = start
  while (i < s.length && /\s/.test(s[i])) i++
  if (s[i] !== '{') {
    const m = /^[A-Za-z_$][\w$]*/.exec(s.slice(i))
    return m ? { kind: 'ident', text: m[0], start: i } : { kind: 'none', text: '', start: i }
  }
  let depth = 0, quote = null
  for (let j = i; j < s.length; j++) {
    const ch = s[j]
    if (quote) {
      if (ch === '\\') { j++; continue }
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
    if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return { kind: 'object', text: s.slice(i, j + 1), start: i }
  }
  return { kind: 'object', text: s.slice(i, i + 400), start: i }
}

/** 从对象字面量里取 params:{} 的键，或顶层键（POST body） */
function keysFromObject(text, method) {
  const pm = /params\s*:\s*\{([\s\S]*?)\}/.exec(text)
  const scope = pm ? pm[1] : (method === 'POST' ? text : '')
  const keys = new Set()
  const re = /(?:^|[,{])\s*([A-Za-z_$][\w$]*)\s*:/g
  let m
  while ((m = re.exec(scope))) {
    if (!['params', 'headers', 'data', 'config'].includes(m[1])) keys.add(m[1])
  }
  return [...keys]
}

const front = new Map()   // "METHOD /path" -> {query:Set, body:Set, loc:Set}
const callRe = /\b(get|post)\s*\(\s*(['"`])(\/[^'"`]+)\2\s*,\s*/g
for (const f of frontFiles) {
  const s = fs.readFileSync(f, 'utf8')
  const rel = path.relative(frontRoot, f).replace(/\\/g, '/')
  let m
  while ((m = callRe.exec(s))) {
    const method = m[1].toUpperCase()
    let url = m[3].split('?')[0]
    if (url.includes('${')) continue           // 模板路径留给路径模式覆盖
    const key = method + ' ' + url
    if (!front.has(key)) front.set(key, { query: new Set(), body: new Set(), loc: new Set() })
    const rec = front.get(key)
    if (rec.loc.size < 3) rec.loc.add(rel)

    const arg = firstArg(s, m.index + m[0].length)
    if (arg.kind === 'object') {
      const keys = keysFromObject(arg.text, method)
      keys.forEach(k => (method === 'POST' ? rec.body : rec.query).add(k))
    } else if (arg.kind === 'ident') {
      // formData / FormData 变量：往前找 append('key' / append("key"
      const before = s.slice(Math.max(0, m.index - 900), m.index)
      const re = new RegExp(arg.text.replace(/[$]/g, '\\$') + '\\.append\\(\\s*[\'"`]([A-Za-z_$][\\w$]*)[\'"`]', 'g')
      let a
      while ((a = re.exec(before))) rec.body.add(a[1])
    }
  }
}

// ---------- 2. 后端实际读取的参数键 ----------
const svcDir = path.join(backend, 'src/main/java/com/pilipili/backend/service')
const backendKeys = new Map()   // key -> Set<类型>
for (const f of fs.readdirSync(svcDir)) {
  if (!f.endsWith('.java')) continue
  const s = fs.readFileSync(path.join(svcDir, f), 'utf8')
  for (const m of s.matchAll(/\.(str|lng|integer|bool)\(\s*"([A-Za-z_][A-Za-z0-9_]*)"/g)) {
    if (!backendKeys.has(m[2])) backendKeys.set(m[2], new Set())
    backendKeys.get(m[2]).add({ str: 'string', lng: 'integer', integer: 'integer', bool: 'boolean' }[m[1]])
  }
}

// ---------- 3. 合并端点清单 ----------
const seedMap = new Map(seeds.map(x => [x.method + ' ' + x.path, x]))
const exSet = new Set(ex.map(x => x.method + ' ' + x.path))
const endpoints = new Map()

function ensure(method, url, module) {
  const key = method + ' ' + url
  if (!endpoints.has(key)) endpoints.set(key, {
    method, url,
    module: module || guessModule(url),
    seed: seedMap.get(key) || null,
    front: front.get(key) || null,
    migrated: exSet.has(key)
  })
  return endpoints.get(key)
}
function guessModule(url) {
  const seg = url.split('/').filter(Boolean)[0] || 'misc'
  return ({ mall: 'mall', cart: 'cart', user: 'user', video: 'video', comment: 'comment',
    search: 'search', message: 'message', msg: 'message', admin: 'admin', creator: 'creator',
    category: 'core', partition: 'core', danmu: 'danmu', moment: 'moment', upload: 'upload',
    favorite: 'favorite' })[seg] || seg
}
seeds.forEach(x => ensure(x.method, x.path, x.module))
ex.forEach(x => ensure(x.method, x.path))
front.forEach((_v, k) => { const [method, url] = k.split(' '); ensure(method, url) })

// 路径模式补成可导入的样例请求
const patternSamples = {
  '^/danmu-list/(\\d+)$': '/danmu-list/16',
  '^/mall/product/([^/]+)$': '/mall/product/p1',
  '^/cart/([^/]+)$': '/cart/p1',
  '^/message/list/(\\w+)$': '/message/list/reply'
}

// ---------- 4. Postman Collection ----------
const SAMPLE = {
  uid: '1', vid: '16', id: 'p1', productId: 'p1', fid: '1', page: '1', size: '20',
  keyword: '测试', type: '1', sort: 'default', category: '', status: 'all', qty: '1',
  quantity: '1', offset: '0', chatId: '1', rootId: '201', parentId: '201', code: '123456',
  phone: '13800138000', username: 'pilipili', password: '123456', vids: '16',
  timePoint: '0', mode: '1', fontsize: '25', color: '#ffffff', content: '测试内容',
  selected: 'true', title: '测试', total: '39.00', shop: 'pilipili官方店'
}
const sampleOf = k => Object.prototype.hasOwnProperty.call(SAMPLE, k) ? SAMPLE[k] : '<value>'

function resolveUrl(url) {
  let out = url
  for (const [k, v] of Object.entries({
    '{id}': 'p1', '{vid}': '16', '{uid}': '1', '{fid}': '1', '{type}': 'reply'
  })) out = out.split(k).join(v)
  return out
}

function buildRequest(ep) {
  const url = resolveUrl(ep.url)
  const q = [...(ep.front?.query || [])].map(k => ({ key: k, value: sampleOf(k), description: '由前端真实调用点抽取' }))
  const raw = '{{baseUrl}}' + url + (q.length ? '?' + q.map(x => x.key + '=' + x.value).join('&') : '')
  const state = ep.seed?.module?.startsWith('reserved:') ? '预留接口（静态样例，待后端迁移）'
    : ep.migrated ? '已迁移真实 SQL' : ep.seed ? '契约样例（待迁移）' : '前端调用点（需后端核对）'
  const bodyKeys = [...(ep.front?.body || [])]
  const req = {
    method: ep.method,
    header: [{ key: 'Content-Type', value: 'application/json' }],
    url: { raw, host: ['{{baseUrl}}'], path: url.split('/').filter(Boolean), query: q },
    description: `状态：${state}\n模块：${ep.module}\n来源：scripts/generate-contract.mjs 自动抽取`
  }
  if (ep.method !== 'GET' && bodyKeys.length) {
    req.body = {
      mode: 'raw',
      raw: JSON.stringify(Object.fromEntries(bodyKeys.map(k => [k, sampleOf(k)])), null, 2),
      options: { raw: { language: 'json' } }
    }
  }
  return req
}

const folders = new Map()
for (const ep of endpoints.values()) {
  if (!folders.has(ep.module)) folders.set(ep.module, [])
  const request = buildRequest(ep)
  const item = { name: `${ep.method} ${ep.url}`, request }
  if (ep.seed) {
    item.response = [{
      name: '契约样例 200',
      code: ep.seed.code,
      status: 'OK',
      header: [{ key: 'Content-Type', value: 'application/json;charset=UTF-8' }],
      _postman_previewlanguage: 'json',
      body: JSON.stringify({ code: ep.seed.code, message: ep.seed.message, data: ep.seed.data }, null, 2)
    }]
  }
  folders.get(ep.module).push(item)
}
// 路径模式单独一个文件夹
const patternItems = pats.map(p => {
  const method = p.method
  const sample = patternSamples[p.pattern] || null
  const url = sample || ('/' + p.pattern.replace(/[^\w/]/g, '').slice(0, 40))
  return {
    name: `${method} ~ ${p.pattern}`,
    request: {
      method,
      header: [{ key: 'Content-Type', value: 'application/json' }],
      url: { raw: '{{baseUrl}}' + url, host: ['{{baseUrl}}'], path: url.split('/').filter(Boolean) },
      description: `路径模式（正则：${p.pattern}）。${sample ? '此处用样例值 ' + url + ' 填充。' : '请自行替换路径变量。'}`
    }
  }
})
if (patternItems.length) folders.set('路径模式', patternItems)

const collection = {
  info: {
    name: 'pilipili 接口契约 v1',
    _postman_id: 'pilipili-contract-v1',
    description: '由 scripts/generate-contract.mjs 从真实代码自动生成，请勿手工编辑。\n契约唯一依据：docs/接口契约v1对照表.md',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:9090/api' },
    { key: 'token', value: '<JWT，联调期宽松模式可留空>' }
  ],
  item: [...folders].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, item]) => ({ name, item: item.sort((a, b) => a.name.localeCompare(b.name)) }))
}
fs.writeFileSync(path.join(docs, 'pilipili.postman_collection.json'), JSON.stringify(collection, null, 2), 'utf8')

// ---------- 5. 接口入参清单 Markdown ----------
const lines = [
  '# 接口入参清单（自动生成，请勿手工编辑）',
  '',
  '> 由 `scripts/generate-contract.mjs` 从以下真实代码抽取，重跑即可刷新：',
  '> `contract-seed.json`、`ContractDispatcher.java` 的 `ex()/pat()`、`UI-/client/src` 的 `get()/post()` 调用点、Service 层的 `c.str/lng/integer/bool()`。',
  '>',
  '> **说明**：入参是「代码里实际出现过的键」，属于候选参数而非最终字段字典；后端实现时以《接口契约 v1 对照表》第 8 节字段字典与第 7 节规格为准逐接口复核。',
  '',
  `统计：精确端点 ${endpoints.size} 个 · 路径模式 ${pats.length} 个 · 前端调用点 ${front.size} 个 · 后端读取参数键 ${backendKeys.size} 个 · 契约响应样例 ${seeds.length} 条`,
  '',
  '## 1. 参数字典（后端实际读取的键）',
  '',
  '| 参数 | 类型 | 样例 | 出现位置 |',
  '|---|---|---|---|',
]
for (const [k, types] of [...backendKeys].sort()) {
  lines.push(`| \`${k}\` | ${[...types].join(' / ')} | ${sampleOf(k)} | Service 层 |`)
}
lines.push('', '## 2. 逐端点入参', '',
  '| 方法 | 路径 | query | body | 状态 | 前端调用点 |', '|---|---|---|---|---|---|')
for (const ep of [...endpoints.values()].sort((a, b) => (a.method + a.url).localeCompare(b.method + b.url))) {
  const q = [...(ep.front?.query || [])].map(x => '`' + x + '`').join(', ') || '—'
  const b = [...(ep.front?.body || [])].map(x => '`' + x + '`').join(', ') || '—'
  const state = ep.seed?.module?.startsWith('reserved:') ? '预留接口' : ep.migrated ? '已迁移 SQL' : ep.seed ? '契约样例' : '待核对'
  const loc = [...(ep.front?.loc || [])].join(', ') || '—'
  lines.push(`| ${ep.method} | \`${ep.url}\` | ${q} | ${b} | ${state} | ${loc} |`)
}
lines.push('', '## 3. 路径模式', '', '| 方法 | 正则 | 样例请求 |', '|---|---|---|')
for (const p of pats) lines.push(`| ${p.method} | \`${p.pattern}\` | \`${patternSamples[p.pattern] || '自行替换'}\` |`)
lines.push('')
fs.writeFileSync(path.join(docs, '接口入参清单.md'), lines.join('\n'), 'utf8')

console.log('生成完成：')
console.log('  端点', endpoints.size, '| 路径模式', pats.length, '| 前端调用点', front.size,
  '| 后端参数键', backendKeys.size, '| 契约样例', seeds.length)
console.log('  docs/pilipili.postman_collection.json  folders=' + collection.item.length +
  ' requests=' + collection.item.reduce((n, f) => n + f.item.length, 0))
console.log('  docs/接口入参清单.md')
