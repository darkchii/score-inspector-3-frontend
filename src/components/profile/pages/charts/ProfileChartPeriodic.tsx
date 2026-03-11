import { Box, Button, ButtonGroup, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useProfile } from "../../../../providers/ProfileProvider";
import { Line } from "react-chartjs-2";
import { FormatNumber, FormatNumberWithPrecision, GetGradeColor } from "../../../../util/Helper";

const INCR_CUMUL_CHART_TYPES: any = {
    'scores': {
        name: 'scores',
        labels: ['Scores', 'Clears'],
        keys: ['scores', 'clears'],
        formatter: (value) => FormatNumber(value),
        invalid_aggregations: ['average', 'highest', 'median'],
        colors: ['#3f51b5', '#ff4081'],
    },
    'score': {
        name: 'score',
        labels: ['Score', 'SS Score'],
        keys: ['implied_score', 'implied_score_ss'],
        formatter: (value) => FormatNumber(value),
        colors: ['#3f51b5', '#ff4081'],
    },
    'lazer_score': {
        name: 'lazer_score',
        labels: ['Lazer Score', 'Lazer SS Score'],
        keys: ['lazer_score', 'lazer_score_ss'],
        formatter: (value) => FormatNumber(value),
        colors: ['#3f51b5', '#ff4081'],
    },
    'grades': {
        name: 'grades',
        labels: ['XH', 'X', 'SH', 'S', 'A', 'B', 'C', 'D'],
        keys: ['grades_xh', 'grades_x', 'grades_sh', 'grades_s', 'grades_a', 'grades_b', 'grades_c', 'grades_d'],
        invalid_aggregations: ['average', 'highest', 'median'],
        formatter: (value) => FormatNumber(value),
        colors: (index) => {
            //get the Label, then use GetGradeColor to get color
            const gradeLabels = ['XH', 'X', 'SH', 'S', 'A', 'B', 'C', 'D'];
            return GetGradeColor(gradeLabels[index]);
        }
    },
    'pp': {
        name: 'pp',
        labels: ['PP'],
        keys: ['pp'],
        formatter: (value) => FormatNumberWithPrecision(value, 2) + 'pp',
    },
    'length': {
        name: 'length',
        labels: ['Length'],
        keys: ['length_seconds'],
        formatter: (value) => {
            //value is in seconds
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = Math.floor(value % 60);
            return `${hours}h ${minutes}m ${seconds}s`;
        }
    }
};

