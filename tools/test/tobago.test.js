// Tobago: the island, every clue type, clue rules, site markers, driving, amulets, raising and sharing treasure,
// curses, statues, expert powers, the end, a game played through the screen, bot games, the score sheet, and two linked phones.
process.env.LAT=process.env.LAT||'120';process.env.JIT=process.env.JIT||'120';
const {mk,W,ok,done,chromium,readyAll}=require('./link.js');
(async()=>{const browser=await chromium.launch();let P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const R=await P.evaluate(()=>{const out=[];const t=(name,f)=>{try{const r=f();out.push([name,!!r.ok,r.ok?'':JSON.stringify(r)])}catch(e){out.push([name,false,e.message+' '+(e.stack||'').split('\n')[1]])}};
    const fresh=(n=3,X={})=>{S=tgFresh();S.tgx=Object.assign({...TGDEF},{play:1},X);S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cy','Di'][i];p.bot=null});S.started=true;tgDeal();const g=S.tgg;return {g,ids:g.ps,M:id=>g.me[id],B:tgB(g)}};
    const play=(g)=>{g.ps.forEach((p,i)=>tgPlace(g,p,i));return g};
    const all=B=>[...Array(B.n).keys()];
    t('Setup: 52 clues, 4 in hand (6 with 2 players), one started map per player',()=>{const a=fresh(3),b=fresh(2);const cnt=x=>x.g.deck.length+x.ids.reduce((s,p)=>s+x.M(p).h.length,0)+x.g.maps.reduce((s,M)=>s+M.c.length,0);
      return {ok:cnt(a)===52&&cnt(b)===52&&a.ids.every(p=>a.M(p).h.length===4)&&b.ids.every(p=>b.M(p).h.length===6)&&a.g.maps.filter(M=>M.cand).length===3&&!a.g.maps[3].cand&&b.g.maps.filter(M=>M.cand).length===2}});
    t('Setup: 39 treasure cards + 2 curses, never a curse in the top 12, 139 gold',()=>{let okk=true;for(let i=0;i<40;i++){const {g}=fresh(3);if(g.td.length!==41||g.td.slice(-12).includes(0)||g.td.filter(x=>x===0).length!==2||g.td.reduce((a,x)=>a+x,0)!==139)okk=false}return {ok:okk}});
    t('Island: one largest area per terrain, objects 4+ apart, statues away from the ocean, no holes',()=>{let bad=[];for(let i=0;i<40;i++){const {g,B}=fresh(3,{size:['s','m','l'][i%3]});const C=g.b.c;
      TGTK.forEach(tk=>{const sz={};C.forEach(c=>{if(c[2]===tk)sz[c[3]]=(sz[c[3]]||0)+1});const v=Object.values(sz).sort((a,b)=>b-a);if(!v.length||v.length>1&&v[0]===v[1])bad.push('largest '+tk)});
      [g.b.hut,g.b.palm,g.b.st.map(s=>s[0])].forEach(L=>L.forEach(a=>L.forEach(b=>{if(a!==b&&B.D[a][b]<4)bad.push('close')})));if(new Set([...g.b.hut,...g.b.palm,...g.b.st.map(s=>s[0])]).size!==10)bad.push('share');
      g.b.st.forEach(s=>{if(B.coast[s[0]])bad.push('statue coast')});if(g.b.hut.length!==4||g.b.palm.length!==3||g.b.st.length!==3)bad.push('counts')}return {ok:!bad.length,bad:bad.slice(0,5)}});
    t('Clues: “Next to” and “In sight” never include the landmark; the “Not” ones can',()=>{const {g,B}=fresh();const L=B.lm;let bad=[];
      const chk=(k,i,want)=>{if(B.ok[k][i]!==want)bad.push(k+'@'+i)};
      L.hut.forEach(i=>{chk('next:hut',i,false);chk('sight:hut',i,false);chk('notnext:hut',i,true);chk('notsight:hut',i,true)});
      L.j.forEach(i=>{chk('next:j',i,false);chk('in:j',i,true);chk('notin:j',i,false)});
      all(B).forEach(i=>{const d=Math.min(...L.palm.map(j=>B.D[i][j]));chk('next:palm',i,d===1);chk('sight:palm',i,d===1||d===2);chk('notsight:palm',i,d===0||d>2)});
      all(B).forEach(i=>{chk('next:o',i,B.coast[i]);chk('notnext:o',i,!B.coast[i])});
      all(B).forEach(i=>{const big=g.b.c[i][2]==='l'&&g.b.c[i][3]===g.b.big.l;chk('in:l*',i,big);chk('notin:l*',i,!big)});
      return {ok:!bad.length,bad:bad.slice(0,6)}});
    t('Clues: “In sight of the ocean” is 1 or 2 spaces from the sea',()=>{const {g,B}=fresh();let bad=0;all(B).forEach(i=>{const inner=B.nb[i].every(j=>!B.coast[j]);if(B.ok['sight:o'][i]!==(B.coast[i]||!inner))bad++});return {ok:!bad,bad}});
    t('Clue rules: must narrow the map and leave at least one space',()=>{const {g,ids,M}=fresh();play(g);const m=0,Mp=g.maps[m],k0=Mp.c[0].k;const [ty,l]=k0.split(':');
      const opp={in:'notin',notin:'in',next:'notnext',notnext:'next',sight:'notsight',notsight:'sight'}[ty]+':'+l;const same=k0;
      return {ok:!!tgClueWhy(g,m,opp)&&!!tgClueWhy(g,m,same)&&TGCLUES.some(k=>!tgClueWhy(g,m,k))}});
    t('Play a clue: it goes on the map with your compass rose, you draw back up, the action is used',()=>{const {g,ids,M}=fresh();play(g);const p=g.turn;const i=M(p).h.findIndex(k=>[0,1,2,3].some(m=>!tgClueWhy(g,m,k)));if(i<0)return {ok:true,skip:1};const k=M(p).h[i],m=[0,1,2,3].find(m=>!tgClueWhy(g,m,k));
      const n0=g.maps[m].cand?g.maps[m].cand.length:999;const r=tgClue(g,p,i,m);const e=g.maps[m].c[g.maps[m].c.length-1];return {ok:r&&e.k===k&&e.r[0]===p&&M(p).h.length===4&&g.t.act&&g.maps[m].cand.length<n0&&!tgClue(g,p,0,m)}});
    t('A second clue needs an amulet',()=>{const {g,ids,M}=fresh();play(g);const p=g.turn;g.t.act=1;M(p).am=1;const i=M(p).h.findIndex(k=>[0,1,2,3].some(m=>!tgClueWhy(g,m,k)));if(i<0)return {ok:true};const m=[0,1,2,3].find(m=>!tgClueWhy(g,m,M(p).h[i]));return {ok:tgClue(g,p,i,m)&&M(p).am===0}});
    t('Site markers go down at 17 spaces or fewer; one left = found',()=>{const {g}=fresh();const m=0;tgSetCand(g,m,[...Array(18).keys()]);const a=g.maps[m].mk;tgSetCand(g,m,[...Array(17).keys()]);const b=g.maps[m].mk;return {ok:!a&&b===1}});
    t('Driving: 3 legs; a leg is a whole terrain area or one step into another terrain',()=>{const {g,ids,B}=fresh();play(g);const p=g.turn;const here=g.pos[p],reg=g.b.c[here][3];
      const area=all(B).filter(i=>g.b.c[i][3]===reg&&i!==here),far=area.find(i=>B.D[here][i]>1);const legOk=B.leg[here];const offA=all(B).find(i=>!legOk.includes(i)&&i!==here);
      tgMoveStart(g,p);const no=offA==null||!tgLegTo(g,p,offA);let yes=true;if(far!=null)yes=tgLegTo(g,p,far);return {ok:no&&yes&&g.t.mv&&g.t.mv.left===(far!=null?2:3)}});
    t('Driving: the 3rd leg ends the drive',()=>{const {g,B}=fresh();play(g);const p=g.turn;tgMoveStart(g,p);for(let i=0;i<3;i++)tgLegTo(g,p,B.leg[g.pos[p]][0]);return {ok:!g.t.mv&&!tgLegTo(g,p,B.leg[g.pos[p]][0])}});
    t('Amulets: end a leg on one to pick it up; not on an amulet drive; free at the start of your turn',()=>{const {g,ids,M,B}=fresh();play(g);const p=g.turn,n=B.leg[g.pos[p]][0];g.am=[n];tgMoveStart(g,p);tgLegTo(g,p,n);const got=M(p).am===1&&!g.am.length;
      const q=fresh();play(q.g);const p2=q.g.turn,n2=q.B.leg[q.g.pos[p2]][0];q.g.am=[n2];q.g.t.act=1;q.M(p2).am=1;tgMoveStart(q.g,p2);tgLegTo(q.g,p2,n2);const no=q.M(p2).am===0&&q.g.am.length===1;
      const r=fresh(2);play(r.g);const nx=r.ids.find(x=>x!==r.g.turn);r.g.am=[r.g.pos[nx]];tgEnd(r.g,r.g.turn);return {ok:got&&no&&r.M(nx).am===1,got,no}});
    t('Swap clues instead of a turn; with an amulet any time',()=>{const {g,ids,M}=fresh();play(g);const p=g.turn,h=M(p).h.slice();const r=tgSwap(g,p,0);const moved=g.turn!==p;const q=g.turn;M(q).am=1;g.t.act=1;const r2=tgSwap(g,q,1);return {ok:r&&moved&&r2&&g.turn===q&&M(q).am===0}});
    t('Amulet: remove a site marker, never the last one',()=>{const {g,M}=fresh();play(g);const p=g.turn;M(p).am=2;tgSetCand(g,0,[1,2]);const r=tgRemove(g,p,0,1);const r2=tgRemove(g,p,0,2);return {ok:r&&!r2&&g.maps[0].cand.join()==='2'&&M(p).am===1}});
    const raiseSetup=(n=3)=>{const x=fresh(n);play(x.g);const g=x.g,[a,b,c]=x.ids;g.maps[0].c=[{k:'next:hut',r:[b]},{k:'in:j',r:[c||b]},{k:'notin:b',r:[a]}];g.turn=a;g.t={act:0,mv:null,did:0};tgSetCand(g,0,[5]);g.pos[a]=5;return {...x,a,b,c}};
    t('Raise: only when the spot is known and your ATV is on it',()=>{const x=raiseSetup();const g=x.g;g.pos[x.a]=6;const no=!tgRaise(g,x.a,0);g.pos[x.a]=5;const no2=!tgRaise(g,x.b,0);return {ok:no&&no2&&tgRaise(g,x.a,0)}});
    t('Raise: one card per compass rose each, plus one unseen; the raiser is asked first',()=>{const x=raiseSetup();const g=x.g;g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];tgRaise(g,x.a,0);const D=g.dist;
      return {ok:D.cards.length===5&&D.seen[x.a].length===2&&D.seen[x.b].length===1&&(x.c?D.seen[x.c].length===1:1)&&D.q[0]===x.a&&D.q.join()===[x.a,x.a,x.c,x.b].join(),q:D.q}});
    t('Sharing: pass goes up the map; taking gives the rose back and the next card starts from the bottom',()=>{const x=raiseSetup();const g=x.g;g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];tgRaise(g,x.a,0);const D=g.dist;D.cards=[5,4,3,2,6];
      tgTake(g,x.a,false);tgTake(g,x.a,false);const askC=D.q[D.ai]===x.c;tgTake(g,x.c,true);const back=D.q.join()===[x.a,x.a,x.b].join()&&D.ai===0&&g.me[x.c].tr.join()==='5';
      tgTake(g,x.a,true);tgTake(g,x.a,true);tgTake(g,x.b,true);return {ok:askC&&back&&!g.dist&&g.me[x.a].tr.join()==='4,3'&&g.me[x.b].tr.join()==='2'&&g.tdisc.includes(6)}});
    t('Nobody takes it: discarded',()=>{const x=raiseSetup();const g=x.g;g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];tgRaise(g,x.a,0);const D=g.dist;D.cards=[2,6,6,6,6];const d0=g.tdisc.length;D.q.slice().forEach(p=>tgTake(g,D.q[D.ai],false));return {ok:g.tdisc.length===d0+1&&g.dist.i===1}});
    t('Curse: stops the sharing; those still on the map lose an amulet, or their best treasure',()=>{const x=raiseSetup();const g=x.g;g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];g.me[x.b].tr=[6,2];g.me[x.c].am=1;tgRaise(g,x.a,0);const D=g.dist;D.cards=[4,0,5,0,3];
      tgTake(g,x.a,true);/* Ann still has her second rose on the map, so the curse hits her too */return {ok:!g.dist&&g.me[x.b].tr.join()==='2'&&g.me[x.c].am===0&&g.me[x.a].tr.join()===''&&g.td.every(v=>v!==0)&&!g.tdisc.includes(0)}});
    t('After a treasure: the last claimer starts the new map; a curse first means the raiser',()=>{const x=raiseSetup();const g=x.g;g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];tgRaise(g,x.a,0);g.dist.cards=[4,5,3,2,2];tgTake(g,x.a,false);tgTake(g,x.a,false);tgTake(g,x.c,true);tgTake(g,x.a,true);tgTake(g,x.a,true);tgTake(g,x.b,true);
      const A=g.ask&&g.ask.k==='newmap'&&g.ask.p===x.b&&!g.maps[0].c.length;const i=g.me[x.b].h.findIndex(k=>!tgClueWhy(g,0,k));const nm2=tgNewMap(g,x.b,i)&&g.maps[0].c[0].r[0]===x.b&&g.turn===x.a;
      const y=raiseSetup();y.g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];tgRaise(y.g,y.a,0);y.g.dist.cards=[0,2,3,4,5];tgFlip(y.g);return {ok:A&&nm2&&y.g.ask&&y.g.ask.p===y.a}});
    t('Statues: amulets wash ashore where they look, then they turn 60° clockwise',()=>{const x=raiseSetup();const g=x.g,B=x.B,C=g.b.c;const dirs=g.b.st.map(s=>s[1]);g.am=[];g.td=[2,3,4,5,6,2,3,4,5,6,2,3,4];
      const want=g.b.st.map(([i,d])=>{let cur=i;for(;;){const nx=C.findIndex(c=>c[0]===C[cur][0]+TGDIR[d][0]&&c[1]===C[cur][1]+TGDIR[d][1]);if(nx<0)break;cur=nx}return cur});
      tgRaise(g,x.a,0);while(g.dist)tgTake(g,g.dist.q[g.dist.ai],true);const same=want.every(c=>g.am.includes(c))&&want.every(c=>B.coast[c]);return {ok:same&&g.b.st.every((s,i)=>s[1]===(dirs[i]+5)%6),want,am:g.am}});
    t('Game end: when the treasure deck runs out, after the sharing; gold adds up',()=>{const x=raiseSetup();const g=x.g;g.td=[3,4];g.tdisc=[5,5,5];tgRaise(g,x.a,0);while(g.dist)tgTake(g,g.dist.q[g.dist.ai],true);const P=act();
      return {ok:g.phase==='done'&&P.every(p=>total(p)===tgGold(g,p.id))&&g.tout===1}});
    t('Expert: Double-Claim and swapping roses (only when switched on)',()=>{const x=fresh(3);play(x.g);const g=x.g,[a,b]=x.ids;g.turn=a;g.t={act:1,mv:null,did:0};g.me[a].am=3;g.maps[0].c=[{k:'next:hut',r:[a]},{k:'in:j',r:[b]}];tgSetCand(g,0,[1,2,3]);
      const off=!tgDouble(g,a,0,0);g.xp=1;const d=tgDouble(g,a,0,0)&&g.maps[0].c[0].r.join()===[a,a].join();const no=!tgSwapRose(g,a,0,0,1);g.maps[0].c.push({k:'notin:b',r:[b]});const sw=tgSwapRose(g,a,0,1,2);return {ok:off&&d&&no&&!sw&&g.me[a].am===2}});
    t('Swap two single roses on one map',()=>{const x=fresh(3);play(x.g);const g=x.g,[a,b]=x.ids;g.xp=1;g.turn=a;g.t={act:1,mv:null,did:0};g.me[a].am=1;g.maps[0].c=[{k:'next:hut',r:[a]},{k:'in:j',r:[b]}];tgSetCand(g,0,[1,2,3]);return {ok:tgSwapRose(g,a,0,0,1)&&g.maps[0].c[0].r[0]===b&&g.maps[0].c[1].r[0]===a}});
    /* ---- Tobago Volcano ---- */
    const vfresh=(n=3)=>fresh(n,{vol:1});
    t('Volcano setup: 7 volcano spaces, one triad per player with its ATV on it, 25 lava tiles',()=>{let bad=[];for(let i=0;i<20;i++){const {g,ids,B}=vfresh(2+i%3);if(B.lm.V.length!==7)bad.push('v');if(g.lava!==25)bad.push('lava');if(B.lm.L.length!==ids.length)bad.push('triads '+B.lm.L.length);
      if(g.phase!=='turn'||ids.some(p=>g.pos[p]==null||!B.valid[g.pos[p]]))bad.push('atv');if([...g.b.hut,...g.b.palm,...g.b.st.map(s=>s[0])].some(c=>!B.valid[c]))bad.push('object');if(new Set(ids.map(p=>g.pos[p])).size!==ids.length)bad.push('same start')}return {ok:!bad.length,bad}});
    t('Volcano: no treasure on the volcano or lava; “Next to the volcano” clue works',()=>{const {g,B}=vfresh();let bad=0;[...Array(B.n).keys()].forEach(i=>{if(!B.valid[i]&&TGCLUES.some(k=>B.ok[k][i]))bad++;const d=Math.min(...B.lm.V.map(j=>B.D[i][j]));if(B.valid[i]&&B.ok['next:V'][i]!==(d===1))bad++});return {ok:!bad,bad}});
    t('Volcanic clue: only to cover a clue that breaks a rule, and it must fit; each one once',()=>{const {g,ids,M}=vfresh();const p=g.turn;const m=0,k0=g.maps[m].c[0].k;M(p).h[0]=k0;
      const vk=TGVCL.find(v=>!tgClueWhy(g,m,v));if(!vk)return {ok:true,skip:1};const legalK=TGCLUES.find(k=>!tgClueWhy(g,m,k));M(p).h[1]=legalK;
      const no=!tgClue(g,p,1,m,vk);const yes=tgClue(g,p,0,m,vk);const e=g.maps[m].c[g.maps[m].c.length-1];return {ok:no&&yes&&e.v===vk&&e.k===k0&&e.r[0]===p&&!tgVolFree(g).includes(vk)}});
    t('Lava: only next to the volcano or lava, never on a statue, ATV or amulet; it burns a hut',()=>{const {g,ids,B}=vfresh();const p=g.turn;const sp=tgLavaSpots(g);const okSp=sp.every(i=>B.nb[i].some(j=>['L','V'].includes(g.b.c[j][2]))&&!B.lm.st.includes(i)&&!Object.values(g.pos).includes(i));
      const c=sp[0];g.b.hut.push(c);g.ask={k:'lava',p};const no=!tgLava(g,p,B.lm.st[0]);const r=tgLava(g,p,c);return {ok:okSp&&no&&r&&g.b.c[c][2]==='L'&&!g.b.hut.includes(c)&&g.lava===24}});
    t('Lava: picking up an amulet means placing a lava tile',()=>{const {g,B}=vfresh();const p=g.turn;const n=tgLegTargets(g,p)[0]||B.leg[g.pos[p]][0];g.am=[n];tgMoveStart(g,p);tgLegTo(g,p,n);return {ok:g.ask&&g.ask.k==='lava'&&g.ask.p===p}});
    t('Lava: a treasure that vanishes is replaced by a new map from whoever poured the lava',()=>{const {g,B}=vfresh();const p=g.turn;const sp=tgLavaSpots(g);const c=sp[0];g.maps[1].c=[{k:'next:hut',r:[p]}];g.maps[1].cand=[c];g.maps[1].mk=1;g.maps[1].rm=tgValid(g).filter(i=>i!==c);g.ask={k:'lava',p};tgLava(g,p,c);return {ok:!g.maps[1].c.length&&g.ask&&g.ask.k==='newmap'&&g.ask.p===p&&g.ask.m===1}});
    t('Lava: when the last of a terrain is gone, its In/Next/Sight clues come off',()=>{const {g,B}=vfresh();const p=g.turn;const t2=TGTK.find(t=>B.lm[t].length);g.maps[2].c=[{k:'next:'+t2,r:[p]},{k:'notin:'+t2,r:[p]}];g.maps[2].cand=tgValid(g).filter(i=>B.ok['notin:'+t2][i]);
      B.lm[t2].slice().forEach(i=>{g.b.c[i][2]='L'});g.bv++;tgLavaFx(g,p);return {ok:g.gone[t2]===1&&g.maps[2].c.length===1&&g.maps[2].c[0].k==='notin:'+t2}});
    t('Driving: never onto lava; a lava drive costs an amulet and must end off the lava',()=>{const {g,B}=vfresh();const p=g.turn;const L=B.lm.L[0];const nl=B.nb[L].filter(j=>B.valid[j]);g.pos[p]=nl[0];g.ps.forEach(q=>{if(q!==p)g.pos[q]=tgValid(g).find(c=>c!==nl[0]&&!B.nb[L].includes(c))});
      tgMoveStart(g,p);const no=!tgLegTargets(g,p).includes(L);g.t={act:0,mv:null,did:0};g.me[p].am=1;const r=tgMoveStart(g,p,1);const yes=tgLegTargets(g,p).includes(L);tgLegTo(g,p,L);const stop=!tgStop(g,p)&&!tgEnd(g,p);return {ok:no&&r&&yes&&stop&&g.me[p].am===0}});
    t('Statues: amulets surface on the last space before the lava',()=>{const {g,B}=vfresh();const C=g.b.c,idx={};C.forEach((c,i)=>idx[c[0]+','+c[1]]=i);const [s0,d]=g.b.st[0];const path=[];let cur=s0;for(;;){const nx=idx[(C[cur][0]+TGDIR[d][0])+','+(C[cur][1]+TGDIR[d][1])];if(nx===undefined)break;cur=nx;path.push(nx)}
      const end=path[path.length-1];if(C[end][2]==='V'||path.length<2)return {ok:true,skip:1};C[end][2]='L';g.bv++;const want=path.filter(i=>C[i][2]!=='L'&&C[i][2]!=='V').pop();g.am=[];g.maps[0].c=[{k:'next:hut',r:[g.turn]}];g.dist={m:0,cards:[],seen:{},i:0,q:[],ai:0,raiser:g.turn,last:null,got:[]};g.td=[2,3];tgDistEnd(g);return {ok:want==null?!g.am.includes(end):g.am.includes(want)&&!g.am.includes(end)}});
    t('Score sheet for the real game',()=>({ok:tgTot({tg:{f:{gold:31,n:7}}})===31}));
    return out});
  R.forEach(([n,g,x])=>ok(n,g,x));

  // a game through the screen: one person against three computer players
  await P.close();P=await mk(browser,'q');P.on('pageerror',e=>errs.push(e.message));
  await P.evaluate(()=>{window.__htfast=1;S.screen='home';render()});await W(300);
  ok('Home: Tobago card with Play and Score',await P.evaluate(()=>!!document.querySelector('[data-a="tgstart"][data-k="1"]')&&!!document.querySelector('[data-a="tgstart"][data-k="0"]')));
  await P.evaluate(()=>document.querySelector('[data-a="tgstart"][data-k="1"]').click());await W(300);
  ok('Setup: island size and house rules',await P.evaluate(()=>document.querySelectorAll('[data-a="tgsize"]').length===3&&!!document.querySelector('[data-a="tgxp"]')&&!!document.querySelector('[data-a="tgshow"]')));
  await P.evaluate(()=>document.querySelector('[data-a="tgxp"]').click());await W(100);
  ok('Setup: expert powers switch on',await P.evaluate(()=>TGX().xp===1));
  await P.screenshot({path:'/tmp/tg-setup.png',fullPage:true});
  await P.evaluate(()=>{S.players.forEach((p,i)=>{p.on=i<4;p.name=['Justin','Kim','Bo','Al'][i];p.bot=i?['easy','normal','hard'][i-1]:null});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()});await W(1200);
  const me=await P.evaluate(()=>act()[0].id);let moves=0,shots=0;
  const tap=sel=>P.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(b){b.click();return true}return false},sel);
  const cell=sel=>P.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;const c=L[Math.floor(Math.random()*L.length)];c.dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
  for(let i=0;i<4000;i++){const st=await P.evaluate(()=>{const g=S.tgg;return g?{a:tgActor(g),ph:g.phase,dist:!!g.dist,ask:!!g.ask,act:g.t&&g.t.act,mv:!!(g.t&&g.t.mv),done:g.phase==='done'}:null});if(!st)continue;if(st.done)break;
    if(st.a!==me){await W(100);continue}moves++;
    if(shots<5&&moves%9===1){await P.screenshot({path:`/tmp/tg-move${shots++}.png`,fullPage:true})}
    if(st.ph==='place'){await cell('polygon.go[data-a="tgpcell"]')}
    else if(st.dist){await P.evaluate(()=>{const v=S.tgg.dist.cards[S.tgg.dist.i];document.querySelector(`[data-a="tgptake"][data-k="${v>=4?1:0}"]`).click()})}
    else if(st.ask){await tap('[data-a="tgpnew"]')}
    else if(await tap('[data-a="tgpraise"]')){}
    else if(st.mv){if(Math.random()<.15)await tap('[data-a="tgpstop"]');else{const toward=await P.evaluate(()=>{const g=S.tgg,me=act()[0].id,f=g.maps.map(M=>M.cand&&M.cand.length===1?M.cand[0]:null).filter(x=>x!=null);if(!f.length)return null;const L=tgLegs(g,g.pos[me]),goal=f.sort((a,b)=>L[a]-L[b])[0];const st=tgB(g).leg[g.pos[me]].find(c=>tgLegs(g,c)[goal]===L[goal]-1);return st});
      if(toward!=null)await P.evaluate(i=>document.querySelector(`polygon[data-a="tgpcell"][data-k="${i}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true})),toward);else await cell('polygon.go[data-a="tgpcell"]')}}
    else if(!st.act){const found=await P.evaluate(()=>S.tgg.maps.some(M=>M.cand&&M.cand.length===1));
      if(found&&Math.random()<.7)await tap('[data-a="tgpdrive"]');
      else{let played=false;const n=await P.evaluate(()=>document.querySelectorAll('[data-a="tgphand"]').length);for(let h=0;h<n&&!played;h++){await P.evaluate(h=>{const b=document.querySelectorAll('[data-a="tgphand"]')[h];b.click()},h);await W(40);played=await tap('[data-a="tgpclue"]');if(!played)await P.evaluate(h=>{const b=document.querySelectorAll('[data-a="tgphand"]')[h];if(b&&b.classList.contains('sel'))b.click()},h)}
        if(!played&&!await tap('[data-a="tgpdrive"]'))await tap('[data-a="tgpswap"][data-k="0"]')}}
    else{if(!await tap('[data-a="tgpend"]'))break;await tap('[data-a="tgpend"]')}
    await W(60)}
  ok('A game played through the screen against 3 computer players reaches the end',await P.evaluate(()=>S.tgg&&S.tgg.phase==='done'),{moves,st:await P.evaluate(()=>S.tgg&&{ph:S.tgg.phase,td:S.tgg.td.length,msg:S.tgg.msg})});
  ok('…and the gold matches the score sheet',await P.evaluate(()=>act().every(p=>total(p)===tgGold(S.tgg,p.id))));
  await P.screenshot({path:'/tmp/tg-end.png',fullPage:true});
  await P.evaluate(()=>{const b=document.querySelector('[data-a="finish"]');if(b)b.click()});await W(800);
  ok('Finish leads to the reveal or results',await P.evaluate(()=>['reveal','results'].includes(S.screen)),await P.evaluate(()=>S.screen));
  // computer-only games
  for(const [n,X] of [[2,{size:'s'}],[3,{xp:1}],[4,{size:'l',show:1}],[3,{vol:1}],[4,{vol:1,xp:1}]]){
    await P.evaluate(([n,X])=>{S=tgFresh();S.tgx=Object.assign({...TGDEF},{play:1},X);S.players.forEach((p,i)=>{p.on=i<n;p.name='P'+i;p.bot=i<n?['easy','normal','hard'][i%3]:null});S.screen='score';S.started=true;save();render()},[n,X]);
    let fin=false;for(let i=0;i<300&&!fin;i++){await W(400);fin=await P.evaluate(()=>!!S.tgg&&S.tgg.phase==='done')}
    ok(`${n} computer players${X.vol?' with Volcano':''}: the game ends`,fin,await P.evaluate(()=>S.tgg&&{ph:S.tgg.phase,td:S.tgg.td.length,msg:S.tgg.msg}))}
  // score sheet for the real game
  await P.evaluate(()=>{switchGame('tobago');resetScores();S.tgx.play=0;S.players.forEach((p,i)=>{p.on=i<3;p.name=['A','B','C'][i];p.bot=null});S.started=true;S.screen='score';render()});await W(300);
  await P.evaluate(()=>{const i=document.querySelector('[data-tgf="0:gold"]');i.value='27';i.dispatchEvent(new Event('input',{bubbles:true}))});await W(200);
  ok('Score sheet: 27 gold',await P.evaluate(()=>tgTot(act()[0])===27&&document.querySelector('[data-tgp="'+act()[0].id+'"]').textContent==='27'));
  await P.close();
  // two linked phones and a computer player
  const H=await mk(browser,'host'),G=await mk(browser,'guest');[H,G].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
  const ids=await H.evaluate(()=>{window.__htfast=1;switchGame('tobago');resetScores();Object.assign(TGX(),{play:1,size:'s',xp:0,show:0});const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Kim','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await G.evaluate(()=>{window.__htfast=1});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2500);
  await readyAll([H,G]);
  ok('Linked: host dealt the island',await H.evaluate(()=>!!S.tgg&&S.tgg.ps.length===3));
  ok('Linked: guest sees the same island',await G.evaluate(()=>!!S.tgg&&S.tgg.ps.length===3)&&await H.evaluate(()=>JSON.stringify(S.tgg.b.c))===await G.evaluate(()=>JSON.stringify(S.tgg.b.c)));
  ok('Linked: each phone shows only its own clue cards',await G.evaluate(()=>{const V=tgViewer();return !!V&&V.id===S.lk.me&&document.querySelectorAll('.tghand.mine [data-a="tgphand"]').length===S.tgg.me[V.id].h.length}));
  const step=async Q=>{const st=await Q.evaluate(()=>{const g=S.tgg;if(!g||!S.lk)return null;const V=tgViewer();if(!V)return null;return {mine:tgActor(g)===V.id,ph:g.phase,dist:!!g.dist,ask:!!g.ask,act:g.t&&g.t.act,mv:!!(g.t&&g.t.mv),wait:lkqWaiting()}});
    if(!st||!st.mine||st.wait||st.ph==='done')return false;
    const tp=sel=>Q.evaluate(sel=>{const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(b){b.click();return true}return false},sel);
    const cl=sel=>Q.evaluate(sel=>{const L=[...document.querySelectorAll(sel)];if(!L.length)return false;L[Math.floor(Math.random()*L.length)].dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},sel);
    if(st.ph==='place')return cl('polygon.go[data-a="tgpcell"]');
    if(st.dist)return tp('[data-a="tgptake"][data-k="1"]');if(st.ask)return tp('[data-a="tgpnew"]');if(await tp('[data-a="tgpraise"]'))return true;
    if(st.mv){const toward=await Q.evaluate(()=>{const g=S.tgg,me=tgViewer().id,f=g.maps.map(M=>M.cand&&M.cand.length===1?M.cand[0]:null).filter(x=>x!=null);if(!f.length)return null;const L=tgLegs(g,g.pos[me]),goal=f.sort((a,b)=>L[a]-L[b])[0];return tgB(g).leg[g.pos[me]].find(c=>tgLegs(g,c)[goal]===L[goal]-1)});
      if(toward==null)return tp('[data-a="tgpstop"]');return Q.evaluate(i=>{document.querySelector(`polygon[data-a="tgpcell"][data-k="${i}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true},toward)}
    if(!st.act){if(await Q.evaluate(()=>S.tgg.maps.some(M=>M.cand&&M.cand.length===1))&&await tp('[data-a="tgpdrive"]'))return true;
      const n=await Q.evaluate(()=>document.querySelectorAll('[data-a="tgphand"]').length);for(let h=0;h<n;h++){await Q.evaluate(h=>document.querySelectorAll('[data-a="tgphand"]')[h].click(),h);await W(30);if(await tp('[data-a="tgpclue"]'))return true;await Q.evaluate(h=>{const b=document.querySelectorAll('[data-a="tgphand"]')[h];if(b&&b.classList.contains('sel'))b.click()},h)}
      if(await tp('[data-a="tgpdrive"]'))return true;return tp('[data-a="tgpswap"][data-k="0"]')}
    await tp('[data-a="tgpend"]');return tp('[data-a="tgpend"]')};
  let hm=0,gm=0,lastK='',same=0;for(let t=0;t<(process.env.FULL?9000:2500);t++){if(await step(H))hm++;if(await step(G))gm++;await W(60);
    if(t%50===0){const k=await H.evaluate(()=>JSON.stringify([S.tgg.phase,tgActor(S.tgg),S.tgg.n]));same=k===lastK?same+1:0;lastK=k;if(same>=5){console.log('DBG stuck',k,await G.evaluate(()=>JSON.stringify([S.tgg.n,lkqWaiting(),S.tgg.msg])));break}}
    if(await H.evaluate(full=>S.tgg&&(S.tgg.phase==='done'||!full&&S.tgg.td.length<=25),!!process.env.FULL))break}
  await W(3000);
  const hs=await H.evaluate(()=>({ph:S.tgg.phase,n:S.tgg.n,td:S.tgg.td.length,me:S.tgg.me})),gs=await G.evaluate(()=>({ph:S.tgg.phase,n:S.tgg.n,td:S.tgg.td.length,me:S.tgg.me}));
  ok('Linked: both phones moved',hm>5&&gm>5,{hm,gm});
  ok(process.env.FULL?'Linked: the game reaches the end':'Linked: treasures raised and shared',process.env.FULL?hs.ph==='done':hs.td<=25,{ph:hs.ph,td:hs.td});
  ok('Linked: both phones agree on hands, amulets and treasure',JSON.stringify(hs)===JSON.stringify(gs));
  await G.screenshot({path:'/tmp/tg-guest.png',fullPage:true});
  ok('No page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
