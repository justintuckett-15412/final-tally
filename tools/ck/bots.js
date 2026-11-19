/* ================= Cover Your Kingdom: computer players =================
   ckBot(g,pid) -> a legal move for whatever this Ruler is asked now (their turn, a challenge answer, a land to place, a Hypnogriff return, an Inn hire).
   Greedy and honest: it looks only at its own hand and the table, never at other hands. Always returns a legal move when one exists. */
/* how much a card in hand is worth keeping */
function ckKeep(g,pid,id){const s=ckS(g,id),H=g.hand[pid];if(s.kind==='hire')return 12;if(s.id==='sp')return 30;if(s.id==='ct')return 15;
  return ckVal(g,pid,id)+(H.filter(c=>g.cs[c]===s.id).length>=2?12:0)+(ckLands(g).some(l=>{const T=ckTop(g,pid,l);return T&&T.sp===s.id})?6:0)}
const ckTopVal=(g,p,l)=>{const T=ckTop(g,p,l);return T?ckClanVal(g,p,T):0};
function ckBotScore(g,pid,m){const H=g.hand[pid],kv=c=>ckKeep(g,pid,c);
  switch(m.a){
  case 'next':return 0;
  case 'place':return ckTopVal(g,pid,m.land)+1;
  case 'hyret':return -m.cards.reduce((a,c)=>a+kv(c),0);
  case 'pass':return 0;
  case 'counter':{const ch=g.ch;let stake;if(ch.k==='elv'){const T=ckTop(g,ch.tg,ch.land);stake=T?ckClanVal(g,ch.tg,T):0;return stake-m.cards.reduce((a,c)=>a+kv(c),0)}
    const T=ch.k==='rec'?ckTop(g,ch.tg,ch.land):null;stake=(T?ckClanVal(g,ch.tg,T):ch.inn.reduce((a,c)=>a+ckVal(g,pid,c),0))+ch.plays.reduce((a,x)=>a+x.c.reduce((b,c)=>b+ckVal(g,pid,c),0),0);
    return stake-0.5*m.cards.reduce((a,c)=>a+kv(c),0)}
  case 'fx':{const r=g.ps.find(p=>p!==pid);if(g.fx.k==='wz'){const S=g.k[r][m.land];const nt=m.dir==='down'?S[S.length-2]:S[0];return -(nt?ckClanVal(g,r,nt):0)+(m.dir==='down'?ckTopVal(g,r,m.land):0)}
    return ckTopVal(g,r,m.land)}
  case 'settle':{const cards=m.cards.concat(m.disc?[g.disc[g.disc.length-1]]:[]);let s=cards.reduce((a,c)=>a+ckVal(g,pid,c),0)+0.4*ckTopVal(g,pid,m.land)+(m.free?6:0)+(m.disc?4:0);
    if(m.cards.some(c=>g.cs[c]==='sp'))s-=18;if(m.cards.some(c=>g.cs[c]==='ct'))s-=6;return s}
  case 'recruit':{const T=ckTop(g,m.t,m.land),v=ckClanVal(g,m.t,T);let st=0;H.forEach(c=>{if(ckMatch(g,pid,c,T.sp))st+=ckCount(g,pid,m.t,c)});
    if(st<2)return -5;return v*Math.min(1,st/3)-0.3*kv(m.card)}
  case 'add':return 0.6*ckVal(g,pid,m.card)+(m.to&&m.to!==m.land?0.3*ckTopVal(g,pid,m.to):0);
  case 'discard':return 1.5-0.1*kv(m.card);
  case 'inn':{const tops=m.take.map(i=>g.inn[i][g.inn[i].length-1]);return 0.9*tops.reduce((a,c)=>a+ckVal(g,pid,c),0)+0.5*ckVal(g,pid,m.card)-0.3*kv(m.card)}
  case 'hire':{const h=m.as||g.cs[m.card];
    if(h==='el')return m.t===pid?-100:ckTopVal(g,m.t,m.land)-12;
    if(h==='mb')return ckTopVal(g,m.t,m.land)-ckTopVal(g,pid,m.mine)-6;
    if(h==='mt')return m.t===pid?0.3*ckTopVal(g,pid,m.land)-4:-2;
    if(h==='hy')return g.hand[m.t].length>=3?2:-3;
    if(h==='wz'){if(m.t===pid){const S=g.k[pid][m.land];return m.dir==='down'?ckClanVal(g,pid,S[S.length-1])-ckClanVal(g,pid,S[S.length-2])-8:-20}return -4}
    return -10}
  case 'wkid':{const S=g.k[pid][m.land];return ckClanVal(g,pid,S[S.length-1])-ckClanVal(g,pid,S[S.length-2])-5}
  case 'end':{let s=g.acts>=1?3:-50;(m.dh||[]).forEach(c=>{s+=kv(c)<8?1:-3});return s}}
  return -1}
function ckBot(g,pid){const L=ckLegal(g,pid);if(!L.length)return null;let best=L[0],bs=-Infinity;
  L.forEach(m=>{const s=ckBotScore(g,pid,m)+Math.random()*0.5;if(s>bs){bs=s;best=m}});return best}
