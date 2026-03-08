/**
 * Haversine 距离计算 + 地理围栏判定
 */

const EARTH_RADIUS = 6371000

export function calcDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function isInFence(
  userLat: number, userLng: number,
  poiLat: number, poiLng: number,
  radius: number = 50,
): boolean {
  return calcDistance(userLat, userLng, poiLat, poiLng) <= radius
}

/**
 * 根据用户位置和 POI 位置计算相对方位角 (0-360)
 * 0 = 正北, 90 = 正东, 180 = 正南, 270 = 正西
 */
export function calcBearing(
  userLat: number, userLng: number,
  poiLat: number, poiLng: number,
): number {
  const dLng = toRad(poiLng - userLng)
  const lat1 = toRad(userLat)
  const lat2 = toRad(poiLat)
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}
