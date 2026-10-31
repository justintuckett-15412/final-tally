// Linked Quacks: an explosion shows the boom on the exploding phone, and smoke on that player's card on every phone.
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
  await H.evaluate(id=>{const L=S.qpg.pl[id];L.ws=6;L.bag=['w3#1','w3#2'];save()},ids[1]);await W(2500);
  await G.evaluate(()=>{window.__boom=0;new MutationObserver(()=>{if(document.querySelector('.qpboom'))window.__boom=1}).observe(document.body,{childList:true,subtree:true})});
  await tap(G,'qpdraw');
  let boom=false;for(let t=0;t<80;t++){await W(100);if(await G.evaluate(()=>window.__boom)){boom=true;break}}
  ok('the exploding phone shows the boom',boom);
  const sm=await until(H,id=>{const L=S.qpg.pl[id];return L.ex&&document.querySelectorAll('.tab.smolder').length>0},8000,ids[1]);
  ok('the other phone shows smoke on that player card',sm>=0,{sm});
  ok('the exploding phone shows smoke on its own card',await G.evaluate(()=>document.querySelectorAll('.tab.smolder').length>0));
  await done(browser)})();
