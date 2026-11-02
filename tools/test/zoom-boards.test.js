// Zoom and pan on the shared boards of the playable games: Mexican Train, Chicken Foot, Quacks, Stone Age, Citadels and Dominion.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];
  for(const [pre,game,key] of [['mt','mextrain','mt'],['cf','chicken','cf'],['qp','quacks','qp'],['sa','stoneage','sa'],['ci','citadels','ci'],['dn','dominion','dn']]){
    const P=await mk(browser,'zm'+key);P.on('pageerror',e=>errs.push(game+': '+e.message));
    await P.evaluate(pre=>{window.__htfast=1;SET.toursOff=true;S.screen='home';render();const c=a=>{const bt=document.createElement('button');bt.dataset.a=a;bt.dataset.k='1';bt.hidden=true;document.body.appendChild(bt);bt.click();bt.remove()};c(pre+'start');S.players.forEach((q,i)=>{q.on=i<3;q.name=['Ann','Bob','Cy'][i];q.bot='normal'});save();c('start')},pre);
    let t=0;while(t++<40&&!(await P.evaluate(k=>!!document.querySelector(`.zmbox[data-zk="${k}"]`),key)))await W(250);
    const r=await P.evaluate(async key=>{const q=()=>document.querySelector(`.zmbox[data-zk="${key}"]`);if(!q())return 'no board';q().scrollIntoView({block:'start'});
      const btn=k=>q().querySelector(`[data-zm="${k}"]`);if(!btn('out').disabled)return 'out enabled at 1x';btn('in').click();const z=ZM[key];if(!(z.s>1.4))return 'no zoom in '+z.s;
      render();const keep=q().querySelector('.zmin').style.transform.includes('scale(1.5)')&&!btn('out').disabled;if(!keep)return 'lost on redraw';
      /* drag pans, and the tap at the end of a drag is swallowed */
      const r0=q().getBoundingClientRect(),x0=r0.left+r0.width/2,y0=Math.max(r0.top,0)+60,el0=q().querySelector('.zmin');const ev=(t,x,y,id=1)=>(q()||el0).querySelector('.zmin').dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:x,clientY:y,pointerId:id,isPrimary:id===1}));
      const x1=z.x;ev('pointerdown',x0,y0);ev('pointermove',x0-40,y0);ev('pointermove',x0-80,y0);ev('pointerup',x0-80,y0);const panned=z.x<x1;let fired=false;const h=()=>fired=true;document.addEventListener('click',h);q().querySelector('.zmin').dispatchEvent(new MouseEvent('click',{bubbles:true}));document.removeEventListener('click',h);
      /* pinch */
      await new Promise(r=>setTimeout(r,400));const s1=z.s;ev('pointerdown',x0-30,y0,1);ev('pointerdown',x0+30,y0,2);ev('pointermove',x0-60,y0,1);ev('pointermove',x0+60,y0,2);ev('pointerup',x0-60,y0,1);ev('pointerup',x0+60,y0,2);const pinched=z.s>s1+.3;
      btn('fit').click();const fit=z.s===1&&z.x===0&&z.y===0&&btn('out').disabled;return panned&&!fired&&pinched&&fit?true:{panned,fired,pinched,fit,s:z.s}},key);
    ok(`${game}: zoom buttons, drag to pan (no stray tap), pinch, fit, and it stays zoomed through a redraw`,r===true,r);await P.close()}
  {const P=await mk(browser,'zmqpme');P.on('pageerror',e=>errs.push('quacks me: '+e.message));
    await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;S.screen='home';render();const c=a=>{const bt=document.createElement('button');bt.dataset.a=a;bt.dataset.k='1';bt.hidden=true;document.body.appendChild(bt);bt.click();bt.remove()};c('qpstart');S.players.forEach((q,i)=>{q.on=i<3;q.name=['Ann','Bob','Cy'][i];q.bot=i?'normal':null});save();c('start')});
    let t=0;while(t++<60&&!(await P.evaluate(()=>!!document.querySelector('.qpme .zmbox[data-zk="qpme"] .qppot'))))await W(250);
    const r=await P.evaluate(async()=>{const q=()=>document.querySelector('.zmbox[data-zk="qpme"]');if(!q())return 'no pot box';const n=q().querySelector('[data-zm="in"]');n.click();const a=ZM.qpme.s>1.4;
      document.querySelector('[data-a="qpfocus"]').click();await new Promise(r=>setTimeout(r,500));const big=document.body.classList.contains('qpfocus')&&!!q()&&ZM.qpme.s>1.4&&q().querySelector('.zmin').style.transform.includes('scale(1.5)');
      q().querySelector('[data-zm="in"]').click();const more=ZM.qpme.s>2;q().querySelector('[data-zm="fit"]').click();const fit=ZM.qpme.s===1;
      const pot=q().querySelector('.qppot'),me=document.querySelector('.qpme');const fills=pot.offsetWidth>me.clientWidth*.7;document.querySelector('[data-a="qpfocus"]').click();return a&&big&&more&&fit&&fills?true:{a,big,more,fit,fills}});
    ok('Quacks: your own pot zooms too, in the normal view and in ⛶ Big pot (which still fills the screen)',r===true,r);await P.screenshot({path:'/tmp/qpme.png'});await P.close()}
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
