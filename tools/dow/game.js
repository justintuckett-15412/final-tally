/* ================= Dead of Winter (2014) on the phones =================
   State in S.dwg (plain JSON). Questions: g.ask={pid,msg,opts:[{v,l,k?}],opt,kind}; answers {v} or {skip:1}.
   Steps live in g.q; a handler DWQ[t](g,s,mv) returns true (done), false (asked) or null (bad answer).
   Votes: g.vote={kind,target,by,msg,need:[pids],got:{pid:bool}}; moves {vote:true|false}. */
const DWL=['colony','police','grocery','school','library','hospital','gas'];
const DWLN={colony:'Colony',police:'Police Station',grocery:'Grocery Store',school:'School',library:'Library',hospital:'Hospital',gas:'Gas Station'};
const DWEXP=['blank','blank','blank','blank','blank','blank','wound','wound','wound','frost','frost','bite']; /* d12 – to check with Justin */
const DWSYMN={food:'food',fuel:'fuel',med:'medicine',tools:'tools',weapon:'weapon',book:'book',outsider:'outsider'};
const dwOn=()=>S.game==='deadofwinter';
const dwG=()=>S.dwg||null;
const dwShuf=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const dwD6=()=>1+Math.floor(Math.random()*6);
const dwStale=g=>{const ids=act().map(p=>p.id);return !g.ps||g.ps.length!==ids.length||g.ps.some(id=>!ids.includes(id))};
const dwLoc=id=>DWLOC.find(l=>l.id===id);
const dwK=c=>DWK[DWI[c].k],dwSym=c=>dwK(c).sym,dwCN=c=>dwK(c).n;
const dwSv=id=>DWS[id];
const dwMO=g=>DWMO.find(m=>m.id===g.mo.id),dwMOS=g=>dwMO(g)[g.mo.side];
let DWQUIET=0;
const dwLog=(g,t,ic)=>{if(!DWQUIET)gLog(g,t,ic||'🧟')},dwAnn=(g,a,b,ic)=>{if(!DWQUIET)gAnn(g,a,b,ic||'🧟')};
const dwNm=(g,sid)=>dwSv(sid).n.split(' ')[0];
const dwRight=(g,pid)=>{const L=g.ps,i=L.indexOf(pid);return L[(i-1+L.length)%L.length]};
const dwLeft=(g,pid)=>{const L=g.ps,i=L.indexOf(pid);return L[(i+1)%L.length]};
const dwIns=(g,...st)=>{if(g.q.length)g.q.splice(1,0,...st);else g.q.push(...st)};
const dwAsk=(g,s,msg,opts,o={})=>{g.ask={pid:s.pid,msg,opts,opt:!!o.opt,...o};return false};
const dwMine=(g,pid)=>Object.keys(g.sv).filter(k=>g.sv[k].pid===pid).map(Number);
const dwAt=(g,loc)=>Object.keys(g.sv).filter(k=>g.sv[k].loc===loc).map(Number);
const dwActive=g=>g.ps.filter(p=>!g.P[p].exiled);
const dwColN=g=>dwAt(g,'colony').length+g.helpless;
const dwCap=loc=>loc==='colony'?DWCOL.occupantSpaces:dwLoc(loc).surv;
const dwRoom=(g,loc)=>loc==='colony'?DWCOL.occupantSpaces-dwColN(g):dwLoc(loc).surv-dwAt(g,loc).length;
const dwZ=(g,loc)=>loc==='colony'?g.loc.colony.ent.reduce((a,e)=>a+e.z,0):g.loc[loc].z;
const dwBar=(g,loc)=>loc==='colony'?g.loc.colony.ent.reduce((a,e)=>a+e.bar,0):g.loc[loc].bar;
const dwEntCap=loc=>loc==='colony'?DWCOL.zombPerEntrance:dwLoc(loc).zomb;
const dwHas=(g,sid,name)=>{const s=g.sv[sid];if(!s)return false;if(dwSv(sid).n===name)return true;
  if(dwSv(sid).n==='John Price'&&s.loc!=='colony')return dwAt(g,s.loc).some(o=>o!==sid&&dwSv(o).n===name);return false};
const dwEqK=(g,sid,k)=>(g.sv[sid]?g.sv[sid].eq:[]).find(c=>DWI[c].k===k);
const dwStarter=c=>DWI[c].d==='starter';

/* ---------- setup ---------- */
/* no exile votes in co-op or with the no-betrayer house rule */
function dwNoExile(g){return g.mode==='coop'||g.mode==='loyal'}
function dwDeal(o={}){const P=act(),ps=P.map(p=>p.id),n=ps.length;let mode=o.mode||'normal';if(n<=2&&mode!=='coop'&&mode!=='loyal')mode='coop';
  const moId=o.mo||DWMO[Math.floor(Math.random()*DWMO.length)].id,side=o.side||(mode==='coop'?'hc':'std');
  const g={_atom:1,id:String(Math.random()).slice(2,10),ps,fp:null,turn:null,phase:'setup',mode,n:0,tno:0,rndNo:0,
    mo:{id:moId,side,cards:[],tokens:0,done:false,failed:false},morale:0,round:0,food:0,starve:0,helpless:0,waste:[],gone:[],removed:0,
    crisis:null,decks:{},loc:{colony:{ent:Array.from({length:DWCOL.entrances},()=>({z:0,bar:0}))}},sv:{},P:{},q:[],ask:null,vote:null,lg:[],
    noFood:0,noMove:0,xrSeen:[],susp:{},last:null,starters:n};
  DWLOC.forEach(l=>{g.loc[l.id]={z:0,bar:0,noise:0}});
  DWLOC.forEach(l=>{g.decks[l.id]=dwShuf(DWI.filter(c=>c.d===l.id).map(c=>c.id))});
  const starter=dwShuf(DWI.filter(c=>c.d==='starter').map(c=>c.id));
  g.decks.surv=dwShuf(DWS.filter(s=>!(mode==='coop'&&s.noco)).map(s=>s.id));
  g.decks.crisis=dwShuf(DWCR.map((c,i)=>i));
  g.decks.xr=typeof DWXR!=='undefined'?dwShuf(DWXR.filter(x=>!(mode==='coop'&&x.noco)).map(x=>x.no)):[];
  g.decks.exileObj=dwShuf(DWSO.exile.map((x,i)=>i));
  /* secret objectives: 2 regular per player + 1 betrayal (betrayer variant: 1 regular per player) */
  let pool=[];if(mode!=='coop'){const reg=dwShuf(DWSO.regular.map((x,i)=>({t:'regular',i}))).slice(0,(mode==='betrayer'?1:2)*n);pool=dwShuf(reg.concat(mode==='loyal'?[]:dwShuf(DWSO.betrayal.map((x,i)=>({t:'betrayal',i}))).slice(0,1)))}
  ps.forEach((p,k)=>{g.P[p]={hand:starter.splice(0,n<=2?7:5),lead:null,follow:[],obj:mode==='coop'?null:pool[k],betray:mode!=='coop'&&pool[k].t==='betrayal',
    exiled:false,exObj:null,dice:[],xr:null,xrBy:null,voted:false,moved:[],req:null,cn:0};g.susp[p]=0});
  /* main objective setup */
  const M=dwMO(g)[side];g.morale=M.mor;g.round=M.rnd;
  const h=M.helpless;if(h){g.helpless=h==='players'?n:h==='players+3'?n+3:h==='players+5'?n+5:+h||0}
  dwAddZ(g,'colony',M.zc||0,1);DWLOC.forEach(l=>dwAddZ(g,l.id,M.zo||0,1));
  ps.forEach(p=>g.q.push({t:'pickSurv',pid:p,o:g.decks.surv.splice(0,4),keep:n<=2?3:2}));
  g.q.push({t:'begin'});S.dwg=g;
  dwAnn(g,'Dead of Winter',`${n} players · ${dwMOName(g)}${side==='hc'?' (hardcore)':''}${mode==='coop'?' · co-op':mode==='loyal'?' · no betrayer':''}. Choose your survivors.`,'❄️');
  dwLog(g,`Dead of Winter: ${n} players, main objective ${dwMOName(g)}${side==='hc'?' (hardcore)':''}, morale ${g.morale}, ${g.round} rounds`,'❄️');
  dwRun(g);return g}
const dwMOName=g=>dwMOS(g).name||dwMO(g).n;
const DWQ={};
DWQ.pickSurv=(g,s,mv)=>{s.kept=s.kept||[];const L=s.o.filter(x=>!s.kept.includes(x));
  if(s.kept.length<s.keep){if(!mv)return dwAsk(g,s,`Choose a survivor to keep (${s.keep-s.kept.length} more)`,L.map(id=>({v:id,l:`${dwSv(id).n} (${dwSv(id).job}) · influence ${dwSv(id).inf} · attack ${dwSv(id).atk}+ · search ${dwSv(id).sr}+`})),{kind:'surv'});
    const v=+mv.v;if(!L.includes(v))return null;s.kept.push(v);mv=null;if(s.kept.length<s.keep)return DWQ.pickSurv(g,s)}
  if(!mv)return dwAsk(g,s,'Which one is your group leader?',s.kept.map(id=>({v:id,l:`${dwSv(id).n} · influence ${dwSv(id).inf}`})),{kind:'surv'});
  const v=+mv.v;if(!s.kept.includes(v))return null;const P=g.P[s.pid];P.lead=v;P.follow=s.kept.filter(x=>x!==v);
  s.kept.forEach(id=>g.sv[id]={pid:s.pid,loc:'colony',w:0,fb:0,eq:[],used:{},mv:-1});
  g.decks.surv.push(...s.o.filter(x=>!s.kept.includes(x)));dwShuf(g.decks.surv);return true};
DWQ.begin=g=>{const fp=g.ps.slice().sort((a,b)=>dwSv(g.P[b].lead).inf-dwSv(g.P[a].lead).inf)[0];g.fp=fp;g.phase='play';
  dwLog(g,`${nmid(fp)} has the most influential leader and goes first`,'🎖️');dwIns(g,{t:'rstart'});return true};

/* ---------- the actor and the queue ---------- */
const dwActor=g=>{if(!g||g.phase==='done')return null;if(g.vote){const w=g.vote.need.find(p=>!(p in g.vote.got));return w||null}
  if(g.ask)return g.ask.pid;return g.q.length?null:g.turn};
const dwWaits=(g,pid)=>dwActor(g)===pid;
function dwRun(g){let guard=0;while(g.q.length&&!g.vote&&g.phase!=='done'&&guard++<2000){const s=g.q[0];const h=DWQ[s.t];if(!h){console.error('DoW: no step',s.t);g.q.shift();continue}
  const done=h(g,s);if(g.phase==='done')return;if(!done)return;g.ask=null;g.q.shift()}if(guard>=2000)console.error('DoW: step loop')}
function dwMove(g,pid,mv){if(!g||g.phase==='done'||!mv)return false;
  if(g.vote){if(!('vote' in mv)||!g.vote.need.includes(pid)||pid in g.vote.got)return false;g.vote.got[pid]=!!mv.vote;
    if(g.vote.need.every(p=>p in g.vote.got))dwVoteDone(g);dwRun(g);g.n++;return true}
  if(g.ask){if(g.ask.pid!==pid)return false;const s=g.q[0];if(!s)return false;if(mv.skip&&!g.ask.opt)return false;
    const ok=mv.skip?(s.onSkip?s.onSkip(g,s):true):DWQ[s.t](g,s,mv);if(ok===null)return false;if(ok){g.ask=null;g.q.shift()}dwRun(g);g.n++;return true}
  if(mv.a==='yawn'){if(g.q.length||g.phase!=='play'||g.turn==null||pid!==dwRight(g,g.turn)||g.P[pid].xr==null||g.yawned===g.tno)return false;g.yawned=g.tno;dwXr(g,g.turn,'yawn',{});dwRun(g);g.n++;return true}
  if(g.q.length||g.turn!==pid||g.phase!=='play')return false;const r=dwAction(g,pid,mv);if(r){if(mv.a!=='end')dwXr(g,pid,'action',{a:mv.a});dwRun(g);g.n++}return r}

/* ---------- rounds and turns ---------- */
DWQ.rstart=g=>{g.rndNo++;if(!g.decks.crisis.length)g.decks.crisis=dwShuf(DWCR.map((c,i)=>i));let cid=g.decks.crisis.pop();const F=dwFlags(g);
  if(F.skipNextCrisis){F.skipNextCrisis=0;dwLog(g,`${DWCR[cid].n} is removed: no crisis this round`,'🛑');g.crisis={id:cid,add:[],skip:1}}else g.crisis={id:cid,add:[]};
  DWLOC.forEach(l=>g.loc[l.id].noise=0);
  g.ps.forEach(p=>{const P=g.P[p],my=dwMine(g,p);let n=Math.max(0,1+my.length+my.reduce((a,s)=>a+g.sv[s].eq.filter(c=>DWI[c].k==='goggles').length,0)+((F.extraDie||{})[p]||0));P.dice=Array.from({length:n},dwD6);P.used=[];P.cn=0;
    my.forEach(s=>g.sv[s].used={})});F.extraDie={};if(F.sleep&&F.sleep<g.rndNo)F.sleep=0;
  if(F.workout)g.ps.forEach(p=>dwIns(g,{t:'workout',pid:p}));
  if(F.olivia){const o=dwSidN('Olivia Brown');if(g.sv[o]&&g.sv[o].loc==='colony')dwExposure(g,o,'her experiments')}
  dwAnn(g,`Round ${g.rndNo}`,`Crisis: ${DWCR[cid].n} – needs ${DWCR[cid].need.map(x=>DWSYMN[x]).join(' or ')}. ${g.round} round${g.round===1?'':'s'} left.`,'🌨️');
  dwLog(g,`Round ${g.rndNo}: crisis ${DWCR[cid].n} (needs ${DWCR[cid].need.map(x=>DWSYMN[x]).join('/')})`,'⚠️');
  g.order=[];const i0=g.ps.indexOf(g.fp);for(let k=0;k<g.ps.length;k++)g.order.push(g.ps[(i0+k)%g.ps.length]);g.oi=0;dwIns(g,{t:'tstart',pid:g.order[0]});return true};
DWQ.tstart=(g,s)=>{const pid=s.pid,P=g.P[pid];g.turn=pid;g.tno++;P.voted=false;P.moved=[];g.last=null;
  /* the player to the right draws a crossroads card */
  const dr=dwRight(g,pid);if(g.decks.xr.length&&g.P[dr].xr==null){g.P[dr].xr=g.decks.xr.pop();g.P[dr].xrFor=pid;g.P[dr].xrPend=0}
  /* frostbite: each survivor with frostbite gets another wound */
  dwMine(g,pid).forEach(sid=>{const x=g.sv[sid];if(x&&x.fb>0){dwLog(g,`${dwNm(g,sid)}'s frostbite worsens`,'🥶');dwWound(g,sid,1,'frostbite')}});
  if(g.phase==='done')return true;
  dwAnn(g,`${nmid(pid)}’s turn`,`${P.dice.length} unused dice: ${P.dice.join(', ')}`,'🎲');
  const F=dwFlags(g);if(F.addict&&F.addict.p===pid&&g.sv[F.addict.s])dwIns(g,{t:'addict',pid});if(F.sleep===g.rndNo&&P.dice.length)dwIns(g,{t:'sleep',pid});
  dwXr(g,pid,'turnStart',{});
  /* Forest Plum: may remove himself to raise morale */
  dwMine(g,pid).filter(sid=>dwSv(sid).n==='Forest Plum').forEach(sid=>dwIns(g,{t:'forest',pid,sid}));return true};
DWQ.forest=(g,s,mv)=>{if(!g.sv[s.sid])return true;if(!mv)return dwAsk(g,s,'Remove Forest Plum from the game to raise morale by 1?',[{v:'y',l:'Yes, remove Forest (+1 morale)'}],{opt:1});
  dwRemoveSurv(g,s.sid,'leaves the colony');dwMorale(g,1,'Forest');return true};
function dwEndTurn(g,pid){const P=g.P[pid];
  if(P.req){P.hand.filter(c=>P.req.includes(c)).forEach(c=>{P.hand.splice(P.hand.indexOf(c),1);dwToWaste(g,pid,c)});P.req=null}
  dwXr(g,pid,'turnEnd',{});
  const dr=dwRight(g,pid);if(g.P[dr].xr!=null&&g.P[dr].xrFor===pid&&!g.P[dr].xrPend){g.decks.xr.unshift(g.P[dr].xr);g.P[dr].xr=null}
  g.oi++;if(g.oi<g.order.length)dwIns(g,{t:'tstart',pid:g.order[g.oi]});else{g.turn=null;dwIns(g,{t:'colony',step:0})}}

/* ---------- morale, wounds, death ---------- */
function dwMorale(g,d,why){if(!d)return;g.morale=Math.max(0,Math.min(10,g.morale+d));dwLog(g,`Morale ${d>0?'+':''}${d}${why?` (${why})`:''} → ${g.morale}`,d>0?'🙂':'😞');
  if(g.morale<=0)dwEnd(g,'morale')}
function dwWound(g,sid,n,kind){const x=g.sv[sid];if(!x)return;for(let i=0;i<n;i++){if(!g.sv[sid])return;
  if(kind==='frost'&&(dwSv(sid).n==='Harman Brooks'||dwEqK(g,sid,'shoes')!=null))kind='wound';
  x.w++;if(kind==='frost')x.fb++;dwLog(g,`${dwNm(g,sid)} ${kind==='frost'?'gets frostbite':'is wounded'} (${x.w})`,kind==='frost'?'🥶':'🩸');
    if(x.w>=(dwSv(sid).n==='Buddy Davis'?4:3)){dwKill(g,sid,'wounds');return}}}
function dwKill(g,sid,why){const x=g.sv[sid];if(!x)return;const pid=x.pid,P=g.P[pid];dwLog(g,`${dwSv(sid).n} dies${why?` (${why})`:''}`,'💀');
  dwLose(g,sid);g.removed++;if(!P.exiled)dwMorale(g,-1,'a survivor died')}
function dwRemoveSurv(g,sid,why){if(!g.sv[sid])return;dwLog(g,`${dwSv(sid).n} ${why||'is removed from the game'}`,'🚪');dwLose(g,sid);g.removed++}
function dwLose(g,sid){const x=g.sv[sid],pid=x.pid,P=g.P[pid];
  if(x.eq.length){if(x.loc==='colony')P.hand.push(...x.eq);else{g.decks[x.loc].push(...x.eq);dwShuf(g.decks[x.loc])}}
  delete g.sv[sid];P.follow=P.follow.filter(s=>s!==sid);
  if(P.lead===sid){P.lead=null;if(P.follow.length){const nl=P.follow.slice().sort((a,b)=>dwSv(b).inf-dwSv(a).inf)[0];P.lead=nl;P.follow=P.follow.filter(s=>s!==nl)}}
  if(P.lead==null&&!P.follow.length){g.gone.push(...P.hand);P.hand=[];const ns=g.decks.surv.pop();
    if(ns!=null){P.lead=ns;g.sv[ns]={pid,loc:P.exiled?dwNonColony(g):'colony',w:0,fb:0,eq:[],used:{},mv:-1};dwLog(g,`${nmid(pid)} lost everyone; ${dwSv(ns).n} becomes their new leader`,'🧍')}}}
const dwNonColony=g=>DWLOC.map(l=>l.id).filter(l=>dwRoom(g,l)>0).sort((a,b)=>dwZ(g,a)-dwZ(g,b))[0]||'police';
function dwKillHelpless(g){if(g.helpless<=0)return;g.helpless--;dwLog(g,'A helpless survivor dies','💀');dwMorale(g,-1,'a helpless survivor died')}

/* ---------- exposure and bites ---------- */
function dwExposure(g,sid,why,info){const x=g.sv[sid];if(!x)return;const r=DWEXP[Math.floor(Math.random()*DWEXP.length)];
  dwLog(g,`${dwNm(g,sid)} rolls for exposure${why?` (${why})`:''}: ${r==='blank'?'nothing':r==='frost'?'frostbite':r}`,r==='bite'?'🧟':'🎲');
  if(r==='wound'||r==='frost'){dwWound(g,sid,1,r==='frost'?'frost':'wound');if(g.sv[sid]&&g.sv[sid].pid===g.turn)dwXr(g,g.turn,r==='frost'?'frostbite':'wound',{s:sid,onMove:!!(info&&info.onMove),to:info&&info.to})}
  else if(r==='bite'){if(dwSv(sid).n==='Sparky'){dwWound(g,sid,1,'wound');return}const loc=x.loc;dwKill(g,sid,'bitten');if(g.phase!=='done')dwIns(g,{t:'bite',loc,pid:null})}}
DWQ.bite=(g,s,mv)=>{if(s.sid==null||!g.sv[s.sid]){const L=dwAt(g,s.loc).filter(o=>dwSv(o).n!=='Sparky'&&dwEqK(g,o,'flesh')==null).sort((a,b)=>dwSv(a).inf-dwSv(b).inf);if(!L.length)return true;s.sid=L[0];s.pid=g.sv[L[0]].pid}
  const sid=s.sid;if(g.P[s.pid].exiled){dwKill(g,sid,'the bite spreads');s.sid=null;return g.phase==='done'?true:DWQ.bite(g,s)}
  if(!mv)return dwAsk(g,s,`The bite spreads to ${dwSv(sid).n}! Kill them now, or roll the exposure die (only a blank saves them)?`,[{v:'kill',l:'Kill them (the spread stops)'},{v:'roll',l:'Roll the exposure die'}],{kind:'bite'});
  if(mv.v==='kill'){dwKill(g,sid,'the bite spread');return true}if(mv.v!=='roll')return null;
  const r=DWEXP[Math.floor(Math.random()*DWEXP.length)];dwLog(g,`${dwNm(g,sid)} rolls: ${r==='blank'?'blank – saved!':r}`,'🎲');if(r==='blank')return true;
  dwKill(g,sid,'the bite spread');if(g.phase==='done')return true;s.sid=null;return DWQ.bite(g,s)};

