// Cover Your Kingdom over linked phones: 3 phones + 1 computer player play real turns by tapping (settle, add, discard,
// a recruit whose counter chain is answered on the other phone's pop-up, a nudge, a hire with a target tap), then the computer
// players finish the game and every phone's score table matches ckScore. Then a 2-player game takes Creatures from the Drafty Inn,
// and a Family-deck game on one phone shows the family pictures and names. Checks on every step: no phone's page holds another
// player's hand, the "Just watching" big board never shows a hand, no page errors. Screenshots at 400×850 and 360×640.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ck-shots';fs.mkdirSync(SHOT,{recursive:true});
const errs=[],leaks=[];
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const ids=await H.evaluate(([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('ckstart','1');(o.opts||[]).forEach(k=>c('ckuopt',k));const P=S.players,all=[...N,...(o.bots||[])];P.forEach((p,i)=>{p.on=i<all.length;p.name=all[i]||'';if(i>=N.length&&i<all.length)p.bot='normal';else delete p.bot});save();c('start');return P.slice(0,all.length).map(p=>p.id)},[names,o]);
  const unl=await H.evaluate(()=>({link:/Link the phones/.test(document.getElementById('app').innerText),g:!!S.ckg}));
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  let TV=null;if(o.tv){TV=await mk(browser,'TV'+names.length);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''))}
  [...PG,TV].filter(Boolean).forEach((p,i)=>p.on('pageerror',e=>errs.push(names.length+':'+i+': '+e.message)));
  await W(1500);return {PG,H,ids,TV,unl}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.ckg)));
/* host-only test hook: give Rulers exact hands (cards swap with the deck, so every card is still somewhere), set whose turn it is */
const rig=(H,spec,turn,extra)=>H.evaluate(([spec,turn,extra])=>{const g=S.ckg;for(const pid in spec){g.draw.push(...g.hand[pid]);g.hand[pid]=[]}
  for(const pid in spec)spec[pid].forEach(sp=>{const i=g.draw.findIndex(c=>g.cs[c]===sp);if(i<0)throw new Error('no '+sp);g.hand[pid].push(g.draw.splice(i,1)[0])});
  if(extra&&extra.inn)extra.inn.forEach(([pile,sp])=>{const P=g.inn[pile],i=g.draw.findIndex(c=>g.cs[c]===sp);const old=P.pop();P.push(g.draw.splice(i,1)[0]);g.draw.unshift(old)});
  if(turn){g.turn=turn;g.acts=0;g.free={};g.tried=[]}g.mt=[];save();render();return true},[spec,turn,extra]);
/* privacy: every hand card a phone shows is in its own hand; the big board shows none */
async function privacy(PG,TV,tag){for(const p of [...PG,TV].filter(Boolean)){const r=await p.evaluate(()=>{const g=CYK.ckGx();if(!g)return null;const me=S.lk.me,H=me?(g.hand[me]||[]):[];
    const shown=[...document.querySelectorAll('[data-hc]')].map(e=>+e.dataset.hc);return {me,bad:shown.filter(c=>!H.includes(c)),n:shown.length,big:!me}}).catch(()=>null);
  if(r&&(r.bad.length||r.big&&r.n))leaks.push([tag,r.me||'TV',r.bad.slice(0,4),r.n])}}
const tapHand=async(p,sp,n)=>{for(let i=0;i<(n||1);i++){const r=await p.evaluate(sp=>{const g=CYK.ckGx();const b=[...document.querySelectorAll('[data-hc]')].find(b=>g.cs[+b.dataset.hc]===sp&&b.getAttribute('aria-pressed')!=='true');if(!b)return false;b.click();return true},sp);if(!r)return false;await W(120)}return true};
const tap=(p,sel)=>p.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(!b)return false;b.click();return true},sel);
const tapText=(p,sel,re)=>p.evaluate(([sel,re])=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled&&new RegExp(re).test(b.textContent));if(!b)return false;b.click();return true},[sel,re]);
const txt=p=>p.evaluate(()=>document.getElementById('app').innerText);
/* answer anything a person is asked that the script isn't about (a computer player's recruit, a land to pick) */
async function settleAll(PG,ids,H){for(let n=0;n<30;n++){const g=await G(H);if(g.phase!=='play')return;const who=CYKwho(g).filter(p=>!g.bots[p]);if(!who.length||(!g.ch&&!g.pl&&!g.hy&&!g.fx))return;
  for(const pid of who){const p=PG[ids.indexOf(pid)];if(!p)continue;if(g.ch)await tap(p,'[data-a=ckupass]');else if(g.pl)await tap(p,'[data-a=ckuplace]');else if(g.hy){const n2=g.hy.n;for(let i=0;i<n2;i++)await tap(p,'[data-hc][aria-pressed=false]');await tap(p,'[data-a=ckuhyret]')}else if(g.fx)await tap(p,'[data-a=ckufx]')}await W(1500)}}
