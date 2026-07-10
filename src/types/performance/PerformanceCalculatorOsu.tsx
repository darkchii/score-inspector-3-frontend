import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import HitWindowsOsu from "../hitWindows/HitWindowsOsu";
import MathHelper from "../../util/MathHelper";
import { CalculateRateWithMods, CalculateVisibilityBonus } from "../../util/ModHelper";
import OsuLegacyScoreMissCalculator from "../missCalculator/OsuLegacyScoreMissCalculator";
import PerformanceCalculator from "./PerformanceCalculator";
import type { IHitWindowsOsu, IPerformanceCalculatorOsu, IScore } from "../types";
import { HarmonicSkill } from "./HarmonicSkill";
import { DiffUtils } from "./DiffUtils";

const PERFORMANCE_BASE_MULTIPLIER = 1.12;
const PERFORMANCE_NORM_EXPONENT = 1.1;

class PerformanceCalculatorOsu extends PerformanceCalculator implements IPerformanceCalculatorOsu {
    usingScoreV2: boolean;
    accuracy: number
    combo: number;
    countGreat: number;
    countMeh: number
    countOk: number;
    countMiss: number;
    sliderTailHit: number;
    countSliderEndsDropped: number;
    countSliderTickMiss: number;
    effectiveMissCount: number;
    totalImperfectHits: number;
    totalHits: number;
    totalSuccessfulHits: number;
    clockRate: number;
    hitWindows: IHitWindowsOsu;
    greatHitWindow: number;
    okHitWindow: number;
    mehHitWindow: number;
    approachRate: number;
    overallDifficulty: number;
    comboBasedEstimatedMissCount: number;
    scoreBasedEstimatedMissCount: number | null;
    speedDeviation: number | null;
    aimValue: number;
    speedValue: number;
    accuracyValue: number;
    flashlightValue: number;
    readingValue: number;
    cognitionValue: number;
    multiplier: number;
    aimEstimatedSliderBreaks: number = 0;
    speedEstimatedSliderBreaks: number = 0;

