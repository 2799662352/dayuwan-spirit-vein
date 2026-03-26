# 与见·DAMO 渐进合并重构设计

> 日期：2026-03-25  
> 状态：已批准  
> 方案：方案 A（渐进合并）

## 背景

项目存在新旧两套并行架构：旧版 battlefield 体系（5 个 TS store + 云函数）和新版 guide→index 体系（game.js + mock 数据）。两套系统数据模型不统一、语言混用、CSS 在微信端频繁兼容性问题。本次重构目标是以新版 UI/交互为主干，将旧版有价值的后端对接和数据逻辑合并进来。

## 决策记录

- 平台：微信小程序为主，H5 为辅（调试/演示）
- 范围：两套合并，保留旧版云函数和 user store 有价值部分
- 后端：继续使用 uniCloud 阿里云

---

## 模块一：页面路由精简

保留 5 个核心页面，清理 4 个断裂旧页面：

| 页面 | 职责 | 动作 |
|---|---|---|
| `pages/guide/index` | 启动引导·测灵石 FSM·阵营分配 | 保留 |
| `pages/index/index` | LBS 暗网主战场·HUD·弹窗 | 保留 |
| `pages/arScan/index` | AR 伪3D 破阵 | 保留 |
| `pages/profile/index` | 个人中心 | 重写（接入合并 store） |
| `pages/shop/index` | 商城·玄晶补充 | 重写（接入云函数） |

清理：`battlefield`、`defuse`、`voice-record`、`redeem`

---

## 模块二：Store 统一架构

3 个职责清晰的 TS Store：

### `stores/user.ts`
- 合并来源：旧 user.ts + game.js 的 userAssets/userCamp
- 职责：用户身份、阵营、玄晶/灵石、道具、登录
- 关键方法：`wxLogin()`, `costCrystal()`, `updateXuanjing()`, `canPlant()`, `canDefuse()`

### `stores/map.ts`
- 合并来源：旧 location.ts + game.js 的 nodes/currentLocation/checkInNode
- 职责：GPS 定位、节点数据、围栏碰撞、附近检测
- 关键方法：`startWatching()`, `updateLocation()`, `checkInNode()`, `nearbyNode` computed

### `stores/ui.ts`
- 新建
- 职责：弹窗状态(hack/reward/alert)、全局 loading
- 关键方法：`showHack()`, `showReward()`, `showAlert()`, `closeAll()`

保留 `stores/audio.ts` 不动。删除 `stores/game.js` 和 `stores/battlefield.ts`。

---

## 模块三：CSS 安全规范（WXSS 兼容白名单）

### 禁用清单
| 禁用 | 替代 |
|---|---|
| `inset: 0` | `top:0; right:0; bottom:0; left:0` |
| `filter` 全家族 | `opacity` + `box-shadow` + 独立元素 |
| `backdrop-filter` | 多层 `rgba()` 叠加 |
| 多重 `animation: a, b` | 拆分到子元素 |
| `vh` 在 keyframes | `rpx` 或 `%` |
| `animation-delay` + `forwards` | JS `v-if` + `setTimeout` |
| `*` 选择器 | 具体标签 `view`/`text` |
| CSS `var()` | SCSS `$var` |

写入 `.cursor/rules/wxss-safe.mdc` 作为持久规则。

---

## 模块四：云函数对接

### 一期（核心流程）
| 云函数 | 页面 | 替换 |
|---|---|---|
| `user-login` | guide→index | 服务端阵营分配 |
| `get-battlefield` | index | 替代 mapConfig mock |
| `plant-mine` | index 布阵 | 服务端资产扣减 |
| `defuse-mine` | arScan 破阵 | 服务端结算 |

### 二期（增强）
`get-stats`, `redeem`, `shop-buy`, `share-reward`

统一通过 `utils/cloud.ts` 的 `callCloud<T>()` 封装。

---

## 模块五：技术栈定型

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | uni-app + Vue 3 Composition API | 3.0.0-alpha |
| 构建 | Vite | 5.2.8 |
| 状态 | Pinia | ^2.3 |
| 样式 | UnoCSS + SCSS | ^66.0 |
| 语言 | TypeScript 严格模式 | ^5.7 |
| UI 库 | wot-design-uni | ^1.9 |
| 后端 | uniCloud 阿里云 | — |
| 平台 | 微信小程序(主) + H5(辅) | — |
| 测试 | vitest(单测) | — |

---

## 实施顺序

1. 建立 CSS 安全规范（Cursor Rule）
2. Store 统一重构（user.ts 合并 + map.ts 新建 + ui.ts 新建）
3. 清理旧页面和断裂代码
4. 修复现有 3 个页面接入新 store
5. 重写 profile 和 shop 页面
6. 云函数一期对接
7. 全局 WXSS 兼容性扫描修复
