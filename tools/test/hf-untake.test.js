// Canasta / Hand and Foot: taking a pile with a red 3 in it can still be put back.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  const r=await page.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('canasta');resetScores();HX().play=1;HX().r3play=true;const P=S.players;P.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();
    const g=S.hpg,me=act()[0].id,side=hpSide(g,me);g.turn=me;g.drew=0;g.need=null;g.down[side]=true;g.frozen=false;
    g.h[me]=['9S#900','9D#901','4C#902','5C#903'];g.disc=['3H#904','9C#905'];g.melds[side]=[];
    const r30=(g.r3[side]||[]).length;const before=JSON.stringify({h:g.h[me].slice().sort(),d:g.disc});const took=hpTake(g,me);const r3=(g.r3[side]||[]).slice();const back=hpUntake(g,me);
    return {took,r3,back,same:JSON.stringify({h:g.h[me].slice().sort(),d:g.disc})===before,r3after:(g.r3[side]||[]).length-r30}});
  ok('took a pile with a red 3 (the red 3 laid down)',r.took&&r.r3.includes('3H#904'),r);
  ok('and can still put it back, red 3 included',r.back&&r.same&&r.r3after===0,r);
  ok('no page errors',!errs.length,errs);await done(b)})();
