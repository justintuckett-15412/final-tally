// Dominion Alchemy on the phone: Alchemy switch, Potion pile and cost badge, buying with a Potion, Possession by tapping
// (your phone shows their hand and runs their turn), pass-and-play hand-off during Possession, then a full game with bots.
const {mk,W,ok,done,chromium}=require('./link.js');
const click=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.offsetParent!==null);if(b){b.click();return true}return false},sel);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;document.querySelector('[data-a="dnstart"][data-k="1"]').click()});await W(400);
  ok('Alchemy: set switch',await P.evaluate(()=>!!document.querySelector('[data-a="dnks"][data-k="alchemy"]')));
  await P.evaluate(()=>{DNX().kd=['possession','familiar','golem','university','herbalist','apothecary','smithy','village','market','chapel'];S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i]||'';p.bot=null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1500);
  ok('Alchemy: Potion pile in the Supply, flask on costs',await P.evaluate(()=>!!document.querySelector('[data-a="dnppile"][data-k="potion"]')||!!dnG()&&dnG().sup.potion===16));
  const ids=await P.evaluate(()=>act().map(p=>p.id));
  // Justin plays Possession (pass-and-play): set up and show Justin
  await P.evaluate(([a,b])=>{const g=dnG();g.me[a].h=['possession','estate'];g.me[a].dk=Array(10).fill('estate');g.me[b].h=['smithy','gold','gold','silver','copper'];g.me[b].dk=Array(8).fill('estate');Object.assign(g,{turn:a,ph:'action',A:1,B:1,co:0,k:[],ask:null,dnx:[],dkeep:[],poss:null,possQ:[]});DNVIEW=a;render()},ids);await W(200);
  ok('Alchemy UI: flask badge on Possession',await P.evaluate(()=>!!document.querySelector('[data-lp="dnc:possession"] .dnpo')));
  await P.evaluate(()=>{const b=[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].find(b=>b.dataset.lp==='dnc:possession');b.click()});await W(80);await click(P,'[data-a="dnpplay"]');await W(150);
  await P.evaluate(()=>{dnEndTurn(dnG(),act()[0].id);render()});await W(300);
  ok('Possession: Kim’s extra turn stays with Justin (no hand-off)',await P.evaluate(([a,b])=>{const g=dnG();return g.poss&&g.turn===b&&dnActor(g)===a&&!document.querySelector('[data-a="dnpshow"]')},ids));
  ok('Possession UI: Justin sees Kim’s hand',await P.evaluate(()=>/Kim’s hand \(you’re in control\)/.test(document.body.textContent)&&[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].some(b=>b.dataset.lp==='dnc:gold')));
  await P.screenshot({path:'/tmp/dna-poss.png'});
  await P.evaluate(()=>{const b=[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].find(b=>b.dataset.lp==='dnc:smithy');b.click()});await W(80);await click(P,'[data-a="dnpplay"]');await W(200);
  await P.evaluate(()=>document.querySelector('[data-a="dnppile"][data-k="province"]').click());await W(100);await click(P,'[data-a="dnpbuy"]');await W(300);
  ok('Possession: the Province went to Justin',await P.evaluate(([a,b])=>{const g=dnG();return dnAll(g.me[a]).includes('province')&&!dnAll(g.me[b]).includes('province')},ids));
  ok('Possession: then Kim’s own turn',await P.evaluate(([a,b])=>{const g=dnG();return g.turn===b&&!g.poss},ids));
  await P.evaluate(()=>{act().forEach(p=>p.bot='normal');render()});
  for(let i=0;i<400&&await P.evaluate(()=>dnG().phase!=='done');i++)await W(200);
  ok('Alchemy: a full game ends',await P.evaluate(()=>dnG().phase==='done'));
  ok('Alchemy: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
