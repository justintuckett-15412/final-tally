/* ================= Telestrations: settings, record sheet, play screens (linked phones), the big board ================= */
const TSDEF={play:1,words:'std',own:'',ownOnly:0,scoring:'friendly',timer:60,ctimer:0,csec:45,flip:1,colors:0,async:0,auto:0};
/* the sketch timer the settings ask for: a preset, or the custom number of seconds (10-600) */
const tsCsec=X=>{const n=Math.round(+X.csec);return isFinite(n)&&n>=10?Math.min(600,n):isFinite(n)&&n>0?10:45};
const tsTimerOf=X=>X.ctimer?tsCsec(X):(+X.timer||0);
const tsTimerHint=X=>{const t=tsTimerOf(X);return !t?'No timer: everyone taps Done when their sketch is finished.':X.ctimer||t!==60?`House rule: ${t} seconds to sketch, then a couple of seconds to finish up. Guessing has no timer.`:'Official rules: 60 seconds to sketch, then a couple of seconds to finish up. Guessing has no timer.'};
const TSX=()=>{if(!S.tsx)S.tsx={...TSDEF};const X=S.tsx;for(const k in TSDEF)if(X[k]===undefined)X[k]=TSDEF[k];return X};
function tsSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(KEY+'.tsx'))}catch(e){}return Object.assign({...TSDEF},x||{})}
function tsKeep(){if(S.demo)return;try{localStorage.setItem(KEY+'.tsx',JSON.stringify(TSX()))}catch(e){}}
const tsPlayOn=()=>S.game==='telestrations'&&!!TSX().play;
const tsRes2=()=>!S.lk||S.demo||lkHost();
const tsLinked=()=>!!(S.lk&&!S.demo);
function tsFresh(){return {game:'telestrations',screen:'map',map:'telestrations',rules:{},started:false,active:0,picks:{},hr:0,tsx:tsSaved(),tsrec:{},players:CARC_COLORS.map((c,i)=>newPlayer('',c,i<4))}}
function TSM(){return {name:'Telestrations',meta:'Party game · sketch, guess, pass the book',min:4,max:8,teams:false,colors:CARC_COLORS,lengths:[],pieces:0,piece:'',own:[],defaults:[],tb:[]}}
const tsP=p=>{if(!p.ts||!Array.isArray(p.ts.r))p.ts={...(p.ts||{}),r:[0,0,0]};return p.ts};
/* the game's own state wins while it's being played; afterwards the saved (or recorded) points */
const tsTot=p=>{const g=S.tsg;if(tsPlayOn()&&g&&S.started&&!S.finished&&g.score&&g.score[p.id])return tsTotal(g,p.id);return ((p.ts&&p.ts.r)||[]).reduce((a,b)=>a+(+b||0),0)};
const TSSC={friendly:'Friendly',competitive:'Competitive',none:'No scoring'};
const TSSCW={friendly:'When your book comes back, give 1 point to your favourite sketch and 1 to your favourite guess, and 1 to yourself if the last guess matches your word. 3 rounds.',
  competitive:'A guess scores 1 when it matches the secret word or the guess before it, and so does the sketch right before it. You get 1 if the last guess in your book matches. 3 rounds.',
  none:'Just for laughs: no points. Keep playing rounds until someone taps Stop.'};
const tsName=pid=>{const p=act().find(q=>q.id===pid);return p?nm(p):'?'};
const tsPcol=pid=>{const p=act().find(q=>q.id===pid);return p?pc(p.color):''};
/* a die face (1-6) as a little picture */
function tsDie(n,sz){const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[26,26],[50,50],[74,74]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[26,26],[74,26],[50,50],[26,74],[74,74]],6:[[28,24],[72,24],[28,50],[72,50],[28,76],[72,76]]}[n]||[];
  return `<svg class="tsdie" viewBox="0 0 100 100" width="${sz||64}" height="${sz||64}" role="img" aria-label="The die shows ${n}"><rect x="4" y="4" width="92" height="92" rx="18" fill="#fff" stroke="#17212B" stroke-width="5"/>${P.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#17212B"/>`).join('')}</svg>`}
/* our meeple art for each phase, with an emoji if the picture is missing */
const tsIm=(n,e,c)=>`<img class="${c||'tsimg'}" src="art/${n}.webp" alt="" width="64" height="64" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'tsemo',textContent:'${e}'}))">`;
const tsSvgOk=(d,size)=>typeof tsSvg==='function'?tsSvg(d,{size}):`<div class="tsnosvg">✏️</div>`;

/* ---------- home, setup ---------- */
function tsHomeCard(){const st=gamePeek('telestrations');
  return `<div class="game"><div class="gtop"><img class="gart" src="art/telestrations-icon.png" alt="" width="84" height="84" onerror="this.outerHTML='<div class=&quot;gart nxart&quot; aria-hidden=&quot;true&quot;>✏️</div>'"><div><h2>Telestrations</h2><div class="meta">Party game · sketch, guess, pass the book</div></div></div>
    ${st&&st.started&&!st.finished?`<div class="rlab">Game in progress${st.touched?` · last changed ${ago(st.touched)}`:''}</div><div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="gresume" data-k="telestrations">Resume game</button><button class="btn" data-a="gnew" data-k="telestrations">New game</button><button class="btn" data-a="gabandon" data-k="telestrations" aria-label="Abandon this game">${ABANDON==='telestrations'?'Tap again to abandon':'🗑'}</button></div>`
      :`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="tsstart" data-k="1">✏️ Play</button><button class="btn" style="flex:1" data-a="tsstart" data-k="0">Record a game</button></div>`}</div>`}
