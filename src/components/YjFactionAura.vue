<template>
  <view
    v-if="faction"
    class="faction-aura"
    :class="`faction-aura--${faction}`"
  />
</template>

<script setup lang="ts">
import type { Faction } from '@/utils/faction'

defineProps<{
  faction: Faction | null
}>()
</script>

<style scoped>
.faction-aura {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 40;
  animation: aura-breathe 3s ease-in-out infinite;
}

.faction-aura--blue {
  box-shadow: inset 0 0 80rpx rgba(0, 168, 255, 0.15);
}

.faction-aura--red {
  box-shadow: inset 0 0 80rpx rgba(255, 63, 63, 0.15);
}

@keyframes aura-breathe {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.4; }
}
</style>
