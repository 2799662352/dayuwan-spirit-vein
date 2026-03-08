<template>
  <view class="shop-page">
    <view class="nav" :style="{ paddingTop: statusBarH + 'px' }">
      <view class="nav-back" @tap="goBack">
        <text class="i-tabler-arrow-left nav-icon" />
      </view>
      <text class="nav-title">法器商城</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="shop-scroll">
      <view class="shop-grid">
        <view
          v-for="item in shopItems"
          :key="item.id"
          class="shop-card"
          @tap="onBuy(item)"
        >
          <text :class="item.iconClass" class="shop-card__icon" />
          <text class="shop-card__name">{{ item.name }}</text>
          <text class="shop-card__desc">{{ item.desc }}</text>
          <view class="shop-card__price">
            <text class="i-tabler-hexagon price-icon" />
            <text class="price-value">{{ item.price }}</text>
          </view>
        </view>
      </view>

      <view style="height: 160rpx;" />
    </scroll-view>

    <!-- 底部余额 -->
    <view class="balance-bar">
      <text class="i-tabler-hexagon balance-icon" />
      <text class="balance-value">{{ userStore.profile?.xuanjing ?? 0 }}</text>
      <text class="balance-label">玄晶</text>
    </view>

    <!-- 购买确认弹窗 -->
    <YjModal
      :visible="showConfirm"
      :title="`购买 ${buyTarget?.name ?? ''}`"
      :desc="`消耗 ${buyTarget?.price ?? 0} 玄晶`"
      confirm-text="确认购买"
      cancel-text="取消"
      @confirm="confirmBuy"
      @close="showConfirm = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAudioStore } from '@/stores/audio'
import { callCloud } from '@/utils/cloud'
import YjModal from '@/components/YjModal.vue'

interface ShopItem {
  id: string
  name: string
  desc: string
  iconClass: string
  price: number
}

const userStore = useUserStore()
const audioStore = useAudioStore()

const statusBarH = ref(20)
try { statusBarH.value = uni.getSystemInfoSync().statusBarHeight || 20 } catch (_) {}

const shopItems: ShopItem[] = [
  { id: 'tianyan', name: '天眼通', desc: '透视全图阵眼详情 30s', iconClass: 'i-tabler-eye', price: 50 },
  { id: 'jiagu', name: '加固符', desc: '指定阵法防御 +50%', iconClass: 'i-tabler-shield', price: 30 },
]

const showConfirm = ref(false)
const buyTarget = ref<ShopItem | null>(null)

function onBuy(item: ShopItem) {
  buyTarget.value = item
  showConfirm.value = true
  audioStore.playSfx('click')
}

async function confirmBuy() {
  if (!buyTarget.value || !userStore.profile) return
  const { id, price } = buyTarget.value

  if (userStore.profile.xuanjing < price) {
    uni.showToast({ title: '玄晶不足', icon: 'none' })
    showConfirm.value = false
    return
  }

  userStore.updateXuanjing(-price)
  const existing = userStore.profile.items.find(i => i.id === id)
  if (existing) existing.count++

  await callCloud('shop-buy', { itemId: id })

  showConfirm.value = false
  audioStore.playSfx('click')
  uni.showToast({ title: `获得 ${buyTarget.value.name}!`, icon: 'none' })
}

function goBack() { uni.navigateBack() }
</script>

<style scoped>
.shop-page { min-height: 100vh; background: #000000; }

.nav {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 88rpx;
  background: rgba(0, 0, 0, 0.9);
  position: sticky;
  top: 0;
  z-index: 20;
}

.nav-back { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; }
.nav-icon { color: #A98C76; font-size: 28rpx; }
.nav-title { flex: 1; text-align: center; color: #FFD700; font-size: 32rpx; font-weight: 700; }
.nav-placeholder { width: 56rpx; }

.shop-scroll { height: calc(100vh); }

.shop-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 24rpx;
}

.shop-card {
  width: calc(50% - 10rpx);
  background: #0A0A0F;
  border: 1rpx solid #2A1A1A;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 200ms ease-out;
}

.shop-card__icon { font-size: 52rpx; color: #FFD700; }
.shop-card__name { color: #FFD700; font-size: 28rpx; font-weight: 600; }
.shop-card__desc { color: #A98C76; font-size: 22rpx; text-align: center; }

.shop-card__price {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 8rpx;
}

.price-icon { color: #00FFFF; font-size: 20rpx; }
.price-value { color: #00FFFF; font-size: 28rpx; font-weight: 700; }

.balance-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  background: rgba(0, 0, 0, 0.9);
  border-top: 1rpx solid #2A1A1A;
  z-index: 20;
}

.balance-icon { color: #00FFFF; font-size: 28rpx; }
.balance-value { color: #00FFFF; font-size: 36rpx; font-weight: 700; font-variant-numeric: tabular-nums; }
.balance-label { color: #5A4A3A; font-size: 24rpx; }
</style>
