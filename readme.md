# Effect Manager
A Foundry VTT Module for applying useful persistent effects to Characters.

## Creating Your Own Macros
*NOTE - You'll also find several examples illustrating this process in the **Character Effect Macros** Compendium included with the module.*

While there are certainly plety of effects that are complex enough that I'll need to write a macro specifically for them, there are also a lot of abilities out there that do the exact same thing but with different values. I've made some pieces of generic functionality in the hopes you'll be able to put them together to create your own specific buffs.

### Macro Structure
First some terminology: to apply an effect we create a `ToggleOperation` which groups together all the effects you want toggle on and off with your buff. Then we add pieces of content (the actual effects themselves) to the operation, and finally we execute the operation.

### Walkthrough Example
#### Step 1 - Creating the ToggleOperation
We create a `buffName` which is a unique id representing our buff. We can optionally specify a `statusEffectIcon` to indicate our buff is on.
```
let buffName = "myBuffID";
let statusEffectIcon = "icons/svg/biohazard.svg"; // Optional, set '= null;' if undesired
```

Now we specify some variables for the flavor message that will be created when toggling the buff. These will be put together depending on if you're toggling your buff on or off.
```
let flavBegin_On = "Gains", flavBegin_Off = "Loses";
let flavMiddle = "My super awesome buff";
let flavEnding_On = "!", flavEnding_Off = "...";
let flavorFn = window.EffectManager.ToggleOperation.createFlavorFn(flavBegin_On, flavBegin_Off, flavMiddle, flavEnding_On, flavEnding_Off);
```

Finally we create the operation itself (this will be the same for every macro).
```
let char = game.user.character;
let operation = new window.EffectManager.ToggleOperation(char, buffName, flavorFn, statusEffectIcon);
```

#### Step 2 - Adding content
Now we'll use any of the generic content functions to create our contents. Here we'll create an effect that adds 1 to your AC, and gives you 1d8 bonus Precision damage to your attacks while the buff is on. Further content functions will be listed in the next section.
```
let acValue = 1;
let acContent = window.EffectCreator.AC(operation, acValue);

let diceNum = 1;
let diceSize = "d8";
let damageType = "Precision";
let ddContent = window.EffectManager.EffectCreator.BonusDamageDice(operation, diceNum, diceSize, damageType);

//(Step 2.5) For Adventurous Souls: Tweak the contents. Get in touch with me if you want to learn more!
//EX: Add a function to filter this content so that its effects only apply to weapons in the 'bow' group
// let weaponValidFn = function (ent)
// {
// 	return ent.data.data.group.value == "bow";
// }
// ddContent.addEntValidClause(weaponValidFn, true);

operation.addContent(acContent);
operation.addContent(ddContent);
```

#### Step 3 - Execute!
Once you'd added all your content, just call the below function and you're off to the races!
```
operation.execute();
```

### Currently Available Content Functions
Below are what I've implemented so far.
```
window.EffectManager.EffectCreator.AC(operation, acValue);
window.EffectManager.EffectCreator.BaseDamageStep(operation, stepUp )
window.EffectManager.EffectCreator.BonusDamageDice(operation, diceNum, diceSize, damageType);
window.EffectManager.EffectCreator.BonusDamage(operation, damageAmount);

```
And some examples of using them
```
let acContent = window.EffectCreator.AC(operation, 1);
let damageStepUpContent = window.EffectManager.EffectCreator.BaseDamageStep(operation, true );
let damageDieContent = window.EffectManager.EffectCreator.BonusDamageDice(operation, 1, "d8", "Fire");
let damageContent = window.EffectManager.EffectCreator.BonusDamage(operation, 3);
```