// Linked game: a guest phone whose connection stalls (e.g. Android paused it) recovers on its own:
// when it comes back to the screen, or after a few seconds of an unconfirmed move, it reconnects and re-sends.
const {mk,chromium,W,ok,done}=require('./link.js');
const btns=p=>p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))]);
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'wh'),G=await mk(browser,'wg');const errs=[];[H,G].forEach((p,i)=>p.on('pageerror',e=>errs.push(i+': '+e.message)));
  const ids=await H.evaluate(()=>{SET.toursOff=true;switchGame('quacks');resetScores();QKX().play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Brad'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
  const clear=async p=>{for(let t=0;t<40;t++){const b=await btns(p);if(b.includes('qplm'))await p.evaluate(()=>{const e=document.querySelector('[data-a=qplm]');e&&e.click()});const fc=b.find(x=>x.startsWith('qpfc:'));if(fc)await p.evaluate(k=>{const e=document.querySelector(`[data-a=qpfc][data-k="${k}"]`);e&&e.click()},fc.split(':')[1]);if(b.some(x=>x.startsWith('qpseen')))await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-a=qpseen]')].find(b=>b.offsetParent&&!b.disabled);e&&e.click()});if(b.includes('qpstop'))return true;await W(300)}return false};
  ok('both phones brewing',(await Promise.all([clear(H),clear(G)])).every(Boolean));
  await G.evaluate(()=>{window.__gq=[];const f=window.FTLINK.push.bind(window.FTLINK);window.FTLINK.push=u=>{const m=(u.mops||[]).map(([p])=>p.join('.')).filter(x=>!x.startsWith('lkq'));if(m.length)window.__gq.push((Date.now()%100000)+' '+m.join(',').slice(0,200));return f(u)}});
  await H.evaluate(()=>{window.__hl=[];const me=S.lk.me;const o=window.lkRecv;window.lkRecv=u=>{const a=S.qpg&&S.qpg.pl[me].stop;o(u);const b=S.qpg&&S.qpg.pl[me].stop;if(a&&!b)window.__hl.push('recv flipped: keys='+Object.keys(u).join(',')+' mflatQpg='+(u.mflat&&u.mflat.qpg?JSON.parse(u.mflat.qpg).pl[me].stop:'none'))};const r0=window.render;setInterval(()=>{const L=S.qpg&&S.qpg.pl[me];if(L&&window.__was&&!L.stop)window.__hl.push('flipped outside recv at '+(Date.now()%100000));window.__was=L&&L.stop},50)});
  // stall the guest's connection: nothing in, nothing out, until it reconnects
  const stall=()=>G.evaluate(()=>{window.__stall=1;window.__refreshed=0;if(!window.__wrapped){window.__wrapped=1;const r=window.lkRecv;window.lkRecv=u=>{if(!window.__stall)r(u)};const p=window.FTLINK.push.bind(window.FTLINK);window.FTLINK.push=u=>{if(!window.__stall)return p(u)};const f=window.FTLINK.refresh.bind(window.FTLINK);window.FTLINK.refresh=()=>{window.__stall=0;window.__refreshed++;return f()}}});
  for(let t=0;t<30;t++){if(await H.evaluate(()=>{const L=S.qpg.pl[S.lk.me];if(L.stop)return true;L.sf=true;qpStop(S.qpg,S.lk.me);save();render();return false}))break;await W(300)}await W(2500);
  await stall();

  await G.evaluate(()=>{const b=document.querySelector('[data-a=qpstop]');b.click()});await W(2500);
  ok('while stalled the host has not heard the guest stop',await H.evaluate(id=>!S.qpg.pl[id].stop,ids[1]));
  // the phone comes back to the screen
  await G.evaluate(()=>{Object.defineProperty(document,'visibilityState',{value:'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
  let t0=Date.now(),got=false;while(Date.now()-t0<10000){if(await H.evaluate(id=>S.qpg.pl[id].stop||S.qpg.phase!=='brew',ids[1])){got=true;break}await W(200)}
  if(!got)console.log('DBG',JSON.stringify(await G.evaluate(()=>({pend:lkPending().length,q:JSON.stringify((S.lkq||{})[S.lk.me]),qa:(S.lkqa||{})[S.lk.me],stop:S.qpg.pl[S.lk.me].stop,lastq:LKLAST.m['lkq'+LKSEP+S.lk.me]}))),JSON.stringify(await H.evaluate(id=>({q:JSON.stringify((S.lkq||{})[id]),qa:(S.lkqa||{})[id]}),ids[1])));
  ok('coming back to the screen reconnects and the host gets the stop',got,{ms:Date.now()-t0,refreshed:await G.evaluate(()=>window.__refreshed)});
  t0=Date.now();got=false;while(Date.now()-t0<15000){if(await G.evaluate(()=>(S.lkqa||{})[S.lk.me]>=((S.lkq||{})[S.lk.me]||[]).reduce((a,e)=>Math.max(a,e.id),0)&&!lkPending().length)){got=true;break}await W(200)}
  ok('and the guest sees the host confirm its move',got);
  // second case: no wake-up event, just a stalled connection with a move waiting
  for(let i=0;i<40&&!(await G.evaluate(()=>!!document.querySelector('[data-a=qpseen][data-k=all]')));i++)await W(300);
  await stall();
  await G.evaluate(()=>{const e=document.querySelector('[data-a=qpseen][data-k=all]');e&&e.click()});
  t0=Date.now();got=false;while(Date.now()-t0<25000){if(await H.evaluate(id=>S.qpg.pl[id].sr!==false,ids[1])){got=true;break}await W(300)}
  ok('an unconfirmed move gets re-sent on its own within seconds',got,{ms:Date.now()-t0,refreshed:await G.evaluate(()=>window.__refreshed)});
  ok('no page errors',!errs.length,errs.slice(0,3));await done(browser)})();
