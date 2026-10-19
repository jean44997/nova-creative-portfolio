(() => {
  const container = document.querySelector("#developer-lottie-player");
  const studio = document.querySelector(".hero-studio");
  const lottiePlayer = window.lottie || window.bodymovin;
  if (!container || !studio || !lottiePlayer) {
    studio?.classList.add("has-lottie-error");
    return;
  }

  const animation = lottiePlayer.loadAnimation({
    container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "assets/developer-at-work.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true
    }
  });

  let lastScrollY = window.scrollY;
  let animationFrame;
  const syncAnimation = () => {
    animationFrame = undefined;
    const bounds = studio.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    const direction = window.scrollY >= lastScrollY ? 1 : -1;
    lastScrollY = window.scrollY;
    animation.setSpeed(visible ? (direction > 0 ? 1.15 : .78) : .55);
  };
  const requestSync = () => {
    if (!animationFrame) animationFrame = window.requestAnimationFrame(syncAnimation);
  };

  animation.addEventListener("data_failed", () => studio.classList.add("has-lottie-error"));
  animation.addEventListener("DOMLoaded", () => studio.classList.add("has-lottie-loaded"));
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync, { passive: true });
  requestSync();
})();
