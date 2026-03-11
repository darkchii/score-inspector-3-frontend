import { Alert, Autocomplete, Box, Button, ButtonGroup, Collapse, Pagination, TextField, Typography } from "@mui/material";
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
import { countries, currencies, languages, timezones, lookup } from 'country-data-list';
import BeatmapListRow from "../components/list/BeatmapListRow";
import Beatmap from "../types/beatmaps/Beatmap";
import { grey } from "@mui/material/colors";

const LIMIT: number = 50;
const LEADERBOARDS = {
    'pp': {
        title: 'Performance',
        suffix: 'pp',
        category: 'user',
        formatter: FormatNumber,
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
    },
    'beatmap_length': {
        title: 'Length',
        category: 'beatmap',
        //show as mm:ss
        formatter: (value) => {
            const minutes = Math.floor(value / 60);
            const seconds = value % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    },
    'beatmap_play_count': {
        title: 'Play Count',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_pass_count': {
        title: 'Pass Count',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_favourite_count': {
        title: 'Favourites',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_rating': {
        title: 'Rating',
        category: 'beatmap',
        formatter: (value) => {
            return `${FormatNumber(value)}/10`;
        }
    },
    'beatmap_rank_date': {
        title: 'Ranked Date',
        category: 'beatmap',
        formatter: (value) => {
            console.log(value);
            const date = new Date(value);
            return date.toLocaleString();
        },
    },
    'beatmap_rank_duration': {
        title: 'Time To Rank',
        category: 'beatmap',
        formatter: (value) => {
            if (!value || value <= 0) {
                return '0 days';
            }
            //value is given in seconds, show in xY xM xD format
            const years = Math.floor(value / (3600 * 24 * 365));
            const months = Math.floor((value % (3600 * 24 * 365)) / (3600 * 24 * 30));
            const days = Math.floor((value % (3600 * 24 * 30)) / (3600 * 24));
            return `${years > 0 ? years + ' years ' : ''}${months > 0 ? months + ' months ' : ''}${days > 0 ? days + ' days' : ''}`;
        }
    },
    'beatmap_circles': {
        title: 'Circles',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_sliders': {
        title: 'Sliders',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_spinners': {
        title: 'Spinners',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_objects': {
        title: 'Objects',
        category: 'beatmap',
        formatter: FormatNumber,
    },
    'beatmap_difficulty': {
        title: 'Difficulty',
        category: 'beatmap',
        hide_value: true, //sr is default part of the beatmap row, so no need to show lb_value
    },
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
    const [page, setPage] = useState(parseInt(params.page) || 1);
    const [country, setCountry] = useState(params.country || null);
    const [leaderboardResults, setLeaderboardResults] = useState(null);

    const [error, setError] = useState(null);
    const [isWorking, setIsWorking] = useState(false);

    const requestLeaderboard = async () => {
        window.history.replaceState(null, null, `/leaderboards/${ruleset}/${statistic || 'pp'}/page/${page || 1}${country ? `/country/${country}` : ''}`);
        setIsWorking(true);
        try {
            const data = await getLeaderboard(ruleset, statistic, page, "desc", LIMIT, country);

            //data.entries[i].value should be moved to data.entries[i].user.osuAlternative.lb_value
            if (data && data.entries) {
                if (LEADERBOARDS[statistic].category === 'beatmap') {
                    data.entries = data.entries.map(entry => {
                        // entry.beatmap = entry.beatmap || {};
                        const _beatmap = new Beatmap(entry.beatmap);
                        entry.beatmap = _beatmap;
                        entry.beatmap.lb_value = entry.value;
                        entry.beatmap.lb_value_diff = entry.difference_value;
                        return entry;
                    });
                } else {
                    data.entries = data.entries.map(entry => {
                        entry.user.osuAlternative = entry.user.osuAlternative || {};
                        entry.user.osuAlternative.lb_value = entry.value;
                        entry.user.osuAlternative.lb_value_diff = entry.difference_value;
                        return entry;
                    });
                }
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
    }

    const applyStatistic = (statistic) => {
        setStatistic(statistic);
        setPage(1);
    }

    const applyCountry = (country) => {
        setCountry(country);
        setPage(1);
    }

    useEffect(() => {
        setStatistic(params.statistic || Object.keys(LEADERBOARDS)[0]);
        setPage(parseInt(params.page) || 1);
        setRuleset(params.ruleset || 'osu');
        setCountry(params.country || null);
    }, [params.statistic, params.page, params.ruleset, params.country]);

    usePageTitle(`Leaderboards - ${LEADERBOARDS[statistic] ? LEADERBOARDS[statistic].title : ''}`);

    useEffect(() => {
        (async () => {
            await requestLeaderboard();
        })()
    }, [ruleset, statistic, page, country]);

    if (!statistic) {
        return <Navigate to={`/leaderboards/osu/${Object.keys(LEADERBOARDS)[0]}`} replace />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <div>
                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                    <RulesetSelector activeRuleset={ruleset} onChange={setRuleset} disabled={isWorking} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 2, justifyContent: 'center', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* separate Tabs for each category */}
                    {
                        LEADERBOARDS_CATEGORIES.map((category) => {
                            return (
                                // <Tabs key={`leaderboards-category-tabs-${category}`} aria-label={`leaderboards-tabs-${category}`} value={statistic} textColor="primary" indicatorColor="primary">
                                <>
                                    <ButtonGroup
                                        size='small'
                                        key={`leaderboards-category-tabs-${category}`}
                                        variant="text"
                                        aria-label={`leaderboards-tabs-${category}`}
                                        //wrap
                                        sx={{ flexWrap: 'wrap' }}
                                    >
                                        <Button
                                            variant="outlined"
                                            key={`leaderboard-tab-category-${category}`}
                                            disabled={true}
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </Button>
                                        {Object.keys(LEADERBOARDS).filter((key) => LEADERBOARDS[key].category === category).map((key) => {
                                            return (
                                                <BetterTooltip key={`leaderboard-tab-tooltip-${key}`} title={LEADERBOARDS[key].description || ''} placement="top">
                                                    <Button
                                                        variant={statistic === key ? "contained" : "text"}
                                                        key={`leaderboard-tab-${key}`}
                                                        value={key}
                                                        onClick={() => applyStatistic(key)}
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
                                </>
                            );
                        })
                    }
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Autocomplete
                        disablePortal
                        id="country-select"
                        options={countries.all.map(c => ({ code: c.alpha2, label: c.name, emoji: c.emoji }))}
                        sx={{ width: 300 }}
                        value={country ? { code: country, label: lookup.countries({ alpha2: country })[0].name, emoji: lookup.countries({ alpha2: country })[0].emoji } : null}
                        onChange={(event, newValue) => {
                            applyCountry(newValue ? newValue.code : null);
                        }}
                        getOptionLabel={(option) => {
                            return `${option.emoji || ''} ${option.label}`;
                        }}
                        //selected value should show flag and country name
                        renderInput={(params) => <TextField {...params} label="Filter by country" />}
                        disabled={isWorking || (LEADERBOARDS[statistic].category !== 'user' && LEADERBOARDS[statistic].category !== 'grades')}
                        size='small'
                    />
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
                                                page={page}
                                                onChange={(event, value) => setPage(value)}
                                                color="primary"
                                                disabled={isWorking}
                                            />
                                        </Box>
                                        {
                                            //if beatmap leaderboard, show beatmap info, otherwise show player info
                                            LEADERBOARDS[statistic].category === 'beatmap' ? (
                                                <ItemList
                                                    startIndex={(page - 1) * LIMIT}
                                                    showIndex={true}
                                                    items={leaderboardResults.entries.map(entry => entry.beatmap)}
                                                    isCompact={false}
                                                    truncate={false}
                                                    leaderboardField={!LEADERBOARDS[statistic].hide_value ? 'lb_value' : null}
                                                    secondaryLeaderboardField={!LEADERBOARDS[statistic].hide_value ? 'lb_value_diff' : null}
                                                    leaderboardFormat={(value) => {
                                                        return `${LEADERBOARDS[statistic].formatter ? LEADERBOARDS[statistic].formatter(value) : Number(value)}${LEADERBOARDS[statistic].suffix || ''}`;
                                                    }}
                                                    ItemListRowType={BeatmapListRow}
                                                    secondaryFieldColor={grey[500]}
                                                />
                                            ) : (
                                                <ItemList
                                                    startIndex={(page - 1) * LIMIT}
                                                    showIndex={true}
                                                    items={leaderboardResults.entries.map(entry => entry.user)}
                                                    isCompact={false}
                                                    truncate={false}
                                                    leaderboardField={!LEADERBOARDS[statistic].hide_value ? 'osuAlternative.lb_value' : null}
                                                    secondaryLeaderboardField={!LEADERBOARDS[statistic].hide_value ? 'osuAlternative.lb_value_diff' : null}
                                                    leaderboardFormat={(value) => {
                                                        return `${LEADERBOARDS[statistic].formatter ? LEADERBOARDS[statistic].formatter(value) : Number(value)}${LEADERBOARDS[statistic].suffix || ''}`;
                                                    }}
                                                    ItemListRowType={PlayerListRow}
                                                    secondaryFieldColor={grey[500]}
                                                />
                                            )
                                        }
                                        <Box sx={{ display: 'flex', gap: 2, mb: 0, mt: 1, justifyContent: 'center' }}>
                                            <Pagination
                                                count={leaderboardResults.total_pages}
                                                page={page}
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