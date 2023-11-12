export default class Macro {
    constructor(){
        this.macroID = -1;
        this.macroName = null;
    }
    
    on_start(){};
    on_pause(){};
    on_resume(){};
    static get_id(){};
}