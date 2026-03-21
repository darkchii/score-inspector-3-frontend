import { Box, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, Tooltip, tooltipClasses, Typography, useTheme } from "@mui/material";
import type { TooltipProps } from "@mui/material";
import { isValidElement } from "react";
import { GetModSettingForDisplay } from "../../util/ModHelper";
import ModDisplay from "../ModDisplay";
import type { IDatabasedMod, IScoreMod } from "../../types/types";

type ModSettingDefinition = {
    Name: string;
    Label: string;
};

const LocalStyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        padding: 0,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        color: 'white',
    },
});

function ModTooltipContent({ mod, data, ruleset }: {
    mod: IScoreMod | null;
    data: IDatabasedMod;
    ruleset: any;
}) {
    const theme = useTheme();

    if(!mod) return null;

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
                                        color: 'white',
                                    }
                                }}>
                                    <TableBody>
                                        {
                                            Object.entries(data.Settings as Record<string, ModSettingDefinition>).map(([settingKey, settingValue]) => {
                                                if (mod.settings?.[settingValue.Name] === undefined || mod.settings?.[settingValue.Name] === null) return null;
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
                        : <ModDisplay ruleset={ruleset} mods={data.IncompatibleMods.map(acronym => ({ acronym, settings: null }))} />
                }
            </Box>
        </Box>
    )
}

type ModTooltipProps = {
    children: React.ReactNode;
    mod: IScoreMod | null;
    data: IDatabasedMod;
    ruleset: any;
    disabled?: boolean;
};

function ModTooltip({ children, mod, data, ruleset, disabled = false }: ModTooltipProps) {
    const tooltipChild = isValidElement(children) ? children : <span>{children}</span>;

    if (disabled) {
        return children;
    }

    return (
        <LocalStyledTooltip
            title={<ModTooltipContent mod={mod} data={data} ruleset={ruleset} />}
            placement={'top'}
            followCursor>
            {tooltipChild}
        </LocalStyledTooltip>
    )
}

export default ModTooltip;