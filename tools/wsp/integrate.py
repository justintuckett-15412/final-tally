#!/usr/bin/env python3
"""Playable Wingspan (base game) on top of the Wingspan score pad. Usage: python3 integrate.py IN.html OUT.html"""
import sys, os
D = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
assert 'function wpDeal' not in s
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count: raise SystemExit(f'anchor found {n}x (wanted {count}): {old[:100]!r}')
    s = s.replace(old, new)
code = open(f'{D}/data.js', encoding='utf-8').read() + open(f'{D}/game.js', encoding='utf-8').read() + open(f'{D}/ui.js', encoding='utf-8').read()
rep('\n/* ================= Stone Age on the phone =================', '\n' + code + '\n/* ================= Stone Age on the phone =================')
i = s.index('</style>'); s = s[:i] + open(f'{D}/style.css', encoding='utf-8').read() + s[i:]
rep("const WSDEF={side:'place'};", "const WSDEF={side:'place',play:0,swift:0};")
# home card: Play or Score
rep(""":`<button class="btn primary wide" data-a="gnew" data-k="wingspan">Score a game</button>`}""",
    """:`<div style="display:flex;gap:8px"><button class="btn primary" style="flex:1" data-a="wpstart" data-k="1">🐦 Play</button><button class="btn" style="flex:1" data-a="wpstart" data-k="0">Score a game</button></div>`}""")
rep("    case 'dnstart':", "    case 'wpstart':{switchGame('wingspan');resetScores();clearPlayers();delete S.wpg;S.started=false;S.finished=false;S.screen='map';WSX().play=k==='1'?1:0;wsKeep();window.scrollTo(0,0);break}\n    case 'wpplaymode':{if(S.started)break;WSX().play=k==='1'?1:0;wsKeep();break}\n    case 'wpswift':{if(S.started)break;WSX().swift=WSX().swift?0:1;wsKeep();break}\n    case 'dnstart':")
# setup: how you're playing
rep("""  ${guideBtn()}<p class="hint" style="margin-top:14px">Highest score after 4 rounds wins. The board side you pick is remembered for next time. ${usualUI('wingspan')}</p>""",
"""  ${guideBtn()}<div class="sec"><div class="sec-h"><h3>How you’re playing</h3></div><div class="panel hfpanel">${S.started?`<div class="rlab"><b>${wpOn()?'🐦 Playing on the phones':'Scoring the real game'}</b></div>`:`<div class="seg">${[[1,'🐦 Play on the phones'],[0,'Score the real game']].map(([v,t])=>`<button data-a="wpplaymode" data-k="${v}" aria-pressed="${!!X.play===!!v}">${t}</button>`).join('')}</div>`}</div>
  <p class="hint">${wpOn()?'The base game: 170 birds, 26 bonus cards, 4 round goals. The phone deals, rolls the feeder and keeps every bird, egg and card. Computer players, one shared phone (it hides each hand) or linked phones all work.':'Count the real game and the app adds it up.'}</p></div>
  ${wpOn()?`<div class="sec"><div class="sec-h"><h3>Bird deck</h3></div><div class="panel">${ctgS('swift',!!X.swift,'Add the 10 Swift-Start birds','If your deck has the Swift-Start promo birds mixed in. Off: the 170 regular birds.').replace('data-a="ctgs"','data-a="wpswift"')}</div></div>`:''}
  <p class="hint" style="margin-top:14px">Highest score after 4 rounds wins. The board side you pick is remembered for next time. ${usualUI('wingspan')}</p>""")
# screens
rep("WS2?wsScore:", "WS2?wsScoreScr:")
rep("function wsScore(){", "function wsScoreScr(){if(wpOn()&&S.started&&!S.demo)return wpPlayUI();return wsScore()}\nfunction wsScore(){")
rep("function wsGuide(){", "function wsGuide(){if(wpOn()&&S.started)return wpGuide();")
rep("function wsChecks(){", "function wsChecks(){if(wpOn()&&S.wpg)return [];")
rep("    case 'finish':{", "    case 'finish':{if(wpOn()&&S.wpg&&S.wpg.phase==='done')wpSyncScorer(S.wpg);")
# computer players in the players list
rep("S.game==='boggle'&&bgOn()||trOn())&&(!S.lk", "S.game==='boggle'&&bgOn()||trOn()||wpOn())&&(!S.lk")
# shared game hooks
rep("delete S.cpg;", "delete S.cpg;delete S.wpg;")
rep("catan:S.cpg,carc:S.ccg,ttr:S.trg,", "catan:S.cpg,carc:S.ccg,ttr:S.trg,wingspan:S.wpg,", 2)
rep("g==='catan'&&cpOn()||", "g==='catan'&&cpOn()||g==='wingspan'&&wpOn()||")
rep("S.game==='catan'&&cpOn()||", "S.game==='catan'&&cpOn()||S.game==='wingspan'&&wpOn()||")
rep("catan:()=>cpOn()&&S.cpg,", "catan:()=>cpOn()&&S.cpg,wingspan:()=>wpOn()&&S.wpg,")
rep("if(trOn()&&S.trg)return trActor(S.trg);", "if(trOn()&&S.trg)return trActor(S.trg);if(wpOn()&&S.wpg)return wpActor(S.wpg);")
rep("trTake:(pid,src,rp)=>", "wpMove:(pid,mv)=>{const g=wpG();return !!g&&wpMove(g,pid,mv)},wpSetup:(pid,b,f,bo)=>{const g=wpG();return !!g&&wpSetup(g,pid,b,f,bo)},trTake:(pid,src,rp)=>")
rep("if(trOn())trTick();", "if(trOn())trTick();if(wpOn())wpTick();")
rep("  if(/^trp[a-z]+$/.test(a)&&trOn()&&S.started){", "  if(/^wp(ans|pk|look|show|sb|sf|sbo|sgo|playsel|paysel|rsok|rcok|trf|ef)$/.test(a)&&wpOn()&&S.started){wpUiAct(a,b,k);save();render();return}\n  if(/^trp[a-z]+$/.test(a)&&trOn()&&S.started){")
rep("function lpSheet(){if(!LPTIP)return '';", "function lpSheet(){if(!LPTIP)return '';if(LPTIP.startsWith('wpb:')&&wpOn())return wpBirdSheet(+LPTIP.slice(4));")
rep("LPTIP.startsWith('ph:')||", "LPTIP.startsWith('ph:')||LPTIP.startsWith('wpb:')||")
open(out, 'w', encoding='utf-8').write(s)
print('ok')
