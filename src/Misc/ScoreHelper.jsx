import { blue, green, grey, lightBlue, lightGreen, red, yellow } from "@mui/material/colors";

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