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

const setActiveProject = (entry) => {
  if (!entry) return;
  document.querySelectorAll(".project-entry").forEach((project) => {
    project.classList.toggle("is-active", project === entry);
  });
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
