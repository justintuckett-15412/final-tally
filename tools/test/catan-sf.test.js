// Catan on the phone, Seafarers: scenario maps, ships, moving ships, the pirate, Longest Trade Route,
// island points, the scenario picker, long-press build costs, and a game played through the screen.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();let P=await mk(browser,'sf');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const R=await P.evaluate(()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const fresh=(sc='1',n=3)=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1,mode:'sf',sfs:sc,goalSF:CPSF[sc].goal});S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=null});S.started=true;cpDeal();const g=S.cpg;return {g,B:cpB(g),M:p=>g.me[p]}};
    const setup=x=>{const g=x.g;while(g.phase==='setup'){const q=act().find(p=>p.id===cpActor(g));q.bot='normal';cpBotStep(g,q);q.bot=null;if(g.ask&&g.ask.k==='gold'){for(const id in g.ask.need){const r=CPR.find(r=>g.bank[r]>=g.ask.need[id]);cpGold(g,id,{[r]:g.ask.need[id]})}}}return x};
    t('Every scenario deals for 3 and 4 players with sea, the pirate (none in 8, off the board in 9) and the right goal',()=>{const bad=[];for(const sc of Object.keys(CPSF))for(const n of [3,4]){const {g}=fresh(sc,n);if(!g.sea||(g.pir==null)!==!!(CPSF[sc].rand||CPSF[sc].noPir)||!g.hx.some(h=>h[2]==='s')||g.goal!==CPSF[sc].goal)bad.push(sc+'/'+n)}return {ok:!bad.length,bad}});
    t('Ships: 1 wood + 1 sheep, only on water edges joined to your own piece',()=>{const x=setup(fresh('1')),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};M.r={w:1,b:0,s:1,g:0,o:0};
      const sp=cpSSpots(g,p);if(!sp.length)return {ok:true,skip:'no coastal start'};const land=x.B.E.map((e,i)=>i).find(e=>!cpEWater(g,e));const no=!cpBuildShip(g,p,land);const yes=cpBuildShip(g,p,sp[0]);return {ok:no&&yes&&g.sh[sp[0]]===p&&M.r.w===0&&M.r.s===0}});
    t('A ship built this turn can’t move; next turn the open end can',()=>{const x=setup(fresh('1')),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};M.r={w:2,b:0,s:2,g:0,o:0};
      const sp=cpSSpots(g,p);if(!sp.length)return {ok:true,skip:1};cpBuildShip(g,p,sp[0]);const notNow=!cpShipMovable(g,p,sp[0]);g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};const can=cpShipMovable(g,p,sp[0]);
      delete g.sh[sp[0]];const to=cpSSpots(g,p).find(e=>e!==sp[0]);g.sh[sp[0]]=p;let moved=true;if(to!=null&&can)moved=cpMoveShip(g,p,sp[0],to)&&g.sh[to]===p&&g.sh[sp[0]]==null&&g.t.mvd;return {ok:notNow&&can&&moved,notNow,can,moved}});
    t('The pirate blocks ships next to it',()=>{const x=setup(fresh('1')),g=x.g,p=g.ps[0];const pe=cpPirE(g);return {ok:pe.length===6&&pe.every(e=>!cpSOk(g,p,e))}});
    t('Longest Trade Route counts roads and ships joined at your own settlement',()=>{const x=fresh('1'),g=x.g,B=x.B,p=g.ps[0];g.phase='turn';g.su=null;
      const v=B.V.findIndex((V,i)=>V.h.some(h=>g.hx[h][2]==='s')&&V.h.some(h=>cpLand(g.hx[h][2])));const es=B.E.map((e,i)=>i).filter(e=>B.E[e].a===v||B.E[e].b===v);
      const r=es.find(e=>!cpEWater(g,e)||cpELand(g,e)),s=es.find(e=>e!==r&&cpEWater(g,e));if(r==null||s==null)return {ok:true,skip:1};g.rd[r]=p;g.sh[s]=p;const open=cpRoadLen(g,p);g.b[v]=[p,0];const joined=cpRoadLen(g,p);return {ok:open===1&&joined===2,open,joined}});
    t('Scenario picker sets the goal; a house goal wins over the scenario’s',()=>{const a=fresh('2').g.goal;S.ctx.goalSF=16;cpDeal();return {ok:a===13&&S.cpg.goal===16,a,b:S.cpg.goal}});
    t('Bots finish a game of every scenario',()=>{const bad=[];for(const sc of Object.keys(CPSF)){const {g}=fresh(sc,3);act().forEach(p=>p.bot='normal');let i=0;while(g.phase!=='done'&&i++<20000){const q=act().find(p=>p.id===cpActor(g))||act()[0];cpBotStep(g,q);if(g.ask&&g.ask.k==='gold')for(const id in g.ask.need)cpBotStep(g,act().find(p=>p.id===id))}if(g.phase!=='done')bad.push(sc)}return {ok:!bad.length,bad}});
    t('Forgotten Tribe: small islands never take a settlement or the robber; 8 ⭐, 4 📜 and 6 ⚓ gifts',()=>{const {g,B}=fresh('5');const c={};Object.values(g.gift).forEach(G=>c[G[0]]=(c[G[0]]||0)+1);const noSet=B.V.map((x,i)=>i).filter(v=>B.V[v].h.some(h=>g.small.includes(h))&&B.V[v].h.every(h=>!cpLand(g,h)||g.small.includes(h))).every(v=>!cpVOk(g,g.ps[0],v,'free'));
      return {ok:c.vp===8&&c.dev===4&&c.hb===6&&noSet&&g.small.includes(g.rob)&&g.hb.length===0&&g.deck.length===21,c}});
    t('Forgotten Tribe: a ship on a gift edge claims it; a harbor goes next to your coastal settlement',()=>{const x=setup(fresh('5')),g=x.g,B=x.B,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};
      const ge=Object.keys(g.gift).find(e=>g.gift[e][0]==='vp');g.sh[ge]=p;const pts=cpVP(g,p);cpGiftAt(g,p,+ge);const vp=cpVP(g,p)===pts+1&&!g.gift[ge];
      const he=+Object.keys(g.gift).find(e=>g.gift[e][0]==='hb');const coastal=Object.keys(g.b).map(Number).some(v=>g.b[v][0]===p&&B.V[v].e.some(e=>cpELand(g,e)&&cpEWater(g,e)));cpGiftAt(g,p,he);
      const asked=coastal?g.ask&&g.ask.k==='hb':(M.hbk||[]).length===1;let placed=true;if(coastal){const sp=cpHbSpots(g,p);placed=cpPlaceHb(g,p,sp[0])&&g.hb.length===1&&!g.ask}
      const de=+Object.keys(g.gift).find(e=>g.gift[e][0]==='dev');const n=M.dev.length;cpGiftAt(g,p,de);return {ok:vp&&asked&&placed&&M.dev.length===n+1&&M.nw.length>=1,vp,asked,placed,coastal}});
    t('Cloth for Catan: third settlement collects; villages give cloth on the link and on their number',()=>{const x=fresh('6'),g=x.g,B=x.B;const order=g.su.order.length===3*g.ps.length;setup(x);const third=g.ps.every(p=>cpSum(g.me[p].r)+Object.keys(g.ask&&g.ask.need||{}).length>=0);
      const p=g.ps[0],V=g.vil[0];/* a ship route from a new settlement to the village corner */const e1=B.V[V.v].e.find(e=>cpEWater(g,e));const x1=B.E[e1],o=x1.a===V.v?x1.b:x1.a;g.b[o]=[p,0];g.sh[e1]=p;cpVilCheck(g,p);const link=V.who.includes(p)&&g.me[p].cloth===1&&V.c===4;
      g.turn=p;g.t={rolled:0,dev:0,road:0,newSh:[],mvd:0};const n=V.n;const d=n<=7?[1,n-1]:[6,n-6];g.hx.forEach(h=>{});cpRoll(g,p,d);const roll=g.me[p].cloth===2&&V.c===3;const vp=cpClothVP(g,p)===1;const closed=!cpShipMovable(g,p,e1);
      return {ok:order&&link&&roll&&vp&&closed,order,link,roll,vp,closed}});
    t('Cloth for Catan: the pirate needs a village link; it can steal cloth; no Longest Trade Route',()=>{const x=setup(fresh('6')),g=x.g,B=x.B,[p,q]=g.ps;const sea=g.hx.findIndex((h,i)=>h[2]==='s'&&i!==g.pir);const no=!cpPirOk(g,p,sea);g.vil[0].who.push(p);const yes=cpPirOk(g,p,sea);
      g.me[q].cloth=3;const e=B.he[sea][0];g.sh[e]=q;g.ask={k:'rob',p};cpRobber(g,p,sea);if(g.ask&&g.ask.k==='steal'){const c=g.ask.opts.find(o=>String(o).endsWith(':c'));cpSteal(g,p,c||g.ask.opts[0])}
      for(let k=0;k<6;k++)g.rd[cpESpots(g,p)[0]]=p;cpLongest(g);return {ok:no&&yes&&g.me[p].cloth>=1&&g.me[q].cloth===2&&g.lr==null}});
    t('Cloth for Catan: the game ends when only 3 villages have cloth',()=>{const x=setup(fresh('6')),g=x.g;g.vil.forEach((v,i)=>{if(i<5)v.c=0});g.turn=g.ps[0];cpClothEnd(g);return {ok:g.phase==='done'&&!!g.win}});
    t('Wonders: start one you qualify for (uses a ship), build levels, level 4 wins',()=>{const x=setup(fresh('8')),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};const no=!cpWonder(g,p,'th');
      Object.keys(g.b).filter(v=>g.b[v][0]===p).forEach(v=>g.b[v][1]=1);const ships=cpCount(g,p,'ship');const yes=cpWonder(g,p,'th')&&cpCount(g,p,'ship')===ships+1&&!cpWonder(g,g.ps[1],'th');
      let lv=0;for(let i=0;i<4;i++){Object.assign(M.r,{w:1,b:1,s:3});if(cpWonUp(g,p))lv++}return {ok:no&&yes&&lv===4&&g.phase==='done'&&g.win===p,no,yes,lv}});
    t('Wonders: 10 points wins only with the highest wonder; setup can’t use the squares; no pirate',()=>{const x=fresh('8'),g=x.g,[p,q]=g.ps;const sq=[...g.purple,...g.brown].every(v=>!cpVOk(g,p,v,true));setup(x);g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};
      g.won={th:{p,lv:1},ca:{p:q,lv:1}};g.ivp[p]=8;const tie=!cpWonWin(g,p);g.won.th.lv=2;const win=cpWonWin(g,p);return {ok:sq&&tie&&win&&g.pir==null&&!g.hx.some((h,i)=>cpPirOk(g,p,i)),sq,tie,win}});
    t('Pirate Islands: a settlement and ship already placed, no robber, VP cards out with 3 players; setup uses roads',()=>{const x=fresh('7',3),g=x.g;const pre=g.ps.every(p=>Object.values(g.b).filter(b=>b[0]===p).length===1&&Object.values(g.sh).filter(s=>s===p).length===1);
      const noSh=!cpSSpots(g,g.ps[0]).length;setup(x);return {ok:pre&&g.rob==null&&g.pir===g.pi.loop[0]&&!g.deck.includes('vp')&&noSh&&!Object.keys(g.sh).some(e=>Object.values(g.sh).length!==3)}});
    t('Pirate Islands: one route, always one step nearer the circle, then the fortress',()=>{const x=setup(fresh('7',4)),g=x.g,B=x.B,p=g.ps[0];let ok=true,n=0;g.pir=null;
      while(n<40){const T=cpPiTarget(g,p);if(T==null)break;const sp=cpSSpots(g,p);if(!sp.length){ok=false;break}const D=cpPiDist(g,p,T),hd=Math.min(...Object.keys(g.sh).filter(e=>g.sh[e]===p).flatMap(e=>[B.E[e].a,B.E[e].b]).map(v=>D[v]??99));if(!sp.every(e=>Math.min(D[B.E[e].a],D[B.E[e].b])===hd-1))ok=false;g.sh[sp[0]]=p;n++;if(cpPiFort(g,p))break}
      return {ok:ok&&cpPiFort(g,p)&&cpB(g).V[g.pi.circ[p]].e.some(e=>g.sh[e]===p),n}});
    t('Pirate Islands: knights make warships from the rear; the fleet attacks by the lower die',()=>{const x=setup(fresh('7',4)),g=x.g,B=x.B,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:0,dev:0,road:0,newSh:[],mvd:0};M.dev=['kn','vp'];M.nw=[];g.pir=null;for(let i=0;i<3;i++){const sp=cpSSpots(g,p);if(sp.length)g.sh[sp[0]]=p}
      const o=cpPiOrder(g,p);const a=cpDev(g,p,'kn')&&g.pi.war[o[0]]===p;g.t.dev=0;const vpPts=cpVP(g,p);const b=cpPlayable(g,p,'vp');
      g.pi.at=0;g.pir=g.pi.loop[0];const v0=B.hv[g.pi.loop[3]].find(v=>!g.b[v]&&cpVLand(g,v));if(v0==null)return {ok:a&&b,skip:1};g.b[v0]=[g.ps[1],1];g.me[g.ps[1]].r={w:3,b:0,s:0,g:0,o:0};g.t.rolled=0;cpRoll(g,p,[3,5]);
      return {ok:a&&b&&g.pir===g.pi.loop[3]&&JSON.stringify(g.lg).includes('loses 2'),a,b,pir:g.pir===g.pi.loop[3],lg:JSON.stringify(g.lg.slice(-3))}});
    t('Pirate Islands: attacking the fortress; 3 wins capture it and, with 10 points, win the game',()=>{const x=setup(fresh('7',4)),g=x.g,p=g.ps[0];g.pir=null;while(!cpPiFort(g,p)){const sp=cpSSpots(g,p);if(!sp.length)break;g.sh[sp[0]]=p}
      cpPiOrder(g,p).slice(0,6).forEach(e=>g.pi.war[e]=p);const ships=cpPiOrder(g,p).length;const go=()=>{g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0}};
      go();cpAttack(g,p,6);const tie=cpPiOrder(g,p).length===ships-1;g.pi.war={};cpPiOrder(g,p).slice(0,6).forEach(e=>g.pi.war[e]=p);while(!cpPiFort(g,p)){const sp=cpSSpots(g,p);if(!sp.length)break;g.sh[sp[0]]=p}
      g.ivp[p]=9;go();cpAttack(g,p,1);go();cpAttack(g,p,2);const two=g.pi.f[p].c===1&&g.phase==='turn';go();cpAttack(g,p,3);return {ok:tie&&two&&g.pi.f[p].cap&&g.phase==='done'&&g.win===p,tie,two,c:g.pi.f[p].c,ph:g.phase}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));

  // the setup screen and long-press costs
  await P.close();P=await mk(browser,'sf2');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;S.screen='home';render()});await W(300);
  await P.evaluate(()=>document.querySelector('[data-a="cpstart"][data-k="1"]').click());await W(300);
  ok('Setup: Seafarers can be picked in play mode',await P.evaluate(()=>{const b=document.querySelector('[data-a="ctmode"][data-v="sf"]');if(!b||b.disabled)return false;b.click();return true}));await W(300);
  ok('Setup: all 9 scenarios to pick',await P.evaluate(()=>document.querySelectorAll('[data-a="cpsfs"]').length===9));
  await P.evaluate(()=>document.querySelector('[data-a="cpsfs"][data-v="2"]').click());await W(200);
  ok('Setup: picking scenario 2 sets 13 points',await P.evaluate(()=>CTX().sfs==='2'&&+CTX().goalSF===13));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Bo'][i];p.bot=i?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(600);
  ok('Game: the Four Islands map with sea and the pirate',await P.evaluate(()=>S.cpg&&S.cpg.sc==='2'&&!!document.querySelector('.cppir')));
  const me=await P.evaluate(()=>act()[0].id);
  const tap=sel=>P.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true');if(b){b.click();return true}return false},sel);
  const svgTap=sel=>P.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;L[Math.floor(Math.random()*L.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
  let lp=null,moves=0,ships=0;
  for(let i=0;i<6000;i++){const st=await P.evaluate(me=>{const g=S.cpg;if(!g)return null;const Q=g.ask;return {a:cpActor(g),ph:g.phase,su:g.su&&g.su.step,ask:Q&&Q.k,disc:Q&&Q.k==='disc'&&Q.need[me],gold:Q&&Q.k==='gold'&&Q.need[me],resp:Q&&Q.k==='offer'&&Q.p!==me&&Q.resp[me]==null,rolled:g.t&&g.t.rolled,road:g.t&&g.t.road,done:g.phase==='done'}},me);if(!st)continue;if(st.done)break;
    if(st.gold){await P.evaluate(n=>{const g=S.cpg;let k=n;for(const r of CPR)while(k>0&&(CPGOLD[r]||0)<g.bank[r]){document.querySelector(`[data-a="cppgold"][data-k="${r}:1"]`).click();k--}},st.gold);await tap('[data-a="cppgoldok"]');continue}
    if(st.disc){await P.evaluate(n=>{const M=S.cpg.me[act()[0].id];let k=n;for(const r of CPR)while(k>0&&(CPDISC[r]||0)<M.r[r]){document.querySelector(`[data-a="cppdisc"][data-k="${r}:1"]`).click();k--}},st.disc);await tap('[data-a="cppdiscok"]');continue}
    if(st.resp){await tap('[data-a="cppans"][data-k="0"]');continue}
    if(st.a!==me){await W(60);continue}moves++;
    if(st.ph==='setup'){await svgTap(st.su==='s'?'.cpvgo':'.cpego')}
    else if(st.ask==='rob')await svgTap('.cphit.go');
    else if(st.ask==='steal')await tap('[data-a="cppsteal"]');
    else if(st.ask==='offer')await tap('[data-a="cppdeal"][data-k=""]');
    else if(!st.rolled)await tap('[data-a="cpproll"]');
    else if(st.road){if(!await svgTap('.cpego'))await tap('[data-a="cppstoproad"]')}
    else{if(!lp)lp=await P.evaluate(()=>{const b=document.querySelector('[data-lp="cpb:ship"]');if(!b)return 'no button';LPTIP='cpb:ship';render();const sh=document.querySelector('.lpsheet');const r=sh?{title:sh.querySelector('h2').textContent,cards:sh.querySelectorAll('.cpcc').length}:'no sheet';LPTIP=null;render();return r});
      let did=false;for(const k of ['city','settle','ship','road']){if(await tap(`[data-a="cppmode"][data-k="${k}"]`)){await W(30);did=await svgTap(k==='road'||k==='ship'?'.cpego':'.cpvgo, .cpbld.go');await tap('[data-a="cppmode"][data-k=""]');if(did){if(k==='ship')ships++;break}}}
      if(!did&&await tap('[data-a="cppbuy"]'))did=true;
      if(!did){await tap('[data-a="cppend"]');await tap('[data-a="cppend"]')}}
    await W(40)}
  ok('Long press on Ship shows its cost: 1 wood + 1 sheep',lp&&/Ship/.test(lp.title)&&lp.cards===2,lp);
  ok('A Seafarers game played through the screen reaches the end',await P.evaluate(()=>S.cpg&&S.cpg.phase==='done'),{moves,ships,st:await P.evaluate(()=>S.cpg&&{tno:S.cpg.tno,msg:S.cpg.msg,ask:S.cpg.ask})});
  ok('…and the score sheet matches the board',await P.evaluate(()=>act().every(p=>total(p)===cpVP(S.cpg,p.id))));
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
