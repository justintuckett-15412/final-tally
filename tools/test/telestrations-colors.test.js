// Telestrations "Pen colors" house rule over linked phones.
// Colors on: the setup option is remembered, the pad shows 8 swatches, phones draw in red/blue/green, and the guesser's view,
// the Big Reveal and the big board all show those colors. Black only (official): no color row, strokes are black.
// Old (colorless) sketch strings still decode and render black. Screenshots of the pad at 400x850 and 360x640.
process.env.LAT=process.env.LAT||'80';process.env.JIT=process.env.JIT||'80';
const {mk,W,ok,done,chromium}=require('./link.js');
const fs=require('fs');const SHOT=process.env.SHOTS||'/tmp/ts-shots';fs.mkdirSync(SHOT,{recursive:true});
const RED='#e5262d',BLUE='#1f6fd6',GREEN='#2e9e3f';
async function setup(browser,names,o){const PG=[];for(const n of names)PG.push(await mk(browser,n));const H=PG[0];
  const r=await H.evaluate(([N,o])=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};
    c('tsstart','1');c('tsscoring','friendly');c('tstimer','0');
    const seg=!!document.querySelector('[data-a=tspens][data-k="1"]');c('tspens',o.colors?'1':'0');
    const P=S.players;P.forEach((p,i)=>{p.on=i<N.length;p.name=N[i]||'';delete p.bot});save();
    const saved=JSON.parse(localStorage.getItem(KEY+'.tsx')||'{}').colors;const pressed=(document.querySelector('[data-a=tspens][aria-pressed=true]')||{dataset:{}}).dataset.k;
    c('start');return {ids:P.slice(0,N.length).map(p=>p.id),seg,saved,pressed}},[names,o]);
  await H.evaluate(()=>lkHostStart());await W(2500);const code=await H.evaluate(()=>S.lk&&S.lk.code);await H.evaluate(id=>lkPick(id),r.ids[0]);await W(500);
  for(let i=1;i<names.length;i++){await PG[i].evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await PG[i].evaluate(id=>lkPick(id),r.ids[i]);await W(800)}
  const TV=await mk(browser,'TVc'+names.length+o.colors);await TV.evaluate(c=>{window.__htfast=1;SET.toursOff=true;lkJoin(c)},code);await W(2500);await TV.evaluate(()=>lkPick(''));
  await W(1500);return {PG,H,TV,...r}}
const G=H=>H.evaluate(()=>JSON.parse(JSON.stringify(S.tsg)));
async function pickAll(PG,ids,H){for(let n=0;n<20;n++){const g=await G(H);if(g.phase!=='pick')return g;
  for(let i=0;i<PG.length;i++){if(g.books[ids[i]].word)continue;const p=PG[i];const m=await p.evaluate(()=>({fx:!!document.getElementById('tsfx'),b:!!document.querySelector('[data-a=tsuword]')}));
    if(m.fx)await p.evaluate(v=>{const i=document.getElementById('tsin');i.value=v;document.querySelector('#tsform button[type=submit]').click()},'Zibble'+i);else if(m.b)await p.evaluate(()=>document.querySelector('[data-a=tsuword]').click())}
  await W(900)}return G(H)}
