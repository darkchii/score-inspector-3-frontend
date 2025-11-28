import { GetRulesetId, GetRulesetNameFromId } from "./Helper";

export async function ProcessUser(user){
    user.osuAlternative.rulesets = {};

    //map everything with osu_ prefix to ruleset 0
    user.osuAlternative.rulesets['osu'] = {};
    for(const key in user.osuAlternative){
        if(key.startsWith('osu_')){
            const newKey = key.replace('osu_', '');
            user.osuAlternative.rulesets['osu'][newKey] = user.osuAlternative[key];
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['taiko'] = {};
    for(const key in user.osuAlternative){
        if(key.startsWith('taiko_')){
            const newKey = key.replace('taiko_', '');
            user.osuAlternative.rulesets['taiko'][newKey] = user.osuAlternative[key];
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['fruits'] = {};
    for(const key in user.osuAlternative){
        if(key.startsWith('fruits_')){
            const newKey = key.replace('fruits_', '');
            user.osuAlternative.rulesets['fruits'][newKey] = user.osuAlternative[key];
            delete user.osuAlternative[key];
        }
    }

    user.osuAlternative.rulesets['mania'] = {};
    for(const key in user.osuAlternative){
        if(key.startsWith('mania_')){
            const newKey = key.replace('mania_', '');
            user.osuAlternative.rulesets['mania'][newKey] = user.osuAlternative[key];
            delete user.osuAlternative[key];
        }
    }

    return user;
}

export async function ProcessBeatmaps(beatmaps) {
    //Corrects data types
    for (let i = 0; i < beatmaps.length; i++) {
        beatmaps[i] = await ProcessBeatmap(beatmaps[i]);
    }

    return beatmaps;
}

async function ProcessBeatmap(beatmap) {
    beatmap.ar = Number(beatmap.ar);
    beatmap.cs = Number(beatmap.cs);
    beatmap.hp = Number(beatmap.hp);
    beatmap.od = Number(beatmap.od);
    beatmap.bpm = Number(beatmap.bpm);
    beatmap.stars = Number(beatmap.stars);
    beatmap.ruleset_id = Number(beatmap.mode);

    beatmap.tags = beatmap.tags ? beatmap.tags.split(" ") : [];

    beatmap.last_updated = beatmap.last_updated ? new Date(beatmap.last_updated) : null;
    beatmap.lchg_time = beatmap.lchg_time ? new Date(beatmap.lchg_time) : null;
    beatmap.ranked_date = beatmap.ranked_date ? new Date(beatmap.ranked_date) : null;
    beatmap.submitted_date = beatmap.submitted_date ? new Date(beatmap.submitted_date) : null;

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
        } else {
            missingCount++;
            score.beatmap = null; // No matching beatmap found
        }
    }

    // Filter out scores without a matching beatmap
    scores = scores.filter(score => score.beatmap !== null);

    return [scores, missingCount];
}

export async function ProcessScores(scores) {
    for (let i = 0; i < scores.length; i++) {
        scores[i] = await ProcessScore(scores[i]);
    }

    console.log(scores[0]);
    return scores;
}

async function ProcessScore(score) {
    score.accuracy = Number(score.accuracy);
    score.beatmap_id = Number(score.beatmap_id);

    score.classic_total_score = Number(score.classic_total_score);

    score.id = Number(score.id);

    score.legacy_score_id = Number(score.legacy_score_id);
    score.total_score = Number(score.total_score);
    score.legacy_total_score = Number(score.legacy_total_score);
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

        if(score.ended_at && score.started_at) {
            const startedAt = new Date(score.started_at);
            const endedAt = new Date(score.ended_at);
            score.duration = (endedAt - startedAt) / 1000; //duration in seconds
        }
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

            if(!this.rulesets[ruleset]) {
                this.rulesets[ruleset] = new ProfileRulesetStatistics(beatmaps, ruleset);
            }

            this.rulesets[ruleset].addScore(score);
            this.rulesets['total'].addScore(score);
        }

        for (const ruleset in this.rulesets) {
            this.rulesets[ruleset].calculate();
        }

        console.log(this);
    }

}

export class ProfileRulesetScoreSet {
    constructor() {
        this.scores = [];

        this.grades = {};

        this.legacy_total_score = 0;
        this.score = 0;
    }

    addScore(score) {
        this.scores.push(score);

        //count grades
        const grade = score.grade;
        this.grades[grade] = (this.grades[grade] || 0) + 1;

        this.legacy_total_score += score.legacy_total_score;
        this.score += score.total_score;
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
}

export class ProfileRulesetStatistics {
    constructor(beatmaps, ruleset = null) {
        //ProfileRulesetScoreSets
        this.beatmaps = beatmaps;
        this.beatmaps_with_converts = beatmaps;
        if(ruleset || ruleset === 0) {
            this.ruleset = ruleset;
            this.beatmaps = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset));
            this.beatmaps_with_converts = beatmaps.filter(b => b.ruleset_id === GetRulesetId(ruleset) || b.ruleset_id === 0);
        }

        this.beatmap_count = this.beatmaps.length;
        this.beatmap_count_with_converts = this.beatmaps_with_converts.length;

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

        if(score.highest_pp) {
            this.scores_set_by_pp.addScore(score);
        }

        if(score.highest_score) {
            this.scores_set_by_score.addScore(score);
        }

        this.implied_playtime_seconds += score.duration;
    }

    calculate() {
        //calculate completion
        const _scoreCount = this.scores_set_by_pp.scores.length;
        this.completion = _scoreCount / this.beatmap_count;
        this.completion_with_converts = _scoreCount / this.beatmap_count_with_converts;
    }
}
