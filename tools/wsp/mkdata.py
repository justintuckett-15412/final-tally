# builds /home/claude/wsp/data.js from birds.csv (Base rows) + Wingsearch bonus marks; run: python3 mkdata.py
import csv,json,re,collections
R=[r for r in csv.DictReader(open('/home/claude/wsp/birds.csv')) if r['Set']=='Base']
MJ={x['Common name']:x for x in json.load(open('/tmp/wsr/master.json'))}
FK={'Invertebrate':'i','Seed':'s','Fish':'f','Rodent':'r','Fruit':'u'}
FT={'invertebrate':'i','seed':'s','fish':'f','rodent':'r','fruit':'u'}
HK={'forest':'f','grassland':'g','wetland':'w'}
FN={'i':'invertebrate','s':'seed','f':'fish','r':'rodent','u':'fruit'}
HN={'f':'forest','g':'grassland','w':'wetland'}
def foods(t):return [FT[m] for m in re.findall(r'\[(invertebrate|seed|fish|rodent|fruit)\]',t)]
def hab(t):m=re.search(r'\[(forest|grassland|wetland)\]',t);return HK[m.group(1)] if m else None
def nest(t):m=re.search(r'\[(bowl|cavity|ground|platform)\]',t);return m.group(1) if m else None
def fl(L):return ' or '.join(FN[x] for x in L)
def power(t):
    T=t
    if not t:return None,''
    if t.startswith('All players draw 1'):return {'k':'allDraw'},'All players draw 1 card'
    m=re.match(r'All players gain 1 \[(\w+)\] from the supply',t)
    if m:f=FT[m.group(1)];return {'k':'allSupply','food':f},f'Everyone gains 1 {FN[f]}'
    if t.startswith('All players lay 1 [egg] on any 1'):n=nest(t);return {'k':'allLayNest','nest':n},f'Everyone lays 1 egg on a {n} bird; you may lay 1 more'
    if t.startswith('Cache 1'):f=foods(t)[0];return {'k':'cache','food':f},f'Cache 1 {FN[f]} from the supply here'
    m=re.match(r'Discard 1 \[egg\] from any of your other birds to gain (\d)',t)
    if m:n=int(m.group(1));return {'k':'eggForFood','n':n},f'Spend 1 egg from another bird: gain {n} food of any kind'
    if t.startswith('Discard 1 [egg] to draw 2'):return {'k':'eggForCards'},'Spend 1 egg: draw 2 cards'
    m=re.match(r'Discard 1 \[(\w+)\] to tuck 2',t)
    if m:f=FT[m.group(1)];return {'k':'discardFoodTuck','food':f},f'Pay 1 {FN[f]}: tuck 2 cards from the deck'
    m=re.match(r'Draw (\d) \[card\]\. If you do, discard 1',t)
    if m:n=int(m.group(1));return {'k':'drawDiscard','n':n},f'Draw {n}, then discard 1 card at the end of your turn'
    m=re.match(r'Draw (\d) \[card\]\.$',t)
    if m:n=int(m.group(1));return {'k':'draw','n':n},f'Draw {n} card{"s" if n>1 else ""}'
    if t.startswith('Each player gains 1 [die]'):return {'k':'eachDie'},'Everyone takes 1 die from the feeder; you choose who starts'
    if t.startswith('Gain 1 [die] from the birdfeeder'):return {'k':'feeder','food':None,'cache':0},'Take any 1 die from the feeder'
    m=re.match(r'Gain 1 (.*?) from the birdfeeder, if available\.( You may cache it)?',t)
    if m:F=foods(m.group(1));c=1 if m.group(2) else 0;return {'k':'feeder','food':F,'cache':c},f'Take 1 {fl(F)} from the feeder'+(', may cache it here' if c else '')
    m=re.match(r'Gain (\d) \[(\w+)\] from the supply',t)
    if m:n=int(m.group(1));f=FT[m.group(2)];return {'k':'supply','food':f,'n':n},f'Gain {n} {FN[f]} from the supply'
    m=re.match(r'Gain all \[(\w+)\] that are in the birdfeeder',t)
    if m:f=FT[m.group(1)];return {'k':'feederAll','food':f},f'Take every {FN[f]} die in the feeder'
    if t.startswith('If this bird is to the right'):return {'k':'moveRight'},'If it’s the last bird in its row, move it to another habitat'
    if t=='Lay 1 [egg] on any bird.':return {'k':'layAny'},'Lay 1 egg on any of your birds'
    if t=='Lay 1 [egg] on this bird.':return {'k':'layThis'},'Lay 1 egg here'
    m=re.match(r'Look at a \[card\] from the deck\. If less than (\d+)cm',t)
    if m:w=int(m.group(1));return {'k':'huntCard','ws':w},f'Hunt: top card under {w} cm is tucked here'
    m=re.match(r'Player\(s\) with the fewest birds in their \[(\w+)\] (draw|gain)',t)
    if m:h=HK[m.group(1)];
    if m and m.group(2)=='draw':return {'k':'fewestDraw','hab':h},f'Fewest {HN[h]} birds: draw 1 card'
    if m:return {'k':'fewestDie','hab':h},f'Fewest {HN[h]} birds: take 1 die from the feeder'
    if t.startswith('Repeat 1 [predator]'):return {'k':'repeatPredator'},'Use a predator power in this row again'
    if t.startswith('Repeat a brown power'):return {'k':'repeatBrown'},'Use another brown power in this row again'
    m=re.match(r'Roll all dice not in birdfeeder\. If any are \[(\w+)\]',t)
    if m:f=FT[m.group(1)];return {'k':'huntDice','food':f},f'Hunt: roll the spare dice; any {FN[f]} caches 1 here'
    if t.startswith('Trade 1 [wild]'):return {'k':'trade'},'Swap 1 of your food for another kind'
    if t.startswith('Tuck 1 [card] from your hand'):
        rest=t.split('If you do, ',1)[1]
        if rest.startswith('draw 1'):return {'k':'tuck','then':'draw'},'Tuck 1 card from your hand: draw 1'
        if rest.startswith('you may also lay'):return {'k':'tuck','then':'egg'},'Tuck 1 card from your hand: may lay 1 egg here'
        if rest.startswith('lay 1 [egg] on any'):return {'k':'tuck','then':'layAny'},'Tuck 1 card from your hand: lay 1 egg on any bird'
        F=foods(rest);return {'k':'tuck','then':'food','food':F},f'Tuck 1 card from your hand: gain 1 {fl(F)}'
    m=re.match(r'When another player plays a bird in their \[(\w+)\], (gain|tuck)',t)
    if m:
        h=HK[m.group(1)]
        if m.group(2)=='gain':f=foods(t)[0];return {'k':'onPlayHab','hab':h,'food':f},f'When someone plays a {HN[h]} bird: gain 1 {FN[f]}'
        return {'k':'onPlayHab','hab':h,'tuck':1},f'When someone plays a {HN[h]} bird: tuck 1 card from your hand'
    if 'takes the “gain food” action' in t:f=foods(t)[0];return {'k':'onGainFood','food':f},f'When someone takes {FN[f]} with gain food: cache 1 here'
    m=re.search(r'takes the “lay eggs” action, lay 1 \[egg\] on (another bird|a bird) with a \[(\w+)\] nest',t)
    if m:o=1 if m.group(1)=='another bird' else 0;n=m.group(2);return {'k':'onLayEgg','nest':n,'other':o},f'When someone lays eggs: lay 1 on {"another" if o else "a"} {n} bird of yours'
    if 'predator] succeeds' in t:return {'k':'onPredator'},'When someone’s hunt works: take 1 die from the feeder'
    if t.startswith('Draw 2 new bonus cards'):return {'k':'bonus'},'Draw 2 bonus cards, keep 1'
    if t.startswith('Draw [card] equal to the number of players'):return {'k':'oyster'},'Draw players+1 cards; each player picks one, you keep the last'
    if t.startswith('Draw the 3 face-up'):return {'k':'trayAll'},'Take all 3 cards from the tray'
    m=re.match(r'Lay 1 \[egg\] on each of your birds with a \[(\w+)\] nest',t)
    if m:n=m.group(1);return {'k':'layNest','nest':n},f'Lay 1 egg on each of your {n} birds'
    if t.startswith("Play an additional bird in this bird's habitat"):return {'k':'playAnother','hab':'same'},'Play another bird in this row'
    m=re.match(r'Play an additional bird in your \[(\w+)\]',t)
    if m:h=HK[m.group(1)];return {'k':'playAnother','hab':h},f'Play another bird in your {HN[h]}'
    raise SystemExit('UNMAPPED: '+T)
