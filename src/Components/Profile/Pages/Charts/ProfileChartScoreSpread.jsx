import { ScatterChart } from "@mui/x-charts";
import { useProfile } from "../../../../Providers/ProfileProvider";
import { useScoreView } from "../../../../Providers/ScoreViewProvider";
import { FormatNumberWithPrecision } from "../../../../Misc/Helper";
import { Alert } from "@mui/material";

function PerformanceChartScoreSpread() {
    const { getRulesetStatistics, activeRuleset, getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    return (
        <>
            <ScatterChart
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
            />
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