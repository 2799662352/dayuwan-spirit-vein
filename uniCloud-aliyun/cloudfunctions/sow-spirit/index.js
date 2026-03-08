'use strict'

const db = uniCloud.database()
const dbCmd = db.command

/**
 * 种福缘（埋藏灵石）云函数
 * P2P 资源流转核心逻辑
 */
exports.main = async (event, context) => {
  const { userId, latitude, longitude, amount, password = '', message = '' } = event

  // 参数校验
  if (!userId || !latitude || !longitude || !amount) {
    return { code: -1, msg: '参数不完整' }
  }
  if (amount < 1 || amount > 999) {
    return { code: -1, msg: '灵石数量超出范围' }
  }

  const transaction = await db.startTransaction()

  try {
    // 1. 检查用户余额
    const userDoc = await transaction.collection('users').doc(userId).get()
    if (userDoc.data.length === 0) {
      await transaction.rollback()
      return { code: -1, msg: '用户不存在' }
    }

    const user = userDoc.data[0]
    if (user.balance < amount) {
      await transaction.rollback()
      return { code: -1, msg: '灵石不足' }
    }

    // 2. 扣除用户灵石
    await transaction.collection('users').doc(userId).update({
      balance: dbCmd.inc(-amount),
      'stats.spiritSown': dbCmd.inc(1),
      updateTime: Date.now(),
    })

    // 3. 创建 POI
    const poiData = {
      name: '灵石福袋',
      type: 'red_packet',
      location: new db.Geo.Point(longitude, latitude),
      icon: '/static/markers/red-packet.png',
      payload: {
        reward: amount,
        password: password,
        message: message,
      },
      creator: userId,
      visible: true,
      reaped: false,
      createTime: Date.now(),
    }
    const poiRes = await transaction.collection('pois').add(poiData)

    // 4. 记录交易日志
    await transaction.collection('interaction_logs').add({
      userId: userId,
      targetId: poiRes.id,
      action: 'sow',
      amount: -amount,
      detail: `种下 ${amount} 灵石福缘`,
      timestamp: Date.now(),
    })

    await transaction.commit()
    return { code: 0, msg: '福缘已种下', data: { poiId: poiRes.id } }
  } catch (err) {
    await transaction.rollback()
    return { code: -1, msg: '操作失败', err: err.message }
  }
}
