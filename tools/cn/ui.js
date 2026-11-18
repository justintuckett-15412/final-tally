/* ================= Codenames: settings, record sheet, play screen, team panel ================= */
const CNDEF={play:1,words:'std',own:'',ownOnly:0,match:1,timer:0};
const CNX=()=>{if(!S.cnx)S.cnx={...CNDEF};const X=S.cnx;for(const k in CNDEF)if(X[k]===undefined)X[k]=CNDEF[k];return X};
function cnSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(KEY+'.cnx'))}catch(e){}return Object.assign({...CNDEF},x||{})}
function cnKeep(){if(S.demo)return;try{localStorage.setItem(KEY+'.cnx',JSON.stringify(CNX()))}catch(e){}}
const cnPlayOn=()=>S.game==='codenames'&&!!CNX().play;
const cnGg=()=>S.cng||null;
const cnRes2=()=>!S.lk||S.demo||lkHost();
const cnLinked=()=>!!(S.lk&&!S.demo);
function cnFresh(){return {game:'codenames',screen:'map',map:'codenames',rules:{},started:false,active:0,picks:{},hr:0,cnx:cnSaved(),cnrec:{},players:CARC_COLORS.map((c,i)=>newPlayer('',c,i<4))}}
function CNM(){return {name:'Codenames',meta:'Word game · two teams · spymasters give clues',min:4,max:8,teams:false,colors:CARC_COLORS,lengths:[],pieces:0,piece:'',own:[],defaults:[],tb:[]}}
const cnP=p=>{if(!p.cn)p.cn={tm:'',spy:0,win:0};return p.cn};
const cnTot=p=>(p.cn&&p.cn.win)?1:0;
const cnIm=(n,t,c)=>`<img class="${c||'cni'}" src="art/${n}.webp" alt="${t||''}" loading="lazy" onerror="this.remove()">`;
const cnTI=(n,t)=>n+(t==='b'?'-b':'');
const CNFMT={1:'One game',3:'Best of 3',5:'Best of 5',0:'Keep playing'};

/* ---------- home, setup ---------- */
function cnHomeCard(){const st=gamePeek('codenames');
  return `<div class="game"><div class="gtop"><img class="gart" src="art/codenames-icon.png" alt="" width="84" height="84" onerror="this.outerHTML='<div class=&quot;gart nxart&quot; aria-hidden=&quot;true&quot;>🕵️</div>'"><div><h2>Codenames</h2><div class="meta">Word game · two teams · spymasters give clues</div></div></div>
    ${st&&st.started&&!st.finished?`<div class="rlab">Game in progress${st.touched?` · last changed ${ago(st.touched)}`:''}</div><div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="gresume" data-k="codenames">Resume game</button><button class="btn" data-a="gnew" data-k="codenames">New game</button><button class="btn" data-a="gabandon" data-k="codenames" aria-label="Abandon this game">${ABANDON==='codenames'?'Tap again to abandon':'🗑'}</button></div>`
      :`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="cnstart" data-k="1">🕵️ Play</button><button class="btn" style="flex:1" data-a="cnstart" data-k="0">Record a game</button></div>`}</div>`}
function cnSetup(){const X=CNX(),lock=S.started&&cnPlayOn(),seg=(a,opts,cur)=>`<div class="seg">${opts.map(([v,t])=>`<button data-a="${a}" data-k="${v}" aria-pressed="${String(cur)===String(v)}" ${lock?'disabled':''}>${t}</button>`).join('')}</div>`;
  const own=String(X.own||'').split(/[\n,]+/).map(w=>w.trim()).filter(Boolean);
  return `<div class="bar"><h1>Codenames</h1></div><img class="hero hfhero" src="art/codenames-banner.jpg" alt="" width="1200" height="560" onerror="this.remove()">${steps(1)}
  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${cnPlayOn()?'🕵️ Playing on the phones':'Recording a real game'}</b></div>`:seg('cnplaymode',[[1,'🕵️ Play on the phones'],[0,'Record a real game']],X.play?1:0)}</div>
  <p class="hint">${X.play?'Link everyone’s phone. The 25 words show on every screen, each spymaster’s phone shows the secret key, and each team talks and votes in its own team chat before a word is revealed.':'Play with the real box, then record the teams, the spymasters and who won.'}</p></div>
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Words</h3></div><div class="panel hfpanel">${seg('cnwords',[['std','Standard'],['kid','🧒 Kids (easier words)']],X.words)}
    <label class="rlab" for="cnown" style="display:block;margin-top:10px">Family words (optional): add your own, separated by commas or new lines</label>
    <textarea id="cnown" class="cnown" data-cnown="1" rows="3" placeholder="Grandma, Lake Powell, Pickleball…" ${lock?'disabled':''}>${esc(X.own||'')}</textarea>
    ${own.length>=25?`<div class="srow"><span class="rlab">Use only our family words (${own.length})</span><button class="sw" role="switch" aria-checked="${!!X.ownOnly}" data-a="cnownonly" aria-label="Use only our family words" ${lock?'disabled':''}><i></i></button></div>`:''}</div>
  <p class="hint">${X.words==='kid'?`Kids list: ${CNW_KID.length} simple words.`:`Standard list: ${CNW_STD.length} words.`}${own.length?` Plus ${own.length} family word${own.length===1?'':'s'}${X.ownOnly&&own.length>=25?' (only these)':''}.`:''} These are Final Tally’s own lists, not the words from the box.</p></div>`:''}
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Match</h3></div><div class="panel hfpanel">${seg('cnmatch',[[1,'One game'],[3,'Best of 3'],[5,'Best of 5'],[0,'♾️ Keep playing']],X.match)}</div>
  <p class="hint">${+X.match===1?'Official rules: one game.':+X.match===0?'Play game after game. After each one, everybody votes “Another game” or “We’re done”; when more than half say done, the team with more wins takes the match.':`The first team to win ${(+X.match+1)/2} games takes the match.`}${+X.match!==1?' Between games the teams stay the same, the spymaster job moves to the next teammate, and you can change anything on the team screen.':''}</p></div>`:''}
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Sand timer</h3></div><div class="panel hfpanel">${seg('cntimer',[[0,'Off'],[60,'1 min'],[120,'2 min'],[180,'3 min']],X.timer)}</div>
  <p class="hint">${+X.timer?'When a team is taking too long, anyone taps ⏳ to flip the timer. When it runs out, the guessers’ turn ends, or the spymaster must give a clue right away.':'Optional, like the sand timer in the box: anyone can flip it when a team is taking too long.'}</p></div>`:''}
  <p class="hint">${usualUI('codenames')}</p>
  <div class="actions"><div class="in"><button class="btn primary" data-a="go" data-s="players">Players ›</button></div></div>`}
