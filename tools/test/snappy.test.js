// Snappier linked moves: a guest's own (non-chance) move shows on its screen right away, before the host answers,
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
  // clear the fortune cards, then let the guest draw twice (chance moves: wait for the host)
  for(let t=0;t<40;t++){for(const p of [H,G]){const b=await btns(p);const fc=b.find(x=>x.startsWith('qpfc:'));if(fc)await tap(p,'qpfc',fc.split(':')[1]);const m=b.find(x=>x.startsWith('qpseen'));if(m)await tap(p,'qpseen',m.split(':')[1])}
    if((await btns(G)).includes('qpdraw'))break;await W(300)}
  await W(1500);const pot0=await G.evaluate(id=>S.qpg.pl[id].pot.length,ids[1]);
  await tap(G,'qpdraw');await W(60);
  ok('a chip draw is not shown before the host answers',await G.evaluate(([id,n])=>{const L=S.qpg.pl[id];return L.pot.length===n},[ids[1],pot0]));
  await until(G,([id,n])=>S.qpg.pl[id].pot.length>n,8000,[ids[1],pot0]);await W(2500);
  // Stop: no chance involved, so the guest's screen should show it at once
  for(let t=0;t<10;t++){const b=await btns(G);const an=b.find(x=>x.startsWith('qpans'));if(!an)break;await tap(G,'qpans',an.split(':')[1]);await W(800)}
  await tap(G,'qpstop');
  const seen=await until(G,()=>/You stopped|Your pot exploded/.test(document.body.innerText),8000);
  const conf=await until(G,id=>S.qpg.pl[id].stop,8000,ids[1]);
  ok('Stop shows on the guest right away (under 300 ms)',seen>=0&&seen<300,{seen});
  ok('the host confirms the Stop',await until(H,()=>true)>=0&&await H.evaluate(id=>S.qpg.pl[id].stop,ids[1]));
  // host's own player stops; wait for scoring
  for(let t=0;t<40;t++){await tap(H,'qpstop');const b=await btns(H);const m=b.find(x=>x.startsWith('qpseen'));if(m)await tap(H,'qpseen',m.split(':')[1]);if(await H.evaluate(()=>S.qpg.phase==='eval'))break;await W(300)}
  for(let t=0;t<80;t++){const b=await btns(G);const m=b.find(x=>x.startsWith('qpseen'));if(m){await tap(G,'qpseen',m.split(':')[1]);await W(300);continue}if(b.some(x=>x.startsWith('qpbuy:')))break;await W(300)}
  const bb=(await btns(G)).filter(x=>x.startsWith('qpbuy:'));
  if(bb.length){const c=bb[0].split(':')[1];await tap(G,'qpbuy',c);const t=await until(G,c=>!!document.querySelector(`[data-a="qpunbuy"][data-k="${c}"]`),8000,c);
    ok('buying a chip shows on the guest right away (under 300 ms)',t>=0&&t<300,{t});await W(3500);
    ok('the host has the same purchase',await H.evaluate(([id,c])=>S.qpg.pl[id].buy.includes(c),[ids[1],c]))}
  ok('guest reached the shop',(await btns(G)).includes('qpdone'));
  await tap(G,'qpdone');await W(30);await tap(G,'qpdone','sure');
  const td=await until(G,()=>/Waiting for the others/.test(document.body.innerText),8000);
  ok('Done shows on the guest right away (under 400 ms)',td>=0&&td<400,{td});
  await W(3500);ok('the host has the guest done (or the round moved on)',await H.evaluate(id=>S.qpg.r>0||S.qpg.pl[id].done,ids[1]));
  await done(browser)})();