const CYKwho=g=>g.phase!=='play'?[]:g.pl?[g.pl.pid]:g.hy?[g.hy.by]:g.ch?[g.ch.ans]:g.fx?g.ps.filter(p=>g.fx.pick[p]===null):[g.turn];
const shot=async(p,name)=>{await p.evaluate(()=>{if(typeof LKOPEN!=='undefined'&&LKOPEN){LKOPEN=false;render()}});await p.setViewportSize({width:400,height:850});await W(400);await p.screenshot({path:`${SHOT}/${name}-400.png`});await p.setViewportSize({width:360,height:640});await W(400);await p.screenshot({path:`${SHOT}/${name}-360.png`});await p.setViewportSize({width:400,height:850});await W(200)};
(async()=>{const browser=await chromium.launch();
  /* ======== 3 phones + 1 computer player ======== */
  {const {PG,H,ids,TV,unl}=await setup(browser,['Mom','Dad','Kate'],{bots:['Robo'],tv:true});const [mom,dad,kate,bot]=ids;const [M,Dp,K]=PG;
    ok('Not linked yet with 3 people: the play screen asks to link the phones and nothing is dealt',unl.link&&!unl.g,unl);
    let g=await G(H);ok('Linked: the host deals; 4 Rulers, 6 cards each, the computer player is marked',g&&g.phase==='play'&&g.ps.length===4&&g.ps.every(p=>g.hand[p].length===6)&&g.bots[bot]===1&&!g.bots[mom],g&&{ph:g.phase,b:g.bots});
    const tv0=await TV.evaluate(()=>({big:document.documentElement.classList.contains('cykbigb'),rulers:document.querySelectorAll('.cykruler').length,hand:document.querySelectorAll('[data-hc]').length}));
    ok('Big board: “Just watching” shows every Kingdom and no hand',tv0.big&&tv0.rulers===4&&tv0.hand===0,tv0);
    /* Mom's turn: settle Yedis, then settle Bragons on top (Highland) */
    await rig(H,{[mom]:['yy','yy','br','br','sp','ct'],[dad]:['lc','lc','br','br','ct','yy'],[kate]:['pg','pg','mb','sc','ve','lc']},mom);await W(1500);
    await privacy(PG,TV,'start');
    const handN=await M.evaluate(()=>document.querySelectorAll('[data-hc]').length);ok('Your hand: Mom’s phone shows her 6 cards',handN===6,handN);
    await tapHand(M,'yy',2);await tap(M,'[data-a=ckuact][data-k=settle]');await W(1500);
    await tapHand(M,'br',2);await shot(M,'play-select');await tap(M,'[data-a=ckuact][data-k=settle]');await W(2000);
    g=await G(H);const hi=g.k[mom].high.map(C=>C.sp);
    ok('Settle (tapped twice): Mom’s Highland has a Yedi Clan covered by a Bragon Clan; her turn ended by itself',hi.join()==='yy,br'&&g.turn===dad,{hi,turn:g.turn});
    const peek=await Dp.evaluate(m=>{const s=document.querySelector(`[data-k="${m}:high"]`)||[...document.querySelectorAll('.cykruler')].find(r=>/Mom/.test(r.textContent));return document.querySelectorAll('.cykpeek').length},mom);
    ok('Dad’s phone shows Mom’s covered Yedi Clan as a peeking gem',peek>=1,peek);
    await privacy(PG,TV,'mom-done');
    /* Dad: settle LepreCons (Lowland, the only land), then recruit Mom's Bragon Clan */
    await tapHand(Dp,'lc',2);await tap(Dp,'[data-a=ckuact][data-k=settle]');await W(2000);
    await tapHand(Dp,'br',1);await tap(Dp,'[data-a=ckuact][data-k=recruit]');await W(300);
    const glow=await Dp.evaluate(m=>[...document.querySelectorAll('.cykland.tgt')].map(b=>b.dataset.k),mom);
    ok('Recruit: Mom’s Bragon Clan glows as the only target',glow.length===1&&glow[0]===mom+':high',glow);
    await tap(Dp,`[data-a=ckutgt][data-k="${mom}:high"]`);await W(2500);
    g=await G(H);const pop=await M.evaluate(()=>{const h=document.getElementById('cykch-h');return {t:h&&h.textContent,n:document.querySelectorAll('[data-a=ckucounter]').length}});
    ok('Challenge pop-up on Mom’s phone: “Dad wants your Bragon Clan! Counter or let it go?” with her counters',g.ch&&g.ch.ans===mom&&/Dad wants your Bragon Clan! Counter or let it go\?/.test(pop.t||'')&&pop.n>=2,{pop,ch:g.ch&&g.ch.ans});
    const ktx=await txt(K);ok('Kate (and the big board) see the challenge as it happens: “Waiting for Mom to answer”',/recruiting Mom’s Bragon Clan/.test(ktx)&&/Waiting for Mom to answer/.test(ktx),ktx.slice(0,300));
    await shot(M,'challenge');
    /* Kate nudges Mom */
    await tap(K,`[data-a=ckunudge][data-k="${mom}"]`);await W(2500);
    const nz=await M.evaluate(()=>{const t=document.querySelector('.toast.cyknzt');return t?t.textContent:''});
    ok('Nudge: Kate taps 🔔 Nudge Mom and Mom’s phone shows it',/Kate is waiting on your answer/.test(nz),nz);
    /* Mom counters with the Spydra (counts 2) */
    await tapText(M,'[data-a=ckucounter]','Spydra');await W(2500);
    g=await G(H);const dpop=await Dp.evaluate(()=>({t:(document.getElementById('cykch-h')||{}).textContent,o:[...document.querySelectorAll('[data-a=ckucounter]')].map(b=>b.textContent.trim())}));
    ok('Back to Dad’s pop-up: Mom is defending; a Spydra needs a pair (he can play Bragon + CT)',g.ch&&g.ch.ans===dad&&g.ch.need===2&&/Mom is defending the Bragon Clan/.test(dpop.t||'')&&dpop.o.some(x=>/Bragon/.test(x)&&/CT/.test(x)),{d:dpop,need:g.ch&&g.ch.need});
    await tapText(Dp,'[data-a=ckucounter]','Bragon');await W(2500);
    g=await G(H);ok('A pair is answered by any single card: Mom only needs one card now',g.ch&&g.ch.ans===mom&&g.ch.need===1,g.ch&&{a:g.ch.ans,n:g.ch.need});
    await tapText(M,'[data-a=ckucounter]','CT');await W(2500);
    g=await G(H);ok('Dad has nothing left: the chain ends, Mom keeps her Bragon Clan with every card played in it',!g.ch&&g.k[mom].high.slice(-1)[0].sp==='br'&&g.k[mom].high.slice(-1)[0].c.length===7&&g.turn===kate,{ch:!!g.ch,top:g.k[mom].high.slice(-1)[0],turn:g.turn});
    await privacy(PG,TV,'chain');
    /* Kate: settle Pigxies (Either land: she picks), then hire Mobgoblins at Mom's Bragon Clan */
    await tapHand(K,'pg',2);await tap(K,'[data-a=ckuact][data-k=settle]');await W(300);
    const ch=await K.evaluate(()=>[...document.querySelectorAll('[data-a=ckuchoose]')].map(b=>b.textContent));
    ok('Settle Pigxies: Kate gets a land choice (Highland / Lowland)',ch.length===2&&ch.some(x=>/Highland/.test(x))&&ch.some(x=>/Lowland/.test(x)),ch);
    await tapText(K,'[data-a=ckuchoose]','Lowland');await W(2000);
    await tapHand(K,'mb',1);await tap(K,'[data-a=ckuact][data-k=hire]');await W(300);
    await tap(K,`[data-a=ckutgt][data-k="${mom}:high"]`);await W(2500);
    g=await G(H);ok('Hire Mobgoblins (target tapped): Kate swapped her Pigxie Clan for Mom’s Bragon Clan',g.log.some(e=>e.k==='mb'&&e.by===kate&&e.t===mom&&e.got==='br'&&e.gave==='pg'),g.log.slice(-5));
    await privacy(PG,TV,'hire');
    /* the computer player's turn runs by itself; answer anything it asks a person */
    for(let i=0;i<20;i++){g=await G(H);if(g.turn===mom&&ckIdleT(g))break;await settleAll(PG,ids,H);await W(800)}
    g=await G(H);ok('The computer player took its turn and the crown came back to Mom',g.turn===mom,{turn:g.turn,log:g.log.slice(-4)});
    /* Mom: discard a Clanning card, then tap End turn */
    await rig(H,{[mom]:['sc','ve','kl','uh','lc','yy']},null);await W(1200);
    const before=(await G(H)).disc.length;await tapHand(M,'sc',1);await tap(M,'[data-a=ckuact][data-k=discard]');await W(2000);
    g=await G(H);ok('Discard: the Sighclops is on the discard pile and Mom drew back to 6',g.disc.length===before+1&&g.cs[g.disc[g.disc.length-1]]==='sc'&&g.hand[mom].length===6&&g.acts===1,{d:g.disc.length,h:g.hand[mom].length,acts:g.acts});
    await tap(M,'[data-a=ckuact][data-k=end]');await W(2000);g=await G(H);ok('End turn: the crown passes to Dad',g.turn===dad,g.turn);
    await shot(Dp,'play-dad');await shot(TV,'bigboard');
    await privacy(PG,TV,'mid');
    /* speed-up hook: the computer plays everyone to the end */
    await H.evaluate(()=>{S.ckg.bots=Object.fromEntries(S.ckg.ps.map(p=>[p,1]));save();render()});
    for(let i=0;i<120;i++){g=await G(H);if(g.phase!=='play')break;await W(1500);if(i%4===0)await privacy(PG,TV,'auto'+i)}
    g=await G(H);ok('The rest of the game plays out to the end',g.phase==='done'&&g.win&&g.win.length>=1,{ph:g.phase});
    await W(2500);
    const tabs=[];for(const p of [...PG,TV])tabs.push(await p.evaluate(()=>{const g=CYK.ckGx();const rows=[...document.querySelectorAll('.cyktab tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent.trim()));
      return {rows,res:g.ps.map(p=>({n:act().find(q=>q.id===p).name,t:CYK.ckScore(g,p).total,c:CYK.ckScore(g,p).cards,r:g.res[p].total}))}}));
    const match=tabs.every(T=>T.rows.length===4&&T.res.every(r=>r.t===r.r&&T.rows.some(row=>row[0].includes(r.n)&&row.includes(String(r.t))&&row.includes(String(r.c)))));
    ok('Score screen on every phone and the big board: each Ruler’s total and Creatures match ckScore',match,tabs[0]);
    await shot(M,'score');
    await M.evaluate(()=>document.querySelector('[data-a=finish]').click());await W(2000);
    const res=await M.evaluate(()=>({scr:S.screen,tot:act().map(p=>cykTot(p)),rec:S.ckrec,txt:document.getElementById('app').innerText.slice(0,300)}));
    ok('Finish: the results show everyone’s magic and the winner',res.scr!=='score'&&res.tot.some(t=>t>0)&&Array.isArray(res.rec.win)&&res.rec.win.length>=1,res);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ======== 2 players: Two Ruler rules and the Drafty Inn ======== */
  {const {PG,H,ids}=await setup(browser,['Ann','Bob'],{});const [a,b]=ids;const [A,B]=PG;
    let g=await G(H);ok('2 players: Two Ruler rules are on: hands of 7, three lands, four Inn piles',g&&g.o.two&&g.hand[a].length===7&&g.k[a].mane&&g.inn.length===4,g&&{two:g.o.two,h:g.hand[a].length});
    await rig(H,{[a]:['br','yy','sc','lc','ve','kl','uh'],[b]:['ct','yy','sc','lc','ve','kl','pg']},a,{inn:[[0,'br']]});await W(1500);
    await tap(A,'[data-a=ckuact][data-k=inn]');await W(200);await tap(A,'[data-a=ckupile][data-k="0"]');await W(200);await tapHand(A,'br',1);await W(200);
    const go=await A.evaluate(()=>!!document.querySelector('[data-a=ckugo]'));await shot(A,'inn');
    await tap(A,'[data-a=ckugo]');await W(2500);
    g=await G(H);const bp=await B.evaluate(()=>(document.getElementById('cykch-h')||{}).textContent||'');
    ok('Inn: Ann taps the pile, picks her Bragon and takes it; Bob gets “Ann is taking Bragon from the Drafty Inn! Challenge or let it go?”',go&&g.ch&&g.ch.k==='inn'&&g.ch.ans===b&&/Ann is taking Bragon from the Drafty Inn! Challenge or let it go\?/.test(bp),{go,bp,ch:g.ch&&g.ch.k});
    await tap(B,'[data-a=ckupass]');await W(2500);
    g=await G(H);const top=g.k[a].high.slice(-1)[0];
    ok('Bob lets it go: Ann’s Highland gets the Bragon Clan from the Inn (2 cards) and the pile flips',top&&top.sp==='br'&&top.c.length===2&&!g.ch&&g.inn[0].length<=6,{top,ch:!!g.ch,p0:g.inn[0].length});
    await privacy(PG,null,'inn');
    await Promise.all(PG.map(p=>p.context().close()))}
  /* ======== one phone, 1 person + 3 computer players, Family deck ======== */
  {const ctx=await browser.newContext({viewport:{width:400,height:850}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('fam: '+e.message));
    await p.goto(process.env.BASE||'http://localhost:8765/');await p.waitForTimeout(1500);
    for(const art of ['family','creatures']){
      await p.evaluate(art=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
        c('ckstart','1');c('ckuopt','art:'+art);c('ckuopt','cons:1');c('ckuopt','pow:1');const P=S.players;P.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Bot A','Bot B','Bot C'][i];if(i>0)p.bot='normal';else delete p.bot});save();c('start')},art);
      await W(2500);
      const f=await p.evaluate(()=>{const g=CYK.ckGx(),me=S.lk?S.lk.me:act().find(q=>!q.bot).id;const H=[...document.querySelectorAll('.cykdock [data-hc]')];
        return {art:g.art,n:H.length,imgs:H.map(b=>b.querySelector('img').getAttribute('src')),names:H.map(b=>(b.querySelector('.cykfam')||{}).textContent||''),want:H.map(b=>CYK.CK_FAM[g.cs[+b.dataset.hc]]),stars:!!document.querySelector('.cykstars'),pow:!!document.querySelector('.cykpow')}});
      if(art==='family'){ok('Family deck: every card in the hand shows the family picture and the family name(s) under the creature name',f.art==='family'&&f.n>=6&&f.imgs.every(s=>/art\/ckf-/.test(s))&&f.names.every((x,i)=>x===f.want[i]),f);
        ok('Advanced options on: constellation tokens and the Kingdom Power card show',f.stars&&f.pow,f)}
      else ok('Creatures (default art): cards show the creature pictures and no family names',f.art==='creatures'&&f.imgs.every(s=>/art\/ck-/.test(s))&&f.names.every(x=>!x),f);
      /* wait for my turn, pick two cards so the selection shows, then screenshots */
      for(let i=0;i<40;i++){const t=await p.evaluate(()=>{const g=CYK.ckGx();return g.turn===CYK.ckMe(g)&&CYK.ckIdle(g)});if(t)break;await W(500)}
      await p.evaluate(()=>{const b=document.querySelectorAll('.cykdock [data-hc]');if(b[0])b[0].click()});await W(200);
      await shot(p,'play-'+art);
      const lay=await p.evaluate(()=>{const over=[...document.querySelectorAll('#app *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>window.innerWidth+1&&!e.closest('.cykdock .cykcards')}).map(e=>e.className).slice(0,5);return {over,sw:document.documentElement.scrollWidth,w:window.innerWidth}});
      ok(`Layout (${art}): nothing sticks out sideways at 400 px`,lay.sw<=lay.w&&!lay.over.length,lay)}
    await ctx.close()}
  /* ======== one phone vs computer players: every guided flow ======== */
  {const ctx=await browser.newContext({viewport:{width:400,height:850}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('flows: '+e.message));
    await p.goto(process.env.BASE||'http://localhost:8765/');await p.waitForTimeout(1500);
    const ids=await p.evaluate(()=>{window.__htfast=0;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
      c('ckstart','1');c('ckuopt','art:creatures');c('ckuopt','cons:0');c('ckuopt','pow:0');const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Bot A','Bot B'][i];if(i>0)p.bot='normal';else delete p.bot});save();c('start');return P.slice(0,3).map(p=>p.id)});
    await W(2000);const [me,b1,b2]=ids;
    /* rig: hands, Kingdoms ({pid:{land:[[sp,n],…]}}), powers; it's my turn */
    const R=(hands,king,pw)=>p.evaluate(([hands,king,pw,me])=>{const g=S.ckg;const take=sp=>{const i=g.draw.findIndex(c=>g.cs[c]===sp);if(i<0)throw new Error('no '+sp);return g.draw.splice(i,1)[0]};
      g.ps.forEach(q=>{g.draw.push(...g.hand[q]);g.hand[q]=[];['high','low'].forEach(l=>{g.k[q][l].forEach(C=>g.draw.push(...C.c));g.k[q][l]=[]})});
      for(const q in hands)hands[q].forEach(sp=>g.hand[q].push(take(sp)));
      for(const q in king)for(const l in king[q])king[q][l].forEach(([sp,n])=>g.k[q][l].push({id:++g.cid,sp,c:Array.from({length:n},()=>take(sp))}));
      g.pw=Object.fromEntries(g.ps.map(q=>[q,(pw||{})[q]||[]]));g.turn=me;g.acts=0;g.free={};g.tried=[];g.mt=[];g.ch=g.hy=g.pl=g.fx=null;save();render();return true},[hands,king,pw,me]);
    const st=()=>p.evaluate(()=>JSON.parse(JSON.stringify(S.ckg)));
    const pick=async sps=>{for(const sp of sps){await p.evaluate(sp=>{const g=S.ckg;const b=[...document.querySelectorAll('.cykdock [data-hc]')].find(b=>g.cs[+b.dataset.hc]===sp&&b.getAttribute('aria-pressed')!=='true');if(b)b.click()},sp);await W(80)}};
    const A=async a=>{await tap(p,`[data-a=ckuact][data-k=${a}]`);await W(250)};
    /* Wiizzzaard on a rival stack: tap the stack, then the direction */
    await R({[me]:['wz','mt','yy','sc','lc','ve'],[b1]:['ve','ve','ve','ve','ve','ve'],[b2]:['ve','ve','ve','ve','ve','ve']},{[me]:{low:[['lc',2]]},[b1]:{high:[['yy',2],['br',2]]}});await W(300);
    await pick(['wz']);await A('hire');await tap(p,`[data-a=ckutgt][data-k="${b1}:high"]`);await W(200);
    const dirs=await p.evaluate(()=>[...document.querySelectorAll('[data-a=ckuchoose]')].map(b=>b.textContent));
    await tapText(p,'[data-a=ckuchoose]','to the bottom');await W(400);let g=await st();
    ok('Wiizzzaard: tap the rival stack, pick “top Clan to the bottom”: Bot A’s Bragon Clan goes under the Yedis',dirs.length===2&&g.k[b1].high.map(C=>C.sp).join()==='br,yy',{dirs,st:g.k[b1].high.map(C=>C.sp)});
    /* Minnowtaur upright on my own land */
    await pick(['mt']);await A('hire');await tap(p,`[data-a=ckutgt][data-k="${me}:low"]`);await W(400);g=await st();
    ok('Minnowtaur: tap your own land: it stands upright and guards it',g.mt.some(m=>m.t===me&&m.land==='low'&&m.up),g.mt);
    /* Hypnogriff: tap the rival's name, then give 3 back */
    await R({[me]:['hy','yy','sc','lc','ve','pg'],[b1]:['kl','kl','kl','kl','kl','kl'],[b2]:['ve','ve','ve','ve','ve','ve']},{[me]:{low:[['lc',2]]},[b1]:{high:[['yy',2]]}});await W(300);
    await pick(['hy']);await A('hire');const hyT=await p.evaluate(()=>[...document.querySelectorAll('.cykrhb')].length);await tap(p,`[data-a=ckutgt][data-k="${b1}:"]`);await W(400);g=await st();
    const took=g.hy&&g.hand[me].length;
    for(let i=0;i<3;i++){await p.evaluate(()=>{const b=[...document.querySelectorAll('.cykdock [data-hc]')].find(b=>b.getAttribute('aria-pressed')!=='true');if(b)b.click()});await W(80)}
    await tap(p,'[data-a=ckuhyret]');await W(400);g=await st();
    ok('Hypnogriff: tap the rival’s name, take 3, then pick 3 and give them back',hyT===2&&took===8&&!g.hy&&g.hand[me].length===5&&g.hand[b1].length===6,{hyT,took,h:g.hand[me].length,b:g.hand[b1].length});
    /* Recruit a Pigxie Clan (no counter possible): I choose the land */
    await R({[me]:['pg','yy','sc','lc','ve','kl'],[b1]:['ve','ve','ve','ve','ve','ve'],[b2]:['ve','ve','ve','ve','ve','ve']},{[me]:{low:[['lc',2]]},[b1]:{high:[['pg',2],['yy',2]]}});await W(300);
    await p.evaluate(b1=>{const g=S.ckg;const S2=g.k[b1].high;S2.push(S2.shift());save();render()},b1);await W(200);
    await pick(['pg']);await A('recruit');await tap(p,`[data-a=ckutgt][data-k="${b1}:high"]`);await W(1200);
    const plq=await p.evaluate(()=>[...document.querySelectorAll('[data-a=ckuplace]')].map(b=>b.dataset.k));await tap(p,'[data-a=ckuplace][data-k=high]');await W(400);g=await st();
    ok('Recruit with no possible counter: the Clan is won and I pick its land (Highland / Lowland)',plq.join()==='high,low'&&g.k[me].high.slice(-1)[0]&&g.k[me].high.slice(-1)[0].sp==='pg'&&g.k[me].high.slice(-1)[0].c.length===3,{plq,k:g.k[me]});
    /* Add to an Either Clan and move it */
    await pick(['yy']);await R({[me]:['pg','pg','pg','yy','yy','sc'],[b1]:['ve','ve','ve','ve','ve','ve'],[b2]:['ve','ve','ve','ve','ve','ve']},{[me]:{high:[['pg',2]]},[b1]:{high:[['yy',2]]}},{[me]:['mm','wkid','dh']});await W(300);
    await pick(['pg']);await A('add');const tos=await p.evaluate(()=>[...document.querySelectorAll('[data-a=ckuchoose]')].map(b=>b.textContent));await tapText(p,'[data-a=ckuchoose]','Move it to the Lowland');await W(400);g=await st();
    ok('Add to a Pigxie Clan: choose “Move it to the Lowland”, and it moves',tos.length===2&&g.k[me].low.slice(-1)[0]&&g.k[me].low.slice(-1)[0].c.length===3&&!g.k[me].high.length,{tos,k:g.k[me]});
    /* Match Maker: a free settle */
    await pick(['yy','yy']);await A('settle');await tapText(p,'[data-a=ckuchoose]','Match Maker');await W(400);g=await st();
    ok('Match Maker: settling offers “Free (Match Maker)”, and it costs no action',g.k[me].high.slice(-1)[0]&&g.k[me].high.slice(-1)[0].sp==='yy'&&g.acts===1&&g.free.mm,{acts:g.acts,free:g.free});
    /* Wiizzz Kid: swap my top Clan with the one below (needs 2 Clans in a land) */
    await p.evaluate(me=>{const g=S.ckg;const i=g.draw.findIndex(c=>g.cs[c]==='sc'),j=g.draw.findIndex((c,k)=>k!==i&&g.cs[c]==='sc');g.k[me].high.unshift({id:++g.cid,sp:'sc',c:[g.draw[i],g.draw[j]]});g.draw=g.draw.filter((_,k)=>k!==i&&k!==j);save();render()},me);await W(200);
    await A('wkid');await W(300);g=await st();
    ok('Wiizzz Kid: one tap swaps my Highland top Clan with the one below, free',g.k[me].high.map(C=>C.sp).join()==='yy,sc'&&g.free.wkid&&g.acts===1,{h:g.k[me].high.map(C=>C.sp),acts:g.acts});
    /* DissedHard: pick 2 cards, End +2 */
    const d0=g.disc.length;await pick(['pg','sc']);const lab=await p.evaluate(()=>(document.querySelector('[data-a=ckuact][data-k=end]')||{}).textContent||'');await A('end');await W(400);g=await st();
    ok('DissedHard: pick 2 cards, the End button says “End +2”, both go on the discard pile',/End \+2/.test(lab)&&g.disc.length===d0+2&&g.turn!==me,{lab,d:g.disc.length-d0,turn:g.turn});
    await ctx.close()}
  ok('Privacy: no phone ever showed another player’s hand, and the big board never showed one',!leaks.length,leaks.slice(0,6));
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
function ckIdleT(g){return g.phase==='play'&&!g.ch&&!g.hy&&!g.pl&&!g.fx&&!(g.innq||[]).length}
