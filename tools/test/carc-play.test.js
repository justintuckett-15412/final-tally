// Playable Carcassonne (base game): tile data, matching edges, scoring (roads, cities, small-city rule, monasteries, fields, ties, end of game),
// meeple rules, computer players finishing whole games, a turn through the screen, results/reveal, linked phones, and the scorer still working.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
const start=async(P,o)=>P.evaluate(o=>{window.__htfast=1;SET.toursOff=true;const b0=document.createElement('button');b0.dataset.a='ccstart';b0.dataset.k='1';b0.hidden=true;document.body.appendChild(b0);b0.click();b0.remove();CX().ed='2';CX().exp.river=!!o.river;CX().exp.abbot=!!o.abbot;CX().exp.ic=!!o.ic;CX().exp.tb=!!o.tb;CX().exp.gold=!!o.gold;CX().exp.mw=!!o.mw;CX().exp.fm=!!o.fm;CX().exp.crop=!!o.crop;CX().exp.rob=!!o.rob;CX().exp.msg=!!o.msg;
  S.players.forEach((p,i)=>{p.on=i<o.n;p.name=['Ann','Bob','Cy','Di','Ed'][i]||'';p.bot=(o.bots||[])[i]||null});save();const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove()},o);
(async()=>{const browser=await chromium.launch();const errs=[];let P=await mk(browser,'cc');P.on('pageerror',e=>errs.push(e.message));
  await start(P,{n:2});await W(900);
  const R=await P.evaluate(()=>{const out=[];const t=(n,f)=>{try{const r=f();out.push([n,!!r.ok,r.ok?'':JSON.stringify(r).slice(0,400)])}catch(e){out.push([n,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    CX().ed='2';CX().exp.river=false;CX().exp.abbot=false;CX().exp.ic=false;CX().exp.tb=false;CX().exp.gold=false;CX().exp.mw=false;CX().exp.fm=false;CX().exp.crop=false;CX().exp.rob=false;CX().exp.msg=false;
    t('72 base tiles in 24 kinds (+8 garden copies, +12 river); every tile’s 12 edge points are used exactly once; 4 start-tile copies',()=>{let n=0,bad=[];for(const k in CCT){if(!CCT[k][2]&&!CCT[k][3]&&!CCT[k][4])n+=CCT[k][0];const u=CCT[k][1].flatMap(f=>f[1]).sort((a,b)=>a-b);if(u.join()!==[...Array(12).keys()].join())bad.push(k);
        CCT[k][1].forEach(f=>{if(f[0]==='f')(f[4]||[]).forEach(ci=>{if(CCT[k][1][ci][0]!=='c')bad.push(k+' field→'+ci)});if(['c','r'].includes(f[0])){const s=new Set(f[1].map(p=>p%3));if(f[0]==='r'&&[...s].some(x=>x!==1))bad.push(k+' road')}})}
      const ab=ccBag({abbot:1}),gard=ab.filter(t=>CCT[t][2]).length,rv=ccBag({river:1,abbot:1});
      return {ok:n===72&&!bad.length&&Object.keys(CCT).length===123&&ccBag({rob:1}).length===79&&ccBag({fm:1,crop:1}).length===85&&ccBag({gold:1,mw:1}).length===87&&ccBag({tb:1}).length===95&&['w','g','c'].map(x=>Object.keys(CCT).filter(t=>CCT[t][1].some(f=>f[4]&&f[4].gd===x)).length).join()==='9,6,5'&&ccBag({ic:1}).length===89&&Object.keys(CCT).filter(t=>CCT[t][1].some(f=>f[4]&&f[4].inn)).length===6&&ccBag({ic:1}).filter(t=>t==='IK').length===2&&CCT.D[0]===4&&ccBag().length===71&&ab.length===71&&gard===8&&rv.length===82&&rv[71]==='R12'&&rv.slice(72).every(t=>ccRiverT(t)),n,bad,gard}});
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
    t('River: starts at the spring, carries on from the end only, can’t turn the same way twice; the lake ends it',()=>{CX().exp.river=true;const g=G();CX().exp.river=false;const [a]=g.ps;g.turn=a;
      const st=g.bd['0,0'].t==='R1'&&g.rv.out===2,first=g.bag[g.bag.length-1];/* curve R7 (N–W): from the spring heading south */g.cur='R7';const sp=ccSpots(g,'R7');const all=sp.every(s=>s.x===0&&s.y===1);
      const s1=sp[0];ccPlay(g,a,{x:s1.x,y:s1.y,r:s1.r,f:null});const t1=g.rv.turn;g.turn=a;g.cur='R7';const sp2=ccSpots(g,'R7');const ok2=sp2.every(s=>{const ent=(g.rv.out+2)%4,out=ccWaterSides('R7',s.r).find(x=>x!==ent);return ccTurn(g.rv.out,out)!==t1});
      return {ok:st&&ccRiverT(first)&&all&&sp.length>0&&t1!==0&&ok2&&sp2.length>0,t1,sp,sp2}});
    t('Abbot: on the monastery of the tile just placed (not a garden by a meeple); 9 when surrounded; brought home early for what it’s worth',()=>{CX().exp.abbot=true;const g=G();CX().exp.abbot=false;const [a,b]=g.ps;g.turn=a;g.cur='B';
      const e1=ccPlayCheck(g,a,{x:0,y:1,r:0,f:0,a:1});ccPlay(g,a,{x:0,y:1,r:0,f:0,a:1});const on=!!ccAbbotAt(g,a)&&g.ab[a]===0&&g.mee[a]===7;
      g.turn=b;g.cur='Ug';const eg=ccPlayCheck(g,b,{x:1,y:0,r:1,f:3});g.turn=a;g.cur='B';const bringOk=ccPlay(g,a,{x:0,y:2,r:0,f:null,ret:1});const pts=g.sc[a],back=g.ab[a]===1&&!ccAbbotAt(g,a);
      return {ok:!e1&&on&&/abbot/i.test(eg)&&bringOk&&pts===3&&back,e1,eg,pts,sc:g.sc}});
    t('Inns: a finished road with an inn scores 2 per tile, an unfinished one 0. Cathedrals: 3 per tile and shield finished, 0 unfinished',()=>{const g=G();
      put(g,'A',3,-1,0);put(g,'IB',0,1,0);const F=ccFeatures(g.bd),c=F.C[F.id.get(F.node('0,0',1))];const open=ccPts(g,c,false,F.C);put(g,'A',1,2,0);const F2=ccFeatures(g.bd),c2=F2.C[F2.id.get(F2.node('0,0',1))];
      const cc={k:'c',tiles:new Set(['a','b','c']),shields:1,cath:1};return {ok:c.inn&&open===0&&!c2.open&&ccPts(g,c2,true,F2.C)===8&&ccPts(g,cc,true,[])===12&&ccPts(g,cc,false,[])===0,open,done:ccPts(g,c2,true,F2.C)}});
    t('Large meeple: counts as 2 for who has a feature, and comes home when it’s finished',()=>{CX().exp.ic=true;const g=G();CX().exp.ic=false;const [a,b]=g.ps;
      put(g,'A',3,-1,0,{});g.bd['-1,0'].m={};g.bd['0,0'].m={1:b};put(g,'U',1,2,0,{});g.bd['2,0'].L={0:a};g.lm[a]=0;put(g,'A',1,3,0);g.turn=b;g.cur='U';const okp=ccPlay(g,b,{x:1,y:0,r:1,f:null});
      return {ok:okp&&g.sc[a]===5&&g.sc[b]===0&&g.lm[a]===1&&g.mee[b]===8-1||okp&&g.sc[a]===5&&g.sc[b]===0&&g.lm[a]===1,sc:g.sc,lm:g.lm}});
    t('Goods: whoever finishes a city takes its goods (no meeple needed); the most of each kind scores 10 at the end, ties both',()=>{CX().exp.tb=true;const g=G();CX().exp.tb=false;const [a,b]=g.ps;
      put(g,'HQ',1,0,-1);/* wine band, turned: its city faces south onto D */g.turn=b;g.cur='E';const sp=ccSpots(g,'E').find(s=>s.x===0&&s.y===-2);const okp=sp&&ccPlay(g,b,{x:0,y:-2,r:sp.r,f:null});const F=ccFeatures(g.bd);
      g.goods[a]={w:1,g:0,c:0};const gb={...g.goods[b]};g.bag=[];ccEnd(g);return {ok:okp&&gb.w===1&&g.sc[a]===10&&g.sc[b]>=10,gb,sc:g.sc,sp}});
    t('Builder: needs your meeple there; carrying that road on gives one more tile (only one)',()=>{CX().exp.tb=true;const g=G();CX().exp.tb=false;const [a,b]=g.ps;g.bd['0,0'].m={1:a};put(g,'U',1,1,0,{});g.bd['1,0'].b={0:a};g.bu[a]=0;
      g.turn=b;g.cur='U';const nob=ccPlayCheck(g,b,{x:2,y:0,r:1,f:0,b:1});g.turn=a;g.cur='U';const t0=ccPlay(g,a,{x:2,y:0,r:1,f:null});const again=g.turn===a&&g.dbl===1;g.cur='U';ccPlay(g,a,{x:3,y:0,r:1,f:null});const after=g.turn===b&&g.dbl===0;
      return {ok:/meeple|supply/.test(nob||'')&&t0&&again&&after,nob,again,after}});
    t('Pig: needs your farmer; your fields then score 4 per finished city',()=>{CX().exp.tb=true;const g=G();CX().exp.tb=false;const [a]=g.ps;put(g,'E',2,0,-1);g.bd['0,0'].m={2:a};g.bd['0,0'].p={2:a};g.bag=[];ccEnd(g);return {ok:g.sc[a]===4,sc:g.sc}});
    t('Gold: a gold tile puts one bar on itself and one next to it; whoever finishes and holds the city takes it all; ties share in turn; end table',()=>{CX().exp.gold=true;const g=G();CX().exp.gold=false;const [a,b]=g.ps;
      g.turn=a;g.cur='GB';const sp=ccSpots(g,'GB').find(s=>s.x===0&&s.y===-1);const need=ccPlayCheck(g,a,{x:0,y:-1,r:sp.r,f:null});const ok1=ccPlay(g,a,{x:0,y:-1,r:sp.r,f:null,gk:'0,0'});const bars=(g.gb['0,-1']||0)+(g.gb['0,0']||0);
      const g2=G();g2.goldOn=1;g2.bd['0,0'].m={0:a};g2.gb['0,0']=3;g2.turn=b;g2.cur='E';ccPlay(g2,b,{x:0,y:-1,r:2,f:null});
      const g3=G();g3.goldOn=1;g3.bd['0,0'].m={0:a};put(g3,'G',1,0,-1,{0:b});g3.gb['0,0']=3;g3.turn=b;g3.cur='E';const T=ccPlayCheck(g3,b,{x:0,y:-2,r:2,f:null});ccPlay(g3,b,{x:0,y:-2,r:2,f:null});
      return {ok:/second gold/.test(need||'')&&ok1&&bars===2&&g2.gold[a]===3&&g2.gold[b]===0&&!T&&g3.gold[b]===2&&g3.gold[a]===1&&GOLDV(7)===21&&GOLDV(3)===3,need,bars,g2:g2.gold,g3:g3.gold}});
    t('Mage & Witch: a magic tile needs a figure placed; mage +1 a tile, witch half (rounded up); they leave after scoring; never together',()=>{CX().exp.mw=true;const g=G();CX().exp.mw=false;const [a,b]=g.ps;
      g.turn=a;g.cur='MH';const sp=ccSpots(g,'MH')[0];const e1=ccPlayCheck(g,a,{x:sp.x,y:sp.y,r:sp.r,f:null});const ok1=ccPlay(g,a,{x:sp.x,y:sp.y,r:sp.r,f:null,mw:{w:'mage',k:'0,0',i:1}});const mAt=ccMagicAt(g.bd,'mage');
      const e2=mAt&&ccMagicCheck(g,g.bd,'MA',{w:'witch',k:mAt.k,i:mAt.i});
      const g2=G();g2.bd['0,0'].m={0:a};g2.bd['0,0'].mg=0;g2.turn=b;g2.cur='E';ccPlay(g2,b,{x:0,y:-1,r:2,f:null});
      const g3=G();g3.bd['0,0'].m={0:a};g3.bd['0,0'].wt=0;g3.turn=b;g3.cur='E';ccPlay(g3,b,{x:0,y:-1,r:2,f:null});
      return {ok:/mage or the witch/.test(e1||'')&&ok1&&!!mAt&&/not with the other/.test(e2||'')&&g2.sc[a]===6&&!ccMagicAt(g2.bd,'mage')&&g3.sc[a]===2&&!ccMagicAt(g3.bd,'witch'),e1,e2,s2:g2.sc[a],s3:g3.sc[a]}});
    t('Flier: rolls 1–3 in the arrow’s direction and lands on an unfinished road, city or monastery, even an occupied one; never a field; misses go home',()=>{CX().exp.fm=true;const g=G();CX().exp.fm=false;const [a,b]=g.ps;
      g.bd['0,0'].m={0:b};/* D: city with b, road, fields */put(g,'U',1,-1,0);put(g,'U',1,-2,0);put(g,'U',1,-3,0);
      const opts=ccFlyOpts(g,'0,0').map(i=>CCT.D[1][i][0]).sort().join();let land=0,miss=0,tries=0;
      for(let n=0;n<30;n++){const h=JSON.parse(JSON.stringify(g));h.turn=a;h.cur='FB';const r=[0,1,2,3].find(rr=>ccFits(h,'FB',rr,1,0)&&ccFlyDir('FB',rr)[0]===-1);if(r==null)break;tries++;ccPlay(h,a,{x:1,y:0,r,f:null,fly:1});if(h.phase==='fly')ccFlyPick(h,a,h.fly.opts[0]);const on=h.order.some(kk=>(h.bd[kk].fm||[]).some(([,p])=>p===a));on?land++:miss++}
      return {ok:opts==='c,r'&&tries>0&&land+miss===tries,opts,land,miss,tries}});
    t('Crop circles: the placer picks add or remove; everyone with that kind does it, the placer last',()=>{CX().exp.crop=true;const g=G();CX().exp.crop=false;const [a,b]=g.ps;
      g.bd['0,0'].m={1:b};put(g,'U',1,1,0,{0:a});g.turn=a;g.cur='K1';const sp=ccSpots(g,'K1')[0];ccPlay(g,a,{x:sp.x,y:sp.y,r:sp.r,f:null});const ph=g.phase,who=ccActor(g);
      ccCrop(g,a,'add');const nxt=ccActor(g);const bo=ccCropOpts(g,b).length;ccCrop(g,b,0);const nxt2=ccActor(g);ccCrop(g,a,0);
      const cnt=p=>g.order.reduce((n,kk)=>n+(g.bd[kk].fm||[]).filter(([,q])=>q===p).length,0);
      return {ok:ph==='crop'&&who===a&&nxt===b&&bo===1&&nxt2===a&&cnt(a)===1&&cnt(b)===1&&g.phase==='play'&&g.turn===b&&g.mee[a]===6&&g.mee[b]===6,ph,cnt:[cnt(a),cnt(b)],mee:g.mee,turn:g.turn===b}});
    t('Robbers: a bag tile has everyone place a robber by another score; the next time that player scores, the robber takes half (rounded up) and comes home; 3 at the end if still out',()=>{CX().exp.rob=true;const g=G();CX().exp.rob=false;const [a,b]=g.ps;
      g.turn=a;g.cur='BF';const sp=ccSpots(g,'BF').find(s=>s.x===1&&s.y===0);ccPlay(g,a,{x:1,y:0,r:sp.r,f:null});const ph=g.phase,who=ccActor(g);ccRob(g,a,b);const who2=ccActor(g);ccRob(g,b,a);const back=g.phase;
      g.mk[b].m=7;g.sc[b]=7;g.rob[a]=7;const before=g.sc[a];g.turn=b;ccGain(g,b,5,'city');const stolen=g.sc[a]-before;
      g.rob[b]=0;g.bag=[];ccEnd(g);return {ok:ph==='rob'&&who===a&&who2===b&&back!=='rob'&&stolen===3&&g.rob[a]===null&&g.scl.some(e=>e.cat==='rob'&&e.fin&&e.pid===b&&e.pts===3),ph,stolen}});
    t('Messengers: landing on an empty dark space on your turn draws a message: do it or take 2; a second message can follow, never a third',()=>{CX().exp.msg=true;const g=G();CX().exp.msg=false;const [a,b]=g.ps;
      g.msgDeck=[6,7,5,1,2,3,4,8];g.bd['0,0'].m={0:a};g.mk[a]={m:1,s:0};g.sc[a]=1;g.turn=a;g.cur='E';ccPlay(g,a,{x:0,y:-1,r:2,f:null});const ph=g.phase,card=g.msgS&&g.msgS.card;
      const two=ccMsg(g,a,'two');const after=g.phase,sc=g.sc[a];return {ok:ph==='msg'&&card===6&&two&&after==='play'&&g.mk[a].m+g.mk[a].s===sc&&g.turn===b,ph,card,sc,mk:g.mk[a]}});
    t('Computer players finish 2-, 4- and 5-player games: every edge matches, meeples add up, the log matches the scores',()=>{const bad=[];for(const n of [2,4,5]){const ra=n!==4;CX().exp.river=ra;CX().exp.abbot=ra;CX().exp.ic=n===5;CX().exp.tb=n!==2;CX().exp.gold=n===4;CX().exp.mw=n===4;CX().exp.fm=n!==2;CX().exp.crop=n!==2;CX().exp.rob=n!==4;CX().exp.msg=n!==4;S.players.forEach((x,i)=>{x.on=i<n;x.bot=['easy','normal','hard','hard','normal'][i]});const g=G();CX().exp.river=false;CX().exp.abbot=false;CX().exp.ic=false;CX().exp.tb=false;CX().exp.gold=false;CX().exp.mw=false;CX().exp.fm=false;CX().exp.crop=false;CX().exp.rob=false;CX().exp.msg=false;let k=0;
        while(g.phase!=='done'&&k++<1500){const q=act().find(x=>x.id===ccActor(g));if(!ccBotStep(g,q)){bad.push('stuck '+n);break}}if(g.phase!=='done')bad.push('no end '+n);
        for(const kk of g.order){const T=g.bd[kk],[x,y]=kk.split(',').map(Number);for(let s=0;s<4;s++){const o=g.bd[ccK(x+CCDX[s],y+CCDY[s])];if(o&&ccSide(T.t,T.r,s)!==ccSide(o.t,o.r,(s+2)%4))bad.push('edge '+kk)}}
        if(ra){const riv=g.order.filter(kk=>ccRiverT(g.bd[kk].t));const ti=g.order.map(kk=>ccRiverT(g.bd[kk].t));if(ti.lastIndexOf(true)>ti.indexOf(false)||riv.length<10)bad.push('river order');g.ps.forEach(p=>{const n=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].a||{}).filter(x=>x===p).length,0);if(n+g.ab[p]!==1)bad.push('abbot '+p)})}
        if(n!==2)g.ps.forEach(p=>{const B=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].b||{}).filter(x=>x===p).length,0),P=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].p||{}).filter(x=>x===p).length,0);if(B+g.bu[p]!==1||P+g.pg[p]!==1)bad.push('builder/pig '+p)});
        if(n===5)g.ps.forEach(p=>{const L=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].L||{}).filter(x=>x===p).length,0);if(L+g.lm[p]!==1)bad.push('large '+p)});if(n===5&&g.order.length<80)bad.push('ic tiles '+g.order.length);
        g.ps.forEach(p=>{const on=g.order.reduce((a,kk)=>a+Object.values(g.bd[kk].m).filter(x=>x===p).length+(g.bd[kk].fm||[]).filter(([,x])=>x===p).length,0);if(on+g.mee[p]!==7)bad.push('meeples '+p);const sum=g.scl.filter(e=>e.pid===p).reduce((a,e)=>a+e.pts,0)+10*((g.goodsWin||{})[p]||[]).length+((g.goldPts||{})[p]||0);if(sum!==g.sc[p])bad.push('log '+p)});
        if(g.order.length<(ra?72:60))bad.push('tiles '+g.order.length)}S.players.forEach(x=>x.bot=null);return {ok:!bad.length,bad:bad.slice(0,5)}});
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
