import { getDiffColour, getDiffTextColour } from '../util/DifficultyHelper';
import { FormatNumberWithPrecision } from '../util/Helper';
import difficultyBadgeStyles from '../styles/difficulty-badge.module.less';
import StarIcon from '@mui/icons-material/Star';
import NumberFlow from '@number-flow/react';
import BetterTooltip from './tooltips/BetterTooltip';

type DifficultyBadgeStyleWithVars = React.CSSProperties & {
    '--bg'?: string;
    '--text'?: string;
};

function DifficultyBadge({ difficulty, original_difficulty }: { difficulty: number | null; original_difficulty?: number | null }) {
    return (
        <BetterTooltip title={
            //show another DifficultyBadge with original_difficulty if set
            original_difficulty !== null && original_difficulty?.toFixed(2) !== difficulty?.toFixed(2) && original_difficulty !== undefined && !isNaN(original_difficulty) ? (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                    <span style={{ paddingRight: '4px' }}>Unmodded:</span>
                    <DifficultyBadge difficulty={original_difficulty!} original_difficulty={null} />
                </div>) : null
        }>
            <div
                style={{
                    '--bg': getDiffColour(difficulty),
                    '--text': getDiffTextColour(difficulty)
                } as DifficultyBadgeStyleWithVars}
                className={`${difficultyBadgeStyles['difficulty-badge']}`}
            >
                <StarIcon className={difficultyBadgeStyles['difficulty-badge__icon']} />
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
        </BetterTooltip>
    )
}

export default DifficultyBadge;