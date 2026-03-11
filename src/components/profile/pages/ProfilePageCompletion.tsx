import { Checkbox, FormControl, FormControlLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import { Box, Grid } from "@mui/system";
import { useProfile } from "../../../providers/ProfileProvider";
import { useEffect, useState } from "react";
import { FormatNumber, FormatNumberWithPrecision } from "../../../util/Helper";
import { Bar } from "react-chartjs-2";
import { GetColorInterpolation } from "../../../util/ColorUtils";
import BetterTooltip from "../../tooltips/BetterTooltip";
import NumberFlow from "@number-flow/react";

const COMPLETION_DATA = {
    'cs': {
        title: 'CS Completion',
        key: 'cs',
        description: 'Completion by Circle Size (CS)',
        extra_info: 'For mania, this represents key count',
        key_formatter: (key) => `CS ${key}`,
    },
    'ar': {
        title: 'AR Completion',
        key: 'ar',
        description: 'Completion by Approach Rate (AR)',
        key_formatter: (key) => `AR ${key}`,
    },
    'od': {
        title: 'OD Completion',
        key: 'od',
        description: 'Completion by Overall Difficulty (OD)',
        key_formatter: (key) => `OD ${key}`,
    },
    'hp': {
        title: 'HP Completion',
        key: 'hp',
        description: 'Completion by Health Points (HP)',
        key_formatter: (key) => `HP ${key}`,
    },
    'yearly': {
        title: 'Yearly Completion',
        key: 'year',
        description: 'Completion by ranked year',
        key_formatter: (key) => key, //year as is
    },
    'star_rating': {
        title: 'Stars Completion',
        key: 'star_rating',
        description: 'Completion by star rating brackets',
        key_formatter: (key) => `${key}★`,
    },
    'length': {
        title: 'Length Completion',
        key: 'length',
        description: 'Completion by length brackets',
        key_formatter: (key) => {
            //if ends with +, show as is
            if (key.endsWith('+')) {
                return `${key} min`;
            }
            const length_in_min = Number(key);
            if (length_in_min < 1) return `< 1 min`;
            const minutes = Math.floor(length_in_min);
            return `${minutes} min`;
        },
    },
    'combo': {
        title: 'Combo Completion',
        key: 'combo',
        description: 'Completion by max combo brackets',
        key_formatter: (key) => {
            //if ends with +, show as is
            if (key.endsWith('+')) {
                return `${key} combo`;
            }
            const combo_value = Number(key);
            if (combo_value < 100) return `< 100 combo`;
            return `${FormatNumber(combo_value)} combo`;
        },
    }
}

function ProfilePageCompletion() {
    const { getRulesetStatistics, activeRuleset } = useProfile();
    const [completionStats, setCompletionStats] = useState(null);
    const [withoutLoved, setWithoutLoved] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const rulesetStats = getRulesetStatistics(activeRuleset, withoutLoved);
        console.log(rulesetStats, `Completion stats for ruleset ${activeRuleset} (without loved: ${withoutLoved})`);
        if (rulesetStats) {
            setCompletionStats(rulesetStats.completion_statistics);
        }
    }, [activeRuleset, getRulesetStatistics, withoutLoved]);

    if (!completionStats) {
        return <Typography>Loading completion statistics...</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <FormControl sx={{ marginBottom: 2 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={withoutLoved}
                            onChange={(e) => setWithoutLoved(e.target.checked)}
                        />
                    }
                    label="Exclude Loved Beatmaps"
                />
            </FormControl>
            <Grid container spacing={1}>
                {Object.entries(COMPLETION_DATA).map(([dataKey, dataInfo]: [string, any]) => (
                    <Grid size={{ xs: 12, md: 3 }} key={`completion-data-${dataKey}`}>
                        <Paper sx={{ padding: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>{dataInfo.title}</Typography>
                            <div style={{ width: '100%', height: '80px' }}>
                                {/* mini bar chart, non-interactive */}
                                <Bar
                                    data={{
                                        labels: completionStats[dataInfo.key] ? Object.keys(completionStats[dataInfo.key]).map(key => dataInfo.key_formatter(key)) : [],
                                        datasets: [
                                            {
                                                label: 'Completion %',
                                                data: completionStats[dataInfo.key] ? Object.values(completionStats[dataInfo.key]).map((stats: any) => (stats.completion || 0) * 100) : [],
                                                //backgroundColor: theme.palette.primary.main,
                                                //colorscale based on value
                                                backgroundColor: Object.values(completionStats[dataInfo.key] || {}).map((stats: any) => {
                                                    return GetColorInterpolation((stats.completion || 0), 0, 1, [255, 35, 35], [35, 255, 35], 1.0);
                                                }),
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            x: {
                                                display: false,
                                            },
                                            y: {
                                                display: false,
                                                min: 0,
                                                max: 100,
                                                ticks: { stepSize: 20 },
                                            },
                                        },
                                        plugins: {
                                            legend: {
                                                display: false,
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <TableContainer>
                                <Table size="small">
                                    <TableBody>
                                        {
                                            completionStats[dataInfo.key] ? Object.entries(completionStats[dataInfo.key]).map(([key, stats]: [string, any]) => (
                                                <TableRow key={`completion-${dataKey}-${key}`}>
                                                    <TableCell>
                                                        <BetterTooltip title={dataInfo.description + (dataInfo.extra_info ? ` (${dataInfo.extra_info})` : '')} arrow>
                                                            <span>{dataInfo.key_formatter(key)}</span>
                                                        </BetterTooltip>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ p: 0 }}><NumberFlow value={stats.cleared} /></TableCell>
                                                    <TableCell align="center" sx={{ p: 0 }}>/</TableCell>
                                                    <TableCell align="left" sx={{ p: 0 }}><NumberFlow value={stats.total} /></TableCell>
                                                    <TableCell align="right"><NumberFlow format={{ maximumFractionDigits: 0 }} value={((stats.completion || 0) * 100)} suffix="%" /></TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        No data available
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default ProfilePageCompletion;