// Telestrations over linked phones: 4 phones play a whole round (pick, sketch on the pad, guess, Big Reveal with Friendly
// stars, scores), then 5 phones play an odd round (competitive, the sketch timer runs out for one player).
// Checks on every step: no phone shows another player's secret word or a sketch it shouldn't see yet; a "Just watching"
// phone shows the big board and never anyone's task; no page errors.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ts-shots';fs.mkdirSync(SHOT,{recursive:true});
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const ids=await H.evaluate(([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('tsstart','1');c('tsscoring',o.scoring);c('tstimer',String(o.timer));const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();c('start');return P.slice(0,N.length).map(p=>p.id)},[names,o]);
  const unl=await H.evaluate(()=>({link:/Link the phones/.test(document.getElementById('app').innerText),g:!!S.tsg}));
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  const TV=await mk(browser,'TV'+names.length);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  if(process.env.TSDBG)for(const p of PG.slice(1))await p.evaluate(()=>{window.__glog=[];const sv=save;window.save=save=function(){try{if(!LKOPTR){const m=lkSplit().m,b=LKLAST.m||{};const d=Object.keys(m).filter(k=>k.startsWith('tsg')&&m[k]!==b[k]);if(d.length&&__glog.length<5)__glog.push(d.slice(0,3).join(';').replace(/\u0001/g,'.')+' @ '+new Error().stack.split('\n').slice(2,9).join(' | '))}}catch(e){}return sv.apply(this,arguments)}});
  await W(1500);return {PG,H,ids,TV,unl}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.tsg)));
/* what each phone shows: all its text (main page, typing layer, sketch pad) and which sketches are on screen */
const view=p=>p.evaluate(()=>{const pad=document.getElementById('tsdraw');return {g:typeof tsGx==='function'&&tsGx()?JSON.parse(JSON.stringify(tsGx())):null,me:S.lk.me,txt:document.getElementById('app').innerText+'\n'+((document.getElementById('tsfx')||{}).innerText||'')+'\n'+(pad&&!pad.hidden?pad.innerText:''),
  pgs:[...document.querySelectorAll('#app [data-tspg]')].map(e=>e.dataset.tspg),pad:!!(pad&&!pad.hidden),fx:(document.getElementById('tsfx')||{dataset:{}}).dataset.m||'',big:document.documentElement.classList.contains('tsbig')}});
const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const leaks=[];
async function privacy(PG,TV,g0,tag){
  for(const p of [...PG,TV]){const v=await view(p);const me=v.me||'';const g=v.g;if(!g)continue;
    if(g.phase==='pick'||g.phase==='play'){
      const pr=g.phase==='play'&&me?(()=>{const o=g.ps.find(o=>{const n=g.ps.length,oi=g.ps.indexOf(o),off=n%2?g.step+1:g.step;return g.ps[((oi+off*g.dir)%n+n*8)%n]===me});const B=g.books[o],k=g.step;return {owner:o,word:k===0?B.word:(B.pages[k-1]&&B.pages[k-1].kind==='guess'?B.pages[k-1].d:null)}})():null;
      for(const o of g.ps){const w=g.books[o].word;if(!w||o===me)continue;if(pr&&pr.word&&pr.word.toLowerCase()===w.toLowerCase()&&!g.sub[me])continue;
        if(new RegExp('\\b'+reEsc(w)+'\\b','i').test(v.txt))leaks.push([tag,me||'TV','word',w])}
      const allowed=g.phase==='play'&&me&&pr&&g.step>0&&!g.sub[me]&&g.step%2===1?[pr.owner+':'+(g.step-1)]:[];
      v.pgs.forEach(x=>{if(!allowed.includes(x))leaks.push([tag,me||'TV','sketch',x])})}
    if(g.phase==='reveal'){const o=g.ps[g.rv.i];v.pgs.forEach(x=>{const [oo,i]=x.split(':');if(oo!==o||+i>g.rv.p&&g.rv.p<g.books[o].pages.length-1)leaks.push([tag,me||'TV','reveal',x])})}}}
