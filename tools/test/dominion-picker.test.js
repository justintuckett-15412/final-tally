// Dominion setup: press and hold a kingdom card to pick its replacement (search, sort), "Choose all 10", and
// Duration cards on their second half shown sideways in play.
const {mk,W,ok,done,chromium}=require('./link.js');
const click=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.offsetParent!==null);if(b){b.click();return true}return false},sel);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;document.querySelector('[data-a="dnstart"][data-k="1"]').click()});await W(400);
  await P.evaluate(()=>{DNX().ks={base:1,intrigue:1,seaside:1,alchemy:1,prosperity:1};DNX().kd=['cellar','chapel','moat','village','smithy','market','lab','witch','festival','mine'];render()});await W(200);
  const hold=async sel=>{const el=await P.$(sel);const bx=await el.boundingBox();await P.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await P.mouse.down();await W(700);await P.mouse.up();await W(250)};
  await P.evaluate(()=>document.querySelector('[data-lp="dnkp:smithy"]').scrollIntoView({block:'center'}));await hold('[data-lp="dnkp:smithy"]');
  ok('Picker opens on press and hold',await P.evaluate(()=>/Replace Smithy/.test(document.body.textContent)&&document.querySelectorAll('.dnkpi').length===203));
  ok('Holding didn’t swap the card',await P.evaluate(()=>dnKd().includes('smithy')));
  await P.fill('[data-dnkq]','wit');await P.dispatchEvent('[data-dnkq]','input');await W(150);
  ok('Search filters (Witch, Sea Witch, Young Witch, Witch’s Hut)',await P.evaluate(()=>[...document.querySelectorAll('.dnkpi')].filter(e=>e.style.display!=='none').length===4));
  await P.screenshot({path:'/tmp/dnk-pick.png'});
  await P.fill('[data-dnkq]','');await P.dispatchEvent('[data-dnkq]','input');await click(P,'[data-a="dnksort"][data-k="cost"]');await W(150);
  ok('Sort by cost',await P.evaluate(()=>{const k=[...document.querySelectorAll('.dnkpi [data-a="dnkpick"]')].map(b=>b.dataset.k);return dnC(k[0]).c===0&&dnC(k[k.length-1]).c>=6}));
  await click(P,'[data-a="dnkpick"][data-k="witch"]');await W(150);
  ok('Picking a card already in the kingdom is refused',await P.evaluate(()=>dnKd().includes('smithy')&&!!LPTIP));
  await click(P,'[data-a="dnkpick"][data-k="courtyard"]');await W(200);
  ok('Pick replaces Smithy with Courtyard',await P.evaluate(()=>dnKd().includes('courtyard')&&!dnKd().includes('smithy')&&!LPTIP));
  await click(P,'[data-a="dnkall"]');await W(150);await click(P,'[data-a="dnkclr"]');await W(100);
  for(const k of ['haven','caravan','wharf'])await click(P,`[data-a="dnkpick"][data-k="${k}"]`);await W(100);
  ok('Choose all 10: Done waits for 10',await P.evaluate(()=>document.querySelector('[data-a="dnkdone"]').disabled));
  await click(P,'[data-a="dnkfill"]');await W(100);await click(P,'[data-a="dnkdone"]');await W(150);
  ok('Choose all 10: kept the three and filled to 10',await P.evaluate(()=>{const k=dnKd();return k.length===10&&['haven','caravan','wharf'].every(x=>k.includes(x))}));
  // second half of a Duration shown sideways
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Bot'][i]||'';p.bot=i?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1200);
  await P.evaluate(()=>{const g=dnG(),[a,b]=g.ps;g.me[a].h=['caravan'];g.me[a].dk=Array(12).fill('estate');act()[1].bot=null;Object.assign(g,{turn:a,ph:'action',A:1,B:1,co:0,k:[],ask:null,dnx:[],dkeep:[]});dnPlay(g,a,0);dnEndTurn(g,a);dnEndTurn(g,b);DNVIEW=a;render()});await W(200);
  ok('Duration on its second half is sideways',await P.evaluate(()=>!!document.querySelector('.dnplay .dnrot[data-lp="dnc:caravan"]')));
  await P.screenshot({path:'/tmp/dnk-rot.png'});
  ok('no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
