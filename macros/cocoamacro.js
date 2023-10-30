//-50.9
import Config from "../data/Config";
import Macro from "./macro";
import VelociTimer from "../helpers/velocitimer";

var robot = Java.type('java.awt.Robot');
var InputEvent = Java.type('java.awt.event.InputEvent');
var KeyEvent = Java.type('java.awt.event.KeyEvent');

export default class CocoaMacro extends Macro {
    constructor() {
        this.macroID = 6;
        this.macroName = "Cocoa";
        this.myRobot = new robot();

        this.velociTimer = new VelociTimer(4);

        // General macro stuffs
        this.going = null; // W/S
        this.switchingLanes = false; // D
        this.globalCooldown = 0;
    }

    on_pause(){
        this.myRobot.keyRelease(KeyEvent.VK_W);
        this.myRobot.keyRelease(KeyEvent.VK_S);
        this.myRobot.keyRelease(KeyEvent.VK_D);
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
    }

    on_resume(){
        if (this.switchingLanes){
            this.myRobot.keyPress(KeyEvent.VK_D);
        } else if (this.going == 'W'){
            this.myRobot.keyPress(KeyEvent.VK_W);
        } else if (this.going == 'S'){
            this.myRobot.keyPress(KeyEvent.VK_S);
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
                this.myRobot.keyPress(KeyEvent.VK_W);
            } else if (Config.CactusStartDirection == 1){
                this.going = 'S';
                this.myRobot.keyPress(KeyEvent.VK_S);
            }
        }

        if (this.velociTimer.isStopped() && !this.switchingLanes){
            this.velociTimer.reset();
            if (this.going == 'W'){
                this.myRobot.keyRelease(KeyEvent.VK_W);
                this.myRobot.keyPress(KeyEvent.VK_D);
            } else if (this.going == 'S'){
                this.myRobot.keyRelease(KeyEvent.VK_S);
                this.myRobot.keyPress(KeyEvent.VK_D);
            }
            this.switchingLanes = true;
        } else if (this.velociTimer.isStopped() && this.switchingLanes){
            this.velociTimer.reset();
            this.myRobot.keyRelease(KeyEvent.VK_D);
            this.globalCooldown = 20;
            this.switchingLanes = false;

            if (this.going == 'W'){
                this.going = 'S';
                this.myRobot.keyPress(KeyEvent.VK_S);
            } else if (this.going == 'S'){
                this.going = 'W';
                this.myRobot.keyPress(KeyEvent.VK_W);
            }
        }
    }
}