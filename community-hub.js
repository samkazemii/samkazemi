(()=>{
  const $ = (s) => document.querySelector(s);
  const panel = $('#sk-community-panel');
  const launch = $('#sk-community-launcher');
  if (!panel || !launch) return;

  const I = {
    en:{hub:'COMMUNITY HUB',designed:'Designed by Sam Kazemi',join:'Join the control-room community',desc:'Ask a production question, share a screenshot, and help other creators.',name:'Display name',email:'Email',notify:'Save my email on this device',enter:'ENTER HUB',placeholder:'Write a message…',reply:'REPLY',preview:'REALTIME',online:'CONNECTING…',err:'Please enter a valid name and email.',aiReady:'AI MODE is ready. Ask a real question.',aiOff:'Turn on AI MODE to receive an AI answer.',aiThinking:'AI is thinking…',aiListening:'AI is transcribing the voice message…',aiLooking:'AI is analyzing the image or video…',aiError:'AI could not answer right now. Please try again.',aiAuth:'Opening secure AI access…',aiAuthError:'AI access was not completed. Tap AI MODE again and allow the sign-in window.',notConfigured:'Realtime is not configured yet. Add the Supabase URL and publishable key.',connectionError:'Could not connect to the realtime server.',sending:'Uploading and sending…'},
    fa:{hub:'هاب کامیونیتی',designed:'طراحی‌شده توسط سام کاظمی',join:'به کامیونیتی اتاق فرمان بپیوندید',desc:'سؤال فنی بپرسید، اسکرین‌شات بفرستید و به تولیدکنندگان دیگر کمک کنید.',name:'نام نمایشی',email:'ایمیل',notify:'ایمیل من فقط روی این دستگاه ذخیره شود',enter:'ورود به هاب',placeholder:'پیامتان را بنویسید…',reply:'پاسخ',preview:'ارتباط زنده',online:'در حال اتصال…',err:'نام و ایمیل معتبر وارد کنید.',aiReady:'حالت هوش مصنوعی آماده است؛ سؤال واقعی‌تان را بپرسید.',aiOff:'برای دریافت پاسخ هوش مصنوعی، AI MODE را روشن کنید.',aiThinking:'هوش مصنوعی در حال فکر کردن است…',aiListening:'هوش مصنوعی در حال تبدیل صدا به متن است…',aiLooking:'هوش مصنوعی در حال بررسی عکس یا ویدئو است…',aiError:'هوش مصنوعی فعلاً نتوانست پاسخ بدهد؛ دوباره امتحان کنید.',aiAuth:'در حال باز کردن دسترسی امن هوش مصنوعی…',aiAuthError:'ورود هوش مصنوعی کامل نشد. دوباره روی AI MODE بزنید و پنجره ورود را اجازه دهید.',notConfigured:'ارتباط زنده هنوز تنظیم نشده است. آدرس و کلید عمومی Supabase را وارد کنید.',connectionError:'اتصال به سرور زنده برقرار نشد.',sending:'در حال آپلود و ارسال…'}
  };

  let lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
  const T = () => I[lang];
  let user = null;
  let replyTo = null;
  let files = [];
  let recorder = null;
  let chunks = [];
  let aiBusy = false;
  let sending = false;
  const aiHistory = [];
  const clientId = localStorage.getItem('sk-community-client-id') || crypto.randomUUID();
  localStorage.setItem('sk-community-client-id', clientId);

  const cfg = window.SK_SUPABASE || {};
  const configured = /^https:\/\/.+\.supabase\.co$/i.test(cfg.url || '') && (cfg.key || '').length > 40 && !/PASTE_/i.test(cfg.key || '');
  const supabase = configured && window.supabase?.createClient ? window.supabase.createClient(cfg.url, cfg.key, {auth:{persistSession:false,autoRefreshToken:false}}) : null;
  let channel = null;
  let messages = [];
  let presence = {};

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function open(v=true){panel.classList.toggle('sk-open',v);panel.setAttribute('aria-hidden',String(!v));launch.setAttribute('aria-expanded',String(v));}
  launch.onclick=()=>open(!panel.classList.contains('sk-open'));
  $('#sk-close').onclick=()=>open(false); $('#sk-min').onclick=()=>open(false);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')open(false);});

  function localize(){
    lang=document.documentElement.lang==='fa'?'fa':'en';
    document.querySelectorAll('[data-ch]').forEach(el=>{const k=el.dataset.ch;if(T()[k])el.textContent=T()[k];});
    $('#sk-message').placeholder=T().placeholder;
    if(!configured) setConnection('offline',T().notConfigured);
    render();
  }
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  function setConnection(state,text){
    const count=$('#sk-online-count'); const note=$('#sk-connection-note');
    note.textContent=text;
    note.dataset.state=state;
    if(state==='online') count.textContent=`${Object.values(presence).flat().length || 1} ONLINE`;
    else count.textContent=state==='connecting'?(lang==='fa'?'در حال اتصال…':'CONNECTING…'):(lang==='fa'?'قطع ارتباط':'OFFLINE');
  }

  function mediaMarkup(media=[]){
    return (media||[]).map(x=>{
      const url=esc(x.url); const type=x.type||'';
      if(type.startsWith('image')) return `<img src="${url}" alt="Uploaded image" loading="lazy">`;
      if(type.startsWith('video')) return `<video controls preload="metadata" src="${url}"></video>`;
      return `<audio controls preload="metadata" src="${url}"></audio>`;
    }).join('');
  }

  function render(){
    $('#sk-messages').innerHTML=messages.map(m=>`
      <article class="sk-msg ${m.client_id===clientId?'mine':''} ${m.typing?'sk-typing':''}">
        <span class="sk-msg-avatar">${esc((m.display_name||'U').slice(0,2).toUpperCase())}</span>
        <div class="sk-msg-body"><div class="sk-msg-meta"><b>${esc(m.display_name)}</b>${m.is_ai?' · AI':''}</div>
        <div class="sk-bubble">${m.typing?'<span class="sk-dots"><i></i><i></i><i></i></span>':esc(m.body)}
        ${m.reply_body?`<div class="sk-quoted">↳ ${esc(m.reply_body)}</div>`:''}${mediaMarkup(m.media)}</div>
        ${m.typing?'':`<button class="sk-reply-btn" data-reply="${m.id}">${T().reply}</button>`}</div></article>`).join('');
    $('#sk-messages').scrollTop=$('#sk-messages').scrollHeight;
    document.querySelectorAll('[data-reply]').forEach(b=>b.onclick=()=>{
      const m=messages.find(x=>String(x.id)===String(b.dataset.reply)); if(!m)return;
      replyTo=m; $('#sk-reply-text').textContent=(m.body||'').slice(0,90); $('#sk-reply-preview').hidden=false; $('#sk-message').focus();
    });
  }

  function renderPresence(){
    const people=Object.values(presence).flat();
    const unique=[]; const seen=new Set();
    people.forEach(p=>{if(!seen.has(p.client_id)){seen.add(p.client_id);unique.push(p);}});
    $('#sk-online-users').innerHTML=unique.map(p=>`<li><span class="sk-avatar">${esc((p.name||'U').slice(0,2).toUpperCase())}</span><div><b>${esc(p.name||'Guest')}</b><small>${p.client_id===clientId?'You':'Online'}</small></div></li>`).join('') || `<li><div><small>${lang==='fa'?'در حال دریافت فهرست…':'Loading presence…'}</small></div></li>`;
    if(channel) setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');
  }

  async function loadMessages(){
    const {data,error}=await supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(150);
    if(error) throw error;
    messages=(data||[]).map(m=>({...m,reply_body:null}));
    const ids=[...new Set(messages.map(m=>m.reply_to).filter(Boolean))];
    if(ids.length){
      const {data:parents}=await supabase.from('messages').select('id,body').in('id',ids);
      const map=new Map((parents||[]).map(x=>[x.id,x.body])); messages.forEach(m=>m.reply_body=map.get(m.reply_to)||null);
    }
    render();
  }

  async function connectRealtime(){
    if(!supabase){setConnection('offline',T().notConfigured);return;}
    setConnection('connecting',lang==='fa'?'در حال اتصال به سرور…':'CONNECTING TO REALTIME…');
    try{
      await loadMessages();
      channel=supabase.channel('sam-community-live',{config:{presence:{key:clientId}}})
        .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},async payload=>{
          const row=payload.new;
          if(messages.some(m=>m.id===row.id)) return;
          if(row.reply_to){const p=messages.find(m=>m.id===row.reply_to);row.reply_body=p?.body||null;}
          messages.push(row); messages.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at)); render();
        })
        .on('presence',{event:'sync'},()=>{presence=channel.presenceState();renderPresence();})
        .on('presence',{event:'join'},()=>{presence=channel.presenceState();renderPresence();})
        .on('presence',{event:'leave'},()=>{presence=channel.presenceState();renderPresence();})
        .subscribe(async status=>{
          if(status==='SUBSCRIBED'){
            await channel.track({client_id:clientId,name:user?.name||'Guest',online_at:new Date().toISOString()});
            setConnection('online',lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED');
          } else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT') setConnection('offline',T().connectionError);
        });
    }catch(err){console.error(err);setConnection('offline',`${T().connectionError} ${err.message||''}`);}
  }

  $('#sk-cancel-reply').onclick=()=>{replyTo=null;$('#sk-reply-preview').hidden=true;};
  $('#sk-enter').onclick=async()=>{
    const n=$('#sk-name').value.trim(),e=$('#sk-email').value.trim();
    if(n.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){ $('#sk-login-error').textContent=T().err;return; }
    user={name:n,email:e}; localStorage.setItem('sk-community-user-v2',JSON.stringify(user));
    $('#sk-login').hidden=true;$('#sk-room').hidden=false;render();
    if(channel) await channel.track({client_id:clientId,name:user.name,online_at:new Date().toISOString()});
  };
  try{user=JSON.parse(localStorage.getItem('sk-community-user-v2')||'null');if(user){$('#sk-name').value=user.name;$('#sk-email').value=user.email;}}catch{}

  $('#sk-file').onchange=e=>{
    [...e.target.files].slice(0,3).forEach(file=>{if(file.size<=12*1024*1024)files.push({type:file.type,url:URL.createObjectURL(file),file});});drawFiles();e.target.value='';
  };
  function drawFiles(){
    $('#sk-attachments').innerHTML=files.map((f,i)=>`<span class="sk-chip">${f.type.startsWith('image')?`<img src="${f.url}" alt="attachment">`:`<span>${esc(f.file.name)}</span>`}<button data-x="${i}" type="button">×</button></span>`).join('');
    document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{files.splice(+b.dataset.x,1);drawFiles();});
  }

  async function uploadMedia(items){
    const result=[];
    for(const item of items){
      const safe=(item.file.name||'media').replace(/[^a-zA-Z0-9._-]/g,'-');
      const path=`${clientId}/${Date.now()}-${crypto.randomUUID()}-${safe}`;
      const {error}=await supabase.storage.from('community-media').upload(path,item.file,{contentType:item.type,upsert:false});
      if(error) throw error;
      const {data}=supabase.storage.from('community-media').getPublicUrl(path);
      result.push({type:item.type,url:data.publicUrl,name:item.file.name});
    }
    return result;
  }

  async function waitForPuter(timeout=8000){
    const started=Date.now();
    while(Date.now()-started<timeout){
      if(window.puter?.ai?.chat && window.puter?.auth) return window.puter;
      await new Promise(r=>setTimeout(r,120));
    }
    throw new Error('AI library did not load');
  }

  async function enableAIFromUserGesture(){
    const box=$('#sk-ai'),control=$('#sk-ai-control'),note=$('#sk-ai-note');
    control?.classList.add('sk-ai-pending');
    note.hidden=false;note.textContent=T().aiAuth;
    try{
      const p=await waitForPuter();
      if(!p.auth.isSignedIn()) await p.auth.signIn({attempt_temp_user_creation:true});
      box.checked=true;control?.classList.remove('sk-ai-pending');control?.classList.add('sk-ai-on');
      note.textContent=T().aiReady;
      localStorage.setItem('sk-ai-enabled','1');
      return true;
    }catch(err){
      console.error('AI authentication failed',err);
      box.checked=false;control?.classList.remove('sk-ai-pending','sk-ai-on');
      note.textContent=T().aiAuthError;
      localStorage.removeItem('sk-ai-enabled');
      return false;
    }
  }

  function responseText(result){const c=result?.message?.content??result?.content??result;if(typeof c==='string')return c.trim();if(Array.isArray(c))return c.map(p=>typeof p==='string'?p:(p?.text||p?.content||'')).join('\n').trim();return String(c||'').trim();}
  function systemPrompt(){return lang==='fa'?'تو دستیار هوش مصنوعی Community Hub سام کاظمی هستی. در زمینه vMix، تولید زنده، تدوین، افترافکت، صدا و عیب‌یابی پاسخ دقیق و عملی بده. به زبان پیام کاربر جواب بده و جواب ثابت تکرار نکن.':'You are the AI assistant inside Sam Kazemi’s Community Hub. Give accurate practical help with vMix, live production, editing, After Effects, audio and troubleshooting. Reply in the user’s language and never use canned responses.';}
  function transcriptText(r){if(typeof r==='string')return r.trim();return String(r?.text??r?.transcript??r?.output_text??'').trim();}
  async function transcribeAudio(items){if(!items.length)return[];const p=await waitForPuter();if(!p.ai?.speech2txt)throw new Error('Speech service did not load');const out=[];for(const x of items.slice(0,3)){const r=await p.ai.speech2txt(x.file,{response_format:'text'});const t=transcriptText(r);if(t)out.push(t);}return out;}
  async function askAI(text,media,onStage){
    const p=await waitForPuter();
    if(!p.auth.isSignedIn()) throw new Error('AI authentication required');
    const audio=media.filter(x=>x.type?.startsWith('audio')),visual=media.filter(x=>x.type?.startsWith('image')||x.type?.startsWith('video'));
    let transcripts=[];if(audio.length){onStage('listening');transcripts=await transcribeAudio(audio);}
    const transcriptBlock=transcripts.length?(lang==='fa'?`متن پیام صوتی:\n${transcripts.join('\n')}`:`Voice transcript:\n${transcripts.join('\n')}`):'';
    const userText=[text,transcriptBlock].filter(Boolean).join('\n\n')||(lang==='fa'?'فایل پیوست را تحلیل کن.':'Analyze the attachment.');
    let answer='';
    if(visual.length){onStage('looking');const answers=[];for(const v of visual.slice(0,3)){const r=await p.ai.chat(`${systemPrompt()}\n\n${userText}`,v.file,{model:'gpt-5.4-nano',temperature:.25,max_tokens:1000});const a=responseText(r);if(a)answers.push(a);}answer=answers.join('\n\n');}
    else{onStage('thinking');const r=await p.ai.chat([{role:'system',content:systemPrompt()},...aiHistory.slice(-10),{role:'user',content:userText}],{model:'gpt-5.4-nano',temperature:.3,max_tokens:1000});answer=responseText(r);}
    if(!answer)throw new Error('Empty AI response'); aiHistory.push({role:'user',content:userText},{role:'assistant',content:answer});return answer;
  }

  async function insertMessage({name,body,reply,media,isAI=false,originClient=clientId}){
    const {data,error}=await supabase.from('messages').insert({client_id:originClient,display_name:name,body:body||'',reply_to:reply?.id||null,media:media||[],is_ai:isAI}).select().single();
    if(error)throw error;
    if(!messages.some(m=>m.id===data.id)){data.reply_body=reply?.body||null;messages.push(data);render();}
    return data;
  }

  $('#sk-form').onsubmit=async e=>{
    e.preventDefault();if(sending||aiBusy)return;
    const text=$('#sk-message').value.trim();if(!text&&!files.length)return;
    if(!user){$('#sk-login').hidden=false;$('#sk-room').hidden=true;return;}
    if(!supabase){$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=T().notConfigured;return;}
    sending=true;const sentFiles=[...files],sentReply=replyTo;$('#sk-connection-note').textContent=T().sending;
    try{
      const uploaded=await uploadMedia(sentFiles);
      await insertMessage({name:user.name,body:text,reply:sentReply,media:uploaded});
      $('#sk-message').value='';files=[];drawFiles();replyTo=null;$('#sk-reply-preview').hidden=true;
      if($('#sk-ai').checked){
        aiBusy=true;$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=T().aiThinking;
        const temp={id:'typing',display_name:'AI Assistant',body:'',typing:true,is_ai:true,client_id:'ai'};messages.push(temp);render();
        try{const answer=await askAI(text,sentFiles,stage=>$('#sk-ai-note').textContent=stage==='listening'?T().aiListening:stage==='looking'?T().aiLooking:T().aiThinking);messages=messages.filter(m=>m!==temp);await insertMessage({name:'AI Assistant',body:answer,reply:null,media:[],isAI:true,originClient:'ai-assistant'});$('#sk-ai-note').textContent=T().aiReady;}
        catch(err){console.error(err);messages=messages.filter(m=>m!==temp);render();$('#sk-ai-note').textContent=T().aiError;}
        finally{aiBusy=false;}
      }
    }catch(err){console.error(err);$('#sk-ai-note').hidden=false;$('#sk-ai-note').textContent=`${T().connectionError} ${err.message||''}`;}
    finally{sending=false;setConnection(channel?'online':'offline',channel?(lang==='fa'?'ارتباط زنده برقرار است':'REALTIME CONNECTED'):T().connectionError);}
  };

  $('#sk-message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#sk-form').requestSubmit();}};
  $('#sk-message').oninput=e=>{e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,110)+'px';};
  $('#sk-ai').onchange=async e=>{
    const n=$('#sk-ai-note'),control=$('#sk-ai-control');
    if(e.target.checked){
      e.target.checked=false;
      await enableAIFromUserGesture();
    }else{
      control?.classList.remove('sk-ai-on','sk-ai-pending');
      n.hidden=false;n.textContent=T().aiOff;
      localStorage.removeItem('sk-ai-enabled');
    }
  };
  $('#sk-voice').onclick=async()=>{
    if(recorder?.state==='recording'){recorder.stop();return;}
    try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const blob=new Blob(chunks,{type:'audio/webm'}),file=new File([blob],'voice-message.webm',{type:'audio/webm'});files.push({type:'audio/webm',url:URL.createObjectURL(blob),file});stream.getTracks().forEach(t=>t.stop());$('#sk-voice').classList.remove('recording');drawFiles();};recorder.start();$('#sk-voice').classList.add('recording');}
    catch{alert(lang==='fa'?'دسترسی میکروفون داده نشد.':'Microphone permission was not granted.');}
  };

  (async()=>{
    const box=$('#sk-ai'),control=$('#sk-ai-control');
    box.checked=false;control?.classList.remove('sk-ai-on','sk-ai-pending');
    try{
      const p=await waitForPuter(3500);
      if(localStorage.getItem('sk-ai-enabled')==='1' && p.auth.isSignedIn()){
        box.checked=true;control?.classList.add('sk-ai-on');
      }
    }catch{}
  })();
  localize();render();connectRealtime();
})();
