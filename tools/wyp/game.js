/* ================= Wyrmspan on the phones (base game) =================
   State in S.wzg (plain JSON). Every question is g.ask={pid,msg,opts:[{v,l,k?}],opt}; an answer is {v} or {skip:1}.
   Steps live in g.q; a step handler returns true (done), false (asked) or null (bad answer). */
const WZR=['meat','gold','crys','milk'],WZRN={meat:'meat',gold:'gold',crys:'crystal',milk:'milk'},WZRI={meat:'🥩',gold:'🪙',crys:'💎',milk:'🥛'};
const WZC=['c','g','a'],WZCN={c:'Crimson Cavern',g:'Golden Grotto',a:'Amethyst Abyss'},WZCI={c:'🔴',g:'🟡',a:'🟣'};
const WZSZ={H:'hatchling',S:'small',M:'medium',L:'large'},WZPER={S:'Shy',H:'Helpful',A:'Aggressive',P:'Playful'};
const WZTN={meat:'meat',gold:'gold',crys:'crystal',milk:'milk',any:'any resource',coin:'coin',d:'dragon card',D:'dragon card (deck)',c:'cave card',C:'cave card (deck)',G:'guild step',egg:'egg'};
const wzOn=()=>S.game==='wyrmspan'&&!!(S.rules||{}).play;
const wzG=()=>S.wzg||null;
const wzD=id=>WYD[id-1],wzCv=id=>WYCV[id-1];
const wzShuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wzStale=g=>{const ids=act().map(p=>p.id);return !g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
const wzK=(cv,i)=>cv+i,wzAt=(g,pid,k)=>g.P[pid].mat[k[0]][+k[1]];
const wzDr=(g,pid)=>{const o=[];WZC.forEach(cv=>g.P[pid].mat[cv].forEach((x,i)=>{if(x&&x.d)o.push([wzK(cv,i),x.d])}));return o};
const wzRes=(g,pid)=>WZR.reduce((a,r)=>a+g.P[pid].res[r],0);
const wzCards=(g,pid)=>g.P[pid].hand.d.length+g.P[pid].hand.c.length;
const wzEggs=(g,pid)=>g.P[pid].nest+wzDr(g,pid).reduce((a,[,d])=>a+d.e,0);
const wzRoom=d=>d.e<wzD(d.id).cap;
const wzOthers=(g,pid)=>{const L=g.ps,i=L.indexOf(pid);return L.slice(i+1).concat(L.slice(0,i))};
const wzIns=(g,...st)=>{g.q.splice(1,0,...st)};
const wzAsk=(g,s,msg,opts,o={})=>{g.ask={pid:s.pid,msg,opts,opt:!!o.opt,...o};return false};
const wzLog=(g,t,ic)=>gLog(g,t,ic||'🐉');
function wzDrawD(g){if(!g.dd.length&&g.ddisc.length){g.dd=wzShuf(g.ddisc);g.ddisc=[]}return g.dd.pop()??null}
function wzDrawC(g){if(!g.dc.length&&g.cdisc.length){g.dc=wzShuf(g.cdisc);g.cdisc=[]}return g.dc.pop()??null}
function wzRefill(g){for(let i=0;i<3;i++){if(g.disp.d[i]==null)g.disp.d[i]=wzDrawD(g);if(g.disp.c[i]==null)g.disp.c[i]=wzDrawC(g)}}

/* ---------- setup ---------- */
function wzDeal(){const P=act(),ps=P.map(p=>p.id),side=ps.length>=4?4:2;
  const gk=Object.keys(WYGUILD),guild=gk[Math.floor(Math.random()*gk.length)];
  const g={_atom:1,id:String(Math.random()).slice(2,10),ps,fp:ps[0],turn:ps[0],rnd:0,phase:'play',side,guild,
    dd:wzShuf(WYD.map(d=>d.no)),dc:wzShuf(WYCV.map(c=>c.no)),ddisc:[],cdisc:[],disp:{d:[null,null,null],c:[null,null,null]},
    obj:wzShuf(WYOBJ.map(o=>o.id)).slice(0,4),gbox:[[],[],[],[],[]],P:{},oc:[],q:[],ask:null,last:null,lg:[],n:0,tno:0};
  wzRefill(g);
  ps.forEach(p=>{g.P[p]={coin:6,res:{meat:0,gold:0,crys:0,milk:0},hand:{d:[],c:[]},nest:1,mat:{c:[{cv:0,d:null},null,null,null],g:[{cv:0,d:null},null,null,null],a:[{cv:0,d:null},null,null,null]},
    gpos:0,gm:0,ex:{c:0,g:0,a:0},passed:false,st:{exc:0,ent:0,exp:0}};
    g.q.push({t:'keep',pid:p,o:{d:[wzDrawD(g),wzDrawD(g),wzDrawD(g)],c:[wzDrawC(g),wzDrawC(g),wzDrawC(g)]},drop:2},{t:'start3',pid:p,n:3})});
  g.q.push({t:'go'});
  S.wzg=g;gAnn(g,'Wyrmspan',`${P.length} players · ${WYGUILD[guild].n}. Everyone keeps 4 of 6 cards and picks 3 resources.`,'🐉');
  gLog(g,`Wyrmspan: ${P.length} players, ${WYGUILD[guild].n}, objectives: ${g.obj.map(o=>wzObj(o).say).join(' · ')}`,'🐉');wzRun(g);return g}
const wzObj=id=>WYOBJ.find(o=>o.id===id);
const WZS={};
WZS.keep=(g,s,mv)=>{const L=[...s.o.d.map((id,i)=>id==null?null:{v:'d'+i,l:'🐉 '+wzD(id).n}),...s.o.c.map((id,i)=>id==null?null:{v:'c'+i,l:'🪨 Cave card: '+wzCvSay(id)})].filter(Boolean);
  if(!mv)return wzAsk(g,s,`Starting hand: put back ${s.drop} of these 6 cards (you keep 4)`,L,{kind:'keep'});
  const o=L.find(x=>x.v===mv.v);if(!o)return null;const t=o.v[0],i=+o.v.slice(1),id=s.o[t][i];s.o[t][i]=null;(t==='d'?g.ddisc:g.cdisc).push(id);s.drop--;
  if(s.drop>0)return WZS.keep(g,s);g.P[s.pid].hand.d=s.o.d.filter(x=>x!=null);g.P[s.pid].hand.c=s.o.c.filter(x=>x!=null);return true};
WZS.start3=(g,s,mv)=>{if(!mv)return wzAsk(g,s,`Pick a starting resource (${s.n} to go)`,WZR.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});
  if(!WZR.includes(mv.v))return null;g.P[s.pid].res[mv.v]++;s.n--;return s.n>0?WZS.start3(g,s):true};
WZS.go=g=>{gAnn(g,'Round 1',`${nmid(g.turn)} goes first. Spend coins on excavate, entice and explore; pass when you're done.`,'🐉');g.n++;return true};

/* ---------- the actor and the queue ---------- */
const wzActor=g=>!g||g.phase==='done'?null:g.ask?g.ask.pid:g.q.length?null:g.turn;
const wzWaits=(g,pid)=>wzActor(g)===pid;
function wzRun(g){let guard=0;while(g.q.length&&guard++<800){const s=g.q[0];const h=WZS[s.t];if(!h){console.error('Wyrmspan: no step',s.t);g.q.shift();continue}
  const done=h(g,s);if(!done)return;g.ask=null;g.q.shift()}if(guard>=800)console.error('Wyrmspan: step loop')}
function wzMove(g,pid,mv){if(!g||g.phase==='done'||!mv)return false;
  if(mv.trade){if(!wzTrade(g,pid,mv.trade))return false;g.n++;return true}
  if(g.ask){if(g.ask.pid!==pid)return false;const s=g.q[0];if(!s)return false;if(mv.skip&&!g.ask.opt)return false;
    const ok=mv.skip?wzSkip(g,s):WZS[s.t](g,s,mv);if(ok===null)return false;if(ok){g.ask=null;g.q.shift()}wzRun(g);g.n++;return true}
  if(g.q.length||g.turn!==pid)return false;return wzAction(g,pid,mv)}
/* skipping a question: cards already drawn go to your hand; a "then" still happens if you did it at least once */
function wzSkip(g,s){if(s.cards&&s.cards.length)g.P[s.pid].hand.d.push(...s.cards);if(s.did&&s.t==='op'){const th=s.a[0]==='cache'?s.a[5]:s.a[0]==='tuck'?s.a[4]:null;if(th)wzIns(g,...wzOps(g,s.pid,s.k,th))}return true}
/* 2 resources of any kind → 1 of another, any time */
function wzTrade(g,pid,t){const R=g.P[pid].res,a=t.pay||[];if(a.length!==2||!WZR.includes(t.to)||a.includes(t.to))return false;const need={};a.forEach(r=>need[r]=(need[r]||0)+1);
  for(const r in need)if(!WZR.includes(r)||R[r]<need[r])return false;for(const r in need)R[r]-=need[r];R[t.to]++;wzLog(g,`${nmid(pid)} trades ${a.map(r=>WZRI[r]).join('')} for ${WZRI[t.to]}`,'🔁');return true}

/* ---------- paying ---------- */
/* resources: exact first; anything short is covered 2-for-1 from the biggest piles */
function wzPayRes(R,need,dry){const F={...R};let short=0;for(const r of WZR){const n=need[r]||0;if(F[r]>=n)F[r]-=n;else{short+=n-F[r];F[r]=0}}
  let anyN=need.any||0;short+=0;for(let k=0;k<anyN;k++){const L=WZR.filter(r=>F[r]>0).sort((a,b)=>F[b]-F[a]);if(L.length)F[L[0]]--;else short++}
  for(let k=0;k<short;k++){for(let j=0;j<2;j++){const L=WZR.filter(r=>F[r]>0).sort((a,b)=>F[b]-F[a]);if(!L.length)return null;F[L[0]]--}}
  if(!dry)Object.assign(R,F);return F}
