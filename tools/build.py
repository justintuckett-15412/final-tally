#!/usr/bin/env python3
"""Build the installable Final Tally site from final-tally.html + assets into the repo folder."""
import os, shutil, json, hashlib, re
from PIL import Image, ImageDraw
SRC='/home/claude/final-tally.html'; ASSETS='/tmp/claude-0/build/rtsrv'; OUT='/home/claude/final-tally'
DIRS=['art','badges','lose','mask','sfx','train','wait','win']
html=open(SRC).read()
# copy only assets the page references (plus everything under these dirs that the page can build names for)
files=[]
for d in DIRS:
    dst=os.path.join(OUT,d)
    if os.path.isdir(dst): shutil.rmtree(dst)
    shutil.copytree(os.path.join(ASSETS,d),dst)
    for root,_,fs in os.walk(dst):
        for f in fs: files.append(os.path.relpath(os.path.join(root,f),OUT))
# icons: fill the rounded corners with the icon's yellow so iOS/Android masks look clean
os.makedirs(f'{OUT}/icons',exist_ok=True)
im=Image.open(f'{ASSETS}/art/app-icon.jpg').convert('RGB'); w,h=im.size
bg=im.getpixel((w//2,6)); full=Image.new('RGB',(w,h),bg); m=Image.new('L',(w,h),0)
ImageDraw.Draw(m).rounded_rectangle([3,3,w-4,h-4],radius=int(w*.2),fill=255); full.paste(im,(0,0),m)
for s in (152,167,180,192,512):
    full.resize((s,s),Image.LANCZOS).save(f'{OUT}/icons/icon-{s}.png')
pad=Image.new('RGB',(512,512),bg); pad.paste(full.resize((410,410),Image.LANCZOS),(51,51)); pad.save(f'{OUT}/icons/maskable-512.png')
files+= [f'icons/icon-{s}.png' for s in (152,167,180,192,512)]+['icons/maskable-512.png']
manifest={"id":"./","name":"Final Tally","short_name":"Final Tally","description":"Family game night scorekeeper.","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#EDF0F3","theme_color":"#EDF0F3",
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png"},{"src":"icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
json.dump(manifest,open(f'{OUT}/manifest.webmanifest','w'),indent=1)
json.dump({**manifest,'background_color':'#0F151C','theme_color':'#0F151C'},open(f'{OUT}/manifest-dark.webmanifest','w'),indent=1)
# page: move the artifact's head-ish lines into a real <head>
head_extra='''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#EDF0F3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0F151C" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
/* Installed app: draw the app all the way to the top and bottom edges instead of leaving system-colored bars */
html{background:var(--bg)}
@media (display-mode: standalone){
  body{padding-top:env(safe-area-inset-top,0px)}
  /* the status bar text is white, so in the light look give it a dark strip to sit on */
  body::before{background:#17212B}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]) body::before{background:var(--bg)}}
  :root[data-theme="dark"] body::before{background:var(--bg)}
}
</style>
<link rel="manifest" href="manifest.webmanifest" id="mf">
<script>/* the installed app takes its edge colors from whichever look is showing when it's installed */
(function(){try{var t=(JSON.parse(localStorage.getItem('finaltally.settings')||'{}').theme)||'auto',d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.getElementById('mf').href='manifest-dark.webmanifest'}catch(e){}})();</script>
<script>'''+open('/home/claude/site-tools/headpatch.js').read().strip()+'''</script>'''
html=html.replace('<link rel="apple-touch-icon" href="art/app-icon.jpg">','<link rel="apple-touch-icon" href="icons/icon-180.png">\n<link rel="apple-touch-icon" sizes="152x152" href="icons/icon-152.png">\n<link rel="apple-touch-icon" sizes="167x167" href="icons/icon-167.png">\n<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180.png">')
html=html.replace('<link rel="icon" type="image/jpeg" href="art/app-icon.jpg">','<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">')
body_start=html.index('<style>')
head=html[:body_start]; rest=html[body_start:]
ver=hashlib.sha1((html+''.join(sorted(files))+open('/home/claude/site-tools/sync.js').read()+open('/home/claude/site-tools/fb-firebase.js').read()+open('/home/claude/site-tools/sw.js').read()+open('/home/claude/site-tools/build.py').read()+open('/home/claude/site-tools/headpatch.js').read()).encode()).hexdigest()[:10]
sw_reg=f'''<script type="module" src="fb-firebase.js"></script>\n<script>(function(){{var ms=document.querySelectorAll('meta[name=theme-color]');function t(){{try{{var c=getComputedStyle(document.body).backgroundColor;for(var i=0;i<ms.length;i++)if(c&&ms[i].content!==c)ms[i].content=c;var n=(c.match(/\\d+/g)||[255,255,255]).slice(0,3).reduce(function(x,y){{return x+ +y}},0),cs=n<384?'dark':'light',cm=document.querySelector('meta[name=color-scheme]');if(cm&&cm.content!==cs)cm.content=cs;if(document.documentElement.style.colorScheme!==cs)document.documentElement.style.colorScheme=cs;var mf=document.getElementById('mf'),mh=cs==='dark'?'manifest-dark.webmanifest':'manifest.webmanifest';if(mf&&mf.getAttribute('href')!==mh)mf.setAttribute('href',mh)}}catch(e){{}}}}t();setTimeout(t,300);try{{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){{setTimeout(t,50)}})}}catch(e){{}}new MutationObserver(t).observe(document.documentElement,{{attributes:true,attributeFilter:['data-theme','class']}})}})();</script>\n<script>if('serviceWorker' in navigator&&isSecureContext)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{{}}));if('serviceWorker' in navigator){{var hadSW=!!navigator.serviceWorker.controller,t0=Date.now();navigator.serviceWorker.addEventListener('controllerchange',function(){{if(!hadSW||window.FT_UPD)return;window.FT_UPD=1;var safe=function(){{try{{return typeof S!=='undefined'&&S.screen==='home'&&!S.demo&&!document.querySelector('input:focus,.sheet-bg')}}catch(e){{return false}}}};if(Date.now()-t0<15000&&safe()){{location.reload();return}}var iv=setInterval(function(){{if(safe()){{clearInterval(iv);location.reload()}}}},1500)}})}}window.FT_BUILD='{ver[:6]}';</script>'''
page=f'<!doctype html>\n<html lang="en">\n<head>\n{head_extra}\n{head}</head>\n<body>\n{rest}\n{sw_reg}\n</body>\n</html>\n'
open(f'{OUT}/index.html','w').write(page)
sw=open('/home/claude/site-tools/sw.js').read().replace('__VER__',ver).replace('__FILES__',json.dumps(['./','index.html','manifest.webmanifest','manifest-dark.webmanifest','sync.js','fb-firebase.js']+sorted(files)))
open(f'{OUT}/sw.js','w').write(sw)
open(f'{OUT}/.nojekyll','w').write('')
for f in ('sync.js','fb-firebase.js','firestore.rules'):shutil.copy('/home/claude/site-tools/'+f,f'{OUT}/'+f)
print('built',ver,len(files),'assets')
