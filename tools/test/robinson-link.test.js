// Robinson Crusoe over linked phones: 2 phones (one character each) + a "Just watching" big board. Each phone plans its own
// pawns, taps Ready, answers its own questions; the board shows the island, tracks and planned pawns but no buttons. Rounds resolve.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/rc-shots';fs.mkdirSync(SHOT,{recursive:true});
(async()=>{const browser=await chromium.launch();const errs=[];
  const H=await mk(browser,'host'),G=await mk(browser,'guest');
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('rcstart');Object.assign(RCX(),{scen:'castaways'});rcKeep();const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Mom','Dad'][i]||'';delete p.bot});save();c('start');return P.slice(0,2).map(p=>p.id)});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  await G.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await G.evaluate(id=>lkPick(id),ids[1]);await W(1000);
  /* the guest picks its own character on "Who plays whom", then the host starts */
  const gp=await G.evaluate(id=>{const b=document.querySelector(`[data-a="rcupick"][data-k="${id}:soldier"]`);if(!b||b.disabled)return 'no button';b.click();return 'ok'},ids[1]);await W(2500);
  const hp=await H.evaluate(id=>S.rcpick&&S.rcpick.as&&S.rcpick.as[id],ids[1]);
  const gs=await G.evaluate(id=>{const b=document.querySelector(`[data-a="rcupick"][data-k="${id}:soldier"]`);return b&&b.classList.contains('on')},ids[1]);
  ok('Guest picks its own character on Who plays whom (the host sees it)',gp==='ok'&&hp&&hp.join()==='soldier'&&gs,{gp,hp,gs});
  await H.evaluate(()=>{const b=document.querySelector('[data-a="rcugo"]');b.click()});await W(1500);
  const TV=await mk(browser,'TV');await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));await W(2000);
  [H,G,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push(['host','guest','tv'][i]+': '+e.message)));
  const g0=await H.evaluate(()=>S.rcg&&{ps:S.rcg.ps,order:S.rcg.order,fri:!!S.rcg.fri});
  ok('Host dealt: 2 players, cook and soldier (the guest’s pick), Friday joins',g0&&g0.ps.length===2&&g0.order.join()==='cook,soldier'&&g0.fri,g0);
  const gv=await G.evaluate(()=>({g:!!S.rcg,mine:document.querySelectorAll('.rcctl .rccast > .rcch:not(.compact)').length,txt:document.querySelector('.rcctl')&&document.querySelector('.rcctl').innerText.slice(0,400)}));
  await W(1500);const pc=await G.evaluate(()=>{const me=act().find(p=>p.id===S.lk.me);const im=document.querySelector('.rcctl .rccast > .rcch:not(.compact) img');return {col:me&&me.color,src:im&&im.src.slice(0,40),orig:im&&im.dataset.rc}});
  ok('Guest phone: its character portrait is painted in its own colour',pc.col&&(pc.col==='red'?/rcch-soldier-red/.test(pc.src):/^blob:/.test(pc.src)),pc);
  ok('Guest phone: the game arrives; it shows its own character',gv.g&&gv.mine>=1,gv);
  /* one tap for this phone */
  const tap=pg=>pg.evaluate(()=>{const q=s=>document.querySelector(s),g=S.rcg;if(!g)return 'nog';if(g.phase==='done')return 'done';
    const nx=q('.rcrvp [data-a="rcurvnext"]');if(nx){nx.click();return 'next'}
    const pop=q('.rcpop [data-a="rcucardok"]');if(pop){pop.click();return 'pop'}
    const go=q('.rcplsheet [data-a="rcuplgo"]');if(go){if(!go.disabled){go.click();if(q('.rcplsheet')){window.__rcbad=(window.__rcbad||0)+1;q('.rcplsheet [data-a="rcuplclose"]').click();return 'refused'}return 'plan'}const f=q('.rcplsheet [data-a="rcuplfill"]');if(f&&!window.__rcf){window.__rcf=1;f.click();return 'fill'}window.__rcf=0;q('.rcplsheet [data-a="rcuplclose"]').click();window.__rcbad=(window.__rcbad||0)+1;return 'close'}
    const hx=q('.sheet-bg [data-a="rcuplclose"]');if(hx){hx.click();return 'closehex'}
    const ans=[...document.querySelectorAll('.rcdock.ask [data-a="rcuans"]:not(.uxundo)')];if(ans.length){(ans.find(b=>/Keep|Go on|Fight|Stay|Put \d/.test(b.innerText))||ans[0]).click();return 'ans'}
    if(q('[data-a="rcuunready"]'))return 'isready';
    const rd=q('[data-a="rcuready"]');if(rd&&!rd.disabled){rd.click();return 'ready'}
    const C=[...document.querySelectorAll('.rcdock [data-a="rcucand"]')];if(C.length&&rd){const pref=['Gather','Explore','Arrange','Rest','Build','Hunt'];const s=C.slice().sort((a,b)=>pref.findIndex(p=>a.innerText.includes(p))-pref.findIndex(p=>b.innerText.includes(p)));
      if(window.__rcpend&&Date.now()-window.__rcpend<1500)return 'pending';window.__rcpend=Date.now();s[(window.__rcbad||0)%s.length].click();return 'cand'}
    return 'wait'});
  const T={},end=Date.now()+300000;let shotP=0,tvLeak=null,tvShot=0;
  while(Date.now()<end){const st=await H.evaluate(()=>S.rcg&&{rd:S.rcg.round,ph:S.rcg.phase});if(!st||st.ph==='done'||st.rd>=4)break;
    for(const [n,pg] of [['host',H],['guest',G]]){const r=await tap(pg);T[n+':'+r]=(T[n+':'+r]||0)+1;
      if(r==='cand'&&!shotP&&n==='guest'){shotP=1;await W(300);await G.screenshot({path:`${SHOT}/link-guest-plan.png`})}}
    await TV.evaluate(()=>{const b=document.querySelector('.rcpop [data-a="rcucardok"]');if(b)b.click()});
    const tv=await TV.evaluate(()=>({btn:document.querySelectorAll('#app [data-a="rcuans"],#app [data-a="rcuready"],#app [data-a="rcucand"]').length,plan:document.querySelectorAll('.rchplan .rcpawn, .rcact .rcpawn').length,big:document.documentElement.classList.contains('rcbigv')}));
    if(tv.btn)tvLeak=tv;if(tv.plan&&!tvShot){tvShot=1;await TV.setViewportSize({width:1280,height:900});await W(400);await TV.screenshot({path:`${SHOT}/link-board-1280.png`,fullPage:true});await TV.setViewportSize({width:400,height:850})}
    await W(200)}
  const fin=await H.evaluate(()=>({rd:S.rcg.round,ph:S.rcg.phase}));
  ok('Linked: both phones plan, ready and answer; rounds resolve (round 4 reached or the game ended)',fin.rd>=4||fin.ph==='done',{fin,T});
  ok('Both phones placed their own pawns and tapped Ready',(T['host:plan']||0)>0&&(T['guest:plan']||0)>0&&(T['host:ready']||0)>0&&(T['guest:ready']||0)>0,T);
  const tvb=await TV.evaluate(()=>({big:document.documentElement.classList.contains('rcbigv'),hex:document.querySelectorAll('.rcmap .rchex').length,cast:document.querySelectorAll('.rcboard .rcch').length,inv:document.querySelectorAll('.rcinv').length}));
  ok('Big board: the island, the castaways and the inventions; never any buttons to play',tvb.big&&tvb.hex>=10&&tvb.cast>=2&&tvb.inv>=5&&!tvLeak,{tvb,tvLeak,tvShot});
  const same=await Promise.all([H,G,TV].map(p=>p.evaluate(()=>S.rcg&&S.rcg.n)));await W(2500);const same2=await Promise.all([H,G,TV].map(p=>p.evaluate(()=>S.rcg&&S.rcg.round)));
  ok('All three screens follow the same game',same2[0]===same2[1]&&same2[1]===same2[2],same2);
  await G.screenshot({path:`${SHOT}/link-guest-end.png`});await TV.setViewportSize({width:1024,height:1366});await W(300);await TV.screenshot({path:`${SHOT}/link-board-1024.png`});
  ok('No page errors',!errs.length,errs.slice(0,5));
  await done(browser)})();
