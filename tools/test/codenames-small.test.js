// Codenames with fewer players (rule sheet variants): play together (2 linked phones) and 3 players (two spymasters, one guesser).
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
async function setup(browser,names,variant){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const ids=await H.evaluate(([N,v])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('cnstart','1');c('cnvariant',v);const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();c('start');return P.slice(0,N.length).map(p=>p.id)},[names,variant]);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),ids[i]);await W(800)}
  await W(1200);return {PG,H,ids}}
(async()=>{const browser=await chromium.launch();const errs=[];
  /* play together, 2 phones */
  {const {PG,H,ids}=await setup(browser,['Mom','Dad'],'coop');PG.forEach((p,i)=>p.on('pageerror',e=>errs.push('coop'+i+': '+e.message)));const pgOf=pid=>PG[ids.indexOf(pid)];
    const t0=await H.evaluate(()=>({v:S.cng.variant,start:S.cng.start,ui:/Play together/.test(document.querySelector('.cnteams').innerText)}));
    ok('Play together: one team (Red goes first) and its own team screen',t0.v==='coop'&&t0.start==='r'&&t0.ui,t0);
    await H.evaluate(()=>document.querySelector('[data-a="cnubegin"]').click());await W(1500);
    const g=await H.evaluate(()=>({spy:S.cng.spy.r,key:S.cng.key}));const spy=pgOf(g.spy),op=pgOf(ids.find(p=>p!==g.spy));
    let enemyOK=null,n=0;
    while(n++<60){const st=await H.evaluate(()=>({ph:S.cng.phase,rev:S.cng.rev}));if(st.ph==='done')break;
      if(st.ph==='clue'){await spy.evaluate(n=>{const i=document.getElementById('cnclue');i.value='qz'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},n);await W(1100);continue}
      if(st.ph==='enemy'){const i=g.key.findIndex((c,i)=>c==='b'&&!st.rev[i]);const deny=await op.evaluate(i=>{document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click();return true},i);await W(800);
        const still=await H.evaluate(()=>S.cng.phase);await spy.evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),i);await W(1100);
        const after=await H.evaluate(i=>({ph:S.cng.phase,r:S.cng.rev[i]}),i);if(enemyOK===null)enemyOK=still==='enemy'&&after.r==='b'&&['clue','done'].includes(after.ph);continue}
      const L=g.key.map((c,i)=>i).filter(i=>!st.rev[i]),pick=n%3===0?L.find(i=>g.key[i]==='n')??L[0]:L.find(i=>g.key[i]==='r')??L[0];
      await op.evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),pick);await W(900);await op.evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');if(b&&!b.disabled)b.click()});await W(1100)}
    ok('Play together: after your turn, only the spymaster covers one of the other team’s words, then it’s your turn again',enemyOK===true,enemyOK);
    const fin=await H.evaluate(()=>({ph:S.cng.phase,win:S.cng.win,score:S.cng.score,left:cnLeft(S.cng,'b'),txt:(document.querySelector('.cndone')||{}).innerText||''}));
    ok('Play together: the game ends with a score (their agents still left) when you win',fin.ph==='done'&&(fin.win==='r'?fin.score===fin.left&&/Score: \d/.test(fin.txt):fin.score===0),fin);
    await Promise.all(PG.map(p=>p.context().close()))}
  /* 3 players: two spymasters, one guesser for both */
  {const {PG,H,ids}=await setup(browser,['Ann','Bob','Cy'],'three');PG.forEach((p,i)=>p.on('pageerror',e=>errs.push('three'+i+': '+e.message)));const pgOf=pid=>PG[ids.indexOf(pid)];
    const clk=await PG[1].evaluate(id=>{const b=document.querySelector(`[data-a="cnurolex"][data-k="${id}:op"]`);if(!b)return "nobtn "+(S.cng?S.cng.phase:"nog");b.click();return true},ids[1]);if(clk!==true)console.log("CLK",clk);await W(1500);
    const r3=await H.evaluate(()=>({sh:S.cng.shared,spy:S.cng.spy,v:S.cng.variant}));
    ok('3 players: tap roles on the team screen; one guesser, two spymasters',r3.v==='three'&&r3.sh===ids[1]&&new Set([r3.sh,r3.spy.r,r3.spy.b]).size===3,r3);
    await H.evaluate(()=>document.querySelector('[data-a="cnubegin"]').click());await W(1500);
    const keys=[];for(const id of ids)keys.push(await pgOf(id).evaluate(()=>document.querySelectorAll('.cngrid .cnt.key').length));
    ok('3 players: both spymasters see the key, the guesser doesn’t',keys[ids.indexOf(r3.sh)]===0&&ids.filter(i=>i!==r3.sh).every(i=>keys[ids.indexOf(i)]===25),keys);
    const key=await H.evaluate(()=>S.cng.key);const gs=pgOf(r3.sh);let turns=new Set(),n=0;
    while(n++<80){const st=await H.evaluate(()=>({ph:S.cng.phase,turn:S.cng.turn,rev:S.cng.rev}));if(st.ph==='done')break;
      if(st.ph==='clue'){await pgOf(r3.spy[st.turn]).evaluate(n=>{const i=document.getElementById('cnclue');i.value='qz'+n;document.querySelector('[data-a="cnunum"][data-k="1"]').click();document.querySelector('button[form="cnclueform"]').click()},n);await W(1100);continue}
      turns.add(st.turn);const L=key.map((c,i)=>i).filter(i=>!st.rev[i]),pick=L.find(i=>key[i]===st.turn)??L[0];
      await gs.evaluate(i=>document.querySelector(`.cngrid [data-a="cnutap"][data-k="${i}"]`).click(),pick);await W(900);await gs.evaluate(()=>{const b=document.querySelector('#cnfx .cnconfirm');if(b&&!b.disabled)b.click()});await W(1100)}
    const f3=await H.evaluate(()=>S.cng.phase);
    ok('3 players: the one guesser plays for Red and for Blue, through to a winner',f3==='done'&&turns.size===2,{f3,turns:[...turns]});
    await Promise.all(PG.map(p=>p.context().close()))}
  ok('No page errors',!errs.length,errs.slice(0,4));
  await done(browser)})();
