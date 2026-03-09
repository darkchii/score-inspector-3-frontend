import { Grid, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import { FormatNumber, GetRulesetColor, GetRulesetNameFromId, GetRulesetPrettyNameFromId } from "../../util/Helper";

function CompletionistsScoresChart({ data }) {
    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ padding: 1 }}>
                <div style={{ height: 300 }}>
                    <Line
                        data={{
                            datasets: [
                                ...Object.keys(data).map(mode => ({
                                    label: GetRulesetPrettyNameFromId(mode),
                                    data: data[mode].map(item => ({
                                        x: new Date(item.completion_date).getTime(),
                                        y: item.scores,
                                        data: item,
                                    })),
                                    borderColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                    backgroundColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                })),
                                {
                                    label: "Invisible",
                                    data: [
                                        {
                                            x: new Date(new Date(data[Object.keys(data)[0]][0].completion_date).getTime() - (new Date().getTime() - new Date(data[Object.keys(data)[0]][0].completion_date).getTime()) * 0.05),
                                            y: 0,
                                        },
                                        {
                                            x: new Date(new Date().getTime() + (new Date().getTime() - new Date(data[Object.keys(data)[0]][0].completion_date).getTime()) * 0.05),
                                            y: Math.max(...Object.values(data).flat().map(item => item.scores)) * 1.05,
                                        },
                                    ],
                                    borderColor: "rgba(0,0,0,0)",
                                    backgroundColor: "rgba(0,0,0,0)",
                                    pointRadius: 0,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    type: "time",
                                    time: {
                                        unit: "day",
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: "Scores",
                                    },
                                    ticks: {
                                        callback: value => `${FormatNumber(value)}`,
                                    },
                                },
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: context => {
                                            const item = context.raw.data;
                                            return `${item.user?.osuApi.username || `${item.osu_id} (restricted?)`} | Scores: ${FormatNumber(item.scores)} | Completion Date: ${new Date(item.completion_date).toLocaleDateString()}`;
                                        },
                                    },
                                },
                                legend: {
                                    labels: {
                                        filter: legendItem => legendItem.text !== "Invisible",
                                    },
                                },
                            },
                            layout: {
                                padding: 10,
                            },
                        }}
                    />
                </div>
            </Paper>
        </Grid>
    );
}

export default CompletionistsScoresChart;
