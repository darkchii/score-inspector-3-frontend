import TaikoStrongableHitObject from "./TaikoStrongableHitObject";

class TaikoHit extends TaikoStrongableHitObject {
    constructor(data) {
        super(data);

        this.Type = data.type;
        this.DisplayColour = data.displayColour;
    }
}

export default TaikoHit;