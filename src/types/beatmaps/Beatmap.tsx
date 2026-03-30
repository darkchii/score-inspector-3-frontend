import { GetRulesetNameFromId } from "../../util/Helper";
import type { IBeatmap, IScore, IUserTag } from "../types";

class Beatmap implements IBeatmap {
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
    bpm_modded: number | null = null;

    length: number;
    length_modded: number | null = null;
    drain_time: number;
    drain_time_modded: number | null = null;

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
    tags: string[] = [];
    checksum: string;
    track_id: number | null;
    pack: string | null;
    lchg_time: Date | null;
    attr_diff: any; // for storing difficulty attributes, can be any type depending on ruleset

    scores: Map<number, any> | null = null; // map of score_id to score object, can be any type depending on ruleset

    lb_value: number | null = null; // for leaderboards, can be any type depending on statistic

    is_played: boolean = false; // whether the user has played this beatmap, set externally
    score_data: any = null; // for storing additional score data related to this beatmap, can be any type depending on ruleset/statistic

    user_tags: IUserTag[] | null = null;

    convert: boolean = false;

    owners: any[] | null = null;

    constructor(api_data: any, related_tags: IUserTag[] | null = null) {
        if (api_data === null || api_data === undefined) {
            throw new Error("Invalid api_data for Beatmap");
        }

        this.beatmap_id = Number(api_data.beatmap_id || api_data.id);
        this.id = this.beatmap_id; // alias for id, used in some places
        this.beatmapset_id = Number(api_data.beatmapset_id);

        this.mapper_id = Number(api_data.mapper_id);
        this.mapper = api_data.mapper;

        //its either .ruleset_id or .mode, test both
        // this.ruleset_id = api_data.ruleset_id !== undefined ? Number(api_data.ruleset_id) : Number(api_data.mode);
        //so this is annoying
        //.ruleset_id is always number
        //.mode can be number or string
        this.ruleset_id = 0; // default to osu!standard
        if (api_data.ruleset_id !== undefined) {
            this.ruleset_id = Number(api_data.ruleset_id);
        } else if (api_data.mode !== undefined) {
            if (typeof api_data.mode === "number") {
                this.ruleset_id = Number(api_data.mode);
            } else if (typeof api_data.mode === "string") {
                //convert mode string to ruleset_id
                switch (api_data.mode.toLowerCase()) {
                    case "osu":
                        this.ruleset_id = 0;
                        break;
                    case "taiko":
                        this.ruleset_id = 1;
                        break;
                    case "fruits":
                    case "catch":
                        this.ruleset_id = 2;
                        break;
                    case "mania":
                        this.ruleset_id = 3;
                        break;
                    default:
                        throw new Error("Invalid mode string for Beatmap ruleset: " + api_data.mode);
                }
            }
        } else {
            this.ruleset_id = 0; // default to osu!standard if not provided
        }
        this.ruleset = GetRulesetNameFromId(this.ruleset_id);

        this.status = api_data.status;
        this.is_ranked = this.status === 'ranked' || this.status === 'approved';

        this.stars = Number(api_data.stars || api_data.difficulty_rating);

        this.ar = Number(api_data.ar);
        this.cs = Number(api_data.cs);
        this.hp = Number(api_data.hp || api_data.drain);
        this.od = Number(api_data.od || api_data.accuracy);

        this.slider_multiplier = 1.4;
        this.slider_tick_rate = 1.0;

        this.bpm = Number(api_data.bpm);

        this.length = Number(api_data.length);
        this.drain_time = Number(api_data.drain_time);

        this.count_circles = Number(api_data.count_circles);
        this.count_sliders = Number(api_data.count_sliders);
        this.count_spinners = Number(api_data.count_spinners);

        this.max_combo = Number(api_data.max_combo);

        this.pass_count = Number(api_data.passcount);
        this.play_count = Number(api_data.playcount);
        this.fc_count = Number(api_data.fc_count);
        this.ss_count = Number(api_data.ss_count);
        this.favourite_count = Number(api_data.favourite_count);

        this.ranked_date = api_data.ranked_date ? new Date(api_data.ranked_date) : null;
        this.submitted_date = api_data.submitted_date ? new Date(api_data.submitted_date) : null;
        this.last_updated = api_data.last_updated ? new Date(api_data.last_updated) : null;

        this.version = api_data.version;

        this.title = api_data.title;
        this.artist = api_data.artist;
        this.source = api_data.source;

        if (api_data.tags && typeof api_data.tags === "string") {
            this.tags = api_data.tags ? api_data.tags.split(" ") : [];
        } else if (Array.isArray(api_data.tags)) {
            this.tags = api_data.tags;
        }

        this.checksum = api_data.checksum;

        this.track_id = api_data.track_id ? Number(api_data.track_id) : null;

        this.pack = api_data.pack ? api_data.pack : null;

        this.lchg_time = api_data.lchg_time ? new Date(api_data.lchg_time) : null;

        this.attr_diff = null;

        this.lb_value = null; // for leaderboards, is always set externally

        if(api_data.top_tag_ids && related_tags) {
            //top_tag_ids is an array iwth {tag_id: number, count: number}
            const user_tags: IUserTag[] = [];
            for (const tag_info of api_data.top_tag_ids) {
                const tag = related_tags.find(t => t.id === tag_info.tag_id);
                if (tag) {
                    user_tags.push(tag);
                }
            }
            this.user_tags = user_tags;
        }

        this.convert = api_data.convert || false;

        this.owners = api_data.owners || null;
    }

    addScore(score: IScore) {
        if (!this.scores) {
            this.scores = new Map();
        }

        if (this.scores && this.scores.has(score.id)) {
            return;
        }

        this.scores.set(score.id, score);
    }

    getScores(sort: keyof IScore | null = null, direction: 'asc' | 'desc' = 'desc') {
        if (!this.scores) {
            return [];
        }

        let scoresArray = Array.from(this.scores.values());

        if (sort) {
            scoresArray.sort((a, b) => {
                if (a[sort] < b[sort]) return direction === 'asc' ? -1 : 1;
                if (a[sort] > b[sort]) return direction === 'asc' ? 1 : -1;
                return 0;
            }); 
        }

        return scoresArray;
    }

    clone() {
        let copy = new Beatmap(JSON.parse(JSON.stringify(this)));
        // Ensure dates are properly cloned
        copy.ranked_date = this.ranked_date ? new Date(this.ranked_date) : null;
        copy.submitted_date = this.submitted_date ? new Date(this.submitted_date) : null;
        copy.last_updated = this.last_updated ? new Date(this.last_updated) : null;
        copy.lchg_time = this.lchg_time ? new Date(this.lchg_time) : null;
        return copy;
    }
}

export default Beatmap;