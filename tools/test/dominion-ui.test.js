// Dominion on the phone: setup (play mode, kingdom picker), a tap-through game against a computer player,
// a Militia answered from the hand, pass-and-play hand-off, and the final reveal.
const {mk,W,ok,done,chromium}=require('./link.js');
const click=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.offsetParent!==null);if(b){b.click();return true}return false},sel);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;document.querySelector('[data-a="dnstart"][data-k="1"]').click()});await W(400);
  ok('Dominion play: setup shows the kingdom',await P.evaluate(()=>S.game==='dominion'&&dnOn()&&document.querySelectorAll('[data-a="dnkswap"]').length===10));
  await click(P,'[data-a="dnkfirst"]');await W(150);
  ok('Dominion play: First Game set',await P.evaluate(()=>dnSortKd(dnKd()).join()===dnSortKd(DNPRESET.first).join()));
  const before=await P.evaluate(()=>dnKd().slice());await click(P,'[data-a="dnkswap"]');await W(150);
  ok('Dominion play: tapping a card swaps it',await P.evaluate(b=>{const k=dnKd();return k.length===10&&new Set(k).size===10&&k.filter(x=>!b.includes(x)).length===1},before));
  await P.screenshot({path:'/tmp/dnp-setup.png',fullPage:true});
  await P.evaluate(()=>{DNX().kd=['village','smithy','militia','market','cellar','moat','remodel','workshop','festival','lab'];S.players.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Bot'][i]||'';p.bot=i===1?'normal':null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1500);
  ok('Dominion play: dealt, 5 cards each',await P.evaluate(()=>{const g=dnG();return !!g&&g.ps.every(id=>dnAll(g.me[id]).length>=10)&&g.me[act()[0].id].h.length+g.me[act()[0].id].pl.length>=5}));
  ok('Dominion play: Supply drawn with 17 piles',await P.evaluate(()=>document.querySelectorAll('[data-a="dnppile"]').length===17));
  let myTurns=0,shots=0,answered=0;
  for(let i=0;i<400&&myTurns<6;i++){const st=await P.evaluate(()=>{const g=dnG();if(!g)return {};const me=act()[0].id;return {ph:g.phase,a:dnActor(g),me,turn:g.turn,ask:g.ask&&g.ask.k,gp:g.ph,co:g.co,tn:g.me[me].tn}});
    if(st.ph!=='play')break;if(st.a!==st.me){await W(250);continue}
    if(st.ask==='pick'){/* tap hand cards until the button works */for(let j=0;j<6;j++){if(await P.evaluate(()=>!document.querySelector('[data-a="dnpok"]').disabled))break;await P.evaluate(j=>{const b=document.querySelectorAll('[data-a="dnphand"]:not(.sel)')[0];if(b)b.click()},j);await W(80)}
      if(!shots++)await P.screenshot({path:'/tmp/dnp-ask.png'});await click(P,'[data-a="dnpok"]');answered++;await W(150);continue}
    if(st.ask==='gain'){await click(P,'.dnsup .dnc.go');await W(100);await click(P,'[data-a="dnpgain"]');await W(150);continue}
    if(st.ask){await click(P,'[data-a="dnpyn"],[data-a="dnpdisc"],[data-a="dnpban"],[data-a="dnpsenok"]');await W(150);continue}
    if(st.gp==='action'){const played=await P.evaluate(()=>{const b=document.querySelector('.dnhand.mine .dnc.go');if(!b)return false;b.click();return true});await W(100);
      if(played){if(myTurns===1)await P.screenshot({path:'/tmp/dnp-select.png'});await click(P,'[data-a="dnpplay"]');await W(200);continue}
      await click(P,'[data-a="dnpendact"]');await W(150);continue}
    /* buy phase: best affordable glowing pile by cost */
    if(myTurns===0)await P.screenshot({path:'/tmp/dnp-buy.png'});
    const k=await P.evaluate(()=>{const g=dnG(),c=[...document.querySelectorAll('.dnsup .dnc.go')].map(b=>b.dataset.k).filter(k=>k!=='curse'&&k!=='copper').sort((a,b)=>dnC(b).c-dnC(a).c);return c[0]||null});
    if(k){await P.evaluate(k=>document.querySelector(`[data-a="dnppile"][data-k="${k}"]`).click(),k);await W(100);await click(P,'[data-a="dnpbuy"]');await W(200)}
    else{await click(P,'[data-a="dnpend"]');await W(80);await click(P,'[data-a="dnpend"]');await W(200)}
    myTurns=await P.evaluate(()=>{const g=dnG();return g.me[act()[0].id].tn-(g.turn===act()[0].id?1:0)})}
  ok('Dominion play: six turns played by tapping',myTurns>=6,myTurns);
  ok('Dominion play: deck grew from buying',await P.evaluate(()=>dnAll(dnG().me[act()[0].id]).length>12));
  ok('Dominion play: the bot took turns too',await P.evaluate(()=>dnG().me[act()[1].id].tn>=5));
  await P.screenshot({path:'/tmp/dnp-game.png'});
  // Militia against the human, answered by tapping
  await P.evaluate(()=>{const g=dnG(),[a,b]=g.ps;g.me[b].h.unshift('militia');Object.assign(g,{turn:b,ph:'action',A:1,B:1,co:0,k:[],ask:null});g.me[a].h=['copper','copper','estate','estate','silver'];dnPlay(g,b,0);render()});await W(200);
  ok('Dominion play: Militia asks the human to discard 2',await P.evaluate(()=>{const g=dnG();return g.ask&&g.ask.p===act()[0].id&&g.ask.min===2&&document.body.textContent.includes('Militia: discard 2')}));
  await P.screenshot({path:'/tmp/dnp-militia.png'});
  for(let j=0;j<2;j++){await P.evaluate(()=>{const h=dnG().me[act()[0].id].h;const b=[...document.querySelectorAll('[data-a="dnphand"]:not(.sel)')].find(b=>h[+b.dataset.k]==='estate');if(b)b.click()});await W(100)}
  ok('Dominion play: discarded the Estates',await P.evaluate(()=>{document.querySelector('[data-a="dnpok"]').click();const M=dnG().me[act()[0].id];return M.h.length===3&&!M.h.includes('estate')}));
  // card sheet
  await W(300);await P.evaluate(()=>{document.querySelector('[data-a="dnppile"][data-k="lab"]').click()});await W(150);
  ok('Dominion play: tapping a Supply card shows its text',await P.evaluate(()=>!!document.querySelector('.dnsheet .dnbigc .dnx')));
  await P.screenshot({path:'/tmp/dnp-sheet.png'});await click(P,'[data-a="dnpclose"]');
  // finish fast: let the bots play out
  await P.evaluate(()=>{act()[0].bot='normal';render()});
  for(let i=0;i<300&&await P.evaluate(()=>dnG().phase!=='done');i++)await W(200);
  ok('Dominion play: game ends',await P.evaluate(()=>dnG().phase==='done'));
  ok('Dominion play: score sheet filled from the decks',await P.evaluate(()=>act().every(p=>total(p)===dnVP(dnG().me[p.id])&&dnF(p,'tu')>0)));
  await P.screenshot({path:'/tmp/dnp-end.png'});
  await click(P,'[data-a="finish"]');await W(400);if(await P.evaluate(()=>!!document.querySelector('[data-a="revstart"]')))await click(P,'[data-a="revstart"]');
  for(let t=0;t<40&&await P.evaluate(()=>S.screen!=='results');t++){await P.evaluate(()=>{const b=[...document.querySelectorAll('[data-a]')].find(b=>/revskip|revend|skip/.test(b.dataset.a)&&b.offsetParent);if(b)b.click()});await W(400)}
  await P.evaluate(()=>{const b=document.querySelector('[data-a="go"][data-s="results"]');if(b)b.click()});await W(300);
  ok('Dominion play: results screen',await P.evaluate(()=>S.screen==='results'&&document.body.textContent.includes('Provinces')));
  // pass-and-play
  await P.evaluate(()=>{switchGame('dominion');resetScores();S.started=false;DNX().play=1;S.players.forEach((p,i)=>{p.on=i<2;p.name=['Mom','Dad'][i]||'';p.bot=null});S.screen='map';save();render();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1200);
  ok('Dominion pass-and-play: hand-off sheet first',await P.evaluate(()=>!!document.querySelector('[data-a="dnpshow"]')&&!document.querySelector('.dnhand.mine')));
  await P.screenshot({path:'/tmp/dnp-pass.png'});
  await click(P,'[data-a="dnpshow"]');await W(200);
  ok('Dominion pass-and-play: hand shows after tapping',await P.evaluate(()=>!!document.querySelector('.dnhand.mine')));
  ok('Dominion play: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
