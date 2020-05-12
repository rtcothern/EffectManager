import {ToggleOperation, EffectCreator, toggleFlag, getFlag, createNewFieldValueHTML} from "./utility_shared.js";

export let ToggleMacroPrivateReporting = function()
{
	let char = game.user.character;
	let flagName = ToggleOperation.privateReportingFlag;
	let chatData = {
		user: game.user._id,
		speaker: ChatMessage.getSpeaker(),
		whisper: game.users.entities.filter(u => u._id == game.user._id).map(u => u._id),
	};

	toggleFlag(char, flagName).then( () =>
		{
			let msg = getFlag(char, flagName) ? "ON" : "OFF";
			chatData.content = `<i> Toggled private macro reporting: ${msg}</i>`;
			ChatMessage.create(chatData, {});
		},
		() => 
		{
			chatData.content = `<i> Failed to toggle private reporting flag</i>`;
			ChatMessage.create(chatData, {});
		}
	);
}

// Specific Effect Functions - Those complex enough to warrant their own built in macros
export let ToggleRage = function()
{
	let char = game.user.character;
	let flagName = 'rageActive';
	let imagePath = 'icons/svg/terror.svg';
	
	let flavorFn = function(toggle)
	{
	    let ending = toggle ? 'begins Raging - RAAAAARGH!!!' : 'stops Raging - Phew...';
	    let flavor = `<i>${char.name} ${ending}</i>`;
	    return flavor;
	}

	let operation = new ToggleOperation(char, flagName, flavorFn, imagePath);

	let ragerData = char.data.data;
	let level = ragerData.details.level.value;
	let hpMod = (ragerData.abilities.con.mod + level);
	let tempHPEffect = EffectCreator.Attribute(operation,'hp.temp', hpMod, "Temp HP");
	
	let rageAcVal = -1;
	let acEffect = EffectCreator.AC(operation, rageAcVal);
	acEffect.toggleBeneficial = false;

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
	let rageDamageFn = function(toggle, ent, currentVal) 
	{
		let bonusD = ent.data.data.traits.value.includes('agile') ? Math.floor(bonusDamage/2) : bonusDamage;
		return bonusD;
	};
	let rageWeaponValidFn = function(ent)
	{
		return ent.data.data.range.value == 'melee' || ent.data.data.range.value == 'reach' || ent.data.data.range.value == '';
	};
	let damageEffect = EffectCreator.BonusDamage(operation, rageDamageFn);
	damageEffect.addEntValidClause(rageWeaponValidFn, true);
	// Override the base display function because rage does funky half damage things
	damageEffect.displayInfoFn = function(toggle)
	{
		let dir = toggle ? 'Gained' : 'Lost';
		let normDam = createNewFieldValueHTML(toggle, `${dir} Bonus Damage`, `${bonusDamage}`);
		let agiDam = createNewFieldValueHTML(toggle, `${dir} Bonus Damage (Agile)`, `${Math.floor(bonusDamage/2)}`);
		return normDam + agiDam;
	}; 
	
	operation.addContent(tempHPEffect);
	operation.addContent(acEffect);
	operation.addContent(damageEffect);
	operation.execute();
}