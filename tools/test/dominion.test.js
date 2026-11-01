// Dominion tracker: sets toggles, final count math (Gardens, Duke, Territory, Colonies, tokens, curses),
// the turns tiebreaker, the sample game, results and the quick guide.
const {mk,W,ok,done,chromium}=require('./link.js');
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.offsetParent);if(b){b.click();return true}return false},[a,k]);
const typeIn=async(p,sel,v)=>{await p.focus(sel);await p.fill(sel,String(v));await p.dispatchEvent(sel,'input')};
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');
  const errs=[];P.on('pageerror',e=>errs.push(e.message));
  ok('Dominion: on the home screen',await P.evaluate(()=>!!document.querySelector('[data-a="dnstart"][data-k="0"]')));
  await P.evaluate(()=>document.querySelector('[data-a="dnstart"][data-k="0"]').click());await W(500);
  ok('Dominion: setup screen with six sets',await P.evaluate(()=>S.game==='dominion'&&document.querySelectorAll('[data-a="dnset"]').length===7));
  await tap(P,'dnset','allies');await W(150);
  ok('Dominion: set toggle remembered',await P.evaluate(()=>S.dnx.sets.allies===0&&JSON.parse(localStorage.getItem(KEY+'.dnx')).sets.allies===0));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Kim'][i]||''});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(400);
  ok('Dominion: final count screen',await P.evaluate(()=>S.screen==='score'&&!!document.querySelector('[data-dnf="0:pr"]')));
  ok('Dominion: Allies off hides Territory',await P.evaluate(()=>!document.querySelector('[data-dnf="0:te"]')&&!!document.querySelector('[data-dnf="0:co"]')));
  // Justin: 3 Estates, 2 Duchies, 4 Provinces, 1 Colony, 2 Curses, 5 tokens, 2 Gardens with 37 cards, 1 Duke, 1 Great Hall, 1 Nobles
  // = 3 + 6 + 24 + 10 - 2 + 5 + 2*3 + 1*2 + 1 + 2 = 57
  const J={es:3,du:2,pr:4,co:1,cu:2,vt:5,ga:2,dk:37,dke:1,f1:1,f2:1};for(const [k,v] of Object.entries(J))await typeIn(P,`[data-dnf="0:${k}"]`,v);
  await typeIn(P,'[data-dnf="1:pr"]',9);await typeIn(P,'[data-dnf="1:es"]',3);
  const fin=await P.evaluate(()=>act().map(q=>total(q)));
  ok('Dominion: Justin 57',fin[0]===57,fin);
  ok('Dominion: Brad 57 (9 Provinces + 3 Estates)',fin[1]===57,fin);
  ok('Dominion: header updates live',await P.evaluate(()=>document.querySelector(`[data-dnt="${act()[0].id}"]`).textContent==='57'));
  await typeIn(P,'[data-dnf="0:tu"]',20);await typeIn(P,'[data-dnf="1:tu"]',19);
  const rk=await P.evaluate(()=>ranking().list.map(x=>[nm(x.p),x.rank]));
  ok('Dominion: tie goes to fewer turns',rk[0][0]==='Brad'&&rk[0][1]===1&&rk[1][1]===2,rk);
  // Territory, after turning Allies back on
  await P.evaluate(()=>{S.dnx.sets.allies=1;render()});await W(150);
  await typeIn(P,'[data-dnf="2:te"]',2);
  await tap(P,'finish');await W(300);
  ok('Dominion: warns Territory needs a count, and Kim done',await P.evaluate(()=>(WARN||[]).some(w=>w.includes('Territories need'))));
  await tap(P,'warnclose');await W(150);
  await typeIn(P,'[data-dnf="2:tn"]',5);
  ok('Dominion: 2 Territories × 5 names = 10',await P.evaluate(()=>total(act()[2])===10));
  await tap(P,'finish');await W(300);
  if(await P.evaluate(()=>!!document.querySelector('[data-a="revstart"]')))await tap(P,'revstart');
  for(let t=0;t<40&&await P.evaluate(()=>S.screen!=='results');t++){await P.evaluate(()=>{const b=[...document.querySelectorAll('[data-a]')].find(b=>/revskip|revend|skip/.test(b.dataset.a)&&b.offsetParent);if(b)b.click()});await W(500)}
  ok('Dominion: reveal shows the turns tiebreaker',await P.evaluate(()=>document.body.textContent.includes('Fewer turns wins')));
  await P.evaluate(()=>{const b=document.querySelector('[data-a="go"][data-s="results"]');if(b)b.click()});await W(400);
  ok('Dominion: results breakdown',await P.evaluate(()=>S.screen==='results'&&document.body.textContent.includes('Gardens (2 × 3)')&&document.body.textContent.includes('Dukes (1 × 2 Duchies)')));
  await P.screenshot({path:'/tmp/dn-results.png'});
  await P.evaluate(()=>{dnDemo('dnfam');render()});await W(300);
  const demo=await P.evaluate(()=>act().map(q=>[nm(q),total(q)]));
  ok('Dominion sample totals',JSON.stringify(demo)==='[["Mom",56],["Dad",49],["Ben",39],["Lily",44]]',demo);
  await P.screenshot({path:'/tmp/dn-score.png'});
  await P.evaluate(()=>{const b=document.createElement('button');b.dataset.a='rules';document.body.appendChild(b);b.click();b.remove()});await W(300);
  ok('Dominion: quick guide opens',await P.evaluate(()=>document.body.textContent.includes('Each Duke is worth 1 per Duchy')));
  ok('Dominion: no page errors',errs.length===0,errs);
  await done(browser)})();
