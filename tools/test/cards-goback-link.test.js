// Go back on a linked phone (Spades): the guest takes back a bid; the host agrees; it goes away once the next player bids.
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const tapEl=(p,sel)=>p.evaluate(s=>{const b=document.querySelector(s);if(!b)return false;b.click();return true},sel);
const until=async(p,fn,ms=8000,arg=null)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return true;await W(50)}return false};
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{SET.toursOff=true;switchGame('spades');resetScores();const X=SDX();X.play=true;X.teams=false;X.blind=false;const P=S.players;
    P.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Ben','Bot A','Bot B'][i]||'';if(i>=2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P.slice(0,4).map(p=>p.id)});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);
  await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(3000);await readyAll([H,G]);
  // the first dealer is Ann, so Ben (the guest) bids first; wait until the guest has nothing waiting for the host
  await until(G,()=>!lkPending().length,10000);
  ok('guest’s turn to bid',await until(G,id=>S.sdg&&S.sdg.phase==='bid'&&S.sdg.bidTurn===id&&!!document.querySelector('[data-a="sdbid"][data-k="3"]'),10000,ids[1]));
  await tapEl(G,'[data-a="sdbid"][data-k="3"]');await W(150);await tapEl(G,'[data-a="sdbid"][data-k="3"]');await W(300);
  ok('guest sees Go back after bidding',await until(G,()=>!!document.querySelector('[data-a="sdundo"]'),4000));
  ok('host has the bid',await until(H,id=>S.sdg.bids[id]===3,6000,ids[1]));
  await tapEl(G,'[data-a="sdundo"]');
  ok('host agrees the bid was taken back',await until(H,id=>S.sdg.bids[id]===undefined&&S.sdg.bidTurn===id,6000,ids[1]));
  ok('guest has the bid buttons again',await until(G,()=>!!document.querySelector('[data-a="sdbid"]')&&!document.querySelector('[data-a="sdundo"]'),6000));
  await until(G,()=>!lkPending().length,8000);/* like any move, the next tap waits until the host has the last one */
  await tapEl(G,'[data-a="sdbid"][data-k="2"]');await W(150);await tapEl(G,'[data-a="sdbid"][data-k="2"]');await W(200);
  ok('host has the new bid',await until(H,id=>S.sdg.bids[id]===2,6000,ids[1]));
  ok('after the computer player bids, Go back is gone on the guest',await until(G,id=>S.sdg.bids[act()[2].id]!==undefined&&!document.querySelector('[data-a="sdundo"]'),12000,ids[1]));
  ok('a Go back from the guest now does nothing',await G.evaluate(id=>!lkq('sdUndo',id),ids[1]));
  ok('no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
