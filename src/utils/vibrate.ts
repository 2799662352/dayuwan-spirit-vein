/**
 * 震动反馈封装
 */

let heartbeatTimer: ReturnType<typeof setInterval> | null = null

export function vibrateShort() {
  try {
    uni.vibrateShort({})
  } catch (_) { /* 静默失败 */ }
}

export function vibrateLong() {
  try {
    uni.vibrateLong({})
  } catch (_) { /* 静默失败 */ }
}

export function startHeartbeat(intervalMs: number = 2000) {
  stopHeartbeat()
  vibrateShort()
  heartbeatTimer = setInterval(vibrateShort, intervalMs)
}

export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

export function vibrateDefuseWin() {
  vibrateShort()
  setTimeout(vibrateShort, 150)
  setTimeout(vibrateShort, 300)
}

export function vibrateDefuseFail() {
  vibrateLong()
  setTimeout(vibrateLong, 500)
}

export function vibrateQteHit() {
  vibrateShort()
}

export function vibratePlantSuccess() {
  vibrateLong()
}
