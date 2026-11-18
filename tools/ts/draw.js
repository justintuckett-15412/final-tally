/* ================= Telestrations: sketch encoding, SVG pages and the finger-drawing pad =================
   A stroke = {w:1|2|3 (pen size), e:0|1 (eraser), c:0..7 (pen color, TSD_COL; 0 = black), p:[x,y,x,y,...]} with x,y in 0..1000 (square page).
   tsEnc(strokes) -> compact string (<= TSD_MAX chars), tsDec(str) -> strokes, tsSvg(str,{size}) -> '<svg ...>'.
   tsPadSync({show,key,word,tEnd,colors}) drives the pad layer #tsdraw (outside #app, so render() never wipes it).
   On Done (or ~2 s after tEnd) it calls window.tsPadDone(encoded) once per key.

   Encoding: '1' + grid char + strokes joined by ','.  Stroke = head char ((w-1)+3e+6c) + first point (2+2 chars,
   absolute, in grid units) + one delta per coordinate: 1 char for -31..31, or '_' + 2 chars for bigger jumps.
   Alphabet is URL/JSON safe (A-Z a-z 0-9 - _). Points are simplified (Ramer-Douglas-Peucker) and snapped to the
   grid; if the result is too long we simplify harder (never cut a stroke in half).
   Pen colors (house rule): the color index rides in the head char (6c), so old strings (head 0..5) decode as black. */
const TSD_MAX=6000,TSD_B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const TSD_LEVELS=[[1.5,2],[2.5,2],[3.5,3],[5,3],[7,4],[10,5],[14,6],[20,8],[30,10],[45,12],[70,16],[110,20]];
/* pen widths in page units (1000 = page width); eraser is wider */
const TSD_PEN={1:7,2:14,3:24},TSD_ERA={1:24,2:40,3:60};
/* pen colors: black (official), then the 'Colors' house rule markers */
const TSD_COL=['#111111','#e5262d','#f57c00','#f5c400','#2e9e3f','#1f6fd6','#7b3fbf','#7a4a24'];
const TSD_COLN=['Black','Red','Orange','Yellow','Green','Blue','Purple','Brown'];
const tsdCi=v=>{v=Math.floor(+v||0);return v>=0&&v<TSD_COL.length?v:0};
const tsdInk=s=>s.e?'#fff':TSD_COL[tsdCi(s.c)];
const tsdW=s=>(s.e?TSD_ERA:TSD_PEN)[s.w]||TSD_PEN[1];
/* Ramer-Douglas-Peucker on a flat [x,y,...] list (iterative, keeps both ends) */
function tsdRdp(p,eps){const n=p.length>>1;if(n<3||eps<=0)return p.slice();const keep=new Uint8Array(n);keep[0]=keep[n-1]=1;const st=[[0,n-1]],e2=eps*eps;
  while(st.length){const [a,b]=st.pop();const ax=p[2*a],ay=p[2*a+1],dx=p[2*b]-ax,dy=p[2*b+1]-ay,L=dx*dx+dy*dy;let mx=-1,mi=-1;
    for(let i=a+1;i<b;i++){const px=p[2*i]-ax,py=p[2*i+1]-ay;let d;
      if(L===0)d=px*px+py*py;else{const t=Math.max(0,Math.min(1,(px*dx+py*dy)/L)),qx=px-t*dx,qy=py-t*dy;d=qx*qx+qy*qy}
      if(d>mx){mx=d;mi=i}}
    if(mx>e2){keep[mi]=1;st.push([a,mi],[mi,b])}}
  const o=[];for(let i=0;i<n;i++)if(keep[i])o.push(p[2*i],p[2*i+1]);return o}
const tsdC=v=>Math.max(0,Math.min(1000,+v||0));
function tsdEncStroke(s,eps,q){const B=TSD_B64,raw=(s.p||[]).map(tsdC);if(raw.length<2)return '';
  const p=tsdRdp(raw.length&1?raw.slice(0,-1):raw,eps),g=[];
  for(let i=0;i<p.length;i+=2){const x=Math.round(p[i]/q),y=Math.round(p[i+1]/q),k=g.length;if(k&&g[k-2]===x&&g[k-1]===y)continue;g.push(x,y)}
  const w=[1,2,3].includes(+s.w)?+s.w:1;let o=B[(w-1)+(s.e?3:6*tsdCi(s.c))]+B[g[0]>>6]+B[g[0]&63]+B[g[1]>>6]+B[g[1]&63];
  for(let i=2;i<g.length;i++){const d=g[i]-g[i-2];if(d>=-31&&d<=31)o+=B[d+31];else{const v=d+2048;o+='_'+B[v>>6]+B[v&63]}}
  return o}
