/* ================= Telestrations: rules engine (from the 2010 rule sheet) =================
   State S.tsg = {gid, ps:[pid in seat order], n, round, rounds (3, or 0 = keep playing), dir (1 = left, -1 = right),
     scoring:'friendly'|'competitive'|'none', colors (house rule: colored pens; false = black only, official), timer (sketch seconds, 0 = none), die (1-6),
     cards:{pid:{slots:[{t:'w',w}|{t:'blank'}|{t:'cat',c}], any:bool}}, books:{owner:{word, pages:[{by,kind:'draw'|'guess',d}] }},
     phase:'pick'|'play'|'reveal'|'roundEnd'|'done', step, steps, sub:{pid:1} (handed in this step), tEnd (timer end, ms),
     rv:{i (owner index in ps), p (page index; -1 = secret word)}, marks:{owner:{sketch:pid|null, guess:pid|null, self:bool, match:{pageIndex:bool}}},
     score:{pid:[r1,r2,...]}, n:moves,
     auto (house rule "Auto-play" for the Big Reveal: seconds per page, 0 = the owner flips, official), rv.t (when the shown page started, host clock), rv.pz (paused: ms that were left),
     async (house rule "Pass when ready": each book moves on as soon as its page is done), at:{pid:page index they're on}, te:{pid:their own sketch timer end, ms} }
   Pages: a drawing d is a compact string from tsEnc (see draw.js); a guess d is text.
   Moves: tsMove(g,pid,mv) -> true when made. */
const tsN=g=>g.ps.length,tsOdd=g=>tsN(g)%2===1;
const tsShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* the number of pages each book gets this round: even = everyone (owner draws first), odd = everyone else (book passes first) */
const tsSteps=g=>tsOdd(g)?tsN(g)-1:tsN(g);
/* who holds owner o's book at step k */
function tsHolder(g,owner,k){const n=tsN(g),o=g.ps.indexOf(owner),off=tsOdd(g)?k+1:k;return g.ps[((o+off*g.dir)%n+n*8)%n]}
/* the book a player works on at step k */
function tsBookOf(g,pid,k){return g.ps.find(o=>tsHolder(g,o,k)===pid)}
const tsKind=k=>k%2===0?'draw':'guess';
/* "Pass when ready": a player's page = the first page they haven't done (books fill in order, so this is always right, even after a mixed sync) */
const tsAsync=g=>!!(g&&g.async);
function tsAt(g,pid){if(!tsAsync(g))return g.step;for(let k=0;k<g.steps;k++){const B=g.books[tsBookOf(g,pid,k)];if(!B||!B.pages||!B.pages[k])return k}return g.steps}
/* can this player work page k now? (its book's previous page is done) */
function tsCanAct(g,pid,k){if(k>=g.steps)return false;if(k===0)return true;const B=g.books[tsBookOf(g,pid,k)];return !!(B&&B.pages&&B.pages[k-1])}
/* is this player finished for now: with "pass together" until the step turns, with "pass when ready" for the whole round */
const tsDoneP=(g,pid)=>tsAsync(g)?tsAt(g,pid)>=g.steps:!!(g.sub&&g.sub[pid]);
/* a card: 6 slots from our list; sometimes a blank (make one up) or a category, and sometimes "pick any word on the card" */
function tsCard(pool,used){const words=tsShuf(pool.filter(w=>!used.has(w))).slice(0,6),slots=words.map(w=>({t:'w',w}));
  if(Math.random()<.35){const i=Math.floor(Math.random()*6);slots[i]=Math.random()<.5?{t:'blank'}:{t:'cat',c:TSCAT[Math.floor(Math.random()*TSCAT.length)]}}
  words.forEach(w=>used.add(w));return {slots,any:Math.random()<.12}}
function tsPool(o){const base=o.words==='kid'?TSW_KID:TSW_STD,own=String(o.own||'').split(/[\n,]+/).map(w=>w.trim()).filter(w=>w&&w.length<=30);
  return [...new Set([...(o.ownOnly&&own.length>=12?[]:base),...own])]}
