/* ================= Wingspan on the phone (base game) ================= */
/* food: i invertebrate, s seed, f fish, r rodent, u fruit. Habitats: f forest, g grassland, w wetland.
   The game runs as a queue of steps (g.q); a step that needs a choice sets g.ask and waits for wpMove. Everything is plain JSON so linked phones can share it. */
const WPF=['i','s','f','r','u'],WPFN={i:'invertebrate',s:'seed',f:'fish',r:'rodent',u:'fruit'},WPFI={i:'🐛',s:'🌾',f:'🐟',r:'🐭',u:'🍒'};
const WPH=['f','g','w'],WPHN={f:'forest',g:'grassland',w:'wetland'},WPHI={f:'🌲',g:'🌾',w:'💧'};
const WPDIE=['i','s','f','r','u','is'];/* the 6 faces of a feeder die; 'is' = invertebrate or seed */
const WPCUBES=[8,7,6,5],WPEGGCOST=[0,1,1,2,2];
/* the player mat: what each column of each habitat gives (index = birds already there), and whether that space has the optional extra */
const WPROW={f:[1,1,2,2,3,3],g:[2,2,3,3,4,4],w:[1,1,2,2,3,3]},WPOPT=[0,1,0,1,0,1];
const wpOn=()=>S.game==='wingspan'&&!!WSX().play;
const wpG=()=>S.wpg||null;
const wpRes=()=>!S.lk||S.demo||lkHost();
const wpShuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wpB=b=>WSB[b];
const wpRollDie=()=>WPDIE[Math.floor(Math.random()*6)];
const wpStale=g=>{const ids=act().map(p=>p.id);return !g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
const wpSlots=(g,pid)=>{const M=g.mat[pid],o=[];WPH.forEach(h=>M[h].forEach((x,i)=>o.push([h,i,x])));return o};
const wpKey=(h,i)=>h+i,wpAt=(g,pid,k)=>g.mat[pid][k[0]][+k.slice(1)];
const wpNestOk=(b,n)=>!n||wpB(b).nest===n||wpB(b).nest==='star';
const wpRoom=x=>x.e<wpB(x.b).egg;
const wpFoodN=(g,pid)=>WPF.reduce((a,f)=>a+g.food[pid][f],0);

/* ---------- setup ---------- */
function wpDeal(){const P=act(),ps=P.map(p=>p.id),X=WSX();
  const base=WSB.map((b,i)=>i).filter(i=>!WSB[i].swift||X.swift);const deck=wpShuf(base.slice());const bdeck=wpShuf(WSBON.map(b=>b.id));
  const tiles={};WSGOAL.forEach(G=>(tiles[G.tile]||(tiles[G.tile]=[])).push(G.id));const goals=wpShuf(Object.keys(tiles)).slice(0,4).map(t=>{const L=tiles[t];return L[Math.floor(Math.random()*L.length)]});
  const g={_atom:1,id:String(Math.random()).slice(2,10),ps,fp:ps[0],turn:ps[0],rnd:0,phase:'setup',deck,disc:[],tray:[],bdeck,bdisc:[],fd:[],goals,side:X.side||'place',
    hand:{},bon:{},food:{},mat:{},cubes:{},used:{},pk:{},gc:[],gp:{},offer:{},q:[],ask:null,last:null,lg:[],n:0,tno:0,stat:{}};
  for(let i=0;i<5;i++)g.fd.push(wpRollDie());for(let i=0;i<3;i++)g.tray.push(g.deck.pop());
  ps.forEach(p=>{g.hand[p]=[];g.bon[p]=[];g.food[p]={i:1,s:1,f:1,r:1,u:1};g.mat[p]={f:[],g:[],w:[]};g.cubes[p]=WPCUBES[0];g.used[p]={};g.pk[p]={};g.gp[p]=0;
    g.offer[p]={b:g.deck.splice(-5),bo:g.bdeck.splice(-2)};g.stat[p]={play:0,food:0,eggs:0,cards:0}});
  S.wpg=g;gAnn(g,'Wingspan',`${P.length} players. Everyone keeps up to 5 birds, giving back 1 food for each, and 1 of 2 bonus cards.`,'🐦');gLog(g,`Wingspan: ${P.length} players, round goals: ${goals.map(id=>wpGoal(id).say).join(' · ')}`,'🐦');return g}
const wpGoal=id=>WSGOAL.find(x=>x.id===id),wpBon=id=>WSBON.find(x=>x.id===id);
/* setup choice: keep these birds (offer positions), these foods (count = 5 − birds kept... any food you keep), one bonus card */
function wpSetup(g,pid,keep,food,bo){if(g.phase!=='setup'||!g.offer[pid])return false;const O=g.offer[pid];keep=[...new Set((keep||[]).map(Number))].filter(i=>i>=0&&i<O.b.length);food=(food||[]).filter(f=>WPF.includes(f));
  if(keep.length+food.length!==5||new Set(food).size!==food.length||!O.bo.includes(bo))return false;
  g.hand[pid]=keep.map(i=>O.b[i]);g.disc.push(...O.b.filter((b,i)=>!keep.includes(i)));g.food[pid]=Object.fromEntries(WPF.map(f=>[f,food.includes(f)?1:0]));g.bon[pid]=[bo];g.bdisc.push(...O.bo.filter(x=>x!==bo));delete g.offer[pid];
  gLog(g,`${nmid(pid)} keeps ${keep.length} bird${keep.length===1?'':'s'} and ${food.length} food`,'🐦');
  if(!g.ps.some(p=>g.offer[p])){g.phase='play';gAnn(g,'Round 1',`${nmid(g.turn)} goes first. Each player has 8 actions this round.`,'🐦')}g.n++;return true}

/* ---------- the actor and the queue ---------- */
const wpActor=g=>!g||g.phase==='done'?null:g.phase==='setup'?(g.ps.find(p=>g.offer[p])||null):g.ask?g.ask.pid:g.turn;
const wpWaits=(g,pid)=>g.phase==='setup'?!!g.offer[pid]:wpActor(g)===pid;
function wpRun(g){let guard=0;while(g.q.length&&guard++<500){const s=g.q[0];const done=WPS[s.t](g,s);if(!done)return;g.ask=null;g.q.shift()}if(guard>=500)console.error('Wingspan: step loop')}
/* a move: either an answer to the current question, or (start of a turn) one of the four actions */
function wpMove(g,pid,mv){if(!g||g.phase!=='play'||!mv)return false;
  if(g.ask){if(g.ask.pid!==pid)return false;const s=g.q[0];if(!s)return false;const ok=WPS[s.t](g,s,mv);if(ok===null)return false;if(ok){g.ask=null;g.q.shift()}wpRun(g);g.n++;return true}
  if(g.q.length||g.turn!==pid||!(g.cubes[pid]>0))return false;return wpAction(g,pid,mv.a)}
const wpAsk=(g,s,t,o={})=>{g.ask={pid:s.pid,t,...o};return false};

/* ---------- the four actions ---------- */
function wpCanPlayAny(g,pid,hab){return g.hand[pid].some(b=>wpPlayHabs(g,pid,b,hab).length&&wpPay(g,pid,b))}
function wpAction(g,pid,a){const M=g.mat[pid];g.last={p:pid,t:a};g.tg={};
  if(a==='play'){if(!wpCanPlayAny(g,pid))return false;g.q.push({t:'play',pid,act:1})}
  else if(a==='food'||a==='eggs'||a==='cards'){const h=a==='food'?'f':a==='eggs'?'g':'w',c=M[h].length,n=WPROW[h][c];
    if(a==='eggs'&&!wpSlots(g,pid).some(([,,x])=>wpRoom(x)))return false;
    if(WPOPT[c])g.q.push({t:'opt',pid,h});g.q.push(a==='food'?{t:'food',pid,n,act:1}:a==='eggs'?{t:'eggs',pid,n,act:1}:{t:'cards',pid,n,act:1});
    if(a==='eggs')wpPinkLay(g,pid);
    for(let i=M[h].length-1;i>=0;i--)if(wpB(M[h][i].b).col==='brown')g.q.push({t:'pow',pid,k:wpKey(h,i),why:'brown'});g.stat[pid][a]++;
    gLog(g,`${nmid(pid)} ${a==='food'?'gains food':a==='eggs'?'lays eggs':'draws cards'} (${n})`,a==='food'?'🌰':a==='eggs'?'🥚':'🃏')}
  else return false;
  g.q.push({t:'end',pid});g.cubes[pid]--;wpRun(g);g.n++;return true}

/* ---------- steps ---------- */
const WPS={};
/* the optional extra on a mat space: forest discard 1 card → +1 food; grassland discard 1 food → +1 egg; wetland discard 1 egg → +1 card */
WPS.opt=(g,s,mv)=>{const nx=g.q[1],can=s.h==='f'?g.hand[s.pid].length>0:s.h==='g'?wpFoodN(g,s.pid)>0:wpSlots(g,s.pid).some(([,,x])=>x.e>0);if(!can)return true;
  if(!mv)return wpAsk(g,s,'opt',{h:s.h});if(mv.skip)return true;
  if(s.h==='f'){const i=+mv.c;if(!(i>=0&&i<g.hand[s.pid].length))return null;g.disc.push(...g.hand[s.pid].splice(i,1))}
  else if(s.h==='g'){if(!(g.food[s.pid][mv.f]>0))return null;g.food[s.pid][mv.f]--}
  else{const x=mv.k&&wpAt(g,s.pid,mv.k);if(!x||!x.e)return null;x.e--}
  if(nx)nx.n++;return true};
/* gain n dice from the feeder (filter: only these foods; cache: put them on that bird instead) */
WPS.food=(g,s,mv)=>{if(!(s.n>0))return true;
  if(!g.fd.length){g.fd=Array.from({length:5},wpRollDie);gLog(g,'The bird feeder is empty and is refilled','🎲')}
  const ok=i=>{const d=g.fd[i];return !s.filter||s.filter.some(f=>d===f||d==='is'&&(f==='i'||f==='s'))},opts=g.fd.map((d,i)=>i).filter(ok),same=g.fd.every(d=>d===g.fd[0]);
  if(!opts.length&&!same){wpPinkGain(g,s);return true}
  if(!mv)return wpAsk(g,s,'die',{opts,re:same,n:s.n,filter:s.filter||null,cache:s.cache||null,opt:!!s.opt||!opts.length});
  if(mv.re){if(!same)return null;g.fd=Array.from({length:5},wpRollDie);gLog(g,`${nmid(s.pid)} rerolls the bird feeder`,'🎲');return false||wpAskAgain(g,s)}
  if(mv.skip&&(s.opt||!opts.length))return true;
  const i=+mv.d;if(!opts.includes(i))return null;let f=g.fd[i];if(f==='is'){f=mv.f==='s'?'s':'i';if(s.filter&&!s.filter.includes(f))f=s.filter.find(x=>x==='i'||x==='s')}
  g.fd.splice(i,1);if(s.cache&&mv.cache!==false){const x=wpAt(g,s.pid,s.cache);if(x){x.c=(x.c||0)+1}else g.food[s.pid][f]++}else g.food[s.pid][f]++;
  if(s.act){g.tg[f]=(g.tg[f]||0)+1}gLog(g,`${nmid(s.pid)} takes ${WPFI[f]} ${WPFN[f]}${s.cache&&mv.cache!==false?' (cached)':''}`,'🌰');
  s.n--;if(s.n>0)return wpAskAgain(g,s);wpPinkGain(g,s);return true};
const wpAskAgain=(g,s)=>{const r=WPS[s.t](g,s);return r};
/* lay n eggs (nest: only on that nest; only: just this bird; not: not this bird) */
WPS.eggs=(g,s,mv)=>{if(!(s.n>0))return true;const opts=wpSlots(g,s.pid).filter(([h,i,x])=>wpRoom(x)&&wpNestOk(x.b,s.nest)&&(!s.only||wpKey(h,i)===s.only)&&(!s.not||wpKey(h,i)!==s.not)&&!(s.diff&&(s.done||[]).includes(wpKey(h,i)))).map(([h,i])=>wpKey(h,i));
  if(!opts.length)return true;if(opts.length===1&&s.only){wpAt(g,s.pid,opts[0]).e++;s.n--;return s.n>0?wpAskAgain(g,s):true}
  if(!mv)return wpAsk(g,s,'egg',{opts,n:s.n,opt:!!s.opt});if(mv.skip){if(!s.opt&&opts.length)return null;return true}
  if(!opts.includes(mv.k))return null;wpAt(g,s.pid,mv.k).e++;(s.done||(s.done=[])).push(mv.k);s.n--;if(s.act)g.stat[s.pid].laid=(g.stat[s.pid].laid||0)+1;return s.n>0?wpAskAgain(g,s):true};
/* draw n cards, from the tray or the deck (deck: deck only) */
WPS.cards=(g,s,mv)=>{if(!(s.n>0))return true;if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}
  const tr=s.deck?[]:g.tray.map((b,i)=>b!=null?i:-1).filter(i=>i>=0);if(!tr.length&&!g.deck.length)return true;
  if(!mv&&!tr.length){g.hand[s.pid].push(g.deck.pop());s.n--;return s.n>0?wpAskAgain(g,s):true}
  if(!mv)return wpAsk(g,s,'card',{tray:tr,deck:g.deck.length>0,n:s.n});
  if(mv.c==='deck'){if(!g.deck.length)return null;g.hand[s.pid].push(g.deck.pop())}else{const i=+mv.c;if(!tr.includes(i))return null;g.hand[s.pid].push(g.tray[i]);g.tray[i]=null}
  s.n--;return s.n>0?wpAskAgain(g,s):true};
