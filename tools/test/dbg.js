const {mk,W,chromium}=require('./link.js');(async()=>{const b=await chromium.launch();const P=await mk(b,'p');P.on('pageerror',e=>console.log('ERR',e.message));console.log(await P.evaluate(()=>{const KD=['page','peasant','guide','ratcatcher','transmogrify','port','ranger','giant','magpie','artificer'];
    const fresh=(n=2,kd,ev)=>{S=dnFresh();S.dnx.play=1;S.dnx.kd=kd||KD;S.dnx.ks={base:1,adventures:1};S.dnx.pc='off';S.dnx.sh='off';S.dnx.ev=ev||[];S.dnx.evm='pick';
      S.players.forEach((p,i)=>{p.on=i<n;p.name=['Ann','Bob','Cy','Di','Ed','Flo'][i];p.bot=null});S.started=true;dnDeal();const g=S.dng;const [a,b,c]=g.ps;
      g.ps.forEach(id=>{const M=g.me[id];M.h=[];M.dk=[];M.ds=[];M.pl=[];M.tn=1;M.cf=0});Object.assign(g,{turn:a,ph:'action',A:1,B:1,co:0,coL:0,mer:0,silv:0,k:[],ask:null,phase:'play',manT:1,chl:0,fp:0,bought:0,br:0,hag:0,sch:0,ga:0,cldr:[],xr:0,fgc:0,knt:0,nbuy:0,evb:{},prevT:b});return {g,a,b,c,A:g.me[a],B:g.me[b],C:c&&g.me[c]}};
    const play=(g,a,k)=>dnPlay(g,a,g.me[a].h.indexOf(k));
    const K2=k=>[k,...KD.filter(x=>x!==k)].slice(0,10);
    const t=0;
const o={};
{const {g,a,b,A}=fresh();A.tav=['teacher'];A.dk=Array(10).fill('copper');dnEndTurn(g,a);dnEndTurn(g,b);o.q1=g.ask&&[g.ask.then,g.ask.opts.map(x=>x[0])];o.r1=dnAns(g,a,['teacher']);o.q2=g.ask&&[g.ask.then];o.r2=dnAns(g,a,['c']);o.q3=g.ask&&[g.ask.then,g.ask.k,g.ask.ok];o.r3=dnAns(g,a,'port');o.q4=g.ask&&g.ask.then;o.tok=A.tok;}
{const {g,a,b,A}=fresh();A.tav=['transmogrify'];A.dk=['estate',...Array(10).fill('copper')];dnEndTurn(g,a);dnEndTurn(g,b);o.t1=g.ask&&g.ask.then;dnAns(g,a,['transmogrify']);o.t2=g.ask&&[g.ask.then,g.ask.k];const i=A.h.indexOf('estate');o.i=i;o.t3=dnAns(g,a,[i>=0?i:0]);o.t4=g.ask&&[g.ask.then,g.ask.k,g.ask.ok];o.h=A.h.slice()}
return JSON.stringify(o);}));await b.close()})();