function tsDeal(o={}){const ps=act().map(p=>p.id);if(ps.length<4)return null;
  const g={gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,round:0,rounds:o.scoring==='none'?0:3,dir:1,flip:o.flip!==false,
    scoring:['friendly','competitive','none'].includes(o.scoring)?o.scoring:'friendly',colors:!!o.colors,auto:[4,6,8,10].includes(+o.auto)?+o.auto:0,timer:+o.timer===0?0:Number.isInteger(+o.timer)&&+o.timer>=10&&+o.timer<=600?+o.timer:60,async:!!o.async,
    o:{words:o.words,own:o.own,ownOnly:o.ownOnly},usedW:[],score:Object.fromEntries(ps.map(p=>[p,[]])),n:0};
  tsNewRound(g);return g}
function tsNewRound(g){g.round++;if(g.round>1&&g.flip)g.dir=-g.dir;g.die=1+Math.floor(Math.random()*6);
  const used=new Set(g.usedW),pool=tsPool(g.o||{});g.cards={};g.books={};g.ps.forEach(p=>{g.cards[p]=tsCard(pool.length>=60?pool:TSW_STD,used);g.books[p]={word:null,pages:[]}});g.usedW=[...used];
  g.phase='pick';g.step=0;g.steps=tsSteps(g);g.sub={};g.tEnd=null;g.rv=null;g.marks={};g.score&&g.ps.forEach(p=>{(g.score[p]=g.score[p]||[])[g.round-1]=0})}
/* the word the die picks on a player's card (null = they choose or make one up) */
function tsRolled(g,pid){const C=g.cards[pid];if(!C)return null;const s=C.slots[g.die-1];return s&&s.t==='w'&&!C.any?s.w:null}
const tsClean=w=>String(w||'').replace(/\s+/g,' ').trim().slice(0,40);
const tsSame=(a,b)=>{const f=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/s$/,'');return !!f(a)&&f(a)===f(b)};
function tsStartPlay(g){g.phase='play';g.step=0;g.sub={};if(tsAsync(g)){g.tEnd=null;g.at={};g.te={};tsAsyncStep(g);return}g.tEnd=g.timer?Date.now()+g.timer*1000:null}
/* "Pass when ready": after any page, update who's on which page, start the sketch timer of anyone whose sketch page just arrived, and end the play when every book is full */
function tsAsyncStep(g){const now=Date.now();g.at=g.at||{};g.te=g.te||{};g.sub=g.sub||{};let all=true;
  g.ps.forEach(p=>{const k=tsAt(g,p);if(g.at[p]!==k){g.at[p]=k;delete g.te[p]}
    if(k>=g.steps){g.sub[p]=1;delete g.te[p];return}all=false;
    if(g.timer&&tsKind(k)==='draw'&&tsCanAct(g,p,k)&&!g.te[p])g.te[p]=now+g.timer*1000});
  if(all){g.step=g.steps;g.phase='reveal';g.rv={i:0,p:-1,t:now};g.tEnd=null;g.te={}}}
function tsAdvance(g){g.step++;g.sub={};if(g.step>=g.steps){g.phase='reveal';g.rv={i:0,p:-1,t:Date.now()};g.tEnd=null;return}
  g.tEnd=tsKind(g.step)==='draw'&&g.timer?Date.now()+g.timer*1000:null}
/* what a player sees for their task: the word to draw, or the drawing to guess
   (k = the page; with "pass when ready", wait:true and from = who still has the book when it hasn't reached you yet) */
function tsPrompt(g,pid){if(g.phase!=='play')return null;const k=tsAt(g,pid);if(k>=g.steps)return null;const o=tsBookOf(g,pid,k),B=g.books[o];
  if(k===0)return {kind:'draw',owner:o,k,word:B.word};const prev=B.pages[k-1];if(!prev)return {kind:tsKind(k),owner:o,k,wait:true,from:tsHolder(g,o,k-1)};
  return {kind:tsKind(k),owner:o,k,word:prev.kind==='guess'?prev.d:null,draw:prev.kind==='draw'?prev.d:null}}