/* ---------- zombies ---------- */
/* add n zombies at a location; colony entrances 1..6 round robin from entrance 1 */
function dwAddZ(g,loc,n,setup){for(let k=0;k<n;k++){if(g.phase==='done')return;
  const e=loc==='colony'?g.loc.colony.ent[k%DWCOL.entrances]:g.loc[loc],cap=dwEntCap(loc);
  if(e.z+e.bar<cap){e.z++;continue}if(setup)continue;
  if(e.bar>0){e.bar--;dwLog(g,`A zombie breaks a barricade at the ${DWLN[loc]}${loc==='colony'?` (entrance ${k%6+1})`:''}`,'🚧');continue}
  /* overrun */
  const L=dwAt(g,loc).sort((a,b)=>dwSv(a).inf-dwSv(b).inf);dwLog(g,`The ${DWLN[loc]}${loc==='colony'?` entrance ${k%6+1}`:''} is overrun!`,'🧟');
  if(L.length)dwKill(g,L[0],'overrun');else if(loc==='colony'&&g.helpless>0)dwKillHelpless(g)}}
/* kill one zombie at a location (colony: the fullest entrance) */
function dwKillZ(g,loc,by){if(dwZ(g,loc)<=0)return false;if(loc==='colony'){const e=g.loc.colony.ent.slice().sort((a,b)=>b.z-a.z)[0];e.z--}else g.loc[loc].z--;
  if(g.mo.id==='samples'&&!g.mo.done){const r=dwD6();if(r>=4){g.mo.tokens++;dwLog(g,`Sample roll ${r}: a sample is collected (${g.mo.tokens})`,'🧪')}}
  return true}
function dwPlaceBar(g,loc,n,pref){let b=0;for(let i=0;i<n;i++){if(loc==='colony'){const R2=dwEntRisk(g);const E=(pref!=null&&g.loc.colony.ent[pref].z+g.loc.colony.ent[pref].bar<3?[g.loc.colony.ent[pref]]:g.loc.colony.ent.map((e,k)=>[e,R2[k]]).filter(([e])=>e.z+e.bar<3).sort((a,b)=>b[1]-a[1]||a[0].bar-b[0].bar||b[0].z-a[0].z).map(x=>x[0]))[0];if(!E)break;E.bar++;b++}
  else{const e=g.loc[loc];if(e.z+e.bar<dwEntCap(loc)){e.bar++;b++}else break}}return b}
const dwBarRoom=(g,loc)=>loc==='colony'?g.loc.colony.ent.some(e=>e.z+e.bar<3):g.loc[loc].z+g.loc[loc].bar<dwEntCap(loc);
function dwMoveZ(g,from,to,n){let m=0;for(let i=0;i<n;i++){if(dwZ(g,from)<=0||!dwBarRoom(g,to))break;
  if(from==='colony'){const e=g.loc.colony.ent.slice().sort((a,b)=>b.z-a.z)[0];e.z--}else g.loc[from].z--;
  if(to==='colony'){const E=g.loc.colony.ent.filter(e=>e.z+e.bar<3).sort((a,b)=>a.z-b.z)[0];E.z++}else g.loc[to].z++;m++}return m}

/* ---------- crossroads hooks ---------- */
function dwXr(g,pid,ev,info){if(typeof dwXrCheck!=='function'||g.phase!=='play'||g.turn==null)return;const tp=g.turn,D=g.P[dwRight(g,tp)];if(!D||D.xr==null||D.xrPend)return;
  try{const r=dwXrCheck(g,tp,ev,info||{});if(r){D.xrPend=1;dwIns(g,{t:'xr',pid:tp,no:r.no,drawer:r.drawer,ctx:r.ctx})}}catch(e){console.error('DoW crossroads',e)}}

/* ---------- actions ---------- */
const dwDie=(g,pid,i)=>{const D=g.P[pid].dice;return i>=0&&i<D.length?D[i]:null};
const dwSpend=(g,pid,i)=>{const P=g.P[pid];const v=P.dice.splice(i,1)[0];P.used.push(v);return v};
const dwMineOK=(g,pid,s)=>g.sv[s]&&g.sv[s].pid===pid;
function dwAction(g,pid,mv){const P=g.P[pid],a=mv.a;g.last={p:pid,t:a};
  switch(a){
  case 'end':dwEndTurn(g,pid);return true;
  case 'attack':{const s=+mv.s;if(!dwMineOK(g,pid,s)||dwFrozen(g,s))return false;const x=g.sv[s],d=dwDie(g,pid,+mv.die);if(d==null&&!mv.free)return false;
    const blade=['blade','wrench'].map(k=>dwEqK(g,s,k)).find(c=>c!=null&&!x.used['c'+c]);
    if(!mv.free&&d<dwSv(s).atk&&!(blade!=null))return false;
    if(mv.target==='z'||mv.target==null){if(dwZ(g,x.loc)<=0)return false;if(!mv.free){if(d<dwSv(s).atk){x.used['c'+blade]=1}dwSpend(g,pid,+mv.die)}
      return dwAttackZ(g,pid,s,mv.use)}
    const t=+mv.target;if(!g.sv[t]||g.sv[t].pid===pid||g.sv[t].loc!==x.loc)return false;if(!mv.free){if(d<dwSv(s).atk)x.used['c'+blade]=1;dwSpend(g,pid,+mv.die)}
    const r=dwD6(),tp=g.sv[t].pid;dwLog(g,`${dwNm(g,s)} attacks ${dwSv(t).n}: rolls ${r}`,'⚔️');
    if(r<=dwSv(t).atk){const H=g.P[tp].hand;if(H.length){const c=H.splice(Math.floor(Math.random()*H.length),1)[0];P.hand.push(c);dwLog(g,`${nmid(pid)} takes a card from ${nmid(tp)}`,'🃏')}dwWound(g,t,1,'wound')}
    dwXr(g,pid,'attack',{s,target:t});return true}
  case 'search':{const s=+mv.s;if(!dwMineOK(g,pid,s)||dwFrozen(g,s))return false;const x=g.sv[s],d=dwDie(g,pid,+mv.die);if(x.loc==='colony'||d==null||d<dwSv(s).sr||!g.decks[x.loc].length)return false;
    dwSpend(g,pid,+mv.die);{const MC=dwFlags(g).missingChild;if(MC&&MC.seen&&!MC.seen.includes(x.loc))MC.seen.push(x.loc)}dwIns(g,{t:'search',pid,s,loc:x.loc});dwXr(g,pid,'search',{s,at:x.loc});return true}
  case 'barricade':{const s=+mv.s;if(!dwMineOK(g,pid,s))return false;const x=g.sv[s];if(!dwBarRoom(g,x.loc))return false;
    let free=false;if(mv.die==null){const ash=dwMine(g,pid).find(o=>dwHas(g,o,'Ashley Ross')&&!g.sv[o].used.ab&&(o===s||true));const bb=x.loc==='colony'?dwEqK(g,s,'barbook'):null;
      if(bb!=null&&!x.used['c'+bb]){x.used['c'+bb]=1;free=true}else if(ash!=null){g.sv[ash].used.ab=1;free=true}else return false}
    else{if(dwDie(g,pid,+mv.die)==null)return false;dwSpend(g,pid,+mv.die)}
    let n=1;const hm=dwEqK(g,s,'hammer');if(hm!=null&&!x.used['c'+hm]){x.used['c'+hm]=1;n=2}
    const b=dwPlaceBar(g,x.loc,n,mv.ent);dwLog(g,`${dwNm(g,s)} builds ${b} barricade${b>1?'s':''} at the ${DWLN[x.loc]}${free?' (free)':''}`,'🚧');dwXr(g,pid,'barricade',{s,loc:x.loc});return true}
  case 'clean':{if(!dwMine(g,pid).some(o=>g.sv[o].loc==='colony')||dwDie(g,pid,+mv.die)==null||!g.waste.length)return false;dwSpend(g,pid,+mv.die);
    let n=3;const col=dwMine(g,pid).filter(o=>g.sv[o].loc==='colony');const br=col.find(o=>dwHas(g,o,'Brandon Kane')&&!g.sv[o].used.ab);
    if(br!=null){g.sv[br].used.ab=1;n=5}else{for(const o of dwMine(g,pid)){const m=dwEqK(g,o,'mop');if(m!=null&&!g.sv[o].used['c'+m]){g.sv[o].used['c'+m]=1;n=5;break}}}
    const r=g.waste.splice(Math.max(0,g.waste.length-n),n);g.gone.push(...r);dwLog(g,`${nmid(pid)} cleans ${r.length} cards from the waste pile`,'🧹');dwXr(g,pid,'cleanWaste',{n:r.length});return true}
  case 'attract':{const s=+mv.s;if(!dwMineOK(g,pid,s)||dwDie(g,pid,+mv.die)==null)return false;const to=g.sv[s].loc,from=mv.from;if(!DWL.includes(from)||from===to||dwZ(g,from)<=0||!dwBarRoom(g,to))return false;
    dwSpend(g,pid,+mv.die);const m=dwMoveZ(g,from,to,2);dwLog(g,`${dwNm(g,s)} lures ${m} zombie${m>1?'s':''} from the ${DWLN[from]} to the ${DWLN[to]}`,'📣');return true}
  case 'ability':return dwAbility(g,pid,mv);
  case 'use':return dwUseEquip(g,pid,mv);
  case 'play':return dwPlay(g,pid,mv);
  case 'move':{const s=+mv.s,to=mv.to;if(!dwMineOK(g,pid,s)||!DWL.includes(to))return false;const x=g.sv[s];if(x.loc===to||P.moved.includes(s)||dwRoom(g,to)<=0)return false;
    if(g.noMove>=g.rndNo&&!P.exiled)return false;if(to==='colony'&&P.exiled)return false;if(!dwCanMove(g,s,to))return false;
    let fuel=null;if(mv.fuel!=null){fuel=+mv.fuel;if(!P.hand.includes(fuel)||DWI[fuel].k!=='fuel')return false}
    const from=x.loc;x.loc=to;P.moved.push(s);if(fuel!=null){P.hand.splice(P.hand.indexOf(fuel),1);dwToWaste(g,pid,fuel)}
    dwLog(g,`${dwNm(g,s)} moves from the ${DWLN[from]} to the ${DWLN[to]}${fuel!=null?' (using fuel)':''}`,'🚶');
    dwMoveFx(g,s,from,to,fuel!=null);dwXr(g,pid,'move',{s,from,to,fuel:fuel!=null});return true}
  case 'food':{const n=+mv.n||1,i=+mv.die;if(P.exiled||g.noFood>=g.rndNo||g.food<n||dwDie(g,pid,i)==null||P.dice[i]+n>6)return false;g.food-=n;P.dice[i]+=n;
    dwLog(g,`${nmid(pid)} spends ${n} food to raise a die to ${P.dice[i]}`,'🥫');dwXr(g,pid,'spendFood',{n,die:i});return true}
  case 'crisis':{if(P.exiled)return false;if(dwFlags(g).grayBeard===pid&&dwMine(g,pid).some(o=>dwSv(o).n==='Gray Beard'))return false;let c;if(mv.eq){const s=+mv.eq.s;c=+mv.eq.c;if(!dwMineOK(g,pid,s)||!g.sv[s].eq.includes(c))return false;g.sv[s].eq.splice(g.sv[s].eq.indexOf(c),1)}
    else{c=+mv.c;if(!P.hand.includes(c)||(P.req||[]).includes(c))return false;P.hand.splice(P.hand.indexOf(c),1)}
    g.crisis.add.push({pid,c});P.cn++;dwLog(g,`${nmid(pid)} adds a card to the crisis (face down)`,'🂠');return true}
  case 'request':{const others=g.ps.filter(p=>p!==pid&&g.P[p].hand.length);if(!others.length)return false;
    dwIns(g,...others.map(o=>({t:'give',pid:o,to:pid,what:mv.what||''})));dwLog(g,`${nmid(pid)} asks the others for ${mv.what?mv.what+' ':''}cards`,'🙏');return true}
  case 'handoff':{const s=+mv.s,c=+mv.c,to=+mv.to;if(!dwMineOK(g,pid,s)||!g.sv[s].eq.includes(c)||!g.sv[to]||to===s||g.sv[to].loc!==g.sv[s].loc)return false;
    g.sv[s].eq.splice(g.sv[s].eq.indexOf(c),1);g.sv[to].eq.push(c);if(g.sv[s].used['c'+c])g.sv[to].used['c'+c]=1;dwLog(g,`${dwNm(g,s)} hands ${dwCN(c)} to ${dwNm(g,to)}`,'🤝');return true}
  case 'exile':{const t=mv.target;if(dwNoExile(g)||P.voted||P.exiled||t===pid||!g.P[t]||g.P[t].exiled)return false;P.voted=true;
    const need=dwActive(g);g.vote={kind:'exile',target:t,by:pid,msg:`${nmid(pid)} calls a vote to exile ${nmid(t)}`,need,got:{}};dwLog(g,`${nmid(pid)} calls a vote to exile ${nmid(t)}`,'🗳️');return true}
  case 'janet':{const c=+mv.c,t=+mv.t,j=dwSidN('Janet Taylor');if(!dwFlags(g).janetCare||!g.sv[j]||g.sv[j].loc!=='colony'||!P.hand.includes(c)||!dwMineOK(g,pid,t)||g.sv[t].loc!=='colony'||g.sv[t].w<=0)return false;
    P.hand.splice(P.hand.indexOf(c),1);dwToWaste(g,pid,c);g.sv[t].w--;if(g.sv[t].fb>0)g.sv[t].fb--;dwLog(g,`Janet patches up ${dwNm(g,t)}`,'🩹');return true}
  case 'objcard':{const c=+mv.c;if(!P.hand.includes(c)||!dwObjCardOK(g,c))return false;P.hand.splice(P.hand.indexOf(c),1);g.mo.cards.push(c);dwLog(g,`${nmid(pid)} places ${dwCN(c)} under the main objective`,'🎯');return true}
  default:return false}}
function dwAttackZ(g,pid,s,use){const x=g.sv[s],loc=x.loc;let kill=1,expo=dwSv(s).n!=='Mike Cho',noise=false;const U=k=>{const c=dwEqK(g,s,k);if(c!=null&&!x.used['c'+c]){x.used['c'+c]=1;return true}return false};
  const P=g.P[pid];
  if(use==='edward'&&dwHas(g,s,'Edward White')&&loc==='colony'&&!x.used.ed){const m=P.hand.find(c=>DWI[c].k==='med');if(m!=null){P.hand.splice(P.hand.indexOf(m),1);dwToWaste(g,pid,m);x.used.ed=1;kill=3;expo=false}}
  else if(use==='lighter'){const f=P.hand.find(c=>DWI[c].k==='fuel'),lc=dwEqK(g,s,'lighter');if(f!=null&&lc!=null&&!x.used['c'+lc]){x.used['c'+lc]=1;P.hand.splice(P.hand.indexOf(f),1);dwToWaste(g,pid,f);kill=4;expo=false}}
  if(kill===1){if(U('shotgun')){kill=2;expo=false;noise=true}else if(U('bat'))kill=2}
  if(expo&&(U('colt')||U('arts')))expo=false;
  const F=dwFlags(g);if(expo&&F.grayBeard===pid&&dwSv(s).n==='Gray Beard'&&!x.used.gb){x.used.gb=1;expo=false}
  if(expo&&(F.noExp||[]).includes(s)&&!x.used.ne){x.used.ne=1;expo=false}
  if(expo&&F.walkways&&loc==='colony'&&g.loc.colony.ent[0].z>0)expo=false;
  let k=0;for(let i=0;i<kill;i++)if(dwKillZ(g,loc,s))k++;
  const wpn=['colt','shotgun','lighter'].map(kk=>dwEqK(g,s,kk)).find(c=>c!=null&&x.used['c'+c]);if(wpn!=null)dwXr(g,pid,'weapon',{card:wpn,s});
  dwLog(g,`${dwNm(g,s)} kills ${k} zombie${k===1?'':'s'} at the ${DWLN[loc]}`,'⚔️');
  if(noise&&loc!=='colony'&&g.loc[loc].noise<4)g.loc[loc].noise++;
  if(expo)dwExposure(g,s,'killing a zombie');dwXr(g,pid,'attack',{s,target:'z',n:k});dwXr(g,pid,'kill',{s,n:k});return true}
/* search: draw, keep or make noise */
DWQ.search=(g,s,mv)=>{const x=g.sv[s.s],P=g.P[s.pid];if(!x){(s.cards||[]).forEach(c=>g.decks[s.loc].unshift(c));return true}const D=g.decks[s.loc];
  if(!s.cards){s.cards=[];s.keep=1;let look=1;
    const kb={grocery:'Andrew Evans',police:'Carla Thompson',hospital:'Janet Taylor',school:'Arthur Thurston',library:'Alexis Grey'}[s.loc];
    if(kb){const w=dwAt(g,s.loc).find(o=>g.sv[o].pid===s.pid&&dwHas(g,o,kb)&&!g.sv[o].used['kb'+s.loc]);if(w!=null&&(w===s.s||dwSv(w).n===kb&&w===s.s||dwHas(g,s.s,kb))){g.sv[w].used['kb'+s.loc]=1;s.keep++}}
    const bp=dwEqK(g,s.s,'bp_'+s.loc);if(bp!=null&&!x.used['c'+bp]){x.used['c'+bp]=1;s.keep++}
    if(dwHas(g,s.s,'David Garcia'))look++;if(dwHas(g,s.s,'Jenny Clark')&&!x.used.jen){x.used.jen=1;look+=3}
    for(let i=0;i<look&&D.length;i++)s.cards.push(D.pop());s.got=[]}
  const room=g.loc[s.loc].noise<4&&D.length>0;
  if(s.got.length<s.keep&&s.cards.length){if(!mv)return dwAsk(g,s,`Searching the ${DWLN[s.loc]}: keep ${s.keep-s.got.length>1?(s.keep-s.got.length)+' cards':'a card'}${room?', or make noise to draw more':''}`,
      [...s.cards.map(c=>({v:c,l:`Keep ${dwCN(c)} (${DWSYMN[dwSym(c)]})`})),...(room?[{v:'noise',l:`Make noise (draw ${dwFlash(g,s)} more)`}]:[])],{kind:'search'});
    if(mv.v==='noise'){if(!room)return null;g.loc[s.loc].noise++;const n=dwFlash(g,s,1);for(let i=0;i<n&&D.length;i++)s.cards.push(D.pop());dwLog(g,`${dwNm(g,s.s)} makes noise at the ${DWLN[s.loc]}`,'🔊');return DWQ.search(g,s)}
    const c=+mv.v;if(!s.cards.includes(c))return null;s.cards.splice(s.cards.indexOf(c),1);s.got.push(c);P.hand.push(c);mv=null;if(s.got.length<s.keep&&s.cards.length)return DWQ.search(g,s)}
  D.unshift(...s.cards);s.cards=[];dwLog(g,`${dwNm(g,s.s)} searches the ${DWLN[s.loc]} and keeps ${s.got.length} card${s.got.length===1?'':'s'}`,'🔍');return true};
function dwFlash(g,s,use){const f=dwEqK(g,s.s,'flashlight');if(f!=null&&!g.sv[s.s].used['c'+f]){if(use)g.sv[s.s].used['c'+f]=1;return 3}return 1}
DWQ.give=(g,s,mv)=>{const P=g.P[s.pid];if(!P.hand.length)return true;
  if(!mv)return dwAsk(g,s,`${nmid(s.to)} asks for ${s.what?s.what+' ':''}cards. Give one? (It is shown and must be played.)`,P.hand.map(c=>({v:c,l:`Give ${dwCN(c)}`})),{opt:1,kind:'give'});
  const c=+mv.v;if(!P.hand.includes(c))return null;P.hand.splice(P.hand.indexOf(c),1);const T=g.P[s.to];T.hand.push(c);(T.req||(T.req=[])).push(c);
  dwLog(g,`${nmid(s.pid)} gives ${nmid(s.to)} ${dwCN(c)}`,'🤝');return true};
/* survivor abilities */
function dwAbility(g,pid,mv){const s=+mv.s;if(!dwMineOK(g,pid,s)||dwJailed(g,s))return false;if(mv.who==='greenhouse')return dwGreenhouse(g,pid,mv);const x=g.sv[s],nm=mv.who||dwSv(s).n,P=g.P[pid];if(!dwHas(g,s,nm))return false;
  const S2=DWS.find(q=>q.n===nm);if(!S2)return false;const key='ab'+S2.id;if(S2.opr&&x.used[key])return false;
  if(S2.at==='colony'&&x.loc!=='colony')return false;if(['school','police','grocery','hospital','library'].includes(S2.at)&&x.loc!==S2.at)return false;
  let di=null;if(S2.die){di=+mv.die;const d=dwDie(g,pid,di);if(d==null||d<S2.die)return false}
  const go=()=>{if(di!=null)dwSpend(g,pid,di);if(S2.opr)x.used[key]=1;return true};
  switch(nm){
  case 'Maria Lopez':if(dwZ(g,'school')<=0)return false;go();dwKillZ(g,'school',s);dwLog(g,`${dwNm(g,s)} kills a zombie at the school`,'⚔️');return true;
  case 'Loretta Clay':go();g.food+=2;dwLog(g,'Loretta adds 2 food','🥫');return true;
  case 'Sophie Robinson':{const loc=mv.loc;if(!g.decks[loc]||!g.decks[loc].length)return false;go();const c=g.decks[loc][g.decks[loc].length-1];dwIns(g,{t:'info',pid,msg:`Top of the ${DWLN[loc]} deck: ${dwCN(c)}`});return true}
  case 'Annaleigh Chan':case 'Gray Beard':{const t=mv.target;if(!g.P[t]||t===pid||!g.P[t].hand.length)return false;go();const H=g.P[t].hand,i=Math.floor(Math.random()*H.length);
    if(nm==='Gray Beard'){const c=H.splice(i,1)[0];P.hand.push(c);dwLog(g,`Gray Beard takes a card from ${nmid(t)}`,'🏴‍☠️')}else dwIns(g,{t:'info',pid,msg:`A random card in ${nmid(t)}'s hand: ${dwCN(H[i])}`});return true}
  case 'Bev Russell':if(g.helpless<1||dwZ(g,'colony')<=0)return false;go();{let k=0;for(let i=0;i<2;i++)if(dwKillZ(g,'colony',s))k++;dwLog(g,`Bev kills ${k} zombie${k>1?'s':''} at the colony`,'⚔️')}return true;
  case 'Ashley Ross':{if(!dwBarRoom(g,x.loc))return false;go();const b=dwPlaceBar(g,x.loc,1);dwLog(g,`Ashley builds a barricade at the ${DWLN[x.loc]} (free)`,'🚧');return true}
  case 'Brian Lee':{const i=+mv.die2;if(dwDie(g,pid,i)==null||P.dice[i]>=6)return false;go();P.dice[i]++;dwLog(g,`Brian raises a die to ${P.dice[i]}`,'🎲');return true}
  case 'Talia Jones':{if(g.decks.crisis.length<1)return false;go();const T=g.decks.crisis.slice(-2).reverse();dwIns(g,{t:'info',pid,msg:`Next crises: ${T.map(i=>DWCR[i].n+' ('+DWCR[i].need.map(z=>DWSYMN[z]).join('/')+')').join(', then ')}`});return true}
  case 'Olivia Brown':{const t=mv.target!=null?+mv.target:s;if(!g.sv[t]||g.sv[t].loc!==x.loc||g.sv[t].w<=0)return false;go();const y=g.sv[t];y.w--;if(y.fb>0)y.fb--;dwLog(g,`Olivia heals ${dwNm(g,t)}`,'🩹');return true}
  case 'Daniel Smith':{if(dwZ(g,x.loc)<=0)return false;go();let k=0;for(let i=0;i<2;i++)if(dwKillZ(g,x.loc,s))k++;dwLog(g,`Daniel kills ${k} zombie${k>1?'s':''} at the ${DWLN[x.loc]}`,'⚔️');dwExposure(g,s,'killing zombies');dwXr(g,pid,'kill',{s,n:k});return true}
  case 'Gabriel Diaz':{const D=g.decks[x.loc];if(x.loc==='colony'||!D||!D.length)return false;go();const T=D.splice(-4);const o=T.find(c=>dwSym(c)==='outsider');
    if(o!=null){T.splice(T.indexOf(o),1);P.hand.push(o);dwLog(g,'Gabriel finds an outsider card','🧑‍🚒')}else dwLog(g,'Gabriel finds no outsiders','🧑‍🚒');D.push(...T);dwShuf(D);return true}
  case 'Thomas Heart':if(dwZ(g,'colony')<=0)return false;go();{let k=0;for(let i=0;i<2;i++)if(dwKillZ(g,'colony',s))k++;dwLog(g,`Thomas kills ${k} zombie${k>1?'s':''} at the colony`,'⚔️')}return true;
  case 'James Meyers':{const L=(mv.dice||P.dice.map((v,i)=>i).filter(i=>P.dice[i]<4)).map(Number).filter(i=>dwDie(g,pid,i)!=null);if(!L.length)return false;go();L.forEach(i=>P.dice[i]=dwD6());dwLog(g,`James rerolls ${L.length} di${L.length>1?'ce':'e'}`,'🎲');return true}
  default:return false}}
