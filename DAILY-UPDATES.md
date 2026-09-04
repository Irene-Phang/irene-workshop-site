# Irene Workshop 网站｜日常更新说明

日常更新只需要打开 `data.js`。除非要修改版面，否则不要改 HTML、CSS 或 JavaScript。

## 1. 指定首页主推 Workshop

找到：

```javascript
featuredWorkshopId: "ai-exam-language-2026-09",
```

把引号里的文字改成要主推课程的 `id`。这个 `id` 必须与 `workshops` 里面某一场课程完全相同。

## 2. 新增或修改 Workshop

找到：

```javascript
workshops: [
```

每一场课程都放在这个清单里。复制现有的一整组课程资料后再修改，其中：

- `id`：课程内部识别名称，不能与其他课程重复。
- `slug`：详情页网址使用的简短名称，不能重复。
- `title`、`label`、`subtitle`：课程名称与公开文案。
- `image`：宣传图路径，图片要先放进 `images/`。
- `date`、`time`、`mode`、`duration`：日期、时间、形式和时长。
- `detailUrl`：必须使用该课程的 `slug`，例如 `workshop-template.html?workshop=ai-exam-language`。
- `registrationUrl`：目前保留空白；以后接好正式报名系统才填写。
- `detail`：报名详情页的公开内容，例如课程主张、痛点、学习成果、适合对象和 FAQ。

图片填写方式：

```javascript
image: "images/图片名称.png",
```

## 3. 修改报名状态

只修改 `status` 后面的英文：

- `coming_soon`：即将开课，不开放报名。
- `open`：开放查看详情和报名。
- `full`：报名已满。
- `closed`：报名已截止。
- `ended`：课程已结束。

例如课程开放报名：

```javascript
status: "open",
```

## 4. 设置早鸟价和正价

价格和早鸟截止日期只在课程资料里设置一次：

```javascript
earlyBirdPrice: 99,
regularPrice: 119,
earlyBirdDeadline: "2026-09-13",
```

截止日当天仍会显示早鸟价 RM99 和正价 RM119；从第二天开始，网页会自动只显示正价 RM119。日期格式必须是 `年-月-日`。

没有早鸟优惠时这样填写：

```javascript
earlyBirdPrice: null,
regularPrice: 119,
earlyBirdDeadline: "",
```

## 5. 课程结束后加入往期 Workshop

在 `pastWorkshops` 最前面新增一组，只需保留宣传图和必要识别资料。状态使用：

```javascript
status: "completed"
```

首页会自动显示最近几场，完整列表会自动出现在 `past-workshops.html`。

## 6. 新增或修改学员反馈

找到：

```javascript
testimonials: [
```

每一条使用以下格式：

```javascript
{
  quote: "学员反馈原文",
  author: "陈XX 老师"
},
```

没有获得公开姓名授权时，只保留姓氏并加 `XX 老师`。

课程里面的 `testimonialIndexes` 决定详情页显示哪几条反馈；没有该课程的真实反馈时使用空清单 `[]`。

## 7. 更新 School Workshop

找到 `schoolWorkshops`，修改活动名称、主题、月份和图片。状态只使用：

- `preparing`：筹备中。
- `completed`：已举办。

## 8. 更新 WhatsApp 和 Facebook

找到 `contact`，填入完整网址：

```javascript
contact: {
  whatsapp: "https://wa.me/你的号码",
  facebook: "https://facebook.com/你的页面"
},
```

## 9. 更新 DuitNow QR 和收款人

找到 `payment`：

```javascript
payment: {
  recipientName: "收款人名称",
  duitNowQrImage: "images/duitnow-qr.png"
},
```

付款二维码图片同样先放进 `images/`。课程价格不要写在 `payment`，只写在对应 Workshop 资料里。

## 保存前检查

- 英文双引号 `" "` 和逗号不要删除。
- 图片名称必须和 `images/` 里的文件完全相同。
- 没有真实资料时保留“资料待更新”，不要发布虚构资料。
- 修改后刷新网页，检查 375px、390px 和 430px 手机宽度。
- 正式收款前，先确认报名表已经连接真实的资料保存系统。
