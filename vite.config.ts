import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://github.com/unocss/unocss/issues/2072
// UnoCSS 是 ESM-only，需要使用动态导入
export default defineConfig(async () => {
  const UnoCSS = (await import('unocss/vite')).default

  return {
    plugins: [
      UnoCSS(),
      uni(),
    ],
  }
})
