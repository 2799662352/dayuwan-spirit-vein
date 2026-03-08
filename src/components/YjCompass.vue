<template>
  <view class="compass">
    <!-- 路网底图 -->
    <view class="compass__grid" />

    <!-- 指北标记 -->
    <view class="compass__north" :style="{ transform: `rotate(${-heading}deg)` }">
      <text class="north-label">N</text>
    </view>

    <!-- POI 节点 -->
    <YjPoiNode
      v-for="poi in projectedPois"
      :key="poi._id"
      :owner="poi.owner"
      :distance="poi.distance"
      :active="poi._id === activePoi"
      :selected="poi._id === selectedPoi"
      :x="poi.projX"
      :y="poi.projY"
      @tap="$emit('poi-tap', poi._id)"
    />

    <!-- 中心三角指示器 -->
    <view class="compass__center" :style="{ transform: `rotate(${heading}deg)` }">
      <view class="center-triangle" />
    </view>

    <!-- 距离圈 -->
    <view class="compass__ring compass__ring--inner" />
    <view class="compass__ring compass__ring--outer" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PoiState } from '@/stores/battlefield'
import YjPoiNode from './YjPoiNode.vue'

const props = defineProps<{
  pois: PoiState[]
  heading: number
  activePoi?: string | null
  selectedPoi?: string | null
  compassSize?: number
}>()

defineEmits<{
  'poi-tap': [id: string]
}>()

const size = computed(() => props.compassSize || 600)
const center = computed(() => size.value / 2)

const maxDistance = computed(() => {
  if (props.pois.length === 0) return 500
  const distances = props.pois.map(p => p.distance ?? 500)
  return Math.max(...distances, 200)
})

const projectedPois = computed(() => {
  return props.pois.map(poi => {
    const dist = poi.distance ?? 500
    const bearing = poi.bearing ?? 0
    const normalizedDist = Math.min(dist / maxDistance.value, 0.9)
    const radius = normalizedDist * (size.value * 0.42)

    const adjustedBearing = bearing - props.heading
    const rad = ((adjustedBearing - 90) * Math.PI) / 180

    return {
      ...poi,
      projX: center.value + radius * Math.cos(rad),
      projY: center.value + radius * Math.sin(rad),
    }
  })
})
</script>

<style scoped>
.compass {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  background: radial-gradient(circle, #0A0A0F 0%, #000000 100%);
}

.compass__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px);
  background-size: 60rpx 60rpx;
  transform: rotate(45deg) scale(1.5);
}

.compass__north {
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform-origin: center center;
  z-index: 10;
}

.north-label {
  color: #FFD700;
  font-size: 24rpx;
  font-weight: 700;
  text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5);
  margin-left: -12rpx;
}

.compass__center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 32rpx;
  height: 32rpx;
  margin-left: -16rpx;
  margin-top: -16rpx;
  z-index: 10;
  transition: transform 200ms ease-out;
}

.center-triangle {
  width: 0;
  height: 0;
  border-left: 12rpx solid transparent;
  border-right: 12rpx solid transparent;
  border-bottom: 24rpx solid #FFD700;
  margin: 0 auto;
  filter: drop-shadow(0 0 8rpx rgba(255, 215, 0, 0.6));
}

.compass__ring {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(255, 215, 0, 0.06);
  pointer-events: none;
}

.compass__ring--inner {
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
}

.compass__ring--outer {
  top: 8%;
  left: 8%;
  width: 84%;
  height: 84%;
}
</style>