def cost(s):
    c={};w=0;o=1 if ' or ' in s else 0
    for part in re.split(r' \+ | or ',s) if s else []:
        n,f=part.split(' ',1);n=int(n)
        if f=='Wild':w+=n
        else:c[FK[f]]=c.get(FK[f],0)+n
    return c,o,w
NAMETAGS=['Anatomist','Cartographer','Historian','Photographer']
out=[];kinds=collections.Counter()
for r in R:
    c,o,w=cost(r['Food cost']);pw,say=power(r['Power'])
    if pw:kinds[pw['k']]+=1
    k=pw['k'] if pw else ''
    m=MJ[r['Name']]
    b={'n':r['Name'],'sci':r['Scientific name'],'pts':int(r['Points']),'hab':''.join(HK[h.lower()][0] for h in ['Forest','Grassland','Wetland'] if h in r['Habitats'].split('/')),
       'cost':c,'or':o,'wild':w,'nest':{'wild':'star'}.get(r['Nest'],r['Nest']),'egg':int(r['Egg limit']),'ws':int(r['Wingspan (cm)']),'col':r['Power color'].lower(),'pw':pw,'say':say,
       'pred':1 if k in('huntDice','huntCard') else 0,'flock':1 if k in('tuck','discardFoodTuck') or k=='onPlayHab' and pw.get('tuck') else 0,
       'tags':[t.lower() for t in NAMETAGS if m.get(t)=='X']}
    if m.get('Swift Start')=='X':b['swift']=1
    out.append(b)
