import { Box, Grid } from "@mui/material";
import { useProfile } from "../../Providers/ProfileProvider";
import ProfileHighlight from "./ProfileHighlight";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import NumberFlow from "@number-flow/react";
import { Icon } from "@iconify/react";
import { FormatDuration, FormatDurationNumberFlow } from "../../Misc/Helper";
import { grey } from "@mui/material/colors";

function ProfileHighlightCollection() {
    const { userLive, activeRuleset, getRulesetStatistics, getRulesetUser, getApiUser } = useProfile();

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

                <Grid item key="playcount" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Playcount"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.play_count || 0} />}
                    />
                </Grid>

                <Grid item key="performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.performance_points || 0) + (getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.bonus_performance_points || 0)} suffix='pp' />}
                    />
                </Grid>

                <Grid item key="avg_performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Avg Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_performance || 0)} suffix='pp' />}
                    />
                </Grid>

                <Grid item key="avg_accuracy" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Avg Accuracy"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_accuracy || 0) * 100} suffix='%' />}
                    />
                </Grid>

                <Grid item key="avg_length" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Avg Length"}
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_length || 0)}
                    />
                </Grid>

                <Grid item key="avg_stars" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Avg Stars"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_stars || 0} suffix='★' />}
                    />
                </Grid>

                <Grid item key="fc_rate" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"FC Rate"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set?.fc_rate || 0) * 100} suffix='%' />}
                    />
                </Grid>

                <Grid item key="completion" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Completion"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.completion || 0) * 100.0} suffix="%" />}
                    />
                </Grid>

                <Grid item key="peak_combo" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Peak Combo"}
                        value={<NumberFlow value={(getRulesetStatistics(activeRuleset)?.scores_set?.max_combo || 0)} suffix="x" />}
                    />
                </Grid>

                {/* space placeholder to keep track of width, so 'lg' reaches 12 for this row */}
                <Grid item key="spacer" size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
                    <Box sx={{ backgroundColor: 'red', width: '100%', height: '100%' }}></Box>
                </Grid>

                <Grid item key="score_per_clear" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Score per Clear"}
                        value={<NumberFlow format={{ maximumFractionDigits: 0 }} value={getRulesetStatistics(activeRuleset)?.scores_set_by_score?.average_legacy_score || 0} />}
                    />
                </Grid>

                <Grid item key="ranked_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Ranked Score"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.ranked_score || 0} />}
                    />
                </Grid>

                <Grid item key="total_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
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

                <Grid item key="playtime" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Playtime"}
                        value={FormatDurationNumberFlow(getRulesetUser(activeRuleset)?.play_time || 0, true, 'days')}
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
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_longest || 0, true, 'days')}
                    />
                </Grid>

                <Grid item key="average_session" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Average Session"}
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_average || 0, true, 'days')}
                    />
                </Grid>


                <Grid item key="daily_challenge" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Daily Challenge"}
                        value={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <NumberFlow value={getApiUser()?.daily_challenge_user_stats?.daily_streak_best || 0} />
                                <div style={{ fontSize: '0.7rem', color: grey[500], lineHeight: '0.6rem'}}>
                                    best<br />streak
                                </div>
                                <NumberFlow value={getApiUser()?.daily_challenge_user_stats?.daily_streak_current || 0} />
                                <div style={{ fontSize: '0.7rem', color: grey[500], lineHeight: '0.6rem'}}>
                                    current
                                </div>
                            </div>
                        }
                    />
                </Grid>

                <Grid item key="spacer" size={{ xs: 12, sm: 6, md: 6, lg: 1.5 }}>
                    <Box sx={{ backgroundColor: 'red', width: '100%', height: '100%' }}></Box>
                </Grid>

            </Grid>
        </>
    )
}

export default ProfileHighlightCollection;