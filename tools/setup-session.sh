#!/bin/sh
# Rebuild the working setup in a fresh Claude session from this repo.
# Run from anywhere after cloning to /home/claude/final-tally.
set -e
R=/home/claude/final-tally
cp "$R/src/final-tally.html" /home/claude/final-tally.html
mkdir -p /home/claude/site-tools && cp "$R"/tools/* /home/claude/site-tools/
A=/tmp/claude-0/build/rtsrv; mkdir -p "$A"
for d in art badges lose mask sfx train wait win; do rm -rf "${A:?}/${d:?}"; cp -r "$R/$d" "$A/$d"; done
cp /home/claude/final-tally.html "$A/srv.html"
python3 -c "import PIL" 2>/dev/null || pip install -q --break-system-packages pillow
echo "Ready: edit /home/claude/final-tally.html, then python3 /home/claude/site-tools/build.py"
echo "Tests: sh /home/claude/final-tally/tools/test/run.sh (after building)"
