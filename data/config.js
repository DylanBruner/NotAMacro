import {
    @ButtonProperty,
    @CheckboxProperty,
    Color,
    @ColorProperty,
    @PercentSliderProperty,
    @SelectorProperty,
    @SwitchProperty,
    @TextProperty,
    @Vigilant,
    @SliderProperty,
    // configs
} from '../../Vigilance/index';
import Core from "../helpers/core";

// SettingsGui = Java.type('gg.essential.vigilance.gui.SettingsGui');

@Vigilant("NotAMacro", "NotAMacro", {
    getCategoryComparator: () => (a, b) => {
        Core.init(this);
        return l.indexOf(a.name) - l.indexOf(b.name);
    }
})
class Config {
    constructor() {
        this.initialize(this)
        this.setCategoryDescription("General", "")
        Core.init(this);
    }

    // General ==================================================================
    @ButtonProperty({
        name: "Reload Macros",
        category: "General",
        description: "Reloads the macros (some settings wont take effect until you do this)",
        placeholder: "Reload"
    })
    reloadMacros() {
        ChatLib.chat("§7[§cNotAMacro§7] §aYou shouldn't see this message, please report this to the developer!");
    }

    @SelectorProperty({
        name: "Selected Macro",
        category: "General",
        options: ["Mushroom", "Cane", "AD Macro", "Island Forager", "Warp Back"]
    })
    SelectedMacro = 0;

    // FailSafes ================================================================
    @SwitchProperty({
        name: "Yaw Change",
        description: "Pause the macro if the yaw changes",
        category: "Fail-Safes",
        subcategory: "Movement"
    })
    FailSafeYawChange = true;

    @SwitchProperty({
        name: "Pitch Change",
        description: "Pause the macro if the pitch changes",
        category: "Fail-Safes",
        subcategory: "Movement"
    })
    FailSafePitchChange = true;

    @SliderProperty({
        name: "Change Amount",
        description: "The amount of change allowed for pitch and yaw (devides by 10, 1 = 0.1)",
        category: "Fail-Safes",
        subcategory: "Movement",
        min: 1,
        max: 10,
    })
    FailSafePitchYawChangeAmount = 1;

    @SwitchProperty({
        name: "Teleport",
        description: "Pause the macro if the player teleports",
        category: "Fail-Safes",
        subcategory: "Movement"
    })
    FailSafeTeleport = true;

    @SliderProperty({
        name: "Teleport Distance",
        description: "Because teleporting is a fast movement, we need a distance to check for (too low and it will trip on normal movement)",
        category: "Fail-Safes",
        subcategory: "Movement",
        min: 1,
        max: 100,
    })
    FailSafeTeleportDistance = 2;

    @SwitchProperty({
        name: "World Change",
        description: "Pause the macro if the world changes",
        category: "Fail-Safes",
        subcategory: "World Change"
    })
    FailSafeWorldChange = true;

    @SwitchProperty({
        name: "Warp Back on World Change",
        description: "Warp back to the last position if the world changes",
        category: "Fail-Safes",
        subcategory: "World Change"
    })
    FailSafeWorldChangeWarpBack = true;

    @TextProperty({
        name: "Warp Back Command",
        description: "The command to run to warp back to the last position",
        category: "Fail-Safes",
        subcategory: "World Change",
    })
    FailSafeWorldChangeWarpBackCommand = "/warp garden";

    @SwitchProperty({
        name: "Block Change",
        description: "Pause the macro if a block changes (excluding crops)",
        category: "Fail-Safes",
        subcategory: "World"
    })
    FailSafeBlockChange = true;

    @SwitchProperty({
        name: "Player detection",
        description: "Pause the macro if a player is detected",
        category: "Fail-Safes",
        subcategory: "Player Detection"
    })
    FailSafePlayerDetection = true;

    @SliderProperty({
        name: "Range",
        description: "The range check for players",
        category: "Fail-Safes",
        subcategory: "Player Detection",
        min: 1,
        max: 100,
    })
    FailSafePlayerDetectionRange = 10;

    @SwitchProperty({
        name: "Slot Change",
        description: "Pause the macro if the selected slot changes",
        category: "Fail-Safes",
        subcategory: "Inventory"
    })
    FailSafeSlotChange = true;

    // Mushroom Macro ===========================================================
    @SelectorProperty({
        name: "Start Direction",
        category: "Mushroom",
        options: ["Right", "Left"],
    })
    MushroomStartDirection = 0;

    @SelectorProperty({
        name: "Timer",
        category: "Mushroom",
        options: ["Basic", "VelociTimer"]
    })
    MushroomTimerMode = 0;

    @TextProperty({
        name: "Row Time",
        description: "How long to farm each row (basic timer)",
        category: "Mushroom",
        placeholder: "60"
    })
    MushroomRowTime = "60";
    
