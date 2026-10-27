/* Final Tally offline support. The page is fetched fresh when online; pictures and sounds come from the cache. */
const VER='ft-__VER__',FILES=__FILES__,CORE=FILES.filter(f=>!/^(win|lose)\//.test(f)),LATER=FILES.filter(f=>/^(win|lose)\//.test(f));
const HASH=__HASH__,HKEY='__hashes__';
/* Copy every file whose contents haven't changed from the previous version's cache, so an update only downloads what changed. */
async function carry(c){try{const ks=(await caches.keys()).filter(k=>k.startsWith('ft-')&&k!==VER);for(const k of ks){const o=await caches.open(k),hr=await o.match(HKEY),oh=hr?await hr.json():{};
  for(const req of await o.keys()){const u=new URL(req.url);if(u.pathname.endsWith(HKEY))continue;const f=u.origin===location.origin?decodeURIComponent(u.pathname.replace(/^.*?\/((?:art|win|lose|mask|badges|sfx|train|wait|icons)\/.*)$/,'$1')):null;
    if(f===null){if(!(await c.match(req))){const m=await o.match(req);if(m)await c.put(req,m)}continue}
    if(HASH[f]&&oh[f]===HASH[f]&&!(await c.match(f))){const m=await o.match(req);if(m)await c.put(f,m)}}}}catch(e){}}
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(async c=>{await carry(c);for(const f of CORE){if(!HASH[f]||!(await c.match(f)))await c.add(f)}await c.put(HKEY,new Response(JSON.stringify(HASH),{headers:{'content-type':'application/json'}}))}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ft-')&&k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
  /* fetch the win and lose pictures quietly in the background so reveals work offline */
  caches.open(VER).then(async c=>{for(const f of LATER){try{if(!(await c.match(f)))await c.add(f)}catch(e){}}})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin){if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')))e.respondWith(caches.open(VER).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));return}
  if(r.mode==='navigate'||/\/(index\.html|sync\.js|fb-firebase\.js)$/.test(u.pathname)){e.respondWith(fetch(new Request(r.url,{cache:'no-cache',credentials:'same-origin'})).then(res=>{const c=res.clone();caches.open(VER).then(x=>x.put(r.mode==='navigate'?'index.html':r,c));return res}).catch(()=>caches.match(r.mode==='navigate'?'index.html':r)));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VER).then(x=>x.put(r,c))}return res})))});
