#!/usr/bin/env python3
"""Add Beyond Balderdash (play on linked phones) to the app. Runs after ck. Usage: python3 integrate.py IN.html OUT.html
Prefix bd (no clash: the app only had the property .bd in Carcassonne/Catan code, never a bd… global, class or action).
Re-runs mkdata.py first so new question files are picked up."""
import sys, os, subprocess
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
subprocess.run([sys.executable, f'{D}/mkdata.py'], check=True)
s = open(src, encoding='utf-8').read()
assert 'function bdFresh' not in s and 'cykHomeCard' in s
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
code = '/* ================= Beyond Balderdash ================= */\n' + ''.join(open(f'{D}/{f}', encoding='utf-8').read() + '\n' for f in ['data.js', 'game.js', 'ui.js'])
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
print('generic',
  repall("S.game==='telestrations'||S.game==='coverkingdom'", "S.game==='telestrations'||S.game==='coverkingdom'||S.game==='balderdash'"),
  repall("S.game!=='telestrations'&&S.game!=='coverkingdom'", "S.game!=='telestrations'&&S.game!=='coverkingdom'&&S.game!=='balderdash'"),
  repall("gm.game!=='telestrations'&&gm.game!=='coverkingdom'", "gm.game!=='telestrations'&&gm.game!=='coverkingdom'&&gm.game!=='balderdash'"),
  repall("'telestrations','coverkingdom'", "'telestrations','coverkingdom','balderdash'"),
  repall("['coverkingdom','Cover Your Kingdom']", "['coverkingdom','Cover Your Kingdom'],['balderdash','Beyond Balderdash']"),
  repall("coverkingdom:()=>cykOn()&&S.ckg", "coverkingdom:()=>cykOn()&&S.ckg,balderdash:()=>bdPlayOn()&&S.bdg"))
rep("g==='coverkingdom'?KEY+'.coverkingdom':", "g==='coverkingdom'?KEY+'.coverkingdom':g==='balderdash'?KEY+'.balderdash':")
rep("g==='coverkingdom'?cykFresh():", "g==='coverkingdom'?cykFresh():g==='balderdash'?bdFresh():")
rep("CURG==='coverkingdom'?cykFresh():", "CURG==='coverkingdom'?cykFresh():CURG==='balderdash'?bdFresh():")
rep("S.game==='coverkingdom'?cykM():", "S.game==='coverkingdom'?cykM():S.game==='balderdash'?BDM():")
rep("S.game==='coverkingdom'?cykTot(p):", "S.game==='coverkingdom'?cykTot(p):S.game==='balderdash'?bdTot(p):")
rep("delete S.ckg;if(S.game==='coverkingdom'){S.players.forEach(p=>p.ck=null);S.ckrec={};S.hr=0;try{cykDone()}catch(e){}}",
    "delete S.ckg;if(S.game==='coverkingdom'){S.players.forEach(p=>p.ck=null);S.ckrec={};S.hr=0;try{cykDone()}catch(e){}}delete S.bdg;if(S.game==='balderdash'){S.players.forEach(p=>p.bd=null);S.bdrec={};S.hr=0}")
rep("g==='coverkingdom'&&cykOn()||", "g==='coverkingdom'&&cykOn()||g==='balderdash'&&bdPlayOn()||")
rep("telestrations:S.tsg,coverkingdom:S.ckg,", "telestrations:S.tsg,coverkingdom:S.ckg,balderdash:S.bdg,", s.count("telestrations:S.tsg,coverkingdom:S.ckg,"))
rep("W('coverkingdom',", "W('balderdash','beyond balderdash bluff dictionary definitions party trivia dasher',bdHomeCard()),W('coverkingdom',")
for f in ['Awards()', 'History(pid)', 'Guide()', 'Checks()', 'RevSteps()', 'Results()']:
    rep(f"if(S.game==='coverkingdom')return cyk{f};", f"if(S.game==='coverkingdom')return cyk{f};if(S.game==='balderdash')return bd{f};")
