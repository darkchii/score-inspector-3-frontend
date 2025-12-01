//Basically a Table wrapper, so all columns line up properly

import { Box, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography, useTheme } from "@mui/material";
import { getGradeIcon } from "../Data/Textures/TextureDatabase";
import { GetRulesetIconFromId, GetRulesetNameFromId, TimeAgo } from "../Misc/Helper";
import NumberFlow from "@number-flow/react";
import ModDisplay from "./ModDisplay";
import { grey } from "@mui/material/colors";

function ScoreList({ scores, onSelectScore }) {
    const theme = useTheme();

    return (
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
                    {scores?.map((score, index) => (
                        <TableRow
                            key={score.id}
                            data-id={score.id}
                            onClick={() => onSelectScore(score)}
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
                                        score.combo === score.beatmap.max_combo
                                            ? { color: '#4caf50', fontWeight: 'bold' }
                                            : {}
                                    )
                                }}>{score.combo.toLocaleString()}/{score.beatmap.max_combo.toLocaleString()}x</Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: '250px' }}>
                                <ModDisplay ruleset={GetRulesetNameFromId(score.ruleset_id)} mods={score.mods} />
                            </TableCell>
                            <TableCell sx={{ width: '80px' }}>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'rgba(238, 170, 0, 1)' }}><NumberFlow format={{ maximumFractionDigits: 2 }} value={score.accuracy * 100} suffix="%" /></Typography>
                            </TableCell>
                            <TableCell sx={{ width: '100px', textAlign: 'right', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                <Typography sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}><NumberFlow format={{ maximumFractionDigits: 2 }} value={score.pp || 0} suffix="pp" /></Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default ScoreList;