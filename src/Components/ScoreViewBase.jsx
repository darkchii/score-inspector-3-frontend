import { Avatar, Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import scoreViewStyles from '../Style/score-view.module.less';
import scoreInfoStyles from '../Style/score-info.module.less';
import scoreStatsStyles from '../Style/score-info.module.less';
import ScoreDial from './ScoreDial';
import { DateToString, FormatNumber, FormatNumberWithPrecision, GetRulesetIconFromId } from '../Misc/Helper';
import ModDisplay from './ModDisplay';
import DifficultyBadge from './DifficultyBadge';
import { GetHitResultColor, GetStarRating } from '../Misc/ScoreHelper';
import ScoreStat from './ScoreStat';
import { grey } from '@mui/material/colors';

function ScoreViewBase({ score }) {
    const theme = useTheme();

    return (
        <div className={scoreViewStyles['score-view__base']}>
            <div className={scoreViewStyles['score-view__base__user-data']}>
                <Avatar src={`https://a.ppy.sh/${score.user_id}`} alt="User Avatar" sx={{ width: 96, height: 96 }} variant='rounded' />
                <div className={scoreViewStyles['score-view__base__user-data__username']}>
                    <span>{score.user.osuApi.username}</span>
                </div>
            </div>
            <div className={scoreViewStyles['score-view__base__content']}>
                <div className={scoreViewStyles['score-view__base__background']} style={{
                    backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/fullsize.jpg)`,
                }} />
                <div className={scoreViewStyles['score-view__base__background__overlay']} />
                <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__title']}`}>
                        <span>{score.beatmap.title}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__artist']}`}>
                        <span>{score.beatmap.artist}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__dial']}`}>
                        <ScoreDial score={score} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__score']}`}>
                        <span>{FormatNumber(score.total_score)}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__subscore']}`}>
                        <span>{FormatNumber(score.implied_total_score)}</span>
                    </div>
                    {/* row flex */}
                    <div className={scoreInfoStyles['score-info']} style={{ display: 'flex', flexDirection: 'row', gap: '5px' }}>
                        <DifficultyBadge difficulty={GetStarRating(score)} />
                        <img src={GetRulesetIconFromId(score.ruleset_id)} alt="Ruleset Icon" style={{ width: '24px', height: '24px' }} />
                        <ModDisplay ruleset={score.ruleset} mods={score.mods} />
                    </div>
                    <div className={`${scoreInfoStyles['score-info']}`}>
                        <span className={scoreInfoStyles['score-info__version']}>{score.beatmap.version}</span>
                        <span>mapped by <span style={{ fontWeight: 'bold' }}>{score.beatmap.mapper || 'N/A'}</span></span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info__group']} ${scoreInfoStyles['score-info__group--stats']}`}>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            <ScoreStat label="Accuracy" value={`${FormatNumberWithPrecision(score.accuracy * 100, 2)}%`} />
                            <ScoreStat label="Max Combo" value={`${FormatNumber(score.combo)}`} limitValue={`${FormatNumber(score.attr_diff?.max_combo || score.beatmap.max_combo)}`} extraValue={score.combo === (score.attr_diff?.max_combo || score.beatmap.max_combo) ? 'Perfect' : null} extraClass={scoreStatsStyles['score-info__stat-row--perfect']} />
                            <ScoreStat label="PP" value={
                                score.performance?.base?.pp !== undefined ?
                                    FormatNumberWithPrecision(score.performance.base.pp || 0, 2) + "pp"
                                    : <span style={{ color: grey[500] }}>{FormatNumberWithPrecision(score.pp || 0, 2) + "pp"}</span>

                            } />

                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            {
                                (['mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Perfect" value={FormatNumber(score.statistics_perfect)} color={GetHitResultColor('perfect')[200]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'fruits', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Great" value={FormatNumber(score.statistics_great)} color={GetHitResultColor('great')[400]} />
                                )
                            }
                            {
                                (['mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Good" value={FormatNumber(score.statistics_good)} color={GetHitResultColor('good')[400]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="OK" value={FormatNumber(score.statistics_ok)} color={GetHitResultColor('ok')[500]} />
                                )
                            }
                            {
                                (['osu', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Meh" value={FormatNumber(score.statistics_meh)} color={GetHitResultColor('meh')[500]} />
                                )
                            }
                            {
                                (['osu', 'taiko', 'fruits', 'mania'].includes(score.ruleset)) && (
                                    <ScoreStat label="Miss" value={FormatNumber(score.statistics_miss)} color={GetHitResultColor('miss')[500]} />
                                )
                            }
                        </div>
                        <div className={scoreStatsStyles['score-info__group-row']}>
                            {
                                (['osu'].includes(score.ruleset)) && (
                                    <ScoreStat label="Slider Tick" value={FormatNumber(score.statistics_large_tick_hit)} limitValue={FormatNumber(score.maximum_statistics_large_tick_hit)} color={GetHitResultColor('large_tick_hit')[200]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset)) && (
                                    <ScoreStat label="Slider End" value={FormatNumber(score.statistics_small_tick_hit + score.statistics_slider_tail_hit)} limitValue={FormatNumber(score.maximum_statistics_small_tick_hit + score.maximum_statistics_slider_tail_hit)} color={GetHitResultColor('small_tick_hit')[200]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset)) && (
                                    <ScoreStat label="Spinner Bonus" value={FormatNumber(score.statistics_large_bonus)} limitValue={FormatNumber(score.maximum_statistics_large_bonus)} color={GetHitResultColor('large_bonus')[100]} />
                                )
                            }

                            {
                                (['osu'].includes(score.ruleset)) && (
                                    <ScoreStat label="Spinner Spin" value={FormatNumber(score.statistics_small_bonus)} limitValue={FormatNumber(score.maximum_statistics_small_bonus)} color={GetHitResultColor('small_bonus')[100]} />
                                )
                            }

                            {
                                (['fruits'].includes(score.ruleset)) && (
                                    <ScoreStat label="Small Droplet" value={FormatNumber(score.statistics_small_tick_hit)} limitValue={FormatNumber(score.maximum_statistics_small_tick_hit)} color={GetHitResultColor('small_tick_hit')[200]} />
                                )
                            }
                        </div>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>Played on {DateToString(score.ended_at)}</span>
                    </div>
                    <div className={`${scoreInfoStyles['score-info']} ${scoreInfoStyles['score-info__rankdate']}`}>
                        <span>ID: {score.id}</span>
                    </div>
                </Box>
            </div>
        </div >
    )
}

export default ScoreViewBase;