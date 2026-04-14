import { Buffer } from "buffer";
import React from "react";
import type { JSX } from "react";

//primarily from the actual osu api, not osualt
//should be interchangable, but osualt has less data
export interface IBeatmapSet {
    anime_cover: boolean;
    covers: IBeatmapSetCovers | null;
    beatmapset_id: number;
    artist: string;
    hype_current: number | null;
    hype_required: number | null;
    play_count: number;
    status: string;
    title: string;
    user_id: number;
    bpm: number;
    can_be_hyped: boolean;
    deleted_at: Date | null;
    discussion_enabled: boolean;
    discussion_locked: boolean;
    is_scoreable: boolean;
    last_updated: Date | null;
    legacy_thread_url: string | null;
    ranked: number;
    storyboard: boolean;
    tags: string[];
    description: string | null;
    preview_url: string | null;

    beatmaps: IBeatmap[];
    converts: IBeatmap[];
    all_beatmaps: IBeatmap[];
    grouped_beatmaps: { [beatmap_id: string | number]: IBeatmap[] };

    genres: IGenre[] | null;
    languages: ILanguage[] | null;

    ratings: number[] | null;

    //user objects
    recent_favourites: any[] | null;
    related_users: any[] | null;
    related_tags: IUserTag[] | null;

    version_count: number;

    mapper: any | null;

    description_user_data: any | null;

    media: IBeatmapSetMedia | null;
}

export interface IBeatmapSetMedia {
    beatmapset_id: number;
    youtube_id: string | null;
    spotify_id: string | null;
}

export interface IBeatmapMediaRecommendationItem {
    value: string;
    match_count: number;
    beatmapset_ids: number[];
}

export interface IBeatmapMediaRecommendationField {
    key: string;
    label: string;
    recommendations: IBeatmapMediaRecommendationItem[];
}

export interface IBeatmapMediaRecommendationResponse {
    source_field: {
        key: string;
        label: string;
        value: string;
    };
    matched_rows: number;
    recommendation_fields: IBeatmapMediaRecommendationField[];
}

export interface IBeatmapMediaArtistTitleRecommendationResponse {
    source: {
        beatmapset_id: number | null;
        artist: string;
        title: string;
    };
    matched_beatmapsets: number;
    matched_media_rows: number;
    recommendation_fields: IBeatmapMediaRecommendationField[];
    similar_beatmapsets: {
        beatmapset_id: number;
        artist: string;
        title: string;
        artist_similarity: number;
        title_similarity: number;
        similarity_score: number;
        is_cover: boolean;
    }[];
}

export interface IBeatmapSetCovers {
    cover: string;
    cover_2x: string;
    card: string;
    card_2x: string;
    list: string;
    list_2x: string;
    slimcover: string;
    slimcover_2x: string;
}

export interface IBeatmap {
    beatmap_id: number;
    id: number
    beatmapset_id: number;
    mapper_id: number;
    mapper: string;
    ruleset_id: number;
    ruleset: string;
    status: string;
    is_ranked: boolean;
    stars: number;
    ar: number;
    cs: number
    hp: number;
    od: number;
    slider_multiplier: number;
    slider_tick_rate: number;
    bpm: number;
    bpm_modded: number | null;
    length: number;
    length_modded: number | null;
    drain_time: number;
    drain_time_modded: number | null;
    count_circles: number;
    count_sliders: number;
    count_spinners: number;
    max_combo: number;
    pass_count: number;
    play_count: number;
    fc_count: number
    ss_count: number;
    favourite_count: number;
    ranked_date: Date | null;
    submitted_date: Date | null
    last_updated: Date | null;
    version: string;
    title: string;
    artist: string;
    source: string;
    tags: string[];
    checksum: string;
    track_id: number | null;
    pack: string | null;
    lchg_time: Date | null;
    attr_diff: any; // for storing difficulty attributes, can be any type depending on ruleset
    scores: Map<number, any> | null; // map of score_id to score object, can be any type depending on ruleset
    lb_value: number | null; // for leaderboards, can be any type depending on statistic
    is_played: boolean; // whether the user has played this beatmap, set externally
    score_data: any;
    user_tags: IUserTag[] | null;
    convert: boolean;
    owners: any[] | null;

    addScore(score: IScore): void;
    getScores(sort?: keyof IScore | null, direction?: 'asc' | 'desc'): IScore[] | null;
    clone(): IBeatmap;
}

