import { getDiffColour, getDiffTextColour } from '../util/DifficultyHelper';
import { FormatNumberWithPrecision } from '../util/Helper';
import difficultyBadgeStyles from '../styles/difficulty-badge.module.less';
import StarIcon from '@mui/icons-material/Star';
import NumberFlow from '@number-flow/react';

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
            className={`${difficultyBadgeStyles['difficulty-badge']}`}
        >
            <StarIcon className={difficultyBadgeStyles['difficulty-badge__icon']}/>
            {/* <span className={difficultyBadgeStyles['difficulty-badge__rating']}>{difficulty !== null ? FormatNumberWithPrecision(difficulty, 2) : ''}</span> */}
            <NumberFlow
                value={difficulty !== null ? difficulty : 0}
                className={difficultyBadgeStyles['difficulty-badge__rating']}
                format={{ 
                    notation: 'compact', 
                    maximumFractionDigits: 2, 
                    minimumFractionDigits: 2
                }}
            />
        </div>
    )
}

export default DifficultyBadge;