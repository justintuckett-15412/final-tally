# Beyond Balderdash: spec notes

Engine: `game.js` (state documented at the top). UI: `ui.js`. Styles: `style.css`. Built into the app by `integrate.py`. Engine check: `node sim.js` must print `bad 0`.

## The reveal (house rule "The reveal", setting `rv`)
- `BDDEF.rv` = seconds per answer: 3, 5 (default), 8 or 10; 0 = "All at once" (the reveal screen as before). Remembered per game with the other settings and covered by "Back to our usual rules".
- On the last vote, `bdReveal` scores the round as always and sets `g.rv={i:0,t}` (host clock) when `g.o.rv>0`.
- Steps (`bdRvOrd`): each bluff in the order shown (A, B, …, real answer skipped), then the real answer last. One step = one answer, the same on every phone and the board:
  - bluff: the letter and text, "Written by" each writer with their +N (votes from everyone but that writer), "Picked by" every voter (a writer's own vote on a merged bluff is marked "(own answer)"; it still scores for the co-writer), or "Fooled nobody" only when nobody picked it. The card viewer and the board's "Votes:" list mark own answers too;
  - real: "The real answer!", "Found by … +2" each, or "Nobody found it. Dasher +3";
  - two players: the 3 answers the same way ("Picked by …" / "Nobody picked it"), the real one last ("found it +2" or "missed it, Dasher +1").
- The host's 500 ms loop moves on (`rvauto`) once `g.o.rv` seconds have passed (`bdRvDue`). After the last step `g.rv=null` and the full reveal shows (points, basically correct, Double Score, staircase).
- Countdown bar on every screen. The Dasher (and the host, for them) can tap Next ▶ (`rvnext`, carries the step index so it never skips two) and ⏸/▶ (`rvpause`, stores the ms left in `rv.pz`).
- Sounds (app sound setting, once per step): a soft page turn for each bluff, the ta-da for the real answer, a chime for the points. "All at once" keeps the single ta-da.
- Cancelled cards never reach the reveal.

## After the reveal: passing the Dasher
- The round waits on the full reveal. Only the Dasher can `next` (the button reads "Pass the Dasher to <next> ▶"); the host gets a "Pass for <Dasher>" fallback; the others see "Waiting for …" and can Nudge the Dasher after 20 s (`pass`).
- If someone reached FINISH there is no pass: anyone taps "See who won".
- While waiting, each phone pages through the round's cards on its own (◀ ▶, dots or a swipe; local `BDCV`, never synced): the question card with the real answer, every answer card (writer, who it fooled / who found it, +points), and any basically-correct bluffs. The big board lists all the answers instead.

## UI actions (all match `^bdu[a-z]+$` in integrate.py)
`bducat bduedit bdubc bdushow bduread bduvote bdunext bdupass bdurvnext bdurvpause bducv bdunudge bdubig`
