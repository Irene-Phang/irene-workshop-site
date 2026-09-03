function renderHero() {
  const hero = document.querySelector('[data-section="hero"]');

  if (!hero || typeof siteData === "undefined") {
    return;
  }

  const media = hero.querySelector("[data-hero-media]");
  const eyebrow = hero.querySelector("[data-hero-eyebrow]");
  const statement = hero.querySelector("[data-hero-statement]");
  const actions = hero.querySelector("[data-hero-actions]");

  if (siteData.hero.image) {
    const image = document.createElement("img");
    image.className = "hero__image";
    image.src = siteData.hero.image;
    image.alt = siteData.hero.imageAlt;
    media.append(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "hero__placeholder";
    placeholder.textContent = "Irene 老师形象照";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "等待加入 Irene 老师专业形象照");
    media.append(placeholder);
  }

  eyebrow.textContent = siteData.hero.eyebrow;
  statement.textContent = siteData.hero.statement;

  siteData.hero.actions.forEach((action) => {
    const link = document.createElement("a");
    link.className = `button button--${action.style}`;
    link.href = action.href;
    link.textContent = action.label;
    actions.append(link);
  });
}

function setupContactLinks() {
  if (typeof siteData === "undefined") {
    return;
  }

  document.querySelectorAll("[data-contact]").forEach((link) => {
    const url = siteData.contact[link.dataset.contact];

    if (url) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });
}

function setupContactMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-contact-menu]");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "打开联系菜单" : "关闭联系菜单");
    menu.hidden = isOpen;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "打开联系菜单");
      toggle.focus();
    }
  });
}

const WORKSHOP_STATUS_LABELS = {
  upcoming: "即将开放",
  open: "查看详情并报名",
  full: "报名已满",
  completed: "已完成"
};

function createWorkshopCard(workshop) {
  const card = document.createElement("article");
  const media = document.createElement("div");
  const body = document.createElement("div");
  const title = document.createElement("h3");
  const schedule = document.createElement("p");
  const mode = document.createElement("p");
  const summary = document.createElement("p");

  card.className = "workshop-card";
  media.className = "workshop-card__media";
  body.className = "workshop-card__body";
  title.className = "workshop-card__title";
  schedule.className = "workshop-card__schedule";
  mode.className = "workshop-card__mode";
  summary.className = "workshop-card__summary";

  if (workshop.image) {
    const image = document.createElement("img");
    image.className = "workshop-card__image";
    image.src = workshop.image;
    image.alt = workshop.imageAlt;
    media.append(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "workshop-card__placeholder";
    placeholder.textContent = "Workshop 宣传图";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "等待加入 Workshop 宣传图");
    media.append(placeholder);
  }

  title.textContent = workshop.title;
  schedule.textContent = `${workshop.dateLabel}｜${workshop.time}`;
  mode.textContent = workshop.deliveryMode;
  summary.textContent = workshop.summary;
  body.append(title, schedule, mode, summary);

  if (workshop.status === "open" && workshop.detailUrl) {
    const action = document.createElement("a");
    action.className = "button button--primary workshop-card__action";
    action.href = workshop.detailUrl;
    action.textContent = WORKSHOP_STATUS_LABELS.open;
    body.append(action);
  } else {
    const status = document.createElement("span");
    status.className = "button button--disabled workshop-card__action";
    status.setAttribute("aria-disabled", "true");
    status.textContent = WORKSHOP_STATUS_LABELS[workshop.status] || WORKSHOP_STATUS_LABELS.upcoming;
    body.append(status);
  }

  card.append(media, body);
  return card;
}

function renderCurrentWorkshop() {
  const section = document.querySelector('[data-section="current-workshop"]');
  const container = document.querySelector("[data-current-workshop]");

  if (!section || !container || typeof siteData === "undefined" || !siteData.currentWorkshop) {
    return;
  }

  container.replaceChildren(createWorkshopCard(siteData.currentWorkshop));
  section.hidden = false;
}

