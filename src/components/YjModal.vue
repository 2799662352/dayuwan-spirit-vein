<template>
  <view v-if="visible" class="modal-mask" @tap.self="handleClose">
    <view class="modal-box">
      <view v-if="iconClass" class="modal-icon-wrap">
        <text :class="iconClass" class="modal-icon" />
      </view>
      <text class="modal-title">{{ title }}</text>
      <text v-if="desc" class="modal-desc">{{ desc }}</text>
      <slot />
      <view class="modal-actions">
        <view v-if="cancelText" class="modal-btn modal-btn--cancel" @tap="handleClose">
          <text class="modal-btn__text modal-btn__text--cancel">{{ cancelText }}</text>
        </view>
        <view class="modal-btn modal-btn--confirm" @tap="handleConfirm">
          <text class="modal-btn__text">{{ confirmText || '确定' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  iconClass?: string
  title: string
  desc?: string
  confirmText?: string
  cancelText?: string
}>()

const emit = defineEmits<{
  confirm: []
  close: []
}>()

function handleConfirm() { emit('confirm') }
function handleClose() { emit('close') }
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  width: 580rpx;
  background: linear-gradient(160deg, #12121A, #0A0A0F);
  border: 1rpx solid #2A1A1A;
  border-radius: 28rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0 60rpx rgba(255, 215, 0, 0.08), 0 10rpx 40rpx rgba(0, 0, 0, 0.6);
}

.modal-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.1);
  border: 1rpx solid rgba(255, 215, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
}

.modal-icon {
  font-size: 40rpx;
  color: #FFD700;
}

.modal-title {
  color: #F0E6D6;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.modal-desc {
  color: #A98C76;
  font-size: 26rpx;
  text-align: center;
  margin-bottom: 36rpx;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  width: 100%;
  margin-top: 12rpx;
}

.modal-btn {
  flex: 1;
  height: 84rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease-out;
}

.modal-btn--confirm {
  background: linear-gradient(135deg, #FFA500, #FFD700);
  box-shadow: 0 4rpx 20rpx rgba(255, 168, 0, 0.3);
}

.modal-btn--cancel {
  background: transparent;
  border: 1rpx solid #2A1A1A;
}

.modal-btn__text {
  color: #0A0A0F;
  font-size: 30rpx;
  font-weight: 700;
}

.modal-btn__text--cancel {
  color: #A98C76;
}
</style>
