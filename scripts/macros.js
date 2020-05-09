import {ToggleOperation, EffectCreator} from "./utility_shared.js";

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
		result = result > 0 ? result : 0;
		return result;
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
		return currentVal + mult*bonusD;
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

let ToggleBonusDamageDie = function(flagName, buffName, diceNum, diceSize, damageType, weaponValidFn, statusImagePath)
{
	let char = game.user.character;
	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} ${buffName}${ending}</i>`;
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
	if (weaponValidFn)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
	operation.execute();
}

let ToggleDamageDiceStep = function(flagName, buffName, stepUp, weaponValidFn, statusImagePath)
{
	let char = game.user.character;
	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} ${buffName}${ending}</i>`;
	    return flavor;
	}

	let operation = new ToggleOperation(char, flagName, flavorFn, statusImagePath);

	let dataValueFn = function(toggle, ent, currentVal) 
	{
		let dieSize = +currentVal.substring(1);
		let dir = toggle ? stepUp : !stepUp;
		dieSize = dir ? dieSize+2 : dieSize-2;
		dieSize = dieSize > 12 ? 12 : dieSize;
		dieSize = dieSize < 4 ? 4 : dieSize;
		return `d${dieSize}`;
	};

	let effect = EffectCreator.constructBaseDDStepEffect(char, flagName, dataValueFn);
	effect.toggleBeneficial = stepUp; 
	if (weaponValidFn)
	{
		effect.addEntValidClause(weaponValidFn, true);
	}
	operation.addContent(effect);
	operation.execute();
}

export let Windforce = function()
{
	let weaponValidFn = function (ent)
	{
		return ent.data.data.group.value == "bow";
	}
	ToggleDamageDiceStep("windforceActive", "Windforce", true, weaponValidFn, "icons/svg/windmill.svg");
}
export let Nexavar = function()
{
	let weaponValidFn = function (ent)
	{
		return ent.data.data.group.value == "bow";
	}
	ToggleBonusDamageDie("nexavarActive", "Nexavar", 1, "d8", "Precision", weaponValidFn, "icons/svg/biohazard.svg");
}

export let ShieldSpell = function()
{
	let char = game.user.character;
	let flagName = 'shieldSpellActive';
	let imagePath = 'icons/svg/mage-shield.svg';

	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} a Shield of Magical Force${ending}</i>`;
	    return flavor;
	}
	let operation = new ToggleOperation(char, flagName, flavorFn, imagePath);
	
	let dataValueFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? 1 : -1;
		return (+currentVal + mult * 1).toString();
	}
	let effect = EffectCreator.constructACEffect(char, flagName, dataValueFn);
	
	operation.addContent(effect);
	operation.execute();
}
export let RaiseShield = function()
{
	let char = game.user.character;
	let flagName = 'shieldBlockActive';
	let imagePath = 'systems/pf2e/icons/equipment/shields/steel-shield.jpg';

	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Raises' : 'Lowers';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} Shield${ending}</i>`;
	    return flavor;
	}
	let operation = new ToggleOperation(char, flagName, flavorFn, imagePath);

	let dataValueFn = function(toggle, ent, currentVal)
	{
		let mult = toggle ? 1 : -1;
		return (+currentVal + mult * char.data.data.attributes.shield.ac).toString();
	}
	let effect = EffectCreator.constructACEffect(char, flagName, dataValueFn);
	operation.addContent(effect);
	operation.execute();
}