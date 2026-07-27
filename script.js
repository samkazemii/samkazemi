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

const loader = document.getElementById('bootLoader');
const bootStatus = document.getElementById('bootStatus');
const bootProgress = document.getElementById('bootProgress');
const bootPercent = document.getElementById('bootPercent');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (loader && !reduceMotion) {
  const steps = [[12,'INITIALIZING CONTROL ROOM...'],[38,'CONNECTING TO VMIX...'],[66,'CHECKING LIVE SOURCES...'],[88,'SYNCING BROADCAST GRAPHICS...'],[100,'ON AIR']];
  steps.forEach(([percent,text], index) => setTimeout(() => {
    bootStatus.textContent=text; bootProgress.style.width=percent+'%'; bootPercent.textContent=percent+'%';
    if(percent===100) setTimeout(()=>{loader.classList.add('done');document.body.classList.remove('is-loading')},450);
  }, index*430+180));
} else document.body.classList.remove('is-loading');

const heroStage=document.getElementById('heroPhotoStage');
const heroSection=document.querySelector('.hero-photo');
if(heroStage&&heroSection&&!reduceMotion){
  heroSection.addEventListener('pointermove',e=>{const r=heroSection.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;heroStage.style.transform=`translate3d(${x*-18}px,${y*-12}px,0) scale(1.065)`});
  heroSection.addEventListener('pointerleave',()=>heroStage.style.transform='translate3d(0,0,0) scale(1.055)');
}

const liveClock=document.getElementById('liveClock');
const programFeed=document.getElementById('programFeed');
const previewFeed=document.getElementById('previewFeed');
const cameraFeeds=['CAM 1','CAM 2','CAM 3','CAM 4','REMOTE'];let feedIndex=0;
function updateLiveClock(){if(liveClock)liveClock.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())}
updateLiveClock();setInterval(updateLiveClock,1000);
setInterval(()=>{feedIndex=(feedIndex+1)%cameraFeeds.length;if(previewFeed)previewFeed.textContent=cameraFeeds[feedIndex];setTimeout(()=>{if(programFeed)programFeed.textContent=cameraFeeds[feedIndex]},650)},3200);

