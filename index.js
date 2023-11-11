
import Cfg from "./data/Config";
import Failsafe from "./helpers/failsafe";
import GeneralUtils from "./helpers/generalutils";
import Safety from "./helpers/safety";
import CactusMacro from "./macros/cactus";
import Cane from "./macros/cane";
import CocoaMacro from "./macros/cocoamacro";
import FishingHelper from "./macros/fishinghelper";
import IslandForager from "./macros/islandforager";
import Mushroom from "./macros/mushroom";
import ADMacro from "./macros/admacro";
import PumpkinMelonMacro from "./macros/pumpkinmelon";
import WarpBack from "./macros/warpback";
import Core from "./helpers/core";
import request from "../requestV2";

const pauseKey = new KeyBind("Toggle Key", Keyboard.KEY_SEMICOLON, "NotAMacro")

const PREFIX = "§7[§cNotAMacro§7] §r";

request('https://dylanbruner.github.io/NotAMacro/manifest.json').then((manifest) => {
    if (manifest.version != Core.version){
        ChatLib.chat(PREFIX + "§cNew version available! §7(" + manifest.version + ") §ahttps://github.com/dylanbruner/NotAMacro/releases/latest");
    }
}).catch((err) => {
    ChatLib.chat(PREFIX + "§cFailed to check for updates!");
    ChatLib.chat(PREFIX + "§c" + err);
});

class Scope {
    constructor(){
        this.macroEnabled = false;
        this.macro = null;
        this.failsafe = new Failsafe();
        this.pauseKey = pauseKey;
        this.PREFIX = PREFIX;
    }
}

// Core.loadMacroFromString(FileLib.read(`${Config.modulesFolder}/NotAMacro/macros/admacro.js`))

const scope = new Scope();
const generalUtils = new GeneralUtils();
const macros = [
    Mushroom, Cane, ADMacro, IslandForager, 
    WarpBack, CactusMacro, CocoaMacro, PumpkinMelonMacro,
    FishingHelper
];

for (macro of macros){
    if (macro.getConfig != undefined){
        Cfg.registerTemplate(macro.getConfig());
    }
}

Cfg.registerTemplate(Failsafe.getConfig());

Cfg.init();

// overide Config.reloadMacros
Cfg.reloadMacros = () => {
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
    Cfg.openGUI();
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

    if (scope.macro != null && scope.macro.macroID != Cfg.SelectedMacro){
        scope.macro.on_pause(); // Only really needed for WarpBack but ig all of them can use this
        scope.macro = null;
        scope.macroEnabled = false;
    } else if (scope.macro == null && pauseKey.isPressed()){
        scope.macroEnabled = !scope.macroEnabled;
        if (scope.macroEnabled){
            if (Cfg.SelectedMacro > macros.length - 1){
                ChatLib.chat(PREFIX + "§cThat's weird....");
                scope.macroEnabled = false;
                return;
            } else {
                scope.macro = new macros[Cfg.SelectedMacro](scope);
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