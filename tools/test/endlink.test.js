// End linking from the home screen.
const {mk,st,pages,chromium,W,click,ok,done,BASE}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'eh'),G=await mk(browser,'eg');
  await H.evaluate(()=>{switchGame('hearts');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['A','B','C'][i]||''});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(()=>lkPick(null));
  await G.evaluate(c=>lkJoin(c),code);await W(3000);
  await H.evaluate(()=>{S.screen='home';render();document.querySelectorAll('[data-a=tourskip]').forEach(b=>b.click())});await W(500);
  ok('end button on home',await H.evaluate(()=>!!document.querySelector('.lkhome [data-a=lkstop]')));
  await click(H,'lkstop');await click(H,'lkstop');await W(3000);
  ok('host unlinked',await H.evaluate(()=>!S.lk));ok('guest told',await G.evaluate(()=>!S.lk));
  await done(browser)})();
