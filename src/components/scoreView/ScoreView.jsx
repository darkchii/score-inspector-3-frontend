import { useState } from 'react';
import scoreViewStyles from '../styles/score-view.module.less';
import ScoreViewBase from './scoreView/ScoreViewBase';
import { Collapse } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ScoreViewExtended from './scoreView/ScoreViewExtended';

function ScoreView({ score }) {
    const [isExtended, setIsExtended] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth <= 768);
    });

    return (
        <div className={scoreViewStyles['score-view']}>
            <div className={scoreViewStyles['score-view__backdrop']}>
                <ScoreViewBase score={score} />
                {
                    isMobile ? null : <>
                        <Collapse in={isExtended} orientation="horizontal" unmountOnExit>
                            <ScoreViewExtended score={score} />
                        </Collapse>
                    </>
                }
            </div>
            {
                isMobile ? null : <>
                    <div className={scoreViewStyles['score-view__extender-button']} onClick={() => setIsExtended(!isExtended)}>
                        {isExtended ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
                    </div>
                </>
            }
        </div>
    )
}

export default ScoreView;