import * as util from "./utility_shared.js";

class OwnedItemEffect extends util.ReportedOperation
{
	constructor(char, toggleName, calcModifierFn, flavorFn, effectImagePath)
	{
		super();
		this.char = char;
		this.toggleName = toggleName;
		this.calcModifierFn = calcModifierFn;
		this.flavorFn = flavorFn;
		this.effectImagePath = effectImagePath;
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
		let flavor = '';
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
			util.toggleFlag(this.char, this.toggleName);

			if(this.effectImagePath != undefined)
			{
				util.toggleEffectOnChar(this.char, this.effectImagePath);
			}
			if (this.flavorFn != undefined)
			{
				flavor = this.flavorFn(toggle, this.char);
			}
		}
		else
		{
			flavor = ['No items were eligible for effect application'];
		}
		return [flavor, message];
	}
	operation()
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
	        let msg = util.createNewFieldValueHTML(toggle, "AC", +(this.char.data.data.attributes.ac.value) + mult*mod);
	        return [ item, obj, msg];
		}
		return [];
	}
}