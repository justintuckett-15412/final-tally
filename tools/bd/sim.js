// Beyond Balderdash engine check: plays many random games (2-8 players, every option) and re-scores every round on its own.
// Usage: node /home/claude/bd/sim.js [games]   -> must print "bad 0"
const fs=require('fs');let NP=4;global.act=()=>Array.from({length:NP},(_,i)=>({id:'p'+i}));
eval(fs.readFileSync(__dirname+'/data.js','utf8')+fs.readFileSync(__dirname+'/game.js','utf8')+`
const N=+process.argv[2]||3000;const bad=[];const B=s=>{if(bad.length<40)bad.push(s)};const cnt={games:0,rounds:0,cancel:0,dbl:0,two:0,tie:0,bc1:0,dupe:0,laws:0,ownvote:0,timeup:0,dbluff:0,rvsteps:0,allAtOnce:0};
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const WORDS=['A small fish','a SMALL fish!','A type of hat','To sneeze loudly','An old coin','A dance from Peru','A broken umbrella'];
for(let k=0;k<N;k++){NP=2+k%7;const o={die:k%3===0,laws:k%5===1?1:k%5===3?2:0,db:k%2===0,steps:[27,27,15,10,40][k%5],x2:[14,14,7,0,5][k%5],kids:k%4===0,tlim:[0,120,0,300][k%4],rv:[5,3,0,8,10,undefined][k%6]};
  const g=bdDeal(o);cnt.games++;if(NP===2)cnt.two++;if(!g){B('nodeal');continue}
  if(g.o.x2>=g.o.steps)B('x2 >= steps');
  let exp2={},guard=0,lastPos={...g.pos},carry={};
  while(g.phase!=='done'&&guard++<3000){const D=bdDasher(g),others=g.ps.filter(p=>p!==D);
    if(g.phase==='cat'){/* a non-Dasher can't pick; Initials never with two; with the die only the rolled category */
      if(bdMove(g,others[0],{a:'cat',c:'words'}))B('non-dasher picked');
      if(NP===2&&bdMove(g,D,{a:'cat',c:'initials'}))B('initials with two');
      /* Laws (house rule): only when switched on; with the die a 6 is Laws */
      if(!g.o.laws&&(bdCatOK(g,'laws')||bdMove(g,D,{a:'cat',c:'laws'})))B('laws when off');
      if(g.o.laws===2&&(bdCatOK(g,'dates')||bdMove(g,D,{a:'cat',c:'dates'})))B('dates in swap mode');
      if(g.o.laws===1&&g.o.die&&g.die===6&&bdCatOK(g,'laws')&&bdDieCat(g)!=='laws')B('die 6 not laws');
      if(g.o.laws===2&&g.o.die&&g.die===5&&bdCatOK(g,'laws')&&bdDieCat(g)!=='laws')B('die 5 not laws (swap)');
      if(g.o.laws!==1&&g.o.die&&g.die===6&&bdDieCat(g))B('die 6 not choice');
      const ok=BDCATS.filter(c=>bdCatOK(g,c)),dc=bdDieCat(g),want=dc||ok[Math.floor(Math.random()*ok.length)];
      if(dc){const w=ok.find(c=>c!==dc);if(w&&bdMove(g,D,{a:'cat',c:w}))B('die ignored')}
      if(!bdMove(g,D,{a:'cat',c:want}))B('cat refused '+want);if(g.cat==='laws')cnt.laws++;
      if(g.o.kids&&!BDQ[g.cat][g.q?g.q.i:g.q2.qs[0].i][2])B('kids got a grown-up question');
      if(g.q2&&g.q2.qs.some(x=>!BDQ[g.cat][x.i][2])&&g.o.kids)B('kids two');continue}
    if(g.phase==='read'){if(bdMove(g,others[0],{a:'read',k:0}))B('guesser read');bdMove(g,D,{a:'read',k:Math.floor(Math.random()*3)});
      if(g.ans.length!==3||g.ans.filter(a=>a.real).length!==1||g.ans.find(a=>a.real).t!==g.q.a)B('two answers');continue}
    if(g.phase==='write'){const W=bdWriters(g);if(bdDB(g)){cnt.dbluff++;if(!W.includes(D))B('dasher not writing')}else if(W.includes(D))B('dasher writing');
      if(W.length!==(bdDB(g)?NP:NP-1))B('writers');
      if(g.tEnd&&Math.random()<.15){/* time runs out with someone still writing */W.slice(1).forEach(p=>bdMove(g,p,{a:'bluff',t:WORDS[Math.floor(Math.random()*WORDS.length)]}));
        if(g.phase==='write'){if(bdMove(g,D,{a:'timeup'}))B('timeup early');g.tEnd=Date.now()-4000;if(!bdMove(g,D,{a:'timeup'}))B('timeup');else cnt.timeup++}continue}
      W.forEach(p=>{const r=Math.random(),t=r<.12?g.q.a:r<.2?(g.q.a+' !').toUpperCase():WORDS[Math.floor(Math.random()*WORDS.length)];if(!bdMove(g,p,{a:'bluff',t}))B('bluff')});
      if(g.phase!=='review')B('no review');continue}
    if(g.phase==='review'){/* auto-flag: a bluff equal to the real answer is pre-marked */
      Object.keys(g.bl).forEach(p=>{if(p!==D&&norm(g.bl[p])===norm(g.q.a)&&!g.lk[p])B('no looks-correct flag')});
      if(bdMove(g,others[0],{a:'show'}))B('non-dasher show');if(bdDB(g)&&bdMove(g,D,{a:'bc',p:D,on:1}))B('dasher marked own');
      Object.keys(g.bl).forEach(p=>{if(p===D)return;const r=Math.random();if(r<.08)bdMove(g,D,{a:'bc',p,on:1});else if(r<.5&&g.bc[p])bdMove(g,D,{a:'bc',p,on:0})});
      const bc=Object.keys(g.bc).filter(p=>g.bc[p]),before={...g.rp},bl={...g.bl};if(!bdMove(g,D,{a:'show'}))B('show');
      bc.forEach(p=>{if((g.rp[p]||0)!==(before[p]||0)+3)B('bc +3')});
      if(bc.length>1){cnt.cancel++;if(g.phase!=='cat'||bdDasher(g)!==D||!g.cx)B('cancel');continue}
      if(bc.length===1)cnt.bc1++;
      if(g.phase!=='vote')B('no vote');
      /* the list: every unmarked bluff once (identical ones merged), plus the real answer */
      const left=Object.keys(bl).filter(p=>!bc.includes(p));const groups=new Set(left.map(p=>bdNorm(bl[p])));if(groups.size<left.length)cnt.dupe++;
      if(g.ans.length!==groups.size+1)B('answer count '+g.ans.length+' vs '+(groups.size+1));if(g.ans.filter(a=>a.real).length!==1)B('real count');
      continue}
    if(g.phase==='vote'){const V=bdVoters(g);if(V.includes(D))B('dasher votes');if(bdMove(g,D,{a:'vote',i:0}))B('dasher voted');
      Object.keys(g.bc).forEach(p=>{if(g.bc[p]&&V.includes(p))B('bc votes')});
      /* expected points, worked out from scratch */
      const ans=g.ans.map(a=>({...a,by:a.by.slice()})),bc={...g.bc},x2=g.x2n?{...g.x2n}:{},rp={...g.rp},bl={...g.bl},two=bdTwo(g);
      const pick={};V.forEach(v=>{let i=Math.floor(Math.random()*ans.length);const own=ans.findIndex(a=>a.by.includes(v));if(own>=0&&Math.random()<.15){i=own;cnt.ownvote++}pick[v]=i});
      const exp={};g.ps.forEach(p=>exp[p]=rp[p]||0);
      if(two){const v=V[0];if(ans[pick[v]].real)exp[v]+=2;else exp[D]+=1}
      else{let found=false;V.forEach(v=>{const A=ans[pick[v]];if(A.real){exp[v]+=2;found=true}else Object.keys(bl).forEach(w=>{if(w!==v&&!bc[w]&&bdNorm(bl[w])===bdNorm(A.t))exp[w]+=1})});if(V.length&&!found)exp[D]+=3}
      /* a vote may be changed before the last one is in */
      if(V.length>1&&Math.random()<.3){const v=V[0];bdMove(g,v,{a:'vote',i:(pick[v]+1)%ans.length})}
      const pos0={...g.pos};
      V.forEach(v=>{bdMove(g,v,{a:'vote',i:pick[v]})});
      if(g.phase!=='reveal'){B('no reveal');continue}cnt.rounds++;
      if(g.o.x2&&Object.keys(x2).length)cnt.dbl++;
      const ord=g.ps.map((_,i)=>g.ps[(g.di+1+i)%NP]);let win=null;const pos={...pos0},nx={};
      ord.forEach(p=>{const n=exp[p]*(x2[p]?2:1);if((g.res.gain[p]||0)!==n)B('gain '+p+' '+g.res.gain[p]+' vs '+n);if(win)return;pos[p]=Math.min(g.o.steps,pos[p]+n);if(pos[p]>=g.o.steps){win=p;return}if(n>0&&g.o.x2&&pos[p]===g.o.x2)nx[p]=1});
      if(win&&ord.filter(p=>pos0[p]+exp[p]*(x2[p]?2:1)>=g.o.steps).length>1)cnt.tie++;
      if(JSON.stringify(pos)!==JSON.stringify(g.pos))B('pos '+JSON.stringify(pos)+' vs '+JSON.stringify(g.pos));
      if(win!==g.winner)B('winner '+win+' vs '+g.winner);
      if(!win&&JSON.stringify(nx)!==JSON.stringify(g.x2n))B('x2 next');
      if(win&&g.ps.filter(p=>g.pos[p]>=g.o.steps).length!==1)B('two at finish');
      continue}
    if(g.phase==='reveal'&&g.rv){const R=g.rv,ord=bdRvOrd(g);cnt.rvsteps++;
      if(R.i===0){if(ord.length!==g.ans.length||new Set(ord).size!==ord.length||!g.ans[ord[ord.length-1]].real)B('reveal order');
        if(bdMove(g,D,{a:'next'}))B('next during steps');if(others.length&&bdMove(g,others[0],{a:'rvnext',i:0}))B('non-dasher skipped');
        if(bdMove(g,D,{a:'rvauto'}))B('auto too early');if(!bdMove(g,D,{a:'rvpause',on:1})||!g.rv.pz)B('pause');g.rv.t-=60000;if(bdMove(g,D,{a:'rvauto'}))B('auto while paused');
        if(!bdMove(g,D,{a:'rvpause',on:0})||g.rv.pz!=null)B('resume');if(bdMove(g,D,{a:'rvnext',i:5}))B('stale skip')}
      /* each answer's line adds up to the bluff points scored */
      if(!bdTwo(g)&&R.i===0){const want={};g.ans.forEach((A,i)=>{const I=bdAnsInfo(g,i);A.by.forEach(w=>want[w]=(want[w]||0)+I.ptsOf(w))});
        g.ps.forEach(p=>{const n=(g.res.why[p]||[]).filter(x=>/vote/.test(x)).map(x=>+x.match(/\\+(\\d+)/)[1]).reduce((a,b)=>a+b,0);if((want[p]||0)!==n)B('ans pts '+p)})}
      const i0=R.i;if(Math.random()<.5){g.rv.t=Date.now()-g.o.rv*1000-1;if(!bdMove(g,D,{a:'rvauto'}))B('auto')}else if(!bdMove(g,D,{a:'rvnext',i:i0}))B('rvnext');
      if(g.rv&&g.rv.i!==i0+1)B('step');if(!g.rv&&i0!==ord.length-1)B('ended early');continue}
    if(g.phase==='reveal'){const r=g.round,d=g.di;if(g.o.rv===0)cnt.allAtOnce++;
      if(!g.winner&&others.length&&bdMove(g,others[0],{a:'next'}))B('non-dasher passed');
      if(!bdMove(g,g.winner?g.ps[Math.floor(Math.random()*NP)]:D,{a:'next'}))B('next');
      if(g.phase==='cat'&&(g.round!==r+1||g.di!==(d+1)%NP||g.cx||Object.keys(g.rp).length))B('new round');continue}
    B('phase '+g.phase);break}
  if(g.phase!=='done')B('not done '+g.phase+' '+guard);
  if(!g.winner||g.pos[g.winner]!==g.o.steps)B('winner at finish')}
console.log(JSON.stringify(cnt));console.log('bad',bad.length,bad.slice(0,10).join(' | '));
`);