const tsMax=6000; /* largest drawing we keep, in characters */
function tsMove(g,pid,mv){if(!g||!mv||!g.ps.includes(pid))return false;
  if(g.phase==='pick'&&mv.a==='word'){if(g.books[pid].word)return false;const C=g.cards[pid];let w=tsRolled(g,pid);
    if(!w){if(C.any&&mv.slot!=null&&C.slots[+mv.slot]&&C.slots[+mv.slot].t==='w')w=C.slots[+mv.slot].w;else w=mv.w}
    w=tsClean(w);if(!w)return false;g.books[pid].word=w;g.n++;if(g.ps.every(p=>g.books[p].word))tsStartPlay(g);return true}
  /* a page; the move may name its book (o) and page (k), so a late move never lands on another page */
  if(g.phase==='play'&&mv.a==='page'){const as=tsAsync(g);if(!as&&g.sub[pid])return false;const k=tsAt(g,pid);if(k>=g.steps||!tsCanAct(g,pid,k))return false;
    const o=tsBookOf(g,pid,k),B=g.books[o],kind=tsKind(k);if(mv.k!=null&&+mv.k!==k||mv.o!=null&&mv.o!==o||B.pages[k])return false;
    let d=String(mv.d||'');if(kind==='draw'){if(d.length>tsMax)d=d.slice(0,tsMax)}else{d=tsClean(d)||'?'}
    B.pages[k]={by:pid,kind,d};g.n++;if(as){tsAsyncStep(g);return true}g.sub[pid]=1;if(g.ps.every(p=>g.sub[p]))tsAdvance(g);return true}
  /* the timer ran out: anyone (normally the host) closes the sketch step; empty drawings stay blank */
  if(g.phase==='play'&&mv.a==='timeup'&&tsAsync(g)){const now=Date.now();let any=false;
    /* "pass when ready": each player's own timer; a blank page for anyone whose time (plus a few seconds) ran out */
    g.ps.forEach(p=>{const t=(g.te||{})[p];if(!t||now<t+4000)return;const k=tsAt(g,p);if(k>=g.steps||tsKind(k)!=='draw'||!tsCanAct(g,p,k))return;
      g.books[tsBookOf(g,p,k)].pages[k]={by:p,kind:'draw',d:''};any=true});if(!any)return false;tsAsyncStep(g);g.n++;return true}
  if(g.phase==='play'&&mv.a==='timeup'){if(!g.tEnd||Date.now()<g.tEnd+4000||tsKind(g.step)!=='draw')return false;
    g.ps.forEach(p=>{if(!g.sub[p]){const o=tsBookOf(g,p,g.step);g.books[o].pages[g.step]={by:p,kind:'draw',d:''};g.sub[p]=1}});tsAdvance(g);g.n++;return true}
  if(g.phase==='reveal'){const R=g.rv,owner=g.ps[R.i];if(!R)return false;
    /* the owner flips (mv.p = the page they were looking at, so a tap that crosses an auto-play turn never skips a page); auto-play's countdown starts again */
    if(mv.a==='rvnext'||mv.a==='rvprev'){if(pid!==owner&&!mv.any)return false;if(mv.p!=null&&+mv.p!==R.p)return false;const last=g.books[owner].pages.length-1;
      if(mv.a==='rvnext'){if(R.p<last)R.p++;else return false}else{if(R.p>-1)R.p--;else return false}R.t=Date.now();if(R.pz!=null)R.pz=g.auto*1000;g.n++;return true}
    /* "Auto-play": the host turns the page once its time is up (never past the last page: the owner gives out points there) */
    if(mv.a==='rvauto'){if(tsAutoDue(g)!=='page')return false;R.p++;R.t=Date.now();g.n++;return true}
    if(mv.a==='rvpause'){if(pid!==owner||!g.auto)return false;const now=Date.now(),dur=g.auto*1000;
      if(mv.on){if(R.pz!=null)return false;R.pz=Math.max(0,Math.min(dur,(R.t||now)+dur-now))}else{if(R.pz==null)return false;R.t=now-(dur-R.pz);delete R.pz}g.n++;return true}
    if(mv.a==='mark'){if(pid!==owner)return false;const M=g.marks[owner]=g.marks[owner]||{sketch:null,guess:null,self:false,match:{}};
      if(mv.f==='sketch'||mv.f==='guess'){const P=g.books[owner].pages[+mv.p];if(!P||P.kind!==(mv.f==='sketch'?'draw':'guess')||P.by===owner)return false;M[mv.f]=M[mv.f]===P.by&&M[mv.f+'P']===+mv.p?null:P.by;M[mv.f+'P']=M[mv.f]?+mv.p:null}
      else if(mv.f==='self')M.self=!M.self;else if(mv.f==='match'){const i=+mv.p,P=g.books[owner].pages[i];if(!P||P.kind!=='guess')return false;M.match[i]=!M.match[i]}else return false;g.n++;return true}
    if(mv.a==='bookdone'){if(pid!==owner)return false;tsScoreBook(g,owner);if(R.i+1<tsN(g)){g.rv={i:R.i+1,p:-1,t:Date.now()}}else{g.phase=g.rounds&&g.round>=g.rounds?'done':'roundEnd';g.rv=null}g.n++;return true}}
  if(g.phase==='roundEnd'&&mv.a==='next'){tsNewRound(g);g.n++;return true}
  if(g.phase==='roundEnd'&&mv.a==='stop'){g.phase='done';g.n++;return true}
  return false}
