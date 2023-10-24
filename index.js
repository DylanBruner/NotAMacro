import Config from "./data/Config";
import Mushroom from "./macros/mushroom";
import Cane from "./macros/cane";
import WarpBack from "./macros/warpback";
import Failsafe from "./helpers/failsafe";
import ADMacro from "./macros/admacro";
import IslandForager from "./macros/islandforager"
import Core from "./helpers/core";

const pauseKey = new KeyBind("Toggle Key", Keyboard.KEY_SEMICOLON, "NotAMacro")

const PREFIX = "§7[§cNotAMacro§7] §r";

var macroEnabled = false;
var macro = null;
var failsafe = new Failsafe();

// overide Config.reloadMacros
Config.reloadMacros = () => {
    macroEnabled = false;
    macro = null;
    ChatLib.chat(PREFIX + "§aReloaded macros!");
}

register("command", () => {
    if (macroEnabled){
        macroEnabled = false;
        macro.on_pause();
        failsafe.on_pause();
        ChatLib.chat(PREFIX + "§cPaused!");
    }
    Config.openGUI();
}).setName("nam")

register("guiOpened", () => {
    if (macroEnabled){
        macroEnabled = false;
        macro.on_pause();
        failsafe.on_pause();
        ChatLib.chat(PREFIX + "§cPaused! §7(Opening GUI)");
    }
});

register("tick", () => {
    if (macroEnabled && failsafe.isTripped()){
        ChatLib.chat(PREFIX + "§cFail-safe triggered! Reason: §e" + failsafe.getTripReason());
        macroEnabled = false;
        macro.on_pause();
        failsafe.on_pause();
    }
    if (!macroEnabled && failsafe.forceRestart){
        failsafe.forceRestart = false;
        ChatLib.chat(PREFIX + "§cRestarting macro...");
        macroEnabled = true;
        macro.on_resume();
        failsafe.on_resume();
    }

    if (macro != null && macro.macroID != Config.SelectedMacro){
        macro.on_pause(); // Only really needed for WarpBack but ig all of them can use this
        macro = null;
        macroEnabled = false;
    } else if (macro == null && pauseKey.isPressed()){
        macroEnabled = !macroEnabled;
        if (macroEnabled){
            if (Config.SelectedMacro == 0) macro = new Mushroom();
            else if (Config.SelectedMacro == 1) macro = new Cane();
            else if (Config.SelectedMacro == 2) macro = new ADMacro();
            else if (Config.SelectedMacro == 3) macro = new IslandForager(failsafe);
            else if (Config.SelectedMacro == 4) macro = new WarpBack();
            else {ChatLib.chat(PREFIX + "§cThat's weird...."); macroEnabled = false; return;}
            
            ChatLib.chat(PREFIX + "§aStarting §e" + macro.macroName + "§a macro!");
            macro.on_start();
            failsafe.on_resume();
        }
    } else if (macro != null && pauseKey.isPressed()){
        macroEnabled = !macroEnabled;
        if (!macroEnabled){
            ChatLib.chat(PREFIX + "§cPaused!");
            macro.on_pause();
            failsafe.on_pause();
        } else {
            ChatLib.chat(PREFIX + "§aResuming!");
            macro.on_resume();
            failsafe.on_resume();
        }
    }

    if (macroEnabled && macro != null){
        macro.tick();
    }
});