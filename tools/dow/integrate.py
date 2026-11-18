#!/usr/bin/env python3
"""Add Dead of Winter (play on the phones + record a game) to the app. Runs after wyp. Usage: python3 integrate.py IN.html OUT.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'function dwFresh' not in s and 'function wzDeal' in s
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: raise SystemExit(f'anchor found {n}x (wanted {count}): {old[:100]!r}')
    s = s.replace(old, new)
code = ''.join(open(f'{D}/{f}', encoding='utf-8').read() + '\n' for f in ['data.js', 'game.js', 'xr.js', 'ui.js'] if os.path.exists(f'{D}/{f}'))
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
# games with their own setup / sheet
A = "S.game==='wordtiles'||S.game==='upwords'"
n1 = s.count(A); s = s.replace(A, A + "||S.game==='deadofwinter'")
B = "S.game!=='wordtiles'&&S.game!=='upwords'"
n2 = s.count(B); s = s.replace(B, B + "&&S.game!=='deadofwinter'")
C = "gm.game!=='wordtiles'&&gm.game!=='upwords'"
n3 = s.count(C); s = s.replace(C, C + "&&gm.game!=='deadofwinter'")
print('generic', n1, n2, n3)
rep("['wordtiles','Word Tiles'],['upwords','Upwords']", "['wordtiles','Word Tiles'],['upwords','Upwords'],['deadofwinter','Dead of Winter']", 3)
rep("g==='upwords'?KEY+'.upwords':", "g==='upwords'?KEY+'.upwords':g==='deadofwinter'?KEY+'.deadofwinter':")
rep("g==='upwords'?uwFresh():", "g==='upwords'?uwFresh():g==='deadofwinter'?dwFresh():")
rep("CURG==='upwords'?uwFresh():", "CURG==='upwords'?uwFresh():CURG==='deadofwinter'?dwFresh():")
rep("S.game==='upwords'?UWM():", "S.game==='upwords'?UWM():S.game==='deadofwinter'?DWM():")
rep("S.game==='upwords'?uwTot(p):", "S.game==='upwords'?uwTot(p):S.game==='deadofwinter'?dwTot(p):")
rep("delete S.uwg;if(S.game==='upwords'){S.players.forEach(p=>p.uw=null);S.hr=0}", "delete S.uwg;if(S.game==='upwords'){S.players.forEach(p=>p.uw=null);S.hr=0}delete S.dwg;if(S.game==='deadofwinter'){S.players.forEach(p=>p.dw=null);S.dwrec={};S.hr=0}")
rep("g==='upwords'&&uwOn()||", "g==='upwords'&&uwOn()||g==='deadofwinter'&&dwPlayOn()||")
rep("wyrmspan:S.wzg,", "wyrmspan:S.wzg,deadofwinter:S.dwg,", 2)
rep("'wordtiles','upwords',", "'wordtiles','upwords','deadofwinter',", s.count("'wordtiles','upwords',"))
rep("W('upwords','upwords stacking stack word letters board',uwHomeCard()),", "W('upwords','upwords stacking stack word letters board',uwHomeCard()),W('deadofwinter','dead of winter zombies survival crossroads colony traitor betrayal',dwHomeCard()),")
for f in ['Awards()', 'History(pid)', 'Guide()', 'Checks()', 'RevSteps()', 'Results()']:
    rep(f"if(S.game==='upwords')return uw{f};", f"if(S.game==='upwords')return uw{f};if(S.game==='deadofwinter')return dw{f};")
rep("...(S.game==='upwords'?{uwx:S.uwx}:{}),", "...(S.game==='upwords'?{uwx:S.uwx}:{}),...(S.game==='deadofwinter'?{dwx:S.dwx,dwrec:S.dwrec}:{}),")
rep("  upwords:p=>{", "  deadofwinter:p=>dwStats(p),\n  upwords:p=>{")
rep("  if(g==='upwords')return [", "  if(g==='deadofwinter')return [['🧟','❄️','🏚️','🧟'].map(c=>wlSvg(26,26,`<text x=\"13\" y=\"19\" text-anchor=\"middle\" font-size=\"17\">${c}</text>`)),'Digging out the colony…'];\n  if(g==='upwords')return [")
rep("wordtiles:'Word Tiles',upwords:'Upwords',", "wordtiles:'Word Tiles',upwords:'Upwords',deadofwinter:'Dead of Winter',")
rep("STATG==='upwords'?'Upwords':", "STATG==='upwords'?'Upwords':STATG==='deadofwinter'?'Dead of Winter':", 2)
rep("STATG==='upwords'?'YEAR IN UPWORDS':", "STATG==='upwords'?'YEAR IN UPWORDS':STATG==='deadofwinter'?'YEAR IN DEAD OF WINTER':")
rep("S.game==='upwords'?(uwOn()?", "S.game==='deadofwinter'?(dwPlayOn()?'1 to 5 players.'+(S.lk&&!lkHost()?'':' Tap 👤 to make a seat a computer player.'):'2 to 5 players.'):S.game==='upwords'?(uwOn()?")
rep(",upwords:()=>uwOn()&&S.uwg}", ",upwords:()=>uwOn()&&S.uwg,deadofwinter:()=>dwPlayOn()&&S.dwg}")
rep("upwords:{get:()=>S.uwx,", "deadofwinter:{get:()=>S.dwx,set:v=>S.dwx=v,def:()=>({...DWDEF}),keep:()=>dwKeep()},upwords:{get:()=>S.uwx,")
rep("  if(st.game==='upwords'){S=uwFresh();", "  if(st.game==='deadofwinter'){S=dwFresh();Object.assign(S,{players:st.players,gameId:g.id,gameDate:g.date,started:true,finished:true,screen:'score',active:0,hr:1,editing:g.id,hideTotals:false});if(st.dwx)S.dwx=st.dwx;if(st.dwrec)S.dwrec=st.dwrec;S.dwx.play=0;while(S.players.length<8)S.players.push(newPlayer('',CARC_COLORS.find(c=>!S.players.some(p=>p.color===c))||'gray',false));UNDO=[];WARN=null;REV=null;return}\n  if(st.game==='upwords'){S=uwFresh();")
rep("  upwords:(x,i,h)=>", "  deadofwinter:(x,i,h)=>`<text x=\"${x+11}\" y=\"19\" text-anchor=\"middle\" font-size=\"15\">${['🧟','❄️','🏚️'][h%3]}</text>`,\n  upwords:(x,i,h)=>")
rep("UW2=S.game==='upwords';", "UW2=S.game==='upwords',DW2=S.game==='deadofwinter';")
rep("map:UW2?uwSetup:", "map:DW2?dwSetup:UW2?uwSetup:")
rep("players:UW2?nxPlayers:", "players:DW2?nxPlayers:UW2?nxPlayers:")
rep("score:UW2?uwScoreScr:", "score:DW2?dwScoreScr:UW2?uwScoreScr:")
rep("if(S.game==='upwords')uwTick();", "if(S.game==='upwords')uwTick();if(S.game==='deadofwinter')dwTick();")
rep("if(S.game==='upwords')return uwOn()&&S.uwg?uwActor(S.uwg):null;", "if(S.game==='upwords')return uwOn()&&S.uwg?uwActor(S.uwg):null;if(S.game==='deadofwinter')return dwPlayOn()&&S.dwg&&typeof dwActor==='function'?dwActor(S.dwg):null;")
rep("  if(/^uwp[a-z]+$/.test(a)&&S.game==='upwords'", "  if(/^dw(sel|ans|show|what|goal|vok)$/.test(a)&&dwPlayOn()&&S.started){dwUiAct(a,b,k);save();render();return}\n  if(/^uwp[a-z]+$/.test(a)&&S.game==='upwords'")
rep("    case 'uwstart':", """    case 'dwstart':{switchGame('deadofwinter');resetScores();clearPlayers();delete S.dwg;S.started=false;S.finished=false;S.screen='map';DWX().play=k==='1'?1:0;dwKeep();window.scrollTo(0,0);break}
    case 'dwplaymode':{if(S.started)break;DWX().play=k==='1'?1:0;dwKeep();break}
    case 'dwmo':{if(S.started&&dwPlayOn())break;DWX().mo=k||'';dwKeep();break}
    case 'dwside':{if(S.started&&dwPlayOn())break;DWX().side=k==='hc'?'hc':'std';dwKeep();break}
    case 'dwmode':{if(S.started&&dwPlayOn())break;DWX().mode=['normal','betrayer','loyal','coop'].includes(k)?k:'normal';if(k==='coop')DWX().side='hc';dwKeep();break}
    case 'dwrec':{const [i,f]=String(k).split(':'),q=act()[+i];if(!q)break;const D=dwP(q);D[f]=D[f]?0:1;break}
    case 'dwrecmo':{(S.dwrec=S.dwrec||{}).mo=k;break}
    case 'dwrecside':{(S.dwrec=S.dwrec||{}).side=k;break}
    case 'dwrecend':{(S.dwrec=S.dwrec||{}).end=k;break}
    case 'uwstart':""")
rep("  if(e.target.dataset.uwf){", "  if(e.target.dataset.dwo){const q=act()[+e.target.dataset.dwo];if(q){dwP(q).obj=e.target.value.trim();save()}return}\n  if(e.target.dataset.uwf){")
rep("  uwPlay:(pid,pl)=>", "  dwMove:(pid,mv)=>{const g=S.dwg;return !!g&&typeof dwMove==='function'&&dwMove(g,pid,mv)},\n  uwPlay:(pid,pl)=>")
rep("'wordtiles','upwords'].includes(S.game)))?rulesSheet()", "'wordtiles','upwords','deadofwinter'].includes(S.game)))?rulesSheet()")
rep("S.game==='upwords'?'A turn, stacking, scoring and the end':", "S.game==='upwords'?'A turn, stacking, scoring and the end':S.game==='deadofwinter'?'A round, your turn, the colony phase and the end':")
# play-on-the-phones plumbing (like Wyrmspan)
rep("S.game==='wyrmspan'&&wzOn()||", "S.game==='wyrmspan'&&wzOn()||S.game==='deadofwinter'&&dwPlayOn()||")
rep("wyrmspan:()=>wzOn()&&S.wzg,", "wyrmspan:()=>wzOn()&&S.wzg,deadofwinter:()=>dwPlayOn()&&S.dwg,")
rep("if(wzOn()&&S.wzg)return wzActor(S.wzg);", "if(wzOn()&&S.wzg)return wzActor(S.wzg);if(dwPlayOn()&&S.dwg&&typeof dwActor==='function')return dwActor(S.dwg);")
rep("    case 'finish':{", "    case 'finish':{if(dwPlayOn()&&S.dwg&&S.dwg.phase==='done')dwSyncScorer(S.dwg);")
rep("function lpSheet(){if(!LPTIP)return '';", "function lpSheet(){if(!LPTIP)return '';if(LPTIP.startsWith('dws:')&&S.game==='deadofwinter')return dwSurvSheet(+LPTIP.slice(4));if(LPTIP==='dww:1'&&S.game==='deadofwinter')return dwWhatSheet();if(LPTIP==='dwo:1'&&S.game==='deadofwinter')return dwGoalSheet();if(LPTIP.startsWith('dwi:')&&S.game==='deadofwinter')return dwItemSheet(+LPTIP.slice(4));")
rep("LPTIP.startsWith('wzd:')||", "LPTIP.startsWith('wzd:')||LPTIP.startsWith('dws:')||LPTIP.startsWith('dwi:')||LPTIP.startsWith('dww:')||LPTIP.startsWith('dwo:')||")
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
