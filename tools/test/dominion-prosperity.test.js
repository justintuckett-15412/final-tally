// Dominion Prosperity on the phone: set switch, Platinum and Colony option, playing Treasures by hand
// (order matters, Play all), Grand Market blocked by a Copper in play, War Chest naming on pass-and-play, VP tokens shown, full bot game.
const {mk,W,ok,done,chromium}=require('./link.js');
const click=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.offsetParent!==null);if(b){b.click();return true}return false},sel);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;document.querySelector('[data-a="dnstart"][data-k="1"]').click()});await W(400);
  ok('Prosperity: set switch',await P.evaluate(()=>!!document.querySelector('[data-a="dnks"][data-k="prosperity"]')));
  ok('Prosperity: Platinum and Colony choice',await P.evaluate(()=>document.querySelectorAll('[data-a="dnpc"]').length===3));
  await click(P,'[data-a="dnpc"][data-k="on"]');await W(100);
  await P.evaluate(()=>{DNX().ev=[];DNX().evm='none';DNX().kd=['bank','grandmarket','warchest','monument','kingscourt','village','smithy','crystalball','hoard','workersv'];S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i]||'';p.bot=null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1500);
  ok('Prosperity: Platinum and Colony in the Supply',await P.evaluate(()=>!!document.querySelector('[data-a="dnppile"][data-k="platinum"]')&&!!document.querySelector('[data-a="dnppile"][data-k="colony"]')&&dnG().sup.colony===8));
  const ids=await P.evaluate(()=>act().map(p=>p.id));
  await P.evaluate(([a,b])=>{const g=dnG();g.me[a].h=['copper','gold','bank','silver','estate'];Object.assign(g,{turn:a,ph:'buy',A:0,B:1,co:1,k:[],ask:null,bought:0});DNVIEW=a;render()},ids);await W(200);
  ok('Buy phase: Treasures glow to be played by hand',await P.evaluate(()=>document.querySelectorAll('.dnhand.mine .dnc.go').length===4&&!!document.querySelector('[data-a="dnpallt"]')));
  await P.screenshot({path:'/tmp/dnp-buy.png'});
  for(const k of ['gold','silver'])await P.evaluate(k=>[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].find(b=>b.dataset.lp==='dnc:'+k).click(),k);await W(200);
  ok('Grand Market buyable with no Copper played',await P.evaluate(()=>!!document.querySelector('[data-a="dnppile"][data-k="grandmarket"].go')));
  await P.evaluate(()=>[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].find(b=>b.dataset.lp==='dnc:copper').click());await W(200);
  ok('Copper played: Grand Market no longer glows',await P.evaluate(()=>!document.querySelector('[data-a="dnppile"][data-k="grandmarket"].go')));
  await click(P,'[data-a="dnpallt"]');await W(200);
  ok('Play all: Bank last counts 4 Treasures → 11 coins',await P.evaluate(()=>dnG().co===11));
  // War Chest: Kim names a card on pass-and-play
  await P.evaluate(([a,b])=>{const g=dnG();g.me[a].h=['warchest'];Object.assign(g,{turn:a,ph:'buy',A:0,B:1,co:0,k:[],ask:null,bought:0,wcn:[]});DNVIEW=a;render()},ids);await W(150);
  await P.evaluate(()=>document.querySelector('.dnhand.mine [data-lp="dnc:warchest"]').click());await W(250);
  ok('War Chest: hand-off to Kim to name a card',await P.evaluate(([a,b])=>dnActor(dnG())===b&&!!document.querySelector('[data-a="dnpshow"][data-k="'+b+'"]'),ids));
  await click(P,'[data-a="dnpshow"]');await W(150);await click(P,'[data-a="dnpname"][data-k="duchy"]');await W(250);
  ok('War Chest: back to Justin, Duchy not allowed',await P.evaluate(([a,b])=>{const g=dnG();return dnActor(g)===a&&g.ask&&g.ask.k==='gain'&&!g.ask.ok.includes('duchy')},ids));
  await P.screenshot({path:'/tmp/dnp-wc.png'});
  await click(P,'[data-a="dnpshow"]');await W(150);
  await P.evaluate(()=>document.querySelector('[data-a="dnppile"][data-k="monument"]').click());await W(100);await click(P,'[data-a="dnpgain"]');await W(200);
  ok('War Chest: gained Monument',await P.evaluate(([a])=>dnAll(dnG().me[a]).includes('monument'),ids));
  await P.evaluate(([a])=>{const g=dnG();g.me[a].vp=3;render()},ids);await W(100);
  ok('VP tokens shown',await P.evaluate(()=>/VP token/.test(document.body.textContent)));
  await P.evaluate(()=>{act().forEach(p=>p.bot='normal');render()});
  for(let i=0;i<500&&await P.evaluate(()=>dnG().phase!=='done');i++)await W(200);
  ok('Prosperity: a full game ends',await P.evaluate(()=>dnG().phase==='done'));
  ok('Score sheet has Colonies and VP tokens',await P.evaluate(()=>act().every(p=>total(p)===dnVP(dnG().me[p.id]))));
  ok('no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
