import { Box, Button, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState, memo } from "react";
import { GetRulesetIconFromId, TimeAgo } from "../../util/Helper";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { green, red } from "@mui/material/colors";
import { getGradeIcon } from "../../assets/textures/TextureDatabase";
import LaunchIcon from '@mui/icons-material/Launch';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BetterTooltip from "../tooltips/BetterTooltip";
import DifficultyBadge from "../DifficultyBadge";
import ItemListRowBase from "./ItemListRowBase";
import type { ItemListRowBaseProps } from "./ItemListRowBase";
import { useScoreView } from "../../providers/ScoreViewProvider";
import { useProfile } from "../../providers/ProfileProvider";
import type { IBeatmap } from "../../types/types";
import { useNavigate } from "react-router";
import { GenerateUrl, routeData } from "../../util/RouteHelper";

type BeatmapListItem = IBeatmap & {
    score_data?: {
        grade?: string;
        is_pfc?: boolean;
        is_fc?: boolean;
        score_id?: number;
    };
};

interface BeatmapListRowProps extends Omit<ItemListRowBaseProps<BeatmapListItem>, "cover_url" | "children" | "onClick"> {
    isCompact?: boolean;
    showPlayed?: boolean;
}

const BeatmapListRow = memo(function BeatmapListRow({
    item,
    index,
    showPlayed = false,
    isCompact = false,
    showIndex = true,
    startIndex = 0,
    leaderboardField = null,
    secondaryLeaderboardField = null,
    secondaryFieldColor = null,
    leaderboardFormat = null,
    ...props
}: BeatmapListRowProps) {
    const theme = useTheme();
    const { getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();
    const navigate = useNavigate();

    if (!item) {
        return null;
    }

    return (
        <ItemListRowBase
            cover_url={`https://assets.ppy.sh/beatmaps/${item.beatmapset_id}/covers/cover.jpg` || ''}
            index={index}
            isCompact={isCompact}
            showIndex={showIndex}
            startIndex={startIndex}
            leaderboardField={leaderboardField}
            secondaryLeaderboardField={secondaryLeaderboardField}
            secondaryFieldColor={secondaryFieldColor}
            leaderboardFormat={leaderboardFormat}
            item={item}
            {...props}
        >
            {
                showPlayed && (
                    <React.Fragment>
                        <TableCell width={40}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                {item.is_played ? <DoneIcon style={{ color: green[500], fontSize: '1.2rem' }} /> : <CloseIcon style={{ color: red[500], fontSize: '1.2rem' }} />}
                            </Box>
                        </TableCell>
                        <TableCell width={30}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                {
                                    item.is_played && (
                                        <>
                                            <img src={getGradeIcon(item.score_data.grade) ?? ''} alt={item.score_data.grade} width={30} height={20} />
                                            {item.score_data.is_pfc && <span style={{ marginLeft: 4, color: '#ffd700', fontWeight: 'bold' }}>PFC</span>}
                                            {(item.score_data.is_fc && !item.score_data.is_pfc) && <span style={{ marginLeft: 4, color: '#ffd700', fontWeight: 'bold' }}>FC</span>}
                                        </>
                                    )
                                }
                            </Box>
                        </TableCell>
                    </React.Fragment>
                )

            }

            <TableCell width={20}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                    <img src={GetRulesetIconFromId(item.ruleset_id)} alt={`${item.ruleset_id}`} width={20} height={20} />
                </Box>
            </TableCell>

            <TableCell>
                <Box sx={{
                    height: '100%',
                    alignItems: 'center',
                    maxWidth: isCompact ? '230px' : '100%',
                }}>
                    <Typography noWrap sx={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.artist} - {item.title}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#ea0' }}>{item.version}</span> <span style={{ opacity: '0.7' }}>{item.status} {item.ranked_date ? TimeAgo(item.ranked_date) : ''}</span>
                    </Typography>
                </Box>
            </TableCell>

            <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <DifficultyBadge difficulty={item.stars} />
                    {
                        item.status === 'loved' &&
                        <BetterTooltip title="Loved">
                            <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: '1rem', marginLeft: '4px' }} />
                        </BetterTooltip>
                    }
                </div>
            </TableCell>

            <TableCell align="right">
                {
                    (showPlayed && item.is_played) ? (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                const score = getScoreById(item.score_data.score_id);
                                if (score) {
                                    loadScoreView(score);
                                }
                            }}
                        >
                            View
                        </Button>
                    ) : null
                }
                <Button
                    variant="text"
                    size="small"
                    onClick={() => {
                        const url = GenerateUrl(routeData.routeBeatmapsets.path, { beatmapsetId: item.beatmapset_id, ruleset: item.ruleset, beatmapId: item.id });
                        window.open(url, '_blank');
                        // window.open(`https://osu.ppy.sh/beatmaps/${item.beatmap_id}`, '_blank');
                        // navigate(`/beatmapset/${item.beatmapset_id}/${item.ruleset}/${item.beatmap_id}`);
                    }}
                >
                    <LaunchIcon fontSize="small" />
                </Button>
            </TableCell>
        </ItemListRowBase>
    )
});

export default BeatmapListRow;