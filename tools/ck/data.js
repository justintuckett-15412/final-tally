/* ================= Cover Your Kingdom: card data =================
   CK_SP: every species in the box. kind 'clan' (Clanning Creature) | 'wild' | 'hire' (Creature for Hire).
   For clan/wild: v = magic value on the gem, land = 'high'|'low'|'either' (wilds: null), land2 = land in the
   Two Ruler game ('high'|'low'|'mane'|'any'), cl = constellation cluster ('high'|'either'|'low').
   The engine reads values and lands ONLY from this table (via ckV / ckLand*), never from anywhere else.
   Values and most lands are printed on the cards, not in the rulebook: see CK_TODO below. */

/* ---------------- Card values and lands (confirmed from Justin's card photo, Nov 18 2026) ----------------
   Each entry: [value, land]. Highland: Yedi 5, Sighclops 5, PegLegasus 10, Bragon 15.
   Lowland: LepreCon 5, VulcEnt 5, UniqueHorn 10, Klaken 15. Either: Pigxie 5, Hentaur 10. Wilds: CT 20, Spydra 40.
   cl (constellation cluster) = the standard land. The tiny corner numbers on Pigxie/Hentaur aren't readable and are ignored. */
const CK_TODO={
  yy:[5,'high'], pg:[5,'either'], lc:[5,'low'], sc:[5,'high'], ve:[5,'low'],
  pl:[10,'high'], he:[10,'either'], uh:[10,'low'], kl:[15,'low'], br:[15,'high'],
  ct:[20,null], sp:[40,null]};
/* the species. Two Ruler land: horses (PegLegasi, Hentaurs, UniqueHorns) live only in the Maneland; Pigxies any of the three */
const CK_SP=[
  {id:'yy',name:'Yogi Yedi',kind:'clan',count:13},
  {id:'pg',name:'Pigxie',kind:'clan',count:13,land2:'any'},
  {id:'lc',name:'LepreCon Men',kind:'clan',count:13},
  {id:'sc',name:'Sighclops',kind:'clan',count:13},
  {id:'ve',name:'VulcEnt',kind:'clan',count:13},
  {id:'pl',name:'PegLegasi',kind:'clan',count:11,land2:'mane'},
  {id:'he',name:'Hentaur',kind:'clan',count:11,land2:'mane'},
  {id:'uh',name:'UniqueHorns',kind:'clan',count:11,land2:'mane'},
  {id:'kl',name:'Klaken',kind:'clan',count:9},
  {id:'br',name:'Bragon',kind:'clan',count:9},
  {id:'ct',name:'CerbeRussel Terrier',kind:'wild',count:10},
  {id:'sp',name:'Spydra',kind:'wild',count:5},
  {id:'mt',name:'Minnowtaur',kind:'hire',count:2,v:0},
  {id:'hy',name:'Hypnogriff',kind:'hire',count:2,v:0},
  {id:'el',name:"Grumbledalf's Elves",kind:'hire',count:2,v:0},
  {id:'wz',name:'Wiizzzaard',kind:'hire',count:2,v:0},
  {id:'mb',name:'Mobgoblins',kind:'hire',count:2,v:0}];
CK_SP.forEach(s=>{const t=CK_TODO[s.id];if(!t)return;s.v=t[0];s.land=t[1];
  if(s.kind==='clan'){s.cl=s.land;if(!s.land2)s.land2=s.land}});
const CK_SPI=Object.fromEntries(CK_SP.map(s=>[s.id,s]));
const CK_CLANS=CK_SP.filter(s=>s.kind==='clan').map(s=>s.id);
/* Two Ruler game: removed from the deck (2 of each Clanning Creature, 2 CTs, 1 Spydra, 2 Minnowtaurs) */
const CK_2P_OUT={yy:2,pg:2,lc:2,sc:2,ve:2,pl:2,he:2,uh:2,kl:2,br:2,ct:2,sp:1,mt:2};
/* Constellation Prizes: bonus by number of Rulers [Highland, Either, Lowland, Astronomical] (page 17) */
const CK_BONUS=[{min:2,max:4,b:{high:20,either:10,low:20,astro:50}},{min:5,max:6,b:{high:30,either:15,low:30,astro:75}},{min:7,max:8,b:{high:40,either:20,low:40,astro:100}}];
const CK_TOK_SHARED=6; /* 7-8 Rulers: 60 tokens split into ten piles by species = 6 per species */
/* Kingdom Powers (page 18). kind 'act' = free extra action, 'mod' = alters a rule for you only. no23 = removed for 2-3 Rulers */
const CK_POW=[
  {id:'wkid',name:'Wiizzz Kid',kind:'act',text:'Once per turn, at any time, you may swap one of your top Clans with the Clan directly below it, at no action cost.'},
  {id:'dh',name:'DissedHard',kind:'act',text:'At the end of your turn, at no action cost, you may discard up to two Creatures before replenishing your hand.'},
  {id:'mm',name:'Match Maker',kind:'act',text:'Each turn, you may settle one Clan at no action cost.'},
  {id:'eq',name:'Equinity',kind:'mod',text:'You may use Hentaurs as Wild cards to defend or recruit Clans of PegLegasi or Uniquehorns (but not to settle).'},
  {id:'xf',name:'Extra Freatures',kind:'mod',no23:true,text:'You may use the abilities of Wiizzzaards, Minnowtaurs, and Hypnogriffs interchangeably.'},
  {id:'swine',name:'Mighty Swine',kind:'mod',text:"Pigxies that you've acquired by the end of the contest are worth 15 magic each instead of 5."},
  {id:'vh',name:'VulcEnt Hands',kind:'mod',text:'Increase the number of cards you hold by one.'},
  {id:'sub',name:'SubCerbient',kind:'mod',no23:true,text:'CTs you play count as two Creatures (like Spydras) and Spydras played against you only count as one Creature.'}];
const CK_POWI=Object.fromEntries(CK_POW.map(p=>[p.id,p]));
