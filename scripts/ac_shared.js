let toggleACModifier = function(toggleName, modifier)
{
	let char = game.user.character;
	let toggle = !window.Mistwalker.Utility.getFlag(char, toggleName);

	let mult = toggle ? 1 : -1;
	for (let it of char.items) 
	{ 
		let obj = {};
		if(it.type == 'armor' && it.data.data.equipped.value == true)
		{
			obj['data.armor.value'] = +(it.data.data.armor.value) + mult*modifier;
			it.update(obj);
            let msg = window.Mistwalker.Utility.createNewFieldValueHTML(toggle, "AC", +(char.data.data.attributes.ac.value) + mult*modifier);
            let dir = toggle ? 'Raises' : 'Lowers';
            let flavor = '<i>' + char.name + ` ${dir} Shield</i>`;
            return [flavor, msg];
		}
	}
	window.Mistwalker.Utility.toggleFlag(char, toggleName);
};

