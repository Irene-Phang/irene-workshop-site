function getMalaysiaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function formatDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
}

function getWorkshopPriceState(workshop, dateKey = getMalaysiaDateKey()) {
  const earlyBirdIsAvailable = Boolean(
    workshop.earlyBirdPrice &&
    workshop.earlyBirdDeadline &&
    dateKey <= workshop.earlyBirdDeadline
  );

  if (earlyBirdIsAvailable) {
    return {
      currentPrice: workshop.earlyBirdPrice,
      isEarlyBird: true,
      mainLabel: "早鸟优惠",
      mainPrice: `RM${workshop.earlyBirdPrice}`,
      deadlineLabel: `${formatDateKey(workshop.earlyBirdDeadline)} 前报名`,
      regularLabel: "课程正价",
      regularPrice: `RM${workshop.regularPrice}`
    };
  }

  return {
    currentPrice: workshop.regularPrice,
    isEarlyBird: false,
    mainLabel: "报名费",
    mainPrice: `RM${workshop.regularPrice}`,
    deadlineLabel: "",
    regularLabel: "",
    regularPrice: ""
  };
}

function getFeaturedWorkshop(data) {
  if (Array.isArray(data.workshops)) {
    return data.workshops.find((workshop) => workshop.id === data.featuredWorkshopId) || data.workshops[0] || null;
  }

  return data.currentWorkshop || null;
}

function getWorkshopBySlug(data, slug) {
  if (slug && Array.isArray(data.workshops)) {
    return data.workshops.find((workshop) => workshop.slug === slug) || getFeaturedWorkshop(data);
  }

  return getFeaturedWorkshop(data);
}

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
  coming_soon: "即将开课",
  open: "查看详情并报名",
  full: "报名已满",
  closed: "报名截止",
  ended: "课程已结束",
  upcoming: "即将开课",
  completed: "已完成"
};

function createWorkshopPriceBlock(workshop, className = "workshop-price") {
  const price = getWorkshopPriceState(workshop);
  const container = document.createElement("div");
  const main = document.createElement("p");
  const mainLabel = document.createElement("span");
  const mainPrice = document.createElement("strong");

  container.className = className;
  container.dataset.priceMode = price.isEarlyBird ? "early-bird" : "regular";
  main.className = `${className}__main`;
  mainLabel.textContent = price.mainLabel;
  mainPrice.textContent = price.mainPrice;
  main.append(mainLabel, mainPrice);
  container.append(main);

  if (price.deadlineLabel) {
    const deadline = document.createElement("p");
    deadline.className = `${className}__deadline`;
    deadline.textContent = price.deadlineLabel;
    container.append(deadline);
  }

  if (price.regularPrice) {
    const regular = document.createElement("p");
    regular.className = `${className}__regular`;
    regular.textContent = `${price.regularLabel} ${price.regularPrice}`;
    container.append(regular);
  }

  return container;
}

function createWorkshopCard(workshop) {
  const card = document.createElement("article");
  const media = document.createElement("div");
  const body = document.createElement("div");
  const title = document.createElement("h3");
  const label = document.createElement("p");
  const schedule = document.createElement("p");
  const mode = document.createElement("p");
  const summary = document.createElement("p");

  card.className = "workshop-card";
  media.className = "workshop-card__media";
  body.className = "workshop-card__body";
  title.className = "workshop-card__title";
  label.className = "workshop-card__label";
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

  label.textContent = workshop.label || "";
  label.hidden = !label.textContent;
  title.textContent = workshop.title;
  schedule.textContent = [workshop.dateLabel, workshop.time].filter(Boolean).join("｜");
  schedule.hidden = !schedule.textContent;
  mode.textContent = workshop.deliveryMode;
  summary.textContent = workshop.summary;
  body.append(label, title, schedule, mode, summary);

  if (workshop.regularPrice && workshop.status === "open") {
    body.append(createWorkshopPriceBlock(workshop));
  }

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
    status.textContent = WORKSHOP_STATUS_LABELS[workshop.status] || WORKSHOP_STATUS_LABELS.coming_soon;
    body.append(status);
  }

  card.append(media, body);
  return card;
}

