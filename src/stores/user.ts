import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { assignFaction, type Faction } from '@/utils/faction'
import { callCloud } from '@/utils/cloud'

export interface ShopItem {
  id: string
  name: string
  count: number
}

export interface UserProfile {
  _id: string
  openid: string
  faction: Faction
  lingshi: number
  xuanjing: number
  mines_planted: number
  mines_defused_win: number
  mines_defused_fail: number
  redeemed_today: number
  last_share_date: string
  status: 'normal' | 'dying'
  items: ShopItem[]
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLoggedIn = ref(false)

  const isDying = computed(() => {
    if (!profile.value) return false
    return profile.value.xuanjing < 5
  })

  const faction = computed<Faction | null>(() => profile.value?.faction ?? null)

  async function wxLogin() {
    try {
      const loginRes = await uni.login({ provider: 'weixin' })
      const res = await callCloud<UserProfile>('user-login', { code: loginRes.code })

      if (res.success && res.data) {
        profile.value = res.data
        isLoggedIn.value = true
        return true
      }

      // Alpha fallback: mock 数据
      const mockOpenid = 'mock_' + Date.now()
      profile.value = {
        _id: 'demo_' + Date.now(),
        openid: mockOpenid,
        faction: assignFaction(mockOpenid),
        lingshi: 3,
        xuanjing: 30,
        mines_planted: 0,
        mines_defused_win: 0,
        mines_defused_fail: 0,
        redeemed_today: 0,
        last_share_date: '',
        status: 'normal',
        items: [
          { id: 'tianyan', name: '天眼通', count: 0 },
          { id: 'jiagu', name: '加固符', count: 0 },
        ],
      }
      isLoggedIn.value = true
      return true
    } catch (err) {
      console.error('[UserStore] 登录失败', err)
      return false
    }
  }

  function updateLingshi(delta: number) {
    if (!profile.value) return
    profile.value.lingshi = Math.max(0, profile.value.lingshi + delta)
  }

  function updateXuanjing(delta: number) {
    if (!profile.value) return
    profile.value.xuanjing = Math.max(0, profile.value.xuanjing + delta)
    profile.value.status = profile.value.xuanjing < 5 ? 'dying' : 'normal'
  }

  function canPlant(): boolean {
    return !!profile.value && profile.value.lingshi >= 1
  }

  function canDefuse(): boolean {
    return !!profile.value && profile.value.xuanjing >= 2 && profile.value.status !== 'dying'
  }

  function canRedeem(): boolean {
    return !!profile.value && profile.value.xuanjing >= 100 && profile.value.redeemed_today < 2
  }

  return {
    profile,
    isLoggedIn,
    isDying,
    faction,
    wxLogin,
    updateLingshi,
    updateXuanjing,
    canPlant,
    canDefuse,
    canRedeem,
  }
})
