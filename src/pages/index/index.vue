<template>
  <view class="page">
    <!-- L0: 深渊赛博底色 -->
    <view class="abyss" />

    <!-- L1: HUD -->
    <view class="hud" :style="{ paddingTop: safeTop + 'px' }">
      <!-- 顶栏：玄晶 + 灵脉提示（避让胶囊） -->
      <view class="hud__top" :style="{ paddingRight: capsuleRight + 'px' }">
        <view class="crystal-badge obsidian-sm">
          <text class="crystal-badge__icon">◆</text>
          <text class="crystal-badge__val neon-gold">{{ user.userAssets }}</text>
        </view>
        <view v-if="map.nearbyNode" class="node-hint obsidian-sm">
          <text class="node-hint__pulse" />
          <text class="node-hint__text neon-cyan">{{ map.nearbyNode.name }}</text>
        </view>
      </view>

      <!-- 左侧：宗门玉牌 + 坐标数据流 -->
      <view class="hud__left">
        <view class="jade-badge" @tap="goProfile">
          <view class="jade-badge__inner">
            <text class="jade-badge__glyph">门</text>
          </view>
        </view>
        <view class="coord-stream">
          <text class="coord-stream__line">LAT: {{ coordLat }}</text>
          <text class="coord-stream__line">LNG: {{ coordLng }}</text>
          <text class="coord-stream__line coord-stream__status" :class="fieldStatusClass">{{ fieldStatusText }}</text>
        </view>
      </view>

      <!-- 底部操作台：双极控制 -->
      <view class="hud__bottom">
        <view class="ctrl-pole ctrl-pole--plant" @tap="onPlant">
          <view class="ctrl-pole__icon ctrl-pole__icon--cyan">
            <text class="ctrl-pole__glyph">阵</text>
          </view>
          <text class="ctrl-pole__label">布阵</text>
        </view>

        <view class="ctrl-pole ctrl-pole--hack" @tap="onHack">
          <view class="ctrl-pole__icon ctrl-pole__icon--gold">
            <text class="ctrl-pole__glyph">破</text>
            <view class="lightning lightning--1" />
            <view class="lightning lightning--2" />
          </view>
          <text class="ctrl-pole__label">破阵</text>
        </view>
      </view>
    </view>

    <!-- L2: 弹窗层 -->
    <HackModal
      :visible="ui.hackVisible"
      @close="ui.closeHack()"
      @confirm="doHack"
    />
    <RewardModal
      :visible="ui.rewardVisible"
      :amount="ui.rewardAmount"
      @close="ui.closeReward()"
      @claim="claimReward"
    />
    <EnergyAlertModal
      :visible="ui.alertVisible"
      :title="ui.alertTitle"
      :desc="ui.alertDesc"
      @close="ui.closeAlert()"
      @buy="goShop"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMapStore } from '@/stores/map'
import { useUiStore } from '@/stores/ui'
import HackModal from '@/components/HackModal.vue'
import RewardModal from '@/components/RewardModal.vue'
import EnergyAlertModal from '@/components/EnergyAlertModal.vue'

const user = useUserStore()
const map = useMapStore()
const ui = useUiStore()

// ── 胶囊避让 ──

const safeTop = ref(44)
const capsuleRight = ref(100)

function initSafeArea() {
  // #ifdef MP-WEIXIN
  try {
    const capsule = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getWindowInfo()
    safeTop.value = capsule.top
    capsuleRight.value = sysInfo.windowWidth - capsule.left + 8
  } catch {
    safeTop.value = 44
    capsuleRight.value = 100
  }
  // #endif
  // #ifdef H5
  safeTop.value = 12
  capsuleRight.value = 16
  // #endif
}

// ── 坐标数据流 ──

const coordLat = computed(() => {
  const lat = map.currentLocation.latitude
  return lat ? lat.toFixed(4) : '---.----'
})

const coordLng = computed(() => {
  const lng = map.currentLocation.longitude
  return lng ? lng.toFixed(4) : '---.----'
})

const fieldStatusText = computed(() => {
  const node = map.nearbyNode
  return node ? `灵脉：${node.name}` : '阵场：未踏入'
})

const fieldStatusClass = computed(() => {
  return map.nearbyNode ? 'coord-stream__status--active' : ''
})

const COST_PLANT = 80
const COST_HACK = 100

function guardCrystal(cost, action) {
  if (user.userAssets < cost) {
    ui.openAlert(
      '玄晶不足',
      `${action}需要 ${cost} 玄晶，当前余额 ${user.userAssets}`,
    )
    return false
  }
  return true
}

function onPlant() {
  if (!guardCrystal(COST_PLANT, '布阵')) return
  const ok = user.costCrystal(COST_PLANT)
  if (!ok) return
  uni.vibrateShort({ type: 'medium' }).catch(() => {})
  ui.openReward(150 + Math.floor(Math.random() * 100))
}

function onHack() {
  if (!guardCrystal(COST_HACK, '破阵')) return
  ui.openHack()
}

function doHack() {
  const ok = user.costCrystal(COST_HACK)
  if (!ok) {
    ui.closeHack()
    ui.openAlert('玄晶不足', '破阵需要 100 玄晶')
    return
  }
  ui.closeHack()
  uni.vibrateShort({ type: 'heavy' }).catch(() => {})
  setTimeout(() => {
    ui.openReward(200 + Math.floor(Math.random() * 150))
  }, 400)
}

function claimReward() {
  const amount = ui.rewardAmount
  user.updateXuanjing(amount)
  ui.closeReward()
  uni.showToast({ title: `+${amount} 玄晶`, icon: 'none' })
}

function goProfile() {
  uni.navigateTo({ url: '/pages/profile/index' })
}

function goShop() {
  ui.closeAlert()
  uni.navigateTo({ url: '/pages/shop/index' })
}

