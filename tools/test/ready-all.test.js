// Linked games other than Quacks: a new round waits until every phone taps Ready; bots wait too.
const {mk,W,ok,done,chromium}=require('./link.js');
const XF={uno:['UNX','ung'],hearts:['HTX','htg'],skyjo:['SKX','gpg']};
(async()=>{const browser=await chromium.launch();
  for(const g of (process.env.G||'uno,hearts,skyjo').split(',')){const [xf,sk]=XF[g];const H=await mk(browser,'h'+g),G=await mk(browser,'g'+g);const errs=[];[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
    const ids=await H.evaluate(([g,xf])=>{window.__htfast=1;SET.toursOff=true;switchGame(g);resetScores();eval(xf+'()').play=1;const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();return [P[0].id,P[1].id]},[g,xf]);
    await G.evaluate(()=>{SET.toursOff=true;window.__htfast=1});await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);
    await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(3500);await G.evaluate(id=>lkPick(id),ids[1]);await W(1500);
    await H.evaluate(()=>{const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(3500);
    const n0=await H.evaluate(sk=>JSON.stringify(S[sk]&&S[sk].lg||[]).length+':'+(S[sk]&&S[sk].n||0),sk);
    ok(`${g}: both phones show the Ready card`,await H.evaluate(()=>!!document.querySelector('[data-a=glready]'))&&await G.evaluate(()=>!!document.querySelector('[data-a=glready]')));
    await G.evaluate(()=>document.querySelector('[data-a=glready]').click());await W(2500);
    ok(`${g}: after tapping, the guest sees who it's waiting for`,await G.evaluate(()=>/Waiting for Justin to tap Ready/.test(document.body.innerText)));
    ok(`${g}: nothing moved while waiting (bots wait too)`,n0===await H.evaluate(sk=>JSON.stringify(S[sk]&&S[sk].lg||[]).length+':'+(S[sk]&&S[sk].n||0),sk),n0);
    await H.evaluate(()=>document.querySelector('[data-a=glready]').click());
    let gone=false;for(let t=0;t<30;t++){await W(300);if(await G.evaluate(()=>!document.querySelector('.glrdy'))&&await H.evaluate(()=>!document.querySelector('.glrdy'))){gone=true;break}}
    ok(`${g}: once everyone is ready the card goes on both phones`,gone);
    ok(`${g}: no page errors`,!errs.length,errs.slice(0,3));await H.context().close();await G.context().close()}
  await done(browser)})();
