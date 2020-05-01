let subject = game.user.character;
let subjectData = subject.data.data;
let level = subjectData.details.level.value;

let reportLine = function(stat, value)
{
	return `<small><i>New ${stat}:</i> ${value}</small><br>`;
}
let reportLineDelta = function(toggle, stat, value)
{
	let prefix = toggle ? "Gained" : "Lost";
	return `<small><i>${prefix} ${stat}:</i> ${value}</small><br>`;
}

let togglePanache = function(toggle)
{
	let report = '';

	let obj = {};
	obj['flags.havePanache'] = toggle;

	let mult = toggle ? 1 : -1;

	let speedBonus = 5;
	let speed = subjectData.attributes.speed.value + mult*speedBonus;
	speed = (speed >= 0) ? speed : 0;
	obj['data.attributes.speed.value'] = speed;

	report += reportLine('Speed', speed);

	// Batch our update operations at the end so we only do them if we haven't hit errors
	let updateOperations = [];
	updateOperations.push([ subject, obj]);

	// Assuming the Precise Striker Swashbuckler Archetype feat is picked up at 4, allowing for Panache to deal damage
	// We can automate this with an item Feat look up later
	if (level >= 4)
	{
		let bonusDamage = 2;
		for (let it of subject.items) 
		{ 
			let itObj = {}; 
			if (it.type == 'weapon' && (it.data.data.range.value == 'melee' || it.data.data.range.value == 'reach') )
			{
				if (it.data.data.traits.value.includes('agile') || it.data.data.traits.value.includes('finesse'))
				{
					itObj['data.bonusDamageDamage.value'] = it.data.data.bonusDamage.value + mult*bonusDamage; 
					updateOperations.push([ it, itObj]);
				}
			}
		}
		report += reportLineDelta(toggle, 'Precision Damage', bonusDamage);
	}

	for ( operation of updateOperations )
	{
		operations[0].update(operation[1]);
	}


	let token = canvas.tokens.ownedTokens.find(t => t.actor.id === subject.id);
	let statusEffectIndex = 22; //Placeholder until we can get a better image
	token.toggleEffect(CONFIG.statusEffects[statusEffectIndex]);
	return report;
}

let chatMsg = '';       
let obj = {};
let toggle = (subject.data.flags.havePanche == undefined || subject.data.flags.havePanache == false);
if (toggle)
{
    chatMsg = '<h3>' + subject.name + ' gains Panache!</h3> <em>A daring maneuver!</em><p>';
	chatMsg += togglePanache(true) + '</p>';
}
else
{
    chatMsg = '<h3>' + subject.name + ' loses Panache.</h3> <em>A conflict concluded...</em><p>';
	chatMsg += togglePanache(false) + '</p>';
}


let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        whisper: game.users.entities.filter(u => u._id == game.user._id).map(u => u._id),
        content: chatMsg
    };
ChatMessage.create(chatData, {});