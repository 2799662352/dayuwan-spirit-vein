<template>
  <view
    class="guide"
    :class="{
      'guide--glitch': isGlitching,
      'guide--scatter': isScattering,
    }"
  >
    <!-- Z0: 虚空底噪 + 发光尘埃 -->
    <view class="dust-field" aria-hidden="true">
      <view
        v-for="i in 36"
        :key="i"
        class="dust"
        :class="i % 3 === 0 ? 'dust--warm' : ''"
        :style="dustStyle(i)"
      />
    </view>

    <!-- Z5: 天道箴言 -->
    <view
      v-if="!stoneHidden"
      class="proverb"
    >
      <text class="proverb__line proverb__line--1">凡人看风景</text>
      <text
        class="proverb__line proverb__line--2"
        :style="proverbGlowStyle"
      >修者看气运</text>
    </view>

    <!-- Z10: 上古测灵原石 -->
    <view
      v-if="!stoneHidden"
      class="stone-anchor"
      :class="{ 'stone-anchor--exit': fsmState >= 4 }"
    >
      <view class="stone" :style="stoneGlowStyle">
        <!-- 黑曜石纹理底层 -->
        <view class="stone__obsidian" />
        <!-- 玉质经脉·赛博电路 -->
        <view class="stone__veins" :style="veinsStyle" />
        <!-- 翠玉内核晕 -->
        <view class="stone__jade-core" :style="jadeCoreStyle" />
      </view>

      <!-- Z20: 灵契交互锚点 -->
      <view class="interact">
        <!-- 石面雕刻：测灵石 -->
        <text class="carve-title">测灵石</text>

        <!-- 指纹凹槽 -->
        <view
          class="fp"
          @touchstart.prevent="onTouchStart"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
          @mousedown.prevent="onTouchStart"
          @mouseup="onTouchEnd"
          @mouseleave="onTouchEnd"
        >
          <view class="fp__well" :style="fpGlowStyle" />
          <view class="fp__ring" :style="ringStyle" />
        </view>

      </view>
    </view>

    <!-- 底部引导文（脱离石头锚点，固定在屏幕底部20%） -->
    <view v-if="!stoneHidden" class="bottom-hint">
      <text class="carve-hint">长按注入灵力 · 勘测天命</text>
    </view>

    <!-- Z50: Glitch + 闪屏 -->
    <view v-if="isGlitching" class="glitch-mask" />
    <view v-if="isFlashing" class="flash-mask" />

    <!-- Z60: 阵营图腾显化 -->
    <view
      v-if="showFaction"
      class="faction"
      :class="factionCls"
    >
      <!-- 全屏氛围背景动画层 -->
      <view class="faction__aura" />

      <!-- 全屏特效粒子 -->
      <view class="faction__fx">
        <view v-for="k in 20" :key="k" class="fx-particle" :style="fxStyle(k)" />
      </view>

      <!-- 图腾 -->
      <view class="faction__emblem">
        <text class="faction__glyph">{{ factionGlyph }}</text>
      </view>
      <text class="faction__name">{{ factionName }}</text>

      <!-- 天道判词 -->
      <text v-if="showJudge" class="faction__judge">{{ factionJudge }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()

// ── 常量 ──
const HOLD_MS = 2000
const VIBE_START_MS = 400

// ── 响应式状态 ──
const fsmState = ref(0) // 0待机 1破冰 2灌注 3裁决 4显化 5跃迁
const pressProgress = ref(0)
const stoneHidden = ref(false)
const isGlitching = ref(false)
const isFlashing = ref(false)
const showFaction = ref(false)
const isScattering = ref(false)
const resolvedCamp = ref(0)
const showJudge = ref(false)
const safeTop = ref(88)

let holdStart = 0
let tickRaf = 0
let vibeTimer = null
let vibeInterval = VIBE_START_MS

// ── 胶囊安全区 ──

function initSafe() {
  // #ifdef MP-WEIXIN
  try {
    const c = uni.getMenuButtonBoundingClientRect()
    safeTop.value = c.top
  } catch { safeTop.value = 44 }
  // #endif
  // #ifdef H5
  safeTop.value = 24
  // #endif
}

// ── 尘埃粒子 ──

function dustStyle(i) {
  const s1 = ((i * 7 + 3) % 36) / 36
  const s2 = ((i * 13 + 7) % 36) / 36
  return {
    left: (s1 * 96 + 2) + '%',
    animationDelay: (s2 * 10).toFixed(1) + 's',
    animationDuration: (5 + s1 * 7).toFixed(1) + 's',
    width: (1.5 + s2 * 2) + 'rpx',
    height: (1.5 + s2 * 2) + 'rpx',
  }
}

// ── 视觉绑定 ──

const proverbGlowStyle = computed(() => {
  const p = pressProgress.value / 100
  const alpha = 0.35 + p * 0.65
  const glow = 8 + p * 28
  return {
    opacity: alpha,
    textShadow: `0 0 ${glow}rpx rgba(0, 229, 255, ${0.3 + p * 0.5}), 0 0 ${glow * 2}rpx rgba(0, 229, 255, ${p * 0.25})`,
  }
})

const stoneGlowStyle = computed(() => {
  const p = pressProgress.value / 100
  const r = 8 + p * 50
  const a = (0.03 + p * 0.35).toFixed(2)
  return {
    boxShadow: `0 0 ${r}rpx ${r * 0.5}rpx rgba(0, 229, 255, ${a})`,
  }
})

const veinsStyle = computed(() => {
  const p = pressProgress.value / 100
  return { opacity: (0.06 + p * 0.94).toFixed(2) }
})

const jadeCoreStyle = computed(() => {
  const p = pressProgress.value / 100
  return {
    transform: `translate(-50%, -50%) scale(${0.5 + p * 0.6})`,
    opacity: 0.12 + p * 0.65,
  }
})

const fpGlowStyle = computed(() => {
  const p = pressProgress.value / 100
  const s = 6 + p * 28
  const a = 0.25 + p * 0.75
  const color = p < 0.65
    ? `rgba(180, 150, 60, ${a})`
    : `rgba(0, 229, 255, ${a})`
  return {
    boxShadow: [
      `inset 0 3rpx 14rpx rgba(0,0,0,0.85)`,
      `inset 0 -2rpx ${s}rpx ${color}`,
      `0 0 ${s * 1.5}rpx ${color}`,
    ].join(', '),
  }
})

const ringStyle = computed(() => {
  const deg = (pressProgress.value / 100) * 360
  const c = pressProgress.value < 65 ? '#b4963c' : '#00e5ff'
  return { background: `conic-gradient(${c} ${deg}deg, transparent ${deg}deg)` }
})

const factionCls = computed(() =>
  resolvedCamp.value === 1 ? 'faction--blue' : 'faction--red',
)
const factionGlyph = computed(() =>
  resolvedCamp.value === 1 ? '耕读传家' : '万金聚财',
)
const factionName = computed(() =>
  resolvedCamp.value === 1 ? '— 耕读盟 —' : '— 万金楼 —',
)
const factionJudge = computed(() =>
  resolvedCamp.value === 1
    ? '天命属水，润泽苍生，承耕读之志。'
    : '天命属火，夺天造化，聚万金之势。',
)

// ── 阵营特效粒子 ──

function fxStyle(k) {
  const s = ((k * 7 + 3) % 20) / 20
  const s2 = ((k * 13 + 11) % 20) / 20
  return {
    left: (s * 90 + 5) + '%',
    animationDelay: (s2 * 2).toFixed(1) + 's',
    animationDuration: (2.5 + s * 3).toFixed(1) + 's',
    width: (4 + s2 * 8) + 'rpx',
    height: (4 + s2 * 8) + 'rpx',
  }
}

// ── FSM: 触摸驱动 ──

const raf = (fn) =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(fn)
    : (setTimeout(fn, 16))

const caf = (id) =>
  typeof cancelAnimationFrame === 'function'
    ? cancelAnimationFrame(id)
    : clearTimeout(id)

function onTouchStart() {
  if (fsmState.value >= 3) return

  fsmState.value = 1
  holdStart = Date.now()
  pressProgress.value = 0

  try { uni.vibrateShort({ type: 'heavy' }) } catch {}

  fsmState.value = 2
  tickRaf = raf(tick)
  startVibeLoop()
}

function tick() {
  if (fsmState.value !== 2) return
  const elapsed = Date.now() - holdStart
  const p = Math.min(100, (elapsed / HOLD_MS) * 100)
  pressProgress.value = p
  if (p >= 100) {
    stopTimers()
    onComplete()
    return
  }
  tickRaf = raf(tick)
}

function onTouchEnd() {
  if (fsmState.value !== 2) return
  stopTimers()
  pressProgress.value = 0
  fsmState.value = 0
}

function startVibeLoop() {
  vibeInterval = VIBE_START_MS
  vibeTimer = setTimeout(function vibeStep() {
    if (fsmState.value !== 2) return
    try { uni.vibrateShort({ type: 'medium' }) } catch {}
    const p = pressProgress.value / 100
    vibeInterval = Math.max(60, VIBE_START_MS * (1 - p * 0.85))
    vibeTimer = setTimeout(vibeStep, vibeInterval)
  }, vibeInterval)
}

function stopTimers() {
  if (tickRaf) { caf(tickRaf); tickRaf = 0 }
  if (vibeTimer) { clearTimeout(vibeTimer); vibeTimer = null }
}

// ── State 3-5: 天命裁决 → 显化 → 跃迁 ──

async function onComplete() {
  fsmState.value = 3

  try { uni.vibrateLong() } catch {}

  isGlitching.value = true
  await sleep(220)
  isGlitching.value = false

  isFlashing.value = true
  await sleep(500)
  isFlashing.value = false

  resolvedCamp.value = user.allocateCamp()

  fsmState.value = 4
  stoneHidden.value = true
  showFaction.value = true
  await sleep(500)
  showJudge.value = true
  await sleep(1500)

  fsmState.value = 5
  isScattering.value = true
  await sleep(650)

  uni.redirectTo({ url: '/pages/index/index' })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── 生命周期 ──

onMounted(() => {
  initSafe()
  fsmState.value = 0
})

onBeforeUnmount(() => {
  stopTimers()
})
</script>

<style scoped>
/* ═══════════════════════════════════
   容器
   ═══════════════════════════════════ */
.guide {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

/* ═══════════════════════════════════
   Z0: 虚空尘埃
   ═══════════════════════════════════ */
.dust-field {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.dust {
  position: absolute;
  top: -4%;
  border-radius: 50%;
  background: rgba(0, 229, 255, 0.55);
  box-shadow: 0 0 3rpx rgba(0, 229, 255, 0.35);
  animation: dust-fall linear infinite;
}

.dust--warm {
  background: rgba(251, 191, 36, 0.4);
  box-shadow: 0 0 3rpx rgba(251, 191, 36, 0.25);
}

@keyframes dust-fall {
  0%   { transform: translateY(-120rpx); opacity: 0; }
  8%   { opacity: 0.6; }
  50%  { opacity: 0.15; }
  88%  { opacity: 0.5; }
  100% { transform: translateY(1620rpx) translateX(16rpx); opacity: 0; }
}

/* ═══════════════════════════════════
   Z5: 天道箴言
   ═══════════════════════════════════ */
.proverb {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-top: 200rpx;
  pointer-events: none;
}

.proverb__line {
  font-family: 'LiSu', 'STZhongsong', 'FZLiShu-S01S', 'ZCOOL XiaoWei', '隶书', serif;
  font-size: 58rpx;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(220, 230, 240, 0.35);
  text-shadow:
    0 0 10rpx rgba(0, 229, 255, 0.2),
    0 0 30rpx rgba(0, 229, 255, 0.08);
}

.proverb__line--2 {
  transition: opacity 0.12s ease, text-shadow 0.12s ease;
}

/* ═══════════════════════════════════
   Z10: 测灵原石
   ═══════════════════════════════════ */
.stone-anchor {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -48%);
  z-index: 10;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.stone-anchor--exit {
  opacity: 0;
  transform: translate(-50%, -48%) scale(0.6);
}

.stone {
  position: relative;
  width: 500rpx;
  height: 580rpx;
  clip-path: polygon(
    46% 1%, 58% 0%, 72% 2%, 82% 6%, 91% 14%,
    97% 26%, 100% 40%, 98% 54%, 95% 64%, 90% 74%,
    97% 82%, 94% 90%, 84% 96%, 72% 100%, 58% 98%,
    46% 100%, 32% 97%, 18% 92%, 8% 84%, 2% 74%,
    0% 62%, 1% 48%, 3% 36%, 8% 24%, 16% 14%,
    26% 6%, 36% 2%
  );
  transition: filter 0.12s ease;
}

.stone__obsidian {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background:
    radial-gradient(ellipse at 28% 22%, rgba(65, 62, 68, 0.5) 0%, transparent 48%),
    radial-gradient(ellipse at 72% 75%, rgba(55, 52, 58, 0.4) 0%, transparent 42%),
    radial-gradient(ellipse at 50% 50%, rgba(35, 33, 38, 0.6) 0%, transparent 55%),
    linear-gradient(155deg, #1c1c20 0%, #101012 25%, #18181c 50%, #0c0c0e 75%, #141416 100%);
}

.stone__veins {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  background:
    radial-gradient(ellipse at 50% 58%, rgba(180, 150, 60, 0.12) 0%, transparent 35%),
    repeating-linear-gradient(
      5deg, transparent, transparent 24rpx,
      rgba(180, 150, 60, 0.06) 24rpx, rgba(180, 150, 60, 0.06) 26rpx
    ),
    repeating-linear-gradient(
      95deg, transparent, transparent 32rpx,
      rgba(180, 150, 60, 0.04) 32rpx, rgba(180, 150, 60, 0.04) 34rpx
    ),
    repeating-linear-gradient(
      140deg, transparent, transparent 44rpx,
      rgba(0, 229, 255, 0.03) 44rpx, rgba(0, 229, 255, 0.03) 46rpx
    );
  transition: opacity 0.1s linear;
  pointer-events: none;
}

.stone__jade-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(130, 210, 170, 0.3) 0%,
    rgba(90, 170, 130, 0.12) 40%,
    transparent 68%
  );
  pointer-events: none;
  transition: transform 0.12s ease, opacity 0.12s ease;
}

/* ═══════════════════════════════════
   Z20: 灵契交互锚点
   ═══════════════════════════════════ */
.interact {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.carve-title {
  font-family: 'LiSu', 'STZhongsong', 'FZLiShu-S01S', 'ZCOOL XiaoWei', '隶书', serif;
  font-size: 44rpx;
  font-weight: 900;
  letter-spacing: 0.4em;
  color: rgba(160, 140, 100, 0.2);
  text-shadow:
    0 -1rpx 0 rgba(255, 245, 220, 0.08),
    0 2rpx 4rpx rgba(0, 0, 0, 0.9);
  margin-bottom: 32rpx;
}

.fp {
  position: relative;
  width: 150rpx;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.fp__well {
  width: 110rpx;
  height: 140rpx;
  border-radius: 46% 54% 50% 50% / 38% 38% 62% 62%;
  background: rgba(12, 12, 15, 0.85);
  transition: box-shadow 0.08s ease;
  animation: breathe 2s ease-in-out infinite;
}

.fp__ring {
  position: absolute;
  top: -6rpx; right: -6rpx; bottom: -6rpx; left: -6rpx;
  border-radius: 50%;
  -webkit-mask: radial-gradient(transparent 58rpx, #000 60rpx);
  mask: radial-gradient(transparent 58rpx, #000 60rpx);
  transition: background 0.06s linear;
  pointer-events: none;
}

@keyframes breathe {
  0%, 100% {
    box-shadow:
      inset 0 3rpx 14rpx rgba(0, 0, 0, 0.85),
      inset 0 -2rpx 6rpx rgba(180, 150, 60, 0.08),
      0 0 10rpx rgba(180, 150, 60, 0.06);
  }
  50% {
    box-shadow:
      inset 0 3rpx 14rpx rgba(0, 0, 0, 0.75),
      inset 0 -2rpx 14rpx rgba(180, 150, 60, 0.28),
      0 0 22rpx rgba(180, 150, 60, 0.18);
  }
}

.bottom-hint {
  position: absolute;
  bottom: 15%;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.carve-hint {
  font-family: 'STKaiti', 'KaiTi', '楷体', 'FZKaiS', serif;
  font-size: 22rpx;
  letter-spacing: 0.18em;
  color: rgba(180, 160, 120, 0.3);
  animation: hint-pulse 3s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.7; }
}

/* ═══════════════════════════════════
   Z50: Glitch + Flash
   ═══════════════════════════════════ */
.glitch-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  pointer-events: none;
  animation: glitch-bars 0.22s steps(5) forwards;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    rgba(255, 0, 80, 0.06) 2px,
    transparent 4px,
    rgba(0, 255, 200, 0.04) 6px,
    transparent 8px
  );
}

@keyframes glitch-bars {
  0%   { transform: translateX(0) scaleY(1); }
  20%  { transform: translateX(-8rpx) scaleY(1.01); }
  40%  { transform: translateX(12rpx) scaleY(0.99); }
  60%  { transform: translateX(-4rpx) scaleY(1.02); }
  80%  { transform: translateX(6rpx) scaleY(0.98); }
  100% { transform: translateX(0) scaleY(1); }
}

.guide--glitch {
  animation: screen-glitch 0.22s steps(4);
}

@keyframes screen-glitch {
  0%   { opacity: 1; }
  25%  { opacity: 0.7; transform: translateX(4rpx); }
  50%  { opacity: 0.85; transform: translateX(-6rpx); }
  75%  { opacity: 0.6; transform: translateX(3rpx); }
  100% { opacity: 1; transform: translateX(0); }
}

.flash-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 55;
  background: #fff;
  pointer-events: none;
  animation: flash-decay 0.5s ease-out forwards;
}

@keyframes flash-decay {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

/* ═══════════════════════════════════
   Z60: 阵营图腾显化
   ═══════════════════════════════════ */
.faction {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36rpx;
  animation: faction-in 0.7s ease-out forwards;
  overflow: hidden;
  background: #000;
}

/* 耕读盟：幽蓝水墨 */
.faction--blue {
  background: radial-gradient(ellipse at 50% 45%, rgba(0, 60, 130, 0.6) 0%, rgba(0, 0, 0, 0.98) 60%);
}

/* 万金楼：猩红霓虹 */
.faction--red {
  background: radial-gradient(ellipse at 50% 45%, rgba(130, 20, 10, 0.55) 0%, rgba(0, 0, 0, 0.98) 60%);
}

/* 氛围动画层（独立元素，避免多重 animation 不兼容） */
.faction__aura {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
}

.faction--blue .faction__aura {
  background:
    radial-gradient(ellipse at 25% 25%, rgba(0, 100, 200, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 75% 65%, rgba(0, 80, 180, 0.2) 0%, transparent 45%);
  animation: ink-drift 3.5s ease-in-out infinite;
}

.faction--red .faction__aura {
  background:
    radial-gradient(ellipse at 30% 30%, rgba(200, 30, 0, 0.2) 0%, transparent 45%),
    radial-gradient(ellipse at 70% 60%, rgba(160, 20, 0, 0.18) 0%, transparent 40%);
  animation: flame-breathe 2s ease-in-out infinite;
}

@keyframes ink-drift {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.08); }
}

@keyframes flame-breathe {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.06); }
}

/* 全屏特效粒子 */
.faction__fx {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
}

.fx-particle {
  position: absolute;
  bottom: -5%;
  border-radius: 50%;
  animation: fx-rise ease-out infinite;
}

.faction--blue .fx-particle {
  background: rgba(0, 200, 255, 0.6);
  box-shadow: 0 0 10rpx rgba(0, 200, 255, 0.5);
}

.faction--red .fx-particle {
  background: rgba(255, 80, 40, 0.65);
  box-shadow: 0 0 10rpx rgba(255, 80, 40, 0.55);
}

@keyframes fx-rise {
  0%   { transform: translateY(0rpx) scale(1); opacity: 0; }
  10%  { opacity: 0.9; }
  80%  { opacity: 0.25; }
  100% { transform: translateY(-1600rpx) scale(0.2); opacity: 0; }
}

/* 图腾 */
.faction__emblem {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: emblem-pulse 2.5s ease-in-out infinite;
}

@keyframes emblem-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.04); }
}

