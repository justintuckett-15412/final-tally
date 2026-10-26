/* Final Tally offline support. The page is fetched fresh when online; pictures and sounds come from the cache. */
const VER='ft-__VER__',FILES=__FILES__,CORE=FILES.filter(f=>!/^(win|lose)\//.test(f)),LATER=FILES.filter(f=>/^(win|lose)\//.test(f));
self.addEventListener('install',e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('ft-')&&k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
  /* fetch the win and lose pictures quietly in the background so reveals work offline */
  caches.open(VER).then(async c=>{for(const f of LATER){try{if(!(await c.match(f)))await c.add(f)}catch(e){}}})});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin!==location.origin){if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||(u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/')))e.respondWith(caches.open(VER).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));return}
  if(r.mode==='navigate'||/\/(index\.html|sync\.js|fb-firebase\.js)$/.test(u.pathname)){e.respondWith(fetch(new Request(r.url,{cache:'no-cache',credentials:'same-origin'})).then(res=>{const c=res.clone();caches.open(VER).then(x=>x.put(r.mode==='navigate'?'index.html':r,c));return res}).catch(()=>caches.match(r.mode==='navigate'?'index.html':r)));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(VER).then(x=>x.put(r,c))}return res})))});
