import { Box, Grid, Typography } from "@mui/material";
import { TextureDatabase } from "../assets/textures/TextureDatabase";
import BetterTooltip from "./tooltips/BetterTooltip";
import NumberFlow from "@number-flow/react";
import type { NumberFlowStyleWithVars } from "../types/types";

function _SingularGradeDisplay({ grade, count, overrideCount }: { grade: string, count: number, overrideCount?: number }) {
    //only tooltip if overrideCount is given (even if 0)
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
            <img src={TextureDatabase[`SVGGrade${grade}` as keyof typeof TextureDatabase]} alt={grade} width={48} height={48} />
            {/* <BetterTooltip title={overrideCount !== undefined ? `Including overrides: ${FormatNumber(overrideCount)} total` : ''}> */}
            <Box sx={{
                //reduced spacing between the two values
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                lineHeight: '0.1em'
            }}>
                <Typography variant="h6" sx={{ lineHeight: '0.1em' }}><NumberFlow style={{ '--number-flow-mask-height': '0.10em' } as NumberFlowStyleWithVars} value={count} /></Typography>
                {
                    overrideCount !== undefined && (
                        <BetterTooltip title='Including overridden scores'>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: '0.1em' }}><NumberFlow style={{ '--number-flow-mask-height': '0.10em' } as NumberFlowStyleWithVars} value={overrideCount} /></Typography>
                        </BetterTooltip>
                    )
                }
            </Box>
            {/* </BetterTooltip> */}
        </Box>
    )
}

function GradesDisplay({ grades }: { grades: { [key: string]: number } }) {
    //assume grades is an object like { XH: 10, XH_override: 2, X: 20, X_override: 5, ... }

    return (
        <Grid container spacing={{ xs: 0, sm: 2 }} justifyContent="center" alignItems="center">
            <_SingularGradeDisplay grade="XH" count={grades.XH || 0} overrideCount={grades.XH_override} />
            <_SingularGradeDisplay grade="X" count={grades.X || 0} overrideCount={grades.X_override} />
            <_SingularGradeDisplay grade="SH" count={grades.SH || 0} overrideCount={grades.SH_override} />
            <_SingularGradeDisplay grade="S" count={grades.S || 0} overrideCount={grades.S_override} />
            <_SingularGradeDisplay grade="A" count={grades.A || 0} overrideCount={grades.A_override} />
            <_SingularGradeDisplay grade="B" count={grades.B || 0} overrideCount={grades.B_override} />
            <_SingularGradeDisplay grade="C" count={grades.C || 0} overrideCount={grades.C_override} />
            <_SingularGradeDisplay grade="D" count={grades.D || 0} overrideCount={grades.D_override} />
        </Grid>
    )
}

export default GradesDisplay;