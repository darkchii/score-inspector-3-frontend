import { Alert, Box, Button, Card, CardContent, CardHeader, Chip, CircularProgress, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import type { IBeatmap, IBeatmapSet, IRouteBeatmapResult, IScoreDifficulty } from "../types/types";
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
import BeatmapPerformanceTool from "../components/beatmapsets/BeatmapPerformanceTool";
import Score from "../types/Score";
import { useAuth } from "../providers/AuthProvider";
import YoutubeEmbed from "../components/YoutubeEmbed";
import SpotifyEmbed from "../components/SpotifyEmbed";

const EDITOR_ROLE_ID = 5;

function extractYoutubeId(input: string | null | undefined): string | null {
    if (!input || typeof input !== "string") {
        return null;
    }

    const value = input.trim();
    if (!value) {
        return null;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
        return value;
    }

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();

        if (host.includes("youtu.be")) {
            const candidate = parsed.pathname.split("/").filter(Boolean)[0] || "";
            return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
        }

        if (host.includes("youtube.com")) {
            const v = parsed.searchParams.get("v");
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
                return v;
            }

            const pathParts = parsed.pathname.split("/").filter(Boolean);
            if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
                const candidate = pathParts[1] || "";
                return /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null;
            }
        }
    } catch (error) {
        return null;
    }

    return null;
}

function extractSpotifyPath(input: string | null | undefined): string | null {
    if (!input || typeof input !== "string") {
        return null;
    }

    const value = input.trim();
    if (!value) {
        return null;
    }

    const spotifyPathRegex = /^(track|album|playlist|episode|show)\/([a-zA-Z0-9]{22})$/;
    const spotifyUriRegex = /^spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]{22})$/;

    if (spotifyPathRegex.test(value)) {
        return value;
    }

    const uriMatch = value.match(spotifyUriRegex);
    if (uriMatch) {
        return `${uriMatch[1]}/${uriMatch[2]}`;
    }

    try {
        const parsed = new URL(value);
        const host = parsed.hostname.toLowerCase();
        if (!host.includes("spotify.com")) {
            return null;
        }

        const pathParts = parsed.pathname.split("/").filter(Boolean);
        if (pathParts[0] === "embed") {
            pathParts.shift();
        }

        if (pathParts.length < 2) {
            return null;
        }

        const type = pathParts[0];
        const id = pathParts[1];
        const normalized = `${type}/${id}`;
        return spotifyPathRegex.test(normalized) ? normalized : null;
    } catch (error) {
        return null;
    }
}

function hasEditorAccess(userData: any): boolean {
    if (!userData?.roles || !Array.isArray(userData.roles)) {
        return false;
    }

    return userData.roles.some((role: any) => {
        const title = (role?.title || "").toString().toLowerCase();
        return role?.id === EDITOR_ROLE_ID || role?.role_id === EDITOR_ROLE_ID || title === "editor" || role?.is_editor === true || role?.is_admin === true;
    });
}