// V9 Control Room Challenge: every console button launches a real mini-operation.
(() => {
  const shell=document.getElementById('gameShell');
  const start=document.getElementById('gameStart');
  const buttons=[...document.querySelectorAll('.game-button')];
  const sources=[...document.querySelectorAll('.source-monitor')];
  const timerEl=document.getElementById('gameTimer');
  const statusEl=document.getElementById('gameStatus');
  const stepEl=document.getElementById('stepCount');
  const message=document.getElementById('programMessage');
  const sub=document.getElementById('programSub');
  const taskTitle=document.getElementById('taskTitle');
  const taskText=document.getElementById('taskText');
  const taskAction=document.getElementById('taskAction');
  const programImage=document.getElementById('programImage');
  const programMonitor=document.getElementById('programMonitor');
  const liveBug=document.getElementById('liveBug');
  const log=document.getElementById('eventLog');
  const result=document.getElementById('gameResult');
  const resultKicker=document.getElementById('resultKicker');
  const resultTitle=document.getElementById('resultTitle');
  const resultEnglish=document.getElementById('resultEnglish');
  const resultPersian=document.getElementById('resultPersian');
  const again=document.getElementById('playAgain');
  if(!shell||!start)return;

  const feedFiles=['game-cam1.jpg','game-audio.jpg','game-remote.jpg','game-preview.jpg'];
  const operationArt={cam:'game-cam1.jpg',audio:'game-audio.jpg',remote:'game-remote.jpg',preview:'game-preview.jpg',live:'game-live.jpg',room:'game-control-room.jpg'};
  const sequence=['CAM1','AUDIO','REMOTE','PREVIEW','LIVE'];
  let step=0,seconds=30,interval=null,active=false,pending=false,selectedFeed=0,previewFeedIndex=1,remoteReady=false,audioReady=false;
  const setControls=enabled=>buttons.forEach((b,i)=>b.disabled=!enabled||pending||i!==step);
  const stamp=()=>String(30-seconds).padStart(2,'0');
  const addLog=text=>{const e=document.createElement('span');e.textContent=`00:${stamp()} — ${text}`;log.prepend(e);while(log.children.length>5)log.lastElementChild.remove()};
  const setProgram=(src,flash=true)=>{programImage.src=src;if(flash){programMonitor.classList.remove('feed-flash');void programMonitor.offsetWidth;programMonitor.classList.add('feed-flash')}};
  const clearTask=()=>{taskAction.innerHTML='<span class="standby-mark">AWAITING INPUT</span>'};
  const showStep=()=>{
    const labels=[['SELECT CAMERA','Press CAM 1, then choose one of the available camera sources.'],['MIX AUDIO','Press AUDIO, set the fader inside the green broadcast range, then confirm.'],['CONNECT GUEST','Press REMOTE, establish the guest link and wait for sync.'],['LOAD PREVIEW','Press PREVIEW, then choose the requested source for the preview bus.'],['TAKE THE SHOW LIVE','Press GO LIVE, arm transmission, then confirm the final take.']];
    taskTitle.textContent=labels[step][0];taskText.textContent=labels[step][1];message.textContent=labels[step][0];sub.textContent=labels[step][1];stepEl.textContent=step;clearTask();setControls(true);
  };
  const completeStep=(note)=>{pending=false;addLog(note);step++;stepEl.textContent=step;if(step===sequence.length){setTimeout(()=>finish(true),350);return}showStep()};
  const failStep=(reason)=>{pending=false;shell.classList.add('mistake');message.textContent='OPERATION ERROR';sub.textContent=reason;addLog('Error: '+reason);setTimeout(()=>shell.classList.remove('mistake'),450);setTimeout(showStep,700)};

  function begin(){
    clearInterval(interval);step=0;seconds=30;active=true;pending=false;selectedFeed=0;previewFeedIndex=1;remoteReady=false;audioReady=false;
    shell.classList.remove('failed','won','mistake');shell.classList.add('playing');result.classList.remove('show');result.setAttribute('aria-hidden','true');liveBug.classList.remove('show');
    timerEl.textContent=seconds;statusEl.textContent='ON AIR PREP';start.hidden=true;log.innerHTML='<span>00:00 — Broadcast challenge started.</span>';setProgram(feedFiles[0],false);showStep();
    interval=setInterval(()=>{seconds--;timerEl.textContent=seconds;if(seconds<=10)shell.classList.add('urgent');if(seconds<=0)finish(false,'TIME EXPIRED')},1000);
  }
  function finish(won,reason=''){
    clearInterval(interval);active=false;pending=false;buttons.forEach(b=>b.disabled=true);sources.forEach(s=>s.disabled=true);shell.classList.remove('playing','urgent');shell.classList.add(won?'won':'failed');
    statusEl.textContent=won?'BROADCAST SUCCESSFUL':'BROADCAST FAILED';message.textContent=won?'BROADCAST SUCCESSFUL':reason||'BROADCAST FAILED';sub.textContent=won?'Clean switch. Perfect timing.':'Reset the console and try again.';if(won)liveBug.classList.add('show');
    resultKicker.textContent=won?'ACCESS GRANTED':'SIGNAL LOST';resultTitle.textContent=won?'Broadcast Successful':'Broadcast Failed';resultEnglish.textContent=won?'You are now a good friend of Sam Kazemi.':'The show did not make it to air. Try once more.';resultPersian.textContent=won?'خب، تو الان دوست خوب سام هستی ❤️':'پخش انجام نشد؛ دوباره امتحان کن.';result.classList.add('show');result.setAttribute('aria-hidden','false');
  }

  function cameraOperation(){
    pending=true;setControls(false);const order=[0,1,2,3].sort(()=>Math.random()-.5);selectedFeed=order[0];taskTitle.textContent='CHOOSE A CAMERA';taskText.textContent='Pick any source. The selected shot will immediately appear on the program monitor.';taskAction.innerHTML=`<div class="operation-visual"><img src="${operationArt.cam}" alt="Broadcast camera ready"><div><b>CAMERA ROUTING</b><span>Select one of the source monitors above.</span></div></div>`;sources.forEach(s=>s.disabled=false);message.textContent='CAMERA ROUTING';sub.textContent='Select a source from the monitor wall.';
    sources.forEach((s,i)=>s.classList.toggle('recommended',i===selectedFeed));
  }
  sources.forEach((source,index)=>source.addEventListener('click',()=>{
    if(!active||!pending||step!==0)return;sources.forEach(s=>{s.disabled=true;s.classList.remove('recommended')});setProgram(feedFiles[index]);taskAction.innerHTML='<span class="operation-ok">SOURCE TAKEN</span>';completeStep(`Camera ${index+1} taken to program.`)
  }));

  function audioOperation(){
    pending=true;setControls(false);taskTitle.textContent='SET AUDIO LEVEL';taskText.textContent='Move the fader into the green zone (62–78), then lock the level.';taskAction.innerHTML=`<div class="operation-split"><img class="operation-image" src="${operationArt.audio}" alt="Broadcast audio mixer"><div class="audio-task"><input id="audioFader" type="range" min="0" max="100" value="30" aria-label="Audio level"><output id="audioValue">30</output><button type="button" id="lockAudio">LOCK LEVEL</button></div></div>`;
    const f=taskAction.querySelector('#audioFader'),o=taskAction.querySelector('#audioValue'),lock=taskAction.querySelector('#lockAudio');f.addEventListener('input',()=>{o.value=f.value;o.textContent=f.value;programMonitor.style.setProperty('--audio-level',f.value+'%')});lock.addEventListener('click',()=>{const v=Number(f.value);if(v>=62&&v<=78){audioReady=true;taskAction.innerHTML='<span class="operation-ok">AUDIO CLEAN</span>';completeStep(`Audio locked at ${v}%.`)}else failStep('Audio level must be inside the green zone.')});
  }
  function remoteOperation(){
    pending=true;setControls(false);taskTitle.textContent='REMOTE GUEST LINK';taskText.textContent='Connect the guest and wait for video, audio and return-feed sync.';taskAction.innerHTML=`<div class="operation-split"><img class="operation-image" src="${operationArt.remote}" alt="Remote guest connection"><div class="remote-actions"><button class="connect-guest" id="connectGuest" type="button">CONNECT GUEST</button><div class="sync-state" id="syncState">OFFLINE</div></div></div>`;
    const c=taskAction.querySelector('#connectGuest'),state=taskAction.querySelector('#syncState');c.addEventListener('click',()=>{c.disabled=true;state.textContent='HANDSHAKE…';message.textContent='CONNECTING REMOTE';let pct=0;const t=setInterval(()=>{pct+=25;state.textContent=`SYNC ${pct}%`;if(pct>=100){clearInterval(t);remoteReady=true;state.textContent='GUEST CONNECTED';setProgram(feedFiles[2]);completeStep('Remote guest connected and synchronized.')}},170)});
  }
  function previewOperation(){
    pending=true;setControls(false);previewFeedIndex=Math.floor(Math.random()*4);taskTitle.textContent='BUILD PREVIEW';taskText.textContent=`Load SOURCE ${previewFeedIndex+1} into preview before transmission.`;taskAction.innerHTML='<div class="preview-choices">'+feedFiles.map((src,i)=>`<button type="button" data-preview="${i}"><img src="${src}" alt="Source ${i+1}"><span>SOURCE ${i+1}</span></button>`).join('')+'</div>';taskAction.querySelectorAll('[data-preview]').forEach(btn=>btn.addEventListener('click',()=>{const i=Number(btn.dataset.preview);if(i!==previewFeedIndex){failStep('That is not the requested preview source.');return}setProgram(feedFiles[i]);taskAction.innerHTML='<span class="operation-ok">PREVIEW READY</span>';completeStep(`Source ${i+1} loaded in preview.`)}));
  }
  function liveOperation(){
    pending=true;setControls(false);taskTitle.textContent='FINAL TAKE';taskText.textContent='Arm transmission, then take the show live.';taskAction.innerHTML=`<div class="operation-split"><img class="operation-image" src="${operationArt.live}" alt="On air broadcast sign"><div class="live-confirm"><button type="button" id="armLive">ARM TRANSMISSION</button><button type="button" id="takeLive" disabled>TAKE LIVE</button></div></div>`;const arm=taskAction.querySelector('#armLive'),take=taskAction.querySelector('#takeLive');arm.addEventListener('click',()=>{arm.classList.add('armed');arm.textContent='ARMED';take.disabled=false;message.textContent='TRANSMISSION ARMED';sub.textContent='Final confirmation required.'});take.addEventListener('click',()=>{liveBug.classList.add('show');completeStep('Broadcast taken live.')});
  }
  const operations={CAM1:cameraOperation,AUDIO:audioOperation,REMOTE:remoteOperation,PREVIEW:previewOperation,LIVE:liveOperation};
  buttons.forEach(btn=>btn.addEventListener('click',()=>{if(!active||pending)return;btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),180);const expected=sequence[step];if(btn.dataset.action!==expected){failStep('Wrong console control. Follow the current operation.');return}operations[expected]()}));
  start.addEventListener('click',begin);again.addEventListener('click',begin);
})();


