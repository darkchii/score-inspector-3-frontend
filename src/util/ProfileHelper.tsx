import Beatmap from "../types/beatmaps/Beatmap";
import { ProfileStatistics } from "../types/ProfileStatistics";
import Score from "../types/Score";
import { GetScoreMultiplierCalculator } from "../types/ScoreMultiplierCalculator";
import type { IBeatmap, IScore } from "../types/types";

export async function ProcessUser(user: any): Promise<any> {
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

    //calculate xp 2.0 for each ruleset
    for (const ruleset of ['osu', 'taiko', 'fruits', 'mania', 'total']) {
        const rsUser = user.osuAlternative.rulesets[ruleset];

        //XP gain per unit:
        //SS: 200
        //S: 100
        //A: 50
        //Ranked Score: 1/125000
        //Total Score: 1/250000
        //Medals: 20000
        //Hours of playtime: 300

        let xp = 0;
        xp += ((rsUser.grade_counts_ssh || 0) + (rsUser.grade_counts_ss || 0)) * 200;
        xp += ((rsUser.grade_counts_sh || 0) + (rsUser.grade_counts_s || 0)) * 100;
        xp += (rsUser.grade_counts_a || 0) * 50;
        xp += (rsUser.ranked_score || 0) / 125000;
        xp += (rsUser.total_score || 0) / 250000;
        xp += (user.user_achievements?.length || 0) * 20000;
        xp += ((rsUser.play_time || 0) / 3600) * 300; //play_time is in seconds

        user.osuAlternative.rulesets[ruleset].xp_2_0 = xp;

        let varA = 5;
        let varB = 80;
        let varC = 225;
        let varD = varC - varB - varA;

        let level = getDedicationLevel(varA, varB, varC, varD, xp);

        user.osuAlternative.rulesets[ruleset].dedication_level = level;
    }

    console.log(user);

    return user;
}

export function getDedicationLevel(a: number, b: number, c: number, d: number, xp: number): number {
    let l = 0;
    let fl = a * l * l * l + b * l * l + c * l + d - xp;
    let i = 0;
    while (Math.abs(fl) > 0.001 && i < 50) {
        let dfl = 3 * a * l * l + 2 * b * l + c;
        l = l - fl / dfl;
        fl = a * l * l * l + b * l * l + c * l + d - xp;
        i++;
    }
    return l;
}

export function ProcessBeatmaps(beatmaps: IBeatmap[]): IBeatmap[] {
    return beatmaps.map(beatmap => new Beatmap(beatmap));
}

export async function MapScoreBeatmaps(scores: IScore[], beatmaps: IBeatmap[]): Promise<[IScore[], number]> {
    //This function maps beatmaps to all scores
    //We probably need to deep copy each beatmap since every score needs to manipulate its own copy
    // score[x].beatmap = beatmap

    const beatmapMap = new Map();
    for (const beatmap of beatmaps) {
        beatmapMap.set(Number(beatmap.beatmap_id), beatmap);
    }

    let missingCount = 0;
    let missingBeatmapIds = new Set<number>();
    for (const score of scores) {
        const beatmap = beatmapMap.get(Number(score.beatmap_id));
        if (beatmap) {
            score.beatmap = beatmap;
        } else {
            missingCount++;
            // score.beatmap = null; // No matching beatmap found
            missingBeatmapIds.add(Number(score.beatmap_id));
        }
    }

    scores = scores.filter(s => !missingBeatmapIds.has(Number(s.beatmap_id)));

    return [scores, missingCount];
}

export async function ProcessScores(scores: IScore[], user: any = null): Promise<IScore[]> {
    let _scores: IScore[] = scores.map(score => new Score(score, score.beatmap as Beatmap, user));
    _scores.forEach(score => {
        const multiCalculator = GetScoreMultiplierCalculator(score);
        const [multiplier, breakdown] = multiCalculator.Calculate();
        score.score_multiplier = multiplier;
        score.score_multiplier_breakdown = breakdown;
    });
    return _scores;
}

export async function BuildProfileStatistics(scores: IScore[], beatmaps: IBeatmap[], packs: any[]): Promise<{ profileStats: ProfileStatistics; profileStatsWithoutLoved: ProfileStatistics }> {
    // const profileStats = new ProfileStatistics(scores, beatmaps, packs);
    // return profileStats;
    const profileStats = new ProfileStatistics(scores, beatmaps, packs, false);
    const profileStatsWithoutLoved = new ProfileStatistics(scores, beatmaps, packs, true);
    return { profileStats, profileStatsWithoutLoved };
}
