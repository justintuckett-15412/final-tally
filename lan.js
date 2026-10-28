/* Final Tally offline linked games.
   One phone (the host, usually the one sharing its hotspot) keeps the shared game in memory.
   Other phones connect straight to it over the local Wi-Fi with WebRTC. There is no server:
   the two halves of each connection are swapped by showing QR codes on the screens.
   The app's normal linked-game code runs on top of this unchanged, through makeLink(). */
import {makeLink} from './sync.js';

const LS=localStorage;
const myId=()=>{let d=LS.getItem('ft.lanid');if(!d){const a=new Uint32Array(2);crypto.getRandomValues(a);d='d'+a[0].toString(36)+a[1].toString(36);LS.setItem('ft.lanid',d)}return d};
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const later=f=>setTimeout(f,0);

/* ---------------- the host's in-memory store (shaped like the small part of Firestore the app uses) ---------------- */
function Store(){
  const docs=new Map(),subs=new Set(),K=p=>p.join('/'),par=k=>k.slice(0,k.lastIndexOf('/')),idOf=k=>k.slice(k.lastIndexOf('/')+1);
  const all=col=>[...docs].filter(([k])=>par(k)===col).map(([k,d])=>({id:idOf(k),data:clone(d)}));
  function notify(k,origin){const d=docs.get(k),col=par(k);
    subs.forEach(s=>{if(s.doc===k)later(()=>s.cb(clone(d)??null,false));
      else if(s.col===col)later(()=>s.cb([{id:idOf(k),data:d?clone(d):null,removed:!d,local:origin===s.client}],false,all(col),false))})}
  function setPath(o,segs,v){let t=o;for(let i=0;i<segs.length-1;i++){if(!t[segs[i]]||typeof t[segs[i]]!=='object')t[segs[i]]={};t=t[segs[i]]}
    if(v===null)delete t[segs[segs.length-1]];else t[segs[segs.length-1]]=clone(v)}
  return {
    get:p=>clone(docs.get(K(p)))??null,
    set(p,d,origin){const k=K(p),old=docs.get(k);
      /* same rule as the online database: a player can only be on one phone */
      if(p[2]==='seats'&&old&&old.uid&&d&&d.uid&&old.uid!==d.uid){const e=new Error('That player is already on another phone.');e.code='permission-denied';throw e}
      docs.set(k,clone(d));notify(k,origin)},
    update(p,d,origin){const k=K(p);if(!docs.has(k))throw new Error('Not found');docs.set(k,{...docs.get(k),...clone(d)});notify(k,origin)},
    updatePaths(p,ops,origin){const k=K(p);if(!docs.has(k))throw new Error('Not found');const o=docs.get(k);ops.forEach(([segs,v])=>setPath(o,segs,v));notify(k,origin)},
    del(p,origin){const k=K(p);if(docs.delete(k))notify(k,origin)},
    list:p=>all(K(p)),
    watchDoc(p,cb,client){const s={doc:K(p),cb,client};subs.add(s);later(()=>cb(clone(docs.get(s.doc))??null,false));return()=>subs.delete(s)},
    watch(p,cb,client){const s={col:K(p),cb,client};subs.add(s);later(()=>{const a=all(s.col);cb(a.map(x=>({id:x.id,data:x.data,removed:false,local:false})),true,a,false)});return()=>subs.delete(s)},
    code(){for(const [k,d] of docs){if(/^games\/\d{6}$/.test(k)&&d&&!d.ended)return k.slice(6)}return null}}}

/* the host's own view of the store, in the shape makeLink() expects */
const hostFb=(st,client)=>({ready:async()=>client,when:ms=>ms,
  get:async p=>st.get(p),set:async(p,d)=>st.set(p,d,client),update:async(p,d)=>st.update(p,d,client),updatePaths:async(p,ops)=>st.updatePaths(p,ops,client),
  del:async p=>st.del(p,client),list:async p=>st.list(p),watchDoc:(p,cb)=>st.watchDoc(p,cb,client),watch:(p,cb)=>st.watch(p,cb,client)});

