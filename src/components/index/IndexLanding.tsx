import { Alert, Avatar, Box, Card, CardContent, CardHeader, CircularProgress, Divider, Grid, Link, Paper, Stack, Typography, useTheme } from "@mui/material";
import { TextureDatabase } from "../../assets/textures/TextureDatabase";
import { FormatNumber, GetRulesetColor } from "../../util/Helper";
import { useEffect, useState } from "react";
import { useApi } from "../../providers/ApiProvider";
import ListIcon from '@mui/icons-material/List';
import GamesIcon from '@mui/icons-material/Games';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { blue, green, pink, purple, red } from "@mui/material/colors";
import { Line } from "react-chartjs-2";
import Config from "../../data/Config.json";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LandingCard from "../LandingCard";
import { useAuth } from "../../providers/AuthProvider";
// import { Link } from "react-router";
import { Link as RouterLink } from "react-router";

function IndexLanding() {
    const theme = useTheme();
    const { getGlobalStats, getActiveUsers } = useApi();
    const { userData } = useAuth();
    const [numReputation, setNumReputation] = useState(0);
    const [numBeatmaps, setNumBeatmaps] = useState(0);
    const [numScores, setNumScores] = useState(0);
    const [numUsers, setNumUsers] = useState(0);

    const [dataActiveUsers, setDataActiveUsers] = useState<{ hour: Date, count: number }[] | null>(null); //amount of users active in last 24h, each entry is an hour timestamp with the amount of active users in that hour
    const [dataActiveUsersChart, setDataActiveUsersChart] = useState<any | null>(null); //data formatted for chartjs, with labels and datasets

    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const stats = await getGlobalStats();
                const statsActiveUsers = await getActiveUsers();

                if (stats) {
                    setNumReputation(stats.reputation_counts.data.total);
                    setNumUsers(stats.user_counts.data.total);

                    //calculate total beatmaps and scores
                    let totalBeatmaps = stats.beatmap_counts.data.total;
                    // Object.keys(stats.beatmap_counts.data).forEach(key => {
                    //     totalBeatmaps += stats.beatmap_counts.data[key];
                    // });
                    setNumBeatmaps(totalBeatmaps);
                    setNumScores(stats.score_counts.data.scores.total || 0);
                }

                if (statsActiveUsers) {
                    //replace string dates to actual dates
                    const activeUsersData: { hour: Date, count: number }[] = [];
                    statsActiveUsers.data.forEach((key: { hour: string, count: number }) => {
                        activeUsersData.push({
                            ...key,
                            hour: new Date(key.hour), //convert hour string to date
                        })
                    });
                    activeUsersData.sort((a, b) => a.hour.getTime() - b.hour.getTime()); //sort by hour ascending
                    setDataActiveUsers(activeUsersData);
                    console.log(activeUsersData);

                    //format for chartjs
                    const chartData = {
                        datasets: [{
                            label: 'Active Users',
                            data: activeUsersData.map(entry => ({ x: entry.hour, y: entry.count })),
                            borderColor: theme.palette.primary.main, //primary color with some transparency
                            pointRadius: 0,
                        }]
                    };
                    setDataActiveUsersChart(chartData);
                }
            } catch (e) {
                console.error("Failed to fetch global stats:", e);
                setIsError(true);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Alert severity="info" sx={{ marginBottom: 1 }}>
                            This is osu! scores inspector v3! Make sure to join the <Link href={Config.DISCORD_URL} target="_blank" rel="noopener noreferrer">osu!alternative Discord</Link>!
                        </Alert>
                        <Grid container spacing={2} sx={{
                            flexGrow: 1,
                        }}>
                            <Grid size={{ xs: 12, md: 12 }}>
                                <Grid container spacing={1} sx={{ height: '100%' }}>
                                    <Grid size={{ xs: 6, md: 12 / (userData?.osuApi?.team ? 5 : 4) }}>
                                        <LandingCard
                                            title="Reputation"
                                            isLoading={loading}
                                            isError={isError}
                                            icon={<ThumbUpIcon />}
                                            color={pink[500]}
                                            centerContent
                                            sx={{ height: '100%' }}
                                        >
                                            <Typography variant="h6" component="div">{FormatNumber(numReputation)}</Typography>
                                        </LandingCard>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 12 / (userData?.osuApi?.team ? 5 : 4) }}>
                                        <LandingCard
                                            title="Beatmaps"
                                            isLoading={loading}
                                            isError={isError}
                                            icon={<ListIcon />}
                                            color={red[500]}
                                            centerContent
                                            sx={{ height: '100%' }}
                                        >
                                            <Typography variant="h6" component="div">{FormatNumber(numBeatmaps)}</Typography>
                                        </LandingCard>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 12 / (userData?.osuApi?.team ? 5 : 4) }}>
                                        <LandingCard
                                            title="Scores"
                                            isLoading={loading}
                                            isError={isError}
                                            icon={<GamesIcon />}
                                            color={blue[500]}
                                            centerContent
                                            sx={{ height: '100%' }}
                                        >
                                            <Typography variant="h6" component="div">{FormatNumber(numScores)}</Typography>
                                        </LandingCard>
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 12 / (userData?.osuApi?.team ? 5 : 4) }}>
                                        <LandingCard
                                            title="Users"
                                            isLoading={loading}
                                            isError={isError}
                                            icon={<PersonIcon />}
                                            color={green[500]}
                                            centerContent
                                            sx={{ height: '100%' }}
                                        >
                                            <Typography variant="h6" component="div">{FormatNumber(numUsers)}</Typography>
                                        </LandingCard>
                                    </Grid>
                                    {
                                        userData?.osuApi?.team && (
                                            <Grid size={{ xs: 6, md: 12 / 5 }}>
                                                <Box sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    position: 'relative',
                                                }}>
                                                    <Box sx={{
                                                        backgroundImage: `url(${userData?.osuApi?.team?.flag_url})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        borderRadius: 1,
                                                        width: '100%',
                                                        height: '100%',
                                                        position: 'absolute',
                                                    }}></Box>
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                                        borderRadius: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexDirection: 'column',
                                                    }}>
                                                        {/* something along the lines "visit your team" */}
                                                        <Typography variant="h6" component="div" sx={{ color: 'white', textAlign: 'center', width: '100%' }}>
                                                            Team {userData.osuApi.team.short_name}
                                                        </Typography>
                                                        <Typography variant="body2" component="div" sx={{ color: 'white', textAlign: 'center', width: '100%' }}>
                                                            Visit your team page!
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        //links to /team/{id}
                                                        component={RouterLink}
                                                        to={`/team/${userData.osuApi.team.id}`}                                                        
                                                        sx={{
                                                            borderRadius: 1,
                                                            width: '100%',
                                                            height: '100%',
                                                            position: 'absolute',
                                                            backgroundColor: 'rgba(255, 255, 255, 0)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.3s',
                                                            },
                                                            transition: 'background-color 0.3s',
                                                        }}></Box>
                                                </Box>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <LandingCard
                        title="Active Users (24h)"
                        isLoading={loading}
                        isError={isError}
                        icon={<ShowChartIcon />}
                        color={theme.palette.primary.dark}
                        sx={{
                            height: '100%',
                        }}
                        centerContent
                    >
                        {dataActiveUsersChart ? (
                            //basically hide everything except the line. No labels, no axes, nothing. Just the line and a bit of padding
                            <Box sx={{
                                height: '100px',
                                width: '100%',
                                px: 1
                            }}><Line
                                    data={dataActiveUsersChart}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            x: {
                                                type: 'time',
                                                time: {
                                                    unit: 'hour',
                                                    displayFormats: {
                                                        hour: 'HH:mm',
                                                    },
                                                },
                                                grid: {
                                                    display: false,
                                                },
                                                ticks: {
                                                    display: false,
                                                },
                                                border: {
                                                    display: false,
                                                }
                                            },
                                            y: {
                                                grid: {
                                                    display: false,
                                                },
                                                ticks: {
                                                    display: false,
                                                },
                                                border: {
                                                    display: false,
                                                }
                                            },
                                        },
                                    }}
                                /></Box>
                        ) : (
                            <Typography variant="body2">No data available.</Typography>
                        )}
                    </LandingCard>
                </Grid>
            </Grid>
        </Box>
    );
}

export default IndexLanding;