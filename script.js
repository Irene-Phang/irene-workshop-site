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

function setupContactMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-contact-menu]");

  if (!toggle || !menu || typeof siteData === "undefined") {
    return;
  }

  menu.querySelectorAll("[data-contact]").forEach((link) => {
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

function renderCurrentWorkshop() {
  const section = document.querySelector('[data-section="current-workshop"]');
  const container = document.querySelector("[data-current-workshop]");

  if (!section || !container || typeof siteData === "undefined" || !siteData.currentWorkshop) {
    return;
  }

  const workshop = siteData.currentWorkshop;
  const statusLabels = {
    upcoming: "即将开放",
    open: "查看详情并报名",
    full: "报名已满",
    completed: "已完成"
  };
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
    action.textContent = statusLabels.open;
    body.append(action);
  } else {
    const status = document.createElement("span");
    status.className = "button button--disabled workshop-card__action";
    status.setAttribute("aria-disabled", "true");
    status.textContent = statusLabels[workshop.status] || statusLabels.upcoming;
    body.append(status);
  }

  card.append(media, body);
  container.replaceChildren(card);
  section.hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  setupContactMenu();
  renderCurrentWorkshop();
  document.documentElement.classList.add("is-ready");
});
