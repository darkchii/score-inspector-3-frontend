import OsuHitObject from "./OsuHitObject";

class OsuSlider extends OsuHitObject {
    constructor(data) {
        super(data);

        this.RepeatCount = data.repeatCount;
        this.SpanDuration = data.spanDuration;
        this.Velocity = data.velocity;
        this.TickDistance = data.tickDistance;
        this.TickDistanceMultiplier = data.tickDistanceMultiplier;
    }
}

export default OsuSlider;