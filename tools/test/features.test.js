// Scan to join, back to linked phones, dropped-phone warnings and host takeover.
const {mk,st,pages,chromium,W,click,ok,done,BASE}=require('./link.js');
(async()=>{const browser=await chromium.launch();
  const H=await mk(browser,'fh'),B=await mk(browser,'fb');
  await click(H,'lkui','linkup');await H.fill('#lu-name','Justin');await click(H,'lustart','net');await W(4000);
  const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(()=>{document.querySelectorAll('[data-a=tourskip]').forEach(b=>b.click())});await W(1500);
  ok('lobby QR shown',await H.evaluate(()=>!!document.querySelector('.lkqr svg')));
  // join from a scanned link
  await B.goto(BASE+'#lk='+code);await B.reload();await W(1500);
  await B.evaluate(async()=>{const m=await import('./sync.js');window.FTLINK=window.FTLINK_NET=m.makeLink(window.__fakefb);lkHashJoin()});await W(4000);
  ok('scanned link joins',await B.evaluate(c=>S.lk&&S.lk.code===c&&S.screen==='lkwait',code),await B.evaluate(()=>S.screen));
  await B.fill('#lu-gname','Brad');await click(B,'luname');await W(3000);
  // scanner text parsing
  ok('code from link',await B.evaluate(()=>lkCodeOf('https://x/y/#lk=123456')==='123456'&&lkCodeOf('123 456')==='123456'&&lkCodeOf('hello')===''));
  // play a game then go back to linked phones
  await click(H,'qpstart','1');await W(5000);await click(B,'luinv','join');await W(4000);
  ok('brad in quacks',await B.evaluate(()=>S.game==='quacks'&&!!S.lk.me));
  await H.evaluate(()=>{const b=document.createElement('button');b.dataset.a='lulobby';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(6000);
  const hb=await H.evaluate(()=>({g:S.game,s:S.screen,p:act().map(p=>p.name),me:S.lk.me}));const bb=await B.evaluate(()=>({g:S.game,s:S.screen,me:S.lk.me&&(act().find(p=>p.id===S.lk.me)||{}).name}));
  ok('back to linked phones (host)',hb.g==='linkup'&&hb.s==='home'&&hb.p.join()==='Justin,Brad'&&!!hb.me,hb);
  ok('back to linked phones (guest)',bb.g==='linkup'&&bb.s==='lkwait'&&bb.me==='Brad',bb);
  // host drops: guest takes over
  await B.evaluate(()=>{LKSTALE=4000});await H.evaluate(()=>window.FTLINK.beat(null));await W(2500);
  ok('host connected at first',await B.evaluate(()=>!lkHostGone()));
  await H.context().close();await W(6000);await B.evaluate(()=>render());
  ok('take-over offered',await B.evaluate(()=>!!document.querySelector('[data-a=lktake]')));
  await click(B,'lktake');await click(B,'lktake');await W(3000);
  ok('guest is host now',await B.evaluate(()=>S.lk.role==='host'&&!localStorage.getItem('finaltally.v1.lkon')),await B.evaluate(()=>S.lk.role));
  ok('doc host changed',st.get(['games',code]).hostUid==='fb',st.get(['games',code]).hostUid);
  // a new phone can join the taken-over game and host sees it
  const C=await mk(browser,'fc');await click(C,'lkui','join');await C.fill('#lk-code',code);await click(C,'lkjoin');await W(4000);await C.fill('#lu-gname','Cam');await click(C,'luname');await W(4000);
  ok('new host sees Cam',await B.evaluate(()=>act().some(p=>p.name==='Cam')),await B.evaluate(()=>act().map(p=>p.name)));
  // guest drop shows on host
  await B.evaluate(()=>{LKSTALE=4000});await C.context().close();await W(6500);await B.evaluate(()=>render());
  ok('dropped guest marked',await B.evaluate(()=>/⚠️ Cam/.test(document.body.innerText)));
  await done(browser)})();
