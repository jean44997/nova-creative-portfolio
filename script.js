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

const stage = document.querySelector(".project-stage");
const stageNumber = document.querySelector("[data-stage-number]");
const stageName = document.querySelector("[data-stage-name]");
const stageKind = document.querySelector("[data-stage-kind]");
const stageCode = document.querySelector("[data-stage-code]");
const stageLogo = document.querySelector("[data-stage-logo]");
const stageTagLeft = document.querySelector("[data-stage-tag-left]");
const stageTagRight = document.querySelector("[data-stage-tag-right]");
const projectThemes = {
  bardeur: {
    number: "01", name: "BARDEUR YK", kind: "Vidéos, lives et messagerie", code: "01 / SOCIAL PWA",
    color: "#24142d", accent: "#ff4a96", accentSoft: "#4fe3ff", leftTag: "REACT", rightTag: "SUPABASE",
    logo: "https://raw.githubusercontent.com/jean44997/bardeur2/main/src/assets/logo.png"
  },
  exam: {
    number: "02", name: "MON EXAM", kind: "Révision BAC, web & mobile", code: "02 / EDUCATION APP",
    color: "#17324b", accent: "#ffcc48", accentSoft: "#61dafb", leftTag: "EXPO", rightTag: "BAC 2026",
    logo: "https://raw.githubusercontent.com/jean44997/MON-EXAM/main/frontend/assets/images/icon.png"
  },
  fxpro: {
    number: "03", name: "FX PRO 2026", kind: "Portefeuille mobile sécurisé", code: "03 / FINTECH PROTOTYPE",
    color: "#132d27", accent: "#46e3b7", accentSoft: "#f7df1e", leftTag: "FIREBASE", rightTag: "QR PAY",
    logo: "https://raw.githubusercontent.com/jean44997/fx-pro/main/frontend/assets/images/icon.png"
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
  if (stageCode) stageCode.textContent = theme.code;
  if (stageTagLeft) stageTagLeft.textContent = theme.leftTag;
  if (stageTagRight) stageTagRight.textContent = theme.rightTag;
  if (stageLogo) {
    stageLogo.src = theme.logo;
    stageLogo.alt = "Logo " + theme.name;
  }
};

const projectEntries = document.querySelectorAll(".project-entry");
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

if (stage && finePointer.matches && !reduceMotion.matches) {
  stage.addEventListener("pointermove", (event) => {
    const bounds = stage.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * -6;
    stage.style.setProperty("--device-rotate-x", y + "deg");
    stage.style.setProperty("--device-rotate-y", x + "deg");
  });
  stage.addEventListener("pointerleave", () => {
    stage.style.removeProperty("--device-rotate-x");
    stage.style.removeProperty("--device-rotate-y");
  });
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
