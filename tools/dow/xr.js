/* ================= Dead of Winter crossroads cards (all 80, original 2014 box) =================
   Our own short wording of each trigger and option (mechanics only; the card has the story).
   trig: ev = event the engine reports ('any' = checked at the start of the turn and after every action);
         the other keys are conditions, see dwXrCond below.
   opts: [{say, ops}] – ops use the effect vocabulary in dow/SPEC.md (run by the engine's DWOP handlers).
   vote: {who:'colony'|'atDest'} – players vote thumbs up (opts[0]) or down (opts[1]); ties: first player decides.
   chooser: 'controls:<name>' – that survivor's controller picks instead of the turn player.
   pre: ops that happen as soon as the card is read, before the choice. */
const DWXR=[
{no:1,t:'Car Crash',trig:{ev:'move',fuel:true,nonExiled:1},say:'You move a survivor using a fuel card',opts:[
 {say:'That survivor gets frostbite and is placed back at the colony',ops:[['frost','moved'],['place','moved','colony']]},
 {say:'That survivor arrives, but rolls for exposure 3 times',ops:[['exposure','moved',3]]}]},
{no:2,t:'Wavering Loyalties',trig:{ev:'any',followMore:1},say:'You have more survivors than at least one other player',opts:[
 {say:'Give one of your followers to a player with fewer survivors',ops:[['giveFollower','fewer']]},
 {say:'Roll a die: on 1–3 lose 1 morale',ops:[['rollTable',[[1,3,[['morale',-1]]]]]]}]},
{no:3,t:'Horde',trig:{ev:'move',fuel:false},say:'You move a survivor without using fuel',opts:[
 {say:'Roll for exposure 3 more times on that survivor',ops:[['exposure','moved',3]]},
 {say:'That survivor goes back where it came from and cannot move again this turn',ops:[['place','moved','from'],['noMove','moved']]}]},
{no:4,t:'Addiction',trig:{ev:'heal'},say:'You play a medicine card to heal a survivor',opts:[
 {say:'The healed survivor dies (no morale loss)',ops:[['kill','healed',{nomorale:1}]]},
 {say:'The healed survivor is hooked: at the start of each of your turns, play a medicine on it or lose an unused die',ops:[['flag','addict','healed']]}]},
{no:5,t:'Spoiled',trig:{ev:'spendFood'},say:'You spend food tokens to raise a die',opts:[
 {say:'Put a wound on one of your survivors; the die still goes up',ops:[['wound','chosen',1]]},
 {say:'Throw it out: the food is spent but the die does not go up',ops:[['cancelFood']]}]},
{no:6,t:'Maude',trig:{ev:'any',mineAt:'grocery',nonExiled:1},say:'One of your survivors is at the grocery store',opts:[
 {say:'That survivor goes back to the colony and you add 3 food',ops:[['place','chosenAt:grocery','colony'],['food',3]]},
 {say:'Take 2 food cards from the grocery deck; you cannot play food cards this turn',ops:[['fetch','grocery','sym:food',2],['flag','noFoodCards','turn']]}]},
{no:7,t:'Sparky',trig:{ev:'any',controls:'Sparky',nonExiled:1},say:'You control Sparky',opts:[
 {say:'Kill 8 zombies at the colony, no exposure rolls',ops:[['killZ','colony',8]]},
 {say:'Gain 1 morale',ops:[['morale',1]]}]},
{no:8,t:'Maria Lopez',trig:{ev:'any',controls:'Maria Lopez',nonExiled:1},say:'You control Maria Lopez',opts:[
 {say:'Pay 3 food tokens: take any 3 cards from the school deck',ops:[['food',-3],['fetch','school','choice',3]],need:{food:3}},
 {say:'Remove all food cards from the school deck',ops:[['purge','school','sym:food']]}]},
{no:9,t:'Brian Lee',trig:{ev:'any',controls:'Brian Lee',named:'Brian Lee',at:'colony'},say:'You control Brian Lee and he is at the colony',opts:[
 {say:'Clear all zombies from the hospital and build 4 barricades there',ops:[['clearZ','hospital'],['barricades','hospital',4]]},
 {say:'Clear all zombies from the grocery store and build 4 barricades there',ops:[['clearZ','grocery'],['barricades','grocery',4]]}]},
{no:10,t:"Lover's Quarrel",trig:{ev:'any',pairNonColony:1},say:'Two of your (human) survivors share a location away from the colony',opts:[
 {say:'Add 4 noise tokens where they are',ops:[['noise','pair',4]]},
 {say:'Those two cannot attack, search or move for the rest of this turn',ops:[['freeze','pair']]}]},
{no:11,t:'Mugging',trig:{ev:'any',sharesExiled:1,nonExiled:1},say:'Your survivor shares a location with an exiled survivor',opts:[
 {say:"Give all but 1 card in your hand to the exiled survivor's player",ops:[['giveHand','exiledHere',1]]},
 {say:'Fight back: 2 wounds on your survivor there (with a weapon you may kill the exiled survivor and take only 1)',ops:[['custom','muggingFight']]}]},
{no:12,t:'Hunger',trig:{ev:'outsider',helplessAdded:1,male:1},say:'You add a male survivor and a helpless survivor to the colony',opts:[
 {say:'All the food in the supply is eaten',ops:[['foodSet',0]]},
 {say:'Add 5 food and lose 1 morale',ops:[['food',5],['morale',-1]]}]},
{no:13,t:'Thin Ice',trig:{ev:'move'},say:'You move a survivor',opts:[
 {say:'Roll a die: 1–3 the moved survivor gets frostbite; 4–6 take any card from any item deck',ops:[['rollTable',[[1,3,[['frost','moved']]],[4,6,[['fetch','any','choice',1]]]]]]},
 {say:'Nothing happens',ops:[]}]},
{no:14,t:'Helpless',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Remove all helpless survivors; lose 1 morale per 2 removed (rounded up)',ops:[['custom','dropHelpless']]},
 {say:'Nothing happens',ops:[]}]},
{no:15,t:'Christmas',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:"Spend 5 food, gain 1 morale; Forest Plum's player may hand out up to 4 grocery cards to other players",ops:[['food',-5],['morale',1],['custom','santa']],need:{food:5}},
 {say:'Nothing happens',ops:[]}]},
{no:16,t:'Talia Jones',trig:{ev:'any',controls:'Talia Jones'},say:'You control Talia Jones',opts:[
 {say:'Pick an item deck and take any 4 cards from it',ops:[['fetch','any','choice',4]]},
 {say:'The next crisis revealed is removed and that round has no crisis',ops:[['flag','skipNextCrisis',1]]}]},
{no:17,t:'Arthur Thurston',trig:{ev:'any',controls:'Arthur Thurston',nonExiled:1},say:'You control Arthur Thurston',opts:[
 {say:'Put 2 wounds on Arthur',ops:[['wound','named:Arthur Thurston',2]]},
 {say:'Lose 1 morale',ops:[['morale',-1]]}]},
{no:18,t:'Gray Beard',trig:{ev:'move',inDeck:'Gray Beard'},say:'You move a survivor while Gray Beard is still in the survivor deck',opts:[
 {say:'Remove a random card in your hand from the game',ops:[['loseRandomCard',1]]},
 {say:"Gray Beard becomes your group leader: once per round he attacks without exposure, but while you control him you can't add cards to crises",ops:[['takeSurv','Gray Beard','lead'],['flag','grayBeard','me']]}]},
{no:19,t:'Sophie Robinson',trig:{ev:'move',inDeck:'Sophie Robinson'},say:'You move a survivor while Sophie Robinson is still in the survivor deck',opts:[
 {say:'Sophie joins your following with 2 wounds',ops:[['takeSurv','Sophie Robinson'],['wound','named:Sophie Robinson',2]]},
 {say:'Draw 2 cards from an item deck of your choice; Sophie leaves the game',ops:[['item','choose',2],['removeSurvDeck','Sophie Robinson']]}]},
{no:20,t:'Wounded Survivor',trig:{ev:'search',nonExiled:1},say:'You search with a survivor',opts:[
 {say:'A new survivor joins your following; roll for exposure twice on them',ops:[['survivor',1],['exposure','new',2]]},
 {say:'Nothing happens',ops:[]}]},
{no:21,t:'Creature Comforts',trig:{ev:'any',mineAt:'colony'},say:'One of your survivors is at the colony',opts:[
 {say:'Players may together put 3 fuel cards in the waste pile (no effect) to gain 1 morale',ops:[['collective',{fuel:3},'waste',[['morale',1]]]]}]},
{no:22,t:'Outbreak',trig:{ev:'any',mineAt:'colony',helpless:1},say:'Your survivor is at the colony with at least 1 helpless survivor',opts:[
 {say:'Send a helpless survivor away; lose 1 morale',ops:[['helpless',-1],['morale',-1]]},
 {say:'Every survivor at the colony gets 1 wound; unless Olivia Brown or Janet Taylor is in play, each helpless survivor dies on a roll of 1',ops:[['wound','colonyAll',1],['custom','outbreakRoll']]}]},
{no:23,t:'Olivia Brown',trig:{ev:'any',inPlay:'Olivia Brown'},vote:{who:'colony'},pre:[['place','named:Olivia Brown','colony']],say:'Olivia Brown is in play (she goes to the colony, then vote)',opts:[
 {say:'Olivia experiments each round at the colony: roll exposure on her; on a blank, medicine can cancel bites that round',ops:[['flag','olivia',1]]},
 {say:'Nothing happens',ops:[]}]},
{no:24,t:'Brandon Kane',trig:{ev:'any',inPlay:'Brandon Kane',namedNotExiled:'Brandon Kane'},say:'Brandon Kane is in play',opts:[
 {say:'Put 1 wound on Brandon and place him at the colony',ops:[['wound','named:Brandon Kane',1],['place','named:Brandon Kane','colony']]},
 {say:'Put the last 10 item cards removed from the game into the waste pile',ops:[['removedToWaste','any',10]]}]},
{no:25,t:'No Ammo',trig:{ev:'weapon'},say:'You use a weapon card’s ability',opts:[
 {say:'That weapon goes to the waste pile',ops:[['wasteCard','used']]},
 {say:'All your unused dice become used',ops:[['allDiceUsed']]}]},
{no:26,t:'Forest Plum',trig:{ev:'any',inPlay:'Forest Plum'},say:'Forest Plum is in play',opts:[
 {say:'Forest goes to the grocery store; add 4 noise tokens there',ops:[['place','named:Forest Plum','grocery'],['noise','grocery',4]]},
 {say:'The survivor with the lowest influence (not Forest) gets 1 wound',ops:[['wound','lowestNot:Forest Plum',1]]}]},
{no:27,t:'Daniel Smith',trig:{ev:'any',controls:'Daniel Smith',helpless:1},pre:[['helpless',-1]],say:'You control Daniel Smith and there is a helpless survivor (one is removed)',opts:[
 {say:"Spend a die: jail a survivor at the police station; their items go back to its owner's hand and it can't move, search, attack or use its ability again",ops:[['loseDie'],['custom','jail']]},
 {say:'Lose 1 morale',ops:[['morale',-1]]}]},
{no:28,t:'Little Survivors',trig:{ev:'move',alone:1,nonExiled:1},say:'You move a survivor to a location with no other survivors',opts:[
 {say:'Add 3 helpless survivors and gain 1 morale',ops:[['helpless',3],['morale',1]]},
 {say:'Nothing happens',ops:[]}]},
{no:29,t:'Prophet',trig:{ev:'any',exiledShares:1},say:'Your exiled survivor shares a location with a non-exiled survivor',opts:[
 {say:'Take a non-exiled survivor at a location with yours into your following',ops:[['custom','prophet']]},
 {say:'Lose 1 morale',ops:[['morale',-1]]}]},
{no:30,t:'Music',trig:{ev:'search',nonExiled:1},say:'You search with a survivor',opts:[
 {say:'Gain 1 morale',ops:[['morale',1]]},
 {say:'Every player rolls 1 extra action die next round',ops:[['extraDie','all',1]]}]},
{no:31,t:'Collapsing Barriers',trig:{ev:'any',mineAt:'colony',colonyBarZ:1},vote:{who:'colony'},say:'Your survivor is at the colony, which has a barricade and a zombie (vote)',opts:[
 {say:'Each player with survivors at the colony rolls exposure on one of them',ops:[['exposure','eachColonyChosen',1]]},
 {say:'Remove all barricades at the colony',ops:[['clearBar','colony']]}]},
{no:32,t:'Radio Signal',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Players may together give up 3 unused dice: then add 1 helpless survivor and gain 1 morale; if not, lose 1 morale',ops:[['collective',{die:3},'',[['helpless',1],['morale',1]],[['morale',-1]]]]},
 {say:'Lose 1 morale',ops:[['morale',-1]]}]},
{no:33,t:'Toxic Waste',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Each player puts frostbite on one of their survivors at the colony',ops:[['frost','eachColonyChosen']]},
 {say:'Put every removed fuel and medicine card into the waste pile',ops:[['removedToWaste','sym:fuel,med',99]]}]},
{no:34,t:'Alexis Grey',trig:{ev:'any',controls:'Alexis Grey',nonExiled:1},pre:[['place','named:Alexis Grey','library']],say:'You control Alexis Grey (she goes to the library if there is room)',opts:[
 {say:'Alexis can never leave the library',ops:[['flag','stay','named:Alexis Grey','library']]},
 {say:'Alexis goes to the colony and can never go to the library',ops:[['place','named:Alexis Grey','colony'],['flag','never','named:Alexis Grey','library']]}]},
{no:35,t:'James Meyers',trig:{ev:'any',controls:'James Meyers',nonExiled:1},say:'You control James Meyers',opts:[
 {say:"See every player's hand; you may remove 3 medicine cards from among them to gain 1 morale",ops:[['peek','hands'],['collective',{med:3},'remove',[['morale',1]]]]},
 {say:"See one player's secret objective",ops:[['peek','objective']]}]},
{no:36,t:'Bev Russell',trig:{ev:'any',controls:'Bev Russell'},pre:[['place','named:Bev Russell','school']],say:'You control Bev Russell (she goes to the school if there is room)',opts:[
 {say:'Bev guards the school for good (her card leaves the game); any survivor moving to the school takes 1 wound',ops:[['custom','bevGuard']]},
 {say:'Remove all item cards and zombies from the school',ops:[['clearZ','school'],['purge','school','all']]}]},
{no:37,t:'The Deputy',trig:{ev:'any',mineAt:'nonColony',nonExiled:1},say:'One of your survivors is away from the colony',opts:[
 {say:'Take every weapon among the top 8 police station cards; the main objective now also needs no zombies at the gas station, hospital and police station',ops:[['revealTake','police',8,'sym:weapon'],['addWin','deputy']]},
 {say:'Nothing happens',ops:[]}]},
{no:38,t:'Sewer Passage',trig:{ev:'any',mineAt:'library'},say:'One of your survivors is at the library',opts:[
 {say:'Roll a die and roll exposure that many times on your survivor there; if it lives, moves between the colony and the hospital never need exposure rolls',ops:[['custom','sewer']]},
 {say:'Nothing happens',ops:[]}]},
{no:39,t:'Horse',trig:{ev:'move',nonExiled:1},say:'You move a survivor',opts:[
 {say:'The moved survivor gets a horse: it never rolls exposure when moving, but the colony pays 1 extra food each round',ops:[['flag','horse','moved']]}]},
{no:40,t:'Thomas Heart',trig:{ev:'weapon',inPlay:'Thomas Heart'},chooser:'controls:Thomas Heart',say:"You use a weapon card's ability while Thomas Heart is in play (his player chooses)",opts:[
 {say:'Thomas spreads 4 wounds among the other survivors at his location',ops:[['custom','thomasWounds']]},
 {say:'Players together remove 2 medicine cards in their hands from the game',ops:[['collective',{med:2},'remove',[],null,1]]},
 {say:'Kill Thomas',ops:[['kill','named:Thomas Heart']]}]},
{no:41,t:'Rod Miller',trig:{ev:'any',inPlay:'Rod Miller'},say:'Rod Miller is in play',opts:[
 {say:'Rod and 2 of your survivors go to the hospital and each rolls exposure twice (survivors there may be sent to the colony to make room)',ops:[['custom','rodHospital']]},
 {say:'Kill Rod',ops:[['kill','named:Rod Miller']]}]},
{no:42,t:'Supply Drop',trig:{ev:'any',mineAt:'colony'},say:'One of your survivors is at the colony',opts:[
 {say:'Roll exposure 3 times on one of your survivors; if it lives, add 5 food and gain 1 morale',ops:[['exposure','chosen',3,[['food',5],['morale',1]]]]},
 {say:'Nothing happens',ops:[]}]},
{no:43,t:'Army',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},alt:{named:'Thomas Heart',at:'colony',say:'Thomas Heart is at the colony and sees through them: nothing happens'},say:'One of your survivors is at the colony (vote by everyone with a survivor there)',opts:[
 {say:'The main objective now also needs 5 food in the supply',ops:[['addWin','army']]},
 {say:'Roll a die for each survivor at the colony: on 1–3 it gets a wound',ops:[['rollEach','colony',3,[['wound','it',1]]]]}]},
{no:44,t:'Gambling',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Each player may stake 1 card per survivor they have at the colony; the highest roll takes them all',ops:[['custom','gamble']]},
 {say:'Nothing happens',ops:[]}]},
{no:45,t:'Bitter Cold Night',trig:{ev:'frostbite',onMove:1,destOccupied:1},vote:{who:'atDest'},say:'Your survivor gets frostbite moving to a location with other survivors (they vote)',opts:[
 {say:'Every survivor there gets frostbite',ops:[['frost','atDest']]},
 {say:'The moving survivor dies',ops:[['kill','moved']]}]},
{no:46,t:'Lighthouse',trig:{ev:'any',mineAt:'colony'},say:'One of your survivors is at the colony',opts:[
 {say:'You may give up 1 unused die to remove 1 zombie from every location',ops:[['pay',{die:1},[['killEach',1]]]]}]},
{no:47,t:'Sacrament',trig:{ev:'move',nonExiled:1},say:'You move a survivor',opts:[
 {say:'Roll exposure twice on the moved survivor; if it lives, gain 1 morale',ops:[['exposure','moved',2,[['morale',1]]]]},
 {say:'Nothing happens',ops:[]}]},
{no:48,t:'Outsiders',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Each player takes a new survivor and adds 1 helpless survivor to the colony',ops:[['survivorEach'],['helplessPer',1]]},
 {say:'Nothing happens',ops:[]}]},
{no:49,t:'Riot',trig:{ev:'any',mineAt:'colony',moreHelpless:1},say:'Your survivor is at the colony and helpless survivors outnumber the others there',opts:[
 {say:'All food in the supply is lost',ops:[['foodSet',0]]},
 {say:'Each non-helpless survivor at the colony gets 1 wound',ops:[['wound','colonyAll',1]]},
 {say:'Kill 1 helpless survivor',ops:[['killHelpless',1]]}]},
{no:50,t:'The Sunshine State',trig:{ev:'any',mineAt:'colony',helpless:2},say:'Your survivor is at the colony with 2 or more helpless survivors',opts:[
 {say:'Remove 2 helpless survivors and lose 1 morale',ops:[['helpless',-2],['morale',-1]]},
 {say:'Nothing happens',ops:[]}]},
{no:51,t:'Flier',trig:{ev:'any',mineAt:'colony'},say:'One of your survivors is at the colony',opts:[
 {say:'At the end of next round: lose 1 morale if any location has no barricade; gain 1 morale if every location has 2 or more',ops:[['flag','flier','nextRound']]}]},
{no:52,t:'Airplane',trig:{ev:'move',inPlay:'Sophie Robinson'},vote:{who:'colony'},say:'You move a survivor while Sophie Robinson is in play (vote)',opts:[
 {say:'Players may together remove a tool card, a fuel card and Sophie from the game to gain 1 morale',ops:[['collective',{tools:1,fuel:1},'remove',[['removeSurv','named:Sophie Robinson'],['morale',1]]]]},
 {say:'Nothing happens',ops:[]}]},
{no:53,t:'Missing Child',trig:{ev:'any',helpless:1},vote:{who:'colony'},say:'There is at least 1 helpless survivor at the colony (vote)',opts:[
 {say:'If every location away from the colony is searched by the end of next round, gain 1 morale; if not, lose 1 morale and a helpless survivor',ops:[['flag','missingChild',1]]},
 {say:'Lose 1 morale and remove a helpless survivor',ops:[['morale',-1],['helpless',-1]]}]},
{no:54,t:'Abandoned',trig:{ev:'cleanWaste',helpless:1},vote:{who:'colony'},say:'You clean waste while there is a helpless survivor (vote)',opts:[
 {say:'Add 1 helpless survivor and 5 zombies at the colony',ops:[['helpless',1],['zombies','colony',5]]},
 {say:'Add 5 zombies at the colony; each player gives up 1 unused die if they can',ops:[['zombies','colony',5],['loseDieEach']]}]},
{no:55,t:'Mike Cho',trig:{ev:'any',mineAt:'nonColony',zHere:1,inDeck:'Mike Cho'},say:'Your survivor is at a location with zombies while Mike Cho is in the survivor deck',opts:[
 {say:'Mike Cho joins you; 1 wound on him and on your survivor there; clear the zombies there',ops:[['takeSurv','Mike Cho'],['wound','named:Mike Cho',1],['wound','chosenAt:zLoc',1],['clearZ','zLoc']]},
 {say:'Clear all zombies from that location',ops:[['clearZ','zLoc']]}]},
{no:56,t:'John Price',trig:{ev:'search',at:'school',inDeck:'John Price'},say:'You search at the school while John Price is in the survivor deck',opts:[
 {say:'John Price joins you; add 2 zombies at the school',ops:[['takeSurv','John Price'],['zombies','school',2]]},
 {say:'Add 2 food; John Price leaves the game',ops:[['food',2],['removeSurvDeck','John Price']]}]},
{no:57,t:'Ashley Ross',trig:{ev:'any',controls:'Ashley Ross',nonExiled:1},say:'You control Ashley Ross',opts:[
 {say:'Raised walkways: no exposure when attacking zombies at colony entrance 1; Ashley rolls exposure twice',ops:[['flag','walkways',1],['exposure','named:Ashley Ross',2]]},
 {say:'Bigger waste area: lose 1 morale per 15 waste cards instead of 10; Ashley rolls exposure once',ops:[['flag','waste15',1],['exposure','named:Ashley Ross',1]]},
 {say:'Nothing happens',ops:[]}]},
{no:58,t:'Edward White',trig:{ev:'any',controls:'Edward White',nonExiled:1},say:'You control Edward White',opts:[
 {say:'Pay 1 food token: take a removed medicine card into your hand',ops:[['food',-1],['removedToHand','sym:med',1]],need:{food:1}},
 {say:'Nothing happens',ops:[]}]},
{no:59,t:'Heads Up',trig:{ev:'search',at:'police'},say:'You search at the police station',opts:[
 {say:'Fill the police station with noise tokens',ops:[['noise','police',4]]}]},
{no:60,t:'Sleep',trig:{ev:'yawn'},say:'Another player yawns (the drawer taps “They yawned”)',opts:[
 {say:'Until the round ends, each player may give up all their dice at the start of their turn to heal 1 wound on each of their survivors',ops:[['flag','sleep','round']]}]},
{no:61,t:'Buddy Davis',trig:{ev:'turnStart',controls:'Buddy Davis',named:'Buddy Davis',at:'colony'},say:'You control Buddy Davis and he starts your turn at the colony',opts:[
 {say:'Workouts: at the start of each round, any player may waste a food card to roll 1 extra die',ops:[['flag','workout',1]]},
 {say:'Gain 1 morale',ops:[['morale',1]]}]},
{no:62,t:'Dynamite',trig:{ev:'any',inPlay:['Edward White','John Price']},chooser:'controls:Edward White',say:"Edward White and John Price are both in play (Edward's player chooses)",opts:[
 {say:'Roll a die: on 2 or more, roll again and remove that many zombies from the colony',ops:[['rollTable',[[2,6,[['custom','dynamite']]]]]]},
 {say:'Everyone rolls 1 less die next round; gain 1 morale',ops:[['extraDie','all',-1],['morale',1]]}]},
{no:63,t:'Gabriel Diaz',trig:{ev:'any',mineAt:'nonColony',nonExiled:1,inDeck:'Gabriel Diaz'},say:'Your survivor is away from the colony while Gabriel Diaz is in the survivor deck',opts:[
 {say:'Gabriel joins your following; add 3 helpless survivors',ops:[['takeSurv','Gabriel Diaz'],['helpless',3]]},
 {say:'Remove 1 card in your hand from the game',ops:[['loseCard',1]]}]},
{no:64,t:'Andrew Evans',trig:{ev:'any',controls:'Andrew Evans',nonExiled:1},pre:[['place','named:Andrew Evans','grocery']],say:'You control Andrew Evans (he goes to the grocery store)',opts:[
 {say:'Greenhouse: Andrew gains “at the colony, once per round, spend a 1+ die to add 2 food”',ops:[['flag','greenhouse',1]]},
 {say:'Gain 1 morale',ops:[['morale',1]]}]},
{no:65,t:'Annaleigh Chan',trig:{ev:'any',controls:'Annaleigh Chan',nonExiled:1},say:'You control Annaleigh Chan',opts:[
 {say:'Add 1 zombie at each location away from the colony',ops:[['zombies','nonColony',1]]},
 {say:'Kill Annaleigh',ops:[['kill','named:Annaleigh Chan']]}]},
{no:66,t:'David Garcia',trig:{ev:'any',controls:'David Garcia',nonExiled:1},pre:[['place','named:David Garcia','colony'],['peek','randomCardColony']],say:'You control David Garcia (he goes to the colony; you see 1 random card of each player there)',opts:[
 {say:'Accuse a player at the colony: start a vote to exile them',ops:[['exileVote','colonyPlayer']]},
 {say:'Nothing happens',ops:[]}]},
{no:67,t:'Crazed Survivor',trig:{ev:'any',mineAt:'nonColony'},say:'One of your survivors is away from the colony',opts:[
 {say:'Add 3 food; roll exposure twice on one of your survivors away from the colony',ops:[['food',3],['exposure','chosenAt:nonColony',2]]},
 {say:'Nothing happens',ops:[]}]},
{no:68,t:'Welcome Home',trig:{ev:'move'},say:'You move a survivor',opts:[
 {say:'Roll exposure once on the moved survivor; if it lives, once per round it attacks without exposure',ops:[['exposure','moved',1,[['flag','noExpAttack','moved']]]]},
 {say:'Nothing happens',ops:[]}]},
{no:69,t:'Book of the Dead',trig:{ev:'search',at:'library',nonExiled:1},say:'You search at the library',opts:[
 {say:'Gain 1 morale',ops:[['morale',1]]},
 {say:'Remove 1 zombie at the library and add 4 food',ops:[['killZ','library',1],['food',4]]}]},
{no:70,t:'Rascals',trig:{ev:'search',at:'hospital'},say:'You search at the hospital',opts:[
 {say:'Add 5 zombies at the colony',ops:[['zombies','colony',5]]},
 {say:'Nothing happens',ops:[]}]},
{no:71,t:'Janet Taylor',trig:{ev:'any',controls:'Janet Taylor',nonExiled:1},say:'You control Janet Taylor',opts:[
 {say:'While Janet is at the colony, a player may waste a card from hand (no effect) to heal 1 wound on their survivor at the colony',ops:[['flag','janetCare',1]]}]},
{no:72,t:'Old Divisions',trig:{ev:'any',mineAt:'colony'},vote:{who:'colony'},say:'One of your survivors is at the colony (vote)',opts:[
 {say:'Remove 1 helpless survivor; this round’s crisis goes to the bottom of the deck unresolved; lose 1 morale',ops:[['helpless',-1],['skipCrisis'],['morale',-1]]},
 {say:'Nothing happens',ops:[]}]},
{no:73,t:'Voyeur',trig:{ev:'any',voyeur:1},pre:[['peek','handOther']],say:"Your survivor and another player's are alone together somewhere (you see their hand)",opts:[
 {say:'Take a card of your choice from their hand (it cannot be played until next round)',ops:[['custom','voyeurTake']]},
 {say:'Show their hand to everyone',ops:[['peek','showHandOther']]}]},
{no:74,t:'The Arctic King',trig:{ev:'search',at:'gas'},say:'You search at the gas station',opts:[
 {say:'The searching survivor gets a snowmobile: no exposure when it moves, but it makes noise at both ends (a zombie at the colony instead) and wears out after 4 moves',ops:[['flag','snowmobile','searcher']]},
 {say:'Take 2 fuel cards from the gas station deck',ops:[['fetch','gas','sym:fuel',2]]}]},
{no:75,t:'Carla Thompson',trig:{ev:'any',controls:'Carla Thompson',nonExiled:1},pre:[['place','named:Carla Thompson','police']],say:'You control Carla Thompson (she goes to the police station)',opts:[
 {say:'Roll exposure twice on Carla; if she lives, gain 1 morale',ops:[['exposure','named:Carla Thompson',2,[['morale',1]]]]},
 {say:'Nothing happens',ops:[]}]},
{no:76,t:'Jenny Clark',trig:{ev:'search',searcher:'Jenny Clark',nonExiled:1},say:'You search with Jenny Clark',opts:[
 {say:'Jenny goes to the colony; add 8 zombies there',ops:[['place','named:Jenny Clark','colony'],['zombies','colony',8]]}]},
{no:77,t:'Hunted',trig:{ev:'wound',onMove:1},say:'Your survivor gets a (non-frostbite) wound from exposure after moving',opts:[
 {say:'Roll exposure twice on each of your survivors',ops:[['exposure','mine',2]]},
 {say:'From now on every move also rolls a die: on 1–2 that survivor gets a wound',ops:[['flag','hunted',1]]}]},
{no:78,t:'Loretta Clay',trig:{ev:'any',controls:'Loretta Clay',nonExiled:1},say:'You control Loretta Clay',opts:[
 {say:'Roll a die: 5–6 gain 1 morale; 3–4 nothing; 1–2 each survivor at the colony rolls, and on 1–2 gets a wound',ops:[['rollTable',[[5,6,[['morale',1]]],[1,2,[['rollEach','colony',2,[['wound','it',1]]]]]]]]},
 {say:'Remove 1 food from the supply',ops:[['food',-1]]}]},
{no:79,t:'Fuel Tanker',trig:{ev:'move',nonExiled:1},say:'You move a survivor',opts:[
 {say:'Add 6 zombies at the colony; take up to 4 removed fuel cards into your hand',ops:[['zombies','colony',6],['removedToHand','sym:fuel',4]]},
 {say:'Nothing happens',ops:[]}]},
{no:80,t:'Harman Brooks',trig:{ev:'any',inPlay:'Harman Brooks',namedNotExiled:'Harman Brooks'},say:'Harman Brooks is in play',opts:[
 {say:'Add 3 food',ops:[['food',3]]},
 {say:'Remove 1 wound from up to 3 survivors',ops:[['heal','chosenAny3',1]]}]}
];

