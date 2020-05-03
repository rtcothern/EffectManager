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
		this.content = '';
	}
	addContent(content)
	{
		let result = content.execute();
		this.content += result;
		return this;
	}
	display()
	{
		let toggle = !getFlag(this.char, this.toggleName);
		let flav = this.flavorFn(toggle);
		let chatData = {
	        user: game.user._id,
	        speaker: ChatMessage.getSpeaker(),
	        flavor: flav,
	        content: this.content
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
	execute()
	{
		console.log("Virtual Base operation - Do not invoke directly");
		return ['', ''];
	}
}