DWQ.info=(g,s,mv)=>{if(!mv)return dwAsk(g,s,s.msg,[{v:'ok',l:'OK'}],{kind:'info'});return true};
/* equipped cards you activate */
function dwUseEquip(g,pid,mv){const s=+mv.s,c=+mv.c;if(!dwMineOK(g,pid,s)||!g.sv[s].eq.includes(c))return false;const x=g.sv[s],k=DWI[c].k,P=g.P[pid];if(x.used['c'+c]&&k!=='walkie')return false;
  switch(k){
  case 'rifle':{const loc=mv.loc;if(!DWL.includes(loc)||dwZ(g,loc)<=0)return false;x.used['c'+c]=1;dwKillZ(g,loc,s);dwLog(g,`${dwNm(g,s)} shoots a zombie at the ${DWLN[loc]}`,'🎯');dwXr(g,pid,'weapon',{card:c,s});dwXr(g,pid,'kill',{s,n:1});return true}
  case 'jazz':{const i=+mv.die;if(dwDie(g,pid,i)==null)return false;x.used['c'+c]=1;P.dice[i]=dwD6();dwLog(g,`${nmid(pid)} rerolls a die: ${P.dice[i]}`,'🎲');return true}
  case 'lead':{const i=+mv.die;if(dwDie(g,pid,i)==null||P.dice[i]>=6)return false;x.used['c'+c]=1;P.dice[i]++;return true}
  case 'cook':if(x.loc!=='colony')return false;x.used['c'+c]=1;g.food++;dwLog(g,'The cookbook adds 1 food','🥫');return true;
  case 'barbook':return dwAction(g,pid,{a:'barricade',s});
  case 'walkie':{const t=mv.target,j=+mv.die2,i=+mv.die;if(!g.P[t]||t===pid||dwDie(g,t,j)==null||g.P[t].dice[j]<=1||dwDie(g,pid,i)==null||P.dice[i]>=6)return false;g.P[t].dice[j]--;P.dice[i]++;dwLog(g,`${nmid(pid)} uses the walkie talkie`,'📻');return true}
  default:return false}}
/* play a card from hand: equip, waste effect or event */
function dwToWaste(g,pid,c){if(g.P[pid]&&g.P[pid].exiled)g.gone.push(c);else g.waste.push(c)}
function dwPlay(g,pid,mv){const P=g.P[pid],c=+mv.c;if(!P.hand.includes(c))return false;const K=dwK(c),k=DWI[c].k;const take=()=>P.hand.splice(P.hand.indexOf(c),1);
  if(K.use==='equip'){const s=+mv.s;if(!dwMineOK(g,pid,s))return false;take();g.sv[s].eq.push(c);dwLog(g,`${dwNm(g,s)} equips ${K.n}`,'🎒');dwXr(g,pid,'playCard',{c,s});return true}
  if(K.use==='event'){const n=k==='out3'?2:k==='out2'?1:0;if(!g.decks.surv.length)return false;if(!P.exiled&&dwRoom(g,'colony')<1)return false;take();dwToWaste(g,pid,c);
    const ns=g.decks.surv.pop();g.sv[ns]={pid,loc:P.exiled?dwNonColony(g):'colony',w:0,fb:0,eq:[],used:{},mv:-1};P.follow.push(ns);dwLog(g,`${dwSv(ns).n} (${dwSv(ns).job}) joins ${nmid(pid)}'s group`,'🧍');
    if(!P.exiled){const h=Math.min(n,dwRoom(g,'colony'));g.helpless+=h;if(h)dwLog(g,`${h} helpless survivor${h>1?'s':''} arrive at the colony`,'🧒');g.xrNew=ns;dwXr(g,pid,'outsider',{helpless:h,s:ns})}else{g.xrNew=ns;dwXr(g,pid,'outsider',{helpless:0,s:ns})}dwXr(g,pid,'playCard',{c});return true}
  if(k.startsWith('food')&&dwFlags(g).noFoodCards===g.tno)return false;
  if((dwFlags(g).locked||[]).some(([lc,r])=>lc===c&&r===g.rndNo))return false;
  if(k.startsWith('food')&&P.exiled){const i=+mv.die;if(dwDie(g,pid,i)==null||P.dice[i]>=6)return false;take();g.gone.push(c);P.dice[i]++;dwLog(g,`${nmid(pid)} eats a food card to raise a die`,'🥫');return true}
  switch(k){
  case 'food1':case 'food2':case 'food3':take();g.food+=+k[4];dwToWaste(g,pid,c);dwLog(g,`${nmid(pid)} adds ${k[4]} food`,'🥫');break;
  case 'fuel':return false;/* fuel is played with a move */
  case 'med':{const t=+mv.t;if(!g.sv[t]||g.sv[t].w<=0)return false;if(g.sv[t].pid!==pid&&!dwMine(g,pid).some(o=>g.sv[o].loc===g.sv[t].loc))return false;take();dwToWaste(g,pid,c);
    const y=g.sv[t];y.w--;if(y.fb>0)y.fb--;dwLog(g,`${nmid(pid)} heals ${dwNm(g,t)}`,'💊');dwXr(g,pid,'heal',{healed:t,c});dwXr(g,pid,'playCard',{c,t,heal:1});return true}
  case 'junk':{const i=+mv.die;if(dwDie(g,pid,i)==null)return false;take();dwToWaste(g,pid,c);P.dice[i]=dwD6();dwLog(g,`${nmid(pid)} rerolls a die: ${P.dice[i]}`,'🎲');break}
  case 'adrenaline':{const i=+mv.die,v=+mv.v;if(dwDie(g,pid,i)==null||!(v>=1&&v<=6))return false;take();dwToWaste(g,pid,c);P.dice[i]=v;break}
  case 'padlock':{const s=+mv.s;if(!dwMineOK(g,pid,s)||!dwBarRoom(g,g.sv[s].loc))return false;take();dwToWaste(g,pid,c);const b=dwPlaceBar(g,g.sv[s].loc,2);dwLog(g,`${nmid(pid)} padlocks the ${DWLN[g.sv[s].loc]} (+${b} barricades)`,'🔒');break}
  case 'scissors':{const s=+mv.s;if(!dwMineOK(g,pid,s)||dwZ(g,g.sv[s].loc)<=0)return false;take();dwToWaste(g,pid,c);dwKillZ(g,g.sv[s].loc,s);dwLog(g,`${dwNm(g,s)} kills a zombie with scissors`,'✂️');dwXr(g,pid,'kill',{s,n:1});break}
  case 'megaphone':{const s=+mv.s,from=mv.from;if(!dwMineOK(g,pid,s)||!DWL.includes(from)||from===g.sv[s].loc)return false;take();dwToWaste(g,pid,c);const m=dwMoveZ(g,from,g.sv[s].loc,4);dwLog(g,`The megaphone draws ${m} zombies to the ${DWLN[g.sv[s].loc]}`,'📢');break}
  case 'lamp':{const s=+mv.s;if(!dwMineOK(g,pid,s)||dwZ(g,g.sv[s].loc)<=0)return false;take();dwToWaste(g,pid,c);dwXr(g,pid,'playCard',{c});return dwAttackZ(g,pid,s,null)}
  default:return false}
  dwXr(g,pid,'playCard',{c});return true}
const DWOBJK={leave:['food'],stock:['med','tools','fuel'],cure:['med'],winter:['fuel']};
function dwObjCardOK(g,c){if(dwStarter(c)&&g.mo.id!=='winter')return false;const L=DWOBJK[g.mo.id];if(!L||!L.includes(dwSym(c)))return false;
  if(g.mo.id==='stock'){const n=g.mo.cards.filter(x=>dwSym(x)===dwSym(c)).length;return n<2}if(g.mo.id==='winter')return false;return true}

/* ---------- votes and exile ---------- */
function dwVoteDone(g){const V=g.vote;g.vote=null;const yes=Object.values(V.got).filter(v=>v).length,no=Object.values(V.got).filter(v=>!v).length;
  let pass=yes>no;if(yes===no){const f=V.got[g.fp];pass=f===undefined?false:f}
  dwLog(g,`Vote: ${yes} yes, ${no} no – ${pass?'passed':'failed'}`,'🗳️');
  if(V.kind==='exile'&&pass)dwExile(g,V.target);
  if(V.kind==='xr'&&typeof dwXrVoted==='function')dwXrVoted(g,V.no,pass,V.ctx||{},V.by)}
function dwExile(g,t){const P=g.P[t];P.exiled=true;dwAnn(g,'Exiled!',`${nmid(t)} is exiled from the colony`,'🚪');dwLog(g,`${nmid(t)} is exiled`,'🚪');
  if(dwMO(g).exileRemoves){dwMine(g,t).forEach(s=>{delete g.sv[s]});P.hand=[];P.gone=true;dwLog(g,`${nmid(t)} and their survivors leave the game`,'🚪')}
  else{P.exObj=g.decks.exileObj.pop();dwMine(g,t).filter(s=>g.sv[s].loc==='colony').forEach(s=>dwIns(g,{t:'exileMove',pid:t,s}))}
  const ex=g.ps.filter(p=>g.P[p].exiled&&!g.P[p].betray);if(ex.length>=2){g.morale=0;dwLog(g,'Two loyal players exiled: morale collapses','💔');dwEnd(g,'morale')}}
DWQ.exileMove=(g,s,mv)=>{const x=g.sv[s.s];if(!x||x.loc!=='colony')return true;const L=DWLOC.map(l=>l.id).filter(l=>dwRoom(g,l)>0);if(!L.length)return true;
  if(!mv)return dwAsk(g,s,`Exiled: where does ${dwSv(s.s).n} go?`,L.map(l=>({v:l,l:DWLN[l]})),{kind:'loc'});if(!L.includes(mv.v))return null;x.loc=mv.v;dwExposure(g,s.s,'leaving the colony');return true};

/* ---------- colony phase ---------- */
DWQ.colony=(g,s)=>{if(g.phase==='done')return true;const st=s.step;s.step++;
  /* Winter Has Come: the fuel is placed (or the game is lost) before the colony eats and before the objective check */
  if(st===0&&g.mo.id==='winter'){g.wq=null;dwIns(g,...g.order.map(p=>({t:'winter',pid:p})),{t:'winterChk'},{t:'colony',step:1});return true}
  if(st===0)return DWQ.colony(g,s);
  if(st===1){const c=dwColN(g),hz=dwFlags(g).horse,need=Math.ceil(c/2)+(hz&&g.sv[hz.s]&&!g.P[g.sv[hz.s].pid].exiled?1:0);if(g.food>=need){g.food-=need;dwLog(g,`The colony eats ${need} food (${g.food} left)`,'🍲')}
    else{g.starve++;dwLog(g,`Not enough food! Starvation tokens: ${g.starve}`,'🍽️');dwMorale(g,-g.starve,'starvation')}return g.phase==='done'||DWQ.colony(g,s)}
  if(st===2){const w=Math.floor(g.waste.length/(dwFlags(g).waste15?15:10));if(w)dwMorale(g,-w,'waste');return g.phase==='done'||DWQ.colony(g,s)}
  if(st===3){if(g.crisis&&g.crisis.skip){g.crisis.add.forEach(a=>{if(a.c>=0)g.P[a.pid].hand.push(a.c)})}else dwResolveCrisis(g);dwMissingChild(g);return g.phase==='done'||DWQ.colony(g,s)}
  if(st===4){dwAddZ(g,'colony',Math.ceil(dwColN(g)/2));DWLOC.forEach(l=>{if(g.phase!=='done')dwAddZ(g,l.id,dwAt(g,l.id).length)});
    DWLOC.forEach(l=>{const e=g.loc[l.id];let a=0;while(e.noise>0){e.noise--;if(dwD6()<=3)a++}if(a&&g.phase!=='done'){dwAddZ(g,l.id,a);dwLog(g,`Noise draws ${a} zombie${a>1?'s':''} to the ${DWLN[l.id]}`,'🔊')}});
    return g.phase==='done'||DWQ.colony(g,s)}
  if(st===5){const F=dwFlags(g);if(F.flier&&F.flier<=g.rndNo){F.flier=0;const B=['colony'].concat(DWLOC.map(l=>l.id)).map(l=>dwBar(g,l));
    if(B.some(n=>n<1))dwMorale(g,-1,'Flier: a location has no barricade');else if(B.every(n=>n>=2))dwMorale(g,1,'Flier: every location is well barricaded');if(g.phase==='done')return true}
    if(dwMOCheck(g)&&dwAddWinOK(g)){g.mo.done=true;dwLog(g,`Main objective complete: ${dwMOName(g)}!`,'🏁');dwEnd(g,'objective');return true}return DWQ.colony(g,s)}
  if(st===6){g.round--;dwLog(g,`${g.round} round${g.round===1?'':'s'} left`,'⏳');if(g.round<=0){dwEnd(g,'rounds');return true}return DWQ.colony(g,s)}
  g.fp=dwRight(g,g.fp);g.crisis=null;dwIns(g,{t:'rstart'});return true};
DWQ.winter=(g,s,mv)=>{if(g.wq!=null)return true;const P=g.P[s.pid];const L=P.hand.filter(c=>DWI[c].k==='fuel');if(!L.length)return true;
  if(!mv)return dwAsk(g,s,'Winter Has Come: place a fuel card under the main objective?',[{v:L[0],l:'Place a fuel card'}],{opt:1});
  if(!L.includes(+mv.v))return null;P.hand.splice(P.hand.indexOf(+mv.v),1);g.mo.cards.push(+mv.v);g.wq=s.pid;dwLog(g,`${nmid(s.pid)} places fuel for Winter Has Come (${g.mo.cards.length})`,'⛽');return true};
DWQ.winterChk=g=>{if(g.wq==null){g.mo.failed=true;dwLog(g,'No fuel was placed: Winter Has Come has failed','❄️');dwEnd(g,'objfail')}return true};
function dwResolveCrisis(g){const C=DWCR[g.crisis.id],N=dwActive(g).length,A=dwShuf(g.crisis.add.slice());let pts=0;
  A.forEach(a=>{pts+=a.c>=0&&C.need.includes(dwSym(a.c))?1:-1});g.crisis.shown=A.map(a=>a.c).filter(c=>c>=0);g.gone.push(...g.crisis.shown);
  dwLog(g,`Crisis ${C.n}: ${A.length} card${A.length===1?'':'s'} – ${A.map(a=>a.c>=0?dwCN(a.c):'a penalty').join(', ')||'none'} → ${pts} of ${N} needed`,'⚠️');
  /* suspicion: who added fewer cards than usual (contribution counts are public) */
  const prevented=pts>=N;(g.ev=g.ev||[]).push({r:g.rndNo,w:A.filter(a=>a.c>=0&&!C.need.includes(dwSym(a.c))).length,by:A.reduce((o,a)=>{if(a.c>=0)o[a.pid]=(o[a.pid]||0)+1;return o},{}),ok:prevented});/* public record for the computer players */
  if(!prevented)g.ps.forEach(p=>{if(!g.P[p].exiled&&g.P[p].cn===0)g.susp[p]+=1});
  if(!prevented&&A.some(a=>!C.need.includes(dwSym(a.c))))g.ps.forEach(p=>{if(g.crisis.add.some(a=>a.pid===p))g.susp[p]+=0.5});
  if(prevented){dwAnn(g,'Crisis prevented',`${C.n}: ${pts} points`,'✅');if(pts>=N+2)dwMorale(g,1,'crisis prevented with room to spare');return}
  dwAnn(g,'Crisis!',`${C.n} happens (${pts} of ${N})`,'💥');C.fail.forEach(f=>{if(g.phase!=='done')dwFail(g,f)})}
function dwFail(g,f){const [op,a,b]=f,act=dwActive(g);const live=()=>Object.keys(g.sv).map(Number).filter(s=>!g.P[g.sv[s].pid].exiled);
  switch(op){
  case 'morale':dwMorale(g,a,'crisis');break;
  case 'killLowest':live().sort((x,y)=>dwSv(x).inf-dwSv(y).inf).slice(0,a).forEach(s=>dwKill(g,s,'crisis'));break;
  case 'woundAll':live().forEach(s=>dwWound(g,s,1,'wound'));break;
  case 'noFoodTokens':g.noFood=g.rndNo+1;dwLog(g,'Food tokens can’t raise dice until the end of next round','🥫');break;
  case 'noMove':g.noMove=g.rndNo+1;dwLog(g,'Survivors can’t move until the end of next round','🌨️');break;
  case 'loseRandomCard':act.forEach(p=>{const H=g.P[p].hand;if(H.length)g.gone.push(H.splice(Math.floor(Math.random()*H.length),1)[0])});dwLog(g,'Raiders take a random card from each player','🃏');break;
  case 'clearBarricades':(a==='all'?DWL:['colony']).forEach(l=>{if(l==='colony')g.loc.colony.ent.forEach(e=>e.bar=0);else g.loc[l].bar=0});dwLog(g,`All barricades ${a==='all'?'everywhere':'at the colony'} are destroyed`,'🚧');break;
  case 'zombies':dwAddZ(g,a,b);dwLog(g,`${b} zombies arrive at the ${DWLN[a]}`,'🧟');break;
  case 'zombiesAllOther':DWLOC.forEach(l=>dwAddZ(g,l.id,a));dwLog(g,`${a} zombie arrives at every other location`,'🧟');break;
  case 'foodToWaste':{const F=g.gone.filter(c=>dwSym(c)==='food');g.gone=g.gone.filter(c=>dwSym(c)!=='food');g.waste.push(...F);dwLog(g,`${F.length} old food cards go back on the waste pile`,'🗑️');break}
  case 'starve':g.starve++;dwLog(g,`A starvation token is added (${g.starve})`,'🍽️');break;
  case 'giveLeft':act.forEach(p=>dwIns(g,{t:'giveSurv',pid:p}));break;
  case 'frostHighest':live().sort((x,y)=>dwSv(y).inf-dwSv(x).inf).slice(0,a).forEach(s=>dwWound(g,s,1,'frost'));break;
  case 'rollFrost':act.forEach(p=>{const r=dwD6();if(r<=a&&dwMine(g,p).length)dwIns(g,{t:'pickFrost',pid:p,r})});break}}
DWQ.giveSurv=(g,s,mv)=>{const L=dwMine(g,s.pid);const to=dwLeft(g,s.pid);if(!L.length||to===s.pid)return true;
  if(!mv)return dwAsk(g,s,`Shaking Things Up: give one of your survivors to ${nmid(to)}`,L.map(x=>({v:x,l:dwSv(x).n})),{kind:'surv'});const v=+mv.v;if(!L.includes(v))return null;
  const P=g.P[s.pid];P.follow=P.follow.filter(x=>x!==v);if(P.lead===v){P.lead=null;if(P.follow.length){P.lead=P.follow.shift()}}
  g.sv[v].pid=to;g.P[to].follow.push(v);dwLog(g,`${dwSv(v).n} joins ${nmid(to)}'s group`,'🔀');
  if(P.lead==null){g.gone.push(...P.hand);P.hand=[];const ns=g.decks.surv.pop();if(ns!=null){P.lead=ns;g.sv[ns]={pid:s.pid,loc:P.exiled?dwNonColony(g):'colony',w:0,fb:0,eq:[],used:{},mv:-1}}}return true};
DWQ.pickFrost=(g,s,mv)=>{const L=dwMine(g,s.pid);if(!L.length)return true;if(L.length===1)mv={v:L[0]};
  if(!mv)return dwAsk(g,s,`Hailstorm (you rolled ${s.r}): which survivor gets frostbite?`,L.map(x=>({v:x,l:dwSv(x).n})),{kind:'surv'});const v=+mv.v;if(!L.includes(v))return null;dwWound(g,v,1,'frost');return true};

