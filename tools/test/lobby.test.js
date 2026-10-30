// Link phones first on the home screen, pick a game, invite: Join / Sit this one out / tap-to-add; nothing remembered.
const {mk,W,ok,done,click,act,chromium}=require('./link.js');
const st=p=>p.evaluate(()=>({game:S.game,screen:S.screen,me:S.lk&&S.lk.me,meName:S.lk&&S.lk.me&&(S.players.find(q=>q.id===S.lk.me)||{}).name,players:act().map(q=>q.name+(q.bot?'(bot)':'')),invite:luInvite(),sheet:!!document.querySelector('#lui-h'),strip:!!document.querySelector('.lustrip')}));
(async()=>{const browser=await chromium.launch();
  const H=await mk(browser,'host'),B=await mk(browser,'brad'),C=await mk(browser,'cam');
  await H.evaluate(()=>{switchGame('quacks');S.players.forEach((p,i)=>{p.on=i<3});S.players[0].name='Justin';S.players[1].name='Dice Bot';S.players[1].bot='normal';save();S.screen='home';render()});
  await click(H,'lkui','linkup');await H.fill('#lu-name','Justin');await click(H,'lustart','net');await W(4000);
  const code=await H.evaluate(()=>S.lk&&S.lk.code);ok('host is linked on the home screen',!!code&&(await st(H)).screen==='home');
  for(const [P,name] of [[B,'Brad'],[C,'Cam']]){await click(P,'lkui','join');await P.fill('#lk-code',code);await click(P,'lkjoin');await W(4000);
    ok(name+' asked for a name',await P.evaluate(()=>!!document.querySelector('#lu-gname')));await P.fill('#lu-gname',name);await click(P,'luname');await W(3000)}
  await W(2000);ok('host sees everyone linked',(await st(H)).players.join()==='Justin,Brad,Cam',(await st(H)).players);
  ok('host shows a QR code',await H.evaluate(()=>!!document.querySelector('.lkqr svg')));
  await click(H,'qpstart','1');await W(5000);const hs=await st(H);
  ok('host on setup, seated, with linked names to add',hs.game==='quacks'&&hs.screen==='map'&&hs.meName==='Justin'&&hs.strip,hs);
  ok('player list is just the linked people (no remembered bots)',hs.players.join()==='Justin,Brad,Cam',hs.players);
  ok('Brad gets an invite card',(await st(B)).sheet);
  await click(B,'luinv','join');await click(C,'luinv','sit');await W(5000);
  ok('Brad joined as Brad',(await st(B)).meName==='Brad');
  ok('Cam sat out and came off the list',(await st(H)).players.join()==='Justin,Brad',(await st(H)).players);
  ok('Cam sees the sitting-out screen',await C.evaluate(()=>luSitting()));
  await click(H,'luadd','Cam');await W(300);ok('tapping Cam adds him back',(await st(H)).players.join()==='Justin,Brad,Cam');
  await done(browser)})();
