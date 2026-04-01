import { Box, Card, CardContent, CardHeader, CircularProgress, Collapse, Container, Grid, Paper, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import type { IBeatmap, IBeatmapSet } from "../types/types";
import { useEffect, useState } from "react";
import { useApi } from "../providers/ApiProvider";
import BeatmapSet from "../types/beatmaps/BeatmapSet";
import RulesetSelector from "../components/RulesetSelector";
import DifficultyBadge from "../components/DifficultyBadge";
import { GetRulesetIconFromId, ShowNotification } from "../util/Helper";
import BetterTooltip from "../components/tooltips/BetterTooltip";
import { getDiffColour } from "../util/DifficultyHelper";
import HtmlDisplay from "../components/HtmlDisplay";
import BeatmapSidebarLeft from "../components/beatmapsets/BeatmapSidebarLeft";
import BeatmapSidebarRight from "../components/beatmapsets/BeatmapSidebarRight";
import { GenerateUrl, routeData, UpdateUrl } from "../util/RouteHelper";

interface RouteBeatmapResult {
    beatmapSet: IBeatmapSet | null;
    beatmap: IBeatmap | null;
    ruleset: string;
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
            UpdateUrl(
                routeData.routeBeatmapsets.path,
                {
                    beatmapsetId: data.beatmapSet.beatmapset_id,
                    ruleset: data.ruleset,
                    beatmapId: data.beatmap.beatmap_id,
                }
            )
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
                                        navigate(GenerateUrl(routeData.routeBeatmapsets.path, {
                                            beatmapsetId: data.beatmapSet!.beatmapset_id,
                                            ruleset: newRuleset.toLowerCase(),
                                            beatmapId: newBeatmap.id
                                        }));
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
                                                    navigate(GenerateUrl(routeData.routeBeatmapsets.path, {
                                                        beatmapsetId: data.beatmapSet!.beatmapset_id,
                                                        ruleset: b.ruleset.toLowerCase(),
                                                        beatmapId: b.id
                                                    }));
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

export default RouteBeatmap;