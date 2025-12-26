import { Box, Grid, Pagination, Typography } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import ScoreList from "../../ScoreList";
import ScoreFilter from "../../ScoreFilter";

const _scoresPerPage = 50;

function ProfilePageScores() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [page, setPage] = useState(0);
    const [displayedScoreDatabase, setDisplayedScoreDatabase] = useState([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [scoreCount, setScoreCount] = useState(0);

    const applyFilteredScores = (filteredScores) => {
        setScoreCount(filteredScores.length);

        //generate all page arrays
        const pages = [];
        for (let i = 0; i < filteredScores.length; i += _scoresPerPage) {
            pages.push(filteredScores.slice(i, i + _scoresPerPage));
        }
        setDisplayedScoreDatabase(pages);
        setPage(0); //reset to first page on filter change
    }

    useEffect(() => {
        applyFilteredScores(getRulesetStatistics(activeRuleset)?.scores_set.scores || []);
    }, [activeRuleset]);

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 2.5 }}>
                    <ScoreFilter
                        data={getRulesetStatistics(activeRuleset)?.scores_set.scores || []}
                        onFiltered={applyFilteredScores}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 9.5 }}>
                    {
                        displayedScoreDatabase.length === 0 ?
                            <Typography variant="h6" sx={{ mt: 4 }}>
                                No scores to display.
                            </Typography>
                            :
                            <Box>
                                <Pagination
                                    count={Math.ceil(scoreCount / _scoresPerPage)}
                                    page={page + 1}
                                    onChange={(_, value) => setPage(value - 1)}
                                    sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
                                />
                                <ScoreList showIndex startIndex={page * _scoresPerPage} scores={displayedScoreDatabase[page] || []} onSelectScore={(score) => {
                                    console.log("Selected score:", score);
                                }} />
                            </Box>
                    }
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageScores;