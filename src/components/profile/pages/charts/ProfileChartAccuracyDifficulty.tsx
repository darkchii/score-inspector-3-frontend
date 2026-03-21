// import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { Scatter } from 'react-chartjs-2';
import { useProfile } from '../../../../providers/ProfileProvider';
import { useScoreView } from '../../../../providers/ScoreViewProvider';
import { Alert } from '@mui/material';

function ProfileChartAccuracyDifficulty() {
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
                                data: getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter.map((item: any) => ({ x: item.x, y: item.y, id: item.id })) || [],
                                pointBackgroundColor: getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter.map((item: any) => item.color) || [],
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
                                    text: 'Star Rating',
                                },
                                ticks: {
                                    callback: function(value: any) {
                                        return `${Number(value).toFixed(2)}★`;
                                    }
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Accuracy (%)',
                                },
                                ticks: {
                                    callback: function(value: any) {
                                        return `${(Number(value) * 100).toFixed(2)}%`;
                                    }
                                },
                                max: 1,
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context: any) {
                                        const score = getScoreById(context.raw.id);
                                        if (score && score.beatmap) {
                                            return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nStars: ${context.raw.x.toFixed(2)}★\nAccuracy: ${(context.raw.y * 100).toFixed(2)}%`;
                                        } else {
                                            return `Score ID: ${context.raw.id}\nStars: ${context.raw.x.toFixed(2)}★\nAccuracy: ${(context.raw.y * 100).toFixed(2)}%`;
                                        }
                                    }
                                }
                            },
                            legend: { display: false }
                        },
                        onClick: (event, elements) => {
                            if (elements.length > 0) {
                                const index = elements[0].index;
                                const score = getScoreById(getRulesetStatistics(activeRuleset)?.charts?.accuracyDifficultyScatter[index].id);
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

export default ProfileChartAccuracyDifficulty;