# Wingspan base data: notes

**Files:**
- `data.js` holds `WSB`, `WSBON` and `WSGOAL`, built by `mkdata.py` from `birds.csv` (Base rows) plus the Wingsearch database.
- Check it with `node datacheck.js`, which passes.

## 170 vs 180 birds
- The CSV's 180 "Base" birds are the 170 regular base-game birds plus the 10 **Swift-Start promo** birds. These ship in the Swift-Start pack (newer printings), and Wingsearch flags them.
  - American Redstart
  - Black-Chinned Hummingbird
  - Brant
  - Broad-Winged Hawk
  - Canvasback
  - Painted Whitestart
  - Red-Breasted Merganser
  - Scaled Quail
  - Vaux's Swift
  - White-Throated Swift
- Each carries `swift:1` in `WSB`, so the engine can leave them out for a strict 170-card deck. **Justin: check whether your box has these 10.**
- The base rulebook says 170 bird cards and 26 bonus cards.

## Power kinds: 174 birds with a power, 6 with none
- **Food:**
  - `feeder` 11
  - `feederAll` 2
  - `supply` 7
  - `allSupply` 6
  - `eachDie` 2
  - `cache` 5
  - `trade` 1
- **Hunting:**
  - `huntDice` 13
  - `huntCard` 10
- **Tucking:**
  - `tuck` 21
  - `discardFoodTuck` 5
- **Eggs:**
  - `eggForFood` 5
  - `eggForCards` 2
  - `layAny` 4
  - `layThis` 4
  - `layNest` 4
  - `allLayNest` 3
- **Cards:**
  - `draw` 3
  - `drawDiscard` 8
  - `allDraw` 5
  - `fewestDraw` 2
  - `fewestDie` 1
  - `trayAll` 1
  - `oyster` 1
- **Movement and repeats:**
  - `moveRight` 8
  - `repeatBrown` 2
  - `repeatPredator` 1
  - `playAnother` 10
  - `bonus` 15
- **Pink:**
  - `onLayEgg` 5
  - `onPlayHab` 3
  - `onPredator` 3
  - `onGainFood` 1
- **No new kinds were needed.**
- **Parameter details:**
  - `tuck.then` is one of `draw`, `egg`, `food` (with `food:[..]`) or `layAny`.
  - `feeder.food` is `null` for "any die".
  - `onLayEgg.other` is 1 for American Avocet and Barrow's Goldeneye ("another bird"), and 0 for the cowbirds and Yellow-Billed Cuckoo.
- **Flags:**
  - `pred` means huntDice or huntCard.
  - `flock` means tuck, discardFoodTuck, or onPlayHab with tuck (Horned Lark, which has the flocking icon).
  - Both flags match Wingsearch's predator and flocking marks for all 180 birds.
- **Costs:**
  - `or:1` means pay any ONE of the listed foods. A Wild in an "or" cost isn't in base.
  - Six birds have no food cost: Black Vulture, California Condor, Turkey Vulture and others (`cost:{}`).

## Bonus card tests (`WSBON[].test`)
- **Name tags:**
  - `tag:anatomist`, `tag:cartographer`, `tag:historian` and `tag:photographer` mean `bird.tags` includes that word.
  - The tags come from Wingsearch's per-bird marks.
