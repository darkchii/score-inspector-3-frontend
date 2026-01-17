import { Box, Button, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { GetRulesetIconFromId, TimeAgo } from "../util/Helper";
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { green, red } from "@mui/material/colors";
import { getGradeIcon } from "../assets/textures/TextureDatabase";
import { useProfile } from "../providers/ProfileProvider";
import { useScoreView } from "../providers/ScoreViewProvider";
import LaunchIcon from '@mui/icons-material/Launch';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BetterTooltip from "./tooltips/BetterTooltip";
import DifficultyBadge from "./DifficultyBadge";

function BeatmapListRow({ beatmap, index, isCompact, isPlayed }) {
    const { getScoreById } = useProfile();
    const { loadScoreView } = useScoreView();
    const theme = useTheme();

    return (
        <TableRow
            key={beatmap.id}
            data-id={beatmap.id}
            // onClick={() => loadScoreView(score)}
            sx={{
                //content should be vertically centered and horizontally aligned to the left
                '& > *': {
                    zIndex: 2,
                    alignItems: 'center',
                    verticalAlign: 'middle',
                },
                backgroundImage: `url(https://assets.ppy.sh/beatmaps/${beatmap.beatmapset_id}/covers/cover.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundBlendMode: 'overlay',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    transform: 'scale(0.98)',
                    boxShadow: theme.shadows[4],
                },
                position: 'relative',
            }}
        >
            {
                isPlayed !== undefined && (
                    <React.Fragment>
                        <TableCell width={40}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                {isPlayed ? <DoneIcon style={{ color: green[500], fontSize: '1.2rem' }} /> : <CloseIcon style={{ color: red[500], fontSize: '1.2rem' }} />}
                            </Box>
                        </TableCell>
                        <TableCell width={30}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                                {
                                    isPlayed && (
                                        <>
                                            <img src={getGradeIcon(beatmap.score_data.grade)} alt={beatmap.score_data.grade} width={30} height={20} />
                                            {beatmap.score_data.is_pfc && <span style={{ marginLeft: 4, color: '#ffd700', fontWeight: 'bold' }}>PFC</span>}
                                            {(beatmap.score_data.is_fc && !beatmap.score_data.is_pfc) && <span style={{ marginLeft: 4, color: '#ffd700', fontWeight: 'bold' }}>FC</span>}
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
                    <img src={GetRulesetIconFromId(beatmap.ruleset_id)} alt={beatmap.ruleset_id} width={20} height={20} />
                </Box>
            </TableCell>
            <TableCell>
                <Box sx={{
                    height: '100%',
                    alignItems: 'center',
                    maxWidth: isCompact ? '230px' : '100%',
                }}>
                    <Typography noWrap sx={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {beatmap.artist} - {beatmap.title}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#ea0' }}>{beatmap.version}</span> <span style={{ opacity: '0.7' }}>{beatmap.status} {TimeAgo(beatmap.ranked_date)}</span>
                    </Typography>
                </Box>
            </TableCell>
            <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
                    <DifficultyBadge difficulty={beatmap.stars} />
                    {
                        beatmap.status === 'loved' &&
                        <BetterTooltip title="Loved">
                            <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: '1rem', marginLeft: '4px' }} />
                        </BetterTooltip>
                    }
                </div>
            </TableCell>
            <TableCell align="right">
                {
                    isPlayed ? (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                                const score = getScoreById(beatmap.score_data.score_id);
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
                        window.open(`https://osu.ppy.sh/beatmaps/${beatmap.beatmap_id}`, '_blank');
                    }}
                >
                    <LaunchIcon fontSize="small" />
                </Button>
            </TableCell>
        </TableRow>
    )
}

const truncateStep = 10;
export function BeatmapList({ startIndex = 0, showIndex = false, showPlayed = false, beatmaps, isCompact = false, truncate = false, truncateStartStep = truncateStep }) {
    const theme = useTheme();
    const [displayCount, setDisplayCount] = useState(truncate ? truncateStartStep : beatmaps?.length || 0);

    useEffect(() => {
        if (truncate) {
            setDisplayCount(truncateStartStep);
        } else {
            setDisplayCount(beatmaps?.length || 0);
        }
    }, [truncate, beatmaps?.length]);

    return (
        <>
            <TableContainer>
                <Table size="small" sx={{
                    [`& .${tableCellClasses.root}`]: {
                        borderBottom: "none",
                        color: 'white !important',
                        //reduce all padding
                        paddingLeft: theme.spacing(1),
                        paddingRight: theme.spacing(1),
                    },
                    [`& .${tableRowClasses.root}`]: {
                        borderBottom: "none",
                    },
                    borderCollapse: 'separate',
                    borderSpacing: '0 8px',
                }}>
                    <TableBody sx={{
                        position: 'relative',
                        ['& .MuiTableRow-root']: {
                            borderRadius: theme.shape.borderRadius,
                        },
                    }}>
                        {beatmaps?.slice(0, displayCount).map((beatmap, index) => (
                            <BeatmapListRow key={beatmap.id} beatmap={beatmap} index={index} isPlayed={!showPlayed ? undefined : (beatmap.is_played || false)} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}