// V15 Sound Pad — reliable physical-key support across English/Persian keyboard layouts.
(() => {
  const pads=[...document.querySelectorAll('.note-pad')];
  const display=document.querySelector('.sound-pad-display');
  const noteOut=document.getElementById('soundPadNote');
  const status=document.getElementById('soundPadStatus');
  const toggle=document.getElementById('soundKeyboardToggle');
  const toggleText=document.getElementById('soundKeyboardToggleText');
  const help=document.getElementById('soundPadHelp');
  if(!pads.length||!display||!noteOut)return;

  let audioCtx=null;
  let keyboardMode=false;
  const keyMap=new Map(pads.map(p=>[String(p.dataset.key||'').toLowerCase(),p]));
  const codeMap=new Map(pads.map(p=>[`Key${String(p.dataset.key||'').toUpperCase()}`,p]));

  async function context(){
    if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended'){
      try{await audioCtx.resume();}catch{}
    }
    return audioCtx;
  }

  async function play(pad){
    if(!pad)return;
    const ctx=await context();
    const now=ctx.currentTime;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();
    osc.type='triangle';
    osc.frequency.setValueAtTime(Number(pad.dataset.frequency),now);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(1800,now);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(.28,now+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,now+.55);
    osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
    osc.start(now);osc.stop(now+.58);

    const color=getComputedStyle(pad).getPropertyValue('--pad').trim();
    display.style.setProperty('--pad-color',color);
    display.style.setProperty('--pad-glow',color);
    noteOut.textContent=pad.dataset.note;
    if(status)status.textContent=`PLAYING ${pad.dataset.note}`;
    pad.classList.add('active');display.classList.add('playing');
    clearTimeout(pad._releaseTimer);
    pad._releaseTimer=setTimeout(()=>{
      pad.classList.remove('active');
      display.classList.remove('playing');
      if(status)status.textContent=keyboardMode?'KEYBOARD READY':'READY';
    },180);
  }

  pads.forEach(pad=>{
    pad.addEventListener('pointerdown',e=>{e.preventDefault();play(pad);});
    pad.addEventListener('click',()=>play(pad));
  });

  function setKeyboardMode(enabled){
    keyboardMode=Boolean(enabled);
    toggle?.setAttribute('aria-pressed',String(keyboardMode));
    toggle?.classList.toggle('active',keyboardMode);
    if(toggleText)toggleText.textContent=keyboardMode?'KEYBOARD MODE ON':'KEYBOARD MODE OFF';
    if(status)status.textContent=keyboardMode?'KEYBOARD READY':'READY';
    if(help)help.textContent=keyboardMode
      ? 'Physical keys A–J are active—even when your keyboard language is Persian. Press this button again to turn them off.'
      : 'Keyboard notes are disabled by default. Turn on Keyboard Mode only when you want to play.';
  }

  toggle?.addEventListener('click',()=>{
    setKeyboardMode(!keyboardMode);
    toggle.blur();
    if(keyboardMode)context();
  });
  setKeyboardMode(false);

  // Capture phase prevents other page shortcuts from swallowing piano keys.
  window.addEventListener('keydown',e=>{
    const target=e.target;
    const typing=target instanceof HTMLElement &&
      (target.matches('input, textarea, select, [contenteditable="true"]')||target.isContentEditable);
    if(!keyboardMode||typing||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;
    const pad=codeMap.get(e.code)||keyMap.get(String(e.key||'').toLowerCase());
    if(!pad)return;
    e.preventDefault();
    e.stopPropagation();
    play(pad);
  },true);
})();