function tsEnc(strokes){const S=(Array.isArray(strokes)?strokes:[]).filter(s=>s&&Array.isArray(s.p)&&s.p.length>=2);if(!S.length)return '';
  const mk=(eps,q,list)=>{const parts=list.map(s=>tsdEncStroke(s,eps,q)).filter(Boolean);return parts.length?'1'+TSD_B64[q]+parts.join(','):''};
  let out='';for(const [eps,q] of TSD_LEVELS){out=mk(eps,q,S);if(out.length<=TSD_MAX)return out}
  /* still too long: thin out the points (every k-th, ends kept), then as a last resort drop the smallest whole strokes */
  const [eps,q]=TSD_LEVELS[TSD_LEVELS.length-1],thin=(s,k)=>{const n=s.p.length>>1,p=[];for(let i=0;i<n;i+=k)p.push(s.p[2*i],s.p[2*i+1]);if((n-1)%k)p.push(s.p[2*n-2],s.p[2*n-1]);return {w:s.w,e:s.e,c:s.c,p}};
  for(let k=2;k<=64;k*=2){out=mk(eps,q,S.map(s=>thin(s,k)));if(out.length<=TSD_MAX)return out}
  S.forEach((s,i)=>S[i]=thin(s,64));const size=s=>{let a=1e9,b=1e9,c=-1,d=-1;for(let i=0;i<s.p.length;i+=2){a=Math.min(a,s.p[i]);c=Math.max(c,s.p[i]);b=Math.min(b,s.p[i+1]);d=Math.max(d,s.p[i+1])}return (c-a)+(d-b)};
  const order=S.map((s,i)=>[size(s),i]).sort((x,y)=>x[0]-y[0]),drop=new Set();
  for(const [,i] of order){drop.add(i);out=mk(eps,q,S.filter((s,j)=>!drop.has(j)));if(out.length<=TSD_MAX)return out}
  return ''}
function tsDec(str){try{str=String(str||'');if(str.length<3||str[0]!=='1')return [];const B=TSD_B64,q=B.indexOf(str[1]);if(q<1)return [];
  const out=[];for(const part of str.slice(2).split(',')){const v=[...part].map(c=>B.indexOf(c));if(v.length<5||v.some(x=>x<0)||v[0]>=6*TSD_COL.length)continue;
    const h=v[0],e=h%6>=3?1:0,s={w:h%3+1,e,c:e?0:Math.floor(h/6),p:[]};let x=v[1]*64+v[2],y=v[3]*64+v[4],i=5,ok=true;s.p.push(tsdC(x*q),tsdC(y*q));
    const rd=()=>{if(i>=v.length)return null;if(v[i]===63){if(i+2>=v.length){ok=false;return null}const d=v[i+1]*64+v[i+2]-2048;i+=3;return d}return v[i++]-31};
    while(i<v.length&&ok){const dx=rd(),dy=rd();if(dx==null||dy==null)break;x+=dx;y+=dy;s.p.push(tsdC(x*q),tsdC(y*q))}
    out.push(s)}
  return out}catch(e){return []}}
/* a page as an <svg> string; widths scale with the page, with a floor so thin lines stay visible when small */
let tsdSvgN=0;
function tsSvg(str,o={}){const size=Math.max(40,+o.size||300),k=1000/size,S=tsDec(str),id='tsdc'+(++tsdSvgN),r=40;
  let body='';
  for(const s of S){const w=Math.max(tsdW(s),(s.e?3:1.6)*k).toFixed(1),c=tsdInk(s),p=s.p;let d='M'+p[0]+' '+p[1];
    if(p.length===2)d+='l0 0';else for(let i=2;i<p.length;i+=2)d+='L'+p[i]+' '+p[i+1];
    body+='<path d="'+d+'" stroke="'+c+'" stroke-width="'+w+'"/>'}
  if(!S.length)body='<text x="500" y="515" text-anchor="middle" font-family="system-ui,sans-serif" font-size="'+Math.max(48,12*k).toFixed(0)+'" fill="#9aa3ad">(left blank)</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" class="tssvg" viewBox="0 0 1000 1000" width="'+size+'" height="'+size+'" role="img" aria-label="'+(S.length?'sketch':'blank page')+'">'
    +'<defs><clipPath id="'+id+'"><rect width="1000" height="1000" rx="'+r+'"/></clipPath></defs>'
    +'<rect width="1000" height="1000" rx="'+r+'" fill="#fff"/>'
    +'<g clip-path="url(#'+id+')" fill="none" stroke-linecap="round" stroke-linejoin="round">'+body+'</g>'
    +'<rect x="'+(k/2)+'" y="'+(k/2)+'" width="'+(1000-k)+'" height="'+(1000-k)+'" rx="'+r+'" fill="none" stroke="#d5dbe1" stroke-width="'+k.toFixed(2)+'"/></svg>'}

