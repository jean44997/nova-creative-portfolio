const documentRoot = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const progressBar = document.querySelector(".progress-track span");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const cursor = document.querySelector(".cursor-dot");
const form = document.querySelector(".contact-form");
const formStatus = document.querySelector("#form-status");
const menuLabel = menuButton?.querySelector(".sr-only");
const fallbackMailLimit = 2;
const fallbackMailWindowMs = 60 * 60 * 1000;

document.querySelector("#year").textContent = new Date().getFullYear();

const updateProgress = () => {
  const scrollableHeight = documentRoot.scrollHeight - window.innerHeight;
  const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
};

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress, { passive: true });
updateProgress();

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  if (menuLabel) menuLabel.textContent = isOpen ? "Ouvrir le menu" : "Fermer le menu";
  navigation.classList.toggle("is-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Ouvrir le menu";
    navigation.classList.remove("is-open");
  });
});

const revealElements = document.querySelectorAll(".reveal");
revealElements.forEach((element) => {
  element.style.setProperty("--reveal-delay", `${element.dataset.delay || 0}ms`);
});
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

if (finePointer.matches && !reduceMotion.matches) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  }, { passive: true });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.1;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.1;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });

  document.querySelectorAll("[data-tilt-scene]").forEach((scene) => {
    let frame;
    scene.addEventListener("pointermove", (event) => {
      const bounds = scene.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scene.style.setProperty("--scene-x", `${x * 10}deg`);
        scene.style.setProperty("--scene-y", `${y * -9}deg`);
        scene.classList.add("is-tilting");
      });
    });
    scene.addEventListener("pointerleave", () => {
      scene.classList.remove("is-tilting");
      scene.style.removeProperty("--scene-x");
      scene.style.removeProperty("--scene-y");
    });
  });
}

const studio = document.querySelector(".hero-studio");
const studioStatus = document.querySelector("[data-studio-status]");
if (studio) {
  let studioFrame;
  const updateStudioScroll = () => {
    studioFrame = undefined;
    const bounds = studio.getBoundingClientRect();
    const viewHeight = window.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, (viewHeight * .92 - bounds.top) / (bounds.height + viewHeight * .38)));
    studio.style.setProperty("--lottie-scroll-y", `${Math.round(-22 + progress * 58)}px`);
    studio.style.setProperty("--lottie-scroll-x", `${Math.round(-8 + progress * 16)}px`);
    studio.style.setProperty("--lottie-scroll-rotate", `${-5 + progress * 10}deg`);
    studio.style.setProperty("--lottie-scroll-scale", `${(1.04 - progress * .12).toFixed(3)}`);
    studio.style.setProperty("--studio-scroll-progress", progress.toFixed(3));
    studio.classList.toggle("is-scrolling", bounds.bottom > 0 && bounds.top < viewHeight);
    if (studioStatus) {
      const percent = Math.round(progress * 100);
      studioStatus.innerHTML = `SCROLL SYNC ${String(percent).padStart(2, "0")}%<br /><span>DEVELOPER AT WORK · EN MOUVEMENT</span>`;
    }
  };
  const requestStudioUpdate = () => {
    if (!studioFrame) studioFrame = window.requestAnimationFrame(updateStudioScroll);
  };
  window.addEventListener("scroll", requestStudioUpdate, { passive: true });
  window.addEventListener("resize", requestStudioUpdate, { passive: true });
  requestStudioUpdate();
}

const staticSkillScene = document.querySelector(".static-skill-scene");
if (staticSkillScene) {
  let draggedCard = null;
  let cardPointerOffset = { x: 0, y: 0 };
  const clampCardPosition = (value, min, max) => Math.min(max, Math.max(min, value));
  staticSkillScene.addEventListener("pointerdown", (event) => {
    const card = event.target.closest("[data-skill-card]");
    if (!card) return;
    const bounds = staticSkillScene.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    draggedCard = card;
    cardPointerOffset = { x: event.clientX - cardBounds.left, y: event.clientY - cardBounds.top };
    staticSkillScene.setPointerCapture?.(event.pointerId);
    card.classList.add("is-dragging");
    card.style.right = "auto";
    card.style.bottom = "auto";
    card.style.zIndex = "9";
    event.preventDefault();
  });
  staticSkillScene.addEventListener("pointermove", (event) => {
    if (!draggedCard) return;
    const bounds = staticSkillScene.getBoundingClientRect();
    const maxX = Math.max(0, bounds.width - draggedCard.offsetWidth);
    const maxY = Math.max(0, bounds.height - draggedCard.offsetHeight);
    const nextX = clampCardPosition(event.clientX - bounds.left - cardPointerOffset.x, 0, maxX);
    const nextY = clampCardPosition(event.clientY - bounds.top - cardPointerOffset.y, 0, maxY);
    draggedCard.style.left = `${Math.round(nextX)}px`;
    draggedCard.style.top = `${Math.round(nextY)}px`;
  });
  const finishStaticDrag = (event) => {
    if (!draggedCard) return;
    staticSkillScene.releasePointerCapture?.(event.pointerId);
    draggedCard.classList.remove("is-dragging");
    draggedCard.style.zIndex = "";
    draggedCard = null;
  };
  staticSkillScene.addEventListener("pointerup", finishStaticDrag);
  staticSkillScene.addEventListener("pointercancel", finishStaticDrag);
}

