import { Alert, Box, Button, ButtonGroup, Collapse, Fade, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import RulesetSelector from "../RulesetSelector";
import { useApi } from "../../providers/ApiProvider";
import { Line } from "react-chartjs-2";
import { GetGradeColor } from "../../util/Helper";
import BetterTooltip from "../tooltips/BetterTooltip";

const CHART_TYPES = {
    'hours': [
        { label: '24 Hours', value: 24 },
        { label: '48 Hours', value: 24 * 2 },
        { label: '72 Hours', value: 24 * 3 },
        { label: '1 Week', value: 24 * 7 }, //1
        { label: '2 Weeks', value: 24 * 7 * 2 }, //2
        { label: '1 Month', value: 24 * 30 }, //3
    ],
    'days': [
        { label: '7 Days', value: 7 },
        { label: '14 Days', value: 14 },
        { label: '30 Days', value: 30 },
        { label: '60 Days', value: 60 },
        { label: '90 Days', value: 90 },
        { label: '180 Days', value: 180 },
    ],
    'months': [
        { label: '6 Month', value: 6 },
        { label: '12 Months', value: 12 },
        { label: '24 Months', value: 24 },
        { label: '36 Months', value: 36 },
        { label: '60 Months', value: 60 },
        { label: 'All', value: -1 },
    ],
    'years': [
        { label: '5 Years', value: 5 },
        { label: '10 Years', value: 10 },
        { label: 'All', value: -1 },
    ],
}

const PERIOD_TIME_FORMATS = {
    'hours': 'MMM D, YYYY, hA',
    'days': 'MMM D, YYYY',
    'months': 'MMM YYYY',
    'years': 'YYYY',
}

const STAT_TYPES = [
    { label: 'Scores', value: 'total_scores' },
    { label: 'Grades', value: 'grades', is_array: true }, //is_array means should show as dedicated lines on the chart
    { label: 'Total Score', value: 'total_score_sum' },
]

function IndexScoreSubmissions({ activeRuleset, setActiveRuleset }) {
    const theme = useTheme();
    const { getScoreSubmissions } = useApi();
    const [isWorking, setIsWorking] = useState(false);
    const [rawData, setRawData] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [error, setError] = useState(null);

    const [isTransitioningDataSet, setIsTransitioningDataSet] = useState(false);

    const [selectedDataSet, setSelectedDataSet] = useState(null);

    const [selectedPeriodType, setSelectedPeriodType] = useState('months');
    const [selectedPeriodValue, setSelectedPeriodValue] = useState(-1);
    const [selectedStatType, setSelectedStatType] = useState('total_scores');
    const [isCumulative, setIsCumulative] = useState(false);
    const [cumulativeIncludingOutOfRange, setCumulativeIncludingOutOfRange] = useState(false);

    const updateData = async () => {
        setIsWorking(true);
        setError(null);
        setRawData(null);
        try {
            const data = await getScoreSubmissions(activeRuleset);
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

    const createCumulativeData = (data) => {
        //add up every field except for period. if it's an array, add up every value in the array, if it's an object, add up every value in the object
        //assume data is already ordered ascending, so we just manipulate the existing data
        data.forEach((entry, index) => {
            if (index === 0) {
                return;
            }
            const previousEntry = data[index - 1];
            Object.keys(entry).forEach((key) => {
                if (key === 'period') {
                    return;
                }
                if (typeof entry[key] === 'number') {
                    entry[key] += previousEntry[key] || 0;
                }
                else if (typeof entry[key] === 'object' && entry[key] !== null) {
                    Object.keys(entry[key]).forEach((subKey) => {
                        entry[key][subKey] += (previousEntry[key]?.[subKey] || 0);
                    })
                }
            });
        });
        return data;
    }

    const updateDataSet = () => {
        if (!rawData || !rawData.data) {
            setSelectedDataSet(null);
            return;
        }

        if (!rawData.data[selectedPeriodType]) {
            setSelectedDataSet(null);
            return;
        }

        const data = JSON.parse(JSON.stringify(rawData.data[selectedPeriodType]));
        //convert .period to date objects
        let convertedData = [];
        //data is also an array
        data.forEach((entry) => {
            convertedData.push({
                ...entry,
                period: new Date(entry.period),
            });
        })

        //order by period ascending
        convertedData.sort((a, b) => a.period - b.period);

        if (isCumulative && (cumulativeIncludingOutOfRange)) {
            convertedData = createCumulativeData(convertedData);
        }

        //order by period descending
        convertedData.sort((a, b) => b.period - a.period);

        //if value is not -1, filter to the last X hours/days/months/years
        let _data = convertedData;
        if (selectedPeriodValue !== -1) {
            const now = new Date();
            _data = _data.filter((entry) => {
                const period = entry.period;
                switch (selectedPeriodType) {
                    case 'hours':
                        return (now - period) <= selectedPeriodValue * 60 * 60 * 1000;
                    case 'days':
                        return (now - period) <= selectedPeriodValue * 24 * 60 * 60 * 1000;
                    case 'months':
                        return (now - period) <= selectedPeriodValue * 30 * 24 * 60 * 60 * 1000;
                    case 'years':
                        return (now - period) <= selectedPeriodValue * 365 * 24 * 60 * 60 * 1000;
                    default:
                        return true;
                }
            });
        }

        if (isCumulative && !cumulativeIncludingOutOfRange) {
            //first order by period ascending, then create cumulative data, then order by period descending again
            _data.sort((a, b) => a.period - b.period);
            _data = createCumulativeData(_data);
            _data.sort((a, b) => b.period - a.period);
        }

        //if not array
        let chartData = {};
        if (!STAT_TYPES.find((stat) => stat.value === selectedStatType)?.is_array) {
            chartData = {
                datasets: [{
                    label: STAT_TYPES.find((stat) => stat.value === selectedStatType)?.label || selectedStatType,
                    data: _data.map((entry) => ({ x: entry.period, y: entry[selectedStatType] })),
                    fill: false,
                    borderColor: theme.palette.primary.main,
                    tension: 0.1,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                }],
            }
        } else {
            //if stat is grades
            if (selectedStatType === 'grades') {
                const grades = ['XH', 'X', 'SH', 'S', 'A', 'B', 'C', 'D'];
                chartData = {
                    datasets: grades.map((grade) => ({
                        label: grade,
                        data: _data.map((entry) => ({ x: entry.period, y: entry.grades[grade] || 0 })),
                        fill: false,
                        borderColor: GetGradeColor(grade),
                        tension: 0.1,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                    })),
                }
            }
        }

        setIsTransitioningDataSet(true);
        setSelectedDataSet(chartData);
        setTimeout(() => {
            setIsTransitioningDataSet(false);
        }, 500);
    }

    useEffect(() => {
        updateDataSet();
    }, [rawData, selectedPeriodType, selectedPeriodValue, selectedStatType, isCumulative, cumulativeIncludingOutOfRange]);

    useEffect(() => {
        //default to the first value of the current period type (or -1 if that value exists)
        const defaultValue = CHART_TYPES[selectedPeriodType].find((option) => option.value === -1)?.value || CHART_TYPES[selectedPeriodType][0].value;
        setSelectedPeriodValue(defaultValue);
    }, [selectedPeriodType])

    useEffect(() => {
        updateData();
    }, [activeRuleset])

    return (
        <Paper elevation={3} sx={{ padding: 1, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', }} >
                <Typography variant="h6" gutterBottom>
                    Score Submissions
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
            <Collapse in={isWorking} sx={{ display: 'inline-block', marginLeft: 2 }}>
                <Typography variant="caption">Loading...</Typography>
            </Collapse>
            <Collapse in={!isWorking}>
                {error && <Alert severity="error" sx={{ mb: 1 }}>Error loading: {error.message}</Alert>}
                {!rawData || Object.keys(rawData).length === 0 ? (
                    <Typography variant="body2">No data available.</Typography>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ marginBottom: 1, display: 'flex', flexDirection: 'row' }}>
                            <ButtonGroup size="small" sx={{ marginRight: 2 }} disabled={isTransitioningDataSet}>
                                {CHART_TYPES[selectedPeriodType].map((option) => (
                                    <Button key={`period_value_${option.value}`} variant={option.value === selectedPeriodValue ? 'contained' : 'outlined'} onClick={() => setSelectedPeriodValue(option.value)}>
                                        {option.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                            <ButtonGroup size="small" sx={{ marginRight: 2 }} disabled={isTransitioningDataSet}>
                                {Object.keys(CHART_TYPES).map((type) => (
                                    <Button key={`period_type_${type}`} variant={type === selectedPeriodType ? 'contained' : 'outlined'} onClick={() => setSelectedPeriodType(type)}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Button>
                                ))}
                            </ButtonGroup>
                            <ButtonGroup size="small" sx={{ marginRight: 2 }} disabled={isTransitioningDataSet}>
                                {STAT_TYPES.map((option) => (
                                    <Button key={`stat_type_${option.value}`} variant={option.value === selectedStatType ? 'contained' : 'outlined'} onClick={() => setSelectedStatType(option.value)}>
                                        {option.label}
                                    </Button>
                                ))}
                            </ButtonGroup>
                            <ButtonGroup size="small" disabled={isTransitioningDataSet}>
                                <Button variant={isCumulative ? 'contained' : 'outlined'} onClick={() => setIsCumulative(!isCumulative)}>
                                    Cumulative
                                </Button>
                                {isCumulative && (
                                    <BetterTooltip title="If enabled, the cumulative count will include all data outside the selected time range." placement="top">
                                        <Button variant={cumulativeIncludingOutOfRange ? 'contained' : 'outlined'} onClick={() => setCumulativeIncludingOutOfRange(!cumulativeIncludingOutOfRange)}>
                                            Include Out of Range
                                        </Button>
                                    </BetterTooltip>
                                )}
                            </ButtonGroup>
                        </Box>
                        {
                            selectedDataSet ?
                                <Box sx={{
                                    width: '100%',
                                    height: 300,
                                }}>
                                    <Line
                                        data={selectedDataSet}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: {
                                                    type: 'time',
                                                    time: {
                                                        unit: selectedPeriodType === 'hours' ? 'day' : selectedPeriodType === 'days' ? 'day' : selectedPeriodType === 'months' ? 'month' : 'year',
                                                        tooltipFormat: PERIOD_TIME_FORMATS[selectedPeriodType],
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Period',
                                                    },
                                                },
                                                y: {
                                                    title: {
                                                        display: true,
                                                        text: STAT_TYPES.find((stat) => stat.value === selectedStatType)?.label || selectedStatType,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </Box> :
                                <Typography variant="body2">No data available for the selected options.</Typography>
                        }
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }} >
                            <Typography variant="body2">Last updated: {lastUpdated ? lastUpdated.toLocaleString() : "N/A"}</Typography>
                        </Box>
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
}

export default IndexScoreSubmissions;