/* ---------------- the pad ---------------- */
let TSD={key:null,strokes:[],cur:null,pid:null,tool:'thin',pen:'thin',color:0,colors:false,sent:false,word:'',tEnd:null,show:false,clearArm:0,tick:null,el:null};
const tsdEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tsdCss(){if(document.getElementById('tsdrawcss'))return;const st=document.createElement('style');st.id='tsdrawcss';st.textContent=`
#tsdraw{position:fixed;inset:0;z-index:55;background:var(--bg,#EDF0F3);color:var(--ink,#17212B);display:flex;flex-direction:column;align-items:center;
  overflow-y:auto;padding:max(10px,env(safe-area-inset-top)) 0 max(12px,env(safe-area-inset-bottom));box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;font-family:var(--body,system-ui,sans-serif)}
#tsdraw[hidden],#tsdraw [hidden]{display:none!important}
#tsdraw *{box-sizing:border-box}
#tsdraw .tsdcol{width:var(--tsdz,360px);display:flex;flex-direction:column;gap:10px;margin:auto 0}
#tsdraw .tsdtop{display:flex;align-items:center;gap:8px;min-height:44px}
#tsdraw .tsdword{flex:1;min-width:0;font-family:var(--display,inherit);font-weight:800;font-size:20px;line-height:1.15;background:var(--surface,#fff);border:2px solid var(--accent,#f2b705);border-radius:14px;padding:8px 12px;overflow-wrap:anywhere}
#tsdraw .tsdword small{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#5A6672)}
#tsdraw .tsdclock{flex:none;min-width:64px;height:44px;border-radius:14px;background:var(--soft,#E3E8ED);border:1px solid var(--line,#D2D9E0);display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:19px;font-variant-numeric:tabular-nums;padding:0 10px}
#tsdraw .tsdclock.low{background:#e5484d;border-color:#e5484d;color:#fff}
#tsdraw .tsdclock.up{font-size:14px;animation:tsdpulse 1s infinite}
@keyframes tsdpulse{50%{transform:scale(1.07)}}
#tsdraw .tsdpage{position:relative;width:var(--tsdz,360px);height:var(--tsdz,360px);background:#fff;border-radius:18px;box-shadow:0 2px 0 var(--line,#D2D9E0),0 6px 18px rgba(0,0,0,.12);overflow:hidden;border:1px solid var(--line,#D2D9E0)}
#tsdraw canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
#tsdraw .tsdsent{position:absolute;inset:0;background:rgba(255,255,255,.72);display:flex;align-items:center;justify-content:center;color:#17212B;font-weight:800;font-size:20px;text-align:center}
#tsdraw .tsdsent span{background:#fff;border:2px solid var(--accent,#f2b705);border-radius:16px;padding:12px 18px;box-shadow:0 4px 14px rgba(0,0,0,.12)}
#tsdraw .tsdhint{text-align:center;font-size:12.5px;color:var(--muted,#5A6672);margin-top:-4px}
#tsdraw .tsdtools{display:flex;gap:6px}
#tsdraw.tsdc .tsdcol{gap:8px}
#tsdraw.tsdc .tsdtools button{min-height:46px;font-size:10.5px;gap:2px}
#tsdraw .tsdcolors{display:flex;gap:5px;padding:3px}
#tsdraw .tsdcolors button{flex:1;min-width:0;height:40px;border-radius:12px;border:2px solid rgba(0,0,0,.18);background:var(--sw);cursor:pointer;padding:0;-webkit-tap-highlight-color:transparent}
#tsdraw .tsdcolors button.on{box-shadow:0 0 0 3px var(--bg,#EDF0F3),0 0 0 6px var(--ink,#17212B);border-color:#fff;transform:scale(1.04)}
#tsdraw .tsdcolors button:disabled{opacity:.4;cursor:default}
#tsdraw .tsdtools button{flex:1;min-height:52px;border-radius:14px;border:1px solid var(--line,#D2D9E0);background:var(--surface,#fff);color:var(--ink,#17212B);font:inherit;font-size:11px;font-weight:700;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px 2px;cursor:pointer;-webkit-tap-highlight-color:transparent}
#tsdraw .tsdtools button.on{background:var(--accent,#f2b705);border-color:var(--accent,#f2b705);color:#1b1b1b;box-shadow:inset 0 -2px 0 rgba(0,0,0,.15)}
#tsdraw .tsdtools button.arm{background:#e5484d;border-color:#e5484d;color:#fff}
#tsdraw .tsdtools button:disabled{opacity:.4;cursor:default}
#tsdraw .tsdtools i{font-style:normal;font-size:19px;line-height:20px;height:20px;display:flex;align-items:center}
#tsdraw .tsdtools i.dot{width:20px;justify-content:center}
#tsdraw .tsdtools i.dot b{display:block;border-radius:50%;background:var(--pen,currentColor);box-shadow:0 0 0 1px rgba(0,0,0,.15)}
#tsdraw .tsddone{min-height:56px;border:0;border-radius:16px;background:var(--accent,#f2b705);color:#1b1b1b;font:inherit;font-family:var(--display,inherit);font-size:20px;font-weight:800;cursor:pointer;
  box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);-webkit-tap-highlight-color:transparent}
#tsdraw .tsddone:disabled{background:var(--soft,#E3E8ED);color:var(--muted,#5A6672);box-shadow:none;font-size:16px;cursor:default}
`;document.head.appendChild(st)}
/* square size: about min(92vw, 58vh, 520px) */
function tsdSize(){const L=TSD.el;let rest=0;
  if(L&&!L.hidden){const col=L.querySelector('.tsdcol'),pg=L.querySelector('.tsdpage'),cs=getComputedStyle(L);
    rest=col.offsetHeight-pg.offsetHeight+(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0)+4}
  const h=rest?innerHeight-rest:innerHeight*.58,v=Math.floor(Math.min(innerWidth*.92,h,520));return Math.max(200,v)}
