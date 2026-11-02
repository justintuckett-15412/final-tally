// Boggle and Big Boggle: cubes, tracing words, scoring, duplicates, the word list, challenges and votes, rounds, turn mode on one phone,
// computer players, a round played through the screen (drag and type), two linked phones, and the score sheet.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const start=async(P,o)=>P.evaluate(o=>{window.__htfast=1;SET.toursOff=true;switchGame('boggle');resetScores();Object.assign(BGX(),{play:1,size:4,min:3,mins:3,rounds:2},o.x||{});S.players.forEach((p,i)=>{p.on=i<o.n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=(o.bots||[])[i]||null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()},o);
(async()=>{const browser=await chromium.launch();const errs=[];let P=await mk(browser,'bg');P.on('pageerror',e=>errs.push(e.message));
  await start(P,{n:2});await W(800);
  const R=await P.evaluate(async()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    await bgDict();await bgCommon();const ids=act().map(p=>p.id);
    t('Cubes: 16 for Boggle and 25 for Big Boggle, 6 faces each; a roll uses every cube once',()=>{const a=BGDICE[4].every(d=>d.length===6)&&BGDICE[4].length===16&&BGDICE[5].length===25&&BGDICE[5].every(d=>d.length===6);const r=bgRoll(5);return {ok:a&&r.length===25&&r.every(c=>/^([A-Z]|Qu|Th|In|Er|He|An)$/.test(c))}});
    t('Tracing: touching cubes (corners too), each cube once; Qu is one cube',()=>{const g=['C','A','T','S','Q','I','E','R','N','O','P','L','D','G','H','M'];const a=bgTrace(g,'cats'),b=!!bgTrace(g,'quiet'),c=bgTrace(g,'catt')===null;const g2=['Q','I','T','E','X','X','X','X','X','X','X','X','X','X','X','X'];const d=!!bgTrace(g2,'quite');const e=bgTrace(['A','B','X','X','X','X','X','X','X','X','X','X','X','X','X','X'],'aba')===null;return {ok:!!a&&a.length===4&&b&&c&&d&&e,a,b,c,d,e}});
    t('Points: 3–4 letters 1, 5: 2, 6: 3, 7: 5, 8+: 11; Big Boggle needs 4 letters',()=>({ok:[bgPts('cat',3),bgPts('cats',3),bgPts('crate',3),bgPts('crates',3),bgPts('scatter',3),bgPts('scatters',3),bgPts('cat',4),bgPts('cats',4)].join()==='1,1,2,3,5,11,0,1'}));
    t('Word list: ENABLE loaded (170k words); computer players use only common words',()=>({ok:BGD.a.length>160000&&BGD.s.has('quiet')&&BGD.s.has('zebras')&&!BGD.s.has('qat')&&BGC.a.length>15000&&BGC.a.every(w=>BGD.s.has(w)),n:BGD.a.length,c:BGC.a.length}));
    const g=bgG();g.grid=['C','A','T','S','R','E','D','O','N','T','H','G','I','L','U','P'];g.phase='play';g.seq=0;g.t0=Date.now();g.words={};g.sub={};
    t('A round: words are checked against the cubes; duplicates cancel; the word list marks the rest',()=>{const nonw=(()=>{for(let k=0;k<5000;k++){let i=Math.floor(Math.random()*16);const p=[i];while(p.length<4){const n=bgAdj(4,p[p.length-1]).filter(j=>!p.includes(j));if(!n.length)break;p.push(n[Math.floor(Math.random()*n.length)])}const w=p.map(i=>bgCellTxt(g.grid[i])).join('');if(w.length===4&&!BGD.s.has(w))return w}})();window.__nonw=nonw;bgSubmit(g,ids[0],['cats','care','CARED!','dog','xyzz','cats','zzzz']);bgSubmit(g,ids[1],['care','tread',nonw]);const w0=g.words[ids[0]];const tr=w0.includes('cats')&&w0.includes('cared')&&w0.includes('dog')&&!w0.includes('xyzz')&&!w0.includes('zzzz')&&w0.length===4;bgClose(g);const R0=g.res[ids[0]],f=w=>R0.find(x=>x.w===w);return {ok:tr&&g.phase==='review'&&f('care').st==='dup'&&f('cats').st==='ok'&&f('cats').pts===1&&f('cared').pts===2,w0,R0}});
    t('Challenge: everyone votes; majority wins, a tie keeps the word list’s answer',()=>{const N=window.__nonw,w=g.res[ids[1]].find(x=>x.w===N);const bad=w&&w.st==='bad';bgChallenge(g,ids[1],N);bgVote(g,ids[0],N,0);bgVote(g,ids[1],N,1);const tie=g.ch[N].done&&g.ov[N]===false;
      bgChallenge(g,ids[0],'cats');bgVote(g,ids[0],'cats',0);bgVote(g,ids[1],'cats',0);const out=g.ov.cats===false&&g.res[ids[0]].find(x=>x.w==='cats').pts===0;return {ok:bad&&tie&&out,bad,tie,out}});
    t('Scoring the round writes the points; the last round ends the game',()=>{const pts=bgRoundPts(g,ids[0]);bgNext(g,ids[0]);const a=g.phase==='ready'&&g.r===1&&bgR(act()[0],0)===pts;bgShake(g,ids[0]);g.ps.forEach(p=>bgSubmit(g,p,[]));bgClose(g);bgNext(g,ids[0]);return {ok:a&&g.phase==='done'&&bgTot(act()[0])===pts,pts,ph:g.phase}});
    t('Computer players: their words are real, on the cubes, long enough and common',()=>{const bad=[];for(let i=0;i<30;i++){const G={grid:bgRoll(4),min:3};['easy','normal','hard'].forEach(lv=>bgBotWords(G,lv).forEach(w=>{if(!BGD.s.has(w)||!bgTrace(G.grid,w)||w.length<3||!BGC.s.has(w))bad.push(w)}))}return {ok:!bad.length,bad:bad.slice(0,5)}});
    t('Classic Edition Big Boggle: 25 cubes, one double-letter cube (Qu, Th, In, Er, He, An)',()=>{const d=BGDICE[5].filter(x=>Array.isArray(x));let seen=false;for(let i=0;i<200;i++)if(bgRoll(5).some(c=>c.length===2))seen=true;return {ok:d.length===1&&d[0].join()==='Qu,Th,In,Er,He,An'&&seen}});
    t('Double letters: one cube, used in order (“that” with Th; not “right”), 2 letters for points',()=>{const G=['Th','A','T','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'];const G2=['R','I','G','X','X','Th','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'];const a=bgTrace(G,'that'),b=bgTrace(G2,'right')===null;return {ok:!!a&&a.length===3&&b&&bgPts('that',4)===1,a,b}});
    t('First to a target: the game ends after the round someone reaches it',()=>{const X=BGX();Object.assign(X,{end:'target',target:10});bgDeal();const g=bgG();bgShake(g,ids[0]);g.grid=['C','A','T','S','R','E','D','O','N','T','H','G','I','L','U','P'];g.ps.forEach(p=>g.sub[p]=0);bgSubmit(g,ids[0],['cats','cared','tread','store']);bgSubmit(g,ids[1],[]);bgClose(g);bgNext(g,ids[0]);const mid=g.phase;
      bgShake(g,ids[0]);g.grid=['C','A','T','S','R','E','D','O','N','T','H','G','I','L','U','P'];bgSubmit(g,ids[0],['cats','cared','tread','redo','read','dear','rated']);bgSubmit(g,ids[1],[]);bgClose(g);bgNext(g,ids[0]);Object.assign(X,{end:'rounds'});return {ok:g.target===10&&(bgTot(act()[0])>=10?g.phase==='done':g.phase==='ready'),mid,tot:bgTot(act()[0]),ph:g.phase}});
    t('Handicap: a younger player also scores 3-letter words in Big Boggle',()=>{const X=BGX();Object.assign(X,{size:5,min:4,hc:{[ids[1]]:1}});bgDeal();const g=bgG();bgShake(g,ids[0]);g.grid=['C','A','T','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X','X'];bgSubmit(g,ids[0],['cat']);bgSubmit(g,ids[1],['cat'].concat([]));
      const a=(g.words[ids[0]]||[]).length===0&&(g.words[ids[1]]||[]).length===1;bgClose(g);const pts=bgRoundPts(g,ids[1]);Object.assign(X,{size:4,min:3,hc:{}});return {ok:a&&pts===1,a,pts}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));
  // a round through the screen with two computer players
  await P.close();P=await mk(browser,'bg2');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:3,bots:[null,'normal','hard'],x:{rounds:1}});await W(800);
  await P.evaluate(()=>document.querySelector('[data-a="bgpshake"]').click());await W(500);
  const words=await P.evaluate(async()=>{await bgDict();await bgCommon();const g=S.bgg;g.dur=600;return bgSolve(g.grid,BGC.a,BGC.s,g.min).sort((a,b)=>b.length-a.length).slice(0,3)});
  const path=await P.evaluate(w=>bgTrace(S.bgg.grid,w),words[0]);const pts=await P.evaluate(path=>path.map(i=>{const r=document.querySelector(`.bggrid.live .bgc[data-bgi="${i}"]`).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}),path);
  await P.mouse.move(...pts[0]);await P.mouse.down();for(const q of pts.slice(1))await P.mouse.move(q[0],q[1],{steps:6});await P.mouse.up();await W(200);
  ok('From the screen: drag across the cubes to add a word',await P.evaluate(w=>bgLW(S.bgg,act()[0].id).includes(w),words[0]),words[0]);
  // tap mode: tap cubes one by one, then the last again
  const p2=await P.evaluate(w=>bgTrace(S.bgg.grid,w),words[1]);for(const i of p2)await P.evaluate(i=>{const el=document.querySelector(`.bggrid.live .bgc[data-bgi="${i}"]`),r=el.getBoundingClientRect(),o={bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1};el.dispatchEvent(new PointerEvent('pointerdown',o));document.dispatchEvent(new PointerEvent('pointerup',o))},i);
  await P.evaluate(i=>{const el=document.querySelector(`.bggrid.live .bgc[data-bgi="${i}"]`),r=el.getBoundingClientRect(),o={bubbles:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1};el.dispatchEvent(new PointerEvent('pointerdown',o));document.dispatchEvent(new PointerEvent('pointerup',o))},p2[p2.length-1]);
  ok('From the screen: tap the cubes, then the last one again',await P.evaluate(w=>bgLW(S.bgg,act()[0].id).includes(w),words[1]),words[1]);
  await P.fill('#bg-type',words[2]);await P.press('#bg-type','Enter');await W(200);
  ok('From the screen: type a word; one that isn’t on the cubes is refused',await P.evaluate(w=>bgLW(S.bgg,act()[0].id).includes(w),words[2])&&(await P.fill('#bg-type','qqqq'),await P.press('#bg-type','Enter'),await W(100),await P.evaluate(()=>!bgLW(S.bgg,act()[0].id).includes('qqqq'))));
  await P.evaluate(()=>{S.bgg.t0=Date.now()-S.bgg.dur*1000+1500});await W(4000);
  ok('Time’s up: the list is sent and the round is checked',await P.evaluate(()=>S.bgg.phase==='review'&&S.bgg.words[act()[0].id].length===3&&!!document.querySelector('.bgres .bgw')));
  await P.evaluate(()=>document.querySelector('.bgw:not([disabled])').click());await W(150);await P.evaluate(()=>document.querySelector('[data-a="bgpch"]').click());await W(200);
  const ch=await P.evaluate(()=>{const w=Object.keys(S.bgg.ch)[0];document.querySelector('[data-a="bgpvote"][data-k$="|1"]').click();return !!(w&&S.bgg.ch[w].done)});
  ok('From the screen: challenge a word and vote',ch===true,ch);
  await P.evaluate(()=>document.querySelector('[data-a="bgpnext"]').click());await W(400);
  ok('Last round scored: game over with Finish & reveal',await P.evaluate(()=>S.bgg.phase==='done'&&!!document.querySelector('[data-a="finish"]')&&act().every(p=>bgR(p,0)!==null)));
  await P.evaluate(()=>document.querySelector('[data-a="finish"]').click());await W(1200);
  ok('Results and awards screen opens',await P.evaluate(()=>S.finished||S.screen==='results'||/Results/.test(document.body.textContent)));
  // one phone, two people: turns with the same cubes
  await P.close();P=await mk(browser,'bg3');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:2,x:{rounds:1}});await W(800);
  const seq=await P.evaluate(async()=>{await bgDict();await bgCommon();document.querySelector('[data-a="bgpshake"]').click();const g=S.bgg;if(!g.seq)return 'not turn mode';const b=document.querySelectorAll('[data-a="bgpstart"]');if(b.length!==2)return 'no start buttons';b[0].click();
    const V=bgViewer();if(!V||V.id!==act()[0].id)return 'wrong viewer';const w=bgSolve(g.grid,BGC.a,BGC.s,g.min)[0];bgAddWord(g,V.id,w);document.querySelector('[data-a="bgpdone"]').click();await new Promise(r=>setTimeout(r,300));
    const b2=document.querySelectorAll('[data-a="bgpstart"]');if(b2.length!==1)return 'second start missing';b2[0].click();if(bgViewer().id!==act()[1].id)return 'viewer 2';bgAddWord(g,act()[1].id,w);document.querySelector('[data-a="bgpdone"]').click();await new Promise(r=>setTimeout(r,1500));
    return S.bgg.phase==='review'&&S.bgg.res[act()[0].id][0].st==='dup'?true:S.bgg.phase});
  ok('One phone, two people: each takes a turn with the same cubes; the same word cancels',seq===true,seq);
  // Big Boggle
  await P.close();P=await mk(browser,'bg4');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:2,bots:[null,'easy'],x:{size:5,min:4}});await W(800);
  ok('Big Boggle: 5×5 cubes, words of 4 letters',await P.evaluate(()=>{document.querySelector('[data-a="bgpshake"]').click();const g=S.bgg;return g.size===5&&g.grid.length===25&&g.min===4&&document.querySelectorAll('.bggrid.live .bgc').length===25}));
  // two linked phones
  const H=await mk(browser,'host'),G=await mk(browser,'guest');[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('boggle');resetScores();Object.assign(BGX(),{play:1,size:4,min:3,mins:3,rounds:2});const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);await readyAll([H,G]);
  await G.evaluate(()=>{const b=document.querySelector('[data-a="bgpshake"]');if(b)b.click()});await W(2500);
  const same=await H.evaluate(()=>S.bgg&&S.bgg.phase==='play'&&S.bgg.grid.join(''))===await G.evaluate(()=>S.bgg&&S.bgg.grid&&S.bgg.grid.join(''));
  ok('Linked: the guest shakes; both phones show the same cubes',same);
  const wl=await H.evaluate(async()=>{await bgCommon();const g=S.bgg;return bgSolve(g.grid,BGC.a,BGC.s,g.min).sort((a,b)=>b.length-a.length).slice(0,4)});
  await H.evaluate(w=>{const g=S.bgg;bgAddWord(g,bgViewer().id,w[0]);bgAddWord(g,bgViewer().id,w[1])},wl);await G.evaluate(w=>{const g=S.bgg;bgAddWord(g,bgViewer().id,w[1]);bgAddWord(g,bgViewer().id,w[2])},wl);
  ok('Linked: each phone keeps its own words hidden until time’s up',await G.evaluate(()=>!S.bgg.words[act()[0].id]&&bgLW(S.bgg,bgViewer().id).length===2));
  await G.evaluate(()=>document.querySelector('[data-a="bgpdone"]').click());await H.evaluate(()=>document.querySelector('[data-a="bgpdone"]').click());for(let i=0;i<40;i++){await W(250);const hp=await H.evaluate(()=>S.bgg.phase+JSON.stringify(S.bgg.sub)),gp=await G.evaluate(()=>S.bgg.phase+JSON.stringify(S.bgg.sub));if(gp.startsWith('review'))break}
  const rv=await G.evaluate(w=>{const g=S.bgg;if(!g||g.phase!=='review')return g&&g.phase;const me=bgViewer().id,R=g.res[me];return R.find(x=>x.w===w[1]).st==='dup'&&R.find(x=>x.w===w[2]).st!=='dup'},wl);
  ok('Linked: both lists reach the host; the shared word cancels on both',rv===true,rv);
  await G.evaluate(w=>{BGCH=w;render();document.querySelector('[data-a="bgpch"]').click()},wl[2]);await W(1500);
  await H.evaluate(w=>document.querySelector(`[data-a="bgpvote"][data-k$="|${w}|0"]`).click(),wl[2]);await G.evaluate(w=>document.querySelector(`[data-a="bgpvote"][data-k$="|${w}|0"]`).click(),wl[2]);await W(1500);
  ok('Linked: a challenge from the guest, both vote reject: the word is out',await H.evaluate(w=>S.bgg.ch[w]&&S.bgg.ch[w].done&&S.bgg.ov[w]===false,wl[2]));
  await H.evaluate(()=>document.querySelector('[data-a="bgpnext"]').click());await W(1500);
  ok('Linked: round 1 scored on both phones',await G.evaluate(()=>S.bgg.phase==='ready'&&S.bgg.r===1&&act().every(p=>bgR(p,0)!==null)));
  // score sheet
  const SC=await mk(browser,'sheet');SC.on('pageerror',e=>errs.push(e.message));await SC.evaluate(()=>{SET.toursOff=true;switchGame('boggle');resetScores();BGX().play=0;BGX().rounds=3;S.players.forEach((p,i)=>{p.on=i<2;p.name=['A','B'][i]});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(600);
  const sh=await SC.evaluate(()=>{const I=document.querySelectorAll('[data-bgf]');if(I.length!==6)return 'inputs '+I.length;const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};set(I[0],'5');set(I[1],'7');set(I[3],'4');return bgTot(act()[0])===12&&bgTot(act()[1])===4?true:[bgTot(act()[0]),bgTot(act()[1])]});
  ok('Score sheet: points per round add up',sh===true,sh);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
