// Layout batch: pot boom + smolder, wide iPad columns, recently played on home, the "Your turn" banner.
const {chromium,W,ok,done,BASE}=require('./link.js');
const START=`const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();`;
(async()=>{const b=await chromium.launch();const errs=[];
  // Boom + smolder
  let p=await b.newPage({viewport:{width:400,height:850}});p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(1000);
  await p.evaluate(START0=>{SET.toursOff=true;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=false;S.players.forEach((q,i)=>{q.on=i<3;q.name=['Me','Gizmo','Pip'][i]||'';if(i)q.bot='normal';else delete q.bot});save();eval(START0);const g=S.qpg;g.phase='card';qpSetCard(g,'');g.ps.forEach(id=>g.pl[id].sf=true);g.brewAnn=null;g.ann=null;const L=g.pl[act()[0].id];L.ws=6;L.bag=['w3#1'];render()},START);
  await W(1500);await p.waitForSelector("[data-a=qpdraw]");
  await p.evaluate(()=>{window.__boom=0;new MutationObserver(()=>{if(document.querySelector('.qpboom'))window.__boom=1}).observe(document.body,{childList:true,subtree:true});document.querySelector("[data-a=qpdraw]").click()});
  let boom=false;for(let i=0;i<80;i++){await W(100);if(await p.evaluate(()=>window.__boom)){boom=true;break}}
  ok('pot burst shows the boom overlay',boom);
  await W(3000);
  ok('boom overlay cleans itself up',await p.evaluate(()=>!document.querySelector('.qpboom')));
  ok('exploded player card smolders',await p.evaluate(()=>document.querySelectorAll('.tab.smolder .smoke').length>0));
  await p.close();
  // Wide layout
  p=await b.newPage({viewport:{width:1180,height:820}});p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(1000);
  await p.evaluate(START0=>{SET.toursOff=true;switchGame('quacks');resetScores();const X=QKX();X.play=1;S.players.forEach((q,i)=>{q.on=i<3;q.name=['Me','Gizmo','Pip'][i]||'';if(i)q.bot='normal';else delete q.bot});save();eval(START0);const g=S.qpg;g.phase='card';qpSetCard(g,'');g.ps.forEach(id=>g.pl[id].sf=true);g.brewAnn=null;g.ann=null;render()},START);
  await W(1200);
  let r=await p.evaluate(()=>{const m=document.querySelector('.qpme');return {wide:document.body.classList.contains('qpwide'),left:!!(m&&m.closest('.qpcolL')),right:document.querySelectorAll('.qpcolR > *').length}});
  ok('iPad landscape: pot on the left, shop on the right',r.wide&&r.left&&r.right>0,r);
  await p.setViewportSize({width:400,height:850});await p.evaluate(()=>render());await W(500);
  ok('phone width goes back to one column',await p.evaluate(()=>!document.body.classList.contains('qpwide')&&!document.querySelector('.qpcols')));
  // Recently played
  await p.evaluate(()=>{S.screen='home';render()});await W(500);
  ok('home shows Recently played with Quacks',await p.evaluate(()=>{const h=document.querySelector('.hrecent');return !!h&&/Quacks/i.test(h.textContent)}));
  await p.close();
  // Turn banner
  p=await b.newPage({viewport:{width:400,height:850}});p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(900);
  await p.evaluate(START0=>{SET.toursOff=true;switchGame('uno');resetScores();UNX().play=1;S.players.forEach((q,i)=>{q.on=i<4;q.name=['Me','Gizmo','Pip','Ace'][i]||'';if(i&&i<4)q.bot='normal';else delete q.bot});save();eval(START0)},START);
  let seen=false;for(let i=0;i<80;i++){await W(200);if(await p.evaluate(()=>!!document.querySelector('.turnban'))){seen=true;break}}
  ok('"Your turn" banner appears on my turn',seen);
  await W(3800);ok('banner goes away after a few seconds',await p.evaluate(()=>!document.querySelector('.turnban')));
  // Host waiting card while the link code is made
  await p.evaluate(()=>{window.FTLINK={host:x=>new Promise(r=>setTimeout(()=>r('123456'),2000)),dev:()=>'d1',seat:async()=>{},beat(){},push(){},reveal(){}};lkHostStart('hearts')});
  await W(600);ok('host sees "Making your link code" while waiting',await p.evaluate(()=>!!document.querySelector('.lkmaking')));
  await W(2600);ok('the card goes away once the code is ready',await p.evaluate(()=>!document.querySelector('.lkmaking')&&S.lk&&S.lk.code==='123456'));
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
