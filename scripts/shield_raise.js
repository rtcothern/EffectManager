let char = game.user.character;

let toggleFlag = function(toggleName)
{
let toggle = (char.data.flags[toggleName] == undefined || char.data.flags[toggleName] == false);

let charObj = {};
charObj['flags.'+toggleName] = toggle;
char.update(charObj );

return toggle;
}

let reportLine = function(tog, stat, value)
{
	let color = tog? 'color:green;' : 'color:red;';
	return `<p><b>New ${stat}:</b> <span style="${color}; background-color:lightyellow; border:1px solid; border-radius: 3px; padding-left: 2px; padding-right: 2px">${value}</span></p>`;
}

let toggleAC = function(toggleName, modifier)
{
let toggle = toggleFlag(toggleName);

let mult = toggle ? 1 : -1;
for (let it of char.items) 
	{ 
		let obj = {};
		if(it.type == 'armor' && it.data.data.equipped.value == true)
		{
			obj['data.armor.value'] = +(it.data.data.armor.value) + mult*modifier;
			it.update(obj);
                        let msg = reportLine(toggle, "AC", +(char.data.data.attributes.ac.value) + mult*modifier);
                        let dir = toggle ? 'Raises' : 'Lowers';
                        let flavor = '<i>' + char.name + ` ${dir} Shield</i>`;
                        return [flavor, msg];
		}
	}
};

let shieldAC = char.data.data.attributes.shield.ac;
let data = toggleAC ('shieldBlockActive', shieldAC);

let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: data[0],
        content: data[1]
    };
ChatMessage.create(chatData, {});