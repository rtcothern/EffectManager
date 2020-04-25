let rager = game.user.character;
let chatMsg = '';       
let level = rager.data.data.details.level.value;

let toggleRage = function(toggle)
{
	let report = '';

	let obj = {};
	obj['flags.raging'] = toggle;

	let mult = toggle ? 1 : -1;

	let hpMod = rager.data.data.attributes.hp.temp + mult*(rager.data.data.abilities.con.mod + level);
	hpMod = (hpMod >= 0) ? hpMod : 0;
	obj['data.attributes.hp.temp'] = hpMod;

	report += 'New Temp HP: ' + hpMod + '<br>';

    let resVal = 3+level+rager.data.data.abilities.con.mod;
	let numNewDR = 0;

	let toggleResFn = function(type, name)
	{
		let resInd = rager.data.data.traits.dr.findIndex( trait => trait.type == type );
		if ( resInd == -1 )
		{
			resInd = rager.data.data.traits.dr.length + (numNewDR++);
			obj['data.traits.dr'][resInd] = { type: type, label: name, value: (mult*resVal).toString(), exceptions: ''};
		}
		else
		{
			let numberValue = +rager.data.data.traits.dr[resInd].value;
			obj['data.traits.dr'][resInd].value = (+numberValue + mult*resVal).toString();
		} 
		report += 'New ' + name + ' Resistance: ' + obj['data.traits.dr'][resInd].value + '<br>';
	}
	obj['data.traits.dr'] = [...rager.data.data.traits.dr];

	toggleResFn('piercing', 'Piercing');
	toggleResFn('slashing', 'Slashing');

	let updateOperations = [];

	updateOperations.push([ rager, obj]);

	rager.update(obj);

	let bonusDamage;
	if (level >= 15 )
	{
		bonusDamage = 13;
	}
	else if (level >= 7)
	{
		bonusDamage = 5;
	}
	else
	{
		bonusDamage = 2;
	}
	for (let it of rager.items) 
	{ 
		let itObj = {}; 
		if (it.type == 'weapon' && (it.data.data.range.value == 'melee' || it.data.data.range.value == 'reach') )
		{
			

			bonusDamage = it.data.data.traits.value.includes('agile') ? Math.floor(bonusDamage/2) : bonusDamage;
			itObj['data.bonusDamageDamage.value'] = it.data.data.bonusDamage.value + mult*bonusDamage; 
			
			it.update(itObj);
		}
		else if(it.type == 'armor' && it.data.data.equipped.value == true)
		{
			itObj['data.armor.value'] = it.data.data.armor.value - mult;
			it.update(itObj);
		}
	}

	let rageClause = toggle ? ' (Rage bonus halved for Agile Weapons)' : '';
	report += 'Bonus Damage: ' + bonusDamage + rageClause + '<br>';
	report += 'New AC: ' + (rager.data.data.attributes.ac.value - mult).toString();

	let token = canvas.tokens.ownedTokens.find(t => t.actor.id === rager.id);
	let statusEffectIndex = 12; //Placeholder until we can get a better image
	token.toggleEffect(CONFIG.statusEffects[statusEffectIndex]);
	return report;
}

let obj = {};
let toggle = (rager.data.flags.raging == undefined || rager.data.flags.raging == false);
if (toggle)
{
    chatMsg = rager.name + ' begins Raging! RAAAAARGH!!!<br>';
	chatMsg += toggleRage(true);
}
else
{
    chatMsg = rager.name + ' stops Raging. Phew<br>';
	chatMsg += toggleRage(false);
}


let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        whisper: game.users.entities.filter(u => u._id == game.user._id).map(u => u._id),
        content: chatMsg
    };
ChatMessage.create(chatData, {});

rebuke point
rune frag 1/2