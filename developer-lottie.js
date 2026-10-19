(() => {
  const container = document.querySelector("#developer-lottie-player");
  const studio = document.querySelector(".hero-studio");
  const lottiePlayer = window.lottie || window.bodymovin;
  const animationData = window.DEVELOPER_LOTTIE_DATA;
  if (!container || !studio || !lottiePlayer || !animationData) {
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
  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", requestSync, { passive: true });
  requestSync();
})();
