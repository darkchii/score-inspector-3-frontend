//Basically a Table wrapper, so all columns line up properly

import { Box, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography, useTheme } from "@mui/material";
import { getGradeIcon } from "../Assets/Textures/TextureDatabase";
import { FormatNumberWithPrecision, GetRulesetIconFromId, GetRulesetNameFromId, TimeAgo } from "../Misc/Helper";
import NumberFlow from "@number-flow/react";
import ModDisplay from "./ModDisplay";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useScoreView } from "../Providers/ScoreViewProvider";
import WarningIcon from '@mui/icons-material/Warning';
import DifficultyBadge from "./DifficultyBadge";
import { GetStarRating } from "../Misc/ScoreHelper";
import ClearIcon from '@mui/icons-material/Clear';

const truncateStep = 10;

function ScoreList({ startIndex = 0, showIndex = false, scores, onSelectScore, truncate = false, truncateStartStep = truncateStep }) {
    const { loadScoreView } = useScoreView();
    const theme = useTheme();
    const [displayCount, setDisplayCount] = useState(truncate ? truncateStartStep : scores?.length || 0);

    useEffect(() => {
        if (truncate) {
            setDisplayCount(truncateStartStep);
        } else {
            setDisplayCount(scores?.length || 0);
        }
    }, [truncate, scores?.length]);

    return (
        <>
            <TableContainer>
                <Table size="small" sx={{
                    [`& .${tableCellClasses.root}`]: {
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
                        {scores?.slice(0, displayCount).map((score, index) => (
                            <TableRow
                                key={score.id}
                                data-id={score.id}
                                onClick={() => loadScoreView(score)}
                                sx={{
                                    cursor: 'pointer',
                                    //content should be vertically centered and horizontally aligned to the left
                                    '& > *': {
                                        zIndex: 1,
                                        alignItems: 'center',
                                        verticalAlign: 'middle',
                                    },
                                    backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/cover.jpg)`,
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
                                }}
                            >
                                {showIndex &&
                                    <TableCell width={40}>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{startIndex + index + 1}</Typography>
                                    </TableCell>
                                }
                                {/* Ruleset Icon */}
                                <TableCell width={30}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                        <img src={GetRulesetIconFromId(score.ruleset_id)} alt={score.grade} width={20} height={20} />
                                    </Box>
                                </TableCell>
                                {/* Grade, should be as small as possible */}
                                <TableCell width={30}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                                        <img src={getGradeIcon(score.grade)} alt={score.grade} width={40} height={30} />
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{
                                        height: '100%',
                                        alignItems: 'center',
                                        maxWidth: '100%',
                                    }}>
                                        <Typography noWrap sx={{ fontSize: '0.8rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {score.beatmap.artist} - {score.beatmap.title}
                                        </Typography>
                                        <Typography noWrap sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            <span style={{ color: '#ea0' }}>{score.beatmap.version}</span> <span style={{ opacity: '0.7' }}>{TimeAgo(score.ended_at)}</span>
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ maxWidth: '100px' }}>
                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{score.total_score.toLocaleString()}</Typography>
                                    {
                                        (score.ruleset_id === 0 || score.ruleset_id === 2) &&
                                        <Typography sx={{ fontSize: '0.75rem', color: grey[300] }}>{score.classic_total_score.toLocaleString()}</Typography>
                                    }
                                </TableCell>
                                <TableCell>
                                    <Typography sx={{
                                        fontSize: '0.85rem',
                                        ...(
                                            score.combo === (score.attr_diff.max_combo || score.beatmap.max_combo)
                                                ? { color: '#4caf50', fontWeight: 'bold' }
                                                : {}
                                        )
                                    }}>{score.combo.toLocaleString()}/{(score.attr_diff.max_combo || score.beatmap.max_combo).toLocaleString()}x</Typography>
                                </TableCell>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DifficultyBadge difficulty={GetStarRating(score)} />
                                    </div>
                                </TableCell>
                                <TableCell sx={{ maxWidth: '250px' }}>
                                    <ModDisplay ruleset={GetRulesetNameFromId(score.ruleset_id)} mods={score.mods} />
                                </TableCell>
                                <TableCell sx={{ width: '80px' }}>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'rgba(238, 170, 0, 1)' }}>{FormatNumberWithPrecision(score.accuracy * 100, 2)}%</Typography>
                                </TableCell>
                                <TableCell sx={{ width: '100px', textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                                        {
                                            score.performance?.base?.pp !== undefined ?
                                                FormatNumberWithPrecision(score.performance.base.pp || 0, 2) + "pp"
                                                : <span style={{ color: grey[500] }}>{FormatNumberWithPrecision(score.pp || 0, 2) + "pp"}</span>

                                        }
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ width: '40px', textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                    {
                                        score.diff_missing ?
                                            <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: '1.2rem' }} />
                                            : null
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {
                truncate && displayCount < scores.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Typography sx={{ cursor: 'pointer', color: theme.palette.primary.main }} onClick={() => setDisplayCount(prev => Math.min(prev + truncateStep, scores.length))}>
                            Show more...
                        </Typography>
                    </Box>
                ) : null
            }
        </>
    )
}

export default ScoreList;