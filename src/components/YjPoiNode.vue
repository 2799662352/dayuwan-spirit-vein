<template>
  <view
    class="poi-node"
    :class="[
      `poi-node--${owner}`,
      { 'poi-node--active': active, 'poi-node--selected': selected }
    ]"
    :style="nodeStyle"
    @tap="$emit('tap')"
  >
    <view v-if="owner === 'contested'" class="poi-pulse poi-pulse--contested" />
    <view v-else class="poi-pulse" :class="`poi-pulse--${owner}`" />
    <view class="poi-core" />
    <view v-if="active" class="poi-fence" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PoiOwner } from '@/stores/battlefield'

const props = defineProps<{
  owner: PoiOwner
  distance?: number
  active?: boolean
  selected?: boolean
  x: number
  y: number
}>()

defineEmits<{
  tap: []
}>()

const nodeSize = computed(() => {
  if (!props.distance) return 48
  if (props.distance < 50) return 48
  if (props.distance < 200) return 40
  if (props.distance < 500) return 32
  return 24
})

const nodeStyle = computed(() => ({
  width: nodeSize.value + 'rpx',
  height: nodeSize.value + 'rpx',
  left: props.x + 'rpx',
  top: props.y + 'rpx',
  transform: 'translate(-50%, -50%)',
}))
</script>

<style scoped>
.poi-node {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 300ms ease-out;
}

.poi-core {
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: currentColor;
}

.poi-node--blue {
  border: 2rpx solid #00A8FF;
  color: #00A8FF;
  box-shadow: 0 0 16rpx rgba(0, 168, 255, 0.4);
}

.poi-node--red {
  border: 2rpx solid #FF3F3F;
  color: #FF3F3F;
  box-shadow: 0 0 16rpx rgba(255, 63, 63, 0.4);
}

.poi-node--contested {
  border: 2rpx solid #8B5CF6;
  color: #8B5CF6;
  animation: contested-flicker 1.5s ease-in-out infinite;
}

.poi-node--active {
  transform: translate(-50%, -50%) scale(1.3) !important;
}

.poi-node--selected {
  border-width: 3rpx;
}

.poi-pulse {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

.poi-pulse--blue {
  border: 1rpx solid rgba(0, 168, 255, 0.3);
}

.poi-pulse--red {
  border: 1rpx solid rgba(255, 63, 63, 0.3);
}

.poi-pulse--contested {
  border: 1rpx solid rgba(139, 92, 246, 0.3);
}

.poi-fence {
  position: absolute;
  inset: -16rpx;
  border-radius: 50%;
  border: 2rpx dashed rgba(255, 215, 0, 0.3);
  animation: fence-rotate 8s linear infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes contested-flicker {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@keyframes fence-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
