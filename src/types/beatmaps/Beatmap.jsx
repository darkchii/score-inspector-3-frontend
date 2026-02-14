import { GetRulesetNameFromId } from "../../util/Helper";

class Beatmap {
    constructor(api_data) {
        if (api_data === null || api_data === undefined) {
            throw new Error("Invalid api_data for Beatmap");
        }

        this.beatmap_id = Number(api_data.beatmap_id);
        this.id = this.beatmap_id; // alias for id, used in some places
        this.beatmapset_id = Number(api_data.beatmapset_id);

        this.mapper_id = Number(api_data.mapper_id);
        this.mapper = api_data.mapper;

        //its either .ruleset_id or .mode, test both
        this.ruleset_id = api_data.ruleset_id !== undefined ? Number(api_data.ruleset_id) : Number(api_data.mode);
        this.ruleset = GetRulesetNameFromId(this.ruleset_id);

        this.status = api_data.status;
        this.is_ranked = this.status === 'ranked' || this.status === 'approved';

        this.stars = Number(api_data.stars);

        this.ar = Number(api_data.ar);
        this.cs = Number(api_data.cs);
        this.hp = Number(api_data.hp);
        this.od = Number(api_data.od);

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
    }

    addScore(score) {
        if (!this.scores) {
            this.scores = new Map();
        }

        if (this.scores && this.scores.has(score.id)) {
            return;
        }

        this.scores.set(score.id, score);
    }

    getScores(sort = null, direction = 'desc') {
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