import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocationStore } from './location'
import { calcDistance, calcBearing } from '@/utils/geo'
import { callCloud } from '@/utils/cloud'

export type PoiOwner = 'blue' | 'red' | 'contested'

export interface PoiState {
  _id: string
  name: string
  lat: number
  lng: number
  fence_radius: number
  blue_mines: number
  red_mines: number
  owner: PoiOwner
  distance?: number
  bearing?: number
}

export const useBattlefieldStore = defineStore('battlefield', () => {
  const pois = ref<PoiState[]>([])
  const globalBlue = ref(0)
  const globalRed = ref(0)
  const currentPoiId = ref<string | null>(null)
  const isInFence = ref(false)
  const loading = ref(false)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const nearestPOI = computed<PoiState | null>(() => {
    if (pois.value.length === 0) return null
    return pois.value.reduce((nearest, poi) =>
      (poi.distance ?? Infinity) < (nearest.distance ?? Infinity) ? poi : nearest,
    )
  })

  const currentPoi = computed<PoiState | null>(() => {
    if (!currentPoiId.value) return null
    return pois.value.find(p => p._id === currentPoiId.value) ?? null
  })

  function calcOwner(blue: number, red: number): PoiOwner {
    const total = blue + red
    if (total === 0) return 'contested'
    if (blue / total >= 0.6) return 'blue'
    if (red / total >= 0.6) return 'red'
    return 'contested'
  }

  function updateDistancesAndBearings() {
    const locStore = useLocationStore()
    pois.value.forEach(poi => {
      poi.distance = Math.round(calcDistance(locStore.lat, locStore.lng, poi.lat, poi.lng))
      poi.bearing = calcBearing(locStore.lat, locStore.lng, poi.lat, poi.lng)
    })
  }

  function checkFenceStatus() {
    const locStore = useLocationStore()
    let foundPoi: string | null = null

    for (const poi of pois.value) {
      if (locStore.checkInFence(poi.lat, poi.lng, poi.fence_radius)) {
        foundPoi = poi._id
        break
      }
    }

    const wasInFence = isInFence.value
    isInFence.value = foundPoi !== null
    currentPoiId.value = foundPoi

    return { entered: !wasInFence && isInFence.value, exited: wasInFence && !isInFence.value }
  }

  async function fetchBattlefield() {
    loading.value = true
    const res = await callCloud<{ pois: PoiState[]; globalBlue: number; globalRed: number }>('get-battlefield')

    if (res.success && res.data) {
      pois.value = res.data.pois
      globalBlue.value = res.data.globalBlue
      globalRed.value = res.data.globalRed
    } else {
      loadMockData()
    }

    updateDistancesAndBearings()
    loading.value = false
  }

  function loadMockData() {
    // 大余湾 10 个阵眼 (模拟坐标，待替换为真实数据)
    const baseLat = 30.8825
    const baseLng = 114.3726
    const mockPois: PoiState[] = [
      { _id: 'poi_01', name: '余庆堂', lat: baseLat + 0.0010, lng: baseLng + 0.0008, fence_radius: 50, blue_mines: 3, red_mines: 1, owner: 'blue' },
      { _id: 'poi_02', name: '滕王阁', lat: baseLat - 0.0005, lng: baseLng + 0.0015, fence_radius: 50, blue_mines: 0, red_mines: 4, owner: 'red' },
      { _id: 'poi_03', name: '聚义桥', lat: baseLat + 0.0020, lng: baseLng - 0.0005, fence_radius: 50, blue_mines: 2, red_mines: 2, owner: 'contested' },
      { _id: 'poi_04', name: '古戏台', lat: baseLat - 0.0015, lng: baseLng - 0.0010, fence_radius: 50, blue_mines: 5, red_mines: 0, owner: 'blue' },
      { _id: 'poi_05', name: '望月亭', lat: baseLat + 0.0008, lng: baseLng + 0.0025, fence_radius: 50, blue_mines: 1, red_mines: 3, owner: 'red' },
      { _id: 'poi_06', name: '碧水潭', lat: baseLat - 0.0022, lng: baseLng + 0.0005, fence_radius: 50, blue_mines: 0, red_mines: 0, owner: 'contested' },
      { _id: 'poi_07', name: '龙泉井', lat: baseLat + 0.0005, lng: baseLng - 0.0018, fence_radius: 50, blue_mines: 2, red_mines: 1, owner: 'contested' },
      { _id: 'poi_08', name: '耕读堂', lat: baseLat - 0.0008, lng: baseLng - 0.0022, fence_radius: 50, blue_mines: 4, red_mines: 1, owner: 'blue' },
      { _id: 'poi_09', name: '风雨廊', lat: baseLat + 0.0018, lng: baseLng + 0.0012, fence_radius: 50, blue_mines: 1, red_mines: 5, owner: 'red' },
      { _id: 'poi_10', name: '百步梯', lat: baseLat - 0.0012, lng: baseLng + 0.0020, fence_radius: 50, blue_mines: 2, red_mines: 2, owner: 'contested' },
    ]

    mockPois.forEach(poi => {
      poi.owner = calcOwner(poi.blue_mines, poi.red_mines)
    })

    pois.value = mockPois
    globalBlue.value = mockPois.filter(p => p.owner === 'blue').length
    globalRed.value = mockPois.filter(p => p.owner === 'red').length
  }

  function startPolling(intervalMs: number = 5000) {
    stopPolling()
    fetchBattlefield()
    pollTimer = setInterval(() => {
      fetchBattlefield()
    }, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    pois,
    globalBlue,
    globalRed,
    currentPoiId,
    isInFence,
    loading,
    nearestPOI,
    currentPoi,
    calcOwner,
    updateDistancesAndBearings,
    checkFenceStatus,
    fetchBattlefield,
    loadMockData,
    startPolling,
    stopPolling,
  }
})