/* play a bird from your hand: choose bird and habitat; food is paid automatically (cheapest way), eggs from the birds you choose */
function wpPlayHabs(g,pid,b,only){return WPH.filter(h=>wpB(b).hab.includes(h)&&(!only||only===h)&&g.mat[pid][h].length<5&&WPEGGCOST[g.mat[pid][h].length]<=wpSlots(g,pid).reduce((a,[,,x])=>a+x.e,0))}
/* food payment: exact food first, "or" costs pick what you have most of, wild from your most plentiful, and any 2 food stand in for 1 */
function wpPay(g,pid,b){const B=wpB(b),F={...g.food[pid]},pay={};const take=(f,n=1)=>{F[f]-=n;pay[f]=(pay[f]||0)+n};const need=[];
  if(B.or){const L=Object.keys(B.cost).filter(f=>F[f]>0).sort((a,b)=>F[b]-F[a]);if(L.length)take(L[0]);else need.push(1)}else for(const f in B.cost){for(let k=0;k<B.cost[f];k++){if(F[f]>0)take(f);else need.push(1)}}
  for(let k=0;k<(B.wild||0);k++){const L=WPF.filter(f=>F[f]>0).sort((a,b)=>F[b]-F[a]);if(L.length)take(L[0]);else need.push(1)}
  for(const _ of need){const L=WPF.filter(f=>F[f]>0).sort((a,b)=>F[b]-F[a]),tot=L.reduce((a,f)=>a+F[f],0);if(tot<2)return null;take(L[0]);const L2=WPF.filter(f=>F[f]>0).sort((a,b)=>F[b]-F[a]);take(L2[0])}
  return pay}
