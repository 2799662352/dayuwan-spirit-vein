<template>
  <view
    class="yj-btn"
    :class="[
      `yj-btn--${type}`,
      { 'yj-btn--block': block, 'yj-btn--disabled': disabled }
    ]"
    @tap="handleTap"
  >
    <text v-if="iconClass" :class="iconClass" class="yj-btn__icon" />
    <view class="yj-btn__content">
      <text class="yj-btn__text">{{ text }}</text>
      <text v-if="sub" class="yj-btn__sub">{{ sub }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string
  sub?: string
  iconClass?: string
  type?: 'plant' | 'defuse' | 'primary' | 'gold' | 'danger' | 'ghost'
  block?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  tap: []
}>()

function handleTap() {
  if (!props.disabled) {
    emit('tap')
  }
}
</script>

<style scoped>
.yj-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  position: relative;
  overflow: hidden;
  transition: all 200ms ease-out;
}

.yj-btn--block { width: 100%; }
.yj-btn--disabled { opacity: 0.3; pointer-events: none; }

/* 布阵 — 玉牌 */
.yj-btn--plant {
  background: linear-gradient(135deg, #2D5A3D, #1A3A28);
  border: 1rpx solid rgba(0, 168, 255, 0.3);
  box-shadow: 0 4rpx 20rpx rgba(0, 168, 255, 0.15);
}

/* 破阵 — 虎符 */
.yj-btn--defuse {
  background: linear-gradient(135deg, #2A1A0A, #1A0A00);
  border: 1rpx solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.15);
}

/* 通用主色 */
.yj-btn--primary {
  background: linear-gradient(135deg, #FFA500, #FFD700);
  box-shadow: 0 4rpx 20rpx rgba(255, 168, 0, 0.3);
}

.yj-btn--gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.3);
}

.yj-btn--danger {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  box-shadow: 0 4rpx 20rpx rgba(239, 68, 68, 0.3);
}

.yj-btn--ghost {
  background: transparent;
  border: 1rpx solid #2A1A1A;
}

.yj-btn__icon {
  font-size: 32rpx;
  color: currentColor;
}

.yj-btn__content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.yj-btn__text {
  color: #F0E6D6;
  font-size: 30rpx;
  font-weight: 700;
}

.yj-btn--primary .yj-btn__text,
.yj-btn--gold .yj-btn__text {
  color: #0A0A0F;
}

.yj-btn--defuse .yj-btn__text {
  color: #FFD700;
}

.yj-btn__sub {
  color: rgba(240, 230, 214, 0.6);
  font-size: 20rpx;
  margin-top: 2rpx;
}

.yj-btn--primary .yj-btn__sub,
.yj-btn--gold .yj-btn__sub {
  color: rgba(10, 10, 15, 0.6);
}
</style>
