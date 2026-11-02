// Worgle: marking (repeated letters), the daily word, hard mode, streaks, playing through the screen and keyboard, practice, and the family board.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const errs=[];const P=await mk(browser,'wg');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{SET.toursOff=true;S.screen='home';render()});await W(500);
  const R=await P.evaluate(async()=>{await wgLoad();const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([n,false,e.message])}};
    t('Marking: right spot, wrong spot, and repeated letters only count as often as they appear',()=>{const a=wgMark('speed','abide').join(''),b=wgMark('llama','hello').join(''),c=wgMark('crane','crane').join(''),d=wgMark('eerie','there').join('');return {ok:a==='xxyxy'&&b==='yyxxx'&&c==='ggggg'&&d==='yxyxg',a,b,c,d}});
    t('Answer list: our own 2,000+ five-letter words; #1 is Nov 2 2026; the same word all day, a different one tomorrow',()=>{const a=wgAnswer('2026-11-02'),b=wgAnswer('2026-11-03');return {ok:WGA.length>2000&&WGA.every(w=>/^[a-z]{5}$/.test(w)&&wgValid(w))&&wgNum('2026-11-02')===1&&wgNum('2026-12-02')===31&&a!==b&&wgAnswer('2026-11-02')===a,n:WGA.length}});
    t('Guesses: real 5-letter words only',()=>({ok:wgValid('crane')&&wgValid('zebra')&&!wgValid('xqzzt')&&!wgValid('cran')}));
    t('Hard mode: greens stay put, found letters must be used',()=>{const e1=wgHardErr(['crane'],'cider','tiger'),e2=wgHardErr(['crane'],'cider','clout'),e3=wgHardErr(['crane'],'cider','coder');return {ok:/Letter 1 must be C/.test(e1)&&/use R/.test(e2)&&!e3,e1,e2,e3}});
    t('Stats: played, win %, current and best streak, guess spread',()=>{const td=wgDay(),y=wgDay(new Date(Date.now()-864e5)),y2=wgDay(new Date(Date.now()-2*864e5)),y4=wgDay(new Date(Date.now()-4*864e5));
      const s=wgStats({days:{[y4]:{g:['a','b','c'],w:1},[y2]:{g:['a','b','c','d','e','f'],w:0},[y]:{g:['a','b'],w:1},[td]:{g:['a','b','c','d'],w:1}}});return {ok:s.played===4&&s.pct===75&&s.cur===2&&s.max===2&&s.dist[1]===1&&s.dist[2]===1&&s.dist[3]===1,s}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));
  // play through the screen
  const ans=await P.evaluate(()=>wgAnswer(wgDay()));
  const s1=await P.evaluate(()=>{const b=document.querySelector('[data-a="wgopen"][data-k="day"]');if(!b)return 'no card';b.click();return !!document.querySelector('.wgsheet')&&!!document.getElementById('wg-name')});
  ok('Home card opens Worgle and asks who’s playing on this phone',s1===true,s1);await W(300);
  await P.evaluate(()=>{document.getElementById('wg-name').value='Justin';document.querySelector('[data-a="wgname"]').click()});await W(600);
  const wrong=await P.evaluate(a=>WGA.find(w=>w!==a&&w[0]!==a[0]),ans);
  const s2=await P.evaluate(w=>{const key=k=>document.querySelector(`[data-a="wgkey"][data-k="${k}"]`).click();'xqzzt'.split('').forEach(key);key('enter');const msg=document.querySelector('.wgmsg').textContent;for(let i=0;i<5;i++)key('back');w.split('').forEach(key);key('enter');
    const row=[...document.querySelectorAll('.wgrow')][0];return {msg,cls:[...row.querySelectorAll('.wgc')].map(c=>c.className.split(' ')[1]).join(','),kb:document.querySelector(`[data-a="wgkey"][data-k="${w[0]}"]`).className}},wrong);
  ok('On-screen keys: a made-up word is refused; a real one is colored, and so are the keyboard keys',s2.msg==='Not in the word list.'&&/^wg[GYX](,wg[GYX]){4}$/.test(s2.cls)&&/wgk wg[GYX]/.test(s2.kb),s2);
  for(const l of ans)await P.keyboard.press(l);await P.keyboard.press('Enter');await W(400);
  const s3=await P.evaluate(()=>({done:document.querySelector('.wgdone')&&document.querySelector('.wgdone').textContent,d:wgData().days[wgDay()],kb:!!document.querySelector('.wgkb')}));
  ok('Typing on a keyboard solves it in 2; the result is saved for today',/Solved in 2/.test(s3.done)&&s3.d.w===1&&s3.d.g.length===2&&!s3.kb,s3);
  // another family phone, synced in: its grid stays hidden until you finish (you have), then shows
  const s4=await P.evaluate(a=>{const day=wgDay();localStorage.setItem(KEY+'.worgle.other1',JSON.stringify({me:'Kim',days:{[day]:{g:['crane',a],w:1}}}));localStorage.setItem(KEY+'.worgle.other2',JSON.stringify({me:'Sam',days:{[day]:{g:['crane'],w:null}}}));
    document.querySelector('[data-a="wgview"][data-k="stats"]').click();const t=document.querySelector('.wgsheet').textContent;return {t,mini:document.querySelectorAll('.wgmini').length,copy:wgShareText(wgData())}},ans);
  ok('Family board: Kim 2/6 with her grid, Sam still playing; my stats; copy text with squares',/Kim/.test(s4.t)&&/2\/6/.test(s4.t)&&/Playing/.test(s4.t)&&s4.mini===1&&/Played/.test(s4.t)&&/^Worgle #\d+ 2\/6\n/.test(s4.copy)&&(s4.copy.match(/🟩/g)||[]).length>=5,s4);
  const s5=await P.evaluate(()=>{const day=wgDay(),x=wgData();x.days[day]={g:['crane'],w:null};wgSave(x);WGV='stats';render();const t=document.querySelector('.wgsheet').textContent;const x2=wgData();x2.days[day]={g:[wgAnswer(day)],w:1};wgSave(x2);return {t,mini:document.querySelectorAll('.wgmini').length}});
  ok('Before you finish, others’ grids are hidden',/Finish yours to see/.test(s5.t)&&s5.mini===0,s5);
  // practice
  const s6=await P.evaluate(()=>{document.querySelector('[data-a="wgview"][data-k="play"]').click();document.querySelector('[data-a="wgmode"][data-k="practice"]').click();const a1=wgData().pr.a;render();const a2=wgData().pr.a;const key=k=>document.querySelector(`[data-a="wgkey"][data-k="${k}"]`).click();a1.split('').forEach(key);key('enter');const won=/Solved in 1/.test(document.querySelector('.wgdone').textContent);
    document.querySelector('[data-a="wgnew"]').click();return {same:a1===a2,won,fresh:!!document.querySelector('.wgkb')&&wgData().pr.g.length===0,stats:wgStats(wgData()).played}});
  ok('Practice: the word holds steady, solving it doesn’t touch daily stats, and Another gives a new one',s6.same&&s6.won&&s6.fresh&&s6.stats===1,s6);
  const s7=await P.evaluate(()=>{document.querySelector('[data-a="wgclose"]').click();return {open:!!document.querySelector('.wgsheet'),card:document.querySelector('[data-a="wgopen"]').closest('.game').textContent}});
  ok('Close; the home card shows today’s result and that someone else played',!s7.open&&/solved in 1/.test(s7.card)&&/1 other in the family played/.test(s7.card),s7);
  const s8=await P.evaluate(()=>{SET.cb=true;wgAct('wgopen',null,'day');render();return getComputedStyle(document.querySelector('.wgc.wgG')).backgroundColor});
  ok('Color-blind setting switches to orange and blue',s8==='rgb(245, 121, 58)',s8);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
