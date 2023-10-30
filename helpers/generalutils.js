import Config from "../data/Config";

export default class GeneralUtils {
    constructor(){
        this.lastY = null;
        this.yChangeStart = 0;
        this.yChanging = false;
        
        // cooldowns ========================
        this.lastQuickDeathTrigger = 0;
    }

    _tick(scope){
        if (Config.GeneralMacroConfigQuickDeath && scope.macroEnabled && Date.now() - this.lastQuickDeathTrigger > 5000){
            if (this.lastY == null) {this.lastY = Player.getY();}

            if (this.lastY > Player.getY() && !this.yChanging){
                this.yChanging = true;
                this.yChangeStart = Player.getY();
            } else if (this.yChanging && this.lastY == Player.getY()){
                this.yChanging = false;
            } else if (this.yChanging){
                if (this.yChangeStart - Player.getY() >= Config.GeneralMacroConfigQuickDeathDistance){
                    this.lastQuickDeathTrigger = Date.now();
                    ChatLib.chat(scope.PREFIX + "§eQuick death triggered!");
                    ChatLib.command("warp garden");
                }
            }


            this.lastY = Player.getY();
        }
    }
}