    constructor(score: IScore, overrides: any = {}) {
        super(score, overrides);

        this.usingScoreV2 = score.mods.some(mod => mod.acronym === 'SV2');

        this.accuracy = overrides?.accuracy ?? score.accuracy ?? 0;
        this.combo = overrides?.combo ?? score.combo ?? 0;
        this.countGreat = overrides?.statistics_great ?? score.statistics_great ?? 0;
        this.countMeh = overrides?.statistics_meh ?? score.statistics_meh ?? 0;
        this.countOk = overrides?.statistics_ok ?? score.statistics_ok ?? 0;
        this.countMiss = overrides?.statistics_miss ?? score.statistics_miss ?? 0;
        this.sliderTailHit = overrides?.statistics_slider_tail_hit ?? score.statistics_slider_tail_hit ?? 0;
        this.countSliderEndsDropped = (score.local_beatmap?.count_sliders ?? 0) - this.sliderTailHit;
        this.countSliderTickMiss = overrides?.statistics_large_tick_miss ?? score.statistics_large_tick_miss ?? 0;
        this.effectiveMissCount = this.countMiss;
        this.totalImperfectHits = this.countOk + this.countMeh + this.countMiss;
        this.totalHits = this.countGreat + this.countMeh + this.countOk + this.countMiss;
        this.totalSuccessfulHits = this.countGreat + this.countMeh + this.countOk;

        // Missing step, but later: calculate beatmap attributes with mods applied
        this.clockRate = CalculateRateWithMods(0, score.mods, score.attr_diff);

        this.hitWindows = new HitWindowsOsu();
        this.hitWindows.SetDifficulty(score.beatmap_attributes.od); //temp od

        this.greatHitWindow = (this.hitWindows.WindowFor('great') ?? 0) / this.clockRate;
        this.okHitWindow = (this.hitWindows.WindowFor('ok') ?? 0) / this.clockRate;
        this.mehHitWindow = (this.hitWindows.WindowFor('meh') ?? 0) / this.clockRate;

        this.approachRate = this.CalculateRateAdjustedApproachRate(score.beatmap_attributes.ar, this.clockRate);
        this.overallDifficulty = (79.5 - this.greatHitWindow) / 6;

        this.comboBasedEstimatedMissCount = this.calculateComboBasedEstimatedMissCount(score);
        this.scoreBasedEstimatedMissCount = null;

        if (score.using_classic_slider_accuracy && !this.usingScoreV2 && (score.legacy_total_score ?? 0) > 0) {
            let legacyScoreMissCalculator = new OsuLegacyScoreMissCalculator(score, overrides);
            this.scoreBasedEstimatedMissCount = legacyScoreMissCalculator.calculate();

            this.effectiveMissCount = this.scoreBasedEstimatedMissCount ?? this.comboBasedEstimatedMissCount;
        } else {
            this.effectiveMissCount = this.comboBasedEstimatedMissCount;
        }

        this.effectiveMissCount = Math.max(this.countMiss, this.effectiveMissCount);
        this.effectiveMissCount = Math.min(this.totalHits, this.effectiveMissCount);

        if (this.effectiveMissCount > 0) {
            this.aimEstimatedSliderBreaks = this.calculateEstimatedSliderBreaks(score, score.attr_diff?.aim_top_weighted_slider_factor ?? 0);
            this.speedEstimatedSliderBreaks = this.calculateEstimatedSliderBreaks(score, score.attr_diff?.speed_top_weighted_slider_factor ?? 0);

        }

        this.multiplier = PERFORMANCE_BASE_MULTIPLIER;

        //if nf
        if (score.mods.some(mod => mod.acronym === 'NF')) {
            this.multiplier *= Math.max(0.90, 1.0 - 0.02 * this.effectiveMissCount);
        }

        //if so
        if (score.mods.some(mod => mod.acronym === 'SO') && this.totalHits > 0) {
            this.multiplier *= 1.0 - Math.pow((score.local_beatmap?.count_spinners ?? 0) / this.totalHits, 0.85);
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
        this.readingValue = this.computeReadingValue(score);

        this.cognitionValue = this.SumCognitionDifficulty(this.readingValue, this.flashlightValue);

        // this.totalPerformance = Math.pow(
        //     Math.pow(this.aimValue, 1.1) +
        //     Math.pow(this.speedValue, 1.1) +
        //     Math.pow(this.accuracyValue, 1.1) +
        //     Math.pow(this.flashlightValue, 1.1),
        //     1.0 / 1.1
        // ) * this.multiplier;
        this.totalPerformance = DiffUtils.Norm(PERFORMANCE_NORM_EXPONENT, [
            this.aimValue,
            this.speedValue,
            this.accuracyValue,
            this.cognitionValue
        ]) * this.multiplier;
    }

    computeAimValue(score: IScore) {
        if (score.mods.some(mod => mod.acronym === 'AP') || !score.attr_diff) {
            return 0.0;
        }

        let aimDifficulty = score.attr_diff.aim_difficulty;

        if (score.local_beatmap.count_sliders > 0 && score.attr_diff.aim_difficult_slider_count > 0) {
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

        let lengthBonus = 0.95 + 0.35 * Math.min(1.0, this.totalHits / 2000.0) + (this.totalHits > 2000 ? Math.log10(this.totalHits / 2000.0) * 0.5 : 0.0);

        aimValue *= lengthBonus;

        if (this.effectiveMissCount > 0) {
            let relevantMissCount = Math.min(this.effectiveMissCount + this.aimEstimatedSliderBreaks, this.totalImperfectHits + this.countSliderTickMiss);

            aimValue *= this.calculateMissPenalty(relevantMissCount, score.attr_diff.aim_difficult_strain_count);
        }


        if (score.mods.some(mod => mod.acronym === 'BL')) {
            aimValue *= 1.3 + (this.totalHits * (0.0016 / (1 + 2 * this.effectiveMissCount)) * Math.pow(this.accuracy, 16)) * (1 - 0.003 * score.beatmap_attributes.hp * score.beatmap_attributes.hp);
        } else if (score.mods.some(mod => mod.acronym === 'TC')) {
            aimValue *= 1.0 + this.calculateTraceableBonus(score.attr_diff.slider_factor);
        }

        aimValue *= this.accuracy;

        return aimValue;
    }

    computeSpeedValue(score: IScore) {
        if (score.mods.some(mod => mod.acronym === 'RX') || this.speedDeviation === null || !score.attr_diff) {
            return 0.0;
        }

        let speedValue = HarmonicSkill.DifficultyToPerformance(score.attr_diff.speed_difficulty);

        if (this.effectiveMissCount > 0) {
            let relevantMissCount = Math.min(this.effectiveMissCount + this.speedEstimatedSliderBreaks, this.totalImperfectHits + this.countSliderTickMiss);

            speedValue *= this.calculateMissPenalty(relevantMissCount, score.attr_diff.speed_difficult_strain_count);
        }

        if (score.mods.some(mod => mod.acronym === 'BL')) {
            speedValue *= 1.12;
        }

        let speedHighDeviationMultiplier = this.calculateSpeedHighDeviationNerf(score);
        speedValue *= speedHighDeviationMultiplier;

        let effectiveHitWindow = 20 * Math.pow(4 / score.attr_diff.speed_difficulty, 0.35);
        let effectiveAccuracy = DiffUtils.Erf(effectiveHitWindow / this.speedDeviation);

        speedValue *= Math.pow(effectiveAccuracy, 2.0);

        return speedValue;
    }

    computeAccuracyValue(score: IScore) {
        if (score.mods.some(mod => mod.acronym === 'RX')) {
            return 0.0;
        }

        let betterAccuracyPercentage;
        let amountHitObjectsWithAccuracy = score.local_beatmap.count_circles;
        if(!score.using_classic_slider_accuracy || this.usingScoreV2){
            amountHitObjectsWithAccuracy += score.local_beatmap.count_sliders;
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

        // accuracyValue *= Math.min(1.15, Math.pow(amountHitObjectsWithAccuracy / 1000.0, 0.3));
        accuracyValue *= amountHitObjectsWithAccuracy < 1000
            ? Math.pow(amountHitObjectsWithAccuracy / 1000.0, 0.3)
            : Math.pow(amountHitObjectsWithAccuracy / 1000.0, 0.1);

        if(score.mods.some(mod => mod.acronym === 'BL')) {
            accuracyValue *= 1.14
        } else if (score.mods.some(mod => mod.acronym === 'TC')) {
            accuracyValue *= 1+0.08 * DiffUtils.ReverseLerp(this.approachRate, 11.5, 10);
        }

        return accuracyValue;
    }

    computeFlashlightValue(score: IScore) {
        if (!score.mods.some(mod => mod.acronym === 'FL') || !score.attr_diff) {
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

    computeReadingValue(score: IScore) {
        let readingValue = HarmonicSkill.DifficultyToPerformance(score.attr_diff?.reading_difficulty ?? 0);

        if(this.effectiveMissCount > 0){
            readingValue *= this.calculateMissPenalty(this.effectiveMissCount + this.aimEstimatedSliderBreaks, score.attr_diff?.reading_difficult_note_count ?? 0);
        }

        readingValue *= Math.pow(this.accuracy, 3);

        return readingValue;
    }

    static DifficultyToPerformance(difficulty: number) : number {
        return Math.pow(5.0 * Math.max(1.0, difficulty / 0.0675) - 4.0, 3.0) / 100000.0;
    }

    calculateMissPenalty(missCount: number, difficultStrainCount: number) {
        return 0.93 / (missCount / (4 * Math.log(difficultStrainCount)) + 1);
    }

    calculateEstimatedSliderBreaks(score: IScore, topWeightedSliderFactor: number) {
        let nonMissMistakes = this.countOk + this.countMeh;

        if (!score.using_classic_slider_accuracy || nonMissMistakes == 0 || !score.attr_diff) {
            return 0.0;
        }

        let missedComboPercent = 1.0 - this.combo / score.attr_diff.max_combo;
        let estimatedSliderBreaks = Math.min(nonMissMistakes, this.effectiveMissCount * topWeightedSliderFactor);

        let nonMissMistakeAdjustment = ((nonMissMistakes - estimatedSliderBreaks) + 4.5) / (nonMissMistakes + 4);

        estimatedSliderBreaks *= DiffUtils.Smoothstep(this.effectiveMissCount, 1, 2);

        return estimatedSliderBreaks * nonMissMistakeAdjustment * DiffUtils.Logistic(missedComboPercent, 0.33, 15);
    }

    calculateSpeedHighDeviationNerf(score: IScore){
        if(this.speedDeviation === null || !score.attr_diff){
            return 0.0;
        }

        let speedValue = PerformanceCalculatorOsu.DifficultyToPerformance(score.attr_diff.speed_difficulty);

        let excessSpeedDifficultyCutoff = 100 + 220 * Math.pow(22 / this.speedDeviation, 6.5);

        if(speedValue <= excessSpeedDifficultyCutoff){
            return 1.0;
        }

        const scale = 50;
        let adjustedSpeedValue = scale * (Math.log((speedValue - excessSpeedDifficultyCutoff) / scale + 1) + excessSpeedDifficultyCutoff / scale);

        let lerp = 1 - DiffUtils.ReverseLerp(this.speedDeviation, 22, 27);
        adjustedSpeedValue = MathHelper.lerp(adjustedSpeedValue, speedValue, lerp);

        return adjustedSpeedValue / speedValue;
    }

    calculateSpeedDeviation(score: IScore) : number | null {
        if (this.totalSuccessfulHits === 0 || !score.attr_diff) {
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

    calculateDeviation(relevantCountGreat: number, relevantCountOk: number, relevantCountMeh: number) : number | null {
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
            deviation = this.greatHitWindow / (Math.sqrt(2) * DiffUtils.ErfInv(pLowerBound))

            let okHitWindowTailAmount = Math.sqrt(2 / Math.PI) * this.okHitWindow * Math.exp(-0.5 * Math.pow(this.okHitWindow / deviation, 2)) / (deviation * DiffUtils.Erf(this.okHitWindow / (Math.sqrt(2) * deviation)))

            deviation *= Math.sqrt(1 - okHitWindowTailAmount);
        } else {
            deviation = this.okHitWindow / Math.sqrt(3);
        }

        let mehVariance = (this.mehHitWindow * this.mehHitWindow + this.okHitWindow * this.mehHitWindow + this.okHitWindow * this.okHitWindow) / 3;

        deviation = Math.sqrt(((relevantCountGreat + relevantCountOk) * Math.pow(deviation, 2) + relevantCountMeh * mehVariance) / (relevantCountGreat + relevantCountOk + relevantCountMeh));

        return deviation;
    }

    CalculateRateAdjustedApproachRate(approachRate: number, clockRate: number) {
        let preempt = BeatmapDifficultyInfo.DifficultyRange(approachRate, [1800, 1200, 450]) / clockRate;
        return BeatmapDifficultyInfo.InverseDifficultyRange(preempt, 1800, 1200, 450);
    }

    CalculateRateAdjustedOverallDifficulty(overallDifficulty: number, clockRate: number) {
        let hitWindows = new HitWindowsOsu();
        hitWindows.SetDifficulty(overallDifficulty);

        let hitWindowGreat = hitWindows.WindowFor('great') / clockRate;

        return (79.5 - hitWindowGreat) / 6;
    }

    calculateComboBasedEstimatedMissCount(score: IScore) {
        if (score.local_beatmap.count_sliders <= 0) {
            return this.countMiss;
        }

        let missCount = this.countMiss;
        let maxCombo = score.attr_diff?.max_combo ?? score.beatmap.max_combo;

        if (score.using_classic_slider_accuracy) {
            let likelyMissedSliderEndPortion = 0.04 + 0.06 * Math.pow(Math.min(score.attr_diff?.aim_top_weighted_slider_factor ?? 0, 1), 2);

            let fullComboThreshold = maxCombo - Math.min(4 + likelyMissedSliderEndPortion * score.local_beatmap.count_sliders, score.local_beatmap.count_sliders);

            if (this.combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, this.combo);
            }

            missCount = Math.min(missCount, this.totalImperfectHits);

            let maxPossibleSliders = Math.min(score.local_beatmap.count_sliders, (maxCombo - this.combo) / 2);

            let sliderBreaks = missCount - this.countMiss;

            if (sliderBreaks > maxPossibleSliders) {
                missCount = this.countMiss + maxPossibleSliders;
            }
        } else {
            let fullComboThreshold = maxCombo - this.countSliderEndsDropped;

            if (this.combo < fullComboThreshold) {
                missCount = fullComboThreshold / Math.max(1, this.combo);
            }

            missCount = Math.min(missCount, this.countSliderTickMiss + this.countMiss);
        }

        return missCount;
    }

    getComboScalingFactor(score: IScore) {
        let max_combo = score.attr_diff?.max_combo ?? score.beatmap.max_combo;
        return max_combo <= 0 ? 1.0 : Math.min(Math.pow(this.combo, 0.8) / Math.pow(max_combo, 0.8), 1.0);
    }

    calculateTraceableBonus(sliderFactor: number) {
        let highApproachRateSliderVisibilityFactor = 0.5 + (Math.pow(sliderFactor, 6) / 2);
        let lowApproachRateSliderVisibilityFactor = Math.pow(sliderFactor, 6);

        let traceableBonus = 0.0275;
        traceableBonus += 0.025 * (12-Math.max(this.approachRate, 7)) * highApproachRateSliderVisibilityFactor;

        if(this.approachRate < 7) {
            traceableBonus += 0.025 * (7 - Math.max(this.approachRate, 0)) * lowApproachRateSliderVisibilityFactor;
        }

        if(this.approachRate < 6) {
            traceableBonus += 0.025 * (1 - Math.pow(1.5, this.approachRate)) * lowApproachRateSliderVisibilityFactor;
        }

        return traceableBonus;
    }

    SumCognitionDifficulty(readingValue: number, flashlightValue: number): number {
        if(readingValue <= 0){
            return flashlightValue;
        }

        if(flashlightValue <= 0){
            return readingValue;
        }

        return DiffUtils.Norm(PERFORMANCE_NORM_EXPONENT, [
            readingValue,
            flashlightValue * Math.min(Math.max(flashlightValue / readingValue, 0.25), 1.0)
        ]
        )
    }
}

export default PerformanceCalculatorOsu;