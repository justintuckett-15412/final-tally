// Card games: "Go back" (undo your own turn's steps until something is drawn or the turn passes) and "why not?" notes on greyed choices.
// One phone vs a computer player for DOS, UNO, Five Crowns, Phase 10, Golf, Skyjo and Gnoming A Round, through real taps;
// then Phase 10 on two linked phones (the guest's Go back goes through the host like any other move).
const {mk,chromium,W,ok,done,BASE}=require('./link.js');
const start=(p,game,setx)=>p.evaluate(([game,setx])=>{window.__htfast=1;SET.toursOff=true;switchGame(game);resetScores();(new Function(setx))();
  S.players.forEach((q,i)=>{q.on=i<2;q.name=['Me','Bot'][i]||'';if(i===1)q.bot='normal';else delete q.bot});save();
  const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()},[game,setx]);
const tap=(p,sel)=>p.evaluate(sel=>{const b=document.querySelector(sel);if(!b)return false;b.click();return true},sel);
const has=(p,sel)=>p.evaluate(sel=>!!document.querySelector(sel),sel);
const why=(p,sel)=>p.evaluate(sel=>[...document.querySelectorAll(sel)].map(b=>{const w=b.querySelector('.uxwhy');return (w?w.textContent:'')+'|'+(b.getAttribute('title')||'')}).join(' / '),sel);
(async()=>{const b=await chromium.launch();const errs=[];
  const p=await b.newPage({viewport:{width:412,height:900}});p.on('pageerror',e=>errs.push(e.message));await p.goto(BASE);await W(1200);

  /* ---------- DOS ---------- */
  await start(p,'uno',"UNX().play=1;UNX().ver='dos';");await W(1800);
  const d0=await p.evaluate(()=>{const g=S.ung,me=act()[0].id;g.turn=me;g.ask=null;g.catch=null;g.m={used:{},made:0,bonus:0,dbl:0,drew:false};
    /* a plain number match (not the same color) for the first center card, and a card that matches neither */
    const all=g.deck.concat(g.row),pick=f=>all.find(x=>f(unF(x))&&!used.includes(x)),used=[];const take=f=>{const x=pick(f);used.push(x);return x};
    const t0=take(f=>f.k==='5'),t1=take(f=>f.k==='9'),c=take(f=>f.k==='5'&&f.col!==unF(t0).col),bad=take(f=>f.k==='1');
    g.deck=g.deck.concat(g.row).filter(x=>!used.includes(x));g.row=[t0,t1];g.h[me].push(c,bad);save();render();return {c,bad,me,h:g.h[me].length,deck:g.deck.length}});
  await tap(p,`[data-a=unpcard][data-c="${d0.c}"]`);await tap(p,'[data-a=unprow][data-i="0"]');await W(150);
  let r=await p.evaluate(()=>({made:S.ung.m.made,back:!!document.querySelector('[data-a=unpundo]')}));
  ok('DOS: after a match, Go back shows',r.made===1&&r.back,r);
  await tap(p,`[data-a=unpcard][data-c="${d0.bad}"]`);await W(100);
  const dw=await why(p,'[data-a=unprow][data-i="1"]');
  ok('DOS: a center card your picked card can’t match says why',/Not the same number/.test(dw),dw);
  await tap(p,'[data-a=unpcard][data-c="'+d0.bad+'"]');
  await tap(p,'[data-a=unpundo]');await W(150);
  r=await p.evaluate(c=>{const g=S.ung,me=act()[0].id;return {made:g.m.made,inHand:g.h[me].includes(c),turn:g.turn===me,back:!!document.querySelector('[data-a=unpundo]'),log:(g.lg||[]).some(e=>/went back/.test(e.t))}},d0.c);
  ok('DOS: Go back puts the card back in your hand and un-matches the center card',r.made===0&&r.inHand&&r.turn&&!r.back&&r.log,r);
  await tap(p,'[data-a=unpdraw]');await W(150);
  r=await p.evaluate(()=>({drew:S.ung.m.drew,back:!!document.querySelector('[data-a=unpundo]')}));
  ok('DOS: drawing a card leaves no Go back',r.drew&&!r.back,r);

  /* ---------- UNO (classic): one tap ends the turn, so only "why not?" ---------- */
  await start(p,'uno',"UNX().play=1;UNX().ver='classic';");await W(1800);
  await p.evaluate(()=>{const g=S.ung,me=act()[0].id;g.turn=me;g.pend=null;g.ask=null;g.drawn=null;g.hit=null;g.catch=null;const all=g.deck.concat(...Object.values(g.h)),fr=f=>all.find(x=>f(unF(x)));
    const t=fr(f=>f.col==='r'&&f.k==='5'),a=fr(f=>f.col==='b'&&f.k==='7'),c=fr(f=>f.col==='r'&&f.k==='2');Object.keys(g.h).forEach(k=>g.h[k]=g.h[k].filter(x=>![t,a,c].includes(x)));g.deck=g.deck.filter(x=>![t,a,c].includes(x));
    g.disc.push({c:t,p:me});g.col='r';g.h[me].push(a,c);save();render()});await W(100);
  const uw=await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-a=unpcard][aria-disabled=true]')];return {n:b.length,t:b.map(x=>x.getAttribute('title')).filter(Boolean)}});
  ok('UNO: every greyed card in your hand says why (match the color or number, or play a Wild)',uw.n>0&&uw.t.length===uw.n&&/Match|Wild|Stack|draw/i.test(uw.t[0]),uw);

  /* ---------- Five Crowns ---------- */
  await start(p,'crowns',"FCX().play=1;");await W(1800);
  const f0=await p.evaluate(()=>{const g=S.fcg,me=act()[0].id;g.turn=me;g.drew=0;save();render();return {top:fcTopD(g),h:g.h[me].length,d:g.deck.length}});
  await tap(p,'[data-a=fcptake]');await W(120);
  r=await p.evaluate(()=>({drew:S.fcg.drew,back:!!document.querySelector('[data-a=fcpundo]'),w:(document.querySelector('[data-a=fcpdeck] .uxwhy')||{}).textContent||''}));
  ok('Five Crowns: took the discard: Go back shows, and the deck says why it’s greyed',r.drew&&r.back&&/already drew/.test(r.w),r);
  await tap(p,'[data-a=fcpundo]');await W(120);
  r=await p.evaluate(()=>{const g=S.fcg,me=act()[0].id;return {drew:g.drew,top:fcTopD(g),h:g.h[me].length}});
  ok('Five Crowns: Go back puts the card back on the discard pile',!r.drew&&r.top===f0.top&&r.h===f0.h,r);
  await tap(p,'[data-a=fcpdeck]');await W(120);
  ok('Five Crowns: after drawing from the deck there is no Go back',!(await has(p,'[data-a=fcpundo]'))&&await p.evaluate(()=>!!S.fcg.drew));

  /* ---------- Phase 10 ---------- */
  await start(p,'phase10',"PTX().play=1;PTX().help=1;PTX().arr='self';");await W(1800);
  const z0=await p.evaluate(()=>{const g=S.pzg,me=act()[0].id;g.turn=me;g.drew=0;g.pass=null;if(pzS(pzTop(g)))g.disc.push(g.deck.find(c=>!pzS(c)));save();render();return {top:pzTop(g),h:g.h[me].length}});
  await tap(p,'[data-a=pzptake]');await W(120);
  ok('Phase 10: took the discard: Go back shows',await has(p,'[data-a=pzpundo]'));
  await p.evaluate(()=>{const b=document.querySelector('.fchand [data-a=pzpcard]');b.click()});await W(80);
  const zw=await why(p,'[data-a=pzpstage][disabled]');
  ok('Phase 10: a phase part your picked cards don’t make says why',/Not a /.test(zw),zw);
  await tap(p,'[data-a=pzpundo]');await W(120);
  r=await p.evaluate(()=>{const g=S.pzg,me=act()[0].id;return {drew:g.drew,top:pzTop(g),h:g.h[me].length}});
  ok('Phase 10: Go back puts the card back',!r.drew&&r.top===z0.top&&r.h===z0.h,r);
  await tap(p,'[data-a=pzpdeck]');await W(120);
  ok('Phase 10: after drawing from the deck there is no Go back',!(await has(p,'[data-a=pzpundo]')));

  /* ---------- Golf, Skyjo, Gnoming A Round ---------- */
  for(const [game,X] of [['golf','GFX'],['skyjo','SKX'],['gnome','GNX']]){
    await start(p,game,`${X}().play=1;`);await W(1800);
    const g0=await p.evaluate(()=>{const g=S.gpg,me=act()[0].id;g.phase='play';g.need={};g.turn=me;g.hold=null;g.flip=null;g.bounce=null;g.left2=null;if(g.hzf)g.hzf={};
      if(g.dps){if(!g.dps[0].length)g.dps[0].push(g.deck.pop())}else if(!g.disc.length)g.disc.push(g.deck.pop());save();render();return {d:g.dps?g.dps[0].length:g.disc.length,deck:g.deck.length}});
    await tap(p,game==='gnome'?'[data-a=gppile][data-k="0"]':'[data-a=gpdisc]');await W(120);
    r=await p.evaluate(()=>({hold:!!S.gpg.hold,back:!!document.querySelector('[data-a=gpundo]'),w:(document.querySelector('[data-a=gpdeck] .uxwhy')||{}).textContent||''}));
    ok(`${game}: took a discard: Go back shows, and the deck says why it’s greyed`,r.hold&&r.back&&/already have/.test(r.w),r);
    await tap(p,'[data-a=gpundo]');await W(120);
    r=await p.evaluate(()=>{const g=S.gpg;return {hold:g.hold,d:g.dps?g.dps[0].length:g.disc.length}});
    ok(`${game}: Go back puts it back on the pile`,!r.hold&&r.d===g0.d,r);
    await tap(p,'[data-a=gpdeck]');await W(120);
    r=await p.evaluate(()=>({hold:S.gpg.hold&&S.gpg.hold.from,back:!!document.querySelector('[data-a=gpundo]')}));
    ok(`${game}: after drawing from the deck there is no Go back`,r.hold==='deck'&&!r.back,r)}

  /* ---------- Phase 10 on two linked phones: the guest goes back ---------- */
  {const H=await mk(b,'host'),G=await mk(b,'guest');[H,G].forEach(x=>x.on('pageerror',e=>errs.push('link: '+e.message)));
    const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('phase10');resetScores();PTX().play=1;S.players.forEach((q,i)=>{q.on=i<2;q.name=['Justin','Brad'][i]||'';delete q.bot});save();
      const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();return act().map(q=>q.id)});
    await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);
    await G.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
    const top=await H.evaluate(id=>{const g=S.pzg;g.turn=id;g.drew=0;g.pass=null;if(pzS(pzTop(g)))g.disc.push(g.deck.find(c=>!pzS(c)));g.n++;save();render();return pzTop(g)},ids[1]);await W(2500);
    await tap(G,'[data-a=pzptake]');await W(2500);
    r={g:await has(G,'[data-a=pzpundo]'),h:await has(H,'[data-a=pzpundo]'),drew:await H.evaluate(()=>S.pzg.drew)};
    ok('Linked: the guest took the discard; Go back shows on the guest only',r.g&&!r.h&&r.drew,r);
    await tap(G,'[data-a=pzpundo]');for(let t=0;t<40;t++){await W(250);if(await G.evaluate(top=>!S.pzg.drew&&pzTop(S.pzg)===top&&!lkPending().length,top))break}
    r=await H.evaluate(()=>({drew:S.pzg.drew,top:pzTop(S.pzg)}));const rg=await G.evaluate(()=>({drew:S.pzg.drew,top:pzTop(S.pzg),back:!!document.querySelector('[data-a=pzpundo]')}));
    ok('Linked: the host applied the guest’s Go back (card back on the pile on both phones)',!r.drew&&r.top===top&&!rg.drew&&rg.top===top&&!rg.back,{r,rg,top})}
  ok('no page errors',!errs.length,errs.slice(0,4));await done(b)})();
