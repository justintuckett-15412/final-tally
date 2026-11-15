#!/usr/bin/env python3
"""Build wyp/data.js from raw.json (Wyrmsearch fan data, base game) + our own effect encoding.
Ops (JSON lists) are run by wyp/game.js. Tokens: meat gold crys milk any coin d c G (guild) egg.
d / c = a dragon / cave card from the display or the deck; D / C = from the deck only."""
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(f'{D}/raw.json'))
TOK = {'Meat': 'meat', 'Gold': 'gold', 'Crystal': 'crys', 'Milk': 'milk', 'AnyResource': 'any', 'Coin': 'coin',
       'DragonCard': 'd', 'CaveCard': 'c', 'DragonGuild': 'G', 'Egg': 'egg'}
def toks(s): return ','.join(TOK[t] for t in re.findall(r'\[(\w+)\]', s))

# ---- full-grown dragons: effect ops by card number ----
X = {
 36: [['pay', 'd', [['g', 'any']]]],
 37: [['lay', 2, 'a'], ['opp', [['lay', 1, 'a']]]],
 38: [['g', 'coin,coin']],
 40: [['g', 'G']],
 43: [['lay', 1, 'h']],
 45: [['pay', 'coin', [['lay', 3, 'a']]]],
 47: [['if', 'gg', [['g', 'd']]]],
 48: [['g', 'coin']],
 50: [['g', 'd']],
 53: [['cache', 'any', 1, 'h', 'sup']],
 55: [['lay', 1, 'cv']],
 56: [['g', 'gold']],
 57: [['g', 'G,G'], ['opp', [['g', 'G']]]],
 58: [['rev', 'H', 'hand']],
 60: [['g', 'milk,milk']],
 61: [['pay', 'egg,egg', [['g', 'G,G']], 1, 'adj']],
 62: [['g', 'coin']],
 63: [['tuck', 'hand', 'h', 1, [['lay', 1, 'h']]]],
 64: [['exc', 'disp']],
 65: [['pay', 'c,c', [['playD', 'hand', 'free']]]],
 66: [['pay', 'd', [['lay', 1, 'cv']]]],
 67: [['pay', 'egg', [['two', 'd,G,c,any']], 1, 'cv']],
 68: [['rev', 'L', ['meat']]],
 69: [['x', 'shyDraw']],
 70: [['pay', 'any', [['lay', 1, 'a']], 2], ['opp', [['pay', 'any', [['lay', 1, 'a']], 1]]]],
 72: [['pay', 'egg', [['g', 'G,G']], 1, 'cv']],
 73: [['pay', 'c', [['act', 'mat']]]],
 75: [['g', 'G']],
 76: [['pay', 'any', [['act', 'wp']]]],
 77: [['gc', 'meat', 'h']],
 78: [['gc', 'milk', 'h']],
 79: [['if', 'cv3', [['layEach', 'cv', '']]]],
 80: [['x', 'tuckCost']],
 82: [['lay', 1, 'col']],
 83: [['g', 'coin,G']],
 84: [['tuck', 'hand', 'h', 1]],
 85: [['g', 'crys,crys'], ['opp', [['g', 'crys']]]],
 88: [['g', 'coin']],
 89: [['pay', 'any', [['playD', 'disp', 'free']]]],
 90: [['pay', 'coin', [['g', 'gold,crys,meat']]]],
 92: [['g', 'crys']],
 94: [['payOr', [['d', [['g', 'G']]], ['c', [['g', 'G']]]]]],
 95: [['layEach', 'col', '']],
 96: [['gc', 'milk', 'h']],
 99: [['g', 'coin,any,any']],
 100: [['rev', 'S', ['milk']]],
 103: [['if', 'gg', [['g', 'gold']]]],
 104: [['x', 'tuck2any']],
 105: [['pay', 'c', [['lay', 1, 'h']], 3]],
 107: [['if', 'cv3', [['layEach', 'cv', '']]]],
 108: [['pay', 'coin', [['g', 'G,any,c,d']]]],
 109: [['pay', 'any', [['x', 'draw3']]]],
 110: [['rev', 'ML', 'hand']],
 111: [['x', 'aggRes']],
 113: [['exc', 'hand']],
 114: [['if', 'aa', [['g', 'crys']]]],
 115: [['g', 'any'], ['gc', 'any', 'a']],
 116: [['x', 'draw2tuck']],
 117: [['x', 'guildTuck']],
 118: [['g', 'coin,coin']],
 120: [['cache', 'any', 1, 'h', 'sup', [['g', 'D']]]],
 121: [['pay', 'coin', [['g', 'G,G,G']]]],
 123: [['g', 'crys']],
 125: [['cache', 'any', 1, 'col', 'sup']],
 126: [['g', 'c']],
 127: [['rev', 'SH', 'hand']],
 128: [['g', 'meat']],
 130: [['x', 'playfulTuck']],
 133: [['g', 'G']],
 135: [['if', 'colfull', [['x', 'draw2may']]]],
 136: [['gc', 'crys', 'h']],
 137: [['pay', 'c', [['lay', 2, 'cv']]]],
 138: [['layEach', 'cv', 'notA']],
 139: [['lay', 1, 'h']],
 140: [['exc', 'hand']],
 141: [['tuck', 'deck', 'a', 1]],
 142: [['pay', 'c', [['x', 'draw3']]]],
 143: [['g', 'd']],
 146: [['pay', 'any', [['playD', 'hand', 'free']]]],
 147: [['pay', 'd', [['playD', 'disp', 'free']]]],
 148: [['x', 'drawMay']],
 151: [['x', 'tuckCost']],
 152: [['x', 'tuckCost']],
 153: [['cache', 'any', 1, 'h', 'sup', [['lay', 1, 'h']]]],
 154: [['gc', 'meat', 'a']],
 155: [['g', 'gold']],
 156: [['x', 'choose2']],
 157: [['swap']],
 158: [['lay', 1, 'cv']],
 159: [['pay', 'egg', [['g', 'any,any']], 1, 'cv']],
 160: [['x', 'drawMay']],
 161: [['gc', 'milk', 'a']],
 162: [['exc', 'disp']],
 163: [['gc', 'gold', 'h']],
 164: [['if', 'cv3', [['layEach', 'cv', '']]]],
 165: [['g', 'd,d'], ['opp', [['g', 'D']]]],
 166: [['g', 'meat']],
 168: [['if', 'cc', [['g', 'meat']]]],
 169: [['g', 'gold']],
 170: [['if', 'cc', [['g', 'milk']]]],
 171: [['tuck', 'hand', 'col', 1]],
 172: [['act', 'advopr']],
 173: [['lay', 1, 'adj']],
 174: [['pay', 'egg', [['g', 'any,c,d']]], ['opp', [['pay', 'egg', [['two1', 'any,c,d']]]]]],
 175: [['if', 'guild1', [['lay', 2, 'h']]]],
 176: [['rev', 'M', ['meat']]],
 177: [['g', 'crys']],
 178: [['g', 'gold,gold'], ['opp', [['g', 'gold']]]],
 180: [['x', 'gainTuck']],
 181: [['g', 'meat,meat'], ['opp', [['g', 'meat']]]],
 182: [['g', 'meat']],
}
# end-game abilities are scored in game.js (wyEndVP) by card number
ENDS = {39, 41, 42, 44, 46, 49, 51, 52, 54, 59, 71, 74, 81, 86, 87, 91, 93, 97, 98, 101, 102, 106, 112, 119, 122, 124,
        129, 131, 132, 134, 144, 145, 149, 150, 167, 179, 183}
