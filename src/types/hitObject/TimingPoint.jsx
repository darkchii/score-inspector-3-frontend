class TimingPoint {
    constructor(time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects) {
        this.time = time;
        this.beatLength = beatLength;
        this.meter = meter;
        this.sampleSet = sampleSet;
        this.sampleIndex = sampleIndex;
        this.volume = volume;
        this.uninherited = uninherited;
        this.effects = effects;
    }

    static parseFromLine(line) {
        const parts = line.split(',');
        const time = parseFloat(parts[0]);
        const beatLength = parseFloat(parts[1]);
        const meter = parseInt(parts[2]);
        const sampleSet = parseInt(parts[3]);
        const sampleIndex = parseInt(parts[4]);
        const volume = parseInt(parts[5]);
        const uninherited = parts[6] === '1';
        const effects = parseInt(parts[7]);
        return new TimingPoint(time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects);
    }

    clone() {
        return new TimingPoint(
            this.time,
            this.beatLength,
            this.meter,
            this.sampleSet,
            this.sampleIndex,
            this.volume,
            this.uninherited,
            this.effects
        );
    }
}

export default TimingPoint;