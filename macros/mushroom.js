import Config from ".././data/Config";
import Macro from "./macro";
import VelociTimer from ".././helpers/velocitimer";

var robot = Java.type('java.awt.Robot');
var InputEvent = Java.type('java.awt.event.InputEvent');
var KeyEvent = Java.type('java.awt.event.KeyEvent');


export default class Mushroom extends Macro {

    constructor() {
        this.macroID = 0;
        this.macroName = "Mushroom";
        this.myRobot = new robot();

        this.velociTimer = new VelociTimer();

        // General macro stuffs
        this.going = null;
        this.internalPause = false;
        this.resumeAt = 0;
    }

    right(){
        this.going = "right";
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_A);
        this.myRobot.keyPress(KeyEvent.VK_W);
        this.myRobot.keyPress(KeyEvent.VK_D);
    }

    left(){
        this.going = "left";
        // check if the mouse is already pressed
        this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_D);
        this.myRobot.keyRelease(KeyEvent.VK_W);
        this.myRobot.keyPress(KeyEvent.VK_A);
    }

    stop(){
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.myRobot.keyRelease(KeyEvent.VK_W);
        this.myRobot.keyRelease(KeyEvent.VK_A);
        this.myRobot.keyRelease(KeyEvent.VK_D);
    }

    on_pause(){
        this.stop();
    }

    on_resume(){
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
            // check if we are on obi
            let block = World.getBlockAt(Math.floor(Player.getX()), Math.floor(Player.getY() - 1), Math.floor(Player.getZ()));
            if (block.getType().getName().toLowerCase() == "obsidian"){
                this.stop();
                // setTimeout(() => {
                //     this.myRobot.keyPress(KeyEvent.VK_S);
                //     this.myRobot.keyPress(KeyEvent.VK_D);
                if (Config.MushroomSwitchDirection){
                    this.going = 'left' ? 'right' : 'left'; // switch direction
                }
                //     this.resumeAt = Date.now() + 700;
                // }, 1000);

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
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
            }
        } else {
            if (Date.now() > this.switchAt){
                if (this.going == "right"){
                    this.left();
                } else if (this.going == "left"){
                    this.right();
                } else {
                    ChatLib.chat(PREFIX + "§cError: §eGoing is null!");
                }
                this.switchAt = Date.now() + Config.MushroomRowTime * 1000;
            }
        }
    }
}