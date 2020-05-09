export let getFlag = function(char, toggleName)
{
	return char.data.flags[toggleName] == true;
}

export let toggleFlag = function(char, toggleName)
{
	let toggle = (char.data.flags[toggleName] == undefined || char.data.flags[toggleName] == false);

	let charObj = {};
	charObj['flags.'+toggleName] = toggle;
	return char.update(charObj );
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
	static privateReportingFlag = "privateMacroReporting";
	constructor(char, toggleName, flavorFn, statusImagePath)
	{
		this.char = char;
		this.toggleName = toggleName;
		this.flavorFn = flavorFn;
		this.statusImagePath = statusImagePath;
		this.updateOperations = [];
		this.updateDisplayFns = [];
	}
	addContent(opContent)
	{
		try {
			let resultData = opContent.execute();
			let resultUpdates = resultData[0];
			let resultDisplayInfoFn = resultData[1];
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
			if (resultDisplayInfoFn)
			{
				this.updateDisplayFns.push(resultDisplayInfoFn);
			}
		}
		catch(err) {
			let msg = `<i><p>Error: ${err}</p> For '${opContent.dataPath}' with flag name: ${opContent.toggleName}</i>`;
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
		let promises = [];
		for(let updateOp of this.updateOperations)
		{
			let ent = updateOp[0]; 
			let data = updateOp[1];
			promises.push(ent.update(data));
		}
		Promise.all(promises).then(values => {
			this.toggle();
		});
		
	}
	toggle()
	{
		let toggle = !getFlag(this.char, this.toggleName);
		let flav = this.flavorFn(toggle);
		let message = "";
		for (let dispFn of this.updateDisplayFns)
		{
			message += dispFn(toggle);
		}
		let chatData = {
	        user: game.user._id,
	        speaker: ChatMessage.getSpeaker(),
	        flavor: flav,
	        content: message
		};
		
		if (getFlag(this.char, ToggleOperation.privateReportingFlag))
		{
			chatData.whisper = [game.user];
		}
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
	static constructAttributeEffect(char, toggleName, dataValueFn, path, displayName)
	{
		let fullPath = `attributes.${path}`;
		let affectedEntities = [char];
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, fullPath, dataValueFn);
		dataEffect.displayInfoFn = function(toggle)
		{
			toggle = dataEffect.toggleBeneficial ? toggle : !toggle;
			return createNewFieldValueHTML(toggle, `New ${displayName}`, getProperty(char.data.data, fullPath));
		}
		return dataEffect;
	}
	static constructACEffect(char, toggleName, dataValueFn)
	{
		let path = "armor.value";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = function(toggle)
		{
			toggle = dataEffect.toggleBeneficial ? toggle : !toggle;
			return createNewFieldValueHTML(toggle, "New AC", char.data.data.attributes.ac.value);
		}
		dataEffect.entValidFn = function(item)
		{
			return item.type == 'armor' && item.data.data.equipped.value == true;
		};
		return dataEffect;
	}
	static constructBaseDDStepEffect(char, toggleName, dataValueFn)
	{
		let path = "damage.die";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = function(toggle)
		{
			toggle = dataEffect.toggleBeneficial ? toggle : !toggle;
			let dir = toggle ? 'Stepped Up' : 'Stepped Down';
			return createNewFieldValueHTML(toggle, "Weapon Damage Dice", dir);
		}
		dataEffect.entValidFn = function(ent)
		{
			return ent.type == "weapon";
		} 
		return dataEffect;
	}
	static constructBonusDDEffect(char, toggleName, dataValueFn, diceNum, diceSize)
	{
		let path = "damage.bonusDice";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = function(toggle)
		{
			toggle = dataEffect.toggleBeneficial ? toggle : !toggle;
			let dir = toggle ? 'Gained' : 'Lost';
			return createNewFieldValueHTML(toggle, `${dir} Bonus Damage Dice`, `${diceNum}${diceSize}`);
		} 
		dataEffect.entValidFn = function(ent)
		{
			return ent.type == "weapon";
		} 
		return dataEffect;
	}
	static constructBonusDamageEffect(char, toggleName, dataValueFn, damageAmount)
	{
		let path = "bonusDamage.value";
		let affectedEntities = char.items;
		let dataEffect = new CharacterDataEffect(char, toggleName, affectedEntities, path, dataValueFn);
		dataEffect.displayInfoFn = function(toggle)
		{
			toggle = dataEffect.toggleBeneficial ? toggle : !toggle;
			let dir = toggle ? 'Gained' : 'Lost';
			return createNewFieldValueHTML(toggle, `${dir} Bonus Damage`, `${damageAmount}`);
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
		if (!appliedOnce)
		{
			throw "No valid entity to apply effect to!";
		}
		return [results, this.displayInfoFn];
	}
	applyEffectToEntity(ent, toggle)
	{
		// step 1 - get current val
		let currentVal = getProperty(ent.data.data, this.dataPath);

		// step 2 - determine new val
		let newValInfo = this.dataValueFn(toggle, ent, currentVal);
		if (newValInfo === false)
		{
			return false;
		}

		let obj = {};
		obj[`data.${this.dataPath}`] = newValInfo;
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