/* egg sources: 'cv' this cave, 'adj' next to k, '' anywhere (the mat nests too) */
function wzEggSrc(g,pid,k,src){const L=[];if(!src)L.push(['n',g.P[pid].nest]);wzDr(g,pid).forEach(([kk,d])=>{if(src==='cv'&&kk[0]!==k[0])return;if(src==='adj'&&!wzAdj(k,kk))return;L.push([kk,d.e])});return L.filter(x=>x[1]>0)}
const wzEggN=(g,pid,k,src)=>wzEggSrc(g,pid,k,src).reduce((a,x)=>a+x[1],0);
function wzPayEgg(g,pid,k,src,n){for(let i=0;i<n;i++){const L=wzEggSrc(g,pid,k,src).sort((a,b)=>(a[0]==='n'?-1:0)-(b[0]==='n'?-1:0)||b[1]-a[1]);if(!L.length)return false;
  if(L[0][0]==='n')g.P[pid].nest--;else wzAt(g,pid,L[0][0]).d.e--}return true}
const wzAdj=(a,b)=>{const ca=WZC.indexOf(a[0]),cb=WZC.indexOf(b[0]),ia=+a[1],ib=+b[1];return ca===cb&&Math.abs(ia-ib)===1||ia===ib&&Math.abs(ca-cb)===1};
/* can this player pay this token list (pay op costs)? */
function wzCan(g,pid,k,cost,src){const P=g.P[pid],T=cost.split(','),need={};let egg=0,coin=0,d=0,c=0;
  T.forEach(t=>{if(WZR.includes(t)||t==='any')need[t]=(need[t]||0)+1;else if(t==='egg')egg++;else if(t==='coin')coin++;else if(t==='d')d++;else if(t==='c')c++});
  return P.coin>=coin&&P.hand.d.length>=d&&P.hand.c.length>=c&&wzEggN(g,pid,k,src)>=egg&&!!wzPayRes(P.res,need,1)}

/* ---------- the actions ---------- */
const WZEXC=[0,0,1,2],WZEXP=[0,1,2];
const wzNextEx=(g,pid,cv)=>g.P[pid].mat[cv].findIndex(x=>!x);
const wzNextD=(g,pid,cv)=>{const M=g.P[pid].mat[cv];const i=M.findIndex(x=>!x||!x.d);return i>=0&&M[i]?i:-1};
const wzCanExc=(g,pid,cv,free)=>{const i=wzNextEx(g,pid,cv);return i>0&&(free||g.P[pid].coin>=1&&wzEggN(g,pid,'',null)>=WZEXC[i])};
function wzDCost(id,mode){const c={...wzD(id).cost};if(mode==='nores')WZR.forEach(r=>delete c[r]);return c}
/* can pay a dragon's printed cost (+ base coin)? mode: entice | free | disc1 | nores */
function wzCanAfford(g,pid,id,mode){if(mode==='free')return true;const P=g.P[pid],c=wzDCost(id,mode),base=mode==='entice'?1:0;
  if(mode==='disc1'){const L=wzDisc1(g,pid,id);return !!L}
  return P.coin>=base+(c.coin||0)&&wzEggN(g,pid,'',null)>=(c.egg||0)&&!!wzPayRes(P.res,c,1)}
function wzDisc1(g,pid,id){const c=wzDCost(id),P=g.P[pid];const tries=[];if(c.egg)tries.push({...c,egg:c.egg-1});WZR.forEach(r=>{if(c[r])tries.push({...c,[r]:c[r]-1})});if(!tries.length)tries.push(c);
  return tries.find(t=>P.coin>=(t.coin||0)&&wzEggN(g,pid,'',null)>=(t.egg||0)&&wzPayRes(P.res,t,1))||null}
function wzPayD(g,pid,id,mode){if(mode==='free')return;const P=g.P[pid],c=mode==='disc1'?wzDisc1(g,pid,id):wzDCost(id,mode);P.coin-=(mode==='entice'?1:0)+(c.coin||0);wzPayEgg(g,pid,'',null,c.egg||0);wzPayRes(P.res,c)}
const wzFits=(g,pid,id)=>WZC.filter(cv=>wzD(id).cv.includes(cv)&&wzNextD(g,pid,cv)>=0);
function wzActs(g,pid){const P=g.P[pid],o={exc:[],ent:[],exp:[]};if(P.coin<1)return o;
  if(P.hand.c.length)o.exc=WZC.filter(cv=>wzCanExc(g,pid,cv));
  P.hand.d.forEach((id,i)=>{const f=wzFits(g,pid,id);if(f.length&&wzCanAfford(g,pid,id,'entice'))o.ent.push({i,cv:f})});
  o.exp=WZC.filter(cv=>P.ex[cv]<3&&wzEggN(g,pid,'',null)>=WZEXP[P.ex[cv]]);return o}
function wzAction(g,pid,mv){const P=g.P[pid];if(P.passed)return false;g.last={p:pid,t:mv.a};
  if(mv.a==='pass'){P.passed=true;wzLog(g,`${nmid(pid)} passes${P.coin?` (keeps ${P.coin} coin${P.coin>1?'s':''})`:''}`,'✋');g.q.push({t:'end',pid});wzRun(g);g.n++;return true}
  const A=wzActs(g,pid);
  if(mv.a==='exc'){const cv=mv.cv,i=+mv.i;if(!A.exc.includes(cv)||!(i>=0&&i<P.hand.c.length))return false;const col=wzNextEx(g,pid,cv);
    P.coin--;wzPayEgg(g,pid,'',null,WZEXC[col]);const id=P.hand.c.splice(i,1)[0];P.st.exc++;
    wzLog(g,`${nmid(pid)} excavates ${WZCN[cv]} space ${col+1}${WZEXC[col]?` (1 coin, ${WZEXC[col]} egg${WZEXC[col]>1?'s':''})`:' (1 coin)'}`,'⛏️');wzPlace(g,pid,cv,id)}
  else if(mv.a==='ent'){const i=+mv.i,o=A.ent.find(x=>x.i===i);if(!o||!o.cv.includes(mv.cv))return false;const id=P.hand.d[i];wzPayD(g,pid,id,'entice');P.hand.d.splice(i,1);P.st.ent++;
    wzPut(g,pid,id,mv.cv,'entices')}
  else if(mv.a==='exp'){const cv=mv.cv;if(!A.exp.includes(cv))return false;const n=P.ex[cv];P.coin--;wzPayEgg(g,pid,'',null,WZEXP[n]);P.ex[cv]++;P.st.exp++;
    wzLog(g,`${nmid(pid)} explores the ${WZCN[cv]}${n?` (${n+1}${n===1?'nd':'rd'} time: 1 coin, ${n} egg${n>1?'s':''})`:''}`,'🏮');
    g.q.push(...wzOps(g,pid,cv+'x',WYMAT[cv].in),{t:'walk',pid,cv,i:0})}
  else return false;
  g.q.push({t:'end',pid});wzRun(g);g.n++;return true}
/* put a cave card on the leftmost empty space: its when-played effect, then the "when covered" trade on column 4 */
function wzPlace(g,pid,cv,id){const col=wzNextEx(g,pid,cv);if(col<1)return false;g.P[pid].mat[cv][col]={cv:id,d:null};
  const st=wzOps(g,pid,cv+col,wzCv(id).op);if(col===3)st.push({t:'cover',pid});g.q.push(...st);return true}
/* put a dragon in the next dragon space of a cave */
function wzPut(g,pid,id,cv,verb){const col=wzNextD(g,pid,cv);const x=g.P[pid].mat[cv][col];x.d={id,e:0,c:0,t:0,cr:{}};const D=wzD(id);
  wzLog(g,`${nmid(pid)} ${verb} ${D.n} into the ${WZCN[cv]}`,'🐉');if(D.ty==='W'&&D.op)wzIns2(g,wzOps(g,pid,cv+col,D.op));return cv+col}
/* append steps right after the current step (or at the end of the queue when nothing runs) */
function wzIns2(g,st){if(g.q.length)g.q.splice(1,0,...st);else g.q.push(...st)}
WZS.walk=(g,s)=>{const x=g.P[s.pid].mat[s.cv][s.i];if(!x||!x.d){wzLog(g,`${nmid(s.pid)}'s adventurer stops at an empty space and goes home`,'🏮');return true}
  const D=wzD(x.d.id),k=s.cv+s.i,st=[];if(D.ty==='A')st.push({t:'adv',pid:s.pid,k});
  st.push(...wzOps(g,s.pid,k,s.i<3?WYMAT[s.cv].after[s.i]:WYMAT[s.cv].end));if(s.i<3)st.push({t:'walk',pid:s.pid,cv:s.cv,i:s.i+1});wzIns(g,...st);return true};
