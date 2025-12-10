import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { useProfile } from '../../../../Providers/ProfileProvider';
import { FormatNumberWithPrecision } from '../../../../Misc/Helper';
import { useScoreView } from '../../../../Providers/ScoreViewProvider';

function ProfileChartAccuracyDifficulty() {
    const { getRulesetStatistics, activeRuleset, getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    return (
        <>
            <ScatterChart
                skipAnimation={true}
                height={400}
                series={
                    [
                        {
                            markerSize: 2,
                            data: getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter || [],
                            //on hover, show score id
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

                onItemClick={(item, scatterItemIdentifier) => {
                    const _item = getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter[scatterItemIdentifier.dataIndex];
                    const score = getScoreById(_item.id);
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
                        }
                    ]
                }
            />
        </>
    );
}

export default ProfileChartAccuracyDifficulty;