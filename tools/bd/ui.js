/* ================= Beyond Balderdash: settings, play screens (linked phones), the staircase, the big board ================= */
const BDDEF={play:1,choose:'dasher',laws:0,db:0,steps:27,x2:14,kids:0,tlim:0};
const BDX=()=>{if(!S.bdx)S.bdx={...BDDEF};const X=S.bdx;for(const k in BDDEF)if(X[k]===undefined)X[k]=BDDEF[k];return X};
function bdSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(KEY+'.bdx'))}catch(e){}return Object.assign({...BDDEF},x||{})}
function bdKeep(){if(S.demo)return;try{localStorage.setItem(KEY+'.bdx',JSON.stringify(BDX()))}catch(e){}}
const bdPlayOn=()=>S.game==='balderdash';
const bdRes2=()=>!S.lk||S.demo||lkHost();
const bdLinked=()=>!!(S.lk&&!S.demo);
function bdFresh(){return {game:'balderdash',screen:'map',map:'balderdash',rules:{},started:false,active:0,picks:{},hr:0,bdx:bdSaved(),bdrec:{},players:CARC_COLORS.map((c,i)=>newPlayer('',c,i<4))}}
function BDM(){return {name:'Beyond Balderdash',meta:'Party game · bluff, vote, climb the stairs',min:2,max:8,teams:false,colors:CARC_COLORS,lengths:[],pieces:0,piece:'',own:[],defaults:[],tb:[]}}
/* the steps climbed: the game's own state while it's being played; afterwards what was saved */
const bdTot=p=>{const g=S.bdg;if(g&&S.started&&!S.finished&&g.pos&&g.pos[p.id]!=null)return g.pos[p.id];return +((p.bd||{}).pos)||0};
const bdName=pid=>{const p=act().find(q=>q.id===pid);return p?nm(p):'?'};
const bdPcol=pid=>{const p=act().find(q=>q.id===pid);return p?pc(p.color):''};
const bdColor=pid=>{const p=act().find(q=>q.id===pid);return p?p.color:'gray'};
const bdNames=L=>{const n=L.map(p=>esc(bdName(p)));return n.length<2?n.join(''):n.slice(0,-1).join(', ')+' and '+n[n.length-1]};
const bdMeep=(c,sz)=>`<svg class="bdmeep" width="${sz||18}" height="${sz||18}" viewBox="0 0 40 40" aria-hidden="true"><path d="${MGSHAPE_M}" fill="var(--t-${c})" stroke="#26313b" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
const bdChip=(p,extra,on)=>`<span class="bdchip${on?' on':''}" style="${bdPcol(p)}">${bdMeep(bdColor(p),16)}${esc(bdName(p))}${extra||''}</span>`;
function bdDie(n,sz){const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[26,26],[50,50],[74,74]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[26,26],[74,26],[50,50],[26,74],[74,74]],6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]}[n]||[];
  return `<svg class="bddie" viewBox="0 0 100 100" width="${sz||56}" height="${sz||56}" role="img" aria-label="The die shows ${n}"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#17212B" stroke-width="5"/>${P.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#17212B"/>`).join('')}</svg>`}

/* ---------- home, setup ---------- */
function bdHomeCard(){const st=gamePeek('balderdash');
  return `<div class="game"><div class="gtop"><img class="gart" src="art/balderdash-icon.png" alt="" width="84" height="84" onerror="this.outerHTML='<div class=&quot;gart nxart&quot; aria-hidden=&quot;true&quot;>🎭</div>'"><div><h2>Beyond Balderdash</h2><div class="meta">Party game · bluff, vote, climb the stairs</div></div></div>
    ${st&&st.started&&!st.finished?`<div class="rlab">Game in progress${st.touched?` · last changed ${ago(st.touched)}`:''}</div><div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="gresume" data-k="balderdash">Resume game</button><button class="btn" data-a="gnew" data-k="balderdash">New game</button><button class="btn" data-a="gabandon" data-k="balderdash" aria-label="Abandon this game">${ABANDON==='balderdash'?'Tap again to abandon':'🗑'}</button></div>`
      :`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="bdstart">🎭 Play on the phones</button></div>`}</div>`}