/* an if-activated dragon: hatchlings cache/tuck 1, others run their ops (optional) */
WZS.adv=(g,s,mv)=>{const x=wzAt(g,s.pid,s.k);if(!x||!x.d)return true;const D=wzD(x.d.id);
  if(D.h){const r=D.h.r,P=g.P[s.pid];if(r==='tuck'){if(!P.hand.d.length)return true;wzIns(g,{t:'op',pid:s.pid,k:s.k,a:['tuck','hand','h',1]});return true}
    if(P.res[r]<1)return true;if(!mv)return wzAsk(g,s,`${D.n}: cache ${WZRI[r]} ${WZRN[r]} from your supply here?`,[{v:'y',l:`Cache ${WZRI[r]}`}],{opt:1});
    P.res[r]--;wzCacheOn(g,s.pid,s.k,r);return true}
  wzLog(g,`${nmid(s.pid)} uses ${D.n}`,'✨');wzIns(g,...wzOps(g,s.pid,s.k,D.op));return true};
/* column 4 when covered: spend 3 items for 1 coin (optional) */
WZS.cover=(g,s,mv)=>{const P=g.P[s.pid];s.paid=s.paid||[];const L=[...WZR.filter(r=>P.res[r]>0).map(r=>({v:'r:'+r,l:WZRI[r]+' '+WZRN[r]})),...P.hand.d.map((id,i)=>({v:'d:'+i,l:'🐉 '+wzD(id).n})),...P.hand.c.map((id,i)=>({v:'c:'+i,l:'🪨 '+wzCvSay(id)}))];
  if(!s.paid.length&&wzRes(g,s.pid)+wzCards(g,s.pid)<3)return true;
  if(!mv)return wzAsk(g,s,`Column 4 bonus: spend 3 items (resources or cards) for 1 coin? (${3-s.paid.length} to go)`,L,{opt:!s.paid.length});
  const [t,v]=String(mv.v).split(':');if(t==='r'){if(!(P.res[v]>0))return null;P.res[v]--}else if(t==='d'||t==='c'){const L2=P.hand[t],i=+v;if(!(i>=0&&i<L2.length))return null;(t==='d'?g.ddisc:g.cdisc).push(L2.splice(i,1)[0])}else return null;
  s.paid.push(mv.v);if(s.paid.length<3)return WZS.cover(g,s);P.coin++;wzLog(g,`${nmid(s.pid)} spends 3 items for 1 coin`,'🪙');return true};
/* end of a turn: discard down to 9/9/9, refill the display, next player (or the end of the round) */
WZS.end=(g,s,mv)=>{const P=g.P[s.pid];if(P.coin>9)P.coin=9;
  if(wzCards(g,s.pid)>9||wzRes(g,s.pid)>9){const L=wzCards(g,s.pid)>9?[...P.hand.d.map((id,i)=>({v:'d:'+i,l:'🐉 '+wzD(id).n})),...P.hand.c.map((id,i)=>({v:'c:'+i,l:'🪨 '+wzCvSay(id)}))]:WZR.filter(r=>P.res[r]>0).map(r=>({v:'r:'+r,l:WZRI[r]+' '+WZRN[r]}));
    if(!mv)return wzAsk(g,s,wzCards(g,s.pid)>9?`Too many cards: discard down to 9 (${wzCards(g,s.pid)-9} to go)`:`Too many resources: discard down to 9 (${wzRes(g,s.pid)-9} to go)`,L);
    const [t,v]=String(mv.v).split(':');if(t==='r'){if(!(P.res[v]>0))return null;P.res[v]--}else{const L2=P.hand[t],i=+v;if(!L2||!(i>=0&&i<L2.length))return null;(t==='d'?g.ddisc:g.cdisc).push(L2.splice(i,1)[0])}return WZS.end(g,s)}
  wzRefill(g);g.tno++;g.ask=null;const nx=wzNext(g,s.pid);if(nx==null)wzIns(g,{t:'rend'});else g.turn=nx;return true};
function wzNext(g,pid){const L=g.ps;for(let k=1;k<=L.length;k++){const q=L[(L.indexOf(pid)+k)%L.length];const P=g.P[q];if(P.passed)continue;if(P.coin<1){P.passed=true;wzLog(g,`${nmid(q)} is out of coins and passes`,'✋');continue}return q}return null}
/* ---------- the end of a round ---------- */
WZS.rend=g=>{const st=[],L=g.ps,i0=L.indexOf(g.fp);for(let k=0;k<L.length;k++){const p=L[(i0+k)%L.length];wzDr(g,p).forEach(([kk,d])=>{if(wzD(d.id).ty==='O')st.push({t:'opr',pid:p,k:kk})})}
  st.push({t:'rscore'});wzIns(g,...st);gLog(g,`Round ${g.rnd+1} is over`,'🔔',1);return true};
WZS.opr=(g,s,mv)=>{const x=wzAt(g,s.pid,s.k);if(!x||!x.d)return true;const D=wzD(x.d.id);if(!D.op)return true;
  wzLog(g,`${nmid(s.pid)} uses ${D.n} (once per round)`,'🔁');wzIns(g,...wzOps(g,s.pid,s.k,D.op));return true};
WZS.rscore=g=>{const id=g.obj[g.rnd],c={};g.ps.forEach(p=>c[p]=wzObjN(g,p,id));g.oc[g.rnd]=c;const pts=wzObjPts(g,g.rnd);
  gLog(g,`Round ${g.rnd+1} objective (${wzObj(id).say}): ${g.ps.map(p=>`${nmid(p)} ${c[p]} → ${pts[p]} VP`).join(', ')}`,'🎯',1);
  if(g.rnd===3){wzEnd(g);return true}
  g.rnd++;g.ddisc.push(...g.disp.d.filter(x=>x!=null));g.cdisc.push(...g.disp.c.filter(x=>x!=null));g.disp={d:[null,null,null],c:[null,null,null]};wzRefill(g);
  g.fp=g.ps[(g.ps.indexOf(g.fp)+1)%g.ps.length];g.turn=g.fp;
  g.ps.forEach(p=>{const P=g.P[p];P.coin+=6;P.passed=false;P.ex={c:0,g:0,a:0};if(P.nest<2)P.nest++;else{const d=wzDr(g,p).map(x=>x[1]).filter(wzRoom).sort((a,b)=>(wzD(b.id).cap-b.e)-(wzD(a.id).cap-a.e))[0];if(d)d.e++}});
  gAnn(g,`Round ${g.rnd+1}`,`${nmid(g.turn)} starts. Everyone gains 6 coins and 1 egg; the display is refreshed.`,'🎯');return true};
/* objective counts */
function wzObjN(g,p,id){const P=g.P[p],D=wzDr(g,p).map(([k,d])=>[k,d,wzD(d.id)]),n=f=>D.filter(f).length;
  const cost=B=>Object.values(B.cost).reduce((a,v)=>a+v,0);
  switch(id){case 'hatch':return n(x=>x[2].sz==='H');case 'small':return n(x=>x[2].sz==='S');case 'med':return n(x=>x[2].sz==='M');case 'large':return n(x=>x[2].sz==='L');
    case 'inC':case 'inG':case 'inA':{const cv=id[2].toLowerCase();return P.mat[cv].reduce((a,x)=>a+(x&&x.d?1:0)+(x&&x.cv?1:0),0)}
    case 'cache':return D.reduce((a,x)=>a+x[1].c,0);case 'eggs':return wzEggs(g,p);
    case 'perH':return n(x=>x[2].per==='H');case 'perA':return n(x=>x[2].per==='A');case 'perS':return n(x=>x[2].per==='S');case 'perP':return n(x=>x[2].per==='P');
    case 'adv':return n(x=>x[2].ty==='A');case 'wpopr':return n(x=>x[2].ty==='W'||x[2].ty==='O');
    case 'caves':return WZC.reduce((a,cv)=>a+P.mat[cv].filter(x=>x&&x.cv).length,0);
    case 'cheap':return n(x=>cost(x[2])<=2);case 'dear':return n(x=>cost(x[2])>=3);case 'cap':return D.reduce((a,x)=>a+x[2].cap,0);
    case 'guild':return P.gpos;default:return 0}}
/* friendly ties; a count of 0 is "all others" */
function wzObjPts(g,r){const c=g.oc[r]||{},out={},L=[...new Set(g.ps.map(p=>c[p]).filter(v=>v>0))].sort((a,b)=>b-a);g.ps.forEach(p=>{const i=c[p]>0?L.indexOf(c[p]):-1;out[p]=i>=0?(WYPT[r][i]||0):0});return out}
const wzObjPos=(g,r,p)=>{const c=g.oc[r]||{};if(!(c[p]>0))return 3;const L=[...new Set(g.ps.map(q=>c[q]).filter(v=>v>0))].sort((a,b)=>b-a);return Math.min(3,L.indexOf(c[p]))};

/* ---------- the Dragon Guild ---------- */
WZS.adv1=(g,s)=>{const P=g.P[s.pid];P.gpos++;const sp=WYTRACK[P.gpos%12];
  if(sp==='mark'){if(P.gm<4)wzIns(g,{t:'mark',pid:s.pid});wzLog(g,`${nmid(s.pid)} reaches a guild marker space`,'🛡️');return true}
  wzLog(g,`${nmid(s.pid)} moves up the Dragon Guild: ${WZTN[sp]}`,'🛡️');wzIns(g,...wzOps(g,s.pid,'',sp==='egg'?[['lay',1,'a']]:[['g',sp]]));return true};
WZS.mark=(g,s,mv)=>{const G=WYGUILD[g.guild],B=G.box[g.side],L=[];for(let r=0;r<4;r++){const free=B[r]-g.gbox[r].length;if(free>0)L.push({v:r,l:`${G.say[r]} (${free} left)`})}
  const n=g.gbox[4].length;L.push({v:4,l:`End-game points: ${n===0?6:n===1?3:1} VP`});
  if(!mv)return wzAsk(g,s,'Place a guild marker',L,{kind:'mark'});const r=+mv.v;if(!L.some(o=>o.v===r))return null;g.gbox[r].push(s.pid);g.P[s.pid].gm++;
  wzLog(g,`${nmid(s.pid)} places a guild marker: ${r===4?'end-game points':G.say[r]}`,'🛡️');if(r<3)wzIns(g,...wzOps(g,s.pid,'',G.rows[r]));return true};

