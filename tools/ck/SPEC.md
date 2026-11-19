# Cover Your Kingdom in Final Tally: engine contract

Prefix `ck`. Source files in `/home/claude/ck/`: `data.js`, `game.js`, `bots.js`, `sim.js`. No UI yet.
Load order: data.js → game.js → bots.js. Engine check: `node /home/claude/ck/sim.js [games]` (default 2000) must print `bad 0 []`.
Rules source: Grandpa Beck's rulebook (2019/2021), standard rules pages 4–13, Two Rulers 14–15, advanced 16–18.

## Cards and data (data.js)
- `CK_SP`: 17 species. `{id, name, kind:'clan'|'wild'|'hire', count, v, land:'high'|'low'|'either', land2:'high'|'low'|'mane'|'any', cl}`.
  Clanning: yy Yogi Yedi 13, pg Pigxie 13, lc LepreCon Men 13, sc Sighclops 13, ve VulcEnt 13, pl PegLegasi 11, he Hentaur 11, uh UniqueHorns 11, kl Klaken 9, br Bragon 9.
  Wild: ct CerbeRussel Terrier 10, sp Spydra 5. Hire (value 0): mt Minnowtaur, hy Hypnogriff, el Grumbledalf's Elves, wz Wiizzzaard, mb Mobgoblins, 2 each. 141 cards in total.
- **`CK_TODO`** holds every value and land that isn't in the rulebook text, as `[value, land]`. The engine reads values and lands only from this table (`ckVal`, `ckLandsFor`).
- `CK_2P_OUT`: Two Rulers removals (2 of each Clanning Creature, 2 CTs, 1 Spydra, 2 Minnowtaurs): 116 cards.
- `CK_BONUS`: constellation bonuses by player count. `CK_TOK_SHARED` = 6 (7–8 Rulers: 60 tokens in 10 piles).
- `CK_POW`: the 8 Kingdom Powers `{id, name, kind:'act'|'mod', no23, text}`: wkid, dh, mm (action); eq, xf, swine, vh, sub (modifying).

### CK_TODO: Justin to confirm from card photos
| species | value now | land now | where it came from |
|---|---|---|---|
| Pigxie | 5 ✓ | Either ✓ | rulebook text |
| Hentaur | 10 ? | Either ✓ | land from rulebook text |
| PegLegasi | 10 (likely) | Highland ? | page 5 card picture shows a 10 gem; land from the page 16 constellation picture |
| Bragon | 15 ? | Highland ? | page 16 picture |
| Yogi Yedi | 5 ? | Highland ? | page 16 picture |
| Sighclops | 5 ? | Highland ? | page 16 picture |
| VulcEnt | 5 ? | Lowland ? | page 16 picture |
| LepreCon Men | 5 ? | Lowland ? | page 16 picture (a LepreCon card with a 5 gem is shown) |
| UniqueHorns | 10 ? | Lowland ? | page 16 picture |
| Klaken | 15 ? | Lowland ? | page 16 picture and page 5 board |
| CerbeRussel Terrier | 20 ? | (wild) | a CT gem on page 16 looks like 20 |
| Spydra | 40 ? | (wild) | the rainbow 40 gem on page 5 |
Values were guessed by rarity (13 cards = 5, 11 = 10, 9 = 15). Constellation cluster `cl` = the standard land (the page 16 picture shows 4 Highland, 2 Either, 4 Lowland tokens). Tiny numbers on the Pigxie and Hentaur cards (rulebook tip, page 6) aren't explained; ignored.

