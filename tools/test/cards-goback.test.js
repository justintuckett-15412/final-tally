// Go back + "why not?" in the trick-taking card games (Hearts, Spades, Oh Hell, Rook, Rage, Tripoley), one phone, pass-and-play.
const {chromium,W,ok,done,BASE}=require('./link.js');
const START=(game,n,cfg)=>{window.__htfast=1;SET.toursOff=true;switchGame(game);resetScores();cfg();
  const P=S.players;P.forEach((p,i)=>{p.on=i<n;p.name=i<n?['Ann','Ben','Cal','Dee'][i]:'';delete p.bot});save();
  const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
(async()=>{const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  const ev=(f,a)=>page.evaluate(f,a);const tap=async sel=>{await page.click(sel);await W(150)};
  const bid=async sel=>{await tap(sel);await tap(sel)};/* bids are tap to pick, tap again to confirm */
  const has=sel=>ev(s=>!!document.querySelector(s),sel);
  const showFor=async pid=>{await tap(`[data-a$="show"][data-k="${pid}"]`)};
  const waitG=async k=>{for(let i=0;i<60;i++){if(await ev(k=>!!S[k]&&!cgStale(S[k]),k))return;await W(100)}};
  const ids=()=>ev(()=>act().map(p=>p.id));

  /* ---------------- Spades: bids ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('spades',4,()=>{const X=SDX();X.play=true;X.teams=false;X.nil=true;X.blind=false})})()");
  await W(300);await waitG('sdg');let P=await ids();
  let g=await ev(()=>({bt:S.sdg.bidTurn,ph:S.sdg.phase}));
  ok('spades: bidding starts',g.ph==='bid',g);
  const b1=g.bt;await showFor(b1);await bid('[data-a="sdbid"][data-k="2"]');
  const b2=await ev(()=>S.sdg.bidTurn);
  ok('spades: after a bid the next person’s hand-off shows Go back for the bidder',await has(`[data-a="sdundo"][data-k="${b1}"]`));
  await tap(`[data-a="sdundo"][data-k="${b1}"]`);
  g=await ev(id=>({bid:S.sdg.bids[id],bt:S.sdg.bidTurn,grid:!!document.querySelector('[data-a="sdbid"]')}),b1);
  ok('spades: Go back takes the bid back and shows the bid buttons again',g.bid===undefined&&g.bt===b1&&g.grid,g);
  await bid('[data-a="sdbid"][data-k="3"]');await showFor(b2);await bid('[data-a="sdbid"][data-k="1"]');
  ok('spades: once the next person bids, the first bid is final',!(await has(`[data-a="sdundo"][data-k="${b1}"]`))&&await ev(()=>S.sdg.bk&&S.sdg.bk.p)===b2);
  // finish the bids, then the first card ends Go back
  for(let i=0;i<4;i++){const s=await ev(()=>({ph:S.sdg.phase,bt:S.sdg.bidTurn}));if(s.ph!=='bid')break;await ev(id=>{SDVIEW=id;render()},s.bt);await bid('[data-a="sdbid"][data-k="2"]')}
  g=await ev(()=>({ph:S.sdg.phase,bk:!!S.sdg.bk,turn:S.sdg.turn}));ok('spades: Go back stays after the last bid until a card is played',g.ph==='play'&&g.bk,g);
  await ev(t=>{SDVIEW=t;const g=S.sdg;const c=sdLegal(g,t)[0];lkq('sdPlay',t,c);save();render()},g.turn);
  ok('spades: playing a card ends Go back',!(await ev(()=>S.sdg.bk)));
  // why not: follow suit
  const why=await ev(()=>{const g=S.sdg,t=g.turn;SDVIEW=t;const led=g.t[0].c[1];const h=g.h[t];if(!h.some(c=>c[1]===led)||h.every(c=>c[1]===led))return {skip:1};render();
    const d=document.querySelector('[data-a="sdcard"][aria-disabled="true"]');return {note:(document.querySelector('.uxwhy')||{}).textContent||'',title:d&&d.title}});
  ok('spades: greyed cards say why (must follow suit)',why.skip||/Must follow suit/.test(why.note)&&/Must follow suit/.test(why.title||''),why);

  /* ---------------- Hearts: passing ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('hearts',4,()=>{const X=HTX();X.play=1})})()");
  await W(300);await waitG('htg');P=await ids();
  g=await ev(()=>({ph:S.htg.phase}));ok('hearts: first hand passes',g.ph==='pass',g);
  await showFor(P[0]);
  const three=await ev(id=>S.htg.h[id].slice(0,3),P[0]);
  for(const c of three)await tap(`[data-a="htcard"][data-c="${c}"]`);
  await tap('[data-a="htpass"]');
  ok('hearts: after passing, the next hand-off offers Go back',await has(`[data-a="htunpass"][data-k="${P[0]}"]`));
  await tap(`[data-a="htunpass"][data-k="${P[0]}"]`);
  g=await ev(id=>({sel:S.htg.sel[id],picked:[...document.querySelectorAll('[data-a="htcard"][aria-pressed="true"]')].map(b=>b.dataset.c)}),P[0]);
  ok('hearts: Go back takes the pass back with the same 3 cards still picked',!g.sel&&g.picked.length===3&&three.every(c=>g.picked.includes(c)),g);
  await tap('[data-a="htpass"]');
  for(const id of P.slice(1)){await showFor(id);const cs=await ev(id=>S.htg.h[id].slice(0,3),id);for(const c of cs)await tap(`[data-a="htcard"][data-c="${c}"]`);await tap('[data-a="htpass"]')}
  await W(600);
  g=await ev(()=>({ph:S.htg.phase,btn:!!document.querySelector('[data-a="htunpass"]')}));ok('hearts: after the swap there is no Go back',g.ph==='play'&&!g.btn,g);
  const hw=await ev(()=>{const g=S.htg,t=g.turn;HTVIEW=t;render();const d=document.querySelector('[data-a="htcard"][aria-disabled="true"]');return {note:(document.querySelector('.uxwhy')||{}).textContent||'',title:d&&d.title}});
  ok('hearts: first lead says why the other cards are greyed',/2 of clubs leads the first trick/.test(hw.note)&&/2 of clubs/.test(hw.title||''),hw);

  /* ---------------- Oh Hell: bids at once, and the hook rule ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('ohell',3,()=>{const X=OHX();X.play=true;X.hook=false;X.order='down';X.top=5})})()");
  await W(300);await waitG('ohg');P=await ids();
  await showFor(P[0]);await bid('[data-a="ohbid"][data-k="1"]');
  ok('oh hell: with bids at once, the next hand-off offers Go back',await has(`[data-a="ohundo"][data-k="${P[0]}"]`));
  await tap(`[data-a="ohundo"][data-k="${P[0]}"]`);
  ok('oh hell: Go back removes the hidden bid',await ev(id=>S.ohg.bids[id]===undefined&&!!document.querySelector('[data-a="ohbid"]'),P[0]));
  await bid('[data-a="ohbid"][data-k="2"]');await showFor(P[1]);await bid('[data-a="ohbid"][data-k="0"]');await showFor(P[2]);await bid('[data-a="ohbid"][data-k="0"]');
  await W(300);ok('oh hell: once every bid is in, nobody can go back',await ev(ids=>ids.every(id=>!ohCanUndo(S.ohg,id)),P));
  // hook rule: dealer bids last; banned bid says why
  const hk=await ev(()=>{OHX().hook=true;S.hr=0;ohDeal(0);const g=S.ohg,P=act();g.bids={};g.bidTurn=ohNext(g.dealer);
    const a=g.bidTurn;ohBid(a,1);const can=ohCanUndo(g,a);const b=g.bidTurn;lkq('ohUndo',a);const back=g.bids[a]===undefined&&g.bidTurn===a;
    ohBid(a,1);ohBid(g.bidTurn,1);const ok3=!ohCanUndo(g,a);while(g.bidTurn&&g.bidTurn!==g.dealer)ohBid(g.bidTurn,0);OHVIEW=g.dealer;render();
    const d=document.querySelector('[data-a="ohbid"][disabled]');return {can,back,ok3,title:d&&d.title,note:(document.querySelector('.uxwhy')||{}).textContent||''}});
  ok('oh hell (hook): Go back works until the next player bids',hk.can&&hk.back&&hk.ok3,hk);
  ok('oh hell (hook): the dealer’s greyed bid says why',/Hook rule/.test(hk.title||'')&&/Hook rule/.test(hk.note),hk);

  /* ---------------- Rook: bid and nest ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('rook',4,()=>{const X=RKX();X.play=true;X.layCounters=false})})()");
  await W(300);await waitG('rkg');P=await ids();
  let bt=await ev(()=>S.rkg.bidTurn);await showFor(bt);await bid('[data-a="rkbid"][data-k="70"]');
  ok('rook: after a bid the next hand-off offers Go back',await has(`[data-a="rkundo"][data-k="${bt}"]`));
  await tap(`[data-a="rkundo"][data-k="${bt}"]`);
  ok('rook: Go back takes the bid back',await ev(id=>S.rkg.bids[id]===undefined&&S.rkg.bidTurn===id&&!S.rkg.high,bt));
  // everyone else passes: bidder takes the nest (Go back gone), then lays aside 5 and names trump
  await bid('[data-a="rkbid"][data-k="70"]');
  for(let i=0;i<3;i++){const t=await ev(()=>S.rkg.phase==='bid'?S.rkg.bidTurn:null);if(!t)break;await showFor(t);await bid('[data-a="rkbid"][data-k="pass"]')}
  g=await ev(()=>({ph:S.rkg.phase,bk:!!S.rkg.bk,bidder:S.rkg.bidder}));ok('rook: winning the bid (the nest comes out) ends Go back',g.ph==='nest'&&!g.bk,g);
  await showFor(g.bidder);
  const nw=await ev(()=>({grey:document.querySelectorAll('[data-a="rkcard"][aria-disabled="true"]').length,note:(document.querySelector('.uxwhy')||{}).textContent||''}));
  ok('rook: counters that can’t be laid aside are greyed with a reason (house rule on)',nw.grey===0||/Counters can’t be laid aside/.test(nw.note),nw);
  const lay=await ev(id=>rkLayable(S.rkg.h[id]).slice(0,5),g.bidder);for(const c of lay)await tap(`[data-a="rkcard"][data-c="${c}"]`);
  await tap('[data-a="rktrump"][data-k="G"]');await tap('[data-a="rknest"]');
  const lead=await ev(()=>S.rkg.turn);
  g=await ev(()=>({ph:S.rkg.phase,tr:S.rkg.trump}));ok('rook: nest set, green is trump',g.ph==='play'&&g.tr==='G',g);
  if(lead!==g.bidder){ok('rook: the leader’s hand-off offers Go back for the nest',await has(`[data-a="rkundo"]`));await tap('[data-a="rkundo"]')}
  else{ok('rook: the bidder (who leads) sees Go back',await has('[data-a="rkundo"]'));await tap('[data-a="rkundo"]')}
  g=await ev(()=>({ph:S.rkg.phase,tr:S.rkg.trump,sel:RKSEL.length,rt:RKTR}));ok('rook: Go back returns to the nest with the same 5 cards and trump picked',g.ph==='nest'&&!g.tr&&g.sel===5&&g.rt==='G',g);
  await tap('[data-a="rknest"]');
  await ev(()=>{const g=S.rkg;RKVIEW=g.turn;lkq('rkPlay',g.turn,rkLegal(g,g.turn)[0]);save();render()});
  ok('rook: the first card ends Go back',!(await ev(()=>S.rkg.bk)));

  /* ---------------- Rage: turn-order bids, wild picker ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('rage',3,()=>{const X=RGX();X.play=true;X.bidAll=false;X.fore=false;X.start=5})})()");
  await W(300);await waitG('rgg');
  bt=await ev(()=>S.rgg.bidTurn);await showFor(bt);await bid('[data-a="rgbid"][data-k="1"]');
  ok('rage: after a bid the next hand-off offers Go back',await has(`[data-a="rgundo"][data-k="${bt}"]`));
  await tap(`[data-a="rgundo"][data-k="${bt}"]`);
  ok('rage: Go back takes the bid back',await ev(id=>S.rgg.bids[id]===undefined&&S.rgg.bidTurn===id,bt));
  const rb=await ev(()=>{const X=RGX();X.bidAll=true;S.hr=0;rgDeal(0);const g=S.rgg,P=act();rgBid(P[0].id,1);const c1=rgCanUndo(g,P[0].id);LKQF.rgUndo(P[0].id);const back=g.bids[P[0].id]===undefined;
    P.forEach(p=>rgBid(p.id,0));return {c1,back,after:rgCanUndo(g,P[0].id)}});
  ok('rage (bids at once): Go back until everyone is in',rb.c1&&rb.back&&!rb.after,rb);
  const wild=await ev(()=>{const X=RGX();X.bidAll=false;S.hr=0;rgDeal(0);const g=S.rgg,P=act();g.h[P[0].id][0]='W1';P.forEach(p=>g.bids[p.id]=0);g.phase='play';g.turn=P[0].id;g.bidTurn=null;RGVIEW=P[0].id;RGSEL=null;render();return P[0].id});
  await tap('[data-a="rgcard"][data-c="W1"]');
  ok('rage: picking a Wild shows a Go back to pick another card',await has('[data-a="rgdesel"]'));
  await tap('[data-a="rgdesel"]');
  ok('rage: Go back puts the Wild down, nothing played',await ev(id=>RGSEL===null&&S.rgg.h[id].includes('W1')&&!S.rgg.t.length,wild));

  /* ---------------- Tripoley: poker bets ---------------- */
  await ev(START.toString().replace(/^\(game,n,cfg\)=>/,'(()=>{const f=(game,n,cfg)=>')+";f('tripoley',3,()=>{const X=TPX();X.play=true;X.aces=false;X.dead=false;X.payPlay=true;X.poker=true})})()");
  await W(1500);
  g=await ev(()=>({ph:S.tqg&&S.tqg.phase,t:S.tqg&&S.tqg.pk&&S.tqg.pk.turn}));ok('tripoley: poker round starts',g.ph==='poker',g);
  await ev(()=>{S.tqg.ann=null;render()});
  const t1=g.t;await showFor(t1);
  const pw=await ev(()=>({dis:!!document.querySelector('[data-a="tqpbet"][data-k="check"][disabled]'),note:(document.querySelector('.uxwhy')||{}).textContent||''}));
  ok('tripoley: bets are greyed until 5 cards are picked, and say so',pw.dis&&/Pick your 5 cards first/.test(pw.note),pw);
  const five=await ev(id=>tqSort(S.tqg.h[id]).slice(0,5),t1);for(const c of five)await tap(`[data-a="tqpcard"][data-c="${c}"]`);
  await tap('[data-a="tqpbet"][data-k="bet"][data-v="1"]');
  g=await ev(()=>({t:S.tqg.pk.turn,bet:S.tqg.pk.bet}));
  ok('tripoley: after a bet the next hand-off offers Go back',g.bet>0&&await has(`[data-a="tqpundo"][data-k="${t1}"]`),g);
  await tap(`[data-a="tqpundo"][data-k="${t1}"]`);
  g=await ev(id=>({t:S.tqg.pk.turn,bet:S.tqg.pk.bet,five:!!(S.tqg.pk.five||{})[id]}),t1);
  ok('tripoley: Go back takes the bet back (chips and 5 cards too)',g.t===t1&&g.bet===0&&!g.five,g);
  for(const c of five)await tap(`[data-a="tqpcard"][data-c="${c}"]`);await tap('[data-a="tqpbet"][data-k="check"]');
  const t2=await ev(()=>S.tqg.pk.turn);await showFor(t2);
  const f2=await ev(id=>tqSort(S.tqg.h[id]).slice(0,5),t2);for(const c of f2)await tap(`[data-a="tqpcard"][data-c="${c}"]`);await tap('[data-a="tqpbet"][data-k="check"]');
  ok('tripoley: once the next player acts, the first check is final',await ev(([a,b])=>!cgBkCan(S.tqg,a)&&cgBkCan(S.tqg,b),[t1,t2]));

  ok('no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
