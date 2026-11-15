#!/usr/bin/env python3
"""Playable Wyrmspan (base game) on top of the Wyrmspan score pad. Usage: python3 integrate.py IN.html OUT.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'function wzDeal' not in s
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: raise SystemExit(f'anchor found {n}x (wanted {count}): {old[:100]!r}')
    s = s.replace(old, new)
code = open(f'{D}/data.js', encoding='utf-8').read() + open(f'{D}/game.js', encoding='utf-8').read() + open(f'{D}/ui.js', encoding='utf-8').read()
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
# home card: Play or Score
rep(""":`<button class="btn primary wide" data-a="gnew" data-k="wyrmspan">Score a game</button>`}""",
    """:`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="wzstart" data-k="1">🐉 Play</button><button class="btn" style="flex:1" data-a="wzstart" data-k="0">Score a game</button></div>`}""")
rep("    case 'dnstart':", "    case 'wzstart':{switchGame('wyrmspan');resetScores();clearPlayers();delete S.wzg;S.started=false;S.finished=false;S.screen='map';S.rules=S.rules||{};S.rules.play=k==='1'?1:0;window.scrollTo(0,0);break}\n    case 'wzplaymode':{if(S.started)break;S.rules=S.rules||{};S.rules.play=k==='1'?1:0;break}\n    case 'dnstart':")
rep("""  ${guideBtn()}<p class="hint" style="margin-top:14px">Highest score after 4 rounds wins.</p>""",
"""  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${wzOn()?'🐉 Playing on the phones':'Scoring the real game'}</b></div>`:`<div class="seg">${[[1,'🐉 Play on the phones'],[0,'Score the real game']].map(([v,t])=>`<button data-a="wzplaymode" data-k="${v}" aria-pressed="${!!(S.rules||{}).play===!!v}">${t}</button>`).join('')}</div>`}</div>
  <p class="hint">${wzOn()?'The base game: 183 dragons, 75 cave cards, the 4 guilds and the round objectives. The phone deals and keeps every coin, egg and card. Computer players, one shared phone (it hides each hand) or linked phones all work.':'Count the real game and the app adds it up.'}</p></div>
  <p class="hint" style="margin-top:14px">Highest score after 4 rounds wins.</p>""")
# screens
rep("WY2?wyScore:", "WY2?wyScoreScr:")
rep("function wyScore(){", "function wyScoreScr(){if(wzOn()&&S.started&&!S.demo)return wzPlayUI();return wyScore()}\nfunction wyScore(){")
rep("function wyGuide(){", "function wyGuide(){if(wzOn()&&S.started)return wzGuide();")
rep("function wyChecks(){", "function wyChecks(){if(wzOn()&&S.wzg)return [];")
rep("    case 'finish':{", "    case 'finish':{if(wzOn()&&S.wzg&&S.wzg.phase==='done')wzSyncScorer(S.wzg);")
# computer players in the players list
rep("S.game==='boggle'&&bgOn()||trOn()||wpOn())&&(!S.lk", "S.game==='boggle'&&bgOn()||trOn()||wpOn()||wzOn())&&(!S.lk")
# shared game hooks
rep("delete S.cpg;", "delete S.cpg;delete S.wzg;")
rep("wingspan:S.wpg,", "wingspan:S.wpg,wyrmspan:S.wzg,", 2)
rep("g==='wingspan'&&wpOn()||", "g==='wingspan'&&wpOn()||g==='wyrmspan'&&wzOn()||")
rep("S.game==='wingspan'&&wpOn()||", "S.game==='wingspan'&&wpOn()||S.game==='wyrmspan'&&wzOn()||")
rep("wingspan:()=>wpOn()&&S.wpg,", "wingspan:()=>wpOn()&&S.wpg,wyrmspan:()=>wzOn()&&S.wzg,")
rep("if(wpOn()&&S.wpg)return wpActor(S.wpg);", "if(wpOn()&&S.wpg)return wpActor(S.wpg);if(wzOn()&&S.wzg)return wzActor(S.wzg);")
rep("wpMove:(pid,mv)=>", "wzMove:(pid,mv)=>{const g=wzG();return !!g&&wzMove(g,pid,mv)},wpMove:(pid,mv)=>")
rep("if(wpOn())wpTick();", "if(wpOn())wpTick();if(wzOn())wzTick();")
rep("  if(/^wp(ans|", "  if(/^wz(ans|sel|look|show)$/.test(a)&&wzOn()&&S.started){wzUiAct(a,b,k);save();render();return}\n  if(/^wp(ans|")
rep("function lpSheet(){if(!LPTIP)return '';", "function lpSheet(){if(!LPTIP)return '';if(LPTIP.startsWith('wzd:')&&wzOn())return wzDragonSheet(+LPTIP.slice(4));")
rep("LPTIP.startsWith('wpb:')||", "LPTIP.startsWith('wpb:')||LPTIP.startsWith('wzd:')||")
open(out, 'w', encoding='utf-8').write(s)
print('ok')
