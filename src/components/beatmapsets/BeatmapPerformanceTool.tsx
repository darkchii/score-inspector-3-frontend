import { useState, type JSX } from "react";
import type { IDatabasedMod, IRouteBeatmapResult, IScoreMod } from "../../types/types";
import { Box, FormControlLabel, FormGroup, Grid, Paper, Switch, Typography } from "@mui/material";
import { GetModDatabaseForRuleset, IsModIncompatibleWithMod } from "../../util/ModHelper";
import ModDisplay from "../ModDisplay";
import ModIcon from "../ModIcon";

function BeatmapPerformanceTool({ data }: { data: IRouteBeatmapResult | null }) {
    const [selectedMods, setSelectedMods] = useState<IDatabasedMod[]>([]);
    //Adjustable mods match selected mods, but are prepared for being sent to PP calculator
    //IE; adjusted settings will be reflected here, but not above
    //should be an object with mod acronyms with the IScoreMod as value, and another boolean value for selected or not
    //this is so when deselecting, the settings preserve in case of reselect
    const [selectedModsAdjustable, setSelectedModsAdjustable] = useState<IScoreMod[]>([]);

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
        setSelectedModsAdjustable((prev) => {
            const existing = prev.find(m => m.acronym === mod.Acronym);
            if (selected) {
                if (existing) {
                    return prev.map(m => m.acronym === mod.Acronym ? { ...m, selected: true } : m);
                } else {
                    return [...prev, { acronym: mod.Acronym, settings: {}, selected: true }];
                }
            } else {
                if (existing) {
                    return prev.map(m => m.acronym === mod.Acronym ? { ...m, selected: false } : m);
                } else {
                    return prev;
                }
            }
        });
    }

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
            <Grid container spacing={2} sx={{ marginTop: '8px' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {/* mod settings editor */}
                    <Typography variant="h6" gutterBottom>
                        Selected Mods:
                    </Typography>
                    {selectedMods.filter(mod => Object.keys(mod.Settings ?? {}).length > 0).length === 0 && <Typography variant="body1">No adjustable mods selected.</Typography>}
                    {selectedMods.filter(mod => Object.keys(mod.Settings ?? {}).length > 0).map(mod => (
                        <ModSettingEditor key={mod.Acronym} mod={mod} ruleset={data.beatmap?.ruleset} />
                    ))}
                </Grid>
            </Grid>
        </>
    )
}

const modDefaults: Record<string, Record<string, number>> = {
    'speed_change': {
        //if EZ: 0.5x, if DT: 1.5x
        'EZ': 0.5,
        'DT': 1.5
    },
}

//the full Paper component for each mod
function ModSettingEditor({ mod, ruleset }: { mod: IDatabasedMod, ruleset: any }) {
    const [cachedMod, setCachedMod] = useState<IScoreMod>({ acronym: mod.Acronym, settings: {} });

    return (
        <Paper key={mod.Acronym} sx={{ padding: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ModIcon mod={cachedMod} data={mod} ruleset={ruleset} size={24} />
                <Typography variant="subtitle1">{mod.Name}</Typography>
            </div>

            {/* settings UI */}
            {
                Object.entries(mod.Settings ?? {}).map(([key, value]) => (
                    <Paper elevation={4} key={key} sx={{ padding: '8px', marginTop: '8px' }}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    value.Type === 'boolean' ? (
                                        <Switch
                                            type="checkbox"
                                            defaultChecked={cachedMod.settings?.[key] ?? false}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                setCachedMod((prev) => ({
                                                    ...prev,
                                                    settings: {
                                                        ...prev.settings,
                                                        [key]: newValue
                                                    }
                                                }));
                                            }}
                                        />
                                    ) : value.Type === 'number' ? (
                                        <input
                                            type="number"
                                            value={cachedMod.settings?.[key] ?? modDefaults[key]?.[mod.Acronym] ?? 0}
                                            onChange={(e) => {
                                                const newValue = parseFloat(e.target.value);
                                                setCachedMod((prev) => ({
                                                    ...prev,
                                                    settings: {
                                                        ...prev.settings,
                                                        [key]: newValue
                                                    }
                                                }));
                                            }}
                                            //minimum width
                                            style={{ minWidth: '60px' }}
                                        />
                                    ) : (
                                        <Typography variant="body2">{String(cachedMod.settings?.[key] ?? value.DefaultValue)}</Typography>
                                    )
                                } label={value.Label}
                            />
                        </FormGroup>
                    </Paper>
                ))
            }
        </Paper>
    )
}

export default BeatmapPerformanceTool;