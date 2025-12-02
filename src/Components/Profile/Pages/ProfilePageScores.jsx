import { Box, Pagination, Typography } from "@mui/material";
import { useProfile } from "../../../Providers/ProfileProvider";
import { useEffect, useState } from "react";
import ScoreList from "../../ScoreList";

const _scoresPerPage = 50;

function ProfilePageScores() {
    const {getRulesetStatistics, activeRuleset } = useProfile();
    const [page, setPage] = useState(0);
    const [displayedScoreDatabase, setDisplayedScoreDatabase] = useState([]); //subsets of scores for pagination, makes it much faster than constantly slicing
    const [scoreCount, setScoreCount] = useState(0);

    useEffect(() => {
        console.log(getRulesetStatistics());
        const profileStatistics = getRulesetStatistics(activeRuleset);
        if (profileStatistics) {
            console.log("Rebuilding displayed score database for ruleset:", activeRuleset);
            const allScores = profileStatistics.scores_set.scores?.slice() || [];
            setScoreCount(allScores.length);

            //sort by pp descending
            allScores.sort((a, b) => b.pp - a.pp);

            //generate all page arrays
            const pages = [];
            for (let i = 0; i < allScores.length; i += _scoresPerPage) {
                pages.push(allScores.slice(i, i + _scoresPerPage));
            }

            setDisplayedScoreDatabase(pages);
            setPage(0); //reset to first page on ruleset change
        }
    }, [activeRuleset]);

    if (!displayedScoreDatabase || displayedScoreDatabase.length === 0) {
        return (
            <Box sx={{ padding: 2 }}>
                <Typography>No scores available.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 2 }}>
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
    )
}

export default ProfilePageScores;