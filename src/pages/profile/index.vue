<template>
  <view class="profile-page">
    <view class="profile-body" :style="{ paddingTop: safeTop + 'px' }">
      <!-- 1 安全区由 paddingTop 承担 -->

      <!-- 2 阵营条幅 -->
      <view
        class="faction-banner"
        :class="{
          'faction-banner--blue': user.faction === 'blue',
          'faction-banner--red': user.faction === 'red',
          'faction-banner--empty': !user.faction,
        }"
      >
        <text class="faction-banner__seal">{{ sealGlyph }}</text>
        <view class="faction-banner__meta">
          <text class="faction-banner__name">{{ factionDisplayName }}</text>
        </view>
      </view>

      <!-- 3 资产 -->
      <view class="panel">
        <text class="panel__title">资产</text>
        <view class="assets-row">
          <view class="assets-item">
            <text class="assets-item__label">玄晶</text>
            <text class="assets-item__value assets-item__value--cyan">{{ user.profile?.xuanjing ?? 0 }}</text>
          </view>
          <view class="assets-item">
            <text class="assets-item__label">灵石</text>
            <text class="assets-item__value assets-item__value--gold">{{ user.profile?.lingshi ?? 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 4 战绩统计 -->
      <view class="panel">
        <text class="panel__title">战绩</text>
        <view class="stat-row">
          <text class="stat-row__label">布阵次数</text>
          <text class="stat-row__value">{{ user.profile?.mines_planted ?? 0 }}</text>
        </view>
        <view class="stat-row stat-row--divider">
          <text class="stat-row__label">破阵胜利</text>
          <text class="stat-row__value stat-row__value--win">{{ user.profile?.mines_defused_win ?? 0 }}</text>
        </view>
        <view class="stat-row stat-row--divider">
          <text class="stat-row__label">破阵失败</text>
          <text class="stat-row__value stat-row__value--fail">{{ user.profile?.mines_defused_fail ?? 0 }}</text>
        </view>
      </view>

      <!-- 5 道具 -->
      <view class="panel">
        <text class="panel__title">道具</text>
        <view v-for="item in displayItems" :key="item.id" class="item-row">
          <text class="item-row__name">{{ item.name }}</text>
          <text class="item-row__count">×{{ item.count }}</text>
        </view>
        <view v-if="!displayItems.length" class="item-empty">
          <text class="item-empty__text">暂无道具</text>
        </view>
      </view>

      <view class="scroll-spacer" />
    </view>

    <!-- 6 返回 -->
    <view class="footer">
      <view class="btn-back" @tap="goBack">
        <text class="btn-back__text">返回</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getFactionName } from '@/utils/faction'
import type { ShopItem } from '@/stores/user'

const user = useUserStore()
const safeTop = ref(44)

const factionDisplayName = computed(() => {
  if (!user.faction) return '——'
  return getFactionName(user.faction)
})

const sealGlyph = computed(() => {
  if (user.faction === 'blue') return '盟'
  if (user.faction === 'red') return '楼'
  return '道'
})

const displayItems = computed((): ShopItem[] => {
  const list = user.profile?.items
  if (list && list.length) return list
  return [
    { id: 'tianyan', name: '天眼通', count: 0 },
    { id: 'jiagu', name: '加固符', count: 0 },
  ]
})

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  // #ifdef MP-WEIXIN
  try {
    const c = uni.getMenuButtonBoundingClientRect()
    safeTop.value = c.top
  } catch {}
  // #endif
  // #ifdef H5
  safeTop.value = 12
  // #endif

  if (!user.isLoggedIn) {
    user.wxLogin()
  }
})
</script>

<style lang="scss" scoped>
$color-bg: #000000;
$obsidian-bg: rgba(20, 20, 20, 0.7);
$obsidian-border: rgba(0, 255, 255, 0.3);
$cyan-neon: #00e5ff;
$red-neon: #ff4444;
$gold-neon: #ffd700;
$text-muted: #8899aa;
$heading-glow: 0 0 16rpx rgba(0, 255, 255, 0.45);
$num-mono: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;

.profile-page {
  min-height: 100vh;
  background: $color-bg;
  display: flex;
  flex-direction: column;
}

.profile-body {
  flex: 1;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 24rpx;
  box-sizing: border-box;
}

.faction-banner {
  width: 100%;
  margin-bottom: 28rpx;
  padding: 32rpx 28rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
}

.faction-banner--blue {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.38) 0%, rgba(0, 60, 90, 0.55) 100%);
  border: 1rpx solid rgba(0, 229, 255, 0.55);
  box-shadow: 0 0 24rpx rgba(0, 229, 255, 0.28);
}

