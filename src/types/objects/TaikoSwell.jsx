import TaikoHitObject from "./TaikoHitObject";

class TaikoSwell extends TaikoHitObject {
    constructor(data) {
        super(data);
        
        this.EndTime = data.endTime;
        this.RequiredHits = data.requiredHits;
    }
}

export default TaikoSwell;