function cnScoreScr(){if(cnPlayOn()&&S.started&&!S.demo)return cnPlayUI();return cnScoreSheet()}

/* ---------- record a real game ---------- */
function cnScoreSheet(){const P=act(),R=S.cnrec||(S.cnrec={});
  return `<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1>Codenames</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>
  <div class="sec"><div class="sec-h"><h3>Who won?</h3></div><div class="panel hfpanel"><div class="seg">${[['r','🔴 Red'],['b','🔵 Blue']].map(([v,t])=>`<button data-a="cnrecwin" data-k="${v}" aria-pressed="${R.win===v}">${t}</button>`).join('')}</div>
  <div class="seg">${[['agents','Found all their agents'],['assassin','Other team hit the assassin']].map(([v,t])=>`<button data-a="cnrecwhy" data-k="${v}" aria-pressed="${R.why===v}">${t}</button>`).join('')}</div></div></div>
  <p class="hint lv-hint hftip">Put each player on a team and mark the spymasters.</p>
  <div class="nxlist">${P.map((p,i)=>{const D=cnP(p);return `<div class="nxcard" style="${pc(p.color)}"><div class="nxh"><b>${esc(nm(p))}</b><span class="num nxpts">${D.tm&&R.win?(D.tm===R.win?'🏆 Won':'Lost'):''}</span></div>
    <div class="seg">${[['r','🔴 Red'],['b','🔵 Blue']].map(([v,t])=>`<button data-a="cnrectm" data-k="${i}:${v}" aria-pressed="${D.tm===v}">${t}</button>`).join('')}</div>
    <div class="srow"><span class="rlab">Spymaster</span><button class="sw" role="switch" aria-checked="${!!D.spy}" data-a="cnrecspy" data-k="${i}" aria-label="${esc(nm(p))}: spymaster"><i></i></button></div></div>`}).join('')}</div>
  <div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; reveal</button></div></div>`}
function cnRecWin(){const R=S.cnrec||{};act().forEach(p=>{const D=cnP(p);D.win=R.win&&D.tm===R.win?1:0})}
function cnRefresh(){}
function cnChecks(){if(cnPlayOn()&&S.cng)return [];const R=S.cnrec||{},o=[];if(!R.win)o.push('No winning team chosen.');if(act().some(p=>!cnP(p).tm))o.push('Not everyone is on a team.');return o}
function cnResults(){const R=S.cnrec||{},P=act().slice().sort((a,b)=>cnTot(b)-cnTot(a)||(cnP(b).spy-cnP(a).spy));
  return `<div class="bar"><button class="back" data-a="go" data-s="score">‹ ${cnPlayOn()?'Game':'Record'}</button><h1>Results</h1></div>
  ${R.wins&&R.fmt!==1?`<p class="rlab cnresw">${R.win?`${CNTE[R.win]} <b>${CNT[R.win]} wins the match</b>`:'<b>A tie</b>'} · ${CNTE.r} ${R.wins.r} – ${R.wins.b} ${CNTE.b} over ${R.wins.r+R.wins.b} game${R.wins.r+R.wins.b===1?'':'s'}</p>`:R.win?`<p class="rlab cnresw">${CNTE[R.win]} <b>${CNT[R.win]} team wins</b>${R.why==='assassin'?' · the other team found the assassin':R.why==='agents'?' · found all their agents':''}</p>`:''}
  <div class="podium">${P.map(p=>{const D=p.cn||{};return `<div class="res ${D.win?'win':''}" style="${pc(p.color)}"><div class="rtop"><span class="rank num">${D.win?'🏆':'✗'}</span><span class="rname">${esc(nm(p))}</span><span class="rtot">${D.tm?CNTE[D.tm]+' '+CNT[D.tm]:''}</span></div>
    <p class="rlab">${D.spy?'🕵️ Spymaster':'Guesser'}${R.wins&&R.fmt!==1?` · won ${D.gw||0} game${D.gw===1?'':'s'}`:''}</p></div>`}).join('')}</div>
  ${awardsHtml()}${photoBlock()}
  <div class="actions"><div class="in"><button class="btn primary" data-a="rematch">Rematch, same players</button></div></div>`}
function cnAwards(){const P=act(),out=[];const sp=P.filter(p=>(p.cn||{}).spy&&(p.cn||{}).win);if(sp.length)out.push({title:'Master spy',ps:sp,why:'gave the winning clues'});
  const g=S.cng;if(g&&g.hist){let best=null;g.hist.forEach(h=>{const ok=(h.res||[]).filter(r=>r.c===h.tm).length;if(ok>=3&&(!best||ok>best.ok))best={ok,h}});if(best){const p=P.find(q=>q.id===g.spy[best.h.tm]);if(p)out.push({title:'Big clue',ps:[p],why:`${best.h.w} found ${best.ok} agents`})}}
  return out}
