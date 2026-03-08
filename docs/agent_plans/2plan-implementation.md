# 与见 OS · 大余湾灵脉争夺战 — 完整实施计划 V1.0

> 基于《MVP 开发规格书 V1.0》制定，**全功能不裁剪**

---

## 一、技术架构总览

### 前端

| 项 | 选型 | 理由 |
|----|------|------|
| 框架 | UniApp + Vue3 + Vite | 已有脚手架，H5/小程序双端 |
| 语言 | TypeScript 5.7+ | 已配置 |
| CSS | UnoCSS + 自定义 CSS 变量 | 已安装，搭配设计系统 |
| UI 组件 | 自研组件库 (Yj*) | 规格书要求消除"网页廉价感" |
| 状态管理 | Pinia | 已安装 |
| 地图/围栏 | Haversine 距离算法 (自写) | 轻量，已有 `calcDistance`，不引入 Turf.js |
| 2D AR | CSS3 transform + DeviceOrientation API | 2D 气泡悬浮跟随，禁止 WebGL |
| 录音 | uni.getRecorderManager() | 5 秒语音"神念" |
| 音效 | uni.createInnerAudioContext() | 环境音 + 交互音效 |
| 震动 | uni.vibrateShort / uni.vibrateLong | 心跳/打击反馈 |
| 图标 | @iconify-json/tabler (已装) + 自定义 SVG | 禁止 emoji |

### 后端 (腾讯云全家桶)

| 项 | 产品 | 用途 |
|----|------|------|
| Serverless 后端 | **CloudBase 云开发** | 云函数 + 数据库 + 存储一体 |
| 数据库 | CloudBase MongoDB | users / pois / mines / transactions |
| 并发控制 | CloudBase 数据库事务 (Alpha) → **Redis 内存版** (Beta+) | 防脏写 |
| 实时同步 | CloudBase 实时数据推送 | 阵眼颜色全服实时变化 |
| 文件存储 | CloudBase 云存储 | 语音文件、音效资源 |
| 内容安全 | 腾讯云天御 / 小程序内容安全 API | 语音审核 |
| 静态托管 | CloudBase 静态网站托管 | H5 版本部署 |
| 监控 | CloudBase 云监控 + 自建埋点 | 三个生死红线指标 |

### 仓库

| 项 | 值 |
|----|-----|
| GitHub | `2799662352/dayuwan-spirit-vein` (新建) |
| 分支策略 | `main` = 稳定, `develop` = 开发, `feature/*` = 功能分支 |
| 旧代码 | 保留在 `legacy/yujian-v1` 分支 |

---

## 二、数据库设计

### 2.1 users 表