# cross-check flags with Wingsearch
bad=[b['n'] for b in out if bool(b['pred'])!=bool(MJ[b['n']]['Predator']) or bool(b['flock'])!=bool(MJ[b['n']]['Flocking'])]
print('pred/flock mismatches vs wingsearch:',bad)
print(dict(kinds),sum(kinds.values()))
BON=[
 ('anatomist','Anatomist','Birds with a body part in their name',{'tiers':[[2,3],[4,7]]},'tag:anatomist'),
 ('backyard','Backyard Birder','Birds worth less than 4 points',{'tiers':[[5,3],[7,6]]},'pts<4'),
 ('counter','Bird Counter','Birds with a flocking power',{'per':2},'flock'),
 ('feeder','Bird Feeder','Birds that eat seed',{'tiers':[[5,3],[8,7]]},'cost:s'),
 ('breeding','Breeding Manager','Birds with at least 4 eggs on them',{'per':1},'eggsOn>=4'),
 ('carto','Cartographer','Birds with a place in their name',{'tiers':[[2,3],[4,7]]},'tag:cartographer'),
 ('ecologist','Ecologist','Birds in your habitat with the fewest birds',{'per':2},'special:ecologist'),
 ('enclosure','Enclosure Builder','Birds with ground nests',{'tiers':[[4,4],[6,7]]},'nest:ground'),
 ('falconer','Falconer','Birds with a predator power',{'per':2},'pred'),
 ('fishery','Fishery Manager','Birds that eat fish',{'tiers':[[2,3],[4,8]]},'cost:f'),
 ('foodweb','Food Web Expert','Birds that eat only invertebrates',{'per':2},'costOnly:i'),
 ('forester','Forester','Birds that live only in the forest',{'tiers':[[3,4],[5,8]]},'onlyHab:f'),
 ('historian','Historian','Birds named after a person',{'per':2},'tag:historian'),
 ('large','Large Bird Specialist','Birds with a wingspan over 65 cm',{'tiers':[[4,3],[6,6]]},'ws>65'),
 ('nestbox','Nest Box Builder','Birds with cavity nests',{'tiers':[[4,4],[6,7]]},'nest:cavity'),
 ('omnivore','Omnivore Specialist','Birds with a wild food in their cost',{'per':2},'wild'),
 ('oologist','Oologist','Birds with at least 1 egg on them',{'tiers':[[7,3],[9,6]]},'eggsOn>=1'),
 ('passerine','Passerine Specialist','Birds with a wingspan of 30 cm or less',{'tiers':[[4,3],[6,6]]},'ws<=30'),
 ('photo','Photographer','Birds with a colour in their name',{'tiers':[[4,3],[6,7]]},'tag:photographer'),
 ('platform','Platform Builder','Birds with platform nests',{'tiers':[[4,4],[6,7]]},'nest:platform'),
 ('prairie','Prairie Manager','Birds that live only in the grassland',{'tiers':[[2,3],[4,8]]},'onlyHab:g'),
 ('rodent','Rodentologist','Birds that eat rodents',{'per':2},'cost:r'),
 ('visionary','Visionary Leader','Bird cards in your hand at the end',{'tiers':[[5,4],[8,7]]},'special:visionary'),
 ('viti','Viticulturalist','Birds that eat fruit',{'tiers':[[2,3],[4,7]]},'cost:u'),
 ('wetland','Wetland Scientist','Birds that live only in the wetland',{'tiers':[[3,3],[5,7]]},'onlyHab:w'),
 ('garden','Wildlife Gardener','Birds with bowl nests',{'tiers':[[4,4],[6,7]]},'nest:bowl')]
