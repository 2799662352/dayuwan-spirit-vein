'use strict'

const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { qrData } = event
  const userId = context.OPENID || event.userId

  if (!qrData) {
    return { success: false, error: '二维码数据为空' }
  }

  // 解析二维码 (格式: yujian_redeem_{merchantId}_{token})
  const parts = qrData.split('_')
  if (parts.length < 4 || parts[0] !== 'yujian' || parts[1] !== 'redeem') {
    return { success: false, error: '无效的二维码' }
  }

  const merchantId = parts[2]

  // 校验用户
  const userRes = await db.collection('users').where({ openid: userId }).get()
  if (userRes.data.length === 0) {
    return { success: false, error: '用户不存在' }
  }

  const user = userRes.data[0]

  if (user.xuanjing < 100) {
    return { success: false, error: '玄晶不足 (需 100)' }
  }

  if (user.redeemed_today >= 2) {
    return { success: false, error: '今日核销次数已用完 (2/2)' }
  }

  // 校验商户
  const merchantRes = await db.collection('merchants').doc(merchantId).get()
  if (merchantRes.data.length === 0) {
    return { success: false, error: '商户不存在' }
  }

  const merchant = merchantRes.data[0]
  if (!merchant.active) {
    return { success: false, error: '商户已暂停' }
  }

  if (merchant.redeemed_today >= merchant.daily_quota) {
    return { success: false, error: '全服今日额度已满' }
  }

  // 执行核销
  const transaction = await db.startTransaction()
  try {
    await transaction.collection('users').where({ openid: userId }).update({
      xuanjing: dbCmd.inc(-100),
      redeemed_today: dbCmd.inc(1),
      updated_at: Date.now(),
    })

    await transaction.collection('merchants').doc(merchantId).update({
      redeemed_today: dbCmd.inc(1),
    })

    await transaction.collection('transactions').add({
      user_id: userId,
      type: 'redeem',
      lingshi_delta: 0,
      xuanjing_delta: -100,
      merchant_id: merchantId,
      detail: `核销: ${merchant.item_name} (${merchant.name})`,
      created_at: Date.now(),
    })

    await transaction.commit()
    return { success: true, item: merchant.item_name, merchant: merchant.name }
  } catch (err) {
    await transaction.rollback()
    return { success: false, error: err.message }
  }
}
