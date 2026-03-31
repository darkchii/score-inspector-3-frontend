import type { IBeatmap, IBeatmapSet, IBeatmapSetCovers, IGenre, ILanguage, IUserTag } from "../types";
import UserTag from "../UserTag";
import Beatmap from "./Beatmap";

class BeatmapSet implements IBeatmapSet {
    anime_cover: boolean;
    covers: IBeatmapSetCovers | null = null;
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

    genres: IGenre[] | null = null;
    languages: ILanguage[] | null = null;

    ratings: number[] | null = null;

    recent_favourites: any[] | null = null;
    related_users: any[] | null = null;

    related_tags: IUserTag[] | null = null;

    version_count: number = 0;
    all_beatmaps: IBeatmap[] = [];
    grouped_beatmaps: { [beatmap_id: string]: IBeatmap[];[beatmap_id: number]: IBeatmap[]; } = {};

    mapper: any | null = null;

    description_user_data: any | null = null;

    constructor(api_data: any) {
        this.beatmapset_id = api_data.beatmapset_id || api_data.id;
        this.anime_cover = api_data.anime_cover;
        let _covers = api_data.beatmapset_covers || api_data.covers || null;
        this.covers = _covers ? {
            cover: _covers.cover,
            cover_2x: _covers[`cover@2x`],
            card: _covers.card,
            card_2x: _covers[`card@2x`],
            list: _covers.list,
            list_2x: _covers[`list@2x`],
            slimcover: _covers.slimcover,
            slimcover_2x: _covers[`slimcover@2x`],
        } : null;

        this.artist = api_data.beatmapset_artist_unicode || api_data.artist;
        this.hype_current = api_data.beatmapset_hype_current || api_data.hype_current || null;
        this.hype_required = api_data.beatmapset_hype_required || api_data.hype_required || null;
        this.play_count = api_data.beatmapset_play_count || api_data.play_count;
        this.status = api_data.beatmapset_status_raw;
        this.title = api_data.beatmapset_title_unicode || api_data.title;
        this.user_id = api_data.beatmapset_user_id || api_data.user_id;
        this.bpm = api_data.beatmapset_bpm || api_data.bpm;
        this.can_be_hyped = api_data.beatmapset_can_be_hyped || api_data.can_be_hyped;
        this.deleted_at = api_data.beatmapset_deleted_at ? new Date(api_data.beatmapset_deleted_at) : null;
        this.discussion_enabled = api_data.beatmapset_discussion_enabled || api_data.discussion_enabled;
        this.discussion_locked = api_data.beatmapset_discussion_locked || api_data.discussion_locked;
        this.is_scoreable = api_data.beatmapset_is_scoreable || api_data.is_scoreable;
        this.last_updated = api_data.beatmapset_last_updated ? new Date(api_data.beatmapset_last_updated) : null;
        this.legacy_thread_url = api_data.beatmapset_legacy_thread_url || api_data.legacy_thread_url || null;
        this.ranked = api_data.beatmapset_ranked || api_data.ranked || 0;
        this.storyboard = api_data.beatmapset_storyboard || api_data.storyboard;
        let _tags = api_data.beatmapset_tags || api_data.tags || "";
        this.tags = _tags ? _tags.split(' ') : [];

        this.description = api_data.description?.description || null;
        this.preview_url = api_data.preview_url || null;

        this.related_tags = api_data.related_tags ? api_data.related_tags.map((tagData: any) => new UserTag(tagData)) : null;

        let _maps = api_data.beatmapset || api_data.beatmaps || [];
        this.beatmaps = _maps.map((beatmapData: any) => new Beatmap(beatmapData, this.related_tags));
        this.converts = api_data.converts ? api_data.converts.map((beatmapData: any) => new Beatmap(beatmapData, this.related_tags)) : [];

        this.all_beatmaps = [...this.beatmaps, ...this.converts];

        // group beatmaps by beatmap_id
        this.all_beatmaps.forEach((beatmap) => {
            if (!this.grouped_beatmaps[beatmap.beatmap_id]) {
                this.grouped_beatmaps[beatmap.beatmap_id] = [];
            }
            this.grouped_beatmaps[beatmap.beatmap_id].push(beatmap);
        });

        //reorder .beatmaps by stars
        this.beatmaps.sort((a, b) => a.stars - b.stars);
        this.converts.sort((a, b) => a.stars - b.stars);
        
        this.genres = api_data.genres ? api_data.genres.map((genreData: any) => ({
            id: genreData.id,
            name: genreData.name,
        })) : null;

        this.languages = api_data.languages ? api_data.languages.map((languageData: any) => ({
            id: languageData.id,
            name: languageData.name,
        })) : null;

        this.ratings = api_data.ratings ? Object.values(api_data.ratings) : null;

        this.recent_favourites = api_data.recent_favourites || null;
        this.related_users = api_data.related_users || null;

        this.mapper = api_data.mapper || null;
        this.description_user_data = api_data.description_user_data || null;
    }
}

export default BeatmapSet;