/* ---------- main objective ---------- */
function dwMOCheck(g){const id=g.mo.id,hc=g.mo.side==='hc',n=g.starters,A=dwActive(g),M=dwMOS(g);
  const noncol=DWLOC.map(l=>l.id),under=sym=>g.mo.cards.filter(c=>dwSym(c)===sym&&!dwStarter(c)).length;
  switch(id){
  case 'leave':return A.every(p=>dwMine(g,p).some(s=>g.sv[s].eq.some(c=>dwSym(c)==='weapon')))&&under('food')>=(hc?3:2)*n;
  case 'kill':return noncol.reduce((a,l)=>a+g.loc[l].z,0)<=(hc?1:3)&&(!hc||noncol.every(l=>g.loc[l].bar>=1));
  case 'mouths':return g.rndNo>=(hc?6:5);
  case 'stock':return g.food>=(hc?3:2)*A.length&&g.loc.colony.ent.every(e=>e.bar>=1)&&under('med')>=2&&under('tools')>=2&&under('fuel')>=2;
  case 'cure':return under('med')>=(hc?3:2)*n;
  case 'samples':return g.mo.tokens>=(hc?4:3)*n;
  case 'weeks':return g.rndNo>=(hc?10:8)&&(!hc||g.food>=6);
  case 'home':return dwBar(g,'colony')>=(hc?14:10)&&noncol.every(l=>g.loc[l].bar>=1);
  case 'winter':return g.rndNo>=(hc?10:8)&&g.mo.cards.length>=(hc?10:8);
  case 'raid':return noncol.filter(l=>!g.decks[l].length).length>=(hc&&n>=4?3:2);
  default:return false}}

/* ---------- secret objectives ---------- */
const dwHandN=(g,p,sym,ns)=>g.P[p].hand.filter(c=>dwSym(c)===sym&&(!ns||!dwStarter(c))).length;
const dwEqN=(g,p,sym)=>dwMine(g,p).reduce((a,s)=>a+g.sv[s].eq.filter(c=>dwSym(c)===sym).length,0);
const dwFol=(g,p)=>g.P[p].follow.filter(s=>g.sv[s]).length;
const dwWounded=(g,p)=>dwMine(g,p).some(s=>g.sv[s].w>0);
const dwBetrayer=g=>g.ps.find(p=>g.P[p].betray);
const DWSEC={
 'Collector':(g,p)=>g.P[p].hand.length>=4,'Experienced':(g,p)=>dwMine(g,p).every(s=>g.sv[s].eq.length>0),'Safety':g=>dwBar(g,'colony')>=4,
 'Desire to Live':(g,p)=>dwHandN(g,p,'weapon')>=1&&dwHandN(g,p,'food')>=1&&dwHandN(g,p,'fuel')>=1&&dwHandN(g,p,'med')>=1,
 'Hoarder':(g,p)=>g.ps.every(q=>q===p||g.P[q].hand.length<g.P[p].hand.length),'Junkie':(g,p)=>dwHandN(g,p,'med')>=3,'Hope':g=>g.helpless>=2,
 'Zombie Killing Robot!':(g,p)=>dwHandN(g,p,'weapon')>=1&&dwHandN(g,p,'tools')>=2,'Hunger':(g,p)=>dwHandN(g,p,'food')>=3,'A New Destination':(g,p)=>dwHandN(g,p,'fuel')>=3,
 'Leader':(g,p)=>g.ps.every(q=>q===p||dwFol(g,q)<dwFol(g,p)),'Repopulate':g=>Object.keys(g.sv).length+g.helpless>=12,
 'Burn It All Down':(g,p)=>dwBar(g,'colony')>=4&&dwHandN(g,p,'fuel')>=1,'All I Need Is My Books':(g,p)=>dwMine(g,p).some(s=>g.sv[s].eq.filter(c=>dwSym(c)==='book').length>=2),
 'Loner':(g,p)=>dwMine(g,p).length===1,'Germ-a-phobe':(g,p)=>!dwWounded(g,p),'Hypochondriac':(g,p)=>dwHandN(g,p,'med')>=2,'Protected':(g,p)=>dwEqN(g,p,'weapon')>=2,
 'Neat Freak':(g,p)=>g.P[p].hand.length>=1&&g.P[p].hand.every(c=>dwSym(c)==='med'),
 'The Way Back Home':(g,p)=>dwHandN(g,p,'fuel')>=2&&dwHandN(g,p,'food')>=1&&dwHandN(g,p,'weapon')>=1,
 'Justice':g=>{const b=dwBetrayer(g);return !b||g.P[b].exiled},'Historian':(g,p)=>dwHandN(g,p,'book')>=2,
 'Masochist':(g,p)=>dwMine(g,p).some(s=>g.sv[s].w>=2),'Revenge':g=>g.removed>=3,
 /* betrayal (plus morale 0) */
 'Cult Leader':(g,p)=>g.ps.every(q=>q===p||dwFol(g,q)+2<=dwFol(g,p)),'Serial Killers':(g,p)=>g.removed>=5&&dwFol(g,p)>=1,
 'Trigger Happy':(g,p)=>dwEqN(g,p,'weapon')>=4,'Mad Scientist':(g,p)=>dwFol(g,p)>=2&&dwHandN(g,p,'med',1)>=2&&dwHandN(g,p,'tools',1)>=2,
 'Obsessed':(g,p)=>dwFol(g,p)===1&&dwMine(g,p).every(s=>g.sv[s].eq.some(c=>dwSym(c)==='weapon'))&&dwHandN(g,p,'food',1)>=1&&dwHandN(g,p,'med',1)>=1&&dwHandN(g,p,'fuel',1)>=1,
 'Gluttony':(g,p)=>dwHandN(g,p,'food',1)>=6,'Runaway':(g,p)=>dwEqN(g,p,'weapon')>=1&&dwHandN(g,p,'fuel',1)>=2&&dwHandN(g,p,'food',1)>=2,
 'Take Over':(g,p)=>DWLOC.some(l=>g.loc[l.id].bar>=4)&&dwMine(g,p).some(s=>g.sv[s].eq.some(c=>dwSym(c)==='weapon'))&&dwHandN(g,p,'fuel',1)>=2,
 'All for One':(g,p)=>dwMine(g,p).length===1&&dwEqN(g,p,'weapon')>=1&&['food','fuel','med','tools'].every(x=>dwHandN(g,p,x,1)>=1),
 'Accept Your Fate':(g,p)=>dwMine(g,p).some(s=>g.sv[s].eq.filter(c=>dwSym(c)==='weapon').length>=2)&&dwHandN(g,p,'med',1)>=3};
const DWEXS={/* plain = exiled, not the betrayer; betray = replaces "morale at 0" for an exiled betrayer */
 'Remorse':{plain:(g,p)=>g.mo.done&&dwHandN(g,p,'med')>=4,betray:(g,p)=>g.P[p].hand.length>=10},
 'Resourceful':{plain:(g,p)=>g.mo.done&&dwHandN(g,p,'tools')>=4,betray:(g,p)=>dwHandN(g,p,'tools')>=3},
 'Atonement':{plain:g=>g.mo.done,betray:(g,p)=>['fuel','food','med','tools'].every(x=>dwHandN(g,p,x)>=1)},
 'New Friends':{plain:(g,p)=>!g.mo.done&&g.ps.every(q=>q===p||dwFol(g,q)<dwFol(g,p)),betray:g=>DWLOC.some(l=>!g.decks[l.id].length)},
 'Shelter':{plain:g=>DWL.filter(l=>dwBar(g,l)>=2).length>=3,betray:(g,p)=>g.ps.every(q=>q===p||dwEqN(g,q,'weapon')<dwEqN(g,p,'weapon'))},
 'South':{plain:(g,p)=>g.mo.done&&dwHandN(g,p,'fuel')>=4,betray:(g,p)=>Object.keys(g.sv).filter(s=>g.sv[s].pid!==p&&g.sv[s].w>0).length>=4},
 'The Chosen':{plain:(g,p)=>dwMine(g,p).length>=3&&!dwWounded(g,p),betray:(g,p)=>!dwWounded(g,p)&&DWL.reduce((a,l)=>a+dwBar(g,l),0)>=5},
 'Barter':{plain:(g,p)=>dwHandN(g,p,'med')>=4,betray:(g,p)=>dwEqN(g,p,'book')>=3},
 'Forgiveness':{plain:(g,p)=>g.mo.done&&dwHandN(g,p,'food')>=5,betray:g=>g.mo.done},
 'Vengeance':{plain:g=>g.removed>=5,betray:g=>g.removed>=4}};
function dwObjOf(g,p){const P=g.P[p];if(!P.obj)return null;return P.obj.t==='regular'?DWSO.regular[P.obj.i]:DWSO.betrayal[P.obj.i]}
function dwWins(g,p){const P=g.P[p];if(g.mode==='coop')return {win:g.mo.done,obj:'Main objective',why:g.mo.done?'The colony made it':'The colony fell'};
  const O=dwObjOf(g,p),f=DWSEC[O.n]||(()=>false);
  if(P.exiled&&P.exObj!=null){const E=DWSO.exile[P.exObj],X=DWEXS[E.n];
    if(!P.betray){const w=!!X.plain(g,p);return {win:w,obj:E.n+' (exiled)',why:E.plain}}
    const w=!!X.betray(g,p)&&!!f(g,p);return {win:w,obj:O.n+' + '+E.n,why:E.betray+'; '+O.need}}
  if(P.betray){const w=g.morale<=0&&!!f(g,p);return {win:w,obj:O.n,why:'Morale at 0; '+O.need}}
  const w=g.mo.done&&!!f(g,p);return {win:w,obj:O.n,why:'Main objective; '+O.need}}
function dwEnd(g,why){if(g.phase==='done')return;g.phase='done';g.q=[];g.ask=null;g.vote=null;g.endWhy=why;g.fin={};
  g.ps.forEach(p=>{const r=dwWins(g,p);g.fin[p]={...r,betrayer:!!g.P[p].betray,exiled:!!g.P[p].exiled}});
  const W=g.ps.filter(p=>g.fin[p].win);
  dwAnn(g,why==='objective'?'🏁 The colony made it!':why==='morale'?'💔 Morale has collapsed':why==='rounds'?'⌛ Out of time':'❄️ The objective failed',
    W.length?`Winners: ${W.map(nmid).join(', ')}`:'Nobody completed their secret objective','🏁');
  dwLog(g,`Game over (${why}). ${W.length?'Winners: '+W.map(nmid).join(', '):'No winners'}`,'🏁');g.n++}

/* ---------- computer players ---------- */
const dwNeedSyms=(g,p)=>{const O=g.P[p].obj?dwObjOf(g,p):null,t=(O?O.need:'').toLowerCase(),o={};['weapon','food','fuel','med','tools','book'].forEach(k=>{if(t.includes(k==='med'?'medicine':k))o[k]=1});(DWOBJK[g.mo.id]||[]).forEach(k=>o[k]=(o[k]||0)+1);return o};
function dwBotAns(g,pid){const A=g.ask,L=A.opts||[];if(!L.length)return {skip:1};const P=g.P[pid];
  switch(A.kind){
  case 'surv':{const o=L.slice().sort((a,b)=>{const x=DWS[+a.v],y=DWS[+b.v];return (y.inf/20+(7-y.atk)+(7-y.sr))-(x.inf/20+(7-x.atk)+(7-x.sr))});return {v:/leader|give|frostbite/i.test(A.msg)&&!/leader/i.test(A.msg)?o[o.length-1].v:o[0].v}}
  case 'search':{const keep=L.filter(o=>o.v!=='noise'),W=dwWant(g,pid),sl=g.q[0].loc;
    const def=Math.ceil(dwColN(g)/2)-g.food;const val=o=>{const c=+o.v,s=dwSym(c);return (W[s]||.3)+(s==='food'?(+DWI[c].k.slice(4)||1)*(def>0?.6:.25):0)+(dwK(c).use==='equip'?.4:0)};
    const best=keep.slice().sort((a,b)=>val(b)-val(a))[0],bv=best?val(best):0,canN=L.some(o=>o.v==='noise');
    if(g.mo.id==='raid'&&dwRaidT(g).includes(sl)&&canN&&g.loc[sl].noise<3&&dwRisk(g,sl,2)===0)return {v:'noise'};
    if(DWB.noise&&canN&&g.loc[sl].noise<2&&dwRisk(g,sl,1)===0&&!(g.mo.id==='home'&&g.loc[sl].bar>=1)){const E=dwDeckEst(g,pid,sl);let ev=0;for(const s in E.p)ev+=E.p[s]*Math.max(0,(W[s]||.3)-bv);if(ev>DWB.nz)return {v:'noise'}}
    return {v:best?best.v:L[0].v}}
  case 'bite':return {v:DWB.bite?'roll':'kill'}; /* rolling costs at most the same survivor and saves them half the time */
  case 'give':return dwGiveAns(g,pid);
  case 'loc':return {v:L.slice().sort((a,b)=>dwZ(g,a.v)-dwZ(g,b.v))[0].v};
  case 'info':return {v:'ok'};
  default:return A.opt&&/remove Forest/.test(A.msg)?(g.morale<=3?{v:L[0].v}:{skip:1}):{v:L[0].v}}}
function dwBotVote(g,pid){const V=g.vote;if(V.kind!=='exile')return Math.random()<.5;return dwExileVote(g,pid)}
/* ---------- computer players: planning (public info + own cards only) ---------- */
/* zombies that will hit each place this colony phase */
function dwFailZ(g,loc){if(!g.crisis||g.crisis.skip)return 0;let n=0;DWCR[g.crisis.id].fail.forEach(f=>{if(f[0]==='zombies'&&f[1]===loc)n+=f[2];if(f[0]==='zombiesAllOther'&&loc!=='colony')n+=f[1]});return n}
const dwFailClears=(g,loc)=>!!(g.crisis&&!g.crisis.skip&&DWCR[g.crisis.id].fail.some(f=>f[0]==='clearBarricades'&&(f[1]==='all'||f[1]===loc)));
/* how many more matching crisis cards this player should add (face-down cards count only by number) */
/* how bad a failed crisis is, in morale-like units */
const DWFC=DWCR.map(C=>C.fail.reduce((v,[op,a,b])=>v+(op==='morale'?-a:op==='killLowest'?a*1.1:op==='zombies'?(a==='colony'?b/3.5:.6):op==='clearBarricades'?1.2:op==='woundAll'?1.5:op==='starve'?1.5:op==='rollFrost'||op==='frostHighest'?1.2:op==='zombiesAllOther'?1:.6),0));
function dwFailCost(g,C){return DWFC[DWCR.indexOf(C)]}
/* how many more cards I should add: cards already in (mine are known good, others' are probably good), the players still to go and their hand sizes */
function dwCrisisShort(g,pid){if(!g.crisis||g.crisis.skip)return 0;const C=DWCR[g.crisis.id],N=dwActive(g).length,ad=g.crisis.add,i=g.order?g.order.indexOf(pid):0,R=g.order?g.order.slice(i+1).filter(p=>!g.P[p].exiled):[];
  const mine=ad.filter(a=>a.pid===pid&&a.c>=0&&C.need.includes(dwSym(a.c))).length,mineBad=ad.filter(a=>a.pid===pid&&!(a.c>=0&&C.need.includes(dwSym(a.c)))).length,others=ad.filter(a=>a.pid!==pid).length;
  const coop=dwNoExile(g),q=coop?1:DWB.wo,cost=dwFailCost(g,C);const later=R.reduce((t,p)=>t+DWB.wr*Math.min(1,g.P[p].hand.length/4),0);
  const cush=!R.length?(coop?0:.3):DWB.cx+(cost>=2?.3:0);const sure=mine-mineBad+others*q;
  if(sure>=N+DWB.cx+1)return 0;return Math.max(0,Math.ceil(N+cush-sure-later-1e-9))}
const DWB=Object.assign({/* A, B */cx:1,wo:.85,wr:.6,foodKeep:0,k1:.5,k2:.5,nf:1,noise:1,sl:.3,bite:1,cs:1,os:1,ef:1,fb:1,br:1,h1:1,lb:0,mo:1,keep:0,eo:1,nz:.6,wk:2,wf:6,mp:40,ff:1,/* C, hard */mg:1,ma:1,z:1,ls:.9,la:.5,et:.55,ec:.65,eps:.08,ok:.85,bs:35,ow:150,sw:80},(typeof process!=='undefined'&&process.env&&process.env.DWB)?JSON.parse(process.env.DWB):{});
function dwFailLikely(g,pid){const C=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id]:null;if(!C)return false;const M=g.P[pid].hand.filter(c=>C.need.includes(dwSym(c))).length;return dwCrisisShort(g,pid)-M>0}
function dwColSim(g,add,clear){const E=g.loc.colony.ent.map(e=>({z:e.z,bar:clear?0:e.bar}));let o=0;for(let k=0;k<add;k++){const e=E[k%6];if(e.z+e.bar<3)e.z++;else if(e.bar>0)e.bar--;else o++}return o}
function dwColAdd(g,pid){const f=pid!=null&&dwFailLikely(g,pid);return Math.ceil(dwColN(g)/2)+(f?dwFailZ(g,'colony'):0)}
function dwColOver(g,pid){const f=pid!=null&&dwFailLikely(g,pid);return dwColSim(g,dwColAdd(g,pid),f&&dwFailClears(g,'colony'))}
function dwLocOver(g,loc,pid,dS){if(loc==='colony')return dwColOver(g,pid);const e=g.loc[loc],f=pid!=null&&dwFailLikely(g,pid);
  const add=dwAt(g,loc).length+(dS||0)+e.noise*.5+(f?dwFailZ(g,loc):0);return Math.max(0,Math.ceil(add-(dwEntCap(loc)-e.z+(f&&dwFailClears(g,loc)?0:e.bar))))}
/* the old names, now exact (a barricade takes a space AND stops one zombie, so room = 3 − zombies) */
function dwEntRisk(g){const add=Math.ceil(dwColN(g)/2),E=g.loc.colony.ent.map(e=>({z:e.z,bar:e.bar})),o=[0,0,0,0,0,0];for(let k=0;k<add;k++){const e=E[k%6];if(e.z+e.bar<3)e.z++;else if(e.bar>0)e.bar--;else o[k%6]++}
  return o.map((v,k)=>v+(E[k].z>=3&&!E[k].bar?.5:0))}
/* per-entrance overruns for a given number of new zombies (round robin from entrance 1) */
function dwEntRiskN(g,add,clear){const E=g.loc.colony.ent.map(e=>({z:e.z,bar:clear?0:e.bar})),o=[0,0,0,0,0,0];for(let k=0;k<add;k++){const e=E[k%6];if(e.z+e.bar<3)e.z++;else if(e.bar>0)e.bar--;else o[k%6]++}
  return o.map((v,k)=>v+(E[k].z>=3&&!E[k].bar?.5:0))}
/* the entrance where one barricade saves the most: overrun there, and still room for a barricade */
function dwBestEnt(g,ER){let b=-1;ER.forEach((r,k)=>{const e=g.loc.colony.ent[k];if(r>=1&&e.z+e.bar<3&&(b<0||r>ER[b]))b=k});return b}
/* the crisis will fail whatever happens: nobody after me, and I can't cover it */
function dwFailSure(g,pid){if(!g.crisis||g.crisis.skip)return false;const i=g.order?g.order.indexOf(pid):0,R=g.order?g.order.slice(i+1).filter(p=>!g.P[p].exiled).length:0;return R===0&&dwCrisisGap(g,pid)>0}
function dwRisk(g,loc,dSurv){return dwLocOver(g,loc,null,dSurv)}
const DWSYMLOC={food:['grocery','school','hospital','library'],med:['grocery','hospital','gas','school'],fuel:['gas','police','library','hospital'],tools:['grocery','police','school','hospital'],weapon:['police','gas'],book:['library','school'],outsider:['hospital','school','police']};
function dwPickDie(D,min){let b=-1;D.forEach((v,i)=>{if(v>=min&&(b<0||v<D[b]))b=i});return b}
/* every way this player can kill a zombie at loc right now, safest first */
function dwKillOpts(g,pid,loc){const P=g.P[pid],D=P.dice,o=[];if(dwZ(g,loc)<=0)return o;
  dwMine(g,pid).forEach(s=>{const x=g.sv[s];if(x.loc!==loc||dwFrozen(g,s))return;const nm=dwSv(s).n,ab=k=>!x.used['ab'+dwSidN(k)];
    if(loc==='colony'&&dwHas(g,s,'Thomas Heart')&&ab('Thomas Heart')){const i=dwPickDie(D,5);if(i>=0)o.push({mv:{a:'ability',s,die:i,who:'Thomas Heart'},k:2,safe:1})}
    if(loc==='colony'&&dwHas(g,s,'Bev Russell')&&ab('Bev Russell')&&g.helpless>0){const i=dwPickDie(D,1);if(i>=0)o.push({mv:{a:'ability',s,die:i,who:'Bev Russell'},k:2,safe:1})}
    if(loc==='school'&&dwHas(g,s,'Maria Lopez')&&ab('Maria Lopez')){const i=dwPickDie(D,1);if(i>=0)o.push({mv:{a:'ability',s,die:i,who:'Maria Lopez'},k:1,safe:1})}
    if(dwHas(g,s,'Daniel Smith')&&ab('Daniel Smith')&&x.w<2){const i=dwPickDie(D,4);if(i>=0)o.push({mv:{a:'ability',s,die:i,who:'Daniel Smith'},k:2,safe:.7})}
    const rf=dwEqK(g,s,'rifle');if(rf!=null&&!x.used['c'+rf])o.push({mv:{a:'use',s,c:rf,loc},k:1,safe:1,free:1});
    const blade=['blade','wrench'].map(k=>dwEqK(g,s,k)).find(c=>c!=null&&!x.used['c'+c]);const i=blade!=null?dwPickDie(D,1):dwPickDie(D,dwSv(s).atk);if(i<0)return;
    const noExp=nm==='Mike Cho'||['colt','arts','shotgun'].some(k=>{const c=dwEqK(g,s,k);return c!=null&&!x.used['c'+c]});
    const ed=loc==='colony'&&dwHas(g,s,'Edward White')&&!x.used.ed&&P.hand.some(c=>DWI[c].k==='med');
    const lt=dwEqK(g,s,'lighter')!=null&&!x.used['c'+dwEqK(g,s,'lighter')]&&P.hand.some(c=>DWI[c].k==='fuel');
    if(ed)o.push({mv:{a:'attack',s,die:i,target:'z',use:'edward'},k:3,safe:1});else if(lt)o.push({mv:{a:'attack',s,die:i,target:'z',use:'lighter'},k:4,safe:1});
    else o.push({mv:{a:'attack',s,die:i,target:'z'},k:dwEqK(g,s,'bat')!=null||dwEqK(g,s,'shotgun')!=null?2:1,safe:noExp?1:x.w>=2?.2:x.w===1?.5:.65,inf:dwSv(s).inf})});
  return o.sort((a,b)=>b.safe-a.safe||(b.free||0)-(a.free||0)||b.k-a.k)}
