/* ================= Dead of Winter: settings, record sheet and the play screen ================= */
const DWDEF={play:1,mo:'',side:'std',mode:'normal'};
const DWX=()=>{if(!S.dwx)S.dwx={...DWDEF};const X=S.dwx;for(const k in DWDEF)if(X[k]===undefined)X[k]=DWDEF[k];return X};
function dwSaved(){let x=null;try{x=JSON.parse(localStorage.getItem(KEY+'.dwx'))}catch(e){}return Object.assign({...DWDEF},x||{})}
function dwKeep(){if(S.demo)return;try{localStorage.setItem(KEY+'.dwx',JSON.stringify(DWX()))}catch(e){}}
const dwPlayOn=()=>S.game==='deadofwinter'&&!!DWX().play;
const dwGg=()=>S.dwg||null;
const dwRes2=()=>!S.lk||S.demo||lkHost();
function dwFresh(){return {game:'deadofwinter',screen:'map',map:'deadofwinter',rules:{},started:false,active:0,picks:{},hr:0,dwx:dwSaved(),dwrec:{},players:CARC_COLORS.map((c,i)=>newPlayer('',c,i<4))}}
function DWM(){return {name:'Dead of Winter',meta:'Survival game · secret objectives · win or lose',min:dwPlayOn()?1:2,max:5,teams:false,colors:CARC_COLORS,lengths:[],pieces:0,piece:'',own:[],defaults:[],tb:[]}}
const dwP=p=>{if(!p.dw)p.dw={win:0,betray:0,exiled:0,obj:''};return p.dw};
const dwTot=p=>(p.dw&&p.dw.win)?1:0;
const DWSYM={food:'🥫',fuel:'⛽',med:'💊',tools:'🔧',weapon:'🔫',book:'📕',outsider:'👤'};
const DWLI={colony:'🏚️',police:'🚓',grocery:'🛒',school:'🏫',library:'📚',hospital:'🏥',gas:'⛽'};
const dwMOid=id=>DWMO.find(m=>m.id===id);
const dwSO=n=>{const S2=DWSO;return [...S2.regular,...S2.betrayal,...S2.exile].find(o=>o.n===n)};
const dwCard=c=>{const I=DWI[c];return I?{...DWK[I.k],k:I.k,d:I.d,id:c}:null};

/* ---------- home, setup, record sheet ---------- */
function dwHomeCard(){const st=gamePeek('deadofwinter');
  return `<div class="game"><div class="gtop"><img class="gart" src="art/deadofwinter-icon.png" alt="" width="84" height="84" onerror="this.outerHTML='<div class=&quot;gart nxart&quot; aria-hidden=&quot;true&quot;>🧟</div>'"><div><h2>Dead of Winter</h2><div class="meta">Survival game · secret objectives · win or lose</div></div></div>
    ${st&&st.started&&!st.finished?`<div class="rlab">Game in progress${st.touched?` · last changed ${ago(st.touched)}`:''}</div><div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="gresume" data-k="deadofwinter">Resume game</button><button class="btn" data-a="gnew" data-k="deadofwinter">New game</button><button class="btn" data-a="gabandon" data-k="deadofwinter" aria-label="Abandon this game">${ABANDON==='deadofwinter'?'Tap again to abandon':'🗑'}</button></div>`
      :`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="dwstart" data-k="1">🧟 Play</button><button class="btn" style="flex:1" data-a="dwstart" data-k="0">Record a game</button></div>`}</div>`}
