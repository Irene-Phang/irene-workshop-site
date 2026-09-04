# Irene Workshop 真实报名系统设计

日期：2026-09-04

## 目标

让学员继续在 Irene Workshop 网站内完成报名，并把报名资料保存到 Google Sheet、付款证明保存到 Google Drive。只有后端确认保存成功后，网页才显示“报名已提交”。

## 范围

本阶段包含：

- 连接现有静态网站报名表。
- 建立一份专用 Google Sheet 保存报名记录。
- 建立一个专用 Google Drive 文件夹保存付款证明。
- 建立 Google Apps Script Web App 作为静态网站与 Google Workspace 之间的接口。
- 在 `data.js` 集中保存公开的接口设置。
- 加入前端与后端验证、重复提交保护和真实成功／失败提示。
- 保持网站可作为纯静态网站部署。

本阶段不包含：

- 自动确认付款是否正确。
- 自动发送 WhatsApp、Email 或 Google Meet 链接。
- 会员系统、CMS、数据库或登入系统。
- Google Form 跳转页。

## Google Workspace 结构

先在 Irene 的 Google Drive 搜索同名项目；没有才建立，避免重复文件。

- 主文件夹：`Irene Workshop 报名系统`
- Google Sheet：`Workshop 报名资料`
- 付款证明子文件夹：`付款证明`
- Apps Script 项目：`Irene Workshop Registration API`

Google Sheet 使用一张 `Registrations` 工作表，栏位依序为：

1. 提交时间
2. 报名编号
3. Workshop ID
4. Workshop 名称
5. Workshop 日期
6. 报名姓名
7. WhatsApp
8. 任教科目及年级
9. 报名时显示价格
10. 价格类型（早鸟／正价）
11. 付款证明文件名
12. 付款证明 Drive 链接
13. 核对状态
14. 备注

新记录的“核对状态”默认为 `待核对`。Sheet 和 Drive 文件夹保持私人，不自动改变分享权限。

## 系统架构

```text
网站报名表
  → 浏览器验证资料与付款证明
  → 隐藏 iframe 提交至 Apps Script
  → Apps Script 验证及防止重复提交
  → 付款证明保存到 Google Drive
  → 报名资料写入 Google Sheet
  → Apps Script 回传成功或失败讯息
  → 网站显示真实结果
```

选择隐藏 iframe 加 `postMessage`，是为了避开 Apps Script Web App 的跨网域限制，同时保留网站现有报名表与品牌版面。网页不会在收到后端成功讯息前显示报名成功。

## 前端设计

### 集中配置

`data.js` 的 `registration` 增加：

```javascript
endpoint: "Apps Script Web App URL",
maxProofSizeMb: 5,
acceptedProofTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"]
```

Apps Script URL 只出现一次。Google Sheet ID、Drive 文件夹 ID 不放进网页，也不放在 GitHub；它们保存于 Apps Script Properties。

### 提交流程

1. 检查必填姓名、WhatsApp 和付款证明。
2. 检查付款证明格式与 5MB 上限。
3. 产生不重复的报名编号和一次性 nonce。
4. 把付款证明转换成 Base64。
5. 暂停按钮并显示“正在提交”。
6. 通过隐藏 iframe 向 Apps Script 提交表单。
7. 只接受来自该 iframe、且 nonce 相同的回传讯息。
8. 成功后显示报名编号并清空表单；失败则保留资料并允许重试。

价格仍由网站现有的 `getWorkshopPriceState()` 根据马来西亚日期计算。送往 Sheet 的价格是“学员提交当时网页显示的价格快照”，供 Irene 核对付款；后端不会把付款证明视为已确认付款。

如果 `endpoint` 尚未设置，提交按钮不会制造假成功，而会提示“报名系统设置中，请 WhatsApp 联系 Irene”。

## Apps Script 设计

Apps Script 的 `doPost(e)` 负责：

- 验证报名编号、课程资料、姓名、WhatsApp、文件类型和文件大小。
- 清理文件名，避免特殊字符造成问题。
- 使用 `LockService` 防止同一时间写入冲突。
- 先检查 Sheet 是否已有相同报名编号，避免重复记录。
- 解码 Base64 并把付款证明存入指定 Drive 文件夹。
- 把资料与付款证明链接写入 `Registrations`。
- 成功或失败时返回一小段 HTML，通过 `window.parent.postMessage()` 通知网页。

后端从 Script Properties 读取：

- `SPREADSHEET_ID`
- `PAYMENT_FOLDER_ID`

这些私人 ID 不进入前端代码。

## 资料验证与安全

- Web App 必须允许没有 Google 帐号的学员提交，因此接口本身是公开的。
- 加入隐藏 honeypot 栏位，普通学员不会填写；机器人填写时直接拒绝。
- 后端不相信前端文件名称或 MIME，仍会重新检查允许类型与大小。
- 只接受 JPEG、PNG、WebP 和 PDF，最大 5MB。
- Drive 文件使用报名编号、课程 ID 和时间命名，不直接公开学员完整姓名。
- Sheet 与付款证明文件夹保持私人。
- 不在前端、GitHub 或错误讯息中暴露 Sheet ID、Drive 文件夹 ID 或内部错误堆栈。
- 本阶段不加入验证码；如果日后出现垃圾报名，再加入 Turnstile 等防滥用机制。

## 错误处理

- 前端验证失败：直接指出需要修正的项目，不发送资料。
- 网络或超时：显示未能确认提交，保留表单，让学员重试或 WhatsApp 联系 Irene。
- Drive 保存失败：不写入成功记录，并回传失败。
- Sheet 写入失败但文件已保存：Apps Script 删除本次刚建立的付款证明，避免孤立文件。
- 重复报名编号：回传原记录已存在，网页视为已成功提交，避免重复收费资料。
- 提交期间禁止再次点击按钮。

## 测试策略

先写失败测试，再实现功能。

前端自动测试：

- 未设置 endpoint 时绝不显示假成功。
- 缺少付款证明时不提交。
- 不允许的文件类型与超过 5MB 文件会被拒绝。
- 课程 ID、Workshop 名称、价格和价格类型正确进入提交资料。
- 后端成功、后端失败和超时分别显示正确状态。
- 连续点击只产生一次提交。

Apps Script 测试：

- 有效资料产生一行 Sheet 记录和一个 Drive 文件。
- 缺少必填资料、错误 MIME、过大文件和重复编号得到正确结果。
- Sheet 写入失败时清理刚上传的文件。

浏览器检查：

- 375px、390px、430px 和桌面宽度没有横向溢出。
- 选择、移除、重新选择付款证明正常。
- 成功与失败讯息可被辅助技术读取。
- 测试报名可以在 Sheet 找到，付款证明链接能够打开。

## 部署与授权

Apps Script 以 Irene 的 Google 帐号执行，并部署为可由任何人提交的 Web App。首次部署时 Google 会要求 Irene 授权访问该 Sheet 与付款证明文件夹；这是唯一需要 Irene 亲自确认的帐号授权步骤。

取得 Web App URL 后，把它填入 `data.js` 的 `registration.endpoint`。完成真实测试后，才把网站发布到 GitHub／静态托管。

## 完成标准

- 网站提交后，Google Sheet 出现完整且不重复的报名记录。
- Drive 出现可打开的付款证明，Sheet 内链接正确。
- 后端失败时网页不会显示成功。
- 早鸟价与正价资料按照马来西亚日期正确写入报名记录。
- 网站仍是可直接部署的 HTML、CSS、Vanilla JavaScript 静态网站。
- 私人 Google ID 和授权资料没有进入 GitHub。
