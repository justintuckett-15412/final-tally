# Deep test in WebKit, the engine behind Safari on iPhone and iPad.
# Needs: apt-get install webkit2gtk-driver xvfb ; run: xvfb-run -a python3 tools/test/webkit/deep.py (with the site served on :8765)
# Covers: features the app relies on, full computer games (Carcassonne in all 4 map looks, Catan, Ticket to Ride),
# textures and pictures loading, road texture, pinch/drag/lost finger-lift, no text selection on the map,
# the other playable games starting, light/dark home screens, and no script errors. Screenshots go to /tmp/wk-*.png.
import sys,time,json;sys.path.insert(0,__import__('os').path.dirname(__file__));from wd import WK
R=[];ok=lambda n,c,x='':R.append((n,bool(c),x))
d=WK(w=390,h=844);d.go('http://localhost:8765/');time.sleep(4)
d.js("window.__E=[];addEventListener('error',e=>__E.push(String(e.message)+' @'+(e.lineno||'')));addEventListener('unhandledrejection',e=>__E.push('promise: '+String(e.reason&&e.reason.message||e.reason)));window.__htfast=1;SET.toursOff=true;document.getElementById('tour')?.remove();localStorage.clear()")
# 1. features the app relies on
f=d.js("""return {colorMix:CSS.supports('color','color-mix(in srgb,red 50%,blue)'),has:CSS.supports('selector(:has(a))'),dvh:CSS.supports('height','100dvh'),lineClamp:CSS.supports('-webkit-line-clamp','2'),clip:CSS.supports('overflow','clip'),inset:CSS.supports('inset','0'),
  structuredClone:typeof structuredClone,pointer:typeof PointerEvent,touch:typeof TouchEvent,ls:(()=>{try{localStorage.setItem('x','1');return localStorage.getItem('x')==='1'}catch(e){return false}})()}""")
ok('Safari features the app uses are there',all(v not in (False,'undefined') for k,v in f.items() if k!='touch'),json.dumps(f))
def game(name,setup,step,until,maxn=1500):
    d.js(setup);n=0;t=time.time()
    while n<maxn:
        r=d.js(step);n+=1
        if r:break
    return n,round(time.time()-t,1)
# 2. Carcassonne: a full bot game with several expansions, in each map look with weather on
for pk in ['','a','w','h']:
    setup="""(function(pk){const b0=document.createElement('button');b0.dataset.a='ccstart';b0.dataset.k='1';document.body.appendChild(b0);b0.click();b0.remove();CX().ed='2';for(const k in CX().exp)CX().exp[k]=false;['river','ic','tb','pd','hs','am','bt','fruit','fest','mw','gold'].forEach(k=>{if(k in CX().exp)CX().exp[k]=true});CX().pack=pk;
      S.players.forEach((q,i)=>{q.on=i<3;q.name=['Ann','Bob','Cy'][i];q.bot='normal'});save();const b=document.createElement('button');b.dataset.a='start';document.body.appendChild(b);b.click();b.remove()})(%s)"""%json.dumps(pk)
    step="const g=S.ccg;if(!g||g.phase==='done')return 1;for(let k=0;k<6&&g.phase!=='done';k++){const q=act().find(x=>x.id===g.turn);if(q)try{ccBotStep(g,q)}catch(e){__E.push('bot '+e.message)}}render();return g.phase==='done'?1:0"
    n,t=game('carc',setup,step,None)
    r=d.js("const g=S.ccg;return {ph:g.phase,tiles:g.order.length,sc:g.ps.map(p=>g.sc[p]),cls:document.querySelector('.cczm')?.className,anim:document.querySelector('.cczm')?getComputedStyle(document.querySelector('.cczm'),'::before').animationName:'',e:__E.slice(0,4)}")
    ok(f'Carcassonne full computer game, look {pk or "classic"}',r['ph']=='done' and not r['e'],json.dumps(r)+f' steps={n} {t}s')
    if pk=='':
        # roads are painted (Brad's white-road report): the road texture fill and its solid fallback
        rf=d.js("""const p=[...document.querySelectorAll('.cczm path,.cczm polygon,.cczm rect')].map(e=>{const c=getComputedStyle(e);return c.stroke+' '+c.fill}).filter(f=>/ccx-road/.test(f));const pat=document.querySelector('#ccx-road-0,[id^=ccx-road]');
          const im=[...document.querySelectorAll('.cczm pattern image')].map(i=>i.getAttribute('href'));return {n:p.length,sample:p[0]||'',pat:!!pat,imgs:[...new Set(im)].slice(0,8)}""")
        ok('Roads use the painted road texture (not white)',rf['n']>0 and 'ccx-road' in rf['sample'],json.dumps(rf))
        d.js("zmSet('cc',2.25);render()");time.sleep(2.5);d.shot('/tmp/wk-carc.png')
    if pk=='w':d.js("render()");time.sleep(2);d.shot('/tmp/wk-carc-w.png')
