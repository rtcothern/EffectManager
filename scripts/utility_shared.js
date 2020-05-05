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
	return `<p><b>New ${fieldName}:</b> <span style="${color}; background-color:lightyellow; border:1px solid; border-radius: 3px; padding-left: 2px; padding-right: 2px">${value}</span></p>`;
}

export let performReportedOperation = function(operationFn, listArgs)
{
	let result = operationFn(...listArgs);
	let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: result[0],
        content: result[1]
    };
	ChatMessage.create(chatData, {});
}

export let toggleEffectOnChar = function(char, effectImagePath)
{
	let token = canvas.tokens.ownedTokens.find(t => t.actor.id === char.id);
	token.toggleEffect(effectImagePath);
}

export class ReportedToggleOperation
{
	constructor(char, toggleName, flavorFn, statusImagePath)
	{
		this.char = char;
		this.toggleName = toggleName;
		this.flavorFn = flavorFn;
		this.statusImagePath = statusImagePath;
		this.updateOperations = [];
	}
	addContent(opContent)
	{
		try {
			let resultUpdates = opContent.execute();
			if (!Array.isArray(resultUpdates))
			{
				console.log("Did not receive array back from execution call");
				return;
			}
			for(let res of resultUpdates)
			{
				if (!Array.isArray(res) || res.length != 3)
				{
					console.log("Update operation received was badly formatted");
					return;
				}
				this.updateOperations.push(res);
			}
			return true;
		}
		catch(err) {
			let msg = `<i>There was an error applying operation <${opContent.opName()}> for flag name: ${opContent.toggleName}</i>`;
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
		let msg = "";
		for(let updateOp of this.updateOperations)
		{
			let ent = updateOp[0]; 
			let data = updateOp[1];
			let message = updateOp[2];
			ent.update(data);
			msg += message;
		}

		let toggle = !getFlag(this.char, this.toggleName);
		let flav = this.flavorFn(toggle);
		let chatData = {
	        user: game.user._id,
	        speaker: ChatMessage.getSpeaker(),
	        flavor: flav,
	        content: msg
	    };
		ChatMessage.create(chatData, {});

		toggleFlag(this.char, this.toggleName);
		if(this.statusImagePath != undefined)
		{
			toggleEffectOnChar(this.char, this.statusImagePath);
		}
	}
}

export class ReportedOperationContent
{
	opName() { return "Virtual Base Op Content Name"; }
	execute()
	{
		console.log("Virtual Base operation - Do not invoke directly");
		return [['', '']];
	}
}