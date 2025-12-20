import TaikoHitObject from "./TaikoHitObject";

class TaikoStrongableHitObject extends TaikoHitObject {
    constructor(data) {
        super(data);

        this.IsStrong = data.isStrong;
    }
}

export default TaikoStrongableHitObject;