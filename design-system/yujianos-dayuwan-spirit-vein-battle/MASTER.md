# 与见 OS · 大余湾灵脉争夺战 — 设计系统 Master File

> **LOGIC:** 构建具体页面时，先查 `pages/[page-name].md`。
> 若存在，其规则 **覆盖** 本 Master 文件。否则严格遵循以下规则。

---

**项目:** YujianOS — 大余湾灵脉争夺战 MVP
**风格定位:** 赛博修真 = Cyberpunk UI + HUD/Sci-Fi FUI + OLED Dark Mode + 中华修真美学
**产品形态:** 微信小程序 / H5 (UniApp + Vue3)

---

## 一、色彩系统 (双阵营 + 中性)

### 中性色 (全局)

| 角色 | Hex | CSS 变量 | 用途 |
|------|-----|----------|------|
| 背景-纯黑 | `#000000` | `--bg-black` | AMOLED 底色 |
| 背景-深层 | `#0A0A0F` | `--bg-deep` | 卡片/面板底色 |
| 背景-叠层 | `#12121A` | `--bg-overlay` | 弹窗/遮罩层 |
| 文字-主要 | `#F0E6D6` | `--text-primary` | 正文 |
| 文字-次要 | `#A98C76` | `--text-secondary` | 辅助说明 |
| 文字-暗淡 | `#5A4A3A` | `--text-muted` | 禁用态 |
| 边框 | `#2A1A1A` | `--border` | 分割线 |
| 金色-强调 | `#FFD700` | `--gold` | 灵石/重要数值/高亮 |
| 金色-暗调 | `#8B7355` | `--gold-dim` | 装饰线条 |
| 青铜 | `#CD7F32` | `--bronze` | 进度条/金属质感 |

### 耕读盟 (蓝队)

| 角色 | Hex | CSS 变量 |
|------|-----|----------|
| 主色 | `#00A8FF` | `--faction-blue` |
| 辉光 | `#00D4FF` | `--faction-blue-glow` |
| 暗调 | `#003366` | `--faction-blue-dark` |
| 背景光晕 | `rgba(0, 168, 255, 0.08)` | `--faction-blue-aura` |

### 万金楼 (红队)

| 角色 | Hex | CSS 变量 |
|------|-----|----------|
| 主色 | `#FF3F3F` | `--faction-red` |
| 辉光 | `#FF6B6B` | `--faction-red-glow` |
| 暗调 | `#660000` | `--faction-red-dark` |
| 背景光晕 | `rgba(255, 63, 63, 0.08)` | `--faction-red-aura` |

### 交火区 (争夺中)

| 角色 | Hex | CSS 变量 |
|------|-----|----------|
| 紫灰闪烁 | `#8B5CF6` | `--contested` |
| 闪烁暗调 | `#4A3A6A` | `--contested-dark` |

### 功能色

| 角色 | Hex | CSS 变量 | 用途 |
|------|-----|----------|------|
| 成功 | `#22C55E` | `--success` | 布阵成功 |
| 警告 | `#F59E0B` | `--warning` | 灵石不足 |
| 危险 | `#EF4444` | `--danger` | 破阵失败/濒死态 |
| 玄晶色 | `#00FFFF` | `--xuanjing` | 玄晶货币显示 |

---

## 二、字体系统

### 小程序端 (不支持自定义字体加载)

```css
/* 标题 */
font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
font-weight: 700;
letter-spacing: 0.05em;

/* 正文 */
font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
font-weight: 400;

/* 数值/HUD */
font-family: "DIN Alternate", "Helvetica Neue", monospace;
font-variant-numeric: tabular-nums;
```

### H5 端 (可加载 Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');

/* 标题 - 战斗/HUD 感 */
font-family: "Chakra Petch", "Noto Sans SC", sans-serif;

