// Beyond Balderdash over linked phones: 4 phones + a "Just watching" big board play real rounds with typing and taps:
// category pick, bluffs (two identical), a bluff that is the real answer (flagged, marked basically correct), votes, reveal points
// checked against the rules, pieces move, Double Score next round, a cancelled card (2 basically correct), the win (order from the
// Dasher's left breaks a tie at FINISH), results. Then a 2-player game in Kids mode (kid questions only, no Initials).
// The step-by-step reveal (default 5 s per answer): every phone and the board show each bluff (writer, who it fooled) in the same
// order without taps, the real answer last, then the full reveal; Next skips, pause holds. The round then waits for the Dasher to pass
// (a non-Dasher can't), and each phone pages through the round's cards on its own. "All at once" goes straight to the full reveal.
// Privacy on every step: no phone shows another's bluff or the real answer before the reveal; the board never shows writers early.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/bd-shots';fs.mkdirSync(SHOT,{recursive:true});
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const ids=await H.evaluate(([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('bdstart');Object.assign(BDX(),o);bdKeep();const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();c('start');return P.slice(0,N.length).map(p=>p.id)},[names,o]);
  const unl=await H.evaluate(()=>({link:/Link the phones/.test(document.getElementById('app').innerText),g:!!S.bdg}));
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  const TV=await mk(browser,'TV'+names.length);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  await W(2000);return {PG,H,ids,TV,unl}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.bdg)));
const view=p=>p.evaluate(()=>({me:S.lk.me,txt:document.getElementById('app').innerText+'\n'+((document.getElementById('bdfx')||{}).innerText||''),
  chipsInAns:document.querySelectorAll('#app .bdansb .bdchip').length,realTag:document.querySelectorAll('#app .bdtag.real').length,fx:!!document.getElementById('bdfx'),big:document.documentElement.classList.contains('bdbigv')}));
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const has=(txt,s)=>s&&norm(txt).includes(norm(s));
const leaks=[];
async function privacy(PG,TV,tag){const g=await G(PG[0]);if(!g||!['cat','write','review','read','vote'].includes(g.phase))return;const D=g.ps[g.di];
  for(const p of [...PG,TV]){const v=await view(p),me=v.me||'';const who=me||'TV';
    if(g.phase==='write'||g.phase==='review'){
      for(const o of Object.keys(g.bl)){if(o===me)continue;if(me===D&&g.phase==='review')continue;if(me&&g.bl[me]&&norm(g.bl[me])===norm(g.bl[o]))continue;
        if(has(v.txt,g.bl[o]))leaks.push([tag,who,'bluff of '+o])}
      if(g.q&&me!==D&&!(me&&g.bl[me]&&has(g.bl[me],g.q.a))&&has(v.txt,g.q.a))leaks.push([tag,who,'real answer'])}
    if(g.phase==='read'&&me!==D&&g.q2&&g.q2.qs.some(x=>has(v.txt,x.a)))leaks.push([tag,who,'2p answers early']);
    if(g.phase==='vote'){if(v.chipsInAns)leaks.push([tag,who,'writers shown']);if(v.realTag&&me!==D)leaks.push([tag,who,'real marked'])}}}
