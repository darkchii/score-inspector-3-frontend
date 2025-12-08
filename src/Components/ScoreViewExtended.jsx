import { useEffect } from 'react';
import scoreViewStyles from '../Style/score-view.module.less';

//Holds the extra data for a score (extra PP breakdown, replay info, etc)
function ScoreViewExtended({ score }) {
    useEffect(() => {
        // Test
        console.log('ScoreViewExtended mounted or score changed:', score);
    }, [score]);
    
    return (
        <div className={scoreViewStyles['score-view__extended']}>
            {/* Extended score information can go here */}
            <p>Extended Score Information Area</p>
        </div>
    )
}

export default ScoreViewExtended;