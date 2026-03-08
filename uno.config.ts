import {
  defineConfig,
  presetIcons,
} from 'unocss'
import { presetWeapp } from 'unocss-preset-weapp'

export default defineConfig({
  presets: [
    presetWeapp({
      platform: 'uniapp',
    }) as any,
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'flex-col-center': 'flex flex-col items-center justify-center',
    'page-full': 'min-h-screen bg-black text-[#F0E6D6] overflow-hidden',

    'text-gold': 'text-[#FFD700]',
    'text-gold-dim': 'text-[#8B7355]',
    'text-muted': 'text-[#A98C76]',
    'text-xuanjing': 'text-[#00FFFF]',
    'text-faction-blue': 'text-[#00A8FF]',
    'text-faction-red': 'text-[#FF3F3F]',
    'text-contested': 'text-[#8B5CF6]',
    'text-success': 'text-[#22C55E]',
    'text-danger': 'text-[#EF4444]',

    'bg-black': 'bg-[#000000]',
    'bg-deep': 'bg-[#0A0A0F]',
    'bg-overlay': 'bg-[#12121A]',
    'border-dark': 'border-[#2A1A1A]',
  },
  theme: {
    colors: {
      'black': '#000000',
      'deep': '#0A0A0F',
      'overlay': '#12121A',
      'gold': '#FFD700',
      'gold-dim': '#8B7355',
      'bronze': '#CD7F32',
      'faction-blue': '#00A8FF',
      'faction-blue-glow': '#00D4FF',
      'faction-blue-dark': '#003366',
      'faction-red': '#FF3F3F',
      'faction-red-glow': '#FF6B6B',
      'faction-red-dark': '#660000',
      'contested': '#8B5CF6',
      'xuanjing': '#00FFFF',
      'muted': '#A98C76',
      'success': '#22C55E',
      'warning': '#F59E0B',
      'danger': '#EF4444',
    },
  },
})
