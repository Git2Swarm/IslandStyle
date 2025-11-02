const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.getElementById('site-nav');
const yearSpan = document.getElementById('current-year');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

const skipLinks = document.querySelectorAll('a[href^="#"]');
skipLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