/* ---------- effects ---------- */
function wzOps(g,pid,k,ops){const st=[];(ops||[]).forEach(a=>{if(a[0]==='g'){a[1].split(',').forEach(t=>st.push(t==='G'?{t:'adv1',pid}:{t:'gt',pid,k,tok:t}))}else st.push({t:'op',pid,k,a})});return st}
WZS.op=(g,s,mv)=>{const f=WZOP[s.a[0]];if(!f){console.warn('Wyrmspan op?',s.a[0]);return true}return f(g,s,mv)};
/* gain one token */
WZS.gt=(g,s,mv)=>{const P=g.P[s.pid],t=s.tok;
  if(WZR.includes(t)){P.res[t]++;return true}if(t==='coin'){P.coin++;return true}if(t==='egg'){wzIns(g,{t:'op',pid:s.pid,k:s.k,a:['lay',1,'a']});return true}
  if(t==='any'){if(!mv)return wzAsk(g,s,'Gain a resource',WZR.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!WZR.includes(mv.v))return null;P.res[mv.v]++;return true}
  if(t==='D'){const id=wzDrawD(g);if(id!=null)P.hand.d.push(id);return true}if(t==='C'){const id=wzDrawC(g);if(id!=null)P.hand.c.push(id);return true}
  if(t==='d'||t==='c'){const dk=t==='d'?g.dd.length+g.ddisc.length:g.dc.length+g.cdisc.length,L=g.disp[t].map((id,i)=>id==null?null:{v:i,l:t==='d'?'🐉 '+wzD(id).n:'🪨 '+wzCvSay(id)}).filter(Boolean);
    if(dk)L.push({v:'deck',l:'🂠 Top of the deck'});if(!L.length)return true;if(L.length===1&&L[0].v==='deck')mv={v:'deck'};
    if(!mv)return wzAsk(g,s,`Gain a ${t==='d'?'dragon':'cave'} card`,L,{kind:'card'+t});
    if(mv.v==='deck'){const id=t==='d'?wzDrawD(g):wzDrawC(g);if(id!=null)P.hand[t].push(id);if(s.tuckIt)s.got=id;return true}
    const i=+mv.v;if(g.disp[t][i]==null)return null;P.hand[t].push(g.disp[t][i]);if(s.tuckIt)s.got=g.disp[t][i];g.disp[t][i]=null;return true}
  return true};
const wzSpots=(g,pid,k,w,f)=>{const L=[];if(w==='a')L.push('n');wzDr(g,pid).forEach(([kk,d])=>{if(w==='h'&&kk!==k)return;if(w==='cv'&&kk[0]!==k[0])return;if(w==='col'&&kk[1]!==k[1])return;if(w==='adj'&&!wzAdj(k,kk))return;if(f&&!f(d))return;L.push(kk)});return L};
const wzSpotL=(g,pid,kk)=>kk==='n'?'🪺 Mat nest':`🐉 ${wzD(wzAt(g,pid,kk).d.id).n} (${WZCN[kk[0]]} ${+kk[1]+1})`;
function wzCacheOn(g,pid,kk,r){const d=wzAt(g,pid,kk).d;d.c++;d.cr[r]=(d.cr[r]||0)+1;const H=wzD(d.id).h;if(H&&H.r===r)wzHatch(g,pid,kk,d.cr[r])}
function wzTuckOn(g,pid,kk){const d=wzAt(g,pid,kk).d;d.t++;const H=wzD(d.id).h;if(H&&H.r==='tuck')wzHatch(g,pid,kk,d.t)}
function wzHatch(g,pid,kk,n){const H=wzD(wzAt(g,pid,kk).d.id).h,st=[];if(H.each!=='vp')st.push(...wzOps(g,pid,kk,H.each));if(n===3){st.push(...wzOps(g,pid,kk,H.third));wzLog(g,`${nmid(pid)}'s ${wzD(wzAt(g,pid,kk).d.id).n} grows up!`,'🐣')}wzIns(g,...st)}
const WZOP={};
/* lay n eggs; w: a anywhere (mat nests too) | h here | cv this cave | col this column | adj next to it */
WZOP.lay=(g,s,mv)=>{const [,n,w]=s.a;s.left=s.left??n;if(s.left<=0)return true;const P=g.P[s.pid];
  const L=wzSpots(g,s.pid,s.k,w,wzRoom).filter(kk=>kk!=='n'||P.nest<2);if(!L.length)return true;
  if(L.length>1&&!mv)return wzAsk(g,s,`Lay an egg (${s.left} to go)`,L.map(kk=>({v:kk,l:wzSpotL(g,s.pid,kk),k:kk})),{opt:1,kind:'spot'});
  const kk=L.length===1?L[0]:mv.v;if(!L.includes(kk))return null;if(kk==='n')P.nest++;else wzAt(g,s.pid,kk).d.e++;s.left--;return s.left>0?WZOP.lay(g,s):true};
WZOP.layEach=(g,s)=>{const [,w,f]=s.a;wzSpots(g,s.pid,s.k,w,d=>wzRoom(d)&&!(f==='notA'&&wzD(d.id).per==='A')).forEach(kk=>{if(kk!=='n')wzAt(g,s.pid,kk).d.e++});return true};
WZOP.opp=(g,s)=>{wzIns(g,...wzOthers(g,s.pid).flatMap(o=>wzOps(g,o,'',s.a[1])));return true};
/* pay a cost to get something, up to n times; src: where eggs come from */
WZOP.pay=(g,s,mv)=>{const [,cost,ops,n=1,src]=s.a;s.left=s.left??n;if(s.left<=0||!wzCan(g,s.pid,s.k,cost,src))return true;
  if(!mv)return wzAsk(g,s,`Pay ${wzSayToks(cost)} to ${wzSayOps(ops)}?${n>1?` (up to ${s.left} more)`:''}`,[{v:'y',l:'Pay'}],{opt:1});
  s.left--;const st=cost.split(',').map(t=>({t:'payc',pid:s.pid,k:s.k,tok:t,src}));wzIns(g,...st,...wzOps(g,s.pid,s.k,ops),...(s.left>0?[{t:'op',pid:s.pid,k:s.k,a:s.a,left:s.left}]:[]));return true};
WZOP.payOr=(g,s,mv)=>{const L=s.a[1].map(([c,o],i)=>({v:i,l:`Pay ${wzSayToks(c)}: ${wzSayOps(o)}`,c,o})).filter(x=>wzCan(g,s.pid,s.k,x.c));if(!L.length)return true;
  if(!mv)return wzAsk(g,s,'Choose one',L.map(({v,l})=>({v,l})),{opt:1});const x=L.find(o=>o.v===+mv.v);if(!x)return null;
  wzIns(g,...x.c.split(',').map(t=>({t:'payc',pid:s.pid,k:s.k,tok:t})),...wzOps(g,s.pid,s.k,x.o));return true};
WZS.payc=(g,s,mv)=>{const P=g.P[s.pid],t=s.tok;if(t==='coin'){P.coin--;return true}if(t==='egg'){wzPayEgg(g,s.pid,s.k,s.src,1);return true}
  if(WZR.includes(t)){wzPayRes(P.res,{[t]:1});return true}
  if(t==='any'){const L=WZR.filter(r=>P.res[r]>0);if(L.length===1){P.res[L[0]]--;return true}if(!mv)return wzAsk(g,s,'Pay which resource?',L.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!L.includes(mv.v))return null;P.res[mv.v]--;return true}
  if(t==='d'||t==='c'){const H=P.hand[t];if(!H.length)return true;if(H.length===1)mv={v:0};if(!mv)return wzAsk(g,s,`Pay which ${t==='d'?'dragon':'cave'} card?`,H.map((id,i)=>({v:i,l:t==='d'?'🐉 '+wzD(id).n:'🪨 '+wzCvSay(id)})));
    const i=+mv.v;if(!(i>=0&&i<H.length))return null;(t==='d'?g.ddisc:g.cdisc).push(H.splice(i,1)[0]);return true}return true};
/* cache resources: res kind (any = your choice), up to n, where; src sup (yours) | gen (general supply); then = if you do */
WZOP.cache=(g,s,mv)=>{const [,res,n,w,src,then]=s.a;s.left=s.left??n;if(s.left<=0)return s.did&&then?(wzIns(g,...wzOps(g,s.pid,s.k,then)),true):true;const P=g.P[s.pid];
  const kinds=(res==='any'?WZR:[res]).filter(r=>src==='gen'||P.res[r]>0),spots=wzSpots(g,s.pid,s.k,w==='a'?'any':w).filter(x=>x!=='n');
  if(!kinds.length||!spots.length)return s.did&&then?(wzIns(g,...wzOps(g,s.pid,s.k,then)),true):true;
  const L=[];kinds.forEach(r=>spots.forEach(kk=>L.push({v:r+'@'+kk,l:`${WZRI[r]} → ${wzSpotL(g,s.pid,kk)}`,k:kk})));
  if(!mv)return wzAsk(g,s,`Cache a resource${n>1?` (up to ${s.left} more)`:''}`,L,{opt:1,kind:'spot'});
  const [r,kk]=String(mv.v).split('@');if(!kinds.includes(r)||!spots.includes(kk))return null;if(src!=='gen')P.res[r]--;s.did=1;s.left--;wzCacheOn(g,s.pid,kk,r);return WZOP.cache(g,s)};
