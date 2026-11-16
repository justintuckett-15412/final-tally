# Dead of Winter in Final Tally – shared spec (engine ↔ screen ↔ crossroads)

Game id in the app: `deadofwinter`. Prefix `dw`. All state in `S.dwg` (plain JSON, `_atom:1`). Files in /home/claude/dow:
data.js (built by mkdata.py, consts DWK DWI DWS DWCR DWMO DWSO DWLOC DWCOL), game.js (engine), ui.js (screen), style.css,
xr.js (crossroads data + handlers), integrate.py (wires into the app, run by /home/claude/build-all.sh after wyp), tests in
/home/claude/final-tally/tools/test/deadofwinter-*.test.js. Rules: dow/rules.txt (rulebook), dow/notes.md.

## Engine API (game.js) – same shape as Wyrmspan (wyp/game.js), read it first
- `dwOn()` → S.game==='deadofwinter'. `dwG()` → S.dwg. `dwDeal(opts)` new game from act() players; opts {mo:'id'|null(random), side:'std'|'hc', mode:'normal'|'coop'|'betrayer'}.
- `dwActor(g)` → pid who must act now (ask pid, a voter who hasn't voted, or g.turn), null when done.
- `dwWaits(g,pid)`, `dwMove(g,pid,mv)` → true if accepted (mutates g, bumps g.n). `dwBotStep(g,q)` (q = player object with .bot 'easy'|'normal'|'hard').
- `dwStale(g)`, `dwEnd(g)` sets g.phase='done', g.fin = {pid:{win:bool, obj:'name', why:'text', betrayer:bool, exiled:bool}}.
- Log/announce with gLog(g,text,icon) / gAnn(g,title,sub,icon) like the other games; names via nmid(pid).
- Questions: `g.ask={pid,msg,opts:[{v,l,k?}],opt:bool,kind?,multi?}`; answer moves `{v}` or `{skip:1}` (only if opt). Steps queue g.q with handlers DWS_[t](g,s,mv) returning true/false(asked)/null(bad answer) — copy the Wyrmspan pattern.
- Votes (exile, crossroads votes): `g.vote={kind:'exile'|'xr', target?, by, msg, need:[pids], got:{pid:true|false}}`; move `{vote:true|false}` from each pid in need; resolved when all in; ties → first player's vote decides (rulebook). Hidden until resolved.
- Turn actions (no ask pending, g.turn===pid): moves `{a:'attack',s:survId,die:i,target:'z'|survId}`, `{a:'search',s,die}` (then asks: keep / make noise), `{a:'barricade',s,die}`, `{a:'clean',die}`, `{a:'attract',s,die,from:loc}`, `{a:'ability',s,die?}`, `{a:'play',c:cardId,s?}` (equip to survivor s, or waste/event), `{a:'move',s,to:loc,fuel?:cardId}`, `{a:'food',die:i,n}`, `{a:'crisis',c:cardId|eq:{s,c}}`, `{a:'request',c}` (other player's answer via ask), `{a:'handoff',s,c,to}`, `{a:'exile',target}`, `{a:'objcard',c}` (place card under main objective), `{a:'end'}` end turn.
- Locations: 'colony','police','grocery','school','library','hospital','gas'.
- State sketch: g.mo {id,side,cards:[...] ,tokens:n}, g.morale, g.round (track value), g.food, g.starve, g.helpless, g.waste:[cardIds], g.removed (survivors removed count, not helpless), g.crisis {id, add:[{pid,c}]}, g.decks {police:[...],...,surv:[...],crisis:[...],xr:[...],exileObj:[...]}, g.loc[loc] = {z, bar, noise} (colony: ent:[{z,bar}x6]), g.sv[survId] = {pid, loc, w, fb, eq:[cardIds], used:{}}, g.P[pid] = {hand:[cardIds], lead:survId, follow:[survIds], obj:id, betray:bool, exiled:false, dice:[vals], used:[vals], moved:{}, xr:null}, g.fp, g.turn, g.phase 'setup'|'play'|'done', g.lg log, g.n counter.
- Privacy: the screen must never show another player's hand, objective, held crossroads card, or crisis contributions (only counts) unless g.phase==='done' or the rules reveal it.
- Exposure die (d12) faces: 6 blank, 3 wound, 2 frostbite, 1 bite (confirmed by Justin; keep in one const DWEXP).

## Crossroads hook API (xr.js)
- Data `DWXR=[{no,t:'title',trig:{...},say:'our short wording of the trigger',opts:[{say:'our wording',ops:[...]}],vote?:true}]`. Never copy the card's flavour text; write short plain summaries (the app says "read the card for the story").
- Engine calls `dwXrCheck(g,pid,ev,info)` at events: 'turnStart','move','search','attack','playCard','cleanWaste','spendFood','wound','frostbite','kill','barricade','turnEnd'. If the held card (g.P[drawer].xr) triggers, the engine shows it to the turn player as an ask with the options; `dwXrDo(g,pid,ops)` runs effect ops.
- Effect op vocabulary (engine implements in game.js `DWOP`): ['morale',n] ['food',n] ['helpless',n] ['wound',who,n] ['frost',who] ['kill',who] ['exposure',who,times] ['zombies',loc,n] ['noise',loc,n] ['item',deck,n] (draw to hand) ['discard',n] ['survivor',n] (draw new follower) ['removeSurv',who] ['moveSurv',who,loc] ['barricades',loc,n] ['waste',n] (add to waste from deck/ hand) ['dieMod',n] ['loseDie'] ['skipMove'] ['crisisAdd',n] ['round',n] ['custom','name'] — who: 'moved'|'leader'|'named:<survivor name>'|'all'|'mine'|'chosen'. Add ops as needed but list them in this file.

## Crossroads additions (from the crossroads agent, xr.js)
Extra events the engine should report via dwXrCheck(g,pid,ev,info): 'action' (after every action; also 'turnStart' – both check ev:'any' cards),
'heal' (a medicine card healed a survivor; info.healed), 'weapon' (a weapon card's ability was used; info.card), 'outsider' (an outsider card added a survivor; info.helpless = helpless added),
'frostbite' / 'wound' (from an exposure roll; info.s, info.onMove:true if after a move, info.to), 'move' (info {s, from, to, fuel:bool}), 'search' (info {s, at}), 'spendFood' (info {die,n}), 'cleanWaste'.
Present a triggered card by pushing step {t:'xr',pid,no,drawer,ctx} and registering DWXRSTEP as the 'xr' step handler; effect ops arrive as steps {t:'xrop',pid,a:op,ctx}.
When an xr vote resolves call dwXrVoted(g,no,up,ctx,byPid). Card in play: g.P[drawer].xr = card number; used cards go to g.xrOut.
"who" selectors used: moved, healed, searcher (ctx.s), new (survivor just added), it (inside rollEach), chosen (turn player picks one of theirs), chosenAt:<loc|nonColony|zLoc>,
named:<survivor name>, colonyAll (non-helpless at colony), mine (all theirs), atDest (all at ctx.to), eachColonyChosen (each player picks one of theirs at colony), lowestNot:<name>, chosenAny3 (up to 3 any survivors), pair (ctx.pair / ctx.pairLoc).
Location args may also be: 'from' (ctx.from), 'zLoc' (ctx.zLoc), 'pair' (ctx.pairLoc), 'nonColony' (every non-colony location).
New ops: ['foodSet',n] set food supply · ['helplessPer',n] n helpless per player · ['killHelpless',n] (morale −1 each) · ['fetch',deck|'any','choice'|'sym:x',n] take cards from a deck into hand (any = player picks the deck), reshuffle ·
['purge',deck,'sym:x'|'all'] remove those cards from the game · ['revealTake',deck,n,'sym:x'] reveal top n, keep matches, shuffle rest back · ['takeSurv',name,'lead'?] named survivor from the survivor deck joins (as group leader) ·
['removeSurvDeck',name] remove from the survivor deck · ['survivorEach'] every player draws a follower · ['place',who,loc] put survivor there, not a move, no exposure (skip if no room) · ['noMove',who] can't move again this turn ·
['freeze',who] can't attack/search/move this turn · ['clearZ',loc] remove all zombies · ['clearBar',loc] remove all barricades · ['killZ',loc,n] kill n zombies there, no exposure · ['killEach',n] remove n zombies from every location ·
['rollTable',[[lo,hi,ops],...]] roll one d6, run the matching row · ['rollEach',loc,max,ops] d6 per (non-helpless) survivor there; on ≤max run ops with who 'it' ·
['exposure',who,times,okOps?] roll exposure; okOps run if the survivor is still alive afterwards · ['removedToHand','sym:x',n] / ['removedToWaste','sym:x,y'|'any',n] move removed-from-game item cards ·
['wasteCard','used'] the weapon just used goes to the waste · ['loseRandomCard',n] random hand cards removed from game · ['loseCard',n] player picks hand cards to remove from game ·
['giveHand','exiledHere',keep] give all but keep cards to ctx.exiledPid · ['giveFollower','fewer'] give a follower to a player with fewer survivors · ['allDiceUsed'] · ['loseDieEach'] every player loses 1 unused die if able ·
['extraDie','all'|'me',n] next round's dice ± n · ['cancelFood'] the food spent doesn't raise the die · ['collective',{sym:n|die:n},'waste'|'remove'|'',ops,elseOps?,forced?] players may together give those cards (or unused dice) to run ops (forced = must) ·
['pay',{die:n},ops] turn player may give up n unused dice to run ops · ['peek','hands'|'objective'|'randomCardColony'|'handOther'|'showHandOther'] private reveal to the turn player (showHandOther = everyone) ·
['exileVote','colonyPlayer'] start an exile vote on a player (with survivors at the colony) the turn player picks · ['addWin','deputy'|'army'] extra main-objective condition (deputy: no zombies at gas, hospital, police; army: 5+ food) ·
['skipCrisis'] crisis to the bottom of its deck, no resolve this round · ['heal',who,n] · ['flag',name,...args] lasting effect, see below.
Flags the engine must honour (g.flags): addict(healed survivor: each of your turns play a medicine on it or lose a die) · noFoodCards(turn) · grayBeard(you can't add to crises while you control Gray Beard; he attacks once/round without exposure) ·
skipNextCrisis · olivia (see custom note in xr.js) · stay/never (survivor, location) · horse(survivor: no move exposure; +1 food paid each round while not exiled) · missingChild (check all 6 non-colony locations searched by end of next round) ·
walkways (no exposure attacking zombies at colony entrance 1) · waste15 · sleep(round) · workout · greenhouse (Andrew ability) · janetCare · noExpAttack(survivor, once/round) · snowmobile(survivor) · hunted.

## Engine as built (game.js) – moves and readings that differ from or add to the sketch above
- Step handlers are `DWQ[t]` (not DWS_, which is the survivor data). Steps may carry `onSkip(g,s)`.
- Extra / refined turn moves:
  - `{a:'attack',s,die,target:'z'|survId,use?:'edward'|'lighter'}` – use = spend Edward's/lighter effect where allowed.
  - `{a:'barricade',s,die,ent?:0-5}` – colony entrance (default: the riskiest).
  - `{a:'ability',s,die?,loc?,target?,die2?,dice?:[i..],who?:'greenhouse'}` – params per survivor (Sparky reroll dice, Gabriel loc, Janet target, etc.).
  - `{a:'use',s,c,...}` – use an equipped item's ability (same extra params as play).
  - `{a:'play',c,s?,t?,die?,v?,from?}` – s = equip target; t = target survivor (medicine/heal); die/v for die-changing cards; from = location for cards that move zombies.
  - `{a:'food',die,n}` – spend n food tokens to raise die i by n.
  - `{a:'request',what?}` – each other player with cards gets ask kind 'give'; given cards go to the requester's hand marked in P.req, cannot go to the crisis, and go to the waste at end of turn if not played.
  - `{a:'janet',c,t}` – Janet's give-card ability.
  - `{a:'yawn'}` – only from the crossroads drawer (dwRight of g.turn) while holding a card, once per turn; fires the 'yawn' crossroads event. The UI shows a "They yawned" button to the drawer. `dwBotYawn(g,p?)` lets a bot drawer tap it (25%).
- Flags: `['flag',name,'nextRound']` stores g.rndNo+1. Flier is checked in the colony phase just before the main objective: any location (colony counts total over its entrances) with 0 barricades → −1 morale, else every location 2+ → +1.
- Sleep: flag = round number; at the start of each turn that round, a player with a wounded survivor and dice gets an optional 'Rest' ask; yes moves all dice to used and heals 1 wound per survivor (frostbite first).
- Outsider event info is `{s:newSurvId, helpless:n}`; g.xrNew = the new survivor (selector 'new').
