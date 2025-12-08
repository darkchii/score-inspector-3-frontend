import { calculateBonusPerformance, calculateRawPerformance, GetRulesetId, GetRulesetNameFromId } from "./Helper";
import { GetModSetting, HasMod, ReorderMods } from "./ModHelper";
import PerformancePoints from "./Performance/PerformancePoints";
import { BeatmapApplyModsToDifficulty } from "./ScoreHelper";
import { GenerateSessions } from "./SessionHelper";

export async function ProcessUser(user) {
    user.osuAlternative.rulesets = {};

    //map everything with osu_ prefix to ruleset 0
    user.osuAlternative.rulesets['osu'] = {};
    for (const key in user.osuAlternative) {
        if (key.startsWith('osu_')) {
            const newKey = key.replace('osu_', '');
            let value = user.osuAlternative[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }
            user.osuAlternative.rulesets['osu'][newKey] = value;
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['taiko'] = {};
    for (const key in user.osuAlternative) {
        if (key.startsWith('taiko_')) {
            const newKey = key.replace('taiko_', '');
            let value = user.osuAlternative[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }
            user.osuAlternative.rulesets['taiko'][newKey] = value;
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['fruits'] = {};
    for (const key in user.osuAlternative) {
        if (key.startsWith('fruits_')) {
            const newKey = key.replace('fruits_', '');
            let value = user.osuAlternative[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }
            user.osuAlternative.rulesets['fruits'][newKey] = value;
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['mania'] = {};
    for (const key in user.osuAlternative) {
        if (key.startsWith('mania_')) {
            const newKey = key.replace('mania_', '');
            let value = user.osuAlternative[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }
            user.osuAlternative.rulesets['mania'][newKey] = value;
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['total'] = {};
    for (const key in user.osuAlternative) {
        if (key.startsWith('total_')) {
            const newKey = key.replace('total_', '');
            let value = user.osuAlternative[key];
            if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }
            user.osuAlternative.rulesets['total'][newKey] = value;
            delete user.osuAlternative[key];
        }
    }

    //Some manual, theres missing values in total
    user.osuAlternative.rulesets['total'].total_score = ['osu', 'taiko', 'fruits', 'mania'].reduce((acc, ruleset) => { return acc + (user.osuAlternative.rulesets[ruleset]?.total_score || 0); }, 0);

    return user;
}

export function ProcessBeatmaps(beatmaps) {
    //Corrects data types
    for (let i = 0; i < beatmaps.length; i++) {
        beatmaps[i] = ProcessBeatmap(beatmaps[i]);
    }

    return beatmaps;
}

function ProcessBeatmap(beatmap) {
    beatmap.ar = Number(beatmap.ar);
    beatmap.cs = Number(beatmap.cs);
    beatmap.hp = Number(beatmap.hp);
    beatmap.od = Number(beatmap.od);
    beatmap.bpm = Number(beatmap.bpm);
    beatmap.stars = Number(beatmap.stars);
    beatmap.ruleset_id = Number(beatmap.mode);

    if (beatmap.tags && typeof beatmap.tags === 'string') {
        beatmap.tags = beatmap.tags ? beatmap.tags.split(" ") : [];
    }

    beatmap.last_updated = beatmap.last_updated ? new Date(beatmap.last_updated) : null;
    beatmap.lchg_time = beatmap.lchg_time ? new Date(beatmap.lchg_time) : null;
    beatmap.ranked_date = beatmap.ranked_date ? new Date(beatmap.ranked_date) : null;
    beatmap.submitted_date = beatmap.submitted_date ? new Date(beatmap.submitted_date) : null;

    beatmap.slider_multiplier = 1.4; //taiko thing
    beatmap.slider_tick_rate = 1.0; //taiko thing

    //Corrects data types
    return beatmap;
}

export async function MapScoreBeatmaps(scores, beatmaps) {
    //This function maps beatmaps to all scores
    //We probably need to deep copy each beatmap since every score needs to manipulate its own copy
    // score[x].beatmap = beatmap

    const beatmapMap = new Map();
    for (const beatmap of beatmaps) {
        beatmapMap.set(Number(beatmap.beatmap_id), beatmap);
    }

    let missingCount = 0;
    for (const score of scores) {
        const beatmap = beatmapMap.get(Number(score.beatmap_id));
        if (beatmap) {
            score.beatmap = JSON.parse(JSON.stringify(beatmap)); // Deep copy to avoid reference issues
            score.beatmap = ProcessBeatmap(score.beatmap); // Ensure beatmap is processed
        } else {
            missingCount++;
            score.beatmap = null; // No matching beatmap found
        }
    }

    // Filter out scores without a matching beatmap
    scores = scores.filter(score => score.beatmap !== null);

    return [scores, missingCount];
}

export async function ProcessScores(scores, user = null) {
    for (let i = 0; i < scores.length; i++) {
        scores[i] = await ProcessScore(scores[i]);

        if (user) {
            scores[i].user = user;
        }
    }
    return scores;
}

async function ProcessScore(score) {
    score.is_lazer = score.build_id !== null && score.build_id !== undefined; //Only lazer scores have build_id

    score.accuracy = Number(score.accuracy);
    score.beatmap_id = Number(score.beatmap_id);
    score.ruleset = GetRulesetNameFromId(score.ruleset_id);

    score.classic_total_score = Number(score.classic_total_score);

    score.id = Number(score.id);

    score.legacy_score_id = Number(score.legacy_score_id);
    score.total_score = Number(score.total_score);
    score.lazer_score = Number(score.total_score);
    score.legacy_total_score = score.legacy_total_score ? Number(score.legacy_total_score) : null;
    score.pp = Number(score.pp);

    score.total_score = Number(score.total_score);
    score.total_score_without_mods = Number(score.total_score_without_mods);
    score.user_id = Number(score.user_id);

    score.mod_speed_change = Number(score.mod_speed_change || 1.0);

    score.started_at = score.started_at ? new Date(score.started_at) : null;
    score.ended_at = score.ended_at ? new Date(score.ended_at) : null;
    score.lchg_time = score.lchg_time ? new Date(score.lchg_time) : null;

    if (score.beatmap) {
        score.beatmap.bpm_modded = score.beatmap.bpm;
        score.beatmap.length_modded = score.beatmap.length;
        score.beatmap.drain_time_modded = score.beatmap.drain_time;
        //Recalculate length with speed modifiers
        if (score.mod_speed_change && score.mod_speed_change !== 1.0) {
            score.beatmap.bpm_modded = score.beatmap.bpm * score.mod_speed_change;
            score.beatmap.length_modded = score.beatmap.length / score.mod_speed_change;
            score.beatmap.drain_time_modded = score.beatmap.drain_time / score.mod_speed_change;
        }

        //Calculate the duration of the score
        score.duration = score.beatmap.drain_time_modded;

        if (score.ended_at && score.started_at) {
            const startedAt = new Date(score.started_at);
            const endedAt = new Date(score.ended_at);
            score.duration = (endedAt - startedAt) / 1000; //duration in seconds
        }
    }

    score.mods = ReorderMods(GetRulesetNameFromId(score.ruleset_id), score.mods || []);

    score.beatmap_attributes = BeatmapApplyModsToDifficulty(score.ruleset, score.beatmap, score.mods);

    score.diff_missing = !score.attr_diff || score.attr_recalc;

    score.using_classic_slider_accuracy = GetModSetting(score.mods, 'SL', 'classic_slider_accuracy') === true;

    try {
        score.performance = {
            'base': new PerformancePoints(score),
            //todo: SS, FC
        }
    } catch (e) {
        // console.error("Error calculating performance:", e);
    }

    return score;
}

export async function BuildProfileStatistics(scores, beatmaps) {
    const profileStats = new ProfileStatistics(scores, beatmaps);
    return profileStats;
}

// class for profile statistics
export class ProfileStatistics {
    constructor(scores, beatmaps) {
        this.rulesets = {
            'total': new ProfileRulesetStatistics(beatmaps),
        };

        for (const score of scores) {
            const ruleset = GetRulesetNameFromId(score.ruleset_id);

            if (!this.rulesets[ruleset]) {
                this.rulesets[ruleset] = new ProfileRulesetStatistics(beatmaps, ruleset);
            }

            this.rulesets[ruleset].addScore(score);
            this.rulesets['total'].addScore(score);
        }

        for (const ruleset in this.rulesets) {
            this.rulesets[ruleset].calculate();
        }
    }

}

export class ProfileRulesetScoreSet {
    constructor() {
        this.scores = [];
        this.scores_map = {};
        this.grades = {};

        this.clears = 0;
        this.ranked_clears = 0;

        this.missing_difficulty = 0; //number of scores with missing beatmap difficulty data (its likely in queue for processing)

        this.legacy_total_score = 0;
        this.score = 0;

        this.performance_points = 0;
        this.bonus_performance_points = 0;

        this.duration_seconds = 0;

        this.recent_scores = [];

        this.sessions = [];
    }

    addScore(score) {
        this.scores.push(score);

        this.scores_map[score.id] = score;

        this.clears += 1;
        if (score.beatmap && (score.beatmap.status === 'ranked' || score.beatmap.status === 'approved')) {
            this.ranked_clears += 1;
        }

        this.duration_seconds += score.duration || 0;

        //count grades
        const grade = score.grade;
        this.grades[grade] = (this.grades[grade] || 0) + 1;

        this.legacy_total_score += score.legacy_total_score;
        this.score += score.total_score;

        if (score.diff_missing) {
            this.missing_difficulty += 1;
        }
    }

    reorder(param, descending = true) {
        this.scores.sort((a, b) => {
            if (descending) {
                return b[param] - a[param];
            } else {
                return a[param] - b[param];
            }
        });
    }

    calculate() {
        this.performance_points = calculateRawPerformance(this.scores);
        this.bonus_performance_points = calculateBonusPerformance(this.scores.length);

        //recent scores should be max 100, ordered by ended_at descending
        this.reorder('ended_at', true);
        this.recent_scores = this.scores.slice(0, 100);

        this.sessions = GenerateSessions(this.scores);
        this.sessions.sessions.sort((a, b) => b.start - a.start);
    }

    getById(id) {
        return this.scores_map[id];
    }
}

export class ProfileRulesetStatistics {
    constructor(beatmaps, ruleset = null) {
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
    }
}
