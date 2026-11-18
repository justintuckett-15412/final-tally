// Telestrations: the "Auto-play" Big Reveal house rule and the game's sounds, over linked phones.
// 4 phones + a "Just watching" big board, Auto-play at 4 s: the pages turn on every phone with nobody tapping, all screens show
// the same page, it waits on the last page until the owner taps Done, pause/resume (owner and host) works, the owner can flip ahead.
// Sounds (the sound helper tsSfx is replaced by a recorder): a page turn once per page that reaches you, ticks only in the last
// 10 s of your own sketch timer, one "time's up", one ta-da per reveal, one chime per book's last page, nothing extra on re-render,
// and only reveal sounds on the big board. Then No scoring + Auto-play moves on to the next book by itself, and Owner flips
// (official) never turns a page by itself.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ts-shots';fs.mkdirSync(SHOT,{recursive:true});
const SPY=()=>{window.__snd=[];window.tsSfx=k=>{const g=S.tsg;window.__snd.push({k,t:Date.now(),left:g&&g.tEnd?g.tEnd-Date.now():null,ph:g&&g.phase,rv:g&&g.rv?g.rv.i+':'+g.rv.p:null})}};
async function setup(browser,names,o,tag){const PG=[];for(const n of names)PG.push(await mk(browser,n+tag));const H=PG[0];
  const r=await H.evaluate(async([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    c('tsstart','1');c('tsscoring',o.scoring);c('tspass','0');await w(100);
    const segs={rev:!!document.querySelector('[data-a=tsrev][data-k="0"]')&&!!document.querySelector('[data-a=tsrev][data-k="1"]'),speeds0:document.querySelectorAll('[data-a=tsautos]').length,
      off:(document.querySelector('[data-a=tsrev][aria-pressed=true]')||{dataset:{}}).dataset.k};
    if(o.auto){c('tsrev','1');await w(100);segs.def=JSON.parse(localStorage.getItem(KEY+'.tsx')||'{}').auto;segs.speeds=[...document.querySelectorAll('[data-a=tsautos]')].map(b=>b.dataset.k).join(',');
      segs.pressed=(document.querySelector('[data-a=tsautos][aria-pressed=true]')||{dataset:{}}).dataset.k;if(o.auto!==10)c('tsautos',String(o.auto));await w(100)}
    if(o.custom){c('tstimer','c');await w(150);const i=document.getElementById('tscsec');i.value=String(o.custom);i.dispatchEvent(new Event('change',{bubbles:true}));await w(150)}else c('tstimer',String(o.timer));
    const saved=JSON.parse(localStorage.getItem(KEY+'.tsx')||'{}');const hint=[...document.querySelectorAll('#app .hint')].map(e=>e.textContent).join(' | ');
    const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();
    return {ids:P.slice(0,N.length).map(p=>p.id),segs,saved,hint}},[names,o]);
  if(o.shotSetup){await H.evaluate(()=>{const h=[...document.querySelectorAll('#app h3')].find(e=>/Big Reveal/.test(e.textContent));if(h)h.scrollIntoView({block:'start'});window.scrollBy(0,-60)});await W(300);await H.screenshot({path:`${SHOT}/auto-setup.png`})}
  await H.evaluate(()=>{const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),r.ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),r.ids[i]);await W(800)}
  const TV=await mk(browser,'TV'+tag);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  for(const p of [...PG,TV])await p.evaluate(SPY);
  await W(1500);return {PG,H,TV,...r}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.tsg)));
async function pickAll(PG,ids,H){for(let n=0;n<20;n++){const g=await G(H);if(g.phase!=='pick')return g;
  for(let i=0;i<PG.length;i++){if(g.books[ids[i]].word)continue;const p=PG[i];const m=await p.evaluate(()=>({fx:!!document.getElementById('tsfx'),b:!!document.querySelector('[data-a=tsuword]')}));
    if(m.fx)await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},'Zibble'+i);else if(m.b)await p.evaluate(()=>document.querySelector('[data-a=tsuword]').click())}
  await W(900)}return G(H)}
