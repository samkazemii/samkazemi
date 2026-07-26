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


// V7 live control-room HUD: clock, camera rotation and animated tally labels.
const liveClock = document.getElementById('liveClock');
const programFeed = document.getElementById('programFeed');
const previewFeed = document.getElementById('previewFeed');
const cameraFeeds = ['CAM 1','CAM 2','CAM 3','CAM 4','REMOTE'];
let feedIndex = 0;
function updateLiveClock(){
  if (!liveClock) return;
  liveClock.textContent = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
}
updateLiveClock();
setInterval(updateLiveClock,1000);
setInterval(() => {
  feedIndex = (feedIndex + 1) % cameraFeeds.length;
  if (previewFeed) previewFeed.textContent = cameraFeeds[feedIndex];
  setTimeout(() => { if (programFeed) programFeed.textContent = cameraFeeds[feedIndex]; }, 650);
}, 3200);

// V8 Control Room Challenge — 30 second interactive mini-game.
(() => {
  const shell = document.getElementById('gameShell');
  const start = document.getElementById('gameStart');
  const buttons = [...document.querySelectorAll('.game-button')];
  const timerEl = document.getElementById('gameTimer');
  const statusEl = document.getElementById('gameStatus');
  const stepEl = document.getElementById('stepCount');
  const message = document.getElementById('programMessage');
  const sub = document.getElementById('programSub');
  const result = document.getElementById('gameResult');
  const resultKicker = document.getElementById('resultKicker');
  const resultTitle = document.getElementById('resultTitle');
  const resultEnglish = document.getElementById('resultEnglish');
  const resultPersian = document.getElementById('resultPersian');
  const again = document.getElementById('playAgain');
  if (!shell || !start) return;

  const sequence = [
    { action:'CAM1', cue:'TAKE CAMERA 1', sub:'Put Camera 1 on air.' },
    { action:'AUDIO', cue:'OPEN AUDIO', sub:'Bring the presenter microphone up.' },
    { action:'REMOTE', cue:'CONNECT REMOTE GUEST', sub:'The guest is ready on the remote line.' },
    { action:'PREVIEW', cue:'LOAD PREVIEW', sub:'Prepare the next source before transmission.' },
    { action:'LIVE', cue:'GO LIVE', sub:'Everything is ready. Take the broadcast live.' }
  ];
  let step = 0, seconds = 30, interval = null, active = false;

  const setControls = enabled => buttons.forEach(btn => btn.disabled = !enabled);
  const showCue = () => {
    const cue = sequence[step];
    message.textContent = cue.cue;
    sub.textContent = cue.sub;
    stepEl.textContent = step;
  };
  const resetVisuals = () => buttons.forEach(b => b.classList.remove('correct','wrong','hit'));

  function begin(){
    clearInterval(interval); step = 0; seconds = 30; active = true;
    shell.classList.remove('failed','won'); shell.classList.add('playing');
    result.classList.remove('show'); result.setAttribute('aria-hidden','true');
    timerEl.textContent = seconds; statusEl.textContent = 'ON AIR PREP'; start.hidden = true;
    setControls(true); resetVisuals(); showCue();
    interval = setInterval(() => {
      seconds -= 1; timerEl.textContent = seconds;
      if (seconds <= 0) finish(false, 'TIME EXPIRED');
    }, 1000);
  }

  function finish(won, reason=''){
    clearInterval(interval); active = false; setControls(false);
    shell.classList.remove('playing'); shell.classList.add(won ? 'won' : 'failed');
    statusEl.textContent = won ? 'BROADCAST SUCCESSFUL' : 'BROADCAST FAILED';
    message.textContent = won ? 'BROADCAST SUCCESSFUL' : reason || 'BROADCAST FAILED';
    sub.textContent = won ? 'Clean switch. Perfect timing.' : 'Reset the console and try again.';
    resultKicker.textContent = won ? 'ACCESS GRANTED' : 'SIGNAL LOST';
    resultTitle.textContent = won ? 'Broadcast Successful' : 'Broadcast Failed';
    resultEnglish.textContent = won ? 'You are now a good friend of Sam Kazemi.' : 'The show did not make it to air. Try once more.';
    resultPersian.textContent = won ? 'خب، تو الان دوست خوب سام هستی ❤️' : 'پخش انجام نشد؛ دوباره امتحان کن.';
    result.classList.add('show'); result.setAttribute('aria-hidden','false');
  }

  buttons.forEach(btn => btn.addEventListener('click', () => {
    if (!active) return;
    resetVisuals(); btn.classList.add('hit');
    const correct = btn.dataset.action === sequence[step].action;
    if (!correct) {
      btn.classList.add('wrong'); step = 0; stepEl.textContent = '0';
      message.textContent = 'WRONG CONTROL'; sub.textContent = 'Sequence reset. Start again with Camera 1.';
      setTimeout(showCue, 850); return;
    }
    btn.classList.add('correct'); step += 1; stepEl.textContent = step;
    if (step === sequence.length) return setTimeout(() => finish(true), 380);
    setTimeout(showCue, 320);
  }));

  start.addEventListener('click', begin);
  again.addEventListener('click', begin);
})();
