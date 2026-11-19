/* ================= Cover Your Kingdom: rules engine (Grandpa Beck's rulebook, 2019/2021) =================
   Needs data.js (CK_SP, CK_SPI, CK_CLANS, CK_2P_OUT, CK_BONUS, CK_TOK_SHARED, CK_POW, CK_POWI).
   State g (plain JSON, synced between phones; only the host applies moves):
     gid, ps:[pid in seat order, clockwise = left], o:{two,cons,ls,pow,ext}, bots:{pid:1}, pw:{pid:[power ids]},
     rs (seeded random state: only the host deals, draws and makes blind takes), n (move counter), cid (clan id counter),
     round, phase:'play'|'roundEnd'|'done',
     cs:[species id of card i] (cards are integers 0..cs.length-1),
     draw:[ids] (top = last), disc:[ids] (top = last), ret:[ids] (retired pile: used hires and everything the Elves take),
     hand:{pid:[ids]}, k:{pid:{high:[clan],low:[clan],mane:[clan] (two only)}} each stack bottom→top,
       clan = {id, sp, c:[ids] (bottom→top: wilds and stand-ins first, the clan's own species on top)},
     mt:[{c:card, by, t (whose kingdom), land, up:true (upright, protects) | false (sideways, blocks)}],
     inn:[[ids] x4] (Two Rulers: the Drafty Inn; the last card of each pile is face up), innq:[pile indexes waiting to flip],
     first (who started the round), turn, acts (0-2 actions used), free:{mm:1,wkid:1} (powers used this turn),
     tried:[{id,fail}] (clans attempted this turn), idle (turns in a row nobody could act),
     ch: challenge or null  {k:'rec'|'elv'|'inn', by, tg, land, cid, sp, plays:[{p,c:[ids],n}], ans (whose answer is awaited),
                             need (count the answer must reach), hc (the Elves card), inn:[ids], piles:[idx], first (bool)}
     hy: Hypnogriff return step or null {by, from, n}
     pl: a won clan waiting for its owner to choose a land, or null {pid, clan, lands:[...]}
     fx: Drafty Inn hire flipped (Two Rulers) or null {k:'mb'|'wz'|'el', hc, pile, pick:{pid:choice|null}}
     tok:{pid:{sp:1}} constellations lit (cons option), pool:{sp:n} shared tokens at 7-8, ls:{first,open,got:[pid]} light speed,
     hist:[{res,win}], tot:{pid}, wins:{pid}, res (this round's score), win:[pid] (when done), log:[{...}] (last 60 events)
   Moves: ckMove(g,pid,mv) -> true when made (never throws). See SPEC.md for every move. */
