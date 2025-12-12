import { useEffect, useState } from 'react';
import scoreViewStyles from '../Style/score-view.module.less';
import ReplayStorage from '../Misc/Replay/ReplayStorage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

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
                            <h3>Replay Information</h3>
                            <p>Player: {replay.username}</p>
                            <p>Score: {replay.score}</p>
                            <p>Max Combo: {replay.combo}</p>
                            <p>300s: {replay.count300}, 100s: {replay.count100}, 50s: {replay.count50}</p>
                            <p>Misses: {replay.countMiss}</p>
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

export default ScoreViewExtended;