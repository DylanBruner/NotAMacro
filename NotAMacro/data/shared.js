export default new (class Consts {
    constructor() {
        const data = JSON.parse(FileLib.read(`${Config.modulesFolder}/NotAMacro/metadata.json`));
        
        this.version = data.version;
        this.debug   = data.debug;
    }
})();