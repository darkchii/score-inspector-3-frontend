import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import DifficultyCalculationUtils from "../DifficultyCalculationUtils";
import HitWindowsOsu from "../HitWindows/HitWindowsOsu";
import MathHelper from "../MathHelper";
import { CalculateRateWithMods, CalculateVisibilityBonus } from "../ModHelper";
import OsuLegacyScoreMissCalculator from "./MissCalculator/OsuLegacyScoreMissCalculator";
import PerformanceCalculator from "./PerformanceCalculator";

class PerformanceCalculatorOsu extends PerformanceCalculator {
    constructor(score, overrides = null) {
        super(score, overrides);

        this.usingScoreV2 = score.mods.some(mod => mod.acronym === 'SV2');

        this.accuracy = overrides?.accuracy ?? score.accuracy ?? 0;
        this.combo = overrides?.combo ?? score.combo ?? 0;
        this.countGreat = overrides?.statistics_great ?? score.statistics_great ?? 0;
        this.countMeh = overrides?.statistics_meh ?? score.statistics_meh ?? 0;
        this.countOk = overrides?.statistics_ok ?? score.statistics_ok ?? 0;
        this.countMiss = overrides?.statistics_miss ?? score.statistics_miss ?? 0;
        this.sliderTailHit = overrides?.statistics_slider_tail_hit ?? score.statistics_slider_tail_hit ?? 0;
        this.countSliderEndsDropped = score.beatmap.count_sliders - this.sliderTailHit;
        this.countSliderTickMiss = overrides?.statistics_large_tick_miss ?? score.statistics_large_tick_miss ?? 0;
        this.effectiveMissCount = this.countMiss;
        this.totalImperfectHits = this.countOk + this.countMeh + this.countMiss;
        this.totalHits = this.countGreat + this.countMeh + this.countOk + this.countMiss;
        this.totalSuccessfulHits = this.countGreat + this.countMeh + this.countOk;

        // Missing step, but later: calculate beatmap attributes with mods applied
        this.clockRate = CalculateRateWithMods(0, score.mods, score.attr_diff);

        this.hitWindows = new HitWindowsOsu();
        this.hitWindows.SetDifficulty(score.beatmap_attributes.od); //temp od

        this.greatHitWindow = this.hitWindows.WindowFor('great') / this.clockRate;
        this.okHitWindow = this.hitWindows.WindowFor('ok') / this.clockRate;
        this.mehHitWindow = this.hitWindows.WindowFor('meh') / this.clockRate;

        this.approachRate = this.CalculateRateAdjustedApproachRate(score.beatmap_attributes.ar, this.clockRate);
        this.overallDifficulty = this.CalculateRateAdjustedOverallDifficulty(score.beatmap_attributes.od, this.clockRate);

        this.comboBasedEstimatedMissCount = this.calculateComboBasedEstimatedMissCount(score);
        this.scoreBasedEstimatedMissCount = null;

        if (score.using_classic_slider_accuracy && score.legacy_total_score > 0) {
            let legacyScoreMissCalculator = new OsuLegacyScoreMissCalculator(score, overrides);
            this.scoreBasedEstimatedMissCount = legacyScoreMissCalculator.calculate();

            this.effectiveMissCount = this.scoreBasedEstimatedMissCount;
        } else {
            this.effectiveMissCount = this.comboBasedEstimatedMissCount;
        }

        this.effectiveMissCount = Math.max(this.countMiss, this.effectiveMissCount);
        this.effectiveMissCount = Math.min(this.totalHits, this.effectiveMissCount);

        this.multiplier = 1.14;

        //if nf
        if (score.mods.some(mod => mod.acronym === 'NF')) {
            this.multiplier *= Math.max(0.90, 1.0 - 0.02 * this.effectiveMissCount);
        }

        //if so
        if (score.mods.some(mod => mod.acronym === 'SO') && this.totalHits > 0) {
            this.multiplier *= 1.0 - Math.pow(score.beatmap.count_spinners - this.totalHits, 0.85);
        }

        //if rx
        if (score.mods.some(mod => mod.acronym === 'RX')) {
            let okMultiplier = 0.75 * Math.max(0.0, this.overallDifficulty > 0.0 ? 1 - this.overallDifficulty / 13.33 : 1.0);
            let mehMultiplier = Math.max(0.0, this.overallDifficulty > 0.0 ? 1 - Math.pow(this.overallDifficulty / 13.33, 5) : 1.0);

            this.effectiveMissCount = Math.min(this.effectiveMissCount + this.countOk * okMultiplier + this.countMeh * mehMultiplier, this.totalHits);
        }

        this.speedDeviation = this.calculateSpeedDeviation(score);

        this.aimValue = this.computeAimValue(score);
        this.speedValue = this.computeSpeedValue(score);
        this.accuracyValue = this.computeAccuracyValue(score);
        this.flashlightValue = this.computeFlashlightValue(score);

        this.totalPerformance = Math.pow(
            Math.pow(this.aimValue, 1.1) +
            Math.pow(this.speedValue, 1.1) +
            Math.pow(this.accuracyValue, 1.1) +
            Math.pow(this.flashlightValue, 1.1),
            1.0 / 1.1
        ) * this.multiplier;
    }