# 3. textures actually load in Safari's engine
ld=d.js("""return Promise.all(['cc-grass','cc-road','cc-city','cc-water','cc-wall','cc-grass-w','cc-road-h','cc-city-a'].map(n=>new Promise(r=>{const i=new Image();i.onload=()=>r([n,i.naturalWidth]);i.onerror=()=>r([n,0]);i.src='art/'+n+'.jpg'}))).then(x=>x)""") if False else d.ajs("""const done=arguments[arguments.length-1];Promise.all(['cc-grass','cc-road','cc-city','cc-water','cc-wall','cc-grass-w','cc-road-h','cc-city-a'].map(n=>new Promise(r=>{const i=new Image();i.onload=()=>r([n,i.naturalWidth]);i.onerror=()=>r([n,0]);i.src='art/'+n+'.jpg'}))).then(done)""")
ok('Map textures load',all(w>0 for n,w in ld),json.dumps(ld))
wb=d.ajs("""const done=arguments[arguments.length-1];Promise.all(['cc-p-mon','cc-p-mon-h','cc-p-abbey-w','cc-p-tree-a','cc-p-spring-w','cc-p-barn-h'].map(n=>new Promise(r=>{const i=new Image();i.onload=()=>r([n,i.naturalWidth]);i.onerror=()=>r([n,0]);i.src='art/'+n+'.webp'}))).then(done)""")
ok('WebP tile pictures load',all(w>0 for n,w in wb),json.dumps(wb))
# 4. pinch, drag and a lost finger-lift on the Carcassonne map (pointer events, like the iPhone)
pz=d.js("""S.ccg.phase='play';render();zmSet('cc',1);render();const box=document.querySelector('.zmbox[data-zk="cc"]'),r=box.getBoundingClientRect(),X=r.left+r.width/2,Y=r.top+r.height/2;
  const ev=(t,id,x,y,pr)=>box.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:y,isPrimary:pr,bubbles:true,pointerType:'touch'}));
  ev('pointerdown',1,X-40,Y,true);ev('pointerdown',2,X+40,Y,false);ev('pointermove',1,X-90,Y,true);ev('pointermove',2,X+90,Y,false);ev('pointerup',1,X-90,Y,true);ev('pointerup',2,X+90,Y,false);const s1=ZM.cc.s;
  const x0=ZM.cc.x;ev('pointerdown',3,X,Y,true);ev('pointermove',3,X+60,Y+30,true);ev('pointerup',3,X+60,Y+30,true);const dragged=ZM.cc.x!==x0;
  ev('pointerdown',4,X,Y,true);/* lift lost */const x1=ZM.cc.x;ev('pointerdown',5,X,Y,true);ev('pointermove',5,X-50,Y,true);ev('pointerup',5,X-50,Y,true);const after=ZM.cc.x!==x1;
  return {s1,dragged,after}""")
