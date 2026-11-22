// Playable Wingspan (base game): setup, the four actions and the mat spaces, paying for birds, powers (brown, white, pink),
// rounds and goals, bonus cards, whole computer games for 2–5 players, the reveal, and the screen.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'wp');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('wpstart','1');
    S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed'][i];p.bot=null});save();c('start')});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,500)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const bi=n=>WSB.findIndex(b=>b.n===n);
    const G=(n,bots)=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot=bots?['easy','normal','hard','normal','hard'][i]:null});WSX().swift=0;const g=wpDeal();g.ann=null;return g};
    const ready=g=>{g.ps.forEach(p=>wpSetup(g,p,[0,1],['i','s','f'],g.offer[p].bo[0]));g.ann=null;return g};
    const put=(g,p,h,name,e=0)=>{g.mat[p][h].push({b:bi(name),e,c:0,t:0})};
    const cards=g=>g.deck.length+g.disc.length+g.tray.filter(b=>b!=null).length+g.ps.reduce((a,p)=>a+g.hand[p].length+wpSlots(g,p).reduce((x,[,,y])=>x+1+(y.t||0),0)+(g.offer[p]?g.offer[p].b.length:0),0)+(g.pool?g.pool.length:0);
    t('Data: 180 birds in the list, 170 in play (the 10 Swift-Start birds only when switched on); 26 bonus cards; 16 round goals on 8 tiles',()=>{const g=G(2);const n=cards(g);WSX().swift=1;const h=wpDeal();h.ann=null;WSX().swift=0;
      return {ok:WSB.length===180&&n===170&&cards(h)===180&&WSBON.length===26&&WSGOAL.length===16&&new Set(WSGOAL.map(x=>x.tile)).size===8&&g.goals.length===4&&new Set(g.goals.map(id=>wpGoal(id).tile)).size===4,n}});
    t('Setup: 5 birds, 5 food, 2 bonus cards; keep birds + food = 5 and 1 bonus card; then round 1 with 8 actions each',()=>{const g=G(2),[a,b]=g.ps;const d=g.offer[a].b.length===5&&g.offer[a].bo.length===2;
      const no=!wpSetup(g,a,[0,1,2],['i','s','f'],g.offer[a].bo[0]);const y=wpSetup(g,a,[0,1,2],['i','s'],g.offer[a].bo[1]);wpSetup(g,b,[],['i','s','f','r','u'],g.offer[b].bo[0]);
      return {ok:d&&no&&y&&g.hand[a].length===3&&wpFoodN(g,a)===2&&g.bon[a].length===1&&g.phase==='play'&&g.cubes[a]===8,d,no,y}});
    t('Gain food: dice from the feeder (1 with an empty forest); the extra: discard a card for 1 more; all-the-same dice may be rerolled; an empty feeder is refilled',()=>{const g=ready(G(2)),[a]=g.ps;g.turn=a;g.fd=['r','r','r','r','r'];const f0=g.food[a].r;
      wpMove(g,a,{a:'food'});const re=g.ask&&g.ask.t==='die'&&g.ask.re;wpMove(g,a,{d:0});const one=g.food[a].r===f0+1&&g.turn!==a;
      g.turn=a;put(g,a,'f','Mallard');g.fd=['s'];const h0=g.hand[a].length;wpMove(g,a,{a:'food'});const opt=g.ask&&g.ask.t==='opt';wpMove(g,a,{c:0});wpMove(g,a,{d:0});const refill=g.fd.length===5&&g.ask&&g.ask.t==='die';const f1=wpFoodN(g,a);wpMove(g,a,{d:0,f:'i'});
      return {ok:re&&one&&opt&&refill&&g.hand[a].length===h0-1&&wpFoodN(g,a)===f1+1,re,one,opt,refill}});
    t('Play a bird: pay its food (any 2 food for 1), leftmost space of a habitat it lives in; columns 2–3 cost 1 egg, 4–5 cost 2',()=>{const g=ready(G(2)),[a]=g.ps;g.turn=a;g.hand[a]=[bi('Mallard'),bi('Bald Eagle'),bi('American Robin')];g.food[a]={i:0,s:1,f:0,r:0,u:0};
      const hab=wpPlayHabs(g,a,bi('American Robin')).join('');wpMove(g,a,{a:'play'});const ask=g.ask&&g.ask.t==='play'&&g.ask.opts.length===1;wpMove(g,a,{i:0,h:'w'});const m1=g.mat[a].w.length===1&&g.food[a].s===0;
      g.turn=a;g.food[a]={i:1,s:0,f:0,r:0,u:2};g.mat[a].w[0].e=1;wpMove(g,a,{a:'play'});const rob=g.ask.opts.find(o=>g.hand[a][o.i]===bi('American Robin'));wpMove(g,a,{i:rob.i,h:'f'});const egg0=g.mat[a].w[0].e===1;
      g.turn=a;put(g,a,'w','Mallard',2);g.hand[a]=[bi('Bald Eagle')];g.food[a]={i:0,s:0,f:2,r:0,u:2};wpMove(g,a,{a:'play'});wpMove(g,a,{i:0,h:'w'});if(g.ask&&g.ask.t==='payEgg')wpMove(g,a,{k:g.ask.opts[0]});
      const eggs=wpSlots(g,a).reduce((x,[,,y])=>x+y.e,0);return {ok:hab==='fg'&&ask&&m1&&egg0&&g.mat[a].w.length===3&&g.food[a].u===0&&eggs===2,hab,m1,egg0,eggs}});
    t('Lay eggs: up to each bird’s limit (2 with an empty grassland); a pink “when another player lays eggs” bird lays one too, once between its owner’s turns',()=>{const g=ready(G(2)),[a,b]=g.ps;g.turn=a;put(g,a,'w','Mallard');put(g,b,'w','American Avocet');put(g,b,'g','Killdeer');
      wpMove(g,a,{a:'eggs'});wpMove(g,a,{k:'w0'});wpMove(g,a,{k:'w0'});const laid=g.mat[a].w[0].e===2;if(g.ask&&g.ask.pid===b)wpMove(g,b,{k:'g0'});const pink=g.mat[b].g[0].e===1;
      g.turn=a;g.cubes[a]=5;wpMove(g,a,{a:'eggs'});while(g.ask&&g.ask.pid===a)wpMove(g,a,g.ask.opts&&g.ask.opts.length?{k:g.ask.opts[0]}:{skip:1});const once=g.mat[b].g[0].e===1;
      return {ok:laid&&pink&&once,laid,pink,once}});
    t('Draw cards: from the tray or the deck; the tray refills at the end of the turn; then wetland brown powers right to left',()=>{const g=ready(G(2)),[a]=g.ps;g.turn=a;put(g,a,'w','Mallard');put(g,a,'w','Common Yellowthroat');const h0=g.hand[a].length;
      wpMove(g,a,{a:'cards'});if(g.ask&&g.ask.t==='opt')wpMove(g,a,{skip:1});wpMove(g,a,{c:0});const took=g.tray[0]==null;/* yellowthroat (right) draws 2 then must discard 1; mallard draws 1 */let k=0;while(g.ask&&g.ask.pid===a&&k++<10)wpMove(g,a,g.ask.t==='card'?{c:'deck'}:g.ask.t==='disc'?{c:0}:{skip:1});const tray=took&&g.tray[0]!=null;
      return {ok:tray&&g.hand[a].length===h0+2+2+1-1&&g.turn!==a,h:g.hand[a].length-h0}});
    t('Powers: a predator rolls the dice not in the feeder and caches on a hit (a pink vulture then takes a die); a hunting owl tucks a small enough bird',()=>{const g=ready(G(2)),[a,b]=g.ps;put(g,a,'f','Barn Owl');put(g,b,'f','Turkey Vulture');g.fd=['s','s'];let hit=false;
      for(let k=0;k<40&&!hit;k++){g.q=[{t:'pow',pid:a,k:'f0',why:'brown'},{t:'end',pid:a}];g.turn=a;g.cubes[a]=3;g.pk[b]={};g.fd=['s','s'];wpRun(g);if(g.mat[a].f[0].c>0){hit=true;}}
      const vult=hit&&g.ask&&g.ask.pid===b&&g.ask.t==='die';if(vult)wpMove(g,b,{d:0,f:'s'});
      const h=ready(G(2)),[c]=h.ps;put(h,c,'f','Barred Owl');h.deck.push(bi('American Goldfinch'));h.q=[{t:'pow',pid:c,k:'f0',why:'brown'}];wpRun(h);
      return {ok:hit&&vult&&h.mat[c].f[0].t===1,hit,vult,t:h.mat[c].f[0].t}});
    t('White power on play: Bald Eagle takes every fish die in the feeder; bonus-card birds draw 2 and keep 1',()=>{const g=ready(G(2)),[a]=g.ps;g.turn=a;g.hand[a]=[bi('Bald Eagle')];g.food[a]={i:0,s:0,f:2,r:1,u:0};g.fd=['f','f','s','r','f'];
      wpMove(g,a,{a:'play'});wpMove(g,a,{i:0,h:'w'});const fish=g.food[a].f===3&&g.fd.length===2;g.turn=a;g.hand[a]=[bi('Atlantic Puffin')];g.food[a].f=3;g.mat[a].w[0].e=1;wpMove(g,a,{a:'play'});wpMove(g,a,{i:0,h:'w'});if(g.ask&&g.ask.t==='payEgg')wpMove(g,a,{k:g.ask.opts[0]});
      const bo=g.ask&&g.ask.t==='bonus'&&g.ask.opts.length===2;if(bo)wpMove(g,a,{id:g.ask.opts[1]});return {ok:fish&&bo&&g.bon[a].length===2,fish,bo}});
    t('Round end: the goal is scored (placement side 4/1/0 in round 1, ties split), the tray is cleared, 7 actions each, the next player starts',()=>{const g=ready(G(3)),[a,b,c]=g.ps;g.goals[0]=WSGOAL.find(x=>x.k==='birdsHab'&&x.hab==='f').id;
      put(g,a,'f','Mallard');put(g,a,'f','Mallard');put(g,b,'f','Mallard');put(g,c,'f','Mallard');const tr=g.tray.slice();g.ps.forEach(p=>g.cubes[p]=0);g.cubes[c]=1;g.turn=c;wpMove(g,c,{a:'cards'});while(g.ask)wpMove(g,g.ask.pid,{c:'deck'});
      const pts=[a,b,c].map(p=>g.gp[p]).join();return {ok:g.rnd===1&&pts==='4,0,0'&&g.cubes[a]===7&&g.turn===b&&g.tray.every((x,i)=>x!==tr[i]||x==null),pts,rnd:g.rnd,turn:g.turn}});
    t('Bonus cards and final scoring: birds + bonus + goals + eggs + cached food + tucked cards; leftover food breaks ties',()=>{const g=ready(G(2)),[a,b]=g.ps;g.bon[a]=['falconer'];put(g,a,'f','Barn Owl',2);g.mat[a].f[0].c=3;put(g,a,'w','Mallard',1);g.mat[a].w[0].t=2;g.gp[a]=5;g.gc=[{},{},{},{}];
      wpEnd(g);const F=g.fin[a];return {ok:F.birds===5&&F.bonus===2&&F.eggs===3&&F.food===3&&F.tuck===2&&F.goals===5&&F.tot===20,F}});
    t('Computer players finish whole games, 2 to 5 players: no card lost, 4 rounds of 8/7/6/5 actions, the score adds up; many power types used',()=>{const bad=[],seen=new Set();let games=0;const W0={...WPP};Object.keys(WPP).forEach(k=>{WPP[k]=(...a)=>{seen.add(k);return W0[k](...a)}});
      for(const n of [2,3,4,5])for(let rep=0;rep<2;rep++){const g=G(n,true);const acts={};g.ps.forEach(p=>acts[p]=0);let k=0,guard=0;
        while(g.phase!=='done'&&k++<20000){const q=act().find(x=>x.id===wpActor(g));if(!q){bad.push(n+' no actor');break}const before=g.turn,c0=g.cubes[before];if(!wpBotStep(g,q)&&!(g.ask&&wpBotAny(g,q.id))){bad.push(n+' stuck '+(g.ask&&g.ask.t));break}if(g.cubes[before]===c0-1)acts[before]++;
}
        games++;if(g.phase!=='done'){bad.push(n+' not done '+g.phase+' r'+g.rnd);continue}if(cards(g)!==170)bad.push(n+' cards '+cards(g));if(g.ps.some(p=>acts[p]!==26))bad.push(n+' actions '+JSON.stringify(acts));
        g.ps.forEach(p=>{const F=g.fin[p];if(F.birds+F.bonus+F.goals+F.eggs+F.food+F.tuck!==F.tot)bad.push('sum');if(F.goals!==[0,1,2,3].reduce((a,r)=>a+wpGoalPts(g,r)[p],0))bad.push('goals')})}
      Object.assign(WPP,W0);return {ok:!bad.length&&games===8&&seen.size>=20,bad:bad.slice(0,6),seen:[...seen].length}});
    return out});
  R.forEach(([n,y,why])=>ok(n,y,why));
  // the screen: choose a starting hand by tapping, then take an action
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<3;x.bot=i?'normal':null});const g=wpDeal();g.ann=null;S.screen='score';save();render()});await W(500);
  for(const [w,h] of [[400,850],[1272,700]]){await P.setViewportSize({width:w,height:h});await W(300);
    const vis=await P.evaluate(()=>[...document.querySelectorAll('.wpdock [data-a="wpsb"]')].map(b=>Math.round(b.getBoundingClientRect().height)));
    ok(`Starting hand birds are visible in the dock at ${w}px wide (not squeezed to nothing)`,vis.length===5&&vis.every(x=>x>100),vis)}
  await P.setViewportSize({width:400,height:850});
  const st=await P.evaluate(()=>{const g=S.wpg,me=g.ps[0],clk=s=>{const e=document.querySelector(s);if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true};
    if(!clk('[data-a="wpsb"][data-k="0"]')||!clk('[data-a="wpsb"][data-k="1"]'))return 'no birds';['i','s','f'].forEach(f=>clk(`[data-a="wpsf"][data-k="${f}"]`));if(!clk('[data-a="wpsbo"]'))return 'no bonus';if(!clk('[data-a="wpsgo"]'))return 'no go';
    return g.hand[me].length===2&&wpFoodN(g,me)===3&&g.bon[me].length===1||[g.hand[me].length,wpFoodN(g,me)]});
  ok('Through the screen: tap 2 birds, 3 food and a bonus card, keep them',st===true,st);
  await P.evaluate(()=>{const g=S.wpg;g.ps.forEach(p=>{if(g.offer[p])wpBotSetup(g,p)});g.ann=null;g.turn=g.ps[0];render()});await W(400);
  const tk=await P.evaluate(()=>{const g=S.wpg,me=g.ps[0],clk=s=>{const e=document.querySelector(s);if(!e)return false;e.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true};const f0=wpFoodN(g,me);
    const b=[...document.querySelectorAll('[data-a="wpans"]')].find(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='food');if(!b)return 'no food button';b.dispatchEvent(new MouseEvent('click',{bubbles:true}));if(!clk('.wpdie.ok'))return 'no die';return wpFoodN(g,me)===f0+1&&g.turn!==me||[wpFoodN(g,me),f0]});
  await P.screenshot({path:'/tmp/wp-screen.png',fullPage:true});
  ok('Through the screen: tap Gain food, tap a die in the feeder: it’s yours and the turn passes',tk===true,tk);
  // the reveal
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<4;x.bot='normal'});const g=wpDeal();let k=0;while(g.phase!=='done'&&k++<20000){const q=act().find(x=>x.id===wpActor(g));if(!wpBotStep(g,q))wpBotAny(g,q.id)}g.ann=null;S.finished=false;S.screen='score';save();render()});await W(500);
  await P.screenshot({path:'/tmp/wp-end.png',fullPage:true});
  const rv=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.wpg;return act().every(p=>total(p)===g.fin[p.id].tot)||act().map(p=>[total(p),g.fin[p.id].tot,JSON.stringify(p.ws)])});
  ok('Finish & reveal: the Wingspan score pad gets every category and the round goals, and totals match',rv===true,rv);
  /* Justin (Nov 21): when a bird can be paid more than one way, you choose the food */
  const pay=await P.evaluate(async()=>{S.players.forEach((x,i)=>{x.on=i<2;x.bot=i?'normal':null});const g=wpDeal();g.ann=null;g.ps.forEach(p=>wpSetup(g,p,[0],['i','s','f','r'],g.offer[p].bo[0]));const me=g.ps[0];g.turn=me;g.ask=null;g.ann=null;
    const bi=WSB.findIndex(b=>b.or&&Object.keys(b.cost).length>=2&&!b.wild&&b.hab.includes('f'));g.hand[me]=[bi];g.food[me]=Object.fromEntries(WPF.map(f=>[f,2]));S.screen='score';save();render();
    const w=ms=>new Promise(r=>setTimeout(r,ms)),clk=async s=>{const e=document.querySelector(s);if(!e)throw new Error('missing '+s);e.dispatchEvent(new MouseEvent('click',{bubbles:true}));await w(300)};
    await clk('[data-a="wpans"][data-k*="play"]');await clk('[data-a="wpplaysel"][data-k="0"]');const n=document.querySelectorAll('[data-a="wppaysel"]').length;
    const want=wpPayOpts(g,me,bi)[1];await clk('[data-a="wppaysel"][data-k="1"]');const before={...S.wpg.food[me]};await clk('.wpdock [data-a="wpans"][data-k*="%22h%22"]');
    const after=S.wpg.food[me],spent={};for(const f in before)if(before[f]!==after[f])spent[f]=before[f]-after[f];
    const bad=wpPayOpts(S.wpg,me,bi).length&&WPS.play;return {ok:n>=2&&JSON.stringify(Object.entries(want).sort())===JSON.stringify(Object.entries(spent).sort()),n,want,spent}});
  ok('Play a bird with an "or" cost: a Pay-with choice appears and the chosen food is what gets spent',pay.ok,pay);
  /* Justin (Nov 21): an end-of-round card before the next round, and goal tiles show the nest picture */
  const rs=await P.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));S.players.forEach((x,i)=>{x.on=i<2;x.bot=i?'normal':null});const g=wpDeal();g.ann=null;g.ps.forEach(p=>wpSetup(g,p,[0],['i','s','f','r'],g.offer[p].bo[0]));g.goals[0]='egr';S.screen='score';save();render();
    const icons=[...document.querySelectorAll('.wpgo')][0].querySelectorAll('img[src*="wp-nest-ground"],img[src*="wp-nest-star"]').length;
    wpRoundEnd(g);save();render();await w(200);const card=document.querySelector('.wprs');const txt=card?card.innerText:'';
    document.querySelector('[data-a="wprsok"]').click();await w(200);return {ok:icons===2&&!!card&&/Round 1 is over/i.test(txt)&&/round 2 of 4/i.test(txt)&&!document.querySelector('.wprs'),icons,txt:txt.slice(0,120)}});
  ok('Goal tiles show the nest picture; at the end of a round a card shows the goal results and what is next, then closes',rs.ok,rs);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
