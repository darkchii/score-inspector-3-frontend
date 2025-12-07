import { useState } from 'react';
import scoreViewStyles from '../Style/score-view.module.less';
import ScoreViewBase from './ScoreViewBase';
import { Collapse } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

function ScoreView({ score }) {
    const [isExtended, setIsExtended] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth <= 768);
    });

    return (
        <div className={scoreViewStyles['score-view']}>
            <ScoreViewBase score={score} />
            {
                isMobile ? null : <>
                    <Collapse in={isExtended} orientation="horizontal" unmountOnExit>
                        <div className={scoreViewStyles['score-view__extended']}>
                            {/* Extended score information can go here */}
                            <p>Extended Score Information Area</p>
                        </div>
                    </Collapse>
                    <div className={scoreViewStyles['score-view__extender-button']} onClick={() => setIsExtended(!isExtended)}>
                        {isExtended ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
                    </div>
                </>
            }
        </div>
    )
}

export default ScoreView;