WPS.play=(g,s,mv)=>{const opts=g.hand[s.pid].map((b,i)=>({i,habs:wpPlayHabs(g,s.pid,b,s.hab==='same'?s.sh:s.hab)})).filter(o=>o.habs.length&&wpPay(g,s.pid,g.hand[s.pid][o.i]));
  if(!opts.length)return true;if(!mv)return wpAsk(g,s,'play',{opts,opt:!!s.opt});if(mv.skip){if(!s.opt)return null;return true}
  const o=opts.find(x=>x.i===+mv.i);if(!o||!o.habs.includes(mv.h))return null;const b=g.hand[s.pid][o.i],B=wpB(b),pay=wpPay(g,s.pid,b),col=g.mat[s.pid][mv.h].length,ec=WPEGGCOST[col];
  for(const f in pay)g.food[s.pid][f]-=pay[f];g.hand[s.pid].splice(o.i,1);g.mat[s.pid][mv.h].push({b,e:0,c:0,t:0});const k=wpKey(mv.h,col);g.stat[s.pid].play++;
  g.last={p:s.pid,t:'play',b,h:mv.h};gLog(g,`${nmid(s.pid)} plays ${B.n} in the ${WPHN[mv.h]}${Object.keys(pay).length?` (${Object.entries(pay).map(([f,n])=>WPFI[f].repeat(n)).join('')})`:''}${ec?`, ${ec} egg${ec>1?'s':''}`:''}`,'🐦');
  const add=[];if(ec)add.push({t:'payEgg',pid:s.pid,n:ec,not:k});if(B.col==='white'&&B.pw)add.push({t:'pow',pid:s.pid,k,why:'white'});g.q.splice(1,0,...add,...wpPinkPlay(g,s.pid,mv.h));return true};
WPS.payEgg=(g,s,mv)=>{if(!(s.n>0))return true;const opts=wpSlots(g,s.pid).filter(([h,i,x])=>x.e>0&&wpKey(h,i)!==s.not).map(([h,i])=>wpKey(h,i));if(!opts.length)return true;
  if(opts.length===1&&wpAt(g,s.pid,opts[0]).e>=s.n){wpAt(g,s.pid,opts[0]).e-=s.n;return true}
  if(!mv)return wpAsk(g,s,'payEgg',{opts,n:s.n});if(!opts.includes(mv.k))return null;wpAt(g,s.pid,mv.k).e--;s.n--;return s.n>0?wpAskAgain(g,s):true};
/* end of turn: discards owed, refill the tray, next player or end of round */
WPS.end=(g,s)=>{const d=g.owe&&g.owe[s.pid];if(d){g.q.splice(1,0,{t:'disc',pid:s.pid,n:d});delete g.owe[s.pid];g.q.splice(2,0,{t:'end',pid:s.pid,again:1});return true}
  if(!s.again){}for(let i=0;i<3;i++)if(g.tray[i]==null){if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}g.tray[i]=g.deck.pop()??null}
  g.tno++;g.ask=null;const nx=wpNext(g,s.pid);if(nx==null){wpRoundEnd(g)}else{g.turn=nx;g.pk[nx]={}}return true};
