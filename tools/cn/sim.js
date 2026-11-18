global.act=()=>Array.from({length:+(process.env.NP||4)},(_,i)=>({id:'p'+i}));
const fs=require('fs');eval(fs.readFileSync(__dirname+'/words.js','utf8')+fs.readFileSync(__dirname+'/game.js','utf8')+`
let res={r:0,b:0,assassin:0,agents:0,startWin:0},bad=0,turns=0;
for(let k=0;k<2000;k++){const g=cnDeal({words:k%2?'kid':'std'});if(!g||g.words.length!==25||new Set(g.words).size!==25)bad++;
 const c={};g.key.forEach(x=>c[x]=(c[x]||0)+1);if(c[g.start]!==9||c[cnOther(g.start)]!==8||c.n!==7||c.x!==1)bad++;
 if(!cnMove(g,'p0',{a:'begin'}))bad++;let s=0;
 while(g.phase!=='done'&&s++<500){const sp=g.spy[g.turn];
  if(g.phase==='clue'){const n=[-1,0,1,2,3][Math.floor(Math.random()*5)];if(cnMove(g,sp,{a:'clue',w:'ZZQX'+s,n})!==true){bad++;break}
   if(cnMove(g,sp,{a:'clue',w:g.words[g.rev.findIndex(x=>!x)],n:1}))bad++;continue}
  const O=cnOps(g,g.turn);if(cnMove(g,sp,{a:'vote',i:0}))bad++;
  const pick=Math.random()<.15&&cnCanEnd(g)?'end':(()=>{const L=g.key.map((x,i)=>i).filter(i=>!g.rev[i]);const own=L.filter(i=>g.key[i]===g.turn);return Math.random()<.6&&own.length?own[0]:L[Math.floor(Math.random()*L.length)]})();
  O.forEach((p,j)=>cnMove(g,p,{a:'vote',i:j===0&&O.length>1?(pick==='end'?0:'end'):pick}));
  if(O.length>1&&cnAgree(g)!==null&&cnAgree(g)!==pick)bad++;if(O.length>1&&cnMove(g,O[0],{a:'confirm'}))bad++;
  O.forEach(p=>cnMove(g,p,{a:'vote',i:pick}));if(!cnMove(g,O[0],{a:'confirm'})){bad++;break}turns++}
 if(g.phase!=='done')bad++;else{res[g.win]++;res[g.why]++;if(g.win===g.start)res.startWin++;
  if(g.why==='agents'&&cnLeft(g,g.win)!==0)bad++;if(g.why==='assassin'&&!g.rev[g.key.indexOf('x')])bad++}}
console.log('bad',bad,res,'avg turns',(turns/2000).toFixed(1))`);
