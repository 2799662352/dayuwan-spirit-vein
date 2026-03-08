<template>
  <view class="redeem-page">
    <!-- 导航 -->
    <view class="nav" :style="{ paddingTop: statusBarH + 'px' }">
      <view class="nav-back" @tap="goBack">
        <text class="i-tabler-arrow-left nav-icon" />
      </view>
      <text class="nav-title">天机眼 · 灵石核销</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="redeem-scroll">
      <!-- 条件卡片 -->
      <view class="condition-card">
        <view class="condition-row">
          <text class="condition-label">当前玄晶</text>
          <text class="condition-value condition-value--xuanjing">{{ userStore.profile?.xuanjing ?? 0 }}</text>
        </view>
        <view class="condition-row">
          <text class="condition-label">核销需要</text>
          <text class="condition-value">100 玄晶</text>
        </view>
        <view class="condition-row">
          <text class="condition-label">今日已用</text>
          <text class="condition-value" :class="{ 'condition-value--warn': (userStore.profile?.redeemed_today ?? 0) >= 2 }">
            {{ userStore.profile?.redeemed_today ?? 0 }} / 2
          </text>
        </view>
        <view class="condition-row">
          <text class="condition-label">全服剩余</text>
          <text class="condition-value">{{ serverRemaining }} / 200</text>
        </view>
      </view>

      <!-- 扫码按钮 -->
      <view class="scan-area">
        <view
          class="scan-btn"
          :class="{ 'scan-btn--disabled': !userStore.canRedeem() }"
          @tap="doScan"
        >
          <text class="i-tabler-eye scan-btn__icon" />
        </view>
        <text class="scan-label">{{ userStore.canRedeem() ? '扫码核销' : '条件不足' }}</text>
      </view>

      <!-- 核销记录 -->
      <view class="records-section">
        <text class="section-title">核销记录</text>
        <view v-if="records.length === 0" class="empty-state">
          <text class="empty-text">暂无核销记录, 累积 100 玄晶即可兑换</text>
        </view>
        <view v-for="rec in records" :key="rec.id" class="record-item">
          <text class="record-time">{{ rec.time }}</text>
          <text class="record-merchant">{{ rec.merchant }}</text>
          <text class="record-amount">-{{ rec.amount }} 玄晶</text>
        </view>
      </view>

      <view style="height: 120rpx;" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAudioStore } from '@/stores/audio'
import { callCloud } from '@/utils/cloud'

const userStore = useUserStore()
const audioStore = useAudioStore()

const statusBarH = ref(20)
try { statusBarH.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch (_) {}

const serverRemaining = ref(156)
const records = ref<{ id: string; time: string; merchant: string; amount: number }[]>([])

async function doScan() {
  if (!userStore.canRedeem()) {
    uni.showToast({ title: '条件不足', icon: 'none' })
    return
  }

  try {
    const scanRes = await uni.scanCode({ scanType: ['qrCode'] })
    uni.showLoading({ title: '核销中...' })

    const res = await callCloud('redeem-scan', { qrData: scanRes.result })

    uni.hideLoading()

    if (res.success) {
      userStore.updateXuanjing(-100)
      if (userStore.profile) userStore.profile.redeemed_today++
      serverRemaining.value = Math.max(0, serverRemaining.value - 1)
      audioStore.playSfx('redeem')

      records.value.unshift({
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        merchant: '大余湾商铺',
        amount: 100,
      })

      uni.showToast({ title: '核销成功!', icon: 'none' })
    } else {
      uni.showToast({ title: res.error || '核销失败', icon: 'none' })
    }
  } catch (err: any) {
    uni.hideLoading()
    if (err.errMsg?.includes('cancel')) return
    uni.showToast({ title: '扫码失败', icon: 'none' })
  }
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.redeem-page {
  min-height: 100vh;
  background: #000000;
}

.nav {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: calc(88rpx);
  background: rgba(0, 0, 0, 0.9);
  position: sticky;
  top: 0;
  z-index: 20;
}

.nav-back {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon { color: #A98C76; font-size: 28rpx; }

.nav-title {
  flex: 1;
  text-align: center;
  color: #FFD700;
  font-size: 32rpx;
  font-weight: 700;
}

.nav-placeholder { width: 56rpx; }

.redeem-scroll { height: calc(100vh); }

.condition-card {
  margin: 24rpx;
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 20rpx;
  padding: 28rpx;
}

.condition-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.condition-row + .condition-row {
  border-top: 1rpx solid rgba(42, 26, 26, 0.5);
}

.condition-label { color: #A98C76; font-size: 26rpx; }

.condition-value {
  color: #F0E6D6;
  font-size: 28rpx;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.condition-value--xuanjing { color: #00FFFF; }
.condition-value--warn { color: #EF4444; }

.scan-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.scan-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFA500, #FFD700);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.3);
  margin-bottom: 16rpx;
  transition: all 200ms ease-out;
}

.scan-btn--disabled {
  background: #2A1A1A;
  box-shadow: none;
}

.scan-btn__icon {
  font-size: 48rpx;
  color: #0A0A0F;
}

.scan-btn--disabled .scan-btn__icon { color: #5A4A3A; }

.scan-label {
  color: #A98C76;
  font-size: 24rpx;
}

.records-section { padding: 0 24rpx; }

.section-title {
  color: #A98C76;
  font-size: 26rpx;
  font-weight: 500;
  padding: 24rpx 0 16rpx;
}

.empty-state {
  padding: 48rpx 0;
  display: flex;
  justify-content: center;
}

.empty-text { color: #5A4A3A; font-size: 24rpx; }

.record-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid rgba(42, 26, 26, 0.5);
}

.record-time { color: #5A4A3A; font-size: 22rpx; width: 100rpx; }
.record-merchant { color: #F0E6D6; font-size: 26rpx; flex: 1; }
.record-amount { color: #EF4444; font-size: 24rpx; font-variant-numeric: tabular-nums; }
</style>