async function shot2(p,name,sel){if(sel)await p.evaluate(s=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block:'center'})},sel);await p.screenshot({path:`${SHOT}/${name}-400.png`});await p.setViewportSize({width:360,height:640});await W(400);if(sel)await p.evaluate(s=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block:'center'})},sel);await p.screenshot({path:`${SHOT}/${name}-360.png`});await p.setViewportSize({width:400,height:850});await W(200)}
/* the step-by-step reveal: wait for each step on the host, then read every screen */
const NM={};
async function rvWatch(H,all,o={}){const seen=all.map(()=>[]),bad=[];let g=await G(H);if(!g.rv)return {seen,bad,ord:[],g};
  const ord=[...g.ans.keys()].filter(i=>!g.ans[i].real).concat([...g.ans.keys()].filter(i=>g.ans[i].real));
  for(let k=0;k<ord.length;k++){const t0=Date.now();while(Date.now()-t0<12000){g=await G(H);if(!g.rv||g.rv.i>=k)break;await W(150)}
    if(!g.rv||g.rv.i!==k){bad.push('host skipped step '+k);continue}
    await W(900);const A=g.ans[ord[k]],pick=g.ps.filter(p=>g.res.votes[p]===ord[k]),fooled=pick.filter(p=>!A.by.includes(p));
    for(let j=0;j<all.length;j++){const v=await all[j].evaluate(()=>{const e=document.querySelector('#app .bdrvstep');return e?{i:+e.dataset.bdrv,t:e.innerText,bar:!!document.querySelector('#app .bdauto .bdautobar')}:null});
      if(!v){bad.push(`screen ${j} step ${k}: no step card`);continue}seen[j].push(v.i);
      if(v.i!==k||!has(v.t,A.t)||!v.bar)bad.push(`screen ${j} step ${k}: wrong card`);
      if(A.real){if(!/The real answer!/.test(v.t)||(pick.length?!pick.every(p=>v.t.includes(NM[p])):!(g.ps.length>2?/Nobody found it/:/missed it/).test(v.t)))bad.push(`screen ${j} real step`)}
      else if(g.ps.length>2){if(!/Written by/.test(v.t)||!A.by.every(p=>v.t.includes(NM[p]))||(pick.length?!/Picked by/.test(v.t)||/Fooled nobody/.test(v.t)||!pick.every(p=>v.t.includes(NM[p]))||pick.filter(p=>A.by.includes(p)).length!==(v.t.match(/\(own answer\)/g)||[]).length:!/Fooled nobody/.test(v.t)))bad.push(`screen ${j} bluff step ${k}: ${v.t.replace(/\n/g,' | ')}`)}
      else if(!(pick.length?/Picked by/.test(v.t):/Nobody picked it/.test(v.t)))bad.push(`screen ${j} 2p step ${k}`)}
    if(o.shot&&o.shot[A.real?'real':'bluff']){await shot2(o.shot[A.real?'real':'bluff'].p,o.shot[A.real?'real':'bluff'].n);delete o.shot[A.real?'real':'bluff']}
    if(o.at)await o.at(k,g,ord)}
  const t1=Date.now();while(Date.now()-t1<12000){g=await G(H);if(!g.rv)break;await W(200)}await W(1000);return {seen,bad,ord,g}}
async function waitFull(H){const t=Date.now();while(Date.now()-t<60000){const g=await G(H);if(g.phase!=='reveal'||!g.rv)break;await W(300)}await W(1000)}
async function typeBluff(p,t){await p.fill('#bdin',t);await p.click('#bdform button[type=submit]')}
const tap=(p,sel)=>p.click(sel,{timeout:5000}).then(()=>true).catch(e=>{console.log('tap fail',sel,e.message.split('\n')[0]);return false});
/* the expected points for the card just revealed, worked out here from what was played */
function expected(g,before){const D=g.ps[g.di],two=g.ps.length===2,V=two?g.ps.filter(p=>p!==D):g.ps.filter(p=>p!==D&&!g.bc[p]),e={};g.ps.forEach(p=>e[p]=before[p]||0);
  if(two){const A=g.ans[g.votes[V[0]]];if(A.real)e[V[0]]+=2;else e[D]+=1}
  else{let f=false;V.forEach(v=>{const A=g.ans[g.votes[v]];if(A.real){e[v]+=2;f=true}else Object.keys(g.bl).forEach(w=>{if(w!==v&&!g.bc[w]&&norm(g.bl[w])===norm(A.t))e[w]+=1})});if(V.length&&!f)e[D]+=3}
  return e}