function dwSetup(){const X=DWX(),lock=S.started&&dwPlayOn(),seg=(a,opts,cur)=>`<div class="seg">${opts.map(([v,t])=>`<button data-a="${a}" data-k="${v}" aria-pressed="${String(cur)===String(v)}" ${lock?'disabled':''}>${t}</button>`).join('')}</div>`;
  const mo=dwMOid(X.mo);
  return `<div class="bar"><h1>Dead of Winter</h1></div><img class="hero hfhero" src="art/deadofwinter-banner.jpg" alt="" width="1200" height="560" onerror="this.remove()">${steps(1)}
  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${dwPlayOn()?'🧟 Playing on the phones':'Recording a real game'}</b></div>`:seg('dwplaymode',[[1,'🧟 Play on the phones'],[0,'Record a real game']],X.play?1:0)}</div>
  <p class="hint">${X.play?'The phones deal the survivors, items, crises and objectives and keep everything secret: link everyone’s phone, pass one phone around (it hides each hand), or add computer players. Crossroads cards are being added.':'Play with the real box, then record who won, the main objective, the betrayer and anyone exiled.'}</p></div>
  ${X.play?`<div class="sec"><div class="sec-h"><h3>Main objective</h3></div><div class="panel hfpanel"><div class="seg dwmos">${[['','🎲 Random'],...DWMO.map(m=>[m.id,m.side?m.n:(m.std.name||m.n)])].map(([v,t])=>`<button data-a="dwmo" data-k="${v}" aria-pressed="${X.mo===v}" ${lock?'disabled':''}>${esc(t)}</button>`).join('')}</div>${seg('dwside',[['std','Standard'],['hc','⚠️ Hardcore']],X.side)}</div>
  <p class="hint">${mo?`${esc((mo[X.side]||mo.std).name||mo.n)}: ${esc((mo[X.side]||mo.std).goal)} Morale starts at ${(mo[X.side]||mo.std).mor}, ${(mo[X.side]||mo.std).rnd} rounds. Time: ${esc(mo.time)}.`:'A main objective is picked at random when the game starts. The rulebook suggests We Need More Samples for a first game.'}</p></div>
  <div class="sec"><div class="sec-h"><h3>Secret objectives</h3></div><div class="panel hfpanel">${seg('dwmode',[['normal','Official'],['betrayer','More betrayers'],['coop','Co-op']],X.mode)}</div>
  <p class="hint">${X.mode==='coop'?'Co-op variant: no secret objectives and no exile votes; everyone wins together by completing the main objective (the rulebook uses the hardcore side). Cards with the non co-op mark are left out.':X.mode==='betrayer'?'Betrayer variant: only 1 regular objective per player goes in with 1 betrayal card, so a betrayer is much more likely.':'Official rules: 2 regular objectives per player and 1 betrayal objective are shuffled, and each player gets one. There may or may not be a betrayer.'}</p></div>`:''}
  <p class="hint">${usualUI('deadofwinter')}</p>
  <div class="actions"><div class="in"><button class="btn primary" data-a="go" data-s="players">Players ›</button></div></div>`}
function dwScoreScr(){if(dwPlayOn()&&S.started&&!S.demo)return dwPlayUI();return dwScoreSheet()}
function dwScoreSheet(){const P=act(),R=S.dwrec||(S.dwrec={}),tg=(i,f,on,lab)=>`<button class="sw" role="switch" aria-checked="${!!on}" data-a="dwrec" data-k="${i}:${f}" aria-label="${esc(lab)}"><i></i></button>`;
  return `<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1>Dead of Winter</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>
  <div class="sec"><div class="sec-h"><h3>Main objective</h3></div><div class="panel hfpanel"><div class="seg dwmos">${DWMO.map(m=>`<button data-a="dwrecmo" data-k="${m.id}" aria-pressed="${R.mo===m.id}">${esc(m.std.name||m.n)}</button>`).join('')}</div><div class="seg">${[['std','Standard'],['hc','Hardcore']].map(([v,t])=>`<button data-a="dwrecside" data-k="${v}" aria-pressed="${(R.side||'std')===v}">${t}</button>`).join('')}</div>
  <div class="seg">${[['done','Completed'],['morale','Morale hit 0'],['rounds','Out of rounds']].map(([v,t])=>`<button data-a="dwrecend" data-k="${v}" aria-pressed="${R.end===v}">${t}</button>`).join('')}</div></div></div>
  <p class="hint lv-hint hftip">For each player: did they complete their secret objective? Mark the betrayer and anyone exiled.</p>
  <div class="nxlist">${P.map((p,i)=>{const D=dwP(p);return `<div class="nxcard" style="${pc(p.color)}"><div class="nxh"><b>${esc(nm(p))}</b><span class="num nxpts">${D.win?'🏆 Won':'Lost'}</span></div>
    <div class="srow"><span class="rlab">Won (secret objective done)</span>${tg(i,'win',D.win,nm(p)+': won')}</div><div class="srow"><span class="rlab">Betrayer</span>${tg(i,'betray',D.betray,nm(p)+': betrayer')}</div><div class="srow"><span class="rlab">Exiled</span>${tg(i,'exiled',D.exiled,nm(p)+': exiled')}</div>
    <div class="srow"><span class="rlab">Secret objective</span><input class="dwobjin" data-dwo="${i}" value="${esc(D.obj||'')}" placeholder="optional" aria-label="${esc(nm(p))}: secret objective" list="dwobjlist"></div></div>`}).join('')}</div>
  <datalist id="dwobjlist">${[...DWSO.regular,...DWSO.betrayal,...DWSO.exile].map(o=>`<option value="${esc(o.n)}">`).join('')}</datalist>
  <div class="actions"><div class="in"><button class="btn primary" data-a="finish">Finish &amp; reveal</button></div></div>`}
function dwRefresh(){}
function dwChecks(){if(dwPlayOn()&&S.dwg)return [];const R=S.dwrec||{};const o=[];if(!R.mo)o.push('No main objective chosen.');if(!act().some(p=>(p.dw||{}).win)&&R.end==='done')o.push('Nobody is marked as a winner.');return o}
function dwResults(){const R=S.dwrec||{},mo=dwMOid(R.mo),P=act().slice().sort((a,b)=>dwTot(b)-dwTot(a));
  return `<div class="bar"><button class="back" data-a="go" data-s="score">‹ ${dwPlayOn()?'Game':'Record'}</button><h1>Results</h1></div>
  ${mo?`<p class="rlab dwresmo">Main objective: <b>${esc((mo[R.side||'std']||mo.std).name||mo.n)}</b>${R.side==='hc'?' (hardcore)':''} · ${R.end==='done'?'completed':R.end==='morale'?'morale hit 0':R.end==='rounds'?'ran out of rounds':''}</p>`:''}
  <div class="podium">${P.map(p=>{const D=p.dw||{};return `<div class="res ${D.win?'win':''}" style="${pc(p.color)}"><div class="rtop"><span class="rank num">${D.win?'🏆':'✗'}</span><span class="rname">${esc(nm(p))}</span><span class="rtot">${D.win?'Won':'Lost'}</span></div>
    <p class="rlab">${D.obj?`Secret objective: <b>${esc(D.obj)}</b>`:''}${D.betray?' · 🗡️ betrayer':''}${D.exiled?' · 🚪 exiled':''}</p></div>`}).join('')}</div>
  ${awardsHtml()}${photoBlock()}
  <div class="actions"><div class="in"><button class="btn primary" data-a="rematch">Rematch, same players</button></div></div>`}
function dwAwards(){const P=act(),out=[];const b=P.filter(p=>(p.dw||{}).betray&&(p.dw||{}).win);if(b.length)out.push({title:'Master of lies',ps:b,why:'won as the betrayer'});const ex=P.filter(p=>(p.dw||{}).exiled&&(p.dw||{}).win);if(ex.length)out.push({title:'Cast out, still standing',ps:ex,why:'won after being exiled'});return out}
function dwHistory(pid){const p=act().find(q=>q.id===pid);if(!p)return '';const D=p.dw||{};
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet phsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1" style="${pc(p.color)}"><div class="rs-top"><div><h2 id="lp-h">${esc(nm(p))}</h2><small class="lp-sub">${D.win?'Won':'Lost'}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
    <div class="rs-body"><ul class="phlist hfhist"><li><span><b>Secret objective</b></span><span class="hfh-v">${esc(D.obj||'·')}</span></li><li><span><b>Betrayer</b></span><span class="hfh-v">${D.betray?'Yes':'No'}</span></li><li><span><b>Exiled</b></span><span class="hfh-v">${D.exiled?'Yes':'No'}</span></li></ul></div></div></div>`}
