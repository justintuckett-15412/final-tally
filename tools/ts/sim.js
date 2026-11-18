const fs=require('fs');let NP=4;global.act=()=>Array.from({length:NP},(_,i)=>({id:'p'+i}));
eval(fs.readFileSync(__dirname+'/words.js','utf8')+fs.readFileSync(__dirname+'/game.js','utf8')+`
let bad=[];
for(let k=0;k<1200;k++){NP=4+k%5;const sc=['friendly','competitive','none'][k%3];const au=[0,4,6,8,10,7][k%6],g=tsDeal({scoring:sc,timer:60,auto:au});if(g.auto!==(au===7?0:au))bad.push('auto deal '+au+'->'+g.auto);
 let guard=0;while(g.phase!=='done'&&guard++<500){
  if(g.phase==='pick'){g.ps.forEach(p=>{if(!tsMove(g,p,{a:'word',w:'Made Up',slot:0}))bad.push('pick')});if(g.phase!=='play')bad.push('noplay');continue}
  if(g.phase==='play'){const k2=g.step;/* every book is held by exactly one player */const hs=g.ps.map(o=>tsHolder(g,o,k2));if(new Set(hs).size!==NP)bad.push('holders');
   if((tsOdd(g)||k2>0)&&g.ps.some(p=>tsHolder(g,p,k2)===p))bad.push('own book mid-round');
   g.ps.forEach((p,j)=>{const pr=tsPrompt(g,p);if(!pr||pr.kind!==tsKind(k2))bad.push('prompt');if(k2>0&&pr.kind==='guess'&&pr.draw==null)bad.push('nodraw');
     if(Math.random()<.05&&pr.kind==='draw')return; tsMove(g,p,{a:'page',d:pr.kind==='draw'?'x'.repeat(50):(Math.random()<.5?g.books[pr.owner].word:'guess'+j)})});
   if(g.phase==='play'&&g.step===k2){g.tEnd=Date.now()-5000;if(!tsMove(g,g.ps[0],{a:'timeup'}))bad.push('timeup')}continue}
  if(g.phase==='reveal'){const o=g.ps[g.rv.i],B=g.books[o];if(B.pages.length!==g.steps)bad.push('pages '+B.pages.length);if(B.pages[B.pages.length-1].kind!=='guess')bad.push('lastnotguess');
   if(tsOdd(g)&&B.pages[0].by===o)bad.push('odd owner drew');if(!tsOdd(g)&&B.pages[0].by!==o)bad.push('even owner not first');
   if(new Set(B.pages.map(p=>p.by)).size!==B.pages.length)bad.push('dup author');
   if(tsMove(g,g.ps.find(p=>p!==o),{a:'rvnext'}))bad.push('nonowner next');
   /* auto-play: nothing before its time, a page when it's due, paused = nothing, a stale owner tap never skips a page */
   const R=g.rv;if(typeof R.t!=='number')bad.push('rv.t');if(tsMove(g,g.ps[0],{a:'rvauto'}))bad.push('auto early');
   if(g.auto){R.t-=g.auto*1000+10;const p0=R.p;if(!tsMove(g,g.ps[0],{a:'rvauto'})||R.p!==p0+1)bad.push('auto turn');if(Date.now()-R.t>50)bad.push('auto t');
     if(tsMove(g,g.ps.find(p=>p!==o),{a:'rvpause',on:1}))bad.push('nonowner pause');if(!tsMove(g,o,{a:'rvpause',on:1})||R.pz==null)bad.push('pause');if(tsMove(g,o,{a:'rvpause',on:1}))bad.push('pause twice');
     R.t-=99999;if(tsMove(g,g.ps[0],{a:'rvauto'}))bad.push('auto while paused');if(!tsMove(g,o,{a:'rvpause',on:0})||R.pz!=null)bad.push('resume');if(tsMove(g,g.ps[0],{a:'rvauto'}))bad.push('auto right after resume');
     if(tsMove(g,o,{a:'rvnext',p:R.p-1}))bad.push('stale owner tap');if(!tsMove(g,o,{a:'rvnext',p:R.p}))bad.push('owner tap ahead');
     while(tsMove(g,o,{a:'rvnext'}));R.t-=g.auto*1000+10;if(tsAutoDue(g)!==(g.scoring==='none'?'book':null))bad.push('auto at last '+tsAutoDue(g));if(tsMove(g,g.ps[0],{a:'rvauto'}))bad.push('auto past last')}
   else{R.t-=99999;if(tsMove(g,g.ps[0],{a:'rvauto'})||tsMove(g,o,{a:'rvpause',on:1}))bad.push('auto when off')}
   while(tsMove(g,o,{a:'rvnext'}));
   const s=B.pages.findIndex(p=>p.kind==='draw'&&p.by!==o),gu=B.pages.findIndex(p=>p.kind==='guess'&&p.by!==o);if(s>=0)tsMove(g,o,{a:'mark',f:'sketch',p:s});if(gu>=0)tsMove(g,o,{a:'mark',f:'guess',p:gu});
   tsMove(g,o,{a:'bookdone'});continue}
  if(g.phase==='roundEnd'){if(g.rounds&&g.round<g.rounds){tsMove(g,g.ps[0],{a:'next'})}else if(!g.rounds){g.round>=2?tsMove(g,g.ps[0],{a:'stop'}):tsMove(g,g.ps[0],{a:'next'})}else bad.push('roundEnd after last');continue}}
 if(g.phase!=='done')bad.push('notdone '+g.phase);if(sc!=='none'&&g.round!==3)bad.push('rounds '+g.round);
 const tot=g.ps.reduce((a,p)=>a+tsTotal(g,p),0);if(sc==='friendly'&&tot>NP*3*2)bad.push('toomany');if(sc==='none'&&tot)bad.push('none scored')}
/* ---- "Pass when ready": books flow on their own, random hand-in order, some timeouts ---- */
let aGames=0,aWaits=0,aTimeouts=0,aEarly=0;
for(let k=0;k<1500;k++){NP=4+k%5;const sc=['friendly','competitive','none'][k%3],timer=[0,60,15,600][(k>>2)%4];
 const g=tsDeal({scoring:sc,timer,async:true});if(!g.async||g.timer!==timer)bad.push('deal async/timer');
 g.ps.forEach(p=>tsMove(g,p,{a:'word',w:'Word '+p}));if(g.phase!=='play')bad.push('a noplay');
 const by={};let guard=0,ahead=false;
 while(g.phase==='play'&&guard++<2000){
  /* who can act now, and who's waiting */
  const can=g.ps.filter(p=>{const pr=tsPrompt(g,p);return pr&&!pr.wait}),wait=g.ps.filter(p=>{const pr=tsPrompt(g,p);return pr&&pr.wait});
  if(!can.length){bad.push('a deadlock');break}
  wait.forEach(p=>{aWaits++;const pr=tsPrompt(g,p),B=g.books[pr.owner];if(B.pages[pr.k-1])bad.push('a wait but ready');if(tsAt(g,pr.from)>pr.k-1)bad.push('a from wrong');
    if(tsHolder(g,pr.owner,pr.k-1)!==pr.from)bad.push('a from not holder');
    if(tsMove(g,p,{a:'page',d:'x',o:pr.owner,k:pr.k}))bad.push('a moved before book arrived')});
  const ats=g.ps.map(p=>tsAt(g,p));if(Math.max(...ats)-Math.min(...ats)>=2)ahead=true;
  /* every player with a sketch page that has arrived has their own timer */
  g.ps.forEach(p=>{const pr=tsPrompt(g,p);if(timer&&pr&&!pr.wait&&pr.kind==='draw'&&!(g.te||{})[p])bad.push('a no timer');if(pr&&pr.kind==='guess'&&(g.te||{})[p])bad.push('a guess timer')});
  const p=can[Math.floor(Math.random()*can.length)],pr=tsPrompt(g,p),kBefore=tsAt(g,p);
  if(tsMove(g,p,{a:'page',d:'y',o:pr.owner,k:pr.k+1}))bad.push('a wrong k accepted');
  if(tsMove(g,p,{a:'page',d:'y',o:g.ps.find(o=>o!==pr.owner),k:pr.k}))bad.push('a wrong book accepted');
  if(pr.kind==='draw'&&timer&&Math.random()<.12){/* this player runs out of time: the host leaves the page blank */
    if(tsMove(g,g.ps[0],{a:'timeup'}))bad.push('a early timeup');g.te[p]=Date.now()-5000;if(!tsMove(g,g.ps[0],{a:'timeup'}))bad.push('a timeup');aTimeouts++;
    const P=g.books[pr.owner].pages[pr.k];if(!P||P.by!==p||P.d!=='')bad.push('a timeup page');}
  else if(!tsMove(g,p,{a:'page',d:pr.kind==='draw'?'x'.repeat(40):(Math.random()<.5?g.books[pr.owner].word:'g'+p),o:pr.owner,k:pr.k}))bad.push('a page refused');
  if(g.phase==='play'&&tsAt(g,p)!==kBefore+1)bad.push('a at');
  /* a player never works two pages of the same book */
  const key=p+'>'+pr.owner;if(by[key])bad.push('a twice same book');by[key]=1}
 if(ahead)aEarly++;
 if(g.phase!=='reveal')bad.push('a not reveal '+g.phase);aGames++;
 g.ps.forEach(o=>{const B=g.books[o];if(B.pages.length!==g.steps)bad.push('a pages');B.pages.forEach((P,i)=>{if(!P||P.kind!==tsKind(i))bad.push('a kind')});
   if(new Set(B.pages.map(P=>P.by)).size!==B.pages.length)bad.push('a dup author');if(B.pages.some(P=>P.by===o)&&tsOdd(g))bad.push('a odd owner');
   if(!tsOdd(g)&&B.pages[0].by!==o)bad.push('a even owner first');if(tsOdd(g)&&B.pages[0].by!==tsHolder(g,o,0))bad.push('a odd first');
   B.pages.forEach((P,i)=>{if(P.by!==tsHolder(g,o,i))bad.push('a direction')})});
 /* finish the round and the game like normal */
 let gd=0;while(g.phase!=='done'&&gd++<400){if(g.phase==='reveal'){const o=g.ps[g.rv.i];while(tsMove(g,o,{a:'rvnext'}));tsMove(g,o,{a:'bookdone'})}
   else if(g.phase==='roundEnd'){if(g.rounds&&g.round<g.rounds||!g.rounds&&g.round<2)tsMove(g,g.ps[0],{a:'next'});else tsMove(g,g.ps[0],{a:'stop'})}
   else if(g.phase==='pick')g.ps.forEach(p=>tsMove(g,p,{a:'word',w:'W'+p}));
   else if(g.phase==='play'){const p=g.ps.find(p=>{const pr=tsPrompt(g,p);return pr&&!pr.wait}),pr=tsPrompt(g,p);if(!tsMove(g,p,{a:'page',d:'z',o:pr.owner,k:pr.k}))bad.push('a later round')}}
 if(g.phase!=='done')bad.push('a game not done')}
/* custom timer: any whole number 10-600 (or 0) is kept, anything else is the official 60 */
NP=4;[[0,0],[10,10],[45,45],[600,600],[9,60],[601,60],[12.5,60],['abc',60],[undefined,60],[17,17]].forEach(([t,w])=>{const g=tsDeal({timer:t});if(g.timer!==w)bad.push('timer '+t+'->'+g.timer)});
console.log('async games',aGames,'waits',aWaits,'timeouts',aTimeouts,'games where someone got 2+ pages ahead',aEarly);
console.log('bad',bad.length,[...new Set(bad)].slice(0,8))`);