/* ---------------- packing a connection offer or answer into a QR code ---------------- */
const b64u={enc:u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode(...u8.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
  dec:t=>{const s=atob(t.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(s,c=>c.charCodeAt(0))}};
async function squeeze(u8,dir){const cs=dir?new CompressionStream('deflate-raw'):new DecompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(u8);w.close();return new Uint8Array(await new Response(cs.readable).arrayBuffer())}
/* keep only the SDP lines a data channel needs, so the QR stays small and easy to scan */
const slim=sdp=>sdp.split(/\r?\n/).filter(l=>l&&!/^a=(extmap|rtcp|ssrc|msid|ice-options)/.test(l)&&!/tcptype|typ (srflx|relay)/.test(l)).join('\n');
async function pack(desc,tag){const j=JSON.stringify({t:desc.type[0],s:slim(desc.sdp),g:tag||''});
  try{return 'FT1'+b64u.enc(await squeeze(new TextEncoder().encode(j),true))}catch(e){return 'FT0'+b64u.enc(new TextEncoder().encode(j))}}
async function unpack(text){text=String(text||'').trim();const m=/(FT[01])([A-Za-z0-9_-]+)/.exec(text);if(!m)throw new Error('That isn’t a Final Tally code.');
  let u8=b64u.dec(m[2]);if(m[1]==='FT1')u8=await squeeze(u8,false);const o=JSON.parse(new TextDecoder().decode(u8));
  return {type:o.t==='o'?'offer':'answer',sdp:o.s.replace(/\n/g,'\r\n')+'\r\n',tag:o.g}}
/* wait until this phone has found its own local address (no internet servers are used) */
function gathered(pc,ms){return new Promise(res=>{if(pc.iceGatheringState==='complete')return res();const t=setTimeout(res,ms);
  pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);res()}})})}
const hasAddress=sdp=>/a=candidate:/.test(sdp);
/* the local addresses this phone offered, for the pairing screen (helps spot two phones on different networks) */
const addrs=sdp=>[...new Set((sdp.match(/a=candidate:\S+ \d+ udp \d+ (\S+) \d+ typ host/g)||[]).map(l=>l.split(' ')[4]))];

/* ---------------- host side ---------------- */
let hub=null;
function startHost(){if(hub&&hub.role==='host')return hub;stop();const st=Store(),me=myId(),peers=new Set();
  hub={role:'host',st,me,peers,link:makeLink(hostFb(st,me),{local:true}),
    count:()=>[...peers].filter(p=>p.open).length,
    async offer(){const pc=new RTCPeerConnection({iceServers:[]}),dc=pc.createDataChannel('ft',{ordered:true}),peer={pc,dc,open:false,subs:new Map(),client:null};
      wirePeer(peer);await pc.setLocalDescription(await pc.createOffer());await gathered(pc,4000);
      peer.code=await pack(pc.localDescription,'h');peer.noAddr=!hasAddress(pc.localDescription.sdp);peer.addrs=addrs(pc.localDescription.sdp);hub.pending=peer;return peer},
    async accept(text){const peer=hub.pending;if(!peer)throw new Error('Show your code first.');const d=await unpack(text);if(d.type!=='answer')throw new Error('That’s the host’s code. Scan the code on the other phone.');peer.theirAddrs=addrs(d.sdp);
      await peer.pc.setRemoteDescription({type:'answer',sdp:d.sdp});hub.pending=null;hub.last=peer;
      return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('The phones couldn’t reach each other. Make sure the other phone is on this phone’s hotspot (Wi-Fi on), then try again.')),25000);peer.onopen=()=>{clearTimeout(t);res()}})}};
  function wirePeer(peer){const {pc,dc}=peer;
    dc.onopen=()=>{peer.open=true;peers.add(peer);(peer.q||[]).forEach(j=>{try{dc.send(j)}catch(x){}});peer.q=[];peer.onopen&&peer.onopen();ping()};
    const gone=()=>{if(!peers.has(peer))return;peers.delete(peer);peer.open=false;peer.subs.forEach(u=>{try{u()}catch(e){}});peer.subs.clear();ping('lost')};
    dc.onclose=gone;pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState))gone()};
    dc.onmessage=async e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}const send=o=>{const j=JSON.stringify(o);try{if(dc.readyState==='open')dc.send(j);else (peer.q||(peer.q=[])).push(j)}catch(x){}};
      if(m.t==='hi'){peer.client=m.id;send({t:'hi',id:me,code:st.code()});return}
      const fb=hostFb(st,peer.client||'?');
      if(m.t==='req'){try{const v=m.op==='code'?st.code():await fb[m.op](...m.args);send({t:'res',id:m.id,ok:true,v})}catch(x){send({t:'res',id:m.id,ok:false,e:x.message,c:x.code||''})}return}
      if(m.t==='sub'){const cb=m.doc?(d)=>send({t:'evd',sid:m.sid,d}):(ch,first,all)=>send({t:'ev',sid:m.sid,ch,first,all});
        peer.subs.set(m.sid,m.doc?fb.watchDoc(m.path,cb):fb.watch(m.path,cb));return}
      if(m.t==='unsub'){const u=peer.subs.get(m.sid);if(u){u();peer.subs.delete(m.sid)}}}}
  return hub}

