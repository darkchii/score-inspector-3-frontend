//Global performance class, will deal with the rulesets and calculations
//Overrides means adjusted score values (ie simulating SS on a score that was 94.6%)

import PerformanceCalculator from "./PerformanceCalculator";
import PerformanceCalculatorOsu from "./PerformanceCalculatorOsu";

class PerformancePoints {
    constructor(score, overrides = {}) {
        if (score.diff_missing) {
            throw new Error("Cannot calculate performance for a score with missing or outdated diff data");
        }

        if(!score.beatmap) {
            throw new Error(`Cannot calculate performance for a score with missing beatmap data (id: ${score.id})`);
        }

        const calculator = PerformancePoints.getCalculator(score);

        if(!calculator) {
            // throw new Error(`Performance calculation for ruleset ${score.ruleset} is not implemented yet`);
            return;
        }

        this.calculator = calculator;
        //todo
    }

    static getCalculator(score) {
        switch (score.ruleset) {
            case 'osu':
                //not implemented yet
                // throw new Error("osu! performance calculation not implemented yet");
                return new PerformanceCalculatorOsu(score);
            case 'taiko':
                //not implemented yet
                // throw new Error("osu!taiko performance calculation not implemented yet");
                return null;
            case 'fruits':
                //not implemented yet
                // throw new Error("osu!catch performance calculation not implemented yet");
                return null;
            case 'mania':
                //not implemented yet
                // throw new Error("osu!mania performance calculation not implemented yet");
                return null;
            default:
                throw new Error(`Unknown ruleset: ${ruleset}`);
        }
    }
}

export default PerformancePoints;