function tsdBuild(){tsdCss();let L=document.getElementById('tsdraw');if(L&&L===TSD.el&&document.body.contains(L))return L;if(L)L.remove();
  L=document.createElement('div');L.id='tsdraw';L.hidden=true;L.setAttribute('role','dialog');L.setAttribute('aria-label','Sketch pad');
  L.innerHTML=`<div class="tsdcol">
  <div class="tsdtop"><div class="tsdword"><small>\u270f\ufe0f Sketch \u00b7 no letters or numbers</small><span class="tsdw"></span></div><div class="tsdclock" hidden></div></div>
  <div class="tsdpage"><canvas aria-label="Drawing area"></canvas><div class="tsdsent" hidden><span>Sent \u2713<br><small style="font-size:14px;font-weight:700">Waiting for the others</small></span></div></div>
  <div class="tsdtools">
    <button data-t="thin" aria-label="Thin pen"><i class="dot"><b style="width:6px;height:6px"></b></i>Thin</button>
    <button data-t="thick" aria-label="Thick pen"><i class="dot"><b style="width:15px;height:15px"></b></i>Thick</button>
    <button data-t="erase" aria-label="Eraser"><i>\u{1f9fd}</i>Eraser</button>
    <button data-a="undo" aria-label="Undo"><i>\u21a9\ufe0f</i>Undo</button>
    <button data-a="clear" aria-label="Clear"><i>\u{1f5d1}\ufe0f</i><span>Clear</span></button>
  </div>
  <div class="tsdcolors" role="radiogroup" aria-label="Pen color" hidden>${TSD_COL.map((c,i)=>`<button data-c="${i}" role="radio" aria-label="${TSD_COLN[i]} pen" style="--sw:${c}"></button>`).join('')}</div>
  <button class="tsddone">Done \u2713</button></div>`;
  document.body.appendChild(L);TSD.el=L;
  const cv=L.querySelector('canvas');
  cv.addEventListener('pointerdown',tsdDown);cv.addEventListener('pointermove',tsdMove);cv.addEventListener('pointerup',tsdUp);cv.addEventListener('pointercancel',tsdUp);
  cv.addEventListener('lostpointercapture',tsdUp);cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});cv.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
  L.querySelector('.tsdtools').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||TSD.sent)return;
    if(b.dataset.t){TSD.tool=b.dataset.t;if(TSD.tool!=='erase')TSD.pen=TSD.tool;tsdUi();return}
    if(b.dataset.a==='undo'){if(!TSD.cur&&TSD.strokes.length){TSD.strokes.pop();tsdRedraw()}TSD.clearArm=0;tsdUi();return}
    if(b.dataset.a==='clear'){if(Date.now()<TSD.clearArm){TSD.strokes=[];TSD.cur=null;TSD.clearArm=0;tsdRedraw()}else{TSD.clearArm=Date.now()+3000;setTimeout(tsdUi,3050)}tsdUi()}});
  L.querySelector('.tsdcolors').addEventListener('click',e=>{const b=e.target.closest('button[data-c]');if(!b||b.disabled||TSD.sent||!TSD.colors)return;
    TSD.color=tsdCi(b.dataset.c);if(TSD.tool==='erase')TSD.tool=TSD.pen||'thin';tsdUi()});
  L.querySelector('.tsddone').addEventListener('click',()=>tsdSend());
  if(!tsdBuild.r){tsdBuild.r=1;addEventListener('resize',()=>{if(TSD.show)tsdFit()})}
  return L}
