import { useEffect, useState, type JSX } from "react";
import type { IDatabasedMod, IRouteBeatmapResult, IScore, IScoreMod } from "../../types/types";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, FormControlLabel, FormGroup, Grid, Paper, Switch, Typography } from "@mui/material";
import { GetModDatabaseForRuleset, IsModIncompatibleWithMod } from "../../util/ModHelper";
import ModDisplay from "../ModDisplay";
import ModIcon from "../ModIcon";
import NumberField from "../NumberField";
import NumberSpinner from "../NumberSpinner";

type ModSettingSpecifics = {
    min: number;
    max: number;
    extended_max?: number; //for DA really, only if extended_limits is true
    step: number;
    default?: number;
}

const modSettingIncrements: Record<string, Record<string, ModSettingSpecifics>> = {
    'HT': {
        'speed_change': { min: 0.5, max: 0.99, step: 0.01, default: 0.75 }
    },
    'DC': {
        'speed_change': { min: 0.5, max: 0.99, step: 0.01, default: 0.75 }
    },
    'DT': {
        'speed_change': { min: 1.01, max: 2.0, step: 0.01, default: 1.5 }
    },
    'NC': {
        'speed_change': { min: 1.01, max: 2.0, step: 0.01, default: 1.5 }
    },
    'EZ': {
        'retries': { min: 0, max: 10, step: 1, default: 0 }
    },
    'AC': {
        'minimum_accuracy': { min: 0.6, max: 0.999, step: 0.001, default: 0.9 }
    },
    'DA': {//no default, reads from maps
        'drain_rate': { min: 0, max: 10, extended_max: 11, step: 0.1 },
        'overall_difficulty': { min: 0, max: 10, extended_max: 11, step: 0.1 },
    }
};