/* ---------------- guest side ---------------- */
async function joinWith(text){const d=await unpack(text);if(d.type!=='offer')throw new Error('That’s a reply code. Scan the code on the host’s phone.');
  stop();const pc=new RTCPeerConnection({iceServers:[]}),me=myId();let dc=null,seq=0;const waits=new Map(),subs=new Map();
  const g=hub={role:'guest',pc,me,open:false,
    send:o=>{if(dc&&dc.readyState==='open')dc.send(JSON.stringify(o));else throw new Error('Not connected to the host phone.')},
    connected:null};
  const call=(op,args)=>new Promise((res,rej)=>{const id=++seq;waits.set(id,{res,rej});try{g.send({t:'req',id,op,args})}catch(e){waits.delete(id);rej(e)}
    setTimeout(()=>{if(waits.has(id)){waits.delete(id);rej(new Error('The host phone didn’t answer.'))}},15000)});
  const sub=(path,cb,doc)=>{const sid=++seq;subs.set(sid,cb);try{g.send({t:'sub',sid,path,doc:!!doc})}catch(e){}return()=>{subs.delete(sid);try{g.send({t:'unsub',sid})}catch(e){}}};
  const fb={ready:async()=>me,when:ms=>ms,get:p=>call('get',[p]),set:(p,d)=>call('set',[p,d]),update:(p,d)=>call('update',[p,d]),updatePaths:(p,ops)=>call('updatePaths',[p,ops]),
    del:p=>call('del',[p]),list:p=>call('list',[p]),watchDoc:(p,cb)=>sub(p,cb,true),watch:(p,cb)=>sub(p,cb,false)};
  g.link=makeLink(fb,{local:true});g.code=()=>call('code',[]);
  g.connected=new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('Couldn’t reach the host phone. Make sure this phone is on the host’s hotspot, then scan again.')),60000);
    pc.ondatachannel=e=>{dc=e.channel;let tries=0;const hello=()=>{g.open=true;if(g.hostCode!==undefined||tries++>20)return;try{g.send({t:'hi',id:me})}catch(x){}setTimeout(hello,700)};dc.onopen=()=>{if(!g.open)hello()};if(dc.readyState==='open'&&!g.open)hello();
      dc.onmessage=e2=>{let m;try{m=JSON.parse(e2.data)}catch(x){return}
        if(m.t==='hi'){clearTimeout(t);if(g.hostCode===undefined){g.hostCode=m.code;res(m.code)}return}
        if(m.t==='res'){const w=waits.get(m.id);if(w){waits.delete(m.id);if(m.ok)w.res(m.v);else{const er=new Error(m.e);er.code=m.c;w.rej(er)}}return}
        if(m.t==='ev'){const cb=subs.get(m.sid);if(cb)cb(m.ch,m.first,m.all,false);return}
        if(m.t==='evd'){const cb=subs.get(m.sid);if(cb)cb(m.d,false)}};
      dc.onclose=()=>{if(g.open){g.open=false;ping('lost')}}}});
  pc.onconnectionstatechange=()=>{if(['failed','disconnected','closed'].includes(pc.connectionState)&&g.open){g.open=false;ping('lost')}};
  await pc.setRemoteDescription({type:'offer',sdp:d.sdp});await pc.setLocalDescription(await pc.createAnswer());await gathered(pc,4000);
  g.reply=await pack(pc.localDescription,'g');g.noAddr=!hasAddress(pc.localDescription.sdp);g.addrs=addrs(pc.localDescription.sdp);g.hostAddrs=addrs(d.sdp);return g}

