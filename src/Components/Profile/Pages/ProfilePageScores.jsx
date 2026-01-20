import { Alert, Box, Grid, Pagination, Typography } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import ItemList from "../../list/ItemList";
import ScoreListRow from "../../list/ScoreListRow";

const _scoresPerPage = 50;

function ProfilePageScores() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [page, setPage] = useState(0);
    const [displayedScoreDatabase, setDisplayedScoreDatabase] = useState([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [scoreCount, setScoreCount] = useState(0);

    const applyFilteredScores = (filteredScores) => {
        setScoreCount(filteredScores.length);
        console.log("Filtered scores count:", filteredScores.length);

        //temporary: sort by .implied_pp desc
        filteredScores.sort((a, b) => b.implied_pp - a.implied_pp);

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
                {/* <Grid size={{ xs: 12, md: 2.5 }}>
                    <ScoreFilter
                        data={getRulesetStatistics(activeRuleset)?.scores_set.scores || []}
                        onFiltered={applyFilteredScores}
                        currentRuleset={activeRuleset}
                    />
                </Grid> */}
                <Grid size={{ xs: 12, md: 12 }}>
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
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Filtering and sorting will be added in the future.
                                </Alert>
                                <ItemList 
                                    showIndex 
                                    startIndex={page * _scoresPerPage} 
                                    items={displayedScoreDatabase[page] || []} 
                                    ItemListRowType={ScoreListRow}
                                />
                            </Box>
                    }
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageScores;