import createGlobe from "https://esm.sh/cobe@2.0.1";

const canvas = document.querySelector("#skills-cobe");
const stage = document.querySelector("[data-skills-globe]");

if (canvas && stage) {
  try {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let phi = 0.65;
    let targetPhi = phi;
    let theta = 0.18;
    let dragging = false;
    let pointerX = 0;
    let globe;

    const size = () => {
      const bounds = canvas.getBoundingClientRect();
      return {
        width: Math.max(1, Math.round(bounds.width * pixelRatio)),
        height: Math.max(1, Math.round(bounds.height * pixelRatio)),
      };
    };

    const dimensions = size();
    globe = createGlobe(canvas, {
      ...dimensions,
      devicePixelRatio: pixelRatio,
      phi,
      theta,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 16000,
      mapBrightness: 4.5,
      mapBaseBrightness: 0.16,
      baseColor: [0.05, 0.06, 0.12],
      markerColor: [1, 0.29, 0.17],
      glowColor: [0.18, 0.72, 0.96],
      markers: [
        { location: [5.36, -4.01], size: 0.07, color: [1, 0.29, 0.17], id: "abidjan" },
        { location: [48.85, 2.35], size: 0.035, color: [0.3, 0.9, 1], id: "frontend" },
        { location: [37.77, -122.42], size: 0.035, color: [0.3, 0.9, 1], id: "cloud" },
        { location: [35.68, 139.69], size: 0.035, color: [1, 0.29, 0.17], id: "manga" },
      ],
      arcs: [
        { from: [5.36, -4.01], to: [48.85, 2.35], color: [0.3, 0.9, 1] },
        { from: [5.36, -4.01], to: [37.77, -122.42], color: [1, 0.29, 0.17] },
        { from: [5.36, -4.01], to: [35.68, 139.69], color: [1, 0.29, 0.17] },
      ],
      arcWidth: 0.45,
      arcHeight: 0.2,
      markerElevation: 0.035,
      onRender: (state) => {
        if (!dragging && !reducedMotion) targetPhi += 0.0024;
        phi += (targetPhi - phi) * 0.08;
        state.phi = phi;
        state.theta = theta;
      },
    });

    const resizeObserver = new ResizeObserver(() => globe?.update(size()));
    resizeObserver.observe(canvas);

    canvas.addEventListener("pointerdown", (event) => {
      dragging = true;
      pointerX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
      stage.classList.add("is-globe-dragging");
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      targetPhi += (event.clientX - pointerX) * 0.012;
      pointerX = event.clientX;
    });
    const releaseGlobe = (event) => {
      dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
      stage.classList.remove("is-globe-dragging");
    };
    canvas.addEventListener("pointerup", releaseGlobe);
    canvas.addEventListener("pointercancel", releaseGlobe);
    window.addEventListener("pagehide", () => {
      resizeObserver.disconnect();
      globe?.destroy();
    }, { once: true });
    stage.classList.add("has-globe");
  } catch (error) {
    stage.classList.add("has-globe-error");
    console.warn("Globe Cobe indisponible", error);
  }
}
