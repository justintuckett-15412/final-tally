/* ================= Codenames: rules engine =================
   State S.cng = {gid, ps:[pid], words:[25], key:['r'|'b'|'n'|'x'] (25), rev:[null|'r'|'b' (who revealed)],
     start:'r'|'b', tm:{pid:'r'|'b'}, spy:{r:pid,b:pid}, phase:'teams'|'clue'|'guess'|'done',
     turn:'r'|'b', clue:{w,n,by}|null (n=-1 means unlimited), guesses, votes:{pid:index|'end'},
     hist:[{tm,w,n,res:[{i,c}]}], win, why:'agents'|'assassin', solo, n, lastRev:{i,c,by,tm} }
   Moves: cnMove(g,pid,mv) returns true when the move was made. */
const CNT={r:'Red',b:'Blue'},CNTE={r:'🔴',b:'🔵'},cnOther=t=>t==='r'?'b':'r';
const cnNorm=w=>String(w||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const cnLeft=(g,t)=>g.key.reduce((a,c,i)=>a+(c===t&&!g.rev[i]?1:0),0);
const cnOps=(g,t)=>g.shared?[g.shared]:g.ps.filter(p=>g.tm[p]===t&&g.spy[t]!==p);
/* the captain: a guesser who can push the team's vote through. Starts as each team's first guesser */
function cnFixCap(g){g.cap=g.cap||{};['r','b'].forEach(t=>{const O=cnOps(g,t);if(!O.includes(g.cap[t]))g.cap[t]=O[0]||null})}
const cnShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* teams: last game's teams when the same people play again, otherwise alternate Red/Blue, first two are the spymasters */
function cnAutoTeams(ps,prev){const tm={},spy={r:null,b:null};
  /* a rematch with the same people: same teams, and each team chooses its spymaster */
  if(prev&&prev.tm&&ps.every(p=>prev.tm[p])){ps.forEach(p=>tm[p]=prev.tm[p]);return {tm,spy,pick:true,last:{...(prev.spy||{})}}}
  ps.forEach((p,i)=>tm[p]=i%2?'b':'r');spy.r=ps[0]||null;spy.b=ps[1]||null;
  return {tm,spy}}
function cnPool(o){const base=[...(o.words==='kid'?CNW_KID:CNW_STD),...(o.packs||[]).flatMap(k=>typeof CNPACKS!=='undefined'&&CNPACKS[k]?CNPACKS[k].w:[])],own=String(o.own||'').split(/[\n,]+/).map(w=>w.trim().toUpperCase()).filter(w=>w&&w.length<=20);
  const all=[...new Set([...(o.ownOnly&&own.length>=25?[]:base),...own])];return all}
function cnDeal(o={}){const ps=act().map(p=>p.id),pool=cnPool(o);if(pool.length<25)return null;
  const vr=o.variant==='coop'||o.variant==='three'&&ps.length===3?o.variant:'std';
  const words=cnShuf(pool).slice(0,25),start=vr==='coop'?'r':Math.random()<.5?'r':'b',other=cnOther(start);
  const key=cnShuf([...Array(9).fill(start),...Array(8).fill(other),...Array(7).fill('n'),'x']);
  const T=vr==='coop'?{tm:Object.fromEntries(ps.map(p=>[p,'r'])),spy:{r:ps[0]||null,b:null}}:vr==='three'?{tm:{[ps[0]]:'r',[ps[1]]:'b',[ps[2]]:'r'},spy:{r:ps[0],b:ps[1]}}:cnAutoTeams(ps,o.prev);
  const fmt=vr==='coop'?1:[1,3,5,0].includes(+o.match)?+o.match:1;
  const g0={variant:vr,shared:vr==='three'?ps[2]:null,timer:[60,120,180].includes(+o.timer)?+o.timer:0,tmr:null,pickSpy:!!T.pick,lastSpy:T.last||null,gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,words,key,rev:Array(25).fill(null),start,tm:T.tm,spy:T.spy,phase:'teams',turn:start,clue:null,guesses:0,votes:{},hist:[],win:null,why:null,solo:!!o.solo,n:0,lastRev:null,
    cap:null,nudge:null,o:{words:o.words,own:o.own,ownOnly:o.ownOnly,packs:o.packs||[]},st:{spyG:{},spyW:{},ass:{},best:null},undo:null,used:words.slice(),match:{fmt,no:1,wins:{r:0,b:0},pw:{},over:false,votes:{},games:[]}};
  if(o.prev&&o.prev.cap)g0.cap={...o.prev.cap};cnFixCap(g0);return g0}
/* best of 3 / 5: first to 2 / 3 game wins. Keep playing (0): until most players vote they're done */
const cnNeed=m=>m.fmt>1?(m.fmt+1)/2:m.fmt===1?1:null;
function cnNextGame(g){const M=g.match,pool=cnPool(g.o||{});let fresh=pool.filter(w=>!g.used.includes(w));if(fresh.length<25){g.used=[];fresh=pool}
  const words=cnShuf(fresh).slice(0,25),start=Math.random()<.5?'r':'b',other=cnOther(start);
  /* the spymaster job moves to the next teammate */
  if(g.variant==='three'){const a=[g.spy.r,g.spy.b,g.shared];g.spy={r:a[2],b:a[0]};g.shared=a[1];g.tm={[a[2]]:'r',[a[0]]:'b',[a[1]]:'r'}}
  const oldCap={...(g.cap||{})};if(g.variant!=='three')['r','b'].forEach(t=>{const T=g.ps.filter(p=>g.tm[p]===t);if(T.length>1){const i=T.indexOf(g.spy[t]);g.spy[t]=T[(i+1)%T.length]}});
  g.cap={};['r','b'].forEach(t=>{const O=cnOps(g,t),T=g.ps.filter(p=>g.tm[p]===t),i=T.indexOf(oldCap[t]);let c=null;if(i>=0)for(let k=1;k<=T.length;k++){const q=T[(i+k)%T.length];if(O.includes(q)){c=q;break}}g.cap[t]=c||O[0]||null});
  Object.assign(g,{words,key:cnShuf([...Array(9).fill(start),...Array(8).fill(other),...Array(7).fill('n'),'x']),rev:Array(25).fill(null),start,phase:'teams',turn:start,clue:null,guesses:0,votes:{},hist:[],win:null,why:null,lastRev:null,nudge:null,tmr:null,undo:null,ehist:[],score:null});
  g.used.push(...words);M.no++;M.votes={}}
const cnStale=g=>{const ids=act().map(p=>p.id);return !g||!g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
/* teams are ready when each has a spymaster and at least one guesser */
function cnTeamsOK(g){if(g.variant==='coop')return g.ps.length>=2&&!!g.spy.r&&cnOps(g,'r').length>=1;if(g.variant==='three')return g.ps.length===3&&!!g.spy.r&&!!g.spy.b&&!!g.shared&&new Set([g.spy.r,g.spy.b,g.shared]).size===3;return ['r','b'].every(t=>g.spy[t]&&g.tm[g.spy[t]]===t&&cnOps(g,t).length>=1)}
function cnTeamsWhy(g){const n=g.ps.length;if(g.variant==='coop')return n<2?'Play together needs at least 2 players.':!g.spy.r?'Choose a spymaster.':'';if(g.variant==='three')return n!==3?'This variant is for exactly 3 players.':cnTeamsOK(g)?'':'Choose a Red spymaster, a Blue spymaster and the guesser.';if(n<4)return `Two teams need at least 4 players. With ${n}, go back to setup and choose “Play together”${n===3?' or “3 players”':''}.`;
  for(const t of ['r','b']){if(!g.spy[t]||g.tm[g.spy[t]]!==t)return `${CNT[t]} needs a spymaster.`;if(!cnOps(g,t).length)return `${CNT[t]} needs at least one guesser.`}return ''}
/* a clue can't be a word still showing on the board, or part of one, or contain one */
function cnClueBad(g,w){const c=cnNorm(w);if(!c)return 'Type a clue word.';if(c.length>30)return 'That clue is too long.';
  for(let i=0;i<25;i++){if(g.rev[i])continue;const b=cnNorm(g.words[i]);if(c===b)return `${g.words[i]} is on the board.`;if(c.includes(b)||b.includes(c))return `Too close to ${g.words[i]}, which is on the board.`}return ''}
function cnEndTurn(g){g.tmr=null;if(g.clue&&g.hist.length)g.hist[g.hist.length-1].done=true;g.clue=null;g.guesses=0;g.votes={};
  if(g.variant==='coop'){g.phase='enemy';g.turn='b';return}g.turn=cnOther(g.turn);g.phase='clue'}
function cnStatsAt(g,win){const T=g.st||(g.st={spyG:{},spyW:{},ass:{},best:null});['r','b'].forEach(t=>{const s=g.spy[t];if(!s)return;T.spyG[s]=(T.spyG[s]||0)+1;if(t===win)T.spyW[s]=(T.spyW[s]||0)+1});
  g.hist.forEach(h=>{const n=(h.res||[]).filter(r=>r.c===h.tm).length;if(n>=2&&(!T.best||n>T.best.n))T.best={w:h.w,n,pid:g.spy[h.tm],tm:h.tm}})}
function cnFinish(g,win,why){g.tmr=null;g.phase='done';g.win=win;g.why=why;g.votes={};if(g.variant==='coop')g.score=win==='r'?cnLeft(g,'b'):0;cnStatsAt(g,win);const M=g.match;if(!M)return;
  M.wins[win]++;g.ps.forEach(p=>{if(g.tm[p]===win)M.pw[p]=(M.pw[p]||0)+1});M.games.push({win,why});const need=cnNeed(M);if(need&&M.wins[win]>=need)M.over=true}
/* the team ahead in a match (null when tied) */
const cnMatchWin=g=>{const M=g.match;if(!M)return g.win;return M.wins.r>M.wins.b?'r':M.wins.b>M.wins.r?'b':null};
const CNUNDO=['rev','guesses','turn','phase','clue','votes','win','why','lastRev','hist','match','tmr','st','lastOut'];
function cnReveal(g,i,by){const snap={};CNUNDO.forEach(k=>snap[k]=g[k]===undefined?null:JSON.parse(JSON.stringify(g[k])));g.undo={at:Date.now(),i,tm:g.turn,by,snap,req:null};
  const t=g.turn,c=g.key[i];g.rev[i]=t;g.guesses++;g.votes={};g.lastRev={i,c,by,tm:t,at:Date.now()};
  const H=g.hist[g.hist.length-1];if(H)H.res.push({i,c,t:Date.now()});
  if(c==='x'){if(by&&g.ps.includes(by)){const T=g.st||(g.st={spyG:{},spyW:{},ass:{},best:null});T.ass[by]=(T.ass[by]||0)+1}cnFinish(g,cnOther(t),'assassin');return}
  for(const s of [t,cnOther(t)])if(cnLeft(g,s)===0){cnFinish(g,s,'agents');return}
  if(c!==t){cnEndTurn(g);return}
  const n=g.clue?g.clue.n:-1;if(n>0&&g.guesses>=n+1)cnEndTurn(g)}
const cnCanEnd=g=>g.phase==='guess'&&g.guesses>=1;
/* everyone on the team who guesses has picked the same thing */
function cnAgree(g){const O=cnOps(g,g.turn);if(!O.length)return null;const v=O.map(p=>g.votes[p]);if(v.some(x=>x===undefined||x===null))return null;return v.every(x=>x===v[0])?v[0]:null}
/* everyone who has voted picked the same thing (at least one vote): the captain can push that through */
function cnPushable(g){const O=cnOps(g,g.turn),v=O.map(p=>g.votes[p]).filter(x=>x!==undefined&&x!==null);if(!v.length)return null;return v.every(x=>x===v[0])?v[0]:null}
function cnApply(g,v,pid){if(v==='end'){if(!cnCanEnd(g))return false;cnEndTurn(g)}else{if(g.rev[v])return false;cnReveal(g,v,pid)}return true}
/* the sand timer (house rule): anyone flips it; when it runs out the guessers' turn ends, or the spymaster is told to give a clue now */
function cnTimerCheck(g,now){const T=g&&g.tmr;if(!T||T.out||now<T.end)return false;if(g.phase!==T.ph||g.turn!==T.turn){g.tmr=null;return true}
  if(g.phase==='guess'){const tm=g.turn,v=cnTimeoutPick(g);g.lastOut={tm,at:now,w:typeof v==='number'?g.words[v]:null};
    if(typeof v==='number'){cnReveal(g,v,'timer');if(g.phase==='guess'&&g.turn===tm)cnEndTurn(g)}else cnEndTurn(g)}else T.out=true;g.n++;return true}
/* time ran out while guessing: the word with the most votes is revealed (the captain breaks a tie; a vote to stop counts too) */
function cnTimeoutPick(g){const O=cnOps(g,g.turn),c={};O.forEach(p=>{const v=g.votes[p];if(v!==undefined&&v!==null)c[v]=(c[v]||0)+1});const ks=Object.keys(c);if(!ks.length)return null;
  const top=Math.max(...ks.map(k=>c[k])),tied=ks.filter(k=>c[k]===top);let pick=tied.length===1?tied[0]:null;
  if(pick===null){cnFixCap(g);const cv=g.votes[g.cap[g.turn]];if(cv!==undefined&&cv!==null&&tied.includes(String(cv)))pick=String(cv)}
  if(pick===null||pick==='end')return null;const i=+pick;return g.rev[i]?null:i}
function cnUndo(g){const U=g.undo;if(!U)return false;CNUNDO.forEach(k=>{g[k]=U.snap[k]});g.undo=null;g.oopsed={w:g.words[U.i],at:Date.now()};g.n++;return true}
function cnMove(g,pid,mv){if(!g||!mv)return false;const t=g.shared===pid&&g.phase!=='teams'?g.turn:g.tm[pid];
  /* Oops: within 10 seconds of a reveal, the team that revealed asks to undo it; the other team's captain allows it (on one device it's instant) */
  if(mv.a==='oops'){const U=g.undo;if(!U||U.req||Date.now()-U.at>10000)return false;if(!g.solo&&g.tm[pid]!==U.tm)return false;U.req={by:pid,at:Date.now()};if(g.solo||g.variant==='coop')return cnUndo(g);g.n++;return true}
  if(mv.a==='oopsok'||mv.a==='oopsno'){const U=g.undo;if(!U||!U.req)return false;const o=cnOther(U.tm);cnFixCap(g);const judge=g.variant==='three'?g.spy[o]:g.cap[o]||g.spy[o];if(!g.solo&&pid!==judge)return false;if(mv.a==='oopsok')return cnUndo(g);g.undo=null;g.n++;return true}
  if(g.undo&&['clue','confirm','push','pick','stop','next','mvote','begin'].includes(mv.a))g.undo=null;
  if(mv.a==='timer'){if(!g.timer||!['clue','guess'].includes(g.phase)||g.tmr&&!g.tmr.out)return false;g.tmr={end:Date.now()+g.timer*1000,ph:g.phase,turn:g.turn,by:pid,out:false};g.n++;return true}
  if(g.phase==='teams'){
    if(g.variant==='coop'&&['team','shuffle'].includes(mv.a))return false;
    if(g.variant==='three'){if(mv.a==='role3'){const w=mv.who,r=mv.role;if(!g.ps.includes(w)||!['r','b','op'].includes(r))return false;const cur=r==='op'?g.shared:g.spy[r];
      const mine=g.shared===w?'op':g.spy.r===w?'r':g.spy.b===w?'b':null;const put=(role,p)=>{if(role==='op')g.shared=p;else{g.spy[role]=p;g.tm[p]=role}};put(r,w);if(mine&&mine!==r)put(mine,cur);g.n++;return true}
      if(mv.a!=='begin')return false}
    if(mv.a==='team'){const w=mv.who;if(!g.ps.includes(w)||!['r','b'].includes(mv.tm))return false;const was=g.tm[w];g.tm[w]=mv.tm;if(was!==mv.tm&&g.spy[was]===w)g.spy[was]=g.pickSpy?null:g.ps.find(p=>p!==w&&g.tm[p]===was)||null;if(!g.spy[mv.tm]&&!g.pickSpy)g.spy[mv.tm]=w;cnFixCap(g);g.n++;return true}
    if(mv.a==='spy'){const w=mv.who;if(!g.ps.includes(w))return false;g.spy[g.tm[w]]=w;cnFixCap(g);g.n++;return true}
    if(mv.a==='spyrand'){const t=mv.tm,T=g.ps.filter(p=>g.tm[p]===t);if(!['r','b'].includes(t)||T.length<2)return false;g.spy[t]=T[Math.floor(Math.random()*T.length)];cnFixCap(g);g.n++;return true}
    if(mv.a==='cap'){const w=mv.who,t=g.tm[w];if(!t||!cnOps(g,t).includes(w))return false;g.cap=g.cap||{};g.cap[t]=w;g.n++;return true}
    if(mv.a==='shuffle'){const P=cnShuf(g.ps);P.forEach((p,i)=>g.tm[p]=i%2?'b':'r');g.spy={r:P[0],b:P[1]};g.cap={};cnFixCap(g);g.n++;return true}
    if(mv.a==='begin'){if(!cnTeamsOK(g))return false;g.phase='clue';g.turn=g.start;g.n++;return true}
    return false}
  if(g.phase==='enemy'){/* play together: the spymaster covers one enemy agent for the pretend opponent */
    if(mv.a!=='enemy')return false;if(!g.solo&&g.spy.r!==pid)return false;const i=+mv.i;if(!(i>=0&&i<25)||g.rev[i]||g.key[i]!=='b')return false;
    g.rev[i]='b';g.lastRev={i,c:'b',by:'enemy',tm:'b',at:Date.now()};g.ehist=(g.ehist||[]).concat([i]);g.undo=null;
    if(cnLeft(g,'b')===0){cnFinish(g,'b','agents');g.n++;return true}g.turn='r';g.phase='clue';g.n++;return true}
  if(g.phase==='clue'){if(mv.a!=='clue')return false;if(!g.solo&&g.spy[g.turn]!==pid)return false;
    const w=String(mv.w||'').trim().replace(/\s+/g,' ').toUpperCase(),n=+mv.n;if(cnClueBad(g,w))return false;if(!(n===-1||n>=0&&n<=9))return false;
    const meant=Array.isArray(mv.meant)?[...new Set(mv.meant.map(Number))].filter(i=>i>=0&&i<25&&!g.rev[i]&&g.key[i]===g.turn).slice(0,9):[];
    g.clue={w,n,by:g.spy[g.turn]};g.tmr=null;g.hist.push({tm:g.turn,w,n,res:[],t:Date.now(),meant});g.phase='guess';g.guesses=0;g.votes={};g.n++;return true}
  if(g.phase==='guess'){
    if(mv.a==='pick'){/* one shared device: tap and confirm a word straight away */if(!g.solo)return false;const i=+mv.i;if(!(i>=0&&i<25)||g.rev[i])return false;cnReveal(g,i,pid);g.n++;return true}
    if(mv.a==='stop'){if(!g.solo||!cnCanEnd(g))return false;cnEndTurn(g);g.n++;return true}
    if(t!==g.turn||g.spy[t]===pid)return false;
    if(mv.a==='vote'){const v=mv.i;if(v===null||v===undefined){delete g.votes[pid];g.n++;return true}
      if(v==='end'){if(!cnCanEnd(g))return false}else{const i=+v;if(!(i>=0&&i<25)||g.rev[i])return false}
      g.votes[pid]=v==='end'?'end':+v;g.n++;return true}
    if(mv.a==='confirm'){const v=cnAgree(g);if(v===null)return false;if(!cnApply(g,v,pid))return false;g.n++;return true}
    if(mv.a==='push'){cnFixCap(g);if(g.cap[t]!==pid)return false;const v=cnPushable(g);if(v===null)return false;if(!cnApply(g,v,pid))return false;g.n++;return true}
    if(mv.a==='nudge'){const to=cnOps(g,t).filter(p=>p!==pid&&(g.votes[p]===undefined||g.votes[p]===null));if(!to.length)return false;g.nudge={k:(g.nudge?g.nudge.k:0)+1,by:pid,to,at:Date.now()};g.n++;return true}
    return false}
  if(g.phase==='done'&&g.match&&!g.match.over){const M=g.match;
    if(mv.a==='next'){if(M.fmt===0)return false;cnNextGame(g);g.n++;return true}
    if(mv.a==='mvote'){if(M.fmt!==0||!g.ps.includes(pid)||!['more','done'].includes(mv.v))return false;M.votes[pid]=mv.v;if(g.solo){if(mv.v==='done')M.over=true;else cnNextGame(g);g.n++;return true}
      const half=g.ps.length/2,c=v=>Object.values(M.votes).filter(x=>x===v).length;if(c('done')>half)M.over=true;else if(c('more')>half)cnNextGame(g);g.n++;return true}}
  return false}
