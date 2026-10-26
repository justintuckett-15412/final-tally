/* Firebase storage for Final Tally family sync. These config values are public by design; the database rules protect the data. */
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getAuth,signInAnonymously,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {initializeFirestore,getFirestore,persistentLocalCache,persistentMultipleTabManager,doc,getDoc,setDoc,updateDoc,deleteDoc,collection,getDocs,onSnapshot} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {startSync} from './sync.js';
const app=initializeApp({apiKey:"AIzaSyCefypb0DpuHgwgp7RF3fhe6kxSSrC1cag",authDomain:"final-tally-12c6a.firebaseapp.com",projectId:"final-tally-12c6a",storageBucket:"final-tally-12c6a.firebasestorage.app",messagingSenderId:"55109323074",appId:"1:55109323074:web:fe3e1ec29ce5a9ee3ae0db"});
let db;try{db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}catch(e){db=getFirestore(app)}
const auth=getAuth(app);let readyP=null;
const ready=()=>readyP||(readyP=new Promise((res,rej)=>{const un=onAuthStateChanged(auth,u=>{un();if(u)res(u.uid);else signInAnonymously(auth).then(c=>res(c.user.uid),e=>{readyP=null;rej(e)})},e=>{readyP=null;rej(e)})}));
const ref=p=>doc(db,...p);
const fb={ready,
  when:ms=>new Date(ms),
  get:async p=>{const s=await getDoc(ref(p));return s.exists()?s.data():null},
  set:(p,d)=>setDoc(ref(p),d),
  update:(p,d)=>updateDoc(ref(p),d),
  watchDoc:(p,cb,ecb)=>onSnapshot(ref(p),s=>cb(s.exists()?s.data():null,s.metadata.hasPendingWrites),ecb),
  del:p=>deleteDoc(ref(p)),
  list:async p=>(await getDocs(collection(db,...p))).docs.map(d=>({id:d.id,data:d.data()})),
  watch:(p,cb,ecb)=>{let first=true;return onSnapshot(collection(db,...p),s=>{const pend=s.metadata.hasPendingWrites;
    const ch=s.docChanges().map(c=>({id:c.doc.id,data:c.type==='removed'?null:c.doc.data(),removed:c.type==='removed',local:c.type==='removed'?pend:c.doc.metadata.hasPendingWrites}));
    cb(ch,first,s.docs.map(d=>({id:d.id,data:d.data()})),s.metadata.fromCache);first=false},ecb)}};
window.FTFB=fb;startSync(fb);
