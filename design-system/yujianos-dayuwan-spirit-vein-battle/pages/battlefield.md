# 主战场页 (Battlefield) — 页面级设计覆盖

> **PROJECT:** 与见 OS · 大余湾灵脉争夺战
> **Page:** pages/battlefield/index.vue

> Rules here **override** `MASTER.md`. Unlisted rules follow Master.

---

## 布局

- **全屏沉浸式**, 无 TabBar, 无系统导航栏 (`navigationStyle: custom`)
- **背景**: `#000000` 纯黑 + 5% 透明度大余湾古建暗纹
- **层级 (z-index)**:
  - z-0: 背景暗纹
  - z-1: 扫描线叠层
  - z-5: 全息罗盘 + POI 节点
  - z-10: 货币栏
  - z-20: 顶部进度条
  - z-30: 底部按钮
  - z-40: 阵营呼吸光晕
  - z-50: 弹窗/Toast

## 顶部栏 (Fixed)

- 高度: `88rpx` + `env(safe-area-inset-top)`
- 左侧: 阵营图腾 SVG (蓝书卷 / 红元宝), 32x32rpx
- 中部: 3D 青铜质感红蓝进度条
  - 背景: `linear-gradient(90deg, var(--bronze), #8B6914)`
  - 蓝方从左填充, 红方从右填充
  - 中间分界线发光
- 右侧: 天机眼图标 (扫码入口)

## 全息罗盘 (中部 60%)

- 以用户当前位置为圆心
- 10 个 POI 按相对方位投射为极坐标点
- 罗盘底图: 极简路网线条 (1px, `rgba(255,215,0,0.05)`)
- 中心: 三角标指示器, 随 `DeviceOrientationEvent.alpha` 旋转
- POI 节点: 圆形, 颜色由 owner 决定 (红/蓝/紫灰闪烁)
- 节点大小: 距离越近越大 (48rpx ~ 24rpx)
- 进入围栏的节点: 脉冲放大动画 + 外圈虚线

## 底部按钮 (Fixed)

- 底部安全距离: `env(safe-area-inset-bottom) + 32rpx`
- 左侧: 玉牌布阵按钮 (深绿渐变 + 蓝色边框光)
- 右侧: 黑金虎符破阵按钮 (深棕渐变 + 金色边框光)
- 未进入围栏时: `opacity: 0.3`, 不可点击
- 进入围栏时: `opacity: 1`, 按钮辉光动画

## 货币栏 (底部按钮上方)

- 灵石: 金色数字 + 灵石 SVG 图标
- 玄晶: 青色数字 + 玄晶 SVG 图标
- 背景: `rgba(0,0,0,0.6)` 半透明条

## 交互特效

- 进入围栏: 手机心跳震动 (2s 间隔)
- POI 节点点击: 显示详情气泡 (阵眼名 + 红蓝比 + 距离)
- 战场数据 5s 轮询刷新

## 音效

- 持续: 低频环境音循环
- 进入围栏: 灵脉共鸣音
- 按钮点击: 金石交鸣
