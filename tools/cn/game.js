/* ================= Codenames: rules engine =================
   State S.cng = {gid, ps:[pid], words:[25], key:['r'|'b'|'n'|'x'] (25), rev:[null|'r'|'b' (who revealed)],
     start:'r'|'b', tm:{pid:'r'|'b'}, spy:{r:pid,b:pid}, phase:'teams'|'clue'|'guess'|'done',
     turn:'r'|'b', clue:{w,n,by}|null (n=-1 means unlimited), guesses, votes:{pid:index|'end'},
     hist:[{tm,w,n,res:[{i,c}]}], win, why:'agents'|'assassin', solo, n, lastRev:{i,c,by,tm} }
   Moves: cnMove(g,pid,mv) returns true when the move was made. */
const CNT={r:'Red',b:'Blue'},CNTE={r:'🔴',b:'🔵'},cnOther=t=>t==='r'?'b':'r';
const cnNorm=w=>String(w||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const cnLeft=(g,t)=>g.key.reduce((a,c,i)=>a+(c===t&&!g.rev[i]?1:0),0);
const cnOps=(g,t)=>g.ps.filter(p=>g.tm[p]===t&&g.spy[t]!==p);
const cnShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* teams: last game's teams when the same people play again, otherwise alternate Red/Blue, first two are the spymasters */
function cnAutoTeams(ps,prev){const tm={},spy={r:null,b:null};
  if(prev&&prev.tm&&ps.every(p=>prev.tm[p])){ps.forEach(p=>tm[p]=prev.tm[p]);['r','b'].forEach(t=>{spy[t]=prev.spy&&prev.spy[t]&&tm[prev.spy[t]]===t?prev.spy[t]:ps.find(p=>tm[p]===t)||null})}
  else{ps.forEach((p,i)=>tm[p]=i%2?'b':'r');spy.r=ps[0]||null;spy.b=ps[1]||null}
  return {tm,spy}}
function cnPool(o){const base=o.words==='kid'?CNW_KID:CNW_STD,own=String(o.own||'').split(/[\n,]+/).map(w=>w.trim().toUpperCase()).filter(w=>w&&w.length<=20);
  const all=[...new Set([...(o.ownOnly&&own.length>=25?[]:base),...own])];return all}
function cnDeal(o={}){const ps=act().map(p=>p.id),pool=cnPool(o);if(pool.length<25)return null;
  const words=cnShuf(pool).slice(0,25),start=Math.random()<.5?'r':'b',other=cnOther(start);
  const key=cnShuf([...Array(9).fill(start),...Array(8).fill(other),...Array(7).fill('n'),'x']);
  const T=cnAutoTeams(ps,o.prev);
  return {gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,words,key,rev:Array(25).fill(null),start,tm:T.tm,spy:T.spy,phase:'teams',turn:start,clue:null,guesses:0,votes:{},hist:[],win:null,why:null,solo:!!o.solo,n:0,lastRev:null}}
const cnStale=g=>{const ids=act().map(p=>p.id);return !g||!g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
/* teams are ready when each has a spymaster and at least one guesser */
function cnTeamsOK(g){return ['r','b'].every(t=>g.spy[t]&&g.tm[g.spy[t]]===t&&cnOps(g,t).length>=1)}
function cnTeamsWhy(g){const n=g.ps.length;if(n<4)return 'Codenames needs at least 4 players: 2 teams, each with a spymaster and a guesser.';
  for(const t of ['r','b']){if(!g.spy[t]||g.tm[g.spy[t]]!==t)return `${CNT[t]} needs a spymaster.`;if(!cnOps(g,t).length)return `${CNT[t]} needs at least one guesser.`}return ''}
/* a clue can't be a word still showing on the board, or part of one, or contain one */
function cnClueBad(g,w){const c=cnNorm(w);if(!c)return 'Type a clue word.';if(c.length>30)return 'That clue is too long.';
  for(let i=0;i<25;i++){if(g.rev[i])continue;const b=cnNorm(g.words[i]);if(c===b)return `${g.words[i]} is on the board.`;if(c.includes(b)||b.includes(c))return `Too close to ${g.words[i]}, which is on the board.`}return ''}
function cnEndTurn(g){if(g.clue&&g.hist.length)g.hist[g.hist.length-1].done=true;g.turn=cnOther(g.turn);g.phase='clue';g.clue=null;g.guesses=0;g.votes={}}
function cnFinish(g,win,why){g.phase='done';g.win=win;g.why=why;g.votes={}}
function cnReveal(g,i,by){const t=g.turn,c=g.key[i];g.rev[i]=t;g.guesses++;g.votes={};g.lastRev={i,c,by,tm:t,at:Date.now()};
  const H=g.hist[g.hist.length-1];if(H)H.res.push({i,c,t:Date.now()});
  if(c==='x'){cnFinish(g,cnOther(t),'assassin');return}
  for(const s of [t,cnOther(t)])if(cnLeft(g,s)===0){cnFinish(g,s,'agents');return}
  if(c!==t){cnEndTurn(g);return}
  const n=g.clue?g.clue.n:-1;if(n>0&&g.guesses>=n+1)cnEndTurn(g)}
const cnCanEnd=g=>g.phase==='guess'&&g.guesses>=1;
/* everyone on the team who guesses has picked the same thing */
function cnAgree(g){const O=cnOps(g,g.turn);if(!O.length)return null;const v=O.map(p=>g.votes[p]);if(v.some(x=>x===undefined||x===null))return null;return v.every(x=>x===v[0])?v[0]:null}
function cnMove(g,pid,mv){if(!g||!mv)return false;const t=g.tm[pid];
  if(g.phase==='teams'){
    if(mv.a==='team'){const w=mv.who;if(!g.ps.includes(w)||!['r','b'].includes(mv.tm))return false;const was=g.tm[w];g.tm[w]=mv.tm;if(was!==mv.tm&&g.spy[was]===w)g.spy[was]=g.ps.find(p=>p!==w&&g.tm[p]===was)||null;if(!g.spy[mv.tm])g.spy[mv.tm]=w;g.n++;return true}
    if(mv.a==='spy'){const w=mv.who;if(!g.ps.includes(w))return false;g.spy[g.tm[w]]=w;g.n++;return true}
    if(mv.a==='shuffle'){const P=cnShuf(g.ps);P.forEach((p,i)=>g.tm[p]=i%2?'b':'r');g.spy={r:P[0],b:P[1]};g.n++;return true}
    if(mv.a==='begin'){if(!cnTeamsOK(g))return false;g.phase='clue';g.turn=g.start;g.n++;return true}
    return false}
  if(g.phase==='clue'){if(mv.a!=='clue')return false;if(!g.solo&&g.spy[g.turn]!==pid)return false;
    const w=String(mv.w||'').trim().replace(/\s+/g,' ').toUpperCase(),n=+mv.n;if(cnClueBad(g,w))return false;if(!(n===-1||n>=0&&n<=9))return false;
    g.clue={w,n,by:g.spy[g.turn]};g.hist.push({tm:g.turn,w,n,res:[],t:Date.now()});g.phase='guess';g.guesses=0;g.votes={};g.n++;return true}
  if(g.phase==='guess'){
    if(mv.a==='pick'){/* one shared device: tap and confirm a word straight away */if(!g.solo)return false;const i=+mv.i;if(!(i>=0&&i<25)||g.rev[i])return false;cnReveal(g,i,pid);g.n++;return true}
    if(mv.a==='stop'){if(!g.solo||!cnCanEnd(g))return false;cnEndTurn(g);g.n++;return true}
    if(t!==g.turn||g.spy[t]===pid)return false;
    if(mv.a==='vote'){const v=mv.i;if(v===null||v===undefined){delete g.votes[pid];g.n++;return true}
      if(v==='end'){if(!cnCanEnd(g))return false}else{const i=+v;if(!(i>=0&&i<25)||g.rev[i])return false}
      g.votes[pid]=v==='end'?'end':+v;g.n++;return true}
    if(mv.a==='confirm'){const v=cnAgree(g);if(v===null)return false;if(v==='end'){if(!cnCanEnd(g))return false;cnEndTurn(g)}else cnReveal(g,v,pid);g.n++;return true}
    return false}
  return false}
