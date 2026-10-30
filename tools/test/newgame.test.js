// A new game starts with no remembered players (names and computer players cleared). One phone, no linking.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(BASE);await W(1500);
  const press=(a,k,g)=>p.evaluate(([a,k,g])=>{const x=document.createElement('button');x.dataset.a=a;if(k!=null)x.dataset.k=k;if(g)x.dataset.g=g;x.hidden=true;document.body.appendChild(x);x.click();x.remove()},[a,k,g]);
  const seed=g=>p.evaluate(g=>{switchGame(g);const P=S.players;P[0].name='Justin';P[1].name='Dice Bot';P[1].bot='normal';P[1].on=true;S.started=true;S.finished=true;save()},g);
  for(const [g,a,k,gg] of [['quacks','qpstart','1'],['hearts','htstart','1'],['golf','gpstart','1','golf'],['hf','hfstart','0','hf'],['ttr','gnew','ttr'],['carc','gnew','carc'],['uno','unstart','1'],['yahtzee','yzstart','1']]){
    await seed(g);await press(a,k,gg);const r=await p.evaluate(()=>({names:S.players.map(q=>q.name).filter(Boolean),bots:S.players.filter(q=>q.bot).length,scr:S.screen}));
    ok(g+': new game starts with no remembered players',!r.names.length&&!r.bots&&r.scr==='map',r)}
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
