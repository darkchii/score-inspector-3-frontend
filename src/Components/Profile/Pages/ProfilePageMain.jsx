import { Box, Container, Divider, Grid, Paper } from "@mui/material";
import ProfileGrades from "../ProfileGrades";
import ProfileHighlightCollection from "../ProfileHighlightCollection";
import ProfileRecentActivity from "../ProfileRecentActivity";
import ScoreCard from "../../ScoreCard";
import { useProfile } from "../../../Providers/ProfileProvider";
import NumberFlow from "@number-flow/react";
import { DateToString } from "../../../Misc/Helper";
import DifficultyBadge from "../../DifficultyBadge";

function ProfilePageMain() {
    const { getRulesetStatistics, activeRuleset } = useProfile();

    return (
        <>
            <ProfileGrades />
            <Box sx={{ m: 1 }}>
                <ProfileHighlightCollection />
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 12 / 5 }}>
                        <ScoreCard
                            title="Top performance"
                            value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_pp'] ? (getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_pp'].performance?.base?.pp || getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_pp'].pp || 0) : 0} suffix='pp' />}
                            score={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_pp']}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 12 / 5 }}>
                        <ScoreCard
                            title="Top score"
                            value={<NumberFlow value={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_score']?.implied_total_score} />}
                            score={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_score']}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 12 / 5 }}>
                        <ScoreCard
                            title="Top stars FC"
                            value={<div style={{ display: 'flex' }}><DifficultyBadge difficulty={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_fc']?.attr_diff?.star_rating || getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_fc']?.beatmap?.stars} /></div>}
                            score={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_fc']}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 12 / 5 }}>
                        <ScoreCard
                            title="Top stars SS"
                            value={<div style={{ display: 'flex' }}><DifficultyBadge difficulty={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_ss']?.attr_diff?.star_rating || getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_ss']?.beatmap?.stars} /></div>}
                            score={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['top_stars_ss']}
                        />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 12 / 5 }}>
                        <ScoreCard
                            title="Oldest"
                            //is already a date object, need to format
                            value={DateToString(getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['oldest'].ended_at)}
                            score={getRulesetStatistics(activeRuleset)?.scores_set?.highlighted_scores?.['oldest']}
                        />
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Paper elevation={3} sx={{ padding: 2, height: '100%' }}>
                    <ProfileRecentActivity />
                </Paper>
            </Box>
        </>
    );
}

export default ProfilePageMain;