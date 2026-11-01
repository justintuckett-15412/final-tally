// Stone Age rules fuzz: many games (2, 3 and 4 players), mixing computer players and random "human" moves
// (legal and illegal), checking the rulebook after every action. Usage: N=60 node stoneage-fuzz.js
const {mk,W,ok,done,chromium}=require('./link.js');
const N=+(process.env.N||40);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const res=await P.evaluate(async N=>{
    const bad={},note=(k,x)=>{if(!bad[k])bad[k]={n:0,ex:x};bad[k].n++};
    const rnd=a=>a[Math.floor(Math.random()*a.length)];
    const KEY=g=>JSON.stringify(g);
    function check(g,tag){const P=act(),n=g.ps.length;
      for(const id of g.ps){const M=g.me[id];
        for(const k of ['w','c','s','g','j','food'])if(!(M[k]>=0)||M[k]%1)note('negative or broken '+k,{tag,k,v:M[k]});if(!g.x.J&&M.j)note('jewelry without the expansion',M.j);if(M.mt<0||M.mt>10)note('merchant track out of 0..10',M.mt);
        if(M.ag<0||M.ag>10)note('agriculture out of 0..10',M.ag);if(M.pp<5||M.pp>10)note('people out of 5..10',M.pp);
        if(M.tl.length>3||M.tl.some(v=>v<1||v>4))note('tool tiles wrong',M.tl);
        const tt=M.tl.reduce((a,v)=>a+v,0),exp=tt<=3?Array(tt).fill(1):null;if(exp&&M.tl.join()!==exp.join())note('first 3 tools should be value-1 tiles',M.tl);
        if(Math.max(...M.tl,0)-Math.min(...(M.tl.length?M.tl:[0]))>1&&M.tl.length===3)note('tools not grown evenly',M.tl);
        const bp=M.bld.reduce((a,id)=>a+((M.bp||{})[id]??0),0);if(M.pts!==bp+M.ex-10*M.hu)note('score track != huts + card points - hunger',{pts:M.pts,bp,ex:M.ex,hu:M.hu});
        const p=P.find(q=>q.id===id);if(p&&total(p)!==M.pts+(g.phase==='done'?saFinal(p):saFinal(p)))0;
        if(g.phase==='place'){const on=Object.values(g.pl).reduce((a,o)=>a+(o[id]||0),0);if(on+g.left[id]!==M.pp)note('placed + left != people',{on,left:g.left[id],pp:M.pp})}}
      /* board limits */
      for(const [loc,o] of Object.entries(g.pl)){const tot=Object.values(o).reduce((a,v)=>a+v,0),who=Object.keys(o).length;
        if(SAGATH.includes(loc)&&loc!=='hunt'){if(tot>7)note('more than 7 on '+loc,tot);if(n===2&&who>1||n===3&&who>2)note(`too many players on ${loc} with ${n}`,who)}
        if((loc==='hut'||loc==='merch')&&(tot!==2||who!==1))note(loc+' not exactly 2 of one player',o);if(loc==='merch'&&!g.x.ms)note('merchant used without the expansion',o);
        if(saIsTent(loc)){const own=g.ps.find(id=>(g.me[id].tents||[]).includes(loc.slice(1)));if(who!==1||!o[own]||tot>3)note('tent rule broken',{o,own})}
        if((loc==='tools'||loc==='field'||saIsCard(loc)||/^b\d$/.test(loc))&&tot>1)note('more than 1 on '+loc,o)}
      {const used=saVil(g).filter(v=>saPlN(g,v)).length,max=g.x.ms?(n>=5?4:n===4?3:2):(n>=4?3:2);if(used>max)note(`${used} village spots used with ${n} players`,g.pl)}
      /* every card and hut accounted for, none twice */
      const cards=[...g.deck,...g.slots.filter(Boolean),...g.ps.flatMap(id=>g.me[id].cards)];const NC=g.x.leaf?45:36;if(g.nc!==NC||cards.length!==NC||new Set(cards).size!==NC)note('cards lost or duplicated',{n:cards.length,NC});
      if(g.slots.length!==(g.x.s5?5:4))note('wrong number of card spaces',g.slots.length);
      {const all=[...g.piles.flat(),...g.ps.flatMap(id=>g.me[id].bld)];if(all.some(h=>{const H=saHut(h);return H.A&&!g.x.acorn||H.L&&!(g.x.leaf||g.x.fit&&H.O)}))note('hut from the wrong set',all)}
      const huts=[...g.piles.flat(),...g.ps.flatMap(id=>g.me[id].bld)];if(huts.length!==7*n||new Set(huts).size!==huts.length)note('huts lost or duplicated',huts.length);
      if(g.piles.length!==n)note('wrong number of hut piles',g.piles.length);
      if(g.phase==='place'&&g.slots.some(x=>!x))note('empty card space during placing',g.slots)}
    const tryBad=(g,pid)=>{/* illegal moves must change nothing */const before=KEY(g);const other=g.ps.find(x=>x!==pid);
      const tries=[()=>saPlace(g,other,'hunt',1),()=>saPlace(g,pid,'hut',1),()=>saPlace(g,pid,'tools',2),()=>saPlace(g,pid,'forest',8),()=>saPlace(g,pid,'c0',2),()=>saTake(g,other),()=>saRoll(g,other),()=>saBuy(g,other,{w:9,c:0,s:0,g:0}),()=>saFeed(g,other,{w:1,c:0,s:0,g:0}),()=>saDie(g,other,0),()=>saPlace(g,pid,'merch',1),()=>saTake(g,pid,99),()=>saFeedOk(g,other),()=>saResolve(g,other,'hunt')];
      const f=rnd(tries);const okNow=g.phase==='feed'&&((g.fok||{})[other]||(g.fd||{})[other]);const r=f();if(r&&!okNow&&g.turn!==other&&saActor(g)!==other){note('illegal move accepted',f.toString())}else if(!r&&KEY(g)!==before)note('rejected move still changed the game',f.toString())};
    function humanStep(g,pid){const M=g.me[pid];
      if(g.phase==='place'){const L=saLocs(g).filter(l=>saCanPlace(g,pid,l));if(!L.length){note('human has no legal spot but it is their turn',{left:g.left[pid]});return saPlaceNext(g,pid)}const l=rnd(L),max=saCanPlace(g,pid,l);return saPlace(g,pid,l,l==='hut'||l==='merch'?2:SAGATH.includes(l)||saIsTent(l)?1+Math.floor(Math.random()*max):1)}
      if(g.phase==='act'){if(g.dc&&saDcWho(g)===pid){const js=g.dc.dice.map((v,j)=>v==null?null:j).filter(x=>x!=null);return saDie(g,pid,rnd(js))}
        if(g.roll&&g.roll.pid===pid){if(!g.roll.dice)return saRoll(g,pid);for(let i=0;i<M.tl.length;i++)if(Math.random()<.5)saTool(g,pid,'t',i);for(let i=0;i<M.one.length;i++)if(Math.random()<.3)saTool(g,pid,'o',i);let jw=0;if(g.x.J&&!g.roll.card&&(g.roll.res||SALOC[g.roll.loc].r)==='food')jw=Math.floor(Math.random()*(saRollGet(g)+1));return saTake(g,pid,jw)}
        if(g.pay&&g.pay.pid===pid){const plan=saBotPayPlan(g,pid,g.pay.loc);if(plan&&Math.random()<.85){if(!saPayOk(g,plan.o,plan.t,plan.x))note('bot pay plan not accepted by the rules',{loc:g.pay.loc,plan});return saBuy(g,pid,plan.o,plan.t,plan.x)}return saSkip(g,pid)}
        if(g.pick&&g.pick.pid===pid){const o={w:0,c:0,s:0,g:0};for(let i=0;i<g.pick.n;i++)o[rnd(SAK)]++;return saChoose(g,pid,o)}
        if(g.turn===pid)return saResolve(g,pid,rnd(g.todo[pid]||[]))}
      if(g.phase==='feed'&&(g.fok||{})[pid])return saFeedOk(g,pid);
      if(g.phase==='feed'&&(g.fd||{})[pid]){const F=g.fd[pid];if(saResN(M)>=F.short&&Math.random()<.7){const o={w:0,c:0,s:0,g:0};let k=F.short;for(const r of SAK){const t=Math.min(k,M[r]);o[r]=t;k-=t}return saFeed(g,pid,o)}return saFeed(g,pid,'starve')}}
    const stats={games:0,rounds:0,ends:{},steps:0,starved:0,maxRounds:0,scores:[]};
    const MODES=[{exp:0,mix:'none'},{exp:0,mix:'fit'},{exp:0,mix:'jewel'},{exp:1,bonus:0},{exp:1,bonus:1}];stats.modes={};
    for(let G=0;G<N;G++){const mode=MODES[G%MODES.length],ex=!!mode.exp;const n=2+(Math.floor(G/MODES.length)+G)%(ex?4:3);switchGame('stoneage');resetScores();Object.assign(SAX(),{play:1,exp:0,bonus:0,mix:'none'},mode);stats.modes[JSON.stringify(mode)]=(stats.modes[JSON.stringify(mode)]||0)+1;
      S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;if(i<n&&(G+i)%2)p.bot=['easy','normal','hard'][(G+i)%3];else delete p.bot});S.started=true;S.screen='score';saDeal();const g=S.sag;const human={};act().forEach(p=>human[p.id]=!p.bot);
      let steps=0,lastR=-1;check(g,'deal');
      while(g.phase!=='done'&&steps<6000){steps++;
        /* rule checks at the start of each round */
        if(g.r!==lastR){lastR=g.r;if(g.first!==g.ps[g.r%n])note('first player did not rotate',{r:g.r});g.ps.forEach(id=>{if(g.me[id].tu.some(x=>x))note('tools not refreshed at round start',g.me[id].tu)})}
        let who=g.phase==='feed'?(Object.keys(g.fd||{})[0]||Object.keys(g.fok||{})[0]):saActor(g);if(!who){note('nobody to act',{ph:g.phase});break}
        const q=act().find(p=>p.id===who);if(Math.random()<.15)tryBad(g,who);
        const trB=JSON.stringify(g.trd||{});const before=KEY(g);
        if(human[who])humanStep(g,who);else{if(g.phase==='feed')saBotFeed(g,q);else if(g.phase==='place')saBotPlace(g,q);else saBotAct(g,q)}
        if(KEY(g)===before){note('a move did nothing (game would hang)',{ph:g.phase,who:human[who]?'human':q.bot,roll:!!g.roll,pay:!!g.pay,dc:!!g.dc});break}
        if(JSON.stringify(g.trd||{})!==trB&&Object.keys(g.trd||{}).length>JSON.parse(trB==='{}'?'{}':trB)&&0)0;if(Object.keys(g.trd||{}).length>Object.keys(JSON.parse(trB)).length)g._tr=(g._tr||0)+1;
        check(g,g.phase)}
      if(g.phase!=='done')note('game never ended',{r:g.r,ph:g.phase});
      stats.games++;stats.tents=(stats.tents||0)+g.ps.reduce((a,id)=>a+(g.me[id].tents||[]).length,0);stats.trades=(stats.trades||0)+(g._tr||0);stats.jewel=(stats.jewel||0)+g.ps.reduce((a,id)=>a+(g.me[id].j||0),0);stats.maxP=Math.max(stats.maxP||0,n);stats.rounds+=g.r+1;stats.maxRounds=Math.max(stats.maxRounds,g.r+1);stats.ends[g.end]=(stats.ends[g.end]||0)+1;stats.steps+=steps;stats.starved+=g.ps.reduce((a,id)=>a+g.me[id].hu,0);
      /* end-of-game rules */
      if(g.end==='huts'&&!g.piles.some(p=>!p.length))note('ended on huts with no empty pile',g.piles.map(p=>p.length));
      if(g.end==='cards'&&g.deck.length>=g.slots.filter(x=>!x).length)note('ended on cards with enough to refill',{deck:g.deck.length});
      act().forEach(p=>{const M=g.me[p.id],f=saFinalOf(M),x=p.sa.f||{};if(JSON.stringify(f)!==JSON.stringify(x))note('final scoring not copied to the sheet',{f,x});
        const kinds={};M.cards.forEach(id=>{const c=saCard(id);if(c.k)kinds[c.k]=(kinds[c.k]||0)+1});const sets=[];let K={...kinds};while(Object.values(K).some(v=>v>0)){const s=Object.values(K).filter(v=>v>0).length;sets.push(s);for(const k in K)if(K[k]>0)K[k]--}
        const green=sets.reduce((a,v)=>a+v*v,0);if(green!==saGreen(p)&&sets.length<=2)note('green card scoring wrong',{sets,app:saGreen(p)});if(sets.length>2)note('three or more green sets possible but only 2 scored',{sets,app:saGreen(p)});if(sets[0]>9)note('more than 9 kinds',sets);
        const sand=M.cards.reduce((a,id)=>{const c=saCard(id);if(!c.s)return a;return a+(c.s.fa||0)*M.ag+(c.s.tm||0)*saTT(M)+(c.s.bu||0)*M.bld.length+(c.s.sh||0)*M.pp+(c.s.mc||0)*(M.mt||0)},0);if(sand!==saSand(p))note('sand card scoring wrong',{sand,app:saSand(p)});
        if(total(p)>600)note('impossibly high score',{tot:total(p),pts:M.pts,huts:M.bld.length,bp:M.bp,ex:M.ex,green,sand,res:saResN(M),ag:M.ag,tt:saTT(M),pp:M.pp,cards:M.cards.length,s:f,bot:p.bot||'human',r:g.r});const want=M.pts+green+sand+saResN(M);if(total(p)!==want)note('total wrong',{app:total(p),want});stats.scores.push(total(p))})}
    stats.avgRounds=+(stats.rounds/stats.games).toFixed(1);stats.avgScore=Math.round(stats.scores.reduce((a,v)=>a+v,0)/stats.scores.length);stats.minScore=Math.min(...stats.scores);stats.maxScore=Math.max(...stats.scores);delete stats.scores;
    return {bad,stats}},N);
  console.log('STATS',JSON.stringify(res.stats));
  for(const [k,v] of Object.entries(res.bad))console.log('ISSUE',k,'×'+v.n,JSON.stringify(v.ex).slice(0,300));
  ok('Stone Age fuzz: no rule problems in '+N+' games',!Object.keys(res.bad).length);
  ok('Stone Age fuzz: no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
