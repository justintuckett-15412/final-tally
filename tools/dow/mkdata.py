#!/usr/bin/env python3
"""Build dow/data.js for Dead of Winter (original 2014). Sources: Justin's photos (survivors, crises, objectives,
locations, colony), BGG fan sheets (item decks: RogertheDumpling; crossroads: galix). Our own short wording."""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(f'{D}/{f}'))
# item kinds: key -> (name, symbol, use, say)
K = {
 'food1': ('Food (1)', 'food', 'waste', 'Add 1 food token to the supply'),
 'food2': ('Food (2)', 'food', 'waste', 'Add 2 food tokens to the supply'),
 'food3': ('Food (3)', 'food', 'waste', 'Add 3 food tokens to the supply'),
 'fuel': ('Fuel', 'fuel', 'waste', 'Move a survivor without rolling for exposure'),
 'med': ('Medicine', 'med', 'waste', 'Heal 1 wound on your survivor, or on another player\'s survivor at a location with yours'),
 'junk': ('Junk', 'tools', 'waste', 'Reroll one of your unused dice'),
 'out1': ('Outsider', 'outsider', 'event', 'A new survivor joins your following'),
 'out2': ('2 Outsiders', 'outsider', 'event', 'A new survivor joins your following, plus 1 helpless survivor at the colony'),
 'out3': ('3 Outsiders', 'outsider', 'event', 'A new survivor joins your following, plus 2 helpless survivors at the colony'),
 'colt': ('Pistol', 'weapon', 'equip', 'Once per round: no exposure roll when this survivor attacks'),
 'rifle': ('Tactical Rifle', 'weapon', 'equip', 'Once per round: kill 1 zombie anywhere, no exposure roll (not an attack)'),
 'shotgun': ('Shotgun', 'weapon', 'equip', 'Once per round: an attack kills 2 zombies, no exposure roll; adds a noise token here if there is room'),
 'lighter': ('Lighter', 'weapon', 'equip', 'Once per round: when attacking, pay a fuel card to kill 4 zombies, no exposure roll'),
 'blade': ('Switchblade', 'weapon', 'equip', 'Once per round: attack with this survivor using a die of any value'),
 'jazz': ('Exercise Book', 'book', 'equip', 'Once per round: reroll one of your unused dice'),
 'cook': ('Cookbook', 'book', 'equip', 'Once per round, at the colony: add 1 food token'),
 'lead': ('Leadership Guide', 'book', 'equip', 'Once per round: raise one of your unused dice by 1'),
 'arts': ('Martial Arts Book', 'book', 'equip', 'Once per round: no exposure roll when this survivor attacks'),
 'barbook': ('Barricade Manual', 'book', 'equip', 'Once per round, at the colony: build a barricade without a die'),
 'bp_police': ('Police Station Blueprints', 'book', 'equip', 'Once per round: searching at the police station, keep 1 extra card'),
 'bp_grocery': ('Grocery Store Blueprints', 'book', 'equip', 'Once per round: searching at the grocery store, keep 1 extra card'),
 'bp_school': ('School Blueprints', 'book', 'equip', 'Once per round: searching at the school, keep 1 extra card'),
 'bp_library': ('Library Blueprints', 'book', 'equip', 'Once per round: searching at the library, keep 1 extra card'),
 'bp_hospital': ('Hospital Blueprints', 'book', 'equip', 'Once per round: searching at the hospital, keep 1 extra card'),
 'bp_gas': ('Gas Station Blueprints', 'book', 'equip', 'Once per round: searching at the gas station, keep 1 extra card'),
 'padlock': ('Padlock', 'tools', 'waste', 'Build 2 barricades where one of your survivors is, without a die'),
 'goggles': ('Night Vision Goggles', 'tools', 'equip', 'Roll 1 extra action die each round'),
 'walkie': ('Walkie Talkie', 'tools', 'equip', 'Lower another player\'s unused die by 1 to raise one of yours by 1'),
 'flesh': ('Rotten Flesh', 'tools', 'equip', 'Bites never spread to this survivor'),
 'hammer': ('Hammer', 'tools', 'equip', 'Once per round: a barricade action builds 2'),
 'shoes': ('Snow Shoes', 'tools', 'equip', 'Frostbite on this survivor counts as a normal wound'),
 'wrench': ('Wrench', 'tools', 'equip', 'Once per round: attack with this survivor using a die of any value'),
 'scissors': ('Scissors', 'tools', 'waste', 'Kill 1 zombie where one of your survivors is, no exposure roll'),
 'megaphone': ('Megaphone', 'tools', 'waste', 'Move up to 4 zombies from one location to where one of your survivors is'),
 'bat': ('Baseball Bat', 'tools', 'equip', 'Once per round: an attack with this survivor kills 2 zombies'),
 'mop': ('Mop', 'tools', 'equip', 'Once per round: cleaning waste removes 5 cards'),
 'flashlight': ('Flashlight', 'tools', 'equip', 'Once per round: making noise shows 3 cards instead of 1'),
 'lamp': ('Reading Lamp', 'tools', 'waste', 'Attack with one of your survivors without spending a die'),
 'adrenaline': ('Adrenaline Shot', 'med', 'waste', 'Set one of your unused dice to any value'),
}
DECKS = {
 'police': {'colt': 3, 'rifle': 2, 'shotgun': 1, 'fuel': 4, 'junk': 1, 'padlock': 1, 'goggles': 1, 'walkie': 1, 'food1': 3, 'out1': 1, 'out2': 2},
 'grocery': {'food1': 2, 'food2': 2, 'food3': 2, 'med': 6, 'junk': 1, 'flesh': 1, 'hammer': 1, 'shoes': 1, 'wrench': 1, 'out1': 1, 'out2': 2},
 'school': {'food1': 3, 'food2': 3, 'lead': 1, 'arts': 1, 'barbook': 1, 'bp_school': 1, 'junk': 1, 'scissors': 1, 'megaphone': 1, 'bat': 1, 'med': 3, 'out2': 2, 'out3': 1},
 'library': {'jazz': 1, 'cook': 1, 'bp_police': 1, 'bp_grocery': 1, 'bp_library': 1, 'bp_hospital': 1, 'bp_gas': 1, 'fuel': 4, 'food1': 4, 'junk': 1, 'lamp': 1, 'out1': 1, 'out2': 2},
 'hospital': {'med': 4, 'adrenaline': 2, 'fuel': 4, 'food2': 4, 'junk': 1, 'mop': 1, 'flashlight': 1, 'out2': 3},
 'gas': {'fuel': 6, 'lighter': 2, 'blade': 2, 'shotgun': 1, 'food1': 3, 'med': 3, 'out2': 2, 'out1': 1},
 'starter': {'food1': 10, 'junk': 5, 'fuel': 5, 'med': 5},
}
for d, c in DECKS.items():
    n = sum(c.values()); assert n == (25 if d == 'starter' else 20), (d, n)
cards = []
for d, c in DECKS.items():
    for k, n in c.items():
        for _ in range(n): cards.append({'k': k, 'd': d})
for i, c in enumerate(cards): c['id'] = i
SURV = J('survivors.json')
for i, s in enumerate(SURV): s['id'] = i
out = {'DWK': {k: {'n': v[0], 'sym': v[1], 'use': v[2], 'say': v[3]} for k, v in K.items()}, 'DWI': cards, 'DWS': SURV,
       'DWCR': J('crises.json'), 'DWMO': J('mainobj.json'), 'DWSO': J('secrets.json'), 'DWLOC': J('locations.json'), 'DWCOL': J('colony.json')}
js = '/* Dead of Winter (2014) card data for Final Tally – our own wording; see dow/mkdata.py */\n'
for k, v in out.items(): js += f'const {k}={json.dumps(v, separators=(",", ":"), ensure_ascii=False)};\n'
open(f'{D}/data.js', 'w').write(js); print(len(cards), 'item cards', len(js), 'bytes')
