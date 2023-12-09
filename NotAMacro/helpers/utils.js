const TOOLMAP = {
    'Fungi Cutter': 'Mushroom',
    'Cactus Knife': 'Cactus',
    'Newton Nether Warts Hoe': 'A/D',
    'Pythagorean Potato Hoe': 'A/D',
    'Euclid\'s Wheat Hoe': 'A/D',
    'Pumpkin Dicer': 'Pumpkin',
    'Melon Dicer': 'Melon',
    'Cocoa Chopper': 'Cocoa',
    'Turing Sugar Cane Hoe': 'Cane',

    'Treecapitator': 'Island Forager',
}

export default class Utils {
    static greaterVersion(v1, v2){
        if (v1 == v2) return false;
        let v1s = v1.split(".");
        let v2s = v2.split(".");
        for (let i = 0; i < v1s.length; i++){
            if (v1s[i] > v2s[i]) return true;
            if (v1s[i] < v2s[i]) return false;
        }
        return false;
    }

    static getLatestVersion(manifest) {
        let latest = manifest[0];
        for (let i = 1; i < manifest.length; i++){
            if (Utils.greaterVersion(manifest[i].version, latest.version)){
                latest = manifest[i];
            }
        }

        return latest;
    }

    static escapeUrl(url){
        return url.replace(/ /g, "%20");
    }

    static deriveMacroType(){
        const toolname = Player.getHeldItem().getName().removeFormatting();

        for (var [key, value] of Object.entries(TOOLMAP)){
            if (toolname.includes(key)) return value;
        }
        return null;
    }

    static createKeyPressHandler(callback) {
        let lastKeyPressTime = 0;
      
        return function () {
          const currentTime = Date.now();
          const timeDiff = currentTime - lastKeyPressTime;
          lastKeyPressTime = currentTime;
      
          callback(timeDiff > 300 || timeDiff < 0);
        };
    }

    static sleep(ms) {
        start = Date.now();
        while (Date.now() - start < ms);
        
    }
}