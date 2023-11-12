import Config from ".././data/Config";
import Macro from "./macro";
import VelociTimer from ".././helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');


export default class Mushroom extends Macro {
    static getConfig(){
        return {
            'MushroomStartDirection': {
                type: PropertyType.SELECTOR,
                default: 0,
                config: {
                    name: "Start Direction",
                    options: ["Right", "Left"],
                    category: "Mushroom"
                }
            },
            'MushroomTimerMode': {
                type: PropertyType.SELECTOR,
                default: 1,
                config: {
                    name: "Timer Mode",
                    options: ["Basic", "VelociTimer"],
                    category: "Mushroom"
                }
            },
            'MushroomRowTime': {
                type: PropertyType.TEXT,
                default: "60",
                config: {
                    name: "Row Time",
                    category: "Mushroom",
                    placeholder: "60"
                }
            },
            'MushroomPauseOnObi': {
                type: PropertyType.SWITCH,
                default: true,
                config: {
                    name: "Enabled",
                    description: "Pause when standing on obsidian",
                    category: "Mushroom",
                    subcategory: "Obsidian Pause"
                }
            },
            'MushroomSwitchDirection': {
                type: PropertyType.SWITCH,
                default: true,
                config: {
                    name: "Switch Direction",
                    description: "Switch direction when pausing on obsidian",
                    category: "Mushroom",
                    subcategory: "Obsidian Pause"
                }
            },
            'MushroomObiPauseTime': {
                type: PropertyType.SLIDER,
                default: 1,
                config: {
                    name: "Pause Time",
                    description: "How long to pause for",
                    category: "Mushroom",
                    subcategory: "Obsidian Pause",
                    min: 1,
                    max: 25
                }
            }
        }
    }

    constructor() {
        this.macroID = 0;
        this.macroName = "Mushroom";
        this.myRobot = new robot();

        this.W_KEY = Client.getKeyBindFromKey(Keyboard.KEY_W);
        this.A_KEY = Client.getKeyBindFromKey(Keyboard.KEY_A);
        this.D_KEY = Client.getKeyBindFromKey(Keyboard.KEY_D);


        this.velociTimer = new VelociTimer(5);

        // General macro stuffs
        this.going = null;
        this.internalPause = false;
        this.resumeAt = 0;
    }

    right(){
        this.going = "right";
        this.A_KEY.setState(false);
        this.W_KEY.setState(true);
        this.D_KEY.setState(true);
    }

    left(){
        this.going = "left";
        this.D_KEY.setState(false);
        this.W_KEY.setState(false);
        this.A_KEY.setState(true);
    }

    stop(release){
        if (release)
            this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.W_KEY.setState(false);
        this.A_KEY.setState(false);
        this.D_KEY.setState(false);
    }

    on_pause(){
        this.stop(true);
    }

    on_start(){
        // left click
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
    }

    on_resume(){
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.velociTimer.reset();
        if (this.going == 'right'){
            this.right();
        } else if (this.going == 'left'){
            this.left();
        }
    }

    tick(){
        if (this.internalPause){
            if (Date.now() >= this.resumeAt){
                this.internalPause = false;
                this.velociTimer.tempOveride = 20;
                } else {
                return;
            }
        }

        this.velociTimer.tick();

        if (this.going == null){
            if (Config.MushroomStartDirection == 0){
                this.right();
            } else if (Config.MushroomStartDirection == 1){
                this.left();
            }

            if (Config.MushroomTimerMode == 0){
                this.switchAt = Date.now() + Config.MushroomRowTime * 1000;
            }
        }

        if (Config.MushroomPauseOnObi){
            let block = World.getBlockAt(Math.floor(Player.getX()), Math.floor(Player.getY() - 1), Math.floor(Player.getZ()));
            if (block.getType().getName().toLowerCase() == "obsidian"){
                this.stop(false);
                if (Config.MushroomSwitchDirection){
                    this.going = (this.going == 'left') ? 'right' : 'left';
                }

                this.resumeAt = Config.MushroomObiPauseTime * 1000 + Date.now();
                this.internalPause = true;
                return;
            }
        }

        if (Config.MushroomTimerMode == 1){ // VelociTimer
            if (this.velociTimer.isStopped()){
                this.velociTimer.reset();

                if (this.going == "right"){
                    this.left();
                } else if (this.going == "left"){
                    this.right();
                }
            }
        } else {
            if (Date.now() > this.switchAt){
                if (this.going == "right"){
                    this.left();
                } else if (this.going == "left"){
                    this.right();
                }
                this.switchAt = Date.now() + Config.MushroomRowTime * 1000;
            }
        }
    }
}