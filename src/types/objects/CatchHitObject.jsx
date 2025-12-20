import HitObject from "./HitObject";

class CatchHitObject extends HitObject {
    constructor(data) {
        super(data);

        this.OriginalX = data.originalX;
        this.XOffset = data.xOffset;
        this.TimePreempt = data.timePreempt;
        this.IndexInBeatmap = data.indexInBeatmap;
        this.NewCombo = data.newCombo;
        this.IndexInCurrentCombo = data.indexInCurrentCombo;
        this.ComboIndex = data.comboIndex;
        this.ComboIndexWithOffsets = data.comboIndexWithOffsets;
        this.LastInCombo = data.lastInCombo;
        this.Scale = data.scale;
        this.RandomSeed = data.randomSeed;
    }
}

export default CatchHitObject;