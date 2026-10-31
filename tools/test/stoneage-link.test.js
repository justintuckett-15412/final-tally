// Stone Age play mode on two linked phones plus a computer player: every move goes through the host,
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
// both phones stay in step, the game reaches the end, and final scoring matches on both.
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true');if(b){b.click();return true}return false},[a,k]);
async function step(P){const st=await P.evaluate(()=>{const g=S.sag;if(!g||!S.lk)return null;const V=saViewer();if(!V)return null;const mine=saActor(g)===V.id||g.phase==='feed'&&(g.fd||{})[V.id];return {ph:g.phase,mine,roll:!!g.roll,pay:!!g.pay,pick:!!g.pick,dc:!!g.dc,sel:SASEL,wait:lkqWaiting()}});
  if(!st||!st.mine||st.wait||st.ph==='done')return false;
  if(st.ph==='place'){if(st.sel)return tap(P,'sapplace');const locs=await P.evaluate(()=>[...document.querySelectorAll('.go[data-a="sapsel"]')].map(b=>b.dataset.k));
    const pick=['b0','b1','c0','field','hunt','tools','forest','clay','quarry','river'].find(l=>locs.includes(l))||locs[0];return pick?tap(P,'sapsel',pick):false}
  if(st.ph==='act'){if(st.dc)return tap(P,'sapdie');if(st.roll){await tap(P,'saptool');return tap(P,'saptake')}if(st.pay){if(await tap(P,'sappay'))return true;return tap(P,'sapskip')}
    if(st.pick){await tap(P,'sapadj','w:1');await tap(P,'sapadj','w:1');return tap(P,'sapchoose')}return tap(P,'sapres')}
  if(st.ph==='feed'){if(await tap(P,'sapfeed'))return true;return tap(P,'sapstarve')}return false}
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;switchGame('stoneage');resetScores();SAX().play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Rock Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{window.__htfast=1});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);
  if(readyAll)await readyAll([H,G]);
  ok('Stone Age linked: host dealt the game',await H.evaluate(()=>!!S.sag&&S.sag.phase==='place'));
  ok('Stone Age linked: guest sees the same board',await G.evaluate(()=>!!S.sag&&S.sag.ps.length===3));
  let guestMoves=0,hostMoves=0,mid=false;
  let lastK='',same=0;for(let t=0;t<(process.env.FULL?8000:2500);t++){if(await step(H))hostMoves++;if(await step(G))guestMoves++;await W(60);
    if(t%50===0){const k=await H.evaluate(()=>{const g=S.sag;return JSON.stringify([g.r,g.phase,saActor(g),g.n])});if(process.env.DBG)console.log('DBG',t,k);same=k===lastK?same+1:0;lastK=k;if(same>=4){console.log('DBG stuck',k,await G.evaluate(()=>JSON.stringify([S.sag.r,S.sag.phase,saActor(S.sag),S.sag.n,lkqWaiting()])));break}}
    if(!mid&&t===40){mid=true;const a=await H.evaluate(()=>JSON.stringify(S.sag.me)),b=await G.evaluate(()=>JSON.stringify(S.sag.me));0}
    if(await H.evaluate(full=>S.sag&&(S.sag.phase==='done'||!full&&S.sag.r>=3),!!process.env.FULL))break}
  await W(3000);
  const hs=await H.evaluate(()=>({ph:S.sag.phase,r:S.sag.r,t:act().map(p=>total(p))})),gs=await G.evaluate(()=>({ph:S.sag.phase,r:S.sag.r,t:act().map(p=>total(p))}));
  ok('Stone Age linked: both phones moved',hostMoves>5&&guestMoves>5,{hostMoves,guestMoves});
  ok(process.env.FULL?'Stone Age linked: game reaches the end':'Stone Age linked: 3 rounds played',process.env.FULL?hs.ph==='done':hs.r>=3,hs);
  ok('Stone Age linked: both phones show the same round and scores',JSON.stringify(hs)===JSON.stringify(gs),{hs,gs});
  const hv=await H.evaluate(()=>JSON.stringify(S.sag.me)),gv=await G.evaluate(()=>JSON.stringify(S.sag.me));ok('Stone Age linked: both phones have the same villages',hv===gv);
  ok('Stone Age linked: no page errors',errs.length===0,errs.slice(0,5));
  await done(browser)})();
