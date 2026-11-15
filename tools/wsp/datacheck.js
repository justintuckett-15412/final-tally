// node datacheck.js — checks data.js against birds.csv (Base rows)
const fs=require('fs');const src=fs.readFileSync(__dirname+'/data.js','utf8');const {WSB,WSBON,WSGOAL}=new Function(src+';return {WSB,WSBON,WSGOAL}')();
const rows=fs.readFileSync(__dirname+'/birds.csv','utf8').trim().split('\n').slice(1).map(l=>{const o=[];let c='',q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===','&&!q){o.push(c);c=''}else c+=ch}o.push(c);return o}).filter(r=>r[1]==='Base');
const KINDS=['feeder','feederAll','supply','allSupply','eachDie','cache','huntDice','huntCard','tuck','discardFoodTuck','eggForFood','eggForCards','draw','drawDiscard','allDraw','fewestDraw','fewestDie','layAny','layThis','layNest','allLayNest','moveRight','repeatBrown','repeatPredator','trade','bonus','playAnother','trayAll','oyster','onLayEgg','onPlayHab','onPredator','onGainFood'];
let bad=[];const ok=(c,m)=>{if(!c)bad.push(m)};
ok(WSB.length===rows.length&&rows.length===180,'bird count '+WSB.length+'/'+rows.length);
const by={};WSB.forEach(b=>{ok(!by[b.n],'duplicate '+b.n);by[b.n]=b});
rows.forEach(r=>{const b=by[r[0]];if(!b){bad.push('missing '+r[0]);return}
  const tot=Object.values(b.cost).reduce((a,x)=>a+x,0)+b.wild,exp=+r[5];ok(b.or?(Object.keys(b.cost).length+(b.wild?1:0)>=2&&exp===1):tot===exp,'cost '+b.n+' '+JSON.stringify(b.cost)+' wild '+b.wild+' or '+b.or+' vs '+exp);
  ok(b.pts===+r[2]&&b.egg===+r[7]&&b.ws===+r[8],'numbers '+b.n);ok(/^f?g?w?$/.test(b.hab)&&b.hab.length>0,'hab '+b.n);
  ok(['bowl','cavity','ground','platform','star','none'].includes(b.nest),'nest '+b.n);ok(b.col===r[9].toLowerCase(),'colour '+b.n);
  ok(!!b.pw===!!r[10],'power present '+b.n);if(b.pw){ok(KINDS.includes(b.pw.k),'kind '+b.n+' '+b.pw.k);ok(b.say&&b.say.length<=70&&b.say!==r[10],'say '+b.n)}
  const k=b.pw&&b.pw.k;ok(b.pred===(k==='huntDice'||k==='huntCard'?1:0),'pred '+b.n);ok(b.flock===(k==='tuck'||k==='discardFoodTuck'||k==='onPlayHab'&&b.pw.tuck?1:0),'flock '+b.n);
  ok(Array.isArray(b.tags),'tags '+b.n)});
ok(WSBON.length===26,'26 bonus cards');ok(WSGOAL.length===16&&new Set(WSGOAL.map(g=>g.tile)).size===8,'16 goal faces on 8 tiles');
WSBON.forEach(x=>ok(x.score&&(x.score.per||x.score.tiers)&&x.test,'bonus '+x.id));
if(bad.length){console.log('FAIL',bad.length);bad.slice(0,20).forEach(x=>console.log(' ',x));process.exit(1)}console.log('OK',WSB.length,'birds,',WSBON.length,'bonus cards,',WSGOAL.length,'goal faces')
