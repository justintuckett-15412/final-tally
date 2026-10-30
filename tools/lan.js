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

/* connection checks so far, for troubleshooting: how many "are you there?" messages went out, came back, and arrived from the other phone */
/* Chrome asks "allow this site to find and connect to devices on your local network?" before a web page can reach phones on the same Wi-Fi.
   A connection attempt alone doesn't show that question, so ask for it with a tiny local request while the person is tapping a button. */
async function askLocal(){try{if(/^(localhost|127\.|10\.|192\.168\.|\[)/.test(location.hostname))return 'local page';
    const st=await lnaState();const m=/(local-network-access|local-network):prompt/.exec(st);if(!m)return st;
    let perm=null;try{perm=await navigator.permissions.query({name:m[1]})}catch(e){}
    await new Promise(res=>{const t=setTimeout(res,perm?25000:5000);if(perm)perm.onchange=()=>{if(perm.state!=='prompt'){clearTimeout(t);res()}};
      fetch('http://192.168.1.1/',{targetAddressSpace:'local',mode:'no-cors',cache:'no-store',signal:AbortSignal.timeout(perm?25000:4000)}).then(()=>{clearTimeout(t);res()},()=>{setTimeout(()=>{clearTimeout(t);res()},perm&&perm.state==='prompt'?1500:0)})});
    return await lnaState()}catch(e){return 'error'}}
async function lnaState(){const out=[];for(const n of ['local-network-access','local-network','loopback-network']){try{const r=await navigator.permissions.query({name:n});out.push(n+':'+r.state)}catch(e){}}return out.join(' ')||'no LNA permission'}
/* Chrome and Safari throw away their check counts once a try fails, so sample them while it is running and keep the busiest moment */
function watchIce(pc){if(pc._ftw)return;pc._ftw=setInterval(async()=>{if(pc.connectionState==='closed'){clearInterval(pc._ftw);return}
  try{const t=await iceNow(pc);if(t&&(!pc._ftbest||t.score>=pc._ftbest.score))pc._ftbest=t}catch(e){}},700)}
async function iceInfo(pc){const now=await iceNow(pc);const b=pc._ftbest;
  return (b&&b.score>now.score?'during the try: '+b.text+' · now '+(pc.iceConnectionState)+'/'+pc.connectionState:now.text)}
async function iceNow(pc){try{const st=await pc.getStats();let sent=0,back=0,heard=0,pairs=0,state=pc.iceConnectionState,loc=[],rem=[];
  st.forEach(r=>{if(r.type==='candidate-pair'){pairs++;sent+=r.requestsSent||0;back+=r.responsesReceived||0;heard+=r.requestsReceived||0}
    if(r.type==='local-candidate')loc.push((r.address||r.ip||'?')+':'+r.port+'/'+r.protocol);if(r.type==='remote-candidate')rem.push((r.address||r.ip||'?')+':'+r.port)});
  const text=`checks ${state}/${pc.connectionState}: ${pairs} route${pairs===1?'':'s'}, sent ${sent}, answered ${back}, heard from them ${heard} · mine ${loc.join(' ')||'none'} · theirs ${rem.join(' ')||'none'} · code had ${(pc._ftc||{}).n??'?'} added ${(pc._ftc||{}).ok??'?'}${(pc._ftc||{}).err?' ('+pc._ftc.err+')':''} · ${await lnaState()} · ${(navigator.userAgent.match(/(Chrome|Firefox|Version)\/[\d.]+/)||[''])[0]}`;return {text,score:pairs*1e6+sent+back*1e3+heard*1e3}}catch(e){return {text:'stats error '+e.message,score:-1}}}
/* add each address from the other phone's code one by one too, in case the browser skipped them when reading the code */
async function addCands(pc,sdp){const r={n:0,ok:0,err:''};const mid=(sdp.match(/a=mid:(\S+)/)||[])[1]||'0';
  for(const l of sdp.split(/\r?\n/))if(l.startsWith('a=candidate:')){r.n++;try{await pc.addIceCandidate({candidate:l.slice(2),sdpMid:mid,sdpMLineIndex:0});r.ok++}catch(e){r.err=e.name+' '+e.message}}
  pc._ftc=r;watchIce(pc);return r}
/* ---------------- host side ---------------- */
let hub=null;
function startHost(){if(hub&&hub.role==='host')return hub;stop();const st=Store(),me=myId(),peers=new Set();
  hub={role:'host',st,me,peers,link:makeLink(hostFb(st,me),{local:true}),
    count:()=>[...peers].filter(p=>p.open).length,
    async offer(){const pc=new RTCPeerConnection({iceServers:[]}),dc=pc.createDataChannel('ft',{ordered:true}),peer={pc,dc,open:false,subs:new Map(),client:null};
      wirePeer(peer);await pc.setLocalDescription(await pc.createOffer());await gathered(pc,4000);
      peer.tag=Math.random().toString(36).slice(2,8);peer.code=await pack(pc.localDescription,'h'+peer.tag);peer.noAddr=!hasAddress(pc.localDescription.sdp);peer.addrs=addrs(pc.localDescription.sdp);hub.pending=peer;return peer},
    async accept(text){const peer=hub.pending;if(!peer)throw new Error('Show your code first.');const d=await unpack(text);if(d.type!=='answer')throw new Error('That’s the host’s code. Scan the code on the other phone.');peer.theirAddrs=addrs(d.sdp);if(d.tag&&d.tag.length>1&&d.tag.slice(1)!==peer.tag)throw new Error('That reply is from an earlier try. On the other phone, tap Cancel, then Join without internet again and scan the code showing on this phone now.');
      await peer.pc.setRemoteDescription({type:'answer',sdp:d.sdp});await addCands(peer.pc,d.sdp);hub.pending=null;hub.last=peer;
      return new Promise((res,rej)=>{const t=setTimeout(async()=>{const e=new Error('The phones couldn’t reach each other. Make sure the other phone is on this phone’s hotspot (Wi-Fi on), then try again.');e.info=await iceInfo(peer.pc);rej(e)},25000);peer.onopen=()=>{clearTimeout(t);res()}})}};
  function wirePeer(peer){const {pc,dc}=peer;
    dc.onopen=()=>{peer.open=true;peers.add(peer);(peer.q||[]).forEach(j=>{try{dc.send(j)}catch(x){}});peer.q=[];peer.onopen&&peer.onopen();ping();vHostPeer(peer)};
    const gone=()=>{if(!peers.has(peer))return;peers.delete(peer);peer.open=false;vHostGone(peer);peer.subs.forEach(u=>{try{u()}catch(e){}});peer.subs.clear();ping('lost')};
    dc.onclose=gone;pc.onconnectionstatechange=()=>{if(['failed','closed','disconnected'].includes(pc.connectionState))gone()};
    dc.onmessage=async e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}const send=o=>{const j=JSON.stringify(o);try{if(dc.readyState==='open')dc.send(j);else (peer.q||(peer.q=[])).push(j)}catch(x){}};
      if(m.t==='hi'){peer.client=m.id;send({t:'hi',id:me,code:st.code()});return}
      if(m.t==='rtc'||m.t==='ice'){peer.rtc&&peer.rtc(m);return}
      if(m.t==='vme'){vMeta(m.s,m.v,peer);return}
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
        if(m.t==='hi'){clearTimeout(t);if(g.hostCode===undefined){g.hostCode=m.code;res(m.code);vGuestWire(g,pc)}return}
        if(m.t==='rtc'||m.t==='ice'){g.rtc&&g.rtc(m);return}
        if(m.t==='vmap'){V.who=m.m||{};vEmit();return}
        if(m.t==='res'){const w=waits.get(m.id);if(w){waits.delete(m.id);if(m.ok)w.res(m.v);else{const er=new Error(m.e);er.code=m.c;w.rej(er)}}return}
        if(m.t==='ev'){const cb=subs.get(m.sid);if(cb)cb(m.ch,m.first,m.all,false);return}
        if(m.t==='evd'){const cb=subs.get(m.sid);if(cb)cb(m.d,false)}};
      dc.onclose=()=>{if(g.open){g.open=false;ping('lost')}}}});
  pc.onconnectionstatechange=()=>{if(['failed','disconnected','closed'].includes(pc.connectionState)&&g.open){g.open=false;ping('lost')}};
  await pc.setRemoteDescription({type:'offer',sdp:d.sdp});await addCands(pc,d.sdp);await pc.setLocalDescription(await pc.createAnswer());await gathered(pc,4000);
  g.reply=await pack(pc.localDescription,'g'+String(d.tag||'').slice(1));g.noAddr=!hasAddress(pc.localDescription.sdp);g.addrs=addrs(pc.localDescription.sdp);g.hostAddrs=addrs(d.sdp);return g}

