import { Box, Button, ButtonGroup, CircularProgress, Collapse, Divider, Pagination, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import RulesetSelector from '../components/RulesetSelector';
import { Navigate, useParams } from 'react-router';
import { useApi } from '../providers/ApiProvider';
import { FormatNumber, ShowNotification } from '../util/Helper';
import { DatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import ItemList from '../components/list/ItemList';
import PlayerListRow from '../components/list/PlayerListRow';

const VALID_STATS = {
    rank: {
        name: 'Rank',
        key: 'rank',
    },
    gained_score: {
        name: 'Gained Score',
        key: 'gained_score',
    },
    gained_rank: {
        name: 'Gained Rank',
        key: 'gained_rank',
    }
};

function RouteScore() {
    const params = useParams();
    const { getScoreRankDates, getHistoricScoreRanks } = useApi();
    const [activeRuleset, setActiveRuleset] = useState(params.ruleset || 'osu');
    const [activeStat, setActiveStat] = useState(params.stat || 'rank');
    const [activeDate, setActiveDate] = useState(params.date ? moment.utc(params.date, 'YYYY-MM-DD', true) : null);
    const [activePage, setActivePage] = useState(parseInt(params.page) || 1);
    const [data, setData] = useState(null);

    //TODO: date selector should grey out dates not in validDates
    const [validDates, setValidDates] = useState(null);

    const [isWorking, setIsWorking] = useState(false);
    const [isLoadingDates, setIsLoadingDates] = useState(false);

    const requestLeaderboard = async () => {
        if (!activeRuleset || !activeStat || !activeDate) return;

        setIsWorking(true);
        try {
            const response = await getHistoricScoreRanks(activeRuleset, activeStat, activeDate.format('YYYY-MM-DD'), activePage);
            if (response && response.entries) {
                setData(response);
                console.log("Fetched leaderboard data:", response);
            } else {
                setData(null);
                ShowNotification("No data available for the selected date and ruleset.", "info");
            }
        } catch (error) {
            ShowNotification("Failed to fetch leaderboard data.", "error");
            console.error("Error fetching leaderboard data:", error);
        } finally {
            setIsWorking(false);
        }
    }

    const requestValidDates = async () => {
        if (!activeRuleset) return;

        setIsLoadingDates(true);
        try {
            const response = await getScoreRankDates(activeRuleset);
            if (response.dates && Array.isArray(response.dates)) {
                const dateMoments = response.dates.map(date => {
                    const m = moment.utc(date, moment.ISO_8601, true);
                    if (m.isValid()) {
                        return m;
                    } else {
                        console.warn(`Invalid date format received from API: ${date}`);
                        return null;
                    }
                }).filter(d => d !== null);

                setValidDates(dateMoments);

                // If activeDate is not set from params, set it to the most recent date
                if (!params.date && dateMoments.length > 0) {
                    const mostRecentDate = dateMoments.reduce((latest, current) =>
                        current.isAfter(latest) ? current : latest
                    );
                    setActiveDate(mostRecentDate);
                }
            } else {
                setValidDates([]);
            }
        } catch (error) {
            ShowNotification("Failed to fetch valid dates for leaderboard.", "error");
            console.error("Error fetching valid dates for leaderboard:", error);
            setValidDates([]);
        } finally {
            setIsLoadingDates(false);
        }
    }

    useEffect(() => {
        requestValidDates();
    }, [activeRuleset]);

    useEffect(() => {
        // Sync state with URL params  
        const newRuleset = params.ruleset || 'osu';
        const newStat = params.stat || 'rank';
        const newDate = params.date ? moment.utc(params.date, 'YYYY-MM-DD', true) : null;
        const newPage = parseInt(params.page) || 1;

        setActiveRuleset(newRuleset);
        setActiveStat(newStat);
        setActivePage(newPage);

        // Only set date from params if it's valid
        if (newDate && newDate.isValid()) {
            setActiveDate(newDate);
        }
    }, [params.ruleset, params.stat, params.date, params.page]);

    useEffect(() => {
        // Update URL when state changes
        if (activeRuleset && activeDate) {
            const url = `/score/${activeRuleset}/${activeStat}/${activeDate.format('YYYY-MM-DD')}/page/${activePage}`;
            window.history.replaceState({}, '', url);
        }
    }, [activeRuleset, activeStat, activeDate, activePage]);

    useEffect(() => {
        // Fetch leaderboard data when all required params are ready
        if (activeRuleset && activeStat && activeDate && !isLoadingDates) {
            requestLeaderboard();
        }
    }, [activeRuleset, activeStat, activeDate, activePage, isLoadingDates]);

    if (!activeRuleset) {
        return <Navigate to={`/score/osu/rank`} replace />;
    }

    const isLoading = isLoadingDates || (isWorking && !data);

    if (isLoadingDates || validDates === null) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    }

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', width: '100%' }}>
            <RulesetSelector
                activeRuleset={activeRuleset}
                onChange={(ruleset) => setActiveRuleset(ruleset)}
                showCombined={false}
            />

            <Box sx={{pt: 1}} />

            <DatePicker
                label="Select Date"
                value={activeDate}
                onChange={(newValue) => setActiveDate(newValue)}
                slotProps={{
                    textField: {
                        fullWidth: false,
                    },
                }}
                shouldDisableDate={(date) => {
                    return !validDates.some((validDate: any) => validDate.isSame(date, 'day'));
                }}
            />

            <ButtonGroup variant="contained">
                {
                    Object.values(VALID_STATS).map((stat: any) => (
                        <Button
                            key={`stat_${stat.key}`}
                            onClick={() => setActiveStat(stat.key)}
                            color={activeStat === stat.key ? 'primary' : 'inherit'}
                        >
                            {stat.name}
                        </Button>
                    ))
                }
            </ButtonGroup>

            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{
                    minWidth: '50vw',
                    mt: 2,
                    //minWidth 100% on small screens
                    '@media (max-width: 600px)': {
                        minWidth: '100vw',
                    },
                }}>
                    <Collapse in={isWorking} unmountOnExit>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress />
                        </Box>
                    </Collapse>
                    <Collapse in={!isWorking && data && data.entries && data.entries.length > 0} unmountOnExit>
                        <Box sx={{ mt: 2, width: '100%' }}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                                <Pagination
                                    count={data?.total_pages || 1}
                                    page={activePage}
                                    onChange={(event, value) => setActivePage(value)}
                                    color="primary"
                                    disabled={isWorking}
                                />
                            </Box>
                            <ItemList
                                startIndex={(activePage - 1) * 50}
                                showIndex={true}
                                showIndexDifference={true}
                                indexFromItem={'score_rank.rank'}
                                indexDifferencePosition='score_rank.gained_rank'
                                items={data?.entries?.map((entry: any) => entry.user)}
                                isCompact={false}
                                truncate={false}
                                ItemListRowType={PlayerListRow}
                                leaderboardField={`score_rank.ranked_score`}
                                secondaryLeaderboardField={`score_rank.gained_score`}
                                leaderboardFormat={(value: number) => `${FormatNumber(value)}`}
                            />
                            <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                                <Pagination
                                    count={data?.total_pages || 1}
                                    page={activePage}
                                    onChange={(event, value) => setActivePage(value)}
                                    color="primary"
                                    disabled={isWorking}
                                />
                            </Box>
                        </Box>
                    </Collapse>
                    <Collapse in={!isWorking && (!data || !data.entries || data.entries.length === 0)} unmountOnExit>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <Typography variant="body1" color="text.secondary">
                                No data available for the selected date and ruleset.
                            </Typography>
                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </Box>
    )
}

export default RouteScore;