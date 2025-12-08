//Global performance class, will deal with the rulesets and calculations
//Overrides means adjusted score values (ie simulating SS on a score that was 94.6%)

import PerformanceCalculator from "./PerformanceCalculator";
import PerformanceCalculatorFruits from "./PerformanceCalculatorFruits";
import PerformanceCalculatorMania from "./PerformanceCalculatorMania";
import PerformanceCalculatorOsu from "./PerformanceCalculatorOsu";
import PerformanceCalculatorTaiko from "./PerformanceCalculatorTaiko";

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
                return new PerformanceCalculatorOsu(score);
            case 'taiko':
                return new PerformanceCalculatorTaiko(score);
            case 'fruits':
                return new PerformanceCalculatorFruits(score);
            case 'mania':
                return new PerformanceCalculatorMania(score);
            default:
                throw new Error(`Unknown ruleset: ${ruleset}`);
        }
    }
}

export default PerformancePoints;