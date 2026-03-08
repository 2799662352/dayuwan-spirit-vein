<template>
  <view class="defuse-page">
    <!-- 倒计时 -->
    <view class="countdown-area">
      <text class="countdown-value" :class="{ 'countdown--urgent': timeLeft <= 5 }">
        {{ timeLeft.toFixed(1) }}s
      </text>
    </view>

    <!-- 气泡战场 -->
    <view class="bubble-field" @tap="onFieldTap">
      <view
        v-for="bubble in activeBubbles"
        :key="bubble.id"
        class="qte-bubble"
        :class="[
          `qte-bubble--${enemyFaction}`,
          { 'qte-bubble--popping': bubble.popping }
        ]"
        :style="{
          left: bubble.x + 'rpx',
          top: bubble.y + 'rpx',
          width: bubble.size + 'rpx',
          height: bubble.size + 'rpx',
        }"
        @tap.stop="onBubbleTap(bubble.id)"
      >
        <text class="bubble-rune">{{ bubble.rune }}</text>
      </view>
    </view>

    <!-- 底部状态 -->
    <view class="status-bar">
      <text class="status-hit">
        已击破: <text class="status-hit__count">{{ hitCount }}</text> / {{ targetHits }}
      </text>
      <text class="status-cost">-2 玄晶</text>
    </view>

    <!-- 结算弹窗 -->
    <view v-if="showResult" class="result-overlay" :class="`result-overlay--${resultType}`">
      <view class="result-box">
        <text class="result-title">{{ resultType === 'win' ? '阵法破解!' : '法力不济...' }}</text>
        <text class="result-reward" :class="`result-reward--${resultType}`">
          {{ resultType === 'win' ? '+15 玄晶' : '-5 玄晶' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAudioStore } from '@/stores/audio'
import { getEnemyFaction, type Faction } from '@/utils/faction'
import { vibrateQteHit, vibrateDefuseWin, vibrateDefuseFail } from '@/utils/vibrate'
import { callCloud } from '@/utils/cloud'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  rune: string
  popping: boolean
  createdAt: number
}

const userStore = useUserStore()
const audioStore = useAudioStore()

const timeLeft = ref(10)
const hitCount = ref(0)
const targetHits = 10
const showResult = ref(false)
const resultType = ref<'win' | 'lose'>('lose')
const gameActive = ref(false)

const activeBubbles = ref<Bubble[]>([])
let bubbleIdCounter = 0
let gameTimer: ReturnType<typeof setInterval> | null = null
let spawnTimer: ReturnType<typeof setInterval> | null = null
let cleanupTimer: ReturnType<typeof setInterval> | null = null

const enemyFaction = computed<Faction>(() => {
  return userStore.faction ? getEnemyFaction(userStore.faction) : 'red'
})

const runes = ['阵', '封', '锁', '禁', '困', '缚', '镇', '压']

const poiId = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  poiId.value = currentPage?.$page?.options?.poiId || ''

  userStore.updateXuanjing(-2)
  audioStore.playSfx('defuse-start')
  startGame()
})

onUnmounted(() => {
  stopGame()
})

function startGame() {
  gameActive.value = true
  timeLeft.value = 10

  gameTimer = setInterval(() => {
    timeLeft.value = Math.max(0, timeLeft.value - 0.1)
    if (timeLeft.value <= 0) {
      endGame()
    }
  }, 100)

  spawnBubble()
  spawnTimer = setInterval(() => {
    if (!gameActive.value) return
    const interval = timeLeft.value > 5 ? 800 : 500
    if (activeBubbles.value.length < 5) {
      spawnBubble()
    }
  }, 600)

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    activeBubbles.value = activeBubbles.value.filter(b =>
      !b.popping && (now - b.createdAt) < 2000,
    )
  }, 300)
}

function spawnBubble() {
  const id = ++bubbleIdCounter
  const size = 60 + Math.random() * 30
  activeBubbles.value.push({
    id,
    x: 40 + Math.random() * 560,
    y: 100 + Math.random() * 700,
    size,
    rune: runes[Math.floor(Math.random() * runes.length)],
    popping: false,
    createdAt: Date.now(),
  })
}