/* "Auto-play": what's due now: 'page' (turn it), 'book' (no scoring: move on from the last page), or null (not yet, paused, or waiting for the owner's Done) */
function tsAutoDue(g,now){const R=g&&g.rv;if(!R||g.phase!=='reveal'||!g.auto||R.pz!=null)return null;if((now||Date.now())<(R.t||0)+g.auto*1000)return null;
  const last=g.books[g.ps[R.i]].pages.length-1;return R.p<last?'page':g.scoring==='none'?'book':null}
/* a book's points, once its owner has finished the reveal */
function tsScoreBook(g,owner){if(g.scoring==='none')return;const M=g.marks[owner]||{match:{}},B=g.books[owner],r=g.round-1,add=(p,n)=>{if(p&&g.score[p]){g.score[p][r]=(g.score[p][r]||0)+n}};
  const pg=B.pages,lastG=pg.length-1,selfM=pg[lastG]&&tsMatchOK(g,owner,lastG,true);
  if(g.scoring==='friendly'){add(M.sketch,1);add(M.guess,1);if(M.self)add(owner,1);return}
  /* competitive: a guess scores when it matches the secret word or the guess before it; the sketch it came from scores too */
  pg.forEach((P,i)=>{if(P.kind!=='guess'||!tsMatchOK(g,owner,i))return;add(P.by,1);const s=pg[i-1];if(s&&s.kind==='draw'&&s.by!==owner)add(s.by,1)});if(M.self)add(owner,1)}
/* did the guess on page i match? the owner's tick wins; otherwise the words are compared */
function tsMatchOK(g,owner,i,secretOnly){const M=(g.marks[owner]||{}).match||{},B=g.books[owner],P=B.pages[i];if(!P||P.kind!=='guess')return false;if(i in M)return !!M[i];
  if(tsSame(P.d,B.word))return true;if(secretOnly)return false;const prev=B.pages[i-2];return !!prev&&prev.kind==='guess'&&tsSame(P.d,prev.d)}
const tsTotal=(g,p)=>(g.score[p]||[]).reduce((a,b)=>a+(b||0),0);
const tsStale=g=>{const ids=act().map(p=>p.id);return !g||!g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
