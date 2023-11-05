import Macro from "./macro";

var robot = Java.type("java.awt.Robot");
var InputEvent = Java.type("java.awt.event.InputEvent");
var KeyEvent = Java.type("java.awt.event.KeyEvent");

export default class FishingHelper extends Macro {
    constructor(){
        super();
        
        this.macroName = "Fishing Helper";
        this.macroID = 8;

        this.myRobot = new robot();
        
        this.hook();
        ChatLib.chat("&7[&bFishingHelper&7] &rMacro loaded!");
    }

    recast(){
        this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
        setTimeout(() => {
            this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
        }, Math.random() * 75 + 50); // 25-100ms
    }
    
    hook(){
        this.soundHook = register("soundPlay", (position, method, vol, pitch, category, event) => {
            if (method.includes("note.pling")){
                setTimeout(() => {
                    this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
                    setTimeout(() => {
                        this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
                        setTimeout(this.recast(), Math.random() * 200 + 1500); // 100-300ms 
                    }, Math.random() * 75 + 25); // 25-100ms
                }, Math.random() * 100 + 100); // 100-200ms
            }
        });
    }

    on_pause(){
        this.soundHook.unregister();
    }

    on_resume(){
        this.hook();
    }

    tick(){}
};