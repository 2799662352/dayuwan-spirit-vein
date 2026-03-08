<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('[与见OS] 大余湾灵脉争夺战 启动')
})

onShow(() => {
  console.log('[与见OS] App Show')
})

onHide(() => {
  console.log('[与见OS] App Hide')
})
</script>

<style>
page {
  background-color: #000000;
  color: #F0E6D6;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

::-webkit-scrollbar {
  display: none;
}

:root {
  /* 中性色 */
  --bg-black: #000000;
  --bg-deep: #0A0A0F;
  --bg-overlay: #12121A;
  --text-primary: #F0E6D6;
  --text-secondary: #A98C76;
  --text-muted: #5A4A3A;
  --border: #2A1A1A;
  --gold: #FFD700;
  --gold-dim: #8B7355;
  --bronze: #CD7F32;

  /* 蓝方 (耕读盟) */
  --faction-blue: #00A8FF;
  --faction-blue-glow: #00D4FF;
  --faction-blue-dark: #003366;
  --faction-blue-aura: rgba(0, 168, 255, 0.08);

  /* 红方 (万金楼) */
  --faction-red: #FF3F3F;
  --faction-red-glow: #FF6B6B;
  --faction-red-dark: #660000;
  --faction-red-aura: rgba(255, 63, 63, 0.08);

  /* 交火区 */
  --contested: #8B5CF6;
  --contested-dark: #4A3A6A;

  /* 功能色 */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --xuanjing: #00FFFF;
}

/* 禁用橡皮筋效果 */
page {
  overscroll-behavior: none;
}
</style>
