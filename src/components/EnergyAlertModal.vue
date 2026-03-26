<template>
  <view v-if="visible" class="modal-mask" @tap.self="$emit('close')">
    <view class="modal-panel obsidian">
      <!-- 聚灵丹视觉 -->
      <view class="pill-visual">
        <view class="pill-visual__orb" />
        <view class="pill-visual__pulse" />
        <text class="pill-visual__label neon-red">灵力不足</text>
      </view>

      <text class="modal-title neon-red">{{ title }}</text>
      <text class="modal-desc">{{ desc }}</text>

      <view class="modal-actions">
        <view class="btn-cyber btn-cyber--red" @tap="onBuy">
          <text class="btn-cyber__text">聚灵丹·补充玄晶</text>
        </view>
        <view class="btn-cyber btn-cyber--ghost" @tap="$emit('close')">
          <text class="btn-cyber__text">返回</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: Boolean,
  title: { type: String, default: '资源告警' },
  desc: { type: String, default: '当前玄晶余额不足以执行此操作' },
})
const emit = defineEmits(['close', 'buy'])

function onBuy() {
  emit('buy')
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
}

.obsidian {
  background: rgba(20, 20, 20, 0.88);
  border: 1px solid rgba(255, 60, 60, 0.3);
  border-radius: 24rpx;
}

.modal-panel {
  width: 620rpx;
  padding: 56rpx 40rpx 44rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  line-height: 1.6;
}

.neon-red {
  color: #ff4444;
  text-shadow: 0 0 12rpx rgba(255, 68, 68, 0.6), 0 0 32rpx rgba(255, 68, 68, 0.2);
}

/* ── 聚灵丹 ── */

.pill-visual {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pill-visual__orb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ff6b6b, #cc2222 60%, #440000);
  box-shadow: 0 0 40rpx rgba(255, 68, 68, 0.4), inset 0 -10rpx 20rpx rgba(0, 0, 0, 0.3);
}

.pill-visual__pulse {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 68, 68, 0.3);
  animation: alert-pulse 1.8s ease-out infinite;
}

.pill-visual__label {
  position: absolute;
  bottom: 0;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.15em;
}

/* ── 按钮 ── */

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
}

.btn-cyber {
  height: 80rpx;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.btn-cyber--red {
  background: linear-gradient(135deg, rgba(255, 68, 68, 0.3), rgba(255, 68, 68, 0.1));
  border: 1px solid rgba(255, 68, 68, 0.5);
}

.btn-cyber--ghost {
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-cyber__text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.06em;
}

@keyframes alert-pulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
</style>
