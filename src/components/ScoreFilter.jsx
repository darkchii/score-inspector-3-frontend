import { Autocomplete, Button, IconButton, MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import { compareByField, EMPTY_FILTER, EMPTY_SORT, evaluateGroup, FILTER_FIELDS, GRADE_ORDER, OPERATORS_BY_TYPE } from "../util/FilterHelper";
import { DateTimePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { getGradeIcon } from "../assets/textures/TextureDatabase";

//does not do filtering on it's own, just provides the UI and state
function ScoreFilter({ data, onFiltered }) {
    const [filterTree, setFilterTree] = useState(EMPTY_FILTER);
    const [sort, setSort] = useState(EMPTY_SORT)

    const filterData = (data, filterTree) => {
        const filtered = data?.filter(item => evaluateGroup(item, filterTree));

        if (!sort.field) {
            return filtered;
        }

        return [...filtered].sort((a, b) =>
            compareByField(a, b, sort)
        )
    };

    return (
        <React.Fragment>
            <GroupEditor
                group={filterTree}
                onChange={setFilterTree}
            />
            <SortBar sort={sort} onChange={setSort} sx={{ mt: 2 }} />
            <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => onFiltered(filterData(data, filterTree))}
            >
                Apply Filter
            </Button>
        </React.Fragment>
    )
}

function SortBar({ sort, onChange, ...props }) {
    return (
        <Stack direction="row" spacing={2} alignItems="center" {...props}>
            <Select
                size="small"
                value={sort.field || ""}
                displayEmpty
                onChange={e =>
                    onChange({ ...sort, field: e.target.value })
                }
            >
                <MenuItem value="">
                    <em>No sorting</em>
                </MenuItem>

                {FILTER_FIELDS.map(f => (
                    <MenuItem key={f.value} value={f.value}>
                        {f.label}
                    </MenuItem>
                ))}
            </Select>

            <ToggleButtonGroup
                size="small"
                exclusive
                value={sort.direction}
                onChange={(e, dir) =>
                    dir && onChange({ ...sort, direction: dir })
                }
                disabled={!sort.field}
            >
                <ToggleButton value="asc">↑</ToggleButton>
                <ToggleButton value="desc">↓</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    )
}

function RuleEditor({ rule, onChange, onDelete }) {
    const fieldDef =
        FILTER_FIELDS.find(f => f.value === rule.field) || FILTER_FIELDS[0]

    const operators = OPERATORS_BY_TYPE[fieldDef.type]

    const handleFieldChange = field => {
        const newFieldDef = FILTER_FIELDS.find(f => f.value === field)

        onChange({
            ...rule,
            field,
            comparator: OPERATORS_BY_TYPE[newFieldDef.type][0].value,
            value: ""
        })
    }

    return (
        <Stack direction="row" spacing={1}>
            {/* <Select
                size='small'
                value={rule.field}
                onChange={e => handleFieldChange(e.target.value)}
            >
                {FILTER_FIELDS.map(f => (
                    <MenuItem key={f.value} value={f.value}>
                        {f.label}
                    </MenuItem>
                ))}
            </Select> */}
            <FieldSelect
                value={rule.field}
                onChange={handleFieldChange}
            />

            <Select
                value={rule.comparator}
                onChange={e =>
                    onChange({ ...rule, comparator: e.target.value })
                }
                size="small"
            >
                {operators.map(op => (
                    <MenuItem key={op.value} value={op.value}>
                        {op.label}
                    </MenuItem>
                ))}
            </Select>

            {fieldDef.type === "grade" && (
                <Select
                    size="small"
                    value={rule.value}
                    onChange={e =>
                        onChange({ ...rule, value: e.target.value })
                    }
                >
                    {GRADE_ORDER.map(grade => (
                        <MenuItem key={grade} value={grade}>
                            {/* {grade} */}
                            <img src={getGradeIcon(grade)} alt={grade} style={{ height: 16, verticalAlign: 'middle' }} />
                        </MenuItem>
                    ))}
                </Select>
            )}

            {fieldDef.type === "datetime" && (
                <DateTimePicker
                    value={rule.value ? moment(rule.value) : null}
                    onChange={newValue =>
                        onChange({
                            ...rule,
                            value: newValue ? newValue.toISOString() : ""
                        })
                    }
                    slotProps={{
                        textField: { size: "small" }
                    }}
                />
            )}

            {fieldDef.type === "number" && (
                <TextField
                    size="small"
                    type="number"
                    value={rule.value}
                    onChange={e =>
                        onChange({ ...rule, value: e.target.value })
                    }
                />
            )}

            {fieldDef.type === "string" && (
                <TextField
                    size="small"
                    value={rule.value}
                    onChange={e =>
                        onChange({ ...rule, value: e.target.value })
                    }
                />
            )}

            {/* icon button */}
            <IconButton size="small" color="error" onClick={onDelete}>
                <ClearIcon fontSize="small" />
            </IconButton>

            {/* <Button color="error" onClick={onDelete} size='small'>
                ✕
            </Button> */}
        </Stack>
    )
}

function FieldSelect({ value, onChange }) {
    return (
        <Autocomplete
            size="small"
            options={FILTER_FIELDS}
            getOptionLabel={option => option.label}
            value={FILTER_FIELDS.find(f => f.value === value) || null}
            onChange={(e, newValue) =>
                onChange(newValue ? newValue.value : "")
            }
            renderInput={params => (
                <TextField {...params} label="Field" />
            )}
            isOptionEqualToValue={(o, v) => o.value === v.value}
        />
    )
}

function GroupEditor({ group, onChange, onDelete }) {
    const updateChild = (index, child) => {
        const children = [...group.children]
        children[index] = child
        onChange({ ...group, children })
    }

    const removeChild = (index) => {
        onChange({
            ...group,
            children: group.children.filter((_, idx) => idx !== index)
        })
    }

    return (
        <Paper sx={{ p: 2 }} variant="outlined">
            <ToggleButtonGroup
                value={group.operator}
                exclusive
                onChange={(e, op) => onChange({ ...group, operator: op })}
                size="small"
            >
                <ToggleButton value="AND">AND</ToggleButton>
                <ToggleButton value="OR">OR</ToggleButton>

                {onDelete && (
                    <Button
                        color="error"
                        size="small"
                        onClick={onDelete}
                    >
                        Remove group
                    </Button>
                )}
            </ToggleButtonGroup>

            <Stack spacing={2} mt={2}>
                {group.children.map((child, i) =>
                    child.type === "rule" ? (
                        <RuleEditor
                            key={i}
                            rule={child}
                            onChange={r => updateChild(i, r)}
                            onDelete={() =>
                                onChange({
                                    ...group,
                                    children: group.children.filter((_, idx) => idx !== i)
                                })
                            }
                        />
                    ) : (
                        <GroupEditor
                            key={i}
                            group={child}
                            onChange={g => updateChild(i, g)}
                            onDelete={() => removeChild(i)}
                        />
                    )
                )}
            </Stack>

            <Stack direction="row" spacing={1} mt={2}>
                <Button
                    size='small'
                    onClick={() =>
                        onChange({
                            ...group,
                            children: [
                                ...group.children,
                                { type: "rule", field: "accuracy", comparator: ">=", value: 0 }
                            ]
                        })
                    }
                >
                    Add Rule
                </Button>

                <Button
                    size='small'
                    onClick={() =>
                        onChange({
                            ...group,
                            children: [
                                ...group.children,
                                { type: "group", operator: "AND", children: [] }
                            ]
                        })
                    }
                >
                    Add Group
                </Button>
            </Stack>
        </Paper>
    )
}

export default ScoreFilter;