function tsSetup(){const X=TSX(),lock=S.started&&tsPlayOn(),seg=(a,opts,cur)=>`<div class="seg">${opts.map(([v,t])=>`<button data-a="${a}" data-k="${v}" aria-pressed="${String(cur)===String(v)}" ${lock?'disabled':''}>${t}</button>`).join('')}</div>`;
  const own=String(X.own||'').split(/[\n,]+/).map(w=>w.trim()).filter(Boolean);
  return `<div class="bar"><h1>Telestrations</h1></div><img class="hero hfhero" src="art/telestrations-banner.jpg" alt="" width="1200" height="560" onerror="this.remove()">${steps(1)}
  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${tsPlayOn()?'✏️ Playing on the phones':'Recording a real game'}</b></div>`:seg('tsplaymode',[[1,'✏️ Play on the phones'],[0,'Record a real game']],X.play?1:0)}</div>
  <p class="hint">${X.play?'Link everyone’s phone: each phone is a sketchbook. You sketch and guess on your own screen, the books pass around by themselves, and every screen shows the Big Reveal. A phone or iPad that joins as “Just watching” becomes the big board.':'Play with the real books and markers, then write down everyone’s points for each round.'}</p></div>
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Words</h3></div><div class="panel hfpanel">${seg('tswords',[['std','Standard'],['kid','🧒 Kids (easier words)']],X.words)}
    <label class="rlab" for="tsown" style="display:block;margin-top:10px">Family words (optional): add your own, separated by commas or new lines</label>
    <textarea id="tsown" class="cnown tsown" data-tsown="1" rows="3" placeholder="Grandma’s meatloaf, Lake Powell, Pickleball…" ${lock?'disabled':''}>${esc(X.own||'')}</textarea>
    ${own.length>=12?`<div class="srow"><span class="rlab">Use only our family words (${own.length})</span><button class="sw" role="switch" aria-checked="${!!X.ownOnly}" data-a="tsownonly" aria-label="Use only our family words" ${lock?'disabled':''}><i></i></button></div>`:''}</div>
  <p class="hint">${X.words==='kid'?`Kids list: ${TSW_KID.length} simple words.`:`Standard list: ${TSW_STD.length} words.`}${own.length?` Plus ${own.length} family word${own.length===1?'':'s'}${X.ownOnly&&own.length>=12?' (only these)':''}.`:''} Some cards have a blank (make up any word) or a category. These are Final Tally’s own lists, not the words from the box.</p></div>`:''}
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Scoring</h3></div><div class="panel hfpanel">${seg('tsscoring',[['friendly','Friendly'],['competitive','Competitive'],['none','No scoring']],X.scoring)}</div>
  <p class="hint">${TSSCW[X.scoring]||TSSCW.friendly}</p></div>
  <div class="sec"><div class="sec-h"><h3>Sketch timer</h3></div><div class="panel hfpanel">${seg('tstimer',[[0,'Off'],[30,'30 s'],[60,'60 s'],[90,'90 s'],[120,'2 min'],['c','Custom']],X.ctimer?'c':X.timer)}
    ${X.ctimer?`<div class="srow tscust"><label class="rlab" for="tscsec">Seconds to sketch (10 to 600)</label><input id="tscsec" type="number" inputmode="numeric" min="10" max="600" step="5" value="${tsCsec(X)}" data-tscsec="1" ${lock?'disabled':''}></div>`:''}</div>
  <p class="hint" id="tstimerhint">${tsTimerHint(X)}</p></div>
  <div class="sec"><div class="sec-h"><h3>Passing</h3></div><div class="panel hfpanel">${seg('tspass',[[0,'Pass together'],[1,'Pass when ready']],X.async?1:0)}
    <div class="srow" style="margin-top:10px"><span class="rlab">Reverse direction each round</span><button class="sw" role="switch" aria-checked="${!!X.flip}" data-a="tsflip" aria-label="Reverse direction each round" ${lock?'disabled':''}><i></i></button></div></div>
  <p class="hint">${X.async?'House rule: pass when ready. Your book moves on as soon as you finish a page, so nobody waits for the slowest sketcher. Your sketch timer starts when a book reaches you.':'Official: everyone passes at the same time.'}</p>
  <p class="hint">${X.flip?'Books pass to the left in round 1, then to the right, then left again, so you see different people’s sketches (the rule sheet’s play-again tip).':'Books always pass to the left.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Big Reveal</h3></div><div class="panel hfpanel">${seg('tsrev',[[0,'👆 Owner flips'],[1,'▶️ Auto-play']],X.auto?1:0)}
    ${X.auto?`<div class="srow" style="margin-top:10px"><span class="rlab">Seconds per page</span></div>${seg('tsautos',[[4,'4 s'],[6,'6 s'],[8,'8 s'],[10,'10 s']],X.auto)}`:''}</div>
  <p class="hint">${X.auto?`House rule: every screen turns the page every ${X.auto} seconds. The owner can still flip or pause. ${X.scoring==='none'?'At the end of a book it moves on to the next one.':'It waits on the last page until the owner taps Done.'}`:'Official: each book’s owner flips through the pages.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Pen colors</h3></div><div class="panel hfpanel">${seg('tspens',[[0,'✒️ Black only'],[1,'🎨 Colors']],X.colors?1:0)}</div>
  <p class="hint">${X.colors?'House rule: the sketch pad gets 8 colored markers. Every phone uses the same pens.':'Official: black markers, like the ones in the box.'}</p></div>`:''}
  <p class="hint">${usualUI('telestrations')}</p>
  <div class="actions"><div class="in"><button class="btn primary" data-a="go" data-s="players">Players ›</button></div></div>`}
function tsScoreScr(){if(tsPlayOn()&&S.started&&!S.demo)return tsPlayUI();return tsScoreSheet()}

/* ---------- record a real game: points per round, 3 rounds ---------- */
function tsScoreSheet(){const P=act();
  return `<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1>Telestrations</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>
  <p class="hint lv-hint hftip">After each Big Reveal, add the points everyone got that round.</p>
  <div class="nxlist">${P.map((p,i)=>{const D=tsP(p);return `<div class="nxcard" style="${pc(p.color)}"><div class="nxh"><b>${esc(nm(p))}</b><span class="num nxpts">${tsTot(p)}</span></div>
    <div class="tsrec">${[0,1,2].map(r=>`<div class="tsrecr"><span class="rlab">Round ${r+1}</span><button class="btn sm" data-a="tsrecpt" data-k="${i}:${r}:-1" aria-label="${esc(nm(p))} round ${r+1} minus one">−</button><b class="num">${+D.r[r]||0}</b><button class="btn sm" data-a="tsrecpt" data-k="${i}:${r}:1" aria-label="${esc(nm(p))} round ${r+1} plus one">+</button></div>`).join('')}</div></div>`}).join('')}</div>
  <div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; reveal</button></div></div>`}
function tsChecks(){if(tsPlayOn()&&S.tsg)return [];const o=[];if(act().every(p=>!tsTot(p)))o.push('No points entered yet.');return o}
function tsResults(){const R=S.tsrec||{},none=R.scoring==='none',P=act().slice().sort((a,b)=>none?0:tsTot(b)-tsTot(a));const top=none?-1:Math.max(...P.map(tsTot));
  return `<div class="bar"><button class="back" data-a="go" data-s="score">‹ ${tsPlayOn()?'Game':'Record'}</button><h1>Results</h1></div>
  <div class="tscenter">${tsIm(none?'ts-reveal':'ts-win',none?'✏️':'🏆','tsimg tsresimg')}</div>
  ${none?`<p class="rlab cnresw">✏️ <b>${R.rounds||1} round${R.rounds===1?'':'s'} of sketching, just for laughs</b></p>`:R.scoring?`<p class="rlab cnresw">${TSSC[R.scoring]} scoring · ${R.rounds||3} rounds</p>`:''}
  <div class="podium">${P.map((p,i)=>{const D=p.ts||{r:[]},t=tsTot(p);return `<div class="res ${!none&&t===top?'win':''}" style="${pc(p.color)}"><div class="rtop"><span class="rank num">${none?'✏️':t===top?'🏆':i+1}</span><span class="rname">${esc(nm(p))}</span><span class="rtot">${none?'':t}</span></div>
    ${none?'':`<p class="rlab">${(D.r||[]).map((v,r)=>`Round ${r+1}: <b class="num">${+v||0}</b>`).join(' · ')}${D.fs||D.fg?` · ⭐ ${(D.fs||0)+(D.fg||0)} favourite${(D.fs||0)+(D.fg||0)===1?'':'s'}`:''}</p>`}</div>`}).join('')}</div>
  ${awardsHtml()}${photoBlock()}
  <div class="actions"><div class="in"><button class="btn primary" data-a="rematch">Rematch, same players</button></div></div>`}
function tsAwards(){const P=act(),out=[],best=(f,min)=>{const m=Math.max(0,...P.map(f));return m>=(min||1)?P.filter(p=>f(p)===m):[]};
  const s=best(p=>(p.ts||{}).fs||0);if(s.length&&s.length<P.length)out.push({title:'Favourite artist',ps:s,why:'most ⭐ favourite sketches'});
  const g=best(p=>(p.ts||{}).fg||0);if(g.length&&g.length<P.length)out.push({title:'Mind reader',ps:g,why:'most ⭐ favourite guesses'});
  const m=best(p=>(p.ts||{}).fm||0);if(m.length&&m.length<P.length)out.push({title:'Came back home',ps:m,why:'their word made it all the way around'});
  return out}
function tsHistory(pid){const p=act().find(q=>q.id===pid);if(!p)return '';const D=p.ts||{r:[]};
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet phsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1" style="${pc(p.color)}"><div class="rs-top"><div><h2 id="lp-h">${esc(nm(p))}</h2><small class="lp-sub">${tsTot(p)} point${tsTot(p)===1?'':'s'}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
    <div class="rs-body"><ul class="phlist hfhist">${(D.r||[]).map((v,r)=>`<li><span><b>Round ${r+1}</b></span><span class="hfh-v">${+v||0}</span></li>`).join('')||'<li><span>No rounds yet</span></li>'}${D.fs||D.fg?`<li><span><b>⭐ Favourites</b></span><span class="hfh-v">${D.fs||0} sketch · ${D.fg||0} guess</span></li>`:''}</ul></div></div></div>`}