export interface IUserTag {
    id: number;
    name: string;
    ruleset_id: number;
    description: string | null;
    created_at: Date | null;
    updated_at: Date | null;
}

export interface IGenre {
    id: number;
    name: string;
}

export interface ILanguage {
    id: number;
    name: string;
}

export interface IScore {
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
    maximum_statistics_perfect: number;
    maximum_statistics_great: number;
    maximum_statistics_good: number;
    maximum_statistics_ok: number;
    maximum_statistics_meh: number;
    maximum_statistics_miss: number;
    maximum_statistics_ignore_hit: number;
    maximum_statistics_ignore_miss: number;
    maximum_statistics_slider_tail_hit: number;
    maximum_statistics_legacy_combo_increase: number;
    maximum_statistics_large_bonus: number;
    maximum_statistics_large_tick_hit: number
    maximum_statistics_large_tick_miss: number;
    maximum_statistics_small_bonus: number;
    maximum_statistics_small_tick_hit: number;
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
    ended_at_str: IScoreDateStrings;
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
    implied_total_score: number | null;
    beatmap_attributes: any;
    attr_diff?: IScoreDifficulty | null;
    attr_recalc: boolean;
    diff_missing: boolean;
    star_rating: number | null;
    max_combo: number | null;
    performance: {
        base: IPerformancePoints | null;
        ss?: IPerformancePoints | null;
    } | null;
    duration: number | null;
    implied_pp: number;

    getOtherScores(): IScore[] | null;
}

export type IScoreDateStrings = {
    'YYYY-MM-DD': string;
    'YYYY-MM': string;
    'YYYY': string;
}

export type IScoreDifficulty = {
    max_combo: number;
    star_rating: number;

    first_object_start_time: number;
    last_object_end_time: number;

    //osu
    slider_factor: number
    aim_difficulty: number;
    speed_difficulty: number
    speed_note_count: number;
    nested_score_per_object: number
    aim_difficult_slider_count: number;
    aim_difficult_strain_count: number
    speed_difficult_slider_count: number;
    maximum_legacy_combo_score: number
    speed_difficult_strain_count: number;
    aim_top_weighted_slider_factor: number
    speed_top_weighted_slider_factor: number;
    legacy_score_base_multiplier: number
    flashlight_difficulty: number;

    //taiko
    rhythm_difficulty: number;
    consistency_factor: number;
    mono_stamina_factor: number;
}

export type IPerformancePoints = {
    pp: number;
    calculator: IPerformanceCalculator | null;
}

export type IPerformanceCalculator = {
    totalPerformance: number;
}

export type IPerformanceCalculatorFruits = {
    combo: number;
    num300: number;
    num100: number;
    num50: number;
    numKatu: number;
    numMiss: number;
    clockRate: number;
    preempt: number;

    Accuracy(): number;
    TotalHits(): number;
    TotalSuccessfulHits(): number;
    TotalComboHits(): number;
}

export type IPerformanceCalculatorMania = {
    countPerfect: number;
    countGreat: number;
    countGood: number;
    countOk: number;
    countMeh: number;
    countMiss: number;
    totalHits: number;
    accuracy: number;
    multiplier: number;
    difficultyValue: number;

    computeDifficultyValue(score: IScore): number;
    calculateCustomAccuracy(): number;
}

export type IPerformanceCalculatorOsu = {
    usingScoreV2: boolean;
    accuracy: number
    combo: number;
    countGreat: number;
    countMeh: number
    countOk: number;
    countMiss: number;
    sliderTailHit: number;
    countSliderEndsDropped: number;
    countSliderTickMiss: number;
    effectiveMissCount: number;
    totalImperfectHits: number;
    totalHits: number;
    totalSuccessfulHits: number;
    clockRate: number;
    hitWindows: IHitWindowsOsu;
    greatHitWindow: number;
    okHitWindow: number;
    mehHitWindow: number;
    approachRate: number;
    overallDifficulty: number;
    comboBasedEstimatedMissCount: number;
    scoreBasedEstimatedMissCount: number | null;
    speedDeviation: number | null;
    aimValue: number;
    speedValue: number;
    accuracyValue: number;
    flashlightValue: number
    multiplier: number;
    aimEstimatedSliderBreaks: number;

    computeAimValue(score: IScore): number;
    computeSpeedValue(score: IScore): number;
    computeAccuracyValue(score: IScore): number;
    computeFlashlightValue(score: IScore): number;
    calculateMissPenalty(missCount: number, difficultStrainCount: number): number;
    calculateEstimatedSliderBreaks(score: IScore, topWeightedSliderFactor: number): number;
    calculateSpeedHighDeviationNerf(score: IScore): number;
    calculateSpeedDeviation(score: IScore): number | null;
    calculateDeviation(relevantCountGreat: number, relevantCountOk: number, relevantCountMeh: number): number | null;
    CalculateRateAdjustedApproachRate(approachRate: number, clockRate: number): number;
    CalculateRateAdjustedOverallDifficulty(overallDifficulty: number, clockRate: number): number;
    calculateComboBasedEstimatedMissCount(score: IScore): number;
    getComboScalingFactor(score: IScore): number;
}

