//Helper functions for score data
export function GetStarRating(score) {
    if (!score.diff_missing) {
        return score.attr_diff.star_rating;
    }

    return score.beatmap ? score.beatmap.stars : null;
}