.faction__glyph {
  font-family: 'LiSu', 'STZhongsong', 'FZLiShu-S01S', 'ZCOOL XiaoWei', '隶书', serif;
  font-size: 80rpx;
  font-weight: 900;
  letter-spacing: 0.3em;
}

.faction--blue .faction__glyph {
  color: #00d4ff;
  text-shadow:
    0 0 28rpx rgba(0, 212, 255, 0.8),
    0 0 80rpx rgba(0, 168, 255, 0.4),
    0 0 160rpx rgba(0, 120, 200, 0.2);
}

.faction--red .faction__glyph {
  color: #ff3b3b;
  text-shadow:
    0 0 28rpx rgba(255, 59, 59, 0.8),
    0 0 80rpx rgba(255, 40, 40, 0.4),
    0 0 160rpx rgba(200, 20, 20, 0.2);
}

.faction__name {
  position: relative;
  z-index: 2;
  font-size: 30rpx;
  letter-spacing: 0.25em;
}

.faction--blue .faction__name {
  color: rgba(0, 200, 255, 0.6);
}

.faction--red .faction__name {
  color: rgba(255, 100, 100, 0.6);
}

/* 天道判词 */
.faction__judge {
  position: relative;
  z-index: 2;
  font-family: 'STKaiti', 'KaiTi', '楷体', 'FZKaiS', serif;
  font-size: 26rpx;
  letter-spacing: 0.14em;
  line-height: 1.8;
  text-align: center;
  max-width: 520rpx;
  margin-top: 16rpx;
  animation: judge-in 0.8s ease-out;
}

.faction--blue .faction__judge {
  color: rgba(0, 210, 255, 0.65);
  text-shadow: 0 0 16rpx rgba(0, 229, 255, 0.35);
}

.faction--red .faction__judge {
  color: rgba(255, 130, 100, 0.65);
  text-shadow: 0 0 16rpx rgba(255, 68, 68, 0.35);
}

@keyframes judge-in {
  0%   { opacity: 0; transform: translateY(30rpx); }
  100% { opacity: 1; transform: translateY(0rpx); }
}

@keyframes faction-in {
  0%   { opacity: 0; transform: scale(0.75); }
  100% { opacity: 1; transform: scale(1); }
}

/* ═══════════════════════════════════
   光点跃迁
   ═══════════════════════════════════ */
.guide--scatter {
  animation: scatter 0.65s ease-in forwards;
}

@keyframes scatter {
  0%   { transform: scale(1); opacity: 1; }
  30%  { transform: scale(1.15); opacity: 0.9; }
  100% { transform: scale(3); opacity: 0; }
}
</style>