// ── 生命周期 ──

onMounted(() => {
  initSafeArea()
  map.startWatching()
})

onBeforeUnmount(() => {
  map.stopWatching()
})
</script>

<style scoped>
.page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* ═══════════════════════════════════
   L0: 深渊底色
   ═══════════════════════════════════ */

.abyss {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background: radial-gradient(circle at center, #1a1b26 0%, #0d0d12 100%);
}

/* ═══════════════════════════════════
   L1: HUD 叠加层
   ═══════════════════════════════════ */

.hud {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  padding-left: 20rpx;
  padding-right: 20rpx;
  z-index: 100;
}

.obsidian-sm {
  background: rgba(20, 20, 20, 0.88);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 32rpx;
}

/* ── 顶栏 ── */

.hud__top {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 0;
  pointer-events: auto;
}

.crystal-badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 24rpx;
  flex-shrink: 0;
}

.crystal-badge__icon {
  font-size: 28rpx;
  color: #fbbf24;
}

.crystal-badge__val {
  font-size: 28rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.node-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 8rpx 22rpx;
  max-width: 360rpx;
}

.node-hint__pulse {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #00e5ff;
  box-shadow: 0 0 10rpx #00e5ff;
  animation: hint-blink 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.node-hint__text {
  font-size: 24rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 左侧：宗门玉牌 + 坐标数据流 ── */

.hud__left {
  position: absolute;
  left: 20rpx;
  top: 50%;
  transform: translateY(-60%);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20rpx;
}

.jade-badge {
  width: 88rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jade-badge__inner {
  width: 72rpx;
  height: 100rpx;
  border-radius: 12rpx 12rpx 4rpx 4rpx;
  background: linear-gradient(180deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.04));
  border: 1px solid rgba(0, 229, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20rpx rgba(0, 229, 255, 0.15);
}

.jade-badge__glyph {
  font-size: 36rpx;
  font-weight: 900;
  color: rgba(0, 229, 255, 0.8);
  text-shadow: 0 0 12rpx rgba(0, 229, 255, 0.5);
  font-family: 'ZCOOL XiaoWei', 'STLiti', serif;
}

/* ── 坐标数据流 ── */

.coord-stream {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding-left: 8rpx;
}

.coord-stream__line {
  font-family: 'Courier New', 'SF Mono', 'Menlo', monospace;
  font-size: 20rpx;
  color: rgba(0, 229, 255, 0.35);
  letter-spacing: 0.06em;
  line-height: 1.4;
  text-shadow: 0 0 6rpx rgba(0, 229, 255, 0.15);
}

.coord-stream__status {
  color: rgba(255, 255, 255, 0.25);
  font-family: -apple-system, 'PingFang SC', sans-serif;
  font-size: 20rpx;
  margin-top: 4rpx;
}

.coord-stream__status--active {
  color: rgba(0, 229, 255, 0.7);
  text-shadow: 0 0 8rpx rgba(0, 229, 255, 0.4);
}

/* ── 底部操作台 ── */

.hud__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 24rpx;
  pointer-events: auto;
}

.ctrl-pole {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.ctrl-pole__icon {
  position: relative;
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctrl-pole__icon--cyan {
  background: rgba(0, 229, 255, 0.08);
  border: 2rpx solid rgba(0, 229, 255, 0.4);
  box-shadow: 0 0 24rpx rgba(0, 229, 255, 0.2), inset 0 0 16rpx rgba(0, 229, 255, 0.08);
}

.ctrl-pole__icon--gold {
  background: rgba(180, 140, 40, 0.1);
  border: 2rpx solid rgba(251, 191, 36, 0.45);
  box-shadow: 0 0 24rpx rgba(251, 191, 36, 0.2), inset 0 0 16rpx rgba(251, 191, 36, 0.08);
}

.ctrl-pole__glyph {
  font-size: 42rpx;
  font-weight: 900;
  font-family: 'ZCOOL XiaoWei', 'STLiti', serif;
}

.ctrl-pole--plant .ctrl-pole__glyph {
  color: #00e5ff;
  text-shadow: 0 0 14rpx rgba(0, 229, 255, 0.7);
}

.ctrl-pole--hack .ctrl-pole__glyph {
  color: #fbbf24;
  text-shadow: 0 0 14rpx rgba(251, 191, 36, 0.7);
}

.ctrl-pole__label {
  font-size: 22rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.1em;
}

/* ── 闪电特效 ── */

.lightning {
  position: absolute;
  width: 3rpx;
  height: 28rpx;
  background: #ff4444;
  box-shadow: 0 0 8rpx #ff4444, 0 0 16rpx rgba(255, 68, 68, 0.5);
  border-radius: 2rpx;
  animation: bolt-flash 0.8s ease-in-out infinite alternate;
}

.lightning--1 {
  top: -8rpx;
  right: 12rpx;
  transform: rotate(20deg);
  animation-delay: 0s;
}

.lightning--2 {
  top: 4rpx;
  right: 2rpx;
  transform: rotate(-30deg);
  animation-delay: 0.4s;
}

/* ═══════════════════════════════════
   霓虹字色
   ═══════════════════════════════════ */

.neon-cyan {
  color: #00e5ff;
  text-shadow: 0 0 10rpx rgba(0, 229, 255, 0.6), 0 0 28rpx rgba(0, 229, 255, 0.2);
}

.neon-gold {
  color: #fbbf24;
  text-shadow: 0 0 10rpx rgba(251, 191, 36, 0.5);
}

/* ═══════════════════════════════════
   动画
   ═══════════════════════════════════ */

@keyframes hint-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes bolt-flash {
  0% { opacity: 0.3; height: 20rpx; }
  100% { opacity: 1; height: 30rpx; }
}
</style>
