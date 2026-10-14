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
const projectThemes = {
  bardeur: { number: "01", name: "BARDEUR YK", kind: "PWA sociale mobile", color: "#16334d", accent: "#4fe3ff" },
  exam: { number: "02", name: "MON EXAM", kind: "Préparation au BAC", color: "#2a1d43", accent: "#ffcc48" },
  fxpro: { number: "03", name: "FX PRO 2026", kind: "Prototype portefeuille", color: "#29251a", accent: "#f04b33" },
};

const setActiveProject = (entry) => {
  const theme = projectThemes[entry.dataset.project];
  if (!theme) return;
  document.querySelectorAll(".project-entry").forEach((project) => {
    project.classList.toggle("is-active", project === entry);
  });
  stage.style.setProperty("--stage-color", theme.color);
  stage.style.setProperty("--stage-accent", theme.accent);
  stageNumber.textContent = theme.number;
  stageName.textContent = theme.name;
  stageKind.textContent = theme.kind;
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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    formStatus.textContent = "Complète les champs obligatoires avant de continuer.";
    form.reportValidity();
    return;
  }
  const data = new FormData(form);
  const subject = encodeURIComponent(`Nouveau projet — ${data.get("name")}`);
  const body = encodeURIComponent(`Nom : ${data.get("name")}\nE-mail : ${data.get("email")}\n\nProjet :\n${data.get("message")}`);
  formStatus.textContent = "Ouverture de ton application e-mail…";
  window.location.href = `mailto:mienthykaya@gmail.com?subject=${subject}&body=${body}`;
});
