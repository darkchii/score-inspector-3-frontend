import { Scatter } from "react-chartjs-2";
import { useProfile } from "../../../../providers/ProfileProvider";
import { useScoreView } from "../../../../providers/ScoreViewProvider";
import { FormatNumberWithPrecision } from "../../../../util/Helper";
import { Alert } from "@mui/material";

function PerformanceChartPerformanceSpread() {
    const { getRulesetStatistics, activeRuleset, getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    return (
        <>
            <div style={{ height: 400 }}>
                <Scatter 
                    data={{
                        datasets: [
                            {
                                label: 'Scores',
                                data: getRulesetStatistics(activeRuleset)?.charts?.performanceSpread.map((item: any) => ({ x: item.x, y: item.y, id: item.id })) || [],
                                pointBackgroundColor: getRulesetStatistics(activeRuleset)?.charts?.performanceSpread.map((item: any) => item.color) || [],
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
                                    text: 'Performance',
                                },
                                ticks: {
                                    callback: function(value: any) {
                                        return `${FormatNumberWithPrecision(value, 2)}pp`;
                                    }
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context: any) {
                                        const score = getScoreById(context.raw.id);
                                        if (score && score.beatmap) {
                                            return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nRank: #${context.raw.x.toLocaleString()}\nPP: ${FormatNumberWithPrecision(context.raw.y, 2)}pp`;
                                        }
                                        else {
                                            return `Score ID: ${context.raw.id}\nRank: #${context.raw.x.toLocaleString()}\nPP: ${FormatNumberWithPrecision(context.raw.y, 2)}pp`;
                                        }
                                    }
                                }
                            }
                        },
                        onClick: (evt: any, elements: any) => {
                            if (elements.length > 0) {
                                const index = elements[0].index;
                                const score = getScoreById(getRulesetStatistics(activeRuleset)?.charts?.performanceSpread[index]?.id);
                                if (score) {
                                    loadScoreView(score);
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

export default PerformanceChartPerformanceSpread;