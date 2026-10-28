/* Final Tally family sync (installed app only).
   Every device with the same family code shares:
   - "kv": the app's saved state (games in progress, usual rules, last-used settings), one doc per storage key
   - "hist": finished games, players, game nights and the group name
   The storage layer (Firebase, or a test double) is passed in as `fb`. */
export function startSync(fb){
  const LS=localStorage,RAW=window.__ftRaw||{set:(k,v)=>LS.setItem(k,v),remove:k=>LS.removeItem(k)};
  const FK='ft.family',MK='ft.syncmeta',DK='ft.dirty',JK='ft.joining';
  const ok=k=>k==='finaltally.v1'||(k.startsWith('finaltally.v1.')&&!/\.(tmp|real|homecat|lastbk|linked|lkon)$/.test(k));
  const rj=(k,d)=>{try{return JSON.parse(LS.getItem(k))??d}catch(e){return d}};
  let fid=LS.getItem(FK)||'',meta=rj(MK,{}),hiT=Math.max(0,...Object.values(meta).map(Number).filter(Boolean));
  let seenKV=false,state='off',err='',lastSync=0,unsubs=[],inflight=0,timer=null,histReady=false;
  const saveMeta=()=>RAW.set(MK,JSON.stringify(meta));
  const ping=()=>{try{window.ftPing&&window.ftPing()}catch(e){}};
  const ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const newCode=()=>{const a=new Uint32Array(12);crypto.getRandomValues(a);return [...a].map(n=>ALPHA[n%ALPHA.length]).join('')};
  const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const withTimeout=(p,ms,msg)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error(msg)),ms))]);
  const isGame=v=>{try{const o=JSON.parse(v);return o&&o.players?o:null}catch(e){return null}};
  const live=o=>o&&o.started&&!o.finished;

  /* ---- pushing this device's changes ---- */
  function flush(){timer=null;if(!fid||!seenKV||LS.getItem(JK)==='1')return;const d=rj(DK,{});const keys=Object.keys(d);if(!keys.length)return;
    keys.forEach(k=>{if(!ok(k))return;const t=Math.max(+d[k]||Date.now(),hiT+1);hiT=t;meta[k]=t;const v=LS.getItem(k);
      inflight++;fb.set(['families',fid,'kv',k],{v,t,by:dev()}).then(()=>{lastSync=Date.now();err=''},e=>{err=msgOf(e)}).finally(()=>{inflight--;ping()})});
    RAW.remove(DK);saveMeta();ping()}
  window.ftDirty=()=>{if(fid&&!timer)timer=setTimeout(flush,700)};
  const dev=()=>{let d=LS.getItem('ft.dev');if(!d){d=Math.random().toString(36).slice(2,10);RAW.set('ft.dev',d)}return d};
  function markAll(){const d=rj(DK,{}),t=Date.now();for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&ok(k))d[k]=d[k]||t}RAW.set(DK,JSON.stringify(d))}

  /* ---- taking other devices' changes ---- */
  function onKV(changes,fromCache){const joining=LS.getItem(JK)==='1';if(joining&&fromCache)return;const dirty=rj(DK,{}),changed=[],seen=new Set();
    changes.forEach(({id:k,data:x,local})=>{seen.add(k);if(local||!x||!ok(k))return;const t=+x.t||0;hiT=Math.max(hiT,t);
      if(x.by===dev()&&(meta[k]||0)>=t)return;
      if(!joining&&(meta[k]||0)>=t)return;
      /* changed here and on another device since we last synced: for games keep the one played most recently */
      if(!joining&&dirty[k]){const mine=isGame(LS.getItem(k)),theirs=isGame(x.v);
        if(mine&&theirs&&(mine.touched||0)>(theirs.touched||0)){meta[k]=t;return}}
      if(joining){const mine=isGame(LS.getItem(k)),theirs=isGame(x.v);
        if(live(mine)&&!(live(theirs)&&(theirs.touched||0)>=(mine.touched||0))){dirty[k]=Date.now();return}}
      if(x.v===null||x.v===undefined)RAW.remove(k);else RAW.set(k,x.v);meta[k]=t;delete dirty[k];changed.push(k)});
    if(joining){for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&ok(k)&&!seen.has(k))dirty[k]=dirty[k]||Date.now()}RAW.remove(JK)}
    seenKV=true;RAW.set(DK,JSON.stringify(dirty));saveMeta();state='on';lastSync=Date.now();err='';
    if(changed.length)try{window.ftRemote&&window.ftRemote(changed)}catch(e){}
    if(Object.keys(dirty).length)window.ftDirty();ping()}

  /* ---- history: the app's own code talks to this through a small db shim ---- */
  const hist=id=>['families',fid,'hist',id];
  const shim={collection:()=>({doc:id=>({set:data=>fb.set(hist(id),{j:JSON.stringify(data)}),delete:()=>fb.del(hist(id))}),
    get:async()=>({docs:(await fb.list(['families',fid,'hist'])).map(d=>({id:d.id,data:()=>{try{return JSON.parse(d.data.j)}catch(e){return null}}}))})})};
  async function attachHist(){histReady=false;if(!window.FTHIST)return;await window.FTHIST.attach(shim,fid,'family');histReady=true;
    unsubs.push(fb.watch(['families',fid,'hist'],(changes,first,all,fromCache)=>{if(!histReady||first||!changes.length||changes.every(c=>c.local))return;
      window.FTHIST.replace(all.map(d=>({id:d.id,data:()=>{try{return JSON.parse(d.data.j)}catch(e){return null}}})))},e=>{err=msgOf(e);ping()}))}

  async function connect(){state='connecting';ping();
    try{await withTimeout(fb.ready(),20000,'Couldn’t connect. Check your internet connection.')}catch(e){state='err';err=msgOf(e);ping();return}
    unsubs.push(fb.watch(['families',fid,'kv'],(ch,first,all,fromCache)=>onKV(ch,fromCache),e=>{state='err';err=msgOf(e);ping()}));
    attachHist().catch(e=>{err=msgOf(e);ping()});
    window.ftDirty()}
  function disconnect(){unsubs.forEach(u=>{try{u()}catch(e){}});unsubs=[];histReady=false;seenKV=false}
  const msgOf=e=>{const c=e&&e.code||'';return c.includes('permission')?'This device isn’t allowed to sync. Check the family code or the database rules.':c.includes('unavailable')?'Offline. Changes will sync when you’re back online.':(e&&e.message)||'Sync hit a problem.'};

  window.FTSYNC={
    status(){const ago=lastSync?Math.round((Date.now()-lastSync)/1000):null;
      const text=!fid?'':!navigator.onLine?'Offline. Changes are kept and sync when you’re back online.':state==='connecting'?'Connecting…':err?err:inflight||Object.keys(rj(DK,{})).length?'Saving…':ago===null?'Connected.':ago<60?'Synced just now.':ago<3600?`Synced ${Math.round(ago/60)} min ago.`:'Synced.';
      return {fid,state,text}},
    async create(){if(fid)return;if(!navigator.onLine)throw new Error('Connect to the internet to create a family code.');
      await withTimeout(fb.ready(),20000,'Couldn’t connect. Check your internet connection.');
      const code=newCode();await withTimeout(fb.set(['families',code],{v:1,created:Date.now()}),15000,'Couldn’t reach the database. Try again in a moment.');
      fid=code;RAW.set(FK,fid);meta={};saveMeta();markAll();await connect()},
    async join(c){if(fid)return;const code=norm(c);if(code.length!==12)throw new Error('A family code has 12 letters and numbers, like ABCD-EFGH-JKLM.');
      if(!navigator.onLine)throw new Error('Connect to the internet to join a family.');
      await withTimeout(fb.ready(),20000,'Couldn’t connect. Check your internet connection.');
      const f=await withTimeout(fb.get(['families',code]),15000,'Couldn’t reach the database. Try again in a moment.');
      if(!f)throw new Error('No family uses that code. Check it and try again.');
      fid=code;RAW.set(FK,fid);RAW.set(JK,'1');meta={};saveMeta();RAW.remove(DK);await connect()},
    leave(){disconnect();fid='';RAW.remove(FK);RAW.remove(DK);RAW.remove(JK);meta={};saveMeta();state='off';err='';try{window.FTHIST&&window.FTHIST.detach()}catch(e){}ping()}};
  window.FTLINK=window.FTLINK_NET=makeLink(fb);
  try{window.lkBoot&&window.lkBoot()}catch(e){}
  addEventListener('online',()=>{ping();window.ftDirty()});addEventListener('offline',ping);
  setInterval(ping,30000);
  if(fid)connect();
  const m=/#join=([A-Za-z0-9-]+)/.exec(location.hash);
  if(m){history.replaceState(null,'',location.pathname+location.search);if(!fid&&window.ftOpenSync)window.ftOpenSync(m[1])}
  ping()}