function cnHistory(pid){const p=act().find(q=>q.id===pid);if(!p)return '';const D=p.cn||{};
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet phsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1" style="${pc(p.color)}"><div class="rs-top"><div><h2 id="lp-h">${esc(nm(p))}</h2><small class="lp-sub">${D.win?'Won':'Lost'}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
    <div class="rs-body"><ul class="phlist hfhist"><li><span><b>Team</b></span><span class="hfh-v">${D.tm?CNT[D.tm]:'·'}</span></li><li><span><b>Role</b></span><span class="hfh-v">${D.spy?'Spymaster':'Guesser'}</span></li></ul></div></div></div>`}
function cnRevSteps(){return [{name:'Team result',f:p=>cnTot(p)}]}
function cnGuide(){return guideSheet('Codenames',[
  ['Setup',[['Teams','Two teams, Red and Blue. Each team has one spymaster; everyone else guesses.'],['The board','25 words. The secret key says which are Red agents, Blue agents, innocent bystanders, and the one assassin. The team that goes first has 9 agents, the other 8.'],['Who sees what','Only the spymasters see the key, on their own phones.']]],
  ['A turn',[['The clue','The spymaster gives one word and a number: how many words on the board it points to. The clue can’t be a word still showing on the board.'],['Guessing','The guessers talk it over in their team chat and vote. When everyone on the team picks the same word, any of them can confirm it.'],['How many','You must guess at least once. You can keep going up to one more than the number, or vote to stop. With 0 or ∞ there’s no limit.'],['Wrong word','A bystander or the other team’s agent ends your turn. The assassin loses the game for your team.']]],
  ['Winning',[['First to finish','The first team to have all its agents found wins, even if the other team reveals your last one.'],['The rule card','The rule card in the box has the full rules, including what counts as a valid clue.']]]])}
function cnStats(p){const g=S.cng;if(g&&cnPlayOn()&&S.started&&!S.finished&&g.tm&&g.tm[p.id]){const t=g.tm[p.id];return [{k:'Team',v:CNTE[t]+' '+CNT[t],i:'🕵️'},{k:'Role',v:g.spy[t]===p.id?'Spymaster':'Guesser'},{k:'Agents left',v:String(cnLeft(g,t))}]}
  const D=p.cn||{};return [{k:'Result',v:D.win?'Won':'Lost',i:'🕵️'},{k:'Team',v:D.tm?CNT[D.tm]:'·'},{k:'Role',v:D.spy?'Spymaster':'Guesser'}]}

/* ---------- the play screen ---------- */
let CNBIG=(()=>{try{return localStorage.getItem('ft-cnbig')==='1'}catch(e){return false}})(),CNMEANT=[],CNPEEK=false,CNPICK=null,CNNUM=1,CNERR='',CNPANEL=true,CNREAD=0,CNFLASH='';
function cnViewer(){if(!cnLinked())return null;return act().find(p=>p.id===S.lk.me)||null}
function cnRole(g,V){if(!g||!V)return {};const t=g.tm[V.id];return {t,spy:g.spy[t]===V.id,op:!!t&&g.spy[t]!==V.id}}
function cnActor(g){if(!g||g.phase==='done'||g.phase==='teams')return null;if(g.phase==='clue')return g.spy[g.turn];const O=cnOps(g,g.turn);return O.find(p=>g.votes[p]===undefined)||O[0]||null}
const cnName=pid=>{const p=act().find(q=>q.id===pid);return p?nm(p):'?'};
const cnBig=()=>CNBIG||cnLinked()&&!cnViewer();
const cnSeesKey=(g,V)=>g.phase==='done'||!cnBig()&&(cnLinked()?!!(V&&cnRole(g,V).spy):CNPEEK);
function cnTile(g,i,V,R){const w=g.words[i],r=g.rev[i],c=g.key[i],key=cnSeesKey(g,V),me=R.op&&g.turn===R.t&&g.phase==='guess';
  const voters=R.t&&g.turn===R.t?cnOps(g,R.t).filter(p=>g.votes[p]===i):[];
  const mi=!r&&g.phase==='clue'&&CNMEANT.includes(i)&&cnMeanMode(g,V,R);
  const cls=['cnt',r?'rev k-'+c:key?'key k-'+c:'',me&&!r||cnMeanMode(g,V,R)&&!r&&c===g.turn?'tap':'',mi?'meant':'',V&&g.votes[V.id]===i?'myvote':'',CNFLASH===String(i)?'flash':''].filter(Boolean).join(' ');
  const lab=r?`${w}: ${c==='x'?'assassin':c==='n'?'bystander':CNT[c]+' agent'}`:key?`${w} (${c==='x'?'assassin':c==='n'?'bystander':CNT[c]})`:w;
  return `<button class="${cls}" data-a="cnutap" data-k="${i}" aria-label="${esc(lab)}" ${r?'aria-disabled="true"':''}>${r?`<span class="cnface">${c==='x'?cnIm('cn-assassin','assassin'):c==='n'?cnIm('cn-bystander','bystander'):cnIm(cnTI('cn-agent',c),'agent')}</span>`:''}<span class="cnw">${esc(w)}</span>${key&&!r&&c==='x'?'<span class="cnx" aria-hidden="true">☠️</span>':''}${voters.length?`<span class="cnvotes">${voters.map(p=>{const q=act().find(x=>x.id===p);return `<i style="${q?pc(q.color):''}" title="${esc(cnName(p))}">${esc((q?nm(q):'?').slice(0,1))}</i>`}).join('')}</span>`:''}</button>`}
/* the spymaster giving a clue can tap their own team's words to mark what they mean */
const cnMeanMode=(g,V,R)=>g.phase==='clue'&&!cnBig()&&(cnLinked()?!!(R&&R.spy&&g.turn===R.t):CNPEEK);
function cnTeamsUI(g){const why=cnTeamsWhy(g),col=t=>`<div class="cnteam t-${t}"><h3>${CNTE[t]} ${CNT[t]}</h3>${!g.spy[t]?`<p class="rlab cnpick">Choose your spymaster${g.lastSpy&&g.lastSpy[t]?` (last game: ${esc(cnName(g.lastSpy[t]))})`:''}.</p>${g.ps.filter(p=>g.tm[p]===t).length>1?`<button class="btn sm" data-a="cnuspyrand" data-k="${t}">🎲 Pick for us</button>`:''}`:''}${g.ps.filter(p=>g.tm[p]===t).map(p=>{const q=act().find(x=>x.id===p);return `<div class="cnmem" style="${q?pc(q.color):''}"><b>${esc(cnName(p))}</b>${g.spy[t]===p?'<span class="cnrole">🕵️ Spymaster</span>':`${(g.cap||{})[t]===p?'<span class="cnrole">⭐ Captain</span>':`<button class="btn sm" data-a="cnucap" data-k="${p}">⭐ Captain</button>`}<button class="btn sm" data-a="cnuspy" data-k="${p}">🕵️ Spymaster</button>`}<button class="btn sm" data-a="cnuteam" data-k="${p}:${cnOther(t)}" aria-label="Move ${esc(cnName(p))} to ${CNT[cnOther(t)]}">→ ${CNTE[cnOther(t)]}</button></div>`}).join('')||'<p class="rlab">Nobody yet.</p>'}</div>`;
  return `<div class="panel cnteams">${g.pickSpy?'<p class="rlab"><b>Rematch:</b> same teams. Each team chooses its spymaster by tapping 🕵️ Spymaster next to a name.</p>':''}<p class="rlab">Pick teams. Each team needs a spymaster and at least one guesser. The ⭐ captain can push the team’s vote through if someone forgets to vote. ${CNTE[g.start]} <b>${CNT[g.start]}</b> goes first (9 agents to find; the other team has 8).</p><div class="cncols">${col('r')}${col('b')}</div>
    <div class="cnrow"><button class="btn" data-a="cnushuffle">🔀 Shuffle teams</button><button class="btn primary" data-a="cnubegin" ${why?'disabled':''}>Start</button></div>${why?`<p class="rlab">${esc(why)}</p>`:''}${!cnLinked()?'<p class="hint">Tip: link everyone’s phone so each spymaster can see the key privately.</p>':''}</div>`}
function cnTimerHtml(g){if(!g.timer||!['clue','guess'].includes(g.phase))return '';const T=g.tmr;
  if(T&&T.out)return `<span class="cntmr out" role="status">⌛ Time’s up! ${CNTE[g.turn]} spymaster, give your clue now.</span>`;
  if(T)return `<span class="cntmr run" data-end="${T.end}" role="timer">⏳ <b class="num">${cnClock(T.end-Date.now())}</b></span>`;
  return `<button class="btn sm cntmrbtn" data-a="cnutimer">⏳ Flip the timer (${g.timer/60} min)</button>`}
const cnClock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function cnClueLine(g){if(g.phase==='done'||g.phase==='teams')return '';const tm=cnTimerHtml(g),out=g.lastOut&&Date.now()-g.lastOut.at<8000&&g.lastOut.tm!==g.turn?`<span class="rlab">⌛ Time ran out for ${CNT[g.lastOut.tm]}.</span>`:'';
  if(g.phase==='clue')return `<div class="cnclue t-${g.turn}"><span>${CNTE[g.turn]} <b>${esc(cnName(g.spy[g.turn]))}</b> is thinking of a clue…</span>${out}${tm}</div>`;
  const n=g.clue.n,left=n>0?n+1-g.guesses:null;return `<div class="cnclue t-${g.turn}"><span class="cncw">${CNTE[g.turn]} <b>${esc(g.clue.w)}</b> · <b class="num">${n<0?'∞':n}</b></span><span class="rlab">${left!=null?`${left} guess${left===1?'':'es'} left`:'No limit'}${g.guesses?` · ${g.guesses} so far`:''}</span>${tm}</div>`}
/* after the game: what each clue meant */
function cnMeantUI(g){const H=g.hist.filter(h=>(h.meant||[]).length);if(!H.length)return '';
  return `<div class="panel cnmeant"><h3>🕵️ What the spymasters meant</h3><ul>${H.map(h=>`<li class="t-${h.tm}"><b>${CNTE[h.tm]} ${esc(h.w)} · ${h.n<0?'∞':h.n}</b><span>${h.meant.map(i=>{const got=g.rev[i]===h.tm&&(h.res||[]).some(r=>r.i===i),later=g.rev[i]&&!got;return `<span class="cnh k-${g.key[i]} ${got?'got':later?'later':'miss'}" title="${got?'found with this clue':later?'found later':'never found'}">${got?'✅':later?'☑️':'⬜'} ${esc(g.words[i])}</span>`}).join(' ')}</span></li>`).join('')}</ul><p class="rlab">✅ found with that clue · ☑️ found later · ⬜ never found</p></div>`}

function cnHistUI(g){if(!g.hist.length)return '';const row=h=>`<li class="t-${h.tm}"><b>${CNTE[h.tm]} ${esc(h.w)} · ${h.n<0?'∞':h.n}</b><span>${(h.res||[]).map(r=>`<span class="cnh k-${r.c}">${esc(g.words[r.i])}</span>`).join(' ')||'<span class="rlab">…</span>'}</span></li>`;
  return `<details class="cnhist"${g.phase==='done'?' open':''}><summary>Clues so far (${g.hist.length})</summary><ul>${g.hist.slice().reverse().map(row).join('')}</ul></details>`}
function cnMatchLine(g){const M=g.match;if(!M||M.fmt===1)return '';return `<p class="rlab cnmatch">${CNFMT[M.fmt]} · game ${M.no} · ${CNTE.r} <b class="num">${M.wins.r}</b> – <b class="num">${M.wins.b}</b> ${CNTE.b}</p>`}
function cnDoneUI(g){const M=g.match||{fmt:1,over:true},mw=cnMatchWin(g),V=cnViewer();
  let next='';
  if(!M.over){if(M.fmt===0){const c=v=>Object.values(M.votes).filter(x=>x===v).length,mine=V?M.votes[V.id]:null;
      next=g.solo?`<div class="cnrow"><button class="btn primary" data-a="cnumvote" data-k="more">▶️ Another game</button><button class="btn" data-a="cnumvote" data-k="done">🏁 We’re done</button></div>`:`<p class="rlab">Another game? When more than half of you agree, it happens.</p><div class="cnrow"><button class="btn${mine==='more'?' primary':''}" data-a="cnumvote" data-k="more">▶️ Another game · ${c('more')}</button><button class="btn${mine==='done'?' primary':''}" data-a="cnumvote" data-k="done">🏁 We’re done · ${c('done')}</button></div><p class="rlab">${g.ps.filter(p=>M.votes[p]).map(p=>esc(cnName(p))+(M.votes[p]==='done'?' 🏁':' ▶️')).join(' · ')||'No votes yet.'}</p>`}
    else next=`<p class="rlab">First to ${cnNeed(M)} wins the match.</p><div class="actions"><div class="in"><button class="btn primary" data-a="cnunext">▶️ Next game</button></div></div>`}
  const head=M.over&&M.fmt!==1?(mw?`${CNTE[mw]} ${CNT[mw]} wins the match ${Math.max(M.wins.r,M.wins.b)}–${Math.min(M.wins.r,M.wins.b)}!`:`It’s a tie, ${M.wins.r}–${M.wins.b}!`):`${CNTE[g.win]} ${CNT[g.win]} team wins!`;
  return `<div class="panel cndone t-${M.over&&M.fmt!==1?mw||'n':g.win}">${cnIm(cnTI('cn-win',M.over&&M.fmt!==1?mw||g.win:g.win),'','cnwinimg')}<h2>${head}</h2><p>${M.fmt!==1&&M.over?`Last game: ${CNT[g.win]} won. `:''}${g.why==='assassin'?`${CNT[cnOther(g.win)]} found the assassin.`:`${CNT[g.win]} found all ${g.win===g.start?9:8} agents.`}</p>${cnMatchLine(g)}<p class="rlab">The whole key is showing now.</p>${cnMeantUI(g)}${M.over?`<div class="actions"><div class="in"><button class="btn primary" data-a="finish">See results</button></div></div>`:next}</div>`}

function cnPlayUI(){const g=cnGg(),P=act();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Codenames">${g&&g.phase==='done'?'🏁':'🕵️'}</h1>${S.cng&&S.cng.phase!=='teams'?`<button class="btn sm undo" data-a="cnubig" aria-pressed="${cnBig()}" aria-label="Big board for a TV or iPad">📺${cnBig()?' Exit':''}</button>`:''}<button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  document.documentElement.classList.toggle('cnbig',cnBig()&&!!S.cng&&S.cng.phase!=='teams');
  if(P.some(p=>p.bot))return out+`<div class="panel" style="padding:16px"><p>Codenames has no computer players. Go back to Players and turn the computer seats into people.</p></div>`;
  if(!g||cnStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(cnRes2()?'Shuffling the agents…':'Waiting for the host phone…')}</div>`;
  const V=cnViewer(),R=cnRole(g,V);
  out+=`<div class="cnscore">${['r','b'].map(t=>`<div class="cnsc t-${t}${g.turn===t&&g.phase!=='done'&&g.phase!=='teams'?' on':''}"><span>${CNTE[t]} ${CNT[t]}</span><b class="num">${cnLeft(g,t)}</b><small>left</small></div>`).join('')}</div>`;
  if(g.phase!=='done')out+=cnMatchLine(g);
  if(V&&R.t&&g.phase!=='teams'&&!cnBig())out+=`<p class="rlab cnme">You’re ${R.spy?'the 🕵️ spymaster':'a guesser'} for ${CNTE[R.t]} ${CNT[R.t]}${g.phase!=='done'?(g.turn===R.t?(g.phase==='clue'?(R.spy?' · give your clue below':' · waiting for your clue'):(R.op?' · talk it over and vote below':' · your team is guessing')):' · the other team’s turn'):''}.</p>`;
  if(g.phase==='teams')out+=cnTeamsUI(g);
  out+=cnClueLine(g);
  if(g.phase==='done')out+=cnDoneUI(g);
  out+=`<div class="cngrid${cnSeesKey(g,V)&&g.phase!=='done'?' spyview':''}" role="grid" aria-label="The board">${g.words.map((w,i)=>cnTile(g,i,V,R)).join('')}</div>`;
  if(!cnLinked()&&g.phase!=='done'&&g.phase!=='teams')out+=`<div class="cnrow"><button class="btn${CNPEEK?' primary':''}" data-a="cnupeek">${CNPEEK?'🙈 Hide the key':'👁 Spymasters: show the key'}</button></div>`;
  out+=cnHistUI(g);
  if(CNPICK!=null&&!g.rev[CNPICK]&&g.phase==='guess')out+=`<div class="sheet-bg" data-a="cnupickno"><div class="sheet cnpick" role="dialog" aria-modal="true" aria-labelledby="cnp-h" data-stop="1"><h2 id="cnp-h">Reveal ${esc(g.words[CNPICK])}?</h2><div class="sheet-btns"><button class="btn" data-a="cnupickno">Not yet</button><button class="btn primary" data-a="cnupick" data-k="${CNPICK}">Reveal</button></div></div></div>`;
  return out}

