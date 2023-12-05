import Macro from "../macro.js";

const robot = Java.type('java.awt.Robot');


const TITLE_COOLDOWN = 1000; // 1 second
const BLOCKS = [
    [-264.5, -107.5], // 1
    [-264.5, -105.5], // 2
    [-262.5, -105.5], // 3
    [-262.5, -107.5], // 4
]

const KEYMAP = {
    'w': Client.getKeyBindFromKey(Keyboard.KEY_W),
    'a': Client.getKeyBindFromKey(Keyboard.KEY_A),
    's': Client.getKeyBindFromKey(Keyboard.KEY_S),
    'd': Client.getKeyBindFromKey(Keyboard.KEY_D),
    'shift': Client.getKeyBindFromKey(Keyboard.KEY_LSHIFT),
    'jump': Client.getKeyBindFromKey(Keyboard.KEY_SPACE),
}

const LClick = Client.getMinecraft().getClass().getDeclaredMethod("func_147116_af");
LClick.setAccessible(true);

export default class TinyDancer extends Macro {
    constructor(){
        this.macroID = 9;
        this.macroName = "Tiny Dancer";
        this.macroType = "Default";

        this.robot = new robot();

        this.running = false;

        this.lastTitleTime = 0;
        this.lastPunchTime = 0;
        this.targetBlock = 1;
        this.moving = false;
        this.nextStep = 0;

        this.doSecondaryAction = false;
        this.jumpAtTarget = false;
        this.sneakAtTarget = false;
        this.punchAtTarget = false;

        register('renderTitle', (title, subtitle, event) => {
            if (this.lastTitleTime + TITLE_COOLDOWN > Date.now() || subtitle.removeFormatting().trim().length == 0) return;
            this.lastTitleTime = Date.now();
            if (subtitle.removeFormatting().toLowerCase().replace("punch!", "").trim().length == 0){
                this.punch();
                return;
            }

            const actions = this.getActions(subtitle.removeFormatting());
            this.jumpAtTarget = actions.find(action => action.action == "jump");
            this.sneakAtTarget = actions.find(action => action.action == "sneak");
            this.punchAtTarget = actions.find(action => action.action == "punch");

            ChatLib.chat("Title: " + subtitle + " | Jump? " + (this.jumpAtTarget ? "Yes" : "No") + " | Sneak? " + (this.sneakAtTarget ? "Yes" : "No") + " | Punch? " + (this.punchAtTarget ? "Yes" : "No"));
            KEYMAP[this.getKey(this.targetBlock)].setState(true);
            this.moving = true;
        });
    }

    getActions(message){
        const actions = [];
        let parts = message.split(" and ");
        parts.forEach(part => {
            if (!part.toLowerCase().includes("don't")) {
                actions.push({
                    action: part.replace("Don't ", "").toLowerCase().trim().replace("!", ""),
                })
            }
        })
        return actions;
    }

    getKey(target){
        if (this.targetBlock == 0) return "d"; //
        if (this.targetBlock == 1) return "w"; // 
        if (this.targetBlock == 2) return "a"; //
        if (this.targetBlock == 3) return "s"; //
        return null;
    }

    pressKey(key, delay){
        KEYMAP[key].setState(true);
        setTimeout(() => {
            KEYMAP[key].setState(false);
        }, delay);
    }

    punch(){
        if (this.lastPunchTime + 75 > Date.now()) {ChatLib.chat("Punching too fast!"); return;}
        this.lastPunchTime = Date.now();
        ChatLib.chat("Punching!")
        LClick.invoke(Client.getMinecraft());
        // this.robot.mousePress(InputEvent.BUTTON1_DOWN_MASK);
        // setTimeout(() => {
        //     this.robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
        // }, 25);
    }

    releaseKeys(){
        KEYMAP['w'].setState(false);
        KEYMAP['a'].setState(false);
        KEYMAP['s'].setState(false);
        KEYMAP['d'].setState(false);
    }
    

    // events ================================
    on_pause(){this.running = false; this.releaseKeys();};
    on_resume(){this.running = true;};
    on_start(){
        this.running = true;
        // make sure their on the start block
    };

    tick(){
        if (this.moving && Math.sqrt(Math.pow(Player.getX() - BLOCKS[this.targetBlock][0], 2) + Math.pow(Player.getZ() - BLOCKS[this.targetBlock][1], 2)) < 0.4) {
            this.targetBlock++;
            if (this.targetBlock >= BLOCKS.length) this.targetBlock = 0;
            this.releaseKeys();
            this.doSecondaryAction = true;
        }

        if (this.punchAtTarget && this.doSecondaryAction) {
            this.punch();
            this.punchAtTarget = false;
        }
        
        if (this.doSecondaryAction && Player.getMotionX() == 0 && Player.getMotionZ() == 0) {
            this.doSecondaryAction = false;
            if (this.jumpAtTarget) {
                this.pressKey('jump', 100);
            }
            if (this.sneakAtTarget) {
                this.pressKey('shift', 600);
            }
        }
    }
}