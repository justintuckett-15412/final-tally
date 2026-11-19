#!/usr/bin/env python3
"""Add Cover Your Kingdom (play on linked phones with computer players + score a game) to the app. Runs after ts.
Usage: python3 integrate.py IN.html OUT.html
Catan's Cities & Knights already owns global ck… names (ckBot, ckGive, ckMove, ckGuide, ckUiAct, CKM, LKQF.ckMove, .ck… classes),
so data.js + game.js + bots.js + ui.js run inside one function scope and export.js hands the app only cyk… hooks."""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'cykHomeCard' not in s and 'function tsFresh' in s
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
body = ''.join(open(f'{D}/{f}', encoding='utf-8').read() + '\n' for f in ['data.js', 'game.js', 'bots.js', 'ui.js', 'export.js'])
code = '/* ================= Cover Your Kingdom (its own scope; see ck/integrate.py) ================= */\n(function(){\n' + body + '})();\n'
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
print('generic',
  repall("S.game==='codenames'||S.game==='telestrations'", "S.game==='codenames'||S.game==='telestrations'||S.game==='coverkingdom'"),
  repall("S.game!=='codenames'&&S.game!=='telestrations'", "S.game!=='codenames'&&S.game!=='telestrations'&&S.game!=='coverkingdom'"),
  repall("gm.game!=='codenames'&&gm.game!=='telestrations'", "gm.game!=='codenames'&&gm.game!=='telestrations'&&gm.game!=='coverkingdom'"),
  repall("'codenames','telestrations'", "'codenames','telestrations','coverkingdom'"),
  repall("['telestrations','Telestrations']", "['telestrations','Telestrations'],['coverkingdom','Cover Your Kingdom']"),
  repall("telestrations:()=>tsPlayOn()&&S.tsg", "telestrations:()=>tsPlayOn()&&S.tsg,coverkingdom:()=>cykOn()&&S.ckg"))
rep("g==='telestrations'?KEY+'.telestrations':", "g==='telestrations'?KEY+'.telestrations':g==='coverkingdom'?KEY+'.coverkingdom':")
rep("g==='telestrations'?tsFresh():", "g==='telestrations'?tsFresh():g==='coverkingdom'?cykFresh():")
rep("CURG==='telestrations'?tsFresh():", "CURG==='telestrations'?tsFresh():CURG==='coverkingdom'?cykFresh():")
rep("S.game==='telestrations'?TSM():", "S.game==='telestrations'?TSM():S.game==='coverkingdom'?cykM():")
rep("S.game==='telestrations'?tsTot(p):", "S.game==='telestrations'?tsTot(p):S.game==='coverkingdom'?cykTot(p):")
rep("delete S.tsg;if(S.game==='telestrations'){S.players.forEach(p=>p.ts=null);S.tsrec={};S.hr=0}", "delete S.tsg;if(S.game==='telestrations'){S.players.forEach(p=>p.ts=null);S.tsrec={};S.hr=0}delete S.ckg;if(S.game==='coverkingdom'){S.players.forEach(p=>p.ck=null);S.ckrec={};S.hr=0;try{cykDone()}catch(e){}}")
rep("g==='telestrations'&&tsPlayOn()||", "g==='telestrations'&&tsPlayOn()||g==='coverkingdom'&&cykOn()||")
rep("codenames:S.cng,telestrations:S.tsg,", "codenames:S.cng,telestrations:S.tsg,coverkingdom:S.ckg,", s.count("codenames:S.cng,telestrations:S.tsg,"))
rep("W('telestrations',", "W('coverkingdom','cover your kingdom creatures clans card game kingdom bragon spydra',cykHomeCard()),W('telestrations',")
for f in ['Awards()', 'History(pid)', 'Guide()', 'Checks()', 'RevSteps()', 'Results()']:
    rep(f"if(S.game==='telestrations')return ts{f};", f"if(S.game==='telestrations')return ts{f};if(S.game==='coverkingdom')return cyk{f};")
