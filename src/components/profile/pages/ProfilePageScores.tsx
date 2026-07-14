import { Alert, Box, Grid, Pagination, Typography } from "@mui/material";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import ItemList from "../../list/ItemList";
import ScoreListRow from "../../list/ScoreListRow";
import ScoreFilter from "../../ScoreFilter";
import type { IScore } from "../../../types/types";

const _scoresPerPage = 50;

function ProfilePageScores() {
    const { getRulesetStatistics, activeRuleset, getScoresByIds, getAllScores } = useProfile();
    const [page, setPage] = useState(0);
    // const [displayedScoreDatabase, setDisplayedScoreDatabase] = useState<IScore[][]>([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [displayedScoreIdDatabase, setDisplayedScoreIdDatabase] = useState<number[][]>([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [activeScoreSubset, setActiveScoreSubset] = useState<IScore[]>([]); //the currently displayed subset of scores
    const [scoreCount, setScoreCount] = useState(0);
    const [isWorking, setIsWorking] = useState(false);

    const applyFilteredScores = (filteredScores: IScore[]) => {
        setScoreCount(filteredScores.length);
        const pages: number[][] = [];
        for (let i = 0; i < filteredScores.length; i += _scoresPerPage) {
            pages.push(filteredScores.slice(i, i + _scoresPerPage).map(score => score.id));
        }
        setDisplayedScoreIdDatabase(pages);
        setPage(0);
    }

    useEffect(() => {
        if(isWorking) return;
        console.log(`Active ruleset changed to ${activeRuleset}, updating displayed scores...`);
        (async () => {
            setIsWorking(true);
            console.log(`Emptying currently displayed scores...`);
            applyFilteredScores([]);

            console.log(`Sleeping for 250ms to allow the UI to update before doing the heavy lifting...`);
            //brief pause to allow the UI to update before doing the heavy lifting
            await new Promise(resolve => setTimeout(resolve, 250));

            console.log(`Fetching scores for ruleset ${activeRuleset}...`);
            const _scores = getRulesetStatistics(activeRuleset)?.scores_set.scores || [];
            //default sort by implied_pp desc
            console.log(`Sorting scores by implied_pp desc...`);
            _scores.sort((a: IScore, b: IScore) => b.implied_pp - a.implied_pp);
            console.log(`Applying filtered scores...`);
            applyFilteredScores(_scores);
            console.log(`Done updating displayed scores for ruleset ${activeRuleset}.`);
            setIsWorking(false);
        })();
    }, [activeRuleset]);

    useEffect(() => {
        const currentPageScoreIds = displayedScoreIdDatabase[page] || [];
        const currentPageScores = getScoresByIds(currentPageScoreIds);
        setActiveScoreSubset(currentPageScores);
    }, [page, displayedScoreIdDatabase]);

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 9.5 }}>
                    {
                        displayedScoreIdDatabase.length === 0 ?
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
                                    items={activeScoreSubset}
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
                            data={getAllScores()}
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