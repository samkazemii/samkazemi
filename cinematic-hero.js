(() => {
  const hero = document.getElementById('cineHero');
  if (!hero) return;
  const sticky = hero.querySelector('.cine-hero__sticky');
  const portrait = hero.querySelector('.cine-hero__portrait');
  const copy = hero.querySelector('.cine-hero__copy');
  const logo = hero.querySelector('.cine-hero__logo');
  const canvas = hero.querySelector('.cine-hero__canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const image = portrait.querySelector('img');
  const chapter = hero.querySelector('.cine-hero__chapter strong');
  const rails = [...hero.querySelectorAll('.cine-hero__rail span')];
  let particles = [], ready = false, raf = 0, progress = 0;

  const clamp = (n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const map = (n,a,b,c,d)=>c+(d-c)*clamp((n-a)/(b-a));
  const ease = t => 1-Math.pow(1-t,3);

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    canvas.width = Math.floor(innerWidth*dpr); canvas.height = Math.floor(innerHeight*dpr);
    canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildParticles();
  }

  function buildParticles(){
    if (!image.complete || !image.naturalWidth) return;
    const w = Math.min(260, Math.floor(innerWidth/5));
    const h = Math.floor(w * innerHeight/innerWidth);
    const off = document.createElement('canvas'); off.width=w; off.height=h;
    const ox = off.getContext('2d', {willReadFrequently:true});
    const ir = image.naturalWidth/image.naturalHeight, cr = w/h;
    let sx=0,sy=0,sw=image.naturalWidth,sh=image.naturalHeight;
    if(ir>cr){sw=image.naturalHeight*cr;sx=(image.naturalWidth-sw)/2}else{sh=image.naturalWidth/cr;sy=(image.naturalHeight-sh)/2}
    ox.drawImage(image,sx,sy,sw,sh,0,0,w,h);
    const data=ox.getImageData(0,0,w,h).data; particles=[];
    const step = innerWidth < 700 ? 5 : 4;
    for(let y=0;y<h;y+=step){for(let x=0;x<w;x+=step){
      const i=(y*w+x)*4, a=data[i+3]; if(a<50) continue;
      const lum=(data[i]+data[i+1]+data[i+2])/3; if(lum<24) continue;
      particles.push({x:x/w*innerWidth,y:y/h*innerHeight,r:data[i],g:data[i+1],b:data[i+2],seed:Math.random()*10,sz:Math.random()*1.45+.35});
    }} ready=true;
  }

  function update(){
    raf=0;
    const rect=hero.getBoundingClientRect();
    progress=clamp(-rect.top/(hero.offsetHeight-innerHeight));
    const orbit = map(progress,0,.34,-7,13);
    const zoom = map(progress,.05,.45,1.02,1.18);
    const lift = map(progress,.12,.5,0,-4);
    const dissolve = map(progress,.43,.7,0,1);
    portrait.style.transform=`translate3d(${orbit*1.2}px,${lift}vh,0) rotateY(${orbit}deg) scale(${zoom})`;
    portrait.style.opacity=String(1-dissolve*.98);
    portrait.style.filter=`saturate(${.9-dissolve*.35}) contrast(${1.08+dissolve*.3}) blur(${dissolve*1.5}px)`;
    copy.style.opacity=String(1-map(progress,.12,.38,0,1));
    copy.style.transform=`translateY(calc(-50% + ${map(progress,.1,.4,0,-70)}px))`;
    canvas.style.opacity=String(map(progress,.42,.56,0,1)*(1-map(progress,.82,.94,0,1)));
    const lp=map(progress,.83,.96,0,1);
    logo.style.opacity=String(lp);
    logo.style.transform=`scale(${.82+.18*ease(lp)})`;
    let idx=Math.min(4,Math.floor(progress*5)); rails.forEach((r,i)=>r.classList.toggle('active',i===idx));
    const labels=['ORBITING CAMERA','SIGNAL DEPTH','DIGITAL DISSOLVE','FIBER ROUTING','IDENTITY LOCK']; chapter.textContent=labels[idx];
    draw();
  }

  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(!ready) return;
    const t=map(progress,.44,.83,0,1);
    const cableT=map(progress,.69,.9,0,1);
    const cx=innerWidth*.52, cy=innerHeight*.48;
    ctx.globalCompositeOperation='lighter';
    const skip=Math.max(1,Math.floor(particles.length/6200));
    for(let i=0;i<particles.length;i+=skip){
      const p=particles[i];
      const n=Math.sin(p.seed+p.y*.013)+Math.cos(p.seed*1.7+p.x*.011);
      const explode=ease(t)*Math.min(innerWidth,innerHeight)*(.08+.12*Math.abs(n));
      let x=p.x+(p.x-cx)/innerWidth*explode+n*22*t;
      let y=p.y+(p.y-cy)/innerHeight*explode+Math.sin(p.seed*2.1)*18*t;
      if(cableT>0){
        const lane=((i%23)-11)*8;
        x=x*(1-cableT)+(cx+lane)*cableT;
        y=y*(1-cableT)+(cy+(p.y-innerHeight/2)*.12)*cableT;
      }
      const alpha=(.28+.65*t)*(1-cableT*.35);
      ctx.fillStyle=`rgba(${Math.min(255,p.r+35)},${Math.min(255,p.g+20)},${Math.max(40,p.b)},${alpha})`;
      ctx.fillRect(x,y,p.sz+(t*1.1),p.sz+(t*1.1));
    }
    if(cableT>.12){
      ctx.lineWidth=1; ctx.globalAlpha=map(cableT,.12,1,0,.72);
      for(let k=0;k<36;k++){
        const side=k%2?-1:1, sy=(k/36)*innerHeight, ex=cx+(k-18)*3.2, ey=cy+(k%7-3)*7;
        ctx.strokeStyle=k%5===0?'rgba(255,193,92,.72)':'rgba(158,194,255,.32)';
        ctx.beginPath();ctx.moveTo(side<0?0:innerWidth,sy);ctx.bezierCurveTo(innerWidth*.25,sy,innerWidth*.7,ey,ex,ey);ctx.stroke();
      }
      ctx.globalAlpha=1;
    }
    ctx.globalCompositeOperation='source-over';
  }

  const request=()=>{if(!raf)raf=requestAnimationFrame(update)};
  addEventListener('scroll',request,{passive:true}); addEventListener('resize',()=>{resize();request()},{passive:true});
  image.addEventListener('load',()=>{resize();request()},{once:true});
  if(image.complete){resize();request()}
})();
(() => { const el=document.getElementById('cineTimecode'); if(!el)return; const t=performance.now(); setInterval(()=>{const ms=performance.now()-t, s=Math.floor(ms/1000), f=Math.floor((ms%1000)/40); el.textContent=[Math.floor(s/3600),Math.floor(s/60)%60,s%60,f].map(v=>String(v).padStart(2,'0')).join(':')},40) })();
