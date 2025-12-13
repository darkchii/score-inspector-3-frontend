import scoreViewStyles from '../../styles/score-view.module.less';
import ScoreViewBase from './ScoreViewBase';

function ScoreView({ score = null }) {
    return (
        <div className={scoreViewStyles['score-view']}>
            <div className={scoreViewStyles['score-view__backdrop']}>
                <ScoreViewBase score={score} />
            </div>
        </div>
    )
}

export default ScoreView;