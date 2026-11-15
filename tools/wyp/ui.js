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
function wzCostH(D){const L=[];for(const k of ['meat','gold','crys','milk','coin','egg'])for(let i=0;i<(D.cost[k]||0);i++)L.push(wzI(k));return L.length?L.join(''):'<small>free</small>'}
/* a dragon card (in hand, the display, or on a mat) */
const wzDP=n=>'art/wz-d-'+n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.webp';
function wzCard(id,o={}){const D=wzD(id),x=o.x;return `<div class="wzc wz-${D.per}${o.sel?' sel':''}${o.cls?' '+o.cls:''}" data-lp="wzd:${id}">
  <div class="wzch"><b class="wzn">${esc(D.n)}</b><span class="wzvp num">${D.vp}</span></div>
  <img class="wzimg" src="${wzDP(D.n)}" alt="" loading="lazy" onerror="this.remove()">
  <div class="wzcm"><span>${wzCostH(D)}</span><span title="Caves">${D.cv.split('').map(c=>WZCI[c]).join('')}</span></div>
  <div class="wzcm"><small>${WZSZ[D.sz]} · ${WZPER[D.per]}</small>${D.cap?`<small title="Egg capacity">${x?`${x.e}/`:''}${D.cap}${wzI('egg')}</small>`:''}</div>
  <div class="wzcp"><span title="${WZTYN[D.ty]}">${WZTYI[D.ty]}</span> ${esc(wzDSay(D))}</div>
  ${x&&(x.c||x.t)?`<div class="wzcx">${x.c?`<span title="Cached resources">📦${x.c}</span>`:''}${x.t?`<span title="Tucked cards">🗂️${x.t}</span>`:''}</div>`:''}</div>`}
const wzCaveCard=(id,o={})=>`<div class="wzcave${o.sel?' sel':''}"><b>🪨</b><small>${esc(wzCvSay(id))}</small></div>`;
const wzPickK=(g,V)=>{const A=g.ask;if(!A||!V||A.pid!==V.id)return {};const m={};(A.opts||[]).forEach(o=>{if(o.k&&!m[o.k])m[o.k]=o.v;if(/^[cga][0-3]$|^n$/.test(String(o.v))&&!m[o.v])m[o.v]=o.v});return m};
function wzMat(g,pid,V){const P=g.P[pid],pick=pid===(V&&V.id)?wzPickK(g,V):{};
  const rows=WZC.map(cv=>{const M=P.mat[cv];return `<div class="wzrow wzr-${cv}"><div class="wzent"><img src="art/wy-cave-${cv}.webp" alt=""><b>${WZCI[cv]}</b><small>${esc(WZCN[cv])}</small><small class="rlab">${P.ex[cv]?`explored ${P.ex[cv]}×`:''}</small></div>
    ${M.map((x,i)=>{const kk=cv+i,pk=pick[kk];const inner=!x?`<div class="wzslot dug"><small>Not dug${i>=2?` · ${WZEXC[i]}${wzI('egg')}`:''}</small></div>`:x.d?wzCard(x.d.id,{x:x.d}):`<div class="wzslot open">${x.cv?wzCaveCard(x.cv):'<small>Open</small>'}</div>`;
      return pk!=null?`<button class="wzsp pick" data-a="wzans" data-k="${wzEnc({v:pk})}">${inner}</button>`:`<div class="wzsp">${inner}</div>`}).join('')}</div>`}).join('');
  const nk=pick.n!=null?`<button class="wznest pick" data-a="wzans" data-k="${wzEnc({v:'n'})}">`:'<div class="wznest">';
  return `<div class="wzmat">${rows}</div><div class="wzbase">${nk}<img src="art/wy-nest.webp" alt=""><span>Mat nests: ${P.nest}/2 ${wzI('egg')}</span>${pick.n!=null?'</button>':'</div>'}<span class="rlab">${wzI('coin')}<b class="num">${P.coin}</b> · ${WZR.map(r=>`${wzI(r)}<b class="num">${P.res[r]}</b>`).join(' ')}</span></div>`}
function wzDisplay(g){return `<div class="wzdisp">${g.disp.d.map(id=>id==null?'<div class="wzc empty"></div>':wzCard(id)).join('')}</div>
  <div class="wzdisp wzdc">${g.disp.c.map(id=>id==null?'<div class="wzcave empty"></div>':wzCaveCard(id)).join('')}<div class="wzdeck"><img src="art/wy-back-dragon.webp" alt="Dragon deck"><small class="num">${g.dd.length}</small><img src="art/wy-back-cave.webp" alt="Cave deck"><small class="num">${g.dc.length}</small></div></div>`}
