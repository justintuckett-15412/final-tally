// Codenames over linked phones: 5 phones (Red: spymaster + 2 guessers, Blue: spymaster + 1 guesser).
// Checks: teams, only spymasters see the key, clue rules, team-only chat, everyone-agrees voting, and a whole game.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const N=['Host','Ann','Bob','Cy','Di'];const PG=[];for(const n of N)PG.push(await mk(browser,n));const errs=[];
  PG.forEach((p,i)=>p.on('pageerror',e=>errs.push(N[i]+': '+e.message)));const H=PG[0];
  if(process.env.MATCH)await H.evaluate(m=>window.__cnm=+m,process.env.MATCH);
  const ids=await H.evaluate(N=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('cnstart','1');if(window.__cnm!=null){CNX().match=window.__cnm}const P=S.players;P.forEach((p,i)=>{p.on=i<5;p.name=N[i]||'';delete p.bot});save();c('start');return P.slice(0,5).map(p=>p.id)},N);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<5;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  await W(1500);
  const teams=await H.evaluate(()=>{const g=S.cng;return g&&{phase:g.phase,tm:g.tm,spy:g.spy,ui:!!document.querySelector('.cnteams'),ok:cnTeamsOK(g)}});
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
  await sp.evaluate(()=>{const i=document.getElementById('cnclue');i.value='zzqtest';document.querySelector('button[form="cnclueform"]').click()});await W(1500);
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
  if(process.env.SHOT){await pgOf(ops[0]).evaluate(()=>{const i=document.getElementById('cnchatin');i.value='Ocean fits wave and shell?';i.form.requestSubmit()});await W(800);await tapW(ops[0],own[1]);await W(1200);await pgOf(ops[0]).screenshot({path:'/tmp/cn-guess.png'});await pgOf(st.spy[t]).evaluate(()=>{document.querySelector('.cngrid').scrollIntoView()});await pgOf(st.spy[t]).screenshot({path:'/tmp/cn-spy.png'});await pgOf(opp.find(p=>st.spy[cnO(t)]!==p)||opp[0]).screenshot({path:'/tmp/cn-other.png'})}
  /* play to the end: spymasters give clues, guessers agree on a word (usually their own) */
  const end=Date.now()+300000;let acts=0;
  while(Date.now()<end){const g=await H.evaluate(()=>({phase:S.cng.phase,turn:S.cng.turn,rev:S.cng.rev,votes:S.cng.votes,n:S.cng.n}));if(g.phase==='done')break;
    if(g.phase==='clue'){const p=pgOf(st.spy[g.turn]);await p.evaluate(n=>{const i=document.getElementById('cnclue');if(!i)return;i.value='qzx'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},g.n);acts++;await W(1200);continue}
    const T=g.turn,O=Object.keys(st.tm).filter(p=>st.tm[p]===T&&st.spy[T]!==p),L=st.key.map((c,i)=>i).filter(i=>!g.rev[i]),mine=L.filter(i=>st.key[i]===T);
    const pick=Math.random()<.75&&mine.length?mine[0]:L.filter(i=>st.key[i]!=='x')[0]??L[0];
    for(const p of O)if(g.votes[p]!==pick)await tapW(p,pick);await W(1200);
    await pgOf(O[0]).evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');if(b&&!b.disabled)b.click()});acts++;await W(1200)}
  const fin=[];for(const p of PG)fin.push(await p.evaluate(()=>S.cng&&S.cng.phase==='done'&&!!document.querySelector('.cndone')&&document.querySelectorAll('.cngrid .cnt.key,.cngrid .cnt.rev').length===25));
  ok('A whole game: clues, votes and reveals until a team wins; every phone shows the winner and the whole key',fin.every(Boolean),{fin,acts});
  if(process.env.MATCH==='0'){const vv=[];for(let i=0;i<3;i++){let r=null;for(let k=0;k<20&&!r;k++){r=await PG[i].evaluate(()=>{const b=document.querySelector('.cndone [data-a="cnumvote"][data-k="more"]');if(!b)return null;b.click();return 1});if(!r)await W(300)}vv.push(r);await W(900)}
    const vs=await H.evaluate(()=>({ph:S.cng.phase,no:S.cng.match.no,votes:S.cng.match.votes,over:S.cng.match.over}));if(process.env.VERBOSE)console.log(vv,vs);
    const nx=await H.evaluate(()=>({ph:S.cng.phase,no:S.cng.match.no,ok:!!document.querySelector('.cnteams')}));
    ok('Keep playing: when most phones vote Another game, a new game starts on the team screen',nx.ph==='teams'&&nx.no===2&&nx.ok,nx);await done(browser);return}
  await H.evaluate(()=>document.querySelector('.cndone [data-a="finish"]').click());await W(1500);
  const res=await H.evaluate(()=>({scr:S.screen,win:S.cnrec&&S.cnrec.win,ps:act().map(p=>p.cn)}));
  ok('Results: the winning team’s players are marked as winners',['results','reveal'].includes(res.scr)&&res.win&&res.ps.every(c=>c&&c.tm&&(c.win===(c.tm===res.win?1:0))),res);
  ok('No page errors on any phone',!errs.length,errs.slice(0,4));
  await done(browser)})();
