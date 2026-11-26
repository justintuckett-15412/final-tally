// Dominion screen cleanup: sorted and stacked hand, Supply rows with faded unaffordable cards and the end-of-game counter,
// tap an Action to see it big then Play, this turn's ticker and "while you waited", tapping a player to see their deck, game-over breakdown.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;document.querySelector('[data-a="dnstart"][data-k="1"]').click()});await W(400);
  await P.evaluate(()=>{DNX().kd=['village','smithy','market','militia','lab','cellar','chapel','moat','witch','mine'];DNX().pc='off';DNX().ev=[];DNX().evm='none';S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i];p.bot=i===1?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1500);
  const ids=await P.evaluate(()=>act().map(p=>p.id));
  await P.evaluate(([a,k])=>{const g=dnG();g.me[a].h=['copper','estate','village','copper','copper'];g.me[a].dk=Array(8).fill('copper');Object.assign(g,{turn:a,ph:'action',A:1,B:1,co:0,k:[],ask:null});render()},ids);await W(300);
  const hand=await P.evaluate(()=>[...document.querySelectorAll('.dnhand.mine [data-a="dnphand"]')].map(b=>b.dataset.lp.slice(4)+(b.dataset.cnt?'x'+b.dataset.cnt:'')));
  ok('Hand: Actions first, then Treasures, then Victory; Coppers stacked ×3',hand.join()==='village,copperx3,estate',hand);
  ok('Supply: Treasure, Victory and Kingdom rows',await P.evaluate(()=>document.querySelectorAll('.dnrow').length===3));
  ok('Supply: cards you can’t afford are faded',await P.evaluate(()=>!!document.querySelector('[data-a="dnppile"][data-k="province"].dnno')&&!document.querySelector('[data-a="dnppile"][data-k="copper"].dnno')));
  ok('Supply: Provinces left and piles-empty counter',await P.evaluate(()=>/Provinces left · 0 of 3 piles empty/.test(document.querySelector('.dnends').textContent)));
  await P.screenshot({path:'/tmp/dnui2-hand.png',fullPage:true});
  await P.evaluate(()=>document.querySelector('.dnhand.mine [data-lp="dnc:village"]').click());await W(300);
  ok('Tapping an Action shows it big with Play and Cancel, and doesn’t play it yet',await P.evaluate(([a])=>!dnG().me[a].pl.includes('village')&&!!document.querySelector('.dnsheet [data-a="dnpplay"]')&&!!document.querySelector('.dnsheet [data-a="dnphand"][data-k="-1"]'),ids));
  await P.screenshot({path:'/tmp/dnui2-playsheet.png'});
  ok('…and the Play button is on top (not under the turn box)',await P.evaluate(()=>{const b=document.querySelector('.dnsheet [data-a="dnpplay"]');const r=b.getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return b.contains(el)}));
  await P.evaluate(()=>document.querySelector('.dnsheet [data-a="dnphand"][data-k="-1"]').click());await W(200);
  ok('Cancel closes it',await P.evaluate(()=>!document.querySelector('.dnsheet')));
  await P.evaluate(()=>document.querySelector('.dnhand.mine [data-lp="dnc:village"]').click());await W(200);await P.evaluate(()=>document.querySelector('.dnsheet [data-a="dnpplay"]').click());await W(300);
  ok('Play plays it',await P.evaluate(([a])=>dnG().me[a].pl.includes('village')&&dnG().A===2,ids));
  ok('This turn’s ticker shows the play',await P.evaluate(()=>/played Village/.test((document.querySelector('.dntick')||{}).textContent||'')));
  // Kim's turn then back to Justin: "while you waited"
  await P.evaluate(([a,k])=>{const g=dnG();dnEndTurn(g,a);const K=g.me[k];K.h=['militia','copper','copper','copper','copper'];g.A=1;g.ph='action';dnPlay(g,k,0);if(g.ask)dnAns(g,a,[0,1]);dnEndTurn(g,k);DNVIEW=a;render()},ids);await W(400);
  ok('Your turn: “While you waited” recap of Kim’s turn',await P.evaluate(()=>{const d=document.querySelector('.dnrecap');return !!d&&/Kim played Militia/.test(d.textContent)}));
  await P.screenshot({path:'/tmp/dnui2-recap.png',fullPage:true});
  // tap a player
  await P.evaluate(([a,k])=>document.querySelector(`[data-a="dnppeek"][data-k="${k}"]`).click(),ids);await W(300);
  ok('Tap a player: their deck by card with counts',await P.evaluate(()=>{const s=document.querySelector('.dnpeek');return !!s&&/Kim/.test(s.textContent)&&!!s.querySelector('[data-cnt]')}));
  await P.screenshot({path:'/tmp/dnui2-peek.png'});
  await P.evaluate(()=>document.querySelector('.dnpeek [data-a="dnppeekx"]').click());await W(200);
  // game over
  await P.evaluate(()=>{const g=dnG();dnGameOver(g,'Test.');render()});await W(400);
  ok('Game over: point breakdown per player',await P.evaluate(()=>document.querySelectorAll('.dnparts').length===2&&/Estates/.test(document.querySelector('.dnparts').textContent)));
  // Go back, "why not?" and Hints (Nov 26)
  await P.evaluate(()=>{try{localStorage.removeItem('ft-dnhint')}catch(e){}DNHINT=true;dnDeal();const g=dnG(),a=act()[0].id;g.me[a].h=['copper','copper','copper','silver','estate'];g.me[a].dk=Array(8).fill('copper');Object.assign(g,{turn:a,ph:'action',A:1,B:1,co:0,k:[],ask:null,phase:'play'});g.ann=null;DNVIEW=a;save();render()});await W(300);
  const ids2=await P.evaluate(()=>act().map(p=>p.id));
  ok('Dominion why not: an unaffordable pile says how many more coins',await P.evaluate(()=>/Need 3 more coins/.test(document.querySelector('[data-a="dnppile"][data-k="province"]').title)));
  await P.evaluate(()=>document.querySelector('[data-a="dnppile"][data-k="province"]').click());await W(150);
  ok('…and so does its card when you tap it',await P.evaluate(()=>{const w=document.querySelector('.dnsheet .uxwhy');return !!w&&/Need 3 more coins/.test(w.textContent)}));
  await P.evaluate(()=>document.querySelector('.dnsheet [data-a="dnpclose"]').click());await W(100);
  ok('Dominion hints: “What should I buy?” is offered',await P.evaluate(()=>!!document.querySelector('[data-a="dnphint"][data-k="sug"]')));
  await P.evaluate(()=>document.querySelector('[data-a="dnphint"][data-k="sug"]').click());await W(150);
  ok('…5 coins: a sensible suggestion with a reason',await P.evaluate(()=>{const l=document.querySelector('.dnhintl');return !!l&&/Buy/.test(l.textContent)&&l.querySelector('small').textContent.length>10}),await P.evaluate(()=>(document.querySelector('.dnhintl')||{}).textContent));
  ok('…8 coins: Province',await P.evaluate(()=>{const g=dnG();g.me[g.turn].h=['gold','gold','silver'];render();return /Province/.test(document.querySelector('.dnhintl').textContent)}));
  ok('…6 coins: Gold',await P.evaluate(()=>{const g=dnG();g.me[g.turn].h=['gold','silver','copper'];render();return /Gold/.test(document.querySelector('.dnhintl').textContent)}));
  ok('…an Action in hand: what to play',await P.evaluate(()=>{const g=dnG();g.me[g.turn].h=['village','smithy','copper'];render();return /Play Village first/.test(document.querySelector('.dnhintl').textContent)&&/What should I play/.test(document.querySelector('[data-a="dnphint"][data-k="sug"]').title)}));
  await P.evaluate(()=>document.querySelector('.dnhint [data-a="dnphint"][data-k="off"]').click());await W(100);
  ok('…Hide is remembered on this phone',await P.evaluate(()=>!document.querySelector('.dnhint')&&localStorage.getItem('ft-dnhint')==='0'&&!!document.querySelector('[data-a="dnphint"][data-k="on"]')));
  await P.evaluate(()=>document.querySelector('[data-a="dnphint"][data-k="on"]').click());
  await P.evaluate(()=>{const g=dnG();g.me[g.turn].h=['copper','copper','copper','silver','estate'];g.me[g.turn].pl=[];g.B=2;render()});await W(100);
  await P.evaluate(()=>document.querySelector('[data-a="dnppile"][data-k="silver"]').click());await W(120);await P.evaluate(()=>document.querySelector('.dnsheet [data-a="dnpbuy"]').click());await W(150);
  ok('Dominion Go back: appears after buying',await P.evaluate(a=>dnG().me[a].ds.includes('silver')&&!!document.querySelector('.dndock .uxundo'),ids2[0]));
  await P.evaluate(()=>document.querySelector('.dndock .uxundo').click());await W(150);
  ok('…tapping it gives the Silver back, the coins and the Buy',await P.evaluate(a=>{const g=dnG();return !g.me[a].ds.includes('silver')&&g.B===2&&g.ph==='action'&&g.me[a].h.length===5&&!document.querySelector('.uxundo')},ids2[0]));
  await P.evaluate(()=>{const g=dnG();g.me[g.turn].h.push('smithy');g.A=1;render()});
  await P.evaluate(()=>document.querySelector('.dnhand.mine [data-lp="dnc:smithy"]').click());await W(120);await P.evaluate(()=>document.querySelector('.dnsheet [data-a="dnpplay"]').click());await W(150);
  ok('…and drawing cards (Smithy) can’t be taken back',await P.evaluate(a=>dnG().me[a].pl.includes('smithy')&&!document.querySelector('.uxundo'),ids2[0]));
  await P.screenshot({path:'/tmp/dn-ux.png',fullPage:true});
  ok('No page errors',!errs.length,errs.slice(0,3));
  done(browser)})();