/* gain a resource, then you may cache it (here, or on any dragon) */
WZOP.gc=(g,s,mv)=>{const [,res,w]=s.a,P=g.P[s.pid];if(!s.r){if(res==='any'){if(!mv)return wzAsk(g,s,'Gain a resource',WZR.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!WZR.includes(mv.v))return null;s.r=mv.v;mv=null}else s.r=res;P.res[s.r]++}
  const spots=wzSpots(g,s.pid,s.k,w==='a'?'any':w).filter(x=>x!=='n');if(!spots.length)return true;
  if(!mv)return wzAsk(g,s,`Cache the ${WZRN[s.r]}?`,spots.map(kk=>({v:kk,l:'Cache on '+wzSpotL(g,s.pid,kk),k:kk})),{opt:1,kind:'spot'});if(!spots.includes(mv.v))return null;P.res[s.r]--;wzCacheOn(g,s.pid,mv.v,s.r);return true};
/* tuck dragon cards: src hand | deck, where, n, then (if you do) */
WZOP.tuck=(g,s,mv)=>{const [,src,w,n,then]=s.a;s.left=s.left??n;const P=g.P[s.pid];const fin=()=>{if(s.did&&then)wzIns(g,...wzOps(g,s.pid,s.k,then));return true};
  if(s.left<=0)return fin();const spots=wzSpots(g,s.pid,s.k,w==='a'?'any':w).filter(x=>x!=='n');if(!spots.length)return fin();
  if(src==='hand'){if(!P.hand.d.length)return fin();const L=[];P.hand.d.forEach((id,i)=>spots.forEach(kk=>L.push({v:i+'@'+kk,l:spots.length>1?`${wzD(id).n} → ${wzSpotL(g,s.pid,kk)}`:`Tuck ${wzD(id).n}`,k:kk})));
    if(!mv)return wzAsk(g,s,`Tuck a dragon card from your hand${n>1?` (up to ${s.left} more)`:''}`,L,{opt:1,kind:'spot'});const [i,kk]=String(mv.v).split('@');if(!(+i>=0&&+i<P.hand.d.length)||!spots.includes(kk))return null;
    P.hand.d.splice(+i,1);s.did=1;s.left--;wzTuckOn(g,s.pid,kk);return WZOP.tuck(g,s)}
  const kk=spots.length===1?spots[0]:mv&&mv.v;if(spots.length>1&&!mv)return wzAsk(g,s,`Tuck a card from the deck under which dragon?${n>1?` (${s.left} to go)`:''}`,spots.map(x=>({v:x,l:wzSpotL(g,s.pid,x),k:x})),{opt:1,kind:'spot'});
  if(!spots.includes(kk))return null;if(wzDrawD(g)==null)return fin();s.did=1;s.left--;wzTuckOn(g,s.pid,kk);return WZOP.tuck(g,s)};
/* reveal the top dragon: the right size is tucked here; otherwise to your hand, or discard it and gain something */
WZOP.rev=(g,s)=>{const [,sz,other]=s.a,id=wzDrawD(g);if(id==null)return true;const D=wzD(id);
  if(sz.includes(D.sz)&&wzAt(g,s.pid,s.k)&&wzAt(g,s.pid,s.k).d){wzTuckOn(g,s.pid,s.k);wzLog(g,`${nmid(s.pid)} reveals ${D.n} (${WZSZ[D.sz]}) and tucks it`,'🂠');return true}
  if(other==='hand'){g.P[s.pid].hand.d.push(id);wzLog(g,`${nmid(s.pid)} reveals ${D.n} (${WZSZ[D.sz]}) and keeps it`,'🂠')}else{g.ddisc.push(id);wzLog(g,`${nmid(s.pid)} reveals ${D.n} (${WZSZ[D.sz]}): discarded`,'🂠');wzIns(g,...wzOps(g,s.pid,s.k,[['g',other.join(',')]]))}return true};
/* excavate a space for free: src hand | disp | deck | handdisp */
WZOP.exc=(g,s,mv)=>{const src=s.a[1],P=g.P[s.pid],cvs=WZC.filter(cv=>wzCanExc(g,s.pid,cv,1));if(!cvs.length)return true;
  if(src==='deck'&&s.card==null){s.card=wzDrawC(g);if(s.card==null)return true}
  const cards=src==='deck'?[{v:'k',l:'🪨 '+wzCvSay(s.card)}]:[...(src.includes('hand')?P.hand.c.map((id,i)=>({v:'h'+i,l:'🪨 '+wzCvSay(id)+' (hand)'})):[]),...(src.includes('disp')?g.disp.c.map((id,i)=>id==null?null:{v:'p'+i,l:'🪨 '+wzCvSay(id)+' (display)'}).filter(Boolean):[])];
  if(!cards.length)return true;const L=[];cards.forEach(c=>cvs.forEach(cv=>L.push({v:c.v+'@'+cv,l:`${c.l} → ${WZCI[cv]} ${WZCN[cv]}`})));
  if(!mv)return wzAsk(g,s,'Excavate a space for free',L,{opt:src!=='deck',kind:'exc'});const [cs,cv]=String(mv.v).split('@');if(!cvs.includes(cv))return null;let id;
  if(cs==='k')id=s.card;else if(cs[0]==='h'){const i=+cs.slice(1);if(!(i>=0&&i<P.hand.c.length))return null;id=P.hand.c.splice(i,1)[0]}else if(cs[0]==='p'){const i=+cs.slice(1);if(g.disp.c[i]==null)return null;id=g.disp.c[i];g.disp.c[i]=null}else return null;
  wzLog(g,`${nmid(s.pid)} excavates ${WZCN[cv]} space ${wzNextEx(g,s.pid,cv)+1} for free`,'⛏️');const col=wzNextEx(g,s.pid,cv);g.P[s.pid].mat[cv][col]={cv:id,d:null};
  const st=wzOps(g,s.pid,cv+col,wzCv(id).op);if(col===3)st.push({t:'cover',pid:s.pid});wzIns(g,...st);return true};
/* play a dragon without the entice action: src hand | disp | handdisp; mode free | disc1 | nores | cover */
WZOP.playD=(g,s,mv)=>{const [,src,mode]=s.a,P=g.P[s.pid],L=[];
  const cand=[...(src.includes('hand')?P.hand.d.map((id,i)=>({id,v:'h'+i,w:'hand'})):[]),...(src.includes('disp')?g.disp.d.map((id,i)=>id==null?null:{id,v:'p'+i,w:'display'}).filter(Boolean):[])];
  cand.forEach(c=>{if(!wzCanAfford(g,s.pid,c.id,mode==='cover'?'free':mode))return;
    if(mode==='cover')wzDr(g,s.pid).forEach(([kk])=>{if(wzD(c.id).cv.includes(kk[0]))L.push({v:c.v+'@'+kk,l:`${wzD(c.id).n} on top of ${wzSpotL(g,s.pid,kk)}`})});
    else wzFits(g,s.pid,c.id).forEach(cv=>L.push({v:c.v+'@'+cv,l:`${wzD(c.id).n} (${c.w}) → ${WZCI[cv]} ${WZCN[cv]}`}))});
  if(!L.length)return true;if(!mv)return wzAsk(g,s,mode==='disc1'?'Play a dragon with a discount of 1 egg or resource':mode==='nores'?'Play a dragon, ignoring its resource costs':mode==='cover'?'Play a dragon on top of one of yours':'Play a dragon for free',L,{opt:1});
  const o=L.find(x=>x.v===mv.v);if(!o)return null;const [cs,where]=o.v.split('@'),i=+cs.slice(1);let id;
  if(cs[0]==='h'){id=P.hand.d[i];wzPayD(g,s.pid,id,mode==='cover'?'free':mode);P.hand.d.splice(P.hand.d.indexOf(id),1)}else{id=g.disp.d[i];wzPayD(g,s.pid,id,mode);g.disp.d[i]=null}
  if(mode==='cover'){const x=wzAt(g,s.pid,where),old=x.d;x.d={id,e:Math.min(old.e,wzD(id).cap),c:old.c,t:old.t+1,cr:old.cr};wzLog(g,`${nmid(s.pid)} plays ${wzD(id).n} on top of ${wzD(old.id).n}`,'🐉');
    if(wzD(id).ty==='W'&&wzD(id).op)wzIns(g,...wzOps(g,s.pid,where,wzD(id).op));return true}
  wzPut(g,s.pid,id,where,'plays');return true};
/* activate another dragon's ability: wp when-played | opr once-per-round | advopr if-activated or once-per-round | mat a printed mat benefit */
WZOP.act=(g,s,mv)=>{const kind=s.a[1];
  if(kind==='mat'){const L=[];WZC.forEach(cv=>{const M=WYMAT[cv];[['in',M.in],...M.after.map((o,i)=>['a'+i,o]),['end',M.end]].forEach(([v,o])=>L.push({v:cv+':'+v,l:`${WZCI[cv]} ${wzSayOps(o)}`,o}))});
    if(!mv)return wzAsk(g,s,'Use one benefit printed on your mat',L.map(({v,l})=>({v,l})),{opt:1});const x=L.find(o=>o.v===mv.v);if(!x)return null;wzIns(g,...wzOps(g,s.pid,s.k,x.o));return true}
  const ok=D=>kind==='wp'?D.ty==='W':kind==='opr'?D.ty==='O':D.ty==='A'||D.ty==='O';
  const L=wzDr(g,s.pid).filter(([kk,d])=>kk!==s.k&&ok(wzD(d.id))&&(wzD(d.id).op||wzD(d.id).h)).map(([kk,d])=>({v:kk,l:`${wzD(d.id).n}: ${wzD(d.id).op?wzSayOps(wzD(d.id).op):'cache or tuck 1'}`,k:kk}));
  if(!L.length)return true;if(!mv)return wzAsk(g,s,'Activate the ability of which dragon?',L,{opt:1,kind:'spot'});if(!L.some(o=>o.v===mv.v))return null;const D=wzD(wzAt(g,s.pid,mv.v).d.id);
  if(D.h)wzIns(g,{t:'adv',pid:s.pid,k:mv.v});else wzIns(g,...wzOps(g,s.pid,mv.v,D.op));return true};
