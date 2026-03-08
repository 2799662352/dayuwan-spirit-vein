import { defineStore } from 'pinia'
import { ref } from 'vue'

type SfxName = 'click' | 'plant' | 'defuse-start' | 'qte-hit' | 'defuse-win' | 'defuse-fail' | 'redeem' | 'fence-enter'

const SFX_PATHS: Record<SfxName, string> = {
  'click': '/static/audio/click-metal.mp3',
  'plant': '/static/audio/plant-chime.mp3',
  'defuse-start': '/static/audio/defuse-start.mp3',
  'qte-hit': '/static/audio/qte-hit.mp3',
  'defuse-win': '/static/audio/defuse-win.mp3',
  'defuse-fail': '/static/audio/defuse-fail.mp3',
  'redeem': '/static/audio/redeem-success.mp3',
  'fence-enter': '/static/audio/fence-enter.mp3',
}

export const useAudioStore = defineStore('audio', () => {
  const muted = ref(false)
  const ambientPlaying = ref(false)

  let ambientCtx: UniApp.InnerAudioContext | null = null
  const sfxPool: Map<string, UniApp.InnerAudioContext> = new Map()

  function initAmbient() {
    if (ambientCtx) return
    ambientCtx = uni.createInnerAudioContext()
    ambientCtx.src = '/static/audio/ambient-loop.mp3'
    ambientCtx.loop = true
    ambientCtx.volume = 0.3
    ambientCtx.obeyMuteSwitch = false
  }

  function playAmbient() {
    if (muted.value) return
    initAmbient()
    ambientCtx?.play()
    ambientPlaying.value = true
  }

  function stopAmbient() {
    ambientCtx?.stop()
    ambientPlaying.value = false
  }

  function playSfx(name: SfxName) {
    if (muted.value) return
    const path = SFX_PATHS[name]
    if (!path) return

    let ctx = sfxPool.get(name)
    if (!ctx) {
      ctx = uni.createInnerAudioContext()
      ctx.src = path
      ctx.obeyMuteSwitch = false
      sfxPool.set(name, ctx)
    }
    ctx.stop()
    ctx.seek(0)
    ctx.play()
  }

  function toggleMute() {
    muted.value = !muted.value
    if (muted.value) {
      stopAmbient()
    } else if (!ambientPlaying.value) {
      playAmbient()
    }
  }

  function destroy() {
    ambientCtx?.destroy()
    ambientCtx = null
    sfxPool.forEach(ctx => ctx.destroy())
    sfxPool.clear()
  }

  return {
    muted,
    ambientPlaying,
    playAmbient,
    stopAmbient,
    playSfx,
    toggleMute,
    destroy,
  }
})
