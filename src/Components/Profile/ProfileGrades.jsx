import { Box, Container, Grid, Paper, SvgIcon } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import { TextureDatabase } from "../../Data/Textures/TextureDatabase";
import { FormatNumber } from "../../Misc/Helper";

function ProfileGrades() {
    const { activeRuleset, getRulesetStatistics } = useProfile();

    return (
        <Paper elevation={3} sx={{ padding: 2 }}>
            <Container>
                {/* we need a desktop and mobile view */}

                <Grid container spacing={2}>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeXH} alt="XH" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.XH || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeX} alt="X" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.X || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeSH} alt="SH" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.SH || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeS} alt="S" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.S || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeA} alt="A" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.A || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeB} alt="B" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.B || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeC} alt="C" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.C || 0)}</div>
                        </Box>
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 1.5, lg: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'start', gap: 1 }}>
                            <img src={TextureDatabase.SVGGradeD} alt="D" width={48} height={48} />
                            <div>{FormatNumber(getRulesetStatistics(activeRuleset)?.scores_set.grades?.D || 0)}</div>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Paper>
    );
}

export default ProfileGrades;