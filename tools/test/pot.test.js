// Quacks pot: extra bonus-die rolls move the droplet; the overflow bowl; droplet and rat tails marked clearly.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1500);
  await page.evaluate(()=>{window.__htfast=1;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=false;X.ovf=true;const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Me','Bot'][i]||'';if(i)p.bot='normal';else delete p.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});
  for(let i=0;i<60;i++){if(await page.evaluate(()=>{const g=S.qpg;if(g&&g.phase==='card'){qpSetCard(g,'');save();render()}if(g&&g.phase==='brew'){(S.qkfc=S.qkfc||[])[g.r]=null;g.ps.forEach(id=>g.pl[id].sf=true);g.brewAnn=null;return true}return false}))break;await W(100)}
  // overflow bowl
  let r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.pot=[{c:'g1#1',at:QKSPOON-1}];L.ws=0;L.lim=7;qpPlace(g,id,'r2#2');qpPlace(g,id,'u4#3');const a={ovf:L.ovf.slice(),stop:L.stop,potLen:L.pot.length};render();a.bowl=!!document.querySelector('.qpbowl .qpbowlc');
    L.ws=6;qpPlace(g,id,'w2#4');a.ex=L.ex;return a});
  ok('full pot: chips go into the overflow bowl',r.ovf.length===2&&r.potLen===1&&!r.stop,r);ok('the bowl shows under your pot',r.bowl,r);ok('a white in the bowl still counts toward exploding',r.ex,r);
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.ex=false;L.ws=1;L.ovf=['r2#2','u4#3','g1#5'];qpStop(g,id);return true});
  for(let i=0;i<60;i++){if(await page.evaluate(()=>S.qpg.phase==='eval'))break;await W(150)}
  r=await page.evaluate(()=>{const p=act()[0],R=qkR(p,0),x=qkParts(p,0);return {s:R.s,spoon:QKSPOON,ov:R.ov,ovPts:x.ov}});
  ok('scoring: half the bowl total is points (7 → 3)',r.s===r.spoon&&r.ov===7&&r.ovPts===3,r);
  // extra bonus-die rolls move the droplet
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,L=g.pl[id],R=qkR(p,0);(S.qkfc=S.qkfc||[])[0]='rolldie';R.dies=['drop','vp1','vp1'];R.die=null;const d0=L.drop,rolls=qkB(p,0).rolls;qpFinish(g);return {moved:L.drop-d0,rolls}});
  ok('an extra bonus-die roll of "droplet" moves the droplet',r.rolls>=1&&r.moved>=1,r);
  // droplet and rat tails stand out
  for(let i=0;i<60;i++){if(await page.evaluate(()=>S.qpg.phase==='brew'))break;await W(150)}
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.sf=true;L.rat=2;L.start=L.drop+2;render();return {drop:!!document.querySelector('.qpme .qpcell.drop'),rat:!!document.querySelector('.qpme .qpcell.rat'),label:!!document.querySelector('.qpme .qpdrop')&&!!document.querySelector('.qpme .qprat')}});
  ok('droplet and rat tails are marked on your pot and spelled out',r.drop&&r.rat&&r.label,r);
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
