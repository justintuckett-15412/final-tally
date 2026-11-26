// Skip-Bo: when your hand is empty and nothing is left to draw, you can still end your turn.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(900);
  await p.evaluate(()=>{SET.toursOff=true;switchGame('skipbo');resetScores();SBX().play=1;S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i===1)q.bot='normal';else delete q.bot});save();const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});await W(1500);
  await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;g.turn=me;g.h[me]=[];g.deck=[];g.done=[];g.bp=[[],[],[],[]];g.st[me]=['9#900','8#901'];render()});await W(400);
  ok('an empty hand with nothing to draw shows End turn',await p.evaluate(()=>!!document.querySelector('[data-a=sbppass]')));
  await p.evaluate(()=>document.querySelector('[data-a=sbppass]').click());await W(400);
  ok('End turn passes to the next player',await p.evaluate(()=>(S.sbg.lg||[]).some(e=>/no cards to draw/.test(e.t))));
  ok('End turn is refused while you still hold cards',await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;g.turn=me;g.h[me]=['3#902'];return sbPass(g,me)===false}));
  /* Go back (Nov 26): undo hand plays until the stock is played, a card is drawn or the turn ends; greyed building piles say why */
  await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;g.phase='play';g.turn=me;g.h[me]=['3#910','5#911','7#912','9#913','11#914'];g.deck=['4#920','6#921','8#922'];g.done=[];g.bp=[['1#930','2#931'],[],[],[]];g.st[me]=['12#940','4#941'];g.dp[me]=[[],[],[],[]];render()});await W(200);
  const tapA=(sel)=>p.evaluate(sel=>{const x=document.querySelector(sel);if(x)x.click();return !!x},sel);
  await tapA('[data-a=sbpsrc][data-c="9#913"]');await W(100);
  const w=await p.evaluate(()=>((document.querySelector('[data-a=sbpbuild][data-i="0"] .uxwhy')||{}).textContent||'')+'|'+(document.querySelector('[data-a=sbpbuild][data-i="1"]')||{title:''}).title);
  ok('a building pile your picked card doesn’t fit says why (Needs a 3 / Needs a 1)',/Needs a 3/.test(w)&&/Needs a 1/.test(w),w);
  await tapA('[data-a=sbpsrc][data-c="9#913"]');await tapA('[data-a=sbpsrc][data-c="3#910"]');await tapA('[data-a=sbpbuild][data-i="0"]');await W(150);
  ok('after playing a hand card, Go back shows',await p.evaluate(()=>S.sbg.bp[0].length===3&&!!document.querySelector('[data-a=sbpundo]')));
  await tapA('[data-a=sbpundo]');await W(150);
  ok('Go back puts the 3 back in the hand and off the building pile',await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;return g.bp[0].length===2&&g.h[me].includes('3#910')&&g.turn===me&&!document.querySelector('[data-a=sbpundo]')}));
  await tapA('[data-a=sbpsrc][data-c="3#910"]');await tapA('[data-a=sbpbuild][data-i="0"]');await W(100);await tapA('[data-a=sbpsrc][data-f=stock]');await tapA('[data-a=sbpbuild][data-i="0"]');await W(150);
  ok('playing the stock card (the next one is revealed) leaves no Go back',await p.evaluate(()=>{const g=S.sbg,me=act()[0].id;return g.bp[0].length===4&&g.st[me].length===1&&!document.querySelector('[data-a=sbpundo]')}));
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