function dwRevSteps(){return [{name:'Secret objective',f:p=>dwTot(p)}]}
function dwGuide(){return guideSheet('Dead of Winter',[
  ['A round',[['Crisis','A crisis is revealed. Before the colony phase, everyone may add item cards face down: matching cards count +1, others −1. It’s prevented when the total reaches the number of non-exiled players (+1 morale at 2 more).'],['Dice','Everyone rolls 1 die plus 1 per survivor they control.'],['Turns','Starting with the first player and going left, each player takes a turn. The player on your right holds a crossroads card that may trigger during your turn.']]],
  ['Your turn',[['Dice actions','Attack (die ≥ attack value), search (die ≥ search value; make noise to draw more), barricade, clean waste (3 cards), attract 2 zombies, survivor abilities.'],['Free actions','Play or equip cards, move each survivor once (roll exposure), spend food tokens to raise a die, add cards to the crisis, request cards, hand off equipped items, start one exile vote.'],['Exposure die','Moving or killing a zombie rolls it: blank, wound, frostbite (an extra wound each of your turns) or bite (the survivor dies and the bite may spread).']]],
  ['Colony phase',[['In order','Pay food (1 per 2 colony survivors, helpless too), check waste (−1 morale per 10 cards), resolve the crisis, add zombies (1 per 2 colony survivors; 1 per survivor elsewhere; noise rolls), check the main objective, move the round track, pass the first player token to the right.']]],
  ['The end',[['Game over','Morale reaches 0, the round track reaches 0, or the main objective is completed.'],['Winning','Each player wins if their secret objective is complete. Several players can win, or nobody.'],['Exile','Players may vote to exile someone. An exiled player gets an exile objective, leaves the colony and can’t add to crises or vote.']]]])}
function dwStats(p){const D=p.dw||{};return [{k:'Result',v:D.win?'Won':'Lost',i:'🧟'},{k:'Objective',v:D.obj||'·'},{k:'Betrayer',v:D.betray?'Yes':'No'}]}