function stop(){vStop(true);if(!hub)return;try{if(hub.role==='host')hub.peers.forEach(p=>{try{p.pc.close()}catch(e){}});else hub.pc.close()}catch(e){}if(hub.pending)try{hub.pending.pc.close()}catch(e){}hub=null}
const ping=why=>{try{window.lanPing&&window.lanPing(why)}catch(e){}};

/* ---------------- voice chat over the same link ----------------
   Open mic with a mute button. Audio rides on the same phone-to-phone connections: each guest sends its microphone to the host,
   and the host passes every voice on to every other phone (and adds its own). New audio is set up by swapping descriptions
   over the data channel we already have, so nobody scans again. Each voice is labelled with the player it belongs to. */
const V={on:false,mic:null,muted:false,pid:null,who:{},els:new Map(),fw:new Map(),remote:new Map(),lv:{},cb:null,ac:null,an:new Map()};
function vEmit(){try{V.cb&&V.cb()}catch(e){}}
/* "perfect negotiation": the guest is polite (gives way when both ask at once), the host isn't */
function vNego(pc,send,polite){let making=false;
  pc.onnegotiationneeded=async()=>{try{making=true;await pc.setLocalDescription();send({t:'rtc',d:pc.localDescription})}catch(e){}finally{making=false}};
  pc.onicecandidate=e=>{if(e.candidate)try{send({t:'ice',c:e.candidate})}catch(x){}};
  return async m=>{try{if(m.t==='ice'){await pc.addIceCandidate(m.c).catch(()=>{});return}const d=m.d,coll=d.type==='offer'&&(making||pc.signalingState!=='stable');if(!polite&&coll)return;
    await pc.setRemoteDescription(d);if(d.type==='offer'){await pc.setLocalDescription();send({t:'rtc',d:pc.localDescription})}}catch(e){console.warn('voice',e)}}}
