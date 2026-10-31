// Rage stress test: many full games on the phone with random settings and randomly tapping people.
// Checks every card played was legal, every trick went to the right player, cards are never lost or doubled,
// rounds add up, and no game gets stuck.   Usage: N=8 node rgfuzz.js   (LINK=1: two linked phones)
const {chromium,mk,W,ok,done,BASE}=require('./link.js');
const N=+(process.env.N||6),LINK=!!process.env.LINK;
const hooks=()=>{window.__bad=window.__bad||[];const bad=m=>{if(window.__bad.length<40&&!window.__bad.includes(m))window.__bad.push(m)};
  const eff=x=>x.c[0]==='W'?x.w:/^[WCUAM]/.test(x.c)?null:x.c[0];
  const led=t=>{for(const x of t){const e=eff(x);if(e)return e}return null};
  const op=window.rgPlayCard;window.rgPlayCard=function(pid,c,col,num){const g=rgG(),X=RGX();const before=g&&g.h[pid]?g.h[pid].slice():[],t=g?g.t.slice():[],fore=g&&g.fore,turn=g&&g.turn,ph=g&&g.phase;
    const ok=op.apply(this,arguments);window.__np=(window.__np||0)+(ok?1:0);
    if(ok){if(ph!=='play')bad(`played in phase ${ph}`);if(turn!==pid)bad(`${nmid(pid)} played out of turn`);if(!before.includes(c))bad(`${nmid(pid)} played ${c} not in hand`);
      const l=led(t);if(!fore&&l&&!/^[WCUAM]/.test(c)&&c[0]!==l&&before.some(x=>x[0]===l&&!/^[WCUAM]/.test(x)))bad(`${nmid(pid)} played ${c} on a ${l} lead while holding ${l}`);
      if(!fore&&l&&/^[WCUAM]/.test(c)&&!X.rageAny&&before.some(x=>x[0]===l&&!/^[WCUAM]/.test(x)))bad(`${nmid(pid)} played Rage card ${c} while holding the led color (Rage cards any time is off)`);
      if(c[0]==='W'&&!['r','o','y','g','b','p'].includes(g.t[g.t.length-1].w))bad(`wild without a color ${JSON.stringify(g.t[g.t.length-1])}`)}
    return ok};
  const oc=window.rgCollect;window.rgCollect=function(g){const X=RGX(),t=g.t,tr=g.tr,l=led(t);
    const num=x=>x.c[0]==='W'?(X.wildNum&&x.n!=null?+x.n:16):+x.c.slice(1);
    let pool=tr?t.map((x,i)=>({x,i})).filter(o=>eff(o.x)===tr):[];if(!pool.length&&l)pool=t.map((x,i)=>({x,i})).filter(o=>eff(o.x)===l);
    let w=t[0].p;if(pool.length){let best=pool[0];for(const o of pool.slice(1)){const a=num(o.x),b=num(best.x);if(a>b)best=o;else if(a===b){const ow=o.x.c[0]==='W',bw=best.x.c[0]==='W';if(ow&&bw){if(X.wild2nd)best=o}else if(ow)best=o}}w=best.x.p}
    window.__nt=(window.__nt||0)+1;const won0={...g.won};const r=oc.apply(this,arguments);const got=Object.keys(g.won).find(k=>(g.won[k]||0)>(won0[k]||0));
    if(got!==w)bad(`trick ${t.map(x=>x.c+(x.w?'('+x.w+(x.n!=null?x.n:'')+')':'')).join(' ')} trump=${tr} went to ${nmid(got)}, expected ${nmid(w)}`);return r}};
