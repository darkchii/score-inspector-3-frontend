import { Box, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { IDatabasedMod } from "../../types/types";
import React, { useEffect, useState } from "react";
import { ConvertDatabasedToScoreMod, GetModDatabase } from "../../util/ModHelper";
import ModDisplay from "../ModDisplay";
import { GetRulesetIconFromId, GetRulesetId, GetRulesetPrettyNameFromId } from "../../util/Helper";
import Score from "../../types/Score";
import Beatmap from "../../types/beatmaps/Beatmap";
import { GetScoreMultiplierCalculator } from "../../types/ScoreMultiplierCalculator";

function ToolModBrowser() {
    const [mods, setMods] = useState<{ [ruleset: string]: { [acronym: string]: IDatabasedMod } }>(GetModDatabase());

    console.log(mods);
    if (!mods || Object.keys(mods).length === 0) {
        return (
            <Box>
                <p>No mods found. Is the database empty? This is likely something to report.</p>
            </Box>
        )
    }

    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                <Typography variant="body2" gutterBottom>
                    Score multipliers are marked as estimations, due to some mods changing multiplier depending on the settings or even the beatmap itself.
                </Typography>
                <Typography variant="body2" gutterBottom>
                    Default settings are assumed, and no beatmap data is provided for the examples here, so your mileage may vary.
                </Typography>
            </Paper>
            {
                Object.keys(mods).map(ruleset => {
                    const rulesetMods = mods[ruleset];
                    const simulatedScore = new Score({
                        ended_at: new Date(),
                        build_id: 50000,
                        ruleset: ruleset,
                        ruleset_id: GetRulesetId(ruleset),
                    }, new Beatmap({}));

                    const multiCalculator = GetScoreMultiplierCalculator(simulatedScore);
                    const multiCalcClassName = multiCalculator.constructor.name;

                    console.log(`Ruleset: ${ruleset}, Multiplier Calculator: ${multiCalcClassName}`);

                    return (
                        <Box key={ruleset}>
                            <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                                <Typography variant="h6" gutterBottom>
                                    <img
                                        src={GetRulesetIconFromId(ruleset)}
                                        style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '0.3em' }}
                                    />
                                    {GetRulesetPrettyNameFromId(ruleset)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Multiplier Calculator: {multiCalcClassName}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                {
                                    Object.keys(rulesetMods).map(acronym => {
                                        const mod = rulesetMods[acronym];

                                        simulatedScore.mods = [ConvertDatabasedToScoreMod(mod)];

                                        const multiCalculator = GetScoreMultiplierCalculator(simulatedScore);
                                        const [multiplier, breakdown] = multiCalculator.Calculate();
                                        simulatedScore.score_multiplier = isNaN(multiplier) ? 1 : multiplier;
                                        simulatedScore.score_multiplier_breakdown = breakdown;

                                        return (
                                            <Box key={acronym} sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <ModDisplay mods={[mod]} ruleset={ruleset} />
                                                    <Typography variant="body1" color="text.secondary">
                                                        {mod.Name} (~{simulatedScore.score_multiplier.toFixed(2)}x)
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {mod.Description}
                                                </Typography>
                                                {
                                                    mod.Settings && mod.Settings.length > 0 && (
                                                        // Pretty display of the settings, if any
                                                        //use default column widths (and description column takes up the rest of the space)
                                                        <Box sx={{ mt: 1 }}>
                                                            <TableContainer component={Paper} sx={{ mt: 1 }}>
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell sx={{ width: '15%' }}>Label</TableCell>
                                                                            <TableCell sx={{ width: '15%' }}>Setting</TableCell>
                                                                            <TableCell sx={{ width: '15%' }}>Type</TableCell>
                                                                            <TableCell>Description</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {mod.Settings.map((setting: any) => (
                                                                            <TableRow key={setting.Name}>
                                                                                <TableCell>{setting.Label}</TableCell>
                                                                                <TableCell>{setting.Name}</TableCell>
                                                                                <TableCell>{setting.Type}</TableCell>
                                                                                <TableCell>{setting.Description}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    )
                                                }
                                                <Divider sx={{ mt: 1 }} />
                                            </Box>
                                        )
                                    })
                                }
                            </Paper>
                        </Box >
                    )
                })
            }
        </Box >
    );
}

export default ToolModBrowser;