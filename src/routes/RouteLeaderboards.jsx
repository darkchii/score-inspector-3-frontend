import { Alert, Box, Button, ButtonGroup, Collapse, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import RulesetSelector from "../components/RulesetSelector";
import { useApi } from "../providers/ApiProvider";
import { TextureDatabase } from "../assets/textures/TextureDatabase";
import { FormatNumber, FormatNumberWithPrecision } from "../util/Helper";
import ItemList from "../components/list/ItemList";
import PlayerListRow from "../components/list/PlayerListRow";
import { usePageTitle } from "../providers/TitleProvider";
import BetterTooltip from "../components/tooltips/BetterTooltip";

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
        formatter: FormatNumber,
    },
    'total_score': {
        title: 'Total Score',
        category: 'user',
        formatter: FormatNumber,
    },
    'total_scores_count': {
        title: 'Clears',
        category: 'user',
        formatter: FormatNumber,
    },
    'grade_counts_total_ss': {
        title: 'Total SS',
        img: [TextureDatabase.SVGGradeXH, TextureDatabase.SVGGradeX],
        category: 'grades',
        formatter: FormatNumber,
        description: 'Total SS ranks, gold and silver combined',
    },
    'grade_counts_ssh': {
        title: 'Grade SSH',
        img: TextureDatabase.SVGGradeXH,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_ss': {
        title: 'Grade SS',
        img: TextureDatabase.SVGGradeX,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_total_s': {
        title: 'Total S',
        img: [TextureDatabase.SVGGradeSH, TextureDatabase.SVGGradeS],
        category: 'grades',
        formatter: FormatNumber,
        description: 'Total S ranks, gold and silver combined',
    },
    'grade_counts_sh': {
        title: 'Grade SH',
        img: TextureDatabase.SVGGradeSH,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_s': {
        title: 'Grade S',
        img: TextureDatabase.SVGGradeS,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_a': {
        title: 'Grade A',
        img: TextureDatabase.SVGGradeA,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_b': {
        title: 'Grade B',
        img: TextureDatabase.SVGGradeB,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_c': {
        title: 'Grade C',
        img: TextureDatabase.SVGGradeC,
        category: 'grades',
        formatter: FormatNumber,
    },
    'grade_counts_d': {
        title: 'Grade D',
        img: TextureDatabase.SVGGradeD,
        category: 'grades',
        formatter: FormatNumber,
    },
    'replays_watched_by_others': {
        title: 'Replays Watched',
        category: 'user',
        formatter: FormatNumber,
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
        formatter: FormatNumber,
    },
    'completion': {
        title: 'Completion',
        category: 'user',
        formatter: (value) => {
            return `${FormatNumberWithPrecision(value, 2)}%`;
        },
    }
}
const LEADERBOARDS_CATEGORIES = Object.keys(LEADERBOARDS).reduce((acc, key) => {
    const category = LEADERBOARDS[key].category;
    if (!acc.includes(category)) {
        acc.push(category);
    }
    return acc;
}, []);

