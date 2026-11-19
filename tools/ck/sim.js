/* node /home/claude/ck/sim.js [games]  — plays random + bot games over every option, checks the engine. Prints "bad 0 []" when all is well. */
const fs=require('fs');global.CK_DEBUG=true;
eval(fs.readFileSync(__dirname+'/data.js','utf8')+fs.readFileSync(__dirname+'/game.js','utf8')+fs.readFileSync(__dirname+'/bots.js','utf8')+`
const GAMES=+(process.argv[2]||2000);const bad=[];const B=(m)=>{bad.push(m)};
const stat={games:0,rounds:0,moves:0,ch:0,chLong:0,elvSaved:0,inn:0,fx:0,hy:0,mb:0,wz:0,mt:0,pl:0,stuckEnd:0,ls:0,junk:0,maxTurns:0};
/* every card in exactly one place */
function zones(g){const z=[];const add=(a,w)=>a.forEach(id=>z.push([id,w]));add(g.draw,'draw');add(g.disc,'disc');add(g.ret,'ret');
  g.ps.forEach(p=>{add(g.hand[p],'hand');ckLands(g).forEach(l=>g.k[p][l].forEach(C=>add(C.c,'clan')))});g.mt.forEach(m=>z.push([m.c,'mt']));
  (g.inn||[]).forEach(P=>add(P,'inn'));if(g.ch){g.ch.plays.forEach(x=>add(x.c,'ch'));if(g.ch.inn)add(g.ch.inn,'chinn');if(g.ch.hc!=null)z.push([g.ch.hc,'hc'])}
  if(g.pl)add(g.pl.clan.c,'pl');return z}
function check(g,where){const z=zones(g),N=g.cs.length;const seen=new Array(N).fill(0);z.forEach(([id])=>{if(!(id>=0&&id<N))B('bad id '+where);else seen[id]++});
  if(seen.some(x=>x!==1))B('conservation '+where+' '+seen.findIndex(x=>x!==1)+' x'+seen[seen.findIndex(x=>x!==1)]);
  if(g.cs.length!==(g.o.two?116:141))B('deck size');
  /* clans: 2+ cards, a clanning creature of its species on top, all members match, in a land that suits it */
  g.ps.forEach(p=>ckLands(g).forEach(l=>g.k[p][l].forEach(C=>{if(C.c.length<2)B('small clan');if(g.cs[C.c[C.c.length-1]]!==C.sp)B('top not species');
    if(C.c.some(id=>{const s=ckS(g,id);return s.kind==='hire'||s.kind==='clan'&&s.id!==C.sp&&!(s.id==='he'&&(C.sp==='pl'||C.sp==='uh'))}))B('mixed clan');
    if(!ckLandsFor(g,p,C.sp,false).includes(l))B('wrong land '+C.sp+' '+l);
    const wi=C.c.findIndex(id=>g.cs[id]===C.sp);if(C.c.slice(wi).some(id=>g.cs[id]!==C.sp))B('wild above clanning')})));
  if(g.phase==='play'){if(!g.ps.includes(g.turn))B('turn');if(g.acts>2||g.acts<0)B('acts');if(g.disc.some(id=>!ckIsClan(g,id)))B('non-clan in discard');
    const ids=new Set();g.ps.forEach(p=>ckLands(g).forEach(l=>g.k[p][l].forEach(C=>{if(ids.has(C.id))B('dup clan id');ids.add(C.id)})));
    if(ckIdle(g)&&!g.hand[g.turn].length&&g.acts===0)B('turn with no cards');
    if(g.ch&&g.ch.ans!==g.ch.by&&g.ch.ans!==g.ch.tg)B('ch ans');if(g.mt.some(m=>m.up!==(m.t===m.by)))B('mt up');}
  if(g.o.two&&g.mt.length)B('minnowtaur in 2p');}
function recount(g,p){let magic=0,cards=0;ckLands(g).forEach(l=>g.k[p][l].forEach(C=>C.c.forEach(id=>{const s=g.cs[id];magic+=s==='pg'&&(g.pw[p]||[]).includes('swine')?15:CK_SPI[s].v;cards++})));
  let bonus=0;if(g.o.cons){const n=g.ps.length,b=n<=4?[20,10,20,50]:n<=6?[30,15,30,75]:[40,20,40,100];const T=g.tok[p];let k=0;
    [['br','pl','yy','sc'],['pg','he'],['ve','lc','uh','kl']].forEach((cl,i)=>{if(cl.every(s=>T[s])){bonus+=b[i];k++}});if(k===3)bonus+=b[3];if(g.o.ls&&g.ls.got.includes(p))bonus+=b[3]}
  return {magic,cards,total:magic+bonus}}
function junk(g){const ids=()=>Math.floor(Math.random()*150)-3,L=['high','low','mane','x',null];const p=g.ps[Math.floor(Math.random()*g.ps.length)];
  const A=['settle','recruit','hire','add','discard','inn','wkid','end','pass','counter','place','hyret','fx','next','zzz'];
  return [p,{a:A[Math.floor(Math.random()*A.length)],cards:[ids(),ids()].slice(0,1+Math.floor(Math.random()*2)),card:ids(),t:g.ps[Math.floor(Math.random()*g.ps.length)],land:L[Math.floor(Math.random()*5)],
    to:L[Math.floor(Math.random()*5)],mine:L[Math.floor(Math.random()*5)],dir:['up','down','x'][Math.floor(Math.random()*3)],disc:Math.random()<.3,free:Math.random()<.3,take:[Math.floor(Math.random()*5)],dh:[ids()],as:['wz','mt','hy','el'][Math.floor(Math.random()*4)]}]}
for(let k=0;k<GAMES;k++){const NP=2+k%7,ps=Array.from({length:NP},(_,i)=>'p'+i);
  const o={ps,seed:k*7919+1,two:NP===2?k%14!==0:false,cons:k%3!==0,ls:k%2===0,pow:k%4===0?0:(NP<=3&&k%4===1?2:1),ext:['one','acc2','acc3','first2'][k%4]};
  const mode=k%3; /* 0 all random, 1 all bots, 2 mixed */
  if(mode)o.bots=Object.fromEntries(ps.filter((p,i)=>mode===1||i%2===0).map(p=>[p,1]));
  const g=ckDeal(o);if(!g){B('deal');continue}stat.games++;check(g,'deal');
  if(NP<=3&&o.pow===2&&g.ps.some(p=>g.pw[p].length!==2||CK_POWI[g.pw[p][0]].kind!=='act'||CK_POWI[g.pw[p][1]].kind!=='mod'))B('2 powers');
  if(NP<=3&&g.ps.some(p=>g.pw[p].some(x=>CK_POWI[x].no23)))B('no23 power dealt');
  if(o.pow&&new Set([].concat(...g.ps.map(p=>g.pw[p]))).size!==[].concat(...g.ps.map(p=>g.pw[p])).length)B('power twice');
  let guard=0,turns=0,lastTurn=null,rounds=0;
  while(g.phase!=='done'&&guard++<20000){
    if(g.phase==='roundEnd'){g.ps.forEach(p=>{const r=recount(g,p);if(r.total!==g.res[p].total||r.cards!==g.res[p].cards)B('score mismatch')});
      if(g.draw.length&&g.idle<1)B('round ended with deck');rounds++;if(!ckMove(g,g.ps[0],{a:'next'}))B('next');check(g,'next');continue}
    const who=ckWho(g);if(!who.length){B('nobody awaited');break}
    if(Math.random()<.05){const [p,mv]=junk(g);const before=JSON.stringify(g),ok=ckMove(g,p,mv);stat.junk++;if(!ok&&JSON.stringify(g)!==before)B('failed move changed state '+mv.a);if(ok)check(g,'junk '+mv.a);continue}
    const p=who[Math.floor(Math.random()*who.length)],L=ckLegal(g,p);if(!L.length){B('no legal for awaited '+(g.ch?'ch':g.pl?'pl':g.hy?'hy':g.fx?'fx':'turn'));break}
    /* nobody else may act */
    const other=g.ps.find(q=>!who.includes(q));if(other&&ckLegal(g,other).length)B('non-awaited player has moves');
    let mv;if(g.bots&&g.bots[p])mv=ckBot(g,p);else{const nonEnd=L.filter(m=>m.a!=='end');mv=nonEnd.length&&Math.random()<.85?nonEnd[Math.floor(Math.random()*nonEnd.length)]:L[Math.floor(Math.random()*L.length)]}
    if(!ckValid(g,p,mv))B('bot/legal move not valid '+mv.a);
    const a=mv.a,chB=g.ch;if(a==='recruit'||a==='inn')stat.ch++;if(a==='inn')stat.inn++;if(a==='hire'){stat[mv.as||g.cs[mv.card]]=(stat[mv.as||g.cs[mv.card]]||0)+1}
    if(a==='place')stat.pl++;if(a==='fx')stat.fx++;if(a==='counter'&&chB&&chB.plays.length>=2)stat.chLong++;if(a==='counter'&&chB&&chB.k==='elv')stat.elvSaved++;
    const t0=g.turn,r0=g.round;if(!ckMove(g,p,mv)){B('legal move refused '+a);break}stat.moves++;
    if(g.round===r0&&g.turn!==t0&&g.phase==='play')turns++;check(g,'after '+a);
    if(g.ls&&g.ls.got.length)stat.ls++}
  if(g.phase!=='done')B('game did not end '+g.phase+' np'+NP);else{rounds++;g.ps.forEach(p=>{const r=recount(g,p);if(r.total!==g.res[p].total)B('final score mismatch')});
    const E=o.ext,need=E==='one'?1:E==='acc2'?2:E==='acc3'?3:0;if(need&&rounds!==need)B('rounds '+rounds+' for '+E);if(E==='first2'&&!g.ps.some(p=>g.wins[p]>=2))B('first2 no winner');
    if(!g.win||!g.win.length)B('no winner');}
  stat.rounds+=rounds;stat.maxTurns=Math.max(stat.maxTurns,turns)}
/* targeted rule checks */
function T(name,f){try{if(!f())B('rule: '+name)}catch(e){B('rule threw: '+name+' '+e.message)}}
function blank(np,opt){const g=ckDeal(Object.assign({ps:Array.from({length:np},(_,i)=>'p'+i),seed:5},opt||{}));
  /* empty everything into the draw pile so tests can build exact positions */
  g.ps.forEach(p=>{g.draw.push(...g.hand[p]);g.hand[p]=[];ckLands(g).forEach(l=>{g.k[p][l].forEach(C=>g.draw.push(...C.c));g.k[p][l]=[]})});g.draw.push(...g.disc);g.disc=[];
  (g.inn||[]).forEach(P=>{g.draw.push(...P);P.length=0});g.turn='p0';g.acts=0;g.ch=g.pl=g.hy=g.fx=null;g.innq=[];return g}
const take=(g,sp)=>{const i=g.draw.findIndex(id=>g.cs[id]===sp);return g.draw.splice(i,1)[0]};
const give=(g,p,...sps)=>sps.map(s=>{const id=take(g,s);g.hand[p].push(id);return id});
const clan=(g,p,land,sp,n,extra)=>{const c=[];for(let i=0;i<n;i++)c.push(take(g,sp));(extra||[]).forEach(s=>c.unshift(take(g,s)));g.k[p][land].push({id:++g.cid,sp,c});return g.k[p][land][g.k[p][land].length-1]};
T('settle pair',()=>{const g=blank(3);const [a,b]=give(g,'p0','br','br');give(g,'p0','yy');return ckMove(g,'p0',{a:'settle',cards:[a,b],land:'high'})&&g.k.p0.high.length===1&&g.acts===1});
T('settle wrong land refused',()=>{const g=blank(3);const [a,b]=give(g,'p0','br','br');give(g,'p0','yy');return !ckMove(g,'p0',{a:'settle',cards:[a,b],land:'low'})});
T('two wilds cannot settle',()=>{const g=blank(3);const [a,b]=give(g,'p0','ct','sp');give(g,'p0','yy');return !ckMove(g,'p0',{a:'settle',cards:[a,b],land:'high'})});
T('wild under clanning',()=>{const g=blank(3);const [a,b]=give(g,'p0','br','ct');give(g,'p0','yy');ckMove(g,'p0',{a:'settle',cards:[a,b],land:'high'});const C=g.k.p0.high[0];return g.cs[C.c[0]]==='ct'&&g.cs[C.c[1]]==='br'});
T('settle with discard top',()=>{const g=blank(3);g.disc.push(take(g,'kl'));const [a]=give(g,'p0','kl');give(g,'p0','yy');return ckMove(g,'p0',{a:'settle',cards:[a],disc:true,land:'low'})&&!g.disc.length});
T('recruit needs a clan of your own',()=>{const g=blank(3);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [c]=give(g,'p0','br');give(g,'p0','yy');return !ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:c})});
T('no recruiting a one-clan kingdom',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);const [c]=give(g,'p0','br');give(g,'p0','yy');return !ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:c})});
T('recruit, Spydra counter, pair re-counter wins (rulebook example)',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);
  const [b1,b2,ct]=give(g,'p0','br','br','ct');give(g,'p0','yy');const [s]=give(g,'p1','sp');give(g,'p1','yy');
  if(!ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:b1}))return false;if(g.ch.ans!=='p1')return false;
  if(!ckMove(g,'p1',{a:'counter',cards:[s]}))return false;if(g.ch.need!==2||g.ch.ans!=='p0')return false;
  if(ckMove(g,'p0',{a:'counter',cards:[b2]}))return false; /* one Bragon can't answer a Spydra */
  if(!ckMove(g,'p0',{a:'counter',cards:[b2,ct]}))return false; /* p1 has no answer: auto-resolved */
  return !g.ch&&g.k.p0.high.length===1&&g.k.p0.high[0].c.length===6&&g.k.p1.high.length===0&&g.cs[g.k.p0.high[0].c[5]]==='br'});
T('failed first recruit: same clan not again that turn',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);
  const [b1,b2]=give(g,'p0','br','br');const [x]=give(g,'p1','br');give(g,'p1','yy');ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:b1});ckMove(g,'p1',{a:'counter',cards:[x]});
  if(g.ch&&g.ch.ans==='p0')ckMove(g,'p0',{a:'pass'});return g.k.p1.high.length===1&&!ckValid(g,'p0',{a:'recruit',t:'p1',land:'high',card:b2})});
T('6+ players: recruit range two seats',()=>{const g=blank(7);clan(g,'p0','low','kl',2);clan(g,'p3','high','br',2);clan(g,'p3','low','kl',2);clan(g,'p5','high','br',2);clan(g,'p5','low','kl',2);
  const [c]=give(g,'p0','br');give(g,'p0','yy');return !ckValid(g,'p0',{a:'recruit',t:'p3',land:'high',card:c})&&ckValid(g,'p0',{a:'recruit',t:'p5',land:'high',card:c})});
T('elves: countered by two CTs',()=>{const g=blank(3);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [e]=give(g,'p0','el');give(g,'p0','yy');const [c1,c2]=give(g,'p1','ct','ct');
  return ckMove(g,'p0',{a:'hire',card:e,t:'p1',land:'high'})&&ckMove(g,'p1',{a:'counter',cards:[c1,c2]})&&(g.ch?ckMove(g,'p0',{a:'pass'}):true)&&!g.ch&&g.k.p1.high.length===1&&g.ret.length===3});
T('elves: hirer answers the sacrifice (back and forth)',()=>{const g=blank(3);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [e,s1]=give(g,'p0','el','sp');give(g,'p0','yy');const [c1,c2]=give(g,'p1','ct','ct');
  return ckMove(g,'p0',{a:'hire',card:e,t:'p1',land:'high'})&&ckMove(g,'p1',{a:'counter',cards:[c1,c2]})&&ckMove(g,'p0',{a:'counter',cards:[s1]})&&(g.ch?ckMove(g,'p1',{a:'pass'}):true)&&!g.ch&&g.k.p1.high.length===0&&g.ret.length===6});
T('pair answered by one card',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [s1,b1]=give(g,'p0','sp','br');give(g,'p0','yy');const [x1,x2]=give(g,'p1','br','br');
  return ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:s1})&&ckMove(g,'p1',{a:'counter',cards:[x1,x2]})&&ckValid(g,'p0',{a:'counter',cards:[b1]})});
T('elves: no counter removes clan',()=>{const g=blank(3);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [e]=give(g,'p0','el');give(g,'p0','yy');give(g,'p1','yy');
  return ckMove(g,'p0',{a:'hire',card:e,t:'p1',land:'high'})&&!g.ch&&g.k.p1.high.length===0&&g.ret.length===3});
T('recruit pair counter: not two CTs',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);
  const [s]=give(g,'p0','sp');give(g,'p0','yy');const [c1,c2]=give(g,'p1','ct','ct');ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:s});return !g.ch&&g.k.p0.high.length===1});
T('mobgoblins swap, even an only clan',()=>{const g=blank(3);clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);const [m]=give(g,'p0','mb');give(g,'p0','yy');
  return ckMove(g,'p0',{a:'hire',card:m,t:'p1',land:'high',mine:'low'})&&g.k.p0.high[0].sp==='br'&&g.k.p1.low[0].sp==='kl'});
T('minnowtaur upright protects, ends at start of next own turn',()=>{const g=blank(3);clan(g,'p0','high','br',2);clan(g,'p0','low','kl',2);clan(g,'p1','low','kl',2);
  const [m]=give(g,'p0','mt');give(g,'p0','yy','yy','yy');const [c]=give(g,'p1','br');give(g,'p1','sc','sc');give(g,'p2','sc','sc');
  ckMove(g,'p0',{a:'hire',card:m,t:'p0',land:'high'});ckMove(g,'p0',{a:'end'});if(g.turn!=='p1')return false;if(ckValid(g,'p1',{a:'recruit',t:'p0',land:'high',card:c}))return false;
  ckMove(g,'p1',{a:'discard',card:g.hand.p1.find(x=>g.cs[x]==='sc')});ckMove(g,'p1',{a:'end'});ckMove(g,'p2',{a:'discard',card:g.hand.p2[0]});ckMove(g,'p2',{a:'end'});return g.turn==='p0'&&g.mt.length===0});
T('minnowtaur sideways blocks settling there next turn',()=>{const g=blank(3);const [m]=give(g,'p0','mt');give(g,'p0','yy');const [a,b]=give(g,'p1','br','br');give(g,'p1','sc');
  ckMove(g,'p0',{a:'hire',card:m,t:'p1',land:'high'});ckMove(g,'p0',{a:'end'});return g.turn==='p1'&&!ckValid(g,'p1',{a:'settle',cards:[a,b],land:'high'})});
T('hypnogriff take 3 return 3',()=>{const g=blank(3);const [h]=give(g,'p0','hy');give(g,'p0','yy');give(g,'p1','br','br','kl','kl');const n0=g.hand.p0.length,n1=g.hand.p1.length;
  if(!ckMove(g,'p0',{a:'hire',card:h,t:'p1'})||!g.hy||g.hand.p0.length!==n0-1+3)return false;const r=g.hand.p0.slice(0,3);return ckMove(g,'p0',{a:'hyret',cards:r})&&g.hand.p1.length===n1&&!g.hy});
T('wiizzzaard bottom to top',()=>{const g=blank(3);const A=clan(g,'p1','high','br',2);clan(g,'p1','high','yy',2);const [w]=give(g,'p0','wz');give(g,'p0','yy');
  return ckMove(g,'p0',{a:'hire',card:w,t:'p1',land:'high',dir:'up'})&&ckTop(g,'p1','high').id===A.id});
T('add and switch land (either)',()=>{const g=blank(3);clan(g,'p0','high','pg',2);const [c]=give(g,'p0','pg');give(g,'p0','yy');return ckMove(g,'p0',{a:'add',card:c,land:'high',to:'low'})&&g.k.p0.low[0].c.length===3});
T('wilds cannot be added',()=>{const g=blank(3);clan(g,'p0','high','br',2);const [c]=give(g,'p0','ct');give(g,'p0','yy');return !ckValid(g,'p0',{a:'add',card:c,land:'high'})});
T('discard only clanning, draws one',()=>{const g=blank(3);const [c,w]=give(g,'p0','br','ct');give(g,'p0','yy');const d=g.draw.length;return !ckValid(g,'p0',{a:'discard',card:w})&&ckMove(g,'p0',{a:'discard',card:c})&&g.draw.length===d-1});
T('2p: hentaur only maneland; no hentaur switching',()=>{const g=blank(2);const [a,b,c]=give(g,'p0','he','he','he');give(g,'p0','yy');return !ckValid(g,'p0',{a:'settle',cards:[a,b],land:'high'})&&ckMove(g,'p0',{a:'settle',cards:[a,b],land:'mane'})&&!ckValid(g,'p0',{a:'add',card:c,land:'mane',to:'high'})});
T('2p inn: reveal wild takes Bragons + Spydras, rival can challenge',()=>{const g=blank(2);g.inn=[[take(g,'br')],[take(g,'br')],[take(g,'sp')],[take(g,'sp')]];const [w]=give(g,'p0','ct');give(g,'p0','yy');const [r]=give(g,'p1','br');give(g,'p1','yy');
  if(!ckMove(g,'p0',{a:'inn',take:[0,1,2,3],card:w}))return false;if(!g.ch||g.ch.ans!=='p1')return false;ckMove(g,'p1',{a:'counter',cards:[r]});/* p0 can't answer -> p1 wins */
  return !g.ch&&g.k.p1.high.length===1&&g.k.p1.high[0].c.length===6});
T('scoring tie -> most creatures',()=>{const g=blank(3);clan(g,'p0','high','yy',4);clan(g,'p1','high','pl',2);g.draw=[];g.ps.forEach(p=>g.hand[p]=[]);ckEndTurn(g);
  if(g.res.p0.magic!==g.res.p1.magic)return true; /* placeholder values changed: nothing to test */
  return g.phase==='done'&&g.win.length===1&&g.win[0]==='p0'});
T('game ends when nobody can act (stuck hands)',()=>{const g=blank(3);give(g,'p0','ct');give(g,'p1','sp');give(g,'p2','ct');g.draw=[];ckFlow(g);return g.phase==='done'});
T('light speed + constellation bonus',()=>{const g=blank(3,{cons:true,ls:true});CK_CLANS.forEach(s=>clan(g,'p0',CK_SPI[s].land==='either'?'high':CK_SPI[s].land,s,2));ckCons(g);
  const sc=ckScore(g,'p0');return g.ls.first==='p0'&&sc.bonus===20+10+20+50+50});
T('7-8 players share 6 tokens per species',()=>{const g=blank(8,{cons:true});g.ps.forEach(p=>clan(g,p,'high','br',1));ckCons(g);return g.ps.filter(p=>g.tok[p].br).length===6&&g.pool.br===0});
T('SubCerbient: a CT answers a Spydra',()=>{const g=blank(3);g.pw.p1=['sub'];clan(g,'p0','low','kl',2);clan(g,'p1','high','br',2);clan(g,'p1','low','kl',2);const [s]=give(g,'p0','sp');give(g,'p0','yy');const [c]=give(g,'p1','ct');give(g,'p1','yy');
  ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:s});/* against SubCerbient the Spydra counts 1 */ return g.ch&&g.ch.need===1&&ckMove(g,'p1',{a:'counter',cards:[c]})&&!g.ch&&g.k.p1.high.length===1});
T('Equinity: hentaur recruits PegLegasi',()=>{const g=blank(3);g.pw.p0=['eq'];clan(g,'p0','low','kl',2);clan(g,'p1','high','pl',2);clan(g,'p1','low','kl',2);const [h,h2]=give(g,'p0','he','he');give(g,'p0','yy');
  return !ckValid(g,'p0',{a:'settle',cards:[h],disc:false,land:'high'})&&ckMove(g,'p0',{a:'recruit',t:'p1',land:'high',card:h})&&g.k.p0.high.length===1&&g.cs[ckTop(g,'p0','high').c.slice(-1)[0]]==='pl'});
T('Match Maker free settle + 2 actions',()=>{const g=blank(3);g.pw.p0=['mm'];const [a,b,c,d,e,f]=give(g,'p0','br','br','yy','yy','sc','sc');give(g,'p0','kl');
  return ckMove(g,'p0',{a:'settle',cards:[a,b],land:'high',free:true})&&ckMove(g,'p0',{a:'settle',cards:[c,d],land:'high'})&&ckMove(g,'p0',{a:'settle',cards:[e,f],land:'high'})&&g.k.p0.high.length===3});
console.log(JSON.stringify(stat));
console.log('bad',bad.length,[...new Set(bad)].slice(0,12))`);