WPS.disc=(g,s,mv)=>{if(!(s.n>0)||!g.hand[s.pid].length)return true;if(!mv)return wpAsk(g,s,'disc',{n:s.n});const i=+mv.c;if(!(i>=0&&i<g.hand[s.pid].length))return null;g.disc.push(...g.hand[s.pid].splice(i,1));s.n--;return s.n>0?wpAskAgain(g,s):true};
function wpNext(g,pid){const L=g.ps;for(let k=1;k<=L.length;k++){const q=L[(L.indexOf(pid)+k)%L.length];if(g.cubes[q]>0)return q}return null}
/* end of a round: score the goal, clear the tray, the next player starts */
function wpRoundEnd(g){const G=wpGoal(g.goals[g.rnd]),c={};g.ps.forEach(p=>c[p]=wpGoalCount(g,p,G));g.gc[g.rnd]=c;
  const pts=wpGoalPts(g,g.rnd);g.ps.forEach(p=>g.gp[p]+=pts[p]);gLog(g,`Round ${g.rnd+1} goal (${G.say}): ${g.ps.map(p=>`${nmid(p)} ${c[p]} → ${pts[p]}`).join(', ')}`,'🎯',1);
  if(g.rnd===3)return wpEnd(g);g.rnd++;g.disc.push(...g.tray.filter(b=>b!=null));g.tray=[];for(let i=0;i<3;i++){if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}g.tray.push(g.deck.pop()??null)}
  g.ps.forEach(p=>{g.cubes[p]=WPCUBES[g.rnd];g.pk[p]={}});g.fp=g.ps[(g.ps.indexOf(g.fp)+1)%g.ps.length];g.turn=g.fp;
  gAnn(g,`Round ${g.rnd+1}`,`Goal scored: ${G.say}. ${nmid(g.turn)} starts; ${WPCUBES[g.rnd]} actions each this round.`,'🎯')}
function wpGoalCount(g,p,G){const S2=wpSlots(g,p),eggs=x=>x.e;switch(G.k){
  case 'birdsHab':return g.mat[p][G.hab].length;
  case 'eggsHab':return g.mat[p][G.hab].reduce((a,x)=>a+x.e,0);
  case 'eggsNest':return S2.filter(([,,x])=>wpNestOk(x.b,G.nest)).reduce((a,[,,x])=>a+x.e,0);
  case 'birdsNestEgg':return S2.filter(([,,x])=>x.e>0&&wpNestOk(x.b,G.nest)).length;
  case 'birdsTotal':return S2.length;
  case 'sets':return Math.min(...WPH.map(h=>g.mat[p][h].reduce((a,x)=>a+x.e,0)));
  default:return wpGoalX(g,p,G)}}
function wpGoalPts(g,r){const c=g.gc[r],out={};g.ps.forEach(p=>out[p]=0);if(g.side==='count'){g.ps.forEach(p=>out[p]=Math.min(5,c[p]));return out}
  const T=[[4,1,0],[5,2,1],[6,3,2],[7,4,3]][r],L=g.ps.filter(p=>c[p]>0).sort((a,b)=>c[b]-c[a]);let pos=0;while(pos<L.length&&pos<3){const v=c[L[pos]],tied=L.filter(p=>c[p]===v);let s=0;for(let i=pos;i<pos+tied.length;i++)s+=T[i]||0;tied.forEach(p=>out[p]=Math.floor(s/tied.length));pos+=tied.length}return out}
/* ---------- bonus cards ---------- */
function wpBonusCount(g,p,id){const B=wpBon(id),birds=wpSlots(g,p),t=B.test;return wpBonTest(g,p,t,birds)}
function wpBonusPts(g,p,id){const B=wpBon(id),n=wpBonusCount(g,p,id),sc=B.score;if(sc.per)return n*sc.per;let v=0;(sc.tiers||[]).forEach(([m,pt])=>{if(n>=m)v=pt});return v}
/* ---------- the end ---------- */
function wpEnd(g){g.phase='done';g.q=[];g.ask=null;g.fin={};g.ps.forEach(p=>{const B=wpSlots(g,p),F={birds:B.reduce((a,[,,x])=>a+wpB(x.b).pts,0),bonus:g.bon[p].reduce((a,id)=>a+wpBonusPts(g,p,id),0),goals:g.gp[p],eggs:B.reduce((a,[,,x])=>a+x.e,0),food:B.reduce((a,[,,x])=>a+(x.c||0),0),tuck:B.reduce((a,[,,x])=>a+(x.t||0),0),left:wpFoodN(g,p)};
  F.tot=F.birds+F.bonus+F.goals+F.eggs+F.food+F.tuck;F.bon=g.bon[p].map(id=>({id,n:wpBonusCount(g,p,id),v:wpBonusPts(g,p,id)}));g.fin[p]=F});
  const P=act().slice().sort((a,b)=>g.fin[b.id].tot-g.fin[a.id].tot||g.fin[b.id].left-g.fin[a.id].left);gAnn(g,'🏆 Game over',P.map(p=>`${nm(p)} ${g.fin[p.id].tot}`).join(' · '),'🏆');gLog(g,'Round 4 is over: final scoring','🏁',1);g.n++;return true}
/* the score pad (Finish & reveal) */
function wpSyncScorer(g){if(!g||!g.fin)return;const X=WSX();X.side=g.side;act().forEach(p=>{const F=g.fin[p.id];if(!F)return;p.ws={g:[0,1,2,3].map(r=>g.gc[r]?g.gc[r][p.id]:0),f:{birds:F.birds,bonus:F.bonus,eggs:F.eggs,food:F.food,tuck:F.tuck,left:F.left}}});S.hr=4}

/* ---------- powers ---------- */
WPS.pow=(g,s,mv)=>{const x=wpAt(g,s.pid,s.k);if(!x)return true;const B=wpB(x.b),P=s.pw||B.pw;if(!P)return true;const fn=WPP[P.k];if(!fn){console.warn('Wingspan: no power',P.k);return true}
  if(!s.logged){s.logged=1;gLog(g,`${nmid(s.pid)}: ${B.n} – ${B.say||P.k}`,s.why==='pink'?'💗':s.why==='white'?'⚪':'🟤')}return fn(g,s,P,x,mv)};
const wpIns=(g,...st)=>{g.q.splice(1,0,...st)};
const wpOthers=(g,pid)=>{const L=g.ps,i=L.indexOf(pid);return L.slice(i+1).concat(L.slice(0,i))};
const WPP={};
WPP.feeder=(g,s,P)=>{wpIns(g,{t:'food',pid:s.pid,n:1,filter:P.food||null,cache:P.cache?s.k:null,opt:1});return true};
WPP.feederAll=(g,s,P)=>{let n=0;g.fd=g.fd.filter(d=>{if(d===P.food||d==='is'&&(P.food==='i'||P.food==='s')){n++;return false}return true});g.food[s.pid][P.food]+=n;gLog(g,`${nmid(s.pid)} takes ${n} ${WPFN[P.food]} from the feeder`,'🌰');return true};
WPP.supply=(g,s,P)=>{g.food[s.pid][P.food]+=P.n||1;return true};
WPP.allSupply=(g,s,P)=>{g.ps.forEach(p=>g.food[p][P.food]++);return true};
WPP.eachDie=(g,s)=>{wpIns(g,...[s.pid,...wpOthers(g,s.pid)].map(p=>({t:'food',pid:p,n:1,opt:1})));return true};
WPP.cache=(g,s,P,x)=>{x.c=(x.c||0)+1;return true};
WPP.huntDice=(g,s,P,x)=>{const k=5-g.fd.length,roll=Array.from({length:k},wpRollDie),hit=roll.some(d=>d===P.food||d==='is'&&(P.food==='i'||P.food==='s'));g.last={...(g.last||{}),roll};
  gLog(g,`${nmid(s.pid)} rolls ${k} dice: ${roll.map(d=>d==='is'?'🐛/🌾':WPFI[d]).join(' ')}${hit?` — caches ${WPFI[P.food]}`:' — no luck'}`,'🎲');if(hit){x.c=(x.c||0)+1;wpPinkPred(g,s.pid)}return true};