function RouteLeaderboards() {
    const params = useParams();
    const { getLeaderboard } = useApi();
    const [ruleset, setRuleset] = useState('osu');
    const [statistic, setStatistic] = useState(params.statistic || Object.keys(LEADERBOARDS)[0]);
    const [page, setPage] = useState(params.page || 1);
    const [leaderboardResults, setLeaderboardResults] = useState(null);

    const [error, setError] = useState(null);
    const [isWorking, setIsWorking] = useState(false);

    useEffect(() => {
        setStatistic(params.statistic || Object.keys(LEADERBOARDS)[0]);
        setPage(params.page || 1);
        setRuleset(params.ruleset || 'osu');
    }, [params.statistic, params.page, params.ruleset]);

    usePageTitle(`Leaderboards - ${LEADERBOARDS[statistic] ? LEADERBOARDS[statistic].title : ''}`);

    useEffect(() => {
        //change url without reloading
        window.history.replaceState(null, null, `/leaderboards/${ruleset}/${statistic || 'pp'}/page/${page || 1}`);

        //fetch leaderboard data here based on statistic and page
        (async () => {
            setIsWorking(true);
            try {
                const data = await getLeaderboard(ruleset, statistic, page, "desc", LIMIT);

                //data.entries[i].value should be moved to data.entries[i].user.osuAlternative.lb_value
                if (data && data.entries) {
                    data.entries = data.entries.map(entry => {
                        entry.user.osuAlternative = entry.user.osuAlternative || {};
                        entry.user.osuAlternative.lb_value = entry.value;
                        return entry;
                    });
                }
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
                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 2, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    {/* separate Tabs for each category */}
                    {
                        LEADERBOARDS_CATEGORIES.map((category) => {
                            return (
                                // <Tabs key={`leaderboards-category-tabs-${category}`} aria-label={`leaderboards-tabs-${category}`} value={statistic} textColor="primary" indicatorColor="primary">
                                <ButtonGroup size='small' key={`leaderboards-category-tabs-${category}`} variant="text" aria-label={`leaderboards-tabs-${category}`}>
                                    {Object.keys(LEADERBOARDS).filter((key) => LEADERBOARDS[key].category === category).map((key) => {
                                        return (
                                            <BetterTooltip key={`leaderboard-tab-tooltip-${key}`} title={LEADERBOARDS[key].description || ''} placement="top">
                                                <Button
                                                    variant={statistic === key ? "contained" : "text"}
                                                    key={`leaderboard-tab-${key}`}
                                                    value={key}
                                                    onClick={() => setStatistic(key)}
                                                    disabled={statistic === key || isWorking}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {
                                                            LEADERBOARDS[key].img ? (
                                                                // <Box
                                                                //     component="img"
                                                                //     src={LEADERBOARDS[key].img}
                                                                //     alt={key}
                                                                // />
                                                                LEADERBOARDS[key].img instanceof Array ? (
                                                                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                        {LEADERBOARDS[key].img.map((img, index) => (
                                                                            <Box
                                                                                key={`leaderboard-tab-img-${key}-${index}`}
                                                                                component="img"
                                                                                src={img}
                                                                                alt={`${key}-${index}`}
                                                                            />
                                                                        ))}
                                                                    </Box>
                                                                ) : (
                                                                    <Box
                                                                        component="img"
                                                                        src={LEADERBOARDS[key].img}
                                                                        alt={key}
                                                                    />
                                                                )
                                                            ) : LEADERBOARDS[key].title
                                                        }
                                                    </Box>
                                                </Button>
                                            </BetterTooltip>
                                        );
                                    })}
                                </ButtonGroup>
                            );
                        })
                    }
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{
                        minWidth: '50vw',
                        mt: 2,
                        //minWidth 100% on small screens
                        '@media (max-width: 600px)': {
                            minWidth: '100vw',
                        },
                    }}>

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
                                        <ItemList
                                            startIndex={(page - 1) * LIMIT}
                                            showIndex={true}
                                            items={leaderboardResults.entries.map(entry => entry.user)}
                                            isCompact={false}
                                            truncate={false}
                                            leaderboardField={'osuAlternative.lb_value'}
                                            leaderboardFormat={(value) => {
                                                return `${LEADERBOARDS[statistic].formatter ? LEADERBOARDS[statistic].formatter(Number(value)) : Number(value)}${LEADERBOARDS[statistic].suffix || ''}`;
                                            }}
                                            ItemListRowType={PlayerListRow}
                                        />
                                        <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                                            <Pagination
                                                count={leaderboardResults.total_pages}
                                                page={parseInt(page)}
                                                onChange={(event, value) => setPage(value)}
                                                color="primary"
                                                disabled={isWorking}
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            ) : null
                        }
                    </Box>
                </Box>
            </div>
        </Box>
    );
}

export default RouteLeaderboards;