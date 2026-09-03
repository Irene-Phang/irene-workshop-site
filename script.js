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

document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  setupContactMenu();
  document.documentElement.classList.add("is-ready");
});