/* Raiding Party: the location decks closest to empty are the targets */
const dwRaidT=g=>{const L=DWLOC.map(l=>l.id).filter(l=>g.decks[l].length).sort((a,b)=>g.decks[a].length-g.decks[b].length),done=DWLOC.filter(l=>!g.decks[l.id].length).length;return L.slice(0,Math.max(0,(g.mo.side==='hc'&&g.starters>=4?3:2)-done))};
const dwRaidBonus=(g,loc)=>g.mo.id==='raid'&&dwRaidT(g).includes(loc)?4:0;
/* public knowledge only: which cards of a location deck could still be in it (all of its cards minus the ones seen leaving it) */
const DWIDX=(()=>{const o={};DWI.forEach((x,i)=>(o[x.d]=o[x.d]||[]).push(i));return o})();
function dwSeen(g,pid){const o=new Set([...g.P[pid].hand,...g.waste,...g.gone,...g.mo.cards]);
  for(const s in g.sv)(g.sv[s].eq||[]).forEach(c=>o.add(c));(g.crisis&&g.crisis.add||[]).forEach(a=>{if(a.pid===pid&&a.c>=0)o.add(a.c)});return o}
/* a small per-decision memo (not copied with the game state) */
function dwMemo(g,pid){const P=g.P[pid],k=[pid,g.tno,g.rndNo,g.phase,P.hand.length,P.hand[P.hand.length-1],P.dice.length,g.waste.length,g.gone.length,g.mo.cards.length,g.crisis?g.crisis.add.length:-1,g.food,g.starve].join(',');
  if(!g._mm||g._mm.k!==k)Object.defineProperty(g,'_mm',{value:{k,est:{}},writable:true,configurable:true,enumerable:false});return g._mm}
function dwDeckEst(g,pid,loc){const L=(g.decks[loc]||[]).length;if(!L)return {n:0,p:{}};const M=dwMemo(g,pid);if(M.est[loc])return M.est[loc];const seen=M.seen||(M.seen=dwSeen(g,pid)),p={};let t=0;
  (DWIDX[loc]||[]).forEach(i=>{if(seen.has(i))return;const s=dwSym(i);p[s]=(p[s]||0)+1;t++});for(const k in p)p[k]/=t||1;return M.est[loc]={n:L,p}}
/* how many crisis points the table still needs, from public counts: cards added so far and the hand sizes of the players still to go */
function dwCrisisGap(g,pid){if(!g.crisis||g.crisis.skip)return 0;const C=DWCR[g.crisis.id],N=dwActive(g).length,mine=g.P[pid].hand.filter(c=>C.need.includes(dwSym(c))).length;return Math.max(0,dwCrisisShort(g,pid)-mine)}
/* chance the next crisis needs a symbol (crises not yet seen) */
const DWCRP=(()=>{const o={};DWCR.forEach(c=>c.need.forEach(s=>o[s]=(o[s]||0)+1/DWCR.length));return o})();
/* what each card symbol is worth to me right now: crisis, next crisis, food, the main objective, my secret objective, wounds */
function dwWant(g,pid){const M=dwMemo(g,pid);if(M.w)return M.w;return M.w=dwWant0(g,pid)}
function dwWant0(g,pid){const P=g.P[pid],C=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id]:null,need=dwNeedSyms(g,pid),w={food:.6,fuel:.5,med:.5,tools:.4,weapon:.5,book:.3,outsider:.4},my=dwMine(g,pid);
  const hn=s=>P.hand.filter(c=>dwSym(c)===s).length,late=g.round<=2;
  if(C){const gap=dwCrisisGap(g,pid);C.need.forEach(s=>w[s]+=gap>0?2.5+Math.min(gap,3)*.8:.6)}
  for(const s in DWCRP)w[s]+=DWCRP[s]*(hn(s)?1:2.2);
  const colN=dwColN(g),fn=Math.ceil(colN/2),foodH=P.hand.filter(c=>DWI[c].k.startsWith('food')).reduce((a,c)=>a+(+DWI[c].k.slice(4)||1),0);
  const def=fn-g.food,def2=2*fn-g.food-foodH;w.food+=def>0?DWB.ff*(2+def*.9):def2>0?DWB.ff*(1+def2*.3):0;w.outsider+=g.food>=fn+2&&dwRoom(g,'colony')>2?.8:-.3;
  const mo=g.mo.id,hc=g.mo.side==='hc',n=g.ps.length,cnt=s=>g.mo.cards.filter(c=>dwSym(c)===s).length;
  if(mo==='leave'){if(!my.some(s=>g.sv[s].eq.some(c=>dwSym(c)==='weapon'))&&!hn('weapon'))w.weapon+=3;w.food+=1.5}
  if(mo==='stock'){['med','tools','fuel'].forEach(s=>{if(cnt(s)<2)w[s]+=2.2});w.food+=1}
  if(mo==='cure')w.med+=2.5;
  if(mo==='winter'){const f=hn('fuel');w.fuel+=DWB.wf*(f===0?1:f===1?.6:f===2?.3:.1)}
  if(mo==='kill'||mo==='samples')w.weapon+=1.2;
  for(const s in need)if(!(DWOBJK[mo]||[]).includes(s))w[s]=(w[s]||0)+(late?3:1.8);
  if(my.some(s=>g.sv[s].w>=1))w.med+=1;return w}
const dwSearchVal=(g,pid,loc,need,cr)=>{let v=.2;const E=dwDeckEst(g,pid,loc);if(!E.n)return v;const W=dwWant(g,pid);v+=dwRaidBonus(g,loc);for(const s in E.p)v+=E.p[s]*(W[s]||.3);return v};
/* cards I hold back: Winter Has Come needs a fuel card from someone every colony phase */
function dwReserved(g,pid){const o=new Set();if(g.mo.id==='winter'&&!g.P[pid].exiled){g.P[pid].hand.filter(c=>DWI[c].k==='fuel').slice(0,DWB.wk).forEach(c=>o.add(c))}return o}
/* the entrance a main-objective barricade should go to: Stockpile wants one on every entrance, Home Sweet Home wants them where arriving zombies will not reach */
function dwObjEnt(g){const E=g.loc.colony.ent,add=Math.ceil(dwColN(g)/2),ok=k=>E[k].z+E[k].bar<3;
  if(g.mo.id==='stock'){const L=[5,4,3,2,1,0].filter(k=>ok(k)&&E[k].bar===0);return L.length?L[0]:-1}
  if(g.mo.id==='home'){const L=[5,4,3,2,1,0].filter(ok).sort((a,b)=>(a<add)-(b<add)||b-a);return L.length?L[0]:-1}return -1}
const DWLOCMIX={};function dwLocMix(loc){if(!DWLOCMIX[loc]){const o={},L=DWI.filter(c=>c.d===loc);L.forEach(c=>{const y=dwSym(c.id);o[y]=(o[y]||0)+1/L.length});DWLOCMIX[loc]=o}return DWLOCMIX[loc]}
/* food the colony still has to find to get through the next two colony phases (my own food cards count) */
function dwFoodGap(g,pid){const n=Math.ceil(dwColN(g)/2)+(dwFlags(g).horse?1:0),R=Math.min(2,Math.max(1,g.round||1)),mine=g.P[pid].hand.filter(c=>DWI[c].k.startsWith('food')).reduce((a,c)=>a+(+DWI[c].k.slice(4)||1),0);return n*R-g.food-mine}
const dwHurtN=(g,pid)=>dwMine(g,pid).filter(s=>g.sv[s].w>=1||g.sv[s].fb).length;
/* Ashley Ross or the Barricade Manual: a barricade that costs no die. Colony first if it is under pressure, else where my survivors are out */
function dwFreeBar(g,pid){const my=dwMine(g,pid),myCol=my.filter(s=>g.sv[s].loc==='colony');
  const ash=my.some(o=>dwHas(g,o,'Ashley Ross')&&!g.sv[o].used.ab&&!dwJailed(g,o)),bb=myCol.find(o=>{const c=dwEqK(g,o,'barbook');return c!=null&&!g.sv[o].used['c'+c]});if(!ash&&bb==null)return null;
  const colP=myCol.length&&dwBarRoom(g,'colony')?dwColSim(g,Math.ceil(dwColN(g)/2)+3,false):-1;
  const outs=ash?my.filter(s=>g.sv[s].loc!=='colony'&&dwBarRoom(g,g.sv[s].loc)).map(s=>({s,p:dwLocOver(g,g.sv[s].loc,pid,1)})).sort((a,b)=>b.p-a.p):[];
  if(colP>0||(myCol.length&&dwBarRoom(g,'colony')&&!outs.length))return {a:'barricade',s:bb!=null?bb:myCol[0]};
  if(outs.length)return {a:'barricade',s:outs[0].s};return null}
/* Brian Lee: lift a die by one when that is exactly what a search or an ability needs (the engine allows Brian once per round, so the bot checks that first) */
function dwBrian(g,pid){const P=g.P[pid],my=dwMine(g,pid),D=P.dice;const br=my.find(o=>dwHas(g,o,'Brian Lee')&&!dwJailed(g,o)&&!g.sv[o].used['ab'+dwSv(o).id]);if(br==null||!D.length)return null;
  const th=[];my.forEach(s=>{const x=g.sv[s];if(x.loc!=='colony'&&g.decks[x.loc]&&g.decks[x.loc].length&&!dwFrozen(g,s))th.push(dwSv(s).sr)});if(my.some(s=>dwHas(g,s,'Loretta Clay')&&g.sv[s].loc==='colony')&&g.food<Math.ceil(dwColN(g)/2))th.push(4);
  if(!th.length||D.some(v=>th.includes(v)||th.some(t=>v>t)))return null;const t=Math.min(...th),i=D.indexOf(t-1);return i>=0?{a:'ability',s:br,who:'Brian Lee',die2:i}:null}
function dwBotAction(g,pid,lv){const P=g.P[pid],my=dwMine(g,pid),D=P.dice;if(!my.length)return {a:'end'};
  const bad=P.betray&&!P.exiled&&g.morale<=6&&Math.random()<.5;const C=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id]:null,need=dwNeedSyms(g,pid),N=dwActive(g).length;
  const colN=dwColN(g),foodNeed=Math.ceil(colN/2)+(dwFlags(g).horse?1:0),deficit=foodNeed-g.food;
  const myCol=my.filter(s=>g.sv[s].loc==='colony'),lowDie=()=>D.length?D.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0])[0][1]:-1;
  const resv=dwReserved(g,pid),free=c=>!(P.req||[]).includes(c)&&!resv.has(c),cr=C?C.need:[];
  /* free things first: equip weapons/books/tools that help, play outsiders when the colony can feed them */
  for(const c of P.hand){if(!free(c)||dwK(c).use!=='equip')continue;const sym=dwSym(c);if(C&&cr.includes(sym)&&dwCrisisShort(g,pid)>0)continue;if(need[sym]&&sym!=='weapon'&&!(sym==='book'&&/equipped/.test((dwObjOf(g,pid)||{}).need||'')))continue;
    const k=DWI[c].k,pref=['colt','rifle','shotgun','lighter','blade','bat','wrench','arts'].includes(k)?my.filter(s=>dwZ(g,g.sv[s].loc)>0||g.sv[s].loc==='colony'):my;const s=(pref.length?pref:my).slice().sort((a,b)=>g.sv[a].eq.length-g.sv[b].eq.length||dwSv(a).atk-dwSv(b).atk)[0];if(s!=null)return {a:'play',c,s}}
  if(!bad&&!P.exiled&&DWB.fb){const fbm=dwFreeBar(g,pid);if(fbm)return fbm}
  if(!bad&&!P.exiled&&DWB.br){const bm=dwBrian(g,pid);if(bm)return bm}
  if(!bad&&!P.exiled){
    /* 1. the colony must not be overrun */
    let over=dwColOver(g,pid);if(over>0){const fl=dwFailLikely(g,pid),ER=DWB.ef?dwEntRiskN(g,dwColAdd(g,pid),fl&&dwFailClears(g,'colony')):dwEntRisk(g),bi=DWB.ef?dwBestEnt(g,ER):ER.findIndex((r,k)=>r>=1&&g.loc.colony.ent[k].z+g.loc.colony.ent[k].bar<3);
      if(bi>=0&&myCol.length&&D.length)return {a:'barricade',s:myCol[0],die:lowDie(),ent:bi};
      /* zombies from a crisis that may still be saved are not worth an exposure roll */
      const sure=!DWB.ef||dwColSim(g,Math.ceil(colN/2),false)>0||dwFailSure(g,pid);const K=sure?dwKillOpts(g,pid,'colony').filter(o=>o.safe>=DWB.k1):dwKillOpts(g,pid,'colony').filter(o=>o.safe>=1);if(K.length)return K[0].mv;
      const out=myCol.filter(s=>!P.moved.includes(s)&&g.noMove<g.rndNo&&dwCanMove(g,s,'x')&&g.sv[s].w===0).sort((a,b)=>dwSv(a).sr-dwSv(b).sr)[0];const fuel0=P.hand.find(c=>DWI[c].k==='fuel'&&free(c));
      if(out!=null&&fuel0!=null){const L=DWLOC.map(l=>l.id).filter(l=>dwRoom(g,l)>0&&dwLocOver(g,l,pid,1)===0&&dwCanMove(g,out,l));if(L.length)return {a:'move',s:out,to:L.sort((a,b)=>dwSearchVal(g,pid,b,need,cr)-dwSearchVal(g,pid,a,need,cr))[0],fuel:fuel0}}}
    /* 2. my survivors elsewhere about to be overrun */
    for(const s of my){const l=g.sv[s].loc;if(l==='colony')continue;if(dwLocOver(g,l,pid)>0){if(D.length&&dwBarRoom(g,l))return {a:'barricade',s,die:lowDie()};const K=dwKillOpts(g,pid,l).filter(o=>o.safe>=DWB.k2);if(K.length)return K[0].mv;
      if(!P.moved.includes(s)&&g.noMove<g.rndNo&&dwCanMove(g,s,'colony')&&dwRoom(g,'colony')>0){const fuel=P.hand.find(c=>DWI[c].k==='fuel'&&free(c));return {a:'move',s,to:'colony',...(fuel!=null?{fuel}:{})}}}}
    if(deficit>0){const fd=P.hand.filter(c=>DWI[c].k.startsWith('food')&&free(c));if(fd.length)return {a:'play',c:fd[0]}}
    /* 3. crisis: add matching cards until it is covered (keep 1 for my secret objective when safe) */
    if(C&&!(dwFlags(g).grayBeard===pid)){const match=P.hand.filter(c=>cr.includes(dwSym(c))&&free(c));const short=dwCrisisShort(g,pid);
      const lastP=g.order.slice(g.order.indexOf(pid)+1).every(p=>g.P[p].exiled),gapX=N-g.crisis.add.reduce((t,a)=>t+(a.pid===pid?(a.c>=0&&cr.includes(dwSym(a.c))?1:-1):1),0);if(match.length&&short>0&&!(lastP&&match.length<gapX)){const spare=match.filter(c=>!(need[dwSym(c)]&&dwHandN(g,pid,dwSym(c))<=2)&&!(DWI[c].k.startsWith('food')&&deficit>0));const c=(spare.length?spare:short>=2||g.order.indexOf(pid)===g.order.length-1||DWB.cs&&short-P.hand.filter(x=>cr.includes(dwSym(x))).length>=0?match:[])[0];if(c!=null)return {a:'crisis',c}}}
    /* 4. food for the colony */
    const food=P.hand.filter(c=>DWI[c].k.startsWith('food')&&free(c)).sort((a,b)=>(+DWI[b].k.slice(4))-(+DWI[a].k.slice(4)));
    if(deficit>0&&dwFlags(g).noFoodCards!==g.tno){const lor=my.find(s=>dwHas(g,s,'Loretta Clay')&&g.sv[s].loc==='colony'&&!g.sv[s].used['ab'+dwSidN('Loretta Clay')]);if(lor!=null){const i=dwPickDie(D,4);if(i>=0)return {a:'ability',s:lor,die:i,who:'Loretta Clay'}}
      const fc=food.find(c=>!(cr.includes('food')&&dwCrisisShort(g,pid)>0&&food.length===1));if(fc!=null)return {a:'play',c:fc}}
    const ck=my.map(s=>[s,dwEqK(g,s,'cook')]).find(([s,c])=>c!=null&&g.sv[s].loc==='colony'&&!g.sv[s].used['c'+c]);if(ck)return {a:'use',s:ck[0],c:ck[1]};
    /* 5. main objective cards */
    for(const c of P.hand)if(free(c)&&dwObjCardOK(g,c)&&!(cr.includes(dwSym(c))&&dwCrisisShort(g,pid)>0))return {a:'objcard',c};
    /* 6. keep survivors alive: heal the badly hurt */
    const med=P.hand.find(c=>DWI[c].k==='med'&&free(c)),hurt=my.filter(s=>g.sv[s].w>=2||g.sv[s].w>=1&&g.sv[s].fb>0||DWB.h1&&g.sv[s].w>=1&&P.hand.filter(c=>DWI[c].k==='med').length>=2).sort((a,b)=>g.sv[b].w-g.sv[a].w)[0];
    if(med!=null&&hurt!=null&&!(cr.includes('med')&&dwCrisisShort(g,pid)>0))return {a:'play',c:med,t:hurt};
    const oli=my.find(s=>dwHas(g,s,'Olivia Brown')&&!g.sv[s].used['ab'+dwSidN('Olivia Brown')]);if(oli!=null){const t=dwAt(g,g.sv[oli].loc).filter(q=>g.sv[q].w>0).sort((a,b)=>g.sv[b].w-g.sv[a].w)[0];if(t!=null)return {a:'ability',s:oli,target:t,who:'Olivia Brown'}}
    /* 7. waste close to a morale loss */
    if(myCol.length&&D.length&&g.waste.length>=7&&g.waste.length%10>=6)return {a:'clean',die:lowDie()};
    /* outsiders: more dice, if there is food for them */
    const oc=P.hand.find(c=>dwSym(c)==='outsider'&&free(c));if(oc!=null&&g.decks.surv.length&&dwRoom(g,'colony')>2&&g.food>=foodNeed+1&&dwColOver(g,pid)===0&&(!DWB.os||dwFoodGap(g,pid)+2<=0))return {a:'play',c:oc}}
  if(!D.length)return {a:'end'};
  /* betrayer: quietly add a wrong card */
  if(bad&&C&&P.cn===0){const w=P.hand.find(c=>!cr.includes(dwSym(c)));if(w!=null)return {a:'crisis',c:w}}
  /* 8. objective goals that need dice */
  if(!bad&&(g.mo.id==='samples'||g.mo.id==='kill')){for(const l of [...new Set(my.map(s=>g.sv[s].loc))]){if(l==='colony')continue;const K=dwKillOpts(g,pid,l).filter(o=>o.safe>=.9||o.safe>=.6&&dwAt(g,l).length<=2&&g.mo.id==='samples');if(K.length)return K[0].mv}}
  /* 8b. barricade objectives */
  if(!bad&&(g.mo.id==='home'||g.mo.id==='stock')){for(const s of my){const l=g.sv[s].loc;if(l!=='colony'&&g.mo.id==='home'&&dwBar(g,l)===0&&dwBarRoom(g,l))return {a:'barricade',s,die:lowDie()}}
    if(myCol.length&&dwBarRoom(g,'colony')){const k=dwObjEnt(g);if(k>=0)return {a:'barricade',s:myCol[0],die:lowDie(),ent:k}}}
  /* 9. search with survivors already out */
  const se=[];my.forEach(s=>{const x=g.sv[s];if(x.loc==='colony'||!g.decks[x.loc].length||dwFrozen(g,s))return;const i=dwPickDie(D,dwSv(s).sr);if(i>=0)se.push({s,i,v:D[i],q:dwSearchVal(g,pid,x.loc,need,cr)})});
  if(se.length){const b=se.sort((a,b)=>b.q-a.q||a.v-b.v)[0];return {a:'search',s:b.s,die:b.i}}
  /* 10. send a healthy searcher out (fuel if possible), keeping fighters home if the colony needs them */
  if(g.noMove<g.rndNo&&D.length&&!bad){const cand=my.filter(s=>!P.moved.includes(s)&&g.sv[s].w===0&&!g.sv[s].fb&&dwCanMove(g,s,'x')&&(g.sv[s].loc==='colony'||!g.decks[g.sv[s].loc].length||g.mo.id==='home'&&dwBar(g,g.sv[s].loc)>=1&&DWLOC.some(l=>dwBar(g,l.id)===0))&&dwPickDie(D,dwSv(s).sr)>=0)
      .sort((a,b)=>dwSv(a).sr-dwSv(b).sr||dwSv(b).atk-dwSv(a).atk);
    const keepHome=s=>g.sv[s].loc==='colony'&&dwZ(g,'colony')>=6&&myCol.length<=1;
    for(const s of cand){if(keepHome(s))continue;const L=DWLOC.map(l=>l.id).filter(l=>l!==g.sv[s].loc&&dwRoom(g,l)>0&&g.decks[l].length&&dwLocOver(g,l,pid,1)===0&&dwCanMove(g,s,l));if(!L.length)continue;
      const hv=l=>g.mo.id==='home'&&dwBar(g,l)===0&&!dwAt(g,l).length?3:0;const to=L.sort((a,b)=>dwSearchVal(g,pid,b,need,cr)+hv(b)-dwSearchVal(g,pid,a,need,cr)-hv(a))[0];const fuels=P.hand.filter(c=>DWI[c].k==='fuel'&&free(c)),fuel=fuels.length>=(g.mo.id==='winter'?3:2)&&!(cr.includes('fuel')&&dwCrisisShort(g,pid)>0)?fuels[0]:null;
      if(fuel==null&&(DWB.nf===0||DWB.nf===1&&cand.length>1&&P.moved.length))continue;return {a:'move',s,to,...(fuel!=null?{fuel}:{})}}}
  /* 10b. a survivor away from the colony doesn't eat: when food is short, send a spare healthy one out to a quiet place */
  if(DWB.mo&&!bad&&!P.exiled&&g.noMove<g.rndNo&&dwFoodGap(g,pid)>0&&myCol.length>DWB.keep){const fuel=P.hand.find(c=>DWI[c].k==='fuel'&&free(c)&&!(cr.includes('fuel')&&dwCrisisShort(g,pid)>0));
    if(fuel!=null||P.moved.length<DWB.mo){const s=myCol.filter(s=>!P.moved.includes(s)&&g.sv[s].w===0&&!g.sv[s].fb&&dwCanMove(g,s,'x')).sort((a,b)=>dwSv(a).inf-dwSv(b).inf)[0];
      if(s!=null){const L=DWLOC.map(l=>l.id).filter(l=>dwRoom(g,l)>0&&dwLocOver(g,l,pid,2)===0&&dwCanMove(g,s,l));if(L.length){const to=L.sort((a,b)=>dwSearchVal(g,pid,b,need,cr)-dwSearchVal(g,pid,a,need,cr))[0];return {a:'move',s,to,...(fuel!=null?{fuel}:{})}}}}}
  if(!bad){
    /* 11. spare dice: thin the colony's fullest entrances safely, then barricade where the next zombies land */
    if(myCol.length){const E=g.loc.colony.ent;if(E.some(e=>e.z>=2)){const K=dwKillOpts(g,pid,'colony').filter(o=>o.safe>=.9);if(K.length)return K[0].mv}
      if(dwBarRoom(g,'colony'))return {a:'barricade',s:myCol[0],die:lowDie()}}
    for(const s of my){const l=g.sv[s].loc;if(l!=='colony'&&dwBarRoom(g,l)&&(g.mo.id==='home'||g.mo.id==='kill'||dwBar(g,l)===0||DWB.lb&&dwLocOver(g,l,pid,dwAt(g,l).length)>0))return {a:'barricade',s,die:lowDie()}}
    if(myCol.length&&g.waste.length>=4)return {a:'clean',die:lowDie()}}
  /* 12. exile vote on someone suspicious */
  {const ec=dwExileCall(g,pid);if(ec)return ec}
  return {a:'end'}}
