(()=>{
  const $=s=>document.querySelector(s);
  const panel=$('#sk-community-panel'), launch=$('#sk-community-launcher');
  if(!panel||!launch)return;

  const ADMIN_EMAIL='sam.kazmi0090@gmail.com';
  const I={
    en:{hub:'COMMUNITY HUB',designed:'Designed by Sam Kazemi',join:'Join the control-room community',desc:'Ask a production question, share a screenshot, and help other creators.',name:'Display name',email:'Email',notify:'Save my email on this device',enter:'ENTER HUB',placeholder:'Write a message…',reply:'REPLY',preview:'REALTIME',online:'CONNECTING…',err:'Please enter a valid name and email.',aiReady:'LOCAL AI ONLINE — open AI Studio or start talking.',aiOff:'AI MODE is off.',aiThinking:'Local AI is building a response…',aiListening:'VOICE AI IS LISTENING…',aiSpeaking:'VOICE AI IS SPEAKING…',aiError:'AI could not answer. Try a shorter, clearer request.',notConfigured:'Realtime is not configured. Add the real Supabase publishable key.',connectionError:'Could not connect to the realtime server.',sending:'Uploading and sending…',deleteConfirm:'Delete this message for everyone?',deleted:'Message deleted.',adminRequired:'Secure admin login is required.'},
    fa:{hub:'هاب کامیونیتی',designed:'طراحی‌شده توسط سام کاظمی',join:'به کامیونیتی اتاق فرمان بپیوندید',desc:'سؤال فنی بپرسید، اسکرین‌شات بفرستید و به تولیدکنندگان دیگر کمک کنید.',name:'نام نمایشی',email:'ایمیل',notify:'ایمیل من فقط روی این دستگاه ذخیره شود',enter:'ورود به هاب',placeholder:'پیامتان را بنویسید…',reply:'پاسخ',preview:'ارتباط زنده',online:'در حال اتصال…',err:'نام و ایمیل معتبر وارد کنید.',aiReady:'هوش مصنوعی محلی روشن است؛ AI Studio را باز کن یا با آن حرف بزن.',aiOff:'AI MODE خاموش است.',aiThinking:'هوش مصنوعی محلی در حال ساخت پاسخ است…',aiListening:'هوش مصنوعی در حال شنیدن است…',aiSpeaking:'هوش مصنوعی در حال صحبت است…',aiError:'هوش مصنوعی نتوانست پاسخ بدهد؛ درخواست را کوتاه‌تر و روشن‌تر بگو.',notConfigured:'ارتباط زنده تنظیم نیست؛ کلید Publishable واقعی Supabase را وارد کن.',connectionError:'اتصال به سرور زنده برقرار نشد.',sending:'در حال آپلود و ارسال…',deleteConfirm:'این پیام برای همه حذف شود؟',deleted:'پیام حذف شد.',adminRequired:'ورود امن مدیر لازم است.'}
  };

  let lang=document.documentElement.lang==='fa'?'fa':'en';
  const T=()=>I[lang];
  let user=null, replyTo=null, files=[], recorder=null, chunks=[], sending=false, aiBusy=false;
  let messages=[], presence={}, channel=null, authUser=null;
  let recognition=null, voiceActive=false, voiceRestart=false, lastAIOutput='';
  const clientId=localStorage.getItem('sk-community-client-id')||(crypto.randomUUID?.()||String(Date.now())+Math.random());
  localStorage.setItem('sk-community-client-id',clientId);

  const cfg=window.SK_SUPABASE||{};
  const configured=/^https:\/\/.+\.supabase\.co$/i.test(cfg.url||'')&&(cfg.key||'').length>40&&!/PASTE_|vg41SX/i.test(cfg.key||'');
  const supabase=configured&&window.supabase?.createClient?window.supabase.createClient(cfg.url,cfg.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function isAdmin(){return authUser?.email?.toLowerCase()===ADMIN_EMAIL;}
  function open(v=true){panel.classList.toggle('sk-open',v);panel.setAttribute('aria-hidden',String(!v));launch.setAttribute('aria-expanded',String(v));}
  launch.onclick=()=>open(!panel.classList.contains('sk-open'));
  $('#sk-close').onclick=()=>open(false);$('#sk-min').onclick=()=>open(false);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){open(false);closeStudio();closeAdmin();}});

  function localize(){
    lang=document.documentElement.lang==='fa'?'fa':'en';
    document.querySelectorAll('[data-ch]').forEach(el=>{const k=el.dataset.ch;if(T()[k])el.textContent=T()[k];});
    $('#sk-message').placeholder=T().placeholder;
    if(!configured)setConnection('offline',T().notConfigured);
    render();updateAIUI();
  }
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  function setConnection(state,text){
    const count=$('#sk-online-count'),note=$('#sk-connection-note');
    note.textContent=text;note.dataset.state=state;
    if(state==='online')count.textContent=`${Object.values(presence).flat().length||1} ONLINE`;
    else count.textContent=state==='connecting'?(lang==='fa'?'در حال اتصال…':'CONNECTING…'):(lang==='fa'?'قطع ارتباط':'OFFLINE');
  }

  function mediaMarkup(media=[]){return(media||[]).map(x=>{const url=esc(x.url),type=x.type||'';if(type.startsWith('image'))return`<img src="${url}" alt="Uploaded image" loading="lazy">`;if(type.startsWith('video'))return`<video controls preload="metadata" src="${url}"></video>`;return`<audio controls preload="metadata" src="${url}"></audio>`;}).join('');}
  function render(){
    $('#sk-messages').innerHTML=messages.map(m=>`<article class="sk-msg ${m.client_id===clientId?'mine':''} ${m.typing?'sk-typing':''}"><span class="sk-msg-avatar">${esc((m.display_name||'U').slice(0,2).toUpperCase())}</span><div class="sk-msg-body"><div class="sk-msg-meta"><b>${esc(m.display_name)}</b>${m.is_ai?' · AI':''}</div><div class="sk-bubble">${m.typing?'<span class="sk-dots"><i></i><i></i><i></i></span>':esc(m.body)}${m.reply_body?`<div class="sk-quoted">↳ ${esc(m.reply_body)}</div>`:''}${mediaMarkup(m.media)}</div>${m.typing?'':`<div class="sk-msg-actions"><button class="sk-reply-btn" data-reply="${m.id}">${T().reply}</button>${isAdmin()?`<button class="sk-delete-btn" data-delete="${m.id}" title="Delete">🗑</button>`:''}</div>`}</div></article>`).join('');
    $('#sk-messages').scrollTop=$('#sk-messages').scrollHeight;
    document.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{const m=messages.find(x=>String(x.id)===String(b.dataset.reply));if(!m)return;replyTo=m;$('#sk-reply-text').textContent=(m.body||'').slice(0,90);$('#sk-reply-preview').hidden=false;$('#sk-message').focus();});
    document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteMessage(b.dataset.delete));
  }
  function renderPresence(){const people=Object.values(presence).flat(),unique=[],seen=new Set();people.forEach(p=>{if(!seen.has(p.client_id)){seen.add(p.client_id);unique.push(p);}});$('#sk-online-users').innerHTML=unique.map(p=>`<li><span class="sk-avatar">${esc((p.name||'U').slice(0,2).toUpperCase())}</span><div><b>${esc(p.name||'Guest')}</b><small>${p.client_id===clientId?'You':'Online'}</small></div></li>`).join('')||`<li><div><small>${lang==='fa'?'در حال دریافت فهرست…':'Loading presence…'}</small></div></li>`;if(channel)setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');}

  async function loadMessages(){const{data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(150);if(error)throw error;messages=(data||[]).map(m=>({...m,reply_body:null}));const ids=[...new Set(messages.map(m=>m.reply_to).filter(Boolean))];if(ids.length){const{data:parents}=await supabase.from('messages').select('id,body').in('id',ids);const map=new Map((parents||[]).map(x=>[x.id,x.body]));messages.forEach(m=>m.reply_body=map.get(m.reply_to)||null);}render();}
  async function connectRealtime(){if(!supabase){setConnection('offline',T().notConfigured);return;}setConnection('connecting',lang==='fa'?'در حال اتصال به سرور…':'CONNECTING TO REALTIME…');try{await loadMessages();channel=supabase.channel('sam-community-live',{config:{presence:{key:clientId}}}).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},payload=>{const row=payload.new;if(messages.some(m=>m.id===row.id))return;if(row.reply_to){const p=messages.find(m=>m.id===row.reply_to);row.reply_body=p?.body||null;}messages.push(row);messages.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));render();}).on('postgres_changes',{event:'DELETE',schema:'public',table:'messages'},payload=>{messages=messages.filter(m=>String(m.id)!==String(payload.old.id));render();}).on('presence',{event:'sync'},()=>{presence=channel.presenceState();renderPresence();}).on('presence',{event:'join'},()=>{presence=channel.presenceState();renderPresence();}).on('presence',{event:'leave'},()=>{presence=channel.presenceState();renderPresence();}).subscribe(async status=>{if(status==='SUBSCRIBED'){await channel.track({client_id:clientId,name:user?.name||'Guest',online_at:new Date().toISOString()});setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')setConnection('offline',T().connectionError);});}catch(err){console.error(err);setConnection('offline',`${T().connectionError} ${err.message||''}`);}}

  $('#sk-cancel-reply').onclick=()=>{replyTo=null;$('#sk-reply-preview').hidden=true;};
  $('#sk-enter').onclick=async()=>{const n=$('#sk-name').value.trim(),e=$('#sk-email').value.trim();if(n.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){$('#sk-login-error').textContent=T().err;return;}user={name:n,email:e};localStorage.setItem('sk-community-user-v2',JSON.stringify(user));$('#sk-login').hidden=true;$('#sk-room').hidden=false;render();if(channel)await channel.track({client_id:clientId,name:user.name,online_at:new Date().toISOString()});};
  try{user=JSON.parse(localStorage.getItem('sk-community-user-v2')||'null');if(user){$('#sk-name').value=user.name;$('#sk-email').value=user.email;}}catch{}

  $('#sk-file').onchange=e=>{[...e.target.files].slice(0,3).forEach(file=>{if(file.size<=12*1024*1024)files.push({type:file.type,url:URL.createObjectURL(file),file});});drawFiles();e.target.value='';};
  function drawFiles(){$('#sk-attachments').innerHTML=files.map((f,i)=>`<span class="sk-chip">${f.type.startsWith('image')?`<img src="${f.url}" alt="attachment">`:`<span>${esc(f.file.name)}</span>`}<button data-x="${i}" type="button">×</button></span>`).join('');document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{files.splice(+b.dataset.x,1);drawFiles();});}
  async function uploadMedia(items){const result=[];for(const item of items){const safe=(item.file.name||'media').replace(/[^a-zA-Z0-9._-]/g,'-'),path=`${clientId}/${Date.now()}-${crypto.randomUUID()}-${safe}`;const{error}=await supabase.storage.from('community-media').upload(path,item.file,{contentType:item.type,upsert:false});if(error)throw error;const{data}=supabase.storage.from('community-media').getPublicUrl(path);result.push({type:item.type,url:data.publicUrl,name:item.file.name,path});}return result;}
  async function insertMessage({name,body,reply,media,isAI=false,originClient=clientId}){const{data,error}=await supabase.from('messages').insert({client_id:originClient,display_name:name,body:body||'',reply_to:reply?.id||null,media:media||[],is_ai:isAI}).select().single();if(error)throw error;if(!messages.some(m=>m.id===data.id)){data.reply_body=reply?.body||null;messages.push(data);render();}return data;}

  function detectLang(text){return/[\u0600-\u06ff]/.test(text)?'fa':/[çğıöşüİ]/i.test(text)?'tr':'en';}
  function clean(text){return text.replace(/\s+/g,' ').trim();}
  const aiMemory=[];
  function remember(role,text){aiMemory.push({role,text:clean(text)});if(aiMemory.length>12)aiMemory.splice(0,aiMemory.length-12);}
  function conversationalAI(text, l){
    const q=clean(text||''), lower=q.toLowerCase();
    const fa=l==='fa';
    const recent=aiMemory.slice(-4).map(x=>x.text).join(' ');
    if(/^(سلام|درود|هی|hello|hi|hey)\b/i.test(q)) return fa?'سلام! من اینجام 😊 امروز دوست داری درباره چی حرف بزنیم؟':'Hey! I’m here 😊 What would you like to talk about?';
    if(/خوبی|چطوری|حالت چطوره|how are you/i.test(lower)) return fa?'خوبم، مرسی که پرسیدی. تو چطوری؟ چه خبر؟':'I’m good, thanks for asking. How are you doing?';
    if(/اسمت چیه|تو کی هستی|who are you/i.test(lower)) return fa?'من دستیار هوشمند Community Hub هستم؛ برای گفت‌وگوی معمولی، ایده‌پردازی و کمک فنی کنارتم.':'I’m the Community Hub assistant — here for normal conversation, ideas, and technical help.';
    if(/مرسی|ممنون|دمت گرم|thank/i.test(lower)) return fa?'خواهش می‌کنم 🌱 خوشحالم به کارت اومد.':'You’re welcome 🌱 Glad that helped.';
    if(/خداحافظ|فعلا|بای|bye/i.test(lower)) return fa?'فعلاً! هر وقت خواستی برگرد، من اینجام.':'See you! I’ll be here when you’re back.';
    if(/چه خبر|چی کار میکنی|چیکار میکنی/i.test(lower)) return fa?'اینجا منتظرم باهات حرف بزنم یا روی ایده‌هات کار کنیم. تو بگو امروز ذهنت درگیر چیه؟':'I’m here, ready to chat or work through an idea with you. What’s on your mind today?';
    if(/غمگین|ناراحت|خسته|حال ندارم|استرس|anxious|sad|tired/i.test(lower)) return fa?'می‌فهمم. دوست داری فقط حرف بزنی، یا با هم یک راه‌حل عملی پیدا کنیم؟':'I hear you. Do you want to just talk, or work out a practical next step together?';
    if(/خوشحال|عالی|هیجان|happy|excited/i.test(lower)) return fa?'چه خوب 😄 چی باعثش شده؟':'Nice 😄 What happened?';
    if(/^(آره|بله|نه|نه بابا|yes|no)$/i.test(q) && recent) return fa?'باشه، یکم بیشتر برام بگو تا دقیق‌تر همراهت باشم.':'Got it — tell me a little more so I can follow you properly.';
    if(q.endsWith('?')||q.endsWith('؟')) return fa?`سؤال خوبیه. برداشت من اینه که درباره «${q.replace(/[؟?]+$/,'')}» می‌پرسی. جواب دقیقش به جزئیات بستگی داره؛ مهم‌ترین نکته‌ای که باید روشن کنیم اینه: هدفت بیشتر فهمیدن موضوعه یا رسیدن به یک نتیجه عملی؟`:`Good question. It sounds like you’re asking about “${q.replace(/[?]+$/,'')}”. The best answer depends on context — are you mainly trying to understand it, or make a practical decision?`;
    return fa?`فهمیدم. درباره «${q}» می‌تونیم خیلی طبیعی جلو بریم. از کدوم بخشش شروع کنیم؟`:`I get you. We can talk through “${q}” naturally. Which part should we start with?`;
  }
  function localAI(text,action='auto'){
    const q=clean(text||''),l=detectLang(q);if(!q)return l==='fa'?'هرچی تو ذهنت هست بگو؛ من گوش می‌دم.':'Say whatever is on your mind — I’m listening.';
    const lower=q.toLowerCase();
    let out='';
    if(action==='summary'||/خلاصه|summar|özet/.test(lower)){const parts=q.split(/[.!؟?\n]+/).map(clean).filter(Boolean).slice(0,3);out=l==='fa'?`خلاصه:\n• ${parts.join('\n• ')}`:`Summary:\n• ${parts.join('\n• ')}`;}
    else if(action==='rewrite'||/حرفه‌ای|بازنویسی|rewrite|professional/.test(lower)){out=l==='fa'?`نسخه روان‌تر و حرفه‌ای‌تر:\n\n${q.replace(/میخوام|می‌خوام/g,'قصد دارم')}`:`A smoother, more professional version:\n\n${q.charAt(0).toUpperCase()+q.slice(1)}`;}
    else if(action==='translate'||/ترجمه|translate|çevir/.test(lower)){out=l==='fa'?`زبان مقصد رو هم بگو؛ مثلاً «به انگلیسی ترجمه کن».`:`Tell me the target language too, for example: “Translate this to Persian.”`;}
    else if(action==='script'||/سناریو|script|ویدیو|video/.test(lower)){out=l==='fa'?`برای «${q}» این ساختار خوبه: شروع کوتاه و جذاب، معرفی مسئله، سه بخش اصلی، یک نقطه اوج، و پایان با دعوت روشن به واکنش.`:`For “${q}”, use a short hook, introduce the problem, cover three main beats, land a strong payoff, and end with a clear call to action.`;}
    else if(action==='ideas'||/ایده|idea|fikir/.test(lower)){out=l==='fa'?`برای «${q}» چند مسیر خوب داریم: پشت‌صحنه، قبل و بعد، اشتباه رایج و راه‌حل، چالش زمان‌دار، یا مقایسه دو روش. کدوم سبک بیشتر به کارت میاد؟`:`For “${q}”, good directions include behind-the-scenes, before-and-after, common mistake plus fix, a timed challenge, or a two-method comparison. Which style fits you best?`;}
    else out=conversationalAI(q,l);
    remember('user',q);remember('assistant',out);return out;
  }

  function aiEnabled(){return $('#sk-ai').checked;}
  function updateAIUI(){const on=aiEnabled(),control=$('#sk-ai-control'),note=$('#sk-ai-note');control?.classList.toggle('sk-ai-on',on);$('#sk-ai-studio-open')?.classList.toggle('active',on);if(note){note.hidden=false;note.textContent=on?T().aiReady:T().aiOff;}}
  $('#sk-ai').onchange=e=>{localStorage.setItem('sk-ai-enabled',e.target.checked?'1':'0');updateAIUI();if(!e.target.checked)stopVoice();};

  function openStudio(){if(!aiEnabled()){$('#sk-ai').checked=true;localStorage.setItem('sk-ai-enabled','1');updateAIUI();}$('#sk-ai-studio').hidden=false;$('#sk-ai-studio-input').focus();}
  function closeStudio(){$('#sk-ai-studio').hidden=true;}
  $('#sk-ai-studio-open').onclick=openStudio;$('#sk-ai-studio-close').onclick=closeStudio;
  let studioAction='auto';
  document.querySelectorAll('[data-ai-action]').forEach(b=>b.onclick=()=>{studioAction=b.dataset.aiAction;document.querySelectorAll('[data-ai-action]').forEach(x=>x.classList.toggle('active',x===b));});
  $('#sk-ai-studio-run').onclick=()=>{const input=$('#sk-ai-studio-input').value.trim();$('#sk-ai-studio-output').textContent=T().aiThinking;setTimeout(()=>{lastAIOutput=localAI(input,studioAction);$('#sk-ai-studio-output').textContent=lastAIOutput;},180);};
  $('#sk-ai-studio-speak').onclick=()=>speak(lastAIOutput||$('#sk-ai-studio-output').textContent);

  function chooseVoice(locale){const voices=speechSynthesis.getVoices?.()||[];const wanted=locale.toLowerCase();return voices.find(v=>v.lang?.toLowerCase()===wanted)||voices.find(v=>v.lang?.toLowerCase().startsWith(wanted.split('-')[0]))||null;}
  function speak(text){
    if(!('speechSynthesis'in window)||!text)return;
    speechSynthesis.cancel();
    const detected=detectLang(text),locale=detected==='fa'?'fa-IR':detected==='tr'?'tr-TR':'en-US';
    const u=new SpeechSynthesisUtterance(text.replace(/[•*_#]/g,' '));
    u.lang=locale;u.rate=detected==='fa'?0.88:0.96;u.pitch=1;
    const voice=chooseVoice(locale);if(voice)u.voice=voice;
    u.onstart=()=>{$('#sk-voice-ai').classList.add('speaking');$('#sk-ai-note').textContent=T().aiSpeaking;};
    u.onend=()=>{$('#sk-voice-ai').classList.remove('speaking');$('#sk-ai-note').textContent=T().aiReady;if(voiceRestart&&voiceActive)setTimeout(startRecognition,300);};
    u.onerror=()=>{$('#sk-voice-ai').classList.remove('speaking');$('#sk-ai-note').textContent=detected==='fa'?'صدای فارسی روی این دستگاه نصب نیست؛ پاسخ متنی آماده است.':'A compatible system voice is not available; the text response is ready.';};
    speechSynthesis.speak(u);
  }
  if('speechSynthesis'in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();}
  function buildRecognition(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;const r=new SR();r.continuous=false;r.interimResults=true;r.lang=lang==='fa'?'fa-IR':'en-US';r.onstart=()=>{$('#sk-voice-ai').classList.add('listening');$('#sk-ai-note').textContent=T().aiListening;};r.onresult=e=>{let final='';for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)final+=e.results[i][0].transcript;if(final)handleVoicePrompt(final.trim());};r.onerror=e=>{console.warn('Speech recognition',e.error);if(e.error!=='aborted'){$('#sk-ai-note').textContent=lang==='fa'?'تشخیص صدا در این مرورگر در دسترس نیست؛ از تایپ استفاده کن.':'Speech recognition is unavailable in this browser; use typing instead.';}stopVoice(false);};r.onend=()=>{$('#sk-voice-ai').classList.remove('listening');if(voiceActive&&!speechSynthesis.speaking)setTimeout(startRecognition,350);};return r;}
  function startRecognition(){if(!voiceActive)return;if(!recognition)recognition=buildRecognition();if(!recognition){alert(lang==='fa'?'مرورگر شما تشخیص گفتار را پشتیبانی نمی‌کند. Chrome روی Android بهترین پشتیبانی را دارد.':'Your browser does not support speech recognition. Chrome on Android usually works best.');stopVoice(false);return;}try{recognition.lang=lang==='fa'?'fa-IR':'en-US';recognition.start();}catch{}}
  function stopVoice(cancelSpeech=true){voiceActive=false;voiceRestart=false;$('#sk-voice-ai').classList.remove('active','listening','speaking');$('#sk-voice-ai').setAttribute('aria-pressed','false');try{recognition?.abort();}catch{}if(cancelSpeech&&'speechSynthesis'in window)speechSynthesis.cancel();if(aiEnabled())$('#sk-ai-note').textContent=T().aiReady;}
  async function handleVoicePrompt(text){if(!text)return;voiceRestart=true;$('#sk-message').value=text;const answer=localAI(text);lastAIOutput=answer;$('#sk-ai-note').textContent=T().aiThinking;try{if(user&&supabase){await insertMessage({name:user.name,body:text,reply:null,media:[]});await insertMessage({name:'SK AI',body:answer,reply:null,media:[],isAI:true,originClient:'sk-local-ai'});}else{$('#sk-ai-studio-input').value=text;$('#sk-ai-studio-output').textContent=answer;openStudio();}$('#sk-voice-ai').classList.add('speaking');speak(answer);}catch(err){console.error(err);$('#sk-ai-note').textContent=T().aiError;}}
  $('#sk-voice-ai').onclick=()=>{if(!aiEnabled()){$('#sk-ai').checked=true;localStorage.setItem('sk-ai-enabled','1');updateAIUI();}voiceActive=!voiceActive;$('#sk-voice-ai').classList.toggle('active',voiceActive);$('#sk-voice-ai').setAttribute('aria-pressed',String(voiceActive));if(voiceActive)startRecognition();else stopVoice();};

  $('#sk-form').onsubmit=async e=>{e.preventDefault();if(sending||aiBusy)return;const text=$('#sk-message').value.trim();if(!text&&!files.length)return;if(!user){$('#sk-login').hidden=false;$('#sk-room').hidden=true;return;}if(!supabase){$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=T().notConfigured;return;}sending=true;const sentFiles=[...files],sentReply=replyTo;$('#sk-connection-note').textContent=T().sending;try{const uploaded=await uploadMedia(sentFiles);await insertMessage({name:user.name,body:text,reply:sentReply,media:uploaded});$('#sk-message').value='';files=[];drawFiles();replyTo=null;$('#sk-reply-preview').hidden=true;if(aiEnabled()){aiBusy=true;const temp={id:'typing',display_name:'SK AI',body:'',typing:true,is_ai:true,client_id:'ai'};messages.push(temp);render();await new Promise(r=>setTimeout(r,180));const answer=localAI(text);messages=messages.filter(m=>m!==temp);await insertMessage({name:'SK AI',body:answer,reply:null,media:[],isAI:true,originClient:'sk-local-ai'});lastAIOutput=answer;$('#sk-ai-note').textContent=T().aiReady;}}catch(err){console.error(err);messages=messages.filter(m=>!m.typing);render();$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=`${T().connectionError} ${err.message||''}`;}finally{aiBusy=false;sending=false;setConnection(channel?'online':'offline',channel?(lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED'):T().connectionError);}};
  $('#sk-message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sk-form').requestSubmit();}};$('#sk-message').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,110)+'px';};
  $('#sk-voice').onclick=async()=>{if(recorder?.state==='recording'){recorder.stop();return;}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const mime=MediaRecorder.isTypeSupported?.('audio/webm')?'audio/webm':'audio/mp4',blob=new Blob(chunks,{type:mime}),file=new File([blob],`voice-message.${mime.includes('mp4')?'m4a':'webm'}`,{type:mime});files.push({type:mime,url:URL.createObjectURL(blob),file});stream.getTracks().forEach(t=>t.stop());$('#sk-voice').classList.remove('recording');drawFiles();};recorder.start();$('#sk-voice').classList.add('recording');}catch{alert(lang==='fa'?'دسترسی میکروفون داده نشد.':'Microphone permission was not granted.');}};

  function openAdmin(){$('#sk-admin-modal').hidden=false;updateAdminUI();}function closeAdmin(){$('#sk-admin-modal').hidden=true;}$('#sk-admin-open').onclick=openAdmin;$('#sk-admin-close').onclick=closeAdmin;
  function updateAdminUI(){const status=$('#sk-admin-status'),login=$('#sk-admin-login'),logout=$('#sk-admin-logout'),btn=$('#sk-admin-open');if(isAdmin()){status.textContent=lang==='fa'?'ورود مدیر تأیید شد. امکان حذف امن فعال است.':'Admin verified. Secure delete is active.';login.hidden=true;logout.hidden=false;btn.classList.add('verified');btn.textContent='ADMIN ✓';}else{status.textContent=supabase?'':'Supabase is not configured.';login.hidden=false;logout.hidden=true;btn.classList.remove('verified');btn.textContent='ADMIN';}render();}
  $('#sk-admin-login').onclick=async()=>{if(!supabase){$('#sk-admin-status').textContent=T().notConfigured;return;}const redirectTo=location.origin+location.pathname;const{error}=await supabase.auth.signInWithOtp({email:ADMIN_EMAIL,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});$('#sk-admin-status').textContent=error?error.message:(lang==='fa'?'لینک ورود امن ارسال شد؛ ایمیل را باز کن.':'Secure login link sent. Open it from the verified Gmail inbox.');};
  $('#sk-admin-logout').onclick=async()=>{await supabase?.auth.signOut();authUser=null;updateAdminUI();};
  async function deleteMessage(id){if(!isAdmin()){openAdmin();$('#sk-admin-status').textContent=T().adminRequired;return;}if(!confirm(T().deleteConfirm))return;const m=messages.find(x=>String(x.id)===String(id));try{for(const item of m?.media||[]){if(item.path)await supabase.storage.from('community-media').remove([item.path]);}const{error}=await supabase.from('messages').delete().eq('id',id);if(error)throw error;messages=messages.filter(x=>String(x.id)!==String(id));render();$('#sk-admin-status').textContent=T().deleted;}catch(err){alert(err.message||T().connectionError);}}
  async function initAuth(){if(!supabase)return;const{data}=await supabase.auth.getSession();authUser=data.session?.user||null;supabase.auth.onAuthStateChange((_event,session)=>{authUser=session?.user||null;updateAdminUI();});updateAdminUI();}

  $('#sk-ai').checked=localStorage.getItem('sk-ai-enabled')==='1';
  localize();render();updateAIUI();initAuth();connectRealtime();
})();