function BeatmapPerformanceTool({ data }: { data: IRouteBeatmapResult | null }) {
    const [selectedMods, setSelectedMods] = useState<IDatabasedMod[]>([]);
    //Adjustable mods match selected mods, but are prepared for being sent to PP calculator
    //IE; adjusted settings will be reflected here, but not above
    //should be an object with mod acronyms with the IScoreMod as value, and another boolean value for selected or not
    //this is so when deselecting, the settings preserve in case of reselect
    const [selectedModsAdjustable, setSelectedModsAdjustable] = useState<{ mod: IScoreMod, selected: boolean }[]>([]);

    const [generatedScore, setGeneratedScore] = useState<IScore | null>(null);

    if (!data || !data.beatmap) {
        return <Typography variant="h6" gutterBottom>
            No beatmap data available.
        </Typography>
    }

    const onModClick = (mod: IDatabasedMod, selected: boolean) => {
        setSelectedMods((prev) => {
            if (selected) {
                return [...prev, mod];
            } else {
                return prev.filter(m => m.Acronym !== mod.Acronym);
            }
        });

        //Match selectedModsAdjustable (either toggle, or add if not existing yet, only if .Settings has entries)
        //example: [{mod: { acronym: "DT", settings: { speed_change: 1.5 } }, selected: true } ]
        setSelectedModsAdjustable((prev) => {
            //if mod doesnt exist yet, add it with default settings if they exist and selected true
            if (!prev.some(m => m.mod.acronym === mod.Acronym)) {
                //only set default settings if the setting has default values in modSettingIncrements, otherwise just not add it
                const defaultSettings: Record<string, any> = {};
                if (modSettingIncrements[mod.Acronym]) {
                    for (const [settingKey, settingValue] of Object.entries(modSettingIncrements[mod.Acronym])) {
                        if (settingValue.default !== undefined) {
                            defaultSettings[settingKey] = settingValue.default;
                        }
                    }
                }
                
                return [...prev, { mod: { acronym: mod.Acronym, settings: defaultSettings }, selected: true }];
            } else {
                //otherwise, just toggle selected
                return prev.map(m => m.mod.acronym === mod.Acronym ? { ...m, selected } : m);
            }
        });
    }

    const onRequestPerformance = () => {
        //todo, just console log the "score" 
        console.log(generatedScore);
    }

    useEffect(() => {
        console.log("Selected mods:", selectedMods);
        console.log("Selected mods adjustable:", selectedModsAdjustable);
    }, [selectedModsAdjustable]);

    return (
        <>
            {
                GetModDatabaseForRuleset(data.beatmap.ruleset) && <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                }}>
                    {/* <ModDisplay key={data.beatmap.ruleset} ruleset={data.beatmap.ruleset} mods={Object.values(GetModDatabaseForRuleset(data.beatmap.ruleset)!)} /> */}
                    {
                        //filter out mods that are not user playable
                        Object.values(GetModDatabaseForRuleset(data.beatmap.ruleset)!).filter(mod => mod.UserPlayable).map((mod) => {
                            return (
                                <ModIcon
                                    key={mod.Acronym}
                                    mod={null}
                                    data={mod}
                                    ruleset={data.beatmap?.ruleset}
                                    interactive={true}
                                    onClick={(selected) => onModClick(mod, selected)}
                                    disabled={
                                        selectedMods.some(m => IsModIncompatibleWithMod(m, mod))
                                    }
                                    size={30}
                                />
                            )
                        })
                    }
                </div>
            }
            <Box sx={{ marginTop: '8px' }}>
                <Accordion
                    disabled={selectedModsAdjustable.filter(mod => mod.selected).length === 0}
                >
                    <AccordionSummary>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Typography variant="h6">Selected Mods</Typography>
                            <ModDisplay
                                ruleset={data.beatmap.ruleset}
                                mods={selectedModsAdjustable.filter(mod => mod.selected).map(m => m.mod)}
                            />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {selectedModsAdjustable.filter(mod => mod.selected).length === 0 && <Typography variant="body1">No adjustable mods selected.</Typography>}
                        {selectedModsAdjustable.filter(mod => mod.selected).map(mod => (
                            <ModSettingEditor key={mod.mod.acronym} mod={mod.mod} ruleset={data.beatmap?.ruleset} onUpdate={(setting, value) => {
                                setSelectedModsAdjustable((prev) => {
                                    //if updated setting is null, remove it from settings object
                                    if(value === null) {
                                        const { [setting]: _, ...newSettings } = mod.mod.settings || {};
                                        return prev.map(m => m.mod.acronym === mod.mod.acronym ? { ...m, mod: { ...m.mod, settings: newSettings } } : m);
                                    }
                                    return prev.map(m => m.mod.acronym === mod.mod.acronym ? { ...m, mod: { ...m.mod, settings: { ...m.mod.settings, [setting]: value } } } : m);
                                });
                            }} />
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button variant='contained' onClick={onRequestPerformance}>
                Calculate
            </Button>
        </>
    )
}

//the full Paper component for each mod
function ModSettingEditor({ mod, ruleset, onUpdate }: { mod: IScoreMod, ruleset: any, onUpdate: (setting: string, value: any) => void }) {
    const modData = Object.values(GetModDatabaseForRuleset(ruleset) || {}).find(m => m.Acronym === mod.acronym);

    if (modData?.Settings?.length === 0) {
        return null;
    }

    const settingIncrements = modSettingIncrements[mod.acronym] || {};
    return (
        <Paper elevation={3} key={mod.acronym} sx={{ padding: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ModIcon mod={mod} data={modData} ruleset={ruleset} size={24} />
                <Typography variant="subtitle1">{modData?.Name}</Typography>
            </div>

            {/* settings UI */}
            <Paper elevation={4} sx={{ padding: '8px', marginTop: '8px' }}>
                <FormGroup sx={{
                    px: 1,
                }}
                >
                    {
                        //sort by Type, then by Label alphabetically
                        Object.entries(modData?.Settings ?? {}).sort(([keyA, valueA], [keyB, valueB]) => {
                            if (valueA.Type === valueB.Type) {
                                return valueA.Name.localeCompare(valueB.Name);
                            }
                            return valueA.Type.localeCompare(valueB.Type);
                        }).map(([key, value]) => {
                            const settingKey = value.Name;
                            const defaultValue: any = settingIncrements[settingKey]?.default ?? (value.Type === 'boolean' ? false : value.Type === 'number' ? settingIncrements[settingKey]?.min ?? 0 : '');
                            const currentValue = mod.settings?.[settingKey] ?? defaultValue;
                            return (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        value.Type === 'boolean' ? (
                                            <Switch
                                                size='small'
                                                type="checkbox"
                                                defaultChecked={currentValue}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                            />
                                        ) : value.Type === 'number' ? (
                                            <NumberSpinner
                                                value={currentValue}
                                                size='small'
                                                style={{
                                                    marginRight: '8px',
                                                }}
                                                onValueChange={(value) => {
                                                    const newValue = value || null;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                                min={settingIncrements[settingKey]?.min}
                                                max={settingIncrements[settingKey]?.extended_max ?? settingIncrements[settingKey]?.max}
                                                step={settingIncrements[settingKey]?.step}
                                            />
                                        ) : value.Type === 'string' ? (
                                            <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    fontSize: '14px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                }}
                                            />
                                        ) : null
                                    } label={value.Label}
                                />
                            )
                        })
                    }
                </FormGroup>
            </Paper>
        </Paper>
    )
}

export default BeatmapPerformanceTool;