```json
{
  "_id": "string (自动生成)",
  "openid": "string (微信 openid)",
  "faction": "blue | red",
  "lingshi": "int (灵石余额，初始 3)",
  "xuanjing": "int (玄晶余额，初始 30)",
  "mines_planted": "int (累计布阵数)",
  "mines_defused_win": "int (累计破阵成功数)",
  "mines_defused_fail": "int (累计破阵失败数)",
  "redeemed_today": "int (今日核销次数)",
  "last_share_date": "string (YYYY-MM-DD)",
  "status": "normal | dying (玄晶<5)",
  "items": [
    { "id": "tianyan", "name": "天眼通", "count": 0 },
    { "id": "jiagu", "name": "加固符", "count": 0 }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**阵营分配算法:**
```typescript
function assignFaction(openid: string): 'blue' | 'red' {
  let hash = 0
  for (let i = 0; i < openid.length; i++) {
    hash = ((hash << 5) - hash) + openid.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2 === 0 ? 'blue' : 'red'
}
```

### 2.2 pois 表 (10 个阵眼，预置)

```json
{
  "_id": "string",
  "name": "string (如 '余庆堂')",
  "location": {
    "type": "Point",
    "coordinates": [114.xxxx, 30.xxxx]
  },
  "fence_radius": 50,
  "blue_mines": "int",
  "red_mines": "int",
  "owner": "blue | red | contested",
  "updated_at": "timestamp"
}
```

**60% 控制权算法 (云函数内):**
```typescript
function calcOwner(blue: number, red: number): 'blue' | 'red' | 'contested' {
  const total = blue + red
  if (total === 0) return 'contested'
  if (blue / total >= 0.6) return 'blue'
  if (red / total >= 0.6) return 'red'
  return 'contested'
}
```

### 2.3 mines 表

```json
{
  "_id": "string",
  "poi_id": "string",
  "user_id": "string",
  "faction": "blue | red",
  "voice_url": "string (云存储路径)",
  "voice_text": "string (文化关键词，审核用)",
  "alive": true,
  "passive_yield_total": "int (已累计产出玄晶)",
  "last_yield_at": "timestamp",
  "planted_at": "timestamp"
}
```

**被动收益逻辑 (定时触发器，每 10 分钟):**
```
遍历所有 alive=true 的 mines
  -> 检查对应 poi 的 owner 是否仍为该 mine 的 faction
  -> 若是: 该 mine 的 user 获得 2 玄晶, passive_yield_total += 2
  -> 若否: 无产出
```

### 2.4 transactions 表

```json
{
  "_id": "string",
  "user_id": "string",
  "type": "plant | defuse_win | defuse_fail | passive | redeem | share | shop_buy | newbie",
  "lingshi_delta": "int",
  "xuanjing_delta": "int",
  "poi_id": "string (可选)",
  "merchant_id": "string (可选)",
  "detail": "string",
  "created_at": "timestamp"
}
```

### 2.5 merchants 表 (O2O 核销)

```json
{
  "_id": "string",
  "name": "string (如 '大余湾烤肠铺')",
  "qr_secret": "string (二维码加密种子)",
  "daily_quota": 200,
  "redeemed_today": 0,
  "item_name": "string (如 '烤肠')",
  "item_value": 5,
  "active": true
}
```

---

## 三、页面架构

### 3.1 路由表 (pages.json)

```
pages/
  battlefield/index    — 主战场 (首页，无底导)
  defuse/index         — QTE 破阵挑战 (全屏)
  redeem/index         — 天机眼扫码核销
  shop/index           — 法器商城
  profile/index        — 修行者简报
  voice-record/index   — 语音"神念"录制 (半屏弹窗)
```

无 TabBar，所有页面通过 `uni.navigateTo` 跳转。

### 3.2 主战场页 (battlefield/index)

**布局 (自上而下):**

```
┌────────────────────────────────────────┐
│ [阵营图腾]     进度条 (红蓝)  [天机眼扫码] │  ← 顶部栏 fixed
├────────────────────────────────────────┤
│                                        │
│          全息太极罗盘 (60%)             │  ← 中部主体
│    路网投影 + 红蓝 POI 发光节点         │
│    中心三角标随陀螺仪转动              │
│                                        │
├────────────────────────────────────────┤
│                                        │
│   灵石: 3    玄晶: 128                 │  ← 货币栏
│                                        │
├────────────────────────────────────────┤
│                                        │
│  [玉牌·布阵]              [虎符·破阵]   │  ← 底部按钮 fixed
│   消耗 1 灵石              消耗 2 玄晶   │
│                                        │
└────────────────────────────────────────┘

全局: 阵营呼吸光晕 (边缘红/蓝)
全局: 扫描线叠层 (极低透明度)
全局: 大余湾古建暗纹 (5%透明度背景)
```

**交互逻辑:**
- GPS 围栏判定: `calcDistance(userLat, userLng, poiLat, poiLng) < 50`
- 未进入围栏: 布阵/破阵按钮灰色禁用 + "请靠近阵眼"提示
- 进入围栏: 按钮点亮 + 心跳震动 + POI 节点放大动画
- 点击布阵 → 跳转语音录制页 → 录完返回 → 调用云函数
- 点击破阵 → 跳转 QTE 挑战页

### 3.3 QTE 破阵页 (defuse/index)

**布局:**

```
┌────────────────────────────────────────┐
│          倒计时: 10s                    │  ← 顶部
├────────────────────────────────────────┤
│                                        │
│     ╭─────╮  ╭─────╮                  │
│     │ 敌方 │  │ 敌方 │  ← 2D 符咒气泡  │  ← 随陀螺仪浮动
│     │ 符咒 │  │ 符咒 │   CSS translate3d│
│     ╰─────╯  ╰─────╯                  │
│                   ╭─────╮              │
│                   │ 敌方 │              │
│                   │ 符咒 │              │
│                   ╰─────╯              │
│                                        │
├────────────────────────────────────────┤
│  已击破: 7/10          玄晶: -2        │  ← 底部状态
└────────────────────────────────────────┘
```

**交互逻辑:**
- 进入时: 扣除 2 玄晶（前置检查 >= 2）
- 6-8 个敌方符咒气泡随机出现在屏幕上
- 气泡位置随手机陀螺仪 (DeviceOrientation) 偏移
- 点击气泡 = 击破，短震 + 击破音效
- 10 秒内击破 >= 10 个 = 成功
- 成功: +15 玄晶, 敌方阵法 -1, 胜利音效
- 失败: -5 玄晶 (额外), 手机长震, 失败音效

### 3.4 语音录制页 (voice-record/index)

**布局: 半屏底部弹窗**

```
┌────────────────────────────────────────┐
│  布阵 · 录制神念                 [关闭] │
├────────────────────────────────────────┤
│                                        │
│  当前阵眼: 余庆堂                      │
│  请录制与景点文化相关的 5 秒语音        │
│                                        │
│         ╭──────────────╮              │
│         │   ◉ 长按录制  │  ← 录音按钮  │
│         │   5s / 5s    │              │
│         ╰──────────────╯              │
│                                        │
│  消耗: 1 灵石 (剩余 2)                 │
│  [确认布阵]                            │
└────────────────────────────────────────┘
```

### 3.5 天机眼核销页 (redeem/index)

**布局:**

```
┌────────────────────────────────────────┐
│  天机眼 · 灵石核销             [返回]   │
├────────────────────────────────────────┤
│                                        │
│  当前玄晶: 128                         │
│  核销需要: 100 玄晶                    │
│  今日剩余: 2/2 次                      │
│  全服剩余: 156/200 份                  │
│                                        │
│         ╭──────────────╮              │
│         │   扫码核销    │              │
│         ╰──────────────╯              │
│                                        │
│  核销记录:                             │
│  - 14:32 烤肠铺 -100玄晶 ✓            │
│                                        │
└────────────────────────────────────────┘
```

### 3.6 法器商城页 (shop/index)

**布局:**

```
┌────────────────────────────────────────┐
│  法器商城                      [返回]   │
├────────────────────────────────────────┤
│                                        │
│  ┌────────┐  ┌────────┐              │
│  │ 天眼通 │  │ 加固符 │              │
│  │ 透视全图│  │ 增加防守│              │
│  │ 50 玄晶 │  │ 30 玄晶 │              │
│  │ [购买]  │  │ [购买]  │              │
│  └────────┘  └────────┘              │
│                                        │
│  玄晶余额: 128                         │
└────────────────────────────────────────┘
```

---

## 四、云函数清单

| 云函数名 | 触发方式 | 功能 | 并发控制 |
|----------|----------|------|----------|
| `user-login` | 客户端调用 | 微信登录，自动分配阵营，新手送 3 灵石 + 30 玄晶 | 无 |
| `get-battlefield` | 客户端轮询 (5s) | 返回 10 个 POI 当前状态 + 全局红蓝占比 | 无 |
| `plant-mine` | 客户端调用 | 布阵: 校验围栏+灵石，上传语音，写 mine，更新 POI | **事务锁** |
| `defuse-mine` | 客户端调用 | 破阵结算: 校验 QTE 结果，更新 POI + 玄晶 | **事务锁** |
| `passive-yield` | 定时触发器 (10min) | 遍历存活 mine，发放被动玄晶收益 | 批量更新 |
| `redeem-scan` | 客户端调用 | 扫码核销: 校验玄晶/额度/二维码合法性 | **事务锁** |
| `shop-buy` | 客户端调用 | 购买道具: 扣玄晶，加道具 | 事务 |
| `daily-share` | 客户端调用 | 分享朋友圈: 每日首次送 1 灵石 | 日期校验 |
| `get-stats` | 管理端调用 | 返回三个生死红线指标数据 | 无 |
| `content-check` | plant-mine 内调用 | 调用天御 API 审核语音内容 | 无 |

---

## 五、Pinia Store 设计

### 5.1 stores/user.ts

```typescript
interface UserState {
  openid: string
  faction: 'blue' | 'red'
  lingshi: number
  xuanjing: number
  status: 'normal' | 'dying'
  items: { id: string; name: string; count: number }[]
  minesPlanted: number
  minesDefusedWin: number
  redeemedToday: number
}
```

### 5.2 stores/battlefield.ts (新增)

```typescript
interface BattlefieldState {
  pois: POIState[]           // 10 个阵眼实时状态
  globalBlue: number         // 蓝方控制阵眼总数
  globalRed: number          // 红方控制阵眼总数
  nearestPOI: POIState | null // 最近的阵眼
  isInFence: boolean         // 是否在围栏内
  currentPoiId: string | null // 当前所在围栏的 POI ID
}
```

### 5.3 stores/location.ts (重构)

```typescript
interface LocationState {
  lat: number
  lng: number
  heading: number            // 陀螺仪朝向角度
  ready: boolean
  watchId: number | null     // 持续定位 watchId
}
```

### 5.4 stores/audio.ts (新增)

```typescript
interface AudioState {
  ambientPlaying: boolean
  muted: boolean
}
// 方法: playAmbient / stopAmbient / playSfx(name) / toggleMute
```

---

## 六、开发里程碑 (Task Breakdown)

### Phase 0: 基础设施 (Day 1 — 3月8日)
- [ ] P0-1: 创建 GitHub 仓库 `dayuwan-spirit-vein`
- [ ] P0-2: 初始化腾讯云 CloudBase 环境
- [ ] P0-3: 创建数据库集合 + Schema (users/pois/mines/transactions/merchants)
- [ ] P0-4: 预置 10 个大余湾 POI 数据 (需要坐标)
- [ ] P0-5: 更新 pages.json 路由 (去掉 tabBar，新页面结构)
- [ ] P0-6: 全局 CSS 变量 + 设计系统 token 写入 uni.scss
- [ ] P0-7: 重构组件库 (YjNavBar/YjButton/YjCard/YjModal → 新设计系统)

### Phase 1: 核心闭环 (Day 2-4 — 3月9-11日)
- [ ] P1-1: `user-login` 云函数 (微信登录 + 阵营分配 + 新手礼包)
- [ ] P1-2: `get-battlefield` 云函数 (返回 10 POI 状态)
- [ ] P1-3: 主战场页 — 顶部进度条 (红蓝占比)
- [ ] P1-4: 主战场页 — 全息罗盘 (简化版: 以用户为中心的极坐标 POI 分布，CSS 旋转)
- [ ] P1-5: 主战场页 — 底部双按钮 (布阵/破阵) + 围栏判定灰/亮切换
- [ ] P1-6: GPS 持续定位 + 围栏进入/退出事件 + 心跳震动
- [ ] P1-7: `plant-mine` 云函数 (含事务锁)
- [ ] P1-8: 语音录制页 — 5 秒录音 + 上传云存储
- [ ] P1-9: 布阵完整流程: 进入围栏 → 点击布阵 → 录音 → 上传 → 写库 → 刷新地图
- [ ] P1-10: `defuse-mine` 云函数 (含事务锁)
- [ ] P1-11: QTE 破阵页 — 10 秒挑战 + 气泡点击 + 结算逻辑
- [ ] P1-12: 60% 变色算法 — POI 节点颜色实时变化

### Phase 2: 感官体验 (Day 5 — 3月12日)
- [ ] P2-1: 阵营呼吸光晕 (边缘红/蓝脉动)
- [ ] P2-2: 扫描线叠层 + 大余湾古建暗纹背景
- [ ] P2-3: 陀螺仪罗盘转动 (DeviceOrientation → CSS rotate3d)
- [ ] P2-4: QTE 气泡陀螺仪跟随 (DeviceOrientation → translate3d)
- [ ] P2-5: 音效系统 — InnerAudioContext 管理器
- [ ] P2-6: 环境音无缝循环 + 7 种交互音效
- [ ] P2-7: 震动反馈系统 (5 种场景)
- [ ] P2-8: 全屏防误触 (禁止下拉/橡皮筋/返回手势)
- [ ] P2-9: 进入/退出围栏的过渡动画

### Phase 3: 经济系统 (Day 6 — 3月13日)
- [ ] P3-1: 被动收益定时触发器 (每 10 分钟, passive-yield 云函数)
- [ ] P3-2: "濒死状态" 判定 (玄晶 < 5, UI 警告 + 破阵禁用)
- [ ] P3-3: 每日分享朋友圈送灵石 (`daily-share` 云函数)
- [ ] P3-4: 法器商城页 (天眼通 + 加固符 + 购买流程)
- [ ] P3-5: `shop-buy` 云函数
- [ ] P3-6: 道具使用逻辑 (天眼通: 透视全图 30s / 加固符: 某 mine 防御 +50%)

### Phase 4: O2O 核销 (Day 7 — 3月14日)
- [ ] P4-1: 天机眼核销页 UI
- [ ] P4-2: 小程序扫码 API (uni.scanCode) + 二维码格式设计
- [ ] P4-3: `redeem-scan` 云函数 (校验: 玄晶>=100, 每日<=2次, 全服<=200份, QR合法)
- [ ] P4-4: 商户端 — 简化方案: 小程序码生成 + 云函数核销确认
- [ ] P4-5: 核销记录展示 + Transaction 写入

### Phase 5: Alpha 联调 (Day 7-8 — 3月14-15日)
- [ ] P5-1: 端到端测试: 登录 → 看阵眼 → 进围栏 → 布阵(含录音) → 破阵(QTE) → 阵眼变色
- [ ] P5-2: 经济系统测试: 灵石/玄晶进出账平衡验证
- [ ] P5-3: 并发测试: 同时破阵同一阵眼
- [ ] P5-4: GPS 漂移测试: 模拟器 + 真机
- [ ] P5-5: 音效/震动在 iOS + Android 的兼容性
- [ ] P5-6: 修复 P0 级 Bug

### Phase 6: Beta 实地 (3月16-20日)
- [ ] P6-1: 接入真实大余湾 GPS 坐标
- [ ] P6-2: 实地行走测试 (围栏准确性、GPS 漂移)
- [ ] P6-3: 天机眼扫码核销实地测试
- [ ] P6-4: 语音内容安全审核接入 (天御 API)
- [ ] P6-5: 性能优化: 电量消耗、网络弱环境
- [ ] P6-6: 数据埋点: 三个生死红线指标
- [ ] P6-7: Beta 版发布 → 种子用户测试

### Phase 7: RC 打磨 (3月21日 - 4月28日)
- [ ] P7-1: Redis 分布式锁替换数据库事务
- [ ] P7-2: 实时数据推送替换轮询
- [ ] P7-3: CloudBase 实时推送: 阵眼状态变化
- [ ] P7-4: 压力测试: 模拟 500 并发
- [ ] P7-5: UI 精调: 罗盘细节、动画打磨、音效微调
- [ ] P7-6: 小程序审核准备: 隐私协议、位置权限说明、内容安全
- [ ] P7-7: 4月28日 RC 封版

### Phase 8: Release (5月1日)
- [ ] P8-1: 正式上线
- [ ] P8-2: 运营监控仪表盘 (三个红线指标)
- [ ] P8-3: 应急预案: 服务降级、热修复方案

---

## 七、关键风险与应对

| 风险 | 等级 | 应对 |
|------|------|------|
| 7 天交付 Alpha 含全功能 | **极高** | 每日 standup，P0 优先，非阻塞功能允许简化版先上 |
| GPS 漂移 (30m 围栏) | 高 | 实际围栏 50m，UI 显示 30m，加"灵脉感应中"缓冲态 |
| 小程序 2MB 包大小 | 中 | 音效文件放云存储首次下载缓存，不打入包 |
| 语音审核延迟 | 中 | 异步审核，先展示再下架违规内容 |
| 并发脏写 | 高 | Alpha 用 DB 事务，Beta 切 Redis 锁 |
| 陀螺仪兼容性 | 中 | 降级方案: 无陀螺仪时气泡静态分布，罗盘不转 |
| 微信审核被拒 | 中 | 提前准备: 隐私协议、定位说明、UGC 内容管控 |
| POI 坐标未采集 | **阻塞** | 需要实地采集或地图标注 10 个大余湾景点坐标 |

---

## 八、文件结构 (目标态)

```
yujian/
├── src/
│   ├── pages/
│   │   ├── battlefield/index.vue    # 主战场
│   │   ├── defuse/index.vue         # QTE 破阵
│   │   ├── voice-record/index.vue   # 语音录制
│   │   ├── redeem/index.vue         # 天机眼核销
│   │   ├── shop/index.vue           # 法器商城
│   │   └── profile/index.vue        # 修行者简报
│   ├── components/
│   │   ├── YjTopBar.vue             # 顶部进度条 (红蓝)
│   │   ├── YjCompass.vue            # 全息罗盘
│   │   ├── YjPoiNode.vue            # 阵眼 POI 节点
│   │   ├── YjFactionAura.vue        # 阵营呼吸光晕
│   │   ├── YjButton.vue             # 通用按钮
│   │   ├── YjModal.vue              # 弹窗
│   │   ├── YjCurrencyBar.vue        # 货币显示栏
│   │   ├── YjQteBubble.vue          # QTE 符咒气泡
│   │   └── YjScanlines.vue          # 扫描线叠层
│   ├── stores/
│   │   ├── user.ts                  # 用户状态
│   │   ├── battlefield.ts           # 战场状态
│   │   ├── location.ts              # 位置 + 陀螺仪
│   │   └── audio.ts                 # 音效管理
│   ├── utils/
│   │   ├── geo.ts                   # 距离计算 + 围栏判定
│   │   ├── faction.ts               # 阵营分配算法
│   │   ├── vibrate.ts               # 震动封装
│   │   └── cloud.ts                 # 云函数调用封装
│   ├── static/
│   │   ├── icons/                   # SVG 图标
│   │   ├── textures/                # 古建暗纹等纹理
│   │   └── audio/                   # 本地备用音效 (小体积)
│   ├── App.vue
│   ├── main.ts
│   ├── pages.json
│   ├── manifest.json
│   └── uni.scss                     # 全局设计系统变量
├── uniCloud-aliyun/ → uniCloud-tcb/  # 切换为腾讯云
│   ├── cloudfunctions/
│   │   ├── user-login/
│   │   ├── get-battlefield/
│   │   ├── plant-mine/
│   │   ├── defuse-mine/
│   │   ├── passive-yield/
│   │   ├── redeem-scan/
│   │   ├── shop-buy/
│   │   ├── daily-share/
│   │   ├── get-stats/
│   │   └── content-check/
│   └── database/
│       ├── users.schema.json
│       ├── pois.schema.json
│       ├── mines.schema.json
│       ├── transactions.schema.json
│       └── merchants.schema.json
├── design-system/                   # 设计系统文档
├── docs/agent_plans/                # 计划文档
├── uno.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 九、三个生死红线指标埋点

### 指标 1: 冷门阵眼渗透率 >= 30%

```typescript
// 每个 POI 的独立访客去重计数
// 埋点: 用户进入围栏时，记录 { user_id, poi_id, timestamp }
// 计算: 偏僻 POI 的 unique_users / total_active_users
```

### 指标 2: O2O 核销转化率 >= 40%

```typescript
// 分子: 至少核销 1 次的用户数
// 分母: 至少赚取过 100 玄晶的用户数
// 数据源: transactions 表 where type='redeem'
```

### 指标 3: 人均交互频次 >= 5 次

```typescript
// 统计: 单个用户单次会话内 (布阵 + 破阵) 总次数
// 会话定义: 从打开小程序到关闭, onShow → onHide
// 数据源: transactions 表 where type in ('plant', 'defuse_win', 'defuse_fail')
```

---

## 十、腾讯云配置清单

| 步骤 | 操作 | 备注 |
|------|------|------|
| 1 | 开通 CloudBase 云开发 | 选择按量付费或标准版 |
| 2 | 创建环境 (如 `yujian-prod`) | 选择上海地域 |
| 3 | 关联微信小程序 AppID | 在 CloudBase 控制台绑定 |
| 4 | 创建数据库集合 x5 | users/pois/mines/transactions/merchants |
| 5 | 配置数据库安全规则 | 按角色控制读写权限 |
| 6 | 开通云存储 | 用于语音文件 |
| 7 | 部署云函数 x10 | 见云函数清单 |
| 8 | 配置定时触发器 | passive-yield 每 10 分钟 |
| 9 | (Beta) 开通 Redis 内存版 | 2GB 起步 |
| 10 | (Beta) 开通天御内容安全 | 语音审核 |
| 11 | 静态网站托管 | H5 版本部署 |

---

*计划制定时间: 2026-03-08*
*预计 Alpha: 2026-03-15*
*预计 Release: 2026-05-01*