    computeAimValue(score) {
        if (score.mods.some(mod => mod.acronym === 'AP')) {
            return 0.0;
        }

        let aimDifficulty = score.attr_diff.aim_difficulty;

        if (score.beatmap.count_sliders > 0 && score.attr_diff.aim_difficult_slider_count > 0) {
            let estimateImproperlyFollowedDifficultSliders;

            if (score.using_classic_slider_accuracy) {
                let maximumPossibleDroppedSliders = this.totalImperfectHits;
                estimateImproperlyFollowedDifficultSliders = MathHelper.clamp(Math.min(maximumPossibleDroppedSliders, score.attr_diff.max_combo - this.combo), 0, score.attr_diff.aim_difficult_slider_count);
            } else {
                estimateImproperlyFollowedDifficultSliders = MathHelper.clamp(this.countSliderEndsDropped + this.countSliderTickMiss, 0, score.attr_diff.aim_difficult_slider_count);
            }

            let sliderNerfFactor = (1 - score.attr_diff.slider_factor) * Math.pow(1 - estimateImproperlyFollowedDifficultSliders / score.attr_diff.aim_difficult_slider_count, 3) + score.attr_diff.slider_factor;
            aimDifficulty *= sliderNerfFactor;
        }

        let aimValue = PerformanceCalculatorOsu.DifficultyToPerformance(aimDifficulty);

        let lengthBonus = 0.95 + 0.4 * Math.min(1.0, this.totalHits / 2000.0) + (this.totalHits > 2000 ? Math.log10(this.totalHits / 2000.0) * 0.5 : 0.0);

        aimValue *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            this.aimEstimatedSliderBreaks = this.calculateEstimatedSliderBreaks(score, score.attr_diff.aim_top_weighted_slider_factor);

            let relevantMissCount = Math.min(this.effectiveMissCount + this.aimEstimatedSliderBreaks, this.totalImperfectHits + this.countSliderTickMiss);

            aimValue *= this.calculateMissPenalty(relevantMissCount, score.attr_diff.aim_difficult_strain_count);
        }

        if (score.mods.some(mod => mod.acronym === 'BL')) {
            aimValue *= 1.3 + (this.totalHits * (0.0016 / (1 + 2 * this.effectiveMissCount)) * Math.pow(this.accuracy, 16)) * (1 - 0.003 * score.beatmap_attributes.hp * score.beatmap_attributes.hp);
        } else if (score.mods.some(mod => mod.acronym === 'TC')) {
            aimValue *= 1.0 + CalculateVisibilityBonus(score.mods, this.approachRate, 1, score.attr_diff.slider_factor);
        }

