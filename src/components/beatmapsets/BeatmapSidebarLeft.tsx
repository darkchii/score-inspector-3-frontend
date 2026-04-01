import { Alert, Box, Card, CardContent, CardMedia, Chip, Collapse, Divider, Table, TableBody, tableCellClasses, TableContainer, tableRowClasses, Typography } from "@mui/material";
import { GetRulesetIconFromId, GetRulesetPrettyNameFromId, GetStatusLabelFromInt } from "../../util/Helper";
import BetterTooltip from "../tooltips/BetterTooltip";
import DifficultyBadge from "../DifficultyBadge";
import BeatmapStatRow from "./BeatmapStatRow";
import BeatmapUserTag from "../BeatmapUserTag";
import type { IBeatmap, IBeatmapSet } from "../../types/types";

function BeatmapSidebarLeft({ beatmapSet, beatmap }: { beatmapSet: IBeatmapSet, beatmap: IBeatmap }) {
    return (
        <>
            <Card sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    image={beatmapSet.covers ? beatmapSet.covers.card_2x : undefined}
                    alt={`${beatmapSet.artist} - ${beatmapSet.title}`}
                >
                </CardMedia>
                <Box sx={{
                    position: 'absolute',
                    left: 8, top: 8,
                    display: 'flex', alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                }}>
                    <Typography variant="body2" color="white" sx={{ marginRight: 1 }}>
                        {GetStatusLabelFromInt(beatmap.status)}
                    </Typography>
                    <BetterTooltip title={`${GetRulesetPrettyNameFromId(beatmap.ruleset_id)}`}>
                        <img
                            src={GetRulesetIconFromId(beatmap.ruleset_id)}
                            style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '0.3em' }}
                        />
                    </BetterTooltip>
                    <DifficultyBadge difficulty={beatmap.stars} />
                </Box>
                {
                    <Collapse in={beatmap.convert} timeout="auto" unmountOnExit>
                        <Alert
                            severity="warning"
                            sx={{
                                //center text
                                verticalAlign: 'middle',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            icon={false}
                        >
                            Map is a convert
                        </Alert>
                    </Collapse>
                }
                <CardContent>
                    <Box>
                        <Typography variant="h5" component="div">
                            {beatmapSet.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {beatmapSet.artist}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            [{beatmap.version}]
                        </Typography>
                    </Box>
                    {/* <Divider sx={{ marginY: 2 }} /> */}
                    {
                        beatmapSet.preview_url ?
                            <Box sx={{ marginY: 2 }}>
                                <audio controls style={{ width: '100%' }}>
                                    <source src={beatmapSet.preview_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </Box> : <Divider sx={{ marginY: 2 }} />
                    }
                    <Box>
                        <TableContainer>
                            <Table size="small" sx={{
                                [`& .${tableCellClasses.root}`]: {
                                    borderBottom: "none",
                                    color: 'white !important',
                                    padding: '2px'
                                },
                                [`& .${tableRowClasses.root}`]: {
                                    borderBottom: "none",
                                },
                            }}>
                                <TableBody>
                                    <BeatmapStatRow label="AR" value={beatmap.ar} enabled={beatmap.ruleset_id !== 3} />
                                    <BeatmapStatRow label="OD" value={beatmap.od} />
                                    <BeatmapStatRow label="HP" value={beatmap.hp} />
                                    <BeatmapStatRow label={
                                        //if mania, label is Keys, otherwise CS
                                        beatmap.ruleset_id === 3 ? "Keys" : "CS"
                                    } value={beatmap.cs} />
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {
                        (beatmap.user_tags || [])?.length > 0 && (
                            <>
                                <Divider sx={{ marginY: 2 }} />
                                <Box>
                                    {/* tags */}
                                    <Typography variant="h6">User Tags</Typography>
                                    <Box display="flex" flexWrap="wrap">
                                        {
                                            (beatmap.user_tags || []).map((tag) => (
                                                <BeatmapUserTag key={tag.id} tag={tag} />
                                            ))
                                        }
                                    </Box>
                                </Box>
                            </>
                        )
                    }
                    <Divider sx={{ marginY: 2 }} />
                    <Box>
                        {/* tags */}
                        <Typography variant="h6">Tags</Typography>
                        <Box display="flex" flexWrap="wrap">
                            {
                                (beatmapSet.tags || []).map((tag) => (
                                    <Chip key={tag} label={tag} sx={{ margin: 0.25 }} size='small' />
                                ))
                            }
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </>
    )
}

export default BeatmapSidebarLeft;