async function drawOn(p){const box=await p.evaluate(()=>{const r=document.querySelector('#tsdraw canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
  await p.mouse.move(box.x+box.w*.2,box.y+box.h*.3);await p.mouse.down();await p.mouse.move(box.x+box.w*.8,box.y+box.h*.6,{steps:5});await p.mouse.up();
  await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click())}
const typeIn=(p,v)=>p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},v);
const task=p=>p.evaluate(()=>{const st=typeof tsPadState==='function'?tsPadState():null,fx=document.getElementById('tsfx');return {pad:!!(st&&st.show&&!st.sent),guess:!!(fx&&fx.dataset.m==='guess'),k:fx?fx.dataset.k:null,me:S.lk.me}});
async function tryAct(p){const t=await task(p);if(t.pad){await drawOn(p);return 'draw'}if(t.guess){await typeIn(p,`G-${t.me}-${t.k}`);return 'guess'}return null}
/* play a whole step: everyone (but the skipped phones) does their page */
async function playStep(PG,H,skip){const g0=await G(H),k0=g0.step,t0=Date.now();while(Date.now()-t0<45000){const g=await G(H);if(g.phase!=='play'||g.step!==k0)return G(H);for(let i=0;i<PG.length;i++)if(!(skip||[]).includes(i))await tryAct(PG[i]);await W(400)}return G(H)}
/* what each screen shows of the reveal */
const view=p=>p.evaluate(()=>{const g=S.tsg,a=document.querySelector('.tsauto'),lab=[...document.querySelectorAll('#app .tsbook p.rlab')].map(e=>e.textContent).find(t=>/^Page \d+ of/.test(t));
  return {rv:g&&g.rv?g.rv.i+':'+g.rv.p:null,ph:g&&g.phase,pz:g&&g.rv?g.rv.pz!=null:null,page:lab||(document.querySelector('#app .tswhole')?'whole':null),bar:!!(a&&a.querySelector('.tsautobar')),
    wait:!!document.querySelector('.tsautow'),paused:!!(a&&a.classList.contains('pz')),pause:(document.querySelector('[data-a=tsupause]')||{dataset:{}}).dataset.k||null,cnt:(a&&a.querySelector('.tsautot')||{}).textContent||''}});
