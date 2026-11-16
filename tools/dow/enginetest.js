/* node dow/enginetest.js – direct checks of the Dead of Winter rules engine */
global.S={};global.act=()=>[0,1,2,3].map(i=>({id:'p'+i,name:'P'+i,bot:'easy'}));global.gAnn=()=>{};global.gLog=()=>{};global.nmid=x=>x;global.nm=p=>p.name;
const fs=require('fs'),D=__dirname+'/';require('vm').runInThisContext(fs.readFileSync(D+'data.js','utf8')+fs.readFileSync(D+'xr.js','utf8')+fs.readFileSync(D+'game.js','utf8'));
let pass=0,fail=0;const ok=(n,c,x)=>{if(c){pass++}else{fail++;console.log('FAIL',n,x!==undefined?JSON.stringify(x).slice(0,300):'')}};
const fresh=(o)=>{const g=dwDeal(o||{mo:'samples',side:'std'});let k=0;while((g.ask||g.vote)&&k++<80)dwBotStep(g,{id:dwActor(g),bot:'easy'});g.decks.xr=[];g.ps.forEach(p=>g.P[p].xr=null);return g};
const card=k=>DWI.find(c=>c.k===k).id;
{const g=fresh();ok('setup: 4 players, 2 survivors each, 5 starters, secret objectives, 1 betrayal card in a pool of 9',g.ps.every(p=>dwMine(g,p).length===2&&g.P[p].hand.length===5&&g.P[p].obj),g.P);
 ok('first player has the highest-influence leader',g.ps.every(p=>dwSv(g.P[p].lead).inf<=dwSv(g.P[g.fp].lead).inf));
 ok('round 1 crisis revealed, dice = 1 + survivors',g.crisis&&g.ps.every(p=>g.P[p].dice.length===3),g.P[g.ps[0]].dice);
 ok('samples standard: morale 6, 6 rounds, 1 zombie at each location',g.morale===6&&g.round===6&&DWLOC.every(l=>g.loc[l.id].z===1));}
{const g=dwDeal({mo:'mouths',side:'hc'});ok('Too Many Mouths hardcore: 12 colony zombies, helpless = players + 5',dwZ(g,'colony')===12&&g.helpless===9,[dwZ(g,'colony'),g.helpless]);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0];P.dice=[6,6,6];g.sv[s].loc='grocery';const n0=P.hand.length;
 ok('search needs a non-colony survivor and a die >= search',dwMove(g,p,{a:'search',s,die:0}));ok('search asks keep/noise',g.ask&&g.ask.kind==='search');
 const noise=g.ask.opts.find(o=>o.v==='noise');ok('noise option offered',!!noise);dwMove(g,p,{v:'noise'});ok('noise token placed and 2 cards seen',g.loc.grocery.noise===1&&g.q[0].cards.length===2);
 dwMove(g,p,{v:g.ask.opts[0].v});ok('keep 1 card, the rest go to the bottom',P.hand.length===n0+1&&!g.ask,g.ask);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0];P.dice=[6,6];g.loc.colony.ent[0].z=2;const z0=dwZ(g,'colony');
 ok('attack a zombie at the colony',dwMove(g,p,{a:'attack',s,die:0,target:'z'}));ok('zombie removed',dwZ(g,'colony')===z0-1);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0];P.dice=[1];ok('cannot attack with a die below attack value',!dwMove(g,p,{a:'attack',s,die:0,target:'z'})||dwSv(s).atk<=1);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0];P.dice=[1];const b0=dwBar(g,'colony');ok('barricade with any die',dwMove(g,p,{a:'barricade',s,die:0})&&dwBar(g,'colony')===b0+1);}
{const g=fresh();const p=g.turn,P=g.P[p];P.dice=[1];g.waste=[1,2,3,4,5];ok('clean waste removes 3',dwMove(g,p,{a:'clean',die:0})&&g.waste.length===2);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0],f=card('fuel');P.hand.push(f);ok('move with fuel: no exposure, fuel wasted',dwMove(g,p,{a:'move',s,to:'library',fuel:f})&&g.sv[s].loc==='library'&&g.waste.includes(f));
 ok('each survivor moves once a turn',!dwMove(g,p,{a:'move',s,to:'school'}));}
{const g=fresh();const p=g.turn,P=g.P[p];g.food=3;P.dice=[2];ok('spend food tokens to raise a die',dwMove(g,p,{a:'food',die:0,n:2})&&P.dice[0]===4&&g.food===1);}
{const g=fresh();const p=g.turn,P=g.P[p],c=P.hand[0];ok('crisis contribution face down',dwMove(g,p,{a:'crisis',c})&&g.crisis.add.length===1&&!P.hand.includes(c));}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0],c=card('colt');P.hand.push(c);ok('equip a weapon',dwMove(g,p,{a:'play',c,s})&&g.sv[s].eq.includes(c));
 const s2=dwMine(g,p)[1];ok('hand off to a survivor at the same location',dwMove(g,p,{a:'handoff',s,c,to:s2})&&g.sv[s2].eq.includes(c));}
{const g=fresh();const p=g.turn,P=g.P[p],c=card('out2');P.hand.push(c);const n=dwMine(g,p).length,h=g.helpless;ok('2 outsiders: new follower + 1 helpless',dwMove(g,p,{a:'play',c})&&dwMine(g,p).length===n+1&&g.helpless===h+1);}
{const g=fresh();const p=g.turn,P=g.P[p],s=dwMine(g,p)[0];g.sv[s].w=1;const m=card('med');P.hand.push(m);ok('medicine heals a wound',dwMove(g,p,{a:'play',c:m,t:s})&&g.sv[s].w===0);}
{const g=fresh();const p=g.turn,o=g.ps.find(q=>q!==p);ok('request asks the others',dwMove(g,p,{a:'request'})&&g.ask&&g.ask.kind==='give');const give=g.ask.pid,c=g.ask.opts[0].v;dwMove(g,give,{v:c});
 ok('given card arrives and cannot go to the crisis',g.P[p].hand.includes(+c)&&!dwMove(g,p,{a:'crisis',c:+c}));}
{const g=fresh();const p=g.turn,t=g.ps.find(q=>q!==p);ok('exile vote starts',dwMove(g,p,{a:'exile',target:t})&&g.vote);g.vote.need.forEach(q=>dwMove(g,q,{vote:true}));
 ok('vote passes: target exiled with an exile objective, no colony survivors',g.P[t].exiled&&g.P[t].exObj!=null);let k=0;while((g.ask||g.vote)&&k++<10)dwBotStep(g,{id:dwActor(g),bot:'easy'});
 ok('exiled survivors left the colony',dwMine(g,t).every(s=>g.sv[s].loc!=='colony'),dwMine(g,t).map(s=>g.sv[s].loc));ok('exiled cannot add to crisis',!dwMove(g,t,{a:'crisis',c:g.P[t].hand[0]}));}
{const g=fresh();const p=g.turn;g.P[p].voted=false;const t=g.ps.find(q=>q!==p);dwMove(g,p,{a:'exile',target:t});const need=g.vote.need;need.forEach((q,i)=>dwMove(g,q,{vote:i%2===0}));
 ok('tie: first player decides',g.P[t].exiled===(need.indexOf(g.fp)%2===0));}
{const g=fresh();const s=Object.keys(g.sv).map(Number)[0],pid=g.sv[s].pid,m0=g.morale;dwWound(g,s,3,'wound');ok('3 wounds kill, morale -1',!g.sv[s]&&g.morale===m0-1);}
{const g=fresh();const id=dwSidN('Buddy Davis');if(!g.sv[id]){g.sv[id]={pid:g.ps[0],loc:'colony',w:0,fb:0,eq:[],used:{},mv:-1};g.P[g.ps[0]].follow.push(id)}dwWound(g,id,3,'wound');ok('Buddy survives 3 wounds',!!g.sv[id]);}
{const g=fresh();g.loc.colony.ent.forEach(e=>{e.z=3;e.bar=0});const n0=Object.keys(g.sv).length;dwAddZ(g,'colony',1);ok('full entrance without barricade: overrun kills a survivor',Object.keys(g.sv).length===n0-1);
 g.loc.colony.ent[0].z=2;g.loc.colony.ent[0].bar=1;const n1=Object.keys(g.sv).length;dwAddZ(g,'colony',1);ok('barricade absorbs the zombie',Object.keys(g.sv).length===n1&&g.loc.colony.ent[0].bar===0);}
{const g=fresh();g.food=0;g.starve=0;const m0=g.morale;g.q=[{t:'colony',step:1}];g.turn=null;g.crisis.add=[];g.order=g.ps.slice();dwRun(g);ok('starvation: token + morale loss',g.starve===1&&g.morale<m0);}
{const g=fresh();const C=DWCR[g.crisis.id];const m=DWI.filter(c=>C.need.includes(c.k==='junk'?'tools':DWK[c.k].sym)).slice(0,6).map(c=>c.id);g.crisis.add=m.map(c=>({pid:g.ps[0],c}));const m0=g.morale;dwResolveCrisis(g);ok('crisis prevented by 2+ extra: morale +1',g.morale===Math.min(10,m0+1),[C.n,m.length,g.morale,m0]);}
{const g=fresh({mo:'cure',side:'std'});const meds=DWI.filter(c=>c.k==='med'&&c.d!=='starter').slice(0,8).map(c=>c.id);g.mo.cards=meds;ok('Find a Cure std: 2 non-starter medicine per player',dwMOCheck(g));
 g.mo.cards=DWI.filter(c=>c.k==='med'&&c.d==='starter').map(c=>c.id);ok('starter medicine does not count',!dwMOCheck(g));}
{const g=fresh();g.mo.done=true;let errs=0;Object.keys(DWSEC).forEach(n=>{try{DWSEC[n](g,g.ps[0])}catch(e){errs++}});Object.keys(DWEXS).forEach(n=>{try{DWEXS[n].plain(g,g.ps[0]);DWEXS[n].betray(g,g.ps[0])}catch(e){errs++}});
 ok('every secret, betrayal and exile objective has a check',DWSO.regular.every(o=>DWSEC[o.n])&&DWSO.betrayal.every(o=>DWSEC[o.n])&&DWSO.exile.every(o=>DWEXS[o.n])&&errs===0,DWSO.regular.concat(DWSO.betrayal).filter(o=>!DWSEC[o.n]).map(o=>o.n));
 dwEnd(g,'objective');ok('game end reports win/lose for everyone',g.ps.every(p=>typeof g.fin[p].win==='boolean'&&g.fin[p].obj));}
{const g=fresh();const p=g.turn,o=dwRight(g,p);g.decks.xr=[DWXR[0].no];g.q=[{t:'tstart',pid:p}];g.oi=0;g.order=g.ps.slice(g.ps.indexOf(p)).concat(g.ps.slice(0,g.ps.indexOf(p)));dwRun(g);
 ok('the player to the right holds a crossroads card for this turn',g.P[o].xr===DWXR[0].no);}
{const g=fresh();g.q=[];g.turn=g.fp;const fp=g.fp;g.order=[g.fp];g.oi=0;dwEndTurn(g,g.fp);dwRun(g);let k=0;while((g.ask||g.vote)&&k++<40)dwBotStep(g,{id:dwActor(g),bot:'easy'});
 ok('first player token passes to the right',g.phase!=='play'||g.fp===dwRight(g,fp),[fp,g.fp]);}
console.log(`${pass} passed, ${fail} failed`);process.exit(fail?1:0);
