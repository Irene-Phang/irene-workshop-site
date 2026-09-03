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
  currentWorkshop: null,

  // 已完成的公开 Workshop
  pastWorkshops: [],

  // 学员反馈
  testimonials: [],

  // School Workshop｜校内教师培训记录
  schoolWorkshops: [],

  // Workshop 报名与付款资料
  payment: {
    price: "",
    recipientName: "",
    duitNowQrImage: ""
  }
};
