// Shared sync: an older copy of the game arriving late must never undo a newer change.
// Two linked phones change different parts of the shared game quickly at the same time, with slow, uneven delivery.
// Each phone watches every value it sees: a counter going backwards means an older copy overwrote a newer one.
const {mk,W,ok,done,chromium}=require('./link.js');
const SECS=+(process.env.SECS||14);
(async()=>{const browser=await chromium.launch();
  const H=await mk(browser,'host'),G=await mk(browser,'guest'),X=await mk(browser,'third');
  const ids=await H.evaluate(()=>{SET.toursOff=true;const P=S.players;P.forEach((p,i)=>{p.on=i<3;p.name=['Ann','Bob','Cy'][i]||''});save();
    const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return P.slice(0,3).map(p=>p.id)});
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);
  await H.evaluate(id=>lkPick(id),ids[0]);await W(500);
  for(const [p,id] of [[G,ids[1]],[X,ids[2]]]){await p.evaluate(c=>{SET.toursOff=true;lkJoin(c)},code);await W(2500);await p.evaluate(id=>lkPick(id),id);await W(800)}
  await W(1500);
  const linked=await Promise.all([H,G,X].map(p=>p.evaluate(()=>!!(S.lk&&S.lk.me))));
  ok('three phones linked',linked.every(Boolean),linked);
  /* every phone: bump its own counter on a timer, and record any counter that ever goes down */
  const arm=(p,key,ms)=>p.evaluate(([key,ms])=>{window.__back=[];window.__seen={};
    const watch=()=>{for(const k of ['zzh','zzg','zzx']){const v=S[k]||0;if(v<(window.__seen[k]||0))window.__back.push(k+':'+window.__seen[k]+'->'+v);window.__seen[k]=Math.max(window.__seen[k]||0,v)}};
    const R=window.lkRecv;window.lkRecv=function(u){R(u);watch()};
    window.__iv=setInterval(()=>{S[key]=(S[key]||0)+1;save();watch()},ms)},[key,ms]);
  await arm(H,'zzh',190);
  /* the host also keeps filling and emptying a list (like 'who's done this page'): an emptied list must reach every phone and the database */
  await H.evaluate(()=>{let n=0;window.__iv2=setInterval(()=>{n++;S.zzo=n%3===0?{}:{...(S.zzo||{}),['p'+n]:1};save()},140)});await arm(G,'zzg',230);await arm(X,'zzx',270);
  await W(SECS*1000);
  await Promise.all([H,G,X].map(p=>p.evaluate(()=>clearInterval(window.__iv))));await H.evaluate(()=>{clearInterval(window.__iv2);S.zzo={};save()});
  await W(6000);
  const r=await Promise.all([H,G,X].map(p=>p.evaluate(()=>({back:window.__back,v:[S.zzh||0,S.zzg||0,S.zzx||0]}))));
  r.forEach((x,i)=>ok(['host','guest','third'][i]+': no change ever went backwards',!x.back.length,x.back.slice(0,8)));
  const zo=await Promise.all([H,G,X].map(p=>p.evaluate(()=>JSON.stringify(S.zzo))));const {st}=require('./link.js');const doc=[...st.__docs()].find(([k,d])=>d&&d.m&&d.m.zzo!==undefined);
  ok('an emptied list reaches every phone and the database',zo.every(v=>v==='{}')&&doc&&JSON.stringify(doc[1].m.zzo)==='"{}"',{zo,db:doc&&doc[1].m.zzo});
  ok('all phones end with the same values',r.every(x=>JSON.stringify(x.v)===JSON.stringify(r[0].v)),r.map(x=>x.v));
  ok('each phone’s own counter kept every bump',r[0].v[0]>=SECS*4&&r[0].v[1]>=SECS*3&&r[0].v[2]>=SECS*3,r[0].v);
  await done(browser)})();
