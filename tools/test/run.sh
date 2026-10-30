#!/bin/sh
# Linked-phone tests. Usage: sh tools/test/run.sh          (quick, ~4 min)
#                            sh tools/test/run.sh all      (also the full 9-round game and every-game checks, ~45 min)
# Needs the built site in the repo folder (python3 /home/claude/site-tools/build.py) and Playwright (preinstalled).
cd "$(dirname "$0")"
REPO="$(cd ../.. && pwd)"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
PORT=8765; export BASE="http://localhost:$PORT/"
if ! curl -s -o /dev/null "$BASE"; then (cd "$REPO" && setsid nohup python3 -m http.server $PORT >/tmp/ft-test-server.log 2>&1 </dev/null &); sleep 1; fi
TESTS="scoring lobby features endlink effects announce newgame snappy snappy-cards witches quacks-fixes"
[ "$1" = "all" ] && TESTS="$TESTS fullgame fullgame-herb audit audit-bots audit-score"
for t in $TESTS; do
  case $t in
    audit) f=audit.js; env="";; audit-bots) f=audit.js; env="ALLBOT=1 T=60000";; audit-score) f=audit.js; env="SCORE=1 T=15000";;
    fullgame) f=fullgame.js; env="";; fullgame-herb) f=fullgame.js; env="HERB=1";; *) f=$t.test.js; env="";;
  esac
  echo "== $t"
  env $env node "$f" 2>&1 | grep -E "^(PASS|FAIL|DBG)|Error"
done 2>&1 | tee /tmp/ft-test.out
if grep -qE "^FAIL|Error" /tmp/ft-test.out; then echo; echo "SOME TESTS FAILED"; exit 1; else echo; echo "ALL PASSED"; fi
