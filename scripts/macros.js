/*import {OwnedItemEffect_AC, OwnedItemEffect_Damage} from "./character_items_shared.js";*/
import {ToggleOperation, EffectCreator} from "./utility_shared.js";
/*import {AttributeEffect} from './attributes_shared.js';*/

/*export let ShieldSpell = function()
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
	
	let shieldACFn = (item) => 1;
	let acItemEffect = new OwnedItemEffect_AC(char, flagName, shieldACFn);
	operation.addContent(acItemEffect);
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

	let shieldACFn = (item) => char.data.data.attributes.shield.ac;
	let acItemEffect = new OwnedItemEffect_AC(char, flagName, shieldACFn);
	operation.addContent(acItemEffect);
	operation.execute();
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

	let hpMod = (ragerData.abilities.con.mod + level);
	
	let rageACFn = (item) => -1;
	let rageDamageFn = function(item) 
	{
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
		let bonusD = item.data.data.traits.value.includes('agile') ? Math.floor(bonusDamage/2) : bonusDamage;
		return bonusD;
	};
	let rageWeaponValidFn = function(item)
	{
		return item.data.data.range.value == 'melee' || item.data.data.range.value == 'reach' || item.data.data.range.value == '';
	};

	let tempHPEffect = new AttributeEffect(char, flagName, "Temp HP", 'hp.temp', hpMod);
	let acEffect = new OwnedItemEffect_AC(char, flagName, rageACFn);
	let damageEffect = new OwnedItemEffect_Damage(char, flagName, rageDamageFn, rageWeaponValidFn);
	
	operation.addContent(tempHPEffect);
	operation.addContent(acEffect);
	operation.addContent(damageEffect);
	operation.execute();
}*/

let ToggleBonusDamageDie = function(flagName, buffName, diceNum, diceSize, weaponValidFn)
{
	let char = game.user.character;
	let flavorFn = function(toggle)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = `<i>${char.name} ${dir} ${buffName}${ending}</i>`;
	    return flavor;
	}

	let operation = new ToggleOperation(char, flagName, flavorFn);

	let dataValueFn = function(toggle, ent, currentVal) 
	{
		currentVal = currentVal || {};
		if (toggle || currentVal[flagName] === undefined)
		{
			currentVal[flagName] = [diceNum, diceSize];
		}
		else
		{
			delete currentVal[flagName];
		}
		return [currentVal, toggle];
	};
	
	let effect = EffectCreator.constructBonusDDEffect(char, flagName, dataValueFn, diceNum, diceSize);
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
	ToggleBonusDamageDie("windforceActive", "Windforce", 1, "d8", weaponValidFn);
}