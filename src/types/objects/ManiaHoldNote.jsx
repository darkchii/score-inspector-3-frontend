import ManiaHeadNote from "./ManiaHeadNote";
import ManiaHitObject from "./ManiaHitObject";
import ManiaTailNote from "./ManiaTailNote";

class ManiaHoldNote extends ManiaHitObject {
    constructor(data) {
        super(data);

        this.Head = data.head ? new ManiaHeadNote(data.head) : null;
        this.Tail = data.tail ? new ManiaTailNote(data.tail) : null;
    }
}

export default ManiaHoldNote;