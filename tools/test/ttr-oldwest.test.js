// Playable Ticket to Ride, Old West (Map Collection 6): home cities, the network rule, City Markers and who scores a route,
// Alvin the Alien (variant), 2–6 players, whole computer games, the reveal, and the screen.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'ow');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('trstart','1');
    S.trmap='oldwest';S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed','Flo'][i];p.bot=null});save();c('start')});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,500)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const M=TRMAP.oldwest,ci=n=>M.cities.findIndex(c=>c[0]===n),rid=(a,b,c)=>M.routes.findIndex(r=>{const x=[M.cities[r[0]][0],M.cities[r[1]][0]];return x.includes(a)&&x.includes(b)&&(!c||r[3]===c)});
    const G=(n,o={})=>{S.trmap='oldwest';S.trhr={alvin:o.alvin?1:0};S.players.forEach((x,i)=>{x.on=i<n;x.bot=o.bots?['easy','normal','hard','normal','hard','normal'][i]:null});const g=trDeal();g.ann=null;return g};
    const keepAll=g=>{g.ps.forEach(p=>{if(g.offer[p])trKeep(g,p,g.offer[p].slice(0,3))});g.ann=null};
    const homes=(g,L)=>{L.forEach(([p,c])=>trHome(g,p,ci(c)));g.ann=null};
    t('Old West map: 41 cities, 139 routes, 42 tickets; every ticket names real cities; one ferry (San Francisco–Los Angeles, 7 with 3 locomotives)',()=>{const f=M.routes.filter(r=>r[5]);
      return {ok:M.cities.length===41&&M.routes.length===139&&M.tickets.length===42&&M.tickets.every(t=>M.cities[t[0]]&&M.cities[t[1]])&&f.length===1&&f[0][2]===7&&f[0][5]===3,f}});
    t('Deal: 40 trains, 5 tickets (keep at least 3), later 4; 3 City Markers each; Globetrotter, no longest route; 6 players work',()=>{const g=G(6),[a]=g.ps;const d=g.ps.length===6&&g.ps.every(p=>g.tr[p]===40&&g.offer[p].length===5&&g.cm[p]===3)&&g.globe&&g.long===0;
      const no=!trKeep(g,a,g.offer[a].slice(0,2));return {ok:d&&no,d,no,n:g.ps.length}});
    t('Home cities: after the tickets, in reverse order, each player puts a City Marker on a free city; then the first player starts',()=>{const g=G(3),[a,b,c]=g.ps;keepAll(g);const ph=g.phase==='home'&&trActor(g)===c;
      const no1=!trHome(g,a,ci('Boise'));trHome(g,c,ci('Boise'));const no2=!trHome(g,b,ci('Boise'));trHome(g,b,ci('Denver'));trHome(g,a,ci('Seattle'));
      return {ok:ph&&no1&&no2&&g.phase==='play'&&g.turn===a&&g.home[a]===ci('Seattle')&&g.cm[a]===2&&g.cmOn[ci('Boise')]===c,ph,no1,no2,phase:g.phase}});
    t('Network rule: the first route must start at your home city; every later one must touch your network',()=>{const g=G(2),[a,b]=g.ps;keepAll(g);homes(g,[[b,'Denver'],[a,'Seattle']]);g.turn=a;
      const far=!trRouteOk(g,a,rid('Portland','Eugene','R')),near=trRouteOk(g,a,rid('Seattle','Portland','G'));g.own[rid('Seattle','Portland','G')]=a;const next=trRouteOk(g,a,rid('Portland','Eugene','R'));
      return {ok:far&&near&&next,far,near,next}});
    t('Scoring: a route into another player’s marked city scores for them, not you; mark one end yourself and you both score; one player marking both ends scores it twice',()=>{const g=G(3),[a,b,c]=g.ps;keepAll(g);homes(g,[[c,'Portland'],[b,'Spokane'],[a,'Seattle']]);
      g.ps.forEach(p=>{g.sc[p]=0;g.hand[p]={R:0,O:0,Y:0,G:4,B:9,P:0,K:9,W:9,L:0}});g.turn=a;g.drew=0;
      trClaim(g,a,rid('Seattle','Portland','G'),{c:'G',n:2,L:0});if(g.phase==='cmk')trCm(g,a,'skip');const s1=[g.sc[a],g.sc[c]].join();/* a marks Seattle: a 2 + c 2 */
      g.turn=b;trClaim(g,b,rid('Seattle','Spokane','B'),{c:'B',n:4,L:0});if(g.phase==='cmk')trCm(g,b,'skip');const s2=[g.sc[a],g.sc[b]].join();/* a 2+7, b 7 */
      g.turn=c;g.cmOn[ci('Eugene')]=c;trClaim(g,c,rid('Portland','Eugene','K'),{c:'K',n:1,L:0});if(g.phase==='cmk')trCm(g,c,'skip');const s3=g.sc[c];/* c 2 + 1 + 1 */
      return {ok:s1==='2,2'&&s2==='9,7'&&s3===4,s1,s2,s3}});
    t('City Marker: after a claim, put one on either end for a pair of one colour (locomotives wild); skip is fine; one per city, 3 at most',()=>{const g=G(2),[a,b]=g.ps;keepAll(g);homes(g,[[b,'Denver'],[a,'Seattle']]);g.turn=a;g.hand[a]={R:0,O:0,Y:0,G:2,B:0,P:0,K:1,W:0,L:1};
      trClaim(g,a,rid('Seattle','Portland','G'),{c:'G',n:2,L:0});const q=g.phase==='cmk'&&g.cmq.c.join()===String(ci('Portland'));const bad=!trCm(g,a,ci('Portland'),{c:'K',n:2,L:0});const y=trCm(g,a,ci('Portland'),{c:'K',n:1,L:1});
      return {ok:q&&bad&&y&&g.cmOn[ci('Portland')]===a&&g.cm[a]===1&&g.hand[a].L===0&&g.turn===b,q,bad,y}});
    t('Alvin (variant): starts in Roswell, nobody may start there; a route into his city captures him (+10) and he moves to your city; whoever has him at the end +10',()=>{const g=G(2,{alvin:1}),[a,b]=g.ps;keepAll(g);const no=!trHome(g,b,ci('Roswell'));homes(g,[[b,'Denver'],[a,'Las Cruces']]);
      g.turn=a;g.sc[a]=0;g.hand[a]={R:0,O:0,Y:0,G:2,B:0,P:0,K:0,W:0,L:0};trClaim(g,a,rid('Las Cruces','Roswell'),{c:'G',n:2,L:0});const cap=g.alv.by===a&&g.alv.c===ci('Las Cruces')&&g.sc[a]===12;
      if(g.phase==='cmk')trCm(g,a,'skip');g.ps.forEach(p=>g.tix[p]=[]);trEnd(g);return {ok:no&&cap&&g.fin[a].alvb===10&&g.fin[a].cmp===10,no,cap,sc:g.sc[a]}});
    t('Computer players finish whole games, 2 to 6 players, with and without Alvin: cards and trains add up; the score is routes + tickets + others’ routes + Globetrotter + Alvin',()=>{const bad=[];let games=0,marks=0,cmp=0;
      for(const n of [2,3,4,5,6])for(const al of [0,1]){const g=G(n,{bots:1,alvin:al});let k=0;while(g.phase!=='done'&&k++<8000){const q=act().find(x=>x.id===trActor(g));if(!trBotStep(g,q))trBotRescue(g,q)}games++;
        if(g.phase!=='done'){bad.push(n+' stuck '+g.phase);continue}const cards=g.deck.length+g.disc.length+g.face.filter(Boolean).length+g.ps.reduce((a,p)=>a+TRCARDS.reduce((x,c)=>x+(g.hand[p][c]||0),0),0);if(cards!==110)bad.push(n+' cards '+cards);
        marks+=Object.keys(g.cmOn).length;g.ps.forEach(p=>{cmp+=g.cmp[p];const used=Object.keys(g.own).filter(r=>g.own[r]===p).reduce((a,r)=>a+M.routes[r][2],0);if(used+g.tr[p]!==40)bad.push(n+' trains');const F=g.fin[p],rp=Object.entries(F.routes).reduce((a,[l,c])=>a+TRPTS[l]*c,0);
          if(rp+F.tv+F.cmp+(F.gt?15:0)+(F.alvb||0)!==g.sc[p])bad.push(n+' score '+[rp,F.tv,F.cmp,F.gt,F.alvb,g.sc[p]]);const own=Object.keys(g.own).filter(r=>g.own[r]===p);if(own.length&&!own.every(r=>{const N=new Set([g.home[p]]);let grow=true;while(grow){grow=false;own.forEach(x=>{const [u,v]=M.routes[x];if(N.has(u)!==N.has(v)){N.add(u);N.add(v);grow=true}})}return N.has(M.routes[r][0])}))bad.push(n+' network')})}
      return {ok:!bad.length&&games===10&&marks>20&&cmp>0,bad:bad.slice(0,6),marks,cmp}});
    return out});
  R.forEach(([n,y,why])=>ok(n,y,why));
  // the screen: choose a home city by tapping it, then confirm
  await P.evaluate(()=>{S.trmap='oldwest';S.trhr={};S.players.forEach((x,i)=>{x.on=i<3;x.bot=i?'normal':null});const g=trDeal();g.ps.forEach(p=>{if(g.offer[p])trKeep(g,p,g.offer[p].slice(0,3))});g.ann=null;
    const M=TRMAP.oldwest,ci=n=>M.cities.findIndex(c=>c[0]===n);trHome(g,g.ps[2],ci('Denver'));trHome(g,g.ps[1],ci('Boise'));g.ann=null;S.screen='live';save();render()});await W(500);
  const hm=await P.evaluate(()=>{const g=S.trg,ci=n=>TRMAP.oldwest.cities.findIndex(c=>c[0]===n),clk=s=>{const e=document.querySelector(s);if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true};
    if(!clk(`[data-a="trphome"][data-k="${ci('Seattle')}"]`))return 'no city';if(document.querySelector(`[data-a="trphome"][data-k="${ci('Boise')}"]`))return 'taken city offered';if(!clk('[data-a="trphomego"]'))return 'no confirm';
    return g.home[g.ps[0]]===ci('Seattle')&&g.phase==='play'&&document.querySelectorAll('svg.trboard image[href="art/tr-station-g.webp"]').length===3||[g.phase,g.home]});
  await P.screenshot({path:'/tmp/ow/ow-screen.png'});
  ok('Through the screen: tap a free city, confirm, it’s your home city; all three City Markers show on the map',hm===true,hm);
  // Go back: claim a route, then Go back before the City Marker step; the marker step ends the turn; a draw ends it too; greyed tickets say why
  const gb=await P.evaluate(()=>{const g=S.trg,M=TRMAP.oldwest,me=g.ps[0],q=s=>document.querySelector(s),clk=s=>{const e=q(s);if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true};
    const rid=M.routes.findIndex(r=>{const x=[M.cities[r[0]][0],M.cities[r[1]][0]];return x.includes('Seattle')&&x.includes('Portland')&&r[3]==='G'});
    uxUndoClear(g);g.turn=me;g.drew=0;g.ann=null;g.hand[me]={R:0,O:0,Y:0,G:2,B:0,P:0,K:1,W:0,L:1};g.n++;render();
    const none0=!q('[data-a="trpundo"]');if(!lkq('trClaim',me,rid,{c:'G',n:2,L:0}))return 'no claim';render();const cmk=g.phase==='cmk',btn=!!q('[data-a="trpundo"]');
    if(!clk('[data-a="trpundo"]'))return {none0,cmk,btn};
    const back=g.own[rid]==null&&g.hand[me].G===2&&g.phase==='play'&&g.turn===me&&!q('[data-a="trpundo"]')&&/went back/.test((g.lg[g.lg.length-1]||{}).t);
    lkq('trClaim',me,rid,{c:'G',n:2,L:0});lkq('trCm',me,'skip');render();const gone=g.turn!==me&&!uxCanUndo(g,me);
    g.turn=me;g.drew=0;g.ann=null;g.n++;lkq('trTake',me,'deck');render();const drew=g.drew===1&&!q('[data-a="trpundo"]');
    g.drew=0;g.tdeck=[];if(g.tdeckL)g.tdeckL=[];g.n++;render();const why=[...document.querySelectorAll('.uxwhy')].map(e=>e.textContent),tix=q('[data-a="trptix"]');
    return {none0,cmk,btn,back,gone,drew,why,tixT:tix&&tix.title}});
  ok('Go back: after a claim (before the City Marker) the button appears and puts the route and cards back; it’s gone once the turn passes or a card is drawn',gb.none0&&gb.cmk&&gb.btn&&gb.back&&gb.gone&&gb.drew,gb);
  ok('Why not: the greyed ticket pile says “No tickets left”',gb.why.some(t=>/No tickets left/.test(t))&&gb.tixT==='No tickets left',gb);
  // the reveal
  await P.evaluate(()=>{S.trmap='oldwest';S.trhr={alvin:1};S.players.forEach((x,i)=>{x.on=i<4;x.bot='normal'});const g=trDeal();let k=0;while(g.phase!=='done'&&k++<8000){const q=act().find(x=>x.id===trActor(g));if(!trBotStep(g,q))trBotRescue(g,q)}g.ann=null;S.finished=false;S.screen='live';save();render()});await W(500);
  await P.screenshot({path:'/tmp/ow/ow-end.png',fullPage:true});
  const rv=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.trg;return S.map==='oldwest'&&act().every(p=>total(p)===g.sc[p.id])||[S.map,act().map(p=>[total(p),g.sc[p.id],JSON.stringify(p.x),JSON.stringify(S.picks.alvin)])]});
  ok('Old West reveal: the scoresheet (City Marker points, Globetrotter, Alvin) matches the phone’s scores',rv===true,rv);
  const mm=await P.evaluate(()=>{S.started=false;S.trg=null;S.trmap='oldwest';S.trhr={};S.screen='map';render();const a=!!document.querySelector('[data-a="trmapk"][data-k="oldwest"]'),t=document.querySelector('[data-a="trhr"][data-k="alvin"]');return {a,t:!!t}});
  ok('Map menu: Old West is there, with the Alvin variant switch (off by default)',mm.a&&mm.t,mm);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
