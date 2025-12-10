import { GetRulesetNameFromId } from "./Helper";
import { ReorderMods } from "./ModHelper";
import PerformancePoints from "./Performance/PerformancePoints";
import { ProfileStatistics } from "./ProfileStatistics";
import { BeatmapApplyModsToDifficulty, DetermineIsScoreFC } from "./ScoreHelper";

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

    beatmap.count_circles = Number(beatmap.count_circles);
    beatmap.count_sliders = Number(beatmap.count_sliders);
    beatmap.count_spinners = Number(beatmap.count_spinners);

    beatmap.total_objects = beatmap.count_circles + beatmap.count_sliders + beatmap.count_spinners;

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

    //remove scores with missing beatmaps
    scores = scores.filter(s => s.beatmap !== null && s.beatmap !== undefined);

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

    score.is_convert = score.ruleset_id !== score.beatmap?.ruleset_id;

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

    //if mods includes CL, and the mod setting using_classic_slider_accuracy is true or undefined, set using_classic_slider_accuracy to true
    score.using_classic_slider_accuracy = score.mods.some(mod => mod.acronym === 'CL' && (mod.settings?.using_classic_slider_accuracy === true || mod.settings?.using_classic_slider_accuracy === undefined));

    score.is_fc = DetermineIsScoreFC(score);

    try {
        score.performance = {
            'base': new PerformancePoints(score),
            'ss': new PerformancePoints(score, {
                generate_ss: true
            })
            //todo: SS, FC
        }
    } catch (e) {
        // console.error("Error calculating performance:", e);
    }

    return score;
}

export async function BuildProfileStatistics(scores, beatmaps) {
    const profileStats = new ProfileStatistics(scores, beatmaps);
    console.log(profileStats);
    return profileStats;
}
