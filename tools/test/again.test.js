// Home screen: a finished game offers "Play again" with the same players, straight into the game.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  for(const [g,xf] of [['quacks','QKX'],['uno','UNX']]){
    await page.evaluate(([g,xf])=>{SET.toursOff=true;switchGame(g);resetScores();eval(xf+'()').play=1;S.players.forEach((q,i)=>{q.on=i<3;q.name=['Mom','Gizmo','Pip'][i]||'';if(i)q.bot='hard';else delete q.bot});S.started=true;S.finished=true;save();S.screen='home';render()},[g,xf]);await W(400);
    let r=await page.evaluate(g=>{const b=document.querySelector(`[data-a=gagain][data-k="${g}"]`);return b?b.textContent:null},g);
    ok(`${g}: home shows Play again with the same players`,r&&/Mom, Gizmo, Pip/.test(r),r);
    await page.evaluate(g=>document.querySelector(`[data-a=gagain][data-k="${g}"]`).click(),g);await W(1500);
    r=await page.evaluate(()=>({game:S.game,started:S.started,finished:!!S.finished,screen:S.screen,players:act().map(p=>p.name+(p.bot?'(bot)':''))}));
    ok(`${g}: it starts right away with the same players and bots`,r.started&&!r.finished&&r.screen==='score'&&r.players.join()==='Mom,Gizmo(bot),Pip(bot)',r)}
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
