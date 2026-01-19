import { Alert, Box, Collapse, Pagination, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import RulesetSelector from "../components/RulesetSelector";
import { useApi } from "../providers/ApiProvider";
import NumberFlow from "@number-flow/react";

const LIMIT = 50;
const LEADERBOARDS = {
    'pp': {
        title: 'Performance',
        suffix: 'pp',
        category: 'user',
    },
    'ranked_score': {
        title: 'Ranked Score',
        category: 'user',
    },
    'total_score': {
        title: 'Total Score',
        category: 'user',
    },
    'total_scores_count': {
        title: 'Clears',
        category: 'user',
    },
    'grade_counts_ssh': {
        title: 'Grade SSH',
        category: 'grades',
    },
    'grade_counts_ss': {
        title: 'Grade SS',
        category: 'grades',
    },
    'grade_counts_sh': {
        title: 'Grade SH',
        category: 'grades',
    },
    'grade_counts_s': {
        title: 'Grade S',
        category: 'grades',
    },
    'grade_counts_a': {
        title: 'Grade A',
        category: 'grades',
    },
    'grade_counts_b': {
        title: 'Grade B',
        category: 'grades',
    },
    'grade_counts_c': {
        title: 'Grade C',
        category: 'grades',
    },
    'grade_counts_d': {
        title: 'Grade D',
        category: 'grades',
    },
    'replays_watched_by_others': {
        title: 'Replays Watched',
        category: 'user',
    },
    'play_time': {
        title: 'Play Time',
        category: 'user',
        //given in seconds
        formatter: (value) => {
            const hours = Math.floor(value / 3600);
            return hours;
        },
        suffix: 'hrs',
    },
    'play_count': {
        title: 'Play Count',
        category: 'user',
    }
}

function RouteLeaderboards() {
    const params = useParams();
    const { getLeaderboard } = useApi();
    const [ruleset, setRuleset] = useState('osu');
    const [statistic, setStatistic] = useState(params.statistic || null);
    const [page, setPage] = useState(params.page || 1);
    const [leaderboardResults, setLeaderboardResults] = useState(null);

    const [error, setError] = useState(null);
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        setStatistic(params.statistic || null);
        setPage(params.page || 1);
        setRuleset(params.ruleset || 'osu');
    }, [params.statistic, params.page, params.ruleset]);

    useEffect(() => {
        //change url without reloading
        window.history.replaceState(null, null, `/leaderboards/${ruleset}/${statistic || 'pp'}/page/${page || 1}`);

        //fetch leaderboard data here based on statistic and page
        (async () => {
            setIsWorking(true);
            try {
                const data = await getLeaderboard(ruleset, statistic, page, "desc", LIMIT);
                console.log(data);
                setLeaderboardResults(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
                setError("Failed to load leaderboard data.");
                setLeaderboardResults(null);
            }
            setIsWorking(false);
        })()
    }, [ruleset, statistic, page]);

    if (!statistic) {
        return <Navigate to={`/leaderboards/osu/${Object.keys(LEADERBOARDS)[0]}`} replace />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <div>
                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                    <RulesetSelector activeRuleset={ruleset} onChange={setRuleset} disabled={isWorking} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                    <Tabs aria-label='leaderboards-tabs' value={statistic} textColor="primary" indicatorColor="primary">
                        {
                            Object.keys(LEADERBOARDS).map((key) => {
                                return (
                                    <Tab
                                        key={`leaderboards-tab-${key}`}
                                        label={LEADERBOARDS[key].title}
                                        value={key}
                                        onClick={() => setStatistic(key)}
                                        disabled={statistic === key || isWorking}
                                    />
                                );
                            })
                        }
                    </Tabs>
                </Box>
                {
                    error ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    ) : null
                }
                {
                    leaderboardResults ? (
                        <Collapse in={!isWorking}>
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                                    <Pagination
                                        count={leaderboardResults.total_pages}
                                        page={parseInt(page)}
                                        onChange={(event, value) => setPage(value)}
                                        color="primary"
                                        disabled={isWorking}
                                    />
                                </Box>
                                {/* Temporary, just a table */}
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Rank</TableCell>
                                                <TableCell>Username</TableCell>
                                                <TableCell align="right">{LEADERBOARDS[statistic].title}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                leaderboardResults.entries.map((entry) => (
                                                    <TableRow key={`leaderboard-entry-${entry.rank}`}>
                                                        <TableCell>#0</TableCell>
                                                        <TableCell>{entry.user.osuApi?.username || "Unknown"}</TableCell>
                                                        <TableCell align="right">{LEADERBOARDS[statistic].formatter ? LEADERBOARDS[statistic].formatter(Number(entry.value)) : Number(entry.value)}{LEADERBOARDS[statistic].suffix || null}</TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </Collapse>
                    ) : null
                }
            </div>
        </Box>
    );
}

export default RouteLeaderboards;