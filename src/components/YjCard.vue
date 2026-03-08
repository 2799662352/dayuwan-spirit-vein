<template>
  <view class="yj-card" :class="{ 'yj-card--glow': glow }">
    <view v-if="title" class="yj-card__header">
      <text class="yj-card__title">{{ title }}</text>
      <text v-if="subtitle" class="yj-card__subtitle">{{ subtitle }}</text>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  glow?: boolean
}>()
</script>

<style scoped>
.yj-card {
  background: linear-gradient(145deg, #2D1414, #3D2114);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.35);
}

.yj-card--glow {
  box-shadow: 0 4rpx 30rpx rgba(255, 140, 0, 0.15), 0 4rpx 20rpx rgba(0, 0, 0, 0.35);
}

.yj-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.yj-card__title {
  color: #FFD700;
  font-size: 28rpx;
  font-weight: 600;
}

.yj-card__subtitle {
  color: #A98C76;
  font-size: 22rpx;
}
</style>
