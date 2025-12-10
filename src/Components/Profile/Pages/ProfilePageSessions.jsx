import { Alert, Box, Divider, Grid, List, ListItemButton, ListItemText, Pagination, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, Typography, useTheme } from "@mui/material";
import { useProfile } from "../../../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ScoreList from "../../ScoreList";
import { TextureDatabase } from "../../../Assets/Textures/TextureDatabase";
import NumberFlow from "@number-flow/react";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { FormatDuration } from "../../../Misc/Helper";

function SessionDisplay({ session }) {
    const theme = useTheme();

    if (!session) return <Alert severity="info">No session selected.</Alert>;

    return (
        <Box>
            <Box sx={{ flex: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeXH} alt="XH" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.XH || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeX} alt="X" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.X || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeSH} alt="SH" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.SH || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeS} alt="S" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.S || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeA} alt="A" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.A || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeB} alt="B" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.B || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeC} alt="C" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.C || 0} /></Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <img src={TextureDatabase.SVGGradeD} alt="D" width={48} height={48} />
                    <Typography variant="h6"><NumberFlow value={session.grades?.D || 0} /></Typography>
                </Box>
            </Box>
            <Paper elevation={1} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', p: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6">{session.start.toLocaleString()}</Typography>
                    <ArrowForwardIosIcon />
                    <Typography><NumberFlow value={Math.floor(session.duration / 60)} /> minutes</Typography>
                    <ArrowForwardIosIcon />
                    <Typography variant="h6">{session.end.toLocaleString()}</Typography>
                </Box>
            </Paper>
            <Paper elevation={1} sx={{ mt: 2 }}>
                <TableContainer>
                    <Table size='small' sx={{
                        [`& .${tableCellClasses.root}`]: {
                            borderBottom: "none",
                        },
                    }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                                <TableCell>{FormatDuration(session.duration)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Scores</TableCell>
                                <TableCell><NumberFlow value={session.score_count} /></TableCell>
                            </TableRow>
                            {/* Empty row for spacing */}
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total Score</TableCell>
                                <TableCell><NumberFlow value={session.cumulative_implied_total_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Score</TableCell>
                                <TableCell><NumberFlow value={session.average_implied_total_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Score</TableCell>
                                <TableCell><NumberFlow value={session.max_implied_total_score} /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Lazer Score</TableCell>
                                <TableCell><NumberFlow value={session.cumulative_lazer_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Lazer Score</TableCell>
                                <TableCell><NumberFlow value={session.average_lazer_score} /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Lazer Score</TableCell>
                                <TableCell><NumberFlow value={session.max_lazer_score} /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.cumulative_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Average Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.average_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Highest Performance</TableCell>
                                <TableCell><NumberFlow format={{ maximumFractionDigits: 2 }} value={session.max_pp} suffix="pp" /></TableCell>
                            </TableRow>
                            <Grid sx={{ mt: theme.spacing(2), }} />
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Breaks Taken</TableCell>
                                <TableCell><NumberFlow value={session.break_count} /></TableCell>
                            </TableRow>
                            {
                                session.break_count > 0 ? (
                                    <>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Total Break Time</TableCell>
                                            <TableCell>{FormatDuration(session.total_break_time || 0)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Average Break Time</TableCell>
                                            <TableCell>{FormatDuration(session.average_break_time || 0)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Longest Break Time</TableCell>
                                            <TableCell>{FormatDuration(session.longest_break_time || 0)}</TableCell>
                                        </TableRow></>
                                ) : null
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Scores</Typography>
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {
                    session.scores.length === 0 ? (
                        <Alert severity="info">No scores available for this session.</Alert>
                    ) : (
                        <ScoreList truncate scores={session.scores} onSelectScore={() => { }} />
                    )
                }
            </Box>
        </Box >
    );
}

const _sessionsPerPage = 10;
function ProfilePageSessions() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [displaySessionData, setDisplaySessionData] = useState(null);

    const [sessionCount, setSessionCount] = useState(0);
    const [sessionSelectorPage, setSessionSelectorPage] = useState(0);

    useEffect(() => {
        const count = getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.length || 0;
        setSessionCount(count);

        //reset selection
        setSelectedSessionId(null);
        setSessionSelectorPage(0);
    }, [getRulesetStatistics, activeRuleset]);

    const getSession = () => {
        if (!selectedSessionId) return null;
        return getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.getById(selectedSessionId);
    }

    useEffect(() => {
        setDisplaySessionData(getSession());
    }, [selectedSessionId]);

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                {/* Session listing sidebar*/}
                <Grid item size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        <Box sx={{ maxHeight: '100vh', overflowY: 'auto' }}>
                            {sessionCount === 0 ? (
                                <Typography>No sessions available.</Typography>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                        <Pagination
                                            count={Math.ceil(sessionCount / _sessionsPerPage)}
                                            page={sessionSelectorPage + 1}
                                            onChange={(event, value) => setSessionSelectorPage(value - 1)}
                                            color="primary"
                                        />
                                    </Box>
                                    <List>
                                        {getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.get().slice(sessionSelectorPage * _sessionsPerPage, (sessionSelectorPage + 1) * _sessionsPerPage).map((session) => (
                                            <ListItemButton
                                                key={session.id}
                                                selected={selectedSessionId === session.id}
                                                onClick={() => setSelectedSessionId(session.id)}
                                            >
                                                <ListItemText
                                                    primary={`${session.start.toLocaleString()}`}
                                                    secondary={`Duration: ${FormatDuration(session.duration)}, Scores: ${session.score_count}`} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
                {/* Session viewer */}
                <Grid item size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        {
                            (!selectedSessionId || displaySessionData === undefined) ? (
                                <Alert severity="info">Please select a session to view details.</Alert>
                            ) : (
                                <SessionDisplay session={displaySessionData} />
                            )
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageSessions;