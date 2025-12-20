class BreakPeriod {
    constructor(data) {
        this.StartTime = data.startTime;
        this.EndTime = data.endTime;
        this.Duration = data.Duration;
        this.HasEffect = data.hasEffect || false;
    }
}

export default BreakPeriod;