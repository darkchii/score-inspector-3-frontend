import { useEffect, useState } from "react";
import { useApi } from "../../providers/ApiProvider";
import { Paper, Typography, Collapse, Alert, Box, Fade, ButtonGroup, Button, Grid, TableContainer, Table, TableBody, TableRow, TableCell, tableCellClasses, tableRowClasses, useTheme } from "@mui/material";
import RulesetSelector from "../RulesetSelector";
import { GetRulesetId } from "../../util/Helper";
import PlayerLink from "../PlayerLink";

function IndexTopPlayers() {
    const theme = useTheme();
    const { getTodayTopPlayers } = useApi();
    const [isWorking, setIsWorking] = useState(false);
    const [rawData, setRawData] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [selectedRuleset, setSelectedRuleset] = useState("osu");
    const [selectedPeriod, setSelectedPeriod] = useState("today");

    const [selectedDataSet, setSelectedDataSet] = useState(null);

    const updateDataSet = () => {
        if (rawData && rawData.data) {
            setSelectedDataSet(rawData.data[selectedPeriod][`${GetRulesetId(selectedRuleset)}`] || null);
        }
    }

    useEffect(() => {
        (async () => {
            setIsWorking(true);
            setError(null);
            setRawData(null);
            setLastUpdated(null);
            setSelectedDataSet(null);
            setSelectedRuleset("osu");
            setSelectedPeriod("today");
            try {
                const data = await getTodayTopPlayers();
                setRawData(data);

                console.log("Top players data:", data);

                //process data
                if (data && data.last_updated) {
                    setLastUpdated(new Date(data.last_updated));
                }
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setIsWorking(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (rawData && rawData.data) {
            updateDataSet();
        }
    }, [selectedRuleset, selectedPeriod, rawData]);

    return (
        <Paper elevation={3} sx={{ padding: 1, width: '100%' }}>
            {/* inbetween spacing */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', }} >
                <Typography variant="h6" gutterBottom>
                    Top players {selectedPeriod}
                </Typography>
                <Fade in={!isWorking} unmountOnExit>
                    <Box>
                        <RulesetSelector
                            activeRuleset={selectedRuleset}
                            onChange={setSelectedRuleset}
                            showCombined={false}
                        />
                    </Box>
                </Fade>
            </Box>
            <Collapse in={isWorking} sx={{ display: 'inline-block', marginLeft: 2 }}>
                <Typography variant="caption">Loading...</Typography>
            </Collapse>
            <Collapse in={!isWorking}>
                {error && <Alert severity="error">Error loading: {error.message}</Alert>}
                {!rawData || Object.keys(rawData).length === 0 ? (
                    <Typography variant="body2">No data available.</Typography>
                ) : (
                    <Box mt={2}>
                        {
                            (selectedDataSet && Object.keys(selectedDataSet).length > 0) ? (
                                //loop through selectedDataSet (selectedDataSet.clears, selectedDataSet.ss_clears etc)
                                <Grid container>
                                    {
                                        Object.keys(selectedDataSet).map((key) => (
                                            <Grid size={{ xs: 12 / Object.keys(selectedDataSet).length }} item key={`topplayers_grid_${key}`} sx={{ padding: 1 }}>
                                                <Paper key={`topplayers_${key}`} elevation={1} sx={{ padding: 1, marginBottom: 2 }}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        {key.replace(/_/g, ' ').toUpperCase()}
                                                    </Typography>
                                                    <TableContainer>
                                                        <Table size="small" sx={{
                                                            [`& .${tableCellClasses.root}`]: {
                                                                borderBottom: "none",
                                                                color: 'white !important',
                                                            },
                                                            [`& .${tableRowClasses.root}`]: {
                                                                borderBottom: "none",
                                                            },
                                                        }}>
                                                            <TableBody>
                                                                {
                                                                    selectedDataSet[key].map((entry, index) => (
                                                                        <TableRow>
                                                                            <TableCell align="right" sx={{ width: '10%' }}><Typography variant="caption">{index + 1}.</Typography></TableCell>
                                                                            <TableCell><PlayerLink data={entry.user} size={18} /></TableCell>
                                                                            <TableCell>
                                                                                {/* {entry.clear.toLocaleString()} */}
                                                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                                    {entry.clear.toLocaleString()}
                                                                                    {
                                                                                        (entry.clear !== entry.total && key !== 'score') && (
                                                                                            <span style={{ color: 'gray' }}> ({entry.total.toLocaleString()})</span>
                                                                                        )
                                                                                    }
                                                                                </Typography>
                                                                            </TableCell>
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
                            ) : (
                                <Typography variant="body2">No data for selected ruleset.</Typography>
                            )
                        }
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', }} >
                            <Typography variant="body2">Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : "N/A"}</Typography>
                            <ButtonGroup sx={{ mt: 1, mb: 1 }}>
                                <Button
                                    variant={selectedPeriod === "yesterday" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("yesterday")}
                                >
                                    Yesterday
                                </Button>
                                <Button
                                    variant={selectedPeriod === "today" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("today")}
                                >
                                    Today
                                </Button>
                            </ButtonGroup>
                        </Box>
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
}

export default IndexTopPlayers;