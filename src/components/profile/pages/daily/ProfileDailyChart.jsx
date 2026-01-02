import { Scatter } from "react-chartjs-2";
import { GetGradeColor, GetNestedValue } from "../../../../util/Helper";
import { useProfile } from "../../../../providers/ProfileProvider";
import { useScoreView } from "../../../../providers/ScoreViewProvider";
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { useEffect, useState } from "react";
import { getDiffColour } from "../../../../util/DifficultyHelper";
import { toggleAnnotationLabel } from "../../../../util/ChartUtils";
import { Button, ButtonGroup } from "@mui/material";

Chart.register(annotationPlugin);

const chartDefinitions = {
    pp: { value: 'pp', nesting: ['implied_pp'], label: 'Performance', yFormat: (y) => y.toFixed(2) + 'pp' },
    score: { value: 'score', nesting: ['implied_total_score'], label: 'Score', yFormat: (y) => y.toLocaleString('en-US') },
    accuracy: { value: 'accuracy', nesting: ['accuracy'], label: 'Accuracy', yFormat: (y) => (y * 100).toFixed(2) + '%' },
    combo: { value: 'combo', nesting: ['combo'], label: 'Combo', yFormat: (y) => y.toLocaleString('en-US') + 'x' },
    length: { value: 'length', nesting: ['local_beatmap', 'length_modded'], label: 'Length', yFormat: (y) => `${Math.floor(y / 60)}:${(y % 60).toString().padStart(2, '0')}` },
    sr: { value: 'sr', nesting: ['star_rating'], label: 'Stars', yFormat: (y) => y.toFixed(2) + '★' },
    // { value: 'cs', nesting: ['beatmap', 'difficulty_data', 'modded_cs'], label: 'CS', yFormat: (y) => y.toFixed(2) },
    // { value: 'ar', nesting: ['beatmap', 'difficulty_data', 'modded_ar'], label: 'AR', yFormat: (y) => y.toFixed(2) },
    // { value: 'od', nesting: ['beatmap', 'difficulty_data', 'modded_od'], label: 'OD', yFormat: (y) => y.toFixed(2) },
    // { value: 'hp', nesting: ['beatmap', 'difficulty_data', 'modded_hp'], label: 'HP', yFormat: (y) => y.toFixed(2) },
};

