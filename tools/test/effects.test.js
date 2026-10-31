// Rage! fire-and-shake and reactions stay smooth through redraws on linked phones.
const {mk,st,pages,chromium,W,click,ok,done,BASE,readyAll}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'rh'),G=await mk(browser,'rg');
  const ids=await H.evaluate(()=>{switchGame('rage');resetScores();RGX().play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Brad','Bot A','Bot B'][i]||'';if(i>1&&i<4)p.bot='normal';else delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);
  await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(3000);
  for(const p of [H,G])await p.evaluate(()=>document.querySelectorAll('[data-a=tourskip]').forEach(b=>b.click()));await readyAll([H,G]);
  ok('rage button on guest',await G.evaluate(()=>!!document.querySelector('[data-a=rgrage]')));
  await G.evaluate(()=>document.querySelector('[data-a=rgrage]').click());
  await W(300);ok('guest sees own fire',await G.evaluate(id=>!!document.getElementById('rgfx-'+id),ids[1]));
  let fx=null;for(let i=0;i<30&&!fx;i++){await W(100);fx=await H.evaluate(id=>{const e=document.getElementById('rgfx-'+id);if(e)window.__fx=e;return !!e},ids[1])}
  ok('host sees Brad raging',!!fx);
  for(let i=0;i<6;i++){await H.evaluate(()=>render());await W(150)}
  ok('effect survives redraws',await H.evaluate(id=>window.__fx===document.getElementById('rgfx-'+id)&&!!window.__fx.isConnected,ids[1]));
  ok('effect sits over Brad’s seat',await H.evaluate(id=>{const a=document.getElementById('rgfx-'+id).getBoundingClientRect(),b=document.querySelector(`.ktseat[data-rgs="${id}"]`).getBoundingClientRect();return Math.abs(a.left-b.left)<6&&Math.abs(a.top-b.top)<6},ids[1]));
  await W(3500);ok('effect gone after 3 s',await H.evaluate(()=>!document.querySelector('.rgfx')));
  await G.evaluate(()=>{const b=document.querySelector('[data-a=rxopen]');b&&b.click()});await W(200);
  ok('guest can send a reaction',await G.evaluate(()=>{const b=document.querySelector('[data-a=rxsend]');if(!b)return false;b.click();return true}));
  let rx=false;for(let i=0;i<30&&!rx;i++){await W(100);rx=await H.evaluate(()=>{const e=document.querySelector('#rxfx .rxpop');if(e)window.__rx=e;return !!e})}
  ok('host shows reaction',rx);
  for(let i=0;i<6;i++){await H.evaluate(()=>render());await W(120)}
  ok('reaction survives redraws',await H.evaluate(()=>!!window.__rx&&window.__rx.isConnected));
  await W(3200);ok('reaction gone after',await H.evaluate(()=>!document.querySelector('#rxfx .rxpop')));
  await done(browser)})();
