import { useState } from 'react';
import scoreViewStyles from '../../styles/score-view.module.less';
import ScoreViewReplay from './ScoreViewReplay';
import { Collapse, Fade } from '@mui/material';
import ScoreViewOtherScores from './ScoreViewOtherScores';

const VIEWS = [
    {
        id: 'other-scores',
        name: 'Other Scores',
        component: ScoreViewOtherScores
    },
    {
        id: 'replay',
        name: 'Replay',
        component: ScoreViewReplay
    }
]

//Holds the extra data for a score (extra PP breakdown, replay info, etc)
function ScoreViewExtended({ score }) {
    const [activeView, setActiveView] = useState('other-scores');

    return (
        <div className={scoreViewStyles['score-view__extended']}>
            <div className={scoreViewStyles['score-view__extended__content']}>
                <div className={scoreViewStyles['score-view__extended__tabs']}>
                    {
                        VIEWS.map((view) => (
                            <div
                                key={view.id}
                                className={`${scoreViewStyles['score-view__extended__tab']} ${activeView === view.id ? scoreViewStyles['score-view__extended__tab--active'] : ''}`}
                                onClick={() => setActiveView(view.id)}
                            >
                                {view.name}
                            </div>
                        ))
                    }
                </div>

                <div className={scoreViewStyles['score-view__extended__tab-content']}>
                    {/* render all views with Fade component around them, that one handles what is displayed */}
                    {
                        VIEWS.map((view) => {
                            const ViewComponent = view.component;
                            return (
                                <Fade
                                    in={activeView === view.id}
                                    key={view.id}
                                    unmountOnExit
                                >
                                    <div>
                                        <ViewComponent score={score} active={activeView === view.id} />
                                    </div>
                                </Fade>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default ScoreViewExtended;