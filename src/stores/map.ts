import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { spiritNodes, type SpiritNode } from '@/config/mapConfig'

const DEG_TO_RAD = Math.PI / 180
const EARTH_R = 6_371_000

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD
  const dLng = (lng2 - lng1) * DEG_TO_RAD
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLng / 2) ** 2
  return EARTH_R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export type { SpiritNode }

export const useMapStore = defineStore('map', () => {
  const currentLocation = ref({ latitude: 0, longitude: 0 })
  const nodes = ref(spiritNodes.map((n) => ({ ...n })))
  const heading = ref(0)
  const watching = ref(false)

  let h5PollTimer: ReturnType<typeof setInterval> | null = null
  type LocChangeRes = { latitude?: number; longitude?: number }
  let wxLocationHandler: ((res: LocChangeRes) => void) | null = null

  const nearbyNode = computed<SpiritNode | null>(() => {
    const { latitude, longitude } = currentLocation.value
    if (!latitude && !longitude) return null
    return (
      nodes.value.find(
        (n) =>
          haversineMeters(latitude, longitude, n.latitude, n.longitude) <=
          n.radius,
      ) ?? null
    )
  })

  const isInFence = computed(() => !!nearbyNode.value)

  function updateLocation(lat: number, lng: number) {
    currentLocation.value = { latitude: lat, longitude: lng }
  }

  function checkInNode(lat: number, lng: number): string | null {
    for (const n of nodes.value) {
      if (haversineMeters(lat, lng, n.latitude, n.longitude) <= n.radius) {
        return n.id
      }
    }
    return null
  }

  async function getCurrentLocation() {
    try {
      const res = await uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
      })
      updateLocation(res.latitude, res.longitude)
    } catch (err) {
      console.error('[MapStore] 定位失败, 使用默认位置(大余湾)', err)
      updateLocation(30.8825, 114.3726)
    }
  }

  function startWatching() {
    if (watching.value) return
    watching.value = true

    // #ifdef MP-WEIXIN
    wxLocationHandler = (res) => {
      const { latitude: lat, longitude: lng } = res
      if (lat != null && lng != null) {
        updateLocation(lat, lng)
      }
    }
    uni.startLocationUpdate({
      type: 'gcj02',
      success() {
        if (wxLocationHandler) {
          uni.onLocationChange(wxLocationHandler)
        }
      },
      fail(err) {
        console.error('[MapStore] 持续定位失败', err)
      },
    })
    // #endif

    // #ifdef H5
    const poll = () => {
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (res) => updateLocation(res.latitude, res.longitude),
        fail: (err) => console.error('[MapStore] getLocation 失败', err),
      })
    }
    poll()
    h5PollTimer = setInterval(poll, 5000)
    // #endif
  }

  function stopWatching() {
    if (!watching.value) return
    watching.value = false

    // #ifdef MP-WEIXIN
    if (wxLocationHandler) {
      uni.offLocationChange(wxLocationHandler)
      wxLocationHandler = null
    }
    uni.stopLocationUpdate()
    // #endif

    // #ifdef H5
    if (h5PollTimer !== null) {
      clearInterval(h5PollTimer)
      h5PollTimer = null
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

  return {
    currentLocation,
    nodes,
    heading,
    nearbyNode,
    isInFence,
    startWatching,
    stopWatching,
    updateLocation,
    checkInNode,
    getCurrentLocation,
    startDeviceOrientation,
  }
})