/* ---------- moves from the screen ---------- */
function cnUiAct(a,b,k){const g=cnGg();if(!g)return;const V=cnViewer(),R=cnRole(g,V),me=V?V.id:(g.phase==='clue'?g.spy[g.turn]:cnOps(g,g.turn)[0]||g.ps[0]);
  const mv=m=>{const r=lkq('cnMove',me,m);if(r)vibe(8);return r};
  switch(a){
    case 'cnuteam':{const [p,t]=String(k).split(':');mv({a:'team',who:p,tm:t});return}
    case 'cnuspy':mv({a:'spy',who:k});return;
    case 'cnushuffle':mv({a:'shuffle'});return;
    case 'cnubegin':mv({a:'begin'});return;
    case 'cnupeek':CNPEEK=!CNPEEK;return;
    case 'cnupickno':CNPICK=null;return;
    case 'cnupick':CNPICK=null;mv({a:'pick',i:+k});return;
    case 'cnutap':{const i=+k;if(cnBig())return;if(cnMeanMode(g,V,R)&&!g.rev[i]){if(g.key[i]!==g.turn){toast('Only your own team’s words can be marked.');return}CNMEANT=CNMEANT.includes(i)?CNMEANT.filter(x=>x!==i):[...CNMEANT,i];vibe(6);return}
      if(g.phase!=='guess'||g.rev[i])return;
      if(!cnLinked()){CNPICK=i;return}
      if(!R.op||g.turn!==R.t){toast(R.spy?'Spymasters don’t guess. Your team taps the words.':'It’s the other team’s turn.');return}
      mv({a:'vote',i:g.votes[V.id]===i?null:i});return}
    case 'cnuend':{if(!cnLinked()){mv({a:'stop'});return}mv({a:'vote',i:g.votes[V&&V.id]==='end'?null:'end'});return}
    case 'cnuconfirm':mv({a:'confirm'});return;
    case 'cnunum':CNNUM=+k;return;
    case 'cnupanel':CNPANEL=!CNPANEL;return;
    case 'cnuq':cnChatSend(k);return;
    case 'cnutimer':mv({a:'timer'});return;
    case 'cnubig':CNBIG=!cnBig();try{localStorage.setItem('ft-cnbig',CNBIG?'1':'0')}catch(e){}return;
    case 'cnunext':mv({a:'next'});return;
    case 'cnucap':mv({a:'cap',who:k});return;
    case 'cnuspyrand':mv({a:'spyrand',tm:k});return;
    case 'cnupush':mv({a:'push'});return;
    case 'cnunudge':mv({a:'nudge'});return;
    case 'cnumvote':mv({a:'mvote',v:k});return}}
