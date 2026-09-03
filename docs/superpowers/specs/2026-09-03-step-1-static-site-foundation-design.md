# Irene Workshop 网站：Step 1 基础设计

## 本阶段目标

建立一个可直接静态部署、容易长期维护的网站骨架。本阶段只提供页面空壳、共享基础样式、共享 JavaScript 入口和集中式资料结构，不制作 Hero、Workshop 卡片、学员反馈、School Workshop、Footer 或报名表。

## 技术边界

- 只使用 HTML、CSS 与 Vanilla JavaScript。
- 不加入框架、构建工具、数据库、CMS 或外部资料连接。
- 所有页面通过相对路径引用共享的 `style.css`、`data.js` 和 `script.js`，可直接由静态服务器或托管平台发布。
- 页面结构使用语义化 HTML，并预留后续由 JavaScript 渲染内容的位置。

## 文件结构

```text
/
├── index.html
├── past-workshops.html
├── workshop-template.html
├── style.css
├── data.js
├── script.js
└── images/
```

- `index.html`：首页基础壳。
- `past-workshops.html`：往期 Workshop 页面基础壳。
- `workshop-template.html`：单场 Workshop 详情与报名页面基础壳。
- `style.css`：全站共用的 Mobile First 样式与设计变量。
- `data.js`：集中保存日后常更新的 Workshop、反馈、School Workshop、联系方式与付款资料；本阶段只建立清楚的数据分类和空数组／占位值。
- `script.js`：全站共用的 JavaScript 入口；本阶段只提供安全初始化骨架，不预先实现后续互动。
- `images/`：日后存放 Irene 形象照、Workshop 宣传图、活动照片与付款二维码。

## 基础视觉

- 优先适配 375px、390px 与 430px 手机宽度。
- 使用白色、米白和浅灰蓝作为基础背景；深蓝作为标题色，中蓝作为强调色，深灰作为正文色。
- 全局采用充足留白、轻微圆角、清楚的字体层级和可触控尺寸。
- 桌面版只增加内容最大宽度与左右留白，不建立独立复杂版型。
- 不加入阴影堆叠、强烈渐变、装饰图形或复杂动画。

## 数据流

`data.js` 暴露一个单一的全站资料对象，`script.js` 读取该对象并在后续步骤中把内容放入各页面预留容器。HTML 只保存稳定的页面结构，日常资料不重复写入不同页面。

## 容错原则

本阶段不加入复杂错误处理。若某个资料区块为空，后续渲染逻辑应选择不显示该区块，而不是在页面显示程式错误；具体逻辑在对应功能步骤加入。

## 验证标准

- 指定的 6 个文件和 `images/` 文件夹存在。
- 三个 HTML 文件都能独立打开，并正确引用共享 CSS 与 JavaScript。
- `data.js` 在 `script.js` 之前载入。
- 页面在 375px、390px、430px 下没有横向溢出。
- `data.js` 的分类让非程序员能看懂日后应修改的位置。
- 页面中没有提前实现 Step 2 至 Step 12 的内容。
