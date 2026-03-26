<template>
  <view class="ar-page">
    <!-- 底层：相机透传 -->
    <!-- #ifdef MP-WEIXIN -->
    <camera
      class="ar-camera"
      device-position="back"
      flash="off"
      resolution="high"
    />
    <!-- #endif -->
    <!-- #ifdef H5 -->
    <view class="ar-camera ar-camera--mock">
      <text class="mock-label">Camera Preview (H5 模拟)</text>
    </view>
    <!-- #endif -->

    <!-- 中层：伪3D 阵法图腾 -->
    <view class="totem-layer">
      <view class="totem" :class="{ 'totem--breaking': isBreaking }">
        <view class="totem__ring totem__ring--outer" />
        <view class="totem__ring totem__ring--inner" />
        <view class="totem__core" />
        <view class="totem__line totem__line--h" />
        <view class="totem__line totem__line--v" />
        <view class="totem__line totem__line--d1" />
        <view class="totem__line totem__line--d2" />
        <view class="totem__glyph">阵</view>
      </view>
    </view>

    <!-- 顶层：HUD -->
    <view class="ar-hud">
      <view class="ar-hud__top">
        <text class="crystal-count">玄晶 {{ user.userAssets }}</text>
      </view>

      <view class="ar-hud__bottom">
        <view
          class="btn-break"
          :class="{ 'btn-break--disabled': user.userAssets < 100 }"
          @tap="onBreak"
        >
          <text class="btn-break__text">消耗 100 玄晶破阵</text>
        </view>
        <view class="btn-back" @tap="goBack">
          <text class="btn-back__text">返回</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const isBreaking = ref(false)

function onBreak() {
  if (isBreaking.value) return
  const ok = user.costCrystal(100)
  if (!ok) {
    uni.showToast({ title: '玄晶不足', icon: 'none' })
    return
  }
  isBreaking.value = true
  uni.vibrateShort({ type: 'heavy' }).catch(() => {})
  setTimeout(() => {
    isBreaking.value = false
    uni.showToast({ title: '破阵成功', icon: 'success' })
  }, 1200)
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.ar-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.ar-camera {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  width: 100%;
  height: 100%;
}

.ar-camera--mock {
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    45deg,
    #111 0px,
    #111 20px,
    #1a1a1a 20px,
    #1a1a1a 40px
  );
}

.mock-label {
  color: #555;
  font-size: 28rpx;
}

/* ── 阵法图腾 ── */

.totem-layer {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.totem {
  width: 500rpx;
  height: 500rpx;
  position: relative;
  transform: perspective(1000px) rotateX(60deg) rotateZ(45deg);
  transform-style: preserve-3d;
  animation: totem-hover 4s ease-in-out infinite;
}

.totem--breaking {
  animation: totem-shatter 1.2s ease-out forwards;
}

.totem__ring {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 229, 255, 0.6);
  box-shadow:
    0 0 24rpx rgba(0, 229, 255, 0.3),
    inset 0 0 24rpx rgba(0, 229, 255, 0.1);
}

.totem__ring--outer {
  animation: ring-spin 12s linear infinite;
}

.totem__ring--inner {
  top: 60rpx; right: 60rpx; bottom: 60rpx; left: 60rpx;
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow:
    0 0 20rpx rgba(251, 191, 36, 0.25),
    inset 0 0 20rpx rgba(251, 191, 36, 0.08);
  animation: ring-spin 8s linear infinite reverse;
}

.totem__core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80rpx;
  height: 80rpx;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.6), transparent 70%);
  box-shadow: 0 0 40rpx rgba(0, 229, 255, 0.5);
}

.totem__line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 2rpx;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 229, 255, 0.4),
    transparent
  );
  transform-origin: center;
}

.totem__line--h {
  transform: translate(-50%, -50%) rotate(0deg);
}
.totem__line--v {
  transform: translate(-50%, -50%) rotate(90deg);
}
.totem__line--d1 {
  transform: translate(-50%, -50%) rotate(45deg);
}
.totem__line--d2 {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.totem__glyph {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) rotateZ(-45deg) rotateX(-60deg);
  font-size: 56rpx;
  font-weight: 900;
  color: rgba(0, 229, 255, 0.85);
  text-shadow: 0 0 20rpx rgba(0, 229, 255, 0.6);
  font-family: 'ZCOOL XiaoWei', 'STLiti', 'LiSu', serif;
}

/* ── HUD ── */

.ar-hud {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 24rpx) 32rpx
    calc(env(safe-area-inset-bottom) + 40rpx);
  pointer-events: none;
}

.ar-hud__top,
.ar-hud__bottom {
  pointer-events: auto;
}

.ar-hud__bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.crystal-count {
  display: inline-block;
  padding: 10rpx 28rpx;
  font-size: 28rpx;
  color: #fbbf24;
  background: rgba(0, 0, 0, 0.55);
  border: 1rpx solid rgba(251, 191, 36, 0.3);
  border-radius: 24rpx;
}

.btn-break {
  width: 420rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, rgba(0, 229, 255, 0.25), rgba(251, 191, 36, 0.25)), rgba(0, 0, 0, 0.35);
  border: 2rpx solid rgba(0, 229, 255, 0.5);
}

.btn-break--disabled {
  opacity: 0.35;
  pointer-events: none;
}

.btn-break__text {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.08em;
}

.btn-back {
  padding: 12rpx 40rpx;
}

.btn-back__text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* ── 动画 ── */

@keyframes totem-hover {
  0%, 100% { transform: perspective(1000px) rotateX(60deg) rotateZ(45deg) translateZ(0); }
  50%      { transform: perspective(1000px) rotateX(60deg) rotateZ(45deg) translateZ(20rpx); }
}

@keyframes ring-spin {
  to { transform: rotate(360deg); }
}

@keyframes totem-shatter {
  0%   { opacity: 1; transform: perspective(1000px) rotateX(60deg) rotateZ(45deg) scale(1); }
  40%  { opacity: 1; transform: perspective(1000px) rotateX(60deg) rotateZ(45deg) scale(1.15); }
  100% { opacity: 0; transform: perspective(1000px) rotateX(60deg) rotateZ(45deg) scale(1.6); }
}
</style>
