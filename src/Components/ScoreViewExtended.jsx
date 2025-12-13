import { useEffect, useState } from 'react';
import scoreViewStyles from '../styles/score-view.module.less';
import ReplayStorage from '../util/Replay/ReplayStorage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { Typography } from '@mui/material';

//Holds the extra data for a score (extra PP breakdown, replay info, etc)
function ScoreViewExtended({ score }) {
    const [replay, setReplay] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const _replay = await ReplayStorage.get(score.id);
                console.log("Loaded replay for score:", score.id, _replay);
                setReplay(_replay);
            } catch (e) {
                console.error("Failed to load replay for score:", score.id, e);
            }
        })();
    }, [score]);

    return (
        <div className={scoreViewStyles['score-view__extended']}>
            <div className={scoreViewStyles['score-view__extended__content']}>
                {/* Extended score information can go here */}
                {
                    loading ? (
                        <div>Loading replay...</div>
                    ) : replay ? (
                        <div>
                            {
                                score.ruleset_id === 0 ? (
                                    <ScoreViewExtendedOsuDisplay replay={replay} />
                                ) : (
                                    <div>Unsupported ruleset for extended display.</div>
                                )
                            }
                        </div>
                    ) : (
                        <div className={scoreViewStyles['score-view__extended__content__no-data']}>
                            <ErrorOutlineIcon style={{ marginRight: '8px' }} />
                            No replay data available.
                        </div>
                    )
                }
            </div>
        </div>
    )
}

// Ruleset-specific display components
function ScoreViewExtendedOsuDisplay({ replay }) {
    return (
        <>
            <Typography variant="h6" gutterBottom>
                Replay Heatmap
            </Typography>
            {/* ratio needs to be EXACTLY 512:384, can be sized up or down maintaining this ratio */}
            <ScatterChart 
                sx={{
                    //chartswrapper force white text
                    color: 'white !important',
                }}
                slotProps={
                    {
                        //disable tooltip
                        tooltip: {
                            display: 'none',
                        }
                    }
                }
                skipAnimation={true}

                width={512}
                height={384}

                series={
                    [
                        ...Object.entries(replay.graph_data.heatmap).map(([key, dataset]) => ({
                            data: dataset,
                            markerSize: 1,
                            label: key,
                        }))
                    ]
                }

                //white text on axes
                xAxis={
                    [
                        {
                            label: 'X',
                            labelProps: {
                                fill: 'white',
                            },
                            tickProps: {
                                fill: 'white',
                            },
                        }
                    ]
                }

                yAxis={
                    [
                        {
                            label: 'Y',
                            labelProps: {
                                fill: 'white',
                            },
                            tickProps: {
                                fill: 'white',
                            },
                        }
                    ]
                }
            />
        </>
    );
}

export default ScoreViewExtended;