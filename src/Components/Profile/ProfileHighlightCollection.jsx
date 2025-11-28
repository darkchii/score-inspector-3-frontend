import { Grid } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import ProfileHighlight from "./ProfileHighlight";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NumberFlow from "@number-flow/react";

function ProfileHighlightCollection() {
    const { userLive, activeRuleset, getRulesetStatistics, getRulesetUser } = useProfile();

    return (
        <>
            <Grid container spacing={1}>
                <Grid item key="scores" size={{ xs: 12, sm: 6, lg: 1 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Scores"
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.clears || 0} />}
                    />
                </Grid>

                <Grid item key="clears" size={{ xs: 12, sm: 6, lg: 1 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Clears"
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.clears || 0} />}
                    />
                </Grid>

                <Grid item key="playcount" size={{ xs: 12, sm: 6, lg: 1 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Playcount"
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.play_count || 0} />}
                    />
                </Grid>

                <Grid item key="performance" size={{ xs: 12, sm: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Performance"
                        value={<NumberFlow value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp.performance_points || 0) + (getRulesetStatistics(activeRuleset)?.scores_set_by_pp.bonus_performance_points || 0)} suffix="pp" />}
                    />
                </Grid>

                <Grid item key="ranked_score" size={{ xs: 12, sm: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Ranked Score"
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.ranked_score || 0} />}
                    />
                </Grid>

                <Grid item key="total_score" size={{ xs: 12, sm: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        icon={<EmojiEventsIcon />}
                        title="Total Score"
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.total_score || 0} />}
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default ProfileHighlightCollection;