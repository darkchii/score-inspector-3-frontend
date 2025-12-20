class RawBeatmapDifficulty {
    constructor(data) {
        this.DrainRate = data.drainRate;
        this.CircleSize = data.circleSize;
        this.OverallDifficulty = data.overallDifficulty;
        this.ApproachRate = data.approachRate;

        this.SliderMultiplier = data.sliderMultiplier;
        this.SliderTickRate = data.sliderTickRate;
    }
}

export default RawBeatmapDifficulty;