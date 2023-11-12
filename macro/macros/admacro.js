import Macro from "../macros/macro";
import Config from ".././data/Config";
import VelociTimer from ".././helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class ADMacro extends Macro {
    static getConfig(){
        return {
            ADStartDirection: {
                type: PropertyType.SELECTOR,
                default: "0",
                config: {
                    name: "Start Direction",
                    category: "A/D Macro",
                    options: ["Left", "Right"]
                }
            },
            ADTimerMode: {
                type: PropertyType.SELECTOR,
                default: "1",
                config: {
                    name: "Timer Mode",
                    category: "A/D Macro",
                    options: ["Basic", "VelociTimer"]
                }
            },
            ADRowTime: {
                type: PropertyType.TEXT,
                default: "60",
                config: {
                    name: "Row Time",
                    description: "How long to farm each row (basic timer)",
                    category: "A/D Macro",
                    placeholder: "60"
                }
            }
        };
    }

    constructor(){
        super();

        this.macroID = 2;
        this.macroName = "A/D";
        this.myRobot = new robot();

        this.velociTimer = new VelociTimer(4);

        this.going = null;
        this.switchAt = 0;
    }

    on_pause(){
        this.stop();
    }

    on_resume(){
        this.velociTimer.reset();
        if (this.going == 'left'){
            this.left();
        } else if (this.going == 'right'){
            this.right();
        }
    }

    left(){
        this.going = "left";
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_D);
        this.myRobot.keyPress(KeyEvent.VK_A);
    }

    right(){
        this.going = "right";
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_A);
        this.myRobot.keyPress(KeyEvent.VK_D);
    }

    stop(){
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_D);
        this.myRobot.keyRelease(KeyEvent.VK_A);
    }

    tick(){
        this.velociTimer.tick();

        if (this.going == null){
            if (Config.ADStartDirection == 0){
                this.left();
            } else if (Config.ADStartDirection == 1){
                this.right();
            }

            if (Config.ADTimerMode == 0){
                this.switchAt = Date.now() + Config.ADRowTime * 1000;
            }
        }

        if (Config.ADTimerMode == 1){
            if (this.velociTimer.isStopped()){
                this.velociTimer.reset();
                if (this.going == 'left'){
                    this.right();
                } else if (this.going == 'right'){
                    this.left();
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
            }
        } else {
            if (Date.now() > this.switchAt){
                if (this.going == 'left'){
                    this.right();
                } else if (this.going == 'right'){
                    this.left();
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
                this.switchAt = Date.now() + Config.ADRowTime * 1000;
            }
        }
    }
}