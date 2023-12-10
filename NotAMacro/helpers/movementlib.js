import Config from ".././data/Config";
import Macro from "../macros/macro";
import Safety from "./safety";

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

export default class MovementLib extends Macro {
    static mlib = null;

    static getMovementLib() {
        return MovementLib.mlib;
    }

    static getConfig() {
        return {
            MovementLibRecordMode: {
                type: PropertyType.SWITCH,
                default: false,
                config: {
                    name: "Record Mode",
                    description: "Generate recordings (for development)",
                    category: "MovementLib"
                }
            }
        }
    }

    constructor() {
        if (MovementLib.mlib != null) {
            throw new Error("MovementLib already exists!");
        }
        mlib = this;

        super();

        this.movement = [];
        this.recording = false;
        this.playing = false;
        this.playbackFrame = 0;
        this.playbackRecording = [];

        this.startTime = 0;
        this.startYaw = 0;
        this.startPitch = 0;

        this.l = false;

        register('command', (action) => {
            if (action == undefined) return ChatLib.chat("Usage: /movementlib <record|stop|play|info|save>");

            if (action.toLowerCase() == 'record'){
                this.recording = !this.recording;
                if (this.recording) {
                    this.movement = [];
                    this.startTime = new Date().getTime();
                    this.startYaw = Player.getYaw();
                    this.startPitch = Player.getPitch();
                }
                ChatLib.chat("Recording: " + this.recording);
            } else if (action.toLowerCase() == 'stop') {
                this.stop();
                ChatLib.chat("Stopped")
            } else if (action.toLowerCase() == 'play') {
                this.playing = !this.playing;
                if (this.playing) {
                    this.playRecording(this.movement);
                }
                ChatLib.chat("Playing: " + this.playing);
            } else if (action.toLowerCase() == 'info'){
                ChatLib.chat("Movement Buffer: " + this.movement.length);
            } else if (action.toLowerCase() == 'save'){
                ChatLib.chat("data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.movement)));
            }
        }).setName('movementlib').setAliases(['mlib']);

        register('tick', this.tick.bind(this));
    }
    
    tick(){
        if (this.recording) {
            this.movement.push({
                yaw: Player.getYaw() - this.startYaw,
                pitch: Player.getPitch() - this.startPitch,
                time: new Date().getTime() - this.startTime
            });
    
            if (this.movement.length > 15_000){
                ChatLib.chat("Stopped recording (max length reached)");
                this.recording = false;
            }
        } else if (this.playing){
            if (this.playbackFrame >= this.playbackRecording.length){
                this.playing = false;
                // ChatLib.chat("Reached end of recording");
                return;
            }

            let frame = this.playbackRecording[this.playbackFrame];
            let yaw = this.startYaw + frame.yaw + (Math.random() * 0.0001);
            let pitch = this.startPitch + frame.pitch + (Math.random() * 0.0001);

            // Handle yaw and pitch wrapping
            if (yaw > 180) yaw -= 360;
            if (yaw < -180) yaw += 360;
            if (pitch > 90) pitch -= 180;
            if (pitch < -90) pitch += 180;

            // ChatLib.chat(`Setting yaw to ${yaw} and pitch to ${pitch}`)

            if (frame.time > 0){
                let time = frame.time - (new Date().getTime() - this.startTime);
                if (time > 0){
                    return;
                }
            }

            Safety.setYaw(yaw);
            Safety.setPitch(pitch);

            this.playbackFrame++;
        }
    }

    stop(){
        this.recording = false;
        this.playing = false;
    }

    playRecording(recording, returnToStart = false){
        this.playing = true;
        this.playbackFrame = 0;
        this.playbackRecording = recording;

        this.startYaw = Player.getYaw();
        this.startPitch = Player.getPitch();
        ChatLib.chat("Playing recording with " + recording.length + " frames (" + (recording.length / 20).toFixed(2) + "s)");
    }
}