WZOP.if=(g,s)=>{const [,c,ops]=s.a,P=g.P[s.pid],n=cv=>P.mat[cv].filter(x=>x&&x.d).length,left=g.ps[(g.ps.indexOf(s.pid)+1)%g.ps.length];
  const nl=cv=>g.P[left].mat[cv].filter(x=>x&&x.d).length;let ok=false;
  if(c==='gg'||c==='cc'||c==='aa')ok=n(c[0])>=nl(c[0]);else if(c==='cv3')ok=n(s.k[0])>=3;else if(c==='colfull')ok=WZC.every(cv=>{const x=P.mat[cv][+s.k[1]];return x&&x.d});else if(c==='guild1')ok=P.gm>=1;
  if(ok)wzIns(g,...wzOps(g,s.pid,s.k,ops));return true};
/* gain 2 different (two) or 1 (two1) of a list */
WZOP.two=(g,s,mv)=>{const L=s.a[1].split(',').filter(t=>!(s.got||[]).includes(t)),need=s.a[0]==='two'?2:1;if((s.got||[]).length>=need)return true;
  if(!mv)return wzAsk(g,s,need===2?`Gain ${s.got?'another':'2'} different benefit${s.got?'':'s'}`:'Gain 1 benefit',L.map(t=>({v:t,l:WZTN[t]})),{opt:1});if(!L.includes(mv.v))return null;
  (s.got||(s.got=[])).push(mv.v);wzIns(g,...wzOps(g,s.pid,s.k,[['g',mv.v]]));return s.got.length>=need?true:WZOP.two(g,s)};
WZOP.two1=WZOP.two;
WZOP.swap=(g,s,mv)=>{const L=wzDr(g,s.pid).map(([kk])=>kk);if(L.length<2)return true;s.p=s.p||[];const left=L.filter(x=>!s.p.includes(x));
  if(!mv)return wzAsk(g,s,s.p.length?'Swap it with which dragon?':'Swap two dragons: pick the first',left.map(kk=>({v:kk,l:wzSpotL(g,s.pid,kk),k:kk})),{opt:!s.p.length,kind:'spot'});
  if(!left.includes(mv.v))return null;s.p.push(mv.v);if(s.p.length<2)return WZOP.swap(g,s);const a=wzAt(g,s.pid,s.p[0]),b=wzAt(g,s.pid,s.p[1]);[a.d,b.d]=[b.d,a.d];wzLog(g,`${nmid(s.pid)} swaps two dragons`,'🔀');return true};
/* one-off card effects */
WZOP.x=(g,s,mv)=>{const f=WZX[s.a[1]];return f?f(g,s,mv):true};
const WZX={};
const wzTop=(g,n)=>{const o=[];for(let i=0;i<n;i++){const id=wzDrawD(g);if(id!=null)o.push(id)}return o};
const wzHere=(g,s)=>{const x=wzAt(g,s.pid,s.k);return x&&x.d?x:null};
WZX.shyDraw=(g,s,mv)=>{if(!s.cards){const n=g.P[s.pid].mat[s.k[0]].filter(x=>x&&x.d&&wzD(x.d.id).per==='S').length;s.cards=wzTop(g,n);s.tk=0}
  if(!s.cards.length||s.tk>=2||!wzHere(g,s)){g.P[s.pid].hand.d.push(...s.cards);return true}
  if(!mv)return wzAsk(g,s,`Tuck up to 2 of the drawn cards here (${2-s.tk} left); the rest go to your hand`,s.cards.map((id,i)=>({v:i,l:'Tuck '+wzD(id).n})),{opt:1});
  const i=+mv.v;if(!(i>=0&&i<s.cards.length))return null;s.cards.splice(i,1);s.tk++;wzTuckOn(g,s.pid,s.k);return WZX.shyDraw(g,s)};
WZX.tuckCost=(g,s,mv)=>{const P=g.P[s.pid];if(!P.hand.d.length||!wzHere(g,s))return true;
  if(!mv)return wzAsk(g,s,'Tuck a dragon from your hand here to gain 1 resource from its cost?',P.hand.d.map((id,i)=>({v:i,l:`${wzD(id).n} (${WZR.filter(r=>wzD(id).cost[r]).map(r=>WZRI[r]).join('')||'no resources'})`})),{opt:1});
  const i=+mv.v;if(!(i>=0&&i<P.hand.d.length))return null;const id=P.hand.d.splice(i,1)[0],R=WZR.filter(r=>wzD(id).cost[r]);wzTuckOn(g,s.pid,s.k);
  if(R.length)wzIns(g,{t:'op',pid:s.pid,k:s.k,a:['x','pickOf',R]});return true};
WZX.pickOf=(g,s,mv)=>{const R=s.a[2];if(R.length===1){g.P[s.pid].res[R[0]]++;return true}if(!mv)return wzAsk(g,s,'Gain which resource?',R.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!R.includes(mv.v))return null;g.P[s.pid].res[mv.v]++;return true};
WZX.tuck2any=(g,s,mv)=>{s.n=s.n??2;const P=g.P[s.pid];if(s.n<=0||!P.hand.d.length||!wzHere(g,s))return true;
  if(!mv)return wzAsk(g,s,`Tuck a dragon from your hand here to gain any resource? (${s.n} left)`,P.hand.d.map((id,i)=>({v:i,l:'Tuck '+wzD(id).n})),{opt:1});
  const i=+mv.v;if(!(i>=0&&i<P.hand.d.length))return null;P.hand.d.splice(i,1);s.n--;wzTuckOn(g,s.pid,s.k);wzIns(g,{t:'gt',pid:s.pid,k:s.k,tok:'any'},{t:'op',pid:s.pid,k:s.k,a:s.a,n:s.n,_c:1});return true};
/* draw 3: keep 1, discard 1, tuck 1 here */
WZX.draw3=(g,s,mv)=>{if(!s.cards){s.cards=wzTop(g,3);s.ph=0}if(!s.cards.length)return true;const ph=['keep','discard','tuck here'][s.ph];
  if(s.cards.length===1&&s.ph===2||!wzHere(g,s)&&s.ph===2){if(wzHere(g,s))wzTuckOn(g,s.pid,s.k);else g.ddisc.push(s.cards[0]);return true}
  if(!mv)return wzAsk(g,s,`Drawn ${s.cards.length}: which do you ${ph}?`,s.cards.map((id,i)=>({v:i,l:wzD(id).n})));const i=+mv.v;if(!(i>=0&&i<s.cards.length))return null;const id=s.cards.splice(i,1)[0];
  if(s.ph===0)g.P[s.pid].hand.d.push(id);else if(s.ph===1)g.ddisc.push(id);else{wzTuckOn(g,s.pid,s.k);return true}s.ph++;if(!s.cards.length)return true;return WZX.draw3(g,s)};
WZX.draw2tuck=(g,s,mv)=>{if(!s.cards)s.cards=wzTop(g,2);if(!s.cards.length)return true;const spots=wzDr(g,s.pid).map(([kk])=>kk);
  if(s.cards.length===1||!spots.length){g.P[s.pid].hand.d.push(...s.cards);return true}
  const L=[];s.cards.forEach((id,i)=>spots.forEach(kk=>L.push({v:i+'@'+kk,l:`Tuck ${wzD(id).n} under ${wzSpotL(g,s.pid,kk)} (keep the other)`,k:kk})));
  if(!mv)return wzAsk(g,s,'Drew 2: tuck 1 under any dragon and keep the other',L,{kind:'spot'});const [i,kk]=String(mv.v).split('@');if(!s.cards[+i]||!spots.includes(kk))return null;
  s.cards.splice(+i,1);wzTuckOn(g,s.pid,kk);g.P[s.pid].hand.d.push(...s.cards);return true};
WZX.guildTuck=(g,s)=>{const n=g.P[s.pid].gm;for(let i=0;i<n;i++)if(wzHere(g,s)&&wzDrawD(g)!=null)wzTuckOn(g,s.pid,s.k);return true};
WZX.playfulTuck=(g,s)=>{wzDr(g,s.pid).filter(([kk,d])=>kk[0]===s.k[0]&&wzD(d.id).per==='P').forEach(([kk])=>{if(wzDrawD(g)!=null)wzTuckOn(g,s.pid,kk)});return true};
WZX.draw2may=(g,s,mv)=>{if(!s.cards)s.cards=wzTop(g,2);if(!s.cards.length||!wzHere(g,s)){g.P[s.pid].hand.d.push(...(s.cards||[]));return true}
  if(!mv)return wzAsk(g,s,'Tuck a drawn card here? (the rest go to your hand)',s.cards.map((id,i)=>({v:i,l:'Tuck '+wzD(id).n})),{opt:1,onSkip:'hand'});
  const i=+mv.v;if(!(i>=0&&i<s.cards.length))return null;s.cards.splice(i,1);wzTuckOn(g,s.pid,s.k);return WZX.draw2may(g,s)};