/* ---------- checking whether the held card triggers ---------- */
const dwXrSid=n=>{for(let i=0;i<DWS.length;i++)if(DWS[i].n===n)return i;return -1};
const dwXrRight=(g,pid)=>{const L=g.ps,i=L.indexOf(pid);return L[(i-1+L.length)%L.length]};
const dwXrHere=(g,loc)=>Object.keys(g.sv||{}).map(Number).filter(id=>g.sv[id]&&g.sv[id].loc===loc);
const dwXrMine=(g,pid)=>Object.keys(g.sv||{}).map(Number).filter(id=>g.sv[id]&&g.sv[id].loc&&g.sv[id].pid===pid);
const dwXrIn=(g,id)=>id>=0&&!!(g.sv&&g.sv[id]&&g.sv[id].loc);
const dwXrExiled=(g,pid)=>!!(g.P[pid]&&g.P[pid].exiled);
function dwXrCond(g,pid,T,ev,info){const P=g.P[pid]||{},mine=dwXrMine(g,pid),ctx={...info};
  if(T.ev!=='any'&&T.ev!==ev)return null;if(T.ev==='any'&&!['any','turnStart','action'].includes(ev))return null;
  if(T.nonExiled&&P.exiled)return null;
  if(T.controls){const id=dwXrSid(T.controls);if(!(dwXrIn(g,id)&&g.sv[id].pid===pid))return null}
  if(T.named){const id=dwXrSid(T.named);if(!dwXrIn(g,id)||(T.at&&g.sv[id].loc!==T.at))return null}
  if(T.namedNotExiled){const id=dwXrSid(T.namedNotExiled);if(!dwXrIn(g,id)||dwXrExiled(g,g.sv[id].pid))return null}
  if(T.inPlay){for(const n of [].concat(T.inPlay))if(!dwXrIn(g,dwXrSid(n)))return null}
  if(T.inDeck&&!((g.decks&&g.decks.surv)||[]).includes(dwXrSid(T.inDeck)))return null;
  if(T.mineAt){const L=mine.filter(id=>T.mineAt==='nonColony'?g.sv[id].loc!=='colony':g.sv[id].loc===T.mineAt);if(!L.length)return null;
    if(T.zHere){const z=L.find(id=>((g.loc[g.sv[id].loc]||{}).z||0)>0);if(z==null)return null;ctx.zLoc=g.sv[z].loc}ctx.at=ctx.at||g.sv[L[0]].loc}
  if(T.helpless&&(g.helpless||0)<T.helpless)return null;
  if(T.moreHelpless){const n=dwXrHere(g,'colony').length;if(!((g.helpless||0)>n))return null}
  if(T.colonyBarZ){const E=(g.loc.colony||{}).ent||[];if(!(E.some(e=>e.bar>0)&&E.some(e=>e.z>0)))return null}
  if(T.followMore){const n=p=>dwXrMine(g,p).length,me=n(pid);if(!g.ps.some(q=>q!==pid&&n(q)<me))return null}
  if(T.pairNonColony){const by={};mine.filter(id=>g.sv[id].loc!=='colony'&&DWS[id].n!=='Sparky').forEach(id=>(by[g.sv[id].loc]=by[g.sv[id].loc]||[]).push(id));
    const k=Object.keys(by).find(l=>by[l].length>=2);if(!k)return null;ctx.pair=by[k].slice(0,2);ctx.pairLoc=k}
  if(T.sharesExiled){const hit=mine.map(id=>g.sv[id].loc).find(l=>dwXrHere(g,l).some(o=>dwXrExiled(g,g.sv[o].pid)&&g.sv[o].pid!==pid));if(!hit)return null;ctx.at=hit;
    ctx.exiledPid=g.sv[dwXrHere(g,hit).find(o=>dwXrExiled(g,g.sv[o].pid)&&g.sv[o].pid!==pid)].pid}
  if(T.exiledShares){if(!P.exiled)return null;const hit=mine.map(id=>g.sv[id].loc).find(l=>dwXrHere(g,l).some(o=>!dwXrExiled(g,g.sv[o].pid)));if(!hit)return null;ctx.at=hit}
  if(T.voyeur){const hit=mine.map(id=>g.sv[id].loc).find(l=>{const H=dwXrHere(g,l);return H.length===2&&H.some(o=>g.sv[o].pid!==pid)});if(!hit)return null;
    ctx.at=hit;ctx.other=g.sv[dwXrHere(g,hit).find(o=>g.sv[o].pid!==pid)].pid}
  if(T.fuel!=null&&!!info.fuel!==T.fuel)return null;
  if(T.alone&&!(info.to&&dwXrHere(g,info.to).filter(o=>o!==info.s).length===0))return null;
  if(T.at&&!T.named&&info.at!==T.at)return null;
  if(T.searcher&&!(info.s!=null&&DWS[info.s]&&DWS[info.s].n===T.searcher))return null;
  if(T.onMove&&!info.onMove)return null;
  if(T.destOccupied&&!(info.to&&dwXrHere(g,info.to).some(o=>o!==info.s)))return null;
  if(T.helplessAdded&&!(info.helpless>0))return null;
  if(T.male&&!(info.s!=null&&DWS[info.s]&&DWS[info.s].m))return null;
  return ctx}
