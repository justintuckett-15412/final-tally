/* ================= Cover Your Kingdom: settings, record sheet, play screens (linked phones + computer players), the big board =================
   integrate.py wraps data.js, game.js, bots.js and this file in ONE function scope: Catan's Cities & Knights already has global ck… names
   (ckBot, ckGive, ckMove, ckGuide, ckUiAct, CKM, LKQF.ckMove …), so nothing here is global except the cyk… hooks exported at the end.
   State: S.ckg (the game, synced), settings S.ckx (CKDEF), records S.ckrec + p.ck. Screen actions: data-a="cku…" (letters only).
   Linked moves: lkq('cykMove',pid,mv) → the host checks and applies them (ckMoveQ). Only the host deals, runs bots (ckHostTick → ckTick). */
const CKDEF={play:1,two:1,cons:0,ls:0,pow:0,ext:'one',art:'creatures'};
const CKX=()=>{if(!S.ckx)S.ckx={...CKDEF};const X=S.ckx;for(const k in CKDEF)if(X[k]===undefined)X[k]=CKDEF[k];return X};
function ckSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(KEY+'.ckx'))}catch(e){}return Object.assign({...CKDEF},x||{})}
function ckSaveX(){if(S.demo)return;try{localStorage.setItem(KEY+'.ckx',JSON.stringify(CKX()))}catch(e){}}
const ckOn=()=>S.game==='coverkingdom'&&!!CKX().play;
const ckRes2=()=>!S.lk||S.demo||lkHost();
const ckLinked=()=>!!(S.lk&&!S.demo);
function ckFresh(){return {game:'coverkingdom',screen:'map',map:'coverkingdom',rules:{},started:false,active:0,picks:{},hr:0,ckx:ckSaved(),ckrec:{},players:CARC_COLORS.map((c,i)=>newPlayer('',c,i<4))}}
function ckMeta(){return {name:'Cover Your Kingdom',meta:'Card game · settle, recruit, cover your Kingdom',min:2,max:8,teams:false,colors:CARC_COLORS,lengths:[],pieces:0,piece:'',own:[],defaults:[],tb:[]}}
const ckP=p=>{if(!p.ck||!Array.isArray(p.ck.r))p.ck={...(p.ck||{}),r:[0,0,0]};return p.ck};
/* the game's own numbers while it's being played; afterwards the saved (or recorded) magic */
function ckTot(p){const g=S.ckg;if(ckOn()&&g&&g.tot&&S.started&&!S.finished&&g.ps&&g.ps.includes(p.id))return (g.tot[p.id]||0)+(g.phase==='play'?ckScore(g,p.id).total:0);
  return ((p.ck&&p.ck.r)||[]).reduce((a,b)=>a+(+b||0),0)}
const ckName=pid=>{const p=act().find(q=>q.id===pid);return p?nm(p):'someone'};
const ckPl=pid=>act().find(q=>q.id===pid)||null;
const ckPcol=pid=>{const p=ckPl(pid);return p?pc(p.color):''};
const ckMeep=(pid,cls)=>`<svg class="${cls||'cykmeep'}" viewBox="0 0 40 40" aria-hidden="true" style="${ckPcol(pid)}"><path d="${MGSHAPE_M}"/></svg>`;
const ckWho1=pid=>{const p=ckPl(pid);return `${p&&p.bot?botHead(p):''}${esc(ckName(pid))}`};

/* ---------- cards ---------- */
const CK_ART={yy:'yedi',pg:'pigxie',lc:'leprecon',sc:'sighclops',ve:'vulcent',pl:'peglegasus',he:'hentaur',uh:'uniquehorn',kl:'klaken',br:'bragon',ct:'ct',sp:'spydra',mt:'minnowtaur',hy:'hypnogriff',el:'elves',wz:'wizard',mb:'mobgoblins',back:'back'};
const CK_FAM={yy:'Tyler',pg:'Allee',lc:'Brad',sc:'Sarah',ve:'Tyler',pl:'Tara',he:'Matt',uh:'Stephanie',kl:'Stacey',br:'Justin',ct:'Jude, Natalie & Lewis',sp:'Susan',mt:'Dave',hy:'Susan',el:'Stephanie, Stacey, Tara & Allee',wz:'Buster',mb:'Justin & Tyler',back:'Susan & Dave'};
const CK_SHORT={yy:'Yogi Yedi',pg:'Pigxie',lc:'LepreCon',sc:'Sighclops',ve:'VulcEnt',pl:'PegLegasus',he:'Hentaur',uh:'UniqueHorn',kl:'Klaken',br:'Bragon',ct:'CT',sp:'Spydra',mt:'Minnowtaur',hy:'Hypnogriff',el:'Elves',wz:'Wiizzzaard',mb:'Mobgoblins'};
/* our own one-line summaries (the cards have the real wording) */
const CK_HSUM={mt:'Guard your land, or block a rival’s land for a turn',hy:'Take 3 random cards from a rival, give 3 back',el:'Banish a rival’s top Clan unless they sacrifice',wz:'Move a top Clan to the bottom, or the bottom one up',mb:'Swap one of your top Clans with a rival’s'};
const CK_PSUM={wkid:'Once a turn, free: swap one of your top Clans with the Clan under it.',dh:'At the end of your turn, free: discard up to 2 Clanning cards before you draw.',mm:'Once a turn, settle a Clan without using an action.',
  eq:'Hentaurs act as Wilds for PegLegasi and UniqueHorns in challenges (not to settle).',xf:'Your Wiizzzaards, Minnowtaurs and Hypnogriffs can do each other’s jobs.',swine:'Your Pigxies are worth 15 magic each at the end.',vh:'You hold one more card.',sub:'Your CTs count as two in challenges; a Spydra played against you counts as one.'};
const CK_LN={high:'Highland',low:'Lowland',mane:'Maneland'},CK_LI={high:'⛰️',low:'🌊',mane:'🐴'};
const ckFam=g=>(g&&g.art?g.art:CKX().art)==='family';
const ckImgSrc=(sp,fam)=>`art/${fam?'ckf':'ck'}-${CK_ART[sp]||'back'}.webp`;
const ckSpN=s=>CK_SHORT[s]||(CK_SPI[s]||{}).name||s;
/* the gem: its value and its land (Highland ⛰️ / Lowland 🌊 / Either / Maneland 🐴 in the Two Ruler game / Wild ✨) */
function ckGemKind(g,sp){const s=CK_SPI[sp];if(s.kind==='wild')return 'w';if(g&&g.o&&g.o.two)return s.land2==='mane'?'m':s.land2==='any'?'e':s.land2==='high'?'h':'l';return s.land==='either'?'e':s.land==='high'?'h':'l'}
const CK_GEML={h:['⛰️','Highland'],l:['🌊','Lowland'],e:['⛰️🌊','Either land'],m:['🐴','Maneland'],w:['✨','Wild']};
function ckGem(g,sp,cls){const s=CK_SPI[sp];if(s.kind==='hire')return '';const k=ckGemKind(g,sp),[ic,lab]=CK_GEML[k];
  return `<span class="cykgem g-${k}${cls?' '+cls:''}" title="${s.v} magic · ${lab}" aria-label="${s.v} magic, ${lab}"><b class="num">${s.v}</b><i>${ic}</i></span>`}
/* one card. o: {a, k, sel, dis, sz:'h'(hand)|'m'|'s', cls, attrs, n (count badge), sub (a line under the name)} */
function ckCard(g,sp,o={}){const s=CK_SPI[sp],fam=ckFam(g),sz=o.sz||'h',tag=o.a?'button':'div';
  const badge=s.kind==='wild'?'<span class="cykbadge w">Wild</span>':s.kind==='hire'?'<span class="cykbadge h">Hire</span>':'';
  return `<${tag} class="cykc sz-${sz}${o.sel?' sel':''}${o.dis?' dim':''}${o.cls?' '+o.cls:''}"${o.a?` data-a="${o.a}"${o.k!=null?` data-k="${o.k}"`:''} aria-pressed="${!!o.sel}"`:''}${o.attrs||''} aria-label="${esc(s.name)}${s.kind==='hire'?', for hire':`, ${s.v} magic`}${fam?', '+esc(CK_FAM[sp]):''}">
    <span class="cykart"><img src="${ckImgSrc(sp,fam)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${ckGem(g,sp)}${badge}${o.n>1?`<span class="cykn">×${o.n}</span>`:''}</span>
    <span class="cyknm">${esc(sz==='h'?s.name:ckSpN(sp))}</span>${fam?`<span class="cykfam">${esc(CK_FAM[sp])}</span>`:''}${s.kind==='hire'&&sz==='h'?`<span class="cyksum">${CK_HSUM[sp]}</span>`:''}${o.sub?`<span class="cyksub">${o.sub}</span>`:''}</${tag}>`}
/* a Clan in a Kingdom: its top Creature, how many cards, its magic (and any Wilds in it) */
function ckClanChip(g,pid,C,big){const s=CK_SPI[C.sp],wild=C.c.filter(id=>g.cs[id]!==C.sp).map(id=>ckSpN(g.cs[id]));
  return `<span class="cykclan${big?' big':''}"><span class="cykci"><img src="${ckImgSrc(C.sp,ckFam(g))}" alt="" loading="lazy">${ckGem(g,C.sp,'sm')}</span><span class="cykct"><b>${esc(ckSpN(C.sp))}${C.c.length>1?` <span class="num">×${C.c.length}</span>`:''}</b>${ckFam(g)?`<i>${esc(CK_FAM[C.sp])}</i>`:''}<small><b class="num">${ckClanVal(g,pid,C)}</b><span class="cykmw"> magic</span>${wild.length?' · '+esc(wild.join('+')):''}</small></span></span>`}
