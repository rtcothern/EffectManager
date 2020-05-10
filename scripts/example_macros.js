let ToggleOperationMacroInstructions = function()
{
	// [Terminology]
	// ToggleOperation - The conceptual container for all the effects you will turn on/off with your buff. You create one
	//     of these, add pieces of content to it with other macros (listed below), and execute all of them together.
	// Tunables - Variables, alter these for your specific buff

	// (Step 1) Create the operation
	// Tunables
	let buffName = "nexavarActive"; // Unique identifer for this buff
	let statusEffectIcon = "icons/svg/biohazard.svg"; // Path for the status image to use. Optional, set to null if unwanted

	// Tunables for the flavor message at the beginning of your operation
	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "Nexavar";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
	
	// Create the operation using our tunables
	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

	//(Step 2) Add contents to the operation with the functions below

	//(Step 3) Execute all operation contents
	operation.execute();

	// ================= Types of generic operation contents =================
	// window.EffectManager.Macros.AddBonusDamageDieContent(operation, buffName, diceNum, diceSize, damageType, weaponValidFn [optional]);
	// EX: window.EffectManager.Macros.AddBonusDamageDieContent(operation, buffName, 1, "d8", "Precision", null);

	// window.EffectManager.Macros.AddBonusDamageContent(operation, buffName, damageAmonut, weaponValidFn [optional]);
	// EX: window.EffectManager.Macros.AddBonusDamageDieContent(operation, buffName, 4, null);

	// window.EffectManager.Macros.AddDamageDiceStepContent(operation, flagName, stepUp, weaponValidFn [optional])
	//EX: window.EffectManager.Macros.AddDamageDiceStepContent(operation, flagName, true, null );
	
	// window.EffectManager.Macros.AddACContent(operation, flagName, acValue);
	//EX: window.EffectManager.Macros.AddACContent(operation, flagName, 2);

}

// Example Macros
let NexavarExample = function()
{
    let buffName = "nexavarActive"; // Unique identifer for this buff
	let statusEffectIcon = "icons/svg/biohazard.svg"; // Path for the status image to use. Optional, set to null if unwanted

	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "Nexavar";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
	
	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);
    window.EffectManager.Macros.AddBonusDamageDieContent(operation, buffName, 1, "d8", "Precision", null);
	operation.execute();
}
let ShieldSpellExample = function()
{
	let buffName = 'shieldSpellActive';
	let statusEffectIcon = 'icons/svg/mage-shield.svg';
	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "a Shield of Magical Force";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
	
	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

	window.EffectManager.Macros.AddACContent(operation, buffName, acValue);
	operation.execute();
}
let RaiseShieldExample = function()
{
	let buffName = 'shieldBlockActive';
	let statusEffectIcon = 'icons/svg/shield.svg';
	let flavBegin_On = "Raises", flavBegin_Off = "Lowers";
	let flavMiddle = "Shield";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);

	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

	window.EffectManager.Macros.AddACContent(operation, buffName, char.data.data.attributes.shield.ac);
	operation.execute();
}
let WindforceExample = function()
{
	let buffName = "windforceActive";
	let statusEffectIcon = 'icons/svg/windmill.svg';
	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "Windforce";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);

	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

	let stepUp = true;
	let weaponValidFn = function (ent) // Only applies to weapons in the 'bow' weapon group
	{
		return ent.data.data.group.value == "bow";
	}
	window.EffectManager.Macros.AddDamageDiceStepContent(operation, buffName, stepUp, weaponValidFn);
	window.EffectManager.Macros.AddBonusDamageContent(operation, buffName, 2, weaponValidFn);
	operation.execute();
}