/* ---------- the play screen ---------- */
let DWVIEW=null,DWLOOK=null,DWSEL=null,DWBOTT=null,DWBOTAT=0,DWLOG=0;
const dwHumans=()=>act().filter(p=>!p.bot);
function dwViewer(){const g=dwGg();if(!g)return null;if(S.lk&&!S.demo)return act().find(p=>p.id===S.lk.me)||null;const H=dwHumans();if(H.length===1)return H[0];if(!H.length)return null;return H.find(p=>p.id===DWVIEW)||null}
const dwAct=g=>{try{return typeof dwActor==='function'?dwActor(g):null}catch(e){return null}};
const dwNeedHandoff=()=>{if(S.lk&&!S.demo)return null;const g=dwGg();if(!g||g.phase==='done'||dwHumans().length<2)return null;const a=dwAct(g),t=act().find(p=>p.id===a);return t&&!t.bot&&DWVIEW!==t.id?t:null};
const dwEnc=mv=>encodeURIComponent(JSON.stringify(mv));
const dwBtn=(mv,html,o={})=>`<button class="${o.cls||'dwab'}" data-a="dwans" data-k="${dwEnc(mv)}"${o.dis?' disabled':''}${o.lab?` aria-label="${esc(o.lab)}"`:''}>${html}</button>`;
const dwSelB=(k,html,o={})=>`<button class="${o.cls||'btn sm'}${o.on?' on':''}" data-a="dwsel" data-k="${esc(k)}"${o.dis?' disabled':''}>${html}</button>`;
const dwPlayer=pid=>act().find(p=>p.id===pid);
const dwPName=pid=>{const p=dwPlayer(pid);return p?nm(p):'?'};
const dwSurvAt=(g,loc)=>Object.keys(g.sv||{}).filter(id=>g.sv[id]&&g.sv[id].loc===loc).map(Number);
function dwWounds(x){return `${'🩸'.repeat(Math.max(0,(x.w||0)-(x.fb||0)))}${'❄️'.repeat(x.fb||0)}`}
function dwSvChip(g,id,o={}){const x=g.sv[id],D=dwSv(id),p=dwPlayer(x.pid);return `<span class="dwsv${o.sel?' sel':''}" style="${p?pc(p.color):''}" data-lp="dws:${id}" title="${esc(D.n)}"><b>${esc(D.n.split(' ')[0])}</b>${(x.w||0)?`<i>${dwWounds(x)}</i>`:''}${(x.eq||[]).length?`<i>🎒${x.eq.length}</i>`:''}${g.P[x.pid]&&g.P[x.pid].lead===id?'<i title="Group leader">★</i>':''}</span>`}
function dwColony(g){const C=(g.loc||{}).colony||{},mo=g.mo?dwMOid(g.mo.id):null,side=g.mo?g.mo.side:'std',M=mo?(mo[side]||mo.std):null,cr=g.crisis&&g.crisis.id!=null?DWCR[g.crisis.id]:null,crN=cr?DWCR.find(c=>c===cr):null;
  return `<div class="panel dwcol"><div class="dwtrack"><span title="Morale">❤️ <b class="num">${g.morale??'·'}</b></span><span title="Rounds left">⏳ <b class="num">${g.round??'·'}</b></span><span title="Food tokens">🥫 <b class="num">${g.food??0}</b></span>${g.starve?`<span title="Starvation tokens">💀 <b class="num">${g.starve}</b></span>`:''}<span title="Waste pile">🗑️ <b class="num">${(g.waste||[]).length}</b></span><span title="Helpless survivors">🧒 <b class="num">${g.helpless||0}</b></span></div>
    <div class="dwents">${(C.ent||[]).map((e,i)=>`<span class="dwent" title="Entrance ${i+1}"><small>${i+1}</small>${'🧟'.repeat(e.z||0)}${'🧱'.repeat(e.bar||0)}${'·'.repeat(Math.max(0,(DWCOL.zombPerEntrance||3)-(e.z||0)-(e.bar||0)))}</span>`).join('')}</div>
    <div class="dwsvrow">${dwSurvAt(g,'colony').map(id=>dwSvChip(g,id)).join('')||'<span class="rlab">No survivors at the colony.</span>'}</div>
    ${M?`<div class="dwmo"><b>🎯 ${esc(M.name||mo.n)}${side==='hc'?' ⚠️':''}</b><small>${esc(M.goal)}</small>${g.mo.cards&&g.mo.cards.length||g.mo.tokens?`<small>Under the objective: ${g.mo.cards&&g.mo.cards.length?g.mo.cards.length+' card'+(g.mo.cards.length>1?'s':''):''}${g.mo.tokens?` ${g.mo.tokens} zombie token${g.mo.tokens>1?'s':''}`:''}</small>`:''}</div>`:''}
    ${cr?`<div class="dwcrisis"><b>⚠️ Crisis: ${esc(cr.n)}</b><small>Needs ${cr.need.map(k=>DWSYM[k]+' '+DWSYMN[k]).join(' or ')} · ${(g.crisis.add||[]).length} card${(g.crisis.add||[]).length===1?'':'s'} added face down</small></div>`:''}</div>`}
function dwLocs(g){return `<div class="dwlocs">${DWLOC.map(L=>{const st=(g.loc||{})[L.id]||{},sv=dwSurvAt(g,L.id),dk=((g.decks||{})[L.id]||[]).length;
  return `<div class="dwloc"><div class="dwlh"><b>${DWLI[L.id]} ${esc(L.n)}</b><small>${sv.length}/${L.surv} · 🃏${dk}</small></div><div class="dwlz">${'🧟'.repeat(st.z||0)}${'🧱'.repeat(st.bar||0)}${'·'.repeat(Math.max(0,L.zomb-(st.z||0)-(st.bar||0)))}${st.noise?` <span title="Noise">🔊${st.noise}</span>`:''}</div><div class="dwsvrow">${sv.map(id=>dwSvChip(g,id)).join('')}</div></div>`}).join('')}</div>`}
