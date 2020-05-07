import ItemPF2e from '../../../systems/pf2e/module/item/item.js';

export default class ItemMistwalker extends ItemPF2e
{
	rollWeaponDamage(event, critical = false) 
	{
		console.log("Overriding damage");
	}
}