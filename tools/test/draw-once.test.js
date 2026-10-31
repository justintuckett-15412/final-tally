// Linked Quacks: tapping Draw again and again while the host is slow draws only one chip at a time.
// (setup copied from snappy): a guest's own (non-chance) move shows on its screen right away, before the host answers,
// and the host's answer agrees. Chance moves (drawing a chip) still wait for the host.
const {mk,W,ok,done,chromium}=require('./link.js');
const btns=p=>p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))]);
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.offsetParent);if(b){b.click();return true}return false},[a,k]);
const until=async(p,fn,ms=8000,arg=null)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return Date.now()-t;await W(20)}return -1};
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');
  const ids=await H.evaluate(()=>{switchGame('quacks');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});QKX().play=1;save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
  const ready=async p=>{for(let t=0;t<30;t++){const b=await btns(p);if(b.includes('qpseen:sf'))return tap(p,'qpseen','sf');if(b.includes('qplm'))await tap(p,'qplm');const fc=b.find(x=>x.startsWith('qpfc:'));if(fc)await tap(p,'qpfc',fc.split(':')[1]);await W(300)}return false};
  await ready(G);await ready(H);await W(1500);await H.evaluate(()=>{S.qpg.ps.forEach(i=>S.qpg.pl[i].sf=true);save();render()});await W(2500);
  const n0=await G.evaluate(id=>S.qpg.pl[id].pot.length,ids[1]);
  for(let k=0;k<6;k++){await G.evaluate(()=>{const b=document.querySelector('[data-a=qpdraw]');if(b)b.click()});await W(40)}
  ok('only one draw is queued',await G.evaluate(id=>((S.lkq||{})[id]||[]).filter(e=>e.f==='qpDraw'&&e.id>((S.lkqa||{})[id]||0)).length<=1,ids[1]));
  ok('the button shows Drawing… meanwhile',await G.evaluate(()=>{const b=document.querySelector('[data-a=qpdraw]');return !b||b.disabled}));
  await W(4000);
  const n1=await G.evaluate(id=>S.qpg.pl[id].pot.length,ids[1]);
  ok('exactly one chip went in',n1===n0+1,{n0,n1});
  ok('Draw works again after',await G.evaluate(()=>{const b=document.querySelector('[data-a=qpdraw]');return !!b&&!b.disabled}));
  await done(browser)})();