function cnTick(){if(!cnPlayOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!cnRes2())return;if(lkqRun()){save();render();return}
  if(act().some(p=>p.bot))return;
  const g=cnGg();if(!g||cnStale(g)){const X=CNX();const prev=g&&!cnStale(g)?null:(X.last||null);S.cng=cnDeal({words:X.words,own:X.own,ownOnly:X.ownOnly,match:X.match,timer:X.timer,solo:!cnLinked(),prev})||S.cng;save();render();return}
  /* one device or linked phones: phones can link after the board is dealt */
  if(g.solo!==!cnLinked()){g.solo=!cnLinked();save();render()}
  if(g.phase!=='teams'&&g.phase!=='done'){const X=CNX(),L={tm:g.tm,spy:g.spy,cap:g.cap};if(JSON.stringify(X.last||{})!==JSON.stringify(L)){X.last=L;cnKeep()}}}
function cnSyncScorer(g){if(!g)return;const M=g.match,mw=cnMatchWin(g);S.cnrec={win:mw,why:M&&M.fmt!==1?'match':g.why,fmt:M?M.fmt:1,wins:M?{...M.wins}:null,games:M?M.no:1};act().forEach(p=>{const t=g.tm[p.id];p.cn={tm:t||'',spy:g.spy[t]===p.id?1:0,win:mw&&t===mw?1:0,gw:M?(M.pw[p.id]||0):0}});S.hr=1}

