export default class Macro {
    constructor(){
        this.macroID = -1;
        this.macroName = null;
        this.macroType = "Default";
    }
    
    on_start(){};
    on_pause(){};
    on_resume(){};
    
    static get_id(){};
    get_type(){return this.macroType;};
}