function tsdFit(){const L=TSD.el;if(!L)return;const z=tsdSize();L.style.setProperty('--tsdz',z+'px');const cv=L.querySelector('canvas'),dpr=Math.min(3,window.devicePixelRatio||1),px=Math.round(z*dpr);
  if(cv.width!==px){cv.width=px;cv.height=px}tsdRedraw()}
function tsdCtx(){const cv=TSD.el&&TSD.el.querySelector('canvas');if(!cv)return null;const c=cv.getContext('2d'),s=cv.width/1000;c.setTransform(s,0,0,s,0,0);c.lineCap='round';c.lineJoin='round';return c}
function tsdPaint(c,s,from){const p=s.p,n=p.length>>1;c.strokeStyle=c.fillStyle=tsdInk(s);c.lineWidth=tsdW(s);
  if(n===1){if(from>0)return;c.beginPath();c.arc(p[0],p[1],tsdW(s)/2,0,7);c.fill();return}
  /* quadratic curves through the midpoints; 'from' = how many points were already drawn (live drawing) */
  const mx=i=>(p[2*i]+p[2*i+2])/2,my=i=>(p[2*i+1]+p[2*i+3])/2;let a;c.beginPath();
  if(from<=1){c.moveTo(p[0],p[1]);c.lineTo(mx(0),my(0));a=1}else{c.moveTo(mx(from-2),my(from-2));a=from-1}
  for(let i=a;i<n-1;i++)c.quadraticCurveTo(p[2*i],p[2*i+1],mx(i),my(i));c.stroke()}
function tsdTail(c,s){const p=s.p,n=p.length>>1;if(n<2)return;c.strokeStyle=tsdInk(s);c.lineWidth=tsdW(s);c.beginPath();
  c.moveTo((p[2*n-4]+p[2*n-2])/2,(p[2*n-3]+p[2*n-1])/2);c.lineTo(p[2*n-2],p[2*n-1]);c.stroke()}
function tsdRedraw(){const c=tsdCtx();if(!c)return;c.fillStyle='#fff';c.fillRect(0,0,1000,1000);for(const s of TSD.strokes){tsdPaint(c,s,0);tsdTail(c,s)}if(TSD.cur)tsdPaint(c,TSD.cur,0)}
function tsdPt(e){const r=TSD.el.querySelector('canvas').getBoundingClientRect();if(!r.width)return null;
  return [tsdC((e.clientX-r.left)/r.width*1000),tsdC((e.clientY-r.top)/r.height*1000)]}
function tsdDown(e){e.preventDefault();if(TSD.sent||TSD.pid!=null||(e.pointerType==='mouse'&&e.button!==0))return;const q=tsdPt(e);if(!q)return;
  TSD.pid=e.pointerId;try{e.target.setPointerCapture(e.pointerId)}catch(_){}
  const t=TSD.tool;TSD.cur={w:t==='thin'?1:3,e:t==='erase'?1:0,c:t==='erase'||!TSD.colors?0:TSD.color,p:q.slice()};TSD.clearArm=0;const c=tsdCtx();c&&tsdPaint(c,TSD.cur,0)}
