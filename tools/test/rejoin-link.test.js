// Rejoin: a guest phone that seems dropped out shows a Rejoin bar; Rejoin keeps its seat; after the link is lost,
// the home screen offers "Rejoin game … as <name>" and that puts the phone back in its seat.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];G.on('pageerror',e=>errs.push(e.message));
  for(const p of [H,G])await p.evaluate(()=>{SET.toursOff=true;document.getElementById('tour')?.remove()});
  const ids=await H.evaluate(()=>{switchGame('hearts');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);
  ok('no Rejoin bar while connected',await G.evaluate(()=>!document.querySelector('.lkdrop')));
  await G.evaluate(()=>{window.__q=window.FTLINK.quiet;window.FTLINK.quiet=()=>30e3;render()});
  ok('a quiet link shows the Rejoin bar',await G.evaluate(()=>!!document.querySelector('.lkdrop [data-a="lkrejoin"]')));
  await G.evaluate(()=>{window.FTLINK.quiet=window.__q});await G.click('.lkdrop [data-a="lkrejoin"]');await W(5000);
  ok('after Rejoin the phone keeps its seat',await G.evaluate(id=>!!S.lk&&S.lk.me===id,ids[1]));
  await G.evaluate(()=>render());ok('the Rejoin bar goes away',await G.evaluate(()=>!document.querySelector('.lkdrop')));
  await G.evaluate(()=>lkClear('Lost the link.'));await W(800);await G.evaluate(()=>{S.screen='home';render()});
  const btn=await G.evaluate(()=>document.querySelector('[data-a="lkrejoinlast"]')?.innerText||'');ok('home offers Rejoin game … as Brad',/Rejoin game/.test(btn)&&/Brad/.test(btn),btn);
  await G.click('[data-a="lkrejoinlast"]');await W(6000);
  ok('Rejoin from home puts the phone back in Brad’s seat',await G.evaluate(id=>!!S.lk&&S.lk.me===id,ids[1]));
  ok('no page errors',!errs.length,errs.slice(0,2).join(' | '));
  done(browser)})();
