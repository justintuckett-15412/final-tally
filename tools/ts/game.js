/* ================= Telestrations: rules engine (from the 2010 rule sheet) =================
   State S.tsg = {gid, ps:[pid in seat order], n, round, rounds (3, or 0 = keep playing), dir (1 = left, -1 = right),
     scoring:'friendly'|'competitive'|'none', colors (house rule: colored pens; false = black only, official), timer (sketch seconds, 0 = none), die (1-6),
     cards:{pid:{slots:[{t:'w',w}|{t:'blank'}|{t:'cat',c}], any:bool}}, books:{owner:{word, pages:[{by,kind:'draw'|'guess',d}] }},
     phase:'pick'|'play'|'reveal'|'roundEnd'|'done', step, steps, sub:{pid:1} (handed in this step), tEnd (timer end, ms),
     rv:{i (owner index in ps), p (page index; -1 = secret word)}, marks:{owner:{sketch:pid|null, guess:pid|null, self:bool, match:{pageIndex:bool}}},
     score:{pid:[r1,r2,...]}, n:moves }
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
/* a card: 6 slots from our list; sometimes a blank (make one up) or a category, and sometimes "pick any word on the card" */
function tsCard(pool,used){const words=tsShuf(pool.filter(w=>!used.has(w))).slice(0,6),slots=words.map(w=>({t:'w',w}));
  if(Math.random()<.35){const i=Math.floor(Math.random()*6);slots[i]=Math.random()<.5?{t:'blank'}:{t:'cat',c:TSCAT[Math.floor(Math.random()*TSCAT.length)]}}
  words.forEach(w=>used.add(w));return {slots,any:Math.random()<.12}}
function tsPool(o){const base=o.words==='kid'?TSW_KID:TSW_STD,own=String(o.own||'').split(/[\n,]+/).map(w=>w.trim()).filter(w=>w&&w.length<=30);
  return [...new Set([...(o.ownOnly&&own.length>=12?[]:base),...own])]}
function tsDeal(o={}){const ps=act().map(p=>p.id);if(ps.length<4)return null;
  const g={gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,round:0,rounds:o.scoring==='none'?0:3,dir:1,flip:o.flip!==false,
    scoring:['friendly','competitive','none'].includes(o.scoring)?o.scoring:'friendly',colors:!!o.colors,timer:[0,30,60,90,120].includes(+o.timer)?+o.timer:60,
    o:{words:o.words,own:o.own,ownOnly:o.ownOnly},usedW:[],score:Object.fromEntries(ps.map(p=>[p,[]])),n:0};
  tsNewRound(g);return g}
function tsNewRound(g){g.round++;if(g.round>1&&g.flip)g.dir=-g.dir;g.die=1+Math.floor(Math.random()*6);
  const used=new Set(g.usedW),pool=tsPool(g.o||{});g.cards={};g.books={};g.ps.forEach(p=>{g.cards[p]=tsCard(pool.length>=60?pool:TSW_STD,used);g.books[p]={word:null,pages:[]}});g.usedW=[...used];
  g.phase='pick';g.step=0;g.steps=tsSteps(g);g.sub={};g.tEnd=null;g.rv=null;g.marks={};g.score&&g.ps.forEach(p=>{(g.score[p]=g.score[p]||[])[g.round-1]=0})}
/* the word the die picks on a player's card (null = they choose or make one up) */
function tsRolled(g,pid){const C=g.cards[pid];if(!C)return null;const s=C.slots[g.die-1];return s&&s.t==='w'&&!C.any?s.w:null}
const tsClean=w=>String(w||'').replace(/\s+/g,' ').trim().slice(0,40);
const tsSame=(a,b)=>{const f=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/s$/,'');return !!f(a)&&f(a)===f(b)};
function tsStartPlay(g){g.phase='play';g.step=0;g.sub={};g.tEnd=g.timer?Date.now()+g.timer*1000:null}
function tsAdvance(g){g.step++;g.sub={};if(g.step>=g.steps){g.phase='reveal';g.rv={i:0,p:-1};g.tEnd=null;return}
  g.tEnd=tsKind(g.step)==='draw'&&g.timer?Date.now()+g.timer*1000:null}
