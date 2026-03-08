'use strict'

const db = uniCloud.database()
const dbCmd = db.command

/**
 * 采福缘（领取灵石）云函数
 */
exports.main = async (event, context) => {
  const { userId, poiId, password = '' } = event

  if (!userId || !poiId) {
    return { code: -1, msg: '参数不完整' }
  }

  const transaction = await db.startTransaction()

  try {
    // 1. 获取 POI
    const poiDoc = await transaction.collection('pois').doc(poiId).get()
    if (poiDoc.data.length === 0) {
      await transaction.rollback()
      return { code: -1, msg: '福缘不存在' }
    }

    const poi = poiDoc.data[0]

    // 检查是否已被领取
    if (poi.reaped) {
      await transaction.rollback()
      return { code: -1, msg: '此福缘已被他人采集' }
    }

    // 不能领取自己种的
    if (poi.creator === userId) {
      await transaction.rollback()
      return { code: -1, msg: '不可采集自己种下的福缘' }
    }

    // 检查口令
    if (poi.payload.password && poi.payload.password !== password) {
      await transaction.rollback()
      return { code: -1, msg: '口令错误' }
    }

    const reward = poi.payload.reward || 0

    // 2. 标记 POI 为已领取
    await transaction.collection('pois').doc(poiId).update({
      reaped: true,
      reapedBy: userId,
      reapedTime: Date.now(),
      visible: false,
    })

    // 3. 增加领取者灵石
    await transaction.collection('users').doc(userId).update({
      balance: dbCmd.inc(reward),
      'stats.spiritReaped': dbCmd.inc(1),
      updateTime: Date.now(),
    })

    // 4. 记录交易日志
    await transaction.collection('interaction_logs').add({
      userId: userId,
      targetId: poiId,
      action: 'reap',
      amount: reward,
      detail: `采集 ${reward} 灵石福缘`,
      timestamp: Date.now(),
    })

    await transaction.commit()
    return { code: 0, msg: `获得 ${reward} 灵石！`, data: { reward } }
  } catch (err) {
    await transaction.rollback()
    return { code: -1, msg: '操作失败', err: err.message }
  }
}
