# Rainroom 雨水花园植物选配工具

本目录提供实施计划。实施时以项目的英文浅色 `DESIGN.md` 为依据，沿用绿色色板、米色背景、Georgia／Arial／Consolas 和有授权记录的蓝旗鸢尾 SVG。用 [EcoSync](../ecosync-stitch/ACCEPTANCE.md) 对照交互与离线验收，用 [Clay Archive](../clay-archive/ACCEPTANCE.md) 对照多设备交付。

Mobile 使用 390 × 844，Desktop 使用 1280 × 800。两端共用英文内容、样例数据和组件，分别设置布局和画板。

## 页面与状态

| Frame ID | 页面 | 组件与状态 |
| --- | --- | --- |
| `guide` | 植物图鉴 | 响应式导航、搜索框、复选筛选、多选标签、排序和植物卡片。无结果时显示重置筛选入口，重置后还原初始列表。 |
| `iris` | 植物详情 | 面包屑、图片和图注、规格列表、标签页、折叠面板、加入清单和成功提示。成功后提供查看清单入口。 |
| `planting-list` | 种植清单 | 桌面表格、手机卡片、数量输入、删除确认弹窗和空清单。无效数量显示字段错误，模拟保存失败时保留输入并提供重试。 |
| `components` | 组件总览 | 集中展示默认、悬停、键盘焦点、禁用、加载和错误状态。提供可 Tab 聚焦的组件和可直接查看的状态样本。 |

图鉴用本地样例数据覆盖筛选、排序和无结果分支。清单在浏览器本地保存，刷新后复查条目及数量。保存失败时保留可恢复的输入，并用可重复触发的样例错误验证重试。

## 实施顺序

1. 从现有 Rainroom 提取设计与素材。在 `DESIGN.md` 补齐间距、字阶、组件变体和断点规则。保留蓝旗鸢尾的原始比例和来源，按图标、插画、照片归档实际用到的素材。每项在 `asset/manifest.json` 写明 ID、相对路径、尺寸、来源、授权和使用页面。将图标归入 `icons/`，鸢尾留在 `illustrations/`，插画沿用现有清单的 `kind: photo`。
2. 共享页面结构、响应式样式和本地数据，完成图鉴、详情、清单及组件总览。在 `pages.json` 为两端声明入口 `guide`、四个页面的画板和逐步路线。给导航控件分配稳定标识，用 `data-route-key` 声明 Doop 目的地。用网页交互验证清单持久化及错误重试，在 Doop 中实点业务页面之间的导航。
3. 为每台设备同步一张 Style Card、相关 Asset Cards 和可点击预览。同步前用预览检查拟改动，应用后核对画板、素材加载、实际点击结果和第二次同步预览。
4. 生成 `dist/`，以 `index.html` 为图鉴入口。打包其内容到 `rainroom.zip`，将 `index.html` 放在 ZIP 根目录。用相对路径加载 CSS、普通脚本和素材。将样例数据随本地脚本交付，确保 `file://` 入口可以读取数据。离线打开前按需将构建产物里的资源引用重写至包内。

## 路线声明与证据

在 `pages.json` 的每个设备条目中声明主路线 `expectedRoute: ["guide", "iris", "planting-list", "guide"]`。主路线约定控件 ID 为 `open-iris`、`view-planting-list`、`back-to-guide`，组件总览入口为 `open-components`。报告保留逐次点击的控件和实际目的地，并按 [Doop 验收字段](../../references/doop.md#native-route-evidence) 填写 `states` 和 `observedFrameIds`。单独记录组件总览支线。

`dist/index.html` 用同一文档内的路由切换四个视图，清单由该入口统一读写。将本地数据作为普通脚本加载，并在目标浏览器下实际验证 `file://` 页面刷新后的保存行为。

## 计划输出目录

```text
rainroom/
  DESIGN.md
  project.json
  pages.json
  offline.json
  pages/
    guide.html
    iris.html
    planting-list.html
    components.html
  style/
    card.json
    icon/
  asset/
    manifest.json
    raw/
      icons/
      illustrations/
        blue-flag-iris.svg
      photos/
  reports/
    preview.json
    asset-preview.json
    doop-sync.json
    doop-acceptance.json
    screenshots/
  dist/
    index.html
    css/
    js/
    data/
    asset/
  rainroom.zip
```

交付 Doop 画布链接和两端原型入口。网页包保留 `dist/` 中实际使用的本地资源，分类目录随实际素材落盘。

## 验收

| 验收项 | 通过条件 |
| --- | --- |
| 逐次验证目的地 | 两端分别从 `guide` 开始，点击蓝旗鸢尾卡片到 `iris`，加入清单后点击查看清单到 `planting-list`，点击返回图鉴到 `guide`。另从导航点击组件总览到 `components`。每一步记录起始 Frame、控件、预期 Frame 和实际 Frame，逐项核对。 |
| 路由反例 | 在一份通过的报告副本中，把其中一端主路线的 `states` 替换为 `["guide", "guide"]`，其余证据保留。原生验收命令应拒绝该报告并指出路线所在设备。合法的回程可再次到达 `guide`。 |
| 键盘与交互 | 用 Tab 和 Shift+Tab 检查顺序和可见焦点，用 Enter、Space 或对应的原生按键操作控件。验证标签页、折叠面板、确认弹窗的焦点进入与返回，以及空结果、空清单、数量错误、失败重试和刷新后持久化。 |
| 窄屏与图片 | 检查两个声明的视口和 320 CSS px 窄屏。确认页面无横向溢出、手机端清单改用卡片、图片加载成功且比例正确。核对 Doop 预览和本地截图里的鸢尾。 |
| 离线 ZIP | 用 [通用离线入口](../../references/offline.md) 解包并在离线浏览器执行图鉴、详情和清单路线。刷新后用特定条目选择器验证持久化。 |
| Doop 重复同步 | 原生点击验收后，使用相同输入重新预览同步。必须得到 `operations: []`，记录 `repeatedChanges: 0`，并保存画布 URL 和证据。 |

运行技能的 `project-workflow.mjs check` 和 `accept-project.mjs` 核对本地生成产物。发布后保留逐次点击证据和同步报告，分别记录本地网页、离线 ZIP 与 Doop 原型的验收结果。
