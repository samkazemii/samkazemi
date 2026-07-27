(() => {
  const fa = {
    'INITIALIZING CONTROL ROOM...':'در حال راه‌اندازی اتاق فرمان…','VMIX SYSTEM':'سیستم vMix','SAM KAZEMI':'سام کاظمی',
    'Game':'بازی','Expertise':'تخصص‌ها','About':'درباره من','Skills':'مهارت‌ها','LinkedIn ↗':'لینکدین ↗',
    'LIVE BROADCAST DIRECTION':'کارگردانی پخش زنده','SAM':'سام','KAZEMI':'کاظمی','TV DIRECTOR & BROADCAST SPECIALIST':'کارگردان تلویزیونی و متخصص پخش',
    'Director, producer and control-room operator creating confident live television, current-affairs programs and visual broadcast systems.':'کارگردان، تهیه‌کننده و اپراتور اتاق فرمان؛ سازنده برنامه‌های زنده تلویزیونی، برنامه‌های روز و سامانه‌های تصویری پخش.',
    'ENTER CONTROL ROOM':'ورود به اتاق فرمان','PROGRAM':'خروجی','PREVIEW':'پیش‌نمایش','LIVE CONTROL ROOM':'اتاق فرمان زنده','START CHALLENGE':'شروع چالش',
    'TV DIRECTION':'کارگردانی تلویزیونی','LIVE PRODUCTION':'تولید زنده','BROADCAST DESIGN':'طراحی پخش','CONTROL ROOM':'اتاق فرمان','VISUAL STORYTELLING':'روایت تصویری',
    'CONTROL ROOM CHALLENGE':'چالش اتاق فرمان','Can you take the show live':'می‌توانی برنامه را','in 30 seconds?':'در ۳۰ ثانیه زنده کنی؟',
    'Follow the cue on the program monitor and press the correct control. One wrong move resets the sequence.':'راهنمای مانیتور خروجی را دنبال کن و کنترل درست را بزن. یک حرکت اشتباه، مراحل را از اول شروع می‌کند.',
    'STANDBY':'آماده‌باش','STEP':'مرحله','SEC':'ثانیه','AUDIO':'صدا','PRESS START TO BEGIN':'برای شروع، دکمه شروع را بزن',
    'You have 30 seconds to complete the broadcast sequence.':'۳۰ ثانیه فرصت داری مراحل پخش را کامل کنی.','REMOTE':'مهمان راه دور','CURRENT OPERATION':'عملیات فعلی',
    'Console offline':'کنسول خاموش است','Start the broadcast to receive your first cue.':'پخش را شروع کن تا اولین فرمان را بگیری.','00:00 — System ready.':'۰۰:۰۰ — سیستم آماده است.',
    'GO LIVE':'رفتن روی آنتن','START BROADCAST':'شروع پخش','ACCESS GRANTED':'دسترسی تأیید شد','Broadcast Successful':'پخش موفق بود',
    'You are now a good friend of Sam Kazemi.':'حالا تو یکی از دوستان خوب سام کاظمی هستی.','PLAY AGAIN':'دوباره بازی کن',
    'LIVE SOUND PAD':'پد صدای زنده','Play a clean seven-note':'یک ملودی هفت‌نتی تمیز','broadcast melody.':'برای پخش اجرا کن.',
    'Tap the pads to play Do, Re, Mi, Fa, Sol, La and Si. Every note lights up with its own color.':'برای نواختن دو، ر، می، فا، سل، لا و سی روی پدها بزن. هر نت با رنگ مخصوص خودش روشن می‌شود.',
    'TOUCH / CLICK ENABLED':'لمس و کلیک فعال است','READY':'آماده','WEB AUDIO SYNTH':'سینت‌سایزر صوتی وب','You can also use keyboard keys A–J.':'می‌توانی از کلیدهای A تا J کیبورد هم استفاده کنی.',
    'LIVE DIRECTOR CHALLENGE':'چالش کارگردان پخش زنده','Build the shot.':'قاب را بساز.','Beat the clock.':'زمان را شکست بده.',
    'You have two minutes: choose or upload media, build the shot, start Record, then take it to Program with CUT, FADE, or MERGE.':'دو دقیقه فرصت داری: یک رسانه انتخاب یا آپلود کن، قاب را بساز، ضبط را شروع کن و سپس با CUT، FADE یا MERGE آن را به خروجی بفرست.',
    'LIVE SWITCHING TEST':'آزمون سوئیچ زنده','PRESS START':'شروع را بزن','START 2:00':'شروع ۲:۰۰','DIRECTOR SIM':'شبیه‌ساز کارگردانی','START RECORD':'شروع ضبط','RECORDING':'در حال ضبط',
    'EMPTY':'خالی','SELECT MEDIA':'رسانه را انتخاب کن','BREAKING COVERAGE':'پوشش خبری فوری','CUT':'کات','FADE':'فید','MERGE':'مرج','OFF AIR':'خارج از آنتن','ON PROGRAM':'روی خروجی',
    '1. Media Inputs':'۱. ورودی‌های رسانه','Click any input at any time. It goes straight to Preview. Then use CUT, FADE or MERGE to send it to Program.':'هر زمان روی هر ورودی کلیک کنی، مستقیم وارد پیش‌نمایش می‌شود. سپس با CUT، FADE یا MERGE آن را به خروجی بفرست.',
    'SUNSET LIVE':'غروب زنده','PODCAST CAM':'دوربین پادکست','UPLOAD INPUT':'آپلود ورودی','PHOTO OR VIDEO':'عکس یا ویدئو','2. Shot Designer':'۲. طراح قاب',
    'Build the frame yourself — nothing is forced onto the media.':'قاب را خودت بساز؛ هیچ چیزی به‌صورت اجباری روی رسانه قرار نمی‌گیرد.','CLEAN':'ساده','LOWER THIRD':'زیرنویس','NEWS':'خبر','GAMING':'بازی','INTERVIEW':'مصاحبه','CINEMA':'سینمایی',
    'Fit':'نحوه نمایش','FIT':'جا دادن','FILL':'پر کردن','Zoom':'بزرگ‌نمایی','Horizontal':'افقی','Vertical':'عمودی','Title':'عنوان','Type your title':'عنوان خود را بنویس',
    'Show graphics overlay':'نمایش گرافیک روی تصویر','RESET SHOT':'بازنشانی قاب','RESET':'بازنشانی','You made Program live before the deadline.':'پیش از پایان زمان، خروجی را زنده کردی.',
    'EXPERTISE':'تخصص‌ها','Calm under pressure.':'آرام زیر فشار.','Sharp on every cue.':'دقیق در هر فرمان.','Broadcast Direction':'کارگردانی پخش',
    'Calling cameras, coordinating talent and shaping the rhythm of a live program.':'فرمان دوربین‌ها، هماهنگی عوامل و شکل‌دادن به ریتم یک برنامه زنده.',
    'vMix Operations':'کار با vMix','Inputs, overlays, triggers, audio buses, remote guests and dependable live workflows.':'ورودی‌ها، لایه‌های گرافیکی، تریگرها، مسیرهای صدا، مهمان‌های راه دور و روندهای مطمئن پخش زنده.',
    'Control-Room Production':'تولید در اتاق فرمان','Turning complex technical setups into a clear, repeatable and fast production system.':'تبدیل چیدمان‌های فنی پیچیده به یک سیستم تولید روشن، سریع و قابل تکرار.',
    'Visual Storytelling':'روایت تصویری','Graphics, pacing and framing that make important stories easier to understand and remember.':'گرافیک، ریتم و قاب‌بندی برای قابل‌فهم‌تر و ماندگارتر شدن داستان‌های مهم.',
    'CORE SKILLS':'مهارت‌های اصلی','Technical precision.':'دقت فنی.','Editorial instinct.':'غریزه سردبیری.','Live switching, triggers, overlays, audio buses and remote guests.':'سوئیچ زنده، تریگرها، لایه‌های گرافیکی، مسیرهای صدا و مهمان‌های راه دور.',
    'Timing, camera calls, talent coordination and live editorial decisions.':'زمان‌بندی، فرمان دوربین، هماهنگی عوامل و تصمیم‌های سردبیری در لحظه.','Live Production':'تولید زنده','Reliable workflows for high-pressure, multi-source television programs.':'روندهای مطمئن برای برنامه‌های تلویزیونی پرفشار و چندمنبعی.',
    'After Effects':'افترافکت','Broadcast motion graphics, visualizers, titles and animated packages.':'موشن‌گرافیک تلویزیونی، ویژوالایزر، عنوان‌بندی و پکیج‌های متحرک.',
    'ABOUT':'درباره من','I make complicated live productions feel simple.':'تولیدهای زنده پیچیده را ساده و روان می‌کنم.',
    'Sam Kazemi is a Broadcast Director specializing in live television production, technical directing and real-time broadcast workflows. His work includes control-room management, vMix production, live switching, broadcast graphics and the precise coordination required to keep a live program clear, reliable and engaging.':'سام کاظمی کارگردان پخش و متخصص تولید زنده تلویزیونی، کارگردانی فنی و روندهای لحظه‌ای پخش است. فعالیت او شامل مدیریت اتاق فرمان، تولید با vMix، سوئیچ زنده، گرافیک تلویزیونی و هماهنگی دقیق برای اجرای برنامه‌ای شفاف، مطمئن و جذاب است.',
    'Connect on LinkedIn':'ارتباط در لینکدین','LET’S CREATE SOMETHING LIVE':'بیایید چیزی زنده خلق کنیم','Good broadcasts don’t happen by accident.':'یک پخش خوب اتفاقی ساخته نمی‌شود.','Email Sam ↗':'ایمیل به سام ↗',
    'Broadcast Director • Live Production • vMix':'کارگردان پخش • تولید زنده • vMix','Designed and developed by Sam Kazemi · Website design inquiries:':'طراحی و توسعه توسط سام کاظمی · سفارش طراحی سایت:',
    'Language selector':'انتخاب زبان','View website in English':'نمایش سایت به زبان انگلیسی','United States flag':'پرچم ایالات متحده آمریکا',
    'Sam Kazemi home':'صفحه اصلی سام کاظمی','Primary navigation':'منوی اصلی','Skills ticker':'نوار مهارت‌ها','Sam Kazemi introduction':'معرفی سام کاظمی',
    'Play Sam Kazemi control room challenge':'اجرای چالش اتاق فرمان سام کاظمی','Time remaining':'زمان باقی‌مانده','Broadcast monitor wall':'دیوار مانیتورهای پخش','Camera 1 source':'منبع دوربین ۱',
    'Broadcast audio console':'کنسول صدای پخش','Current program feed':'خروجی فعلی برنامه','Remote guest video call':'تماس تصویری مهمان راه دور','Multiview preview monitor':'مانیتور پیش‌نمایش چندتصویری',
    'Broadcast event log':'گزارش رویدادهای پخش','Musical note touch pad':'پد لمسی نت‌های موسیقی','Transition controls':'کنترل‌های انتقال','Source inputs':'ورودی‌های منبع','Shot templates':'قالب‌های قاب',
    'Sam Kazemi in a television broadcast control room':'سام کاظمی در اتاق فرمان تلویزیونی','Sam Kazemi wearing a broadcast headset inside a television control room':'سام کاظمی با هدست پخش در اتاق فرمان تلویزیونی','Sam Kazemi in a live television control room':'سام کاظمی در اتاق فرمان پخش زنده تلویزیونی'
  };

  const attrs = ['aria-label','alt','placeholder','title'];
  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  let applying = false;
  let current = localStorage.getItem('sam-site-language') === 'fa' ? 'fa' : 'en';

  function dynamicFa(text) {
    if (fa[text]) return fa[text];
    let m;
    if ((m=text.match(/^Source (\d+)$/))) return `منبع ${m[1]}`;
    if ((m=text.match(/^STEP (\d+)\/5$/))) return `مرحله ${m[1]} از ۵`;
    if ((m=text.match(/^(CUT|FADE|MERGE) TO PROGRAM…$/))) return `${m[1]} به خروجی…`;
    if ((m=text.match(/^(CUT|FADE|MERGE) COMPLETE — SELECT ANOTHER INPUT$/))) return `${m[1]} انجام شد — ورودی دیگری انتخاب کن`;
    if ((m=text.match(/^(CUT|FADE|MERGE) complete · Switch (\d+) · (\d\d:\d\d) left$/))) return `${m[1]} انجام شد · سوئیچ ${m[2]} · ${m[3]} باقی‌مانده`;
    if ((m=text.match(/^TIME! (\d+) successful switches?\.$/))) return `زمان تمام شد! ${m[1]} سوئیچ موفق.`;
    if (text === 'TIME! No source was taken to Program.') return 'زمان تمام شد! هیچ منبعی به خروجی فرستاده نشد.';
    const direct = {
      'CHOOSE ANY INPUT — IT WILL OPEN IN PREVIEW':'یک ورودی انتخاب کن؛ مستقیم در پیش‌نمایش باز می‌شود','SELECT INPUT':'انتخاب ورودی',
      'INPUT READY IN PREVIEW — START RECORD':'ورودی در پیش‌نمایش آماده است — ضبط را شروع کن','START RECORD':'شروع ضبط',
      'NEW INPUT IN PREVIEW — CUT, FADE OR MERGE':'ورودی جدید در پیش‌نمایش است — CUT، FADE یا MERGE را بزن','READY TO SWITCH':'آماده سوئیچ',
      'RECORDING — CHOOSE A TRANSITION':'در حال ضبط — یک انتقال انتخاب کن','CUT · FADE · MERGE':'CUT · FADE · MERGE',
      'RECORD STOPPED':'ضبط متوقف شد','TAKING LIVE':'در حال انتقال به خروجی','ON AIR · KEEP SWITCHING':'روی آنتن — به سوئیچ ادامه بده',
      'ONE MINUTE LEFT — KEEP SWITCHING':'یک دقیقه باقی مانده — به سوئیچ ادامه بده','60 SECONDS':'۶۰ ثانیه',
      'TEN SECONDS — FINAL SWITCH!':'ده ثانیه — آخرین سوئیچ!','FINAL 10':'۱۰ ثانیه پایانی',
      'CHALLENGE COMPLETE — GREAT SWITCHING':'چالش تمام شد — سوئیچ عالی بود','DIRECTOR TEST COMPLETE':'آزمون کارگردانی کامل شد',
      'TIME EXPIRED — RESET AND TRY AGAIN':'زمان تمام شد — بازنشانی کن و دوباره تلاش کن','OFF AIR · FAILED':'خارج از آنتن · ناموفق',
      'THIS FILE CANNOT PLAY IN THE BROWSER — TRY MP4, WEBM, JPG OR PNG':'این فایل در مرورگر پخش نمی‌شود — MP4، WEBM، JPG یا PNG را امتحان کن','MEDIA ERROR':'خطای رسانه',
      'UNSUPPORTED FILE — USE MP4, WEBM, JPG OR PNG':'فایل پشتیبانی نمی‌شود — از MP4، WEBM، JPG یا PNG استفاده کن','UPLOAD ERROR':'خطای آپلود',
      'FILE TOO LARGE — MAX 250 MB':'حجم فایل زیاد است — حداکثر ۲۵۰ مگابایت','PRESS START':'شروع را بزن',
      'CLEAN FEED':'خروجی ساده','LOWER THIRD':'زیرنویس','BREAKING NEWS':'خبر فوری','GAMING LIVE':'بازی زنده','INTERVIEW':'مصاحبه','CINEMA':'سینمایی'
    };
    return direct[text] || text;
  }

  function translateValue(value) {
    if (current !== 'fa') return value;
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    const core = value.trim();
    if (!core) return value;
    return leading + dynamicFa(core) + trailing;
  }

  function registerText(node, forceUpdate=false) {
    if (!originalText.has(node) || forceUpdate) originalText.set(node, node.nodeValue);
    const original = originalText.get(node);
    const next = current === 'fa' ? translateValue(original) : original;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function registerElement(el) {
    if (!(el instanceof Element)) return;
    if (!originalAttrs.has(el)) originalAttrs.set(el, {});
    const saved = originalAttrs.get(el);
    attrs.forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      if (!(attr in saved)) saved[attr] = el.getAttribute(attr);
      el.setAttribute(attr, current === 'fa' ? translateValue(saved[attr]) : saved[attr]);
    });
  }

  function walk(root=document.body) {
    applying = true;
    registerElement(document.documentElement);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n = root;
    while (n) {
      if (n.nodeType === Node.TEXT_NODE && !['SCRIPT','STYLE'].includes(n.parentElement?.tagName)) registerText(n);
      else if (n.nodeType === Node.ELEMENT_NODE) registerElement(n);
      n = walker.nextNode();
    }
    applying = false;
  }

  function applyLanguage(lang) {
    if (typeof observer !== 'undefined') { observer.disconnect(); observer.takeRecords(); }
    current = lang === 'fa' ? 'fa' : 'en';
    localStorage.setItem('sam-site-language', current);
    document.documentElement.lang = current;
    document.documentElement.dir = current === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-fa', current === 'fa');
    document.body.classList.toggle('lang-en', current === 'en');
    document.querySelectorAll('.language-button').forEach(btn => {
      const active = btn.dataset.lang === current;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    document.title = current === 'fa' ? 'سام کاظمی — کارگردان پخش' : 'Sam Kazemi — Broadcast Director';
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.content = current === 'fa' ? 'وب‌سایت رسمی سام کاظمی؛ کارگردان تلویزیونی، کارگردان پخش و متخصص تولید زنده و vMix.' : 'Sam Kazemi — TV Director, Broadcast Director and Live Production Specialist working across control rooms, vMix, live streaming and television production.';
    walk();
    if (typeof observer !== 'undefined') observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  }

  document.querySelectorAll('.language-button').forEach(btn => btn.addEventListener('click', () => applyLanguage(btn.dataset.lang)));

  const observer = new MutationObserver(mutations => {
    if (applying) return;
    observer.disconnect();
    applying = true;
    for (const m of mutations) {
      if (m.type === 'characterData') registerText(m.target, true);
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) registerText(node, true);
        else if (node.nodeType === Node.ELEMENT_NODE) {
          registerElement(node);
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
          let n = node;
          while (n) {
            if (n.nodeType === Node.TEXT_NODE && !['SCRIPT','STYLE'].includes(n.parentElement?.tagName)) registerText(n, true);
            else if (n.nodeType === Node.ELEMENT_NODE) registerElement(n);
            n = walker.nextNode();
          }
        }
      });
    }
    applying = false;
    observer.observe(document.body, {subtree:true, childList:true, characterData:true});
  });
  applyLanguage(current);
})();
