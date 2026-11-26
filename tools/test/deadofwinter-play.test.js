// Dead of Winter: setup screens, the play screen on one shared phone (privacy + a few actions), a whole computer game,
// Finish & reveal, and recording a real game.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'dw');P.on('pageerror',e=>errs.push(e.message));await P.setViewportSize({width:430,height:900});
  const click=(a,k)=>P.evaluate(([a,k])=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()},[a,k]);
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true});
  // home card and setup
  await P.evaluate(()=>{S.screen='home';render()});await W(300);
  const home=await P.evaluate(()=>!!document.querySelector('[data-a="dwstart"][data-k="1"]')&&!!document.querySelector('[data-a="dwstart"][data-k="0"]'));
  ok('Home: Dead of Winter card with Play and Record a game',home,home);
  await click('dwstart','1');await W(300);
  const setup=await P.evaluate(()=>{const t=document.body.innerText;return S.game==='deadofwinter'&&/Main objective/i.test(t)&&/Secret objectives/i.test(t)&&!!document.querySelector('[data-a="dwside"][data-k="hc"]')&&document.querySelectorAll('[data-a="dwmo"]').length===11});
  ok('Setup: main objective (random or any of 10), standard/hardcore, official/betrayer/co-op',setup,setup);
  await click('dwmode','loyal');await W(100);
  const loyal=await P.evaluate(()=>{const t=document.body.innerText;const g0=(()=>{const keep=S.players;return null})();return DWX().mode==='loyal'&&/nobody is a betrayer/i.test(t)&&!!document.querySelector('[data-a="ureset"]')});
  ok('House rule "No betrayer": can be chosen, explained, with Back to our usual rules',loyal,loyal);
  const ldeal=await P.evaluate(()=>{let bad=0;for(let i=0;i<40;i++){const g=dwDeal({mode:'loyal'});if(g.ps.some(p=>g.P[p].betray||!g.P[p].obj||g.P[p].obj.t!=='regular'))bad++;if(dwMove(g,g.ps[0],{a:'exile',target:g.ps[1]})!==false&&g.vote)bad++}return bad===0||bad});
  ok('No betrayer: everyone gets a regular secret objective and exile votes are off',ldeal===true,ldeal);
  await click('dwmo','samples');await click('dwside','std');await click('dwmode','normal');
  const kept=await P.evaluate(()=>DWX().mo==='samples'&&JSON.parse(localStorage.getItem(KEY+'.dwx')).mo==='samples');
  ok('Setup choices are remembered',kept,kept);
  // three people sharing one phone
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy','Di','Ed'][i];p.bot=null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(1500);
  const hand=await P.evaluate(()=>{const g=S.dwg;return !!g&&!!document.querySelector('[data-a="dwshow"]')&&!document.querySelector('.dwdock')});
  ok('Shared phone: a pass-the-phone screen hides everything before the first turn',hand,hand);
  const setupAsk=await P.evaluate(()=>{const g=S.dwg;return !!g.ask&&/survivor/i.test(g.ask.msg||'')});
  ok('Setup on the phones: each player chooses survivors from 4 (a question, behind the pass-the-phone screen)',setupAsk,await P.evaluate(()=>S.dwg.ask));
  const ann=await P.evaluate(()=>{const g=S.dwg;let k=0;while(g.phase!=='play'&&k++<60){const a=dwActor(g);if(!a)break;if(g.ask)dwMove(g,a,{v:g.ask.opts[0].v});else break}g.ann=null;save();render();return g.turn});
  await click('dwshow',ann);await W(300);
  const priv=await P.evaluate(me=>{const g=S.dwg,html=document.getElementById('app').innerHTML,others=g.ps.filter(p=>p!==me);
    const leak=others.filter(p=>dwObjP(g,p)&&html.includes('<b>'+dwObjP(g,p).n+'</b>')&&dwObjP(g,p).n!==(dwObjP(g,me)||{}).n).map(p=>'objective of '+p);
    others.forEach(p=>(g.P[p].hand||[]).forEach(c=>{if(html.includes(`data-k="card:${c}"`))leak.push('card '+c)}));
    return {mine:(!dwObjP(g,me)||html.includes(dwObjP(g,me).n))&&!!document.querySelector('.dwdock'),leak}},ann);
  const prog=await P.evaluate(me=>{const mo=document.querySelector('.dwmo .dwchk'),sec=document.querySelector('.dwobj .dwchk');return !!mo&&mo.querySelectorAll('li').length>0&&!!sec&&/of \d+ ✓|Your secret objective/.test(document.querySelector('.dwobj summary').innerText)||[!!mo,!!sec]},ann);
  const goal=await P.evaluate(()=>{const b=document.querySelector('[data-a="dwgoal"]');if(!b)return 'no Goal button';b.click();const sh=document.querySelector('.dwgoal');if(!sh)return 'no sheet';const t=sh.innerText;const ok1=/Progress/.test(t)&&/Main objective/.test(t)&&!!sh.querySelector('.dwchk');
    document.querySelector('.dwgoal [data-a="lpclose"]').click();const box=document.querySelector('.dwmo[data-a="dwgoal"]');if(!box)return 'box not tappable';box.click();const ok2=!!document.querySelector('.dwgoal');document.querySelector('.dwgoal [data-a="lpclose"]').click();return ok1&&ok2||[ok1,ok2,t.slice(0,200)]});
  ok('Objective: the 🎯 Goal button and the objective box both open the objective with its progress',goal===true,goal);
  const vc=await P.evaluate(()=>{const keep=S.dwg,g=S.dwg=JSON.parse(JSON.stringify(keep));if(g.mode==='coop'||g.mode==='loyal')return 'mode '+g.mode;g.ask=null;g.q=[];g.vote=null;const me=g.turn,t=g.ps.find(p=>p!==me);g.P[me].voted=false;if(!dwMove(g,me,{a:'exile',target:t})){S.dwg=keep;render();return 'no vote '+JSON.stringify({ph:g.phase,turn:g.turn,v:!!g.vote,ex:g.P[t].exiled,mode:g.mode})}let k=0;
    while(g.vote&&k++<10){const a=dwActor(g);dwMove(g,a,{vote:a!==t})}render();const c=document.querySelector('.dwvcard');if(!c)return 'no card';const tx=c.innerText;
    const okc=/Vote (passed|failed)/i.test(tx)&&c.querySelectorAll('.dwvlist li').length===Object.keys(g.lastVote.got).length&&/exile/i.test(tx);c.querySelector('button[data-a="dwvok"]').click();const gone=!document.querySelector('.dwvcard');
    S.dwg=keep;DWVSEEN='';render();return okc&&gone||[okc,gone,tx.slice(0,200)]});
  ok('Vote result card: shows who voted how and the result, and OK closes it',vc===true,vc);
  ok('Progress: the main objective shows a checklist, and your secret objective shows your own',prog===true,prog);
  ok('Privacy: you see your own objective and hand, never another player’s',priv.mine&&!priv.leak.length,priv);
  /* these screen steps check buttons, not crossroads: put held crossroads cards aside and answer any pending question */
  await P.evaluate(me=>{const g=S.dwg;g.ps.forEach(p=>{g.P[p].xr=null});let k=0;while((g.ask||g.vote)&&k++<20){const a=dwActor(g);if(g.vote)dwMove(g,a,{vote:true});else dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v})}render()},ann);
  const mv=await P.evaluate(me=>{const g=S.dwg,s=g.P[me].lead;const b=document.querySelector(`[data-a="dwsel"][data-k="surv:${s}"]`);if(!b)return 'no survivor button';b.click();
    const m=[...document.querySelectorAll('[data-a="dwans"]')].find(x=>{const v=JSON.parse(decodeURIComponent(x.dataset.k));return v.a==='move'&&!v.fuel});if(!m)return 'no move button';const to=JSON.parse(decodeURIComponent(m.dataset.k)).to;m.click();
    return g.sv[s].loc===to||[g.sv[s].loc,to]},ann);
  ok('Through the screen: tap a survivor, then Move: it moves',mv===true,mv);
  await P.evaluate(()=>{const g=S.dwg;g.ps.forEach(p=>{g.P[p].xr=null});let k=0;while((g.ask||g.vote)&&k++<20){const a=dwActor(g);if(g.vote)dwMove(g,a,{vote:true});else dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v})}render()});
  const tk=await P.evaluate(()=>{const b=document.querySelector('[data-a="dwsel"][data-k^="card:"]');if(!b)return 'no card';b.click();const c=[...document.querySelectorAll('[data-a="dwans"]')].find(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='crisis');if(!c)return 'no crisis button';const n=(S.dwg.crisis.add||[]).length;c.click();return (S.dwg.crisis.add||[]).length===n+1||'not added'});
  ok('Through the screen: tap a card, then Add to the crisis (counts only, face down)',tk===true,tk);
  const sheet=await P.evaluate(()=>{LPTIP='dws:0';render();const t=(document.querySelector('.lpsheet')||{}).innerText||'';LPTIP=null;render();return /Attack \d\+/.test(t)});
  ok('Press and hold a survivor: its sheet shows attack, search and ability',sheet,sheet);
  await P.evaluate(()=>{const g=S.dwg;let k=0;while((g.ask||g.vote)&&k++<20){const a=dwActor(g);if(g.vote)dwMove(g,a,{vote:true});else dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v})}DWSEL=null;render()});
  const what=await P.evaluate(()=>{const b=document.querySelector('[data-a="dwwhat"]');if(!b)return 'no What you can do button';b.click();const sh=document.querySelector('.dwwhat');if(!sh)return 'no sheet';const t=sh.innerText;
    const bar=[...sh.querySelectorAll('[data-a="dwans"]')].find(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='barricade');if(!/With a die/.test(t)||!/No die needed/.test(t)||!bar)return t.slice(0,300);
    const me=S.dwg.turn,n=S.dwg.P[me].dice.length;bar.click();return S.dwg.P[me].dice.length===n-1&&!document.querySelector('.dwwhat')||['dice',n,S.dwg.P[me].dice.length,!!document.querySelector('.dwwhat')]});
  ok('What you can do: lists die and free actions; tapping Barricade does it and closes the sheet',what===true,what);
  await P.screenshot({path:'/tmp/dw-what.png'});
  const what2=await P.evaluate(()=>{document.querySelector('[data-a="dwwhat"]').click();const b=document.querySelector('.dwwhat [data-a="dwsel"][data-k^="only:surv:"]');if(!b)return 'no move entry';const s=+b.dataset.k.split(':')[2];b.click();return DWSEL&&DWSEL.s===s&&!document.querySelector('.dwwhat')&&[...document.querySelectorAll('[data-a="dwans"]')].some(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='move')||'sel '+JSON.stringify(DWSEL)});
  ok('What you can do: Move picks that survivor and shows where it can go',what2===true,what2);
  await P.evaluate(()=>{const g=S.dwg;let k=0;while((g.ask||g.vote)&&k++<20){const a=dwActor(g);if(g.vote)dwMove(g,a,{vote:true});else dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v})}DWSEL=null;render()});
  /* Go back and "why not?" (Nov 26), through real taps */
  const gb=await P.evaluate(me=>{const g=S.dwg,Q=g.P[me],s=Q.lead,q=x=>document.querySelector(x);g.ux=null;g.ps.forEach(p=>{g.P[p].xr=null});g.sv[s].loc='police';g.loc.police.z=1;g.loc.police.bar=0;Q.dice=[1,6];Q.moved=Q.moved.filter(x=>x!==s);DWSEL=null;render();
    const none=!q('.uxundo');q('[data-a="dwsel"][data-k="die:0"]').click();q(`[data-a="dwsel"][data-k="surv:${s}"]`).click();
    const whys=[...document.querySelectorAll('.dwdock .dwwhyw')].map(x=>x.innerText);
    const D=dwSv(s);DWSEL=null;render();q('[data-a="dwsel"][data-k="die:1"]').click();q(`[data-a="dwsel"][data-k="surv:${s}"]`).click();
    const bar=[...document.querySelectorAll('.dwdock [data-a="dwans"]')].find(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='barricade');if(!bar)return {err:'no barricade'};bar.click();
    const mid={dice:Q.dice.length,bar:g.loc.police.bar,btn:!!q('.dwdock .uxundo')};q('.dwdock .uxundo').click();
    const back={dice:g.P[me].dice.join(),bar:g.loc.police.bar,ux:!!g.ux,btn:!!q('.uxundo'),turn:g.turn===me};
    /* moving without fuel rolls the exposure die: that ends Go back */
    DWSEL=null;render();q(`[data-a="dwsel"][data-k="surv:${s}"]`).click();const m=[...document.querySelectorAll('.dwdock [data-a="dwans"]')].find(x=>{const v=JSON.parse(decodeURIComponent(x.dataset.k));return v.a==='move'&&!v.fuel&&v.to!=='colony'});
    let rolled=null;if(m){m.click();rolled={ux:!!g.ux,btn:!!q('.uxundo')}}
    let k=0;while((g.ask||g.vote)&&k++<20){const a=dwActor(g);if(g.vote)dwMove(g,a,{vote:true});else dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v})}DWSEL=null;render();
    return {none,whys,atk:D.atk,sr:D.sr,mid,back,rolled}},ann);
  ok('Why not: with a 1 die, greyed choices say what die they need',!gb.err&&gb.whys.length>0&&gb.whys.every(t=>/Needs a \d\+ die \(this one is 1\)|No room|Nothing left/.test(t)),gb);
  ok('Go back: appears after a barricade, puts the die and the barricade back, and disappears',!gb.err&&gb.none&&gb.mid.btn&&gb.mid.dice===1&&gb.mid.bar>=1&&gb.back.dice==='1,6'&&gb.back.bar===0&&!gb.back.ux&&!gb.back.btn&&gb.back.turn,gb);
  ok('Go back: moving (an exposure roll) ends it',!!gb.rolled&&!gb.rolled.ux&&!gb.rolled.btn,gb.rolled);
  const end=await P.evaluate(me=>{const b=[...document.querySelectorAll('[data-a="dwans"]')].find(x=>JSON.parse(decodeURIComponent(x.dataset.k)).a==='end');if(!b)return 'no end';b.click();return S.dwg.turn!==me&&!!document.querySelector('[data-a="dwshow"]')&&!document.querySelector('.dwdock')},ann);
  ok('End turn: the phone asks to be passed to the next player before showing anything',end===true,end);
  await P.screenshot({path:'/tmp/dw-screen.png',fullPage:true});
  /* While you waited: play the others' turns (and the colony phase) on the shared phone; Ann's next turn starts with the sheet, once */
  const ww=await P.evaluate(async me=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),g=S.dwg;let k=0;
    while(k++<400&&g.phase==='play'&&!(g.turn===me&&dwActor(g)===me)){const a=dwActor(g);if(!a){dwRun(g);if(!dwActor(g))break;continue}g.ps.forEach(p=>{g.P[p].xr=null});
      if(g.vote)dwMove(g,a,{vote:true});else if(g.ask)dwMove(g,a,g.ask.opt?{skip:1}:{v:g.ask.opts[0].v});else dwMove(g,a,{a:'end'})}
    g.ann=null;render();await w(50);const sh=document.querySelector('[data-a="dwshow"]');if(sh)sh.click();await w(80);
    const c=document.querySelector('.uxwait');const lines=c?c.querySelectorAll('.uxwl li').length:0;if(c)c.querySelector('[data-a="uxwaitok"]').click();await w(50);render();
    return {turn:g.turn===me,ph:g.phase,card:!!c,lines,again:!!document.querySelector('.uxwait')}},ann);
  ok('While you waited: at Ann’s next turn the sheet lists what happened since, and shows only once',ww.ph!=='play'||ww.turn&&ww.card&&ww.lines>0&&!ww.again,ww);
  // a whole game of computer players
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.bot='normal'});delete S.dwg;S.finished=false;S.screen='score';save();render()});
  let fin=null;for(let i=0;i<240&&!fin;i++){await W(500);fin=await P.evaluate(()=>S.dwg&&S.dwg.phase==='done')}
  ok('A whole game of 4 computer players reaches the end',!!fin,await P.evaluate(()=>S.dwg&&{ph:S.dwg.phase,rnd:S.dwg.rnd,round:S.dwg.round,morale:S.dwg.morale}));
  await P.screenshot({path:'/tmp/dw-end.png',fullPage:true});
  const rv=await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();const g=S.dwg;return act().every(p=>!!(p.dw&&p.dw.win)===!!g.fin[p.id].win)&&act().some(p=>p.dw.obj)||act().map(p=>JSON.stringify(p.dw))});
  ok('Finish & reveal: each player’s result and objective go into the game record',rv===true,rv);
  // recording a real game
  await click('dwstart','0');await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy'][i]||'';p.bot=null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()});await W(500);
  const rec=await P.evaluate(()=>{const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    if(!document.querySelector('[data-a="dwrec"]'))return 'no record sheet';c('dwrecmo','home');c('dwrecend','done');c('dwrec','1:win');c('dwrec','2:betray');
    const f=document.querySelector('[data-a="finish"]');if(!f)return 'no finish';f.click();const P=act();return P[1].dw.win===1&&P[2].dw.betray===1&&total(P[1])===1&&total(P[0])===0||P.map(p=>JSON.stringify(p.dw))});
  ok('Record a real game: winners, betrayer and main objective are saved',rec===true,rec);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
