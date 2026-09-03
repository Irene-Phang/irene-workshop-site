// ============================================================
// Irene Workshop 网站集中资料
// 日常更新请优先修改这个文件，不需要修改 HTML。
// 详细步骤请看 DAILY-UPDATES.md。
// ============================================================
const siteData = {
  // ---------- 网站与首页 Hero ----------
  brandName: "Irene 老师 Workshop",
  footerTagline: "Irene 老师｜教师 AI 实战 Workshop",
  hero: {
    image: "images/irene-profile.png",
    imageAlt: "Irene 老师专业形象照",
    eyebrow: "Irene 老师｜AI 教学实践者",
    statement: "我不教你认识更多 AI 工具，\n我教你怎么真正用进教学。",
    actions: [
      {
        label: "最新 Workshop",
        href: "#latest-workshop",
        style: "primary"
      },
      {
        label: "过往 Workshop",
        href: "#past-workshops",
        style: "secondary"
      }
    ]
  },

  // ---------- 联系方式 ----------
  // 填入完整网址，例如：https://wa.me/60123456789
  contact: {
    whatsapp: "",
    facebook: ""
  },

  // ---------- 首页目前主推的公开 Workshop ----------
  // status 只填写：upcoming、open、full、completed
  currentWorkshop: {
    title: "AI 出考卷实战 Workshop",
    image: "",
    imageAlt: "AI 出考卷实战 Workshop 宣传图",
    date: "2026-10-12",
    dateLabel: "10月12日（星期一）",
    time: "晚上8点–10点",
    deliveryMode: "线上",
    summary: "用两小时完成一套可以重复使用的 AI 出题流程。",
    status: "open",
    detailUrl: "workshop-template.html",
    price: "RMXX",
    detail: {
      claim: "2小时完成一套可重复使用的 AI 出题流程",
      painPoints: [
        "备课时间有限，却要不断准备不同程度的题目。",
        "试过 AI 工具，但生成内容仍需要花很多时间整理。"
      ],
      description: "这是一场以实作为主的教师 Workshop。你会带着自己的教学需要，一步步完成可继续使用的出题流程。",
      outcomes: [
        "一套可以重复使用的 AI 出题提示结构",
        "一份根据教学需要调整过的练习内容",
        "检查与修正 AI 输出的方法"
      ],
      curriculum: [
        "整理教学目标与学生程度",
        "把出题要求写成清楚提示",
        "检查、修改并保存可复用版本"
      ],
      audience: [
        "想减少重复备课时间的老师",
        "已经接触 AI，但还不确定怎样用于教学的老师",
        "希望带走实际作品，而不是只听工具介绍的老师"
      ]
    }
  },

  // ---------- 已完成的公开 Workshop ----------
  // 尚未收到真实课程资料，以下项目清楚标为“资料待更新”。
  // 新增课程时复制一整组 { ... }，完成后把 status 改成 completed。
  pastWorkshops: [
    {
      id: "past-workshop-01",
      title: "往期 Workshop 01｜资料待更新",
      image: "",
      imageAlt: "往期 Workshop 宣传图待更新",
      date: "",
      dateLabel: "日期待更新",
      time: "时间待更新",
      deliveryMode: "形式待更新",
      summary: "课程简介待更新。",
      status: "completed"
    },
    {
      id: "past-workshop-02",
      title: "往期 Workshop 02｜资料待更新",
      image: "",
      imageAlt: "往期 Workshop 宣传图待更新",
      date: "",
      dateLabel: "日期待更新",
      time: "时间待更新",
      deliveryMode: "形式待更新",
      summary: "课程简介待更新。",
      status: "completed"
    },
    {
      id: "past-workshop-03",
      title: "往期 Workshop 03｜资料待更新",
      image: "",
      imageAlt: "往期 Workshop 宣传图待更新",
      date: "",
      dateLabel: "日期待更新",
      time: "时间待更新",
      deliveryMode: "形式待更新",
      summary: "课程简介待更新。",
      status: "completed"
    }
  ],

  // ---------- 学员反馈 ----------
  // 只放学员愿意公开的反馈，并使用匿名称呼。
  testimonials: [
    {
      quote: "节省时间，可以快速生成作文教材",
      author: "何XX 老师"
    },
    {
      quote: "获益良多，在教学作文方面省了很多时间",
      author: "Ng XX 老师"
    },
    {
      quote: "节省作文备课时间，更清楚怎样利用 AI 教作文，学会从范文延伸出完整教学素材，对 AI 教学更有信心了",
      author: "Koo XX 老师"
    }
  ],

  // ---------- School Workshop｜校内教师培训 ----------
  // status 只填写：preparing 或 completed
  schoolWorkshops: [
    {
      title: "校内教师培训｜资料待更新",
      topic: "主题待更新",
      month: "月份待更新",
      image: "",
      imageAlt: "School Workshop 活动照片待更新",
      status: "preparing"
    }
  ],

  // ---------- 报名、付款与提示文字 ----------
  payment: {
    recipientName: "PHANG SIEW CHENG",
    duitNowQrImage: "images/duitnow-qr.jpg"
  },
  registration: {
    nameReminder: "请填写与当天进入 Google Meet 时相同的姓名。",
    nameNote: "课程当天将根据报名名单核对入场姓名，姓名不符或未在名单内者可能无法进入。",
    paymentNote: "请付款前确认收款人资料。完成付款后，请上传付款证明。",
    missingProofMessage: "请先上传付款证明后再提交报名。",
    successTitle: "报名已提交 ✓",
    successMessage: "已收到你的报名资料与付款证明，我们会根据报名名单进行核对。请留意 WhatsApp 通知。Workshop 前一天会收到提醒，当天会再次收到 Google Meet 链接。"
  }
};