const ckBack=(g,n,cls)=>`<span class="cykback${cls?' '+cls:''}" aria-label="${n} card${n===1?'':'s'} in hand"><img src="${ckImgSrc('back',ckFam(g))}" alt="" loading="lazy"><b class="num">${n}</b></span>`;

/* ---------- home, setup ---------- */
function ckHomeCard(){const st=gamePeek('coverkingdom');
  return `<div class="game"><div class="gtop"><img class="gart" src="art/coverkingdom-icon.png" alt="" width="84" height="84" onerror="this.outerHTML='<div class=&quot;gart nxart&quot; aria-hidden=&quot;true&quot;>👑</div>'"><div><h2>Cover Your Kingdom</h2><div class="meta">Card game · settle, recruit, cover your Kingdom</div></div></div>
    ${st&&st.started&&!st.finished?`<div class="rlab">Game in progress${st.touched?` · last changed ${ago(st.touched)}`:''}</div><div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="gresume" data-k="coverkingdom">Resume game</button><button class="btn" data-a="gnew" data-k="coverkingdom">New game</button><button class="btn" data-a="gabandon" data-k="coverkingdom" aria-label="Abandon this game">${ABANDON==='coverkingdom'?'Tap again to abandon':'🗑'}</button></div>`
      :`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="ckstart" data-k="1">👑 Play</button><button class="btn" style="flex:1" data-a="ckstart" data-k="0">Score a game</button></div>`}</div>`}
