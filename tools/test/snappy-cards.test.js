// Snappier linked moves in a card game: the guest's Hearts pass and card plays show right away, and the host agrees.
const {mk,W,ok,done,chromium}=require('./link.js');
const until=async(p,fn,ms=8000,arg=null)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return Date.now()-t;await W(15)}return -1};
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{switchGame('hearts');resetScores();HTX().play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Brad','Bot A','Bot B','Bot C'][i]||'';if(i)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id]});
  await H.evaluate(()=>{window.__htfast=1;lkHostStart()});await W(3000);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(()=>lkPick(null));
  await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[0]);await W(3000);
  const me=ids[0];
  // the pass (if this hand passes)
  if(await G.evaluate(()=>S.htg.phase==='pass')){
    const cs=await G.evaluate(id=>S.htg.h[id].slice(0,3),me);await G.evaluate(([id,cs])=>{lkq('htPass',id,cs);save();render()},[me,cs]);
    const t=await until(G,([id,cs])=>![...document.querySelectorAll('[data-c]')].some(e=>cs.includes(e.dataset.c)&&e.closest('.hand,.htHand,.myhand,.ho'))||document.body.innerText.includes('Waiting'),3000,[me,cs]);
    ok('pass shows on the guest right away',t>=0&&t<400,{t})}
  let plays=0,fast=0,slow=[],seenPre=0;
  for(let k=0;k<200&&plays<6;k++){
    const mine=await G.evaluate(id=>S.htg&&S.htg.phase==='play'&&S.htg.turn===id&&!lkPending().length,me);
    if(mine){const c=await G.evaluate(id=>htLegal(S.htg,id)[0],me);const n0=await G.evaluate(id=>(S.htg.h[id]||[]).length,me);
      const pre=await G.evaluate(c=>!!document.querySelector(`[data-a][data-c="${c}"]`),c);if(pre)seenPre++;
      await G.evaluate(([id,c])=>{lkq('htPlay',id,c);save();render()},[me,c]);
      // measure: the guest's drawn hand no longer has that card (what you'd see), well before the host's reply
      const t=await until(G,c=>!document.querySelector(`[data-a][data-c="${c}"]`)||!!document.querySelector(`.kttable [data-c="${c}"],.ktpile [data-c="${c}"]`),3000,c);
      plays++;if(t>=0&&t<300)fast++;else slow.push(t);
      await until(G,([id,n])=>(S.htg.h[id]||[]).length<n||S.htg.phase!=='play',8000,[me,n0])}
    await W(100)}
  ok('the cards were in the guest\u2019s hand before each play',seenPre===plays,{seenPre,plays});
  ok('guest played several cards',plays>=3,{plays});
  ok('each card left the guest’s hand right away (under 300 ms)',plays>0&&fast===plays,{fast,plays,slow});
  await W(3000);
  const same=async()=>JSON.stringify(await H.evaluate(()=>S.htg&&[S.htg.r,S.htg.h,S.htg.trick]))===JSON.stringify(await G.evaluate(()=>S.htg&&[S.htg.r,S.htg.h,S.htg.trick]));
  ok('both phones agree on the game afterwards',await same());
  ok('no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