function vPlay(stream){if(V.els.has(stream.id))return;const a=document.createElement('audio');a.autoplay=true;a.setAttribute('playsinline','');a.srcObject=stream;a.muted=!V.on;a.style.display='none';document.body.appendChild(a);V.els.set(stream.id,a);
  if(V.on)a.play().catch(()=>{});vMeter(stream);stream.onremovetrack=()=>{if(!stream.getTracks().length)vUnplay(stream.id)}}
function vUnplay(id){const a=V.els.get(id);if(a){a.srcObject=null;a.remove();V.els.delete(id)}V.an.delete(id);vEmit()}
/* a small level meter for each voice, so the app can show who's talking */
function vMeter(stream){try{V.ac=V.ac||new (window.AudioContext||window.webkitAudioContext)();const src=V.ac.createMediaStreamSource(stream),an=V.ac.createAnalyser();an.fftSize=256;src.connect(an);V.an.set(stream.id,{an,buf:new Uint8Array(an.fftSize)});vLoop()}catch(e){}}
let vLoopOn=false;function vLoop(){if(vLoopOn)return;vLoopOn=true;let last=0;const tick=t=>{if(!V.an.size){vLoopOn=false;return}if(t-last>120){last=t;let ch=false;
  V.an.forEach((m,id)=>{m.an.getByteTimeDomainData(m.buf);let peak=0;for(const v of m.buf)peak=Math.max(peak,Math.abs(v-128));if(peak>10)m.loud=t;const on=t-(m.loud||-1e9)<450;/* hold the glow a moment between words */const pid=(V.who[id]||{}).pid;if(pid&&!!V.lv[pid]!==on){V.lv[pid]=on;ch=true}});if(ch)vEmit()}requestAnimationFrame(tick)};requestAnimationFrame(tick)}
