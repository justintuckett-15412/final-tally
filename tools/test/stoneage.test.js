// Stone Age tracker: live sheet (buildings, agriculture, tools, people, hunger), final scoring math, tiebreaker,
// the sample game, and the results screen.
const {mk,W,ok,done,chromium}=require('./link.js');
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.offsetParent);if(b){b.click();return true}return false},[a,k]);
const tapStep=(p,k,d)=>p.evaluate(([k,d])=>{const b=document.querySelector(`[data-a="sastep"][data-k="${k}"][data-d="${d}"]`);if(b&&!b.disabled){b.click();return true}return false},[k,d]);
const typeIn=async(p,sel,v)=>{await p.focus(sel);await p.fill(sel,String(v));await p.dispatchEvent(sel,'input')};
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');
  const errs=[];P.on('pageerror',e=>errs.push(e.message));
  ok('Stone Age: Play and Score buttons on the home screen',await P.evaluate(()=>!!document.querySelector('[data-a="sastart"][data-k="0"]')&&!!document.querySelector('[data-a="sastart"][data-k="1"]')));
  await P.evaluate(()=>document.querySelector('[data-a="sastart"][data-k="0"]').click());await W(500);
  ok('Stone Age: setup screen',await P.evaluate(()=>S.game==='stoneage'&&document.body.textContent.includes('Hungry tribe')));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Kim'][i]||''});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(400);
  ok('Stone Age: score screen, during the game',await P.evaluate(()=>S.screen==='score'&&S.hr===0&&!!document.querySelector('[data-a="sahand"][aria-pressed="true"]')));
  // building from resource buttons: wood + wood + clay = 10
  await tap(P,'sares','0:3');await tap(P,'sares','0:3');await tap(P,'sares','0:4');await W(100);
  ok('Stone Age: resource buttons build the points',await P.evaluate(()=>document.querySelector('[data-sab="0"]').value==='10'));
  await tap(P,'saadd','0');await W(100);
  // typed building
  await typeIn(P,'[data-sab="0"]',14);
  ok('Stone Age: Add enabled after typing',await P.evaluate(()=>!document.querySelector('[data-a="saadd"][data-k="0"]').disabled));
  await tap(P,'saadd','0');await W(100);
  for(let i=0;i<3;i++)await tapStep(P,'0:ag',1);
  for(let i=0;i<4;i++)await tapStep(P,'0:tl',1);
  await tapStep(P,'0:pp',1);await tapStep(P,'0:pp',-1);await tapStep(P,'0:pp',1);
  await tapStep(P,'1:hu',1);await tapStep(P,'1:ex',1);await tapStep(P,'1:ex',1);
  ok('Stone Age: people can’t go below 5',await P.evaluate(()=>document.querySelector('[data-a="sastep"][data-k="2:pp"][data-d="-1"]').disabled));
  const live=await P.evaluate(()=>{const [a,b]=act();return {b:a.sa.b,ag:a.sa.ag,tl:a.sa.tl,pp:a.sa.pp,t0:total(a),t1:total(b),txt:document.getElementById('nxc-'+a.id).textContent}});
  ok('Stone Age: two buildings 10 and 14',JSON.stringify(live.b)==='[10,14]',live.b);
  ok('Stone Age: agriculture 3, tools 4, people 6',live.ag===3&&live.tl===4&&live.pp===6,live);
  ok('Stone Age: tool tiles shown 2 · 1 · 1',live.txt.includes('tiles 2 · 1 · 1'),live.txt.slice(0,300));
  ok('Stone Age: feeding reminder',live.txt.includes('bring 3 food from your stock'));
  ok('Stone Age: live totals (24, and 2 − 10 = −8)',live.t0===24&&live.t1===-8,live);
  await tap(P,'sadel','0:0');await W(100);
  ok('Stone Age: remove a building',await P.evaluate(()=>JSON.stringify(act()[0].sa.b)==='[14]'));
  await P.evaluate(()=>{const b=document.createElement('button');b.dataset.a='undo';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(100);
  ok('Stone Age: undo brings it back',await P.evaluate(()=>JSON.stringify(act()[0].sa.b)==='[10,14]'));
  await tap(P,'saround');await W(100);
  ok('Stone Age: next round counter',await P.evaluate(()=>S.sar===2&&document.querySelector('.bar h1').textContent==='Round 2'));
  // final scoring
  await tap(P,'sanext');await W(200);
  ok('Stone Age: final scoring tab',await P.evaluate(()=>S.hr===1&&!!document.querySelector('[data-saf="0:g1"]')));
  // Justin: green 3 (9) + 1 (1), farmers 2 x ag 3 = 6, tool makers 1 x 4 = 4, builders 2 x 2 bldg = 4, shamans 1 x 6 = 6, resources 5 -> 35 + 24 = 59
  const J={g1:3,g2:1,fa:2,tm:1,bu:2,sh:1,rs:5};for(const [k,v] of Object.entries(J))await typeIn(P,`[data-saf="0:${k}"]`,v);
  await typeIn(P,'[data-saf="1:g1"]',8);
  const fin=await P.evaluate(()=>act().map(q=>total(q)));
  ok('Stone Age: final math for Justin (59)',fin[0]===59,fin);
  ok('Stone Age: 8 different green cards = 64 (−8 + 64 = 56)',fin[1]===56,fin);
  ok('Stone Age: header total updates live',await P.evaluate(()=>document.querySelector(`[data-sat="${act()[0].id}"]`).textContent==='59'));
  // tie: Kim gets 59 too with a lower tiebreaker
  await typeIn(P,'[data-saf="2:rs"]',59);
  const rk=await P.evaluate(()=>{const r=ranking();return r.list.map(x=>[nm(x.p),x.rank])});
  ok('Stone Age: tie broken by agriculture + tools + people',rk[0][0]==='Justin'&&rk[0][1]===1&&rk[1][1]===2,rk);
  await tap(P,'finish');await W(300);
  if(await P.evaluate(()=>!!document.querySelector('[data-a="revstart"]')))await tap(P,'revstart');
  for(let t=0;t<40&&await P.evaluate(()=>S.screen!=='results');t++){await P.evaluate(()=>{const b=[...document.querySelectorAll('[data-a]')].find(b=>/revskip|revend|skip/.test(b.dataset.a)&&b.offsetParent);if(b)b.click()});await W(500)}
  ok('Stone Age: reveal shows the tiebreaker',await P.evaluate(()=>document.body.textContent.includes('Ties go to agriculture + tool value + people')));
  await P.screenshot({path:'/tmp/sa-reveal.png'});
  await P.evaluate(()=>{const b=document.querySelector('[data-a="go"][data-s="results"]');if(b)b.click()});await W(400);
  ok('Stone Age: results screen',await P.evaluate(()=>S.screen==='results'&&document.body.textContent.includes('Agriculture + tools + people')));
  ok('Stone Age: results breakdown has farmers line',await P.evaluate(()=>document.body.textContent.includes('Farmers (2 × 3 agriculture)')));
  await P.screenshot({path:'/tmp/sa-results.png',fullPage:false});
  // sample game
  await P.evaluate(()=>{saDemo('safam');render()});await W(300);
  const demo=await P.evaluate(()=>act().map(q=>[nm(q),total(q)]));
  ok('Stone Age sample: Lily 154, Dad 152, Mom 133, Ben 132',JSON.stringify(demo)==='[["Mom",133],["Dad",152],["Ben",132],["Lily",154]]',demo);
  await P.screenshot({path:'/tmp/sa-final.png',fullPage:false});
  await P.evaluate(()=>{S.hr=0;render()});await W(200);await P.screenshot({path:'/tmp/sa-live.png',fullPage:false});
  await P.evaluate(()=>{const b=document.createElement('button');b.dataset.a='rules';document.body.appendChild(b);b.click();b.remove()});await W(300);
  ok('Stone Age: quick guide opens',await P.evaluate(()=>document.body.textContent.includes('2 or 3 players')&&document.body.textContent.includes('Tiebreaker')));
  ok('Stone Age: no page errors',errs.length===0,errs);
  await done(browser)})();
