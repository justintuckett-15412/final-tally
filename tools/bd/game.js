/* ================= Beyond Balderdash: rules engine (from the 1997 Parker Brothers rule sheet) =================
   State S.bdg = {gid, ps:[pid in seat order], n (moves), round, di (Dasher's index in ps), cn (cards drawn: a cancelled card draws a new one),
     o:{die (roll for the category), laws (house rule: 0 box categories, 1 Laws as a 6th, 2 Laws instead of Dates), db (Dasher bluffs too with 4 or fewer), steps (27), x2 (Double Score step, 0 = none), kids, tlim (bluff seconds, 0 = none), rv (house rule: the step-by-step reveal, seconds per answer; 0 = all at once)},
     used:{cat:[question index]}, pos:{pid:step}, x2n:{pid:1} (points count double this round), rp:{pid:points this round, before doubling},
     phase:'cat'|'write'|'review'|'read'|'vote'|'reveal'|'done', t0 (when the phase started), die, cat,
     q:{c,i,q,a} the card, q2:{c,qs:[{i,q,a}×3],ord} (two players), bl:{pid:bluff}, bc:{pid:1} basically correct, lk:{pid:1} looks like the real answer,
     tEnd (bluff timer end), ans:[{t,by:[pid],real}] the list everyone votes on, votes:{pid:answer index},
     cx (the last cancelled card, shown until the round ends), res (the round's reveal), hist:[...], st:{pid:{fool,right,bc,pts}}, winner,
     rv:{i (the answer on show: an index into bdRvOrd), t (when it started, host clock), pz (paused: ms left)} the step-by-step reveal; null = the full reveal,
     nz/nzl/nudge (nudges, like Telestrations) }
   Moves: bdMove(g,pid,mv) -> true when made. */
const BDCATS=['words','people','initials','movies','dates'];
/* house rule (not in the box): Laws as a 6th category (die: 6 = Laws), or Laws instead of Dates like the newer edition (die: 5 = Laws, 6 = the Dasher's choice) */
const BDALL=[...BDCATS,'laws'],BDSWAP=['words','people','initials','movies','laws'];
const bdCatsOf=m=>+m===1?BDALL:+m===2?BDSWAP:BDCATS;
const bdCats=g=>bdCatsOf(g&&g.o&&g.o.laws);
const BDCATN={words:'Words',people:'People',initials:'Initials',movies:'Movies',dates:'Dates',laws:'Laws'};
const BDASK={words:'What is the definition?',people:'What is this person known for?',initials:'What does this stand for?',movies:'What is this film about?',dates:'What happened on this day?',laws:'What does this law say?'};
const BDICO={words:'📖',people:'🧑',initials:'🔤',movies:'🎬',dates:'📅',laws:'⚖️'};
const bdShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* identical bluffs: case, spaces and punctuation don't count */
const bdNorm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const bdClean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,160);
const bdTwo=g=>g.ps.length===2;
const bdDasher=g=>g.ps[g.di];
/* the optional rule: with 4 or fewer players the Dasher writes a bluff too (never in the two-player game) */
const bdDB=g=>!!g.o.db&&!bdTwo(g)&&g.ps.length<=4;
const bdWriters=g=>g.ps.filter(p=>p!==bdDasher(g)||bdDB(g));
const bdVoters=g=>bdTwo(g)?g.ps.filter(p=>p!==bdDasher(g)):g.ps.filter(p=>p!==bdDasher(g)&&!g.bc[p]);
/* the order pieces move in: from the Dasher's left, the Dasher last */
const bdOrder=g=>g.ps.map((_,k)=>g.ps[(g.di+1+k)%g.ps.length]);
/* the questions a category can use (Kids mode: kid questions only) */
function bdPool(g,c){const L=(typeof BDQ!=='undefined'&&BDQ[c])||[];const o=[];L.forEach((x,i)=>{if(!g.o.kids||x[2])o.push(i)});return o}
const bdNeed=g=>bdTwo(g)?3:1;
/* can the Dasher pick this category? (Initials can't be played with two) */
function bdCatOK(g,c){if(!bdCats(g).includes(c))return false;if(bdTwo(g)&&c==='initials')return false;return bdPool(g,c).length>=bdNeed(g)}
/* with the die: 1-5 is that category; a 6 is the Dasher's choice (Laws with that house rule); a category we can't play is the Dasher's choice */
function bdDieCat(g){if(!g.o.die||!g.die||g.die>bdCats(g).length)return null;const c=bdCats(g)[g.die-1];return bdCatOK(g,c)?c:null}
function bdDeal(o={}){const ps=act().map(p=>p.id);if(ps.length<2)return null;const st=Math.round(+o.steps)||27,steps=Math.max(5,Math.min(60,st));
  let x2=o.x2==null?14:Math.round(+o.x2)||0;if(x2<0||x2>=steps)x2=0;
  const g={gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,n:0,round:1,di:Math.floor(Math.random()*ps.length),cn:0,
    o:{die:!!o.die,db:!!o.db,laws:[0,1,2].includes(+o.laws)?+o.laws:0,steps,x2,kids:!!o.kids,tlim:[0,120,180,300].includes(+o.tlim)?+o.tlim:0,rv:o.rv==null?5:BDRVS.includes(+o.rv)?+o.rv:5},
    used:{},pos:Object.fromEntries(ps.map(p=>[p,0])),x2n:{},rp:{},hist:[],st:Object.fromEntries(ps.map(p=>[p,{fool:0,right:0,bc:0,pts:0}])),winner:null,cx:null};
  bdCatPhase(g);return g}
