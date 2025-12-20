import OsuHitObject from "./OsuHitObject";

class OsuSpinner extends OsuHitObject {
    constructor(data) {
        super(data);

        this.EndTime = data.endTime;
        this.SpinsRequired = data.spinsRequired;
        this.SpinsRequiredForBonus = data.spinsRequiredForBonus;
        this.MaximumBonusSpins = data.maximumBonusSpins;

        this.StackOffset = { x: 0, y: 0 }; //Spinners have no stack offset
    }
}

export default OsuSpinner;