import { getDiffColour } from '../util/DifficultyHelper';
import { FormatNumberWithPrecision } from '../util/Helper';
import difficultyBadgeStyles from '../styles/difficulty-badge.module.less';
import StarIcon from '@mui/icons-material/Star';

function DifficultyBadge({ difficulty }) {
    return (
        <div
            style={{ '--bg': getDiffColour(difficulty) }}
            className={`${difficultyBadgeStyles['difficulty-badge']} ${difficulty >= 6.5 ? difficultyBadgeStyles['difficulty-badge--expert-plus'] : ''}`}
        >
            <StarIcon className={difficultyBadgeStyles['difficulty-badge__icon']}/>
            <span className={difficultyBadgeStyles['difficulty-badge__rating']}>{FormatNumberWithPrecision(difficulty, 2)}</span>
        </div>
    )
}

export default DifficultyBadge;