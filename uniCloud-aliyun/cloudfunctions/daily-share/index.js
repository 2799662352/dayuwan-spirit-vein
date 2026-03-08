'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const userId = context.OPENID || event.userId
  const today = new Date().toISOString().slice(0, 10)

  const userRes = await db.collection('users').where({ openid: userId }).get()
  if (userRes.data.length === 0) {
    return { success: false, error: '用户不存在' }
  }

  if (userRes.data[0].last_share_date === today) {
    return { success: false, error: '今日已领取' }
  }

  await db.collection('users').where({ openid: userId }).update({
    lingshi: dbCmd.inc(1),
    last_share_date: today,
    updated_at: Date.now(),
  })

  await db.collection('transactions').add({
    user_id: userId,
    type: 'share',
    lingshi_delta: 1,
    xuanjing_delta: 0,
    detail: '每日分享奖励',
    created_at: Date.now(),
  })

  return { success: true }
}
