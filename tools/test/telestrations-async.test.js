// Telestrations "Pass when ready" house rule over linked phones, plus the custom sketch timer.
// 4 phones (60 s timer): one player is slow; the others get their next page as soon as its book arrives and sketch/guess
// while the slow player is still on page 1; a blocked player sees "waiting for <name>"; the round reaches the reveal with
// every book complete and correct. 5 phones (odd) with a custom 15 s timer: one phone goes quiet on its sketch, the host
// leaves that page blank when that player's own time runs out, and the others carry on.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ts-shots';fs.mkdirSync(SHOT,{recursive:true});
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const r=await H.evaluate(async([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('tsstart','1');c('tsscoring',o.scoring);c('tspass','1');
    const seg=!!document.querySelector('[data-a=tspass][data-k="1"]')&&!!document.querySelector('[data-a=tstimer][data-k="c"]');
    let cust=null;if(o.custom){c('tstimer','c');await new Promise(r=>setTimeout(r,200));const i=document.getElementById('tscsec');cust={shown:!!i,def:i&&i.value};
      if(i){i.value=String(o.custom);i.dispatchEvent(new Event('input',{bubbles:true}));cust.hint=(document.getElementById('tstimerhint')||{}).textContent;i.dispatchEvent(new Event('change',{bubbles:true}))}
      await new Promise(r=>setTimeout(r,200));cust.after=(document.getElementById('tscsec')||{}).value;cust.pressed=(document.querySelector('[data-a=tstimer][aria-pressed=true]')||{dataset:{}}).dataset.k}
    else c('tstimer',String(o.timer));
    const saved=JSON.parse(localStorage.getItem(KEY+'.tsx')||'{}');const pressed=(document.querySelector('[data-a=tspass][aria-pressed=true]')||{dataset:{}}).dataset.k;
    const hint=[...document.querySelectorAll('#app .hint')].map(e=>e.textContent).join(' | ');
    const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();c('start');
    return {ids:P.slice(0,N.length).map(p=>p.id),seg,saved,pressed,cust,hint}},[names,o]);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),r.ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),r.ids[i]);await W(800)}
  const TV=await mk(browser,'TVa'+names.length);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  await W(1500);return {PG,H,TV,...r}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.tsg)));
/* the engine's rules, worked out here on their own */
const holder=(g,o,k)=>{const n=g.ps.length,oi=g.ps.indexOf(o),off=n%2?k+1:k;return g.ps[((oi+off*g.dir)%n+n*8)%n]};
const bookOf=(g,p,k)=>g.ps.find(o=>holder(g,o,k)===p);
const at=(g,p)=>{for(let k=0;k<g.steps;k++)if(!g.books[bookOf(g,p,k)].pages[k])return k;return g.steps};
async function pickAll(PG,ids,H){for(let n=0;n<20;n++){const g=await G(H);if(g.phase!=='pick')return g;
  for(let i=0;i<PG.length;i++){if(g.books[ids[i]].word)continue;const p=PG[i];const m=await p.evaluate(()=>({fx:!!document.getElementById('tsfx'),b:!!document.querySelector('[data-a=tsuword]')}));
    if(m.fx)await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},'Zibble'+i);else if(m.b)await p.evaluate(()=>document.querySelector('[data-a=tsuword]').click())}
  await W(900)}return G(H)}
async function drawOn(p){const box=await p.evaluate(()=>{const r=document.querySelector('#tsdraw canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
  await p.mouse.move(box.x+box.w*.2,box.y+box.h*.3);await p.mouse.down();await p.mouse.move(box.x+box.w*.8,box.y+box.h*.6,{steps:6});await p.mouse.up();
  await p.mouse.move(box.x+box.w*.5,box.y+box.h*.2);await p.mouse.down();await p.mouse.move(box.x+box.w*.5,box.y+box.h*.8,{steps:5});await p.mouse.up();
  await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click())}
const typeIn=(p,v)=>p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},v);
/* what a phone offers right now: the sketch pad (and whether it's a fresh one) or the guess box */
const task=p=>p.evaluate(()=>{const st=typeof tsPadState==='function'?tsPadState():null,fx=document.getElementById('tsfx');
  return {pad:!!(st&&st.show&&!st.sent),strokes:st?st.strokes:0,key:st?st.key:'',guess:!!(fx&&fx.dataset.m==='guess'),k:fx?fx.dataset.k:null,me:S.lk.me,
    txt:document.getElementById('app').innerText,head:(document.querySelector('.tshead h2')||{}).textContent||''}});
const stale=[];
/* one phone does its page if it has one; returns 'draw' / 'guess' / null */
async function tryAct(p){const t=await task(p);
  if(t.pad){if(t.strokes)stale.push(t.key);await drawOn(p);return 'draw'}
  if(t.guess){await typeIn(p,`G-${t.me}-${t.k}`);return 'guess'}return null}
