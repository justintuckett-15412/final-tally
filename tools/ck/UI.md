# Cover Your Kingdom: phone screens and app integration

Engine contract: `SPEC.md` (unchanged). This file covers the UI.

## Where things live
- `/home/claude/ck/`: `data.js`, `game.js`, `bots.js` (engine), `ui.js` (screens), `export.js` (the hooks the app sees), `style.css`, `integrate.py`, `sim.js`.
- Build: `/home/claude/build-all.sh` → `… cn → ts (/tmp/with-ts.html) → ck/integrate.py → final-tally.html`. Copy in the repo: `tools/build-all.sh`, `tools/ck/`.
- Art: `art/ck-<id>.webp` (Creatures), `art/ckf-<id>.webp` (Family deck), `art/coverkingdom-icon.png`, `art/coverkingdom-banner.jpg`. Kept in `/tmp/claude-0/build/rtsrv/art/` (build.py copies that folder into the repo) and in `/home/claude/final-tally/art/` (setup-session.sh copies it back).

## Names: why `cyk…`
Catan's Cities & Knights already has global `ck…` names (`ckBot`, `ckGive`, `ckMove`, `ckGuide`, `ckUiAct`, `CKM`, `LKQF.ckMove`, `.ck…` CSS classes).
So `integrate.py` wraps `data.js + game.js + bots.js + ui.js + export.js` in one function scope. Inside, everything keeps the `ck` prefix.
Outside, the app only sees `cykOn, cykFresh, cykM, cykTot, cykHomeCard, cykSetup, cykScoreScr, cykAwards, cykHistory, cykGuide, cykChecks, cykRevSteps, cykResults, cykStats, cykRecords, cykHostTick, cykActor, cykUiAct, cykSyncScorer, cykFx, cykMoveQ, cykDef, cykX, cykKeep, cykDone` and `CYK` (engine functions, for tests).
CSS classes are `cyk…`; `html.cykplay` (play screen), `html.cykbigb` (big board).

## Keys
- Game key `coverkingdom`. State `S.ckg` (engine state + `g.art`, plus `g.nz`/`g.nzl` for nudges). Records `S.ckrec` (`ext, rounds, win, two, cons, pow`) and `p.ck = {r:[magic per round], c:[creatures per round], w:wins}`.
- Settings `S.ckx` / `localStorage KEY+'.ckx'`, defaults `CKDEF = {play:1, two:1, cons:0, ls:0, pow:0, ext:'one', art:'creatures'}`; the shared usualUI "Back to our usual rules" (UG entry `coverkingdom`).
- Screen actions `/^cku[a-z]+$/` (only while `S.game==='coverkingdom'`), plus `ckstart` on the home card and `ckuopt` (setup choices, a capture listener).
- Linked moves: `lkq('cykMove', pid, {…mv, st:'gid:round'})` → `LKQF.cykMove` → `ckMoveQ` on the host (checks `st`, handles `{a:'nudge',to}`, then `ckMove`).
- Host only: `ckHostTick` (in the app's tick loop) runs the queue, deals when stale, and runs computer players one move at a time (`ckTick`, 900 ms × `htSpd()`), plus a watchdog interval.

## Screens
- Setup: Two Ruler rules, Constellation Prizes + Light Speed, Kingdom Powers (none / 1 / 2), Extended contest, Card art (Creatures / Family deck). "Score a game" = a record sheet (magic per round).
- Players: 2–8, 👤 makes a seat a computer player. 2+ people need linked phones; 1 person + computer players works on one phone.
- Play (phone): turn banner (action dots), last log line, the challenge chain (everyone), rivals (compact rows: hand as card backs, magic, ⭐ count, powers, lands with peeking gems and the top Clan), deck / discard / retired, your Kingdom (+ constellations, Kingdom Power cards), and a bottom dock: the guided-move panel, your hand (tap to pick) and the action buttons (Settle, Recruit, Hire, Add, Discard, Inn, Kid, End turn).
- Guided moves: pick cards → action → glowing targets (rival land, your land, or a rival's name for Hypnogriff) → choice buttons (Wiizzzaard direction, Mobgoblins clan to give, Extra Freatures "use it as", land, Match Maker free, move an Either Clan). Inn: tap piles in the panel + a card → Take them. Hypnogriff return, placing a won Clan, Inn hires: prompts in the dock.
- Challenge pop-up for the awaited player only (counters from `ckCounters`, Let it go, no time limit); everyone else sees the chain and a 🔔 Nudge.
- Round end / done: score table (gems, bonus with breakdown, total, Creatures), extended standings, Start next round, Finish → results, awards, rematch.
- Big board ("Just watching", or 📺 on a linked phone): banner, log, chain, table, every Kingdom; never a hand.

## Tests
- `tools/test/coverkingdom-link.test.js` (in `run.sh`): 3 linked phones + 1 computer player (settle, settle, recruit with a 4-step counter chain on the pop-ups, nudge, Pigxie land choice, Mobgoblins target, computer turn, discard, End turn, computer players finish, score table = ckScore on every phone and the big board, Finish), a 2-player Drafty Inn take with a challenge pop-up, Family deck vs Creatures art, every guided flow on one phone (Wiizzzaard, Minnowtaur, Hypnogriff, recruit + place, Add + move, Match Maker, Wiizzz Kid, DissedHard), privacy on every step, layout, no page errors. Screenshots in `/tmp/ck-shots/` (400×850 and 360×640).
- Engine: `node /home/claude/ck/sim.js` → `bad 0`.