/* normal/hard: try the main choices on fogged copies and play each to the end with simple bots */
function dwFog(g,pid){const c=JSON.parse(JSON.stringify(g));const decks=DWLOC.map(l=>c.decks[l.id]);decks.forEach(dwShuf);dwShuf(c.decks.crisis);dwShuf(c.decks.surv);if(c.decks.xr)dwShuf(c.decks.xr);
  const swap=(card,want)=>{const L=decks.filter(d=>d.length);if(!L.length)return card;for(let t=0;t<8;t++){const d=L[Math.floor(Math.random()*L.length)],j=Math.floor(Math.random()*d.length);if(!want||want.includes(dwSym(d[j]))||t===7){const n=d[j];d[j]=card;return n}}return card};
  const crisisNeed=c.crisis&&!c.crisis.skip?DWCR[c.crisis.id].need:null;
  c.ps.forEach(p=>{if(p===pid)return;const Q=c.P[p];Q.hand=Q.hand.map(x=>swap(x));if(Q.xr!=null&&c.decks.xr&&c.decks.xr.length){c.decks.xr.push(Q.xr);dwShuf(c.decks.xr);Q.xr=c.decks.xr.pop()}
    if(!Q.exiled&&Q.obj&&Q.obj.t!=='regular'||Q.obj&&Q.obj.t==='regular'){if(!Q.exiled){Q.obj={t:'regular',i:Math.floor(Math.random()*DWSO.regular.length)};Q.betray=false}}});
  if(c.crisis)c.crisis.add=c.crisis.add.map(a=>a.pid===pid?a:{...a,c:swap(a.c,Math.random()<.8?crisisNeed:null)});return c}
/* play on with simple bots until this round's colony phase is over, then score the colony's position */
function dwRollRound(c,pid){const E={},r0=c.rndNo;let k=0;while(c.phase!=="done"&&c.rndNo<=r0+(DWB.h2||0)&&k++<16000){const a=dwActor(c);if(!a)break;const q=E[a]||(E[a]={id:a,bot:'base'});if(!dwBotStep(c,q))break}return dwPos(c,pid)}
function dwPos(c,pid){const P=c.P[pid],bt=P.betray&&!P.exiled;if(c.phase==='done'){const f=c.fin[pid];return bt?(f.win?300:-100):(c.mo.done?300:-150)+(f.win?60:0)}
  const all=Object.keys(c.sv).map(Number),my=all.filter(s=>c.sv[s].pid===pid),w=all.reduce((a,s)=>a+c.sv[s].w+c.sv[s].fb*1.5,0);
  const col=c.loc.colony.ent.reduce((a,e)=>a+e.z*(e.z>=2?1.6:.8)-e.bar*.8,0),need=dwNeedSyms(c,pid);
  const v=c.morale*12+Math.min(c.food,8)*2.5-c.starve*10+all.length*5+c.helpless*1.5-w*2.5-col+(c.mo.cards.length+c.mo.tokens)*6-Math.floor(c.waste.length%10)*.3
    +P.hand.reduce((a,x)=>a+(need[dwSym(x)]?1.5:.8),0)+my.length*2+DWB.mp*dwMOProg(c,pid);return bt?-v+P.hand.length:v}
function dwRoll(c,pid){const E={};let k=0;while(c.phase!=='done'&&k++<20000){const a=dwActor(c);if(!a)break;const q=E[a]||(E[a]={id:a,bot:'base'});if(!dwBotStep(c,q))break}
  if(c.phase!=='done')return null;const P=c.P[pid],f=c.fin[pid];
  if(P.betray&&!P.exiled)return (f.win?100:0)+(10-c.morale)*2;return (c.mo.done?60:0)+(f.win?40:0)+c.morale*1.5+(c.rndNo||0)*2}
function dwCands(g,pid,lv){const base=dwBotAction(g,pid,'easy'),P=g.P[pid],my=dwMine(g,pid),D=P.dice,L=[base],key=m=>JSON.stringify(m),seen=new Set([key(base)]);const add=m=>{const k=key(m);if(!seen.has(k)){seen.add(k);L.push(m)}};
  const cr=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id].need:[];
  ['colony',...new Set(my.map(s=>g.sv[s].loc))].forEach(l=>dwKillOpts(g,pid,l).slice(0,2).forEach(o=>add(o.mv)));
  my.forEach(s=>{const x=g.sv[s];if(x.loc!=='colony'&&g.decks[x.loc].length){const i=dwPickDie(D,dwSv(s).sr);if(i>=0)add({a:'search',s,die:i})}});
  const col=my.find(s=>g.sv[s].loc==='colony');if(col!=null&&D.length){if(dwBarRoom(g,'colony'))add({a:'barricade',s:col,die:dwPickDie(D,1)});if(g.waste.length>=3)add({a:'clean',die:dwPickDie(D,1)})}
  P.hand.filter(c=>cr.includes(dwSym(c))).slice(0,1).forEach(c=>add({a:'crisis',c}));
  P.hand.filter(c=>DWI[c].k.startsWith('food')).slice(0,1).forEach(c=>add({a:'play',c}));
  if(g.noMove<g.rndNo)my.filter(s=>!P.moved.includes(s)&&dwCanMove(g,s,'x')).slice(0,2).forEach(s=>{const fuel=P.hand.find(c=>DWI[c].k==='fuel');
    DWLOC.map(l=>l.id).filter(l=>l!==g.sv[s].loc&&dwRoom(g,l)>0&&g.decks[l].length).sort((a,b)=>dwLocOver(g,a,pid,1)-dwLocOver(g,b,pid,1)).slice(0,lv==='hard'?2:1).forEach(to=>add({a:'move',s,to,...(fuel!=null?{fuel}:{})}));
    if(g.sv[s].loc!=='colony')add({a:'move',s,to:'colony',...(fuel!=null?{fuel}:{})})});
  /* main-objective moves, so the look-ahead can weigh them */
  const mo=g.mo.id;if(lv==='easy'&&DWB.eo){L.splice(6);add({a:'end'});return L}if(D.length){if((mo==='home'||mo==='stock')&&col!=null&&dwBarRoom(g,'colony')){const k=dwObjEnt(g);if(k>=0)add({a:'barricade',s:col,die:dwPickDie(D,1),ent:k})}
    if(mo==='home'||mo==='kill'&&g.mo.side==='hc')my.forEach(s=>{const l=g.sv[s].loc;if(l!=='colony'&&dwBar(g,l)===0&&dwBarRoom(g,l))add({a:'barricade',s,die:dwPickDie(D,1)})})}
  P.hand.filter(c=>dwObjCardOK(g,c)&&!dwReserved(g,pid).has(c)).slice(0,1).forEach(c=>add({a:'objcard',c}));
  const ex=L.splice(lv==='hard'?11:6);add({a:'end'});return L.concat(ex).slice(0,lv==='hard'?12:7)}
/* easy: the same plan, but now and then a careless choice */
function dwEasyAction(g,pid){if(Math.random()>=DWB.sl)return dwBotAction(g,pid,'easy');const C=dwCands(g,pid,DWB.eo?'easy':'normal');return C[Math.floor(Math.random()*C.length)]}
function dwEval(g,pid){const c=JSON.parse(JSON.stringify(g));DWQUIET++;try{return dwRoll(c,pid)}finally{DWQUIET--}}
function dwBotStep(g,q){const pid=q.id;if(g.phase==='done')return false;
  const hd=q.bot==='hard';
  if(g.vote){if(!g.vote.need.includes(pid)||pid in g.vote.got)return false;return dwMove(g,pid,{vote:hd&&!DWB.nv?dwSmartVote(g,pid):dwBotVote(g,pid)})}
  if(g.ask){if(g.ask.pid!==pid)return false;if(dwMove(g,pid,hd&&!DWB.na?dwSmartAns(g,pid):dwBotAns(g,pid)))return true;if(dwMove(g,pid,{skip:1}))return true;for(const o of g.ask.opts||[])if(dwMove(g,pid,{v:o.v}))return true;return false}
  if(g.turn!==pid||g.q.length)return false;const lv=q.bot||'normal';let mv=lv==='hard'?(dwExileCall(g,pid)||dwSmartAction(g,pid,lv)):lv==='easy'?dwEasyAction(g,pid):dwBotAction(g,pid,lv);
  if(dwMove(g,pid,mv))return true;return dwMove(g,pid,{a:'end'})}

/* ---------- hard computer players: lookahead on fogged copies (public info + own cards only) ----------
   Every choice (turn action, crossroads answer, search pick, vote) is tried on fogged copies of the game and played on by simple bots
   to the end of this round's colony phase, using the same random futures for every choice, then scored by dwPos2. */
const dwRng=a=>()=>{a=a+0x6D2B79F5|0;let x=Math.imul(a^a>>>15,1|a);x=x+Math.imul(x^x>>>7,61|x)^x;return((x^x>>>14)>>>0)/4294967296};
function dwRollTo(c,pid,hz){const E={},r1=c.rndNo+(hz||0);let k=0;while(c.phase!=='done'&&c.rndNo<=r1&&k++<9000){const a=dwActor(c);if(!a)break;const q=E[a]||(E[a]={id:a,bot:'base'});if(!dwBotStep(c,q))break}return dwPos2(c,pid)}
/* N choices; apply(copy,i) makes choice i on a copy (false = not possible there). Weak choices are dropped after 2 futures (choice 0, the simple plan, always stays).
   Returns the index of the best choice, which must beat choice 0 by more than its own noise (paired over the same futures). */
function dwLook(g,pid,N,apply,o){o=o||{};const R0=Math.random,tries=o.tries||6,keep=o.keep||5,V=Array.from({length:N},()=>[]);let live=V.map((_,i)=>i);
  DWQUIET++;try{for(let t=0;t<tries&&live.length>1;t++){const seed=R0()*4294967296>>>0;
      live.forEach(i=>{Math.random=dwRng(seed);try{const c=dwFog(g,pid);if(!apply(c,i)){V[i]=null;return}Math.random=dwRng(seed^0x9e3779b9);V[i].push(dwRollTo(c,pid,o.hz))}finally{Math.random=R0}});
      live=live.filter(i=>V[i]);if(!V[0])return dwBestOf(V);
      if(t===1&&live.length>keep){const m=i=>V[i].reduce((a,x)=>a+x,0)/V[i].length;live=[0,...live.filter(i=>i).sort((x,y)=>m(y)-m(x)).slice(0,keep-1)]}}}
  finally{DWQUIET--}
  if(!V[0])return dwBestOf(V);const T=V[0].length;let b=0,bv=0;live.forEach(i=>{if(!i||V[i].length<T)return;const d=V[i].map((x,t)=>x-V[0][t]),m=d.reduce((a,x)=>a+x,0)/T,sd=Math.sqrt(d.reduce((a,x)=>a+(x-m)*(x-m),0)/Math.max(1,T-1));
    const lcb=m-(o.z!=null?o.z:DWB.z)*sd/Math.sqrt(T)-(o.mg||0);if(lcb>bv){bv=lcb;b=i}});return b}
const dwBestOf=V=>{let b=-1,bv=-1e9;V.forEach((v,i)=>{if(v&&v.length){const m=v.reduce((a,x)=>a+x,0)/v.length;if(m>bv){bv=m;b=i}}});return Math.max(0,b)};
/* how far along the main objective is, 0..1 (public) */
function dwMOProg(g,pid){const id=g.mo.id,hc=g.mo.side==='hc',n=g.starters||g.ps.length,A=dwActive(g).length||1,nc=DWLOC.map(l=>l.id),cl=(x)=>Math.max(0,Math.min(1,x));
  const under=sym=>g.mo.cards.filter(c=>dwSym(c)===sym&&!dwStarter(c)).length;
  switch(id){
  case 'leave':{const arm=dwActive(g).filter(p=>dwMine(g,p).some(s=>g.sv[s].eq.some(c=>dwSym(c)==='weapon'))).length/A;return .3*arm+.7*cl(under('food')/((hc?3:2)*n))}
  case 'kill':{const Z=nc.reduce((a,l)=>a+g.loc[l].z,0),t=hc?1:3;return (Z<=t?1:cl((t+1)/(Z+1)))*(hc?.7+.3*nc.filter(l=>g.loc[l].bar>=1).length/nc.length:1)}
  case 'stock':return .2*cl(g.food/(2*A))+.2*g.loc.colony.ent.filter(e=>e.bar>=1).length/6+.6*(['med','tools','fuel'].reduce((a,y)=>a+Math.min(2,under(y)),0)/6);
  case 'cure':return cl(under('med')/((hc?3:2)*n));
  case 'samples':return cl(g.mo.tokens/((hc?4:3)*n));
  case 'home':return .7*cl(dwBar(g,'colony')/(hc?14:10))+.3*nc.filter(l=>g.loc[l].bar>=1).length/nc.length;
  case 'winter':return cl(g.mo.cards.length/(hc?10:8));
  case 'mouths':return cl((g.rndNo-1)/(hc?6:5));case 'weeks':return cl((g.rndNo-1)/(hc?10:8));
  case 'raid':{const need=hc&&n>=4?3:2,L=nc.map(l=>g.decks[l].length).sort((a,b)=>a-b).slice(0,need);return cl(1-L.reduce((a,x)=>a+x,0)/(need*20))}
  default:return 0}}
/* the position after a rollout, from pid's side */
function dwPos2(c,pid){const P=c.P[pid],bt=P.betray&&!P.exiled,O=P.obj?dwObjOf(c,pid):null,sec=O&&DWSEC[O.n]?!!DWSEC[O.n](c,pid):false;
  if(c.phase==='done'){const f=c.fin[pid];if(bt)return f.win?500:c.morale<=0?60:-80;return (c.mo.done?400:-250)+(f.win?120:0)+c.morale*3}
  const all=Object.keys(c.sv).map(Number),med=P.hand.some(x=>DWI[x].k==='med');let v=c.morale*14-c.starve*8;
  all.forEach(s=>{const x=c.sv[s];if(c.P[x.pid].exiled)return;const L=(dwSv(s).n==='Buddy Davis'?4:3)-x.w;let r=x.fb>0?(x.fb>=L?.9:.55):L<=1?.3:x.w>0?.08:0;if(x.pid===pid&&med)r*=.6;v+=7-r*21+(x.pid===pid?2:0)});
  const colN=dwColN(c),need=Math.ceil(colN/2),fd=c.food-need;v+=fd>=0?Math.min(fd,6)*2:fd*5-(c.starve+1)*4;
  v-=dwColSim(c,need,false)*16;v-=c.loc.colony.ent.reduce((a,e)=>a+e.z*.7+(e.z>=2&&!e.bar?1.5:0)-e.bar*.7,0);
  DWLOC.forEach(l=>{const n=dwAt(c,l.id).filter(s=>!c.P[c.sv[s].pid].exiled).length;if(!n)return;const e=c.loc[l.id];v-=Math.max(0,n-(dwEntCap(l.id)-e.z+e.bar))*10});
  const W=c.waste.length,wm=W%10;v-=Math.floor(W/10)*10+(wm>=7?(wm-6)*3:0);
  const pr=dwMOProg(c);v+=(c.mo.id==='mouths'||c.mo.id==='weeks'?0:pr*DWB.ow)+(c.mo.id==='winter'?Math.min(2,dwHandN(c,pid,'fuel'))*4:0)+c.helpless*.5;
  const nd=dwNeedSyms(c,pid);v+=P.hand.reduce((a,x)=>a+(dwSym(x)==='junk'?.1:nd[dwSym(x)]?1.5:.8),0);
  if(bt)return -v+(sec?30+(10-c.morale)*10:0)+P.hand.length*.5-(c.mode==='coop'?0:dwBelief(c,dwOther(c,pid,pid),pid))*DWB.bs;return v+(sec?15+pr*DWB.sw:0)}
/* the turn plan: the simple plan's choice plus every sensible alternative */
function dwCands2(g,pid){const P=g.P[pid],my=dwMine(g,pid),D=P.dice,L=dwCands(g,pid,'hard'),key=m=>JSON.stringify(m),seen=new Set(L.map(key));const add=m=>{const k=key(m);if(!seen.has(k)){seen.add(k);L.push(m)}};
  const free=c=>!(P.req||[]).includes(c),cr=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id].need:[],bt=P.betray&&!P.exiled,lo=D.length?D.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0])[0][1]:-1;
  if(!P.exiled&&g.crisis&&!g.crisis.skip){const by={};P.hand.filter(free).forEach(c=>{const y=dwSym(c),ok=cr.includes(y);if((bt||ok)&&by[y+ok]==null)by[y+ok]=c});Object.values(by).forEach(c=>add({a:'crisis',c}))}
  const med=P.hand.find(c=>DWI[c].k==='med'&&free(c));if(med!=null)my.filter(s=>g.sv[s].w>0).forEach(s=>add({a:'play',c:med,t:s}));
  const oc=P.hand.find(c=>dwSym(c)==='outsider'&&free(c));if(oc!=null)add({a:'play',c:oc});
  if(lo>=0){my.forEach(s=>{const l=g.sv[s].loc;if(l!=='colony'&&dwBarRoom(g,l))add({a:'barricade',s,die:lo})});const col=my.find(s=>g.sv[s].loc==='colony');
    if(col!=null&&dwBarRoom(g,'colony')){const E=g.loc.colony.ent,k=E.map((e,i)=>[e,i]).filter(([e])=>e.z+e.bar<3).sort((a,b)=>b[0].z-a[0].z||a[0].bar-b[0].bar)[0];if(k)add({a:'barricade',s:col,die:lo,ent:k[1]})}}
  for(const c of P.hand)if(free(c)&&dwObjCardOK(g,c)){add({a:'objcard',c});break}
  if(g.noMove<g.rndNo)my.filter(s=>!P.moved.includes(s)&&dwCanMove(g,s,'x')).forEach(s=>{const fuel=P.hand.find(c=>DWI[c].k==='fuel'&&free(c));if(fuel==null)return;
    DWLOC.map(l=>l.id).filter(l=>l!==g.sv[s].loc&&dwRoom(g,l)>0&&g.decks[l].length).forEach(to=>add({a:'move',s,to,fuel}))});
  /* main-objective moves: go where the objective needs someone */
  if(g.noMove<g.rndNo&&(g.mo.id==='kill'||g.mo.id==='home'||g.mo.id==='raid')){const fuel=P.hand.find(c=>DWI[c].k==='fuel'&&free(c)),want=l=>g.mo.id==='kill'?g.loc[l].z:g.mo.id==='home'?(dwBar(g,l)===0?1:0):(dwRaidT(g).includes(l)?1:0);
    const T=DWLOC.map(l=>l.id).filter(l=>dwRoom(g,l)>0&&want(l)>0).sort((a,b)=>want(b)-want(a)).slice(0,2);
    my.filter(s=>!P.moved.includes(s)&&dwCanMove(g,s,'x')).slice(0,2).forEach(s=>T.forEach(to=>{if(to!==g.sv[s].loc)add({a:'move',s,to,...(fuel!=null?{fuel}:{})})}))}
  return L.slice(0,20)}
function dwSmartAction(g,pid,lv){const C=dwCands2(g,pid).filter(m=>m.a!=='exile');if(C.length<2)return C[0]||{a:'end'};const n=g.ps.length;
  return C[dwLook(g,pid,C.length,(c,i)=>dwMove(c,pid,C[i]),{tries:n>=4?9:11,keep:5,mg:DWB.mg})]}
/* answers: crossroads choices, which card to keep, who takes the hit... */
function dwSmartAns(g,pid){const A=g.ask,base=dwBotAns(g,pid);if(!A||A.kind==='info'||A.kind==='give')return base;const key=m=>JSON.stringify(m);
  const L=[base,...(A.opts||[]).map(o=>({v:o.v})),...(A.opt?[{skip:1}]:[])].filter((m,i,a)=>a.findIndex(x=>key(x)===key(m))===i).slice(0,8);if(L.length<2)return base;
  return L[dwLook(g,pid,L.length,(c,i)=>dwMove(c,pid,L[i]),{tries:8,keep:4,mg:DWB.ma})]}
/* votes: a crossroads vote is judged by playing both outcomes; an exile vote by the public evidence */
function dwSmartVote(g,pid){const V=g.vote,P=g.P[pid];if(V.kind==='exile')return dwExileVote(g,pid,1);if(V.kind!=='xr'||typeof dwXrVoted!=='function')return dwBotVote(g,pid);
  const up=dwLook(g,pid,2,(c,i)=>{const W=c.vote;c.vote=null;dwXrVoted(c,W.no,i===1,W.ctx||{},W.by);dwRun(c);return true},{tries:6,z:0})===1;
  if(P.betray&&!P.exiled&&Math.random()<.3)return !up;return up}
