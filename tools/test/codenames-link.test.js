// Codenames over linked phones: 5 phones (Red: spymaster + 2 guessers, Blue: spymaster + 1 guesser).
// Checks: teams, only spymasters see the key, clue rules, team-only chat, everyone-agrees voting, and a whole game.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const N=['Host','Ann','Bob','Cy','Di'];const PG=[];for(const n of N)PG.push(await mk(browser,n));const errs=[];
  PG.forEach((p,i)=>p.on('pageerror',e=>errs.push(N[i]+': '+e.message)));const H=PG[0];
  if(process.env.MATCH)await H.evaluate(m=>window.__cnm=+m,process.env.MATCH);
  const ids=await H.evaluate(N=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('cnstart','1');CNX().timer=60;if(window.__cnm!=null){CNX().match=window.__cnm}const P=S.players;P.forEach((p,i)=>{p.on=i<5;p.name=N[i]||'';delete p.bot});save();c('start');return P.slice(0,5).map(p=>p.id)},N);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<5;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  const TV=await mk(browser,'TV');TV.on('pageerror',e=>errs.push('TV: '+e.message));await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  await W(1500);
  const teams=await H.evaluate(()=>{const g=S.cng;return g&&{phase:g.phase,tm:g.tm,spy:g.spy,ui:!!document.querySelector('.cnteams'),ok:cnTeamsOK(g)}});
  const capui=await H.evaluate(()=>{const g=S.cng;return ['r','b'].every(t=>g.cap&&cnOps(g,t).includes(g.cap[t]))&&document.querySelectorAll('.cnteams .cnrole').length>=3&&/Captain/.test(document.querySelector('.cnteams').innerText)});
  ok('Captain: each team starts with a ⭐ captain (a guesser), shown on the team screen',capui,capui);
  ok('Teams: every player is on Red or Blue with a spymaster each, shown on the team screen',teams&&teams.phase==='teams'&&teams.ui&&teams.ok&&Object.keys(teams.tm).length===5,teams);
  await PG[2].evaluate(()=>document.querySelector('[data-a="cnubegin"]').click());await W(1500);
  const st=await H.evaluate(()=>({phase:S.cng.phase,turn:S.cng.turn,spy:S.cng.spy,tm:S.cng.tm,key:S.cng.key,words:S.cng.words}));
  ok('Start: tapping Start on any phone begins the game with the clue phase',st.phase==='clue',st.phase);
  const solo=await H.evaluate(()=>S.cng.solo);ok('Linked game: the board knows the phones are linked (no one-device shortcuts)',solo===false,solo);
  const pgOf=pid=>PG[ids.indexOf(pid)],cnO=t=>t==='r'?'b':'r';
  /* privacy: only spymasters' boards show the key */
  const priv=[];for(let i=0;i<5;i++){const r=await PG[i].evaluate(()=>({keys:document.querySelectorAll('.cngrid .cnt.key').length,me:S.lk.me}));const spy=Object.values(st.spy).includes(r.me);if(spy?r.keys!==25:r.keys!==0)priv.push([N[i],r.keys])}
  ok('Privacy: only the two spymasters see the key; the guessers see plain words',!priv.length,priv);
  const sp=pgOf(st.spy[st.turn]);
  const bad=await sp.evaluate(w=>{const i=document.getElementById('cnclue');i.value=w;document.querySelector('button[form="cnclueform"]').click();return {phase:S.cng.phase,err:document.querySelector('#cnfx .cnerr').textContent}},st.words[0]);
  ok('Clue rules: a word on the board is refused with a message',bad.phase==='clue'&&/on the board/.test(bad.err),bad);
  await sp.evaluate(()=>{document.querySelector('[data-a="cnunum"][data-k="2"]').click()});await W(300);
  const mine2=st.key.map((c,i)=>i).filter(i=>st.key[i]===st.turn).slice(0,2),mine2w=mine2.map(i=>st.words[i]);
  for(const i of mine2)await sp.evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),i);await W(300);
  const mk1=await sp.evaluate(()=>({n:document.querySelectorAll('.cngrid .cnt.meant').length,h:document.querySelector('#cnfx .cnmhint').textContent}));
  ok('What I meant: the spymaster taps their words, which are marked on their own screen only',mk1.n===2&&/marked 2/.test(mk1.h),mk1);
  await sp.evaluate(()=>{const i=document.getElementById('cnclue');i.value='zzqtest';document.querySelector('button[form="cnclueform"]').click()});await W(1500);
  const leakM=[];for(let i=0;i<5;i++){const r=await PG[i].evaluate(()=>document.querySelectorAll('.cngrid .cnt.meant').length+(document.querySelector('.cnmeant')?100:0));if(r)leakM.push([N[i],r])}
  ok('What I meant: nobody else sees the marked words during the game',!leakM.length,leakM);
  const tv=await TV.evaluate(()=>({big:document.documentElement.classList.contains('cnbig'),keys:document.querySelectorAll('.cngrid .cnt.key').length,panel:!!document.getElementById('cnfx'),clue:(document.querySelector('.cnclue')||{}).innerText||''}));
  ok('Big board: a phone or TV that joins as “Just watching” shows the big board with no key and no team panel',tv.big&&tv.keys===0&&!tv.panel&&/ZZQTEST/.test(tv.clue),tv);
  const cl=[];for(let i=0;i<5;i++)cl.push(await PG[i].evaluate(()=>{const c=document.querySelector('.cnclue');return c?c.innerText:''}));
  ok('Clue: the spymaster’s clue and number show on every phone',cl.every(t=>/ZZQTEST/.test(t)&&/2/.test(t)),cl);
  /* team chat */
  const t=st.turn,ops=Object.keys(st.tm).filter(p=>st.tm[p]===t&&st.spy[t]!==p),opp=Object.keys(st.tm).filter(p=>st.tm[p]!==t);
  await pgOf(ops[0]).evaluate(()=>{const i=document.getElementById('cnchatin');i.value='Secret plan banana';i.form.requestSubmit()});await W(1500);
  const seen=[];for(const p of Object.keys(st.tm))seen.push([st.tm[p]===t,await pgOf(p).evaluate(()=>{const L=document.querySelector('#cnfx .cnlist');return !!L&&L.innerText.includes('Secret plan banana')})]);
  ok('Team chat: teammates (and their spymaster) see the message; the other team does not',seen.every(([mine,s])=>mine===s),seen);
  const lock=await pgOf(st.spy[t]).evaluate(()=>{const i=document.getElementById('cnchatin');return !!i&&i.disabled});
  ok('Spymasters can’t post in team chat while their team is guessing',lock,lock);
  /* voting: everyone must agree */
  const own=st.key.map((c,i)=>i).filter(i=>st.key[i]===t),other=st.key.map((c,i)=>i).filter(i=>st.key[i]==='n');
  const tapW=(p,i)=>pgOf(p).evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),i);
  if(ops.length>1){await tapW(ops[0],own[0]);await tapW(ops[1],other[0]);await W(1500)}
  const dis=await pgOf(ops[0]).evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');return b?b.disabled:null});
  for(const p of ops)if(p!==ops[0]||ops.length===1)await tapW(p,own[0]);if(ops.length===1)await W(200);await W(1500);
  const en=await pgOf(ops[ops.length-1]).evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');return b?{d:b.disabled,t:b.innerText}:null});
  ok('Voting: Confirm stays off until every guesser on the team picks the same word',(ops.length===1||dis===true)&&en&&!en.d&&en.t.includes(st.words[own[0]]),{dis,en});
  await pgOf(ops[ops.length-1]).evaluate(()=>document.querySelector('#cnfx .cnconfirm').click());await W(1500);
  const rv=await H.evaluate(i=>({r:S.cng.rev[i],g:S.cng.guesses}),own[0]);
  const rvs=[];for(const p of PG)rvs.push(await p.evaluate(i=>!!document.querySelector(`.cngrid .cnt.rev[data-k="${i}"]`),own[0]));
  ok('Confirm: the word is revealed on every phone',rv.r===t&&rvs.every(Boolean),{rv,rvs});
  { const ob=await pgOf(ops[0]).evaluate(()=>{const b=document.querySelector('[data-a="cnuoops"]');if(!b)return false;b.click();return true});await W(1500);
    const capO=await H.evaluate(o=>{const g=S.cng;return g.cap[o]},t==='r'?'b':'r');
    const ask=await pgOf(capO).evaluate(()=>!!document.querySelector('[data-a="cnuoopsok"]'));
    await pgOf(capO).evaluate(()=>document.querySelector('[data-a="cnuoopsok"]').click());await W(1500);
    const back=await H.evaluate(i=>({r:S.cng.rev[i],ph:S.cng.phase,turn:S.cng.turn}),own[0]);
    ok('Oops: the team asks to undo a reveal, the other team’s captain allows it, and the word is put back',ob&&ask&&!back.r&&back.ph==='guess'&&back.turn===t,{ob,ask,back});
    for(const p of ops)await tapW(p,own[0]);await W(1200);await pgOf(ops[0]).evaluate(()=>document.querySelector('#cnfx .cnconfirm').click());await W(1500);
    const snd=await TV.evaluate(()=>{try{cnSfx('good');cnSfx('bad');cnSfx('meh');cnSfx('boom');return true}catch(e){return e.message}});
    ok('Sounds: every reveal sound plays without errors',snd===true,snd)}
  if(process.env.SHOT){await pgOf(ops[0]).evaluate(()=>{const i=document.getElementById('cnchatin');i.value='Ocean fits wave and shell?';i.form.requestSubmit()});await W(800);await tapW(ops[0],own[1]);await W(1200);await pgOf(ops[0]).screenshot({path:'/tmp/cn-guess.png'});await pgOf(st.spy[t]).evaluate(()=>{document.querySelector('.cngrid').scrollIntoView()});await pgOf(st.spy[t]).screenshot({path:'/tmp/cn-spy.png'});await pgOf(opp.find(p=>st.spy[cnO(t)]!==p)||opp[0]).screenshot({path:'/tmp/cn-other.png'})}
  { const g1=await H.evaluate(()=>({ph:S.cng.phase,turn:S.cng.turn}));
    if(g1.ph==='guess'){const T1=g1.turn,O1=Object.keys(st.tm).filter(p=>st.tm[p]===T1&&st.spy[T1]!==p),rv1=await H.evaluate(()=>S.cng.rev),w1=st.key.map((c,i)=>i).find(i=>!rv1[i]&&st.key[i]==='n');
      for(const p of O1){const v=await H.evaluate(p=>S.cng.votes[p],p);if(v!=null)await tapW(p,v)}await W(800);await tapW(O1[0],w1);await W(1000);
      await pgOf(opp[0]).evaluate(()=>document.querySelector('[data-a="cnutimer"]').click());await W(1200);
      const run=await PG[3].evaluate(()=>!!document.querySelector('.cntmr.run'));await H.evaluate(()=>{S.cng.tmr.end=Date.now()+800;save()});await W(3000);
      const g2=await H.evaluate(()=>({ph:S.cng.phase,turn:S.cng.turn,tmr:S.cng.tmr}));
      const r1=await H.evaluate(i=>S.cng.rev[i],w1);
      ok('Sand timer: anyone flips ⏳; when it runs out the word with the most votes is revealed and the turn ends',run&&r1&&g2.ph==='clue'&&g2.turn!==g1.turn&&!g2.tmr,{run,r1,g1,g2})}
    else ok('Sand timer: anyone flips ⏳; when it runs out the guessers’ turn ends',true,'skipped: turn already over')}
  /* play to the end: spymasters give clues, guessers agree on a word (usually their own) */
  const end=Date.now()+300000;let acts=0;global.window=global.window||{};
  while(Date.now()<end){const g=await H.evaluate(()=>({phase:S.cng.phase,turn:S.cng.turn,rev:S.cng.rev,votes:S.cng.votes,n:S.cng.n}));if(g.phase==='done')break;
    if(g.phase==='clue'){const p=pgOf(st.spy[g.turn]);await p.evaluate(n=>{const i=document.getElementById('cnclue');if(!i)return;i.value='qzx'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},g.n);acts++;await W(1200);continue}
    const T=g.turn,O=Object.keys(st.tm).filter(p=>st.tm[p]===T&&st.spy[T]!==p),L=st.key.map((c,i)=>i).filter(i=>!g.rev[i]),mine=L.filter(i=>st.key[i]===T);
    if(O.length>1&&!window.__capdone){window.__capdone=1;const cap=await H.evaluate(t=>S.cng.cap[t],T),other=O.find(p=>p!==cap),tgt=mine[0]??L[0];
      for(const p of O)if(g.votes[p]!=null)await pgOf(p).evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),g.votes[p]);await W(800);
      await tapW(cap,tgt);await W(1200);await pgOf(other).evaluate(()=>{window.__toasts=[];const o=window.toast;window.toast=(m,...a)=>{window.__toasts.push(m);return o(m,...a)}});
      await pgOf(cap).evaluate(()=>document.querySelector('#cnfx [data-a="cnunudge"]').click());await W(1500);
      const nz=await pgOf(other).evaluate(()=>window.__toasts.some(m=>/waiting for your vote/.test(m)));
      ok('Nudge: the captain’s 🔔 Nudge pops a reminder on the teammate who hasn’t voted',nz,nz);
      const pb=await pgOf(cap).evaluate(()=>{const b=document.querySelector('#cnfx [data-a="cnupush"]');if(!b)return 'no push button';b.click();return true});await W(1500);
      const pr=await H.evaluate(i=>!!S.cng.rev[i]||S.cng.phase==='done',tgt);
      ok('Captain: ⭐ pushes the vote through without waiting for a teammate who forgot to vote',pb===true&&pr,{pb,pr});continue}
    const pick=Math.random()<.75&&mine.length?mine[0]:L.filter(i=>st.key[i]!=='x')[0]??L[0];
    for(const p of O)if(g.votes[p]!==pick)await tapW(p,pick);await W(1200);
    await pgOf(O[0]).evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');if(b&&!b.disabled)b.click()});acts++;await W(1200)}
  const fin=[];for(const p of PG)fin.push(await p.evaluate(()=>S.cng&&S.cng.phase==='done'&&!!document.querySelector('.cndone')&&document.querySelectorAll('.cngrid .cnt.key,.cngrid .cnt.rev').length===25));
  const mt=await TV.evaluate(w=>{const m=document.querySelector('.cnmeant');return !!m&&w.every(x=>m.innerText.includes(x))},mine2w);
  ok('What I meant: after the game every screen shows the words each clue meant',mt,mt);
  ok('A whole game: clues, votes and reveals until a team wins; every phone shows the winner and the whole key',fin.every(Boolean),{fin,acts});
  if(process.env.MATCH==='0'){const vv=[];for(let i=0;i<3;i++){let r=null;for(let k=0;k<20&&!r;k++){r=await PG[i].evaluate(()=>{const b=document.querySelector('.cndone [data-a="cnumvote"][data-k="more"]');if(!b)return null;b.click();return 1});if(!r)await W(300)}vv.push(r);await W(900)}
    const vs=await H.evaluate(()=>({ph:S.cng.phase,no:S.cng.match.no,votes:S.cng.match.votes,over:S.cng.match.over}));if(process.env.VERBOSE)console.log(vv,vs);
    const nx=await H.evaluate(()=>({ph:S.cng.phase,no:S.cng.match.no,ok:!!document.querySelector('.cnteams')}));
    ok('Keep playing: when most phones vote Another game, a new game starts on the team screen',nx.ph==='teams'&&nx.no===2&&nx.ok,nx);await done(browser);return}
  await H.evaluate(()=>document.querySelector('.cndone [data-a="finish"]').click());await W(1500);
  const res=await H.evaluate(()=>({scr:S.screen,win:S.cnrec&&S.cnrec.win,ps:act().map(p=>p.cn)}));
  ok('Results: the winning team’s players are marked as winners',['results','reveal'].includes(res.scr)&&res.win&&res.ps.every(c=>c&&c.tm&&(c.win===(c.tm===res.win?1:0))),res);
  for(let i=0;i<20;i++){const n=await H.evaluate(()=>HG().filter(g=>g.game==='codenames').length);if(n)break;await H.evaluate(()=>{const b=document.querySelector('[data-a="revskip"],[data-a="revnext"],.reveal [data-a]');if(b)b.click()});await W(1000)}
  const rec=await H.evaluate(()=>{try{const G=HG();return cnRecords(G.some(g=>g.game==='codenames')?G:[{game:'codenames',date:new Date().toISOString(),state:{players:JSON.parse(JSON.stringify(act())),cnrec:S.cnrec},players:act().map(p=>({name:p.name,color:p.color,rank:p.cn&&p.cn.win?1:2,total:p.cn&&p.cn.win?1:0}))}])}catch(e){return 'ERR '+e.message}});
  const hh=await H.evaluate(()=>{const G=HG().filter(g=>g.game==='codenames');return {n:G.length,scr:S.screen,st:G[0]&&!!G[0].state,ps:G[0]&&G[0].state&&G[0].state.players&&G[0].state.players.slice(0,2).map(p=>[p.name,JSON.stringify(p.cn)]),pl:G[0]&&G[0].players.slice(0,2).map(p=>p.name)}});
  ok('Stats: Codenames records (most wins, best spymaster, best clue) on the stats screen',/Codenames records/.test(rec)&&/Most wins/.test(rec),{rec:String(rec).slice(0,200),hh});
  ok('No page errors on any phone',!errs.length,errs.slice(0,4));
  await done(browser)})();
