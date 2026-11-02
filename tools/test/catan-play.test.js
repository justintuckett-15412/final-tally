// Catan on the phone (base game): the board, setup, dice and production, 7s and the robber, building rules,
// development cards, Longest Road, Largest Army, trading, the end; a game played through the screen; bot games; two linked phones.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
(async()=>{const browser=await chromium.launch();let P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const R=await P.evaluate(()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const fresh=(n=3)=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1});S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=null});S.started=true;cpDeal();const g=S.cpg;return {g,ids:g.ps,M:id=>g.me[id],B:cpB(g)}};
    /* play the setup with the bot brain, then hand back to people */
    const setup=x=>{const g=x.g;while(g.phase==='setup'){const q=act().find(p=>p.id===cpActor(g));q.bot='normal';cpBotStep(g,q);q.bot=null}return x};
    const give=(M,o)=>Object.entries(o).forEach(([r,n])=>{M.r[r]+=n});
    t('Board: 19 hexes (4 forest, 3 hills, 4 pasture, 4 fields, 3 mountains, 1 desert), 18 numbers, robber on the desert, 9 harbors',()=>{let bad=[];for(let i=0;i<30;i++){const {g,B}=fresh();const c={};g.hx.forEach(h=>c[h[2]]=(c[h[2]]||0)+1);
      if(c.f!==4||c.h!==3||c.p!==4||c.l!==4||c.m!==3||c.d!==1)bad.push('tiles');if(g.hx.filter(h=>h[3]).map(h=>h[3]).sort((a,b)=>a-b).join()!=='2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12')bad.push('numbers');
      if(g.hx[g.rob][2]!=='d')bad.push('robber');if(B.V.length!==54||B.E.length!==72)bad.push('geometry '+B.V.length+'/'+B.E.length);const ht={};g.hb.forEach(h=>ht[h[1]]=(ht[h[1]]||0)+1);if(ht.any!==4||['w','b','s','g','o'].some(r=>ht[r]!==1))bad.push('harbors')}return {ok:!bad.length,bad:bad.slice(0,4)}});
    t('Setup: snake order, distance rule, the second settlement collects',()=>{const x=fresh(3),g=x.g;const order=g.su.order.join();const first=g.turn;const v=cpVSpots(g,first,true)[0];cpSetSettle(g,first,v);const nb=x.B.V[v].n[0];const dist=!cpVOk(g,g.ps[1],nb,true);
      setup(x);const p0=g.ps[0];const lastV=Object.keys(g.b).map(Number).filter(v=>g.b[v][0]===p0);return {ok:order===[...g.ps,...g.ps.slice().reverse()].join()&&dist&&g.phase==='turn'&&g.turn===g.ps[0]&&g.ps.every(p=>cpCount(g,p,'settle')===2&&cpCount(g,p,'road')===2)}});
    t('Dice: settlements collect 1, cities 2, not under the robber',()=>{const x=setup(fresh(3)),g=x.g,p=g.ps[0];const hi=g.hx.findIndex((h,i)=>h[3]&&i!==g.rob);const v=x.B.hv[hi].find(v=>!g.b[v]&&x.B.V[v].n.every(u=>!g.b[u]));if(v==null)return {ok:true,skip:1};
      g.b[v]=[p,1];const r=CPHEX[g.hx[hi][2]][1];const before=x.M(p).r[r];g.t={rolled:0,dev:0,road:0};g.turn=p;const n=g.hx[hi][3],d=n===7?null:[Math.min(6,n-1),n-Math.min(6,n-1)];cpRoll(g,p,d);const got=x.M(p).r[r]-before;
      g.rob=hi;g.t={rolled:0,dev:0,road:0};const b2=x.M(p).r[r];cpRoll(g,p,d);return {ok:got>=2&&x.M(p).r[r]===b2+(x.B.hv[hi].filter(()=>false).length),got}});
    t('A 7: more than 7 cards discards half, then the robber moves and steals',()=>{const x=setup(fresh(3)),g=x.g,[a,b]=g.ps;Object.assign(x.M(b).r,{w:5,b:4,s:0,g:0,o:0});Object.assign(x.M(a).r,{w:1,b:1,s:1,g:1,o:1});g.turn=a;g.t={rolled:0,dev:0,road:0};
      cpRoll(g,a,[3,4]);const need=g.ask&&g.ask.k==='disc'&&g.ask.need[b]===4&&!g.ask.need[a];const no=!cpDiscard(g,b,{w:3});cpDiscard(g,b,{w:2,b:2});const rob=g.ask&&g.ask.k==='rob';
      const hi=g.hx.findIndex((h,i)=>i!==g.rob&&x.B.hv[i].some(v=>g.b[v]&&g.b[v][0]===b));const n0=cpSum(x.M(a).r);cpRobber(g,a,hi);if(g.ask&&g.ask.k==='steal')cpSteal(g,a,b);return {ok:need&&no&&rob&&g.rob===hi&&cpSum(x.M(a).r)===n0+1&&cpSum(x.M(b).r)===4}});
    t('Building: roads must connect; settlements need a road and the distance rule; pay the cost',()=>{const x=setup(fresh(3)),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0};Object.assign(M.r,{w:5,b:5,s:5,g:5,o:5});
      const far=x.B.E.map((e,i)=>i).find(e=>!cpEOk(g,p,e)&&g.rd[e]==null);const no=!cpBuildRoad(g,p,far);const e=cpESpots(g,p)[0];const yes=cpBuildRoad(g,p,e)&&M.r.w===4&&M.r.b===4;
      const bad=cpB(g).V.map((v,i)=>i).find(v=>!g.b[v]&&!cpVOk(g,p,v,false));return {ok:no&&yes&&!cpBuildSettle(g,p,bad)}});
    t('City: replaces your settlement for 2 wheat + 3 ore; points 1 → 2',()=>{const x=setup(fresh(3)),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0};Object.assign(M.r,{w:0,b:0,s:0,g:2,o:3});const v=cpCSpots(g,p)[0];const vp=cpVis(g,p);return {ok:cpBuildCity(g,p,v)&&g.b[v][1]===1&&cpVis(g,p)===vp+1&&M.r.g===0&&M.r.o===0}});
    t('Development cards: 25 in the deck; not on the turn you buy it; one per turn',()=>{const x=setup(fresh(3)),g=x.g,p=g.ps[0],M=x.M(p);const c={};g.deck.forEach(d=>c[d]=(c[d]||0)+1);const deckOk=g.deck.length===25&&c.kn===14&&c.vp===5&&c.rb===2&&c.yp===2&&c.mo===2;
      g.turn=p;g.t={rolled:1,dev:0,road:0};Object.assign(M.r,{s:2,g:2,o:2});g.deck.push('kn');cpBuyDev(g,p);const notNew=!cpDev(g,p,'kn');M.dev.push('kn','kn');const one=cpDev(g,p,'kn');if(g.ask&&g.ask.k==='rob'){cpRobber(g,p,g.hx.findIndex((h,i)=>i!==g.rob));if(g.ask)cpSteal(g,p,g.ask.opts[0])}const two=!cpDev(g,p,'kn');return {ok:deckOk&&notNew&&one&&two}});
    t('Year of Plenty, Monopoly and Road Building',()=>{const x=setup(fresh(3)),g=x.g,[p,q,r]=g.ps,M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0};M.dev=['yp','mo','rb'];M.nw=[];M.r={w:0,b:0,s:0,g:0,o:0};cpDev(g,p,'yp','o','o');const yp=M.r.o===2;
      g.t.dev=0;x.M(q).r.s=3;x.M(r).r.s=2;cpDev(g,p,'mo','s');const mo=M.r.s===5&&x.M(q).r.s===0;g.t.dev=0;const r0=cpCount(g,p,'road');cpDev(g,p,'rb');cpBuildRoad(g,p,cpESpots(g,p)[0]);cpBuildRoad(g,p,cpESpots(g,p)[0]);return {ok:yp&&mo&&cpCount(g,p,'road')===r0+2&&!g.t.road}});
    t('Largest Army: 3 knights; someone else must play more to take it',()=>{const x=setup(fresh(3)),g=x.g,[p,q]=g.ps;x.M(p).kn=3;cpArmy(g);const a=g.la===p;x.M(q).kn=3;cpArmy(g);const b=g.la===p;x.M(q).kn=4;cpArmy(g);return {ok:a&&b&&g.la===q}});
    t('Longest Road: 5 in a row; broken by another player’s settlement',()=>{const x=fresh(3),g=x.g,B=x.B,[p,q]=g.ps;g.phase='turn';g.su=null;
      /* a path of 6 edges around one hex */const hi=g.hx.findIndex(()=>true);const cs=B.hv[9];for(let k=0;k<5;k++)g.rd[cpEdge(B,cs[k],cs[k+1])]=p;cpLongest(g);const has=g.lr===p&&cpRoadLen(g,p)===5;
      g.b[cs[2]]=[q,0];cpLongest(g);const len=cpRoadLen(g,p);return {ok:has&&len===3&&g.lr===null,len,lr:g.lr}});
    t('Bank and harbors: 4:1, 3:1 and 2:1',()=>{const x=setup(fresh(3)),g=x.g,B=x.B,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0};M.r={w:4,b:0,s:0,g:0,o:0};const rate=cpRate(g,p,'w');const r=cpBank(g,p,'w','o',Math.floor(4/rate));
      const h2=g.hb.find(h=>h[1]==='b'),e=B.E[h2[0]];g.b[e.a]=[p,0];return {ok:r&&M.r.o>=1&&cpRate(g,p,'b')===2&&[2,3,4].includes(rate)}});
    t('Trading: offer, the others answer, you pick who; you can’t accept what you don’t have',()=>{const x=setup(fresh(3)),g=x.g,[p,q,r]=g.ps;g.turn=p;g.t={rolled:1,dev:0,road:0};x.M(p).r={w:2,b:0,s:0,g:0,o:0};x.M(q).r={w:0,b:0,s:0,g:1,o:0};x.M(r).r={w:0,b:0,s:0,g:0,o:0};
      cpOffer(g,p,{w:2},{g:1});const no=!cpAnswer(g,r,true);cpAnswer(g,r,false);cpAnswer(g,q,true);const d=cpDeal2(g,p,q);return {ok:no&&d&&x.M(p).r.g===1&&x.M(q).r.w===2&&!g.ask}});
    t('The bank runs short: nobody gets that resource unless only one player is owed',()=>{const x=setup(fresh(3)),g=x.g,B=x.B,[p,q]=g.ps;const hi=g.hx.findIndex((h,i)=>h[3]&&h[3]!==7&&i!==g.rob);const r=CPHEX[g.hx[hi][2]][1];Object.keys(g.b).forEach(v=>delete g.b[v]);
      const vs=B.hv[hi];g.b[vs[0]]=[p,0];g.b[vs[3]]=[q,0];g.bank[r]=1;const a=g.me[p].r[r],b=g.me[q].r[r];cpProduce(g,g.hx[hi][3]);return {ok:g.me[p].r[r]===a&&g.me[q].r[r]===b&&g.bank[r]===1}});
    t('Winning: 10 points on your own turn; hidden Victory Point cards count; the score sheet matches',()=>{const x=setup(fresh(3)),g=x.g,p=g.ps[0],M=x.M(p);g.turn=p;g.t={rolled:1,dev:0,road:0};const cs=cpCSpots(g,p);cs.forEach(v=>g.b[v][1]=1);M.dev=['vp','vp','vp','vp'];g.lr=p;cpWin(g,p);
      const pl=act().find(q=>q.id===p);return {ok:g.phase==='done'&&g.win===p&&total(pl)===cpVP(g,p)&&cpVP(g,p)>=10,vp:cpVP(g,p),tot:total(pl)}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));

  // a game through the screen: one person against three computer players
  await P.close();P=await mk(browser,'q');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;S.screen='home';render()});await W(300);
  ok('Home: Catan card with Play and Track',await P.evaluate(()=>!!document.querySelector('[data-a="cpstart"][data-k="1"]')&&!!document.querySelector('[data-a="cpstart"][data-k="0"]')));
  await P.evaluate(()=>document.querySelector('[data-a="cpstart"][data-k="1"]').click());await W(300);
  ok('Setup: play mode on, expansions marked as coming',await P.evaluate(()=>cpOn()&&document.querySelectorAll('[data-a="ctmode"][disabled]').length===3));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Kim','Bo','Al'][i];p.bot=i?['easy','normal','hard'][i-1]:null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1200);
  const me=await P.evaluate(()=>act()[0].id);let moves=0,traded=0;
  const tap=sel=>P.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(b){b.click();return true}return false},sel);
  const svgTap=sel=>P.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;L[Math.floor(Math.random()*L.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
  for(let i=0;i<5000;i++){const st=await P.evaluate(me=>{const g=S.cpg;if(!g)return null;const Q=g.ask;return {a:cpActor(g),ph:g.phase,su:g.su&&g.su.step,ask:Q&&Q.k,disc:Q&&Q.k==='disc'&&Q.need[me],resp:Q&&Q.k==='offer'&&Q.p!==me&&Q.resp[me]==null,rolled:g.t&&g.t.rolled,road:g.t&&g.t.road,done:g.phase==='done'}},me);if(!st)continue;if(st.done)break;
    if(st.disc){await P.evaluate(n=>{const M=S.cpg.me[act()[0].id];let k=n;for(const r of CPR)while(k>0&&(CPDISC[r]||0)<M.r[r]){document.querySelector(`[data-a="cppdisc"][data-k="${r}:1"]`).click();k--}},st.disc);await tap('[data-a="cppdiscok"]');moves++;continue}
    if(st.resp){await tap(`[data-a="cppans"][data-k="${Math.random()<.5?1:0}"]`);continue}
    if(st.a!==me){await W(80);continue}moves++;
    if(st.ph==='setup'){await svgTap(st.su==='s'?'.cpvgo':'.cpego')}
    else if(st.ask==='rob')await svgTap('.cphit.go');
    else if(st.ask==='steal')await tap('[data-a="cppsteal"]');
    else if(st.ask==='offer'){if(!await tap('[data-a="cppdeal"][data-k]:not([data-k=""])'))await tap('[data-a="cppdeal"][data-k=""]')}
    else if(!st.rolled)await tap('[data-a="cpproll"]');
    else if(st.road){if(!await svgTap('.cpego'))await tap('[data-a="cppstoproad"]')}
    else{let did=false;for(const k of ['city','settle','road']){if(await tap(`[data-a="cppmode"][data-k="${k}"]`)){await W(40);did=await svgTap(k==='road'?'.cpego':'.cpvgo, .cpbld.go');await tap('[data-a="cppmode"][data-k=""]');if(did)break}}
      if(!did&&await tap('[data-a="cppbuy"]'))did=true;
      if(!did&&traded<6&&Math.random()<.3){/* a bank trade or an offer */await tap('[data-a="cppmode"][data-k="trade"]');await P.evaluate(()=>{const M=S.cpg.me[act()[0].id],g=S.cpg,r=CPR.slice().sort((a,b)=>M.r[b]-M.r[a])[0],rate=cpRate(g,act()[0].id,r);if(M.r[r]>=rate){for(let i=0;i<rate;i++)document.querySelector(`[data-a="cpptr"][data-k="give:${r}:1"]`).click();const w=CPR.find(x=>x!==r);document.querySelector(`[data-a="cpptr"][data-k="want:${w}:1"]`).click()}});
        if(await tap('[data-a="cppbank"]'))traded++;else{await tap('[data-a="cppmode"][data-k=""]')}}
      if(!did){await tap('[data-a="cppend"]');await tap('[data-a="cppend"]')}}
    await W(50)}
  ok('A game played through the screen against 3 computer players reaches the end',await P.evaluate(()=>S.cpg&&S.cpg.phase==='done'),{moves,st:await P.evaluate(()=>S.cpg&&{ph:S.cpg.phase,tno:S.cpg.tno,msg:S.cpg.msg,ask:S.cpg.ask})});
  ok('…and the score sheet matches the board',await P.evaluate(()=>act().every(p=>total(p)===cpVP(S.cpg,p.id))));
  await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(b)b.click()});await W(800);
  ok('Finish leads to the reveal or results',await P.evaluate(()=>['reveal','results'].includes(S.screen)),await P.evaluate(()=>S.screen));
  for(const n of [3,4]){await P.evaluate(n=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1});S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;p.bot=i<n?['easy','normal','hard'][i%3]:null});S.screen='score';S.started=true;save();render()},n);
    let fin=false;for(let i=0;i<240&&!fin;i++){await W(400);fin=await P.evaluate(()=>!!S.cpg&&S.cpg.phase==='done')}ok(`${n} computer players: the game ends`,fin,await P.evaluate(()=>S.cpg&&{tno:S.cpg.tno,msg:S.cpg.msg}))}
  await P.close();
  // two linked phones and a computer player
  const H=await mk(browser,'host'),G=await mk(browser,'guest');[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;switchGame('catan');resetScores();Object.assign(CTX(),{play:1,mode:'base'});const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{window.__htfast=1});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);await readyAll([H,G]);
  ok('Linked: host dealt the island',await H.evaluate(()=>!!S.cpg&&S.cpg.ps.length===3));
  ok('Linked: guest sees the same island',await H.evaluate(()=>JSON.stringify(S.cpg.hx))===await G.evaluate(()=>JSON.stringify(S.cpg&&S.cpg.hx)));
  const step=async Q=>{const st=await Q.evaluate(()=>{const g=S.cpg;if(!g||!S.lk)return null;const V=cpViewer();if(!V)return null;const A=g.ask;return {me:V.id,mine:cpActor(g)===V.id,ph:g.phase,su:g.su&&g.su.step,ask:A&&A.k,disc:A&&A.k==='disc'&&A.need[V.id],resp:A&&A.k==='offer'&&A.p!==V.id&&A.resp[V.id]==null,rolled:g.t&&g.t.rolled,road:g.t&&g.t.road,wait:lkqWaiting()}});
    if(!st||st.wait||st.ph==='done')return false;const tp=sel=>Q.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(b){b.click();return true}return false},sel);
    const sv=sel=>Q.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;L[Math.floor(Math.random()*L.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
    if(st.disc){await Q.evaluate(n=>{const g=S.cpg,M=g.me[cpViewer().id];let k=n;for(const r of CPR)while(k>0&&(CPDISC[r]||0)<M.r[r]){document.querySelector(`[data-a="cppdisc"][data-k="${r}:1"]`).click();k--}},st.disc);return tp('[data-a="cppdiscok"]')}
    if(st.resp)return tp('[data-a="cppans"][data-k="0"]');if(!st.mine)return false;
    if(st.ph==='setup')return sv(st.su==='s'?'.cpvgo':'.cpego');if(st.ask==='rob')return sv('.cphit.go');if(st.ask==='steal')return tp('[data-a="cppsteal"]');if(st.ask==='offer')return tp('[data-a="cppdeal"][data-k=""]');
    if(!st.rolled)return tp('[data-a="cpproll"]');if(st.road){if(await sv('.cpego'))return true;return tp('[data-a="cppstoproad"]')}
    for(const k of ['city','settle','road']){if(await tp(`[data-a="cppmode"][data-k="${k}"]`)){await W(30);const d=await sv(k==='road'?'.cpego':'.cpvgo, .cpbld.go');await tp('[data-a="cppmode"][data-k=""]');if(d)return true}}
    if(await tp('[data-a="cppbuy"]'))return true;await tp('[data-a="cppend"]');return tp('[data-a="cppend"]')};
  let hm=0,gm=0,lastK='',same=0;for(let t=0;t<(process.env.FULL?9000:2500);t++){if(await step(H))hm++;if(await step(G))gm++;await W(60);
    if(t%50===0){const k=await H.evaluate(()=>JSON.stringify([S.cpg.phase,cpActor(S.cpg),S.cpg.n]));same=k===lastK?same+1:0;lastK=k;if(same>=5){console.log('DBG stuck',k,await G.evaluate(()=>JSON.stringify([S.cpg.n,lkqWaiting(),S.cpg.msg])));break}}
    if(await H.evaluate(full=>S.cpg&&(S.cpg.phase==='done'||!full&&S.cpg.tno>=24),!!process.env.FULL))break}
  await W(3000);const hs=await H.evaluate(()=>({ph:S.cpg.phase,n:S.cpg.n,b:S.cpg.b,me:S.cpg.me})),gs=await G.evaluate(()=>({ph:S.cpg.phase,n:S.cpg.n,b:S.cpg.b,me:S.cpg.me}));
  ok('Linked: both phones moved',hm>5&&gm>5,{hm,gm});ok('Linked: 24 turns played',await H.evaluate(()=>S.cpg.tno>=24||S.cpg.phase==='done'));
  ok('Linked: both phones agree on the board and the cards',JSON.stringify(hs)===JSON.stringify(gs));
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
