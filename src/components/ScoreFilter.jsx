import { Autocomplete, Button, Grid, IconButton, MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { EMPTY_SORT, FILTER_FIELDS, FilterScores } from "../util/FilterHelper";

//does not do filtering on it's own, just provides the UI and state
function ScoreFilter({ data, onFiltered, currentRuleset }) {
    const [filter, setFilter] = useState([]);
    const [sort, setSort] = useState(EMPTY_SORT);

    useEffect(() => {
        setFilter([]);
        setSort(EMPTY_SORT);
    }, [currentRuleset]);

    const applyFilter = () => {
        console.log("Applying filter:", filter, "and sort:", sort);
        return FilterScores(data, filter);
    }

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>Score Filter</Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={0.5}>
                    {
                        filter.map((f, index) => (
                            <Grid item xs={12} key={index}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <Typography>{FILTER_FIELDS.find(field => field.value === f.field)?.label}</Typography>
                                    {
                                        f.type === 'number' && (
                                            <FilterInputNumber
                                                filter={f}
                                                onChange={(newFilter) => {
                                                    const newFilters = [...filter];
                                                    newFilters[index] = newFilter;
                                                    setFilter(newFilters);
                                                }}
                                            />
                                        )
                                    }
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            const newFilters = filter.filter((_, i) => i !== index);
                                            setFilter(newFilters);
                                        }}
                                    >
                                        &times;
                                    </IconButton>
                                </Stack>
                            </Grid>
                        ))
                    }
                </Grid>
                {/* dropdown to select a field to filter by */}
                <FilterSelector onChange={(selectedField) => setFilter([...filter, {
                    field: selectedField.value,
                    type: selectedField.type,
                    operator: 'equals',
                    value: null
                }])} />
                <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={applyFilter}>Apply Filter</Button>
            </Paper>
        </React.Fragment>
    )
}

function FilterInputNumber({ filter, onChange }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Select
                value={filter.operator || 'equals'}
                onChange={(e) => onChange({ ...filter, operator: e.target.value })}
                size="small"
                variant="standard"
            >
                <MenuItem value="equals">=</MenuItem>
                <MenuItem value="not_equals">!=</MenuItem>
                <MenuItem value="greater_than">&gt;</MenuItem>
                <MenuItem value="less_than">&lt;</MenuItem>
                <MenuItem value="greater_equals">≥</MenuItem>
                <MenuItem value="less_equals">≤</MenuItem>
            </Select>
            <TextField
                type="number"
                value={filter.value || ''}
                onChange={(e) => onChange({ ...filter, value: e.target.value })}
                size="small"
                variant="standard"
            />
        </Stack>
    )
}

function FilterSelector({ onChange }) {
    return (
        //dropdown to select any of the FILTER_FIELDS
        <Select
            onChange={(e) => onChange(e.target.value)}
            fullWidth
        >
            {
                FILTER_FIELDS.map((field) => (
                    <MenuItem key={field.value} value={field}>{field.label}</MenuItem>
                ))
            }
        </Select>
    )
}

export default ScoreFilter;