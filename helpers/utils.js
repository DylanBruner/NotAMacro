export default class Utils {
    static greaterVersion(v1, v2){
        v1 = v1.split(".").map((v) => parseInt(v));
        v2 = v2.split(".").map((v) => parseInt(v));

        return v1[0] > v2[0] || v1[1] > v2[1] || v1[2] > v2[2];
    }
}