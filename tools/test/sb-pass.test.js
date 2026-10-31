// Skip-Bo: when your hand is empty and nothing is left to draw, you can still end your turn.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(900);
  await p.evaluate(()=>{SET.toursOff=true;switchGame('skipbo');resetScores();SBX().play=1;S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i===1)q.bot='normal';else delete q.bot});save();const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});await W(1500);
  await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;g.turn=me;g.h[me]=[];g.deck=[];g.done=[];g.bp=[[],[],[],[]];g.st[me]=['9#900','8#901'];render()});await W(400);
  ok('an empty hand with nothing to draw shows End turn',await p.evaluate(()=>!!document.querySelector('[data-a=sbppass]')));
  await p.evaluate(()=>document.querySelector('[data-a=sbppass]').click());await W(400);
  ok('End turn passes to the next player',await p.evaluate(()=>(S.sbg.lg||[]).some(e=>/no cards to draw/.test(e.t))));
  ok('End turn is refused while you still hold cards',await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;g.turn=me;g.h[me]=['3#902'];return sbPass(g,me)===false}));
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
