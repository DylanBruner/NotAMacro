export default class Safety {
  static setPitch(pitch) {
    if (
      pitch > 90 ||
      pitch < -90 ||
      !(pitch < 90 && pitch > -90) ||
      pitch == NaN
    ) {
      // so many checks just in case
      ChatLib.chat(
        ERROR_PREFIX +
          "Attmpeted to set pitch to " +
          pitch +
          " but pitch must be between -90 and 90 (ignored update)"
      );
      this.tripped = true;
      this.reason = "Pitch out of bounds";
      return;
    }
    Client.getMinecraft().field_71439_g.field_70125_A = pitch;
  }

  static setYaw(yaw) {
    if (yaw > 180 || yaw < -180 || !(yaw < 180 && yaw > -180) || yaw == NaN) {
      // so many checks just in case
      ChatLib.chat(
        ERROR_PREFIX +
          "Attmpeted to set yaw to " +
          yaw +
          " but yaw must be between -180 and 180 (ignored update)"
      );
      this.tripped = true;
      this.reason = "Yaw out of bounds";
      return;
    }
    Client.getMinecraft().field_71439_g.field_70177_z = yaw;
  }
}