function bdCatPhase(g){g.phase='cat';g.rv=null;g.t0=Date.now();g.cat=null;g.q=null;g.q2=null;g.bl={};g.bc={};g.lk={};g.votes={};g.ans=null;g.tEnd=null;g.nz={};
  g.die=g.o.die?1+Math.floor(Math.random()*6):null}
/* draw k unused questions from a category (a category that runs out starts over) */
function bdDraw(g,c,k){const pool=bdPool(g,c);if(pool.length<k)return null;let used=new Set(g.used[c]||[]);let free=pool.filter(i=>!used.has(i));
  if(free.length<k){used=new Set();free=pool.slice()}const pick=bdShuf(free).slice(0,k);pick.forEach(i=>used.add(i));g.used[c]=[...used];
  return pick.map(i=>({i,q:BDQ[c][i][0],a:BDQ[c][i][1]}))}
function bdMove(g,pid,mv){if(!g||!mv||!g.ps.includes(pid))return false;const D=bdDasher(g),now=Date.now();
  if(mv.a==='nudge')return bdNudge(g,pid,mv);
  if(g.phase==='cat'&&mv.a==='cat'){if(pid!==D)return false;const c=String(mv.c||'');if(!bdCatOK(g,c))return false;const dc=bdDieCat(g);if(dc&&c!==dc)return false;
    const Q=bdDraw(g,c,bdNeed(g));if(!Q)return false;g.cat=c;g.cn++;g.n++;g.t0=now;
    if(bdTwo(g)){g.q2={c,qs:Q,ord:bdShuf([0,1,2])};g.phase='read';return true}
    g.q={c,...Q[0]};g.phase='write';g.tEnd=g.o.tlim?now+g.o.tlim*1000:null;return true}
  /* a bluff (typed again = changed, until everyone's in) */
  if(g.phase==='write'&&mv.a==='bluff'){if(!bdWriters(g).includes(pid))return false;if(mv.cn!=null&&+mv.cn!==g.cn)return false;const t=bdClean(mv.t);if(!t)return false;
    g.bl[pid]=t;g.n++;if(bdWriters(g).every(p=>g.bl[p]))bdToReview(g);return true}
  /* the bluff timer ran out (a few seconds' grace): on to the Dasher with whatever's in */
  if(g.phase==='write'&&mv.a==='timeup'){if(!g.tEnd||now<g.tEnd+3000)return false;bdToReview(g);g.n++;return true}
  if(g.phase==='review'&&mv.a==='bc'){if(pid!==D)return false;const p=String(mv.p);if(p===D||!g.bl[p])return false;if(mv.on)g.bc[p]=1;else delete g.bc[p];g.n++;return true}
  if(g.phase==='review'&&mv.a==='show'){if(pid!==D)return false;const B=Object.keys(g.bc).filter(p=>g.bc[p]);
    B.forEach(p=>{g.rp[p]=(g.rp[p]||0)+3;g.st[p].bc++});
    /* more than one basically correct: the card is cancelled (they keep their 3 points) and the Dasher picks a new card */
    if(B.length>1){g.cx={by:B,c:g.q.c,q:g.q.q,a:g.q.a,bl:Object.fromEntries(B.map(p=>[p,g.bl[p]]))};g.n++;bdCatPhase(g);return true}
    const grp=new Map();Object.keys(g.bl).filter(p=>!g.bc[p]).sort((a,b)=>g.ps.indexOf(a)-g.ps.indexOf(b)).forEach(p=>{const k=bdNorm(g.bl[p])||('#'+p);
      if(!grp.has(k))grp.set(k,{t:g.bl[p],by:[]});grp.get(k).by.push(p)});
    g.ans=bdShuf([...grp.values(),{t:g.q.a,by:[],real:1}]);g.votes={};g.phase='vote';g.t0=now;g.n++;return true}
  /* two players: the Dasher picks which of the 3 questions to read; the 3 real answers are the choices */
  if(g.phase==='read'&&mv.a==='read'){if(pid!==D)return false;const k=+mv.k;if(!(k>=0&&k<3))return false;const Q=g.q2.qs[k];
    g.q={c:g.q2.c,i:Q.i,q:Q.q,a:Q.a};g.ans=g.q2.ord.map(j=>({t:g.q2.qs[j].a,by:[],real:j===k?1:0}));g.votes={};g.phase='vote';g.t0=now;g.n++;return true}
  if(g.phase==='vote'&&mv.a==='vote'){if(!bdVoters(g).includes(pid))return false;const i=+mv.i;if(!(i>=0&&i<g.ans.length))return false;if(g.votes[pid]===i)return false;
    g.votes[pid]=i;g.n++;if(bdVoters(g).every(p=>g.votes[p]!=null))bdReveal(g);return true}
  if(g.phase==='reveal'&&g.rv){const R=g.rv,n=bdRvOrd(g).length,dur=g.o.rv*1000;
    /* the Dasher (or the host, for them) skips ahead; mv.i = the step they were looking at, so a tap that crosses an automatic step never skips two */
    if(mv.a==='rvnext'){if(pid!==D)return false;if(mv.i!=null&&+mv.i!==R.i)return false;bdRvStep(g);g.n++;return true}
    /* the host moves on once the step's time is up */
    if(mv.a==='rvauto'){if(!bdRvDue(g))return false;bdRvStep(g);g.n++;return true}
    if(mv.a==='rvpause'){if(pid!==D)return false;if(mv.on){if(R.pz!=null)return false;R.pz=Math.max(0,Math.min(dur,(R.t||now)+dur-now))}else{if(R.pz==null)return false;R.t=now-(dur-R.pz);delete R.pz}g.n++;return true}
    return false}
  if(g.phase==='reveal'&&mv.a==='next'){if(g.winner){g.phase='done';g.n++;return true}
    /* the round waits for the Dasher to pass the Dasher on */
    if(pid!==D)return false;
    g.round++;g.di=(g.di+1)%g.ps.length;g.rp={};g.cx=null;g.res=null;bdCatPhase(g);g.n++;return true}
  return false}
