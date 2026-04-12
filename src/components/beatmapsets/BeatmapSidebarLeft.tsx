import { Alert, Box, Card, CardContent, CardMedia, Chip, Collapse, Divider, Table, TableBody, tableCellClasses, TableContainer, tableRowClasses, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { GetRulesetIconFromId, GetRulesetPrettyNameFromId, GetStatusLabelFromInt } from "../../util/Helper";
import BetterTooltip from "../tooltips/BetterTooltip";
import DifficultyBadge from "../DifficultyBadge";
import BeatmapStatRow from "./BeatmapStatRow";
import BeatmapUserTag from "../BeatmapUserTag";
import type { IBeatmap, IBeatmapSet, IRouteBeatmapResult } from "../../types/types";

function BeatmapSidebarLeft({ data }: { data: IRouteBeatmapResult | null }) {
    const [mediaError, setMediaError] = useState(false);

    if(!data || !data.beatmapSet || !data.beatmap) {
        return null;
    }

    const cardImageUrl = useMemo(() => {
        const card2x = data.beatmapSet?.covers?.card_2x?.trim();
        const card = data.beatmapSet?.covers?.card?.trim();
        return card2x || card || "";
    }, [data.beatmapSet?.covers?.card, data.beatmapSet?.covers?.card_2x]);

    useEffect(() => {
        setMediaError(false);
    }, [cardImageUrl]);

    const hasValidCardImage = Boolean(cardImageUrl) && !mediaError;

    return (
        <>
            <Card sx={{ position: 'relative' }}>
                {
                    hasValidCardImage ? (
                        <CardMedia
                            component="img"
                            image={cardImageUrl}
                            alt={`${data.beatmapSet.artist} - ${data.beatmapSet.title}`}
                            onError={() => setMediaError(true)}
                            sx={{
                                aspectRatio: '20 / 7',
                                objectFit: 'cover',
                                width: '100%',
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                aspectRatio: '20 / 7',
                                width: '100%',
                                background: `
                                    radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 35%),
                                    radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 35%),
                                    linear-gradient(135deg, #263238 0%, #37474f 40%, #455a64 100%)
                                `,
                                display: 'flex',
                                alignItems: 'flex-end',
                                px: 2,
                                pb: 1.5,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    letterSpacing: 0.4,
                                    textTransform: 'uppercase',
                                    fontWeight: 600,
                                }}
                            >
                                No Cover Available
                            </Typography>
                        </Box>
                    )
                }
                <Box sx={{
                    position: 'absolute',
                    left: 8, top: 8,
                    display: 'flex', alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                }}>
                    <Typography variant="body2" color="white" sx={{ marginRight: 1 }}>
                        {GetStatusLabelFromInt(data.beatmap.status)}
                    </Typography>
                    <BetterTooltip title={`${GetRulesetPrettyNameFromId(data.beatmap.ruleset_id)}`}>
                        <img
                            src={GetRulesetIconFromId(data.beatmap.ruleset_id)}
                            style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '0.3em' }}
                        />
                    </BetterTooltip>
                    <DifficultyBadge difficulty={data.beatmap.stars} />
                </Box>
                {
                    <Collapse in={data.beatmap.convert} timeout="auto" unmountOnExit>
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
                            {data.beatmapSet.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {data.beatmapSet.artist}
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                            [{data.beatmap.version}]
                        </Typography>
                    </Box>
                    {/* <Divider sx={{ marginY: 2 }} /> */}
                    {
                        data.beatmapSet.preview_url ?
                            <Box sx={{ marginY: 2 }}>
                                <audio controls style={{ width: '100%' }}>
                                    <source src={data.beatmapSet.preview_url} type="audio/mpeg" />
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
                                    <BeatmapStatRow label="AR" value={data.beatmap.ar} enabled={data.beatmap.ruleset_id !== 3} />
                                    <BeatmapStatRow label="OD" value={data.beatmap.od} />
                                    <BeatmapStatRow label="HP" value={data.beatmap.hp} />
                                    <BeatmapStatRow label={
                                        //if mania, label is Keys, otherwise CS
                                        data.beatmap.ruleset_id === 3 ? "Keys" : "CS"
                                    } value={data.beatmap.cs} />
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                    {
                        (data.beatmap.user_tags || [])?.length > 0 && (
                            <>
                                <Divider sx={{ marginY: 2 }} />
                                <Box>
                                    {/* tags */}
                                    <Typography variant="h6">User Tags</Typography>
                                    <Box sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap'
                                    }}>
                                        {
                                            (data.beatmap.user_tags || []).map((tag) => (
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
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                            {
                                (data.beatmapSet.tags || []).map((tag) => (
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