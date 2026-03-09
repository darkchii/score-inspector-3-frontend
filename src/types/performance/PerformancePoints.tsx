//Global performance class, will deal with the rulesets and calculations
//Overrides means adjusted score values (ie simulating SS on a score that was 94.6%)

import { IPerformanceCalculator, IPerformancePoints, IScore } from "../types";
import PerformanceCalculatorFruits from "./PerformanceCalculatorFruits";
import PerformanceCalculatorMania from "./PerformanceCalculatorMania";
import PerformanceCalculatorOsu from "./PerformanceCalculatorOsu";
import PerformanceCalculatorTaiko from "./PerformanceCalculatorTaiko";

class PerformancePoints implements IPerformancePoints {
    pp: number;
    calculator: IPerformanceCalculator;

    constructor(score: IScore, options: any = {}) {
        if (score.diff_missing) {
            throw new Error("Cannot calculate performance for a score with missing or outdated diff data");
        }

        if (!score.beatmap) {
            throw new Error(`Cannot calculate performance for a score with missing beatmap data (id: ${score.id})`);
        }

        let overrides = null;
        if (options.generate_ss) {
            overrides = PerformancePoints.getOverridesFor(score, 'ss');
        }

        const calculator = PerformancePoints.getCalculator(score, overrides);

        if (!calculator) {
            // throw new Error(`Performance calculation for ruleset ${score.ruleset} is not implemented yet`);
            return;
        }

        this.calculator = calculator;

        this.pp = this.calculator.totalPerformance;
    }

    static getCalculator(score: IScore, overrides: any = null) {
        switch (score.ruleset) {
            case 'osu':
                return new PerformanceCalculatorOsu(score, overrides);
            case 'taiko':
                return new PerformanceCalculatorTaiko(score, overrides);
            case 'fruits':
                return new PerformanceCalculatorFruits(score, overrides);
            case 'mania':
                return new PerformanceCalculatorMania(score, overrides);
            default:
                throw new Error(`Unknown ruleset: ${score.ruleset}`);
        }
    }

    static getOverridesFor(score: IScore, option: string) {
        let overrides: any = {};
        switch (option) {
            case 'ss':
                overrides.combo = score.attr_diff.max_combo;
                overrides.accuracy = 1.0;
                overrides.statistics_perfect = score.maximum_statistics_perfect || 0;
                overrides.statistics_great = score.maximum_statistics_great || 0;
                overrides.statistics_good = score.maximum_statistics_good || 0;
                overrides.statistics_ok = score.maximum_statistics_ok || 0;
                overrides.statistics_meh = score.maximum_statistics_meh || 0;
                overrides.statistics_miss = score.maximum_statistics_miss || 0;
                overrides.statistics_ignore_hit = score.maximum_statistics_ignore_hit || 0;
                overrides.statistics_ignore_miss = score.maximum_statistics_ignore_miss || 0;
                overrides.statistics_slider_tail_hit = score.maximum_statistics_slider_tail_hit || 0;
                overrides.statistics_large_tick_hit = score.maximum_statistics_large_tick_hit || 0;
                overrides.statistics_large_tick_miss = score.maximum_statistics_large_tick_miss || 0;
                overrides.statistics_large_bonus = score.maximum_statistics_large_bonus || 0;
                overrides.statistics_small_bonus = score.maximum_statistics_small_bonus || 0;
                overrides.statistics_small_tick_hit = score.maximum_statistics_small_tick_hit || 0;
                overrides.statistics_legacy_combo_increase = score.maximum_statistics_legacy_combo_increase || 0; //unused?
                break;
            default:
                break;
        }

        return overrides;
    }
}

export default PerformancePoints;