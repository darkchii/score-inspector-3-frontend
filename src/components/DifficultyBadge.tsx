import { getDiffColour, getDiffTextColour } from '../util/DifficultyHelper';
import { FormatNumberWithPrecision } from '../util/Helper';
import difficultyBadgeStyles from '../styles/difficulty-badge.module.less';
import StarIcon from '@mui/icons-material/Star';

type DifficultyBadgeStyleWithVars = React.CSSProperties & {
    '--bg'?: string;
    '--text'?: string;
};

function DifficultyBadge({ difficulty }: { difficulty: number | null }) {
    return (
        <div
            style={{ 
                '--bg': getDiffColour(difficulty),
                '--text': getDiffTextColour(difficulty)
            } as DifficultyBadgeStyleWithVars}
            className={`${difficultyBadgeStyles['difficulty-badge']} ${difficulty !== null && difficulty >= 6.5 ? difficultyBadgeStyles['difficulty-badge--expert-plus'] : ''}`}
        >
            <StarIcon className={difficultyBadgeStyles['difficulty-badge__icon']}/>
            <span className={difficultyBadgeStyles['difficulty-badge__rating']}>{difficulty !== null ? FormatNumberWithPrecision(difficulty, 2) : ''}</span>
        </div>
    )
}

export default DifficultyBadge;