function onBubbleTap(id: number) {
  if (!gameActive.value) return
  const idx = activeBubbles.value.findIndex(b => b.id === id)
  if (idx === -1) return

  activeBubbles.value[idx].popping = true
  hitCount.value++
  vibrateQteHit()
  audioStore.playSfx('qte-hit')

  setTimeout(() => {
    activeBubbles.value = activeBubbles.value.filter(b => b.id !== id)
  }, 150)

  if (hitCount.value >= targetHits) {
    endGame()
  }
}

function onFieldTap() {
  /* 点击空白区域不做处理 */
}

async function endGame() {
  if (!gameActive.value) return
  gameActive.value = false
  stopGame()

  const won = hitCount.value >= targetHits
  resultType.value = won ? 'win' : 'lose'
  showResult.value = true

  if (won) {
    userStore.updateXuanjing(15)
    vibrateDefuseWin()
    audioStore.playSfx('defuse-win')
    await callCloud('defuse-mine', { poiId: poiId.value, success: true })
  } else {
    userStore.updateXuanjing(-5)
    vibrateDefuseFail()
    audioStore.playSfx('defuse-fail')
    await callCloud('defuse-mine', { poiId: poiId.value, success: false })
  }

  setTimeout(() => {
    uni.navigateBack()
  }, 2000)
}

function stopGame() {
  if (gameTimer) { clearInterval(gameTimer); gameTimer = null }
  if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null }
  if (cleanupTimer) { clearInterval(cleanupTimer); cleanupTimer = null }
}
</script>

<style scoped>
.defuse-page {
  min-height: 100vh;
  background: #000000;
  position: relative;
  overflow: hidden;
}

.countdown-area {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding-top: calc(env(safe-area-inset-top, 20px) + 20rpx);
  z-index: 20;
}

.countdown-value {
  color: #FFD700;
  font-size: 64rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
}

.countdown--urgent {
  color: #FF3F3F;
  text-shadow: 0 0 20rpx rgba(255, 63, 63, 0.6);
  animation: urgent-blink 0.5s ease-in-out infinite;
}

@keyframes urgent-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.bubble-field {
  position: absolute;
  inset: 0;
  z-index: 5;
}

.qte-bubble {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bubble-appear 200ms ease-out forwards;
  transition: transform 150ms ease-out, opacity 150ms ease-out;
}

.qte-bubble--red {
  background: radial-gradient(circle, rgba(255, 63, 63, 0.3) 0%, rgba(255, 63, 63, 0.1) 100%);
  border: 2rpx solid rgba(255, 63, 63, 0.6);
  box-shadow: 0 0 16rpx rgba(255, 63, 63, 0.3);
}

.qte-bubble--blue {
  background: radial-gradient(circle, rgba(0, 168, 255, 0.3) 0%, rgba(0, 168, 255, 0.1) 100%);
  border: 2rpx solid rgba(0, 168, 255, 0.6);
  box-shadow: 0 0 16rpx rgba(0, 168, 255, 0.3);
}

.qte-bubble--popping {
  transform: scale(1.5) !important;
  opacity: 0 !important;
}

.bubble-rune {
  color: rgba(255, 255, 255, 0.7);
  font-size: 28rpx;
  font-weight: 700;
}

@keyframes bubble-appear {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom, 0px));
  background: rgba(0, 0, 0, 0.8);
  z-index: 20;
}

.status-hit {
  color: #A98C76;
  font-size: 28rpx;
}

.status-hit__count {
  color: #FFD700;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.status-cost {
  color: #EF4444;
  font-size: 24rpx;
}

.result-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: result-fadein 300ms ease-out;
}

.result-overlay--win {
  background: rgba(0, 0, 0, 0.85);
}

.result-overlay--lose {
  background: rgba(40, 0, 0, 0.85);
}

.result-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.result-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #F0E6D6;
}

.result-reward--win {
  color: #FFD700;
  font-size: 64rpx;
  font-weight: 700;
  text-shadow: 0 0 30rpx rgba(255, 215, 0, 0.6);
}

.result-reward--lose {
  color: #EF4444;
  font-size: 64rpx;
  font-weight: 700;
  text-shadow: 0 0 30rpx rgba(239, 68, 68, 0.6);
}

@keyframes result-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
