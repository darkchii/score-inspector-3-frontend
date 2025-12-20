import HitObject from "./HitObject";

class OsuHitObject extends HitObject {
    constructor(data) {
        super(data);

        this.Position = { x: data.position.x, y: data.position.y };
        this.StackedPosition = { x: data.stackedPosition.x, y: data.stackedPosition.y };
        this.EndPosition = { x: data.endPosition?.x ?? this.Position.x, y: data.endPosition?.y ?? this.Position.y };
        this.StackedEndPosition = { x: data.stackedEndPosition?.x ?? this.StackedPosition.x, y: data.stackedEndPosition?.y ?? this.StackedPosition.y };
        this.StackOffset = { x: data.stackOffset.x, y: data.stackOffset.y };

        this.TimePreempt = data.timePreempt;
        this.TimeFadeIn = data.timeFadeIn;

        this.Radius = data.radius;
        this.Scale = data.scale;
        this.NewCombo = data.newCombo;
        this.ComboOffset = data.comboOffset;
        this.IndexInCurrentCombo = data.indexInCurrentCombo;
        this.ComboIndex = data.comboIndex;
        this.ComboIndexWithOffsets = data.comboIndexWithOffsets;
        this.LastInCombo = data.lastInCombo;
    }
}

export default OsuHitObject;