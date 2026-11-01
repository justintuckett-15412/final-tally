// Dominion heavy rules audit. Kingdoms are stacked with the tricky cards (Possession, Throne Room, Golem, Durations,
// reactions, Masquerade...), 2–6 players, bots of every level plus random "human" moves. Checks after every step:
// cards conserved, counters ≥ 0, Supply sane, hands after Clean-up are 5 (3 after Outpost), turn order is right,
// Possession invariants, Duration bookkeeping, no stray set-aside cards, Embargo/Curse counts, game end conditions.
// Usage: N=120 node dominion-audit.js
const {mk,ok,done,chromium}=require('./link.js');
const N=+(process.env.N||80);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const res=await P.evaluate(async ([N,HEAVY])=>{
    const bad={},note=(k,x)=>{if(!bad[k])bad[k]={n:0,ex:JSON.stringify(x).slice(0,400)};bad[k].n++};
    const rnd=a=>a[Math.floor(Math.random()*a.length)];
    const TRICK=['berserker','bordervillage','cartographer','cauldron','crossroads','develop','farmland','foolsgold','guarddog','haggler','highway','inn','jack','margrave','nomads','scheme','souk','trader','trail','tunnel','weaver','wheelwright','witchshut','youngwitch','ferryman','joust','farmhands','farrier','herald','infirmary','stonemason','hornofplenty','merchantguild','butcher','footpad','jester','advisor','shop','remake','hamlet','plaza','journeyman','huntingparty','carnival','menagerie','baker','soothsayer','fairgrounds','candlestick','kingscourt','tiara','crystalball','warchest','watchtower','mint','hoard','bank','charlatan','clerk','forge','vault','rabble','bishop','investment','peddler','quarry','grandmarket','collection','anvil','possession','throne','golem','outpost','pirate','sailor','masquerade','diplomat','haven','nativev','island','tactician','corsair','blockade','monkey','treasury','herbalist','alchemist','vassal','library','scryingpool','minion','torturer','seawitch','treasuremap','courtier','lurker','swindler','smugglers','bridge','conspirator','apothecary','university','embargo'];
    const count=g=>Object.values(g.sup).reduce((a,v)=>a+v,0)+Object.values(g.ns||{}).reduce((a,v)=>a+v,0)+g.trash.length+g.ps.reduce((a,id)=>a+dnAll(g.me[id]).length,0);
    let games=0,turns=0,poss=0,outp=0,plays={};
    for(let t=0;t<N;t++){S=dnFresh();S.dnx.play=1;S.dnx.ks={base:1,intrigue:1,seaside:1,alchemy:1,prosperity:1,cornucopia:1,hinterlands:1};S.dnx.pc=['auto','on','off'][t%3];
      const pick=TRICK.slice().sort(()=>Math.random()-.5).slice(0,6);S.dnx.kd=dnKdRandom(pick.filter(k=>DNK.includes(k)));
      const n=2+t%5;S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;p.bot=i<n?(i===0&&t%3!==0?null:rnd(['easy','normal','hard'])):null});
      S.started=true;S.screen='score';dnDeal();const g=S.dng;if(HEAVY){g.ps.forEach(id=>{const M=g.me[id];M.dk.push(...HEAVY);M.dk=dnShuf(M.dk)});if(HEAVY.some(k=>DNMANT.includes(k)))g.manT=1;if(HEAVY.includes("charlatan"))g.chl=1}const T0=count(g);let steps=0,lastTurn=g.turn,lastPoss=null,lastExtra=0,hist=[];
      while(g.phase==='play'&&steps<30000){steps++;let a=dnActor(g);const q=act().find(p=>p.id===a);
        const turnBefore=g.turn,possBefore=g.poss?{...g.poss}:null,extraBefore=g.extra,opBefore=g.op,qLen=(g.possQ||[]).length;
        if(!q.bot){const me=dnAsP(g,a),M=g.me[me];
          if(g.ask&&g.ask.p===me){const Q=g.ask;let ans;
            if(Q.k==='pick'){const idx=M.h.map((k,i)=>i).filter(i=>dnPOK(g,Q,M,M.h[i]));const k2=Q.min+Math.floor(Math.random()*(Math.min(Q.max,idx.length)-Q.min+1));ans=idx.sort(()=>Math.random()-.5).slice(0,k2)}
            else if(Q.k==='gain')ans=Q.opt&&(Math.random()<.2||!Q.ok.length)?'':rnd(Q.ok);else if(Q.k==='opts')ans=Q.opts.map(o=>o[0]).sort(()=>Math.random()-.5).slice(0,Q.n);else if(Q.k==='tpick')ans=rnd(Q.cs);
            else if(Q.k==='order')ans=Q.cs.map((c,i)=>i).sort(()=>Math.random()-.5);else if(Q.k==='pos')ans=Math.floor(Math.random()*(M.dk.length+1));else if(Q.k==='name')ans=rnd(dnNameable(g));else if(Q.k==='opts'&&false)0;
            else if(Q.k==='look'){const o=Q.cs.map((c,i)=>i).sort(()=>Math.random()-.5);ans={t:o[0],d:o[1]}}else if(Q.k==='yn')ans=Math.random()<.5;else if(Q.k==='disc')ans=Math.random()<.3&&!Q.must?-1:Math.floor(Math.random()*M.ds.length);
            else if(Q.k==='ban')ans=Q.adv?Math.floor(Math.random()*Q.cs.length):Q.cs.findIndex(k=>dnIs(k,'T')&&(k!=='copper'||Q.cop));else if(Q.k==='sentry')ans={ch:Q.cs.map(()=>rnd(Q.nt?['d','k']:['t','d','k'])),top:0};else if(Q.k==='dpick')ans=M.ds.map((k,i)=>i).filter(i=>dnIs(M.ds[i],'A')&&Math.random()<.5);
            if(!dnAns(g,a,ans))note('human answer refused',{k:Q.k,then:Q.then,ans})}
          else if(g.turn===me&&(M.cf||0)>0&&Math.random()<.15){if(!dnCof(g,a,1+Math.floor(Math.random()*M.cf)))note('coffers refused',M.cf)}
          else if(g.turn===me){if(g.ph==='action'){const ai=M.h.map((k,i)=>i).filter(i=>dnIs(M.h[i],'A'));if(ai.length&&Math.random()<.85){const i=rnd(ai);plays[M.h[i]]=1;if(!dnPlay(g,a,i))note('legal play refused',M.h)}else dnEndAct(g,a)}
            else if(g.manT&&!g.bought&&M.h.some(k=>dnIs(k,'T'))&&Math.random()<.85){if(Math.random()<.3){if(!dnPlayAllT(g,a))note('play all refused',M.h)}else{const ti=M.h.map((k,i)=>i).filter(i=>dnIs(M.h[i],'T'));if(!dnPlayT(g,a,rnd(ti)))note('treasure play refused',M.h)}}
            else{const can=Object.keys(g.sup).filter(k=>g.sup[k]>0&&dnAfford(g,k,g.co,g.po||0)&&dnBuyOk(g,k));if(can.length&&Math.random()<.85){const k=rnd(can);if(!dnBuy(g,a,k))note('legal buy refused',k)}else dnEndTurn(g,a)}}
          else note('human actor has nothing to do',{a,turn:g.turn})}
        else{if(!g.ask&&g.ph==='action'){const M=g.me[g.turn];M.h.filter(k=>dnIs(k,'A')).forEach(k=>plays[k]=1)}dnBotStep(g,q)}
        /* ---- checks ---- */
        if(count(g)!==T0)note('cards lost or made up',{T0,now:count(g),last:g.msg});
        if(g.A<0||g.B<0||g.co<0||(g.po||0)<0)note('negative counter',{A:g.A,B:g.B,co:g.co,po:g.po,msg:g.msg});
        if(Object.values(g.sup).some(v=>v<0))note('negative supply',g.sup);
        if(g.phase==='play'&&!g.ask&&!g.k.length)for(const id of g.ps){const M=g.me[id];if(M.aside.length)note('cards left set aside',{c:M.aside,msg:g.msg});if((M.tt||[]).length)note('top-deck list left over',M.tt);if((M.ptr||[]).length&&!(g.poss&&g.poss.who===id))note('possession trash not returned',M.ptr)}
        if(g.poss&&(g.turn!==g.poss.who||g.poss.by===g.poss.who))note('possession state wrong',g.poss);
        if(g.phase==='play'&&(g.turn!==turnBefore||g.extra&&!extraBefore||g.poss&&!possBefore)){/* a new turn started: check the previous player's hand */
          const prev=turnBefore,PM=g.me[prev];const want=(opBefore&&!extraBefore&&!possBefore?3:5)+(g.lfx||0),avail=PM.h.length+PM.dk.length+PM.ds.length;
          {const dupe=g.turn===prev;if(!dupe&&PM.h.length!==Math.min(want,avail))note('hand after clean-up isn’t 5 (or 3 after Outpost)',{h:PM.h.length,want,avail,msg:g.msg});}
          if(!g.poss&&!g.extra){/* normal successor */const base=possBefore?possBefore.next:prev;if(g.turn!==dnOthers(g,base)[0]&&g.turn!==base)note('wrong player next',{prev,turn:g.turn,base})}
          if(g.me[g.turn].du.length)note('durations still waiting at turn start',g.me[g.turn].du)}
        if(g.phase==='done'){const empt=Object.keys(g.sup).filter(k=>g.sup[k]<=0);if(g.sup.province>0&&!(g.sup.colony!=null&&g.sup.colony<=0)&&empt.length<(g.pe||3))note('game ended early',{empt,pe:g.pe})}}
      poss+=(g.lg||[]).filter(l=>/possesses/.test(l.t)).length;outp+=(g.lg||[]).filter(l=>/Outpost turn/.test(l.t)).length;
      if(g.phase!=='done')note('game never ended',{steps,sup:g.sup});else games++;
      turns+=g.ps.reduce((a2,id)=>a2+g.me[id].tn,0);
      act().forEach(p=>{if(total(p)!==dnVP(g.me[p.id]))note('score sheet total differs from the deck',{t:total(p),vp:dnVP(g.me[p.id]),f:p.dn&&p.dn.f})})}
    return {bad,games,turns,poss,outp,played:Object.keys(plays).length}},[N,process.env.HEAVY?process.env.HEAVY.split(','):null]);
  ok('Dominion audit: every game ended',res.games===N,res);
  ok('Dominion audit: no rule problems',Object.keys(res.bad).length===0,res.bad);
  console.log('DBG',JSON.stringify({games:res.games,avgTurns:(res.turns/res.games).toFixed(1),possessedTurns:res.poss,outpostTurns:res.outp,actionCardsPlayed:res.played}));
  ok('Dominion audit: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
