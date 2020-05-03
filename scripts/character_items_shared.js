import * as util from "./utility_shared.js";

class OwnedItemEffect extends util.ReportedOperationContent
{
	constructor(char, toggleName, calcModifierFn )
	{
		super();
		this.char = char;
		this.toggleName = toggleName;
		this.calcModifierFn = calcModifierFn;
	}

	applyEffectToItem(toggle, item)
	{
		console.log("Virtual Base toggleItemModifier - Do not invoke directly");
	}
	toggleEffect()
	{
		let toggle = !util.getFlag(this.char, this.toggleName);
		let updateOperations = [];
		for (let it of this.char.items) 
		{ 
			let operation = this.applyEffectToItem(toggle, it);
			if (operation.length > 0)
			{
				updateOperations.push(operation);
			}
		}
		let message = '';
		if (updateOperations.length > 0)
		{
			for (let op of updateOperations)
			{
				let item = 		op[0];
				let objData = 	op[1];
				let msg = 		op[2];
				item.update(objData);
				message += msg;
			}
		}
		else
		{
			console.log(`No items were eligible for effect application for toggleName: ${this.toggleName}`);
		}
		return message;
	}
	execute()
	{
		return this.toggleEffect();
	}
}

export class OwnedItemEffect_AC extends OwnedItemEffect
{
	applyEffectToItem(toggle, item)
	{
		let mult = toggle ? 1 : -1;
		let obj = {};
		if(item.type == 'armor' && item.data.data.equipped.value == true)
		{
			let mod = this.calcModifierFn(item);
			obj['data.armor.value'] = +(item.data.data.armor.value) + mult*mod;

			let colorToggle = mult*mod > 0;
	        let msg = util.createNewFieldValueHTML(colorToggle, "AC", +(this.char.data.data.attributes.ac.value) + mult*mod);
	        return [ item, obj, msg ];
		}
		return [];
	}
}

export class OwnedItemEffect_Damage extends OwnedItemEffect
{
	constructor(char, toggleName, calcModifierFn, itemValidFn)
	{
		super(char, toggleName, calcModifierFn);
		this.itemValidFn = itemValidFn || (()=>true);
	}
	applyEffectToItem(toggle, item)
	{
		let mult = toggle ? 1 : -1;
		let obj = {};
		if(item.type == 'weapon' && this.itemValidFn(item))
		{
			let mod = this.calcModifierFn(item);
			obj['data.bonusDamage.value'] = +(item.data.data.bonusDamage.value + mult*mod); 
			
			let colorToggle = mult*mod > 0;
	        let msg = util.createNewFieldValueHTML(colorToggle, `${item.name} Bonus Damage`, obj['data.bonusDamage.value']);
	        return [ item, obj, msg ];
		}
		return [];
	}
}