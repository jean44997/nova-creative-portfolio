(() => {
  const container = document.querySelector("#phone-mockup-player");
  const stage = document.querySelector(".project-stage");
  const lottiePlayer = window.lottie || window.bodymovin;
  if (!container || !stage || !lottiePlayer) {
    stage?.classList.add("has-phone-frame-error");
    return;
  }

  const animation = lottiePlayer.loadAnimation({
    container,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "assets/iphone-dynamic-island-mockup.json",
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
      progressiveLoad: true
    }
  });

  animation.addEventListener("DOMLoaded", () => stage.classList.add("has-phone-frame-loaded"));
  animation.addEventListener("data_failed", () => stage.classList.add("has-phone-frame-error"));
})();
