import React, { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import { FormatNumber, GetRulesetPrettyNameFromId, ShowNotification } from "../util/Helper";
import { Alert, Box, CircularProgress, Divider, Grid, Paper, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import PlayerLink from "../components/PlayerLink";
import { getCompletionistBadge } from "../assets/textures/TextureDatabase";
import { usePageTitle } from "../providers/TitleProvider";
import CompletionistsCountryMap from "../components/completionists/CompletionistsCountryMap";
import CompletionistsScoresChart from "../components/completionists/CompletionistsScoresChart";
import CompletionistsCountChart from "../components/completionists/CompletionistsCountChart";

function RouteCompletionists() {
    usePageTitle("Completionists");
    const { getCompletionists } = useApi();
    const [data, setData] = useState<{ [key: string]: any[] } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const completionistsData = await getCompletionists();
                //group by mode completionistsData[x].mode

                const groupedData = completionistsData.reduce((acc: { [key: string]: any[] }, curr: any) => {
                    if (!acc[curr.mode]) {
                        acc[curr.mode] = [];
                    }
                    acc[curr.mode].push(curr);
                    return acc;
                }, {});

                for (const mode in groupedData) {
                    groupedData[mode].sort((a: any, b: any) => new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime());
                }

                //count days between each completionist and the previous one, add that as a field to each item
                for (const mode in groupedData) {
                    groupedData[mode] = groupedData[mode].map((item: any, index: number, arr: any[]) => {
                        if (index === 0) {
                            return { ...item, days_since_last: null };
                        }
                        const prevItem = arr[index - 1];
                        const diffTime = Math.abs(new Date(item.completion_date).getTime() - new Date(prevItem.completion_date).getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return { ...item, days_since_last: diffDays };
                    });
                }

                //order each mode by completion_date
                for (const mode in groupedData) {
                    groupedData[mode].sort((a: any, b: any) => new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime());
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">Error loading completionists data.</Alert>
                ) : (
                    <div>
                        <Grid container spacing={1}>
                            <CompletionistsCountryMap data={data} />
                            {
                                //list each mode with all users
                                data && Object.keys(data).map((mode: string) => (
                                    <Grid key={mode} size={{ xs: 12, md: 3 }}>
                                        <Paper elevation={3} sx={{ padding: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                //space between
                                                justifyContent: 'space-between',
                                            }}>
                                                <div>
                                                    <Typography variant="h6">{GetRulesetPrettyNameFromId(mode)}</Typography>
                                                    <Typography variant="body2" color="textSecondary"> Completionists: {data[mode].length} </Typography>
                                                </div>
                                                <img src={getCompletionistBadge(mode) || ""} alt="Completionist Badge" style={{ marginLeft: 'auto', height: 40 }} />
                                            </div>
                                            <TableContainer sx={{
                                                mt: 2,
                                            }}>
                                                <Table
                                                    size="small"
                                                    sx={{
                                                        [`& .${tableCellClasses.root}`]: {
                                                            borderBottom: "none",
                                                            padding: '4px 4px',
                                                        },
                                                    }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>User</TableCell>
                                                            <TableCell>Scores</TableCell>
                                                            <TableCell>Date</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {
                                                            data[mode].map(item => (
                                                                <React.Fragment key={item.osu_id}>
                                                                    {/* if the year changes, add a little marker for that */}
                                                                    {
                                                                        (() => {
                                                                            let year = null;
                                                                            const index = data[mode].indexOf(item);
                                                                            if (index === 0) {
                                                                                year = new Date(item.completion_date).getFullYear();
                                                                            } else {
                                                                                const prevItem = data[mode][index - 1];
                                                                                const prevYear = new Date(prevItem.completion_date).getFullYear();
                                                                                const currYear = new Date(item.completion_date).getFullYear();
                                                                                year = prevYear !== currYear ? currYear : null;
                                                                            }
                                                                            if (year) {
                                                                                return (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={4}>
                                                                                            <Divider>
                                                                                                <Typography variant="subtitle2" color="textSecondary">
                                                                                                    {year}
                                                                                                </Typography>
                                                                                            </Divider>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                );
                                                                            }
                                                                        })()
                                                                    }
                                                                    <TableRow key={item.user_id}>
                                                                        <TableCell>
                                                                            {
                                                                                !item.user?.osuApi.username ? <>{item.user_id} (restricted?)</> :
                                                                                    <PlayerLink size={18} data={item.user} />
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>{FormatNumber(item.scores)}</TableCell>
                                                                        <TableCell>
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{
                                                                                    fontSize: '0.85rem',
                                                                                }}
                                                                            >
                                                                                {new Date(item.completion_date).toLocaleDateString()}
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="textSecondary"
                                                                                sx={{
                                                                                    //smaller font
                                                                                    fontSize: '0.75rem',
                                                                                }}
                                                                            >
                                                                                {item.days_since_last !== null && item.days_since_last !== 0 ? `+${item.days_since_last}d` : '-'}
                                                                            </Typography>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            ))
                                                        }
                                                    </TableBody>
                                                </Table>

                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                ))
                            }
                            <CompletionistsScoresChart data={data} />
                            <CompletionistsCountChart data={data} />
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