function dwHandCards(g,V,o={}){const P=g.P[V.id]||{};return (P.hand||[]).map(c=>{const C=dwCard(c);if(!C)return '';return `<button class="dwcard${DWSEL&&DWSEL.c===c?' on':''}" data-a="dwsel" data-k="card:${c}" data-lp="dwi:${c}"${o.dis?' disabled':''}><b>${DWSYM[C.sym]||''} ${esc(C.n)}</b><small>${C.use==='equip'?'Equip: ':C.use==='event'?'':'Play: '}${esc(C.say)}</small></button>`}).join('')||'<span class="rlab">No cards in hand.</span>'}
const dwObjP=(g,pid)=>{const P=(g.P||{})[pid]||{};if(!P.obj)return null;return typeof P.obj==='string'?dwSO(P.obj):(DWSO[P.obj.t]||[])[P.obj.i]||null};
function dwObjBox(g,V){const P=g.P[V.id]||{};if(g.mode==='coop')return `<div class="dwobj"><b>🤝 Co-op: everyone wins together by completing the main objective.</b></div>`;const o=dwObjP(g,V.id);if(!o)return '';const ex=P.exObj!=null?DWSO.exile[P.exObj]:null;
  return `<details class="dwobj"><summary>🤫 Your secret objective${P.betray?' (betrayal)':''}${P.exiled?' · exiled':''}</summary><b>${esc(o.n)}</b><small>${P.betray?'Morale at 0. ':'Main objective completed. '}${esc(o.need||'')}</small>${ex?`<b>Exile: ${esc(ex.n)}</b><small>${esc(P.betray?ex.betray:ex.plain)}</small>`:''}</details>`}
function dwXrBox(g,V){const P=g.P[V.id]||{};if(P.xr==null)return '';const X=typeof DWXR!=='undefined'?DWXR[P.xr]:null;
  return `<div class="dwxr">✖️ You’re holding a crossroads card for ${esc(dwPName(P.xrFor||g.turn))}${X?`: <b>${esc(X.t)}</b><small>${esc(X.say||'')}</small>`:''}</div>`}
function dwDice(g,pid){const P=g.P[pid]||{};return `<div class="dwdice">${(P.dice||[]).map((v,i)=>`<button class="dwdie${DWSEL&&DWSEL.die===i?' on':''}" data-a="dwsel" data-k="die:${i}" aria-label="Unused die ${v}">${v}</button>`).join('')}${(P.used||[]).map(v=>`<span class="dwdie used" aria-label="Used die ${v}">${v}</span>`).join('')}</div>`}
function dwMySurvs(g,V){const P=g.P[V.id]||{},L=[P.lead,...(P.follow||[])].filter(x=>x!=null&&g.sv[x]);
  return `<div class="dwmine">${L.map(id=>{const x=g.sv[id],D=dwSv(id);return `<button class="dwmy${DWSEL&&DWSEL.s===id?' on':''}" data-a="dwsel" data-k="surv:${id}" data-lp="dws:${id}"><b>${P.lead===id?'★ ':''}${esc(D.n)}</b><small>${DWLI[x.loc]||''} ${esc(DWLN[x.loc]||x.loc)} · ⚔️${D.atk}+ 🔍${D.sr}+ ${dwWounds(x)}${(x.eq||[]).map(c=>' 🎒'+esc((dwCard(c)||{}).n||'')).join('')}</small></button>`}).join('')}</div>`}
