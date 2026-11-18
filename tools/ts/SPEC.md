# Telestrations in Final Tally: shared contract

Prefix `ts`, game key `telestrations`, state `S.tsg`, settings `S.tsx`. Source files in `/home/claude/ts/`:
`words.js` (done), `game.js` (done; read it first), `draw.js` (Agent DRAW), `ui.js` + `style.css` + `integrate.py` (Agent UI).
Build chain: `/home/claude/build-all.sh` (… dow → cn → **ts** → final-tally.html). Agent UI adds the ts step.
Engine checks: `node /home/claude/ts/sim.js` must print `bad 0 []`.

## Rules (Justin's 2010 rule sheet, original 8-player box)
- 4–8 players. Each round: a die (1–6) is rolled; each player has a card of 6 slots; the rolled slot is their secret word.
  A blank slot = make up any word; a category slot = make up a word in that category; a card marked "any" = pick any word on the card.
- Even players: you sketch your own word first. Odd players: your book passes first and the next player sketches your word.
- Sketch steps: 60-second timer (setting: 30/60/90/120/off), then "take a couple seconds to finish up". Guess steps: no timer.
- Pass to the left (dir 1); the direction reverses each round (setting `flip`, default on, from the rule sheet's play-again tip).
- After your own book comes back: the Big Reveal, book by book; the owner flips through.
- Scoring (optional, 3 rounds): **Friendly** (default, Justin's choice): the owner gives 1 point to their favourite sketch and 1 to their favourite guess in their book, and 1 to themselves if the last guess matches the secret word.
  **Competitive**: guessers 1 point if their guess matches the secret word or the previous guess; the sketcher right before a matching guess gets 1; the owner 1 if the last guess matches. **None**: keep playing until someone taps Stop.
- Hints to show: sketches have no letters or numbers; never leave a guess blank.
- No computer players (bots can't draw). Linked phones are required for play (each phone is a sketchbook). A phone that joins as "Just watching" (S.lk.me==='') is a big board: shows progress and the reveal, never anyone's task.

## Engine API (game.js)
- `tsDeal({words,own,ownOnly,scoring,timer,flip})` → g (phase 'pick', round 1). `tsStale(g)`.
- `tsMove(g,pid,mv)` moves: `{a:'word',w,slot}` (pick phase), `{a:'page',d}` (play: d = tsEnc string for a sketch, text for a guess),
  `{a:'timeup'}` (anyone, 4 s after `g.tEnd` in a sketch step: blank pages for anyone not done), `{a:'rvnext'}`, `{a:'rvprev'}` (book owner),
  `{a:'mark',f:'sketch'|'guess'|'self'|'match',p}` (owner, during their reveal), `{a:'bookdone'}` (owner), `{a:'next'}` / `{a:'stop'}` (roundEnd).
- Auto-play (house rule, Big Reveal): `tsDeal({auto})` → `g.auto` (4/6/8/10 s, 0 = owner flips, official). `g.rv.t` = when the page started (host clock), `g.rv.pz` = ms left while paused. Moves `{a:'rvauto'}` (host, when `tsAutoDue(g)==='page'`), `{a:'rvpause',on}` (owner; the host applies it directly), `rvnext`/`rvprev` take `p` (the page the owner saw) and restart the countdown. With No scoring the host also does `bookdone` when `tsAutoDue(g)==='book'`.
- Helpers: `tsPrompt(g,pid)` → {kind:'draw'|'guess', owner, word, draw}; `tsBookOf(g,pid,step)`, `tsHolder`, `tsKind(step)`, `tsRolled(g,pid)`, `tsTotal(g,pid)`, `tsMatchOK`, `tsSame`.
- `g.sub[pid]` = handed in this step. `g.tEnd` = sketch timer end (ms epoch) or null. `g.rv={i,p}` reveal position (p=-1 is the secret-word page).

## draw.js (Agent DRAW) must provide
- `tsEnc(strokes)` → compact string ≤ 6000 chars (simplify / quantise as needed); `tsDec(str)` → strokes. A stroke = `{w:1|2|3 (pen size), e:0|1 (eraser), p:[x,y,x,y,…]}` with x,y in 0..1000 (square canvas).
- `tsSvg(str,{size})` → an `<svg>` string (white square, black round-capped lines; eraser strokes drawn in white on top). Empty string → a blank page with "(left blank)".
- A drawing pad on its **own fixed layer** (`#tsdraw`, appended to `document.body`, like the Codenames `#cnfx` layer) so `render()` never wipes it:
  `tsPadSync({show, key, word, tEnd})` — called after every render and on a timer by ui.js. `key` = `gid:round:step:pid`; a new key clears the canvas; the same key keeps the strokes. `show:false` hides it.
  Tools: pen thin/thick, eraser, undo, clear; the word to draw at the top ("Sketch: DOGGIE BAG"); countdown from `tEnd`; a big **Done** button.
  On Done, or automatically ~2 s after `tEnd`, it calls `window.tsPadDone(encodedString)` (ui.js defines it and sends the move) and shows "Sent ✓ — waiting for the others".
  Pointer events (finger, mouse, pen), `touch-action:none` on the canvas, no page scroll while drawing, works in light/dark mode (canvas stays white), sized to fit a phone (square, ~min(92vw, 60vh)).

## ui.js (Agent UI) must provide (copy the Codenames pattern in /home/claude/cn/ui.js and cn/integrate.py)
TSDEF/TSX/tsKeep/tsSaved, tsPlayOn, tsFresh, TSM, tsP/tsTot, tsHomeCard, tsSetup (play mode, Words std/kid + family words, Scoring friendly/competitive/none, Sketch timer, Reverse each round, usualUI), tsScoreScr, tsScoreSheet (record a real game: points per round ×3 per player), tsChecks, tsResults, tsAwards, tsHistory, tsRevSteps, tsGuide, tsStats, tsTick (host deals when stale; host sends `timeup` once `Date.now()>tEnd+4000`), tsSyncScorer, tsUiAct (`/^tsu[a-z]+$/` actions, letters only), tsActor, tsPlayUI, plus a `tsFx()` layer for typing guesses / picking a made-up word (inputs must live outside #app).
Phases on screen: pick (your card with the die slot highlighted; blank/category → type; "any" → tap a word), play (your task: sketch → draw pad, guess → the drawing via tsSvg + a guess box; then "waiting for …" chips), reveal (current book page by page on every screen, big; owner has ◀ ▶ and, at the end, the scoring taps for the chosen mode, then "Done with my book"), roundEnd (scores so far, Next round / Stop), done (Finish → results).
