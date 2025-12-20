import CatchHitObject from "./CatchHitObject";

class PalpableCatchHitObject extends CatchHitObject {
    constructor(data) {
        super(data);

        this.DistanceToHyperDash = data.distanceToHyperDash;
        this.HyperDash = data.hyperDash;
    }
}

export default PalpableCatchHitObject;