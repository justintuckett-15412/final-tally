// Telestrations "Nudge" over linked phones. 4 phones + a big board, pass together, no timer, owner flips:
// secret-word phase (Mom nudges Sam), sketch step (Dad nudges slow Sam: only Sam's phone gets the toast + bell, once;
// a second nudge within 15 s is blocked, allowed after), an old nudge stays quiet on reopen, the reveal's owner can be
// nudged after 20 s, the big board never shows nudge buttons. Then 4 phones with pass when ready: the waiting player
// nudges the one player holding their next book. A nudge goes sender -> host -> nudged phone (two deliveries), so checks wait ~4 s.
process.env.LAT=process.env.LAT||'400';process.env.JIT=process.env.JIT||'600';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ts-shots';fs.mkdirSync(SHOT,{recursive:true});
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const r=await H.evaluate(async([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('tsstart','1');c('tsscoring','friendly');c('tspass',o.async?'1':'0');c('tstimer','0');c('tsrev','0');
    const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();c('start');
    return {ids:P.slice(0,N.length).map(p=>p.id)}},[names,o]);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),r.ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),r.ids[i]);await W(800)}
  const TV=await mk(browser,'TVn'+(o.async?'a':'t'));await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  await W(1500);
  /* spies on every phone: bells (tsSfx('bell')) and nudge toasts */
  for(const p of [...PG,TV])await p.evaluate(()=>{window.__bells=0;window.__toasts=[];const o=window.tsSfx;window.tsSfx=k=>{if(k==='bell')window.__bells++;return o(k)};
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('tsnzt'))window.__toasts.push(n.textContent)}))).observe(document.body,{childList:true})});
  return {PG,H,TV,...r}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.tsg)));
const spy=p=>p.evaluate(()=>({bells:window.__bells,toasts:window.__toasts.slice()}));
const spies=ps=>Promise.all(ps.map(spy));
const nudges=p=>p.evaluate(()=>[...document.querySelectorAll('#app .tsnudge')].map(b=>({k:b.dataset.k||'',t:b.textContent.trim(),dis:b.disabled})));
const tapNudge=(p,k)=>p.evaluate(k=>{const b=document.querySelector(`#app [data-a=tsunudge][data-k="${k}"]`);if(!b||b.disabled)return false;b.click();return true},k);
async function pick(p,i){const m=await p.evaluate(()=>({fx:!!document.getElementById('tsfx'),b:!!document.querySelector('[data-a=tsuword]')}));
  if(m.fx)await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},'Zibble'+i);else if(m.b)await p.evaluate(()=>document.querySelector('[data-a=tsuword]').click())}
async function drawOn(p){const box=await p.evaluate(()=>{const r=document.querySelector('#tsdraw canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
  await p.mouse.move(box.x+box.w*.2,box.y+box.h*.3);await p.mouse.down();await p.mouse.move(box.x+box.w*.8,box.y+box.h*.6,{steps:6});await p.mouse.up();
  await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click())}
const task=p=>p.evaluate(()=>{const st=typeof tsPadState==='function'?tsPadState():null,fx=document.getElementById('tsfx');
  return {pad:!!(st&&st.show&&!st.sent),guess:!!(fx&&fx.dataset.m==='guess'),k:fx?fx.dataset.k:null,me:S.lk.me,txt:document.getElementById('app').innerText}});
async function tryAct(p){const t=await task(p);if(t.pad){await drawOn(p);return 'draw'}
  if(t.guess){await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},`G-${t.me}-${t.k}`);return 'guess'}return null}