/* what a player sees for their task this step: the word to draw, or the drawing to guess */
function tsPrompt(g,pid){if(g.phase!=='play')return null;const o=tsBookOf(g,pid,g.step),B=g.books[o],k=g.step;
  if(k===0)return {kind:'draw',owner:o,word:B.word};const prev=B.pages[k-1];return {kind:tsKind(k),owner:o,word:prev&&prev.kind==='guess'?prev.d:null,draw:prev&&prev.kind==='draw'?prev.d:null}}
const tsMax=6000; /* largest drawing we keep, in characters */
function tsMove(g,pid,mv){if(!g||!mv||!g.ps.includes(pid))return false;
  if(g.phase==='pick'&&mv.a==='word'){if(g.books[pid].word)return false;const C=g.cards[pid];let w=tsRolled(g,pid);
    if(!w){if(C.any&&mv.slot!=null&&C.slots[+mv.slot]&&C.slots[+mv.slot].t==='w')w=C.slots[+mv.slot].w;else w=mv.w}
    w=tsClean(w);if(!w)return false;g.books[pid].word=w;g.n++;if(g.ps.every(p=>g.books[p].word))tsStartPlay(g);return true}
  if(g.phase==='play'&&mv.a==='page'){if(g.sub[pid])return false;const k=g.step,o=tsBookOf(g,pid,k),B=g.books[o],kind=tsKind(k);
    let d=String(mv.d||'');if(kind==='draw'){if(d.length>tsMax)d=d.slice(0,tsMax)}else{d=tsClean(d)||'?'}
    B.pages[k]={by:pid,kind,d};g.sub[pid]=1;g.n++;if(g.ps.every(p=>g.sub[p]))tsAdvance(g);return true}
  /* the timer ran out: anyone (normally the host) closes the sketch step; empty drawings stay blank */
  if(g.phase==='play'&&mv.a==='timeup'){if(!g.tEnd||Date.now()<g.tEnd+4000||tsKind(g.step)!=='draw')return false;
    g.ps.forEach(p=>{if(!g.sub[p]){const o=tsBookOf(g,p,g.step);g.books[o].pages[g.step]={by:p,kind:'draw',d:''};g.sub[p]=1}});tsAdvance(g);g.n++;return true}
  if(g.phase==='reveal'){const R=g.rv,owner=g.ps[R.i];if(!R)return false;
    if(mv.a==='rvnext'||mv.a==='rvprev'){if(pid!==owner&&!mv.any)return false;const last=g.books[owner].pages.length-1;
      if(mv.a==='rvnext'){if(R.p<last)R.p++;else return false}else{if(R.p>-1)R.p--;else return false}g.n++;return true}
    if(mv.a==='mark'){if(pid!==owner)return false;const M=g.marks[owner]=g.marks[owner]||{sketch:null,guess:null,self:false,match:{}};
      if(mv.f==='sketch'||mv.f==='guess'){const P=g.books[owner].pages[+mv.p];if(!P||P.kind!==(mv.f==='sketch'?'draw':'guess')||P.by===owner)return false;M[mv.f]=M[mv.f]===P.by&&M[mv.f+'P']===+mv.p?null:P.by;M[mv.f+'P']=M[mv.f]?+mv.p:null}
      else if(mv.f==='self')M.self=!M.self;else if(mv.f==='match'){const i=+mv.p,P=g.books[owner].pages[i];if(!P||P.kind!=='guess')return false;M.match[i]=!M.match[i]}else return false;g.n++;return true}
    if(mv.a==='bookdone'){if(pid!==owner)return false;tsScoreBook(g,owner);if(R.i+1<tsN(g)){g.rv={i:R.i+1,p:-1}}else{g.phase=g.rounds&&g.round>=g.rounds?'done':'roundEnd';g.rv=null}g.n++;return true}}
  if(g.phase==='roundEnd'&&mv.a==='next'){tsNewRound(g);g.n++;return true}
  if(g.phase==='roundEnd'&&mv.a==='stop'){g.phase='done';g.n++;return true}
  return false}
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