const CKEXT={one:'One round',acc2:'2 rounds',acc3:'3 rounds',first2:'First to 2 wins'};
const CKEXTW={one:'Official: one round. Most magic wins; a tie goes to the most Creatures.',acc2:'Extended contest: play 2 rounds and add up the magic. Ties go to the most Creatures over both rounds.',acc3:'Extended contest: play 3 rounds and add up the magic. Ties go to the most Creatures over all rounds.',first2:'Extended contest: keep playing rounds until someone has won 2.'};
function ckSetup(){const X=CKX(),lock=S.started&&ckOn(),seg=(k,opts,cur)=>`<div class="seg">${opts.map(([v,t])=>`<button data-a="ckuopt" data-k="${k}:${v}" aria-pressed="${String(cur)===String(v)}" ${lock?'disabled':''}>${t}</button>`).join('')}</div>`;
  const sw=(k,lab)=>`<div class="srow"><span class="rlab">${lab}</span><button class="sw" role="switch" aria-checked="${!!X[k]}" data-a="ckuopt" data-k="${k}:${X[k]?0:1}" aria-label="${lab}" ${lock?'disabled':''}><i></i></button></div>`;
  const fam=X.art==='family',prev=['br','sp','ct','wz'];
  return `<div class="bar"><h1>Cover Your Kingdom</h1></div><img class="hero hfhero" src="art/coverkingdom-banner.jpg" alt="" width="1536" height="639" onerror="this.remove()">${steps(1)}
  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${ckOn()?'👑 Playing on the phones':'Scoring a real game'}</b></div>`:seg('play',[[1,'👑 Play on the phones'],[0,'Score a real game']],X.play?1:0)}</div>
  <p class="hint">${X.play?'Link everyone’s phone: each phone holds its own hand. Fill empty seats with computer players. A phone or iPad that joins as “Just watching” becomes the big board.':'Play with the real cards, then write down everyone’s magic for each round.'}</p></div>
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Two Rulers</h3></div><div class="panel hfpanel">${sw('two','Two Ruler rules when 2 play')}</div>
    <p class="hint">${X.two?'Official for 2 players: hands of 7, the Drafty Inn and the Maneland for the horses.':'House rule: 2 players use the regular rules.'} Only used with 2 players.</p></div>
  <div class="sec"><div class="sec-h"><h3>Constellation Prizes</h3></div><div class="panel hfpanel">${sw('cons','Constellation Prizes')}${X.cons?sw('ls','Light Speed'):''}</div>
    <p class="hint">${X.cons?`Advanced rule: light up a token for every kind of Clanning Creature that joins your Kingdom. A full Highland, Either or Lowland row and all ten earn bonus magic.${X.ls?' Light Speed: the first Ruler to light all ten (and anyone who catches up before their next turn) gets the big bonus again.':''}`:'Off: just the magic gems count (official basic game).'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Kingdom Powers</h3></div><div class="panel hfpanel">${seg('pow',[[0,'None'],[1,'1 each'],[2,'2 each']],X.pow)}</div>
    <p class="hint">${!+X.pow?'Off (official basic game).':+X.pow===1?'Advanced rule: everyone gets one Kingdom Power card.':'Advanced rule: everyone gets one action power and one rule power. Only with 2 or 3 Rulers; more Rulers get 1 each.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Extended contest</h3></div><div class="panel hfpanel">${seg('ext',Object.entries(CKEXT),X.ext)}</div>
    <p class="hint">${CKEXTW[X.ext]||CKEXTW.one}</p></div>
  <div class="sec"><div class="sec-h"><h3>Card art</h3></div><div class="panel hfpanel">${seg('art',[['creatures','🐉 Creatures'],['family','👪 Family deck']],X.art)}
    <div class="cykprev" aria-hidden="true">${prev.map(sp=>`<span class="cykpv"><img src="${ckImgSrc(sp,fam)}" alt=""><small>${fam?esc(CK_FAM[sp]):esc(ckSpN(sp))}</small></span>`).join('')}</div></div>
    <p class="hint">${fam?'Our family as the Creatures. Every phone shows the same cards.':'The Creatures, drawn in our meeple style. Every phone shows the same cards.'}</p></div>`:''}
  <p class="hint">${usualUI('coverkingdom')}</p>
  <div class="actions"><div class="in"><button class="btn primary" data-a="go" data-s="players">Players ›</button></div></div>`}
function ckScoreScr(){if(ckOn()&&S.started&&!S.demo)return ckPlayUI();return ckScoreSheet()}

/* ---------- score a real game: magic per round ---------- */
function ckScoreSheet(){const P=act();
  return `<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1>Cover Your Kingdom</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>
  <p class="hint lv-hint hftip">After each round, type everyone’s magic (the gems in their Kingdom, plus any bonuses).</p>
  <div class="nxlist">${P.map((p,i)=>{const D=ckP(p);return `<div class="nxcard" style="${pc(p.color)}"><div class="nxh"><b>${esc(nm(p))}</b><span class="num nxpts" data-ckt="${i}">${ckTot(p)}</span></div>
    <div class="cykrec">${[0,1,2].map(r=>`<label class="cykrecr"><span class="rlab">Round ${r+1}</span><input class="numin num" inputmode="numeric" pattern="[0-9]*" data-ckrec="${i}:${r}" value="${+D.r[r]||''}" placeholder="0" aria-label="${esc(nm(p))} round ${r+1} magic"></label>`).join('')}</div></div>`}).join('')}</div>
  <div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; reveal</button></div></div>`}
function ckChecks(){if(ckOn()&&S.ckg)return [];const o=[];if(act().every(p=>!ckTot(p)))o.push('No magic entered yet.');return o}
function ckResults(){const R=S.ckrec||{},f2=R.ext==='first2',w=p=>(p.ck||{}).w||0,P=act().slice().sort((a,b)=>f2?w(b)-w(a)||ckTot(b)-ckTot(a):ckTot(b)-ckTot(a));
  const win=Array.isArray(R.win)&&R.win.length?R.win:(()=>{const t=Math.max(...P.map(ckTot));return P.filter(p=>ckTot(p)===t).map(p=>p.id)})();
  return `<div class="bar"><button class="back" data-a="go" data-s="score">‹ ${ckOn()?'Game':'Score sheet'}</button><h1>Results</h1></div>
  <div class="cykresimg"><img src="art/coverkingdom-icon.png" alt="" width="96" height="96" onerror="this.remove()"></div>
  ${R.ext?`<p class="rlab cnresw">${CKEXT[R.ext]||''}${R.rounds>1?` · ${R.rounds} rounds`:''}</p>`:''}
  <div class="podium">${P.map((p,i)=>{const D=p.ck||{r:[]},t=ckTot(p),top=win.includes(p.id);return `<div class="res ${top?'win':''}" style="${pc(p.color)}"><div class="rtop"><span class="rank num">${top?'🏆':i+1}</span><span class="rname">${esc(nm(p))}</span><span class="rtot">${t}</span></div>
    <p class="rlab">${(D.r||[]).map((v,r)=>`Round ${r+1}: <b class="num">${+v||0}</b>`).join(' · ')}${f2?` · ${w(p)} win${w(p)===1?'':'s'}`:''}${(D.c||[]).length?` · ${(D.c||[]).reduce((a,b)=>a+b,0)} Creatures`:''}</p></div>`}).join('')}</div>
  ${awardsHtml()}${photoBlock()}
  <div class="actions"><div class="in"><button class="btn primary" data-a="rematch">Rematch, same players</button></div></div>`}
function ckAwards(){const P=act(),out=[],best=(f,min)=>{const m=Math.max(0,...P.map(f));return m>=(min||1)?P.filter(p=>f(p)===m):[]};
  const c=best(p=>Math.max(0,...(((p.ck||{}).c)||[0])),1);if(c.length&&c.length<P.length)out.push({title:'Biggest Kingdom',ps:c,why:'the most Creatures in one round'});
  const r=best(p=>Math.max(0,...(((p.ck||{}).r)||[0]).map(v=>+v||0)),1);if(r.length&&r.length<P.length)out.push({title:'Gem hoard',ps:r,why:'the most magic in one round'});
  return out}
function ckHistory(pid){const p=act().find(q=>q.id===pid);if(!p)return '';const D=p.ck||{r:[]};
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet phsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1" style="${pc(p.color)}"><div class="rs-top"><div><h2 id="lp-h">${esc(nm(p))}</h2><small class="lp-sub">${ckTot(p)} magic</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
    <div class="rs-body"><ul class="phlist hfhist">${(D.r||[]).map((v,r)=>`<li><span><b>Round ${r+1}</b></span><span class="hfh-v">${+v||0}</span></li>`).join('')||'<li><span>No rounds yet</span></li>'}</ul></div></div></div>`}
function ckRevSteps(){const n=Math.max(1,...act().map(p=>((p.ck||{}).r||[]).length));return Array.from({length:n},(_,r)=>({name:`Round ${r+1}`,f:p=>+((p.ck||{}).r||[])[r]||0}))}
function ckGuide(){const X=CKX();return guideSheet('Cover Your Kingdom',[
  ['The idea',[['Goal','Build the Kingdom with the most magic. Each Creature card has a magic gem; at the end you add up every gem in your Kingdom.'],['Lands','Your Kingdom has a Highland and a Lowland. Each Clanning Creature lives in the land on its gem; “Either” Creatures can live in either one. A new Clan goes on top of that land’s stack and covers the Clan below.'],['Cards','Clanning Creatures (they form Clans), Wilds (CerbeRussel Terrier and Spydra) and Creatures for Hire.'],['Hands','6 cards each. You refill to 6 at the end of every turn.']]],
  ['Your turn: 2 actions',[['Settle','Play two matching Clanning Creatures, a Wild with a Clanning Creature, or one card that matches the top of the discard pile. They start a new Clan.'],['Recruit','Play a matching card (or a Wild) at a rival’s top Clan. You need at least 1 Clan and they need at least 2. They can counter with a matching card or a Wild, you can counter back, and so on. Whoever plays last wins the Clan and every card played.'],['Spydras','A Spydra counts as two Creatures: answering one takes another Spydra or a matching pair.'],['Missed?','If your recruit fails, you can’t go after that Clan again this turn.'],['Hire','Play a Creature for Hire: Minnowtaur (guard or block a land), Hypnogriff (take 3 cards, give 3 back), Grumbledalf’s Elves (banish a top Clan unless the owner sacrifices), Wiizzzaard (move a top Clan to the bottom, or the bottom one up), Mobgoblins (swap top Clans).'],['Add','Add a matching card to one of your own top Clans.'],['Discard','Discard a Clanning Creature and draw a new card.'],['The deck runs out','No more drawing: keep playing until everyone is out of cards.']]],
  ['Scoring',[['Magic','Add up every gem in your Kingdom. Most magic wins; a tie goes to the most Creatures.'],X.cons?['Constellations','Light a token for every kind of Clanning Creature in your Kingdom. A full row (Highland, Either or Lowland) and all ten earn bonus magic.']:null,X.ls&&X.cons?['Light Speed','The first Ruler to light all ten (and anyone who catches up before their next turn) gets the big bonus again.']:null,
    +X.pow?['Kingdom Powers','Each Ruler has '+(+X.pow===2?'two powers':'a power')+' that bends one rule just for them. Tap your power card to read it.']:null,X.ext!=='one'?['Extended contest',CKEXTW[X.ext]]:null]],
  ['Two Rulers',[['Hands of 7','With Two Ruler rules you hold 7 cards and the horses (PegLegasi, Hentaurs, UniqueHorns) live in a third land, the Maneland.'],['The Drafty Inn','Four face-up piles. As an action, take matching Creatures from the Inn by revealing a matching card or a Wild; your rival may challenge it like a recruit. Creatures for Hire that flip up in the Inn work on both Rulers at once.']]],
  ['More',[['Rule book','This is a short summary. The rule book in the box has every detail, and the app follows the readings in our notes where the book is unclear.']]]])}
function ckStats(p){const g=S.ckg;if(g&&ckOn()&&S.started&&!S.finished&&g.ps&&g.ps.includes(p.id)){const sc=g.phase==='play'?ckScore(g,p.id):(g.res||{})[p.id]||{total:0,cards:0};return [{k:'Creatures',v:String(sc.cards),i:'🐾'},{k:'Round',v:String(g.round)}]}
  const D=p.ck||{r:[]};return [{k:'Magic',v:String(ckTot(p)),i:'👑'},{k:'Rounds',v:String((D.r||[]).filter(v=>+v).length)}]}
function ckRecords(G){const TG=G.filter(g=>g.game==='coverkingdom'&&g.state&&g.state.players);if(!TG.length)return '';const per={};let best=null;
  TG.forEach(g=>{const tots=g.state.players.map(p=>((p.ck||{}).r||[]).reduce((a,b)=>a+(+b||0),0)),top=Math.max(0,...tots);
    g.state.players.forEach((p,j)=>{const pl=g.players.find(x=>x.name===((p.name||'').trim()));if(!pl||!realP(pl))return;const e=per[pkey(pl)]||(per[pkey(pl)]={name:pl.name,color:pl.color,g:0,w:0});e.g++;if(top&&tots[j]===top)e.w++;
      ((p.ck||{}).r||[]).forEach(v=>{if(!best||+v>best.v)best={v:+v,name:pl.name,color:pl.color,g}})})});
  const L=Object.values(per),card=(t,v,sub,c)=>`<div${c?` style="${pc(c)}"`:''}><span>${t}</span><b>${v}</b><small>${sub}</small></div>`,top=[...L].sort((a,b)=>b.w-a.w)[0];
  return `<div class="sec"><div class="sec-h"><h3>Cover Your Kingdom records</h3></div><div class="recs" style="margin-top:0">
    ${top&&top.w?card('Most wins',`<span class="num">${top.w}</span>`,`${esc(top.name)} · ${top.w} of ${top.g} games`,top.color):''}
    ${best&&best.v?card('Best round',`<span class="num">${best.v}</span>`,`${esc(best.name)} · ${fmtD(best.g.date,{month:'short',day:'numeric'})}`,best.color):''}</div></div>`}

/* ---------- moves: every move carries the game and round it was made in ---------- */
const ckSt=g=>`${g.gid}:${g.round}`;
/* "Nudge" (not a game rule): stored in the game so it reaches the nudged phone. 15 s cooldown per pair */
function ckNudge(g,by,to){if(!g||g.phase!=='play'||!to||by===to||!g.ps.includes(by)||!ckWho(g).includes(to)||(g.bots||{})[to])return false;
  const now=Date.now(),L=g.nzl=g.nzl||{},key=by+'>'+to;if(L[key]&&now-L[key]<15000)return false;L[key]=now;
  const Z=g.nz=g.nz||{},o=Z[to]||{};Z[to]={k:(o.k||0)+1,by,at:now,w:g.ch&&g.ch.ans===to?'answer':g.pl||g.hy||g.fx?'choice':'turn'};return true}
function ckMoveQ(g,pid,mv){if(!g||!mv||typeof mv!=='object')return false;if(mv.st!=null&&mv.st!==ckSt(g))return false;const m={...mv};delete m.st;
  if(m.a==='nudge')return ckNudge(g,pid,m.to);
  if(m.a==='next'&&(g.phase!=='roundEnd'||!g.ps.includes(pid)))return false;
  /* Go back (Nov 26): undo your own turn's actions until something is drawn, a rival has to answer, or the turn passes */
  if(m.a==='back'){if(!cgUxBack(g,pid,CKUX))return false;ckLog(g,{k:'back',p:pid});return true}
  return cgUx(g,pid,CKUX,()=>ckMove(g,pid,m))}
const CKUX={fp:g=>[g.draw.length,g.rs,g.round,g.innq.length],ok:(g,p)=>ckIdle(g)&&g.turn===p};

/* ---------- the play screen ---------- */
let CKSEL=[],CKF=null,CKPILES=[],CKBIG=(()=>{try{return localStorage.getItem('ft-ckbig')==='1'}catch(e){return false}})();
function ckViewer(){const P=act();if(ckLinked())return P.find(p=>p.id===S.lk.me&&!p.bot)||null;const H=P.filter(p=>!p.bot);return H.length===1?H[0]:null}
const ckBig=()=>CKBIG&&ckLinked()||!ckViewer();
function ckGx(){if(typeof LKOPTR!=='undefined'&&LKOPTR)return S.ckg||null;try{const o=typeof lkqOn==='function'&&lkqOn()?lkOptState():null;if(o)return o.ckg||null}catch(e){}return S.ckg||null}
function ckActor(g){if(!g||g.phase!=='play')return null;return ckWho(g)[0]||null}
function ckMe(g){const V=ckViewer();return V&&!ckBig()&&g&&g.ps.includes(V.id)?V.id:null}
/* plain words for the log */
function ckLogTxt(e){const n=p=>esc(ckName(p)),sp=s=>esc(ckSpN(s)),L=l=>CK_LN[l]||l,s=k=>k===1?'':'s';
  switch(e.k){
  case 'round':return `Round ${e.r}: ${n(e.first)} goes first.`;
  case 'settle':return `${n(e.p)} settled a ${sp(e.sp)} Clan in the ${L(e.land)}${e.disc?' with the discard':''}${e.free?' (Match Maker, free)':''}.`;
  case 'recruit':return `⚔️ ${n(e.by)} is recruiting ${n(e.tg)}’s ${sp(e.sp)} Clan with a ${sp(e.card)}!`;
  case 'counter':return `${n(e.p)} countered with ${e.cards.map(sp).join(' + ')}.`;
  case 'pass':return `${n(e.p)} let it go.`;
  case 'cant':return `${n(e.p)} had no answer.`;
  case 'recDone':return e.win===e.by?`🎉 ${n(e.by)} recruited ${n(e.tg)}’s ${sp(e.sp)} Clan!`:`🛡️ ${n(e.tg)} kept the ${sp(e.sp)} Clan.`;
  case 'elves':return `🧝 ${n(e.by)} sent the Elves after ${n(e.t)}’s ${sp(e.sp)} Clan!`;
  case 'elvDone':return e.saved?`🛡️ ${n(e.tg)} saved the ${sp(e.sp)} Clan from the Elves.`:`🧝 The Elves took ${n(e.tg)}’s ${sp(e.sp)} Clan away.`;
  case 'inn':return `🍺 ${n(e.by)} is taking ${e.n} card${s(e.n)} from the Drafty Inn with a ${sp(e.card)}.`;
  case 'innDone':return `🍺 ${n(e.win)} won the ${sp(e.sp)} Clan from the Drafty Inn.`;
  case 'innHire':return `🍺 The Drafty Inn flipped a ${sp(e.h)}! It works on both Rulers.`;
  case 'fxDone':return `The Inn’s ${sp(e.h)} is done.`;
  case 'place':return `${n(e.p)} put the ${sp(e.sp)} Clan in the ${L(e.land)}.`;
  case 'hy':return `🌀 ${n(e.by)}’s Hypnogriff took ${e.n} card${s(e.n)} from ${n(e.t)}.`;
  case 'hyDone':return `${n(e.by)} gave ${e.n} card${s(e.n)} back to ${n(e.from)}.`;
  case 'wz':return `🪄 ${n(e.by)}’s Wiizzzaard moved ${e.t===e.by?'their own':n(e.t)+'’s'} ${L(e.land)} ${e.dir==='down'?'top Clan to the bottom':'bottom Clan to the top'}.`;
  case 'mt':return e.up?`🛡️ ${n(e.by)}’s Minnowtaur guards their ${L(e.land)}.`:`⛔ ${n(e.by)}’s Minnowtaur blocks ${n(e.t)}’s ${L(e.land)}.`;
  case 'mb':return `👺 ${n(e.by)}’s Mobgoblins swapped a ${sp(e.gave)} Clan for ${n(e.t)}’s ${sp(e.got)} Clan.`;
  case 'add':return `${n(e.p)} added a ${sp(e.sp)} in the ${L(e.land)}.`;
  case 'discard':return `${n(e.p)} discarded a ${sp(e.sp)}.`;
  case 'dh':return `${n(e.p)} discarded ${e.n} (DissedHard).`;
  case 'wkid':return `${n(e.p)}’s Wiizzz Kid swapped two Clans in the ${L(e.land)}.`;
  case 'star':return `⭐ ${n(e.p)} lit the ${sp(e.sp)} star.`;
  case 'ls':return `🚀 ${n(e.p)} lit every star: Light Speed!`;
  case 'roundEnd':return `Round ${e.r} is over.`;
  case 'back':return `↩️ ${n(e.p)} went back.`}
  return ''}
const ckActsLeft=g=>Math.max(0,2-g.acts);
/* the line at the top: whose input the table is waiting for */
function ckBanner(g,me){if(g.phase!=='play')return '';const who=ckWho(g),mine=me&&who.includes(me),t=g.turn;let main,sub='';
  if(g.ch){const a=g.ch.ans;main=mine?'⚔️ Your answer!':`⚔️ Waiting for ${ckWho1(a)} to answer`}
  else if(g.pl)main=mine?'Place your new Clan':`${ckWho1(g.pl.pid)} is placing a Clan`;
  else if(g.hy)main=mine?`Give back ${g.hy.n} card${g.hy.n===1?'':'s'}`:`${ckWho1(g.hy.by)} is giving cards back`;
  else if(g.fx)main=mine?'The Inn’s hire: your pick':`Waiting for ${who.map(ckWho1).join(' and ')}`;
  else{main=t===me?'👑 Your turn':`${ckWho1(t)}’s turn`;const n=ckActsLeft(g);sub=`${n} action${n===1?'':'s'} left`;
    if(t===me&&ckHas(g,me,'mm')&&!g.free.mm)sub+=' · Match Maker ready'}
  const col=g.ch?g.ch.ans:g.pl?g.pl.pid:g.hy?g.hy.by:t;
  return `<div class="cykturn${mine?' mine':''}" style="${ckPcol(col)}" role="status">${ckMeep(col)}<div><b>${main}</b>${sub?`<small>${sub}</small>`:''}</div>${!g.ch&&!g.pl&&!g.hy&&!g.fx?`<span class="cykdots" aria-hidden="true">${[0,1].map(i=>`<i class="${i<g.acts?'used':''}"></i>`).join('')}</span>`:''}</div>`}
function ckLogHtml(g,n){const L=g.log.slice(-(n||3)).reverse().map(ckLogTxt).filter(Boolean);if(!L.length)return '';
  return `<div class="cyklog" aria-live="polite">${L.map((t,i)=>`<p class="${i?'old':''}">${t}</p>`).join('')}</div>`}
/* the middle of the table: deck, discard, retired (and the Drafty Inn) */
function ckTableHtml(g,o={}){const top=g.disc[g.disc.length-1];
  let h=`<div class="cyktable"><div class="cykpile"><span class="rlab">Deck</span>${ckBack(g,g.draw.length,'deck')}</div>
    <div class="cykpile"><span class="rlab">Discard</span>${top!=null?ckCard(g,g.cs[top],{sz:'s',n:g.disc.length}):'<span class="cykempty">empty</span>'}</div>
    <div class="cykpile"><span class="rlab">Retired</span><span class="cykret num">${g.ret.length}</span></div></div>`;
  if(!g.draw.length&&g.phase==='play')h+=`<p class="cykwarn">No more drawing: play until everyone is out of cards.</p>`;
  if(g.o.two)h+=`<div class="cykinn" aria-label="The Drafty Inn"><span class="rlab">🍺 The Drafty Inn</span><div class="cykinnp">${g.inn.map((P,i)=>{const c=P[P.length-1],on=CKPILES.includes(i),tap=o.innTap&&c!=null;
    return `<${tap?'button':'div'} class="cykinnpile${on?' on':''}"${tap?` data-a="ckupile" data-k="${i}" aria-pressed="${on}"`:''}>${c!=null?ckCard(g,g.cs[c],{sz:'s',n:P.length}):'<span class="cykempty">empty</span>'}</${tap?'button':'div'}>`}).join('')}</div></div>`;
  return h}
/* one land of a Kingdom: covered Clans peek out (just their gems), the top Clan shows */
function ckLandHtml(g,pid,l,o){const St=g.k[pid][l],T=St[St.length-1],key=pid+':'+l,tap=o.tg&&o.tg.has(key);
  const mts=g.mt.filter(m=>m.t===pid&&m.land===l);
  const peek=St.slice(0,-1).map(C=>`<span class="cykpeek" title="A covered Clan: ${C.c.length} card${C.c.length===1?'':'s'}">${ckGem(g,C.sp,'sm')}<small>×${C.c.length}</small></span>`).join('');
  const top=T?ckClanChip(g,pid,T,(o.big||o.mine)&&ckLands(g).length<3):`<span class="cykempty">empty</span>`;
  const tag=tap?'button':'div';
  return `<${tag} class="cykland l-${l}${tap?' tgt':''}${o.blk&&ckBlocked(g,pid,l)?' blk':''}"${tap?` data-a="ckutgt" data-k="${esc(key)}" aria-label="${esc(ckName(pid))}’s ${CK_LN[l]}${T?', '+esc(ckSpN(T.sp))+' Clan':''}"`:''}>
    <span class="cyklh">${CK_LI[l]} ${CK_LN[l]}${St.length>1?` <small>· ${St.length} Clans</small>`:''}</span>
    ${mts.map(m=>`<span class="cykmt ${m.up?'up':'side'}" title="${m.up?'Guarded by a Minnowtaur':'Blocked by a Minnowtaur'}">${m.up?'🛡️ Guarded':'⛔ Blocked'}</span>`).join('')}
    ${peek?`<span class="cykpeeks" aria-label="Covered Clans">${peek}</span>`:''}${top}</${tag}>`}
/* constellation tokens (one per Clanning kind) */
function ckStarsHtml(g,pid,full){if(!g.o.cons)return '';const T=g.tok[pid]||{},n=CK_CLANS.filter(s=>T[s]).length,ls=g.ls&&g.ls.got&&g.ls.got.includes(pid);
  if(!full)return `<span class="cykstarn" title="Constellation tokens lit">⭐ ${n}/10${ls?' 🚀':''}</span>`;
  return `<div class="cykstars" aria-label="Constellations: ${n} of 10 lit">${['high','either','low'].map(cl=>`<span class="cykcl">${CK_CLANS.filter(s=>CK_SPI[s].cl===cl).map(s=>`<span class="cyktok${T[s]?' on':''}" title="${esc(CK_SPI[s].name)}${T[s]?' (lit)':''}"><img src="${ckImgSrc(s,ckFam(g))}" alt="${esc(ckSpN(s))}"></span>`).join('')}</span>`).join('')}${ls?'<b class="cykls">🚀 Light Speed</b>':''}</div>`}
function ckPowHtml(g,pid,full){const P=(g.pw||{})[pid]||[];if(!P.length)return '';
  if(!full)return P.map(p=>`<span class="cykpowc">✨ ${esc(CK_POWI[p].name)}</span>`).join('');
  return `<div class="cykpows">${P.map(p=>`<div class="cykpow"><b>✨ ${esc(CK_POWI[p].name)}</b><small>${CK_PSUM[p]}</small></div>`).join('')}</div>`}
function ckMagic(g,pid){return ckScore(g,pid).total}
/* a Ruler's panel: name, hand (backs only), magic, then the Kingdom */
function ckRulerHtml(g,pid,o){const me=o.me,mine=pid===me,tapR=o.tg&&o.tg.has(pid+':'),far=me&&!mine&&!ckInRange(g,me,pid),act2=ckWho(g).includes(pid)&&g.phase==='play';
  const head=`<div class="cykrh">${ckMeep(pid)}<b>${mine?'Your Kingdom':ckWho1(pid)}</b><span class="cykrm" title="Magic in this Kingdom">💎 <b class="num">${ckMagic(g,pid)}</b><span class="cykmw"> magic</span></span>${mine?'':ckBack(g,g.hand[pid].length,'sm')}</div>`;
  const extra=`${ckStarsHtml(g,pid,mine&&!o.big)}${mine&&!o.big?ckPowHtml(g,pid,true):`<span class="cykpowl">${ckPowHtml(g,pid,false)}</span>`}${far?'<span class="cykfar">Too far to recruit</span>':''}`;
  return `<section class="cykruler${mine?' me':''}${act2?' on':''}${tapR?' tgt':''}" style="${ckPcol(pid)}" aria-label="${esc(mine?'Your Kingdom':ckName(pid)+'’s Kingdom')}">
    ${tapR?`<button class="cykrhb" data-a="ckutgt" data-k="${esc(pid)}:" aria-label="Pick ${esc(ckName(pid))}">${head}</button>`:head}
    <div class="cykking">${ckLands(g).map(l=>ckLandHtml(g,pid,l,{...o,mine})).join('')}</div>${extra.trim()?`<div class="cykextra">${extra}</div>`:''}</section>`}
/* the challenge on the table: everyone sees the chain as it happens */
function ckChainHtml(g,me){const ch=g.ch;if(!ch)return '';const T=ch.k!=='inn'?ckTop(g,ch.tg,ch.land):null;
  const what=ch.k==='rec'?`${ckWho1(ch.by)} is recruiting ${ch.tg===me?'your':ckWho1(ch.tg)+'’s'} ${esc(ckSpN(ch.sp))} Clan`:ch.k==='elv'?`${ckWho1(ch.by)}’s Elves are after ${ch.tg===me?'your':ckWho1(ch.tg)+'’s'} ${esc(ckSpN(ch.sp))} Clan`:`${ckWho1(ch.by)} is taking ${esc(ckSpN(ch.sp))} from the Drafty Inn`;
  const stake=T?`${CK_LN[ch.land]} · ${ckClanVal(g,ch.tg,T)} magic, ${T.c.length} card${T.c.length===1?'':'s'}`:ch.inn?`${ch.inn.length} card${ch.inn.length===1?'':'s'} from the Inn`:'';
  const steps=ch.plays.map(x=>`<div class="cykplay" style="${ckPcol(x.p)}">${ckMeep(x.p,'cykmeep sm')}<span class="cykplc">${x.c.map(c=>ckCard(g,g.cs[c],{sz:'s'})).join('')}</span><small>${esc(ckName(x.p))}${x.n>1?' · counts 2':''}</small></div>`).join('<i class="cykarr" aria-hidden="true">→</i>');
  const wait=ch.ans!==me?`<p class="rlab cykwait">Waiting for ${ckWho1(ch.ans)} to answer…</p>${ckNudgeRow(g,me)}`:'';
  return `<div class="cykchain" aria-label="The challenge"><p class="cykchw"><b>${what}</b>${stake?`<small>${stake}</small>`:''}</p>${steps?`<div class="cykplays">${steps}</div>`:''}${ch.k==='elv'&&!ch.plays.length?'<p class="rlab">No sacrifices yet.</p>':''}${wait}</div>`}
/* "Nudge": a 🔔 for each person the table is waiting on (never on the big board, never for computer players) */
function ckNudgeRow(g,me){if(!me||g.phase!=='play')return '';const now=Date.now(),to=ckWho(g).filter(p=>p!==me&&!(g.bots||{})[p]);if(!to.length)return '';
  return `<div class="cyknudges">${to.map(p=>{const at=((g.nzl||{})[me+'>'+p])||0,c=at&&now-at<15000;return c?`<button class="btn sm cyknudge on" disabled data-ckre="${at+15000}">Nudged ✓ ${esc(ckName(p))}</button>`:`<button class="btn sm cyknudge" data-a="ckunudge" data-k="${esc(p)}" style="${ckPcol(p)}">🔔 Nudge ${esc(ckName(p))}</button>`}).join('')}</div>`}

/* ---------- guided moves: pick cards, tap an action, then tap a target / a choice ---------- */
const CK_TGT=['recruit','hire'];
function ckEnum(g,me,a,sel){const L=ckLands(g),o=[],push=m=>{if(ckValid(g,me,m))o.push(m)};
  if(a==='settle'){const base=sel.length===2?{cards:sel.slice()}:sel.length===1?{cards:sel.slice(),disc:true}:null;if(base)L.forEach(land=>[0,1].forEach(f=>push({a:'settle',...base,land,...(f?{free:true}:{})})))}
  else if(a==='recruit'){if(sel.length===1)g.ps.forEach(t=>{if(t!==me)L.forEach(land=>push({a:'recruit',t,land,card:sel[0]}))})}
  else if(a==='add'){if(sel.length===1)L.forEach(land=>L.forEach(to=>push({a:'add',card:sel[0],land,...(to!==land?{to}:{})})))}
  else if(a==='discard'){if(sel.length===1)push({a:'discard',card:sel[0]})}
  else if(a==='hire'){if(sel.length===1&&ckIsHire(g,sel[0])){const c=sel[0],h0=g.cs[c],hs=ckHas(g,me,'xf')&&['wz','mt','hy'].includes(h0)?['wz','mt','hy']:[h0];
    hs.forEach(h=>{const as=h!==h0?{as:h}:{};g.ps.forEach(t=>{
      if(h==='wz')L.forEach(land=>['down','up'].forEach(dir=>push({a:'hire',card:c,t,land,dir,...as})));
      else if(h==='mt'||h==='el')L.forEach(land=>push({a:'hire',card:c,t,land,...as}));
      else if(h==='hy')push({a:'hire',card:c,t,...as});
      else if(h==='mb')L.forEach(land=>L.forEach(mine=>push({a:'hire',card:c,t,land,mine})))})})}}
  else if(a==='inn'){if(sel.length===1&&CKPILES.length)push({a:'inn',take:CKPILES.slice().sort(),card:sel[0]})}
  else if(a==='wkid')L.forEach(land=>push({a:'wkid',land}));
  else if(a==='end'){if(sel.length&&ckHas(g,me,'dh'))push({a:'end',dh:sel.slice()});if(!o.length)push({a:'end'})}
  return o}
const ckTl=m=>(m.t||'')+':'+(m.land||'');
function ckFlowCands(g,me){if(!CKF)return [];let c=ckEnum(g,me,CKF.a,CKF.a==='wkid'?[]:CKSEL);const F=CKF.fix||{};
  return c.filter(m=>Object.keys(F).every(k=>k==='tl'?ckTl(m)===F.tl:JSON.stringify(m[k]===undefined?null:m[k])===F[k]))}
/* what's still open to choose: [dim, values]. Target actions choose 'as' first, then the target (tap), then the rest */
function ckOpen(cands,a){const dims=CK_TGT.includes(a)?['as','tl','mine','dir']:['land','to','free'];
  for(const d of dims){const v=[...new Set(cands.map(m=>d==='tl'?ckTl(m):JSON.stringify(m[d]===undefined?null:m[d])))];if(v.length>1||d==='tl'&&!(CKF.fix||{}).tl)return [d,v]}return null}
const CK_HINT={settle:'To settle, pick two matching Clanning cards, a Wild and a Clanning card, or one card that matches the top of the discard pile.',recruit:'To recruit, pick one card that matches a rival’s top Clan, or a Wild.',
  hire:'To hire, pick a Creature for Hire from your hand.',add:'To add, pick a card that matches one of your own top Clans.',discard:'To discard, pick one Clanning Creature.',inn:'Tap the Inn piles you want, then pick a matching card or a Wild from your hand.',end:'You can’t end your turn yet.'};
const CK_ASK={recruit:'Tap the rival Clan to recruit (it glows).',hire:'Tap the target (it glows).'};
function ckChoiceLabel(g,me,d,v){const val=v==='null'?null:d==='tl'?v:JSON.parse(v),T=(p,l)=>{const C=ckTop(g,p,l);return C?`${ckSpN(C.sp)} (${ckClanVal(g,p,C)})`:'empty'};
  if(d==='as')return `Use it as a ${ckSpN(val)}`;
  if(d==='mine')return `Give my ${CK_LN[val]} ${T(me,val)}`;
  if(d==='dir'){const F=CKF.fix||{},[t,l]=String(F.tl||':').split(':'),S2=t&&l?g.k[t][l]:null;return val==='down'?`Top Clan${S2&&S2.length?' ('+ckSpN(S2[S2.length-1].sp)+')':''} to the bottom`:`Bottom Clan${S2&&S2.length?' ('+ckSpN(S2[0].sp)+')':''} to the top`}
  if(d==='to')return val==null?'Keep it where it is':`Move it to the ${CK_LN[val]}`;
  if(d==='land')return `${CK_LI[val]} ${CK_LN[val]}`;
  if(d==='free')return val?'✨ Free (Match Maker)':'Use an action';
  return String(val)}
function ckFlowHtml(g,me,cands){if(!CKF)return '';const op=ckOpen(cands,CKF.a),name={settle:'Settle',recruit:'Recruit',hire:'Hire',add:'Add',discard:'Discard',inn:'Drafty Inn',wkid:'Wiizzz Kid',end:'End turn'}[CKF.a];
  let body='';
  if(CKF.a==='inn')body=`<div class="cykinnp">${g.inn.map((P,i)=>{const c=P[P.length-1],on=CKPILES.includes(i);return c!=null?`<button class="cykinnpile${on?' on':''}" data-a="ckupile" data-k="${i}" aria-pressed="${on}">${ckCard(g,g.cs[c],{sz:'s',n:P.length})}</button>`:'<span class="cykempty">empty</span>'}).join('')}</div>
    <div class="cykinngo"><p>${CKPILES.length?(cands.length?'Ready!':CKSEL.length?'That doesn’t match: reveal a matching card or a Wild.':'Now pick the card to reveal from your hand.'):'Tap the piles to take (all the same Creature), then a matching card or a Wild from your hand.'}</p>${cands.length?'<button class="btn primary" data-a="ckugo">🍺 Take them</button>':''}</div>`;
  else if(op&&op[0]==='tl')body=`<p class="cyktap">${CKF.a==='hire'&&ckHireKind(g)==='hy'?'Tap the rival whose cards you want (their name glows).':CK_ASK[CKF.a]||'Tap the target.'}</p>`;
  else if(op)body=`<div class="cykchoices">${op[1].map(v=>`<button class="btn" data-a="ckuchoose" data-k="${esc(op[0]+'|'+v)}">${esc(ckChoiceLabel(g,me,op[0],v))}</button>`).join('')}</div>`;
  return `<div class="cykflow" role="region" aria-label="${name}"><div class="cykflowh"><b>${name}</b>${op&&op[0]==='tl'?body:''}<button class="btn sm" data-a="ckucancel">Cancel</button></div>${op&&op[0]==='tl'?'':body}</div>`}
const ckHireKind=g=>{const F=CKF&&CKF.fix||{};if(F.as)return F.as;const c=CKSEL[0];return c!=null&&g.cs[c]};
function ckTargets(g,me,cands){const s=new Set();if(!CKF||!CK_TGT.includes(CKF.a))return s;const op=ckOpen(cands,CKF.a);if(!op||op[0]!=='tl')return s;cands.forEach(m=>s.add(ckTl(m)));return s}
/* the action buttons (only on your own turn, with nothing pending) */
const CK_WHY={settle:'No pair to settle',recruit:'No rival Clan you can take',hire:'No Creature for Hire',add:'Nothing matches your top Clans',discard:'No Clanning card',inn:'Nothing you can take',wkid:'Needs 2 Clans in a land',end:'Take an action first'};
function ckActBar(g,me,L){const has=a=>L.some(m=>m.a===a),why=a=>a!=='end'&&g.acts>=2?'No actions left':CK_WHY[a];const b=(a,ic,t)=>`<button class="btn${CKF&&CKF.a===a?' on':''}" data-a="ckuact" data-k="${a}" ${has(a)?'':`disabled title="${why(a)}" aria-label="${t}. ${why(a)}"`}><i aria-hidden="true">${ic}</i>${t}</button>`;
  const off=[['settle','Settle'],['recruit','Recruit'],['hire','Hire'],['add','Add'],['discard','Discard'],...(g.o.two?[['inn','Inn']]:[]),['end','End turn']].filter(([a])=>!has(a)),acts0=g.acts>=2;
  const dh=ckHas(g,me,'dh')&&CKSEL.length&&CKSEL.length<=2&&CKSEL.every(c=>ckIsClan(g,c));
  return `${cgUxCan(g,me,CKUX)?`<div class="cykback">${uxUndoBtn('ckuback')}</div>`:''}<div class="cykacts">${b('settle','🏰','Settle')}${b('recruit','⚔️','Recruit')}${b('hire','🪙','Hire')}${b('add','➕','Add')}${b('discard','🗑️','Discard')}${g.o.two?b('inn','🍺','Inn'):''}${ckHas(g,me,'wkid')&&!g.free.wkid?b('wkid','🪄','Kid'):''}
    <button class="btn${g.acts>=1?' primary':''} cykendb" data-a="ckuact" data-k="end" ${has('end')?'':`disabled title="${why('end')}"`}><i aria-hidden="true">✅</i>${dh?`End +${CKSEL.length}`:'End turn'}</button></div>${off.length?`<div class="cykwhy">${acts0?uxWhy('No actions left'):off.map(([a,t])=>uxWhy(`${t}: ${why(a).toLowerCase()}`)).join('')}</div>`:''}`}
/* the dock at the bottom: what you're doing, your hand (tap to pick), the action buttons */
function ckSortHand(g,H){return H.slice().sort((a,b)=>{const A=CK_SPI[g.cs[a]],B=CK_SPI[g.cs[b]],r=k=>k==='clan'?0:k==='wild'?1:2;return r(A.kind)-r(B.kind)||CK_SP.indexOf(A)-CK_SP.indexOf(B)||a-b})}
function ckDockHtml(g,me,top,bar,hint){const H=g.hand[me]||[],sel=CKSEL.length===1?CK_SPI[g.cs[CKSEL[0]]]:null;
  const info=sel?`<b>${esc(sel.name)}</b>${sel.kind==='hire'?' · '+CK_HSUM[sel.id]:sel.kind==='wild'?` · Wild, ${sel.v} magic${sel.id==='sp'?', counts as two in a challenge':''}`:` · ${sel.v} magic, ${CK_GEML[ckGemKind(g,sel.id)][1]}`}`:CKSEL.length?`${CKSEL.length} cards picked`:hint||'';
  return `<div class="actions cykdock"><div class="in">${top||''}
    <div class="cykhh"><b>Your hand <span class="num">${H.length}</span></b><small>${info}</small></div>
    <div class="cykcards" aria-label="Your hand">${ckSortHand(g,H).map(c=>ckCard(g,g.cs[c],{a:'ckusel',k:c,sel:CKSEL.includes(c),sz:'d',attrs:` data-hc="${c}"`})).join('')||'<p class="hint">No cards left.</p>'}</div>${bar||''}</div></div>`}
/* the answer pop-up for whoever the challenge is waiting on (no time limit) */
function ckChalSheet(g,me){const ch=g.ch;if(!ch||ch.ans!==me)return '';const opts=ckCounters(g),by=ckName(ch.by),tg=ckName(ch.tg),sp=ckSpN(ch.sp),first=ch.k==='elv'?!ch.plays.length:ch.plays.length===1,def=me===ch.tg;
  const title=ch.k==='rec'?(first?`${esc(by)} wants your ${esc(sp)} Clan! Counter or let it go?`:def?`${esc(by)} countered back! Counter again or let it go?`:`${esc(tg)} is defending the ${esc(sp)} Clan! Counter again or let it go?`)
    :ch.k==='elv'?(first?`${esc(by)} sent the Elves for your ${esc(sp)} Clan! Sacrifice to save it, or let it go?`:def?`${esc(by)} sacrificed back! Sacrifice again, or let it go?`:`${esc(tg)} sacrificed to save it! Sacrifice again, or let it go?`)
    :(first?`${esc(by)} is taking ${esc(sp)} from the Drafty Inn! Challenge or let it go?`:def?`${esc(by)} countered back! Counter again or let it go?`:`${esc(tg)} challenged! Counter again or let it go?`);
  const need=ch.k==='elv'?'A sacrifice is a Spydra, or two cards: two matching, a matching card and a CT, or two CTs.':ch.need>=2?'The last play counts as two: answer with a Spydra or a matching pair.':`Answer with a matching ${esc(sp)} or a Wild.`;
  const T=ch.k!=='inn'?ckTop(g,ch.tg,ch.land):null,lab=c=>c.map(x=>ckSpN(g.cs[x])).join(' + ');
  return `<div class="sheet-bg cykchbg"><div class="sheet cykchs" role="dialog" aria-modal="true" aria-labelledby="cykch-h" style="${ckPcol(ch.by===me?ch.tg:ch.by)}">
    <h2 id="cykch-h">${title}</h2><div class="cykchrow">${T?`<div class="cykchclan">${ckCard(g,T.sp,{sz:'s',n:T.c.length,sub:`${ckClanVal(g,ch.tg,T)} magic`})}</div>`:''}
    ${ch.plays.length?`<div class="cykplays">${ch.plays.map(x=>`<div class="cykplay" style="${ckPcol(x.p)}"><span class="cykplc">${x.c.map(c=>ckCard(g,g.cs[c],{sz:'s'})).join('')}</span><small>${esc(ckName(x.p))}${x.n>1?' · ×2':''}</small></div>`).join('<i class="cykarr" aria-hidden="true">→</i>')}</div>`:''}</div>
    <p class="rlab cykneed">${need}</p>
    <div class="cykcounters">${opts.map(c=>`<button class="btn cykcbtn" data-a="ckucounter" data-k="${c.join(',')}"><span class="cykplc">${c.map(x=>`<img src="${ckImgSrc(g.cs[x],ckFam(g))}" alt="">`).join('')}</span><span>${ch.k==='elv'?'Sacrifice':'Counter:'} ${esc(lab(c))}</span></button>`).join('')||'<p class="rlab">You have nothing that can answer.</p>'}</div>
    <div class="cykpassb"><button class="btn primary wide" data-a="ckupass">Let it go</button><p class="hint">No time limit. Everyone sees the challenge as it happens.</p></div></div></div>`}
/* the other questions only one Ruler answers */
function ckAskHtml(g,me){
  if(g.pl&&g.pl.pid===me){const C=g.pl.clan;return `<div class="cykflow cykask"><p><b>Where does your new ${esc(ckSpN(C.sp))} Clan go?</b></p><div class="cykchclan">${ckCard(g,C.sp,{sz:'m',n:C.c.length})}</div><div class="cykchoices">${g.pl.lands.map(l=>`<button class="btn primary" data-a="ckuplace" data-k="${l}">${CK_LI[l]} ${CK_LN[l]}</button>`).join('')}</div></div>`}
  if(g.hy&&g.hy.by===me){const n=g.hy.n,ok=CKSEL.length===n;return `<div class="cykflow cykask"><p><b>🌀 Give ${n} card${n===1?'':'s'} back to ${esc(ckName(g.hy.from))}</b></p><p class="rlab">Tap ${n} card${n===1?'':'s'} in your hand (${CKSEL.length} picked).</p><button class="btn primary" data-a="ckuhyret" ${ok?'':'disabled'}>Give ${ok?'these':n} back</button></div>`}
  if(g.fx&&g.fx.pick[me]===null){const k=g.fx.k,O=ckFxOpts(g,me,k),r=g.ps.find(p=>p!==me),T=l=>{const C=ckTop(g,r,l);return C?`${ckSpN(C.sp)} (${ckClanVal(g,r,C)})`:''};
    const what={mb:'Mobgoblins: pick a rival Clan to take',wz:'Wiizzzaard: move one of your rival’s stacks',el:'Elves: pick a rival Clan to banish'}[k];
    return `<div class="cykflow cykask"><p><b>🍺 The Inn flipped ${esc(ckSpN(k))}!</b></p><p class="rlab">${what}. Both Rulers choose at the same time.</p><div class="cykchoices">${O.map(x=>`<button class="btn" data-a="ckufx" data-k="${x.land}:${x.dir||''}">${CK_LI[x.land]} ${CK_LN[x.land]} ${esc(T(x.land))}${x.dir?(x.dir==='down'?' · top to bottom':' · bottom to top'):''}</button>`).join('')}</div></div>`}
  if(g.fx&&g.fx.pick[me]&&ckWho(g).length)return `<p class="rlab cykwait">Picked ✓ Waiting for ${ckWho(g).map(ckWho1).join(', ')}…</p>`;
  return ''}
/* the round's scores (gem totals + bonuses, tie-break by Creatures) */
const CK_DET={high:'Highland row',either:'Either row',low:'Lowland row',astro:'All ten',ls:'Light Speed'};
function ckScoreHtml(g){const R=g.res||{},P=g.ps.slice().sort((a,b)=>R[b].total-R[a].total||R[b].cards-R[a].cards),h=g.hist[g.hist.length-1]||{win:[]},E=g.o.ext,bon=g.o.cons;
  return `<table class="cyktab"><thead><tr><th>Ruler</th><th>Gems</th>${bon?'<th>Bonus</th>':''}<th>Total</th><th title="Creatures in the Kingdom (breaks ties)">🐾</th>${E==='acc2'||E==='acc3'?'<th>All rounds</th>':''}${E==='first2'?'<th>Wins</th>':''}</tr></thead><tbody>
    ${P.map(p=>{const r=R[p];return `<tr class="${h.win.includes(p)?'win':''}" style="${ckPcol(p)}"><td><i class="dot"></i>${h.win.includes(p)?'👑 ':''}${ckWho1(p)}</td><td class="num">${r.magic}</td>${bon?`<td class="num">${r.bonus?'+'+r.bonus:'·'}</td>`:''}<td class="num"><b>${r.total}</b></td><td class="num">${r.cards}</td>${E==='acc2'||E==='acc3'?`<td class="num"><b>${g.tot[p]}</b></td>`:''}${E==='first2'?`<td class="num"><b>${g.wins[p]}</b></td>`:''}</tr>`}).join('')}</tbody></table>
    ${bon?`<p class="rlab cykdet">${P.filter(p=>R[p].bonus).map(p=>`${esc(ckName(p))}: ${Object.entries(R[p].det).map(([k,v])=>`${CK_DET[k]} +${v}`).join(', ')}`).join(' · ')||'No constellation bonuses this round.'}</p>`:''}
    ${h.win.length>1?'<p class="rlab">Tied on magic and Creatures: a shared win.</p>':P.length>1&&R[P[0]].total===R[P[1]].total?'<p class="rlab">Tied on magic: the most Creatures wins.</p>':''}`}
function ckEndUI(g,me,big){const done=g.phase==='done',W=done?g.win||[]:(g.hist[g.hist.length-1]||{win:[]}).win;
  let o=`<div class="panel cykfin"><p class="cykbig">${done?'🏆':'👑'} ${W.map(p=>ckWho1(p)).join(' and ')} ${W.length>1?(done?'share the win':'tie this round'):(done?'wins the game!':'wins the round!')}</p>
    <p class="rlab">Round ${g.round}${g.o.ext==='acc2'?' of 2':g.o.ext==='acc3'?' of 3':g.o.ext==='first2'?' · first to 2 wins':''}</p>${ckScoreHtml(g)}`;
  if(g.o.ext!=='one'&&g.hist.length>1)o+=`<p class="rlab">${g.hist.map(h=>`Round ${h.r}: ${h.win.map(p=>esc(ckName(p))).join(' & ')}`).join(' · ')}</p>`;
  if(!done)o+=me?`<div class="cnrow"><button class="btn primary" data-a="ckunext">▶️ Start round ${g.round+1}</button></div>`:`<p class="rlab">Waiting for a player to start round ${g.round+1}…</p>`;
  else if(!big)o+=`<div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; see results</button></div></div>`;
  return o+'</div>'+`<div class="cykall">${g.ps.map(p=>ckRulerHtml(g,p,{me,big})).join('')}</div>`}
function ckPlayUI(){const g=ckGx(),P=act(),big=ckBig();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Cover Your Kingdom">${g&&g.phase==='done'?'🏁':'👑'}</h1>${ckViewer()&&ckLinked()?`<button class="btn sm undo" data-a="ckubig" aria-pressed="${big}" aria-label="Big board for a TV or iPad">📺${big?' Exit':''}</button>`:''}<button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  document.documentElement.classList.toggle('cykbigb',big&&!!g);
  if(P.length<2||P.length>8)return out+`<div class="panel" style="padding:16px"><p>Cover Your Kingdom needs 2 to 8 Rulers. Go back to Players.</p></div>`;
  if(!ckLinked()&&P.filter(p=>!p.bot).length>1)return out+`<div class="panel cyklinkme"><h2>📱 Link the phones</h2><p>Everyone holds their own hand, so each person needs their own phone. Tap <b>📱 Link</b> at the top, then everyone joins with the code and picks themselves.</p><p>Playing alone? Go back to Players and make the other seats computer players.</p><p>A phone or iPad that picks <b>Just watching</b> becomes the big board.</p></div>`;
  if(!g||ckStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(ckRes2()?'Shuffling the Creatures…':'Waiting for the host phone…')}</div>`;
  const me=ckMe(g);
  if(g.phase!=='play')return out+ckEndUI(g,me,big);
  out+=ckBanner(g,me)+ckLogHtml(g,me?1:4);
  if(!me){/* the big board: the table only, never a hand */
    out+=ckChainHtml(g,null)+ckTableHtml(g)+`<div class="cykall">${g.ps.map(p=>ckRulerHtml(g,p,{me:null,big:true})).join('')}</div>`;
    if(g.ps.length>=6)out+=`<p class="hint">6 to 8 Rulers: you can recruit only from the two Rulers on each side of you.</p>`;
    return out}
  /* my phone */
  const idle=ckIdle(g),myTurn=idle&&g.turn===me,L=myTurn?ckLegal(g,me):[];
  CKSEL=CKSEL.filter(c=>(g.hand[me]||[]).includes(c));if(!myTurn&&!(g.hy&&g.hy.by===me))CKF=null;if(!(myTurn&&CKF&&CKF.a==='inn'))CKPILES=[];
  let cands=myTurn&&CKF?ckFlowCands(g,me):[];if(CKF&&CKF.a!=='inn'&&!cands.length)CKF=null;
  const tg=ckTargets(g,me,cands);
  out+=ckChainHtml(g,me);
  const rivals=g.ps.map((_,i)=>g.ps[(g.ps.indexOf(me)+1+i)%g.ps.length]).filter(p=>p!==me);
  out+=`<div class="cykrivals">${rivals.map(p=>ckRulerHtml(g,p,{me,tg,blk:true})).join('')}</div>`;
  if(g.ps.length>=6)out+=`<p class="hint cykrange">6 to 8 Rulers: you can recruit only from the two Rulers on each side of you.</p>`;
  out+=ckTableHtml(g);
  out+=ckRulerHtml(g,me,{me,tg,blk:true});
  out+=ckDockHtml(g,me,ckAskHtml(g,me)+(myTurn&&CKF?ckFlowHtml(g,me,cands):''),myTurn?ckActBar(g,me,L):'',g.hy&&g.hy.by===me?'tap the cards to give back':myTurn?'tap cards, then an action':'');
  return out+ckChalSheet(g,me)}

/* ---------- moves from the screen ---------- */
function ckSend(m){const g=ckGx(),V=ckViewer();if(!g||!V)return false;const r=lkq('cykMove',V.id,{...m,st:ckSt(g)});if(r)vibe(10);else if(r===false)toast('That move isn’t allowed right now.');return r}
function ckDone(){CKSEL=[];CKF=null;CKPILES=[]}
function ckTryFinish(g,me){const c=ckFlowCands(g,me);if(!c.length){ckDone();return}if(!ckOpen(c,CKF.a)){ckSend(c[0]);ckDone()}}
function ckUiAct(a,b,k){if(a==='ckubig'){CKBIG=!ckBig();try{localStorage.setItem('ft-ckbig',CKBIG?'1':'0')}catch(e){}return}
  const g=ckGx();if(!g)return;const me=ckMe(g);
  if(a==='ckunext'){if(me)ckSend({a:'next'});return}
  if(!me||g.phase!=='play')return;
  switch(a){
    case 'ckusel':{const c=+k;if(!(g.hand[me]||[]).includes(c))return;const max=g.hy&&g.hy.by===me?g.hy.n:2;
      if(CKSEL.includes(c))CKSEL=CKSEL.filter(x=>x!==c);else{CKSEL.push(c);while(CKSEL.length>max)CKSEL.shift()}
      if(CKF&&CKF.a!=='inn'&&CKF.a!=='end')CKF=null;return}
    case 'ckucancel':ckDone();return;
    case 'ckuback':{if(ckSend({a:'back'}))ckDone();return}
    case 'ckuact':{if(!ckIdle(g)||g.turn!==me)return;if(CKF&&CKF.a===k&&k!=='end'){ckDone();return}
      if(k==='inn'){CKF={a:'inn',fix:{}};CKPILES=[];return}
      CKF={a:k,fix:{}};const c=ckFlowCands(g,me);
      if(!c.length){const need=['settle','recruit','add','discard','hire'].includes(k)&&!CKSEL.length;toast(need?'Tap a card in your hand first. '+(CK_HINT[k]||''):CK_HINT[k]||'You can’t do that right now.');CKF=null;return}
      if(!CK_TGT.includes(k))ckTryFinish(g,me);return}
    case 'ckutgt':{if(!CKF)return;const c=ckFlowCands(g,me).filter(m=>ckTl(m)===k);if(!c.length)return;CKF.fix.tl=k;ckTryFinish(g,me);return}
    case 'ckuchoose':{if(!CKF)return;const i=String(k).indexOf('|'),d=k.slice(0,i),v=k.slice(i+1);CKF.fix[d]=v;ckTryFinish(g,me);return}
    case 'ckupile':{if(!CKF||CKF.a!=='inn')return;const i=+k;CKPILES=CKPILES.includes(i)?CKPILES.filter(x=>x!==i):[...CKPILES,i];return}
    case 'ckugo':{if(!CKF)return;const c=ckFlowCands(g,me);if(c.length&&ckSend(c[0]))ckDone();return}
    case 'ckucounter':{const ids=String(k).split(',').map(Number);if(ckSend({a:'counter',cards:ids}))CKSEL=[];return}
    case 'ckupass':ckSend({a:'pass'});return;
    case 'ckuplace':ckSend({a:'place',land:k});return;
    case 'ckuhyret':{if(g.hy&&CKSEL.length===g.hy.n&&ckSend({a:'hyret',cards:CKSEL.slice()}))CKSEL=[];return}
    case 'ckufx':{const [land,dir]=String(k).split(':');ckSend({a:'fx',land,...(dir?{dir}:{})});return}
    case 'ckunudge':{if(ckSend({a:'nudge',to:k}))toast(`Nudged ${ckName(k)} 🔔`);return}}}
/* setup choices (handled here so the app core needs no new case per option) */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-a="ckuopt"]');if(!b||b.disabled)return;e.stopPropagation();
  if(S.game!=='coverkingdom'||S.started&&ckOn())return;const X=CKX(),[k,v]=String(b.dataset.k).split(':');
  if(k==='play'||k==='two'||k==='cons'||k==='ls')X[k]=v==='1'?1:0;else if(k==='pow')X.pow=[0,1,2].includes(+v)?+v:0;else if(k==='ext')X.ext=CKEXT[v]?v:'one';else if(k==='art')X.art=v==='family'?'family':'creatures';
  if(!X.cons)X.ls=0;ckSaveX();save();render()},true);