ok('Pinch zooms, drag pans, and a lost finger-lift doesn\'t freeze the map',pz['s1']>1 and pz['dragged'] and pz['after'],json.dumps(pz))
# 5. text doesn't get selected while dragging the map
us=d.js("const z=document.querySelector('.zmbox');return getComputedStyle(z).webkitUserSelect||getComputedStyle(z).userSelect")
ok('Map can\'t be text-selected while dragging',us=='none',us)
# 6. Catan: full computer game
setup="""S=ctFresh();S.game='catan';S.ctx=Object.assign({...CTDEF},{play:1});S.players.forEach((q,i)=>{q.on=i<4;q.name=['Ann','Bob','Cy','Di'][i];q.bot='normal'});S.started=true;S.screen='score';cpDeal();render()"""
step="const g=S.cpg;for(let k=0;k<6&&g.phase!=='done';k++){const a=cpActor(g),q=act().find(x=>x.id===a);if(q)try{cpBotStep(g,q)}catch(e){__E.push('cbot '+e.message)}}render();return g.phase==='done'?1:0"
n,t=game('catan',setup,step,None,2500)
r=d.js("return {ph:S.cpg.phase,vp:S.cpg.ps.map(p=>cpVP(S.cpg,p)),hl:!!document.querySelector('.essum'),e:__E.slice(0,4)}")
ok('Catan full computer game, ends with Highlights',r['ph']=='done' and r['hl'] and not r['e'],json.dumps(r)+f' steps={n} {t}s')
d.js("TGZ={s:1,cx:null,cy:null};render()");time.sleep(1.5);d.shot('/tmp/wk-catan.png')
# 7. Ticket to Ride: full computer game
setup="""localStorage.clear();const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('trstart','1');S.players.forEach((q,i)=>{q.on=i<3;q.name=['Ann','Bob','Cy'][i];q.bot='normal'});save();c('start')"""
d.js(setup);time.sleep(1.5)
step="const g=trG();if(!g)return 0;for(let k=0;k<4;k++)try{trTick()}catch(e){__E.push('tr '+e.message)}render();return g.phase==='done'?1:0"
n,t=game('ttr','',step,None,3000)
r=d.js("const g=trG();return {ph:g.phase,sc:g.ps.map(p=>g.sc[p]),hl:!!document.querySelector('.essum'),e:__E.slice(0,4)}")
ok('Ticket to Ride full computer game',r['ph']=='done' and not r['e'],json.dumps(r)+f' steps={n} {t}s')
d.shot('/tmp/wk-ttr.png')
# 8. the other playable games start and render
for name,code in [('Citadels',"switchGame('citadels');resetScores();S.cix=Object.assign(JSON.parse(JSON.stringify(CIDEF)),{play:1});S.players.forEach((q,i)=>{q.on=i<4;q.bot=i?'normal':null});S.started=true;S.screen='score';ciDeal();render();return !!document.querySelector('#app')&&S.cig.phase"),
  ('Dominion',"switchGame('dominion');resetScores();S.dnx=JSON.parse(JSON.stringify(DNDEF));S.dnx.play=1;S.players.forEach((q,i)=>{q.on=i<3;q.bot=i?'normal':null});S.started=true;S.screen='score';dnDeal();render();return S.dng.phase"),
  ('Stone Age',"switchGame('stoneage');resetScores();Object.assign(SAX(),{play:1,exp:0,bonus:0,mix:'none',mam:0,ext:0});S.players.forEach((q,i)=>{q.on=i<3;q.bot=i?'normal':null});S.started=true;S.screen='score';saDeal();render();return S.sag.phase"),
  ('Quacks',"switchGame('quacks');resetScores();S.players.forEach((q,i)=>{q.on=i<3;q.bot=i?'normal':null});S.started=true;S.screen='score';qpStart();render();return S.qpg.phase")]:
    try:r=d.js(d and code);e=d.js("return __E.slice(0,3)");ok(f'{name} starts and draws',r and not e,f'{r} {e}')
    except Exception as x:ok(f'{name} starts and draws',False,str(x)[:300])
# 9. light and dark mode, home screen, rules sheet
for th in ['light','dark']:
    d.js(f"SET.theme='{th}';try{{applyTheme&&applyTheme()}}catch(e){{}};S.screen='home';render()");time.sleep(1);d.shot(f'/tmp/wk-home-{th}.png')
e=d.js("return __E");ok('No script errors in the whole run',not e,json.dumps(e[:6]))
d.quit()
bad=0
for n,c,x in R:
    print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+x[:400]));bad+=not c
print('webkit',bad,'failed')
