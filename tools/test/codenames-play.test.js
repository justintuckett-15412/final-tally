// Codenames on one device (no linking) and "Record a game".
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'one');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const c=(a,k)=>P.evaluate(([a,k])=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()},[a,k]);
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true});
  await c('cnstart','1');await W(300);
  const setup=await P.evaluate(()=>{const t=document.body.innerText;return /Words/i.test(t)&&!!document.querySelector('[data-a="cnwords"][data-k="kid"]')&&!!document.querySelector('#cnown')});
  ok('Setup: Standard / Kids word lists and a box for family words',setup,setup);
  await c('cnwords','kid');await P.evaluate(()=>{const t=document.getElementById('cnown');t.value='Grandma, Lake Powell';t.dispatchEvent(new Event('input',{bubbles:true}))});
  const kept=await P.evaluate(()=>CNX().words==='kid'&&/Grandma/.test(CNX().own)&&!!document.querySelector('[data-a="ureset"]'));
  ok('Setup choices are kept, with Back to our usual rules',kept,kept);
  await c('cnwords','std');await P.evaluate(()=>{CNX().own='';cnKeep()});
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Bob','Cy','Di'][i]||'';delete p.bot});save()});await c('start');await W(800);
  const t0=await P.evaluate(()=>({ph:S.cng&&S.cng.phase,solo:S.cng&&S.cng.solo,n:S.cng&&S.cng.words.length}));
  ok('One device: a 25-word board and the team screen',t0.ph==='teams'&&t0.solo&&t0.n===25,t0);
  await P.evaluate(()=>document.querySelector('[data-a="cnubegin"]').click());await W(300);
  const k0=await P.evaluate(()=>document.querySelectorAll('.cngrid .cnt.key').length);
  await P.evaluate(()=>document.querySelector('[data-a="cnupeek"]').click());await W(200);
  const k1=await P.evaluate(()=>document.querySelectorAll('.cngrid .cnt.key').length);
  await P.evaluate(()=>document.querySelector('[data-a="cnupeek"]').click());await W(200);
  ok('One device: the key is hidden until a spymaster taps Show the key',k0===0&&k1===25,{k0,k1});
  await P.evaluate(()=>{const i=document.getElementById('cnclue');i.value='HOLIDAY';document.querySelector('[data-a="cnunum"][data-k="-1"]').click()});await W(200);
  await P.evaluate(()=>document.querySelector('button[form="cnclueform"]').click());await W(300);
  const c1=await P.evaluate(()=>S.cng.phase==='guess'&&S.cng.clue.w==='HOLIDAY'&&S.cng.clue.n===-1&&/∞/.test(document.querySelector('.cnclue').innerText));
  ok('One device: the clue form works, including ∞',c1,c1);
  let n=0;while(n++<80){const ph=await P.evaluate(()=>S.cng.phase);if(ph==='done')break;
    if(ph==='clue'){await P.evaluate(n=>{const i=document.getElementById('cnclue');i.value='qz'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},n);await W(150);continue}
    await P.evaluate(()=>{const g=S.cng,i=g.key.findIndex((c,i)=>!g.rev[i]&&c===g.turn);document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i<0?g.rev.findIndex(r=>!r):i}"]`).click()});await W(150);
    await P.evaluate(()=>{const b=document.querySelector('.cnpick [data-a="cnupick"]');if(b)b.click()});await W(150)}
  const fin=await P.evaluate(()=>S.cng.phase==='done'&&!!document.querySelector('.cndone'));
  ok('One device: tap a word, confirm Reveal, and play to a winner',fin,fin);
  await P.evaluate(()=>document.querySelector('.cndone [data-a="finish"]').click());await W(800);
  const res=await P.evaluate(()=>({scr:S.screen,ps:act().map(p=>p.cn)}));
  ok('Results after a one-device game',['results','reveal'].includes(res.scr)&&res.ps.every(x=>x&&x.tm),res);
  /* best of 3 on one device */
  await c('cnstart','1');await c('cnmatch','3');await W(200);
  const mh=await P.evaluate(()=>/first team to win 2 games/i.test(document.body.innerText)&&!!document.querySelector('[data-a="ureset"]'));
  ok('Match setting: Best of 3 explained, with Back to our usual rules',mh,mh);
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Bob','Cy','Di'][i]||'';delete p.bot});save()});await c('start');await W(800);
  let games=0,guard=0;while(guard++<400){const st=await P.evaluate(()=>({ph:S.cng.phase,over:S.cng.match.over,no:S.cng.match.no}));if(st.over)break;
    if(st.ph==='teams'){await P.evaluate(()=>document.querySelector('[data-a="cnubegin"]').click());await W(120);continue}
    if(st.ph==='done'){games++;await P.evaluate(()=>document.querySelector('[data-a="cnunext"]').click());await W(150);continue}
    if(st.ph==='clue'){await P.evaluate(n=>{const i=document.getElementById('cnclue');i.value='qz'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},guard);await W(120);continue}
    await P.evaluate(()=>{const g=S.cng,i=g.key.findIndex((c,i)=>!g.rev[i]&&c===g.turn);document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click()});await W(80);
    await P.evaluate(()=>{const b=document.querySelector('.cnpick [data-a="cnupick"]');if(b)b.click()});await W(80)}
  const bo=await P.evaluate(()=>{const M=S.cng.match;return {w:M.wins,over:M.over,txt:document.querySelector('.cndone').innerText}});
  ok('Best of 3: Next game deals a new board until a team wins 2 games',bo.over&&Math.max(bo.w.r,bo.w.b)===2&&/wins the match 2/.test(bo.txt),bo);
  await P.evaluate(()=>document.querySelector('.cndone [data-a="finish"]').click());await W(800);
  const br=await P.evaluate(()=>({t:cnResults(),ps:act().map(p=>p.cn)}));
  ok('Best of 3 results: match score and who won',/wins the match/.test(br.t||'')&&br.ps.some(x=>x.win),br);
  await c('cnmatch','1');
  /* record a real game */

  await c('cnstart','0');await W(300);await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Bob','Cy','Di'][i]||''});save()});await c('start');await W(500);
  const rec=await P.evaluate(()=>!!document.querySelector('[data-a="cnrecwin"]')&&document.querySelectorAll('[data-a="cnrectm"]').length===8);
  ok('Record a game: winner and a team for each player',rec,rec);
  await c('cnrecwin','b');await c('cnrectm','0:r');await c('cnrectm','1:b');await c('cnrectm','2:r');await c('cnrectm','3:b');await c('cnrecspy','1');
  const rw=await P.evaluate(()=>act().map(p=>p.cn.win).join(''));
  ok('Record a game: Blue’s players are marked as winners',rw==='0101',rw);
  ok('No page errors',!errs.length,errs.slice(0,4));
  await done(browser)})();
