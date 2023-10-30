const DEV_MODE = true;

export default class Core {
    static init(config){
        const allowedUsers = [
            {name: "Frost19", macros: [2]}
        ]

        if (allowedUsers.some(user => user.name == Player.getName()) || Player.getName() == "Frost19" || DEV_MODE){
            global.l = ["General", "General Macro Config", "Fail-Safes", "Cane", "Mushroom", "Cactus", "Cocoa", "AD Macro", "Island Forager", "Warp Back"]
        } else {
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
}   