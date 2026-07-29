(()=>{
  const $=s=>document.querySelector(s);
  const panel=$('#sk-community-panel'), launch=$('#sk-community-launcher');
  if(!panel||!launch)return;

  const ADMIN_EMAIL='sam.kazmi0090@gmail.com';
  const I={
    en:{hub:'COMMUNITY HUB',designed:'Designed by Sam Kazemi',join:'Join the control-room community',desc:'Ask a production question, share a screenshot, and help other creators.',name:'Display name',email:'Email',notify:'Save my email on this device',enter:'ENTER HUB',placeholder:'Write a message…',reply:'REPLY',preview:'REALTIME',online:'CONNECTING…',err:'Please enter a valid name and email.',aiReady:'SAM ONLINE — personal conversation, memory and voice are ready.',aiOff:'SAM MODE is off.',aiThinking:'Sam is thinking…',aiListening:'SAM IS LISTENING…',aiSpeaking:'SAM IS SPEAKING…',aiError:'Sam could not answer. Try a shorter, clearer request.',notConfigured:'Realtime is not configured. Add the real Supabase publishable key.',connectionError:'Could not connect to the realtime server.',sending:'Uploading and sending…',deleteConfirm:'Delete this message for everyone?',deleted:'Message deleted.',adminRequired:'Secure admin login is required.'},
    fa:{hub:'هاب کامیونیتی',designed:'طراحی‌شده توسط سام کاظمی',join:'به کامیونیتی اتاق فرمان بپیوندید',desc:'سؤال فنی بپرسید، اسکرین‌شات بفرستید و به تولیدکنندگان دیگر کمک کنید.',name:'نام نمایشی',email:'ایمیل',notify:'ایمیل من فقط روی این دستگاه ذخیره شود',enter:'ورود به هاب',placeholder:'پیامتان را بنویسید…',reply:'پاسخ',preview:'ارتباط زنده',online:'در حال اتصال…',err:'نام و ایمیل معتبر وارد کنید.',aiReady:'سام آماده است؛ می‌توانی بنویسی یا با او حرف بزنی.',aiOff:'حالت سام خاموش است.',aiThinking:'سام در حال فکر کردن است…',aiListening:'سام در حال شنیدن است…',aiSpeaking:'سام در حال صحبت است…',aiError:'سام نتوانست پاسخ بدهد؛ درخواست را کوتاه‌تر و روشن‌تر بگو.',notConfigured:'ارتباط زنده تنظیم نیست؛ کلید Publishable واقعی Supabase را وارد کن.',connectionError:'اتصال به سرور زنده برقرار نشد.',sending:'در حال آپلود و ارسال…',deleteConfirm:'این پیام برای همه حذف شود؟',deleted:'پیام حذف شد.',adminRequired:'ورود امن مدیر لازم است.'}
  };

  let lang=document.documentElement.lang==='fa'?'fa':'en';
  const T=()=>I[lang];
  let user=null, replyTo=null, files=[], recorder=null, chunks=[], sending=false, aiBusy=false;
  let messages=[], presence={}, channel=null, authUser=null;
  let realtimeRetryTimer=null, fallbackPollTimer=null, realtimeConnecting=false;
  const selectedMessageIds=new Set();
  let recognition=null, voiceActive=false, voiceRestart=false, lastAIOutput='';
  const VOICE_RECOGNITION_LANG='fa-IR'; // Voice AI listens in Persian even when the site UI is English.
  let isAISpeaking=false, voicePromptBusy=false, ignoreRecognitionUntil=0, lastVoicePrompt='';
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

  function uniquePresencePeople(){
    const unique=[],seen=new Set();
    Object.values(presence||{}).flat().forEach(person=>{
      const id=person?.client_id||person?.presence_ref;
      if(!id||seen.has(id))return;
      seen.add(id);unique.push(person);
    });
    return unique;
  }
  function setConnection(state,text){
    const count=$('#sk-online-count'),note=$('#sk-connection-note');
    note.textContent=text;note.dataset.state=state;
    if(state==='online'){const live=Math.max(uniquePresencePeople().length,1);count.textContent=`${live} ONLINE`;window.dispatchEvent(new CustomEvent('sk-presence-count',{detail:live}));}
    else count.textContent=state==='connecting'?(lang==='fa'?'در حال اتصال…':'CONNECTING…'):(lang==='fa'?'قطع ارتباط':'OFFLINE');
  }

  function mediaMarkup(media=[]){return(media||[]).map(x=>{const url=esc(x.url),type=x.type||'';if(type.startsWith('image'))return`<img src="${url}" alt="Uploaded image" loading="lazy">`;if(type.startsWith('video'))return`<video controls preload="metadata" src="${url}"></video>`;return`<audio controls preload="metadata" src="${url}"></audio>`;}).join('');}
  function updateBulkUI(){
    const bulk=$('#sk-admin-bulk');
    if(!bulk)return;
    bulk.hidden=!isAdmin();
    const selectable=messages.filter(m=>!m.typing);
    const selected=[...selectedMessageIds].filter(id=>selectable.some(m=>String(m.id)===String(id)));
    selectedMessageIds.clear();selected.forEach(id=>selectedMessageIds.add(String(id)));
    $('#sk-selected-count').textContent=`${selectedMessageIds.size} SELECTED`;
    $('#sk-delete-selected').disabled=selectedMessageIds.size===0;
    $('#sk-select-all').checked=selectable.length>0&&selectedMessageIds.size===selectable.length;
    $('#sk-select-all').indeterminate=selectedMessageIds.size>0&&selectedMessageIds.size<selectable.length;
  }
  function render(){
    $('#sk-messages').innerHTML=messages.map(m=>`<article class="sk-msg ${m.client_id===clientId?'mine':''} ${m.typing?'sk-typing':''} ${selectedMessageIds.has(String(m.id))?'sk-selected':''}">${isAdmin()&&!m.typing?`<label class="sk-msg-check" title="Select message"><input type="checkbox" data-select="${m.id}" ${selectedMessageIds.has(String(m.id))?'checked':''}><span></span></label>`:''}<span class="sk-msg-avatar">${esc((m.display_name||'U').slice(0,2).toUpperCase())}</span><div class="sk-msg-body"><div class="sk-msg-meta"><b>${esc(m.display_name)}</b>${m.is_ai&&String(m.display_name||'').toLowerCase()!=='sam'?' · SAM':''}</div><div class="sk-bubble">${m.typing?'<span class="sk-dots"><i></i><i></i><i></i></span>':esc(m.body)}${m.reply_body?`<div class="sk-quoted">↳ ${esc(m.reply_body)}</div>`:''}${mediaMarkup(m.media)}</div>${m.typing?'':`<div class="sk-msg-actions"><button class="sk-reply-btn" data-reply="${m.id}">${T().reply}</button>${isAdmin()?`<button class="sk-delete-btn" data-delete="${m.id}" title="Delete">🗑</button>`:''}</div>`}</div></article>`).join('');
    $('#sk-messages').scrollTop=$('#sk-messages').scrollHeight;
    document.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{const m=messages.find(x=>String(x.id)===String(b.dataset.reply));if(!m)return;replyTo=m;$('#sk-reply-text').textContent=(m.body||'').slice(0,90);$('#sk-reply-preview').hidden=false;$('#sk-message').focus();});
    document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteMessage(b.dataset.delete));
    document.querySelectorAll('[data-select]').forEach(c=>c.onchange=()=>{const id=String(c.dataset.select);c.checked?selectedMessageIds.add(id):selectedMessageIds.delete(id);render();});
    updateBulkUI();
  }
  function renderPresence(){const unique=uniquePresencePeople();window.dispatchEvent(new CustomEvent('sk-presence-count',{detail:Math.max(unique.length,1)}));$('#sk-online-users').innerHTML=unique.map(p=>`<li><span class="sk-avatar">${esc((p.name||'U').slice(0,2).toUpperCase())}</span><div><b>${esc(p.name||'Guest')}</b><small>${p.client_id===clientId?'You':'Online'}</small></div></li>`).join('')||`<li><div><small>${lang==='fa'?'در حال دریافت فهرست…':'Loading presence…'}</small></div></li>`;if(channel)setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');}

  async function fetchMessages(){
    const{data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(150);
    if(error)throw error;
    const rows=(data||[]).map(m=>({...m,reply_body:null}));
    const ids=[...new Set(rows.map(m=>m.reply_to).filter(Boolean))];
    if(ids.length){
      const{data:parents,error:parentError}=await supabase.from('messages').select('id,body').in('id',ids);
      if(parentError)console.warn('Reply lookup failed',parentError);
      const map=new Map((parents||[]).map(x=>[String(x.id),x.body]));
      rows.forEach(m=>m.reply_body=map.get(String(m.reply_to))||null);
    }
    return rows;
  }
  async function loadMessages(forceRender=true){
    const rows=await fetchMessages();
    const typing=messages.filter(m=>m.typing);
    const oldSignature=messages.filter(m=>!m.typing).map(m=>`${m.id}:${m.created_at}`).join('|');
    const newSignature=rows.map(m=>`${m.id}:${m.created_at}`).join('|');
    messages=[...rows,...typing];
    if(forceRender||oldSignature!==newSignature)render();
  }
  function startFallbackPolling(){
    clearInterval(fallbackPollTimer);
    fallbackPollTimer=setInterval(async()=>{
      if(document.hidden||!supabase)return;
      try{await loadMessages(false);}catch(err){console.warn('Message sync retry failed',err);}
    },2500);
  }
  function scheduleRealtimeReconnect(){
    clearTimeout(realtimeRetryTimer);
    realtimeRetryTimer=setTimeout(()=>connectRealtime(true),3000);
  }
  async function connectRealtime(reconnecting=false){
    if(!supabase){setConnection('offline',T().notConfigured);return;}
    if(realtimeConnecting)return;
    realtimeConnecting=true;
    setConnection('connecting',lang==='fa'?'در حال اتصال به سرور…':'CONNECTING TO REALTIME…');
    try{
      if(!reconnecting)await loadMessages();
      if(channel){try{await supabase.removeChannel(channel);}catch{}channel=null;}
      channel=supabase.channel('sam-community-live',{config:{presence:{key:clientId}}})
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},payload=>{
          const row=payload.new;
          if(messages.some(m=>String(m.id)===String(row.id)))return;
          if(row.reply_to){const p=messages.find(m=>String(m.id)===String(row.reply_to));row.reply_body=p?.body||null;}
          messages.push(row);messages.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));render();
        })
        .on('postgres_changes',{event:'UPDATE',schema:'public',table:'messages'},payload=>{
          const i=messages.findIndex(m=>String(m.id)===String(payload.new.id));
          if(i>=0){messages[i]={...messages[i],...payload.new};render();}else loadMessages(false);
        })
        .on('postgres_changes',{event:'DELETE',schema:'public',table:'messages'},payload=>{
          messages=messages.filter(m=>String(m.id)!==String(payload.old.id));render();
        })
        .on('presence',{event:'sync'},()=>{presence=channel?.presenceState?.()||{};renderPresence();})
        .on('presence',{event:'join'},()=>{presence=channel?.presenceState?.()||{};renderPresence();})
        .on('presence',{event:'leave'},()=>{presence=channel?.presenceState?.()||{};renderPresence();})
        .subscribe(async status=>{
          console.info('[Community Realtime]',status);
          if(status==='SUBSCRIBED'){
            clearTimeout(realtimeRetryTimer);
            await channel.track({client_id:clientId,name:user?.name||'Guest',online_at:new Date().toISOString()});
            setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');
            await loadMessages(false);
          }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
            setConnection('offline',T().connectionError);
            scheduleRealtimeReconnect();
          }
        });
      startFallbackPolling();
    }catch(err){
      console.error(err);setConnection('offline',`${T().connectionError} ${err.message||''}`);scheduleRealtimeReconnect();
    }finally{realtimeConnecting=false;}
  }
  window.addEventListener('online',()=>connectRealtime(true));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadMessages(false).catch(console.warn);if(!channel)connectRealtime(true);}});

  $('#sk-cancel-reply').onclick=()=>{replyTo=null;$('#sk-reply-preview').hidden=true;};
  $('#sk-enter').onclick=async()=>{const n=$('#sk-name').value.trim(),e=$('#sk-email').value.trim();if(n.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){$('#sk-login-error').textContent=T().err;return;}user={name:n,email:e};localStorage.setItem('sk-community-user-v2',JSON.stringify(user));$('#sk-login').hidden=true;$('#sk-room').hidden=false;render();if(channel)await channel.track({client_id:clientId,name:user.name,online_at:new Date().toISOString()});};
  try{user=JSON.parse(localStorage.getItem('sk-community-user-v2')||'null');if(user){$('#sk-name').value=user.name;$('#sk-email').value=user.email;}}catch{}

  $('#sk-file').onchange=e=>{[...e.target.files].slice(0,3).forEach(file=>{if(file.size<=12*1024*1024)files.push({type:file.type,url:URL.createObjectURL(file),file});});drawFiles();e.target.value='';};
  function drawFiles(){$('#sk-attachments').innerHTML=files.map((f,i)=>`<span class="sk-chip">${f.type.startsWith('image')?`<img src="${f.url}" alt="attachment">`:`<span>${esc(f.file.name)}</span>`}<button data-x="${i}" type="button">×</button></span>`).join('');document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{files.splice(+b.dataset.x,1);drawFiles();});}
  async function uploadMedia(items){const result=[];for(const item of items){const safe=(item.file.name||'media').replace(/[^a-zA-Z0-9._-]/g,'-'),path=`${clientId}/${Date.now()}-${crypto.randomUUID()}-${safe}`;const{error}=await supabase.storage.from('community-media').upload(path,item.file,{contentType:item.type,upsert:false});if(error)throw error;const{data}=supabase.storage.from('community-media').getPublicUrl(path);result.push({type:item.type,url:data.publicUrl,name:item.file.name,path});}return result;}
  async function insertMessage({name,body,reply,media,isAI=false,originClient=clientId}){const{data,error}=await supabase.from('messages').insert({client_id:originClient,display_name:name,body:body||'',reply_to:reply?.id||null,media:media||[],is_ai:isAI}).select().single();if(error)throw error;if(!messages.some(m=>m.id===data.id)){data.reply_body=reply?.body||null;messages.push(data);render();}return data;}

  function detectLang(text){return/[\u0600-\u06ff]/.test(text)?'fa':/[çğıöşüİ]/i.test(text)?'tr':'en';}
  function clean(text){return text.replace(/\s+/g,' ').trim();}
  const AI_MEMORY_KEY='sam-ai-memory-v1';
  const AI_PROFILE_KEY='sam-ai-profile-v1';
  let aiMemory=[];
  let aiProfile={};
  try{const saved=JSON.parse(localStorage.getItem(AI_MEMORY_KEY)||'[]');if(Array.isArray(saved))aiMemory=saved.slice(-24);}catch{}
  try{const saved=JSON.parse(localStorage.getItem(AI_PROFILE_KEY)||'{}');if(saved&&typeof saved==='object')aiProfile=saved;}catch{}
  function saveAIMemory(){try{localStorage.setItem(AI_MEMORY_KEY,JSON.stringify(aiMemory.slice(-24)));localStorage.setItem(AI_PROFILE_KEY,JSON.stringify(aiProfile));}catch{}}
  function learnProfile(text){
    const q=clean(text||'');
    const fa=q.match(/(?:اسم من|من اسمم)\s+([؀-ۿA-Za-z][؀-ۿA-Za-z‌\- ]{1,30}?)(?:\s+(?:است|هست|هستم)|[.!؟?]|$)/i);
    const en=q.match(/(?:my name is|call me)\s+([A-Za-z][A-Za-z '\-]{1,30})(?:[.!?]|$)/i);
    const name=clean((fa?.[1]||en?.[1]||'')).replace(/\s+(?:است|هست|هستم)$/,'');
    if(name&&name.length<=32)aiProfile.name=name;
  }
  function remember(role,text){learnProfile(role==='user'?text:'');aiMemory.push({role,content:clean(text)});if(aiMemory.length>24)aiMemory.splice(0,aiMemory.length-24);saveAIMemory();}
  async function fetchWithTimeout(url,options={},timeout=18000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
  async function askAI(text,action='auto'){
    const q=clean(text||'');
    if(!q)throw new Error(lang==='fa'?'پیامی برای هوش مصنوعی وارد نشده.':'No AI prompt was provided.');
    if(!supabase)throw new Error(T().notConfigured);
    const response=await fetchWithTimeout(`${cfg.url}/functions/v1/sk-ai-chat`,{
      method:'POST',
      headers:{'Content-Type':'application/json','apikey':cfg.key,'Authorization':`Bearer ${cfg.key}`},
      body:JSON.stringify({message:q,action,language:detectLang(q),history:aiMemory.slice(-10),profile:aiProfile})
    },18000);
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||data.message||`AI request failed (${response.status})`);
    const answer=clean(data.answer||'');
    if(!answer)throw new Error(lang==='fa'?'پاسخ خالی از سرور دریافت شد.':'The AI returned an empty response.');
    remember('user',q);remember('assistant',answer);
    return answer;
  }

  function aiEnabled(){return $('#sk-ai').checked;}
  function updateAIUI(){const on=aiEnabled(),control=$('#sk-ai-control'),note=$('#sk-ai-note');control?.classList.toggle('sk-ai-on',on);$('#sk-ai-studio-open')?.classList.toggle('active',on);if(note){note.hidden=false;note.textContent=on?T().aiReady:T().aiOff;}}
  $('#sk-ai').onchange=e=>{localStorage.setItem('sk-ai-enabled',e.target.checked?'1':'0');updateAIUI();if(!e.target.checked)stopVoice();};

  function openStudio(){if(!aiEnabled()){$('#sk-ai').checked=true;localStorage.setItem('sk-ai-enabled','1');updateAIUI();}$('#sk-ai-studio').hidden=false;$('#sk-ai-studio-input').focus();}
  function closeStudio(){$('#sk-ai-studio').hidden=true;}
  $('#sk-ai-studio-open').onclick=openStudio;$('#sk-ai-studio-close').onclick=closeStudio;
  let studioAction='auto';
  document.querySelectorAll('[data-ai-action]').forEach(b=>b.onclick=()=>{studioAction=b.dataset.aiAction;document.querySelectorAll('[data-ai-action]').forEach(x=>x.classList.toggle('active',x===b));});
  $('#sk-ai-studio-run').onclick=async()=>{const input=$('#sk-ai-studio-input').value.trim();if(!input)return;$('#sk-ai-studio-output').textContent=T().aiThinking;try{lastAIOutput=await askAI(input,studioAction);$('#sk-ai-studio-output').textContent=lastAIOutput;}catch(err){console.error(err);$('#sk-ai-studio-output').textContent=err.message||T().aiError;}};
  $('#sk-ai-studio-speak').onclick=()=>speak(lastAIOutput||$('#sk-ai-studio-output').textContent);

  let currentAudio=null, mobileAudioContext=null, mobileVoiceUnlocked=false, micPermissionReady=false;
  let iosRecorder=null,iosStream=null,iosChunks=[],iosSilenceTimer=null,iosMaxTimer=null,iosAudioContext=null,iosAnalyser=null;
  const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  async function unlockMobileVoice(){
    if(mobileVoiceUnlocked)return true;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(AC){mobileAudioContext=mobileAudioContext||new AC();if(mobileAudioContext.state==='suspended')await mobileAudioContext.resume();const osc=mobileAudioContext.createOscillator(),gain=mobileAudioContext.createGain();gain.gain.value=0;osc.connect(gain);gain.connect(mobileAudioContext.destination);osc.start();osc.stop(mobileAudioContext.currentTime+.02);}
      if('speechSynthesis'in window){speechSynthesis.cancel();const warmup=new SpeechSynthesisUtterance(' ');warmup.volume=0;speechSynthesis.speak(warmup);}
      mobileVoiceUnlocked=true;return true;
    }catch(err){console.warn('Voice unlock',err);return false;}
  }
  async function ensureMicrophonePermission(){
    if(micPermissionReady)return true;
    if(!navigator.mediaDevices?.getUserMedia)return true;
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});stream.getTracks().forEach(t=>t.stop());micPermissionReady=true;return true;}catch(err){console.warn('Microphone permission',err);$('#sk-ai-note').textContent=lang==='fa'?'اجازه میکروفون داده نشد. از تنظیمات مرورگر، Microphone را روی Allow بگذار.':'Microphone permission was denied. Allow it in your browser settings.';return false;}
  }
  function finishSpeaking(delay=850){
    isAISpeaking=false;ignoreRecognitionUntil=Date.now()+delay;$('#sk-voice-ai').classList.remove('speaking');$('#sk-ai-note').textContent=T().aiReady;if(voiceRestart&&voiceActive)setTimeout(startRecognition,delay+100);
  }
  function browserSpeak(text){
    return new Promise((resolve,reject)=>{
      if(!('speechSynthesis'in window))return reject(new Error('Speech synthesis unavailable'));
      speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=detectLang(text)==='fa'?'fa-IR':'en-US';u.rate=1.02;u.pitch=1;u.volume=1;
      const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang?.toLowerCase().startsWith(u.lang.slice(0,2).toLowerCase()))||null;
      u.onend=()=>{finishSpeaking(1000);resolve();};u.onerror=e=>reject(e.error||e);speechSynthesis.speak(u);
      setTimeout(()=>{if(speechSynthesis.paused)speechSynthesis.resume();},250);
    });
  }
  async function cloudSpeak(text){
    const response=await fetchWithTimeout(`${cfg.url}/functions/v1/sk-ai-tts`,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.key,'Authorization':`Bearer ${cfg.key}`},body:JSON.stringify({text,language:detectLang(text)})},12000);
    if(!response.ok){const e=await response.json().catch(()=>({}));throw new Error(e.error||'Voice service unavailable');}
    const blob=await response.blob(),url=URL.createObjectURL(blob);currentAudio=new Audio(url);currentAudio.preload='auto';currentAudio.playsInline=true;
    currentAudio.onended=()=>{URL.revokeObjectURL(url);currentAudio=null;finishSpeaking(350);};
    currentAudio.onerror=()=>{URL.revokeObjectURL(url);currentAudio=null;finishSpeaking(350);};
    await currentAudio.play();
  }
  async function speak(text){
    if(!text)return;
    isAISpeaking=true;ignoreRecognitionUntil=Date.now()+450;try{recognition?.abort();}catch{}
    $('#sk-voice-ai').classList.add('speaking');$('#sk-ai-note').textContent=T().aiSpeaking;
    await unlockMobileVoice();if(currentAudio){currentAudio.pause();currentAudio.src='';currentAudio=null;}if('speechSynthesis'in window)speechSynthesis.cancel();
    // Browser speech begins almost instantly. Cloud TTS is now only a fallback,
    // eliminating the long network wait that made Voice mode feel sluggish.
    try{await browserSpeak(text);}catch(err){
      console.warn('Browser voice unavailable; using cloud TTS',err);
      try{await cloudSpeak(text);}catch(fallbackErr){console.error('AI voice',fallbackErr);finishSpeaking(350);$('#sk-ai-note').textContent=lang==='fa'?'پاسخ متنی آماده است، اما صدا در این مرورگر پخش نشد.':'The text reply is ready, but audio could not play in this browser.';}
    }
  }


  function cleanupIOSRecorder(){
    clearTimeout(iosSilenceTimer);clearTimeout(iosMaxTimer);iosSilenceTimer=iosMaxTimer=null;
    try{iosStream?.getTracks().forEach(t=>t.stop());}catch{} iosStream=null;
    try{iosAudioContext?.close();}catch{} iosAudioContext=null;iosAnalyser=null;iosRecorder=null;
    $('#sk-voice-ai').classList.remove('listening');
  }
  async function transcribeAudio(blob){
    const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=reject;r.readAsDataURL(blob);});
    const response=await fetchWithTimeout(`${cfg.url}/functions/v1/sk-ai-stt`,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.key,'Authorization':`Bearer ${cfg.key}`},body:JSON.stringify({audio:base64,mimeType:blob.type||'audio/mp4',language:VOICE_RECOGNITION_LANG})},15000);
    const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Speech transcription failed');return String(data.text||'').trim();
  }
  async function stopIOSRecording(){
    if(!iosRecorder||iosRecorder.state==='inactive')return;
    try{iosRecorder.stop();}catch{}
  }
  async function startIOSRecording(){
    try{
      iosStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      const mime=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>MediaRecorder.isTypeSupported?.(x))||'';
      iosChunks=[];iosRecorder=new MediaRecorder(iosStream,mime?{mimeType:mime}:undefined);
      iosRecorder.ondataavailable=e=>{if(e.data?.size)iosChunks.push(e.data);};
      iosRecorder.onstop=async()=>{const blob=new Blob(iosChunks,{type:iosRecorder?.mimeType||mime||'audio/mp4'});cleanupIOSRecorder();if(!voiceActive)return;$('#sk-ai-note').textContent=lang==='fa'?'سام صدایت را شنید؛ در حال پاسخ…':'Sam heard you — preparing a reply…';try{const text=await transcribeAudio(blob);if(!text)throw new Error(lang==='fa'?'صدایی تشخیص داده نشد.':'No speech was detected.');await handleVoicePrompt(text);}catch(err){console.error('iOS voice',err);$('#sk-ai-note').textContent=err.message||T().aiError;if(voiceActive)setTimeout(startIOSRecording,250);}};
      iosRecorder.start(200);$('#sk-voice-ai').classList.add('listening');$('#sk-ai-note').textContent=T().aiListening;
      const AC=window.AudioContext||window.webkitAudioContext;iosAudioContext=new AC();const source=iosAudioContext.createMediaStreamSource(iosStream);iosAnalyser=iosAudioContext.createAnalyser();iosAnalyser.fftSize=512;source.connect(iosAnalyser);const data=new Uint8Array(iosAnalyser.fftSize);let heard=false,silentSince=0;
      const monitor=()=>{if(!iosRecorder||iosRecorder.state!=='recording')return;iosAnalyser.getByteTimeDomainData(data);let sum=0;for(const v of data){const n=(v-128)/128;sum+=n*n;}const rms=Math.sqrt(sum/data.length);const now=Date.now();if(rms>.035){heard=true;silentSince=0;}else if(heard){silentSince=silentSince||now;if(now-silentSince>550){stopIOSRecording();return;}}requestAnimationFrame(monitor);};monitor();
      iosMaxTimer=setTimeout(stopIOSRecording,7000);return true;
    }catch(err){cleanupIOSRecorder();console.error('iOS microphone',err);$('#sk-ai-note').textContent=lang==='fa'?'میکروفون آیفون باز نشد. در Settings > Safari > Microphone دسترسی را Allow کن.':'The iPhone microphone could not open. Allow microphone access in Safari settings.';stopVoice(false);return false;}
  }

  if('speechSynthesis'in window){speechSynthesis.getVoices();speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();}
  function buildRecognition(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return null;const r=new SR();r.continuous=false;r.interimResults=false;r.maxAlternatives=3;r.lang=VOICE_RECOGNITION_LANG;
    r.onstart=()=>{clearRecognitionStartTimer();recognitionRetryCount=0;if(isAISpeaking||Date.now()<ignoreRecognitionUntil){try{r.abort();}catch{}return;}$('#sk-voice-ai').classList.add('listening');$('#sk-ai-note').textContent=T().aiListening;};
    r.onresult=e=>{if(isAISpeaking||Date.now()<ignoreRecognitionUntil||voicePromptBusy)return;let final='';for(let i=e.resultIndex;i<e.results.length;i++)final+=e.results[i][0]?.transcript||'';final=final.trim();if(!final)return;const normalized=final.toLocaleLowerCase(),aiEcho=(lastAIOutput||'').trim().toLocaleLowerCase();if(normalized===lastVoicePrompt||aiEcho.includes(normalized)||(aiEcho&&normalized.includes(aiEcho.slice(0,Math.min(40,aiEcho.length)))))return;lastVoicePrompt=normalized;handleVoicePrompt(final);};
    r.onerror=e=>{console.warn('Speech recognition',e.error);$('#sk-voice-ai').classList.remove('listening');if(['not-allowed','service-not-allowed'].includes(e.error)){$('#sk-ai-note').textContent=lang==='fa'?'دسترسی میکروفون بسته است. در تنظیمات سایت آن را Allow کن.':'Microphone access is blocked. Allow it in site settings.';stopVoice(false);return;}if(e.error==='audio-capture'){$('#sk-ai-note').textContent=lang==='fa'?'میکروفون پیدا نشد یا توسط برنامه دیگری استفاده می‌شود.':'No microphone was found or it is busy.';stopVoice(false);return;}if(!['aborted','no-speech'].includes(e.error)){$('#sk-ai-note').textContent=lang==='fa'?'اتصال تشخیص صدا قطع شد؛ دوباره تلاش می‌کنم…':'Voice recognition disconnected; retrying…';recognition=null;}};
    r.onend=()=>{$('#sk-voice-ai').classList.remove('listening');if(voiceActive&&!isAISpeaking&&!voicePromptBusy)setTimeout(startRecognition,300);};return r;
  }
  let recognitionStartTimer=null,recognitionRetryCount=0;
  const mobileVoiceBrowser=()=>/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||matchMedia?.('(pointer: coarse)')?.matches;
  function clearRecognitionStartTimer(){clearTimeout(recognitionStartTimer);recognitionStartTimer=null;}
  function startRecognition(forceFresh=false){
    if(!voiceActive||isAISpeaking||voicePromptBusy||Date.now()<ignoreRecognitionUntil)return false;
    if(forceFresh&&recognition){try{recognition.abort();}catch{}recognition=null;}
    if(!recognition)recognition=buildRecognition();
    if(!recognition){$('#sk-ai-note').textContent=lang==='fa'?'تشخیص گفتار روی این مرورگر فعال نیست.':'Speech recognition is not available in this browser.';return false;}
    clearRecognitionStartTimer();
    try{
      recognition.lang=VOICE_RECOGNITION_LANG;
      recognition.start();
      recognitionStartTimer=setTimeout(()=>{
        if(!voiceActive||$('#sk-voice-ai').classList.contains('listening'))return;
        if(recognitionRetryCount<2){
          recognitionRetryCount++;
          startRecognition(true);
        }else{
          $('#sk-ai-note').textContent=lang==='fa'?'میکروفون آماده است؛ دوباره روی Voice بزن.':'Microphone is ready; tap Voice once more.';
          stopVoice(false);
        }
      },3500);
      return true;
    }catch(err){
      if(err?.name!=='InvalidStateError')console.warn('Recognition start',err);
      if(err?.name==='InvalidStateError')setTimeout(()=>startRecognition(true),250);
      return false;
    }
  }
  function stopVoice(cancelSpeech=true){cleanupIOSRecorder();clearRecognitionStartTimer();recognitionRetryCount=0;voiceActive=false;voiceRestart=false;isAISpeaking=false;voicePromptBusy=false;$('#sk-voice-ai').classList.remove('active','listening','speaking');$('#sk-voice-ai').setAttribute('aria-pressed','false');try{recognition?.abort();}catch{}recognition=null;if(cancelSpeech&&'speechSynthesis'in window)speechSynthesis.cancel();if(cancelSpeech&&currentAudio){currentAudio.pause();currentAudio.src='';currentAudio=null;}if(aiEnabled())$('#sk-ai-note').textContent=T().aiReady;}
  async function handleVoicePrompt(text){if(!text||voicePromptBusy||isAISpeaking)return;voicePromptBusy=true;voiceRestart=true;try{recognition?.abort();}catch{}$('#sk-message').value=text;$('#sk-ai-note').textContent=T().aiThinking;try{const answer=await askAI(text);lastAIOutput=answer;if(user&&supabase){await insertMessage({name:user.name,body:text,reply:null,media:[]});await insertMessage({name:'Sam',body:answer,reply:null,media:[],isAI:true,originClient:'sam-assistant'});}else{$('#sk-ai-studio-input').value=text;$('#sk-ai-studio-output').textContent=answer;openStudio();}voicePromptBusy=false;await speak(answer);}catch(err){voicePromptBusy=false;console.error(err);$('#sk-ai-note').textContent=err.message||T().aiError;if(voiceActive)setTimeout(startRecognition,450);}}
  $('#sk-voice-ai').onclick=async()=>{
    if(!aiEnabled()){$('#sk-ai').checked=true;localStorage.setItem('sk-ai-enabled','1');updateAIUI();}
    if(voiceActive){stopVoice();return;}

    voiceActive=true;voiceRestart=true;recognitionRetryCount=0;
    $('#sk-voice-ai').classList.add('active');
    $('#sk-voice-ai').setAttribute('aria-pressed','true');
    $('#sk-ai-note').textContent=lang==='fa'?'در حال فعال‌کردن میکروفون…':'ACTIVATING MICROPHONE…';
    unlockMobileVoice().catch(()=>{});

    if(isIOS()){
      // Safari on iPhone does not reliably expose Web Speech recognition.
      // Record locally, stop automatically after a short silence, then use the
      // dedicated fast transcription endpoint.
      await startIOSRecording();
    }else if(mobileVoiceBrowser()){
      const allowed=await ensureMicrophonePermission();
      if(!allowed||!voiceActive){stopVoice(false);return;}
      await new Promise(resolve=>setTimeout(resolve,80));
      startRecognition(true);
    }else{
      startRecognition();
    }
  };

  $('#sk-form').onsubmit=async e=>{e.preventDefault();if(sending||aiBusy)return;const text=$('#sk-message').value.trim();if(!text&&!files.length)return;if(!user){$('#sk-login').hidden=false;$('#sk-room').hidden=true;return;}if(!supabase){$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=T().notConfigured;return;}sending=true;const sentFiles=[...files],sentReply=replyTo;$('#sk-connection-note').textContent=T().sending;try{const uploaded=await uploadMedia(sentFiles);await insertMessage({name:user.name,body:text,reply:sentReply,media:uploaded});$('#sk-message').value='';files=[];drawFiles();replyTo=null;$('#sk-reply-preview').hidden=true;if(aiEnabled()){aiBusy=true;const temp={id:'typing',display_name:'Sam',body:'',typing:true,is_ai:true,client_id:'ai'};messages.push(temp);render();const answer=await askAI(text);messages=messages.filter(m=>m!==temp);await insertMessage({name:'Sam',body:answer,reply:null,media:[],isAI:true,originClient:'sam-assistant'});lastAIOutput=answer;$('#sk-ai-note').textContent=T().aiReady;}}catch(err){console.error(err);messages=messages.filter(m=>!m.typing);render();$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=`${T().connectionError} ${err.message||''}`;}finally{aiBusy=false;sending=false;setConnection(channel?'online':'offline',channel?(lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED'):T().connectionError);}};
  $('#sk-message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sk-form').requestSubmit();}};$('#sk-message').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,110)+'px';};
  $('#sk-voice').onclick=async()=>{if(recorder?.state==='recording'){recorder.stop();return;}try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const mime=MediaRecorder.isTypeSupported?.('audio/webm')?'audio/webm':'audio/mp4',blob=new Blob(chunks,{type:mime}),file=new File([blob],`voice-message.${mime.includes('mp4')?'m4a':'webm'}`,{type:mime});files.push({type:mime,url:URL.createObjectURL(blob),file});stream.getTracks().forEach(t=>t.stop());$('#sk-voice').classList.remove('recording');drawFiles();};recorder.start();$('#sk-voice').classList.add('recording');}catch{alert(lang==='fa'?'دسترسی میکروفون داده نشد.':'Microphone permission was not granted.');}};

  function openAdmin(){$('#sk-admin-modal').hidden=false;updateAdminUI();}function closeAdmin(){$('#sk-admin-modal').hidden=true;}$('#sk-admin-open').onclick=openAdmin;$('#sk-admin-close').onclick=closeAdmin;
  function updateAdminUI(){const status=$('#sk-admin-status'),login=$('#sk-admin-login'),logout=$('#sk-admin-logout'),btn=$('#sk-admin-open');if(isAdmin()){status.textContent=lang==='fa'?'ورود مدیر تأیید شد. امکان حذف امن فعال است.':'Admin verified. Secure delete is active.';login.hidden=true;logout.hidden=false;btn.classList.add('verified');btn.textContent='ADMIN ✓';}else{status.textContent=supabase?'':'Supabase is not configured.';login.hidden=false;logout.hidden=true;btn.classList.remove('verified');btn.textContent='ADMIN';}render();}
  $('#sk-admin-login').onclick=async()=>{if(!supabase){$('#sk-admin-status').textContent=T().notConfigured;return;}const redirectTo=location.origin+location.pathname;const{error}=await supabase.auth.signInWithOtp({email:ADMIN_EMAIL,options:{emailRedirectTo:redirectTo,shouldCreateUser:true}});$('#sk-admin-status').textContent=error?error.message:(lang==='fa'?'لینک ورود امن ارسال شد؛ ایمیل را باز کن.':'Secure login link sent. Open it from the verified Gmail inbox.');};
  $('#sk-admin-logout').onclick=async()=>{await supabase?.auth.signOut();authUser=null;updateAdminUI();};
  async function deleteMessage(id){if(!isAdmin()){openAdmin();$('#sk-admin-status').textContent=T().adminRequired;return;}if(!confirm(T().deleteConfirm))return;const m=messages.find(x=>String(x.id)===String(id));try{for(const item of m?.media||[]){if(item.path)await supabase.storage.from('community-media').remove([item.path]);}const{data,error}=await supabase.from('messages').delete().eq('id',id).select('id');if(error)throw error;if(!data?.length)throw new Error('Delete was blocked by database permissions. Run ADMIN-AUTH-SECURE.sql in Supabase.');messages=messages.filter(x=>String(x.id)!==String(id));selectedMessageIds.delete(String(id));render();$('#sk-admin-status').textContent=T().deleted;}catch(err){alert(err.message||T().connectionError);}}
  async function deleteMany(ids,confirmText){
    if(!isAdmin()){openAdmin();$('#sk-admin-status').textContent=T().adminRequired;return;}
    const cleanIds=[...new Set(ids.map(String))];if(!cleanIds.length)return;
    if(!confirm(confirmText))return;
    try{
      const victims=messages.filter(m=>cleanIds.includes(String(m.id)));
      const paths=victims.flatMap(m=>(m.media||[]).map(x=>x.path).filter(Boolean));
      if(paths.length){const{error:storageError}=await supabase.storage.from('community-media').remove(paths);if(storageError)console.warn(storageError);}
      const{data,error}=await supabase.from('messages').delete().in('id',cleanIds).select('id');
      if(error)throw error;
      const deleted=new Set((data||[]).map(x=>String(x.id)));
      if(deleted.size!==cleanIds.length)throw new Error('Delete was blocked by database permissions. Run ADMIN-AUTH-SECURE.sql in Supabase.');
      messages=messages.filter(m=>!deleted.has(String(m.id)));deleted.forEach(id=>selectedMessageIds.delete(id));render();
      $('#sk-admin-status').textContent=`${deleted.size} message(s) deleted.`;
    }catch(err){alert(err.message||T().connectionError);}
  }
  $('#sk-select-all').onchange=e=>{selectedMessageIds.clear();if(e.target.checked)messages.filter(m=>!m.typing).forEach(m=>selectedMessageIds.add(String(m.id)));render();};
  $('#sk-clear-selection').onclick=()=>{selectedMessageIds.clear();render();};
  $('#sk-delete-selected').onclick=()=>deleteMany([...selectedMessageIds],lang==='fa'?'پیام‌های انتخاب‌شده برای همه حذف شوند؟':'Delete selected messages for everyone?');
  $('#sk-delete-all').onclick=()=>deleteMany(messages.filter(m=>!m.typing).map(m=>m.id),lang==='fa'?'همه پیام‌ها برای همه حذف شوند؟':'Delete ALL messages for everyone?');

  async function initAuth(){if(!supabase)return;const{data}=await supabase.auth.getSession();authUser=data.session?.user||null;supabase.auth.onAuthStateChange((_event,session)=>{authUser=session?.user||null;updateAdminUI();});updateAdminUI();}

  $('#sk-ai').checked=localStorage.getItem('sk-ai-enabled')==='1';
  localize();render();updateAIUI();initAuth();connectRealtime();
})();
