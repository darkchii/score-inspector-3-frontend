import { useParams } from 'react-router';
import scorePageStyles from '../styles/score-page.module.less';
import { useEffect, useState } from 'react';
import { GetExtraData, GetScoreFromId } from '../util/ScoreHelper';
import ScoreView from '../components/scoreView/ScoreView';
import { GetRulesetIconFromId } from '../util/Helper';
import DifficultyBadge from '../components/DifficultyBadge';

function RouteScore() {
    const { scoreId } = useParams();
    const [score, setScore] = useState(null);
    const [rawBeatmap, setRawBeatmap] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        //fetch score data
        setIsLoading(true);
        (async () => {
            try {
                const score = await GetScoreFromId(scoreId);
                if (score) {
                    const _rawBeatmap = await GetExtraData(score.beatmap_id, score.ruleset, score.mods);
                    console.log(_rawBeatmap);
                    setRawBeatmap(_rawBeatmap);
                    setScore(score);
                    setIsLoading(false);
                } else {
                    setErrorMessage("Score not found.");
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching score data:", error);
                setErrorMessage("Failed to load score data.");
            }
        })();
    }, [scoreId]);

    if (isLoading) {
        return (
            <div className={scorePageStyles['score-page']}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                }}>
                    <h1>Loading score...</h1>
                </div>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className={scorePageStyles['score-page']}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                }}>
                    <h1>{errorMessage}</h1>
                </div>
            </div>
        )
    }

    return (
        <div className={scorePageStyles['score-page']}>
            <div
                style={{
                    '--background-image': `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/fullsize.jpg)`,
                }}
                className={scorePageStyles['score-page__background']}
            />
            <div className={scorePageStyles['score-page__header']}>
                <div><span className={scorePageStyles['score-page__header__title']}>{score.beatmap.title}</span> by {score.beatmap.artist}</div>
                <div className={scorePageStyles['score-page__header__details']}>
                    <img src={GetRulesetIconFromId(score.ruleset_id)} style={{ width: '1.5em', height: '1.5em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                    <DifficultyBadge difficulty={score.star_rating} />
                    <span>{score.beatmap.version}</span>
                    <div className={scorePageStyles['score-page__header__details__mapper']}>mapped by <strong>{score.beatmap.mapper || 'N/A'}</strong></div>
                </div>
            </div>
            <div className={scorePageStyles['score-page__content']}>
                <div className={scorePageStyles['score-page__content__score-view']}>
                    <ScoreView score={score} noBackground={true} compact={true} />
                </div>
                <div className={scorePageStyles['score-page__content__score-details']}>
                </div>
            </div>
        </div>
    )
}

export default RouteScore;