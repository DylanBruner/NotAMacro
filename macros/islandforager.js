import Config from ".././data/Config";
import Macro from "./macro";

var robot = Java.type('java.awt.Robot');
var InputEvent = Java.type('java.awt.event.InputEvent');
var KeyEvent = Java.type('java.awt.event.KeyEvent');

const NAM_PREFIX = "§7[§cNotAMacro§7] §r";
const ERROR_PREFIX = "§c[ERROR!] §r";

const STAGE_IDLE     = 0;
const STAGE_PLANTING = 1;
const STAGE_BONEMEAL = 2;
const STAGE_WAITING_FOR_GROWTH = 3;
const STAGE_BREAKING = 4;
const STAGE_WAITING_FOR_BREAK = 5;
const STAGE_WAITING_FOR_PLACE = 6;

debug = (msg) => {
    if (Config.IslandForagerDebugMode){
        ChatLib.chat(NAM_PREFIX + "§e[DEBUG] §r" + msg);
    }
}

register('command', () => {
    // get the block in front of us (World.getBlockAt)
    // figure out which way the player is facing and get the block in front of them

}).setName('namtest');

export default class IslandForager extends Macro {
    constructor(failsafe){
        super();
        this.failsafe = failsafe;
        this.macroID = 3;
        this.macroName = "Island Forager";

        // CONFIG ===================================================================
        this.saplingSlot  = Config.IslandForagerSaplingSlot - 1;
        this.boneMealSlot = Config.IslandForagerBoneMealSlot - 1;
        this.axeSlot      = Config.IslandForagerAxeSlot - 1;
        // End of config ============================================================
        this.myRobot = new robot(); // use for easy mouse clicking

        // Some variables
        this.stage = STAGE_IDLE;
        this.globalcooldown = 0; // ticks

        // Failsafes
        this.macroEnabled = false;
        this.tripped = false;
        this.reason = null;

        this.lastYaw = 0;
        this.lastPitch = 0;
        
        // for planting
        this.lastTreeCount = 0;
        this.step = 0;
        this.points = [
            [-61.1, 34.7],
            // [-71.9, 31.9]
            [-70.9, 32.7]
        ]

        this.laststage = this.stage;
        this.sameticks = 0;
        this.fixing = false;
        this.failureSlots = [
            {yaw: -91.6, pitch: 59.1, x: 1, z: 0}, // front left
            {yaw: -90.9, pitch: 38.4, x: 2, z: 0}, // back left
            {yaw: -45.6, pitch: 43.7, x: 1, z: 1}, // back right
            {yaw: -61.3, pitch: 36.5, x: 2, z: 1}  // front right
        ]
        
        // Some movement variables & player variables
        this.movingToTarget = false;
        this.yawTarget   = 0;
        this.pitchTarget = 0;

        // Smoothness variables & 'player' like movement
        this.maxChangePerTick = Config.IslandForagerMoveLimit;
        this.rollingPitchRand = 0; // random modifiers 0-1 that are based of the last random modifier
        this.rollingYawRand   = 0; // ^

        register('command', (yaw, pitch) => {
            this.gotoPY(yaw, pitch);
        }).setName('goto');

        debug("§cIsland Forager Initialized");
    }

    // Code for actually moving the player ========================================
    gotoPY(yaw, pitch){
        this.movingToTarget = true;
        this.yawTarget = yaw;
        this.pitchTarget = pitch;
        debug("§eSetting yaw target to " + yaw + " and pitch target to " + pitch);
    }

    setYaw(yaw){
        if (yaw > 180 || yaw < -180 || !(yaw < 180 && yaw > -180) || yaw == NaN) { // so many checks just in case
            ChatLib.chat(ERROR_PREFIX + "Attmpeted to set yaw to " + yaw + " but yaw must be between -180 and 180 (ignored update)");
            this.tripped = true;
            this.reason = "Yaw out of bounds";
            return;
        }
        Client.getMinecraft().field_71439_g.field_70177_z = yaw;
    }