    @SwitchProperty({
        name: "Pause on Obi",
        description: "Pause the macro when standing on obisidian",
        category: "Mushroom",
        subcategory: "Obsidan Pause"
    })
    MushroomPauseOnObi = true;
    
    @SwitchProperty({
        name: "Switch Direction",
        description: "Switch direction when on obi",
        category: "Mushroom",
        subcategory: "Obsidan Pause"
    })
    MushroomSwitchDirection = true;

    @SliderProperty({
        name: "Obi Pause Time",
        description: "How long to pause on obi",
        category: "Mushroom",
        subcategory: "Obsidan Pause",
        min: 1,
        max: 25,
    })
    MushroomObiPauseTime = 1;

    // Cane Macro ===============================================================
    @SelectorProperty({
        name: "Timer",
        category: "Cane",
        options: ["Basic", "VelociTimer"],
        subcategory: "Timer"
    })
    CaneTimerMode = 1;

    @TextProperty({
        name: "Row Time",
        description: "How long to farm each row (basic timer)",
        category: "Cane",
        subcategory: "Timer",
        placeholder: "60"
    })
    CaneRowTime = "60";

    @SelectorProperty({
        name: "Start Direction",
        category: "Cane",
        options: ["Forward", "Backward"],
    })
    CaneStartDirection = 0;

    // AD Macro =================================================================
    @SelectorProperty({
        name: "Start Direction",
        category: "AD Macro",
        options: ["Left", "Right"],
    })
    ADStartDirection = 0;

    @SelectorProperty({
        name: "Timer",
        category: "AD Macro",
        options: ["Basic", "VelociTimer"],
        subcategory: "Timer"
    })
    ADTimerMode = 1;

    @TextProperty({
        name: "Row Time",
        description: "How long to farm each row (basic timer)",
        category: "AD Macro",
        subcategory: "Timer",
        placeholder: "60"
    })
    ADRowTime = "60";

    // Island Forager ===========================================================
    @SwitchProperty({
        name: "Single Mode",
        description: "Farms a single tree",
        category: "Island Forager"
    })
    IslandForagerSingleMode = false;
    
    @SliderProperty({
        name: "Sapling Slot",
        description: "The slot with the saplings",
        category: "Island Forager",
        subcategory: "Inventory",
        min: 1,
        max: 9,
    })
    IslandForagerSaplingSlot = 2;

    @SliderProperty({
        name: "Axe Slot",
        description: "The slot with the axe",
        category: "Island Forager",
        subcategory: "Inventory",
        min: 1,
        max: 9,
    })
    IslandForagerAxeSlot = 0;

    @SliderProperty({
        name: "Bone Meal Slot",
        description: "The slot with the bone meal",
        category: "Island Forager",
        subcategory: "Inventory",
        min: 1,
        max: 9,
    })
    IslandForagerBoneMealSlot = 1;

    @SliderProperty({
        name: "Move-Limit (Speed basically)",
        description: "Caps the max movement/tick. &cYou probably shouldn't touch this. &eI warned ya!",
        category: "Island Forager",
        subcategory: "Movement",
        min: 1,
        max: 10
    })
    IslandForagerMoveLimit = 2;

    @SwitchProperty({
        name: "Disable normal fail-safes (except world change)",
        description: "So you dont need to re-setup your failsafes when switching to another macro",
        category: "Island Forager",
        subcategory: "Fail-Safes"
    })
    IslandForagerDisableNormalFailSafes = true;

    @SwitchProperty({
        name: "Stop on Empty Hand",
        description: "Stop the macro when the player has an empty hand",
        category: "Island Forager",
        subcategory: "Fail-Safes"
    })
    IslandForagerStopOnEmptyHand = true;

    @SwitchProperty({
        name: "Stop on Yaw/Pitch Change",
        description: "Made to work with this macro",
        category: "Island Forager",
        subcategory: "Fail-Safes"
    })
    IslandForagerStopOnYawPitchChange = true;

    @SwitchProperty({
        name: "Stop on error",
        description: "Stop the macro when an error occurs (when the macro attempts to set a bad yaw/pitch). &cNote: these invalid packets aren't actually sent to the server! &eThis usually occurs when you move your mouse",
        category: "Island Forager",
        subcategory: "Fail-Safes"
    })
    IslandForagerStopOnError = true;

    @SwitchProperty({
        name: "Debug Mode",
        description: "Prints debug messages in chat",
        category: "Island Forager"
    })
    IslandForagerDebugMode = false;

    // Warp Back ================================================================
    @TextProperty({
        name: "Server IP",
        description: "The server IP to re-join",
        category: "Warp Back",
        placeholder: "mc.hypixel.net:25565"
    })
    WarpBackServerIP = "mc.hypixel.net:25565";

    @TextProperty({
        name: "Warp Back Commands",
        description: "The commands to run upon re-joining",
        category: "Warp Back",
        placeholder: "skyblock, warp garden"
    })
    WarpBackCommands = "skyblock, warp garden";
}

export default new Config()