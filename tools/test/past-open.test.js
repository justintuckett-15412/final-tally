// "Earlier hands": every earlier hand starts collapsed; one you open stays open while you look.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  await page.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('rage');resetScores();const X=RGX();X.play=true;X.start=4;X.order='down';X.fore=false;S.players.forEach((q,i)=>{q.on=i<3;q.name=['A','B','C'][i]||'';if(i<3)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});
  const atRound=async n=>{for(let i=0;i<300;i++){const r=await page.evaluate(()=>{const g=S.rgg;if(g&&g.phase==='done'&&!S.finished){const b=document.querySelector('[data-a=rgdeal]');if(b)b.click()}return g?g.r:-1});if(r>=n)return;await W(200)}};
  await atRound(1);await W(600);
  let o=await page.evaluate(()=>[...document.querySelectorAll('.glpast')].map(d=>d.open));
  await atRound(3);await W(1500);
  o=await page.evaluate(()=>[...document.querySelectorAll('.glpast')].map(d=>+d.dataset.i+':'+d.open));
  ok('in round 4, every earlier round starts collapsed',o.length===3&&o.every(x=>x.endsWith('false')),o);
  await page.evaluate(()=>{const d=[...document.querySelectorAll('.glpast')].find(d=>d.dataset.i==='0');d.open=true});await W(400);await page.evaluate(()=>render());await W(300);
  o=await page.evaluate(()=>[...document.querySelectorAll('.glpast')].map(d=>+d.dataset.i+':'+d.open));
  ok('an older round you open stays open while you look',o.includes('0:true'),o);
  ok('no page errors',!errs.length,errs);await done(b)})();
