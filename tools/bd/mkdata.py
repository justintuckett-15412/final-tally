#!/usr/bin/env python3
"""Build /home/claude/bd/data.js from the question lists in /home/claude/bd/data/{words,people,initials,movies,dates}.json
(arrays of {q,a,kid,src}). src is dropped. A missing or broken file gets a small placeholder list so the game still runs.
Output: const BDQ={words:[[q,a,kid],...],...};  (kid = 1 or 0)"""
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
CATS = ['words', 'people', 'initials', 'movies', 'dates', 'laws']  # laws: house-rule 6th category
PLACE = {
  'words': [['Zarf', 'A holder for a coffee cup that has no handle', 1], ['Snood', 'A hairnet or a fleshy flap on a turkey', 1],
            ['Defenestrate', 'To throw someone out of a window', 0], ['Petrichor', 'The pleasant smell after rain falls on dry ground', 1],
            ['Gongoozler', 'A person who idly watches boats on a canal', 0], ['Lollygag', 'To dawdle or waste time', 1]],
  'people': [['Sacagawea', 'Guided Lewis and Clark across the American West', 1], ['Clara Barton', 'Founded the American Red Cross', 1],
             ['Philo Farnsworth', 'Invented electronic television', 1], ['Nellie Bly', 'Went around the world in 72 days as a reporter', 0],
             ['Garrett Morgan', 'Invented an early three-position traffic signal', 0]],
  'initials': [['SCUBA', 'Self-Contained Underwater Breathing Apparatus', 1], ['LASER', 'Light Amplification by Stimulated Emission of Radiation', 0],
               ['NASA', 'National Aeronautics and Space Administration', 1], ['RADAR', 'Radio Detection and Ranging', 1],
               ['ZIP (code)', 'Zone Improvement Plan', 0]],
  'movies': [['The Wizard of Oz (1939)', 'A Kansas girl is swept by a tornado to a magical land and tries to get home', 1],
             ['Jaws (1975)', 'A great white shark terrorizes a beach town', 0], ['Toy Story (1995)', 'A cowboy doll is jealous of a new space-ranger toy', 1],
             ['Rocky (1976)', 'A small-time boxer gets a shot at the heavyweight title', 0], ['Babe (1995)', 'A pig is raised by sheepdogs and learns to herd sheep', 1]],
  'dates': [['July 20, 1969', 'Astronauts first walked on the Moon', 1], ['December 17, 1903', 'The Wright brothers made the first powered airplane flight', 1],
            ['May 10, 1869', 'The golden spike finished the first transcontinental railroad in Utah', 1], ['November 9, 1989', 'The Berlin Wall opened', 0],
            ['April 15, 1912', 'The Titanic sank', 0]],
  # development placeholders only (clearly marked); the real list comes from data/laws.json
  'laws': [['Placeholder law 1', '(placeholder) Waiting for laws.json', 1], ['Placeholder law 2', '(placeholder) Waiting for laws.json', 1],
           ['Placeholder law 3', '(placeholder) Waiting for laws.json', 0]],
}
out, info = {}, []
for c in CATS:
    f = f'{D}/data/{c}.json'
    rows = None
    try:
        raw = json.load(open(f, encoding='utf-8'))
        rows = []
        for x in raw:
            q, a = str(x.get('q', '')).strip(), str(x.get('a', '')).strip()
            if q and a: rows.append([q, a, 1 if x.get('kid') else 0])
        if not rows: rows = None
    except FileNotFoundError: pass
    except Exception as e: print(f'mkdata: {c}.json unreadable ({e}); using placeholders', file=sys.stderr)
    if rows is None:
        rows = PLACE[c]; info.append(f'{c}:placeholder({len(rows)})')
    else:
        seen, uniq = set(), []
        for r in rows:
            k = (r[0].lower(), r[1].lower())  # Laws repeat places ("In France"), so only an identical question + answer is a duplicate
            if k in seen: continue
            seen.add(k); uniq.append(r)
        rows = uniq; info.append(f'{c}:{len(rows)} ({sum(r[2] for r in rows)} kid)')
    out[c] = rows
js = '/* Beyond Balderdash: our own question lists (built by bd/mkdata.py from bd/data/*.json; [question, real answer, kid]) */\nconst BDQ=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';\n'
open(f'{D}/data.js', 'w', encoding='utf-8').write(js)
print('mkdata', ' '.join(info))