    setPitch(pitch){
        if (pitch > 90 || pitch < -90 || !(pitch < 90 && pitch > -90) || pitch == NaN) { // so many checks just in case
            ChatLib.chat(ERROR_PREFIX + "Attmpeted to set pitch to " + pitch + " but pitch must be between -90 and 90 (ignored update)");
            this.tripped = true;
            this.reason = "Pitch out of bounds";
            return;
        }
        Client.getMinecraft().field_71439_g.field_70125_A = pitch;
    }

    tickPitchAndYaw(){
        if (this.yawTarget != Player.getYaw()){
            this.rollingYawRand += (Math.random() - 0.5) / 10;
            if (this.rollingYawRand > 0.5) this.rollingYawRand = 0.5;
            else if (this.rollingYawRand < -0.5) this.rollingYawRand = -0.5;

            yError = Math.abs(this.yawTarget - Player.getYaw());
            // the higher the error the faster we move, limited to maxChangePerTick
            cpt = yError + this.rollingYawRand;
            before = cpt;
            if (cpt > this.maxChangePerTick) cpt = this.maxChangePerTick;
            // round numbers to 2 decimal places
            cpt = Math.round(cpt * 100) / 100;
            before = Math.round(before * 100) / 100;
            debug("§eYaw error: " + yError + " | Change per tick: " + cpt + " | Before: " + before);

            // move in the direction of the target
            let yawChange = this.yawTarget - Player.getYaw();
            if (yawChange > 180) yawChange -= 360;
            else if (yawChange < -180) yawChange += 360;
            if (yawChange > cpt) yawChange = cpt;
            else if (yawChange < -cpt) yawChange = -cpt;
            this.setYaw(Player.getYaw() + yawChange);
        }

        if (this.pitchTarget != Player.getPitch()){
            this.rollingPitchRand += (Math.random() - 0.5) / 10;
            if (this.rollingPitchRand > 0.5) this.rollingPitchRand = 0.5;
            else if (this.rollingPitchRand < -0.5) this.rollingPitchRand = -0.5;

            pError = Math.abs(this.pitchTarget - Player.getPitch());
            // the higher the error the faster we move, limited to maxChangePerTick
            cpt = pError + this.rollingPitchRand;
            before = cpt;
            if (cpt > this.maxChangePerTick) cpt = this.maxChangePerTick;
            // round numbers to 2 decimal places
            cpt = Math.round(cpt * 100) / 100;
            before = Math.round(before * 100) / 100;
            debug("§ePitch error: " + pError + " | Change per tick: " + cpt + " | Before: " + before + " | Rolling rand: " + this.rollingPitchRand + "/" + this.rollingYawRand);

            // move in the direction of the target
            let pitchChange = this.pitchTarget - Player.getPitch();
            if (pitchChange > 180) pitchChange -= 360;
            else if (pitchChange < -180) pitchChange += 360;
            if (pitchChange > cpt) pitchChange = cpt;
            else if (pitchChange < -cpt) pitchChange = -cpt;
            this.setPitch(Player.getPitch() + pitchChange);
        }

        if (Math.abs(this.yawTarget - Player.getYaw()) < 1 && Math.abs(this.pitchTarget - Player.getPitch()) < 1){
            this.movingToTarget = false;
            debug("§eReached target");
        }
    }

    setSlot(slot){
        if (Player.getHeldItemIndex() != slot){
            Client.getMinecraft().field_71439_g.field_71071_by.field_70461_c = slot;
        }
    }

    // stuff =====================================================================
    getPlacementBlocks(){
        return [
            World.getBlockAt(Player.getX() + 1, Player.getY(), Player.getZ()),
            World.getBlockAt(Player.getX(), Player.getY(), Player.getZ()),
            World.getBlockAt(Player.getX() + 1, Player.getY(), Player.getZ() + 1),
            World.getBlockAt(Player.getX(), Player.getY(), Player.getZ() + 1)
        ];
    }

    getTreeCount(){
        let blocks = this.getPlacementBlocks();
        let saplingCount = 0;

        for (let i = 0; i < blocks.length; i++){
            if (blocks[i].type.getName() == 'Oak Sapling') saplingCount++;
        }

        return saplingCount;
    }