function stop(){if(!hub)return;try{if(hub.role==='host')hub.peers.forEach(p=>{try{p.pc.close()}catch(e){}});else hub.pc.close()}catch(e){}if(hub.pending)try{hub.pending.pc.close()}catch(e){}hub=null}
const ping=why=>{try{window.lanPing&&window.lanPing(why)}catch(e){}};

/* ---------------- QR codes: drawing them, and reading them with the camera ---------------- */
const loadScript=src=>new Promise((res,rej)=>{if(document.querySelector(`script[data-lan="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.dataset.lan=src;s.onload=res;s.onerror=()=>rej(new Error('Couldn’t load '+src));document.head.appendChild(s)});
async function qrSvg(text){await loadScript('qr.js');const q=window.qrcode(0,'L');q.addData(text,'Byte');q.make();const n=q.getModuleCount(),m=4;let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c+m} ${r+m}h1v1h-1z`;
  return `<svg class="lanqr" viewBox="0 0 ${n+2*m} ${n+2*m}" shape-rendering="crispEdges" role="img" aria-label="Pairing code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
/* camera scanner: uses the phone's built-in QR reader when it has one, otherwise a small reader that ships with the app */
async function scan(video,onText){const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});
  video.srcObject=stream;video.setAttribute('playsinline','');video.muted=true;await video.play().catch(()=>{});
  let det=null;try{if('BarcodeDetector' in window&&(await BarcodeDetector.getSupportedFormats()).includes('qr_code'))det=new BarcodeDetector({formats:['qr_code']})}catch(e){}
  if(!det)await loadScript('jsqr.js');
  const cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});let live=true,busy=false;
  const tick=async()=>{if(!live)return;if(!busy&&video.readyState>=2){busy=true;try{let t=null;
      if(det){const r=await det.detect(video);if(r&&r[0])t=r[0].rawValue}
      else{const w=video.videoWidth,h=video.videoHeight,s=Math.min(1,720/Math.max(w,h));cv.width=w*s|0;cv.height=h*s|0;cx.drawImage(video,0,0,cv.width,cv.height);
        const r=window.jsQR(cx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'});if(r)t=r.data}
      if(t&&/FT[01]/.test(t)){live=false;onText(t)}}catch(e){}busy=false}if(live)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
  return ()=>{live=false;stream.getTracks().forEach(t=>t.stop());video.srcObject=null}}
/* asking for the camera early also lets the phone share its real local address with the other phone */
async function warmCamera(){try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});return()=>s.getTracks().forEach(t=>t.stop())}catch(e){return()=>{}}}

window.FTLAN={startHost,joinWith,stop,qrSvg,scan,warmCamera,pack,unpack,get hub(){return hub},id:myId,Store,hostFb};
try{window.lanReady&&window.lanReady()}catch(e){}
