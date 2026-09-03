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
  // 只放学员愿意公开的反馈文字与姓名。
  testimonials: [
    {
      quote: "节省时间，可以快速生成作文教材",
      author: "何俊城"
    },
    {
      quote: "获益良多，在教学作文方面省了很多时间",
      author: "Ng Chun Kit"
    },
    {
      quote: "节省作文备课时间，更清楚怎样利用 AI 教作文，学会从范文延伸出完整教学素材，对 AI 教学更有信心了",
      author: "KOO YOON JYE"
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
