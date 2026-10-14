const root = document.documentElement;
const progress = document.querySelector('.scroll-progress span');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const status = document.querySelector('#form-status');

document.querySelector('#year').textContent = new Date().getFullYear();

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${scrollable ? (window.scrollY / scrollable) * 100 : 0}%`;
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.querySelector('.cursor-glow');
  window.addEventListener('pointermove', ({ clientX, clientY }) => {
    cursor.style.left = `${clientX}px`;
    cursor.style.top = `${clientY}px`;
  }, { passive: true });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => {
  element.style.setProperty('--reveal-delay', `${element.dataset.delay || 0}ms`);
  observer.observe(element);
});

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('is-open', !expanded);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));

if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
      const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const rotateY = ((event.clientX - box.left) / box.width - .5) * 5;
      const rotateX = -((event.clientY - box.top) / box.height - .5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

document.querySelector('.contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    status.textContent = 'Veuillez compléter les champs obligatoires.';
    form.reportValidity();
    return;
  }
  status.textContent = 'Merci ! Connectez ce formulaire à votre boîte e-mail pour recevoir les messages.';
  form.reset();
});
