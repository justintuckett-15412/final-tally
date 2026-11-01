// Dominion rules fuzz: many games with bots and random "human" moves (legal and illegal), checking after every step:
// no cards lost or made up, counters never negative, illegal moves change nothing, every game ends. Usage: N=40 node dominion-fuzz.js
const {mk,W,ok,done,chromium}=require('./link.js');
const N=+(process.env.N||30);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const res=await P.evaluate(async N=>{
    const bad={},note=(k,x)=>{if(!bad[k])bad[k]={n:0,ex:JSON.stringify(x).slice(0,300)};bad[k].n++};
    const rnd=a=>a[Math.floor(Math.random()*a.length)];
    const count=g=>Object.values(g.sup).reduce((a,v)=>a+v,0)+Object.values(g.ns||{}).reduce((a,v)=>a+v,0)+g.trash.length+g.ps.reduce((a,id)=>a+dnAll(g.me[id]).length,0);
    let possT=0,games=0,turns=0,ends={prov:0,piles:0},cardsSeen={};
    for(let t=0;t<N;t++){S=dnFresh();S.dnx.play=1;S.dnx.ks={base:t%8===0||t%8===6?1:0,intrigue:t%8===1?1:0,seaside:t%8===2?1:0,alchemy:t%8===3||t%8===4?1:0,prosperity:t%8===4?1:0,cornucopia:t%8===5||t%8===6?1:0,hinterlands:t%8===7||t%8===0?1:0,darkages:t%3===0?1:0,adventures:t%2===0?1:0,empires:t%2===1||t%5===0?1:0};S.dnx.evm='auto';S.dnx.ev=null;if(t%6===4){S.dnx.ks.base=1}S.dnx.kd=dnKdRandom([]);const n=2+t%5;S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;p.bot=i<n?(t%2&&i===0?null:rnd(['easy','normal','hard'])):null});
      S.started=true;S.screen='score';dnDeal();const g=S.dng,T0=count(g);g.kd.forEach(k=>cardsSeen[k]=1);let steps=0;
      while(g.phase==='play'&&steps<20000){steps++;let a=dnActor(g);const q=act().find(p=>p.id===a);
        if(g.poss)possT++;if(!q.bot){/* random human */const M=g.me[dnAsP(g,a)];a=dnAsP(g,a);
          if(Math.random()<.15){const before=JSON.stringify(g),o=g.ps.find(x=>x!==a);const f=rnd([()=>dnPlay(g,o,0),()=>dnBuy(g,o,'copper'),()=>dnEndTurn(g,o),()=>dnAns(g,o,[]),()=>g.co<dnCost(g,'province')&&dnBuy(g,a,'province'),()=>dnAns(g,a,[99]),()=>dnPlay(g,a,99)]);const r=f();if(!r&&JSON.stringify(g)!==before)note('rejected move changed the game',f.toString());if(r)continue}
          if(g.ask&&g.ask.p===a){const Q=g.ask;let ans;
            if(Q.k==='pick'){const idx=M.h.map((k,i)=>i).filter(i=>dnPOK(g,Q,M,M.h[i]));const n=Q.min+Math.floor(Math.random()*(Math.min(Q.max,idx.length)-Q.min+1));ans=idx.sort(()=>Math.random()-.5);if(Q.un){const s=new Set();ans=ans.filter(i=>!s.has(dnNm(M.h[i]))&&s.add(dnNm(M.h[i])))}ans=ans.slice(0,Math.max(Q.min,Math.min(n,ans.length)))}
            else if(Q.k==='gain')ans=Q.opt&&(Math.random()<.2||!Q.ok.length)?'':rnd(Q.then==='tok'||Q.then==='emb'?Q.ok:Q.ok.filter(k=>g.sup[k]>0).length?Q.ok.filter(k=>g.sup[k]>0):Q.ok);else if(Q.k==='opts')ans=Q.opts.map(o=>o[0]).sort(()=>Math.random()-.5).slice(0,Q.n);else if(Q.k==='tpick')ans=rnd(Q.cs);else if(Q.k==='order')ans=Q.cs.map((c,i)=>i).sort(()=>Math.random()-.5);else if(Q.k==='pos')ans=Math.floor(Math.random()*(M.dk.length+1));else if(Q.k==='name')ans=rnd(dnNameable(g));else if(Q.k==='opts'&&false)0;else if(Q.k==='look'){const o=Q.cs.map((c,i)=>i).sort(()=>Math.random()-.5);ans={t:o[0],d:o[1]}}else if(Q.k==='yn')ans=Math.random()<.5;else if(Q.k==='disc')ans=Math.random()<.3&&!Q.must?-1:Math.floor(Math.random()*M.ds.length);
            else if(Q.k==='ban')ans=Q.adv?Math.floor(Math.random()*Q.cs.length):Q.cs.findIndex(k=>dnIs(k,'T')&&(k!=='copper'||Q.cop));else if(Q.k==='sentry'){let ch=Q.cs.map(()=>rnd(Q.nt?['d','k']:['t','d','k']));if(Q.nd!=null)ch=Q.cs.map((c,i)=>i<Q.nd?'d':'k');ans={ch,top:0}}else if(Q.k==='dpick')ans=M.ds.map((k,i)=>i).filter(i=>(Q.any||dnIs(M.ds[i],'A'))&&Math.random()<.5).slice(0,Q.max!=null?Q.max:99);else if(Q.k==='plpick'){const seen={};ans=M.pl.map((k,i)=>[k,i]).filter(([k])=>{if(Q.uniq&&seen[k])return false;seen[k]=1;return Math.random()<.5}).slice(0,Q.max).map(x=>x[1])}
            if(!dnAns(g,a,ans))note('human answer refused',{Q,ans})}
          else if(g.turn===a){if(g.ph==='action'){const ai=M.h.map((k,i)=>i).filter(i=>dnIs(M.h[i],'A'));if(ai.length&&Math.random()<.8){if(!dnPlay(g,a,rnd(ai)))note('legal play refused',M.h)}else dnEndAct(g,a)}
            else if(g.manT&&!g.bought&&M.h.some(k=>dnIs(k,'T'))&&Math.random()<.85){if(Math.random()<.3){if(!dnPlayAllT(g,a))note('play all refused',M.h)}else{const ti=M.h.map((k,i)=>i).filter(i=>dnIs(M.h[i],'T'));if(!dnPlayT(g,a,rnd(ti)))note('treasure play refused',M.h)}}
            else if((g.ev||[]).length&&Math.random()<.25&&(g.ev||[]).some(e=>dnEvOk(g,dnAsP(g,a),e))){const e=rnd(g.ev.filter(e=>dnEvOk(g,dnAsP(g,a),e)));if(!dnBuyEv(g,a,e))note('legal event refused',e)}
            else{const can=g.nob?[]:Object.keys(g.sup).filter(k=>g.sup[k]>0&&dnAfford(g,k,g.co,g.po||0)&&dnBuyOk(g,k));if(can.length&&Math.random()<.85){const k=rnd(can);if(!dnBuy(g,a,k))note('legal buy refused',{k,B:g.B,kk:g.k.map(x=>x.t),ph:g.ph,co:g.co,manT:g.manT,msg:g.msg})}else dnEndTurn(g,a)}}
          else note('human actor has nothing to do',{a,turn:g.turn,ask:g.ask&&[g.ask.p,g.ask.k,g.ask.then,g.ask.why],k:g.k.length,ph:g.ph,phase:g.phase,msg:g.msg,poss:g.poss})}
        else dnBotStep(g,q);
        if(count(g)!==T0)note('cards lost or made up',{T0,now:count(g),last:g.msg});
        if(g.A<0||g.B<0||g.co<0)note('negative counter',{A:g.A,B:g.B,co:g.co});
        for(const id of g.ps){const M=g.me[id];if(g.phase==='play'&&!g.ask&&!g.k.length&&M.aside.length)note('cards left set aside',M.aside)}
        if(Object.values(g.sup).some(v=>v<0))note('negative supply',g.sup)}
      if(g.phase!=='done')note('game never ended',{steps,tn:g.ps.map(id=>g.me[id].tn),ask:g.ask&&[g.ask.k,g.ask.then,g.ask.why],ph:g.ph,msg:g.msg,kd:g.kd,ev:g.ev});else{games++;if(g.sup.province<=0)ends.prov++;else ends.piles++}
      turns+=g.ps.reduce((a,id)=>a+g.me[id].tn,0);
      /* scoring matches the deck */
      if(g.phase==='done')act().forEach(p=>{if(total(p)!==dnVP(g.me[p.id]))note('score sheet total differs from the deck',{t:total(p),vp:dnVP(g.me[p.id])})})}
    return {bad,games,turns,ends,possT,seen:Object.keys(cardsSeen).length}},N);
  ok('Dominion fuzz: every game ended',res.games===N,res);
  ok('Dominion fuzz: no rule problems',Object.keys(res.bad).length===0,res.bad);
  console.log('DBG',JSON.stringify({possT:res.possT,games:res.games,avgTurns:(res.turns/res.games).toFixed(1),ends:res.ends,seen:res.seen}));
  ok('Dominion fuzz: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