/* host: every voice goes to every other phone */
function vHostPeer(peer){const send=o=>{try{peer.dc.readyState==='open'&&peer.dc.send(JSON.stringify(o))}catch(e){}};peer.vsend=send;peer.rtc=vNego(peer.pc,send,false);peer.fw=new Map();
  peer.pc.ontrack=e=>{const st=e.streams[0];if(!st)return;V.remote.set(st.id,{st,from:peer});vPlay(st);hub&&hub.peers.forEach(q=>{if(q!==peer)vFwd(q,st)});vEmit()};
  if(V.mic)vFwd(peer,V.mic);V.remote.forEach(r=>{if(r.from!==peer)vFwd(peer,r.st)});send({t:'vmap',m:V.who})}
function vFwd(q,st){if(!q.fw)return;st.getAudioTracks().forEach(tr=>{const k=st.id+'|'+tr.id;if(q.fw.has(k))return;try{q.fw.set(k,q.pc.addTrack(tr,st))}catch(e){}})}
function vUnfwd(stid){hub&&hub.peers&&hub.peers.forEach(q=>{if(!q.fw)return;[...q.fw.keys()].filter(k=>k.startsWith(stid+'|')).forEach(k=>{try{q.pc.removeTrack(q.fw.get(k))}catch(e){}q.fw.delete(k)})})}
function vHostGone(peer){[...V.remote].filter(([,r])=>r.from===peer).forEach(([id])=>{V.remote.delete(id);vUnfwd(id);vUnplay(id);delete V.who[id]});vBroadcast()}
function vBroadcast(){if(hub&&hub.role==='host')hub.peers.forEach(q=>q.vsend&&q.vsend({t:'vmap',m:V.who}));vEmit()}
/* who a voice belongs to, and whether they're muted: host keeps the list and shares it */
function vMeta(sid,v,peer){if(v)V.who[sid]=v;else{delete V.who[sid];if(V.remote.has(sid)&&hub&&hub.role==='host'){vUnfwd(sid)}}vBroadcast()}
function vGuestWire(g,pc){const send=o=>g.send(o);g.rtc=vNego(pc,send,true);pc.ontrack=e=>{const st=e.streams[0];if(st)vPlay(st);vEmit()}}
async function vStart(pid){if(!hub)throw new Error('Link phones without internet first.');if(V.on)return;
  const mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
  V.mic=mic;V.on=true;V.muted=false;V.pid=pid;try{V.ac=V.ac||new (window.AudioContext||window.webkitAudioContext)();V.ac.resume()}catch(e){}
  V.els.forEach(a=>{a.muted=false;a.play().catch(()=>{})});vMeter(mic);
  const meta={pid,muted:false};
  if(hub.role==='host'){V.who[mic.id]=meta;hub.peers.forEach(q=>vFwd(q,mic));vBroadcast()}
  else{mic.getAudioTracks().forEach(tr=>hub.pc.addTrack(tr,mic));try{hub.send({t:'vme',s:mic.id,v:meta})}catch(e){}}
  vEmit()}
function vStop(quiet){if(!V.mic&&!V.on)return;const mic=V.mic;V.on=false;V.mic=null;V.lv={};
  if(mic){mic.getTracks().forEach(t=>t.stop());V.an.delete(mic.id);
    if(hub&&hub.role==='host'){delete V.who[mic.id];vUnfwd(mic.id);if(!quiet)vBroadcast()}
    else if(hub){try{hub.pc.getSenders().forEach(sd=>{if(sd.track&&mic.getTracks().includes(sd.track))try{hub.pc.removeTrack(sd)}catch(e){}})}catch(e){}if(!quiet)try{hub.send({t:'vme',s:mic.id,v:null})}catch(e){}}}
  V.els.forEach(a=>{a.muted=true});vEmit()}
