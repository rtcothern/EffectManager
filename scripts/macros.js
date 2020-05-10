import {ToggleOperation, EffectCreator, toggleFlag, getFlag} from "./utility_shared.js";

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

// Specific Effect Functions - Those complex enough to warrant their own macros
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

	let hpModFn = function(toggle, ent, currentVal) 
	{
		let mult = toggle ? 1 : -1;
		let val = (ragerData.abilities.con.mod + level);
		let result = currentVal + mult*val;
		return Math.max(result, 0);
	}
	
	let tempHPEffect = EffectCreator.constructAttributeEffect(char, flagName, hpModFn, 'hp.temp', "Temp HP");
	
	let rageACFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? -1 : 1;
		return (+currentVal + mult).toString();
	}
	let acEffect = EffectCreator.constructACEffect(char, flagName, rageACFn);
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
		let mult = toggle ? 1 : -1;
		let bonusD = ent.data.data.traits.value.includes('agile') ? Math.floor(bonusDamage/2) : bonusDamage;
		currentVal = currentVal ? currentVal : 0;
		return Math.max(currentVal + mult*bonusD, 0);
	};
	let rageWeaponValidFn = function(ent)
	{
		return ent.data.data.range.value == 'melee' || ent.data.data.range.value == 'reach' || ent.data.data.range.value == '';
	};
	let damageEffect = EffectCreator.constructBonusDamageEffect(char, flagName, rageDamageFn, bonusDamage);
	damageEffect.addEntValidClause(rageWeaponValidFn, true);
	
	operation.addContent(tempHPEffect);
	operation.addContent(acEffect);
	operation.addContent(damageEffect);
	operation.execute();
}


// Generic Content Generation Functions
export let AddBonusDamageContent = function(operation, flagName, damageAmount, weaponValidFn)
{
	let dataValueFn = function(toggle, ent, currentVal) 
	{
		if (damageAmount instanceof Function)
		{
			return damageAmount(toggle, ent, currentVal);
		}
		else
		{
			let mult = toggle ? 1 : -1;
			return (+currentVal + mult * damageAmount).toString();
		}
	};
	
	let effect = EffectCreator.constructBonusDamageEffect(operation.char, flagName, dataValueFn, damageAmount);
	if (weaponValidFn != null && weaponValidFn != undefined)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
}

export let AddBonusDamageDieContent = function(operation, flagName, diceNum, diceSize, damageType, weaponValidFn)
{
	let dataValueFn = function(toggle, ent, currentVal) 
	{
		currentVal = currentVal || {};
		if (toggle || currentVal[flagName] === undefined)
		{
			currentVal[flagName] = [diceNum, diceSize, damageType];
		}
		else
		{
			delete currentVal[flagName];
		}
		if (Object.keys(currentVal).length === 0)
		{
			currentVal = null;
		}
		return currentVal;
	};
	
	let effect = EffectCreator.constructBonusDDEffect(operation.char, flagName, dataValueFn, diceNum, diceSize);
	if (weaponValidFn != null && weaponValidFn != undefined)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
}

export let AddDamageDiceStepContent = function(operation, flagName, stepUp, weaponValidFn )
{
	let dataValueFn = function(toggle, ent, currentVal) 
	{
		let dieSize = +currentVal.substring(1);
		let dir = toggle ? stepUp : !stepUp;
		dieSize = dir ? dieSize+2 : dieSize-2;
		dieSize = Math.min(dieSize, 12);
		dieSize = Math.max(dieSize, 4);
		return `d${dieSize}`;
	};

	let effect = EffectCreator.constructBaseDDStepEffect(operation.char, flagName, dataValueFn);
	effect.toggleBeneficial = stepUp; 
	if (weaponValidFn != null && weaponValidFn != undefined)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
}
export let AddACContent = function(operation, flagName, acValue)
{
	let dataValueFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? 1 : -1;
		return (+currentVal + mult * acValue).toString();
	}
	let effect = EffectCreator.constructACEffect(operation.char, flagName, dataValueFn);
	operation.addContent(effect);
}