function tsRevSteps(){const n=Math.max(1,...act().map(p=>((p.ts||{}).r||[]).length));return Array.from({length:n},(_,r)=>({name:`Round ${r+1}`,f:p=>+((p.ts||{}).r||[])[r]||0}))}
function tsGuide(){return guideSheet('Telestrations',[
  ['Setup',[['Players','4 to 8. Each phone is a sketchbook. A phone or iPad on “Just watching” is the big board.'],['Your word','Each round a die is rolled. Find that number on your card: that’s your secret word. A blank means make up any word; a category means make up something in it; a card marked “any” lets you pick any word on it. Keep it secret!']]],
  ['Passing the books',[['Even number of players','You sketch your own word first, then the books pass.'],['Odd number of players','Your book passes first: the next player sketches your word.'],['Sketch, guess, sketch…','Each page alternates. If you get a sketch, write what you think it is. If you get a guess, sketch it. The last page is always a guess.'],['Timer','Sketches have a timer (60 seconds in the box), then a couple of seconds to finish up. Guesses have no timer.'],['Pen colors','The box has black markers. The 🎨 Colors house rule gives the sketch pad 8 colors.'],['No letters or numbers','Sketches can’t have letters, numbers or symbols. Just draw!'],['Never leave a guess blank','Always write your best guess, even if the sketch is a mystery.'],['Direction','Books pass to the left. Reversing each round (the rule sheet’s tip) mixes things up.'],['Pass when ready (house rule)','Your book moves on as soon as you finish a page, without waiting for everyone. Your sketch timer starts when a book reaches you.']]],
  ['The Big Reveal',[['Book by book','When your own book comes back, everyone watches as you flip through it, page by page, on every screen.'],['Auto-play (house rule)','The pages turn by themselves every few seconds on every screen. The owner can still flip or pause, and it waits on the last page until they tap Done.'],['Friendly scoring','In your book, give 1 point to your favourite sketch and 1 to your favourite guess (not your own), and 1 to yourself if the last guess matches your word.'],['Competitive scoring','A guess scores 1 if it matches the secret word or the guess before it, and so does the sketch it came from. You get 1 if the last guess matches your word.'],['How many rounds','With scoring, play 3 rounds; most points wins. The rule sheet in the box has the official wording.']]]])}
function tsStats(p){const g=S.tsg;if(g&&tsPlayOn()&&S.started&&!S.finished&&g.ps&&g.ps.includes(p.id))return [{k:'Points',v:g.scoring==='none'?'·':String(tsTotal(g,p.id)),i:'✏️'},{k:'Round',v:`${g.round}${g.rounds?' of '+g.rounds:''}`},{k:'Scoring',v:TSSC[g.scoring]}];
  const D=p.ts||{r:[]};return [{k:'Points',v:String(tsTot(p)),i:'✏️'},{k:'Rounds',v:String((D.r||[]).length)},{k:'Favourites',v:String((D.fs||0)+(D.fg||0))}]}

/* ---------- moves: every move carries where the game was, so a slow phone's move never lands on the wrong page ---------- */
const tsSt=g=>`${g.gid}:${g.round}:${g.phase}:${g.step}:${g.rv?g.rv.i:''}`;
function tsMoveQ(g,pid,mv){if(!g||!mv)return false;if(mv.st!=null&&mv.st!==tsSt(g))return false;const m={...mv};delete m.st;
  if(m.a==='mark'&&m.f==='match'&&'v' in m){const owner=g.ps[(g.rv||{}).i],want=!!m.v;delete m.v;if(tsMatchOK(g,owner,+m.p)===want)return false;if(!tsMove(g,pid,m))return false;if(tsMatchOK(g,owner,+m.p)!==want)tsMove(g,pid,m);return true}
  if(m.a==='bookdone'&&g.phase==='reveal'){const owner=g.ps[g.rv.i],M=g.marks[owner]||{},B=g.books[owner];if(!tsMove(g,pid,m))return false;
    const F=g.fav=g.fav||{s:{},g:{},m:{}},inc=(o,p)=>{if(p)o[p]=(o[p]||0)+1};
    if(g.scoring==='friendly'){inc(F.s,M.sketch);inc(F.g,M.guess);if(M.self)inc(F.m,owner)}else{const L=B.pages.length-1;if(M.self||L>=0&&tsSame(B.pages[L].d,B.word))inc(F.m,owner)}return true}
  return tsMove(g,pid,m)}

/* ---------- the play screen ---------- */
let TSLAST=null,TSBIG=(()=>{try{return localStorage.getItem('ft-tsbig')==='1'}catch(e){return false}})(),TSERR='';
function tsViewer(){if(!tsLinked())return null;return act().find(p=>p.id===S.lk.me)||null}
const tsBig=()=>TSBIG||tsLinked()&&!tsViewer();
/* the state a phone should show: its own moves that are still on their way to the host count already */
function tsGx(){if(typeof LKOPTR!=='undefined'&&LKOPTR)return S.tsg||null;try{const o=typeof lkqOn==='function'&&lkqOn()?lkOptState():null;if(o)return o.tsg||null}catch(e){}return S.tsg||null}
function tsActor(g){if(!g||g.phase!=='reveal'||!g.rv)return null;return g.ps[g.rv.i]||null}
const tsClock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function tsTimerHtml(g,end){if(g.phase!=='play')return '';if(end===undefined){if(tsAsync(g)||!g.tEnd||tsKind(g.step)!=='draw')return '';end=g.tEnd}if(!end)return '';
  return `<span class="tstmr" data-end="${end}" role="timer">${tsIm('ts-timer','⏱','tstimg')} <b class="num">${Date.now()>end?'Finish up!':tsClock(end-Date.now())}</b></span>`}
