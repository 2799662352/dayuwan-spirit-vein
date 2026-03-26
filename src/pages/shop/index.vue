<template>
  <view class="shop">
    <view class="shop__bg" aria-hidden="true" />

    <view
      class="shop__inner"
      :style="{
        paddingTop: safeTop + 'px',
        paddingRight: capsuleRight + 'px',
      }"
    >
      <!-- 顶栏：返回 + 篆书标题「聚灵阁」 -->
      <view class="shop__header">
        <view class="shop__back" @tap="goBack">
          <text class="shop__back-glyph">‹</text>
        </view>
        <text class="shop__title">聚灵阁</text>
        <view class="shop__header-slot" />
      </view>

      <!-- 玄晶余额 -->
      <view class="balance obsidian-panel">
        <text class="balance__label">当前玄晶</text>
        <view class="balance__row">
          <text class="balance__icon">◆</text>
          <text class="balance__val">{{ user.userAssets }}</text>
        </view>
      </view>

      <!-- 商品：黑曜石金边卡 -->
      <scroll-view scroll-y class="shop__scroll" :show-scrollbar="false">
        <view
          v-for="item in shopItems"
          :key="item.id"
          class="item-card obsidian-panel obsidian-panel--gold"
        >
          <view class="item-card__main">
            <text class="item-card__name">{{ item.name }}</text>
            <text class="item-card__gain">+{{ item.amount }} 玄晶</text>
            <text class="item-card__desc">{{ item.desc }}</text>
          </view>
          <view class="btn-claim" @tap="onBuy(item)">
            <text class="btn-claim__text">领取</text>
          </view>
        </view>
        <view class="shop__scroll-pad" />
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
const safeTop = ref(44)
/** 与首页一致：避让微信胶囊，避免内容顶到菜单区 */
const capsuleRight = ref(100)

const shopItems = [
  { id: 'pill-s', name: '聚灵丹·小', amount: 200, desc: '补充少量灵力' },
  { id: 'pill-m', name: '聚灵丹·中', amount: 500, desc: '补充中量灵力' },
  { id: 'pill-l', name: '聚灵丹·大', amount: 1000, desc: '补充大量灵力' },
]

function onBuy(item) {
  user.updateXuanjing(item.amount)
  uni.showToast({ title: `+${item.amount} 玄晶`, icon: 'none' })
}

function goBack() {
  uni.navigateBack()
}

onMounted(() => {
  // #ifdef MP-WEIXIN
  try {
    const capsule = uni.getMenuButtonBoundingClientRect()
    safeTop.value = capsule.top
    const sysInfo = uni.getWindowInfo()
    capsuleRight.value = sysInfo.windowWidth - capsule.left + 8
  } catch {
    /* ignore */
  }
  // #endif
  // #ifdef H5
  safeTop.value = 12
  capsuleRight.value = 16
  // #endif

  if (!user.isLoggedIn) user.wxLogin()
})
</script>

<style scoped>
.shop {
  position: relative;
  min-height: 100vh;
  background: #000000;
}

.shop__bg {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
  background: radial-gradient(ellipse 120% 80% at 50% -20%, rgba(251, 191, 36, 0.08), transparent 55%),
    radial-gradient(ellipse 90% 60% at 100% 50%, rgba(34, 211, 238, 0.06), transparent 45%),
    #000000;
  pointer-events: none;
}

.shop__inner {
  position: relative;
  z-index: 1;
  padding-left: 28rpx;
  padding-bottom: 48rpx;
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shop__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-right: 8rpx;
  margin-bottom: 28rpx;
}

.shop__back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: rgba(24, 24, 28, 0.85);
  border: 1rpx solid rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 20rpx rgba(251, 191, 36, 0.12);
}

.shop__back-glyph {
  font-size: 40rpx;
  line-height: 1;
  color: #fbbf24;
  font-weight: 700;
  margin-top: -4rpx;
}

/* 篆书/碑刻感标题 + 霓虹描边（text-shadow / box-shadow，无 filter） */
.shop__title {
  flex: 1;
  text-align: center;
  font-size: 46rpx;
  font-weight: 800;
  letter-spacing: 0.42em;
  color: #fde68a;
  font-family: 'STXingkai', 'KaiTi', 'LiSu', 'FangSong', 'Songti SC', 'SimSun', serif;
  text-shadow: 0 0 18rpx rgba(251, 191, 36, 0.85), 0 0 48rpx rgba(34, 211, 238, 0.25),
    0 0 2rpx rgba(255, 255, 255, 0.35);
}

.shop__header-slot {
  width: 72rpx;
  height: 72rpx;
}

.balance {
  margin-bottom: 32rpx;
  padding: 24rpx 28rpx;
}

.balance__label {
  display: block;
  font-size: 22rpx;
  color: rgba(167, 139, 250, 0.75);
  letter-spacing: 0.2em;
  margin-bottom: 12rpx;
}

.balance__row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.balance__icon {
  font-size: 28rpx;
  color: #22d3ee;
  margin-right: 12rpx;
  text-shadow: 0 0 14rpx rgba(34, 211, 238, 0.5);
}

.balance__val {
  font-size: 40rpx;
  font-weight: 800;
  color: #fbbf24;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12rpx rgba(251, 191, 36, 0.45);
}

.obsidian-panel {
  background: linear-gradient(145deg, rgba(28, 28, 32, 0.92) 0%, rgba(12, 12, 16, 0.96) 100%);
  border: 1rpx solid rgba(100, 100, 120, 0.35);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.45), 0 0 1rpx rgba(255, 255, 255, 0.06) inset;
}

.obsidian-panel--gold {
  border: 1rpx solid rgba(251, 191, 36, 0.45);
  box-shadow: 0 8rpx 36rpx rgba(0, 0, 0, 0.5), 0 0 24rpx rgba(251, 191, 36, 0.08);
}

.shop__scroll {
  flex: 1;
  height: 0;
  min-height: 400rpx;
}

.shop__scroll-pad {
  height: 48rpx;
}

.item-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  margin-bottom: 24rpx;
}

.item-card__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 20rpx;
}

.item-card__name {
  font-size: 30rpx;
  font-weight: 700;
  color: #fef3c7;
  margin-bottom: 8rpx;
  letter-spacing: 0.06em;
}

.item-card__gain {
  font-size: 26rpx;
  color: #22d3ee;
  margin-bottom: 10rpx;
  text-shadow: 0 0 10rpx rgba(34, 211, 238, 0.35);
}

.item-card__desc {
  font-size: 22rpx;
  color: rgba(180, 180, 190, 0.85);
  line-height: 1.45;
}

/* 金渐变描边圆角按钮，内层深底白字 */
.btn-claim {
  padding: 3rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #fde68a 0%, #f59e0b 50%, #d97706 100%);
  box-shadow: 0 0 20rpx rgba(251, 191, 36, 0.35);
}

.btn-claim__text {
  display: block;
  padding: 18rpx 36rpx;
  border-radius: 999rpx;
  background: rgba(10, 10, 14, 0.92);
  font-size: 26rpx;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  letter-spacing: 0.12em;
}
</style>