function bdToReview(g){g.phase='review';g.t0=Date.now();g.tEnd=null;g.bc={};g.lk={};
  /* a bluff that is the real answer is flagged for the Dasher (and pre-marked; the Dasher decides) */
  const a=bdNorm(g.q.a);Object.keys(g.bl).forEach(p=>{if(p!==bdDasher(g)&&bdNorm(g.bl[p])===a){g.lk[p]=1;g.bc[p]=1}})}
/* the reveal: points for this card, doubling, the pieces move from the Dasher's left, the first to reach FINISH wins */
function bdReveal(g){const D=bdDasher(g),rp={...g.rp},add=(p,n)=>{rp[p]=(rp[p]||0)+n},why={};const W=(p,s)=>(why[p]=why[p]||[]).push(s);
  Object.keys(g.rp).forEach(p=>{if(g.rp[p])W(p,`basically correct +${g.rp[p]}`)});
  const V=bdVoters(g);
  if(bdTwo(g)){const p=V[0],A=g.ans[g.votes[p]];if(A&&A.real){add(p,2);W(p,'right answer +2');g.st[p].right++}else{add(D,1);W(D,'fooled the guesser +1')}}
  else{let found=false;
    V.forEach(v=>{const A=g.ans[g.votes[v]];if(!A)return;if(A.real){found=true;add(v,2);W(v,'found the real answer +2');g.st[v].right++;return}
      A.by.forEach(w=>{if(w===v)return;add(w,1);g.st[w].fool++})});
    g.ps.forEach(p=>{const n=V.filter(v=>{const A=g.ans[g.votes[v]];return A&&!A.real&&v!==p&&A.by.includes(p)}).length;if(n)W(p,`${n} vote${n===1?'':'s'} for your bluff +${n}`)});
    if(V.length&&!found){add(D,3);W(D,'nobody found the real answer +3')}}
  const dbl={...g.x2n},gain={},from={...g.pos},next={};let win=null;
  bdOrder(g).forEach(p=>{const n=(rp[p]||0)*(dbl[p]?2:1);gain[p]=n;g.st[p].pts+=n;if(win)return;
    g.pos[p]=Math.min(g.o.steps,g.pos[p]+n);if(g.pos[p]>=g.o.steps){win=p;return}if(n>0&&g.o.x2&&g.pos[p]===g.o.x2)next[p]=1});
  g.x2n=win?{}:next;g.winner=win;
  g.res={rp,gain,from,to:{...g.pos},dbl,x2next:next,why,votes:{...g.votes},win,order:bdOrder(g)};
  g.hist.push({r:g.round,d:D,c:g.q.c,q:g.q.q,a:g.q.a,gain});
  g.phase='reveal';g.t0=Date.now();g.rv=g.o.rv?{i:0,t:g.t0}:null}