/* which moves the selected things allow (the engine still checks every move) */
function dwActions(g,V){const S2=DWSEL||{},P=g.P[V.id]||{},dice=P.dice||[],out=[];const dv=S2.die!=null?dice[S2.die]:null;
  if(S2.s!=null&&g.sv[S2.s]&&g.sv[S2.s].pid===V.id){const s=S2.s,x=g.sv[s],D=dwSv(s),here=x.loc;
    if(S2.die!=null){
      if(dv>=D.atk||true){if(dwZ(g,here)>0)out.push(dwBtn({a:'attack',s,die:S2.die,target:'z'},`⚔️ Kill a zombie`,{dis:dv<D.atk}));
        dwSurvAt(g,here).filter(o=>g.sv[o].pid!==V.id).forEach(o=>out.push(dwBtn({a:'attack',s,die:S2.die,target:o},`⚔️ Attack ${esc(dwSv(o).n)}`,{dis:dv<D.atk})))}
      if(here!=='colony')out.push(dwBtn({a:'search',s,die:S2.die},`🔍 Search ${esc(DWLN[here])}`,{dis:dv<D.sr}));
      out.push(dwBtn({a:'barricade',s,die:S2.die},'🧱 Barricade'));
      Object.keys(g.loc||{}).filter(l=>l!==here&&dwZ(g,l)>0).forEach(l=>out.push(dwBtn({a:'attract',s,die:S2.die,from:l},`📣 Attract 2 from ${esc(DWLN[l])}`)));
      if(D.die)out.push(dwBtn({a:'ability',s,die:S2.die},`✨ ${esc(D.ab)}`,{dis:dv<D.die}))}
    else if(D.opr&&!D.die)out.push(dwBtn({a:'ability',s},`✨ ${esc(D.ab)}`));
    if(!(P.moved||[]).includes(s))DWLOC.map(L=>L.id).concat(['colony']).filter(l=>l!==here).forEach(l=>{out.push(dwBtn({a:'move',s,to:l},`🚶 Move to ${esc(DWLN[l])}`));const f=(P.hand||[]).find(c=>(dwCard(c)||{}).k==='fuel');if(f!=null)out.push(dwBtn({a:'move',s,to:l,fuel:f},`⛽ Move to ${esc(DWLN[l])}, no exposure`))});
    (x.eq||[]).forEach(c=>{out.push(dwBtn({a:'crisis',eq:{s,c}},`⚠️ Add ${esc((dwCard(c)||{}).n)} to the crisis`));dwSurvAt(g,here).filter(o=>o!==s&&g.sv[o].pid===V.id).forEach(o=>out.push(dwBtn({a:'handoff',s,c,to:o},`🤝 Hand ${esc((dwCard(c)||{}).n)} to ${esc(dwSv(o).n)}`)))})}
  if(S2.c!=null&&(P.hand||[]).includes(S2.c)){const C=dwCard(S2.c);
    if(C.use==='equip')[P.lead,...(P.follow||[])].filter(x=>x!=null&&g.sv[x]).forEach(s=>out.push(dwBtn({a:'play',c:S2.c,s},`🎒 Equip to ${esc(dwSv(s).n)}`)));
    else out.push(dwBtn({a:'play',c:S2.c},`▶️ Play ${esc(C.n)}`));
    out.push(dwBtn({a:'crisis',c:S2.c},`⚠️ Add to the crisis (face down)`));
    out.push(dwBtn({a:'objcard',c:S2.c},`🎯 Put under the main objective`))}
  if(S2.die!=null&&S2.s==null){out.push(dwBtn({a:'clean',die:S2.die},'🗑️ Clean waste'));for(let n=1;n<=Math.min(g.food||0,6-dv);n++)out.push(dwBtn({a:'food',die:S2.die,n},`🥫 Spend ${n} food: ${dv}→${dv+n}`))}
  return out}
function dwPlayUI(){const g=dwGg(),P=act();
  let out=`<div class="bar"><button class="back" data-a="go" data-s="players" aria-label="Back to players">‹</button><h1 aria-label="Dead of Winter">${g&&g.phase==='done'?'🏁':'🧟'}</h1><button class="btn sm undo rulesbtn" data-a="rules" aria-label="Quick guide">Rules</button></div>`;
  if(!g||(typeof dwStale==='function'&&dwStale(g)))return out+`<div class="panel" style="padding:16px">${waitLoader(dwRes2()?'Digging out the colony…':'Waiting for the host phone…')}</div>`;
  const V=dwViewer(),hide=!!dwNeedHandoff(),aid=dwAct(g),ap=P.find(p=>p.id===aid);
  out+=`<div class="tabs hftabs nxtabs" role="list">${P.map(q=>{const Q=(g.P||{})[q.id]||{},n=[Q.lead,...(Q.follow||[])].filter(x=>x!=null&&g.sv[x]).length;return `<div class="tab" role="listitem" style="${pc(q.color)}"><div class="tn">${botHead(q)}${esc(nm(q))}${g.turn===q.id&&g.phase==='play'?' ▶':''}${g.fp===q.id?' ①':''}</div><div class="ts num">${g.phase==='done'&&g.fin&&g.fin[q.id]?(g.fin[q.id].win?'🏆':'✗'):n+'👤'}</div><div class="tr">${Q.exiled?'🚪 exiled · ':''}🃏${(Q.hand||[]).length} · 🎲${(Q.dice||[]).length}</div></div>`}).join('')}</div>`;
  out+=`<div class="hfmin htstat"><span>${g.phase==='done'?'<b>Game over.</b>':ap?`${botHead(ap)}<b>${esc(nm(ap))}</b> · ${g.vote?'voting':g.ask?esc(String(g.ask.msg||'').toLowerCase()):'taking a turn'}`:''}</span><span class="rlab">${g.phase==='done'?'':'Round '+(g.rndNo||1)}</span></div>`;
  out+=dwColony(g)+dwLocs(g);
  if(g.phase==='done')out+=dwEndUI(g);
  else if(hide){const h=dwNeedHandoff();out+=`<div class="sheet-bg yzpassbg"><div class="sheet yzpass" role="dialog" aria-modal="true" aria-labelledby="dwh-h" style="${pc(h.color)}"><svg class="yzpm" viewBox="0 0 40 40" aria-hidden="true"><path d="${MGSHAPE_M}"/></svg><span class="rlab">Pass the phone to</span><h2 id="dwh-h">${esc(nm(h))}</h2><p class="rlab">${g.vote?'Time to vote, in secret.':g.ask&&g.ask.pid===h.id&&g.turn!==h.id?'A question for you.':'It’s your turn.'} Everyone else, look away.</p><button class="btn primary wide" data-a="dwshow" data-k="${h.id}">I’m ${esc(nm(h))}, show my cards</button></div></div>`}
  else if(V)out+=dwMe(g,V)+dwDock(g,V);
  out+=dwLogBox(g);
  return out}
