// Dominion rules fuzz: many games with bots and random "human" moves (legal and illegal), checking after every step:
// no cards lost or made up, counters never negative, illegal moves change nothing, every game ends. Usage: N=40 node dominion-fuzz.js
const {mk,W,ok,done,chromium}=require('./link.js');
const N=+(process.env.N||30);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const res=await P.evaluate(async N=>{
    const bad={},note=(k,x)=>{if(!bad[k])bad[k]={n:0,ex:JSON.stringify(x).slice(0,300)};bad[k].n++};
    const rnd=a=>a[Math.floor(Math.random()*a.length)];
    const count=g=>Object.values(g.sup).reduce((a,v)=>a+v,0)+g.trash.length+g.ps.reduce((a,id)=>a+dnAll(g.me[id]).length,0);
    let games=0,turns=0,ends={prov:0,piles:0},cardsSeen={};
    for(let t=0;t<N;t++){S=dnFresh();S.dnx.play=1;S.dnx.kd=dnKdRandom([]);const n=2+t%3;S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;p.bot=i<n?(t%2&&i===0?null:rnd(['easy','normal','hard'])):null});
      S.started=true;S.screen='score';dnDeal();const g=S.dng,T0=count(g);g.kd.forEach(k=>cardsSeen[k]=1);let steps=0;
      while(g.phase==='play'&&steps<20000){steps++;const a=dnActor(g),q=act().find(p=>p.id===a);
        if(!q.bot){/* random human */const M=g.me[a];
          if(Math.random()<.15){const before=JSON.stringify(g),o=g.ps.find(x=>x!==a);const f=rnd([()=>dnPlay(g,o,0),()=>dnBuy(g,o,'copper'),()=>dnEndTurn(g,o),()=>dnAns(g,o,[]),()=>dnBuy(g,a,'province')&&g.co<0,()=>dnAns(g,a,[99]),()=>dnPlay(g,a,99)]);const r=f();if(!r&&JSON.stringify(g)!==before)note('rejected move changed the game',f.toString())}
          if(g.ask&&g.ask.p===a){const Q=g.ask;let ans;
            if(Q.k==='pick'){const idx=M.h.map((k,i)=>i).filter(i=>!Q.f||dnIs(M.h[i],Q.f));const n=Q.min+Math.floor(Math.random()*(Math.min(Q.max,idx.length)-Q.min+1));ans=idx.sort(()=>Math.random()-.5).slice(0,n)}
            else if(Q.k==='gain')ans=rnd(dnGainOpts(g,Q.max,Q.f));else if(Q.k==='yn')ans=Math.random()<.5;else if(Q.k==='disc')ans=Math.random()<.3?-1:Math.floor(Math.random()*M.ds.length);
            else if(Q.k==='ban')ans=Q.cs.findIndex(k=>dnIs(k,'T')&&k!=='copper');else if(Q.k==='sentry')ans={ch:Q.cs.map(()=>rnd(['t','d','k'])),top:0};
            if(!dnAns(g,a,ans))note('human answer refused',{Q,ans})}
          else if(g.turn===a){if(g.ph==='action'){const ai=M.h.map((k,i)=>i).filter(i=>dnIs(M.h[i],'A'));if(ai.length&&Math.random()<.8){if(!dnPlay(g,a,rnd(ai)))note('legal play refused',M.h)}else dnEndAct(g,a)}
            else{const can=Object.keys(g.sup).filter(k=>g.sup[k]>0&&dnC(k).c<=g.co);if(can.length&&Math.random()<.85){const k=rnd(can);if(!dnBuy(g,a,k))note('legal buy refused',k)}else dnEndTurn(g,a)}}
          else note('human actor has nothing to do',{a,turn:g.turn})}
        else dnBotStep(g,q);
        if(count(g)!==T0)note('cards lost or made up',{T0,now:count(g),last:g.msg});
        if(g.A<0||g.B<0||g.co<0)note('negative counter',{A:g.A,B:g.B,co:g.co});
        for(const id of g.ps){const M=g.me[id];if(g.phase==='play'&&!g.ask&&!g.k.length&&M.aside.length)note('cards left set aside',M.aside)}
        if(Object.values(g.sup).some(v=>v<0))note('negative supply',g.sup)}
      if(g.phase!=='done')note('game never ended',{steps,sup:g.sup});else{games++;if(g.sup.province<=0)ends.prov++;else ends.piles++}
      turns+=g.ps.reduce((a,id)=>a+g.me[id].tn,0);
      /* scoring matches the deck */
      act().forEach(p=>{if(total(p)!==dnVP(g.me[p.id]))note('score sheet total differs from the deck',{t:total(p),vp:dnVP(g.me[p.id])})})}
    return {bad,games,turns,ends,seen:Object.keys(cardsSeen).length}},N);
  ok('Dominion fuzz: every game ended',res.games===N,res);
  ok('Dominion fuzz: no rule problems',Object.keys(res.bad).length===0,res.bad);
  console.log('DBG',JSON.stringify({games:res.games,avgTurns:(res.turns/res.games).toFixed(1),ends:res.ends,seen:res.seen}));
  ok('Dominion fuzz: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
