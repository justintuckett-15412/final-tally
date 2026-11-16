/* Dead of Winter bot simulator: node dow/sim.js  (env: G games, NP players, LV levels, MO objective id, SIDE std|hc, MODE) */
global.S={};const NP=+(process.env.NP||4),LV=(process.env.LV||'easy').split(',');
global.act=()=>Array.from({length:NP},(_,i)=>({id:'p'+i,name:'P'+i,bot:LV[i%LV.length]}));global.gAnn=()=>{};global.gLog=(g,t)=>{if(process.env.LOG)console.log(t)};global.nmid=x=>x;global.nm=p=>p.name;
const fs=require('fs'),D=__dirname;eval(fs.readFileSync(D+'/data.js','utf8')+(process.env.NOXR?'':fs.readFileSync(D+'/xr.js','utf8'))+fs.readFileSync(D+'/game.js','utf8')+';global.T={dwDeal,dwBotStep,dwActor,DWMO,dwBotYawn}');
const G=+(process.env.G||20),DWMO_N=10;const st={err:0,stuck:0,why:{},wins:0,players:0,rounds:[],mo:{},xr:0,betrayWin:0,betrayers:0,exiles:0,ms:0};const t0=Date.now();
for(let k=0;k<G;k++){const mo=process.env.MO||T.DWMO[k%T.DWMO.length].id,side=process.env.SIDE||(Math.floor(k/DWMO_N)%2?'hc':'std');let g;
  try{g=T.dwDeal({mo,side,mode:process.env.MODE||(NP<=2?'coop':(k%5===4?'betrayer':'normal'))});const P=act();let n=0;
    while(g.phase!=='done'&&n<60000){const a=T.dwActor(g);if(!a){st.stuck++;console.log('STUCK',JSON.stringify(g.q[0]).slice(0,300),g.vote?'vote':'');break}
      if(T.dwBotYawn(g))continue;const q=P.find(p=>p.id===a);if(!T.dwBotStep(g,q)){st.stuck++;console.log('BOTFAIL',JSON.stringify(g.ask).slice(0,300),JSON.stringify(g.q[0]).slice(0,200));break}n++}
    if(g.phase!=='done'){if(n>=60000){st.stuck++;console.log('LONG')}continue}
    st.why[g.endWhy]=(st.why[g.endWhy]||0)+1;st.rounds.push(g.rndNo);(st.mo[mo+'/'+side]=st.mo[mo+'/'+side]||[0,0])[0]++;if(g.mo.done)st.mo[mo+'/'+side][1]++;
    st.xr+=(g.xrOut||[]).length;g.ps.forEach(p=>{st.players++;if(g.fin[p].win)st.wins++;if(g.P[p].betray){st.betrayers++;if(g.fin[p].win)st.betrayWin++}if(g.P[p].exiled)st.exiles++})}
  catch(e){st.err++;console.log('ERR',mo,side,e.stack.split('\n').slice(0,4).join(' | '))}}
const av=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'-';
console.log(`games ${G} players ${NP} levels ${LV} | errors ${st.err} stuck ${st.stuck} | ends ${JSON.stringify(st.why)} | avg rounds ${av(st.rounds)} | player win rate ${(st.wins/Math.max(1,st.players)*100).toFixed(0)}% | betrayer wins ${st.betrayWin}/${st.betrayers} | exiles ${st.exiles} | crossroads triggered ${st.xr} | ms/game ${((Date.now()-t0)/G)|0}`);
if(process.env.MOS)console.log(JSON.stringify(st.mo));
