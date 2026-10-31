// Quacks: Charity gives its ruby when the card comes up; the scoring card shows a ruby; round 9 ends with a big card.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  const setup=()=>page.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=false;X.bk=qkSetBooks(1);S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();return act().map(p=>p.id)});
  let [me]=await setup();
  let r=await page.evaluate(()=>{const g=S.qpg;g.phase='card';const before=act().map(p=>qpRubies(p,g.r-1));qpSetCard(g,'charity');return {before,after:act().map(p=>qpRubies(p,g.r-1))}});
  ok('Charity: the fewest-rubies ruby comes right when the card is revealed',r.after.every((v,i)=>v===r.before[i]+1),r);
  r=await page.evaluate(()=>{const g=S.qpg;g.ps.forEach(id=>{g.pl[id].sf=true;g.pl[id].stop=true});qpEval(g);const q=g.scoreQ.find(x=>x[0]==='Rubies and points');return {ruby:/qprb/.test(q[2]),noDouble:act().map(p=>qpRubies(p,g.r))}});
  ok('the “Rubies and points” scoring card shows a ruby, not a star',r.ruby,r);
  r=await page.evaluate(()=>{const g=S.qpg;g.r=8;S.hr=8;g.ps.forEach(id=>{g.pl[id].done=true});qpFinish(g);render();const c=document.querySelector('#qpl-h');return {phase:g.phase,card:!!c,txt:c&&c.closest('.sheet').textContent}});
  ok('round 9 ends with a big card that has to be tapped away',r.phase==='done'&&r.card,r);
  await page.screenshot({path:'/tmp/qend.png'});
  await page.evaluate(()=>document.querySelector('[data-a=qplastok]').click());await W(1500);console.log('DBG',await page.evaluate(()=>[...document.querySelectorAll('[data-a=finish]')].map(b=>b.textContent+'|'+!!b.offsetParent).join(';')+' toast:'+(document.querySelector('.toast')||{}).textContent));
  r=await page.evaluate(()=>({card:!!document.querySelector('#qpl-h'),fin:!!S.finished||S.screen!=='score'||!!document.querySelector('.sheet-bg'),scr:S.screen}));
  ok('tapping it goes on to see who won',!r.card&&r.fin,r);
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