/* ---------- team panel: its own layer, so redraws never wipe what you're typing ---------- */
function cnChatAll(g){const C=S.cnchat||{},out=[];for(const pid in C)(Array.isArray(C[pid])?C[pid]:[]).forEach(x=>{if(x&&x.m&&x.gid===g.gid)out.push({...x,pid})});return out}
function cnChatSend(t){const g=cnGg(),V=cnViewer();if(!g||!V)return false;const R=cnRole(g,V);if(!R.t)return false;
  if(R.spy&&g.turn===R.t&&g.phase==='guess'){toast('Spymasters can’t chat while their team is guessing.');return false}
  t=String(t||'').replace(/\s+/g,' ').trim().slice(0,200);if(!t)return false;const me=V.id,mine=((S.cnchat||{})[me]||[]).filter(x=>x.gid===g.gid).slice(-29);
  mine.push({k:Date.now().toString(36)+Math.random().toString(36).slice(2,5),t:Date.now(),m:t,tm:R.t,gid:g.gid});S.cnchat={...(S.cnchat||{}),[me]:mine};CNREAD=Date.now();vibe(10);save();render();return true}
/* the team's timeline: chat plus the team's clues and reveals */
function cnFeed(g,t){const L=cnChatAll(g).filter(x=>x.tm===t).map(x=>({...x,kind:'msg'}));
  g.hist.forEach(h=>{if(h.tm!==t)return;L.push({kind:'clue',t:h.t||0,h});(h.res||[]).forEach(r=>L.push({kind:'rev',t:r.t||0,r,tm:h.tm}))});
  return L.sort((a,b)=>a.t-b.t).slice(-60)}