rep("...(S.game==='telestrations'?{tsx:S.tsx,tsrec:S.tsrec}:{}),", "...(S.game==='telestrations'?{tsx:S.tsx,tsrec:S.tsrec}:{}),...(S.game==='coverkingdom'?{ckx:S.ckx,ckrec:S.ckrec}:{}),")
rep("  telestrations:p=>tsStats(p),", "  telestrations:p=>tsStats(p),\n  coverkingdom:p=>cykStats(p),")
rep("  if(g==='telestrations')return [", "  if(g==='coverkingdom')return [['👑','🐉','💎','👑'].map(c=>wlSvg(26,26,`<text x=\"13\" y=\"19\" text-anchor=\"middle\" font-size=\"17\">${c}</text>`)),'Shuffling the Creatures…'];\n  if(g==='telestrations')return [")
rep("telestrations:'Telestrations',", "telestrations:'Telestrations',coverkingdom:'Cover Your Kingdom',")
rep("STATG==='telestrations'?'Telestrations':", "STATG==='telestrations'?'Telestrations':STATG==='coverkingdom'?'Cover Your Kingdom':", 2)
rep("STATG==='telestrations'?'YEAR IN TELESTRATIONS':", "STATG==='telestrations'?'YEAR IN TELESTRATIONS':STATG==='coverkingdom'?'YEAR IN COVER YOUR KINGDOM':")
rep("S.game==='telestrations'?'4 to 8 players. Each linked phone is a sketchbook. No computer players.':", "S.game==='coverkingdom'?(cykOn()?'2 to 8 Rulers. Link the phones so everyone holds their own hand.'+(S.lk&&!lkHost()?'':' Tap 👤 to make a seat a computer player.'):'2 to 8 players.'):S.game==='telestrations'?'4 to 8 players. Each linked phone is a sketchbook. No computer players.':")
rep("telestrations:{get:()=>S.tsx,", "coverkingdom:{get:()=>S.ckx,set:v=>S.ckx=v,def:()=>cykDef(),keep:()=>cykKeep()},telestrations:{get:()=>S.tsx,")
rep("  if(st.game==='telestrations'){S=tsFresh();", "  if(st.game==='coverkingdom'){S=cykFresh();Object.assign(S,{players:st.players,gameId:g.id,gameDate:g.date,started:true,finished:true,screen:'score',active:0,hr:1,editing:g.id,hideTotals:false});if(st.ckx)S.ckx=st.ckx;if(st.ckrec)S.ckrec=st.ckrec;S.ckx.play=0;while(S.players.length<8)S.players.push(newPlayer('',CARC_COLORS.find(c=>!S.players.some(p=>p.color===c))||'gray',false));UNDO=[];WARN=null;REV=null;return}\n  if(st.game==='telestrations'){S=tsFresh();")
rep("  telestrations:(x,i,h)=>", "  coverkingdom:(x,i,h)=>`<text x=\"${x+11}\" y=\"19\" text-anchor=\"middle\" font-size=\"15\">${['👑','🐉','💎'][h%3]}</text>`,\n  telestrations:(x,i,h)=>")
rep("CN2=S.game==='codenames',TS2=S.game==='telestrations';", "CN2=S.game==='codenames',TS2=S.game==='telestrations',CY2=S.game==='coverkingdom';")
rep("map:TS2?tsSetup:", "map:CY2?cykSetup:TS2?tsSetup:")
rep("players:TS2?nxPlayers:", "players:CY2?nxPlayers:TS2?nxPlayers:")
rep("score:TS2?tsScoreScr:", "score:CY2?cykScoreScr:TS2?tsScoreScr:")
rep("if(S.game==='telestrations')tsTick();", "if(S.game==='telestrations')tsTick();if(S.game==='coverkingdom')cykHostTick();")
rep("if(S.game==='telestrations')return tsPlayOn()&&S.tsg?tsActor(S.tsg):null;", "if(S.game==='telestrations')return tsPlayOn()&&S.tsg?tsActor(S.tsg):null;if(S.game==='coverkingdom')return cykOn()&&S.ckg?cykActor(S.ckg):null;")
rep("  if(/^tsu[a-z]+$/.test(a)&&tsPlayOn()&&S.started){tsUiAct(a,b,k);save();render();return}", "  if(/^tsu[a-z]+$/.test(a)&&tsPlayOn()&&S.started){tsUiAct(a,b,k);save();render();return}\n  if(/^cku[a-z]+$/.test(a)&&S.game==='coverkingdom'&&cykOn()&&S.started){cykUiAct(a,b,k);save();render();return}")
rep("    case 'tsstart':", """    case 'ckstart':{switchGame('coverkingdom');resetScores();clearPlayers();delete S.ckg;S.started=false;S.finished=false;S.screen='map';cykX().play=k==='1'?1:0;cykKeep();window.scrollTo(0,0);break}
    case 'tsstart':""")
rep("  tsMove:(pid,mv)=>", "  cykMove:(pid,mv)=>{const g=S.ckg;return !!g&&typeof cykMoveQ==='function'&&cykMoveQ(g,pid,mv)},\n  tsMove:(pid,mv)=>")
rep("S.game==='telestrations'?'Your word, passing the books and the Big Reveal':", "S.game==='telestrations'?'Your word, passing the books and the Big Reveal':S.game==='coverkingdom'?'Settle, recruit, hire and scoring':")
rep("S.game==='telestrations'&&tsPlayOn()||", "S.game==='telestrations'&&tsPlayOn()||S.game==='coverkingdom'&&cykOn()||")
rep("if(tsPlayOn()&&S.tsg)return tsActor(S.tsg);", "if(tsPlayOn()&&S.tsg)return tsActor(S.tsg);if(cykOn()&&S.ckg)return cykActor(S.ckg);")
rep("if(tsPlayOn()&&S.tsg&&S.tsg.phase==='done')tsSyncScorer(S.tsg);", "if(tsPlayOn()&&S.tsg&&S.tsg.phase==='done')tsSyncScorer(S.tsg);if(cykOn()&&S.ckg&&S.ckg.phase==='done')cykSyncScorer(S.ckg);")
rep("try{cnFx()}catch(e){}try{tsFx()}catch(e){}", "try{cnFx()}catch(e){}try{tsFx()}catch(e){}try{cykFx()}catch(e){}")
print('records', repall('+tsRecords(G)', '+tsRecords(G)+cykRecords(G)'))
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
