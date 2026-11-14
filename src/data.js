// 内存态种子数据（无数据库 / 无 SQL）。镜像前端 UI 复刻项目 mock 层字段，
// 便于 VUE_APP_USE_MOCK=false 时前端直接对接本服务。

const COVERS = [
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20240322/img/cover/1711110712131c01f29fff12245a78e31cb36033e04ab.jpg',
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20231112/img/cover/1699782969068e3233962e04a4d54ad29ac078b31add0.jpg',
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20231102/img/cover/16989300077191113ff089d75455a89a91ef0c1b89aab.jpg',
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20231102/img/cover/169893110490716d5c74c17514eaea15cffcc3b4944a6.jpg',
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20231117/img/cover/17001510817100b014757b37643f186af536d99f10e36.jpg',
    'https://teriteri.oss-cn-heyuan.aliyuncs.com/20231226/img/cover/17035809290911763e6df5b5045a79df241f241a9dd65.jpg'
]

const AVATAR = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
const BG = 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'

const UPLOADERS = [
    { uid: 5, username: 'pilipili05', nickname: '感动收集站', avatar: AVATAR, background: BG, gender: 2, description: 'Mock UP主', exp: 10800, coin: 128, vip: 0, state: 0, role: 0, auth: 0, authMsg: '' },
    { uid: 6, username: 'pilipili06', nickname: '治疗时间', avatar: AVATAR, background: BG, gender: 2, description: 'Mock UP主', exp: 4500, coin: 52, vip: 0, state: 0, role: 0, auth: 0, authMsg: '' },
    { uid: 16, username: 'pilipili16', nickname: '提瓦特观测站长', avatar: AVATAR, background: BG, gender: 1, description: '游戏区认证UP主', exp: 28800, coin: 666, vip: 3, state: 0, role: 0, auth: 2, authMsg: '游戏区认证UP主' },
    { uid: 20, username: 'pilipili20', nickname: '新歌速递员', avatar: AVATAR, background: BG, gender: 0, description: 'Mock UP主', exp: 1500, coin: 12, vip: 0, state: 0, role: 0, auth: 0, authMsg: '' },
    { uid: 25, username: 'pilipili25', nickname: '泛动数据库', avatar: AVATAR, background: BG, gender: 2, description: '学习项目账号', exp: 200, coin: 3.5, vip: 0, state: 0, role: 0, auth: 1, authMsg: '学习项目账号' },
    { uid: 28, username: 'pilipili28', nickname: '恋爱选择题', avatar: AVATAR, background: BG, gender: 2, description: 'Mock UP主', exp: 50, coin: 0.5, vip: 0, state: 0, role: 0, auth: 0, authMsg: '' },
    { uid: 31, username: 'pilipili31', nickname: '前端练习生', avatar: AVATAR, background: BG, gender: 1, description: '30分钟搭一个仿B站首页', exp: 10800, coin: 88, vip: 1, state: 0, role: 0, auth: 0, authMsg: '' },
    { uid: 36, username: 'pilipili36', nickname: 'Canvas 研究所', avatar: AVATAR, background: BG, gender: 2, description: '用Canvas画一个弹幕引擎', exp: 4500, coin: 36, vip: 0, state: 0, role: 0, auth: 0, authMsg: '' }
]

