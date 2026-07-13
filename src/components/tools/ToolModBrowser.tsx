import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import type { IDatabasedMod } from "../../types/types";
import React, { useEffect, useState } from "react";
import { GetModDatabase } from "../../util/ModHelper";
import ModDisplay from "../ModDisplay";

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
            {
                Object.keys(mods).map(ruleset => {
                    const rulesetMods = mods[ruleset];

                    return (
                        <Box key={ruleset}>
                            <h2>{ruleset}</h2>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Mod</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            Object.keys(rulesetMods).map(acronym => {
                                                const mod = rulesetMods[acronym];
                                                
                                                return (
                                                    <React.Fragment key={acronym}>
                                                        <TableRow key={acronym}>
                                                            <TableCell><ModDisplay mods={[mod]} ruleset={ruleset} /></TableCell>
                                                            <TableCell>{mod.Type}</TableCell>
                                                            <TableCell>{mod.Name}</TableCell>
                                                            <TableCell>{mod.Description}</TableCell>
                                                        </TableRow>
                                                        {/* allow showing setting details as well */}
                                                        {
                                                            mod.Settings && mod.Settings.length > 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={4}>
                                                                        <Table size="small">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell>Label</TableCell>
                                                                                    <TableCell>Setting</TableCell>
                                                                                    <TableCell>Type</TableCell>
                                                                                    <TableCell>Description</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {
                                                                                    mod.Settings.map((setting: any) => (
                                                                                        <TableRow key={setting.Name}>
                                                                                            <TableCell>{setting.Label}</TableCell>
                                                                                            <TableCell>{setting.Name}</TableCell>
                                                                                            <TableCell>{setting.Type}</TableCell>
                                                                                            <TableCell>{setting.Description}</TableCell>
                                                                                        </TableRow>
                                                                                    ))
                                                                                }
                                                                            </TableBody>
                                                                        </Table>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        }
                                                        {/* empty row to space things between each mod */}
                                                        <TableRow>
                                                            <TableCell colSpan={4}>&nbsp;</TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )
                })
            }
        </Box>
    );
}

export default ToolModBrowser;