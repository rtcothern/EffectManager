import ItemPF2e from '../../../systems/pf2e/module/item/item.js';

export default class ItemMistwalker extends ItemPF2e
{
	rollWeaponDamage(event, critical = false) 
	{
		const localize = game.i18n.localize.bind(game.i18n); // Check to see if this is a damage roll for either: a weapon, a NPC attack or an action associated with a weapon.

	    if (this.type === 'action') {
	      const itemId = parseInt(this.data.data.weapon.value);
	      const item = this.actor.getOwnedItem(itemId);
	      item.rollWeaponDamage(event);
	      return;
	    }

	    if (this.type !== 'weapon') throw 'Wrong item type!'; // Get item and actor data and format it for the damage roll

	    const itemData = this.data.data;
	    const rollData = duplicate(this.actor.data.data);
	    let rollDie = itemData.damage.die;
	    const abl = 'str';
	    let abilityMod = rollData.abilities[abl].mod;
	    let parts = [];
	    const dtype = CONFIG.PF2E.damageTypes[itemData.damage.damageType]; // Get detailed trait information from item

	    const traits = itemData.traits.value || [];
	    let critTrait = '';
	    let critDie = '';
	    let bonusDamage = 0;
	    let twohandedTrait = false;
	    let twohandedDie = '';
	    let thrownTrait = false;
	    const len = traits.length;
	    const critRegex = '(\\bdeadly\\b|\\bfatal\\b)-(d\\d+)';
	    const twohandedRegex = '(\\btwo-hand\\b)-(d\\d+)';
	    const thrownRegex = '(\\bthrown\\b)-(\\d+)';
	    const hasThiefRacket = this.actor.data.items.filter(e => e.type === 'feat' && e.name == 'Thief Racket').length > 0;
	    if (hasThiefRacket && rollData.abilities.dex.mod > abilityMod) abilityMod = rollData.abilities.dex.mod; // Find detailed trait information

	    for (let i = 0; i < len; i++) {
	      if (traits[i].match(critRegex)) {
	        critTrait = traits[i].match(critRegex)[1];
	        critDie = traits[i].match(critRegex)[2];
	      } else if (traits[i].match(twohandedRegex)) {
	        twohandedTrait = true;
	        twohandedDie = traits[i].match(twohandedRegex)[2];
	      } else if (traits[i].match(thrownRegex)) {
	        thrownTrait = true;
	      }
	    } // If weapon has two-hand trait and wielded in two hands, apply the appropriate damage die


	    if (twohandedTrait && itemData.hands.value) {
	      rollDie = twohandedDie;
	    } // Add bonus damage


	    if (itemData.bonusDamage && itemData.bonusDamage.value) bonusDamage = parseInt(itemData.bonusDamage.value); // Join the damage die into the parts to make a roll (this will be overwriten below if the damage is critical)

	    let weaponDamage = itemData.damage.dice + rollDie;
	    parts = [weaponDamage, bonusDamage]; // If this damage roll is a critical, apply critical damage and effects

	    if (critical === true) {
	      bonusDamage = bonusDamage * 2;

	      if (critTrait === 'deadly') {
	        weaponDamage = Number(itemData.damage.dice) * 2 + rollDie;
	        const dice = itemData.damage.dice ? itemData.damage.dice : 1;
	        const deadlyDice = dice > 2 ? 2 : 1; // since deadly requires a greater striking (3dX)

	        const deadlyDamage = deadlyDice + critDie;
	        parts = [weaponDamage, deadlyDamage, bonusDamage];
	      } else if (critTrait === 'fatal') {
	        weaponDamage = Number(itemData.damage.dice) * 2 + 1 + critDie;
	        parts = [weaponDamage, bonusDamage];
	      } else {
	        weaponDamage = Number(itemData.damage.dice) * 2 + rollDie;
	        parts = [weaponDamage, bonusDamage];
	      }
	    } // Add abilityMod to the damage roll.


	    if (itemData.range.value === 'melee' || itemData.range.value === 'reach' || itemData.range.value == '') {
	      // if a melee attack
	      if (critical) parts.push(abilityMod * 2);else parts.push(abilityMod);
	    } else {
	      // else if a ranged attack
	      if ((itemData.traits.value || []).includes('propulsive')) {
	        if (Math.sign(this.actor.data.data.abilities.str.mod) === 1) {
	          const halfStr = Math.floor(this.actor.data.data.abilities.str.mod / 2);
	          if (critical) parts.push(halfStr * 2);else parts.push(halfStr);
	        }
	      } else if (thrownTrait) {
	        if (critical) parts.push(abilityMod * 2);else parts.push(abilityMod);
	      }
	    } // Add property rune damage
	    // add strike damage


	    if (itemData.property1.dice && itemData.property1.die && itemData.property1.damageType) {
	      if (critical) {
	        const propertyDamage = Number(itemData.property1.dice) * 2 + itemData.property1.die;
	        parts.push(propertyDamage);
	      } else {
	        const propertyDamage = Number(itemData.property1.dice) + itemData.property1.die;
	        parts.push(propertyDamage);
	      }
	    } // add critical damage


	    if (itemData.property1.critDice && itemData.property1.critDie && itemData.property1.critDamageType) {
	      if (critical) {
	        const propertyDamage = Number(itemData.property1.critDice) + itemData.property1.critDie;
	        parts.push(propertyDamage);
	      }
	    }

	    // Begin base override
	    let bonusDamageTypes = "";
	    if(itemData.damage.bonusDice)
	    {
	    	for (let flag in itemData.damage.bonusDice)
	    	{
	    		let bd = itemData.damage.bonusDice[flag];
	    		const propertyDamage = critical ? 2*bd[0] : bd[0];
	    		let part = propertyDamage + bd[1];
	      	 	parts.push(part);
	      	 	bonusDamageTypes += `, ${bd[2]}`;
	    	}
	    }

	    const critTitle = critTrait ? critTrait.toUpperCase() : '';
	    let title = critical ? `${localize('PF2E.CriticalDamageLabel')} ${critTitle} ${localize('PF2E.DamageLabel')}: ${this.name}` : `${localize('PF2E.DamageLabel')}: ${this.name}`;
	    if (dtype) title += ` (${dtype}${bonusDamageTypes})`; // Call the roll helper utility



	    rollData.item = itemData;
	    DicePF2e.damageRoll({
	      event,
	      parts,
	      actor: this.actor,
	      data: rollData,
	      title,
	      speaker: ChatMessage.getSpeaker({
	        actor: this.actor
	      }),
	      dialogOptions: {
	        width: 400,
	        top: event.clientY - 80,
	        left: window.innerWidth - 710
	      }
	    });
	}
}