function bdSetup(){const X=BDX(),lock=S.started,seg=(k,opts,cur)=>`<div class="seg">${opts.map(([v,t])=>`<button data-a="bdset" data-k="${k}:${v}" aria-pressed="${String(cur)===String(v)}" ${lock?'disabled':''}>${t}</button>`).join('')}</div>`,
    sw=(k,on,lab)=>`<div class="srow"><span class="rlab">${lab}</span><button class="sw" role="switch" aria-checked="${!!on}" data-a="bdset" data-k="${k}:${on?0:1}" aria-label="${lab}" ${lock?'disabled':''}><i></i></button></div>`;
  const CT=bdCatsOf(BDX().laws),kidN=CT.map(c=>(BDQ[c]||[]).filter(x=>x[2]).length).reduce((a,b)=>a+b,0),allN=CT.map(c=>(BDQ[c]||[]).length).reduce((a,b)=>a+b,0);
  return `<div class="bar"><h1>Beyond Balderdash</h1></div><img class="hero hfhero" src="art/balderdash-banner.jpg" alt="" width="1200" height="560" onerror="this.remove()">${steps(1)}
  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel"><div class="rlab"><b>🎭 Playing on linked phones</b></div></div>
  <p class="hint">Link everyone’s phone: you type your bluff on your own screen and vote on your own screen, so nobody sees whose is whose. A phone, iPad or TV that joins as “Just watching” becomes the big board with the staircase.</p></div>
  <div class="sec"><div class="sec-h"><h3>Choosing the category</h3></div><div class="panel hfpanel">${seg('choose',[['dasher','🎭 The Dasher chooses'],['die','🎲 Roll the die']],X.choose)}</div>
  <p class="hint">${X.choose==='die'?`Optional rule: roll the die. 1 Words, 2 People, 3 Initials, 4 Movies, 5 ${+X.laws===2?'Laws':'Dates'}, 6 ${+X.laws===1?'Laws':'the Dasher’s choice'}.`:`${X.laws?'':'Official: '}the Dasher picks one of the ${X.laws?'categories':'5 categories on the card'}.`}</p></div>
  <div class="sec"><div class="sec-h"><h3>Categories</h3></div><div class="panel hfpanel">${seg('laws',[[0,'📦 Box categories'],[1,'⚖️ Laws as a 6th'],[2,'⚖️ Laws instead of Dates']],+X.laws||0)}</div>
  <p class="hint">${+X.laws===1?'House rule (not in the box): ⚖️ Laws, “What does this law say?”, is a 6th category. With the die, a 6 is Laws. Works with two players too.':+X.laws===2?'Like the newer Balderdash: Laws replace Dates. Words, People, Initials, Movies and ⚖️ Laws (“What does this law say?”); no Dates questions. With the die, 5 is Laws and 6 is the Dasher’s choice.':'Official: Words, People, Initials, Movies and Dates, the 5 categories on the card.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Small games</h3></div><div class="panel hfpanel">${sw('db',X.db,'The Dasher writes a bluff too (4 or fewer players)')}</div>
  <p class="hint">${X.db?'Optional rule: with 4 or fewer players the Dasher also writes a bluff, and it scores like anyone’s.':'Official: the Dasher only reads the bluffs.'} With two players the app plays the two-player game by itself.</p></div>
  <div class="sec"><div class="sec-h"><h3>The staircase</h3></div><div class="panel hfpanel"><div class="rlab">Steps to FINISH</div>${seg('steps',[[15,'15'],[20,'20'],[27,'27'],[35,'35']],X.steps)}
    <div class="rlab" style="margin-top:10px">Double Score step</div>${seg('x2',[[0,'None'],[7,'7'],[10,'10'],[14,'14'],[20,'20']].filter(([v])=>v<X.steps),X.x2>=X.steps?0:X.x2)}</div>
  <p class="hint">${+X.steps===27?'Official: 27 steps from START to FINISH.':`House rule: ${X.steps} steps to FINISH.`} ${X.x2&&X.x2<X.steps?`${+X.x2===14?'Official: ':''}land exactly on step ${X.x2} and your points count double next round.`:'No Double Score step.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Questions</h3></div><div class="panel hfpanel">${sw('kids',X.kids,'🧒 Kids mode (easier questions only)')}</div>
  <p class="hint">${X.kids?`Kids mode: ${kidN} kid-friendly questions.`:`${allN} questions.`} These are Final Tally’s own question lists, not the cards from the box.</p></div>
  <div class="sec"><div class="sec-h"><h3>Bluff timer</h3></div><div class="panel hfpanel">${seg('tlim',[[0,'Off'],[120,'2 min'],[180,'3 min'],[300,'5 min']],X.tlim)}</div>
  <p class="hint">${+X.tlim?`House rule: ${X.tlim/60} minutes to write your bluff. Anyone not done by then sits out the bluffing (they still vote).`:'Official: no timer. Take your time.'}</p></div>
  <p class="hint">${usualUI('balderdash')}</p>
  <div class="actions"><div class="in"><button class="btn primary" data-a="go" data-s="players">Players ›</button></div></div>`}
/* setup taps (handled here so the shared app core needs no new cases) */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="bdset"]');if(!b||b.disabled)return;e.stopPropagation();
  if(S.game!=='balderdash'||S.started)return;const X=BDX(),[k,v]=String(b.dataset.k).split(':');
  if(k==='choose')X.choose=v==='die'?'die':'dasher';else if(k==='db'||k==='kids')X[k]=v==='1'?1:0;else if(k==='laws')X.laws=[0,1,2].includes(+v)?+v:0;
  else if(k==='steps'){X.steps=[15,20,27,35].includes(+v)?+v:27;if(X.x2>=X.steps)X.x2=0}else if(k==='x2')X.x2=[0,7,10,14,20].includes(+v)&&+v<X.steps?+v:0;
  else if(k==='tlim')X.tlim=[0,120,180,300].includes(+v)?+v:0;bdKeep();save();render()},true);
function bdScoreScr(){return bdPlayUI()}
function bdChecks(){return []}

/* ---------- results ---------- */
function bdResults(){const R=S.bdrec||{},P=act().slice().sort((a,b)=>(b.id===R.win)-(a.id===R.win)||bdTot(b)-bdTot(a));
  return `<div class="bar"><button class="back" data-a="go" data-s="score">‹ Game</button><h1>Results</h1></div>
  <p class="rlab cnresw">🎭 ${R.rounds||0} round${R.rounds===1?'':'s'} · ${R.steps||27} steps to FINISH</p>
  <div class="podium">${P.map((p,i)=>{const D=p.bd||{},w=p.id===R.win;return `<div class="res ${w?'win':''}" style="${pc(p.color)}"><div class="rtop"><span class="rank num">${w?'🏆':i+1}</span><span class="rname">${esc(nm(p))}</span><span class="rtot">${w?'🏁':bdTot(p)}</span></div>
    <p class="rlab">Step <b class="num">${bdTot(p)}</b> · fooled <b class="num">${D.fool||0}</b> · found the answer <b class="num">${D.right||0}</b>${D.bc?` · basically correct <b class="num">${D.bc}</b>`:''}</p></div>`}).join('')}</div>
  ${awardsHtml()}${photoBlock()}
  <div class="actions"><div class="in"><button class="btn primary" data-a="rematch">Rematch, same players</button></div></div>`}
function bdAwards(){const P=act(),out=[],best=f=>{const m=Math.max(0,...P.map(f));return m>=1?P.filter(p=>f(p)===m):[]};
  const f=best(p=>(p.bd||{}).fool||0);if(f.length&&f.length<P.length)out.push({title:'Master bluffer',ps:f,why:'fooled the most players'});
  const r=best(p=>(p.bd||{}).right||0);if(r.length&&r.length<P.length)out.push({title:'Truth finder',ps:r,why:'found the real answer most often'});
  const c=best(p=>(p.bd||{}).bc||0);if(c.length&&c.length<P.length)out.push({title:'Know-it-all',ps:c,why:'most bluffs that were basically correct'});
  return out}
