import { Box, Container, Grid, Paper, SvgIcon, Tooltip, Typography } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import { TextureDatabase } from "../../assets/textures/TextureDatabase";
import { FormatNumber } from "../../util/Helper";
import NumberFlow from '@number-flow/react'
import GradesDisplay from "../GradesDisplay";

function ProfileGrades() {
    const { activeRuleset, getRulesetStatistics } = useProfile();

    return (
        <Paper elevation={3} sx={{ padding: 1}}>
            {/* we need a desktop and mobile view */}

            {/* spacing 2 for desktop, 0.5 for mobile */}
            <Container>
                <GradesDisplay grades={
                    {
                        XH: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.XH || 0,
                        XH_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.XH || 0,
                        X: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.X || 0,
                        X_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.X || 0,
                        SH: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.SH || 0,
                        SH_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.SH || 0,
                        S: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.S || 0,
                        S_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.S || 0,
                        A: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.A || 0,
                        A_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.A || 0,
                        B: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.B || 0,
                        B_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.B || 0,
                        C: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.C || 0,
                        C_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.C || 0,
                        D: getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.D || 0,
                        D_override: getRulesetStatistics(activeRuleset)?.scores_set.grades?.D || 0,
                    }
                } />
            </Container>
        </Paper>
    );
}

export default ProfileGrades;