function dwLogBox(g){const L=(g.lg||[]).slice(-8).reverse();return L.length?`<div class="sec"><div class="sec-h"><h3>What happened</h3></div><ul class="dwlog">${L.map(e=>`<li>${esc(e.ic||'')} ${esc(e.t)}</li>`).join('')}</ul></div>`:''}
function dwMe(g,V){return `<div class="sec"><div class="sec-h"><h3>Your group</h3></div>${dwObjBox(g,V)}${dwXrBox(g,V)}${dwMySurvs(g,V)}${dwDice(g,V.id)}<div class="dwhand">${dwHandCards(g,V)}</div></div>`}
function dwDock(g,V){const box=(h,b)=>`<div class="sadock cpdock dwdock" style="${pc(V.color)}"><div class="sadh"><span><b>${S.lk||dwHumans().length<2?'You':esc(nm(V))}</b> · ${h}</span></div>${b}</div>`;
  const me='';
  const VO=g.vote;
  if(VO&&(VO.need||[]).includes(V.id)&&!(VO.got&&V.id in VO.got))return box(esc(VO.msg||'Vote'),`<p class="rlab">Your vote is secret until everyone has voted.</p><div class="wzopts">${dwBtn({vote:true},'👍 Yes',{cls:'btn primary'})}${dwBtn({vote:false},'👎 No',{cls:'btn'})}</div>`)+me;
  if(VO)return box('Voting',`<p class="rlab">${esc(VO.msg||'')} · ${Object.keys(VO.got||{}).length} of ${(VO.need||[]).length} voted.</p>`)+me;
  const A=g.ask;
  if(A&&A.pid===V.id)return box(esc(A.msg),`<div class="wzopts">${(A.opts||[]).map(o=>dwBtn({v:o.v},esc(o.l),{cls:'btn'})).join('')}${A.opt?dwBtn({skip:1},'Skip',{cls:'btn'}):''}</div>`)+me;
  if(A)return box('Waiting',`<p class="rlab">${esc(dwPName(A.pid))}: ${esc(A.msg)}</p>`)+me;
  if(g.turn!==V.id||(g.q||[]).length)return box('Waiting',`<p class="rlab">${esc(dwPName(g.turn))} is taking a turn.</p>`)+me;
  const acts=dwActions(g,V),others=act().filter(p=>p.id!==V.id&&!((g.P[p.id]||{}).exiled));
  return box('your turn',`<p class="rlab">${DWSEL?'':'Tap a survivor, a die or a card to see what you can do.'}</p><div class="wzopts">${acts.join('')}</div>
    <div class="wzopts">${DWSEL?dwSelB('none','Clear',{}):''}${dwBtn({a:'request'},'🙏 Ask for a card')}${!g.P[V.id].voted&&DWX().mode!=='coop'?others.map(p=>dwBtn({a:'exile',target:p.id},`🚪 Vote to exile ${esc(nm(p))}`)).join(''):''}${dwBtn({a:'end'},'✋ End turn',{cls:'btn primary'})}</div>`)+me}
function dwEndUI(g){const P=act();return `<div class="sec"><div class="sec-h"><h3>Game over</h3></div><p class="rlab">${esc(g.endWhy||'')}</p><div class="panel">${P.map(q=>{const F=(g.fin||{})[q.id]||{},Q=(g.P||{})[q.id]||{};return `<div class="prow" style="${pc(q.color)}"><span class="rtext"><b>${F.win?'🏆 ':''}${esc(nm(q))}</b><br><small class="rlab">${esc(F.obj||(dwObjP(g,q.id)||{}).n||'')}${F.betrayer||Q.betray?' · 🗡️ betrayer':''}${F.exiled||Q.exiled?' · 🚪 exiled':''}${F.why?' · '+esc(F.why):''}</small></span><b>${F.win?'Won':'Lost'}</b></div>`}).join('')}</div>
  <div class="actions"><div class="in">${dwRes2()?`<button class="btn primary" data-a="finish">Finish &amp; reveal</button>`:`<span class="rlab">Waiting for the host…</span>`}</div></div></div>`}
function dwSyncScorer(g){if(!g||!g.fin)return;S.dwrec={mo:g.mo&&g.mo.id,side:g.mo&&g.mo.side,end:g.mo&&g.mo.done?'done':g.morale<=0?'morale':'rounds'};act().forEach(p=>{const F=g.fin[p.id]||{},Q=(g.P||{})[p.id]||{};p.dw={win:F.win?1:0,betray:(F.betrayer||Q.betray)?1:0,exiled:(F.exiled||Q.exiled)?1:0,obj:F.obj||(dwObjP(g,p.id)||{}).n||''}});S.hr=1}
function dwSurvSheet(id){const D=dwSv(id);if(!D)return '';const g=dwGg(),x=g&&g.sv&&g.sv[id];
  return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1"><div class="rs-top"><div><h2 id="lp-h">${esc(D.n)}</h2><small class="lp-sub">${esc(D.job)} · influence ${D.inf}</small></div><button class="btn sm" data-a="lpclose">Close</button></div>
  <div class="rs-body"><p class="rlab">Attack ${D.atk}+ · search ${D.sr}+</p><p><b>${esc((D.at||'any')==='any'?'Anywhere':D.at==='noncolony'?'Away from the colony':DWLN[D.at]||D.at)}${D.die?` (${D.die}+ die)`:''}${D.opr?' · once per round':''}:</b> ${esc(D.ab)}</p>${x?`<p class="rlab">${esc(DWLN[x.loc]||'')} · ${x.w||0} wound${x.w===1?'':'s'}${x.fb?` (${x.fb} frostbite)`:''}${(x.eq||[]).length?' · equipped: '+x.eq.map(c=>esc((dwCard(c)||{}).n)).join(', '):''}</p>`:''}<p class="hint">The exact wording is on the card.</p></div></div></div>`}
function dwItemSheet(c){const C=dwCard(c);if(!C)return '';return `<div class="sheet-bg" data-a="lpclose"><div class="sheet lpsheet" role="dialog" aria-modal="true" aria-labelledby="lp-h" data-stop="1"><div class="rs-top"><div><h2 id="lp-h">${DWSYM[C.sym]||''} ${esc(C.n)}</h2><small class="lp-sub">${esc(DWSYMN[C.sym]||'')} · ${C.use==='equip'?'equip':C.use==='event'?'event':'play to the waste pile'} · ${C.d==='starter'?'starter item':esc(DWLN[C.d]||C.d)}</small></div><button class="btn sm" data-a="lpclose">Close</button></div><div class="rs-body"><p>${esc(C.say)}</p><p class="hint">The exact wording is on the card.</p></div></div></div>`}
function dwUiAct(a,b,k){const g=dwGg();if(!g)return;if(a==='dwshow'){DWVIEW=k;DWSEL=null;return}const V=dwViewer();if(!V)return;
  if(a==='dwsel'){if(k==='none'){DWSEL=null;return}const [t,v]=String(k).split(':');DWSEL=DWSEL||{};
    if(t==='die')DWSEL.die=DWSEL.die===+v?null:+v;else if(t==='surv')DWSEL.s=DWSEL.s===+v?null:+v;else if(t==='card'){DWSEL.c=DWSEL.c===+v?null:+v}
    if(DWSEL.die==null&&DWSEL.s==null&&DWSEL.c==null)DWSEL=null;vibe(6);return}
  if(a==='dwans'){let mv;try{mv=JSON.parse(decodeURIComponent(k))}catch(e){return}if(mv.a)DWSEL=null;lkq('dwMove',V.id,mv)&&vibe(8);return}}
function dwTick(){if(!dwPlayOn()||!S.started||S.finished||S.demo||S.screen!=='score')return;if(!dwRes2())return;if(lkqRun()){save();render();return}
  if(typeof dwDeal!=='function')return;
  const g=dwGg();if(!g||(typeof dwStale==='function'&&dwStale(g))){const X=DWX();S.dwg=dwDeal({mo:X.mo||null,side:X.side,mode:X.mode})||S.dwg;save();render();return}if(g.phase==='done'||DWBOTT)return;
  if(gAnnBusy(g)){const ms=(g.ann.ms||GLMS)*(window.__htfast?.3:1)-(Date.now()-g.ann.at);DWBOTT=setTimeout(()=>{DWBOTT=null;render()},Math.max(60,ms+40));return}
  const a=dwAct(g),q=act().find(p=>p.bot&&p.id===a);if(!q)return;
  DWBOTT=setTimeout(()=>{DWBOTT=null;DWBOTAT=Date.now();const g2=dwGg();if(g2&&g2.phase!=='done'&&dwAct(g2)===q.id){try{dwBotStep(g2,q)}catch(e){console.error('Dead of Winter bot',e)}save()}render()},500*htSpd());DWBOTAT=Date.now()}
setInterval(()=>{try{if(!dwPlayOn()||!S.started||S.finished||document.hidden)return;const g=dwGg();if(!g||g.phase==='done'||!dwRes2())return;const a=dwAct(g),q=act().find(p=>p.bot&&p.id===a);if(!q)return;if(Date.now()-DWBOTAT<4000)return;if(DWBOTT){clearTimeout(DWBOTT);DWBOTT=null}DWBOTAT=Date.now();render()}catch(e){}},1500);