function cnFeedHtml(g,t,me){const L=cnFeed(g,t);if(!L.length)return '<p class="chempty">Your team’s chat. Talk it over here; the other team can’t see it.</p>';
  return L.map(x=>{if(x.kind==='clue')return `<div class="cnsys">🕵️ Clue: <b>${esc(x.h.w)} · ${x.h.n<0?'∞':x.h.n}</b></div>`;
    if(x.kind==='rev'){const c=x.r.c;return `<div class="cnsys k-${c}">${esc(g.words[x.r.i])}: ${c==='x'?'☠️ the assassin':c==='n'?'🧍 a bystander':c===t?'✅ one of ours':'❌ one of theirs'}</div>`}
    const p=act().find(q=>q.id===x.pid),mine=x.pid===me;return `<div class="chmsg${mine?' mine':''}" style="${p?pc(p.color):''}">${mine?'':`<b>${esc(p?nm(p):'?')}${g.spy[t]===x.pid?' 🕵️':''}</b>`}<span>${esc(x.m)}</span><small>${new Date(x.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</small></div>`}).join('')}
const CNQ=['👍 Agree','🤔 Not sure','Which one?','🛑 Let’s stop','Go for it!'];
function cnVoteHtml(g,V,R){if(g.phase!=='guess'||!R.t||g.turn!==R.t)return '';const O=cnOps(g,R.t),agree=cnAgree(g),mine=V?g.votes[V.id]:undefined,cap=(g.cap||{})[R.t];
  const lab=v=>v==='end'?'🛑 stop':v===undefined||v===null?'…':esc(g.words[v]);
  const rows=O.map(p=>{const q=act().find(x=>x.id===p);return `<span class="cnv" style="${q?pc(q.color):''}"><b>${p===cap?'⭐':''}${esc(cnName(p))}</b> ${lab(g.votes[p])}</span>`}).join('');
  const can=R.op&&agree!==null,push=!can&&V&&V.id===cap?cnPushable(g):null,missing=O.filter(p=>g.votes[p]===undefined||g.votes[p]===null),others=missing.filter(p=>!V||p!==V.id);
  const nudgeOK=R.op&&others.length&&!(g.nudge&&Date.now()-g.nudge.at<10000&&g.nudge.by===(V&&V.id));
  return `<div class="cnvotebar"><div class="cnvs">${rows}</div>${R.op?`<div class="cnvbtns">${cnCanEnd(g)?`<button class="btn${mine==='end'?' primary':''}" data-a="cnuend" aria-label="Vote to stop guessing">🛑 Stop</button>`:''}${push!==null?`<button class="btn primary cnconfirm" data-a="cnupush">⭐ ${push==='end'?'Stop guessing':'Reveal '+esc(g.words[push])}</button>`:`<button class="btn primary cnconfirm" data-a="cnuconfirm" ${can?'':'disabled'}>${can?(agree==='end'?'✓ Stop guessing':`✓ Reveal ${esc(g.words[agree])}`):'✓ Confirm'}</button>`}</div>
    <div class="cnvhint"><span class="rlab">${mine===undefined?'Tap a word on the board to vote.':can?'Everyone agrees.':push!==null?`You’re captain: push it through without waiting for ${others.map(p=>esc(cnName(p))).join(', ')||'everyone'}.`:O.length>1?`Waiting for ${missing.map(p=>esc(cnName(p))).join(', ')||'everyone to pick the same word'}.`:''}</span>${others.length&&R.op?`<button class="btn sm cnnudge" data-a="cnunudge" ${nudgeOK?'':'disabled'}>🔔 Nudge</button>`:''}</div>`:'<p class="rlab cnvhint">Your team is voting.</p>'}</div>`}

function cnPanelMode(g,V,R){if(!g||g.phase==='teams'&&!cnLinked()||cnBig())return '';
  if(!cnLinked())return g.phase==='clue'?'clue':g.phase==='guess'?'solo':'';
  if(!V||!R.t)return '';if(g.phase==='clue'&&R.spy&&g.turn===R.t)return 'clue';return 'chat'}