function vMute(on){if(!V.mic)return;V.muted=!!on;V.mic.getAudioTracks().forEach(t=>t.enabled=!on);const meta={pid:V.pid,muted:V.muted};
  if(hub&&hub.role==='host'){V.who[V.mic.id]=meta;vBroadcast()}else if(hub){try{hub.send({t:'vme',s:V.mic.id,v:meta})}catch(e){}}vEmit()}
const voice={start:vStart,stop:()=>vStop(false),mute:vMute,get on(){return V.on},get muted(){return V.muted},
  people:()=>Object.values(V.who).filter(Boolean).map(v=>({pid:v.pid,muted:!!v.muted,talking:!!V.lv[v.pid]&&!v.muted})),onchange(cb){V.cb=cb},talking:pid=>!!V.lv[pid]};

/* ---------------- QR codes: drawing them, and reading them with the camera ---------------- */
const loadScript=src=>new Promise((res,rej)=>{if(document.querySelector(`script[data-lan="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.dataset.lan=src;s.onload=res;s.onerror=()=>rej(new Error('Couldn’t load '+src));document.head.appendChild(s)});
async function qrSvg(text){await loadScript('qr.js');const q=window.qrcode(0,'L');q.addData(text,'Byte');q.make();const n=q.getModuleCount(),m=4;let d='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c+m} ${r+m}h1v1h-1z`;
  return `<svg class="lanqr" viewBox="0 0 ${n+2*m} ${n+2*m}" shape-rendering="crispEdges" role="img" aria-label="Pairing code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
/* camera scanner: uses the phone's built-in QR reader when it has one, otherwise a small reader that ships with the app */
async function scan(video,onText,want){const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});
  video.srcObject=stream;video.setAttribute('playsinline','');video.muted=true;await video.play().catch(()=>{});
  let det=null;try{if('BarcodeDetector' in window&&(await BarcodeDetector.getSupportedFormats()).includes('qr_code'))det=new BarcodeDetector({formats:['qr_code']})}catch(e){}
  if(!det)await loadScript('jsqr.js');
  const cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});let live=true,busy=false;
  const tick=async()=>{if(!live)return;if(!busy&&video.readyState>=2){busy=true;try{let t=null;
      if(det){const r=await det.detect(video);if(r&&r[0])t=r[0].rawValue}
      else{const w=video.videoWidth,h=video.videoHeight,s=Math.min(1,720/Math.max(w,h));cv.width=w*s|0;cv.height=h*s|0;cx.drawImage(video,0,0,cv.width,cv.height);
        const r=window.jsQR(cx.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height,{inversionAttempts:'dontInvert'});if(r)t=r.data}
      if(t&&(want||/FT[01]/).test(t)){live=false;onText(t)}}catch(e){}busy=false}if(live)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
  return ()=>{live=false;stream.getTracks().forEach(t=>t.stop());video.srcObject=null}}
/* asking for the camera early also lets the phone share its real local address with the other phone */
/* briefly open the camera so the browser shares this phone's Wi-Fi address; never wait more than 3 seconds for it */
async function warmCamera(){let s=null,late=false;const off=()=>{late=true;if(s)s.getTracks().forEach(t=>t.stop())};
  try{await Promise.race([navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(x=>{s=x;if(late)off()}),new Promise(r=>setTimeout(r,3000))])}catch(e){}
  return off}

window.FTLAN={voice,askLocal,lnaState,iceInfo,startHost,joinWith,stop,qrSvg,scan,warmCamera,pack,unpack,get hub(){return hub},id:myId,Store,hostFb};
try{window.lanReady&&window.lanReady()}catch(e){}
