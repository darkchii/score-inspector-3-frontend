import { useState } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Box, FormControlLabel, FormGroup, Paper, Switch, Typography } from "@mui/material";
import type { IBeatmap, IDatabasedMod, IScoreDifficulty, IScoreMod } from "../../../types/types";
import { GetModDatabaseForRuleset, IsModIncompatibleWithMod } from "../../../util/ModHelper";
import ModDisplay from "../../ModDisplay";
import ModIcon from "../../ModIcon";
import NumberSpinner from "../../NumberSpinner";
import DifficultyBadge from "../../DifficultyBadge";

export type AdjustableSelectedMod = {
    mod: IScoreMod;
    selected: boolean;
};

type ModSettingSpecifics = {
    min: number;
    max: number;
    extended_max?: number;
    step: number;
    default?: number;
};

const modSettingIncrements: Record<string, Record<string, ModSettingSpecifics>> = {
    HT: {
        speed_change: { min: 0.5, max: 0.99, step: 0.01, default: 0.75 },
    },
    DC: {
        speed_change: { min: 0.5, max: 0.99, step: 0.01, default: 0.75 },
    },
    DT: {
        speed_change: { min: 1.01, max: 2.0, step: 0.01, default: 1.5 },
    },
    NC: {
        speed_change: { min: 1.01, max: 2.0, step: 0.01, default: 1.5 },
    },
    EZ: {
        retries: { min: 0, max: 10, step: 1, default: 0 },
    },
    AC: {
        minimum_accuracy: { min: 0.6, max: 0.999, step: 0.001, default: 0.9 },
    },
    DA: {
        drain_rate: { min: 0, max: 10, extended_max: 11, step: 0.1 },
        overall_difficulty: { min: 0, max: 10, extended_max: 11, step: 0.1 },
    },
};