## State `g` (plain JSON, synced; only the host applies moves)
```
gid, ps:[pid] seat order (index+1 = to the left), o:{two, cons, ls, pow:0|1|2, ext:'one'|'acc2'|'acc3'|'first2'},
bots:{pid:1}, pw:{pid:[power ids]}, rs (seeded random state), n (moves made), cid (clan id counter),
round, phase:'play'|'roundEnd'|'done', cs:[species of card i],
draw:[ids] (top = last), disc:[ids] (top = last), ret:[ids] (retired pile + everything the Elves take),
hand:{pid:[ids]}, k:{pid:{high:[clan], low:[clan], mane:[clan] (Two Rulers)}} stacks bottom→top,
  clan = {id, sp, c:[ids]} c bottom→top: Wilds (and Equinity Hentaurs) first, the clan's own species on top
mt:[{c, by, t, land, up}] Minnowtaurs on the table (up = upright protects; sideways blocks),
inn:[[ids]×4] Drafty Inn piles (last = face up), innq:[pile] piles waiting to flip,
first, turn, acts (0–2), free:{mm,wkid} (powers used this turn), tried:[{id,fail}], idle,
ch, hy, pl, fx (sub-states, below), tok:{pid:{sp:1}}, pool:{sp:n}|null, ls:{first,open,got:[]},
res:{pid:{magic,bonus,det,total,cards}} (after a round), hist:[{r,res,win}], tot:{pid}, wins:{pid}, win:[pid] (done), log:[event] (last 60)
```
Sub-states (at most one waits for input at a time; while one is open the turn is paused):
- `g.ch` challenge `{k:'rec'|'elv'|'inn', by, tg, land, cid, sp, plays:[{p, c:[ids], n}], ans, need, hc?, inn?, piles?}`.
  `ans` = whose answer is awaited (no time limit). `need` = what the answer must count to (1, or 2 after a Spydra; a pair resets it to 1).
  Cards played sit in `plays` until the end. If the awaited Ruler has no possible counter the engine resolves it for them (log `{k:'cant'}`).
- `g.hy` Hypnogriff `{by, from, n}`: `by` has the taken cards in hand and must return `n` cards.
- `g.pl` placement `{pid, clan, lands}`: a won clan with more than one possible land; its new owner chooses.
- `g.fx` Drafty Inn hire `{k:'mb'|'wz'|'el', hc, pile, pick:{pid:null|choice}}`: both Rulers choose at once; a Ruler with no option gets `{skip:1}`.