function renderTestimonials() {
  const section = document.querySelector('[data-section="testimonials"]');
  const container = document.querySelector("[data-testimonials]");

  if (
    !section ||
    !container ||
    typeof siteData === "undefined" ||
    !Array.isArray(siteData.testimonials) ||
    siteData.testimonials.length === 0
  ) {
    return;
  }

  const cards = siteData.testimonials.map((testimonial) => {
    const card = document.createElement("blockquote");
    const quote = document.createElement("p");
    const author = document.createElement("footer");

    card.className = "testimonial-card";
    quote.className = "testimonial-card__quote";
    author.className = "testimonial-card__author";
    quote.textContent = `“${testimonial.quote}”`;
    author.textContent = `— ${testimonial.author}`;
    card.append(quote, author);

    return card;
  });

  container.replaceChildren(...cards);
  section.hidden = false;
}

function getCompletedWorkshops() {
  if (typeof siteData === "undefined" || !Array.isArray(siteData.pastWorkshops)) {
    return [];
  }

  return siteData.pastWorkshops
    .filter((workshop) => workshop.status === "completed")
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function renderPastWorkshops() {
  const workshops = getCompletedWorkshops();
  const homeSection = document.querySelector('[data-section="past-workshops"]');
  const homeSlider = document.querySelector("[data-past-workshop-slider]");
  const pageList = document.querySelector("[data-past-workshop-list]");

  if (workshops.length === 0) {
    return;
  }

  if (homeSection && homeSlider) {
    const cards = workshops.slice(0, 4).map(createWorkshopCard);
    const moreLink = document.createElement("a");
    moreLink.className = "view-more-card";
    moreLink.href = "past-workshops.html";
    moreLink.textContent = "查看更多往期 Workshop →";
    homeSlider.replaceChildren(...cards, moreLink);
    homeSection.hidden = false;
  }

  if (pageList) {
    pageList.replaceChildren(...workshops.map(createWorkshopCard));
  }
}

function renderSchoolWorkshops() {
  const section = document.querySelector('[data-section="school-workshops"]');
  const container = document.querySelector("[data-school-workshops]");

  if (
    !section ||
    !container ||
    typeof siteData === "undefined" ||
    !Array.isArray(siteData.schoolWorkshops) ||
    siteData.schoolWorkshops.length === 0
  ) {
    return;
  }

  const workshop = siteData.schoolWorkshops[0];
  const card = document.createElement("article");
  const media = document.createElement("div");
  const body = document.createElement("div");
  const title = document.createElement("h3");
  const topic = document.createElement("p");
  const meta = document.createElement("p");

  card.className = "school-card";
  media.className = "school-card__media";
  body.className = "school-card__body";
  title.className = "school-card__title";
  topic.className = "school-card__topic";
  meta.className = "school-card__meta";

  if (workshop.image) {
    const image = document.createElement("img");
    image.className = "school-card__image";
    image.src = workshop.image;
    image.alt = workshop.imageAlt;
    media.append(image);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "school-card__placeholder";
    placeholder.textContent = "活动照片";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", "等待加入 School Workshop 活动照片");
    media.append(placeholder);
  }

  title.textContent = workshop.title;
  topic.textContent = workshop.topic;
  meta.textContent = `${workshop.month}｜${workshop.status === "completed" ? "已举办" : "筹备中"}`;
  body.append(title, topic, meta);
  card.append(media, body);
  container.replaceChildren(card);
  section.hidden = false;
}

function renderSiteFooter() {
  if (typeof siteData === "undefined") {
    return;
  }

  document.querySelectorAll("[data-footer]").forEach((footer) => {
    const tagline = document.createElement("p");
    const links = document.createElement("nav");
    const whatsapp = document.createElement("a");
    const separator = document.createTextNode("｜");
    const facebook = document.createElement("a");

    tagline.className = "site-footer__tagline";
    links.className = "site-footer__links";
    links.setAttribute("aria-label", "社交平台");
    tagline.textContent = siteData.footerTagline;
    whatsapp.href = "#";
    whatsapp.dataset.contact = "whatsapp";
    whatsapp.textContent = "WhatsApp";
    facebook.href = "#";
    facebook.dataset.contact = "facebook";
    facebook.textContent = "Facebook";
    links.append(whatsapp, separator, facebook);
    footer.replaceChildren(tagline, links);
  });
}

function fillList(selector, items) {
  const list = document.querySelector(selector);

  if (!list || !Array.isArray(items)) {
    return;
  }

  list.replaceChildren(...items.map((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    return item;
  }));
}

function renderWorkshopDetail() {
  const detail = document.querySelector("[data-workshop-detail]");

  if (!detail || typeof siteData === "undefined") {
    return;
  }

  const workshop = siteData.currentWorkshop;
  const detailContent = workshop.detail;
  document.querySelector("[data-detail-claim]").textContent = detailContent.claim;
  document.querySelector("[data-detail-title]").textContent = workshop.title;
  document.querySelector("[data-detail-date]").textContent = workshop.dateLabel;
  document.querySelector("[data-detail-time]").textContent = workshop.time;
  document.querySelector("[data-detail-mode]").textContent = workshop.deliveryMode;
  document.querySelector("[data-detail-price]").textContent = workshop.price;
  document.querySelector("[data-detail-description]").textContent = detailContent.description;
  document.querySelector("[data-name-reminder]").textContent = siteData.registration.nameReminder;
  document.querySelector("[data-name-note]").textContent = siteData.registration.nameNote;
  document.querySelector("[data-payment-price]").textContent = workshop.price;
  document.querySelector("[data-payment-recipient]").textContent = siteData.payment.recipientName;
  document.querySelector("[data-payment-note]").textContent = siteData.registration.paymentNote;

  fillList("[data-detail-pain-points]", detailContent.painPoints);
  fillList("[data-detail-outcomes]", detailContent.outcomes);
  fillList("[data-detail-curriculum]", detailContent.curriculum);
  fillList("[data-detail-audience]", detailContent.audience);

  const testimonialContainer = document.querySelector("[data-detail-testimonials]");
  const testimonials = siteData.testimonials.slice(0, 3).map((testimonial) => {
    const card = document.createElement("blockquote");
    const quote = document.createElement("p");
    const author = document.createElement("footer");
    card.className = "detail-testimonial";
    quote.textContent = `“${testimonial.quote}”`;
    author.textContent = `— ${testimonial.author}`;
    card.append(quote, author);
    return card;
  });
  testimonialContainer.replaceChildren(...testimonials);

  const qr = document.querySelector("[data-payment-qr]");
  if (siteData.payment.duitNowQrImage) {
    const image = document.createElement("img");
    image.src = siteData.payment.duitNowQrImage;
    image.alt = "DuitNow QR";
    qr.replaceChildren(image);
    qr.removeAttribute("role");
    qr.removeAttribute("aria-label");
  }
}

function setupRegistrationForm() {
  const form = document.querySelector("[data-registration-form]");

  if (!form || typeof siteData === "undefined") {
    return;
  }

  const proofInput = form.querySelector("[data-proof-input]");
  const fileLabel = form.querySelector("[data-file-label]");
  const fileStatus = form.querySelector("[data-file-status]");
  const proofName = form.querySelector("[data-proof-name]");
  const removeProof = form.querySelector("[data-remove-proof]");
  const message = form.querySelector("[data-form-message]");

  function updateFileStatus() {
    const file = proofInput.files[0];
    fileStatus.hidden = !file;
    proofName.textContent = file ? file.name : "";
    fileLabel.textContent = file ? "重新选择" : "选择付款证明";
  }

  proofInput.addEventListener("change", updateFileStatus);
  removeProof.addEventListener("click", () => {
    proofInput.value = "";
    updateFileStatus();
    proofInput.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    message.replaceChildren();
    message.className = "form-message";

    if (!proofInput.files[0]) {
      message.classList.add("form-message--error");
      message.textContent = siteData.registration.missingProofMessage;
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const title = document.createElement("strong");
    const text = document.createElement("p");
    message.classList.add("form-message--success");
    title.textContent = siteData.registration.successTitle;
    text.textContent = siteData.registration.successMessage;
    message.append(title, text);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  renderCurrentWorkshop();
  renderTestimonials();
  renderPastWorkshops();
  renderSchoolWorkshops();
  renderWorkshopDetail();
  renderSiteFooter();
  setupContactLinks();
  setupContactMenu();
  setupRegistrationForm();
  document.documentElement.classList.add("is-ready");
});
