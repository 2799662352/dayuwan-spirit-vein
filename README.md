# 与见 OS — 大余湾灵脉争夺战

> 基于 LBS + 轻量 AR 的实景空间控制权争夺系统

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | UniApp + Vue3 + Vite | 最新 |
| 语言 | TypeScript | 5.7+ |
| CSS | UnoCSS + preset-weapp | 66+ |
| 状态管理 | Pinia | 2.3+ |
| 后端 | UniCloud → 腾讯云 CloudBase | Serverless |
| 数据库 | MongoDB (JSON Document DB) | - |

## 项目结构

```
yujian/
├── src/
│   ├── pages/
│   │   ├── battlefield/    # 主战场 (全息罗盘 + 布阵/破阵)
│   │   ├── defuse/         # QTE 破阵挑战
│   │   ├── voice-record/   # 语音"神念"录制
│   │   ├── redeem/         # 天机眼扫码核销
│   │   ├── shop/           # 法器商城
│   │   └── profile/        # 修行者简报
│   ├── components/         # 自研组件
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   └── static/             # 静态资源
├── uniCloud-aliyun/
│   ├── cloudfunctions/     # 10 个云函数
│   └── database/           # 5 个 Schema
├── design-system/          # 设计系统文档
└── docs/agent_plans/       # 计划文档
```

## 快速开始

```bash
npm install
npm run dev:h5          # H5 开发模式
npm run dev:mp-weixin   # 微信小程序开发模式
```

## 里程碑

- 3/15: Alpha — 核心闭环
- 3/20: Beta — 实地测试
- 4/28: RC — 封版
- 5/01: Release — 正式上线
