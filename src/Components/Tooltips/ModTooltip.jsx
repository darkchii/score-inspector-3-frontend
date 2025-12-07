import { Box, List, ListItem, ListItemText, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, Tooltip, Typography, useTheme } from "@mui/material";
import { GetModSettingForDisplay } from "../../Misc/ModHelper";
import ModDisplay from "../ModDisplay";

const LocalStyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} componentsProps={{ tooltip: { className: className } }} />
))(`
    padding: 0;
    background-color: transparent;
    box-shadow: none;
    color: white;
`);

function ModTooltipContent({ mod, data, ruleset }) {
    const theme = useTheme();

    console.log(data);
    return (
        <Box sx={{
            backgroundColor: '#293d2a',
            maxWidth: '600px',
            borderRadius: theme.shape.borderRadius,
            border: `1px solid #334C35`
        }}>
            {/* Top bar */}
            <Box sx={{
                py: 1,
                px: 2,
                backgroundColor: '#4cb255',
                borderRadius: theme.shape.borderRadius,
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {data.Name} ({data.Acronym})
                </Typography>
            </Box>
            {/* Settings viewer */}
            <Box sx={{
                p: 1,
            }}>
                {
                    !mod.settings || Object.keys(mod.settings).length === 0
                        ? <Typography>No settings available or applied.</Typography>
                        :
                        <>
                            <TableContainer>
                                <Table size="small" sx={{
                                    [`& .${tableCellClasses.root}`]: {
                                        borderBottom: "none",
                                    }
                                }}>
                                    <TableBody>
                                        {
                                            Object.entries(data.Settings).map(([settingKey, settingValue]) => {
                                                if (mod.settings[settingValue.Name] === undefined || mod.settings[settingValue.Name] === null) return null;
                                                return (
                                                    <TableRow key={settingKey} sx={{ mb: 1 }}>
                                                        <TableCell>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{settingValue.Label}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{GetModSettingForDisplay(ruleset, data.Acronym, settingValue.Name, mod.settings[settingValue.Name])}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            }
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                }

                {/* incompatible mods */}
                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Incompatible Mods:</Typography>
                {
                    data.IncompatibleMods.length === 0
                        ? <Typography>None</Typography>
                        : <ModDisplay ruleset={ruleset} mods={data.IncompatibleMods.map(acronym => ({ acronym }))} />
                }
            </Box>
        </Box>
    )
}

function ModTooltip({ children, mod, data, ruleset, disabled = false }) {
    if (disabled) {
        return children;
    }

    return (
        <LocalStyledTooltip
            title={<ModTooltipContent mod={mod} data={data} ruleset={ruleset} />}
            placement={'top'}
            followCursor>
            {children}
        </LocalStyledTooltip>
    )
}

export default ModTooltip;