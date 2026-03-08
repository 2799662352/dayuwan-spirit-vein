<template>
  <view class="topbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="topbar__content">
      <!-- 左: 阵营图腾 -->
      <view class="topbar__faction" @tap="$emit('faction-tap')">
        <view
          class="faction-icon"
          :class="`faction-icon--${faction}`"
        >
          <text class="faction-icon__text">{{ faction === 'blue' ? '文' : '金' }}</text>
        </view>
      </view>

      <!-- 中: 红蓝进度条 -->
      <view class="topbar__progress">
        <view class="progress-track">
          <view
            class="progress-fill progress-fill--blue"
            :style="{ width: bluePercent + '%' }"
          />
          <view
            class="progress-fill progress-fill--red"
            :style="{ width: redPercent + '%', left: (100 - redPercent) + '%' }"
          />
          <view class="progress-divider" :style="{ left: bluePercent + '%' }" />
        </view>
        <view class="progress-labels">
          <text class="label-blue">{{ blueCount }}</text>
          <text class="label-vs">VS</text>
          <text class="label-red">{{ redCount }}</text>
        </view>
      </view>

      <!-- 右: 天机眼 -->
      <view class="topbar__action" @tap="$emit('redeem-tap')">
        <view class="action-icon">
          <text class="i-tabler-eye topbar-icon" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Faction } from '@/utils/faction'

const props = defineProps<{
  faction: Faction | null
  blueCount: number
  redCount: number
}>()

defineEmits<{
  'faction-tap': []
  'redeem-tap': []
}>()

const statusBarHeight = ref(20)
try {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
} catch (_) {}

const total = computed(() => props.blueCount + props.redCount || 1)
const bluePercent = computed(() => Math.round((props.blueCount / total.value) * 100))
const redPercent = computed(() => Math.round((props.redCount / total.value) * 100))
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  background: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%);
}

.topbar__content {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  gap: 16rpx;
}

.faction-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid;
}

.faction-icon--blue {
  border-color: #00A8FF;
  background: rgba(0, 168, 255, 0.1);
}

.faction-icon--red {
  border-color: #FF3F3F;
  background: rgba(255, 63, 63, 0.1);
}

.faction-icon__text {
  font-size: 28rpx;
  font-weight: 700;
  color: inherit;
}

.faction-icon--blue .faction-icon__text { color: #00A8FF; }
.faction-icon--red .faction-icon__text { color: #FF3F3F; }

.topbar__progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.progress-track {
  height: 12rpx;
  background: #12121A;
  border-radius: 6rpx;
  position: relative;
  overflow: hidden;
  border: 1rpx solid rgba(205, 127, 50, 0.3);
}

.progress-fill {
  position: absolute;
  top: 0;
  height: 100%;
  transition: width 500ms ease-out;
}

.progress-fill--blue {
  left: 0;
  background: linear-gradient(90deg, #003366, #00A8FF);
  border-radius: 6rpx 0 0 6rpx;
}

.progress-fill--red {
  right: 0;
  background: linear-gradient(90deg, #FF3F3F, #660000);
  border-radius: 0 6rpx 6rpx 0;
}

.progress-divider {
  position: absolute;
  top: -2rpx;
  width: 4rpx;
  height: calc(100% + 4rpx);
  background: #FFD700;
  transform: translateX(-50%);
  box-shadow: 0 0 8rpx rgba(255, 215, 0, 0.6);
  transition: left 500ms ease-out;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label-blue {
  color: #00A8FF;
  font-size: 20rpx;
  font-weight: 700;
}

.label-vs {
  color: #5A4A3A;
  font-size: 16rpx;
  font-weight: 600;
}

.label-red {
  color: #FF3F3F;
  font-size: 20rpx;
  font-weight: 700;
}

.topbar__action {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.1);
  border: 1rpx solid rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-icon {
  color: #FFD700;
  font-size: 24rpx;
}
</style>
