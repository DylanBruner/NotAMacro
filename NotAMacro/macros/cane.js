import Config from ".././data/Config";
import Macro from "./macro";
import VelociTimer from ".././helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class Cane extends Macro {
    static getConfig(){
        return {
            CaneTimerMode: {
                type: PropertyType.SELECTOR,
                default: "1",
                config: {
                    name: "Timer Mode",
                    category: "Cane",
                    options: ["Basic", "VelociTimer"]
                }
            },
            CaneRowTime: {
                type: PropertyType.TEXT,
                default: "60",
                config: {
                    name: "Row Time",
                    description: "How long to farm each row (basic timer)",
                    category: "Cane",
                    placeholder: "60"
                }
            },
            CaneStartDirection: {
                type: PropertyType.SELECTOR,
                default: "0",
                config: {
                    name: "Start Direction",
                    category: "Cane",
                    options: ["Forward", "Backward"]
                }
            }
        };
    }

    constructor(){
        super();

        this.macroID = 1;
        this.macroName = "Cane";
        this.myRobot = new robot();

        this.velociTimer = new VelociTimer(4);

        // general macro stuffs
        this.going = null;
        this.switchAt = 0;
    }

    forward(){
        this.going = "forward";
        this.myRobot.keyRelease(KeyEvent.VK_S);
        this.myRobot.keyPress(KeyEvent.VK_A);
    }

    backward(){
        this.going = "backward";
        this.myRobot.keyRelease(KeyEvent.VK_A);
        this.myRobot.keyPress(KeyEvent.VK_S);
    }

    stop(){
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_S);
        this.myRobot.keyRelease(KeyEvent.VK_A);
    }

    on_pause(){
        this.stop();
    }

    on_resume(){
        this.velociTimer.reset();
        if (this.going == 'forward'){
            this.forward();
        } else if (this.going == 'backward'){
            this.backward();
        }
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    on_start(){
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    tick(){
        this.velociTimer.tick();

        if (this.going == null){
            if (Config.CaneStartDirection == 0){
                this.forward();
            } else if (Config.CaneStartDirection == 1){
                this.backward();
            } else {
                ChatLib.chat(PREFIX + "§cError: §eStart direction is invalid!");
            }

            if (Config.CaneTimerMode == 0){
                this.switchAt = Date.now() + Config.CaneRowTime * 1000;
            }
        }

        if (Config.CaneTimerMode == 1){
            if (this.velociTimer.isStopped()){
                this.velociTimer.reset();

                if (this.going == 'forward'){
                    this.backward();
                } else if (this.going == 'backward'){
                    this.forward();
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
            }
        } else {
            if (Date.now() > this.switchAt){
                if (this.going == 'forward'){
                    this.backward();
                } else if (this.going == 'backward'){
                    this.forward();
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
                this.switchAt = Date.now() + Config.CaneRowTime * 1000;
            }
        }
    }
}