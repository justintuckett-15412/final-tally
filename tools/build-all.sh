#!/bin/sh
# clean app (before the word games) -> Boggle -> Scattergories -> Word Tiles -> Catan -> site
set -e
cd /home/claude
python3 bg/integrate.py cp/clean.pre-bg.html /tmp/with-bg.html
python3 sg/integrate.py /tmp/with-bg.html /tmp/with-sg.html
python3 wt/integrate.py /tmp/with-sg.html /tmp/with-wt.html
python3 uw/integrate.py /tmp/with-wt.html /tmp/with-uw.html
python3 wg/integrate.py /tmp/with-uw.html cp/clean.html
python3 cp/integrate.py cp/clean.html /tmp/with-cp.html
python3 cc/integrate.py /tmp/with-cp.html /tmp/with-cc.html
python3 tr/integrate.py /tmp/with-cc.html /tmp/with-tr.html
python3 wsp/integrate.py /tmp/with-tr.html /tmp/with-wsp.html
python3 wyp/integrate.py /tmp/with-wsp.html /tmp/with-wyp.html
python3 dow/integrate.py /tmp/with-wyp.html /tmp/with-dow.html
python3 cn/integrate.py /tmp/with-dow.html /tmp/with-cn.html
python3 ts/integrate.py /tmp/with-cn.html final-tally.html
node -e "const s=require('fs').readFileSync('final-tally.html','utf8');const m=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)];for(const x of m){try{new Function(x[1])}catch(e){console.log('ERR',e.message);process.exit(1)}}"
python3 site-tools/build.py >/dev/null
cp final-tally.html final-tally/src/
echo built
