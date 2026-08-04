import { useState } from 'react';
import scoreViewStyles from '../../styles/score-view.module.less';
import type { IScore } from '../../types/types';
import ScoreViewBase from './ScoreViewBase';
import ScoreViewExtended from './ScoreViewExtended';
import { Collapse } from '@mui/material';

function ScoreView({ score, noBackground = false, compact = false }: { score: IScore | null, noBackground?: boolean, compact?: boolean }) {
    const [showExtended, setShowExtended] = useState(false);

    if (!score) {
        return null;
    }

    return (
        <div className={scoreViewStyles['score-view']}>
            <div className={scoreViewStyles['score-view__backdrop']}>
                <ScoreViewBase score={score} noBackground={noBackground} compact={compact} />
                {/* <ScoreViewExtended score={score} /> */}
                <Collapse in={showExtended} orientation='horizontal' unmountOnExit>
                    <ScoreViewExtended score={score} />
                </Collapse>
                {/* show a vertical bar that can be clicked, which toggles showExtended, with an arrow < or > depending on the state */}
                <div
                    className={scoreViewStyles['score-view__extender-button']}
                    onClick={() => setShowExtended(!showExtended)}
                >
                    {showExtended ? '<' : '>'}
                </div>
            </div>
        </div>
    )
}

export default ScoreView;