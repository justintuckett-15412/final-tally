// Quacks stress test: many full games on the phone with random settings and a randomly tapping person.
// Checks rules after every step and catches stuck games and page errors.
// Usage: N=10 SEED=1 node fuzz.js      (VERBOSE=1 prints progress)
const {chromium,W,ok,done,BASE}=require('./link.js');
const N=+(process.env.N||6);
(async()=>{const browser=await chromium.launch();const probs=[];
  for(let gi=0;gi<N;gi++){
    const page=await browser.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
    await page.goto(BASE);await W(1200);
    const cfg=await page.evaluate(gi=>{window.__htfast=1;SET.toursOff=true;const R=()=>Math.random();switchGame('quacks');resetScores();const X=QKX();X.play=1;
      X.herb=R()<.6;X.turq=X.herb?R()<.7:R()<.3;X.o6=R()<.5;X.ovf=R()<.6;X.rub1=R()<.3;X.big=R()<.25;X.shop=R()<.5?'color':'two';
      X.wit={};['s','c','g'].forEach(t=>{const o=QKWITCH[t][1];X.wit[t]=o[Math.floor(R()*o.length)][0]});
      X.bk=R()<.85?qkRandomBooks():qkSetBooks(1+Math.floor(R()*(X.herb?6:4)));if(X.turq&&!X.bk.turquoise)X.bk.turquoise=R()<.5?'tRat':'tCopy'
      const np=2+Math.floor(R()*(X.big?7:X.herb?4:3)),humans=R()<.25?2:R()<.15?0:1;
      const P=S.players;P.forEach((p,i)=>{p.on=i<np;p.name=i<np?(i<humans?'Human'+(i+1):'Bot'+i):'';if(i>=humans&&i<np)p.bot=['easy','normal','hard'][Math.floor(R()*3)];else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();
      return {gi,np,humans,herb:X.herb,turq:X.turq,o6:X.o6,ovf:X.ovf,rub1:X.rub1,big:X.big,shop:X.shop,wit:X.wit,bk:X.bk}},gi);
    if(process.env.VERBOSE)console.log('GAME',JSON.stringify(cfg));
    const bad=[];let last='',lastT=Date.now(),t0=Date.now(),prev={};
    while(Date.now()-t0<12*60e3){
      // invariants
      const v=await page.evaluate(prev=>{const g=S.qpg;if(!g)return {none:1};const out=[],X=QKX(),now={};
        const ids=new Set();for(const id of g.ps){const L=g.pl[id],p=act().find(q=>q.id===id);if(!L||!p){out.push('missing player '+id);continue}
          const all=[...L.bag,...L.pot.map(x=>x.c),...(L.ovf||[]),...(L.d6||[]),...(L.aside||[]),...(L.saved||[]),...(L.ha||[]),...(L.ask&&(L.ask.t==='blue'||L.ask.t==='strong')?L.ask.cs||[]:[]),...(L.ask&&L.ask.t==='stir'&&L.ask.c?[L.ask.c]:[])];
          for(const c of all){if(ids.has(c))out.push(`${nm(p)} chip ${c} appears twice`);ids.add(c);if(!/^[a-z]\d+#/.test(c))out.push(`${nm(p)} odd chip ${c}`)}
          for(let i=1;i<L.pot.length;i++)if(L.pot[i].at<=L.pot[i-1].at)out.push(`${nm(p)} pot spaces not increasing ${L.pot[i-1].at}->${L.pot[i].at}`);
          if(L.pot.length&&L.pot[L.pot.length-1].at>QKSPOON)out.push(`${nm(p)} chip past the spoon`);
          if(L.pot.length&&L.pot[0].at<L.start&&!L.pot[0].as)out.push(`${nm(p)} first chip at ${L.pot[0].at} before start ${L.start}`);
          if(g.phase==='brew'){const ws=L.pot.filter(x=>qpK(x.c)==='w'&&!x.as).reduce((a,x)=>a+qpV(x.c),0)+(L.ovf||[]).filter(c=>qpK(c)==='w').reduce((a,c)=>a+qpV(c),0);
            if(ws!==L.ws)out.push(`${nm(p)} white total ${L.ws} but pot whites add to ${ws}`);
            if(L.ws>L.lim&&!L.ex&&!L.ask)out.push(`${nm(p)} over the limit (${L.ws}>${L.lim}) but not exploded`);}
          if(g.phase==='eval'){const R=qkR(p,g.r),la=L.pot.length?L.pot[L.pot.length-1].at:L.start-1;if(R.s!=null&&R.s<Math.min(QKSPOON,la+1))out.push(`${nm(p)} scoring space ${R.s} is before the space after the last chip (${la+1})`);if(L.ex!==!!R.ex&&!R.u2s)out.push(`${nm(p)} exploded mismatch pot ${L.ex} score ${!!R.ex}`)}
          const pv=prev[id]||{};now[id]={fp:qkR(p,g.r).fp,drop:L.drop,n:all.length,r:g.r,ph:g.phase,nd:L.nd||0};
          if(pv.drop!=null&&L.drop<pv.drop&&pv.fp===qkR(p,g.r).fp)out.push(`${nm(p)} droplet went back ${pv.drop}->${L.drop} r${g.r+1} ${g.phase} card=${qkCid(g.r)} fp=${qkR(p,g.r).fp} after ${(window.__clk||[]).join(' ')}`);
          if(pv.drop!=null&&L.drop-pv.drop>3+Math.max(0,-(+(g.r>0&&qkR(p,g.r-1).rb)||0)))out.push(`${nm(p)} droplet jumped ${pv.drop}->${L.drop} (r${g.r+1} ${g.phase} card ${qkCid(g.r)} lastcard ${qkCid(g.r-1)} rubyspent ${JSON.stringify(qkR(p,g.r-1).rb)} die ${qkR(p,g.r-1).die} dies ${JSON.stringify(qkR(p,g.r-1).dies)} wit ${JSON.stringify(qkR(p,g.r-1).wu)} fp ${qkR(p,g.r).fp})`);
          if(pv.n!=null&&pv.r===g.r&&pv.ph==='brew'&&g.phase==='brew'&&pv.nd>0&&all.length!==pv.n)out.push(`${nm(p)} chip count changed mid-brew ${pv.n}->${all.length} ask=${L.ask&&L.ask.t} pot=${L.pot.length} after ${(window.__clk||[]).slice(-4).join(' ')}`);
          if(L.drop>QKSPOON)out.push(`${nm(p)} droplet off the pot`);
          const rb=qpRubies(p,g.r);if(rb<0)out.push(`${nm(p)} negative rubies ${rb}`);
          if(X.herb&&(qkPennies(p)<0||qkPennies(p)>3))out.push(`${nm(p)} pennies ${qkPennies(p)}`);
          const t=qkTot(p);if(!Number.isFinite(t))out.push(`${nm(p)} score ${t}`);
        }
        return {out,now,r:g.r,ph:g.phase,fin:!!S.finished,scr:S.screen,n:g.n}},prev);
      if(v.none){await W(300);continue}
      prev=v.now;for(const o of v.out)if(!bad.includes(o))bad.push(o);
      const key=v.r+v.ph+v.n+v.scr;if(key!==last){last=key;lastT=Date.now()}
      if(v.fin)break;
      if(Date.now()-lastT>45e3){const st=await page.evaluate(()=>({btns:[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))].join(' '),g:JSON.stringify({r:S.qpg.r,ph:S.qpg.phase,ann:S.qpg.ann&&S.qpg.ann.t,annq:(S.qpg.annq||[]).length,brewAnn:!!S.qpg.brewAnn,pl:Object.fromEntries(S.qpg.ps.map(id=>{const L=S.qpg.pl[id];return [nmid(id),{stop:L.stop,ask:L.ask,done:L.done,sf:L.sf,sr:L.sr,ex:L.ex,d6:(L.d6||[]).length}]}))})}));bad.push('STUCK '+JSON.stringify(st).slice(0,900));break}
      // a person tapping: anything Quacks-ish that is enabled
      await page.evaluate(()=>{const vis=[...document.querySelectorAll('#app [data-a], .sheet [data-a], .glann [data-a]')].filter(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&b.offsetParent);
        const A=b=>b.dataset.a;const want=['qplm','qplastok','qpseen','qpans','qpfc','qpfp','qpdraw','qpstop','qpflask','qpwit','qpch','qpbuy','qprub','qpdone','qpd6','qpbowl','qpup','qpha','finish','revstart','lpclose','qpshow'];
        const c=vis.filter(b=>want.some(w=>A(b)===w||A(b).startsWith(w)));if(!c.length)return;
        const pri=c.filter(b=>['qplm','qplastok','qpseen','qpans','qpfc','finish','revstart','lpclose','qpshow'].includes(A(b)));
        const weight=b=>A(b)==='qpdraw'?6:A(b)==='qpstop'?1.2:A(b)==='qpdone'?1:A(b)==='qpbuy'?3:2;
        let pick;if(pri.length&&Math.random()<.8)pick=pri[Math.floor(Math.random()*pri.length)];else{const tot=c.reduce((a,b)=>a+weight(b),0);let x=Math.random()*tot;for(const b of c){x-=weight(b);if(x<=0){pick=b;break}}pick=pick||c[0]}
        (window.__clk=window.__clk||[]).push(A(pick)+':'+(pick.dataset.k||'')+':'+(pick.dataset.v||'')+'@'+(S.qpg&&S.qpg.r)+(S.qpg&&S.qpg.phase));if(window.__clk.length>8)window.__clk.shift();pick.click()});
      await W(120)}
    const fin=await page.evaluate(()=>({fin:!!S.finished,rounds:act().map(q=>(q.qk||[]).filter(qkHas).length),tot:act().map(q=>nm(q)+' '+qkTot(q))}));
    if(!fin.fin)bad.push('did not finish: rounds '+fin.rounds.join(','));
    const prob=bad.length||errs.length;
    ok(`game ${gi+1}: ${cfg.np}p ${cfg.humans} human${cfg.herb?' herb':''}${cfg.turq?' turq':''}${cfg.o6?' o6':''}${cfg.ovf?' bowl':''}${cfg.rub1?' rub1':''} ${Object.values(cfg.bk||{}).filter(b=>/^h|r2|u2/.test(b)).join(',')} ${cfg.shop} → ${fin.tot.join(', ')}`,!prob,{bad:bad.slice(0,8),errs:[...new Set(errs)].slice(0,4),cfg});
    await page.close()}
  await done(browser)})();