export type IPerformanceCalculatorTaiko = {
    countGreat: number;
    countOk: number;
    countMeh: number;
    countMiss: number;
    totalHits: number;
    accuracy: number;
    clockRate: number
    greatHitWindow: number;
    estimatedUnstableRate: number | null;
    totalDifficultHits: number;
    difficultyValue: number | null;
    accuracyValue: number | null;
    totalPerformance: number | null;
    hitWindows: IHitWindowsTaiko;
}

export type IHitWindowsOsu = {
    great: number;
    ok: number;
    meh: number;

    SetDifficulty(overallDifficulty: number): void;
    WindowFor(result: 'great' | 'ok' | 'meh' | 'miss'): number;
}

export type IHitWindowsTaiko = {
    great: number;
    ok: number;
    miss: number;

    SetDifficulty(overallDifficulty: number): void;
    WindowFor(result: 'great' | 'ok' | 'miss'): number;
}

export type IProfileRulesetScoreSet = {
    scores: IScore[];
    scores_map: { [id: string]: IScore };
    grades: { [grade: string]: number };

    clears: number;
    ranked_clears: number;

    fc_count: number;
    max_combo: number;

    missing_difficulty: number;

    implied_total_score: number;
    implied_total_score_ss: number;

    score: number;
    score_ss: number;

    performance_points: number;
    total_performance_points: number;
    bonus_performance_points: number;
    average_performance: number;

    duration_seconds: number;

    recent_scores: IScore[];
    top_scores: IScore[];

    highlighted_scores: {
        top_pp: IScore | null;
        top_score: IScore | null;
        top_stars_fc: IScore | null;
        top_stars_ss: IScore | null;
        oldest: IScore | null;
    };

    sessions: ISessionCollection;

    scores_reordered: {
        [key: string]: IScore[];
    };

    average_accuracy: number;
    average_length: number;
    average_stars: number;
    average_score: number;
    average_implied_score: number;
    fc_rate: number;

    addScore(score: IScore): void;
    reorder(param: keyof IScore, descending?: boolean): void;
    calculate(): void;
    getById(id: string): IScore | undefined;
}

export type IProfileRulesetStatisticsPacks = {
    packs: any[];
    ruleset: string | null;

    processPacks(beatmaps: IBeatmap[], packs: any): void;
    processScores(scores: IScore[], beatmaps: IBeatmap[]): void;
}