WPP.huntCard=(g,s,P,x)=>{if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}const b=g.deck.pop();if(b==null)return true;const ok=wpB(b).ws<P.ws;
  gLog(g,`${nmid(s.pid)} looks at ${wpB(b).n} (${wpB(b).ws} cm)${ok?': tucked':': discarded'}`,'🦅');if(ok){x.t=(x.t||0)+1;wpPinkPred(g,s.pid)}else g.disc.push(b);return true};
WPP.tuck=(g,s,P,x,mv)=>{if(!g.hand[s.pid].length)return true;if(!mv)return wpAsk(g,s,'tuck',{then:P.then,food:P.food||null});if(mv.skip)return true;const i=+mv.c;if(!(i>=0&&i<g.hand[s.pid].length))return null;
  g.hand[s.pid].splice(i,1);x.t=(x.t||0)+1;if(P.then==='draw')wpIns(g,{t:'cards',pid:s.pid,n:1,deck:1});else if(P.then==='egg'){if(wpRoom(x))x.e++}else if(P.then==='layAny')wpIns(g,{t:'eggs',pid:s.pid,n:1});
  else if(P.then==='food'){const f=P.food&&P.food.length===1?P.food[0]:(P.food||[]).includes(mv.f)?mv.f:(P.food||['s'])[0];g.food[s.pid][f]++}return true};
WPP.discardFoodTuck=(g,s,P,x,mv)=>{if(!(g.food[s.pid][P.food]>0))return true;if(!mv)return wpAsk(g,s,'yes',{q:`Discard 1 ${WPFN[P.food]} to tuck 2 cards from the deck?`});if(!mv.yes)return true;
  g.food[s.pid][P.food]--;for(let k=0;k<2;k++){if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}if(g.deck.length){g.deck.pop();x.t=(x.t||0)+1}}return true};
WPP.eggForFood=(g,s,P,x,mv)=>{const opts=wpSlots(g,s.pid).filter(([h,i,y])=>y.e>0&&wpKey(h,i)!==s.k).map(([h,i])=>wpKey(h,i));if(!opts.length)return true;
  if(!mv)return wpAsk(g,s,'eggFood',{opts,n:P.n||1});if(mv.skip)return true;if(!opts.includes(mv.k))return null;const fs=(mv.fs||[]).filter(f=>WPF.includes(f)).slice(0,P.n||1);if(fs.length!==(P.n||1))return null;
  wpAt(g,s.pid,mv.k).e--;fs.forEach(f=>g.food[s.pid][f]++);return true};
WPP.eggForCards=(g,s,P,x,mv)=>{const opts=wpSlots(g,s.pid).filter(([,,y])=>y.e>0).map(([h,i])=>wpKey(h,i));if(!opts.length)return true;if(!mv)return wpAsk(g,s,'eggCards',{opts});if(mv.skip)return true;if(!opts.includes(mv.k))return null;
  wpAt(g,s.pid,mv.k).e--;wpIns(g,{t:'cards',pid:s.pid,n:2});return true};
WPP.draw=(g,s,P)=>{wpIns(g,{t:'cards',pid:s.pid,n:P.n||1});return true};
WPP.drawDiscard=(g,s,P)=>{wpIns(g,{t:'cards',pid:s.pid,n:P.n||1});(g.owe||(g.owe={}))[s.pid]=((g.owe||{})[s.pid]||0)+1;return true};
WPP.allDraw=(g,s)=>{[s.pid,...wpOthers(g,s.pid)].forEach(p=>{if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}if(g.deck.length)g.hand[p].push(g.deck.pop())});return true};
const wpFewest=(g,h)=>{const m=Math.min(...g.ps.map(p=>g.mat[p][h].length));return g.ps.filter(p=>g.mat[p][h].length===m)};
WPP.fewestDraw=(g,s,P)=>{wpFewest(g,P.hab).forEach(p=>{if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}if(g.deck.length)g.hand[p].push(g.deck.pop())});return true};
WPP.fewestDie=(g,s,P)=>{const L=wpFewest(g,P.hab);wpIns(g,...[s.pid,...wpOthers(g,s.pid)].filter(p=>L.includes(p)).map(p=>({t:'food',pid:p,n:1,opt:1})));return true};
WPP.layAny=(g,s)=>{wpIns(g,{t:'eggs',pid:s.pid,n:1,opt:1});return true};
WPP.layThis=(g,s,P,x)=>{if(wpRoom(x))x.e++;return true};
WPP.layNest=(g,s,P)=>{wpSlots(g,s.pid).forEach(([,,y])=>{if(wpNestOk(y.b,P.nest)&&wpRoom(y))y.e++});return true};
WPP.allLayNest=(g,s,P)=>{wpIns(g,{t:'eggs',pid:s.pid,n:2,nest:P.nest,opt:1,diff:1},...wpOthers(g,s.pid).map(p=>({t:'eggs',pid:p,n:1,nest:P.nest,opt:1})));return true};
WPP.moveRight=(g,s,P,x,mv)=>{const h=s.k[0],i=+s.k.slice(1),M=g.mat[s.pid];if(i!==M[h].length-1)return true;const opts=WPH.filter(o=>o!==h&&wpB(x.b).hab.includes(o)&&M[o].length<5);if(!opts.length)return true;
  if(!mv)return wpAsk(g,s,'move',{opts});if(mv.skip)return true;if(!opts.includes(mv.h))return null;M[h].pop();M[mv.h].push(x);gLog(g,`${nmid(s.pid)} moves ${wpB(x.b).n} to the ${WPHN[mv.h]}`,'🐦');return true};
