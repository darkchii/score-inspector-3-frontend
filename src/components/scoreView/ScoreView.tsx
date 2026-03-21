import scoreViewStyles from '../../styles/score-view.module.less';
import type { IScore } from '../../types/types';
import ScoreViewBase from './ScoreViewBase';

function ScoreView({ score, noBackground = false, compact = false }: { score: IScore | null, noBackground?: boolean, compact?: boolean }) {
    return (
        <div className={scoreViewStyles['score-view']}>
            <div className={scoreViewStyles['score-view__backdrop']}>
                <ScoreViewBase score={score} noBackground={noBackground} compact={compact} />
            </div>
        </div>
    )
}

export default ScoreView;