/* how likely each other player is the betrayer, seen by a loyal viewer, from public things only: the revealed crisis cards (how many were wrong) and who added how many */
function dwBeliefs(g,viewer){const O=g.ps.filter(p=>p!==viewer),n=g.ps.length,o={};if(dwNoExile(g)||!O.length)return o;const bm=g.mode==='betrayer',e=DWB.eps;
  /* betrayer variant: 1 regular each + 1 betrayal, so a loyal viewer sees 1/n per other player; normal: 2 regular each + 1 betrayal */
  const W=O.map(p=>bm?1/n:1/(2*n));let w0=Math.max(0,1-W.reduce((a,x)=>a+x,0));
  (g.ev||[]).forEach(E=>{O.forEach((p,i)=>{const c=E.by[p]||0;W[i]*=E.w>0?(c>=E.w?1:Math.pow(e,E.w-c)):(c>0?DWB.ok:1)});if(E.w>0)w0*=Math.pow(e,E.w)});
  const S=W.reduce((a,x)=>a+x,0)+w0;O.forEach((p,i)=>o[p]=S?W[i]/S:0);return o}
const dwBelief=(g,viewer,t)=>dwBeliefs(g,viewer)[t]||0;
function dwExileVote(g,pid,hard){const V=g.vote,P=g.P[pid];if(V.target===pid)return false;const ex=g.ps.filter(p=>g.P[p].exiled&&!g.P[p].betray).length;
  if(P.betray&&!P.exiled){if(ex>=1)return true;return dwBelief(g,dwOther(g,pid,V.target),V.target)>=.3||Math.random()<.25}
  const b=dwBelief(g,pid,V.target);return b>=(ex>=1?DWB.et+.2:DWB.et)}
const dwOther=(g,pid,t)=>g.ps.find(p=>p!==pid&&p!==t)||pid;
/* calling an exile vote (hard): only on strong public evidence */
function dwExileCall(g,pid){const P=g.P[pid];if(dwNoExile(g)||P.voted||P.exiled)return null;const bt=P.betray;
  const L=g.ps.filter(q=>q!==pid&&!g.P[q].exiled).map(q=>[q,dwBelief(g,bt?dwOther(g,pid,q):pid,q)]).sort((a,b)=>b[1]-a[1]);if(!L.length)return null;
  if(!bt&&L[0][1]>=DWB.ec)return {a:'exile',target:L[0][0]};if(bt&&L[0][1]>=.35&&g.morale<=4)return {a:'exile',target:L[0][0]};return null}
/* someone asks for a card: help when it plainly helps them and costs the colony nothing (given cards must be played, not kept) */
function dwGiveAns(g,pid){const s=g.q[0],P=g.P[pid];if(!s||P.betray&&!P.exiled)return {skip:1};const to=s.to;if(!g.P[to])return {skip:1};
  const need=dwNeedSyms(g,pid),cr=g.crisis&&!g.crisis.skip?DWCR[g.crisis.id].need:[],want=(s.what||'').toLowerCase(),def=Math.ceil(dwColN(g)/2)-g.food;
  const theirs=dwMine(g,to),hurt=theirs.some(x=>g.sv[x].w>0),armed=theirs.some(x=>g.sv[x].eq.some(c=>dwSym(c)==='weapon')),out=theirs.some(x=>g.sv[x].loc!=='colony');
  const val=c=>{const y=dwSym(c);if(y==='junk')return -9;let v=0;if(want&&(want.includes(y)||want.includes(DWSYMN[y]||y)))v+=3;
    if(y==='med'&&hurt)v+=2.5;if(DWI[c].k.startsWith('food')&&def>0)v+=2;if(y==='weapon'&&!armed)v+=2;if(y==='fuel'&&out)v+=1;
    if(need[y]&&dwHandN(g,pid,y)<=2)v-=3;if(cr.includes(y)&&dwCrisisShort(g,pid)>0)v-=2;return v};
  const b=P.hand.filter(c=>!(P.req||[]).includes(c)).map(c=>[c,val(c)]).sort((a,b)=>b[1]-a[1])[0];return b&&b[1]>=2?{v:b[0]}:{skip:1}}

/* ================= crossroads glue: steps, selectors, ops, flags ================= */
DWQ.xr=(g,s,mv)=>{const D=g.P[s.drawer];if(typeof DWXRSTEP!=='function')return true;const r=DWXRSTEP(g,s,mv);if(r!==false&&r!==null&&D)D.xrPend=0;return r};
DWQ.xrop=(g,s,mv)=>{if(g.phase!=='play')return true;const f=DWOP[s.a[0]];if(!f){console.warn('DoW: unknown op',s.a[0]);return true}return f(g,s,mv)};
const dwFlags=g=>g.flags||(g.flags={});
const dwSidN=n=>{const S2=DWS.find(q=>q.n===n);return S2?S2.id:-1};
const dwLocArg=(g,s,l)=>l==='from'?s.ctx.from:l==='zLoc'?s.ctx.zLoc:l==='pair'?s.ctx.pairLoc:l==='to'||l==='dest'?s.ctx.to:l==='at'?s.ctx.at:l;
const dwLocList=(g,s,l)=>l==='nonColony'?DWLOC.map(x=>x.id):[dwLocArg(g,s,l)].filter(x=>DWL.includes(x));
/* who: returns survivor ids, or null after asking (s.sel caches the choice) */
function dwWho(g,s,mv,who){if(s.sel)return s.sel;const c=s.ctx||{},alive=id=>id!=null&&g.sv[id]!=null,tp=s.pid;
  const pick=(L,msg,n)=>{L=L.filter(alive);if(!L.length){s.sel=[];return s.sel}if(L.length===1&&!n){s.sel=L;return s.sel}
    if(!mv){dwAsk(g,s,msg,L.map(id=>({v:id,l:`${dwSv(id).n} (${DWLN[g.sv[id].loc]}${g.sv[id].w?`, ${g.sv[id].w} wound${g.sv[id].w>1?'s':''}`:''})`})),{kind:'surv',opt:!!n});return null}
    const v=+mv.v;if(!L.includes(v)){s.bad=1;return null}s.sel=[v];return s.sel};
  if(who==='moved'||who==='searcher')return [c.s].filter(alive);
  if(who==='healed')return [c.healed].filter(alive);
  if(who==='new')return [g.xrNew].filter(alive);
  if(who==='it')return [c.it].filter(alive);
  if(who==='me')return dwMine(g,tp);
  if(who==='mine')return dwMine(g,tp);
  if(who==='leader')return [g.P[tp].lead].filter(alive);
  if(who==='colonyAll')return dwAt(g,'colony');
  if(who==='atDest')return dwAt(g,c.to);
  if(who==='pair')return (c.pair||[]).filter(alive);
  if(who==='all')return Object.keys(g.sv).map(Number).filter(id=>!g.P[g.sv[id].pid].exiled);
  if(who.startsWith('named:'))return [dwSidN(who.slice(6))].filter(alive);
  if(who.startsWith('lowestNot:')){const x=who.slice(10);return Object.keys(g.sv).map(Number).filter(id=>dwSv(id).n!==x&&!g.P[g.sv[id].pid].exiled).sort((a,b)=>dwSv(a).inf-dwSv(b).inf).slice(0,1)}
  if(who==='chosen')return pick(dwMine(g,tp),'Crossroads: choose one of your survivors');
  if(who.startsWith('chosenAt:')){let l=who.slice(9);if(l==='zLoc')l=c.zLoc;return pick(dwMine(g,tp).filter(id=>l==='nonColony'?g.sv[id].loc!=='colony':g.sv[id].loc===l),'Crossroads: choose one of your survivors there')}
  if(who==='chosenAny3'){s.acc=s.acc||[];const L=Object.keys(g.sv).map(Number).filter(id=>!s.acc.includes(id));
    if(s.acc.length>=3||!L.length){s.sel=s.acc;return s.sel}if(!mv){dwAsk(g,s,`Crossroads: choose a survivor (${3-s.acc.length} more, or stop)`,L.map(id=>({v:id,l:`${dwSv(id).n} (${DWLN[g.sv[id].loc]})`})),{kind:'surv',opt:1});s.onSkip=null;return null}
    const v=+mv.v;if(!L.includes(v)){s.bad=1;return null}s.acc.push(v);return dwWho(g,s,null,who)}
  return []}
/* run fn on the chosen survivors; asks if needed */
function dwWhoDo(g,s,mv,who,fn){const L=dwWho(g,s,mv,who);if(L===null){if(s.bad){s.bad=0;return null}return false}L.forEach(id=>{if(g.sv[id]&&g.phase==='play')fn(id)});return true}
const dwSkipAll=(g,s)=>true;
const DWOP={};
DWOP.morale=(g,s)=>{dwMorale(g,s.a[1],'crossroads');return true};
DWOP.food=(g,s)=>{g.food=Math.max(0,g.food+s.a[1]);dwLog(g,`Food ${s.a[1]>0?'+':''}${s.a[1]} → ${g.food}`,'🥫');return true};
DWOP.foodSet=(g,s)=>{g.food=s.a[1];dwLog(g,`The food supply is now ${g.food}`,'🥫');return true};
DWOP.helpless=(g,s)=>{if(s.a[1]<0){for(let i=0;i<-s.a[1];i++)if(g.helpless>0)g.helpless--;return true}if(g.P[s.pid].exiled)return true;const h=Math.min(s.a[1],dwRoom(g,'colony'));g.helpless+=h;if(h)dwLog(g,`${h} helpless survivor${h>1?'s':''} join the colony`,'🧒');return true};
DWOP.helplessPer=(g,s)=>{const h=Math.min(s.a[1]*g.ps.length,dwRoom(g,'colony'));g.helpless+=h;dwLog(g,`${h} helpless survivors join the colony`,'🧒');return true};
DWOP.killHelpless=(g,s)=>{for(let i=0;i<s.a[1];i++)dwKillHelpless(g);return true};
DWOP.wound=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>dwWound(g,id,s.a[2]||1,'wound'));
DWOP.frost=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>dwWound(g,id,1,'frost'));
DWOP.heal=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>{const y=g.sv[id];for(let i=0;i<(s.a[2]||1)&&y.w>0;i++){y.w--;if(y.fb>0)y.fb--}dwLog(g,`${dwNm(g,id)} is healed`,'🩹')});
DWOP.kill=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>{if(s.a[2]&&s.a[2].nomorale){dwRemoveSurv(g,id,'dies')}else dwKill(g,id,'crossroads')});
DWOP.removeSurv=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>dwRemoveSurv(g,id,'leaves the game'));
DWOP.exposure=(g,s,mv)=>{const L=dwWho(g,s,mv,s.a[1]);if(L===null){if(s.bad){s.bad=0;return null}return false}
  L.forEach(id=>{for(let i=0;i<(s.a[2]||1);i++)if(g.sv[id]&&g.phase==='play')dwExposure(g,id,'crossroads')});
  if(s.a[3]&&L.length&&L.every(id=>g.sv[id]))dwIns(g,...s.a[3].map(op=>({t:'xrop',pid:s.pid,a:op,ctx:{...s.ctx,s:L[0]}})));return true};
DWOP.zombies=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{dwAddZ(g,l,s.a[2]);dwLog(g,`${s.a[2]} zombie${s.a[2]>1?'s':''} arrive at the ${DWLN[l]}`,'🧟')});return true};
DWOP.noise=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{if(l!=='colony')g.loc[l].noise=Math.min(4,g.loc[l].noise+s.a[2])});return true};
DWOP.barricades=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{const b=dwPlaceBar(g,l,s.a[2]);dwLog(g,`${b} barricade${b===1?'':'s'} built at the ${DWLN[l]}`,'🚧')});return true};
DWOP.clearZ=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{if(l==='colony')g.loc.colony.ent.forEach(e=>e.z=0);else g.loc[l].z=0;dwLog(g,`All zombies at the ${DWLN[l]} are gone`,'🧹')});return true};
DWOP.clearBar=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{if(l==='colony')g.loc.colony.ent.forEach(e=>e.bar=0);else g.loc[l].bar=0});return true};
DWOP.killZ=(g,s)=>{dwLocList(g,s,s.a[1]).forEach(l=>{let k=0;for(let i=0;i<s.a[2];i++)if(dwKillZ(g,l))k++;dwLog(g,`${k} zombie${k===1?'':'s'} killed at the ${DWLN[l]}`,'⚔️')});return true};
DWOP.killEach=(g,s)=>{DWL.forEach(l=>{for(let i=0;i<s.a[1];i++){if(dwZ(g,l)<=0)break;if(l==='colony'){g.loc.colony.ent.slice().sort((a,b)=>b.z-a.z)[0].z--}else g.loc[l].z--}});dwLog(g,`${s.a[1]} zombie removed from every location`,'⚔️');return true};
const dwDeckArg=(g,s,d)=>d==='at'?s.ctx.at:d;
DWOP.item=(g,s)=>{const d=dwDeckArg(g,s,s.a[1]),D=g.decks[d];if(!D)return true;for(let i=0;i<(s.a[2]||1)&&D.length;i++)g.P[s.pid].hand.push(D.pop());return true};
DWOP.fetch=(g,s,mv)=>{let d=dwDeckArg(g,s,s.a[1]);const how=s.a[2],n=s.a[3]||1,P=g.P[s.pid];
  if(d==='any'&&!s.deck){const L=DWLOC.map(l=>l.id).filter(l=>g.decks[l].length);if(!L.length)return true;if(!mv)return dwAsk(g,s,'Crossroads: take cards from which location deck?',L.map(l=>({v:l,l:DWLN[l]})),{kind:'loc'});if(!L.includes(mv.v))return null;s.deck=mv.v;mv=null}
  if(d==='any')d=s.deck;const D=g.decks[d];if(!D)return true;s.got=s.got||0;
  if(how&&how.startsWith('sym:')){const sym=how.slice(4);for(let i=D.length-1;i>=0&&s.got<n;i--)if(dwSym(D[i])===sym){P.hand.push(D.splice(i,1)[0]);s.got++}dwShuf(D);dwLog(g,`${nmid(s.pid)} takes ${s.got} card${s.got===1?'':'s'} from the ${DWLN[d]} deck`,'🃏');return true}
  if(s.got>=n||!D.length){dwShuf(D);return true}
  if(!mv)return dwAsk(g,s,`Crossroads: take a card from the ${DWLN[d]} deck (${n-s.got} more)`,[...new Set(D.map(c=>DWI[c].k))].map(k=>({v:k,l:DWK[k].n})),{kind:'fetch',opt:1});
  const i=D.findIndex(c=>DWI[c].k===mv.v);if(i<0)return null;P.hand.push(D.splice(i,1)[0]);s.got++;return DWOP.fetch(g,s)};
DWOP.purge=(g,s)=>{const d=dwDeckArg(g,s,s.a[1]),D=g.decks[d];if(!D)return true;const sym=s.a[2]==='all'?null:s.a[2].slice(4);const out=D.filter(c=>!sym||dwSym(c)===sym);g.decks[d]=D.filter(c=>sym&&dwSym(c)!==sym);g.gone.push(...out);dwLog(g,`${out.length} cards are removed from the ${DWLN[d]} deck`,'🗑️');return true};
DWOP.revealTake=(g,s)=>{const d=dwDeckArg(g,s,s.a[1]),D=g.decks[d];if(!D)return true;const T=D.splice(-s.a[2]),sym=s.a[3].slice(4);T.forEach(c=>{if(dwSym(c)===sym)g.P[s.pid].hand.push(c);else D.push(c)});dwShuf(D);return true};
function dwJoin(g,pid,id,lead){const P=g.P[pid];const at=P.exiled?dwNonColony(g):'colony';if(!P.exiled&&dwRoom(g,'colony')<1)return false;g.sv[id]={pid,loc:at,w:0,fb:0,eq:[],used:{},mv:-1};
  if(lead&&P.lead!=null){P.follow.push(P.lead);P.lead=id}else if(P.lead==null)P.lead=id;else P.follow.push(id);g.xrNew=id;dwLog(g,`${dwSv(id).n} joins ${nmid(pid)}'s group${lead?' as leader':''}`,'🧍');return true}
DWOP.takeSurv=(g,s)=>{const id=dwSidN(s.a[1]),i=g.decks.surv.indexOf(id);if(i<0)return true;g.decks.surv.splice(i,1);if(!dwJoin(g,s.pid,id,s.a[2]==='lead'))g.decks.surv.push(id);return true};
DWOP.removeSurvDeck=(g,s)=>{const id=dwSidN(s.a[1]),i=g.decks.surv.indexOf(id);if(i>=0)g.decks.surv.splice(i,1);return true};
DWOP.survivor=(g,s)=>{for(let i=0;i<(s.a[1]||1);i++){const id=g.decks.surv.pop();if(id==null)break;if(!dwJoin(g,s.pid,id)){g.decks.surv.push(id);break}}return true};
DWOP.survivorEach=g=>{g.ps.forEach(p=>{const id=g.decks.surv.pop();if(id!=null&&!dwJoin(g,p,id))g.decks.surv.push(id)});return true};
DWOP.place=(g,s,mv)=>{const l=dwLocArg(g,s,s.a[2]);if(!DWL.includes(l))return true;return dwWhoDo(g,s,mv,s.a[1],id=>{const x=g.sv[id];if(x.loc===l||dwRoom(g,l)<1||(l==='colony'&&g.P[x.pid].exiled))return;x.loc=l;dwLog(g,`${dwNm(g,id)} goes to the ${DWLN[l]}`,'🚶')})};
DWOP.noMove=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>{const P=g.P[g.sv[id].pid];if(!P.moved.includes(id))P.moved.push(id)});
DWOP.freeze=(g,s,mv)=>dwWhoDo(g,s,mv,s.a[1],id=>{dwFlags(g)['frz'+id]=g.tno;const P=g.P[g.sv[id].pid];if(!P.moved.includes(id))P.moved.push(id)});
DWOP.rollTable=(g,s)=>{const r=dwD6();dwLog(g,`Crossroads roll: ${r}`,'🎲');const row=s.a[1].find(([lo,hi])=>r>=lo&&r<=hi);if(row)dwIns(g,...row[2].map(op=>({t:'xrop',pid:s.pid,a:op,ctx:s.ctx})));return true};
DWOP.rollEach=(g,s)=>{const L=dwLocList(g,s,s.a[1]).flatMap(l=>dwAt(g,l));const st=[];L.forEach(id=>{const r=dwD6();if(r<=s.a[2])st.push(...s.a[3].map(op=>({t:'xrop',pid:s.pid,a:op,ctx:{...s.ctx,it:id}})))});if(st.length)dwIns(g,...st);return true};
const dwSymMatch=(c,spec)=>spec==='any'||spec.replace('sym:','').split(',').includes(dwSym(c));
DWOP.removedToHand=(g,s)=>{const P=g.P[s.pid];let n=s.a[2]||1;for(let i=g.gone.length-1;i>=0&&n>0;i--)if(dwSymMatch(g.gone[i],s.a[1])){P.hand.push(g.gone.splice(i,1)[0]);n--}return true};
DWOP.removedToWaste=(g,s)=>{let n=s.a[2]||1e9;for(let i=g.gone.length-1;i>=0&&n>0;i--)if(dwSymMatch(g.gone[i],s.a[1])){g.waste.push(g.gone.splice(i,1)[0]);n--}return true};
DWOP.wasteCard=(g,s)=>{const c=s.ctx.card;if(c==null)return true;for(const id in g.sv){const e=g.sv[id].eq,i=e.indexOf(c);if(i>=0){e.splice(i,1);g.waste.push(c);dwLog(g,`${dwCN(c)} is used up`,'🗑️')}}return true};
DWOP.loseRandomCard=(g,s)=>{const H=g.P[s.pid].hand;for(let i=0;i<(s.a[1]||1)&&H.length;i++)g.gone.push(H.splice(Math.floor(Math.random()*H.length),1)[0]);return true};
DWOP.loseCard=(g,s,mv)=>{const H=g.P[s.pid].hand;s.left=s.left??(s.a[1]||1);if(s.left<=0||!H.length)return true;
  if(!mv)return dwAsk(g,s,`Crossroads: remove a card from your hand (${s.left} more)`,H.map(c=>({v:c,l:dwCN(c)})),{kind:'card'});const c=+mv.v;if(!H.includes(c))return null;H.splice(H.indexOf(c),1);g.gone.push(c);s.left--;return DWOP.loseCard(g,s)};
DWOP.giveHand=(g,s,mv)=>{const to=s.ctx.exiledPid,H=g.P[s.pid].hand,keep=s.a[2]||0;if(!g.P[to])return true;s.kept=s.kept||[];
  if(s.kept.length<keep&&H.filter(c=>!s.kept.includes(c)).length>keep-s.kept.length){if(!mv)return dwAsk(g,s,`Crossroads: choose a card to keep (${keep-s.kept.length} more)`,H.filter(c=>!s.kept.includes(c)).map(c=>({v:c,l:dwCN(c)})),{kind:'card'});
    const c=+mv.v;if(!H.includes(c)||s.kept.includes(c))return null;s.kept.push(c);return DWOP.giveHand(g,s)}
  const give=H.filter(c=>!s.kept.includes(c)).slice(0,Math.max(0,H.length-keep));give.forEach(c=>{H.splice(H.indexOf(c),1);g.P[to].hand.push(c)});dwLog(g,`${nmid(s.pid)} hands over ${give.length} cards to ${nmid(to)}`,'🃏');return true};
DWOP.giveFollower=(g,s,mv)=>{const P=g.P[s.pid],n=p=>dwMine(g,p).length,R=g.ps.filter(q=>q!==s.pid&&n(q)<n(s.pid));if(!R.length||!P.follow.length)return true;
  if(!mv)return dwAsk(g,s,'Crossroads: give a follower to a player with fewer survivors',P.follow.flatMap(f=>R.map(q=>({v:f+'@'+q,l:`${dwSv(f).n} → ${nmid(q)}`}))),{kind:'give2'});
  const [f,q]=String(mv.v).split('@');if(!P.follow.includes(+f)||!R.includes(q))return null;P.follow.splice(P.follow.indexOf(+f),1);g.sv[+f].pid=q;g.P[q].follow.push(+f);dwLog(g,`${dwSv(+f).n} joins ${nmid(q)}`,'🔀');return true};
