// Stone Age through the screen: a person plays whole games by tapping only what is on screen (random but sensible taps),
// against computer players and in pass-and-play. Every step must offer a way forward, and games must finish.
const {mk,W,ok,done,chromium}=require('./link.js');
const G=+(process.env.N||3);
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  for(let gi=0;gi<G;gi++){const humans=gi%3===2?2:1,n=2+gi%3;
    await P.evaluate(([n,h])=>{window.__htfast=1;switchGame('stoneage');resetScores();SAX().play=1;S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cat','Dan'][i]||'';if(i>=h&&i<n)p.bot='normal';else delete p.bot});S.started=true;S.finished=false;S.screen='score';delete S.sag;save();render()},[n,humans]);
    let stuck=0,taps=0,lastN=-1,why='';
    for(let t=0;t<6000;t++){await W(25);
      const st=await P.evaluate(()=>{const g=S.sag;if(!g)return {wait:1};document.querySelectorAll('.sheet-bg [data-a="glok"],.sheet-bg [data-a="rulesclose"]').forEach(b=>b.click());
        if(g.phase==='done')return {done:1};const V=saViewer(),a=saActor(g),mine=V&&(a===V.id||g.phase==='feed'&&((g.fd||{})[V.id]||(g.fok||{})[V.id]));
        if(!mine)return {n:g.n,bot:1};
        /* what a person could tap right now, in the turn card or on glowing spots */
        const B=[...document.querySelectorAll('.sadock [data-a], .satile.go, .saslot.go, .sapile.go')].filter(b=>!b.disabled&&b.dataset.a!=='rxopen'&&b.getAttribute('aria-disabled')!=='true');
        const pick=(re)=>B.filter(b=>re.test(b.dataset.a));let opts=pick(/^sap(place|roll|take|pay|choose|die|feed|fok|res)$/);
        if(!opts.length)opts=pick(/^sap(sel|adj|tool|skip|starve)$/);if(!opts.length)opts=B.filter(b=>b.dataset.a!=='sapsel'||b.dataset.k);
        if(!opts.length)return {n:g.n,none:1,ph:g.phase,roll:!!g.roll,pay:!!g.pay,pick:!!g.pick,dc:!!g.dc,fd:JSON.stringify(g.fd||{}),html:(document.querySelector('.sadock')||{}).innerText||'no dock'};
        /* fill the pay picker sensibly half the time */
        const b=opts[Math.floor(Math.random()*opts.length)];b.click();return {n:g.n,tap:b.dataset.a}});
      if(st.done)break;if(st.wait||st.bot)continue;taps++;
      if(st.none){why=JSON.stringify(st);break}
      if(st.n===lastN){if(++stuck>400){why='no progress after 400 taps '+JSON.stringify(st);break}}else{stuck=0;lastN=st.n}}
    const r=await P.evaluate(()=>({ph:S.sag&&S.sag.phase,r:S.sag&&S.sag.r,sc:act().map(p=>total(p))}));
    ok(`UI game ${gi+1} (${n} players, ${humans} on this phone) finishes by tapping`,r.ph==='done',{r,why,taps});
    if(r.ph==='done'){await P.evaluate(()=>{const b=document.createElement('button');b.dataset.a='finish';document.body.appendChild(b);b.click();b.remove()});await W(400);ok(`UI game ${gi+1}: reveal starts`,await P.evaluate(()=>S.screen==='reveal'||S.screen==='results'))}}
  ok('UI games: no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
