import Config from ".././data/Config";
import Macro from "./macro";
import VelociTimer from ".././helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class PumpkinMelonMacro extends Macro {
    static macroName = "PumpkinMelon";
    
    static getConfig() {
        return {
            PumpkinMelonStartDirection: {
                type: PropertyType.SELECTOR,
                default: "0",
                config: {
                    name: "Start Direction",
                    category: "Pumpkin/Melon",
                    options: ["Forward", "Backward"]
                }
            }
        };
    }

    constructor() {
        this.macroID = 7;
        this.macroName = "PumpkinMelon";
        this.macroType = "Farming";
        
        this.myRobot = new robot();
        this.KEY_W = Client.getKeyBindFromKey(Keyboard.KEY_W);
        this.KEY_A = Client.getKeyBindFromKey(Keyboard.KEY_A);
        this.KEY_D = Client.getKeyBindFromKey(Keyboard.KEY_D);

        this.velociTimer = new VelociTimer(4);

        // General macro stuffs
        this.going = null; // A/D
        this.goingForward = false; // W
        this.globalCooldown = 0;

        this.tempWPressTime = 0;
    }

    on_pause(){
        this.KEY_W.setState(false);
        this.KEY_A.setState(false);
        this.KEY_D.setState(false);
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
    }

    on_resume(){
        if (this.goingForward){
            this.KEY_W.setState(true);
        } else if (this.going == 'A'){
            this.KEY_A.setState(true);
        } else if (this.going == 'D'){
            this.KEY_D.setState(true);
        }

        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    start(){
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    tick(){
        if (this.globalCooldown > 0){
            this.globalCooldown--;
            return;
        }

        this.velociTimer.tick();

        if (this.tempWPressTime != -1){
            if (this.tempWPressTime <= 0){
                this.tempWPressTime = 0; // will get set to negative 1 later, disabling this
                this.KEY_W.setState(false);
            }
            this.tempWPressTime--;
        }

        if (this.going == null){
            // press left click
            this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
            if (Config.PumpkinMelonStartDirection == 0){
                this.going = 'A';
                this.KEY_A.setState(true);
            } else if (Config.PumpkinMelonStartDirection == 1){
                this.going = 'D';
                this.KEY_D.setState(true);
            }
        }

        if (this.velociTimer.isStopped() && !this.goingForward){
            this.velociTimer.reset();
            if (this.going == 'A'){
                this.KEY_A.setState(false);
                this.KEY_W.setState(true);
            } else if (this.going == 'D'){
                this.KEY_D.setState(false);
                this.KEY_W.setState(true);
            }
            this.goingForward = true;
        } else if (this.velociTimer.isStopped() && this.goingForward){
            this.velociTimer.reset();
            this.tempWPressTime = 10; // hold W for an additional 20 ticks
            this.globalCooldown = 20;
            this.goingForward = false;

            if (this.going == 'A'){
                this.going = 'D';
                this.KEY_D.setState(true);
            } else if (this.going == 'D'){
                this.going = 'A';
                this.KEY_A.setState(true);
            }
        }
    }
}