const CK_L2=['high','low'],CK_L3=['high','low','mane'];
const ckLands=g=>g.o.two?CK_L3:CK_L2;
const ckS=(g,id)=>CK_SPI[g.cs[id]];
const ckIsClan=(g,id)=>ckS(g,id).kind==='clan',ckIsWild=(g,id)=>ckS(g,id).kind==='wild',ckIsHire=(g,id)=>ckS(g,id).kind==='hire';
const ckHas=(g,pid,pw)=>!!(g.pw&&g.pw[pid]&&g.pw[pid].includes(pw));
const ckHS=(g,pid)=>(g.o.two?7:6)+(ckHas(g,pid,'vh')?1:0);
const ckTop=(g,pid,land)=>{const s=g.k[pid]&&g.k[pid][land];return s&&s.length?s[s.length-1]:null};
const ckNClans=(g,pid)=>ckLands(g).reduce((a,l)=>a+g.k[pid][l].length,0);
const ckSeat=(g,pid)=>g.ps.indexOf(pid);
const ckNext=(g,pid,d=1)=>g.ps[(ckSeat(g,pid)+d+g.ps.length*8)%g.ps.length];
const ckBlocked=(g,pid,land)=>g.mt.some(m=>m.t===pid&&m.land===land&&!m.up);
const ckProt=(g,pid,land)=>g.mt.some(m=>m.t===pid&&m.land===land&&m.up);
const ckFailed=(g,cid)=>g.tried.some(t=>t.id===cid&&t.fail);
const ckTriedAny=(g,cid)=>g.tried.some(t=>t.id===cid);
const ckLog=(g,e)=>{g.log.push(e);if(g.log.length>60)g.log.splice(0,g.log.length-60)};
/* seeded random (mulberry32): the state carries it, so a replayed move gives the same result */
function ckRand(g){let t=(g.rs=(g.rs+0x6D2B79F5)|0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}
function ckShuf(g,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(ckRand(g)*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* the lands a species may live in for this Ruler; on their own turn a sideways Minnowtaur keeps new Clans out */
function ckLandsFor(g,pid,sp,turnBlock){const s=CK_SPI[sp];let L=g.o.two?(s.land2==='any'?CK_L3.slice():[s.land2]):(s.land==='either'?CK_L2.slice():[s.land]);
  if(turnBlock!==false&&g.turn===pid&&g.mt)L=L.filter(l=>!ckBlocked(g,pid,l));return L}
/* can this Clan switch lands when you Add to it? (Two Rulers: Pigxies only) */
const ckMovable=(g,sp)=>g.o.two?sp==='pg':CK_SPI[sp].land==='either';
/* a card that may join a Clan of species sp in a challenge (Equinity: Hentaurs act as Wilds for PegLegasi / UniqueHorns) */
function ckMatch(g,pid,id,sp){const s=ckS(g,id);if(s.kind==='wild')return true;if(s.kind!=='clan')return false;
  return s.id===sp||s.id==='he'&&(sp==='pl'||sp==='uh')&&ckHas(g,pid,'eq')}
/* how many Creatures a card counts as in a challenge (Spydra 2; SubCerbient changes CTs and Spydras) */
function ckCount(g,pid,opp,id){const s=g.cs[id];if(s==='sp')return opp&&ckHas(g,opp,'sub')?1:2;if(s==='ct')return ckHas(g,pid,'sub')?2:1;return 1}
/* a challenge play: one card counting at least `need`, or (need 2) two matching cards, no Spydra, at most one CT (Elves: two CTs allowed). Returns its count or 0 */
function ckPlayOK(g,pid,cards,need,sp,opp,elv){if(!Array.isArray(cards)||!cards.length||cards.length>2)return 0;const H=g.hand[pid];
  if(new Set(cards).size!==cards.length||cards.some(c=>!H.includes(c)||!ckMatch(g,pid,c,sp)))return 0;
  if(cards.length===1){const n=ckCount(g,pid,opp,cards[0]);return n>=need?n:0}
  if(need<2||cards.some(c=>g.cs[c]==='sp'))return 0;if(!elv&&cards.filter(c=>g.cs[c]==='ct').length>1)return 0;return 2}
const ckOut=(g,pid,ids)=>{const H=g.hand[pid];ids.forEach(id=>{const i=H.indexOf(id);if(i>=0)H.splice(i,1)})};
const ckSort=(g,C)=>{C.c=[...C.c.filter(id=>g.cs[id]!==C.sp),...C.c.filter(id=>g.cs[id]===C.sp)];return C};
const ckVal=(g,pid,id)=>g.cs[id]==='pg'&&ckHas(g,pid,'swine')?15:(ckS(g,id).v||0);
const ckClanVal=(g,pid,C)=>C.c.reduce((a,id)=>a+ckVal(g,pid,id),0);

/* ---------------- deal ---------------- */
/* o: {ps (default act()), two (Two Ruler rules, default on with 2), cons (Constellation Prizes), ls (Light Speed), pow (0/1/2 Kingdom Powers; 2 only with 2-3),
       ext:'one'|'acc2'|'acc3'|'first2', bots:{pid:1}, seed} */
function ckDeal(o={}){const ps=(o.ps||(typeof act==='function'?act().map(p=>p.id):[])).map(String);if(ps.length<2||ps.length>8||new Set(ps).size!==ps.length)return null;
  const n=ps.length,pow=[0,1,2].includes(+o.pow)?+o.pow:0;
  const g={gid:Date.now().toString(36)+Math.random().toString(36).slice(2,6),ps,
    o:{two:n===2&&o.two!==false,cons:!!o.cons,ls:!!o.cons&&!!o.ls,pow:pow===2&&n>3?1:pow,ext:['one','acc2','acc3','first2'].includes(o.ext)?o.ext:'one'},
    bots:Object.fromEntries(ps.filter(p=>o.bots&&o.bots[p]).map(p=>[p,1])),rs:(o.seed!=null?+o.seed:Math.floor(Math.random()*2**31))|0,
    n:0,cid:0,round:0,phase:'play',pw:{},hist:[],tot:{},wins:{},win:null,log:[]};
  ps.forEach(p=>{g.pw[p]=[];g.tot[p]=0;g.wins[p]=0});
  /* Kingdom Powers: shuffle and deal one each (2-3 Rulers: Extra Freatures and SubCerbient out; or one of each kind) */
  if(g.o.pow){const P=CK_POW.filter(p=>!(n<=3&&p.no23)).map(p=>p.id);
    if(g.o.pow===2){const A=ckShuf(g,P.filter(p=>CK_POWI[p].kind==='act')),M=ckShuf(g,P.filter(p=>CK_POWI[p].kind==='mod'));ps.forEach((p,i)=>g.pw[p]=[A[i],M[i]])}
    else{const D=ckShuf(g,P);ps.forEach((p,i)=>g.pw[p]=[D[i]])}}
  ckNewRound(g);return g}
function ckNewRound(g){g.round++;const two=g.o.two;g.cs=[];
  CK_SP.forEach(s=>{const k=s.count-(two&&CK_2P_OUT[s.id]||0);for(let i=0;i<k;i++)g.cs.push(s.id)});
  const deck=ckShuf(g,g.cs.map((_,i)=>i));
  Object.assign(g,{phase:'play',disc:[],ret:[],mt:[],inn:[],innq:[],ch:null,hy:null,pl:null,fx:null,hand:{},k:{},acts:0,free:{},tried:[],idle:0,res:null,
    tok:{},pool:null,ls:{first:null,open:false,got:[]}});
  g.ps.forEach(p=>{g.hand[p]=[];g.k[p]={};ckLands(g).forEach(l=>g.k[p][l]=[]);g.tok[p]={}});
  if(g.o.cons&&g.ps.length>=7)g.pool=Object.fromEntries(CK_CLANS.map(s=>[s,CK_TOK_SHARED]));
  /* hands: 6 (Two Rulers: piles of 7); VulcEnt Hands one more */
  g.ps.forEach(p=>{for(let i=0;i<(two?7:6);i++)g.hand[p].push(deck.pop())});
  if(two){for(let i=0;i<4;i++){const P=[];for(let j=0;j<7;j++)P.push(deck.pop());g.inn.push(P)}
    /* a Creature for Hire on top is shuffled back in and a new card flipped (a pile of nothing but hires keeps one on top: it can't be recruited) */
    g.inn.forEach(P=>{let guard=0;while(P.length&&ckIsHire(g,P[P.length-1])&&P.some(id=>!ckIsHire(g,id))&&guard++<50)ckShuf(g,P)})}
  g.draw=deck;g.ps.forEach(p=>{if(ckHas(g,p,'vh')&&g.draw.length)g.hand[p].push(g.draw.pop())});
  g.first=g.ps[Math.floor(ckRand(g)*g.ps.length)];ckStartTurn(g,g.first);ckLog(g,{k:'round',r:g.round,first:g.first});ckFlow(g)}

/* ---------------- turns ---------------- */
function ckStartTurn(g,pid){g.turn=pid;g.acts=0;g.free={};g.tried=[];
  /* an upright Minnowtaur is discarded at the start of its owner's next turn; Light Speed's window closes */
  g.mt=g.mt.filter(m=>{if(m.up&&m.by===pid){g.ret.push(m.c);return false}return true});
  if(g.ls.open&&g.ls.first===pid)g.ls.open=false}
/* a Ruler with no cards is skipped: their Minnowtaurs still run out */
function ckSkip(g,pid){g.mt=g.mt.filter(m=>{if(m.up&&m.by===pid||!m.up&&m.t===pid){g.ret.push(m.c);return false}return true});if(g.ls.open&&g.ls.first===pid)g.ls.open=false}
function ckEndTurn(g,dh){const pid=g.turn;
  if(dh&&dh.length){ckOut(g,pid,dh);g.disc.push(...dh);ckLog(g,{k:'dh',p:pid,n:dh.length})}
  /* a sideways Minnowtaur is discarded after the turn it blocked */
  g.mt=g.mt.filter(m=>{if(!m.up&&m.t===pid){g.ret.push(m.c);return false}return true});
  g.idle=g.acts===0&&!(dh&&dh.length)?g.idle+1:0;
  /* refill: the active Ruler first, then the others clockwise */
  for(let i=0;i<g.ps.length;i++){const p=ckNext(g,pid,i);while(g.hand[p].length<ckHS(g,p)&&g.draw.length)g.hand[p].push(g.draw.pop())}
  const holders=g.ps.filter(p=>g.hand[p].length);
  if(!holders.length||g.idle>=holders.length){ckEndRound(g);return}
  /* the crown passes left, skipping anyone out of cards */
  let q=ckNext(g,pid);for(let i=0;i<g.ps.length&&!g.hand[q].length;i++){ckSkip(g,q);q=ckNext(g,q)}
  ckStartTurn(g,q)}

/* ---------------- scoring ---------------- */
function ckBonusRow(g){const n=g.ps.length;return (CK_BONUS.find(r=>n>=r.min&&n<=r.max)||CK_BONUS[0]).b}
function ckScore(g,pid){let magic=0,cards=0;ckLands(g).forEach(l=>g.k[pid][l].forEach(C=>C.c.forEach(id=>{magic+=ckVal(g,pid,id);cards++})));
  let bonus=0;const det={};if(g.o.cons){const B=ckBonusRow(g),T=g.tok[pid];let all=true;
    ['high','either','low'].forEach(cl=>{const ok=CK_CLANS.filter(s=>CK_SPI[s].cl===cl).every(s=>T[s]);if(ok){bonus+=B[cl];det[cl]=B[cl]}else all=false});
    if(all){bonus+=B.astro;det.astro=B.astro}if(g.o.ls&&g.ls.got.includes(pid)){bonus+=B.astro;det.ls=B.astro}}
  return {magic,bonus,det,total:magic+bonus,cards}}
const ckBest=(ps,f)=>{let best=[];ps.forEach(p=>{if(!best.length)best=[p];else{const c=f(p,best[0]);if(c>0)best=[p];else if(c===0)best.push(p)}});return best};
function ckEndRound(g){g.ch=g.hy=g.pl=g.fx=null;g.innq=[];const res={};g.ps.forEach(p=>res[p]=ckScore(g,p));g.res=res;
  /* highest magic wins; a tie goes to the most Creatures; still tied = shared */
  const win=ckBest(g.ps,(a,b)=>res[a].total-res[b].total||res[a].cards-res[b].cards);
  g.hist.push({r:g.round,res,win});g.ps.forEach(p=>g.tot[p]+=res[p].total);win.forEach(p=>g.wins[p]++);ckLog(g,{k:'roundEnd',r:g.round,win});
  const E=g.o.ext,over=E==='one'||E==='acc2'&&g.round>=2||E==='acc3'&&g.round>=3||E==='first2'&&g.ps.some(p=>g.wins[p]>=2);
  if(!over){g.phase='roundEnd';return}g.phase='done';
  if(E==='one')g.win=win;
  else if(E==='first2')g.win=g.ps.filter(p=>g.wins[p]>=2);
  else{const cr=p=>g.hist.reduce((a,h)=>a+h.res[p].cards,0);g.win=ckBest(g.ps,(a,b)=>g.tot[a]-g.tot[b]||cr(a)-cr(b))}}

/* ---------------- constellations ---------------- */
function ckCons(g){if(!g.o.cons||g.phase!=='play')return;const order=g.ps.map((_,i)=>ckNext(g,g.turn,i));
  order.forEach(p=>{const T=g.tok[p];ckLands(g).forEach(l=>g.k[p][l].forEach(C=>C.c.forEach(id=>{const s=g.cs[id];if(CK_SPI[s].kind!=='clan'||T[s])return;
    if(g.pool){if(g.pool[s]>0){g.pool[s]--;T[s]=1;ckLog(g,{k:'star',p,sp:s})}}else{T[s]=1;ckLog(g,{k:'star',p,sp:s})}})));
    if(g.o.ls&&CK_CLANS.every(s=>T[s])&&!g.ls.got.includes(p)){if(!g.ls.first){g.ls.first=p;g.ls.open=true;g.ls.got=[p];ckLog(g,{k:'ls',p})}else if(g.ls.open){g.ls.got.push(p);ckLog(g,{k:'ls',p})}}})}

/* ---------------- placing a clan ---------------- */
/* a won Clan: straight in when there's one land for it, otherwise its new owner chooses (g.pl) */
function ckGive(g,pid,C){let L=ckLandsFor(g,pid,C.sp);if(!L.length)L=ckLandsFor(g,pid,C.sp,false);
  if(L.length===1){g.k[pid][L[0]].push(C);return}g.pl={pid,clan:C,lands:L}}
/* swaps and Inn hires: into the land of the same name when it fits, otherwise the land it belongs in */
function ckPut(g,pid,C,pref){const L=ckLandsFor(g,pid,C.sp,false);g.k[pid][L.includes(pref)?pref:L[0]].push(C)}

/* ---------------- challenges ---------------- */
function ckChalOpp(g,ch,pid){return pid===ch.by?ch.tg:ch.by}
/* every way the awaited Ruler can answer (counter plays), as card lists */
function ckCounters(g){const ch=g.ch;if(!ch)return [];const p=ch.ans,opp=ckChalOpp(g,ch,p),H=g.hand[p],out=[],seen=new Set(),elv=ch.k==='elv';
  const key=a=>a.map(c=>g.cs[c]).sort().join('+');
  H.forEach(c=>{const a=[c];if(ckPlayOK(g,p,a,ch.need,ch.sp,opp,elv)&&!seen.has(key(a))){seen.add(key(a));out.push(a)}});
  if(ch.need>=2)for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){const a=[H[i],H[j]];if(ckPlayOK(g,p,a,ch.need,ch.sp,opp,elv)&&!seen.has(key(a))){seen.add(key(a));out.push(a)}}
  return out}
function ckResolve(g){const ch=g.ch;g.ch=null;const played=[].concat(...ch.plays.map(x=>x.c));
  if(ch.k==='rec'){const S=g.k[ch.tg][ch.land],C=S[S.length-1],win=ch.plays[ch.plays.length-1].p;C.c.push(...played);ckSort(g,C);
    g.tried.push({id:C.id,fail:win!==ch.by});
    if(win===ch.by){S.pop();ckGive(g,ch.by,C)}ckLog(g,{k:'recDone',by:ch.by,tg:ch.tg,sp:ch.sp,win})}
  else if(ch.k==='elv'){const S=g.k[ch.tg][ch.land],C=S[S.length-1];
    if(ch.plays.length&&ch.plays[ch.plays.length-1].p===ch.tg){g.ret.push(...played,ch.hc);g.tried.push({id:C.id,fail:true});ckLog(g,{k:'elvDone',by:ch.by,tg:ch.tg,sp:ch.sp,saved:true})}
    else{S.pop();g.ret.push(...C.c,...played,ch.hc);g.tried.push({id:C.id,fail:false});ckLog(g,{k:'elvDone',by:ch.by,tg:ch.tg,sp:ch.sp,saved:false})}}
  else if(ch.k==='inn'){const win=ch.plays[ch.plays.length-1].p,C=ckSort(g,{id:++g.cid,sp:ch.sp,c:[...ch.inn,...played]});ckGive(g,win,C);g.innq.push(...ch.piles);
    ckLog(g,{k:'innDone',by:ch.by,sp:ch.sp,win})}
  ckCons(g)}

/* ---------------- the Drafty Inn (Two Rulers) ---------------- */
function ckFxOpts(g,pid,k){const r=g.ps.find(p=>p!==pid),o=[];
  ckLands(g).forEach(l=>{const S=g.k[r][l];if(k==='wz'){if(S.length>=2){o.push({land:l,dir:'down'});o.push({land:l,dir:'up'})}}else if(S.length)o.push({land:l})});return o}
function ckFxResolve(g){const F=g.fx,[a,b]=g.ps;g.fx=null;const pk=F.pick;
  if(F.k==='mb'){const take=p=>{const c=pk[p];if(c.skip)return null;const r=p===a?b:a;return {p,r,land:c.land,C:g.k[r][c.land].pop()}};const T=[take(a),take(b)].filter(Boolean);
    T.forEach(t=>ckPut(g,t.p,t.C,t.land))}
  else if(F.k==='el'){[a,b].forEach(p=>{const c=pk[p];if(c.skip)return;const r=p===a?b:a,C=g.k[r][c.land].pop();g.ret.push(...C.c)})}
  else if(F.k==='wz'){[a,b].forEach(p=>{const c=pk[p];if(c.skip)return;const r=p===a?b:a;ckWzMove(g.k[r][c.land],c.dir)})}
  const P=g.inn[F.pile];P.pop();g.ret.push(F.hc);g.innq.unshift(F.pile);ckLog(g,{k:'fxDone',h:F.k});ckCons(g)}
function ckWzMove(S,dir){if(S.length<2)return;if(dir==='down')S.unshift(S.pop());else S.push(S.shift())}
/* flip the next card of a pile: a Creature for Hire takes effect on both Rulers at once */
function ckFlip(g){const i=g.innq.shift(),P=g.inn[i];if(!P||!P.length)return;const top=P[P.length-1],s=g.cs[top];if(!ckIsHire(g,top))return;
  const [a,b]=g.ps;ckLog(g,{k:'innHire',h:s,pile:i});
  if(s==='hy'){const pick=p=>{const H=g.hand[p],t=ckShuf(g,H.slice()).slice(0,2);return t};const ta=pick(b),tb=pick(a);
    ckOut(g,b,ta);ckOut(g,a,tb);g.hand[a].push(...ta);g.hand[b].push(...tb);P.pop();g.ret.push(top);g.innq.unshift(i);return}
  if(s==='mb'||s==='wz'||s==='el'){g.fx={k:s,hc:top,pile:i,pick:{[a]:null,[b]:null}};return}
  /* a Minnowtaur can't be here (removed for Two Rulers): retire it */
  P.pop();g.ret.push(top);g.innq.unshift(i)}

/* ---------------- after every move: automatic steps ---------------- */
function ckFlow(g){for(let guard=0;guard<400&&g.phase==='play';guard++){
  if(g.ch){if(!ckCounters(g).length){ckLog(g,{k:'cant',p:g.ch.ans});ckResolve(g);continue}return}
  if(g.pl||g.hy)return;
  if(g.fx){let ch=false;g.ps.forEach(p=>{if(g.fx.pick[p]===null&&!ckFxOpts(g,p,g.fx.k).length){g.fx.pick[p]={skip:1};ch=true}});
    if(g.ps.every(p=>g.fx.pick[p]!==null)){ckFxResolve(g);continue}return}
  if(g.innq.length){ckFlip(g);continue}
  /* nothing left the active Ruler can do: their turn ends by itself */
  const L=ckLegal(g,g.turn);if(L.length&&L.every(m=>m.a==='end'&&!(m.dh&&m.dh.length))){ckEndTurn(g);continue}
  if(!L.length){ckEndTurn(g);continue}
  return}}
const ckIdle=g=>g.phase==='play'&&!g.ch&&!g.hy&&!g.pl&&!g.fx&&!g.innq.length;
/* whose input is awaited: [pid] (two at once only for a Drafty Inn hire) */
function ckWho(g){if(!g||g.phase!=='play')return [];if(g.pl)return [g.pl.pid];if(g.hy)return [g.hy.by];if(g.ch)return [g.ch.ans];
  if(g.fx)return g.ps.filter(p=>g.fx.pick[p]===null);return [g.turn]}

/* ---------------- moves ---------------- */
/* each handler checks everything first; with dry=true it stops there (ckLegal uses that) */
function ckMove(g,pid,mv){try{if(!g||!mv||typeof mv!=='object'||!g.ps||!g.ps.includes(pid))return false;const ok=ckDo(g,pid,mv,false);if(ok){g.n++;ckFlow(g)}return !!ok}
  catch(e){if(typeof CK_DEBUG!=='undefined'&&CK_DEBUG)throw e;return false}}
function ckValid(g,pid,mv){try{return !!(g&&mv&&g.ps.includes(pid)&&ckDo(g,pid,mv,true))}catch(e){if(typeof CK_DEBUG!=='undefined'&&CK_DEBUG)throw e;return false}}
const ckIds=(a,max)=>Array.isArray(a)&&a.length<=max&&a.every(x=>Number.isInteger(x))&&new Set(a).size===a.length;
function ckDo(g,pid,mv,dry){
  if(mv.a==='next'){if(g.phase!=='roundEnd')return false;if(dry)return true;ckNewRound(g);return true}
  if(g.phase!=='play')return false;
  /* sub-states first */
  if(g.pl){if(mv.a!=='place'||pid!==g.pl.pid||!g.pl.lands.includes(mv.land))return false;if(dry)return true;
    g.k[pid][mv.land].push(g.pl.clan);ckLog(g,{k:'place',p:pid,sp:g.pl.clan.sp,land:mv.land});g.pl=null;ckCons(g);return true}
  if(g.hy){if(mv.a!=='hyret'||pid!==g.hy.by)return false;const H=g.hand[pid];if(!ckIds(mv.cards,3)||mv.cards.length!==g.hy.n||mv.cards.some(c=>!H.includes(c)))return false;if(dry)return true;
    ckOut(g,pid,mv.cards);g.hand[g.hy.from].push(...mv.cards);ckLog(g,{k:'hyDone',by:pid,from:g.hy.from,n:g.hy.n});g.hy=null;return true}
  if(g.ch){const ch=g.ch;if(pid!==ch.ans)return false;
    if(mv.a==='pass'){if(dry)return true;ckLog(g,{k:'pass',p:pid});ckResolve(g);return true}
    if(mv.a!=='counter'||!ckIds(mv.cards,2))return false;const n=ckPlayOK(g,pid,mv.cards,ch.need,ch.sp,ckChalOpp(g,ch,pid),ch.k==='elv');if(!n)return false;if(dry)return true;
    ckOut(g,pid,mv.cards);ch.plays.push({p:pid,c:mv.cards.slice(),n});ckLog(g,{k:'counter',p:pid,cards:mv.cards.map(c=>g.cs[c])});
    if(ch.k==='elv'){/* Justin's ruling (Nov 18): back and forth; each answer is another sacrifice (a Spydra, or two matching / CTs) */ch.need=2;ch.ans=ckChalOpp(g,ch,pid);return true}/* Justin's ruling (Nov 18): only a Spydra (a single card counting 2) needs two to answer; a pair is answered by any single card */ch.need=mv.cards.length===2?1:n;ch.ans=ckChalOpp(g,ch,pid);return true}
  if(g.fx){if(mv.a!=='fx'||g.fx.pick[pid]!==null)return false;const o=ckFxOpts(g,pid,g.fx.k).find(x=>x.land===mv.land&&(g.fx.k!=='wz'||x.dir===mv.dir));if(!o)return false;if(dry)return true;
    g.fx.pick[pid]=Object.assign({},o);return true}
  if(g.innq.length||pid!==g.turn)return false;
  const H=g.hand[pid],act=()=>g.acts<2;
  switch(mv.a){
  case 'settle':{if(!ckIds(mv.cards,2)||mv.cards.some(c=>!H.includes(c)))return false;const all=mv.cards.slice();if(mv.disc){if(!g.disc.length)return false;all.push(g.disc[g.disc.length-1])}
    if(all.length!==2||all.some(c=>ckIsHire(g,c)))return false;const cl=all.filter(c=>ckIsClan(g,c));if(!cl.length||cl.some(c=>g.cs[c]!==g.cs[cl[0]]))return false;const sp=g.cs[cl[0]];
    if(!ckLandsFor(g,pid,sp).includes(mv.land))return false;const free=!!mv.free;if(free?!ckHas(g,pid,'mm')||g.free.mm:!act())return false;if(dry)return true;
    ckOut(g,pid,mv.cards);if(mv.disc)g.disc.pop();if(free)g.free.mm=1;else g.acts++;g.k[pid][mv.land].push(ckSort(g,{id:++g.cid,sp,c:all}));
    ckLog(g,{k:'settle',p:pid,sp,land:mv.land,disc:!!mv.disc,free});ckCons(g);return true}
  case 'recruit':{if(!act())return false;const t=mv.t,land=mv.land,c=mv.card;if(t===pid||!g.ps.includes(t)||!ckLands(g).includes(land)||!H.includes(c))return false;
    if(!ckInRange(g,pid,t)||ckNClans(g,pid)<1||ckNClans(g,t)<2||ckProt(g,t,land))return false;const C=ckTop(g,t,land);if(!C||ckFailed(g,C.id))return false;
    if(!ckMatch(g,pid,c,C.sp)||!ckLandsFor(g,pid,C.sp).length)return false;if(dry)return true;
    ckOut(g,pid,[c]);g.acts++;const n=ckCount(g,pid,t,c);g.ch={k:'rec',by:pid,tg:t,land,cid:C.id,sp:C.sp,plays:[{p:pid,c:[c],n}],ans:t,need:n,first:g.acts===1};
    ckLog(g,{k:'recruit',by:pid,tg:t,land,sp:C.sp,card:g.cs[c]});return true}
  case 'hire':return ckHire(g,pid,mv,dry);
  case 'add':{if(!act()||!H.includes(mv.card)||!ckIsClan(g,mv.card)||!ckLands(g).includes(mv.land))return false;const C=ckTop(g,pid,mv.land);if(!C||C.sp!==g.cs[mv.card])return false;
    const to=mv.to==null?mv.land:mv.to;if(to!==mv.land&&(!ckMovable(g,C.sp)||!ckLandsFor(g,pid,C.sp).includes(to)))return false;if(dry)return true;
    ckOut(g,pid,[mv.card]);g.acts++;C.c.push(mv.card);if(to!==mv.land){g.k[pid][mv.land].pop();g.k[pid][to].push(C)}ckLog(g,{k:'add',p:pid,sp:C.sp,land:to});ckCons(g);return true}
  case 'discard':{if(!act()||!H.includes(mv.card)||!ckIsClan(g,mv.card))return false;if(dry)return true;
    ckOut(g,pid,[mv.card]);g.disc.push(mv.card);g.acts++;if(g.draw.length)H.push(g.draw.pop());ckLog(g,{k:'discard',p:pid,sp:g.cs[mv.card]});return true}
  case 'inn':{if(!g.o.two||!act()||!H.includes(mv.card)||ckIsHire(g,mv.card))return false;const tk=mv.take;if(!ckIds(tk,4)||!tk.length||tk.some(i=>!(i>=0&&i<4)||!g.inn[i].length))return false;
    const tops=tk.map(i=>g.inn[i][g.inn[i].length-1]);if(tops.some(c=>ckIsHire(g,c)))return false;const cl=tops.filter(c=>ckIsClan(g,c));
    if(cl.some(c=>g.cs[c]!==g.cs[cl[0]]))return false;let sp;if(cl.length){sp=g.cs[cl[0]];if(!ckIsWild(g,mv.card)&&g.cs[mv.card]!==sp)return false}else{if(!ckIsClan(g,mv.card))return false;sp=g.cs[mv.card]}
    if(dry)return true;const r=g.ps.find(p=>p!==pid);ckOut(g,pid,[mv.card]);tk.forEach(i=>g.inn[i].pop());g.acts++;const n=ckCount(g,pid,r,mv.card);
    g.ch={k:'inn',by:pid,tg:r,sp,inn:tops,piles:tk.slice().sort(),plays:[{p:pid,c:[mv.card],n}],ans:r,need:n};ckLog(g,{k:'inn',by:pid,sp,n:tops.length,card:g.cs[mv.card]});return true}
  case 'wkid':{if(!ckHas(g,pid,'wkid')||g.free.wkid||!ckLands(g).includes(mv.land))return false;const S=g.k[pid][mv.land];if(S.length<2)return false;if(dry)return true;
    g.free.wkid=1;const a=S.pop(),b=S.pop();S.push(a,b);ckLog(g,{k:'wkid',p:pid,land:mv.land});return true}
  case 'end':{const dh=mv.dh||[];if(!ckIds(dh,2)||dh.length&&!ckHas(g,pid,'dh')||dh.some(c=>!H.includes(c)||!ckIsClan(g,c)))return false;
    if(g.acts<1&&ckHasAction(g,pid))return false;if(dry)return true;ckEndTurn(g,dh);return true}}
  return false}
/* 6-8 Rulers: Recruit only from the two Rulers on either side */
function ckInRange(g,a,b){const n=g.ps.length;if(n<6)return true;const d=(ckSeat(g,b)-ckSeat(g,a)+n)%n;return d<=2||d>=n-2}
/* hires. mv = {a:'hire', card, as (Extra Freatures: 'wz'|'mt'|'hy'), t, land, dir ('down' = top to bottom | 'up' = bottom to top), mine (Mobgoblins: your land)} */
function ckHire(g,pid,mv,dry){const H=g.hand[pid],c=mv.card;if(g.acts>=2||!H.includes(c)||!ckIsHire(g,c))return false;let h=g.cs[c];
  if(mv.as!=null&&mv.as!==h){if(!ckHas(g,pid,'xf')||!['wz','mt','hy'].includes(h)||!['wz','mt','hy'].includes(mv.as))return false;h=mv.as}
  const t=mv.t;if(!g.ps.includes(t))return false;const L=ckLands(g),done=()=>{ckOut(g,pid,[c]);g.acts++};
  if(h==='wz'){if(!L.includes(mv.land)||!['down','up'].includes(mv.dir))return false;const S=g.k[t][mv.land];if(S.length<2)return false;
    if(t!==pid&&ckProt(g,t,mv.land))return false;const mover=mv.dir==='down'?S[S.length-1]:S[0];if(ckFailed(g,mover.id))return false;if(dry)return true;
    done();ckWzMove(S,mv.dir);g.ret.push(c);ckLog(g,{k:'wz',by:pid,t,land:mv.land,dir:mv.dir});return true}
  if(h==='mt'){if(!L.includes(mv.land))return false;if(dry)return true;done();g.mt.push({c,by:pid,t,land:mv.land,up:t===pid});ckLog(g,{k:'mt',by:pid,t,land:mv.land,up:t===pid});return true}
  if(h==='hy'){if(t===pid||!g.hand[t].length)return false;if(dry)return true;done();g.ret.push(c);const n=Math.min(3,g.hand[t].length),take=ckShuf(g,g.hand[t].slice()).slice(0,n);
    ckOut(g,t,take);H.push(...take);g.hy={by:pid,from:t,n};ckLog(g,{k:'hy',by:pid,t,n});return true}
  if(h==='el'){if(!L.includes(mv.land)||ckNClans(g,t)<2||t!==pid&&ckProt(g,t,mv.land))return false;const C=ckTop(g,t,mv.land);if(!C||ckTriedAny(g,C.id))return false;if(dry)return true;
    done();g.ch={k:'elv',by:pid,tg:t,land:mv.land,cid:C.id,sp:C.sp,plays:[],ans:t,need:2,hc:c};ckLog(g,{k:'elves',by:pid,t,land:mv.land,sp:C.sp});return true}
  if(h==='mb'){if(t===pid||!L.includes(mv.land)||!L.includes(mv.mine)||ckProt(g,t,mv.land))return false;const A=ckTop(g,pid,mv.mine),B=ckTop(g,t,mv.land);if(!A||!B||ckFailed(g,B.id))return false;if(dry)return true;
    done();g.ret.push(c);g.k[pid][mv.mine].pop();g.k[t][mv.land].pop();ckPut(g,t,A,mv.mine);ckPut(g,pid,B,mv.land);ckLog(g,{k:'mb',by:pid,t,mine:mv.mine,land:mv.land,got:B.sp,gave:A.sp});ckCons(g);return true}
  return false}

/* ---------------- legal moves ---------------- */
/* one representative card per species (moves that differ only by an identical card are listed once) */
function ckReps(g,ids,f){const seen={},o=[];ids.forEach(id=>{const s=g.cs[id];if(!seen[s]&&(!f||f(id))){seen[s]=1;o.push(id)}});return o}
function ckCands(g,pid,onlyActions){const o=[],H=g.hand[pid]||[],L=ckLands(g),R=ckReps(g,H);
  if(g.phase==='roundEnd')return [{a:'next'}];if(g.phase!=='play')return o;
  if(g.pl){g.pl.lands.forEach(l=>o.push({a:'place',land:l}));return o}
  if(g.hy){const n=g.hy.n,seen=new Set();const rec=(start,pick)=>{if(pick.length===n){const k=pick.map(c=>g.cs[c]).sort().join();if(!seen.has(k)){seen.add(k);o.push({a:'hyret',cards:pick.slice()})}return}
      for(let i=start;i<H.length;i++){pick.push(H[i]);rec(i+1,pick);pick.pop()}};rec(0,[]);return o}
  if(g.ch){o.push({a:'pass'});if(g.ch.ans===pid)ckCounters(g).forEach(c=>o.push({a:'counter',cards:c}));return o}
  if(g.fx){if(g.fx.pick[pid]===null)ckFxOpts(g,pid,g.fx.k).forEach(x=>o.push(Object.assign({a:'fx'},x)));return o}
  /* settle */
  for(let i=0;i<R.length;i++){const a=R[i];const pairs=[];
    const j=H.find(c=>c!==a&&g.cs[c]===g.cs[a]);if(j!=null)pairs.push([a,j]);
    R.forEach(b=>{if(b!==a&&g.cs[b]!==g.cs[a]&&ckIsWild(g,a)!==ckIsWild(g,b)&&ckIsWild(g,a))pairs.push([a,b])});
    pairs.forEach(cards=>L.forEach(land=>{o.push({a:'settle',cards,land});o.push({a:'settle',cards,land,free:true})}));
    L.forEach(land=>{o.push({a:'settle',cards:[a],disc:true,land});o.push({a:'settle',cards:[a],disc:true,land,free:true})})}
  g.ps.forEach(t=>{if(t===pid)return;L.forEach(land=>R.forEach(c=>o.push({a:'recruit',t,land,card:c})))});
  L.forEach(land=>{R.forEach(c=>{o.push({a:'add',card:c,land});L.forEach(to=>{if(to!==land)o.push({a:'add',card:c,land,to})})})});
  R.forEach(c=>o.push({a:'discard',card:c}));
  if(g.o.two){const subs=[];for(let m=1;m<16;m++)subs.push([0,1,2,3].filter(i=>m>>i&1));subs.forEach(take=>R.forEach(c=>o.push({a:'inn',take,card:c})))}
  R.filter(c=>ckIsHire(g,c)).forEach(c=>{const hs=ckHas(g,pid,'xf')&&['wz','mt','hy'].includes(g.cs[c])?['wz','mt','hy']:[g.cs[c]];
    hs.forEach(h=>{const as=h===g.cs[c]?{}:{as:h};g.ps.forEach(t=>{
      if(h==='wz')L.forEach(land=>['down','up'].forEach(dir=>o.push(Object.assign({a:'hire',card:c,t,land,dir},as))));
      else if(h==='mt'||h==='el')L.forEach(land=>o.push(Object.assign({a:'hire',card:c,t,land},as)));
      else if(h==='hy')o.push(Object.assign({a:'hire',card:c,t},as));
      else if(h==='mb')L.forEach(land=>L.forEach(mine=>o.push({a:'hire',card:c,t,land,mine})))})})});
  if(onlyActions)return o;
  L.forEach(land=>o.push({a:'wkid',land}));
  o.push({a:'end'});if(ckHas(g,pid,'dh')){const C=ckReps(g,H,c=>ckIsClan(g,c));C.forEach(c=>o.push({a:'end',dh:[c]}));
    for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)o.push({a:'end',dh:[C[i],C[j]]});
    C.forEach(c=>{const d=H.find(x=>x!==c&&g.cs[x]===g.cs[c]);if(d!=null)o.push({a:'end',dh:[c,d]})})}
  return o}
/* can this Ruler still take an action (Settle / Recruit / Hire / Add / Discard / Inn)? */
function ckHasAction(g,pid){if(g.acts>=2)return false;return ckCands(g,pid,true).some(m=>!m.free&&ckDo(g,pid,m,true))}
function ckLegal(g,pid){if(!g||!g.ps||!g.ps.includes(pid))return [];return ckCands(g,pid,false).filter(m=>ckDo(g,pid,m,true))}

/* ---------------- host: bots ---------------- */
/* call on the host every so often; makes one bot move when a bot's answer is awaited. Returns true when something changed */
function ckTick(g,now){if(!g||!g.bots)return false;if(g.phase==='roundEnd'&&g.ps.every(p=>g.bots[p]))return ckMove(g,g.ps[0],{a:'next'});
  for(const p of ckWho(g)){if(!g.bots[p])continue;const mv=typeof ckBot==='function'?ckBot(g,p):null;if(mv&&ckMove(g,p,mv))return true;
    const L=ckLegal(g,p);if(L.length&&ckMove(g,p,L[0]))return true}
  return false}
const ckStale=g=>{if(typeof act!=='function')return false;const ids=act().map(p=>p.id);return !g||!g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
