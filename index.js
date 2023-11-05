import Config from "./data/Config";
import Failsafe from "./helpers/failsafe";
import GeneralUtils from "./helpers/generalutils";
import Safety from "./helpers/safety";
import ADMacro from "./macros/admacro";
import CactusMacro from "./macros/cactus";
import Cane from "./macros/cane";
import CocoaMacro from "./macros/cocoamacro";
import FishingHelper from "./macros/fishinghelper";
import IslandForager from "./macros/islandforager";
import Mushroom from "./macros/mushroom";
import PumpkinMelonMacro from "./macros/pumpkinmelon";
import WarpBack from "./macros/warpback";

const pauseKey = new KeyBind("Toggle Key", Keyboard.KEY_SEMICOLON, "NotAMacro")

const PREFIX = "§7[§cNotAMacro§7] §r";

class Scope {
    constructor(){
        this.macroEnabled = false;
        this.macro = null;
        this.failsafe = new Failsafe();
        this.pauseKey = pauseKey;
        this.PREFIX = PREFIX;
    }
}

const scope = new Scope();
const generalUtils = new GeneralUtils();
const macros = [
    Mushroom, Cane, ADMacro, IslandForager, 
    WarpBack, CactusMacro, CocoaMacro, PumpkinMelonMacro,
    FishingHelper
]

// overide Config.reloadMacros
Config.reloadMacros = () => {
    scope.macroEnabled = false;
    scope.macro = null;
    ChatLib.chat(PREFIX + "§aReloaded macros!");
}

register("command", (yaw) => {
    Safety.setYaw(yaw);
    ChatLib.chat("§aSet yaw to " + yaw);
}).setName("setyaw");

register("command", (pitch) => {
    Safety.setPitch(pitch);
    ChatLib.chat("§aSet pitch to " + pitch);
}).setName("setpitch");

register("command", () => {
    if (scope.macroEnabled){
        scope.macroEnabled = false;
        scope.macro.on_pause();
        scope.failsafe.on_pause();
        ChatLib.chat(PREFIX + "§cPaused!");
    }
    Config.openGUI();
}).setName("nam")

register("guiOpened", () => {
    if (scope.macroEnabled){
        scope.macroEnabled = false;
        scope.macro.on_pause();
        scope.failsafe.on_pause();
        ChatLib.chat(PREFIX + "§cPaused! §7(Opening GUI)");
    }
});

register("tick", () => {
    generalUtils._tick(scope);

    if (scope.macroEnabled && scope.failsafe.isTripped()){
        ChatLib.chat(PREFIX + "§cFail-safe triggered! Reason: §e" + scope.failsafe.getTripReason());
        scope.macroEnabled = false;
        scope.macro.on_pause();
        scope.failsafe.on_pause();
    }
    if (!scope.macroEnabled && scope.failsafe.forceRestart){
        scope.failsafe.forceRestart = false;
        ChatLib.chat(PREFIX + "§cRestarting macro...");
        scope.macroEnabled = true;
        scope.macro.on_resume();
        scope.failsafe.on_resume();
    }

    if (scope.macro != null && scope.macro.macroID != Config.SelectedMacro){
        scope.macro.on_pause(); // Only really needed for WarpBack but ig all of them can use this
        scope.macro = null;
        scope.macroEnabled = false;
    } else if (scope.macro == null && pauseKey.isPressed()){
        scope.macroEnabled = !scope.macroEnabled;
        if (scope.macroEnabled){
            if (Config.SelectedMacro > macros.length - 1){
                ChatLib.chat(PREFIX + "§cThat's weird....");
                scope.macroEnabled = false;
                return;
            } else {
                scope.macro = new macros[Config.SelectedMacro](scope);
            }

            ChatLib.chat(PREFIX + "§aStarting §e" + scope.macro.macroName + "§a macro!");
            scope.macro.on_start();
            scope.failsafe.on_resume();
        }
    } else if (scope.macro != null && pauseKey.isPressed()){
        scope.macroEnabled = !scope.macroEnabled;
        if (!scope.macroEnabled){
            ChatLib.chat(PREFIX + "§cPaused!");
            scope.macro.on_pause();
            scope.failsafe.on_pause();
        } else {
            ChatLib.chat(PREFIX + "§aResuming!");
            scope.macro.on_resume();
            scope.failsafe.on_resume();
        }
    }

    if (scope.macroEnabled && scope.macro != null){
        scope.macro.tick();
    }
});