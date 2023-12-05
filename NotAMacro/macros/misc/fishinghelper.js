import Macro from "../macro";

var robot = Java.type("java.awt.Robot");
var InputEvent = Java.type("java.awt.event.InputEvent");

export default class FishingHelper extends Macro {
    static macroName = "Fishing Helper";

    constructor() {
        super();

        this.macroName = "Fishing Helper";
        this.macroID = 8;
        this.plingcd = 0;

        this.myRobot = new robot();

        this.hook();
    }

    recast() {
        this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
        setTimeout(() => {
            this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
        }, 25); // 25-100ms
    }

    hook() {
        this.soundHook = register("soundPlay", (position, method, vol, pitch, category, event) => {
                if (method.includes("note.pling") && Date.now() - this.plingcd > 500) {
                    this.plingcd = Date.now();
                    setTimeout(() => {
                        this.myRobot.mousePress(InputEvent.BUTTON3_DOWN_MASK);
                        setTimeout(() => {
                            this.myRobot.mouseRelease(InputEvent.BUTTON3_DOWN_MASK);
                            setTimeout(() => {
                                this.recast();
                            }, Math.floor(Math.random() * 100) + 100); // 100-200ms
                        }, Math.floor(Math.random() * 100) + 25); // 25-125ms
                    }, Math.floor(Math.random() * 100) + 25); // 25-125ms
                }
            }
        );
    }

    on_pause() {
        this.soundHook.unregister();
    }

    on_resume() {
        this.hook();
    }

    tick() {}
}
