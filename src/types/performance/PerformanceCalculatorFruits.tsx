import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import MathHelper from "../../util/MathHelper";
import { CalculateRateWithMods } from "../../util/ModHelper";
import PerformanceCalculator from "./PerformanceCalculator";
import type { IPerformanceCalculatorFruits, IScore } from "../types";

class PerformanceCalculatorFruits extends PerformanceCalculator implements IPerformanceCalculatorFruits {
    combo: number;
    num300: number;
    num100: number;
    num50: number;
    numKatu: number;
    numMiss: number;
    clockRate: number;
    preempt: number;
    constructor(score: IScore, overrides: any = {}) {
        super(score, overrides);

        this.combo = overrides?.combo ?? score.combo ?? 0;
        this.num300 = overrides?.statistics_great ?? score.statistics_great ?? 0;
        this.num100 = overrides?.statistics_large_tick_hit ?? score.statistics_large_tick_hit ?? 0;
        this.num50 = overrides?.statistics_small_tick_hit ?? score.statistics_small_tick_hit ?? 0;
        this.numKatu = overrides?.statistics_small_tick_miss ?? score.statistics_small_tick_miss ?? 0;
        this.numMiss = (overrides?.statistics_miss ?? score.statistics_miss ?? 0) + (overrides?.statistics_large_tick_miss ?? score.statistics_large_tick_miss ?? 0);

        let value = Math.pow(5.0 * Math.max(1.0, (score.attr_diff?.star_rating || 0) / 0.0049) - 4.0, 2.0) / 100000.0;

        let numTotalHits = this.TotalComboHits();

        let lengthBonus =
            0.95 + 0.3 * Math.min(1.0, numTotalHits / 2500.0) +
            (numTotalHits > 2500 ? Math.log10(numTotalHits / 2500.0) * 0.475 : 0.0);
        value *= lengthBonus;

        value *= Math.pow(0.97, this.numMiss);

        if ((score.attr_diff?.max_combo || 0) > 0) {
            value *= Math.min(Math.pow(this.combo, 0.35) / Math.pow((score.attr_diff?.max_combo || 0), 0.35), 1.0);
        }

        this.clockRate = CalculateRateWithMods(0, score.mods, score.attr_diff);

        this.preempt = BeatmapDifficultyInfo.DifficultyRange(score.beatmap_attributes.ar, [1800, 1200, 450]) / this.clockRate;

        let approachRate = this.preempt > 1200 ? -(this.preempt - 1800) / 120 : -(this.preempt - 1200) / 150 + 5;

        let approachRateFactor = 1.0;
        if (approachRate > 9.0) {
            approachRateFactor += 0.1 * (approachRate - 9.0);
        }
        if (approachRate > 10.0) {
            approachRateFactor += 0.1 * (approachRate - 10.0);
        } else if (approachRate < 8.0) {
            approachRateFactor += 0.025 * (8.0 - approachRate);
        }

        value *= approachRateFactor;

        if (score.mods.some(mod => mod.acronym === 'HD')) {
            if (approachRate <= 10.0) {
                value *= 1.05 + 0.075 * (10.0 - approachRate);
            } else if (approachRate > 10.0) {
                value *= 1.01 + 0.04 * (11.0 - Math.min(11, approachRate));
            }
        }

        if (score.mods.some(mod => mod.acronym === 'FL')) {
            value *= 1.35 * lengthBonus;
        }

        value *= Math.pow(this.Accuracy(), 5.5);

        if (score.mods.some(mod => mod.acronym === 'NF')) {
            value *= Math.max(0.90, 1.0 - 0.02 * this.numMiss);
        }

        this.totalPerformance = value;
    }

    Accuracy() {
        return this.TotalHits() === 0 ? 0 : MathHelper.clamp(this.TotalSuccessfulHits() / this.TotalHits(), 0, 1);
    }

    TotalHits() {
        return this.num50 + this.num100 + this.num300 + this.numMiss + this.numKatu;
    }

    TotalSuccessfulHits() {
        return this.num50 + this.num100 + this.num300;
    }

    TotalComboHits() {
        return this.numMiss + this.num100 + this.num300;
    }
}

export default PerformanceCalculatorFruits;
