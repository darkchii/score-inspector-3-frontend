import scoreViewStyles from '../../styles/score-view.module.less';
import ScoreViewBase from './ScoreViewBase';

function ScoreView({ score = null, noBackground = false, compact = false }) {
    return (
        <div className={scoreViewStyles['score-view']}>
            <div className={scoreViewStyles['score-view__backdrop']}>
                <ScoreViewBase score={score} noBackground={noBackground} compact={compact} />
            </div>
        </div>
    )
}

export default ScoreView;