/* the score sheet: typing a round's magic */
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.ckrec||S.game!=='coverkingdom')return;const [i,r]=t.dataset.ckrec.split(':'),q=act()[+i];if(!q)return;
  ckP(q).r[+r]=Math.max(0,Math.min(9999,Math.round(+t.value)||0));save();const s=document.querySelector(`[data-ckt="${i}"]`);if(s)s.textContent=ckTot(q)},true);

/* ---------- the host: deal, run the queue, computer players ---------- */
let CKBOTT=null,CKBOTAT=0;const CKBOTMS=900;
const ckBotDue=g=>!!g&&(g.phase==='play'?ckWho(g).some(p=>(g.bots||{})[p]):g.phase==='roundEnd'&&g.ps.every(p=>(g.bots||{})[p]));
function ckHostTick(){if(!ckOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!ckRes2())return;if(lkqRun()){save();render();return}
  const P=act();if(P.length<2||P.length>8)return;if(!ckLinked()&&P.filter(p=>!p.bot).length>1)return;
  const g=S.ckg;if(!g||ckStale(g)){const X=CKX(),n=ckDeal({ps:P.map(p=>p.id),two:!!X.two,cons:!!X.cons,ls:!!X.ls,pow:+X.pow||0,ext:X.ext,bots:Object.fromEntries(P.filter(p=>p.bot).map(p=>[p.id,1]))});
    if(n){n.art=X.art==='family'?'family':'creatures';S.ckg=n;ckDone();save();render()}return}
  if(CKBOTT||!ckBotDue(g))return;
  CKBOTT=setTimeout(()=>{CKBOTT=null;CKBOTAT=Date.now();const g2=S.ckg;if(g2&&ckOn()&&S.started&&!S.finished&&ckRes2()&&ckBotDue(g2)){try{if(ckTick(g2,Date.now()))save()}catch(e){console.error('Cover Your Kingdom bot',e)}}render()},CKBOTMS*htSpd());CKBOTAT=Date.now()}