export type IProfileRulesetStatistics = {
    without_loved: boolean;

    beatmaps: IBeatmap[];
    beatmaps_with_converts: IBeatmap[];
    beatmaps_map: { [beatmap_id: string]: IBeatmap };
    beatmaps_with_converts_map: { [beatmap_id: string]: IBeatmap };

    ruleset: string | null;

    beatmap_count: number;
    beatmap_count_with_converts: number;
    beatmap_count_ranked: number;
    beatmap_count_ranked_with_converts: number;

    scores_set: IProfileRulesetScoreSet;
    scores_set_by_pp: IProfileRulesetScoreSet;
    scores_set_by_score: IProfileRulesetScoreSet;
    pack_statistics: IProfileRulesetStatisticsPacks;

    completion: number;
    completion_with_converts: number;

    completion_statistics: any;

    implied_playtime_seconds: number;
    generate_periodic: boolean;

    periodic: {
        [interval: string]: {
            [date_string: string]: IScore[];
        }
    };

    periodic_by_pp: {
        [interval: string]: {
            [date_string: string]: IScore[];
        }
    };

    periodic_by_score: {
        [interval: string]: {
            [date_string: string]: IScore[];
        }
    };

    periodic_by_year: {
        [year: string]: {
            [interval: string]: {
                [date_string: string]: IScore[];
            }
        }
    };

    periodic_graph_data: {
        [interval: string]: {
            incremental: {
                [date_string: string]: {
                    clears: number | null;
                    scores: number | null;
                    implied_score: number | null;
                    implied_score_ss: number | null;
                    lazer_score: number | null;
                    lazer_score_ss: number | null;
                    pp: number | null;
                    raw_pp: number | null;
                    length_seconds: number | null;
                    grades_xh: number | null;
                    grades_x: number | null;
                    grades_sh: number | null;
                    grades_s: number | null;
                    grades_a: number | null;
                    grades_b: number | null;
                    grades_c: number | null;
                    grades_d: number | null;
                }
            };
            cumulative: {
                [date_string: string]: {
                    clears: number | null;
                    scores: number | null;
                    implied_score: number | null;
                    implied_score_ss: number | null;
                    lazer_score: number | null;
                    lazer_score_ss: number | null;
                    pp: number | null;
                    raw_pp: number | null;
                    length_seconds: number | null;
                    grades_xh: number | null;
                    grades_x: number | null;
                    grades_sh: number | null;
                    grades_s: number | null;
                    grades_a: number | null;
                    grades_b: number | null;
                    grades_c: number | null;
                    grades_d: number | null;
                }
            };
            average: {
                [date_string: string]: {
                    clears: number | null;
                    scores: number | null;
                    implied_score: number | null;
                    implied_score_ss: number | null;
                    lazer_score: number | null;
                    lazer_score_ss: number | null;
                    pp: number | null;
                    raw_pp: number | null;
                    length_seconds: number | null;
                    grades_xh: number | null;
                    grades_x: number | null;
                    grades_sh: number | null;
                    grades_s: number | null;
                    grades_a: number | null;
                    grades_b: number | null;
                    grades_c: number | null;
                    grades_d: number | null;
                }
            };
            highest: {
                [date_string: string]: {
                    clears: number | null;
                    scores: number | null;
                    implied_score: number | null;
                    implied_score_ss: number | null;
                    lazer_score: number | null;
                    lazer_score_ss: number | null;
                    pp: number | null;
                    raw_pp: number | null;
                    length_seconds: number | null;
                    grades_xh: number | null;
                    grades_x: number | null;
                    grades_sh: number | null;
                    grades_s: number | null;
                    grades_a: number | null;
                    grades_b: number | null;
                    grades_c: number | null;
                    grades_d: number | null;
                }
            };
            median: {
                [date_string: string]: {
                    clears: number | null;
                    scores: number | null;
                    implied_score: number | null;
                    implied_score_ss: number | null;
                    lazer_score: number | null;
                    lazer_score_ss: number | null;
                    pp: number | null;
                    raw_pp: number | null;
                    length_seconds: number | null;
                    grades_xh: number | null;
                    grades_x: number | null;
                    grades_sh: number | null;
                    grades_s: number | null;
                    grades_a: number | null;
                    grades_b: number | null;
                    grades_c: number | null;
                    grades_d: number | null;
                }
            }
        };
    };

    charts: {
        [key: string]: any;
    };

    addScore(score: IScore): void;
    calculate(): void;
    calculatePeriodicGraphData(): void;
    calculatePeriodic(sorted_scores: IScore[], interval: string): void;
    calculateCompletionStatistics(): void;
    calculateAccuracyDifficultyScatterChart(limit: number): void;
    calculatePerformanceSpreadChart(limit: number): void;
    calculateScoreSpreadChart(limit: number): void;
    getBeatmapsMap(with_converts: boolean): { [beatmap_id: string]: IBeatmap };
}

export type IProfileStatistics = {
    rulesets: {
        [ruleset: string]: IProfileRulesetStatistics;
    };
}

export type ISessionCollection = {
    sessions: ISession[];
    session_map: { [id: string]: ISession };
    length: number;
    play_time: number;
    duration_longest: number;
    duration_average: number;

    get(): ISession[];
    getById(id: string): ISession | undefined;
    forEach(callback: (session: ISession, index: number) => void): void;
}

