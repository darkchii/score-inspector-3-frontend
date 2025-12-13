class ScoreDifficulty {
    constructor(api_data) {
        this.max_combo = api_data.max_combo;
        this.star_rating = api_data.star_rating;

        this.first_object_start_time = api_data.first_object_start_time ? Number(api_data.first_object_start_time) : 0;
        this.last_object_end_time = api_data.last_object_end_time ? Number(api_data.last_object_end_time) : 0;

        //osu
        this.slider_factor = api_data.slider_factor ? Number(api_data.slider_factor) : 0;
        this.aim_difficulty = api_data.aim_difficulty ? Number(api_data.aim_difficulty) : 0;
        this.speed_difficulty = api_data.speed_difficulty ? Number(api_data.speed_difficulty) : 0;
        this.speed_note_count = api_data.speed_note_count ? Number(api_data.speed_note_count) : 0;
        this.nested_score_per_object = api_data.nested_score_per_object ? Number(api_data.nested_score_per_object) : 0;
        this.aim_difficult_slider_count = api_data.aim_difficult_slider_count ? Number(api_data.aim_difficult_slider_count) : 0;
        this.aim_difficult_strain_count = api_data.aim_difficult_strain_count ? Number(api_data.aim_difficult_strain_count) : 0;
        this.speed_difficult_slider_count = api_data.speed_difficult_slider_count ? Number(api_data.speed_difficult_slider_count) : 0;
        this.maximum_legacy_combo_score = api_data.maximum_legacy_combo_score ? Number(api_data.maximum_legacy_combo_score) : 0;
        this.speed_difficult_strain_count = api_data.speed_difficult_strain_count ? Number(api_data.speed_difficult_strain_count) : 0;
        this.aim_top_weighted_slider_factor = api_data.aim_top_weighted_slider_factor ? Number(api_data.aim_top_weighted_slider_factor) : 0;
        this.speed_top_weighted_slider_factor = api_data.speed_top_weighted_slider_factor ? Number(api_data.speed_top_weighted_slider_factor) : 0;
        this.legacy_score_base_multiplier = api_data.legacy_score_base_multiplier ? Number(api_data.legacy_score_base_multiplier) : 0;
    
        //taiko
        this.rhythm_difficulty = api_data.rhythm_difficulty ? Number(api_data.rhythm_difficulty) : 0;
        this.consistency_factor = api_data.consistency_factor ? Number(api_data.consistency_factor) : 0;
        this.mono_stamina_factor = api_data.mono_stamina_factor ? Number(api_data.mono_stamina_factor) : 0;

        //fruits
        //none

        //mania
        //none
    }
}

export default ScoreDifficulty;