import { useEffect, useState } from "react";
import { useApi } from "../../providers/ApiProvider";
import { Paper, Typography, Collapse, Alert, Box, Fade, ButtonGroup, Button, Grid, TableContainer, Table, TableBody, TableRow, TableCell, tableCellClasses, tableRowClasses, useTheme, CircularProgress } from "@mui/material";
import RulesetSelector from "../RulesetSelector";
import { GetRulesetId } from "../../util/Helper";
import PlayerLink from "../PlayerLink";

function IndexTopPlayers({ activeRuleset, setActiveRuleset }) {
    const theme = useTheme();
    const { getTodayTopPlayers } = useApi();
    const [isWorking, setIsWorking] = useState(false);
    const [rawData, setRawData] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [selectedPeriod, setSelectedPeriod] = useState("today");

    const [selectedDataSet, setSelectedDataSet] = useState(null);

    const [isTransitioningDataSet, setIsTransitioningDataSet] = useState(false);

    const applyDataSet = async () => {
        setIsTransitioningDataSet(true);
        setTimeout(() => {
            if (rawData && rawData.data) {
                setSelectedDataSet(rawData.data[selectedPeriod] || null);
            }
            setIsTransitioningDataSet(false);
        }, 300);
    }

    const updateData = async () => {
        setIsWorking(true);
        setError(null);
        setRawData(null);
        try {
            const data = await getTodayTopPlayers(activeRuleset);
            setRawData(data);
            if (data && data.last_updated) {
                setLastUpdated(new Date(data.last_updated));
            }
        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setIsWorking(false);
        }
    }

    useEffect(() => {
        updateData();
    }, [activeRuleset]);

    useEffect(() => {
        if (rawData && rawData.data) {
            applyDataSet();
        }
    }, [selectedPeriod, rawData]);

    return (
        <Paper elevation={3} sx={{ padding: 1, width: '100%' }}>
            {/* inbetween spacing */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', }} >
                <Typography variant="h6" gutterBottom>
                    {/* use selectedPeriod, but remove underscores and capitalize all first letters */}
                    Top players {selectedPeriod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Typography>
                <Fade in={!isWorking} unmountOnExit>
                    <Box>
                        <RulesetSelector
                            activeRuleset={activeRuleset}
                            onChange={setActiveRuleset}
                            disabled={isWorking || isTransitioningDataSet}
                        />
                    </Box>
                </Fade>
            </Box>
            <Collapse in={isWorking} sx={{ display: 'inline-block', marginLeft: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, width: '100%' }}>
                    <CircularProgress size={48} />
                </Box>
            </Collapse>
            <Collapse in={!isWorking}>
                {error && <Alert severity="error" sx={{ mb: 1 }}>Error loading: {error.message}</Alert>}
                {!rawData || Object.keys(rawData).length === 0 ? (
                    <Typography variant="body2">No data available.</Typography>
                ) : (
                    <Box>
                        <Fade in={!isTransitioningDataSet}>
                            {
                                (selectedDataSet && Object.keys(selectedDataSet).length > 0) ? (
                                    //loop through selectedDataSet (selectedDataSet.clears, selectedDataSet.ss_clears etc)
                                    <Grid container>
                                        {
                                            Object.keys(selectedDataSet).map((key) => (
                                                <Grid size={{
                                                    xs: 12,
                                                    md: 6,
                                                    lg: 12 / Object.keys(selectedDataSet).length,
                                                }} item key={`topplayers_grid_${key}`} sx={{ padding: 0.5 }}>
                                                    <Paper key={`topplayers_${key}`} elevation={1} sx={{ padding: 0.5, marginBottom: 2 }}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            {key.replace(/_/g, ' ').toUpperCase()}
                                                        </Typography>
                                                        {
                                                            selectedDataSet[key].length === 0 ? (
                                                                <Typography variant="body2">No data for this category.</Typography>
                                                            ) :
                                                                <TableContainer>
                                                                    <Table size="small" sx={{
                                                                        [`& .${tableCellClasses.root}`]: {
                                                                            borderBottom: "none",
                                                                            color: 'white !important',
                                                                            padding: '2px'
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
                                                        }
                                                    </Paper>
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                ) : (
                                    <Typography variant="body2">No data for selected ruleset.</Typography>
                                )
                            }
                        </Fade>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }} >
                            <Typography variant="body2">Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "N/A"} <span style={{ color: 'gray', fontSize: '0.8em' }}>(Grey numbers are the total amounts, including overridden scores)</span></Typography>
                            <ButtonGroup sx={{ mt: 1, mb: 1 }} size='small'>
                                <Button
                                    variant={selectedPeriod === "last_year" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("last_year")}
                                    disabled={isWorking || isTransitioningDataSet}
                                >
                                    Last Year
                                </Button>
                                <Button
                                    variant={selectedPeriod === "year" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("year")}
                                    disabled={isWorking || isTransitioningDataSet}
                                >
                                    This Year
                                </Button>
                                <Button
                                    variant={selectedPeriod === "yesterday" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("yesterday")}
                                    disabled={isWorking || isTransitioningDataSet}
                                >
                                    Yesterday
                                </Button>
                                <Button
                                    variant={selectedPeriod === "today" ? "contained" : "outlined"}
                                    onClick={() => setSelectedPeriod("today")}
                                    disabled={isWorking || isTransitioningDataSet}
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