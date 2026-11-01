// Dominion on two linked phones plus a computer player: moves go through the host, shuffles wait for the host,
// each phone only shows its own hand, both phones stay in step and reach the end with the same scores.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const tap=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true');if(b){b.click();return true}return false},sel);
async function step(P){const st=await P.evaluate(()=>{const g=S.dng;if(!g||!S.lk)return null;const V=dnViewer();if(!V)return null;return {ph:g.phase,mine:dnActor(g)===V.id,ask:g.ask&&g.ask.k,gp:g.ph,wait:lkqWaiting(),sheet:!!DNPILE}});
  if(!st||!st.mine||st.wait||st.ph!=='play')return false;
  if(st.sheet){if(await tap(P,'[data-a="dnpbuy"]')||await tap(P,'[data-a="dnpgain"]'))return true;return tap(P,'[data-a="dnpclose"]')}
  if(st.ask==='pick'){for(let j=0;j<6;j++){if(await P.evaluate(()=>!document.querySelector('[data-a="dnpok"]').disabled))break;await P.evaluate(()=>{const b=document.querySelector('[data-a="dnphand"]:not(.sel):not(.dim)');if(b)b.click()});await W(40)}return tap(P,'[data-a="dnpok"]')}
  if(st.ask==='gain')return tap(P,'.dnsup .dnc.go');
  if(st.ask==='opts'){await P.evaluate(()=>{const Q=dnG().ask;[...document.querySelectorAll('[data-a="dnpopt"]')].slice(0,Q.n).forEach(b=>{const k=b.dataset.k;const x=document.querySelector(`[data-a="dnpopt"][data-k="${k}"]`);if(x)x.click()})});await W(40);return tap(P,'[data-a="dnpoptok"]')||true}
  if(st.ask==='order'){await P.evaluate(()=>{const n=dnG().ask.cs.length;for(let i=0;i<n;i++){const b=document.querySelector(`[data-a="dnpord"][data-k="${i}"]`);if(b)b.click()}});await W(40);return tap(P,'[data-a="dnpordok"]')}
  if(st.ask)return tap(P,'[data-a="dnpyn"],[data-a="dnpdisc"],[data-a="dnpban"],[data-a="dnpsenok"],[data-a="dnptp"],[data-a="dnppos"],[data-a="dnpname"]');
  if(st.gp==='action'){if(await P.evaluate(()=>DNHSEL!=null))return tap(P,'[data-a="dnpplay"]')||tap(P,'[data-a="dnpendact"]');if(await tap(P,'.dnhand.mine .dnc.go'))return true;return tap(P,'[data-a="dnpendact"]')}
  const k=await P.evaluate(()=>{const c=[...document.querySelectorAll('.dnsup .dnc.go')].map(b=>b.dataset.k).filter(k=>k!=='curse'&&k!=='copper').sort((a,b)=>dnC(b).c-dnC(a).c);return c[0]||null});
  if(k)return P.evaluate(k=>{document.querySelector(`[data-a="dnppile"][data-k="${k}"]`).click();return true},k);
  await tap(P,'[data-a="dnpend"]');return tap(P,'[data-a="dnpend"]')}
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate((INTR)=>{window.__htfast=1;switchGame('dominion');resetScores();Object.assign(DNX(),{play:1,kd:INTR?['masquerade','torturer','swindler','minion','courtier','pawn','patrol','secretp','wishing','diplomat']:['village','smithy','militia','market','cellar','moat','remodel','workshop','witch','lab']});const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Duke Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]},!!process.env.INTR);
  await G.evaluate(()=>{window.__htfast=1});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);
  if(readyAll)await readyAll([H,G]);
  ok('Dominion linked: host dealt the game',await H.evaluate(()=>!!S.dng&&S.dng.phase==='play'));
  ok('Dominion linked: guest sees the same Supply',await G.evaluate(()=>!!S.dng&&document.querySelectorAll('[data-a="dnppile"]').length===17));
  ok('Dominion linked: each phone shows only its own hand',await G.evaluate(()=>dnViewer()&&dnViewer().id===S.lk.me&&document.querySelectorAll('.dnhand.mine').length===1));
  let hm=0,gm=0,lastK='',same=0;
  for(let t=0;t<(process.env.FULL?9000:2500);t++){if(await step(H))hm++;if(await step(G))gm++;await W(60);
    if(t%50===0){const k=await H.evaluate(()=>{const g=S.dng;return JSON.stringify([g.phase,dnActor(g),g.n])});same=k===lastK?same+1:0;lastK=k;if(same>=5){console.log('DBG stuck',k,await G.evaluate(()=>JSON.stringify([S.dng.phase,dnActor(S.dng),S.dng.n,lkqWaiting(),S.dng.ask])));break}}
    if(await H.evaluate(full=>S.dng&&(S.dng.phase==='done'||!full&&S.dng.ps.every(id=>S.dng.me[id].tn>=6)),!!process.env.FULL))break}
  await W(3000);
  const hs=await H.evaluate(()=>({ph:S.dng.phase,tn:S.dng.ps.map(id=>S.dng.me[id].tn),d:JSON.stringify(S.dng.me)})),gs=await G.evaluate(()=>({ph:S.dng.phase,tn:S.dng.ps.map(id=>S.dng.me[id].tn),d:JSON.stringify(S.dng.me)}));
  ok('Dominion linked: both phones moved',hm>10&&gm>10,{hm,gm});
  ok(process.env.FULL?'Dominion linked: game reaches the end':'Dominion linked: 6 turns each',process.env.FULL?hs.ph==='done':hs.tn.every(n=>n>=6),hs.tn);
  ok('Dominion linked: both phones have the same decks',hs.d===gs.d);
  ok('Dominion linked: no page errors',errs.length===0,errs.slice(0,3));
  await done(browser)})();
