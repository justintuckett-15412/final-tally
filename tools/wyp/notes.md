# Wyrmspan (base game): card data notes

## Source
- **Cards:** [Wyrmsearch](https://navarog.github.io/wyrmsearch/), the fan card search that Stonemaier links from its [Wyrmspan rules-questions page](https://stonemaiergames.com/?p=26515).
  - Repo: https://github.com/navarog/wyrmsearch, file `src/assets/cards.json`, built from `scripts/cards.xlsx` (sheet "Master"), commit 0afdacd (2025-09-23).
  - The repo states no licence; it's fan data for personal reference. Keep it out of anything public beyond what the app shows, and use our own wording for abilities.
- **Rules:**
  - The rulebook PDF (https://content.cmpl.org/bg/Wyrmspan.pdf, read through the web fetcher; the shell download was blocked by the proxy)
  - rules.dized.com (Wyrmspan)
  - rulespal.com/wyrmspan/rulebook

## raw.json (README)
- `{source, dragons:[...], caves:[...]}`: only cards with `expansion=="base"` (the Academy expansion is dropped). Field names are as in the source:
  - **type:** Dragon or Cave. **number** is the card number. **name** is null for caves.
  - **ability** is the card text. Icons are written in brackets:
    - things: [Meat] [Gold] [Crystal] [Milk] [AnyResource] [Coin] [Egg] [DragonCard] [CaveCard] [DragonGuild]
    - points: [VP-n] = n VP
    - timing icons: [WhenPlayed] [Adventurer] [OncePerRound] [OncePerRound-v2] [EndGame]
    - *word* = italic, SHY/PLAYFUL/HELPFUL/AGGRESSIVE = personality
  - **abilityType:** WhenPlayed / Adventurer (= "if activated": your adventurer walks past it while exploring) / OncePerRound (round end) / EndGame / "Adventurer, EndGame"; caves are all WhenPlayed.
  - **VP** is printed points. **size** is Hatchling / Small / Medium / Large. **capacity** is the egg capacity (1–5; null for hatchlings). **personality** is Shy / Playful / Helpful / Aggressive.
  - **Cost columns:** Meat, Gold, Crystal, Milk, Coin, Egg. Coin is an extra coin on top of the base entice coin. Egg is 1 on every hatchling. Milk costs appear only on hatchlings (1–3).
  - **Caves:** "Crimson Cavern", "Golden Grotto" and "Amethyst Abyss" are "x" where the dragon may live.
  - **ignoreCost** is unused in base.
- `patterns.json`: the first-pass template classification, {templates:{id:[card names]}, oneoffs:[[name,type,text]]}.

## Counts (checked)
- **Dragons:** 183 = 148 full-grown (Small 49, Medium 49, Large 50) + 35 hatchlings. This matches the rulebook.
- **Caves:** 75. This matches.
- **Personalities:** Shy 46, Helpful 46, Aggressive 46, Playful 45.
- **Ability types (dragons):** Adventurer 85, EndGame 38, WhenPlayed 32, OncePerRound 25, Adventurer+EndGame 3.
- **Caves dragons can live in:** 1 cave 123, 2 caves 37, all 3 caves 23.
- **Dragon guild tiles (4) and objective tiles (10):** NOT in Wyrmsearch, and not available as text anywhere I could reach. See Uncertain.

## Rules facts gathered (with numbers)
- **Setup:**
  - Display: 3 dragons and 3 caves face up.
  - 4 objective tiles are placed at random, each on a random side.
  - Each player: 6 coins, 1 egg (on a nest icon of the mat), 3 resources of choice, a guild token on START, and the adventurer in Base Camp.
  - Starting hand: draw 3 dragons and 3 caves, keep 4.
  - The leftmost space of each cave starts excavated, so 3 spaces.
  - Random start player.
- **Turn:** one action: excavate, entice or explore. You keep taking turns until you pass; after passing you can still gain from others' turns. When everyone has passed, the round ends.
  - **Excavate:** 1 coin, plus 1 egg in the 3rd column or 2 eggs in the 4th. Put a cave card from hand in the leftmost empty space of any cave, then resolve the cave's when-played and the mat space's "when covered" benefit (either order, both optional).
  - **Entice:** 1 coin plus the dragon's printed cost. Play it left to right in an excavated space of a cave it may live in, then its when-played ability. One dragon per entice.
  - **Explore:** enter a cave. The 1st entry each round costs 1 coin, the 2nd 1 coin + 1 egg, the 3rd 1 coin + 2 eggs.
    - Walk left to right, activating each mat explore benefit and each "if activated" dragon ability you pass, in order.
    - Stop at the first space without a dragon. The adventurer then returns to Base Camp.
  - **4th column:** at any time, spend 3 items (resources/cards) for 1 coin.
  - **Turn end:** discard down to 9 coins, 9 cards (dragons + caves combined) and 9 resources. Going over on another player's turn waits until the end of your next turn.
- **Round end:**
  1. Discard the coins and eggs paid on the mat.
  2. Once-per-round abilities, in turn order from the start player; "all players" effects go clockwise from the owner.
  3. Score the objective: each player puts a marker by placement. Tied players share the higher place, and the next player takes the next place. Anyone with 0 of the item goes to "all others" (0).
  4. Next round: refresh the display (discard 3 + 3, deal new ones), everyone gains 6 coins + 1 egg (the egg must fit a nest, or it's lost), and the start player moves clockwise.
  - Placement VP by round (1st/2nd/3rd/others): R1 4/1/0/0, R2 5/2/1/0, R3 6/3/2/0, R4 7/4/3/0.
- **Hatchlings:** cost 1 egg + 1–3 milk.
  - Their 1st line is "if activated": cache the named resource or tuck a dragon here.
  - Their 2nd line triggers on EVERY cache or tuck here, from any source.
  - On the 3rd cache or tuck, they also give a one-time bonus. Lines 1–2 keep working afterwards.
- **Dragon guild:** "gain [DragonGuild]" advances your guild token. Brown spaces (the bottom and top) make you place a player marker on the guild tile (max 4 markers per player). One square per marker; the long bottom-right rectangle holds any number.
- **Game end** after 4 rounds. Score:
  - guild markers
  - printed VP of visible dragons
  - end-game abilities
  - eggs, cached resources and tucked cards, 1 each
  - objectives
  - 1 per leftover coin, plus 1 per 4 other leftover items
  - Tiebreak: the most visible dragons.

## Ability templates (dragons + caves, first pass)
Counts come from regex classification in `patterns.json`. 25 templates cover 181 cards; 77 abilities are left as one-offs (listed in full below and in patterns.json). Many one-offs are close variants that fold into a few more templates:
- **End-game VP:** per trait or size on the mat (with a max); per adjacent / in this cave; and conditions (column full, cave full, last in cave, between two dragons, a set of 4 personalities or 4 sizes, 4 dragons in a named cave, no AGGRESSIVE in the cave, objectives lowest, guild markers, eggs/2).
- **Pay-to-play cave:** Caves 58–65: pay 2 of X, then take a cave card from the deck or display and play it free.
- **Cache onto any / tuck from deck:** Caves 3–4 and 67–68.
- **Once per round:** tuck, cache or draw, then lay or tuck.
- **Pay eggs from this cave to gain.**

- **hatchCache** (21): HATCHLING, if activated: cache 1 of the named resource from your supply here. Every cache here (from any source) gives benefit A; the 3rd cache also gives benefit B, once per game. e.g. White-Bellied Grazer, Algal Lindworm
- **hatchTuck** (11): HATCHLING, if activated: tuck 1 dragon from your hand here. Every tuck gives benefit A; the 3rd tuck also gives B, once per game. e.g. Genial Mothdragon, Flocking Dragonette
- **cacheWorth** (3): If activated: cache or tuck here. Each one is worth extra VP at game end, and the 3rd also gives a one-time benefit (abilityType "Adventurer, EndGame"). e.g. Common Grass Lindworm, Keening Amphiptere
- **gain** (51): Gain the listed items (resource / AnyResource / DragonCard / CaveCard / Coin / DragonGuild). The timing comes from abilityType. e.g. Swift Lung Dragon, Aged Sea Serpent
- **gainOpp** (6): When played: you gain X, and each opponent gains Y (or draws, or lays). e.g. Eternal Feydragon, Wealthy Koiwyrm
- **gainCache** (7): Gain 1 resource; you may cache it here or on any dragon. e.g. Intractable Firevern, Particularly Haughty Wyvern
- **payGain** (4): Optionally pay X to gain Y. e.g. Sentinel Flyer, Protective Amphiptere
- **payOrGain** (1): Pay X or Y to gain Z. e.g. Northern Gryphdragon
- **payLay** (3): Pay X to lay an egg (here, anywhere in this cave, or anywhere). e.g. Tranquil Wyrm, Green Ghost
- **lay** (12): Lay an egg (here, anywhere in this cave, or on any dragon in this column). When played: also "each opponent lays". e.g. Subterranean Basilisk, Blue Forest Spirit
- **layEach** (3): Lay an egg on each dragon in this column or cave; some need at least N dragons in the cave. e.g. Common Blue Gryphdragon, Puck's Horned Drake
- **tuckHand** (1): Tuck 1 dragon from your hand here. e.g. Malcontent Venomous Wyrm
- **tuckCost** (3): Tuck a dragon from your hand here to gain 1 of the resources printed in the tucked dragon's cost. e.g. Hawkish Firevern, Fanged Broadwyrm
- **cacheSupply** (1): Cache 1 of the named resource from your supply here. e.g. Tawny Steppe Wyvern
- **reveal** (6): Reveal the top dragon. If it matches (hatchling / small / large), tuck it here; otherwise discard it (some then gain an item) or keep it. e.g. Caustic Wyrm, Hostile Northern Fire Dragon
- **neighbor** (5): If you have at least as many dragons in a named cave as your left neighbour, gain X (one card is the end-game version). e.g. Owlatic Amphiptere, Miserly Amphiptere
- **playDragon** (7): Play another dragon (from your hand, the display, or the top of the deck) for free or at a discount, sometimes after paying. Caves 52–53: immediately play a dragon with a 1-resource discount. e.g. Perceptive Anteldragon, Erudite Lung Dragon
- **excavate** (4): Excavate 1 space for free with a cave card from your hand or the display. e.g. Scaly Rock Dragon, Shaly Rockbreaker
- **activateMat** (2): Activate another ability: a once-per-round or when-played ability on any of your dragons, or an explore ability printed on the mat. e.g. Marshy Webbed Dragon, Keen Cricketcatcher
- **oprDraw** (3): Once per round: draw dragons, then keep / discard / tuck as stated. e.g. Prescient Gryphdragon, Bellicose Firevern
- **everyone** (9): Multi-player offers ("Each opponent may…", "All players…"); see each card. e.g. Patient Redwyrm, Steadfast Southern Drake
- **caveGainLay** (13): CAVE, when played: gain X, then lay an egg. e.g. Cave 5, Cave 6
- **caveUpTo** (1): Up to Nx, pay X to gain or lay; each opponent may do it Nx (caves 69–73 and one dragon). e.g. Australopithecus Drakus
- **caveChoice** (2): CAVE: gain N different benefits from a list; each opponent gains 1 of their choice. e.g. Cave 50, Cave 51
- **caveSwap** (2): Swap 2 dragons, ignoring cave preferences (Cave 66; Wily Lindworm). e.g. Wily Lindworm, Cave 66

## One-off abilities (name · timing · text)
- Weary Gryphdragon · EndGame · Gain [VP-2] if this dragon is between two other dragons in this cave.
- Striped Dragonette · EndGame · Gain [VP-2] for each objective where your marker is placed the lowest (include ties).
- Great Golden Lung Dragon · EndGame · Gain [VP-3] for each other dragon in this cave.
- Tawny Northern Drake · EndGame · Gain [VP-2] for each marker you have placed on the Dragon Guild.
- Rainbow Guardian · EndGame · Gain [VP-3] if this dragon’s column is full.
- Standard Horned Lung Dragon · EndGame · Gain [VP-4] for each *set* of dragon traits on your player mat (1 *set* = 1 of each: AGGRESSIVE, PLAYFUL , HELPFUL, SHY ).
- Aloof Gryphdragon · EndGame · Gain [VP-1] for each SHY dragon in an orthogonally adjacent space.
- Chromatic Blue Lung Dragon · EndGame · Gain [VP-2] for each [OncePerRound] dragon on your player mat (max [VP-8]).
- Colorful Gryphdragon · EndGame · Gain [VP-4] if there are no AGGRESSIVE dragons in this cave.
- Haughty Wyvern · EndGame · Gain [VP-2] for each other SHY dragon in this cave.
- Primeval Wyrm · Adventurer · Pay [Egg][Egg] from any orthogonally adjacent dragon(s) to gain [DragonGuild][DragonGuild].
- Guarding Horned Drake · OncePerRound · Tuck [DragonCard] from your hand here. If you do, lay [Egg] here.
- Ancient One · Adventurer · Pay [Egg] from anywhere in this cave to gain 2 different benefits: [DragonCard]/[DragonGuild]/[CaveCard]/[AnyResource].
- Multicolor Flyer · EndGame · Gain [VP-2] for each [WhenPlayed] dragon on your player mat (max [VP-8]).
- Primordiasaur · OncePerRound · Pay [Egg] from anywhere in this cave to gain [DragonGuild][DragonGuild].
- Solitary Brown Drake · EndGame · Gain [VP-3] if all spaces in this cave have been excavated.
- Stoic Gryphdragon · EndGame · Gain [VP-3] if this is the last (farthest right) dragon in its cave.
- Northern Cavalier Wyvern · EndGame · Pay [DragonCard] to gain [VP-1] or pay [DragonCard][DragonCard] to gain [VP-3].
- Equatorial Cavalier Wyvern · EndGame · Pay [CaveCard] to gain [VP-1] or pay [CaveCard][CaveCard] to gain [VP-3].
- Ordinary Resplendent Coatl · EndGame · Gain [VP-8] if you have a *hatchling*, a *small* dragon, and a *large* dragon in this cave.
- Miniature Crested Coatl · EndGame · Gain [VP-5] if you have 4 dragons in your Golden Grotto.
- Dappled Glade Spirit · EndGame · Gain [VP-1] for each [Adventurer] dragon on your player mat (including *hatchlings*).
- Little Amphiptere · EndGame · Gain [VP-3] if this dragon’s cave is full.
- Magnificent Amphiptere · EndGame · Gain [VP-2] for each [EndGame] dragon on your player mat (max [VP-8]).
- Pocket Amphiptere · EndGame · Gain [VP-3] if there is at least 1 other PLAYFUL dragon in this cave.
- Gliding Taiga Drake · OncePerRound · Up to 2x, tuck [DragonCard] from your hand here. Each time you do, gain [AnyResource].
- Minor Sharpclaw · EndGame · Lose [VP-2] for each other AGGRESSIVE dragon in this cave.
- Penurious Red Wyrm · OncePerRound · Gain [AnyResource] for each AGGRESSIVE dragon in this cave. You may cache up to 2 of them here.
- Variegated Amphiptere · EndGame · Gain [VP-2] for each dragon in an orthogonally adjacent space.
- Custodial Koiwyrm · WhenPlayed · Gain [AnyResource][AnyResource]. Keep 1 and cache 1 onto any dragon.
- Splitting Golden Hydra · WhenPlayed · Draw [DragonCard][DragonCard] from the deck. Keep 1 and tuck 1 under any dragon.
- Antediluvian Basilisk · OncePerRound · Tuck [DragonCard] from the deck here for each marker you have placed on the Dragon Guild.
- Chameleon Coatl · EndGame · Gain + [VP-3] for each *medium* dragon on your player mat (max [VP-12]).
- Knowing Guardian · OncePerRound · Cache [AnyResource] from your supply here. If you do, draw [DragonCard] from the deck.
- Yellow-Bellied Lung Dragon · EndGame · Lose [VP-1] for each other AGGRESSIVE dragon in this cave.
- Mosaic Guardian · EndGame · Gain [VP-3] for each *large* dragon on your player mat (max [VP-12]).
- Red Guardian · Adventurer · Cache [AnyResource] from your supply onto any dragon in this column.
- Red-Crested Gryphdragon · EndGame · Gain +[VP-3] for each PLAYFUL dragon in an orthogonally adjacent space.
- Smirking Ridgeback · OncePerRound · Tuck [DragonCard] from the deck under each PLAYFUL dragon in this cave.
- Titanic Coatl · EndGame · Gain [VP-6] for each *set* of dragon sizes on your player mat (1 *set*=1 of each: *hatchling*, *small*, *medium*, *large*).
- Lilliputian Fae · EndGame · Gain +[VP-3] for each small dragon on your player mat (max [VP-12]).
- Customary Grazer · EndGame · Gain +[VP-4] for each *hatchling* on your player mat (max [VP-12]).
- Churlish Firevern · OncePerRound · If this dragon’s column is full, draw [DragonCard][DragonCard] from the deck. You may tuck 1 or both here.
- Sea Viper · OncePerRound · Tuck [DragonCard] from the deck under any dragon.
- Playful Hornwyrn · EndGame · Pay [AnyResource] to gain [VP-1] or pay [AnyResource][AnyResource] to gain [VP-3].
- Southern Mammoth Ridgedragon · EndGame · Gain [VP-5] if you have 4 dragons in your Amethyst Abyss.
- Great Horned Wyvern · Adventurer · Draw [DragonCard] from the deck. You may tuck it here.
- Ophidian Recluse · EndGame · Pay [AnyResource][CaveCard][DragonCard] to gain [VP-5].
- Aerial Recluse · EndGame · Gain [VP-4] if there is another HELPFUL dragon in this column.
- Blue Keeper · OncePerRound · Cache [AnyResource] from your supply here. If you do, lay [Egg] here.
- Brindled Frogmouth · WhenPlayed · Choose [AnyResource] and gain 2 of that resource. Each opponent gains 1 of the same resource.
- Jaunty Dragonette · Adventurer · Pay [Egg] from anywhere in this cave to gain [AnyResource][AnyResource].
- Brushtail Fae · OncePerRound · Draw [DragonCard] from the deck. You may tuck it here.
- Clairvoyant Feydragon · WhenPlayed · Gain [DragonCard][DragonCard]. Each opponent draws [DragonCard] from the deck.
- Homely Fae · EndGame · Gain [VP-5] if you have 4 dragons in your Crimson Cavern.
- Macabre Lindworm · Adventurer · Tuck [DragonCard] from your hand under any dragon in this column.
- Augural Fae · WhenPlayed · Activate 1 [Adventurer] or [OncePerRound] ability on any dragon on your player mat.
- Tendering Mothdragon · OncePerRound · If you have at least 1 marker on the Dragon Guild, lay up to [Egg][Egg] here.
- Nurturing Feydragon · EndGame · Gain an additional [VP-1] for every 2 [Egg] you have (round down).
- Beckoning Cricketcatcher · OncePerRound · Gain [DragonCard]. You may tuck it under any dragon.
- Warming Firevern · EndGame · Gain [VP-1] for each HELPFUL dragon on your player mat.
- Cave 1 · WhenPlayed · Activate the [OncePerRound-v2] ability on any dragon on your player mat.
- Cave 2 · WhenPlayed · Activate the [WhenPlayed] ability on any dragon on your player mat.
- Cave 3 · WhenPlayed · Cache [AnyResource][AnyResource] from the general supply onto any dragon(s).
- Cave 4 · WhenPlayed · Cache [AnyResource][AnyResource] from the general supply onto any dragon(s).
- Cave 10 · WhenPlayed · Gain [CaveCard]. Lay [Egg][Egg].
- Cave 11 · WhenPlayed · Gain [CaveCard]. Lay [Egg][Egg].
- Cave 58 · WhenPlayed · Pay [AnyResource][AnyResource], then draw [CaveCard] from the deck and immediately play it for free.
- Cave 59 · WhenPlayed · Pay [AnyResource][AnyResource], then gain [CaveCard] from the display and immediately play it for free.
- Cave 60 · WhenPlayed · Pay [CaveCard][CaveCard], then draw [CaveCard] from the deck and immediately play it for free.
- Cave 61 · WhenPlayed · Pay [CaveCard][CaveCard], then gain [CaveCard] from the display and immediately play it for free.
- Cave 62 · WhenPlayed · Pay [DragonCard][DragonCard], then draw [CaveCard] from the deck and immediately play it for free.
- Cave 63 · WhenPlayed · Pay [DragonCard][DragonCard], then gain [CaveCard] from the display and immediately play it for free.
- Cave 64 · WhenPlayed · Pay [Egg][Egg], then draw [CaveCard] from the deck and immediately play it for free.
- Cave 65 · WhenPlayed · Pay [Egg][Egg], then gain [CaveCard] from the display and immediately play it for free.
- Cave 67 · WhenPlayed · Tuck [DragonCard][DragonCard] from the deck behind any dragon(s).
- Cave 68 · WhenPlayed · Tuck [DragonCard][DragonCard] from the deck behind any dragon(s).

## Uncertain / missing (Justin can photograph these from the box)
1. **Player mat explore rewards** for each space of each cave, and the "when covered" excavate benefit of each mat space: printed as icons only; no text source had them.
2. **The 4 dragon guild tiles, both sides:** only fragments came through:
   - Highlands: "pay a coin, excavate up to 2 spaces free" / "pay a cave card, play a dragon on top of another free".
   - Rainforest end game: VP per cost icon in one cave.
   - Seafarers: 3 VP per full column.
   - Plains: per-[icon] VP.
   - The full guild track spaces are also missing.
3. **The 10 objective tiles, both sides:** only 7 sides came through, as text with thresholds (medium dragons, large dragons, hatchlings, dragons+caves in Amethyst Abyss, dragons+caves in Crimson Cavern, [icon] on your mat, cached resources). The thresholds are Automa-only and not needed for multiplayer.
4. **Exact column egg costs for entice:** the rules only say 1 coin plus the dragon cost; excavate columns cost +0/+1/+2 eggs.
5. **Egg capacity:** dragons have `capacity`; hatchlings have none in the data, so check the rules page "Capacity limits".
6. The template classification is regex-based. A few dragons were caught by cave templates (e.g. caveSwap matched Wily Lindworm, caveUpTo matched Australopithecus Drakus); check them when implementing.