function RouteBeatmapset() {
    const navigate = useNavigate();
    const { beatmapsetId, ruleset, beatmapId } = useParams();
    const { getBeatmapSet, getDifficulty, getBeatmapScores, updateBeatmapSetMedia } = useApi();
    const { token, userData } = useAuth();
    const [data, setData] = useState<IRouteBeatmapResult | null>(null);
    // const { setTitle } = usePageTitle();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingDifficulty, setIsLoadingDifficulty] = useState(false);

    const isAnythingLoading = isLoading || isLoadingDifficulty;

    const [selectedTab, setSelectedTab] = useState(0);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [youtubeMediaInput, setYoutubeMediaInput] = useState("");
    const [spotifyMediaInput, setSpotifyMediaInput] = useState("");
    const [isSavingMedia, setIsSavingMedia] = useState(false);

    const canEditMedia = hasEditorAccess(userData);
    const mediaPreviewVideoId = extractYoutubeId(youtubeMediaInput);
    const mediaPreviewSpotifyPath = extractSpotifyPath(spotifyMediaInput);
    const trimmedYoutubeInput = youtubeMediaInput.trim();
    const trimmedSpotifyInput = spotifyMediaInput.trim();
    const isYoutubeValid = trimmedYoutubeInput.length === 0 || mediaPreviewVideoId !== null;
    const isSpotifyValid = trimmedSpotifyInput.length === 0 || mediaPreviewSpotifyPath !== null;

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

                const _data: IRouteBeatmapResult = {
                    beatmapSet,
                    beatmap,
                    scores: null,
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

    useEffect(() => {
        if (!isMediaModalOpen) {
            return;
        }

        const currentYoutubeId = data?.beatmapSet?.media?.youtube_id || "";
        const currentSpotifyId = data?.beatmapSet?.media?.spotify_id || "";
        setYoutubeMediaInput(currentYoutubeId);
        setSpotifyMediaInput(currentSpotifyId);
    }, [isMediaModalOpen, data?.beatmapSet?.media?.youtube_id, data?.beatmapSet?.media?.spotify_id]);

    const handleSaveMedia = async () => {
        if (!data?.beatmapSet?.beatmapset_id) {
            ShowNotification("Beatmapset not loaded", "error");
            return;
        }

        if (!token) {
            ShowNotification("You must be logged in", "error");
            return;
        }

        const trimmedYoutube = youtubeMediaInput.trim();
        const trimmedSpotify = spotifyMediaInput.trim();

        if (trimmedYoutube.length > 0 && !extractYoutubeId(trimmedYoutube)) {
            ShowNotification("Please enter a valid YouTube URL or video ID", "error");
            return;
        }

        if (trimmedSpotify.length > 0 && !extractSpotifyPath(trimmedSpotify)) {
            ShowNotification("Please enter a valid Spotify URL, URI, or embed path", "error");
            return;
        }

        setIsSavingMedia(true);
        try {
            const response = await updateBeatmapSetMedia(data.beatmapSet.beatmapset_id, token, trimmedYoutube || null, trimmedSpotify || null);
            setData((prev) => {
                if (!prev?.beatmapSet) {
                    return prev;
                }

                return {
                    ...prev,
                    beatmapSet: {
                        ...prev.beatmapSet,
                        media: {
                            beatmapset_id: prev.beatmapSet.beatmapset_id,
                            youtube_id: response?.youtube_id ?? null,
                            spotify_id: response?.spotify_id ?? null,
                        }
                    }
                };
            });
            setIsMediaModalOpen(false);
            ShowNotification("Beatmap media updated", "success");
        } catch (error: any) {
            console.error("Failed to update beatmap media:", error);
            ShowNotification("Failed to update beatmap media", "error");
        } finally {
            setIsSavingMedia(false);
        }
    };

    useEffect(() => {
        (async () => {
            if (data && data.beatmap) {
                setIsLoadingDifficulty(true);
                try {
                    const difficultyResponse = await getDifficulty(data.beatmap.beatmap_id, data.beatmap.ruleset_id, null);
                    const scores = await getBeatmapScores(data.beatmap.beatmap_id, data.ruleset, null);
                    let _scores: Score[] = [];
                    if (scores?.length > 0) {
                        let parsedScores = scores.map((s: any) => new Score(s, data.beatmap!));
                        //sort by classic_total_score
                        parsedScores.sort((a: Score, b: Score) => b.classic_total_score - a.classic_total_score);
                        _scores = parsedScores;
                    }
                    setData((prev) => prev ? { ...prev, difficulty: difficultyResponse, scores: _scores } : prev);
                    console.log("Loaded difficulty data:", difficultyResponse);
                    console.log("Loaded scores data:", _scores);
                }
                catch (err) {
                    console.error("Failed to load difficulty data:", err);
                }
                finally {
                    setIsLoadingDifficulty(false);
                }
            }
        })();
    }, [data?.beatmap, data?.ruleset, data?.beatmap?.ruleset_id]);

    if (isLoading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
        </Box>
    }

    if (error || !data || !data.beatmapSet || !data.beatmap) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="200px">
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
                                disabled={isAnythingLoading}
                            />
                        </Box>
                    </Collapse>
                    <BeatmapSidebarLeft data={data} />
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
                                    const len = data.beatmapSet?.beatmaps.length || 1;
                                    let size = 2;
                                    if (len >= 20) {
                                        size = 1.4;
                                    }

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
                                                    if (isAnythingLoading) {
                                                        ShowNotification("Data is still loading, please wait", "info");
                                                        return;
                                                    }
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
                    <Paper elevation={3} sx={{ marginTop: 2 }}>
                        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} variant="fullWidth">
                            <Tab label="Description" />
                            <Tab label="Scores" />
                            <Tab label="PP Calculator" />
                        </Tabs>
                        <Box sx={{ padding: 2 }}>
                            <Collapse in={selectedTab === 0} timeout="auto" unmountOnExit>
                                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {data.beatmapSet.description ? <HtmlDisplay html={data.beatmapSet.description} userData={data.beatmapSet.description_user_data} /> : "No description provided."}
                                </Typography>
                            </Collapse>
                            <Collapse in={selectedTab === 1} timeout="auto" unmountOnExit>
                                <Typography variant="body1" color="text.secondary">
                                    Scores tab is a work in progress.
                                </Typography>
                            </Collapse>
                            <Collapse in={selectedTab === 2} timeout="auto" unmountOnExit>
                                <BeatmapPerformanceTool data={data} />
                            </Collapse>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <BeatmapSidebarRight data={data} canEditMedia={canEditMedia} onOpenMediaEditor={() => setIsMediaModalOpen(true)} />
                </Grid>
            </Grid>
        </Container>
        <Dialog open={isMediaModalOpen} onClose={() => !isSavingMedia && setIsMediaModalOpen(false)} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1 }}>
                <Stack spacing={0.5}>
                    <Typography variant="h6">Edit Beatmap Media</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Attach embeds and verify them live before saving.
                    </Typography>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Alert severity="info" variant="outlined">
                        Leave a field empty to remove that media entry.
                    </Alert>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>YouTube</Typography>
                                <Chip
                                    size="small"
                                    color={isYoutubeValid ? "success" : "error"}
                                    label={trimmedYoutubeInput.length === 0 ? "Empty" : isYoutubeValid ? "Valid" : "Invalid"}
                                />
                            </Box>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="YouTube URL or video ID"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={youtubeMediaInput}
                                onChange={(e) => setYoutubeMediaInput(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                error={!isYoutubeValid}
                                helperText="Supports youtube.com, youtu.be, shorts, embed, and plain 11-char IDs."
                            />
                            {
                                mediaPreviewVideoId && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                            Preview
                                        </Typography>
                                        <YoutubeEmbed videoId={mediaPreviewVideoId} width="100%" height="220px" />
                                    </Box>
                                )
                            }
                        </Stack>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Spotify</Typography>
                                <Chip
                                    size="small"
                                    color={isSpotifyValid ? "success" : "error"}
                                    label={trimmedSpotifyInput.length === 0 ? "Empty" : isSpotifyValid ? "Valid" : "Invalid"}
                                />
                            </Box>
                            <TextField
                                margin="dense"
                                label="Spotify URL / URI / embed path"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={spotifyMediaInput}
                                onChange={(e) => setSpotifyMediaInput(e.target.value)}
                                placeholder="https://open.spotify.com/track/..."
                                error={!isSpotifyValid}
                                helperText="Supports open.spotify.com links, spotify:... URIs, or track/ID style paths."
                            />
                            {
                                mediaPreviewSpotifyPath && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                            Preview
                                        </Typography>
                                        <SpotifyEmbed embedPath={mediaPreviewSpotifyPath} width="100%" height="152px" />
                                    </Box>
                                )
                            }
                        </Stack>
                    </Paper>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
                <Button
                    color="inherit"
                    onClick={() => {
                        setYoutubeMediaInput("");
                        setSpotifyMediaInput("");
                    }}
                    disabled={isSavingMedia}
                >
                    Clear all
                </Button>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={() => setIsMediaModalOpen(false)} disabled={isSavingMedia}>Cancel</Button>
                    <Button onClick={handleSaveMedia} variant="contained" disabled={isSavingMedia || !isYoutubeValid || !isSpotifyValid}>
                    {isSavingMedia ? "Saving..." : "Save"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    </Box>
}

export default RouteBeatmapset;