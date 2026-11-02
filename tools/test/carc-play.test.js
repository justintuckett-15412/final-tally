// Playable Carcassonne (base game): tile data, matching edges, scoring (roads, cities, small-city rule, monasteries, fields, ties, end of game),
// meeple rules, computer players finishing whole games, a turn through the screen, results/reveal, linked phones, and the scorer still working.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const start=async(P,o)=>P.evaluate(o=>{window.__htfast=1;SET.toursOff=true;const b0=document.createElement('button');b0.dataset.a='ccstart';b0.dataset.k='1';b0.hidden=true;document.body.appendChild(b0);b0.click();b0.remove();
  S.players.forEach((p,i)=>{p.on=i<o.n;p.name=['Ann','Bob','Cy','Di','Ed'][i]||'';p.bot=(o.bots||[])[i]||null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()},o);
(async()=>{const browser=await chromium.launch();const errs=[];let P=await mk(browser,'cc');P.on('pageerror',e=>errs.push(e.message));
  await start(P,{n:2});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,400)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    t('72 tiles in 24 kinds; every tile’s 12 edge points are used exactly once; 4 start-tile copies',()=>{let n=0,bad=[];for(const k in CCT){n+=CCT[k][0];const u=CCT[k][1].flatMap(f=>f[1]).sort((a,b)=>a-b);if(u.join()!==[...Array(12).keys()].join())bad.push(k);
        CCT[k][1].forEach(f=>{if(f[0]==='f')(f[4]||[]).forEach(ci=>{if(CCT[k][1][ci][0]!=='c')bad.push(k+' field→'+ci)});if(['c','r'].includes(f[0])){const s=new Set(f[1].map(p=>p%3));if(f[0]==='r'&&[...s].some(x=>x!==1))bad.push(k+' road')}})}
      return {ok:n===72&&!bad.length&&Object.keys(CCT).length===24&&CCT.D[0]===4&&ccBag().length===71,n,bad}});
    const G=()=>{ccDeal();const g=S.ccg;g.ann=null;return g},put=(g,t,r,x,y,m)=>{g.bd[ccK(x,y)]={t,r,m:m||{}};g.order.push(ccK(x,y))};
    t('Edges must match: city to city, road to road, field to field; and touch the map',()=>{const g=G();return {ok:ccFits(g,'E',2,0,-1)&&!ccFits(g,'E',0,0,-1)&&ccFits(g,'U',1,1,0)&&!ccFits(g,'U',0,1,0)&&!ccFits(g,'B',0,5,5)&&!ccFits(g,'B',0,0,0)}});
    t('Finishing a 2-tile city: 4 points (2 with the small-city rule); the meeple comes back',()=>{const g=G(),[a]=g.ps;g.turn=a;g.cur='E';const ok1=ccPlay(g,a,{x:0,y:-1,r:2,f:0});const pts=g.sc[a],back=g.mee[a];
      const g2=G();g2.small=1;g2.turn=a;g2.cur='E';ccPlay(g2,a,{x:0,y:-1,r:2,f:0});return {ok:ok1&&pts===4&&back===7&&g2.sc[a]===2&&S.ccg.scl.some(e=>e.cat==='city'&&!e.fin),pts,back}});
    t('A city checked tile by tile: closed after two tiles, worth 4',()=>{const g=G(),[a,b]=g.ps;put(g,'M',2,0,-1);/* M rotated: city S+E… */const F=ccFeatures(g.bd);
      const g2=G();put(g2,'A',1,-1,0);/* road ends at a monastery on the west */g2.turn=b;g2.cur='V';const okr=ccPlay(g2,b,{x:1,y:0,r:1,f:null});
      /* city: D (city N) + Q-ish: use C full city? test with S/T: a 3-sided city closed by caps */
      const g3=G();put(g3,'E',2,0,-1,{});g3.bd['0,-1'].m={0:a};const pts3=(()=>{const F3=ccFeatures(g3.bd);const c=F3.C[F3.id.get(F3.node('0,0',0))];return [c.open,ccPts(g3,c,true,F3.C)]})();
      return {ok:pts3[0]===false&&pts3[1]===4,pts3}});
    t('Monastery: 9 when surrounded; at the end 1 + tiles around it',()=>{const g=G(),[a]=g.ps;put(g,'B',0,0,1,{0:a});const F=ccFeatures(g.bd),c=F.C[F.id.get(F.node('0,1',0))];const end=ccPts(g,c,false,F.C);
      [[-1,0],[1,0],[-1,1],[1,1],[-1,2],[0,2],[1,2]].forEach(([x,y])=>put(g,'B',0,x,y));const F2=ccFeatures(g.bd),c2=F2.C[F2.id.get(F2.node('0,1',0))];return {ok:end===2&&!c2.open&&ccPts(g,c2,true,F2.C)===9,end}});
    t('A meeple can’t go on a feature someone already has; separate ones can join and then tie',()=>{const g=G(),[a,b]=g.ps;g.bd['0,0'].m={1:a};g.turn=b;g.cur='U';const no=ccPlayCheck(g,b,{x:1,y:0,r:1,f:0});const yes=ccPlayCheck(g,b,{x:1,y:0,r:1,f:1});
      /* tie: a road with one meeple each scores both */
      const g2=G();g2.bd['0,0'].m={1:a};put(g2,'U',1,2,0,{0:b});put(g2,'A',3,-1,0);put(g2,'A',1,3,0);g2.turn=a;g2.cur='U';const okp=ccPlay(g2,a,{x:1,y:0,r:1,f:null});return {ok:/already has/.test(no)&&!yes&&okp&&g2.sc[a]===g2.sc[b]&&g2.sc[a]===5,no,sc:g2.sc}});
    t('End of the game: unfinished city 1 per tile + shield; fields 3 per finished city (classic: 4 per city to the most farmers)',()=>{const g=G(),[a,b]=g.ps;
      put(g,'E',2,0,-1);/* closes D's city */g.bd['0,0'].m={2:a};/* farmer north of the road, next to the city */put(g,'F',1,1,-2,{0:b});/* open city with a shield */g.bag=[];ccEnd(g);
      const g2=G();put(g2,'E',2,0,-1);g2.bd['0,0'].m={2:a};g2.farm='classic';g2.bag=[];ccEnd(g2);return {ok:g.sc[a]===3&&g.sc[b]===2&&g2.sc[a]===4&&g.scl.every(e=>e.fin),sc:g.sc,sc2:g2.sc,scl:g.scl}});
    t('Computer players finish 2-, 4- and 5-player games: every edge matches, meeples add up, the log matches the scores',()=>{const bad=[];for(const n of [2,4,5]){S.players.forEach((x,i)=>{x.on=i<n;x.bot=['easy','normal','hard','hard','normal'][i]});const g=G();let k=0;
        while(g.phase==='play'&&k++<200){const q=act().find(x=>x.id===g.turn);if(!ccBotStep(g,q)){bad.push('stuck '+n);break}}if(g.phase!=='done')bad.push('no end '+n);
        for(const kk of g.order){const T=g.bd[kk],[x,y]=kk.split(',').map(Number);for(let s=0;s<4;s++){const o=g.bd[ccK(x+CCDX[s],y+CCDY[s])];if(o&&ccSide(T.t,T.r,s)!==ccSide(o.t,o.r,(s+2)%4))bad.push('edge '+kk)}}
        g.ps.forEach(p=>{const on=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].m).filter(x=>x===p).length,0);if(on+g.mee[p]!==7)bad.push('meeples '+p);const sum=g.scl.filter(e=>e.pid===p).reduce((a,e)=>a+e.pts,0);if(sum!==g.sc[p])bad.push('log '+p)});
        if(g.order.length<60)bad.push('tiles '+g.order.length)}S.players.forEach(x=>x.bot=null);return {ok:!bad.length,bad:bad.slice(0,5)}});
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));
  // a turn through the screen against a computer player
  await P.close();P=await mk(browser,'cc2');P.on('pageerror',e=>errs.push(e.message));await start(P,{n:2,bots:[null,'easy']});await W(1400);
  const s1=await P.evaluate(()=>{const g=S.ccg,me=act()[0].id;g.ann=null;g.turn=me;g.cur='E';CCPEND=null;render();const spot=document.querySelector('[data-a="ccpspot"][data-k="0,-1"]');if(!spot)return 'no spot';
    spot.dispatchEvent(new MouseEvent('click',{bubbles:true}));const r1=CCPEND&&CCPEND.r;let tries=0;while(CCPEND.r!==2&&tries++<4)document.querySelector('.cpdock [data-a="ccprot"]').click();
    const chip=[...document.querySelectorAll('.ccmeeps [data-a="ccpmeep"]')].find(b=>/City/.test(b.textContent));if(!chip)return 'no city chip';chip.click();const lab=document.querySelector('[data-a="ccpplay"]').textContent;document.querySelector('[data-a="ccpplay"]').click();
    return {lab,sc:g.sc[me],turn:g.turn!==me,mee:g.mee[me],placed:!!g.bd['0,-1'],log:S.clog.length}});
  ok('Screen: tap a glowing square, turn the tile, pick “City” for the meeple, Done: the city closes for 4 and the meeple comes back',s1&&s1.sc===4&&s1.turn&&s1.mee===7&&s1.placed&&/meeple/.test(s1.lab),s1);
  await W(3500);ok('The computer player takes its turn',await P.evaluate(()=>S.ccg.turn===act()[0].id&&S.ccg.order.length===3));
  // play it out with bots to the results screen
  const fin=await P.evaluate(async()=>{act()[0].bot='hard';render();for(let i=0;i<200&&S.ccg.phase==='play';i++){const g=S.ccg,q=act().find(x=>x.id===g.turn);ccBotStep(g,q)}ccSyncLog(S.ccg);save();render();
    const b=document.querySelector('[data-a="finish"]');if(!b)return 'no finish';b.click();await new Promise(r=>setTimeout(r,600));return {screen:S.screen,tot:act().map(p=>cTot(p)),sc:act().map(p=>S.ccg.sc[p.id])}});
  ok('At the end: Finish & reveal; the totals match the game',fin&&['reveal','results'].includes(fin.screen)&&fin.tot.join()===fin.sc.join(),fin);
  // linked phones
  const H=await mk(browser,'host'),Gp=await mk(browser,'guest');[H,Gp].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const b0=document.createElement('button');b0.dataset.a='ccstart';b0.dataset.k='1';document.body.appendChild(b0);b0.click();b0.remove();const P=S.players;P.forEach((p,i)=>{p.on=i<2;p.name=['Justin','Kim'][i]||'';delete p.bot});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await Gp.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await Gp.evaluate(c=>lkJoin(c),code);await W(4000);await Gp.evaluate(id=>lkPick(id),ids[1]);await W(2500);await readyAll([H,Gp]);
  const first=await H.evaluate(()=>S.ccg.turn);const Ph=first===ids[0]?H:Gp,Po=first===ids[0]?Gp:H;
  await H.evaluate(()=>{const g=S.ccg;g.ann=null;g.cur='E';g.n++;save();render()});await W(1500);
  const lp=await Ph.evaluate(()=>{const s=document.querySelector('[data-a="ccpspot"][data-k="0,-1"]');if(!s)return 'no spot';s.dispatchEvent(new MouseEvent('click',{bubbles:true}));let t=0;while(CCPEND.r!==2&&t++<4)document.querySelector('.cpdock [data-a="ccprot"]').click();document.querySelector('[data-a="ccpplay"]').click();return true});await W(3000);
  ok('Linked: a tile placed on one phone shows on the other; the turn passes',lp===true&&await Po.evaluate(f=>!!S.ccg.bd['0,-1']&&S.ccg.turn!==f,first),lp);
  // the scorer still works
  const SC=await mk(browser,'score');SC.on('pageerror',e=>errs.push(e.message));
  const sc=await SC.evaluate(()=>{SET.toursOff=true;const b=document.createElement('button');b.dataset.a='ccstart';b.dataset.k='0';document.body.appendChild(b);b.click();b.remove();render();return {play:ccOn(),setup:!!document.querySelector('.edseg')&&!!document.querySelector('.boxtog'),card:true}});
  ok('Score a game: the full scorer setup with editions and expansions is unchanged',!sc.play&&sc.setup,sc);
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
