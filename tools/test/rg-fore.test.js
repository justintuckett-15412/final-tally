// Rage forehead round: on your turn, tap your face-down card twice to play it (no extra button).
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  await page.evaluate(()=>{window.__htfast=1;SET.toursOff=true;switchGame('rage');resetScores();const X=RGX();X.play=true;X.fore=true;X.order='down';X.start=3;X.bidAll=false;
    const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=i<3?(i?'Bot'+i:'Me'):'';if(i&&i<3)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});
  await W(800);
  // jump to the forehead round
  await page.evaluate(()=>{S.hr=rgBase();rgDeal(S.hr);save();render()});
  const me=await page.evaluate(()=>S.players[0].id);
  // bid when it's my turn
  for(let i=0;i<120;i++){const st=await page.evaluate(id=>{const g=rgG();return {ph:g.phase,turn:g.turn,bt:g.bidTurn,fore:g.fore,mine:g.bids[id]}},me);
    if(st.ph==='bid'&&st.bt===me&&st.mine===undefined){await page.evaluate(()=>{const b=[...document.querySelectorAll('[data-a="rgbid"]')].find(x=>!x.disabled);b.click();b.click()})}
    if(st.ph==='play'&&st.turn===me)break;
    await page.evaluate(()=>{const b=document.querySelector('[data-a="rgshow"],[data-a="rgnext"],[data-a="gllastok"]');if(b)b.click()});await W(250)}
  const s0=await page.evaluate(id=>{const g=rgG();return {fore:g.fore,turn:g.turn===id,btn:!!document.querySelector('[data-a="rgfore"]'),card:!!document.querySelector('[data-a="rgfcard"]'),n:g.h[id].length}},me);
  ok('forehead round, my turn, face-down card is tappable and no Play my card button',s0.fore&&s0.turn&&s0.card&&!s0.btn,s0);
  await page.click('[data-a="rgfcard"]');await W(200);
  const s1=await page.evaluate(id=>({n:rgG().h[id].length,sel:document.querySelector('[data-a="rgfcard"]').getAttribute('aria-pressed'),hint:document.body.innerText.includes('Tap it again to play it')}),me);
  ok('first tap lifts the card without playing it',s1.n===1&&s1.sel==='true'&&s1.hint,s1);
  await page.click('[data-a="rgfcard"]');await W(400);
  const s2=await page.evaluate(id=>{const g=rgG();return {n:(g.h[id]||[]).length,played:g.t.some(x=>x.p===id)||Object.values(g.won||{}).some(v=>v>0)||g.phase==='done'}},me);
  ok('second tap plays the card',s2.n===0&&s2.played,s2);
  ok('no page errors',!errs.length,errs);
  await done(browser)})();