    // Events ====================================================================
    static get_id(){
        return 3;
    }

    on_pause(){
        this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
        this.myRobot.mouseRelease(InputEvent.BUTTON3_MASK);
        this.macroEnabled = false;
        debug("§cIsland Forager paused");
    };

    on_start(){
        this.on_resume();
        this.myRobot.mousePress(InputEvent.BUTTON3_MASK);
        this.maxChangePerTick = Config.IslandForagerMoveLimit;
    }

    on_resume(){
        this.maxChangePerTick = Config.IslandForagerMoveLimit;
        this.macroEnabled = true;
        this.tripped = false;
        this.reason = null;
        this.lastPitch = Player.getPitch();
        this.lastYaw = Player.getYaw();
        this.myRobot.mousePress(InputEvent.BUTTON3_MASK);
    };

    tick(){
        if (!this.macroEnabled) return false;

        // Failsafes
        if (!this.tripped){
            this.tripped = true;

            if (Config.IslandForagerStopOnEmptyHand && Player.getHeldItem() == null){
                this.reason = "Empty Hand";
            } else if (Config.IslandForagerStopOnYawPitchChange && (Math.abs(this.lastYaw - Player.getYaw()) > 25 || Math.abs(this.lastPitch - Player.getPitch()) > 25)){
                this.reason = "Yaw/Pitch change";
            } else {
                this.tripped = false;
            }
        }

        if (this.tripped){
            this.failsafe.tripped = true;
            this.failsafe.tripReason = this.reason;
            return;
        }

        this.lastPitch = Player.getPitch();
        this.lastYaw = Player.getYaw();

        // Single mode =================================================================
        if (Config.IslandForagerSingleMode){
            if (this.globalcooldown > 0){
                this.globalcooldown--;
            } else if (this.stage == STAGE_PLANTING){
                this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
                this.myRobot.mousePress(InputEvent.BUTTON3_MASK);
                this.setSlot(this.saplingSlot);
                this.globalcooldown = 5;
                this.stage = STAGE_BONEMEAL;
                debug("§3Planting saplings")
            } else if (this.stage == STAGE_BONEMEAL) {
                this.setSlot(this.boneMealSlot);
                this.globalcooldown = 19;
                this.stage = STAGE_BREAKING;
                debug("§3Bonemealing saplings");
                setTimeout(() => {
                    // release mouse button
                    this.myRobot.mouseRelease(InputEvent.BUTTON3_MASK);
                }, 150);
            } else if (this.stage == STAGE_BREAKING){
                this.setSlot(this.axeSlot);
                this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
                this.globalcooldown = 5;
                this.stage = STAGE_PLANTING;
                debug("§3Breaking trees")
            } else {
                this.stage = STAGE_PLANTING;
                debug("§3Resetting stage")
            }

            return;
        }

        // ============================================================================

        if (this.laststage == this.stage && !this.fixing){
            this.sameticks++;
            if (this.sameticks > 40){
                const px = Math.floor(Player.getX());
                const pz = Math.floor(Player.getZ());

                debug(`§cDetected error in stage ${this.stage}, step ${this.step}, fixing...`)
                this.fixing = true;
                this.step = 0;
                this.failureSteps = [];

                for (let i = 0; i < this.failureSlots.length; i++){
                    const slot = this.failureSlots[i];
                    if (World.getBlockAt(px + slot.x, Player.getY(), pz + slot.z).type.getName() != 'tile.air.name'){
                        this.failureSteps.push([slot.yaw, slot.pitch, [px + slot.x, Player.getY(), pz + slot.z]]);
                    }
                }

                debug(`§cApplying ${this.failureSteps.length} fixes`);
            }
        } else {
            this.sameticks = 0;
            this.laststage = this.stage;
        }

        if (this.fixing){
            if (this.movingToTarget) {this.tickPitchAndYaw(); return;}

            this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
            if (this.step >= this.failureSteps.length){
                this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
                setTimeout(() => {
                    this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
                }, 200);
                debug("&cFixed!")

                // reset variables
                this.stage = STAGE_IDLE;
                this.globalcooldown = 20;
                this.movingToTarget = false;
                this.step = 0;
                this.sameticks = 0;
                this.fixing = false;
                this.laststage = 0;
            } else {
                this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
                setTimeout(() => {
                    this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
                }, 200);
                this.setSlot(this.axeSlot);

                // check if the next block is air already
                if (World.getBlockAt(this.failureSteps[this.step][2][0], this.failureSteps[this.step][2][1], this.failureSteps[this.step][2][2]).type.getName() == 'tile.air.name'){
                    debug(`§cBlock(${this.failureSteps[this.step][2][0]}, ${this.failureSteps[this.step][2][1]}, ${this.failureSteps[this.step][2][2]}) is already air, skipping`);
                    this.step++;
                    return;
                } else {
                    this.gotoPY(this.failureSteps[this.step][0], this.failureSteps[this.step][1]);
                }
                this.step++;
                this.globalcooldown = 10;
            }

            return;
        }

        if (this.stage == STAGE_WAITING_FOR_BREAK || this.stage == STAGE_WAITING_FOR_GROWTH || this.stage == STAGE_WAITING_FOR_PLACE){
            let blocks = this.getPlacementBlocks();
            
            let saplingCount = 0;
            let woodCount = 0;

            for (let i = 0; i < blocks.length; i++){
                if (blocks[i].type.getName() == 'Oak Sapling') saplingCount++;
                else if (blocks[i].type.getName() == 'Wood') woodCount++;
            }

            // if (this.stage == STAGE_WAITING_FOR_BREAK && block.type.getName() != 'Wood'){
            if (this.stage == STAGE_WAITING_FOR_BREAK && woodCount == 0){
                this.stage = STAGE_PLANTING;
                debug("§3Detected tree break, planting saplings")
            // } else if (this.stage == STAGE_WAITING_FOR_GROWTH && block.type.getName() != 'Oak Sapling'){
            } else if (this.stage == STAGE_WAITING_FOR_GROWTH && saplingCount == 0){
                this.stage = STAGE_BREAKING;
                debug("§3Detected tree growth, breaking trees");
            } else if (this.stage == STAGE_WAITING_FOR_PLACE){
                if (this.getTreeCount() == 3){
                    this.stage = STAGE_PLANTING;
                    debug("&3detected change from " + this.lastTreeCount + " to " + this.getTreeCount() + ", planting saplings");
                    this.lastTreeCount = this.getTreeCount();
                }
            } else {
                return;
            }
        }


        // Main code
        if (this.movingToTarget){
            this.tickPitchAndYaw();
        } else if (this.globalcooldown > 0){
            this.globalcooldown--;
            return;
        } else {
            if (this.stage == STAGE_IDLE){
                this.stage = STAGE_PLANTING;
            } else if (this.stage == STAGE_PLANTING){
                this.setSlot(this.saplingSlot);
                if (this.step == 0){
                    this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK); // cause it'll still be pressed
                }

                if (this.step >= this.points.length){
                    this.stage = STAGE_BONEMEAL;
                    this.step = 0;
                    this.lastTreeCount = 0;
                    return;
                } else {
                    this.gotoPY(this.points[this.step][0], this.points[this.step][1]);
                    this.step++;
                    this.stage = STAGE_WAITING_FOR_PLACE;
                }
                debug("§3Planting saplings");
            } else if (this.stage == STAGE_BONEMEAL){
                this.setSlot(this.boneMealSlot);
                // this.globalcooldown = 7;
                this.stage = STAGE_WAITING_FOR_GROWTH;
                debug("§3Bonemealing saplings");
            } else if (this.stage == STAGE_BREAKING){
                if (Player.getHeldItemIndex() != this.axeSlot){
                    this.myRobot.mousePress(InputEvent.BUTTON1_MASK);
                    this.setSlot(this.axeSlot);
                    // this.globalcooldown = 7;
                    this.stage = STAGE_WAITING_FOR_BREAK;
                }
                debug("§3Breaking trees");
                // this.globalcooldown = 1;
                setTimeout(() => {
                    this.myRobot.mouseRelease(InputEvent.BUTTON1_MASK);
                }, 500);
            }
        }
    };
}