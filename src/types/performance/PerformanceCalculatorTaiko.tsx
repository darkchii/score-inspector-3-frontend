import DifficultyCalculationUtils from "../../util/DifficultyCalculationUtils";
import HitWindowsTaiko from "../hitWindows/HitWindowsTaiko";
import { CalculateRateWithMods } from "../../util/ModHelper";
import PerformanceCalculator from "./PerformanceCalculator";
import Score from "../Score";
import type { IHitWindowsTaiko } from "../types";

class PerformanceCalculatorTaiko extends PerformanceCalculator {
    countGreat: number;
    countOk: number;
    countMeh: number;
    countMiss: number;
    totalHits: number;
    accuracy: number;
    clockRate: number
    greatHitWindow: number;
    estimatedUnstableRate: number | null;
    totalDifficultHits: number;
    difficultyValue: number
    accuracyValue: number;
    totalPerformance: number;
    hitWindows: IHitWindowsTaiko;

    constructor(score: Score, overrides: any = {}) {
        super(score, overrides);

        this.countGreat = overrides?.statistics_great ?? score.statistics_great ?? 0;
        this.countOk = overrides?.statistics_ok ?? score.statistics_ok ?? 0;
        this.countMeh = overrides?.statistics_meh ?? score.statistics_meh ?? 0;
        this.countMiss = overrides?.statistics_miss ?? score.statistics_miss ?? 0;
        this.totalHits = this.countGreat + this.countOk + this.countMeh + this.countMiss;
        this.accuracy = overrides?.accuracy ?? score.accuracy ?? 0;

        this.clockRate = CalculateRateWithMods(0, score.mods, score.attr_diff);

        this.hitWindows = new HitWindowsTaiko();
        this.hitWindows.SetDifficulty(score.beatmap_attributes.od);

        this.greatHitWindow = this.hitWindows.WindowFor('great') / this.clockRate;

        this.estimatedUnstableRate = (this.countGreat === 0 || this.greatHitWindow <= 0)
            ? null
            : this.computeDeviationUpperBound(this.countGreat / this.totalHits) * 10;

        this.totalDifficultHits = this.totalHits * score.attr_diff.consistency_factor;

        let isConvert = score.local_beatmap.ruleset_id !== 1;
        let isClassic = score.mods.some(mod => mod.acronym === 'CL');

        this.difficultyValue = this.computeDifficultyValue(score, isConvert, isClassic) * 1.08;
        this.accuracyValue = this.computeAccuracyValue(score, isConvert) * 1.1;
        this.totalPerformance = this.difficultyValue + this.accuracyValue;
    }

    computeAccuracyValue(score, isConvert) {
        if(this.greatHitWindow <= 0 || this.estimatedUnstableRate === null) {
            return 0.0;
        }

        let accuracyValue = 470 * Math.pow(0.9885, this.estimatedUnstableRate);

        accuracyValue *= 1 + Math.pow(50 / this.estimatedUnstableRate, 2) * Math.pow(score.attr_diff.star_rating, 2.8) / 600;

        if (score.mods.some(mod => mod.acronym === 'HD') && !isConvert) {
            accuracyValue *= 1.075;
        }

        accuracyValue *= 1 + 0.3 * this.totalDifficultHits / (this.totalDifficultHits + 4000);

        let memoryLengthBonus = Math.min(1.15, Math.pow(this.totalHits / 1500, 0.3));

        if (score.mods.some(mod => mod.acronym === 'FL') && score.mods.some(mod => mod.acronym === 'HD') && !isConvert) {
            accuracyValue *= Math.max(1.0, 1.05 * memoryLengthBonus);
        }

        return accuracyValue;
    }

    computeDifficultyValue(score, isConvert, isClassic) {
        if (this.estimatedUnstableRate === null || this.totalDifficultHits === 0) {
            return 0.0;
        }

        let rhythmExpectedUnstableRate = this.computeDeviationUpperBound(1.0) * 10;
        let rhythmMaximumUnstableRate = this.computeDeviationUpperBound(0.8) * 10;

        let rhythmFactor = DifficultyCalculationUtils.ReverseLerp(score.attr_diff.rhythm_difficulty / score.attr_diff.star_rating, 0.15, 0.4);

        let rhythmPentalty = 1 - DifficultyCalculationUtils.Logistic(
            this.estimatedUnstableRate,
            (rhythmExpectedUnstableRate + rhythmMaximumUnstableRate) / 2,
            10 / (rhythmMaximumUnstableRate - rhythmExpectedUnstableRate),
            0.25 * Math.pow(rhythmFactor, 3)
        );

        let baseDifficulty = 5 * Math.max(1.0, score.attr_diff.star_rating * rhythmPentalty / 0.110) - 4.0;
        let difficultyValue = Math.min(Math.pow(baseDifficulty, 3) / 69052.51, Math.pow(baseDifficulty, 2.25) / 1250);

        difficultyValue *= 1 + 0.10 * Math.max(0, score.attr_diff.star_rating - 10);

        let lengthBonus = 1 + 0.25 * this.totalDifficultHits / (this.totalDifficultHits + 4000.0);
        difficultyValue *= lengthBonus;

        let missPenalty = 0.97 + 0.03 * this.totalDifficultHits / (this.totalDifficultHits + 1500);
        difficultyValue *= Math.pow(missPenalty, this.countMiss);

        if (score.mods.some(mod => mod.acronym === 'HD')) {
            let hiddenBonus = isConvert ? 0.025 : 0.1;

            if (!score.mods.some(mod => mod.acronym === 'FL')) {
                if(!isClassic) {
                    hiddenBonus *= 0.2;
                }

                if(score.mods.some(mod => mod.acronym === 'EZ') && isClassic) {
                    hiddenBonus *= 0.5;
                }
            }

            difficultyValue *= 1 + hiddenBonus;
        }

        if (score.mods.some(mod => mod.acronym === 'FL')) {
            difficultyValue *= Math.max(1, 1.050 - Math.min(score.attr_diff.mono_stamina_factor / 50, 1) * lengthBonus);
        }

        let monoAccScalingExponent = 2 + score.attr_diff.mono_stamina_factor;
        let monoAccScalingShift = 500 - 100 * (score.attr_diff.mono_stamina_factor * 3);

        return difficultyValue * Math.pow(DifficultyCalculationUtils.Erf(monoAccScalingShift / (Math.sqrt(2) * this.estimatedUnstableRate)), monoAccScalingExponent);
    }

    computeDeviationUpperBound(accuracy) {
        const z = 2.32634787404;

        let n = this.totalHits;

        let p = accuracy;

        let pLowerBound = (n * p + z * z / 2) / (n + z * z) - z / (n + z * z) * Math.sqrt(n * p * (1 - p) + z * z / 4);

        return this.greatHitWindow / (Math.sqrt(2) * DifficultyCalculationUtils.ErfInv(pLowerBound));
    }
}

export default PerformanceCalculatorTaiko;