# check computable tests against Wingsearch per-bird marks (static ones only)
COL={'backyard':'Backyard Birder','counter':'Bird Counter','feeder':'Bird Feeder','enclosure':'Enclosure Builder','falconer':'Falconer','fishery':'Fishery Manager','foodweb':'Food Web Expert','forester':'Forester','large':'Large Bird Specialist','nestbox':'Nest Box Builder','omnivore':'Omnivore Expert','passerine':'Passerine Specialist','platform':'Platform Builder','prairie':'Prairie Manager','rodent':'Rodentologist','viti':'Viticulturalist','wetland':'Wetland Scientist','garden':'Wildlife Gardener'}
def test(b,t):
    if t.startswith('tag:'):return t[4:] in b['tags']
    if t=='pts<4':return b['pts']<4
    if t=='flock':return b['flock']==1
    if t=='pred':return b['pred']==1
    if t.startswith('cost:'):return b['cost'].get(t[5:],0)>0
    if t.startswith('costOnly:'):f=t[9:];return b['cost'].get(f,0)>0 and set(b['cost'])=={f} and not b['wild']
    if t.startswith('nest:'):return b['nest'] in (t[5:],'star')
    if t.startswith('onlyHab:'):return b['hab']==t[8:]
    if t=='ws>65':return b['ws']>65
    if t=='ws<=30':return b['ws']<=30
    if t=='wild':return b['wild']>0
    return None
for bid,nm,_,_,t in BON:
    if bid in COL:
        diff=[b['n'] for b in out if test(b,t)!=(MJ[b['n']].get(COL[bid])=='X')]
        if diff:print('bonus mismatch',bid,diff)
GOAL=[(1,'bf','Birds in your forest','birdsHab',{'hab':'f'}),(1,'ef','Eggs in your forest','eggsHab',{'hab':'f'}),
 (2,'bg','Birds in your grassland','birdsHab',{'hab':'g'}),(2,'eg','Eggs in your grassland','eggsHab',{'hab':'g'}),
 (3,'bw','Birds in your wetland','birdsHab',{'hab':'w'}),(3,'ew','Eggs in your wetland','eggsHab',{'hab':'w'}),
 (4,'nbowl','Bowl-nest birds with an egg','birdsNestEgg',{'nest':'bowl'}),(4,'ebowl','Eggs in bowl nests','eggsNest',{'nest':'bowl'}),
 (5,'ncav','Cavity-nest birds with an egg','birdsNestEgg',{'nest':'cavity'}),(5,'ecav','Eggs in cavity nests','eggsNest',{'nest':'cavity'}),
 (6,'ngr','Ground-nest birds with an egg','birdsNestEgg',{'nest':'ground'}),(6,'egr','Eggs in ground nests','eggsNest',{'nest':'ground'}),
 (7,'nplat','Platform-nest birds with an egg','birdsNestEgg',{'nest':'platform'}),(7,'eplat','Eggs in platform nests','eggsNest',{'nest':'platform'}),
 (8,'sets','Sets of 3 eggs, one in each habitat','sets',{}),(8,'total','Birds you have played','birdsTotal',{})]
js='/* Wingspan base game data for the playable game. Birds from Justin\'s list (birds.csv, Set=Base: 170 birds + the 10 Swift-Start birds);\n   bonus cards and round goals checked against the Wingspan appendix and the Wingsearch fan database. "say" texts are our own short wording. */\n'
js+='const WSB='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
js+='const WSBON='+json.dumps([{'id':a,'name':b,'say':c,'score':d,'test':e} for a,b,c,d,e in BON],ensure_ascii=False,separators=(',',':'))+';\n'
js+='const WSGOAL='+json.dumps([dict({'id':i,'tile':t,'say':s,'k':k},**p) for t,i,s,k,p in GOAL],ensure_ascii=False,separators=(',',':'))+';\n'
open('/home/claude/wsp/data.js','w').write(js)
print('birds',len(out),'bonus',len(BON),'goals',len(GOAL),'tags',collections.Counter(t for b in out for t in b['tags']))
