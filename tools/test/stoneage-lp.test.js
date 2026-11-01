// Stone Age: press and hold a board spot, Civilization card, hut or the mammoth herd to read what it does.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;switchGame('stoneage');resetScores();Object.assign(SAX(),{play:1,exp:1,bonus:1,mix:'none',mam:1});S.players.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Rock'][i]||'';p.bot=i?'normal':null});save();const x=document.createElement('button');x.dataset.a='start';document.body.appendChild(x);x.click();x.remove()});await W(2500);
  const hold=async sel=>{await P.evaluate(()=>{LPTIP=null;render()});await P.evaluate(s=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block:'center'})},sel);await W(150);const el=await P.$(sel);if(!el)return '';const bx=await el.boundingBox();await P.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await P.mouse.down();await W(700);await P.mouse.up();await W(200);return P.evaluate(()=>{const s=document.querySelector('.lpsheet');return s?s.textContent:''})};
  const f=await hold('[data-lp="sat:forest"]');ok('Stone Age hold: Forest explains gathering',f.includes('every 3 pips = 1 wood')&&f.includes('With 3 players'),f.slice(0,200));
  ok('Stone Age hold: the turn card is hidden behind the sheet',await P.evaluate(()=>!document.querySelector('.sadock')));
  const c=await hold('[data-lp^="sac:"]');ok('Stone Age hold: a card shows both halves and end scoring',c.includes('Top · right away')&&c.includes('Bottom · end of game')&&c.includes('Farmers')&&c.includes('Tool makers')&&c.includes('Builders')&&c.includes('Shamans'),c.slice(0,200));
  const h=await hold('[data-lp^="sah:"]');ok('Stone Age hold: a hut shows its cost and points',h.includes('Cost and points'),h.slice(0,200));
  const m=await hold('[data-lp="sam"]');ok('Stone Age hold: mammoth herd rules',m.includes('Highest single die wins'));
  const v=await hold('[data-lp="sat:field"]');ok('Stone Age hold: field and the village limit',v.includes('+1 agriculture')&&v.includes('Village limit'),v.slice(0,200));
  ok('Stone Age hold: holding didn’t place anyone',await P.evaluate(()=>!SASEL));
  ok('Stone Age hold: no page errors',errs.length===0,errs);
  await done(browser)})();
