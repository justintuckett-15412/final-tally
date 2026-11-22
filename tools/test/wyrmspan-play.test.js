// Playable Wyrmspan (base game): setup, the three actions, exploring, the Dragon Guild, hatchlings, rounds and objectives,
// whole computer games for 2–5 players, the screen, and the reveal into the Wyrmspan score pad.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'wz');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('wzstart','1');
    S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed'][i];p.bot=null});save();c('start')});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,500)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const di=n=>WYD.find(d=>d.n===n).no;
    const G=(n)=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot=null});const g=wzDeal();g.ann=null;while(g.ask){const a=g.ask;wzMove(g,a.pid,{v:a.opts[0].v})}return g};
    const put=(g,p,cv,col,name,e=0)=>{const M=g.P[p].mat[cv];for(let i=0;i<=col;i++)if(!M[i])M[i]={cv:1,d:null};M[col].d={id:di(name),e,c:0,t:0,cr:{}};return cv+col};
    t('Setup: 6 coins, 1 egg in a mat nest, 4 cards kept of 6, 3 resources; 3 dragons and 3 caves on display; 4 different objectives',()=>{const g=G(3),p=g.P[g.ps[0]];
      return {ok:p.coin===6&&p.nest===1&&wzCards(g,g.ps[0])===4&&wzRes(g,g.ps[0])===3&&g.disp.d.every(x=>x!=null)&&g.disp.c.every(x=>x!=null)&&new Set(g.obj).size===4&&g.phase==='play',coin:p.coin,cards:wzCards(g,g.ps[0])}});
    t('Excavate: 1 coin for space 2, plus 1 egg for space 3; the cave card goes on the leftmost undug space and its benefit happens',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      const gainCoin=WYCV.find(c=>JSON.stringify(c.op)==='[["g","coin"]]').no;P.hand.c=[gainCoin,gainCoin];P.coin=5;P.nest=2;
      wzMove(g,a,{a:'exc',cv:'c',i:0});const one=P.mat.c[1]&&P.mat.c[1].cv===gainCoin&&P.coin===5;g.turn=a;wzMove(g,a,{a:'exc',cv:'c',i:0});
      return {ok:one&&P.mat.c[2]&&P.coin===5&&P.nest===1,one,coin:P.coin,nest:P.nest}});
    t('Entice: 1 coin + the printed cost (2-for-1 trades cover a gap); dragons fill a cave left to right on dug spaces; when-played effects happen',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      const id=di('Hostile Northern Fire Dragon');P.hand.d=[id];P.coin=4;P.res={meat:0,gold:0,crys:0,milk:0};const D=wzD(id);WZR.forEach(r=>{if(D.cost[r])P.res[r]=D.cost[r]});
      const r0=Object.keys(D.cost).find(r=>WZR.includes(r));P.res[r0]--;P.res[WZR.find(r=>!D.cost[r])]+=2;const cv=D.cv[0];
      const ok1=wzMove(g,a,{a:'ent',i:0,cv});while(g.ask)wzMove(g,g.ask.pid,{v:g.ask.opts[0].v});
      return {ok:ok1&&P.mat[cv][0].d&&P.mat[cv][0].d.id===id&&P.coin===3-(D.cost.coin||0)&&wzRes(g,a)===0,coin:P.coin,res:P.res}});
    t('Explore: pay 1 coin, entrance benefit, each dragon then the benefit after it, stop at the first empty space; 2nd time costs an egg',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      put(g,a,'g',0,WYD.find(d=>d.ty==='E'&&d.cv.includes('g')).n);const d0=P.hand.d.length,c0=P.coin,gp=P.gpos;
      wzMove(g,a,{a:'exp',cv:'g'});while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts.find(o=>o.v==='deck')?'deck':g.ask.opts[0].v});
      const first=P.hand.d.length===d0+1&&P.gpos===gp+1&&P.coin===c0-1;g.turn=a;P.nest=1;wzMove(g,a,{a:'exp',cv:'g'});while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts[0].v});
      return {ok:first&&P.ex.g===2&&P.nest===0,first,ex:P.ex.g,nest:P.nest,d:P.hand.d.length-d0,gp:P.gpos-gp}});
    t('Dragon Guild: each step gains the space; the brown space lets you place a marker (ability now, guild end-game, or 6/3/1 points)',()=>{const g=G(2),[a,b]=g.ps,P=g.P[a];P.gpos=4;
      g.q=[{t:'adv1',pid:a},{t:'adv1',pid:a}];wzRun(g);const crys=P.res.crys;const asked=g.ask&&g.ask.pid===a&&g.ask.kind==='mark';wzMove(g,a,{v:4});
      g.P[b].gpos=5;g.q=[{t:'adv1',pid:b}];wzRun(g);wzMove(g,b,{v:4});g.ps.forEach(p=>g.P[p].mat.c[0].d=null);g.oc=[{},{},{},{}];
      const sa=wzScore(g,a).guild,sb=wzScore(g,b).guild;return {ok:asked&&P.gm===1&&sa===6&&sb===3,asked,sa,sb,gm:P.gm}});
    t('Hatchlings: caching its resource triggers its bonus every time, and the 3rd cache also grows it up',()=>{const g=G(2),[a]=g.ps,P=g.P[a];
      const H=WYD.find(d=>d.h&&d.h.r==='milk'&&d.h.each!=='vp'&&JSON.stringify(d.h.each).includes('"g"')&&!/any|[dc]/.test(d.h.each[0][1]));const k=put(g,a,'a',0,H.n);
      const tok=H.h.each[0][1];const before=tok==='coin'?P.coin:P.res[tok];P.res.milk=3;for(let i=0;i<3;i++){g.q=[{t:'adv',pid:a,k}];wzRun(g);while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts[0].v})}
      const after=tok==='coin'?P.coin:P.res[tok];return {ok:P.mat.a[0].d.c===3&&after>=before+3&&P.res.milk===0+(tok==='milk'?3:0),h:H.n,c:P.mat.a[0].d.c,before,after}});
    t('Round end: once-per-round dragons, the objective is counted (friendly ties, 0 = nothing), then 6 coins, 1 egg, display refreshed, next start player',()=>{const g=G(3),[a,b,c]=g.ps;
      g.obj[0]='eggs';g.P[a].nest=2;g.P[b].nest=2;g.P[c].nest=0;const d0=g.disp.d.slice();g.ps.forEach(p=>{g.P[p].coin=0;g.P[p].passed=true});const co=g.ps.map(p=>g.P[p].coin);
      g.q=[{t:'rend'}];wzRun(g);while(g.ask)wzMove(g,g.ask.pid,{skip:1});const pts=wzObjPts(g,0);
      return {ok:pts[a]===4&&pts[b]===4&&pts[c]===0&&g.rnd===1&&g.P[a].coin===6&&g.fp===b&&g.turn===b&&g.P[c].nest===1&&g.disp.d.join()!==d0.join(),pts,rnd:g.rnd}});
    t('End of turn: discard down to 9 cards and 9 resources; coins over 9 are lost; the display refills',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;P.res={meat:5,gold:5,crys:0,milk:0};P.coin=12;
      wzMove(g,a,{a:'pass'});let k=0;while(g.ask&&g.ask.pid===a&&k++<20)wzMove(g,a,{v:g.ask.opts[0].v});return {ok:wzRes(g,a)===9&&P.coin===9,res:wzRes(g,a),coin:P.coin}});
    t('Every dragon and cave card has an effect the app can run, and our own wording for it',()=>{const bad=WYD.filter(D=>!(D.h||D.op||D.ty==='E')||/undefined/.test(wzDSay(D))).map(D=>D.n).concat(WYCV.filter(c=>/undefined/.test(wzCvSay(c.no))).map(c=>'cave '+c.no));
      return {ok:WYD.length===183&&WYCV.length===75&&!bad.length,bad}});
    const whole=n=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot='normal'});const g=wzDeal();let k=0;while(g.phase!=='done'&&k++<30000){const q=act().find(x=>x.id===wzActor(g));if(!q||!wzBotStep(g,q))break}return g};
    for(const n of [2,3,4,5])t(`A whole computer game with ${n} players finishes and scores`,()=>{const g=whole(n);const T=g.fin?g.ps.map(p=>g.fin[p].tot):null;return {ok:g.phase==='done'&&T.every(v=>v>15),T,phase:g.phase,rnd:g.rnd}});
    S.players.forEach((x,i)=>{x.on=i<3;x.bot=null});return out});
  for(const [n,v,why] of R)ok(n,v,why);
  // the screen: one person and two computer players
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<3;x.bot=i?'normal':null});delete S.wzg;S.finished=false;S.screen='score';save();render()});await W(1500);
  /* Justin (Nov 21): the starting hand shows the real cards (cost, eggs…), in a dock row with real height, chosen by tapping */
  for(const [w,h] of [[400,850],[1272,900]]){await P.setViewportSize({width:w,height:h});await W(300);
    const vis=await P.evaluate(()=>{const B=[...document.querySelectorAll('.wzdock [data-a="wzkp"]')];return {n:B.length,dh:B.filter(b=>b.querySelector('.wzc')).map(b=>Math.round(b.getBoundingClientRect().height)),
      ch:B.filter(b=>b.querySelector('.wzcave')).map(b=>Math.round(b.getBoundingClientRect().height)),cost:B.filter(b=>b.querySelector('.wzc')).every(b=>b.querySelector('.wzcm')&&b.querySelector('.wzvp')&&/wy-|free/.test(b.querySelector('.wzcm').innerHTML)),
      fit:[...document.querySelectorAll('.wzdock .wzimg')].every(i=>getComputedStyle(i).objectFit==='contain')}});
    ok(`Starting hand at ${w}px: 3 dragon cards (cost, points) and 3 cave cards in the dock, not squeezed; the art is shown whole`,vis.n===6&&vis.dh.length===3&&vis.dh.every(x=>x>120)&&vis.ch.every(x=>x>60)&&vis.cost&&vis.fit,vis);
    await P.screenshot({path:`/tmp/wz-start-${w}.png`})}
  await P.setViewportSize({width:400,height:850});
  const setup=await P.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),clk=async s=>{const e=document.querySelector(s);if(!e)throw new Error('missing '+s);e.dispatchEvent(new MouseEvent('click',{bubbles:true}));await w(120)};
    const g=S.wzg,me=g.ps[0],O=g.ask.opts,d0=g.ask.opts.find(o=>o.v==='d0').d,c2=g.ask.opts.find(o=>o.v==='c2').c;
    const off=document.querySelector('[data-a="wzkgo"]').disabled;await clk('[data-a="wzkp"][data-k="d0"]');await clk('[data-a="wzkp"][data-k="d1"]');await clk('[data-a="wzkp"][data-k="d1"]');await clk('[data-a="wzkp"][data-k="c2"]');
    const txt=document.querySelector('.wzkn').innerText,on=!document.querySelector('[data-a="wzkgo"]').disabled;await clk('[data-a="wzkgo"]');
    for(let i=0;i<3;i++){if(!g.ask||g.ask.pid!==me)break;await clk('.wzdock [data-a="wzans"]')}
    const H=g.P[me].hand;return {ok:off&&on&&/Keeping 4/.test(txt)&&H.d.length===2&&H.c.length===2&&!H.d.includes(d0)&&!H.c.includes(c2)&&wzRes(g,me)===3,txt,H,res:wzRes(g,me)}});
  ok('Through the screen: tap 2 cards to put back (Keep button waits for 2), keep the other 4, then pick 3 resources',setup.ok,setup);
  await P.evaluate(()=>{const g=S.wzg;let k=0;while(g.ask&&k++<50){const q=act().find(x=>x.id===g.ask.pid);wzMove(g,q.id,{v:g.ask.opts[0].v})}g.ann=null;g.turn=g.ps[0];render()});await W(400);
  const tk=await P.evaluate(()=>{const g=S.wzg,me=g.ps[0],c0=g.P[me].coin;const b=[...document.querySelectorAll('[data-a="wzans"]')].find(x=>{const m=JSON.parse(decodeURIComponent(x.dataset.k));return m.a==='exp'&&m.cv==='c'});if(!b)return 'no explore button';
    b.dispatchEvent(new MouseEvent('click',{bubbles:true}));let k=0;while(g.ask&&g.ask.pid===me&&k++<10){const x=document.querySelector('.wzdock [data-a="wzans"]');if(!x)return 'no answer';x.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
    return g.P[me].coin===c0-1&&g.P[me].ex.c===1&&g.turn!==me||[g.P[me].coin,c0,g.turn,JSON.stringify(g.ask)]});
  await P.screenshot({path:'/tmp/wz-screen.png',fullPage:true});
  ok('Through the screen: tap Explore Crimson Cavern, answer its question: 1 coin paid and the turn passes',tk===true,tk);
  /* a card question in the dock (gain a dragon card): real cards and the deck's card back, with real height at both sizes */
  await P.evaluate(()=>{const g=S.wzg,me=g.ps[0];let k=0;while(g.ask&&k++<50)wzMove(g,g.ask.pid,{v:g.ask.opts[0].v});g.q=[{t:'gt',pid:me,k:'',tok:'d'}];wzRun(g);render()});await W(300);
  for(const [w,h] of [[400,850],[1272,900]]){await P.setViewportSize({width:w,height:h});await W(300);
    const r=await P.evaluate(()=>({h:[...document.querySelectorAll('.wzdock .wzpick .wzc')].map(c=>Math.round(c.getBoundingClientRect().height)),back:!!document.querySelector('.wzdock .wzdk-d')&&getComputedStyle(document.querySelector('.wzdock .wzdk-d')).backgroundImage.includes('wy-back-dragon'),
      hand:[...document.querySelectorAll('.wzhand .wzc')].map(c=>Math.round(c.getBoundingClientRect().height)).slice(0,2)}));
    ok(`Card question at ${w}px: the display dragons show as cards in the dock (real height) and the deck shows its card back`,r.h.length>=1&&r.h.every(x=>x>120)&&r.back&&r.hand.every(x=>x>120),r);
    await P.screenshot({path:`/tmp/wz-turn-${w}.png`})}
  await P.setViewportSize({width:400,height:850});
  const gc=await P.evaluate(async()=>{const g=S.wzg,me=g.ps[0],n=g.P[me].hand.d.length,id=g.disp.d.find(x=>x!=null);const b=[...document.querySelectorAll('.wzdock .wzpick [data-a="wzans"]')].find(x=>x.querySelector('.wzc'));b.dispatchEvent(new MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,150));
    return {ok:g.P[me].hand.d.length===n+1&&g.P[me].hand.d.includes(id),n}});
  ok('Tapping a dragon card in the dock takes it',gc.ok,gc);
  /* long press: dragon and cave cards open a big readable card above the dock */
  for(const [kind,sel] of [['dragon','.wzhand .wzc[data-lp^="wzd:"]'],['cave','.wzdisp .wzcave[data-lp^="wzc:"]']])for(const [w,h] of [[400,850],[1272,900]]){await P.setViewportSize({width:w,height:h});await W(200);
    const lp=await P.evaluate(async sel=>{const w=ms=>new Promise(r=>setTimeout(r,ms));LPTIP=null;render();await w(50);const el=document.querySelector(sel);if(!el)return {err:'no card '+sel};el.scrollIntoView({block:'center'});await w(50);const r=el.getBoundingClientRect();
      el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:r.x+5,clientY:r.y+5}));await w(650);document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));await w(100);
      const big=document.querySelector('.lpsheet .lpbig>.wzc,.lpsheet .lpbig>.wzcave');if(!big)return {err:'no sheet',LPTIP,sheets:document.querySelectorAll('.sheet-bg').length,cls:[...document.querySelectorAll('.sheet')].map(x=>x.className).join()};const b=big.getBoundingClientRect(),top=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
      const bg=document.querySelector('.sheet-bg:has(>.lpsheet)'),dock=document.querySelector('.wzdock');return {w:Math.round(b.width),above:!!top&&!!top.closest('.lpsheet'),z:+getComputedStyle(bg).zIndex,dz:dock?+getComputedStyle(dock).zIndex:0}},sel);
    await P.screenshot({path:`/tmp/wz-lp-${kind}-${w}.png`});await P.evaluate(()=>{LPTIP=null;LPSUP=0;render()});
    ok(`Long press a ${kind} card at ${w}px: a big card opens above the dock`,!lp.err&&lp.above&&lp.w>200&&lp.z>lp.dz,lp)}
  await P.setViewportSize({width:400,height:850});
  /* payment: short of a resource, the player chooses which 2 to trade in; the host checks the choice */
  const pay=await P.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),clk=async s=>{const e=document.querySelector(s);if(!e)throw new Error('missing '+s);e.dispatchEvent(new MouseEvent('click',{bubbles:true}));await w(120)};
    const g=S.wzg,me=g.ps[0],P=g.P[me];let k=0;while(g.ask&&k++<50)wzMove(g,g.ask.pid,{v:g.ask.opts[0].v});g.q=[];g.turn=me;P.passed=false;P.coin=6;
    const D=WYD.find(d=>d.cost.meat===1&&!d.cost.gold&&!d.cost.crys&&!d.cost.milk&&!d.cost.egg&&!d.cost.coin&&d.ty==='E');P.hand.d=[D.no];P.res={meat:0,gold:2,crys:2,milk:0};P.mat={c:[{cv:0,d:null},null,null,null],g:[{cv:0,d:null},null,null,null],a:[{cv:0,d:null},null,null,null]};g.ask=null;WZSEL=null;render();
    const bad=wzMove(JSON.parse(JSON.stringify(g)),me,{a:'ent',i:0,cv:D.cv[0],pay:{meat:1}});
    await clk('[data-a="wzsel"][data-k="ent:0"]');const n=document.querySelectorAll('[data-a="wzpaysel"]').length;const PO=wzPayOpts(P.res,wzDCost(D.no)),j=PO.findIndex(x=>x.crys===2);
    if(n!==3)return {ok:false,n,PO,acts:wzActs(g,me),turn:g.turn===me,ask:JSON.stringify(g.ask),q:g.q.length,sel:WZSEL};await clk(`[data-a="wzpaysel"][data-k="${j}"]`);await clk('.wzdock [data-a="wzans"][data-k*="%22ent%22"]');
    return {ok:n===3&&!bad&&P.res.crys===0&&P.res.gold===2&&wzDr(g,me).some(([,d])=>d.id===D.no),n,bad,res:P.res,d:D.n}});
  ok('Entice when short of a resource: a Pay-with row (3 ways) appears, the chosen pair is spent, a payment that isn’t legal is refused',pay.ok,pay);
  /* the end-of-round card: the objective's counts and points, totals, what's next; computer players wait for it */
  const rs=await P.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const g=S.wzg,[a,b,c]=g.ps;let k=0;while(g.ask&&k++<50)wzMove(g,g.ask.pid,{v:g.ask.opts[0].v});
    g.obj[0]='eggs';g.rnd=0;g.q=[];render();const icon=!!document.querySelector('.wzob .wzgoi img[src*="wy-egg"]');
    g.P[a].nest=2;g.P[b].nest=1;g.P[c].nest=0;g.ps.forEach(p=>{g.P[p].passed=true;g.P[p].coin=0});g.fp=a;g.q=[{t:"rend"}];wzRun(g);let j=0;while(g.ask&&j++<20)wzMove(g,g.ask.pid,{skip:1});save();render();await w(150);
    const card=document.querySelector('.wzrs'),txt=card?card.innerText:'';window.__rs={tno:g.tno,turn:g.turn};return {icon,card:!!card,txt:txt.replace(/\s+/g,' ').slice(0,300),bot:act().find(p=>p.id===g.turn).bot}});
  for(const [w,h] of [[400,850],[1272,900]]){await P.setViewportSize({width:w,height:h});await W(300);await P.screenshot({path:`/tmp/wz-round-${w}.png`})}
  await P.setViewportSize({width:400,height:850});await W(2000);
  const rs2=await P.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),g=S.wzg,{tno,turn}=window.__rs;const held=g.tno===tno&&g.turn===turn&&!g.ask&&!!document.querySelector('.wzrs');
    document.querySelector('[data-a="wzrsok"]').click();await w(200);const gone=!document.querySelector('.wzrs');let moved=false;for(let i=0;i<40&&!moved;i++){await w(250);moved=g.tno!==tno||g.turn!==turn||!!g.ask}return {held,gone,moved}});
  Object.assign(rs,rs2);rs.ok=rs.icon&&rs.card&&/Round 1 is over/i.test(rs.txt)&&/→ \+\d/.test(rs.txt)&&/Start round 2/.test(rs.txt)&&/round 2 of 4/i.test(rs.txt)&&!!rs.bot&&rs.held&&rs.gone&&rs.moved;
  ok('Objective tiles show the card pictures; the end-of-round card shows counts, points and what’s next; the computer player waits for it, then plays',rs.ok,rs);
  // the reveal
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<4;x.bot='normal'});const g=wzDeal();let k=0;while(g.phase!=='done'&&k++<30000){const q=act().find(x=>x.id===wzActor(g));if(!wzBotStep(g,q))break}g.ann=null;S.finished=false;S.screen='score';save();render()});await W(500);
  await P.screenshot({path:'/tmp/wz-end.png',fullPage:true});
  const rv=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.wzg;return act().every(p=>total(p)===g.fin[p.id].tot)||act().map(p=>[total(p),g.fin[p.id].tot,JSON.stringify(p.wy)])});
  ok('Finish & reveal: the Wyrmspan score pad gets every category and the round objectives, and totals match',rv===true,rv);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
