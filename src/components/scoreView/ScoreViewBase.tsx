import { Avatar, Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import scoreViewStyles from '../../styles/score-view.module.less';
import scoreInfoStyles from '../../styles/score-info.module.less';
import scoreStatsStyles from '../../styles/score-info.module.less';
import ScoreDial from '../ScoreDial';
import { DateToString, FormatNumber, FormatNumberWithPrecision, GetRulesetIconFromId } from '../../util/Helper';
import ModDisplay from '../ModDisplay';
import DifficultyBadge from '../DifficultyBadge';
import { GetHitResultColor, GetStarRating } from '../../util/ScoreHelper';
import ScoreStat from '../ScoreStat';
import { grey } from '@mui/material/colors';
import BetterTooltip from '../tooltips/BetterTooltip';
import NumberFlow from '@number-flow/react';
import React from 'react';
import { Link } from "react-router";
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { IScore } from '../../types/types';

function ScoreViewBase({ score, noBackground = false, compact = false }: { score: IScore | null; noBackground?: boolean; compact?: boolean }) {
    const theme = useTheme();

    if (!score?.beatmap || !score?.user) {
        return (
            <div className={scoreViewStyles['score-view__base']}>
                <div className={scoreViewStyles['score-view__base__user-data']}>
                    <Typography variant="h6">Score data is incomplete for some unknown reason.</Typography>
                </div>
            </div>
        );
    }

    return (
        <div className={scoreViewStyles['score-view__base']}>
            {!compact &&
                <div className={scoreViewStyles['score-view__base__user-data']}>
                    <Avatar src={`https://a.ppy.sh/${score.user_id}`} alt="User Avatar" sx={{ width: 96, height: 96 }} variant='rounded' />
                    <div className={scoreViewStyles['score-view__base__user-data__username']}>
                        <span>{score.user?.osuApi?.username || 'Unknown User'}</span>
                    </div>
                </div>
            }
            <div className={scoreViewStyles['score-view__base__content']}>
                <div className={scoreViewStyles['score-view__base__background']} style={{
                    backgroundImage: noBackground ? undefined : `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/fullsize.jpg)`,
                }} />
                <div className={scoreViewStyles['score-view__base__background__overlay']} />
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {!compact &&
                        <React.Fragment>
                            <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__title']}`}>
                                <span>{score.beatmap.title}</span>
                            </div>
                            <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__artist']}`}>
                                <span>{score.beatmap.artist}</span>
                            </div>
                        </React.Fragment>
                    }
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__dial']}`}>
                        <ScoreDial score={score} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__score']}`}>
                        <span>{<NumberFlow value={score.total_score} />}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__subscore']}`}>
                        <span>{<NumberFlow value={score.implied_total_score ?? 0} />}</span>
                    </div>
                    {/* row flex */}
                    <div className={scoreInfoStyles['score-info']} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <DifficultyBadge difficulty={GetStarRating(score)} />
                        {
                            score.beatmap.status === 'loved' &&
                            <BetterTooltip title="Loved">
                                <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: '1.5rem' }} />
                            </BetterTooltip>
                        }
                        <img src={GetRulesetIconFromId(score.ruleset_id)} alt="Ruleset Icon" style={{ width: '24px', height: '24px' }} />
                        <ModDisplay ruleset={score.ruleset} mods={score.mods} />
                    </div>
                    {!compact &&
                        <div className={`${scoreInfoStyles['score-info']}`}>
                            <span className={scoreInfoStyles['score-info__version']}>{score.beatmap.version}</span>
                            <span>mapped by <span style={{ fontWeight: 'bold' }}>{score.beatmap.mapper || 'N/A'}</span></span>
                        </div>
                    }
                    <div className={`${scoreInfoStyles['score-info__group']} ${scoreInfoStyles['score-info__group--stats']}`}>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Accuracy" value={<NumberFlow format={{ maximumFractionDigits: 2 }} value={score.accuracy * 100} suffix='%' />} />
                            <ScoreStat label="Max Combo" value={<NumberFlow value={score.combo} />} limitValue={`${FormatNumber(score.attr_diff?.max_combo || score.beatmap.max_combo)}`} extraValue={score.combo === (score.attr_diff?.max_combo || score.beatmap.max_combo) ? 'Perfect' : null} extraClass={scoreStatsStyles['score-info__stat-row--perfect']} />
                            <ScoreStat label="PP" value={
                                <BetterTooltip title={`${FormatNumberWithPrecision(score.implied_pp, 3)}pp`} placement="top">
                                    {
                                        score.performance?.base?.pp !== undefined ?
                                            <NumberFlow format={{ maximumFractionDigits: 0 }} value={score.implied_pp} suffix='pp' />
                                            : <span style={{ color: grey[500] }}><NumberFlow format={{ maximumFractionDigits: 0 }} value={score.implied_pp} suffix='pp' /></span>
                                    }
                                </BetterTooltip>

                            } />

                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            {
                                (['mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Perfect" value={<NumberFlow value={score.statistics_perfect} />} color={GetHitResultColor('perfect')[200]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'fruits', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Great" value={<NumberFlow value={score.statistics_great} />} color={GetHitResultColor('great')[400]} />
                                )
                            }
                            {
                                (['mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Good" value={<NumberFlow value={score.statistics_good} />} color={GetHitResultColor('good')[400]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="OK" value={<NumberFlow value={score.statistics_ok} />} color={GetHitResultColor('ok')[500]} />
                                )
                            }
                            {
                                (['osu', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Meh" value={<NumberFlow value={score.statistics_meh} />} color={GetHitResultColor('meh')[500]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'fruits', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Miss" value={<NumberFlow value={score.statistics_miss} />} color={GetHitResultColor('miss')[500]} />
                                )
                            }
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            {
                                (['osu'].includes(score.ruleset) && score.is_lazer) && (
                                    <ScoreStat label="Slider Tick" value={<NumberFlow value={score.statistics_large_tick_hit} />} limitValue={FormatNumber(score.maximum_statistics_large_tick_hit)} color={GetHitResultColor('large_tick_hit')[200]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset) && score.is_lazer) && (
                                    <ScoreStat label="Slider End" value={<NumberFlow value={score.statistics_small_tick_hit + score.statistics_slider_tail_hit} />} limitValue={FormatNumber(score.maximum_statistics_small_tick_hit + score.maximum_statistics_slider_tail_hit)} color={GetHitResultColor('small_tick_hit')[200]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset) && score.is_lazer) && (
                                    <ScoreStat label="Spinner Bonus" value={<NumberFlow value={score.statistics_large_bonus} />} limitValue={FormatNumber(score.maximum_statistics_large_bonus)} color={GetHitResultColor('large_bonus')[100]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset) && score.is_lazer) && (
                                    <ScoreStat label="Spinner Spin" value={<NumberFlow value={score.statistics_small_bonus} />} limitValue={FormatNumber(score.maximum_statistics_small_bonus)} color={GetHitResultColor('small_bonus')[100]} />
                                )
                            }

                            {
                                (['fruits'].includes(score.ruleset)) && (
                                    <ScoreStat label="Small Droplet" value={<NumberFlow value={score.statistics_small_tick_hit} />} limitValue={FormatNumber(score.maximum_statistics_small_tick_hit)} color={GetHitResultColor('small_tick_hit')[200]} />
                                )
                            }
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label={score.ruleset === 'mania' ? "Keys" : "CS"} value={<NumberFlow value={score.beatmap_attributes.cs} />} />
                            <ScoreStat label="OD" value={<NumberFlow value={score.beatmap_attributes.od} />} />
                            <ScoreStat label="HP" value={<NumberFlow value={score.beatmap_attributes.hp} />} />
                            <ScoreStat label="AR" value={<NumberFlow value={score.beatmap_attributes.ar} />} />
                        </div>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>Played on {DateToString(score.ended_at)}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <Link className={`${scoreViewStyles['score-view__base__link']}`} to={`/score/${score.id}`} target="_blank">ID: {score.id}</Link>
                    </div>
                </Box>
            </div>
        </div >
    )
}

export default ScoreViewBase;