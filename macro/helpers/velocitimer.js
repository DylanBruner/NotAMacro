export default class VelociTimer {
  constructor(triggerTicks) {
    this.triggerTicks = triggerTicks || 13;

    this.PREFIX = "§7[§cNotAMacro§7] §r";

    this.lastX = 0;
    this.lastZ = 0;
    this.velociNotMovingTicks = 0;
    this.tempOveride = 0;

    this.lastPacketTime = 0;

    register("packetReceived", (packet) => {
      this.lastPacketTime = Date.now();
    })
  }

  isStopped() {
    // if the last recived packet was more than two seconds ago return false
    if (this.velociNotMovingTicks + this.tempOveride >= this.triggerTicks){
      if (Date.now() - this.lastPacketTime > 2000) {
        ChatLib.chat(this.PREFIX + "§cWe seem to be lagging... marking not stopped");
        return false;
      }
      return true;
    }
  }
  reset(){
    this.velociNotMovingTicks = 0;
    this.tempOveride = 0;
  }

  tick() {
    let distance = Math.sqrt(Math.pow(Player.getX() - this.lastX, 2) + Math.pow(Player.getZ() - this.lastZ, 2));
    this.lastX = Player.getX();
    this.lastZ = Player.getZ();

    if (distance < 0.01) {
      this.velociNotMovingTicks++;
    } else {
      this.velociNotMovingTicks = 0;
    }
  }
}