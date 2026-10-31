// Every game on two linked phones (SCORE=1: score mode; ALLBOT=1: guest watches bots play whole hands).
// For each phone-played game: host (not seated) + guest (seated) + bots. The guest does nothing.
// Any push the guest sends is a change it made by itself, which can overwrite the host.
const {mk,st,pages,chromium,W,ok,done}=require('./link.js');
const SCORE=!!process.env.SCORE;const GAMES=(process.env.G||(SCORE?'ttr,carc,quacks,wingspan,wyrmspan,yahtzee,catan,hf,canasta,nerts,hearts,spades,rage,ohell,uno,munchkin,crowns,skipbo,gnome,skyjo,phase10,rook,golf,tripoley,mextrain,chicken,pad,darts,pool':'hearts,spades,ohell,rook,rage,uno,golf,skyjo,gnome,skipbo,crowns,phase10,hf,canasta,nerts,tripoley,mextrain,chicken,quacks,yahtzee')).split(',');
const XF={hearts:'HTX',spades:'SDX',ohell:'OHX',rook:'RKX',rage:'RGX',uno:'UNX',golf:'GFX',skyjo:'SKX',gnome:'GNX',skipbo:'SBX',crowns:'FCX',phase10:'PTX',hf:'HX',canasta:'HX',nerts:'NX',tripoley:'TPX',mextrain:'MTX',chicken:'CFX',quacks:'QKX',yahtzee:'YZX'};
(async()=>{const browser=await chromium.launch();const res={};
  for(const g of GAMES){
    const H=await mk(browser,'host-'+g),G=await mk(browser,'guest-'+g);
    const errs=[];G.on('pageerror',e=>errs.push('guest: '+e.message));H.on('pageerror',e=>errs.push('host: '+e.message));
    try{
    const gid=await H.evaluate(([g,xf,allbot,score])=>{switchGame(g);resetScores();if(!score){const X=window[xf]?window[xf]():eval(xf+'()');if(g==='yahtzee')X.roller=1;else X.play=1}else if(xf){try{const X=eval(xf+'()');if(g==='yahtzee')X.roller=0;else X.play=0}catch(e){}}
      const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=(score?['Guest','Mom','Dad','Kid']:['Guest','Bot A','Bot B','Bot C'])[i]||'';if(!score&&i<4&&(i>0||allbot))p.bot='normal';else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P[0].id},[g,XF[g],!!process.env.ALLBOT,SCORE]);
    if(process.env.ALLBOT)await H.evaluate(()=>{window.__htfast=1});await H.evaluate(()=>lkHostStart());await W(2500);
    const code=await H.evaluate(()=>S.lk&&S.lk.code);
    await H.evaluate(()=>lkPick(null));await W(500);
    await G.evaluate(c=>lkJoin(c),code);await W(3000);
    await G.evaluate(id=>lkPick(id),gid);await W(1500);
    await G.evaluate(()=>{window.__pushes=[];const f=window.FTLINK.push.bind(window.FTLINK);window.FTLINK.push=u=>{const d={};if(u.ps)d.ps=Object.keys(u.ps).map(id=>{const a=LKLAST.ps[id];return id});if(u.mops)d.m=u.mops.map(([s])=>s.join('.'));if(u.order)d.order=1;if(u.items)d.items=Object.keys(u.items);window.__pushes.push(d);return f(u)}});
    await G.evaluate(()=>{window.__base={...LKLAST.ps};const r=window.lkRecv;window.lkRecv=u=>{r(u);window.__base={...LKLAST.ps}};const f=window.FTLINK.push;window.FTLINK.push=u=>{if(u.ps)for(const id in u.ps){const was=JSON.parse(window.__base[id]||'{}'),now=JSON.parse(u.ps[id]);const ks=[...new Set([...Object.keys(was),...Object.keys(now)])].filter(k=>JSON.stringify(was[k])!==JSON.stringify(now[k]));window.__pushes.push({diff:(act().find(p=>p.id===id)||{}).name,ex:ks.slice(0,4).map(k=>k+':'+String(JSON.stringify(was[k])).slice(0,70)+' => '+String(JSON.stringify(now[k])).slice(0,70))});window.__base[id]=u.ps[id]}return f(u)}});
    {const end=Date.now()+(+(process.env.T||20000));while(Date.now()<end){await W(3000);await G.evaluate(()=>{const b=document.querySelector('[data-a=lkopen]');if(b)b.click()})}}
    const p=(await G.evaluate(()=>window.__pushes)).filter(d=>!(d.m&&d.m.length&&d.m.every(x=>x.startsWith('cbp'))&&!d.ps&&!d.order&&!d.items));/* sharing your card back once is on purpose */const sc=await G.evaluate(()=>S.screen);const hs=await H.evaluate(()=>S.screen+' started='+S.started);
    res[g]={pushes:p.length,detail:p.slice(0,6),guestScreen:sc,host:hs,errs:errs.slice(0,3)};
    }catch(e){res[g]={fail:e.message.slice(0,200),errs}}
    {const r=res[g];ok(`${g}${SCORE?' (score)':process.env.ALLBOT?' (bots playing)':''}: guest sends nothing by itself`,!r.fail&&r.pushes===0&&!r.errs.length,r)}
    await H.context().close();await G.context().close()}
  await done(browser)})();
