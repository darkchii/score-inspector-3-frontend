import ModData from "../data/Mods.json";
import type { IScore } from "../types/types";

export const FILTER_FIELDS = [
    { label: 'ID', value: 'id', type: 'number' },
    { label: 'Beatmap ID', value: 'beatmap.beatmap_id', type: 'number' },
    { label: 'Accuracy', value: 'accuracy', type: 'number' },
    { label: 'PP', value: 'implied_pp', type: 'number' },
    { label: 'Combo', value: 'combo', type: 'number' },
    { label: 'Max Combo', value: 'beatmap.max_combo', type: 'number' },
    { label: 'Circles', value: 'beatmap.circles', type: 'number' },
    { label: 'Sliders', value: 'beatmap.sliders', type: 'number' },
    { label: 'Spinners', value: 'beatmap.spinners', type: 'number' },
    { label: 'Stars', value: 'star_rating', type: 'number' },
    { label: 'Ranked Date', value: 'beatmap.ranked_date', type: 'datetime' },
    { label: 'Played Date', value: 'ended_at', type: 'datetime' },
    { label: 'Score', value: 'total_score', type: 'number' },
    { label: "Grade", value: "grade", type: "grade", group: "Score" },
    { label: "Mapper", value: "beatmap.mapper", type: "string", group: "Beatmap" },
    { label: "Title", value: "beatmap.title", type: "string", group: "Beatmap" },
    { label: "Artist", value: "beatmap.artist", type: "string", group: "Beatmap" },
]

//convert ModData to keyed by ruleset (ModData is currently an array of rulesets) ModData[0].Name = "osu"
export const MOD_REGISTRY = {
    osu: ModData[0].Mods,
    taiko: ModData[1].Mods,
    fruits: ModData[2].Mods,
    mania: ModData[3].Mods
}

export const GRADE_ORDER = [
    "XH",
    "X",
    "SH",
    "S",
    "A",
    "B",
    "C",
    "D"
]

export const EMPTY_SORT = {
    field: null,   // e.g. "pp"
    direction: "asc" // "asc" | "desc"
}

export function FilterScores(scores: IScore[], filter: any[]): IScore[] {
    return scores.filter(score => {
        for (const f of filter) {
            switch (f.type) {
                case 'number':
                    if (!ScoreFilterTestNumber(score, f)) return false;
                    break;
                default:
                    console.warn("Unsupported filter type:", f.type);
                    return false;
            }
        }
        return true;
    });
}

function ScoreFilterGetFieldValue(score: IScore, field: string): any {
    const fieldParts = field.split('.');
    let fieldValue = score;
    for (const part of fieldParts) {
        fieldValue = fieldValue ? fieldValue[part as keyof IScore] : null;
    }
    return fieldValue;
}

function ScoreFilterTestNumber(score: IScore, filter: any): boolean {
    const scoreField = ScoreFilterGetFieldValue(score, filter.field);
    const numericValue = parseFloat(filter.value);
    if (isNaN(numericValue) || isNaN(scoreField)) return false;

    switch (filter.operator) {
        case 'equals':
            return scoreField === numericValue;
        case 'not_equals':
            return scoreField !== numericValue;
        case 'greater_than':
            return scoreField > numericValue;
        case 'less_than':
            return scoreField < numericValue;
        case 'greater_equals':
            return scoreField >= numericValue;
        case 'less_equals':
            return scoreField <= numericValue;
        default:
            return false;
    }
}