import { Box, Grid, Stack, Typography } from '@mui/material';
import scoreModalStyles from '../Style/score-modal.module.less';
import scoreInfoStyles from '../Style/score-info.module.less';
import scoreStatsStyles from '../Style/score-info.module.less';
import ScoreDial from './ScoreDial';
import NumberFlow from '@number-flow/react';
import { DateToString, FormatNumber, GetRulesetIconFromId } from '../Misc/Helper';
import ModDisplay from './ModDisplay';
import DifficultyBadge from './DifficultyBadge';
import { GetStarRating } from '../Misc/ScoreHelper';

function ScoreView({ score }) {

    return (
        <div className={scoreModalStyles['score-modal']}>
            <div>
                <p>user data area</p>
            </div>
            <div className={scoreModalStyles['score-modal__content']}>
                <div className={scoreModalStyles['score-modal__background']} style={{
                    backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/fullsize.jpg)`,
                }} />
                <div className={scoreModalStyles['score-modal__background__overlay']} />
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__title']}`}>
                        <span>{score.beatmap.title}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__artist']}`}>
                        <span>{score.beatmap.artist}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__dial']}`}>
                        <ScoreDial score={score} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__score']}`}>
                        <span>{FormatNumber(score.total_score)}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__subscore']}`}>
                        <span>{FormatNumber(score.classic_total_score)}</span>
                    </div>
                    {/* row flex */}
                    <div className={scoreInfoStyles['score-info']} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <DifficultyBadge difficulty={GetStarRating(score)} />
                        <img src={GetRulesetIconFromId(score.ruleset_id)} alt="Ruleset Icon" style={{ width: '24px', height: '24px' }} />
                        <ModDisplay ruleset={score.ruleset} mods={score.mods} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']}`}>
                        <span className={scoreInfoStyles['score-info__version']}>{score.beatmap.version}</span>
                        <span>mapped by <span style={{ fontWeight: 'bold' }}>{score.beatmap.mapper || 'N/A'}</span></span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']}`}>
                        <div className={scoreStatsStyles['score-stats']}>
                        </div>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>Played on {DateToString(score.ended_at)}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>ID: {score.id}</span>
                    </div>
                </Box>
            </div>
        </div >
    )
}

export default ScoreView;