/* "pass when ready": who's on which page */
function tsAsyncChips(g){return `<div class="tschips" aria-label="Who’s on which page">${g.ps.map(p=>{const k=tsAt(g,p),d=k>=g.steps;return `<span class="tschip${d?' on':''}" style="${tsPcol(p)}">${d?'✓ ':''}${esc(tsName(p))} · ${d?'done':`page ${k+1} of ${g.steps}`}</span>`}).join('')}</div>`}
function tsChips(g,done,lab){return `<div class="tschips" aria-label="${lab||'Who’s done'}">${g.ps.map(p=>{const d=done(p);return `<span class="tschip${d?' on':''}" style="${tsPcol(p)}">${d?'✓':'…'} ${esc(tsName(p))}</span>`}).join('')}</div>`}
const tsWaitLine=(g,done)=>{const w=g.ps.filter(p=>!done(p));return w.length?`Waiting for ${w.map(p=>esc(tsName(p))).join(', ')}…`:'Everyone’s done!'};
function tsSlotLabel(s){return s.t==='w'?esc(s.w):s.t==='blank'?'<i>blank: make up any word</i>':`<i>make up: ${esc(s.c)}</i>`}
function tsHead(g,V,big){const R=g.rounds?`Round ${g.round} of ${g.rounds}`:`Round ${g.round}`,me=V&&!big&&g.ps.includes(V.id)?V.id:null;
  if(g.phase==='play'&&tsAsync(g)){const pass=`${R} · passing ${g.dir>0?'left ⬅️':'right ➡️'} · when ready`;
    if(!me)return `<div class="tshead">${tsIm('ts-pass','📒')}<div><span class="rlab">${pass}</span><h2>Pass when ready</h2></div></div>`;
    const pr=tsPrompt(g,me);if(!pr)return `<div class="tshead">${tsIm('ts-pass','📒')}<div><span class="rlab">${pass}</span><h2>All your pages are done!</h2></div></div>`;
    const d=pr.kind==='draw';return `<div class="tshead">${pr.wait?tsIm('ts-pass','📒'):d?tsIm('ts-sketch','✏️'):tsIm('ts-guess','🤔')}<div><span class="rlab">${pass}</span><h2>Page ${pr.k+1} of ${g.steps} · ${pr.wait?'Book on its way':d?'Sketch it!':'Guess it!'}</h2>${!pr.wait&&d?tsTimerHtml(g,(g.te||{})[me]||null):''}</div></div>`}
  if(g.phase==='play'){const d=tsKind(g.step)==='draw',wait=!me||g.sub[me];return `<div class="tshead">${wait?tsIm('ts-pass','📒'):d?tsIm('ts-sketch','✏️'):tsIm('ts-guess','🤔')}<div><span class="rlab">${R} · passing ${g.dir>0?'left ⬅️':'right ➡️'}</span><h2>Page ${g.step+1} of ${g.steps} · ${d?'Sketch it!':'Guess it!'}</h2>${tsTimerHtml(g)}</div></div>`}
  if(g.phase==='pick')return `<div class="tshead">${tsIm('ts-sketch','✏️')}<div><span class="rlab">${R}</span><h2>Choose your secret word</h2></div></div>`;
  if(g.phase==='reveal')return `<div class="tshead">${tsIm('ts-reveal','🎉')}<div><span class="rlab">${R}</span><h2>The Big Reveal</h2></div></div>`;
  return `<div class="tshead">${tsIm('ts-win','🏆')}<div><span class="rlab">${R}</span><h2>${g.phase==='done'?'That’s the game!':`Round ${g.round} is done!`}</h2></div></div>`}
function tsPickUI(g,V,big){const done=p=>!!g.books[p].word;
  if(big||!V||!g.ps.includes(V.id))return `<div class="panel tspanel tscenter">${tsDie(g.die,big?120:84)}<p class="tsbigline">The die rolled a <b>${g.die}</b>. Everyone is choosing a secret word.</p>${tsChips(g,done)}</div>`;
  const C=g.cards[V.id],B=g.books[V.id];
  if(B.word)return `<div class="panel tspanel tscenter"><p class="rlab">Your secret word</p><p class="tsword">${esc(B.word)}</p><p class="rlab">Keep it secret!</p><p class="rlab">${tsWaitLine(g,done)}</p>${tsChips(g,done)}</div>`;
  const s=C.slots[g.die-1],rolled=tsRolled(g,V.id);
  return `<div class="panel tspanel"><div class="tsdierow">${tsDie(g.die,84)}<div><p class="tsbigline">The die rolled a <b>${g.die}</b>.</p><p class="rlab">${C.any?'Your card says <b>any</b>: tap any word on it.':rolled?'That’s your secret word. Keep it secret!':s.t==='blank'?'A blank: make up any word and type it below.':`Make up: <b>${esc(s.c)}</b>. Type it below.`}</p></div></div>
    <ol class="tscard${C.any?' any':''}" aria-label="Your card">${C.slots.map((x,i)=>{const hit=i===g.die-1,tap=C.any&&x.t==='w';return `<li class="tsslot${hit?' hit':''}${tap?' tap':''}">${tap?`<button data-a="tsuword" data-k="${i}">`:'<span>'}<span class="tsn">${i+1}</span><span class="tsw">${tsSlotLabel(x)}</span>${tap?'</button>':'</span>'}</li>`}).join('')}</ol>
    ${rolled?`<div class="cnrow"><button class="btn primary" data-a="tsuword" data-k="${g.die-1}">✓ Got it: ${esc(rolled)}</button></div>`:''}</div>`}
function tsPlayStep(g,V,big){if(tsAsync(g))return tsPlayAsync(g,V,big);const done=p=>!!g.sub[p];
  if(big||!V||!g.ps.includes(V.id))return `<div class="panel tspanel tscenter"><p class="tsbigline">${tsKind(g.step)==='draw'?'✏️ Everyone is sketching':'🤔 Everyone is guessing'}</p>${tsChips(g,done)}<p class="rlab">${tsWaitLine(g,done)}</p></div>`;
  if(g.sub[V.id])return `<div class="panel tspanel tscenter"><p class="tsbigline">Sent ✓</p><p class="rlab">${tsWaitLine(g,done)}</p>${tsChips(g,done)}<p class="hint">The next page shows up as soon as everyone’s done.</p></div>`;
  const pr=tsPrompt(g,V.id);if(!pr)return '';
  if(pr.kind==='draw')return `<div class="panel tspanel tscenter"><p class="rlab">Sketch this (no letters or numbers):</p><p class="tsword">${esc(pr.word||'')}</p><p class="hint">Your sketch pad is open. Tap Done when you’re finished.</p></div>`;
  return `<div class="panel tspanel tscenter"><p class="rlab">What is this sketch?</p><div class="tssk tsbigsk" data-tspg="${esc(pr.owner)}:${g.step-1}">${tsSvgOk(pr.draw||'',360)}</div><p class="hint">Type your guess below. Never leave a guess blank.</p></div>`}
/* "pass when ready": your own page, or who you're waiting on, plus everyone's progress */
function tsPlayAsync(g,V,big){const done=p=>tsAt(g,p)>=g.steps;
  if(big||!V||!g.ps.includes(V.id))return `<div class="panel tspanel tscenter"><p class="tsbigline">📒 The books move on as soon as each page is done</p>${tsAsyncChips(g)}</div>`;
  const pr=tsPrompt(g,V.id);
  if(!pr)return `<div class="panel tspanel tscenter"><p class="tsbigline">Sent ✓</p><p class="rlab">${tsWaitLine(g,done)}</p>${tsAsyncChips(g)}<p class="hint">The Big Reveal starts when every book is full.</p></div>`;
  if(pr.wait)return `<div class="panel tspanel tscenter tswait"><p class="tsbigline">Sent ✓ — waiting for <b>${esc(tsName(pr.from))}</b> to pass you a book</p>${tsAsyncChips(g)}<p class="hint">Your next page shows up as soon as it arrives.</p></div>`;
  if(pr.kind==='draw')return `<div class="panel tspanel tscenter"><p class="rlab">Sketch this (no letters or numbers):</p><p class="tsword">${esc(pr.word||'')}</p><p class="hint">Your sketch pad is open. Tap Done when you’re finished.</p></div>`;
  return `<div class="panel tspanel tscenter"><p class="rlab">What is this sketch?</p><div class="tssk tsbigsk" data-tspg="${esc(pr.owner)}:${pr.k-1}">${tsSvgOk(pr.draw||'',360)}</div><p class="hint">Type your guess below. Never leave a guess blank.</p>${tsAsyncChips(g)}</div>`}