function ProfileDailyChart({ scores, sessions, dateStart, dateEnd, displayStartEnd = true }) {
    const { getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();

    const [sessionAnnotations, setSessionAnnotations] = useState([]);
    const [activeDisplayChart, setActiveDisplayChart] = useState(chartDefinitions.pp.value);

    useEffect(() => {
        const annotations = {};
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
                if (session.breaks && session.breaks.length > 0) {
                    session.breaks.forEach((brk, brkIndex) => {
                        const breakStart = brk.start.getTime() / 1000;
                        const breakEnd = brk.end.getTime() / 1000;
                        annotations[`session${index}Break${brkIndex}`] = {
                            type: 'box',
                            xMin: breakStart,
                            xMax: breakEnd,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderColor: 'rgba(255, 0, 0, 0.5)',
                            borderWidth: 1
                        };
                    });
                }
            });
        }
        setSessionAnnotations(annotations);
    }, [scores]);

    if (!chartDefinitions[activeDisplayChart]) {
        return null; //there is always one selected, but it may be delayed on load
    }
    //X is ALWAYS time (starting from 00:00 to 23:59 UTC, so local time can be different for everyone)
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ButtonGroup sx={{ mb: 2 }}>
                {
                    Object.values(chartDefinitions).map((chartDef) => (
                        <Button
                            key={chartDef.value}
                            onClick={() => setActiveDisplayChart(chartDef.value)}
                            disabled={activeDisplayChart === chartDef.value}
                        >
                            {chartDef.label}
                        </Button>
                    ))
                }
            </ButtonGroup>
            <div style={{ height: 300, width: '100%' }}>
                <Scatter
                    data={{
                        datasets: [
                            {
                                label: chartDefinitions[activeDisplayChart].label,
                                data: scores?.map(item => {
                                    return {
                                        x: item.ended_at.getTime() / 1000,
                                        y: GetNestedValue(item, chartDefinitions[activeDisplayChart].nesting),
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
                                    text: 'Time',
                                },
                                ticks: {
                                    callback: function (value) {
                                        // const date = new Date(value * 1000);
                                        // return date.toISOString().substr(11, 5); //HH:MM
                                        //show as local time
                                        const date = new Date(value * 1000);
                                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    },
                                    min: new Date(`${dateStart}T00:00:00Z`).getTime() / 1000,
                                    max: new Date(`${dateEnd || dateStart}T23:59:59Z`).getTime() / 1000,
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: chartDefinitions[activeDisplayChart].label,
                                },
                                ticks: {
                                    callback: function (value) {
                                        return chartDefinitions[activeDisplayChart].yFormat ? chartDefinitions[activeDisplayChart].yFormat(value) : value;
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
                                            return `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]\nTime: ${new Date(context.raw.x * 1000).toISOString().substr(11, 5)}\n${chartDefinitions[activeDisplayChart].label}: ${chartDefinitions[activeDisplayChart].yFormat ? chartDefinitions[activeDisplayChart].yFormat(context.raw.y) : context.raw.y}`;
                                        }
                                        else {
                                            return `Score ID: ${context.raw.id}\nTime: ${new Date(context.raw.x * 1000).toISOString().substr(11, 5)}\n${chartDefinitions[activeDisplayChart].label}: ${chartDefinitions[activeDisplayChart].yFormat ? chartDefinitions[activeDisplayChart].yFormat(context.raw.y) : context.raw.y}`;
                                        }
                                    }
                                }
                            },
                            annotation: {
                                //vertical line at start and end of day
                                annotations: {
                                    ...(displayStartEnd ? {
                                        startLine: {
                                            type: 'line',
                                            xMin: new Date(`${dateStart}T00:00:00Z`).getTime() / 1000,
                                            xMax: new Date(`${dateStart}T00:00:00Z`).getTime() / 1000,
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            borderWidth: 1,
                                            label: {
                                                display: true,
                                                content: 'Start (UTC)',
                                                position: 'end',
                                            }
                                        }
                                    } : {}),
                                    ...(displayStartEnd ? {
                                        endLine: {
                                            type: 'line',
                                            xMin: new Date(`${dateEnd || dateStart}T23:59:59Z`).getTime() / 1000,
                                            xMax: new Date(`${dateEnd || dateStart}T23:59:59Z`).getTime() / 1000,
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            borderWidth: 1,
                                            label: {
                                                display: true,
                                                content: 'End (UTC)',
                                                position: 'end',
                                            }
                                        }
                                    } : {}),
                                    //extra lines for each day if dateEnd is set and > 1 day
                                    ...(
                                        dateEnd && dateEnd !== dateStart ?
                                            (() => {
                                                const extraAnnotations = {};
                                                const startDate = new Date(dateStart);
                                                const endDate = new Date(dateEnd);
                                                const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                                                for (let i = 1; i < dayCount + 1; i++) {
                                                    const currentDate = new Date(startDate);
                                                    currentDate.setDate(startDate.getDate() + i);
                                                    const dateStr = currentDate.toISOString().substr(0, 10);
                                                    extraAnnotations[`extraLine${i}`] = {
                                                        type: 'line',
                                                        xMin: new Date(`${dateStr}T00:00:00Z`).getTime() / 1000,
                                                        xMax: new Date(`${dateStr}T00:00:00Z`).getTime() / 1000,
                                                        borderColor: 'rgba(255,255,255,0.2)',
                                                        borderWidth: 1,
                                                        //very faint label if dayCount < 10
                                                        label: {
                                                            display: dayCount <= 10,
                                                            content: `Day ${i + 1}`,
                                                            position: 'end',
                                                        }
                                                    };
                                                }
                                                return extraAnnotations;
                                            })()
                                            : {}
                                    ),
                                    ...(sessionAnnotations || {})
                                }
                            }
                        },
                        onClick: (evt, elements) => {
                            if (elements.length > 0) {
                                const index = elements[0].index;
                                const score = scores?.[index];
                                if (score) {
                                    loadScoreView(score);
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    )
}

export default ProfileDailyChart;