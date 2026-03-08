'use strict'

const db = uniCloud.database()

exports.main = async (event, context) => {
  const { code } = event

  // 获取 openid
  // TODO: 正式环境从微信接口换取
  const openid = context.OPENID || ('mock_' + Date.now())

  const usersCol = db.collection('users')
  const existing = await usersCol.where({ openid }).get()

  if (existing.data.length > 0) {
    return existing.data[0]
  }

  // 阵营分配
  let hash = 0
  for (let i = 0; i < openid.length; i++) {
    hash = ((hash << 5) - hash) + openid.charCodeAt(i)
    hash |= 0
  }
  const faction = Math.abs(hash) % 2 === 0 ? 'blue' : 'red'

  const newUser = {
    openid,
    faction,
    lingshi: 3,
    xuanjing: 30,
    mines_planted: 0,
    mines_defused_win: 0,
    mines_defused_fail: 0,
    redeemed_today: 0,
    last_share_date: '',
    status: 'normal',
    items: [
      { id: 'tianyan', name: '天眼通', count: 0 },
      { id: 'jiagu', name: '加固符', count: 0 },
    ],
    created_at: Date.now(),
    updated_at: Date.now(),
  }

  const res = await usersCol.add(newUser)
  newUser._id = res.id

  // 记录新手交易
  await db.collection('transactions').add({
    user_id: res.id,
    type: 'newbie',
    lingshi_delta: 3,
    xuanjing_delta: 30,
    detail: '新手礼包',
    created_at: Date.now(),
  })

  return newUser
}
