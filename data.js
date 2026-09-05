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

  // ---------- 公开 Workshop ----------
  // 首页显示 featuredWorkshopId 指定的课程。
  // status 可填写：coming_soon、open、full、closed、ended。
  featuredWorkshopId: "ai-exam-language-2026-09",
  workshops: [
    {
      id: "ai-writing-workshop-2",
      slug: "ai-writing-workshop-2",
      title: "AI 作文教学实战 Workshop｜第二场",
      label: "AI 作文教学实战｜第二场",
      subtitle: "从一个作文题目，完成一套可以直接上课的作文教学教材。",
      image: "images/ai-writing-workshop-session-2.png",
      imageAlt: "AI 作文教学实战 Workshop 第二场宣传图",
      date: "2026-10",
      dateLabel: "10月",
      time: "",
      duration: "2小时",
      deliveryMode: "线上",
      summary: "从一个作文题目，完成一套可以直接上课的作文教学教材。",
      earlyBirdPrice: null,
      regularPrice: 89,
      earlyBirdDeadline: "",
      status: "coming_soon",
      detailUrl: "workshop-template.html?workshop=ai-writing-workshop-2",
      registrationUrl: "",
      testimonialIndexes: [0, 1, 2],
      detail: {
        claim: "2小时，跟着我完整实作一次",
        painPointsTitle: "作文备课时，你可能遇到这些情况",
        descriptionTitle: "这场 Workshop 会怎样进行",
        outcomesTitle: "你会完成什么",
        audienceTitle: "适合谁",
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
        audience: [
          "需要准备作文教学内容的老师",
          "想把 AI 真正用进备课，而不是只认识工具的老师",
          "希望减少重复工作，并带走一套完整教学成果的老师"
        ],
        faqs: []
      }
    },
    {
      id: "ai-exam-language-2026-09",
      slug: "ai-exam-language",
      title: "AI 出卷实战 WORKSHOP",
      label: "语文科｜AI 自主出卷实战",
      subtitle: "从教材到完整考卷，一步一步带你做",
      image: "images/ai-exam-language-workshop.png",
      imageAlt: "语文科 AI 出卷实战 Workshop 宣传图",
      date: "2026-09-15",
      dateLabel: "15 September 2026",
      time: "8:00 PM – 10:00 PM",
      duration: "2小时",
      deliveryMode: "Online Workshop",
      summary: "从教材到完整考卷，一步一步带你做。",
      earlyBirdPrice: 99,
      regularPrice: 119,
      earlyBirdDeadline: "2026-09-13",
      status: "open",
      detailUrl: "workshop-template.html?workshop=ai-exam-language",
      registrationUrl: "",
      audience: "Bahasa Melayu / English / 华文教师",
      testimonialIndexes: [],
      detail: {
        claim: "不是叫 AI 随便出题，而是让 AI 先读懂你教过什么。",
        supportingClaim: "不是来学一堆 AI 工具，而是把原本很花时间的出题工作，换一种更聪明的做法。",
        painPointsTitle: "出一份考卷，真正花时间的，往往不是“打题目”",
        descriptionTitle: "让 AI 真正成为你的出卷助手",
        outcomesTitle: "课堂会得到什么",
        audienceTitle: "适合谁",
        painPoints: [
          "为了找适合教学范围和学生程度的题目，需要翻很多参考资料。",
          "找到题目以后，还要筛选、修改、重新打字和检查。",
          "不同题型与答案需要反复校对，很容易占用大量时间。",
          "AI 会出题，却不一定知道老师真正教过什么。"
        ],
        description: "这是一场给语文老师的 AI 出卷实作课。课堂会使用老师自己的教材，一步一步练习怎样把 AI 应用在出卷工作中，减少找题、筛题、重复修改和校对所花的时间。无论完全不会 AI、只会简单使用 ChatGPT，还是已经会用 AI 却没有真正省到时间，都可以跟着这套流程实作。",
        outcomes: [
          "AI 协助整理考试内容",
          "实作不同类型的考题",
          "完成考题＋教师答案参考"
        ],
        outcomeNote: "课堂将完成约 3–5 个代表性的考试内容，让老师掌握方法后，继续应用到自己的完整考卷。",
        audience: [
          "Bahasa Melayu、English 或华文教师",
          "小学或中学教师",
          "需要准备课堂测验、单元评估、校内自主命题、练习与评量内容的老师"
        ],
        audienceNote: "课程主要聚焦老师可自行设计的测验、评估与校内自主命题；如考试必须严格遵循官方固定格式，仍应以相关官方规定为准。",
        ctaTitle: "准备好让 AI 帮你少花一点时间出卷了吗？",
        ctaSupport: "Bahasa Melayu / English / 华文教师适用",
        faqs: [
          {
            question: "不会使用 AI，可以参加吗？",
            answer: "可以。这场 Workshop 以实际操作为主，会一步一步带老师完成，适合 AI 初学者。"
          },
          {
            question: "需要准备什么？",
            answer: "准备自己平时使用的教材即可。其他课前准备会在报名后说明。"
          },
          {
            question: "课堂会完成整份考卷吗？",
            answer: "课堂会完成约 3–5 个代表性的考试内容，重点是掌握操作方法。学会之后，可以继续应用到自己的完整考卷。"
          },
          {
            question: "适合哪些科目？",
            answer: "这次 Workshop 主攻语文科：Bahasa Melayu、English、华文。"
          },
          {
            question: "小学和中学都可以吗？",
            answer: "可以。课程主要针对老师可自行设计的课堂测验、评估与校内自主命题；若考试必须严格遵循官方固定格式，仍需以相关官方考试规定为准。"
          }
        ]
      }
    }
  ],

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
    endpoint: "https://script.google.com/macros/s/AKfycbyufEz3wg-v58Ey_lu6xiYldnmcsKQcR7bmmPUszHH5F49fsgRMmmKUtIplR6GHR1erfg/exec",
    maxProofSizeMb: 5,
    acceptedProofTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    submissionTimeoutMs: 30000,
    nameReminder: "请填写与当天进入 Google Meet 时相同的姓名。",
    nameNote: "课程当天将根据报名名单核对入场姓名，姓名不符或未在名单内者可能无法进入。",
    paymentNote: "请付款前确认收款人资料。完成付款后，请上传付款证明。",
    missingProofMessage: "请先上传付款证明后再提交报名。",
    successTitle: "报名已提交 ✓",
    successMessage: "已收到你的报名资料与付款证明，我们会根据报名名单进行核对。请留意 WhatsApp 通知。Workshop 前一天会收到提醒，当天会再次收到 Google Meet 链接。"
  }
};
