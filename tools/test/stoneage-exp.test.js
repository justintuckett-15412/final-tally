// Stone Age: The Expansion and the extra-pieces options, rule by rule.
const {mk,W,ok,done,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'p');const errs=[];P.on('pageerror',e=>errs.push(e.message));
  const setup=(n,mode)=>P.evaluate(([n,mode])=>{window.__htfast=1;switchGame('stoneage');resetScores();Object.assign(SAX(),{play:1,exp:0,bonus:0,mix:'none',mam:0},mode);S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cat','Dan','Eve'][i]||'';delete p.bot});S.started=true;S.screen='score';saDeal();return S.sag.ps},[n,mode]);
  const ev=f=>P.evaluate(f);let r;
  /* setup */
  await setup(5,{exp:1});
  r=await ev(()=>{const g=S.sag;return {slots:g.slots.length,nc:g.nc,j:g.ps.map(id=>g.me[id].j),piles:g.piles.length,vil:saVil(g),cost5:saCost(4)}});
  ok('expansion: 5 players, 5 card spaces, 45 cards, 5 hut piles',r.slots===5&&r.nc===45&&r.piles===5,r);
  ok('expansion: everyone starts with 1 tooth',r.j.every(v=>v===1),r.j);
  ok('expansion: the merchant is a village spot',r.vil.includes('merch'),r.vil);
  r=await ev(()=>{const g=S.sag,[a,b,c,d,e]=g.ps,o={};o.m=saPlace(g,a,'merch',2);o.t=saPlace(g,b,'tools',1);o.f=saPlace(g,c,'field',1);o.h=saPlace(g,d,'hut',2);return o});
  ok('5 players: all 4 village spots can be used',r.m&&r.t&&r.f&&r.h,r);
  await setup(4,{exp:1});
  r=await ev(()=>{const g=S.sag,[a,b,c,d]=g.ps,o={};o.m=saPlace(g,a,'merch',2);o.t=saPlace(g,b,'tools',1);o.f=saPlace(g,c,'field',1);o.h=saCanPlace(g,d,'hut');o.merch1=saPlace(g,d,'merch',1);return o});
  ok('4 players: only 3 of the 4 village spots',r.m&&r.t&&r.f&&r.h===0,r);
  await setup(3,{exp:1});
  r=await ev(()=>{const g=S.sag,[a,b,c]=g.ps,o={};o.m=saPlace(g,a,'merch',2);o.t=saPlace(g,b,'tools',1);o.f=saCanPlace(g,c,'field');return o});
  ok('3 players: only 2 of the 4 village spots',r.m&&r.t&&r.f===0,r);
  /* merchant visit */
  r=await ev(()=>{const g=S.sag,a=g.ps[0];g.phase='act';g.turn=a;g.todo={[a]:['merch']};g.pl={merch:{[a]:2}};const M=g.me[a];const j0=M.j;saResolve(g,a,'merch');return {mt:M.mt,dj:M.j-j0}});
  ok('merchant: 2 steps on the track and 2 jewelry',r.mt===2&&r.dj===2,r);
  /* hunting for jewelry */
  r=await ev(()=>{const g=S.sag,a=g.ps[0],M=g.me[a];g.phase='act';g.endAct=0;g.turn=a;g.todo={[a]:['forest']};g.roll={pid:a,loc:'hunt',n:3,dice:[6,6,5],used:[],uo:[]};const f0=M.food,j0=M.j;const bad=saTake(g,a,9);const okk=saTake(g,a,3);return {bad,okk,food:M.food-f0,j:M.j-j0}});
  ok('hunting: 17 pips = 8, split as 5 food and 3 jewelry',!r.bad&&r.okk&&r.food===5&&r.j===3,r);
  /* trading */
  r=await ev(()=>{const g=S.sag,a=g.ps[0],M=g.me[a];const id='h'+SAHUTS.findIndex(h=>h.c==='wwc');g.piles[0][0]=id;Object.assign(M,{w:0,c:1,s:4,g:0,j:0,mt:2});g.trd={};g.phase='act';g.turn=a;g.pay={pid:a,loc:'b0'};
    const o={w:2,c:1,s:0,g:0,j:0},o_={};o_.noTrade=saPayOk(g,o,{});o_.short=saPayOk(g,o,{s:3});o_.ok=saPayOk(g,o,{s:4});o_.buy=saBuy(g,a,o,{s:4});o_.left={...M};
    g.piles[1][0]=id;g.pay={pid:a,loc:'b1'};Object.assign(M,{w:0,c:1,s:4});o_.twice=saPayOk(g,o,{s:4});return o_});
  ok('trading at merchant 1–3: 2 for 1',!r.noTrade&&!r.short&&r.ok&&r.buy&&r.left.s===0&&r.left.c===0,r);
  ok('trading: only once per round',!r.twice,r);
  r=await ev(()=>{const g=S.sag,a=g.ps[1],M=g.me[a];const id='h'+SAHUTS.findIndex(h=>h.c==='ssg');g.piles[0][0]=id;Object.assign(M,{w:0,c:0,s:0,g:1,j:1,mt:9});g.trd={};g.pay={pid:a,loc:'b0'};
    return {one:saPayOk(g,{s:2,g:1},{j:1}),two:saPayOk(g,{s:2,g:1},{j:2})}});
  ok('trading at merchant 9–10: 1 for 2',r.one&&!r.two,r);
  r=await ev(()=>{const g=S.sag,a=g.ps[1],M=g.me[a];Object.assign(M,{w:0,c:0,s:0,g:0,j:2,mt:5});g.trd={};g.pay={pid:a,loc:'c1'};return {jPay:saPayOk(g,{j:2},{}),trade:saPayOk(g,{w:2},{j:2})}});
  ok('normal card spaces can’t take jewelry directly, but jewelry can be traded 1 for 1 at merchant 4–8',!r.jPay&&r.trade,r);
  /* 5th card space */
  r=await ev(()=>{const g=S.sag,a=g.ps[2],M=g.me[a];Object.assign(M,{j:6,mt:0});g.phase='act';g.turn=a;g.todo={[a]:['forest']};g.roll=g.pick=g.dc=null;g.trd={};g.pay={pid:a,loc:'c4'};const n0=M.cards.length;const o={};o.res=saPayOk(g,{w:3},{});o.extra=saBuy(g,a,{j:6},{},1);o.got=M.cards.length-n0;o.j=M.j;return o});
  ok('5th space: 3 jewelry, plus 3 more for the top card',!r.res&&r.extra&&r.got===2&&r.j===0,r);
  /* jewelry huts */
  r=await ev(()=>{const g=S.sag,a=g.ps[0],M=g.me[a];g.piles[0][0]='h'+SAHUTS.findIndex(h=>h.jv);Object.assign(M,{j:5});g.phase='act';g.turn=a;g.todo={[a]:['forest']};g.trd={};g.pay={pid:a,loc:'b0'};g.roll=g.dc=g.pick=null;const p0=M.pts;const five=saPayOk(g,{j:5},{});const b=saBuy(g,a,{j:3},{});return {five,b,pts:M.pts-p0}});
  ok('jewelry hut: 1–4 jewelry, 4 points each',!r.five&&r.b&&r.pts===12,r);
  /* tents */
  r=await ev(()=>{const g=S.sag,a=g.ps[0],b=g.ps[1],M=g.me[a];const id='h'+SAHUTS.findIndex(h=>h.tent==='w');g.piles[0][0]=id;Object.assign(M,{w:1,c:0,s:1,g:0,j:1});g.pay={pid:a,loc:'b0'};g.phase='act';g.trd={};
    const bought=saBuy(g,a,{w:1,s:1,j:1},{});g.phase='feed';g.fd={};g.fok={};saRoundEnd(g);const loc='T'+id;const o={bought,pts:M.bp[id],tents:M.tents};g.turn=a;g.first=a;
    o.other=saCanPlace(g,b,loc,1);o.own=saCanPlace(g,a,loc);o.place=saPlace(g,a,loc,3);g.phase='act';g.turn=a;g.todo={[a]:[loc]};g.roll=g.pay=g.pick=g.dc=null;saResolve(g,a,loc);o.div=g.roll&&saRollDiv(g.roll);o.res=g.roll&&g.roll.res;
    g.roll.dice=[4,4,3];const w0=M.w;saTake(g,a,0);o.wood=M.w-w0;return o});
  ok('tent: 8 points, then only its owner can gather there (up to 3)',r.bought&&r.pts===8&&r.other===0&&r.own===3&&r.place,r);
  ok('wood tent: 2 pips per wood (11 → 5 wood)',r.div===2&&r.res==='w'&&r.wood===5,r);
  /* dice with style */
  await setup(4,{exp:1});
  r=await ev(()=>{const g=S.sag,[a,b,c,d]=g.ps;g.phase='act';g.turn=a;g.todo={[a]:['forest']};g.roll=g.pay=g.pick=null;g.dc={by:a,dice:[3,6,1,2],order:[a,b,c,d],i:0,x:1};const M=g.me,o={};const pp=M[b].pp,f=M[c].food,j=M[d].j;
    o.a=saDie(g,a,0);o.pick=!!g.pick&&g.pick.pid===a;o.blocked=saDie(g,b,1);o.ch=saChoose(g,a,{g:1});o.b=saDie(g,b,1);o.c=saDie(g,c,2);o.d=saDie(g,d,3);o.pp=M[b].pp-pp;o.food=M[c].food-f;o.j=M[d].j-j;return o});
  ok('dice with style: 3 = a resource of your choice (play waits for it), 6 = a person, 1 = 2 food, 2 = 2 jewelry',r.a&&r.pick&&!r.blocked&&r.ch&&r.b&&r.c&&r.d&&r.pp===1&&r.food===2&&r.j===2,r);
  /* acorn huts */
  await setup(3,{exp:1,bonus:1});
  r=await ev(()=>{const g=S.sag,a=g.ps[0],M=g.me[a];const id='h'+SAHUTS.findIndex(h=>h.inc==='w');g.piles[0][0]=id;Object.assign(M,{w:3});g.pay={pid:a,loc:'b0'};g.phase='act';g.trd={};const p0=M.pts;const b=saBuy(g,a,{w:3},{});const pts=M.pts-p0;g.phase='feed';g.fd={};g.fok={};saRoundEnd(g);return {b,pts,w:M.w}});
  ok('acorn hut: 3 points and 1 wood at the start of every round',r.b&&r.pts===3&&r.w===1,r);
  /* final scoring */
  r=await ev(()=>{const kinds=['med','art','wri','pot','tim','tra','mus','wea','rin'],ids=kinds.map(k=>'c'+SACARDS.findIndex(c=>c.k===k));const mc='c'+SACARDS.findIndex(c=>c.s&&c.s.mc===2);
    const p=act()[0],M=S.sag.me[p.id];M.cards=[...ids,mc];M.mt=7;S.sag.phase='done';saSync(S.sag);return {f:p.sa.f,green:saGreen(p),sand:saSand(p)}});
  ok('final scoring: 9 kinds with rings = 81, merchants × merchant track (2 × 7)',r.green===81&&r.f.mc===2&&r.sand===14,r);
  /* the regular game with extra pieces */
  await setup(4,{exp:0,mix:'fit'});
  r=await ev(()=>{const g=S.sag,all=[...g.piles.flat()];return {J:g.x.J,slots:g.slots.length,nc:g.nc,leaf:all.filter(h=>saHut(h).L).map(h=>saHut(h).c),j:g.ps.map(id=>g.me[id].j),vil:saVil(g).length,pool:SAHUTS.filter((h,i)=>!h.L||h.O).length}});
  ok('pieces that fit: no jewelry, only the outhouse from the leaf huts, 4 card spaces, 36 cards',!r.J&&r.slots===4&&r.nc===36&&r.leaf.every(c=>c==='w')&&r.j.every(v=>!v)&&r.vil===3,r);
  await setup(4,{exp:0,mix:'jewel'});
  r=await ev(()=>{const g=S.sag;return {J:g.x.J,slots:g.slots.length,nc:g.nc,vil:saVil(g).length,j:g.ps.map(id=>g.me[id].j),max:saMaxP()}});
  ok('all with jewelry: 45 cards and jewelry, but 4 card spaces, no merchant spot, 4 players max',r.J&&r.slots===4&&r.nc===45&&r.vil===3&&r.j.every(v=>v===1)&&r.max===4,r);
  /* Mammoth Herd */
  await setup(3,{mam:1});
  r=await ev(()=>{const g=S.sag,[a,b,c]=g.ps,m=g.mam,on=m.on,loc=saResLoc(on),o={on,tiles:m.stack.length};o.pa=saPlace(g,a,loc,2);o.pb=saPlace(g,b,loc,1);o.pc=saCanPlace(g,c,loc)>0;
    const other=['forest','clay','quarry','river'].find(l=>l!==loc);g.turn=a;g.pl[other]={[a]:1};g.left[b]=5;g.turn=b;o.p2=saPlace(g,b,other,1);g.left[c]=5;g.turn=c;o.p3=saCanPlace(g,c,other);return o});
  ok('mammoth: 15 tiles left after the first, and all 3 players may gather on the herd’s resource',r.tiles===15&&r.pa&&r.pb&&r.pc,r);
  ok('mammoth: other resource spots keep the 3-player limit',r.p2&&r.p3===0,r);
  r=await ev(()=>{const g=S.sag,[a,b,c]=g.ps,m=g.mam,loc=saResLoc(m.on);m.cur=SAMAM.findIndex(t=>t.f.pts===10);m.on=SAMAM[m.cur].b;g.phase='act';g.turn=a;g.todo={[a]:[]};g.pl={};
    const A=g.me[a],B=g.me[b];A.food=3;B.food=5;g.roll={pid:a,loc:saResLoc(m.on),n:3,dice:[1,1,1],used:[],uo:[]};const o={};o.take=saTake(g,a,0);o.ask=!!g.mh&&g.mh.max===3;o.tooMany=saMamSend(g,a,4);o.send=saMamSend(g,a,2);o.food=A.food;
    m.hunt[b]=1;g.endAct=0;g.turn=c;g.todo={};const realR=Math.random;let i=0;const seq=[.99,.99,.5];Math.random=()=>seq[i++%3];g.endAct=1;saToFeed(g);Math.random=realR;o.win=g.mr&&g.mr.win;
    const p0=A.pts,q0=B.pts;o.pick=saMamPick(g,a,true);o.apts=A.pts-p0;o.bpts=B.pts-q0;o.won=(m.won[a]||[]).length;o.phase=g.phase;return o});
  ok('mammoth: after gathering there, send up to that many people, 1 food each',r.take&&r.ask&&!r.tooMany&&r.send&&r.food===1,r);
  ok('mammoth: highest die wins; winner takes 10 points and keeps the tile, the other gets 2 wood',r.win&&r.pick&&r.apts===10&&r.bpts===0&&r.won===1&&r.phase==='feed',r);
  r=await ev(()=>{const g=S.sag,[a,b,c]=g.ps;g.mam.won={[a]:[1,2],[b]:[3,4],[c]:[5]};g.phase='feed';g.fd={};g.fok={};g.end='huts';saRoundEnd(g);return act().slice(0,3).map(p=>saMam10(p))});
  ok('mammoth: the most tiles scores 10, ties all score 10',JSON.stringify(r)==='[10,10,0]',r);
  /* screens: the setup switches and the board */
  await P.evaluate(()=>{switchGame('stoneage');resetScores();Object.assign(SAX(),{play:1,exp:1,bonus:1,mix:'none'});S.players.forEach((p,i)=>{p.on=i<5;p.name=['Ann','Bob','Cat','Dan','Eve'][i]||'';if(i)p.bot='normal';else delete p.bot});S.started=false;S.screen='map';render()});await W(300);
  ok('setup shows the expansion switches',await ev(()=>!!document.querySelector('[data-a="satg"][data-k="exp"]')&&!!document.querySelector('[data-a="satg"][data-k="bonus"]')));
  await P.screenshot({path:'/tmp/sa-exp-setup.png',fullPage:true});
  await P.evaluate(()=>{S.started=true;S.screen='score';delete S.sag;render()});for(let t=0;t<30;t++)await W(100);
  await P.evaluate(()=>{const s=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Skip');if(s)s.click()});await W(200);
  ok('board shows the merchant and 5 card spaces',await ev(()=>!!document.querySelector('.sa-merch')&&document.querySelectorAll('.saslot').length===5));
  await P.screenshot({path:'/tmp/sa-exp-board.png',fullPage:true});
  ok('no page errors',!errs.length,errs.slice(0,3));
  await done(browser)})();