- **Points:** `pts<4`.
- **Power icons:** `flock` and `pred`.
- **Food:**
  - `cost:X` means X appears in the food cost ("or" costs count; Wild doesn't).
  - `costOnly:i` means the only food is invertebrate, with no Wild.
  - `wild` means at least 1 Wild in the cost.
- **Nest:** `nest:X` means the nest is X, or star (star counts as any).
- **Habitat:** `onlyHab:X` means the bird can live only in habitat X.
- **Wingspan:** `ws>65` and `ws<=30`.
- **Needs the final board** (the engine computes these):
  - `eggsOn>=4` and `eggsOn>=1`
  - `special:ecologist`: birds in your habitat with the fewest birds (ties allowed), 2 per bird.
  - `special:visionary`: bird cards in hand at the end.
- **Scoring format:**
  - `{per:n}` means n points per qualifying bird.
  - `{tiers:[[min,pts],...]}` means the highest tier whose min is reached scores (for example, `[[2,3],[4,7]]` is 2–3 birds 3 points, 4+ birds 7 points).
- **Check against Wingsearch:** every test that can be worked out from the data matches Wingsearch's per-bird bonus marks for all 180 birds.

## Bonus cards (26)
Scores come from Wingsearch `bonus.json` (core set), and the conditions match the official Appendix.
- Anatomist: 2–3 birds 3, 4+ birds 7
- Backyard Birder: see UNCERTAIN
- Bird Counter: 2 per bird
- Bird Feeder: 5–7 birds 3, 8+ birds 7
- Breeding Manager: 1 per bird
- Cartographer: 2–3 birds 3, 4+ birds 7
- Ecologist: 2 per bird
- Enclosure Builder: 4–5 birds 4, 6+ birds 7
- Falconer: 2 per bird
- Fishery Manager: 2–3 birds 3, 4+ birds 8
- Food Web Expert: 2 per bird
- Forester: 3–4 birds 4, 5 birds 8
- Historian: 2 per bird
- Large Bird Specialist: 4–5 birds 3, 6+ birds 6
- Nest Box Builder: 4–5 birds 4, 6+ birds 7
- Omnivore Specialist: 2 per bird
- Oologist: 7–8 birds 3, 9+ birds 6
- Passerine Specialist: 4–5 birds 3, 6+ birds 6
- Photographer: 4–5 birds 3, 6+ birds 7
- Platform Builder: 4–5 birds 4, 6+ birds 7
- Prairie Manager: 2–3 birds 3, 4+ birds 8
- Rodentologist: 2 per bird
- Visionary Leader: 5–7 birds 4, 8+ birds 7
- Viticulturalist: 2–3 birds 3, 4+ birds 7
- Wetland Scientist: 3–4 birds 3, 5 birds 7
- Wildlife Gardener: 4–5 birds 4, 6+ birds 7

## Round goals: 16 faces on 8 tiles (from Wingsearch `goals.json`, Reverse field)
1. Birds in forest / Eggs in forest
2. Birds in grassland / Eggs in grassland
3. Birds in wetland / Eggs in wetland
4. Bowl birds with an egg / Eggs in bowl nests
5. Cavity birds with an egg / Eggs in cavity nests
6. Ground birds with an egg / Eggs in ground nests
7. Platform birds with an egg / Eggs in platform nests
8. Sets of eggs (one in each habitat) / Total birds

- **Kinds used:** `birdsHab{hab}`, `eggsHab{hab}`, `birdsNestEgg{nest}`, `eggsNest{nest}`, `sets` and `birdsTotal`.
  - Star nests count for the nest goals (per the Appendix).
- **Scoring boards:**
  - **Placement side:** 1st/2nd/3rd per round: 4/1/0, 5/2/1, 6/3/2 and 7/4/3. That's what the app uses.
  - The rulebook's tie example ("a 5/2/1 goal") confirms round 2. Rounds 3 and 4 weren't confirmed from the text extraction (see UNCERTAIN).
  - You need at least 1 of the item to score. Ties add up the tied places and the next place(s), divide by the number of tied players and round down.
  - **Count side:** 1 point per item, at most 5 (rulebook quote).

## UNCERTAIN (Justin can check against the box)
1. **Backyard Birder:** Wingsearch says "5 to 6 birds: 3; 6+ birds: 6", which overlaps. I used 5–6 birds 3 and 7+ birds 6. Check the card.
2. **Placement board rounds 3 and 4** (6/3/2 and 7/4/3): check the goal board.
3. **Swift-Start birds:** whether the 10 should be in the deck (see above).
4. **Name-tag edge cases:** spot-check these.
   - Anatomist: Wingsearch counts compound names: Barrow's Goldeneye, Blue Grosbeak, Canvasback, Cedar Waxwing, Common Yellowthroat, Loggerhead Shrike, Red Crossbill, Roseate Spoonbill and Tufted Titmouse.
   - Photographer: Northern Bobwhite.
   - Cartographer: Greater Prairie-Chicken.
   - These came from Wingsearch, not the Appendix word lists, so check them on the real bonus card art. The Appendix word lists are summarised in the Sources.

## Sources
- [Wingspan Appendix (lot.ahml.info)](https://lot.ahml.info/Wingspan%20Appendix.pdf) and its [uwaterloo mirror](https://cs.uwaterloo.ca/~dtompkin/archive/dtlib/base/Wingspan%20~%20Appendix.pdf)
- [Wingspan rulebook (uwaterloo)](https://cs.uwaterloo.ca/~dtompkin/archive/dtlib/base/Wingspan.pdf)
- [Wingsearch data](https://github.com/navarog/wingsearch): `src/assets/data/master.json`, `bonus.json` and `goals.json`
