// Irene Workshop 网站集中资料
// 日后需要更新的内容尽量只修改这个文件，不要直接修改 HTML。
const siteData = {
  // 网站名称与首页 Hero
  brandName: "Irene 老师 Workshop",
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

  // 联系方式
  contact: {
    whatsapp: "",
    facebook: ""
  },

  // 首页目前主推的公开 Workshop
  // status 可填写：upcoming、open、full、completed
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
    price: ""
  },

  // 已完成的公开 Workshop
  pastWorkshops: [],

  // 学员反馈
  // 以下为测试资料，正式上线前可直接替换文字与姓名。
  testimonials: [
    {
      quote: "步骤很清楚，我跟着做就完成了自己的教学素材。",
      author: "Low 老师"
    },
    {
      quote: "不是只介绍工具，而是真的带我把 AI 用进备课。",
      author: "刘老师"
    },
    {
      quote: "课堂节奏刚刚好，边学边做，不会听完又不知道从哪里开始。",
      author: "Aina 老师"
    },
    {
      quote: "以前觉得 AI 很复杂，这次终于知道怎样整理自己的想法。",
      author: "陈老师"
    },
    {
      quote: "完成后的作品可以继续修改，也能直接带回学校使用。",
      author: "Nurul 老师"
    }
  ],

  // School Workshop｜校内教师培训记录
  schoolWorkshops: [],

  // Workshop 报名与付款资料
  payment: {
    price: "",
    recipientName: "",
    duitNowQrImage: ""
  }
};