async function stroke(p,x0,y0,x1,y1){const b=await p.evaluate(()=>{const r=document.querySelector('#tsdraw canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});
  await p.mouse.move(b.x+b.w*x0,b.y+b.h*y0);await p.mouse.down();await p.mouse.move(b.x+b.w*x1,b.y+b.h*y1,{steps:8});await p.mouse.up()}
const swatch=(p,i)=>p.evaluate(i=>document.querySelector(`#tsdraw .tsdcolors [data-c="${i}"]`).click(),i);
const padInfo=p=>p.evaluate(()=>{const L=document.getElementById('tsdraw'),cr=L&&L.querySelector('.tsdcolors');return {show:!!(L&&!L.hidden),row:!!(cr&&!cr.hidden),n:cr?cr.querySelectorAll('[data-c]').length:0,
  hmin:cr?Math.min(...[...cr.querySelectorAll('[data-c]')].map(b=>b.getBoundingClientRect().height)):0,on:cr?[...cr.querySelectorAll('.on')].map(b=>b.dataset.c):[],st:typeof tsPadState==='function'?tsPadState():null}});
const svgColors=(p,sel)=>p.evaluate(sel=>[...document.querySelectorAll(sel+' svg path')].map(e=>e.getAttribute('stroke')),sel);
/* does everything (word box, page, tools, colors, Done) fit on screen, with no part of the canvas scrolled off? */
const fits=p=>p.evaluate(()=>{const L=document.getElementById('tsdraw'),r=s=>L.querySelector(s).getBoundingClientRect(),H=innerHeight;
  const parts=['.tsdword','.tsdpage','.tsdtools','.tsdcolors','.tsddone'].map(s=>{const b=r(s);return {s,top:Math.round(b.top),bot:Math.round(b.bottom)}});
  return {ok:parts.every(x=>x.top>=0&&x.bot<=H)&&L.scrollHeight<=L.clientHeight+1,parts,H,page:Math.round(r('.tsdpage').width)}});
(async()=>{const browser=await chromium.launch();const errs=[];
  /* ---- Colors on ---- */
  {const {PG,H,TV,ids,seg,saved,pressed}=await setup(browser,['Mom','Dad','Kate','Sam'],{colors:true});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('col'+i+': '+e.message)));
    ok('Setup: a “Pen colors” option, remembered per game (saved settings) and pressed',seg&&saved===1&&pressed==='1',{seg,saved,pressed});
    let g=await pickAll(PG,ids,H);ok('Colors on is stored on the dealt game',g.colors===true&&g.phase==='play',{c:g.colors,ph:g.phase});
    for(let t=0;t<30;t++){if((await Promise.all(PG.map(padInfo))).every(x=>x.show))break;await W(300)}
    const pi=await padInfo(PG[1]);ok('The pad shows a color row: 8 swatches, at least 40px tall, black selected',pi.show&&pi.row&&pi.n===8&&pi.hmin>=40&&pi.on.join()==='0',pi);
    await W(300);await PG[1].screenshot({path:`${SHOT}/pad-colors-400x850.png`});
    /* each phone: a red stroke, a blue stroke, a green one, an eraser swipe, then Done */
    for(let i=0;i<4;i++){const p=PG[i];await swatch(p,1);await stroke(p,.15,.2,.8,.3);await swatch(p,5);await stroke(p,.2,.6,.7,.8);
      if(i===1){await p.evaluate(()=>document.querySelector('#tsdraw [data-t=erase]').click());await stroke(p,.1,.9,.3,.9);await swatch(p,4)}else await swatch(p,4);
      await stroke(p,.5,.1,.5,.5);
      if(i===1){const st=await padInfo(p);ok('Tapping a color after the eraser goes back to the pen; strokes keep their colors',st.st.used.sort().join()==='1,4,5'&&st.st.strokes===4&&st.st.color===4&&st.on.join()==='4',st.st)}
      if(i===2){await p.setViewportSize({width:360,height:640});await W(400);const f=await fits(p);ok('360×640 phone: word, page, tools, colors and Done all fit with nothing scrolled off',f.ok,f);await p.screenshot({path:`${SHOT}/pad-colors-360x640.png`});await p.setViewportSize({width:400,height:850});await W(300)}
      if(i===1){const f=await fits(p);ok('400×850 phone: everything fits',f.ok,f)}
      await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click());await W(300)}
    await W(1500);g=await G(H);
    const dec=await H.evaluate(()=>Object.values(S.tsg.books).map(B=>[...new Set(tsDec(B.pages[0].d).filter(s=>!s.e).map(s=>s.c))].sort().join()));
    ok('Sent sketches keep their colors (red, green, blue in every book)',g.step===1&&dec.every(x=>x==='1,4,5'),{step:g.step,dec});
    /* the guesser's view */
    const gv=await svgColors(PG[1],'#app [data-tspg]');ok('The guesser sees the sketch in color',gv.includes(RED)&&gv.includes(BLUE)&&gv.includes(GREEN),gv);
    await PG[1].screenshot({path:`${SHOT}/guess-colors.png`});
    /* guess, draw (plain black on one phone), guess */
    for(const step of [1,2,3]){g=await G(H);for(let i=0;i<4;i++){const p=PG[i];
        if(step%2)await p.evaluate(v=>{const i=document.getElementById('tsin');if(!i)return;i.value=v;document.querySelector('#tsform button[type=submit]').click()},'Guess'+step+'x'+i);
        else{await stroke(p,.3,.3,.7,.7);if(i!==0){await swatch(p,7);await stroke(p,.3,.7,.7,.3)}await p.evaluate(()=>document.querySelector('#tsdraw .tsddone').click())}
        await W(250)}await W(1500)}
    g=await G(H);ok('Round reaches the Big Reveal',g.phase==='reveal',g.phase);
    /* reveal: owner flips to page 1 (the first sketch); every screen shows it in color */
    const owner=g.ps[g.rv.i],op=PG[ids.indexOf(owner)];await op.evaluate(()=>document.querySelector('[data-a=tsunext]').click());await W(1500);
    const rv=[];for(const p of [...PG,TV])rv.push(await svgColors(p,'#app .tspage'));
    ok('Big Reveal: every phone and the big board show the sketch in color',rv.every(c=>c.includes(RED)&&c.includes(BLUE)),rv.map(c=>[...new Set(c)].join(' ')));
    await TV.screenshot({path:`${SHOT}/bigboard-reveal-colors.png`});
    while(true){const gg=await G(H);if(gg.rv.p>=gg.books[owner].pages.length-1)break;await op.evaluate(()=>{const b=document.querySelector('[data-a=tsunext]');if(b)b.click()});await W(700)}
    await W(800);const whole=await svgColors(TV,'#app .tswhole');ok('End of the book: the whole-book view shows the colors (incl. the brown sketch)',whole.includes(RED)&&whole.includes('#7a4a24')&&whole.includes('#111111'),[...new Set(whole)]);
    await op.screenshot({path:`${SHOT}/reveal-whole-colors.png`,fullPage:true});
    /* Back to our usual rules: black only is the default */
    const def=await H.evaluate(()=>TSDEF.colors);ok('Official default is Black only',def===0,def);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  /* ---- Black only ---- */
  {const {PG,H,TV,ids,saved}=await setup(browser,['Ann','Bob','Cy','Di'],{colors:false});[...PG,TV].forEach((p,i)=>p.on('pageerror',e=>errs.push('blk'+i+': '+e.message)));
    const g=await pickAll(PG,ids,H);for(let t=0;t<30;t++){if((await padInfo(PG[2])).show)break;await W(300)}const pi=await padInfo(PG[2]);
    ok('Black only: saved off, the game has no colors, and the pad has no color row',saved===0&&!g.colors&&pi.show&&!pi.row,{saved,c:g.colors,pi});
    await stroke(PG[2],.2,.2,.8,.8);await PG[2].evaluate(()=>{TSD.color=3});await stroke(PG[2],.2,.8,.8,.2);
    const used=(await padInfo(PG[2])).st.used;ok('Black only: strokes are black even if a color was somehow set',used.join()==='0',used);
    /* old strings */
    const old=await H.evaluate(()=>{const s='1C'+'ABAAB'+'gggg'+',DAKAK';const d=tsDec(s),svg=tsSvg(s,{size:200});return {n:d.length,c:d.map(x=>x.c),e:d.map(x=>x.e),blk:/stroke="#111111"/.test(svg),white:/stroke="#fff"/.test(svg),other:(svg.match(/stroke="#[0-9a-f]+"/g)||[]).filter(x=>!/#111111|#fff|#d5dbe1/.test(x))}});
    ok('Old colorless sketch strings decode and render black (eraser stays white)',old.n===2&&old.c.join()==='0,0'&&old.e.join()==='0,1'&&old.blk&&old.white&&!old.other.length,old);
    await Promise.all([...PG,TV].map(p=>p.context().close()))}
  ok('No page errors',!errs.length,errs.slice(0,4));
  console.log('screenshots in',SHOT);
  await done(browser)})();
