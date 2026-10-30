// Quacks: each ingredient book sells its chips at its own printed prices; Herb Witches allows 5 players on the phone.
const {chromium,W,ok,done,BASE}=require('./link.js');
(async()=>{const b=await chromium.launch();const page=await b.newPage({viewport:{width:400,height:850}});const errs=[];page.on('pageerror',e=>errs.push(e.message));
  await page.goto(BASE);await W(1200);
  const r=await page.evaluate(()=>{switchGame('quacks');resetScores();const X=QKX();X.play=1;X.herb=true;
    const at=bk=>{X.bk={...X.bk,...bk};return {y1:QPPRICE.y1,y4:QPPRICE.y4,g4:QPPRICE.g4,p1:QPPRICE.p1,u2:QPPRICE.u2,r1:QPPRICE.r1,k1:QPPRICE.k1,o1:QPPRICE.o1}};
    return {s1:at({green:'g1',red:'r1',yellow:'y1',blue:'u1',purple:'p1',black:'base'}),s3:at({green:'g3',red:'r3',yellow:'y3',blue:'u3',purple:'p3'}),hA:at({green:'hNext',red:'hHigh',yellow:'hDraw',blue:'hOrange',purple:'hBuy',black:'hFar'}),hB:at({green:'hDie',red:'hAside',yellow:'hRuby',blue:'hWhite',purple:'hPts'}),max:QKM().max}});
  ok('set 1 prices',JSON.stringify(r.s1)===JSON.stringify({y1:8,y4:18,g4:14,p1:9,u2:10,r1:6,k1:10,o1:3}),r.s1);
  ok('set 3 prices (green 4-chip 21, purple 10, blue 2-chip 8, red 1-chip 5)',r.s3.g4===21&&r.s3.p1===10&&r.s3.u2===8&&r.s3.r1===5,r.s3);
  ok('Herb Witches books: yellow draw-again 10/20, blue orange 15, purple extra shopping 9, black furthest 9',r.hA.y1===10&&r.hA.y4===20&&r.hA.u2===15&&r.hA.p1===9&&r.hA.k1===9,r.hA);
  ok('Herb Witches books: purple next-chip 16, blue white 1-chips 10, red set-aside 7',r.hB.p1===16&&r.hB.u2===10&&r.hB.r1===7,r.hB);
  ok('Herb Witches allows 5 players on the phone',r.max===5,r.max);
  ok('no page errors',!errs.length,errs);await done(b)})();