const check=prev=>{const g=rgG();if(!g)return {none:1};const out=[],X=RGX(),P=act(),n=rgCards(g.r);
  const all=[...Object.values(g.h).flat(),...g.t.map(x=>x.c),...(g.played||[]),...(g.pile||[]),...(g.up?[g.up]:[])];const seen=new Set();
  for(const c of all){if(seen.has(c))out.push(`card ${c} twice (r${g.r+1} ${g.phase})`);seen.add(c)}
  if(X.amigoDeck===false&&all.some(c=>c==='A3'||c==='M3'))out.push('AMIGO card in the classic deck');
  const inPlay=Object.values(g.h).flat().length+g.t.length+(g.played||[]).length;if(inPlay!==n*P.length)out.push(`r${g.r+1}: ${inPlay} cards in play, expected ${n*P.length}`);
  for(const p of P){const b=g.bids[p.id];if(b!==undefined&&(b<0||b>n))out.push(`bid ${b} of ${n}`)}
  if(g.phase==='play'&&!g.fore){const sizes=P.map(p=>g.h[p.id].length+(g.t.some(x=>x.p===p.id)?1:0));if(new Set(sizes).size>1)out.push(`uneven hands ${sizes}`)}
  if(g.phase==='done'){const t=P.reduce((a,p)=>a+(g.won[p.id]||0),0);if(t!==n)out.push(`r${g.r+1}: ${t} tricks for ${n} cards`);
    const bo=(g.played||[]).filter(c=>c[0]==='A').length,md=(g.played||[]).filter(c=>c[0]==='M').length;
    if(P.reduce((a,p)=>a+(g.bo[p.id]||0),0)!==bo)out.push('bonus count off');if(P.reduce((a,p)=>a+(g.md[p.id]||0),0)!==md)out.push('mad count off');
    const ck=rgCheck(g.r);if(ck)out.push(`r${g.r+1} score check says: ${ck}`)}
  P.forEach(p=>{const t=rgTot(p);if(!Number.isFinite(t))out.push(`${nm(p)} total ${t}`)});
  return {out:out.concat(window.__bad||[]),r:g.r,ph:g.phase,n:g.n+':'+g.t.length+':'+Object.keys(g.bids).length,fin:!!S.finished}};
const tapper=()=>{const vis=[...document.querySelectorAll('#app [data-a], .sheet [data-a], .glann [data-a]')].filter(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&b.offsetParent);
  const A=b=>b.dataset.a;const g0=rgG(),endOK=g0&&g0.phase==='done'&&g0.r>=rgN()-1;const want=['rgcard','rgbid','rglock','rgcolor','rgnum',...(window.__norage?[]:['rgrage']),'rgshow','rgnext','rgdeal','rgfore','rgfcard','gllastok','revstart','lpclose','htc','hoplay','lkvote'].concat(endOK?['finish']:[]);
  const c=vis.filter(b=>want.includes(A(b)));if(!c.length)return '';
  const pri=c.filter(b=>['rgshow','rgnext','rgdeal','finish','revstart','lpclose','rgcolor','rglock','rgfore','rgfcard','gllastok'].includes(A(b)));
  const pick=pri.length&&Math.random()<.7?pri[Math.floor(Math.random()*pri.length)]:c[Math.floor(Math.random()*c.length)];pick.click();return A(pick)};
const setup=(gi)=>{const R=()=>Math.random();window.__htfast=1;SET.toursOff=true;switchGame('rage');resetScores();const X=RGX();X.play=true;
  RGHR.forEach(k=>X[k]=R()<.65);const np=2+Math.floor(R()*7);X.order=['down','up','downup'][Math.floor(R()*3)];X.start=Math.max(1,Math.min(10,Math.floor((X.amigoDeck?112:110)/np)-Math.floor(R()*3)));if(R()<.5)X.start=Math.min(X.start,3+Math.floor(R()*3));
  return {np,X:{...X}}};
