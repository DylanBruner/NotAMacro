import Macro from "../macro";
import Config from "../../data/Config";
import VelociTimer from "../../helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class ADMacro extends Macro {
    static macroName = "A/D";
    
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
        this.macroType = "Farming";
        this.myRobot = new robot();

        this.KEY_A = Client.getKeyBindFromKey(Keyboard.KEY_A);
        this.KEY_D = Client.getKeyBindFromKey(Keyboard.KEY_D);

        this.velociTimer = new VelociTimer(4);

        this.going = null;
        this.switchAt = 0;
    }

    on_pause(){
        this.stop();
    }

    on_start(){
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    on_resume(){
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.velociTimer.reset();
        if (this.going == 'left'){
            this.left();
        } else if (this.going == 'right'){
            this.right();
        }
    }

    left(){
        this.going = "left";
        this.KEY_D.setState(false);
        this.KEY_A.setState(true);
    }

    right(){
        this.going = "right";
        this.KEY_A.setState(false);
        this.KEY_D.setState(true);
    }

    stop(){
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.KEY_A.setState(false);
        this.KEY_D.setState(false);
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