function tsdMove(e){if(e.pointerId!==TSD.pid||!TSD.cur)return;e.preventDefault();const s=TSD.cur,evs=e.getCoalescedEvents?e.getCoalescedEvents():[];
  const before=s.p.length>>1;for(const ev of (evs.length?evs:[e])){const q=tsdPt(ev);if(!q)continue;const n=s.p.length;
    const dx=q[0]-s.p[n-2],dy=q[1]-s.p[n-1];if(dx*dx+dy*dy<2.25)continue;s.p.push(q[0],q[1])}
  const after=s.p.length>>1;if(after>before){const c=tsdCtx();if(c)tsdPaint(c,s,before)}}
function tsdUp(e){if(e&&e.pointerId!==TSD.pid)return;tsdEnd()}
function tsdEnd(){const s=TSD.cur;TSD.cur=null;TSD.pid=null;if(!s)return;TSD.strokes.push(s);tsdRedraw();tsdUi()}
function tsdSend(){if(TSD.sent||!TSD.key)return;if(TSD.cur)tsdEnd();TSD.sent=true;const d=tsEnc(TSD.strokes);tsdUi();
  try{if(typeof window.tsPadDone==='function')window.tsPadDone(d)}catch(err){console.error(err)}}
function tsdClock(){const el=TSD.el&&TSD.el.querySelector('.tsdclock');if(!el)return;if(TSD.tEnd==null||TSD.sent){el.hidden=true;return}
  const left=Math.ceil((TSD.tEnd-Date.now())/1000);el.hidden=false;
  if(left<=0){el.textContent='Finish up!';el.className='tsdclock low up'}
  else{el.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');el.className='tsdclock'+(left<=10?' low':'')}
  if(!TSD.sent&&Date.now()>=TSD.tEnd+2000)tsdSend()}
function tsdUi(){const L=TSD.el;if(!L)return;L.querySelectorAll('[data-t]').forEach(b=>{b.classList.toggle('on',b.dataset.t===TSD.tool);b.disabled=TSD.sent});
  L.classList.toggle('tsdc',TSD.colors);const cr=L.querySelector('.tsdcolors');cr.hidden=!TSD.colors;L.style.setProperty('--pen',TSD.colors?TSD_COL[TSD.color]:'');
  cr.querySelectorAll('[data-c]').forEach(b=>{const on=TSD.tool!=='erase'&&+b.dataset.c===TSD.color;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on));b.disabled=TSD.sent});
  const u=L.querySelector('[data-a=undo]'),c=L.querySelector('[data-a=clear]'),armed=Date.now()<TSD.clearArm;
  u.disabled=TSD.sent||!TSD.strokes.length;c.disabled=TSD.sent||!TSD.strokes.length;c.classList.toggle('arm',armed&&!c.disabled);c.querySelector('span').textContent=armed?'Tap again':'Clear';
  const d=L.querySelector('.tsddone');d.disabled=TSD.sent;d.textContent=TSD.sent?'Sent \u2713 Waiting for the others':'Done \u2713';
  L.querySelector('.tsdsent').hidden=!TSD.sent;L.querySelector('.tsdw').textContent=String(TSD.word||'').toUpperCase()||'Your word';tsdClock()}
/* called after every render and on a timer by ui.js */
function tsPadSync(o={}){const show=!!o.show;
  if(!show){TSD.show=false;if(TSD.el)TSD.el.hidden=true;if(TSD.tick){clearInterval(TSD.tick);TSD.tick=null}return}
  const key=String(o.key==null?'':o.key);
  if(key!==TSD.key){TSD.key=key;TSD.strokes=[];TSD.cur=null;TSD.pid=null;TSD.sent=false;TSD.clearArm=0;TSD.tool=TSD.pen='thin';TSD.color=0}
  const colors=!!o.colors,relay=colors!==TSD.colors;TSD.colors=colors;if(!colors)TSD.color=0;
  TSD.word=o.word||'';TSD.tEnd=o.tEnd==null||!isFinite(+o.tEnd)?null:+o.tEnd;
  const fresh=!TSD.el||!document.body.contains(TSD.el);tsdBuild();const wasHidden=TSD.el.hidden;TSD.el.hidden=false;TSD.show=true;
  if(fresh||wasHidden||relay){tsdUi();tsdFit()}tsdUi();if(!TSD.tick)TSD.tick=setInterval(tsdClock,250)}
/* for ui.js / tests: what the pad holds right now */
function tsPadState(){return {key:TSD.key,sent:TSD.sent,strokes:TSD.strokes.length,show:TSD.show,colors:TSD.colors,color:TSD.color,used:[...new Set(TSD.strokes.filter(s=>!s.e).map(s=>s.c||0))]}}
