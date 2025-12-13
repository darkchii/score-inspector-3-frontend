import { Box, List, Stack, Typography } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import ScoreList from "../ScoreList";

function ProfileRecentActivity() {
    const { getRulesetStatistics, activeRuleset } = useProfile();

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Recent Activity
            </Typography>
            <Box>
                <Stack spacing={1} sx={{ mb: 1 }}>
                    {
                        getRulesetStatistics(activeRuleset)?.scores_set?.recent_scores?.length === 0
                            ? <Typography>No recent activity available.</Typography>
                            //only show 20 recent scores
                            : 
                            <ScoreList scores={getRulesetStatistics(activeRuleset)?.scores_set?.recent_scores} truncate={true}/>
                    }
                </Stack>
            </Box>
        </Box>
    );
}

export default ProfileRecentActivity;