(async()=>{const browser=await chromium.launch();const errs=[];
  {const {PG,H,ids,TV,unl}=await setup(browser,['Mom','Dad','Kate','Sam'],{choose:'dasher',db:0,steps:27,x2:14,kids:0,tlim:0});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('four'+i+': '+e.message)));
    const pg=pid=>PG[ids.indexOf(pid)];Object.assign(NM,await H.evaluate(()=>Object.fromEntries(act().map(p=>[p.id,nm(p)]))));
    ok('Not linked yet: the play screen asks you to link the phones, nothing is dealt',unl.link&&!unl.g,unl);
    let g=await G(H);ok('Linked: the host deals; a Dasher is picked and chooses a category',g&&g.phase==='cat'&&g.ps.length===4&&g.round===1,g&&g.phase);
    let D=g.ps[g.di];const tv0=await view(TV);
    ok('Big board: shows who is choosing, never the category buttons',tv0.big&&/is choosing a category/.test(tv0.txt)&&!(await TV.$('[data-a=bducat]')),tv0.txt.slice(0,200));
    const others=g.ps.filter(p=>p!==D),oth0=await view(pg(others[0]));ok('Other phones: “… is choosing a category”',/is choosing a category/.test(oth0.txt));
    await shot2(pg(D),'category');
    ok('Box categories: the Dasher has the 5 box categories, never ⚖️ Laws',(await pg(D).$$('[data-a=bducat]')).length===5&&!(await pg(D).$('[data-a=bducat][data-k=laws]')));
    await tap(pg(D),'[data-a=bducat][data-k=words]');await W(2500);g=await G(H);
    ok('Category picked: a Words card, everyone writes',g.phase==='write'&&g.q.c==='words',g.phase);
    const dv=await view(pg(D));ok('The Dasher sees the real answer; it says only they can see it',has(dv.txt,g.q.a)&&/only you can see this/.test(dv.txt));
    await privacy(PG,TV,'r1:write0');
    /* round 1: A writes the real answer (flagged + pre-marked), B and C write the same bluff two ways */
    const [A,B,C]=others;await H.evaluate(a=>{S.bdg.pos[a]=11;save()},A);await W(1500);
    await typeBluff(pg(B),'A tiny Zorblax fish');await W(2500);
    await shot2(pg(C),'typing');
    const cw=await view(pg(C));ok('Writing: phones show “✓” for who has written, never what',/Mom|Dad|Kate|Sam/.test(cw.txt)&&!has(cw.txt,'Zorblax'),cw.txt.slice(0,300));
    await privacy(PG,TV,'r1:write1');
    await typeBluff(pg(C),'a TINY zorblax fish!');await W(1500);await typeBluff(pg(A),g.q.a.toUpperCase()+'.');await W(3000);
    g=await G(H);ok('All bluffs in: the Dasher reviews',g.phase==='review',g.phase);
    ok('A bluff that is the real answer is flagged “looks correct” and pre-marked',g.lk[A]&&g.bc[A]);
    const rv=await view(pg(D));ok('Dasher review shows every bluff with the flag',has(rv.txt,'Zorblax')&&/Looks like the real answer/.test(rv.txt));
    await privacy(PG,TV,'r1:review');
    await shot2(pg(D),'review');
    await tap(pg(D),'[data-a=bdushow]');await W(3000);g=await G(H);
    ok('Show the answers: identical bluffs show once, the basically-correct one is set aside (2 answers)',g.phase==='vote'&&g.ans.length===2&&g.ans.find(a=>!a.real).by.length===2,g.ans);
    ok('The basically-correct player doesn’t vote',/basically correct/.test((await view(pg(A))).txt)&&!(await pg(A).$('[data-a=bduvote]')));
    await privacy(PG,TV,'r1:vote');
    const ri=g.ans.findIndex(a=>a.real),bi=1-ri;
    await tap(pg(B),`[data-a=bduvote][data-k="${ri}"]`);await W(2500);
    await shot2(pg(C),'voting');
    await privacy(PG,TV,'r1:vote2');
    await tap(pg(C),`[data-a=bduvote][data-k="${bi}"]`);await W(1500);
    g=await G(H);ok('Default reveal setting: one at a time, 5 seconds per answer',g.o.rv===5&&g.phase==='reveal'&&g.rv&&g.rv.i===0,g.o);
    const tR=Date.now(),W1=await rvWatch(H,[...PG,TV],{shot:{bluff:{p:pg(C),n:'step-bluff'},real:{p:pg(C),n:'step-real'}}});
    ok('Step-by-step reveal: every phone and the board show the same answer at each step with no taps (bluff: writer + who it fooled; the real answer last, who found it)',!W1.bad.length&&W1.seen.every(x=>JSON.stringify(x)===JSON.stringify([0,1]))&&W1.g.ans[W1.ord[1]].real,W1.bad.slice(0,4));
    {const bi2=W1.ord[0],Ab=W1.g.ans[bi2];ok('Merged bluff (Dad + Kate, Kate voted it): “Picked by Kate (own answer)”, never “Fooled nobody”',Ab.by.length===2&&W1.g.res.votes[C]===bi2&&!W1.bad.length,W1.bad.slice(0,2))}
    ok('It moves on by itself about every 5 seconds, then the full reveal',!W1.g.rv&&Date.now()-tR>8500&&Date.now()-tR<20000&&!!(await pg(C).$('#app .bdtab')),Date.now()-tR);
    await W(1500);g=await G(H);let exp=expected(g,{[A]:3});
    ok('Reveal: points follow the rules (3 basically correct, 2 for the real answer, 1 for a vote on an identical bluff, own vote 0)',g.phase==='reveal'&&g.ps.every(p=>(g.res.gain[p]||0)===exp[p])&&exp[A]===3&&exp[B]===3&&exp[C]===0&&exp[D]===0,{gain:g.res.gain,exp});
    ok('Pieces move; landing exactly on step 14 = Double Score next round',g.pos[A]===14&&g.res.x2next[A]===1&&g.x2n[A]===1&&g.pos[B]===3,g.pos);
    const rvl=await view(pg(C)),rvt=await view(TV);ok('Reveal screen: the question card, points, double-score note on the phone; the board lists who wrote each bluff and who voted',/The real answer/.test(rvl.txt)&&/landed on Double Score/.test(rvl.txt)&&/Bluff by/.test(rvt.txt)&&/Votes:/.test(rvt.txt));
    /* the round waits for the Dasher */
    const nx=g.ps[(g.di+1)%4];await W(4000);g=await G(H);
    ok('After the reveal the round waits (4 s later it is still round 1)',g.phase==='reveal'&&g.round===1&&!g.rv);
    const dp=await view(pg(D));ok('The Dasher sees “Pass the Dasher to …”; the others see who they are waiting for',(await pg(D).$('[data-a=bdunext]'))&&dp.txt.includes('Pass the Dasher to '+NM[nx])&&!(await pg(C).$('[data-a=bdunext]'))&&rvl.txt.includes('Waiting for '+NM[D]),dp.txt.slice(0,200));
    await pg(C).evaluate(()=>bdSend({a:'next'}));await W(2500);g=await G(H);ok('A non-Dasher can’t pass the Dasher',g.phase==='reveal'&&g.round===1);
    /* each phone pages through the round's cards on its own */
    const cv=async p=>p.evaluate(()=>{const e=document.querySelector('#app .bdcv');return e?{i:+e.dataset.bdcv,t:e.innerText}:null});
    await tap(pg(C),'.bdcv [data-a=bducv][data-k="1"]');await W(300);await tap(pg(C),'.bdcv [data-a=bducv][data-k="1"]');await W(1200);
    const cvC=await cv(pg(C)),cvB=await cv(pg(B)),cvD=await cv(pg(D));
    ok('Cards: a phone pages to the 2nd answer card (writer / who found it shown); other phones stay on the question card',cvC&&cvC.i===2&&cvB&&cvB.i===0&&cvD&&cvD.i===0&&/Written by|Found by/.test(cvC.t),{cvC,b:cvB&&cvB.i,d:cvD&&cvD.i});
    await shot2(pg(C),'cards','.bdcv');
    await tap(pg(C),'.bdcv [data-a=bducv][data-k="-1"]');await W(400);ok('Cards: ◀ goes back',(await cv(pg(C))).i===1);
    await shot2(pg(B),'pass-wait','.bdpassw');await shot2(pg(D),'pass','.bdpass');
    const pcs=await TV.evaluate(()=>[...document.querySelectorAll('[data-bdpc]')].map(e=>e.dataset.bdpc+'@'+e.querySelector('title').textContent));
    ok('Board staircase shows every meeple on its step',pcs.length===4&&pcs.some(x=>x.startsWith(A+'@')&&/step 14/.test(x)),pcs);
    await shot2(pg(C),'reveal');await shot2(TV,'staircase','.bdstairs');
    /* round 2: a cancelled card (2 basically correct), then a new card, nobody finds the real answer; A's points double */
    await tap(pg(D),'[data-a=bdunext]');await W(3000);g=await G(H);const D2=g.ps[g.di];
    ok('The Dasher passes: the next round starts with the next Dasher (to the left)',g.phase==='cat'&&g.round===2&&D2===nx&&g.ps.indexOf(D2)===(g.ps.indexOf(D)+1)%4,{d:D2});
    await tap(pg(D2),'[data-a=bducat][data-k=movies]');await W(2500);g=await G(H);
    const W2=g.ps.filter(p=>p!==D2);const X1=W2.includes(A)?A:W2[0],X2=W2.find(p=>p!==X1),X3=W2.find(p=>p!==X1&&p!==X2);
    await typeBluff(pg(X1),'Something close to '+g.q.a);await typeBluff(pg(X2),'Pretty much: '+g.q.a);await typeBluff(pg(X3),'Glorptastic Quibble thing');await W(3500);
    await privacy(PG,TV,'r2:review');
    await tap(pg(D2),`[data-a=bdubc][data-k="${X1}:1"]`);await W(2000);await tap(pg(D2),`[data-a=bdubc][data-k="${X2}:1"]`);await W(2500);
    const cbtn=await pg(D2).evaluate(()=>(document.querySelector('[data-a=bdushow]')||{}).textContent||'');ok('Two basically correct: the button cancels the card',/Cancel this card/.test(cbtn),cbtn);
    await tap(pg(D2),'[data-a=bdushow]');await W(3000);g=await G(H);
    ok('Cancelled card: both get 3, the same Dasher picks a new card, every phone shows why',g.phase==='cat'&&g.ps[g.di]===D2&&g.rp[X1]===3&&g.rp[X2]===3&&g.cx&&/Card cancelled/.test((await view(pg(X3))).txt),{ph:g.phase,rp:g.rp});
    const rp2={...g.rp};
    await tap(pg(D2),'[data-a=bducat][data-k=dates]');await W(2500);g=await G(H);
    await typeBluff(pg(X1),'Flimflam Zebra parade');await typeBluff(pg(X2),'The Wobbly Bridge opened');await typeBluff(pg(X3),'Great Moose Escape');await W(3500);
    await privacy(PG,TV,'r2b:review');
    await tap(pg(D2),'[data-a=bdushow]');await W(3000);g=await G(H);
    const mz=g.ans.findIndex(a=>/moose/i.test(a.t));await tap(pg(X1),`[data-a=bduvote][data-k="${mz}"]`);await tap(pg(X2),`[data-a=bduvote][data-k="${mz}"]`);
    await W(1500);await tap(pg(X3),`[data-a=bduvote][data-k="${g.ans.findIndex(a=>/zebra/i.test(a.t))}"]`);await W(1200);
    /* pause holds the step on every screen; Next skips ahead */
    let pz=null,nxs=null;
    const W2r=await rvWatch(H,[...PG,TV],{at:async(k,gg)=>{if(k!==0)return;await tap(pg(D2),'[data-a=bdurvpause][data-k="1"]');await W(5500);const h=await G(H);
      const scr=await Promise.all([...PG,TV].map(p=>p.evaluate(()=>{const e=document.querySelector('#app .bdrvstep');return [e?+e.dataset.bdrv:-1,/Paused/.test((document.querySelector('#app .bdauto')||{}).innerText||'')]})));
      pz={i:h.rv&&h.rv.i,scr};await TV.screenshot({path:`${SHOT}/board-step.png`});
      await tap(pg(D2),'[data-a=bdurvpause][data-k="0"]');await W(300);const t=Date.now();await tap(pg(D2),'[data-a=bdurvnext]');
      while(Date.now()-t<4000){const h2=await G(H);if(h2.rv&&h2.rv.i===1)break;await W(100)}nxs=Date.now()-t}});
    ok('Pause holds: 5.5 s later the reveal is still on answer 1 on every phone and the board, showing “Paused”',pz&&pz.i===0&&pz.scr.every(([i,p])=>i===0&&p),pz);
    ok('Next ▶ (the Dasher) skips ahead at once',nxs!=null&&nxs<1500,nxs);
    ok('Reveal with 3 bluffs: same order on every screen, real answer last, “Nobody found it”',!W2r.bad.length&&W2r.seen.every(x=>JSON.stringify(x)==='[0,1,2,3]'),W2r.bad.slice(0,4));
    g=await G(H);exp=expected(g,rp2);const gainExp=Object.fromEntries(g.ps.map(p=>[p,exp[p]*(p===A?2:1)]));
    ok('Nobody found the real answer: Dasher +3; votes score; Double Score doubles A’s points',g.phase==='reveal'&&exp[D2]===3&&g.ps.every(p=>g.res.gain[p]===gainExp[p])&&g.res.dbl[A]===1,{gain:g.res.gain,gainExp});
    ok('Reveal notes the doubling',/counted double this round/.test((await view(pg(D2))).txt));
    /* round 3: two players can reach FINISH; the first in order from the Dasher's left wins */
    await tap(pg(D2),'[data-a=bdunext]');await W(3000);g=await G(H);const D3=g.ps[g.di],ord=g.ps.map((_,k)=>g.ps[(g.di+1+k)%4]);
    await H.evaluate(o=>{o.forEach(p=>S.bdg.pos[p]=Math.min(S.bdg.pos[p],10));S.bdg.pos[o[0]]=26;S.bdg.pos[o[1]]=26;S.bdg.x2n={};save()},ord);await W(1500);
    await tap(pg(D3),'[data-a=bducat][data-k=people]');await W(2500);
    for(const p of ord.slice(0,3))await typeBluff(pg(p),'Invented the Snorkelwhistle '+p.slice(-3));await W(3500);
    await tap(pg(D3),'[data-a=bdushow]');await W(3000);g=await G(H);const real=g.ans.findIndex(a=>a.real);
    await tap(pg(ord[0]),`[data-a=bduvote][data-k="${real}"]`);await tap(pg(ord[1]),`[data-a=bduvote][data-k="${real}"]`);await W(1200);await tap(pg(ord[2]),`[data-a=bduvote][data-k="${real}"]`);await W(1500);await waitFull(H);
    g=await G(H);ok('Two reach FINISH in one round: the first from the Dasher’s left wins, the next one doesn’t move',g.winner===ord[0]&&g.pos[ord[0]]===27&&g.pos[ord[1]]===26,{w:g.winner,o:ord,pos:g.pos});
    ok('Game over: no “Pass the Dasher”; anyone can tap “See who won”',!/Pass the Dasher|Waiting for/.test((await view(pg(D3))).txt)&&!!(await pg(ord[2]).$('[data-a=bdunext]')));
    await tap(pg(ord[2]),'[data-a=bdunext]');await W(3000);g=await G(H);ok('See who won: the game is over',g.phase==='done');
    await TV.screenshot({path:`${SHOT}/board-done.png`});
    await tap(H,'[data-a=finish]');await W(2000);
    const res=await H.evaluate(()=>({scr:S.screen,rec:S.bdrec,tot:act().map(p=>bdTot(p)),txt:document.getElementById('app').innerText.slice(0,500)}));
    ok('Finish: results with the winner first',res.scr!=='score'&&res.rec.win===g.winner&&res.tot.filter(t=>t===27).length===1,res);
    await H.screenshot({path:`${SHOT}/results.png`,fullPage:true});
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---- 2 players, Kids mode ---- */
  {const {PG,H,ids,TV}=await setup(browser,['Ann','Bob'],{choose:'dasher',laws:2,db:0,steps:27,x2:14,kids:1,tlim:0,rv:0});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('two'+i+': '+e.message)));
    const pg=pid=>PG[ids.indexOf(pid)];let kidsOK=true,twoOK=true,initOK=true,allOK=null,twoRv=null;Object.assign(NM,await H.evaluate(()=>Object.fromEntries(act().map(p=>[p.id,nm(p)]))));
    for(let r=0;r<2;r++){let g=await G(H);const D=g.ps[g.di],O=g.ps.find(p=>p!==D);
      const cats=await pg(D).evaluate(()=>[...document.querySelectorAll('[data-a=bducat]')].map(b=>b.dataset.k));if(cats.includes('initials')||cats.includes('dates')||cats.length!==4||!cats.includes('laws'))initOK=false;if(g.q2&&g.q2.c==='dates')initOK=false;
      await tap(pg(D),`[data-a=bducat][data-k=${['words','laws'][r]}]`);await W(2500);g=await G(H);
      if(g.phase!=='read'||g.q2.qs.length!==3)twoOK=false;if(!g.q2.qs.every(x=>BDQK[g.q2.c][x.i]))kidsOK=false;
      await privacy(PG,TV,'2p:read');if(r===0)await shot2(pg(D),'two-read');
      await tap(pg(D),'[data-a=bduread][data-k="1"]');await W(2500);g=await G(H);
      if(g.phase!=='vote'||g.ans.length!==3)twoOK=false;if(r===0)await shot2(pg(O),'two-vote');
      if(r===1)await H.evaluate(()=>{S.bdg.o.rv=3;save()});
      const want=r===0?g.ans.findIndex(a=>a.real):g.ans.findIndex(a=>!a.real);await tap(pg(O),`[data-a=bduvote][data-k="${want}"]`);await W(r===0?3000:1000);
      if(r===0){g=await G(H);allOK={o:g.o.rv,rv:g.rv,step:!!(await pg(O).$('#app .bdrvstep')),tab:!!(await pg(O).$('#app .bdtab'))}}
      else{twoRv=await rvWatch(H,[...PG,TV]);await W(1000)}
      g=await G(H);
      if(g.phase!=='reveal')twoOK=false;else{const gn=g.res.gain;if(r===0&&!(gn[O]===2&&!gn[D]))twoOK=false;if(r===1&&!(gn[D]===1&&!gn[O]))twoOK=false}
      await tap(pg(D),'[data-a=bdunext]');await W(3000)}
    ok('“All at once” setting: straight to the full reveal (no steps)',allOK&&allOK.o===0&&!allOK.rv&&!allOK.step&&allOK.tab,allOK);
    ok('Two players: steps through the 3 answers (who picked what), the real one last, on both phones and the board',twoRv&&!twoRv.bad.length&&twoRv.seen.every(x=>JSON.stringify(x)==='[0,1,2]'),twoRv&&twoRv.bad.slice(0,4));
    ok('Two players: 3 questions, the Dasher reads one, right guess +2 / wrong guess +1 to the Dasher',twoOK);
    ok('Two players, “Laws instead of Dates”: no Initials, no Dates, ⚖️ Laws in the picker and playable',initOK);
    ok('Kids mode: only kid questions',kidsOK);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  ok('Privacy: no phone showed another’s bluff or the real answer before the reveal; the board never showed writers',!leaks.length,leaks.slice(0,6));
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
// kid flags straight from the question lists (data.js), for the Kids mode check
const BDQK=(()=>{const s=fs.readFileSync(require('path').join(__dirname,'../bd/data.js'),'utf8');const o=JSON.parse(s.slice(s.indexOf('{'),s.lastIndexOf('}')+1));const r={};for(const c in o)r[c]=o[c].map(x=>!!x[2]);return r})();
