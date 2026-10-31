// Linked Quacks shop: an exploded guest picks coins, then buys a blue and a green chip; both stay bought.
// and the host's answer agrees. Chance moves (drawing a chip) still wait for the host.
const {mk,W,ok,done,chromium}=require('./link.js');
const btns=p=>p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a+(b.dataset.k?':'+b.dataset.k:'')))]);
const tap=(p,a,k)=>p.evaluate(([a,k])=>{const b=[...document.querySelectorAll(k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`)].find(b=>!b.disabled&&b.offsetParent);if(b){b.click();return true}return false},[a,k]);
const until=async(p,fn,ms=8000,arg=null)=>{const t=Date.now();while(Date.now()-t<ms){if(await p.evaluate(fn,arg))return Date.now()-t;await W(20)}return -1};
(async()=>{const browser=await chromium.launch();const H=await mk(browser,'host'),G=await mk(browser,'guest');
  const ids=await H.evaluate(()=>{switchGame('quacks');resetScores();const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Justin','Brad','Bot'][i]||'';if(i===2)p.bot='normal';else delete p.bot});QKX().play=1;QKX().herb=true;save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return [P[0].id,P[1].id]});
  await H.evaluate(()=>lkHostStart());await W(3000);const code=await H.evaluate(()=>S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(4000);await G.evaluate(id=>lkPick(id),ids[1]);await W(2000);
  // jump straight to the shop: everyone has stopped and seen their scoring cards
  await H.evaluate(()=>{const g=S.qpg;g.ps.forEach(id=>{const L=g.pl[id];L.sf=true;L.stop=true;L.sr=true;L.sq=true;L.ask=null});g.phase='eval';g.brewAnn=null;g.ann=null;save();render()});await W(3000);
  await H.evaluate(id=>{const p=act().find(q=>q.id===id),R=p.qk[S.qpg.r],L=S.qpg.pl[id];L.ex=true;R.ex=true;R.ch=null;L.buy=[];if(R.s==null)R.s=5;const sp=QKPOT[R.s][0];R.ca=12-sp;save()},ids[1]);await W(2500);
  await tap(G,'qpch','coins');await W(1200);
  await tap(G,'qpbuy','u1');await W(1500);await tap(G,'qpbuy','g1');
  const trace=[];for(let t=0;t<25;t++){await W(200);trace.push(await G.evaluate(id=>{const o=lkOptState()||S;return o.qpg.pl[id].buy.join(',')},ids[1]))}
  const hb=await H.evaluate(id=>S.qpg.pl[id].buy.join(','),ids[1]);
  ok('both chips stay bought',hb.split(',').length===2&&trace.slice(-1)[0]===hb,{hb});
  ok('guest phone has no Adjust section',await G.evaluate(()=>!document.querySelector('.qpadj')));
  ok('host phone has the Adjust section',await H.evaluate(()=>!!document.querySelector('.qpadj')));
  ok('a guest adjust is refused by the host',await H.evaluate(id=>{const R=qkR(act().find(q=>q.id===id),S.qpg.r),b=+R.rb||0;const r=qpChoose(S.qpg,id,{t:'adj',v:'ruby'});return !r&&(+R.rb||0)===b},ids[1]));
  await done(browser)})();
