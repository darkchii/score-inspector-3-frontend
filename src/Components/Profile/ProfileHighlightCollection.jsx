import { Grid } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import ProfileHighlight from "./ProfileHighlight";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NumberFlow from "@number-flow/react";
import { Icon } from "@iconify/react";

function ProfileHighlightCollection() {
    const { userLive, activeRuleset, getRulesetStatistics, getRulesetUser } = useProfile();

    return (
        <>
            <Grid container spacing={0.5}>
                <Grid item key="scores" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Scores"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.clears || 0} />}
                    />
                </Grid>

                <Grid item key="clears" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Clears"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.clears || 0} />}
                    />
                </Grid>

                <Grid item key="performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.performance_points || 0} suffix='pp' />}
                    />
                </Grid>

                <Grid item key="ranked_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        title={"Ranked Score"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.ranked_score || 0} />}
                    />
                </Grid>

                <Grid item key="total_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        title={"Total Score"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.total_score || 0} />}
                    />
                </Grid>

                <Grid item key="lazer_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        title={"Lazer Score"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score?.score || 0} />}
                    />
                </Grid>

                <Grid item key="playtime" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Playtime"}
                        value={<NumberFlow value={Math.floor((getRulesetUser(activeRuleset)?.play_time || 0) / 3600)} suffix="h" />}
                    />
                </Grid>

                <Grid item key="approx_time" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Approx Playtime"}
                        value={<NumberFlow value={Math.floor((getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.play_time || 0) / 3600)} suffix="h" />}
                    />
                </Grid>

                <Grid item key="sessions" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Sessions"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.sessions.length || 0} />}
                    />
                </Grid>

                <Grid item key="longest_session" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Longest Session"}
                        value={<NumberFlow value={Math.floor((getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_longest || 0) / 3600)} suffix="h" />}
                    />
                </Grid>

                <Grid item key="average_session" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Average Session"}
                        value={<NumberFlow value={Math.floor((getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_average || 0) / 3600)} suffix="h" />}
                    />
                </Grid>

                <Grid item key="playcount" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Playcount"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.play_count || 0} />}
                    />
                </Grid>

                <Grid item key="completion" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Completion"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.completion || 0) * 100.0} suffix="%" />}
                    />
                </Grid>

            </Grid>
        </>
    )
}

export default ProfileHighlightCollection;