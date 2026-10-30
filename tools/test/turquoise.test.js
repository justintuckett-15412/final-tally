// Turquoise (locoweed) chips from the Herb Witches in Quacks Play mode: price 8, for sale from round 1,
// value = 1 more than your rat tails this round (4 at most). Not in the shop without the Herb Witches.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1500);
  const start=(herb,turq=herb,o6=herb)=>page.evaluate(([herb,turq,o6])=>{window.__htfast=1;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=herb;X.turq=turq;X.o6=o6;const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Me','Bot'][i]||'';if(i)p.bot='normal';else delete p.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()},[herb,turq,o6]);
  const toEval=async()=>{for(let i=0;i<60;i++){const ph=await page.evaluate(()=>{const g=S.qpg;if(!g)return '';if(g.phase==='card'){qpSetCard(g,'');save();render()}if(g.phase==='brew'){(S.qkfc=S.qkfc||[])[g.r]=null;g.ps.forEach(id=>g.pl[id].sf=true);g.brewAnn=null;qpStop(g,act()[0].id);save();render()}return g.phase});if(ph==='eval')return true;await W(150)}return false};
  await start(false);await toEval();
  ok('no turquoise or orange 6-chip in the shop when both switches are off',await page.evaluate(()=>!document.querySelector('[data-k=t1]')&&!document.querySelector('[data-k=o6]')&&!qpChoose(S.qpg,act()[0].id,{t:'buy',v:'o6'})));
  await start(false,true,false);await toEval();
  ok('turquoise works without the witches (its own switch)',await page.evaluate(()=>!!document.querySelector('.qpshop [data-k=t1]')&&!document.querySelector('.qpshop [data-k=o6]')&&!document.querySelector('.qwboard')));
  await start(false,false,true);await toEval();
  ok('orange 6-chip works without the witches (its own switch)',await page.evaluate(()=>!!document.querySelector('.qpshop [data-k=o6]')&&!document.querySelector('.qpshop [data-k=t1]')));
  await start(true);await toEval();
  let r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id;qkR(p,g.r).ca=20;const shown=!!document.querySelector('.qpshop [data-k=t1]');const bought=qpChoose(g,id,{t:'buy',v:'t1'});return {shown,bought,r:g.r,price:QPPRICE.t1}});
  ok('turquoise is for sale in round 1 for 8',r.shown&&r.bought&&r.r===0&&r.price===8,r);
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id;qkR(p,g.r).ca=40;render();const shown=!!document.querySelector('.qpshop [data-k=o6]');const bought=qpChoose(g,id,{t:'buy',v:'o6'});const L=g.pl[id];L.pot=[];L.ws=0;L.start=0;g.phase='brew';qpPlace(g,id,'o6#880');const mv=L.pot[0].at;g.phase='eval';return {shown,bought,price:QPPRICE.o6,mv}});
  ok('orange 6-chip: in the shop with the Herb Witches for 22, moves 6',r.shown&&r.bought&&r.price===22&&r.mv===6,r);
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id],out=[];for(const rats of [0,2,5]){L.pot=[];L.ws=0;L.ex=false;L.stop=false;L.rat=rats;L.start=rats;g.phase='brew';qpPlace(g,id,'t1#990');out.push(L.pot[0].at-L.start)}g.phase='eval';return out});
  ok('turquoise moves 1 more than your rat tails, 4 at most',JSON.stringify(r)==='[1,3,4]',r);
  r=await page.evaluate(()=>({info:qpInfoRows().some(x=>x.k==='t'),chip:qpChipEl('t1').includes('>?<')}));
  ok('turquoise is in the ingredients sheet and shows "?" on the chip',r.info&&r.chip,r);
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,L=g.pl[id];QKX().wit={s:'full',c:'double',g:'bag'};L.bag=['t1#991','t1#992','w1#993'];const okk=qpWitch(g,id,'g');return {okk,n:qkR(p,g.r).wbag}});
  ok('the gold "points for your bag" witch counts turquoise',r.okk&&r.n===2,r);

  // --- the copy side of the turquoise book ---
  r=await page.evaluate(()=>{QKX().bk.turquoise='tCopy';QKX().bk.red='r3';const g=S.qpg,id=act()[0].id,L=g.pl[id],res={};g.phase='brew';
    const put=(pot,c)=>{L.pot=pot.map((x,i)=>({c:x,at:i+1}));L.ws=pot.filter(x=>x[0]==='w').reduce((a,x)=>a+qpV(x),0);L.ex=false;L.stop=false;L.start=0;qpPlace(g,id,c);return L.pot[L.pot.length-1]};
    let e=put(['w1#1','r4#2'],'t1#3');res.red4={as:e.as,moved:e.at-2};
    e=put(['r2#4','w1#5'],'t1#6');res.skipWhite=e.as;
    e=put(['w1#7','w2#8'],'t1#9');res.none={as:e.as||null,moved:e.at-2};
    L.pot=[{c:'g1#10',at:1}];put(['g1#10'],'t1#11');const pot=qpPotEl(L);res.ring=pot.includes('tcopy');
    g.phase='eval';return res});
  ok('copy side: turquoise after a red 4 becomes a red 4 and moves 4',r.red4.as==='r4'&&r.red4.moved===4,r);
  ok('copy side: whites are skipped (copies the red 2 before the white)',r.skipWhite==='r2',r);
  ok('copy side: with no colored chip yet it is a turquoise 1-chip',r.none.as===null&&r.none.moved===1,r);
  ok('copy side: the copied chip shows ringed in turquoise in the pot',r.ring,r);
  // --- bots keep the flask for when they are close to exploding ---
  r=await page.evaluate(()=>({early:qpFlaskNow({lim:7,ws:3},3,'normal'),mid:qpFlaskNow({lim:7,ws:4},2,'normal'),close:qpFlaskNow({lim:7,ws:6},3,'normal'),edge:qpFlaskNow({lim:7,ws:7},1,'hard')}));
  ok('bots don’t use the flask on an early white',!r.early&&!r.mid,r);ok('bots use the flask when close to exploding',r.close&&r.edge,r);
  // --- pennies in the shop and by your pot ---
  r=await page.evaluate(()=>{render();return {wallet:!!document.querySelector('.qpwallet.w3 .qpw.pn')}});ok('pennies show next to coins and rubies at scoring',r.wallet,r);
  ok('no page errors',!errs.length,errs.slice(0,3));
  await done(b)})();