rep("...(S.game==='coverkingdom'?{ckx:S.ckx,ckrec:S.ckrec}:{}),", "...(S.game==='coverkingdom'?{ckx:S.ckx,ckrec:S.ckrec}:{}),...(S.game==='balderdash'?{bdx:S.bdx,bdrec:S.bdrec}:{}),")
rep("  coverkingdom:p=>cykStats(p),", "  coverkingdom:p=>cykStats(p),\n  balderdash:p=>bdStats(p),")
rep("  if(g==='coverkingdom')return [", "  if(g==='balderdash')return [['🎭','📖','🎬','🎭'].map(c=>wlSvg(26,26,`<text x=\"13\" y=\"19\" text-anchor=\"middle\" font-size=\"17\">${c}</text>`)),'Shuffling the cards…'];\n  if(g==='coverkingdom')return [")
rep("coverkingdom:'Cover Your Kingdom',", "coverkingdom:'Cover Your Kingdom',balderdash:'Beyond Balderdash',")
rep("STATG==='coverkingdom'?'Cover Your Kingdom':", "STATG==='coverkingdom'?'Cover Your Kingdom':STATG==='balderdash'?'Beyond Balderdash':", 2)
rep("STATG==='coverkingdom'?'YEAR IN COVER YOUR KINGDOM':", "STATG==='coverkingdom'?'YEAR IN COVER YOUR KINGDOM':STATG==='balderdash'?'YEAR IN BALDERDASH':")
rep("S.game==='coverkingdom'?(cykOn()", "S.game==='balderdash'?'2 to 8 players. Each linked phone writes its own bluffs. No computer players.':S.game==='coverkingdom'?(cykOn()")
rep("coverkingdom:{get:()=>S.ckx,", "balderdash:{get:()=>S.bdx,set:v=>S.bdx=v,def:()=>({...BDDEF}),keep:()=>bdKeep()},coverkingdom:{get:()=>S.ckx,")
rep("  if(st.game==='coverkingdom'){S=cykFresh();", "  if(st.game==='balderdash'){S=bdFresh();Object.assign(S,{players:st.players,gameId:g.id,gameDate:g.date,started:true,finished:true,screen:'score',active:0,hr:1,editing:g.id,hideTotals:false});if(st.bdx)S.bdx=st.bdx;if(st.bdrec)S.bdrec=st.bdrec;while(S.players.length<8)S.players.push(newPlayer('',CARC_COLORS.find(c=>!S.players.some(p=>p.color===c))||'gray',false));UNDO=[];WARN=null;REV=null;return}\n  if(st.game==='coverkingdom'){S=cykFresh();")
rep("  coverkingdom:(x,i,h)=>", "  balderdash:(x,i,h)=>`<text x=\"${x+11}\" y=\"19\" text-anchor=\"middle\" font-size=\"15\">${['🎭','📖','🎬'][h%3]}</text>`,\n  coverkingdom:(x,i,h)=>")
rep("CY2=S.game==='coverkingdom';", "CY2=S.game==='coverkingdom',BD2=S.game==='balderdash';")
rep("map:CY2?cykSetup:", "map:BD2?bdSetup:CY2?cykSetup:")
rep("players:CY2?nxPlayers:", "players:BD2?nxPlayers:CY2?nxPlayers:")
rep("score:CY2?cykScoreScr:", "score:BD2?bdScoreScr:CY2?cykScoreScr:")
rep("if(S.game==='coverkingdom')cykHostTick();", "if(S.game==='coverkingdom')cykHostTick();if(S.game==='balderdash')bdTick();")
rep("if(S.game==='coverkingdom')return cykOn()&&S.ckg?cykActor(S.ckg):null;", "if(S.game==='coverkingdom')return cykOn()&&S.ckg?cykActor(S.ckg):null;if(S.game==='balderdash')return S.bdg?bdActor(S.bdg):null;")
rep("&&cykOn()&&S.started){cykUiAct(a,b,k);save();render();return}", "&&cykOn()&&S.started){cykUiAct(a,b,k);save();render();return}\n  if(/^bdu[a-z]+$/.test(a)&&S.game==='balderdash'&&S.started){bdUiAct(a,b,k);save();render();return}")
rep("    case 'ckstart':", """    case 'bdstart':{switchGame('balderdash');resetScores();clearPlayers();delete S.bdg;S.started=false;S.finished=false;S.screen='map';BDX();window.scrollTo(0,0);break}
    case 'ckstart':""")
rep("  cykMove:(pid,mv)=>", "  bdMove:(pid,mv)=>{const g=S.bdg;return !!g&&typeof bdMoveQ==='function'&&bdMoveQ(g,pid,mv)},\n  cykMove:(pid,mv)=>")
rep("S.game==='coverkingdom'?'Settle, recruit, hire and scoring':", "S.game==='coverkingdom'?'Settle, recruit, hire and scoring':S.game==='balderdash'?'Bluffs, voting and the staircase':")
rep("S.game==='coverkingdom'&&cykOn()||", "S.game==='coverkingdom'&&cykOn()||S.game==='balderdash'||")
rep("if(cykOn()&&S.ckg)return cykActor(S.ckg);", "if(cykOn()&&S.ckg)return cykActor(S.ckg);if(bdPlayOn()&&S.bdg)return bdActor(S.bdg);")
rep("if(cykOn()&&S.ckg&&S.ckg.phase==='done')cykSyncScorer(S.ckg);", "if(cykOn()&&S.ckg&&S.ckg.phase==='done')cykSyncScorer(S.ckg);if(bdPlayOn()&&S.bdg&&S.bdg.phase==='done')bdSyncScorer(S.bdg);")
rep("try{cykFx()}catch(e){}", "try{cykFx()}catch(e){}try{bdFx()}catch(e){}")
print('records', repall('+cykRecords(G)', '+cykRecords(G)+bdRecords(G)'))
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