        aimValue *= this.accuracy;
        return aimValue;
    }

    computeSpeedValue(score) {
        if (score.mods.some(mod => mod.acronym === 'RX') || this.speedDeviation === null) {
            return 0.0;
        }

        let speedValue = PerformanceCalculatorOsu.DifficultyToPerformance(score.attr_diff.speed_difficulty);

        let lengthBonus = 0.95 + 0.4 * Math.min(1.0, this.totalHits / 2000.0) +
            (this.totalHits > 2000 ? Math.log10(this.totalHits / 2000.0) * 0.5 : 0.0);

        speedValue *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            let speedEstimatedSliderBreaks = this.calculateEstimatedSliderBreaks(score, score.attr_diff.speed_top_weighted_slider_factor);

            let relevantMissCount = Math.min(this.effectiveMissCount + speedEstimatedSliderBreaks, this.totalImperfectHits + this.countSliderTickMiss);

            speedValue *= this.calculateMissPenalty(relevantMissCount, score.attr_diff.speed_difficult_strain_count);
        }

        //if BL else TC
        if (score.mods.some(mod => mod.acronym === 'BL')) {
            speedValue *= 1.12;
        } else if (score.mods.some(mod => mod.acronym === 'TC')) {
            speedValue *= 1.0 + CalculateVisibilityBonus(score.mods, this.approachRate);
        }

        let speedHighDeviationMultiplier = this.calculateSpeedHighDeviationNerf(score);
        speedValue *= speedHighDeviationMultiplier;

        let relevantTotalDiff = Math.max(0, this.totalHits - score.attr_diff.speed_note_count);
        let relevantCountGreat = Math.max(0, this.countGreat - relevantTotalDiff);
        let relevantCountOk = Math.max(0, this.countOk - Math.max(0, relevantTotalDiff - this.countGreat));
        let relevantCountMeh = Math.max(0, this.countMeh - Math.max(0, relevantTotalDiff - this.countGreat - this.countOk));
        let relevantAccuracy = score.attr_diff.speed_note_count === 0 ? 0 : (relevantCountGreat * 6.0 + relevantCountOk * 2.0 + relevantCountMeh * 1.0) / (score.attr_diff.speed_note_count * 6.0);

        speedValue *= Math.pow((this.accuracy + relevantAccuracy) / 2.0, (14.5 - this.overallDifficulty) / 2);

        return speedValue;
    }

    computeAccuracyValue(score) {
        if (score.mods.some(mod => mod.acronym === 'RX')) {
            return 0.0;
        }

        let betterAccuracyPercentage;
        let amountHitObjectsWithAccuracy = score.beatmap.count_circles;
        if(!score.using_classic_slider_accuracy || this.usingScoreV2){
            amountHitObjectsWithAccuracy += score.beatmap.count_sliders;
        }

        if(amountHitObjectsWithAccuracy > 0){
            betterAccuracyPercentage = ((this.countGreat - Math.max(this.totalHits - amountHitObjectsWithAccuracy, 0)) * 6 + this.countOk * 2 + this.countMeh) / (amountHitObjectsWithAccuracy * 6);
        }else{
            betterAccuracyPercentage = 0.0;
        }

        if(betterAccuracyPercentage < 0){
            betterAccuracyPercentage = 0.0;
        }

        let accuracyValue = Math.pow(1.52163, this.overallDifficulty) * Math.pow(betterAccuracyPercentage, 24) * 2.83;

        accuracyValue *= Math.min(1.15, Math.pow(amountHitObjectsWithAccuracy / 1000.0, 0.3));

        if(score.mods.some(mod => mod.acronym === 'BL')) {
            accuracyValue *= 1.14
        } else if (score.mods.some(mod => mod.acronym === 'TC') || score.mods.some(mod => mod.acronym === 'HD')) {
            accuracyValue *= 1+0.08 * DifficultyCalculationUtils.ReverseLerp(this.approachRate, 11.5, 10);
        }

        if(score.mods.some(mod => mod.acronym === 'FL')){
            accuracyValue *= 1.02;
        }

        return accuracyValue;
    }

    computeFlashlightValue(score) {
        if (!score.mods.some(mod => mod.acronym === 'FL')) {
            return 0.0;
        }

        let flashlightValue = 25 * Math.pow(score.attr_diff.flashlight_difficulty, 2);
        if(this.effectiveMissCount > 0){
            flashlightValue *= 0.97 * Math.pow(1-Math.pow(this.effectiveMissCount/this.totalHits, 0.775), Math.pow(this.effectiveMissCount, 0.875));
        }
        flashlightValue *= this.getComboScalingFactor(score);

        flashlightValue *= 0.5 + this.accuracy / 2.0;

        return flashlightValue;
    }

    static DifficultyToPerformance(difficulty) {
        return Math.pow(5.0 * Math.max(1.0, difficulty / 0.0675) - 4.0, 3.0) / 100000.0;
    }

    calculateMissPenalty(missCount, difficultStrainCount) {
        return 0.96 / ((missCount / (4 * Math.pow(Math.log(difficultStrainCount), 0.94))) + 1);
    }

    calculateEstimatedSliderBreaks(score, topWeightedSliderFactor) {
        if (!score.using_classic_slider_accuracy || this.countOk === 0) {
            return 0.0;
        }

        let missedComboPercent = 1.0 - this.combo / score.attr_diff.max_combo;
        let estimatedSliderBreaks = Math.min(this.countOk, this.effectiveMissCount * topWeightedSliderFactor);

        let okAdjustment = ((this.countOk - estimatedSliderBreaks) + 0.5) / this.countOk;

        estimatedSliderBreaks *= DifficultyCalculationUtils.Smoothstep(this.effectiveMissCount, 1, 2);

        return estimatedSliderBreaks * okAdjustment * DifficultyCalculationUtils.Logistic(missedComboPercent, 0.33, 15);
    }

    calculateSpeedHighDeviationNerf(score){
        if(this.speedDeviation === null){
            return 0.0;
        }

        let speedValue = PerformanceCalculatorOsu.DifficultyToPerformance(score.attr_diff.speed_difficulty);

        let excessSpeedDifficultyCutoff = 100 + 220 * Math.pow(22 / this.speedDeviation, 6.5);

        if(speedValue <= excessSpeedDifficultyCutoff){
            return 1.0;
        }

        const scale = 50;
        let adjustedSpeedValue = scale * (Math.log((speedValue - excessSpeedDifficultyCutoff) / scale + 1) + excessSpeedDifficultyCutoff / scale);

        let lerp = 1 - DifficultyCalculationUtils.ReverseLerp(this.speedDeviation, 22, 27);
        adjustedSpeedValue = MathHelper.lerp(adjustedSpeedValue, speedValue, lerp);

        return adjustedSpeedValue / speedValue;
    }

    calculateSpeedDeviation(score) {
        if (this.totalSuccessfulHits === 0) {
            return 0.0;
        }

        let speedNoteCount = score.attr_diff.speed_note_count;
        speedNoteCount += (this.totalHits - score.attr_diff.speed_note_count) * 0.1;

        let relevantCountMiss = Math.min(this.countMiss, speedNoteCount);
        let relevantCountMeh = Math.min(this.countMeh, speedNoteCount - relevantCountMiss);
        let relevantCountOk = Math.min(this.countOk, speedNoteCount - relevantCountMiss - relevantCountMeh);
        let relevantCountGreat = Math.max(0, speedNoteCount - relevantCountMiss - relevantCountMeh - relevantCountOk);

        return this.calculateDeviation(relevantCountGreat, relevantCountOk, relevantCountMeh);
    }

    calculateDeviation(relevantCountGreat, relevantCountOk, relevantCountMeh) {
        if (relevantCountGreat + relevantCountOk + relevantCountMeh <= 0) {
            return null;
        }

        //what the fuck is this
        let n = Math.max(1, relevantCountGreat + relevantCountOk);
        let p = relevantCountGreat / n;

        const z = 2.32634787404;

        let pLowerBound = Math.min(p, (n * p + z * z / 2) / (n + z * z) - z / (n + z * z) * Math.sqrt(n * p * (1 - p) + z * z / 4));

        let deviation;

        if (pLowerBound > 0.01) {
            deviation = this.greatHitWindow / (Math.sqrt(2) * DifficultyCalculationUtils.ErfInv(pLowerBound))

            let okHitWindowTailAmount = Math.sqrt(2 / Math.PI) * this.okHitWindow * Math.exp(-0.5 * Math.pow(this.okHitWindow / deviation, 2)) / (deviation * DifficultyCalculationUtils.Erf(this.okHitWindow / (Math.sqrt(2) * deviation)))

            deviation *= Math.sqrt(1 - okHitWindowTailAmount);
        } else {
            deviation = this.okHitWindow / Math.sqrt(3);
        }

        let mehVariance = (this.mehHitWindow * this.mehHitWindow + this.okHitWindow * this.mehHitWindow + this.okHitWindow * this.okHitWindow) / 3;

        deviation = Math.sqrt(((relevantCountGreat + relevantCountOk) * Math.pow(deviation, 2) + relevantCountMeh * mehVariance) / (relevantCountGreat + relevantCountOk + relevantCountMeh));

        return deviation;
    }

    CalculateRateAdjustedApproachRate(approachRate, clockRate) {
        let preempt = BeatmapDifficultyInfo.DifficultyRange(approachRate, [1800, 1200, 450]) / clockRate;
        return BeatmapDifficultyInfo.InverseDifficultyRange(preempt, 1800, 1200, 450);
    }

    CalculateRateAdjustedOverallDifficulty(overallDifficulty, clockRate) {
        let hitWindows = new HitWindowsOsu();
        hitWindows.SetDifficulty(overallDifficulty);

        let hitWindowGreat = hitWindows.WindowFor('great') / clockRate;

        return (79.5 - hitWindowGreat) / 6;
    }

    calculateComboBasedEstimatedMissCount(score) {
        if (score.beatmap.count_sliders <= 0) {
            return this.countMiss;
        }

        let missCount = this.countMiss;

        if (score.using_classic_slider_accuracy) {
            let fullComboThreshold = score.attr_diff.max_combo - 0.1 * score.beatmap.count_sliders;

            if (this.combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, this.combo);
            }

            missCount = Math.min(missCount, this.totalImperfectHits);

            let maxPossibleSliders = Math.min(score.beatmap.count_sliders, (score.attr_diff.max_combo - this.combo) / 2);

            let sliderBreaks = missCount - this.countMiss;

            if (sliderBreaks > maxPossibleSliders) {
                missCount = this.countMiss + maxPossibleSliders;
            }
        } else {
            let fullComboThreshold = score.attr_diff.max_combo - this.countSliderEndsDropped;

            if (this.combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, this.combo);
            }

            missCount = Math.min(missCount, this.countSliderTickMiss + this.countMiss);
        }

        return missCount;
    }

    getComboScalingFactor(score) {
        return score.attr_diff.max_combo <= 0 ? 1.0 : Math.min(Math.pow(this.combo, 0.8) / Math.pow(score.attr_diff.max_combo, 0.8), 1.0);
    }
}

export default PerformanceCalculatorOsu;