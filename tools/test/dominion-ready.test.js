// Linked Dominion: the "I'm ready" card sits above the turn dock, so the player whose turn it is can tap it
// (it used to hide behind the dock while the dim background blocked the screen).
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  await G.setViewportSize({width:820,height:1180});
  const ids=await H.evaluate(()=>{window.__htfast=1;switchGame('dominion');resetScores();Object.assign(DNX(),{play:1,kd:['village','smithy','militia','market','cellar','moat','remodel','workshop','witch','lab'],ev:[],evm:'none'});const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Laptop','Pixel','iPad','Bot'][i]||'';if(i===3)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();const g=S.dng;const P2=act();g.turn=P2[2].id;g.me[P2[2].id].h=['copper','copper','estate','estate','copper'];save();return P2.map(p=>p.id)});
  await W(500);await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[2]);await W(3000);
  const r=await G.evaluate(()=>{const b=document.querySelector('[data-a="glready"]');if(!b)return {none:true,turn:dnG()&&dnG().turn===S.lk.me};const bx=b.getBoundingClientRect();const el=document.elementFromPoint(bx.left+bx.width/2,bx.top+bx.height/2);return {top:el===b||b.contains(el),cls:el&&el.className}});
  await G.screenshot({path:'/tmp/dnready.png'});
  ok('Linked Dominion: the Ready button is on top on the player whose turn it is',r.top,r);
  await readyAll([G,H]);await W(1000);
  ok('Linked Dominion: after Ready, the Supply can be tapped',await G.evaluate(()=>{const b=document.querySelector('[data-a="dnppile"][data-k="silver"]');if(!b)return false;b.scrollIntoView({block:'center'});const bx=b.getBoundingClientRect();const el=document.elementFromPoint(bx.left+bx.width/2,bx.top+bx.height/2);return !!el&&b.contains(el)}),await G.evaluate(()=>{const b=document.querySelector('[data-a="dnppile"][data-k="silver"]');if(!b)return 'nopile';const bx=b.getBoundingClientRect();const el=document.elementFromPoint(bx.left+bx.width/2,bx.top+bx.height/2);return [el&&el.className,el&&el.outerHTML.slice(0,200),document.querySelector('.glrdy')&&document.querySelector('.glrdy').outerHTML.slice(0,300)]}));
  await G.screenshot({path:'/tmp/dnready2.png'});
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