.faction-banner--red {
  background: linear-gradient(135deg, rgba(255, 68, 68, 0.42) 0%, rgba(90, 16, 16, 0.58) 100%);
  border: 1rpx solid rgba(255, 68, 68, 0.55);
  box-shadow: 0 0 24rpx rgba(255, 68, 68, 0.24);
}

.faction-banner--empty {
  background: linear-gradient(135deg, rgba(60, 60, 60, 0.5) 0%, rgba(20, 20, 20, 0.72) 100%);
  border: 1rpx solid rgba(0, 255, 255, 0.2);
}

.faction-banner__seal {
  font-size: 112rpx;
  font-weight: 700;
  line-height: 1;
  margin-right: 24rpx;
  color: #ffffff;
  text-shadow: 0 0 20rpx rgba(255, 255, 255, 0.35);
}

.faction-banner--blue .faction-banner__seal {
  color: $cyan-neon;
  text-shadow: 0 0 28rpx rgba(0, 229, 255, 0.6);
}

.faction-banner--red .faction-banner__seal {
  color: $red-neon;
  text-shadow: 0 0 28rpx rgba(255, 68, 68, 0.55);
}

.faction-banner__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.faction-banner__name {
  font-size: 40rpx;
  font-weight: 700;
  color: #e8ffff;
  text-shadow: $heading-glow;
}

.faction-banner--red .faction-banner__name {
  text-shadow: 0 0 16rpx rgba(255, 68, 68, 0.45);
}

.panel {
  background: $obsidian-bg;
  border: 1rpx solid $obsidian-border;
  border-radius: 24rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
  box-sizing: border-box;
}

.panel__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $cyan-neon;
  margin-bottom: 20rpx;
  text-shadow: 0 0 12rpx rgba(0, 255, 255, 0.35);
}

.assets-row {
  display: flex;
  flex-direction: row;
}

.assets-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.assets-item + .assets-item {
  margin-left: 24rpx;
}

.assets-item__label {
  font-size: 24rpx;
  color: $text-muted;
  margin-bottom: 8rpx;
}

.assets-item__value {
  font-size: 44rpx;
  font-weight: 700;
  font-family: $num-mono;
  font-variant-numeric: tabular-nums;
}

.assets-item__value--cyan {
  color: $cyan-neon;
  text-shadow: 0 0 14rpx rgba(0, 229, 255, 0.55);
}

.assets-item__value--gold {
  color: $gold-neon;
  text-shadow: 0 0 14rpx rgba(255, 215, 0, 0.45);
}

.stat-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.stat-row--divider {
  border-top: 1rpx solid rgba(0, 255, 255, 0.12);
}

.stat-row__label {
  font-size: 28rpx;
  color: $text-muted;
}

.stat-row__value {
  font-size: 30rpx;
  font-weight: 600;
  font-family: $num-mono;
  font-variant-numeric: tabular-nums;
  color: #e0f4ff;
  text-shadow: 0 0 10rpx rgba(0, 229, 255, 0.25);
}

.stat-row__value--win {
  color: #5eead4;
  text-shadow: 0 0 10rpx rgba(94, 234, 212, 0.35);
}

.stat-row__value--fail {
  color: #fca5a5;
  text-shadow: 0 0 10rpx rgba(252, 165, 165, 0.35);
}

.item-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 14rpx;
  padding-bottom: 14rpx;
}

.item-row + .item-row {
  border-top: 1rpx solid rgba(0, 255, 255, 0.12);
}

.item-row__name {
  font-size: 28rpx;
  color: #e8eaed;
}

.item-row__count {
  font-size: 28rpx;
  font-weight: 600;
  font-family: $num-mono;
  font-variant-numeric: tabular-nums;
  color: $gold-neon;
  text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.35);
}

.item-empty {
  padding-top: 16rpx;
  padding-bottom: 8rpx;
  display: flex;
  justify-content: center;
}

.item-empty__text {
  font-size: 26rpx;
  color: $text-muted;
}

.scroll-spacer {
  height: 32rpx;
}

.footer {
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  flex-shrink: 0;
}

.btn-back {
  background: $obsidian-bg;
  border: 1rpx solid $obsidian-border;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18rpx rgba(0, 255, 255, 0.12);
}

.btn-back__text {
  font-size: 30rpx;
  font-weight: 600;
  color: $cyan-neon;
  text-shadow: 0 0 12rpx rgba(0, 255, 255, 0.35);
}
</style>