function ProfileChartPeriodic() {
    const theme = useTheme();
    const { getRulesetStatistics, activeRuleset } = useProfile();

    const [activeChartType, setActiveChartType] = useState('scores');
    const [activeInterval, setActiveInterval] = useState('monthly');
    const [activeAggregation, setActiveAggregation] = useState('cumulative');
    const [activeScaleType, setActiveScaleType] = useState<'linear' | 'logarithmic'>('linear');

    const [existingAggregations, setExistingAggregations] = useState(['cumulative', 'incremental']);

    const [data, setData] = useState<any>();

    useEffect(() => {
        const stats = getRulesetStatistics(activeRuleset);
        //get first entry of periodic_graph_data
        if (stats && stats.periodic_graph_data) {
            const intervals = stats.periodic_graph_data;
            const firstInterval = Object.keys(intervals)[0];
            const aggregations = Object.keys(intervals[firstInterval]);
            setExistingAggregations(aggregations);
        }
    }, [activeRuleset]);

    useEffect(() => {
        const stats = getRulesetStatistics(activeRuleset);
        if (stats && stats.periodic_graph_data) {
            const graphData = stats.periodic_graph_data[activeInterval][activeAggregation];
            //graphData structure
            //graphData[date] = { clears: X, scores: Y, implied_score: Z, lazer_score: W, ... }

            //x = date labels
            //y = values based on activeChartType
            //create chartjs data
            console.log('graphData', graphData);
            const chartData = {
                labels: Object.keys(graphData),
                datasets: INCR_CUMUL_CHART_TYPES[activeChartType].keys.map((key, index) => ({
                    label: INCR_CUMUL_CHART_TYPES[activeChartType].labels[index],
                    data: Object.values(graphData).map(item => item[key] === 0 ? 0.000001 : item[key]), //to avoid log(0) issues, replace 0 with a very small number
                    fill: false,
                    tension: 0.1,
                    pointRadius: 1,
                    pointHoverRadius: 5,
                    borderColor: INCR_CUMUL_CHART_TYPES[activeChartType].colors ? (typeof INCR_CUMUL_CHART_TYPES[activeChartType].colors === 'function' ? INCR_CUMUL_CHART_TYPES[activeChartType].colors(index) : INCR_CUMUL_CHART_TYPES[activeChartType].colors[index]) : theme.palette.primary.main,
                    backgroundColor: INCR_CUMUL_CHART_TYPES[activeChartType].colors ? (typeof INCR_CUMUL_CHART_TYPES[activeChartType].colors === 'function' ? INCR_CUMUL_CHART_TYPES[activeChartType].colors(index) : INCR_CUMUL_CHART_TYPES[activeChartType].colors[index]) : theme.palette.primary.main,
                })),
            }

            setData(chartData);
        }
    }, [activeChartType, activeInterval, activeAggregation, getRulesetStatistics, activeRuleset]);

    if (!existingAggregations) {
        //it may be a nanosecond before data is ready, but we still need to fallback
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            {
                !data ? (
                    <div>Loading...</div>
                ) : (
                    <Box sx={{ height: 400 }}>
                        <Line
                            data={data}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Date',
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: INCR_CUMUL_CHART_TYPES[activeChartType].labels.join(' / '),
                                        },
                                        ticks: {
                                            callback: function (value) {
                                                return INCR_CUMUL_CHART_TYPES[activeChartType].formatter ? INCR_CUMUL_CHART_TYPES[activeChartType].formatter(value) : value;
                                            }
                                        },
                                        type: activeScaleType
                                    }
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return `${context.dataset.label}: ${INCR_CUMUL_CHART_TYPES[activeChartType].formatter ? INCR_CUMUL_CHART_TYPES[activeChartType].formatter(context.parsed.y) : context.parsed.y}`;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </Box>
                )
            }
            <ButtonGroup variant="outlined" size="small">
                {
                    Object.values(INCR_CUMUL_CHART_TYPES).map((chartType: any) => (
                        <Button
                            key={chartType.name}
                            variant={activeChartType === chartType.name ? 'contained' : 'outlined'}
                            onClick={() => {
                                setActiveChartType(chartType.name);
                                if (chartType.invalid_aggregations && chartType.invalid_aggregations.includes(activeAggregation)) {
                                    //switch to first valid aggregation
                                    const firstValidAggregation = existingAggregations.find(agg => !chartType.invalid_aggregations.includes(agg));
                                    setActiveAggregation(firstValidAggregation);
                                }
                            }}
                        >
                            {chartType.name.charAt(0).toUpperCase() + chartType.name.slice(1).replace(/_/g, ' ')}
                        </Button>
                    ))
                }
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small" sx={{ mt: 1 }}>
                {
                    existingAggregations.map(aggregation => (
                        <Button
                            key={aggregation}
                            variant={activeAggregation === aggregation ? 'contained' : 'outlined'}
                            onClick={() => {
                                setActiveAggregation(aggregation);
                            }}
                            disabled={INCR_CUMUL_CHART_TYPES[activeChartType].invalid_aggregations && INCR_CUMUL_CHART_TYPES[activeChartType].invalid_aggregations.includes(aggregation)}
                        >
                            {aggregation.charAt(0).toUpperCase() + aggregation.slice(1)}
                        </Button>
                    ))
                }
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small" sx={{ mt: 1 }}>
                {
                    Object.keys(getRulesetStatistics(activeRuleset)?.periodic_graph_data || {}).map(interval => (
                        <Button
                            key={interval}
                            variant={activeInterval === interval ? 'contained' : 'outlined'}
                            onClick={() => {
                                setActiveInterval(interval);
                            }}
                        >
                            {interval.charAt(0).toUpperCase() + interval.slice(1)}
                        </Button>
                    ))
                }
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small" sx={{ mt: 1 }}>
                {
                    ['linear', 'logarithmic'].map((scaleType: 'linear' | 'logarithmic') => (
                        <Button
                            key={scaleType}
                            variant={activeScaleType === scaleType ? 'contained' : 'outlined'}
                            onClick={() => {
                                setActiveScaleType(scaleType);
                            }}
                        >
                            {scaleType.charAt(0).toUpperCase() + scaleType.slice(1)}
                        </Button>
                    ))
                }
            </ButtonGroup>
        </Box>
    )
}

export default ProfileChartPeriodic;