<template>
  <view class="currency-bar">
    <view class="currency-item">
      <text class="i-tabler-diamond currency-icon currency-icon--lingshi" />
      <text class="currency-value currency-value--lingshi">{{ lingshi }}</text>
      <text class="currency-label">灵石</text>
    </view>
    <view class="currency-divider" />
    <view class="currency-item">
      <text class="i-tabler-hexagon currency-icon currency-icon--xuanjing" />
      <text class="currency-value currency-value--xuanjing">{{ xuanjing }}</text>
      <text class="currency-label">玄晶</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  lingshi: number
  xuanjing: number
}>()
</script>

<style scoped>
.currency-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 16rpx 28rpx;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.currency-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.currency-icon {
  font-size: 24rpx;
}

.currency-icon--lingshi { color: #FFD700; }
.currency-icon--xuanjing { color: #00FFFF; }

.currency-value {
  font-size: 32rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.currency-value--lingshi { color: #FFD700; }
.currency-value--xuanjing { color: #00FFFF; }

.currency-label {
  color: #5A4A3A;
  font-size: 20rpx;
}

.currency-divider {
  width: 1rpx;
  height: 32rpx;
  background: #2A1A1A;
}
</style>
