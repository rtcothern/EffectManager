import {OwnedItemEffect_AC} from "./character_items_shared.js";

export let ShieldSpell = function()
{
	let char = game.user.character;
	let flagName = 'shieldSpellActive';
	let shieldACFn = (item) => 1;
	let flavorFn = function (toggle, char)
	{
	    let dir = toggle ? 'Gains' : 'Loses';
	    let ending = toggle ? '!' : '...';
	    let flavor = '<i>' + char.name + ` ${dir} a Shield of Magical Force${ending}</i>`;
	    return flavor;
	};
	let imagePath = 'icons/svg/mage-shield.svg';
	let acItemEffect = new OwnedItemEffect_AC(char, flagName, shieldACFn, flavorFn, imagePath);
	acItemEffect.execute();
}
export let RaiseShield = function()
{
	let char = game.user.character;
	let flagName = 'shieldBlockActive';
	let shieldACFn = (item) => char.data.data.attributes.shield.ac;
	let flavorFn = function (toggle, char)
	{
	    let dir = toggle ? 'Raises' : 'Lowers';
	    let ending = toggle ? '!' : '...';
	    let flavor = '<i>' + char.name + ` ${dir} Shield${ending}</i>`;
	    return flavor;
	};
	let imagePath = 'systems/pf2e/icons/equipment/shields/steel-shield.jpg';
	let acItemEffect = new OwnedItemEffect_AC(char, flagName, shieldACFn, flavorFn, imagePath);
	acItemEffect.execute();
}