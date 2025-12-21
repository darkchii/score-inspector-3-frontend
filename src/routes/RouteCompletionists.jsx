import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import { FormatNumber, GetRulesetColor, GetRulesetNameFromId, GetRulesetPrettyNameFromId, ShowNotification } from "../util/Helper";
import { Alert, Grid, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-moment';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from 'chart.js';
import PlayerLink from "../components/PlayerLink";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

function RouteCompletionists() {
    const { getCompletionists } = useApi();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const completionistsData = await getCompletionists();
                //group by mode completionistsData[x].mode

                const groupedData = completionistsData.reduce((acc, curr) => {
                    if (!acc[curr.mode]) {
                        acc[curr.mode] = [];
                    }
                    acc[curr.mode].push(curr);
                    return acc;
                }, {});

                //order each mode by completion_date
                for (const mode in groupedData) {
                    groupedData[mode].sort((a, b) => new Date(a.completion_date) - new Date(b.completion_date));
                }

                //pregenerate image elements for avatars to speed up chart rendering
                for (const mode in groupedData) {
                    groupedData[mode].forEach(item => {
                        if (item.user && item.user.avatar_url) {
                            // image object, with size 28x28, circular
                            const img = new Image(28, 28);
                            img.src = item.user.avatar_url;
                            img.style.backgroundColor = GetRulesetColor(GetRulesetNameFromId(mode))[100];
                            item.user.avatar_image = img;
                        }
                    });
                }

                setData(groupedData);
            } catch (e) {
                ShowNotification("Failed to load completionists data.", "error");
                setError(e);
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div style={{ padding: 16 }}>
            {
                loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <Alert severity="error">Error loading completionists data.</Alert>
                ) : (
                    <div>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={3} sx={{ padding: 1 }}>
                                    <div style={{ height: 300 }}>
                                        {/* line chart per mode, y = .scores, x = .completion_date */}
                                        <Line
                                            data={{
                                                datasets: [
                                                    ...Object.keys(data).map(mode => ({
                                                        label: GetRulesetPrettyNameFromId(mode),
                                                        data: data[mode].map(item => ({
                                                            x: new Date(item.completion_date).getTime(),
                                                            y: item.scores,
                                                            data: item
                                                        })),
                                                        borderColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                                        backgroundColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                                        pointStyle: (ctx) => {
                                                            return ctx.raw.data.user?.avatar_image || 'circle';
                                                        },
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                    })),
                                                    //add invisible dataset to start the dates earlier and end later (both by 5% of the total range)
                                                    {
                                                        label: 'Invisible',
                                                        data: [
                                                            {
                                                                x: new Date(new Date(data[Object.keys(data)[0]][0].completion_date).getTime() - (new Date().getTime() - new Date(data[Object.keys(data)[0]][0].completion_date).getTime()) * 0.05),
                                                                y: 0
                                                            },
                                                            {
                                                                x: new Date(new Date().getTime() + (new Date().getTime() - new Date(data[Object.keys(data)[0]][0].completion_date).getTime()) * 0.05),
                                                                //+5% of max scores value
                                                                y: Math.max(...Object.values(data).flat().map(item => item.scores)) * 1.05
                                                            }
                                                        ],
                                                        borderColor: 'rgba(0,0,0,0)',
                                                        backgroundColor: 'rgba(0,0,0,0)',
                                                        pointRadius: 0,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    x: {
                                                        type: 'time',
                                                        time: {
                                                            unit: 'day',
                                                        },
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Scores',
                                                        },
                                                        ticks: {
                                                            callback: function (value) {
                                                                return `${FormatNumber(value)}`;
                                                            }
                                                        }
                                                    }
                                                },
                                                plugins: {
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                //show user
                                                                const item = context.raw.data;
                                                                return `${item.user?.username || `${item.osu_id} (restricted?)`} | Scores: ${FormatNumber(item.scores)} | Completion Date: ${new Date(item.completion_date).toLocaleDateString()}`;
                                                            }
                                                        }
                                                    },
                                                    legend: {
                                                        //hide invisible dataset
                                                        labels: {
                                                            filter: function (legendItem, chartData) {
                                                                return legendItem.text !== 'Invisible';
                                                            }

                                                        }
                                                    }
                                                },
                                                layout: {
                                                    padding: 10
                                                },
                                            }
                                            }
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper elevation={3} sx={{ padding: 1 }}>
                                    <div style={{ height: 300 }}>
                                        {/* line chart per mode, y = .scores, x = .completion_date */}
                                        <Line
                                            data={{
                                                datasets: Object.keys(data).map(mode => ({
                                                    label: GetRulesetPrettyNameFromId(mode),
                                                    data: data[mode].map(item => ({
                                                        x: new Date(item.completion_date).getTime(),
                                                        //count of completionists up to current item
                                                        y: data[mode].filter(i => new Date(i.completion_date) <= new Date(item.completion_date)).length
                                                    })),
                                                    borderColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                                    backgroundColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                                }))
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    x: {
                                                        type: 'time',
                                                        time: {
                                                            unit: 'day',
                                                        },
                                                    },
                                                    y: {
                                                        title: {
                                                            display: true,
                                                            text: 'Completionists',
                                                        },
                                                        ticks: {
                                                            callback: function (value) {
                                                                return `${FormatNumber(value)}`;
                                                            }
                                                        }
                                                    }
                                                },
                                                layout: {
                                                    padding: {
                                                        top: 20,
                                                        right: 20,
                                                        bottom: 20,
                                                        left: 20,
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                </Paper>
                            </Grid>
                            {
                                //list each mode with all users
                                Object.keys(data).map(mode => (
                                    <Grid item key={mode} size={{ xs: 12, md: 3 }}>
                                        <Paper elevation={3} sx={{ padding: 1 }}>
                                            <Typography variant="h6">{GetRulesetPrettyNameFromId(mode)}</Typography>
                                            <Typography variant="body2" color="textSecondary"> Completionists: {data[mode].length} </Typography>
                                            <TableContainer sx={{
                                                mt: 2,
                                            }}>
                                                <Table
                                                    size="small"
                                                    sx={{
                                                        [`& .${tableCellClasses.root}`]: {
                                                            borderBottom: "none"
                                                        }
                                                    }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>User</TableCell>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell>Scores</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            data[mode].map(item => (
                                                                <TableRow key={item.osu_id}>
                                                                    <TableCell>
                                                                        {
                                                                            !item.user?.username ? <>{item.osu_id} (restricted?)</> :
                                                                                <PlayerLink data={item} />
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>{new Date(item.completion_date).toLocaleDateString()}</TableCell>
                                                                    <TableCell>{FormatNumber(item.scores)}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        }
                                                    </TableBody>
                                                </Table>

                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                ))
                            }
                        </Grid>
                        {/* show a linear horizontal bar chart of completionists, basically a timeline with correct spacing, modes combined */}
                    </div>
                )
            }
        </div>
    )

    // if(loading){
    //     return <div>Loading...</div>;
    // }

    // if(error){
    //     return <Alert severity="error">Error loading completionists data.</Alert>;
    // }

    // return <div>Completionists Route</div>;
}

export default RouteCompletionists;