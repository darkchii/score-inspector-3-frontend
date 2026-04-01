import { Alert, Box, Button, ButtonGroup, Card, CardContent, CardHeader, CardMedia, Chip, CircularProgress, Collapse, Container, Divider, Grid, LinearProgress, Paper, Stack, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableRow, tableRowClasses, Typography, useTheme } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import type { IBeatmap, IBeatmapSet } from "../types/types";
import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import BeatmapSet from "../types/beatmaps/BeatmapSet";
import RulesetSelector from "../components/RulesetSelector";
import DifficultyBadge from "../components/DifficultyBadge";
import BeatmapUserTag from "../components/BeatmapUserTag";
import PlayerLink from "../components/PlayerLink";
import { FormatNumber, FormatNumberWithPrecision, GetRulesetIconFromId, GetRulesetNameFromId, GetRulesetPrettyNameFromId, GetStatusLabelFromInt, ShowNotification } from "../util/Helper";
import BetterTooltip from "../components/tooltips/BetterTooltip";
import { yellow } from "@mui/material/colors";
import { getDiffColour } from "../util/DifficultyHelper";
import HtmlDisplay from "../components/HtmlDisplay";
import YoutubeEmbed from "../components/YoutubeEmbed";

interface RouteBeatmapResult {
    beatmapSet: IBeatmapSet | null;
    beatmap: IBeatmap | null;
    ruleset: string;
}