/* the card held for this player's turn (by the player to their right) – returns {no,drawer,ctx} or null */
function dwXrCheck(g,pid,ev,info){if(!g||!g.P||g.phase!=='play')return null;const drawer=dwXrRight(g,pid),D=g.P[drawer];if(!D||D.xr==null)return null;
  const C=DWXR.find(c=>c.no===D.xr);if(!C)return null;const ctx=dwXrCond(g,pid,C.trig,ev,info||{});return ctx?{no:C.no,drawer,ctx}:null}

/* ---------- resolving ---------- */
function dwXrIns(g,st){if(g.q&&g.q.length)g.q.splice(1,0,...st);else (g.q=g.q||[]).push(...st)}
/* push effect ops as engine steps, in order, right after the current step */
function dwXrDo(g,pid,ops,ctx){dwXrIns(g,(ops||[]).map(a=>({t:'xrop',pid,a,ctx:ctx||{}})))}
/* the step that shows a triggered card: {t:'xr',pid (turn player),no,drawer,ctx}; register as the engine's step handler for 'xr' */
function DWXRSTEP(g,s,mv){const C=DWXR.find(c=>c.no===s.no);if(!C)return true;
  if(!s.read){s.read=1;if(g.P[s.drawer]&&g.P[s.drawer].xr===s.no)g.P[s.drawer].xr=null;(g.xrOut=g.xrOut||[]).push(s.no);
    if(typeof gLog==='function')gLog(g,`Crossroads: ${C.t} (${C.say})`,'✖️',1);
    if(C.pre&&C.pre.length){dwXrIns(g,[...C.pre.map(a=>({t:'xrop',pid:s.pid,a,ctx:s.ctx})),{t:'xr',pid:s.pid,no:s.no,drawer:s.drawer,ctx:s.ctx,read:1,prd:1}]);return true}}
  if(C.alt&&C.alt.named){const id=dwXrSid(C.alt.named);if(dwXrIn(g,id)&&g.sv[id].loc===C.alt.at){if(typeof gLog==='function')gLog(g,`${C.t}: ${C.alt.say}`,'✖️',1);return true}}
  if(C.vote){const who=C.vote.who==='atDest'?(s.ctx.to||null):'colony';const need=g.ps.filter(p=>!dwXrExiled(g,p)&&dwXrMine(g,p).some(id=>g.sv[id].loc===who));
    if(!need.length){dwXrDo(g,s.pid,C.opts[1]?C.opts[1].ops:[],s.ctx);return true}
    g.vote={kind:'xr',no:s.no,by:s.pid,msg:`${C.t}: 👍 ${C.opts[0].say} · 👎 ${(C.opts[1]||{say:'nothing'}).say}`,need,got:{},ctx:s.ctx};return true}
  let chooser=s.pid;if(C.chooser&&C.chooser.startsWith('controls:')){const id=dwXrSid(C.chooser.slice(9));if(dwXrIn(g,id))chooser=g.sv[id].pid}
  if(C.opts.length===1&&!mv){dwXrDo(g,s.pid,C.opts[0].ops,s.ctx);return true}
  const ok=o=>!o.need||!o.need.food||(g.food||0)>=o.need.food;
  if(!mv){g.ask={pid:chooser,msg:`Crossroads – ${C.t}: choose one`,opts:C.opts.map((o,i)=>({v:i,l:o.say,dis:!ok(o)})).filter(o=>!o.dis),opt:false,kind:'xr',no:C.no};return false}
  const i=+mv.v;if(!C.opts[i]||!ok(C.opts[i]))return null;dwXrDo(g,s.pid,C.opts[i].ops,s.ctx);return true}