export type ISession = {
    id: string;
    start: Date;
    end: Date;
    scores: IScore[];
    breaks: ISessionBreak[];
    duration: number;

    break_count: number;
    total_break_time: number
    average_break_time: number;
    longest_break_time: number;

    score_count: number;

    grades: { [grade: string]: number };

    cumulative_implied_total_score: number
    average_implied_total_score: number;
    max_implied_total_score: number;

    cumulative_lazer_score: number
    average_lazer_score: number;
    max_lazer_score: number;

    cumulative_pp: number
    average_pp: number;
    max_pp: number;
}

export type ISessionBreak = {
    start: Date;
    end: Date;
    duration: number;
}

export type ISessionCollectionActivity = {
    scores: IScore[];
    start: Date | null;
    end: Date | null
    done: boolean;
    breaks: ISessionBreak[];
    duration: number;
}

export type IOsuBuffer = {
    buffer: Buffer;
    position: number;
    length: number;

    toString(type?: string): string;
    canRead(length: number): boolean;
    EOF(): boolean;
    Slice(length: number, asOsuBuffer?: boolean): IOsuBuffer | Buffer;
    Peek(): number;
    ReadByte(): number;
    ReadInt(byteLength: number): number;
    ReadUInt(byteLength: number): number;
    ReadInt8(): number;
    ReadUInt8(): number;
    ReadInt16(): number;
    ReadUInt16(): number;
    ReadInt32(): number;
    ReadUInt32(): number;
    ReadInt64(): number;
    ReadUInt64(): number;
    ReadFloat(): number;
    ReadDouble(): number;
    ReadString(length: number): string;
    ReadVarInt(): number;
    ReadULeb128(): number;
    ReadBoolean(): boolean;
    ReadOsuString(): string;
}

export type IOsuDb = {
    Data: ArrayBuffer;

    OsuVersion: number;
    FolderCount: number;
    AccountUnlocked: boolean;
    AccountUnlockDate: Date | null;
    AccountName: string;
    BeatmapCount: number;
    Beatmaps: any[];
    AccountRank: number;
}

export type IOsuLegacyScoreMissCalculator = {
    score: IScore;
    overrides: any;

    calculate(): number;
    calculateScoreAtCombo(combo: number, relevantComboPerObject: number, scoreV1Multiplier: number): number;
    calculateMaximumMissCount(): number;
    calculateRelevantComboPerObject(): number;
    getLegacyScoreMultiplier(): number;
}

export type NumberFlowStyleWithVars = React.CSSProperties & {
    '--number-flow-mask-height'?: string;
};

export type IConfig = {
    WEBSITE_NAME: string;
    VERSION: string;
    DEV_MODE: boolean;
    API: {
        [mode: string]: {
            API_URL: string;
            OSU_CLIENT_ID: number;
            AUTH_REDIRECT: string;
        }
    };
    NOTIFICATIONS: {
        position: string;
        theme: string;
    };
    WIKI_URL: string;
    TEAMS_URL: string;
    DISCORD_URL: string;
    DISCORD_ID: string;
    PAYPAL_DONATION_URL: string;
};

export type IRouteObject = {
    path: string;
    element: JSX.Element;
    children?: IRouteObject[];
}

export type IAuthUser = {
    id: number;
    token_type: string;
}

export type IScoreMod = {
    acronym: string;
    settings: IScoreModSettings | null;
}

export type IScoreModSettings = {
    [key: string]: any;
}

//the mod data from json, these are capitalized and have different data than IScoreMod
export type IDatabasedMod = {
    Acronym: string;
    Name: string;
    Settings: IScoreModSettings | null;
    IncompatibleMods: string[];
    UserPlayable: boolean;
}

export type IModDatabase = {
    [ruleset: string]: IRulesetModDatabase;
}

export type IRulesetModDatabase = {
    Name: string;
    RulesetID: number;
    Mods: IDatabasedMod[];
}

export type IReputationEntry = {
    id: number;
    user_id: number; // the user who gave the reputation
    target_id: number; // the ID who received the reputation
    target_type: ReputationType; // the type of the target, 'user', 'score', 'beatmap', only user is currently implemented
    created_at: Date;
}

export const reputationTypes = ['user', 'beatmap', 'score'] as const;
export type ReputationType = typeof reputationTypes[number];

export interface IRouteBeatmapResult {
    beatmapSet: IBeatmapSet | null;
    beatmap: IBeatmap | null;
    difficulty?: IScoreDifficulty | null; //beatmap specific
    scores: IScore[] | null; //beatmap specific
    ruleset: string;
}