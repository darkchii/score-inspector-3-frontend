import { Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, tableRowClasses, Typography } from "@mui/material";
import React from "react";
import NumberFlow from "@number-flow/react";
import ItemList from "../list/ItemList";
import ScoreListRow from "../list/ScoreListRow";
import type { IScore } from "../../types/types";
import ModDisplay from "../ModDisplay";

function ScoreViewScoreMultiplier({ score, active = null }: {
    score: IScore | null,
    active: boolean | null
}) {
    if (active === false) return null;
    if (!score?.beatmap || score.beatmap.getScores()?.length === 0) return null;

    if (score.mods.length === 0) {
        return (
            <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                style={{ marginTop: '1em' }}
            >
                No mods were used, so score multiplier is 1.00x.
            </Typography>
        )
    }

    return (
        <div>
            <Typography variant="body2" align="center" style={{ marginBottom: '1em' }}>
                <TableContainer>
                    <Table size="small" sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                            color: 'white !important',
                            padding: '2px'
                        },
                        [`& .${tableRowClasses.root}`]: {
                            borderBottom: "none",
                        },
                    }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mod(s)</TableCell>
                                <TableCell>Multiplier</TableCell>
                            </TableRow>
                            <TableRow key="total">
                                <TableCell>Total</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={score.score_multiplier ?? 0} suffix='x' /></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* score_multiplier_breakdown = { [key: string]: number } */}
                            {Object.entries(score.score_multiplier_breakdown || {}).map(([modAcronym, multiplier]) => {
                                //modAcronym is a string of mod acronyms (DT, HD+WD)
                                const modAcronyms: string[] = modAcronym.split('+');

                                return (
                                    <TableRow key={modAcronym}>
                                        <TableCell>
                                            <ModDisplay mods={score.mods.filter(mod => modAcronyms.includes(mod.acronym))} ruleset={score.ruleset} />
                                        </TableCell>
                                        <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={multiplier} suffix='x' /></TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Typography>
        </div>
    )
}

export default ScoreViewScoreMultiplier;