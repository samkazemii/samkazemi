
const header = document.querySelector('.site-header');
const glow = document.getElementById('cursorGlow');
const reveals = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

window.addEventListener('pointermove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

reveals.forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

// Subtle cinematic parallax for the control-room hero.
const heroStage = document.getElementById('heroPhotoStage');
const heroSection = document.querySelector('.hero-photo');
if (heroStage && heroSection && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  heroSection.addEventListener('pointermove', (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroStage.style.transform = `translate3d(${x * -18}px, ${y * -12}px, 0) scale(1.065)`;
  });
  heroSection.addEventListener('pointerleave', () => {
    heroStage.style.transform = 'translate3d(0,0,0) scale(1.055)';
  });
  window.addEventListener('scroll', () => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom > 0) {
      const shift = Math.min(window.scrollY * 0.08, 42);
      heroStage.style.marginTop = `${shift}px`;
    }
  }, { passive: true });
}
