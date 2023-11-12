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
}