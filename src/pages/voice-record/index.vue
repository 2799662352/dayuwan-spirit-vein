<template>
  <view class="record-page">
    <view class="record-mask" @tap="goBack" />
    <view class="record-panel">
      <!-- 头部 -->
      <view class="panel-header">
        <text class="panel-title">布阵 · 录制神念</text>
        <view class="panel-close" @tap="goBack">
          <text class="i-tabler-x close-icon" />
        </view>
      </view>

      <!-- 阵眼信息 -->
      <text class="poi-name">{{ poiName }}</text>
      <text class="poi-hint">请录制与「{{ poiName }}」文化相关的 5 秒语音</text>

      <!-- 录音按钮 -->
      <view class="record-area">
        <view
          class="record-btn"
          :class="{
            'record-btn--recording': isRecording,
            'record-btn--done': recordDone,
          }"
          @longpress="startRecord"
          @touchend="stopRecord"
        >
          <text v-if="!recordDone" class="i-tabler-microphone record-btn__icon" />
          <text v-else class="i-tabler-check record-btn__icon record-btn__icon--done" />
        </view>
        <text class="record-timer">{{ recordSeconds.toFixed(1) }}s / 5.0s</text>
        <text v-if="!isRecording && !recordDone" class="record-tip">长按录制</text>
        <text v-if="isRecording" class="record-tip record-tip--active">录制中...</text>
      </view>

      <!-- 消耗提示 -->
      <view class="cost-row">
        <text class="i-tabler-diamond cost-icon" />
        <text class="cost-text">消耗 1 灵石 (剩余 {{ userStore.profile?.lingshi ?? 0 }})</text>
      </view>

      <!-- 确认按钮 -->
      <YjButton
        text="确认布阵"
        type="gold"
        block
        :disabled="!recordDone || submitting"
        @tap="confirmPlant"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBattlefieldStore } from '@/stores/battlefield'
import { useAudioStore } from '@/stores/audio'
import { vibratePlantSuccess } from '@/utils/vibrate'
import { callCloud } from '@/utils/cloud'
import YjButton from '@/components/YjButton.vue'

const userStore = useUserStore()
const battleStore = useBattlefieldStore()
const audioStore = useAudioStore()

const poiId = ref('')
const poiName = ref('阵眼')
const isRecording = ref(false)
const recordDone = ref(false)
const recordSeconds = ref(0)
const voicePath = ref('')
const submitting = ref(false)

let recorder: UniApp.RecorderManager | null = null
let recordTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  poiId.value = currentPage?.$page?.options?.poiId || ''

  const poi = battleStore.pois.find(p => p._id === poiId.value)
  if (poi) poiName.value = poi.name

  recorder = uni.getRecorderManager()
  recorder.onStop((res) => {
    isRecording.value = false
    recordDone.value = true
    voicePath.value = res.tempFilePath
    if (recordTimer) { clearInterval(recordTimer); recordTimer = null }
  })
})

onUnmounted(() => {
  if (recordTimer) clearInterval(recordTimer)
})

function startRecord() {
  if (recordDone.value || isRecording.value) return
  isRecording.value = true
  recordSeconds.value = 0

  recorder?.start({
    duration: 5000,
    format: 'aac',
    sampleRate: 16000,
    numberOfChannels: 1,
  })

  recordTimer = setInterval(() => {
    recordSeconds.value = Math.min(recordSeconds.value + 0.1, 5.0)
    if (recordSeconds.value >= 5.0) {
      stopRecord()
    }
  }, 100)
}

function stopRecord() {
  if (!isRecording.value) return
  recorder?.stop()
}

async function confirmPlant() {
  if (!recordDone.value || submitting.value) return
  submitting.value = true

  uni.showLoading({ title: '布阵中...' })

  userStore.updateLingshi(-1)
  audioStore.playSfx('plant')
  vibratePlantSuccess()

  const res = await callCloud('plant-mine', {
    poiId: poiId.value,
    voicePath: voicePath.value,
    faction: userStore.faction,
  })

  uni.hideLoading()

  if (res.success) {
    uni.showToast({ title: '阵法已布下!', icon: 'none' })
  } else {
    uni.showToast({ title: res.error || '布阵失败', icon: 'none' })
    userStore.updateLingshi(1)
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 1200)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.record-page {
  position: fixed;
  inset: 0;
  z-index: 200;
}

.record-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.record-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0A0A0F;
  border-radius: 32rpx 32rpx 0 0;
  border-top: 1rpx solid #2A1A1A;
  padding: 36rpx 32rpx;
  padding-bottom: calc(36rpx + env(safe-area-inset-bottom, 0px));
  z-index: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.panel-title {
  color: #FFD700;
  font-size: 32rpx;
  font-weight: 700;
}

.panel-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  color: #A98C76;
  font-size: 28rpx;
}

.poi-name {
  color: #F0E6D6;
  font-size: 36rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 8rpx;
}

.poi-hint {
  color: #A98C76;
  font-size: 24rpx;
  display: block;
  margin-bottom: 40rpx;
}

.record-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}

.record-btn {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #12121A;
  border: 3rpx solid #2A1A1A;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease-out;
  margin-bottom: 16rpx;
}

.record-btn--recording {
  border-color: #FF3F3F;
  box-shadow: 0 0 30rpx rgba(255, 63, 63, 0.3);
  animation: record-pulse 1s ease-in-out infinite;
}

.record-btn--done {
  border-color: #22C55E;
  background: rgba(34, 197, 94, 0.1);
}

.record-btn__icon {
  font-size: 44rpx;
  color: #A98C76;
}

.record-btn--recording .record-btn__icon {
  color: #FF3F3F;
}

.record-btn__icon--done {
  color: #22C55E;
}

.record-timer {
  color: #FFD700;
  font-size: 28rpx;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-bottom: 8rpx;
}

.record-tip {
  color: #5A4A3A;
  font-size: 22rpx;
}

.record-tip--active {
  color: #FF3F3F;
}

.cost-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 24rpx;
  justify-content: center;
}

.cost-icon {
  color: #FFD700;
  font-size: 24rpx;
}

.cost-text {
  color: #A98C76;
  font-size: 24rpx;
}

@keyframes record-pulse {
  0%, 100% { box-shadow: 0 0 20rpx rgba(255, 63, 63, 0.2); }
  50% { box-shadow: 0 0 40rpx rgba(255, 63, 63, 0.5); }
}
</style>
