'use strict'

const db = uniCloud.database()
const dbCmd = db.command

const SHOP_ITEMS = {
  tianyan: { name: '天眼通', price: 50 },
  jiagu: { name: '加固符', price: 30 },
}

exports.main = async (event, context) => {
  const { itemId } = event
  const userId = context.OPENID || event.userId

  const shopItem = SHOP_ITEMS[itemId]
  if (!shopItem) {
    return { success: false, error: '无效道具' }
  }

  const transaction = await db.startTransaction()

  try {
    const userRes = await transaction.collection('users')
      .where({ openid: userId, xuanjing: dbCmd.gte(shopItem.price) })
      .update({
        xuanjing: dbCmd.inc(-shopItem.price),
        updated_at: Date.now(),
      })

    if (userRes.updated === 0) {
      await transaction.rollback()
      return { success: false, error: '玄晶不足' }
    }

    // 更新道具数量
    const user = await transaction.collection('users').where({ openid: userId }).get()
    const items = user.data[0]?.items || []
    const idx = items.findIndex(i => i.id === itemId)

    if (idx >= 0) {
      items[idx].count += 1
    } else {
      items.push({ id: itemId, name: shopItem.name, count: 1 })
    }

    await transaction.collection('users').where({ openid: userId }).update({ items })

    await transaction.collection('transactions').add({
      user_id: userId,
      type: 'shop_buy',
      lingshi_delta: 0,
      xuanjing_delta: -shopItem.price,
      detail: `购买: ${shopItem.name}`,
      created_at: Date.now(),
    })

    await transaction.commit()
    return { success: true }
  } catch (err) {
    await transaction.rollback()
    return { success: false, error: err.message }
  }
}
