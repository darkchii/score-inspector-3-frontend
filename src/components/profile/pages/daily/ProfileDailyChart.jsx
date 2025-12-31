import { Scatter } from "react-chartjs-2";
import { GetGradeColor, GetNestedValue } from "../../../../util/Helper";
import { useProfile } from "../../../../providers/ProfileProvider";
import { useScoreView } from "../../../../providers/ScoreViewProvider";
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useEffect, useState } from "react";

Chart.register(annotationPlugin);


function ProfileDailyChart({ scores, sessions, date, chartData }) {
    const { getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    const [sessionAnnotations, setSessionAnnotations] = useState([]);

    useEffect(() => {
        const annotations = {};
        console.log('sessions for daily chart', sessions);
        if (sessions && sessions?.sessions?.length > 0) {
            sessions.sessions.forEach((session, index) => {
                const startTime = session.start.getTime() / 1000;
                const endTime = session.end.getTime() / 1000;
                //box annotation from start to end
                annotations[`sessionBox${index}`] = {
                    type: 'box',
                    xMin: startTime,
                    xMax: endTime,
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderColor: 'rgba(0, 123, 255, 0.5)',
                    borderWidth: 1,
                };

                //breaks
                if(session.breaks && session.breaks.length > 0){
                    session.breaks.forEach((brk, brkIndex) => {
                        const breakStart = brk.start.getTime() / 1000;
                        const breakEnd = brk.end.getTime() / 1000;
                        annotations[`session${index}Break${brkIndex}`] = {
                            type: 'box',
                            xMin: breakStart,
                            xMax: breakEnd,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderColor: 'rgba(255, 0, 0, 0.5)',
                            borderWidth: 1,
                        };
                    });
                }
            });
        }
        setSessionAnnotations(annotations);
    }, [scores]);

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
                                    // const date = new Date(value * 1000);
                                    // return date.toISOString().substr(11, 5); //HH:MM
                                    //show as local time
                                    const date = new Date(value * 1000);
                                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                        },
                        annotation: {
                            //vertical line at start and end of day
                            annotations: {
                                startLine: {
                                    type: 'line',
                                    xMin: new Date(`${date}T00:00:00Z`).getTime() / 1000,
                                    xMax: new Date(`${date}T00:00:00Z`).getTime() / 1000,
                                    borderColor: 'rgba(0,0,0,0.5)',
                                    borderWidth: 1,
                                    label: {
                                        display: true,
                                        content: 'Start of Day',
                                        position: 'end',
                                    }
                                },
                                endLine: {
                                    type: 'line',
                                    xMin: new Date(`${date}T23:59:59Z`).getTime() / 1000,
                                    xMax: new Date(`${date}T23:59:59Z`).getTime() / 1000,
                                    borderColor: 'rgba(0,0,0,0.5)',
                                    borderWidth: 1,
                                    label: {
                                        display: true,
                                        content: 'End of Day',
                                        position: 'end',
                                    }
                                },
                                ...(sessionAnnotations || {}),
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