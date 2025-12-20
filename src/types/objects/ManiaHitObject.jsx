import HitObject from "./HitObject";

class ManiaHitObject extends HitObject {
    constructor(data) {
        super(data);

        this.Column = data.column;
    }
}

export default ManiaHitObject;