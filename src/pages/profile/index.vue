<template>
  <view class="profile-page">
    <view class="nav" :style="{ paddingTop: statusBarH + 'px' }">
      <view class="nav-back" @tap="goBack">
        <text class="i-tabler-arrow-left nav-icon" />
      </view>
      <text class="nav-title">修行者简报</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="profile-scroll">
      <!-- 阵营卡片 -->
      <view class="faction-card" :class="`faction-card--${userStore.faction}`">
        <view class="faction-badge">
          <text class="faction-badge__text">{{ userStore.faction === 'blue' ? '耕读盟' : '万金楼' }}</text>
        </view>
        <text class="faction-openid">{{ userStore.profile?.openid?.slice(0, 8) }}...</text>
      </view>

      <!-- 资产 -->
      <view class="stats-grid">
        <view class="stat-card">
          <text class="i-tabler-diamond stat-icon stat-icon--lingshi" />
          <text class="stat-value stat-value--lingshi">{{ userStore.profile?.lingshi ?? 0 }}</text>
          <text class="stat-label">灵石</text>
        </view>
        <view class="stat-card">
          <text class="i-tabler-hexagon stat-icon stat-icon--xuanjing" />
          <text class="stat-value stat-value--xuanjing">{{ userStore.profile?.xuanjing ?? 0 }}</text>
          <text class="stat-label">玄晶</text>
        </view>
      </view>

      <!-- 战绩 -->
      <view class="section">
        <text class="section-title">战绩</text>
        <view class="record-card">
          <view class="record-row">
            <text class="record-label">布阵次数</text>
            <text class="record-value">{{ userStore.profile?.mines_planted ?? 0 }}</text>
          </view>
          <view class="record-row">
            <text class="record-label">破阵成功</text>
            <text class="record-value record-value--success">{{ userStore.profile?.mines_defused_win ?? 0 }}</text>
          </view>
          <view class="record-row">
            <text class="record-label">破阵失败</text>
            <text class="record-value record-value--fail">{{ userStore.profile?.mines_defused_fail ?? 0 }}</text>
          </view>
          <view class="record-row">
            <text class="record-label">今日核销</text>
            <text class="record-value">{{ userStore.profile?.redeemed_today ?? 0 }} / 2</text>
          </view>
        </view>
      </view>

      <!-- 道具 -->
      <view class="section">
        <text class="section-title">法器背包</text>
        <view class="items-list">
          <view v-for="item in userStore.profile?.items" :key="item.id" class="item-row">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-count">x{{ item.count }}</text>
          </view>
          <view v-if="!userStore.profile?.items?.length" class="empty-state">
            <text class="empty-text">暂无法器, 前往商城购买</text>
          </view>
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="section">
        <view class="menu-item" @tap="goShop">
          <text class="i-tabler-building-store menu-icon" />
          <text class="menu-label">法器商城</text>
          <text class="i-tabler-chevron-right menu-arrow" />
        </view>
        <view class="menu-item" @tap="doShare">
          <text class="i-tabler-share menu-icon" />
          <text class="menu-label">分享得灵石</text>
          <text class="menu-sub">每日 1 次</text>
          <text class="i-tabler-chevron-right menu-arrow" />
        </view>
      </view>

      <view style="height: 100rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { callCloud } from '@/utils/cloud'

const userStore = useUserStore()

const statusBarH = ref(20)
try { statusBarH.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch (_) {}

function goBack() { uni.navigateBack() }

function goShop() { uni.navigateTo({ url: '/pages/shop/index' }) }

async function doShare() {
  const today = new Date().toISOString().slice(0, 10)
  if (userStore.profile?.last_share_date === today) {
    uni.showToast({ title: '今日已领取', icon: 'none' })
    return
  }

  // TODO: 接入真实分享 API
  userStore.updateLingshi(1)
  if (userStore.profile) userStore.profile.last_share_date = today
  await callCloud('daily-share')
  uni.showToast({ title: '获得 1 灵石!', icon: 'none' })
}
</script>

<style scoped>
.profile-page { min-height: 100vh; background: #000000; }

.nav {
  display: flex; align-items: center; padding: 0 24rpx; height: 88rpx;
  background: rgba(0, 0, 0, 0.9); position: sticky; top: 0; z-index: 20;
}
.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; }
.nav-icon { color: #A98C76; font-size: 28rpx; }
.nav-title { flex: 1; text-align: center; color: #F0E6D6; font-size: 32rpx; font-weight: 700; }
.nav-placeholder { width: 56rpx; }

.profile-scroll { height: calc(100vh); }

.faction-card {
  margin: 24rpx;
  padding: 36rpx 28rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  border: 1rpx solid;
}

.faction-card--blue {
  background: rgba(0, 168, 255, 0.05);
  border-color: rgba(0, 168, 255, 0.2);
}

.faction-card--red {
  background: rgba(255, 63, 63, 0.05);
  border-color: rgba(255, 63, 63, 0.2);
}

.faction-badge {
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
}

.faction-card--blue .faction-badge { background: rgba(0, 168, 255, 0.15); }
.faction-card--red .faction-badge { background: rgba(255, 63, 63, 0.15); }

.faction-badge__text {
  font-size: 28rpx;
  font-weight: 700;
}

.faction-card--blue .faction-badge__text { color: #00A8FF; }
.faction-card--red .faction-badge__text { color: #FF3F3F; }

.faction-openid { color: #5A4A3A; font-size: 22rpx; }

.stats-grid {
  display: flex;
  gap: 20rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-icon { font-size: 36rpx; }
.stat-icon--lingshi { color: #FFD700; }
.stat-icon--xuanjing { color: #00FFFF; }

.stat-value { font-size: 44rpx; font-weight: 700; font-variant-numeric: tabular-nums; }
.stat-value--lingshi { color: #FFD700; }
.stat-value--xuanjing { color: #00FFFF; }

.stat-label { color: #5A4A3A; font-size: 22rpx; }

.section { padding: 0 24rpx; margin-bottom: 16rpx; }
.section-title { color: #A98C76; font-size: 26rpx; font-weight: 500; padding: 16rpx 0; display: block; }

.record-card {
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
}

.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.record-row + .record-row { border-top: 1rpx solid rgba(42, 26, 26, 0.5); }

.record-label { color: #A98C76; font-size: 26rpx; }
.record-value { color: #F0E6D6; font-size: 28rpx; font-weight: 600; font-variant-numeric: tabular-nums; }
.record-value--success { color: #22C55E; }
.record-value--fail { color: #EF4444; }

.items-list {
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 16rpx;
  padding: 8rpx 24rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
}

.item-name { color: #F0E6D6; font-size: 26rpx; }
.item-count { color: #FFD700; font-size: 26rpx; font-weight: 600; }

.empty-state { padding: 32rpx 0; display: flex; justify-content: center; }
.empty-text { color: #5A4A3A; font-size: 24rpx; }

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  gap: 16rpx;
}

.menu-icon { color: #FFD700; font-size: 32rpx; }
.menu-label { color: #F0E6D6; font-size: 28rpx; flex: 1; }
.menu-sub { color: #5A4A3A; font-size: 22rpx; }
.menu-arrow { color: #5A4A3A; font-size: 24rpx; }
</style>
