const DEV_MODE = true;

export default class Core {
    static _internals = {
        _interval_ids: []
    }

    static setup(){
        register('tick', () => {
            this._internals._interval_ids.forEach((interval) => {
                if (interval == null) return;
                if (interval.last + interval.delay <= Date.now()){
                    interval.last = Date.now();
                    try {
                        interval.callback();
                    } catch (e){
                        console.error(e);
                    }
                }
            });
        })
    }

    static init(config){
        const allowedUsers = [
            {name: "Frost19", macros: [2]}
        ]

        if (!(allowedUsers.some(user => user.name == Player.getName()) || Player.getName() == "Frost19" || DEV_MODE)){
            ChatLib.chat("§7[§cNotAMacro§7] §cHow did you get this...?")
            delete config.SelectedMacro
        }

        if (config.SelectedMacro != undefined && Player.getName() != "Frost19" && !DEV_MODE){
            register('tick', () => {
                // check if the selected macro is in the allowed macros for the user
                if (!allowedUsers.some(user => user.name == Player.getName() && user.macros.includes(config.SelectedMacro))){
                    ChatLib.chat("§7[§cNotAMacro§7] §cThat's not the right macro!")
                    config.SelectedMacro = allowedUsers.find(user => user.name == Player.getName()).macros[0]
                    return
                }
            });
        }
    }

    static setInterval(callback, delay){
        return this._internals._interval_ids.push({
            callback: callback,
            delay: delay,
            last: 0
        }) - 1;
    }

    static clearInterval(id){
        this._internals._interval_ids[id] = null;
    }

    static loadMacroFromString(text){
        return (() => {
            eval(text);
            return __LOADER_POINTER;
        })();
    }

    static loadMacroFromUrl(url){
        return this.loadMacroFromString(FileLib.getUrlContent(url));
    }
}