/* the Big Reveal: the same book on every screen */
function tsPageHtml(g,owner,i,size,marks){const B=g.books[owner];
  if(i<0)return `<div class="tspage tssecret"><span class="rlab">${esc(tsName(owner))}’s secret word</span><span class="tsword">${esc(B.word||'')}</span></div>`;
  const P=B.pages[i];if(!P)return '';const who=`<span class="tsby" style="${tsPcol(P.by)}">${P.kind==='draw'?'✏️ Sketched':'💬 Guessed'} by <b>${esc(tsName(P.by))}</b></span>`;
  return `<div class="tspage ${P.kind==='draw'?'tsdraw':'tsguess'}">${who}${P.kind==='draw'?`<div class="tssk" data-tspg="${esc(owner)}:${i}">${tsSvgOk(P.d,size)}</div>`:`<span class="tsgtxt">${esc(P.d)}</span>`}${marks||''}</div>`}
function tsMarkBtns(g,owner,i,mine){const P=g.books[owner].pages[i],M=g.marks[owner]||{match:{}};if(g.scoring==='none'||!P)return '';
  if(g.scoring==='friendly'){if(P.by===owner)return '';const f=P.kind==='draw'?'sketch':'guess',on=M[f]===P.by&&M[f+'P']===i;
    return mine?`<button class="btn sm tsmark${on?' on':''}" data-a="tsumark" data-k="${f}:${i}" aria-pressed="${on}">${on?'⭐ Favourite':'☆ Make favourite'} ${f}</button>`:on?`<span class="tsstar">⭐ Favourite ${f}</span>`:''}
  if(P.kind!=='guess')return '';const ok=tsMatchOK(g,owner,i);
  return mine?`<button class="btn sm tsmark${ok?' on':''}" data-a="tsumatch" data-k="${i}:${ok?0:1}" aria-pressed="${ok}">${ok?'✓ Matches':'✗ No match'}</button>`:ok?'<span class="tsstar">✓ Match</span>':''}
function tsRevealUI(g,V,big){const owner=g.ps[g.rv.i],B=g.books[owner],p=g.rv.p,last=B.pages.length-1,mine=!big&&V&&V.id===owner,sz=big?560:340;
  let o=`<div class="tsbook" style="${tsPcol(owner)}"><div class="tsbookh"><b>📒 ${esc(tsName(owner))}’s book</b><span class="rlab">Book ${g.rv.i+1} of ${g.ps.length}</span></div>${tsAutoHtml(g,owner,mine)}`;
  if(p<last){o+=tsPageHtml(g,owner,p,sz);
    if(p>=0)o+=`<div class="tsthumbs" aria-label="Pages so far">${[-1,...B.pages.map((x,i)=>i)].filter(i=>i<p).map(i=>{const P=B.pages[i];return `<span class="tsthumb">${i<0?esc(B.word):P.kind==='draw'?`<span class="tssk" data-tspg="${esc(owner)}:${i}">${tsSvgOk(P.d,56)}</span>`:esc(P.d)}</span>`}).join('<i>›</i>')}</div>`;
    o+=`<p class="rlab tscenter">Page ${p+2} of ${last+2}</p>`}
  else{const M=g.marks[owner]||{};o+=`<div class="tswhole">${[-1,...B.pages.map((x,i)=>i)].map(i=>tsPageHtml(g,owner,i,big?360:240,i<0?'':tsMarkBtns(g,owner,i,mine))).join('')}</div>`;
    if(g.scoring!=='none'){const lg=B.pages[last],looks=lg&&tsSame(lg.d,B.word);
      o+=mine?`<div class="tsscoreme"><p class="rlab">${g.scoring==='friendly'?'Tap ⭐ on your favourite sketch and your favourite guess (not your own).':'Check the ✓ on each guess that matches the secret word or the guess before it.'}</p><button class="btn${M.self?' primary':''}" data-a="tsuself" aria-pressed="${!!M.self}">${M.self?'✓':'○'} The last guess matches my word (+1 for me)</button>${looks&&!M.self?'<p class="rlab">It looks like a match!</p>':''}</div>`
        :M.self?`<p class="rlab tscenter">✓ The last guess matched ${esc(tsName(owner))}’s word.</p>`:''}}
  if(mine)o+=`<div class="tsnav"><button class="btn" data-a="tsuprev" ${p<0?'disabled':''} aria-label="Previous page">◀</button>${p<last?'<button class="btn primary" data-a="tsunext" aria-label="Next page">Next page ▶</button>':'<button class="btn primary" data-a="tsudone">Done with my book</button>'}</div>`;
  else o+=g.auto?`<p class="rlab tscenter">${p===last&&g.scoring!=='none'?`${esc(tsName(owner))} is giving out points…`:`▶️ Auto-play: ${esc(tsName(owner))}’s book`}</p>`:`<p class="rlab tscenter">${esc(tsName(owner))} is flipping through ${big?'their':'the'} book${p===last?' and giving out points':''}…</p>`;
  return o+'</div>'}
/* "Auto-play": the countdown to the next page on every screen, with ⏸ / ▶ for the owner and the host */
function tsAutoLeft(g){const R=g.rv,dur=g.auto*1000;return R.pz!=null?R.pz:Math.max(0,Math.min(dur,(R.t||Date.now())+dur-Date.now()))}
function tsAutoHtml(g,owner,mine){if(!g.auto||!g.rv)return '';const R=g.rv,last=g.books[owner].pages.length-1,dur=g.auto*1000;
  if(R.p>=last&&g.scoring!=='none')return `<div class="tsauto tsautow"><span class="rlab">⏸ Auto-play waits here until ${mine?'you tap <b>Done with my book</b>':`${esc(tsName(owner))} taps Done`}.</span></div>`;
  const pz=R.pz!=null,left=tsAutoLeft(g),lab=R.p>=last?'Next book':'Next page',can=mine||tsLinked()&&lkHost();
  return `<div class="tsauto${pz?' pz':''}"${pz?'':` data-t="${R.t||0}" data-dur="${dur}" data-lab="${lab}"`}><div class="tsautobar" role="progressbar" aria-label="Time until the next page" aria-valuemin="0" aria-valuemax="${g.auto}" aria-valuenow="${Math.ceil(left/1000)}"><i style="width:${(100*left/dur).toFixed(1)}%"></i></div>
    <span class="rlab tsautot">${pz?'⏸ Paused':`${lab} in <b class="num">${Math.ceil(left/1000)}</b> s`}</span>${can?`<button class="btn sm tsautob" data-a="tsupause" data-k="${pz?0:1}" aria-label="${pz?'Resume auto-play':'Pause auto-play'}">${pz?'▶ Resume':'⏸ Pause'}</button>`:''}</div>`}
function tsScoreTable(g){if(g.scoring==='none')return '';const P=g.ps.slice().sort((a,b)=>tsTotal(g,b)-tsTotal(g,a));
  return `<table class="tstab"><thead><tr><th>Player</th>${Array.from({length:g.round},(_,r)=>`<th>R${r+1}</th>`).join('')}<th>Total</th></tr></thead><tbody>${P.map(p=>`<tr style="${tsPcol(p)}"><td><i class="dot"></i>${esc(tsName(p))}</td>${Array.from({length:g.round},(_,r)=>`<td class="num">${+(g.score[p]||[])[r]||0}</td>`).join('')}<td class="num"><b>${tsTotal(g,p)}</b></td></tr>`).join('')}</tbody></table>`}
