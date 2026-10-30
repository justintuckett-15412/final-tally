# Linked-phone tests

Each "phone" is its own headless Chromium window. They share one in-memory store that acts like the part of Firestore the app uses, with a delay on other phones' changes, so two-phone races show up.

- `sh tools/test/run.sh`: quick suite (~4 min). Run it before pushing any linking or game change.
- `sh tools/test/run.sh all`: adds a full 9-round linked Quacks game and an every-game check (about 45 min).

The site must be built first (`python3 /home/claude/site-tools/build.py`). The runner serves the repo folder on port 8765.

Writing a new test: `const {mk,W,ok,done,chromium}=require('./link.js')`. Use `mk(browser,'name')` for each phone, and call `ok('what should be true', condition)` for each check.

- `fuzz.js` (N=8): random full Quacks games on one phone (random settings, a person tapping at random, 0-2 people) with rule checks after every step. `linkfuzz.js`: the same on two linked phones.
- `rgfuzz.js` (N=8, LINK=1 for linked phones): random full Rage games with random house rules; checks every card played was legal, every trick went to the right player, no card lost or doubled, rounds add up.
- `allfuzz.js` (G=games, LINK=1, MIN=minutes per game): every phone-played game with random players and a person tapping at random; catches page errors and stuck games (no change for 60 s). Nerts is skipped when linked (one person per phone).
