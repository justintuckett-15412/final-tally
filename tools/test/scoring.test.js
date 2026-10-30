// Linked scoring: Quacks play mode round 1 scores reach both phones (the bug where the guest wiped the host's
// scoring), and a guest never overwrites another player's real score with blank entries.
const {mk,W,ok,done,chromium}=require('./link.js');
const btns=p=>p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))]);
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.offsetParent);if(b){b.click();return true}return false},[a,k]);
(async()=>{const browser=await chromium.launch();
  {const H=await mk(browser,'host'),G=await mk(browser,'guest');
    const ids=await H.evaluate(()=>{switchGame('quacks');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Brad','Dice Bot','Yahtzee Bot'][i]||'';if(i>1&&i<4)p.bot='normal';else delete p.bot});QKX().play=true;save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
    await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
    await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
    const n={host:0,guest:0};
    for(let t=0;t<60;t++){for(const [k,p] of [['host',H],['guest',G]]){const b=await btns(p);const fc=b.find(x=>x.startsWith('qpfc:'));if(fc)await tap(p,'qpfc',fc.split(':')[1]);const m=b.find(x=>x.startsWith('qpseen'));if(m)await tap(p,'qpseen',m.split(':')[1]);
        if(b.includes('qpdraw')&&n[k]<3){await tap(p,'qpdraw');n[k]++}else if(b.includes('qpstop')&&n[k]>=3)await tap(p,'qpstop');const a=b.find(x=>x.startsWith('qpans'));if(a)await tap(p,'qpans',a.split(':')[1])}
      if(await H.evaluate(()=>S.qpg.phase==='eval'))break;await W(700)}
    await W(6000);
    const get=p=>p.evaluate(()=>act().map(q=>((q.qk||[])[0]||{}).s));const hs=await get(H),gs=await get(G);
    ok('Quacks: brewing ends and scoring starts',await H.evaluate(()=>S.qpg.phase==='eval'));
    ok('Quacks: every player has a scoring space on the host',hs.every(v=>typeof v==='number'),hs);
    ok('Quacks: guest shows the same scoring',JSON.stringify(hs)===JSON.stringify(gs),{hs,gs});
    await H.context().close();await G.context().close()}
  {const H=await mk(browser,'bh'),G=await mk(browser,'bg');
    const ids=await H.evaluate(()=>{switchGame('hearts');resetScores();HTX().play=0;const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Guest','Mom','Dad'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P.slice(0,3).map(p=>p.id)});
    await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(()=>lkPick(null));
    await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),ids[0]);await W(2000);
    for(const lock of [false,true]){await H.evaluate(l=>{S.lklock=l;save()},lock);await W(1500);const r=lock?1:0,L=lock?'locked':'open';
      await G.evaluate(([id,r])=>{htR(act().find(q=>q.id===id),r)},[ids[1],r]);
      await H.evaluate(([id,r])=>{htR(act().find(q=>q.id===id),r).h=7;save()},[ids[1],r]);await W(2500);
      await G.evaluate(([id,r])=>{htR(act().find(q=>q.id===id),r).h=3;save()},[ids[0],r]);await W(2500);
      const h=(p,id)=>p.evaluate(([id,r])=>((act().find(q=>q.id===id).ht||[])[r]||{}).h,[id,r]);
      ok(`Blank entries (${L}): Mom keeps 7 on host`,await h(H,ids[1])===7);ok(`Blank entries (${L}): Mom shows 7 on guest`,await h(G,ids[1])===7);ok(`Blank entries (${L}): guest's own 3 reaches host`,await h(H,ids[0])===3)}}
  await done(browser)})();
