#!/usr/bin/env python3
"""Add Codenames (play on linked phones + record a game) to the app. Runs after dow. Usage: python3 integrate.py IN.html OUT.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'function cnFresh' not in s and 'function dwFresh' in s
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
code = ''.join(open(f'{D}/{f}', encoding='utf-8').read() + '\n' for f in ['words.js', 'game.js', 'ui.js'])
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
print('generic',
  repall("S.game==='upwords'||S.game==='deadofwinter'", "S.game==='upwords'||S.game==='deadofwinter'||S.game==='codenames'"),
  repall("S.game!=='upwords'&&S.game!=='deadofwinter'", "S.game!=='upwords'&&S.game!=='deadofwinter'&&S.game!=='codenames'"),
  repall("gm.game!=='upwords'&&gm.game!=='deadofwinter'", "gm.game!=='upwords'&&gm.game!=='deadofwinter'&&gm.game!=='codenames'"),
  repall("'upwords','deadofwinter'", "'upwords','deadofwinter','codenames'"),
  repall("['deadofwinter','Dead of Winter']", "['deadofwinter','Dead of Winter'],['codenames','Codenames']"),
  repall("deadofwinter:()=>dwPlayOn()&&S.dwg", "deadofwinter:()=>dwPlayOn()&&S.dwg,codenames:()=>cnPlayOn()&&S.cng"))
rep("g==='deadofwinter'?KEY+'.deadofwinter':", "g==='deadofwinter'?KEY+'.deadofwinter':g==='codenames'?KEY+'.codenames':")
rep("g==='deadofwinter'?dwFresh():", "g==='deadofwinter'?dwFresh():g==='codenames'?cnFresh():")
rep("CURG==='deadofwinter'?dwFresh():", "CURG==='deadofwinter'?dwFresh():CURG==='codenames'?cnFresh():")
rep("S.game==='deadofwinter'?DWM():", "S.game==='deadofwinter'?DWM():S.game==='codenames'?CNM():")
rep("S.game==='deadofwinter'?dwTot(p):", "S.game==='deadofwinter'?dwTot(p):S.game==='codenames'?cnTot(p):")
rep("delete S.dwg;if(S.game==='deadofwinter'){S.players.forEach(p=>p.dw=null);S.dwrec={};S.hr=0}", "delete S.dwg;if(S.game==='deadofwinter'){S.players.forEach(p=>p.dw=null);S.dwrec={};S.hr=0}delete S.cng;if(S.game==='codenames'){S.players.forEach(p=>p.cn=null);S.cnrec={};S.hr=0}")
rep("g==='deadofwinter'&&dwPlayOn()||", "g==='deadofwinter'&&dwPlayOn()||g==='codenames'&&cnPlayOn()||")
rep("wyrmspan:S.wzg,deadofwinter:S.dwg,", "wyrmspan:S.wzg,deadofwinter:S.dwg,codenames:S.cng,", s.count("wyrmspan:S.wzg,deadofwinter:S.dwg,"))
rep("W('deadofwinter',", "W('codenames','codenames spies spymaster words clues teams party',cnHomeCard()),W('deadofwinter',")
for f in ['Awards()', 'History(pid)', 'Guide()', 'Checks()', 'RevSteps()', 'Results()']:
    rep(f"if(S.game==='deadofwinter')return dw{f};", f"if(S.game==='deadofwinter')return dw{f};if(S.game==='codenames')return cn{f};")
rep("...(S.game==='deadofwinter'?{dwx:S.dwx,dwrec:S.dwrec}:{}),", "...(S.game==='deadofwinter'?{dwx:S.dwx,dwrec:S.dwrec}:{}),...(S.game==='codenames'?{cnx:S.cnx,cnrec:S.cnrec}:{}),")
rep("  deadofwinter:p=>dwStats(p),", "  deadofwinter:p=>dwStats(p),\n  codenames:p=>cnStats(p),")
rep("  if(g==='deadofwinter')return [", "  if(g==='codenames')return [['🕵️','🔴','🔵','🕵️'].map(c=>wlSvg(26,26,`<text x=\"13\" y=\"19\" text-anchor=\"middle\" font-size=\"17\">${c}</text>`)),'Shuffling the agents…'];\n  if(g==='deadofwinter')return [")
rep("deadofwinter:'Dead of Winter',", "deadofwinter:'Dead of Winter',codenames:'Codenames',")
rep("STATG==='deadofwinter'?'Dead of Winter':", "STATG==='deadofwinter'?'Dead of Winter':STATG==='codenames'?'Codenames':", 2)
rep("STATG==='deadofwinter'?'YEAR IN DEAD OF WINTER':", "STATG==='deadofwinter'?'YEAR IN DEAD OF WINTER':STATG==='codenames'?'YEAR IN CODENAMES':")
rep("S.game==='deadofwinter'?(dwPlayOn()?", "S.game==='codenames'?'4 to 8 players, in two teams. No computer players.':S.game==='deadofwinter'?(dwPlayOn()?")
rep("deadofwinter:{get:()=>S.dwx,", "codenames:{get:()=>S.cnx,set:v=>S.cnx=v,def:()=>({...CNDEF}),keep:()=>cnKeep()},deadofwinter:{get:()=>S.dwx,")
rep("  if(st.game==='deadofwinter'){S=dwFresh();", "  if(st.game==='codenames'){S=cnFresh();Object.assign(S,{players:st.players,gameId:g.id,gameDate:g.date,started:true,finished:true,screen:'score',active:0,hr:1,editing:g.id,hideTotals:false});if(st.cnx)S.cnx=st.cnx;if(st.cnrec)S.cnrec=st.cnrec;S.cnx.play=0;while(S.players.length<8)S.players.push(newPlayer('',CARC_COLORS.find(c=>!S.players.some(p=>p.color===c))||'gray',false));UNDO=[];WARN=null;REV=null;return}\n  if(st.game==='deadofwinter'){S=dwFresh();")
rep("  deadofwinter:(x,i,h)=>", "  codenames:(x,i,h)=>`<text x=\"${x+11}\" y=\"19\" text-anchor=\"middle\" font-size=\"15\">${['🕵️','🔴','🔵'][h%3]}</text>`,\n  deadofwinter:(x,i,h)=>")
rep("DW2=S.game==='deadofwinter';", "DW2=S.game==='deadofwinter',CN2=S.game==='codenames';")
rep("map:DW2?dwSetup:", "map:CN2?cnSetup:DW2?dwSetup:")
rep("players:DW2?nxPlayers:", "players:CN2?nxPlayers:DW2?nxPlayers:")
rep("score:DW2?dwScoreScr:", "score:CN2?cnScoreScr:DW2?dwScoreScr:")
rep("if(S.game==='deadofwinter')dwTick();", "if(S.game==='deadofwinter')dwTick();if(S.game==='codenames')cnTick();")
rep("if(S.game==='deadofwinter')return dwPlayOn()&&S.dwg&&typeof dwActor==='function'?dwActor(S.dwg):null;", "if(S.game==='deadofwinter')return dwPlayOn()&&S.dwg&&typeof dwActor==='function'?dwActor(S.dwg):null;if(S.game==='codenames')return cnPlayOn()&&S.cng?cnActor(S.cng):null;")
rep("  if(/^dw(sel|ans|show|what|goal|vok)$/.test(a)", "  if(/^cnu[a-z]+$/.test(a)&&cnPlayOn()&&S.started){cnUiAct(a,b,k);save();render();return}\n  if(/^dw(sel|ans|show|what|goal|vok)$/.test(a)")
rep("    case 'dwstart':", """    case 'cnstart':{switchGame('codenames');resetScores();clearPlayers();delete S.cng;S.started=false;S.finished=false;S.screen='map';CNX().play=k==='1'?1:0;cnKeep();window.scrollTo(0,0);break}
    case 'cnplaymode':{if(S.started)break;CNX().play=k==='1'?1:0;cnKeep();break}
    case 'cnwords':{if(S.started&&cnPlayOn())break;CNX().words=k==='kid'?'kid':'std';cnKeep();break}
    case 'cnmatch':{if(S.started&&cnPlayOn())break;CNX().match=[1,3,5,0].includes(+k)?+k:1;cnKeep();break}
    case 'cnownonly':{if(S.started&&cnPlayOn())break;CNX().ownOnly=CNX().ownOnly?0:1;cnKeep();break}
    case 'cnrecwin':{(S.cnrec=S.cnrec||{}).win=k;cnRecWin();break}
    case 'cnrecwhy':{(S.cnrec=S.cnrec||{}).why=k;break}
    case 'cnrectm':{const [i,t]=String(k).split(':'),q=act()[+i];if(!q)break;cnP(q).tm=t;cnRecWin();break}
    case 'cnrecspy':{const q=act()[+k];if(!q)break;const D=cnP(q);D.spy=D.spy?0:1;break}
    case 'dwstart':""")
rep("  if(e.target.dataset.dwo){", "  if(e.target.dataset.cnown){CNX().own=e.target.value;cnKeep();return}\n  if(e.target.dataset.dwo){")
rep("  dwMove:(pid,mv)=>", "  cnMove:(pid,mv)=>{const g=S.cng;return !!g&&typeof cnMove==='function'&&cnMove(g,pid,mv)},\n  dwMove:(pid,mv)=>")
rep("S.game==='deadofwinter'?'A round, your turn, the colony phase and the end':", "S.game==='deadofwinter'?'A round, your turn, the colony phase and the end':S.game==='codenames'?'Teams, a turn, voting and winning':")
rep("S.game==='deadofwinter'&&dwPlayOn()||", "S.game==='deadofwinter'&&dwPlayOn()||S.game==='codenames'&&cnPlayOn()||")
rep("if(dwPlayOn()&&S.dwg&&typeof dwActor==='function')return dwActor(S.dwg);", "if(dwPlayOn()&&S.dwg&&typeof dwActor==='function')return dwActor(S.dwg);if(cnPlayOn()&&S.cng)return cnActor(S.cng);")
rep("    case 'finish':{", "    case 'finish':{if(cnPlayOn()&&S.cng&&S.cng.phase==='done')cnSyncScorer(S.cng);")
rep("try{if(!document.querySelector('#app .lkbar'))CHOPEN=false;chFx()}catch(e){}", "try{if(!document.querySelector('#app .lkbar'))CHOPEN=false;chFx()}catch(e){}try{cnFx()}catch(e){}")
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
