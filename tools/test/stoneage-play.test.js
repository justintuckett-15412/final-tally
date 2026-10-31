// Stone Age play mode: the rules engine (placing limits, tools, cards, huts, feeding, game end, final scoring)
// and a quick game against computer players on one phone.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const setup=n=>P.evaluate(n=>{window.__htfast=1;switchGame('stoneage');resetScores();SAX().play=1;S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cat','Dan'][i]||'';delete p.bot});S.started=true;S.screen='score';saDeal();return S.sag.ps},n);
  /* 2 players: village spots and resource spots */
  let r=await P.evaluate(async()=>{});
  await setup(2);
  r=await P.evaluate(()=>{const g=S.sag,[a,b]=g.ps,o={};o.forestA=saPlace(g,a,'forest',2);o.forestB=saCanPlace(g,b,'forest');o.tools=saPlace(g,b,'tools',1);o.field=saPlace(g,a,'field',1);o.hutBlocked=saCanPlace(g,b,'hut');o.hutWrongN=saPlace(g,b,'hut',1);return o});
  ok('2 players: a resource spot takes only one player',r.forestA&&r.forestB===0,r);
  ok('2 players: only 2 of tool maker, hut and field',r.tools&&r.field&&r.hutBlocked===0,r);
  await setup(3);
  r=await P.evaluate(()=>{const g=S.sag,[a,b,c]=g.ps,o={};o.a=saPlace(g,a,'quarry',1);o.b=saPlace(g,b,'quarry',1);o.c=saCanPlace(g,c,'quarry');o.hut2=saCanPlace(g,c,'hut');return o});
  ok('3 players: two players per resource spot',r.a&&r.b&&r.c===0,r);
  ok('the hut takes 2 people',r.hut2===2,r);
  r=await P.evaluate(()=>{const g=S.sag,a=g.ps[0];g.phase='act';g.turn=a;g.todo={[a]:['forest']};g.pl={forest:{[a]:3}};g.roll=g.pay=g.pick=g.dc=null;const o={};o.res=saResolve(g,a,'forest');o.noDice=g.roll&&g.roll.dice===null;o.takeEarly=saTake(g,a);o.roll=saRoll(g,a);o.n=g.roll.dice.length;o.twice=saRoll(g,a);o.take=saTake(g,a);return o});
  ok('gathering waits for a tap to roll, then rolls one die per person',r.res&&r.noDice&&!r.takeEarly&&r.roll&&r.n===3&&!r.twice&&r.take,r);
  await setup(3);
  r=await P.evaluate(()=>{const g=S.sag,c=g.ps[0];return {max:saCanPlace(g,c,'clay'),place:saPlace(g,c,'clay',3),n:(g.pl.clay||{})[c],card:saIsCard('clay'),slot:saIsCard('c2')}});
  ok('the clay pit takes several people (not mistaken for a card spot)',r.max>=3&&r.place&&r.n===3&&!r.card&&r.slot,r);
  /* tools go 1, 1+1, 1+1+1, 2+1+1 ... 4+4+4 */
  r=await P.evaluate(()=>{const M={tl:[],tu:[]},L=[];for(let i=0;i<13;i++){saAddTool(M);L.push(M.tl.join('/'))}return L});
  ok('tools grow like the rulebook',r[0]==='1'&&r[2]==='1/1/1'&&r[3]==='2/1/1'&&r[6]==='3/2/2'&&r[11]==='4/4/4'&&r[12]==='4/4/4',r);
  /* card costs and refilling: slot 0 (rightmost) costs 1; cards slide right */
  r=await P.evaluate(()=>{const g=S.sag,r0=g.r,before=g.slots.slice();g.slots[0]=null;g.slots[2]=null;g.phase='feed';g.fd={};saRoundEnd(g);return {before,after:g.slots.slice(),r:g.r-r0,costs:[0,1,2,3].map(saCost)}});
  ok('card costs 1, 2, 3, 4 from the right',r.costs.join()==='1,2,3,4',r.costs);
  ok('cards slide right and new ones fill from the left',r.after[0]===r.before[1]&&r.after[1]===r.before[3]&&r.after[2]&&r.after[3]&&r.r===1,r);
  /* feeding: fields first, then food; short = resources or -10 */
  r=await P.evaluate(()=>{const g=S.sag,[a,b,c]=g.ps;const A=g.me[a],B=g.me[b],C=g.me[c];A.food=2;A.ag=1;A.pp=5;A.w=3;B.food=0;B.ag=0;B.pp=5;C.food=9;C.ag=0;C.pp=5;g.phase='act';g.todo={};g.roll=g.pay=g.pick=g.dc=null;saFeedStart(g);
    const o={short:JSON.stringify(g.fd),cfood:C.food};o.badPay=saFeed(g,a,{w:1,c:0,s:0,g:0});o.pay=saFeed(g,a,{w:2,c:0,s:0,g:0});o.aw=A.w;o.starve=saFeed(g,b,'starve');o.bpts=B.pts;o.bhu=B.hu;o.waits=g.phase==='feed'&&!!g.fok[c];o.card=JSON.stringify(g.fdl[c]);o.ok=saFeedOk(g,c);o.next=g.phase;return o});
  ok('feeding: fields, then food, then the shortfall',r.short===JSON.stringify({[await P.evaluate(()=>S.sag.ps[0])]:{short:2},[await P.evaluate(()=>S.sag.ps[1])]:{short:5}})&&r.cfood===4,r);
  ok('feeding: pay the exact shortfall in resources',!r.badPay&&r.pay&&r.aw===1,r);
  ok('feeding: going hungry is −10',r.starve&&r.bpts===-10&&r.bhu===1,r);
  ok('feeding: a fed person sees their feeding card and taps to go on',r.waits&&r.ok&&r.next==='place'&&r.card.includes('"eat":5'),r);
  /* huts: fixed cost, n-of-k kinds, 1 to 7 */
  r=await P.evaluate(()=>{const g=S.sag,a=g.ps[0],M=g.me[a];Object.assign(M,{w:5,c:5,s:5,g:5});const o={};
    const try_=(hut,pay)=>{g.piles[0][0]='h'+SAHUTS.findIndex(h=>JSON.stringify(h)===JSON.stringify(hut));g.pay={pid:a,loc:'b0'};return saPayOk(g,pay)};
    o.fixedOk=try_({c:'wcs'},{w:1,c:1,s:1,g:0});o.fixedBad=try_({c:'wcs'},{w:1,c:1,s:0,g:1});
    o.v42ok=try_({v:{n:4,k:2}},{w:3,c:0,s:1,g:0});o.v42bad=try_({v:{n:4,k:2}},{w:2,c:1,s:1,g:0});o.anyOk=try_({any:7},{w:0,c:0,s:2,g:5});o.anyBad=try_({any:7},{w:3,c:0,s:0,g:5});
    g.piles[0][0]='h'+SAHUTS.findIndex(h=>h.v&&h.v.n===4&&h.v.k===2);g.pay={pid:a,loc:'b0'};g.phase='act';g.turn=a;const p0=M.pts;o.buy=saBuy(g,a,{w:0,c:0,s:3,g:1});o.pts=M.pts-p0;g.pay=null;return o});
  ok('huts: fixed cost must match',r.fixedOk&&!r.fixedBad,r);
  ok('huts: 4 resources of exactly 2 kinds',r.v42ok&&!r.v42bad,r);
  ok('huts: 1 to 7 of your choice',r.anyOk&&!r.anyBad,r);
  ok('huts: points are the value paid (3 stone + 1 gold = 21)',r.buy&&r.pts===21,r);
  /* a dice card: everyone takes one die, buyer first */
  r=await P.evaluate(()=>{const g=S.sag,[a,b,c]=g.ps;g.phase='act';g.turn=a;g.dc={by:b,dice:[1,5,6],order:[b,c,a],i:0};const o={};o.wrong=saDie(g,a,0);o.b=saDie(g,b,0);o.cw=g.me[c].w;o.c=saDie(g,c,2);o.a=saDie(g,a,1);o.done=g.dc===null;return o});
  ok('dice card: players take dice in order',!r.wrong&&r.b&&r.c&&r.a&&r.done,r);
  /* final scoring from the cards */
  r=await P.evaluate(()=>{const ids=k=>SACARDS.map((c,i)=>[c,i]).filter(([c])=>k(c)).map(([,i])=>'c'+i);const g1=['med','art','wri','pot','tim'].map(k=>ids(c=>c.k===k)[0]),dup=ids(c=>c.k==='pot')[1];
    const M={cards:[...g1,dup,...ids(c=>c.s&&c.s.fa===2)],w:2,c:0,s:1,g:0};return saFinalOf(M)});
  ok('final scoring: 5 different green + a second set of 1, farmers counted',r.g1===5&&r.g2===1&&r.fa===4&&r.rs===3,r);
  /* game ends when the cards can't be refilled */
  r=await P.evaluate(()=>{const g=S.sag;g.deck=[g.deck[0]];g.slots=[null,null,g.slots[2],g.slots[3]];g.phase='feed';g.fd={};g.end=null;saRoundEnd(g);return {ph:g.phase,end:g.end,hr:S.hr}});
  ok('game ends when the cards run out at the start of a round',r.ph==='done'&&r.end==='cards',r);
  /* a whole game against computer players on one phone */
  await P.evaluate(()=>{switchGame('stoneage');resetScores();SAX().play=1;S.players.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Bob','Cat','Dan'][i]||'';if(i<4)p.bot=['easy','normal','hard','normal'][i];else delete p.bot});S.started=true;S.finished=false;S.screen='score';delete S.sag;save();render()});
  for(let t=0;t<1200&&!(await P.evaluate(()=>S.sag&&S.sag.phase==='done'));t++)await W(150);
  r=await P.evaluate(()=>({ph:S.sag.phase,r:S.sag.r,hu:Object.values(S.sag.me).reduce((a,M)=>a+M.hu,0),sc:act().map(p=>total(p))}));
  ok('computer players finish a 4-player game',r.ph==='done'&&r.r>=6&&r.r<=30,r);
  ok('computer players rarely go hungry',r.hu<=4,r);
  ok('final scores look like real Stone Age scores',Math.max(...r.sc)>=50,r);
  await P.evaluate(()=>{const b=document.createElement('button');b.dataset.a='finish';document.body.appendChild(b);b.click();b.remove()});await W(800);
  ok('Finish goes to the reveal',await P.evaluate(()=>S.screen==='reveal'||S.screen==='results'));
  ok('no page errors',errs.length===0,errs.slice(0,4));
  await done(browser)})();
