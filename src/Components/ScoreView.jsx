import { Box, Grid, Stack, Typography } from '@mui/material';
import scoreModalStyles from '../Style/score-modal.module.less';
import scoreInfoStyles from '../Style/score-info.module.less';
import ScoreDial from './ScoreDial';
import NumberFlow from '@number-flow/react';
import { DateToString, FormatNumber } from '../Misc/Helper';
import ModDisplay from './ModDisplay';

function ScoreView({ score }) {

    return (
        <div className={scoreModalStyles['score-modal']}>
            <div>
                <p>user data area</p>
            </div>
            <div className={scoreModalStyles['score-modal__content']}>
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
                    <div className={scoreInfoStyles['score-info']}>
                        <ModDisplay ruleset={score.ruleset} mods={score.mods} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']}`}>
                        <span className={scoreInfoStyles['score-info__version']}>{score.beatmap.version}</span>
                        <span>mapped by <span style={{fontWeight: 'bold'}}>{score.beatmap.mapper || 'N/A'}</span></span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>Ranked on {DateToString(score.beatmap.ranked_date)}</span>
                    </div>
                </Box>
            </div>
        </div >
    )
}

export default ScoreView;