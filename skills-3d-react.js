import React, { useEffect, useMemo, useRef, useState } from "https://esm.sh/react@18.3.1";
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

const desktopSlots = [
  [5, 9], [24, 9], [43, 9], [62, 9], [81, 9],
  [5, 45], [24, 45], [43, 45], [62, 45], [81, 45], [43, 78]
];
const mobileSlots = [
  [6, 8], [38, 8], [70, 8], [6, 32], [38, 32], [70, 32],
  [6, 56], [38, 56], [70, 56], [22, 80], [54, 80]
];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function slotsForViewport() {
  return window.matchMedia("(max-width: 680px)").matches ? mobileSlots : desktopSlots;
}

function makePositions() {
  return slotsForViewport().map(([x, y]) => ({ x, y }));
}

function SkillWorkbench() {
  const boardRef = useRef(null);
  const dragRef = useRef(null);
  const [positions, setPositions] = useState(makePositions);
  const [activeIndex, setActiveIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const active = skills[activeIndex];

  useEffect(() => {
    const onResize = () => setPositions(makePositions());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const resetBoard = () => {
    setPositions(makePositions());
    setDraggedIndex(null);
  };

  const onPointerDown = (event, index) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    const board = boardRef.current;
    if (!board) return;
    board.setPointerCapture?.(event.pointerId);
    dragRef.current = { index, x: event.clientX, y: event.clientY, position: positions[index] };
    setActiveIndex(index);
    setDraggedIndex(index);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    const board = boardRef.current;
    if (!drag || !board) return;
    const bounds = board.getBoundingClientRect();
    const compact = bounds.width < 681;
    const next = {
      x: clamp(drag.position.x + ((event.clientX - drag.x) / bounds.width) * 100, 1, compact ? 76 : 87),
      y: clamp(drag.position.y + ((event.clientY - drag.y) / bounds.height) * 100, 1, compact ? 84 : 82)
    };
    setPositions((current) => current.map((position, index) => index === drag.index ? next : position));
  };

  const finishDrag = (event) => {
    if (!dragRef.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
    setDraggedIndex(null);
  };

  const tiles = useMemo(() => skills.map((skill, index) => {
    const position = positions[index];
    return h("button", {
      type: "button",
      key: skill.name,
      className: "skill-tile" + (activeIndex === index ? " is-active" : "") + (draggedIndex === index ? " is-dragging" : ""),
      style: { left: `${position.x}%`, top: `${position.y}%`, "--tile-color": skill.color, "--tile-tilt": `${((index % 5) - 2) * 1.7}deg` },
      onPointerDown: (event) => onPointerDown(event, index),
      onClick: () => setActiveIndex(index),
      "aria-pressed": activeIndex === index,
      "aria-label": `Déplacer ou sélectionner ${skill.name}`
    }, [
      h("span", { className: "skill-tile-glint", "aria-hidden": true, key: "glint" }),
      h("img", { src: skill.icon, alt: "", key: "icon" }),
      h("span", { key: "name" }, skill.name)
    ]);
  }), [positions, activeIndex, draggedIndex]);

  return h("section", { className: "skill-workbench", "aria-label": "Atelier interactif des compétences" }, [
    h("div", { className: "workbench-copy", key: "copy" }, [
      h("p", { className: "orbit-label", key: "label" }, "ATELIER 3D INTERACTIF"),
      h("h3", { key: "title" }, "Compose ton propre\narsenal."),
      h("p", { key: "description" }, "Prends une carte, déplace-la où tu veux, puis clique dessus pour lire son rôle. Rien n’est caché derrière une autre carte."),
      h("div", { className: "workbench-active", style: { "--active-color": active.color }, key: "active" }, [
        h("img", { src: active.icon, alt: "", key: "icon" }),
        h("div", { key: "text" }, [h("span", { key: "kind" }, active.kind), h("b", { key: "name" }, active.name), h("p", { key: "note" }, active.note)])
      ]),
      h("button", { type: "button", className: "workbench-reset", onClick: resetBoard, key: "reset" }, "Réorganiser les cartes ↺")
    ]),
    h("div", {
      className: "skill-board" + (draggedIndex !== null ? " is-grabbing" : ""),
      ref: boardRef,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      key: "board",
      "aria-label": "Plateau de cartes à déplacer"
    }, [
      h("div", { className: "board-grid", "aria-hidden": true, key: "grid" }),
      h("div", { className: "board-core", "aria-hidden": true, key: "core" }, [h("b", { key: "mark" }, "MK"), h("span", { key: "caption" }, "STACK\nCRAFT")]),
      h("p", { className: "board-hint", key: "hint" }, "GLISSE · ALIGNE · EXPLORE"),
      ...tiles
    ])
  ]);
}

const mount = document.querySelector("#skills-3d-root");
const fallback = document.querySelector("#skills-3d-fallback");

if (mount) {
  createRoot(mount).render(h(SkillWorkbench));
  if (fallback) fallback.hidden = true;
}
