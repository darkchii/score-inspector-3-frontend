import { Box, CircularProgress, Grid, Paper, Stack, Typography } from "@mui/material";
import { TextureDatabase } from "../../assets/textures/TextureDatabase";
import { GetRulesetColor } from "../../util/Helper";
import { useEffect, useState } from "react";
import { useApi } from "../../providers/ApiProvider";
import NumberFlow from "@number-flow/react";

function IndexLanding() {
    const { getGlobalStats } = useApi();
    const [dataBeatmaps, setDataBeatmaps] = useState(null);
    const [dataScores, setDataScores] = useState(null);
    const [numTeams, setNumTeams] = useState(null);
    const [numUsers, setNumUsers] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const stats = await getGlobalStats();

                if(stats){
                    setDataBeatmaps(stats.beatmap_counts.data);
                    setDataScores(stats.score_counts.data.scores);
                    setNumTeams(stats.team_counts.data.total);
                    setNumUsers(stats.user_counts.data.total);
                }
            }catch (e) {
                console.error("Failed to fetch global stats:", e);
                setIsError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 1.5 }}>
                    <Paper sx={{ padding: 2 }}>
                        <Stack spacing={0.5}>
                            <Typography variant='subtitle2'>Beatmaps</Typography>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('osu')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetOsuIcon} alt="osu" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataBeatmaps === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataBeatmaps.mode_0} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('taiko')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetTaikoIcon} alt="taiko" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataBeatmaps === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataBeatmaps.mode_1} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('fruits')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetCatchIcon} alt="fruits" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataBeatmaps === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataBeatmaps.mode_2} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('mania')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetManiaIcon} alt="mania" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataBeatmaps === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataBeatmaps.mode_3} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 6, md: 1.5 }}>
                    <Paper sx={{ padding: 2 }}>
                        <Stack spacing={0.5}>
                            <Typography variant='subtitle2'>Scores</Typography>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('osu')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetOsuIcon} alt="osu" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataScores === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataScores.ruleset_0} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('taiko')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetTaikoIcon} alt="taiko" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataScores === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataScores.ruleset_1} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('fruits')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetCatchIcon} alt="fruits" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataScores === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataScores.ruleset_2} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                            <Paper sx={{
                                padding: 0.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                backgroundColor: GetRulesetColor('mania')[700],
                            }}>
                                <img className="profile-ruleset-icon" src={TextureDatabase.RulesetManiaIcon} alt="mania" width={24} height={24} style={{ filter: 'opacity(1)' }} />
                                {
                                    (dataScores === null || loading) ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        isError ? (
                                            <Typography variant='body1' color="error">Error</Typography>
                                        ) : (
                                            <Typography variant='body1'><NumberFlow value={dataScores.ruleset_3} /></Typography>
                                        )
                                    )
                                }
                            </Paper>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default IndexLanding;