/* the step-by-step reveal (house rule "One at a time"): the bluffs in the order shown, the real answer last, then the full reveal */
const BDRVS=[0,3,5,8,10];
const bdRvOrd=g=>{const L=(g.ans||[]).map((_,i)=>i);return [...L.filter(i=>!g.ans[i].real),...L.filter(i=>g.ans[i].real)]};
function bdRvStep(g){const R=g.rv;if(!R)return;if(R.i+1<bdRvOrd(g).length){g.rv={i:R.i+1,t:Date.now()}}else{g.rv=null;g.t0=Date.now()}}
function bdRvDue(g,now){const R=g&&g.rv;if(!R||g.phase!=='reveal'||!g.o.rv||R.pz!=null)return false;return (now||Date.now())>=(R.t||0)+g.o.rv*1000}
/* what one answer did this round: who wrote it, who picked it, the points it gave its writers (before doubling) */
function bdAnsInfo(g,i){const A=g.ans[i],V=(g.res&&g.res.votes)||g.votes||{},pick=g.ps.filter(p=>V[p]===i),fooled=pick.filter(p=>!A.by.includes(p));
  /* a vote from a co-writer of an identical bluff still scores for the other writer; your own vote never does */
  return {A,pick,fooled,ptsOf:w=>A.real||bdTwo(g)?0:pick.filter(p=>p!==w).length}}
const bdStale=g=>{const ids=act().map(p=>p.id);return !g||!g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
/* "Nudge" (as in Telestrations): who this player may nudge now, and what they're waiting on.
   cat / review / read: the Dasher, once the phase is 20 s old · write: once you've written (or you're the Dasher), anyone still writing · vote: once you've voted (or don't vote), anyone still voting */
const BDNZCOOL=15000,BDNZWAIT=20000;
function bdNudgeable(g,pid,now,slack){const o={};if(!g||!g.ps||!g.ps.includes(pid))return o;now=now||Date.now();const D=bdDasher(g);
  if(['cat','review','read'].includes(g.phase)){if(pid!==D&&now-(g.t0||now)>=BDNZWAIT-(slack||0))o[D]=g.phase}
  else if(g.phase==='write'){const W=bdWriters(g);if(!W.includes(pid)||g.bl[pid])W.forEach(p=>{if(p!==pid&&!g.bl[p])o[p]='bluff'})}
  else if(g.phase==='reveal'&&!g.rv&&!g.winner){if(pid!==D&&now-(g.t0||now)>=BDNZWAIT-(slack||0))o[D]='pass'}
  else if(g.phase==='vote'){const V=bdVoters(g);if(!V.includes(pid)||g.votes[pid]!=null)V.forEach(p=>{if(p!==pid&&g.votes[p]==null)o[p]='vote'})}
  return o}
const bdNudgeCool=(g,by,p,now)=>Math.max(0,BDNZCOOL-((now||Date.now())-(((g&&g.nzl)||{})[by+'>'+p]||-1e15)));
function bdNudge(g,pid,mv){const now=Date.now(),can=bdNudgeable(g,pid,now,3000),want=(Array.isArray(mv.to)?mv.to:[mv.to]).map(String);
  const to=[...new Set(want)].filter(p=>can[p]&&!bdNudgeCool(g,pid,p,now));if(!to.length)return false;g.nz=g.nz||{};g.nzl=g.nzl||{};
  const k=((g.nudge&&g.nudge.k)||0)+1;to.forEach(p=>{g.nz[p]={k,by:pid,at:now,w:can[p]};g.nzl[pid+'>'+p]=now});
  for(const x in g.nzl)if(now-g.nzl[x]>BDNZCOOL*2)delete g.nzl[x];
  g.nudge={k,by:pid,to,at:now};g.n++;return true}
