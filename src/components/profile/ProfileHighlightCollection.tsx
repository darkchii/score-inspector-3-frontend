import { Grid } from "@mui/material";
import { useProfile } from "../../providers/ProfileProvider";
import ProfileHighlight from "./ProfileHighlight";
import NumberFlow from "@number-flow/react";
import { FormatDurationNumberFlow } from "../../util/Helper";
import { grey } from "@mui/material/colors";

function ProfileHighlightCollection() {
    const { activeRuleset, getRulesetStatistics, getRulesetUser, getApiUser } = useProfile();

    return (
        <>
            <Grid container spacing={0.5}>
                <Grid key="scores" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Scores"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.clears || 0} />}
                    />
                </Grid>

                <Grid key="clears" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Clears"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.clears || 0} />}
                    />
                </Grid>

                <Grid key="playcount" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Playcount"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.play_count || 0} />}
                    />
                </Grid>

                <Grid key="total_performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Total Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 0 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.total_performance_points || 0)} suffix='pp' />}
                    />
                </Grid>

                <Grid key="performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.performance_points || 0) + (getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.bonus_performance_points || 0)} suffix='pp' />}
                    />
                </Grid>

                <Grid key="avg_performance" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Avg Performance"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_performance || 0)} suffix='pp' />}
                    />
                </Grid>

                <Grid key="avg_accuracy" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Avg Accuracy"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_accuracy || 0) * 100} suffix='%' />}
                    />
                </Grid>

                <Grid key="avg_length" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Avg Length"}
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_length || 0)}
                    />
                </Grid>

                <Grid key="avg_stars" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Avg Stars"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={getRulesetStatistics(activeRuleset)?.scores_set_by_pp?.average_stars || 0} suffix='★' />}
                    />
                </Grid>

                <Grid key="fc_rate" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"FC Rate"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.scores_set?.fc_rate || 0) * 100} suffix='%' />}
                    />
                </Grid>

                <Grid key="completion" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Completion"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetStatistics(activeRuleset)?.completion || 0) * 100.0} suffix="%" />}
                    />
                </Grid>

                <Grid key="peak_combo" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Peak Combo"}
                        value={<NumberFlow value={(getRulesetStatistics(activeRuleset)?.scores_set?.max_combo || 0)} suffix="x" />}
                    />
                </Grid>

                <Grid key="xp_2_0" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"XP 2.0"}
                        value={<NumberFlow format={{ maximumFractionDigits: 0 }} value={(getRulesetUser(activeRuleset)?.xp_2_0 || 0)} />}
                    />
                </Grid>

                <Grid key="dedi_level" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Level 2.0"}
                        value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={(getRulesetUser(activeRuleset)?.dedication_level || 0)} />}
                    />
                </Grid>

                <Grid key="score_per_clear" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Score per Clear"}
                        value={<NumberFlow format={{ maximumFractionDigits: 0 }} value={getRulesetStatistics(activeRuleset)?.scores_set_by_score?.average_implied_score || 0} />}
                    />
                </Grid>

                <Grid key="ranked_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Ranked Score"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.ranked_score || 0} />}
                    />
                </Grid>

                <Grid key="total_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Total Score"}
                        value={<NumberFlow value={getRulesetUser(activeRuleset)?.total_score || 0} />}
                    />
                </Grid>

                <Grid key="lazer_score" size={{ xs: 12, sm: 6, md: 6, lg: 1.5 }}>
                    <ProfileHighlight
                        title={"Standardised Score"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set_by_score?.score || 0} />}
                    />
                </Grid>

                <Grid key="playtime" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Playtime"}
                        value={FormatDurationNumberFlow(getRulesetUser(activeRuleset)?.play_time || 0, true, 'days')}
                    />
                </Grid>

                <Grid key="sessions" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Sessions"}
                        value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.sessions.length || 0} />}
                    />
                </Grid>

                <Grid key="longest_session" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Longest Session"}
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_longest || 0, true, 'days')}
                    />
                </Grid>

                <Grid key="average_session" size={{ xs: 12, sm: 6, md: 6, lg: 1 }}>
                    <ProfileHighlight
                        title={"Average Session"}
                        value={FormatDurationNumberFlow(getRulesetStatistics(activeRuleset)?.scores_set?.sessions?.duration_average || 0, true, 'days')}
                    />
                </Grid>

                <Grid key="badges" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Badges"}
                        value={<NumberFlow value={getApiUser()?.badges?.length || 0} />}
                    />
                </Grid>

                <Grid key="medals" size={{ xs: 12, sm: 6, md: 6, lg: 0.75 }}>
                    <ProfileHighlight
                        title={"Medals"}
                        value={<NumberFlow value={getApiUser()?.user_achievements?.length || 0} />}
                    />
                </Grid>

                <Grid key="daily_challenge" size={{ xs: 12, sm: 6, md: 6, lg: 1.25 }}>
                    <ProfileHighlight
                        title={"Daily Challenge"}
                        value={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <NumberFlow value={getApiUser()?.daily_challenge_user_stats?.daily_streak_best || 0} />
                                <div style={{ fontSize: '0.7rem', color: grey[500], lineHeight: '0.6rem' }}>
                                    best<br />streak
                                </div>
                                <NumberFlow value={getApiUser()?.daily_challenge_user_stats?.daily_streak_current || 0} />
                                <div style={{ fontSize: '0.7rem', color: grey[500], lineHeight: '0.6rem' }}>
                                    current
                                </div>
                            </div>
                        }
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default ProfileHighlightCollection;