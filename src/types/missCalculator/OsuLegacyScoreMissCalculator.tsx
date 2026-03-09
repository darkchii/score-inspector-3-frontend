import { IOsuLegacyScoreMissCalculator, IScore } from "../types";

class OsuLegacyScoreMissCalculator implements IOsuLegacyScoreMissCalculator {
    score: IScore;
    overrides: any;

    constructor(score: IScore, overrides: any = null) {
        this.score = score;
        this.overrides = overrides;
    }

    calculate() {
        if(this.score.attr_diff.max_combo === 0 || this.score.legacy_total_score === 0){
            return 0;
        }

        let combo = this.overrides?.combo ?? this.score.combo ?? 0;

        let scoreV1Multiplier = this.score.attr_diff.legacy_score_base_multiplier * this.getLegacyScoreMultiplier();
        let relevantComboPerObject = this.calculateRelevantComboPerObject();

        let maximumMissCount = this.calculateMaximumMissCount();

        let scoreObtainedDuringMaxCombo = this.calculateScoreAtCombo(combo, relevantComboPerObject, scoreV1Multiplier);
        let remainingScore = (this.score.legacy_total_score ?? 0) - scoreObtainedDuringMaxCombo;

        if(remainingScore <= 0){
            return maximumMissCount;
        }

        let remainingCombo = this.score.attr_diff.max_combo - combo;
        let expectedRemainingScore = this.calculateScoreAtCombo(remainingCombo, relevantComboPerObject, scoreV1Multiplier);

        let scoreBasedMissCount = expectedRemainingScore / remainingScore;

        scoreBasedMissCount = Math.max(scoreBasedMissCount, 1);

        return Math.min(scoreBasedMissCount, maximumMissCount);
    }

    calculateScoreAtCombo(combo: number, relevantComboPerObject: number, scoreV1Multiplier: number) {
        let countGreat = this.overrides?.statistics_great ?? this.score.statistics_great ?? 0;
        let countOk = this.overrides?.statistics_ok ?? this.score.statistics_ok ?? 0;
        let countMeh = this.overrides?.statistics_meh ?? this.score.statistics_meh ?? 0;
        let countMiss = this.overrides?.statistics_miss ?? this.score.statistics_miss ?? 0;
        let accuracy = this.overrides?.accuracy ?? this.score.accuracy ?? 0;

        let totalHits = countGreat + countOk + countMeh + countMiss;

        let estimatedObjects = combo / relevantComboPerObject - 1;

        let comboScore = relevantComboPerObject > 0 ? (2 * (relevantComboPerObject - 1) + (estimatedObjects - 1) * relevantComboPerObject) * estimatedObjects / 2 : 0;

        comboScore *= accuracy * 300 / 25 * scoreV1Multiplier;

        let objectsHit = (totalHits - countMiss) * combo / this.score.attr_diff.max_combo;

        let nonComboScore = (300 + this.score.attr_diff.nested_score_per_object) * accuracy * objectsHit;

        return comboScore + nonComboScore;
    }

    calculateMaximumMissCount() {
        let countMiss = this.overrides?.statistics_miss ?? this.score.statistics_miss ?? 0;
        let combo = this.overrides?.combo ?? this.score.combo ?? 0;

        if(this.score.local_beatmap.count_sliders <= 0){
            return countMiss;
        }

        let countOk = this.overrides?.statistics_ok ?? this.score.statistics_ok ?? 0;
        let countMeh = this.overrides?.statistics_meh ?? this.score.statistics_meh ?? 0;

        let totalImperfectHits = countMiss + countOk + countMeh;

        let missCount = 0;

        let fullComboThreshold = this.score.attr_diff.max_combo - 0.1 * this.score.local_beatmap.count_sliders;

        if(combo < fullComboThreshold) {
            missCount = Math.pow(fullComboThreshold / Math.max(1.0, combo), 2.5);
        }

        missCount = Math.min(missCount, totalImperfectHits);

        let maxPossibleSliderBreaks = Math.min(this.score.local_beatmap.count_sliders, (this.score.attr_diff.max_combo - combo) / 2);

        let scoreMissCount = this.overrides?.statistics_miss ?? this.score.statistics_miss ?? 0;

        let sliderBreaks = missCount - scoreMissCount;

        if(sliderBreaks > maxPossibleSliderBreaks){
            missCount = scoreMissCount + maxPossibleSliderBreaks;
        }

        return missCount;
    }

    calculateRelevantComboPerObject() {
        let comboScore = this.score.attr_diff.maximum_legacy_combo_score;

        comboScore /= 300 / 25 * this.score.attr_diff.legacy_score_base_multiplier;

        let result = (this.score.attr_diff.max_combo - 2) * this.score.attr_diff.max_combo;
        result /= Math.max(this.score.attr_diff.max_combo + 2 * (comboScore - 1), 1);

        return result;
    }

    getLegacyScoreMultiplier() {
        //bool
        const scoreV2 = this.score.mods.some(mod => mod.acronym === 'SV2');

        let multiplier = 1.0;

        for(const mod of this.score.mods) {
            switch(mod.acronym) {
                case 'NF':
                    multiplier *= scoreV2 ? 1.0 : 0.5;
                    break;
                case 'EZ':
                    multiplier *= 0.5;
                    break;
                case 'HT':
                case 'DC':
                    multiplier *= 0.3;
                    break;
                case 'HD':
                    multiplier *= 1.06;
                    break;
                case 'HR':
                    multiplier *= scoreV2 ? 1.10 : 1.06;
                    break;
                case 'DT':
                case 'NC':
                    multiplier *= scoreV2 ? 1.20 : 1.12;
                    break;
                case 'FL':
                    multiplier *= 1.12;
                    break;
                case 'SO':
                    multiplier *= 0.9;
                    break;
                case 'RX':
                case 'AP':
                    return 0;
            }
        }

        return multiplier;
    }
}

export default OsuLegacyScoreMissCalculator;