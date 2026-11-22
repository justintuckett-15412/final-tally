// Beyond Balderdash over linked phones: 4 phones + a "Just watching" big board play real rounds with typing and taps:
// category pick, bluffs (two identical), a bluff that is the real answer (flagged, marked basically correct), votes, reveal points
// checked against the rules, pieces move, Double Score next round, a cancelled card (2 basically correct), the win (order from the
// Dasher's left breaks a tie at FINISH), results. Then a 2-player game in Kids mode (kid questions only, no Initials).
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
async function typeBluff(p,t){await p.fill('#bdin',t);await p.click('#bdform button[type=submit]')}
const tap=(p,sel)=>p.click(sel,{timeout:5000}).then(()=>true).catch(e=>{console.log('tap fail',sel,e.message.split('\n')[0]);return false});
/* the expected points for the card just revealed, worked out here from what was played */
function expected(g,before){const D=g.ps[g.di],two=g.ps.length===2,V=two?g.ps.filter(p=>p!==D):g.ps.filter(p=>p!==D&&!g.bc[p]),e={};g.ps.forEach(p=>e[p]=before[p]||0);
  if(two){const A=g.ans[g.votes[V[0]]];if(A.real)e[V[0]]+=2;else e[D]+=1}
  else{let f=false;V.forEach(v=>{const A=g.ans[g.votes[v]];if(A.real){e[v]+=2;f=true}else Object.keys(g.bl).forEach(w=>{if(w!==v&&!g.bc[w]&&norm(g.bl[w])===norm(A.t))e[w]+=1})});if(V.length&&!f)e[D]+=3}
  return e}