## API
- `ckDeal({ps, two, cons, ls, pow, ext, bots, seed})` → g, or null (needs 2–8 distinct players). `ps` defaults to `act()`. `two` defaults to on with 2 players.
- `ckMove(g,pid,mv)` → true when made; never throws (set `CK_DEBUG=true` to see exceptions). After every move `ckFlow` runs the automatic steps (auto-resolve a challenge nobody can answer, Inn flips, auto-end a turn that has nothing left, skip Rulers with no cards, end the round).
- `ckValid(g,pid,mv)` dry check. `ckLegal(g,pid)` → legal moves (one representative card per species; identical cards aren't listed twice).
- `ckWho(g)` → [pid] whose input is awaited (two pids only for a Drafty Inn hire). `ckIdle(g)` = no sub-state.
- `ckTick(g,now)` host only: one bot move if a bot is awaited (also "next round" when every player is a bot). Returns true when changed.
- `ckBot(g,pid)` (bots.js) → a legal move for whatever that Ruler is asked.
- Helpers: `ckScore(g,pid)`, `ckTop(g,pid,land)`, `ckLandsFor(g,pid,sp)`, `ckClanVal`, `ckVal`, `ckCounters(g)` (answers for `g.ch.ans`), `ckFxOpts(g,pid,k)`, `ckInRange(g,a,b)`, `ckHas(g,pid,power)`, `ckHS(g,pid)` (hand size), `ckStale(g)`.

## Moves
Turn moves (only `g.turn`, no sub-state open; Settle/Recruit/Hire/Add/Discard/Inn use one of the 2 actions):
- `{a:'settle', cards:[id] or [id,id], disc:bool, land, free?}`: two identical Clanning from hand; or one Clanning + matching top of discard (`disc:true`); or a Wild + a Clanning (hand or discard top). `free:true` = Match Maker (once per turn, no action).
- `{a:'recruit', t, land, card}`: starts `g.ch` (k 'rec'). Card = matching Clanning, CT or Spydra (Equinity: Hentaur vs PegLegasi/UniqueHorns).
- `{a:'hire', card, as?, ...}`: `as` = Extra Freatures ('wz'|'mt'|'hy').
  Wiizzzaard `{t, land, dir:'down'|'up'}` (down = top to bottom); Minnowtaur `{t, land}` (t = you → upright, else sideways);
  Hypnogriff `{t}` (opens `g.hy`); Elves `{t, land}` (opens `g.ch` k 'elv'); Mobgoblins `{mine, t, land}`.
- `{a:'add', card, land, to?}`: card matches the top clan of `land`; `to` moves an Either-land clan (Two Rulers: Pigxies only).
- `{a:'discard', card}`: Clanning only; draws one unless the deck is empty.
- `{a:'inn', take:[pile indexes], card}` (Two Rulers): opens `g.ch` (k 'inn') with the revealed card as the first play.
- `{a:'wkid', land}`: Wiizzz Kid, free, once per turn: swap your top clan with the one below.
- `{a:'end', dh?:[≤2 ids]}`: end the turn (needs 1+ action, unless no action is possible). `dh` = DissedHard discards. Then refill (active first, clockwise), crown passes left, skipping empty hands.
Sub-state moves:
- `{a:'counter', cards:[id] or [id,id]}` / `{a:'pass'}` by `g.ch.ans`. Elves: one counter only, then it's over.
- `{a:'hyret', cards:[n ids]}` by `g.hy.by`. `{a:'place', land}` by `g.pl.pid`. `{a:'fx', land, dir?}` by each Ruler with `g.fx.pick[pid]===null`.
- `{a:'next'}` in `roundEnd` (anyone; the UI should let the host do it).

## What the UI needs to show
- Every Ruler's kingdom: stacks per land, only the top clan fully exposed (lower clans show their gem), Minnowtaurs beside lands (upright/sideways), constellations lit, powers.
- Draw pile count, discard top, retired pile count; Two Rulers: the four Inn tops and pile sizes.
- Whose input is awaited (`ckWho`): the turn player with actions left (`2 - g.acts`, plus free powers), or the challenge prompt for `g.ch.ans`: "Counter or let it go?" with the clan, the plays so far and `need` (no time limit). Others see "Waiting for X to answer".
- `g.hy`: the hirer picks n cards to give back. `g.pl`: the winner picks a land. `g.fx`: both Rulers pick a rival clan (and direction for Wiizzzaard).
- `g.log` for a short "what just happened" line. Deck empty → "No more drawing: play until everyone is out of cards".
- `roundEnd`/`done`: `g.res` (magic, bonus breakdown `det`, creatures), `g.hist`, `g.tot`, `g.wins`, `g.win`.

## Readings we chose (rulebook silent or unclear — Justin to confirm)
1. **Challenge strength.** Each play has a count (Spydra 2, otherwise 1). An answer must reach the last play's count: one card that counts enough, or (against a 2) a pair of matching Creatures with at most one CT and no Spydra. **Justin's ruling (Nov 18): a pair is answered by any single matching card or Wild**; only a Spydra (a single card counting 2) needs a Spydra or a pair. You can't throw in a pair when one card would do.
2. Recruit starts with exactly one card. The recruiter may keep re-countering as long as they can.
3. Recruit, Elves and a sideways/upright Minnowtaur count the Kingdom across all lands (Two Rulers: all three).
4. "Can't target that same Clan again in any fashion" after a failed recruit: blocks Recruit, Elves, Wiizzzaard and Mobgoblins on that clan for the rest of the turn. Elves also can't take a clan you tried to recruit that turn even if it worked.
5. **Elves counter** (Justin's ruling Nov 18: back and forth): the defender sacrifices; the hirer may answer with another sacrifice, and so on; last to sacrifice wins; every sacrificed card goes under the Elves. Each sacrifice is (Spydra, two matching, matching + CT, or two CTs — the page 10 picture shows two CTs); the hirer can't re-challenge. Elves may target any Kingdom with 2+ clans (even your own, as written); bots never do.
6. **Minnowtaur "attacks"** = Recruit, Elves, Mobgoblins and a rival's Wiizzzaard. Upright = on your own land, discarded at the start of your next turn. Sideways = on a rival's land, blocks Settle, Recruit and moving a clan there by Add on their next turn, discarded after that turn. Mobgoblins swaps still land there. Turns skipped for an empty hand still use it up.
7. **Placing won clans.** Recruit/Inn winner chooses the land when more than one fits (`g.pl`). Mobgoblins and Inn hires: an Either-land clan goes to the land of the same name, otherwise to its own land (no prompt).
8. **Hypnogriff** "blindly": the host picks at random with the stored seed.
9. **Stuck game.** With nothing anyone can do (e.g. only Wilds/Hires left that can't be played), a turn with no possible action passes by itself; when every Ruler holding cards has passed in a row, the round ends. Leftover cards don't score.
10. A turn ends by itself when nothing else is possible (after 2 actions, or after 1 with nothing left). With Wiizzz Kid / DissedHard available the Ruler taps End.
11. **DissedHard** discards Clanning Creatures only (the discard pile only takes those) and doesn't count as an action.
12. **Wiizzz Kid** "at any time" = during your own turn when nothing is pending.
13. **VulcEnt Hands**: one more card at the deal and at every refill.
14. Ties: most Creatures (cards in your Kingdom); still tied = shared win. Accumulated: most total magic, tie → most Creatures over all rounds. First to 2: if two reach 2 together, both win.
15. Extended contests: each round is a fresh deal, the first Ruler is random again, powers stay the same, constellations start dark again.
16. **Two Rulers**: hands of 7 and refill to 7 (confirmed by Justin, Nov 18). The "Hentaur token on the Land symbol of the bottom Kingdom" turns the second board's land into the **Maneland**: each Ruler has one Kingdom of three lands (Highland, Lowland, Maneland). Horses (PegLegasi, Hentaurs, UniqueHorns) only in the Maneland; Pigxies any of the three; only Pigxies may switch lands on Add.
17. **Drafty Inn**: the revealed card joins the clan (confirmed by Justin, Nov 18). Revealing a Wild only works when a Clanning Creature is taken; taking only Wilds needs a Clanning card. The rival may challenge; it then runs like a recruit chain (the reveal is the first play; a Spydra reveal counts 2). Winner places the clan, then the emptied piles flip one at a time.
18. Inn hires on a flip, both Rulers at once against each other: Hypnogriff = each blindly takes 2 (fewer if the rival has fewer), no return; Mobgoblins = each takes a rival top clan of their choice (even an only clan); Wiizzzaard = each moves a clan in one rival stack; Elves = each removes a rival top clan, no countering. Then the hire is retired and the next card flips. A pile that is all hires at setup keeps a hire on top that can't be taken.
19. Recruiting in 2–5 player games has no range limit; at 6–8 only the two Rulers on each side (hires may target anyone).
20. Constellation tokens flip for every Clanning card species that enters your Kingdom (an Equinity Hentaur in a PegLegasi clan lights Hentaur). At 7–8, when several Rulers would take the last token together, the active Ruler first, then clockwise.
21. Equinity applies to every challenge (recruit, counter, Elves sacrifice, Inn challenge) but not to the Inn reveal, Settle or Add.
22. SubCerbient: your CTs count 2 in any challenge; a Spydra played against you counts 1 (also an Elves sacrifice against your Elves).

## Bots (bots.js)
Greedy, honest (looks only at its own hand): settles high value and covers valuable clans, recruits when it holds 2+ counts of matching cards, counters when the clan is worth more than the cards, Elves/Mobgoblins on valuable rival tops, upright Minnowtaur over a valuable top, returns its least useful cards to a Hypnogriff, otherwise discards its least useful card or ends. Never stalls (always returns a legal move; `ckTick` falls back to the first legal move).

## Unclear in the rulebook (worth checking the FAQ at gbecks.com/CYK-FAQ)
- ~~What answers a pair in a challenge~~: settled by Justin (any single card).
- Whether the Elves hirer can re-challenge, and whether Elves can target your own Kingdom.
- Inn: whether the revealed card joins the clan or goes back to hand; Two Rulers hand refill size.
- What the tiny numbers on Pigxie / Hentaur cards are for (tip on page 6) — perhaps for the Hentaur token / Maneland; not used.