function wzObjHtml(g){return `<div class="wzobjs">${g.obj.map((id,r)=>{const c=g.oc[r];return `<div class="wzob${r===g.rnd&&g.phase!=='done'?' now':''}"><small>Round ${r+1} · ${WYPT[r].join('/')}</small><b>${esc(wzObj(id).say)}</b><small class="num">${act().map(p=>`<span style="${pc(p.color)}" class="wzdot">●</span>${c?c[p.id]:wzObjN(g,p.id,id)}`).join(' ')}</small></div>`}).join('')}</div>`}
function wzGuildHtml(g){const G=WYGUILD[g.guild],B=G.box[g.side],P=act(),dot=pid=>{const p=P.find(q=>q.id===pid);return p?`<span class="wzdot" style="${pc(p.color)}">●</span>`:''};
  return `<div class="panel wzguild"><div class="rlab"><img src="art/wy-marker.webp" class="wzi" alt=""> <b>${esc(G.n)}</b> · ${g.side===4?'4–5':'2–3'} player side</div>
  ${G.say.map((t,r)=>`<div class="srow"><span class="rlab">${esc(t)}</span><span>${g.gbox[r].map(dot).join('')}${'◻'.repeat(Math.max(0,B[r]-g.gbox[r].length))}</span></div>`).join('')}
  <div class="srow"><span class="rlab">End-game points: 6, 3, then 1 each</span><span>${g.gbox[4].map(dot).join('')}</span></div>
  <div class="rlab">Track: ${P.map(p=>`${dot(p.id)}${esc(nm(p))} ${g.P[p.id].gpos} step${g.P[p.id].gpos===1?'':'s'}${g.P[p.id].gm?` · ${g.P[p.id].gm} marker${g.P[p.id].gm>1?'s':''}`:''}`).join(' · ')}</div></div>`}
