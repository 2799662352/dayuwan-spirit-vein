# 渐进合并重构 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将新旧两套架构合并为统一的 TypeScript 架构，建立 WXSS 安全规范，精简页面路由，重构 Store 层。

**Architecture:** 以新版 guide→index→arScan 流程为主干，将旧版 user.ts 的登录/资产逻辑和 location.ts 的定位逻辑迁入新 Store 体系。CSS 全面遵守 WXSS 安全白名单。云函数通过 callCloud 统一封装对接。

**Tech Stack:** Vue 3 Composition API, TypeScript strict, Pinia, UnoCSS + SCSS, uniCloud, Vite 5.2.8

---

### Task 1: 建立 WXSS 安全规范 Cursor Rule

**Files:**
- Create: `.cursor/rules/wxss-safe.mdc`

**Step 1: 创建规则文件**

```markdown
---
description: WXSS 安全规范 - 微信小程序 CSS 兼容性硬约束
globs: ["src/**/*.vue", "src/**/*.scss"]
---

# WXSS 安全规范

所有 `.vue` 文件的 `<style>` 块必须遵守以下约束：

## 禁用属性（微信 WXSS 不支持）
- ❌ `inset` → ✅ `top:0; right:0; bottom:0; left:0`
- ❌ `filter`（blur/brightness/hue-rotate/drop-shadow 全部禁用）→ ✅ `opacity` + `box-shadow`
- ❌ `backdrop-filter` → ✅ 多层 `rgba()` 背景叠加
- ❌ 多重 `animation: a, b` → ✅ 拆到独立子元素各自单一动画
- ❌ `vh`/`vw` 在 `@keyframes` 中 → ✅ `rpx` 或 `%`
- ❌ `animation-delay` + `forwards` 控制初始隐藏 → ✅ JS `v-if` + `setTimeout`
- ❌ `*` 通配选择器 → ✅ 具体标签 `view`/`text`
- ❌ CSS `var()` → ✅ SCSS `$var` 编译时替换
- ❌ `gap` 在低版本可能不支持 → ✅ `margin` 替代或确认基础库版本

## 安全属性
- ✅ `position`, `display: flex`, `transform`, `opacity`, `box-shadow`, `text-shadow`
- ✅ `border-radius`, `background`（linear-gradient/radial-gradient）
- ✅ `animation` 单一声明, `transition`, `@keyframes`
- ✅ `rpx` 单位, `%` 百分比
```

**Step 2: 验证文件已创建**

Run: `ls .cursor/rules/wxss-safe.mdc`
Expected: 文件存在

**Step 3: Commit**

```bash
git add .cursor/rules/wxss-safe.mdc
git commit -m "chore: add WXSS safety rules for WeChat mini program"
```

---

### Task 2: 创建统一 Store — `stores/user.ts` 合并重构

**Files:**
- Modify: `src/stores/user.ts`（合并 game.js 的 userAssets/userCamp/costCrystal）
- Delete: `src/stores/game.js`（合并完成后删除）

**Step 1: 重写 user.ts，合并 game.js 的资产和阵营字段**

将以下字段从 `game.js` 迁入 `user.ts`：
- `userAssets`（重命名为 xuanjing）→ 对齐旧版 `profile.xuanjing`
- `userCamp` → 对齐旧版 `faction`
- `costCrystal()` → 对齐旧版 `updateXuanjing()`

保留旧版 `user.ts` 的全部接口（`wxLogin`, `canPlant`, `canDefuse`, `UserProfile` 类型等），将 mock fallback 中的 xuanjing 默认值从 30 改为 1000（与 game.js 对齐）。

新增 `allocateCamp()` 严格交替分配逻辑（从 guide/index.vue 迁入 store 层）。

**Step 2: 验证 TypeScript 编译**

Run: `npx vue-tsc --noEmit`
Expected: 无 user.ts 相关错误

**Step 3: 删除 game.js**

Run: `rm src/stores/game.js`

**Step 4: Commit**

```bash
git add src/stores/user.ts
git rm src/stores/game.js
git commit -m "refactor: merge game.js into user.ts, unify asset/camp model"
```

---

### Task 3: 创建统一 Store — `stores/map.ts` 新建

**Files:**
- Create: `src/stores/map.ts`（从 game.js 的 nodes/定位 + 旧 location.ts 合并）
- Reference: `src/stores/location.ts`（保留作为迁移参考后删除）
- Reference: `src/config/mapConfig.js`

**Step 1: 创建 map.ts**

包含：
- State: `currentLocation`, `nodes`（从 mapConfig 初始化）, `heading`
- Getters: `nearbyNode`, `isInFence`
- Actions: `startWatching()`, `stopWatching()`, `updateLocation()`, `checkInNode()`

定位逻辑从旧 `location.ts` 迁入，保留条件编译 `#ifdef MP-WEIXIN` / `#ifdef H5`。
Haversine 距离计算从 `game.js` 迁入。

**Step 2: 将 mapConfig.js 转为 mapConfig.ts**

添加类型定义 `SpiritNode` interface。

**Step 3: 验证编译**

Run: `npx vue-tsc --noEmit`
Expected: 无 map.ts 相关错误

**Step 4: Commit**

