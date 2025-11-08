# 鸿蒙激励计划小助手

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-green.svg)
![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

一个专为华为鸿蒙激励计划开发者打造的数据统计与可视化 Chrome 浏览器插件

[功能特点](#功能特点) • [安装方法](#安装方法) • [使用说明](#使用说明) • [项目结构](#项目结构) • [技术实现](#技术实现)

[![Chrome Web Store](https://img.shields.io/badge/Chrome-安装插件-brightgreen?style=for-the-badge&logo=google-chrome)](https://chromewebstore.google.com/detail/dpakdoaefaobpjcldcjbdohgkgojknki)

</div>

---

## 🎉 最新更新 (v2.0.0)

- ✨ **新增日活数据统计** - 显示昨日新增、首月、次月、第三月日活数据
- ✨ **新增趋势图表** - 点击应用展开查看日活数据可视化图表
- ✨ **新增鸿蒙功德木鱼** - 趣味互动功能，点击木鱼积累功德

---

## ✨ 功能特点

### 📊 核心功能

- **智能数据捕获** - 自动拦截并解析华为开发者平台的 API 请求
- **实时数据统计** - 动态计算应用总数、激励金额、达标情况等关键指标
- **可视化展示** - 美观的侧边栏界面，清晰展示所有统计数据
- **分类统计** - 自动区分应用和游戏类型，分别统计
- **阶段追踪** - 追踪应用在各个激励阶段的分布情况
- **日活数据统计** - 展示应用的昨日新增、首月、次月、第三月日活数据
- **趋势图表** - 可视化显示应用日活数据走势图，支持展开查看详情
- **海报生成** - 一键生成精美的数据统计海报，支持下载分享
- **🪷 鸿蒙功德木鱼** - 趣味互动，点击敲木鱼积累功德

### 🎨 界面特性

- ✅ 现代化的渐变色设计
- ✅ 固定在页面右侧，不影响正常浏览
- ✅ 可收起/展开，灵活控制显示
- ✅ 响应式布局，适配不同屏幕
- ✅ 清晰的数据可视化卡片
- ✅ 支持暗色主题适配

### 📈 统计指标

- **应用总数** - 显示应用和游戏的总数量
- **预估激励** - 根据应用/游戏数量预估总激励（应用¥10,000，游戏¥2,000）
- **已获激励** - 实际已达标的激励金额总和
- **平均激励** - 单个应用的平均激励金额
- **达标情况** - 基础激励、一阶段、二阶段的达标数量和比例
- **阶段分布** - 各阶段应用数量的可视化展示
- **日活数据** - 昨日新增日活、首月(1-30天)、次月(31-60天)、第三月(61-90天)日活统计
- **趋势可视化** - 点击应用卡片展开，查看日活数据趋势图表

---

## 📦 安装方法

### 方式一：Chrome 网上应用店安装（推荐）

1. **访问插件页面**
   - 点击这里 👉 [Chrome Web Store 安装](https://chromewebstore.google.com/detail/dpakdoaefaobpjcldcjbdohgkgojknki)

2. **安装插件**
   - 点击"添加至 Chrome"按钮
   - 在弹出的确认对话框中点击"添加扩展程序"
   - 等待安装完成

3. **开始使用**
   - 访问华为鸿蒙激励计划数据查询页面即可自动使用

### 方式二：开发者模式安装（开发测试）

1. **下载项目代码**
   ```bash
   git clone https://github.com/zwpro/harmonyos-incentive.git
   cd harmonyos-incentive
   ```

2. **打开 Chrome 扩展管理页面**
   - 在地址栏输入：`chrome://extensions/`
   - 或点击菜单 → 更多工具 → 扩展程序

3. **启用开发者模式**
   - 打开页面右上角的"开发者模式"开关

4. **加载插件**
   - 点击"加载已解压的扩展程序"
   - 选择项目所在的文件夹
   - 确认加载成功

---

## 🚀 使用说明

### 基本使用

1. **访问目标页面**
   - 打开 <a href="https://developer.huawei.com/consumer/cn/activity/harmonyos-incentive/data-query" target="_blank">华为鸿蒙激励计划数据查询页面</a>

2. **等待数据加载**
   - 插件会自动在页面右侧显示侧边栏
   - 等待页面数据加载完成（或切换分页、刷新页面）

3. **查看统计数据**
   - 侧边栏自动展示所有应用的统计信息
   - 包括总数、激励金额、达标情况等

### 高级功能

#### 📱 生成统计海报

1. 点击侧边栏中的"生成海报"按钮
2. 等待海报生成（基于 html2canvas 技术）
3. 在弹窗中预览海报效果
4. 点击"下载海报"保存到本地，或直接关闭

#### 🔍 应用详情查看

- 每个应用卡片显示：应用名称、包名、类型、当前阶段、各阶段激励金额
- 支持按阶段筛选和查看
- 清晰的达标状态标识
- **日活数据展示**：显示昨日新增、首月、次月、第三月日活数据
- **趋势图表**：点击应用卡片展开，查看日活数据的可视化趋势图

#### 🪷 鸿蒙功德木鱼

趣味互动功能，为开发之旅增添乐趣：

- 点击木鱼图标积累功德，配合敲击动画和音效
- 统计今日和总计敲击次数，数据本地保存

#### 🎛️ 侧边栏控制

- **收起侧边栏**：点击右上角的 × 按钮
- **展开侧边栏**：点击页面右侧的悬浮按钮
- **社群交流**：点击"进群"按钮查看二维码

---

## 📁 项目结构

```
dataquery/
├── app.js                    # 主应用入口
├── content.js                # 内容脚本（如存在）
├── inject.js                 # API 拦截注入脚本
├── manifest.json             # 插件配置文件
├── icons.js                  # SVG 图标定义
│
├── core/                     # 核心业务逻辑
│   ├── config.js            # 全局配置（版本、GitHub、社群等）
│   ├── state.js             # 状态管理（应用数据存储）
│   ├── dataProcessor.js     # 数据处理（解析 API 响应）
│   └── statistics.js        # 统计计算（各项指标计算）
│
├── events/                   # 事件处理
│   └── handlers.js          # 各类事件绑定和处理
│
├── features/                 # 功能模块
│   └── poster.js            # 海报生成功能
│
├── ui/                       # 界面渲染
│   ├── renderer.js          # UI 渲染逻辑
│   ├── appRow.js            # 应用卡片组件
│   └── styles.css           # 样式文件
│
├── utils/                    # 工具函数
│   └── mask.js              # 遮罩层工具
│
├── libs/                     # 第三方库
│   ├── html2canvas.min.js   # 截图库
│   └── chart.min.js         # 图表库（Chart.js）
│
└── images/                   # 图片资源
    ├── logo.png             # Logo 图标
    ├── muyu.png             # 木鱼图片
    ├── bangzi.png           # 木鱼棒子图片
    └── README.md            # 图片说明
```

---

## 🔧 技术实现

### 核心技术栈

- **Chrome Extension Manifest V3** - 最新的扩展清单版本
- **原生 JavaScript (ES6+)** - 无框架依赖，轻量高效
- **CSS3** - 现代化样式，渐变、动画、响应式
- **html2canvas** - 将 DOM 转换为 Canvas 图片
- **Chart.js** - 数据可视化图表库
- **LocalStorage** - 本地数据持久化存储

### 关键技术点

#### 1. API 拦截技术

通过注入脚本拦截 `XMLHttpRequest` 和 `fetch` 请求：

```javascript
// inject.js 核心逻辑
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args).then(response => {
    // 拦截并解析响应数据
    return response;
  });
};
```

#### 2. 模块化架构

采用模块化设计，职责清晰：
- **core/** - 核心业务逻辑和状态管理
- **ui/** - 界面渲染和组件
- **events/** - 事件处理
- **features/** - 独立功能模块

#### 3. 状态管理

使用 `Map` 数据结构管理应用列表，高效去重和查询：

```javascript
// core/state.js
const AppState = {
  appsMap: new Map(), // 应用数据存储
  apiRequests: [],    // API 请求记录
  cutOffTime: null    // 截止时间
};
```

#### 4. 数据统计算法

实时计算多维度统计指标：
- 总激励 = Σ(各应用激励)
- 预估激励 = 应用数 × 10000 + 游戏数 × 2000
- 达标率 = 达标数量 / 总数量 × 100%

---

## 🎨 自定义配置

### 修改版本信息

编辑 `core/config.js`：

```javascript
const AppConfig = {
  version: 'v1.0.0',
  appName: '鸿蒙激励计划小助手',
  githubUrl: 'https://github.com/zwpro/harmonyos-incentive',
  community: {
    qrCodeUrl: 'https://your-qrcode-url.png'
  }
};
```

### 修改样式

编辑 `ui/styles.css`，可自定义：
- 侧边栏宽度、颜色
- 卡片样式
- 按钮效果
- 动画过渡

### 修改统计规则

编辑 `core/statistics.js`，调整统计计算逻辑。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- 遵循现有的代码风格
- 添加必要的注释
- 测试新功能是否正常工作
- 更新相关文档

---

## 📝 更新日志

### v2.0.0 (2024-11-08)

- ✨ **新增日活数据统计** - 显示昨日新增、首月、次月、第三月日活数据
- ✨ **新增趋势图表** - 点击应用展开查看日活数据可视化图表
- ✨ **新增鸿蒙功德木鱼** - 趣味互动功能，点击木鱼积累功德
- 🎨 优化表格展示，增加日活数据列
- 🎨 木鱼敲击动画、音效和特效
- 💾 功德数据本地持久化存储
- 📊 集成 Chart.js 图表库

### v1.0.0 (2024-11-02)

- 🎉 首次发布
- ✨ 支持自动数据捕获和统计
- ✨ 实现侧边栏可视化展示
- ✨ 支持海报生成和下载
- ✨ 完整的应用和游戏分类统计
- ✨ 多维度数据指标展示

---

## ❓ 常见问题

### Q: 为什么看不到数据？

A: 请确保：
1. 已正确安装插件并刷新页面
2. 访问的是正确的华为开发者平台页面
3. 页面数据已加载完成（可尝试切换分页）

### Q: 海报生成失败怎么办？

A: 可能原因：
1. html2canvas 库未正确加载 - 尝试重新加载插件
2. 浏览器兼容性问题 - 建议使用最新版 Chrome

### Q: 如何更新插件？

A: 
- **从 Chrome 网上应用店安装的用户**：插件会自动更新，无需手动操作
- **开发者模式安装的用户**：
  1. 拉取最新代码：`git pull`
  2. 在扩展管理页面点击刷新图标

---

## 📄 许可证

本项目基于 <a href="LICENSE" target="_blank">MIT License</a> 开源。

---

## 🔗 相关链接

- **Chrome 网上应用店**：<a href="https://chromewebstore.google.com/detail/dpakdoaefaobpjcldcjbdohgkgojknki" target="_blank">安装插件</a>
- **GitHub 仓库**：<a href="https://github.com/zwpro/harmonyos-incentive" target="_blank">https://github.com/zwpro/harmonyos-incentive</a>
- **华为鸿蒙激励计划**：<a href="https://developer.huawei.com/consumer/cn/activity/harmonyos-incentive" target="_blank">官方页面</a>
- **问题反馈**：<a href="https://github.com/zwpro/harmonyos-incentive/issues" target="_blank">提交 Issue</a>

---

## 💬 交流与支持

如果这个插件对您有帮助，欢迎：

- ⭐ Star 本项目
- 🐛 提交 Bug 报告
- 💡 提出新功能建议
- 📢 分享给其他开发者

---

<div align="center">

**Made with ❤️ for HarmonyOS Developers**

</div>