/* 正文 - 中文可读性 */
font-family: "Noto Sans SC", "PingFang SC", sans-serif;
```

### 字号规范 (rpx)

| Token | 值 | 用途 |
|-------|-----|------|
| `--fs-hero` | `64rpx` | 主战场大数字 |
| `--fs-h1` | `44rpx` | 页面标题 |
| `--fs-h2` | `36rpx` | 区块标题 |
| `--fs-body` | `28rpx` | 正文 |
| `--fs-caption` | `24rpx` | 辅助文字 |
| `--fs-micro` | `20rpx` | 极小标注 |

---

## 三、间距系统 (rpx)

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | `8rpx` | 紧凑间距 |
| `--space-sm` | `16rpx` | 图标间距 |
| `--space-md` | `24rpx` | 标准内边距 |
| `--space-lg` | `32rpx` | 区块内边距 |
| `--space-xl` | `48rpx` | 大区块间距 |
| `--space-2xl` | `64rpx` | 段落间距 |

---

## 四、视觉效果

### 辉光 (Neon Glow)

```css
/* 蓝方辉光 */
.glow-blue {
  text-shadow: 0 0 10rpx rgba(0, 168, 255, 0.6),
               0 0 30rpx rgba(0, 168, 255, 0.3);
}

/* 红方辉光 */
.glow-red {
  text-shadow: 0 0 10rpx rgba(255, 63, 63, 0.6),
               0 0 30rpx rgba(255, 63, 63, 0.3);
}

/* 金色辉光 */
.glow-gold {
  text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.5),
               0 0 20rpx rgba(255, 215, 0, 0.2);
}
```

### 呼吸光晕 (阵营边缘提示)

```css
@keyframes faction-breathe {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
}

.faction-aura {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  animation: faction-breathe 3s ease-in-out infinite;
}

.faction-aura--blue {
  box-shadow: inset 0 0 80rpx rgba(0, 168, 255, 0.15);
}