(async()=>{const browser=await chromium.launch();
  for(let gi=0;gi<N;gi++){const errs=[];let pages=[];
    if(!LINK){const page=await browser.newPage({viewport:{width:400,height:850}});page.on('pageerror',e=>errs.push(e.message));await page.goto(BASE);await W(1200);pages=[page]}
    else{const H=await mk(browser,'rh'+gi),G=await mk(browser,'rg'+gi);H.on('pageerror',e=>errs.push('host: '+e.message));G.on('pageerror',e=>errs.push('guest: '+e.message));pages=[H,G]}
    const H=pages[0];const cfg=await H.evaluate(setup,gi);
    const humans=LINK?2:[0,1,1,1,2][Math.floor(Math.random()*5)];
    const ids=await H.evaluate(([np,humans])=>{const P=S.players;P.forEach((p,i)=>{p.on=i<np;p.name=i<np?(i<humans?'Human'+(i+1):'Bot'+i):'';if(i>=humans&&i<np)p.bot=['easy','normal','hard'][Math.floor(Math.random()*3)];else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P.slice(0,2).map(p=>p.id)},[cfg.np,humans]);
    if(LINK){const G=pages[1];await G.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000)}
    if(LINK){await pages[1].evaluate(()=>{window.__gp=[];const f=window.FTLINK.push.bind(window.FTLINK);window.FTLINK.push=u=>{const m=(u.mops||[]).filter(([p])=>p[0]==='lkq').map(([p,v])=>p.join('.')+'='+String(JSON.stringify(v)).slice(0,90));if(m.length){window.__gp.push((Date.now()%100000)+' '+m.join(' | '));if(window.__gp.length>6)window.__gp.shift()}return f(u)}});
      await H.evaluate(()=>{window.__hr=[];const o=window.lkRecv;window.lkRecv=u=>{const ks=u.mflat?Object.keys(u.mflat).filter(k=>k.startsWith('lkq')):[];const before=JSON.stringify(S.lkq);o(u);if(ks.length){window.__hr.push((Date.now()%100000)+' recv '+ks.map(k=>k+'='+String(u.mflat[k]).slice(0,60)).join(' ; ')+' => S.lkq '+JSON.stringify(S.lkq).slice(0,120));if(window.__hr.length>8)window.__hr.shift()}}})}
    await H.evaluate(hooks);if(process.env.NORAGE)for(const p of pages)await p.evaluate(()=>{window.__norage=1});
    const bad=[];let last='',lastT=Date.now(),t0=Date.now();
    while(Date.now()-t0<15*60e3){const v=await H.evaluate(check);if(v.none){await W(300);continue}
      for(const o of v.out)if(!bad.includes(o))bad.push(o);if(v.fin)break;
      const key=v.r+v.ph+v.n;if(key!==last){last=key;lastT=Date.now()}
      if(Date.now()-lastT>45e3){let st=await H.evaluate(()=>{const g=rgG();return JSON.stringify({r:g.r,ph:g.phase,turn:g.turn&&nmid(g.turn),t:g.t.length,bids:g.bids,ann:g.ann&&g.ann.t,annq:(g.annq||[]).length,cd:g.cd,hq:JSON.stringify(S.lkq),hqa:JSON.stringify(S.lkqa),hkey:lkqKey(),btns:''})});if(LINK)st+=' GUEST '+await pages[1].evaluate(()=>{const g=rgG();return JSON.stringify({me:S.lk&&S.lk.me,turn:g&&g.turn,ph:g&&g.phase,sel:typeof RGSEL!=='undefined'?RGSEL:null,hand:g&&S.lk&&g.h[S.lk.me],legal:g&&S.lk&&rgLegal(g,S.lk.me),viewer:(rgViewer()||{}).id,btns:[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a))].join(' '),dbg:{LKT:!!LKT,age:Date.now()-LKT0,LKSWAP:typeof LKSWAP!=='undefined'?LKSWAP:'?',LKMUTE,ft:!!window.FTLINK,lk:!!S.lk},q:JSON.stringify((S.lkq||{})[S.lk.me]),qa:(S.lkqa||{})[S.lk.me],key:lkqKey(),pend:lkPending().length,cards:[...document.querySelectorAll('[data-a=rgcard]')].map(b=>b.dataset.c+(b.offsetParent?'':'(hidden)')+(b.disabled?'(dis)':'')).join(',')})});if(LINK){st+=' GPUSH '+JSON.stringify(await pages[1].evaluate(()=>window.__gp))+' HRECV '+JSON.stringify(await H.evaluate(()=>window.__hr))}bad.push('STUCK '+st.slice(0,6000));break}
      for(const p of pages)await p.evaluate(tapper);await W(110)}
    await W(LINK?4000:300);
    const sum=p=>p.evaluate(()=>({plays:window.__np,tricks:window.__nt,fin:!!S.finished,tot:act().map(q=>nm(q)+' '+rgTot(q))}));const a=await sum(H);const hk=[a.plays,a.tricks];delete a.plays;delete a.tricks;let agree=true;if(LINK){const b=await sum(pages[1]);delete b.plays;delete b.tricks;agree=JSON.stringify(a)===JSON.stringify(b);if(!agree)bad.push('phones disagree '+JSON.stringify({a,b}))}
    if(!a.fin)bad.push('did not finish');
    const X=cfg.X;ok(`${LINK?'linked ':''}rage ${gi+1}: ${cfg.np}p ${humans}h ${X.order} start ${X.start}${X.fore?' fore':''} [${RGHRK(X)}] → ${a.tot.join(', ')} (${hk[0]} cards checked, ${hk[1]} tricks)`,!bad.length&&!errs.length,{bad:bad.slice(0,8),errs:[...new Set(errs)].slice(0,4)});
    for(const p of pages)await p.context().close().catch(()=>p.close())}
  await done(browser)})();
function RGHRK(X){return ['fore','missKeep','sweep','rageAny','outOne','changeFlip','wild2nd','amigoDeck','wildNum','bidAll'].filter(k=>X[k]&&k!=='fore').join(',')}
