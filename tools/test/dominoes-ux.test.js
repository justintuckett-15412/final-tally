// Mexican Train and Chicken Foot: Go back (while it's still your turn) and "why not?" notes (Justin, Nov 26).
// One phone, a person (Ann) and a computer player (Bob); the round is set up by hand so the taps are predictable.
process.env.LAT=process.env.LAT||'60';process.env.JIT=process.env.JIT||'60';
const {mk,W,ok,done,chromium}=require('./link.js');
const start=(P,pre,X)=>P.evaluate(([pre,X])=>{window.__htfast=1;SET.toursOff=true;S.screen='home';render();const c=a=>{const bt=document.createElement('button');bt.dataset.a=a;bt.dataset.k='1';bt.hidden=true;document.body.appendChild(bt);bt.click();bt.remove()};
  c(pre+'start');Object.assign(pre==='mt'?MTX():CFX(),X);S.players.forEach((q,i)=>{q.on=i<2;q.name=['Ann','Bob'][i];q.bot=i?'normal':null});save();c('start')},[pre,X]);
const tap=(P,sel)=>P.evaluate(sel=>{const b=document.querySelector(sel);if(!b)return false;b.click();return true},sel);
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---------- Mexican Train ---------- */
  {const P=await mk(browser,'dmt');P.on('pageerror',e=>errs.push('mt: '+e.message));
    await start(P,'mt',{play:1,start:'build',set:12});
    let t=0;while(t++<40&&!(await P.evaluate(()=>!!S.mtg)))await W(200);
    /* Ann's first turn: build your train. 12|12 in the station; she holds 12-3, 3-5, 3-3 and 9-9 */
    await P.evaluate(()=>{const g=S.mtg,[a,b]=g.ps;g.turn=a;g.bt=true;g.built={};g.need=[];g.bonus=0;g.drew=0;g.h[a]=['3-12#900','3-5#901','3-3#902','9-9#903'];g.tr[a]={t:[],end:12,open:false,blk:false};g.tr[b]={t:[],end:12,open:false,blk:false};g.ux=null;MTVIEW=a;save();render()});
    const play=(t,k)=>P.evaluate(([t,k])=>{MTSEL=t;const b=document.querySelector(`.mtrow[data-k="${k==='me'?S.mtg.ps[0]:k}"]`);if(!b)return false;b.click();return true},[t,k]);
    ok('MT: no Go back before playing',!(await P.evaluate(()=>!!document.querySelector('[data-a="mtpundo"]'))));
    const w0=await P.evaluate(()=>{const r=document.querySelector(`.mtrow[data-k="${S.mtg.ps[1]}"] .uxwhy`);return r&&r.textContent});
    ok('MT: while building, another train says why not',w0==='Build your own train first',w0);
    const hw=await P.evaluate(()=>{const r=document.querySelector('.mtme .uxwhy');return r&&r.textContent});
    ok('MT: greyed dominoes in hand say why',/Doesn’t fit your train \(ends on 12\)/.test(hw||''),hw);
    await play('3-12#900','me');await play('3-5#901','me');
    let s=await P.evaluate(()=>({n:S.mtg.tr[S.mtg.ps[0]].t.length,h:S.mtg.h[S.mtg.ps[0]].length,b:!!document.querySelector('[data-a="mtpundo"]')}));
    ok('MT: built 2 dominoes and Go back shows',s.n===2&&s.h===2&&s.b,s);
    await tap(P,'[data-a="mtpundo"]');
    s=await P.evaluate(()=>({n:S.mtg.tr[S.mtg.ps[0]].t.length,h:S.mtg.h[S.mtg.ps[0]].length,turn:S.mtg.turn===S.mtg.ps[0],b:!!document.querySelector('[data-a="mtpundo"]'),end:S.mtg.tr[S.mtg.ps[0]].end,lg:(S.mtg.lg||[]).slice(-1)[0].t}));
    ok('MT: Go back puts both dominoes back in the hand, still Ann’s turn',s.n===0&&s.h===4&&s.turn&&!s.b&&s.end===12&&/went back$/.test(s.lg),s);
    await play('3-12#900','me');
    ok('MT: Go back again after a new play',await P.evaluate(()=>!!document.querySelector('[data-a="mtpundo"]')));
    await tap(P,'[data-a="mtpdone"]');
    s=await P.evaluate(()=>({turn:S.mtg.turn===S.mtg.ps[1],ux:!!S.mtg.ux}));
    ok('MT: Done building ends the turn and Go back is gone',s.turn&&!s.ux,s);
    /* a double: play again, Go back; then drawing ends it */
    await P.evaluate(()=>{const g=S.mtg,[a,b]=g.ps;g.turn=a;g.bt=false;g.built={[a]:1,[b]:1};g.need=[];g.bonus=0;g.drew=0;g.h[a]=['3-3#902','9-9#903'];g.tr[a]={t:[[12,3]],end:3,open:false,blk:false};g.tr[b]={t:[[12,7]],end:7,open:false,blk:false};g.tr.mx={t:[],end:12,open:true,blk:false};g.ux=null;save();render()});
    const w1=await P.evaluate(()=>{const r=document.querySelector(`.mtrow[data-k="${S.mtg.ps[1]}"] .uxwhy`);return r&&r.textContent});
    ok('MT: a closed train says why not',w1==='Closed: no marker on it',w1);
    await play('3-3#902','me');
    s=await P.evaluate(()=>({bonus:S.mtg.bonus,b:!!document.querySelector('[data-a="mtpundo"]'),why:(document.querySelector(`.mtrow[data-k="mx"] .uxwhy`)||{}).textContent}));
    ok('MT: after a double, Go back shows (you play again)',s.bonus===1&&s.b,s);
    ok('MT: the Mexican train says why it can’t take one now',s.why==='Cover the 3|3 first'||/Nothing of yours matches 12/.test(s.why||''),s.why);
    const y0=await P.evaluate(()=>S.mtg.yard.length);
    await tap(P,'[data-a="mtpdraw"]');
    s=await P.evaluate(()=>({y:S.mtg.yard.length,ux:!!S.mtg.ux,b:!!document.querySelector('[data-a="mtpundo"]')}));
    ok('MT: drawing from the boneyard ends Go back',s.y===y0-1&&!s.ux&&!s.b,s);
    await P.close()}
  /* ---------- Chicken Foot ---------- */
  {const P=await mk(browser,'dcf');P.on('pageerror',e=>errs.push('cf: '+e.message));
    await start(P,'cf',{play:1,set:9,center:6});
    let t=0;while(t++<40&&!(await P.evaluate(()=>!!S.cfg)))await W(200);
    /* middle full; one open line ending on 4. Ann holds the 4|4 (a chicken foot) and the 4|1 */
    await P.evaluate(()=>{const g=S.cfg,[a]=g.ps;g.turn=a;g.bonus=0;g.drew=0;g.np=0;g.nodes=[{v:9,need:1,ln:[0],blk:false,by:null}];g.lines=[{node:0,t:[[9,4]],end:4,closed:false},{node:0,t:[[9,8]],end:8,closed:false}];g.nodes[0].ln=[0,1];g.nodes[0].need=2;
      g.h[a]=['4-4#900','1-4#901','2-2#902'];g.ux=null;CFVIEW=a;save();render()});
    const play=(t,s)=>P.evaluate(([t,s])=>{CFSEL=t;const b=document.querySelector(`.mtrow[data-k="${s}"]`);if(!b)return false;b.click();return true},[t,s]);
    const w0=await P.evaluate(()=>{const r=document.querySelector('.mtrow[data-k="l1"] .uxwhy');return r&&r.textContent});
    ok('CF: a line nothing fits says why not',w0==='Nothing of yours matches 8',w0);
    await play('4-4#900','l0');
    let s=await P.evaluate(()=>({b:!!document.querySelector('[data-a="cfpundo"]'),bonus:S.cfg.bonus,nodes:S.cfg.nodes.length,why:(document.querySelector('.mtrow[data-k="l1"] .uxwhy')||{}).textContent,hw:(document.querySelector('.mtme .uxwhy')||{}).textContent}));
    ok('CF: after a chicken foot double, Go back shows',s.b&&s.bonus===1&&s.nodes===2,s);
    ok('CF: other lines say the chicken foot comes first',/^Finish the 4\|4 first \(3 more\)$/.test(s.why||''),s.why);
    ok('CF: greyed dominoes in hand say why',/Only the 4\|4 can take a domino now/.test(s.hw||''),s.hw);
    await tap(P,'[data-a="cfpundo"]');
    s=await P.evaluate(()=>({h:S.cfg.h[S.cfg.ps[0]].length,nodes:S.cfg.nodes.length,end:S.cfg.lines[0].end,turn:S.cfg.turn===S.cfg.ps[0],ux:!!S.cfg.ux}));
    ok('CF: Go back takes the double back',s.h===3&&s.nodes===1&&s.end===4&&s.turn&&!s.ux,s);
    await play('1-4#901','l0');
    s=await P.evaluate(()=>({played:!S.cfg.h[S.cfg.ps[0]].includes('1-4#901'),moved:(S.cfg.lg||[]).length>=0&&S.cfg.turn!==S.cfg.ps[0]||S.cfg.lines.some(L=>L.t.length>2),ux:!!S.cfg.ux,b:!!document.querySelector('[data-a="cfpundo"]')}));
    ok('CF: a normal play ends the turn, no Go back',s.played&&!s.ux&&!s.b,s);
    await P.close()}
  /* ---------- Mexican Train on linked phones: the guest's Go back goes to the host like any other move ---------- */
  {const H=await mk(browser,'dmth'),G=await mk(browser,'dmtg');H.on('pageerror',e=>errs.push('host: '+e.message));G.on('pageerror',e=>errs.push('guest: '+e.message));
    const gid=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('mextrain');resetScores();Object.assign(MTX(),{play:1,start:'build',set:12});S.players.forEach((p,i)=>{p.on=i<2;p.name=['Guest','Bot'][i]||'';if(i===1)p.bot='normal';else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return S.players[0].id});
    await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(()=>lkPick(null));await W(500);
    await G.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(3000);await G.evaluate(id=>lkPick(id),gid);await W(1500);
    for(let i=0;i<30&&!(await H.evaluate(()=>!!S.mtg));i++)await W(300);
    await H.evaluate(gid=>{const g=S.mtg,b=g.ps.find(x=>x!==gid);g.turn=gid;g.bt=true;g.built={};g.need=[];g.bonus=0;g.drew=0;g.h[gid]=['3-12#900','3-5#901','9-9#903'];g.tr[gid]={t:[],end:12,open:false,blk:false};g.tr[b]={t:[],end:12,open:false,blk:false};g.ux=null;g.n=(g.n||0)+5;save();render()},gid);
    const gsee=c=>G.evaluate(c);let ready=false;for(let i=0;i<30&&!ready;i++){await W(300);ready=await gsee(()=>{const b=document.querySelector('[data-a=lkopen]');if(b)b.click();const g=S.mtg;return !!g&&g.turn===S.lk.me&&(g.h[S.lk.me]||[]).includes('3-12#900')&&!!document.querySelector(`.mtrow[data-k="${S.lk.me}"]`)})}
    ok('Linked MT: the guest sees its building turn',ready);
    await G.evaluate(()=>{MTSEL='3-12#900';document.querySelector(`.mtrow[data-k="${S.lk.me}"]`).click()});
    let b=false;for(let i=0;i<30&&!b;i++){await W(300);b=await G.evaluate(()=>!!document.querySelector('[data-a="mtpundo"]')&&!lkqWaiting())}
    const hs=await H.evaluate(gid=>({n:S.mtg.tr[gid].t.length,ux:!!S.mtg.ux}),gid);
    ok('Linked MT: the host applied the guest’s play and the guest sees Go back',b&&hs.n===1&&hs.ux,{b,hs});
    await G.evaluate(()=>document.querySelector('[data-a="mtpundo"]').click());
    let back=null;for(let i=0;i<30;i++){await W(300);back=await H.evaluate(gid=>({n:S.mtg.tr[gid].t.length,h:S.mtg.h[gid].length,ux:!!S.mtg.ux,turn:S.mtg.turn===gid}),gid);if(back.n===0)break}
    let gb=null;for(let i=0;i<20;i++){await W(300);gb=await G.evaluate(()=>({n:S.mtg.tr[S.lk.me].t.length,b:!!document.querySelector('[data-a="mtpundo"]')}));if(gb.n===0)break}
    ok('Linked MT: Go back on the guest undoes the play on the host and on the guest',back.n===0&&back.h===3&&!back.ux&&back.turn&&gb.n===0&&!gb.b,{back,gb});
    await H.close();await G.close()}
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
