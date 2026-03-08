/**
 * 阵营分配算法
 * 根据 OpenID 的 hash 值永久分配到蓝方或红方
 */

export type Faction = 'blue' | 'red'

export function assignFaction(openid: string): Faction {
  let hash = 0
  for (let i = 0; i < openid.length; i++) {
    hash = ((hash << 5) - hash) + openid.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2 === 0 ? 'blue' : 'red'
}

export function getFactionName(faction: Faction): string {
  return faction === 'blue' ? '耕读盟' : '万金楼'
}

export function getFactionColor(faction: Faction): string {
  return faction === 'blue' ? '#00A8FF' : '#FF3F3F'
}

export function getFactionGlowColor(faction: Faction): string {
  return faction === 'blue' ? '#00D4FF' : '#FF6B6B'
}

export function getEnemyFaction(faction: Faction): Faction {
  return faction === 'blue' ? 'red' : 'blue'
}