/* ---- linked games: one shared game, several phones. `fb` is Firebase online, or the host phone's own store when playing offline ---- */
export function makeLink(fb,o={}){
  const withTimeout=(p,ms,msg)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error(msg)),ms))]);
  /* ---- linked games: one shared game, several phones, joined with a 6-number code ---- */
  let lk=null,uid='',lastRd=0;const gref=c=>['games',c],exp=()=>fb.when(Date.now()+3*864e5);
  const authed=async()=>{uid=await withTimeout(fb.ready(),20000,o.local?'Couldn\u2019t reach the host phone.':'Couldn\u2019t connect. Check your internet connection.');return uid};
  const seatMap=all=>{const m={};all.forEach(d=>{if(d.data&&d.data.uid)m[d.id]={dev:d.data.uid,ready:!!d.data.ready,rd:d.data.rd||0}});return m};
  function lkStop(){if(lk){lk.un.forEach(u=>{try{u()}catch(e){}});lk=null}}
  function lkWatch(code){lkStop();const un=[],send=u=>{try{window.lkRecv&&window.lkRecv(u)}catch(e){console.error(e)}};
    un.push(fb.watchDoc(gref(code),d=>{if(!d||d.ended){send({gone:true});return}lastRd=d.rd||0;send({mflat:flatM(d.m),order:d.order,rv:d.rv||null,rd:lastRd,gen:d.gen||0,sw:!!d.sw})},()=>{}));
    un.push(fb.watch([...gref(code),'i'],ch=>{const items={};ch.forEach(c=>{if(c.local)return;items[c.id]=c.removed||!c.data?null:c.data.j});if(Object.keys(items).length)send({items})},()=>{}));
    un.push(fb.watch([...gref(code),'seats'],(ch,first,all)=>send({seats:seatMap(all)}),()=>{}));
    un.push(fb.watch([...gref(code),'p'],ch=>{const ps={};ch.forEach(c=>{if(!c.local&&c.data&&c.data.j)ps[c.id]=c.data.j});if(Object.keys(ps).length)send({ps})},()=>{}));
    lk={code,un}}
  const fail=e=>{console.warn('link',e)};
  /* the shared game is stored as nested fields whose ends hold JSON text; these convert between that and a flat list of paths */
  const SEP='\u0001';
  const flatM=(m,pre,out)=>{out=out||{};for(const k in (m||{})){const v=m[k],p=pre?pre+SEP+k:k;if(typeof v==='string')out[p]=v;else if(v&&typeof v==='object')flatM(v,p,out)}return out};
  const nestM=flat=>{const o={};for(const p in flat){const ks=p.split(SEP);let t=o;for(let i=0;i<ks.length-1;i++){if(!t[ks[i]]||typeof t[ks[i]]!=='object')t[ks[i]]={};t=t[ks[i]]}t[ks[ks.length-1]]=flat[p]}return o};
  /* clean up a finished or abandoned linked game: its players, score entries and seats, then the game itself */
  const IDLE=12*3600e3;
  async function purge(c){try{for(const sub of ['p','i','seats']){const L=await fb.list([...gref(c),sub]);await Promise.all(L.map(x=>fb.del([...gref(c),sub,x.id]).catch(()=>{})))}
      await fb.del(gref(c))}catch(e){fail(e)}}
  return {dev:()=>uid,local:!!o.local,
    async host(x){if(!o.local&&!navigator.onLine)throw new Error('Connect to the internet to link phones.');
      await authed();
      for(let i=0;i<8;i++){const a=new Uint32Array(1);crypto.getRandomValues(a);const c=String(100000+a[0]%900000);
        const ex=await withTimeout(fb.get(gref(c)),15000,'Couldn’t reach the database. Try again in a moment.');
        if(ex&&!ex.ended&&Date.now()-(ex.t||ex.created||0)<IDLE)continue;
        if(ex)await purge(c);
        await fb.set(gref(c),{v:2,hostUid:uid,created:Date.now(),m:nestM(x.m),order:x.order,rv:null,rd:0,ended:false,t:Date.now(),expireAt:exp()});
        await Promise.all([...Object.entries(x.ps).map(([id,j])=>fb.set([...gref(c),'p',id],{j,t:Date.now(),expireAt:exp()})),...Object.entries(x.items||{}).map(([k,j])=>fb.set([...gref(c),'i',k],{j,t:Date.now(),expireAt:exp()}))]);
        lkWatch(c);return c}
      throw new Error('Couldn’t find a free game code. Try again.')},
    async join(c){if(!o.local&&!navigator.onLine)throw new Error('Connect to the internet to join a game.');
      await authed();
      const d=await withTimeout(fb.get(gref(c)),15000,'Couldn’t reach the database. Try again in a moment.');
      if(!d||d.ended)throw new Error('No game is using that code right now. Check the number on the host’s phone.');
      if(!d.m)throw new Error('That game was started on an older version of the app. Ask the host to close and reopen the app, then link again.');
      const players=(await fb.list([...gref(c),'p'])).map(x=>({id:x.id,j:x.data.j})),seats=seatMap(await fb.list([...gref(c),'seats'])),items={};
      (await fb.list([...gref(c),'i'])).forEach(x=>{if(x.data&&x.data.j)items[x.id]=x.data.j});
      lastRd=d.rd||0;lkWatch(c);return {...d,mflat:flatM(d.m),players,seats,items}},
    resume(c){authed().then(()=>lkWatch(c),fail)},
    /* the host starts a different game for the same linked phones: same code, fresh players, seats and scores */
    async swap(x){if(!lk)throw new Error('Not linked');const c=lk.code,d=await withTimeout(fb.get(gref(c)),15000,'Couldn’t reach the other phones.')||{},gen=(d.gen||0)+1;
      await fb.update(gref(c),{gen,sw:true,t:Date.now()});
      for(const sub of ['p','i','seats']){const L=await fb.list([...gref(c),sub]);await Promise.all(L.map(y=>fb.del([...gref(c),sub,y.id]).catch(()=>{})))}
      await Promise.all([...Object.entries(x.ps).map(([id,j])=>fb.set([...gref(c),'p',id],{j,t:Date.now(),expireAt:exp()})),...Object.entries(x.items||{}).map(([k,j])=>fb.set([...gref(c),'i',k],{j,t:Date.now(),expireAt:exp()}))]);
      await fb.set(gref(c),{v:2,hostUid:d.hostUid||uid,created:d.created||Date.now(),m:nestM(x.m),order:x.order,rv:null,rd:0,ended:false,gen,sw:false,t:Date.now(),expireAt:exp()});lastRd=0;return gen},
    push(u){if(!lk)return;const c=lk.code,ops=(u.mops||[]).map(([segs,v])=>[['m',...segs],v]);if(u.order)ops.push([['order'],u.order]);
      ops.push([['t'],Date.now()],[['expireAt'],exp()]);fb.updatePaths(gref(c),ops).catch(fail);
      for(const k in (u.items||{}))(u.items[k]==null?fb.del([...gref(c),'i',k]):fb.set([...gref(c),'i',k],{j:u.items[k],t:Date.now(),expireAt:exp()})).catch(fail);
      for(const id in (u.ps||{}))fb.set([...gref(c),'p',id],{j:u.ps[id],t:Date.now(),expireAt:exp()}).catch(fail)},
    /* claiming a player creates their seat; the database rules refuse it if another device already holds that player */
    seat(id,s){if(!lk)return Promise.reject(new Error('Not linked'));const p=[...gref(lk.code),'seats',id];
      return s?fb.set(p,{uid,ready:!!s.ready,rd:s.rd||0,t:Date.now(),expireAt:exp()}):fb.del(p)},
    reveal(on=true){if(!lk)return;fb.update(gref(lk.code),on?{rv:Date.now()}:{rv:null,rd:lastRd+1}).catch(fail)},
    end(){if(!lk)return;const c=lk.code;lkStop();fb.update(gref(c),{ended:true}).then(()=>purge(c),fail)},
    endCode(c){authed().then(()=>fb.update(gref(c),{ended:true})).then(()=>purge(c)).catch(fail)},
    /* a guest leaving a game that has sat idle tidies it up too */
    tidy(c){authed().then(()=>fb.get(gref(c))).then(d=>{if(d&&(d.ended||Date.now()-(d.t||d.created||0)>IDLE))return purge(c)}).catch(()=>{})},
    leave(){lkStop()}};
}