function renderCurrentWorkshop() {
  const section = document.querySelector('[data-section="current-workshop"]');
  const container = document.querySelector("[data-current-workshop]");

  if (!section || !container || typeof siteData === "undefined") {
    return;
  }

  const workshop = getFeaturedWorkshop(siteData);
  if (!workshop) {
    return;
  }

  container.replaceChildren(createWorkshopCard(workshop));
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
    .filter((workshop) => workshop.status === "completed" && workshop.image)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function createPastWorkshopPoster(workshop) {
  const poster = document.createElement("article");
  const image = document.createElement("img");

  poster.className = "past-workshop-poster";
  image.className = "past-workshop-poster__image";
  image.src = workshop.image;
  image.alt = workshop.imageAlt || workshop.title;
  poster.append(image);

  return poster;
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
    const cards = workshops.slice(0, 4).map(createPastWorkshopPoster);
    const moreLink = document.createElement("a");
    moreLink.className = "view-more-card";
    moreLink.href = "past-workshops.html";
    moreLink.textContent = "查看更多往期 Workshop →";
    homeSlider.replaceChildren(...cards, moreLink);
    homeSection.hidden = false;
  }

  if (pageList) {
    pageList.replaceChildren(...workshops.map(createPastWorkshopPoster));
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

function renderFaqs(items) {
  const container = document.querySelector("[data-detail-faqs]");
  const section = document.querySelector("[data-detail-faq-section]");

  if (!container || !section || !Array.isArray(items)) {
    return;
  }

  const faqs = items.map((item) => {
    const details = document.createElement("details");
    const question = document.createElement("summary");
    const answer = document.createElement("p");
    details.className = "faq-item";
    question.textContent = item.question;
    answer.textContent = item.answer;
    details.append(question, answer);
    return details;
  });

  container.replaceChildren(...faqs);
  section.hidden = faqs.length === 0;
}

function renderWorkshopDetail() {
  const detail = document.querySelector("[data-workshop-detail]");

  if (!detail || typeof siteData === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const workshop = getWorkshopBySlug(siteData, params.get("workshop"));
  if (!workshop) {
    return;
  }

  const detailContent = workshop.detail;
  const registrationIsOpen = workshop.status === "open";
  const detailAction = document.querySelector("[data-detail-action]");
  const detailTime = document.querySelector("[data-detail-time]");
  const detailDuration = document.querySelector("[data-detail-duration]");
  const registrationClosed = document.querySelector("[data-registration-closed]");
  const registrationSection = document.querySelector("[data-registration-section]");
  const poster = document.querySelector("[data-detail-poster]");
  const outcomeNote = document.querySelector("[data-detail-outcome-note]");
  const audienceNote = document.querySelector("[data-detail-audience-note]");

  document.title = `${workshop.title}｜Irene 老师`;
  if (workshop.image) {
    const image = document.createElement("img");
    image.src = workshop.image;
    image.alt = workshop.imageAlt;
    poster.replaceChildren(image);
  }

  document.querySelector("[data-detail-label]").textContent = workshop.label || "";
  document.querySelector("[data-detail-claim]").textContent = detailContent.claim;
  document.querySelector("[data-detail-supporting-claim]").textContent = detailContent.supportingClaim || "";
  document.querySelector("[data-detail-title]").textContent = workshop.title;
  document.querySelector("[data-detail-subtitle]").textContent = workshop.subtitle || workshop.summary;
  document.querySelector("[data-detail-date]").textContent = workshop.dateLabel;
  detailTime.textContent = workshop.time;
  detailTime.closest("div").hidden = !workshop.time;
  document.querySelector("[data-detail-mode]").textContent = workshop.deliveryMode;
  detailDuration.textContent = workshop.duration || "";
  detailDuration.closest("div").hidden = !workshop.duration;
  const detailPricing = document.querySelector("[data-detail-pricing]");
  detailPricing.replaceChildren(createWorkshopPriceBlock(workshop, "detail-price"));
  detailPricing.hidden = !registrationIsOpen;
  document.querySelector("[data-detail-pain-title]").textContent = detailContent.painPointsTitle;
  document.querySelector("[data-detail-description-title]").textContent = detailContent.descriptionTitle;
  document.querySelector("[data-detail-outcomes-title]").textContent = detailContent.outcomesTitle;
  document.querySelector("[data-detail-audience-title]").textContent = detailContent.audienceTitle;
  document.querySelector("[data-detail-description]").textContent = detailContent.description;
  outcomeNote.textContent = detailContent.outcomeNote || "";
  outcomeNote.hidden = !detailContent.outcomeNote;
  audienceNote.textContent = detailContent.audienceNote || "";
  audienceNote.hidden = !detailContent.audienceNote;
  document.querySelector("[data-detail-cta-title]").textContent = detailContent.ctaTitle || "准备好开始实作了吗？";
  document.querySelector("[data-detail-cta-support]").textContent = detailContent.ctaSupport || "";
  document.querySelector("[data-name-reminder]").textContent = siteData.registration.nameReminder;
  document.querySelector("[data-name-note]").textContent = siteData.registration.nameNote;
  document.querySelector("[data-payment-pricing]").replaceChildren(createWorkshopPriceBlock(workshop, "payment-price"));
  document.querySelector("[data-payment-recipient]").textContent = siteData.payment.recipientName;
  document.querySelector("[data-payment-note]").textContent = siteData.registration.paymentNote;

  registrationClosed.hidden = registrationIsOpen;
  registrationSection.hidden = !registrationIsOpen;

  if (!registrationIsOpen) {
    const status = document.createElement("span");
    status.className = "button button--disabled workshop-intro__action";
    status.setAttribute("aria-disabled", "true");
    status.textContent = WORKSHOP_STATUS_LABELS[workshop.status] || WORKSHOP_STATUS_LABELS.coming_soon;
    detailAction.replaceWith(status);
  }

  fillList("[data-detail-pain-points]", detailContent.painPoints);
  fillList("[data-detail-outcomes]", detailContent.outcomes);
  fillList("[data-detail-audience]", detailContent.audience);
  renderFaqs(detailContent.faqs);

  const testimonialContainer = document.querySelector("[data-detail-testimonials]");
  const testimonialSection = document.querySelector("[data-detail-testimonials-section]");
  const selectedTestimonials = (workshop.testimonialIndexes || [])
    .map((index) => siteData.testimonials[index])
    .filter(Boolean);
  const testimonials = selectedTestimonials.map((testimonial) => {
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
  testimonialSection.hidden = testimonials.length === 0;

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

  if (!form || typeof siteData === "undefined" || typeof Registration === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const workshop = getWorkshopBySlug(siteData, params.get("workshop"));
  Registration.setup({
    form,
    workshop,
    priceState: getWorkshopPriceState(workshop),
    config: siteData.registration
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
