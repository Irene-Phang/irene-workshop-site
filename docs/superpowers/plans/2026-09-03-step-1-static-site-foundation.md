# Step 1 Static Site Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Irene Workshop 网站可直接静态部署的 Mobile First 基础骨架。

**Architecture:** 三个语义化 HTML 页面共用一份样式、一份集中资料和一份行为入口。HTML 只保留稳定结构，日后常更新的资料统一由 `data.js` 提供给 `script.js`。

**Tech Stack:** HTML5、CSS3、Vanilla JavaScript

**Spec:** `docs/superpowers/specs/2026-09-03-step-1-static-site-foundation-design.md`

## Global Constraints

- 只使用 HTML、CSS 与 Vanilla JavaScript。
- 不加入框架、构建工具、数据库、CMS 或外部资料连接。
- Mobile First，优先适配 375px、390px 与 430px。
- 本阶段不制作 Step 2 至 Step 12 的页面内容或互动。
- 日后常更新的资料集中在 `data.js`，不重复写入 HTML。

---

### Task 1: 建立完整静态网站骨架

**Files:**
- Create: `index.html`
- Create: `past-workshops.html`
- Create: `workshop-template.html`
- Create: `style.css`
- Create: `data.js`
- Create: `script.js`
- Create: `images/.gitkeep`

**Interfaces:**
- Consumes: 无；这是项目基础层。
- Produces: 全局 `siteData` 资料对象，以及三个页面共用的 CSS 类和 JavaScript 入口。

- [ ] **Step 1: 建立会先失败的结构检查**

在文件尚未建立时运行以下 PowerShell 检查：

```powershell
$required = @('index.html','past-workshops.html','workshop-template.html','style.css','script.js','data.js','images')
$missing = $required | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing.Count -gt 0) { throw "Missing: $($missing -join ', ')" }
```

Expected: FAIL，并列出尚未建立的文件与 `images` 文件夹。

- [ ] **Step 2: 建立三个 HTML 页面**

每个页面使用 `<!doctype html>`、`lang="zh-Hans"`、UTF-8、viewport meta、页面专属 title，以及以下共享资源顺序：

```html
<link rel="stylesheet" href="style.css">
<script src="data.js" defer></script>
<script src="script.js" defer></script>
```

`body` 内只加入可访问的跳至主要内容链接、简洁页首、带唯一 `id` 的 `<main>` 空容器和基础页尾，不填入后续阶段的营销内容。

- [ ] **Step 3: 建立集中式 `data.js`**

定义可由普通使用者阅读和修改的全局对象，并用中文注释分区：

```javascript
const siteData = {
  contact: { whatsapp: '', facebook: '' },
  currentWorkshop: null,
  pastWorkshops: [],
  testimonials: [],
  schoolWorkshops: [],
  payment: { price: '', recipientName: '', duitNowQrImage: '' }
};
```

不放假课程或假联系方式，避免占位资料被误发布。

- [ ] **Step 4: 建立最小 `script.js` 入口**

只保留安全初始化，不实现尚未要求的渲染或互动：

```javascript
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('is-ready');
});
```

- [ ] **Step 5: 建立 Mobile First 基础样式**

在 `style.css` 建立颜色、间距、圆角、字体、内容宽度等 CSS 自定义属性；加入 `box-sizing` reset、流式字体、图片防溢出、44px 最低触控高度、可见 focus 状态、`.container` 和基础页面布局。默认针对手机；只在较宽屏幕自然增加左右留白与最大宽度。

颜色变量采用：白／米白／浅灰蓝背景、深蓝标题、中蓝强调、深灰正文。不要加入复杂动画、厚重阴影或装饰图形。

- [ ] **Step 6: 建立图片目录并运行结构检查**

建立 `images/.gitkeep`，再次运行 Step 1 的 PowerShell 检查。

Expected: PASS，无错误输出。

- [ ] **Step 7: 验证共享资源、脚本顺序与基础防溢出规则**

运行：

```powershell
$pages = @('index.html','past-workshops.html','workshop-template.html')
foreach ($page in $pages) {
  $html = Get-Content -Raw -LiteralPath $page
  if ($html -notmatch 'href="style\.css"') { throw "$page missing style.css" }
  if ($html -notmatch 'src="data\.js"[\s\S]*src="script\.js"') { throw "$page has incorrect script order" }
}
$css = Get-Content -Raw -LiteralPath 'style.css'
if ($css -notmatch 'box-sizing:\s*border-box' -or $css -notmatch 'max-width:\s*100%') { throw 'Missing overflow safeguards' }
```

Expected: PASS，无错误输出。

- [ ] **Step 8: 检查修改并提交**

```powershell
git diff --check
git status --short
git add -- index.html past-workshops.html workshop-template.html style.css script.js data.js images/.gitkeep
git commit -m "feat: scaffold Irene workshop site"
```

Expected: diff 没有空白错误，提交只包含 Step 1 的七个基础项目条目。
