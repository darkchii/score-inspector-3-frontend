import { Alert, Box, Grid, Pagination, Typography } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import ItemList from "../../list/ItemList";
import ScoreListRow from "../../list/ScoreListRow";
import ScoreFilter from "../../ScoreFilter";
import type { IScore } from "../../../types/types";

const _scoresPerPage = 50;

function ProfilePageScores() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [page, setPage] = useState(0);
    const [displayedScoreDatabase, setDisplayedScoreDatabase] = useState<IScore[][]>([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [scoreCount, setScoreCount] = useState(0);

    const applyFilteredScores = (filteredScores: IScore[]) => {
        setScoreCount(filteredScores.length);
        const pages: IScore[][] = [];
        for (let i = 0; i < filteredScores.length; i += _scoresPerPage) {
            pages.push(filteredScores.slice(i, i + _scoresPerPage));
        }
        setDisplayedScoreDatabase(pages);
        setPage(0);
    }

    useEffect(() => {
        const _scores = getRulesetStatistics(activeRuleset)?.scores_set.scores || [];
        //default sort by implied_pp desc
        _scores.sort((a: IScore, b: IScore) => b.implied_pp - a.implied_pp);
        applyFilteredScores(_scores);
    }, [activeRuleset]);

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
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
                                <ItemList
                                    showIndex
                                    startIndex={page * _scoresPerPage}
                                    items={displayedScoreDatabase[page] || []}
                                    ItemListRowType={ScoreListRow}
                                />
                                <Pagination
                                    count={Math.ceil(scoreCount / _scoresPerPage)}
                                    page={page + 1}
                                    onChange={(_, value) => setPage(value - 1)}
                                    sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}
                                />
                            </Box>
                    }
                </Grid>
                <Grid size={{ xs: 12, md: 2.5 }}>
                    <Box sx={{ width: '100%', pr: 1 }}>
                        <ScoreFilter
                            data={getRulesetStatistics(activeRuleset)?.scores_set.scores || []}
                            onFiltered={applyFilteredScores}
                            currentRuleset={activeRuleset}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default ProfilePageScores;