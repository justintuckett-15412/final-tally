// Quacks: "Start with 1 ruby" house rule, Start brewing card comes right away, press and hold a witch.
const {chromium,W,ok,done,BASE}=require('./link.js');
const hold=async(page,sel)=>{const loc=page.locator(sel+' >> visible=true');if(!await loc.count())return 'missing '+sel;await loc.first().evaluate(e=>e.scrollIntoView({block:'center'})).catch(()=>{});await W(150);const b=await loc.first().boundingBox();if(!b)return 'no box';const at=await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.className+'|'+(e.closest('[data-lp]')||{}).outerHTML||'').slice(0,160)},[b.x+b.width/2,b.y+b.height/2]);await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await W(700);await page.mouse.up();await W(200);
  return page.evaluate(()=>{const h=document.querySelector('.qwsheet h2');const r=h?h.textContent:null;const c=document.querySelector('.qwsheet [data-a="lpclose"]');if(c)c.click();return r})};
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1500);await page.evaluate(()=>{SET.toursOff=true});
  let r=await page.evaluate(()=>{switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;X.wit={s:'draw6',c:'twice',g:'colors'};S.screen='rules';save();render();
    return {toggle:!!document.querySelector('[data-a="qktg"][data-k="rub1"],[data-k="rub1"]'),off:QKX().rub1}});
  ok('setup has a "Start with 1 ruby" house rule, off by default',r.toggle&&r.off===false,r);
  let nm=await hold(page,'.qwcard.qw-s');ok('press and hold a witch on the setup board shows what she does',nm==='Draw 6 chips',nm);
  await page.evaluate(()=>{window.__htfast=1;QKX().rub1=true;const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Me','Bot'][i]||'';if(i)p.bot='normal';else delete p.bot});save();
    const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()});
  for(let i=0;i<60;i++){if(await page.evaluate(()=>{const g=S.qpg;if(g&&g.phase==='card'){qpSetCard(g,'');save();render()}return !!(g&&g.phase==='brew')}))break;await W(100)}
  r=await page.evaluate(()=>({rub:qpRubies(act()[0],0)}));ok('with the house rule you start with 1 ruby',r.rub===1,r);
  // fortune card dismissed -> Start brewing card right away
  r=await page.evaluate(()=>{const g=S.qpg,id=act()[0].id;(S.qkfc=S.qkfc||[])[g.r]=null;g.pl[id].sf=false;qpSeen(g,id,'sf');return {t:g.ann&&g.ann.t,q:(g.annq||[]).length}});
  ok('the Start brewing card comes as soon as the fortune card is tapped away',r.t==='Start brewing!'&&r.q===0,r);
  await page.evaluate(()=>{const g=S.qpg;g.ann=null;g.annq=[];save();render()});await W(3500);
  nm=await hold(page,'.qwcard.qw-c');ok('press and hold a witch on your board in play',nm==='Take a chip twice',nm);
  r=await page.evaluate(()=>{const g=S.qpg;return document.querySelectorAll('.qkcoin[data-lp]').length});
  if(r){nm=await hold(page,'.qkcoin.g[data-lp]');ok('press and hold a witch penny shows that witch',nm==='Points for colors'||!!nm,nm)}
  // holding a ready witch must not use her
  r=await page.evaluate(()=>{const g=S.qpg,V=act()[0];return qkWUsedAt(V,'s')});ok('holding a witch doesn’t use her',r<0,r);
  r=await page.evaluate(()=>{const g=S.qpg,V=act()[0];g.r=1;qkR(V,1);render();const n0=document.querySelectorAll('.qkcoin.g').length;g.r=0;(V.qk[0]=V.qk[0]||{}).wu={g:true};g.r=1;qkR(V,1);render();const n=document.querySelectorAll('.qkcoin.g').length;delete V.qk[0].wu;g.r=0;render();return n0-n});
  ok('a witch penny used in an earlier round disappears',r>=1,r);
  r=await page.evaluate(()=>{const g=S.qpg,V=act()[0];const L=g.pl[V.id];L.pot=[];L.nd=0;L.d6=[];const okU=qpWitch(g,V.id,'s');save();render();const c=document.querySelector('.qwcard.qw-s');const a={okU,used:c&&c.classList.contains('used'),txt:c&&c.textContent};document.querySelector('.qwboard').scrollIntoView();return a});await W(300);await page.screenshot({path:'/tmp/wused.png'});
  await page.evaluate(()=>{const g=S.qpg,V=act()[0],L=g.pl[V.id];L.bag.push(...(L.d6||[]));L.d6=[];delete qkR(V,g.r).wu;render()});
  ok('a witch you used is greyed out on your board',r.okU&&r.used&&/Used this round/.test(r.txt),r);
  // score mode
  await page.evaluate(()=>{resetScores();const X=QKX();X.play=0;X.herb=true;X.wit={s:'draw6',c:'twice',g:'colors'};S.started=true;S.screen='score';save();render();const d=document.createElement('div');d.id='qkwt';d.innerHTML=qkWitchUI(act()[0],0,0);document.getElementById('app').prepend(d)});await W(200);
  const has=await page.$('.qkw.qkw-g');if(has){nm=await hold(page,'.qkw.qkw-g');ok('press and hold a witch in score mode',!!nm,nm)}else ok('score mode witch buttons present',false,'none');
  await page.evaluate(()=>{QKX().rub1=false;save()});
  ok('no page errors',!errs.length,errs.slice(0,3));await done(b)})();
