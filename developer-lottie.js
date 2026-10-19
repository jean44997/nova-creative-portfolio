(() => {
  const container = document.querySelector("#developer-lottie-player");
  const studio = document.querySelector(".hero-studio");
  const lottiePlayer = window.lottie || window.bodymovin;
  if (!container || !studio || !lottiePlayer) {
    studio?.classList.add("has-lottie-error");
    return;
  }

  let animation;

  let lastScrollY = window.scrollY;
  let animationFrame;
  const syncAnimation = () => {
    animationFrame = undefined;
    if (!animation) return;
    const bounds = studio.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const direction = window.scrollY >= lastScrollY ? 1 : -1;
    lastScrollY = window.scrollY;
    animation.setSpeed(visible ? (direction > 0 ? 1.15 : .78) : .55);
  };
  const requestSync = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(syncAnimation);
  };

  const startAnimation = (animationData) => {
    // Les 420 dernières images du fichier fourni sont vides. On les retire avant le rendu
    // afin que la boucle reste continuellement visible.
    animationData.op = Math.min(Number(animationData.op) || 180, 180);
    animation = lottiePlayer.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true
      }
    });
    animation.addEventListener("data_failed", () => studio.classList.add("has-lottie-error"));
    animation.addEventListener("DOMLoaded", () => studio.classList.add("has-lottie-loaded"));
    requestSync();
  };

  fetch("assets/developer-at-work.json")
    .then((response) => response.ok ? response.json() : Promise.reject(new Error("Animation introuvable")))
    .then(startAnimation)
    .catch(() => studio.classList.add("has-lottie-error"));
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync, { passive: true });
  requestSync();
})();