```bash
git add src/stores/map.ts src/config/mapConfig.ts
git rm src/config/mapConfig.js src/stores/location.ts
git commit -m "refactor: create map.ts store, merge location + geofence logic"
```

---

### Task 4: 创建统一 Store — `stores/ui.ts` 新建

**Files:**
- Create: `src/stores/ui.ts`

**Step 1: 创建 ui.ts**

包含弹窗状态管理：
- State: `hackVisible`, `rewardVisible`, `alertVisible`, `rewardAmount`, `alertTitle`, `alertDesc`
- Actions: `openHack()`, `openReward(amount)`, `openAlert(title, desc)`, `closeAll()`

从 index.vue 的弹窗状态逻辑抽离到此处。

**Step 2: Commit**

```bash
git add src/stores/ui.ts
git commit -m "feat: create ui.ts store for modal state management"
```

---

### Task 5: 清理旧页面和断裂代码

**Files:**
- Modify: `src/pages.json`（移除 4 个旧页面路由）
- Delete: `src/pages/battlefield/index.vue`
- Delete: `src/pages/defuse/index.vue`
- Delete: `src/pages/voice-record/index.vue`
- Delete: `src/pages/redeem/index.vue`
- Delete: `src/stores/battlefield.ts`
- Delete: 不再使用的旧组件（`YjCompass.vue`, `YjPoiNode.vue`, `YjScanlines.vue`, `YjFactionAura.vue`, `YjTopBar.vue`, `YjCurrencyBar.vue`, `YjNavBar.vue`）

**Step 1: 修改 pages.json**

只保留 5 个页面路由：guide, index, arScan, profile, shop

**Step 2: 删除旧页面和组件文件**

**Step 3: 验证编译**

Run: `npm run dev:mp-weixin`（观察是否有 import 缺失报错）

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove legacy pages and components, clean page routes"
```

---

### Task 6: 修复 guide/index.vue 接入新 Store

**Files:**
- Modify: `src/pages/guide/index.vue`

**Step 1: 替换 import**

`import { useGameStore }` → `import { useUserStore }` from `@/stores/user`

**Step 2: 替换所有 game.xxx 调用**

- `game.userCamp = xxx` → `user.setFaction(xxx)`
- `allocateCamp()` 调用从页面迁到 `user.allocateCamp()`

**Step 3: 全面 WXSS 合规检查**

扫描 `<style>` 块，确认无禁用属性。

**Step 4: 验证微信开发者工具**

Run: `npm run dev:mp-weixin`
Expected: guide 页面正常渲染，长按完整流程通过

**Step 5: Commit**

```bash
git add src/pages/guide/index.vue
git commit -m "refactor: guide page uses unified user store"
```

---

### Task 7: 修复 index/index.vue 接入新 Store

**Files:**
- Modify: `src/pages/index/index.vue`

**Step 1: 替换 import**

- `useGameStore` → `useUserStore` + `useMapStore` + `useUiStore`

**Step 2: 替换数据绑定**

- 资产：`game.userAssets` → `user.profile.xuanjing`
- 定位：`game.currentLocation` → `map.currentLocation`
- 节点：`game.nearbyNode` → `map.nearbyNode`
- 弹窗：`showHack/showReward/showAlert` → `ui.hackVisible` 等
- 操作：`game.costCrystal()` → `user.updateXuanjing()`

**Step 3: 在 onMounted 中调用 map.startWatching()**

**Step 4: WXSS 合规检查**

**Step 5: 验证**

**Step 6: Commit**

```bash
git add src/pages/index/index.vue
git commit -m "refactor: index page uses unified store trio"
```

---

### Task 8: 修复 arScan/index.vue 接入新 Store

**Files:**
- Modify: `src/pages/arScan/index.vue`

同 Task 7 模式：替换 `useGameStore` → `useUserStore`。

**Commit:**
```bash
git add src/pages/arScan/index.vue
git commit -m "refactor: arScan page uses unified user store"
```

---

### Task 9: 重写 profile/index.vue

**Files:**
- Modify: `src/pages/profile/index.vue`

**Step 1: 编写个人中心页面**

显示：用户阵营图腾、玄晶/灵石余额、历史战绩统计、道具列表。
接入 `useUserStore`。
遵守赛博修真视觉规范 + WXSS 安全约束。

**Step 2: 验证 + Commit**

---

### Task 10: 重写 shop/index.vue

**Files:**
- Modify: `src/pages/shop/index.vue`

**Step 1: 编写商城页面**

聚灵丹购买入口、玄晶补充通道。
接入 `useUserStore`。
从 EnergyAlertModal 的 `@buy` 事件跳转而来。

**Step 2: 验证 + Commit**

---

### Task 11: 全局 WXSS 兼容性扫描

**Files:**
- All: `src/**/*.vue`

**Step 1: 搜索所有禁用属性**

```bash
rg "inset:|filter:|backdrop-filter|animation:.*,.*|:\\s*var\\(" src/ --glob "*.vue" -n
```

**Step 2: 逐一修复发现的问题**

**Step 3: 微信开发者工具全流程验证**

guide → index → arScan → profile → shop 全部页面无 WXSS 报错。

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: WXSS compatibility sweep across all pages"
```
