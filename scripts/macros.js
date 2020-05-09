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

export let ToggleBonusDamageDie = function(flagName, buffDisplayName, statusImagePath, diceNum, diceSize, damageType, weaponValidFn)
{
	let char = game.user.character;
	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} ${buffDisplayName}${ending}</i>`;
	    return flavor;
	}

	let operation = new ToggleOperation(char, flagName, flavorFn, statusImagePath);

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
	
	let effect = EffectCreator.constructBonusDDEffect(char, flagName, dataValueFn, diceNum, diceSize);
	if (weaponValidFn != null && weaponValidFn != undefined)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
	operation.execute();
}

export let ToggleDamageDiceStep = function(flagName, buffDisplayName, statusImagePath, stepUp, weaponValidFn )
{
	let char = game.user.character;
	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} ${buffDisplayName}${ending}</i>`;
	    return flavor;
	}

	let operation = new ToggleOperation(char, flagName, flavorFn, statusImagePath);

	let dataValueFn = function(toggle, ent, currentVal) 
	{
		let dieSize = +currentVal.substring(1);
		let dir = toggle ? stepUp : !stepUp;
		dieSize = dir ? dieSize+2 : dieSize-2;
		dieSize = Math.min(dieSize, 12);
		dieSize = Math.max(dieSize, 4);
		return `d${dieSize}`;
	};

	let effect = EffectCreator.constructBaseDDStepEffect(char, flagName, dataValueFn);
	effect.toggleBeneficial = stepUp; 
	if (weaponValidFn != null && weaponValidFn != undefined)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
	operation.execute();
}
export let ToggleAC = function(flagName, statusImagePath, flavorFn, dataValueFn)
{
	let char = game.user.character;
	let operation = new ToggleOperation(char, flagName, flavorFn, statusImagePath);
	let effect = EffectCreator.constructACEffect(char, flagName, dataValueFn);
	operation.addContent(effect);
	operation.execute();
}


// Example Macros
let ShieldSpell = function()
{
	let char = game.user.character;
	let buffName = 'shieldSpellActive';
	let statusEffectIcon = 'icons/svg/mage-shield.svg';
	let flavorFn = function(toggle)
	{
		let dir = toggle ? 'Gains' : 'Loses';
		let ending = toggle ? '!' : '...';
		let flavor = `<i>${char.name} ${dir} a Shield of Magical Force${ending}</i>`;
		return flavor;
	}
	let dataValueFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? 1 : -1;
	    let value = 1;
		return (+currentVal + mult * value).toString();
	}
	window.EffectManager.Macros.ToggleAC(buffName, statusEffectIcon, flavorFn, dataValueFn);
}
let RaiseShield = function()
{
	let char = game.user.character;
	let buffName = 'shieldBlockActive';
	let statusEffectIcon = 'icons/svg/shield.svg';
	let flavorFn = function(toggle)
	{
		let dir = toggle ? 'Raises' : 'Lowers';
		let ending = toggle ? '!' : '...';
		let flavor = `<i>${char.name} ${dir} Shield${ending}</i>`;
		return flavor;
	}
	let dataValueFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? 1 : -1;
		return (+currentVal + mult * char.data.data.attributes.shield.ac).toString();
	}
	window.EffectManager.Macros.ToggleAC(buffName, statusEffectIcon, flavorFn, dataValueFn);
}
let Windforce = function()
{
	let buffName = "windforceActive";
	let buffDisplayName = "Windforce";
	let stepUp = true;
	let statusEffectIcon = "icons/svg/windmill.svg"; //Optional, set to null if unwanted
	let entityValidFn = function (ent) //Optional, set to null if unwanted
	{
		return ent.data.data.group.value == "bow";
	}
	window.EffectManager.Macros.ToggleDamageDiceStep(buffName, buffDisplayName, statusEffectIcon, stepUp, entityValidFn);
}
let Nexavar = function()
{
	let buffName = "nexavarActive";
	let buffDisplayName = "Nexavar";
	let diceNum = 1;
	let diceType = "d8";
	let damageType = "Precision";
	let statusEffectIcon = "icons/svg/biohazard.svg"; //Optional, set to null if unwanted
	let entityValidFn = null; //Optional, set to null if unwanted
	window.EffectManager.Macros.ToggleBonusDamageDie(buffName, buffDisplayName, statusEffectIcon, diceNum, diceType, damageType, entityValidFn);
}