function tsRoundEndUI(g,big){return `<div class="panel tspanel">${tsScoreTable(g)||'<p class="rlab tscenter">No scoring: just for laughs.</p>'}
  ${big?'':`<div class="cnrow"><button class="btn primary" data-a="tsunextround">▶️ Next round</button><button class="btn" data-a="tsustop">🏁 Stop here</button></div>`}${g.rounds?`<p class="rlab tscenter">${g.rounds-g.round} round${g.rounds-g.round===1?'':'s'} left.</p>`:''}</div>`}
function tsDoneUI(g,big){const P=g.ps,top=Math.max(...P.map(p=>tsTotal(g,p))),w=g.scoring==='none'?[]:P.filter(p=>tsTotal(g,p)===top);
  return `<div class="panel tspanel tscenter">${w.length?`<p class="tsbigline">🏆 ${w.map(p=>esc(tsName(p))).join(' and ')} ${w.length>1?'tie':'wins'} with ${top} point${top===1?'':'s'}</p>`:''}${tsScoreTable(g)}
  ${big?'':'<div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; see results</button></div></div>'}</div>`}
function tsPlayUI(){const g=S.tsg,P=act(),big=tsBig();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Telestrations">${g&&g.phase==='done'?'🏁':'✏️'}</h1>${tsLinked()?`<button class="btn sm undo" data-a="tsubig" aria-pressed="${big}" aria-label="Big board for a TV or iPad">📺${big?' Exit':''}</button>`:''}<button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  document.documentElement.classList.toggle('tsbig',big&&!!g);
  if(P.some(p=>p.bot))return out+`<div class="panel" style="padding:16px"><p>Telestrations has no computer players: a computer can’t sketch! Go back to Players and turn the computer seats into people.</p></div>`;
  if(P.length<4)return out+`<div class="panel" style="padding:16px"><p>Telestrations needs 4 to 8 players. Go back to Players and add more.</p></div>`;
  if(!tsLinked())return out+`<div class="panel tspanel tslinkme"><h2>📱 Link the phones</h2><p>Each phone is a sketchbook. Tap <b>📱 Link</b> at the top, then everyone joins with the code and picks themselves.</p><p>A phone or iPad that picks <b>Just watching</b> becomes the big board for the Big Reveal.</p><p class="hint">Playing with the real books and markers? Use the record sheet instead.</p><div class="cnrow"><button class="btn" data-a="tsurecord">Record a real game instead</button></div></div>`;
  if(!g||tsStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(tsRes2()?'Passing out sketchbooks…':'Waiting for the host phone…')}</div>`;
  const V=tsViewer();out+=tsHead(g,V,big);
  if(g.phase==='pick')out+=tsPickUI(g,V,big);
  else if(g.phase==='play')out+=tsPlayStep(g,V,big);
  else if(g.phase==='reveal')out+=tsRevealUI(g,V,big);
  else if(g.phase==='roundEnd')out+=tsRoundEndUI(g,big);
  else if(g.phase==='done')out+=tsDoneUI(g,big);
  return out}

/* ---------- moves from the screen ---------- */
function tsSend(m){const g=tsGx(),V=tsViewer();if(!g||!V)return false;const r=lkq('tsMove',V.id,{...m,st:tsSt(g)});if(r)vibe(8);return r}
function tsUiAct(a,b,k){if(a==='tsubig'){TSBIG=!tsBig();try{localStorage.setItem('ft-tsbig',TSBIG?'1':'0')}catch(e){}return}
  if(a==='tsurecord'){TSX().play=0;tsKeep();return}
  if(a==='tsupause'){const g=tsGx();if(!g||g.phase!=='reveal'||!g.rv||!g.auto)return;const m={a:'rvpause',on:k==='1'?1:0},V=tsViewer(),owner=g.ps[g.rv.i];
    if(V&&V.id===owner&&!tsBig()){tsSend(m);return}
    /* the host (a player or the big board) pauses for everyone: it holds the game, so it changes it right here */
    if(tsLinked()&&lkHost()&&S.tsg&&tsMoveQ(S.tsg,owner,{...m,st:tsSt(S.tsg)}))vibe(8);return}
  const g=tsGx();if(!g||tsBig())return;
  switch(a){
    case 'tsuword':tsSend({a:'word',slot:+k});return;
    case 'tsunext':tsSend({a:'rvnext',...(g.rv?{p:g.rv.p}:{})});return;
    case 'tsuprev':tsSend({a:'rvprev',...(g.rv?{p:g.rv.p}:{})});return;
    case 'tsumark':{const [f,p]=String(k).split(':');tsSend({a:'mark',f,p:+p});return}
    case 'tsumatch':{const [p,v]=String(k).split(':');tsSend({a:'mark',f:'match',p:+p,v:v==='1'});return}
    case 'tsuself':tsSend({a:'mark',f:'self'});return;
    case 'tsudone':tsSend({a:'bookdone'});return;
    case 'tsunextround':tsSend({a:'next'});return;
    case 'tsustop':tsSend({a:'stop'});return}}
/* setup: the Pen colors house rule (handled here so the shared app core needs no new case) */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="tspens"],[data-a="tspass"],[data-a="tsrev"],[data-a="tsautos"]');if(!b||b.disabled)return;e.stopPropagation();
  if(S.game!=='telestrations'||S.started&&tsPlayOn())return;const X=TSX(),a=b.dataset.a,k=b.dataset.k;
  if(a==='tsrev')X.auto=k==='1'?(X.auto||10):0;else if(a==='tsautos')X.auto=[4,6,8,10].includes(+k)?+k:10;else X[a==='tspens'?'colors':'async']=k==='1'?1:0;tsKeep();save();render()},true);
/* setup: the custom sketch timer (seconds). While typing, keep any whole number 10-600 and update the hint; on leaving the box, tidy it up */
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.tscsec||S.game!=='telestrations')return;const n=Math.round(+t.value);
  if(isFinite(n)&&n>=10&&n<=600){TSX().csec=n;tsKeep();save();const h=document.getElementById('tstimerhint');if(h)h.textContent=tsTimerHint(TSX())}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.tscsec||S.game!=='telestrations')return;e.stopPropagation();
  const X=TSX(),n=Math.round(+t.value);X.csec=isFinite(n)?Math.max(10,Math.min(600,n)):tsCsec(X);t.value=X.csec;tsKeep();save();render()},true);
/* the drawing pad (draw.js) hands back the finished sketch here */
window.tsPadDone=d=>{/* the pad can finish inside a redraw (time ran out): send it just after, never from the borrowed state */if(typeof LKOPTR!=='undefined'&&LKOPTR){setTimeout(()=>window.tsPadDone(d),0);return true}const g=tsGx(),V=tsViewer();if(!g||!V||g.phase!=='play'||tsDoneP(g,V.id))return false;const pr=tsPrompt(g,V.id);if(!pr||pr.wait||pr.kind!=='draw')return false;
  /* only the page this pad was opened for */if(typeof TSD!=='undefined'&&TSD.key&&TSD.key!==tsPadKey(g,pr,V.id))return false;
  const r=tsSend({a:'page',d:String(d||''),o:pr.owner,k:pr.k});save();render();return r};
const tsPadKey=(g,pr,me)=>`${g.gid}:${g.round}:${pr.owner}:${pr.k}:${me}`;
function tsTimeUp(g){if(g&&g.phase==='play'&&tsAsync(g)){const now=Date.now();return Object.values(g.te||{}).some(t=>now>t+4000)&&tsMove(g,g.ps[0],{a:'timeup'})}
  if(!g||g.phase!=='play'||!g.tEnd||tsKind(g.step)!=='draw'||Date.now()<=g.tEnd+4000)return false;return tsMove(g,g.ps[0],{a:'timeup'})}
/* host only: "Auto-play" turns the reveal page (or, with no scoring, moves on to the next book) once its time is up */
function tsAutoStep(g){if(!g||g.phase!=='reveal'||!g.auto||!g.rv)return false;const R=g.rv;if(!R.t){R.t=Date.now();return true}
  const d=tsAutoDue(g);if(d==='page')return tsMove(g,g.ps[0],{a:'rvauto'});if(d==='book')return tsMoveQ(g,g.ps[R.i],{a:'bookdone'});return false}
/* host only: if a late copy of the game mixed old and new (everyone handed in, but the page never turned), finish the step */
function tsRepair(g){if(!g||!g.ps)return false;if(g.phase==='pick'&&g.ps.every(p=>g.books[p]&&g.books[p].word)){tsStartPlay(g);return true}
  if(g.phase==='play'&&tsAsync(g)){const f=()=>JSON.stringify([g.phase,g.ps.map(p=>[(g.at||{})[p],(g.te||{})[p]||0,(g.sub||{})[p]||0])]),b=f();tsAsyncStep(g);return f()!==b}
  if(g.phase==='play'&&g.ps.every(p=>g.sub[p])&&g.ps.every(o=>g.books[o].pages[g.step])){tsAdvance(g);return true}return false}
function tsTick(){if(!tsPlayOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!tsRes2())return;if(lkqRun()){save();render();return}
  if(act().some(p=>p.bot)||act().length<4||!tsLinked())return;
  const g=S.tsg;if(!g||tsStale(g)){const X=TSX(),n=tsDeal({words:X.words,own:X.own,ownOnly:X.ownOnly,scoring:X.scoring,timer:tsTimerOf(X),flip:!!X.flip,colors:!!X.colors,async:!!X.async,auto:+X.auto||0});if(n){S.tsg=n;save();render()}return}
  if(tsTimeUp(g)||tsRepair(g)||tsAutoStep(g)){save();render()}}
function tsSyncScorer(g){if(!g)return;const F=g.fav||{s:{},g:{},m:{}};S.tsrec={scoring:g.scoring,rounds:g.round,timer:g.timer};
  act().forEach(p=>{p.ts={r:(g.score[p.id]||[]).map(v=>+v||0),fs:F.s[p.id]||0,fg:F.g[p.id]||0,fm:F.m[p.id]||0}});S.hr=1}

/* ---------- typing (made-up word, guesses): its own layer, so redraws never wipe what you're typing ---------- */
function tsFxMode(g,V){if(!g||!V||tsBig()||!g.ps.includes(V.id))return null;
  if(g.phase==='pick'&&!g.books[V.id].word){const C=g.cards[V.id];if(C.any||tsRolled(g,V.id))return null;const s=C.slots[g.die-1];return {m:'pick',key:`${g.gid}:${g.round}:pick`,lab:s.t==='cat'?`Make up: ${s.c}`:'Make up any word',ph:s.t==='cat'?'Something in that category':'Your secret word',btn:'Use this word'}}
  if(g.phase==='play'&&!tsDoneP(g,V.id)){const pr=tsPrompt(g,V.id);if(pr&&!pr.wait&&pr.kind==='guess')return {m:'guess',key:`${g.gid}:${g.round}:${pr.owner}:${pr.k}`,o:pr.owner,k:pr.k,lab:'What is it?',ph:'Your best guess',btn:'Send'}}
  return null}
function tsFx(){/* sounds: checked on every redraw too, so a page that's answered within moments still gets its page turn */try{tsSndCheck()}catch(e){}let L=document.getElementById('tsfx');const on=S.game==='telestrations'&&tsPlayOn()&&S.started&&!S.demo&&S.screen==='score'&&tsLinked()&&!act().some(p=>p.bot);
  const g=on?tsGx():null,ok=g&&!tsStale(g),V=ok?tsViewer():null,F=ok?tsFxMode(g,V):null;
  /* the sketch pad */
  const pr=ok&&V&&!tsBig()&&g.phase==='play'&&g.ps.includes(V.id)&&!tsDoneP(g,V.id)?tsPrompt(g,V.id):null;
  try{if(typeof tsPadSync==='function'){
    if(pr&&!pr.wait&&pr.kind==='draw')tsPadSync({show:true,key:tsPadKey(g,pr,V.id),word:pr.word||'',tEnd:tsAsync(g)?(g.te||{})[V.id]||null:g.tEnd,colors:!!g.colors});else tsPadSync({show:false})}}catch(e){console.error(e)}
  /* "pass when ready": a little buzz when the next book reaches you */
  {const t=pr&&tsAsync(g)?(pr.wait?'wait':tsPadKey(g,pr,V.id)):null;if(TSLAST==='wait'&&t&&t!=='wait')vibe(30);TSLAST=t}
  if(!F){if(L)L.remove();document.documentElement.style.removeProperty('--tspad');TSERR='';return}
  const sig=F.m+':'+F.key;
  if(!L||L.dataset.sig!==sig){if(L)L.remove();TSERR='';L=document.createElement('div');L.id='tsfx';L.className='cnlayer tslayer';L.dataset.sig=sig;L.dataset.m=F.m;if(F.o!=null){L.dataset.o=F.o;L.dataset.k=F.k}
    L.innerHTML=`<div class="cnsheet tssheet" role="region" aria-label="${esc(F.lab)}"><div class="cntop"><h2>${F.m==='guess'?'💬':'✏️'} ${esc(F.lab)}</h2></div><form id="tsform" class="chform" autocomplete="off"><input id="tsin" type="text" maxlength="40" placeholder="${esc(F.ph)}" aria-label="${esc(F.lab)}" enterkeyhint="send" autocapitalize="words"><button class="btn primary" type="submit">${F.btn}</button></form><p class="cnerr rlab" role="alert"></p>${F.m==='guess'?'<p class="rlab cnmhint">Never leave a guess blank: take your best guess!</p>':'<p class="rlab cnmhint">Only you see it. Keep it secret!</p>'}</div>`;
    document.body.appendChild(L)}
  L.querySelector('.cnerr').textContent=TSERR;
  document.documentElement.style.setProperty('--tspad',(L.offsetHeight+12)+'px')}
document.addEventListener('submit',e=>{const f=e.target;if(!f||f.id!=='tsform')return;e.preventDefault();const L=document.getElementById('tsfx'),i=document.getElementById('tsin');if(!L||!i)return;
  const v=tsClean(i.value),m=L.dataset.m;if(!v){TSERR=m==='guess'?'Never leave a guess blank: take your best guess!':'Type a word first.';tsFx();return}
  TSERR='';if(tsSend(m==='guess'?{a:'page',d:v,...(L.dataset.o!=null?{o:L.dataset.o,k:+L.dataset.k}:{})}:{a:'word',w:v})){i.value='';vibe(12)}save();render()});
setInterval(()=>{try{tsFx()}catch(e){}},700);
/* the sketch timer on screen, and the host closes the sketch step when time is up */
setInterval(()=>{try{document.querySelectorAll('.tstmr[data-end]').forEach(el=>{const ms=+el.dataset.end-Date.now(),b=el.querySelector('b');if(b)b.textContent=ms>0?tsClock(ms):'Finish up!';el.classList.toggle('low',ms<10000)});
  if(S.game!=='telestrations'||!tsPlayOn()||!S.started||S.demo||!tsRes2()||(typeof LKOPTR!=='undefined'&&LKOPTR))return;if(S.tsg&&!tsStale(S.tsg)&&(tsTimeUp(S.tsg)||tsLinked()&&lkHost()&&(tsRepair(S.tsg)||tsAutoStep(S.tsg)))){save();render()}}catch(e){}},500);
/* the auto-play countdown bar on every screen */
setInterval(()=>{try{document.querySelectorAll('.tsauto[data-t]').forEach(el=>{const dur=+el.dataset.dur,left=Math.max(0,Math.min(dur,+el.dataset.t+dur-Date.now())),i=el.querySelector('.tsautobar i'),b=el.querySelector('.tsautot b');
  if(i)i.style.width=(100*left/dur).toFixed(1)+'%';if(b)b.textContent=String(Math.ceil(left/1000))})}catch(e){}},200);
/* ---------- sounds (the app's sound setting; made on the fly, no sound files) ----------
   each event has its own key and plays once: re-renders, the sync and the optimistic copy never repeat it */
function tsTone(c,f,t,d,type,vol,f2){const o=c.createOscillator(),gn=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(vol||.15,t+.01);gn.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gn).connect(c.destination);o.start(t);o.stop(t+d+.05)}
function tsSfx(kind){if(!SET.sound)return;const c=typeof ac==='function'?ac():null;if(!c)return;const t=c.currentTime+.02;try{
  if(kind==='page'){/* a soft page turn: a short swish of filtered noise */
    if(typeof noise==='function'){const s=c.createBufferSource(),f=c.createBiquadFilter(),gn=c.createGain();s.buffer=noise(c);f.type='bandpass';f.Q.value=.8;
      f.frequency.setValueAtTime(700,t);f.frequency.exponentialRampToValueAtTime(3200,t+.16);gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(.16,t+.04);gn.gain.exponentialRampToValueAtTime(.001,t+.24);
      s.connect(f).connect(gn).connect(c.destination);s.start(t,Math.random()*2);s.stop(t+.3)}else tsTone(c,900,t,.12,'triangle',.05,1800)}
  else if(kind==='tick')tsTone(c,1700,t,.035,'square',.035);
  else if(kind==='timeup'){tsTone(c,660,t,.16,'triangle',.18);tsTone(c,440,t+.15,.32,'triangle',.18)}
  else if(kind==='tada'){if(typeof brass==='function'){brass(c,392,t,.1,{vol:.07});[523,659,784].forEach((f,i)=>brass(c,f,t+.16,.55,{vol:.06,pan:(i-1)*.3}))}
    else{tsTone(c,392,t,.12,'triangle',.18);[523,659,784].forEach(f=>tsTone(c,f,t+.16,.6,'triangle',.12))}}
  else if(kind==='chime'){tsTone(c,1319,t,.5,'sine',.1);tsTone(c,1976,t+.08,.6,'sine',.07)}}catch(e){}}
let TSSF=null;
/* the sound events right now on this screen: [kind, key]. The big board (and anyone just watching) only gets the reveal's */
function tsSndEvents(g){const ev=[];if(!g||!g.gid)return ev;const V=tsViewer(),big=tsBig(),me=V&&!big&&g.ps.includes(V.id)?V.id:null,R=`${g.gid}:${g.round}`;
  if(me&&g.phase==='play'&&!tsDoneP(g,me)){const pr=tsPrompt(g,me);
    if(pr&&!pr.wait){const base=`${R}:${pr.owner}:${pr.k}`;
      /* a book that isn't yours just reached you */
      if(pr.owner!==me)ev.push(['page','pg:'+base]);
      if(pr.kind==='draw'){const end=tsAsync(g)?(g.te||{})[me]:g.tEnd,st=typeof tsPadState==='function'?tsPadState():null;
        if(end&&!(st&&st.sent)){const ms=end-Date.now();if(ms>0&&ms<=10000)ev.push(['tick',`tk:${base}:${Math.ceil(ms/1000)}`]);else if(ms<=0&&ms>-3000)ev.push(['timeup','tu:'+base])}}}}
  if(g.phase==='reveal'&&g.rv){ev.push(['tada','rv:'+R]);const B=g.books[g.ps[g.rv.i]];if(B&&g.rv.p>=0&&g.rv.p===B.pages.length-1)ev.push(['chime',`ch:${R}:${g.rv.i}`])}
  return ev}
function tsSndCheck(){const g=S.game==='telestrations'&&tsPlayOn()&&S.started&&!S.demo&&S.screen==='score'&&tsLinked()?tsGx():null;if(!g||tsStale(g))return;
  const ev=tsSndEvents(g);/* the first look (just opened the app) only notes what's already happened */if(!TSSF){TSSF=new Set(ev.map(e=>e[1]));return}
  ev.forEach(([kind,key])=>{if(TSSF.has(key))return;TSSF.add(key);tsSfx(kind)});if(TSSF.size>600)TSSF=new Set([...TSSF].slice(-300))}
setInterval(()=>{try{tsSndCheck()}catch(e){}},200);
/* family records on the stats screen */
function tsRecords(G){const TG=G.filter(g=>g.game==='telestrations'&&g.state&&g.state.players);if(!TG.length)return '';const per={};let bestR=null;
  TG.forEach(g=>{const R=g.state.tsrec||{};if(R.scoring==='none')return;const tots=g.state.players.map(p=>((p.ts||{}).r||[]).reduce((a,b)=>a+(+b||0),0)),top=Math.max(0,...tots);
    g.state.players.forEach((p,j)=>{const D=p.ts;if(!D)return;const pl=g.players.find(x=>x.name===((p.name||'').trim()));if(!pl||!realP(pl))return;
      const e=per[pkey(pl)]||(per[pkey(pl)]={name:pl.name,color:pl.color,g:0,w:0,fav:0});e.g++;if(top&&tots[j]===top)e.w++;e.fav+=(D.fs||0)+(D.fg||0);
      (D.r||[]).forEach(v=>{if(!bestR||+v>bestR.v)bestR={v:+v,name:pl.name,color:pl.color,g}})})});
  const L=Object.values(per),card=(t,v,sub,c)=>`<div${c?` style="${pc(c)}"`:''}><span>${t}</span><b>${v}</b><small>${sub}</small></div>`;
  const top=[...L].sort((a,b)=>b.w-a.w)[0],fav=[...L].sort((a,b)=>b.fav-a.fav)[0];
  return `<div class="sec"><div class="sec-h"><h3>Telestrations records</h3></div><div class="recs" style="margin-top:0">
    ${top&&top.w?card('Most wins',`<span class="num">${top.w}</span>`,`${esc(top.name)} · ${top.w} of ${top.g} games`,top.color):''}
    ${fav&&fav.fav?card('Most favourites',`<span class="num">${fav.fav}</span>`,`${esc(fav.name)} · ⭐ sketches and guesses`,fav.color):''}
    ${bestR&&bestR.v?card('Best round',`<span class="num">${bestR.v}</span>`,`${esc(bestR.name)} · ${fmtD(bestR.g.date,{month:'short',day:'numeric'})}`,bestR.color):''}</div></div>`}