/* check every book once the round is in the reveal */
function checkBooks(g){const bad=[];g.ps.forEach(o=>{const B=g.books[o];if(B.pages.length!==g.steps)bad.push(o+' pages '+B.pages.length);
  B.pages.forEach((P,k)=>{if(!P){bad.push(o+' hole '+k);return}if(P.kind!==(k%2?'guess':'draw'))bad.push(o+' kind '+k);if(P.by!==holder(g,o,k))bad.push(o+' by '+k);
    if(P.kind==='guess'&&P.d!==`G-${P.by}-${k}`)bad.push(o+' guess text '+k+' '+P.d)});
  if(new Set(B.pages.map(P=>P&&P.by)).size!==B.pages.length)bad.push(o+' same player twice');
  if(g.ps.length%2===0&&B.pages[0].by!==o)bad.push(o+' even: owner not first');if(g.ps.length%2&&B.pages.some(P=>P.by===o))bad.push(o+' odd: owner drew')});return bad}
async function toReveal(PG,H,skip){for(let n=0;n<80;n++){const g=await G(H);if(g.phase!=='play')return g;for(let i=0;i<PG.length;i++)if(!(skip||[]).includes(i))await tryAct(PG[i]);await W(500)}return G(H)}
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---- 4 phones, pass when ready, 60 s timer, Sam is slow ---- */
  {const {PG,H,TV,ids,seg,saved,pressed,hint}=await setup(browser,['Mom','Dad','Kate','Sam'],{scoring:'friendly',timer:60});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('four'+i+': '+e.message)));
    ok('Setup: a “Pass when ready” choice and a Custom timer choice; Pass when ready is remembered and pressed, with its house-rule hint',seg&&saved.async===1&&pressed==='1'&&/House rule: pass when ready/.test(hint),{seg,saved,pressed});
    let g=await pickAll(PG,ids,H);ok('Pass when ready is stored on the dealt game; everyone starts on page 1',g.async===true&&g.phase==='play'&&g.ps.every(p=>at(g,p)===0),{a:g.async,ph:g.phase});
    const slow=3,SAM=ids[slow],fast=[0,1,2];
    /* the fast phones keep going as far as their books allow; Sam does nothing */
    let did=0,early=[];for(let r=0;r<14;r++){let any=false;for(const i of fast){const a=await tryAct(PG[i]);if(a){any=true;did++;const g2=await G(H);if(at(g2,SAM)===0&&at(g2,ids[i])>=1)early.push([i,a,at(g2,ids[i])])}}await W(any?600:900);if(!any&&r>3)break}
    g=await G(H);const ats=g.ps.map(p=>at(g,p));
    ok('A fast player gets their next page and sketches or guesses while Sam is still on page 1',ats[slow]===0&&Math.max(...fast.map(i=>ats[i]))>=2&&early.some(e=>e[2]>=2),{ats,early:early.slice(0,6)});
    ok('Fast players did pages of books that never waited for Sam (sketch and guess both happened early)',early.some(e=>e[1]==='draw'&&e[2]>=2)&&early.some(e=>e[1]==='guess'),early);
    /* who is blocked, and on whom: the screen must name the right player */
    const blocked=[];for(const i of fast){const k=ats[i];if(k>=g.steps)continue;const o=bookOf(g,ids[i],k);if(g.books[o].pages[k-1])continue;const from=holder(g,o,k-1);
      const t=await task(PG[i]);const name=['Mom','Dad','Kate','Sam'][ids.indexOf(from)];blocked.push({i,from:name,ok:new RegExp('waiting for '+name+' to pass you a book').test(t.txt)&&!t.pad&&!t.guess,head:t.head,chips:/Sam · page 1 of 4/.test(t.txt)})}
    ok('A blocked player sees “Sent ✓ — waiting for <name> to pass you a book” naming the player who has it, plus page chips',blocked.length>0&&blocked.every(b=>b.ok&&b.chips),blocked);
    const mom=blocked.find(b=>b.i===0);ok('Mom (whose next book is Sam’s) is waiting for Sam; her header shows her own page number',mom&&mom.from==='Sam'&&/^Page 2 of 4/.test(mom.head),mom);
    {const wp=PG[(blocked.find(b=>b.i>0)||blocked[0]).i];await wp.evaluate(()=>{const e=document.querySelector('.tshead');if(e)e.scrollIntoView({block:'start'})});await W(300);await wp.screenshot({path:`${SHOT}/async-waiting.png`})}
    const tv=await TV.evaluate(()=>document.getElementById('app').innerText);
    ok('Big board: shows each player’s progress, never anyone’s task',/Sam · page 1 of 4/.test(tv)&&/Pass when ready/.test(tv)&&!/Sketch this|What is this sketch/.test(tv),tv.slice(0,300));
    await TV.screenshot({path:`${SHOT}/async-bigboard.png`});
    /* Sam finally sketches: Mom's next page shows up right away */
    const before=await task(PG[0]);await tryAct(PG[slow]);let arrived=null;
    for(let t=0;t<12;t++){await W(250);const m=await task(PG[0]);if(m.pad||m.guess){arrived={ms:(t+1)*250,pad:m.pad,guess:m.guess,head:m.head};break}}
    ok('When Sam passes his book, Mom’s next page appears right away (guess box open, page 2)',!before.guess&&arrived&&arrived.guess&&/^Page 2 of 4/.test(arrived.head),{arrived});
    g=await toReveal(PG,H);
    ok('The round reaches the Big Reveal',g.phase==='reveal',g.phase);
    const bad=checkBooks(g);ok('Every book is complete: 4 pages, sketch/guess alternating, each page by the right player, nobody twice, the guesses as typed',!bad.length,bad.slice(0,6));
    ok('Every sketch page opened a fresh pad (no strokes left over from the last page)',!stale.length,stale.slice(0,4));
    ok('Every sketch in the 4-player round was really drawn',Object.values(g.books).every(B=>B.pages.filter(P=>P.kind==='draw').every(P=>P.d.length>10)));
    /* flip through the reveal to the end of the round */
    for(let n=0;n<60;n++){const g2=await G(H);if(g2.phase!=='reveal')break;const op=PG[ids.indexOf(g2.ps[g2.rv.i])];
      await op.evaluate(()=>{const b=document.querySelector('[data-a=tsunext]')||document.querySelector('[data-a=tsudone]');if(b)b.click()});await W(500)}
    g=await G(H);ok('Reveal finished: round over',g.phase==='roundEnd',g.phase);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---- 5 phones (odd), custom 15 s timer, Di's phone goes quiet on her first sketch ---- */
  {const {PG,H,TV,ids,saved,cust}=await setup(browser,['Ann','Bob','Cy','Di','Eve'],{scoring:'competitive',custom:15});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('five'+i+': '+e.message)));
    ok('Custom timer: choosing Custom shows a seconds box (starts at 45); 15 is saved, Custom stays pressed, the hint says “House rule: 15 seconds”',cust&&cust.shown&&cust.def==='45'&&cust.after==='15'&&cust.pressed==='c'&&saved.ctimer===1&&saved.csec===15&&/House rule: 15 seconds to sketch/.test(cust.hint),{cust,saved});
    let g=await pickAll(PG,ids,H);ok('The game uses the custom timer (15 s) with pass when ready',g.timer===15&&g.async===true,{t:g.timer,a:g.async});
    const slow=3,DI=ids[slow];await PG[slow].evaluate(()=>{window.__pd=window.tsPadDone;window.tsPadDone=()=>false});
    const t0=Date.now();let late=null,timedOut=null,progress=[];
    while(Date.now()-t0<40000){for(const i of [0,1,2,4]){const t=await task(PG[i]);if(t.pad&&!late){const g2=await G(H);const k=at(g2,ids[i]);
          if(k>=2)late={i,k,left:(g2.te[ids[i]]||0)-Date.now()}}await tryAct(PG[i])}
      g=await G(H);progress.push([Math.round((Date.now()-t0)/1000),...g.ps.map(p=>at(g,p))]);
      const B=g.books[bookOf(g,DI,0)];if(B.pages[0]){timedOut={s:(Date.now()-t0)/1000,d:B.pages[0].d,by:B.pages[0].by,others:Math.max(...[0,1,2,4].map(i=>at(g,ids[i])))};break}await W(400)}
    ok('Others carry on while Di is stuck: someone reached page 3 before Di’s time ran out',timedOut&&timedOut.others>=2,{timedOut,progress:progress.slice(-3)});
    ok('Di’s own timer ran out: the host left her page blank (about 15 s + a few seconds after it reached her)',timedOut&&timedOut.d===''&&timedOut.by===DI&&timedOut.s>=14&&timedOut.s<30,timedOut);
    ok('Per-player timer: a later sketch page starts its own fresh 15 s when it reaches that player',late&&late.left>9000&&late.left<=15500,late);
    await PG[slow].evaluate(()=>{window.tsPadDone=window.__pd});
    let dt=null;for(let t=0;t<16;t++){dt=await task(PG[slow]);if(dt.guess||dt.pad||/waiting for/.test(dt.txt))break;await W(250)}ok('Di’s next page reached her after the blank one (her guess box opens, or she waits for it)',(dt.guess||/waiting for/.test(dt.txt))&&!/^Page 1 of/.test(dt.head),{head:dt.head});
    g=await toReveal(PG,H);ok('5 players: the round reaches the reveal',g.phase==='reveal',g.phase);
    const bad=checkBooks(g);ok('5 players: every book complete and correct (odd: your book passes first, 4 pages)',!bad.length&&g.steps===4,bad.slice(0,6));
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
