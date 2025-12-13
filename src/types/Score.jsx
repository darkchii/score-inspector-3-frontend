import { GetRulesetNameFromId } from "../util/Helper";
import { ReorderMods } from "../util/ModHelper";
import PerformancePoints from "./performance/PerformancePoints";
import { BeatmapApplyModsToDifficulty, DetermineIsScoreFC } from "../util/ScoreHelper";
import ScoreDifficulty from "./ScoreDifficulty";

class Score {
    constructor(api_data, beatmap = null, user = null) {
        this.beatmap = beatmap;
        this.local_beatmap = beatmap.clone(); //this will contain modified data
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

        this.grade = api_data.grade;

        this.replay = Boolean(api_data.replay);

        this.ended_at = api_data.ended_at ? new Date(api_data.ended_at) : null;
        this.started_at = api_data.started_at ? new Date(api_data.started_at) : null;
        this.lchg_time = api_data.lchg_time ? new Date(api_data.lchg_time) : null;

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

        this.using_classic_slider_accuracy = this.mods.some(mod => mod.acronym === 'CL' && (mod.settings?.using_classic_slider_accuracy === true || mod.settings?.using_classic_slider_accuracy === undefined));

        this.difficulty_reducing = Boolean(api_data.difficulty_reducing);
        this.difficulty_removing = Boolean(api_data.difficulty_removing);

        this.is_ss = Boolean(api_data.is_ss);
        this.is_fc = Boolean(api_data.is_fc);

        this.is_convert = this.ruleset_id !== this.beatmap?.ruleset_id;
        this.implied_total_score = this.legacy_total_score > 0 ? this.legacy_total_score : this.classic_total_score;

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
                this.duration = (endedAt - startedAt) / 1000; //duration in seconds
            }

            this.beatmap_attributes = BeatmapApplyModsToDifficulty(this.ruleset, this.local_beatmap, this.mods);

        }

        if(this.beatmap){
            this.beatmap.addScore(this);
        }


        if (api_data.attr_diff) {
            this.attr_diff = new ScoreDifficulty(api_data.attr_diff);
        }
        this.attr_recalc = Boolean(api_data.attr_recalc);

        //if attr_diff is missing or attr_recalc is true
        this.diff_missing = !api_data.attr_diff || this.attr_recalc;

        this.is_fc = DetermineIsScoreFC(this);

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
}

export default Score;