// Stress test for every game the phone plays: random players and bots, a person tapping at random,
// catches page errors and stuck games; LINK=1 runs on two linked phones and checks both agree at the end.
// Usage: G=hearts,uno N=2 MIN=5 node allfuzz.js
const {chromium,mk,W,ok,done,BASE}=require('./link.js');
const ALL='hearts,spades,ohell,rook,uno,golf,skyjo,gnome,skipbo,crowns,phase10,hf,canasta,nerts,tripoley,mextrain,chicken,yahtzee';
const GAMES=(process.env.G||ALL).split(','),N=+(process.env.N||1),LINK=!!process.env.LINK,MIN=+(process.env.MIN||6);
const XF={hearts:'HTX',spades:'SDX',ohell:'OHX',rook:'RKX',rage:'RGX',uno:'UNX',golf:'GFX',skyjo:'SKX',gnome:'GNX',skipbo:'SBX',crowns:'FCX',phase10:'PTX',hf:'HX',canasta:'HX',nerts:'NX',tripoley:'TPX',mextrain:'MTX',chicken:'CFX',quacks:'QKX',yahtzee:'YZX'};
const PMAX={rook:4,hf:6,canasta:6,nerts:4,tripoley:6,hearts:6,spades:5,uno:6,yahtzee:4};
const stateOf=()=>{const g={uno:S.ung,golf:S.gpg,skyjo:S.gpg,gnome:S.gpg,hearts:S.htg,spades:S.sdg,ohell:S.ohg,rook:S.rkg,rage:S.rgg,skipbo:S.sbg,crowns:S.fcg,phase10:S.pzg,hf:S.hpg,canasta:S.hpg,nerts:S.nrg,tripoley:S.tqg,mextrain:S.mtg,chicken:S.cfg,quacks:S.qpg,yahtzee:{d:S.yzd,r:S.yzr,t:S.yzt}}[S.game];
  const sc=act().map(p=>JSON.stringify(Object.keys(p).filter(k=>!['name','color','id','bot','on'].includes(k)).map(k=>p[k]))).join('|');
  let h=0;const str=JSON.stringify(g||null)+sc;for(let i=0;i<str.length;i+=7)h=(h*31+str.charCodeAt(i))|0;return {h,fin:!!S.finished,scr:S.screen,r:g&&g.r,ph:g&&g.phase}};

