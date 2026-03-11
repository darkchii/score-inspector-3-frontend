import { Grid, Paper } from "@mui/material";
import { Line } from "react-chartjs-2";
import { FormatNumber, GetRulesetColor, GetRulesetNameFromId, GetRulesetPrettyNameFromId } from "../../util/Helper";

function CompletionistsCountChart({ data }: { data: any }) {
    return (
        <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={3} sx={{ padding: 1 }}>
                <div style={{ height: 300 }}>
                    <Line
                        data={{
                            datasets: [
                                ...Object.keys(data).map(mode => ({
                                    label: GetRulesetPrettyNameFromId(mode),
                                    data: data[mode].map((item: any) => ({
                                        x: new Date(item.completion_date).getTime(),
                                        y: data[mode].filter((i: any) => new Date(i.completion_date).getTime() <= new Date(item.completion_date).getTime()).length,
                                    })),
                                    borderColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                    backgroundColor: GetRulesetColor(GetRulesetNameFromId(mode))[500],
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    stepped: true,
                                })),
                                {
                                    label: "Combined",
                                    data: Object.values(data).flat().sort((a: any, b: any) => new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime()).map((item: any, index: number, arr: any[]) => ({
                                        x: new Date(item.completion_date).getTime(),
                                        y: arr.filter((i: any) => new Date(i.completion_date).getTime() <= new Date(item.completion_date).getTime()).length,
                                    })),
                                    borderColor: "rgba(128,128,128,0.5)",
                                    backgroundColor: "rgba(128,128,128,0.5)",
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    stepped: true,
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
                                        text: "Completionists",
                                    },
                                    ticks: {
                                        callback: (value: any) => `${FormatNumber(value)}`,
                                    },
                                },
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
    );
}

export default CompletionistsCountChart;