# our own short wording (not the card text); the app also says "the exact wording is on the card"
SAY_END = {
 39: '2 VP if it sits between two other dragons in this cave', 41: '2 VP for each objective where you placed lowest (ties count)',
 42: '3 VP for each other dragon in this cave', 44: '2 VP for each marker you placed on the Dragon Guild',
 46: "3 VP if this dragon's column is full", 49: '4 VP for each set of the 4 traits on your mat',
 51: '1 VP for each Shy dragon next to it', 52: '2 VP for each once-per-round dragon (max 8)',
 54: '4 VP if this cave has no Aggressive dragons', 59: '2 VP for each other Shy dragon in this cave',
 71: '2 VP for each when-played dragon (max 8)', 74: '3 VP if every space in this cave is excavated',
 81: '3 VP if it is the last dragon in its cave', 86: 'Pay 1 dragon card for 1 VP, or 2 for 3 VP',
 87: 'Pay 1 cave card for 1 VP, or 2 for 3 VP', 91: '8 VP for a hatchling, a small and a large dragon in this cave',
 93: '5 VP if your Golden Grotto has 4 dragons', 97: '1 VP for each if-activated dragon',
 98: "3 VP if this dragon's cave is full", 101: '2 VP for each end-game dragon (max 8)',
 102: '3 VP if another Playful dragon is in this cave', 106: '−2 VP for each other Aggressive dragon in this cave',
 112: '2 VP for each dragon next to it', 119: '3 VP for each medium dragon (max 12)',
 122: '−1 VP for each other Aggressive dragon in this cave', 124: '3 VP for each large dragon (max 12)',
 129: '3 VP for each Playful dragon next to it', 131: '6 VP for each set of the 4 sizes on your mat',
 132: '3 VP for each small dragon (max 12)', 134: '4 VP for each hatchling (max 12)',
 144: 'Pay 1 resource for 1 VP, or 2 for 3 VP', 145: '5 VP if your Amethyst Abyss has 4 dragons',
 149: 'Pay 1 resource, 1 cave card and 1 dragon card for 5 VP', 150: '4 VP if another Helpful dragon is in its column',
 167: '5 VP if your Crimson Cavern has 4 dragons', 179: '1 more VP for every 2 eggs you have',
 183: '1 VP for each Helpful dragon'}

