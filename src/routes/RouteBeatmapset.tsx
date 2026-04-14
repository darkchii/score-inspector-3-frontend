import { Alert, Box, Button, Link, Card, CardContent, Chip, CircularProgress, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { usePageTitle } from "../providers/TitleProvider";
import type { IBeatmap, IBeatmapMediaArtistTitleRecommendationResponse, IBeatmapMediaRecommendationItem, IBeatmapSet, IBeatmapSetMedia, IRouteBeatmapResult, IScoreDifficulty } from "../types/types";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
type MediaFieldKey = "youtube" | "spotify";
type MediaInputState = Record<MediaFieldKey, string>;
type MediaRecommendationState = Partial<Record<MediaFieldKey, IBeatmapMediaRecommendationItem[]>>;
type MediaLoadingState = Partial<Record<MediaFieldKey, boolean>>;
type MediaFieldConfig = {
    label: string;
    responseField: keyof Pick<IBeatmapSetMedia, "youtube_id" | "spotify_id">;
    inputLabel: string;
    placeholder: string;
    helperText: string;
    invalidMessage: string;
    extractNormalizedValue: (input: string | null | undefined) => string | null;
    renderPreview: (normalizedValue: string) => ReactNode;
};

const EMPTY_MEDIA_INPUTS: MediaInputState = {
    youtube: "",
    spotify: "",
};

const MEDIA_MATCH_LABELS: Record<MediaFieldKey, string> = {
    youtube: "YouTube",
    spotify: "Spotify",
};

const MEDIA_FIELD_ORDER: MediaFieldKey[] = ["youtube", "spotify"];
const MEDIA_FIELD_CONFIGS: Record<MediaFieldKey, MediaFieldConfig> = {
    youtube: {
        label: "YouTube",
        responseField: "youtube_id",
        inputLabel: "YouTube URL or video ID",
        placeholder: "https://www.youtube.com/watch?v=...",
        helperText: "Supports youtube.com, youtu.be, shorts, embed, and plain 11-char IDs.",
        invalidMessage: "Please enter a valid YouTube URL or video ID",
        extractNormalizedValue: extractYoutubeId,
        renderPreview: (normalizedValue: string) => <YoutubeEmbed videoId={normalizedValue} width="100%" height="220px" />,
    },
    spotify: {
        label: "Spotify",
        responseField: "spotify_id",
        inputLabel: "Spotify URL / URI / embed path",
        placeholder: "https://open.spotify.com/track/...",
        helperText: "Supports open.spotify.com links, spotify:... URIs, or track/ID style paths.",
        invalidMessage: "Please enter a valid Spotify URL, URI, or embed path",
        extractNormalizedValue: extractSpotifyPath,
        renderPreview: (normalizedValue: string) => <SpotifyEmbed embedPath={normalizedValue} width="100%" height="152px" />,
    },
};

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

function getBeatmapsetCardCoverUrl(beatmapsetId: number): string {
    return `https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/card.jpg`;
}

// Returns a variant label only when an explicit well-known tag is present in the title.
function detectSongVariant(title: string): string | null {
    const t = title.toLowerCase();
    // TV Size
    if (/[\[(\s]tv[\s-]*(size|ver\.?|version)[\s\])]|[\[(\s]tv[\s\])]/.test(t)) return "TV Size";
    // Short / Cut
    if (/[\[(\s](short|cut)[\s-]*(ver\.?|version|edit)?[\s\])]/.test(t)) return "Cut Ver.";
    // Full version
    if (/[\[(\s]full[\s-]*(ver\.?|version)[\s\])]/.test(t)) return "Full Ver.";
    // Game version
    if (/[\[(\s]game[\s-]*(ver\.?|version)[\s\])]/.test(t)) return "Game Ver.";
    // Anime version
    if (/[\[(\s]anime[\s-]*(ver\.?|version)[\s\])]/.test(t)) return "Anime Ver.";
    return null;
}

function RouteBeatmapset() {
    const navigate = useNavigate();
    const { beatmapsetId, ruleset, beatmapId } = useParams();
    const { getBeatmapSet, getDifficulty, getBeatmapScores, updateBeatmapSetMedia, getBeatmapMediaRecommendations, getBeatmapMediaRecommendationsByArtistTitle } = useApi();
    const { token, userData } = useAuth();
    const [data, setData] = useState<IRouteBeatmapResult | null>(null);
    // const { setTitle } = usePageTitle();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingDifficulty, setIsLoadingDifficulty] = useState(false);

    const isAnythingLoading = isLoading || isLoadingDifficulty;

    const [selectedTab, setSelectedTab] = useState(0);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaInputs, setMediaInputs] = useState<MediaInputState>(EMPTY_MEDIA_INPUTS);
    const [mediaRecommendations, setMediaRecommendations] = useState<MediaRecommendationState>({});
    const [isRecommendationLoading, setIsRecommendationLoading] = useState<MediaLoadingState>({});
    const [hasAttemptedRecommendations, setHasAttemptedRecommendations] = useState<MediaLoadingState>({});
    const [isArtistTitleRecommendationLoading, setIsArtistTitleRecommendationLoading] = useState(false);
    const [artistTitleRecommendationStats, setArtistTitleRecommendationStats] = useState<{ matchedBeatmapsets: number; matchedMediaRows: number } | null>(null);
    const [isSavingMedia, setIsSavingMedia] = useState(false);
    const [similarBeatmapsData, setSimilarBeatmapsData] = useState<IBeatmapMediaArtistTitleRecommendationResponse | null>(null);
    const [isSimilarBeatmapsLoading, setIsSimilarBeatmapsLoading] = useState(false);
    const [similarBeatmapsError, setSimilarBeatmapsError] = useState<string | null>(null);

    const canEditMedia = hasEditorAccess(userData);
    const trimmedMediaInputs: MediaInputState = { ...EMPTY_MEDIA_INPUTS };
    const normalizedMediaInputs: Record<MediaFieldKey, string | null> = { youtube: null, spotify: null };
    const mediaValidity: Record<MediaFieldKey, boolean> = { youtube: true, spotify: true };

    MEDIA_FIELD_ORDER.forEach((mediaKey) => {
        trimmedMediaInputs[mediaKey] = mediaInputs[mediaKey].trim();
        normalizedMediaInputs[mediaKey] = MEDIA_FIELD_CONFIGS[mediaKey].extractNormalizedValue(mediaInputs[mediaKey]);
        mediaValidity[mediaKey] = trimmedMediaInputs[mediaKey].length === 0 || normalizedMediaInputs[mediaKey] !== null;
    });

    const resetMediaRecommendations = () => {
        setMediaRecommendations({});
        setIsRecommendationLoading({});
        setHasAttemptedRecommendations({});
    };

    const updateMediaInput = (mediaKey: MediaFieldKey, value: string) => {
        setMediaInputs((prev) => ({
            ...prev,
            [mediaKey]: value,
        }));
    };

    const loadArtistTitleRecommendations = async () => {
        if (!data?.beatmapSet) {
            return;
        }

        setIsArtistTitleRecommendationLoading(true);
        setArtistTitleRecommendationStats(null);

        try {
            const response = await getBeatmapMediaRecommendationsByArtistTitle(
                data.beatmapSet.beatmapset_id,
                data.beatmapSet.artist,
                data.beatmapSet.title,
                8,
            );

            const recommendationMap: MediaRecommendationState = {};
            response.recommendation_fields.forEach((field) => {
                if (field.key === 'youtube' || field.key === 'spotify') {
                    recommendationMap[field.key] = field.recommendations;
                }
            });

            setMediaRecommendations(recommendationMap);
            setHasAttemptedRecommendations({ youtube: true, spotify: true });
            setArtistTitleRecommendationStats({
                matchedBeatmapsets: response.matched_beatmapsets,
                matchedMediaRows: response.matched_media_rows,
            });
        } catch (error) {
            console.error('Failed to preload media recommendations by artist/title:', error);
            setMediaRecommendations({});
            setArtistTitleRecommendationStats(null);
        } finally {
            setIsArtistTitleRecommendationLoading(false);
        }
    };

    const loadSimilarBeatmaps = async () => {
        if (!data?.beatmapSet) {
            return;
        }

        setIsSimilarBeatmapsLoading(true);
        setSimilarBeatmapsError(null);

        try {
            const response = await getBeatmapMediaRecommendationsByArtistTitle(
                data.beatmapSet.beatmapset_id,
                data.beatmapSet.artist,
                data.beatmapSet.title,
                8,
            );

            setSimilarBeatmapsData(response);
        } catch (error) {
            console.error("Failed to load similar beatmaps:", error);
            setSimilarBeatmapsData(null);
            setSimilarBeatmapsError("Failed to load similar beatmaps.");
        } finally {
            setIsSimilarBeatmapsLoading(false);
        }
    };

    const sharedMediaMatchesByBeatmapsetId = useMemo(() => {
        const map = new Map<number, string[]>();

        if (!similarBeatmapsData?.recommendation_fields || !data?.beatmapSet?.media) {
            return map;
        }

        MEDIA_FIELD_ORDER.forEach((mediaKey) => {
            const mediaField = MEDIA_FIELD_CONFIGS[mediaKey];
            const sourceValue = data.beatmapSet.media?.[mediaField.responseField];
            if (!sourceValue) {
                return;
            }

            const recommendationField = similarBeatmapsData.recommendation_fields.find((field) => field.key === mediaKey);
            const matchingEntry = recommendationField?.recommendations.find((item) => item.value === sourceValue);
            if (!matchingEntry) {
                return;
            }

            matchingEntry.beatmapset_ids.forEach((id) => {
                const existingLabels = map.get(id) || [];
                const nextLabel = MEDIA_MATCH_LABELS[mediaKey];
                if (!existingLabels.includes(nextLabel)) {
                    map.set(id, [...existingLabels, nextLabel]);
                }
            });
        });

        return map;
    }, [similarBeatmapsData, data?.beatmapSet?.media, data?.beatmapSet?.media?.youtube_id, data?.beatmapSet?.media?.spotify_id]);

    const handleMediaFieldFocus = async (targetKey: MediaFieldKey) => {
        const sourceCandidates = MEDIA_FIELD_ORDER
            .filter((mediaKey) => mediaKey !== targetKey)
            .map((mediaKey) => ({
                mediaKey,
                normalizedValue: normalizedMediaInputs[mediaKey],
            }))
            .filter((entry): entry is { mediaKey: MediaFieldKey; normalizedValue: string } => entry.normalizedValue !== null);

        setHasAttemptedRecommendations((prev) => ({
            ...prev,
            [targetKey]: true,
        }));

        if (sourceCandidates.length === 0) {
            setMediaRecommendations((prev) => ({
                ...prev,
                [targetKey]: [],
            }));
            return;
        }

        setIsRecommendationLoading((prev) => ({
            ...prev,
            [targetKey]: true,
        }));

        try {
            const responses = await Promise.all(
                sourceCandidates.map((entry) => getBeatmapMediaRecommendations(entry.mediaKey, entry.normalizedValue))
            );

            const recommendationMap = new Map<string, IBeatmapMediaRecommendationItem>();
            responses.forEach((response) => {
                const targetField = response.recommendation_fields.find((field) => field.key === targetKey);
                targetField?.recommendations.forEach((item) => {
                    const existing = recommendationMap.get(item.value);
                    if (existing) {
                        recommendationMap.set(item.value, {
                            value: item.value,
                            match_count: existing.match_count + item.match_count,
                            beatmapset_ids: Array.from(new Set([...existing.beatmapset_ids, ...item.beatmapset_ids])),
                        });
                        return;
                    }

                    recommendationMap.set(item.value, {
                        ...item,
                        beatmapset_ids: [...item.beatmapset_ids],
                    });
                });
            });

            const currentValue = normalizedMediaInputs[targetKey] || trimmedMediaInputs[targetKey];
            const nextRecommendations = Array.from(recommendationMap.values())
                .filter((item) => item.value !== currentValue)
                .sort((left, right) => {
                    if (right.match_count !== left.match_count) {
                        return right.match_count - left.match_count;
                    }

                    return left.value.localeCompare(right.value);
                });

            setMediaRecommendations((prev) => ({
                ...prev,
                [targetKey]: nextRecommendations,
            }));
        } catch (error) {
            console.error(`Failed to load ${targetKey} media recommendations:`, error);
            setMediaRecommendations((prev) => ({
                ...prev,
                [targetKey]: [],
            }));
        } finally {
            setIsRecommendationLoading((prev) => ({
                ...prev,
                [targetKey]: false,
            }));
        }
    };

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
                // setSelectedTab(0);
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

        setMediaInputs({
            youtube: data?.beatmapSet?.media?.youtube_id || "",
            spotify: data?.beatmapSet?.media?.spotify_id || "",
        });
        resetMediaRecommendations();
        void loadArtistTitleRecommendations();
    }, [isMediaModalOpen, data?.beatmapSet?.media?.youtube_id, data?.beatmapSet?.media?.spotify_id]);

    useEffect(() => {
        if (selectedTab !== 3 || !data?.beatmapSet) {
            return;
        }

        void loadSimilarBeatmaps();
    }, [selectedTab, data?.beatmapSet?.beatmapset_id, data?.beatmapSet?.artist, data?.beatmapSet?.title]);

    const handleSaveMedia = async () => {
        if (!data?.beatmapSet?.beatmapset_id) {
            ShowNotification("Beatmapset not loaded", "error");
            return;
        }

        if (!token) {
            ShowNotification("You must be logged in", "error");
            return;
        }

        setIsSavingMedia(true);
        try {
            for (const mediaKey of MEDIA_FIELD_ORDER) {
                if (trimmedMediaInputs[mediaKey].length > 0 && !normalizedMediaInputs[mediaKey]) {
                    ShowNotification(MEDIA_FIELD_CONFIGS[mediaKey].invalidMessage, "error");
                    return;
                }
            }

            const response = await updateBeatmapSetMedia(
                data.beatmapSet.beatmapset_id,
                token,
                trimmedMediaInputs.youtube || null,
                trimmedMediaInputs.spotify || null,
            );

            setData((prev) => {
                if (!prev?.beatmapSet) {
                    return prev;
                }

                const nextMedia: IBeatmapSetMedia = {
                    beatmapset_id: prev.beatmapSet.beatmapset_id,
                    youtube_id: response?.youtube_id ?? null,
                    spotify_id: response?.spotify_id ?? null,
                };

                return {
                    ...prev,
                    beatmapSet: {
                        ...prev.beatmapSet,
                        media: nextMedia,
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
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', }}>
            <CircularProgress />
        </Box>
    }

    if (error || !data || !data.beatmapSet || !data.beatmap) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <h2>{error || "Beatmap not found"}</h2>
        </Box>
    }

    return <Box sx={{ position: 'relative' }}>
        <Box sx={{
            width: '100%',
            height: '100dvh',
            position: 'fixed',
            top: 0,
            left: 0,
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
                            <Tab label="Similar Beatmaps" />
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
                            <Collapse in={selectedTab === 3} timeout="auto" unmountOnExit>
                                <Stack spacing={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        The media chips indicate shared media between the current set and the given similar map.
                                    </Typography>

                                    {
                                        isSimilarBeatmapsLoading && (
                                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                                <CircularProgress size={28} />
                                            </Box>
                                        )
                                    }

                                    {
                                        !isSimilarBeatmapsLoading && similarBeatmapsError && (
                                            <Alert severity="error" variant="outlined">
                                                {similarBeatmapsError}
                                            </Alert>
                                        )
                                    }

                                    {
                                        !isSimilarBeatmapsLoading
                                        && !similarBeatmapsError
                                        && (similarBeatmapsData?.similar_beatmapsets?.length || 0) === 0
                                        && (
                                            <Alert severity="info" variant="outlined">
                                                No similar beatmaps found yet.
                                            </Alert>
                                        )
                                    }

                                    {
                                        !isSimilarBeatmapsLoading
                                        && !similarBeatmapsError
                                        && (similarBeatmapsData?.similar_beatmapsets?.length || 0) > 0
                                        && (
                                            <Stack spacing={1.5}>
                                                {
                                                    similarBeatmapsData!.similar_beatmapsets.map((item) => {
                                                        const mediaMatches = sharedMediaMatchesByBeatmapsetId.get(item.beatmapset_id) || [];
                                                        const thumbnailUrl = getBeatmapsetCardCoverUrl(item.beatmapset_id);
                                                        const variantLabel = detectSongVariant(item.title);

                                                        return (
                                                            <Card
                                                                key={item.beatmapset_id}
                                                                elevation={2}
                                                                sx={{
                                                                    overflow: "hidden",
                                                                    display: "flex",
                                                                    flexDirection: { xs: "column", sm: "row" },
                                                                    cursor: "pointer",
                                                                    transition: "box-shadow 0.2s",
                                                                    "&:hover": { boxShadow: 6 },
                                                                }}
                                                                onClick={() => {
                                                                    navigate(GenerateUrl(routeData.routeBeatmapsets.path, {
                                                                        beatmapsetId: item.beatmapset_id,
                                                                        ruleset: data.ruleset,
                                                                    }));
                                                                }}
                                                            >
                                                                {/* Thumbnail */}
                                                                <Box
                                                                    sx={{
                                                                        width: { xs: "100%", sm: 180 },
                                                                        minHeight: { xs: 100, sm: "auto" },
                                                                        flexShrink: 0,
                                                                        backgroundImage: `url(${thumbnailUrl})`,
                                                                        backgroundSize: "cover",
                                                                        backgroundPosition: "center",
                                                                    }}
                                                                />

                                                                {/* Content */}
                                                                <CardContent sx={{ flex: 1, py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                                                                    <Stack spacing={1} sx={{ height: "100%", justifyContent: "space-between" }}>
                                                                        <Box>
                                                                            <Typography
                                                                                variant="body2"
                                                                                color="text.secondary"
                                                                                sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.25 }}
                                                                            >
                                                                                {item.artist}
                                                                            </Typography>
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                                                                                {item.title}
                                                                            </Typography>
                                                                        </Box>

                                                                        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap", alignItems: "center" }}>
                                                                            {variantLabel && (
                                                                                <Chip size="small" label={variantLabel} variant="outlined" />
                                                                            )}
                                                                            {mediaMatches.map((label) => (
                                                                                <Chip key={`${item.beatmapset_id}-${label}`} size="small" color="success" label={label} />
                                                                            ))}
                                                                            <Typography variant="caption" color="text.disabled" sx={{ ml: "auto !important" }}>
                                                                                ~{(item.similarity_score * 100).toFixed(0)}% match
                                                                            </Typography>
                                                                        </Stack>
                                                                    </Stack>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })
                                                }
                                            </Stack>
                                        )
                                    }
                                </Stack>
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
                    {/* link to open google search for the exact title */}
                    <Link
                        href={`https://www.google.com/search?q=${encodeURIComponent(data?.beatmapSet?.artist + " - " + data?.beatmapSet?.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                    >
                        Search on Google: "{data?.beatmapSet?.artist} - {data?.beatmapSet?.title}"
                    </Link>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Alert severity="info" variant="outlined">
                        Leave a field empty to remove that media entry.
                    </Alert>

                    {
                        isArtistTitleRecommendationLoading && (
                            <Alert severity="info" variant="outlined">
                                Checking similar artist/title beatmaps for media recommendations...
                            </Alert>
                        )
                    }
                    {
                        !isArtistTitleRecommendationLoading && artistTitleRecommendationStats && (
                            <Alert severity="success" variant="outlined">
                                Found recommendations from {artistTitleRecommendationStats.matchedBeatmapsets} similar beatmapsets ({artistTitleRecommendationStats.matchedMediaRows} media rows).
                            </Alert>
                        )
                    }

                    {
                        MEDIA_FIELD_ORDER.map((mediaKey, index) => {
                            const config = MEDIA_FIELD_CONFIGS[mediaKey];
                            const recommendations = mediaRecommendations[mediaKey] || [];
                            const isValid = mediaValidity[mediaKey];
                            const normalizedValue = normalizedMediaInputs[mediaKey];
                            const hasRecommendations = recommendations.length > 0;

                            return (
                                <Paper key={mediaKey} variant="outlined" sx={{ p: 2 }}>
                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{config.label}</Typography>
                                            <Chip
                                                size="small"
                                                color={isValid ? "success" : "error"}
                                                label={trimmedMediaInputs[mediaKey].length === 0 ? "Empty" : isValid ? "Valid" : "Invalid"}
                                            />
                                        </Box>
                                        <TextField
                                            autoFocus={index === 0}
                                            margin="dense"
                                            label={config.inputLabel}
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={mediaInputs[mediaKey]}
                                            onChange={(e) => updateMediaInput(mediaKey, e.target.value)}
                                            onFocus={() => {
                                                void handleMediaFieldFocus(mediaKey);
                                            }}
                                            placeholder={config.placeholder}
                                            error={!isValid}
                                            helperText={config.helperText}
                                            size="small"
                                        />
                                        {
                                            isRecommendationLoading[mediaKey] && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Checking matching {config.label} recommendations...
                                                </Typography>
                                            )
                                        }
                                        {
                                            !isRecommendationLoading[mediaKey] && hasRecommendations && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                                        Recommendations from matching media entries
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                                                        {
                                                            recommendations.map((item) => (
                                                                <Chip
                                                                    key={`${mediaKey}-${item.value}`}
                                                                    clickable
                                                                    variant="outlined"
                                                                    label={`${item.value} (${item.match_count})`}
                                                                    onClick={() => updateMediaInput(mediaKey, item.value)}
                                                                />
                                                            ))
                                                        }
                                                    </Stack>
                                                </Box>
                                            )
                                        }
                                        {
                                            !isRecommendationLoading[mediaKey]
                                            && hasAttemptedRecommendations[mediaKey]
                                            && !hasRecommendations
                                            && (
                                                <Typography variant="caption" color="text.secondary">
                                                    No recommendations found from the other filled media fields.
                                                </Typography>
                                            )
                                        }
                                        {
                                            normalizedValue && (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                                        Preview
                                                    </Typography>
                                                    {config.renderPreview(normalizedValue)}
                                                </Box>
                                            )
                                        }
                                    </Stack>
                                </Paper>
                            );
                        })
                    }
                </Stack>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
                <Button
                    color="inherit"
                    onClick={() => {
                        setMediaInputs({ ...EMPTY_MEDIA_INPUTS });
                        resetMediaRecommendations();
                        setArtistTitleRecommendationStats(null);
                    }}
                    disabled={isSavingMedia}
                >
                    Clear all
                </Button>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={() => setIsMediaModalOpen(false)} disabled={isSavingMedia}>Cancel</Button>
                    <Button onClick={handleSaveMedia} variant="contained" disabled={isSavingMedia || MEDIA_FIELD_ORDER.some((mediaKey) => !mediaValidity[mediaKey])}>
                        {isSavingMedia ? "Saving..." : "Save"}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    </Box>
}

export default RouteBeatmapset;