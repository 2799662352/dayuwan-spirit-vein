<template>
  <view v-if="visible" class="modal-mask" @tap.self="$emit('close')">
    <view class="modal-panel obsidian">
      <!-- 聚宝盆视觉 -->
      <view class="cauldron">
        <view class="cauldron__body" />
        <view class="cauldron__glow" />
        <view class="cauldron__sparks">
          <view
            v-for="i in 6"
            :key="i"
            class="spark"
            :style="{ animationDelay: `${i * 0.3}s`, left: `${15 + i * 12}%` }"
          />
        </view>
        <text class="cauldron__label neon-gold">聚宝盆</text>
      </view>

      <text class="modal-title neon-gold">量子算力烁金钵</text>
      <text class="modal-desc">
        获得 <text class="neon-gold">{{ amount }} 玄晶</text> 奖励
      </text>

      <view class="modal-actions">
        <view class="btn-cyber btn-cyber--gold" @tap="onClaim">
          <text class="btn-cyber__text">领取奖励</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: Boolean,
  amount: { type: Number, default: 200 },
})
const emit = defineEmits(['close', 'claim'])

function onClaim() {
  emit('claim')
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
  border: 1px solid rgba(251, 191, 36, 0.3);
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
}

.neon-gold {
  color: #fbbf24;
  text-shadow: 0 0 12rpx rgba(251, 191, 36, 0.6), 0 0 32rpx rgba(251, 191, 36, 0.2);
}

/* ── 聚宝盆 ── */

.cauldron {
  position: relative;
  width: 220rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cauldron__body {
  width: 160rpx;
  height: 120rpx;
  border-radius: 0 0 50% 50% / 0 0 60% 60%;
  background: linear-gradient(180deg, #3a2e1a 0%, #1a1408 100%);
  border: 2rpx solid rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 30rpx rgba(251, 191, 36, 0.15);
}

.cauldron__glow {
  position: absolute;
  left: 50%;
  top: 20%;
  width: 120rpx;
  height: 60rpx;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(251, 191, 36, 0.5), transparent 70%);
  animation: cauldron-glow 2.5s ease-in-out infinite;
}

.cauldron__sparks {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  pointer-events: none;
}

.spark {
  position: absolute;
  bottom: 55%;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 8rpx #fbbf24;
  animation: spark-rise 1.8s ease-out infinite;
}

.cauldron__label {
  position: absolute;
  bottom: 0;
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.2em;
}

/* ── 按钮 ── */

.modal-actions {
  margin-top: 12rpx;
}

.btn-cyber {
  height: 80rpx;
  padding: 0 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.btn-cyber--gold {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.5);
}

.btn-cyber__text {
  font-size: 28rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.06em;
}

@keyframes cauldron-glow {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
}

@keyframes spark-rise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-80rpx) scale(0); opacity: 0; }
}
</style>