def hatch(c):
    t = c['ability']
    m = re.match(r'(Cache|Tuck) \[(\w+)\] from your (?:supply|hand) here\. (.*?)When the 3rd \[\w+\] is (?:cached|tucked), also (.*)\.$', t)
    assert m, t
    kind = 'tuck' if m.group(1) == 'Tuck' else TOK[m.group(2)]
    mid, third = m.group(3).strip(), m.group(4)
    if 'worth [VP-1]' in mid: each = 'vp'
    else:
        e = re.match(r'Any time you (?:cache|tuck) \[\w+\] here, (gain|lay) (.*)\.$', mid); assert e, mid
        each = [['lay', toks(e.group(2)).count('egg'), 'a']] if e.group(1) == 'lay' else [['g', toks(e.group(2))]]
    if third.startswith('excavate'): th = [['exc', 'hand']]
    elif third.startswith('lay'): th = [['lay', toks(third).count('egg'), 'a']]
    else: th = [['g', toks(third)]]
    return {'r': kind, 'each': each, 'third': th}

def cave_ops(n, t):
    m = re.match(r'^Gain (.*?)\.(?: Lay (.*)\.)?$', t)
    if n in (50, 51): return [['two', 'd,c,any'], ['opp', [['two1', 'd,c,any']]]]
    if m and 'different' not in t:
        o = [['g', toks(m.group(1))]]
        if m.group(2): o.append(['lay', toks(m.group(2)).count('egg'), 'a'])
        return o
    if n == 1: return [['act', 'opr']]
    if n == 2: return [['act', 'wp']]
    if n in (3, 4): return [['cache', 'any', 2, 'a', 'gen']]
    if n in (52, 53, 54): return [['playD', 'hand', 'disc1']]
    if n in (55, 56, 57): return [['lay', 3, 'a']]
    m = re.match(r'^Pay (.*?), then (draw|gain) \[CaveCard\] from the (deck|display)', t)
    if m: return [['pay', toks(m.group(1)), [['exc', 'deck' if m.group(3) == 'deck' else 'disp']]]]
    if n == 66: return [['swap']]
    if n in (67, 68): return [['tuck', 'deck', 'a', 2]]
    m = re.match(r'^Up to 3x, pay (\[\w+\]) to (gain|lay) (.*?)\.', t)
    if m:
        out = [['g', toks(m.group(3))]] if m.group(2) == 'gain' else [['lay', toks(m.group(3)).count('egg'), 'a']]
        return [['pay', toks(m.group(1)), out, 3], ['opp', [['pay', toks(m.group(1)), out, 1]]]]
    raise SystemExit(f'cave {n}? {t}')

TY = {'WhenPlayed': 'W', 'Adventurer': 'A', 'OncePerRound': 'O', 'EndGame': 'E', 'Adventurer, EndGame': 'A'}
dr = []
for c in raw['dragons']:
    n = c['number']; sz = c['size'][0]
    o = {'n': c['name'], 'no': n, 'sz': sz, 'per': c['personality'][0], 'vp': int(c['VP'] or 0), 'cap': int(c['capacity'] or 0),
         'cv': ''.join(k for k, f in (('c', 'Crimson Cavern'), ('g', 'Golden Grotto'), ('a', 'Amethyst Abyss')) if c[f]),
         'cost': {k: int(c[f]) for k, f in (('meat', 'Meat'), ('gold', 'Gold'), ('crys', 'Crystal'), ('milk', 'Milk'), ('coin', 'Coin'), ('egg', 'Egg')) if c[f]},
         'ty': TY[c['abilityType']]}
    if n == 103: o['ty'] = 'A'   # the fan data marks it end-game, but it's an if-activated gain
    if sz == 'H': o['h'] = hatch(c)
    elif n in ENDS: o['ty'] = 'E'; o['say'] = SAY_END[n]
    else:
        assert n in X, (n, c['ability']); o['op'] = X[n]
    dr.append(o)
for n in X: assert any(d['no'] == n for d in dr if 'op' in d), n
cv = [{'no': c['number'], 'op': cave_ops(c['number'], c['ability'])} for c in raw['caves']]

