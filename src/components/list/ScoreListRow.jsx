import { Avatar, Box, TableCell, TableRow, Typography, useTheme } from "@mui/material";
import { FormatNumberWithPrecision, getContrastColor, GetRulesetIconFromId, GetRulesetNameFromId, TimeAgo } from "../../util/Helper";
import ItemListRowBase from "./ItemListRowBase";
import { useScoreView } from "../../providers/ScoreViewProvider";
import { getGradeIcon } from "../../assets/textures/TextureDatabase";
import { GetStarRating } from "../../util/ScoreHelper";
import DifficultyBadge from "../DifficultyBadge";
import BetterTooltip from "../tooltips/BetterTooltip";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ModDisplay from "../ModDisplay";
import WarningIcon from '@mui/icons-material/Warning';
import React from "react";
import { grey } from "@mui/material/colors";

function ScoreListRow({ item, index, isCompact = false, showIndex = true, startIndex = 0, leaderboardField = null, leaderboardFormat = null }) {
    const theme = useTheme();
    const { loadScoreView } = useScoreView();

    return (
        <ItemListRowBase
            cover_url={`https://assets.ppy.sh/beatmaps/${item.beatmap.beatmapset_id}/covers/cover.jpg` || ''}
            index={index}
            isCompact={isCompact}
            showIndex={showIndex}
            startIndex={startIndex}
            leaderboardField={leaderboardField}
            leaderboardFormat={leaderboardFormat}
            item={item}
            onClick={() => loadScoreView(item)}
        >
            {/* Ruleset Icon */}
            {
                isCompact ? <TableCell>
                    {/* show ruleset icon and grade under each other */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <img src={GetRulesetIconFromId(item.ruleset_id)} alt={item.grade} width={20} height={20} />
                        <img src={getGradeIcon(item.grade)} alt={item.grade} width={30} height={20} />
                    </Box>
                </TableCell> :
                    <React.Fragment>
                        <TableCell width={20}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                <img src={GetRulesetIconFromId(item.ruleset_id)} alt={item.grade} width={20} height={20} />
                            </Box>
                        </TableCell>
                        {/* Grade, should be as small as possible */}
                        <TableCell width={30}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                <img src={getGradeIcon(item.grade)} alt={item.grade} width={30} height={20} />
                            </Box>
                        </TableCell>
                    </React.Fragment>
            }

            <TableCell>
                <Box sx={{
                    height: '100%',
                    alignItems: 'center',
                    maxWidth: isCompact ? '230px' : '100%',
                }}>
                    <Typography noWrap sx={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.beatmap.artist} - {item.beatmap.title}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#ea0' }}>{item.beatmap.version}</span> <span style={{ opacity: '0.7' }}>{TimeAgo(item.ended_at)}</span>
                    </Typography>
                    {
                        isCompact &&
                        <ModDisplay ruleset={GetRulesetNameFromId(item.ruleset_id)} mods={item.mods} />
                    }
                </Box>
            </TableCell>

            <TableCell sx={{ maxWidth: '100px' }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.total_score.toLocaleString()}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: grey[300] }}>{item.implied_total_score.toLocaleString()}</Typography>
            </TableCell>

            <TableCell>
                <Typography sx={{
                    fontSize: '0.85rem',
                    ...(
                        item.combo === (item.attr_diff?.max_combo || item.beatmap.max_combo)
                            ? { color: '#4caf50', fontWeight: 'bold' }
                            : {}
                    )
                }}>{item.combo.toLocaleString()}/{(item.attr_diff?.max_combo || item.beatmap.max_combo).toLocaleString()}x</Typography>
            </TableCell>

            <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <DifficultyBadge difficulty={GetStarRating(item)} />
                    {
                        item.beatmap.status === 'loved' &&
                        <BetterTooltip title="Loved">
                            <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: '1rem', marginLeft: '4px' }} />
                        </BetterTooltip>
                    }
                </div>
            </TableCell>

            {
                !isCompact &&
                <TableCell sx={{ maxWidth: '250px' }}>
                    <ModDisplay ruleset={GetRulesetNameFromId(item.ruleset_id)} mods={item.mods} />
                </TableCell>
            }

            <TableCell sx={{ width: '80px' }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'rgba(238, 170, 0, 1)' }}>{FormatNumberWithPrecision(item.accuracy * 100, 2)}%</Typography>
            </TableCell>

            <TableCell sx={{ width: '100px', textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {
                        item.performance?.base?.pp !== undefined ?
                            FormatNumberWithPrecision(item.implied_pp, 2) + "pp"
                            : <span style={{ color: grey[500] }}>{FormatNumberWithPrecision(item.implied_pp, 2) + "pp"}</span>

                    }
                </Typography>
            </TableCell>

            <TableCell sx={{ width: '40px', textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                {
                    item.diff_missing ?
                        <BetterTooltip title="This score is missing difficulty attributes, data is likely incorrect.">
                            <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
                        </BetterTooltip>
                        : null
                }
            </TableCell>
        </ItemListRowBase>
    )
}

export default ScoreListRow;