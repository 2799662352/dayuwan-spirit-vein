import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isInFence } from '@/utils/geo'

export const useLocationStore = defineStore('location', () => {
  const lat = ref(30.8825)
  const lng = ref(114.3726)
  const heading = ref(0)
  const ready = ref(false)
  const watching = ref(false)

  async function getCurrentLocation() {
    try {
      const res = await uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
      })
      lat.value = res.latitude
      lng.value = res.longitude
      ready.value = true
    } catch (err) {
      console.error('[LocationStore] 定位失败, 使用默认位置(大余湾)', err)
      lat.value = 30.8825
      lng.value = 114.3726
      ready.value = true
    }
  }

  function startWatching() {
    if (watching.value) return
    watching.value = true

    // #ifdef MP-WEIXIN
    uni.startLocationUpdate({
      success() {
        uni.onLocationChange((res) => {
          lat.value = res.latitude
          lng.value = res.longitude
        })
      },
      fail(err) {
        console.error('[LocationStore] 持续定位失败', err)
      },
    })
    // #endif

    // #ifdef H5
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => {
          lat.value = pos.coords.latitude
          lng.value = pos.coords.longitude
          if (pos.coords.heading) {
            heading.value = pos.coords.heading
          }
        },
        (err) => console.error('[LocationStore] H5 watchPosition 失败', err),
        { enableHighAccuracy: true, maximumAge: 3000 },
      )
    }
    // #endif
  }

  function startDeviceOrientation() {
    // #ifdef H5
    if (typeof DeviceOrientationEvent !== 'undefined') {
      window.addEventListener('deviceorientation', (e) => {
        if (e.alpha !== null) {
          heading.value = e.alpha
        }
      })
    }
    // #endif

    // #ifdef MP-WEIXIN
    uni.startCompass({
      success() {
        uni.onCompassChange((res) => {
          heading.value = res.direction
        })
      },
    })
    // #endif
  }

  function checkInFence(poiLat: number, poiLng: number, radius: number = 50): boolean {
    return isInFence(lat.value, lng.value, poiLat, poiLng, radius)
  }

  return {
    lat,
    lng,
    heading,
    ready,
    watching,
    getCurrentLocation,
    startWatching,
    startDeviceOrientation,
    checkInFence,
  }
})
