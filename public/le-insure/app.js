/* eslint-disable */
/* =====================================================================
   Le-Insure · app.js  (browser behaviour for the whole site)

   Loaded by app/page.tsx AFTER the markup is on the page and after the
   vendor libraries (three.js, GSAP + ScrollTrigger, Lenis) are ready.

   What lives in here, top to bottom:
     - smooth scroll (Lenis), nav, theme switch (light / dark / system)
     - 3D globe in the hero (three.js)
     - modals: search, daily insights, articles, readiness quiz
     - hash routing between views: #about #coverage #claims #pricing
       #help #support #login #register #dashboard
     - preview accounts: register (OTP, 2FA, e-KYC), login, logout
     - member dashboard with SAMPLE data (browser storage only)
     - Our Services cards + service detail modal
     - About page 3D gavel / globe, ecosystem map, space background
     - Help Center FAQ + chatbot, support form
     - EN / ID language switch (dictionary at I18N_SRC)
     - Meet the Team

   Preview only: nothing typed here is sent to a server.
   ===================================================================== */
if (window.__leInsureBooted) {
  console.info("[Le-Insure] app.js already running, skipped second boot.");
} else {
window.__leInsureBooted = true;
(function(){
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const rp=n=>'Rp'+Math.round(n).toLocaleString('en-US');

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!RM && window.Lenis){
  try{
    lenis=new Lenis({lerp:.09,smoothWheel:true});
    if(window.gsap&&window.ScrollTrigger){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
    else{const r=t=>{lenis.raf(t);requestAnimationFrame(r)};requestAnimationFrame(r);}
  }catch(e){lenis=null}
}
function go(hash){if(hash==='#services'&&document.querySelector('#services.pin')){document.querySelector('#svsSteps button').click();return}
  const el=hash&&hash.length>1?document.getElementById(hash.slice(1)):null;
  if(!el&&hash!=='#top')return;
  const target=el||0;
  if(lenis)lenis.scrollTo(target,{offset:-70,duration:1.3});
  else (el||document.body).scrollIntoView({behavior:RM?'auto':'smooth'});
}
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');
  if(!a)return;
  if(a.dataset.art!==undefined){e.preventDefault();openArticle(+a.dataset.art);closeAll();return}
  const h=a.getAttribute('href'); if(h==='#')return;
  e.preventDefault(); closeAll(); go(h);
});

/* ---------- nav ---------- */
const nav=$('#nav');
const onScroll=()=>nav.classList.toggle('scrolled',scrollY>24);
addEventListener('scroll',onScroll,{passive:true});onScroll();

const drops=$$('[data-dd]');
let ddTimer;
function closeDD(except){drops.forEach(b=>{if(b!==except){b.setAttribute('aria-expanded','false');$('#'+b.dataset.dd).classList.remove('open')}})}
function openDD(b){clearTimeout(ddTimer);closeDD(b);b.setAttribute('aria-expanded','true');const d=$('#'+b.dataset.dd);if(d.classList.contains('mega')){const r=b.parentElement.getBoundingClientRect();d.style.left=(innerWidth/2-r.left)+'px'}d.classList.add('open')}
drops.forEach(b=>{
  const li=b.parentElement;
  b.addEventListener('click',()=>b.getAttribute('aria-expanded')==='true'?closeDD():openDD(b));
  li.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)openDD(b)});
  li.addEventListener('mouseleave',()=>{ddTimer=setTimeout(()=>closeDD(),180)});
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(ov.hidden&&(curView==='login'||curView==='register')&&!document.querySelector('.drop.open')){route('home');return}closeDD();closeModal();closeMM()}});
document.addEventListener('click',e=>{if(!e.target.closest('.menu'))closeDD()});



$('#exploreBtn').addEventListener('click',e=>{e.stopPropagation();go('#services')});
/* mobile menu */
const mm=$('#mm'),burger=$('#burger');
function closeMM(){mm.classList.remove('open');burger.setAttribute('aria-expanded','false');document.documentElement.style.overflow=''}
burger.addEventListener('click',()=>{const o=!mm.classList.contains('open');mm.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);document.documentElement.style.overflow=o?'hidden':''});
function closeAll(){closeDD();closeMM()}

/* ---------- theme ---------- */
const themes=['system','light','dark'];let ti=0;
try{const s=localStorage.getItem('li-theme');if(s){ti=Math.max(0,themes.indexOf(s))}}catch(e){}
function applyTheme(){const t=themes[ti];if(t==='system')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);const dk=isDark();$('#themeIco use').setAttribute('href',dk?'#i-sun':'#i-moon');$('#themeNav').setAttribute('aria-label',dk?'Switch to light theme':'Switch to dark theme')}
function isDark(){const t=themes[ti];return t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches)}
applyTheme();
$('#themeNav').addEventListener('click',()=>{ti=isDark()?1:2;applyTheme();try{localStorage.setItem('li-theme',themes[ti])}catch(e){}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);

/* ---------- 3D globe ---------- */
(function globe(){
  const cv=$('#globe');
  if(!window.THREE){cv.remove();return}
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){cv.remove();return}
  const layer=$('#gLayer');layer.appendChild(cv);
  const gfb=$('#gfb');gfb.hidden=true;
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();gfb.hidden=false;cv.style.visibility='hidden'},false);
  cv.addEventListener('webglcontextrestored',()=>{gfb.hidden=true;cv.style.visibility='';size()},false);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(34,1,.1,100);cam.position.set(0,0,12);
  const root=new THREE.Group();scene.add(root);
  const G=new THREE.Group();root.add(G);
  const R=2.2, champ=new THREE.Color('#C9B58A'), rose=new THREE.Color('#E36B78');
  // dark glass core with a soft fresnel edge (hides back-side lines for a clean silhouette)
  const core=new THREE.Mesh(new THREE.SphereGeometry(R*.992,128,128),new THREE.ShaderMaterial({
    uniforms:{a:{value:new THREE.Color('#24090F')},b:{value:new THREE.Color('#7A2433')},c:{value:champ}},
    vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 a;uniform vec3 b;uniform vec3 c;varying vec3 n;varying vec3 v;void main(){float f=1.-max(dot(n,v),0.);float l=max(dot(n,normalize(vec3(-.6,.7,.5))),0.);vec3 col=mix(a,b,pow(f,1.6)*.85+l*.22);col+=c*pow(f,6.)*.55;gl_FragColor=vec4(col,1.);}'}));
  G.add(core);
  // hairline champagne rim
  const rimRing=new THREE.Mesh(new THREE.RingGeometry(R*1.004,R*1.012,256),new THREE.MeshBasicMaterial({color:champ,transparent:true,opacity:.55}));scene.add(rimRing);
  // fine grid (logo globe)
  const lineMat=new THREE.LineBasicMaterial({color:champ,transparent:true,opacity:.42});
  const ring=(fn,n=220)=>{const p=[];for(let i=0;i<=n;i++)p.push(fn(i/n*Math.PI*2));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),lineMat)};
  const r1=R*1.002;
  for(let k=0;k<12;k++){const a=k/12*Math.PI;G.add(ring(t=>new THREE.Vector3(Math.cos(t)*Math.cos(a)*r1,Math.sin(t)*r1,Math.cos(t)*Math.sin(a)*r1)))}
  [-67.5,-45,-22.5,0,22.5,45,67.5].forEach(d=>{const la=d*Math.PI/180,r=Math.cos(la)*r1,y=Math.sin(la)*r1;G.add(ring(t=>new THREE.Vector3(Math.cos(t)*r,y,Math.sin(t)*r)))});
  // fine dot field
  const N=4200,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;pos.set([Math.cos(th)*r*R*1.004,y*R*1.004,Math.sin(th)*r*R*1.004],i*3)}
  const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  G.add(new THREE.Points(dg,new THREE.PointsMaterial({color:champ,size:.02,transparent:true,opacity:.6})));
  {const M2=520,p2=new Float32Array(M2*3);for(let i=0;i<M2;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,r=Math.sqrt(1-u*u);p2.set([Math.cos(th)*r*R*1.008,u*R*1.008,Math.sin(th)*r*R*1.008],i*3)}
   const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.BufferAttribute(p2,3));G.add(new THREE.Points(g2,new THREE.PointsMaterial({color:'#DCCBA8',size:.03,transparent:true,opacity:.5})))}
  // partner points + quiet arcs
  const ll=(lat,lon,r=R)=>{const a=lat*Math.PI/180,b=lon*Math.PI/180;return new THREE.Vector3(Math.cos(a)*Math.cos(b)*r,Math.sin(a)*r,Math.cos(a)*Math.sin(b)*r)};
  const hub=ll(-6,107,R*1.006);
  const hubM=new THREE.Mesh(new THREE.SphereGeometry(.04,20,20),new THREE.MeshBasicMaterial({color:'#F5E8E1'}));hubM.position.copy(hub);G.add(hubM);
  const hero=$('#hero');
  const pulses=[],pins=[];
  const NODES=[['OJK-licensed insurers','Carry the risk and issue the policy'],['Partner advocates','Legal advice and representation'],['Partner notaries','Deeds and wills'],['Licensed broker','Distributes the Legal Protection Plan'],['Employers','Employee Package for their teams'],['e-KYC & e-signature','Identity checks and secure signing'],['LE-DOCS','Encrypted document vault'],['Legal triage','Sorts your issue, AI plus human review'],['Contract review','Flags clauses to check. Not legal advice.'],['Case Tracker','Status, deadlines and documents'],['LE-LEGACY','Asset map, beneficiaries, emergency access'],['Education hub','Plain-language legal guides']];
  const spread=NODES.map((n,i)=>{const y=1-(i+.5)/NODES.length*2,r=Math.sqrt(1-y*y)*0.97,th=i*2.399963+1.9;return new THREE.Vector3(Math.cos(th)*r,y*0.92,Math.sin(th)*r).normalize().multiplyScalar(R*1.006)});
  pins.push({m:hubM,name:'Le-Insure',sub:'Technology and orchestration',hub:true,line:null});
  NODES.forEach((n,i)=>{
    const p=spread[i];
    const m=new THREE.Mesh(new THREE.SphereGeometry(.042,16,16),new THREE.MeshBasicMaterial({color:rose}));m.position.copy(p);G.add(m);
    const halo=new THREE.Mesh(new THREE.RingGeometry(.055,.07,40),new THREE.MeshBasicMaterial({color:rose,transparent:true,opacity:0,side:THREE.DoubleSide}));halo.position.copy(p);halo.lookAt(p.clone().multiplyScalar(2));G.add(halo);
    const mid=p.clone().add(hub).multiplyScalar(.5);mid.setLength(R*1.3);
    const curve=new THREE.QuadraticBezierCurve3(hub,mid,p);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(90)),new THREE.LineBasicMaterial({color:rose,transparent:true,opacity:.32}));G.add(line);
    const s=new THREE.Mesh(new THREE.SphereGeometry(.018,10,10),new THREE.MeshBasicMaterial({color:'#F3EADB'}));G.add(s);
    pulses.push({curve,s,o:i/NODES.length,k:1});
    pins.push({m,halo,line,name:n[0],sub:n[1],pulse:pulses[i]});
  });
  const tip=document.createElement('div');tip.className='gtip';tip.setAttribute('aria-hidden','true');tip.innerHTML='<b></b><small></small>';hero.appendChild(tip);
  let mx=-1e4,my=-1e4,active=null,auto=null,autoAt=0,lastHover=-1e4;
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  addEventListener('pointerdown',e=>{mx=e.clientX;my=e.clientY},{passive:true});
  const wp=new THREE.Vector3(),cp=new THREE.Vector3(),toCam=new THREE.Vector3();
  function hoverPins(){
    const r=cv.getBoundingClientRect();root.getWorldPosition(cp);
    let best=null,bd=30;const now=performance.now();
    pins.forEach(p=>{p.m.getWorldPosition(wp);toCam.copy(cam.position).sub(wp);const front=wp.clone().sub(cp).dot(toCam)>0;p.front=front;
      const q=wp.clone().project(cam);p.sx=r.left+(q.x+1)/2*r.width;p.sy=r.top+(1-q.y)/2*r.height;
      p.depth=wp.clone().sub(cp).normalize().dot(toCam.clone().normalize());
      if(front){const d=Math.hypot(p.sx-mx,p.sy-my);if(d<bd){bd=d;best=p}}});
    if(best)lastHover=now;
    if(!best&&now-lastHover>1500){
      if(!auto||now-autoAt>3200||!auto.front||auto.depth<.35){const c=pins.filter(p=>!p.hub&&p.front&&p.depth>.45&&p!==auto);if(c.length){auto=c[Math.floor(Math.random()*c.length)];autoAt=now}}
      if(auto&&auto.front)best=auto;
    }
    if(best!==active){active=best;if(best){tip.querySelector('b').textContent=best.name;tip.querySelector('small').textContent=best.sub}tip.classList.toggle('on',!!best);hero.style.cursor=best&&best!==auto?'pointer':''}
    pins.forEach(p=>{const on=p===active||(active&&active.hub&&!p.hub);const tgt=p===active?2.3:on?1.5:1;const sc=p.m.scale.x+(tgt-p.m.scale.x)*.18;p.m.scale.setScalar(sc);
      if(p.halo){p.halo.material.opacity+=((p===active?.9:.35)-p.halo.material.opacity)*.15;p.halo.scale.setScalar(1+((performance.now()/600)%1)*.8)}
      if(p.line){p.line.material.opacity+=((on?.95:.32)-p.line.material.opacity)*.15;p.pulse.k=on?2.6:1}});
    if(active){const hr=hero.getBoundingClientRect();tip.style.transform=`translate(${active.sx-hr.left+16}px,${active.sy-hr.top-18}px)`}
  }
  // two hairline orbits with a single travelling light
  const orbMat=new THREE.MeshBasicMaterial({color:champ,transparent:true,opacity:.28});
  const o1=new THREE.Mesh(new THREE.TorusGeometry(R*1.42,.0035,6,320),orbMat);o1.rotation.set(Math.PI/2.3,-.28,0);root.add(o1);
  const o2=new THREE.Mesh(new THREE.TorusGeometry(R*1.62,.003,6,320),orbMat.clone());o2.material.opacity=.16;o2.rotation.set(Math.PI/1.75,.42,0);root.add(o2);
  const star=new THREE.Mesh(new THREE.SphereGeometry(.035,14,14),new THREE.MeshBasicMaterial({color:'#F5E8E1'}));root.add(star);

  // dense network all around the globe
  const netPulses=[];
  {const NN=34,pts=[];for(let i=0;i<NN;i++){const y=1-(i+.5)/NN*2,r=Math.sqrt(1-y*y),th=i*2.399963+.7;pts.push(new THREE.Vector3(Math.cos(th)*r,y,Math.sin(th)*r).multiplyScalar(R*1.006))}
   const dotM=new THREE.MeshBasicMaterial({color:'#DCCBA8'}),arcM=new THREE.LineBasicMaterial({color:champ,transparent:true,opacity:.38});
   const seen=new Set();
   pts.forEach((p,i)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(i%3?.016:.022,10,10),dotM);m.position.copy(p);G.add(m);
     pts.map((q,j)=>[j,p.distanceTo(q)]).filter(x=>x[0]!==i).sort((a,b)=>a[1]-b[1]).slice(0,3).forEach(([j])=>{const key=Math.min(i,j)+'-'+Math.max(i,j);if(seen.has(key))return;seen.add(key);
       const q=pts[j],mid=p.clone().add(q).multiplyScalar(.5);mid.setLength(R*1.1);const c=new THREE.QuadraticBezierCurve3(p,mid,q);
       G.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(40)),arcM));
       if(seen.size%2===0){const s=new THREE.Mesh(new THREE.SphereGeometry(.014,8,8),new THREE.MeshBasicMaterial({color:'#F3EADB'}));G.add(s);netPulses.push({c,s,o:Math.random(),v:.15+Math.random()*.2})}});
   });}
  // floating dust around the globe
  const dust=new THREE.Group();root.add(dust);
  {const ND=900,pd=new Float32Array(ND*3);for(let i=0;i<ND;i++){const u=Math.random()*2-1,th=Math.random()*Math.PI*2,r=Math.sqrt(1-u*u),rad=R*(1.15+Math.pow(Math.random(),1.6)*1.4);pd.set([Math.cos(th)*r*rad,u*rad,Math.sin(th)*r*rad],i*3)}
   const gd=new THREE.BufferGeometry();gd.setAttribute('position',new THREE.BufferAttribute(pd,3));dust.add(new THREE.Points(gd,new THREE.PointsMaterial({color:champ,size:.022,transparent:true,opacity:.45,depthWrite:false})))}
  G.rotation.z=.32;
  let baseX=2.6,baseY=0,tx=0,ty=0,cx=0,cy=0,scrollP=0,spin=0,sp=0;
  addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5},{passive:true});
  document.addEventListener('pointerleave',()=>{tx=0;ty=0});
  const svsEl=$('#services');let mode=0,modeS=0,baseOp=1;
  function upd(){scrollP=Math.min(1,Math.max(0,scrollY/hero.offsetHeight));mode=Math.min(1,Math.max(0,(scrollY-hero.offsetHeight*.25)/(hero.offsetHeight*.6)));
    const off=svsEl.getBoundingClientRect().bottom<innerHeight*.35;layer.classList.toggle('off',off);visible=!off&&!/v-(about|login|register|dashboard)/.test(document.body.className)}
  addEventListener('scroll',upd,{passive:true});
  let vwW=7,vhW=7;
  function size(){cv.style.opacity='';baseOp=parseFloat(getComputedStyle(cv).opacity)||1;const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;vhW=2*12*Math.tan(17*Math.PI/180);vwW=vhW*w/h;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();const vw=2*12*Math.tan(17*Math.PI/180)*cam.aspect;baseX=cam.aspect>1.1?vw*.24:vw*.32;baseY=cam.aspect>1.1?-.1:-1.6}
  new ResizeObserver(size).observe(cv);size();
  let visible=true;upd();
  window.wakeGlobe=()=>{visible=true;size();upd();clock.getDelta();const gl=renderer.getContext();if(gl&&gl.isContextLost&&gl.isContextLost()){gfb.hidden=false;cv.style.visibility='hidden'}};
  const clock=new THREE.Clock();let intro=RM?1:0;
  const tmp=new THREE.Vector3();
  function frame(){
    requestAnimationFrame(frame);
    if(!visible)return;
    const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
    if(intro<1)intro=Math.min(1,intro+dt*.55);
    const e=1-Math.pow(1-intro,3);
    cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;
    spin+=dt*.2;sp+=(scrollP-sp)*.06;modeS+=(mode-modeS)*.08;const m=modeS*modeS*(3-2*modeS);
    G.rotation.y=spin+sp*1.2+cx*1.1*m;
    root.rotation.x=.12+sp*.25+cy*.5*m;root.rotation.y=0;
    root.scale.setScalar((.82+.18*e)*(1-m*.3));
    const hx=baseX,hy=baseY,fx=cx*vwW*.8,fy=-cy*vhW*.8;
    root.position.set(hx+(fx-hx)*m,hy+(fy-hy)*m,0);
    cv.style.opacity=(baseOp*(1-m*.15)).toFixed(3);
    rimRing.position.copy(root.position);rimRing.scale.copy(root.scale);
    const a=t*.18;tmp.set(Math.cos(a)*R*1.42,Math.sin(a)*R*1.42,0).applyEuler(o1.rotation);star.position.copy(tmp);
    netPulses.forEach(p=>{p.o=(p.o+dt*p.v)%1;p.s.position.copy(p.c.getPoint(p.o))});dust.rotation.y-=dt*.03;dust.rotation.x+=dt*.008;
    pulses.forEach(p=>{p.ph=((p.ph||p.o)+dt*.22*p.k)%1;p.s.position.copy(p.curve.getPoint(p.ph))});
    if(m<.25)hoverPins();else if(active){active=null;tip.classList.remove('on');hero.style.cursor=''}
    renderer.render(scene,cam);
  }
  frame();
})();

/* ---------- hero intro + scroll motion ---------- */
if(window.gsap&&!RM){
  gsap.from('.hero h1 .ln>span',{yPercent:105,duration:1.1,ease:'power4.out',stagger:.09,delay:.1});
  gsap.from('.hero .sub,.hero .ctas,.hero .hint,.hero .kicker',{y:24,duration:1,ease:'power3.out',stagger:.07,delay:.35});
  }
if(window.gsap&&window.ScrollTrigger&&!RM){
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('.hero-in',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
}

/* ---------- modals ---------- */
const ART=[
 {d:'10 Oct 2026',h:'Introducing Le-Insure: one platform for your legal, document, and legacy needs',p:['Legal problems rarely arrive alone. A contract dispute needs documents, a lawyer and money for fees, often all at once. Today these sit in different places.','Le-Insure brings education, a secure document vault, verified advocates, legal cost protection from licensed insurers, and legacy planning into one flow, organized as Prepare, Protect and Preserve.','We are a technology platform. Insurers carry the risk, advocates give legal advice and notaries make deeds. Our job is to make getting to them simple.']},
 {d:'01 Oct 2026',h:'Why legal protection matters in everyday life',p:['Everyday legal issues are ordinary: a final salary that is not paid, a deposit that is not returned, an online purchase that goes wrong.','The cost of help can become a financial shock for a household. In our October 2026 validation survey (n = 39, indicative), 74.4% of respondents said they worry about unexpected legal costs.','Insurance awareness is still developing. SNLIK 2026 puts insurance literacy at 42.84% and inclusion at 29.55%. Clear, plain-language products can help close that gap.']},
 {d:'24 Sep 2026',h:'Planning your legacy early: a smarter step for the future',p:['Many families keep important papers on paper only, and heirs often do not know where to find them.','Start small: list your documents and assets, decide who should have access in an emergency, and record your beneficiaries.','When you are ready for a will, meet a notary. A will follows Indonesian law, whether the Civil Code, the Compilation of Islamic Law or customary law. LE-LEGACY helps you prepare; it does not replace a will.']}];
const ov=$('#ov'),modal=$('#modal');let lastFocus=null;
function openModal(html){lastFocus=document.activeElement;modal.classList.remove('wide');modal.innerHTML=html;ov.hidden=false;requestAnimationFrame(()=>ov.classList.add('show'));lenis&&lenis.stop();const f=modal.querySelector('input,button.x');f&&f.focus()}
function closeModal(){if(ov.hidden)return;ov.classList.remove('show');lenis&&lenis.start();setTimeout(()=>{ov.hidden=true;lastFocus&&lastFocus.focus()},250)}
ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('.x'))closeModal()});
const X='<button class="iconbtn x" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>';
const DAILY=[['Keep the transfer slip or signed receipt for every rental deposit you pay, because it is often the only proof you need to get the money back when you move out','A transfer slip or signed receipt is often the only proof you need to get a rental deposit back. Photograph the unit on the day you move in and the day you move out, and keep both sets of photos with the lease in LE-DOCS.'],
 ['Check whether your employment contract is fixed-term (PKWT) or permanent (PKWTT) today, because the two end differently and decide the severance you can expect','PKWT and PKWTT contracts end differently. Knowing which one you have tells you what notice and severance to expect, and which documents to keep, such as payslips from the last 12 months.'],
 ['Before you pay an online seller, screenshot the product page, the chat and the payment proof, since these are the evidence a consumer complaint relies on','Chats, order pages and payment proof are the evidence a consumer complaint relies on. Pay through the platform instead of a direct transfer, and note the return and complaint window before it closes.'],
 ['A will or deed is made with a notary under the law, not inside an app, so use LE-LEGACY to organize your assets and beneficiaries before you visit one','LE-LEGACY organizes what you own, where the proof is kept and who it is for. The will itself is made with a notary under the Civil Code, the Compilation of Islamic Law or customary law.'],
 ['Scan your land certificate this week and keep the original somewhere safe, so your family can still find the details if the paper copy is ever lost or damaged','Keep the original certificate in a safe place and a scanned copy in LE-DOCS. Check that the name on the certificate matches your ID, and keep the PBB tax records together with it.'],
 ['Read the auto-renewal clause in your lease or subscription before signing, because many renew automatically unless you give notice 30 to 60 days before the end','Many leases and service contracts renew unless you give notice 30 to 60 days before the end date. Put the notice date in your calendar and ask the other side to confirm in writing.'],
 ['Always ask for the advocate fee before a consultation starts, and get it in writing, so there are no surprises when the bill arrives after the meeting','Partner advocates on Le-Insure show their fee upfront, and the platform fee is shown separately. Ask what the fee covers, such as follow-up questions or a short written summary.'],
 ['Update your family card (KK) after a marriage, a birth or a move, since an outdated card can delay insurance claims, school enrolment and inheritance paperwork','Marriage, birth and moving house should be reflected in your KK. An outdated card can slow down claims, enrolment and inheritance paperwork when you can least afford the delay.'],
 ['Turn on two-factor sign-in with a passkey or an authenticator app, so your documents stay protected even if your password ends up in a data leak','A second step at sign-in keeps your vault safe even if your password leaks. Passkeys use Face ID, a fingerprint or your device PIN, and cannot be phished like a one-time code.'],
 ['Choose who can open your document vault in an emergency, and set a waiting period, so access is safe, on your terms and can be cancelled if it was a mistake','Pick a trusted person and a waiting period, for example 7 days. If a request comes in, you can cancel it during that time, and they only see what you have marked as shareable.']];
function dailyItems(){const out=[];for(let k=0;k<DAILY.length;k++){const d=new Date();d.setDate(d.getDate()-k);const i=(Math.floor(d.getTime()/864e5))%DAILY.length;out.push([d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),DAILY[i][0],DAILY[i][1],k===0])}return out}
function openDaily(k){const it=dailyItems()[k];openModal(`<div class="mh"><span class="eyebrow">Daily insight · ${it[0]}</span>${X}</div><div class="art"><h3 id="mTitle">${it[1]}</h3><p>${it[2]}</p><p class="note">General education, not legal advice.</p></div>`)}
(function(){const tr=$('#insTrack');if(!tr)return;const items=dailyItems();const one=items.map((it,k)=>`<button type="button" class="ins-it" data-daily="${k}"><time>${it[3]?'Today · ':''}${it[0]}</time><b>${it[1]}</b></button>`).join('');tr.innerHTML=one+one;
  tr.addEventListener('click',e=>{const b=e.target.closest('[data-daily]');if(b)openDaily(+b.dataset.daily)})})();
function openArticle(i){const a=ART[i];openModal(`<div class="mh"><span class="eyebrow">Insights · ${a.d}</span>${X}</div><div class="art"><h3 id="mTitle">${a.h}</h3>${a.p.map(t=>`<p>${t}</p>`).join('')}</div>`)}
const FORMS={
 login:{t:'Welcome back',f:[['Email','email','email'],['Password','password','current-password']],b:'Log in'},
 register:{t:'Create your account',f:[['Full name','text','name'],['Email','email','email'],['Password','password','new-password']],b:'Create free account'},
 talent:{t:'Join the talent pool',f:[['Full name','text','name'],['Email','email','email'],['Area of interest','text','off']],b:'Join'}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-modal]');if(!b)return;closeAll();const F=FORMS[b.dataset.modal];
  openModal(`<div class="mh"><h3 id="mTitle">${F.t}</h3>${X}</div><form id="mf2" novalidate>${F.f.map((f,i)=>`<div class="field"><label for="m${i}">${f[0]}</label><input id="m${i}" type="${f[1]}" autocomplete="${f[2]}" required></div>`).join('')}<p class="note" id="mErr" hidden></p><button class="btn lg" type="submit">${F.b}</button><p class="note">Preview site. Nothing you type here is sent or stored.</p></form>`);
  $('#mf2').addEventListener('submit',ev=>{ev.preventDefault();const empty=$$('#mf2 input').find(i=>!i.value.trim());const m=$('#mErr');
    if(empty){m.hidden=false;m.textContent='Fill in '+empty.previousElementSibling.textContent.toLowerCase()+' to continue.';empty.focus();return}
    const em=$$('#mf2 input[type=email]')[0];if(em&&!/^\S+@\S+\.\S+$/.test(em.value)){m.hidden=false;m.textContent='Enter an email like name@example.com.';em.focus();return}
    modal.innerHTML=`<div class="mh"><h3 id="mTitle">You're all set</h3>${X}</div><p class="note" style="font-size:15px">This is a preview, so no account was created. Accounts open with Phase 1 in 2027.</p>`;});
});
/* search */
const IDX=[['Our Services','#services','Section']].concat(ART.map((a,i)=>[a.h,'#art'+i,'Insights']));
$('#openSearch').addEventListener('click',()=>{
  openModal(`<div class="mh"><h3 id="mTitle">Search</h3>${X}</div><input class="search-in" id="sIn" placeholder="Try “contract”, “advocate” or “legacy”" autocomplete="off"><ul class="results" id="sRes"></ul>`);
  const inp=$('#sIn'),res=$('#sRes');let hot=0;
  const draw=()=>{const q=inp.value.toLowerCase().trim();const r=IDX.filter(x=>!q||x[0].toLowerCase().includes(q)||x[2].toLowerCase().includes(q)).slice(0,8);hot=0;
    res.innerHTML=r.length?r.map((x,i)=>`<li><a href="${x[1]}" class="${i===0?'hot':''}"><span>${x[0]}</span><small>${x[2]}</small></a></li>`).join(''):'<li class="note" style="padding:12px">No matches. Try a shorter word.</li>'};
  inp.addEventListener('input',draw);
  inp.addEventListener('keydown',e=>{const as=$$('a',res);if(!as.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();hot=(hot+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach((a,i)=>a.classList.toggle('hot',i===hot))}if(e.key==='Enter'){e.preventDefault();const h=as[hot].getAttribute('href');closeModal();setTimeout(()=>h.startsWith('#feat-')?openFeat(h.slice(6)):h.startsWith('#art')?openArticle(+h.slice(4)):go(h),300)}});
  res.addEventListener('click',e=>{const a=e.target.closest('a');if(a){e.preventDefault();e.stopPropagation();const h=a.getAttribute('href');closeModal();setTimeout(()=>h.startsWith('#feat-')?openFeat(h.slice(6)):h.startsWith('#art')?openArticle(+h.slice(4)):go(h),300)}},true);
  draw();
});


/* ---------- accounts, routing, dashboard (preview: browser-only) ---------- */
const store={get(k,s){try{const v=(s?sessionStorage:localStorage).getItem(k);return v?JSON.parse(v):null}catch(e){return null}},set(k,v,s){try{(s?sessionStorage:localStorage).setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(e){}}};
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user=store.get('li-user'), session=store.get('li-session')||store.get('li-session',true);
const toastEl=$('#toast');let tT;
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>toastEl.classList.remove('show'),3200)}
const VIEWS=['home','about','coverage','claims','pricing','help','support','login','register','dashboard'];
let curView='home';
function route(v,opts={}){
  if(!VIEWS.includes(v))v='home';
  if(v==='dashboard'&&!session){v='login';if(!opts.silent)toast('Log in to see your dashboard.')}
  if((v==='login'||v==='register')&&session)v='dashboard';
  curView=v;
  $$('[data-view]').forEach(el=>el.hidden=el.dataset.view!==v);
  document.body.className=document.body.className.replace(/\bv-\w+/g,'').trim()+' v-'+v;
  const want=v==='home'?'':'#'+v;
  if(location.hash!==want){if(v==='home')history.replaceState(null,'',location.pathname+location.search);else location.hash=v}
  closeAll();
  if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0);
  if(v==='dashboard')renderDash();
  if(!['help','support'].includes(v)){const bt=$('#bot');if(bt&&!bt.hidden){bt.classList.remove('show');bt.hidden=true}}
  $$('.menu a.top,.mm>a').forEach(a=>{const on=a.getAttribute('href')==='#'+v;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(v==='about')requestAnimationFrame(()=>initAbout());
  if(['coverage','claims','pricing'].includes(v)&&!(window.pgInit=window.pgInit||{})[v]){window.pgInit[v]=1;requestAnimationFrame(()=>pgScene(document.querySelector(`[data-3d="${v}"]`),v))}
  if(v==='login')setTimeout(()=>$('#lEmail').focus({preventScroll:true}),60);
  if(v==='register'){regResume();if(!reg||reg.step===1)setTimeout(()=>$('#rName').focus({preventScroll:true}),60)}
  syncNav();
  window.ScrollTrigger&&ScrollTrigger.refresh();
  if(v==='home'&&window.wakeGlobe)requestAnimationFrame(()=>{wakeGlobe();requestAnimationFrame(wakeGlobe)});
}
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(VIEWS.includes(h)&&h!==curView)route(h)});
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const h=a.getAttribute('href').slice(1);
  if(VIEWS.includes(h)){e.preventDefault();e.stopImmediatePropagation();route(h);return}
  if(curView!=='home'&&h&&a.dataset.art===undefined){e.preventDefault();e.stopImmediatePropagation();route('home');if(h!=='top')setTimeout(()=>go('#'+h),80)}
},true);

/* nav state */
const avWrap=$('#avWrap'),avBtn=$('#avBtn'),avMenu=$('#avMenu');
function initials(n){return n.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('')||'?'}
function firstName(n){return n.split(/\s+/)[0]}
function syncNav(){
  const on=!!session&&!!user;
  $$('[data-guest]').forEach(el=>el.hidden=on);$$('[data-member]').forEach(el=>el.hidden=!on);
  avWrap.hidden=!on;
  if(on){$('#avIni').textContent=initials(user.name);$('#avName').textContent=firstName(user.name);$('#avWho').innerHTML=`<b>${esc(user.name)}</b><small>${esc(user.email)}</small>`}
}
avBtn.addEventListener('click',e=>{e.stopPropagation();const o=!avMenu.classList.contains('open');avMenu.classList.toggle('open',o);avBtn.setAttribute('aria-expanded',o)});
document.addEventListener('click',e=>{if(!e.target.closest('#avWrap')){avMenu.classList.remove('open');avBtn.setAttribute('aria-expanded','false')}});

/* password eye + strength */
document.addEventListener('click',e=>{const b=e.target.closest('[data-eye]');if(!b)return;const i=document.getElementById(b.dataset.eye);const show=i.type==='password';i.type=show?'text':'password';b.setAttribute('aria-label',show?'Hide password':'Show password');b.querySelector('use').setAttribute('href',show?'#i-eyeoff':'#i-eye')});
function strength(p){return [p.length>=8,/[a-z]/.test(p)&&/[A-Z]/.test(p),/\d/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length}
$('#rPass').addEventListener('input',e=>{const p=e.target.value,s=p?Math.max(1,strength(p)):0;$('#meter').dataset.s=s;$('#mhint').textContent=p?['','Weak password. Add length and variety.','Fair. Add a number or symbol.','Good password.','Strong password.'][s]:'Use 8+ characters with a mix of letters, numbers and symbols.'});
function ferr(id,msg){const el=$('#'+id+'E'),inp=$('#'+id);el.textContent=msg||'';if(inp)inp.setAttribute('aria-invalid',msg?'true':'false');return !msg}
const isEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const nameFromEmail=em=>em.split('@')[0].split(/[._\-+0-9]+/).filter(Boolean).map(w=>w[0].toUpperCase()+w.slice(1).toLowerCase()).join(' ')||'Member';

$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();
  const em=$('#lEmail').value.trim(),pw=$('#lPass').value;
  const ok1=ferr('lEmail',!em?'Enter your email address.':!isEmail(em)?'Enter an email like name@example.com.':'');
  const ok2=ferr('lPass',!pw?'Enter your password.':pw.length<6?'Passwords are at least 6 characters.':'');
  if(!ok1){$('#lEmail').focus();return} if(!ok2){$('#lPass').focus();return}
  const fin=()=>{if(!user||user.email.toLowerCase()!==em.toLowerCase()){user={name:nameFromEmail(em),email:em,since:new Date().toISOString()};store.set('li-user',user)}
  session=true;const rem=$('#lRem').checked;store.del('li-session');store.set('li-session',true,!rem);
  $('#lPass').value='';
  tab='home';sub='';route('dashboard');toast(`Welcome back, ${firstName(user.name)}.`)};
  if(user&&user.email.toLowerCase()===em.toLowerCase()&&user.verif&&user.verif.twofa)ask2fa(fin);else fin();
});
$('#regForm').addEventListener('submit',e=>{
  e.preventDefault();
  const n=$('#rName').value.trim(),em=$('#rEmail').value.trim(),ph=$('#rPhone').value.replace(/\D/g,'').replace(/^(62|0)/,''),p=$('#rPass').value,p2=$('#rPass2').value,t=$('#rTerms').checked;
  const r=[ferr('rName',n.length<2?'Enter your full name.':''),ferr('rEmail',!em?'Enter your email address.':!isEmail(em)?'Enter an email like name@example.com.':''),
    ferr('rPhone',!ph?'Enter your phone number.':!/^8\d{8,11}$/.test(ph)?'Enter an Indonesian mobile number, like 812 3456 7890.':''),
    ferr('rPass',p.length<8?'Use at least 8 characters.':strength(p)<2?'Add a mix of upper and lower case, numbers or symbols.':''),
    ferr('rPass2',!p2?'Re-enter your password.':p2!==p?'Passwords do not match.':''),ferr('rTerms',t?'':'Agree to the terms to create your account.')];
  const bad=['rName','rEmail','rPhone','rPass','rPass2','rTerms'][r.indexOf(false)];
  if(bad){$('#'+bad).focus();return}
  const same=reg&&reg.u.email===em&&reg.u.phone===ph;
  reg={step:2,u:{name:n,email:em,phone:ph},ch:same?reg.ch:'email',code:same?reg.code:null,sentAt:same?reg.sentAt:0,verified:false,twofa:null,kyc:false};saveReg();
  $('#rPass').value=$('#rPass2').value='';$('#meter').dataset.s=0;
  regGo(2);
});
/* ---------- multi-step register: account > OTP > 2FA > e-KYC > access ---------- */
const REG_ART=[["One place for your documents, your advocate and your family's plan.","Start free with Le-Insure Basic"],["A quick code keeps your account yours.","Step 2 · Verify your account"],["Your documents deserve a second lock.","Step 3 · Two-factor protection"],["Verified once, trusted across Le-Insure.","Step 4 · Identity verification"],["Prepared before. Protected during. Preserved after.","Step 5 · Your protected services"]];
let reg=store.get('li-reg',true);
const saveReg=()=>store.set('li-reg',reg,true);
const maskEmail=e=>{const [a,d]=e.split('@');return a.slice(0,2)+'•••@'+d};
const maskPhone=p=>'+62 '+p.slice(0,3)+' •••• '+p.slice(-3);
const newCode=()=>String(Math.floor(100000+Math.random()*900000));
const IC=(id,s=20)=>`<svg width="${s}" height="${s}"><use href="#${id}"/></svg>`;
const otpHTML=id=>`<div class="otp" id="${id}">${[1,2,3,4,5,6].map(i=>`<input inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="Digit ${i} of 6">`).join('')}</div>`;
function wireOtp(el,done){const ins=$$('input',el);const val=()=>ins.map(y=>y.value).join('');
  ins.forEach((x,i)=>{x.addEventListener('input',()=>{el.classList.remove('bad');x.value=x.value.replace(/\D/g,'').slice(-1);if(x.value&&i<5)ins[i+1].focus();if(val().length===6)done(val())});
    x.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!x.value&&i>0)ins[i-1].focus();if(e.key==='Enter'&&val().length===6)done(val())});
    x.addEventListener('paste',e=>{const t=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);if(!t)return;e.preventDefault();t.split('').forEach((c,k)=>ins[k]&&(ins[k].value=c));ins[Math.min(t.length,5)].focus();if(t.length===6)done(t)})});
  setTimeout(()=>ins[0].focus({preventScroll:true}),80);
  return{val,clear(){ins.forEach(y=>y.value='');ins[0].focus()},bad(){el.classList.add('bad');setTimeout(()=>{el.classList.remove('bad');ins.forEach(y=>y.value='');ins[0].focus()},450)},good(){el.classList.add('good')}}}
function fakeQR(seed){let x=seed;const r=()=>(x=(x*1103515245+12345)&0x7fffffff)/0x7fffffff;const n=25;let o='';
  const fin=(a,b)=>{o+=`<rect x="${a}" y="${b}" width="7" height="7" fill="#2B2320"/><rect x="${a+1}" y="${b+1}" width="5" height="5" fill="#fff"/><rect x="${a+2}" y="${b+2}" width="3" height="3" fill="#2B2320"/>`};
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){if((i<8&&j<8)||(i<8&&j>n-9)||(i>n-9&&j<8))continue;if(r()>.52)o+=`<rect x="${j}" y="${i}" width="1" height="1" fill="#2B2320"/>`}
  fin(0,0);fin(n-7,0);fin(0,n-7);return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" role="img" aria-label="Sample QR code for your authenticator app">${o}</svg>`}
function runScan(el,ms,onTick,done){el.classList.add('busy');const t0=performance.now();(function f(){const p=Math.min(1,(performance.now()-t0)/ms);el.style.setProperty('--p',(p*100).toFixed(1));onTick&&onTick(p);if(p<1)requestAnimationFrame(f);else{el.classList.remove('busy');el.classList.add('ok');el.innerHTML=IC('i-check',34);done&&done()}})()}

function regGo(n){
  if(n>1&&!reg){n=1}
  if(reg){reg.step=n;saveReg()}
  $$('#rStep li').forEach(li=>{const i=+li.dataset.i;li.classList.toggle('on',i===n);li.classList.toggle('done',i<n);li.toggleAttribute('aria-current',i===n);if(i===n)li.setAttribute('aria-current','step')});
  $$('.reg .rs').forEach(p=>p.hidden=+p.dataset.rs!==n);
  const q=$('[data-view="register"] .auth-art blockquote');q.innerHTML=`${REG_ART[n-1][0]}<small>${REG_ART[n-1][1]}</small>`;
  $('[data-view="register"] .auth-x').hidden=false;
  ({2:rs2,3:rs3,4:rs4,5:rs5})[n]?.();
  if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0);
}
function regResume(){if(reg&&reg.step>1){const u=reg.u;$('#rName').value=u.name;$('#rEmail').value=u.email;$('#rPhone').value=u.phone;regGo(reg.step)}else regGo(1)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-rgo]');if(!b)return;e.preventDefault();regGo(+b.dataset.rgo)});

function sendCode(){reg.code=newCode();reg.sentAt=Date.now();saveReg();toast(`Preview: code sent to ${reg.ch==='email'?maskEmail(reg.u.email):maskPhone(reg.u.phone)}.`)}
let reTimer=0;
function rs2(){const p=$('#rs2'),u=reg.u;if(!reg.code)sendCode();
  p.innerHTML=`<div><span class="rkick">Step 2 of 5</span><h1>Verify your account</h1><p class="sub">Enter the 6-digit code we sent. It confirms the email or phone number really belongs to you.</p></div>
  <div class="seg" role="tablist" aria-label="Where to send the code"><button type="button" role="tab" data-ch="email" aria-selected="${reg.ch==='email'}">Email</button><button type="button" role="tab" data-ch="sms" aria-selected="${reg.ch==='sms'}">SMS</button></div>
  <p class="sent">Code sent to <b>${reg.ch==='email'?maskEmail(u.email):maskPhone(u.phone)}</b></p>
  ${otpHTML('otp1')}<p class="ferr" id="otp1E" role="alert"></p>
  <p class="pvcode">Preview code: <b class="num" id="pvc">${reg.code}</b></p>
  <button class="btn lg" type="button" id="otpGo">Verify</button>
  <div class="row2"><button type="button" class="lnk" id="otpRe" disabled>Resend code</button><button type="button" class="lnk" data-rgo="1">Change details</button></div>`;
  const o=wireOtp($('#otp1'),check);
  function check(v){if(v.length<6){$('#otp1E').textContent='Enter all 6 digits.';return}
    if(v!==reg.code){$('#otp1E').textContent="That code doesn't match. Check it and try again.";o.bad();return}
    $('#otp1E').textContent='';o.good();reg.verified=true;saveReg();setTimeout(()=>regGo(3),500)}
  $('#otpGo').onclick=()=>check(o.val());
  $$('.seg button',p).forEach(b=>b.onclick=()=>{if(reg.ch===b.dataset.ch)return;reg.ch=b.dataset.ch;sendCode();rs2()});
  const re=$('#otpRe');clearInterval(reTimer);const tick=()=>{const s=30-Math.floor((Date.now()-(reg.sentAt||0))/1000);if(s>0){re.disabled=true;re.textContent=`Resend code in ${s}s`}else{re.disabled=false;re.textContent='Resend code';clearInterval(reTimer)}};tick();reTimer=setInterval(tick,1000);
  re.onclick=()=>{sendCode();$('#pvc').textContent=reg.code;tick();reTimer=setInterval(tick,1000)};
}
function rs3(){const p=$('#rs3');
  p.innerHTML=`<div><span class="rkick">Step 3 of 5</span><h1>Turn on two-factor protection</h1><p class="sub">Add a second step at sign-in so only you can open your documents, cases and legacy plan.</p></div>
  <div class="opt2" role="radiogroup" aria-label="Choose a method">
    <button type="button" class="opt" role="radio" data-m="passkey" aria-checked="false"><span class="oi">${IC('i-finger',22)}</span><b>Passkey <em class="rec">Recommended</em></b><small>Sign in with Face ID, fingerprint or your device PIN. Nothing to type.</small></button>
    <button type="button" class="opt" role="radio" data-m="app" aria-checked="false"><span class="oi">${IC('i-key',22)}</span><b>Authenticator app</b><small>Get a 6-digit code from Google Authenticator, Microsoft Authenticator or Authy.</small></button>
  </div><div class="m2" id="m2"></div>
  <button type="button" class="lnk skip" id="skip2">Set up later</button>`;
  const pick=m=>{$$('.opt',p).forEach(b=>b.setAttribute('aria-checked',b.dataset.m===m));const box=$('#m2');
    if(m==='passkey'){box.innerHTML=`<div class="pk"><div class="scan" id="pkScan">${IC('i-finger',34)}</div><p>Your device will ask you to confirm with Face ID, fingerprint or your PIN. The passkey stays on your device.</p><button type="button" class="btn lg" id="pkGo">Create passkey</button></div>`;
      $('#pkGo').onclick=e=>{e.target.disabled=true;e.target.textContent='Waiting for your device…';runScan($('#pkScan'),1600,null,()=>{e.target.textContent='Passkey created';reg.twofa='passkey';saveReg();toast('Passkey created. Two-factor protection is on.');setTimeout(()=>regGo(4),700)})}}
    else{const key=Array.from({length:4},()=>Math.random().toString(36).slice(2,6).toUpperCase()).join(' ');
      box.innerHTML=`<div class="qa"><div class="qr">${fakeQR(Math.floor(Math.random()*1e6))}</div><div><p><b>1.</b> Scan this QR code in your authenticator app.</p><p style="margin-top:6px">Can't scan? Enter this setup key:<br><code>${key}</code></p><p style="margin-top:6px"><b>2.</b> Type the 6-digit code it shows.</p></div></div>${otpHTML('otp2')}<p class="ferr" id="otp2E" role="alert"></p><p class="pvcode">Preview: any 6 digits work here.</p><button type="button" class="btn lg" id="appGo">Turn on two-factor</button>`;
      const o=wireOtp($('#otp2'),ok);function ok(v){if(v.length<6){$('#otp2E').textContent='Enter all 6 digits from your app.';return}$('#otp2E').textContent='';o.good();reg.twofa='app';saveReg();toast('Authenticator linked. Two-factor protection is on.');setTimeout(()=>regGo(4),600)}
      $('#appGo').onclick=()=>ok(o.val())}};
  $$('.opt',p).forEach(b=>b.onclick=()=>pick(b.dataset.m));
  $('#skip2').onclick=()=>{reg.twofa=null;saveReg();regGo(4)};
}
function ktpSample(){return `<svg class="ktpcard" viewBox="0 0 158 100"><rect width="158" height="100" rx="8" fill="#9CC3E4"/><rect x="0" y="0" width="158" height="18" fill="#6FA3CF"/><rect x="10" y="26" width="80" height="5" rx="2" fill="#2B2320" opacity=".6"/><rect x="10" y="37" width="64" height="4" rx="2" fill="#2B2320" opacity=".4"/><rect x="10" y="46" width="70" height="4" rx="2" fill="#2B2320" opacity=".4"/><rect x="10" y="55" width="56" height="4" rx="2" fill="#2B2320" opacity=".4"/><rect x="10" y="64" width="66" height="4" rx="2" fill="#2B2320" opacity=".4"/><rect x="112" y="26" width="36" height="46" rx="3" fill="#E8DBCC"/><circle cx="130" cy="42" r="8" fill="#B79A86"/><path d="M116 70c2-10 26-10 28 0" fill="#B79A86"/><text x="79" y="12" font-size="7" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="700">SAMPLE ID CARD</text></svg>`}
function rs4(){const p=$('#rs4');let file=false,face=false;
  p.innerHTML=`<div><span class="rkick">Step 4 of 5</span><h1>Verify your identity</h1><p class="sub">e-KYC with your KTP and a quick face check. It unlocks advocate bookings, the Legal Protection Plan and LE-LEGACY emergency access.</p></div>
  <div class="kyc">
    <div class="kstep"><div class="kh"><span class="kn">A</span><b>Your KTP</b><span class="kst" id="k1s">To do</span></div>
      <div class="inp"><label for="kNik">NIK (16 digits)</label><div class="inbox">${IC('i-id',18)}<input id="kNik" inputmode="numeric" maxlength="16" autocomplete="off" placeholder="The 16-digit number on your KTP"></div><p class="ferr" id="kNikE"></p></div>
      <label class="ktp"><input type="file" accept="image/*" id="kFile" class="sr-only" style="position:absolute;opacity:0;width:1px;height:1px"><span class="th" id="ktpTh">${IC('i-id',26)}</span><span><b id="ktpT">Upload a photo of your KTP</b><small id="ktpS">JPG or PNG with all four corners visible</small></span></label>
      <button type="button" class="lnk" id="ktpSample" style="justify-self:start;font-size:13px">Use a sample KTP for this preview</button>
    </div>
    <div class="kstep"><div class="kh"><span class="kn">B</span><b>Face check</b><span class="kst" id="k2s">To do</span></div>
      <div class="face"><div class="scan" id="faceScan">${IC('i-face',34)}</div><p id="faceTip"><b>Liveness check</b>Find good light and keep your face inside the circle. We match it with your KTP photo.</p></div>
      <button type="button" class="btn ghost" id="faceGo" style="justify-self:start">Start face check</button>
    </div>
  </div>
  <p class="prev-note" style="margin:0">In the live app these checks run through a licensed e-KYC partner. In this preview nothing leaves your browser.</p>
  <button type="button" class="btn lg" id="kycGo">Submit for verification</button>
  <button type="button" class="lnk skip" id="skip3">Verify later</button>`;
  const nik=$('#kNik');const st=()=>{const okA=/^\d{16}$/.test(nik.value)&&file;$('#k1s').textContent=okA?'Done':'To do';$('#k1s').classList.toggle('ok',okA);return okA};
  nik.addEventListener('input',()=>{nik.value=nik.value.replace(/\D/g,'').slice(0,16);ferr('kNik','');st()});
  const setFile=(html,name)=>{file=true;$('#ktpTh').innerHTML=html;$('#ktpT').textContent=name;$('#ktpS').textContent='Photo added. Tap to replace.';st()};
  $('#kFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')){toast('Choose a JPG or PNG photo of your KTP.');return}setFile(`<img alt="Your KTP photo" src="${URL.createObjectURL(f)}">`,f.name)});
  $('#ktpSample').onclick=()=>{setFile(ktpSample(),'Sample KTP (preview)');if(!nik.value)nik.value='3171'+String(Math.floor(Math.random()*1e12)).padStart(12,'0');st()};
  const tips=['Look straight at the screen','Turn your head slightly left','Now slightly right','Blink once','Matching with your KTP photo'];
  $('#faceGo').onclick=e=>{const b=e.target;b.disabled=true;b.textContent='Checking…';const tp=$('#faceTip');
    runScan($('#faceScan'),3600,pr=>{const t=tips[Math.min(tips.length-1,Math.floor(pr*tips.length))];if(tp.dataset.t!==t){tp.dataset.t=t;tp.innerHTML=`<b>${t}</b>Keep your face inside the circle.`}},()=>{face=true;tp.innerHTML='<b>Face matched</b>Liveness confirmed and matched with your KTP photo.';b.textContent='Face check done';$('#k2s').textContent='Done';$('#k2s').classList.add('ok')})};
  $('#kycGo').onclick=e=>{const okN=/^\d{16}$/.test(nik.value);ferr('kNik',okN?'':'Enter the 16-digit NIK from your KTP.');
    if(!okN){nik.focus();return} if(!file){toast('Add a photo of your KTP first.');return} if(!face){toast('Complete the face check first.');$('#faceGo').focus();return}
    const b=e.target;b.disabled=true;b.textContent='Verifying…';setTimeout(()=>{reg.kyc=true;saveReg();toast('Identity verified.');regGo(5)},1200)};
  $('#skip3').onclick=()=>{reg.kyc=false;saveReg();regGo(5)};
}
const TIERS=[
  {k:'verified',n:'Account verified',s:()=>reg.ch==='sms'?'Phone confirmed by OTP':'Email confirmed by OTP',items:['Legal Check-up & Education Hub','Legal Triage','LE-DOCS storage']},
  {k:'twofa',n:'Two-factor protection',s:()=>reg.twofa==='passkey'?'Passkey on this device':reg.twofa==='app'?'Authenticator app':'Not set up yet',items:['Share documents from LE-DOCS','AI-assisted Contract Review','Case Tracker'],fix:3},
  {k:'kyc',n:'Identity verified (e-KYC)',s:()=>reg.kyc?'KTP and face check passed':'Not verified yet',items:['Book a partner advocate','Legal Protection Plan (Phase 2)','LE-LEGACY emergency access and notary referral'],fix:4}];
function rs5(){const p=$('#rs5'),fn=firstName(reg.u.name);const on=TIERS.map(t=>!!reg[t.k]);const n=on.filter(Boolean).length;
  p.innerHTML=`<div><span class="rkick">Step 5 of 5</span><h1>${n===3?`You're fully protected, ${fn}.`:`You're in, ${fn}.`}</h1><p class="sub">${n===3?'Every service is open to you.':'Services open up as you finish verification. You can finish the rest any time.'}</p></div>
  <div class="tiers">${TIERS.map((t,i)=>`<div class="tier${on[i]?'':' off'}"><div class="tier-h"><span class="ti">${IC(on[i]?'i-check':'i-lock',18)}</span><span><b>${t.n}</b><small>${t.s()}</small></span>${!on[i]&&t.fix?`<button type="button" class="lnk" data-rgo="${t.fix}">Finish now</button>`:''}</div><ul>${t.items.map(x=>`<li>${IC(on[i]?'i-check':'i-lock',13)}${x}</li>`).join('')}</ul></div>`).join('')}</div>
  <button type="button" class="btn lg" id="regDone">Go to my dashboard</button>`;
  $('#regDone').onclick=()=>{user={name:reg.u.name,email:reg.u.email,phone:reg.u.phone,since:new Date().toISOString(),verif:{contact:reg.ch,twofa:reg.twofa||null,kyc:!!reg.kyc}};store.set('li-user',user);
    session=true;store.set('li-session',true);store.del('li-reg');try{sessionStorage.removeItem('li-reg')}catch(e){}reg=null;clearInterval(reTimer);
    $('#regForm').reset();$('#meter').dataset.s=0;tab='home';sub='';route('dashboard');toast('Account created. Welcome to Le-Insure.')};
}
/* 2FA at login */
function ask2fa(done){const m=user.verif.twofa;
  if(m==='passkey'){openModal(`<div class="mh"><h3 id="mTitle">Confirm it's you</h3>${X}</div><div class="m2fa"><p class="note" style="font-size:14.5px">Use the passkey on this device: Face ID, fingerprint or your PIN.</p><div class="scan" id="lgScan">${IC('i-finger',34)}</div><button class="btn" id="lgPk">Use passkey</button></div>`);
    $('#lgPk').onclick=e=>{e.target.disabled=true;runScan($('#lgScan'),1200,null,()=>setTimeout(()=>{closeModal();done()},350))}}
  else{openModal(`<div class="mh"><h3 id="mTitle">Enter your 2FA code</h3>${X}</div><div class="m2fa"><p class="note" style="font-size:14.5px">Open your authenticator app and type the 6-digit code for Le-Insure.</p>${otpHTML('lgOtp')}<p class="ferr" id="lgE"></p><p class="pvcode">Preview: any 6 digits work here.</p><button class="btn" id="lgGo">Verify and log in</button></div>`);
    const o=wireOtp($('#lgOtp'),ok);function ok(v){if(v.length<6){$('#lgE').textContent='Enter all 6 digits.';return}o.good();setTimeout(()=>{closeModal();done()},350)}$('#lgGo').onclick=()=>ok(o.val())}}

$('#forgot').addEventListener('click',()=>{const em=$('#lEmail').value.trim();toast(isEmail(em)?`Preview: a reset link would go to ${em}.`:'Enter your email first, then tap Forgot password.')});
$$('[data-sso]').forEach(b=>b.addEventListener('click',()=>toast(`${b.textContent} sign-in isn't available in this preview.`)));
document.addEventListener('click',e=>{const b=e.target.closest('[data-legal]');if(!b)return;e.preventDefault();
  const t=b.dataset.legal==='terms'?['Terms of Service','Le-Insure is a technology platform. Insurance is provided by OJK-licensed insurers, legal services by partner advocates, and deeds by partner notaries. Le-Insure does not give legal advice or guarantee legal outcomes. The full terms will be published before launch.']:['Privacy Policy','Your documents are encrypted and shared only with your permission. We follow Indonesia\'s Personal Data Protection Law (UU PDP). The full policy will be published before launch.'];
  openModal(`<div class="mh"><h3 id="mTitle">${t[0]}</h3>${X}</div><p class="note" style="font-size:15px">${t[1]}</p>`)});

/* logout */
function askLogout(){
  closeAll();avMenu.classList.remove('open');
  openModal(`<div style="text-align:right">${X}</div><div style="text-align:center"><div class="lo-ic"><svg width="32" height="32"><use href="#i-logout"/></svg></div><h3 id="mTitle">Log out of your account?</h3><p class="note" style="font-size:14.5px;margin-top:8px">You'll be signed out and need to log in again to access your dashboard.</p></div><div class="lo-actions"><button class="btn ghost" id="loCancel">Cancel</button><button class="btn" id="loGo">Log out</button></div>`);
  $('#loCancel').addEventListener('click',closeModal);
  $('#loGo').addEventListener('click',()=>{session=false;store.del('li-session');closeModal();setTimeout(()=>{route('home');toast("You're logged out.")},260)});
}
document.addEventListener('click',e=>{if(e.target.closest('[data-logout]')){e.preventDefault();askLogout()}});

/* ---------- member dashboard (sample data, browser-only) ---------- */
const today=new Date();
const addDays=d=>{const x=new Date(today);x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};
const fmtDate=s=>s?new Date(s).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
function greet(){const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
const SAMPLE='<span class="sample">Sample data for this preview</span>';
const DOCCAT={personal:['Personal documents','KTP, KK and other identity documents','i-id'],family:['Family documents','Marriage certificate and family records','i-user'],property:['Property & assets','Land certificate, BPKB and asset papers','i-pin'],contracts:['Contracts','Work, rental and personal agreements','i-scan'],insurance:['Insurance','Policies and protection documents','i-shield']};
const CASE_ST=['Submitted','Under review','Advocate assigned','In progress','Resolved'];
const NTYPE={contract:['Contract expiry','i-scan'],doc:['Document expiry','i-doc'],case:['Case update','i-track'],appt:['Appointment','i-clock'],policy:['Policy & claims','i-shield'],security:['Security alert','i-lock']};
const ADV=[['Adv. Rina Kusuma, S.H.','Rental & housing','Jakarta',350000,12],['Adv. Bagus Hartono, S.H., M.H.','Employment','Jakarta',400000,15],['Adv. Maya Lestari, S.H.','Consumer & online purchases','Bandung',300000,8],['Adv. Yusuf Ramadhan, S.H.','Family & inheritance','Surabaya',450000,18],['Adv. Clara Wijaya, S.H., LL.M.','Contracts & business','Jakarta',500000,11],['Adv. Dewi Anggraini, S.H.','Employment','Yogyakarta',275000,7]];
const NOT=[['Notaris Hendra Gunawan, S.H., M.Kn.','South Jakarta'],['Notaris Ayu Prameswari, S.H., M.Kn.','Bandung'],['Notaris Fajar Nugroho, S.H., M.Kn.','Surabaya']];
const SIT={rent:['I rent my home',['Keep a signed copy of your lease','Photograph the unit at move-in and move-out','Get a receipt for the deposit','Know the notice period to end the lease']],
  work:['I work under a contract',['Keep your signed employment contract','Check if you are on a fixed-term (PKWT) or permanent (PKWTT) contract','Save payslips from the last 12 months','Know your severance terms']],
  property:['I own property or a vehicle',['Store the land certificate original safely and scan it','Check the certificate name matches your ID','Keep PBB tax and BPKB records together']],
  family:['I am married or have children',['Keep the family card (KK) up to date','Record beneficiaries in LE-LEGACY','Choose an emergency contact']],
  online:['I shop online often',['Screenshot orders and seller chats','Pay through the platform, not by direct transfer','Know the return and complaint window']],
  business:['I run a small business',['Use written agreements with clients','Register your business (NIB)','Separate business and personal accounts']]};
const mkD=()=>({v:4,plan:'Basic',budget:1000000,payMethod:'BCA •••• 4821',fb:[{id:1,at:addDays(-14),r:4,topic:'Documents',m:'Uploading from my phone was easy. Please add folders inside categories.',st:'Reviewed'}],
  tx:[{id:1,at:addDays(-3),n:'Consultation · Adv. Rina Kusuma',c:'Advocates',a:-350000,st:'Paid'},{id:2,at:addDays(-3),n:'Le-Insure platform fee',c:'Platform',a:-25000,st:'Paid'},{id:3,at:addDays(-1),n:'Refund · duplicate platform fee',c:'Refund',a:25000,st:'Pending'},{id:4,at:addDays(-12),n:'LE-LEGACY setup package',c:'Legacy',a:-250000,st:'Paid'},{id:5,at:addDays(-18),n:'Courier for certified copies',c:'Documents',a:-45000,st:'Paid'},{id:6,at:addDays(-25),n:'Refund · cancelled consultation',c:'Refund',a:300000,st:'Paid out'},{id:7,at:addDays(-34),n:'Employer reimbursement · PT Sample',c:'Reimbursement',a:150000,st:'Paid out'}],
  notifs:[{id:1,t:'contract',h:'Apartment lease ends in 27 days',b:'Review the renewal terms before you sign again.',at:addDays(-1),r:false},
    {id:2,t:'doc',h:'Employment contract ends in 58 days',b:'Check your renewal or severance terms.',at:addDays(-2),r:false},
    {id:3,t:'case',h:'Case LI-2026-0142: advocate assigned',b:'Adv. Rina Kusuma will contact you within 1 working day.',at:addDays(-3),r:false},
    {id:4,t:'appt',h:'Consultation confirmed',b:`Video call with Adv. Rina Kusuma on ${fmtDate(addDays(2))} at 10:00.`,at:addDays(-3),r:true},
    {id:5,t:'policy',h:'Legal Protection Plan update',b:'Policies open in 2028. You can join the waitlist in My Protection.',at:addDays(-6),r:true},
    {id:6,t:'security',h:'New sign-in from Chrome on Windows',b:"Jakarta, Indonesia. If this wasn't you, change your password.",at:addDays(-8),r:true}],
  docs:[['KTP (ID card)','personal',null,'1.2 MB'],['Passport','personal',addDays(410),'2.4 MB'],['Kartu Keluarga (family card)','family',null,'0.9 MB'],['Marriage certificate','family',null,'1.1 MB'],['Land certificate (SHM)','property',null,'3.0 MB'],['BPKB motorcycle','property',null,'1.4 MB'],['Employment contract','contracts',addDays(58),'0.6 MB'],['Apartment lease','contracts',addDays(27),'0.8 MB'],['BPJS Kesehatan card','insurance',null,'0.4 MB'],['Vehicle insurance policy','insurance',addDays(120),'1.0 MB']].map((d,i)=>({id:i+1,n:d[0],c:d[1],e:d[2],s:d[3],sh:i===7?[['Adv. Rina Kusuma, S.H.','Until case closes']]:[],rem:!!d[2]})),
  sit:{rent:true,work:true,property:false,family:true,online:true,business:false},chk:{},
  cases:[{id:'LI-2026-0142',cat:'Rental / housing',h:'Deposit not returned after moving out',sub:addDays(-9),st:2,adv:'Adv. Rina Kusuma, S.H.',urg:'Medium',
    req:[['Lease agreement',true],['Deposit transfer receipt',false],['Chat history with the landlord',false],['Move-out photos',true]],
    next:['Upload the deposit transfer receipt',`Join the video consultation on ${fmtDate(addDays(2))} at 10:00`],
    hist:[[addDays(-9),'Issue reported through Legal Triage'],[addDays(-8),'Classified as Rental / housing, medium urgency'],[addDays(-3),'Partner advocate assigned'],[addDays(-3),'Consultation booked']]}],
  assets:[['Apartment unit, South Jakarta','Property','Original certificate in the home safe'],['Savings account','Bank account','Account details stored in LE-DOCS'],['Motorcycle','Vehicle','BPKB stored in LE-DOCS']],
  docmap:[['Land certificate (SHM)','Home safe, bedroom',true],['Marriage certificate',"Parents' house, Bandung",true],['Life insurance policy','Office drawer',false]],
  ben:[['Sari Wulandari','Spouse','50%'],['Dimas Pratama','Child','50%']],
  em:{who:'Sari Wulandari',wait:'7 days',on:true},lppWait:false,review:null,
  devices:[['Chrome on Windows','Jakarta · this device',true],['Le-Insure app on iPhone','Jakarta · 2 hours ago',false],['Safari on MacBook','Bandung · 3 days ago',false]],
  logins:[[addDays(0),'Chrome on Windows','Jakarta','Success'],[addDays(-1),'Le-Insure app on iPhone','Jakarta','Success'],[addDays(-3),'Safari on MacBook','Bandung','Success'],[addDays(-5),'Unknown browser','Surabaya','Blocked: wrong 2FA code']],
  priv:{advocate:true,notary:true,analytics:true,marketing:false},nset:{contract:true,doc:true,case:true,appt:true,policy:true,security:true}});
let D=store.get('li-dash');if(!D||D.v!==4)D=mkD();
const saveD=()=>store.set('li-dash',D);
let tab='home',sub='';
const V=()=>{const v=(user&&user.verif)||{};return{contact:v.contact||'email',twofa:v.twofa||null,kyc:!!v.kyc}};
const setV=o=>{user.verif=Object.assign(V(),o);store.set('li-user',user)};

/* motifs: one per area */
const MO={
 globe:`<svg class="mo mo-globe" viewBox="0 0 220 220" aria-hidden="true"><circle class="fl" cx="110" cy="110" r="78"/><g class="spinw"><g class="mer">${[0,1,2,3].map(i=>`<ellipse cx="110" cy="110" rx="78" ry="78" style="animation-delay:-${i*3}s"/>`).join('')}</g><ellipse cx="110" cy="110" rx="78" ry="18"/><ellipse cx="110" cy="72" rx="66" ry="14"/><ellipse cx="110" cy="148" rx="66" ry="14"/></g><ellipse class="orb" cx="110" cy="110" rx="104" ry="30" transform="rotate(-18 110 110)"/><g transform="rotate(-18 110 110)"><circle class="star" r="4.5"><animateMotion dur="7s" repeatCount="indefinite" path="M6 110 A104 30 0 1 0 214 110 A104 30 0 1 0 6 110"/></circle></g></svg>`,
 gavel:`<svg class="mo mo-gavel" viewBox="0 0 220 220" aria-hidden="true"><ellipse class="rip" cx="80" cy="170" rx="56" ry="12"/><ellipse class="rip r2" cx="80" cy="170" rx="56" ry="12"/><rect x="34" y="160" width="92" height="18" rx="6" class="fl"/><g class="arm"><rect x="94" y="104" width="104" height="10" rx="5"/><g transform="rotate(-0 0 0)"><rect x="50" y="78" width="46" height="62" rx="9" class="fl"/><rect x="47" y="88" width="52" height="7" rx="3"/><rect x="47" y="123" width="52" height="7" rx="3"/></g></g></svg>`,
 vault:`<svg class="mo mo-vault" viewBox="0 0 220 220" aria-hidden="true"><rect class="d d3" x="58" y="40" width="96" height="124" rx="10"/><rect class="d d2" x="70" y="50" width="96" height="124" rx="10"/><rect class="d fl" x="82" y="60" width="96" height="124" rx="10"/><path d="M98 92h62M98 108h62M98 124h40"/><g class="lk"><rect x="140" y="132" width="52" height="42" rx="8" class="fl"/><path d="M150 132v-10a16 16 0 0132 0v10"/><circle cx="166" cy="152" r="5"/></g></svg>`,
 pillars:`<svg class="mo mo-pil" viewBox="0 0 220 220" aria-hidden="true"><path class="fl" d="M24 64 L110 22 L196 64 Z"/><rect x="24" y="64" width="172" height="10" rx="2"/>${[44,92,140].map((x,i)=>`<g class="c" style="animation-delay:${i*.25}s"><rect x="${x}" y="80" width="36" height="8" rx="2"/><rect class="fl" x="${x+5}" y="88" width="26" height="92"/><path d="M${x+12} 92v84M${x+18} 92v84M${x+24} 92v84"/><rect x="${x}" y="180" width="36" height="8" rx="2"/></g>`).join('')}<rect x="16" y="190" width="188" height="10" rx="3"/></svg>`,
 scale:`<svg class="mo mo-scale" viewBox="0 0 220 220" aria-hidden="true"><path class="fl" d="M80 196h60l-10-14h-40z"/><rect x="106" y="40" width="8" height="144" rx="3"/><circle cx="110" cy="36" r="9" class="fl"/><g class="bm"><rect x="34" y="44" width="152" height="6" rx="3"/><g class="pl"><path d="M44 48 L24 116 M44 48 L64 116"/><path class="fl" d="M18 116 Q44 138 70 116 Z"/></g><g class="pr"><path d="M176 48 L156 116 M176 48 L196 116"/><path class="fl" d="M150 116 Q176 138 202 116 Z"/></g></g></svg>`,
 bell:`<svg class="mo mo-bell" viewBox="0 0 220 220" aria-hidden="true"><circle class="rg" cx="110" cy="104" r="60"/><circle class="rg r2" cx="110" cy="104" r="60"/><g class="bl"><path class="fl" d="M74 140v-40a36 36 0 0172 0v40l10 12H64z"/><path d="M98 164a12 12 0 0024 0"/><circle cx="110" cy="56" r="5"/></g><circle class="dot" cx="148" cy="70" r="11"/></svg>`,
 coins:`<svg class="mo mo-coins" viewBox="0 0 220 220" aria-hidden="true"><path class="bar b1" d="M150 186V120"/><path class="bar b2" d="M172 186V96"/><path class="bar b3" d="M194 186V70"/>${[0,1,2,3].map(i=>`<g class="cn" style="animation-delay:${i*.35}s"><ellipse class="fl" cx="84" cy="${168-i*22}" rx="46" ry="13"/><path d="M38 ${168-i*22}v10c0 7 21 13 46 13s46-6 46-13v-10"/></g>`).join('')}<g class="drop"><ellipse class="fl" cx="84" cy="48" rx="46" ry="13"/><path d="M74 44h20M84 40v8"/></g></svg>`,
 chat:`<svg class="mo mo-chat" viewBox="0 0 220 220" aria-hidden="true"><g class="b1"><path class="fl" d="M30 50h110a12 12 0 0112 12v52a12 12 0 01-12 12H74l-24 20v-20H30a12 12 0 01-12-12V62a12 12 0 0112-12z"/><path d="M44 78h80M44 98h52"/></g><g class="b2"><path class="fl" d="M120 120h70a10 10 0 0110 10v34a10 10 0 01-10 10h-10v16l-20-16h-40a10 10 0 01-10-10v-34a10 10 0 0110-10z"/>${[0,1,2].map(i=>`<circle class="dt" cx="${136+i*18}" cy="148" r="4" style="animation-delay:${i*.18}s"/>`).join('')}</g>${[0,1,2,3,4].map(i=>`<path class="st" style="animation-delay:${i*.15}s" transform="translate(${24+i*22} 178) scale(.7)" d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z"/>`).join('')}</svg>`,
 shield:`<svg class="mo mo-shield" viewBox="0 0 220 220" aria-hidden="true"><path class="fl" d="M110 26 L172 50 V104 C172 146 146 176 110 194 C74 176 48 146 48 104 V50 Z"/><g class="fp"><path d="M110 92v28a26 26 0 01-6 16M94 104a16 16 0 0132 0v10M84 120v-10a26 26 0 0145-17M136 108v12a40 40 0 01-4 17M100 124a12 12 0 01-4 10"/></g><path class="scan" d="M64 100h92"/></svg>`};
const HERO=(m,kick,h,p,extra='')=>`<header class="dz-hero"><div class="dz-hero-t"><span class="dz-kick">${kick}</span><h1>${h}</h1><p>${p}</p>${extra}</div><div class="dz-hero-m">${MO[m]}</div></header>`;
const chip=(ok,t)=>`<span class="dz-chip ${ok===true?'ok':ok===false?'no':ok==='info'?'info':'mid'}">${t}</span>`;
const tog=(k,on,label)=>`<button type="button" class="dz-tog" role="switch" aria-checked="${on}" data-tog="${k}" aria-label="${esc(label)}"><i></i></button>`;
const NAV=[['home','Dashboard','i-home'],['protection','My Protection','i-shield',[['checkup','Legal Check-up'],['contract','AI Contract Review'],['triage','Legal Triage'],['advocate','Find an Advocate'],['lpp','Legal Protection Plan'],['tracker','Case Tracker']]],['docs','LE-DOCS','i-doc'],['legacy','Legacy Planning','i-inf'],['cases','My Cases','i-track'],['finance','Finance','i-wallet'],['notif','Notifications','i-bell'],['feedback','Feedback','i-chat'],['account','Account & Security','i-gear',[['profile','Profile'],['security','Security'],['privacy','Privacy']]]];
const PROT=['checkup','contract','triage','advocate','lpp','tracker'];
const DZTIPS=['Keep scans of your KTP and KK in LE-DOCS so they are ready when you need them.','Ask for the advocate fee in writing before a consultation starts.','Put contract end dates in your calendar 60 days ahead.','Turn on 2FA so a leaked password is not enough to open your vault.','Record your beneficiaries early. It saves your family time later.'];
let dzTipI=0,dzTipT=null;
function drawExtra(){const el=$('#dzExtra');if(!el)return;const v=V(),score=Math.round(([true,!!v.twofa,v.kyc].filter(Boolean).length/3)*100),C=2*Math.PI*25;
  const ap=D.notifs.find(n=>n.t==='appt');let nx='';if(ap){const m=(ap.b||'').match(/on (\d{1,2}) (\w{3})/);nx=`<div class="dz-xc"><span class="xl">Coming up</span><div class="dz-next"><span class="cal"><i>${m?m[2]:'—'}</i><b>${m?m[1]:'•'}</b></span><span>${esc(ap.h)}</span></div></div>`}
  el.innerHTML=`<div class="dz-xc cons"><span class="xl">Your protection</span><div class="dz-shield"><svg viewBox="0 0 58 58" aria-hidden="true"><defs><linearGradient id="dzxg" x1="0" x2="1"><stop offset="0" stop-color="#E1AAB1"/><stop offset="1" stop-color="#F3EADB"/></linearGradient></defs><circle class="bg" cx="29" cy="29" r="25"/><circle class="fg" cx="29" cy="29" r="25" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-score/100)).toFixed(1)}"/><path class="sh" d="M29 15 L39 19 V28 C39 35 34 39 29 42 C24 39 19 35 19 28 V19 Z"/><circle class="sat" r="2.6"><animateMotion dur="6s" repeatCount="indefinite" path="M29 4 A25 25 0 1 1 28.9 4"/></circle></svg><span><b>${score}%</b><small>${score===100?'Fully protected':'Finish setup to reach 100%'}</small></span></div><span class="chipp">Le-Insure ${esc(D.plan)}</span></div>${nx}
  <div class="dz-xc dz-tip"><span class="xl">Tip of the day</span><p id="dzTipP">${DZTIPS[dzTipI]}</p><div class="dots">${DZTIPS.map((_,i)=>`<i class="${i===dzTipI?'on':''}"></i>`).join('')}</div></div>`;
  if(!dzTipT)dzTipT=setInterval(()=>{const p=$('#dzTipP');if(!p||curView!=='dashboard')return;p.classList.add('out');setTimeout(()=>{dzTipI=(dzTipI+1)%DZTIPS.length;p.textContent=DZTIPS[dzTipI];$$('#dzExtra .dots i').forEach((d,i)=>d.classList.toggle('on',i===dzTipI));p.classList.remove('out')},450)},6500)}
function drawNav(){const unread=D.notifs.filter(n=>!n.r).length;const top=PROT.includes(tab)?'protection':tab;
  $('#dzNav').innerHTML=NAV.map(([k,l,ic,subs])=>{const on=top===k;return `<button type="button" class="dz-ni${on?' on':''}" data-go="${k}" ${on?'aria-current="page"':''}>${IC(ic,19)}<span>${l}</span>${k==='notif'&&unread?`<em class="dz-badge">${unread}</em>`:''}${subs?`<svg class="cv" width="14" height="14"><use href="#i-chev"/></svg>`:''}</button>${subs?`<div class="dz-sub${on?' open':''}">${subs.map(([s,sl])=>`<button type="button" data-go="${k==='protection'?s:'account'}"${k==='account'?` data-sub="${s}"`:''} class="${(k==='protection'?tab===s:tab==='account'&&(sub||'profile')===s)?'on':''}">${sl}</button>`).join('')}</div>`:''}`}).join('');
  $('#dzMob').innerHTML=NAV.map(([k,l])=>`<button type="button" data-go="${k}" aria-current="${top===k?'page':'false'}">${l}${k==='notif'&&unread?` (${unread})`:''}</button>`).join('');
  drawExtra();$('#dzGreet').textContent=greet()+',';$('#dzName').textContent=firstName(user.name);$('#dzAv').textContent=initials(user.name)}

const TABS={
 home(){const v=V(),unread=D.notifs.filter(n=>!n.r),vc=[true,!!v.twofa,v.kyc].filter(Boolean).length;
  return HERO('globe','Dashboard',`${greet()},<br><em>${esc(firstName(user.name))}</em>`,`Welcome back to Le-Insure. ${today.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}. ${unread.length?`You have ${unread.length} new notification${unread.length>1?'s':''}.`:'Everything is up to date.'}`,SAMPLE)+`
  <div class="dz-stat">
   <div class="dz-card st-acc"><div class="dz-ring" style="--p:${vc/3*100}"><b>${vc}/3</b></div><div><span class="dz-l">Account status</span><h3>${vc===3?'Fully verified':'Verified'}</h3><p>${chip(true,'Contact')} ${chip(!!v.twofa,'2FA')} ${chip(v.kyc,'e-KYC')}</p>${vc<3?'<button class="lnk" data-go="account" data-sub="profile">Finish verification</button>':''}</div></div>
   <div class="dz-card st-plan"><span class="dz-l">Membership plan</span><h3>Le-Insure ${D.plan}</h3><div class="seg sm" role="group" aria-label="Preview another plan">${['Basic','Plus','Employee'].map(p=>`<button type="button" data-plan="${p}" aria-pressed="${D.plan===p}">${p}</button>`).join('')}</div><p class="dz-m">${D.plan==='Basic'?'Free: check-up, triage, 1 GB vault.':D.plan==='Plus'?'Rp29,000/month: contract review, 20 GB vault, Case Tracker.':'Through your employer: Plus features and one 30-minute consultation a year.'}</p></div>
   <div class="dz-card st-sec"><span class="dz-l">Security status</span><h3>2FA ${v.twofa?'enabled':'disabled'}</h3><p class="dz-m">${v.twofa?(v.twofa==='passkey'?'Passkey on this device.':'Authenticator app.'):'Add a second step at sign-in to protect your documents.'}</p><button class="btn sm ${v.twofa?'ghost':''}" data-go="account" data-sub="security">${v.twofa?'Manage security':'Turn on 2FA'}</button></div>
  </div>
  <h2 class="dz-h2">Quick actions</h2>
  <div class="dz-qa">${[['checkup','Start legal check-up','i-book'],['contract','Review contract','i-scan'],['upload','Upload document','i-up'],['triage','Report legal issue','i-gavel'],['cases','View my cases','i-track']].map(([k,l,ic])=>`<button type="button" class="dz-qb" ${k==='upload'?'data-act="upload"':`data-go="${k}"`}><span>${IC(ic,22)}</span>${l}</button>`).join('')}</div>
  <h2 class="dz-h2">Money at a glance</h2>
  <div class="dz-fin3">${budgetCard(false)}${payoutCard(false)}
   <div class="dz-card fin-sum"><span class="dz-l">Financial summary · 30 days</span>${(()=>{const f=finStats();return `<dl class="fin-dl"><div><dt>Spent</dt><dd class="num">${rp(f.spent)}</dd></div><div><dt>Paid out to you</dt><dd class="num in">${rp(f.paid)}</dd></div><div><dt>Pending</dt><dd class="num">${rp(f.pend)}</dd></div><div><dt>Net</dt><dd class="num">${f.paid-f.spent<0?'−':'+'}${rp(Math.abs(f.paid-f.spent))}</dd></div></dl>`})()}</div>
  </div>
  <div class="dz-card"><div class="dz-ch"><h2>Latest transactions</h2><button class="lnk" data-go="finance">View all</button></div><div class="dz-txl">${D.tx.slice().sort((a,b)=>b.at<a.at?-1:1).slice(0,4).map(txRow).join('')}</div></div>
  <div class="dz-g2">
   <div class="dz-card"><div class="dz-ch"><h2>Notification center</h2><button class="lnk" data-go="notif">View all</button></div><ul class="dz-nl">${D.notifs.slice(0,4).map(nItem).join('')}</ul></div>
   <div class="dz-card"><div class="dz-ch"><h2>Quick access</h2></div><div class="dz-acc">${[['protection','My Protection','Check-up, review, triage, cover','i-shield','gavel'],['docs','LE-DOCS',`${D.docs.length} documents stored`,'i-doc','vault'],['legacy','Legacy Planning',`${D.ben.length} beneficiaries`,'i-inf','pillars'],['cases','My Cases',`${D.cases.filter(c=>c.st<4).length} active`,'i-track','scale'],['advocate','Find an Advocate','Verified partners, fees upfront','i-user','gavel'],['finance','Finance',`${rp(finStats().spent)} spent this month`,'i-wallet','coins'],['account','Account & Security',v.twofa?'2FA on':'2FA off','i-gear','shield']].map(([k,l,s,ic])=>`<button type="button" class="dz-tile" data-go="${k}"><span class="ti">${IC(ic,20)}</span><b>${l}</b><small>${s}</small></button>`).join('')}</div></div>
  </div>`},
 protection(){return HERO('gavel','My Protection','Help before, during<br>and after a problem','Six tools, from a quick risk check to cover for legal costs.')+`<div class="dz-hub">${[['checkup','Legal Check-up','Risk checklist for your situation','i-book'],['contract','AI Contract Review','Summary and flagged clauses','i-scan'],['triage','Legal Triage','Report and classify an issue','i-route'],['advocate','Find an Advocate','Partner directory and fees','i-user'],['lpp','Legal Protection Plan','Policy, cover and status','i-shield'],['tracker','Case Tracker','Status and required documents','i-track']].map(([k,l,s,ic],i)=>`<button type="button" class="dz-hb" data-go="${k}"><span class="no">0${i+1}</span><span class="ti">${IC(ic,22)}</span><b>${l}</b><small>${s}</small></button>`).join('')}</div>`},
 checkup(){const items=Object.entries(D.sit).filter(([,on])=>on).flatMap(([k])=>SIT[k][1].map((t,i)=>[k+i,t,SIT[k][0]]));const done=items.filter(x=>D.chk[x[0]]).length,risk=items.length?Math.round((1-done/items.length)*100):0;
  return protTabs()+HERO('gavel','Legal Check-up','Your legal risk checklist','Tell us about your situation. We build a checklist of what to secure first.')+`
  <div class="dz-g2 r">
   <div class="dz-card"><h2>Your situation</h2><p class="dz-m">Select everything that applies.</p><div class="dz-sit">${Object.entries(SIT).map(([k,v])=>`<button type="button" data-sit="${k}" aria-pressed="${!!D.sit[k]}">${v[0]}</button>`).join('')}</div>
    <div class="dz-risk"><div class="dz-ring big ${risk>50?'hi':risk>20?'md':'lo'}" style="--p:${100-risk}"><b>${risk}%</b><small>risk</small></div><p><b>${risk>50?'High':risk>20?'Moderate':'Low'} risk</b>${done} of ${items.length} items secured. ${risk>20?'Start with the items at the top of each group.':'Nice work. Review again when your situation changes.'}</p></div></div>
   <div class="dz-card"><h2>Checklist</h2>${items.length?Object.entries(D.sit).filter(([,on])=>on).map(([k])=>`<h4 class="dz-gh">${SIT[k][0]}</h4><ul class="dz-cl">${SIT[k][1].map((t,i)=>`<li class="${D.chk[k+i]?'done':''}"><button type="button" class="tick" data-chk="${k+i}" aria-pressed="${!!D.chk[k+i]}" aria-label="Mark done: ${esc(t)}">${IC('i-check',13)}</button><span>${t}</span></li>`).join('')}</ul>`).join(''):'<p class="dz-m">Select a situation to see your checklist.</p>'}</div>
  </div><p class="note-l">General education, not legal advice.</p>`},
 contract(){const r=D.review;
  return protTabs()+HERO('gavel','AI Contract Review','Know what you sign','Upload a contract. AI summarizes it and flags clauses worth a second look.',`<p class="dz-hero-n">${D.plan==='Basic'?'Included in Plus. Try it free in this preview.':'Included in your plan.'}</p>`)+`
  <div class="dz-card dz-drop" id="crDrop"><input type="file" id="crFile" accept=".pdf,image/*,.doc,.docx" class="sr-only"><label for="crFile" class="dz-up"><span class="ti">${IC('i-up',26)}</span><b>Upload a contract</b><small>PDF, Word or a photo. Work, rental and purchase contracts work best.</small></label><button type="button" class="lnk" data-act="crSample">Use a sample lease</button></div>
  <div id="crOut">${r?crResult(r):''}</div><p class="note-l">The AI only flags clauses for review. It does not give legal advice.</p>`},
 triage(){return protTabs()+HERO('gavel','Legal Triage','Report a legal issue','Answer a few questions. We classify the problem and show your next steps.')+`
  <form class="dz-card dz-form" id="trForm" novalidate>
   <div class="dz-f2"><label>What is it about?<select id="trCat"><option value="">Choose a category</option>${['Employment','Rental / housing','Consumer / online purchase','Family / inheritance','Personal contract','Other'].map(c=>`<option>${c}</option>`).join('')}</select></label>
   <label>When did it start?<input type="date" id="trDate" max="${addDays(0)}"></label></div>
   <label>What happened?<textarea id="trWhat" rows="4" placeholder="Describe the issue in a few sentences."></textarea></label>
   <div class="dz-f2"><label>Amount at stake (optional)<input id="trAmt" inputmode="numeric" placeholder="e.g. 9000000"></label>
   <label>How urgent is it?<select id="trUrg"><option>Low</option><option selected>Medium</option><option>High: a deadline is close</option></select></label></div>
   <fieldset><legend>Documents you have</legend><div class="dz-sit">${['Contract or agreement','Receipts or transfers','Chat or email history','Photos','Letters or notices'].map(d=>`<label class="dz-ck"><input type="checkbox" value="${d}">${d}</label>`).join('')}</div></fieldset>
   <p class="ferr" id="trE"></p><button class="btn lg" type="submit">Submit for triage</button>
  </form><div id="trOut"></div><p class="note-l">Triage routes you to the right help. It is not legal advice.</p>`},
 advocate(){const fs=[...new Set(ADV.map(a=>a[1]))],cities=[...new Set(ADV.map(a=>a[2]))];
  return protTabs()+HERO('scale','Find an Advocate','Verified partner advocates','See each advocate\'s field and fee before you book.',SAMPLE)+`
  <div class="dz-filt"><select id="advF" aria-label="Field"><option value="">All fields</option>${fs.map(f=>`<option>${f}</option>`).join('')}</select><select id="advC" aria-label="City"><option value="">All cities</option>${cities.map(c=>`<option>${c}</option>`).join('')}</select></div>
  <div class="dz-adv" id="advList"></div>
  <p class="note-l">Fees are illustrative and go to the advocate in full. Le-Insure charges a Rp25,000 platform fee per paid consultation.</p>`},
 lpp(){return protTabs()+HERO('shield','Legal Protection Plan','Cover for legal costs','Issued by an OJK-licensed insurance partner, who also decides claims.')+`
  <div class="dz-g2">
   <div class="dz-card lpp-st"><span class="dz-l">Protection status</span><h3>Not active yet</h3><p class="dz-m">Policies open in Phase 2 (2028). Join the waitlist and we will tell you first.</p><div class="lpp-gauge"><i style="width:${D.lppWait?40:12}%"></i></div><p class="dz-m">${D.lppWait?'You are on the waitlist.':'Not on the waitlist.'}</p><button class="btn ${D.lppWait?'ghost':''}" data-act="lppWait">${D.lppWait?'Leave waitlist':'Join the waitlist'}</button></div>
   <div class="dz-card"><h2>Policy information (illustrative)</h2><dl class="dz-dl"><div><dt>Insurer</dt><dd>OJK-licensed partner insurer</dd></div><div><dt>Premium</dt><dd>Rp40,000 / month</dd></div><div><dt>Limit per case</dt><dd>Rp25,000,000</dd></div><div><dt>Limit per year</dt><dd>Rp50,000,000</dd></div><div><dt>Waiting period</dt><dd>90 days</dd></div><div><dt>Own risk</dt><dd>10% of each claim</dd></div></dl></div>
  </div>
  <div class="dz-g2"><div class="dz-card"><h2>Covered disputes</h2><ul class="dz-tl ok">${['Employment','Rental housing','Consumer and digital transactions','Personal contracts'].map(x=>`<li>${IC('i-check',14)}${x}</li>`).join('')}</ul></div>
  <div class="dz-card"><h2>Not covered</h2><ul class="dz-tl no">${['Disputes that began before the policy','Intentional crimes','Claims without reasonable grounds'].map(x=>`<li>${IC('i-plus',14)}${x}</li>`).join('')}</ul></div></div>
  <p class="note-l">Le-Insure does not underwrite insurance. Final terms are set by the insurer.</p>`},
 tracker(){return protTabs()+HERO('scale','Case Tracker','Where each case stands','Status and the documents still needed, at a glance.')+(D.cases.length?D.cases.map(c=>`<div class="dz-card tr-c"><div class="dz-ch"><div><span class="dz-l">${c.id} · ${c.cat}</span><h3>${esc(c.h)}</h3></div><button class="btn sm ghost" data-go="cases" data-case="${c.id}">Open case</button></div>
   <ol class="dz-steps">${CASE_ST.map((s,i)=>`<li class="${i<c.st?'d':i===c.st?'c':''}"><i>${i<c.st?IC('i-check',12):i+1}</i><span>${s}</span></li>`).join('')}</ol>
   <h4 class="dz-gh">Required documents</h4><div class="dz-req">${c.req.map((r,i)=>`<button type="button" class="${r[1]?'ok':''}" data-req="${c.id}|${i}">${IC(r[1]?'i-check':'i-up',14)}${r[0]}</button>`).join('')}</div></div>`).join(''):'<div class="dz-card"><p class="dz-m">No cases yet. Report an issue through Legal Triage to open one.</p><button class="btn" data-go="triage">Report legal issue</button></div>')},
 docs(){const cats=Object.keys(DOCCAT),soon=D.docs.filter(d=>d.e&&(new Date(d.e)-today)/864e5<=90);
  return HERO('vault','LE-DOCS','Your secure document vault','Encrypted storage, organized by category, with reminders before anything expires.',`<p class="dz-hero-n">${D.docs.length} documents · ${D.plan==='Basic'?'1 GB':'20 GB'} plan</p>`)+`
  <div class="dz-cats"><button type="button" class="dz-cat${sub===''?' on':''}" data-dcat=""><span class="ti">${IC('i-doc',20)}</span><b>All documents</b><small>${D.docs.length} files</small></button>${cats.map(k=>`<button type="button" class="dz-cat${sub===k?' on':''}" data-dcat="${k}"><span class="ti">${IC(DOCCAT[k][2],20)}</span><b>${DOCCAT[k][0]}</b><small>${D.docs.filter(d=>d.c===k).length} files · ${DOCCAT[k][1]}</small></button>`).join('')}</div>
  <div class="dz-g2 r">
   <div class="dz-card"><div class="dz-tools"><label class="dz-search">${IC('i-search',18)}<input type="search" id="docQ" placeholder="Search documents" aria-label="Search documents"></label><select id="docCat" aria-label="Category for uploads">${cats.map(k=>`<option value="${k}"${sub===k?' selected':''}>${DOCCAT[k][0]}</option>`).join('')}</select><button type="button" class="btn" data-act="upload">${IC('i-up',18)}Upload</button></div><div class="dz-docs" id="docList"></div></div>
   <div style="display:grid;gap:14px;align-content:start">
    <div class="dz-card"><h2>Expiry reminders</h2><ul class="dz-rem">${soon.length?soon.map(d=>{const n=Math.ceil((new Date(d.e)-today)/864e5);return `<li><span class="dz-days ${n<=30?'hi':'md'}"><b>${n}</b>days</span><span><b>${esc(d.n)}</b><small>${fmtDate(d.e)}</small></span>${tog('rem:'+d.id,d.rem,'Reminder for '+d.n)}</li>`}).join(''):'<li><span class="dz-m">Nothing expires in the next 90 days.</span></li>'}</ul></div>
    <div class="dz-card dz-secure"><span class="ti">${IC('i-lock',22)}</span><div><b>Secure storage</b><small>Files are encrypted and shared only when you choose. Every share has an end date and can be revoked.</small></div></div>
   </div>
  </div>`},
 legacy(){const s=sub||'assets';const T=[['assets','Asset mapping'],['docmap','Document mapping'],['ben','Beneficiaries'],['em','Emergency access'],['notary','Notary referral']];
  return HERO('pillars','Legacy Planning','LE-LEGACY','Organize what you own, where it is and who it is for, so your family can find what matters.')+`
  <div class="dz-warn">${IC('i-inf',20)}<p><b>LE-LEGACY does not make wills.</b> It organizes your information. A will or deed is made through a notary according to the law (Civil Code, Compilation of Islamic Law or customary law).</p></div>
  <div class="dz-tabs" role="tablist">${T.map(([k,l])=>`<button type="button" role="tab" data-lsub="${k}" aria-selected="${s===k}">${l}</button>`).join('')}</div>
  <div class="dz-card">${LEG[s]()}</div>`},
 cases(){const c=D.cases.find(x=>x.id===sub)||D.cases[0];
  return HERO('scale','My Cases','Your legal matters','For cases you are handling with a partner advocate.',SAMPLE)+(c?`
  ${D.cases.length>1?`<div class="dz-tabs">${D.cases.map(x=>`<button type="button" data-case="${x.id}" aria-selected="${x.id===c.id}">${x.id}</button>`).join('')}</div>`:''}
  <div class="dz-case">
   <div class="dz-card"><dl class="dz-dl"><div><dt>Case ID</dt><dd class="num">${c.id}</dd></div><div><dt>Category</dt><dd>${c.cat}</dd></div><div><dt>Submitted</dt><dd>${fmtDate(c.sub)}</dd></div><div><dt>Status</dt><dd>${chip(c.st===4?true:null,CASE_ST[c.st])}</dd></div><div><dt>Assigned advocate</dt><dd>${c.adv?esc(c.adv):'Not assigned yet'}</dd></div><div><dt>Urgency</dt><dd>${c.urg}</dd></div></dl>
    <h3 style="margin-top:18px">${esc(c.h)}</h3>
    <ol class="dz-steps">${CASE_ST.map((s,i)=>`<li class="${i<c.st?'d':i===c.st?'c':''}"><i>${i<c.st?IC('i-check',12):i+1}</i><span>${s}</span></li>`).join('')}</ol></div>
   <div class="dz-g2">
    <div class="dz-card"><h2>Required documents</h2><div class="dz-req stack">${c.req.map((r,i)=>`<button type="button" class="${r[1]?'ok':''}" data-req="${c.id}|${i}">${IC(r[1]?'i-check':'i-up',14)}<span>${r[0]}<small>${r[1]?'Received':'Tap to upload'}</small></span></button>`).join('')}</div></div>
    <div class="dz-card"><h2>Next steps</h2><ol class="dz-next">${c.next.map(n=>`<li>${esc(n)}</li>`).join('')}</ol></div>
   </div>
   <div class="dz-card"><h2>Case history</h2><ul class="dz-hist">${c.hist.slice().reverse().map(h=>`<li><time>${fmtDate(h[0])}</time><span>${esc(h[1])}</span></li>`).join('')}</ul></div>
  </div>`:'<div class="dz-card"><p class="dz-m">You have no cases. Report an issue through Legal Triage to open one.</p><button class="btn" data-go="triage">Report legal issue</button></div>')},
 notif(){const f=sub;const list=D.notifs.filter(n=>!f||n.t===f);
  return HERO('bell','Notifications','What needs your attention','Reminders, case updates and security alerts in one place.')+`
  <div class="dz-ntb"><div class="dz-tabs"><button type="button" data-nf="" aria-selected="${!f}">All</button>${Object.entries(NTYPE).map(([k,v])=>`<button type="button" data-nf="${k}" aria-selected="${f===k}">${v[0]}</button>`).join('')}</div><button class="lnk" data-act="readAll">Mark all as read</button></div>
  <div class="dz-g2 r"><div class="dz-card"><ul class="dz-nl big">${list.length?list.map(nItem).join(''):'<li class="dz-m">No notifications here.</li>'}</ul></div>
  <div class="dz-card"><h2>Notify me about</h2><ul class="dz-set">${Object.entries(NTYPE).map(([k,v])=>`<li><span>${IC(v[1],18)}${v[0]}</span>${tog('n:'+k,D.nset[k],v[0])}</li>`).join('')}</ul></div></div>`},
 finance(){const f=finStats(),flt=sub||'all',list=D.tx.slice().sort((a,b)=>b.at<a.at?-1:1).filter(t=>flt==='all'||(flt==='in'?t.a>0:t.a<0));
  return HERO('coins','Finance','Your legal money, in one view','Budget, payouts and every transaction, from advocate fees to refunds.',SAMPLE)+`
  <div class="dz-kpi">${[['Spent · 30 days',rp(f.spent),'i-out',''],['Budget left',rp(f.left),'i-wallet',''],['Paid out to you',rp(f.paid),'i-in','in'],['Pending payouts',rp(f.pend),'i-clock','']].map(([l,v,ic,c])=>`<div class="dz-card"><span class="ti ${c}">${IC(ic,18)}</span><span class="dz-l">${l}</span><b class="num">${v}</b></div>`).join('')}</div>
  <div class="dz-g2">${budgetCard(true)}${payoutCard(true)}</div>
  <div class="dz-card"><div class="dz-ch"><h2>Transactions</h2><button class="lnk" data-act="stmt">Download statement</button></div>
   <div class="dz-tabs" style="margin-bottom:12px">${[['all','All'],['out','Payments'],['in','Payouts & refunds']].map(([k,l])=>`<button type="button" data-ftx="${k}" aria-selected="${flt===k}">${l}</button>`).join('')}</div>
   <div class="dz-txl">${list.map(txRow).join('')||'<p class="dz-m">No transactions.</p>'}</div></div>
  <p class="note-l">Payments go through licensed payment partners. Advocate and notary fees go to them in full.</p>`},
 feedback(){const r=D.fbR||0;
  return HERO('chat','Feedback','Help us make Le-Insure better','Tell us what works and what does not. We read every message.')+`
  <div class="dz-g2 r">
   <form class="dz-card dz-form" id="fbForm" novalidate><h2>Share your feedback</h2>
    <div><span class="dz-l" style="margin-bottom:8px">How was your experience?</span><div class="dz-stars" role="group" aria-label="Rating">${[1,2,3,4,5].map(n=>`<button type="button" data-star="${n}" aria-pressed="${n<=r}" aria-label="${n} star${n>1?'s':''}">${IC('i-star',26)}</button>`).join('')}<span class="dz-m" id="fbRl">${['Tap a star','Poor','Fair','Good','Great','Excellent'][r]}</span></div></div>
    <label>Topic<select id="fbT">${['App experience','Advocate consultation','Documents','Legacy planning','Billing and payouts','Other'].map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label>Your message<textarea id="fbM" rows="4" placeholder="What should we keep, fix or add?"></textarea></label>
    <label class="dz-ck" style="justify-self:start"><input type="checkbox" id="fbC" checked>You can contact me about this</label>
    <p class="ferr" id="fbE"></p><button class="btn" type="submit">Send feedback</button></form>
   <div class="dz-card"><h2>Your feedback</h2><div class="dz-rows">${D.fb.length?D.fb.map(f=>`<div class="dz-row fb"><span class="fb-r">${IC('i-star',14)}${f.r}</span><span><b>${esc(f.topic)}</b><small>${fmtDate(f.at)} · ${esc(f.m.length>70?f.m.slice(0,67)+'…':f.m)}</small></span>${chip(f.st==='Reviewed'?true:null,f.st)}</div>`).join(''):'<p class="dz-m">Nothing sent yet.</p>'}</div></div>
  </div>`},
 account(){const s=sub||'profile';
  return HERO('shield','Account & Security','Your account, protected','Profile, sign-in security and privacy controls.')+`
  <div class="dz-tabs" role="tablist">${[['profile','Profile'],['security','Security'],['privacy','Privacy']].map(([k,l])=>`<button type="button" role="tab" data-asub="${k}" aria-selected="${s===k}">${l}</button>`).join('')}</div>${ACC[s]()}`}
};

function finStats(){const m30=D.tx.filter(t=>(today-new Date(t.at))/864e5<=30);const spent=-m30.filter(t=>t.a<0).reduce((a,t)=>a+t.a,0);const paid=D.tx.filter(t=>t.a>0&&t.st==='Paid out').reduce((a,t)=>a+t.a,0);const pend=D.tx.filter(t=>t.a>0&&t.st==='Pending').reduce((a,t)=>a+t.a,0);
  const cats={};m30.filter(t=>t.a<0).forEach(t=>cats[t.c]=(cats[t.c]||0)-t.a);return{spent,paid,pend,left:Math.max(0,D.budget-spent),pct:Math.min(100,Math.round(spent/D.budget*100)),cats}}
function txRow(t){const inn=t.a>0;return `<div class="dz-tx"><span class="ti ${inn?'in':''}">${IC(inn?'i-in':'i-out',16)}</span><span><b>${esc(t.n)}</b><small>${fmtDate(t.at)} · ${esc(t.c)}</small></span>${chip(t.st==='Pending'?null:true,t.st)}<span class="num amt ${inn?'in':''}">${inn?'+':'−'}${rp(Math.abs(t.a))}</span></div>`}
function budgetCard(full){const f=finStats();return `<div class="dz-card fin-bud"><div class="dz-ch"><div><span class="dz-l">Budget this month</span><h3><span class="num">${rp(f.spent)}</span> <small class="dz-m">of ${rp(D.budget)}</small></h3></div>${full?'':'<button class="lnk" data-go="finance">Details</button>'}</div>
  <div class="fin-meter"><i style="width:${f.pct}%"></i></div><p class="dz-m">${f.pct>=90?'You are close to your legal budget.':`${rp(f.left)} left for legal costs this month.`}</p>
  ${full?`<div class="fin-cats">${Object.entries(f.cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div><span>${esc(c)}</span><span class="fin-cbar"><i style="width:${Math.round(v/f.spent*100)}%"></i></span><b class="num">${rp(v)}</b></div>`).join('')}</div>
  <form class="dz-inl" id="budForm"><input id="budIn" inputmode="numeric" placeholder="Monthly budget, e.g. 1000000" aria-label="Monthly budget"><button class="btn" type="submit">Set budget</button></form>`:''}</div>`}
function payoutCard(full){const f=finStats(),outs=D.tx.filter(t=>t.a>0);return `<div class="dz-card fin-pay"><div class="dz-ch"><div><span class="dz-l">Payout snapshot</span><h3 class="num">${rp(f.paid)}</h3><p class="dz-m">received to ${esc(D.payMethod)}</p></div>${full?'':'<button class="lnk" data-go="finance">Details</button>'}</div>
  <div class="fin-pills"><div><small>Pending</small><b class="num">${rp(f.pend)}</b></div><div><small>Next payout</small><b>${f.pend?fmtDate(addDays(3)):'—'}</b></div></div>
  ${full?`<div class="dz-rows">${outs.map(txRow).join('')}</div><p class="mhint" style="margin-top:10px">Claim payouts from the Legal Protection Plan arrive here once policies open in Phase 2 (2028).</p>`:''}</div>`}
function protTabs(){return `<div class="dz-tabs pt">${PROT.map(k=>`<button type="button" data-go="${k}" aria-selected="${tab===k}">${{checkup:'Check-up',contract:'Contract review',triage:'Triage',advocate:'Advocates',lpp:'Protection Plan',tracker:'Case Tracker'}[k]}</button>`).join('')}</div>`}
function nItem(n){const t=NTYPE[n.t];return `<li class="${n.r?'':'un'}"><button type="button" data-nread="${n.id}"><span class="ni">${IC(t[1],18)}</span><span><b>${esc(n.h)}</b><small>${esc(n.b)}</small><em>${t[0]} · ${fmtDate(n.at)}</em></span></button></li>`}
function crResult(r){return `<div class="dz-card cr"><div class="dz-ch"><div><span class="dz-l">${esc(r.file)}</span><h2>Summary</h2></div>${SAMPLE}</div>
  <dl class="dz-dl"><div><dt>Type</dt><dd>Residential lease</dd></div><div><dt>Term</dt><dd>12 months</dd></div><div><dt>Rent</dt><dd>Rp4,500,000 / month</dd></div><div><dt>Deposit</dt><dd>2 months' rent</dd></div></dl>
  <h4 class="dz-gh">Flagged clauses</h4><div class="cr-flags">${[['high','Clause 7.2','Deposit can be withheld "for any reason"','Ask for a list of deductions and a return deadline, such as 14 days after move-out.'],['med','Clause 3.4','Renews automatically unless you give notice 60 days before the end','Put a calendar reminder or ask for 30 days.'],['med','Clause 9.1','Early exit costs 3 months of rent','Check if this applies after a job transfer or other valid reason.'],['low','Clause 5.3','Tenant pays repairs under Rp500,000','Common, but agree what counts as normal wear.']].map(f=>`<div class="cr-f ${f[0]}"><span class="sv">${{high:'High',med:'Medium',low:'Low'}[f[0]]}</span><b>${f[1]}: ${f[2]}</b><small>${f[3]}</small></div>`).join('')}</div>
  <div class="dz-acts"><button class="btn" data-go="advocate">Ask a partner advocate</button><button class="btn ghost" data-act="crSave">Save to LE-DOCS</button></div></div>`}
const LEG={
 assets:()=>`<h2>Asset mapping</h2><p class="dz-m">List what you own and where the proof is kept.</p><div class="dz-rows">${D.assets.map((a,i)=>`<div class="dz-row"><span class="ti">${IC(a[1]==='Property'?'i-pin':a[1]==='Vehicle'?'i-key':'i-doc',18)}</span><span><b>${esc(a[0])}</b><small>${esc(a[1])} · ${esc(a[2])}</small></span><button class="lnk" data-del="assets|${i}">Remove</button></div>`).join('')}</div>
  <form class="dz-inl" data-add="assets"><input placeholder="Asset, e.g. Land in Bogor" aria-label="Asset"><select aria-label="Type"><option>Property</option><option>Bank account</option><option>Vehicle</option><option>Investment</option><option>Valuables</option></select><input placeholder="Where is the proof?" aria-label="Where the proof is kept"><button class="btn" type="submit">Add</button></form>`,
 docmap:()=>`<h2>Document mapping</h2><p class="dz-m">Where each original is kept, and whether a copy is in LE-DOCS.</p><div class="dz-rows">${D.docmap.map((d,i)=>`<div class="dz-row"><span class="ti">${IC('i-pin',18)}</span><span><b>${esc(d[0])}</b><small>${esc(d[1])}</small></span>${chip(d[2],d[2]?'In LE-DOCS':'Not scanned')}<button class="lnk" data-del="docmap|${i}">Remove</button></div>`).join('')}</div>
  <form class="dz-inl" data-add="docmap"><input placeholder="Document" aria-label="Document"><input placeholder="Where is the original?" aria-label="Location"><button class="btn" type="submit">Add</button></form>`,
 ben:()=>`<h2>Beneficiary information</h2><p class="dz-m">People you want your plan to reach.</p><div class="dz-rows">${D.ben.map((b,i)=>`<div class="dz-row"><span class="dz-av sm">${initials(b[0])}</span><span><b>${esc(b[0])}</b><small>${esc(b[1])}</small></span><span class="dz-share">${esc(b[2])}</span><button class="lnk" data-del="ben|${i}">Remove</button></div>`).join('')}</div>
  <form class="dz-inl" data-add="ben"><input placeholder="Full name" aria-label="Full name"><input placeholder="Relationship" aria-label="Relationship"><input placeholder="Share, e.g. 50%" aria-label="Share"><button class="btn" type="submit">Add</button></form><p class="mhint" style="margin-top:10px">Shares here are your wishes. Legal distribution follows your will and the applicable inheritance law.</p>`,
 em:()=>`<h2>Emergency access</h2><p class="dz-m">Choose who can open your vault if something happens to you.</p><div class="dz-rows"><div class="dz-row"><span class="dz-av sm">${initials(D.em.who)}</span><span><b>${esc(D.em.who)}</b><small>Trusted person · identity check required</small></span>${tog('em',D.em.on,'Emergency access')}</div></div>
  <div class="dz-f2" style="margin-top:14px"><label>Trusted person<select id="emWho">${D.ben.map(b=>`<option${b[0]===D.em.who?' selected':''}>${esc(b[0])}</option>`).join('')}</select></label><label>Waiting period<select id="emWait">${['3 days','7 days','14 days','30 days'].map(w=>`<option${w===D.em.wait?' selected':''}>${w}</option>`).join('')}</select></label></div>
  <p class="mhint" style="margin-top:10px">After a request, you get ${D.em.wait} to cancel it before access opens. They see only what you mark as shareable.</p>`,
 notary:()=>`<h2>Notary referral</h2><p class="dz-m">When you are ready to make a will or deed, book a partner notary with your file prepared.</p><div class="dz-rows">${NOT.map((n,i)=>`<div class="dz-row"><span class="ti">${IC('i-scale',18)}</span><span><b>${n[0]}</b><small>${n[1]} · partner notary</small></span><button class="btn sm" data-act="notary" data-i="${i}">Request referral</button></div>`).join('')}</div><p class="mhint" style="margin-top:10px">Sample notaries. The notary's fee is paid directly to the notary.</p>`};
const ACC={
 profile:()=>{const v=V();return `<div class="dz-g2"><form class="dz-card dz-form" id="pfForm" novalidate><h2>Personal information</h2><label>Full name<input id="pfName" value="${esc(user.name)}" autocomplete="name"></label><label>Date of birth<input id="pfDob" type="date" value="${esc(user.dob||'')}"></label><label>Address<input id="pfAddr" value="${esc(user.addr||'')}" placeholder="Street, city"></label><p class="ferr" id="pfE"></p><button class="btn" type="submit">Save changes</button></form>
  <div style="display:grid;gap:14px;align-content:start"><div class="dz-card"><h2>Email and phone</h2><div class="dz-rows"><div class="dz-row"><span class="ti">${IC('i-mail',18)}</span><span><b>${esc(user.email)}</b><small>Email</small></span>${chip(true,'Verified')}</div><div class="dz-row"><span class="ti">${IC('i-phone',18)}</span><span><b>${user.phone?'+62 '+esc(user.phone):'No phone yet'}</b><small>Phone</small></span>${chip(user.phone&&v.contact==='sms'?true:user.phone?null:false,user.phone&&v.contact==='sms'?'Verified':user.phone?'Not verified':'Missing')}</div></div></div>
  <div class="dz-card"><h2>Identity verification</h2><div class="dz-row" style="margin-top:6px"><span class="ti">${IC('i-id',18)}</span><span><b>e-KYC</b><small>${v.kyc?'KTP and face check passed':'Needed for advocates, the Protection Plan and LE-LEGACY'}</small></span>${v.kyc?chip(true,'Verified'):'<button class="btn sm" data-act="kyc">Verify now</button>'}</div></div></div></div>`},
 security:()=>{const v=V();return `<div class="dz-g2"><form class="dz-card dz-form" id="pwForm" novalidate><h2>Change password</h2><label>Current password<input type="password" id="pw0" autocomplete="current-password"></label><label>New password<input type="password" id="pw1" autocomplete="new-password"></label><label>Confirm new password<input type="password" id="pw2" autocomplete="new-password"></label><p class="ferr" id="pwE"></p><button class="btn" type="submit">Update password</button></form>
  <div class="dz-card"><h2>Two-factor authentication</h2><div class="dz-row" style="margin:6px 0 12px"><span class="ti">${IC(v.twofa==='passkey'?'i-finger':'i-key',18)}</span><span><b>${v.twofa?'Enabled':'Disabled'}</b><small>${v.twofa==='passkey'?'Passkey on this device':v.twofa==='app'?'Authenticator app':'Add a second step at sign-in'}</small></span>${chip(!!v.twofa,v.twofa?'On':'Off')}</div>
   ${v.twofa?'<button class="btn ghost" data-act="2faOff">Turn off 2FA</button>':'<div class="dz-acts"><button class="btn" data-act="2fa" data-m="passkey">Set up passkey</button><button class="btn ghost" data-act="2fa" data-m="app">Use authenticator app</button></div>'}</div></div>
  <div class="dz-g2"><div class="dz-card"><div class="dz-ch"><h2>Active devices</h2><button class="lnk" data-act="outOthers">Log out other devices</button></div><div class="dz-rows">${D.devices.map((d,i)=>`<div class="dz-row"><span class="ti">${IC('i-device',18)}</span><span><b>${esc(d[0])}</b><small>${esc(d[1])}</small></span>${d[2]?chip(true,'This device'):`<button class="lnk" data-act="outDev" data-i="${i}">Log out</button>`}</div>`).join('')}</div></div>
  <div class="dz-card"><h2>Login history</h2><div class="dz-rows">${D.logins.map(l=>`<div class="dz-row"><span class="ti">${IC('i-clock',18)}</span><span><b>${esc(l[1])}</b><small>${fmtDate(l[0])} · ${esc(l[2])}</small></span>${chip(l[3]==='Success',l[3]==='Success'?'Success':'Blocked')}</div>`).join('')}</div></div></div>`},
 privacy:()=>{const sh=D.docs.flatMap(d=>d.sh.map((s,j)=>[d,s,j]));return `<div class="dz-g2"><div class="dz-card"><h2>Data access permissions</h2><ul class="dz-set">${[['advocate','Partner advocates can see documents you share in a case'],['notary','Partner notaries can see your legacy file when you request a referral'],['analytics','Anonymous usage data to improve Le-Insure'],['marketing','News and offers by email']].map(([k,l])=>`<li><span>${l}</span>${tog('p:'+k,D.priv[k],l)}</li>`).join('')}</ul></div>
  <div class="dz-card"><h2>Document sharing permissions</h2><div class="dz-rows">${sh.length?sh.map(([d,s,j])=>`<div class="dz-row"><span class="ti">${IC('i-share',18)}</span><span><b>${esc(d.n)}</b><small>${esc(s[0])} · ${esc(s[1])}</small></span><button class="lnk" data-act="revoke" data-i="${d.id}|${j}">Revoke</button></div>`).join(''):'<p class="dz-m">You are not sharing any documents.</p>'}</div></div></div>
  <div class="dz-g2"><div class="dz-card"><h2>Privacy consent and data requests</h2><p class="dz-m">You agreed to the Privacy Policy on ${fmtDate(user.since)}. Under Indonesia's Personal Data Protection Law you can request a copy or correction of your data.</p><div class="dz-acts"><button class="btn ghost" data-legal="privacy">Read Privacy Policy</button><button class="btn ghost" data-act="dataCopy">Download my data</button><button class="btn ghost" data-act="dataFix">Request a correction</button></div></div>
  <div class="dz-card dz-danger"><h2>Delete account</h2><p class="dz-m">This removes your account, documents and legacy plan. It cannot be undone.</p><button class="btn" data-act="delAcc">Delete my account</button></div></div>`}};

function drawDocs(){const el=$('#docList');if(!el)return;const q=($('#docQ').value||'').toLowerCase();
  const rows=D.docs.filter(d=>(!sub||d.c===sub)&&(!q||d.n.toLowerCase().includes(q)||DOCCAT[d.c][0].toLowerCase().includes(q)));
  el.innerHTML=rows.length?rows.map(d=>{const n=d.e?Math.ceil((new Date(d.e)-today)/864e5):null;return `<div class="dz-doc"><span class="ti">${IC(DOCCAT[d.c][2],18)}</span><span><b>${esc(d.n)}</b><small>${DOCCAT[d.c][0]} · ${d.s}${d.sh.length?` · shared with ${d.sh.length}`:''}</small></span>${n===null?chip('info','No expiry'):n<0?chip(false,'Expired'):n<=60?chip(false,`${n} days left`):chip(true,'Valid')}<span class="dz-da"><button type="button" class="ib" data-act="dl" data-i="${d.id}" aria-label="Download ${esc(d.n)}">${IC('i-down',17)}</button><button type="button" class="ib" data-act="share" data-i="${d.id}" aria-label="Share ${esc(d.n)}">${IC('i-share',17)}</button><button type="button" class="ib" data-act="deldoc" data-i="${d.id}" aria-label="Remove ${esc(d.n)}">${IC('i-plus',17)}</button></span></div>`}).join(''):`<p class="dz-m">No documents match.</p>`}
function drawAdv(){const f=$('#advF').value,c=$('#advC').value;$('#advList').innerHTML=ADV.filter(a=>(!f||a[1]===f)&&(!c||a[2]===c)).map((a,i)=>`<div class="dz-card adv"><span class="dz-av">${initials(a[0].replace('Adv. ',''))}</span><div><b>${a[0]}</b><small>${a[1]} · ${a[2]} · ${a[4]} years</small><p>${chip(true,'Verified partner')}</p></div><div class="adv-f"><span class="num">${rp(a[3])}</span><small>per 60-min consultation</small><button class="btn sm" data-act="book" data-i="${ADV.indexOf(a)}">Book</button></div></div>`).join('')||'<p class="dz-m">No advocates match these filters.</p>'}
function notify(t,h,b){D.notifs.unshift({id:Date.now(),t,h,b,at:addDays(0),r:false})}
function renderDash(){
  if(!user)return;drawNav();
  const el=$('#dash');el.innerHTML=`<div class="tabpanel" data-tab="${tab}">${(TABS[tab]||TABS.home)()}</div>`;
  if(tab==='docs'){drawDocs();$('#docQ').addEventListener('input',drawDocs)}
  if(tab==='advocate'){drawAdv();$('#advF').onchange=$('#advC').onchange=drawAdv}
  if(tab==='contract'){$('#crFile').addEventListener('change',e=>{const f=e.target.files[0];if(f)runReview(f.name)})}
  if(tab==='triage')$('#trForm').addEventListener('submit',submitTriage);
  if(tab==='finance')$('#budForm').addEventListener('submit',e=>{e.preventDefault();const v=+$('#budIn').value.replace(/\D/g,'');if(v<50000){toast('Enter a budget of at least Rp50,000.');return}D.budget=v;saveD();renderDash();toast('Budget updated.')});
  if(tab==='feedback')$('#fbForm').addEventListener('submit',e=>{e.preventDefault();const m=$('#fbM').value.trim();const er=!D.fbR?'Choose a star rating.':m.length<5?'Write a short message.':'';$('#fbE').textContent=er;if(er)return;D.fb.unshift({id:Date.now(),at:addDays(0),r:D.fbR,topic:$('#fbT').value,m,st:'Received'});D.fbR=0;saveD();renderDash();toast('Thank you. Your feedback was sent.')});
  if(tab==='legacy'&&(sub||'assets')==='em'){$('#emWho').onchange=e=>{D.em.who=e.target.value;saveD();renderDash()};$('#emWait').onchange=e=>{D.em.wait=e.target.value;saveD();renderDash()}}
  $$('form.dz-inl',el).forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const k=f.dataset.add,v=$$('input,select',f).map(i=>i.value.trim());if(!v[0]){$$('input',f)[0].focus();toast('Fill in the first field.');return}
    if(k==='docmap')D.docmap.push([v[0],v[1]||'Location not set',false]);else if(k==='ben')D.ben.push([v[0],v[1]||'Beneficiary',v[2]||'—']);else D.assets.push([v[0],v[1],v[2]||'Location not set']);saveD();renderDash();toast('Added.')}));
  if(tab==='account'){const s=sub||'profile';
    if(s==='profile')$('#pfForm').addEventListener('submit',e=>{e.preventDefault();const n=$('#pfName').value.trim();if(n.length<2){ferr('pf','Enter your full name.');return}ferr('pf','');user.name=n;user.dob=$('#pfDob').value;user.addr=$('#pfAddr').value.trim();store.set('li-user',user);syncNav();drawNav();toast('Profile saved.')});
    if(s==='security')$('#pwForm').addEventListener('submit',e=>{e.preventDefault();const a=$('#pw0').value,b=$('#pw1').value,c=$('#pw2').value;const m=!a?'Enter your current password.':b.length<8?'Use at least 8 characters.':b!==c?'New passwords do not match.':'';ferr('pw',m);if(m)return;e.target.reset();notify('security','Password changed','If this wasn\'t you, contact support right away.');saveD();toast('Password updated.')});}
  if(window.gsap&&!RM)gsap.from('#dash .dz-hero,#dash .dz-card,#dash .dz-qb,#dash .dz-hb,#dash .dz-cat',{y:18,opacity:0,duration:.6,ease:'power3.out',stagger:.035,clearProps:'transform,opacity'});
}
function dzGo(t,s=''){tab=t;sub=s;renderDash();if(lenis)lenis.scrollTo(0,{immediate:true});else scrollTo(0,0)}
function runReview(name){const o=$('#crOut');o.innerHTML=`<div class="dz-card cr-run"><div class="scan" id="crScan">${IC('i-scan',30)}</div><p><b>Reading ${esc(name)}</b><span id="crTip">Finding the parties and dates…</span></p></div>`;
  const tips=['Finding the parties and dates…','Checking deposit and payment terms…','Looking for renewal and exit clauses…','Writing your summary…'];
  runScan($('#crScan'),2400,p=>{const t=$('#crTip');if(t)t.textContent=tips[Math.min(3,Math.floor(p*4))]},()=>{D.review={file:name};saveD();o.innerHTML=crResult(D.review)})}
function submitTriage(e){e.preventDefault();const cat=$('#trCat').value,what=$('#trWhat').value.trim(),urg=$('#trUrg').value.split(':')[0];
  const m=!cat?'Choose a category.':what.length<15?'Describe what happened in a bit more detail.':'';$('#trE').textContent=m;if(m)return;
  const docs=$$('#trForm input[type=checkbox]:checked').map(i=>i.value);const id='LI-2026-0'+(143+D.cases.length);
  const adv=ADV.find(a=>a[1].toLowerCase().startsWith(cat.split(' ')[0].toLowerCase().slice(0,5)))||ADV[0];
  D.cases.unshift({id,cat,h:what.length>60?what.slice(0,57)+'…':what,sub:addDays(0),st:0,adv:null,urg,req:(docs.length?docs:['Contract or agreement']).map(d=>[d,false]).concat([['ID card (from LE-DOCS)',true]]),next:['A Le-Insure reviewer checks your report within 1 working day',`Book a partner advocate, for example ${adv[0]}`],hist:[[addDays(0),'Issue reported through Legal Triage'],[addDays(0),`Classified as ${cat}, ${urg.toLowerCase()} urgency`]]});
  notify('case',`Case ${id} submitted`,'We will review it within 1 working day.');saveD();
  $('#trOut').innerHTML=`<div class="dz-card tr-res"><span class="dz-l">Triage result</span><h2>${esc(cat)} · ${esc(urg)} urgency</h2><p class="dz-m">Your report is saved as case <b>${id}</b>. Suggested next step: talk to a partner advocate who handles ${esc(adv[1].toLowerCase())}.</p><div class="dz-acts"><button class="btn" data-go="advocate">Find an advocate</button><button class="btn ghost" data-go="cases" data-case="${id}">Open case</button></div></div>`;
  $('#trForm').reset();drawNav();toast(`Case ${id} created.`)}
function dz2fa(m){if(m==='passkey'){openModal(`<div class="mh"><h3 id="mTitle">Create a passkey</h3>${X}</div><div class="m2fa"><p class="note" style="font-size:14.5px">Confirm with Face ID, fingerprint or your device PIN.</p><div class="scan" id="dzSc">${IC('i-finger',34)}</div><button class="btn" id="dzGo">Create passkey</button></div>`);$('#dzGo').onclick=e=>{e.target.disabled=true;runScan($('#dzSc'),1400,null,()=>{setV({twofa:'passkey'});closeModal();renderDash();toast('Passkey created. 2FA is on.')})}}
  else{openModal(`<div class="mh"><h3 id="mTitle">Link an authenticator app</h3>${X}</div><div class="m2fa"><div class="qa" style="width:100%"><div class="qr">${fakeQR(Math.floor(Math.random()*1e6))}</div><p>Scan the code, then enter the 6 digits from your app.</p></div>${otpHTML('dzOtp')}<p class="pvcode">Preview: any 6 digits work here.</p><button class="btn" id="dzGo">Turn on 2FA</button></div>`);const o=wireOtp($('#dzOtp'),ok);function ok(v){if(v.length<6){toast('Enter all 6 digits.');return}setV({twofa:'app'});closeModal();renderDash();toast('Authenticator linked. 2FA is on.')}$('#dzGo').onclick=()=>ok(o.val())}}
$('#dzNav').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;dzGo(b.dataset.go,b.dataset.sub||'')});
$('#dzMob').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)dzGo(b.dataset.go)});
$('#dash').addEventListener('click',e=>{const t=e.target;
  const g=t.closest('[data-go]');if(g){dzGo(g.dataset.go,g.dataset.case||g.dataset.sub||'');return}
  const tg=t.closest('[data-tog]');if(tg){const k=tg.dataset.tog,on=tg.getAttribute('aria-checked')!=='true';tg.setAttribute('aria-checked',on);
    if(k==='em')D.em.on=on;else if(k.startsWith('rem:')){const d=D.docs.find(x=>x.id===+k.slice(4));d.rem=on}else if(k.startsWith('n:'))D.nset[k.slice(2)]=on;else if(k.startsWith('p:'))D.priv[k.slice(2)]=on;saveD();return}
  const pl=t.closest('[data-plan]');if(pl){D.plan=pl.dataset.plan;saveD();renderDash();toast(`Previewing Le-Insure ${D.plan}.`);return}
  const si=t.closest('[data-sit]');if(si){D.sit[si.dataset.sit]=!D.sit[si.dataset.sit];saveD();renderDash();return}
  const ck=t.closest('[data-chk]');if(ck){D.chk[ck.dataset.chk]=!D.chk[ck.dataset.chk];saveD();renderDash();return}
  const dc=t.closest('[data-dcat]');if(dc){sub=dc.dataset.dcat;renderDash();return}
  const ls=t.closest('[data-lsub]');if(ls){sub=ls.dataset.lsub;renderDash();return}
  const as=t.closest('[data-asub]');if(as){sub=as.dataset.asub;renderDash();drawNav();return}
  const fx=t.closest('[data-ftx]');if(fx){sub=fx.dataset.ftx;renderDash();return}
  const sr=t.closest('[data-star]');if(sr){D.fbR=+sr.dataset.star;$$('[data-star]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.star<=D.fbR));$('#fbRl').textContent=['Tap a star','Poor','Fair','Good','Great','Excellent'][D.fbR];return}
  const nf=t.closest('[data-nf]');if(nf){sub=nf.dataset.nf;renderDash();return}
  const cs=t.closest('[data-case]');if(cs){sub=cs.dataset.case;renderDash();return}
  const nr=t.closest('[data-nread]');if(nr){const n=D.notifs.find(x=>x.id===+nr.dataset.nread);n.r=true;saveD();const map={contract:'docs',doc:'docs',case:'cases',appt:'cases',policy:'lpp',security:'account'};dzGo(map[n.t],n.t==='security'?'security':'');return}
  const rq=t.closest('[data-req]');if(rq){const [cid,i]=rq.dataset.req.split('|');const c=D.cases.find(x=>x.id===cid);const r=c.req[+i];if(!r[1]){r[1]=true;c.hist.push([addDays(0),`${r[0]} uploaded`]);D.docs.unshift({id:Date.now(),n:r[0],c:'contracts',e:null,s:'0.5 MB',sh:[[c.adv||'Le-Insure reviewer','Until case closes']],rem:false});saveD();renderDash();toast(`${r[0]} added to the case and LE-DOCS.`)}return}
  const dl=t.closest('[data-del]');if(dl){const [k,i]=dl.dataset.del.split('|');D[k].splice(+i,1);saveD();renderDash();return}
  const a=t.closest('[data-act]');if(!a)return;const act=a.dataset.act,i=a.dataset.i;
  if(act==='upload'){if(tab!=='docs'){dzGo('docs');setTimeout(()=>$('#dzFile').click(),60)}else $('#dzFile').click()}
  else if(act==='crSample')runReview('Sample apartment lease.pdf');
  else if(act==='crSave'){D.docs.unshift({id:Date.now(),n:D.review.file,c:'contracts',e:addDays(365),s:'0.8 MB',sh:[],rem:true});saveD();toast('Saved to LE-DOCS under Contracts.')}
  else if(act==='lppWait'){D.lppWait=!D.lppWait;if(D.lppWait)notify('policy','You joined the Legal Protection Plan waitlist','We will tell you when policies open in 2028.');saveD();renderDash()}
  else if(act==='readAll'){D.notifs.forEach(n=>n.r=true);saveD();renderDash()}
  else if(act==='book'){const v=ADV[+i];openModal(`<div class="mh"><h3 id="mTitle">Book ${esc(v[0])}</h3>${X}</div><p class="note" style="font-size:14.5px">${v[1]} · ${rp(v[3])} advocate fee + Rp25,000 platform fee</p><div class="dz-slots">${[1,2,3].flatMap(d=>['10:00','14:00'].map(h=>`<button type="button" data-slot="${fmtDate(addDays(d))} ${h}">${fmtDate(addDays(d))}<b>${h}</b></button>`)).join('')}</div><p class="mhint">Preview: no payment is taken.</p>`);
    $$('[data-slot]',modal).forEach(b=>b.onclick=()=>{notify('appt','Consultation confirmed',`${v[0]} on ${b.dataset.slot}. You'll get a video link by email.`);saveD();closeModal();drawNav();toast('Consultation booked.')})}
  else if(act==='dl'){const d=D.docs.find(x=>x.id===+i);try{const u=URL.createObjectURL(new Blob([`Le-Insure preview\n\n${d.n}\nThis is a placeholder file. In the live app your original file downloads here.`],{type:'text/plain'}));const l=document.createElement('a');l.href=u;l.download=d.n.replace(/[^\w.-]+/g,'_')+'.txt';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(err){}toast(`Downloading ${d.n}.`)}
  else if(act==='share'){const d=D.docs.find(x=>x.id===+i);openModal(`<div class="mh"><h3 id="mTitle">Share ${esc(d.n)}</h3>${X}</div><form class="dz-form" id="shF"><label>Share with<select id="shW"><option>Adv. Rina Kusuma, S.H.</option><option>Notaris Hendra Gunawan, S.H., M.Kn.</option>${D.ben.map(b=>`<option>${esc(b[0])}</option>`).join('')}</select></label><label>Access ends<select id="shU"><option>In 7 days</option><option>In 30 days</option><option>Until case closes</option></select></label><button class="btn" type="submit">Share securely</button></form>`);
    $('#shF').onsubmit=ev=>{ev.preventDefault();d.sh.push([$('#shW').value,$('#shU').value]);saveD();closeModal();drawDocs();toast('Shared. You can revoke it in Privacy.')}}
  else if(act==='deldoc'){const k=D.docs.findIndex(x=>x.id===+i);const n=D.docs[k].n;D.docs.splice(k,1);saveD();renderDash();toast(`${n} removed.`)}
  else if(act==='revoke'){const [id,j]=i.split('|');const d=D.docs.find(x=>x.id===+id);d.sh.splice(+j,1);saveD();renderDash();toast('Access revoked.')}
  else if(act==='notary'){const n=NOT[+i];notify('appt','Notary referral requested',`${n[0]} will contact you to schedule a consultation.`);saveD();drawNav();toast('Referral requested.')}
  else if(act==='2fa')dz2fa(a.dataset.m);
  else if(act==='2faOff'){setV({twofa:null});notify('security','Two-factor authentication turned off','Turn it back on to protect your account.');saveD();renderDash();toast('2FA turned off.')}
  else if(act==='outDev'){D.devices.splice(+i,1);saveD();renderDash();toast('Device logged out.')}
  else if(act==='outOthers'){D.devices=D.devices.filter(d=>d[2]);saveD();renderDash();toast('Logged out of all other devices.')}
  else if(act==='kyc'){openModal(`<div class="mh"><h3 id="mTitle">Verify your identity</h3>${X}</div><div class="m2fa"><p class="note" style="font-size:14.5px">KTP check and a quick face scan. Preview only: nothing is uploaded.</p><div class="scan" id="dzSc">${IC('i-face',34)}</div><button class="btn" id="dzGo">Start e-KYC</button></div>`);$('#dzGo').onclick=ev=>{ev.target.disabled=true;ev.target.textContent='Checking…';runScan($('#dzSc'),2400,null,()=>{setV({kyc:true});closeModal();renderDash();toast('Identity verified.')})}}
  else if(act==='dataCopy'){try{const u=URL.createObjectURL(new Blob([JSON.stringify({account:user,dashboard:D},null,2)],{type:'application/json'}));const l=document.createElement('a');l.href=u;l.download='le-insure-my-data.json';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}catch(err){}toast('Your data export is downloading.')}
  else if(act==='stmt')toast('Statement prepared. In the live app it downloads as a PDF.');
  else if(act==='dataFix')toast('Correction request sent. We reply within 3 working days.');
  else if(act==='delAcc'){openModal(`<div class="mh"><h3 id="mTitle">Delete your account?</h3>${X}</div><p class="note" style="font-size:14.5px">Type DELETE to confirm. Your documents, cases and legacy plan in this browser will be erased.</p><form class="dz-form" id="delF"><input id="delI" aria-label="Type DELETE" autocomplete="off"><button class="btn" type="submit">Delete permanently</button></form>`);
    $('#delF').onsubmit=ev=>{ev.preventDefault();if($('#delI').value.trim()!=='DELETE'){toast('Type DELETE in capitals to confirm.');return}store.del('li-user');store.del('li-dash');store.del('li-session');user=null;session=false;D=mkD();closeModal();setTimeout(()=>{route('home');toast('Your account was deleted.')},260)}}
});
document.body.insertAdjacentHTML('beforeend','<input type="file" id="dzFile" multiple hidden>');
$('#dzFile').addEventListener('change',e=>{const c=$('#docCat')?.value||'personal';[...e.target.files].forEach(f=>D.docs.unshift({id:Date.now()+Math.random(),n:f.name,c,e:null,s:(f.size/1048576).toFixed(1)+' MB',sh:[],rem:false}));saveD();if(tab==='docs')renderDash();toast(`${e.target.files.length} document${e.target.files.length>1?'s':''} added to ${DOCCAT[c][0]}.`);e.target.value=''});

/* start */
syncNav();
{const h=location.hash.slice(1);route(VIEWS.includes(h)?h:'home',{silent:true})}


/* ---------- readiness check-up ---------- */
const QZ=[
 ['Do you keep digital copies of your ID, family card and key documents in one secure place?','i-doc','LE-DOCS vault','Store documents encrypted, with reminders before they expire.'],
 ['Have you read the key clauses of your work or rental contract?','i-scan','AI-assisted contract review','Flags clauses worth a second look before you sign. Not legal advice.'],
 ['If a legal problem came up tomorrow, would you know who to contact?','i-scale','Legal triage and partner advocates','Sort the issue quickly, then book a verified advocate with the fee shown upfront.'],
 ['Could your household handle unexpected legal costs without strain?','i-shield','Legal Protection Plan','Cover for legal costs, issued by an OJK-licensed insurer. Coming in 2028.'],
 ['Does your family know where your important documents and assets are?','i-inf','LE-LEGACY','Map your assets, record beneficiaries and set emergency access.']];
const QOPT=[['Yes',20],['Not sure',10],['No',0]];
let qa=[],qi=0;
function qzStep(){
  const q=QZ[qi];
  modal.innerHTML=`<div class="qz-top"><span class="eyebrow qz-eb">Readiness check-up</span>${X}</div><div class="qz-dots" aria-hidden="true">${QZ.map((_,k)=>`<i class="${k<qi?'d':k===qi?'c':''}"></i>`).join('')}</div>
  <div class="qz-step"><p class="mhint">Question ${qi+1} of ${QZ.length}</p><h3 class="qz-q" id="mTitle">${q[0]}</h3>
  <div class="qz-opts" role="group" aria-label="Your answer">${QOPT.map((o,k)=>`<button class="qz-opt" data-a="${k}" aria-pressed="${qa[qi]===k}">${o[0]}<kbd>${k+1}</kbd></button>`).join('')}</div>
  ${qi>0?'<button class="lnk qz-back" id="qzBack">Back</button>':''}</div>`;
  requestAnimationFrame(()=>{const p=$('.qz-prog i',modal);if(p)p.style.width=(qi/QZ.length*100)+'%'});
  $$('.qz-opt',modal).forEach(b=>b.addEventListener('click',()=>qzAnswer(+b.dataset.a)));
  const bk=$('#qzBack');bk&&bk.addEventListener('click',()=>{qi--;qzStep()});
  ($('.qz-opt[aria-pressed="true"]',modal)||$('.qz-opt',modal)).focus();
}
function qzAnswer(k){qa[qi]=k;$$('.qz-opt',modal).forEach((b,j)=>b.setAttribute('aria-pressed',j===k));setTimeout(()=>{if(qi<QZ.length-1){qi++;qzStep()}else qzResult()},RM?0:260)}
function qzResult(){
  const score=qa.reduce((t,k)=>t+QOPT[k][1],0);
  const lvl=score>=80?['Well prepared','You have the basics in place. Keep documents current and review once a year.']:score>=50?['Partly prepared','A few gaps could become stressful if something goes wrong. Start with the items below.']:['Getting started','Most people start here. Small steps now make a big difference later.'];
  const gaps=QZ.map((q,i)=>[q,qa[i]]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const C=2*Math.PI*56;
  modal.innerHTML=`<div class="qz-top"><span class="eyebrow">Your result</span>${X}</div>
  <div class="qz-res"><div class="qring"><svg viewBox="0 0 132 132"><circle class="tr" cx="66" cy="66" r="56"/><circle class="fg" cx="66" cy="66" r="56" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg><span class="num" id="qzN">0</span></div>
  <div><span class="qz-lvl">${lvl[0]}</span><h3 id="mTitle">Your readiness score is ${score}/100</h3><p>${lvl[1]}</p></div></div>
  ${gaps.length?`<p class="mhint" style="margin-bottom:8px">Where Le-Insure can help</p><ul class="qz-recs">${gaps.map(([q])=>`<li><span class="ic"><svg width="18" height="18"><use href="#${q[1]}"/></svg></span><span><b>${q[2]}</b><small>${q[3]}</small></span></li>`).join('')}</ul>`:''}
  <div class="qz-act">${session?'<a class="btn" href="#dashboard">Go to my dashboard</a>':'<a class="btn" href="#register">Create free account</a>'}<button class="btn ghost" id="qzAgain">Retake</button></div>
  <p class="note" style="margin-top:14px">For general education only. This is not legal advice.</p>`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{$('.qring .fg',modal).style.strokeDashoffset=C*(1-score/100)}));
  if(window.gsap&&!RM){const o={v:0};gsap.to(o,{v:score,duration:1.2,ease:'power2.out',onUpdate:()=>{const n=$('#qzN');if(n)n.textContent=Math.round(o.v)}})}else $('#qzN').textContent=score;
  $('#qzAgain').addEventListener('click',()=>{qa=[];qi=0;qzStep()});
  if(session&&D&&D.steps&&!D.steps[0][2]){D.steps[0][2]=true;saveD()}
  try{localStorage.setItem('li-readiness',JSON.stringify({score,at:new Date().toISOString()}))}catch(e){}
}
$('#checkBtn').addEventListener('click',()=>{qa=[];qi=0;openModal('');qzStep()});
modal.addEventListener('keydown',e=>{if(!$('.qz-opts',modal))return;const k=+e.key;if(k>=1&&k<=3){e.preventDefault();qzAnswer(k-1)}});
modal.addEventListener('click',e=>{if(e.target.closest('a[href="#register"],a[href="#dashboard"]'))closeModal()});


/* ---------- moving colonnade (login / register) ---------- */
(function(){
  const VPx=640,VPy=300,X0=95,T0=170,B0=700,W0=96,K=.55,GAP=1;
  let phase=0,last=performance.now();
  const P=(x,y,f)=>[VPx+(x-VPx)*f,VPy+(y-VPy)*f];
  function draw(cv,dt){
    const r=cv.getBoundingClientRect();if(!r.width)return;
    const dpr=Math.min(devicePixelRatio,2);if(cv.width!==Math.round(r.width*dpr)){cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr)}
    const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
    const sc=Math.max(r.width/640,Math.min(r.height,760)/760)*dpr;c.setTransform(sc,0,0,sc,0,(cv.height-760*sc)/2);
    c.lineWidth=1.1/ (sc/dpr);
    const far=1/(1+9*K);
    // entablature + stylobate (continuous lines to the vanishing point)
    c.strokeStyle='rgba(201,181,138,.45)';
    [92,118,130,146,714,740].forEach(y=>{const b=P(-40,y,far);c.beginPath();c.moveTo(-40,y);c.lineTo(b[0],b[1]);c.stroke()});
    // moving dentils and floor joints
    c.strokeStyle='rgba(201,181,138,.32)';
    for(let k=0;k<44;k++){const z=k*.22-(phase*GAP%0.22);if(z<-.6)continue;const f=1/(1+z*K);const a=P(-40,146,f);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[0],a[1]+6*f);c.stroke();
      if(k%2===0){const u=P(-40,714,f),v=P(-40,740,f);c.beginPath();c.moveTo(u[0],u[1]);c.lineTo(v[0],v[1]);c.stroke()}}
    // columns, far to near
    const cols=[];for(let i=-1;i<10;i++){const z=i*GAP-(phase%GAP);if(z>-0.95)cols.push(z)}
    cols.sort((a,b)=>b-a).forEach(z=>{
      const f=1/(1+z*K),cx=VPx+(X0-VPx)*f,ty=VPy+(T0-VPy)*f,by=VPy+(B0-VPy)*f,w=W0*f;
      const a=Math.min(1,Math.max(0,(9-z)/2.5))*Math.min(1,(z+.95)/.5);
      const g=c.createLinearGradient(cx-w/2,0,cx+w/2,0);g.addColorStop(0,`rgba(220,203,168,${.22*a})`);g.addColorStop(.45,`rgba(220,203,168,${.07*a})`);g.addColorStop(1,'rgba(220,203,168,0)');
      c.fillStyle=g;c.fillRect(cx-w/2,ty,w,by-ty);
      c.strokeStyle=`rgba(201,181,138,${.7*a})`;c.strokeRect(cx-w/2,ty,w,by-ty);
      c.strokeRect(cx-w*.68,ty-16*f,w*1.36,16*f);c.strokeRect(cx-w*.6,ty-24*f,w*1.2,8*f);c.strokeRect(cx-w*.66,by,w*1.32,14*f);
      c.strokeStyle=`rgba(201,181,138,${.35*a})`;
      for(let k=1;k<6;k++){const x=cx-w/2+w*k/6;c.beginPath();c.moveTo(x,ty+4*f);c.lineTo(x,by-4*f);c.stroke()}
    });
  }
  function loop(t){
    requestAnimationFrame(loop);
    const dt=Math.min((t-last)/1000,.05);last=t;
    const v=document.querySelector('[data-view="login"]:not([hidden]) .colcv,[data-view="register"]:not([hidden]) .colcv');
    if(!v)return;
    phase+=dt*.32;
    draw(v,dt);
  }
  requestAnimationFrame(loop);
})();


/* ---------- our services ---------- */
const STAGES=[['Prepare','Before a problem starts','Get informed and organized while things are calm.'],['Protect','When a problem happens','Get the issue sorted and reach the right help quickly.'],['Preserve','For the people after you','Make sure your family can find what matters.']];
const FEATS=[
 {id:'checkup',st:0,ic:'i-book',n:'Legal Check-up & Education Hub',s:'A quick check-up plus plain-language guides on your rights.',ph:'Phase 1',plan:'Free on Basic',
  d:'A short check-up shows where you stand. Plain-language guides then explain your rights at work, at home and online, so you know what to look out for.',
  can:['Take a 5-question readiness check and get a score','Read guides on employment, rental, consumer and inheritance basics','Get reminders to review important documents and contracts','Available to everyone on the free plan'],
  who:[['Le-Insure','Builds the check-up and curates the education content'],['You','Learn at your own pace and act on the next steps']],
  price:['Le-Insure Basic','Free'],note:'Content is general education. It is not legal advice.',cta:'quiz'},
 {id:'contract',st:0,ic:'i-scan',n:'AI-assisted Contract Review',s:'Flags clauses worth a second look before you sign.',ph:'Phase 1',plan:'Le-Insure Plus',
  d:'Upload a work, rental or purchase contract. AI highlights clauses that deserve attention, such as deposits, termination, penalties and auto-renewal.',
  can:['Upload a PDF or a photo of your contract','See flagged clauses with a plain-language explanation of what that type of clause usually means','Save the contract to LE-DOCS with its key dates','Ask a partner advocate to review it if something looks wrong'],
  who:[['Le-Insure','Runs the AI that flags clauses for review'],['Partner advocate','Gives legal advice if you want it']],
  price:['Le-Insure Plus','Rp29,000/month'],note:'The AI only flags clauses for review. It does not give legal advice.'},
 {id:'docs',st:0,ic:'i-lock',n:'LE-DOCS',s:'Encrypted vault for your important documents, with expiry reminders.',ph:'Phase 1',plan:'Basic 1 GB · Plus 20 GB',
  d:'Keep your ID, family card, certificates, contracts and policies in one encrypted place, organized by category, with reminders before anything expires.',
  can:['Store documents encrypted, organized by category','Get reminders before IDs, leases and contracts expire','Share a document securely with your advocate or notary, only when you choose','Use the same vault for LE-LEGACY so your family can find what matters'],
  who:[['Le-Insure','Stores and encrypts your files, sends reminders'],['You','Decide what to store and who can see it']],
  price:['Basic: 1 GB · Plus: 20 GB','From free'],also:'Also part of Preserve'},
 {id:'triage',st:1,ic:'i-route',n:'Legal Triage',s:'Structured questions that sort your problem and show next steps.',ph:'Phase 1',plan:'Initial triage free',
  d:'Answer a few guided questions about what happened. AI sorts the issue and a person reviews it, then you see which documents you need and what your options are.',
  can:['Describe your issue through guided questions','Get the issue sorted by type, such as employment, rental or consumer dispute','See the documents you need and your possible next steps','Go straight to a matching partner advocate'],
  who:[['Le-Insure','AI triage with human review'],['Partner advocate','Takes over when you need advice']],
  price:['Initial triage','Free on Basic'],note:'Triage routes you to the right help. It is not legal advice.'},
 {id:'advocate',st:1,ic:'i-user',n:'Partner Advocate Referral',s:'Book a verified advocate with the fee shown upfront.',ph:'Phase 1',plan:'Pay per session',
  d:'Get matched with a verified partner advocate who fits your issue. You see their fee before you book, and they receive it in full.',
  can:['Get matched by issue type and location','See the advocate\'s fee before you book','Meet by video, phone or in person','Share your documents securely from LE-DOCS'],
  who:[['Partner advocate','Gives legal advice and represents you'],['Le-Insure','Verifies advocates, handles matching and scheduling']],
  price:['Platform fee per paid consultation','Rp25,000'],note:'The advocate\'s fee is separate and goes to them in full. The Employee Package includes one 30-minute consultation per employee per year.'},
 {id:'lpp',st:1,ic:'i-shield',n:'Legal Protection Plan',s:'Help with legal costs, issued by an OJK-licensed insurer.',ph:'Phase 2 · 2028',plan:'Premium paid to insurer',
  d:'Insurance that helps pay legal costs when you face a covered dispute. The policy is issued by an OJK-licensed insurance partner, who also decides claims.',
  can:['Cover for employment, rental housing, consumer and digital transaction, and personal contract disputes','Up to Rp25 million per case and Rp50 million per year (illustrative)','90-day waiting period and 10% own risk','Excludes disputes that began before the policy, intentional crimes and claims without reasonable grounds'],
  who:[['Licensed insurer','Underwrites, issues the policy and decides claims'],['Le-Insure','Explains the cover and helps you prepare a claim']],
  price:['Retail premium (illustrative)','Rp40,000/month'],note:'Le-Insure does not underwrite insurance. Final terms are set by the insurer.'},
 {id:'tracker',st:1,ic:'i-track',n:'Case Tracker',s:'Status, deadlines and documents for your case in one timeline.',ph:'Phase 1',plan:'Le-Insure Plus',
  d:'Once you are working with an advocate, every step of your case shows up in one timeline, so you always know what is happening and what is needed from you.',
  can:['See the status of your case at a glance','Know which documents are needed and by when','Get reminders before deadlines','Track response times against agreed service levels'],
  who:[['Partner advocate','Updates the case and handles the legal work'],['Le-Insure','Keeps the timeline, reminders and documents together']],
  price:['Le-Insure Plus','Rp29,000/month']},
 {id:'legacy',st:2,ic:'i-inf',n:'LE-LEGACY',s:'Asset map, beneficiaries, emergency access and notary referral.',ph:'Basic in Phase 1 · notary in Phase 3',plan:'Plus + setup package',tag:'Phase 1',big:['Asset and document map','Beneficiaries and emergency access','Referral to a partner notary'],
  d:'Organize what you own and where your documents are, record who should receive what, and choose who can access your vault in an emergency. When you want a will, book a partner notary with everything ready.',
  can:['Map your property, accounts, policies and valuables','Record beneficiaries and their relationship to you','Set emergency access for trusted people, with identity checks','Book a partner notary to make a will or deed'],
  who:[['Partner notary','Makes the will or deed under Indonesian law'],['Le-Insure','Organizes your information and prepares the file']],
  price:['Legacy setup package (platform fee)','Rp250,000'],note:'LE-LEGACY does not replace a will. A will follows the Civil Code, the Compilation of Islamic Law or customary law, and a will in deed form is made before a notary. The notary\'s fee is paid directly to the notary.'}];
(function(){
  const g=$('#svsGrid');
  g.innerHTML=STAGES.map((st,k)=>`<div class="stage"><div class="stage-h"><span class="no">0${k+1}</span><h3>${st[0]}</h3><p>${st[1]}</p><p class="sd">${st[2]}</p></div><div class="stage-cards">${FEATS.filter(f=>f.st===k).map(f=>`<button class="fc rv pre${f.big?' big':''}" data-feat="${f.id}" aria-haspopup="dialog"><span class="ic"><svg width="24" height="24"><use href="#${f.ic}"/></svg></span><b>${f.n}</b><small>${f.s}</small><span class="ft"><span class="pill ${f.ph.startsWith('Phase 2')?'soon':'live'}">${f.tag||f.ph.split(' · ')[0]}</span><span class="more">View details<i></i></span></span>${f.big?`<span class="fx">${f.big.map(x=>`<span>${x}</span>`).join('')}</span>`:''}</button>`).join('')}${k===2?'<p class="also">LE-DOCS also helps here: your family can find the documents you stored.</p>':''}</div></div>`).join('');
  if($('#megaGrid'))$('#megaGrid').innerHTML=STAGES.map((st,k)=>`<div class="mcol"><div class="mcol-h"><span class="n">0${k+1}</span><b>${st[0]}</b><small>${st[1]}</small></div>${FEATS.filter(f=>f.st===k).map(f=>`<a class="dl" href="#services" data-feat="${f.id}" role="menuitem"><span class="ic"><svg width="20" height="20"><use href="#${f.ic}"/></svg></span><span><b>${f.n}${f.ph.startsWith('Phase 2')?'<span class="soon-tag">Soon</span>':''}</b><small>${f.s}</small></span></a>`).join('')}</div>`).join('');
  if($('#mmSvc'))$('#mmSvc').insertAdjacentHTML('beforeend',STAGES.map((st,k)=>`<span class="mm-st">${st[0]}</span>`+FEATS.filter(f=>f.st===k).map(f=>`<a href="#services" data-feat="${f.id}">${f.n}</a>`).join('')).join('')+'<a href="#services">View all services</a>');
  if($('#megaAll'))$('#megaAll').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();closeAll();go('#services')});
  /* scroll story: curtain opens, globe lands as a dot, section pins and plays Prepare > Protect > Preserve like slides, cards dealt from a deck */
  const sec=$('#services'),words=$$('.svs-head h2 span'),steps=$('#svsSteps'),ROT=[-9,6,-4,8];
  const lightAll=()=>$$('.stage',g).forEach(el=>el.classList.add('lit'));
  if(window.gsap&&window.ScrollTrigger&&!RM){
    gsap.from('.svs-head .eyebrow,.svs-head h2 span,.svs-head .lede',{yPercent:60,opacity:0,duration:1,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.svs-head',start:'top 80%',once:true}});
    const mm=gsap.matchMedia();
    mm.add('(min-width:981px) and (min-height:760px)',()=>{
      sec.classList.add('pin');lightAll();$$('.fc.rv',g).forEach(el=>el.classList.remove('pre'));
      const stages=$$('.stage',g);let cur=-1;
      const deck=(el,i)=>{const c=el.parentElement;return{x:c.offsetWidth/2-(el.offsetLeft+el.offsetWidth/2)+i*8,y:c.offsetHeight/2-(el.offsetTop+el.offsetHeight/2)+i*5}};
      const mark=k=>{words.forEach((w,i)=>w.classList.toggle('on',i===k));$$('button',steps).forEach((b,i)=>b.setAttribute('aria-current',i===k?'step':'false'))};
      mark(0);
      gsap.set(stages.slice(1),{autoAlpha:0});
      const tl=gsap.timeline({defaults:{ease:'power3.out'},scrollTrigger:{trigger:sec,pin:true,start:'top top',end:()=>'+='+innerHeight*2.6,scrub:.8,invalidateOnRefresh:true,anticipatePin:1,
        onUpdate:s=>{const k=s.progress<.33?0:s.progress<.66?1:2;if(k!==cur){cur=k;mark(k)}}}});
      stages.forEach((st,k)=>{
        const cards=$$('.fc',st),h=$('.stage-h',st),also=$('.also',st),at=k*1.3;
        if(k>0){const pv=stages[k-1];
          tl.fromTo($$('.fc',pv),{y:0,opacity:1,rotation:0},{y:-90,opacity:0,immediateRender:false,rotation:i=>ROT[i%4]*.6,stagger:.05,duration:.4,ease:'power2.in'},at-.4)
            .fromTo($('.stage-h',pv),{x:0,opacity:1},{x:-50,opacity:0,duration:.35,ease:'power2.in',immediateRender:false},at-.35)
            .set(pv,{autoAlpha:0},at).set(st,{autoAlpha:1},at)
            .fromTo(h,{x:50,opacity:0},{x:0,opacity:1,duration:.45},at)}
        tl.fromTo(cards,{x:(i,el)=>deck(el,i).x,y:(i,el)=>deck(el,i).y,rotation:i=>ROT[i%4],scale:.9,opacity:1},{x:0,y:0,rotation:0,scale:1,opacity:1,duration:.7,stagger:.08,immediateRender:true},at+.05);
        if(also)tl.fromTo(also,{opacity:0,y:10},{opacity:1,y:0,duration:.3,immediateRender:true},at+.55);
      });
      tl.to({},{duration:.5});
      $$('button',steps).forEach((b,i)=>b.onclick=()=>{const s=tl.scrollTrigger,y=s.start+(s.end-s.start)*[.24,.57,.9][i];lenis?lenis.scrollTo(y,{duration:1.2}):scrollTo({top:y,behavior:'smooth'})});
      return()=>{sec.classList.remove('pin');words.forEach(w=>w.classList.remove('on'))};
    });
    mm.add('(max-width:980px), (max-height:759px)',()=>{
      $$('.stage',g).forEach(st=>{const cards=$$('.fc',st);cards.forEach(c=>c.classList.remove('pre'));
        gsap.from(st,{y:60,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:st,start:'top 88%',once:true,onEnter:()=>setTimeout(()=>st.classList.add('lit'),400)}});
        gsap.from(cards,{y:i=>-(i*36)-40,rotation:i=>ROT[i%4],scale:.92,opacity:0,duration:.9,stagger:.1,ease:'back.out(1.3)',scrollTrigger:{trigger:st,start:'top 78%',once:true}})});
    });
  }else lightAll();
  /* constellation background */
  (function(){const cv=$('#svsCv'),sec=$('#services');if(!cv)return;const cx=cv.getContext('2d');let W=0,H=0,P=[],on=false,raf=0,last=0,mx=-1e4,my=-1e4;const D=Math.min(devicePixelRatio||1,2);
    function size(){const r=sec.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);const n=Math.round(Math.min(110,Math.max(40,W*H/16000)));P=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*14,r:Math.random()*1.6+.5,t:Math.random()*6.28}))}
    function frame(t){raf=requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000||0);last=t;cx.clearRect(0,0,W,H);const L=Math.min(150,W/7);
      for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;if(p.y<-10)p.y=H+10;if(p.y>H+10)p.y=-10;
        const dx=p.x-mx,dy=p.y-my,dd=dx*dx+dy*dy;if(dd<22000){const f=(1-dd/22000)*30*dt;p.x+=dx/Math.sqrt(dd+1)*f;p.y+=dy/Math.sqrt(dd+1)*f}}
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<L){cx.strokeStyle=`rgba(220,203,168,${(1-d/L)*.22})`;cx.lineWidth=.8;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
      for(const p of P){const tw=.55+.45*Math.sin(p.t*1.6);cx.fillStyle=`rgba(220,203,168,${.35+.5*tw})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill()}}
    function start(){if(!on){on=true;last=performance.now();raf=requestAnimationFrame(frame)}}function stop(){on=false;cancelAnimationFrame(raf)}
    size();addEventListener('resize',()=>{clearTimeout(cv._t);cv._t=setTimeout(size,150)});
    sec.addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});sec.addEventListener('pointerleave',()=>{mx=my=-1e4});
    new IntersectionObserver(es=>es[0].isIntersecting&&!document.hidden?start():stop()).observe(sec);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else{const r=sec.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)start()}});
    if('ResizeObserver' in window)new ResizeObserver(()=>{clearTimeout(cv._t);cv._t=setTimeout(size,150)}).observe(sec);
  })();
  $$('.fc',g).forEach((c,i)=>{c.style.transitionDelay=(i%4*.06)+'s';
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');if(!RM)c.style.transform=`perspective(900px) rotateX(${(.5-y)*5}deg) rotateY(${(x-.5)*7}deg) translateY(-3px)`});
    c.addEventListener('pointerleave',()=>c.style.transform='')});
  if(window.ScrollTrigger&&!RM){$$('.fc.rv',g).forEach(el=>ScrollTrigger.create({trigger:el,start:'top 94%',once:true,onEnter:()=>{el.classList.remove('pre');setTimeout(()=>el.style.transitionDelay='',1200)}}))}else $$('.fc.rv',g).forEach(el=>el.classList.remove('pre'));
})();
function openFeat(id){
  const i=FEATS.findIndex(f=>f.id===id);if(i<0)return;const f=FEATS[i],prev=FEATS[(i+FEATS.length-1)%FEATS.length],next=FEATS[(i+1)%FEATS.length];
  const html=`<div class="fd"><div class="fd-top"><div><div class="fd-ic"><svg width="28" height="28"><use href="#${f.ic}"/></svg></div><span class="eyebrow">${STAGES[f.st][0]} · ${STAGES[f.st][1]}</span></div>${X}</div>
   <h3 id="mTitle" style="margin-top:10px">${f.n}</h3><p class="desc">${f.d}</p>
   <div class="chips"><span class="pill ${f.ph.startsWith('Phase 2')?'soon':'live'}">${f.ph}</span><span class="pill">${f.plan}</span>${f.also?`<span class="pill">${f.also}</span>`:''}</div>
   <h4>What you can do</h4><ul>${f.can.map(c=>`<li><svg width="16" height="16"><use href="#i-check"/></svg><span>${c}</span></li>`).join('')}</ul>
   <h4>Who does what</h4><div class="who">${f.who.map(w=>`<div><b>${w[0]}</b>${w[1]}</div>`).join('')}</div>
   <div class="price"><span>${f.price[0]}</span><b class="num">${f.price[1]}</b></div>
   ${f.note?`<p class="note-l">${f.note}</p>`:''}
   <div class="acts">${f.cta==='quiz'?'<button class="btn" id="fdQuiz">Check your readiness</button>':''}<a class="btn ${f.cta==='quiz'?'ghost':''}" href="${session?'#dashboard':'#register'}">${session?'Go to my dashboard':'Create free account'}</a></div>
   <div class="fd-nav"><button data-goto="${prev.id}">Previous<span>${prev.n}</span></button><button data-goto="${next.id}" style="text-align:right">Next<span>${next.n}</span></button></div></div>`;
  if(ov.hidden){openModal(html)}else{modal.innerHTML=html;modal.scrollTop=0}
  modal.classList.add('wide');
  const q=$('#fdQuiz');q&&q.addEventListener('click',()=>{qa=[];qi=0;qzStep()});
  $$('[data-goto]',modal).forEach(b=>b.addEventListener('click',()=>openFeat(b.dataset.goto)));
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-feat]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();closeAll();openFeat(b.dataset.feat)},true);
IDX.push(...FEATS.map(f=>[f.n,'#feat-'+f.id,STAGES[f.st][0]]));
ov.addEventListener('transitionend',()=>{if(ov.hidden)modal.classList.remove('wide')});
/* ---------- about page ---------- */
function abScene(cv,withGlobe){
  if(!window.THREE||!cv)return null;let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){return null}
  R.setPixelRatio(Math.min(devicePixelRatio,withGlobe?2:1.5));
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);
  sc.add(new THREE.AmbientLight(0xffffff,.5));
  const dl=new THREE.DirectionalLight(0xF3EADB,1.3);dl.position.set(-4,6,6);sc.add(dl);
  const pl=new THREE.PointLight(0xE36B78,1.6,30);pl.position.set(4,2,-2);sc.add(pl);
  const pl2=new THREE.PointLight(0xDCCBA8,.9,20);pl2.position.set(-3,-1,5);sc.add(pl2);
  const flash=new THREE.PointLight(0xF3EADB,0,8);sc.add(flash);
  // gavel as a hologram: fresnel glow, scan lines, clean edge outlines
  const HT={value:0};
  const holo=(c1,c2,base,k=1)=>new THREE.ShaderMaterial({uniforms:{t:HT,c1:{value:new THREE.Color(c1)},c2:{value:new THREE.Color(c2)},b:{value:base},k:{value:k}},
    vertexShader:'varying vec3 vN;varying vec3 vV;varying float vY;void main(){vec4 wp=modelMatrix*vec4(position,1.);vY=wp.y;vN=normalize(normalMatrix*normal);vec4 mv=viewMatrix*wp;vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float t;uniform vec3 c1;uniform vec3 c2;uniform float b;uniform float k;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);float s=smoothstep(.55,1.,sin(vY*34.-t*3.)*.5+.5);float band=smoothstep(.92,1.,sin(vY*1.6-t*1.4)*.5+.5);float fl=.93+.07*sin(t*21.);vec3 col=mix(c1,c2,f);float a=(b+f*.8+s*.09+band*.3)*fl*k;gl_FragColor=vec4(col*a,a);}',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const wood=holo(0xA85563,0xF3E0E2,.04,.75),gold=holo(0xDCCBA8,0xF3EADB,.08,.8);
  const edgeM=new THREE.LineBasicMaterial({color:0xF3EADB,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false});
  const HM=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo,20),edgeM));return m};
  const gv=new THREE.Group();sc.add(gv);const pivot=new THREE.Group();gv.add(pivot);
  const L=2.5,HX=-L;
  const handle=HM(new THREE.CylinderGeometry(.07,.11,L-.3,48),wood);handle.rotation.z=Math.PI/2;handle.position.x=-(L-.3)/2-.05;pivot.add(handle);
  pivot.add(HM(new THREE.SphereGeometry(.15,24,16),wood));
  const cap=HM(new THREE.CylinderGeometry(.125,.125,.09,48),gold);cap.rotation.z=Math.PI/2;cap.position.x=-.2;pivot.add(cap);
  const col=HM(new THREE.CylinderGeometry(.12,.12,.1,48),gold);col.rotation.z=Math.PI/2;col.position.x=HX+.42;pivot.add(col);
  const head=new THREE.Group();head.position.x=HX;pivot.add(head);
  head.add(HM(new THREE.CylinderGeometry(.37,.37,1.2,64),wood));
  [-.46,.46].forEach(y=>{const b=HM(new THREE.CylinderGeometry(.395,.395,.09,64),gold);b.position.y=y;head.add(b)});
  [-.64,.64].forEach(y=>{const f=HM(new THREE.CylinderGeometry(.33,.37,.08,64),wood);f.position.y=y;if(y<0)f.rotation.x=Math.PI;head.add(f)});
  const block=new THREE.Group();block.position.set(HX,-.88,0);gv.add(block);
  block.add(HM(new THREE.CylinderGeometry(.95,1.06,.34,96),wood));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.96,.022,12,160),gold);rim.rotation.x=Math.PI/2;rim.position.y=.17;block.add(rim);
  const rim2=new THREE.Mesh(new THREE.TorusGeometry(1.05,.018,12,160),gold);rim2.rotation.x=Math.PI/2;rim2.position.y=-.17;block.add(rim2);
  // projector beam under the block
  const beamM=holo(0xE36B78,0xF3EADB,0,.45);if(withGlobe){const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.0,.18,1.1,96,1,true),beamM);beam.position.y=-.75;block.add(beam);
  const pad=HM(new THREE.CylinderGeometry(.24,.3,.06,48),holo(0xDCCBA8,0xF3EADB,.25));pad.position.y=-1.32;block.add(pad)}
  // shock rings: soft, anti-aliased circles drawn in a shader
  const mkRing=()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),new THREE.ShaderMaterial({uniforms:{op:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:'uniform float op;varying vec2 vU;void main(){float d=length(vU)*1.2;float w=fwidth(d)*1.5;float core=1.-smoothstep(.0,.035+w,abs(d-.95));float glow=1.-smoothstep(0.,.22,abs(d-.95));float a=(core*.9+glow*.35)*op;gl_FragColor=vec4(vec3(1.,.89,.76)*a,a);}',
    extensions:{derivatives:true}}));m.rotation.x=-Math.PI/2;m.position.set(HX,-.7,0);gv.add(m);return m};
  const rings=[mkRing(),mkRing(),mkRing()];
  // globe (hero only): assembled from scattered points
  let globe=null,gp=null,gFrom=null,gTo=null,gDel=null,wireM=null,GN=0;
  if(withGlobe){globe=new THREE.Group();sc.add(globe);const GR=2.3;GN=2400;gFrom=new Float32Array(GN*3);gTo=new Float32Array(GN*3);gDel=new Float32Array(GN);
    for(let i=0;i<GN;i++){const y=1-(i/(GN-1))*2,r=Math.sqrt(1-y*y),th=i*2.399963;gTo.set([Math.cos(th)*r*GR,y*GR,Math.sin(th)*r*GR],i*3);
      const u=Math.random()*2-1,a=Math.random()*6.283,d=4+Math.random()*7,rr=Math.sqrt(1-u*u);gFrom.set([Math.cos(a)*rr*d,u*d,Math.sin(a)*rr*d],i*3);gDel[i]=Math.random()*.9}
    const g=new THREE.BufferGeometry();gp=new THREE.BufferAttribute(new Float32Array(gFrom),3);g.setAttribute('position',gp);
    globe.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xDCCBA8,size:.034,transparent:true,opacity:.9,depthWrite:false})));
    wireM=new THREE.LineBasicMaterial({color:0xC9B58A,transparent:true,opacity:0});
    const ringL=(fn)=>{const p=[];for(let i=0;i<=160;i++)p.push(fn(i/160*6.283));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),wireM)};
    for(let k=0;k<9;k++){const a=k/9*Math.PI;globe.add(ringL(t=>new THREE.Vector3(Math.cos(t)*Math.cos(a)*GR,Math.sin(t)*GR,Math.cos(t)*Math.sin(a)*GR)))}
    [-60,-30,0,30,60].forEach(d=>{const la=d*Math.PI/180,r=Math.cos(la)*GR,y=Math.sin(la)*GR;globe.add(ringL(t=>new THREE.Vector3(Math.cos(t)*r,y,Math.sin(t)*r)))});
    const core=new THREE.Mesh(new THREE.SphereGeometry(GR*.985,64,64),new THREE.MeshBasicMaterial({color:0x24090F,transparent:true,opacity:0}));globe.add(core);globe.userData.core=core;
    const halo=new THREE.Mesh(new THREE.TorusGeometry(GR*1.32,.006,6,240),new THREE.MeshBasicMaterial({color:0xC9B58A,transparent:true,opacity:0}));halo.rotation.set(1.2,.3,0);globe.add(halo);globe.userData.halo=halo;
    globe.rotation.z=.25;
  }
  let layout=()=>{};
  function size(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();layout(w/h)}
  if(withGlobe){layout=a=>{const wide=a>1.05;cam.position.set(0,.4,wide?12.5:15);cam.lookAt(0,0,0);globe.position.set(wide?1.3:0,wide?.5:.9,-1);gv.position.set(wide?-.2:1.1,wide?-.75:-1.5,1.8);gv.scale.setScalar(wide?.72:.58);gv.rotation.set(.12,.62,0)}}
  else{layout=a=>{cam.position.set(0,.6,a>1.2?10:13);cam.lookAt(0,.2,0);const wide=a>1.2;gv.position.set(wide?1.05:.95,wide?.92:1.5,0);gv.scale.setScalar(wide?.6:.5);gv.rotation.set(.18,.55,0)}}
  new ResizeObserver(size).observe(cv);size();
  // strike timeline
  const REST=-.38;let st=-1,shock=-1,born=performance.now(),visible=false,last=performance.now(),nextAuto=0,impactCb=null;
  const eo=x=>1-Math.pow(1-x,3),ei=x=>x*x*x;
  let a0=REST;
  const UP=withGlobe?-1.0:-.72;
  function angleAt(t){if(t<.26)return a0+(UP-a0)*eo(t/.26);if(t<.3)return UP;if(t<.4)return UP*(1-ei((t-.3)/.1));
    if(t<.58)return -.12*Math.sin((t-.4)/.18*Math.PI);if(t<1.4)return REST*eo((t-.58)/.82);return REST}
  function strike(){if(st<0||st>.58){a0=pivot.rotation.z;st=0}}
  function impact(){shock=0;flash.position.set(0,0,0);const wp=new THREE.Vector3(HX,-.7,0);gv.localToWorld(wp);flash.position.copy(wp);
    impactCb&&impactCb()}
  pivot.rotation.z=REST;
  function frame(now){requestAnimationFrame(frame);if(!visible){last=now;return}
    const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-born)/1000;HT.value=now/1000;beamM.uniforms.k.value=.45+(shock>=0?Math.max(0,.6*(1-shock/.6)):0);
    if(st>=0){const prev=st;st+=dt;if(prev<.4&&st>=.4)impact();pivot.rotation.z=angleAt(st);if(st>1.4)st=-1}
    else pivot.rotation.z=REST+Math.sin(t*1.4)*.015;
    if(shock>=0){shock+=dt;rings.forEach((r,i)=>{const s=Math.max(0,shock-i*.12);const k=Math.min(1,s/1.1);r.scale.setScalar(.85+k*(withGlobe?4.2:2.6));r.material.uniforms.op.value=s>0?Math.pow(1-k,1.4):0});
      flash.intensity=Math.max(0,3*(1-shock/.35));if(shock>1.5){shock=-1;flash.intensity=0}}
    if(globe){const A=RM?99:t;let done=true;const arr=gp.array;for(let i=0;i<GN;i++){const p=Math.min(1,Math.max(0,(A-gDel[i])/1.5));if(p<1)done=false;const e=eo(p);const j=i*3;arr[j]=gFrom[j]+(gTo[j]-gFrom[j])*e;arr[j+1]=gFrom[j+1]+(gTo[j+1]-gFrom[j+1])*e;arr[j+2]=gFrom[j+2]+(gTo[j+2]-gFrom[j+2])*e}
      if(!globe.userData.done){gp.needsUpdate=true;if(done)globe.userData.done=true}
      const w=Math.min(1,Math.max(0,(A-1.6)/1));wireM.opacity=.38*w;globe.userData.core.material.opacity=.55*w;globe.userData.halo.material.opacity=.3*w;
      globe.rotation.y+=dt*.12;const pulse=shock>=0?Math.max(0,1-shock/.9):0;globe.scale.setScalar(1+.035*Math.sin(Math.min(1,shock>=0?shock/.9:1)*Math.PI)*pulse*2);
      if(!RM&&t>2.4&&nextAuto===0){nextAuto=t;strike()}if(!RM&&nextAuto&&t-nextAuto>7.5){nextAuto=t;strike()}}
    else if(!RM){if(nextAuto&&t-nextAuto>6){nextAuto=t;strike()}}
    R.render(sc,cam)}
  requestAnimationFrame(frame);
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&!withGlobe&&!nextAuto){born=performance.now();nextAuto=.001;setTimeout(strike,500)}}).observe(cv);
  cv.addEventListener('click',strike);
  return{strike,onImpact(f){impactCb=f}};
}
function spaceBg(cv){if(!cv||cv.dataset.on)return;cv.dataset.on=1;const c=cv.getContext('2d');let W=0,H=0,dpr=1,stars=[],shoot=null,nextShoot=2;
  let nb=null;const N=()=>{dpr=Math.min(devicePixelRatio||1,1.5);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);
    const n=Math.round(W*H/2600);stars=Array.from({length:n},()=>{const z=Math.random();return{x:Math.random()*W,y:Math.random()*H,z,r:.35+z*z*1.5,tw:Math.random()*6.28,sp:.6+Math.random()*2.2,col:Math.random()<.12?'225,170,177':Math.random()<.3?'220,203,168':'247,239,230'}})};
  const neb=[[.18,.22,.55,'122,36,51'],[.82,.5,.6,'185,84,96'],[.4,.85,.5,'201,181,138']];
  const mkNeb=()=>{nb=document.createElement('canvas');const w=Math.max(1,Math.round(W/4)),h=Math.max(1,Math.round(H/4));nb.width=w;nb.height=h;const x=nb.getContext('2d');
    neb.forEach(([cx,cy,r,col],i)=>{const R=Math.max(w,h)*r,g=x.createRadialGradient(w*cx,h*cy,0,w*cx,h*cy,R);g.addColorStop(0,`rgba(${col},${i===2?.1:.22})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(0,0,w,h)})};
  N();mkNeb();addEventListener('resize',()=>{N();mkNeb()});
  (function f(now){requestAnimationFrame(f);if(curView!=='about'||!W)return;const t=now/1000,sy=(window.lenis&&lenis.scroll)||scrollY||0;
    c.clearRect(0,0,W,H);
    if(nb)c.drawImage(nb,-W*.06+Math.sin(t*.07)*W*.04,-H*.06+Math.cos(t*.05)*H*.04-(sy*.03)%(H*.1),W*1.12,H*1.12);
    for(const s of stars){let y=(s.y-sy*(.03+s.z*.18))%H;if(y<0)y+=H;const a=.25+.75*(.5+.5*Math.sin(t*s.sp+s.tw))*(.35+s.z*.65);c.fillStyle=`rgba(${s.col},${a.toFixed(3)})`;c.beginPath();c.arc(s.x,y,s.r,0,6.283);c.fill();
      if(s.r>1.45){c.fillStyle=`rgba(${s.col},${(a*.14).toFixed(3)})`;c.beginPath();c.arc(s.x,y,s.r*4,0,6.283);c.fill()}}
    if(!shoot&&t>nextShoot){const a=.35+Math.random()*.3;shoot={x:Math.random()*W*.8+W*.1,y:Math.random()*H*.4,vx:Math.cos(a)*-900,vy:Math.sin(a)*900,l:0}}
    if(shoot){shoot.l+=1/60;const p=shoot.l/.9,x=shoot.x+shoot.vx*shoot.l,y=shoot.y+shoot.vy*shoot.l;const g=c.createLinearGradient(x,y,x-shoot.vx*.12,y-shoot.vy*.12);g.addColorStop(0,`rgba(243,234,219,${(1-p).toFixed(2)})`);g.addColorStop(1,'rgba(243,234,219,0)');c.strokeStyle=g;c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x-shoot.vx*.12,y-shoot.vy*.12);c.stroke();if(p>=1){shoot=null;nextShoot=t+3+Math.random()*6}}
  })(performance.now())}
(function(){const pg=$('[data-view="pricing"]');if(!pg)return;
  $$('[data-bill]',pg).forEach(b=>b.addEventListener('click',()=>{const y=b.dataset.bill==='y';$$('[data-bill]',pg).forEach(x=>x.setAttribute('aria-pressed',x===b));$$('[data-m]',pg).forEach(el=>el.textContent=y?el.dataset.y:el.dataset.m)}));
  $('#pgEmp').addEventListener('click',()=>{openModal(`<div class="mh"><h3 id="mTitle">Employee Package</h3>${X}</div><p class="note" style="font-size:14.5px">Tell us about your company and we will get in touch.</p><form class="dz-form" id="empF" novalidate><label>Company name<input id="empC" autocomplete="organization"></label><label>Work email<input id="empE" type="email" autocomplete="email"></label><label>Number of employees<select id="empN"><option>Under 50</option><option>50 to 250</option><option>250 to 1,000</option><option>Over 1,000</option></select></label><button class="btn" type="submit">Send</button></form>`);
    $('#empF').onsubmit=e=>{e.preventDefault();if(!$('#empC').value.trim()||!/\S+@\S+\.\S+/.test($('#empE').value)){toast('Enter your company name and a valid work email.');return}closeModal();toast('Thanks. Our team will contact you within 2 working days.')}})})();
/* ---------- help center, chatbot, support ---------- */
const HC_T=[['reg','Registration','Registrasi','i-user'],['ver','Account verification','Verifikasi akun','i-id'],['lpp','Legal Protection Plan','Legal Protection Plan','i-shield'],['doc','Documents','Dokumen','i-doc'],['clm','Claims','Klaim','i-scale'],['use','Using the platform','Penggunaan platform','i-gear']];
const HC=[
 ['reg','How do I create an account?','Tap Register, then enter your full name, email, phone number and a password. We send a 6-digit code to your email or phone to confirm it is you.','Bagaimana cara membuat akun?','Ketuk Daftar, lalu isi nama lengkap, email, nomor telepon dan kata sandi. Kami mengirim kode 6 digit ke email atau ponsel Anda untuk memastikan itu Anda.',['register','sign up','create','account','daftar','akun']],
 ['reg','I did not receive the verification code.','Wait one minute, check your spam folder, then tap Resend. You can also switch between email and SMS on the same screen.','Saya tidak menerima kode verifikasi.','Tunggu satu menit, periksa folder spam, lalu ketuk Kirim ulang. Anda juga bisa beralih antara email dan SMS di layar yang sama.',['code','otp','sms','kode']],
 ['ver','Why do I need two-factor authentication?','A second step at sign-in protects your documents even if your password leaks. You can use a passkey or an authenticator app.','Kenapa saya perlu autentikasi dua langkah?','Langkah kedua saat masuk melindungi dokumen Anda walaupun kata sandi bocor. Anda bisa memakai passkey atau aplikasi autentikator.',['2fa','two-factor','passkey','authenticator','dua langkah']],
 ['ver','What is e-KYC and when do I need it?','e-KYC checks your KTP and a quick face scan. It is needed for partner advocates, the Legal Protection Plan and LE-LEGACY.','Apa itu e-KYC dan kapan saya membutuhkannya?','e-KYC memeriksa KTP dan pindai wajah singkat. Ini dibutuhkan untuk advokat mitra, Legal Protection Plan dan LE-LEGACY.',['kyc','ktp','face','identity','verify','verifikasi','wajah']],
 ['lpp','What does the Legal Protection Plan cover?','Legal costs for employment, rental housing, consumer and digital transaction, and personal contract disputes, up to the limits in the policy.','Apa yang ditanggung Legal Protection Plan?','Biaya hukum untuk sengketa ketenagakerjaan, sewa hunian, transaksi konsumen dan digital, serta kontrak pribadi, sampai batas di polis.',['cover','coverage','lpp','insurance','tanggung','asuransi']],
 ['lpp','Who issues the policy?','An OJK-licensed insurance partner issues the policy and decides claims. Le-Insure does not underwrite insurance.','Siapa yang menerbitkan polis?','Mitra asuransi berizin OJK menerbitkan polis dan memutuskan klaim. Le-Insure tidak menanggung risiko asuransi.',['insurer','ojk','policy','polis']],
 ['doc','Is LE-DOCS secure?','Files are encrypted and shared only when you choose. Every share has an end date and can be revoked in Privacy.','Apakah LE-DOCS aman?','File dienkripsi dan hanya dibagikan saat Anda memilih. Setiap akses berbagi punya tanggal berakhir dan bisa dicabut di Privasi.',['docs','document','vault','secure','dokumen','aman']],
 ['doc','Can LE-LEGACY make my will?','No. LE-LEGACY organizes your assets and beneficiaries. A will or deed is made with a notary under the law.','Apakah LE-LEGACY bisa membuat wasiat?','Tidak. LE-LEGACY merapikan aset dan ahli waris Anda. Wasiat atau akta dibuat bersama notaris sesuai hukum.',['will','legacy','notary','wasiat','notaris']],
 ['clm','How do I make a claim?','Notify the insurer through Le-Insure as soon as a covered dispute starts, prepare your documents, then the insurer reviews and decides.','Bagaimana cara mengajukan klaim?','Beri tahu asuransi lewat Le-Insure segera setelah sengketa yang ditanggung dimulai, siapkan dokumen, lalu asuransi meninjau dan memutuskan.',['claim','klaim']],
 ['clm','What if my claim is declined?','Ask the insurer to review the decision. If you are still not satisfied, you can use the OJK consumer complaint service.','Bagaimana jika klaim saya ditolak?','Minta asuransi meninjau ulang keputusan. Jika masih belum puas, Anda bisa memakai layanan pengaduan konsumen OJK.',['declined','rejected','complaint','ditolak','pengaduan']],
 ['use','How do I find an advocate?','Open My Protection, then Find an Advocate. Filter by field and city, and see each fee before you book.','Bagaimana cara mencari advokat?','Buka My Protection, lalu Find an Advocate. Saring berdasarkan bidang dan kota, dan lihat biayanya sebelum memesan.',['advocate','lawyer','advokat','pengacara']],
 ['use','How much does Le-Insure cost?','Basic is free. Plus is Rp29,000 per month. The Employee Package is Rp15,000 per employee per month, paid by the employer.','Berapa biaya Le-Insure?','Basic gratis. Plus Rp29.000 per bulan. Paket Karyawan Rp15.000 per karyawan per bulan, dibayar pemberi kerja.',['price','cost','plan','harga','biaya','paket']]];
let LANG=store.get('li-lang')||'en';
const L=(en,id)=>LANG==='id'?id:en;
(function(){const tp=$('#hcTopics');if(!tp)return;let cat='';
  const draw=()=>{const q=($('#hcQ').value||'').toLowerCase().trim();tp.innerHTML=HC_T.map(([k,en,id,ic])=>`<button type="button" class="hc-t${cat===k?' on':''}" data-hc="${k}"><span class="pg-ic">${IC(ic,20)}</span><b>${L(en,id)}</b><small>${HC.filter(f=>f[0]===k).length} ${L('articles','artikel')}</small></button>`).join('');
    const list=HC.filter(f=>(!cat||f[0]===cat)&&(!q||(f[1]+f[2]+f[3]+f[4]+f[5].join(' ')).toLowerCase().includes(q)));
    $('#hcH').textContent=cat?L(HC_T.find(t=>t[0]===cat)[1],HC_T.find(t=>t[0]===cat)[2]):L('Frequently asked questions','Pertanyaan yang sering diajukan');
    $('#hcFaq').innerHTML=list.map(f=>`<details><summary>${L(f[1],f[3])}</summary><p>${L(f[2],f[4])}</p></details>`).join('')||`<p class="pg-lede">${L('No answers match. Try the assistant or contact support.','Tidak ada jawaban yang cocok. Coba asisten atau hubungi dukungan.')}</p>`};
  tp.addEventListener('click',e=>{const b=e.target.closest('[data-hc]');if(!b)return;cat=cat===b.dataset.hc?'':b.dataset.hc;draw()});$('#hcQ').addEventListener('input',draw);window.hcDraw=draw;draw();
  // chatbot
  const bot=$('#bot'),log=$('#botLog');let greeted=false;
  const say=(t,me)=>{log.insertAdjacentHTML('beforeend',`<div class="bm${me?' me':''}">${t}</div>`);log.scrollTop=log.scrollHeight};
  const chips=()=>{$('#botChips').innerHTML=HC_T.map(([k,en,id])=>`<button type="button" data-bt="${k}">${L(en,id)}</button>`).join('')};
  const open=()=>{bot.hidden=false;requestAnimationFrame(()=>bot.classList.add('show'));chips();if(!greeted){greeted=true;say(L('Hi, I am the Le-Insure assistant. Ask me about registration, verification, the Legal Protection Plan, documents, claims or using the platform.','Halo, saya asisten Le-Insure. Tanyakan soal registrasi, verifikasi, Legal Protection Plan, dokumen, klaim atau penggunaan platform.'))}setTimeout(()=>$('#botI').focus(),100)};
  const close=()=>{bot.classList.remove('show');setTimeout(()=>bot.hidden=true,250)};
  const answer=q=>{const w=q.toLowerCase();let best=null,sc=0;HC.forEach(f=>{let s=f[5].filter(k=>w.includes(k)).length*3;(f[1]+' '+f[3]).toLowerCase().split(/\W+/).forEach(t=>{if(t.length>4&&w.includes(t))s++});if(s>sc){sc=s;best=f}});
    setTimeout(()=>{if(best&&sc>=2)say(`<b>${L(best[1],best[3])}</b><br>${L(best[2],best[4])}`);else say(L('I am not sure about that one. You can <a href="#support">contact our support team</a> and a person will help you.','Saya belum yakin soal itu. Anda bisa <a href="#support">menghubungi tim dukungan</a> dan petugas kami akan membantu.'))},450)};
  $('#botF').addEventListener('submit',e=>{e.preventDefault();const v=$('#botI').value.trim();if(!v)return;say(esc(v),true);$('#botI').value='';answer(v)});
  $('#botChips').addEventListener('click',e=>{const b=e.target.closest('[data-bt]');if(!b)return;const fs=HC.filter(f=>f[0]===b.dataset.bt);say(b.textContent,true);setTimeout(()=>say(fs.map(f=>`<b>${L(f[1],f[3])}</b><br>${L(f[2],f[4])}`).join('<br><br>')),400)});
  $('#botFab').addEventListener('click',()=>bot.hidden?open():close());$('#botX').addEventListener('click',close);$('#hcChatOpen').addEventListener('click',open);
  document.addEventListener('click',e=>{if(e.target.closest('[data-chat]'))open()});
  log.addEventListener('click',e=>{if(e.target.closest('a[href="#support"]'))close()});
  $('#supF').addEventListener('submit',e=>{e.preventDefault();const ok=$('#supN').value.trim()&&/\S+@\S+\.\S+/.test($('#supE').value)&&$('#supM').value.trim().length>4;if(!ok){toast(L('Fill in your name, a valid email and a message.','Isi nama, email yang valid dan pesan.'));return}e.target.reset();toast(L('Message sent. Your ticket is LI-T','Pesan terkirim. Tiket Anda LI-T')+Math.floor(10000+Math.random()*89999)+'.')});
})();

const I18N_SRC=`About Us	Tentang Kami
Meet the Team	Tim Kami
Insurance Coverage	Cakupan Asuransi
Claims & Assistance	Klaim & Bantuan
Plans & Pricing	Paket & Harga
Careers	Karier
Help Center	Pusat Bantuan
Login	Masuk
Log out	Keluar
Dashboard	Dasbor
Daily insights	Insight harian
Explore Our Services	Jelajahi Layanan Kami
Check your readiness	Cek kesiapan Anda
Digital Protection for Your Rights & Legacy	Perlindungan Digital untuk Hak & Warisan Anda
Create free account	Buat akun gratis
Explore our services	Jelajahi layanan kami
Our approach	Pendekatan kami
Tap the gavel	Ketuk palunya
Who We Are	Siapa Kami
Why We Exist	Mengapa Kami Ada
Our Approach	Pendekatan Kami
Our Ecosystem	Ekosistem Kami
Our Philosophy	Filosofi Kami
Join us	Bergabung
Three pillars, one flow.	Tiga pilar, satu alur.
Fair, clear and in your hands.	Adil, jelas, dan di tangan Anda.
Before a problem starts	Sebelum masalah muncul
When a problem happens	Saat masalah terjadi
For the people after you	Untuk orang-orang setelah Anda
services in one flow	layanan dalam satu alur
stages: Prepare, Protect, Preserve	tahap: Siapkan, Lindungi, Lestarikan
Without a plan	Tanpa rencana
With Le-Insure	Dengan Le-Insure
Know what the Legal Protection Plan covers, 	Pahami apa yang ditanggung Legal Protection Plan, 
before you need it.	sebelum Anda membutuhkannya.
See plans & pricing	Lihat paket & harga
How claims work	Cara kerja klaim
What is covered	Yang ditanggung
Four everyday kinds of dispute.	Empat jenis sengketa sehari-hari.
Employment	Ketenagakerjaan
Rental housing	Sewa hunian
Consumer & digital transactions	Transaksi konsumen & digital
Personal contracts	Kontrak pribadi
Limits	Batas
What the plan pays, and up to how much.	Apa yang dibayar, dan sampai berapa.
Limit per case	Batas per kasus
Limit per year	Batas per tahun
Waiting period	Masa tunggu
Own risk	Risiko sendiri
Retail premium	Premi ritel
Paid to	Dibayar ke
The insurer	Perusahaan asuransi
What is not covered	Yang tidak ditanggung
Read this before you buy.	Baca ini sebelum membeli.
Disputes that began before the policy	Sengketa yang dimulai sebelum polis
Intentional crimes	Kejahatan yang disengaja
Claims without reasonable grounds	Klaim tanpa dasar yang wajar
From the first report 	Dari laporan pertama 
to a decision,	sampai keputusan,
 step by step.	 langkah demi langkah.
Report a legal issue	Laporkan masalah hukum
Getting help.	Mendapatkan bantuan.
Claiming legal costs.	Mengklaim biaya hukum.
Report the issue	Laporkan masalahnya
Get your next steps	Dapatkan langkah berikutnya
Talk to a partner advocate	Bicara dengan advokat mitra
Follow your case	Pantau kasus Anda
Notify early	Lapor sejak awal
Prepare your file	Siapkan berkas Anda
Insurer reviews	Asuransi meninjau
Costs are paid	Biaya dibayarkan
Documents	Dokumen
What to have ready.	Yang perlu disiapkan.
Questions	Pertanyaan
Common questions.	Pertanyaan umum.
Choose your protection 	Pilih perlindungan Anda 
before you sign up.	sebelum mendaftar.
Start free, add more when you need it. Prices are shown before you commit.	Mulai gratis, tambah saat Anda butuh. Harga ditampilkan sebelum Anda berkomitmen.
Monthly	Bulanan
Yearly	Tahunan
For everyone	Untuk semua orang
Most popular	Paling populer
Through your employer	Lewat pemberi kerja
Free	Gratis
Create free account	Buat akun gratis
Start with Plus	Mulai dengan Plus
See coverage	Lihat cakupan
Talk to us	Hubungi kami
Employee Package	Paket Karyawan
Other fees	Biaya lain
Pay only when you use it.	Bayar hanya saat dipakai.
Compare	Bandingkan
Plans side by side.	Perbandingan paket.
Feature	Fitur
Price	Harga
How can we 	Ada yang bisa kami 
help you today?	bantu hari ini?
Frequently asked questions	Pertanyaan yang sering diajukan
Still need help?	Masih butuh bantuan?
Chat with our assistant, or contact the support team.	Mengobrol dengan asisten kami, atau hubungi tim dukungan.
Chat with assistant	Chat dengan asisten
How to contact support	Cara menghubungi dukungan
Contact Support	Hubungi Dukungan
Talk to 	Bicara dengan 
a real person.	petugas sungguhan.
Back to Help Center	Kembali ke Pusat Bantuan
Live chat	Chat langsung
Email	Email
Phone	Telepon
Start chat	Mulai chat
Send a message	Kirim pesan
We will get back to you.	Kami akan membalas Anda.
Full name	Nama lengkap
Topic	Topik
Message	Pesan
Send message	Kirim pesan
Le-Insure Assistant	Asisten Le-Insure
Answers from our Help Center	Jawaban dari Pusat Bantuan kami
Send	Kirim
Our Services	Layanan Kami
Digital Protection	Perlindungan Digital
for Your	atas
Rights	Hak
Legacy	Warisan
An integrated digital ecosystem that brings legal cost protection, access to verified advocates, secure document management and legacy planning into one flow.	Ekosistem digital terpadu yang menyatukan perlindungan biaya hukum, akses ke advokat terverifikasi, pengelolaan dokumen yang aman, dan perencanaan warisan dalam satu alur.
Choose who can open your document vault in an emergency, and set a waiting period, so access is safe, on your terms and can be cancelled if it was a mistake	Tentukan siapa yang boleh membuka brankas dokumen Anda dalam keadaan darurat, dan atur masa tunggu, agar akses tetap aman, sesuai ketentuan Anda, dan bisa dibatalkan jika ternyata keliru
Turn on two-factor sign-in with a passkey or an authenticator app, so your documents stay protected even if your password ends up in a data leak	Aktifkan verifikasi dua langkah dengan passkey atau aplikasi autentikator, agar dokumen Anda tetap terlindungi walaupun kata sandi Anda bocor dalam kebocoran data
Update your family card (KK) after a marriage, a birth or a move, since an outdated card can delay insurance claims, school enrolment and inheritance paperwork	Perbarui Kartu Keluarga (KK) setelah menikah, kelahiran anak, atau pindah rumah, karena KK yang tidak mutakhir bisa menghambat klaim asuransi, pendaftaran sekolah, dan urusan warisan
Always ask for the advocate fee before a consultation starts, and get it in writing, so there are no surprises when the bill arrives after the meeting	Selalu tanyakan biaya advokat sebelum konsultasi dimulai, dan minta secara tertulis, agar tidak ada kejutan saat tagihan datang setelah pertemuan
Read the auto-renewal clause in your lease or subscription before signing, because many renew automatically unless you give notice 30 to 60 days before the end	Baca klausul perpanjangan otomatis di kontrak sewa atau langganan Anda sebelum menandatangani, karena banyak yang diperpanjang otomatis kecuali Anda memberi pemberitahuan 30 sampai 60 hari sebelum berakhir
Scan your land certificate this week and keep the original somewhere safe, so your family can still find the details if the paper copy is ever lost or damaged	Pindai sertifikat tanah Anda minggu ini dan simpan aslinya di tempat aman, agar keluarga tetap bisa menemukan datanya jika salinan kertasnya hilang atau rusak
A will or deed is made with a notary under the law, not inside an app, so use LE-LEGACY to organize your assets and beneficiaries before you visit one	Wasiat atau akta dibuat di hadapan notaris sesuai hukum, bukan di dalam aplikasi, jadi gunakan LE-LEGACY untuk merapikan aset dan ahli waris Anda sebelum menemui notaris
Before you pay an online seller, screenshot the product page, the chat and the payment proof, since these are the evidence a consumer complaint relies on	Sebelum membayar penjual online, tangkap layar halaman produk, percakapan, dan bukti pembayaran, karena semua itu adalah bukti yang menjadi dasar pengaduan konsumen
Check whether your employment contract is fixed-term (PKWT) or permanent (PKWTT) today, because the two end differently and decide the severance you can expect	Cek hari ini apakah kontrak kerja Anda berjangka waktu tertentu (PKWT) atau tetap (PKWTT), karena keduanya berakhir dengan cara berbeda dan menentukan pesangon yang bisa Anda harapkan
Keep the transfer slip or signed receipt for every rental deposit you pay, because it is often the only proof you need to get the money back when you move out	Simpan bukti transfer atau kuitansi bertanda tangan untuk setiap deposit sewa yang Anda bayar, karena sering kali itulah satu-satunya bukti untuk mendapatkan uang kembali saat pindah
Prepare.	Siapkan.
Protect.	Lindungi.
Preserve.	Lestarikan.
Eight services in one flow, before, during and after a legal problem. Select any card to see the details.	Delapan layanan dalam satu alur, sebelum, selama, dan setelah masalah hukum. Pilih kartu mana saja untuk melihat detailnya.
Prepare	Siapkan
Get informed and organized while things are calm.	Dapatkan informasi dan rapikan urusan selagi keadaan tenang.
Legal Check-up & Education Hub	Cek Hukum & Pusat Edukasi
A quick check-up plus plain-language guides on your rights.	Pemeriksaan singkat plus panduan berbahasa sederhana tentang hak Anda.
View details	Lihat detail
AI-assisted Contract Review	Tinjauan Kontrak Berbantuan AI
Flags clauses worth a second look before you sign.	Menandai klausul yang perlu dicermati sebelum Anda menandatangani.
Encrypted vault for your important documents, with expiry reminders.	Brankas terenkripsi untuk dokumen penting Anda, dengan pengingat masa berlaku.
Protect	Lindungi
Get the issue sorted and reach the right help quickly.	Pilah masalahnya dan dapatkan bantuan yang tepat dengan cepat.
Legal Triage	Triase Hukum
Structured questions that sort your problem and show next steps.	Pertanyaan terstruktur yang memilah masalah Anda dan menunjukkan langkah berikutnya.
Partner Advocate Referral	Rujukan Advokat Mitra
Help with legal costs, issued by an OJK-licensed insurer.	Bantuan biaya hukum, diterbitkan oleh perusahaan asuransi berizin OJK.
Phase 2	Fase 2
Status, deadlines and documents for your case in one timeline.	Status, tenggat, dan dokumen kasus Anda dalam satu lini waktu.
Preserve	Lestarikan
Make sure your family can find what matters.	Pastikan keluarga Anda bisa menemukan hal yang penting.
Asset map, beneficiaries, emergency access and notary referral.	Peta aset, ahli waris, akses darurat, dan rujukan notaris.
Asset and document map	Peta aset dan dokumen
Beneficiaries and emergency access	Ahli waris dan akses darurat
Referral to a partner notary	Rujukan ke notaris mitra
LE-DOCS also helps here: your family can find the documents you stored.	LE-DOCS juga membantu di sini: keluarga Anda bisa menemukan dokumen yang Anda simpan.
01 Prepare	01 Siapkan
02 Protect	02 Lindungi
03 Preserve	03 Lestarikan
The people behind	Orang-orang di balik
A small team building one place for legal protection, secure documents and legacy planning.	Tim kecil yang membangun satu tempat untuk perlindungan hukum, dokumen yang aman, dan perencanaan warisan.
Le-Insure team	Tim Le-Insure
We make legal	Kami menjadikan
protection part of	perlindungan hukum bagian dari
everyday life.	kehidupan sehari-hari.
Le-Insure brings legal cost protection, verified advocates, secure documents and legacy planning into one flow, built with licensed partners.	Le-Insure menyatukan perlindungan biaya hukum, advokat terverifikasi, dokumen yang aman, dan perencanaan warisan dalam satu alur, dibangun bersama mitra berizin.
Who we are	Siapa kami
Everyday legal problems are ordinary. Being unprepared for them shouldn't be.	Masalah hukum sehari-hari itu wajar. Tidak siap menghadapinya, itu yang tidak seharusnya.
Legal costs arrive as a shock	Biaya hukum datang mengejutkan
An unpaid salary or a lost deposit can turn into fees a household never planned for.	Gaji yang tidak dibayar atau deposit yang hilang bisa berubah menjadi biaya yang tidak pernah direncanakan rumah tangga.
Documents are scattered	Dokumen tercecer
IDs, contracts and certificates sit in drawers, phones and inboxes when you need them most.	KTP, kontrak, dan sertifikat tersimpan di laci, ponsel, dan kotak masuk tepat saat Anda paling membutuhkannya.
Families don't know where to start	Keluarga tidak tahu harus mulai dari mana
Heirs often cannot find what was owned or who should receive it.	Ahli waris sering tidak tahu apa saja yang dimiliki atau siapa yang berhak menerimanya.
Help is hard to judge	Bantuan sulit dinilai
Fees and quality are unclear, so people wait until the problem grows.	Biaya dan kualitas tidak jelas, sehingga orang menunggu sampai masalahnya membesar.
Cost protection from licensed insurers	Perlindungan biaya dari perusahaan asuransi berizin
The Legal Protection Plan helps pay legal costs for covered disputes.	Legal Protection Plan membantu membayar biaya hukum untuk sengketa yang ditanggung.
One encrypted vault	Satu brankas terenkripsi
LE-DOCS keeps your documents together and reminds you before they expire.	LE-DOCS menyatukan dokumen Anda dan mengingatkan sebelum masa berlakunya habis.
A legacy map your family can open	Peta warisan yang bisa dibuka keluarga
LE-LEGACY records assets, beneficiaries and emergency access.	LE-LEGACY mencatat aset, ahli waris, dan akses darurat.
Verified advocates, fees upfront	Advokat terverifikasi, biaya di muka
Triage first, then book the right partner advocate with the fee shown.	Triase dulu, lalu pesan advokat mitra yang tepat dengan biaya yang ditampilkan.
Get informed and organized while things are calm: check-up, contract review and LE-DOCS.	Dapatkan informasi dan rapikan urusan selagi keadaan tenang: cek hukum, tinjauan kontrak, dan LE-DOCS.
Triage, partner advocates, the Legal Protection Plan and Case Tracker.	Triase, advokat mitra, Legal Protection Plan, dan Case Tracker.
LE-LEGACY maps what you own and who should receive it.	LE-LEGACY memetakan apa yang Anda miliki dan siapa yang berhak menerimanya.
Licensed partners do licensed work. We connect them.	Mitra berizin mengerjakan pekerjaan berizin. Kami yang menghubungkan mereka.
Le-Insure is the technology and orchestration layer. Insurers carry the risk, advocates give legal advice and notaries make deeds.	Le-Insure adalah lapisan teknologi dan orkestrasi. Perusahaan asuransi menanggung risiko, advokat memberi nasihat hukum, dan notaris membuat akta.
OJK-licensed insurers	Perusahaan asuransi berizin OJK
Licensed broker	Pialang berizin
Partner advocates	Advokat mitra
Partner notaries	Notaris mitra
Employers	Pemberi kerja
e-KYC & e-signature	e-KYC & tanda tangan elektronik
Technology and orchestration: one account, one vault, one flow.	Teknologi dan orkestrasi: satu akun, satu brankas, satu alur.
Clarity before complexity	Kejelasan sebelum kerumitan
Plain language, and prices shown before you commit.	Bahasa yang sederhana, dan harga ditampilkan sebelum Anda berkomitmen.
Licensed work by licensed partners	Pekerjaan berizin oleh mitra berizin
We never underwrite insurance or give legal advice ourselves.	Kami tidak pernah menanggung asuransi atau memberi nasihat hukum sendiri.
Your data, your keys	Data Anda, kunci Anda
Encrypted by default, shared only when you choose, protected by 2FA and e-KYC.	Terenkripsi secara bawaan, dibagikan hanya saat Anda memilih, dilindungi 2FA dan e-KYC.
Protection for everyone	Perlindungan untuk semua
A free Basic plan, so preparing never depends on a crisis.	Paket Basic gratis, agar bersiap tidak pernah bergantung pada krisis.
Digital Protection for Your	Perlindungan Digital atas
The Legal Protection Plan (LPP) helps pay legal costs when you face a covered dispute. It is issued by an OJK-licensed insurance partner, who also decides claims. Le-Insure explains the cover and helps you prepare.	Legal Protection Plan (LPP) membantu membayar biaya hukum saat Anda menghadapi sengketa yang ditanggung. Polisnya diterbitkan oleh mitra asuransi berizin OJK, yang juga memutuskan klaim. Le-Insure menjelaskan cakupannya dan membantu Anda bersiap.
Policies open in Phase 2 (2028) · figures below are illustrative	Polis dibuka pada Fase 2 (2028) · angka di bawah bersifat ilustrasi
Unpaid wages, unfair termination or severance that was not paid as agreed.	Upah tidak dibayar, PHK sepihak, atau pesangon yang tidak dibayar sesuai kesepakatan.
A deposit that is not returned, or a landlord who ends the lease against the agreement.	Deposit yang tidak dikembalikan, atau pemilik yang mengakhiri sewa bertentangan dengan perjanjian.
Online purchases that go wrong, services not delivered, or unfair seller terms.	Pembelian online yang bermasalah, layanan yang tidak diberikan, atau syarat penjual yang tidak adil.
Agreements between individuals, such as loans between friends or private sale contracts.	Perjanjian antarperorangan, seperti utang piutang antarteman atau kontrak jual beli pribadi.
Legal costs for a covered dispute, such as advocate fees and case costs, up to the limits in your policy. The insurer sets the final terms.	Biaya hukum untuk sengketa yang ditanggung, seperti honor advokat dan biaya perkara, hingga batas di polis Anda. Perusahaan asuransi menetapkan ketentuan akhirnya.
90 days	90 hari
10% of each claim	10% dari setiap klaim
Rp40,000 / month	Rp40.000 / bulan
Including problems that start during the 90-day waiting period.	Termasuk masalah yang dimulai selama masa tunggu 90 hari.
Costs from a crime you committed on purpose are excluded.	Biaya akibat tindak pidana yang Anda lakukan dengan sengaja tidak ditanggung.
The insurer can decline a case that has no reasonable legal basis.	Perusahaan asuransi dapat menolak perkara yang tidak memiliki dasar hukum yang wajar.
Le-Insure does not underwrite insurance or decide claims. Other exclusions may apply under the insurer's policy wording.	Le-Insure tidak menanggung asuransi atau memutuskan klaim. Pengecualian lain dapat berlaku sesuai ketentuan polis perusahaan asuransi.
Every member can get help through Legal Triage and a partner advocate. Policyholders of the Legal Protection Plan can also claim legal costs from the insurer, with Le-Insure helping them prepare.	Setiap anggota bisa mendapat bantuan melalui Triase Hukum dan advokat mitra. Pemegang polis Legal Protection Plan juga bisa mengklaim biaya hukum dari perusahaan asuransi, dengan bantuan persiapan dari Le-Insure.
Assistance · all members	Bantuan · semua anggota
Answer a few questions in Legal Triage. It takes about five minutes.	Jawab beberapa pertanyaan di Triase Hukum. Hanya sekitar lima menit.
A Le-Insure reviewer classifies the issue and replies within 1 working day.	Peninjau Le-Insure mengklasifikasikan masalah dan membalas dalam 1 hari kerja.
Choose a verified advocate with the fee shown upfront, plus a Rp25,000 platform fee.	Pilih advokat terverifikasi dengan biaya yang ditampilkan di muka, ditambah biaya platform Rp25.000.
Status, deadlines and required documents stay in the Case Tracker.	Status, tenggat, dan dokumen yang diperlukan tersimpan di Case Tracker.
Claims · Legal Protection Plan	Klaim · Legal Protection Plan
Tell the insurer through Le-Insure as soon as a covered dispute starts.	Beri tahu perusahaan asuransi melalui Le-Insure segera setelah sengketa yang ditanggung dimulai.
We help you gather the policy number, a timeline, evidence and the advocate's cost estimate from LE-DOCS.	Kami membantu Anda mengumpulkan nomor polis, kronologi, bukti, dan estimasi biaya advokat dari LE-DOCS.
The insurer checks the claim against the policy and makes the decision.	Perusahaan asuransi memeriksa klaim berdasarkan polis dan mengambil keputusan.
Approved costs are paid up to your limits, minus the 10% own risk. You see each update in the Case Tracker.	Biaya yang disetujui dibayar hingga batas Anda, dikurangi risiko sendiri 10%. Anda melihat setiap perkembangan di Case Tracker.
Your ID card (KTP) and policy number	KTP dan nomor polis Anda
A short timeline of what happened	Kronologi singkat kejadian
Contracts, receipts, chats or letters	Kontrak, kuitansi, percakapan, atau surat
The advocate's cost estimate or invoice	Estimasi biaya atau tagihan advokat
Triage, matching, document preparation and status updates.	Triase, pencocokan, persiapan dokumen, dan pembaruan status.
Partner advocate	Advokat mitra
Legal advice and representation.	Nasihat dan pendampingan hukum.
Licensed insurer	Perusahaan asuransi berizin
Reviews claims, decides and pays covered costs.	Meninjau klaim, memutuskan, dan membayar biaya yang ditanggung.
Can Le-Insure approve my claim?	Apakah Le-Insure bisa menyetujui klaim saya?
No. Only the insurer decides claims. Le-Insure helps you prepare a complete file so the review is faster.	Tidak. Hanya perusahaan asuransi yang memutuskan klaim. Le-Insure membantu Anda menyiapkan berkas lengkap agar peninjauan lebih cepat.
How long does a claim take?	Berapa lama proses klaim?
Timelines follow the insurer's policy terms. You can see each step in the Case Tracker.	Waktunya mengikuti ketentuan polis perusahaan asuransi. Anda bisa melihat setiap tahap di Case Tracker.
What if my claim is declined?	Bagaimana jika klaim saya ditolak?
You can ask the insurer to review the decision. If you are still not satisfied, you can use the OJK consumer complaint service.	Anda bisa meminta perusahaan asuransi meninjau ulang keputusannya. Jika masih belum puas, Anda bisa menggunakan layanan pengaduan konsumen OJK.
Can I get help without the Legal Protection Plan?	Bisakah saya mendapat bantuan tanpa Legal Protection Plan?
Yes. Legal Triage is free on every plan, and you can book a partner advocate and pay their fee directly.	Bisa. Triase Hukum gratis di semua paket, dan Anda bisa memesan advokat mitra serta membayar biayanya langsung.
Get informed and organized at no cost.	Dapatkan informasi dan rapikan urusan tanpa biaya.
Education hub and legal check-up	Pusat edukasi dan cek hukum
LE-DOCS vault, 1 GB	Brankas LE-DOCS, 1 GB
Partner advocate referral, pay per session	Rujukan advokat mitra, bayar per sesi
/ month	/ bulan
For people who sign contracts and keep important papers.	Untuk Anda yang menandatangani kontrak dan menyimpan dokumen penting.
Everything in Basic	Semua fitur Basic
AI-assisted contract review	Tinjauan kontrak berbantuan AI
LE-DOCS vault, 20 GB, with expiry reminders	Brankas LE-DOCS, 20 GB, dengan pengingat masa berlaku
Basic LE-LEGACY	LE-LEGACY dasar
Phase 2 · 2028	Fase 2 · 2028
Legal Protection Plan · Retail	Legal Protection Plan · Ritel
/ month premium	/ bulan premi
Cover for legal costs, issued by an OJK-licensed insurer.	Perlindungan biaya hukum, diterbitkan oleh perusahaan asuransi berizin OJK.
Up to Rp25 million per case	Hingga Rp25 juta per perkara
Up to Rp50 million per year	Hingga Rp50 juta per tahun
90-day waiting period, 10% own risk	Masa tunggu 90 hari, risiko sendiri 10%
Premium paid to the insurer	Premi dibayarkan ke perusahaan asuransi
/ employee / month	/ karyawan / bulan
Paid by the employer as a benefit for the whole team.	Dibayar pemberi kerja sebagai tunjangan untuk seluruh tim.
All Plus features	Semua fitur Plus
One 30-minute advocate consultation a year	Satu konsultasi advokat 30 menit per tahun
Legal education sessions	Sesi edukasi hukum
Option to add group Legal Protection Plan	Opsi menambah Legal Protection Plan grup
Advocate and notary fees go to them in full and are shown before you book.	Biaya advokat dan notaris diterima penuh oleh mereka dan ditampilkan sebelum Anda memesan.
Platform fee per paid consultation	Biaya platform per konsultasi berbayar
LE-LEGACY setup package	Paket penyiapan LE-LEGACY
Advocate fee	Biaya advokat
Set by the advocate	Ditentukan advokat
Notary fee	Biaya notaris
Set by the notary	Ditentukan notaris
Employee	Karyawan
Legal check-up and education	Cek hukum dan edukasi
Included	Termasuk
LE-DOCS storage	Penyimpanan LE-DOCS
Not included	Tidak termasuk
Expiry reminders	Pengingat masa berlaku
Advocate consultation included	Termasuk konsultasi advokat
1 × 30 min / year	1 × 30 menit / tahun
Rp29,000 / month	Rp29.000 / bulan
Rp15,000 / employee / month	Rp15.000 / karyawan / bulan
The Legal Protection Plan is insurance and can be added to any plan once it launches.	Legal Protection Plan adalah produk asuransi dan bisa ditambahkan ke paket apa pun setelah diluncurkan.
Guides for registration, account verification, the Legal Protection Plan, documents, claims and using the platform.	Panduan tentang pendaftaran, verifikasi akun, Legal Protection Plan, dokumen, klaim, dan penggunaan platform.
Registration	Pendaftaran
Account verification	Verifikasi akun
Claims	Klaim
Using the platform	Penggunaan platform
How do I create an account?	Bagaimana cara membuat akun?
Tap Register, then enter your full name, email, phone number and a password. We send a 6-digit code to your email or phone to confirm it is you.	Ketuk Daftar, lalu masukkan nama lengkap, email, nomor telepon, dan kata sandi. Kami mengirim kode 6 digit ke email atau ponsel Anda untuk memastikan itu memang Anda.
I did not receive the verification code.	Saya tidak menerima kode verifikasi.
Wait one minute, check your spam folder, then tap Resend. You can also switch between email and SMS on the same screen.	Tunggu satu menit, periksa folder spam, lalu ketuk Kirim ulang. Anda juga bisa beralih antara email dan SMS di layar yang sama.
Why do I need two-factor authentication?	Mengapa saya perlu autentikasi dua faktor?
A second step at sign-in protects your documents even if your password leaks. You can use a passkey or an authenticator app.	Langkah kedua saat masuk melindungi dokumen Anda walaupun kata sandi bocor. Anda bisa memakai passkey atau aplikasi autentikator.
What is e-KYC and when do I need it?	Apa itu e-KYC dan kapan saya membutuhkannya?
e-KYC checks your KTP and a quick face scan. It is needed for partner advocates, the Legal Protection Plan and LE-LEGACY.	e-KYC memeriksa KTP Anda dan pemindaian wajah singkat. Ini diperlukan untuk advokat mitra, Legal Protection Plan, dan LE-LEGACY.
What does the Legal Protection Plan cover?	Apa saja yang ditanggung Legal Protection Plan?
Legal costs for employment, rental housing, consumer and digital transaction, and personal contract disputes, up to the limits in the policy.	Biaya hukum untuk sengketa ketenagakerjaan, sewa tempat tinggal, konsumen dan transaksi digital, serta kontrak pribadi, hingga batas di polis.
Who issues the policy?	Siapa yang menerbitkan polis?
An OJK-licensed insurance partner issues the policy and decides claims. Le-Insure does not underwrite insurance.	Mitra asuransi berizin OJK menerbitkan polis dan memutuskan klaim. Le-Insure tidak menanggung asuransi.
Is LE-DOCS secure?	Apakah LE-DOCS aman?
Files are encrypted and shared only when you choose. Every share has an end date and can be revoked in Privacy.	File dienkripsi dan hanya dibagikan saat Anda memilih. Setiap pembagian punya tanggal berakhir dan bisa dicabut di Privasi.
Can LE-LEGACY make my will?	Bisakah LE-LEGACY membuat wasiat saya?
No. LE-LEGACY organizes your assets and beneficiaries. A will or deed is made with a notary under the law.	Tidak. LE-LEGACY merapikan aset dan ahli waris Anda. Wasiat atau akta dibuat di hadapan notaris sesuai hukum.
How do I make a claim?	Bagaimana cara mengajukan klaim?
Notify the insurer through Le-Insure as soon as a covered dispute starts, prepare your documents, then the insurer reviews and decides.	Beri tahu perusahaan asuransi melalui Le-Insure segera setelah sengketa yang ditanggung dimulai, siapkan dokumen Anda, lalu perusahaan asuransi meninjau dan memutuskan.
Ask the insurer to review the decision. If you are still not satisfied, you can use the OJK consumer complaint service.	Minta perusahaan asuransi meninjau ulang keputusannya. Jika masih belum puas, Anda bisa menggunakan layanan pengaduan konsumen OJK.
How do I find an advocate?	Bagaimana cara menemukan advokat?
Open My Protection, then Find an Advocate. Filter by field and city, and see each fee before you book.	Buka Perlindungan Saya, lalu Cari Advokat. Saring berdasarkan bidang dan kota, dan lihat biaya masing-masing sebelum memesan.
How much does Le-Insure cost?	Berapa biaya Le-Insure?
Basic is free. Plus is Rp29,000 per month. The Employee Package is Rp15,000 per employee per month, paid by the employer.	Basic gratis. Plus Rp29.000 per bulan. Paket Karyawan Rp15.000 per karyawan per bulan, dibayar oleh pemberi kerja.
Choose the channel that suits you. For urgent legal deadlines, mention the date in your message.	Pilih saluran yang cocok untuk Anda. Untuk tenggat hukum yang mendesak, sebutkan tanggalnya di pesan Anda.
Every day, 08:00 to 20:00 WIB. Usually answered within 5 minutes.	Setiap hari, 08.00 sampai 20.00 WIB. Biasanya dijawab dalam 5 menit.
We reply within 1 working day. Address will be confirmed at launch.	Kami membalas dalam 1 hari kerja. Alamat akan dikonfirmasi saat peluncuran.
Monday to Friday, 09:00 to 17:00 WIB. Number will be confirmed at launch.	Senin sampai Jumat, 09.00 sampai 17.00 WIB. Nomor akan dikonfirmasi saat peluncuran.
You get a ticket number right away, and updates by email.	Anda langsung mendapat nomor tiket, dan pembaruan lewat email.
Complaints about a claim	Pengaduan tentang klaim
Ask the insurer to review first. If you are not satisfied, you can use the OJK consumer complaint service.	Minta perusahaan asuransi meninjau ulang terlebih dahulu. Jika belum puas, Anda bisa menggunakan layanan pengaduan konsumen OJK.
Billing	Tagihan
Prepared before. Protected during. Preserved after.	Siap sebelumnya. Terlindungi saat terjadi. Terjaga sesudahnya.
Welcome back	Selamat datang kembali
Continue your protection journey with Le-Insure.	Lanjutkan perjalanan perlindungan Anda bersama Le-Insure.
Email address	Alamat email
Password	Kata sandi
Remember me	Ingat saya
Forgot password?	Lupa kata sandi?
Log in	Masuk
or continue with	atau lanjutkan dengan
Don't have an account?	Belum punya akun?
Register here	Daftar di sini
Preview: your details stay in this browser and are never sent anywhere.	Pratinjau: data Anda tetap di browser ini dan tidak pernah dikirim ke mana pun.
One place for your documents, your advocate and your family's plan.	Satu tempat untuk dokumen Anda, advokat Anda, dan rencana keluarga Anda.
Start free with Le-Insure Basic	Mulai gratis dengan Le-Insure Basic
Account	Akun
Verify	Verifikasi
Identity	Identitas
Access	Akses
Create your account	Buat akun Anda
Start your digital protection journey with Le-Insure.	Mulai perjalanan perlindungan digital Anda bersama Le-Insure.
Phone number	Nomor telepon
Use 8+ characters with a mix of letters, numbers and symbols.	Gunakan 8+ karakter dengan campuran huruf, angka, dan simbol.
Confirm password	Konfirmasi kata sandi
I agree to the	Saya menyetujui
Terms of Service	Ketentuan Layanan
Privacy Policy	Kebijakan Privasi
of Le-Insure.	Le-Insure.
Create account	Buat akun
Already have an account?	Sudah punya akun?
Log in here	Masuk di sini
Le-Insure is a technology platform. It does not underwrite insurance, provide legal advice or guarantee legal outcomes. Insurance products are provided by OJK-licensed insurance companies, legal services by partner advocates, and deeds, including wills, by partner notaries. LE-LEGACY does not replace a will.	Le-Insure adalah platform teknologi. Le-Insure tidak menanggung asuransi, tidak memberi nasihat hukum, dan tidak menjamin hasil hukum. Produk asuransi disediakan oleh perusahaan asuransi berizin OJK, layanan hukum oleh advokat mitra, dan akta, termasuk wasiat, oleh notaris mitra. LE-LEGACY tidak menggantikan wasiat.
© 2026 Le-Insure · Innovation concept by Group 4, KIKD 2026, Vocational School, Universitas Indonesia. Preview site; forms do not send data.	© 2026 Le-Insure · Konsep inovasi oleh Kelompok 4, KIKD 2026, Sekolah Vokasi, Universitas Indonesia. Situs pratinjau; formulir tidak mengirim data.
Carry the risk and issue the policy	Menanggung risiko dan menerbitkan polis
Le-Insure home	Beranda Le-Insure
Switch to dark theme	Ganti ke tema gelap
Search	Cari
Open menu	Buka menu
Language	Bahasa
Mobile	Seluler
Rotating 3D globe from the Le-Insure logo.	Globe 3D berputar dari logo Le-Insure.
Service stages	Tahapan layanan
About sections	Bagian halaman Tentang
A holographic judge's gavel strikes beside a holographic globe.	Palu hakim hologram mengetuk di samping globe hologram.
Le-Insure at the centre of six partner types	Le-Insure di pusat enam jenis mitra
Billing period	Periode tagihan
Plan comparison	Perbandingan paket
Search help articles	Cari artikel bantuan
Close chat	Tutup obrolan
Your question	Pertanyaan Anda
Open help chat	Buka obrolan bantuan
Close and go back to home	Tutup dan kembali ke beranda
Show password	Tampilkan kata sandi
Registration steps	Langkah pendaftaran
Account navigation	Navigasi akun
Account sections	Bagian akun
Back to top	Kembali ke atas
Prepare · Before a problem starts	Siapkan · Sebelum masalah muncul
A short check-up shows where you stand. Plain-language guides then explain your rights at work, at home and online, so you know what to look out for.	Pemeriksaan singkat menunjukkan posisi Anda. Panduan berbahasa sederhana lalu menjelaskan hak Anda di tempat kerja, di rumah, dan di dunia online, agar Anda tahu apa yang perlu diwaspadai.
Free on Basic	Gratis di Basic
What you can do	Yang bisa Anda lakukan
Take a 5-question readiness check and get a score	Ikuti cek kesiapan 5 pertanyaan dan dapatkan skor
Read guides on employment, rental, consumer and inheritance basics	Baca panduan dasar ketenagakerjaan, sewa-menyewa, konsumen, dan waris
Get reminders to review important documents and contracts	Dapatkan pengingat untuk meninjau dokumen dan kontrak penting
Available to everyone on the free plan	Tersedia untuk semua orang di paket gratis
Who does what	Siapa melakukan apa
Builds the check-up and curates the education content	Menyusun cek hukum dan mengkurasi konten edukasi
Learn at your own pace and act on the next steps	Belajar sesuai kecepatan Anda dan jalankan langkah berikutnya
Content is general education. It is not legal advice.	Konten ini edukasi umum. Bukan nasihat hukum.
Previous	Sebelumnya
Next	Berikutnya
Close	Tutup
Upload a work, rental or purchase contract. AI highlights clauses that deserve attention, such as deposits, termination, penalties and auto-renewal.	Unggah kontrak kerja, sewa, atau jual beli. AI menyorot klausul yang perlu diperhatikan, seperti deposit, pemutusan, denda, dan perpanjangan otomatis.
Upload a PDF or a photo of your contract	Unggah PDF atau foto kontrak Anda
See flagged clauses with a plain-language explanation of what that type of clause usually means	Lihat klausul yang ditandai beserta penjelasan sederhana tentang arti klausul semacam itu
Save the contract to LE-DOCS with its key dates	Simpan kontrak ke LE-DOCS beserta tanggal-tanggal pentingnya
Ask a partner advocate to review it if something looks wrong	Minta advokat mitra meninjaunya jika ada yang terasa janggal
Runs the AI that flags clauses for review	Menjalankan AI yang menandai klausul untuk ditinjau
Gives legal advice if you want it	Memberi nasihat hukum jika Anda menginginkannya
Rp29,000/month	Rp29.000/bulan
The AI only flags clauses for review. It does not give legal advice.	AI hanya menandai klausul untuk ditinjau. AI tidak memberi nasihat hukum.
Keep your ID, family card, certificates, contracts and policies in one encrypted place, organized by category, with reminders before anything expires.	Simpan KTP, KK, sertifikat, kontrak, dan polis Anda di satu tempat terenkripsi, tersusun per kategori, dengan pengingat sebelum masa berlakunya habis.
Also part of Preserve	Juga bagian dari Lestarikan
Store documents encrypted, organized by category	Simpan dokumen secara terenkripsi, tersusun per kategori
Get reminders before IDs, leases and contracts expire	Dapatkan pengingat sebelum KTP, kontrak sewa, dan kontrak kerja habis masa berlakunya
Use the same vault for LE-LEGACY so your family can find what matters	Gunakan brankas yang sama untuk LE-LEGACY agar keluarga bisa menemukan hal yang penting
Stores and encrypts your files, sends reminders	Menyimpan dan mengenkripsi file Anda, mengirim pengingat
Decide what to store and who can see it	Memutuskan apa yang disimpan dan siapa yang boleh melihat
From free	Mulai dari gratis
Protect · When a problem happens	Lindungi · Saat masalah terjadi
Answer a few guided questions about what happened. AI sorts the issue and a person reviews it, then you see which documents you need and what your options are.	Jawab beberapa pertanyaan terpandu tentang apa yang terjadi. AI memilah masalahnya dan seorang peninjau memeriksanya, lalu Anda melihat dokumen yang diperlukan dan pilihan yang Anda miliki.
Initial triage free	Triase awal gratis
Describe your issue through guided questions	Jelaskan masalah Anda melalui pertanyaan terpandu
Get the issue sorted by type, such as employment, rental or consumer dispute	Masalah dipilah berdasarkan jenis, seperti sengketa ketenagakerjaan, sewa, atau konsumen
See the documents you need and your possible next steps	Lihat dokumen yang diperlukan dan kemungkinan langkah berikutnya
Go straight to a matching partner advocate	Langsung ke advokat mitra yang sesuai
AI triage with human review	Triase AI dengan peninjauan manusia
Takes over when you need advice	Mengambil alih saat Anda butuh nasihat
Initial triage	Triase awal
Triage routes you to the right help. It is not legal advice.	Triase mengarahkan Anda ke bantuan yang tepat. Ini bukan nasihat hukum.
Get matched with a verified partner advocate who fits your issue. You see their fee before you book, and they receive it in full.	Dapatkan advokat mitra terverifikasi yang cocok dengan masalah Anda. Anda melihat biayanya sebelum memesan, dan biaya itu diterima penuh oleh advokat.
Pay per session	Bayar per sesi
Get matched by issue type and location	Dicocokkan berdasarkan jenis masalah dan lokasi
See the advocate's fee before you book	Lihat biaya advokat sebelum memesan
Meet by video, phone or in person	Bertemu lewat video, telepon, atau tatap muka
Gives legal advice and represents you	Memberi nasihat hukum dan mendampingi Anda
Verifies advocates, handles matching and scheduling	Memverifikasi advokat, mengatur pencocokan dan penjadwalan
The advocate's fee is separate and goes to them in full. The Employee Package includes one 30-minute consultation per employee per year.	Biaya advokat terpisah dan diterima penuh oleh advokat. Paket Karyawan sudah termasuk satu konsultasi 30 menit per karyawan per tahun.
Insurance that helps pay legal costs when you face a covered dispute. The policy is issued by an OJK-licensed insurance partner, who also decides claims.	Asuransi yang membantu membayar biaya hukum saat Anda menghadapi sengketa yang ditanggung. Polis diterbitkan oleh mitra asuransi berizin OJK, yang juga memutuskan klaim.
Premium paid to insurer	Premi dibayarkan ke perusahaan asuransi
Cover for employment, rental housing, consumer and digital transaction, and personal contract disputes	Menanggung sengketa ketenagakerjaan, sewa tempat tinggal, konsumen dan transaksi digital, serta kontrak pribadi
Up to Rp25 million per case and Rp50 million per year (illustrative)	Hingga Rp25 juta per perkara dan Rp50 juta per tahun (ilustrasi)
90-day waiting period and 10% own risk	Masa tunggu 90 hari dan risiko sendiri 10%
Excludes disputes that began before the policy, intentional crimes and claims without reasonable grounds	Tidak menanggung sengketa yang dimulai sebelum polis, tindak pidana yang disengaja, dan klaim tanpa dasar yang wajar
Underwrites, issues the policy and decides claims	Menanggung risiko, menerbitkan polis, dan memutuskan klaim
Explains the cover and helps you prepare a claim	Menjelaskan cakupan dan membantu Anda menyiapkan klaim
Retail premium (illustrative)	Premi ritel (ilustrasi)
Rp40,000/month	Rp40.000/bulan
Le-Insure does not underwrite insurance. Final terms are set by the insurer.	Le-Insure tidak menanggung asuransi. Ketentuan akhir ditetapkan oleh perusahaan asuransi.
Once you are working with an advocate, every step of your case shows up in one timeline, so you always know what is happening and what is needed from you.	Setelah Anda bekerja sama dengan advokat, setiap tahap kasus Anda tampil dalam satu lini waktu, jadi Anda selalu tahu apa yang sedang terjadi dan apa yang dibutuhkan dari Anda.
See the status of your case at a glance	Lihat status kasus Anda sekilas
Know which documents are needed and by when	Ketahui dokumen yang diperlukan dan batas waktunya
Get reminders before deadlines	Dapatkan pengingat sebelum tenggat
Track response times against agreed service levels	Pantau waktu respons terhadap standar layanan yang disepakati
Updates the case and handles the legal work	Memperbarui kasus dan menangani pekerjaan hukumnya
Keeps the timeline, reminders and documents together	Menyatukan lini waktu, pengingat, dan dokumen
Preserve · For the people after you	Lestarikan · Untuk orang-orang setelah Anda
Organize what you own and where your documents are, record who should receive what, and choose who can access your vault in an emergency. When you want a will, book a partner notary with everything ready.	Rapikan apa yang Anda miliki dan di mana dokumen Anda berada, catat siapa yang berhak menerima apa, dan pilih siapa yang bisa mengakses brankas Anda dalam keadaan darurat. Saat Anda ingin membuat wasiat, pesan notaris mitra dengan semuanya sudah siap.
Basic in Phase 1 · notary in Phase 3	Basic di Fase 1 · notaris di Fase 3
Plus + setup package	Plus + paket penyiapan
Map your property, accounts, policies and valuables	Petakan properti, rekening, polis, dan barang berharga Anda
Record beneficiaries and their relationship to you	Catat ahli waris dan hubungan mereka dengan Anda
Set emergency access for trusted people, with identity checks	Atur akses darurat untuk orang tepercaya, dengan pemeriksaan identitas
Partner notary	Notaris mitra
Makes the will or deed under Indonesian law	Membuat wasiat atau akta sesuai hukum Indonesia
Organizes your information and prepares the file	Merapikan informasi Anda dan menyiapkan berkasnya
Legacy setup package (platform fee)	Paket penyiapan warisan (biaya platform)
LE-LEGACY does not replace a will. A will follows the Civil Code, the Compilation of Islamic Law or customary law, and a will in deed form is made before a notary. The notary's fee is paid directly to the notary.	LE-LEGACY tidak menggantikan wasiat. Wasiat mengikuti KUH Perdata, Kompilasi Hukum Islam, atau hukum adat, dan wasiat dalam bentuk akta dibuat di hadapan notaris. Biaya notaris dibayarkan langsung kepada notaris.
Pick a trusted person and a waiting period, for example 7 days. If a request comes in, you can cancel it during that time, and they only see what you have marked as shareable.	Pilih orang tepercaya dan masa tunggu, misalnya 7 hari. Jika ada permintaan masuk, Anda bisa membatalkannya selama masa itu, dan mereka hanya melihat apa yang Anda tandai boleh dibagikan.
General education, not legal advice.	Edukasi umum, bukan nasihat hukum.
A second step at sign-in keeps your vault safe even if your password leaks. Passkeys use Face ID, a fingerprint or your device PIN, and cannot be phished like a one-time code.	Langkah kedua saat masuk menjaga brankas Anda tetap aman walaupun kata sandi bocor. Passkey memakai Face ID, sidik jari, atau PIN perangkat, dan tidak bisa dicuri lewat phishing seperti kode sekali pakai.
Marriage, birth and moving house should be reflected in your KK. An outdated card can slow down claims, enrolment and inheritance paperwork when you can least afford the delay.	Pernikahan, kelahiran, dan pindah rumah perlu tercatat di KK Anda. KK yang tidak mutakhir bisa memperlambat klaim, pendaftaran sekolah, dan urusan warisan tepat saat Anda tidak bisa menunggu.
Partner advocates on Le-Insure show their fee upfront, and the platform fee is shown separately. Ask what the fee covers, such as follow-up questions or a short written summary.	Advokat mitra di Le-Insure menampilkan biayanya di muka, dan biaya platform ditampilkan terpisah. Tanyakan apa saja yang termasuk dalam biaya itu, seperti pertanyaan lanjutan atau ringkasan tertulis singkat.
Many leases and service contracts renew unless you give notice 30 to 60 days before the end date. Put the notice date in your calendar and ask the other side to confirm in writing.	Banyak kontrak sewa dan kontrak layanan diperpanjang otomatis kecuali Anda memberi pemberitahuan 30 sampai 60 hari sebelum tanggal berakhir. Catat tanggal pemberitahuan di kalender dan minta pihak lain mengonfirmasi secara tertulis.
Keep the original certificate in a safe place and a scanned copy in LE-DOCS. Check that the name on the certificate matches your ID, and keep the PBB tax records together with it.	Simpan sertifikat asli di tempat aman dan salinan pindaiannya di LE-DOCS. Pastikan nama di sertifikat sama dengan KTP Anda, dan simpan bukti pajak PBB bersamanya.
LE-LEGACY organizes what you own, where the proof is kept and who it is for. The will itself is made with a notary under the Civil Code, the Compilation of Islamic Law or customary law.	LE-LEGACY merapikan apa yang Anda miliki, di mana buktinya disimpan, dan untuk siapa. Wasiatnya sendiri dibuat di hadapan notaris sesuai KUH Perdata, Kompilasi Hukum Islam, atau hukum adat.
Chats, order pages and payment proof are the evidence a consumer complaint relies on. Pay through the platform instead of a direct transfer, and note the return and complaint window before it closes.	Percakapan, halaman pesanan, dan bukti pembayaran adalah bukti yang menjadi dasar pengaduan konsumen. Bayar melalui platform alih-alih transfer langsung, dan catat batas waktu pengembalian dan pengaduan sebelum habis.
PKWT and PKWTT contracts end differently. Knowing which one you have tells you what notice and severance to expect, and which documents to keep, such as payslips from the last 12 months.	Kontrak PKWT dan PKWTT berakhir dengan cara berbeda. Mengetahui jenis kontrak Anda memberi tahu pemberitahuan dan pesangon yang bisa diharapkan, serta dokumen yang perlu disimpan, seperti slip gaji 12 bulan terakhir.
A transfer slip or signed receipt is often the only proof you need to get a rental deposit back. Photograph the unit on the day you move in and the day you move out, and keep both sets of photos with the lease in LE-DOCS.	Bukti transfer atau kuitansi bertanda tangan sering kali menjadi satu-satunya bukti untuk mendapatkan deposit sewa kembali. Foto unitnya pada hari Anda masuk dan hari Anda keluar, dan simpan kedua set foto bersama kontrak sewa di LE-DOCS.
Your documents are encrypted and shared only with your permission. We follow Indonesia's Personal Data Protection Law (UU PDP). The full policy will be published before launch.	Dokumen Anda dienkripsi dan hanya dibagikan dengan izin Anda. Kami mematuhi Undang-Undang Pelindungan Data Pribadi (UU PDP). Kebijakan lengkap akan diterbitkan sebelum peluncuran.
Le-Insure is a technology platform. Insurance is provided by OJK-licensed insurers, legal services by partner advocates, and deeds by partner notaries. Le-Insure does not give legal advice or guarantee legal outcomes. The full terms will be published before launch.	Le-Insure adalah platform teknologi. Asuransi disediakan oleh perusahaan asuransi berizin OJK, layanan hukum oleh advokat mitra, dan akta oleh notaris mitra. Le-Insure tidak memberi nasihat hukum dan tidak menjamin hasil hukum. Ketentuan lengkap akan diterbitkan sebelum peluncuran.
Readiness check-up	Cek kesiapan
Do you keep digital copies of your ID, family card and key documents in one secure place?	Apakah Anda menyimpan salinan digital KTP, KK, dan dokumen penting di satu tempat yang aman?
Yes	Ya
Not sure	Tidak yakin
Your answer	Jawaban Anda
Have you read the key clauses of your work or rental contract?	Apakah Anda sudah membaca klausul penting di kontrak kerja atau kontrak sewa Anda?
Back	Kembali
If a legal problem came up tomorrow, would you know who to contact?	Jika besok muncul masalah hukum, apakah Anda tahu harus menghubungi siapa?
Could your household handle unexpected legal costs without strain?	Apakah rumah tangga Anda sanggup menanggung biaya hukum tak terduga tanpa kesulitan?
Your result	Hasil Anda
Well prepared	Sudah siap
You have the basics in place. Keep documents current and review once a year.	Hal-hal dasar sudah Anda siapkan. Jaga dokumen tetap mutakhir dan tinjau setahun sekali.
Retake	Ulangi
For general education only. This is not legal advice.	Hanya untuk edukasi umum. Ini bukan nasihat hukum.
Getting started	Baru memulai
Most people start here. Small steps now make a big difference later.	Kebanyakan orang mulai dari sini. Langkah kecil sekarang membawa perbedaan besar nanti.
Where Le-Insure can help	Di mana Le-Insure bisa membantu
LE-DOCS vault	Brankas LE-DOCS
Store documents encrypted, with reminders before they expire.	Simpan dokumen secara terenkripsi, dengan pengingat sebelum masa berlakunya habis.
Flags clauses worth a second look before you sign. Not legal advice.	Menandai klausul yang perlu dicermati sebelum Anda menandatangani. Bukan nasihat hukum.
Legal triage and partner advocates	Triase hukum dan advokat mitra
Sort the issue quickly, then book a verified advocate with the fee shown upfront.	Pilah masalahnya dengan cepat, lalu pesan advokat terverifikasi dengan biaya yang ditampilkan di muka.
Section	Bagian
Introducing Le-Insure: one platform for your legal, document, and legacy needs	Mengenal Le-Insure: satu platform untuk kebutuhan hukum, dokumen, dan warisan Anda
Insights	Wawasan
Why legal protection matters in everyday life	Mengapa perlindungan hukum penting dalam kehidupan sehari-hari
Planning your legacy early: a smarter step for the future	Merencanakan warisan sejak dini: langkah cerdas untuk masa depan
/ year	/ tahun
Tell us about your company and we will get in touch.	Ceritakan tentang perusahaan Anda dan kami akan menghubungi Anda.
Company name	Nama perusahaan
Work email	Email kantor
Number of employees	Jumlah karyawan
Under 50	Di bawah 50
50 to 250	50 sampai 250
250 to 1,000	250 sampai 1.000
Over 1,000	Lebih dari 1.000
Legal Check-up	Cek Hukum
AI Contract Review	Tinjauan Kontrak AI
Legacy Planning	Perencanaan Warisan
My Cases	Kasus Saya
Finance	Keuangan
Notifications	Notifikasi
Feedback	Masukan
Account & Security	Akun & Keamanan
Profile	Profil
Security	Keamanan
Sample data for this preview	Data contoh untuk pratinjau ini
Account status	Status akun
Verified	Terverifikasi
Contact	Kontak
Finish verification	Selesaikan verifikasi
Membership plan	Paket keanggotaan
Free: check-up, triage, 1 GB vault.	Gratis: cek hukum, triase, brankas 1 GB.
Security status	Status keamanan
2FA disabled	2FA nonaktif
Add a second step at sign-in to protect your documents.	Tambahkan langkah kedua saat masuk untuk melindungi dokumen Anda.
Turn on 2FA	Aktifkan 2FA
Quick actions	Aksi cepat
Start legal check-up	Mulai cek hukum
Review contract	Tinjau kontrak
Upload document	Unggah dokumen
Report legal issue	Laporkan masalah hukum
View my cases	Lihat kasus saya
Money at a glance	Ringkasan keuangan
Budget this month	Anggaran bulan ini
of Rp1,000,000	dari Rp1.000.000
Details	Detail
Payout snapshot	Ringkasan pencairan
received to BCA •••• 4821	diterima ke BCA •••• 4821
Pending	Tertunda
Next payout	Pencairan berikutnya
Financial summary · 30 days	Ringkasan keuangan · 30 hari
Spent	Pengeluaran
Paid out to you	Dibayarkan kepada Anda
Net	Bersih
Latest transactions	Transaksi terbaru
View all	Lihat semua
Refund · duplicate platform fee	Pengembalian dana · biaya platform ganda
Consultation · Adv. Rina Kusuma	Konsultasi · Adv. Rina Kusuma
Paid	Dibayar
Le-Insure platform fee	Biaya platform Le-Insure
Notification center	Pusat notifikasi
Apartment lease ends in 27 days	Kontrak sewa apartemen berakhir dalam 27 hari
Review the renewal terms before you sign again.	Tinjau ketentuan perpanjangan sebelum menandatangani lagi.
Employment contract ends in 58 days	Kontrak kerja berakhir dalam 58 hari
Check your renewal or severance terms.	Periksa ketentuan perpanjangan atau pesangon Anda.
Case LI-2026-0142: advocate assigned	Kasus LI-2026-0142: advokat ditugaskan
Consultation confirmed	Konsultasi dikonfirmasi
Video call with Adv. Rina Kusuma on 4 Nov 2026 at 10:00.	Panggilan video dengan Adv. Rina Kusuma pada 4 Nov 2026 pukul 10.00.
Quick access	Akses cepat
Check-up, review, triage, cover	Cek hukum, tinjauan, triase, perlindungan
2 beneficiaries	2 ahli waris
1 active	1 aktif
Verified partners, fees upfront	Mitra terverifikasi, biaya di muka
2FA off	2FA mati
Preview another plan	Pratinjau paket lain
Rp29,000/month: contract review, 20 GB vault, Case Tracker.	Rp29.000/bulan: tinjauan kontrak, brankas 20 GB, Case Tracker.
Through your employer: Plus features and one 30-minute consultation a year.	Melalui pemberi kerja: fitur Plus dan satu konsultasi 30 menit per tahun.
Your secure document vault	Brankas dokumen Anda yang aman
Encrypted storage, organized by category, with reminders before anything expires.	Penyimpanan terenkripsi, tersusun per kategori, dengan pengingat sebelum masa berlakunya habis.
All documents	Semua dokumen
Personal documents	Dokumen pribadi
Family documents	Dokumen keluarga
Property & assets	Properti & aset
Contracts	Kontrak
Insurance	Asuransi
Upload	Unggah
KTP (ID card)	KTP (kartu identitas)
No expiry	Tanpa masa berlaku
Passport	Paspor
Valid	Berlaku
Kartu Keluarga (family card)	Kartu Keluarga
Marriage certificate	Akta nikah
Land certificate (SHM)	Sertifikat tanah (SHM)
BPKB motorcycle	BPKB sepeda motor
Employment contract	Kontrak kerja
Apartment lease	Kontrak sewa apartemen
BPJS Kesehatan card	Kartu BPJS Kesehatan
Vehicle insurance policy	Polis asuransi kendaraan
days	hari
Secure storage	Penyimpanan aman
Files are encrypted and shared only when you choose. Every share has an end date and can be revoked.	File dienkripsi dan hanya dibagikan saat Anda memilih. Setiap pembagian punya tanggal berakhir dan bisa dicabut.
Search documents	Cari dokumen
Category for uploads	Kategori untuk unggahan
Help before, during	Bantuan sebelum, selama,
and after a problem	dan setelah masalah
Six tools, from a quick risk check to cover for legal costs.	Enam alat, dari cek risiko singkat sampai perlindungan biaya hukum.
Risk checklist for your situation	Daftar periksa risiko sesuai situasi Anda
Summary and flagged clauses	Ringkasan dan klausul yang ditandai
Report and classify an issue	Laporkan dan klasifikasikan masalah
Partner directory and fees	Direktori mitra dan biayanya
Policy, cover and status	Polis, cakupan, dan status
Status and required documents	Status dan dokumen yang diperlukan
Check-up	Cek hukum
Contract review	Tinjauan kontrak
Triage	Triase
Advocates	Advokat
Your legal risk checklist	Daftar periksa risiko hukum Anda
Tell us about your situation. We build a checklist of what to secure first.	Ceritakan situasi Anda. Kami menyusun daftar hal yang perlu diamankan lebih dulu.
Your situation	Situasi Anda
Select everything that applies.	Pilih semua yang sesuai.
I rent my home	Saya menyewa tempat tinggal
I work under a contract	Saya bekerja dengan kontrak
I own property or a vehicle	Saya memiliki properti atau kendaraan
I am married or have children	Saya sudah menikah atau punya anak
I shop online often	Saya sering belanja online
I run a small business	Saya menjalankan usaha kecil
risk	risiko
High risk	Risiko tinggi
Checklist	Daftar periksa
Keep a signed copy of your lease	Simpan salinan kontrak sewa yang sudah ditandatangani
Photograph the unit at move-in and move-out	Foto unit saat masuk dan saat keluar
Get a receipt for the deposit	Minta kuitansi untuk deposit
Know the notice period to end the lease	Ketahui masa pemberitahuan untuk mengakhiri sewa
Keep your signed employment contract	Simpan kontrak kerja yang sudah ditandatangani
Check if you are on a fixed-term (PKWT) or permanent (PKWTT) contract	Cek apakah kontrak Anda berjangka waktu tertentu (PKWT) atau tetap (PKWTT)
Save payslips from the last 12 months	Simpan slip gaji 12 bulan terakhir
Know your severance terms	Ketahui ketentuan pesangon Anda
Keep the family card (KK) up to date	Jaga Kartu Keluarga (KK) tetap mutakhir
Record beneficiaries in LE-LEGACY	Catat ahli waris di LE-LEGACY
Choose an emergency contact	Pilih kontak darurat
Screenshot orders and seller chats	Tangkap layar pesanan dan percakapan dengan penjual
Pay through the platform, not by direct transfer	Bayar melalui platform, bukan transfer langsung
Know the return and complaint window	Ketahui batas waktu pengembalian dan pengaduan
Store the land certificate original safely and scan it	Simpan sertifikat tanah asli dengan aman dan pindai
Check the certificate name matches your ID	Pastikan nama di sertifikat sama dengan KTP Anda
Keep PBB tax and BPKB records together	Simpan bukti pajak PBB dan BPKB bersama-sama
Use written agreements with clients	Gunakan perjanjian tertulis dengan klien
Register your business (NIB)	Daftarkan usaha Anda (NIB)
Separate business and personal accounts	Pisahkan rekening usaha dan pribadi
Know what you sign	Pahami apa yang Anda tanda tangani
Upload a contract. AI summarizes it and flags clauses worth a second look.	Unggah kontrak. AI meringkasnya dan menandai klausul yang perlu dicermati.
Included in your plan.	Termasuk dalam paket Anda.
Upload a contract	Unggah kontrak
PDF, Word or a photo. Work, rental and purchase contracts work best.	PDF, Word, atau foto. Paling cocok untuk kontrak kerja, sewa, dan jual beli.
Use a sample lease	Pakai contoh kontrak sewa
Reading Sample apartment lease.pdf	Membaca Sample apartment lease.pdf
Finding the parties and dates…	Mencari para pihak dan tanggal…
Answer a few questions. We classify the problem and show your next steps.	Jawab beberapa pertanyaan. Kami mengklasifikasikan masalahnya dan menunjukkan langkah berikutnya.
What is it about?	Tentang apa?
Choose a category	Pilih kategori
Rental / housing	Sewa / tempat tinggal
Consumer / online purchase	Konsumen / pembelian online
Family / inheritance	Keluarga / warisan
Personal contract	Kontrak pribadi
Other	Lainnya
When did it start?	Kapan mulai terjadi?
What happened?	Apa yang terjadi?
Amount at stake (optional)	Nilai yang dipersengketakan (opsional)
How urgent is it?	Seberapa mendesak?
Medium	Sedang
High: a deadline is close	Tinggi: tenggat sudah dekat
Documents you have	Dokumen yang Anda miliki
Contract or agreement	Kontrak atau perjanjian
Receipts or transfers	Kuitansi atau bukti transfer
Chat or email history	Riwayat chat atau email
Photos	Foto
Letters or notices	Surat atau pemberitahuan
Submit for triage	Kirim untuk triase
Verified partner advocates	Advokat mitra terverifikasi
See each advocate's field and fee before you book.	Lihat bidang dan biaya setiap advokat sebelum memesan.
All fields	Semua bidang
Rental & housing	Sewa & tempat tinggal
Consumer & online purchases	Konsumen & pembelian online
Family & inheritance	Keluarga & warisan
Contracts & business	Kontrak & bisnis
All cities	Semua kota
Verified partner	Mitra terverifikasi
per 60-min consultation	per konsultasi 60 menit
Book	Pesan
Fees are illustrative and go to the advocate in full. Le-Insure charges a Rp25,000 platform fee per paid consultation.	Biaya bersifat ilustrasi dan diterima penuh oleh advokat. Le-Insure mengenakan biaya platform Rp25.000 per konsultasi berbayar.
Field	Bidang
City	Kota
Preview: no payment is taken.	Pratinjau: tidak ada pembayaran yang ditarik.
Cover for legal costs	Perlindungan biaya hukum
Issued by an OJK-licensed insurance partner, who also decides claims.	Diterbitkan oleh mitra asuransi berizin OJK, yang juga memutuskan klaim.
Protection status	Status perlindungan
Not active yet	Belum aktif
Policies open in Phase 2 (2028). Join the waitlist and we will tell you first.	Polis dibuka pada Fase 2 (2028). Gabung daftar tunggu dan kami akan memberi tahu Anda lebih dulu.
Not on the waitlist.	Belum masuk daftar tunggu.
Join the waitlist	Gabung daftar tunggu
Policy information (illustrative)	Polis (ilustrasi)
Insurer	Perusahaan asuransi
OJK-licensed partner insurer	Mitra asuransi berizin OJK
Premium	Premi
Covered disputes	Sengketa yang ditanggung
Consumer and digital transactions	Konsumen dan transaksi digital
Not covered	Tidak ditanggung
You are on the waitlist.	Anda sudah masuk daftar tunggu.
Leave waitlist	Keluar dari daftar tunggu
Where each case stands	Posisi setiap kasus
Status and the documents still needed, at a glance.	Status dan dokumen yang masih diperlukan, sekilas.
LI-2026-0142 · Rental / housing	LI-2026-0142 · Sewa / tempat tinggal
Deposit not returned after moving out	Deposit tidak dikembalikan setelah pindah
Open case	Buka kasus
Submitted	Diajukan
Under review	Sedang ditinjau
Advocate assigned	Advokat ditugaskan
In progress	Sedang berjalan
Resolved	Selesai
Required documents	Dokumen yang diperlukan
Lease agreement	Perjanjian sewa
Deposit transfer receipt	Bukti transfer deposit
Chat history with the landlord	Riwayat chat dengan pemilik
Move-out photos	Foto saat keluar
Your legal matters	Urusan hukum Anda
For cases you are handling with a partner advocate.	Untuk kasus yang Anda tangani bersama advokat mitra.
Case ID	ID kasus
Category	Kategori
Assigned advocate	Advokat yang ditugaskan
Urgency	Tingkat urgensi
Received	Diterima
Tap to upload	Ketuk untuk mengunggah
Next steps	Langkah berikutnya
Upload the deposit transfer receipt	Unggah bukti transfer deposit
Join the video consultation on 4 Nov 2026 at 10:00	Ikuti konsultasi video pada 4 Nov 2026 pukul 10.00
Case history	Riwayat kasus
Consultation booked	Konsultasi dipesan
Partner advocate assigned	Advokat mitra ditugaskan
Classified as Rental / housing, medium urgency	Diklasifikasikan sebagai Sewa / tempat tinggal, urgensi sedang
Issue reported through Legal Triage	Masalah dilaporkan melalui Triase Hukum
Deposit transfer receipt uploaded	Bukti transfer deposit diunggah
Deposit transfer receipt added to the case and LE-DOCS.	Bukti transfer deposit ditambahkan ke kasus dan LE-DOCS.
Chat history with the landlord uploaded	Riwayat chat dengan pemilik diunggah
Chat history with the landlord added to the case and LE-DOCS.	Riwayat chat dengan pemilik ditambahkan ke kasus dan LE-DOCS.
Access ends	Akses berakhir
In 7 days	Dalam 7 hari
In 30 days	Dalam 30 hari
Until case closes	Sampai kasus ditutup
Organize what you own, where it is and who it is for, so your family can find what matters.	Rapikan apa yang Anda miliki, di mana letaknya, dan untuk siapa, agar keluarga bisa menemukan hal yang penting.
LE-LEGACY does not make wills.	LE-LEGACY tidak membuat wasiat.
It organizes your information. A will or deed is made through a notary according to the law (Civil Code, Compilation of Islamic Law or customary law).	LE-LEGACY merapikan informasi Anda. Wasiat atau akta dibuat melalui notaris sesuai hukum (KUH Perdata, Kompilasi Hukum Islam, atau hukum adat).
Asset mapping	Pemetaan aset
Document mapping	Pemetaan dokumen
Beneficiaries	Ahli waris
Emergency access	Akses darurat
Notary referral	Rujukan notaris
List what you own and where the proof is kept.	Catat apa yang Anda miliki dan di mana buktinya disimpan.
Apartment unit, South Jakarta	Unit apartemen, Jakarta Selatan
Property · Original certificate in the home safe	Properti · Sertifikat asli di brankas rumah
Remove	Hapus
Savings account	Rekening tabungan
Bank account · Account details stored in LE-DOCS	Rekening bank · Detail rekening tersimpan di LE-DOCS
Motorcycle	Sepeda motor
Vehicle · BPKB stored in LE-DOCS	Kendaraan · BPKB tersimpan di LE-DOCS
Property	Properti
Bank account	Rekening bank
Vehicle	Kendaraan
Investment	Investasi
Valuables	Barang berharga
Add	Tambah
Asset	Aset
Type	Jenis
Where the proof is kept	Tempat bukti disimpan
Where each original is kept, and whether a copy is in LE-DOCS.	Tempat setiap dokumen asli disimpan, dan apakah salinannya ada di LE-DOCS.
Home safe, bedroom	Brankas rumah, kamar tidur
In LE-DOCS	Ada di LE-DOCS
Parents' house, Bandung	Rumah orang tua, Bandung
Life insurance policy	Polis asuransi jiwa
Office drawer	Laci kantor
Not scanned	Belum dipindai
Location	Lokasi
Beneficiary information	Informasi ahli waris
People you want your plan to reach.	Orang-orang yang ingin Anda jangkau dengan rencana ini.
Spouse	Pasangan
Child	Anak
Shares here are your wishes. Legal distribution follows your will and the applicable inheritance law.	Bagian di sini adalah keinginan Anda. Pembagian secara hukum mengikuti wasiat Anda dan hukum waris yang berlaku.
Relationship	Hubungan
Share	Bagian
Choose who can open your vault if something happens to you.	Pilih siapa yang bisa membuka brankas Anda jika terjadi sesuatu pada Anda.
Trusted person · identity check required	Orang tepercaya · wajib pemeriksaan identitas
Trusted person	Orang tepercaya
3 days	3 hari
7 days	7 hari
14 days	14 hari
30 days	30 hari
After a request, you get 7 days to cancel it before access opens. They see only what you mark as shareable.	Setelah ada permintaan, Anda punya 7 hari untuk membatalkannya sebelum akses dibuka. Mereka hanya melihat apa yang Anda tandai boleh dibagikan.
When you are ready to make a will or deed, book a partner notary with your file prepared.	Saat Anda siap membuat wasiat atau akta, pesan notaris mitra dengan berkas yang sudah siap.
South Jakarta · partner notary	Jakarta Selatan · notaris mitra
Request referral	Minta rujukan
Bandung · partner notary	Bandung · notaris mitra
Surabaya · partner notary	Surabaya · notaris mitra
Sample notaries. The notary's fee is paid directly to the notary.	Contoh notaris. Biaya notaris dibayarkan langsung kepada notaris.
Referral requested.	Rujukan diminta.
Your legal money, in one view	Keuangan hukum Anda, dalam satu tampilan
Budget, payouts and every transaction, from advocate fees to refunds.	Anggaran, pencairan, dan setiap transaksi, dari biaya advokat sampai pengembalian dana.
Spent · 30 days	Pengeluaran · 30 hari
Budget left	Sisa anggaran
Pending payouts	Pencairan tertunda
Set budget	Atur anggaran
Refund · cancelled consultation	Pengembalian dana · konsultasi dibatalkan
Paid out	Sudah dicairkan
Employer reimbursement · PT Sample	Penggantian dari pemberi kerja · PT Sample
Claim payouts from the Legal Protection Plan arrive here once policies open in Phase 2 (2028).	Pencairan klaim dari Legal Protection Plan masuk ke sini setelah polis dibuka pada Fase 2 (2028).
Transactions	Transaksi
All	Semua
Payments	Pembayaran
Payouts & refunds	Pencairan & pengembalian dana
Courier for certified copies	Kurir untuk salinan legalisir
Payments go through licensed payment partners. Advocate and notary fees go to them in full.	Pembayaran melalui mitra pembayaran berizin. Biaya advokat dan notaris diterima penuh oleh mereka.
Monthly budget	Anggaran bulanan
Statement prepared. In the live app it downloads as a PDF.	Laporan sudah disiapkan. Di aplikasi asli, laporan diunduh sebagai PDF.
What needs your attention	Yang perlu Anda perhatikan
Reminders, case updates and security alerts in one place.	Pengingat, pembaruan kasus, dan peringatan keamanan di satu tempat.
Contract expiry	Kontrak berakhir
Document expiry	Dokumen kedaluwarsa
Case update	Pembaruan kasus
Appointment	Janji temu
Policy & claims	Polis & klaim
Security alert	Peringatan keamanan
Mark all as read	Tandai semua sudah dibaca
Notary referral requested	Rujukan notaris diminta
You joined the Legal Protection Plan waitlist	Anda bergabung dengan daftar tunggu Legal Protection Plan
We will tell you when policies open in 2028.	Kami akan memberi tahu Anda saat polis dibuka pada 2028.
Legal Protection Plan update	Kabar Legal Protection Plan
Policies open in 2028. You can join the waitlist in My Protection.	Polis dibuka pada 2028. Anda bisa bergabung dengan daftar tunggu di Perlindungan Saya.
New sign-in from Chrome on Windows	Login baru dari Chrome di Windows
Jakarta, Indonesia. If this wasn't you, change your password.	Jakarta, Indonesia. Jika ini bukan Anda, ganti kata sandi Anda.
Notify me about	Beri tahu saya tentang
Help us make Le-Insure better	Bantu kami membuat Le-Insure lebih baik
Tell us what works and what does not. We read every message.	Ceritakan apa yang sudah berjalan baik dan apa yang belum. Kami membaca setiap pesan.
How was your experience?	Bagaimana pengalaman Anda?
Tap a star	Ketuk bintang
App experience	Pengalaman aplikasi
Advocate consultation	Konsultasi advokat
Legacy planning	Perencanaan warisan
Billing and payouts	Tagihan dan pencairan
Your message	Pesan Anda
You can contact me about this	Anda boleh menghubungi saya tentang ini
Send feedback	Kirim masukan
Your feedback	Masukan Anda
Reviewed	Sudah ditinjau
Rating	Penilaian
1 star	1 bintang
2 stars	2 bintang
3 stars	3 bintang
4 stars	4 bintang
5 stars	5 bintang
Your account, protected	Akun Anda, terlindungi
Profile, sign-in security and privacy controls.	Profil, keamanan login, dan pengaturan privasi.
Personal information	Informasi pribadi
Date of birth	Tanggal lahir
Address	Alamat
Save changes	Simpan perubahan
Email and phone	Email dan telepon
No phone yet	Belum ada nomor telepon
Missing	Belum ada
Identity verification	Verifikasi identitas
Needed for advocates, the Protection Plan and LE-LEGACY	Diperlukan untuk advokat, Protection Plan, dan LE-LEGACY
Verify now	Verifikasi sekarang
Change password	Ganti kata sandi
Current password	Kata sandi saat ini
New password	Kata sandi baru
Confirm new password	Konfirmasi kata sandi baru
Update password	Perbarui kata sandi
Two-factor authentication	Autentikasi dua faktor
Disabled	Nonaktif
Add a second step at sign-in	Tambahkan langkah kedua saat masuk
Off	Mati
Set up passkey	Atur passkey
Use authenticator app	Gunakan aplikasi autentikator
Active devices	Perangkat aktif
Log out other devices	Keluarkan perangkat lain
Chrome on Windows	Chrome di Windows
Jakarta · this device	Jakarta · perangkat ini
This device	Perangkat ini
Le-Insure app on iPhone	Aplikasi Le-Insure di iPhone
Jakarta · 2 hours ago	Jakarta · 2 jam lalu
Safari on MacBook	Safari di MacBook
Bandung · 3 days ago	Bandung · 3 hari lalu
Login history	Riwayat login
Success	Berhasil
Unknown browser	Browser tidak dikenal
Blocked	Diblokir
Data access permissions	Izin akses data
Partner advocates can see documents you share in a case	Advokat mitra bisa melihat dokumen yang Anda bagikan dalam sebuah kasus
Partner notaries can see your legacy file when you request a referral	Notaris mitra bisa melihat berkas warisan Anda saat Anda meminta rujukan
Anonymous usage data to improve Le-Insure	Data penggunaan anonim untuk meningkatkan Le-Insure
News and offers by email	Berita dan penawaran lewat email
Document sharing permissions	Izin berbagi dokumen
Revoke	Cabut
Privacy consent and data requests	Persetujuan privasi dan permintaan data
You agreed to the Privacy Policy on 2 Nov 2026. Under Indonesia's Personal Data Protection Law you can request a copy or correction of your data.	Anda menyetujui Kebijakan Privasi pada 2 Nov 2026. Berdasarkan Undang-Undang Pelindungan Data Pribadi, Anda bisa meminta salinan atau koreksi data Anda.
Read Privacy Policy	Baca Kebijakan Privasi
Request a correction	Minta koreksi
Delete account	Hapus akun
This removes your account, documents and legacy plan. It cannot be undone.	Ini menghapus akun, dokumen, dan rencana warisan Anda. Tindakan ini tidak bisa dibatalkan.
Delete my account	Hapus akun saya
Your data export is downloading.	Ekspor data Anda sedang diunduh.
Correction request sent. We reply within 3 working days.	Permintaan koreksi terkirim. Kami membalas dalam 3 hari kerja.
Delete your account?	Hapus akun Anda?
Type DELETE to confirm. Your documents, cases and legacy plan in this browser will be erased.	Ketik DELETE untuk mengonfirmasi. Dokumen, kasus, dan rencana warisan Anda di browser ini akan dihapus.
Delete permanently	Hapus permanen
Type DELETE	Ketik DELETE
You're logged out.	Anda sudah keluar.
2FA turned off.	2FA dimatikan.
Access revoked.	Akses dicabut.
Account created. Welcome to Le-Insure.	Akun dibuat. Selamat datang di Le-Insure.
Add a photo of your KTP first.	Tambahkan foto KTP Anda terlebih dahulu.
Added.	Ditambahkan.
Authenticator linked. 2FA is on.	Aplikasi autentikator terhubung. 2FA aktif.
Authenticator linked. Two-factor protection is on.	Aplikasi autentikator terhubung. Perlindungan dua faktor aktif.
Budget updated.	Anggaran diperbarui.
Choose a JPG or PNG photo of your KTP.	Pilih foto KTP berformat JPG atau PNG.
Complete the face check first.	Selesaikan pemeriksaan wajah terlebih dahulu.
Consultation booked.	Konsultasi dipesan.
Device logged out.	Perangkat dikeluarkan.
Enter a budget of at least Rp50,000.	Masukkan anggaran minimal Rp50.000.
Enter all 6 digits.	Masukkan keenam digit.
Enter your company name and a valid work email.	Masukkan nama perusahaan dan email kantor yang valid.
Fill in the first field.	Isi kolom pertama.
Identity verified.	Identitas terverifikasi.
Log in to see your dashboard.	Masuk untuk melihat dashboard Anda.
Logged out of all other devices.	Semua perangkat lain sudah dikeluarkan.
Passkey created. 2FA is on.	Passkey dibuat. 2FA aktif.
Passkey created. Two-factor protection is on.	Passkey dibuat. Perlindungan dua faktor aktif.
Password updated.	Kata sandi diperbarui.
Profile saved.	Profil disimpan.
Saved to LE-DOCS under Contracts.	Disimpan ke LE-DOCS di kategori Kontrak.
Shared. You can revoke it in Privacy.	Dibagikan. Anda bisa mencabutnya di Privasi.
Thank you. Your feedback was sent.	Terima kasih. Masukan Anda sudah terkirim.
Thanks. Our team will contact you within 2 working days.	Terima kasih. Tim kami akan menghubungi Anda dalam 2 hari kerja.
Type DELETE in capitals to confirm.	Ketik DELETE dengan huruf kapital untuk mengonfirmasi.
Your account was deleted.	Akun Anda sudah dihapus.
Password changed	Kata sandi diganti
If this wasn't you, contact support right away.	Jika ini bukan Anda, segera hubungi tim dukungan.
Two-factor authentication turned off	Autentikasi dua faktor dimatikan
Turn it back on to protect your account.	Aktifkan kembali untuk melindungi akun Anda.
We will review it within 1 working day.	Kami akan meninjaunya dalam 1 hari kerja.
You'll get a video link by email.	Anda akan menerima tautan video lewat email.
Welcome back to Le-Insure.	Selamat datang kembali di Le-Insure.
Start with the items at the top of each group.	Mulailah dari item teratas di setiap kelompok.
Identity checks and secure signing	Pemeriksaan identitas dan tanda tangan aman
Identity checks and secure signing.	Pemeriksaan identitas dan tanda tangan aman.
Carry the risk, issue the policy and decide claims.	Menanggung risiko, menerbitkan polis, dan memutuskan klaim.
Distributes the Legal Protection Plan	Memasarkan Legal Protection Plan
Distributes the Legal Protection Plan.	Memasarkan Legal Protection Plan.
Give legal advice and represent you.	Memberi nasihat hukum dan mendampingi Anda.
Make wills and deeds under Indonesian law.	Membuat wasiat dan akta sesuai hukum Indonesia.
Offer the Employee Package to their teams.	Menawarkan Paket Karyawan kepada tim mereka.
Employee Package for their teams	Paket Karyawan untuk tim mereka
Phase 1	Fase 1
Refund	Pengembalian dana
Reimbursement	Penggantian
KTP, KK and other identity documents	KTP, KK, dan dokumen identitas lainnya
Marriage certificate and family records	Akta nikah dan catatan keluarga
Land certificate, BPKB and asset papers	Sertifikat tanah, BPKB, dan dokumen aset
Work, rental and personal agreements	Perjanjian kerja, sewa, dan pribadi
Policies and protection documents	Polis dan dokumen perlindungan
Book a verified advocate with the fee shown upfront.	Pesan advokat terverifikasi dengan biaya yang ditampilkan di muka.
Share a document securely with your advocate or notary, only when you choose	Bagikan dokumen secara aman kepada advokat atau notaris Anda, hanya saat Anda memilih
Share your documents securely from LE-DOCS	Bagikan dokumen Anda secara aman dari LE-DOCS
Book a partner notary to make a will or deed	Pesan notaris mitra untuk membuat wasiat atau akta
Book a partner advocate	Pesan advokat mitra
Share with	Bagikan kepada
Share securely	Bagikan dengan aman
Download statement	Unduh laporan
Download my data	Unduh data saya
Share your feedback	Kirim masukan Anda
Share documents from LE-DOCS	Bagikan dokumen dari LE-DOCS
Uploading from my phone was easy. Please add folders inside categories.	Mengunggah dari ponsel itu mudah. Tolong tambahkan folder di dalam kategori.
A Le-Insure reviewer checks your report within 1 working day	Peninjau Le-Insure memeriksa laporan Anda dalam 1 hari kerja
A few gaps could become stressful if something goes wrong. Start with the items below.	Beberapa celah bisa menjadi beban jika terjadi masalah. Mulailah dari item di bawah ini.
Partly prepared	Cukup siap
A quick code keeps your account yours.	Kode singkat memastikan akun ini tetap milik Anda.
Account details stored in LE-DOCS	Detail rekening tersimpan di LE-DOCS
Account verified	Akun terverifikasi
Add a mix of upper and lower case, numbers or symbols.	Tambahkan campuran huruf besar dan kecil, angka, atau simbol.
Add a second step at sign-in so only you can open your documents, cases and legacy plan.	Tambahkan langkah kedua saat masuk agar hanya Anda yang bisa membuka dokumen, kasus, dan rencana warisan Anda.
Agree to the terms to create your account.	Setujui ketentuan untuk membuat akun Anda.
Area of interest	Bidang yang diminati
Ask a partner advocate	Tanya advokat mitra
Ask for a list of deductions and a return deadline, such as 14 days after move-out.	Minta rincian potongan dan batas waktu pengembalian, misalnya 14 hari setelah pindah.
Asset map, beneficiaries, emergency access	Peta aset, ahli waris, akses darurat
Authenticator app	Aplikasi autentikator
Authenticator app.	Aplikasi autentikator.
BPKB stored in LE-DOCS	BPKB tersimpan di LE-DOCS
Original certificate in the home safe	Sertifikat asli di brankas rumah
Beneficiary	Ahli waris
Blink once	Berkedip sekali
Blocked: wrong 2FA code	Diblokir: kode 2FA salah
Can't scan? Enter this setup key:	Tidak bisa memindai? Masukkan kunci pengaturan ini:
Cancel	Batal
Change details	Ubah data
Check if this applies after a job transfer or other valid reason.	Cek apakah ini berlaku jika Anda pindah kerja atau ada alasan sah lainnya.
Checking deposit and payment terms…	Memeriksa ketentuan deposit dan pembayaran…
Checking…	Memeriksa…
Choose a category.	Pilih kategori.
Choose a method	Pilih metode
Choose a star rating.	Pilih jumlah bintang.
Common, but agree what counts as normal wear.	Umum, tetapi sepakati apa yang termasuk keausan wajar.
Confirm it's you	Pastikan ini Anda
Confirm with Face ID, fingerprint or your device PIN.	Konfirmasi dengan Face ID, sidik jari, atau PIN perangkat Anda.
Cover for legal costs, issued by an OJK-licensed insurer. Coming in 2028.	Perlindungan biaya hukum, diterbitkan oleh perusahaan asuransi berizin OJK. Hadir pada 2028.
Create a passkey	Buat passkey
Create passkey	Buat passkey
Deeds and wills	Akta dan wasiat
Deposit	Deposit
Deposit can be withheld "for any reason"	Deposit bisa ditahan "dengan alasan apa pun"
Describe what happened in a bit more detail.	Ceritakan kejadiannya sedikit lebih rinci.
Does your family know where your important documents and assets are?	Apakah keluarga Anda tahu di mana dokumen dan aset penting Anda berada?
Done	Selesai
Early exit costs 3 months of rent	Keluar lebih awal dikenai biaya 3 bulan sewa
Education hub	Pusat edukasi
Email confirmed by OTP	Email dikonfirmasi lewat OTP
Phone confirmed by OTP	Telepon dikonfirmasi lewat OTP
Enabled	Aktif
Encrypted document vault	Brankas dokumen terenkripsi
Enter all 6 digits from your app.	Masukkan keenam digit dari aplikasi Anda.
Enter an Indonesian mobile number, like 812 3456 7890.	Masukkan nomor ponsel Indonesia, misalnya 812 3456 7890.
Enter an email like name@example.com.	Masukkan email seperti nama@contoh.com.
Enter the 16-digit NIK from your KTP.	Masukkan 16 digit NIK dari KTP Anda.
Enter the 6-digit code we sent. It confirms the email or phone number really belongs to you.	Masukkan kode 6 digit yang kami kirim. Kode ini memastikan email atau nomor telepon tersebut benar milik Anda.
Enter your 2FA code	Masukkan kode 2FA Anda
Enter your current password.	Masukkan kata sandi Anda saat ini.
Enter your email address.	Masukkan alamat email Anda.
Enter your email first, then tap Forgot password.	Masukkan email Anda dulu, lalu ketuk Lupa kata sandi.
Enter your full name.	Masukkan nama lengkap Anda.
Enter your password.	Masukkan kata sandi Anda.
Enter your phone number.	Masukkan nomor telepon Anda.
Every service is open to you.	Semua layanan terbuka untuk Anda.
Everyday legal issues are ordinary: a final salary that is not paid, a deposit that is not returned, an online purchase that goes wrong.	Masalah hukum sehari-hari itu biasa: gaji terakhir yang tidak dibayar, deposit yang tidak dikembalikan, pembelian online yang bermasalah.
Excellent	Sangat baik
Expired	Kedaluwarsa
Face check	Pemeriksaan wajah
Face check done	Pemeriksaan wajah selesai
Face matched	Wajah cocok
Fair	Cukup
Fair. Add a number or symbol.	Cukup. Tambahkan angka atau simbol.
Fill in	Isi
Find an Advocate	Cari Advokat
Find an advocate	Cari advokat
Find good light and keep your face inside the circle. We match it with your KTP photo.	Cari cahaya yang cukup dan jaga wajah Anda di dalam lingkaran. Kami mencocokkannya dengan foto KTP Anda.
Finish now	Selesaikan sekarang
Flagged clauses	Klausul yang ditandai
Flags clauses to check. Not legal advice.	Menandai klausul untuk diperiksa. Bukan nasihat hukum.
Fully verified	Terverifikasi penuh
Get a 6-digit code from Google Authenticator, Microsoft Authenticator or Authy.	Dapatkan kode 6 digit dari Google Authenticator, Microsoft Authenticator, atau Authy.
Go to my dashboard	Buka dashboard saya
Good	Baik
Good password.	Kata sandi baik.
Great	Sangat baik
Hi, I am the Le-Insure assistant. Ask me about registration, verification, the Legal Protection Plan, documents, claims or using the platform.	Halo, saya asisten Le-Insure. Tanyakan soal registrasi, verifikasi, Legal Protection Plan, dokumen, klaim, atau penggunaan platform.
Hide password	Sembunyikan kata sandi
High	Tinggi
Low	Rendah
Moderate	Sedang
In the live app these checks run through a licensed e-KYC partner. In this preview nothing leaves your browser.	Di aplikasi asli, pemeriksaan ini berjalan melalui mitra e-KYC berizin. Di pratinjau ini, tidak ada data yang keluar dari browser Anda.
Included in Plus. Try it free in this preview.	Termasuk dalam Plus. Coba gratis di pratinjau ini.
Insurance awareness is still developing. SNLIK 2026 puts insurance literacy at 42.84% and inclusion at 29.55%. Clear, plain-language products can help close that gap.	Pemahaman tentang asuransi masih berkembang. SNLIK 2026 mencatat literasi asuransi 42,84% dan inklusi 29,55%. Produk yang jelas dan berbahasa sederhana bisa membantu menutup kesenjangan itu.
JPG or PNG with all four corners visible	JPG atau PNG dengan keempat sudut terlihat
Join	Gabung
Join the talent pool	Gabung ke talent pool
KTP and face check passed	KTP dan pemeriksaan wajah lolos
KTP check and a quick face scan. Preview only: nothing is uploaded.	Pemeriksaan KTP dan pemindaian wajah singkat. Hanya pratinjau: tidak ada yang diunggah.
LE-LEGACY emergency access and notary referral	Akses darurat LE-LEGACY dan rujukan notaris
Le-Insure reviewer	Peninjau Le-Insure
Legal advice and representation	Nasihat dan pendampingan hukum
Legal problems rarely arrive alone. A contract dispute needs documents, a lawyer and money for fees, often all at once. Today these sit in different places.	Masalah hukum jarang datang sendirian. Sengketa kontrak butuh dokumen, pengacara, dan uang untuk biaya, sering kali sekaligus. Saat ini semuanya tersebar di tempat berbeda.
Legal triage	Triase hukum
Link an authenticator app	Hubungkan aplikasi autentikator
Liveness check	Pemeriksaan keaktifan
Location not set	Lokasi belum diatur
Log out of your account?	Keluar dari akun Anda?
Look straight at the screen	Lihat lurus ke layar
Looking for renewal and exit clauses…	Mencari klausul perpanjangan dan pengakhiran…
Manage security	Kelola keamanan
Many families keep important papers on paper only, and heirs often do not know where to find them.	Banyak keluarga menyimpan dokumen penting hanya dalam bentuk kertas, dan ahli waris sering tidak tahu di mana mencarinya.
Map your assets, record beneficiaries and set emergency access.	Petakan aset Anda, catat ahli waris, dan atur akses darurat.
Matching with your KTP photo	Mencocokkan dengan foto KTP Anda
Member	Anggota
My Protection	Perlindungan Saya
New passwords do not match.	Kata sandi baru tidak cocok.
Nice work. Review again when your situation changes.	Kerja bagus. Tinjau lagi saat situasi Anda berubah.
No advocates match these filters.	Tidak ada advokat yang sesuai dengan filter ini.
No answers match. Try the assistant or contact support.	Tidak ada jawaban yang cocok. Coba asisten atau hubungi tim dukungan.
No cases yet. Report an issue through Legal Triage to open one.	Belum ada kasus. Laporkan masalah melalui Triase Hukum untuk membukanya.
No documents match.	Tidak ada dokumen yang cocok.
No matches. Try a shorter word.	Tidak ada hasil. Coba kata yang lebih pendek.
No notifications here.	Tidak ada notifikasi di sini.
No transactions.	Tidak ada transaksi.
Not assigned yet	Belum ditugaskan
Not set up yet	Belum diatur
Not verified	Belum terverifikasi
Not verified yet	Belum terverifikasi
Nothing expires in the next 90 days.	Tidak ada yang kedaluwarsa dalam 90 hari ke depan.
Nothing sent yet.	Belum ada yang dikirim.
Now slightly right	Sekarang sedikit ke kanan
Turn your head slightly left	Tolehkan kepala sedikit ke kiri
Open your authenticator app and type the 6-digit code for Le-Insure.	Buka aplikasi autentikator Anda dan ketik kode 6 digit untuk Le-Insure.
Passkey	Passkey
Passkey created	Passkey dibuat
Passkey on this device	Passkey di perangkat ini
Passkey on this device.	Passkey di perangkat ini.
Passwords are at least 6 characters.	Kata sandi minimal 6 karakter.
Passwords do not match.	Kata sandi tidak cocok.
Plain-language legal guides	Panduan hukum berbahasa sederhana
Poor	Lemah
Preview code:	Kode pratinjau:
Code sent to	Kode dikirim ke
Preview site. Nothing you type here is sent or stored.	Situs pratinjau. Apa pun yang Anda ketik di sini tidak dikirim atau disimpan.
Preview: any 6 digits work here.	Pratinjau: 6 digit apa pun bisa dipakai di sini.
Privacy	Privasi
Protection Plan	Protection Plan
Put a calendar reminder or ask for 30 days.	Pasang pengingat di kalender atau minta 30 hari.
Re-enter your password.	Masukkan ulang kata sandi Anda.
Recommended	Disarankan
Renews automatically unless you give notice 60 days before the end	Diperpanjang otomatis kecuali Anda memberi pemberitahuan 60 hari sebelum berakhir
Rent	Sewa
Resend code	Kirim ulang kode
Residential lease	Sewa tempat tinggal
Term	Jangka waktu
12 months	12 bulan
2 months' rent	Sewa 2 bulan
Sample QR code for your authenticator app	Contoh kode QR untuk aplikasi autentikator Anda
Save to LE-DOCS	Simpan ke LE-DOCS
Scan the code, then enter the 6 digits from your app.	Pindai kodenya, lalu masukkan 6 digit dari aplikasi Anda.
Scan this QR code in your authenticator app.	Pindai kode QR ini di aplikasi autentikator Anda.
Select a situation to see your checklist.	Pilih situasi untuk melihat daftar periksa Anda.
Services open up as you finish verification. You can finish the rest any time.	Layanan terbuka saat Anda menyelesaikan verifikasi. Sisanya bisa Anda selesaikan kapan saja.
Set up later	Atur nanti
Sign in with Face ID, fingerprint or your device PIN. Nothing to type.	Masuk dengan Face ID, sidik jari, atau PIN perangkat. Tidak perlu mengetik.
Soon	Segera
Sorts your issue, AI plus human review	Memilah masalah Anda, AI ditambah peninjauan manusia
South Jakarta	Jakarta Selatan
Start e-KYC	Mulai e-KYC
Start face check	Mulai pemeriksaan wajah
Start small: list your documents and assets, decide who should have access in an emergency, and record your beneficiaries.	Mulai dari yang kecil: catat dokumen dan aset Anda, tentukan siapa yang boleh mengakses dalam keadaan darurat, dan catat ahli waris Anda.
Status, deadlines and documents	Status, tenggat, dan dokumen
Step 2 · Verify your account	Langkah 2 · Verifikasi akun Anda
Step 3 · Two-factor protection	Langkah 3 · Perlindungan dua faktor
Step 4 · Identity verification	Langkah 4 · Verifikasi identitas
Step 5 · Your protected services	Langkah 5 · Layanan terlindungi Anda
Strong password.	Kata sandi kuat.
Submit for verification	Kirim untuk verifikasi
Summary	Ringkasan
Switch to light theme	Ganti ke tema terang
Technology and orchestration	Teknologi dan orkestrasi
That code doesn't match. Check it and try again.	Kode tidak cocok. Periksa dan coba lagi.
The 16-digit number on your KTP	Nomor 16 digit di KTP Anda
This is a preview, so no account was created. Accounts open with Phase 1 in 2027.	Ini pratinjau, jadi tidak ada akun yang dibuat. Akun dibuka bersama Fase 1 pada 2027.
To do	Belum
Triage result	Hasil triase
Turn off 2FA	Matikan 2FA
Turn on two-factor	Aktifkan dua faktor
Turn on two-factor protection	Aktifkan perlindungan dua faktor
Two-factor protection	Perlindungan dua faktor
Type the 6-digit code it shows.	Ketik kode 6 digit yang ditampilkan.
Upload a photo of your KTP	Unggah foto KTP Anda
Photo added. Tap to replace.	Foto ditambahkan. Ketuk untuk mengganti.
Use a sample KTP for this preview	Pakai contoh KTP untuk pratinjau ini
Use at least 8 characters.	Gunakan minimal 8 karakter.
Use passkey	Pakai passkey
Use the passkey on this device: Face ID, fingerprint or your PIN.	Pakai passkey di perangkat ini: Face ID, sidik jari, atau PIN Anda.
Verified once, trusted across Le-Insure.	Sekali verifikasi, dipercaya di seluruh Le-Insure.
Verify and log in	Verifikasi dan masuk
Verify later	Verifikasi nanti
Verify your account	Verifikasi akun Anda
Verify your identity	Verifikasi identitas Anda
Verifying…	Memverifikasi…
View all services	Lihat semua layanan
Waiting for your device…	Menunggu perangkat Anda…
We are a technology platform. Insurers carry the risk, advocates give legal advice and notaries make deeds. Our job is to make getting to them simple.	Kami adalah platform teknologi. Perusahaan asuransi menanggung risiko, advokat memberi nasihat hukum, dan notaris membuat akta. Tugas kami membuat Anda mudah menjangkau mereka.
Weak password. Add length and variety.	Kata sandi lemah. Tambah panjang dan variasinya.
Where to send the code	Ke mana kode dikirim
Write a short message.	Tulis pesan singkat.
Writing your summary…	Menulis ringkasan Anda…
You	Anda
You are close to your legal budget.	Anda hampir mencapai anggaran hukum Anda.
You are not sharing any documents.	Anda tidak sedang membagikan dokumen apa pun.
You have no cases. Report an issue through Legal Triage to open one.	Anda belum punya kasus. Laporkan masalah melalui Triase Hukum untuk membukanya.
You'll be signed out and need to log in again to access your dashboard.	Anda akan keluar dan perlu masuk lagi untuk mengakses dashboard.
You're all set	Semua sudah siap
Your KTP	KTP Anda
Your KTP photo	Foto KTP Anda
Your device will ask you to confirm with Face ID, fingerprint or your PIN. The passkey stays on your device.	Perangkat Anda akan meminta konfirmasi dengan Face ID, sidik jari, atau PIN. Passkey tetap tersimpan di perangkat Anda.
Your documents deserve a second lock.	Dokumen Anda layak mendapat kunci kedua.
e-KYC with your KTP and a quick face check. It unlocks advocate bookings, the Legal Protection Plan and LE-LEGACY emergency access.	e-KYC dengan KTP Anda dan pemeriksaan wajah singkat. Ini membuka pemesanan advokat, Legal Protection Plan, dan akses darurat LE-LEGACY.
Le-Insure brings education, a secure document vault, verified advocates, legal cost protection from licensed insurers, and legacy planning into one flow, organized as Prepare, Protect and Preserve.	Le-Insure menyatukan edukasi, brankas dokumen yang aman, advokat terverifikasi, perlindungan biaya hukum dari perusahaan asuransi berizin, dan perencanaan warisan dalam satu alur, tersusun sebagai Siapkan, Lindungi, dan Lestarikan.
Logout	Keluar
Sample apartment lease.pdf	Contoh kontrak sewa apartemen.pdf
Clause 7.2	Klausul 7.2
Clause 3.4	Klausul 3.4
Clause 9.1	Klausul 9.1
Clause 5.3	Klausul 5.3
Tenant pays repairs under Rp500,000	Penyewa menanggung perbaikan di bawah Rp500.000
The cost of help can become a financial shock for a household. In our October 2026 validation survey (n = 39, indicative), 74.4% of respondents said they worry about unexpected legal costs.	Biaya bantuan bisa menjadi guncangan keuangan bagi rumah tangga. Dalam survei validasi kami pada Oktober 2026 (n = 39, indikatif), 74,4% responden mengaku khawatir dengan biaya hukum tak terduga.
When you are ready for a will, meet a notary. A will follows Indonesian law, whether the Civil Code, the Compilation of Islamic Law or customary law. LE-LEGACY helps you prepare; it does not replace a will.	Saat Anda siap membuat wasiat, temui notaris. Wasiat mengikuti hukum Indonesia, baik KUH Perdata, Kompilasi Hukum Islam, maupun hukum adat. LE-LEGACY membantu Anda bersiap; LE-LEGACY tidak menggantikan wasiat.
Medium urgency	Urgensi sedang
High urgency	Urgensi tinggi
Low urgency	Urgensi rendah
and	dan
Our ecosystem	Ekosistem kami
Coming up	Akan datang
Your protection	Perlindungan Anda
Fully protected	Terlindungi penuh
Finish setup to reach 100%	Selesaikan pengaturan untuk mencapai 100%
Tip of the day	Tips hari ini
Keep scans of your KTP and KK in LE-DOCS so they are ready when you need them.	Simpan pindaian KTP dan KK di LE-DOCS agar siap saat dibutuhkan.
Ask for the advocate fee in writing before a consultation starts.	Minta biaya advokat secara tertulis sebelum konsultasi dimulai.
Put contract end dates in your calendar 60 days ahead.	Catat tanggal berakhir kontrak di kalender 60 hari sebelumnya.
Turn on 2FA so a leaked password is not enough to open your vault.	Aktifkan 2FA agar kata sandi yang bocor tidak cukup untuk membuka brankas Anda.
Record your beneficiaries early. It saves your family time later.	Catat ahli waris Anda sejak awal. Ini menghemat waktu keluarga Anda nanti.
Member area	Area anggota
Home	Beranda
Start with LPP	Mulai dengan LPP
Start with Employee Package	Mulai dengan Paket Karyawan
Pick what fits you	Pilih yang cocok untuk Anda
Every plan starts with a free account. Upgrade or cancel any time.	Setiap paket dimulai dengan akun gratis. Upgrade atau berhenti kapan saja.
Best for getting started	Cocok untuk mulai
Best for people with contracts and important papers	Cocok untuk Anda yang punya kontrak dan dokumen penting
Best for companies and their teams	Cocok untuk perusahaan dan timnya
For teams	Untuk tim
Partner advocate referral	Rujukan advokat mitra
Level 3 · Add-on	Level 3 · Tambahan
Insurance for legal costs. Add it to any plan above. Up to Rp25 million per case, issued by an OJK-licensed insurer. Opens in Phase 2 (2028).	Asuransi untuk biaya hukum. Tambahkan ke paket mana pun di atas. Hingga Rp25 juta per perkara, diterbitkan oleh perusahaan asuransi berizin OJK. Dibuka pada Fase 2 (2028).
Insurance by OJK-licensed partners	Asuransi oleh mitra berizin OJK
The Legal Protection Plan is issued and underwritten by a licensed insurance partner, not by Le-Insure.	Legal Protection Plan diterbitkan dan ditanggung oleh mitra asuransi berizin, bukan oleh Le-Insure.
Every advocate is checked before joining. 6 sample advocates in this preview.	Setiap advokat diperiksa sebelum bergabung. 6 advokat contoh di pratinjau ini.
Files are encrypted and shared only when you choose, with an end date.	File dienkripsi dan hanya dibagikan saat Anda memilih, dengan tanggal berakhir.
2FA and e-KYC	2FA dan e-KYC
A second sign-in step and an identity check protect your account.	Langkah kedua saat masuk dan pemeriksaan identitas melindungi akun Anda.
Built for UU PDP	Dirancang sesuai UU PDP
Designed to follow Indonesia's Personal Data Protection Law.	Dirancang untuk mematuhi Undang-Undang Pelindungan Data Pribadi.
Fees shown upfront	Biaya ditampilkan di muka
Advocate and platform fees are shown before you book. No hidden costs.	Biaya advokat dan platform ditampilkan sebelum Anda memesan. Tanpa biaya tersembunyi.
Le-Insure is a technology platform, not an insurer. Partner names will be announced at launch. Advocate numbers are sample data for this preview.	Le-Insure adalah platform teknologi, bukan perusahaan asuransi. Nama mitra akan diumumkan saat peluncuran. Jumlah advokat adalah data contoh untuk pratinjau ini.
Why you can trust Le-Insure	Mengapa Anda bisa memercayai Le-Insure
`;
/* ---------- language: EN / ID ---------- */
const I18N=new Map(I18N_SRC.split('\n').filter(Boolean).map(l=>l.split('\t').map(x=>x.trim())));
const I18N_PH={"Enter your password": "Masukkan kata sandi Anda", "Your full name": "Nama lengkap Anda", "At least 8 characters": "Minimal 8 karakter", "Re-enter your password": "Masukkan ulang kata sandi Anda", "Try “contract”, “advocate” or “legacy”": "Coba “kontrak”, “advokat”, atau “warisan”", "Search documents": "Cari dokumen", "Describe the issue in a few sentences.": "Jelaskan masalahnya dalam beberapa kalimat.", "Asset, e.g. Land in Bogor": "Aset, mis. Tanah di Bogor", "Where is the proof?": "Di mana buktinya?", "Where is the original?": "Di mana dokumen aslinya?", "Relationship": "Hubungan", "Share, e.g. 50%": "Bagian, mis. 50%", "Monthly budget, e.g. 1000000": "Anggaran bulanan, mis. 1000000", "What should we keep, fix or add?": "Apa yang perlu kami pertahankan, perbaiki, atau tambahkan?", "Street, city": "Jalan, kota", "Search for answers": "Cari jawaban", "Type your question": "Ketik pertanyaan Anda", "Tell us what happened": "Ceritakan apa yang terjadi"};
const MON={Jan:'Jan',Feb:'Feb',Mar:'Mar',Apr:'Apr',May:'Mei',Jun:'Jun',Jul:'Jul',Aug:'Agu',Sep:'Sep',Sept:'Sep',Oct:'Okt',Nov:'Nov',Dec:'Des',January:'Januari',February:'Februari',March:'Maret',April:'April',June:'Juni',July:'Juli',August:'Agustus',September:'September',October:'Oktober',November:'November',December:'Desember'};
const WDAY={Monday:'Senin',Tuesday:'Selasa',Wednesday:'Rabu',Thursday:'Kamis',Friday:'Jumat',Saturday:'Sabtu',Sunday:'Minggu'};
function i18nPost(s){return s.replace(/\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\b/g,(m,d,mo)=>d+' '+MON[mo])
  .replace(/\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/g,m=>WDAY[m]).replace(/Rp(\d{1,3}(?:,\d{3})+)/g,(m,n)=>'Rp'+n.replace(/,/g,'.')).replace(/\bat (\d\d):(\d\d)\b/g,'pukul $1.$2')}
const T_=s=>i18nTr(s)||i18nPost(s);
const I18N_RX=[
 [/^(\d+) of (\d+) items secured\. (.+)$/,m=>`${m[1]} dari ${m[2]} item sudah aman. ${T_(m[3])}`],
 [/^(\d+) (?:documents|files) stored$/,m=>`${m[1]} dokumen tersimpan`],
 [/^(\d+) files?$/,m=>`${m[1]} file`],[/^(\d+) documents?$/,m=>`${m[1]} dokumen`],
 [/^(\d+) days? left$/,m=>`sisa ${m[1]} hari`],[/^(\d+) years?$/,m=>`${m[1]} tahun`],[/^(\d+) GB plan$/,m=>`paket ${m[1]} GB`],
 [/^(\d+) beneficiar(?:y|ies)$/,m=>`${m[1]} ahli waris`],[/^(\d+) active$/,m=>`${m[1]} aktif`],[/^(\d+) articles?$/,m=>`${m[1]} artikel`],
 [/^(\d+) (hour|day|minute)s? ago$/,m=>`${m[1]} ${{hour:'jam',day:'hari',minute:'menit'}[m[2]]} lalu`],
 [/^In (\d+) days$/,m=>`Dalam ${m[1]} hari`],[/^(\d+) days$/,m=>`${m[1]} hari`],
 [/^Notifications \((\d+)\)$/,m=>`Notifikasi (${m[1]})`],[/^Question (\d+) of (\d+)$/,m=>`Pertanyaan ${m[1]} dari ${m[2]}`],[/^Step (\d+) of (\d+)$/,m=>`Langkah ${m[1]} dari ${m[2]}`],
 [/^Your readiness score is (\d+)\/100$/,m=>`Skor kesiapan Anda ${m[1]}/100`],[/^Daily insight$/,()=>'Wawasan harian'],[/^Today$/,()=>'Hari ini'],
 [/^Good (morning|afternoon|evening)(,?)$/,m=>`Selamat ${{morning:'pagi',afternoon:'siang',evening:'malam'}[m[1]]}${m[2]}`],
 [/^(Download|Share|Remove|Reminder for|Mark done:|Book|Downloading) ([^a-z].*?)(\.?)$/,m=>`${{Download:'Unduh',Share:'Bagikan',Remove:'Hapus','Reminder for':'Pengingat untuk','Mark done:':'Tandai selesai:',Book:'Pesan',Downloading:'Mengunduh'}[m[1]]} ${T_(m[2])}${m[3]}`],
 [/^Previewing Le-Insure (\w+)\.$/,m=>`Pratinjau Le-Insure ${m[1]}.`],[/^Welcome back, (.+)\.$/,m=>`Selamat datang kembali, ${m[1]}.`],
 [/^(.+) removed\.$/,m=>`${T_(m[1])} dihapus.`],[/^(.+) uploaded$/,m=>`${T_(m[1])} diunggah`],[/^(.+) added to the case and LE-DOCS\.$/,m=>`${T_(m[1])} ditambahkan ke kasus dan LE-DOCS.`],
 [/^Case (\S+) (created|submitted)(\.?)$/,m=>`Kasus ${m[1]} ${m[2]==='created'?'dibuat':'diajukan'}${m[3]}`],[/^Case (\S+): advocate assigned$/,m=>`Kasus ${m[1]}: advokat ditugaskan`],
 [/^(\d+) documents? added to (.+)\.$/,m=>`${m[1]} dokumen ditambahkan ke ${T_(m[2])}.`],
 [/^(.+) sign-in isn't available in this preview\.$/,m=>`Masuk dengan ${m[1]} belum tersedia di pratinjau ini.`],[/^Preview: code sent to (.+)\.$/,m=>`Pratinjau: kode dikirim ke ${m[1]}.`],
 [/^Preview: a reset link would go to (.+)\.$/,m=>`Pratinjau: tautan reset akan dikirim ke ${m[1]}.`],
 [/^Video call with (.+) on (.+) at (\d\d):(\d\d)\.$/,m=>`Panggilan video dengan ${m[1]} pada ${i18nPost(m[2])} pukul ${m[3]}.${m[4]}.`],
 [/^(.+) on (\d.+)$/,m=>{const a=i18nTr(m[1]);return a?`${a} pada ${i18nPost(m[2])}`:null}],
 [/^(.+) will contact you to schedule a consultation\.$/,m=>`${m[1]} akan menghubungi Anda untuk menjadwalkan konsultasi.`],
 [/^(.+) will contact you within 1 working day\.$/,m=>`${m[1]} akan menghubungi Anda dalam 1 hari kerja.`],
 [/^(Rp[\d,]+) advocate fee \+ (Rp[\d,]+) platform fee$/,m=>i18nPost(`biaya advokat ${m[1]} + biaya platform ${m[2]}`)],
 [/^(Rp[\d,]+) left for legal costs this month\.$/,m=>i18nPost(`Sisa ${m[1]} untuk biaya hukum bulan ini.`)],[/^(Rp[\d,]+) spent this month$/,m=>i18nPost(`${m[1]} terpakai bulan ini`)],
 [/^(.+) ends in (\d+) days$/,m=>`${T_(m[1])} berakhir dalam ${m[2]} hari`],[/^You have (\d+) new notifications?\.$/,m=>`Anda punya ${m[1]} notifikasi baru.`],
 [/^Everything is up to date\.$/,()=>'Semua sudah terbaru.'],
 [/^Clause ([\d.]+): (.+)$/,m=>`Klausul ${m[1]}: ${T_(m[2])}`],[/^(\w+) urgency$/,m=>`Urgensi ${(T_(m[1])||m[1]).toLowerCase()}`],
 [/^Your report is saved as case$/,()=>'Laporan Anda disimpan sebagai kasus'],[/^\. Suggested next step: talk to a partner advocate who handles (.+)\.$/,m=>`. Langkah yang disarankan: bicara dengan advokat mitra yang menangani ${T_(m[1]).toLowerCase()}.`],
 [/^Digit (\d) of 6$/,m=>`Digit ${m[1]} dari 6`],[/^shared with (\d+)$/,m=>`dibagikan ke ${m[1]}`],[/^e\.g\. (.+)$/,m=>`mis. ${m[1]}`],
 [/^Resend code in (\d+)s$/,m=>`Kirim ulang kode dalam ${m[1]} dtk`],[/^You're in, (.+)\.$/,m=>`Anda sudah masuk, ${m[1]}.`],
 [/^Daily insight · (.+)$/,m=>`Wawasan harian · ${i18nPost(m[1])}`]
];
function i18nTr(t){if(!t)return null;let r=I18N.get(t);if(r)return i18nPost(r);
  for(const [re,f] of I18N_RX){const m=t.match(re);if(m){const v=f(m);if(v)return i18nPost(v)}}
  if(t.includes(' · ')){const ps=t.split(' · ');const tp=ps.map(p=>i18nTr(p));if(tp.some(Boolean))return ps.map((p,i)=>tp[i]||i18nPost(p)).join(' · ')}
  const ss=t.match(/[^.!?]+[.!?]+(\s+|$)/g);if(ss&&ss.length>1&&ss.join('')===t){const tp=ss.map(s=>i18nTr(s.trim()));if(tp.some(Boolean))return ss.map((s,i)=>(tp[i]||i18nPost(s.trim()))+(/\s$/.test(s)?' ':'')).join('').trim()}
  return null}
const i18nOrig=new WeakMap(),i18nDone=new WeakMap();
function i18nNode(n){const cur=n.nodeValue;let o=i18nOrig.get(n);
  if(o!==undefined&&cur!==o&&cur!==i18nDone.get(n)){o=cur;i18nOrig.delete(n)}if(o===undefined)o=cur;
  const t=o.replace(/\s+/g,' ').trim();if(!t||!/[A-Za-z]/.test(t))return;
  if(LANG==='id'){const pe=n.parentElement,ov=pe&&pe.dataset&&pe.dataset.id;const tr=ov||i18nTr(t)||i18nPost(t);
    if(tr!==t){if(!i18nOrig.has(n))i18nOrig.set(n,o);const lead=o.match(/^\s*/)[0],trail=o.match(/\s*$/)[0];const v=lead+tr+trail;i18nDone.set(n,v);if(cur!==v)n.nodeValue=v}}
  else if(i18nOrig.has(n)&&cur!==o)n.nodeValue=o}
const I18N_SKIP='script,style,textarea,[data-noi18n],#botLog .me';
function i18nAttr(el,a,map){const k='i18n'+a.replace(/-/g,'');if(el.dataset[k]===undefined||(el.getAttribute(a)!==el.dataset[k]&&el.getAttribute(a)!==el.dataset[k+'t']))el.dataset[k]=el.getAttribute(a);
  const o=el.dataset[k];const v=LANG==='id'?(map?map[o]:null)||i18nTr(o)||o:o;el.dataset[k+'t']=v;if(el.getAttribute(a)!==v)el.setAttribute(a,v)}
function i18nWalk(root){if(root.nodeType===1&&root.closest&&root.closest(I18N_SKIP))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const e=n.parentElement;if(!e||e.closest(I18N_SKIP))return 2;const s=e.closest('svg');if(s&&!e.closest('text'))return 2;return 1}});let n;while(n=w.nextNode())i18nNode(n);
  const q=s=>{const a=[...(root.querySelectorAll?root.querySelectorAll(s):[])];if(root.matches&&root.matches(s))a.push(root);return a};
  q('[placeholder]').forEach(el=>i18nAttr(el,'placeholder',I18N_PH));q('[aria-label]').forEach(el=>i18nAttr(el,'aria-label'));q('[title]:not(svg):not(title)').forEach(el=>i18nAttr(el,'title'))}
let i18nBusy=false;
const i18nMO=new MutationObserver(ms=>{if(LANG!=='id'||i18nBusy)return;i18nBusy=true;ms.forEach(m=>{if(m.type==='characterData')i18nNode(m.target);else m.addedNodes.forEach(n=>{if(n.nodeType===1)i18nWalk(n);else if(n.nodeType===3&&!(n.parentElement&&n.parentElement.closest(I18N_SKIP)))i18nNode(n)})});i18nBusy=false;i18nMO.takeRecords()});
function setLang(l){LANG=l;store.set('li-lang',l);document.documentElement.lang=l;$$('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===l));i18nBusy=true;i18nWalk(document.body);i18nBusy=false;i18nMO.takeRecords();window.hcDraw&&hcDraw();window.abWhoRe&&abWhoRe()}
i18nMO.observe(document.body,{childList:true,subtree:true,characterData:true});
document.addEventListener('click',e=>{const b=e.target.closest('.lang [data-lang]');if(b)setLang(b.dataset.lang)});
if(LANG==='id')setLang('id');


/* Brand guideline: logos always use the official vector artwork (#lg-primary / #lg-mark), never typed text. */
(function(){
  $$('[data-lg]').forEach(el=>{el.innerHTML=el.dataset.lg==='mark'
    ?`<svg class="logo" viewBox="0 0 1254 1254" aria-hidden="true"><use href="#lg-mark" width="1254" height="1254"/></svg>`
    :`<svg class="logo" viewBox="0 0 1050 750" aria-hidden="true"><use href="#lg-primary" width="1050" height="750"/></svg>`});
  const eg=$('#ecoLogo');if(eg)eg.innerHTML=`<svg class="logo" x="-66" y="-66" width="132" height="132" viewBox="0 0 864 864" role="img" aria-label="Le-Insure"><use href="#lg-mark-round" width="864" height="864"/></svg>`})();

/* ---------- 3D hologram scenes for coverage, claims, pricing ---------- */
function pgScene(cv,kind){if(!window.THREE||!cv)return;let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){return}
  R.setPixelRatio(Math.min(devicePixelRatio,1.75));const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.set(0,.3,9);cam.lookAt(0,0,0);
  const HT={value:0};
  const holo=(c1,c2,b,k=1)=>new THREE.ShaderMaterial({uniforms:{t:HT,c1:{value:new THREE.Color(c1)},c2:{value:new THREE.Color(c2)},b:{value:b},k:{value:k}},
    vertexShader:'varying vec3 vN;varying vec3 vV;varying float vY;void main(){vec4 wp=modelMatrix*vec4(position,1.);vY=wp.y;vN=normalize(normalMatrix*normal);vec4 mv=viewMatrix*wp;vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float t;uniform vec3 c1;uniform vec3 c2;uniform float b;uniform float k;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.);float s=smoothstep(.55,1.,sin(vY*30.-t*3.)*.5+.5);float band=smoothstep(.92,1.,sin(vY*1.5-t*1.3)*.5+.5);vec3 col=mix(c1,c2,f);float a=(b+f*.8+s*.1+band*.3)*k*(.94+.06*sin(t*19.));gl_FragColor=vec4(col*a,a);}',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const edgeM=new THREE.LineBasicMaterial({color:0xF3EADB,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false});
  const HM=(g,m,th=20)=>{const o=new THREE.Mesh(g,m);o.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,th),edgeM));return o};
  const rose=holo(0xA85563,0xF3E0E2,.04,.8),gold=holo(0xDCCBA8,0xF3EADB,.08,.9);
  const G=new THREE.Group();sc.add(G);const spin=[];
  const ring=(r,tilt,m)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,.012,8,200),m||gold);o.rotation.x=tilt;G.add(o);spin.push(o);return o};
  // dust
  const N=260,pp=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*6.283,r=1.6+Math.random()*2.6,y=(Math.random()-.5)*4;pp.set([Math.cos(a)*r,y,Math.sin(a)*r],i*3)}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xDCCBA8,size:.03,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending}));sc.add(dust);
  let tick=()=>{};
  if(kind==='coverage'){const sh=new THREE.Shape();sh.moveTo(0,1.55);sh.lineTo(1.2,1.1);sh.lineTo(1.2,.1);sh.bezierCurveTo(1.2,-.85,.6,-1.45,0,-1.8);sh.bezierCurveTo(-.6,-1.45,-1.2,-.85,-1.2,.1);sh.lineTo(-1.2,1.1);sh.lineTo(0,1.55);
    const shield=HM(new THREE.ExtrudeGeometry(sh,{depth:.32,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:4,curveSegments:48}),rose,25);shield.position.z=-.2;G.add(shield);
    const inner=new THREE.Shape();inner.moveTo(0,1.15);inner.lineTo(.85,.82);inner.lineTo(.85,.1);inner.bezierCurveTo(.85,-.6,.42,-1.05,0,-1.32);inner.bezierCurveTo(-.42,-1.05,-.85,-.6,-.85,.1);inner.lineTo(-.85,.82);inner.lineTo(0,1.15);
    const pl=HM(new THREE.ShapeGeometry(inner,48),gold);pl.position.z=.3;G.add(pl);
    const ck=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.45,0,.36),new THREE.Vector3(-.1,-.38,.36),new THREE.Vector3(.5,.42,.36)],false,'centripetal'),48,.07,12,false),holo(0xF3EADB,0xFFFFFF,.5,1.2));G.add(ck);
    ring(2.1,1.25);ring(2.45,1.1).rotation.y=.4;
    tick=t=>{G.position.set(Math.sin(t*.7)*.35,Math.sin(t*1.1)*.22,0);G.rotation.y=Math.sin(t*.5)*.45;G.rotation.x=Math.sin(t*.8)*.08}}
  else if(kind==='claims'){const pts=[];for(let i=0;i<4;i++){const x=-1.8+i*1.2,y=-1+i*.62;const st=HM(new THREE.CylinderGeometry(.42,.48,.16,64),i===3?gold:rose);st.position.set(x,y,0);G.add(st);pts.push(new THREE.Vector3(x,y+.25,0));
      const n=HM(new THREE.OctahedronGeometry(.14,0),gold);n.position.set(x,y+.5,0);G.add(n);spin.push(n)}
    const curve=new THREE.CatmullRomCurve3(pts);G.add(new THREE.Mesh(new THREE.TubeGeometry(curve,120,.018,8,false),gold));
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.12,24,16),holo(0xF3EADB,0xFFFFFF,.6,1.3));G.add(orb);
    const doc=HM(new THREE.BoxGeometry(.8,1.0,.04),rose);doc.position.set(1.6,.9,-.6);G.add(doc);G.scale.setScalar(.85);
    tick=t=>{const u=(t*.22)%1;const p=curve.getPointAt(u);orb.position.set(p.x,p.y+.12+Math.abs(Math.sin(u*Math.PI*6))*.25,p.z);G.rotation.y=Math.sin(t*.4)*.35;G.position.y=Math.sin(t*.9)*.12;doc.rotation.y=t*.6;doc.position.y=.9+Math.sin(t*1.3)*.12}}
  else{cam.position.set(0,.6,11);cam.lookAt(0,.2,0);const hs=[.7,1.2,1.8,1.4];const cols=[];
    const PX=[-.92,-.74,.74,.92];[[-4.6,0],[-3.3,.6],[3.3,.6],[4.6,0]].forEach(([x,z],i)=>{const c=HM(new THREE.CylinderGeometry(.42,.42,hs[i],48),i===2?gold:rose);c.position.set(x,-1.6+hs[i]/2,z-1);G.add(c);c.userData.k=PX[i];cols.push(c);
      const coin=HM(new THREE.CylinderGeometry(.34,.34,.07,48),gold);coin.rotation.x=Math.PI/2;coin.position.set(x,-1.6+hs[i]+.55,z-1);coin.userData.k=PX[i];c.userData.coin=coin;G.add(coin);spin.push(coin)});
    G.userData.lay=a=>{const W=12*Math.tan(16*Math.PI/180)*a;cols.forEach(c=>{const x=c.userData.k*Math.min(W,8.5);c.position.x=x;c.userData.coin.position.x=x})};
    tick=t=>{cols.forEach((c,i)=>{const s=1+Math.sin(t*1.2+i)*.05;c.scale.y=s});spin.forEach((c,i)=>c.position.y+=Math.sin(t*1.6+i)*.003)}}
  let vis=false,last=performance.now();
  function size(){const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();G.userData.lay&&G.userData.lay(w/h)}
  new ResizeObserver(size).observe(cv);size();new IntersectionObserver(es=>{vis=es[0].isIntersecting}).observe(cv);
  (function f(now){requestAnimationFrame(f);if(!vis||curView!==kind)return;const t=now/1000;HT.value=t;spin.forEach((o,i)=>{if(o.geometry.type==='TorusGeometry')o.rotation.z+=.003*(i%2?-1:1);else o.rotation.y+=.02});dust.rotation.y=t*.03;tick(t);R.render(sc,cam)})(performance.now())}
var pgInit=window.pgInit||{};
let abInit=false;
function initAbout(){
  if(abInit){window.ScrollTrigger&&ScrollTrigger.refresh();return}abInit=true;
  const PIL=[['Prepare','Before a problem starts','Get informed and organized while things are calm: check-up, contract review and LE-DOCS.','i-book'],['Protect','When a problem happens','Triage, partner advocates, the Legal Protection Plan and Case Tracker.','i-shield'],['Preserve','For the people after you','LE-LEGACY maps what you own and who should receive it.','i-inf']];
  if($('#abPillars'))$('#abPillars').innerHTML=PIL.map((p,i)=>`<div class="pillar" style="--i:${i}"><div class="col"><div class="col-in"><svg viewBox="0 0 160 300" aria-hidden="true"><defs><linearGradient id="pg${i}" x1="0" x2="1"><stop offset="0" stop-color="#4A101C"/><stop offset=".45" stop-color="#B95460"/><stop offset=".6" stop-color="#E1AAB1"/><stop offset="1" stop-color="#4A101C"/></linearGradient><linearGradient id="pc${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3EADB"/><stop offset="1" stop-color="#C9B58A"/></linearGradient></defs><rect fill="url(#pc${i})" x="8" y="0" width="144" height="16" rx="8"/><path fill="url(#pc${i})" d="M20 16 H140 Q134 32 120 34 H40 Q26 32 20 16 Z"/><rect fill="url(#pg${i})" x="32" y="34" width="96" height="234" rx="6"/>${[48,64,80,96,112].map(x=>`<rect class="fl" x="${x-2}" y="44" width="4" height="214" rx="2"/>`).join('')}<path fill="url(#pc${i})" d="M40 268 H120 Q134 270 140 284 H20 Q26 270 40 268 Z"/><rect fill="url(#pc${i})" x="8" y="284" width="144" height="16" rx="8"/><rect class="sweep" x="32" y="34" width="28" height="234"/></svg><span class="ico">${IC(p[3],26)}</span></div><span class="pool"></span></div><div class="ptx"><span class="when">${p[1]}</span><h3>${p[0]}</h3><p>${p[2]}</p></div></div>`).join('');
  const who=$('#abWhoP');who.dataset.noi18n='';const WHO={en:who.textContent.trim(),id:'Le-Insure adalah platform perlindungan digital dari Indonesia. Kami menghubungkan individu dan keluarga dengan perusahaan asuransi berizin, advokat mitra, dan notaris, serta memberi mereka satu tempat aman untuk dokumen-dokumen penting, agar masalah hukum tidak pernah harus dimulai dari nol.'};let ws=[];
  window.abWhoRe=()=>{const on=ws.length?ws.filter(w=>w.classList.contains('on')).length/ws.length:0;who.innerHTML=WHO[LANG==='id'?'id':'en'].split(' ').map(w=>`<span class="w">${w}</span>`).join(' ');ws=$$('.w',who);const k=Math.round(on*ws.length);ws.forEach((w,i)=>w.classList.toggle('on',i<k))};abWhoRe();
  const ECO=[['OJK-licensed insurers','Carry the risk, issue the policy and decide claims.'],['Licensed broker','Distributes the Legal Protection Plan.'],['Partner advocates','Give legal advice and represent you.'],['Partner notaries','Make wills and deeds under Indonesian law.'],['Employers','Offer the Employee Package to their teams.'],['e-KYC & e-signature','Identity checks and secure signing.']];
  const rot=$('#ecoRot');rot.innerHTML=ECO.map((e,i)=>{const a=(i*60-90)*Math.PI/180,x=(232*Math.cos(a)).toFixed(1),y=(232*Math.sin(a)).toFixed(1);
    return `<line class="eco-spoke eco-sp" data-i="${i}" x1="0" y1="0" x2="${x}" y2="${y}"/><circle r="3.2" class="eco-pulse"><animateMotion dur="2.8s" begin="${(i*.45).toFixed(2)}s" repeatCount="indefinite" path="M0 0 L${x} ${y}"/></circle><g class="eco-n" data-i="${i}" transform="translate(${x} ${y})" tabindex="-1"><g class="in"><rect x="-80" y="-50" width="160" height="100" fill="transparent"/><circle r="15"/><text y="36" text-anchor="middle">${e[0]}</text></g></g>`}).join('');
  const list=$('#ecoList');list.innerHTML=ECO.map((e,i)=>`<button type="button" role="listitem" data-i="${i}">${e[0]}</button>`).join('');
  const setEco=i=>{$$('.eco-n,.eco-sp',rot).forEach(n=>n.classList.toggle('on',+n.dataset.i===i));$$('button',list).forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
    $('#ecoDet').innerHTML=i<0?'<b>Le-Insure</b><span>Technology and orchestration: one account, one vault, one flow.</span>':`<b>${ECO[i][0]}</b><span>${ECO[i][1]}</span>`;rot.classList.toggle('hold',i>=0)};
  $$('.eco-n',rot).forEach(n=>{n.addEventListener('mouseenter',()=>setEco(+n.dataset.i));n.addEventListener('click',()=>setEco(+n.dataset.i))});
  $$('button',list).forEach(b=>{b.addEventListener('mouseenter',()=>setEco(+b.dataset.i));b.addEventListener('focus',()=>setEco(+b.dataset.i));b.addEventListener('click',()=>setEco(+b.dataset.i))});
  $('#ecoSvg').addEventListener('mouseleave',()=>setEco(-1));list.addEventListener('mouseleave',()=>setEco(-1));
  const s1=abScene($('#abCv'),true),s2=abScene($('#abCv2'),false);
  $('#abStrike').addEventListener('click',()=>s1&&s1.strike());
  $$('[data-abgo]').forEach(b=>b.addEventListener('click',()=>{const t=$(b.dataset.abgo);if(lenis)lenis.scrollTo(t,{offset:-70,duration:1.3});else t.scrollIntoView({behavior:'smooth'})}));
  const beam=$('#scBeam'),sl=$('#scL'),sr=$('#scR');
  const setScale=deg=>{const r=deg*Math.PI/180;beam.setAttribute('transform',`rotate(${deg.toFixed(2)} 0 35)`);sl.setAttribute('transform',`translate(${(-160*(Math.cos(r)-1)).toFixed(2)} ${(-160*Math.sin(r)).toFixed(2)})`);sr.setAttribute('transform',`translate(${(160*(Math.cos(r)-1)).toFixed(2)} ${(160*Math.sin(r)).toFixed(2)})`)};
  (function bob(now){requestAnimationFrame(bob);if(curView!=='about')return;const t=now/1000;setScale(10*Math.sin(t*1.25)+1.2*Math.sin(t*3.1))})(performance.now());
  spaceBg($('#abSpace'));
  const RAIL=[['ab-top','About Us'],['ab-who','Who We Are'],['ab-why','Why We Exist'],['ab-eco','Our Ecosystem'],['ab-phi','Our Philosophy'],['ab-close','Join us']];
  const rail=$('#abRail');rail.innerHTML=RAIL.map(([id,l],i)=>`<button type="button" data-to="${id}" aria-label="${l}"><span class="rn">0${i+1}</span><span class="rl">${l}</span><i></i></button>`).join('');
  rail.addEventListener('click',e=>{const b=e.target.closest('[data-to]');if(!b)return;const t=document.getElementById(b.dataset.to);if(lenis)lenis.scrollTo(t,{offset:-10,duration:1.2});else t.scrollIntoView({behavior:'smooth'})});
  const setRail=id=>$$('button',rail).forEach(b=>b.classList.toggle('on',b.dataset.to===id));setRail('ab-top');
  let railCur='';const railUpd=()=>{if(curView!=='about')return;const y=innerHeight*.42;let cur=RAIL[0][0];for(const [id] of RAIL){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=y)cur=id}
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)cur=RAIL[RAIL.length-1][0];if(cur!==railCur){railCur=cur;setRail(cur)}};
  addEventListener('scroll',railUpd,{passive:true});if(lenis)lenis.on('scroll',railUpd);setInterval(railUpd,400);railUpd();
  const dio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');dio.unobserve(e.target)}}),{rootMargin:'0px 0px -15% 0px'});$$('.ab-div').forEach(d=>dio.observe(d));
  const G=window.gsap&&window.ScrollTrigger&&!RM;
  if(!G){ws.forEach(w=>w.classList.add('on'));$('#whoCols').classList.add('on');$$('.ab-stats .num').forEach(n=>n.textContent=n.dataset.to);return}
  gsap.from('.ab-h1 .ln>span',{yPercent:105,duration:1.1,ease:'power4.out',stagger:.09,delay:.1});
  gsap.from('.ab-hero .ab-kick,.ab-sub,.ab-hero .ab-ctas',{y:24,opacity:0,duration:1,ease:'power3.out',stagger:.08,delay:.35});
  ScrollTrigger.create({trigger:who,start:'top 82%',end:'bottom 45%',scrub:true,onUpdate:s=>{const n=Math.round(s.progress*ws.length);ws.forEach((w,i)=>w.classList.toggle('on',i<n))}});
  $$('.ab-stats .num').forEach(n=>{const o={v:0};gsap.to(o,{v:+n.dataset.to,duration:1.4,ease:'power2.out',onUpdate:()=>n.textContent=Math.round(o.v),scrollTrigger:{trigger:n,start:'top 88%',once:true}})});
  const wt=gsap.timeline({scrollTrigger:{trigger:'.why-grid',start:'top 78%',end:'bottom 70%',scrub:.6}});
  $$('.wc.bad').forEach((c,i)=>{wt.to($$('.crack path',c),{strokeDashoffset:0,duration:.5,ease:'none'},i*.18).to(c,{rotation:i%2?.8:-.8,x:i%2?4:-4,filter:'grayscale(.6)',duration:.4},i*.18+.3)});
  ScrollTrigger.create({trigger:'#ab-who',start:'top 75%',once:true,onEnter:()=>$('#whoCols').classList.add('on')});

  ScrollTrigger.refresh();
}

/* ---------- v27: section entrance on scroll ---------- */
(function(){const groups=[['[data-view="about"]','.ab-sec,.ab-close',2],['[data-view="coverage"]','.pg-sec',1],['[data-view="claims"]','.pg-sec',1],['[data-view="pricing"]','.pg-sec',1],['[data-view="help"]','.pg-sec',1],['[data-view="support"]','.pg-sec',1]];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){if(!e.target.classList.contains('sx-in'))$$('.ab-stats .num',e.target).forEach(n=>{const to=+n.dataset.to,t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/1400);n.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(st)};n.textContent='0';setTimeout(()=>requestAnimationFrame(st),450)});e.target.classList.add('sx-in')}else if(e.boundingClientRect.top>0)e.target.classList.remove('sx-in')}),{rootMargin:'0px 0px -18% 0px',threshold:0});
  const POP={'ab-who':'.ab-stats>div,.wc-ped,.wc-col','ab-why':'.why-lbl,.wc','ab-eco':'.eco-t .lede,#ecoList>*,.eco-det,.abeco-map','ab-phi':'.phi-scale,.phi','ab-close':'.ab-close-in>*'};
  groups.forEach(([v,sel,start])=>{const root=document.querySelector(v);if(!root)return;$$(sel,root).forEach((sec,i)=>{sec.classList.add('sx');if(getComputedStyle(sec).position==='static')sec.style.position='relative';
    const sw=document.createElement('span');sw.className='sx-sweep';sw.setAttribute('aria-hidden','true');sec.prepend(sw);
    const n=document.createElement('span');n.className='sx-num';n.setAttribute('aria-hidden','true');n.dataset.noi18n='';n.textContent=String(i+start).padStart(2,'0');sec.prepend(n);
    const w=sec.closest('[data-view="about"]')?null:sec.querySelector('.wrap');if(w)[...w.children].forEach((c,k)=>{if(c.matches('h2,.ab-eb,.pg-eb,.ab-div'))return;c.classList.add('sx-kid');c.style.setProperty('--k',k)});
    const pq=POP[sec.id];if(pq)setTimeout(()=>$$(pq,sec).forEach((el,k)=>{el.classList.add('pop');el.style.setProperty('--pi',k)}),0);
    io.observe(sec)})});
  addEventListener('hashchange',()=>setTimeout(()=>$$('.sx').forEach(sec=>{const r=sec.getBoundingClientRect();if(r.top>innerHeight*.82){sec.classList.remove('sx-in');io.observe(sec)}}),60));
})();

/* v27: constellation for help center */
(function(){const cv=$('#hcCv'),sec=document.querySelector('[data-view="help"]');if(!cv||!sec)return;const cx=cv.getContext('2d');let W=0,H=0,P=[],on=false,raf=0,last=0,mx=-1e4,my=-1e4;const D=Math.min(devicePixelRatio||1,2);
  function size(){const r=sec.getBoundingClientRect();if(!r.width)return;W=r.width;H=r.height;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);const n=Math.round(Math.min(120,Math.max(40,W*H/16000)));P=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*14,r:Math.random()*1.6+.5,t:Math.random()*6.28}))}
  function frame(t){raf=requestAnimationFrame(frame);if(curView!=='help')return;const dt=Math.min(.05,(t-last)/1000||0);last=t;cx.clearRect(0,0,W,H);const L=Math.min(150,W/7);
    for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;if(p.y<-10)p.y=H+10;if(p.y>H+10)p.y=-10;
      const dx=p.x-mx,dy=p.y-my,dd=dx*dx+dy*dy;if(dd<22000){const f=(1-dd/22000)*30*dt;p.x+=dx/Math.sqrt(dd+1)*f;p.y+=dy/Math.sqrt(dd+1)*f}}
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y;if(Math.abs(dx)>L||Math.abs(dy)>L)continue;const d=Math.hypot(dx,dy);if(d<L){cx.strokeStyle=`rgba(220,203,168,${(1-d/L)*.22})`;cx.lineWidth=.8;cx.beginPath();cx.moveTo(a.x,a.y);cx.lineTo(b.x,b.y);cx.stroke()}}
    for(const p of P){const tw=.55+.45*Math.sin(p.t*1.6);cx.fillStyle=`rgba(220,203,168,${.35+.5*tw})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fill()}}
  sec.addEventListener('pointermove',e=>{const r=sec.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top});sec.addEventListener('pointerleave',()=>{mx=my=-1e4});
  const go=()=>{if(curView==='help'){size();if(!on){on=true;last=performance.now();raf=requestAnimationFrame(frame)}}else if(on){on=false;cancelAnimationFrame(raf)}};
  addEventListener('hashchange',()=>setTimeout(go,80));if('ResizeObserver' in window)new ResizeObserver(()=>{clearTimeout(cv._t);cv._t=setTimeout(()=>curView==='help'&&size(),150)}).observe(sec);setTimeout(go,300);
})();

/* v29: comparison highlight + employee start */
(function(){const g=document.querySelector('.pg-cmp2');if(!g)return;
  g.addEventListener('pointerover',e=>{const c=e.target.closest('[data-c]');const k=c?c.dataset.c:null;$$('[data-c]',g).forEach(x=>x.classList.toggle('hl',k!==null&&x.dataset.c===k))});
  g.addEventListener('pointerleave',()=>$$('[data-c]',g).forEach(x=>x.classList.remove('hl')));
  g.addEventListener('click',e=>{if(e.target.closest('[data-empgo]'))$('#pgEmp').click()});
})();

/* ---------- meet the team ---------- */
(function(){
  const TEAM=['Wirajati Susanto','Dzamar Widianto','Abian Nurakram','Erlangga Wirapati Chandranaya','Silvia Dara'];
  const ini=n=>{const w=n.split(' ');return (w[0][0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()};
  const tg=$('#teamGrid');
  tg.innerHTML=TEAM.map(n=>`<article class="tm"><div class="ph-art" aria-hidden="true"><span class="orbit"></span><span class="ini">${ini(n)}</span></div><b>${n}</b><small>Le-Insure team</small></article>`).join('');
  $$('.tm',tg).forEach(c=>{c.addEventListener('pointermove',e=>{if(RM)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.transform=`perspective(900px) rotateX(${(.5-y)*6}deg) rotateY(${(x-.5)*8}deg) translateY(-4px)`});c.addEventListener('pointerleave',()=>c.style.transform='')});
  if(window.gsap&&window.ScrollTrigger&&!RM){
    gsap.from('.team-head>*',{y:30,opacity:0,duration:.9,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.team-head',start:'top 82%',once:true}});
    gsap.from('.tm',{y:70,opacity:0,rotation:i=>[-4,3,-2,4,-3][i],duration:1,ease:'power3.out',stagger:.09,scrollTrigger:{trigger:tg,start:'top 85%',once:true}});
  }
  IDX.push(['Meet the Team','#team','Section'],...TEAM.map(n=>[n,'#team','Meet the Team']));
})();

})();
}
