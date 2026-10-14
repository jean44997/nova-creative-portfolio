import React, { useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";

const h = React.createElement;
const skills = [
  { name: "JavaScript", kind: "Langage", color: "#f7df1e", icon: "https://cdn.simpleicons.org/javascript/F7DF1E", note: "Interactions, interfaces et logique web." },
  { name: "Java", kind: "Langage", color: "#f89820", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", note: "Services fiables et applications structurées." },
  { name: "C++", kind: "Langage", color: "#00599c", icon: "https://cdn.simpleicons.org/cplusplus/00599C", note: "Performance et logique de haut niveau." },
  { name: "PHP", kind: "Backend", color: "#777bb4", icon: "https://cdn.simpleicons.org/php/777BB4", note: "Backends web et intégrations serveur." },
  { name: "Python", kind: "Backend", color: "#3776ab", icon: "https://cdn.simpleicons.org/python/3776AB", note: "API FastAPI, automatisation et traitement de données." },
  { name: "React", kind: "Front-end", color: "#61dafb", icon: "https://cdn.simpleicons.org/react/61DAFB", note: "Interfaces modulaires, rapides et maintenables." },
  { name: "Angular", kind: "Front-end", color: "#dd0031", icon: "https://cdn.simpleicons.org/angular/DD0031", note: "Applications riches avec architecture solide." },
  { name: "Firebase", kind: "Cloud", color: "#ffca28", icon: "https://cdn.simpleicons.org/firebase/FFCA28", note: "Authentification, données et services temps réel." },
  { name: "Supabase", kind: "Cloud", color: "#3fcf8e", icon: "https://cdn.simpleicons.org/supabase/3FCF8E", note: "PostgreSQL, auth et API prêtes à l’emploi." },
  { name: "Vercel", kind: "Déploiement", color: "#ffffff", icon: "https://cdn.simpleicons.org/vercel/FFFFFF", note: "Déploiements front-end rapides et fiables." },
  { name: "Render", kind: "Déploiement", color: "#46e3b7", icon: "https://cdn.simpleicons.org/render/46E3B7", note: "Hébergement d’API, workers et services web." }
];

function SkillOrbit() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, rotation: 0 });
  const active = skills[activeIndex];

  const selectSkill = (index) => {
    setActiveIndex(index);
    setRotation(-(index * (360 / skills.length)));
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStart.current = { x: event.clientX, rotation };
    setDragging(true);
  };

  const onPointerMove = (event) => {
    if (!dragging) return;
    setRotation(dragStart.current.rotation + (event.clientX - dragStart.current.x) * 0.32);
  };

  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    selectSkill((activeIndex + direction + skills.length) % skills.length);
  };

  const nodes = skills.map((skill, index) => {
    const angle = index * (360 / skills.length);
    return h("button", {
      type: "button",
      key: skill.name,
      className: "orbit-node" + (activeIndex === index ? " is-active" : ""),
      style: { transform: "rotateY(" + angle + "deg) translateZ(var(--orbit-radius)) rotateY(" + -angle + "deg)" },
      onClick: () => selectSkill(index),
      "aria-pressed": activeIndex === index,
      "aria-label": "Afficher " + skill.name
    }, [
      h("img", { src: skill.icon, alt: "", key: "icon" }),
      h("span", { key: "name" }, skill.name)
    ]);
  });

  const pagination = skills.map((skill, index) => h("button", {
    type: "button",
    key: skill.name,
    className: activeIndex === index ? "is-active" : "",
    onClick: () => selectSkill(index),
    "aria-label": "Sélectionner " + skill.name,
    "aria-pressed": activeIndex === index
  }, [h("span", { key: "dot" }), skill.name]));

  return h("section", { className: "skill-orbit", "aria-label": "Compétences techniques en 3D" }, [
    h("div", { className: "skill-orbit-copy", key: "copy" }, [
      h("p", { className: "orbit-label", key: "label" }, "EXPLORE L’ARSENAL"),
      h("p", { key: "description" }, "Glisse le carrousel ou sélectionne une technologie. La 3D reste au service de la lecture.")
    ]),
    h("div", {
      className: "orbit-viewport" + (dragging ? " is-dragging" : ""),
      key: "viewport",
      onPointerDown,
      onPointerMove,
      onPointerUp: () => setDragging(false),
      onPointerCancel: () => setDragging(false),
      onKeyDown,
      role: "group",
      tabIndex: 0,
      "aria-label": "Carrousel de compétences. Utilise les flèches gauche et droite."
    }, [
      h("div", { className: "orbit-shadow", "aria-hidden": true, key: "shadow" }),
      h("div", { className: "orbit-scene", key: "scene", style: { transform: "rotateX(-8deg) rotateY(" + rotation + "deg)" } }, nodes),
      h("div", { className: "orbit-core", key: "core", style: { "--active-color": active.color } }, [
        h("img", { src: active.icon, alt: "", key: "icon" }),
        h("span", { key: "kind" }, active.kind),
        h("strong", { key: "name" }, active.name),
        h("p", { key: "note" }, active.note)
      ])
    ]),
    h("div", { className: "orbit-pagination", "aria-label": "Sélection rapide des compétences", key: "pagination" }, pagination)
  ]);
}

const mount = document.querySelector("#skills-3d-root");
const fallback = document.querySelector("#skills-3d-fallback");

if (mount) {
  createRoot(mount).render(h(SkillOrbit));
  if (fallback) fallback.hidden = true;
}