const stage = document.querySelector(".project-stage");
const stageNumber = document.querySelector("[data-stage-number]");
const stageName = document.querySelector("[data-stage-name]");
const stageKind = document.querySelector("[data-stage-kind]");
const stageLogo = document.querySelector("[data-stage-logo]");
const stageComponentOne = document.querySelector("[data-stage-component-one]");
const stageComponentTwo = document.querySelector("[data-stage-component-two]");
const stageComponentThree = document.querySelector("[data-stage-component-three]");
const stageComponentLogoOne = document.querySelector("[data-stage-component-logo-one]");
const stageComponentLogoTwo = document.querySelector("[data-stage-component-logo-two]");
const stageComponentLogoThree = document.querySelector("[data-stage-component-logo-three]");
const projectScrollContainer = document.querySelector("[data-project-scroll]");
let stageSwitchTimer;
const projectThemes = {
  bardeur: {
    name: "BARDEUR YK", kind: "Vidéos, lives et messagerie",
    number: "01", color: "#24142d", accent: "#ff4a96", accentSoft: "#4fe3ff",
    logo: "assets/bardeur-logo.svg", components: [
      { name: "REACT", logo: "https://cdn.simpleicons.org/react/61DAFB" },
      { name: "TYPESCRIPT", logo: "https://cdn.simpleicons.org/typescript/3178C6" },
      { name: "SUPABASE", logo: "https://cdn.simpleicons.org/supabase/3ECF8E" }
    ]
  },
  aib: {
    name: "AIB IMMOBILIER", kind: "Biens, vente et location",
    number: "02", color: "#101d28", accent: "#d5a53d", accentSoft: "#f4e1a2",
    logo: "assets/aib-logo.jpeg", components: [
      { name: "AIB", logo: "assets/aib-logo.jpeg" },
      { name: "BIENS", logo: "assets/component-home.svg" },
      { name: "VENTE", logo: "assets/component-key.svg" }
    ]
  },
  drayat: {
    name: "DRAYAT IMMOBILIER", kind: "Agence immobilière à Abidjan",
    number: "03", color: "#202b43", accent: "#7fa8ed", accentSoft: "#e8d4a0",
    logo: "assets/drayat-logo.jpg", components: [
      { name: "DRAYAT", logo: "assets/drayat-logo.jpg" },
      { name: "VISITE", logo: "assets/component-building.svg" },
      { name: "CONSEIL", logo: "assets/component-compass.svg" }
    ]
  },
  arena: {
    name: "ARENA AF", kind: "Matchs, défis et classement",
    number: "04", color: "#24150f", accent: "#ff6a22", accentSoft: "#ffd7a6",
    logo: "assets/arena-logo.svg", components: [
      { name: "MATCHS", logo: "assets/component-gamepad.svg" },
      { name: "DÉFIS", logo: "assets/component-trophy.svg" },
      { name: "RANK", logo: "assets/arena-logo.svg" }
    ]
  },
};

const setActiveProject = (entry) => {
  const theme = projectThemes[entry.dataset.project];
  if (!theme || !stage) return;
  document.querySelectorAll(".project-entry").forEach((project) => {
    project.classList.toggle("is-active", project === entry);
  });
  stage.style.setProperty("--stage-color", theme.color);
  stage.style.setProperty("--stage-accent", theme.accent);
  stage.style.setProperty("--stage-accent-soft", theme.accentSoft);
  if (stageNumber) stageNumber.textContent = theme.number;
  if (stageName) stageName.textContent = theme.name;
  if (stageKind) stageKind.textContent = theme.kind;
  if (stageComponentOne) stageComponentOne.textContent = theme.components[0].name;
  if (stageComponentTwo) stageComponentTwo.textContent = theme.components[1].name;
  if (stageComponentThree) stageComponentThree.textContent = theme.components[2].name;
  if (stageComponentLogoOne) stageComponentLogoOne.src = theme.components[0].logo;
  if (stageComponentLogoTwo) stageComponentLogoTwo.src = theme.components[1].logo;
  if (stageComponentLogoThree) stageComponentLogoThree.src = theme.components[2].logo;
  if (stageLogo) {
    stageLogo.src = theme.logo;
    stageLogo.alt = "Logo " + theme.name;
  }
  stage.classList.remove("is-switching");
  stage.dataset.activeProject = entry.dataset.project;
  window.requestAnimationFrame(() => stage.classList.add("is-switching"));
  window.clearTimeout(stageSwitchTimer);
  stageSwitchTimer = window.setTimeout(() => stage.classList.remove("is-switching"), 680);
};

