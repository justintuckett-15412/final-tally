// Opening a game must not replay the last reaction saved with it; a new reaction still pops up.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  await page.evaluate(()=>{SET.toursOff=true;switchGame('rage');resetScores();RGX().play=true;S.players.forEach((q,i)=>{q.on=i<3;q.name=['Me','Bot A','Bot B'][i]||'';if(i)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();const me=act()[0].id;S.react={[me]:{e:'😂',k:3,t:Date.now()-60000}};save();switchGame('hearts')});
  await W(5000);
  await page.evaluate(()=>{switchGame('rage');render()});await W(400);
  let n=await page.evaluate(()=>document.querySelectorAll('#rxfx .rxpop').length);ok('opening Rage does not replay the saved laughing emoji',n===0,n);
  await page.evaluate(()=>{const me=act()[0].id,cur=S.react[me];S.react={...S.react,[me]:{e:'🎉',k:cur.k+1,t:Date.now()}};render()});await W(300);
  n=await page.evaluate(()=>document.querySelectorAll('#rxfx .rxpop').length);ok('a new reaction still pops up',n===1,n);
  ok('no page errors',!errs.length,errs);await done(b)})();
