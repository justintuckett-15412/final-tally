// Linked-phone test harness: each "phone" is its own browser context; all share one in-memory store shaped like
// the part of Firestore the app uses. Other phones' changes arrive after LAT..LAT+JIT ms; a phone's own changes
// arrive at once and in order (like Firestore's latency compensation).
const BASE=process.env.BASE||'http://localhost:8765/';
const {chromium}=require('playwright');
const LAT=+(process.env.LAT||400), JIT=+(process.env.JIT||600);
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const pages={};
const later=(f,s,own)=>{const t=Math.max(Date.now()+(own?5:LAT+Math.random()*JIT),(s&&s.last)||0);if(s)s.last=t;setTimeout(f,t-Date.now())};
function Store(){
  const docs=new Map(),subs=new Set(),K=p=>p.join('/'),par=k=>k.slice(0,k.lastIndexOf('/')),idOf=k=>k.slice(k.lastIndexOf('/')+1);
  const all=col=>[...docs].filter(([k])=>par(k)===col).map(([k,d])=>({id:idOf(k),data:clone(d)}));
  function notify(k,origin){const d=docs.get(k),col=par(k);
    subs.forEach(s=>{if(s.doc===k){const v=clone(d)??null;later(()=>s.cb(v,false),s,origin===s.client)}
      else if(s.col===col){const a=[{id:idOf(k),data:d?clone(d):null,removed:!d,local:origin===s.client}],b=all(col);later(()=>s.cb(a,false,b,false),s,origin===s.client)}})}
  function setPath(o,segs,v){let t=o;for(let i=0;i<segs.length-1;i++){if(!t[segs[i]]||typeof t[segs[i]]!=='object')t[segs[i]]={};t=t[segs[i]]}
    if(v===null)delete t[segs[segs.length-1]];else t[segs[segs.length-1]]=clone(v)}
  return {get:p=>clone(docs.get(K(p)))??null,
    set(p,d,o){docs.set(K(p),clone(d));notify(K(p),o)},
    update(p,d,o){const k=K(p);docs.set(k,{...docs.get(k),...clone(d)});notify(k,o)},
    updatePaths(p,ops,o){const k=K(p);const x=docs.get(k);ops.forEach(([s,v])=>setPath(x,s,v));notify(k,o)},
    del(p,o){const k=K(p);if(docs.delete(k))notify(k,o)},
    list:p=>all(K(p)),
    watchDoc(p,cb,c){const s={doc:K(p),cb,client:c};subs.add(s);const v=clone(docs.get(s.doc))??null;later(()=>cb(v,false),s);return()=>subs.delete(s)},
    watch(p,cb,c){const s={col:K(p),cb,client:c};subs.add(s);const a=all(s.col);later(()=>cb(a.map(x=>({id:x.id,data:x.data,removed:false,local:false})),true,a,false),s);return()=>subs.delete(s)}}}
const st=Store();
const INIT=`(()=>{let n=0;window.__fbcb={};const call=(op,a)=>window.__fbop(op,JSON.stringify(a)).then(r=>r==null?null:JSON.parse(r));
 window.__fakefb={ready:async()=>window.__dev,when:ms=>ms,get:p=>call('get',[p]),set:(p,d)=>call('set',[p,d]),update:(p,d)=>call('update',[p,d]),updatePaths:(p,o)=>call('updatePaths',[p,o]),del:p=>call('del',[p]),list:p=>call('list',[p]),
  watchDoc:(p,cb)=>{const s=++n;__fbcb[s]=cb;call('watchDoc',[p,s]);return()=>{delete __fbcb[s];call('unwatch',[s])}},
  watch:(p,cb)=>{const s=++n;__fbcb[s]=cb;call('watch',[p,s]);return()=>{delete __fbcb[s];call('unwatch',[s])}}}})()`;
const unw={};
async function mk(browser,name){const ctx=await browser.newContext({viewport:{width:400,height:850}});const page=await ctx.newPage();pages[name]=page;
  page.on('pageerror',e=>console.log(name,'ERR',e.message));
  page.on('console',m=>{if(process.env.VERBOSE&&(m.type()==='error'||m.type()==='warning'))console.log(name,'console',m.text().slice(0,200))});
  await page.exposeFunction('__fbop',async(op,aj)=>{const a=JSON.parse(aj);
    const push=(s,args)=>page.evaluate(([s,args])=>{const f=window.__fbcb[s];if(f)f(...args)},[s,args]).catch(()=>{});
    if(op==='watchDoc'){unw[name+a[1]]=st.watchDoc(a[0],(...x)=>push(a[1],x),name);return null}
    if(op==='watch'){unw[name+a[1]]=st.watch(a[0],(...x)=>push(a[1],x),name);return null}
    if(op==='unwatch'){const u=unw[name+a[0]];if(u)u();return null}
    await new Promise(r=>setTimeout(r,LAT/2));
    const r=st[op](...a,name);return r===undefined?null:JSON.stringify(r)});
  await page.addInitScript(`window.__dev='${name}';`+INIT);
  await page.goto(BASE);await page.waitForTimeout(1500);
  await page.evaluate(async()=>{const m=await import('./sync.js');window.FTLINK=window.FTLINK_NET=m.makeLink(window.__fakefb);render()});
  return page}
const W=ms=>new Promise(r=>setTimeout(r,ms));
const click=(page,a,k)=>page.evaluate(([a,k])=>{const sel=k!=null?`[data-a="${a}"][data-k="${k}"]`:`[data-a="${a}"]`;const b=[...document.querySelectorAll(sel)].find(b=>!b.disabled);if(!b)return false;b.click();return true},[a,k]);
const act=(page,a,k)=>page.evaluate(([a,k])=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()},[a,k]);
let FAILS=0;const ok=(n,c,x)=>{if(!c)FAILS++;console.log((c?'PASS ':'FAIL ')+n+(x!==undefined&&!c?' '+JSON.stringify(x):''))};
const done=async b=>{await b.close();process.exit(FAILS?1:0)};
/* linked games start each round with a Ready card: tap it on every phone and wait until it's gone */
const readyAll=async ps=>{for(let t=0;t<40;t++){let open=false;for(const p of ps){const c=await p.evaluate(()=>{const b=document.querySelector('[data-a=glready]');if(b){b.click();return 1}return document.querySelector('.glrdy')?2:0}).catch(()=>0);if(c)open=true}if(!open)return true;await W(300)}return false};
module.exports={mk,st,pages,chromium,W,click,act,ok,done,BASE,readyAll};
