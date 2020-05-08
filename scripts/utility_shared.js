export let getFlag = function(char, toggleName)
{
	return char.data.flags[toggleName] == true;
}

export let toggleFlag = function(char, toggleName)
{
	let toggle = (char.data.flags[toggleName] == undefined || char.data.flags[toggleName] == false);

	let charObj = {};
	charObj['flags.'+toggleName] = toggle;
	char.update(charObj );
}

export let createNewFieldValueHTML = function(toggle, fieldName, value)
{
	// We'll clean this up with css later
	let color = toggle? 'color:green;' : 'color:red;';
	return `<p><b>${fieldName}:</b> <span style="${color}; background-color:lightyellow; border:1px solid; border-radius: 3px; padding-left: 2px; padding-right: 2px">${value}</span></p>`;
}

export let toggleStatusEffectOnChar = function(char, effectImagePath)
{
	let token = canvas.tokens.ownedTokens.find(t => t.actor.id === char.id);
	token.toggleEffect(effectImagePath);
}

export class ToggleOperation
{
	constructor(char, toggleName, flavorFn, statusImagePath)
	{
		this.char = char;
		this.toggleName = toggleName;
		this.flavorFn = flavorFn;
		this.statusImagePath = statusImagePath;
		this.updateOperations = [];
		this.updateMessage = "";
	}
	addContent(opContent)
	{
		try {
			let resultData = opContent.execute();
			let resultUpdates = resultData[0];
			let resultMessage = resultData[1];
			if (!Array.isArray(resultUpdates))
			{
				console.log("Did not receive array back from execution call");
				return;
			}
			for(let res of resultUpdates)
			{
				if (!Array.isArray(res) || res.length != 2)
				{
					console.log("Update operation received was badly formatted");
					return;
				}
				this.updateOperations.push(res);
			}
			this.updateMessage += resultMessage;
		}
		catch(err) {
			let msg = `<i>There was an error applying operation '${opContent.dataPath}' for flag name: ${opContent.toggleName}</i>`;
			let chatData = {
		        user: game.user._id,
		        speaker: ChatMessage.getSpeaker(),
		        whisper: game.users.entities.filter(u => u._id == game.user._id).map(u => u._id),
		        content: msg
		    };
			ChatMessage.create(chatData, {});
			throw err;
		}
	}
	execute()
	{
		for(let updateOp of this.updateOperations)
		{
			let ent = updateOp[0]; 
			let data = updateOp[1];
			ent.update(data);
		}

		let toggle = !getFlag(this.char, this.toggleName);
		let flav = this.flavorFn(toggle);
		let chatData = {
	        user: game.user._id,
	        speaker: ChatMessage.getSpeaker(),
	        flavor: flav,
	        content: this.updateMessage
	    };
		ChatMessage.create(chatData, {});

		toggleFlag(this.char, this.toggleName);
		if(this.statusImagePath != undefined)
		{
			toggleStatusEffectOnChar(this.char, this.statusImagePath);
		}
	}
}

//Soft factory pattern
export class EffectCreator
{
	static constructACEffect(char, toggleName, dataValueFn)
	{
		let path = "armor.value";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = () => "AC";
		dataEffect.entValidFn = function(item)
		{
			return item.type == 'armor' && item.data.data.equipped.value == true;
		};
	}
	static constructNumBaseDDEffect(char, toggleName, dataValueFn)
	{
		let path = "damage.dice";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = () => "Num Base Damage Die";
	}
	static constructBaseDDEffect(char, toggleName, dataValueFn)
	{
		let path = "damage.die";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = () => "Base Damage Die";
	}
	static constructBonusDDEffect(char, toggleName, dataValueFn, diceNum, diceSize)
	{
		let path = "damage.bonusDice";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = function(benficial)
		{
			let dir = benficial ? 'Gained' : 'Lost';
			return [`${dir} Bonus Damage Dice`, `${diceNum}${diceSize}`];
		} 
		dataEffect.entValidFn = function(ent)
		{
			return ent.type == "weapon";
		} 
		return dataEffect;
	}
}

export class CharacterDataEffect
{
	constructor(char, toggleName, affectedEntities, dataPath, dataValueFn)
	{
		// Mandatory
		this.char = char;
		this.toggleName = toggleName;
		this.affectedEntities = affectedEntities;
		this.dataPath = dataPath;
		this.dataValueFn = dataValueFn;

		// Optional
		this.displayInfoFn = null;
		this.entValidFn = null;
		this.toggleBeneficial = true;
	}
	execute()
	{
		let toggle = !getFlag(this.char, this.toggleName);
		let results = [];
		let appliedOnce = false;
		for ( let ent of this.affectedEntities )
		{
			if (this.entValidFn == null || this.entValidFn(ent))
			{
				let applyRes = this.applyEffectToEntity(ent, toggle);
				if (applyRes != false)
				{
					results.push(applyRes);
					appliedOnce = true;
				}
			}
		}

		let message = "";
		if (this.displayInfoFn != null && appliedOnce )
		{
			let beneficial = this.toggleBeneficial ? toggle : !toggle;
			let displayInfo = this.displayInfoFn(beneficial);
			message = createNewFieldValueHTML(beneficial, displayInfo[0], displayInfo[1]);
		}
		return [results, message];
	}
	applyEffectToEntity(ent, toggle)
	{
		// step 1 - get current val
		let currentVal = getProperty(ent.data.data, this.dataPath);

		// step 2 - determine new val
		let newValInfo = this.dataValueFn(toggle, ent, currentVal);
		if (!newValInfo)
		{
			return false;
		}

		let obj = {};
		obj[`data.${this.dataPath}`] = newValInfo[0];
		return [ent,obj];
	}
	addEntValidClause(newClauseFn, isAnd)
	{ 	
		if (this.entValidFn == null)
		{
			this.entValidFn = newClauseFn;
			return;
		}

		let oldVFn = this.entValidFn;
		this.entValidFn = function(ent)
		{
			return (isAnd) ? oldVFn(ent) && newClauseFn(ent) : oldVFn(ent) || newClauseFn(ent);
		};
	}
}