async function until(f,ms){const t0=Date.now();while(Date.now()-t0<ms){const v=await f();if(v)return v;await W(300)}return null}
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---------- pass together ---------- */
  {const N=['Mom','Dad','Kate','Sam'];const {PG,H,TV,ids}=await setup(browser,N,{});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('t'+i+': '+e.message)));
    const SAM=ids[3],slow=PG[3],others=[0,1,2];
    /* secret word: everyone but Sam chooses */
    for(let n=0;n<12;n++){const g=await G(H);let left=false;for(const i of others)if(!g.books[ids[i]].word){left=true;await pick(PG[i],i)}if(!left)break;await W(900)}
    await W(2500);let g=await G(H);
    ok('Secret word: everyone but Sam has chosen',g.phase==='pick'&&others.every(i=>g.books[ids[i]].word)&&!g.books[SAM].word,g.phase);
    let nb=await nudges(PG[0]);ok('Secret word: after choosing, Mom sees “🔔 Nudge Sam” (and nobody else)',nb.length===1&&nb[0].k===SAM&&/Nudge Sam/.test(nb[0].t),nb);
    ok('Secret word: Sam (still choosing) has no nudge buttons; the big board has none',!(await nudges(slow)).length&&!(await nudges(TV)).length);
    ok('Secret word: Mom taps Nudge Sam',await tapNudge(PG[0],SAM));await W(4000);
    let sp=await spies([...PG,TV]);
    ok('Secret word: Sam’s phone gets “🔔 Mom is waiting on your secret word” and one bell; nobody else gets anything',sp[3].toasts.length===1&&/Mom is waiting on your secret word/.test(sp[3].toasts[0])&&sp[3].bells===1&&[0,1,2,4].every(i=>!sp[i].toasts.length&&!sp[i].bells),sp);
    nb=await nudges(PG[0]);ok('Secret word: Mom’s button now reads “Nudged ✓”',nb.length===1&&nb[0].dis&&/Nudged ✓/.test(nb[0].t),nb);
    await pick(slow,3);await until(async()=>(await G(H)).phase==='play',8000);await W(1500);
    /* sketch step: Mom, Dad and Kate draw; Sam is slow */
    for(const i of others){await until(async()=>(await task(PG[i])).pad,6000);await tryAct(PG[i])}await W(2500);
    g=await G(H);ok('Sketch step: Mom, Dad and Kate handed in, Sam hasn’t',g.phase==='play'&&g.step===0&&others.every(i=>g.sub[ids[i]])&&!g.sub[SAM],{sub:g.sub});
    nb=await nudges(PG[1]);const dadTxt=await PG[1].evaluate(()=>document.getElementById('app').innerText);
    ok('Sketch step: Dad’s “Sent ✓” screen has one button, “🔔 Nudge Sam”',/Sent ✓/.test(dadTxt)&&nb.length===1&&nb[0].k===SAM&&!nb[0].dis,nb);
    await PG[1].evaluate(()=>{const e=document.querySelector('.tsnudges');if(e)e.scrollIntoView({block:'center'})});await W(300);await PG[1].screenshot({path:`${SHOT}/nudge-waiting.png`});
    ok('Sketch step: the big board shows no nudge buttons',!(await nudges(TV)).length);
    const b0=await spies([...PG,TV]);
    ok('Sketch step: Dad taps Nudge Sam',await tapNudge(PG[1],SAM));const tN=Date.now();
    await W(600);nb=await nudges(PG[1]);ok('Dad’s button turns into “Nudged ✓” right away',nb.length===1&&nb[0].dis&&/Nudged ✓/.test(nb[0].t),nb);
    await W(3400);sp=await spies([...PG,TV]);
    ok('Only Sam’s phone gets “🔔 Dad is waiting on your sketch” and a bell, once',sp[3].toasts.length===2&&/Dad is waiting on your sketch/.test(sp[3].toasts[1])&&sp[3].bells===2&&[0,1,2,4].every(i=>sp[i].toasts.length===b0[i].toasts.length&&sp[i].bells===b0[i].bells),sp);
    await W(300);await slow.screenshot({path:`${SHOT}/nudge-toast.png`});
    /* re-renders never repeat it */
    await slow.evaluate(()=>{for(let i=0;i<5;i++){render();tsFx()}});await W(1500);sp=await spies([...PG,TV]);
    ok('Redraws on Sam’s phone don’t repeat the toast or bell',sp[3].toasts.length===2&&sp[3].bells===2,sp[3]);
    /* a second nudge within 15 s: blocked (even if forced past the button) */
    const k1=(await G(H)).nudge.k;await PG[1].evaluate(id=>{const b=document.createElement('button');b.dataset.a='tsunudge';b.dataset.k=id;b.hidden=true;document.body.appendChild(b);b.click();b.remove()},SAM);
    await W(4000);g=await G(H);sp=await spies([...PG,TV]);
    ok('Cooldown: a second nudge from Dad within 15 s is refused by the host; Sam gets nothing more',g.nudge.k===k1&&sp[3].toasts.length===2&&sp[3].bells===2,{k:g.nudge.k,k1,sam:sp[3]});
    /* another sender isn't blocked by Dad's cooldown */
    nb=await nudges(PG[2]);ok('Kate (who hasn’t nudged) still has her own “🔔 Nudge Sam”',nb.length===1&&!nb[0].dis,nb);
    /* after 15 s: Dad's button comes back */
    const back=await until(async()=>{const x=await nudges(PG[1]);return x.length===1&&!x[0].dis&&/Nudge Sam/.test(x[0].t)?Date.now():null},20000);
    ok('After 15 s Dad’s button is back to “🔔 Nudge Sam”',back&&back-tN>=14000&&back-tN<19000,back&&back-tN);
    /* app reopened (fresh memory of nudges): the old nudge (15 s+) stays quiet */
    await slow.evaluate(()=>{TSNZ=null;tsFx();tsFx()});await W(500);sp=await spies([...PG,TV]);
    ok('Reopening the app with an old nudge (15 s+) shows no toast and no bell',sp[3].toasts.length===2&&sp[3].bells===2,sp[3]);
    ok('Dad nudges Sam again after the cooldown',await tapNudge(PG[1],SAM));await W(4000);sp=await spies([...PG,TV]);
    ok('The new nudge reaches Sam (toast + bell), still nobody else',sp[3].toasts.length===3&&sp[3].bells===3&&[0,1,2,4].every(i=>sp[i].bells===b0[i].bells),sp.map(s=>s.bells));
    /* finish the round */
    for(let n=0;n<60;n++){g=await G(H);if(g.phase!=='play')break;for(let i=0;i<4;i++)await tryAct(PG[i]);await W(500)}
    g=await G(H);ok('The round reaches the Big Reveal (owner flips)',g.phase==='reveal'&&!g.auto&&g.rv.i===0,g.phase);
    const tR=Date.now();await W(2500);
    nb=await nudges(PG[2]);ok('Reveal: no nudge button before the page has sat for 20 s',!nb.length,nb);
    const at=await until(async()=>{const x=await nudges(PG[2]);return x.length?{x,ms:Date.now()-tR}:null},26000);
    ok('Reveal: after ~20 s Kate sees “🔔 Nudge Mom” (the book’s owner)',at&&at.x.length===1&&at.x[0].k===ids[0]&&/Nudge Mom/.test(at.x[0].t)&&at.ms>=16000,at);
    nb=await nudges(PG[0]);ok('Reveal: Mom (the owner) has no nudge buttons; the big board has none',!nb.length&&!(await nudges(TV)).length,nb);
    const b1=await spies([...PG,TV]);ok('Kate nudges Mom',await tapNudge(PG[2],ids[0]));await W(4000);sp=await spies([...PG,TV]);
    ok('Mom’s phone: “🔔 Kate is waiting for you to turn the page” + bell; nobody else',sp[0].toasts.length===b1[0].toasts.length+1&&/Kate is waiting for you to turn the page/.test(sp[0].toasts.slice(-1)[0])&&sp[0].bells===b1[0].bells+1&&[1,2,3,4].every(i=>sp[i].bells===b1[i].bells&&sp[i].toasts.length===b1[i].toasts.length),sp);
    /* Mom turns the page: the button goes away for 20 s */
    await PG[0].evaluate(()=>document.querySelector('[data-a=tsunext]').click());await W(2500);
    ok('After Mom turns the page, the reveal nudge goes away',!(await nudges(PG[2])).length&&!(await nudges(PG[1])).length);
    sp=await spies([TV]);ok('The big board never got a toast or bell',!sp[0].toasts.length&&!sp[0].bells,sp[0]);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---------- pass when ready ---------- */
  {const N=['Ann','Bob','Cy','Di'];const {PG,H,TV,ids}=await setup(browser,N,{async:1});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('a'+i+': '+e.message)));
    const slow=3,DI=ids[slow],fast=[0,1,2];
    for(let n=0;n<12;n++){const g=await G(H);if(g.phase!=='pick')break;for(let i=0;i<4;i++)if(!g.books[ids[i]].word)await pick(PG[i],i);await W(900)}
    await until(async()=>(await G(H)).phase==='play',8000);await W(1500);
    for(let r=0;r<14;r++){let any=false;for(const i of fast)if(await tryAct(PG[i]))any=true;await W(any?900:1200);if(!any&&r>3)break}
    await W(2000);const g=await G(H);
    /* who is waiting on Di */
    let w=null;for(const i of fast){const t=await task(PG[i]);if(/waiting for Di to pass you a book/.test(t.txt)){w=i;break}}
    ok('Pass when ready: a fast player is waiting for Di to pass them a book',w!=null,{at:g.at});
    if(w!=null){const nb=await nudges(PG[w]);ok('The waiting screen has exactly one button: “🔔 Nudge Di”',nb.length===1&&nb[0].k===DI&&/Nudge Di/.test(nb[0].t),nb);
      await PG[w].evaluate(()=>{const e=document.querySelector('.tsnudges');if(e)e.scrollIntoView({block:'center'})});await W(300);await PG[w].screenshot({path:`${SHOT}/nudge-async-waiting.png`});
      ok('The big board has no nudge buttons',!(await nudges(TV)).length);
      ok(N[w]+' taps Nudge Di',await tapNudge(PG[w],DI));await W(4000);const sp=await spies([...PG,TV]);
      ok('Di’s phone: “🔔 '+N[w]+' is waiting on your sketch” + bell; nobody else',sp[slow].toasts.length===1&&new RegExp(N[w]+' is waiting on your sketch').test(sp[slow].toasts[0])&&sp[slow].bells===1&&[0,1,2,4].filter(i=>i!==slow).every(i=>!sp[i].toasts.length&&!sp[i].bells),sp)}
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
