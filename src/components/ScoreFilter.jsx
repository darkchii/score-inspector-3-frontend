import { Alert, Autocomplete, Box, Button, Grid, IconButton, MenuItem, Paper, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { FormatNumber, GetNestedValue } from "../util/Helper";
import ModData from "../data/Mods.json";
import Mod from "./Mod";

const ORDER_OPTIONS = [
    { value: "implied_pp", label: "PP" },
    { value: "accuracy", label: "Accuracy" },
    { value: "implied_total_score", label: "Score" },
    { value: "total_score", label: "Lazer Score" },
    { value: "combo", label: "Combo" },
    { value: "star_rating", label: "Stars" },
    { value: "duration", label: "Length" },
    { value: "grade", label: "Grade" }, //special case
    { value: "local_beatmap.bpm_modded", label: "BPM" },
    { value: "attr_diff.aim_difficulty", label: "Aim Diff" },
    { value: "attr_diff.speed_difficulty", label: "Speed Diff" },
    { value: "attr_diff.rhythm_difficulty", label: "Rhythm Diff" },
    { value: "ended_at", label: "Date Played" },
    { value: "local_beatmap.ranked_date", label: "Date Ranked" },
]

const FILTER_OPTIONS = [
    { value: "local_beatmap.title", label: "Title", type: "text" },
    { value: "local_beatmap.artist", label: "Artist", type: "text" },
    { value: "local_beatmap.mapper", label: "Mapper", type: "text" },
    { value: "implied_pp", label: "PP", type: "range", min: 0, max: 3000, steps: 1, format: (v) => `${v}pp` },
    { value: "accuracy", label: "Accuracy", type: "range", min: 0, max: 1, steps: 0.01, format: (v) => `${(v * 100).toFixed(2)}%` },
    { value: "implied_total_score", label: "Score", type: "range", min: 0, max: 1, steps: 1, scale: (v) => v ** 2 },
    { value: "total_score", label: "Lazer Score", type: "range", min: 0, max: 1, steps: 1 },
    { value: "combo", label: "Combo", type: "range", min: 0, max: 1, steps: 1, format: (v) => `${FormatNumber(v)}x` },
    { value: "star_rating", label: "Stars", type: "range", min: 0, max: 10, steps: 0.1, format: (v) => `${v}★` },
    { value: "ended_at", label: "Date Played", type: "date_range", min: 0, max: 1, format: (v) => new Date(v).toLocaleDateString(), steps: 8.64e+7 }, //steps should be days by ms
    { value: "local_beatmap.ranked_date", label: "Date Ranked", type: "date_range", min: 0, max: 1, format: (v) => new Date(v).toLocaleDateString(), steps: 8.64e+7 }, //steps should be days by ms
    { value: "is_fc", label: "Is FC", type: "boolean" },
    { value: "highest_pp", label: "Highest PP", type: "boolean", description: "Whether the score is the player's highest PP on the beatmap" },
    { value: "highest_score", label: "Highest Score", type: "boolean", description: "Whether the score is the player's highest score on the beatmap" },
    { value: "mod_speed_change", label: "Speed Adjust", type: "range", min: 0.5, max: 2, steps: 0.1, format: (v) => `${v}x` },
    { value: "is_lazer", label: "Is Lazer", type: "boolean", description: "Whether the score is set in osu!lazer" },
    //reformat length to mm:ss
    {
        value: "duration", label: "Length", type: "range", min: 0, max: 1, steps: 1, format: (v) => {
            const minutes = Math.floor(v / 60);
            const seconds = Math.floor(v % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    { value: "local_beatmap.bpm_modded", label: "BPM", type: "range", min: 0, max: 1, steps: 1, format: (v) => `${Math.round(v)} BPM` },
    { value: "attr_diff.aim_difficulty", label: "Aim Diff", type: "range", min: 0, max: 10, steps: 0.1, rulesets: ['osu'], description: "Only applicable for osu! mode" },
    { value: "attr_diff.speed_difficulty", label: "Speed Diff", type: "range", min: 0, max: 10, steps: 0.1, rulesets: ['osu'], description: "Only applicable for osu! mode" },
    { value: "attr_diff.rhythm_difficulty", label: "Rhythm Diff", type: "range", min: 0, max: 10, steps: 0.1, rulesets: ['taiko'], description: "Only applicable for Taiko mode" },
    { value: "mods", label: "Mods", type: "mods", description: "Filters to scores that contain all selected mods" },
]

const FilterScores = (scores, filter, order, direction) => {
    let sortedScores = [...scores];

    // Filtering
    for (const key in filter) {
        const { operator, value } = filter[key];
        switch (operator) {
            case 'range':
                sortedScores = sortedScores.filter(score => {
                    const scoreValue = GetNestedValue(score, key);
                    return scoreValue >= value[0] && scoreValue <= value[1];
                });
                break;
            case 'date_range':
                sortedScores = sortedScores.filter(score => {
                    const scoreValue = GetNestedValue(score, key);
                    // return scoreValue >= value[0] && scoreValue <= value[1];
                    //assume the given value is a date object
                    return new Date(scoreValue) >= new Date(value[0]) && new Date(scoreValue) <= new Date(value[1]);
                });
                break;
            case 'boolean':
                sortedScores = sortedScores.filter(score => {
                    const scoreValue = GetNestedValue(score, key);
                    if (value === "any") return true;
                    const boolValue = value === "true";
                    return scoreValue === boolValue;
                });
                break;
            case 'text':
                sortedScores = sortedScores.filter(score => {
                    const scoreValue = GetNestedValue(score, key);
                    return scoreValue && scoreValue.toLowerCase().includes(value.toLowerCase());
                });
                break;
            case 'mods':
                sortedScores = sortedScores.filter(score => {
                    const scoreMods = score.mods ? score.mods.map(mod => mod.acronym) : [];
                    return value.every(mod => scoreMods.includes(mod.Acronym));
                });
                break;
            default:
                console.warn("Unsupported filter operator:", operator);
        }
    }

    // Sorting
    if (order && order.value) {
        if (order.value === "grade") {
            const gradeOrder = { "XH": 7, "X": 6, "SH": 5, "S": 4, "A": 3, "B": 2, "C": 1, "D": 0 };
            sortedScores.sort((a, b) => {
                const aValue = gradeOrder[GetNestedValue(a, order.value)] || 0;
                const bValue = gradeOrder[GetNestedValue(b, order.value)] || 0;
                if (aValue < bValue) return direction === "asc" ? -1 : 1;
                if (aValue > bValue) return direction === "asc" ? 1 : -1;
                return 0;
            });
        } else {
            sortedScores.sort((a, b) => {
                const aValue = GetNestedValue(a, order.value);
                const bValue = GetNestedValue(b, order.value);
                if (aValue < bValue) return direction === "asc" ? -1 : 1;
                if (aValue > bValue) return direction === "asc" ? 1 : -1;
                return 0;
            }
            );
        }
    }
    return sortedScores;
}

//does not do filtering on it's own, just provides the UI and state
function ScoreFilter({ data, onFiltered, currentRuleset }) {
    const [sort, setSort] = useState(ORDER_OPTIONS[0]);
    const [direction, setDirection] = useState("desc");
    const [filter, setFilter] = useState({});
    const [filterSet, setFilterSet] = useState(false); //a local copy to readjust max values to the current score set

    useEffect(() => {
        setSort(ORDER_OPTIONS[0]);
        setDirection("desc");
        setFilter({});

        const clonedFilterOptions = FILTER_OPTIONS.map(option => ({ ...option }));
        for (const option of clonedFilterOptions) {
            const values = data.map(score => GetNestedValue(score, option.value));
            if (option.type === "date_range") {
                option.min = values.length > 0 ? Math.min(...values) : 0;
                option.max = values.length > 0 ? Math.max(...values) : Date.now();
            } else {
                option.max = Math.ceil(Math.max(...values));
            }
        }
        setFilterSet(clonedFilterOptions);
    }, [data]);

    const applyFilter = () => {
        return FilterScores(data, filter, sort, direction);
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Score Filter
            </Typography>

            {/* APPLY FILTER BUTTON */}
            <Button variant="contained" onClick={() => onFiltered(applyFilter())} fullWidth>
                Apply
            </Button>

            <Stack spacing={1} sx={{ my: 3 }}>
                {/* Sorting section (value + order) */}
                <Box key={sort?.value || ""} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ minWidth: 80 }}>Sort By</Typography>
                    <Select
                        fullWidth
                        value={sort?.value || ""}
                        onChange={(e) => setSort(ORDER_OPTIONS.find(o => o.value === e.target.value))}
                        displayEmpty
                        size="small"
                    >
                        <MenuItem value="">None</MenuItem>
                        {ORDER_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                    <ToggleButtonGroup
                        value={direction}
                        exclusive
                        onChange={(_, newDirection) => setDirection(newDirection)}
                        disabled={!sort.value}
                        size="small"
                    >
                        <ToggleButton value="asc">Asc</ToggleButton>
                        <ToggleButton value="desc">Desc</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* FILTERING SECTION */}
                {filterSet && filterSet.map((option) => {
                    //dont render if not valid for current ruleset
                    if (option.rulesets && !option.rulesets.includes(currentRuleset) && currentRuleset !== 'all') {
                        return null;
                    }
                    return (
                        <Box sx={{ width: '100%' }} key={option.value}>
                            <Box key={option.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ minWidth: 80 }}>{option.label}</Typography>

                                {(option.type === "range" || option.type === "date_range") && (
                                    //disabled if currentRuleset is not in option.rulesets (if it exists) and currentRuleset is not 'all'
                                    <FilterSlider disabled={
                                        option.rulesets && !option.rulesets.includes(currentRuleset) && currentRuleset !== 'all'
                                    } filter={filter} setFilter={setFilter} option={option} date={option.type === "date_range"} />
                                )}

                                {option.type === "boolean" && (
                                    <FilterBoolean disabled={option.rulesets && !option.rulesets.includes(currentRuleset) && currentRuleset !== 'all'} filter={filter} setFilter={setFilter} option={option} />
                                )}

                                {option.type === "text" && (
                                    <FilterText disabled={option.rulesets && !option.rulesets.includes(currentRuleset) && currentRuleset !== 'all'} filter={filter} setFilter={setFilter} option={option} />
                                )}
                            </Box>
                            {option.type === "mods" && (
                                <Box sx={{ mt: 1, width: '100%' }}>
                                    <FilterMods filter={filter} setFilter={setFilter} option={option} currentRuleset={currentRuleset} />
                                </Box>
                            )}
                            {
                                option.description && (
                                    <Typography variant="caption" color="text.secondary">
                                        {option.description}
                                    </Typography>
                                )
                            }
                        </Box>
                    )
                })}
            </Stack>

            {/* APPLY FILTER BUTTON */}
            <Button variant="contained" onClick={() => onFiltered(applyFilter())} fullWidth>
                Apply
            </Button>
        </Box>
    )
}

function FilterSlider({ filter, setFilter, option, disabled, date }) {
    const [value, setValue] = useState([option.min, option.max]);

    useEffect(() => {
        setValue([option.min, option.max]);
    }, [option]);

    const handleChange = (_, newValue) => {
        setValue(newValue);
        setFilter(prev => ({
            ...prev,
            [option.value]: { operator: 'range', value: newValue }
        }));
    }

    return (
        <Box sx={{
            width: '100%',
            //reduce spacing between slider and labels
            '& .MuiSlider-root': {
                marginBottom: 0,
            },
        }}>
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={option.min}
                max={option.max}
                step={option.steps}
                valueLabelFormat={(v) => option.format ? option.format(v) : FormatNumber(v)}
                scale={option.scale || undefined}
                size="small"
                disabled={disabled}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">{option.format ? option.format(value[0]) : FormatNumber(value[0])}</Typography>
                <Typography variant="caption">{option.format ? option.format(value[1]) : FormatNumber(value[1])}</Typography>
            </Box>
        </Box>
    );
}

function FilterBoolean({ filter, setFilter, option, disabled }) {
    const handleChange = (e) => {
        setFilter(prev => ({
            ...prev,
            [option.value]: { operator: 'boolean', value: e.target.value }
        }));
    }

    return (
        <Select
            fullWidth
            value={filter[option.value]?.value ?? "any"}
            onChange={handleChange}
            displayEmpty
            size="small"
            disabled={disabled}
        >
            <MenuItem value="any">Any</MenuItem>
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
        </Select>
    );
}

function FilterText({ filter, setFilter, option, disabled }) {
    const handleChange = (e) => {
        setFilter(prev => ({
            ...prev,
            [option.value]: { operator: 'text', value: e.target.value }
        }));
    }

    return (
        <TextField
            fullWidth
            value={filter[option.value]?.value || ""}
            onChange={handleChange}
            size="small"
            placeholder={`Filter by ${option.label}`}
            disabled={disabled}
        />
    );
}

function FilterMods({ filter, setFilter, option, currentRuleset }) {
    const [allMods, setAllMods] = useState([]);

    useEffect(() => {
        let rulesets = [0, 1, 2, 3];
        if (currentRuleset !== 'all') {
            const rulesetId = { osu: 0, taiko: 1, fruits: 2, mania: 3 }[currentRuleset];
            rulesets = [rulesetId];
        }
        //combine all mods from all rulesets and remove duplicates
        const modsSet = {};
        for (const ruleset of rulesets) {
            for (const mod of ModData[ruleset].Mods) {
                modsSet[mod.Acronym] = mod;
            }
        }
        setAllMods(Object.values(modsSet));
    }, [currentRuleset]);

    const handleChange = (e, newValue) => {
        setFilter(prev => ({
            ...prev,
            [option.value]: { operator: 'mods', value: newValue }
        }));
    }

    return (
        <Autocomplete
            multiple
            options={allMods}
            getOptionLabel={(mod) => mod.Name}
            value={filter[option.value]?.value || []}
            onChange={handleChange}
            renderInput={(params) => <TextField {...params} size="small" placeholder="Filter by Mods" />}
            //show both Acronym and Name in options
            renderOption={(props, mod) => (
                <li {...props} key={mod.Acronym}>
                    {/* {mod.Acronym} - {mod.Name} */}
                    <Mod data={mod} />
                    {mod.Name}
                </li>
            )}
            //show only mod icons in selected value
            renderTags={(value, getTagProps) =>
                value.map((mod, index) => (
                    <Box key={mod.Acronym} {...getTagProps({ index })}>
                        <Mod data={mod} />
                    </Box>
                ))
            }
            disableCloseOnSelect
            sx={{
                width: '100%',
            }}
        />
    );
}

export default ScoreFilter;