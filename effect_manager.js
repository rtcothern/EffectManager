/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import * as macros from "./scripts/macros.js";
import * as examples from "./scripts/example_macros.js";
import ItemEF from "./scripts/item_ef.js";
import {ToggleOperation, EffectCreator} from "./scripts/utility_shared.js";
/* ------------------------------------ 
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('init', function ()
{
	CONFIG.Item.entityClass = ItemEF;
});
Hooks.once('setup', function () 
{
    window.EffectManager = 
    {
       Macros  	: macros,
       Examples : examples,
       ToggleOperation : ToggleOperation,
       EffectCreator : EffectCreator,
    };
});
