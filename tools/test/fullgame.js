// A full 9-round linked Quacks game: host (Justin) + guest (Brad) + 2 bots, both phones tapping like people.
const {mk,st,pages,chromium,W,ok,done}=require('./link.js');
const click=(page,a,k)=>page.evaluate(([a,k])=>{const sel=k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`;const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&b.offsetParent);if(!b)return false;b.click();return true},[a,k]);
const btns=page=>page.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))]);
(async()=>{const browser=await chromium.launch();
  const H=await mk(browser,'qh'),G=await mk(browser,'qg');const errs=[];
  for(const [n,p] of [['host',H],['guest',G]]){p.on('pageerror',e=>errs.push(n+': '+e.message));await p.evaluate(h=>{window.__htfast=1;window.__herb=h},!!process.env.HERB)}
  const ids=await H.evaluate(()=>{switchGame('quacks');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Brad','Dice Bot','Yahtzee Bot'][i]||'';if(i>1&&i<4)p.bot='normal';else delete p.bot});QKX().play=1;if(window.__herb){const X=QKX();X.herb=true;X.wit={};['s','c','g'].forEach(t=>{const o=QKWITCH[t][1];X.wit[t]=o[Math.floor(Math.random()*o.length)][0]})}save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
  await H.evaluate(()=>{const o=window.lkRecv,rank=()=>S.qpg?S.qpg.r*10+({card:0,brew:1,eval:2,done:3}[S.qpg.phase]||0):-1;window.lkRecv=u=>{const a=rank(),bs=S.qpg&&JSON.stringify(S.qpg).length;o(u);const b=rank();if(b<a)console.warn('REGRESS '+a+'->'+b+' keys='+Object.keys(u).join('/')+' mflatKeys='+(u.mflat?Object.keys(u.mflat).filter(k=>k.startsWith('qpg')).join(','):''))}});

  await G.evaluate(()=>{const f=window.FTLINK.push.bind(window.FTLINK);window.FTLINK.push=u=>{const m=(u.mops||[]).map(([s])=>s.join('.'));if(m.some(x=>x.startsWith('qpg')))console.warn('GPUSH qpg from guest: '+m.join(',')+' r='+(S.qpg&&S.qpg.r)+' ph='+(S.qpg&&S.qpg.phase));return f(u)}});
  const want={},drawn={};let lastKey='',lastChange=Date.now(),t0=Date.now();
  while(Date.now()-t0<25*60e3){
    const hs=await H.evaluate(()=>({r:S.qpg&&S.qpg.r,ph:S.qpg&&S.qpg.phase,fin:!!S.finished,scr:S.screen}));
    const key=JSON.stringify(hs);if(key!==lastKey){if(process.env.VERBOSE)console.log(((Date.now()-t0)/1000|0)+'s',key);lastKey=key;lastChange=Date.now()}
    if(hs.fin&&hs.scr==='results')break;
    if(Date.now()-lastChange>90e3){console.log('STUCK host',(await btns(H)).join(' '));console.log('STUCK guest',(await btns(G)).join(' '));break}
    for(const [n,p] of [['host',H],['guest',G]]){const b=await btns(p);const g=await p.evaluate(()=>S.qpg&&{r:S.qpg.r,ph:S.qpg.phase,me:S.lk&&S.lk.me&&S.qpg.pl[S.lk.me]});
      const tap=pre=>{const m=b.find(x=>x===pre||x.startsWith(pre+':'));if(!m)return null;const [a,...k]=m.split(':');return click(p,a,k.length?k.join(':'):null)};
      if(b.some(x=>x.startsWith('qpfc:')))await tap('qpfc');
      if(await tap('qplastok'))continue;
      if(await tap('qpseen'))continue;
      if(b.some(x=>x.startsWith('qpans'))){await tap('qpans');continue}
      if(g&&g.ph==='brew'&&g.me&&!g.me.stop){const k=n+g.r;if(!want[k]){want[k]=3+Math.floor(Math.random()*4);drawn[k]=0}
        if(drawn[k]<want[k]&&b.includes('qpdraw')){await click(p,'qpdraw');drawn[k]++}else if(b.includes('qpstop'))await click(p,'qpstop');continue}
      if(g&&g.ph==='eval'&&g.me&&!g.me.done){const fp=b.find(x=>x.startsWith('qpfp'));if(fp&&Math.random()<.5){await tap('qpfp')}
        const bb=b.filter(x=>x.startsWith('qpbuy:'));if(bb.length&&!g.me.buy.length)await click(p,'qpbuy',bb[Math.floor(Math.random()*bb.length)].split(':')[1]);
        if(b.includes('qpch:vp'))await click(p,'qpch','vp');
        if(b.includes('qpdone:sure')){await click(p,'qpdone','sure');continue}if(b.includes('qpdone'))await click(p,'qpdone');continue}
      for(const a of ['finish','revstart'])if(b.some(x=>x===a||x.startsWith(a+':'))){await tap(a);break}
    }
    await W(400)}
  const sum=async p=>p.evaluate(()=>({fin:!!S.finished,tot:act().map(q=>nm(q)+' '+qkTot(q)),rounds:act().map(q=>(q.qk||[]).filter(qkHas).length)}));
  await W(4000);const a=await sum(H),b=await sum(G);
  ok('full game: all 9 rounds scored for everyone',a.rounds.every(n=>n===9),a.rounds);
  ok('full game: finished on both phones',a.fin&&b.fin);
  ok('full game: same totals on both phones',JSON.stringify(a.tot)===JSON.stringify(b.tot),{a:a.tot,b:b.tot});
  ok('full game: no page errors',!errs.length,errs.slice(0,5));
  await done(browser)})();
