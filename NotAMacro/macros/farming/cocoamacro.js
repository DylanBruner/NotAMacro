//-50.9
import Config from "../../data/Config";
import Macro from "../macro";
import VelociTimer from "../../helpers/velocitimer";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

const robot = Java.type('java.awt.Robot');
const InputEvent = Java.type('java.awt.event.InputEvent');
const KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class CocoaMacro extends Macro {
    static macroName = "Cocoa";

    static getConfig() {
        return {
            CocoaStartDirection: {
                type: PropertyType.SELECTOR,
                default: "0",
                config: {
                    name: "Start Direction",
                    category: "Cocoa",
                    options: ["Forward", "Backward"]
                }
            }
        };
    }

    constructor() {
        this.macroID = 6;
        this.macroName = "Cocoa";
        this.macroType = "Farming";
        
        this.myRobot = new robot();
        this.KEY_W = Client.getKeyBindFromKey(Keyboard.KEY_W);
        this.KEY_S = Client.getKeyBindFromKey(Keyboard.KEY_S);
        this.KEY_D = Client.getKeyBindFromKey(Keyboard.KEY_D);

        this.velociTimer = new VelociTimer(4);

        // General macro stuffs
        this.going = null; // W/S
        this.switchingLanes = false; // D
        this.globalCooldown = 0;
    }

    on_pause(){
        this.KEY_W.setState(false);
        this.KEY_S.setState(false);
        this.KEY_D.setState(false);
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
    }

    on_resume(){
        if (this.switchingLanes){
            this.KEY_D.setState(true);
        } else if (this.going == 'W'){
            this.KEY_W.setState(true);
        } else if (this.going == 'S'){
            this.KEY_S.setState(true);
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

        if (this.going == null){
            // press left click
            this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
            if (Config.CactusStartDirection == 0){
                this.going = 'W';
                this.KEY_W.setState(true);
            } else if (Config.CactusStartDirection == 1){
                this.going = 'S';
                this.KEY_S.setState(true);
            }
        }

        if (this.velociTimer.isStopped() && !this.switchingLanes){
            this.velociTimer.reset();
            if (this.going == 'W'){
                this.KEY_W.setState(false);
                this.KEY_D.setState(true);
            } else if (this.going == 'S'){
                this.KEY_S.setState(false);
                this.KEY_D.setState(true);
            }
            this.switchingLanes = true;
        } else if (this.velociTimer.isStopped() && this.switchingLanes){
            this.velociTimer.reset();
            this.KEY_D.setState(false);
            this.globalCooldown = 20;
            this.switchingLanes = false;

            if (this.going == 'W'){
                this.going = 'S';
                this.KEY_S.setState(true);
            } else if (this.going == 'S'){
                this.going = 'W';
                this.KEY_W.setState(true);
            }
        }
    }
}