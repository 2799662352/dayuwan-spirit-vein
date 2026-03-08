<template>
  <view class="page-full">
    <!-- 扫描线 -->
    <YjScanlines />

    <!-- 阵营呼吸光晕 -->
    <YjFactionAura :faction="userStore.faction" />

    <!-- 顶部进度条 -->
    <YjTopBar
      :faction="userStore.faction"
      :blue-count="battleStore.globalBlue"
      :red-count="battleStore.globalRed"
      @faction-tap="goProfile"
      @redeem-tap="goRedeem"
    />

    <!-- 中部: 全息罗盘 -->
    <view class="compass-area" :style="{ paddingTop: topOffset + 'px' }">
      <YjCompass
        :pois="battleStore.pois"
        :heading="locStore.heading"
        :active-poi="battleStore.currentPoiId"
        :selected-poi="selectedPoiId"
        @poi-tap="onPoiTap"
      />

      <!-- POI 详情气泡 -->
      <view v-if="selectedPoiDetail" class="poi-detail">
        <text class="poi-detail__name">{{ selectedPoiDetail.name }}</text>
        <view class="poi-detail__stats">
          <text class="poi-stat poi-stat--blue">{{ selectedPoiDetail.blue_mines }}</text>
          <text class="poi-stat-vs">:</text>
          <text class="poi-stat poi-stat--red">{{ selectedPoiDetail.red_mines }}</text>
        </view>
        <text class="poi-detail__dist">{{ selectedPoiDetail.distance }}m</text>
      </view>
    </view>

    <!-- 货币栏 -->
    <YjCurrencyBar
      :lingshi="userStore.profile?.lingshi ?? 0"
      :xuanjing="userStore.profile?.xuanjing ?? 0"
    />

    <!-- 底部按钮 -->
    <view class="bottom-actions" :style="{ paddingBottom: safeBottom + 'px' }">
      <YjButton
        text="布阵"
        sub="消耗 1 灵石"
        icon-class="i-tabler-shield-plus"
        type="plant"
        :disabled="!canPlant"
        @tap="onPlant"
      />
      <YjButton
        text="破阵"
        sub="消耗 2 玄晶"
        icon-class="i-tabler-sword"
        type="defuse"
        :disabled="!canDefuse"
        @tap="onDefuse"
      />
    </view>

    <!-- 围栏进入提示 -->
    <view v-if="fenceHint" class="fence-hint">
      <text class="fence-hint__text">{{ fenceHint }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useLocationStore } from '@/stores/location'
import { useBattlefieldStore } from '@/stores/battlefield'
import { useAudioStore } from '@/stores/audio'
import { startHeartbeat, stopHeartbeat } from '@/utils/vibrate'
import YjScanlines from '@/components/YjScanlines.vue'
import YjFactionAura from '@/components/YjFactionAura.vue'
import YjTopBar from '@/components/YjTopBar.vue'
import YjCompass from '@/components/YjCompass.vue'
import YjCurrencyBar from '@/components/YjCurrencyBar.vue'
import YjButton from '@/components/YjButton.vue'

const userStore = useUserStore()
const locStore = useLocationStore()
const battleStore = useBattlefieldStore()
const audioStore = useAudioStore()

const selectedPoiId = ref<string | null>(null)
const fenceHint = ref('')
const topOffset = ref(0)
const safeBottom = ref(0)

try {
  const sys = uni.getSystemInfoSync()
  topOffset.value = (sys.statusBarHeight || 20) + 44
  safeBottom.value = sys.safeAreaInsets?.bottom || 0
} catch (_) {}

const selectedPoiDetail = computed(() => {
  if (!selectedPoiId.value) return null
  return battleStore.pois.find(p => p._id === selectedPoiId.value)
})

const canPlant = computed(() => {
  return battleStore.isInFence && userStore.canPlant()
})

const canDefuse = computed(() => {
  return battleStore.isInFence && userStore.canDefuse()
})

function onPoiTap(id: string) {
  selectedPoiId.value = selectedPoiId.value === id ? null : id
  audioStore.playSfx('click')
}

function onPlant() {
  if (!battleStore.currentPoiId) return
  audioStore.playSfx('click')
  uni.navigateTo({
    url: `/pages/voice-record/index?poiId=${battleStore.currentPoiId}`,
  })
}

function onDefuse() {
  if (!battleStore.currentPoiId) return
  audioStore.playSfx('click')
  uni.navigateTo({
    url: `/pages/defuse/index?poiId=${battleStore.currentPoiId}`,
  })
}

function goRedeem() {
  uni.navigateTo({ url: '/pages/redeem/index' })
}

function goProfile() {
  uni.navigateTo({ url: '/pages/profile/index' })
}

let fenceCheckTimer: ReturnType<typeof setInterval> | null = null

watch(() => battleStore.isInFence, (inFence, wasInFence) => {
  if (inFence && !wasInFence) {
    const poi = battleStore.currentPoi
    fenceHint.value = poi ? `进入阵眼: ${poi.name}` : '进入阵眼范围'
    audioStore.playSfx('fence-enter')
    startHeartbeat(2000)
    setTimeout(() => { fenceHint.value = '' }, 3000)
  } else if (!inFence && wasInFence) {
    fenceHint.value = ''
    stopHeartbeat()
  }
})

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    await userStore.wxLogin()
  }

  await locStore.getCurrentLocation()
  locStore.startWatching()
  locStore.startDeviceOrientation()

  battleStore.startPolling(5000)
  audioStore.playAmbient()

  fenceCheckTimer = setInterval(() => {
    battleStore.updateDistancesAndBearings()
    battleStore.checkFenceStatus()
  }, 1000)
})

onUnmounted(() => {
  battleStore.stopPolling()
  stopHeartbeat()
  if (fenceCheckTimer) clearInterval(fenceCheckTimer)
})
</script>

<style scoped>
.page-full {
  min-height: 100vh;
  background: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.compass-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  position: relative;
  z-index: 5;
}

.poi-detail {
  margin-top: 20rpx;
  padding: 16rpx 28rpx;
  background: rgba(10, 10, 15, 0.8);
  border: 1rpx solid #2A1A1A;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.poi-detail__name {
  color: #FFD700;
  font-size: 28rpx;
  font-weight: 600;
}

.poi-detail__stats {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.poi-stat {
  font-size: 28rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.poi-stat--blue { color: #00A8FF; }
.poi-stat--red { color: #FF3F3F; }
.poi-stat-vs { color: #5A4A3A; font-size: 24rpx; }

.poi-detail__dist {
  color: #A98C76;
  font-size: 24rpx;
}

.bottom-actions {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 28rpx;
  background: linear-gradient(0deg, rgba(0,0,0,0.95) 0%, transparent 100%);
  position: relative;
  z-index: 30;
}

.bottom-actions > * {
  flex: 1;
}

.fence-hint {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20rpx 40rpx;
  background: rgba(10, 10, 15, 0.9);
  border: 1rpx solid rgba(255, 215, 0, 0.3);
  border-radius: 20rpx;
  z-index: 50;
  animation: hint-fade 3s ease-out forwards;
}

.fence-hint__text {
  color: #FFD700;
  font-size: 28rpx;
  font-weight: 600;
}

@keyframes hint-fade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
