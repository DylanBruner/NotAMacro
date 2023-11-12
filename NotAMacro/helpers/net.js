import Core from '../helpers/core';

export default class Net {
    constructor(api_url, api_key){
        this.api_url = api_url;
        this.api_key = api_key;
        this.user_agent = {x: 1}
    }

    getMacros(){
        return FileLib.getUrlContent(`${this.api_url}/macros?api_key=${this.api_key}`, this.user_agent);
    }

    getMacro(macro_id){
        return Core.loadMacroFromUrl(`${this.api_url}/macros/${macro_id}?api_key=${this.api_key}&uuid=${Player.getUUID()}`, this.user_agent);
    }
}