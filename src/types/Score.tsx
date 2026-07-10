import { GetRulesetNameFromId } from "../util/Helper";
import { ReorderMods } from "../util/ModHelper";
import PerformancePoints from "./performance/PerformancePoints";
import { BeatmapApplyModsToDifficulty, DetermineIsScoreFC } from "../util/ScoreHelper";
import ScoreDifficulty from "./ScoreDifficulty";
import type { IBeatmap, IPerformancePoints, IScore, IScoreDateStrings, IScoreDifficulty, IScoreMod } from "./types";
import Beatmap from "./beatmaps/Beatmap";

class Score implements IScore {
    beatmap: IBeatmap;
    local_beatmap: IBeatmap;
    user: any; //can be User or null

    id: number;
    beatmap_id: number;
    user_id: number;
    best_id: number | null;
    build_id: number | null;

    is_lazer: boolean;

    accuracy: number;

    classic_total_score: number;
    has_replay: boolean;

    is_perfect_combo: boolean;

    legacy_perfect: boolean;

    legacy_score_id: number | null;

    legacy_total_score: number | null;

    combo: number;

    maximum_statistics_perfect: number = 0;
    maximum_statistics_great: number = 0;
    maximum_statistics_good: number = 0;
    maximum_statistics_ok: number = 0;
    maximum_statistics_meh: number = 0;
    maximum_statistics_miss: number = 0;
    maximum_statistics_ignore_hit: number = 0;
    maximum_statistics_ignore_miss: number = 0;
    maximum_statistics_slider_tail_hit: number = 0;
    maximum_statistics_legacy_combo_increase: number = 0;
    maximum_statistics_large_bonus: number = 0;
    maximum_statistics_large_tick_hit: number = 0
    maximum_statistics_large_tick_miss: number = 0;
    maximum_statistics_small_bonus: number = 0;
    maximum_statistics_small_tick_hit: number = 0;

    ruleset_id: number;
    ruleset: string;

    passed: boolean;

    pp: number | null;

    preserve: boolean;

    processed: boolean;
    grade: string;

    replay: boolean;
    ended_at: Date;
    started_at: Date | null
    lchg_time: Date | null;

    ended_at_seconds: number | null;
    ended_at_str: {
        'YYYY-MM-DD': string;
        'YYYY-MM': string;
        'YYYY': string;
    };

    statistics_perfect: number;
    statistics_great: number
    statistics_good: number;
    statistics_ok: number
    statistics_meh: number;
    statistics_miss: number
    statistics_ignore_hit: number;
    statistics_ignore_miss: number
    statistics_slider_tail_hit: number;
    statistics_slider_tail_miss: number
    statistics_large_bonus: number;
    statistics_large_tick_hit: number
    statistics_large_tick_miss: number;
    statistics_small_bonus: number
    statistics_small_tick_hit: number
    statistics_small_tick_miss: number
    statistics_combo_break: number;

    total_score: number
    total_score_without_mods: number | null;

    type: string;
    highest_score: boolean;
    highest_pp: boolean;
    rank: number | null;

    mods: IScoreMod[];
    mod_acronyms: string[];
    mod_speed_change: number | null;
    using_classic_slider_accuracy: boolean;

    difficulty_reducing: boolean;
    difficulty_removing: boolean;
    is_ss: boolean;
    is_fc: boolean;
    is_convert: boolean;
    implied_total_score: number;
    beatmap_attributes: any;

    attr_diff: IScoreDifficulty | null = null;
    attr_recalc: boolean;

    diff_missing: boolean;

    star_rating: number | null;
    max_combo: number | null;
    performance: {
        base: IPerformancePoints | null;
        ss?: IPerformancePoints | null;
    } | null = null;

    duration: number | null = null;

    implied_pp: number;