const tap=(p,sel)=>p.evaluate(s=>{const b=document.querySelector(s);if(!b)return false;b.click();return true},sel);
const snd=p=>p.evaluate(()=>window.__snd.slice());
const cnt=(L,k)=>L.filter(e=>e.k===k).length;
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---------- 4 phones + big board, Auto-play 4 s, friendly scoring, 20 s sketch timer ---------- */
  {const names=['Mom','Dad','Kate','Sam'];const {PG,H,TV,ids,segs,saved,hint}=await setup(browser,names,{scoring:'friendly',auto:4,custom:20,shotSetup:1},'a');const ALL=[...PG,TV];
    ALL.forEach((p,i)=>p.on('pageerror',e=>errs.push('a'+i+': '+e.message)));
    ok('Setup: a “Big Reveal” choice with Owner flips (official, pressed by default) and Auto-play; Auto-play starts at 10 s with 4/6/8/10 s speeds',segs.rev&&segs.off==='0'&&segs.speeds0===0&&segs.def===10&&segs.speeds==='4,6,8,10'&&segs.pressed==='10',segs);
    ok('Auto-play at 4 s is remembered for this game, with a short house-rule hint',saved.auto===4&&/House rule: every screen turns the page every 4 seconds/.test(hint),{auto:saved.auto,hint:hint.slice(0,400)});
    let g=await pickAll(PG,ids,H);ok('Auto-play is stored on the dealt game (g.auto = 4)',g.auto===4&&g.phase==='play'&&g.timer===20,{auto:g.auto,ph:g.phase,t:g.timer});
    /* step 0 (sketch): Dad, Kate and Sam hand in right away; Mom lets her timer run out */
    g=await playStep(PG,H,[0]);
    const s0=await Promise.all(ALL.map(snd));
    ok('Ticks: Mom’s phone ticked once a second in the last 10 s of her sketch timer (and not before)',cnt(s0[0],'tick')>=9&&cnt(s0[0],'tick')<=10&&s0[0].filter(e=>e.k==='tick').every(e=>e.left!=null&&e.left<=10200&&e.left>-300),s0[0].filter(e=>e.k==='tick').map(e=>e.left));
    ok('Ticks: no ticks on the phones that handed in early, or on the big board',[1,2,3,4].every(i=>cnt(s0[i],'tick')===0),[1,2,3,4].map(i=>cnt(s0[i],'tick')));
    ok('“Time’s up” played once on Mom’s phone when her timer ended, and nowhere else',cnt(s0[0],'timeup')===1&&[1,2,3,4].every(i=>cnt(s0[i],'timeup')===0),s0.map(L=>cnt(L,'timeup')));
    ok('No page-turn sound for your own book at the start (even number of players: you sketch your own word first)',s0.every(L=>cnt(L,'page')===0)||g.step>=1&&s0.every(L=>cnt(L,'page')<=1),s0.map(L=>cnt(L,'page')));
    g=await playStep(PG,H);g=await playStep(PG,H);g=await playStep(PG,H);
    ok('The round reaches the Big Reveal',g.phase==='reveal'&&g.rv.p===-1&&typeof g.rv.t==='number',{ph:g.phase,rv:g.rv});
    /* re-render a lot: nothing may play again */
    for(const p of ALL)await p.evaluate(()=>{for(let i=0;i<5;i++)render()});await W(1200);
    const s1=await Promise.all(ALL.map(snd));
    ok('Page turn: every phone heard it once for each page that reached it (3), the big board never',[0,1,2,3].every(i=>cnt(s1[i],'page')===3)&&cnt(s1[4],'page')===0,s1.map(L=>cnt(L,'page')));
    ok('Ta-da: once on every phone and on the big board when the Big Reveal starts',s1.every(L=>cnt(L,'tada')===1),s1.map(L=>cnt(L,'tada')));
    ok('Sketch-step sounds never on the big board: only reveal sounds there',s1[4].every(e=>e.k==='tada'||e.k==='chime'),s1[4].map(e=>e.k));
    /* book 1 is Mom's (the host). Nobody taps: the pages turn on every screen */
    let v0=await Promise.all(ALL.map(view));
    ok('Every screen (and the big board) shows the countdown bar; the owner/host has ⏸ Pause, the others don’t',v0.every(v=>v.bar)&&v0[0].pause==='1'&&[1,2,3,4].every(i=>v0[i].pause===null),v0);
    const samples=[];let lastP=-1;const t0=Date.now();
    while(Date.now()-t0<22000){await W(700);const vs=await Promise.all(ALL.map(view));samples.push(vs.map(v=>v.rv));const gg=await G(H);lastP=gg.rv.p;if(gg.rv.p===3)break}
    const firstTurn=samples.findIndex(s=>s[0]!=='0:-1');
    ok('Nobody tapped: the pages turned by themselves to the last page (about every 4 s)',lastP===3&&firstTurn>=3&&(Date.now()-t0)>=14000&&(Date.now()-t0)<22000,{lastP,ms:Date.now()-t0,firstTurn});
    await W(600);let vs=await Promise.all(ALL.map(view));
    ok('All phones and the big board show the same page',vs.every(v=>v.rv===vs[0].rv&&v.page===vs[0].page),vs.map(v=>[v.rv,v.page]));
    const agree=samples.filter(s=>s.every(x=>x===s[0])).length;ok('Most samples on the way: every screen on the same page at once',agree>=samples.length*.6,{agree,n:samples.length});
    /* the last page: it waits for Done */
    await W(6000);vs=await Promise.all(ALL.map(view));
    ok('It waits on the last page (the whole book) until the owner taps Done, with a “waits here” line on every screen',vs.every(v=>v.rv==='0:3'&&v.page==='whole'&&v.wait&&!v.bar),vs.map(v=>[v.rv,v.page,v.wait]));
    let s2=await Promise.all(ALL.map(snd));ok('Chime: once on every screen when the book’s last page showed',s2.every(L=>cnt(L,'chime')===1),s2.map(L=>cnt(L,'chime')));
    await tap(PG[0],'[data-a=tsudone]');await W(900);g=await G(H);ok('Owner taps Done: the next book (Dad’s) starts on its secret word',g.rv.i===1&&g.rv.p===-1,g.rv);
    /* Dad's book: pause / resume by the owner */
    for(let n=0;n<14;n++){await W(500);g=await G(H);if(g.rv.p>=0)break}
    ok('Next book turns its first page by itself too',g.rv.i===1&&g.rv.p===0,g.rv);
    await tap(PG[1],'[data-a=tsupause][data-k="1"]');for(let n=0;n<12;n++){await W(300);vs=await Promise.all(ALL.map(view));if(vs.every(v=>v.pz&&v.paused))break}const pzAt=(await G(H)).rv.p;
    ok('Owner taps ⏸: every screen shows Paused',vs.every(v=>v.pz&&v.paused&&/Paused/.test(v.cnt)),vs.map(v=>[v.pz,v.cnt]));
    await PG[1].evaluate(()=>{const e=document.querySelector('.tsauto');if(e)e.scrollIntoView({block:'center'})});await W(300);await PG[1].screenshot({path:`${SHOT}/auto-reveal-paused.png`});
    await W(5500);g=await G(H);ok('Paused: no page turns for 6 s',g.rv.p===pzAt&&g.rv.pz!=null,g.rv);
    await tap(PG[1],'[data-a=tsupause][data-k="0"]');const tr=Date.now();let moved=null;for(let n=0;n<20;n++){await W(300);g=await G(H);if(g.rv.p>pzAt){moved=Date.now()-tr;break}}
    ok('Owner taps ▶ Resume: the page turns again by itself',moved!=null&&g.rv.pz==null,{moved,rv:g.rv});
    /* the screenshot: a reveal page with the countdown running */
    await W(1200);await PG[1].evaluate(()=>{const e=document.querySelector('.tsbook');if(e)e.scrollIntoView({block:'start'})});await W(200);await PG[1].screenshot({path:`${SHOT}/auto-reveal.png`});
    await TV.screenshot({path:`${SHOT}/auto-bigboard.png`});
    /* owner flips ahead: the page moves at once and the countdown starts over */
    g=await G(H);const pA=g.rv.p;if(pA<2){await W(200);await tap(PG[1],'[data-a=tsunext]');await W(500);const g2=await G(H);
      ok('Owner taps Next page ▶ ahead of the timer: the page turns at once and the countdown starts again',g2.rv.p===pA+1&&Date.now()-g2.rv.t<1500,{pA,rv:g2.rv})}
    else ok('Owner taps Next page ▶ ahead of the timer (skipped: already near the end)',false,{pA});
    /* the host (Mom, not the owner) can pause too; a third phone can't */
    vs=await Promise.all(ALL.map(view));ok('On Dad’s book: Dad (owner) and Mom (host) see ⏸, Kate and Sam don’t, the big board doesn’t',vs[1].pause&&vs[0].pause&&!vs[2].pause&&!vs[3].pause&&!vs[4].pause,vs.map(v=>v.pause));
    await tap(PG[0],'[data-a=tsupause][data-k="1"]');await W(700);g=await G(H);const hp=g.rv.p;ok('Host taps ⏸: paused for everyone',g.rv.pz!=null,g.rv);
    await W(4500);g=await G(H);ok('Host pause holds',g.rv.p===hp,g.rv);await tap(PG[0],'[data-a=tsupause][data-k="0"]');await W(600);g=await G(H);ok('Host taps ▶: running again',g.rv.pz==null,g.rv);
    /* finish the reveal by tapping */
    for(let n=0;n<60;n++){g=await G(H);if(g.phase!=='reveal')break;const op=PG[ids.indexOf(g.ps[g.rv.i])];await tap(op,'[data-a=tsunext]')||await tap(op,'[data-a=tsudone]');await W(500)}
    g=await G(H);ok('Reveal finished: round over',g.phase==='roundEnd',g.phase);
    for(const p of ALL)await p.evaluate(()=>{for(let i=0;i<5;i++)render()});await W(800);
    const s3=await Promise.all(ALL.map(snd));
    ok('Chime once per book on every screen (4 books), ta-da still once: nothing played twice',s3.every(L=>cnt(L,'chime')===4&&cnt(L,'tada')===1),s3.map(L=>[cnt(L,'chime'),cnt(L,'tada')]));
    ok('No sound ever played twice for the same thing (no two of the same kind within 150 ms)',s3.every(L=>L.every((e,i)=>!L.slice(0,i).some(x=>x.k===e.k&&Math.abs(x.t-e.t)<150))),s3.map(L=>L.map(e=>e.k).join(',')).slice(0,2));
    await Promise.all(ALL.map(p=>p.context().close()))}
  /* ---------- No scoring + Auto-play 4 s: at the end of a book it moves on by itself ---------- */
  {const names=['Ann','Bob','Cy','Di'];const {PG,H,TV,ids}=await setup(browser,names,{scoring:'none',auto:4,timer:0},'b');const ALL=[...PG,TV];ALL.forEach((p,i)=>p.on('pageerror',e=>errs.push('b'+i+': '+e.message)));
    let g=await pickAll(PG,ids,H);for(let s=0;s<4;s++)g=await playStep(PG,H);ok('No scoring: the reveal starts',g.phase==='reveal',g.phase);
    const t0=Date.now();for(let n=0;n<60;n++){await W(500);g=await G(H);if(g.rv&&g.rv.i>=1||g.phase!=='reveal')break}
    ok('No scoring: after the last page it moves on to the next book by itself (about 5 × 4 s)',g.phase==='reveal'&&g.rv.i===1&&g.rv.p===-1&&Date.now()-t0>=15000,{rv:g.rv,ms:Date.now()-t0});
    await W(2500);const vs=await Promise.all(ALL.map(view));ok('No scoring: every screen follows to the next book',vs.every(v=>v.rv==='1:-1'||v.rv==='1:0'),vs.map(v=>v.rv));
    await Promise.all(ALL.map(p=>p.context().close()))}
  /* ---------- Owner flips (official): nothing moves by itself ---------- */
  {const names=['Eve','Fay','Gus','Hal'];const {PG,H,TV,ids,saved}=await setup(browser,names,{scoring:'friendly',auto:0,timer:0},'c');const ALL=[...PG,TV];ALL.forEach((p,i)=>p.on('pageerror',e=>errs.push('c'+i+': '+e.message)));
    let g=await pickAll(PG,ids,H);ok('Owner flips: g.auto is 0',g.auto===0&&saved.auto===0,{a:g.auto});for(let s=0;s<4;s++)g=await playStep(PG,H);
    await W(7000);g=await G(H);const vs=await Promise.all(ALL.map(view));
    ok('Owner flips: after 7 s nothing has turned, and no countdown or pause anywhere',g.phase==='reveal'&&g.rv.i===0&&g.rv.p===-1&&vs.every(v=>!v.bar&&!v.pause),{rv:g.rv,vs});
    await tap(PG[0],'[data-a=tsunext]');await W(600);g=await G(H);ok('Owner flips: the owner’s tap still turns the page',g.rv.p===0,g.rv);
    await Promise.all(ALL.map(p=>p.context().close()))}
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
