import * as util from "./utility_shared.js";

//todo generlize for character.data.data (has many thing such as abilities, currency, saves, traits, skills)
export class AttributeEffect extends util.ReportedOperationContent
{
	constructor(char, toggleName, attributeDisplayName, attributePath, modifier )
	{
		super();
		this.char = char;
		this.toggleName = toggleName;
		this.attributeDisplayName = attributeDisplayName;
		this.attributePath = attributePath;
		this.modifier = modifier;
	}

	toggleEffect()
	{
		let toggle = !util.getFlag(this.char, this.toggleName);
		let mult = toggle ? 1 : -1;
		let attributes = this.char.data.data.attributes;

		let currentVal = getProperty(attributes, this.attributePath);
		if (currentVal === undefined)
		{
			console.log(`Bad attribute path ${this.attributePath} for toggleName: ${this.toggleName}`);
			return '';
		}
		let newVal = currentVal + mult * this.modifier;
		newVal = (newVal >= 0) ? newVal : 0;

		let obj = {};
		obj[`data.attributes.${this.attributePath}`] = newVal;

		let colorToggle = newVal > currentVal;
		let message = util.createNewFieldValueHTML(colorToggle, this.attributeDisplayName, obj[`data.attributes.${this.attributePath}`]);
		return [[obj, message]];
	}
	execute()
	{
		return this.toggleEffect();
	}
	opName() { return "Attribute Effect: " + this.attributeDisplayName; }
}