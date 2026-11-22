/* ---------- Wyrmspan screen ---------- */
let WZVIEW=null,WZLOOK=null,WZSEL=null,WZBOTT=null,WZBOTAT=0;
const wzRes2=()=>!S.lk||S.demo||lkHost();
const WZIMG={meat:'wy-meat',gold:'wy-gold',crys:'wy-crystal',milk:'wy-milk',coin:'wy-coin',egg:'wy-egg'};
const wzI=(t,n)=>`<img class="wzi" src="art/${WZIMG[t]}.webp" alt="${WZTN[t]||t}" title="${WZTN[t]||t}"${n?` style="width:${n}px;height:${n}px"`:''}>`;
const wzHumans=()=>act().filter(p=>!p.bot);
function wzViewer(){const g=wzG();if(!g)return null;if(S.lk&&!S.demo)return act().find(p=>p.id===S.lk.me)||null;const H=wzHumans();if(H.length===1)return H[0];if(!H.length)return null;return H.find(p=>p.id===WZVIEW)||null}
const wzNeedHandoff=()=>{if(S.lk&&!S.demo)return null;const g=wzG();if(!g||g.phase==='done'||wzHumans().length<2)return null;const a=wzActor(g),t=act().find(p=>p.id===a);return t&&!t.bot&&WZVIEW!==t.id?t:null};
const wzEnc=mv=>encodeURIComponent(JSON.stringify(mv));
const wzBtn=(mv,html,o={})=>`<button class="${o.cls||''}" data-a="wzans" data-k="${wzEnc(mv)}"${o.dis?' disabled':''}${o.lab?` aria-label="${esc(o.lab)}"`:''}>${html}</button>`;
const WZTYI={W:'⚡',A:'🏮',O:'🔁',E:'🏁'},WZTYN={W:'When played',A:'If activated',O:'Once per round',E:'End of game'};
/* the game's own pictures where it has them (Justin, Nov 21): the adventurer, the caves, the card backs, the nest */
const wzTyI=t=>t==='A'?`<img class="wzi" src="art/wy-adv.webp" alt="${WZTYN.A}" title="${WZTYN.A}">`:`<span title="${WZTYN[t]}">${WZTYI[t]}</span>`;
const wzCI=cv=>`<img class="wzi wzcvi" src="art/wy-cave-${cv}.webp" alt="${WZCN[cv]}" title="${WZCN[cv]}">`;
const wzCvBk='<img class="wzi wzbk" src="art/wy-back-cave.webp" alt="cave card" title="cave card">',wzDrBk='<img class="wzi wzbk" src="art/wy-back-dragon.webp" alt="dragon card" title="dragon card">';
const wzPerChip=p=>`<span class="wzper wzp-${p}">${WZPER[p]}</span>`,wzSzChip=z=>`<span class="wzsz">${WZSZ[z]}</span>`;
/* an option or question label: the engine's emoji become the game's pictures */
function wzLab(l){let h=esc(l);WZR.forEach(r=>{h=h.split(WZRI[r]).join(wzI(r))});WZC.forEach(cv=>{h=h.split(WZCI[cv]).join(wzCI(cv))});
  return h.split('🪨').join(wzCvBk).split('🐉').join(wzDrBk).split('🂠').join(wzDrBk).split('🪺').join('<img class="wzi" src="art/wy-nest.webp" alt="nest">')}
function wzCostH(D){const L=[];for(const k of ['meat','gold','crys','milk','coin','egg'])for(let i=0;i<(D.cost[k]||0);i++)L.push(wzI(k));return L.length?L.join(''):'<small>free</small>'}
/* a dragon card (in hand, the display, or on a mat) */
const wzDP=n=>'art/wz-d-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.webp';
function wzCard(id,o={}){const D=wzD(id),x=o.x;return `<div class="wzc wz-${D.per}${o.sel?' sel':''}${o.cls?' '+o.cls:''}" data-lp="wzd:${id}">
  <div class="wzch"><b class="wzn">${esc(D.n)}</b><span class="wzvp num">${D.vp}</span></div>
  <img class="wzimg" src="${wzDP(D.n)}" alt="" loading="lazy" onerror="this.remove()">
  <div class="wzcm"><span>${wzCostH(D)}</span><span class="wzcvs" title="Caves">${D.cv.split('').map(c=>wzCI(c)).join('')}</span></div>
  <div class="wzcm">${wzSzChip(D.sz)}${wzPerChip(D.per)}${D.cap?`<small title="Egg capacity">${x?`${x.e}/`:''}${D.cap}${wzI('egg')}</small>`:''}</div>
  <div class="wzcp">${wzTyI(D.ty)} ${esc(wzDSay(D))}</div>
  ${x&&(x.c||x.t)?`<div class="wzcx">${x.c?`<span title="Cached resources">📦${x.c}</span>`:''}${x.t?`<span title="Tucked cards">🗂️${x.t}</span>`:''}</div>`:''}</div>`}