function wzPlayUI(){const g=wzG(),P=act();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Wyrmspan">${g&&g.phase==='done'?'🏁':'🐉'}</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  if(!g||wzStale(g))return out+`<div class="panel" style="padding:16px">${waitLoader(wzRes2()?'Shuffling the dragons…':'Waiting for the host phone…')}</div>`;
  const V=wzViewer(),hide=!!wzNeedHandoff(),ap=P.find(p=>p.id===wzActor(g)),look=P.find(p=>p.id===WZLOOK)?WZLOOK:V?V.id:g.turn;
  out+=`<div class="tabs hftabs nxtabs" role="list">${P.map(q=>{const Q=g.P[q.id];return `<button class="tab" role="listitem" data-a="wzlook" data-k="${q.id}" style="${pc(q.color)}" aria-pressed="${look===q.id}"><div class="tn">${botHead(q)}${esc(nm(q))}${g.turn===q.id&&g.phase==='play'&&!Q.passed?' ▶':Q.passed&&g.phase==='play'?' ✋':''}</div><div class="ts num">${g.phase==='done'?g.fin[q.id].tot:wzDr(g,q.id).length+'🐉'}</div><div class="tr"><span class="ccgd" title="Coins">${wzI('coin')}${Q.coin}</span><span class="ccgd" title="Eggs">${wzI('egg')}${wzEggs(g,q.id)}</span><span class="ccgd" title="Cards in hand">🃏${wzCards(g,q.id)}</span></div></button>`}).join('')}</div>`;
  const L=g.last,word={pass:'passed',exc:'excavated',ent:'enticed a dragon',exp:'explored'};
  out+=`<div class="hfmin htstat ccstat"><img class="ccpic" src="art/wyrmspan-icon.png" alt="" width="66" height="66" onerror="this.remove()"><div><span>${g.phase==='done'?'<b>Game over.</b>':ap?`${botHead(ap)}<b>${esc(nm(ap))}</b> · ${g.ask?esc(g.ask.msg.replace(/\s*\(.*$/,'').toLowerCase()):'choosing an action'}`:''}</span><span class="rlab">Round ${g.rnd+1} of 4</span><small>${L?`${esc(nmid(L.p))} ${word[L.t]||''}`:''}</small></div></div>`;
  out+=wzObjHtml(g);
  out+=`<div class="sec"><div class="sec-h"><h3>Card display</h3></div>${wzDisplay(g)}</div>`;
  out+=`<div class="sec"><div class="sec-h"><h3>${look===(V&&V.id)?'Your caves':esc(nmid(look))+'’s caves'}</h3></div>${wzMat(g,look,hide?null:V)}</div>`;
  out+=`<div class="sec"><div class="sec-h"><h3>Dragon Guild</h3></div>${wzGuildHtml(g)}</div>`;
  if(g.phase==='done')out+=wzResults(g);
  else if(hide){const h=wzNeedHandoff();out+=`<div class="sheet-bg yzpassbg"><div class="sheet yzpass" role="dialog" aria-modal="true" aria-labelledby="wzh-h" style="${pc(h.color)}"><svg class="yzpm" viewBox="0 0 40 40" aria-hidden="true"><path d="${MGSHAPE_M}"/></svg><span class="rlab">Pass the phone to</span><h2 id="wzh-h">${esc(nm(h))}</h2><p class="rlab">It’s your turn. Everyone else, look away.</p><button class="btn primary wide" data-a="wzshow" data-k="${h.id}">I’m ${esc(nm(h))}, show my cards</button></div></div>`}
  else if(V)out+=wzDock(g,V);
  return out}
function wzHand(g,pid,o={}){const H=g.P[pid].hand;return `<div class="wzhand">${H.d.map((id,i)=>o.ent&&o.ent.some(x=>x.i===i)?`<button class="wzcb${WZSEL&&WZSEL.t==='ent'&&WZSEL.i===i?' on':''}" data-a="wzsel" data-k="ent:${i}">${wzCard(id,{sel:WZSEL&&WZSEL.t==='ent'&&WZSEL.i===i})}</button>`:wzCard(id,{cls:o.ent?'dim':''})).join('')||'<div class="rlab">No dragon cards.</div>'}</div>
  <div class="wzhand">${H.c.map((id,i)=>o.exc?`<button class="wzcb${WZSEL&&WZSEL.t==='exc'&&WZSEL.i===i?' on':''}" data-a="wzsel" data-k="exc:${i}">${wzCaveCard(id,{sel:WZSEL&&WZSEL.t==='exc'&&WZSEL.i===i})}</button>`:wzCaveCard(id)).join('')||'<div class="rlab">No cave cards.</div>'}</div>`}
function wzTradeBox(g,V){const R=g.P[V.id].res;if(wzRes(g,V.id)<2)return '';const T=WZSEL&&WZSEL.t==='trade'?WZSEL:null;
  if(!T)return `<button class="btn sm" data-a="wzsel" data-k="trade">🔁 Trade 2 resources for 1</button>`;
  const left={...R};T.pay.forEach(r=>left[r]--);
  return `<div class="panel wztrade"><div class="rlab">${T.pay.length<2?`Pay 2 resources (${2-T.pay.length} to go):`:'Take which one?'} ${T.pay.map(r=>wzI(r)).join('')}</div><div class="wzopts">${T.pay.length<2?WZR.filter(r=>left[r]>0).map(r=>`<button class="btn sm" data-a="wzsel" data-k="tp:${r}">${wzI(r)} ${WZRN[r]}</button>`).join(''):WZR.filter(r=>!T.pay.includes(r)).map(r=>`<button class="btn sm" data-a="wzsel" data-k="tt:${r}">${wzI(r)} ${WZRN[r]}</button>`).join('')}<button class="btn sm" data-a="wzsel" data-k="none">Cancel</button></div></div>`}
function wzDock(g,V){const box=(h,b)=>`<div class="sadock cpdock wzdock" style="${pc(V.color)}"><div class="sadh"><span><b>${S.lk||wzHumans().length<2?'You':esc(nm(V))}</b> · ${h}</span></div>${b}</div>`;
  const A=g.ask,hand=o=>`<div class="sec"><div class="sec-h"><h3>Your hand</h3></div>${wzHand(g,V.id,o)}</div>`;
  if(A&&A.pid===V.id){const opts=(A.opts||[]).map(o=>wzBtn({v:o.v},esc(o.l),{cls:'btn'})).join('');
    return box(esc(A.msg),`${A.kind==='spot'?'<div class="rlab">Tap a highlighted space on your caves, or a choice below.</div>':''}<div class="wzopts">${opts}${A.opt?wzBtn({skip:1},'Skip',{cls:'btn'}):''}</div>${wzTradeBox(g,V)}`)+hand()}
  if(A)return box('Waiting',`<div class="rlab">${esc(nmid(A.pid))}: ${esc(A.msg)}</div>`)+hand();
  if(g.turn!==V.id||g.q.length)return box('Waiting',`<div class="rlab">${esc(nmid(g.turn))} is taking a turn.</div>`)+hand();
  const P=g.P[V.id];if(P.passed)return box('Passed',`<div class="rlab">You've passed for this round.</div>`)+hand();
  const Ac=wzActs(g,V.id),S2=WZSEL;let sub='';
  if(S2&&S2.t==='ent'){const o=Ac.ent.find(x=>x.i===S2.i);if(o)sub=`<div class="rlab">Entice ${esc(wzD(P.hand.d[S2.i]).n)} into:</div><div class="wzopts">${o.cv.map(cv=>wzBtn({a:'ent',i:S2.i,cv},`${WZCI[cv]} ${WZCN[cv]} (space ${wzNextD(g,V.id,cv)+1})`,{cls:'btn primary'})).join('')}</div>`}
  if(S2&&S2.t==='exc')sub=`<div class="rlab">Excavate with this cave card in:</div><div class="wzopts">${Ac.exc.map(cv=>{const i=wzNextEx(g,V.id,cv);return wzBtn({a:'exc',i:S2.i,cv},`${WZCI[cv]} ${WZCN[cv]} space ${i+1} (1 coin${WZEXC[i]?` + ${WZEXC[i]} egg${WZEXC[i]>1?'s':''}`:''})`,{cls:'btn primary'})}).join('')||'<span class="rlab">No space you can afford.</span>'}</div>`;
  const exp=WZC.map(cv=>{const n=P.ex[cv];return wzBtn({a:'exp',cv},`${WZCI[cv]}<small>${n>=3?'done':`${n?`+${n}`:''}`}</small>`,{cls:'wzx',dis:!Ac.exp.includes(cv),lab:`Explore the ${WZCN[cv]}: 1 coin${n?` and ${n} egg${n>1?'s':''}`:''}`})}).join('');
  return box(`your turn · ${P.coin} coin${P.coin===1?'':'s'}`,`<div class="wzacts"><div class="wzact"><img src="art/wy-act-excavate.webp" alt=""><b>Excavate</b><small>${Ac.exc.length?'tap a cave card below':'needs a cave card'}</small></div><div class="wzact"><img src="art/wy-act-entice.webp" alt=""><b>Entice</b><small>${Ac.ent.length?'tap a dragon below':'none affordable'}</small></div><div class="wzact"><img src="art/wy-act-explore.webp" alt=""><b>Explore</b><div class="wzxs">${exp}</div><small>1 coin (+1 egg per repeat)</small></div></div>
    ${sub}<div class="wzopts">${wzBtn({a:'pass'},'✋ Pass',{cls:'btn sm'})}${wzTradeBox(g,V)}</div>`)+hand({ent:Ac.ent,exc:Ac.exc.length>0})}
function wzResults(g){const P=act().slice().sort((a,b)=>g.fin[b.id].tot-g.fin[a.id].tot||g.fin[b.id].nd-g.fin[a.id].nd);
  return `<div class="sec"><div class="sec-h"><h3>Final scores</h3></div><div class="panel">${P.map(q=>{const F=g.fin[q.id];return `<div class="prow" style="${pc(q.color)}"><span class="rtext"><b>${esc(nm(q))}</b><br><small class="rlab">Guild ${F.guild} · dragons ${F.dragons} · end-game ${F.abil} · eggs ${F.eggs} · cached ${F.cache} · tucked ${F.tuck} · objectives ${F.obj} · coins ${F.coins} · items ${Math.floor(F.items/4)}</small></span><b class="num">${F.tot}</b></div>`}).join('')}</div>
    <div class="actions"><div class="in">${wzRes2()?`<button class="btn primary" data-a="finish">Finish &amp; reveal scores</button>`:`<span class="rlab">Waiting for the host…</span>`}</div></div></div>`}
function wzDragonSheet(id){const D=wzD(id);return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1"><div class="rs-top"><div><h2 id="lp-h">${esc(D.n)}</h2><small class="lp-sub">Card ${D.no} · ${WZSZ[D.sz]} · ${WZPER[D.per]}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
  <div class="rs-body"><img class="wpbsimg" src="${wzDP(D.n)}" alt="${esc(D.n)}" onerror="this.remove()">${wzCard(id)}<p class="rlab">${D.vp} points · lives in ${D.cv.split('').map(c=>WZCN[c]).join(', ')} · cost ${wzCostH(D)}${D.cap?` · holds ${D.cap} egg${D.cap>1?'s':''}`:''}</p><p class="rlab"><b>${WZTYN[D.ty]}:</b> ${esc(wzDSay(D))}</p><p class="hint">The exact wording is on the card.</p></div></div></div>`}
function wzUiAct(a,b,k){const g=wzG();if(!g)return;if(a==='wzshow'){WZVIEW=k;WZSEL=null;return}if(a==='wzlook'){WZLOOK=k;return}const V=wzViewer();if(!V)return;
  if(a==='wzsel'){if(k==='none'){WZSEL=null;return}if(k==='trade'){WZSEL={t:'trade',pay:[]};return}
    const [t,v]=String(k).split(':');if(t==='tp'&&WZSEL&&WZSEL.t==='trade'){WZSEL.pay.push(v);return}
    if(t==='tt'&&WZSEL&&WZSEL.t==='trade'){const mv={trade:{pay:WZSEL.pay,to:v}};WZSEL=null;lkq('wzMove',V.id,mv)&&vibe(8);return}
    if(t==='ent'||t==='exc'){WZSEL={t,i:+v};vibe(6)}return}
  if(a==='wzans'){let mv;try{mv=JSON.parse(decodeURIComponent(k))}catch(e){return}WZSEL=null;lkq('wzMove',V.id,mv)&&vibe(8);return}}
function wzTick(){if(!wzOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!wzRes2())return;if(lkqRun()){save();render();return}
  const g=wzG();if(!g||wzStale(g)){wzDeal();save();render();return}if(g.phase==='done'||WZBOTT)return;
  if(gAnnBusy(g)){const ms=(g.ann.ms||GLMS)*(window.__htfast?.3:1)-(Date.now()-g.ann.at);WZBOTT=setTimeout(()=>{WZBOTT=null;render()},Math.max(60,ms+40));return}
  const q=act().find(p=>p.bot&&wzWaits(g,p.id));if(!q)return;
  WZBOTT=setTimeout(()=>{WZBOTT=null;WZBOTAT=Date.now();const g2=wzG();if(g2&&g2.phase!=='done'&&wzWaits(g2,q.id)){try{wzBotStep(g2,q)}catch(e){console.error('Wyrmspan bot',e)}save()}render()},600*htSpd());WZBOTAT=Date.now()}
setInterval(()=>{try{if(!wzOn()||!S.started||S.finished||document.hidden)return;const g=wzG();if(!g||g.phase==='done'||!wzRes2())return;const q=act().find(p=>p.bot&&wzWaits(g,p.id));if(!q)return;if(Date.now()-WZBOTAT<4000)return;if(WZBOTT){clearTimeout(WZBOTT);WZBOTT=null}WZBOTAT=Date.now();render()}catch(e){}},1500);
function wzGuide(){return guideSheet('Wyrmspan',[
  ['Your turn: one action',[['Excavate','Pay 1 coin (plus 1 egg for space 3, 2 eggs for space 4) and put a cave card from your hand on the leftmost undug space of a cave. You get the cave card’s benefit. Covering space 4 lets you trade 3 items for 1 coin.'],
    ['Entice','Pay 1 coin plus the dragon’s cost, and put it in the next open space of a cave it can live in (dragons fill each cave left to right, on dug spaces). When-played (⚡) dragons act at once.'],
    ['Explore','Pay 1 coin (2nd time in that cave this round: +1 egg, 3rd: +2 eggs). Your adventurer walks the cave left to right: the entrance benefit, then each dragon’s if-activated (🏮) ability and the benefit after it, until it reaches an empty space.'],
    ['Pass','When you’re out of coins or done. The round ends when everyone has passed.']]],
  ['Resources and limits',[['Trading','Any time, trade 2 resources for 1 of another kind. When you pay, the app does this for you if you’re short.'],['Eggs','Eggs paid as costs are taken from your mat nests first, then your fullest dragons.'],['End of your turn','Discard down to 9 cards, 9 coins and 9 resources.']]],
  ['Dragon Guild',[['Steps','Each guild step moves you 1 space: you gain what you land on. The two brown spaces let you place a marker on the guild tile (4 at most): an ability now, the guild’s end-game bonus, or end-game points (6, 3, then 1 each).']]],
  ['Rounds and the end',[['End of a round','Once-per-round (🔁) dragons act, the round objective is counted, then everyone gains 6 coins and 1 egg and the display is refreshed.'],['Objectives','Points for 1st, 2nd and 3rd; friendly ties; a count of 0 scores nothing.'],['Points','Guild, dragons, end-game (🏁) abilities, eggs, cached resources, tucked cards, objectives, 1 per coin, 1 per 4 other items. Ties: most dragons.']]]])}
