// Linked Quacks stress test: host + guest phones both tapping at random (plus bots), random settings.
// Checks the game finishes, both phones agree, and nothing errors.   Usage: N=3 node linkfuzz.js
const {mk,chromium,W,ok,done}=require('./link.js');
const N=+(process.env.N||2);
const tapper=()=>{const vis=[...document.querySelectorAll('#app [data-a], .sheet [data-a], .glann [data-a]')].filter(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&b.offsetParent);
  const A=b=>b.dataset.a;const want=['qpseen','qpans','qpfc','qpfp','qpdraw','qpstop','qpflask','qpwit','qpch','qpbuy','qpruby','qpdone','qpd6','qpup','lpclose','lkvote','finish','revstart'];
  const c=vis.filter(b=>want.some(w=>A(b)===w||A(b).startsWith(w)));if(!c.length)return;
  const pri=c.filter(b=>['qpseen','qpans','qpfc','lpclose','finish','revstart'].includes(A(b)));
  const weight=b=>A(b)==='qpdraw'?6:A(b)==='qpstop'?1.2:A(b)==='qpdone'?1:A(b)==='qpbuy'?3:2;
  let pick;if(pri.length&&Math.random()<.8)pick=pri[Math.floor(Math.random()*pri.length)];else{const tot=c.reduce((a,b)=>a+weight(b),0);let x=Math.random()*tot;for(const b of c){x-=weight(b);if(x<=0){pick=b;break}}pick=pick||c[0]}
  pick.click()};
(async()=>{const browser=await chromium.launch();
  for(let gi=0;gi<N;gi++){
    const H=await mk(browser,'lh'+gi),G=await mk(browser,'lg'+gi);const errs=[];
    for(const [n,p] of [['host',H],['guest',G]]){p.on('pageerror',e=>errs.push(n+': '+e.message));await p.evaluate(()=>{window.__htfast=1;SET.toursOff=true})}
    const r0=await H.evaluate(()=>{const R=()=>Math.random();switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=R()<.7;X.turq=R()<.6;X.o6=R()<.5;X.ovf=R()<.6;X.rub1=R()<.3;X.shop=R()<.5?'color':'two';
      X.wit={};['s','c','g'].forEach(t=>{const o=QKWITCH[t][1];X.wit[t]=o[Math.floor(R()*o.length)][0]});if(R()<.5)X.bk=qkRandomBooks();
      const np=3+Math.floor(R()*2);const P=S.players;P.forEach((p,i)=>{p.on=i<np;p.name=i<np?['Justin','Brad','Bot A','Bot B'][i]:'';if(i>1&&i<np)p.bot='normal';else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return {ids:[P[0].id,P[1].id],cfg:{np,herb:X.herb,turq:X.turq,o6:X.o6,ovf:X.ovf,rub1:X.rub1,shop:X.shop,wit:X.wit}}});
    await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);
    await H.evaluate(id=>lkPick(id),r0.ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),r0.ids[1]);await W(2000);
    let last='',lastT=Date.now(),t0=Date.now(),stuck=null;
    while(Date.now()-t0<20*60e3){
      const hs=await H.evaluate(()=>({r:S.qpg&&S.qpg.r,ph:S.qpg&&S.qpg.phase,n:S.qpg&&S.qpg.n,fin:!!S.finished}));
      if(hs.fin)break;const key=JSON.stringify(hs);if(key!==last){last=key;lastT=Date.now()}
      if(Date.now()-lastT>60e3){stuck=await H.evaluate(()=>JSON.stringify({r:S.qpg.r,ph:S.qpg.phase,ann:S.qpg.ann&&S.qpg.ann.t,pl:Object.fromEntries(S.qpg.ps.map(id=>{const L=S.qpg.pl[id];return [nmid(id),{stop:L.stop,ask:L.ask&&L.ask.t,done:L.done,sf:L.sf,sr:L.sr}]}))}));
        stuck+=' guest btns: '+(await G.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a))].join(' ')));break}
      await H.evaluate(tapper);await G.evaluate(tapper);await W(250)}
    await W(4000);
    const sum=p=>p.evaluate(()=>({fin:!!S.finished,tot:act().map(q=>nm(q)+' '+qkTot(q)),rounds:act().map(q=>(q.qk||[]).filter(qkHas).length)}));
    const a=await sum(H),b=await sum(G);
    ok(`linked game ${gi+1} ${JSON.stringify(r0.cfg)} → ${a.tot.join(', ')}`,!stuck&&a.fin&&b.fin&&JSON.stringify(a.tot)===JSON.stringify(b.tot)&&!errs.length,{stuck,a,b,errs:[...new Set(errs)].slice(0,4)});
    await H.context().close();await G.context().close()}
  await done(browser)})();
