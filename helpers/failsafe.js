import Config from ".././data/Config";
import IslandForager from "../macros/islandforager";

const BlockChangePacket = Java.type("net.minecraft.network.play.server.S23PacketBlockChange");
const AllowedBlockModifications = [
    "tile.air.name",
    "mushroom",
    "pumpkin",
    "melon",
    "sugar cane",
    "cocoa",
    "nether wart",
    "crops",
    "potatoes",
    "carrots",
    "cactus"
]


const PREFIX = "§7[§cNotAMacro§7] §r";


export default class Failsafe {
    constructor(){
        this.running = false;
        this.forceRestart = false;
        this.tripped = false;
        this.tripReason = null;

        // Some variables to hold last known values
        this.lastPitch = 0;
        this.lastYaw   = 0;
        this.lastSlot  = 0;
        this.lastX     = 0;
        this.lastY     = 0;
        this.lastZ     = 0;

        this.macroRef  = null;

        register("worldUnload", this.onWorldUnload.bind(this));
        register("tick", this.tick.bind(this));
        register("packetReceived", this.onBlockModified.bind(this)).setFilteredClass(BlockChangePacket);
    }

    // Internal callbacks and stuff
    onBlockModified(packet){
        if (!Config.FailSafeBlockChange) return;
        if (Config.IslandForagerDisableNormalFailSafes && Config.SelectedMacro == IslandForager.get_id()) return;
        
        x = packet.func_179827_b().func_177958_n();
        y = packet.func_179827_b().func_177956_o();
        z = packet.func_179827_b().func_177952_p();

        setTimeout(() => {
            block = World.getBlockAt(x, y, z);
            name = block.getType().getName();
            // check if name.toLowerCase() is in AllowedBlockModifications
            if (!AllowedBlockModifications.includes(name.toLowerCase())){
                this.tripReason = `Block Change (${name})`;
                this.tripped = true;
            }
        }, 1000)
        
    }

    onWorldUnload(){
        if (!this.running) return;
        if (Config.FailSafeWorldChange) {
            this.tripReason = "World Change";
            this.tripped = true;

            if (Config.FailSafeWorldChangeWarpBack){
                setTimeout(() => {
                    ChatLib.chat(PREFIX + "§aRunning warp command...");
                    ChatLib.command(Config.FailSafeWorldChangeWarpBackCommand);
                    setTimeout(() => {
                        this.forceRestart = true;
                    }, 5000);
                }, 10000);
            }
        }
    }

    getAllPlayers() {
        const NetHandlerPlayClient = Client.getConnection();
        const scoreboard = World.getWorld().func_96441_U();
        const teams = scoreboard.func_96525_g();
        const PLAYERARRAY = [];
        teams.forEach(team => {
            const players = team.func_96670_d();
            players.forEach(player => {
                const networkPlayerInfo = NetHandlerPlayClient.func_175104_a(player);
                if (networkPlayerInfo !== null) {
                    PLAYERARRAY.push(new PlayerMP(
                        new net.minecraft.client.entity.EntityOtherPlayerMP(World.getWorld(), networkPlayerInfo.func_178845_a())
                    )
                    )
                }
            });
        });
        return PLAYERARRAY;
    };

    tick(){
        if (!this.running) return;
        if (Config.IslandForagerDisableNormalFailSafes) return;

        // Yaw and Pitch ========================================================
        if (Config.FailSafeYawChange && Math.abs(Player.getYaw() - this.lastYaw) > Config.FailSafePitchYawChangeAmount / 10){
            this.tripReason = "Yaw Change";
            this.tripped = true;
            return;
        } 
        if (Config.FailSafePitchChange && Math.abs(Player.getPitch() - this.lastPitch) > Config.FailSafePitchYawChangeAmount / 10){
            this.tripReason = "Pitch Change";
            this.tripped = true;
            return;
        }

        // Slot Change ==========================================================
        if (Config.FailSafeSlotChange && Player.getHeldItemIndex() != this.slot){
            this.tripReason = "Slot Change";
            this.tripped = true;
            return;
        }

        // Player Detection =====================================================
        if (Config.FailSafePlayerDetection){
            playerNames = []
            this.getAllPlayers().forEach(player => {playerNames.push(player.getName())});

            World.getAllPlayers().forEach(player => {
                if (playerNames.includes(player.getName()) && player.getName() != Player.getName()){
                    let distance = Math.sqrt(Math.pow(Player.getX() - player.getX(), 2) + Math.pow(Player.getZ() - player.getZ(), 2));
                    this.tripReason = `Player Detection (${player.getName()} is ${distance.toFixed(2)} blocks away)`;
                    this.tripped = true;
                    return;
                }
            });
        }

        // Teleport =============================================================
        if (Config.FailSafeTeleport){
            // calculate the 3d distance between the last known position and the current position
            let distance = Math.sqrt(Math.pow(Player.getX() - this.lastX, 2) + Math.pow(Player.getY() - this.lastY, 2) + Math.pow(Player.getZ() - this.lastZ, 2));
            if (distance >= Config.FailSafeTeleportDistance){
                this.tripReason = "Teleport";
                this.tripped = true;
                return;
            }
        }

        // Update a few last-known values
        this.lastX = Player.getX();
        this.lastY = Player.getY();
        this.lastZ = Player.getZ();
    }
    
    // Things to be used by the macro
    isTripped(){return this.tripped;}
    getTripReason(){return this.tripReason;}

    // Simple pause and resume
    on_pause(){this.running = false;}
    on_resume(){
        this.running = true;
        this.tripped = false;
        this.tripReason = null;

        this.lastPitch = Player.getPitch();
        this.lastYaw   = Player.getYaw();
        this.lastX     = Player.getX();
        this.lastY     = Player.getY();
        this.lastZ     = Player.getZ();
        this.slot      = Player.getHeldItemIndex();
    }
}