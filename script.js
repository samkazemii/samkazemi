const header = document.querySelector('.site-header');
const glow = document.getElementById('cursorGlow');
const reveals = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 20), { passive:true });
window.addEventListener('pointermove', (e) => {
  if (!glow) return;
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    if (entry.target.classList.contains('skill-card')) {
      const ring = entry.target.querySelector('.skill-ring');
      const value = Number(entry.target.dataset.value || 0);
      requestAnimationFrame(() => ring?.style.setProperty('--p', value));
    }
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });
reveals.forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

// Cinematic boot sequence.
const loader = document.getElementById('bootLoader');
const bootStatus = document.getElementById('bootStatus');
const bootProgress = document.getElementById('bootProgress');
const bootPercent = document.getElementById('bootPercent');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (loader && !reduceMotion) {
  const steps = [
    [12, 'INITIALIZING CONTROL ROOM...'],
    [38, 'CONNECTING TO VMIX...'],
    [66, 'CHECKING LIVE SOURCES...'],
    [88, 'SYNCING BROADCAST GRAPHICS...'],
    [100, 'ON AIR']
  ];
  steps.forEach(([percent, text], index) => {
    setTimeout(() => {
      bootStatus.textContent = text;
      bootProgress.style.width = percent + '%';
      bootPercent.textContent = percent + '%';
      if (percent === 100) setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
      }, 450);
    }, index * 430 + 180);
  });
} else {
  document.body.classList.remove('is-loading');
}

// Subtle cinematic parallax for the control-room hero.
const heroStage = document.getElementById('heroPhotoStage');
const heroSection = document.querySelector('.hero-photo');
if (heroStage && heroSection && !reduceMotion) {
  heroSection.addEventListener('pointermove', (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroStage.style.transform = `translate3d(${x * -18}px, ${y * -12}px, 0) scale(1.065)`;
  });
  heroSection.addEventListener('pointerleave', () => heroStage.style.transform = 'translate3d(0,0,0) scale(1.055)');
  window.addEventListener('scroll', () => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom > 0) heroStage.style.marginTop = `${Math.min(window.scrollY * 0.08, 42)}px`;
  }, { passive: true });
}

// Extra mobile motion: subtle scroll parallax without requiring a mouse.
if (heroStage && heroSection && window.matchMedia('(max-width: 900px)').matches) {
  window.addEventListener('scroll', () => {
    const rect = heroSection.getBoundingClientRect();
    if (rect.bottom <= 0) return;
    const offset = Math.max(-18, Math.min(18, -rect.top * 0.035));
    heroStage.style.setProperty('--mobile-scroll-y', `${offset}px`);
  }, { passive: true });
}