WPP.repeatBrown=(g,s,P,x,mv)=>{const h=s.k[0],opts=g.mat[s.pid][h].map((y,i)=>wpKey(h,i)).filter(k=>k!==s.k&&wpB(wpAt(g,s.pid,k).b).col==='brown'&&!['repeatBrown','repeatPredator'].includes(wpB(wpAt(g,s.pid,k).b).pw.k));if(!opts.length)return true;
  if(!mv)return wpAsk(g,s,'repeat',{opts});if(mv.skip)return true;if(!opts.includes(mv.k))return null;wpIns(g,{t:'pow',pid:s.pid,k:mv.k,why:'repeat'});return true};
WPP.repeatPredator=(g,s,P,x,mv)=>{const h=s.k[0],opts=g.mat[s.pid][h].map((y,i)=>wpKey(h,i)).filter(k=>k!==s.k&&wpB(wpAt(g,s.pid,k).b).pred);if(!opts.length)return true;
  if(!mv)return wpAsk(g,s,'repeat',{opts});if(mv.skip)return true;if(!opts.includes(mv.k))return null;wpIns(g,{t:'pow',pid:s.pid,k:mv.k,why:'repeat'});return true};
WPP.trade=(g,s,P,x,mv)=>{if(!wpFoodN(g,s.pid))return true;if(!mv)return wpAsk(g,s,'trade',{});if(mv.skip)return true;if(!(g.food[s.pid][mv.from]>0)||!WPF.includes(mv.to)||mv.to===mv.from)return null;g.food[s.pid][mv.from]--;g.food[s.pid][mv.to]++;return true};
WPP.bonus=(g,s,P,x,mv)=>{if(!s.drawn){if(g.bdeck.length<2){g.bdeck.push(...wpShuf(g.bdisc));g.bdisc=[]}s.drawn=g.bdeck.splice(-2)}if(!s.drawn.length)return true;
  if(!mv)return wpAsk(g,s,'bonus',{opts:s.drawn});if(!s.drawn.includes(mv.id))return null;g.bon[s.pid].push(mv.id);g.bdisc.push(...s.drawn.filter(i=>i!==mv.id));return true};
WPP.playAnother=(g,s,P)=>{wpIns(g,{t:'play',pid:s.pid,hab:P.hab,sh:s.k[0],opt:1});return true};
WPP.trayAll=(g,s)=>{g.tray.forEach((b,i)=>{if(b!=null){g.hand[s.pid].push(b);g.tray[i]=null}});return true};
WPP.oyster=(g,s)=>{const n=g.ps.length+1;g.pool=[];for(let k=0;k<n;k++){if(!g.deck.length&&g.disc.length){g.deck=wpShuf(g.disc);g.disc=[]}if(g.deck.length)g.pool.push(g.deck.pop())}
  wpIns(g,...[s.pid,...wpOthers(g,s.pid),s.pid].map(p=>({t:'pool',pid:p})));return true};
WPS.pool=(g,s,mv)=>{if(!g.pool||!g.pool.length)return true;if(g.pool.length===1){g.hand[s.pid].push(g.pool.pop());return true}if(!mv)return wpAsk(g,s,'pool',{opts:g.pool.slice()});const i=+mv.i;if(!(i>=0&&i<g.pool.length))return null;g.hand[s.pid].push(...g.pool.splice(i,1));return true};
/* ---------- pink powers: once between your own turns ---------- */
function wpPinkBirds(g,pid,kind){const o=[];wpOthers(g,pid).forEach(p=>wpSlots(g,p).forEach(([h,i,x])=>{const B=wpB(x.b);if(B.col==='pink'&&B.pw&&B.pw.k===kind&&!g.pk[p][wpKey(h,i)])o.push([p,wpKey(h,i),B])}));return o}
const wpPinkGo=(g,L,mk)=>{const st=[];L.forEach(([p,k,B])=>{const x=mk(p,k,B);if(x){g.pk[p][k]=1;st.push(x)}});return st};
function wpPinkLay(g,pid){const st=wpPinkGo(g,wpPinkBirds(g,pid,'onLayEgg'),(p,k,B)=>({t:'pow',pid:p,k,why:'pink'}));g.q.push(...st)}
function wpPinkPlay(g,pid,h){return wpPinkGo(g,wpPinkBirds(g,pid,'onPlayHab').filter(([,,B])=>B.pw.hab===h),(p,k)=>({t:'pow',pid:p,k,why:'pink'}))}
function wpPinkPred(g,pid){const st=wpPinkGo(g,wpPinkBirds(g,pid,'onPredator'),(p,k)=>({t:'pow',pid:p,k,why:'pink'}));wpIns(g,...st)}
function wpPinkGain(g,s){if(!s.act)return;const st=wpPinkGo(g,wpPinkBirds(g,s.pid,'onGainFood').filter(([,,B])=>(g.tg||{})[B.pw.food]>0),(p,k)=>({t:'pow',pid:p,k,why:'pink'}));wpIns(g,...st)}
WPP.onLayEgg=(g,s,P)=>{wpIns(g,{t:'eggs',pid:s.pid,n:1,nest:P.nest,not:P.other?s.k:null,opt:1});return true};
WPP.onPlayHab=(g,s,P,x,mv)=>{if(P.food){g.food[s.pid][P.food]++;return true}return WPP.tuck(g,s,{then:null},x,mv)};
WPP.onPredator=(g,s)=>{wpIns(g,{t:'food',pid:s.pid,n:1,opt:1});return true};
WPP.onGainFood=(g,s,P,x)=>{x.c=(x.c||0)+1;return true};

/* ---------- bonus card tests (strings come with the bonus card data) ---------- */
function wpBonTest(g,p,t,birds){const B=b=>wpB(b);
  const one=pred=>birds.filter(([h,i,x])=>pred(B(x.b),x,h)).length;
  if(t.startsWith('tag:'))return one(b=>(b.tags||[]).includes(t.slice(4)));
  if(t==='pts<4')return one(b=>b.pts<4);
  if(t==='habCount>1')return one(b=>b.hab.length>1);
  if(t==='flock')return one(b=>b.flock);if(t==='pred')return one(b=>b.pred);
  if(t.startsWith('cost:'))return one(b=>(b.cost[t.slice(5)]||0)>0);
  if(t.startsWith('costOnly:'))return one(b=>{const k=Object.keys(b.cost);return k.length===1&&k[0]===t.slice(9)&&!b.wild});
  if(t==='wild')return one(b=>b.wild>0);
  if(t.startsWith('eggLimit>='))return one(b=>b.egg>=+t.slice(10));
  if(t.startsWith('nest:'))return one(b=>b.nest===t.slice(5)||b.nest==='star');
  if(t.startsWith('ws>'))return one(b=>b.ws>+t.slice(3));if(t.startsWith('ws<='))return one(b=>b.ws<=+t.slice(4));if(t.startsWith('ws<'))return one(b=>b.ws<+t.slice(3));
  if(t.startsWith('onlyHab:'))return one(b=>b.hab===t.slice(8));
  if(t.startsWith('eggsOn>='))return one((b,x)=>x.e>=+t.slice(8));
  if(t==='tucked')return one((b,x)=>(x.t||0)>0);if(t==='cached')return one((b,x)=>(x.c||0)>0);
  if(t.startsWith('col:'))return one(b=>b.col===t.slice(4));
  return wpBonX(g,p,t,birds)}
