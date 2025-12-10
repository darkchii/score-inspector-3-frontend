import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { useProfile } from '../../../../Providers/ProfileProvider';
import { FormatNumberWithPrecision } from '../../../../Misc/Helper';
import { useScoreView } from '../../../../Providers/ScoreViewProvider';
import { Alert } from '@mui/material';

function ProfileChartAccuracyDifficulty() {
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
                            data: getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter || [],
                            //color based on x,y value
                            colorGetter: (data) => {
                                return data.value.color;
                            },
                            valueFormatter: (value) => {
                                const score = getScoreById(value.id);
                                if (score && score.beatmap) {
                                    return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nStars: ${FormatNumberWithPrecision(value.x, 2)}★\nAccuracy: ${FormatNumberWithPrecision(value.y * 100, 2)}%`;
                                } else {
                                    return `Score ID: ${value.id}\nStars: ${FormatNumberWithPrecision(value.x, 2)}★\nAccuracy: ${FormatNumberWithPrecision(value.y * 100, 2)}%`;
                                }
                            }
                        }
                    ]
                }

                onItemClick={(event, scatterItemIdentifier) => {
                    const score = getScoreById(getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter[scatterItemIdentifier.dataIndex].id);
                    if (score) {
                        loadScoreView(score);
                    }
                }}

                xAxis={
                    [
                        {
                            valueFormatter: (value) => `${FormatNumberWithPrecision(value, 2)}★`,
                        }
                    ]
                }

                yAxis={
                    [
                        {
                            valueFormatter: (value) => `${FormatNumberWithPrecision(value * 100, 2)}%`,
                            max: 1,
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

export default ProfileChartAccuracyDifficulty;