const wzCaveCard=(id,o={})=>`<div class="wzcave${o.sel?' sel':''}${o.cls?' '+o.cls:''}" data-lp="wzc:${id}"><img class="wzcvimg" src="art/wy-back-cave.webp" alt=""><small>${esc(wzCvSay(id))}</small></div>`;
function wzCaveSheet(id){return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1"><div class="rs-top"><div><h2 id="lp-h">Cave card</h2><small class="lp-sub">Card ${wzCv(id).no}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
  <div class="rs-body"><div class="lpbig">${wzCaveCard(id)}</div><p class="rlab"><b>When you excavate with it:</b> ${esc(wzCvSay(id))}</p><p class="hint">The exact wording is on the card.</p></div></div></div>`}
/* the objective tile shows the same pictures as the cards (sizes, personalities, caves, eggs, the adventurer…) */
function wzGoalIcons(id){const m=/^per([SHAP])$/.exec(id);if(m)return wzPerChip(m[1]);
  return ({hatch:wzSzChip('H'),small:wzSzChip('S'),med:wzSzChip('M'),large:wzSzChip('L'),inC:wzCI('c'),inG:wzCI('g'),inA:wzCI('a'),eggs:wzI('egg'),cap:wzI('egg'),
    adv:wzTyI('A'),wpopr:wzTyI('W')+wzTyI('O'),caves:wzCvBk,guild:'<img class="wzi" src="art/wy-marker.webp" alt="guild">',cache:'<span title="Cached resources">📦</span>'})[id]||''}
const wzPickK=(g,V)=>{const A=g.ask;if(!A||!V||A.pid!==V.id)return {};const m={},sel=wzAskSel(A);(A.opts||[]).filter(o=>sel==null||o.ck==null||String(o.ck)===sel).forEach(o=>{if(o.k&&!m[o.k])m[o.k]=o.v;if(/^[cga][0-3]$|^n$/.test(String(o.v))&&!m[o.v])m[o.v]=o.v});return m};
function wzMat(g,pid,V){const P=g.P[pid],pick=pid===(V&&V.id)?wzPickK(g,V):{};
  const rows=WZC.map(cv=>{const M=P.mat[cv];return `<div class="wzrow wzr-${cv}"><div class="wzent"><img src="art/wy-cave-${cv}.webp" alt=""><small>${esc(WZCN[cv])}</small><small class="rlab">${P.ex[cv]?`explored ${P.ex[cv]}×`:''}</small></div>
    ${M.map((x,i)=>{const kk=cv+i,pk=pick[kk];const inner=!x?`<div class="wzslot dug"><small>Not dug${i>=2?` · ${WZEXC[i]}${wzI('egg')}`:''}</small></div>`:x.d?wzCard(x.d.id,{x:x.d}):`<div class="wzslot open">${x.cv?wzCaveCard(x.cv):'<small>Open</small>'}</div>`;
      return pk!=null?`<button class="wzsp pick" data-a="wzans" data-k="${wzEnc({v:pk})}">${inner}</button>`:`<div class="wzsp">${inner}</div>`}).join('')}</div>`}).join('');
  const nk=pick.n!=null?`<button class="wznest pick" data-a="wzans" data-k="${wzEnc({v:'n'})}">`:'<div class="wznest">';
  return `<div class="wzmat">${rows}</div><div class="wzbase">${nk}<img src="art/wy-nest.webp" alt=""><span>Mat nests: ${P.nest}/2 ${wzI('egg')}</span>${pick.n!=null?'</button>':'</div>'}<span class="rlab">${wzI('coin')}<b class="num">${P.coin}</b> · ${WZR.map(r=>`${wzI(r)}<b class="num">${P.res[r]}</b>`).join(' ')}</span></div>`}
function wzDisplay(g){return `<div class="wzdisp">${g.disp.d.map(id=>id==null?'<div class="wzc empty"></div>':wzCard(id)).join('')}</div>
  <div class="wzdisp wzdc">${g.disp.c.map(id=>id==null?'<div class="wzcave empty"></div>':wzCaveCard(id)).join('')}<div class="wzdeck"><img src="art/wy-back-dragon.webp" alt="Dragon deck" title="Dragon deck"><small class="num">${g.dd.length}</small><img src="art/wy-back-cave.webp" alt="Cave deck"><small class="num">${g.dc.length}</small></div></div>`}
function wzObjHtml(g){return `<div class="wzobjs">${g.obj.map((id,r)=>{const c=g.oc[r];return `<div class="wzob${r===g.rnd&&g.phase!=='done'?' now':''}"><small>Round ${r+1} · ${WYPT[r].join('/')}</small><span class="wzgoi">${wzGoalIcons(id)}</span><b>${esc(wzObj(id).say)}</b><small class="num">${act().map(p=>`<span style="${pc(p.color)}" class="wzdot">●</span>${c?c[p.id]:wzObjN(g,p.id,id)}`).join(' ')}</small></div>`}).join('')}</div>`}
function wzGuildHtml(g){const G=WYGUILD[g.guild],B=G.box[g.side],P=act(),dot=pid=>{const p=P.find(q=>q.id===pid);return p?`<span class="wzdot" style="${pc(p.color)}">●</span>`:''};
  return `<div class="panel wzguild"><div class="rlab"><img src="art/wy-marker.webp" class="wzi" alt=""> <b>${esc(G.n)}</b> · ${g.side===4?'4–5':'2–3'} player side</div>
  ${G.say.map((t,r)=>`<div class="srow"><span class="rlab">${esc(t)}</span><span>${g.gbox[r].map(dot).join('')}${'◻'.repeat(Math.max(0,B[r]-g.gbox[r].length))}</span></div>`).join('')}
  <div class="srow"><span class="rlab">End-game points: 6, 3, then 1 each</span><span>${g.gbox[4].map(dot).join('')}</span></div>
  <div class="rlab">Track: ${P.map(p=>`${dot(p.id)}${esc(nm(p))} ${g.P[p.id].gpos} step${g.P[p.id].gpos===1?'':'s'}${g.P[p.id].gm?` · ${g.P[p.id].gm} marker${g.P[p.id].gm>1?'s':''}`:''}`).join(' · ')}</div></div>`}
function wzPlayUI(){const g=wzG(),P=act();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Wyrmspan">${g&&g.phase==='done'?'🏁':'🐉'}</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  if(!g||wzStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(wzRes2()?'Shuffling the dragons…':'Waiting for the host phone…')}</div>`;
  const V=wzViewer(),hide=!!wzNeedHandoff(),ap=P.find(p=>p.id===wzActor(g)),look=P.find(p=>p.id===WZLOOK)?WZLOOK:V?V.id:g.turn;
  out+=`<div class="tabs hftabs nxtabs" role="list">${P.map(q=>{const Q=g.P[q.id];return `<button class="tab" role="listitem" data-a="wzlook" data-k="${q.id}" style="${pc(q.color)}" aria-pressed="${look===q.id}"><div class="tn">${botHead(q)}${esc(nm(q))}${g.turn===q.id&&g.phase==='play'&&!Q.passed?' ▶':Q.passed&&g.phase==='play'?' ✋':''}</div><div class="ts num">${g.phase==='done'?g.fin[q.id].tot:wzDr(g,q.id).length+'🐉'}</div><div class="tr"><span class="ccgd" title="Coins">${wzI('coin')}${Q.coin}</span><span class="ccgd" title="Eggs">${wzI('egg')}${wzEggs(g,q.id)}</span><span class="ccgd" title="Cards in hand">${wzDrBk}${wzCards(g,q.id)}</span></div></button>`}).join('')}</div>`;
  const L=g.last,word={pass:'passed',exc:'excavated',ent:'enticed a dragon',exp:'explored'};
  out+=`<div class="hfmin htstat ccstat"><img class="ccpic" src="art/wyrmspan-icon.png" alt="" width="66" height="66" onerror="this.remove()"><div><span>${g.phase==='done'?'<b>Game over.</b>':ap?`${botHead(ap)}<b>${esc(nm(ap))}</b> · ${g.ask?esc(g.ask.msg.replace(/\s*\(.*$/,'').toLowerCase()):'choosing an action'}`:''}</span><span class="rlab">Round ${g.rnd+1} of 4</span><small>${L?`${esc(nmid(L.p))} ${word[L.t]||''}`:''}</small></div></div>`;
  out+=wzObjHtml(g);
  out+=`<div class="sec"><div class="sec-h"><h3>Card display</h3></div>${wzDisplay(g)}</div>`;
  out+=`<div class="sec"><div class="sec-h"><h3>${look===(V&&V.id)?'Your caves':esc(nmid(look))+'’s caves'}</h3></div>${wzMat(g,look,hide?null:V)}</div>`;
  out+=`<div class="sec"><div class="sec-h"><h3>Dragon Guild</h3></div>${wzGuildHtml(g)}</div>`;
  if(g.phase==='done')out+=wzResults(g);
  else if(hide){const h=wzNeedHandoff();out+=`<div class="sheet-bg yzpassbg"><div class="sheet yzpass" role="dialog" aria-modal="true" aria-labelledby="wzh-h" style="${pc(h.color)}"><svg class="yzpm" viewBox="0 0 40 40" aria-hidden="true"><path d="${MGSHAPE_M}"/></svg><span class="rlab">Pass the phone to</span><h2 id="wzh-h">${esc(nm(h))}</h2><p class="rlab">It’s your turn. Everyone else, look away.</p><button class="btn primary wide" data-a="wzshow" data-k="${h.id}">I’m ${esc(nm(h))}, show my cards</button></div></div>`}
  else if(V)out+=wzDock(g,V);
  if(wzRsShow(g))out+=wzRsSheet(g);
  return out}
/* end of a round: what the objective scored, then what's next. Each phone closes its own card; computer players wait for the host phone's card (up to 45 s). */
let WZRSOK={};const wzRsKey=g=>g.id+':'+g.rsum.r;
function wzRsShow(g){return !!(g&&g.rsum&&g.phase==='play'&&!WZRSOK[wzRsKey(g)]&&Date.now()-g.rsum.at<15*60e3&&!wzNeedHandoff())}
function wzRsSheet(g){const R=g.rsum,tot=p=>{let t=0;for(let r=0;r<=R.r;r++)t+=wzObjPts(g,r)[p]||0;return t},rows=g.ps.slice().sort((a,b)=>(R.pts[b]-R.pts[a])||(R.c[b]-R.c[a])),N=g.obj[g.rnd];
  return `<div class="sheet-bg glres"><div class="sheet wzrs" role="dialog" aria-modal="true" aria-labelledby="wzrs-h"><div class="tqannic" aria-hidden="true"><img src="art/wy-goal.webp" alt="" width="44" height="44"></div><h2 id="wzrs-h">Round ${R.r+1} is over</h2>
    <div class="wzrsgoal"><span class="wzgoi">${wzGoalIcons(R.obj)}</span><b>${esc(wzObj(R.obj).say)}</b></div>
    <div class="glresl">${rows.map(p=>{const q=act().find(x=>x.id===p);return `<div class="glresr" style="${q?pc(q.color):''}"><i class="dot"></i><b>${esc(nmid(p))}</b><span class="num glresd">${R.c[p]} → ${R.pts[p]>0?'+':''}${R.pts[p]}</span><span class="num glrest">${tot(p)}</span></div>`}).join('')}</div>
    <div class="glresh rlab"><span>Count → objective points</span><span>Objective total</span></div>
    <div class="wzrsnext"><small class="rlab">Next: round ${g.rnd+1} of 4 · ${WYPT[g.rnd].join('/')} points</small>${N?`<div class="wzrsgoal"><span class="wzgoi">${wzGoalIcons(N)}</span><b>${esc(wzObj(N).say)}</b></div>`:''}<p class="rlab">${esc(nmid(g.turn))} starts. Everyone gained 6 coins and 1 egg, and the display has new cards.</p></div>
    <button class="btn primary wide" data-a="wzrsok">Start round ${g.rnd+1}</button></div></div>`}
function wzHand(g,pid,o={}){const H=g.P[pid].hand;return `<div class="wzhand">${H.d.map((id,i)=>o.ent&&o.ent.some(x=>x.i===i)?`<button class="wzcb${WZSEL&&WZSEL.t==='ent'&&WZSEL.i===i?' on':''}" data-a="wzsel" data-k="ent:${i}">${wzCard(id,{sel:WZSEL&&WZSEL.t==='ent'&&WZSEL.i===i})}</button>`:wzCard(id,{cls:o.ent?'dim':''})).join('')||'<div class="rlab">No dragon cards.</div>'}</div>
  <div class="wzhand">${H.c.map((id,i)=>o.exc?`<button class="wzcb${WZSEL&&WZSEL.t==='exc'&&WZSEL.i===i?' on':''}" data-a="wzsel" data-k="exc:${i}">${wzCaveCard(id,{sel:WZSEL&&WZSEL.t==='exc'&&WZSEL.i===i})}</button>`:wzCaveCard(id)).join('')||'<div class="rlab">No cave cards.</div>'}</div>`}
function wzTradeBox(g,V){const R=g.P[V.id].res;if(wzRes(g,V.id)<2)return '';const T=WZSEL&&WZSEL.t==='trade'?WZSEL:null;
  if(!T)return `<button class="btn sm" data-a="wzsel" data-k="trade">🔁 Trade 2 resources for 1</button>`;
  const left={...R};T.pay.forEach(r=>left[r]--);
  return `<div class="panel wztrade"><div class="rlab">${T.pay.length<2?`Pay 2 resources (${2-T.pay.length} to go):`:'Take which one?'} ${T.pay.map(r=>wzI(r)).join('')}</div><div class="wzopts">${T.pay.length<2?WZR.filter(r=>left[r]>0).map(r=>`<button class="btn sm" data-a="wzsel" data-k="tp:${r}">${wzI(r)} ${WZRN[r]}</button>`).join(''):WZR.filter(r=>!T.pay.includes(r)).map(r=>`<button class="btn sm" data-a="wzsel" data-k="tt:${r}">${wzI(r)} ${WZRN[r]}</button>`).join('')}<button class="btn sm" data-a="wzsel" data-k="none">Cancel</button></div></div>`}
/* a question whose choices are cards: the card picked first when one card has several choices (e.g. which cave it goes in) */
function wzAskGroups(A){const G=new Map();(A&&A.opts||[]).forEach(o=>{if(o.d==null&&o.c==null)return;const k=String(o.ck!=null?o.ck:'v'+o.v);if(!G.has(k))G.set(k,[]);G.get(k).push(o)});return G}
function wzAskSel(A){const G=wzAskGroups(A);if(![...G.values()].some(L=>L.length>1))return null;if(WZSEL&&WZSEL.t==='ask'&&G.has(WZSEL.ck))return WZSEL.ck;for(const [k,L] of G)if(L.length>1)return k;return null}
const wzDeckBtn=(g,o)=>wzBtn({v:o.v},`<span class="wzdk wzdk-${o.deck}"><small class="num">${o.deck==='d'?g.dd.length:g.dc.length}</small></span><small>Top of the deck</small>`,{cls:'wzcb wzdeckb',lab:'Take the top card of the deck'});
function wzAskBody(g,V,A){const O=A.opts||[],G=wzAskGroups(A),sel=wzAskSel(A),deckO=O.filter(o=>o.deck),rest=O.filter(o=>o.d==null&&o.c==null&&!o.deck);let h='';
  if(A.show)h+=`<div class="wzhand">${A.show.map(id=>wzCard(id)).join('')}</div>`;
  if(G.size||deckO.length){h+=`<div class="wzhand wzpick">${[...G].map(([k,L])=>{const o=L[0],on=k===sel,c=o.d!=null?wzCard(o.d,{sel:on}):wzCaveCard(o.c,{sel:on});
      return L.length===1?wzBtn({v:o.v},c,{cls:'wzcb',lab:o.l}):`<button class="wzcb${on?' on':''}" data-a="wzgrp" data-k="${esc(k)}" aria-pressed="${on}">${c}</button>`}).join('')}${deckO.map(o=>wzDeckBtn(g,o)).join('')}</div>`;
    if(sel!=null)h+=`<div class="rlab">${G.size>1?'Tap a card, then choose:':'Choose:'}</div><div class="wzopts">${G.get(sel).map(o=>wzBtn({v:o.v},wzLab(o.sub||o.l),{cls:'btn primary'})).join('')}</div>`}
  if(A.kind==='spot')h=`<div class="rlab">Tap a highlighted space on your caves, or a choice below.</div>`+h;
  return h+`<div class="wzopts">${rest.map(o=>wzBtn({v:o.v},wzLab(o.l),{cls:'btn'})).join('')}${A.opt?wzBtn({skip:1},'Skip',{cls:'btn'}):''}</div>`}
/* the starting hand: the 6 real cards; tap the ones to put back, then keep the rest */
let WZKP=null;
function wzKeepBox(g,V,A,box){const key=g.id+V.id+A.opts.map(o=>o.v).join();if(!WZKP||WZKP.k!==key)WZKP={k:key,put:[]};const put=WZKP.put,n=put.length,need=A.drop||2,keepN=A.opts.length-n;
  const cb=o=>{const out=put.includes(o.v);return `<button class="wzcb wzkp${out?' out':''}" data-a="wzkp" data-k="${o.v}" aria-pressed="${out}" aria-label="${esc((out?'Put back: ':'Keep: ')+o.l.replace(/^\S+ /,''))}">${o.d!=null?wzCard(o.d):wzCaveCard(o.c)}<span class="wzkb">${out?'Put back':'Keep'}</span></button>`};
  return box('Your starting hand',`<div class="rlab">Tap ${need} cards to put back; you keep the other ${A.opts.length-need}. <b class="wzkn">Keeping ${keepN} · putting back ${n} of ${need}</b></div>
    <div class="wzhand wzkeep">${A.opts.filter(o=>o.d!=null).map(cb).join('')}${A.opts.filter(o=>o.c!=null).map(cb).join('')}</div>
    <button class="btn primary wide" data-a="wzkgo" ${n===need?'':'disabled'}>${n===need?`Keep these ${keepN}`:`Choose ${need-n} more to put back`}</button>`)}
const wzPayIc=X=>WZR.map(r=>wzI(r).repeat(X[r]||0)).join('')||'nothing';
function wzDock(g,V){const box=(h,b)=>`<div class="sadock cpdock wzdock" style="${pc(V.color)}"><div class="sadh"><span><b>${S.lk||wzHumans().length<2?'You':esc(nm(V))}</b> · ${h}</span></div>${b}</div>`;
  const A=g.ask,hand=o=>`<div class="sec"><div class="sec-h"><h3>Your hand</h3></div>${wzHand(g,V.id,o)}</div>`;
  if(A&&A.pid===V.id){if(A.kind==='keep')return wzKeepBox(g,V,A,box);
    return box(wzLab(A.msg),wzAskBody(g,V,A)+wzTradeBox(g,V))+hand()}
  if(A)return box('Waiting',`<div class="rlab">${esc(nmid(A.pid))}: ${wzLab(A.msg)}</div>`)+hand();
  if(g.turn!==V.id||g.q.length)return box('Waiting',`<div class="rlab">${esc(nmid(g.turn))} is taking a turn.</div>`)+hand();
  const P=g.P[V.id];if(P.passed)return box('Passed',`<div class="rlab">You've passed for this round.</div>`)+hand();
  const Ac=wzActs(g,V.id),S2=WZSEL;let sub='';
  if(S2&&S2.t==='ent'){const o=Ac.ent.find(x=>x.i===S2.i);if(o){const id=P.hand.d[S2.i],D=wzD(id),PO=wzPayOpts(P.res,wzDCost(id)),F=wzPayRes(P.res,wzDCost(id),1),auto={};if(F)WZR.forEach(r=>{if(P.res[r]-F[r])auto[r]=P.res[r]-F[r]});
    let pi=S2.pay!=null?S2.pay:PO.findIndex(X=>wzPayKey(X)===wzPayKey(auto));if(pi<0||pi>=PO.length)pi=0;const pay=PO.length>1?PO[pi]:null,coins=1+(D.cost.coin||0),eggs=D.cost.egg||0;
    sub=`<div class="rlab">Entice <b>${esc(D.n)}</b>: ${coins} coin${coins>1?'s':''}${eggs?` + ${eggs} egg${eggs>1?'s':''}`:''}${PO.length>1?'. Pay with:':PO[0]&&Object.keys(PO[0]).length?` + ${wzPayIc(PO[0])}`:''}</div>${PO.length>1?`<div class="wzopts wzpays">${PO.map((X,i)=>`<button class="btn${i===pi?' primary':''}" data-a="wzpaysel" data-k="${i}" aria-pressed="${i===pi}">${wzPayIc(X)}</button>`).join('')}</div>`:''}
      <div class="rlab">Into:</div><div class="wzopts">${o.cv.map(cv=>wzBtn(pay?{a:'ent',i:S2.i,cv,pay}:{a:'ent',i:S2.i,cv},`${wzCI(cv)} ${WZCN[cv]} (space ${wzNextD(g,V.id,cv)+1})`,{cls:'btn primary'})).join('')}</div>`}}
  if(S2&&S2.t==='exc')sub=`<div class="rlab">Excavate with this cave card in:</div><div class="wzopts">${Ac.exc.map(cv=>{const i=wzNextEx(g,V.id,cv);return wzBtn({a:'exc',i:S2.i,cv},`${wzCI(cv)} ${WZCN[cv]} space ${i+1} (1 coin${WZEXC[i]?` + ${WZEXC[i]} egg${WZEXC[i]>1?'s':''}`:''})`,{cls:'btn primary'})}).join('')||'<span class="rlab">No space you can afford.</span>'}</div>`;
  const exp=WZC.map(cv=>{const n=P.ex[cv];return wzBtn({a:'exp',cv},`${wzCI(cv)}<small>${n>=3?'done':`${n?`+${n}`:''}`}</small>`,{cls:'wzx',dis:!Ac.exp.includes(cv),lab:`Explore the ${WZCN[cv]}: 1 coin${n?` and ${n} egg${n>1?'s':''}`:''}`})}).join('');
  return box(`your turn · ${P.coin} coin${P.coin===1?'':'s'}`,`<div class="wzacts"><div class="wzact"><img src="art/wy-act-excavate.webp" alt=""><b>Excavate</b><small>${Ac.exc.length?'tap a cave card below':'needs a cave card'}</small></div><div class="wzact"><img src="art/wy-act-entice.webp" alt=""><b>Entice</b><small>${Ac.ent.length?'tap a dragon below':'none affordable'}</small></div><div class="wzact"><img src="art/wy-act-explore.webp" alt=""><b>Explore</b><div class="wzxs">${exp}</div><small>1 coin (+1 egg per repeat)</small></div></div>
    ${sub}<div class="wzopts">${wzBtn({a:'pass'},'✋ Pass',{cls:'btn sm'})}${wzTradeBox(g,V)}</div>`)+hand({ent:Ac.ent,exc:Ac.exc.length>0})}
function wzResults(g){const P=act().slice().sort((a,b)=>g.fin[b.id].tot-g.fin[a.id].tot||g.fin[b.id].nd-g.fin[a.id].nd);
  return `<div class="sec"><div class="sec-h"><h3>Final scores</h3></div><div class="panel">${P.map(q=>{const F=g.fin[q.id];return `<div class="prow" style="${pc(q.color)}"><span class="rtext"><b>${esc(nm(q))}</b><br><small class="rlab">Guild ${F.guild} · dragons ${F.dragons} · end-game ${F.abil} · eggs ${F.eggs} · cached ${F.cache} · tucked ${F.tuck} · objectives ${F.obj} · coins ${F.coins} · items ${Math.floor(F.items/4)}</small></span><b class="num">${F.tot}</b></div>`}).join('')}</div>
    <div class="actions"><div class="in">${wzRes2()?`<button class="btn primary" data-a="finish">Finish &amp; reveal scores</button>`:`<span class="rlab">Waiting for the host…</span>`}</div></div></div>`}
function wzDragonSheet(id){const D=wzD(id);return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1"><div class="rs-top"><div><h2 id="lp-h">${esc(D.n)}</h2><small class="lp-sub">Card ${D.no} · ${WZSZ[D.sz]} · ${WZPER[D.per]}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
  <div class="rs-body"><div class="lpbig">${wzCard(id)}</div><p class="rlab">${D.vp} points · lives in ${D.cv.split('').map(c=>WZCN[c]).join(', ')} · cost ${wzCostH(D)}${D.cap?` · holds ${D.cap} egg${D.cap>1?'s':''}`:''}</p><p class="rlab"><b>${WZTYN[D.ty]}:</b> ${esc(wzDSay(D))}</p><p class="hint">The exact wording is on the card.</p></div></div></div>`}
function wzUiAct(a,b,k){const g=wzG();if(!g)return;if(a==='wzshow'){WZVIEW=k;WZSEL=null;return}if(a==='wzlook'){WZLOOK=k;return}const V=wzViewer();if(!V)return;
  if(a==='wzsel'){if(k==='none'){WZSEL=null;return}if(k==='trade'){WZSEL={t:'trade',pay:[]};return}
    const [t,v]=String(k).split(':');if(t==='tp'&&WZSEL&&WZSEL.t==='trade'){WZSEL.pay.push(v);return}
    if(t==='tt'&&WZSEL&&WZSEL.t==='trade'){const mv={trade:{pay:WZSEL.pay,to:v}};WZSEL=null;lkq('wzMove',V.id,mv)&&vibe(8);return}
    if(t==='ent'||t==='exc'){WZSEL={t,i:+v};vibe(6)}return}
  if(a==='wzgrp'){WZSEL={t:'ask',ck:String(k)};vibe(6);return}
  if(a==='wzpaysel'){if(WZSEL&&WZSEL.t==='ent')WZSEL.pay=+k;vibe(6);return}
  if(a==='wzrsok'){if(g.rsum)WZRSOK[wzRsKey(g)]=1;vibe(8);return}
  if(a==='wzkp'){const A=g.ask;if(!WZKP||!A||A.kind!=='keep'||A.pid!==V.id)return;const L=WZKP.put;if(L.includes(k))L.splice(L.indexOf(k),1);else{L.push(k);while(L.length>(A.drop||2))L.shift()}vibe(6);return}
  if(a==='wzkgo'){const A=g.ask;if(!WZKP||!A||A.kind!=='keep'||WZKP.put.length!==(A.drop||2))return;const vs=WZKP.put.slice();WZKP=null;WZSEL=null;lkq('wzMove',V.id,{vs})&&vibe(12);return}
  if(a==='wzans'){let mv;try{mv=JSON.parse(decodeURIComponent(k))}catch(e){return}WZSEL=null;lkq('wzMove',V.id,mv)&&vibe(8);return}}
function wzTick(){if(!wzOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!wzRes2())return;if(lkqRun()){save();render();return}
  const g=wzG();if(!g||wzStale(g)){wzDeal();save();render();return}if(g.phase==='done'||WZBOTT)return;
  if(wzRsShow(g)&&wzViewer()&&Date.now()-g.rsum.at<45e3){WZBOTT=setTimeout(()=>{WZBOTT=null;render()},1000);return}
  if(gAnnBusy(g)){const ms=(g.ann.ms||GLMS)*(window.__htfast?.3:1)-(Date.now()-g.ann.at);WZBOTT=setTimeout(()=>{WZBOTT=null;render()},Math.max(60,ms+40));return}
  const q=act().find(p=>p.bot&&wzWaits(g,p.id));if(!q)return;
  WZBOTT=setTimeout(()=>{WZBOTT=null;WZBOTAT=Date.now();const g2=wzG();if(g2&&g2.phase!=='done'&&wzWaits(g2,q.id)){try{wzBotStep(g2,q)}catch(e){console.error('Wyrmspan bot',e)}save()}render()},600*htSpd());WZBOTAT=Date.now()}
setInterval(()=>{try{if(!wzOn()||!S.started||S.finished||document.hidden)return;const g=wzG();if(!g||g.phase==='done'||!wzRes2())return;const q=act().find(p=>p.bot&&wzWaits(g,p.id));if(!q)return;if(Date.now()-WZBOTAT<4000)return;if(WZBOTT){clearTimeout(WZBOTT);WZBOTT=null}WZBOTAT=Date.now();render()}catch(e){}},1500);
function wzGuide(){return guideSheet('Wyrmspan',[
  ['Your turn: one action',[['Excavate','Pay 1 coin (plus 1 egg for space 3, 2 eggs for space 4) and put a cave card from your hand on the leftmost undug space of a cave. You get the cave card’s benefit. Covering space 4 lets you trade 3 items for 1 coin.'],
    ['Entice','Pay 1 coin plus the dragon’s cost, and put it in the next open space of a cave it can live in (dragons fill each cave left to right, on dug spaces). When-played (⚡) dragons act at once.'],
    ['Explore','Pay 1 coin (2nd time in that cave this round: +1 egg, 3rd: +2 eggs). Your adventurer walks the cave left to right: the entrance benefit, then each dragon’s if-activated (🏮) ability and the benefit after it, until it reaches an empty space.'],
    ['Pass','When you’re out of coins or done. The round ends when everyone has passed.']]],
  ['Exploring the caves',[['How it works','Pay to enter (1st time in that cave this round: 1 coin; 2nd: 1 coin + 1 egg; 3rd, the most: 1 coin + 2 eggs). Your adventurer walks left to right: the entrance reward, then each dragon it walks onto (its if-activated 🏮 ability, if it has one) and the mat reward after that column. It stops at the first space without a dragon and your turn ends. If all 4 spaces have dragons, you also get the end reward. In the app, if-activated abilities are used as you pass them.'],
    ['Crimson Cavern (resources)','Entrance: any resource. After column 1: Dragon Guild +1. After column 2: any resource. After column 3: lay 1 egg. End: cache up to 2 resources from your supply onto any dragons.'],
    ['Golden Grotto (dragon cards)','Entrance: a dragon card. After column 1: Dragon Guild +1. After column 2: a dragon card. After column 3: lay 1 egg. End: tuck up to 2 dragon cards from your hand under any dragons.'],
    ['Amethyst Abyss (cave cards)','Entrance: a cave card. After column 1: Dragon Guild +1. After column 2: a cave card. After column 3: lay 1 egg. End: discard up to 2 cave cards from your hand and lay 1 egg for each.'],
    ['Tip','The more dragons in a row from the left, the further you walk. Explore the cave whose reward you need: resources to afford dragons, dragon cards for choices, cave cards to dig more spaces.']]],
  ['Resources and limits',[['Trading','Any time, trade 2 resources for 1 of another kind. When you’re short while paying, the app covers it with 2 others, and lets you choose which when there’s more than one way.'],['Eggs','Eggs paid as costs are taken from your mat nests first, then your fullest dragons.'],['End of your turn','Discard down to 9 cards, 9 coins and 9 resources.']]],
  ['Dragon Guild',[['Steps','Each guild step moves you 1 space: you gain what you land on. The two brown spaces let you place a marker on the guild tile (4 at most): an ability now, the guild’s end-game bonus, or end-game points (6, 3, then 1 each).']]],
  ['Rounds and the end',[['End of a round','Once-per-round (🔁) dragons act, the round objective is counted, then everyone gains 6 coins and 1 egg and the display is refreshed.'],['Objectives','Points for 1st, 2nd and 3rd; friendly ties; a count of 0 scores nothing.'],['Points','Guild, dragons, end-game (🏁) abilities, eggs, cached resources, tucked cards, objectives, 1 per coin, 1 per 4 other items. Ties: most dragons.']]]])}
