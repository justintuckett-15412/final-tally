const fs=require('fs');let NP=4;global.act=()=>Array.from({length:NP},(_,i)=>({id:'p'+i}));
eval(fs.readFileSync(__dirname+'/words.js','utf8')+fs.readFileSync(__dirname+'/game.js','utf8')+`
let bad=[];
for(let k=0;k<1200;k++){NP=4+k%5;const sc=['friendly','competitive','none'][k%3];const g=tsDeal({scoring:sc,timer:60});
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
   if(tsMove(g,g.ps.find(p=>p!==o),{a:'rvnext'}))bad.push('nonowner next');while(tsMove(g,o,{a:'rvnext'}));
   const s=B.pages.findIndex(p=>p.kind==='draw'&&p.by!==o),gu=B.pages.findIndex(p=>p.kind==='guess'&&p.by!==o);if(s>=0)tsMove(g,o,{a:'mark',f:'sketch',p:s});if(gu>=0)tsMove(g,o,{a:'mark',f:'guess',p:gu});
   tsMove(g,o,{a:'bookdone'});continue}
  if(g.phase==='roundEnd'){if(g.rounds&&g.round<g.rounds){tsMove(g,g.ps[0],{a:'next'})}else if(!g.rounds){g.round>=2?tsMove(g,g.ps[0],{a:'stop'}):tsMove(g,g.ps[0],{a:'next'})}else bad.push('roundEnd after last');continue}}
 if(g.phase!=='done')bad.push('notdone '+g.phase);if(sc!=='none'&&g.round!==3)bad.push('rounds '+g.round);
 const tot=g.ps.reduce((a,p)=>a+tsTotal(g,p),0);if(sc==='friendly'&&tot>NP*3*2)bad.push('toomany');if(sc==='none'&&tot)bad.push('none scored')}
console.log('bad',bad.length,[...new Set(bad)].slice(0,8))`);
