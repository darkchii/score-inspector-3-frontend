import { Alert, Box, Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import PlayerLink from "../PlayerLink";
import type { IBeatmapMediaArtistTitleRecommendationResponse } from "../../types/types";
import { FormatNumber } from "../../util/Helper";

type Props = {
    isLoading: boolean;
    error: string | null;
    similarBeatmapsData: IBeatmapMediaArtistTitleRecommendationResponse | null;
    sharedMediaMatchesByBeatmapsetId: Map<number, string[]>;
    onOpenBeatmapset: (beatmapsetId: number) => void;
};

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

function BeatmapsetSimilarMapsTab({
    isLoading,
    error,
    similarBeatmapsData,
    sharedMediaMatchesByBeatmapsetId,
    onOpenBeatmapset,
}: Props) {
    const source = similarBeatmapsData?.source;
    const sourceOriginalTitle = source?.title || "";
    const sourceSanitizedTitle = source?.sanitized_title || sourceOriginalTitle;
    const sourceMatchingTitle = source?.matching_title || sourceSanitizedTitle || sourceOriginalTitle;
    const hasSanitizedTitleChange = sourceOriginalTitle.length > 0 && sourceMatchingTitle.length > 0 && sourceOriginalTitle !== sourceMatchingTitle;

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                The media chips indicate shared media between the current set and the given similar map.
            </Typography>

            {
                isLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                )
            }

            {
                !isLoading && error && (
                    <Alert severity="error" variant="outlined">
                        {error}
                    </Alert>
                )
            }

            {
                !isLoading
                && !error
                && (similarBeatmapsData?.similar_beatmapsets?.length || 0) === 0
                && (
                    <Alert severity="info" variant="outlined">
                        No similar beatmaps found.
                    </Alert>
                )
            }

            {
                !isLoading
                && !error
                && (similarBeatmapsData?.similar_beatmapsets?.length || 0) > 0
                && (
                    <>
                        {/* "header" with amount of similar beatmaps */}
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {FormatNumber(similarBeatmapsData!.similar_beatmapsets.length)} similar beatmapset{similarBeatmapsData!.similar_beatmapsets.length > 1 ? "s" : ""} - Matching to title '{sourceMatchingTitle}'
                        </Typography>

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
                                                onOpenBeatmapset(item.beatmapset_id);
                                            }}
                                        >
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

                                            <CardContent sx={{ flex: 1, py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                                                <Stack spacing={1} sx={{ height: "100%", justifyContent: "space-between" }}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start", flexWrap: "nowrap" }}>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    fontSize: "0.7rem",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                    mb: 0.25,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {item.artist}
                                                            </Typography>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    lineHeight: 1.3,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {item.title}
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ flexShrink: 0 }} onClick={(event) => event.stopPropagation()}>
                                                            {
                                                                item.mapper_user ? (
                                                                    <PlayerLink data={item.mapper_user} size={18} />
                                                                ) : (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Mapper: {item.mapper || "Unknown"}
                                                                    </Typography>
                                                                )
                                                            }
                                                        </Box>
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
                    </>
                )
            }
        </Stack>
    );
}

export default BeatmapsetSimilarMapsTab;
