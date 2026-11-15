// Wyrmspan over linked phones: the host runs the game with 2 computer players; the guest plays its own seat by tapping, to the end.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];
  H.on('pageerror',e=>errs.push('host: '+e.message));G.on('pageerror',e=>errs.push('guest: '+e.message));
  const gid=await H.evaluate(()=>{window.__htfast=1;switchGame('wyrmspan');resetScores();S.rules=S.rules||{};S.rules.play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Guest','Bot A','Bot B'][i]||'';if(i>0&&i<3)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P[0].id});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(()=>lkPick(null));await W(500);
  await G.evaluate(c=>{window.__htfast=1;lkJoin(c)},code);await W(3000);await G.evaluate(id=>lkPick(id),gid);await W(1500);
  let taps=0,seen=false;const end=Date.now()+420000;
  while(Date.now()<end){const st=await H.evaluate(()=>{const g=S.wzg;return g?{ph:g.phase,rnd:g.rnd}:null});if(st&&st.ph==='done')break;
    const r=await G.evaluate(()=>{const b=document.querySelector('[data-a=lkopen]');if(b)b.click();const g=S.wzg;if(!g||!g.P)return 'nog';const me=S.lk&&S.lk.me;
      const dock=document.querySelector('.wzdock');if(!dock)return 'nodock';const ask=dock.querySelector('[data-a="wzans"]:not([data-k*="pass"]):not([disabled])');
      if(g.ask&&g.ask.pid===me){if(ask){ask.click();return 'ans'}return 'noans'}
      if(!g.ask&&!g.q.length&&g.turn===me){const bs=[...dock.querySelectorAll('[data-a="wzans"]:not([disabled])')];const ex=bs.find(x=>/exp/.test(decodeURIComponent(x.dataset.k)));const pass=bs.find(x=>/pass/.test(decodeURIComponent(x.dataset.k)));
        const c=g.P[me].coin,t=c>0&&ex?ex:pass;if(!t)return 'wait';t.click();return 'act'}return 'wait'});
    if(r==='ans'||r==='act'){taps++;seen=true}await W(r==='wait'?400:250)}
  const fin=await H.evaluate(()=>{const g=S.wzg;return {ph:g.phase,tot:g.fin&&g.ps.map(p=>g.fin[p].tot)}});let gfin=null;for(let i=0;i<20&&gfin!=='done';i++){await W(500);gfin=await G.evaluate(()=>{const g=S.wzg;return g&&g.phase})}
  ok('Linked phones: the guest taps through its own turns and the game reaches the end on both phones',fin.ph==='done'&&gfin==='done'&&taps>10,{fin,gfin,taps});
  ok('No page errors on either phone',!errs.length,errs.slice(0,4));
  await done(browser)})();
