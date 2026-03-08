'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { poiId, success: qteSuccess } = event
  const userId = context.OPENID || event.userId

  if (!poiId) {
    return { success: false, error: '参数不完整' }
  }

  const transaction = await db.startTransaction()

  try {
    if (qteSuccess) {
      // 成功: +15 玄晶, 敌方阵法 -1
      await transaction.collection('users')
        .where({ openid: userId })
        .update({
          xuanjing: dbCmd.inc(15),
          mines_defused_win: dbCmd.inc(1),
          updated_at: Date.now(),
        })

      // 查询 POI 确定敌方
      const poiRes = await transaction.collection('pois').doc(poiId).get()
      const poi = poiRes.data[0]

      // 查询用户阵营
      const userRes = await transaction.collection('users').where({ openid: userId }).get()
      const userFaction = userRes.data[0]?.faction

      const enemyField = userFaction === 'blue' ? 'red_mines' : 'blue_mines'
      const currentEnemyMines = poi[enemyField] || 0

      if (currentEnemyMines > 0) {
        await transaction.collection('pois').doc(poiId).update({
          [enemyField]: dbCmd.inc(-1),
          updated_at: Date.now(),
        })

        // 标记一颗敌方 mine 为 dead
        const enemyFaction = userFaction === 'blue' ? 'red' : 'blue'
        const mineRes = await transaction.collection('mines')
          .where({ poi_id: poiId, faction: enemyFaction, alive: true })
          .limit(1)
          .get()

        if (mineRes.data.length > 0) {
          await transaction.collection('mines').doc(mineRes.data[0]._id).update({ alive: false })
        }
      }

      // 重新计算归属
      const updatedPoi = await transaction.collection('pois').doc(poiId).get()
      const p = updatedPoi.data[0]
      const total = (p.blue_mines || 0) + (p.red_mines || 0)
      let owner = 'contested'
      if (total > 0) {
        if ((p.blue_mines || 0) / total >= 0.6) owner = 'blue'
        else if ((p.red_mines || 0) / total >= 0.6) owner = 'red'
      }
      await transaction.collection('pois').doc(poiId).update({ owner })

      await transaction.collection('transactions').add({
        user_id: userId,
        type: 'defuse_win',
        lingshi_delta: 0,
        xuanjing_delta: 15,
        poi_id: poiId,
        detail: '破阵成功',
        created_at: Date.now(),
      })
    } else {
      // 失败: -5 玄晶
      await transaction.collection('users')
        .where({ openid: userId })
        .update({
          xuanjing: dbCmd.inc(-5),
          mines_defused_fail: dbCmd.inc(1),
          updated_at: Date.now(),
        })

      await transaction.collection('transactions').add({
        user_id: userId,
        type: 'defuse_fail',
        lingshi_delta: 0,
        xuanjing_delta: -5,
        poi_id: poiId,
        detail: '破阵失败',
        created_at: Date.now(),
      })
    }

    // 更新濒死状态
    const finalUser = await transaction.collection('users').where({ openid: userId }).get()
    if (finalUser.data.length > 0) {
      const status = finalUser.data[0].xuanjing < 5 ? 'dying' : 'normal'
      await transaction.collection('users').where({ openid: userId }).update({ status })
    }

    await transaction.commit()
    return { success: true }
  } catch (err) {
    await transaction.rollback()
    return { success: false, error: err.message }
  }
}
