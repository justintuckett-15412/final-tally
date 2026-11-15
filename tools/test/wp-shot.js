process.env.LAT='120';process.env.JIT='120';
const {mk,W,chromium}=require('./link.js');
(async()=>{const browser=await chromium.launch();const P=await mk(browser,'wp');await P.setViewportSize({width:430,height:900});
  await P.evaluate(()=>{window.__htfast=1;SET.toursOff=true;const c=(a,k)=>{const b=document.createElement('button');b.dataset.a=a;if(k!=null)b.dataset.k=k;b.hidden=true;document.body.appendChild(b);b.click();b.remove()};c('wpstart','1');
    S.players.forEach((p,i)=>{p.on=i<2;p.name=['Ann','Bob'][i];p.bot=i?'normal':null});save();c('start')});await W(2000);
  const n=await P.evaluate(()=>[...document.querySelectorAll('img.wpimg')].map(i=>i.complete&&i.naturalWidth>0));
  console.log('portraits',n.length,'loaded',n.filter(Boolean).length);
  await P.screenshot({path:'/tmp/wpshot.png'});await browser.close()})();
