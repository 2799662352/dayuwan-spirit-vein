'use strict'

const db = uniCloud.database()

exports.main = async (event, context) => {
  const poisCol = db.collection('pois')
  const result = await poisCol.get()
  const pois = result.data.map(poi => ({
    _id: poi._id,
    name: poi.name,
    lat: poi.location?.coordinates?.[1] ?? 0,
    lng: poi.location?.coordinates?.[0] ?? 0,
    fence_radius: poi.fence_radius || 50,
    blue_mines: poi.blue_mines || 0,
    red_mines: poi.red_mines || 0,
    owner: poi.owner || 'contested',
  }))

  const globalBlue = pois.filter(p => p.owner === 'blue').length
  const globalRed = pois.filter(p => p.owner === 'red').length

  return { pois, globalBlue, globalRed }
}
