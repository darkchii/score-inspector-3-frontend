import { Typography } from "@mui/material";
import React from "react";
import NumberFlow from "@number-flow/react";
import ItemList from "../list/ItemList";
import ScoreListRow from "../list/ScoreListRow";
import type { IPerformanceCalculatorOsu, IScore } from "../../types/types";
import scoreInfoStyles from '../../styles/score-info.module.less';
import scoreStatsStyles from '../../styles/score-info.module.less';
import ScoreStat from "../ScoreStat";

function ScoreViewAttributes({ score, active = null }: {
    score: IScore | null,
    active: boolean | null
}) {
    if (active === false) return null;
    if (!score?.beatmap) return null;

    if (!score.performance?.base || score.diff_missing) {
        return (
            <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                style={{ marginTop: '1em' }}
            >
                No difficulty or performance attributes available for this score.
            </Typography>
        )
    }

    return (
        <div>
            <SubsetPerformanceContainer score={score} active={active} />
            <SubsetDifficultyContainer score={score} active={active} />
        </div>
    )
}

function SubsetPerformanceContainer({ score, active = null }: {
    score: IScore | null,
    active: boolean | null
}) {
    if (active === false) return null;
    if (!score?.beatmap || !score.performance?.base?.pp) return null;

    return (
        <div>
            <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__subscore']}`}>
                <span>Performance</span>
            </div>
            <div className={`${scoreInfoStyles['score-info__group']} ${scoreInfoStyles['score-info__group--stats']}`}>
                <div className={scoreStatsStyles['score-info__group-row']}>
                    <ScoreStat label="Total" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.performance?.base?.pp} suffix='pp' />} />
                </div>
                {
                    //ruleset specific performance values (score.ruleset_id)
                    (score.ruleset_id === 0) && <SubsetOsuPerformanceValues score={score} />
                }
            </div>
        </div>
    )
}

function SubsetOsuPerformanceValues({ score }: { score: IScore }) {
    if (!score.performance?.base?.calculator) {
        return null;
    }

    let perf: IPerformanceCalculatorOsu = score.performance.base.calculator as IPerformanceCalculatorOsu;

    return (
        <React.Fragment>
            <div className={scoreStatsStyles['score-info__group-row']}>
                <ScoreStat label="Aim" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.aimValue} suffix='pp' />} />
                <ScoreStat label="Speed" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.speedValue} suffix='pp' />} />
                <ScoreStat label="Accuracy" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.accuracyValue} suffix='pp' />} />
            </div>
            <div className={scoreStatsStyles['score-info__group-row']}>
                <ScoreStat label="Flashlight" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.flashlightValue} suffix='pp' />} />
                <ScoreStat label="Reading" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.readingValue} suffix='pp' />} />
                <ScoreStat label="Cognition" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={perf.cognitionValue} suffix='pp' />} />
            </div>
        </React.Fragment>
    )
}

function SubsetDifficultyContainer({ score, active = null }: {
    score: IScore | null,
    active: boolean | null
}) {
    if (active === false) return null;
    if (!score?.beatmap) return null;

    if (!score.attr_diff) {
        return (
            <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                style={{ marginTop: '1em' }}
            >
                No difficulty attributes available for this score.
            </Typography>
        )
    }

    return (
        <div>
            <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__subscore']}`}>
                <span>Difficulty</span>
            </div>
            <div className={`${scoreInfoStyles['score-info__group']} ${scoreInfoStyles['score-info__group--stats']}`}>
                <div className={scoreStatsStyles['score-info__group-row']}>
                    <ScoreStat label="Starrating" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.star_rating} suffix='★' />} />
                </div>
                {
                    //ruleset specific performance values (score.ruleset_id)
                    (score.ruleset_id === 0) && (<React.Fragment>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Aim" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.aim_difficulty} suffix='★' />} />
                            <ScoreStat label="Speed" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.speed_difficulty} suffix='★' />} />
                            <ScoreStat label="Flashlight" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.flashlight_difficulty} suffix='★' />} />
                            <ScoreStat label="Reading" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.reading_difficulty} suffix='★' />} />
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Difficult Aim Sliders" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.aim_difficult_slider_count} />} />
                            <ScoreStat label="Difficult Aim Strains" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.aim_difficult_strain_count} />} />
                            <ScoreStat label="Top Weighted Aim Slider Factor" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.aim_top_weighted_slider_factor} />} />
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Difficult Speed Sliders" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.speed_difficult_slider_count} />} />
                            <ScoreStat label="Difficult Speed Strains" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.speed_difficult_strain_count} />} />
                            <ScoreStat label="Top Weighted Speed Slider Factor" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.speed_top_weighted_slider_factor} />} />
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Speed Notes" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.speed_note_count} />} />
                            <ScoreStat label="Difficult Reading Notes" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.reading_difficult_note_count} />} />
                            <ScoreStat label="Slider Factor" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.slider_factor} />} />
                        </div>
                    </React.Fragment>)
                }
                {
                    (score.ruleset_id === 1) && (<React.Fragment>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Rhythm" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.rhythm_difficulty} suffix='★' />} />
                            <ScoreStat label="Consistency Factor" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.consistency_factor} />} />
                            <ScoreStat label="Mono Stamina Factor" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.attr_diff?.mono_stamina_factor}/>} />
                        </div>
                    </React.Fragment>)
                }
            </div>
        </div>
    )
}

export default ScoreViewAttributes;