/* the engine calls this when a crossroads vote resolves (up = thumbs up won) */
function dwXrVoted(g,no,up,ctx,pid){const C=DWXR.find(c=>c.no===no);if(!C)return;const o=up?C.opts[0]:C.opts[1];if(o)dwXrDo(g,pid,o.ops,ctx||{})}

/* ---------- 'custom' ops the engine must implement (DWOP.custom by name) ----------
 dropHelpless  – remove every helpless survivor at the colony; lose ceil(removed/2) morale.
 santa         – if Forest Plum is in play and not exiled, his controller may draw up to 4 grocery cards, reveal them, and give each to another player.
 muggingFight  – turn player either puts 2 wounds on their survivor at ctx.at, or (if they have a weapon in hand/equipped) kills the exiled survivor there and takes 1 wound.
 outbreakRoll  – unless Olivia Brown or Janet Taylor is in play, roll a d6 per helpless survivor at the colony; each 1 kills one (morale −1 each).
 jail          – choose any survivor; place it at the police station; its equipped cards go to its owner's hand; it can never move, search, attack or use its ability again.
 prophet       – choose a non-exiled survivor at a location shared with one of yours; it joins your following.
 bevGuard      – Bev's card leaves the game but her standee stays at the school and can't be attacked/killed/moved; every survivor that moves to the school takes 1 wound.
 sewer         – roll a d6; roll exposure that many times on a survivor you control at the library; if it survives, moves between colony and hospital (either way) never roll exposure.
 thomasWounds  – Thomas's controller places 4 wounds among the survivors sharing his location (not Thomas); nothing if none.
 rodHospital   – place Rod and 2 survivors of the turn player at the hospital (survivors already there may go to the colony to make room); roll exposure twice on each.
 gamble        – starting with the first player, each player may stake 1 hand card per survivor they have at the colony, rolling 1 die per card; the highest roll takes all staked cards.
 dynamite      – roll a d6 and remove that many zombies from the colony.
 voyeurTake    – take a card of your choice from ctx.other's hand; mark it unplayable until next round.
 Other ops (all listed in SPEC.md): morale food foodSet helpless helplessPer killHelpless wound frost kill exposure zombies noise item fetch purge revealTake
 takeSurv removeSurv removeSurvDeck survivor survivorEach place noMove freeze barricades clearZ clearBar killZ killEach rollTable rollEach
 removedToHand removedToWaste wasteCard loseRandomCard loseCard giveHand giveFollower allDiceUsed loseDie loseDieEach extraDie cancelFood
 collective pay peek exileVote addWin skipCrisis flag heal custom.
*/
