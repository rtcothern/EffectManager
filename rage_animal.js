let rager = game.user.character;
let ragerData = rager.data.data;
let level = ragerData.details.level.value;

let toggleRage = function(toggle)
{
	let report = '';

	let obj = {};
	obj['flags.raging'] = toggle;

	let mult = toggle ? 1 : -1;

	let hpMod = ragerData.attributes.hp.temp + mult*(ragerData.abilities.con.mod + level);
	hpMod = (hpMod >= 0) ? hpMod : 0;
	obj['data.attributes.hp.temp'] = hpMod;

	report += 'New Temp HP: ' + hpMod + '<br>';

    let resVal = 3+level+ragerData.abilities.con.mod;

	let toggleResFn = function(type, name)
	{
		let resInd = ragerData.traits.dr.findIndex( trait => trait.type == type );
		if ( resInd == -1 )
		{
			obj['data.traits.dr'].push ({ type: type, label: name, value: (mult*resVal).toString(), exceptions: ''});
		}
		else
		{
			let numberValue = +ragerData.traits.dr[resInd].value;
			obj['data.traits.dr'][resInd].value = (+numberValue + mult*resVal).toString();
		} 
		report += 'New ' + name + ' Resistance: ' + obj['data.traits.dr'][resInd].value + '<br>';
	}
	// Slice operator to make a copy instead of reference
	obj['data.traits.dr'] = [...ragerData.traits.dr];

	toggleResFn('piercing', 'Piercing');
	toggleResFn('slashing', 'Slashing');

	// Batch our update operations at the end so we only do them if we haven't hit errors
	let updateOperations = [];
	updateOperations.push([ rager, obj]);

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
			updateOperations.push([ it, itObj]);
		}
		else if(it.type == 'armor' && it.data.data.equipped.value == true)
		{
			itObj['data.armor.value'] = it.data.data.armor.value - mult;
			updateOperations.push([ it, itObj]);
		}
	}

	for ( operation of updateOperations )
	{
		operations[0].update(operation[1]);
	}

	let rageClause = toggle ? ' (Rage bonus halved for Agile Weapons)' : '';
	report += 'Bonus Damage: ' + bonusDamage + rageClause + '<br>';
	report += 'New AC: ' + (ragerData.attributes.ac.value - mult).toString();

	let token = canvas.tokens.ownedTokens.find(t => t.actor.id === rager.id);
	let statusEffectIndex = 12; //Placeholder until we can get a better image
	token.toggleEffect(CONFIG.statusEffects[statusEffectIndex]);
	return report;
}

let chatMsg = '';       
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