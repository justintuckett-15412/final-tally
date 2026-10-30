// Quacks and players-screen fixes: bot names only in their own games; fortune choices before brewing (chips in the bag
// right away); bots wait for everyone's cards; witch pennies shown as coins; a new round scrolls to your pot.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1500);
  const press=(a,k)=>page.evaluate(([a,k])=>{const x=document.createElement('button');x.dataset.a=a;if(k!=null)x.dataset.k=k;x.hidden=true;document.body.appendChild(x);x.click();x.remove()},[a,k]);
  // --- bot names in "Who's playing?" ---
  await page.evaluate(()=>{H.roster=[{id:'r1',name:'Justin',color:'red',family:true},{id:'r2',name:'Rage Bot',color:'yellow',family:true},{id:'r3',name:'Yahtzee Bot',color:'green',family:true},{id:'r4',name:'B',color:'blue',family:true}];
    H.games=[{id:'g1',game:'rage',date:'2026-10-01',players:[],state:{players:[{name:'Justin',rid:'r1'},{name:'Rage Bot',rid:'r2',bot:'hard'}]}},{id:'g2',game:'yahtzee',date:'2026-10-02',players:[],state:{players:[{name:'Yahtzee Bot',rid:'r3',bot:'normal'},{name:'B',rid:'r4'}]}}];RBOT={n:-1,m:null}});
  const chips=g=>page.evaluate(g=>{switchGame(g);S.screen='players';render();return [...document.querySelectorAll('[data-a=rpick]')].map(x=>x.innerText.trim())},g);
  let q=await chips('quacks');ok('Quacks players: people only, no bot names',q.includes('Justin')&&q.includes('B')&&!q.some(n=>/Bot/.test(n)),q);
  let r=await chips('rage');ok('Rage players: no bot names either',r.includes('Justin')&&!r.some(n=>/Bot/.test(n)),r);
  const names=await page.evaluate(()=>{switchGame('quacks');S.screen='players';const out=new Set();for(let k=0;k<12;k++){S.players[1].name='';delete S.players[1].bot;const b=document.createElement('button');b.dataset.a='yzbot';b.dataset.i='1';b.hidden=true;document.body.appendChild(b);b.click();b.remove();out.add(S.players[1].name+'|'+S.players[1].bot)}return [...out]});
  ok('adding a bot gives it a random name',names.length>2&&names.every(n=>n.endsWith('|easy')&&n.split('|')[0]),names);
  ok('Quacks bots never get the Yahtzee bot name',names.every(n=>!/Yahtzee/.test(n)),names);
  // --- fortune choices before brewing ---
  await page.evaluate(()=>{window.__htfast=1;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;X.wit={s:'draw6',c:'double',g:'colors'};const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Me','Bot A','Bot B'][i]||'';if(i)p.bot='normal';else delete p.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove();document.querySelectorAll('[data-a=tourskip]').forEach(b=>b.click())});
  for(let i=0;i<50;i++){if(await page.evaluate(()=>S.qpg&&S.qpg.phase==='brew'))break;await page.evaluate(()=>{const g=S.qpg;if(g&&g.phase==='card'){qpSetCard(g,'');save();render()}});await W(100)}
  await page.evaluate(()=>{const g=S.qpg;(S.qkfc=S.qkfc||[])[g.r]='choose1';g.ps.forEach(id=>{g.pl[id].sf=undefined});qpBrewStart(g);save();render()});await W(300);
  r=await page.evaluate(()=>{const b=document.querySelector('[data-a=qpseen][data-k=sf]');return {shown:!!document.querySelector('.qpfpick'),gotDisabled:!!b&&b.disabled}});
  ok('fortune card shows the choice, Got it waits for it',r.shown&&r.gotDisabled,r);
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id],n0=L.bag.filter(c=>c.startsWith('u2#')).length;document.querySelector('[data-a=qpfc][data-k=chip][data-v=u2]').click();const n1=L.bag.filter(c=>c.startsWith('u2#')).length;
    document.querySelector('[data-a=qpfc][data-k=ruby]').click();const n2=L.bag.filter(c=>c.startsWith('u2#')).length;return {n0,n1,n2,fp:qkR(act()[0],g.r).fp,got:!document.querySelector('[data-a=qpseen][data-k=sf]').disabled}});
  ok('choosing a 2-chip puts it in the bag right away',r.n1===r.n0+1,r);ok('changing your mind takes it back out',r.n2===r.n0&&r.fp==='ruby',r);ok('Got it works once you chose',r.got,r);
  ok('bots made their choice too',await page.evaluate(()=>act().slice(1).every(p=>qkR(p,S.qpg.r).fp!=null)));
  // --- bots wait for the cards ---
  await W(2500);ok('bots don’t brew while your card is up',await page.evaluate(()=>act().slice(1).every(p=>S.qpg.pl[p.id].pot.length===0)));
  await page.evaluate(()=>document.querySelector('[data-a=qpseen][data-k=sf]').click());
  let started=false;for(let i=0;i<80&&!started;i++){await W(150);started=await page.evaluate(()=>act().slice(1).some(p=>S.qpg.pl[p.id].pot.length>0))}
  ok('bots start brewing after the cards go away',started);
  // --- witch coins while brewing ---
  r=await page.evaluate(()=>({cards:document.querySelectorAll('.qwboard .qwcard img').length,small:document.querySelectorAll('.qpwchips').length,ready:!!document.querySelector('.qwboard .qwcard.ready')}));
  ok('the witches board shows all 3 witches while brewing',r.cards===3,r);ok('other players show their pennies by their names',r.small>=2,r);ok('a usable witch is highlighted',r.ready,r);
  await page.evaluate(()=>document.querySelector('.qwboard .qwcard.ready').click());await W(200);
  ok('a used witch shows as in use',await page.evaluate(()=>!!document.querySelector('.qwboard .qwcard.on')));
  // --- next round scrolls to your pot ---
  await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;g.pl[id].d6&&g.pl[id].d6.length&&qpD6(g,id,null);qpStop(g,id);save();render()});
  for(let i=0;i<100;i++){if(await page.evaluate(()=>S.qpg.phase==='eval'))break;await W(150)}
  await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;qpChoose(g,id,{t:'done'});save();render();window.scrollTo(0,document.body.scrollHeight)});
  for(let i=0;i<100;i++){if(await page.evaluate(()=>S.qpg.r===1&&S.qpg.phase==='brew'))break;await W(150)}
  await page.evaluate(()=>{const g=S.qpg,L=g.pl[act()[0].id];if(qpFNeeds(g.r))qpFP2(g,act()[0].id,qkCid(g.r)==='goodstart'?0:qkCid(g.r)==='wisely'?'drop':qkCid(g.r)==='wheel'?'no':'vp');L.sf=true;save();render()});await W(1200);
  ok('round 2 brewing scrolls to your pot',await page.evaluate(()=>{const e=document.querySelector('.qpme');if(!e)return false;const t=e.getBoundingClientRect().top;return t>-40&&t<300}),await page.evaluate(()=>{const e=document.querySelector('.qpme');return e&&e.getBoundingClientRect().top}));
  ok('no page errors',!errs.length,errs.slice(0,4));
  await done(b)})();
