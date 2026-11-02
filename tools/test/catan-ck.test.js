// Catan on the phone, Cities & Knights (and with Seafarers islands): setup with a city, commodities, the event die,
// progress cards, improvements and metropolises, knights, the barbarians, walls, the robber's late arrival, and games through the screen.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();let P=await mk(browser,'ck');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const R=await P.evaluate(()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const fresh=(n=3,sea)=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1,mode:'ck',ckSea:sea?1:0,sfs:sea||'1',goalSF:sea?CPSF[sea].goal:0});S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=null});S.started=true;cpDeal();const g=S.cpg;return {g,B:cpB(g),M:p=>g.me[p]}};
    const setup=x=>{const g=x.g;while(g.phase==='setup'){const q=act().find(p=>p.id===cpActor(g));q.bot='normal';cpBotStep(g,q);q.bot=null;if(g.ask&&g.ask.k==='gold')for(const id in g.ask.need){const r=CPR.find(r=>g.bank[r]>=g.ask.need[id]);cpGold(g,id,{[r]:g.ask.need[id]})}}return x};
    const turn=(g,p)=>{g.turn=p;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0}};
    t('Set-up: a settlement, then a city that gives 1 card per hex; no development cards; robber off the board; goal 13',()=>{const x=setup(fresh()),g=x.g;const ok1=g.ps.every(p=>Object.values(g.b).filter(b=>b[0]===p&&b[1]).length===1&&Object.values(g.b).filter(b=>b[0]===p&&!b[1]).length===1);
      const cards=g.ps.every(p=>CPC.every(c=>g.me[p].r[c]===0));return {ok:ok1&&cards&&!g.deck.length&&g.rob==null&&g.goal===13&&g.bank.pa===12,ok1,cards}});
    t('Cities make commodities: forest 1 wood + 1 paper, pasture wool + cloth, mountains ore + coin, hills 2 brick',()=>{const x=setup(fresh()),g=x.g,B=x.B,p=g.ps[0],M=x.M(p);const bad=[];
      [['f',{w:1,pa:1}],['p',{s:1,cl:1}],['m',{o:1,co:1}],['h',{b:2}],['l',{g:2}]].forEach(([ty,want])=>{const hi=g.hx.findIndex(h=>h[2]===ty&&h[3]&&h[3]!==7);if(hi<0)return;const v=B.hv[hi].find(v=>!g.b[v])??B.hv[hi][0];const keep={...g.b};g.b={};g.b[v]=[p,1];const before={...M.r};g.hx.forEach((h,j)=>{if(j!==hi&&h[3]===g.hx[hi][3])h.__n=h[3],h[3]=0});
        cpProduce(g,g.hx[hi][3]);g.hx.forEach(h=>{if(h.__n){h[3]=h.__n;delete h.__n}});Object.entries(want).forEach(([k,n])=>{if(M.r[k]-before[k]!==n)bad.push(ty+k)});g.b=keep});return {ok:!bad.length,bad}});
    t('Event die: a ship moves the barbarians; a color gives cards to level ≥ red − 1',()=>{const x=setup(fresh()),g=x.g,[p,q]=g.ps;turn(g,p);g.t.rolled=0;cpRoll(g,p,[1,2],'ship');const ship=g.bar===1;
      g.me[p].imp.sc=1;g.me[q].imp.sc=0;turn(g,p);g.t.rolled=0;const n0=g.me[p].prog.length+g.me[p].vpc;cpRoll(g,p,[1,2],'sc');const drew=g.me[p].prog.length+g.me[p].vpc===n0+1&&!g.me[q].prog.length;
      turn(g,p);g.t.rolled=0;cpRoll(g,p,[1,3],'sc');const none=g.me[p].prog.length+g.me[p].vpc===n0+1;return {ok:ship&&drew&&none,ship,drew,none}});
    t('Improvements: level N costs N commodities; level 4 takes a metropolis, level 5 keeps it for good',()=>{const x=setup(fresh()),g=x.g,[p,q]=g.ps,M=x.M(p);turn(g,p);M.r.pa=15;const pts=cpVP(g,p);let ok1=true;for(let l=1;l<=4;l++)ok1=ok1&&ckImp(g,p,'sc');
      const met=g.met.sc&&g.met.sc.p===p&&!g.met.sc.perm&&cpVP(g,p)===pts+2&&M.r.pa===5;const Q=x.M(q);turn(g,q);Q.imp.sc=4;Q.r.pa=5;const ok5=ckImp(g,q,'sc')&&g.met.sc.p===q&&g.met.sc.perm;return {ok:ok1&&met&&ok5,ok1,met,ok5}});
    t('Knights: recruit 🐑🪨 on your road, activate 🌾 (can’t act that turn), promote; strong → mighty needs politics 3',()=>{const x=setup(fresh()),g=x.g,p=g.ps[0],M=x.M(p);turn(g,p);Object.assign(M.r,{s:5,o:5,g:3});const v=ckRecruitSpots(g,p)[0];
      const rec=ckRecruit(g,p,v)&&g.kn[v].lv===1&&!g.kn[v].a;const act=ckActivate(g,p,v)&&g.kn[v].a&&!ckCanAct(g,p,v);const pro=ckPromote(g,p,v)&&g.kn[v].lv===2&&!ckPromote(g,p,v);turn(g,p);const noMighty=!!ckPromoteWhy(g,p,v);M.imp.po=3;const mighty=ckPromote(g,p,v)&&g.kn[v].lv===3;
      return {ok:rec&&act&&pro&&noMighty&&mighty,rec,act,pro,noMighty,mighty}});
    t('Barbarians: cities > active knights pillages the weakest; then all knights rest and the robber arrives',()=>{const x=setup(fresh()),g=x.g,[p,q,r]=g.ps;const v=ckRecruitSpots(g,p)[0];g.kn[v]={p,lv:2,a:1};g.bar=CKBAR-1;turn(g,q);g.t.rolled=0;cpRoll(g,q,[1,2],'ship');
      while(g.ask&&g.ask.k==='pill'){const id=Object.keys(g.ask.need)[0];ckPillage(g,id,ckPill(g,id)[0])}const lost=[q,r].every(z=>!ckCities(g,z).length)&&ckCities(g,p).length===1;return {ok:lost&&g.bar===0&&!g.kn[v].a&&g.rob!=null&&g.att===1,lost,rob:g.rob}});
    t('Barbarians beaten: the single strongest is Defender of Catan (+1)',()=>{const x=setup(fresh()),g=x.g,[p,q]=g.ps;const vs=ckRecruitSpots(g,p);g.kn[vs[0]]={p,lv:3,a:1};g.kn[ckRecruitSpots(g,q)[0]]={p:q,lv:1,a:1};const pts=cpVP(g,p);ckAttack(g);return {ok:g.me[p].def===1&&cpVP(g,p)===pts+1}});
    t('A 7: the hand limit grows by 2 per wall; no robber before the first attack',()=>{const x=setup(fresh()),g=x.g,[p,q]=g.ps;turn(g,q);g.me[q].r.b=2;const c=ckCities(g,q)[0];ckWall(g,q,c);Object.assign(g.me[q].r,{w:9,b:0,s:0,g:0,o:0});Object.assign(g.me[p].r,{w:9,b:0,s:0,g:0,o:0});
      turn(g,p);g.t.rolled=0;cpRoll(g,p,[3,4],'sc');const need=g.ask&&g.ask.k==='disc'&&g.ask.need[p]===4&&!g.ask.need[q];cpDiscard(g,p,{w:4});return {ok:need&&!g.ask,ask:g.ask}});
    t('Progress cards: Irrigation, Resource Monopoly, Merchant (+1 and 2:1), Wedding and Constitution',()=>{const x=setup(fresh()),g=x.g,B=x.B,[p,q,r]=g.ps,M=x.M(p);turn(g,p);
      M.prog=['rm','me','we'];x.M(q).r.s=3;x.M(r).r.s=1;const rm=ckPlay(g,p,'rm','s')&&x.M(q).r.s===1&&x.M(r).r.s===0;const hi=g.hx.findIndex((h,i)=>cpLand(g,i)&&h[2]!=='d'&&B.hv[i].some(v=>g.b[v]&&g.b[v][0]===p));const pts=cpVP(g,p);
      const me=ckPlay(g,p,'me',hi)&&cpVP(g,p)===pts+1&&cpRate(g,p,CPHEX[g.hx[hi][2]][1])===2;g.me[q].vpc=5;x.M(q).r.w=4;const we=ckPlay(g,p,'we')&&g.ask&&g.ask.k==='disc'&&g.ask.to===p&&g.ask.need[q]===2;const w0=M.r.w;cpDiscard(g,q,{w:2});
      return {ok:rm&&me&&we&&M.r.w===w0+2&&!M.prog.length,rm,me,we}});
    t('Knight actions: move along your road, displace a weaker knight, chase the robber',()=>{const x=setup(fresh()),g=x.g,B=x.B,[p,q]=g.ps;turn(g,p);for(let i=0;i<4;i++){const e=cpESpots(g,p)[0];if(e!=null)g.rd[e]=p}const sp=ckRecruitSpots(g,p);g.kn[sp[0]]={p,lv:2,a:1};
      const to=ckReach(g,p,sp[0]).empty[0];const mv=ckMove(g,p,sp[0],to)&&g.kn[to]&&!g.kn[to].a;g.kn[to].a=1;const o=ckReach(g,p,to).empty.find(v=>v!==sp[0]);let disp=true;if(o!=null){g.kn[o]={p:q,lv:1,a:1};disp=ckDisplace(g,p,to,o)&&g.kn[o].p===p}
      g.att=1;const v2=Object.keys(g.kn).find(v=>g.kn[v].p===p);g.kn[v2].a=1;g.rob=B.V[v2].h.find(h=>cpLand(g,h));const ch=ckChase(g,p,v2)&&g.ask&&g.ask.k==='rob';return {ok:mv&&disp&&ch,mv,disp,ch}});
    t('More than 4 progress cards: others discard at once; you before ending your turn',()=>{const x=setup(fresh()),g=x.g,[p,q]=g.ps;turn(g,p);g.me[q].prog=['ir','mi','cr','rb','sm'];ckHand(g);const a=g.ask&&g.ask.k==='pdisc'&&g.ask.need[q]===1;ckPDisc(g,q,['sm']);
      g.me[p].prog=['ir','mi','cr','rb','sm','ec'];cpEnd(g,p);const b=g.ask&&g.ask.need[p]===2;ckPDisc(g,p,['sm','ec']);return {ok:a&&b&&g.turn!==p&&g.me[q].prog.length===4,a,b}});
    t('Bots finish C&K games, with and without Seafarers islands',()=>{const bad=[];for(const sea of [0,'1','2','9']){const {g}=fresh(3,sea);act().forEach(p=>p.bot='normal');let i=0;while(g.phase!=='done'&&i++<30000){const q=act().find(p=>p.id===cpActor(g))||act()[0];cpBotStep(g,q)}if(g.phase!=='done')bad.push(sea);if(sea&&!g.sea)bad.push('no sea '+sea)}return {ok:!bad.length,bad}});
    t('C&K + Seafarers: goal is the scenario’s + 2; ships; the pirate waits for the first attack',()=>{const x=fresh(3,'1'),g=x.g;return {ok:g.ck&&g.sea&&g.goal===16&&g.pir==null&&g.pirHome!=null}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));

  // setup screen and a game through the screen
  await P.close();P=await mk(browser,'ck2');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;S.screen='home';render()});await W(300);
  await P.evaluate(()=>document.querySelector('[data-a="cpstart"][data-k="1"]').click());await W(300);
  ok('Setup: Cities & Knights can be picked in play mode',await P.evaluate(()=>{const b=document.querySelector('[data-a="ctmode"][data-v="ck"]');if(!b||b.disabled)return false;b.click();return true}));await W(300);
  ok('Setup: the Seafarers islands switch shows 5 maps',await P.evaluate(()=>{const s=document.querySelector('[data-a="cttg"][data-k="ckSea"]');if(!s)return false;s.click();return true})&&(await W(300),await P.evaluate(()=>document.querySelectorAll('[data-a="cpsfs"]').length===5)));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Bo'][i];p.bot=i?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(600);
  ok('Game: C&K on Seafarers islands with the barbarian track',await P.evaluate(()=>S.cpg&&S.cpg.ck&&S.cpg.sea&&!!document.querySelector('.ckstrip')));
  const me=await P.evaluate(()=>act()[0].id);
  const tap=sel=>P.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true');if(b){b.click();return true}return false},sel);
  const svgTap=sel=>P.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;L[Math.floor(Math.random()*L.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
  let used={imp:0,rec:0,act:0,lp:0},moves=0;
  for(let i=0;i<9000;i++){if(i%300===0&&process.env.DBG)console.log('… step',i,await P.evaluate(()=>S.cpg&&JSON.stringify({tno:S.cpg.tno,a:cpActor(S.cpg),ask:S.cpg.ask,t:S.cpg.t,msg:S.cpg.msg,CKM,CPMODE,dock:(document.querySelector('.cpdock')||{}).innerText})));const st=await P.evaluate(me=>{const g=S.cpg;if(!g)return null;const Q=g.ask;return {a:cpActor(g),ph:g.phase,su:g.su&&g.su.step,ask:Q&&Q.k,mine:Q&&(Q.need?!!Q.need[me]:Q.p===me),rolled:g.t&&g.t.rolled,road:g.t&&g.t.road,done:g.phase==='done'}},me);if(!st)continue;if(st.done)break;
    if(st.ask&&st.mine&&!['rob','steal','offer'].includes(st.ask)){await P.evaluate(me=>{const q=act().find(p=>p.id===me);q.bot='normal';cpBotStep(S.cpg,q);q.bot=null;save();render()},me);continue}
    if(st.a!==me){await W(50);continue}moves++;
    if(st.ph==='setup'){await svgTap(st.su==='s'?'.cpvgo':'.cpego')}
    else if(st.ask==='rob')await svgTap('.cphit.go');
    else if(st.ask==='steal')await tap('[data-a="cppsteal"]');
    else if(st.ask==='offer'){if(!await tap('[data-a="cppans"][data-k="0"]'))await tap('[data-a="cppdeal"][data-k=""]')}
    else if(!st.rolled)await tap('[data-a="cpproll"]');
    else if(st.road){if(!await svgTap('.cpego'))await tap('[data-a="cppstoproad"]')}
    else{if(!used.lp){used.lp=await P.evaluate(()=>{LPTIP='ckb:kn';render();const ok=!!document.querySelector('.lpsheet .cpcc');LPTIP=null;render();return ok})}
      let did=false;
      if(used.rec+used.act<2||i%3===0)did=false;else if(await tap('[data-a="ckmode"][data-k="imp"]')){await W(30);if(await tap('[data-a="ckimp"]')){used.imp++;did=true}await tap('[data-a="ckmode"][data-k=""]')}
      if(!did&&await tap('[data-a="ckmode"][data-k="kn"]')){await W(30);if(await tap('[data-a="ckmode"][data-k="rec"]')){await W(30);if(await svgTap('.ckgo')){used.rec++;did=true}}else{await svgTap('.ckgo');await W(30);if(await tap('[data-a="ckact"]')){used.act++;did=true}}await tap('[data-a="ckmode"][data-k=""]')}
      if(!did&&await tap('[data-a="ckmode"][data-k="imp"]')){await W(30);if(await tap('[data-a="ckimp"]')){used.imp++;did=true}await tap('[data-a="ckmode"][data-k=""]')}
      if(!did)for(const k of ['city','settle','road','ship']){if(await tap(`[data-a="cppmode"][data-k="${k}"]`)){await W(30);did=await svgTap(k==='road'||k==='ship'?'.cpego':'.cpvgo, .cpbld.go');await tap('[data-a="cppmode"][data-k=""]');if(did)break}}
      if(!did&&await tap('[data-a="ckplay"]')){await W(30);await tap('[data-a="ckpgo"]');await svgTap('.ckgo');await tap('[data-a="ckmode"][data-k=""]')}
      if(!did){await tap('[data-a="cppend"]');await tap('[data-a="cppend"]')}}
    await W(30)}
  ok('Long press on Knights shows its cost',!!used.lp);
  ok('A C&K + Seafarers game through the screen reaches the end',await P.evaluate(()=>S.cpg&&S.cpg.phase==='done'),{moves,used,st:await P.evaluate(()=>S.cpg&&{tno:S.cpg.tno,msg:S.cpg.msg,ask:S.cpg.ask})});
  {const c=async sel=>{const r=await P.evaluate(s=>{const b=document.querySelector(s);if(!b||b.getAttribute('aria-disabled')==='true')return false;b.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);await W(200);return r};
    await P.evaluate(()=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1,mode:'ck'});S.players.forEach((p,i)=>{p.on=i<3;p.name='P'+i;p.bot=i?'normal':null});S.started=true;cpDeal();const g=S.cpg;while(g.phase==='setup'){const q=act().find(p=>p.id===cpActor(g));const was=q.bot;q.bot='normal';cpBotStep(g,q);q.bot=was}
      const me=act()[0].id;g.turn=me;g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};g.dice=[2,3];Object.assign(g.me[me].r,{s:3,o:3,g:3,b:2,pa:3});S.screen='score';render()});await W(600);
    const rec=await c('[data-a="ckmode"][data-k="kn"]')&&await c('[data-a="ckmode"][data-k="rec"]')&&await c('.ckgo')&&await P.evaluate(()=>Object.keys(S.cpg.kn).length===1);
    const act2=await c('[data-a="ckact"]')&&await P.evaluate(()=>Object.values(S.cpg.kn)[0].a===1);
    const pro=await c('[data-a="ckpro"]')&&await P.evaluate(()=>Object.values(S.cpg.kn)[0].lv===2);
    await c('[data-a="ckmode"][data-k=""]');const imp=await c('[data-a="ckmode"][data-k="imp"]')&&await c('[data-a="ckimp"][data-k="sc"]')&&await P.evaluate(()=>S.cpg.me[act()[0].id].imp.sc===1);
    await c('[data-a="ckmode"][data-k=""]');const wall=await c('[data-a="ckmode"][data-k="wall"]')&&await c('.ckgo')&&await P.evaluate(()=>Object.keys(S.cpg.wall).length===1);
    ok('From the screen: recruit, activate, promote, an improvement and a wall',rec&&act2&&pro&&imp&&wall,{rec,act2,pro,imp,wall,used})}
  ok('…and the score sheet matches the board',await P.evaluate(()=>act().every(p=>total(p)===cpVP(S.cpg,p.id))),await P.evaluate(()=>act().map(p=>[total(p),cpVP(S.cpg,p.id)])));
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
