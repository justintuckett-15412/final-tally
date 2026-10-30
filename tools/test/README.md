# Linked-phone tests

Each "phone" is its own headless Chromium window. They share one in-memory store that acts like the part of Firestore the app uses, with a delay on other phones' changes, so two-phone races show up.

- `sh tools/test/run.sh`: quick suite (~4 min). Run it before pushing any linking or game change.
- `sh tools/test/run.sh all`: adds a full 9-round linked Quacks game and an every-game check (about 45 min).

The site must be built first (`python3 /home/claude/site-tools/build.py`). The runner serves the repo folder on port 8765.

Writing a new test: `const {mk,W,ok,done,chromium}=require('./link.js')`. Use `mk(browser,'name')` for each phone, and call `ok('what should be true', condition)` for each check.
