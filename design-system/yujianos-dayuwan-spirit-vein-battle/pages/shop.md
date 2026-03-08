# 法器商城页 (Shop) — 页面级设计覆盖

> **PROJECT:** 与见 OS · 大余湾灵脉争夺战
> **Page:** pages/shop/index.vue

> Rules here **override** `MASTER.md`. Unlisted rules follow Master.

---

## 布局

- 自定义导航: "法器商城" + 返回按钮
- 背景: `#000000`

## 商品网格

- 2 列网格, `gap: 20rpx`, `padding: 28rpx`
- 每个商品卡:
  - 背景: `var(--bg-deep)` + `border: 1rpx solid var(--border)`
  - 顶部: 道具图标 (SVG, 64rpx)
  - 名称: 金色, `--fs-body`
  - 描述: 次要色, `--fs-caption`
  - 价格: 青色 (玄晶色), 带图标
  - 购买按钮: 金色, 圆角

## 商品列表

| ID | 名称 | 图标 | 价格 | 效果 | 持续 |
|----|------|------|------|------|------|
| `tianyan` | 天眼通 | 眼睛 SVG | 50 玄晶 | 地图显示全部阵眼详情 | 30 秒 |
| `jiagu` | 加固符 | 盾牌 SVG | 30 玄晶 | 指定 mine 被破阵难度 +50% | 永久 |

## 余额栏 (底部固定)

- 背景: 半透明黑
- 玄晶余额: 大字青色
- 安全区适配

## 购买流程

1. 点击购买 → 确认弹窗 (YjModal)
2. 确认 → 调用 `shop-buy` 云函数
3. 成功: 道具入背包 + 成功音效 + Toast
4. 失败: 余额不足提示
