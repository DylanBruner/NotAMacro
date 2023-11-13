const ERROR_PREFIX = "§c[ERROR!] §r";

export default class Safety {
  static setPitch(pitch) {
    if (pitch > 90 || pitch < -90 || !(pitch < 90 && pitch > -90) || pitch == NaN) {
      // so many checks just in case
      ChatLib.chat(ERROR_PREFIX + "Attmpeted to set pitch to " + pitch + " but pitch must be between -90 and 90 (ignored update)");
      return false;
    }

    Client.getMinecraft().field_71439_g.field_70125_A = pitch;
    return true;
  }

  static setYaw(yaw) {
    if (yaw > 180 || yaw < -180 || !(yaw < 180 && yaw > -180) || yaw == NaN) {
      // so many checks just in case
      ChatLib.chat(ERROR_PREFIX + "Attmpeted to set yaw to " + yaw + " but yaw must be between -180 and 180 (ignored update)");
      return false;
    }
    
    Client.getMinecraft().field_71439_g.field_70177_z = yaw;
    return true;
  }

  static setSlot(slot) {
    if (slot > 8 || slot < -1 || !(slot < 8 && slot > -1) || slot == NaN) {
      // so many checks just in case
      ChatLib.chat(ERROR_PREFIX + "Attmpeted to set slot to " + slot + " but slot must be between 0 and 8 (ignored update)");
      return false;
    }

    Client.getMinecraft().field_71439_g.field_71071_by.field_70461_c = slot;
    return true;
  }
}