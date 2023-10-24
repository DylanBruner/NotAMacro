import Macro from "./macro";
import Config from ".././data/Config";

const PREFIX = "§7[§cNotAMacro§7] §r";

var robot = Java.type('java.awt.Robot');
var InputEvent = Java.type('java.awt.event.InputEvent');
var KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class WarpBack extends Macro {
    constructor(){
        super();

        this.warpBack = null;
        this.onDisconnect = null;

        this.macroID = 4;
        this.macroName = "WarpBack";
        this.lastWarp = 0;
        this.takenOver = false;
        this.markConnected = false;
        this.on_resume();
    }

    on_resume(){
        this.warpBack = register("worldUnload", () => {
            if (Date.now() - this.lastWarp < 120000) return;    
            ChatLib.chat(PREFIX + "§cDetected world unload, warping back in 10 seconds...");
            this.lastWarp = Date.now();
            setTimeout(() => {
                if (this.takenOver) return;
                ChatLib.command("is");
                ChatLib.chat(PREFIX + "§aWelcome back ;)");
            }, 10000);
        });

        this.onDisconnect = register("serverDisconnect", () => {
            setTimeout(() => {
                Client.connect("hypixel.net:25565");
                setTimeout(() => {
                    commands = Config.WarpBackCommands.split(",");
                    // run each command with a 5 seconds delay in between
                    commands.forEach((command, index) => {
                        setTimeout(() => {
                            ChatLib.command(command.trim());
                        }, 5000 * index);
                    });
                }, 60 * 1000);
            }, 10 * 1000);
        });
    }

    on_pause(){
        this.warpBack.unregister();
        this.onDisconnect.unregister();
    }

    tick(){}
}