(async()=>{const browser=await chromium.launch();const errs=[];
  {const {PG,H,ids,TV,unl}=await setup(browser,['Mom','Dad','Kate','Sam'],{choose:'dasher',db:0,steps:27,x2:14,kids:0,tlim:0});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('four'+i+': '+e.message)));
    const pg=pid=>PG[ids.indexOf(pid)];
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
    await tap(pg(C),`[data-a=bduvote][data-k="${bi}"]`);await W(3000);
    g=await G(H);let exp=expected(g,{[A]:3});
    ok('Reveal: points follow the rules (3 basically correct, 2 for the real answer, 1 for a vote on an identical bluff, own vote 0)',g.phase==='reveal'&&g.ps.every(p=>(g.res.gain[p]||0)===exp[p])&&exp[A]===3&&exp[B]===3&&exp[C]===0&&exp[D]===0,{gain:g.res.gain,exp});
    ok('Pieces move; landing exactly on step 14 = Double Score next round',g.pos[A]===14&&g.res.x2next[A]===1&&g.x2n[A]===1&&g.pos[B]===3,g.pos);
    const rvl=await view(pg(C));ok('Reveal screen: real answer, who wrote each bluff, who voted, points, double-score note',/The real answer/.test(rvl.txt)&&/Bluff by/.test(rvl.txt)&&/Votes:/.test(rvl.txt)&&/landed on Double Score/.test(rvl.txt));
    const pcs=await TV.evaluate(()=>[...document.querySelectorAll('[data-bdpc]')].map(e=>e.dataset.bdpc+'@'+e.querySelector('title').textContent));
    ok('Board staircase shows every meeple on its step',pcs.length===4&&pcs.some(x=>x.startsWith(A+'@')&&/step 14/.test(x)),pcs);
    await shot2(pg(C),'reveal');await shot2(TV,'staircase','.bdstairs');
    /* round 2: a cancelled card (2 basically correct), then a new card, nobody finds the real answer; A's points double */
    await tap(pg(B),'[data-a=bdunext]');await W(3000);g=await G(H);const D2=g.ps[g.di];
    ok('Next round: the Dasher moves to the left',g.phase==='cat'&&g.round===2&&g.ps.indexOf(D2)===(g.ps.indexOf(D)+1)%4,{d:D2});
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
    await W(1500);await tap(pg(X3),`[data-a=bduvote][data-k="${g.ans.findIndex(a=>/zebra/i.test(a.t))}"]`);await W(3000);
    g=await G(H);exp=expected(g,rp2);const gainExp=Object.fromEntries(g.ps.map(p=>[p,exp[p]*(p===A?2:1)]));
    ok('Nobody found the real answer: Dasher +3; votes score; Double Score doubles A’s points',g.phase==='reveal'&&exp[D2]===3&&g.ps.every(p=>g.res.gain[p]===gainExp[p])&&g.res.dbl[A]===1,{gain:g.res.gain,gainExp});
    ok('Reveal notes the doubling',/counted double this round/.test((await view(pg(D2))).txt));
    /* round 3: two players can reach FINISH; the first in order from the Dasher's left wins */
    await tap(pg(A),'[data-a=bdunext]');await W(3000);g=await G(H);const D3=g.ps[g.di],ord=g.ps.map((_,k)=>g.ps[(g.di+1+k)%4]);
    await H.evaluate(o=>{o.forEach(p=>S.bdg.pos[p]=Math.min(S.bdg.pos[p],10));S.bdg.pos[o[0]]=26;S.bdg.pos[o[1]]=26;S.bdg.x2n={};save()},ord);await W(1500);
    await tap(pg(D3),'[data-a=bducat][data-k=people]');await W(2500);
    for(const p of ord.slice(0,3))await typeBluff(pg(p),'Invented the Snorkelwhistle '+p.slice(-3));await W(3500);
    await tap(pg(D3),'[data-a=bdushow]');await W(3000);g=await G(H);const real=g.ans.findIndex(a=>a.real);
    await tap(pg(ord[0]),`[data-a=bduvote][data-k="${real}"]`);await tap(pg(ord[1]),`[data-a=bduvote][data-k="${real}"]`);await W(1200);await tap(pg(ord[2]),`[data-a=bduvote][data-k="${real}"]`);await W(3000);
    g=await G(H);ok('Two reach FINISH in one round: the first from the Dasher’s left wins, the next one doesn’t move',g.winner===ord[0]&&g.pos[ord[0]]===27&&g.pos[ord[1]]===26,{w:g.winner,o:ord,pos:g.pos});
    await tap(pg(ord[2]),'[data-a=bdunext]');await W(3000);g=await G(H);ok('See who won: the game is over',g.phase==='done');
    await TV.screenshot({path:`${SHOT}/board-done.png`});
    await tap(H,'[data-a=finish]');await W(2000);
    const res=await H.evaluate(()=>({scr:S.screen,rec:S.bdrec,tot:act().map(p=>bdTot(p)),txt:document.getElementById('app').innerText.slice(0,500)}));
    ok('Finish: results with the winner first',res.scr!=='score'&&res.rec.win===g.winner&&res.tot.filter(t=>t===27).length===1,res);
    await H.screenshot({path:`${SHOT}/results.png`,fullPage:true});
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---- 2 players, Kids mode ---- */
  {const {PG,H,ids,TV}=await setup(browser,['Ann','Bob'],{choose:'dasher',laws:2,db:0,steps:27,x2:14,kids:1,tlim:0});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('two'+i+': '+e.message)));
    const pg=pid=>PG[ids.indexOf(pid)];let kidsOK=true,twoOK=true,initOK=true;
    for(let r=0;r<2;r++){let g=await G(H);const D=g.ps[g.di],O=g.ps.find(p=>p!==D);
      const cats=await pg(D).evaluate(()=>[...document.querySelectorAll('[data-a=bducat]')].map(b=>b.dataset.k));if(cats.includes('initials')||cats.includes('dates')||cats.length!==4||!cats.includes('laws'))initOK=false;if(g.q2&&g.q2.c==='dates')initOK=false;
      await tap(pg(D),`[data-a=bducat][data-k=${['words','laws'][r]}]`);await W(2500);g=await G(H);
      if(g.phase!=='read'||g.q2.qs.length!==3)twoOK=false;if(!g.q2.qs.every(x=>BDQK[g.q2.c][x.i]))kidsOK=false;
      await privacy(PG,TV,'2p:read');if(r===0)await shot2(pg(D),'two-read');
      await tap(pg(D),'[data-a=bduread][data-k="1"]');await W(2500);g=await G(H);
      if(g.phase!=='vote'||g.ans.length!==3)twoOK=false;if(r===0)await shot2(pg(O),'two-vote');
      const want=r===0?g.ans.findIndex(a=>a.real):g.ans.findIndex(a=>!a.real);await tap(pg(O),`[data-a=bduvote][data-k="${want}"]`);await W(3000);g=await G(H);
      if(g.phase!=='reveal')twoOK=false;else{const gn=g.res.gain;if(r===0&&!(gn[O]===2&&!gn[D]))twoOK=false;if(r===1&&!(gn[D]===1&&!gn[O]))twoOK=false}
      await tap(pg(O),'[data-a=bdunext]');await W(3000)}
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
