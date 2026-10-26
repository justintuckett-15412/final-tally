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
  /* ---- linked games: one shared game, several phones, joined with a 6-number code ---- */
  let lk=null;const gref=c=>['games',c];
  function lkStop(){if(lk){lk.un.forEach(u=>{try{u()}catch(e){}});lk=null}}
  function lkWatch(code){lkStop();const un=[],send=u=>{try{window.lkRecv&&window.lkRecv(u)}catch(e){console.error(e)}};
    un.push(fb.watchDoc(gref(code),d=>{if(!d||d.ended){send({gone:true});return}send({main:d.main,order:d.order,seats:d.seats||{},rv:d.rv||null})},()=>{}));
    un.push(fb.watch([...gref(code),'p'],ch=>{const ps={};ch.forEach(c=>{if(!c.local&&c.data&&c.data.j)ps[c.id]=c.data.j});if(Object.keys(ps).length)send({ps})},()=>{}));
    lk={code,un}}
  const fail=e=>{console.warn('link',e)};
  window.FTLINK={dev,
    async host(x){if(!navigator.onLine)throw new Error('Connect to the internet to link phones.');
      await withTimeout(fb.ready(),20000,'Couldn’t connect. Check your internet connection.');
      for(let i=0;i<8;i++){const a=new Uint32Array(1);crypto.getRandomValues(a);const c=String(100000+a[0]%900000);
        const ex=await withTimeout(fb.get(gref(c)),15000,'Couldn’t reach the database. Try again in a moment.');
        if(ex&&!ex.ended&&Date.now()-(ex.created||0)<3*864e5)continue;
        await fb.set(gref(c),{v:1,host:dev(),created:Date.now(),main:x.main,order:x.order,seats:{},rv:null,ended:false,t:Date.now()});
        await Promise.all(Object.entries(x.ps).map(([id,j])=>fb.set([...gref(c),'p',id],{j,t:Date.now()})));
        lkWatch(c);return c}
      throw new Error('Couldn’t find a free game code. Try again.')},
    async join(c){if(!navigator.onLine)throw new Error('Connect to the internet to join a game.');
      await withTimeout(fb.ready(),20000,'Couldn’t connect. Check your internet connection.');
      const d=await withTimeout(fb.get(gref(c)),15000,'Couldn’t reach the database. Try again in a moment.');
      if(!d||d.ended)throw new Error('No game is using that code right now. Check the number on the host’s phone.');
      const players=(await fb.list([...gref(c),'p'])).map(x=>({id:x.id,j:x.data.j}));lkWatch(c);return {...d,players}},
    resume(c){fb.ready().then(()=>lkWatch(c),fail)},
    push(u){if(!lk)return;const c=lk.code,m={};if(u.main!==undefined)m.main=u.main;if(u.order)m.order=u.order;
      if(Object.keys(m).length){m.t=Date.now();fb.update(gref(c),m).catch(fail)}
      for(const id in (u.ps||{}))fb.set([...gref(c),'p',id],{j:u.ps[id],t:Date.now()}).catch(fail)},
    seat(id,s){if(lk)fb.update(gref(lk.code),{['seats.'+id]:s}).catch(fail)},
    reveal(on=true,seats){if(!lk)return;const m={rv:on?Date.now():null};if(!on&&seats)seats.forEach(id=>m['seats.'+id+'.ready']=false);fb.update(gref(lk.code),m).catch(fail)},
    end(){if(lk)fb.update(gref(lk.code),{ended:true}).catch(fail);lkStop()},
    leave(){lkStop()}};
  try{window.lkBoot&&window.lkBoot()}catch(e){}
  addEventListener('online',()=>{ping();window.ftDirty()});addEventListener('offline',ping);
  setInterval(ping,30000);
  if(fid)connect();
  const m=/#join=([A-Za-z0-9-]+)/.exec(location.hash);
  if(m){history.replaceState(null,'',location.pathname+location.search);if(!fid&&window.ftOpenSync)window.ftOpenSync(m[1])}
  ping()}
