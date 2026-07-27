(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const config = window.SAM_COMMUNITY_CONFIG || {};
  const state = { user:null, messages:[], reply:null, files:[], recorder:null, chunks:[], backend:false };
  const i18n = {
    en:{hub:'COMMUNITY HUB',live:'LIVE',designed:'Designed by Sam Kazemi',previewMode:'PREVIEW MODE',online:'online',joinTitle:'Join the control-room community',joinText:'Ask a production question, share a screenshot, and help other creators.',displayName:'Display name',email:'Email',notifyConsent:'Email me when someone replies to my message',enterHub:'ENTER HUB',onlineNow:'ONLINE NOW',host:'Host',newLine:'new line',localNote:'Messages are saved on this device in preview mode.',reply:'REPLY',replying:'Replying to',aiNeeds:'AI mode needs a secure server connection. The interface is ready, but no private API key is stored in this public website.',nameError:'Please enter your name.',emailError:'Please enter a valid email.',fileLarge:'This file is too large.',voiceDenied:'Microphone access was not available.',welcome:'Welcome to the Community Hub. Share a question or screenshot — keep private workplace details out of uploads.',sample:'Does anyone know the cleanest way to route a remote guest into a separate vMix audio bus?',answer:'Use a dedicated input bus, disable Master where needed, then monitor the return to avoid echo.'},
    fa:{hub:'مرکز گفتگو',live:'زنده',designed:'طراحی‌شده توسط سام کاظمی',previewMode:'حالت پیش‌نمایش',online:'آنلاین',joinTitle:'وارد انجمن اتاق فرمان شوید',joinText:'سؤال فنی بپرسید، اسکرین‌شات بفرستید و به دیگران کمک کنید.',displayName:'نام نمایشی',email:'ایمیل',notifyConsent:'اگر کسی پاسخ داد، با ایمیل به من اطلاع بده',enterHub:'ورود به انجمن',onlineNow:'افراد آنلاین',host:'میزبان',newLine:'خط جدید',localNote:'در حالت پیش‌نمایش، پیام‌ها روی همین دستگاه ذخیره می‌شوند.',reply:'پاسخ',replying:'پاسخ به',aiNeeds:'حالت هوش مصنوعی به اتصال امن سرور نیاز دارد. رابط آماده است، اما کلید خصوصی API داخل سایت عمومی قرار نگرفته است.',nameError:'لطفاً نامتان را وارد کنید.',emailError:'لطفاً یک ایمیل معتبر وارد کنید.',fileLarge:'حجم این فایل بیش از حد مجاز است.',voiceDenied:'دسترسی به میکروفن امکان‌پذیر نبود.',welcome:'به مرکز گفتگو خوش آمدید. سؤال یا اسکرین‌شات بفرستید؛ اطلاعات محرمانه محل کار را در فایل‌ها قرار ندهید.',sample:'کسی می‌داند بهترین روش برای فرستادن صدای مهمان ریموت به یک Audio Bus جدا در vMix چیست؟',answer:'یک Bus اختصاصی انتخاب کن، در صورت نیاز Master را خاموش کن و مسیر برگشت صدا را برای جلوگیری از اکو کنترل کن.'}
  };
  const lang = () => document.documentElement.lang === 'fa' ? 'fa' : 'en';
  const t = k => i18n[lang()][k] || i18n.en[k] || k;

  const hub=$('#communityHub'), launcher=$('#communityLauncher'), login=$('#communityLogin'), room=$('#communityRoom');
  if(!hub || !launcher) return;

  function translate(){
    $$('[data-community-i18n]').forEach(el=>{ const key=el.dataset.communityI18n; el.textContent=t(key); });
    const input=$('#communityInput'); if(input) input.placeholder=input.dataset[lang()==='fa'?'communityPlaceholderFa':'communityPlaceholderEn'];
    renderMessages();
  }
  const langObserver=new MutationObserver(translate); langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});

  function openHub(){ hub.classList.add('open');hub.setAttribute('aria-hidden','false');launcher.setAttribute('aria-expanded','true');setTimeout(()=>$('#communityName')?.focus(),200); }
  function closeHub(){ hub.classList.remove('open');hub.setAttribute('aria-hidden','true');launcher.setAttribute('aria-expanded','false'); }
  launcher.addEventListener('click',()=>hub.classList.contains('open')?closeHub():openHub());
  $('#communityClose').addEventListener('click',closeHub); $('#communityMinimize').addEventListener('click',closeHub);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&hub.classList.contains('open'))closeHub()});

  function seedMessages(){
    const now=Date.now();
    return [
      {id:'welcome',name:'Sam',initials:'SK',textKey:'welcome',time:now-240000,system:true},
      {id:'sample',name:'Arman',initials:'AR',textKey:'sample',time:now-150000},
      {id:'answer',name:'Leyla',initials:'LY',textKey:'answer',time:now-70000,replyTo:'sample'}
    ];
  }
  function load(){ try{state.messages=JSON.parse(localStorage.getItem('sam-community-messages')||'null')||seedMessages()}catch{state.messages=seedMessages()} }
  function save(){ try{localStorage.setItem('sam-community-messages',JSON.stringify(state.messages.slice(-80)))}catch{} }
  const escape=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=ts=>new Intl.DateTimeFormat(lang()==='fa'?'fa-IR':'en-US',{hour:'2-digit',minute:'2-digit'}).format(new Date(ts));
  function messageText(m){return m.textKey?t(m.textKey):m.text||''}
  function renderMessages(){
    const box=$('#communityMessages'); if(!box) return;
    box.innerHTML=state.messages.map(m=>{
      const own=state.user&&m.email===state.user.email;
      const quoted=m.replyTo?state.messages.find(x=>x.id===m.replyTo):null;
      const media=(m.files||[]).map(f=>f.type.startsWith('image/')?`<img src="${f.url}" alt="attachment">`:f.type.startsWith('video/')?`<video src="${f.url}" controls preload="metadata"></video>`:f.type.startsWith('audio/')?`<audio src="${f.url}" controls></audio>`:'').join('');
      return `<article class="community-message ${own?'own':''}" data-id="${escape(m.id)}"><span class="message-avatar">${escape(m.initials||'U')}</span><div class="message-main"><div class="message-meta"><b>${escape(m.name)}</b><time>${fmt(m.time)}</time></div><div class="message-bubble">${quoted?`<span class="message-reply-quote">${escape(quoted.name)}: ${escape(messageText(quoted).slice(0,90))}</span>`:''}${escape(messageText(m))}${media?`<span class="message-media">${media}</span>`:''}</div><div class="message-actions"><button type="button" data-reply="${escape(m.id)}">↩ ${t('reply')}</button></div></div></article>`;
    }).join('');
    $$('[data-reply]',box).forEach(b=>b.addEventListener('click',()=>setReply(b.dataset.reply)));
    box.scrollTop=box.scrollHeight;
  }
  function setReply(id){state.reply=state.messages.find(m=>m.id===id)||null;const bar=$('#communityReply');if(!state.reply){bar.hidden=true;return}bar.hidden=false;$('span',bar).textContent=`${t('replying')} ${state.reply.name}: ${messageText(state.reply).slice(0,70)}`;$('#communityInput').focus()}
  $('#communityReply button').addEventListener('click',()=>setReply(null));

  function enter(){
    const name=$('#communityName').value.trim(), email=$('#communityEmail').value.trim(), error=$('#communityLoginError');
    if(!name){error.textContent=t('nameError');return}
    if(!/^\S+@\S+\.\S+$/.test(email)){error.textContent=t('emailError');return}
    state.user={name,email,notify:$('#communityNotify').checked,initials:name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase()};
    localStorage.setItem('sam-community-user',JSON.stringify(state.user)); error.textContent='';login.hidden=true;room.hidden=false;renderMessages();$('#communityInput').focus();
  }
  $('#communityEnter').addEventListener('click',enter);$$('#communityName,#communityEmail').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')enter()}));

  function renderFiles(){const box=$('#communityAttachments');box.innerHTML=state.files.map((f,i)=>`<span class="attachment-chip">${f.type.startsWith('image/')?`<img src="${f.url}">`:`<video src="${f.url}"></video>`}<button type="button" data-remove="${i}">×</button></span>`).join('');$$('[data-remove]',box).forEach(b=>b.addEventListener('click',()=>{state.files.splice(+b.dataset.remove,1);renderFiles()}))}
  $('#communityFile').addEventListener('change',e=>{
    [...e.target.files].slice(0,4).forEach(file=>{if(file.size>(config.maxUploadMB||15)*1024*1024){alert(t('fileLarge'));return}const r=new FileReader();r.onload=()=>{state.files.push({name:file.name,type:file.type,url:r.result});renderFiles()};r.readAsDataURL(file)});e.target.value='';
  });

  const voice=$('#communityVoice'); voice.addEventListener('click',async()=>{
    if(state.recorder&&state.recorder.state==='recording'){state.recorder.stop();voice.classList.remove('recording');return}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});state.chunks=[];state.recorder=new MediaRecorder(stream);state.recorder.ondataavailable=e=>state.chunks.push(e.data);state.recorder.onstop=()=>{const blob=new Blob(state.chunks,{type:state.recorder.mimeType||'audio/webm'});const r=new FileReader();r.onload=()=>{state.files.push({name:'voice-message.webm',type:blob.type,url:r.result});renderFiles()};r.readAsDataURL(blob);stream.getTracks().forEach(x=>x.stop())};state.recorder.start();voice.classList.add('recording')}catch{alert(t('voiceDenied'))}
  });

  $('#communityComposer').addEventListener('submit',e=>{e.preventDefault();const input=$('#communityInput'),text=input.value.trim();if(!text&&!state.files.length)return;const msg={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:state.user.name,email:state.user.email,initials:state.user.initials,text,time:Date.now(),replyTo:state.reply?.id||null,files:state.files};state.messages.push(msg);save();input.value='';state.files=[];renderFiles();setReply(null);renderMessages()});
  $('#communityInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#communityComposer').requestSubmit()}});
  $('#communityInput').addEventListener('input',e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'});

  $('#communityAiToggle').addEventListener('change',e=>{
    let note=$('.community-ai-notice');
    if(e.target.checked&&!config.aiEndpoint){if(!note){note=document.createElement('div');note.className='community-ai-notice';$('.community-chat').insertBefore(note,$('#communityComposer'))}note.textContent=t('aiNeeds')}else note?.remove();
  });

  load();
  try{const saved=JSON.parse(localStorage.getItem('sam-community-user')||'null');if(saved){state.user=saved;$('#communityName').value=saved.name||'';$('#communityEmail').value=saved.email||'';}}catch{}
  translate();
})();