/* a watchdog in case a redraw never comes */
setInterval(()=>{try{if(!ckOn()||!S.started||S.finished||document.hidden||!ckRes2())return;const g=S.ckg;if(!ckBotDue(g)||CKBOTT||Date.now()-CKBOTAT<3000)return;CKBOTAT=Date.now();render()}catch(e){}},1500);
function ckSyncScorer(g){if(!g)return;S.ckrec={ext:g.o.ext,rounds:g.round,win:(g.win||[]).slice(),two:g.o.two,cons:g.o.cons,pow:g.o.pow};
  act().forEach(p=>{if(!g.ps.includes(p.id))return;p.ck={r:g.hist.map(h=>h.res[p.id].total),c:g.hist.map(h=>h.res[p.id].cards),w:g.wins[p.id]||0}});S.hr=1}

/* ---------- effects on every redraw: "your turn" buzz, nudges, the bottom padding for the action bar ---------- */
let CKWAS=false,CKCHK=null,CKNZ=null,CKSCR=null;
function ckNzToast(msg){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast cyknzt';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),5000)}
const ckBuzz=()=>{vibe([40,60,40]);try{if(typeof tsSfx==='function')tsSfx('chime')}catch(e){}};
function ckFx(){const on=S.game==='coverkingdom'&&ckOn()&&S.started&&!S.demo&&S.screen==='score';document.documentElement.classList.toggle('cykplay',on);if(!on){document.documentElement.classList.remove('cykbigb');return}
  {const t=document.querySelector('#app .tgt'),k=t&&CKF?JSON.stringify([CKF.a,CKSEL]):null;if(k&&k!==CKSCR){CKSCR=k;const r=t.getBoundingClientRect(),d=document.querySelector('#app .cykdock'),bot=d?d.getBoundingClientRect().top:innerHeight;if(r.top<60||r.bottom>bot)window.scrollBy({top:r.top-Math.max(70,(bot-r.height)/2),behavior:'smooth'})}if(!k)CKSCR=null}
  {const d=document.querySelector('#app .cykdock,#app > .actions');document.documentElement.style.setProperty('--cykpad',(d&&getComputedStyle(d).position==='fixed'?d.offsetHeight+14:24)+'px')}
  const g=ckGx();if(!g||ckStale(g)||g.phase!=='play')return;const me=ckMe(g);if(!me)return;const w=ckWho(g).includes(me);
  /* your turn starts / a challenge (or an Inn hire) waits on you: a buzz and a chime, once each */
  const t=g.turn===me;if(t&&!CKWAS)ckBuzz();CKWAS=t;
  const ck=w&&g.ch?`ch:${g.gid}:${g.round}:${g.ch.cid||'inn'}:${g.ch.plays.length}`:w&&g.fx?`fx:${g.gid}:${g.round}:${g.fx.pile}:${g.fx.hc}`:null;if(ck&&ck!==CKCHK)ckBuzz();CKCHK=ck;
  /* a nudge for me */
  const n=(g.nz||{})[me];if(n&&n.k){const k2=g.gid+':'+n.k,age=Date.now()-(+n.at||0);if(CKNZ===null){CKNZ=new Set();if(age>15000)CKNZ.add(k2)}
    if(!CKNZ.has(k2)){CKNZ.add(k2);if(age<60000&&w){ckNzToast(`🔔 ${ckName(n.by)} is waiting on ${n.w==='answer'?'your answer':n.w==='choice'?'your choice':'your turn'}`);vibe([120,60,120,60,220]);try{if(typeof tsSfx==='function')tsSfx('bell')}catch(e){}}}}}
setInterval(()=>{try{ckFx()}catch(e){}},700);
/* redraw when a nudge cooldown ends */
setInterval(()=>{try{if(S.game!=='coverkingdom')return;const now=Date.now();if([...document.querySelectorAll('#app [data-ckre]')].some(e=>+e.dataset.ckre<=now))render()}catch(e){}},500);
