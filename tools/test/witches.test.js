// Herb Witches in Quacks Play mode: each witch penny does what its card says, once per game, on one phone and linked.
const {mk,W,ok,done,chromium,BASE}=require('./link.js');
(async()=>{const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1500);
  const start=wit=>page.evaluate(wit=>{window.__htfast=1;switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;X.wit=wit;const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Me','Bot'][i]||'';if(i===1)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();document.querySelectorAll('[data-a=tourskip]').forEach(b=>b.click())},wit);
  const until=async(fn,ms=20000,arg)=>{const t=Date.now();while(Date.now()-t<ms){if(await page.evaluate(fn,arg))return true;await W(100)}return false};
  const toBrew=()=>until(()=>{const g=S.qpg;if(!g)return false;if(g.phase==='card'){qpSetCard(g,'');save();render()}const me=act()[0];const L=g.pl[me.id];if(g.phase==='brew'){(S.qkfc=S.qkfc||[])[g.r]=null;g.ps.forEach(id=>{const M=g.pl[id];M.sf=true;M.lim=7});g.brewAnn=null}return g.phase==='brew'});
  const me=()=>page.evaluate(()=>act()[0].id);
  const toEval=async()=>{await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;qpStop(g,id);save();render()});return until(()=>S.qpg.phase==='eval')};
  // --- silver: draw 6 ---
  await start({s:'draw6',c:'double',g:'colors'});await toBrew();
  let r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id],tot=L.bag.length+L.pot.length,ok1=qpWitch(g,id,'s');const n=L.d6.length;const c=L.d6[0];const ok2=qpD6(g,id,c);const placed=L.pot.some(x=>x.c===c);qpD6(g,id,null);
    return {ok1,n,ok2,placed,left:L.d6.length,tot2:L.bag.length+L.pot.length,tot,again:qpWitch(g,id,'s'),drawBlocked:false}});
  ok('draw 6: six chips to place',r.ok1&&r.n===6,r);ok('draw 6: a tapped chip goes in the pot',r.ok2&&r.placed,r);ok('draw 6: the rest go back, no chips lost',r.left===0&&r.tot2===r.tot,r);ok('draw 6: only once per game',!r.again,r);
  ok('the silver witch button is gone after use',await page.evaluate(()=>{render();return true})&&await page.evaluate(()=>!document.querySelector('[data-a=qpwit][data-k=s]:not([disabled])')));
  // --- copper double + gold colors (eval) ---
  await toEval();
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,c0=qpCoins(p,g.r),ok1=qpWitch(g,id,'c'),c1=qpCoins(p,g.r);const ok2=qpWitch(g,id,'g');const R=qkR(p,g.r),n=new Set(g.pl[id].pot.map(x=>qpK(x.c))).size;return {c0,c1,ok1,ok2,wcol:R.wcol,n,vp:qkB(p,g.r).vp,notes:qkB(p,g.r).notes,pennies:qkPennies(p)}});
  ok('double the value doubles the coins',r.ok1&&r.c1===2*r.c0,r);ok('points for colors counts the colors in the pot',r.ok2&&r.wcol===r.n,r);ok('pennies go down as they are used',r.pennies===0,r);
  ok('witch section on the scoring screen',await page.evaluate(()=>!!document.querySelector('.qkwit')));
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0];const ok=qpWitch(g,p.id,'c');return {ok,c:qpCoins(p,g.r)}});ok('a switch witch can be undone in the same round',r.ok,r);
  // --- silver flask after a boom, copper twice, gold rubies for points ---
  await start({s:'flask',c:'twice',g:'rubyvp'});await toBrew();
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.flask=true;L.bag=['w3#901','w3#902','w3#903','w3#904'];for(let i=0;i<4&&!L.ex;i++)qpDraw(g,id);const asked=L.ask&&L.ask.t;const ws0=L.ws;qpAnswer(g,id,'yes');return {asked,ex:L.ex,stop:L.stop,flask:L.flask,ws0,ws:L.ws,used:qpWOn(act()[0],g.r,'s')}});
  ok('flask witch is offered when the pot explodes',r.asked==='wflask',r);ok('flask witch un-explodes the pot and uses the flask',!r.ex&&!r.stop&&!r.flask&&r.ws<r.ws0&&r.used,r);
  await page.evaluate(()=>{const g=S.qpg,L=g.pl[act()[0].id];L.bag.push('o1#950','g1#951','r1#952')});await toEval();
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,L=g.pl[id];qkR(p,g.r).ca=20;const b=qpChoose(g,id,{t:'buy',v:'o1'});const t=qpWitch(g,id,'c','o1');const before=L.bag.filter(c=>c.startsWith('o1')).length+L.pot.filter(x=>x.c.startsWith('o1')).length;return {b,t,before,wtw:qkR(p,g.r).wtw}});
  ok('take a chip twice: pick a bought chip',r.b&&r.t&&r.wtw==='o1',r);
  const o1before=r.before;await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;qpChoose(g,id,{t:'done'});save();render()});
  await until(()=>S.qpg.phase!=='eval'||S.qpg.r>0,20000);await W(500);
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],L=g.pl[p.id],R0=(p.qk||[])[0]||{},pump=R0.die==='pump'&&qkDieRollers(0).includes(p)?1:0;return {n:L.bag.filter(c=>c.startsWith('o1')).length+L.pot.filter(x=>x.c.startsWith('o1')).length,pump}});
  ok('take a chip twice: two of that chip go in the bag',r.n===o1before+2+r.pump,{r,o1before});
  // --- gold endprice: rubies cost 1; silver white2; copper upgrade ---
  await start({s:'white2',c:'upgrade',g:'endprice'});await toBrew();
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.bag=['w1#801','w1#802','g1#803','r1#804','w2#805'];for(let i=0;i<4;i++)qpDraw(g,id);const w0=L.pot.filter(x=>qpK(x.c)==='w').length,ws0=L.ws;const ok=qpWitch(g,id,'s');return {ok,w0,w1:L.pot.filter(x=>qpK(x.c)==='w').length,ws0,ws:L.ws}});
  ok('return 2 whites takes the last 2 white chips out',r.ok&&r.w1===Math.max(0,r.w0-2)&&r.ws<r.ws0,r);
  await page.evaluate(()=>{const g=S.qpg,L=g.pl[act()[0].id];L.bag.push('r1#811','u1#812')});await toEval();
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id;qkR(p,g.r).rb=3;const have=qpRubies(p,g.r);const ok=qpWitch(g,id,'g');qpChoose(g,id,{t:'ruby',v:'drop'});const after=qpRubies(p,g.r);const up=qpWitch(g,id,'c','last');return {ok,have,after,up,wup:g.pl[id].wup}});
  ok('cheap droplet: moving the droplet costs 1 ruby',r.ok&&r.after===r.have-1,r);ok('upgrade witch takes a choice',r.up&&r.wup==='last',r);

  // --- silver full bonus, copper rubies boost buying, gold points for your bag ---
  await start({s:'full',c:'rubyval',g:'bag'});await toBrew();
  await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.bag=['w3#701','w3#702','w3#703'];L.flask=false;for(let i=0;i<3&&!L.ex;i++)qpDraw(g,id);L.bag.push('p1#704','r2#705','u4#706','g1#707','w1#708');save();render()});
  await until(()=>S.qpg.phase==='eval',20000);
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,L=g.pl[id],ex=L.ex,can0=qpWCan(g,id,'s');const ok=qpWitch(g,id,'s');qkR(p,g.r).rb=2;const c0=qpCoins(p,g.r);const ok2=qpWitch(g,id,'c');const c1=qpCoins(p,g.r);const ok3=qpWitch(g,id,'g');
    const want=L.bag.filter(c=>{const k=qpK(c),v=qpV(c);return k==='p'||k!=='w'&&[2,4,6].includes(v)}).length;return {ex,can0,ok,qkEx:qkEx(p,g.r),buyOk:qpChoose(g,id,{t:'buy',v:'o1'}),c0,c1,rub:qpRubies(p,g.r),ok2,ok3,wbag:qkR(p,g.r).wbag,want}});
  ok('full bonus: offered after a boom and lets you shop',r.ex&&r.can0&&r.ok&&!r.qkEx&&r.buyOk,r);
  ok('rubies boost buying: +2 coins per ruby',r.ok2&&r.c1===r.c0+2*r.rub,r);ok('points for your bag counts the right chips',r.ok3&&r.wbag===r.want,r);
  // --- gold rubies for points; copper upgrade applied at the end of the round ---
  await start({s:'draw6',c:'upgrade',g:'rubyvp'});await toBrew();
  await page.evaluate(()=>{const g=S.qpg,id=act()[0].id,L=g.pl[id];L.bag=['g1#601','r1#602','u1#603'];for(let i=0;i<3;i++)qpDraw(g,id)});await toEval();
  r=await page.evaluate(()=>{const g=S.qpg,p=act()[0],id=p.id,R=qkR(p,g.r);const rubySp=QKPOT.findIndex((x,i)=>x[2]&&x[1]>=3);R.s=rubySp;const before=qkRubies(p,g.r+1);qpWitch(g,id,'g');const after=qkRubies(p,g.r+1);
    const pot=g.pl[id].pot.map(x=>x.c);window.__upN=Math.min(2,pot.filter(qpUpLabel).length);qpWitch(g,id,'c','last');qpChoose(g,id,{t:'done'});return {before,after,pts:QKPOT[rubySp][1],pot}});
  ok('rubies for points: take as many rubies as the points',r.after-r.before===r.pts-1,r);
  await until(()=>S.qpg.r>0,20000);
  r=await page.evaluate(()=>{const L=S.qpg.pl[act()[0].id];return {all:L.bag.concat(L.pot.map(x=>x.c)).map(c=>c.split('#')[0]).sort(),want:window.__upN}});
  ok('upgrade: the last 2 chips moved up a size',r.all.filter(c=>c==='u2'||c==='r2'||c==='g2').length>=r.want&&r.want>=1,r);
  // --- round 9: 2 points per unused penny ---
  r=await page.evaluate(()=>{const p=act()[1];for(let i=0;i<9;i++){const R=qkR(p,i);if(R.s==null)R.s=5}const x=qkParts(p,8);return {pen:x.pen,left:qkPennies(p)}});
  ok('round 9: 2 points per unused penny',r.pen===2*r.left,r);
  ok('no page errors',!errs.length,errs.slice(0,4));
  // --- linked: a guest uses a witch through the host ---
  {const H=await mk(browser,'wh'),G=await mk(browser,'wg');
    const ids=await H.evaluate(()=>{switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;X.wit={s:'draw6',c:'double',g:'colors'};const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
    await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);
    await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
    for(let i=0;i<40;i++){for(const p of [H,G])await p.evaluate(()=>{const f=[...document.querySelectorAll('[data-a=qpfc]')].find(b=>b.offsetParent&&!b.disabled);f&&f.click();const b=[...document.querySelectorAll('[data-a=qpseen]')].find(b=>b.offsetParent);b&&b.click()});if(await G.evaluate(()=>!!document.querySelector('[data-a=qpwit][data-k=s]:not([disabled])')))break;await W(300)}
    ok('guest sees the silver witch while brewing',await G.evaluate(()=>!!document.querySelector('[data-a=qpwit][data-k=s]:not([disabled])')));
    await G.evaluate(()=>document.querySelector('[data-a=qpwit][data-k=s]').click());let got=false;for(let i=0;i<40&&!got;i++){await W(200);got=await G.evaluate(id=>(S.qpg.pl[id].d6||[]).length===6,ids[1])}
    if(!got)console.log('DBG',JSON.stringify(await G.evaluate(id=>({q:(S.lkq||{})[id],qa:(S.lkqa||{})[id],toast:(document.querySelector('.toast')||{}).innerText,ph:S.qpg.phase,L:{nd:S.qpg.pl[id].nd,ask:S.qpg.pl[id].ask,stop:S.qpg.pl[id].stop,d6:S.qpg.pl[id].d6}}),ids[1])),JSON.stringify(await H.evaluate(id=>({qa:(S.lkqa||{})[id],L:{nd:S.qpg.pl[id].nd,ask:S.qpg.pl[id].ask,d6:S.qpg.pl[id].d6,wu:(act().find(p=>p.id===id).qk||[])[S.qpg.r]}}),ids[1])));
    ok('guest uses draw 6 through the host',got);
    const c=await G.evaluate(id=>S.qpg.pl[id].d6[0],ids[1]);await G.evaluate(c=>document.querySelector(`[data-a=qpd6][data-k="${c}"]`).click(),c);
    let placed=false;for(let i=0;i<40&&!placed;i++){await W(200);placed=await H.evaluate(([id,c])=>S.qpg.pl[id].pot.some(x=>x.c===c),[ids[1],c])}
    ok('the chip the guest picked is in its pot on the host',placed)}
  await done(browser)})();
