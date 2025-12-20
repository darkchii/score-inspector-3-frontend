import { KeysBitmask } from "./ReplayKeys";

class ReplayDataPoint {
    constructor(delta, time, x, y, keys) {
        this.delta = delta;
        this.time = time;
        this.x = x;
        this.y = y;
        this.keys_int = keys;
        this.keys = {
            M1: (keys & KeysBitmask.M1) !== 0,
            M2: (keys & KeysBitmask.M2) !== 0,
            K1: (keys & KeysBitmask.K1) !== 0,
            K2: (keys & KeysBitmask.K2) !== 0,
            Smoke: (keys & KeysBitmask.Smoke) !== 0,
        };
        this.isStart = 0; //if the previous point,
    }

    static fromArrayString(obj) {
        //string is in format "delta|x|y|keys,..."
        //split by comma
        const parts = obj.split(",");
        let lastTime = 0;
        return parts.map(part => {
            const [delta, x, y, keys] = part.split("|").map(Number);
            lastTime += delta;
            return new ReplayDataPoint(delta, lastTime, x, y, keys);
        });
    }
}

export default ReplayDataPoint;