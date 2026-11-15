// Playable Ticket to Ride, Map Collection 7: Japan (Bullet Trains, the two Tokyos and Kokuras) and Italy (Ferry cards,
// wave spaces, triple routes, countries, regions). Rules checks, whole computer games, the reveal, and the play screen.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'mc7');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('trstart','1');
    S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed'][i];p.bot=null});save();c('start')});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,500)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const G=(map,n,bots)=>{S.trmap=map;S.players.forEach((x,i)=>{x.on=i<n;x.bot=bots?['easy','normal','hard','normal','hard'][i]:null});const g=trDeal();g.ann=null;return g};
    const cn=(M,n)=>M.cities.findIndex(c=>c[0]===n),rid=(M,a,b,c)=>M.routes.findIndex(r=>{const x=[M.cities[r[0]][0],M.cities[r[1]][0]];return x.includes(a)&&x.includes(b)&&(!c||r[3]===c)});
    const play=g=>{g.ps.forEach(p=>{if(g.offer[p])trKeep(g,p,g.offer[p].slice(0,trMin(g,g.offer[p])))});g.ann=null;g.phase='play'};
    const J=TRMAP.japan,I=TRMAP.italy;
    t('Japan map: 50 spots (48 cities: Tokyo and Kokura twice), 114 routes with 23 Bullet Train routes, 54 tickets; every route and ticket names real spots',()=>{
      const okR=J.routes.every(r=>J.cities[r[0]]&&J.cities[r[1]]&&r[0]!==r[1]&&r[2]>=1&&r[2]<=7),okT=J.tickets.every(t=>J.cities[t[0]]&&J.cities[t[1]]&&t[2]>0);
      return {ok:J.cities.length===50&&J.routes.length===114&&J.routes.filter(r=>r[8]).length===23&&J.tickets.length===54&&okR&&okT&&J.bullet===16}});
    t('Japan deal: 20 trains each, 4 tickets (keep at least 2), later 3 (keep at least 1); 16 Bullet Trains; no longest route, no Globetrotter',()=>{const g=G('japan',4),[a]=g.ps;
      const d=g.ps.every(p=>g.tr[p]===20&&g.offer[p].length===4)&&g.bt===16&&g.long===0&&!g.globe;const no=!trKeep(g,a,[g.offer[a][0]]);play(g);g.turn=a;const dr=trAskTix(g,a)&&g.offer[a].length===3&&trMin(g,g.offer[a])===1;return {ok:d&&no&&dr,d,no,dr}});
    t('Bullet Train route: paid with cards, no trains, no points, a white Bullet Train from the supply, and that many spaces up the track',()=>{const g=G('japan',3),[a,b]=g.ps;play(g);g.turn=a;const r=rid(J,'Osaka','Kyoto');
      g.hand[a]={R:0,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:1};const y=trClaim(g,a,r,{c:'L',n:0,L:1});return {ok:y&&J.routes[r][8]&&g.tr[a]===20&&g.sc[a]===0&&g.bt===15&&g.btp[a]===1&&g.btn[a]===1&&g.bto[r]&&g.own[r]===a,y,tr:g.tr[a],sc:g.sc[a],bt:g.bt}});
    t('Anyone can use a Bullet Train route for tickets; the two Tokyo spots (and the two Kokuras) are one city',()=>{const g=G('japan',2),[a,b]=g.ps;play(g);
      const r=rid(J,'Osaka','Kyoto');g.own[r]=a;g.bto[r]=1;const okB=trUF(g,b)(cn(J,'Osaka'),cn(J,'Kyoto'));
      const tk=J.cities.findIndex(c=>c[0]==='Tokyo'),tk2=J.cities.findLastIndex(c=>c[0]==='Tokyo'),gz=cn(J,'Ginza'),od=cn(J,'Odawara');g.own[rid(J,'Tokyo','Ginza')]=b;g.own[J.routes.findIndex(x=>(x[0]===36&&x[1]===37))]=b;
      const okT=trUF(g,b)(gz,od);const P=trPath(g,a,cn(J,'Shibuya'),od);return {ok:okB&&okT&&P.cost<Infinity&&tk!==tk2,okB,okT,cost:P.cost}});
    t('When the Bullet Trains run out, the open white routes are ordinary grey routes: your own trains, and they score',()=>{const g=G('japan',2),[a]=g.ps;play(g);g.turn=a;g.bt=0;const r=rid(J,'Nagoya','Hamamatsu');g.hand[a]={R:3,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0};
      const y=trClaim(g,a,r,{c:'R',n:3,L:0});return {ok:y&&g.tr[a]===17&&g.sc[a]===4&&!g.bto[r],y,tr:g.tr[a],sc:g.sc[a]}});
    t('Japan end: last round when a player has 2 or fewer trains AND 2 or fewer Bullet Trains are left (not before)',()=>{const g=G('japan',3),[a,b]=g.ps;play(g);g.turn=a;g.tr[a]=2;g.bt=5;trTake(g,a,'deck');trTake(g,a,'deck');const not=!g.lastRound;
      g.bt=2;trTake(g,b,'deck');trTake(g,b,'deck');return {ok:not&&!!g.lastRound&&g.lastRound.by===a&&g.lastRound.left===3,not,lr:g.lastRound}});
    t('Bullet Train track bonus: 4 players +20/+10/0/−10, ties share a place, no Bullet Train route −20',()=>{const g=G('japan',4),[a,b,c,d]=g.ps;play(g);g.ps.forEach(p=>g.tix[p]=[]);g.btp={[a]:9,[b]:9,[c]:4,[d]:0};g.btn={[a]:3,[b]:2,[c]:1,[d]:0};trEnd(g);
      const B=g.ps.map(p=>g.fin[p].btb);return {ok:B.join()==='20,20,0,-20',B}});
    t('Italy map: 34 cities + 5 countries, 128 routes (21 sea routes with waves, a triple Roma–Napoli), 56 tickets',()=>{const tri=I.routes.filter(r=>[r[0],r[1]].sort()+''===[cn(I,'Roma'),cn(I,'Napoli')].sort()+'').length;
      return {ok:I.cities.length===39&&I.ctry.length===5&&I.routes.length===128&&I.routes.filter(r=>r[5]).length===21&&tri===3&&I.tickets.length===56&&I.routes.every(r=>!r[5]||r[3]==='X'),tri}});
    t('Italy deal: 45 trains, 5 tickets (keep at least 3), later 4; 10 Ferry cards in their own pile, not in the deck',()=>{const g=G('italy',3),[a]=g.ps;const d=g.ps.every(p=>g.tr[p]===45&&g.offer[p].length===5&&g.hand[p].V===0)&&g.fy===10&&!g.deck.includes('V');
      const no=!trKeep(g,a,g.offer[a].slice(0,2));play(g);g.turn=a;const dr=trAskTix(g,a)&&g.offer[a].length===4;return {ok:d&&no&&dr,d,no,dr}});
    t('Ferry card: your whole turn, at most 2 in hand; used ones go back to the pile',()=>{const g=G('italy',2),[a,b]=g.ps;play(g);g.turn=a;const f1=trFerry(g,a)&&g.turn===b&&g.hand[a].V===1&&g.fy===9;g.turn=a;g.hand[a].V=2;const f2=!trFerry(g,a);
      const r=rid(I,'Olbia','Roma');g.hand[a]={R:2,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:0,V:1};const y=trClaim(g,a,r,{c:'R',n:2,L:0,x:{V:1}});return {ok:f1&&f2&&y&&g.fy===10&&g.hand[a].V===0&&g.sc[a]===7,f1,f2,y,fy:g.fy}});
    t('Wave spaces: each needs a locomotive or a Ferry card (one covers 2); the other spaces are any one colour',()=>{const g=G('italy',2),[a]=g.ps;play(g);g.turn=a;const r=rid(I,'Venezia','Ancona');/* 5 spaces, 3 waves */g.hand[a]={R:3,O:0,Y:0,G:0,B:0,P:0,K:0,W:0,L:1,V:1};
      const bad=!trPayOk(g,a,r,{c:'R',n:3,L:2})&&!trPayOk(g,a,r,{c:'R',n:3,L:0,x:{V:1}})&&!trPayOk(g,a,r,{c:'R',n:4,L:1});const good=trPayOk(g,a,r,{c:'R',n:2,L:1,x:{V:1}});const opts=trPays(g,a,r).length;
      return {ok:I.routes[r][5]===3&&I.routes[r][2]===5&&bad&&good&&opts>=1,bad,good,opts}});
    t('Italy regions: each network scores its own regions; Puglia counts twice with all four of its cities; countries are dead ends',()=>{const g=G('italy',2),[a,b]=g.ps;play(g);g.ps.forEach(p=>g.tix[p]=[]);
      /* a: Napoli–Salerno–Foggia–Bari–Taranto–Lecce (Campania, Puglia×2 = 3); plus Torino–Milano (2) */['Napoli|Salerno','Salerno|Foggia','Foggia|Bari','Bari|Taranto','Taranto|Lecce','Torino|Milano','Torino|Francia'].forEach(x=>{const [p,q]=x.split('|');g.own[rid(I,p,q)]=a});
      /* b: a 6-region line Torino → Genova → Pisa → Grosseto → Roma → Pescara → Foggia: Piemonte, Liguria, Toscana, Lazio, Abruzzo, Puglia */['Torino|Genova','Genova|Pisa','Pisa|Grosseto','Grosseto|Roma','Roma|Pescara','Pescara|Foggia'].forEach(x=>{const [p,q]=x.split('|');const r=I.routes.findIndex((R,i)=>g.own[i]==null&&[I.cities[R[0]][0],I.cities[R[1]][0]].sort()+''===[p,q].sort()+'');g.own[r]=b});
      trEnd(g);return {ok:g.fin[a].reg.join()==='3,2'&&g.fin[a].regp===0&&g.fin[b].reg.join()==='6'&&g.fin[b].regp===2,a:g.fin[a].reg,b:g.fin[b].reg}});
    t('Computer players finish whole games on both maps, 2 to 5 players: cards add up, trains add up, the score adds up',()=>{const bad=[];let games=0,bts=0,fy=0;
      for(const map of ['japan','italy'])for(const n of [2,3,4,5]){const g=G(map,n,true);let k=0;while(g.phase!=='done'&&k++<6000){const q=act().find(x=>x.id===trActor(g));if(!trBotStep(g,q))trBotRescue(g,q)}games++;
        if(g.phase!=='done'){bad.push(map+n+' stuck '+g.phase);continue}const M=TRMAP[map],cards=g.deck.length+g.disc.length+g.face.filter(Boolean).length+g.ps.reduce((a,p)=>a+TRCARDS.reduce((x,c)=>x+(g.hand[p][c]||0),0),0);if(cards!==110)bad.push(map+n+' cards '+cards);
        if(g.fy!=null){const f=g.fy+g.ps.reduce((a,p)=>a+(g.hand[p].V||0),0);if(f!==10)bad.push('ferry '+f);fy+=Object.values(g.own).length}
        if(g.bto){bts+=Object.keys(g.bto).length;if(Object.keys(g.bto).length+g.bt!==16)bad.push('bullets')}
        g.ps.forEach(p=>{const used=Object.keys(g.own).filter(r=>g.own[r]===p&&!(g.bto&&g.bto[r])).reduce((a,r)=>a+M.routes[r][2],0);if(used+g.tr[p]!==M.rule.trains)bad.push(map+n+' trains '+p);const F=g.fin[p],rp=Object.entries(F.routes).reduce((a,[l,c])=>a+TRPTS[l]*c,0);
          if(rp+F.tv+(F.btb||0)+(F.regp||0)!==g.sc[p])bad.push(map+n+' score '+[rp,F.tv,F.btb,F.regp,g.sc[p]])})}
      return {ok:!bad.length&&games===8&&bts>0,bad:bad.slice(0,6),bts}});
    return out});
  R.forEach(([n,y,why])=>ok(n,y,why));
  // the play screen: a Japan game with a Bullet Train on the board, and an Italy game with a Ferry card in hand
  for(const map of ['japan','italy']){
    await P.evaluate(map=>{S.trmap=map;S.players.forEach((x,i)=>{x.on=i<3;x.bot=i?'normal':null});const g=trDeal();g.ps.forEach(p=>{if(g.offer[p])trKeep(g,p,g.offer[p].slice(0,trMin(g,g.offer[p])))});g.ann=null;g.phase='play';g.turn=g.ps[0];
      const M=TRMAP[map];if(map==='japan'){const r=M.routes.findIndex(x=>x[8]&&x[2]===3);g.own[r]=g.ps[1];g.bto[r]=1;g.bt--;g.btp[g.ps[1]]=3;g.btn[g.ps[1]]=1}else{g.hand[g.ps[0]].V=1;g.fy=9}
      S.screen='live';save();render()},map);await W(700);
    const v=await P.evaluate(map=>{const g=S.trg;return {svg:!!document.querySelector('svg.trboard'),bullet:document.querySelectorAll('svg.trboard image[href="art/tr-bullet.webp"]').length,inset:document.querySelectorAll('svg.trboard clipPath').length,
      ferryBtn:!!document.querySelector('[data-a="trpferry"]'),ferryHand:!!document.querySelector('.trhand .tr-V'),status:(document.querySelector('.ccstat')||{}).textContent||''}},map);
    await P.screenshot({path:`/tmp/mc7/${map}-screen.png`});
    ok(map==='japan'?'Japan screen: the map with its two close-up boxes, a Bullet Train on a claimed white route, Bullet Trains left in the status line':'Italy screen: the Ferry card pile button, a Ferry card in your hand, Ferry cards left in the status line',
      map==='japan'?v.svg&&v.bullet===1&&v.inset===2&&/15 Bullet Trains left/.test(v.status):v.svg&&v.ferryBtn&&v.ferryHand&&/9 Ferry cards/.test(v.status),v)}
  // take a Ferry card through the screen
  const tf=await P.evaluate(()=>{const g=S.trg,a=g.ps[0];const b=document.querySelector('[data-a="trpferry"]');if(!b)return 'no button';b.dispatchEvent(new MouseEvent('click',{bubbles:true}));return g.hand[a].V===2&&g.turn!==a||[g.hand[a].V,g.turn]});
  ok('Through the screen: tap the Ferry card pile, the card is yours and your turn ends',tf===true,tf);
  // the reveal on both maps
  for(const map of ['japan','italy']){
    await P.evaluate(map=>{S.trmap=map;S.players.forEach((x,i)=>{x.on=i<4;x.bot='normal'});const g=trDeal();let k=0;while(g.phase!=='done'&&k++<6000){const q=act().find(x=>x.id===trActor(g));if(!trBotStep(g,q))trBotRescue(g,q)}g.ann=null;S.finished=false;S.screen='live';save();render()},map);await W(500);
    await P.screenshot({path:`/tmp/mc7/${map}-end.png`,fullPage:true});
    const rv=await P.evaluate(map=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.trg;const r=S.map===map&&act().every(p=>total(p)===g.sc[p.id])||[S.map,act().map(p=>[total(p),g.sc[p.id],JSON.stringify(p.x)])];return r},map);
    ok(`${map==='japan'?'Japan':'Italy'} reveal: the ${map==='japan'?'Japan scoresheet (Bullet Train track)':'Italy scoresheet (regions per network)'} matches the phone’s scores`,rv===true,rv)}
  // the map menu
  const mm=await P.evaluate(()=>{S.started=false;S.trg=null;S.trmap='italy';S.screen='map';render();return {jp:!!document.querySelector('[data-a="trmapk"][data-k="japan"]'),it:!!document.querySelector('[data-a="trmapk"][data-k="italy"]'),banner:!!document.querySelector('img.hero[src*="mc7"]')}});
  ok('Map menu: Japan and Italy are there, with their own banner',mm.jp&&mm.it&&mm.banner,mm);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
