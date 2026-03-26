<template>
  <view v-if="visible" class="modal-mask" @tap.self="$emit('close')">
    <view class="modal-panel obsidian">
      <!-- 破阵符视觉 -->
      <view class="hack-sigil">
        <view class="hack-sigil__plasma" />
        <view class="hack-sigil__ring hack-sigil__ring--1" />
        <view class="hack-sigil__ring hack-sigil__ring--2" />
        <view class="hack-sigil__core">
          <text class="hack-sigil__glyph">破</text>
        </view>
        <view class="hack-sigil__bolt hack-sigil__bolt--l" />
        <view class="hack-sigil__bolt hack-sigil__bolt--r" />
      </view>

      <text class="modal-title neon-cyan">高频等离子破阵符</text>
      <text class="modal-desc">
        消耗 <text class="neon-gold">100 玄晶</text> 瓦解敌方灵脉护盾
      </text>

      <view class="modal-actions">
        <view class="btn-cyber btn-cyber--primary" @tap="onConfirm">
          <text class="btn-cyber__text">启动破阵</text>
        </view>
        <view class="btn-cyber btn-cyber--ghost" @tap="$emit('close')">
          <text class="btn-cyber__text">取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'confirm'])

function onConfirm() {
  emit('confirm')
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
  border: 1px solid rgba(0, 255, 255, 0.3);
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

.neon-cyan {
  color: #00e5ff;
  text-shadow: 0 0 12rpx rgba(0, 229, 255, 0.6), 0 0 32rpx rgba(0, 229, 255, 0.25);
}

.neon-gold {
  color: #fbbf24;
  text-shadow: 0 0 10rpx rgba(251, 191, 36, 0.5);
}

/* ── 破阵符 ── */

.hack-sigil {
  position: relative;
  width: 260rpx;
  height: 260rpx;
}

.hack-sigil__plasma {
  position: absolute;
  top: 20rpx; right: 20rpx; bottom: 20rpx; left: 20rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
  animation: plasma-pulse 2s ease-in-out infinite;
}

.hack-sigil__ring {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 229, 255, 0.5);
}

.hack-sigil__ring--1 {
  animation: ring-spin-cw 6s linear infinite;
  border-style: dashed;
}

.hack-sigil__ring--2 {
  top: 30rpx; right: 30rpx; bottom: 30rpx; left: 30rpx;
  border-color: rgba(255, 60, 60, 0.4);
  animation: ring-spin-ccw 4s linear infinite;
}

.hack-sigil__core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.4), rgba(0, 229, 255, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
}

.hack-sigil__glyph {
  font-size: 48rpx;
  font-weight: 900;
  color: #00e5ff;
  text-shadow: 0 0 16rpx rgba(0, 229, 255, 0.8);
  font-family: 'ZCOOL XiaoWei', 'STLiti', serif;
}

.hack-sigil__bolt {
  position: absolute;
  top: 50%;
  width: 40rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #ff4444, transparent);
  box-shadow: 0 0 8rpx #ff4444;
  animation: bolt-flicker 0.3s ease-in-out infinite alternate;
}

.hack-sigil__bolt--l {
  left: -10rpx;
  transform: translateY(-50%) rotate(-15deg);
}

.hack-sigil__bolt--r {
  right: -10rpx;
  transform: translateY(-50%) rotate(15deg);
}

/* ── 按钮 ── */

.modal-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 12rpx;
}

.btn-cyber {
  height: 80rpx;
  padding: 0 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.btn-cyber--primary {
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.3), rgba(0, 229, 255, 0.1));
  border: 1px solid rgba(0, 229, 255, 0.5);
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

@keyframes plasma-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes ring-spin-cw {
  to { transform: rotate(360deg); }
}

@keyframes ring-spin-ccw {
  to { transform: rotate(-360deg); }
}

@keyframes bolt-flicker {
  0% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>