WZX.drawMay=(g,s,mv)=>{if(s.id==null){s.id=wzDrawD(g);if(s.id==null)return true}if(!wzHere(g,s)){g.P[s.pid].hand.d.push(s.id);return true}
  if(!mv)return wzAsk(g,s,`Drew ${wzD(s.id).n}: tuck it here or keep it?`,[{v:'t',l:'Tuck it here'},{v:'k',l:'Keep it'}]);
  if(mv.v==='t')wzTuckOn(g,s.pid,s.k);else if(mv.v==='k')g.P[s.pid].hand.d.push(s.id);else return null;return true};
WZX.gainTuck=(g,s,mv)=>{if(s.id==null){if(!mv){const L=g.disp.d.map((id,i)=>id==null?null:{v:i,l:'🐉 '+wzD(id).n}).filter(Boolean);L.push({v:'deck',l:'🂠 Top of the deck'});return wzAsk(g,s,'Gain a dragon card',L,{kind:'cardd'})}
    if(mv.v==='deck')s.id=wzDrawD(g);else{const i=+mv.v;if(g.disp.d[i]==null)return null;s.id=g.disp.d[i];g.disp.d[i]=null}if(s.id==null)return true;mv=null}
  const spots=wzDr(g,s.pid).map(([kk])=>kk);if(!mv)return wzAsk(g,s,`Tuck ${wzD(s.id).n} under a dragon, or keep it?`,[{v:'keep',l:'Keep it in my hand'},...spots.map(kk=>({v:kk,l:'Tuck under '+wzSpotL(g,s.pid,kk),k:kk}))],{kind:'spot'});
  if(mv.v==='keep'){g.P[s.pid].hand.d.push(s.id);return true}if(!spots.includes(mv.v))return null;wzTuckOn(g,s.pid,mv.v);return true};
WZX.aggRes=(g,s,mv)=>{if(s.n==null){s.n=g.P[s.pid].mat[s.k[0]].filter(x=>x&&x.d&&wzD(x.d.id).per==='A').length;s.got=[]}
  if(s.got.length<s.n){if(!mv)return wzAsk(g,s,`Gain a resource (${s.n-s.got.length} to go)`,WZR.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!WZR.includes(mv.v))return null;g.P[s.pid].res[mv.v]++;s.got.push(mv.v);mv=null;if(s.got.length<s.n)return WZX.aggRes(g,s)}
  if(s.got.length&&wzHere(g,s))wzIns(g,{t:'op',pid:s.pid,k:s.k,a:['cache','any',2,'h','sup']});return true};
WZX.choose2=(g,s,mv)=>{if(!mv)return wzAsk(g,s,'Choose a resource: you gain 2, each opponent gains 1',WZR.map(r=>({v:r,l:WZRI[r]+' '+WZRN[r]})),{kind:'res'});if(!WZR.includes(mv.v))return null;
  g.P[s.pid].res[mv.v]+=2;wzOthers(g,s.pid).forEach(o=>g.P[o].res[mv.v]++);return true};
WZX.cavesToEggs=(g,s,mv)=>{s.n=s.n??2;const P=g.P[s.pid];if(s.n<=0||!P.hand.c.length)return true;
  if(!mv)return wzAsk(g,s,`Discard a cave card to lay an egg? (${s.n} left)`,P.hand.c.map((id,i)=>({v:i,l:'Discard '+wzCvSay(id)})),{opt:1});const i=+mv.v;if(!(i>=0&&i<P.hand.c.length))return null;
  g.cdisc.push(P.hand.c.splice(i,1)[0]);s.n--;wzIns(g,{t:'op',pid:s.pid,k:s.k,a:['lay',1,'a']},{t:'op',pid:s.pid,k:s.k,a:s.a,n:s.n});return true};

/* ---------- the end ---------- */
function wzEndVP(g,p,kk,D,left){const P=g.P[p],M=P.mat,cv=kk[0],col=+kk[1],inCv=M[cv].filter(x=>x&&x.d),all=wzDr(g,p).map(([k,d])=>[k,wzD(d.id)]);
  const cnt=f=>all.filter(([,B])=>f(B)).length,adjD=all.filter(([k])=>wzAdj(k,kk));
  switch(D.no){case 39:{const a=M[cv][col-1],b=M[cv][col+1];return a&&a.d&&b&&b.d?2:0}
    case 41:return [0,1,2,3].filter(r=>{const pos=wzObjPos(g,r,p);return g.ps.every(q=>wzObjPos(g,r,q)<=pos)}).length*2;
    case 42:return (inCv.length-1)*3;case 44:return P.gm*2;case 46:return WZC.every(c=>M[c][col]&&M[c][col].d)?3:0;
    case 49:return Math.min(...['A','P','H','S'].map(x=>cnt(B=>B.per===x)))*4;case 51:return adjD.filter(([,B])=>B.per==='S').length;
    case 52:return Math.min(8,cnt(B=>B.ty==='O')*2);case 54:return inCv.some(x=>wzD(x.d.id).per==='A')?0:4;
    case 59:return (inCv.filter(x=>wzD(x.d.id).per==='S').length-1)*2;case 71:return Math.min(8,cnt(B=>B.ty==='W')*2);
    case 74:return M[cv].every(x=>x)?3:0;case 81:return M[cv].slice(col+1).some(x=>x&&x.d)?0:3;
    case 86:{const n=left.d;if(n>=2){left.d-=2;return 3}if(n>=1){left.d--;return 1}return 0}
    case 87:{const n=left.c;if(n>=2){left.c-=2;return 3}if(n>=1){left.c--;return 1}return 0}
    case 91:return ['H','S','L'].every(z=>inCv.some(x=>wzD(x.d.id).sz===z))?8:0;
    case 93:return M.g.filter(x=>x&&x.d).length>=4?5:0;case 97:return cnt(B=>B.ty==='A');case 98:return M[cv].every(x=>x&&x.d)?3:0;
    case 101:return Math.min(8,cnt(B=>B.ty==='E')*2);case 102:return inCv.filter(x=>wzD(x.d.id).per==='P').length>=2?3:0;
    case 106:return -2*(inCv.filter(x=>wzD(x.d.id).per==='A').length-1);case 112:return adjD.length*2;
    case 119:return Math.min(12,cnt(B=>B.sz==='M')*3);case 122:return -(inCv.filter(x=>wzD(x.d.id).per==='A').length-1);
    case 124:return Math.min(12,cnt(B=>B.sz==='L')*3);case 129:return adjD.filter(([,B])=>B.per==='P').length*3;
    case 131:return Math.min(...['H','S','M','L'].map(z=>cnt(B=>B.sz===z)))*6;case 132:return Math.min(12,cnt(B=>B.sz==='S')*3);
    case 134:return Math.min(12,cnt(B=>B.sz==='H')*4);
    case 144:{const n=left.r;if(n>=2){left.r-=2;return 3}if(n>=1){left.r--;return 1}return 0}
    case 145:return M.a.filter(x=>x&&x.d).length>=4?5:0;
    case 149:if(left.r>=1&&left.c>=1&&left.d>=1){left.r--;left.c--;left.d--;return 5}return 0;
    case 150:return WZC.some(c=>c!==cv&&M[c][col]&&M[c][col].d&&wzD(M[c][col].d.id).per==='H')?4:0;
    case 167:return M.c.filter(x=>x&&x.d).length>=4?5:0;case 179:return Math.floor(wzEggs(g,p)/2);case 183:return cnt(B=>B.per==='H');default:return 0}}
function wzGuildEnd(g,p){const P=g.P[p],M=P.mat,D=wzDr(g,p).map(([k,d])=>[k,wzD(d.id)]);switch(WYGUILD[g.guild].end){
  case 'rf':return Math.max(...WZC.map(cv=>D.filter(([k])=>k[0]===cv).reduce((a,[,B])=>a+WZR.reduce((b,r)=>b+(B.cost[r]||0),0),0)));
  case 'hl':return WZC.reduce((a,cv)=>a+M[cv].filter(x=>x&&x.cv).length,0);case 'pl':return Math.floor(wzEggs(g,p)/2);
  case 'sf':return [0,1,2,3].filter(c=>WZC.every(cv=>M[cv][c]&&M[cv][c].d)).length*3;default:return 0}}
function wzScore(g,p){const P=g.P[p],D=wzDr(g,p),left={r:wzRes(g,p),d:P.hand.d.length,c:P.hand.c.length};
  let abil=0;D.forEach(([kk,d])=>{const B=wzD(d.id);if(B.ty==='E')abil+=wzEndVP(g,p,kk,B,left);if(B.h&&B.h.each==='vp')abil+=B.h.r==='tuck'?d.t:(d.cr[B.h.r]||0)});
  const gv=g.gbox[4].reduce((a,q,i)=>a+(q===p?(i===0?6:i===1?3:1):0),0)+g.gbox[3].filter(q=>q===p).length*wzGuildEnd(g,p);
  const F={guild:gv,dragons:D.reduce((a,[,d])=>a+wzD(d.id).vp,0),abil,eggs:wzEggs(g,p),cache:D.reduce((a,[,d])=>a+d.c,0),tuck:D.reduce((a,[,d])=>a+d.t,0),coins:P.coin,items:left.r+left.d+left.c};
  F.obj=[0,1,2,3].reduce((a,r)=>a+(wzObjPts(g,r)[p]||0),0);F.tot=F.guild+F.dragons+F.abil+F.eggs+F.cache+F.tuck+F.coins+Math.floor(F.items/4)+F.obj;F.nd=D.length;return F}