function PerformanceModSelector({
    ruleset,
    onSelectionChange,
    disabled = false,
}: {
    ruleset: any;
    onSelectionChange?: (mods: AdjustableSelectedMod[]) => void;
    disabled?: boolean;
}) {
    const [selectedMods, setSelectedMods] = useState<IDatabasedMod[]>([]);
    const [selectedModsAdjustable, setSelectedModsAdjustable] = useState<AdjustableSelectedMod[]>([]);

    const updateSelectedModsAdjustable = (updater: (prev: AdjustableSelectedMod[]) => AdjustableSelectedMod[]) => {
        setSelectedModsAdjustable((prev) => {
            const next = updater(prev);
            onSelectionChange?.(next);
            return next;
        });
    };

    const onModClick = (mod: IDatabasedMod, selected: boolean) => {
        if (disabled) return;

        setSelectedMods((prev) => {
            if (selected) {
                return [...prev, mod];
            }

            return prev.filter((m) => m.Acronym !== mod.Acronym);
        });

        updateSelectedModsAdjustable((prev) => {
            if (!prev.some((m) => m.mod.acronym === mod.Acronym)) {
                const defaultSettings: Record<string, any> = {};
                if (modSettingIncrements[mod.Acronym]) {
                    for (const [settingKey, settingValue] of Object.entries(modSettingIncrements[mod.Acronym])) {
                        if (settingValue.default !== undefined) {
                            defaultSettings[settingKey] = settingValue.default;
                        }
                    }
                }

                return [...prev, { mod: { acronym: mod.Acronym, settings: defaultSettings }, selected: true }];
            }

            return prev.map((m) => (m.mod.acronym === mod.Acronym ? { ...m, selected } : m));
        });
    };

    if (!GetModDatabaseForRuleset(ruleset)) {
        return null;
    }

    const activeMods = selectedModsAdjustable.filter((mod) => mod.selected);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                }}
            >
                {Object.values(GetModDatabaseForRuleset(ruleset)!)
                    .filter((mod) => mod.UserPlayable)
                    .map((mod) => {
                        return (
                            <ModIcon
                                key={mod.Acronym}
                                mod={null}
                                data={mod}
                                ruleset={ruleset}
                                interactive={true}
                                onClick={(selected) => onModClick(mod, selected)}
                                disabled={disabled || selectedMods.some((m) => IsModIncompatibleWithMod(m, mod))}
                                size={30}
                            />
                        );
                    })}
            </div>

            <Box sx={{ marginTop: "8px" }}>
                <Accordion disabled={activeMods.length === 0}>
                    <AccordionSummary>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Typography variant="h6">Selected Mods</Typography>
                            <ModDisplay ruleset={ruleset} mods={activeMods.map((m) => m.mod)} />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {activeMods.length === 0 && <Typography variant="body1">No adjustable mods selected.</Typography>}
                        {activeMods.map((mod) => (
                            <ModSettingEditor
                                key={mod.mod.acronym}
                                mod={mod.mod}
                                ruleset={ruleset}
                                onUpdate={(setting, value) => {
                                    updateSelectedModsAdjustable((prev) => {
                                        if (value === null) {
                                            const { [setting]: _, ...newSettings } = mod.mod.settings || {};
                                            return prev.map((m) =>
                                                m.mod.acronym === mod.mod.acronym
                                                    ? { ...m, mod: { ...m.mod, settings: newSettings } }
                                                    : m,
                                            );
                                        }

                                        return prev.map((m) =>
                                            m.mod.acronym === mod.mod.acronym
                                                ? {
                                                    ...m,
                                                    mod: { ...m.mod, settings: { ...m.mod.settings, [setting]: value } },
                                                }
                                                : m,
                                        );
                                    });
                                }}
                                disabled={disabled}
                            />
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
        </>
    );
}

function ModSettingEditor({
    mod,
    ruleset,
    onUpdate,
    disabled = false,
}: {
    mod: IScoreMod;
    ruleset: any;
    onUpdate: (setting: string, value: any) => void;
    disabled?: boolean;
}) {
    const modData = Object.values(GetModDatabaseForRuleset(ruleset) || {}).find((m) => m.Acronym === mod.acronym);

    if (modData?.Settings?.length === 0) {
        return null;
    }

    const settingIncrements = modSettingIncrements[mod.acronym] || {};
    return (
        <Paper elevation={3} key={mod.acronym} sx={{ padding: "8px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ModIcon mod={mod} data={modData} ruleset={ruleset} size={24} />
                <Typography variant="subtitle1">{modData?.Name}</Typography>
            </div>

            <Paper elevation={4} sx={{ padding: "8px", marginTop: "8px" }}>
                <FormGroup
                    sx={{
                        px: 1,
                    }}
                >
                    {Object.entries(modData?.Settings ?? {})
                        .sort(([_, valueA], [__, valueB]) => {
                            if (valueA.Type === valueB.Type) {
                                return valueA.Name.localeCompare(valueB.Name);
                            }
                            return valueA.Type.localeCompare(valueB.Type);
                        })
                        .map(([key, value]) => {
                            const settingKey = value.Name;
                            const defaultValue: any =
                                settingIncrements[settingKey]?.default ??
                                (value.Type === "boolean"
                                    ? false
                                    : value.Type === "number"
                                        ? settingIncrements[settingKey]?.min ?? 0
                                        : "");
                            const currentValue = mod.settings?.[settingKey] ?? defaultValue;
                            return (
                                <FormControlLabel
                                    disabled={disabled}
                                    key={key}
                                    control={
                                        value.Type === "boolean" ? (
                                            <Switch
                                                size="small"
                                                type="checkbox"
                                                defaultChecked={currentValue}
                                                onChange={(e) => {
                                                    const newValue = e.target.checked;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                            />
                                        ) : value.Type === "number" ? (
                                            <NumberSpinner
                                                value={currentValue}
                                                size="small"
                                                style={{
                                                    marginRight: "8px",
                                                }}
                                                onValueChange={(value) => {
                                                    const newValue = value || null;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                                min={settingIncrements[settingKey]?.min}
                                                max={
                                                    settingIncrements[settingKey]?.extended_max ??
                                                    settingIncrements[settingKey]?.max
                                                }
                                                step={settingIncrements[settingKey]?.step}
                                            />
                                        ) : value.Type === "string" ? (
                                            <input
                                                type="text"
                                                value={currentValue}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    onUpdate(settingKey, newValue);
                                                }}
                                                style={{
                                                    padding: "4px 8px",
                                                    fontSize: "14px",
                                                    borderRadius: "4px",
                                                    border: "1px solid #ccc",
                                                }}
                                            />
                                        ) : null
                                    }
                                    label={value.Label}
                                />
                            );
                        })}
                </FormGroup>
            </Paper>
        </Paper>
    );
}

export default PerformanceModSelector;