function bdHistory(pid){const p=act().find(q=>q.id===pid);if(!p)return '';const D=p.bd||{r:[]};
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet phsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1" style="${pc(p.color)}"><div class="rs-top"><div><h2 id="lp-h">${esc(nm(p))}</h2><small class="lp-sub">Step ${bdTot(p)}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
    <div class="rs-body"><ul class="phlist hfhist">${(D.r||[]).map((v,r)=>`<li><span><b>Round ${r+1}</b></span><span class="hfh-v">+${+v||0}</span></li>`).join('')||'<li><span>No rounds yet</span></li>'}</ul></div></div></div>`}
function bdRevSteps(){const n=Math.max(1,...act().map(p=>((p.bd||{}).r||[]).length));return Array.from({length:n},(_,r)=>({name:`Round ${r+1}`,f:p=>+((p.bd||{}).r||[])[r]||0}))}
function bdGuide(){return guideSheet('Beyond Balderdash',[
  ['A round',[['The Dasher','One player is the Dasher. The first Dasher is picked at random, then it moves to the left each round.'],
    ['Category','The Dasher picks one of the 5 categories: 📖 Words (what does it mean?), 🧑 People (what are they known for?), 🔤 Initials (what do they stand for?), 🎬 Movies (what is the film about?), 📅 Dates (what happened that day?). With the 🎲 die rule, the roll picks it (6 = the Dasher’s choice).'],
    ['Bluffs','Everyone except the Dasher secretly types a made-up answer that sounds real. Only your phone sees yours.'],
    ['Basically correct','The Dasher reads the bluffs next to the real answer. A bluff that’s basically right gets 3 points, is set aside, and its writer sits out the vote. If more than one is basically correct, the card is cancelled (they keep their 3) and the Dasher picks a new card.'],
    ['Vote','All the answers, real and made up, show on every phone in random order. Everyone except the Dasher votes for the one they think is real. You can vote for your own bluff, but it scores nothing.']]],
  ['Scoring and the staircase',[['Points','1 point for each vote your bluff gets. 2 points for picking the real answer. The Dasher gets 3 if nobody picks the real answer.'],
    ['Identical bluffs','Two bluffs that say the same thing show once; a vote for it counts for both writers.'],
    ['Climb','Move one step per point. Land exactly on the Double Score step and your points count double next round.'],
    ['Winning','The first to reach FINISH wins. Pieces move in order from the Dasher’s left, so there are no ties.'],
    ['Two players','The Dasher picks a category; the app draws 3 questions. The Dasher reads one, and the 3 real answers show in random order. Right guess: 2 points to the guesser. Wrong: 1 point to the Dasher. No Initials with two.'],
    ['⚖️ Laws (our house rule)','Not in our 1997 box: ⚖️ Laws, “What does this law say?” Choose it in the House rules, either as a 6th category (with the die, a 6 is Laws) or instead of Dates, like the newer Balderdash (with the die, 5 is Laws and 6 is the Dasher’s choice). It works with two players too.'],
    ['Small games (optional)','With 4 or fewer players the Dasher can write a bluff too; it scores like anyone’s.'],
    ['The rule sheet','This is a summary in our own words. The rule sheet in the box has the official wording.']]]])}
function bdStats(p){const g=S.bdg;if(g&&S.started&&!S.finished&&g.ps&&g.ps.includes(p.id))return [{k:'Round',v:String(g.round),i:'🎭'}];
  const D=p.bd||{};return [{k:'Step',v:String(bdTot(p)),i:'🎭'},{k:'Fooled',v:String(D.fool||0)},{k:'Found',v:String(D.right||0)}]}

/* ---------- moves: every move carries where the game was, so a slow phone's move never lands on the next card ---------- */
const bdSt=g=>`${g.gid}:${g.round}:${g.cn}:${g.phase}`;
function bdMoveQ(g,pid,mv){if(!g||!mv)return false;if(mv.st!=null&&mv.st!==bdSt(g))return false;const m={...mv};delete m.st;return bdMove(g,pid,m)}
let BDBIG=(()=>{try{return localStorage.getItem('ft-bdbig')==='1'}catch(e){return false}})(),BDERR='',BDED=null,BDSEND=null;
function bdViewer(){if(!bdLinked())return null;return act().find(p=>p.id===S.lk.me)||null}
const bdBig=()=>BDBIG||bdLinked()&&!bdViewer();
function bdGx(){if(typeof LKOPTR!=='undefined'&&LKOPTR)return S.bdg||null;try{const o=typeof lkqOn==='function'&&lkqOn()?lkOptState():null;if(o)return o.bdg||null}catch(e){}return S.bdg||null}
function bdActor(g){if(!g||!['cat','review','read'].includes(g.phase))return null;return bdDasher(g)}
const bdClock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function bdSend(m){const g=bdGx(),V=bdViewer();if(!g||!V)return false;const r=lkq('bdMove',V.id,{...m,st:bdSt(g)});if(r)vibe(8);return r}

/* ---------- the staircase: START at the bottom, rows that climb back and forth, the Double Score step, FINISH at the top ---------- */
function bdStairs(g,o={}){const N=g.o.steps,cols=7,rows=Math.ceil((N+1)/cols),cw=100,rh=140,W=cols*cw,H=rows*rh+8,res=g.phase==='reveal'||g.phase==='done'?g.res:null;
  const at={};g.ps.forEach(p=>{(at[g.pos[p]]=at[g.pos[p]]||[]).push(p)});
  const cell=i=>{const r=Math.floor(i/cols),c=i%cols,x=(r%2?cols-1-c:c)*cw,base=H-r*rh-4,h=28+c*7;return {x,base,h}};
  let blocks='',meeps='';
  for(let i=0;i<=N;i++){const {x,base,h}=cell(i),fin=i===N,st=i===0,x2=g.o.x2&&i===g.o.x2;
    const fill=fin?'var(--bdfin)':x2?'#FFD43B':st?'var(--bdstart)':'var(--bdstep)';
    blocks+=`<g class="bdstep${fin?' fin':''}${x2?' x2':''}"><rect x="${x+3}" y="${base-h}" width="${cw-6}" height="${h}" rx="7" fill="${fill}" stroke="var(--bdedge)" stroke-width="2.5"/><rect x="${x+3}" y="${base-h}" width="${cw-6}" height="9" rx="5" fill="#fff" opacity=".35"/>
      <text x="${x+cw/2}" y="${base-8}" text-anchor="middle" font-size="${fin||st||x2?16:21}" font-weight="800" fill="${x2?'#17212B':'currentColor'}">${fin?'FINISH':st?'START':x2?'×2 '+i:i}</text></g>`;
    const L=at[i]||[];if(!L.length)continue;const per=L.length>4?Math.ceil(L.length/2):L.length,sz=L.length>4?34:46,gap=Math.min(sz*.9,(cw-sz)/Math.max(1,per-1));
    L.forEach((p,j)=>{const row=Math.floor(j/per),col=j%per,n=row?L.length-per:per,mx=x+cw/2-((n-1)*gap)/2+col*gap-sz/2,my=base-h-sz-2-row*(sz*.55);
      const hop=res&&res.from&&res.from[p]!==res.to[p]&&g.pos[p]===res.to[p];
      meeps+=`<g class="bdpc${hop?' bdhop':''}" data-bdpc="${esc(p)}"><title>${esc(bdName(p))}: step ${i}</title><path d="${MGSHAPE_M}" transform="translate(${mx.toFixed(1)},${my.toFixed(1)}) scale(${(sz/40).toFixed(3)})" fill="var(--t-${bdColor(p)})" stroke="#1d232a" stroke-width="2.2" stroke-linejoin="round"/></g>`})}
  const key=`<div class="bdkey">${g.ps.map(p=>`<span class="bdkeyi" style="${bdPcol(p)}">${bdMeep(bdColor(p),16)}${esc(bdName(p))} <b class="num">${g.pos[p]}</b>${(g.x2n||{})[p]?' <i class="bdx2">×2</i>':''}</span>`).join('')}</div>`;
  return `<div class="bdstairs${o.big?' big':''}" aria-label="The staircase: ${g.ps.map(p=>`${esc(bdName(p))} on step ${g.pos[p]}`).join(', ')}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-hidden="true">${blocks}${meeps}</svg>${key}</div>`}

/* ---------- the play screen ---------- */
function bdHead(g){const D=bdDasher(g),c=g.cat||(g.q&&g.q.c);
  return `<div class="bdhead"><div><span class="rlab">Round ${g.round}${bdTwo(g)?' · two-player game':''}</span><h2>${bdChip(D,' <small>Dasher</small>',1)}</h2></div>${c&&g.phase!=='cat'?`<span class="bdcat">${BDICO[c]} ${BDCATN[c]}</span>`:''}</div>`}
function bdCx(g){const X=g.cx;if(!X)return '';return `<div class="bdnote bdcx"><b>Card cancelled.</b> ${bdNames(X.by)} ${X.by.length>1?'were':'was'} basically correct (+3 each). The card was ${BDICO[X.c]} <b>${esc(X.q)}</b>: “${esc(X.a)}”. ${esc(bdName(bdDasher(g)))} picks a new card.</div>`}
function bdCard(g,real){const q=g.q;if(!q)return '';
  return `<div class="bdcard"><div class="bdcardh">${BDICO[q.c]} <b>${BDCATN[q.c]}</b> · ${BDASK[q.c]}</div><div class="bdq">${esc(q.q)}</div>${real?`<div class="bdreal"><span class="rlab">The real answer (only you can see this)</span><b>${esc(q.a)}</b></div>`:''}</div>`}
function bdTimer(g){if(!g.tEnd||g.phase!=='write')return '';return `<span class="bdtmr" data-end="${g.tEnd}" role="timer">⏱ <b class="num">${Date.now()>g.tEnd?'Time!':bdClock(g.tEnd-Date.now())}</b></span>`}
function bdWaitChips(g,L,done,lab){return `<div class="bdchips" aria-label="${lab}">${L.map(p=>bdChip(p,done(p)?' ✓':' …',done(p))).join('')}</div>`}
function bdCatUI(g,V,big){const D=bdDasher(g),me=!big&&V&&V.id===D,dc=bdDieCat(g);
  let o=bdCx(g);
  if(g.o.die&&g.die)o+=`<div class="bddierow">${bdDie(g.die,big?96:56)}<p class="rlab">${dc?`The die rolled <b>${g.die}</b>: ${BDICO[dc]} <b>${BDCATN[dc]}</b>.`:g.die===6?`The die rolled <b>6</b>: the Dasher’s choice.`:`The die rolled <b>${g.die}</b>, but we can’t play ${BDCATN[bdCats(g)[g.die-1]]} here: the Dasher’s choice.`}</p></div>`;
  if(!me)return o+`<div class="panel bdpanel bdcenter"><p class="bdbig1">${esc(bdName(D))} is choosing a category…</p>${bdNudgeRow(g,V,big)}</div>`;
  const any=bdCats(g).some(c=>bdCatOK(g,c));
  return o+`<div class="panel bdpanel"><p class="bdbig1">You’re the Dasher! ${dc?'Draw the card:':'Pick a category:'}</p><div class="bdcats">${bdCats(g).filter(c=>!(bdTwo(g)&&c==='initials')).map(c=>{const ok=bdCatOK(g,c)&&(!dc||c===dc);
    return `<button class="bdcatb${dc===c?' hit':''}" data-a="bducat" data-k="${c}" ${ok?'':'disabled'}><span class="bdcati" aria-hidden="true">${BDICO[c]}</span><span><b>${BDCATN[c]}</b><small>${BDASK[c]}${bdCatOK(g,c)?'':' (no questions left here)'}</small></span></button>`}).join('')}</div>
    ${any?'':'<p class="hint">There are no questions to play with these settings. Turn off Kids mode in the House rules.</p>'}${bdTwo(g)?'<p class="hint">Two players: the app draws 3 questions from the category. You read one and your opponent guesses which answer is real. No Initials with two.</p>':''}</div>`}
function bdWriteUI(g,V,big){const D=bdDasher(g),W=bdWriters(g),me=!big&&V&&g.ps.includes(V.id)?V.id:null,isD=me===D;
  let o=bdCx(g)+bdCard(g,isD)+bdTimer(g);
  if(me&&W.includes(me)){if(g.bl[me]){o+=`<div class="panel bdpanel bdcenter"><p class="rlab">Your bluff</p><p class="bdmine">“${esc(g.bl[me])}”</p><button class="btn sm" data-a="bduedit">✏️ Change it</button>`}
    else o+=`<div class="panel bdpanel bdcenter"><p class="rlab">${isD?'You’re the Dasher, and with 4 or fewer you write a bluff too. ':''}Make up an answer that sounds real. Type it below.</p>`}
  else o+=`<div class="panel bdpanel bdcenter"><p class="bdbig1">${isD?'Everyone is writing a bluff…':'✍️ Everyone is writing a bluff'}</p>`;
  return o+bdWaitChips(g,W,p=>!!g.bl[p],'Who has written')+`<p class="rlab">${W.filter(p=>!g.bl[p]).length?`Waiting for ${bdNames(W.filter(p=>!g.bl[p]))}…`:'Everyone’s in!'}</p>${bdNudgeRow(g,V,big)}</div>`}
function bdReviewUI(g,V,big){const D=bdDasher(g),me=!big&&V&&g.ps.includes(V.id)?V.id:null;
  if(me!==D)return bdCard(g,false)+`<div class="panel bdpanel bdcenter"><p class="bdbig1">📖 ${esc(bdName(D))} is reading the bluffs…</p>${me&&g.bl[me]?`<p class="rlab">Your bluff</p><p class="bdmine">“${esc(g.bl[me])}”</p>`:''}${bdNudgeRow(g,V,big)}</div>`;
  const L=g.ps.filter(p=>g.bl[p]),B=L.filter(p=>g.bc[p]);
  return bdCard(g,true)+`<div class="panel bdpanel"><p class="rlab">Read the bluffs. Is any of them <b>basically correct</b>? That player gets 3 points and sits out the vote.</p>
    <div class="bdrev">${L.map(p=>{const own=p===D,on=!!g.bc[p];return `<div class="bdrevi${on?' on':''}" style="${bdPcol(p)}"><div class="bdrevt">${bdChip(p)}<span class="bdtxt">“${esc(g.bl[p])}”</span>${g.lk[p]?'<span class="bdlooks">⚠️ Looks like the real answer</span>':''}</div>
      ${own?'<span class="rlab">Your own bluff</span>':`<button class="btn sm bdbc${on?' on':''}" data-a="bdubc" data-k="${esc(p)}:${on?0:1}" aria-pressed="${on}">${on?'✓ Basically correct':'Basically correct?'}</button>`}</div>`}).join('')||'<p class="rlab">Nobody wrote a bluff in time.</p>'}</div>
    ${g.ps.filter(p=>bdWriters(g).includes(p)&&!g.bl[p]).length?`<p class="hint">No bluff from ${bdNames(g.ps.filter(p=>bdWriters(g).includes(p)&&!g.bl[p]))} (time ran out).</p>`:''}
    <div class="bdrow"><button class="btn primary" data-a="bdushow">${B.length>1?`Cancel this card (${B.length} basically correct)`:'Show the answers ▶'}</button></div>
    ${B.length>1?'<p class="hint">More than one is basically correct: they each get 3 points and you pick a new card.</p>':''}</div>`}
function bdReadUI(g,V,big){const D=bdDasher(g),me=!big&&V&&V.id===D,Q=g.q2;
  if(!me)return `<div class="panel bdpanel bdcenter"><p class="bdbig1">${esc(bdName(D))} is picking one of 3 ${BDICO[Q.c]} ${BDCATN[Q.c]} questions to read…</p>${bdNudgeRow(g,V,big)}</div>`;
  return `<div class="panel bdpanel"><p class="bdbig1">Pick the question to read</p><p class="rlab">Your opponent will see all 3 real answers and guess which one goes with your question.</p>
    ${Q.qs.map((x,k)=>`<div class="bdcard bdcard2"><div class="bdcardh">${BDICO[Q.c]} <b>${BDCATN[Q.c]}</b></div><div class="bdq">${esc(x.q)}</div><div class="bdreal"><b>${esc(x.a)}</b></div><button class="btn primary" data-a="bduread" data-k="${k}">Read this one</button></div>`).join('')}</div>`}
const bdLet=i=>String.fromCharCode(65+i);
function bdVoteUI(g,V,big){const D=bdDasher(g),me=!big&&V&&g.ps.includes(V.id)?V.id:null,Vs=bdVoters(g),can=me&&Vs.includes(me),mine=me?g.votes[me]:null;
  let o=bdCx(g)+bdCard(g,false);
  o+=`<div class="panel bdpanel"><p class="bdbig1">${can?(mine!=null?'Your vote is in. You can still change it.':'Which one is the real answer?'):me===D?'Everyone is voting. You don’t vote.':me&&g.bc[me]?'You were basically correct (+3). Sit back for this vote.':'Everyone is voting…'}</p>
    <div class="bdans">${g.ans.map((A,i)=>{const own=me&&A.by.includes(me),real=me===D&&A.real,on=mine===i;
      const inner=`<span class="bdlet">${bdLet(i)}</span><span class="bdtxt">${esc(A.t)}</span>${own?'<span class="bdtag">Your bluff</span>':''}${real?'<span class="bdtag real">Real</span>':''}`;
      return can?`<button class="bdansb${on?' on':''}" data-a="bduvote" data-k="${i}" aria-pressed="${on}">${inner}${on?'<span class="bdtag me">✓ My vote</span>':''}</button>`:`<div class="bdansb ro${real?' real':''}">${inner}</div>`}).join('')}</div>
    ${can&&g.ans.some(A=>A.by.includes(me))?'<p class="hint">You may vote for your own bluff, but that vote scores nothing.</p>':''}
    ${bdWaitChips(g,Vs,p=>g.votes[p]!=null,'Who has voted')}<p class="rlab bdcenter">${Vs.filter(p=>g.votes[p]==null).length?`Waiting for ${bdNames(Vs.filter(p=>g.votes[p]==null))}…`:'All in!'}</p>${bdNudgeRow(g,V,big)}</div>`;
  return o}
function bdRevealUI(g,V,big){const R=g.res,D=bdDasher(g),two=bdTwo(g),me=!big&&V&&g.ps.includes(V.id)?V.id:null;if(!R)return '';
  let o='';if(R.win)o+=`<div class="bdwin" style="${bdPcol(R.win)}">${bdMeep(bdColor(R.win),44)}<div><b>${esc(bdName(R.win))} reaches FINISH!</b><span class="rlab">${esc(bdName(R.win))} wins the game.</span></div></div>`;
  o+=`<div class="bdcard"><div class="bdcardh">${BDICO[g.q.c]} <b>${BDCATN[g.q.c]}</b> · ${BDASK[g.q.c]}</div><div class="bdq">${esc(g.q.q)}</div></div>`;
  o+=`<div class="bdrvgrid"><div>`;
  o+=`<div class="panel bdpanel"><div class="bdans">${g.ans.map((A,i)=>{const vs=g.ps.filter(p=>R.votes[p]===i);
    return `<div class="bdansb ro rv${A.real?' real':''}"><span class="bdlet">${bdLet(i)}</span><div class="bdrvb"><span class="bdtxt">${esc(A.t)}</span>
      <span class="bdwho">${A.real?'<b class="bdtag real">✓ The real answer</b>':two?'':`Bluff by ${A.by.map(p=>bdChip(p)).join(' ')}`}</span>
      ${vs.length?`<span class="bdwho">${two?'Guessed by':'Votes:'} ${vs.map(p=>bdChip(p)).join(' ')}</span>`:'<span class="bdwho rlab">No votes</span>'}</div></div>`}).join('')}</div>
    ${Object.keys(g.bc).filter(p=>g.bc[p]).length?`<p class="rlab">Set aside as basically correct: ${Object.keys(g.bc).filter(p=>g.bc[p]).map(p=>`${bdChip(p)} “${esc(g.bl[p])}”`).join(' ')}</p>`:''}</div>`;
  /* points this round, in the order the pieces move */
  o+=`<div class="panel bdpanel"><h3 class="bdh3">Points this round</h3><table class="bdtab"><tbody>${R.order.map(p=>{const base=R.rp[p]||0,dbl=!!R.dbl[p],gn=R.gain[p]||0,stop=R.win&&R.win!==p&&R.order.indexOf(p)>R.order.indexOf(R.win)&&gn;
      return `<tr style="${bdPcol(p)}"><td>${bdChip(p,p===D?' <small>Dasher</small>':'')}<div class="bdwhy">${(R.why[p]||[]).map(esc).join(' · ')||'No points'}${dbl&&base?` · <b>×2 Double Score</b>`:''}</div></td><td class="num"><b>+${gn}</b></td><td class="num bdmv">${stop?'(game over)':R.from[p]===R.to[p]?`step ${R.to[p]}`:`${R.from[p]} → <b>${R.to[p]===g.o.steps?'🏁':R.to[p]}</b>`}</td></tr>`}).join('')}</tbody></table>
    ${Object.keys(R.dbl).filter(p=>R.dbl[p]).map(p=>`<p class="bdnote">×2 ${esc(bdName(p))}’s points counted double this round.</p>`).join('')}
    ${Object.keys(R.x2next).map(p=>`<p class="bdnote bdx2n">⭐ ${esc(bdName(p))} landed on Double Score! Next round ${esc(bdName(p))}’s points count double.</p>`).join('')}</div></div>`;
  o+=bdStairs(g,{big})+'</div>';
  if(!big&&me)o+=`<div class="bdrow"><button class="btn primary" data-a="bdunext">${R.win?'🏁 See who won':`Next round ▶ (${esc(bdName(g.ps[(g.di+1)%g.ps.length]))} is the Dasher)`}</button></div>`;
  return o}
function bdDoneUI(g,big){const w=g.winner;
  return `<div class="bdwin" style="${bdPcol(w)}">${bdMeep(bdColor(w),56)}<div><b>🏆 ${esc(bdName(w))} wins!</b><span class="rlab">First to FINISH after ${g.round} round${g.round===1?'':'s'}.</span></div></div>${bdStairs(g,{big})}
  ${big?'':'<div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; see results</button></div></div>'}`}
function bdPlayUI(){const g=S.bdg,P=act(),big=bdBig();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Beyond Balderdash">${g&&g.phase==='done'?'🏁':'🎭'}</h1>${bdLinked()?`<button class="btn sm undo" data-a="bdubig" aria-pressed="${big}" aria-label="Big board for a TV or iPad">📺${big?' Exit':''}</button>`:''}<button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  document.documentElement.classList.toggle('bdbigv',big&&!!g);
  if(P.some(p=>p.bot))return out+`<div class="panel" style="padding:16px"><p>Beyond Balderdash has no computer players: a computer can’t bluff your family! Go back to Players and turn the computer seats into people.</p></div>`;
  if(P.length<2)return out+`<div class="panel" style="padding:16px"><p>Beyond Balderdash needs 2 to 8 players. Go back to Players and add more.</p></div>`;
  if(!bdLinked())return out+`<div class="panel bdpanel bdlinkme"><h2>📱 Link the phones</h2><p>Everyone writes their bluff and votes on their own phone. Tap <b>📱 Link</b> at the top, then everyone joins with the code and picks themselves.</p><p>A phone, iPad or TV that picks <b>Just watching</b> becomes the big board with the staircase.</p></div>`;
  if(!g||bdStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(bdRes2()?'Shuffling the cards…':'Waiting for the host phone…')}</div>`;
  const V=bdViewer();out+=bdHead(g);
  if(g.phase==='cat')out+=bdCatUI(g,V,big);
  else if(g.phase==='write')out+=bdWriteUI(g,V,big);
  else if(g.phase==='review')out+=bdReviewUI(g,V,big);
  else if(g.phase==='read')out+=bdReadUI(g,V,big);
  else if(g.phase==='vote')out+=bdVoteUI(g,V,big);
  else if(g.phase==='reveal')out+=bdRevealUI(g,V,big);
  else if(g.phase==='done')out+=bdDoneUI(g,big);
  if(['cat','write','review','read','vote'].includes(g.phase))out+=`<details class="bdmini"${big?' open':''}><summary>🪜 The staircase</summary>${bdStairs(g,{big})}</details>`;
  return out}

/* ---------- moves from the screen ---------- */
function bdUiAct(a,b,k){if(a==='bdubig'){BDBIG=!bdBig();try{localStorage.setItem('ft-bdbig',BDBIG?'1':'0')}catch(e){}return}
  const g=bdGx();if(!g||bdBig())return;
  switch(a){
    case 'bducat':bdSend({a:'cat',c:k});return;
    case 'bduedit':{const V=bdViewer();if(V&&g.phase==='write')BDED=`${g.gid}:${g.cn}:${V.id}`;return}
    case 'bdubc':{const [p,on]=String(k).split(':');bdSend({a:'bc',p,on:on==='1'?1:0});return}
    case 'bdushow':bdSend({a:'show'});return;
    case 'bduread':bdSend({a:'read',k:+k});return;
    case 'bduvote':bdSend({a:'vote',i:+k});return;
    case 'bdunext':bdSend({a:'next'});return;
    case 'bdunudge':{const to=String(k||'').split(',').filter(Boolean);if(to.length)bdSend({a:'nudge',to});return}}}
function bdTimeUp(g){return !!g&&g.phase==='write'&&!!g.tEnd&&Date.now()>g.tEnd+3000&&bdMove(g,bdDasher(g),{a:'timeup'})}
function bdTick(){if(!bdPlayOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!bdRes2())return;if(lkqRun()){save();render();return}
  if(act().some(p=>p.bot)||act().length<2||!bdLinked())return;
  const g=S.bdg;if(!g||bdStale(g)){const X=BDX(),n=bdDeal({die:X.choose==='die',laws:+X.laws||0,db:!!X.db,steps:+X.steps,x2:+X.x2,kids:!!X.kids,tlim:+X.tlim});if(n){S.bdg=n;save();render()}return}
  if(bdTimeUp(g)){save();render()}}
function bdSyncScorer(g){if(!g)return;S.bdrec={rounds:g.round,steps:g.o.steps,win:g.winner,two:bdTwo(g)?1:0};
  act().forEach(p=>{const s=g.st[p.id]||{};p.bd={pos:g.pos[p.id]||0,pts:s.pts||0,fool:s.fool||0,right:s.right||0,bc:s.bc||0,win:g.winner===p.id?1:0,r:(g.hist||[]).map(h=>+(h.gain||{})[p.id]||0)}});S.hr=1}

/* ---------- "Nudge" (the Telestrations pattern) ---------- */
function bdNudgeRow(g,V,big){if(big||!V||!g.ps.includes(V.id))return '';const now=Date.now(),can=bdNudgeable(g,V.id,now),to=g.ps.filter(p=>can[p]);
  if(!to.length){if(['cat','review','read'].includes(g.phase)&&bdDasher(g)!==V.id){const at=(g.t0||now)+BDNZWAIT;if(at>now)return `<span hidden data-bdre="${at}"></span>`}return ''}
  const cool=p=>bdNudgeCool(g,V.id,p,now),ready=to.filter(p=>!cool(p)),soon=to.filter(p=>cool(p)).map(p=>now+cool(p));
  const one=p=>{const c=cool(p);return c?`<button class="btn sm tsnudge on" disabled data-bdre="${now+c}" aria-label="Nudged ${esc(bdName(p))}">Nudged ✓ <span class="tsnzn">${esc(bdName(p))}</span></button>`
    :`<button class="btn sm tsnudge" data-a="bdunudge" data-k="${esc(p)}" style="${bdPcol(p)}">🔔 Nudge ${esc(bdName(p))}</button>`};
  const all=to.length>3?`<button class="btn sm tsnudge tsnzall" data-a="bdunudge" data-k="${esc(ready.join(','))}" ${ready.length?'':`disabled data-bdre="${Math.min(...soon)}"`}>🔔 Nudge everyone still going</button>`:'';
  return `<div class="tsnudges" aria-label="Nudge the players you’re waiting on">${all}${to.map(one).join('')}</div>`}
let BDNZ=null;
const BDNZT={cat:'is waiting for you to pick a category',bluff:'is waiting on your bluff',review:'is waiting for you to show the answers',read:'is waiting for you to pick a question',vote:'is waiting on your vote'};
function bdNudgeFx(g){const V=bdViewer();if(!g||!g.gid||!V||bdBig()||!g.ps.includes(V.id))return;const n=(g.nz||{})[V.id];if(!n||!n.k)return;
  const key=g.gid+':'+n.k,age=Date.now()-(+n.at||0);if(BDNZ===null){BDNZ=new Set();if(age>15000){BDNZ.add(key);return}}
  if(BDNZ.has(key))return;BDNZ.add(key);if(age>60000)return;if(!bdNudgeable(g,n.by,Date.now(),BDNZWAIT)[V.id])return;
  document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast tsnzt';t.setAttribute('role','status');t.textContent=`🔔 ${bdName(n.by)} ${BDNZT[n.w]||'is waiting on you'}`;document.body.appendChild(t);setTimeout(()=>t.remove(),5000);
  vibe([120,60,120,60,220]);try{if(typeof tsSfx==='function')tsSfx('bell')}catch(e){}}
/* a little fanfare on every screen when the answers are revealed (once per card) */
let BDSF=null;
function bdSnd(g){if(!g||!g.gid)return;const k=g.phase==='reveal'||g.phase==='done'?`${g.gid}:${g.round}:${g.cn}`:null;if(BDSF===null){BDSF=k||'';return}if(!k||k===BDSF)return;BDSF=k;try{if(typeof tsSfx==='function')tsSfx('tada')}catch(e){}vibe(30)}

/* ---------- typing a bluff: its own layer outside #app, so redraws never wipe what you're typing ---------- */
function bdFxMode(g,V){if(!g||!V||bdBig()||!g.ps.includes(V.id)||g.phase!=='write'||!bdWriters(g).includes(V.id))return null;
  const key=`${g.gid}:${g.cn}:${V.id}`;if(g.bl[V.id]&&BDED!==key)return null;return {key,cn:g.cn,cur:g.bl[V.id]||''}}
function bdFx(){let L=document.getElementById('bdfx');const on=S.game==='balderdash'&&S.started&&!S.demo&&S.screen==='score'&&bdLinked()&&!act().some(p=>p.bot);
  const g=on?bdGx():null,ok=g&&!bdStale(g),V=ok?bdViewer():null,F=ok?bdFxMode(g,V):null;
  try{if(ok){bdNudgeFx(g);bdSnd(g)}}catch(e){}
  if(!F){if(L)L.remove();document.documentElement.style.removeProperty('--bdpad');BDERR='';return}
  if(!L||L.dataset.sig!==F.key){if(L)L.remove();BDERR='';L=document.createElement('div');L.id='bdfx';L.className='cnlayer bdlayer';L.dataset.sig=F.key;L.dataset.cn=F.cn;
    L.innerHTML=`<div class="cnsheet bdsheet" role="region" aria-label="Your bluff"><div class="cntop"><h2>✍️ Your bluff</h2></div><form id="bdform" class="chform" autocomplete="off"><textarea id="bdin" rows="2" maxlength="160" placeholder="Make up an answer that sounds real" aria-label="Your bluff" enterkeyhint="send" autocapitalize="sentences"></textarea><button class="btn primary" type="submit">${F.cur?'Save':'Send'}</button></form><p class="cnerr rlab" role="alert"></p><p class="rlab cnmhint">Only you see it until the answers are shown.</p></div>`;
    document.body.appendChild(L);if(F.cur){const i=L.querySelector('#bdin');i.value=F.cur}}
  L.querySelector('.cnerr').textContent=BDERR;
  document.documentElement.style.setProperty('--bdpad',(L.offsetHeight+12)+'px')}
function bdSubmit(){const L=document.getElementById('bdfx'),i=document.getElementById('bdin');if(!L||!i)return;const v=bdClean(i.value);
  if(!v){BDERR='Type a bluff first.';bdFx();return}BDERR='';if(bdSend({a:'bluff',t:v,cn:+L.dataset.cn})){BDED=null;i.value='';vibe(12)}save();render()}
document.addEventListener('submit',e=>{const f=e.target;if(!f||f.id!=='bdform')return;e.preventDefault();bdSubmit()});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&e.target&&e.target.id==='bdin'){e.preventDefault();bdSubmit()}});
setInterval(()=>{try{bdFx()}catch(e){}},700);
/* the bluff timer on screen; the host moves on when time is up */
setInterval(()=>{try{document.querySelectorAll('.bdtmr[data-end]').forEach(el=>{const ms=+el.dataset.end-Date.now(),b=el.querySelector('b');if(b)b.textContent=ms>0?bdClock(ms):'Time!';el.classList.toggle('low',ms<20000)});
  if(S.game!=='balderdash'||!S.started||S.demo||!bdRes2()||(typeof LKOPTR!=='undefined'&&LKOPTR))return;if(S.bdg&&!bdStale(S.bdg)&&bdTimeUp(S.bdg)){save();render()}}catch(e){}},500);
setInterval(()=>{try{if(S.game!=='balderdash')return;const now=Date.now();if([...document.querySelectorAll('#app [data-bdre]')].some(e=>+e.dataset.bdre<=now))render()}catch(e){}},500);
/* family records on the stats screen */
function bdRecords(G){const BG=G.filter(g=>g.game==='balderdash'&&g.state&&g.state.players);if(!BG.length)return '';const per={};
  BG.forEach(g=>{g.state.players.forEach(p=>{const D=p.bd;if(!D)return;const pl=g.players.find(x=>x.name===((p.name||'').trim()));if(!pl||!realP(pl))return;
    const e=per[pkey(pl)]||(per[pkey(pl)]={name:pl.name,color:pl.color,g:0,w:0,fool:0});e.g++;if(D.win)e.w++;e.fool+=D.fool||0})});
  const L=Object.values(per),card=(t,v,sub,c)=>`<div${c?` style="${pc(c)}"`:''}><span>${t}</span><b>${v}</b><small>${sub}</small></div>`;
  const top=[...L].sort((a,b)=>b.w-a.w)[0],fo=[...L].sort((a,b)=>b.fool-a.fool)[0];
  return `<div class="sec"><div class="sec-h"><h3>Beyond Balderdash records</h3></div><div class="recs" style="margin-top:0">
    ${top&&top.w?card('Most wins',`<span class="num">${top.w}</span>`,`${esc(top.name)} · ${top.w} of ${top.g} games`,top.color):''}
    ${fo&&fo.fool?card('Best bluffer',`<span class="num">${fo.fool}</span>`,`${esc(fo.name)} · players fooled`,fo.color):''}</div></div>`}
