import { Box, Container, Grid, Paper, SvgIcon, Tooltip, Typography } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import { TextureDatabase } from "../../assets/textures/TextureDatabase";
import { FormatNumber } from "../../util/Helper";
import NumberFlow from '@number-flow/react'

function ProfileGrades() {
    const { activeRuleset, getRulesetStatistics } = useProfile();

    return (
        <Paper elevation={3} sx={{ padding: 1 }}>
            <Container>
                {/* we need a desktop and mobile view */}

                {/* spacing 2 for desktop, 0.5 for mobile */}
                <Grid container spacing={{ xs: 0, sm: 2 }}>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeXH} alt="XH" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.XH || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.XH || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeX} alt="X" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.X || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.X || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeSH} alt="SH" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.SH || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.SH || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeS} alt="S" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.S || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.S || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeA} alt="A" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.A || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.A || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeB} alt="B" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.B || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.B || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeC} alt="C" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.C || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.C || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeD} alt="D" width={48} height={48} />
                            <Tooltip title={`Including overrides: ${FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.D || 0)} total`}>
                                <Typography variant="h6"><NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score.grades?.D || 0} /></Typography>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
}

export default ProfileGrades;