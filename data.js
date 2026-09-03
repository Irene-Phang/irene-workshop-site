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
    whatsapp: "https://wa.me/qr/L7ZKZNBI5VQGE1",
    facebook: "https://www.facebook.com/share/1BpprK2FiH/"
  },

  // ---------- 首页目前主推的公开 Workshop ----------
  // status 只填写：upcoming、open、full、completed
  currentWorkshop: {
    title: "AI 作文教学实战 Workshop｜第二场",
    image: "images/ai-writing-workshop-session-2.png",
    imageAlt: "AI 作文教学实战 Workshop 第二场宣传图",
    date: "2026-09-15",
    dateLabel: "9月15日（星期二）",
    time: "晚上8点–10点",
    deliveryMode: "线上",
    summary: "从一个作文题目，完成一套可以直接上课的作文教学教材。",
    status: "open",
    detailUrl: "workshop-template.html",
    price: "RM89",
    detail: {
      claim: "2小时，跟着我完整实作一次",
      painPoints: [
        "想用 AI 减少作文备课时间，却常常只得到零散内容。",
        "有了范文，还要自己整理教学步骤、视觉规划图和 PPT。",
        "接触过 AI 工具，但不知道怎样把它完整用进作文教学。"
      ],
      description: "这不是一场介绍更多 AI 工具的讲座。你会跟着 Irene 老师完整实作一次，把一个作文题目一步步发展成参考范文、作文视觉规划图与可以直接上课的教学教材。",
      outcomes: [
        "一个可用于课堂的作文题目",
        "一篇可以继续调整的参考范文",
        "一份帮助学生组织内容的作文视觉规划图",
        "一套可以直接用于教学的教材／PPT"
      ],
      curriculum: [
        "明确作文题目、教学目标与学生程度",
        "利用 AI 生成并调整参考范文",
        "从范文整理作文视觉规划图",
        "把内容整合成可以使用的教学教材／PPT"
      ],
      audience: [
        "需要准备作文教学内容的老师",
        "想把 AI 真正用进备课，而不是只认识工具的老师",
        "希望减少重复工作，并带走一套完整教学成果的老师"
      ]
    }
  },

  // ---------- 已完成的公开 Workshop ----------
  // 资料不完整时清楚标为“待补充”，不要自行猜测。
  // 新增课程时复制一整组 { ... }，完成后把 status 改成 completed。
  pastWorkshops: [
    {
      id: "ai-writing-workshop",
      title: "AI 作文教学实战 Workshop",
      image: "images/past-ai-writing-workshop.png",
      imageAlt: "AI 作文教学实战 Workshop 宣传图",
      date: "2026-08-29",
      dateLabel: "29/8/2026",
      time: "早上10点–12点",
      deliveryMode: "线上",
      summary: "从一个作文题目，完成一套可以直接上课的作文教材。",
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
