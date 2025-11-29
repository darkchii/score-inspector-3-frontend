import { Box, Grid, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { useProfile } from "../../../Providers/ProfileProvider";
import { useState } from "react";

function ProfilePageSessions() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    const getSession = () => {
        if (!selectedSessionId) return null;
        return getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.getById(selectedSessionId);
    }

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                {/* Session listing sidebar*/}
                <Grid item size={{ xs: 12, sm: 12, md: 4, lg: 3 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <List>
                                {
                                    getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.length === 0 ? (
                                        <Typography>No sessions available.</Typography>
                                    ) : (
                                        getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.get().map((session) => (
                                            <ListItemButton
                                                key={session.id}
                                                selected={selectedSessionId === session.id}
                                                onClick={() => setSelectedSessionId(session.id)}
                                            >
                                                <ListItemText primary={`${session.start.toLocaleString()}`} secondary={`Duration: ${Math.floor(session.duration / 60)} minutes, Scores: ${session.score_count}`} />
                                            </ListItemButton>
                                        ))
                                    )
                                }
                            </List>
                        </Box>
                    </Paper>
                </Grid>
                {/* Session viewer */}
                <Grid item size={{ xs: 12, sm: 12, md: 8, lg: 9 }}>
                    <Paper elevation={3} sx={{ width: '100%', height: '100%', p: 2 }}>
                        {
                            (!selectedSessionId || getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.getById(selectedSessionId) === undefined) ? (
                                <Typography>Select a session to view details.</Typography>
                            ) : (
                                <Box>
                                    <Typography variant="h6">Session Details</Typography>
                                    <Typography>Start: {getSession().start.toLocaleString()}</Typography>
                                    <Typography>End: {getSession().end.toLocaleString()}</Typography>
                                    <Typography>Duration: {Math.floor(getSession().duration / 60)} minutes</Typography>
                                    <Typography>Number of Scores: {getSession().score_count}</Typography>
                                    <Typography>Grades:</Typography>
                                    <List>
                                        {Object.entries(getSession().grades).map(([grade, count]) => (
                                            <ListItemText key={grade} primary={`${grade}: ${count}`} />
                                        ))}
                                    </List>
                                </Box>
                            )
                        }
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageSessions;