import { ScatterChart } from "@mui/x-charts";
import { useProfile } from "../../../../providers/ProfileProvider";
import { useScoreView } from "../../../../providers/ScoreViewProvider";
import { FormatNumberWithPrecision } from "../../../../util/Helper";
import { Alert } from "@mui/material";
import { Scatter } from "react-chartjs-2";

function PerformanceChartScoreSpread() {
    const { getRulesetStatistics, activeRuleset, getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    return (
        <>
            {/* <ScatterChart
                slotProps={
                    {
                        //disable tooltip
                        tooltip: {
                            display: 'none',
                        }
                    }
                }
                skipAnimation={true}
                height={400}
                series={
                    [
                        {
                            markerSize: 2,
                            data: getRulesetStatistics(activeRuleset)?.charts?.scoreSpread || [],
                            //color based on x,y value
                            colorGetter: (data) => {
                                return data.value.color;
                            },
                            valueFormatter: (value) => {
                                const score = getScoreById(value.id);
                                if (score && score.beatmap) {
                                    return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nScore: ${FormatNumberWithPrecision(value.y)}`;
                                } else {
                                    return `Score ID: ${value.id}\nScore: ${FormatNumberWithPrecision(value.y)}`;
                                }
                            }
                        }
                    ]
                }

                onItemClick={(event, scatterItemIdentifier) => {
                    const score = getScoreById(getRulesetStatistics(activeRuleset)?.charts?.scoreSpread[scatterItemIdentifier.dataIndex].id);
                    if (score) {
                        loadScoreView(score);
                    }
                }}

                yAxis={
                    [
                        {
                            valueFormatter: (value) => `${FormatNumberWithPrecision(value, 0)}`,
                            width: 80,
                        }
                    ]
                }
            /> */}
            <div style={{ height: 400 }}>
                <Scatter
                    data={{
                        datasets: [
                            {
                                label: 'Scores',
                                data: getRulesetStatistics(activeRuleset)?.charts?.scoreSpread.map(item => ({ x: item.x, y: item.y, id: item.id })) || [],
                                pointBackgroundColor: getRulesetStatistics(activeRuleset)?.charts?.scoreSpread.map(item => item.color) || [],
                                pointRadius: 2,
                            }
                        ]
                    }}

                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: '#',
                                },
                                ticks: {
                                    callback: function(value) {
                                        return `#${Number(value).toLocaleString()}`;
                                    }
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Score',
                                },
                                ticks: {
                                    callback: function(value) {
                                        return `${FormatNumberWithPrecision(value, 0)}`;
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const score = getScoreById(context.raw.id);
                                        if (score && score.beatmap) {
                                            return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nRank: #${context.raw.x.toLocaleString()}\nScore: ${FormatNumberWithPrecision(context.raw.y, 0)}`;
                                        }
                                        else {
                                            return `Score ID: ${context.raw.id}\nRank: #${context.raw.x.toLocaleString()}\nScore: ${FormatNumberWithPrecision(context.raw.y, 0)}`;
                                        }
                                    }
                                }
                            }
                        },
                        onClick: (evt, elements) => {
                            if (elements.length > 0) {
                                const index = elements[0].index;
                                const datasetIndex = elements[0].datasetIndex;
                                const scoreId = getRulesetStatistics(activeRuleset)?.charts?.scoreSpread[index]?.id;
                                if (scoreId) {
                                    loadScoreView(scoreId);
                                }
                            }
                        }
                    }}
                />
            </div>
            {
                getRulesetStatistics(activeRuleset)?.scores_set?.clears > 10000 &&
                <Alert severity="info" sx={{ mt: 2 }}>
                    The data has been reduced to ~10000 scores ordered by score to keep site responsive.
                </Alert>
            }
        </>
    );
}

export default PerformanceChartScoreSpread;