function wzEnd(g){g.phase='done';g.q=[];g.ask=null;g.fin={};g.ps.forEach(p=>g.fin[p]=wzScore(g,p));
  const P=act().slice().sort((a,b)=>g.fin[b.id].tot-g.fin[a.id].tot||g.fin[b.id].nd-g.fin[a.id].nd);gAnn(g,'🏆 Game over',P.map(p=>`${nm(p)} ${g.fin[p.id].tot}`).join(' · '),'🏆');gLog(g,'Round 4 is over: final scoring','🏁',1);g.n++;return true}
/* the score pad (Finish & reveal) */
function wzSyncScorer(g){if(!g||!g.fin)return;act().forEach(p=>{const F=g.fin[p.id];if(!F)return;p.wy={g:[0,1,2,3].map(r=>g.oc[r]?g.oc[r][p.id]:0),f:{guild:F.guild,dragons:F.dragons,abil:F.abil,eggs:F.eggs,cache:F.cache,tuck:F.tuck,coins:F.coins,items:F.items}}});S.hr=4}

/* ---------- words (our own short wording) ---------- */
function wzSayToks(t){const c={};t.split(',').forEach(x=>c[x]=(c[x]||0)+1);return Object.entries(c).map(([k,n])=>`${n>1?n+' ':''}${WZTN[k]}${n>1&&!/s$/.test(WZTN[k])?'s':''}`).join(' + ')}
const WZW={a:'',h:' here',cv:' in this cave',col:' in this column',adj:' next to it'};
function wzSayOps(ops){return (ops||[]).map(a=>{switch(a[0]){
  case 'g':return 'gain '+wzSayToks(a[1]);case 'lay':return `lay ${a[1]} egg${a[1]>1?'s':''}${WZW[a[2]]}`;case 'layEach':return `lay 1 egg on each dragon${WZW[a[1]]}${a[2]?' that is not Aggressive':''}`;
  case 'opp':return 'each opponent may '+wzSayOps(a[1]);case 'pay':return `${a[3]>1?`up to ${a[3]}×, `:''}pay ${wzSayToks(a[1])}${a[4]==='cv'?' (eggs from this cave)':a[4]==='adj'?' (eggs from dragons next to it)':''} to ${wzSayOps(a[2])}`;
  case 'payOr':return a[1].map(([c,o])=>`pay ${wzSayToks(c)}`).join(' or ')+' to '+wzSayOps(a[1][0][1]);
  case 'cache':return `cache ${a[2]>1?'up to '+a[2]+' ':''}${a[1]==='any'?'resource'+(a[2]>1?'s':''):WZRN[a[1]]} from ${a[4]==='gen'?'the supply':'your supply'}${a[3]==='h'?' here':a[3]==='col'?' on a dragon in this column':' on any dragon'}${a[5]?', and if you do '+wzSayOps(a[5]):''}`;
  case 'gc':return `gain ${a[1]==='any'?'a resource':WZRN[a[1]]}; you may cache it${a[2]==='h'?' here':' on any dragon'}`;
  case 'tuck':return `tuck ${a[3]>1?'up to '+a[3]+' ':''}dragon card${a[3]>1?'s':''} from ${a[1]==='hand'?'your hand':'the deck'}${a[2]==='h'?' here':a[2]==='col'?' under a dragon in this column':' under any dragon'}${a[4]?', and if you do '+wzSayOps(a[4]):''}`;
  case 'rev':return `reveal the top dragon: if it's ${a[1].split('').map(z=>WZSZ[z]).join(' or ')}, tuck it here; otherwise ${a[2]==='hand'?'keep it':'discard it and gain '+wzSayToks(a[2].join(','))}`;
  case 'exc':return `excavate a space free (cave card from ${a[1]==='hand'?'your hand':a[1]==='disp'?'the display':a[1]==='deck'?'the deck':'your hand or the display'})`;
  case 'playD':return a[2]==='disc1'?'play a dragon with a discount of 1 egg or resource':a[2]==='nores'?'play a dragon ignoring its resource costs':a[2]==='cover'?'play a dragon on top of one of yours':`play a dragon from ${a[1]==='disp'?'the display':'your hand'} free`;
  case 'act':return a[1]==='wp'?"use another dragon's when-played ability":a[1]==='opr'?"use a dragon's once-per-round ability":a[1]==='mat'?'use a benefit printed on your mat':"use a dragon's if-activated or once-per-round ability";
  case 'if':return ({gg:'if your Golden Grotto has at least as many dragons as your left neighbour\'s',cc:'if your Crimson Cavern has at least as many dragons as your left neighbour\'s',aa:'if your Amethyst Abyss has at least as many dragons as your left neighbour\'s',cv3:'if this cave has 3+ dragons',colfull:'if this column is full',guild1:'if you have a guild marker'})[a[1]]+', '+wzSayOps(a[2]);
  case 'two':return 'gain 2 different of: '+a[1].split(',').map(t=>WZTN[t]).join(' / ');case 'two1':return 'gain 1 of: '+a[1].split(',').map(t=>WZTN[t]).join(' / ');
  case 'swap':return 'swap two of your dragons';
  case 'x':return ({shyDraw:'draw a dragon card for each Shy dragon in this cave; tuck up to 2 here',tuckCost:'tuck a dragon from your hand here and gain a resource from its cost',tuck2any:'up to 2×, tuck a dragon from your hand here and gain any resource',
    draw3:'draw 3 dragons: keep 1, discard 1, tuck 1 here',draw2tuck:'draw 2 dragons: keep 1, tuck 1 under any dragon',guildTuck:'tuck a card from the deck here for each guild marker you placed',
    playfulTuck:'tuck a card from the deck under each Playful dragon in this cave',draw2may:'draw 2 dragons; tuck either or both here',drawMay:'draw a dragon; you may tuck it here',
    gainTuck:'gain a dragon card; you may tuck it under any dragon',aggRes:'gain a resource for each Aggressive dragon in this cave; cache up to 2 here',choose2:'gain 2 of one resource; each opponent gains 1 of it',
    cavesToEggs:'discard up to 2 cave cards, lay an egg for each'})[a[1]]||a[1];
  default:return a[0]}}).join('; ')}
const wzCvSay=id=>{const s=wzSayOps(wzCv(id).op);return s.charAt(0).toUpperCase()+s.slice(1)};
const wzDSay=D=>D.h?`If activated: ${D.h.r==='tuck'?'tuck a dragon card from your hand here':`cache ${WZRN[D.h.r]} from your supply here`}. Each time: ${D.h.each==='vp'?'+1 VP at the end':wzSayOps(D.h.each)}. On the 3rd: also ${wzSayOps(D.h.third)}.`:D.ty==='E'?D.say:wzSayOps(D.op).replace(/^./,c=>c.toUpperCase());

/* ---------- computer players ---------- */
const wzVal=id=>{const D=wzD(id);return D.vp+(D.ty==='A'?2:D.ty==='O'?2:D.ty==='E'?1.5:1)+D.cap*.4};
function wzBotAction(g,pid){const P=g.P[pid],A=wzActs(g,pid);
  if(A.ent.length){const o=A.ent.slice().sort((a,b)=>wzVal(P.hand.d[b.i])-wzVal(P.hand.d[a.i]))[0];const cv=o.cv.slice().sort((a,b)=>wzNextD(g,pid,a)-wzNextD(g,pid,b))[0];return {a:'ent',i:o.i,cv}}
  const want=WZC.filter(cv=>P.hand.d.some(id=>wzD(id).cv.includes(cv))&&wzNextD(g,pid,cv)<0);
  if(A.exc.length&&P.coin>=2){const cv=A.exc.find(c=>want.includes(c))||A.exc.sort((a,b)=>wzNextEx(g,pid,a)-wzNextEx(g,pid,b))[0];return {a:'exc',cv,i:0}}
  if(A.exp.length){const sc=cv=>P.mat[cv].filter(x=>x&&x.d).length*2+1-P.ex[cv]*1.5;const cv=A.exp.slice().sort((a,b)=>sc(b)-sc(a))[0];if(sc(cv)>0||P.coin>=3)return {a:'exp',cv}}
  if(A.exc.length)return {a:'exc',cv:A.exc[0],i:0};return {a:'pass'}}
function wzBotAns(g,pid){const A=g.ask,L=A.opts||[];if(!L.length)return {skip:1};
  if(/discard down|Column 4 bonus/.test(A.msg)&&A.opt)return {skip:1};
  if(A.kind==='keep'){const s=g.q[0];const opts=L.slice().sort((a,b)=>{const v=o=>o.v[0]==='d'?wzVal(s.o.d[+o.v.slice(1)]):3.5;return v(a)-v(b)});return {v:opts[0].v}}
  if(A.kind==='res'){const P=g.P[pid],need={};P.hand.d.forEach(id=>WZR.forEach(r=>need[r]=(need[r]||0)+(wzD(id).cost[r]||0)-P.res[r]/2));const o=L.slice().sort((a,b)=>(need[b.v]||0)-(need[a.v]||0))[0];return {v:o.v}}
  if(A.kind==='mark')return {v:L[Math.floor(Math.random()*Math.min(L.length,3))].v};
  return {v:L[0].v}}
function wzBotStep(g,q){const pid=q.id;if(g.phase==='done')return false;
  if(g.ask){if(g.ask.pid!==pid)return false;if(wzMove(g,pid,wzBotAns(g,pid)))return true;if(wzMove(g,pid,{skip:1}))return true;for(const o of g.ask.opts||[])if(wzMove(g,pid,{v:o.v}))return true;return false}
  if(g.turn!==pid||g.q.length)return false;const a=wzBotAction(g,pid);return wzMove(g,pid,a)||wzMove(g,pid,{a:'pass'})}
