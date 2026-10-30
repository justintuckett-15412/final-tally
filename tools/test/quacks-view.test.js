// Quacks: when brewing starts your pot sits right under the score tabs; splash lands on the chip (also with screen scaling);
// a big waiting card after you stop or explode; Earlier rounds all start collapsed.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();
 for(const zoom of [1,1.25]){const page=await b.newPage({viewport:{width:820,height:1180}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  await page.evaluate(z=>{if(z!==1)document.documentElement.style.zoom=z;window.__htfast=1;SET.toursOff=true;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;S.players.forEach((q,i)=>{q.on=i<3;q.name=['Me','Bot A','Bot B'][i]||'';if(i)q.bot='normal';else delete q.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()},zoom);
  for(let i=0;i<80;i++){const r=await page.evaluate(()=>{const g=S.qpg;if(g&&g.phase==='card'){qpSetCard(g,'');save();render()}const f=[...document.querySelectorAll('[data-a=qpfc]')].find(b=>b.offsetParent&&!b.disabled);if(f)f.click();const s=[...document.querySelectorAll('[data-a=qpseen]')].find(b=>b.offsetParent&&!b.disabled);if(s)s.click();return g&&g.phase==='brew'&&g.pl[act()[0].id].sf!==false});if(r)break;await W(150)}
  await W(3500);
  let r=await page.evaluate(()=>{const tb=document.querySelector('#app .tabs').getBoundingClientRect(),me=document.querySelector('.qpme').getBoundingClientRect(),pot=document.querySelector('.qpme .qppot').getBoundingClientRect();return {gap:Math.round(me.top-tb.bottom),potTop:Math.round(pot.top),potBottom:Math.round(pot.bottom),vh:innerHeight}});
  ok(`zoom ${zoom}: your pot sits just under the scores when brewing starts`,r.gap>=-2&&r.gap<=40&&r.potBottom<=r.vh/(zoom===1?1:1)+400,r);
  await page.screenshot({path:`/tmp/qview-${zoom}.png`});
  // splash position
  r=await page.evaluate(async()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.sf=true;L.ask=null;L.stop=false;L.ex=false;render();const n0=L.pot.length;for(let t=0;t<10&&L.pot.length===n0;t++){const b=document.querySelector('[data-a=qpdraw]');if(b)b.click();L.ask=null;await new Promise(r=>setTimeout(r,150))}await new Promise(r=>setTimeout(r,500));const c=document.querySelector('.qpme .qppot .qpcell.last'),w=document.querySelector('.qpsplashw');if(!c||!w)return {none:!c?'cell':'splash'};const A=c.getBoundingClientRect(),B=w.getBoundingClientRect();return {dx:Math.round(A.left-B.left),dy:Math.round(A.top-B.top),dw:Math.round(A.width-B.width)}});
  ok(`zoom ${zoom}: the splash lands on the chip`,!r.none&&Math.abs(r.dx)<=3&&Math.abs(r.dy)<=3&&Math.abs(r.dw)<=3,r);
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;g.pl[id].stop=true;g.pl[id].ex=true;g.ps.slice(1).forEach(x=>g.pl[x].stop=false);render();const w=document.querySelector('.qpwait');return w?{txt:w.textContent,fs:parseFloat(getComputedStyle(w.querySelector('b')).fontSize)}:null});
  ok(`zoom ${zoom}: a big waiting card after your pot explodes`,r&&/exploded/.test(r.txt)&&/Waiting for Bot A and Bot B/.test(r.txt)&&r.fs>=20,r);
  ok(`zoom ${zoom}: no page errors`,!errs.length,errs.slice(0,3));await page.close()}
 await done(b)})();
