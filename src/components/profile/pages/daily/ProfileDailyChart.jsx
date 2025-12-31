import { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";
import { FormatNumberWithPrecision, GetGradeColor, GetNestedValue } from "../../../../util/Helper";
import { useProfile } from "../../../../providers/ProfileProvider";
import { useScoreView } from "../../../../providers/ScoreViewProvider";
import { getGradeIcon } from "../../../../assets/textures/TextureDatabase";

function ProfileDailyChart({ scores, date, chartData }) {
    const { getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    if (!chartData) {
        return null; //there is always one selected, but it may be delayed on load
    }
    //X is ALWAYS time (starting from 00:00 to 23:59 UTC, so local time can be different for everyone)
    return (
        <div style={{ height: 300, width: '100%' }}>
            <Scatter
                data={{
                    datasets: [
                        {
                            label: chartData.label,
                            data: scores?.map(item => {
                                return {
                                    x: item.ended_at.getTime() / 1000,
                                    y: GetNestedValue(item, chartData.nesting),
                                    id: item.id,
                                };
                            }) || [],
                            //grade color
                            pointBackgroundColor: scores?.map(item => {
                                const score = getScoreById(item.id);
                                return score ? GetGradeColor(score.grade) : '#888888';
                            }) || [],
                            pointRadius: 4,
                        }
                    ]
                }}

                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: {
                                display: true,
                                text: 'Time (UTC)',
                            },
                            ticks: {
                                callback: function (value) {
                                    const date = new Date(value * 1000);
                                    return date.toISOString().substr(11, 5); //HH:MM
                                },
                                min: new Date(`${date}T00:00:00Z`).getTime() / 1000,
                                max: new Date(`${date}T23:59:59Z`).getTime() / 1000,
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: chartData.label,
                            },
                            ticks: {
                                callback: function (value) {
                                    return chartData.yFormat ? chartData.yFormat(value) : value;
                                }
                            },
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const score = getScoreById(context.raw.id);
                                    if (score && score.beatmap) {
                                        return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nTime: ${new Date(context.raw.x * 1000).toISOString().substr(11, 5)}\n${chartData.label}: ${chartData.yFormat ? chartData.yFormat(context.raw.y) : context.raw.y}`;
                                    }
                                    else {
                                        return `Score ID: ${context.raw.id}\nTime: ${new Date(context.raw.x * 1000).toISOString().substr(11, 5)}\n${chartData.label}: ${chartData.yFormat ? chartData.yFormat(context.raw.y) : context.raw.y}`;
                                    }
                                }
                            }
                        }
                    },
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            const index = elements[0].index;
                            const scoreId = chartData?.scores?.[index]?.id;
                            if (scoreId) {
                                loadScoreView(scoreId);
                            }
                        }
                    }
                }}
            />
        </div>
    )
}

export default ProfileDailyChart;