import { GetGradeColor, GetRulesetId } from "../util/Helper";
import { CalculateBonusPerformance, CalculateRawPerformance } from "../util/ScoreHelper";
import { ProfileRulesetScoreSet } from "./ProfileRulesetScoreSet";
import { ProfileRulesetStatisticsPacks } from "./ProfileRulesetStatisticsPacks";
import SessionCollection from "./SessionCollection";

const PERIODIC_SUFFIXES = ['daily', 'monthly', 'yearly'];
const PERIODIC_SUFFIXES_CHARTS = ['monthly', 'yearly'];
const LIMIT_CHART_SAMPLE_SIZE = 10000;

const DATE_ISO_FORMAT_SLICES = {
    'daily': 10,
    'monthly': 7,
    'yearly': 4,
}

const DATE_ISO_FORMAT_STR = {
    'daily': "YYYY-MM-DD",
    'monthly': "YYYY-MM",
    'yearly': "YYYY",
}

const getUTCDateString = (date, interval) => {
    if (!DATE_ISO_FORMAT_SLICES[interval]) {
        throw new Error(`Invalid interval for date string: ${interval}`);
    }
    return date.toISOString().slice(0, DATE_ISO_FORMAT_SLICES[interval]);
}

export class ProfileRulesetStatistics {
    constructor(beatmaps, packs, ruleset = null, generate_periodic = true, without_loved = false) {
        this.without_loved = without_loved;

        //ProfileRulesetScoreSets
        this.beatmaps = beatmaps;
        this.beatmaps_with_converts = [];
        if (ruleset || ruleset === 0) {
            this.ruleset = ruleset;
            this.beatmaps = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset));
            this.beatmaps_with_converts = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset) || b.ruleset_id === 0);
        }

        if(this.without_loved) {
            this.beatmaps = this.beatmaps.filter(b => b.status !== 'loved');
            this.beatmaps_with_converts = this.beatmaps_with_converts.filter(b => b.status !== 'loved');
        }

        this.beatmaps_map = {};
        this.beatmaps_with_converts_map = {};

        for (const beatmap of this.beatmaps) {
            this.beatmaps_map[beatmap.beatmap_id] = beatmap;
        }

        for (const beatmap of this.beatmaps_with_converts) {
            this.beatmaps_with_converts_map[beatmap.beatmap_id] = beatmap;
        }

        this.beatmap_count = this.beatmaps.length;
        this.beatmap_count_with_converts = this.beatmaps_with_converts.length;

        this.beatmap_count_ranked = this.beatmaps.filter(b => b.status === 'ranked' || b.status === 'approved').length;
        this.beatmap_count_ranked_with_converts = this.beatmaps_with_converts.filter(b => b.status === 'ranked' || b.status === 'approved').length;

        //scores_set is the defacto statistics holder
        this.scores_set = new ProfileRulesetScoreSet();
        this.scores_set_by_pp = new ProfileRulesetScoreSet();
        this.scores_set_by_score = new ProfileRulesetScoreSet();

        this.pack_statistics = new ProfileRulesetStatisticsPacks(this.beatmaps, packs, this.ruleset);

        this.completion = 0;
        this.completion_with_converts = 0;

        this.completion_statistics = {};

        this.implied_playtime_seconds = 0;

        if (generate_periodic) {
            this.generate_periodic = true;

            //these are also of type ProfileRulesetScoreSet, but with subset of scores given
            //this is based on UTC, not local time, so the values are the same for everyone
            this.periodic = {};
            this.periodic_by_pp = {};
            this.periodic_by_score = {};
            this.periodic_graph_data = {};
            this.periodic_by_year = {}; //same as periodic but grouped by year
        }

        this.charts = {};
    }

    //add score
    addScore(score) {
        if(!this.include_loved) {
            const beatmap = this.beatmaps_map[score.beatmap_id];
            if(!beatmap || beatmap.status === 'loved') {
                return;
            }
        }

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
        //process is_played for beatmaps
        //first get the map
        const beatmapMap = this.getBeatmapsMap();
        for (const score of this.scores_set_by_score.scores) {
            const beatmap = beatmapMap[score.beatmap_id];
            if (beatmap) {
                //very basic score data only, primarily for pack info
                beatmap.is_played = true;
                beatmap.score_data = {
                    grade: score.grade,
                    is_fc: score.is_fc,
                    is_pfc: score.combo === score.max_combo,
                    score_id: score.id,
                }
            }
        }

        //process packs
        this.pack_statistics.processScores(this.scores_set.scores, this.beatmaps);

        //calculate completion
        this.completion = this.scores_set_by_pp.ranked_clears / this.beatmap_count_ranked;
        this.completion_with_converts = this.scores_set_by_pp.ranked_clears / this.beatmap_count_ranked_with_converts;

        this.scores_set.calculate();
        this.scores_set_by_pp.calculate();
        this.scores_set_by_score.calculate();

        this.calculateAccuracyDifficultyScatterChart();
        this.calculatePerformanceSpreadChart();
        this.calculateScoreSpreadChart();

        this.calculateCompletionStatistics();

        if (this.generate_periodic) {
            //sort scores by ended_at ascending
            const sorted_scores = this.scores_set.scores.slice().sort((a, b) => a.ended_at - b.ended_at);
            const sorted_scores_by_pp = this.scores_set_by_pp.scores.slice().sort((a, b) => a.ended_at - b.ended_at);
            const sorted_scores_by_score = this.scores_set_by_score.scores.slice().sort((a, b) => a.ended_at - b.ended_at);

            for (const interval of PERIODIC_SUFFIXES) {
                this.periodic[interval] = this.calculatePeriodic(sorted_scores, interval);
                this.periodic_by_pp[interval] = this.calculatePeriodic(sorted_scores_by_pp, interval);
                this.periodic_by_score[interval] = this.calculatePeriodic(sorted_scores_by_score, interval);
            }

            this.calculatePeriodicGraphData();

            //apply yearly grouping for every periodic interval
            //ie this.periodic_by_year['2023'] = { 'monthly': {...}, 'daily': {...} }
            //each interval starts with YYYY-, so we can easily group them
            for (const interval of PERIODIC_SUFFIXES) {
                for (const date_string in this.periodic[interval]) {
                    const year = date_string.split('-')[0];
                    if (!this.periodic_by_year[year]) {
                        this.periodic_by_year[year] = {};
                    }
                    if (!this.periodic_by_year[year][interval]) {
                        this.periodic_by_year[year][interval] = {};
                    }
                    this.periodic_by_year[year][interval][date_string] = this.periodic[interval][date_string];
                }
            }
        }
    }

    calculatePeriodicGraphData() {
        //stores only raw number data, so no ProfileRulesetScoreSet (it's too heavy)

        //ordered by date string (use Date objects to actually sort it)
        let ordered_dates = {};
        for (const interval of PERIODIC_SUFFIXES_CHARTS) {
            ordered_dates[interval] = Object.keys(this.periodic[interval]).sort().map(date_string => {
                return {
                    date_string: date_string,
                    set: this.periodic[interval][date_string],
                    set_by_pp: this.periodic_by_pp[interval][date_string],
                    set_by_score: this.periodic_by_score[interval][date_string],
                };
            });
        }

        //same structure
        //this.periodic_graph_data[interval]['incremental'][date] = { clears, scores, ...} (incremental and cumulative)
        for (const interval of PERIODIC_SUFFIXES_CHARTS) {
            this.periodic_graph_data[interval] = {
                incremental: {},
                cumulative: {},
                average: {},
                highest: {},
                median: {},
            }

            for (const entry of ordered_dates[interval]) {
                let _incremental_implied_score = 0;
                let _incremental_implied_score_ss = 0;
                let _incremental_lazer_score = 0;
                let _incremental_lazer_score_ss = 0;
                let _incremental_pp = 0;
                let _incremental_length_seconds = 0;
                let _incremental_grades = {
                    'XH': 0,
                    'X': 0,
                    'SH': 0,
                    'S': 0,
                    'A': 0,
                    'B': 0,
                    'C': 0,
                    'D': 0,
                }
                for (const score of entry.set || []) {
                    if (!score.beatmap) {
                        return;
                    }

                    _incremental_implied_score += score.implied_total_score || 0;
                    _incremental_lazer_score += score.total_score || 0;
                    if (score.is_ss) {
                        _incremental_implied_score_ss += score.implied_total_score || 0;
                        _incremental_lazer_score_ss += score.total_score || 0;
                    }
                    _incremental_pp += score.implied_pp || 0;
                    _incremental_length_seconds += score.duration || 0;

                    const grade = score.grade;
                    _incremental_grades[grade] = (_incremental_grades[grade] || 0) + 1;
                }
                this.periodic_graph_data[interval].incremental[entry.date_string] = {
                    clears: entry.set_by_pp?.length || 0,
                    scores: entry.set?.length || 0,
                    implied_score: _incremental_implied_score || 0,
                    implied_score_ss: _incremental_implied_score_ss || 0,
                    lazer_score: _incremental_lazer_score || 0,
                    lazer_score_ss: _incremental_lazer_score_ss || 0,
                    pp: _incremental_pp || 0,

                    length_seconds: _incremental_length_seconds || 0,

                    grades_xh: _incremental_grades['XH'] || 0,
                    grades_x: _incremental_grades['X'] || 0,
                    grades_sh: _incremental_grades['SH'] || 0,
                    grades_s: _incremental_grades['S'] || 0,
                    grades_a: _incremental_grades['A'] || 0,
                    grades_b: _incremental_grades['B'] || 0,
                    grades_c: _incremental_grades['C'] || 0,
                    grades_d: _incremental_grades['D'] || 0,
                };
            }

            let _cumulative_scores = [];
            for (const entry of ordered_dates[interval]) {
                let _current_scores = entry.set || [];
                _cumulative_scores = _cumulative_scores.concat(_current_scores);

                //this system makes sure that overwritten scores still count at the time they were achieved,
                //but not anymore if overwritten later (this can show scores that were fixed later for better grade or something)
                //get all scores unique by beatmap_id where implied_pp is highest
                let _current_scores_by_pp_map = {};
                let _current_scores_by_score_map = {};

                for (const score of _cumulative_scores) {
                    if (!score.beatmap) {
                        return;
                    }

                    const beatmap_id = score.beatmap_id;

                    if (!_current_scores_by_pp_map[beatmap_id]) {
                        _current_scores_by_pp_map[beatmap_id] = score;
                    } else {
                        let existing = _current_scores_by_pp_map[beatmap_id];
                        if ((score.implied_pp || 0) > (existing.implied_pp || 0)) { _current_scores_by_pp_map[beatmap_id] = score; }
                    }

                    if (!_current_scores_by_score_map[beatmap_id]) {
                        _current_scores_by_score_map[beatmap_id] = score;
                    } else {
                        let existing = _current_scores_by_score_map[beatmap_id];
                        if ((score.implied_total_score || 0) > (existing.implied_total_score || 0)) { _current_scores_by_score_map[beatmap_id] = score; }
                    }
                };

                let _cumulative_clears = Object.keys(_current_scores_by_pp_map).length;
                let _cumulative_scores_count = _cumulative_scores.length;
                let _cumulative_implied_score = 0;
                let _cumulative_implied_score_ss = 0;
                let _cumulative_lazer_score = 0;
                let _cumulative_lazer_score_ss = 0;
                let _cumulative_pp = 0;
                let _cumulative_length_seconds = 0;
                let _cumulative_grades = { 'XH': 0, 'X': 0, 'SH': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 }

                for (const score of _cumulative_scores) {
                    if (!score.beatmap) {
                        return;
                    }

                    _cumulative_length_seconds += score.duration || 0;
                }

                const _current_scores_by_pp = Object.values(_current_scores_by_pp_map);
                for (const score of _current_scores_by_pp) {
                    _cumulative_pp += score.implied_pp || 0;
                }

                const _current_scores_by_score = Object.values(_current_scores_by_score_map);
                for (const score of _current_scores_by_score) {
                    const grade = score.grade;
                    _cumulative_grades[grade] = (_cumulative_grades[grade] || 0) + 1;

                    _cumulative_implied_score += score.implied_total_score || 0;
                    _cumulative_lazer_score += score.total_score || 0;
                    if (score.is_ss) {
                        _cumulative_implied_score_ss += score.implied_total_score || 0;
                        _cumulative_lazer_score_ss += score.total_score || 0;
                    }
                };

                this.periodic_graph_data[interval].cumulative[entry.date_string] = {
                    clears: _cumulative_clears,
                    scores: _cumulative_scores_count,
                    implied_score: _cumulative_implied_score,
                    implied_score_ss: _cumulative_implied_score_ss,
                    lazer_score: _cumulative_lazer_score,
                    lazer_score_ss: _cumulative_lazer_score_ss,
                    pp: _cumulative_pp,
                    length_seconds: _cumulative_length_seconds,
                    grades_xh: _cumulative_grades['XH'],
                    grades_x: _cumulative_grades['X'],
                    grades_sh: _cumulative_grades['SH'],
                    grades_s: _cumulative_grades['S'],
                    grades_a: _cumulative_grades['A'],
                    grades_b: _cumulative_grades['B'],
                    grades_c: _cumulative_grades['C'],
                    grades_d: _cumulative_grades['D'],
                }

                this.periodic_graph_data[interval].average[entry.date_string] = {
                    clears: 0, //incompatible
                    scores: 0, //incompatible
                    implied_score: this.periodic_graph_data[interval].incremental[entry.date_string].implied_score / (entry.set?.length || 1),
                    implied_score_ss: this.periodic_graph_data[interval].incremental[entry.date_string].implied_score_ss / (entry.set?.length || 1),
                    lazer_score: this.periodic_graph_data[interval].incremental[entry.date_string].lazer_score / (entry.set?.length || 1),
                    lazer_score_ss: this.periodic_graph_data[interval].incremental[entry.date_string].lazer_score_ss / (entry.set?.length || 1),
                    pp: this.periodic_graph_data[interval].incremental[entry.date_string].pp / (entry.set?.length || 1),
                    raw_pp: 0, //incompatible
                    length_seconds: entry.set?.length > 0 ? (entry.set?.reduce((acc, score) => acc + (score.duration || 0), 0) || 0) / entry.set?.length : 0,
                    grades_xh: 0, //incompatible
                    grades_x: 0, //incompatible
                    grades_sh: 0, //incompatible
                    grades_s: 0, //incompatible
                    grades_a: 0, //incompatible
                    grades_b: 0, //incompatible
                    grades_c: 0, //incompatible
                    grades_d: 0, //incompatible
                }

                this.periodic_graph_data[interval].highest[entry.date_string] = {
                    clears: 0, //incompatible
                    scores: 0, //incompatible
                    implied_score: entry.set?.length > 0 ? Math.max(...entry.set.map(s => s.implied_total_score)) : 0,
                    implied_score_ss: entry.set?.length > 0 ? Math.max(...entry.set.map(s => s.is_ss ? s.implied_total_score : 0)) : 0,
                    lazer_score: entry.set?.length > 0 ? Math.max(...entry.set.map(s => s.total_score)) : 0,
                    lazer_score_ss: entry.set?.length > 0 ? Math.max(...entry.set.map(s => s.is_ss ? s.total_score : 0)) : 0,
                    pp: entry.set_by_pp?.length > 0 ? Math.max(...entry.set_by_pp.map(s => s.implied_pp)) : 0,
                    raw_pp: 0, //incompatible
                    length_seconds: entry.set?.length > 0 ? Math.max(...entry.set.map(s => s.duration || 0)) : 0,
                    sessions: 0, //incompatible
                    sessions_length_seconds: 0, //incompatible
                    grades_xh: 0, //incompatible
                    grades_x: 0, //incompatible
                    grades_sh: 0, //incompatible
                    grades_s: 0, //incompatible
                    grades_a: 0, //incompatible
                    grades_b: 0, //incompatible
                    grades_c: 0, //incompatible
                    grades_d: 0, //incompatible
                }

                let _median_implied_score = 0;
                let _median_implied_score_ss = 0;
                let _median_lazer_score = 0;
                let _median_lazer_score_ss = 0;
                let _median_pp = 0;

                if (entry.set?.length > 0) {
                    const sorted_implied_scores = entry.set.map(s => s.implied_total_score).sort((a, b) => a - b);
                    const sorted_implied_scores_ss = entry.set.filter(s => s.is_ss).map(s => s.implied_total_score).sort((a, b) => a - b);
                    const sorted_lazer_scores = entry.set.map(s => s.total_score).sort((a, b) => a - b);
                    const sorted_lazer_scores_ss = entry.set.filter(s => s.is_ss).map(s => s.total_score).sort((a, b) => a - b);
                    const sorted_pp = entry.set_by_pp?.map(s => s.implied_pp).sort((a, b) => a - b) || [];

                    const mid = Math.floor(entry.set.length / 2);

                    if (entry.set.length % 2 === 0) {
                        _median_implied_score = (sorted_implied_scores[mid - 1] + sorted_implied_scores[mid]) / 2;
                        _median_lazer_score = (sorted_lazer_scores[mid - 1] + sorted_lazer_scores[mid]) / 2;
                        _median_pp = sorted_pp.length > 0 ? (sorted_pp[mid - 1] + sorted_pp[mid]) / 2 : 0;
                    } else {
                        _median_implied_score = sorted_implied_scores[mid];
                        _median_lazer_score = sorted_lazer_scores[mid];
                        _median_pp = sorted_pp.length > 0 ? sorted_pp[mid] : 0;
                    }
                    if (sorted_implied_scores_ss.length > 0) {
                        const mid_ss = Math.floor(sorted_implied_scores_ss.length / 2);
                        if (sorted_implied_scores_ss.length % 2 === 0) {
                            _median_implied_score_ss = (sorted_implied_scores_ss[mid_ss - 1] + sorted_implied_scores_ss[mid_ss]) / 2;
                            _median_lazer_score_ss = (sorted_lazer_scores_ss[mid_ss - 1] + sorted_lazer_scores_ss[mid_ss]) / 2;
                        }
                        else {
                            _median_implied_score_ss = sorted_implied_scores_ss[mid_ss];
                            _median_lazer_score_ss = sorted_lazer_scores_ss[mid_ss];
                        }
                    }
                }

                this.periodic_graph_data[interval].median[entry.date_string] = {
                    clears: 0, //incompatible
                    scores: 0, //incompatible
                    implied_score: _median_implied_score,
                    implied_score_ss: _median_implied_score_ss,
                    lazer_score: _median_lazer_score,
                    lazer_score_ss: _median_lazer_score_ss,
                    pp: _median_pp,
                    raw_pp: 0, //incompatible
                    length_seconds: 0, //incompatible
                    sessions: 0, //incompatible
                    sessions_length_seconds: 0, //incompatible
                    grades_xh: 0, //incompatible
                    grades_x: 0, //incompatible
                    grades_sh: 0, //incompatible
                    grades_s: 0, //incompatible
                    grades_a: 0, //incompatible
                    grades_b: 0, //incompatible
                    grades_c: 0, //incompatible
                    grades_d: 0, //incompatible
                };
            }
        }
    }

    calculatePeriodic(sorted_scores, interval) {
        if (!PERIODIC_SUFFIXES.includes(interval)) {
            throw new Error(`Invalid periodic interval: ${interval}`);
        }

        console.log(`Calculating periodic data sets for interval: ${interval} for ruleset ${this.ruleset}`);

        let _set_data = {};

        if (sorted_scores.length === 0) {
            return _set_data;
        }

        for (const score of sorted_scores) {
            // const date_string = getUTCDateString(score.ended_at, interval);
            const date_string = score.ended_at_str[DATE_ISO_FORMAT_STR[interval]];

            if (!_set_data[date_string]) {
                _set_data[date_string] = [];
            }

            _set_data[date_string].push(score);
        }

        const firstDate = new Date(Date.UTC(sorted_scores[0].ended_at.getUTCFullYear(), sorted_scores[0].ended_at.getUTCMonth(), interval === 'daily' ? sorted_scores[0].ended_at.getUTCDate() : 1));
        const lastDate = sorted_scores[sorted_scores.length - 1].ended_at_str[DATE_ISO_FORMAT_STR[interval]];

        //the above has small chance of infinite loop if date manipulation fails for some reason, we need to calculate steps needed and loop on that
        let steps = 0;
        let firstYear = firstDate.getUTCFullYear();
        let lastYear = lastDate.slice(0, 4);
        //calculate number of steps between firstDate and lastDate
        if (interval === 'daily') {
            const diffTime = new Date(lastDate) - firstDate;
            steps = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else if (interval === 'monthly') {
            let firstMonth = firstDate.getUTCMonth();
            let lastMonth = lastDate.length >= 7 ? parseInt(lastDate.slice(5, 7)) - 1 : 0;
            steps = (lastYear - firstYear) * 12 + (lastMonth - firstMonth);
        } else if (interval === 'yearly') {
            steps = lastYear - firstYear;
        }

        let currentDate = firstDate;
        for (let i = 0; i <= steps; i++) {
            const date_string = getUTCDateString(currentDate, interval);
            if (!_set_data[date_string]) {
                _set_data[date_string] = [];
            }
            //increment date
            if (interval === 'daily') {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            } else if (interval === 'monthly') {
                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
            } else if (interval === 'yearly') {
                currentDate.setUTCFullYear(currentDate.getUTCFullYear() + 1);
            }
        }

        //sort and give proper index keys ({index}_datestring)
        _set_data = Object.fromEntries(Object.entries(_set_data).sort((a, b) => a[0].localeCompare(b[0])));

        return _set_data;
    }

    calculateCompletionStatistics() {
        //temporary map of beatmap_id = [...scores]
        const beatmapScoreMap = {};

        for (const score of this.scores_set.scores) {
            if (!beatmapScoreMap[score.beatmap_id]) {
                beatmapScoreMap[score.beatmap_id] = [];
            }
            beatmapScoreMap[score.beatmap_id].push(score);
        }

        this.completion_statistics.year = {};
        for (const beatmap of this.beatmaps) {
            const year = beatmap.ranked_date ? beatmap.ranked_date.getUTCFullYear() : null;
            if (!year) {
                continue;
            }

            if (!this.completion_statistics.year[year]) {
                this.completion_statistics.year[year] = {
                    total: 0,
                    cleared: 0,
                };
            }

            this.completion_statistics.year[year].total += 1;
            if (beatmapScoreMap[beatmap.beatmap_id] && beatmapScoreMap[beatmap.beatmap_id].length > 0) {
                this.completion_statistics.year[year].cleared += 1;
            }
        }

        this.completion_statistics.star_rating = {};
        const starRatingBuckets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        for (const bucket of starRatingBuckets) {
            this.completion_statistics.star_rating[bucket] = {
                total: 0,
                cleared: 0,
            };
        }

        for (const beatmap of this.beatmaps) {
            const stars = Math.floor(beatmap.stars);
            const bucket = starRatingBuckets.includes(stars) ? stars : 10;
            this.completion_statistics.star_rating[bucket].total += 1;
            if (beatmapScoreMap[beatmap.beatmap_id] && beatmapScoreMap[beatmap.beatmap_id].length > 0) {
                this.completion_statistics.star_rating[bucket].cleared += 1;
            }
        }

        ['cs', 'ar', 'od', 'hp'].forEach(statType => {
            this.completion_statistics[statType] = {};
            for (const beatmap of this.beatmaps) {
                const statValue = Math.floor(beatmap[statType]);

                if (!this.completion_statistics[statType][statValue]) {
                    this.completion_statistics[statType][statValue] = {
                        total: 0,
                        cleared: 0,
                    };
                }

                this.completion_statistics[statType][statValue].total += 1;
                if (beatmapScoreMap[beatmap.beatmap_id] && beatmapScoreMap[beatmap.beatmap_id].length > 0) {
                    this.completion_statistics[statType][statValue].cleared += 1;
                }
            }

            let low = 0;
            let high = Object.keys(this.completion_statistics[statType]).reduce((a, b) => Math.max(a, b), 0);
            for (let i = low; i <= high; i++) {
                if (!this.completion_statistics[statType][i]) {
                    this.completion_statistics[statType][i] = {
                        total: 0,
                        cleared: 0,
                    };
                }
            }
        });

        this.completion_statistics.length = {};
        for (const beatmap of this.beatmaps) {
            const lengthMinutes = Math.floor(beatmap.length / 60);
            const bucket = lengthMinutes >= 10 ? '10+' : lengthMinutes;
            if (!this.completion_statistics.length[bucket]) {
                this.completion_statistics.length[bucket] = {
                    total: 0,
                    cleared: 0,
                };
            }

            this.completion_statistics.length[bucket].total += 1;
            if (beatmapScoreMap[beatmap.beatmap_id] && beatmapScoreMap[beatmap.beatmap_id].length > 0) {
                this.completion_statistics.length[bucket].cleared += 1;
            }
        }

        this.completion_statistics.combo = {};
        for (const beatmap of this.beatmaps) {
            const comboHundreds = Math.floor(beatmap.max_combo / 100);
            const bucket = comboHundreds >= 10 ? '1000+' : comboHundreds * 100;
            if (!this.completion_statistics.combo[bucket]) {
                this.completion_statistics.combo[bucket] = {
                    total: 0,
                    cleared: 0,
                };
            }
            this.completion_statistics.combo[bucket].total += 1;
            if (beatmapScoreMap[beatmap.beatmap_id] && beatmapScoreMap[beatmap.beatmap_id].length > 0) {
                this.completion_statistics.combo[bucket].cleared += 1;
            }
        }

        for (const statType in this.completion_statistics) {
            for (const key in this.completion_statistics[statType]) {
                const stats = this.completion_statistics[statType][key];
                stats.completion = stats.total > 0 ? (stats.cleared / stats.total) : 0;
            }
        }
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

    getBeatmapsMap(with_converts = false) {
        return with_converts ? this.beatmaps_with_converts_map : this.beatmaps_map;
    }
}
