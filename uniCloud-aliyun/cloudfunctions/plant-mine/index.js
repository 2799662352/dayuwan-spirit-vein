'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { poiId, voicePath, faction } = event
  const userId = context.OPENID || event.userId

  if (!poiId || !faction) {
    return { success: false, error: '参数不完整' }
  }

  // 事务: 扣灵石 + 写 mine + 更新 POI
  const transaction = await db.startTransaction()

  try {
    // 检查用户灵石
    const userRes = await transaction.collection('users')
      .where({ openid: userId, lingshi: dbCmd.gte(1) })
      .update({ lingshi: dbCmd.inc(-1), mines_planted: dbCmd.inc(1), updated_at: Date.now() })

    if (userRes.updated === 0) {
      await transaction.rollback()
      return { success: false, error: '灵石不足' }
    }

    // 写入 mine
    await transaction.collection('mines').add({
      poi_id: poiId,
      user_id: userId,
      faction,
      voice_url: voicePath || '',
      alive: true,
      passive_yield_total: 0,
      planted_at: Date.now(),
    })

    // 更新 POI 计数
    const mineField = faction === 'blue' ? 'blue_mines' : 'red_mines'
    await transaction.collection('pois').doc(poiId).update({
      [mineField]: dbCmd.inc(1),
      updated_at: Date.now(),
    })

    // 重新计算归属
    const poiRes = await transaction.collection('pois').doc(poiId).get()
    const poi = poiRes.data[0]
    const total = (poi.blue_mines || 0) + (poi.red_mines || 0)
    let owner = 'contested'
    if (total > 0) {
      if ((poi.blue_mines || 0) / total >= 0.6) owner = 'blue'
      else if ((poi.red_mines || 0) / total >= 0.6) owner = 'red'
    }
    await transaction.collection('pois').doc(poiId).update({ owner })

    // 记录交易
    await transaction.collection('transactions').add({
      user_id: userId,
      type: 'plant',
      lingshi_delta: -1,
      xuanjing_delta: 0,
      poi_id: poiId,
      detail: '布阵',
      created_at: Date.now(),
    })

    await transaction.commit()
    return { success: true }
  } catch (err) {
    await transaction.rollback()
    return { success: false, error: err.message }
  }
}