.faction-aura--red {
  box-shadow: inset 0 0 80rpx rgba(255, 63, 63, 0.15);
}
```

### 扫描线 (Scanlines)

```css
.scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 255, 255, 0.015) 2px,
    rgba(255, 255, 255, 0.015) 4px
  );
  pointer-events: none;
  z-index: 2;
}
```

### 阵眼闪烁 (交火区)

```css
@keyframes contested-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.poi-contested {
  animation: contested-pulse 1.5s ease-in-out infinite;
  background: radial-gradient(circle, var(--contested) 0%, transparent 70%);
}
```

---

## 五、组件规范

### 按钮

```css
/* 布阵按钮 — 玉牌质感 */
.btn-plant {
  background: linear-gradient(135deg, #2D5A3D, #1A3A28);
  border: 1rpx solid rgba(0, 168, 255, 0.3);
  color: var(--text-primary);
  padding: 24rpx 40rpx;
  border-radius: 16rpx;
  font-weight: 700;
  font-size: var(--fs-body);
  transition: all 200ms ease-out;
  box-shadow: 0 4rpx 20rpx rgba(0, 168, 255, 0.15);
}

/* 破阵按钮 — 黑金虎符质感 */
.btn-defuse {
  background: linear-gradient(135deg, #2A1A0A, #1A0A00);
  border: 1rpx solid rgba(255, 215, 0, 0.3);
  color: var(--gold);
  padding: 24rpx 40rpx;
  border-radius: 16rpx;
  font-weight: 700;
  font-size: var(--fs-body);
  transition: all 200ms ease-out;
  box-shadow: 0 4rpx 20rpx rgba(255, 215, 0, 0.15);
}

/* 通用按钮 */
.btn-primary {
  background: linear-gradient(135deg, var(--gold), #FFA500);
  color: #0A0A0F;
  padding: 20rpx 32rpx;
  border-radius: 12rpx;
  font-weight: 700;
  transition: all 200ms ease-out;
}
```

### 阵眼 POI 节点

```css
.poi-node {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid;
  position: relative;
}

.poi-node--blue {
  border-color: var(--faction-blue);
  box-shadow: 0 0 20rpx rgba(0, 168, 255, 0.4);
  background: radial-gradient(circle, var(--faction-blue-dark) 30%, transparent 70%);
}

.poi-node--red {
  border-color: var(--faction-red);
  box-shadow: 0 0 20rpx rgba(255, 63, 63, 0.4);
  background: radial-gradient(circle, var(--faction-red-dark) 30%, transparent 70%);
}
```

### 进度条 (青铜质感)

```css
.progress-bar {
  height: 12rpx;
  background: var(--bg-overlay);
  border-radius: 6rpx;
  overflow: hidden;
  border: 1rpx solid rgba(205, 127, 50, 0.2);
}

.progress-fill--blue {
  height: 100%;
  background: linear-gradient(90deg, var(--faction-blue-dark), var(--faction-blue));
  border-radius: 6rpx;
  transition: width 500ms ease-out;
}

.progress-fill--red {
  height: 100%;
  background: linear-gradient(90deg, var(--faction-red-dark), var(--faction-red));
  border-radius: 6rpx;
  transition: width 500ms ease-out;
}
```

---

## 六、硬件 API 调用规范

### 震动

| 场景 | API | 参数 |
|------|-----|------|
| 靠近阵眼 | `uni.vibrateShort` | 每 2 秒一次，模拟心跳 |
| 布阵成功 | `uni.vibrateLong` | 1 次 |
| 破阵成功 | `uni.vibrateShort` | 连续 3 次 |
| 破阵失败 | `uni.vibrateLong` | 连续 2 次长震 |
| QTE 按中 | `uni.vibrateShort` | 每次按中 1 次 |

### 音效 (Web Audio API / InnerAudioContext)

| 场景 | 音效文件 | 说明 |
|------|----------|------|
| 环境音 | `ambient-loop.mp3` | 低频风声/电流声，无缝循环 |
| 按钮点击 | `click-metal.mp3` | 金石交鸣，<100ms |
| 布阵 | `plant-chime.mp3` | 法阵激活音 |
| 破阵开始 | `defuse-start.mp3` | 紧张鼓点 |
| QTE 按中 | `qte-hit.mp3` | 短促打击音 |
| 破阵成功 | `defuse-win.mp3` | 胜利号角 |
| 破阵失败 | `defuse-fail.mp3` | 低沉轰鸣 |
| 扫码成功 | `redeem-success.mp3` | 灵石清脆音 |

---

## 七、图标规范

- **禁止使用 emoji 作为 UI 图标**
- 使用 SVG 图标集：推荐 [Lucide Icons](https://lucide.dev/) 或 [@iconify-json/tabler](https://tabler.io/icons)（已安装）
- 图标尺寸：统一 `24x24` viewBox，使用 `w-5 h-5` (20rpx) 或 `w-6 h-6` (24rpx)
- 阵营图腾：自定义 SVG，蓝方书卷图腾 + 红方金元宝图腾

---

## 八、交互规范

| 规则 | 执行 | 禁止 |
|------|------|------|
| 过渡动画 | `transition: all 200ms ease-out` | 超过 500ms 或使用 linear |
| 点击反馈 | 颜色/透明度变化 + 短震动 | 缩放导致布局抖动 |
| 加载态 | 骨架屏或脉冲动画 | 空白无反馈 |
| 触控优先 | 所有主要交互用 `@tap` | 仅依赖 hover |
| 无障碍动效 | 尊重 `prefers-reduced-motion` | 忽略系统设置 |
| 全屏防误触 | 禁用下拉橡皮筋效果 | 允许浏览器默认行为 |

---

## 九、布局铁律

- **无底部 TabBar** — 单屏沉浸式
- **全屏黑色底** — `#000000` AMOLED 纯黑
- **顶部固定** — 青铜色红蓝对抗进度条
- **中部 60%** — 全息太极罗盘 + POI 节点
- **底部固定** — 左玉牌（布阵）右虎符（破阵）
- **安全区域** — `env(safe-area-inset-*)` 全部适配
- **禁止横滚** — `overflow-x: hidden` 全局生效

---

## 十、Anti-Patterns 禁止清单

- ❌ 使用 emoji 作为图标
- ❌ 使用浅色/白色背景
- ❌ 缺少 `cursor-pointer`
- ❌ hover 缩放导致布局偏移
- ❌ 低对比度文字 (<4.5:1)
- ❌ 无过渡的状态切换
- ❌ 不可见的焦点状态
- ❌ 忽略 safe-area-inset
- ❌ 使用沉重的地图 SDK
- ❌ 使用 WebGL/3D 引擎（用 CSS3 transform 替代）
