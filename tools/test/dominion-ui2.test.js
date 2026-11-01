// Dominion screen cleanup: sorted and stacked hand, Supply rows with faded unaffordable cards and the end-of-game counter,
// one tap to play an Action, this turn's ticker and "while you waited", tapping a player to see their deck, game-over breakdown.
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
  ok('One tap plays an Action',await P.evaluate(([a])=>dnG().me[a].pl.includes('village')&&dnG().A===2,ids));
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
  ok('No page errors',!errs.length,errs.slice(0,3));
  done(browser)})();