/* hooks the data file may extend */
function wpBonX(g,p,t,birds){if(t==='special:visionary')return g.hand[p].length;if(t==='special:ecologist'){const m=Math.min(...WPH.map(h=>g.mat[p][h].length));return m}console.warn('Wingspan bonus test?',t);return 0}
function wpGoalX(g,p,G){console.warn('Wingspan goal?',G.k);return 0}

/* ---------- computer players ---------- */
const wpWant=(g,pid)=>{const w={i:0,s:0,f:0,r:0,u:0};g.hand[pid].forEach(b=>{const B=wpB(b);for(const f in B.cost)w[f]+=B.cost[f]});return w};
const wpVal=b=>{const B=wpB(b);return B.pts+(B.col==='brown'?2:B.col==='white'?1:B.col==='pink'?1:0)+B.egg*.3};
function wpBotAction(g,pid,q){const lvl=q.bot||'normal',r=g.rnd,cub=g.cubes[pid],H=g.hand[pid],room=wpSlots(g,pid).filter(([,,x])=>wpRoom(x)).length,nb=wpSlots(g,pid).length;
  const can=H.filter(b=>wpPlayHabs(g,pid,b).length&&wpPay(g,pid,b));
  if(can.length&&(r<3||cub>2||lvl==='easy'))return 'play';
  if(r>=2&&room>0&&(cub<=3||!can.length&&wpFoodN(g,pid)>=2&&H.length))return 'eggs';
  if(!H.length||H.length<2&&r<3)return 'cards';
  if(wpFoodN(g,pid)<3)return 'food';
  if(room>0&&nb>=3)return 'eggs';return H.length<4?'cards':'food'}
function wpBotAns(g,pid,q){const A=g.ask,lvl=q.bot||'normal',H=g.hand[pid],W=wpWant(g,pid),best=(L,f)=>L.slice().sort((a,b)=>f(b)-f(a))[0];
  switch(A.t){
  case 'opt':{if(A.h==='f'){if(H.length<3)return {skip:1};const i=H.map((b,i)=>i).sort((a,b)=>wpVal(H[a])-wpVal(H[b]))[0];return {c:i}}
    if(A.h==='g'){const f=WPF.filter(f=>g.food[pid][f]>0).sort((a,b)=>W[a]-W[b])[0];return wpFoodN(g,pid)>3?{f}:{skip:1}}
    const k=wpSlots(g,pid).filter(([,,x])=>x.e>0).map(([h,i])=>wpKey(h,i))[0];return g.rnd<3&&k?{k}:{skip:1}}
  case 'die':{if(!A.opts.length)return A.re?{re:1}:{skip:1};const sc=i=>{const d=g.fd[i];return d==='is'?Math.max(W.i,W.s)+.5:(W[d]||0)+Math.random()*.3};const i=best(A.opts,sc),d=g.fd[i];return {d:i,f:d==='is'?(W.s>W.i?'s':'i'):undefined}}
  case 'egg':{const sc=k=>{const x=wpAt(g,pid,k);return wpB(x.b).egg-x.e+Math.random()};return {k:best(A.opts,sc)}}
  case 'card':{const tb=A.tray.length?best(A.tray,i=>wpVal(g.tray[i])):null;return tb!=null&&(wpVal(g.tray[tb])>=5||!A.deck)?{c:tb}:{c:A.deck?'deck':tb}}
  case 'play':{const o=best(A.opts,o=>wpVal(H[o.i])),h=best(o.habs,h=>-g.mat[pid][h].length+(h==='g'&&g.rnd>=2?.5:0));return {i:o.i,h}}
  case 'payEgg':{const k=best(A.opts,k=>{const x=wpAt(g,pid,k);return x.e-wpB(x.b).pts*.1});return {k}}
  case 'disc':{const i=H.map((b,i)=>i).sort((a,b)=>wpVal(H[a])-wpVal(H[b]))[0];return {c:i}}
  case 'tuck':{if(H.length<2&&lvl!=='easy'&&g.rnd<3)return {skip:1};const i=H.map((b,i)=>i).sort((a,b)=>wpVal(H[a])-wpVal(H[b]))[0];return {c:i,f:A.food?A.food[0]:undefined}}
  case 'yes':return {yes:g.rnd>=1||wpFoodN(g,pid)>3};
  case 'eggFood':{const k=best(A.opts,k=>wpAt(g,pid,k).e);const fs=Array.from({length:A.n},()=>best(WPF,f=>W[f]+Math.random()*.2));return g.rnd<3?{k,fs}:{skip:1}}
  case 'eggCards':return g.rnd<2?{k:best(A.opts,k=>wpAt(g,pid,k).e)}:{skip:1};
  case 'move':return {h:best(A.opts,h=>-g.mat[pid][h].length)};
  case 'repeat':return {k:A.opts[0]};
  case 'trade':{const from=best(WPF.filter(f=>g.food[pid][f]>0),f=>-W[f]),to=best(WPF.filter(f=>f!==from),f=>W[f]);return W[to]>W[from]?{from,to}:{skip:1}}
  case 'bonus':return {id:A.opts[0]};
  case 'pool':return {i:A.opts.map((b,i)=>i).sort((a,b)=>wpVal(A.opts[b])-wpVal(A.opts[a]))[0]};
  }return {skip:1}}
function wpBotSetup(g,pid){const O=g.offer[pid],idx=O.b.map((b,i)=>i).sort((a,b)=>wpVal(O.b[b])-wpVal(O.b[a])),keep=idx.slice(0,3);const W={i:0,s:0,f:0,r:0,u:0};keep.forEach(i=>{const B=wpB(O.b[i]);for(const f in B.cost)W[f]+=B.cost[f]});
  const food=WPF.slice().sort((a,b)=>W[b]-W[a]).slice(0,2);return wpSetup(g,pid,keep,food,O.bo[0])}
