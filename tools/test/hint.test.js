// 💡 hints: on your turn, each phone-played game suggests a move, and the game is unchanged afterwards.
const {chromium,W,ok,done,BASE}=require('./link.js');
const XF={hearts:'HTX',spades:'SDX',ohell:'OHX',rook:'RKX',rage:'RGX',uno:'UNX',golf:'GFX',skyjo:'SKX',gnome:'GNX',skipbo:'SBX',crowns:'FCX',phase10:'PTX',hf:'HX',canasta:'HX',mextrain:'MTX',chicken:'CFX',quacks:'QKX'};
const SK={hearts:'htg',spades:'sdg',ohell:'ohg',rook:'rkg',rage:'rgg',uno:'ung',golf:'gpg',skyjo:'gpg',gnome:'gpg',skipbo:'sbg',crowns:'fcg',phase10:'pzg',hf:'hpg',canasta:'hpg',mextrain:'mtg',chicken:'cfg',quacks:'qpg'};
(async()=>{const b=await chromium.launch();const G=(process.env.G||Object.keys(XF).join(',')).split(',');
  for(const g of G){const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));await page.goto(BASE);await W(1000);
    await page.evaluate(([g,xf])=>{window.__htfast=1;SET.toursOff=true;switchGame(g);resetScores();const X=eval(xf+'()');X.play=g==='rage'?true:1;S.players.forEach((q,i)=>{q.on=i<(g==='rook'||g==='hf'||g==='canasta'||g==='spades'?4:3);q.name=i<4?['Me','Bot A','Bot B','Bot C'][i]:'';if(i>0&&i<4)q.bot='normal';else delete q.bot});save();
      const x=document.createElement('button');x.dataset.a='start';x.hidden=true;document.body.appendChild(x);x.click();x.remove()},[g,XF[g]]);
    let got=null;
    for(let i=0;i<120&&!got;i++){await W(250);got=await page.evaluate(sk=>{const g=S[sk];if(!g)return null;if(S.game==='quacks'&&g.phase==='card'){qpSetCard(g,'');save();render()}{const f=[...document.querySelectorAll('[data-a=qpfc]')].find(b=>b.offsetParent&&!b.disabled);if(f)f.click()}document.querySelectorAll('[data-a=qpseen],[data-a=gplastok],[data-a=fcplastok]').forEach(b=>b.offsetParent&&b.click());
      const me=act()[0].id,mine=S.game==='quacks'?g.phase==='brew'&&g.pl[me]&&g.pl[me].sf!==false&&!g.pl[me].stop:(g.turn===me||g.bidTurn===me||g.phase==='bid'&&g.bids&&g.bids[me]===undefined||g.phase==='flip'&&g.need&&g.need[me]>0||g.phase==='pass'&&!(g.sel&&g.sel[me]&&g.sel[me].length===3));
      if(!mine)return null;const b=document.querySelector('[data-a=hint]');if(!b)return {nobtn:true};const before=JSON.stringify(g);b.click();const card=document.querySelector('.hintcard');return {txt:card&&card.textContent,same:JSON.stringify(S[sk])===before}},SK[g])}
    ok(`${g}: hint on your turn${got&&got.txt?' → '+got.txt.replace('Got it','').slice(0,80):''}`,got&&got.txt&&!/No hint|isn’t your turn|show up/.test(got.txt)&&got.same,got);
    ok(`${g}: no page errors`,!errs.length,errs.slice(0,2));await page.close()}
  await done(b)})();