// V12 live director challenge — reusable inputs + manual shot designer
(()=>{
  const root=document.getElementById('vmixConsole'); if(!root)return;
  const $=id=>document.getElementById(id);
  const inputs=[...root.querySelectorAll('.vmix-input')];
  const transitions=[...root.querySelectorAll('[data-transition]')];
  const templateButtons=[...root.querySelectorAll('[data-template]')];
  const startBtn=$('vmixStart'), clock=$('vmixClock'), step=$('vmixStep');
  const upload=$('vmixUpload'), uploadName=$('uploadName'), uploadPreview=$('uploadPreview'), uploadCard=$('vmixUploadCard');
  const record=$('vmixRecord'), reset=$('vmixReset'), resetShot=$('vmixResetShot');
  const previewHost=$('vmixPreviewHost'), programHost=$('vmixProgramHost'), previewPicture=$('vmixPreviewPicture'), programPicture=$('vmixProgramPicture');
  const previewName=$('vmixPreviewName'), programName=$('vmixProgramName'), status=$('vmixStatus'), success=$('vmixSuccess'), successText=$('vmixSuccessText'), recordTime=$('vmixRecordTime');
  const programScreen=$('vmixProgramScreen');
  const fit=$('shotFit'), zoom=$('shotZoom'), xPos=$('shotX'), yPos=$('shotY'), title=$('shotTitle'), overlay=$('shotOverlay');
  const zoomOut=$('shotZoomOut'), xOut=$('shotXOut'), yOut=$('shotYOut');

  let running=false,timeLeft=120,challengeTimer=null,recordTimer=null,recordSeconds=0,recording=false;
  let selected=null,previewSource=null,previewDesign=null,uploadedSource=null,uploadedUrl=null,finished=false,busy=false,switchCount=0;
  const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  const play=v=>{const p=v.play();if(p&&p.catch)p.catch(()=>{});};
  const defaultDesign=()=>({template:'clean',fit:'contain',zoom:100,x:0,y:0,title:'LIVE',overlay:false});
  const currentDesign=()=>({template:templateButtons.find(b=>b.classList.contains('active'))?.dataset.template||'clean',fit:fit.value,zoom:+zoom.value,x:+xPos.value,y:+yPos.value,title:title.value.trim()||'LIVE',overlay:overlay.checked});

  function createMedia(source){
    const el=document.createElement(source.type==='video'?'video':'img');
    el.src=source.src; el.alt=source.name;
    if(source.type==='video'){el.muted=true;el.loop=true;el.autoplay=true;el.playsInline=true;el.preload='auto';}
    el.addEventListener('error',()=>setStatus('THIS FILE CANNOT PLAY IN THE BROWSER — TRY MP4, WEBM, JPG OR PNG','MEDIA ERROR'));
    if(source.type==='video')el.addEventListener('canplay',()=>play(el),{once:true});
    return el;
  }
  function render(host,source,design){
    host.innerHTML='';
    if(!source){host.innerHTML='<span class="screen-empty">EMPTY</span>';return;}
    const wrap=document.createElement('div'); wrap.className='shot-stage';
    const el=createMedia(source); el.className='shot-media';
    el.style.objectFit=design.fit;
    el.style.transform=`translate(${design.x}%, ${design.y}%) scale(${design.zoom/100})`;
    wrap.appendChild(el);
    if(design.overlay){
      const gfx=document.createElement('div'); gfx.className=`custom-gfx gfx-${design.template}`;
      gfx.innerHTML=`<b>${escapeHtml(design.title)}</b><small>${templateLabel(design.template)}</small>`;
      wrap.appendChild(gfx);
    }
    host.appendChild(wrap); if(source.type==='video')play(el);
  }
  function escapeHtml(str){return str.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function templateLabel(t){return ({clean:'CLEAN FEED','lower-third':'LOWER THIRD','news':'BREAKING NEWS','gaming':'GAMING LIVE','interview':'INTERVIEW','cinema':'CINEMA'}[t]||'LIVE');}
  function setStatus(text,stage){status.textContent=text;step.textContent=stage||text;}
  function enableTransitions(on){transitions.forEach(b=>b.disabled=!on);}
  function updateDesignerOutputs(){zoomOut.value=`${zoom.value}%`;xOut.value=xPos.value;yOut.value=yPos.value;}
  function syncPreview(){if(!previewSource)return;previewDesign=currentDesign();render(previewHost,previewSource,previewDesign);previewName.textContent=previewSource.name;}

  function begin(){
    if(running)return;running=true;finished=false;busy=false;timeLeft=120;clock.textContent='02:00';
    root.classList.remove('danger','failed');success.classList.remove('show');startBtn.disabled=true;
    inputs.forEach(b=>b.disabled=false);upload.disabled=false;
    setStatus('CHOOSE ANY INPUT — IT WILL OPEN IN PREVIEW','SELECT INPUT');
    challengeTimer=setInterval(()=>{timeLeft--;clock.textContent=fmt(timeLeft);if(timeLeft<=30)root.classList.add('danger');if(timeLeft===60)setStatus('ONE MINUTE LEFT — KEEP SWITCHING','60 SECONDS');if(timeLeft===10)setStatus('TEN SECONDS — FINAL SWITCH!','FINAL 10');if(timeLeft<=0)finishChallenge();},1000);
  }
  function choose(source,button){
    if(!running||finished||busy)return;
    selected={...source};previewSource={...source};previewDesign=currentDesign();
    inputs.forEach(b=>b.classList.toggle('active',b===button));uploadCard.classList.toggle('active',!button&&source===uploadedSource);
    render(previewHost,previewSource,previewDesign);previewName.textContent=previewSource.name;
    record.disabled=false;
    if(recording){enableTransitions(true);setStatus('NEW INPUT IN PREVIEW — CUT, FADE OR MERGE','READY TO SWITCH');}
    else setStatus('INPUT READY IN PREVIEW — START RECORD','START RECORD');
  }
  inputs.forEach(b=>b.addEventListener('click',()=>choose({name:b.dataset.name,type:b.dataset.type,src:b.dataset.src},b)));

  upload.addEventListener('change',()=>{
    const file=upload.files?.[0]; if(!file)return;
    const ext=(file.name.split('.').pop()||'').toLowerCase();
    const isVideo=file.type.startsWith('video/')||['mp4','webm','ogg','mov','m4v'].includes(ext);
    const isImage=file.type.startsWith('image/')||['jpg','jpeg','png','gif','webp'].includes(ext);
    if(!isVideo&&!isImage){setStatus('UNSUPPORTED FILE — USE MP4, WEBM, JPG OR PNG','UPLOAD ERROR');upload.value='';return;}
    if(file.size>250*1024*1024){setStatus('FILE TOO LARGE — MAX 250 MB','UPLOAD ERROR');upload.value='';return;}
    if(uploadedUrl)URL.revokeObjectURL(uploadedUrl);uploadedUrl=URL.createObjectURL(file);
    uploadedSource={name:file.name.replace(/\.[^.]+$/,'').toUpperCase().slice(0,24),type:isVideo?'video':'image',src:uploadedUrl};
    uploadName.textContent=file.name.length>26?file.name.slice(0,23)+'…':file.name;
    uploadPreview.innerHTML=''; const thumb=createMedia(uploadedSource); uploadPreview.appendChild(thumb); if(isVideo)play(thumb);
    choose(uploadedSource,null);
  });
  uploadCard.addEventListener('click',e=>{
    if(e.target===upload||!uploadedSource||!running)return;
    e.preventDefault();choose(uploadedSource,null);
  });

  [fit,zoom,xPos,yPos,title,overlay].forEach(control=>{
    control.addEventListener(control===title?'input':'change',()=>{updateDesignerOutputs();syncPreview();});
    if(control.type==='range')control.addEventListener('input',()=>{updateDesignerOutputs();syncPreview();});
  });
  templateButtons.forEach(btn=>btn.addEventListener('click',()=>{
    templateButtons.forEach(b=>b.classList.toggle('active',b===btn));
    overlay.checked=btn.dataset.template!=='clean';syncPreview();
  }));
  resetShot.addEventListener('click',()=>{
    const d=defaultDesign();fit.value=d.fit;zoom.value=d.zoom;xPos.value=d.x;yPos.value=d.y;title.value=d.title;overlay.checked=d.overlay;
    templateButtons.forEach(b=>b.classList.toggle('active',b.dataset.template==='clean'));updateDesignerOutputs();syncPreview();
  });

  record.addEventListener('click',()=>{
    if(!previewSource||finished||busy)return;recording=!recording;record.classList.toggle('recording',recording);record.querySelector('span').textContent=recording?'RECORDING':'START RECORD';
    if(recording){enableTransitions(true);setStatus('RECORDING — CHOOSE A TRANSITION','CUT · FADE · MERGE');recordTimer=setInterval(()=>{recordSeconds++;recordTime.textContent=fmt(recordSeconds)},1000);}
    else{clearInterval(recordTimer);recordTimer=null;enableTransitions(false);setStatus('RECORD STOPPED','START RECORD');}
  });
  function takeLive(type){
    if(!recording||!previewSource||finished||busy)return;busy=true;enableTransitions(false);
    const labels={cut:'CUT',fade:'FADE',merge:'MERGE'};const liveSource={...previewSource},liveDesign={...previewDesign};
    setStatus(`${labels[type]} TO PROGRAM…`,'TAKING LIVE');
    programScreen.classList.remove('transition-cut','transition-fade','transition-merge');programScreen.classList.add(`transition-${type}`);
    const delay=type==='cut'?40:type==='fade'?650:850;
    setTimeout(()=>{
      render(programHost,liveSource,liveDesign);programName.textContent=liveSource.name;programScreen.classList.add('on-air');switchCount++;
      success.classList.add('show');successText.textContent=`${labels[type]} complete · Switch ${switchCount} · ${fmt(timeLeft)} left`;
      busy=false;enableTransitions(true);setStatus(`${labels[type]} COMPLETE — SELECT ANOTHER INPUT`,'ON AIR · KEEP SWITCHING');
      setTimeout(()=>{programScreen.classList.remove(`transition-${type}`);success.classList.remove('show');},900);
    },delay);
  }
  transitions.forEach(b=>b.addEventListener('click',()=>takeLive(b.dataset.transition)));
  function finishChallenge(){finished=true;running=false;busy=false;clearInterval(challengeTimer);clearInterval(recordTimer);clock.textContent='00:00';record.disabled=true;enableTransitions(false);root.classList.remove('danger');success.classList.add('show');successText.textContent=switchCount?`TIME! ${switchCount} successful switch${switchCount===1?'':'es'}.`:'TIME! No source was taken to Program.';setStatus(switchCount?'CHALLENGE COMPLETE — GREAT SWITCHING':'TIME EXPIRED — RESET AND TRY AGAIN',switchCount?'DIRECTOR TEST COMPLETE':'OFF AIR · FAILED');if(!switchCount)root.classList.add('failed');}
  function resetAll(){
    clearInterval(challengeTimer);clearInterval(recordTimer);running=false;finished=false;busy=false;recording=false;timeLeft=120;recordSeconds=0;selected=null;previewSource=null;previewDesign=defaultDesign();switchCount=0;
    root.classList.remove('danger','failed');startBtn.disabled=false;clock.textContent='02:00';recordTime.textContent='00:00';record.classList.remove('recording');record.querySelector('span').textContent='START RECORD';record.disabled=true;enableTransitions(false);success.classList.remove('show');programScreen.classList.remove('on-air','transition-cut','transition-fade','transition-merge');
    inputs.forEach(b=>{b.classList.remove('active');b.disabled=true});upload.disabled=true;uploadCard.classList.remove('active');previewName.textContent='EMPTY';programName.textContent='STANDBY';previewHost.innerHTML='<span class="screen-empty">SELECT MEDIA</span>';programHost.innerHTML='<span class="screen-empty">OFF AIR</span>';setStatus('PRESS START TO BEGIN','PRESS START');resetShot.click();
  }
  startBtn.addEventListener('click',begin);reset.addEventListener('click',resetAll);window.addEventListener('beforeunload',()=>{if(uploadedUrl)URL.revokeObjectURL(uploadedUrl)});updateDesignerOutputs();resetAll();
})();
