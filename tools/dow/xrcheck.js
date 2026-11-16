const fs=require('fs');global.gLog=()=>{};
eval(fs.readFileSync(__dirname+'/data.js','utf8')+fs.readFileSync(__dirname+'/xr.js','utf8')+';global.X={DWXR,dwXrCheck,DWXRSTEP,dwXrSid}');
const KNOWN=new Set('morale food foodSet helpless helplessPer killHelpless wound frost kill exposure zombies noise item fetch purge revealTake takeSurv removeSurv removeSurvDeck survivor survivorEach place noMove freeze barricades clearZ clearBar killZ killEach rollTable rollEach removedToHand removedToWaste wasteCard loseRandomCard loseCard giveHand giveFollower allDiceUsed loseDie loseDieEach extraDie cancelFood collective pay peek exileVote addWin skipCrisis flag heal custom'.split(' '));
const CUSTOM=new Set('dropHelpless santa muggingFight outbreakRoll jail prophet bevGuard sewer thomasWounds rodHospital gamble dynamite voyeurTake'.split(' '));
const EV=new Set(['any','turnStart','move','search','heal','weapon','spendFood','cleanWaste','outsider','frostbite','wound','yawn']);
let bad=[],used={},cust={};
const walk=(ops,no)=>(ops||[]).forEach(a=>{if(!KNOWN.has(a[0]))bad.push(no+': op '+a[0]);used[a[0]]=(used[a[0]]||0)+1;if(a[0]==='custom'){if(!CUSTOM.has(a[1]))bad.push(no+': custom '+a[1]);cust[a[1]]=1}
  if(a[0]==='rollTable')a[1].forEach(r=>walk(r[2],no));if(a[0]==='rollEach')walk(a[3],no);if(a[0]==='exposure')walk(a[3],no);if(a[0]==='collective'){walk(a[3],no);walk(a[4],no)}if(a[0]==='pay')walk(a[2],no);
  ['named:','lowestNot:'].forEach(p=>a.forEach(x=>{if(typeof x==='string'&&x.startsWith(p)&&X.dwXrSid(x.slice(p.length))<0)bad.push(no+': unknown survivor '+x)}))});
const nos=new Set();X.DWXR.forEach(c=>{nos.add(c.no);if(!c.trig||!EV.has(c.trig.ev))bad.push(c.no+': trig');if(!c.say||c.say.split(' ').length>22)bad.push(c.no+': say');if(!c.opts||!c.opts.length)bad.push(c.no+': opts');
  c.opts.forEach(o=>{if(!o.say)bad.push(c.no+': opt say');walk(o.ops,c.no)});walk(c.pre,c.no);if(c.vote&&c.opts.length<2)bad.push(c.no+': vote needs 2');
  ['controls','inDeck','named','namedNotExiled'].forEach(k=>{if(c.trig[k]&&X.dwXrSid(c.trig[k])<0)bad.push(c.no+': '+k)});[].concat(c.trig.inPlay||[]).forEach(n=>{if(X.dwXrSid(n)<0)bad.push(c.no+': inPlay '+n)})});
for(let i=1;i<=80;i++)if(!nos.has(i))bad.push('missing '+i);
// a small live check: a fake state
const g={phase:'play',ps:['a','b'],P:{a:{exiled:false},b:{xr:7}},sv:{},loc:{colony:{ent:[{z:1,bar:1}]},school:{z:0}},helpless:0,decks:{surv:[]}};
g.sv[X.dwXrSid('Sparky')]={pid:'a',loc:'colony'};
const hit=X.dwXrCheck(g,'a','turnStart',{});if(!hit||hit.no!==7||hit.drawer!=='b')bad.push('live check Sparky failed '+JSON.stringify(hit));
g.P.b.xr=1;if(X.dwXrCheck(g,'a','move',{s:1,fuel:false}))bad.push('car crash fired without fuel');if(!X.dwXrCheck(g,'a','move',{s:1,fuel:true}))bad.push('car crash did not fire with fuel');
g.P.b.xr=14;const g2=JSON.parse(JSON.stringify(g));const h2=X.dwXrCheck(g2,'a','action',{});g2.q=[{t:'xr',pid:'a',no:14,drawer:'b',ctx:h2&&h2.ctx}];X.DWXRSTEP(g2,g2.q[0]);if(!g2.vote||g2.vote.need.join()!=='a')bad.push('vote setup '+JSON.stringify(g2.vote));
console.log('cards',X.DWXR.length,'votes',X.DWXR.filter(c=>c.vote).length,'ops used',Object.keys(used).length,'customs',Object.keys(cust).length);console.log(bad.length?'PROBLEMS:\n'+bad.join('\n'):'ALL OK');
