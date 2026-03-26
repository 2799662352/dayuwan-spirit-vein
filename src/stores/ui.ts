import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // State
  const hackVisible = ref(false)
  const rewardVisible = ref(false)
  const alertVisible = ref(false)
  const rewardAmount = ref(200)
  const alertTitle = ref('资源告警')
  const alertDesc = ref('当前玄晶余额不足以执行此操作')

  // Actions
  function openHack() {
    hackVisible.value = true
  }

  function openReward(amount: number) {
    rewardAmount.value = amount
    rewardVisible.value = true
  }

  function openAlert(title: string, desc: string) {
    alertTitle.value = title
    alertDesc.value = desc
    alertVisible.value = true
  }

  function closeAll() {
    hackVisible.value = false
    rewardVisible.value = false
    alertVisible.value = false
  }

  function closeHack() { hackVisible.value = false }
  function closeReward() { rewardVisible.value = false }
  function closeAlert() { alertVisible.value = false }

  return {
    hackVisible, rewardVisible, alertVisible,
    rewardAmount, alertTitle, alertDesc,
    openHack, openReward, openAlert,
    closeAll, closeHack, closeReward, closeAlert,
  }
})
