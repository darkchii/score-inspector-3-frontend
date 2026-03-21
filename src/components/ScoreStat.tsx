import { ReactElement } from 'react';
import scoreStatsStyles from '../styles/score-info.module.less';

function ScoreStat({ label, value, limitValue = null, color = null, extraValue = null, extraClass = null }: {
    label: string,
    value: ReactElement,
    limitValue?: ReactElement | string | null,
    color?: string | null,
    extraValue?: number | string | null,
    extraClass?: string | null
}) {
    return (<div className={scoreStatsStyles['score-info__stat']}>
        <div className={`${scoreStatsStyles['score-info__stat-row']} ${scoreStatsStyles['score-info__stat-row--label']}`} style={{ color: color ? color : 'inherit' }}>
            {label}
        </div>
        <div className={`${scoreStatsStyles['score-info__stat-row']}`}>
            {value}
            {
                (limitValue !== null) && (
                    <span className={scoreStatsStyles['score-info__stat-row--maximum']}> /{limitValue}</span>
                )
            }
            {
                (extraValue !== null) && (
                    <span className={`${extraClass ? extraClass : ''}`}> {extraValue}</span>
                )
            }
        </div>
    </div>)
}

export default ScoreStat;