// Codenames recap picture: play a quick one-device game, tap "Share a picture of this game", check the picture is made.
const {mk,W,ok,done,chromium}=require('./link.js');const fs=require('fs');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'one');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const x=document.createElement('button');x.dataset.a=a;if(k!=null)x.dataset.k=k;document.body.appendChild(x);x.click();x.hidden=true};
    c('cnstart','1');S.players.forEach((p,i)=>{p.on=i<4;p.name=['Ann','Bob','Cy','Di'][i];p.bot=null});save();c('start')});await W(1000);
  await P.evaluate(()=>{const g=S.cng;cnMove(g,'x',{a:'begin'});let n=0;const pick=t=>g.key.findIndex((c,i)=>!g.rev[i]&&c===t);
    const clues=['OCEAN','FOREST','KITCHEN','SPACE','MUSIC','CASTLE','WINTER','GARDEN'];
    while(g.phase!=='done'&&n<12){cnMove(g,g.spy[g.turn],{a:'clue',w:clues[n%8]+(n>7?'X':''),n:2});n++;const t=g.turn;cnMove(g,'x',{a:'pick',i:pick(t)});
      if(g.phase==='guess'&&g.turn===t)cnMove(g,'x',{a:'pick',i:n%3?pick(t):g.key.findIndex((c,i)=>!g.rev[i]&&c==='n')});if(g.phase==='guess')cnMove(g,'x',{a:'stop'})}
    if(g.phase!=='done'){cnMove(g,g.spy[g.turn],{a:'clue',w:'LAST',n:-1});cnMove(g,'x',{a:'pick',i:g.key.indexOf('x')})}save();render()});await W(400);
  const r=await P.evaluate(async()=>{const b=document.querySelector('[data-a="cnushare"]');if(!b)return {err:'no button'};b.click();await new Promise(r=>setTimeout(r,2500));
    const cv=window.__cnRecap;return {msg:CNSHARE,w:cv&&cv.width,h:cv&&cv.height,url:cv&&cv.toDataURL('image/png')}});
  if(r.url&&process.env.SHOT)fs.writeFileSync('/tmp/cn-recap.png',Buffer.from(r.url.split(',')[1],'base64'));
  ok('Recap: “Share a picture of this game” makes a 1080×1350 picture of the board, the clues and the winner',r.w===1080&&r.h===1350&&/Picture/.test(r.msg||''),{msg:r.msg,w:r.w,h:r.h,err:r.err});
  ok('No page errors',!errs.length,errs.slice(0,4));
  await done(browser)})();
