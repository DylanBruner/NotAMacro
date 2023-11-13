import Config from '../data/config';
import Safety from '../helpers/safety';
import shared from '../data/shared';

const PropertyType = Java.type("gg.essential.vigilance.data.PropertyType");

debug = (msg) => {
    if (shared.debug)
        ChatLib.chat(`§8[§7Wiggle§8] §r${msg}`);
}

export default class Wiggle {
    static getConfig() {}

    constructor(){
        this.targetPoints = [ // list of different sets of points to wiggle to
            [[0, -10]],
            [[0, -30]],
            [[0, -35]],
            [[0, -40]]
        ];

        this.lastFarmingTime = 0;

        this.step = -1;
        this.path = 0;

        this.originalYaw = 0;
        this.originalPitch = 0;
        this.yawTarget = 0;
        this.pitchTarget = 0;
        this.overshot = false;
        this.movingToTarget = false;

        // randomized shit
        this.speed = 0;
        this.speedModTick = 0.4;
        this.closeSpeed = 0;
        this.closeSpeedTarget = 0;
        this.overshoot = 0;
        
        register('tick', () => {
            this.tick();
        });

        register('actionBar', (event) => {
            const text = ChatLib.getChatMessage(event).removeFormatting();
            if (text.indexOf('Farming') != -1)
                this.lastFarmingTime = Date.now();
        });
    }

    wiggle(){
        this.originalPitch = Player.getPitch();
        this.originalYaw = Player.getYaw();

        this.step = 0;
        // pick a random path in one of the lists
        this.path = Math.floor(Math.random() * this.targetPoints.length);

        // random data
        this.pointPath = 1;
        this.overshoot = Math.round(Math.random() * 10 + 0.5)

        this.speed = Math.round(Math.random() * 2.5 + 2.5);
        this.closeSpeed = this.speed;
    }

    tick_movement(){
        if (this.yawTarget != Player.getYaw()) {
            var yError = Math.abs(this.yawTarget - Player.getYaw());
            // the higher the error the faster we move, limited to maxChangePerTick
            cpt = yError;
            before = cpt;
            if (cpt > 0.05)
                cpt = (Math.random() * 0.2 + 0.1) * (Math.random() < 0.2 ? -1 : 1);
            
            debug(`§eYaw error: ${yError} | Change per tick=${cpt} | Before=${before} | Rolling rand=${this.rollingYawRand}/${this.rollingYawRand}`)

            // move in the direction of the target
            let yawChange = this.yawTarget - Player.getYaw();
            if (yawChange > 180) yawChange -= 360;
            else if (yawChange < -180) yawChange += 360;
            if (yawChange > cpt) yawChange = cpt;
            else if (yawChange < -cpt) yawChange = -cpt;
            Safety.setYaw(Player.getYaw() + yawChange);
        }

        if (this.pitchTarget != Player.getPitch()) {
            pError = Math.abs(this.pitchTarget - Player.getPitch());
            // the higher the error the faster we move, limited to maxChangePerTick
            var cpt = pError;
            before = cpt;
            if (cpt > this.speed)
                cpt = this.speed;
            if (pError < 20){
                cpt = this.closeSpeed;
            }

            // round numbers to 2 decimal places
            cpt = Math.round(cpt * 100) / 100;
            before = Math.round(before * 100) / 100;
            debug(`§ePitch error: ${pError} | Change per tick=${cpt} | Before=${before} | Rolling rand=${this.rollingPitchRand}/${this.rollingYawRand}`)

            // move in the direction of the target
            let pitchChange = this.pitchTarget - Player.getPitch();
            if (pitchChange > 180) pitchChange -= 360;
            else if (pitchChange < -180) pitchChange += 360;
            if (pitchChange > cpt) pitchChange = cpt;
            else if (pitchChange < -cpt) pitchChange = -cpt;
            Safety.setPitch(Player.getPitch() + pitchChange);
        }

        if (Math.abs(this.yawTarget - Player.getYaw()) < 2 && Math.abs(this.pitchTarget - Player.getPitch()) < 1) {
            this.movingToTarget = false;
            debug("§eReached target");
        }
    }

    setTarget(yaw, pitch){
        // limit to the correct range
        this.yawTarget = Math.max(-180, Math.min(180, yaw));
        this.pitchTarget = Math.max(-90, Math.min(90, pitch));
    }

    tick(){        
        if (this.step == -1) return;
        if (this.movingToTarget) {
            if (this.closeSpeedTarget != -1){
                if (this.closeSpeed > this.closeSpeedTarget){
                    this.closeSpeed -= this.speedModTick;
                    if (this.closeSpeed < this.closeSpeedTarget) this.closeSpeed = this.closeSpeedTarget;
                }
            }

            this.tick_movement();
            return;
        }

        if (this.step == -2) {this.step = -1; return;};


        if (this.step < this.targetPoints[this.path].length){
            this.closeSpeedTarget = -1;
            this.movingToTarget = true;
            this.setTarget(Player.getYaw() + Math.random(), Player.getPitch() + this.targetPoints[this.path][this.step][1]);
            this.step++;
        } else {
            this.step = -2;
            this.movingToTarget = true;
            this.setTarget(this.originalYaw, this.originalPitch);
            this.closeSpeedTarget = 1;
        }
    }
}