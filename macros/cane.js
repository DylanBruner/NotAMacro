import Config from ".././data/Config";
import Macro from "./macro";
import VelociTimer from ".././helpers/velocitimer";

var robot = Java.type('java.awt.Robot');
var InputEvent = Java.type('java.awt.event.InputEvent');
var KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class Cane extends Macro {
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
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_S);
        this.myRobot.keyPress(KeyEvent.VK_A);
    }

    backward(){
        this.going = "backward";
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
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