    constructor(api_data: any, beatmap: Beatmap | IBeatmap, user: any = null) {
        // this.beatmap = beatmap;
        //if beatmap is not of type Beatmap, create it, otherwise use as is
        this.beatmap = (beatmap instanceof Beatmap) ? beatmap : new Beatmap(beatmap);
        this.local_beatmap = this.beatmap.clone(); //this will contain modified data
        this.user = user;

        this.id = Number(api_data.id);
        this.beatmap_id = Number(api_data.beatmap_id);
        this.user_id = Number(api_data.user_id);
        this.best_id = api_data.best_id ? Number(api_data.best_id) : null;
        this.build_id = api_data.build_id ? Number(api_data.build_id) : null;

        this.is_lazer = this.build_id !== null && this.build_id !== undefined; //Only lazer scores have build_id

        this.accuracy = Number(api_data.accuracy);

        this.classic_total_score = Number(api_data.classic_total_score);
        this.has_replay = Boolean(api_data.has_replay);

        this.is_perfect_combo = Boolean(api_data.is_perfect_combo);

        this.legacy_perfect = Boolean(api_data.legacy_perfect);

        this.legacy_score_id = api_data.legacy_score_id ? Number(api_data.legacy_score_id) : null;

        this.legacy_total_score = api_data.legacy_total_score ? Number(api_data.legacy_total_score) : null;

        this.combo = Number(api_data.combo);

        this.maximum_statistics_perfect = api_data.maximum_statistics_perfect ? Number(api_data.maximum_statistics_perfect) : 0;
        this.maximum_statistics_great = api_data.maximum_statistics_great ? Number(api_data.maximum_statistics_great) : 0;
        this.maximum_statistics_miss = api_data.maximum_statistics_miss ? Number(api_data.maximum_statistics_miss) : 0;
        this.maximum_statistics_ignore_hit = api_data.maximum_statistics_ignore_hit ? Number(api_data.maximum_statistics_ignore_hit) : 0;
        this.maximum_statistics_ignore_miss = api_data.maximum_statistics_ignore_miss ? Number(api_data.maximum_statistics_ignore_miss) : 0;
        this.maximum_statistics_slider_tail_hit = api_data.maximum_statistics_slider_tail_hit ? Number(api_data.maximum_statistics_slider_tail_hit) : 0;
        this.maximum_statistics_legacy_combo_increase = api_data.maximum_statistics_legacy_combo_increase ? Number(api_data.maximum_statistics_legacy_combo_increase) : 0;
        this.maximum_statistics_large_bonus = api_data.maximum_statistics_large_bonus ? Number(api_data.maximum_statistics_large_bonus) : 0;
        this.maximum_statistics_large_tick_hit = api_data.maximum_statistics_large_tick_hit ? Number(api_data.maximum_statistics_large_tick_hit) : 0;
        this.maximum_statistics_small_bonus = api_data.maximum_statistics_small_bonus ? Number(api_data.maximum_statistics_small_bonus) : 0;
        this.maximum_statistics_small_tick_hit = api_data.maximum_statistics_small_tick_hit ? Number(api_data.maximum_statistics_small_tick_hit) : 0;

        this.ruleset_id = Number(api_data.ruleset_id);
        this.ruleset = GetRulesetNameFromId(this.ruleset_id);


        this.passed = Boolean(api_data.passed);

        this.pp = api_data.pp ? Number(api_data.pp) : null;

        this.preserve = Boolean(api_data.preserve);

        this.processed = Boolean(api_data.processed);

        this.grade = api_data.grade || api_data.rank;

        this.replay = Boolean(api_data.replay);

        this.ended_at = new Date(api_data.ended_at); //ended_at always exists
        this.started_at = api_data.started_at ? new Date(api_data.started_at) : null;
        this.lchg_time = api_data.lchg_time ? new Date(api_data.lchg_time) : null;

        this.ended_at_seconds = Math.floor(this.ended_at.getTime() / 1000);

        let ended_at_iso = this.ended_at.toISOString();
        this.ended_at_str = {} as IScoreDateStrings;
        if (ended_at_iso) {
            this.ended_at_str['YYYY-MM-DD'] = ended_at_iso.slice(0, 10);
            this.ended_at_str['YYYY-MM'] = ended_at_iso.slice(0, 7);
            this.ended_at_str['YYYY'] = ended_at_iso.slice(0, 4);
        }

        this.statistics_perfect = api_data.statistics_perfect ? Number(api_data.statistics_perfect) : 0;
        this.statistics_great = api_data.statistics_great ? Number(api_data.statistics_great) : 0;
        this.statistics_good = api_data.statistics_good ? Number(api_data.statistics_good) : 0;
        this.statistics_ok = api_data.statistics_ok ? Number(api_data.statistics_ok) : 0;
        this.statistics_meh = api_data.statistics_meh ? Number(api_data.statistics_meh) : 0;
        this.statistics_miss = api_data.statistics_miss ? Number(api_data.statistics_miss) : 0;
        this.statistics_ignore_hit = api_data.statistics_ignore_hit ? Number(api_data.statistics_ignore_hit) : 0;
        this.statistics_ignore_miss = api_data.statistics_ignore_miss ? Number(api_data.statistics_ignore_miss) : 0;
        this.statistics_slider_tail_hit = api_data.statistics_slider_tail_hit ? Number(api_data.statistics_slider_tail_hit) : 0;
        this.statistics_slider_tail_miss = api_data.statistics_slider_tail_miss ? Number(api_data.statistics_slider_tail_miss) : 0;
        this.statistics_large_bonus = api_data.statistics_large_bonus ? Number(api_data.statistics_large_bonus) : 0;
        this.statistics_large_tick_hit = api_data.statistics_large_tick_hit ? Number(api_data.statistics_large_tick_hit) : 0;
        this.statistics_large_tick_miss = api_data.statistics_large_tick_miss ? Number(api_data.statistics_large_tick_miss) : 0;
        this.statistics_small_bonus = api_data.statistics_small_bonus ? Number(api_data.statistics_small_bonus) : 0;
        this.statistics_small_tick_hit = api_data.statistics_small_tick_hit ? Number(api_data.statistics_small_tick_hit) : 0;
        this.statistics_small_tick_miss = api_data.statistics_small_tick_miss ? Number(api_data.statistics_small_tick_miss) : 0;
        this.statistics_combo_break = api_data.statistics_combo_break ? Number(api_data.statistics_combo_break) : 0;

        this.total_score = Number(api_data.total_score);
        this.total_score_without_mods = api_data.total_score_without_mods ? Number(api_data.total_score_without_mods) : null;

        this.type = api_data.type;

        this.highest_score = Boolean(api_data.highest_score);
        this.highest_pp = Boolean(api_data.highest_pp);

        this.rank = api_data.rank ? Number(api_data.rank) : null;

        this.mods = ReorderMods(this.ruleset, Array.isArray(api_data.mods) ? api_data.mods : []);
        this.mod_acronyms = Array.isArray(api_data.mod_acronyms) ? api_data.mod_acronyms : [];
        this.mod_speed_change = api_data.mod_speed_change ? Number(api_data.mod_speed_change) : null;

        if(this.mod_speed_change === null){
            //set it based on mods
            const speedMod = this.mods.find(mod => mod.acronym === 'DT' || mod.acronym === 'HT' || mod.acronym === 'NC');
            if(speedMod){
                //check if theres a setting set
                if(speedMod.settings && speedMod.settings.speed_change){
                    this.mod_speed_change = Number(speedMod.settings.speed_change);
                } else {
                    //default values
                    if(speedMod.acronym === 'DT' || speedMod.acronym === 'NC'){
                        this.mod_speed_change = 1.5;
                    } else if(speedMod.acronym === 'HT' || speedMod.acronym === 'DC'){
                        this.mod_speed_change = 0.75;
                    }
                }
            } else {
                this.mod_speed_change = 1.0;
            }
        }

        this.using_classic_slider_accuracy = this.mods.some(mod => mod.acronym === 'CL' && (mod.settings?.using_classic_slider_accuracy === true || mod.settings?.using_classic_slider_accuracy === undefined));

        this.difficulty_reducing = Boolean(api_data.difficulty_reducing);
        this.difficulty_removing = Boolean(api_data.difficulty_removing);

        this.is_ss = Boolean(api_data.is_ss);
        this.is_fc = Boolean(api_data.is_fc);

        this.is_convert = this.beatmap.convert !== undefined ? this.beatmap.convert : this.ruleset_id !== this.beatmap?.ruleset_id;
        // this.implied_total_score = this.legacy_total_score !== null && this.legacy_total_score > 0 ? this.legacy_total_score : this.classic_total_score;
        this.implied_total_score = this.classic_total_score; // I think it's fine to abandon legacy_total_score at this point

        if (this.local_beatmap) {
            this.local_beatmap.bpm_modded = this.local_beatmap.bpm;
            this.local_beatmap.length_modded = this.local_beatmap.length;
            this.local_beatmap.drain_time_modded = this.local_beatmap.drain_time;
            //Recalculate length with speed modifiers
            if (this.mod_speed_change && this.mod_speed_change !== 1.0) {
                this.local_beatmap.bpm_modded = this.local_beatmap.bpm * this.mod_speed_change;
                this.local_beatmap.length_modded = this.local_beatmap.length / this.mod_speed_change;
                this.local_beatmap.drain_time_modded = this.local_beatmap.drain_time / this.mod_speed_change;
            }

            //Calculate the duration of the score
            this.duration = this.local_beatmap.drain_time_modded;

            if (this.ended_at && this.started_at) {
                const startedAt = new Date(this.started_at);
                const endedAt = new Date(this.ended_at);
                this.duration = (endedAt.getTime() - startedAt.getTime()) / 1000; //duration in seconds
            }

            this.beatmap_attributes = BeatmapApplyModsToDifficulty(this.ruleset, this.local_beatmap, this.mods);

        }

        if(this.beatmap){
            this.beatmap.addScore(this);
        }


        if (api_data?.scoreAttribute?.attr_diff) {
            this.attr_diff = new ScoreDifficulty(api_data.scoreAttribute.attr_diff);
        }
        this.attr_recalc = Boolean(api_data?.scoreAttribute?.attr_recalc);

        //if attr_diff is missing or attr_recalc is true
        this.diff_missing = !api_data?.scoreAttribute?.attr_diff || this.attr_recalc;

        this.is_fc = DetermineIsScoreFC(this);

        this.star_rating = this.attr_diff?.star_rating ?? (this.beatmap ? this.beatmap.stars : null);
        this.max_combo = this.attr_diff?.max_combo ?? (this.beatmap ? this.beatmap.max_combo : null);

        try {
            this.performance = {
                'base': new PerformancePoints(this),
                'ss': new PerformancePoints(this, {
                    generate_ss: true
                })
                //todo: SS, FC
            }
        } catch (e) {
            // console.error("Error calculating performance:", e);
        }

        this.implied_pp = this.performance?.base?.pp || this.pp || 0;
    }

    // Gives an array of other scores on the same beatmap
    getOtherScores() {
        if (!this.beatmap) return [];

        return this.beatmap.getScores(null, 'desc')?.filter(s => s.id !== this.id) || [];
    }
}

export default Score;