const SEEDS = [
    { vid: 28, title: '哥哥的女朋友，只能由我来选', duration: 214, mcId: 'anime', scId: 'serial', mcName: '番剧', scName: '连载动画', uploadDate: '2026-10-12 18:30' },
    { vid: 16, title: '一起来庆祝原神生日吧！', duration: 356, mcId: 'game', scId: 'stand_alone', mcName: '游戏', scName: '单机游戏', uploadDate: '2026-10-05 12:00' },
    { vid: 5, title: '还记得那年感动的瞬间吗', duration: 189, mcId: 'anime', scId: 'finish', mcName: '番剧', scName: '完结动画', uploadDate: '2026-09-28 20:15' },
    { vid: 6, title: '治疗就交给我吧，不会让你失望的', duration: 243, mcId: 'guochuang', scId: 'chinese', mcName: '国创', scName: '国产动画', uploadDate: '2026-09-20 09:40' },
    { vid: 20, title: '美依礼芽新歌MV发布，快前来围观', duration: 268, mcId: 'music', scId: 'mv', mcName: '音乐', scName: 'MV', uploadDate: '2026-09-15 21:05' },
    { vid: 25, title: '拜托～圣诞节和我一起过吧', duration: 175, mcId: 'life', scId: 'daily', mcName: '生活', scName: '日常', uploadDate: '2026-08-30 16:20' },
    { vid: 31, title: '【Vue3】30分钟搭一个仿B站首页', duration: 1836, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-18 10:10' },
    { vid: 32, title: '前端开发者必备的CSS布局技巧', duration: 945, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-16 14:20' },
    { vid: 33, title: '从零手写一个视频播放器控件', duration: 1265, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-14 09:00' },
    { vid: 34, title: 'JavaScript事件循环到底怎么跑', duration: 723, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-11 19:45' },
    { vid: 35, title: '一天时间里程序员都在做什么', duration: 412, mcId: 'life', scId: 'daily', mcName: '生活', scName: '日常', uploadDate: '2026-10-09 08:30' },
    { vid: 37, title: '用Canvas画一个弹幕引擎', duration: 1024, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-07 15:15' },
    { vid: 38, title: 'Element Plus 组件库快速上手', duration: 658, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-10-03 11:25' },
    { vid: 39, title: '仿B站轮播图：过渡动画实现原理', duration: 486, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-30 17:40' },
    { vid: 40, title: '大文件分片上传原理解析', duration: 892, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-26 13:05' },
    { vid: 41, title: 'Vue Router 路由守卫完全指南', duration: 734, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-22 10:50' },
    { vid: 42, title: 'Vuex状态管理避坑手册', duration: 615, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-18 16:35' },
    { vid: 43, title: '首页骨架屏是怎么做出来的', duration: 398, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-12 09:20' },
    { vid: 44, title: '一行代码搞定图片懒加载', duration: 287, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-08 20:55' },
    { vid: 45, title: 'WebSocket实时弹幕通信实战', duration: 1146, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-09-04 14:10' },
    { vid: 46, title: '如何用Git Tag管理14天学习计划', duration: 356, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-29 18:00' },
    { vid: 47, title: 'Mock请求拦截的三种方式', duration: 522, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-25 12:45' },
    { vid: 48, title: '视频网站推荐算法是怎么来的', duration: 678, mcId: 'knowledge', scId: 'science', mcName: '知识', scName: '科学科普', uploadDate: '2026-08-21 15:30' },
    { vid: 49, title: '从设计稿到前端组件化开发', duration: 845, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-17 09:15' },
    { vid: 50, title: '浏览器渲染流程与重绘重排', duration: 713, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-13 19:25' },
    { vid: 51, title: '响应式布局：1366与1920的适配', duration: 564, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-09 11:40' },
    { vid: 52, title: '动画性能优化：transform的秘密', duration: 437, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-05 16:55' },
    { vid: 53, title: '一次真实的前端性能调优记录', duration: 968, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-08-02 10:05' },
    { vid: 54, title: '程序员的美食日记：深夜厨房', duration: 326, mcId: 'life', scId: 'funny', mcName: '生活', scName: '搞笑', uploadDate: '2026-07-29 21:20' },
    { vid: 55, title: '14天复刻一个网站，我学到了什么', duration: 486, mcId: 'knowledge', scId: 'tech', mcName: '知识', scName: '计算机技术', uploadDate: '2026-07-25 14:00' }
]

function buildVideo(seed, i) {
    const u = UPLOADERS[i % UPLOADERS.length]
    const play = 12000 + i * 3571
    const danmu = 200 + i * 37
    return {
        video: {
            vid: seed.vid, uid: u.uid, title: seed.title, type: 1, auth: 0, duration: seed.duration,
            mcId: seed.mcId, scId: seed.scId, tags: '学习,前端,UI复刻', descr: 'Mock 视频简介',
            coverUrl: COVERS[i % COVERS.length], videoUrl: '', status: 1, uploadDate: seed.uploadDate, deleteDate: null
        },
        user: u,
        stats: {
            vid: seed.vid, play, danmu, good: Math.floor(play / 40), bad: 3,
            coin: Math.floor(play / 100), collect: Math.floor(play / 60),
            share: Math.floor(play / 200), comment: Math.floor(danmu / 5)
        },
        category: { mcId: seed.mcId, scId: seed.scId, mcName: seed.mcName, scName: seed.scName }
    }
}

const VIDEOS = SEEDS.map(buildVideo)

const PERSONAL_USER = {
    uid: 1, username: 'pilipili', nickname: 'pilipili 用户', avatar_url: AVATAR, background: BG,
    gender: 2, description: 'Mock 登录用户', exp: 10800, coin: 128, vip: 1, state: 0, role: 0,
    auth: 1, authMsg: 'pilipili 演示账号', followsCount: 128, fansCount: 256, loveCount: 1024
}

const SPACE_USERS = {}
UPLOADERS.forEach(u => {
    SPACE_USERS[u.uid] = {
        uid: u.uid, username: u.username, nickname: u.nickname, avatar_url: u.avatar, bg_url: u.background,
        gender: u.gender, description: u.description, exp: u.exp, coin: u.coin, vip: u.vip, state: 0,
        auth: u.auth, authMsg: u.authMsg, followsCount: 12 + u.uid, fansCount: 66 * u.uid, loveCount: 12 * u.uid, playCount: 880 * u.uid
    }
})

const CHANNELS = [
    { mcId: 'anime', mcName: '番剧', scList: [{ mcId: 'anime', scId: 'serial', scName: '连载动画' }, { mcId: 'anime', scId: 'finish', scName: '完结动画' }] },
    { mcId: 'guochuang', mcName: '国创', scList: [{ mcId: 'guochuang', scId: 'chinese', scName: '国产动画' }, { mcId: 'guochuang', scId: 'original', scName: '国产原创相关' }] },
    { mcId: 'game', mcName: '游戏', scList: [{ mcId: 'game', scId: 'stand_alone', scName: '单机游戏' }, { mcId: 'game', scId: 'mobile', scName: '手机游戏' }] },
    { mcId: 'knowledge', mcName: '知识', scList: [{ mcId: 'knowledge', scId: 'science', scName: '科学科普' }, { mcId: 'knowledge', scId: 'tech', scName: '计算机技术' }] }
]

const TRENDINGS = [
    { content: 'pilipili 首页', type: 2 },
    { content: '视频播放器', type: 1 },
    { content: '会员购', type: 2 },
    { content: 'Vue 3 项目', type: 1 }
]

const FAVORITES = [
    { fid: 1, uid: 1, type: 1, visible: 1, title: '默认收藏夹', count: 12 },
    { fid: 2, uid: 1, type: 0, visible: 1, title: '前端学习', count: 8 },
    { fid: 3, uid: 1, type: 0, visible: 0, title: '私密收藏夹', count: 3 }
]

const DANMUS = [
    { id: 101, uid: 16, content: '第一集终于来了', timePoint: 1, mode: 1, fontsize: 22, color: '#FFFFFF' },
    { id: 102, uid: 20, content: '前来三连支持', timePoint: 2, mode: 1, fontsize: 22, color: '#FF6699' },
    { id: 103, uid: 25, content: '这个转场太帅了', timePoint: 4, mode: 1, fontsize: 22, color: '#FFFFFF' },
    { id: 104, uid: 31, content: 'UP主辛苦了', timePoint: 6, mode: 1, fontsize: 22, color: '#FFD700' },
    { id: 105, uid: 36, content: '弹幕护体', timePoint: 8, mode: 2, fontsize: 22, color: '#FFFFFF' }
]

const ROOT_COMMENTS = [
    { id: 201, vid: 16, uid: 20, rootId: 0, parentId: 0, toUserId: 0, content: '第一次这么早，UP主的更新频率太感人了', love: 128, bad: 0, createTime: '2026-10-18 09:20', isTop: 0, isDeleted: 0, count: 2, replies: [
        { id: 301, vid: 16, uid: 25, rootId: 201, parentId: 201, toUserId: 20, content: '毕竟是大厂练习生，效率拉满', love: 12, bad: 0, createTime: '2026-10-18 09:41', isTop: 0, isDeleted: 0 },
        { id: 302, vid: 16, uid: 16, rootId: 201, parentId: 301, toUserId: 25, content: '楼上说笑了，就是肝得比较狠', love: 5, bad: 0, createTime: '2026-10-18 10:02', isTop: 0, isDeleted: 0 }
    ] },
    { id: 202, vid: 16, uid: 31, rootId: 0, parentId: 0, toUserId: 0, content: '这个播放器的进度条交互做得真细', love: 96, bad: 0, createTime: '2026-10-17 21:15', isTop: 0, isDeleted: 0, count: 1, replies: [
        { id: 303, vid: 16, uid: 36, rootId: 202, parentId: 202, toUserId: 31, content: 'video.js 那一套也复刻了', love: 8, bad: 0, createTime: '2026-10-17 21:33', isTop: 0, isDeleted: 0 }
    ] },
    { id: 203, vid: 16, uid: 25, rootId: 0, parentId: 0, toUserId: 0, content: '弹幕字体和透明度都能调，爷青回', love: 77, bad: 0, createTime: '2026-10-16 14:48', isTop: 0, isDeleted: 0, count: 0, replies: [] },
    { id: 204, vid: 16, uid: 16, rootId: 0, parentId: 0, toUserId: 0, content: '建议加一个倍速记忆功能', love: 54, bad: 0, createTime: '2026-10-15 19:03', isTop: 0, isDeleted: 0, count: 0, replies: [] },
    { id: 205, vid: 16, uid: 36, rootId: 0, parentId: 0, toUserId: 0, content: '从设计稿到组件化的那期也出了', love: 41, bad: 0, createTime: '2026-10-14 11:12', isTop: 0, isDeleted: 0, count: 0, replies: [] }
]

function userById(uid) {
    return UPLOADERS.find(u => u.uid === Number(uid)) || PERSONAL_USER
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

module.exports = {
    COVERS, AVATAR, BG, UPLOADERS, VIDEOS, PERSONAL_USER, SPACE_USERS,
    CHANNELS, TRENDINGS, FAVORITES, DANMUS, ROOT_COMMENTS, userById, clone
}