DWOP.allDiceUsed=(g,s)=>{const P=g.P[s.pid];P.used.push(...P.dice);P.dice=[];dwLog(g,`${nmid(s.pid)} loses all their unused dice`,'🎲');return true};
DWOP.loseDie=(g,s,mv)=>{const P=g.P[s.pid];if(!P.dice.length)return true;if(P.dice.length===1)mv={v:0};
  if(!mv)return dwAsk(g,s,'Crossroads: lose which unused die?',P.dice.map((v,i)=>({v:i,l:`Die showing ${v}`})),{kind:'die'});const i=+mv.v;if(dwDie(g,s.pid,i)==null)return null;P.dice.splice(i,1);return true};
DWOP.loseDieEach=g=>{g.ps.forEach(p=>{const D=g.P[p].dice;if(D.length){const i=D.indexOf(Math.min(...D));D.splice(i,1)}});return true};
DWOP.extraDie=(g,s)=>{const F=dwFlags(g),L=s.a[1]==='all'?g.ps:[s.pid];F.extraDie=F.extraDie||{};L.forEach(p=>F.extraDie[p]=(F.extraDie[p]||0)+s.a[2]);return true};
DWOP.cancelFood=(g,s)=>{const P=g.P[s.pid],i=s.ctx.die,n=s.ctx.n||1;if(i!=null&&P.dice[i]!=null)P.dice[i]=Math.max(1,P.dice[i]-n);dwLog(g,'The spent food does not raise the die','🥫');return true};
/* collective: players together give cards (or unused dice); ops if met, elseOps otherwise */
DWOP.collective=(g,s,mv)=>{const need=s.a[1],mode=s.a[2],ops=s.a[3]||[],els=s.a[4]||[],forced=!!s.a[5];
  s.got=s.got||{};s.gave=s.gave||[];s.qi=s.qi||0;const order=[s.pid,...g.ps.filter(p=>p!==s.pid)];
  const left=k=>(need[k]||0)-(s.got[k]||0),done=()=>Object.keys(need).every(k=>left(k)<=0);
  const finish=ok=>{if(ok){s.gave.forEach(([p,c])=>{if(c!=null){if(mode==='waste')g.waste.push(c);else g.gone.push(c)}});dwLog(g,'The players pull together','🤝');dwIns(g,...ops.map(op=>({t:'xrop',pid:s.pid,a:op,ctx:s.ctx})))}
    else{s.gave.forEach(([p,c,d])=>{if(c!=null)g.P[p].hand.push(c);if(d!=null)g.P[p].dice.push(d)});dwIns(g,...els.map(op=>({t:'xrop',pid:s.pid,a:op,ctx:s.ctx})))}return true};
  while(true){if(done())return finish(true);if(s.qi>=order.length)return finish(false);const p=order[s.qi],P=g.P[p];
    const L=need.die?P.dice.map((v,i)=>({v:'d'+i,l:`Give an unused die (${v})`})):P.hand.filter(c=>left(dwSym(c))>0).map(c=>({v:c,l:`Give ${dwCN(c)}`}));
    if(!L.length){s.qi++;continue}
    if(!mv||s.askPid!==p){s.askPid=p;s.pid2=p;g.ask={pid:p,msg:`Crossroads: the group needs ${Object.keys(need).map(k=>left(k)+' '+(k==='die'?'dice':DWSYMN[k]||k)).join(', ')}. Give one?`,opts:L,opt:!forced,kind:'collective'};
      s.onSkip=(g2,s2)=>{s2.qi++;s2.askPid=null;const r=DWOP.collective(g2,s2,null);return r};return false}
    if(String(mv.v).startsWith('d')){const i=+String(mv.v).slice(1);if(dwDie(g,p,i)==null)return null;s.gave.push([p,null,P.dice.splice(i,1)[0]]);s.got.die=(s.got.die||0)+1}
    else{const c=+mv.v;if(!P.hand.includes(c)||left(dwSym(c))<=0)return null;P.hand.splice(P.hand.indexOf(c),1);s.gave.push([p,c]);s.got[dwSym(c)]=(s.got[dwSym(c)]||0)+1}
    mv=null;s.askPid=null}};
DWOP.pay=(g,s,mv)=>{const n=s.a[1].die||1,P=g.P[s.pid];if(P.dice.length<n)return true;
  if(!mv)return dwAsk(g,s,`Crossroads: give up ${n} unused di${n>1?'ce':'e'} to do it?`,[{v:'y',l:'Yes'}],{opt:1,kind:'yn'});
  for(let i=0;i<n;i++){const j=P.dice.indexOf(Math.min(...P.dice));P.dice.splice(j,1)}dwIns(g,...s.a[2].map(op=>({t:'xrop',pid:s.pid,a:op,ctx:s.ctx})));return true};
DWOP.peek=(g,s,mv)=>{const k=s.a[1],tp=s.pid,others=g.ps.filter(p=>p!==tp);const show=t=>{dwIns(g,{t:'info',pid:tp,msg:t});return true};
  if(k==='hands')return show(others.map(p=>`${nmid(p)}: ${g.P[p].hand.map(dwCN).join(', ')||'nothing'}`).join(' · '));
  if(k==='randomCardColony'){const L=others.filter(p=>dwMine(g,p).some(id=>g.sv[id].loc==='colony')&&g.P[p].hand.length);if(!L.length)return true;const p=L[Math.floor(Math.random()*L.length)],H=g.P[p].hand;return show(`A random card from ${nmid(p)}: ${dwCN(H[Math.floor(Math.random()*H.length)])}`)}
  if(!mv)return dwAsk(g,s,'Crossroads: choose a player',others.map(p=>({v:p,l:nmid(p)})),{kind:'player'});const p=mv.v;if(!others.includes(p))return null;
  if(k==='objective'){const O=dwObjOf(g,p);return show(`${nmid(p)}'s secret objective: ${O?O.n+' – '+O.need:'none'}`)}
  if(k==='showHandOther'){dwLog(g,`${nmid(p)}'s hand is shown to everyone: ${g.P[p].hand.map(dwCN).join(', ')||'nothing'}`,'👀');return true}
  return show(`${nmid(p)}'s hand: ${g.P[p].hand.map(dwCN).join(', ')||'nothing'}`)};
DWOP.exileVote=(g,s,mv)=>{if(dwNoExile(g))return true;const L=g.ps.filter(p=>p!==s.pid&&!g.P[p].exiled&&(s.a[1]!=='colonyPlayer'||dwMine(g,p).some(id=>g.sv[id].loc==='colony')));if(!L.length)return true;
  if(!mv)return dwAsk(g,s,'Crossroads: call an exile vote on whom?',L.map(p=>({v:p,l:nmid(p)})),{kind:'player'});if(!L.includes(mv.v))return null;
  g.vote={kind:'exile',target:mv.v,by:s.pid,msg:`${nmid(s.pid)} calls a vote to exile ${nmid(mv.v)}`,need:dwActive(g),got:{}};return true};
DWOP.addWin=(g,s)=>{const F=dwFlags(g);(F.addWin=F.addWin||[]).push(s.a[1]);dwLog(g,`The main objective now also needs ${s.a[1]==='deputy'?'no zombies at the gas station, hospital and police station':'5 or more food tokens'}`,'🎯');return true};
DWOP.skipCrisis=g=>{if(!g.crisis)return true;g.crisis.add.forEach(a=>g.P[a.pid].hand.push(a.c));g.decks.crisis.unshift(g.crisis.id);g.crisis.add=[];g.crisis.skip=1;dwLog(g,'This round’s crisis is set aside','🛑');return true};
DWOP.flag=(g,s,mv)=>{const F=dwFlags(g),[,name,a1,a2]=s.a;
  const store=v=>{F[name]=v;dwLog(g,`Lasting effect: ${name}`,'📌');return true};
  if(['healed','moved','searcher'].includes(a1)||String(a1).startsWith('named:')){const L=dwWho(g,s,mv,a1);if(L===null)return false;if(!L.length)return true;
    if(name==='addict')return store({s:L[0],p:g.sv[L[0]].pid});if(name==='stay'||name==='never'){(F[name]=F[name]||[]).push([L[0],a2]);return true}
    if(name==='noExpAttack'){(F.noExp=F.noExp||[]).push(L[0]);return true}if(name==='snowmobile')return store({s:L[0],n:4});return store({s:L[0]})}
  if(name==='missingChild')return store({from:g.rndNo,seen:[]});if(a1==='nextRound')return store(g.rndNo+1);if(a1==='turn')return store(g.tno);if(a1==='round')return store(g.rndNo);if(a1==='me')return store(s.pid);return store(a1==null?1:a1)};
DWOP.custom=(g,s,mv)=>{const f=DWCUSTOM[s.a[1]];return f?f(g,s,mv):true};
DWOP.dieMod=(g,s,mv)=>{const P=g.P[s.pid];if(!P.dice.length)return true;if(!mv)return dwAsk(g,s,`Crossroads: change which die by ${s.a[1]}?`,P.dice.map((v,i)=>({v:i,l:`Die showing ${v}`})),{kind:'die'});const i=+mv.v;if(dwDie(g,s.pid,i)==null)return null;P.dice[i]=Math.max(1,Math.min(6,P.dice[i]+s.a[1]));return true};
DWOP.skipMove=(g,s)=>{dwMine(g,s.pid).forEach(id=>{if(!g.P[s.pid].moved.includes(id))g.P[s.pid].moved.push(id)});return true};
DWOP.crisisAdd=(g,s)=>{if(g.crisis)for(let i=0;i<s.a[1];i++)g.crisis.add.push({pid:s.pid,c:-1});return true};
DWOP.round=(g,s)=>{g.round=Math.max(0,g.round+s.a[1]);dwLog(g,`Round track ${s.a[1]>0?'+':''}${s.a[1]}`,'⏳');if(g.round<=0)dwEnd(g,'rounds');return true};
DWOP.discard=DWOP.loseCard;
DWOP.waste=(g,s)=>{const L=DWLOC.map(l=>l.id);for(let i=0;i<s.a[1];i++){const d=L[i%L.length];if(g.decks[d].length)g.waste.push(g.decks[d].pop())}return true};
DWOP.moveSurv=(g,s,mv)=>DWOP.place(g,s,mv);
DWOP.any=()=>true;
const DWCUSTOM={
 dropHelpless:g=>{const n=g.helpless;g.helpless=0;dwLog(g,`${n} helpless survivors are left behind`,'🧒');if(n)dwMorale(g,-Math.ceil(n/2),'helpless left behind');return true},
 santa:(g,s,mv)=>{const id=dwSidN('Forest Plum');if(!g.sv[id]||g.P[g.sv[id].pid].exiled)return true;const owner=g.sv[id].pid,D=g.decks.grocery;s.cards=s.cards||D.splice(-4);
   const others=g.ps.filter(p=>p!==owner);if(!s.cards.length||!others.length)return true;if(!mv){g.ask={pid:owner,msg:`Santa: give ${dwCN(s.cards[0])} to whom?`,opts:others.map(p=>({v:p,l:nmid(p)})),opt:false,kind:'player'};return false}
   if(!others.includes(mv.v))return null;g.P[mv.v].hand.push(s.cards.shift());return s.cards.length?DWCUSTOM.santa(g,s,null):true},
 muggingFight:(g,s,mv)=>{const P=g.P[s.pid],mine=dwMine(g,s.pid).filter(id=>g.sv[id].loc===s.ctx.at),ex=dwAt(g,s.ctx.at).find(id=>g.P[g.sv[id].pid].exiled&&g.sv[id].pid!==s.pid);
   const armed=P.hand.some(c=>dwSym(c)==='weapon')||mine.some(id=>g.sv[id].eq.some(c=>dwSym(c)==='weapon'));if(!mine.length)return true;
   if(!mv)return dwAsk(g,s,'Mugging: how do you respond?',[{v:'hurt',l:`${dwSv(mine[0]).n} takes 2 wounds`},...(armed&&ex!=null?[{v:'fight',l:`Fight back: kill ${dwSv(ex).n}, take 1 wound`}]:[])],{kind:'xr'});
   if(mv.v==='fight'&&armed&&ex!=null){dwKill(g,ex,'mugging');dwWound(g,mine[0],1,'wound')}else dwWound(g,mine[0],2,'wound');return true},
 outbreakRoll:g=>{if(['Olivia Brown','Janet Taylor'].some(n=>g.sv[dwSidN(n)]))return true;const n=g.helpless;for(let i=0;i<n;i++)if(dwD6()===1)dwKillHelpless(g);return true},
 jail:(g,s,mv)=>{const L=Object.keys(g.sv).map(Number);if(!L.length)return true;if(!mv)return dwAsk(g,s,'Jail: choose a survivor to lock up at the police station',L.map(id=>({v:id,l:`${dwSv(id).n} (${nmid(g.sv[id].pid)})`})),{kind:'surv'});
   const id=+mv.v;if(!g.sv[id])return null;const x=g.sv[id];g.P[x.pid].hand.push(...x.eq);x.eq=[];x.loc='police';(dwFlags(g).jail=dwFlags(g).jail||[]).push(id);dwLog(g,`${dwSv(id).n} is locked up at the police station`,'🔒');return true},
 prophet:(g,s,mv)=>{const locs=new Set(dwMine(g,s.pid).map(id=>g.sv[id].loc));const L=Object.keys(g.sv).map(Number).filter(id=>g.sv[id].pid!==s.pid&&!g.P[g.sv[id].pid].exiled&&locs.has(g.sv[id].loc)&&g.P[g.sv[id].pid].lead!==id);if(!L.length)return true;
   if(!mv)return dwAsk(g,s,'The prophet: which survivor joins your group?',L.map(id=>({v:id,l:`${dwSv(id).n} (${nmid(g.sv[id].pid)})`})),{kind:'surv'});const id=+mv.v;if(!L.includes(id))return null;
   const o=g.P[g.sv[id].pid];o.follow=o.follow.filter(x=>x!==id);g.sv[id].pid=s.pid;g.P[s.pid].follow.push(id);dwLog(g,`${dwSv(id).n} follows ${nmid(s.pid)} now`,'🔀');return true},
 bevGuard:g=>{const id=dwSidN('Bev Russell');if(!g.sv[id])return true;dwFlags(g).bevGuard=1;dwRemoveSurv(g,id,'stands guard at the school for good');g.removed--;return true},
 sewer:(g,s,mv)=>{const L=dwMine(g,s.pid).filter(id=>g.sv[id].loc==='library');if(!L.length)return true;const id=L[0],r=dwD6();for(let i=0;i<r&&g.sv[id]&&g.phase==='play';i++)dwExposure(g,id,'the sewers');if(g.sv[id])dwFlags(g).sewer=1;return true},
 thomasWounds:(g,s)=>{const id=dwSidN('Thomas Heart');if(!g.sv[id])return true;const L=dwAt(g,g.sv[id].loc).filter(q=>q!==id);for(let i=0;i<4&&L.length;i++){const t=L[i%L.length];if(g.sv[t])dwWound(g,t,1,'wound')}return true},
 rodHospital:(g,s)=>{const r=dwSidN('Rod Miller');const L=[r,...dwMine(g,s.pid).filter(id=>id!==r).slice(0,2)].filter(id=>g.sv[id]);
   L.forEach(id=>{if(dwRoom(g,'hospital')<1){const o=dwAt(g,'hospital').find(q=>!L.includes(q));if(o!=null&&dwRoom(g,'colony')>0)g.sv[o].loc='colony'}if(dwRoom(g,'hospital')>0)g.sv[id].loc='hospital'});
   L.forEach(id=>{for(let i=0;i<2;i++)if(g.sv[id]&&g.phase==='play')dwExposure(g,id,'the hospital run')});return true},
 gamble:(g,s)=>{const st=[];g.order.forEach(p=>{const n=dwMine(g,p).filter(id=>g.sv[id].loc==='colony').length;if(n&&g.P[p].hand.length)st.push({p,c:g.P[p].hand.splice(0,Math.min(n,1))})});
   if(!st.length)return true;const rolls=st.map(x=>({...x,r:x.c.map(dwD6).reduce((a,b)=>Math.max(a,b),0)}));const w=rolls.sort((a,b)=>b.r-a.r)[0];rolls.forEach(x=>g.P[w.p].hand.push(...x.c));dwLog(g,`${nmid(w.p)} wins the card game`,'🎲');return true},
 dynamite:g=>{const r=dwD6();let k=0;for(let i=0;i<r;i++){const e=g.loc.colony.ent.slice().sort((a,b)=>b.z-a.z)[0];if(e.z>0){e.z--;k++}}dwLog(g,`Dynamite clears ${k} zombies from the colony`,'💥');return true},
 voyeurTake:(g,s,mv)=>{const o=s.ctx.other,H=o&&g.P[o]?g.P[o].hand:[];if(!H.length)return true;if(!mv)return dwAsk(g,s,`Take a card from ${nmid(o)}'s hand`,H.map(c=>({v:c,l:dwCN(c)})),{kind:'card'});
   const c=+mv.v;if(!H.includes(c))return null;H.splice(H.indexOf(c),1);g.P[s.pid].hand.push(c);(dwFlags(g).locked=dwFlags(g).locked||[]).push([c,g.rndNo]);return true}};

/* ---------- lasting crossroads effects the core honours ---------- */
const dwFrozen=(g,s)=>dwFlags(g)['frz'+s]===g.tno||dwJailed(g,s);
const dwJailed=(g,s)=>(dwFlags(g).jail||[]).includes(s);
function dwCanMove(g,s,to){const F=dwFlags(g),x=g.sv[s];if(dwFrozen(g,s))return false;
  if((F.stay||[]).some(([id,l])=>id===s&&x.loc===l))return false;if((F.never||[]).some(([id,l])=>id===s&&to===l))return false;return true}
function dwMoveFx(g,s,from,to,fuel){const F=dwFlags(g);let expo=!fuel&&dwSv(s).n!=='Rod Miller';
  if(F.horse&&F.horse.s===s)expo=false;
  if(F.sewer&&g.sv[s]&&((from==='colony'&&to==='hospital')||(from==='hospital'&&to==='colony')))expo=false;
  if(F.snowmobile&&F.snowmobile.s===s&&F.snowmobile.n>0){expo=false;F.snowmobile.n--;[from,to].forEach(l=>{if(l==='colony')dwAddZ(g,'colony',1);else if(g.loc[l].noise<4)g.loc[l].noise++})}
  if(expo)dwExposure(g,s,'moving',{onMove:true,to});
  if(F.hunted&&g.sv[s]&&dwD6()<=2)dwWound(g,s,1,'wound');
  if(F.bevGuard&&to==='school'&&g.sv[s])dwWound(g,s,1,'wound');
  if(F.missingChild&&to!=='colony'){}}
function dwMissingChild(g){const F=dwFlags(g);if(!F.missingChild)return;if(typeof F.missingChild!=='object')F.missingChild={from:g.rndNo,seen:[]};
  const M=F.missingChild;if(g.rndNo>=M.from+1){const ok=DWLOC.every(l=>M.seen.includes(l.id));F.missingChild=0;if(ok)dwMorale(g,1,'the child is found');else{dwMorale(g,-1,'the child is lost');if(g.helpless>0)g.helpless--}}}
function dwAddWinOK(g){const A=(dwFlags(g).addWin)||[];return A.every(w=>w==='deputy'?['gas','hospital','police'].every(l=>g.loc[l].z===0):w==='army'?g.food>=5:true)}
function dwGreenhouse(g,pid,mv){const s=+mv.s,x=g.sv[s];if(!dwFlags(g).greenhouse||!dwHas(g,s,'Andrew Evans')||x.loc!=='colony'||x.used.gh)return false;const d=dwDie(g,pid,+mv.die);if(d==null||d<1)return false;dwSpend(g,pid,+mv.die);x.used.gh=1;g.food+=2;dwLog(g,'Andrew’s greenhouse: +2 food','🌱');return true}
DWQ.addict=(g,s,mv)=>{const F=dwFlags(g),P=g.P[s.pid];if(!F.addict||!g.sv[F.addict.s])return true;const m=P.hand.find(c=>DWI[c].k==='med');
  if(!mv)return dwAsk(g,s,`${dwSv(F.addict.s).n} needs a fix: play a medicine card, or lose an unused die`,[...(m!=null?[{v:'med',l:'Play a medicine card'}]:[]),{v:'die',l:'Lose an unused die'}],{kind:'xr'});
  if(mv.v==='med'&&m!=null){P.hand.splice(P.hand.indexOf(m),1);dwToWaste(g,s.pid,m)}else if(P.dice.length){P.dice.splice(P.dice.indexOf(Math.min(...P.dice)),1)}return true};
DWQ.sleep=(g,s,mv)=>{const P=g.P[s.pid];if(!dwMine(g,s.pid).some(id=>g.sv[id].w>0))return true;if(!mv)return dwAsk(g,s,'Rest: give up all your dice to heal 1 wound on each of your survivors?',[{v:'y',l:'Rest'}],{opt:1,kind:'yn'});
  P.used.push(...P.dice);P.dice=[];dwMine(g,s.pid).forEach(id=>{const y=g.sv[id];if(y.w>0){y.w--;if(y.fb>0)y.fb--}});return true};
DWQ.workout=(g,s,mv)=>{const P=g.P[s.pid],f=P.hand.find(c=>DWI[c].k.startsWith('food'));if(f==null)return true;if(!mv)return dwAsk(g,s,'Workout: waste a food card to roll 1 extra die?',[{v:'y',l:'Yes'}],{opt:1,kind:'yn'});
  P.hand.splice(P.hand.indexOf(f),1);dwToWaste(g,s.pid,f);P.dice.push(dwD6());return true};

/* overrun forecast for the next colony phase: zombies that would overrun (barricades absorb 2 each) */

/* bot drawer: tap "They yawned" now and then while holding Sleep (UI may call this for bot drawers) */
function dwBotYawn(g,p){if(!g||g.phase!=='play'||g.turn==null||g.q.length)return false;const d=dwRight(g,g.turn);if(d===g.turn||g.P[d].xr==null||g.yawned===g.tno)return false;
  const c=DWXR.find(x=>x.no===g.P[d].xr);if(!c||!c.trig||c.trig.ev!=='yawn')return false;if(Math.random()>(p==null?0.25:p))return false;return dwMove(g,d,{a:'yawn'})}