let CNNUDGE=null;
function cnNudgeFx(g,V){const n=g&&g.nudge;if(!n||!V)return;const key=g.gid+':'+n.k;if(CNNUDGE===null){CNNUDGE=Date.now()-n.at>15000?key:'';}if(CNNUDGE===key)return;CNNUDGE=key;if(n.to.includes(V.id)&&g.phase==='guess'){toast(`🔔 ${cnName(n.by)} is waiting for your vote. Tap a word on the board.`);vibe([60,60,60])}}
function cnFx(){let L=document.getElementById('cnfx');const g=S.game==='codenames'&&cnPlayOn()&&S.started&&!S.demo&&S.screen==='score'?cnGg():null;
  const V=g?cnViewer():null,R=g?cnRole(g,V):{};try{if(g)cnNudgeFx(g,V)}catch(e){}
  const mode=g&&!cnStale(g)&&!act().some(p=>p.bot)?cnPanelMode(g,V,R):'';
  if(mode!=='clue'&&CNMEANT.length&&!(g&&cnMeanMode(g,V,R)))CNMEANT=[];
  if(!mode){if(L)L.remove();document.documentElement.style.removeProperty('--cnpad');return}
  const sig=mode+(R.t||'')+(mode==='chat'&&!CNPANEL?'-min':'');
  if(!L||L.dataset.sig!==sig){if(L)L.remove();L=document.createElement('div');L.id='cnfx';L.className='cnlayer t-'+(R.t||g.turn);L.dataset.sig=sig;
    if(mode==='clue')L.innerHTML=`<div class="cnsheet" role="region" aria-label="Your clue"><div class="cntop"><h2>${cnIm(cnTI('cn-spymaster',g.turn),'','cnhimg')} Your clue for ${CNTE[g.turn]} ${CNT[g.turn]}</h2></div><form id="cnclueform" class="chform" autocomplete="off"><input id="cnclue" type="text" maxlength="30" placeholder="One word" aria-label="Clue word" autocapitalize="characters" enterkeyhint="done"></form><div class="cnnums" role="group" aria-label="How many words">${[0,1,2,3,4,5,6,7,8,9,-1].map(n=>`<button class="btn sm" data-a="cnunum" data-k="${n}">${n<0?'∞':n}</button>`).join('')}</div><p class="rlab cnmhint">Optional: tap the words you mean on the board. Only you see them now; everyone sees them after the game.</p><p class="cnerr rlab" role="alert"></p><div class="cnrow"><button class="btn primary" type="submit" form="cnclueform">Give clue</button></div></div>`;
    else if(mode==='solo')L.innerHTML=`<div class="cnsheet"><div class="cnrow"><span class="rlab cnsolo"></span><button class="btn" data-a="cnuend">🛑 Stop guessing</button></div></div>`;
    else L.innerHTML=`<div class="cnsheet${CNPANEL?'':' min'}" role="region" aria-label="Team chat"><div class="cntop"><h2>${cnIm(cnTI('cn-chat',R.t),'','cnhimg')} ${CNTE[R.t]} ${CNT[R.t]} team</h2><button class="btn sm" data-a="cnupanel" aria-expanded="${CNPANEL}">${CNPANEL?'▾ Hide':'▴ Show'}</button></div>${CNPANEL?`<div class="cnvote"></div><div class="chlist cnlist" aria-live="polite"></div><div class="chquick cnquick">${CNQ.map(q=>`<button class="btn sm" data-a="cnuq" data-k="${esc(q)}">${esc(q)}</button>`).join('')}</div><form class="chform" id="cnchatform" autocomplete="off"><input id="cnchatin" type="text" maxlength="200" placeholder="Message your team…" aria-label="Message your team" enterkeyhint="send"><button class="btn primary" type="submit">Send</button></form>`:'<div class="cnvote"></div>'}</div>`;
    document.body.appendChild(L)}
  if(mode==='clue'){const mh=L.querySelector('.cnmhint');if(mh)mh.textContent=CNMEANT.length?`You marked ${CNMEANT.length} word${CNMEANT.length===1?'':'s'} (${CNMEANT.map(i=>g.words[i]).join(', ')}). Only you see them now.`:'Optional: tap the words you mean on the board. Only you see them now; everyone sees them after the game.';L.querySelectorAll('[data-a="cnunum"]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.k===CNNUM)));L.querySelector('.cnerr').textContent=CNERR}
  if(mode==='solo'){const s=L.querySelector('.cnsolo');if(s)s.textContent=cnCanEnd(g)?'Tap a word to reveal it, or stop.':'Tap a word to reveal it.';const b=L.querySelector('[data-a="cnuend"]');if(b)b.disabled=!cnCanEnd(g)}
  if(mode==='chat'){const vb=L.querySelector('.cnvote'),vh=cnVoteHtml(g,V,R);if(vb&&vb.dataset.h!==vh){vb.innerHTML=vh;vb.dataset.h=vh}
    const box=L.querySelector('.cnlist');if(box){const html=cnFeedHtml(g,R.t,V.id);if(box.dataset.h!==html){const atEnd=box.scrollHeight-box.scrollTop-box.clientHeight<40||!box.dataset.h;box.innerHTML=html;box.dataset.h=html;if(atEnd)box.scrollTop=box.scrollHeight}CNREAD=Date.now()}
    const inp=L.querySelector('#cnchatin'),lock=R.spy&&g.turn===R.t&&g.phase==='guess';if(inp){inp.disabled=lock;inp.placeholder=lock?'Spymasters can’t chat while the team guesses':'Message your team…'}L.querySelectorAll('.cnquick button,#cnchatform button').forEach(b=>b.disabled=lock)
    const top=L.querySelector('.cntop h2');if(top&&!CNPANEL){const n=cnChatAll(g).filter(x=>x.tm===R.t&&x.pid!==V.id&&x.t>CNREAD).length;top.lastChild.textContent=` ${CNTE[R.t]} ${CNT[R.t]} team${n?` · ${n} new`:''}`}}
  document.documentElement.style.setProperty('--cnpad',(L.offsetHeight+12)+'px')}
document.addEventListener('submit',e=>{const f=e.target;if(!f)return;
  if(f.id==='cnchatform'){e.preventDefault();const i=document.getElementById('cnchatin');if(i&&cnChatSend(i.value))i.value='';return}
  if(f.id==='cnclueform'){e.preventDefault();const i=document.getElementById('cnclue'),g=cnGg();if(!i||!g)return;const bad=cnClueBad(g,i.value);if(bad){CNERR=bad;cnFx();return}
    CNERR='';const V=cnViewer(),me=V?V.id:g.spy[g.turn];if(lkq('cnMove',me,{a:'clue',w:i.value,n:CNNUM,meant:CNMEANT.filter(x=>!g.rev[x]&&g.key[x]===g.turn)})){i.value='';CNMEANT=[];vibe(12)}save();render()}});
/* the clue button sits outside the form's own submit flow on some phones: make it submit */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button[form="cnclueform"]');if(b){e.preventDefault();const f=document.getElementById('cnclueform');if(f)f.requestSubmit?f.requestSubmit():f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))}},true);
setInterval(()=>{try{cnFx()}catch(e){}},700);

/* timer: tick the countdown on screen, and the host ends the turn when it runs out */
let CNTOUT='';
setInterval(()=>{try{document.querySelectorAll('.cntmr.run[data-end]').forEach(el=>{const ms=+el.dataset.end-Date.now(),b=el.querySelector('b');if(b)b.textContent=cnClock(ms);el.classList.toggle('low',ms<10000)});
  const g=S.game==='codenames'&&cnPlayOn()&&S.started&&!S.demo?cnGg():null;if(!g)return;
  if(g.tmr&&!g.tmr.out&&Date.now()>=g.tmr.end&&CNTOUT!==g.gid+g.tmr.end){CNTOUT=g.gid+g.tmr.end;vibe([200,80,200]);toast('⌛ Time’s up!')}
  if(cnRes2()&&!LKOPTR&&cnTimerCheck(g,Date.now())){save();render()}}catch(e){}},500);