// ---- referees: independent rule checks installed in the host page ----
const referee=game=>{window.__bad=[];const bad=m=>{if(window.__bad.length<30&&!window.__bad.includes(m))window.__bad.push(m)};window.__chk=0;
  const RK='23456789TJQKA';const rk=c=>RK.indexOf(c[0]);
  const wrapPlay=(name,getG,check)=>{const o=window[name];if(!o)return;window[name]=function(pid,c){const g=getG();const before=g&&g.h[pid]?g.h[pid].slice():[],t=g?g.t.map(x=>({...x})):[],n=g&&g.n,br=g&&g.broken,lead=g&&g.lead,turn=g&&g.turn;
    const r=o.apply(this,arguments);if(r){window.__chk++;if(turn!==pid)bad(`${nmid(pid)} played out of turn`);if(!before.includes(c))bad(`${nmid(pid)} played ${c} not in hand`);check({g,pid,c,before,t,n,br,lead})}return r}};
  const wrapCollect=(name,getG,winner)=>{const o=window[name];if(!o)return;window[name]=function(g){const t=g.t.map(x=>({...x})),w=winner(g,t);const r=o.apply(this,arguments);const got=g.last&&g.last.w;if(got!==w)bad(`trick ${t.map(x=>x.c).join(' ')} went to ${nmid(got)}, should be ${nmid(w)}`);return r}};
  const follow=(su)=>({g,pid,c,before,t})=>{if(!t.length)return;const led=su(t[0].c,g);if(su(c,g)!==led&&before.some(x=>su(x,g)===led))bad(`${nmid(pid)} played ${c} on a ${led} lead while holding ${led}`)};
  const hiOf=(t,pool)=>pool.reduce((a,x)=>rk(x.c)>rk(a.c)?x:a,pool[0]).p;
  if(game==='hearts'){wrapPlay('htPlayCard',()=>S.htg,a=>{follow(c=>c[1])(a);const {g,pid,c,before,t,n,br,lead}=a,X=HTX();
      if(!t.length&&n===0&&lead&&before.includes(lead)&&c!==lead)bad(`first lead should be ${lead}, ${nmid(pid)} led ${c}`);
      if(!t.length&&!br&&c[1]==='H'&&before.some(x=>x[1]!=='H')&&!(n===0&&lead===c))bad(`${nmid(pid)} led a heart before hearts were broken`);
      if(t.length&&n===0&&!X.firstPts&&(c[1]==='H'||c==='QS')&&!before.some(x=>x[1]===t[0].c[1])&&before.some(x=>x[1]!=='H'&&x!=='QS'))bad(`${nmid(pid)} dumped points (${c}) on the first trick`)});
    wrapCollect('htCollect',()=>S.htg,(g,t)=>hiOf(t,t.filter(x=>x.c[1]===t[0].c[1])))}
  if(game==='spades'){wrapPlay('sdPlayCard',()=>S.sdg,a=>{follow(c=>c[1])(a);const {g,pid,c,before,t,n,br,lead}=a;if(!t.length&&!br&&c[1]==='S'&&before.some(x=>x[1]!=='S')&&!(n===0&&lead===c))bad(`${nmid(pid)} led a spade before spades were broken`)});
    wrapCollect('sdCollect',()=>S.sdg,(g,t)=>{const sp=t.filter(x=>x.c[1]==='S');return hiOf(t,sp.length?sp:t.filter(x=>x.c[1]===t[0].c[1]))})}
  if(game==='ohell'){wrapPlay('ohPlayCard',()=>S.ohg,follow(c=>c[1]));
    wrapCollect('ohCollect',()=>S.ohg,(g,t)=>{const tp=t.filter(x=>x.c[1]===g.tr);return hiOf(t,tp.length?tp:t.filter(x=>x.c[1]===t[0].c[1]))})}
  if(game==='rook'){const su=(c,g)=>c==='X'?(g.trump||'X'):c[0];
    wrapPlay('rkPlayCard',()=>S.rkg,a=>{const {g,pid,c,before,t}=a;if(!t.length)return;const led=su(t[0].c,g);if(su(c,g)!==led&&before.some(x=>su(x,g)===led)&&!(c==='X'&&RKX().rookAny))bad(`${nmid(pid)} played ${c} on a ${led} lead while holding ${led}`)});
    wrapCollect('rkCollect',()=>S.rkg,(g,t)=>{const tr=g.trump,tp=t.filter(x=>su(x.c,g)===tr),pool=tp.length?tp:t.filter(x=>su(x.c,g)===su(t[0].c,g));return pool.reduce((a,x)=>rkRank(x.c)>rkRank(a.c)?x:a,pool[0]).p})}
};
const SKEY={uno:'ung',golf:'gpg',skyjo:'gpg',gnome:'gpg',hearts:'htg',spades:'sdg',ohell:'ohg',rook:'rkg',skipbo:'sbg',crowns:'fcg',phase10:'pzg',hf:'hpg',canasta:'hpg',tripoley:'tqg',mextrain:'mtg',chicken:'cfg'};
const audit=([game,sk,prev])=>{const g=S[sk];const out=(window.__bad||[]).slice();if(!g||!g.h)return {out,prev};
  const SKIP=new Set(['lg','ann','last','took','tookR3','need','got','from','msg','pend','shout','catch','drawn','pkres','show','lead','up','five','one','hzf','hzby','win','out','ender','wt']);
  const ids={},walk=(v,path)=>{if(v&&typeof v==='object'&&!Array.isArray(v)&&v.gone===true&&'c' in v)return;if(typeof v==='string'){if(/#\d+$/.test(v)||(!/#/.test(v)&&['hearts','spades','ohell','rook'].includes(game)&&path.length>1))(ids[v]=ids[v]||[]).push(path.join('.'));return}if(Array.isArray(v))v.forEach((x,i)=>walk(x,path.concat(i)));else if(v&&typeof v==='object')for(const k in v){if(path.length===0&&SKIP.has(k))continue;if(['hearts','spades','ohell','rook'].includes(game)&&path.length===0&&!['h','t','tk','played','kitty','nest','disc','won'].includes(k))continue;if(game==='rook'&&k==='won')continue;if(game==='crowns'&&k==='lay'&&path.length===0)continue;if(game==='hearts'&&k==='played')continue;walk(v[k],path.concat(k))}};
  walk(g,[]);
  if(game==='mextrain'||game==='chicken'){const norm=(a,b)=>Math.min(a,b)+'-'+Math.max(a,b);const dk={};for(const k in ids){const m=k.match(/^(\d+)-(\d+)#/);if(m)(dk[norm(+m[1],+m[2])]=dk[norm(+m[1],+m[2])]||[]).push(ids[k][0]);delete ids[k]}
    const lines=game==='mextrain'?Object.entries(g.tr||{}).map(([k,t])=>[k,t.t||[]]):(g.lines||[]).map((l,i)=>['line'+i,l.t||[]]);
    lines.forEach(([k,t])=>t.forEach((x,i)=>{if(game==='chicken'||i>0||k!=='__'){(dk[norm(x[0],x[1])]=dk[norm(x[0],x[1])]||[]).push('train '+k)}}));
    for(const d in dk){const L=dk[d].filter((x,i)=>!(x.startsWith('train')&&i>0&&dk[d][i-1]===x&&false));if(dk[d].length>1)out.push(`domino ${d} in two places: ${dk[d].slice(0,3).join(', ')} (r${g.r+1})`)}
    for(const d in dk)ids[d]=dk[d]}
  if(['hearts','spades','ohell','rook'].includes(game)){for(const k in ids)if(!/^([2-9TJQKA][SHDC]|[RGYB]\d+|X)$/.test(k))delete ids[k]}
  for(const k in ids)if(ids[k].length>1)out.push(`card ${k} in two places: ${ids[k].slice(0,3).join(', ')} (r${g.r+1} ${g.phase})`);
  const n=Object.keys(ids).filter(k=>!(game==='gnome'&&/^H#/.test(k))).length,key=g.r+':'+(game==='spades'||game==='ohell'?'x':'');let now=prev;
  const idl=Object.keys(ids);if(!prev||prev.key!==key)now={key,n,ids:idl,where:ids};else if(n!==prev.n&&g.phase!=='done'&&g.phase!=='deal'){const gone=prev.ids.filter(k=>!ids[k]&&!(game==='gnome'&&/^H#/.test(k)));out.push(`card count changed ${prev.n}→${n} (r${g.r+1} ${g.phase})${gone.length?' missing '+gone.slice(0,3).map(k=>k+' (was '+(prev.where[k]||[]).join('/')+')').join(', '):''} msg: ${String(g.msg||'').slice(0,90)}`)}
  if(game==='spades'&&g.phase==='done'){const t=Object.values(g.won).reduce((a,b)=>a+b,0);if(t!==g.per)out.push(`${t} tricks taken in a ${g.per}-card hand`)}
  if(game==='ohell'&&g.phase==='done'){const t=Object.values(g.won).reduce((a,b)=>a+b,0);if(t!==(g.played||[]).length/act().length)out.push(`${t} tricks for ${(g.played||[]).length/act().length} cards`)}
  if(game==='hearts'&&g.phase==='done'){const all=Object.values(g.tk).flat();const h=all.filter(c=>c[1]==='H').length,q=all.filter(c=>c==='QS').length;if(h!==13||q!==1)out.push(`hand ended with ${h} hearts and ${q} Queens of spades taken`)}
  if(game==='rook'&&g.phase==='done'){const all=Object.values(g.won).flat(),pts=all.reduce((a,c)=>a+rkVal(c),0)+(+RKX().last||0);const tot=rkTeamPts(g,0)+rkTeamPts(g,1);if(tot!==pts)out.push(`team points ${tot} but counters taken add to ${pts}`)}
  return {out,prev:now}};
const tapper=()=>{
  if((S.game==='mextrain'||S.game==='chicken')&&Math.random()<.7){const CF=S.game==='chicken',g=CF?cfG():mtG(),V=CF?cfViewer():mtViewer();if(g&&V&&g.turn===V.id&&g.h[V.id]){const opts=g.h[V.id].map(t=>[t,CF?cfSpots(g,V.id,t):mtTargets(g,V.id,t)]).filter(x=>x[1].length);if(opts.length){const [t,ks]=opts[Math.floor(Math.random()*opts.length)],k=ks[Math.floor(Math.random()*ks.length)];const b=document.querySelector(`[data-a=${CF?'cfpspot':'mtptrain'}][data-k="${k}"]`);if(b){if(CF)CFSEL=t;else MTSEL=t;b.click();return 'dom'}}}}
  for(const v of ['HPSEL','PZSEL','FCSEL','DOSSEL']){try{const a=eval(v);if(Array.isArray(a)&&a.length>1&&Math.random()<.3)eval(v+'=a.slice(0,1)')}catch(e){}}
  try{if(MTSEL&&Math.random()<.15)MTSEL=null}catch(e){}try{if(CFSEL&&Math.random()<.15)CFSEL=null}catch(e){}
  if(S.game==='mextrain'&&typeof MTSEL!=='undefined'&&!MTSEL&&document.querySelector('[data-a=mtptrain]')&&Math.random()<.6){const V=mtViewer(),g=mtG();if(V&&g&&g.h[V.id]&&g.h[V.id].length)MTSEL=g.h[V.id][Math.floor(Math.random()*g.h[V.id].length)]}
  if(S.game==='chicken'&&typeof CFSEL!=='undefined'&&!CFSEL&&document.querySelector('[data-a=cfpspot]')&&Math.random()<.6){const V=cfViewer(),g=cfG();if(V&&g&&g.h[V.id]&&g.h[V.id].length)CFSEL=g.h[V.id][Math.floor(Math.random()*g.h[V.id].length)]}
  if(S.game==='crowns'&&typeof FCSEL!=='undefined'&&FCSEL.length>1&&Math.random()<.3)FCSEL=FCSEL.slice(0,1);
  if(S.game==='phase10'&&typeof PZSEL!=='undefined'&&PZSEL.length>1&&Math.random()<.3)PZSEL=PZSEL.slice(0,1);const deny=/^(go|rules|undo|dash|lk(?!vote)|rx|cb|hosort|ho2row|share|home|set|abandon|rematch|back|tab|nxjump|rghand|htpmode|.*mode$|.*setup|.*start$|qkwrand|gnew|playagain|newgame|lpopen|lp$|tour|toast|sfx|theme|hpview|.*rules$|.*hist|.*sheet$|.*guide)/;
  const vis=[...document.querySelectorAll('#app [data-a], .sheet [data-a], .glann [data-a]')].filter(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&b.offsetParent);
  let c=vis.filter(b=>{const a=b.dataset.a;if(a==='finish'||a==='revstart')return /reveal|results|see|finish/i.test(b.textContent)&&!/end game/i.test(b.textContent);return !deny.test(a)});
  if(!c.length)return '';const pri=c.filter(b=>/show|seen|ok|next|deal|lpclose|finish|revstart|pass$|ready|confirm|lock/.test(b.dataset.a));
  const pick=pri.length&&Math.random()<.5?pri[Math.floor(Math.random()*pri.length)]:c[Math.floor(Math.random()*c.length)];pick.click();return pick.dataset.a};
(async()=>{const browser=await chromium.launch();
  for(const game of GAMES)for(let gi=0;gi<N;gi++){const errs=[];let pages;
    if(!LINK){const p=await browser.newPage({viewport:{width:400,height:850}});await p.goto(BASE);await W(1200);pages=[p]}
    else pages=[await mk(browser,'ah'+game+gi),await mk(browser,'ag'+game+gi)];
    pages.forEach((p,i)=>p.on('pageerror',e=>errs.push((i?'guest: ':'')+e.message)));
    const H=pages[0];
    const info=await H.evaluate(([game,xf,pmax,link])=>{window.__htfast=1;SET.toursOff=true;switchGame(game);resetScores();const X=eval(xf+'()');if(game==='yahtzee')X.roller=1;else X.play=1;
      const mm=M(),lo=Math.max(2,mm.min||2),hi=Math.min(pmax||6,mm.max||6);let np=lo+Math.floor(Math.random()*(hi-lo+1));if((game==='canasta'||game==='hf')&&np===5)np=4;const humans=link?2:[0,1,1,2][Math.floor(Math.random()*4)];
      const P=S.players;P.forEach((p,i)=>{p.on=i<np;p.name=i<np?(i<humans?'Human'+(i+1):'Bot'+i):'';if(i>=humans&&i<np)p.bot=['easy','normal','hard'][Math.floor(Math.random()*3)];else delete p.bot});save();
      const b=document.createElement('button');b.dataset.a='start';b.hidden=true;document.body.appendChild(b);b.click();b.remove();return {np,humans,ids:P.slice(0,2).map(p=>p.id)}},[game,XF[game],PMAX[game],LINK]);
    if(LINK){const G=pages[1];await G.evaluate(()=>{window.__htfast=1;SET.toursOff=true});await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk.code);await H.evaluate(id=>lkPick(id),info.ids[0]);await G.evaluate(c=>lkJoin(c),code);await W(3000);await G.evaluate(id=>lkPick(id),info.ids[1]);await W(2000)}
    await H.evaluate(referee,game);let aprev=null;const bad=[];
    let last=null,lastT=Date.now(),t0=Date.now(),stuck=null,taps=0,changes=0;
    while(Date.now()-t0<MIN*60e3){const s=await H.evaluate(stateOf);{const a=await H.evaluate(audit,[game,SKEY[game],aprev]);aprev=a.prev;for(const o of a.out)if(!bad.includes(o))bad.push(o)}if(s.fin)break;
      if(last===null||s.h!==last){last=s.h;lastT=Date.now();changes++}
      if(Date.now()-lastT>60e3){stuck=JSON.stringify(s)+(game==='mextrain'?' MT '+await H.evaluate(()=>{const g=S.mtg;const t=g.turn;return JSON.stringify({turn:nmid(t),bot:(act().find(p=>p.id===t)||{}).bot,h:g.h[t],fits:(g.h[t]||[]).map(x=>x+':'+mtTargets(g,t,x).join('/')),need:g.need,bonus:g.bonus,bt:g.bt,pl:g.pl,first:g.first,msg:g.msg,yard:(g.yard||g.bone||[]).length})}):'')+(['hf','canasta'].includes(game)?' HP '+await H.evaluate(()=>{const g=S.hpg;return JSON.stringify({turn:nmid(g.turn),drew:g.drew,need:g.need,took:g.took,h:g.h[g.turn],inF:g.inF[g.turn],down:g.down[hpSide(g,g.turn)],can:hpCanGoOut(g,hpSide(g,g.turn)),sel:HPSEL,frozen:g.frozen,disc:g.disc.slice(-3)})}):'')+' host btns: '+(await H.evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a))].join(' ')))+(LINK?' | guest btns: '+(await pages[1].evaluate(()=>[...new Set([...document.querySelectorAll('[data-a]')].filter(b=>!b.disabled&&b.offsetParent).map(b=>b.dataset.a))].join(' '))):'');break}
      for(const p of pages){if(await p.evaluate(tapper))taps++}await W(120)}
    await W(LINK?4000:300);
    const sum=p=>p.evaluate(()=>({fin:!!S.finished,scr:S.screen,tot:act().map(q=>nm(q)+' '+(typeof totals==='function'?'':'')+JSON.stringify((q.rounds||q.hands||q.rg||q.qk||[]).length))}));
    const a=await sum(H);let agree=true,b=null;if(LINK&&a.fin){b=await sum(pages[1]);agree=b.fin}
    const res=a.fin?'finished':stuck?'STUCK':'still going after '+MIN+' min';
    ok(`${LINK?'linked ':''}${game} ${gi+1}: ${info.np}p ${info.humans}h → ${res} (${changes} changes, ${taps} taps, ${await H.evaluate(()=>window.__chk||0)} cards refereed)`,!stuck&&!errs.length&&agree&&!bad.length,{bad:bad.slice(0,8),stuck:stuck&&stuck.slice(0,1200),errs:[...new Set(errs)].slice(0,4),guestFinished:b&&b.fin});
    for(const p of pages)await p.context().close().catch(()=>{})}
  await done(browser)})();
