// Playable Wyrmspan (base game): setup, the three actions, exploring, the Dragon Guild, hatchlings, rounds and objectives,
// whole computer games for 2–5 players, the screen, and the reveal into the Wyrmspan score pad.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'wz');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('wzstart','1');
    S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed'][i];p.bot=null});save();c('start')});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,500)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const di=n=>WYD.find(d=>d.n===n).no;
    const G=(n)=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot=null});const g=wzDeal();g.ann=null;while(g.ask){const a=g.ask;wzMove(g,a.pid,{v:a.opts[0].v})}return g};
    const put=(g,p,cv,col,name,e=0)=>{const M=g.P[p].mat[cv];for(let i=0;i<=col;i++)if(!M[i])M[i]={cv:1,d:null};M[col].d={id:di(name),e,c:0,t:0,cr:{}};return cv+col};
    t('Setup: 6 coins, 1 egg in a mat nest, 4 cards kept of 6, 3 resources; 3 dragons and 3 caves on display; 4 different objectives',()=>{const g=G(3),p=g.P[g.ps[0]];
      return {ok:p.coin===6&&p.nest===1&&wzCards(g,g.ps[0])===4&&wzRes(g,g.ps[0])===3&&g.disp.d.every(x=>x!=null)&&g.disp.c.every(x=>x!=null)&&new Set(g.obj).size===4&&g.phase==='play',coin:p.coin,cards:wzCards(g,g.ps[0])}});
    t('Excavate: 1 coin for space 2, plus 1 egg for space 3; the cave card goes on the leftmost undug space and its benefit happens',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      const gainCoin=WYCV.find(c=>JSON.stringify(c.op)==='[["g","coin"]]').no;P.hand.c=[gainCoin,gainCoin];P.coin=5;P.nest=2;
      wzMove(g,a,{a:'exc',cv:'c',i:0});const one=P.mat.c[1]&&P.mat.c[1].cv===gainCoin&&P.coin===5;g.turn=a;wzMove(g,a,{a:'exc',cv:'c',i:0});
      return {ok:one&&P.mat.c[2]&&P.coin===5&&P.nest===1,one,coin:P.coin,nest:P.nest}});
    t('Entice: 1 coin + the printed cost (2-for-1 trades cover a gap); dragons fill a cave left to right on dug spaces; when-played effects happen',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      const id=di('Hostile Northern Fire Dragon');P.hand.d=[id];P.coin=4;P.res={meat:0,gold:0,crys:0,milk:0};const D=wzD(id);WZR.forEach(r=>{if(D.cost[r])P.res[r]=D.cost[r]});
      const r0=Object.keys(D.cost).find(r=>WZR.includes(r));P.res[r0]--;P.res[WZR.find(r=>!D.cost[r])]+=2;const cv=D.cv[0];
      const ok1=wzMove(g,a,{a:'ent',i:0,cv});while(g.ask)wzMove(g,g.ask.pid,{v:g.ask.opts[0].v});
      return {ok:ok1&&P.mat[cv][0].d&&P.mat[cv][0].d.id===id&&P.coin===3-(D.cost.coin||0)&&wzRes(g,a)===0,coin:P.coin,res:P.res}});
    t('Explore: pay 1 coin, entrance benefit, each dragon then the benefit after it, stop at the first empty space; 2nd time costs an egg',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;
      put(g,a,'g',0,WYD.find(d=>d.ty==='E'&&d.cv.includes('g')).n);const d0=P.hand.d.length,c0=P.coin,gp=P.gpos;
      wzMove(g,a,{a:'exp',cv:'g'});while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts.find(o=>o.v==='deck')?'deck':g.ask.opts[0].v});
      const first=P.hand.d.length===d0+1&&P.gpos===gp+1&&P.coin===c0-1;g.turn=a;P.nest=1;wzMove(g,a,{a:'exp',cv:'g'});while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts[0].v});
      return {ok:first&&P.ex.g===2&&P.nest===0,first,ex:P.ex.g,nest:P.nest,d:P.hand.d.length-d0,gp:P.gpos-gp}});
    t('Dragon Guild: each step gains the space; the brown space lets you place a marker (ability now, guild end-game, or 6/3/1 points)',()=>{const g=G(2),[a,b]=g.ps,P=g.P[a];P.gpos=4;
      g.q=[{t:'adv1',pid:a},{t:'adv1',pid:a}];wzRun(g);const crys=P.res.crys;const asked=g.ask&&g.ask.pid===a&&g.ask.kind==='mark';wzMove(g,a,{v:4});
      g.P[b].gpos=5;g.q=[{t:'adv1',pid:b}];wzRun(g);wzMove(g,b,{v:4});g.ps.forEach(p=>g.P[p].mat.c[0].d=null);g.oc=[{},{},{},{}];
      const sa=wzScore(g,a).guild,sb=wzScore(g,b).guild;return {ok:asked&&P.gm===1&&sa===6&&sb===3,asked,sa,sb,gm:P.gm}});
    t('Hatchlings: caching its resource triggers its bonus every time, and the 3rd cache also grows it up',()=>{const g=G(2),[a]=g.ps,P=g.P[a];
      const H=WYD.find(d=>d.h&&d.h.r==='milk'&&d.h.each!=='vp'&&JSON.stringify(d.h.each).includes('"g"')&&!/any|[dc]/.test(d.h.each[0][1]));const k=put(g,a,'a',0,H.n);
      const tok=H.h.each[0][1];const before=tok==='coin'?P.coin:P.res[tok];P.res.milk=3;for(let i=0;i<3;i++){g.q=[{t:'adv',pid:a,k}];wzRun(g);while(g.ask&&g.ask.pid===a)wzMove(g,a,{v:g.ask.opts[0].v})}
      const after=tok==='coin'?P.coin:P.res[tok];return {ok:P.mat.a[0].d.c===3&&after>=before+3&&P.res.milk===0+(tok==='milk'?3:0),h:H.n,c:P.mat.a[0].d.c,before,after}});
    t('Round end: once-per-round dragons, the objective is counted (friendly ties, 0 = nothing), then 6 coins, 1 egg, display refreshed, next start player',()=>{const g=G(3),[a,b,c]=g.ps;
      g.obj[0]='eggs';g.P[a].nest=2;g.P[b].nest=2;g.P[c].nest=0;const d0=g.disp.d.slice();g.ps.forEach(p=>{g.P[p].coin=0;g.P[p].passed=true});const co=g.ps.map(p=>g.P[p].coin);
      g.q=[{t:'rend'}];wzRun(g);while(g.ask)wzMove(g,g.ask.pid,{skip:1});const pts=wzObjPts(g,0);
      return {ok:pts[a]===4&&pts[b]===4&&pts[c]===0&&g.rnd===1&&g.P[a].coin===6&&g.fp===b&&g.turn===b&&g.P[c].nest===1&&g.disp.d.join()!==d0.join(),pts,rnd:g.rnd}});
    t('End of turn: discard down to 9 cards and 9 resources; coins over 9 are lost; the display refills',()=>{const g=G(2),[a]=g.ps,P=g.P[a];g.turn=a;P.res={meat:5,gold:5,crys:0,milk:0};P.coin=12;
      wzMove(g,a,{a:'pass'});let k=0;while(g.ask&&g.ask.pid===a&&k++<20)wzMove(g,a,{v:g.ask.opts[0].v});return {ok:wzRes(g,a)===9&&P.coin===9,res:wzRes(g,a),coin:P.coin}});
    t('Every dragon and cave card has an effect the app can run, and our own wording for it',()=>{const bad=WYD.filter(D=>!(D.h||D.op||D.ty==='E')||/undefined/.test(wzDSay(D))).map(D=>D.n).concat(WYCV.filter(c=>/undefined/.test(wzCvSay(c.no))).map(c=>'cave '+c.no));
      return {ok:WYD.length===183&&WYCV.length===75&&!bad.length,bad}});
    const whole=n=>{S.players.forEach((x,i)=>{x.on=i<n;x.bot='normal'});const g=wzDeal();let k=0;while(g.phase!=='done'&&k++<30000){const q=act().find(x=>x.id===wzActor(g));if(!q||!wzBotStep(g,q))break}return g};
    for(const n of [2,3,4,5])t(`A whole computer game with ${n} players finishes and scores`,()=>{const g=whole(n);const T=g.fin?g.ps.map(p=>g.fin[p].tot):null;return {ok:g.phase==='done'&&T.every(v=>v>15),T,phase:g.phase,rnd:g.rnd}});
    S.players.forEach((x,i)=>{x.on=i<3;x.bot=null});return out});
  for(const [n,v,why] of R)ok(n,v,why);
  // the screen: one person and two computer players
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<3;x.bot=i?'normal':null});delete S.wzg;S.finished=false;S.screen='score';save();render()});await W(1500);
  const setup=await P.evaluate(async()=>{const clk=()=>{const b=[...document.querySelectorAll('.wzdock [data-a="wzans"]')][0];if(!b)return false;b.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true};
    const g=S.wzg,me=g.ps[0];for(let i=0;i<5;i++){if(!g.ask||g.ask.pid!==me)break;if(!clk())return 'no answer button';}return wzCards(g,me)===4&&wzRes(g,me)===3||[wzCards(g,me),wzRes(g,me),JSON.stringify(g.ask)]});
  ok('Through the screen: tap to put back 2 cards and pick 3 resources',setup===true,setup);
  await P.evaluate(()=>{const g=S.wzg;let k=0;while(g.ask&&k++<50){const q=act().find(x=>x.id===g.ask.pid);wzMove(g,q.id,{v:g.ask.opts[0].v})}g.ann=null;g.turn=g.ps[0];render()});await W(400);
  const tk=await P.evaluate(()=>{const g=S.wzg,me=g.ps[0],c0=g.P[me].coin;const b=[...document.querySelectorAll('[data-a="wzans"]')].find(x=>{const m=JSON.parse(decodeURIComponent(x.dataset.k));return m.a==='exp'&&m.cv==='c'});if(!b)return 'no explore button';
    b.dispatchEvent(new MouseEvent('click',{bubbles:true}));let k=0;while(g.ask&&g.ask.pid===me&&k++<10){const x=document.querySelector('.wzdock [data-a="wzans"]');if(!x)return 'no answer';x.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
    return g.P[me].coin===c0-1&&g.P[me].ex.c===1&&g.turn!==me||[g.P[me].coin,c0,g.turn,JSON.stringify(g.ask)]});
  await P.screenshot({path:'/tmp/wz-screen.png',fullPage:true});
  ok('Through the screen: tap Explore Crimson Cavern, answer its question: 1 coin paid and the turn passes',tk===true,tk);
  // the reveal
  await P.evaluate(()=>{S.players.forEach((x,i)=>{x.on=i<4;x.bot='normal'});const g=wzDeal();let k=0;while(g.phase!=='done'&&k++<30000){const q=act().find(x=>x.id===wzActor(g));if(!wzBotStep(g,q))break}g.ann=null;S.finished=false;S.screen='score';save();render()});await W(500);
  await P.screenshot({path:'/tmp/wz-end.png',fullPage:true});
  const rv=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.wzg;return act().every(p=>total(p)===g.fin[p.id].tot)||act().map(p=>[total(p),g.fin[p.id].tot,JSON.stringify(p.wy)])});
  ok('Finish & reveal: the Wyrmspan score pad gets every category and the round objectives, and totals match',rv===true,rv);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
