import { ASAP, LTTB } from "downsample";
import { GetGradeColor, GetRulesetId } from "./Helper";
import { ProfileRulesetScoreSet } from "./ProfileRulesetScoreSet";

const PERIODIC_SUFFIXES = ['daily', 'monthly'];
const LIMIT_CHART_SAMPLE_SIZE = 10000;

const getUTCDateString = (date, interval) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    if (interval === 'daily') {
        return `${year}-${month}-${day}`;
    } else if (interval === 'monthly') {
        return `${year}-${month}`;
    }
    throw new Error(`Invalid interval: ${interval}`);
}

export class ProfileRulesetStatistics {
    constructor(beatmaps, ruleset = null, generate_periodic = true) {
        //ProfileRulesetScoreSets
        this.beatmaps = beatmaps;
        this.beatmaps_with_converts = beatmaps;
        if (ruleset || ruleset === 0) {
            this.ruleset = ruleset;
            this.beatmaps = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset));
            this.beatmaps_with_converts = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset) || b.ruleset_id === 0);
        }


        this.beatmap_count = this.beatmaps.length;
        this.beatmap_count_with_converts = this.beatmaps_with_converts.length;

        this.beatmap_count_ranked = this.beatmaps.filter(b => b.status === 'ranked' || b.status === 'approved').length;
        this.beatmap_count_ranked_with_converts = this.beatmaps_with_converts.filter(b => b.status === 'ranked' || b.status === 'approved').length;

        //scores_set is the defacto statistics holder
        this.scores_set = new ProfileRulesetScoreSet();
        this.scores_set_by_pp = new ProfileRulesetScoreSet();
        this.scores_set_by_score = new ProfileRulesetScoreSet();

        this.completion = 0;
        this.completion_with_converts = 0;

        this.implied_playtime_seconds = 0;

        if(generate_periodic){
            this.generate_periodic = true;

            //these are also of type ProfileRulesetScoreSet, but with subset of scores given
            //this is based on UTC, not local time, so the values are the same for everyone
            this.periodic = {};
        }

        this.charts = {};
    }

    //add score
    addScore(score) {
        this.scores_set.addScore(score);

        if (score.highest_pp) {
            this.scores_set_by_pp.addScore(score);
        }

        if (score.highest_score) {
            this.scores_set_by_score.addScore(score);
        }

        this.implied_playtime_seconds += score.duration;
    }

    calculate() {
        //calculate completion
        this.completion = this.scores_set_by_pp.ranked_clears / this.beatmap_count_ranked;
        this.completion_with_converts = this.scores_set_by_pp.ranked_clears / this.beatmap_count_ranked_with_converts;

        this.scores_set.calculate();
        this.scores_set_by_pp.calculate();
        this.scores_set_by_score.calculate();

        this.calculateAccuracyDifficultyScatterChart();
        this.calculatePerformanceSpreadChart();
        this.calculateScoreSpreadChart();

        if(this.generate_periodic){
            //sort scores by ended_at ascending
            const sorted_scores = this.scores_set.scores.slice().sort((a, b) => a.ended_at - b.ended_at);

            for(const interval of PERIODIC_SUFFIXES){
                this.periodic[interval] = this.calculatePeriodic(sorted_scores, interval);
            }
        }
    }

    calculatePeriodic(sorted_scores, interval) {
        if (!PERIODIC_SUFFIXES.includes(interval)) {
            throw new Error(`Invalid periodic interval: ${interval}`);
        }

        let _set_data = {};

        if(sorted_scores.length === 0){
            return _set_data;
        }

        for (const score of sorted_scores) {
            const date_string = getUTCDateString(score.ended_at, interval);

            if(!_set_data[date_string]){
                _set_data[date_string] = new ProfileRulesetScoreSet();
            }

            _set_data[date_string].addScore(score);
        }

        //calculate all sets
        for(const date_string in _set_data){
            _set_data[date_string].calculate();
        }

        const firstDate = new Date(Date.UTC(sorted_scores[0].ended_at.getUTCFullYear(), sorted_scores[0].ended_at.getUTCMonth(), interval === 'daily' ? sorted_scores[0].ended_at.getUTCDate() : 1));
        const lastDate = getUTCDateString(sorted_scores[sorted_scores.length - 1].ended_at, interval);

        let currentDate = firstDate;
        while (true) {
            const date_string = getUTCDateString(currentDate, interval);
            if (date_string > lastDate) {
                break;
            }
            if (!_set_data[date_string]) {
                _set_data[date_string] = new ProfileRulesetScoreSet();
                _set_data[date_string].calculate(); //not really needed but creates the properties
            }
            //increment date
            if (interval === 'daily') {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            } else if (interval === 'monthly') {
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            }
        }

        //sort and give proper index keys ({index}_datestring)
        _set_data = Object.fromEntries(Object.entries(_set_data).sort((a, b) => a[0].localeCompare(b[0])));

        return _set_data;
    }

    calculateAccuracyDifficultyScatterChart(limit = LIMIT_CHART_SAMPLE_SIZE) {
        const data = [];
        let scores_sorted = this.scores_set.scores.slice().sort((a, b) => b.implied_total_score - a.implied_total_score);

        let i = 0;
        for (const score of scores_sorted) {
            if (!score.beatmap || (score.beatmap.status !== 'ranked' && score.beatmap.status !== 'approved')) {
                continue;
            }

            const accuracy = score.accuracy;
            const stars = score.attr_diff?.star_rating;

            if (accuracy !== null && stars !== null) {
                data.push({ x: stars, y: accuracy, id: score.id, color: GetGradeColor(score.grade) });
            }

            i++;

            if (i >= limit) {
                break;
            }
        }

        this.charts.accuracyDifficultyScatter = data;
    }

    calculatePerformanceSpreadChart(limit = LIMIT_CHART_SAMPLE_SIZE) {
        const data = [];
        //sort by score pp
        let scores_sorted = this.scores_set_by_pp.scores.slice().sort((a, b) => a.implied_pp - b.implied_pp).reverse();

        let i = 0;
        for (const score of scores_sorted) {
            //only ranked/approved beatmaps
            if (!score.beatmap || (score.beatmap.status !== 'ranked' && score.beatmap.status !== 'approved')) {
                continue;
            }

            const pp = score.implied_pp;

            if (pp !== null) {
                data.push({ x: i, y: pp, id: score.id, color: GetGradeColor(score.grade) });
            }

            i++;

            if (i >= limit) {
                break;
            }
        }

        //reverse data
        this.charts.performanceSpread = data;
    }

    calculateScoreSpreadChart(limit = LIMIT_CHART_SAMPLE_SIZE) {
        const data = [];
        //sort by score, bit complex, if ruleset = mania (3), we use .total_score, else .implied_total_score
        let scores_sorted = this.scores_set_by_score.scores.slice().sort((a, b) => {
            const scoreA = (a.ruleset_id === 3) ? a.total_score : a.implied_total_score;
            const scoreB = (b.ruleset_id === 3) ? b.total_score : b.implied_total_score;
            return scoreA - scoreB;
        }).reverse();

        let i = 0;
        for (const score of scores_sorted) {
            //only ranked/approved beatmaps
            if (!score.beatmap) {
                continue;
            }

            const score_value = (score.ruleset_id === 3) ? score.total_score : score.implied_total_score;

            if (score_value !== null) {
                data.push({ x: i, y: score_value, id: score.id, color: GetGradeColor(score.grade) });
            }

            i++;

            if (i >= limit) {
                break;
            }
        }

        //reverse data
        this.charts.scoreSpread = data;
    }
}
