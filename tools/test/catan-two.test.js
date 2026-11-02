// Catan on the phone: Catan for Two (neutral players, two rolls, trade tokens) in the base game and every T&B scenario.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();let P=await mk(browser,'two');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const R=await P.evaluate(()=>{const out=[];const T=(c,m)=>out.push([m,!!c,'']);
    const mk=tbs=>{S=ctFresh();S.ctx=Object.assign({...CTDEF},{play:1,mode:tbs?'tb':'base',tbs:tbs||'none'});S.players.forEach((p,i)=>{p.on=i<2;p.name=['Ann','Bob'][i];p.bot=null;p.color=['red','blue'][i]});S.started=true;cpDeal();return S.cpg};
    const toTurn=g=>{let k=0;while(g.phase==='setup'&&k++<100){const q=act().find(p=>p.id===cpActor(g));q.bot='hard';cpBotStep(g,q);q.bot=null}return g};
    try{

const mk=tbs=>{S={game:'catan',ctx:{play:1,goal:10,mode:tbs?'tb':'base',tbs:tbs||''},players:[{id:'a',name:'A',on:true,bot:'hard',color:'red'},{id:'b',name:'B',on:true,bot:'hard',color:'blue'}]};cpDeal();return S.cpg};
const toTurn=g=>{let k=0;while(g.phase==='setup'&&k++<100)cpBotStep(g,act().find(p=>p.id===cpActor(g)));return g};
let g=toTurn(mk(''));const p=g.turn,o=cpOpp(g,p);
T(g.two&&g.neu.n1==='white'&&g.neu.n2==='green','neutral colors white and green');
T(g.ps.reduce((a,q)=>a+g.tok[q],0)+g.tokS===20,'20 tokens');
// forced trade with opponent holding 1 card
CPR.forEach(r=>{g.bank[r]+=g.me[o].r[r];g.me[o].r[r]=0});g.bank.w--;g.me[o].r.w=1;g.me[p].r.b+=2;g.bank.b-=2;const t0=g.tok[p],before=cpSum(g.me[p].r);
T(cpTok(g,p,'ft'),'forced trade allowed before rolling');T(g.me[o].r.w===0&&g.ask&&g.ask.k==='disc'&&g.ask.need[p]===2&&g.ask.to===o,'took the 1 card, must give 2');
T(cpDiscard(g,p,{b:2})&&g.me[o].r.b===2&&!g.ask,'gave 2 cards to the opponent');T(g.tok[p]===t0-cpTokCost(g,p)||g.tok[p]===t0-1,'paid a token');
T(!cpTok(g,p,'rob'),'only one token action a turn');
// cost when ahead
g.t.tk=0;const fakeV=cpVis;g.b[Object.keys(g.b).find(v=>g.b[v][0]===p)][1]=1;T(cpTokCost(g,p)===2&&cpTokCost(g,o)===1,'2 tokens when ahead');
// second roll differs
let diff=true;for(let i=0;i<200;i++){g.t={rolled:0,dev:0,road:0,newSh:[],mvd:0};g.ask=null;cpRoll(g,p);g.ask=null;g.askq=[];if(g.t.rolled){diff=false;break}const r1=g.t.r1;cpRoll(g,p);g.ask=null;g.askq=[];if(!g.t.rolled||g.t.r2===r1){diff=false;break}}T(diff,'two rolls a turn, never the same number');
// neutral road after a road
g.t={rolled:1,dev:0,road:0,newSh:[],mvd:0};g.ask=null;CPR.forEach(r=>{g.me[p].r[r]+=3;g.bank[r]-=3});const e=cpESpots(g,p)[0];T(cpBuildRoad(g,p,e)&&g.ask&&g.ask.k==='neu','a road asks for a neutral road');
const ne=cpNeuSpots(g,'road').e[0];T(cpNeuPlace(g,p,ne)&&CPNEU.includes(g.rd[ne])&&!g.ask,'neutral road placed');
T(!cpNeuPlace(g,p,ne),'no second neutral piece');
// neutral never produces
const nv=Object.keys(g.b).find(v=>cpNeu(g,g.b[v][0])),hh=cpB(g).V[nv].h.find(h=>g.hx[h][3]&&h!==g.rob);const n0=JSON.stringify(g.me.n1.r)+JSON.stringify(g.me.n2.r);cpProduce(g,g.hx[hh][3]);T(JSON.stringify(g.me.n1.r)+JSON.stringify(g.me.n2.r)===n0,'neutral settlements never produce');
// knight turn-in
g.me[p].kn=3;g.la=p;g.me[o].kn=3;g.t.tk2=0;const tk=g.tok[p];T(cpTok(g,p,'kn')&&g.tok[p]===tk+2&&g.me[p].kn===2&&g.la!==p,'turning in a knight: +2 tokens, Largest Army lost');
// fish
g=toTurn(mk('fish'));T(!g.tok&&g.ps.every(q=>g.me[q].fish.slice().sort().join()==='1,1,2,2,3'),'fishing: no tokens, 5 fish each');
// rivers: robber to swamp
g=toTurn(mk('rivers'));g.rob=g.hx.findIndex(h=>h[2]==='m');T(cpTok(g,g.turn,'rob')&&g.hx[g.rob][2]==='x','rivers: robber goes to a swamp');
// caravans: off the board; two wagons
g=toTurn(mk('caravans'));g.rob=3;T(cpTok(g,g.turn,'rob')&&g.rob==null,'merchant trains: robber leaves the board');
{const P0=g.turn;g.ask={k:'vote',p:P0,ord:[P0,cpOpp(g,P0)],bids:{},i:0,cur:P0};g.me[P0].r.s+=1;g.bank.s--;cpBid(g,P0,{s:1,g:0});cpBid(g,cpOpp(g,P0),{s:0,g:0});T(g.ask.k==='wagon'&&g.ask.p===P0&&g.ask.n===2,'top bidder places 2 wagons');const e1=cpWagSpots(g)[0];cpPlaceWag(g,P0,e1);T(g.ask&&g.ask.k==='wagon','…then the second');const t1=g.wag[e1];T(cpWagSpots(g).every(e=>cpWagTr(g,e)!==t1),'…on a different train');cpPlaceWag(g,P0,cpWagSpots(g)[0]);T(!g.ask||g.ask.k!=='wagon','done after two')}
{g.phase='turn';const P0=g.turn;g.ask={k:'vote',p:P0,ord:[P0,cpOpp(g,P0)],bids:{},i:0,cur:P0};cpBid(g,P0,{});cpBid(g,cpOpp(g,P0),{});T(g.ask.p===P0&&g.ask.nx===cpOpp(g,P0),'tie: active player first');cpPlaceWag(g,P0,cpWagSpots(g)[0]);T(g.ask&&g.ask.k==='wagon'&&g.ask.p===cpOpp(g,P0),'…then the other player')}
// barbarian attack: barbarian move token
g=toTurn(mk('barb'));{const P0=g.turn,src=g.coast.find(h=>g.barb[h]>0),dst=g.coast.find(h=>h!==src&&!cpConq(g,h));const n1=g.barb[src],n2=g.barb[dst];T(cpTok(g,P0,'barb')&&g.ask.k==='batr'&&cpBaPick(g,P0,src,dst)&&g.barb[src]===n1-1&&g.barb[dst]===n2+1&&!g.ask,'barbarian attack: token moves a barbarian along the coast')}
// T&B: barbarian to an edge without a road
g=toTurn(mk('tb'));{const P0=g.turn;T(cpTok(g,P0,'tbb')&&g.ask.nr&&cpTbBarbSpots(g).every(e=>g.rd[e]==null),'T&B: token barbarian only to an edge with no road');const to=cpTbBarbSpots(g)[0];T(cpTbBarbMove(g,P0,g.tbb[0],to)&&g.tbb.includes(to),'…and it moves')}

    const at=(g,q,r)=>g.hx.findIndex(h=>h[0]===q&&h[1]===r);g=mk('');const nvs=Object.keys(g.b).map(Number).sort((a,b)=>cpB(g).V[a].y-cpB(g).V[b].y);T(nvs.length===2&&cpB(g).V[nvs[0]].h.includes(at(g,1,-1))&&cpB(g).V[nvs[1]].h.includes(at(g,-1,1)),'two neutral settlements start in the middle (top and bottom)');
    for(const tbs of ['','fish','rivers','caravans','barb','tb']){const g=mk(tbs);act().forEach(p=>p.bot='normal');let i=0;while(g.phase!=='done'&&i++<30000){const q=act().find(p=>p.id===cpActor(g));const n0=g.n;cpBotStep(g,q);if(g.n===n0)break}T(g.phase==='done'&&g.lg.some(x=>/for Neutral/.test(x.t||x)),`bots finish a 2-player game: ${tbs||'base'}`)}
    }catch(e){out.push(['error',false,e.message+' '+(e.stack||'').split('\n')[1]])}
    act().forEach(p=>p.bot=null);return out});
  R.forEach(([n,g,x])=>ok(n,g,x));
  await P.close();P=await mk(browser,'two2');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;S.screen='home';render()});await W(300);
  await P.evaluate(()=>document.querySelector('[data-a="cpstart"][data-k="1"]').click());await W(300);
  ok('Setup: play mode allows 2 players in the base game',await P.evaluate(()=>M().min===2));
  ok('Setup: Seafarers still needs 3',await P.evaluate(()=>{CTX().mode='sf';const m=M().min;CTX().mode='base';return m===3}));
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i];p.bot=i?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(600);
  ok('Game: Catan for Two with 2 neutral settlements on the board',await P.evaluate(()=>!!S.cpg&&S.cpg.two&&Object.values(S.cpg.b).filter(x=>cpNeu(S.cpg,x[0])).length===2&&document.querySelectorAll('.cpbld').length===2));
  const roll=await P.evaluate(async()=>{const g=S.cpg;while(g.phase==='setup'){const q=act().find(p=>p.id===cpActor(g));const was=q.bot;q.bot='normal';cpBotStep(g,q);q.bot=was}const me=act()[0].id;g.turn=me;g.t={rolled:0,dev:0,road:0,newSh:[],mvd:0};g.ask=null;g.askq=[];render();
    const r=()=>document.querySelector('[data-a="cpproll"]');if(!r())return 'no roll';const tok=!!document.querySelector('[data-a="cpptok"][data-k="ft"]');r().click();if(g.ask){g.ask=null;g.askq=[];render()}const again=r()&&/Roll again/.test(r().textContent);r().click();g.ask=null;g.askq=[];render();return tok&&again&&g.t.rolled===1&&g.t.r1!==g.t.r2&&!!document.querySelector('[data-a="cppend"]')});
  ok('From the screen: token buttons before rolling, then Roll and Roll again (two different numbers)',roll===true,roll);
  const neu=await P.evaluate(()=>{const g=S.cpg,me=act()[0].id;Object.assign(g.me[me].r,{w:3,b:3});document.querySelector('[data-a="cppmode"][data-k="road"]').click();const e=document.querySelector('.cpego[data-a="cppedge"],[data-a="cppedge"].go,.go[data-a="cppedge"]');const es=cpESpots(g,me);if(!es.length)return 'no road spot';
    const el=document.querySelector(`[data-a="cppedge"][data-k="${es[0]}"]`);if(!el)return 'no edge el';el.dispatchEvent(new MouseEvent('click',{bubbles:true}));if(!(g.ask&&g.ask.k==='neu'))return 'no neutral ask';if(!/Neutral road/.test(document.body.textContent))return 'no dock';
    const ne=cpNeuSpots(g,'road').e[0],el2=document.querySelector(`[data-a="cppedge"][data-k="${ne}"]`);if(!el2)return 'no neutral edge';el2.dispatchEvent(new MouseEvent('click',{bubbles:true}));return !g.ask&&CPNEU.includes(g.rd[ne])&&document.querySelectorAll('.cprd').length>=6});
  ok('From the screen: build a road, then tap a glowing edge for the neutral road',neu===true,neu);
  const ft=await P.evaluate(()=>{CPMODE=null;const g=S.cpg,me=act()[0].id,o=cpOpp(g,me);g.t.tk=0;Object.assign(g.me[o].r,{s:2});g.me[me].r={w:2,b:0,s:0,g:0,o:0};render();const b=document.querySelector('[data-a="cpptok"][data-k="ft"]');if(!b)return 'no button';b.click();if(!/Forced trade/.test(document.body.textContent))return 'no dock';
    document.querySelectorAll('[data-a="cppdisc"][data-k="w:1"]').forEach(x=>x.click());document.querySelector('[data-a="cppdisc"][data-k="w:1"]')?.click();const ok2=document.querySelector('[data-a="cppdiscok"]');if(!ok2||ok2.disabled)return 'cannot give';ok2.click();return !g.ask&&g.me[o].r.w>=2&&g.t.tk===1});
  ok('From the screen: forced trade (take 2, then give 2 back)',ft===true,ft);
  ok('Tabs show trade tokens',await P.evaluate(()=>/🎟️/.test(document.querySelector('.tabs').textContent)));
  ok('The guide explains Catan for Two',await P.evaluate(()=>{document.querySelector('[data-a="rules"]').click();const t=/Catan for Two/.test(document.body.textContent)&&/Neutral players/.test(document.body.textContent);return t}));
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