const projectEntries = document.querySelectorAll(".project-entry");
if (projectEntries[0]) setActiveProject(projectEntries[0]);
if ("IntersectionObserver" in window) {
  const projectObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveProject(visible.target);
  }, { threshold: [0.35, 0.55, 0.75], rootMargin: "-18% 0px -25% 0px" });
  projectEntries.forEach((entry) => projectObserver.observe(entry));
} else {
  projectEntries.forEach((entry) => entry.classList.add("is-active"));
}

if (stage && projectScrollContainer) {
  let projectScrollFrame;
  const updateProjectScroll = () => {
    projectScrollFrame = undefined;
    const isWideLayout = window.matchMedia("(min-width: 901px)").matches;
    const entryPositions = [...projectEntries].map((entry) => entry.getBoundingClientRect().top);
    const viewportMarker = window.innerHeight * .44;
    const firstPosition = entryPositions[0] ?? 0;
    const finalPosition = entryPositions[entryPositions.length - 1] ?? firstPosition + 1;
    const journey = Math.max(1, finalPosition - firstPosition);
    const progress = isWideLayout ? Math.min(1, Math.max(0, (viewportMarker - firstPosition) / journey)) : 0;
    // Chaque quart de la traversée active un projet. Le dernier est donc atteint
    // de façon déterministe, même si l'observateur de visibilité se déclenche tard.
    const chapterIndex = Math.min(projectEntries.length - 1, Math.floor(progress * projectEntries.length));
    if (projectEntries[chapterIndex] && stage.dataset.activeProject !== projectEntries[chapterIndex].dataset.project) {
      setActiveProject(projectEntries[chapterIndex]);
    }
    stage.style.setProperty("--project-progress", progress.toFixed(3));
  };
  const requestProjectScrollUpdate = () => {
    if (!projectScrollFrame) projectScrollFrame = window.requestAnimationFrame(updateProjectScroll);
  };
  window.addEventListener("scroll", requestProjectScrollUpdate, { passive: true });
  window.addEventListener("resize", requestProjectScrollUpdate, { passive: true });
  requestProjectScrollUpdate();
}


form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    formStatus.textContent = "Complète les champs obligatoires avant de continuer.";
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    message: String(data.get("message") || "").trim()
  };
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formStatus.textContent = "Vérification du canal de contact…";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      formStatus.textContent = "Message transmis. Merci !";
      form.reset();
      return;
    }
    if (response.status === 429) {
      formStatus.textContent = "Trop de messages envoyés. Réessaie dans un moment.";
      return;
    }
  } catch {
    // GitHub Pages ne propose pas d’API : le repli mailto reste disponible.
  } finally {
    submitButton.disabled = false;
  }

  const fallbackKey = "mienthykaya-mailto-attempts";
  const now = Date.now();
  let storedAttempts = [];
  try {
    storedAttempts = JSON.parse(localStorage.getItem(fallbackKey) || "[]");
  } catch {
    localStorage.removeItem(fallbackKey);
  }
  const attempts = Array.isArray(storedAttempts)
    ? storedAttempts.filter((timestamp) => Number.isFinite(timestamp) && now - timestamp < fallbackMailWindowMs)
    : [];
  if (attempts.length >= fallbackMailLimit) {
    formStatus.textContent = "Limite locale atteinte : réessaie dans une heure.";
    return;
  }
  attempts.push(now);
  localStorage.setItem(fallbackKey, JSON.stringify(attempts));

  const subject = encodeURIComponent(`Nouveau projet — ${data.get("name")}`);
  const body = encodeURIComponent(`Nom : ${data.get("name")}\nE-mail : ${data.get("email")}\n\nProjet :\n${data.get("message")}`);
  formStatus.textContent = "Ouverture de ton application e-mail (repli sécurisé)…";
  window.location.href = `mailto:mienthykaya@gmail.com?subject=${subject}&body=${body}`;
});
