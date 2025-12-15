import { blue, green, grey, lightBlue, lightGreen, red, yellow } from "@mui/material/colors";
import axios from "axios";
import { GetAPI } from "./ApiHelper";
import Score from "../types/Score";
import ScoreDifficulty from "../types/ScoreDifficulty";

//Helper functions for score data
export function GetStarRating(score) {
    if (!score.diff_missing) {
        return score.attr_diff.star_rating;
    }

    return score.beatmap ? score.beatmap.stars : null;
}

export function GetHitResultColor(hitResult) {
    switch (hitResult) {
        case 'ignore_miss':
        case 'small_tick_miss':
            return grey;

        case 'miss':
        case 'large_tick_miss':
        case 'combo_break':
            return red;

        case 'meh':
            return yellow;

        case 'ok':
            return green;

        case 'good':
            return lightGreen;

        case 'small_tick_hit':
        case 'large_tick_hit':
        case 'slider_tail_hit':
        case 'great':
            return blue;

        default:
            return lightBlue;
    }
}

export function BeatmapApplyModsToDifficulty(ruleset, beatmap, mods) {
    let modifiedAttributes = {
        ar: beatmap.ar,
        od: beatmap.od,
        hp: beatmap.hp,
        cs: beatmap.cs,
        slider_multiplier: beatmap.slider_multiplier,
        slider_tick_rate: beatmap.slider_tick_rate
    }

    for (const mod of mods) {
        switch (mod.acronym) {
            case 'DA':
                modifiedAttributes.ar = mod.settings?.approach_rate ?? beatmap.ar;
                modifiedAttributes.od = mod.settings?.overall_difficulty ?? beatmap.od;
                modifiedAttributes.hp = mod.settings?.health_drain ?? beatmap.hp;
                modifiedAttributes.cs = mod.settings?.circle_size ?? beatmap.cs;
                break;
            case 'EZ':
                modifiedAttributes.ar *= 0.5;
                modifiedAttributes.hp *= 0.5;
                modifiedAttributes.cs *= 0.5;
                if (['osu', 'taiko', 'fruits'].includes(ruleset)) {
                    modifiedAttributes.od *= 0.5;
                }
                if (['taiko'].includes(ruleset)) {
                    modifiedAttributes.slider_multiplier *= 0.8;
                }
                break;
            case 'HR':
                modifiedAttributes.hp = Math.min(modifiedAttributes.hp * 1.4, 10);
                if (['osu', 'fruits'].includes(ruleset)) {
                    modifiedAttributes.od = Math.min(modifiedAttributes.od * 1.4, 10);
                    modifiedAttributes.cs = Math.min(modifiedAttributes.cs * 1.3, 10);
                    modifiedAttributes.ar = Math.min(modifiedAttributes.ar * 1.4, 10);
                }
                if (['taiko'].includes(ruleset)) {
                    modifiedAttributes.od = Math.min(modifiedAttributes.od * 1.4, 10);
                    modifiedAttributes.slider_multiplier *= (1.4 * 4 / 3);
                }
                break;
            case 'TP':
                if (['osu'].includes(ruleset)) {
                    modifiedAttributes.ar *= 0.5;
                }
        }
    }

    return modifiedAttributes;
}

export const CalculateRawPerformance = (scores, include_loved = false) => {
    let subset = scores;

    if (!include_loved) {
        subset = scores.filter(score => score.beatmap && score.beatmap.status !== 'loved');
    }

    //Sort scores by performance descending
    subset.sort((a, b) => (b.performance?.base?.pp || b.pp || 0) - (a.performance?.base?.pp || a.pp || 0));
    //Use top 500 scores only

    const topScores = subset.slice(0, 500);
    let totalPerformance = 0;
    topScores.forEach((score, index) => {
        const weight = Math.pow(0.95, index);
        const pp = score.implied_pp;
        totalPerformance += pp * weight;
    });
    return totalPerformance;
}

export const CalculateBonusPerformance = (scoreCount) => {
    return 416.6667 * (1 - Math.pow(0.9995, Math.min(scoreCount, 1000)));
}

export const DetermineIsScoreFC = (score) => {
    if (!score.beatmap) {
        return false;
    }

    //just combo = beatmap max combo is not enough, since we recognize slider end misses as full combos too
    if (score.grade === 'X' || score.grade === 'XH') {
        return true;
    }

    if (score.ruleset === 'osu') {
        if (!score.using_classic_slider_accuracy) {
            const countSliderEndsDropped = score.beatmap.count_sliders - score.statistics_slider_tail_hit;
            //if score.combo + dropped slider ends >= max combo, its a full combo
            return score.combo + countSliderEndsDropped >= (score.diff_attr?.max_combo || score.beatmap?.max_combo || 0);
        } else {
            //estimate missed slider ends
            const countMiss = score.statistics_miss || 0;
            const count100 = score.statistics_ok || 0;
            if (countMiss > 0) {
                return false;
            }

            return ((score.diff_attr?.max_combo || score.beatmap?.max_combo || 0) - score.combo) <= count100;
        }
    }

    return score.combo >= (score.diff_attr?.max_combo || score.beatmap?.max_combo || 0);
}

const _localScoreCache = new Map();
//Only for singular score fetching like /score/:scoreId
export const GetScoreFromId = async (scoreId) => {
    if (_localScoreCache.has(scoreId)) {
        return _localScoreCache.get(scoreId);
    }

    try {
        let score, beatmap, user, difficulty_nomod;

        let response = await axios.get(`${GetAPI()}/score/${scoreId}?fullData=true`);

        if (response.data) {
            score = response.data.score;
            beatmap = response.data.beatmap;
            difficulty_nomod = response.data.difficulty_nomod;

            response = await axios.get(`${GetAPI()}/user/${score.user_id}/profile`);

            if (response.data) {
                user = response.data;
            }
        }

        if (!score || !beatmap || !user) {
            throw new Error("Incomplete data fetched for score.");
        }

        const result = new Score(score, beatmap, user);
        result.beatmap.attr_diff = new ScoreDifficulty(difficulty_nomod);
        _localScoreCache.set(scoreId, result);
        return result;
    } catch (error) {
        console.error("Error fetching score:", error);
        return null;
    }
}