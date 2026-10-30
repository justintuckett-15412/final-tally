// Announcement cards stay put through redraws on linked phones.
const {mk,st,pages,chromium,W,click,ok,done,BASE}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'ah'),G=await mk(browser,'ag');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{switchGame('uno');resetScores();UNX().play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Brad','Bot A','Bot B'][i]||'';if(i>1&&i<4)p.bot='normal';else delete p.bot});save();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);
  await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(1500);
  await H.evaluate(()=>{const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});
  let got=false;for(let i=0;i<60&&!got;i++){await W(100);got=await G.evaluate(()=>{const e=document.querySelector('.glann');if(e){window.__ann=e;return e.innerText.slice(0,40)}return false})}
  ok('guest shows announcement',!!got,got);
  for(let i=0;i<6;i++){await G.evaluate(()=>render());await W(100)}
  ok('announcement survives redraws',await G.evaluate(()=>!!window.__ann&&window.__ann.isConnected&&document.querySelectorAll('.glann').length===1));
  await W(4000);ok('announcement gone after',await G.evaluate(()=>!window.__ann.isConnected));
  await G.evaluate(()=>{S.screen='home';render()});ok('no stray card on home',await G.evaluate(()=>!document.querySelector('.glann')));
  ok('no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
