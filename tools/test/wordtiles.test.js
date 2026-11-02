// Word Tiles: tiles and squares, placing and scoring (cross words, bonus squares, blanks, all 7 tiles), the first move, rules for placement,
// swapping, passing, the end of the game, computer players, a move through the screen, Ask the table, two linked phones and the score sheet.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const start=async(P,o)=>P.evaluate(o=>{window.__htfast=1;SET.toursOff=true;switchGame('wordtiles');resetScores();Object.assign(WTX(),{play:1,bingo:50,vote:1},o.x||{});S.players.forEach((p,i)=>{p.on=i<o.n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=(o.bots||[])[i]||null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()},o);
(async()=>{const browser=await chromium.launch();const errs=[];let P=await mk(browser,'wt');P.on('pageerror',e=>errs.push(e.message));
  await start(P,{n:2});await W(800);
  const R=await P.evaluate(async()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};await wtDict();
    const fresh=()=>{wtDeal();const g=S.wtg;return g},row=(r,c,w,o={})=>w.split('').map((l,k)=>({i:o.v?(r+k)*15+c:r*15+c+k,l,b:(o.b||[]).includes(k)?1:0}));
    t('100 tiles, 7 each, 2 blanks; 15×15 board with 8 triple-word, 17 double-word (incl. ★), 12 triple-letter, 24 double-letter squares',()=>{const g=fresh();const n=g.bag.length+g.ps.reduce((a,p)=>a+g.rack[p].length,0);const c=t=>Object.values(WTSQ).filter(x=>x===t).length;return {ok:n===100&&g.ps.every(p=>g.rack[p].length===7)&&Object.values(WTDIST).reduce((a,b)=>a+b,0)===100&&WTDIST['?']===2&&c('tw')===8&&c('dw')===17&&c('tl')===12&&c('dl')===24}});
    t('First move must cover the ★; score with the double word',()=>{const g=fresh();const off=wtScore(g,row(0,0,'cat'));const on=wtScore(g,row(7,6,'cat'));return {ok:!!off.err&&on.pts===10&&on.words[0].w==='cat',on}});
    t('Placement: one line, no gaps, must join; cross words count; bonus squares only for new tiles',()=>{const g=fresh();row(7,6,'cat').forEach(t=>g.bd[t.i]=[t.l,0]);
      const diag=wtScore(g,[{i:8*15+8,l:'a',b:0},{i:9*15+9,l:'t',b:0}]).err,gap=wtScore(g,[{i:8*15+3,l:'a',b:0},{i:8*15+5,l:'t',b:0}]).err,far=wtScore(g,row(0,0,'at')).err;
      const v=wtScore(g,row(8,8,'o',{v:1}).concat(row(9,8,'x',{v:1})));/* "tox"? not a word, but scored: t(on board)+o+x */const cats=wtScore(g,[{i:7*15+9,l:'s',b:0}]);
      return {ok:!!diag&&!!gap&&!!far&&cats.words[0].w==='cats'&&cats.pts===6,v:v.words.map(w=>w.w),cats}});
    t('Blank scores 0; all 7 tiles adds 50',()=>{const g=fresh();const S0=wtScore(g,row(7,4,'quietly',{b:[0]}));return {ok:S0.bingo===50&&S0.words[0].pts===(1+1+1+1+1+4)*2&&S0.pts===S0.words[0].pts+50,S0}});
    t('Words not in the list are flagged; the rack must hold the tiles',()=>{const g=fresh();g.rack[g.turn]=['z','q','x','j','v','k','w'];const S0=wtScore(g,row(7,6,'zqx'));return {ok:S0.bad.includes('zqx')&&!wtPlay(g,g.turn,row(7,6,'zqx'))&&!wtPlay(g,g.turn,row(7,6,'cat'))}});
    t('A play refills the rack; swap needs 7 in the bag; six scoreless turns end the game',()=>{const g=fresh(),p=g.turn;g.rack[p]=['c','a','t','e','r','s','x'];const b0=g.bag.length;const a=wtPlay(g,p,row(7,6,'cat'))&&g.rack[p].length===7&&g.bag.length===b0-3&&g.turn!==p;
      const q=g.turn;const sw=wtSwap(g,q,g.rack[q].slice(0,2));g.bag=g.bag.slice(0,5);const no=!wtSwap(g,g.turn,g.rack[g.turn].slice(0,1));for(let k=0;k<5;k++)wtPass(g,g.turn);return {ok:a&&sw&&no&&g.phase==='done'}});
    t('Going out: the player out scores the others’ tiles; they lose theirs',()=>{const g=fresh(),[p,q]=g.ps;g.turn=p;g.bag=[];g.rack[p]=['c','a','t'];g.rack[q]=['q','z'];g.sc[p]=0;g.sc[q]=0;wtPlay(g,p,row(7,6,'cat'));return {ok:g.phase==='done'&&g.sc[p]===10+20&&g.sc[q]===-20,sc:g.sc}});
    t('Ask the table: more yes than no allows the word for the rest of the game',()=>{const g=fresh(),[p,q]=g.ps;g.turn=p;g.rack[p]=['b','l','e','r','g','e','r'];const asked=wtAsk(g,p,row(7,6,'blerg'));const ph=g.phase;const v=wtVote(g,q,1);return {ok:asked&&ph==='vote'&&v&&g.phase==='play'&&g.ok.blerg&&g.bd[7*15+6]&&g.sc[p]>0,ph}});
    t('Computer players finish 2- and 4-player games with real words and all 100 tiles accounted for',()=>{const bad=[];for(const n of [2,4]){S.players.forEach((x,i)=>{x.on=i<n;x.bot=['easy','normal','hard','hard'][i]});const g=fresh();let k=0;while(g.phase!=='done'&&k++<300){const q=act().find(x=>x.id===g.turn);const n0=g.n;wtBotStep(g,q);if(g.n===n0){bad.push('stuck');break}}if(g.phase!=='done')bad.push('no end '+n);
      const at=(r,c)=>r<0||c<0||r>14||c>14?null:g.bd[r*15+c];for(let r=0;r<15;r++)for(let c=0;c<15;c++)for(const [dr,dc] of [[0,1],[1,0]]){if(!at(r,c)||at(r-dr,c-dc))continue;let w='',rr=r,cc=c;while(at(rr,cc)){w+=at(rr,cc)[0];rr+=dr;cc+=dc}if(w.length>1&&!wtIsWord(g,w))bad.push(w)}
      const tiles=g.bag.length+g.ps.reduce((a,p)=>a+g.rack[p].length,0)+g.bd.filter(x=>x).length;if(tiles!==100)bad.push('tiles '+tiles)}S.players.forEach(x=>x.bot=null);return {ok:!bad.length,bad}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));
  // a move through the screen, against a computer player
  await P.close();P=await mk(browser,'wt2');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:2,bots:[null,'easy']});await W(1200);
  const mv=await P.evaluate(async()=>{await wtDict();const g=S.wtg,me=act()[0].id;g.turn=me;g.rack[me]=['h','o','u','s','e','a','t'];render();
    const tapR=k=>document.querySelector(`[data-a="wtprack"][data-k="${k}"]`).click(),tapC=i=>document.querySelector(`[data-a="wtpcell"][data-k="${i}"]`).click();
    tapR(0);tapC(112);tapR(1);tapC(113);tapR(2);tapC(114);tapR(3);tapC(115);tapR(4);tapC(116);const prev=document.querySelector('[data-a="wtpplay"]').textContent;
    tapC(116);const back=WTPEND.length===4;tapR(4);tapC(116);document.querySelector('[data-a="wtpplay"]').click();return {prev,back,sc:g.sc[me],bd:!!g.bd[112],turn:g.turn!==me}});
  ok('From the screen: tap tile then square, take one back, see the score, play HOUSE for 18 (★ doubles, E on a 2L)',mv.back&&/\+18/.test(mv.prev)&&mv.sc===18&&mv.bd&&mv.turn,mv);
  await W(3500);ok('The computer player answers with a move (or a swap)',await P.evaluate(()=>S.wtg.turn===act()[0].id&&!!S.wtg.last&&S.wtg.last.p===act()[1].id));
  // two people on one phone: handoff and Ask the table
  await P.close();P=await mk(browser,'wt3');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:2});await W(1000);
  const ask=await P.evaluate(async()=>{await wtDict();const g=S.wtg,p=g.turn,q=g.ps.find(x=>x!==p);g.rack[p]=['b','l','e','r','g','x','x'];render();if(!document.querySelector('[data-a="wtpshow"]'))return 'no handoff';document.querySelector('[data-a="wtpshow"]').click();
    ['b','l','e','r','g'].forEach((l,k)=>{document.querySelector(`[data-a="wtprack"][data-k="${k}"]`).click();document.querySelector(`[data-a="wtpcell"][data-k="${110+k}"]`).click()});const a=document.querySelector('[data-a="wtpask"]');if(!a)return 'no ask';a.click();
    if(g.phase!=='vote')return 'no vote';document.querySelector('[data-a="wtpshow"]').click();document.querySelector('[data-a="wtpvote"][data-k="1"]').click();return g.phase==='play'&&g.ok.blerg&&g.sc[p]>0?true:[g.phase,g.sc[p]]});
  ok('One phone: pass the phone; Ask the table; the other player votes yes; BLERG is played',ask===true,ask);
  // linked phones
  const H=await mk(browser,'host'),G=await mk(browser,'guest');[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('wordtiles');resetScores();Object.assign(WTX(),{play:1});const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);await readyAll([H,G]);
  const first=await H.evaluate(()=>S.wtg.turn);const Ph=first===ids[0]?H:G,Po=first===ids[0]?G:H;
  await H.evaluate(f=>{const g=S.wtg;g.rack[f]=['d','o','g','s','x','x','x'];g.n++;save();render()},first);await W(1500);
  await Ph.evaluate(async()=>{await wtDict();['d','o','g'].forEach((l,k)=>{document.querySelector(`[data-a="wtprack"][data-k="${k}"]`).click();document.querySelector(`[data-a="wtpcell"][data-k="${111+k}"]`).click()});document.querySelector('[data-a="wtpplay"]').click()});await W(3000);
  ok('Linked: a move on one phone shows on both; the turn passes',await Po.evaluate(f=>{const g=S.wtg;return !!g.bd[112]&&g.turn!==f&&g.sc[f]>0},first));
  await Po.evaluate(()=>document.querySelector('[data-a="wtppass"]').click());await W(2500);
  ok('Linked: the other phone passes; back to the first player',await Ph.evaluate(f=>S.wtg.turn===f&&S.wtg.zeros===1,first));
  const SC=await mk(browser,'sheet');SC.on('pageerror',e=>errs.push(e.message));await SC.evaluate(()=>{SET.toursOff=true;switchGame('wordtiles');resetScores();WTX().play=0;S.players.forEach((p,i)=>{p.on=i<2;p.name=['A','B'][i]});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(600);
  ok('Score sheet: turns and tiles left add up',await SC.evaluate(()=>{const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))};set(document.querySelector('[data-wtf="0:0"]'),'24');render();set(document.querySelector('[data-wtf="0:1"]'),'10');set(document.querySelector('[data-wtf="0:end"]'),'-4');return wtTot(act()[0])===30}));
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
