#!/usr/bin/env python3
"""Add Telestrations (play on linked phones + record a game) to the app. Runs after cn. Usage: python3 integrate.py IN.html OUT.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'function tsFresh' not in s and 'function cnFresh' in s
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: raise SystemExit(f'anchor found {n}x (wanted {count}): {old[:100]!r}')
    s = s.replace(old, new)
def repall(old, new, atleast=1):
    global s
    n = s.count(old)
    if n < atleast: raise SystemExit(f'anchor found {n}x (wanted >= {atleast}): {old[:100]!r}')
    s = s.replace(old, new); return n
code = ''.join(open(f'{D}/{f}', encoding='utf-8').read() + '\n' for f in ['words.js', 'game.js', 'draw.js', 'ui.js'])
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
print('generic',
  repall("S.game==='deadofwinter'||S.game==='codenames'", "S.game==='deadofwinter'||S.game==='codenames'||S.game==='telestrations'"),
  repall("S.game!=='deadofwinter'&&S.game!=='codenames'", "S.game!=='deadofwinter'&&S.game!=='codenames'&&S.game!=='telestrations'"),
  repall("gm.game!=='deadofwinter'&&gm.game!=='codenames'", "gm.game!=='deadofwinter'&&gm.game!=='codenames'&&gm.game!=='telestrations'"),
  repall("'deadofwinter','codenames'", "'deadofwinter','codenames','telestrations'"),
  repall("['codenames','Codenames']", "['codenames','Codenames'],['telestrations','Telestrations']"),
  repall("codenames:()=>cnPlayOn()&&S.cng", "codenames:()=>cnPlayOn()&&S.cng,telestrations:()=>tsPlayOn()&&S.tsg"))
rep("g==='codenames'?KEY+'.codenames':", "g==='codenames'?KEY+'.codenames':g==='telestrations'?KEY+'.telestrations':")
rep("g==='codenames'?cnFresh():", "g==='codenames'?cnFresh():g==='telestrations'?tsFresh():")
rep("CURG==='codenames'?cnFresh():", "CURG==='codenames'?cnFresh():CURG==='telestrations'?tsFresh():")
rep("S.game==='codenames'?CNM():", "S.game==='codenames'?CNM():S.game==='telestrations'?TSM():")
rep("S.game==='codenames'?cnTot(p):", "S.game==='codenames'?cnTot(p):S.game==='telestrations'?tsTot(p):")
rep("delete S.cng;if(S.game==='codenames'){S.players.forEach(p=>p.cn=null);S.cnrec={};S.hr=0}", "delete S.cng;if(S.game==='codenames'){S.players.forEach(p=>p.cn=null);S.cnrec={};S.hr=0}delete S.tsg;if(S.game==='telestrations'){S.players.forEach(p=>p.ts=null);S.tsrec={};S.hr=0}")
rep("g==='codenames'&&cnPlayOn()||", "g==='codenames'&&cnPlayOn()||g==='telestrations'&&tsPlayOn()||")
rep("deadofwinter:S.dwg,codenames:S.cng,", "deadofwinter:S.dwg,codenames:S.cng,telestrations:S.tsg,", s.count("deadofwinter:S.dwg,codenames:S.cng,"))
rep("W('codenames',", "W('telestrations','telestrations drawing sketch guess pictionary telephone party',tsHomeCard()),W('codenames',")
for f in ['Awards()', 'History(pid)', 'Guide()', 'Checks()', 'RevSteps()', 'Results()']:
    rep(f"if(S.game==='codenames')return cn{f};", f"if(S.game==='codenames')return cn{f};if(S.game==='telestrations')return ts{f};")
rep("...(S.game==='codenames'?{cnx:S.cnx,cnrec:S.cnrec}:{}),", "...(S.game==='codenames'?{cnx:S.cnx,cnrec:S.cnrec}:{}),...(S.game==='telestrations'?{tsx:S.tsx,tsrec:S.tsrec}:{}),")
rep("  codenames:p=>cnStats(p),", "  codenames:p=>cnStats(p),\n  telestrations:p=>tsStats(p),")
rep("  if(g==='codenames')return [", "  if(g==='telestrations')return [['✏️','📒','🖍️','✏️'].map(c=>wlSvg(26,26,`<text x=\"13\" y=\"19\" text-anchor=\"middle\" font-size=\"17\">${c}</text>`)),'Passing out sketchbooks…'];\n  if(g==='codenames')return [")
rep("codenames:'Codenames',", "codenames:'Codenames',telestrations:'Telestrations',")
rep("STATG==='codenames'?'Codenames':", "STATG==='codenames'?'Codenames':STATG==='telestrations'?'Telestrations':", 2)
rep("STATG==='codenames'?'YEAR IN CODENAMES':", "STATG==='codenames'?'YEAR IN CODENAMES':STATG==='telestrations'?'YEAR IN TELESTRATIONS':")
rep("S.game==='codenames'?'4 to 8 players, in two teams. No computer players.':", "S.game==='telestrations'?'4 to 8 players. Each linked phone is a sketchbook. No computer players.':S.game==='codenames'?'4 to 8 players, in two teams. No computer players.':")
rep("codenames:{get:()=>S.cnx,", "telestrations:{get:()=>S.tsx,set:v=>S.tsx=v,def:()=>({...TSDEF}),keep:()=>tsKeep()},codenames:{get:()=>S.cnx,")
rep("  if(st.game==='codenames'){S=cnFresh();", "  if(st.game==='telestrations'){S=tsFresh();Object.assign(S,{players:st.players,gameId:g.id,gameDate:g.date,started:true,finished:true,screen:'score',active:0,hr:1,editing:g.id,hideTotals:false});if(st.tsx)S.tsx=st.tsx;if(st.tsrec)S.tsrec=st.tsrec;S.tsx.play=0;while(S.players.length<8)S.players.push(newPlayer('',CARC_COLORS.find(c=>!S.players.some(p=>p.color===c))||'gray',false));UNDO=[];WARN=null;REV=null;return}\n  if(st.game==='codenames'){S=cnFresh();")
rep("  codenames:(x,i,h)=>", "  telestrations:(x,i,h)=>`<text x=\"${x+11}\" y=\"19\" text-anchor=\"middle\" font-size=\"15\">${['✏️','📒','🖍️'][h%3]}</text>`,\n  codenames:(x,i,h)=>")
rep("CN2=S.game==='codenames';", "CN2=S.game==='codenames',TS2=S.game==='telestrations';")
rep("map:CN2?cnSetup:", "map:TS2?tsSetup:CN2?cnSetup:")
rep("players:CN2?nxPlayers:", "players:TS2?nxPlayers:CN2?nxPlayers:")
rep("score:CN2?cnScoreScr:", "score:TS2?tsScoreScr:CN2?cnScoreScr:")
rep("if(S.game==='codenames')cnTick();", "if(S.game==='codenames')cnTick();if(S.game==='telestrations')tsTick();")
rep("if(S.game==='codenames')return cnPlayOn()&&S.cng?cnActor(S.cng):null;", "if(S.game==='codenames')return cnPlayOn()&&S.cng?cnActor(S.cng):null;if(S.game==='telestrations')return tsPlayOn()&&S.tsg?tsActor(S.tsg):null;")
rep("  if(/^cnu[a-z]+$/.test(a)&&cnPlayOn()&&S.started){cnUiAct(a,b,k);save();render();return}", "  if(/^cnu[a-z]+$/.test(a)&&cnPlayOn()&&S.started){cnUiAct(a,b,k);save();render();return}\n  if(/^tsu[a-z]+$/.test(a)&&tsPlayOn()&&S.started){tsUiAct(a,b,k);save();render();return}")
rep("    case 'cnstart':", """    case 'tsstart':{switchGame('telestrations');resetScores();clearPlayers();delete S.tsg;S.started=false;S.finished=false;S.screen='map';TSX().play=k==='1'?1:0;tsKeep();window.scrollTo(0,0);break}
    case 'tsplaymode':{if(S.started)break;TSX().play=k==='1'?1:0;tsKeep();break}
    case 'tswords':{if(S.started&&tsPlayOn())break;TSX().words=k==='kid'?'kid':'std';tsKeep();break}
    case 'tsscoring':{if(S.started&&tsPlayOn())break;TSX().scoring=['friendly','competitive','none'].includes(k)?k:'friendly';tsKeep();break}
    case 'tstimer':{if(S.started&&tsPlayOn())break;TSX().timer=[0,30,60,90,120].includes(+k)?+k:60;tsKeep();break}
    case 'tsflip':{if(S.started&&tsPlayOn())break;TSX().flip=TSX().flip?0:1;tsKeep();break}
    case 'tsownonly':{if(S.started&&tsPlayOn())break;TSX().ownOnly=TSX().ownOnly?0:1;tsKeep();break}
    case 'tsrecpt':{const [i,r,d]=String(k).split(':'),q=act()[+i];if(!q)break;const D=tsP(q);D.r[+r]=Math.max(0,Math.min(99,(+D.r[+r]||0)+(+d||0)));break}
    case 'cnstart':""")
rep("  if(e.target.dataset.cnown){", "  if(e.target.dataset.tsown){TSX().own=e.target.value;tsKeep();return}\n  if(e.target.dataset.cnown){")
rep("  cnMove:(pid,mv)=>", "  tsMove:(pid,mv)=>{const g=S.tsg;return !!g&&typeof tsMoveQ==='function'&&tsMoveQ(g,pid,mv)},\n  cnMove:(pid,mv)=>")
rep("S.game==='codenames'?'Teams, a turn, voting and winning':", "S.game==='codenames'?'Teams, a turn, voting and winning':S.game==='telestrations'?'Your word, passing the books and the Big Reveal':")
rep("S.game==='codenames'&&cnPlayOn()||", "S.game==='codenames'&&cnPlayOn()||S.game==='telestrations'&&tsPlayOn()||")
rep("if(cnPlayOn()&&S.cng)return cnActor(S.cng);", "if(cnPlayOn()&&S.cng)return cnActor(S.cng);if(tsPlayOn()&&S.tsg)return tsActor(S.tsg);")
rep("    case 'finish':{if(cnPlayOn()&&S.cng&&S.cng.phase==='done')cnSyncScorer(S.cng);", "    case 'finish':{if(cnPlayOn()&&S.cng&&S.cng.phase==='done')cnSyncScorer(S.cng);if(tsPlayOn()&&S.tsg&&S.tsg.phase==='done')tsSyncScorer(S.tsg);")
rep("chFx()}catch(e){}try{cnFx()}catch(e){}", "chFx()}catch(e){}try{cnFx()}catch(e){}try{tsFx()}catch(e){}")
print('records',repall('+cnRecords(G)','+cnRecords(G)+tsRecords(G)'))
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
