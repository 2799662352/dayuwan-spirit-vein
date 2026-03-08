'use strict'

const db = uniCloud.database()
const dbCmd = db.command

/**
 * 定时触发器: 每 10 分钟执行
 * 遍历所有存活 mine, 发放被动收益 (2 玄晶/次)
 */
exports.main = async (event, context) => {
  const minesCol = db.collection('mines')
  const poisCol = db.collection('pois')
  const usersCol = db.collection('users')
  const txCol = db.collection('transactions')

  const YIELD_PER_MINE = 2

  // 获取所有存活的 mine
  const minesRes = await minesCol.where({ alive: true }).get()
  const mines = minesRes.data

  // 获取所有 POI 的 owner
  const poisRes = await poisCol.get()
  const poiMap = new Map()
  poisRes.data.forEach(poi => poiMap.set(poi._id, poi.owner))

  let totalYielded = 0

  for (const mine of mines) {
    const poiOwner = poiMap.get(mine.poi_id)
    if (poiOwner !== mine.faction) continue

    // 发放收益
    await usersCol.where({ openid: mine.user_id }).update({
      xuanjing: dbCmd.inc(YIELD_PER_MINE),
      updated_at: Date.now(),
    })

    await minesCol.doc(mine._id).update({
      passive_yield_total: dbCmd.inc(YIELD_PER_MINE),
      last_yield_at: Date.now(),
    })

    await txCol.add({
      user_id: mine.user_id,
      type: 'passive',
      lingshi_delta: 0,
      xuanjing_delta: YIELD_PER_MINE,
      poi_id: mine.poi_id,
      detail: '被动收益',
      created_at: Date.now(),
    })

    totalYielded++
  }

  return { processed: mines.length, yielded: totalYielded }
}
