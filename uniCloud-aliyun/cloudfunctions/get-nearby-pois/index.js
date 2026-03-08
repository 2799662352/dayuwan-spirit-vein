'use strict'

const db = uniCloud.database()
const dbCmd = db.command

/**
 * 获取附近灵韵点 (POI) 云函数
 * 基于 GeoJSON 地理位置查询
 */
exports.main = async (event, context) => {
  const { latitude, longitude, radius = 500 } = event

  if (!latitude || !longitude) {
    return { code: -1, msg: '缺少位置参数' }
  }

  try {
    // 使用 MongoDB 地理位置查询
    const poiCollection = db.collection('pois')
    const res = await poiCollection
      .where({
        location: dbCmd.geoNear({
          geometry: new db.Geo.Point(longitude, latitude),
          maxDistance: radius,     // 最大距离(米)
          minDistance: 0,
        }),
        visible: true,
      })
      .limit(50)
      .get()

    // 计算每个 POI 的距离
    const pois = res.data.map(poi => {
      const dist = calcDistance(latitude, longitude, poi.location.coordinates[1], poi.location.coordinates[0])
      return { ...poi, distance: Math.round(dist) }
    })

    // 按距离排序
    pois.sort((a, b) => a.distance - b.distance)

    return { code: 0, msg: 'ok', data: pois }
  } catch (err) {
    return { code: -1, msg: '查询失败', err: err.message }
  }
}

/**
 * Haversine 距离计算
 */
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
