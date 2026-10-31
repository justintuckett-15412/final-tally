// Quacks: bag odds sheet, droplet slide and coins flying in, awards and the round chart.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  const me=await page.evaluate(()=>{SET.toursOff=true;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=false;X.bk=qkSetBooks(1);S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();const g=S.qpg;g.phase='card';qpSetCard(g,'');g.ps.forEach(id=>g.pl[id].sf=true);g.brewAnn=null;g.ann=null;render();return act()[0].id});
  await W(800);
  let r=await page.evaluate(me=>{const g=S.qpg,L=g.pl[me];L.bag=['w1#1','w1#2','w3#3','o1#4'];L.ws=5;L.lim=7;render();const b=document.querySelector('[data-a=qpbag]');if(!b)return {btn:false};b.click();const sh=document.querySelector('#qpbag-h');const txt=sh?sh.closest('.sheet').textContent:'';return {btn:true,sheet:!!sh,boom:/25% chance/.test(txt),rows:document.querySelectorAll('.qpbagrow').length}},me);
  ok('tapping the bag shows each chip and the odds (white 3 = 25% chance to explode)',r.btn&&r.sheet&&r.boom&&r.rows===3,r);
  await page.screenshot({path:'/tmp/qbag.png'});
  await page.evaluate(()=>{document.querySelector('[data-a=qpbagx]').click()});await W(300);
  r=await page.evaluate(async me=>{const g=S.qpg,L=g.pl[me];render();L.drop+=2;render();await new Promise(r=>setTimeout(r,60));return document.querySelectorAll('.qpfly.drop').length},me);
  ok('the droplet slides to its new space',r>=1,r);
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
