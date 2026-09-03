# Irene Workshop 网站｜日常更新说明

日常更新只需要打开 `data.js`。除非要修改版面，否则不要改 HTML。

## 1. 更新最新 Workshop

找到：

```javascript
currentWorkshop: {
```

修改这一组里面的课程名称、图片、日期、时间、形式、简介、状态、详情页链接和价格。

同一组里的 `detail` 是报名详情页内容，可修改课程主张、痛点、课程说明、学习成果、课程内容和适合对象。首页与报名页会自动使用同一场课程资料。

图片先放进 `images/`，再这样填写：

```javascript
image: "images/图片名称.png",
```

## 2. 修改报名状态

只修改 `status` 后面的英文：

- `upcoming`：即将开放，不能点击
- `open`：查看详情并报名，可以点击
- `full`：报名已满，不能点击
- `completed`：已完成，不能点击

例如课程开放报名：

```javascript
status: "open",
```

## 3. 课程结束后移到往期 Workshop

1. 复制完整的 `currentWorkshop` 课程资料。
2. 把它贴到 `pastWorkshops: [` 下面。
3. 加上一个不重复的 `id`。
4. 删除 `detailUrl` 和 `price`。
5. 把状态改成：

```javascript
status: "completed"
```

首页会自动显示最近 3–4 场，完整列表会自动出现在 `past-workshops.html`。

## 4. 新增或修改学员反馈

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

## 5. 更新 School Workshop

找到：

```javascript
schoolWorkshops: [
```

修改活动名称、主题、月份和图片。状态只使用：

- `preparing`：筹备中
- `completed`：已举办

## 6. 更新 WhatsApp 和 Facebook

找到 `contact`，填入完整网址：

```javascript
contact: {
  whatsapp: "https://wa.me/你的号码",
  facebook: "https://facebook.com/你的页面"
},
```

## 7. 更新报名费、DuitNow QR 和收款人

找到 `payment`：

```javascript
payment: {
  recipientName: "收款人名称",
  duitNowQrImage: "images/duitnow-qr.png"
},
```

付款二维码图片同样先放进 `images/`。

## 保存前检查

- 英文双引号 `" "` 和逗号不要删除。
- 图片名称必须和 `images/` 里的文件完全相同。
- 没有真实资料时保留“资料待更新”，不要发布虚构资料。
- 修改后刷新网页，检查手机预览是否正确。
