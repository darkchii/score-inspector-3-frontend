import { Box, Stack, Typography } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import ItemList from "../list/ItemList";
import ScoreListRow from "../list/ScoreListRow";

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
                            <ItemList
                                items={getRulesetStatistics(activeRuleset)?.scores_set?.recent_scores} 
                                truncate={true}
                                ItemListRowType={ScoreListRow}
                            />
                    }
                </Stack>
            </Box>
        </Box>
    );
}

export default ProfileRecentActivity;