async function drawOn(p){const box=await p.evaluate(()=>{const c=document.querySelector('#tsdraw canvas');const r=c.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
  await p.mouse.move(box.x+box.w*.2,box.y+box.h*.3);await p.mouse.down();for(let t=0;t<=10;t++)await p.mouse.move(box.x+box.w*(.2+.06*t),box.y+box.h*(.3+.04*t*(t%2?1:-1)+.2));await p.mouse.up();
  await p.mouse.move(box.x+box.w*.5,box.y+box.h*.7);await p.mouse.down();await p.mouse.move(box.x+box.w*.8,box.y+box.h*.75,{steps:6});await p.mouse.up();
  await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click())}
async function typeIn(p,v){await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},v)}
/* play one whole round through the screens. opts: skipDraw (one phone that never finishes its first sketch), right (guess the secret word for some pages), shots */
async function playRound(PG,H,TV,ids,o){const tag=o.tag;const pgOf=pid=>PG[ids.indexOf(pid)];let n=0,shot={},timeupSeen=false,padOK=0,sent=0;
  while(n++<200){const g=await G(H);await privacy(PG,TV,g,tag+':'+g.phase+':'+g.step);
    if(g.phase==='pick'){if(o.shots&&!shot.pick){await PG[1].screenshot({path:`${SHOT}/pick.png`});shot.pick=1}
      for(let i=0;i<PG.length;i++){const p=PG[i];if(g.books[ids[i]].word)continue;const m=await p.evaluate(()=>({fx:!!document.getElementById('tsfx'),b:!!document.querySelector('[data-a=tsuword]')}));
        if(m.fx)await typeIn(p,'Quizzle'+tag.replace(/\W/g,'')+i);else if(m.b)await p.evaluate(()=>document.querySelector('[data-a=tsuword]').click())}
      await W(900);continue}
    if(g.phase==='play'){const kind=g.step%2===0?'draw':'guess';
      for(let i=0;i<PG.length;i++){const p=PG[i],me=ids[i];if(g.sub[me])continue;const v=await view(p);
        if(kind==='draw'){if(!v.pad)continue;padOK++;if(o.skipDraw===me&&g.step===0&&g.tEnd){continue}await drawOn(p);sent++}
        else{if(v.fx!=='guess')continue;if(o.shots&&!shot.guess&&i>0){await p.screenshot({path:`${SHOT}/guess.png`});shot.guess=1}
          const owner=g.ps.find(x=>(g.books[x].pages[g.step-1]||{}).by&&true&&x&&(()=>{const n=g.ps.length,oi=g.ps.indexOf(x),off=n%2?g.step+1:g.step;return g.ps[((oi+off*g.dir)%n+n*8)%n]===me})());
          if(i===0&&o.blankTry){await typeIn(p,'   ');await W(200);const e=await p.evaluate(()=>document.querySelector('#tsfx .cnerr').textContent);o.blankErr=e;o.blankTry=false}
          await typeIn(p,o.right&&(i+g.step)%2===0?g.books[owner].word:'Mystery '+tag.replace(/\W/g,'')+g.step+'x'+i);sent++}}
      await W(400);
      if(o.shots&&!shot.wait){const g2=await G(H);const w=PG.findIndex((p,i)=>i>0&&g2.phase==='play'&&g2.sub[ids[i]]);if(w>=0&&g2.ps.some(x=>!g2.sub[x])){await W(300);await PG[w].screenshot({path:`${SHOT}/waiting.png`});await TV.screenshot({path:`${SHOT}/bigboard-play.png`});shot.wait=1}}
      if(o.skipDraw){const g2=await G(H);if(g2.phase==='play'&&g2.step===0&&!g2.sub[o.skipDraw]&&g2.ps.filter(x=>!g2.sub[x]).length===1){
        await H.evaluate(()=>{S.tsg.tEnd=Date.now()-5000;save()});await W(1500);const g3=await G(H);timeupSeen=g3.step===1||g3.phase!=='play';o.timeupBlank=g3.books&&Object.values(g3.books).some(B=>B.pages[0]&&B.pages[0].by===o.skipDraw&&B.pages[0].d==='')}}
      await W(700);continue}
    if(g.phase==='reveal'){const owner=g.ps[g.rv.i],op=pgOf(owner),last=g.books[owner].pages.length-1;
      if(g.rv.p===0&&o.shots&&!shot.rev){await W(300);await PG[(ids.indexOf(owner)+1)%PG.length].screenshot({path:`${SHOT}/reveal.png`});await TV.screenshot({path:`${SHOT}/bigboard-reveal.png`});shot.rev=1}
      if(g.rv.p<last){await op.evaluate(()=>{const b=document.querySelector('[data-a=tsunext]');if(b)b.click()});await W(500);continue}
      if(o.shots&&!shot.last){await op.screenshot({path:`${SHOT}/reveal-scoring.png`,fullPage:true});shot.last=1}
      if(g.scoring==='friendly'){const M=g.marks[owner]||{};if(!M.sketch){await op.evaluate(()=>{const b=document.querySelector('[data-a=tsumark][data-k^="sketch"]');if(b)b.click()});await W(500);continue}
        if(!M.guess){await op.evaluate(()=>{const b=document.querySelector('[data-a=tsumark][data-k^="guess"]');if(b)b.click()});await W(500);continue}}
      if(g.scoring==='competitive'&&!o.untick){const i=g.books[owner].pages.findIndex((P,i)=>P.kind==='guess');o.untick={owner,i};await op.evaluate(i=>{const b=document.querySelector(`[data-a=tsumatch][data-k^="${i}:"]`);if(b)b.click()},i);await W(600);
        const after=await H.evaluate(([o,i])=>tsMatchOK(S.tsg,o,i),[owner,i]);o.untick.flipped=after!==((()=>{const B=g.books[owner],P=B.pages[i];return P.d.toLowerCase()===B.word.toLowerCase()})());continue}
      await op.evaluate(()=>{const b=document.querySelector('[data-a=tsudone]');if(b)b.click()});await W(700);continue}
    return {g,timeupSeen,padOK,sent}}
  if(process.env.TSDBG)for(const p of PG.slice(1))console.log('GLOG',await p.evaluate(()=>__glog.join('\n')));
  {const g=await G(H);for(let i=0;i<PG.length;i++)console.log('STUCK',i,ids[i],g.phase,g.step,JSON.stringify(g.sub),JSON.stringify(g.books[ids[i]].word),JSON.stringify(g.cards[ids[i]]),g.die,JSON.stringify(await PG[i].evaluate(()=>({fx:!!document.getElementById('tsfx'),me:S.lk.me,q:JSON.stringify((S.lkq||{})[S.lk.me]||[]).slice(0,300),qa:JSON.stringify(S.lkqa),btn:[...document.querySelectorAll('[data-a=tsuword]')].length,txt:document.getElementById('app').innerText.slice(0,300)}))));}
  return {g:await G(H),timeupSeen,padOK,sent,stuck:true}}
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---- 4 phones, Friendly scoring, 60 s timer ---- */
  {const {PG,H,ids,TV,unl}=await setup(browser,['Mom','Dad','Kate','Sam'],{scoring:'friendly',timer:60});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('four'+i+': '+e.message)));
    ok('Not linked yet: the play screen asks you to link the phones, and nothing is dealt',unl.link&&!unl.g,unl);
    const g0=await G(H);ok('Linked: the host deals round 1, everyone picks a word',g0&&g0.phase==='pick'&&g0.ps.length===4&&g0.round===1&&g0.timer===60,g0&&{ph:g0.phase,n:g0.ps.length});
    const pick=[];for(let i=0;i<4;i++)pick.push(await PG[i].evaluate(()=>({card:document.querySelectorAll('.tscard .tsslot').length,hit:document.querySelectorAll('.tscard .tsslot.hit').length,die:!!document.querySelector('.tsdie')})));
    ok('Pick: each phone shows its own card, 6 slots, the rolled one highlighted, and the die',pick.every(x=>x.card===6&&x.hit===1&&x.die),pick);
    const tv0=await view(TV);ok('Big board: the “Just watching” phone shows the big board, no card',tv0.big&&!/tscard/.test(tv0.txt)&&/choosing a secret word/.test(tv0.txt),tv0.txt.slice(0,200));
    const o={tag:'four',shots:true,right:true,blankTry:true};const r=await playRound(PG,H,TV,ids,o);await W(2000);
    ok('A whole round: pick, sketch, guess, Big Reveal, round over',r.g.phase==='roundEnd'&&!r.stuck,{ph:r.g.phase,stuck:r.stuck});
    ok('Sketches were drawn on the real pad (4 players: 2 sketch steps × 4)',r.padOK>=8&&Object.values(r.g.books).every(B=>B.pages.length===4&&B.pages[0].kind==='draw'&&B.pages[0].d.length>10),r.padOK);
    ok('Even players: you sketch your own word first',r.g.ps.every(p=>r.g.books[p].pages[0].by===p));
    ok('Never leave a guess blank: an empty guess is refused with the hint',/blank/i.test(o.blankErr||''),o.blankErr);
    const tot=r.g.ps.reduce((a,p)=>a+(r.g.score[p][0]||0),0),fav=r.g.fav||{s:{}};
    ok('Friendly scoring: each book gave a ⭐ sketch and a ⭐ guess point (8 or more points, favourites tallied)',tot>=8&&Object.values(fav.s).reduce((a,b)=>a+b,0)===4,{tot,fav});
    const re=[];for(const p of [...PG,TV])re.push(await p.evaluate(()=>({t:!!document.querySelector('.tstab'),n:!!document.querySelector('[data-a=tsunextround]')})));
    ok('Round end: every screen shows the scores; phones get Next round / Stop, the big board doesn’t',re.slice(0,4).every(x=>x.t&&x.n)&&re[4].t&&!re[4].n,re);
    await PG[2].evaluate(()=>document.querySelector('[data-a=tsustop]').click());await W(1500);
    const d=await G(H);ok('Stop: the game ends',d.phase==='done',d.phase);
    await H.evaluate(()=>document.querySelector('[data-a=finish]').click());await W(1500);
    const res=await H.evaluate(()=>({scr:S.screen,tot:act().map(p=>tsTot(p)),rec:S.tsrec,txt:document.getElementById('app').innerText.slice(0,400)}));
    ok('Finish: results show everyone’s totals',res.scr!=='score'&&res.tot.reduce((a,b)=>a+b,0)===tot&&res.rec.scoring==='friendly',res);
    await H.screenshot({path:`${SHOT}/results.png`});
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---- 5 phones (odd), Competitive, 30 s timer that runs out for one player ---- */
  {const {PG,H,ids,TV}=await setup(browser,['Ann','Bob','Cy','Di','Eve'],{scoring:'competitive',timer:30});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('five'+i+': '+e.message)));
    const o={tag:'five',right:true,skipDraw:ids[3]};const r=await playRound(PG,H,TV,ids,o);const g=r.g;
    ok('5 players: a whole round to the end',g.phase==='roundEnd'&&!r.stuck,{ph:g.phase,stuck:r.stuck});
    ok('Odd players: your book passes first (someone else sketches your word), 4 pages, last page a guess',g.ps.every(p=>g.books[p].pages.length===4&&g.books[p].pages[0].by!==p&&g.books[p].pages[3].kind==='guess'));
    ok('Sketch timer: the host closes the step after time runs out; the slow player’s page is left blank',r.timeupSeen&&o.timeupBlank,{t:r.timeupSeen,b:o.timeupBlank});
    ok('Competitive: matching guesses score (pre-ticked), and the owner can untick one',g.ps.reduce((a,p)=>a+(g.score[p][0]||0),0)>0&&o.untick&&o.untick.flipped,o.untick);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  ok('Privacy: no phone ever showed another player’s secret word or a sketch it shouldn’t see yet',!leaks.length,leaks.slice(0,6));
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
