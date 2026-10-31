// Hand and Foot: after picking up the pile, the picked-up card must be melded before other melds,
// so a player can't strand themselves (no discard, no way to put the pile back).
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:412,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(900);
  await p.evaluate(()=>{SET.toursOff=true;switchGame('hf');resetScores();HX().play=1;S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i===1)q.bot='normal';else delete q.bot});save();const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});await W(1500);
  const r=await p.evaluate(()=>{const g=S.hpg,me=act()[0].id,side=hpSide(g,me);g.turn=me;g.drew=1;g.down[side]=1;g.h[me]=['8D#9001','8C#9002','8S#9003','5H#9004','5D#9005','5S#9006','KH#9007','QH#9008'];g.need='8D#9001';g.took=['8D#9001'];
    const other=hpPlay(g,me,[['5H#9004','5D#9005','5S#9006']],[]),still=g.h[me].length,withNeed=hpPlay(g,me,[['8D#9001','8C#9002','8S#9003']],[]),after=hpPlay(g,me,[['5H#9004','5D#9005','5S#9006']],[]);return {other,still,withNeed,need:g.need,after}});
  ok('a meld without the picked-up card is refused',r.other===false&&r.still===8,r);
  ok('melding the picked-up card works and clears the requirement',r.withNeed===true&&!r.need,r);
  ok('after that, other melds are fine',r.after===true,r);
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