//used to navigate between beatmaps
const nav_format = '/beatmapsets/{beatmapsetId}/{ruleset}/{beatmapId}';
const generateNavUrl = (beatmapsetId: number, ruleset: string, beatmapId: number) => {
    return nav_format.replace('{beatmapsetId}', beatmapsetId.toString()).replace('{ruleset}', ruleset).replace('{beatmapId}', beatmapId.toString());
}
function RouteBeatmap() {
    const navigate = useNavigate();
    const { beatmapsetId, ruleset, beatmapId } = useParams();
    const { getBeatmapSet } = useApi();
    const [data, setData] = useState<RouteBeatmapResult | null>(null);
    // const { setTitle } = usePageTitle();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!beatmapsetId) return;
        (async () => {
            setIsLoading(true);
            try {
                let _ruleset = ruleset ? ruleset.toLowerCase() : "osu";
                if (!["osu", "taiko", "fruits", "mania"].includes(_ruleset)) {
                    setError("Invalid ruleset");
                    return;
                }

                let beatmapSet = null;
                if (data?.beatmapSet?.beatmapset_id === parseInt(beatmapsetId)) {
                    beatmapSet = data.beatmapSet;
                } else {
                    const response = await getBeatmapSet(beatmapsetId);
                    beatmapSet = new BeatmapSet(response);
                }

                let beatmap: IBeatmap | null = null;
                if (beatmapId) {
                    //find beatmap with matching id and ruleset
                    beatmap = beatmapSet.all_beatmaps.find((b) => b.id === parseInt(beatmapId) && b.ruleset.toLowerCase() === _ruleset) || null;
                }

                if (!beatmap) {
                    beatmap = beatmapSet.beatmaps[0] || null;
                    _ruleset = beatmap.ruleset.toLowerCase();
                }

                if (!beatmap) {
                    setError("Beatmap not found for this ruleset");
                    return;
                }

                const _data: RouteBeatmapResult = {
                    beatmapSet,
                    beatmap,
                    ruleset: _ruleset,
                }
                console.log("Loaded beatmap data:", _data);
                setData(_data);
            } catch (err) {
                console.error(err);
                setError("Failed to load beatmap");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [beatmapsetId, ruleset, beatmapId]);

    useEffect(() => {
        //if proper data, adjust the page url
        if (data && data.beatmapSet && data.beatmap) {
            const newUrl = generateNavUrl(data.beatmapSet.beatmapset_id, data.ruleset, data.beatmap.beatmap_id);
            window.history.replaceState({}, document.title, newUrl);
        }
    }, [data]);

    if (isLoading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
        </Box>
    }

    if (error || !data || !data.beatmapSet || !data.beatmap) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <h2>{error || "Beatmap not found"}</h2>
        </Box>
    }

    return <Box sx={{ position: 'relative' }}>
        <Box sx={{
            width: '100%', height: '100%', position: 'absolute',
            backgroundImage: `url(${data.beatmapSet.covers ? data.beatmapSet.covers.card_2x : undefined})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.3)',
            zIndex: -1,
        }}>

        </Box>
        <Container maxWidth="xl" sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Collapse in={(data.beatmap.ruleset_id === 0 || data.beatmap.convert)} timeout="auto" unmountOnExit>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 1.4,
                            width: '100%'
                        }}>
                            <RulesetSelector
                                activeRuleset={data.ruleset}
                                onChange={(newRuleset) => {
                                    if (!data.beatmapSet || !data.beatmap) {
                                        ShowNotification("Beatmap data not loaded", "error");
                                        return;
                                    }
                                    const newBeatmap = data.beatmapSet?.grouped_beatmaps[data.beatmap.beatmap_id]?.find((b) => b.ruleset.toLowerCase() === newRuleset.toLowerCase()) || null;
                                    if (newBeatmap) {
                                        navigate(generateNavUrl(data.beatmapSet!.beatmapset_id, newRuleset.toLowerCase(), newBeatmap.id));
                                    }
                                }}
                                showCombined={false}
                            />
                        </Box>
                    </Collapse>
                    <BeatmapSidebarLeft beatmapSet={data.beatmapSet} beatmap={data.beatmap} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper>
                        <Box sx={{
                            display: 'flex', flexDirection: 'row',
                            //wrap
                            flexWrap: 'wrap',
                        }}>
                            {/* beatmap switcher */}
                            {
                                // data.beatmapSet.all_beatmaps.map((b) => {
                                Object.values(data.beatmapSet.beatmaps).map((b) => {
                                    const color = getDiffColour(b.stars || 0);
                                    //size by data.beatmapSet.beatmaps array length (most maps have ~6 maps, some have 20+)
                                    const sizeMin = 1.4;
                                    const sizeMax = 2;
                                    //scale by .beatmaps length
                                    const len = data.beatmapSet?.beatmaps.length || 1;
                                    const size = Math.max(sizeMin, Math.min(sizeMax, sizeMax - (len - 6) * 0.1));

                                    const isActive = b.id === data.beatmap?.id;
                                    return (
                                        <BetterTooltip key={b.id} title={
                                            <Box sx={{
                                                display: 'flex', flexDirection: 'row', alignItems: 'center',
                                                gap: 1,
                                            }}>
                                                <Typography variant="body1">[{b.version}]</Typography>
                                                <DifficultyBadge difficulty={b.stars} />
                                            </Box>
                                        }>
                                            <Box
                                                key={b.id}
                                                sx={{
                                                    // borderBottom: (b.id === data.beatmap?.id && b.ruleset_id === data.beatmap?.ruleset_id) ? `3px solid ${yellow[500]}` : 'none',
                                                    cursor: 'pointer',
                                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                                    borderRadius: 1,
                                                    padding: 0.3,
                                                }}
                                                onClick={() => {
                                                    navigate(generateNavUrl(data.beatmapSet!.beatmapset_id, b.ruleset.toLowerCase(), b.id));
                                                }}
                                            >
                                                <img
                                                    src={GetRulesetIconFromId(b.ruleset_id)}
                                                    style={{
                                                        width: `${size}em`,
                                                        height: `${size}em`,
                                                        verticalAlign: 'middle',
                                                        filter: `drop-shadow(0 0 2px ${color})`,
                                                    }}
                                                />
                                            </Box>
                                        </BetterTooltip>
                                    )
                                })
                            }
                        </Box>
                    </Paper>
                    <Card sx={{ marginTop: 2 }}>
                        <CardHeader title="Description" />
                        <CardContent>
                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {/* {data.beatmapSet.description || "No description provided."} */}
                                {data.beatmapSet.description ? <HtmlDisplay html={data.beatmapSet.description} userData={data.beatmapSet.description_user_data} /> : "No description provided."}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <BeatmapSidebarRight beatmapSet={data.beatmapSet} beatmap={data.beatmap} />
                </Grid>
            </Grid>
        </Container>
    </Box>
}

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

function BeatmapSidebarRight({ beatmapSet, beatmap }: { beatmapSet: IBeatmapSet, beatmap: IBeatmap }) {
    const theme = useTheme();
    return (
        <Stack spacing={2}>
            {
                beatmapSet.media?.youtube_id && (
                    <YoutubeEmbed videoId={beatmapSet.media.youtube_id} width={"100%"} height={"200px"} />
                )
            }
            <Card sx={{ position: 'relative' }}>
                <CardContent>
                    <Stack spacing={1} direction="column" alignItems="center">
                        <Button
                            variant="contained"
                            href={`https://osu.ppy.sh/beatmapsets/${beatmapSet.beatmapset_id}#${GetRulesetNameFromId(beatmap.ruleset_id)}/${beatmap.beatmap_id}`}
                            target="_blank"
                            fullWidth>osu! website</Button>
                        <Button
                            variant="contained"
                            href={`osu://b/${beatmap.beatmap_id}`}
                            fullWidth>osu!direct</Button>
                    </Stack>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="h6">Mappers</Typography>
                    {
                        (beatmap.owners?.length ?? 0) > 0 &&
                        <Stack spacing={1}>
                            <Typography variant="subtitle1" color="text.secondary">Set owner</Typography>
                            <PlayerLink data={beatmapSet.mapper} />
                            <Typography variant="subtitle1" color="text.secondary">Difficulty mappers ({FormatNumber(beatmap.owners?.length ?? 0)})</Typography>
                            {
                                beatmap.owners?.map((owner) => (
                                    <PlayerLink key={owner.id} data={owner.user} />
                                ))
                            }
                        </Stack>
                    }
                </CardContent>
            </Card>
        </Stack>
    )
}

function BeatmapStatRow({ label, value, limit = 10, enabled = true }: { label: string, value: number, limit?: number, enabled?: boolean }) {
    if (!enabled) {
        return null;
    }

    return (
        <TableRow>
            <TableCell><Typography variant="body2" color="text.secondary">{label}</Typography></TableCell>
            <TableCell>{value}</TableCell>
            <TableCell sx={{ width: '100%' }}>
                <LinearProgress
                    variant="determinate"
                    value={typeof value === 'number' ? Math.min((value / limit) * 100, 100) : 0}
                />
            </TableCell>
        </TableRow>
    )
}

export default RouteBeatmap;