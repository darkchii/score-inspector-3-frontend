import type { IPerformanceCalculatorMania, IScore } from "../types";
import PerformanceCalculator from "./PerformanceCalculator";

class PerformanceCalculatorMania extends PerformanceCalculator implements IPerformanceCalculatorMania {
    countPerfect: number;
    countGreat: number;
    countGood: number;
    countOk: number;
    countMeh: number;
    countMiss: number;
    totalHits: number;
    accuracy: number;
    multiplier: number;
    difficultyValue: number;
    
    constructor(score: IScore, overrides: any = {}) {
        super(score, overrides);

        this.countPerfect = overrides?.statistics_perfect ?? score.statistics_perfect ?? 0;
        this.countGreat = overrides?.statistics_great ?? score.statistics_great ?? 0;
        this.countGood = overrides?.statistics_good ?? score.statistics_good ?? 0;
        this.countOk = overrides?.statistics_ok ?? score.statistics_ok ?? 0;
        this.countMeh = overrides?.statistics_meh ?? score.statistics_meh ?? 0;
        this.countMiss = overrides?.statistics_miss ?? score.statistics_miss ?? 0;
        this.totalHits = this.countPerfect + this.countGreat + this.countGood + this.countOk + this.countMeh + this.countMiss;
        this.accuracy = this.calculateCustomAccuracy();

        this.multiplier = 1.0;

        if(score.mods.some(mod => mod.acronym === 'NF')) {
            this.multiplier *= 0.75;
        }
        if(score.mods.some(mod => mod.acronym === 'EZ')) {
            this.multiplier *= 0.5;
        }

        this.difficultyValue = this.computeDifficultyValue(score);
        this.totalPerformance = this.difficultyValue * this.multiplier;
    }

    computeDifficultyValue(score: IScore) {
        let difficultyValue = 8.0 * Math.pow(Math.max(score.attr_diff.star_rating - 0.15, 0.05), 2.2)
            * Math.max(0, 5 * this.accuracy - 4)
            * (1 + 0.1 * Math.min(1, this.totalHits / 1500.0));
        
        return difficultyValue;
    }

    calculateCustomAccuracy() {
        if(this.totalHits === 0) {
            return 0;
        }

        return (this.countPerfect * 320 + this.countGreat * 300 + this.countGood * 200 + this.countOk * 100 + this.countMeh * 50) / (this.totalHits * 320);
    }
}

export default PerformanceCalculatorMania;
    