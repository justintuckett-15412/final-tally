// Playable Ticket to Ride (USA): map data, dealing, drawing cards, claiming routes, double routes, tickets, the last round,
// final scoring (tickets, longest route), computer players finishing whole games, a turn through the screen, the reveal,
// linked phones, and the Ticket to Ride scorer still working.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const start=async(P,o)=>P.evaluate(o=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('trstart','1');
  S.players.forEach((p,i)=>{p.on=i<o.n;p.name=['Ann','Bob','Cy','Di','Ed'][i]||'';p.bot=(o.bots||[])[i]||null});save();c('start')},o);
(async()=>{const browser=await chromium.launch();const errs=[];let P=await mk(browser,'tr');P.on('pageerror',e=>errs.push(e.message));
  await start(P,{n:3});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,400)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const M=TRMAP.usa,G=n=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot=null});const g=trDeal();g.ann=null;return g},cnt=g=>g.deck.length+g.disc.length+g.face.filter(Boolean).length+g.ps.reduce((a,p)=>a+Object.values(g.hand[p]).reduce((x,y)=>x+y,0),0);
    const rid=(a,b,c)=>M.routes.findIndex(r=>{const n=[M.cities[r[0]][0],M.cities[r[1]][0]];return n.includes(a)&&n.includes(b)&&(!c||r[3]===c)});
    t('USA map: 36 cities, 100 routes (309 spaces), 30 tickets; each city name once; 110 train cards (12 of each colour, 14 locomotives)',()=>{const g=G(3),sp=M.routes.reduce((a,r)=>a+r[2],0),names=new Set(M.cities.map(c=>c[0]));
      return {ok:M.cities.length===36&&names.size===36&&M.routes.length===100&&sp===309&&M.tickets.length===30&&cnt(g)===110&&g.ps.every(p=>Object.values(g.hand[p]).reduce((a,b)=>a+b,0)===4&&g.offer[p].length===3&&g.tr[p]===45)&&g.face.filter(Boolean).length===5&&g.phase==='tix0',sp}});
    t('Start: everyone keeps at least 2 of 3 tickets (any order); then the first player starts',()=>{const g=G(2),[a,b]=g.ps;const no=!trKeep(g,a,[g.offer[a][0]]);const y1=trKeep(g,b,g.offer[b].slice(0,2));const ph1=g.phase;const y2=trKeep(g,a,g.offer[a].slice());
      return {ok:no&&y1&&ph1==='tix0'&&y2&&g.phase==='play'&&g.turn===a&&g.tix[a].length===3&&g.tix[b].length===2&&g.tdeck.length===25,ph:g.phase,n:g.tdeck.length}});
    t('Drawing: two cards a turn; a face-up locomotive is the whole turn and can’t be the second card; 3 face-up locomotives are replaced',()=>{const g=G(2),[a,b]=g.ps;g.phase='play';g.offer={};
      g.face=['L','R','O','Y','G'];const l1=trTake(g,a,0)&&g.turn===b&&g.hand[a].L>=1;g.face=['R','L','O','Y','G'];const t1=trTake(g,b,0)&&g.turn===b&&g.drew===1;const noL=!trTake(g,b,1);const t2=trTake(g,b,'deck')&&g.turn===a;
      g.face=['R','O','Y','G','B'];g.deck.push('L','L','L');trTake(g,a,0);trTake(g,a,1);const lf=g.face.filter(c=>c==='L').length<3;return {ok:l1&&t1&&noL&&t2&&lf,l1,t1,noL,t2,lf,c:cnt(g)}});
    t('Claiming: pay the route’s colour (grey: any one colour), locomotives wild; you score at once and the cards are discarded',()=>{const g=G(4),[a,b]=g.ps;g.phase='play';g.offer={};g.turn=a;g.hand[a]={R:3,O:0,Y:5,G:2,B:1,P:0,K:0,W:0,L:2};
      const r6=rid('Seattle','Helena','Y'),rg=rid('Los Angeles','Phoenix');const bad1=!trClaim(g,a,r6,{c:'R',n:3,L:2})&&!trClaim(g,a,r6,{c:'Y',n:5,L:0});const y=trClaim(g,a,r6,{c:'Y',n:5,L:1});const sc=g.sc[a]===15&&g.tr[a]===39&&g.hand[a].Y===0&&g.hand[a].L===1&&g.disc.length===6;
      g.turn=b;g.hand[b]={R:2,O:1,Y:0,G:0,B:0,P:0,K:0,W:0,L:0};const mix=!trClaim(g,b,rg,{c:'R',n:2,L:0})&&trPays(g,b,rg).length===0;g.hand[b].R=3;const gy=trClaim(g,b,rg,{c:'R',n:3,L:0})&&g.sc[b]===4;
      return {ok:bad1&&y&&sc&&mix&&gy,bad1,y,sc,mix,gy}});
    t('Double routes: with 2–3 players only one side can be used; with 4–5 both, but never both by the same player',()=>{const g=G(3),[a,b]=g.ps;g.phase='play';g.offer={};const r1=rid('Kansas City','Saint Louis','B'),r2=rid('Kansas City','Saint Louis','P');g.own[r1]=a;const b3=!trRouteOk(g,b,r2);
      const h=G(4),[c,d]=h.ps;h.own[r1]=c;const b4=trRouteOk(h,d,r2)&&!trRouteOk(h,c,r2);return {ok:b3&&b4,b3,b4}});
    t('The end: 2 trains or fewer after your turn starts the last round; everyone (you too) gets one more turn; then tickets and the longest route score',()=>{const g=G(3),[a,b,c]=g.ps;g.phase='play';g.offer={};g.turn=a;g.tr[a]=4;
      const sl=rid('Seattle','Vancouver');g.hand[a]={R:0,O:0,Y:0,G:0,B:0,P:0,K:2,W:0,L:0};g.tix[a]=[M.tickets.findIndex(t=>t[2]===21)];g.tix[b]=[];g.tix[c]=[];
      /* a: Seattle–Portland (1) and Seattle–Vancouver (1): a 2-long path */const sp=rid('Seattle','Portland');g.own[sp]=a;g.sc[a]=1;trClaim(g,a,sl,{c:'K',n:1,L:0});g.tr[a]=2;g.lastRound=null;g.turn=a;g.drew=0;trEndTurn(g,a);
      const lr=!!g.lastRound&&g.lastRound.left===3&&g.turn===b;trTake(g,b,'deck');trTake(g,b,'deck');trTake(g,c,'deck');trTake(g,c,'deck');const notYet=g.phase==='play'&&g.turn===a;trTake(g,a,'deck');trTake(g,a,'deck');
      const F=g.fin&&g.fin[a];return {ok:lr&&notYet&&g.phase==='done'&&F&&F.long===2&&F.lb&&F.tv===-21&&g.sc[a]===1+1+10-21,lr,notYet,ph:g.phase,F}});
    t('Longest route: the longest line of your own routes, each route counted once',()=>{const g=G(2),[a,b]=g.ps;['Omaha|Kansas City','Kansas City|Oklahoma City','Oklahoma City|Dallas'].forEach(x=>{const [p,q]=x.split('|');g.own[rid(p,q)]=a});
      g.own[rid('Duluth','Omaha')]=b;g.own[rid('Duluth','Chicago')]=b;g.own[rid('Chicago','Saint Louis')]=b;return {ok:trLongest(g,a)===5&&trLongest(g,b)===7,a:trLongest(g,a),b:trLongest(g,b)}});
    t('USA 1910 ticket sets: Classic 30, 1910 35, Mega Game 69 (5 dealt, keep 3, draw 4), Big Cities 35 (4 dealt, keep 2, draw 4); Globetrotter +15 for most tickets; bonuses per set',()=>{const res={},bad=[];
      for(const [v,n,d,k,dr,L,Gb] of [['classic',30,3,2,3,1,0],['1910',35,3,2,3,0,1],['mega',69,5,3,4,1,1],['big',35,4,2,4,0,0]]){S.trvar=v;const g=G(3),[a]=g.ps;res[v]=g.tk.length;if(g.tk.length!==n||g.offer[a].length!==d||g.long!==L||g.globe!==Gb)bad.push(v+' deal');
        const no=!trKeep(g,a,g.offer[a].slice(0,k-1));if(!no)bad.push(v+' min');g.ps.forEach(p=>trKeep(g,p,g.offer[p].slice(0,k)));g.ann=null;g.turn=a;if(!trAskTix(g,a)||g.offer[a].length!==dr)bad.push(v+' draw')}
      S.trvar='mega';const g=G(2),[a,b]=g.ps;const T=g.tk,big=TRMAP.usa.big;S.trvar='big';const h=G(2);S.trvar='classic';const allBig=h.tk.every(t=>big.includes(t[0])||big.includes(t[1]));
      const lam=T.find(t=>{const n=[TRMAP.usa.cities[t[0]][0],TRMAP.usa.cities[t[1]][0]];return n.includes('Los Angeles')&&n.includes('Miami')});
      /* Globetrotter: a finishes one more ticket than b */g.phase='play';g.offer={};g.tix[a]=[0,1];g.tix[b]=[2];const K=(x,y)=>M.routes.findIndex(r=>{const n=[M.cities[r[0]][0],M.cities[r[1]][0]];return n.includes(x)&&n.includes(y)});
      g.tk=[[M.cities.findIndex(c=>c[0]==='Seattle'),M.cities.findIndex(c=>c[0]==='Portland'),2],[M.cities.findIndex(c=>c[0]==='Seattle'),M.cities.findIndex(c=>c[0]==='Vancouver'),2],[M.cities.findIndex(c=>c[0]==='Omaha'),M.cities.findIndex(c=>c[0]==='Duluth'),6]];g.own[K('Seattle','Portland')]=a;g.own[K('Seattle','Vancouver')]=a;g.own[K('Omaha','Duluth')]=b;trEnd(g);
      const gt=g.fin[a].gt&&!g.fin[b].gt;return {ok:!bad.length&&allBig&&lam&&lam[2]===19&&gt,bad,res,allBig,lam,gt}});
    t('Europe: 47 cities, 101 routes, 40 + 6 long tickets; 1 long + 3 regular dealt, keep 2, long ones not kept leave; ferries need their locomotives; tunnels turn up 3 cards; stations cost 1/2/3, borrow a route at the end, 4 each unused',()=>{S.trmap='europe';const E=TRMAP.europe,bad=[];
      const g=G(3),[a,b,c]=g.ps;if(E.cities.length!==47||E.routes.length!==101||E.tickets.length!==40||E.long.length!==6)bad.push('data');if(!g.ps.every(p=>g.offer[p].length===4&&g.offer[p].filter(t=>t>=40).length===1))bad.push('deal');
      const lg=g.offer[a].find(t=>t>=40);trKeep(g,a,g.offer[a].filter(t=>t<40).slice(0,2));if(g.tdeck.includes(lg))bad.push('long back');g.ps.forEach(p=>{if(g.offer[p])trKeep(g,p,g.offer[p].slice(0,2))});
      const er=(x,y,f)=>E.routes.findIndex((r,i)=>{const n=[E.cities[r[0]][0],E.cities[r[1]][0]];return n.includes(x)&&n.includes(y)&&(!f||f(r))});
      g.ann=null;g.turn=a;g.hand[a]={R:0,O:0,Y:0,G:0,B:6,P:0,K:0,W:0,L:0};const fe=er('Palermo','Smyrna');if(trPays(g,a,fe).length||trClaim(g,a,fe,{c:'B',n:6,L:0}))bad.push('ferry without locos');g.hand[a].L=2;g.hand[a].B=4;if(!trPays(g,a,fe).length)bad.push('ferry pay');
      /* tunnel: the next 3 cards are blue, locomotive, red: 2 more */const tu=er('Madrid','Pamplona',r=>r[4]&&r[3]==='K')>=0?er('Madrid','Pamplona',r=>r[4]&&r[3]==='K'):er('Madrid','Pamplona',r=>r[4]);const TR=E.routes[tu];g.hand[a]={R:0,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0};g.hand[a][TR[3]==='X'?'B':TR[3]]=TR[2]+1;g.hand[a].L=1;const col=TR[3]==='X'?'B':TR[3];
      g.deck.push('R','L',col);const t1=trClaim(g,a,tu,{c:col,n:TR[2],L:0});const inT=g.phase==='tun'&&g.tun.ex===2;const op=trTunPays(g);const t2=trTunnel(g,a,op[0]);if(!(t1&&inT&&t2&&g.own[tu]===a&&g.hand[a][col]===0&&g.hand[a].L===0))bad.push('tunnel '+JSON.stringify({t1,inT,op,own:g.own[tu]}));
      /* give up: cards stay */g.turn=b;g.drew=0;const tu2=E.routes.findIndex((r,i)=>r[4]&&g.own[i]==null&&r[3]!=='X'&&r[2]<=3);const R2=E.routes[tu2];g.hand[b]={R:0,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0};g.hand[b][R2[3]]=R2[2];g.deck.push(R2[3],R2[3],R2[3]);trClaim(g,b,tu2,{c:R2[3],n:R2[2],L:0});const gv=g.phase==='tun'&&!trTunPays(g).length&&trTunnel(g,b,'give')&&g.hand[b][R2[3]]===R2[2]&&g.own[tu2]==null&&g.turn!==b;if(!gv)bad.push('give up');
      /* stations */g.turn=c;g.drew=0;g.hand[c]={R:3,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:3};const ci=E.cities.findIndex(x=>x[0]==='Wien');const s1=trStation(g,c,ci,{c:'R',n:1,L:0});g.turn=c;g.drew=0;const s2=!trStation(g,c,ci,{c:'R',n:2,L:0})&&trStation(g,c,E.cities.findIndex(x=>x[0]==='Roma'),{c:'R',n:2,L:0});if(!(s1&&s2&&g.st[c]===1&&trStCost(g,c)===3))bad.push('stations');
      /* end: c borrows a's route into Wien to finish Wien–Budapest */const wb=er('Wien','Budapest');g.own[wb]=a;g.tix[c]=[g.tk.length];g.tk.push([ci,E.cities.findIndex(x=>x[0]==='Budapest'),5]);g.tix[a]=[];g.tix[b]=[];const sc0=g.sc[c];trEnd(g);if(!(g.fin[c].bor.includes(wb)&&g.fin[c].tv===5&&g.fin[c].stp===4&&g.fin[b].stp===12))bad.push('end '+JSON.stringify(g.fin[c]));
      /* a computer player whose ticket is cut off builds a station to borrow the route */S.trmap='europe';const h=G(4),[p1,p2]=h.ps;h.phase='play';h.offer={};h.turn=p1;h.ann=null;const ed=E.cities.findIndex(x=>x[0]==='Edinburgh'),ld=E.cities.findIndex(x=>x[0]==='London');
      E.routes.forEach((r,i)=>{if(r[0]===ed||r[1]===ed)h.own[i]=p2});h.tk.push([ed,ld,4]);h.tix[p1]=[h.tk.length-1];h.hand[p1]={R:2,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0};S.players.forEach(x=>{if(x.id===p1)x.bot='normal'});
      const mv=trBotMove(h,p1);const ok2=mv.t==='station'&&[ed,ld].includes(mv.city)&&trBotStep(h,act().find(x=>x.id===p1))&&h.stOn[mv.city]===p1;S.players.forEach(x=>x.bot=null);if(!ok2)bad.push('bot station '+JSON.stringify(mv));
      S.trmap='usa';return {ok:!bad.length,bad}});
    t('Computer players finish 2- to 5-player games (USA Classic and Mega Game, Europe with 3 and 5): cards add up to 110, trains to 45, scores match routes + tickets + longest',()=>{const bad=[];for(let n=2;n<=5;n++){S.players.forEach((x,i)=>{x.on=i<n;x.bot=['easy','normal','hard','normal','hard'][i]});S.trvar=['classic','1910','mega','big'][n-2];S.trmap=n%2?'europe':'usa';const g=trDeal();let k=0;
        while(g.phase!=='done'&&k++<3000){const q=act().find(x=>x.id===trActor(g));if(!trBotStep(g,q)){bad.push('stuck '+n+' '+g.phase);break}}if(g.phase!=='done'){bad.push('no end '+n);continue}
        if(cnt(g)!==110)bad.push('cards '+n);g.ps.forEach(p=>{const used=Object.keys(g.own).filter(r=>g.own[r]===p).reduce((a,r)=>a+TRMAP[g.map].routes[r][2],0);if(used+g.tr[p]!==45)bad.push('trains '+p);const F=g.fin[p],rp=Object.entries(F.routes).reduce((a,[l,c])=>a+TRPTS[l]*c,0);if(rp+F.tv+(F.lb?10:0)+(F.gt?15:0)+(F.stp||0)!==g.sc[p])bad.push('score '+p)})}S.trvar='classic';S.trmap='usa';
      S.players.forEach((x,i)=>{x.on=i<3;x.bot=null});return {ok:!bad.length,bad}});
    return out});
  R.forEach(([n,p,x])=>ok(n,p,x||undefined));
  // a turn through the screen: tap a route, pay, the route is yours
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<2;x.bot=i?'normal':null});trDeal();const g=S.trg;g.ann=null;const [a]=g.ps;trKeep(g,a,g.offer[a]);trKeep(g,g.ps[1],g.offer[g.ps[1]]);g.ann=null;g.turn=a;g.hand[a]={R:0,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0,Y:0};g.hand[a].W=6;S.screen='live';save();render()});await W(500);
  const tap=await P.evaluate(()=>{const M=TRMAP.usa,r=M.routes.findIndex(x=>M.cities[x[0]][0]==='Calgary'&&M.cities[x[1]][0]==='Winnipeg');const el=document.querySelector(`[data-a="trproute"][data-k="${r}"]`);if(!el)return 'no route';el.dispatchEvent(new MouseEvent('click',{bubbles:true}));const pay=document.querySelector('[data-a="trppay"]');if(!pay)return 'no pay';pay.click();return S.trg.own[r]===act()[0].id&&S.trg.sc[act()[0].id]===15});
  ok('Through the screen: tap a route on the map, pay, it’s yours (+15 for a 6)',tap===true,tap);
  // the reveal: finish a computer game and check the scoresheet matches
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<3;x.bot='normal'});const g=trDeal();let k=0;while(g.phase!=='done'&&k++<3000){const q=act().find(x=>x.id===trActor(g));trBotStep(g,q)}g.ann=null;S.screen='live';save();render()});await W(400);
  const rev=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.trg;return act().every(p=>total(p)===g.sc[p.id])||act().map(p=>[total(p),g.sc[p.id]])});
  ok('Finish & reveal: the Ticket to Ride scoresheet gets every route, ticket and the longest route, and totals match',rev===true,rev);
  // linked phones
  const H=await mk(browser,'host'),Gp=await mk(browser,'guest');[H,Gp].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const b0=document.createElement('button');b0.dataset.a='trstart';b0.dataset.k='1';document.body.appendChild(b0);b0.click();b0.remove();const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await Gp.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await Gp.evaluate(c=>lkJoin(c),code);await W(4000);await Gp.evaluate(id=>lkPick(id),ids[1]);await W(2500);await readyAll([H,Gp]);
  const kept=await Gp.evaluate(()=>{const b=document.querySelector('[data-a="trpkeep"]');if(!b)return 'no keep';b.click();return true});await W(2500);
  await H.evaluate(()=>{const b=document.querySelector('[data-a="trpkeep"]');if(b)b.click()});await W(3000);
  const both=await H.evaluate(id=>S.trg&&S.trg.phase==='play'&&S.trg.tix[id].length===3,ids[1]);
  const first=await H.evaluate(()=>S.trg.turn);const Ph=first===ids[0]?H:Gp,Po=first===ids[0]?Gp:H;
  const drew=await Ph.evaluate(()=>{const b=document.querySelector('[data-a="trptake"][data-k="deck"]');if(!b)return 'no deck';b.click();return true});await W(2500);
  await Ph.evaluate(()=>{const b=document.querySelector('[data-a="trptake"][data-k="deck"]');if(b)b.click()});await W(3000);
  const passed=await Po.evaluate(f=>S.trg.turn!==f&&Object.values(S.trg.hand[f]).reduce((a,b)=>a+b,0)===6,first);
  const hid=await Po.evaluate(f=>!document.querySelector('.trdock')||!document.querySelector('.trdock').textContent.includes('Waiting')||true,first);
  ok('Linked: tickets are kept on each phone; two cards drawn on one phone show on the other and the turn passes',kept===true&&both&&drew===true&&passed,{kept,both,drew,passed});
  // the scorer still works
  const SC=await mk(browser,'score');SC.on('pageerror',e=>errs.push(e.message));
  const sc=await SC.evaluate(()=>{SET.toursOff=true;const b=document.createElement('button');b.dataset.a='trstart';b.dataset.k='0';document.body.appendChild(b);b.click();b.remove();render();return {play:trOn(),maps:document.querySelectorAll('.mapc:not([disabled])').length}});
  ok('Score a game: the Ticket to Ride scorer still shows all its maps',!sc.play&&sc.maps>10,sc);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
