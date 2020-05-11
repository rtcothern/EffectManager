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
    
    //(Step 2) Create the contents with the functions below
    let content = window.EffectCreator.AC.AddBonusDamageDieContent(operation, 1);

    //(Step 2.5) For adventurous souls: Tweak the contents in any way you'd like
    //EX: Add a function to filter this content so that its effects only apply to weapons in the 'bow' group
    // let weaponValidFn = function (ent)
	// {
	// 	return ent.data.data.group.value == "bow";
	// }
    // content.addEntValidClause(weaponValidFn, true);

    //(Step 3) Add each operation content
    operation.addContent(content);

	//(Step 4) Execute operation
	operation.execute();

	// ================= Types of generic operation contents =================
	// window.EffectManager.EffectCreator.AddBonusDamageDieContent(operation, buffName, diceNum, diceSize, damageType, weaponValidFn [optional]);
	// EX: let content = window.EffectManager.Macros.AddBonusDamageDieContent(operation, buffName, 1, "d8", "Precision", null);

	// window.EffectManager.EffectCreator.AC(operation, acValue);
	// EX: let content = window.EffectCreator.AC.AddBonusDamageDieContent(operation, 1);

	// window.EffectManager.EffectCreator.BaseDamageStep(operation, stepUp )
	//EX: let content = window.EffectManager.EffectCreator.BaseDamageStep(operation, true );
	
	// window.EffectManager.EffectCreator.BonusDamageDice(operation, diceNum, diceSize, damageType);
	//EX: let content = window.EffectManager.EffectCreator.BonusDamageDice(operation, 1, "d8"", "Fire");

}

// Example Macros
export let NexavarExample = function()
{
    let buffName = "nexavarActive"; // Unique identifer for this buff
	let statusEffectIcon = "icons/svg/biohazard.svg"; // Path for the status image to use. Optional, set to null if unwanted

	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "Nexavar";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
	
	let char = game.user.character;
    let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);
    
    let diceNum = 1;
    let diceSize = "d8";
    let damageType = "Precision";
    let content = window.EffectManager.EffectCreator.BonusDamageDice(operation, diceNum, diceSize, damageType);
    operation.addContent(content);
	operation.execute();
}
export let ShieldSpellExample = function()
{
	let buffName = 'shieldSpellActive';
	let statusEffectIcon = 'icons/svg/mage-shield.svg';
	let flavBegin_On = "Gains", flavBegin_Off = "Loses";
	let flavMiddle = "a Shield of Magical Force";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
	
	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

    let acValue = 1;
    let content = window.EffectManager.EffectCreator.AC(operation, acValue);
    operation.addContent(content);
	operation.execute();
}
export let RaiseShieldExample = function()
{
	let buffName = 'shieldBlockActive';
	let statusEffectIcon = 'icons/svg/shield.svg';
	let flavBegin_On = "Raises", flavBegin_Off = "Lowers";
	let flavMiddle = "Shield";
	let flavEnding_On = "!", flavEnding_Off = "...";
	let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);

	let char = game.user.character;
	let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);

	let content = window.EffectManager.EffectCreator.AC(operation, char.data.data.attributes.shield.ac);
    operation.addContent(content);
	operation.execute();
}
export let WindforceExample = function()
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

    let stepUpContent = window.EffectManager.EffectCreator.BaseDamageStep(operation, stepUp);
    let damageContent = window.EffectManager.EffectCreator.BonusDamage(operation, 2);

    let weaponValidFn = function (ent) // Only applies to weapons in the 'bow' weapon group
    {
        return ent.data.data.group.value == "bow";
    }
    stepUpContent.addEntValidClause(weaponValidFn, true);
    damageContent.addEntValidClause(weaponValidFn, true);

    operation.addContent(stepUpContent);
    operation.addContent(damageContent);
    operation.execute();
}