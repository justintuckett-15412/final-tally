// Dead of Winter over linked phones: the host and a guest each play a seat (plus 1 computer player), tapping through the
// screen to the end of the game. Neither phone ever shows the other's hand or secret objective.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];
  H.on('pageerror',e=>errs.push('host: '+e.message));G.on('pageerror',e=>errs.push('guest: '+e.message));
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('dwstart','1');const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Host','Guest','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();c('start');return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  await G.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(3000);await G.evaluate(id=>lkPick(id),ids[1]);await W(1500);
  /* one tap for whoever this phone is: vote, answer, or (on your turn) one action then end the turn */
  const tap=pg=>pg.evaluate(()=>{const b=document.querySelector('[data-a=lkopen]');if(b)b.click();const g=S.dwg;if(!g||!g.P)return 'nog';const me=S.lk&&S.lk.me;
    const html=document.getElementById('app').innerHTML,leak=[];g.ps.filter(p=>p!==me).forEach(p=>{const Q=g.P[p];const O=dwObjP(g,p),M=dwObjP(g,me);if(g.phase!=='done'&&O&&(!M||O.n!==M.n)&&html.includes('<b>'+O.n+'</b>'))leak.push('obj '+p);(Q.hand||[]).forEach(c=>{if(html.includes(`data-k="card:${c}"`))leak.push('card '+c)})});
    if(leak.length)return 'LEAK '+leak.join(',');
    const dock=document.querySelector('.dwdock');if(!dock)return 'nodock';const bs=[...dock.querySelectorAll('[data-a="dwans"]:not([disabled])')],mv=x=>JSON.parse(decodeURIComponent(x.dataset.k));
    const vote=bs.find(x=>mv(x).vote!==undefined);if(vote){vote.click();return 'vote'}
    if(g.ask&&g.ask.pid===me){const a=bs.find(x=>mv(x).v!==undefined||mv(x).skip);if(a){a.click();return 'ans'}return 'noans'}
    if(!g.ask&&!g.vote&&!(g.q||[]).length&&g.turn===me){const e=bs.find(x=>mv(x).a==='end');if(!e)return 'wait';
      if(!window.__dwdid){window.__dwdid=g.n;const s=document.querySelector('[data-a="dwsel"][data-k^="surv:"]');if(s){s.click();const m=[...document.querySelectorAll('.dwdock [data-a="dwans"]')].find(x=>mv(x).a==='move');if(m){m.click();return 'act'}}}
      window.__dwdid=0;[...document.querySelectorAll('.dwdock [data-a="dwans"]')].find(x=>mv(x).a==='end').click();return 'end'}
    return 'wait'});
  let taps=0,leak=null;const end=Date.now()+480000;
  while(Date.now()<end){const st=await H.evaluate(()=>{const g=S.dwg;return g?g.phase:null});if(st==='done')break;
    for(const pg of [H,G]){const r=await tap(pg);if(String(r).startsWith('LEAK'))leak=r;if(['vote','ans','act','end'].includes(r))taps++}await W(250)}
  const fin=await H.evaluate(()=>S.dwg&&S.dwg.phase);let gfin=null;for(let i=0;i<20&&gfin!=='done';i++){await W(500);gfin=await G.evaluate(()=>S.dwg&&S.dwg.phase)}
  ok('Linked phones: host and guest tap through their own turns and the game ends on both phones',fin==='done'&&gfin==='done'&&taps>=4,{fin,gfin,taps});
  ok('Linked phones: neither phone ever shows the other player’s hand or secret objective',!leak,leak);
  const rev=await G.evaluate(()=>{const g=S.dwg;return g.phase==='done'&&g.ps.every(p=>document.getElementById('app').innerText.includes(g.fin[p].obj))});
  ok('At the end every objective is revealed on the guest phone',rev,rev);
  ok('No page errors on either phone',!errs.length,errs.slice(0,4));
  await done(browser)})();