OBJ = [  # id, label, count key
 ('hatch', 'Hatchlings on your mat'), ('small', 'Small dragons on your mat'), ('med', 'Medium dragons on your mat'),
 ('large', 'Large dragons on your mat'), ('inC', 'Dragons and cave cards in your Crimson Cavern'),
 ('inG', 'Dragons and cave cards in your Golden Grotto'), ('inA', 'Dragons and cave cards in your Amethyst Abyss'),
 ('cache', 'Cached resources on your mat'), ('eggs', 'Eggs on your mat'), ('perH', 'Helpful dragons on your mat'),
 ('perA', 'Aggressive dragons on your mat'), ('perS', 'Shy dragons on your mat'), ('perP', 'Playful dragons on your mat'),
 ('adv', 'Dragons with an if-activated ability'), ('wpopr', 'Dragons with a when-played or once-per-round ability'),
 ('caves', 'Cave cards on your mat (covered ones too)'), ('cheap', 'Dragons costing 0–2 (resources, coins, eggs)'),
 ('dear', 'Dragons costing 3 or more'), ('cap', 'Total egg capacity on your dragons'), ('guild', 'Position on the Dragon Guild')]
GUILD = {
 'rf': {'n': 'Rainforest Guild', 'rows': [[['pay', 'any', [['exc', 'handdisp']]]], [['playD', 'handdisp', 'nores']], [['g', 'coin,any,any']]],
        'end': 'rf', 'say': ['Pay 1 resource: excavate 1 space free (cave card from your hand or the display)',
                             'Play a dragon from your hand or the display, ignoring its resource costs', 'Gain 1 coin and 2 resources',
                             'End: 1 VP per resource icon on the dragons in your best cave'],
        'box': {2: [1, 1, 1, 2], 4: [2, 2, 2, 3]}},
 'hl': {'n': 'Guild of Highlands', 'rows': [[['pay', 'coin', [['exc', 'hand'], ['exc', 'hand']]]], [['pay', 'c', [['playD', 'hand', 'cover']]]], [['g', 'coin,c,c']]],
        'end': 'hl', 'say': ['Pay 1 coin: excavate up to 2 spaces free with cave cards from your hand',
                             'Pay 1 cave card: play a dragon from your hand on top of one of your dragons, free', 'Gain 1 coin and 2 cave cards',
                             'End: 1 VP per cave card on your mat'],
        'box': {2: [1, 2, 1, 1], 4: [2, 3, 2, 2]}},
 'pl': {'n': 'Guild of Plains', 'rows': [[['pay', 'egg', [['exc', 'deck']]]], [['pay', 'egg,egg', [['playD', 'hand', 'free']]]], [['g', 'coin'], ['lay', 2, 'a']]],
        'end': 'pl', 'say': ['Pay 1 egg: draw a cave card from the deck and play it free',
                             'Pay 2 eggs: play a dragon from your hand free', 'Gain 1 coin and lay 2 eggs', 'End: 1 VP per 2 eggs'],
        'box': {2: [2, 1, 1, 1], 4: [3, 2, 2, 2]}},
 'sf': {'n': 'Guild of Seafarers', 'rows': [[['exc', 'hand']], [['pay', 'd', [['playD', 'hand', 'free']]]], [['g', 'coin,d,d']]],
        'end': 'sf', 'say': ['Excavate 1 space free with a cave card from your hand',
                             'Pay 1 dragon card: play a dragon from your hand free', 'Gain 1 coin and 2 dragon cards',
                             'End: 3 VP per full column of dragons'],
        'box': {2: [1, 1, 2, 1], 4: [2, 2, 3, 2]}},
}
TRACK = ['mark', 'egg', 'meat', 'd', 'c', 'crys', 'mark', 'egg', 'gold', 'd', 'coin', 'milk']
MAT = {'c': {'n': 'Crimson Cavern', 'in': [['g', 'any']], 'after': [[['g', 'G']], [['g', 'any']], [['lay', 1, 'a']]], 'end': [['cache', 'any', 2, 'a', 'sup']]},
       'g': {'n': 'Golden Grotto', 'in': [['g', 'd']], 'after': [[['g', 'G']], [['g', 'd']], [['lay', 1, 'a']]], 'end': [['tuck', 'hand', 'a', 2]]},
       'a': {'n': 'Amethyst Abyss', 'in': [['g', 'c']], 'after': [[['g', 'G']], [['g', 'c']], [['lay', 1, 'a']]], 'end': [['x', 'cavesToEggs']]}}
js = '/* Wyrmspan (base game) cards: names, sizes, costs and caves from the Wyrmsearch fan data; effects are our own encoding (wyp/mkdata.py). */\n'
for k, v in (('WYD', dr), ('WYCV', cv), ('WYOBJ', [{'id': a, 'say': b} for a, b in OBJ]), ('WYGUILD', GUILD), ('WYTRACK', TRACK), ('WYMAT', MAT)):
    js += f'const {k}={json.dumps(v, separators=(",", ":"), ensure_ascii=False)};\n'
open(f'{D}/data.js', 'w').write(js)
print(len(dr), 'dragons', len(cv), 'caves', len(js), 'bytes')
