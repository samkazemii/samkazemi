(()=>{
  const $ = (s) => document.querySelector(s);
  const panel = $('#sk-community-panel');
  const launch = $('#sk-community-launcher');
  if (!panel || !launch) return;

  const I = {
    en: {
      hub: 'COMMUNITY HUB', designed: 'Designed by Sam Kazemi',
      join: 'Join the control-room community',
      desc: 'Ask a production question, share a screenshot, and help other creators.',
      name: 'Display name', email: 'Email', notify: 'Email me when someone replies',
      enter: 'ENTER HUB', placeholder: 'Write a message…', reply: 'REPLY',
      preview: 'COMMUNITY MODE', online: '3 ONLINE',
      err: 'Please enter a valid name and email.',
      aiReady: 'AI MODE is ready. Ask a real question.',
      aiOff: 'Turn on AI MODE to receive an AI answer.',
      aiThinking: 'AI is thinking…',
      aiListening: 'AI is transcribing the voice message…',
      aiLooking: 'AI is analyzing the image or video…',
      aiError: 'AI could not answer right now. Please try again.',
      aiLogin: 'The AI service may ask you to sign in once before the first answer.'
    },
    fa: {
      hub: 'هاب کامیونیتی', designed: 'طراحی‌شده توسط سام کاظمی',
      join: 'به کامیونیتی اتاق فرمان بپیوندید',
      desc: 'سؤال فنی بپرسید، اسکرین‌شات بفرستید و به تولیدکنندگان دیگر کمک کنید.',
      name: 'نام نمایشی', email: 'ایمیل', notify: 'وقتی پاسخی دریافت کردم ایمیل بفرست',
      enter: 'ورود به هاب', placeholder: 'پیامتان را بنویسید…', reply: 'پاسخ',
      preview: 'حالت کامیونیتی', online: '۳ نفر آنلاین',
      err: 'نام و ایمیل معتبر وارد کنید.',
      aiReady: 'حالت هوش مصنوعی آماده است؛ سؤال واقعی‌تان را بپرسید.',
      aiOff: 'برای دریافت پاسخ هوش مصنوعی، AI MODE را روشن کنید.',
      aiThinking: 'هوش مصنوعی در حال فکر کردن است…',
      aiListening: 'هوش مصنوعی در حال تشخیص و تبدیل صدا به متن است…',
      aiLooking: 'هوش مصنوعی در حال بررسی عکس یا ویدئو است…',
      aiError: 'هوش مصنوعی فعلاً نتوانست پاسخ بدهد؛ دوباره امتحان کنید.',
      aiLogin: 'ممکن است سرویس هوش مصنوعی برای اولین پاسخ فقط یک‌بار از شما ورود بخواهد.'
    }
  };

  let lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
  let user = null;
  let replyTo = null;
  let files = [];
  let recorder = null;
  let chunks = [];
  let aiBusy = false;
  const aiHistory = [];
  const T = () => I[lang];

  function localize(){
    lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
    document.querySelectorAll('[data-ch]').forEach((el)=>{
      const key = el.dataset.ch;
      if (T()[key]) el.textContent = T()[key];
    });
    $('#sk-message').placeholder = T().placeholder;
    const note = $('#sk-ai-note');
    if ($('#sk-ai').checked) {
      note.hidden = false;
      note.textContent = T().aiReady;
    }
    render();
  }

  new MutationObserver(localize).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang']
  });

  function open(v=true){
    panel.classList.toggle('sk-open', v);
    panel.setAttribute('aria-hidden', String(!v));
    launch.setAttribute('aria-expanded', String(v));
  }
  launch.onclick = () => open(!panel.classList.contains('sk-open'));
  $('#sk-close').onclick = () => open(false);
  $('#sk-min').onclick = () => open(false);
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') open(false);
  });

  const base = [
    {name:'Sam', text:'Welcome! Share a screenshot or question about live production and editing.', fa:'خوش آمدید! سؤال یا اسکرین‌شات خودتان درباره تدوین و تولید زنده را بفرستید.'},
    {name:'Leyla', text:'I can help with editing workflows and After Effects.', fa:'من می‌توانم درباره روند تدوین و افترافکت کمک کنم.'}
  ];

  let msgs = [];
  try { msgs = JSON.parse(localStorage.getItem('sk-community-messages-v3') || '[]'); } catch {}

  function esc(s){
    return String(s ?? '').replace(/[&<>"']/g, (c)=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function mediaMarkup(media=[]){
    return media.map((x)=>{
      if (x.type?.startsWith('image')) return `<img src="${x.url}" alt="Uploaded image">`;
      if (x.type?.startsWith('video')) return `<video controls src="${x.url}"></video>`;
      return `<audio controls src="${x.url}"></audio>`;
    }).join('');
  }

  function render(){
    const all = [...base, ...msgs];
    $('#sk-messages').innerHTML = all.map((m,i)=>`
      <article class="sk-msg ${m.mine?'mine':''} ${m.typing?'sk-typing':''}">
        <span class="sk-msg-avatar">${esc((m.name || 'U').slice(0,2).toUpperCase())}</span>
        <div class="sk-msg-body">
          <div class="sk-msg-meta"><b>${esc(m.name)}</b></div>
          <div class="sk-bubble">${m.typing?'<span class="sk-dots"><i></i><i></i><i></i></span>':esc(lang==='fa'&&m.fa?m.fa:m.text)}
            ${m.reply?`<div class="sk-quoted">↳ ${esc(m.reply)}</div>`:''}
            ${mediaMarkup(m.media)}
          </div>
          ${m.typing?'':`<button class="sk-reply-btn" data-reply="${i}">${T().reply}</button>`}
        </div>
      </article>`).join('');
    $('#sk-messages').scrollTop = $('#sk-messages').scrollHeight;
    document.querySelectorAll('[data-reply]').forEach((b)=>{
      b.onclick = ()=>{
        const m = all[+b.dataset.reply];
        replyTo = (lang==='fa' && m.fa ? m.fa : m.text).slice(0,90);
        $('#sk-reply-text').textContent = replyTo;
        $('#sk-reply-preview').hidden = false;
        $('#sk-message').focus();
      };
    });
  }

  $('#sk-cancel-reply').onclick = ()=>{
    replyTo = null;
    $('#sk-reply-preview').hidden = true;
  };

  $('#sk-enter').onclick = ()=>{
    const n = $('#sk-name').value.trim();
    const e = $('#sk-email').value.trim();
    if (n.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      $('#sk-login-error').textContent = T().err;
      return;
    }
    user = {name:n,email:e};
    localStorage.setItem('sk-community-user-v2', JSON.stringify(user));
    $('#sk-login').hidden = true;
    $('#sk-room').hidden = false;
    render();
  };

  try {
    user = JSON.parse(localStorage.getItem('sk-community-user-v2') || 'null');
    if (user) {
      $('#sk-name').value = user.name;
      $('#sk-email').value = user.email;
    }
  } catch {}

  $('#sk-file').onchange = (e)=>{
    [...e.target.files].slice(0,3).forEach((file)=>{
      if (file.size > 12*1024*1024) return;
      files.push({type:file.type, url:URL.createObjectURL(file), file});
    });
    drawFiles();
    e.target.value = '';
  };

  function drawFiles(){
    $('#sk-attachments').innerHTML = files.map((f,i)=>`
      <span class="sk-chip">
        ${f.type.startsWith('image')?`<img src="${f.url}" alt="attachment">`:`<video src="${f.url}"></video>`}
        <button data-x="${i}" type="button">×</button>
      </span>`).join('');
    document.querySelectorAll('[data-x]').forEach((b)=>{
      b.onclick = ()=>{
        files.splice(+b.dataset.x,1);
        drawFiles();
      };
    });
  }

  function responseText(result){
    const content = result?.message?.content ?? result?.content ?? result;
    if (typeof content === 'string') return content.trim();
    if (Array.isArray(content)) {
      return content.map((part)=>typeof part === 'string' ? part : (part?.text || part?.content || '')).join('\n').trim();
    }
    return String(content || '').trim();
  }

  function systemPrompt(){
    return lang === 'fa'
      ? 'تو دستیار هوش مصنوعی Community Hub سام کاظمی هستی. در زمینه vMix، تولید زنده تلویزیونی، تدوین، افترافکت، صدا و عیب‌یابی فنی کمک دقیق و عملی بده. همیشه به زبان پیام کاربر پاسخ بده. پاسخ را متناسب با سؤال بنویس و هرگز یک جواب ثابت و تکراری نده. اگر اطلاعات کافی نیست، سؤال روشن‌کننده بپرس. کوتاه اما مفید باش.'
      : 'You are the AI assistant inside Sam Kazemi’s Community Hub. Give accurate, practical help with vMix, live television production, editing, After Effects, audio, and technical troubleshooting. Reply in the user’s language. Tailor every answer to the actual question and never repeat a canned response. Ask a clarifying question when needed. Be concise but useful.';
  }

  function transcriptText(result){
    if (typeof result === 'string') return result.trim();
    return String(result?.text ?? result?.transcript ?? result?.output_text ?? '').trim();
  }

  async function transcribeAudio(audioFiles){
    if (!audioFiles.length) return [];
    if (!window.puter?.ai?.speech2txt) throw new Error('Speech recognition service did not load');
    const transcripts = [];
    for (const item of audioFiles.slice(0, 3)) {
      const result = await window.puter.ai.speech2txt(item.file, {
        response_format: 'text'
      });
      const transcript = transcriptText(result);
      if (transcript) transcripts.push(transcript);
    }
    return transcripts;
  }

  function mediaInstruction(visualCount, audioTranscripts){
    const parts = [];
    if (visualCount) {
      parts.push(lang === 'fa'
        ? 'عکس یا ویدئوی پیوست‌شده را دقیق بررسی کن. جزئیات قابل مشاهده، خطاها، متن‌های روی تصویر و راه‌حل عملی را توضیح بده.'
        : 'Carefully inspect the attached image or video. Explain visible details, errors, on-screen text, and practical fixes.');
    }
    if (audioTranscripts.length) {
      parts.push(lang === 'fa'
        ? `متن تشخیص‌داده‌شده از پیام صوتی:\n${audioTranscripts.map((x,i)=>`${i+1}. ${x}`).join('\n')}`
        : `Transcribed voice message:\n${audioTranscripts.map((x,i)=>`${i+1}. ${x}`).join('\n')}`);
    }
    return parts.join('\n\n');
  }

  async function askAI(text, mediaFiles, onStage){
    if (!window.puter?.ai?.chat) throw new Error('AI library did not load');

    const audioFiles = mediaFiles.filter((x)=>x.file && x.type?.startsWith('audio'));
    const visualFiles = mediaFiles.filter((x)=>x.file && (x.type?.startsWith('image') || x.type?.startsWith('video')));

    let audioTranscripts = [];
    if (audioFiles.length) {
      onStage?.('listening');
      audioTranscripts = await transcribeAudio(audioFiles);
    }

    const mediaContext = mediaInstruction(visualFiles.length, audioTranscripts);
    const userText = [text, mediaContext].filter(Boolean).join('\n\n') ||
      (lang === 'fa' ? 'فایل پیوست‌شده را تحلیل کن و پاسخ دقیق بده.' : 'Analyze the attached file and give a precise answer.');

    let result;
    if (visualFiles.length) {
      onStage?.('looking');
      // Puter accepts a File directly as visual context. Analyze up to three files
      // one by one so every attachment receives a real model inspection.
      const visualAnswers = [];
      for (let i = 0; i < visualFiles.slice(0, 3).length; i++) {
        const visual = visualFiles[i];
        const visualPrompt = `${systemPrompt()}\n\n${userText}\n\n${lang === 'fa' ? `پیوست تصویری/ویدئویی شماره ${i+1} را بررسی کن.` : `Analyze visual attachment ${i+1}.`}`;
        const visualResult = await window.puter.ai.chat(
          visualPrompt,
          visual.file,
          {model:'gpt-5.4-nano', temperature:0.25, max_tokens:1000}
        );
        const visualAnswer = responseText(visualResult);
        if (visualAnswer) visualAnswers.push(visualAnswer);
      }
      if (!visualAnswers.length) throw new Error('Empty visual analysis response');
      result = visualAnswers.join('\n\n');
    } else {
      onStage?.('thinking');
      const messages = [
        {role:'system', content:systemPrompt()},
        ...aiHistory.slice(-10),
        {role:'user', content:userText}
      ];
      result = await window.puter.ai.chat(messages, {
        model:'gpt-5.4-nano', temperature:0.3, max_tokens:1000
      });
    }

    const answer = typeof result === 'string' ? result.trim() : responseText(result);
    if (!answer) throw new Error('Empty AI response');
    aiHistory.push({role:'user',content:userText},{role:'assistant',content:answer});
    return answer;
  }

  $('#sk-form').onsubmit = async (e)=>{
    e.preventDefault();
    if (aiBusy) return;
    const text = $('#sk-message').value.trim();
    if (!text && !files.length) return;
    if (!user) {
      $('#sk-login').hidden = false;
      $('#sk-room').hidden = true;
      return;
    }

    const sentFiles = [...files];
    msgs.push({name:user.name,text,mine:true,reply:replyTo,media:sentFiles});
    localStorage.setItem('sk-community-messages-v3', JSON.stringify(msgs.map((m)=>({...m,media:[]}))));
    $('#sk-message').value = '';
    files = [];
    drawFiles();
    replyTo = null;
    $('#sk-reply-preview').hidden = true;
    render();

    if (!$('#sk-ai').checked) return;

    aiBusy = true;
    $('#sk-ai-note').hidden = false;
    $('#sk-ai-note').textContent = T().aiThinking;
    msgs.push({name:'AI Assistant',text:'',typing:true});
    render();

    try {
      const answer = await askAI(text, sentFiles, (stage)=>{
        $('#sk-ai-note').textContent = stage === 'listening' ? T().aiListening : stage === 'looking' ? T().aiLooking : T().aiThinking;
      });
      msgs = msgs.filter((m)=>!m.typing);
      msgs.push({name:'AI Assistant',text:answer});
      localStorage.setItem('sk-community-messages-v3', JSON.stringify(msgs.map((m)=>({...m,media:[]}))));
      $('#sk-ai-note').textContent = T().aiReady;
    } catch (err) {
      console.error('Community AI error:', err);
      msgs = msgs.filter((m)=>!m.typing);
      const detail = err?.message && !/cancel|closed|denied/i.test(err.message) ? ` (${err.message})` : '';
      msgs.push({name:'AI Assistant',text:T().aiError + detail});
      $('#sk-ai-note').textContent = T().aiLogin;
    } finally {
      aiBusy = false;
      render();
    }
  };

  $('#sk-message').onkeydown = (e)=>{
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('#sk-form').requestSubmit();
    }
  };
  $('#sk-message').oninput = (e)=>{
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight,110) + 'px';
  };

  $('#sk-ai').onchange = (e)=>{
    const note = $('#sk-ai-note');
    note.hidden = !e.target.checked;
    note.textContent = e.target.checked ? T().aiReady : T().aiOff;
  };

  $('#sk-voice').onclick = async ()=>{
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e)=>chunks.push(e.data);
      recorder.onstop = ()=>{
        const blob = new Blob(chunks,{type:'audio/webm'});
        const file = new File([blob], 'voice-message.webm', {type:'audio/webm'});
        files.push({type:'audio/webm',url:URL.createObjectURL(blob),file});
        stream.getTracks().forEach((t)=>t.stop());
        $('#sk-voice').classList.remove('recording');
        drawFiles();
      };
      recorder.start();
      $('#sk-voice').classList.add('recording');
    } catch {
      alert(lang==='fa'?'دسترسی میکروفون داده نشد.':'Microphone permission was not granted.');
    }
  };

  localize();
  render();
})();
