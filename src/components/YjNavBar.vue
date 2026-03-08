<template>
  <view class="yj-navbar">
    <view class="yj-navbar__status" :style="{ height: statusBarHeight + 'px' }" />
    <view class="yj-navbar__content">
      <view class="yj-navbar__left">
        <slot name="left" />
      </view>
      <text class="yj-navbar__title">{{ title }}</text>
      <view class="yj-navbar__right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  title?: string
}>()

const statusBarHeight = ref(20)

// 获取状态栏高度
try {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 20
} catch (e) {
  // fallback
}
</script>

<style scoped>
.yj-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: linear-gradient(180deg, #2C0A0A, #1A0808);
}

.yj-navbar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 28rpx;
}

.yj-navbar__left,
.yj-navbar__right {
  display: flex;
  align-items: center;
  min-width: 80rpx;
}

.yj-navbar__right {
  justify-content: flex-end;
}

.yj-navbar__title {
  color: #F0E6D6;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
