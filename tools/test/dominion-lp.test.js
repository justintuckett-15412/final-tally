// Dominion: press and hold any card (hand, in play, Supply) to read it; the hold doesn't select or buy anything.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;switchGame('dominion');resetScores();Object.assign(DNX(),{play:1,kd:['village','smithy','militia','market','cellar','moat','remodel','workshop','witch','lab']});S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Bot'][i]||'';p.bot=i?'normal':null});save();const x=document.createElement('button');x.dataset.a='start';document.body.appendChild(x);x.click();x.remove()});await W(1500);
  await P.evaluate(()=>{const g=dnG(),me=act()[0].id;g.me[me].h=['witch','copper','copper','estate','village'];Object.assign(g,{turn:me,ph:'action',A:1,B:1,co:0,k:[],ask:null});render()});await W(200);
  const hold=async sel=>{await P.evaluate(()=>{LPTIP=null;render()});await P.evaluate(s=>{const e=document.querySelector(s);if(e)e.scrollIntoView({block:'center'})},sel);await W(150);const el=await P.$(sel);if(!el)return '';const bx=await el.boundingBox();await P.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);await P.mouse.down();await W(700);await P.mouse.up();await W(250);return P.evaluate(()=>{const s=document.querySelector('.lpsheet');return s?s.textContent:''})};
  const h=await hold('.dnhand.mine [data-lp="dnc:witch"]');ok('Dominion hold: a hand card shows its text',h.includes('Each other player gains a Curse')&&h.includes('Action – Attack'),h.slice(0,150));
  ok('Dominion hold: holding didn’t select the card',await P.evaluate(()=>DNHSEL==null));
  await P.screenshot({path:'/tmp/dn-lp.png'});
  const s=await hold('.dnsup [data-lp="dnc:lab"]');ok('Dominion hold: a Supply card shows its text and count',s.includes('+2 Cards, +1 Action')&&s.includes('left in the Supply'),s.slice(0,150));
  ok('Dominion hold: holding didn’t open the buy sheet',await P.evaluate(()=>!DNPILE));
  await W(800);await P.evaluate(()=>{LPTIP=null;render();document.querySelector('.dnhand.mine [data-a="dnphand"][data-lp="dnc:village"]').click()});await W(300);
  const pl=await hold('.dnplay [data-lp="dnc:village"]');ok('Dominion hold: a card in play shows its text',pl.includes('+1 Card, +2 Actions'),pl.slice(0,150));
  await W(800);ok('Dominion hold: a quick tap on an Action plays it',await P.evaluate(()=>{LPTIP=null;render();document.querySelector('.dnhand.mine [data-lp="dnc:witch"]').click();const g=dnG();return g.me[g.turn].pl.includes('witch')}));
  ok('Dominion hold: no page errors',errs.length===0,errs);
  await done(browser)})();
