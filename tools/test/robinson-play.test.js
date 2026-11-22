// Robinson Crusoe on one device: home card, setup (scenario, Friday/Dog, difficulty, house rules + Back to our usual rules),
// who plays whom, then several rounds played only by tapping the screen (card popups, questions, planning sheets, Ready).
// Screenshots at 390px (phone) and 1024px (iPad) go to /tmp/rc-shots.
process.env.LAT=process.env.LAT||'60';process.env.JIT=process.env.JIT||'60';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/rc-shots';fs.mkdirSync(SHOT,{recursive:true});
const ROUNDS=+(process.env.ROUNDS||4);
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'rc');P.on('pageerror',e=>errs.push(e.message));await P.setViewportSize({width:390,height:844});
  const click=(a,k)=>P.evaluate(([a,k])=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()},[a,k]);
  const shot=async(n,w)=>{if(w){await P.setViewportSize({width:w,height:w>800?1366:844});await W(300)}await P.screenshot({path:`${SHOT}/${n}.png`,fullPage:true})};
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;S.screen='home';render()});await W(300);
  ok('Home: a Robinson Crusoe card with Play',await P.evaluate(()=>!!document.querySelector('[data-a="rcstart"]')));
  await click('rcstart');await W(300);
  const setup=await P.evaluate(()=>({scen:document.querySelectorAll('.rcscb').length,imgs:[...document.querySelectorAll('.rcscb img')].filter(i=>i.complete&&i.naturalWidth>0).length,t:document.body.innerText}));
  ok('Setup: 7 scenario pictures, Friday and the Dog, difficulty, house rules',setup.scen===7&&/Friday and the Dog/i.test(setup.t)&&/Difficulty/i.test(setup.t)&&/House rules/i.test(setup.t),setup.scen);
  await shot('setup-390');
  await P.click('[data-a="rcset"][data-k="scen:cursed"]');await P.click('[data-a="rcset"][data-k="multiChar:1"]');await W(200);
  const hr=await P.evaluate(()=>RCX().scen==='cursed'&&RCX().multiChar===1&&!!document.querySelector('[data-a="ureset"]')&&JSON.parse(localStorage.getItem(KEY+'.rcx')).multiChar===1);
  ok('House rule switched on, remembered, with “Back to our usual rules”',hr);
  await P.click('[data-a="ureset"]');await W(200);
  ok('Back to our usual rules: the house rule is off again',await P.evaluate(()=>RCX().multiChar===0));
  await P.click('[data-a="rcset"][data-k="scen:castaways"]');await W(100);
  /* two people */
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<2;p.name=['Ann','Bob'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(800);
  const pick=await P.evaluate(()=>({n:document.querySelectorAll('[data-a="rcupick"]').length,g:!!S.rcg}));
  ok('Who plays whom: 4 portraits per player, nothing dealt yet',pick.n===8&&!pick.g,pick);
  await P.click('[data-a="rcupick"][data-k$=":explorer"] >> nth=1');await W(200);
  await shot('pick-390');
  await P.click('[data-a="rcugo"]');await W(1200);
  const g0=await P.evaluate(()=>{const g=S.rcg;return g&&{order:g.order,fri:!!g.fri,dog:g.dog,scen:g.scen,ph:g.phase}});
  ok('Start: Castaways with cook + explorer, Friday joins (2 characters), no Dog',g0&&g0.scen==='castaways'&&g0.order.join()==='cook,explorer'&&g0.fri&&!g0.dog,g0);
  /* play by tapping */
  let taps={pop:0,ans:0,plan:0,ready:0,use:0},stuck=0,shots={plan:0,ask:0,pop:0,sheet:0};
  const step=async()=>P.evaluate(()=>{const q=s=>document.querySelector(s),g=S.rcg;if(!g)return 'nog';if(g.phase==='done')return 'done';
    const pop=q('.rcpop [data-a="rcucardok"]');if(pop){pop.click();return 'pop'}
    const go=q('.rcplsheet [data-a="rcuplgo"]');if(go){if(!go.disabled){go.click();if(q('.rcplsheet')){window.__rcbad=(window.__rcbad||0)+1;q('.rcplsheet [data-a="rcuplclose"]').click();return 'refused'}return 'plan'}const f=q('.rcplsheet [data-a="rcuplfill"]');if(f&&!window.__rcf){window.__rcf=1;f.click();return 'fill'}window.__rcf=0;q('.rcplsheet [data-a="rcuplclose"]').click();window.__rcbad=(window.__rcbad||0)+1;return 'close'}
    if(q('.rcplsheet')===null&&document.querySelector('.sheet-bg [data-a="rcuplclose"]')){document.querySelector('.sheet-bg [data-a="rcuplclose"]').click();return 'closehex'}
    const ans=[...document.querySelectorAll('.rcdock.ask [data-a="rcuans"]')];if(ans.length){const pref=ans.find(b=>/Keep|Go on|Fight|Stay|Put \d/.test(b.innerText))||ans[0];pref.click();return 'ans'}
    const rd=q('[data-a="rcuready"]');if(rd&&!rd.disabled){rd.click();return 'ready'}
    const C=[...document.querySelectorAll('.rcdock [data-a="rcucand"]')];if(C.length){const r=window.__rcbad||0;const pref=['Gather','Explore','Arrange','Rest','Build','Shelter','Weapon','Hunt'];
      const sorted=C.slice().sort((a,b)=>pref.findIndex(p=>a.innerText.includes(p))-pref.findIndex(p=>b.innerText.includes(p)));const c=sorted[(r)%sorted.length];window.__rcf=0;c.click();return 'cand'}
    return 'wait:'+g.phase});
  const t0=Date.now();let lastRound=1,rounds=[];
  while(Date.now()-t0<300000){const r=await step();await W(120);
    const st=await P.evaluate(()=>({rd:S.rcg&&S.rcg.round,ph:S.rcg&&S.rcg.phase,plan:!!document.querySelector('.rcdock [data-a="rcuready"]'),ask:!!document.querySelector('.rcdock.ask'),pop:!!document.querySelector('.rcpop'),sheet:!!document.querySelector('.rcplsheet')}));
    if(st.pop&&!shots.pop){shots.pop=1;await shot('card-popup-390')}
    if(st.sheet&&!shots.sheet){shots.sheet=1;await shot('plan-sheet-390')}
    if(st.plan&&!shots.plan&&st.rd>=2){shots.plan=1;await shot('planning-390');await shot('planning-1024',1024);await P.setViewportSize({width:390,height:844});await W(200)}
    if(st.ask&&!shots.ask){shots.ask=1;await shot('question-390')}
    if(r==='pop')taps.pop++;else if(r==='ans')taps.ans++;else if(r==='plan')taps.plan++;else if(r==='ready')taps.ready++;
    if(String(r).startsWith('wait')){stuck++;if(stuck>80){console.log('stuck',r,await P.evaluate(()=>JSON.stringify({q:S.rcg.q.slice(0,2),ask:S.rcg.ask,plan:S.rcg.plan&&S.rcg.plan.ready})));break}}else stuck=0;
    if(r==='done'||st.ph==='done'||(st.rd>ROUNDS))break;if(st.rd!==lastRound){rounds.push(st.rd);lastRound=st.rd}}
  const fin=await P.evaluate(()=>({rd:S.rcg.round,ph:S.rcg.phase,fin:S.rcg.fin}));
  ok(`Played by taps: ${ROUNDS} rounds or the game ended (round ${fin.rd}, ${fin.ph})`,fin.rd>ROUNDS||fin.ph==='done',{fin,taps});
  ok('Taps covered card popups, questions, planned Actions and Ready',taps.pop>0&&taps.ans>0&&taps.plan>=4&&taps.ready>=2,taps);
  const bd=await P.evaluate(()=>({hex:document.querySelectorAll('.rcmap .rchex').length,terr:document.querySelectorAll('.rchex.t').length,cast:document.querySelectorAll('.rcch').length,mor:!!document.querySelector('.rcmv.on'),inv:document.querySelectorAll('.rcinv').length,wb:document.querySelectorAll('.rcwb').length}));
  ok('The board: island hexes with terrain, morale marker, inventions, character cards with wound tracks',bd.hex>=10&&bd.terr>=1&&bd.mor&&bd.inv>=5&&bd.cast>=2&&bd.wb>=20,bd);
  await shot('board-390');await shot('board-1024',1024);
  /* dark mode */
  await P.evaluate(()=>{document.documentElement.dataset.theme='dark';document.documentElement.classList.add('dark');render()});await W(300);await shot('dark-1024');
  await P.evaluate(()=>{document.documentElement.dataset.theme='';document.documentElement.classList.remove('dark');render()});
  /* finish */
  await P.setViewportSize({width:390,height:844});
  const end=await P.evaluate(()=>{const g=S.rcg;if(g.phase!=='done')rcEnd(g,false,'test');save();render();const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();return S.finished&&S.rcrec&&S.rcrec.scen==='castaways'||JSON.stringify(S.rcrec)});
  await W(600);ok('Game over: Finish & see results records the scenario and the result',end===true,end);
  await shot('results-390');
  ok('No page errors',!errs.length,errs.slice(0,5));
  await done(browser)})();