function wpBotStep(g,q){const pid=q.id;if(g.phase==='setup')return g.offer[pid]?wpBotSetup(g,pid):false;if(g.phase!=='play')return false;
  if(g.ask){if(g.ask.pid!==pid)return false;let mv=wpBotAns(g,pid,q);if(g.ask.t==='play'&&g.botPick){const bp=g.botPick;g.botPick=null;if(g.ask.opts.some(o=>o.i===bp.i&&o.habs.includes(bp.h)))mv=bp}if(wpMove(g,pid,mv))return true;return wpMove(g,pid,{skip:1})||wpBotAny(g,pid)}
  if(g.turn!==pid||g.q.length)return false;const lv=q.bot||'normal',a=lv==='easy'?wpBotAction(g,pid,q):(wpSmartAction(g,pid,q)||wpBotAction(g,pid,q));return wpMove(g,pid,{a})||['food','cards','eggs','play'].some(x=>wpMove(g,pid,{a:x}))}
/* last resort: any answer that's accepted */
function wpBotAny(g,pid){const A=g.ask;const tries=[{skip:1},{c:'deck'},{c:0},{k:(A.opts||[])[0]},{d:(A.opts||[])[0],f:'i'},{re:1},{yes:false},{i:(A.opts||[{}])[0]&&(A.opts[0].i??0),h:A.opts&&A.opts[0]&&A.opts[0].habs&&A.opts[0].habs[0]},{h:(A.opts||[])[0]},{id:(A.opts||[])[0]}];for(const t of tries)if(wpMove(g,pid,t))return true;return false}

/* ---------- smarter computer players: try each action on a copy of the game and keep the best result ----------
   easy = the simple rules above; normal and hard look one action ahead (normal sometimes takes its 2nd best). */
const WPW8=Object.assign({food:.55,card:.35,fit:.6,room:.25,brown:1,row:.5,goal:1,bon:.6},(typeof process!=='undefined'&&process.env.W8)?JSON.parse(process.env.W8):{});
function wpPotential(g,pid){const W=WPW8,B=wpSlots(g,pid),left=WPCUBES.slice(g.rnd).reduce((a,n)=>a+n,0)-(WPCUBES[g.rnd]-g.cubes[pid]);
  const now=B.reduce((a,[,,x])=>a+wpB(x.b).pts+x.e+(x.c||0)+(x.t||0),0)+g.gp[pid]+g.bon[pid].reduce((a,id)=>a+wpBonusPts(g,pid,id),0);
  if(g.phase==='done'||left<=0)return now;const fr=Math.min(1,left/12);
  const H=g.hand[pid],fit=H.filter(b=>wpPlayHabs(g,pid,b).length).reduce((a,b)=>a+wpB(b).pts,0);
  const room=B.reduce((a,[,,x])=>a+Math.max(0,wpB(x.b).egg-x.e),0),brown=B.filter(([,,x])=>wpB(x.b).col==='brown').length;
  const rows=WPH.reduce((a,h)=>a+Math.min(g.mat[pid][h].length,5),0);
  const G=wpGoal(g.goals[g.rnd]);let goal=0;if(G){const me=wpGoalCount(g,pid,G),best=Math.max(...g.ps.filter(q=>q!==pid).map(q=>wpGoalCount(g,q,G)));goal=me>best?2:me===best?1:0}
  return now+wpFoodN(g,pid)*W.food*fr+Math.min(H.length,8)*W.card*fr+Math.min(fit,30)*W.fit*.1*fr*10/10+room*W.room*fr+brown*W.brown*left/6+rows*W.row*fr+goal*W.goal}
function wpSimAns(g,pid,q){try{return wpBotAns(g,pid,q)}catch(e){return {skip:1}}}
/* a copy of the game where the bot can't see other hands or the deck order */
function wpFog(g,pid){const c=JSON.parse(JSON.stringify(g));g.ps.forEach(p=>{if(p===pid)return;c.deck.push(...c.hand[p])});wpShuf(c.deck);g.ps.forEach(p=>{if(p===pid)return;const n=c.hand[p].length;c.hand[p]=c.deck.splice(c.deck.length-n,n)});return c}
/* play the rest of the game with simple bots; score = my total minus the best other total */
function wpRoll(c,pid){const E={};let k=0;while(c.phase!=='done'&&k++<4000){const a=wpActor(c);if(!a)break;if(!wpBotStep(c,E[a]||(E[a]={id:a,bot:'easy'})))break}
  if(c.phase!=='done')return null;const me=c.fin[pid].tot,best=Math.max(...c.ps.filter(p=>p!==pid).map(p=>c.fin[p].tot));return me-best*.5}
function wpSim(g,pid,a,pick,q,roll){const c=wpFog(g,pid);try{if(!wpMove(c,pid,{a}))return null;let k=0,first=true;
  while(c.ask&&c.phase==='play'&&k++<80){const ap=c.ask.pid;let mv=first&&pick&&c.ask.t==='play'&&ap===pid?pick:wpSimAns(c,ap,{id:ap,bot:'normal'});if(c.ask.t==='play')first=false;
    if(!wpMove(c,ap,mv)&&!wpMove(c,ap,{skip:1})&&!wpBotAny(c,ap))break}return roll?wpRoll(c,pid):wpPotential(c,pid)}catch(e){return null}}
function wpSmartAction(g,pid,q){const lv=q.bot||'normal',H=g.hand[pid],L=[];['food','eggs','cards'].forEach(a=>L.push({a}));
  H.forEach((b,i)=>{if(!wpPay(g,pid,b))return;wpPlayHabs(g,pid,b).forEach(h=>L.push({a:'play',pick:{i,h}}))});
  const tries=+(typeof process!=='undefined'&&process.env.RO||0)||(lv==='hard'?(g.ps.length>=4?4:6):3);const sc=L.map(o=>{let s=0,n=0;for(let t=0;t<tries;t++){const v=wpSim(g,pid,o.a,o.pick,q,1);if(v!=null){s+=v;n++}}return {o,v:n?s/n:-1e9}}).sort((a,b)=>b.v-a.v);
  if(!sc.length||sc[0].v<-1e8)return null;let pick=sc[0];if(lv!=='hard'&&sc[1]&&Math.random()<.15&&sc[1].v>sc[0].v-1.5)pick=sc[1];
  g.botPick=pick.o.pick||null;return pick.o.a}
