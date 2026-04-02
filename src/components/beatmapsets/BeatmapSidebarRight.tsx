import { useTheme } from "@emotion/react";
import type { IRouteBeatmapResult } from "../../types/types";
import { Box, Button, Card, CardContent, Chip, Collapse, Divider, Stack, Typography } from "@mui/material";
import YoutubeEmbed from "../YoutubeEmbed";
import PlayerLink from "../PlayerLink";
import { FormatNumber, FormatNumberWithPrecision, GetRulesetNameFromId } from "../../util/Helper";
import difficultyJson from "../../data/difficulty.json";
import type { JSX } from "react";

interface IDifficultyLabel {
    rating: number;
    name: string;
    color: string;
}

interface IDifficultyLabels {
    [ruleset: string]: {
        [difficultyType: string]: IDifficultyLabel[];
    }
}

const typedDiff = difficultyJson as IDifficultyLabels;

function BeatmapSidebarRight({ data }: { data: IRouteBeatmapResult | null }) {
    const theme = useTheme();
    if (!data || !data.beatmapSet || !data.beatmap) {
        return null;
    }
    return (
        <Stack spacing={2}>
            {
                data.beatmapSet.media?.youtube_id && (
                    <YoutubeEmbed videoId={data.beatmapSet.media.youtube_id} width={"100%"} height={"200px"} />
                )
            }
            <Card sx={{ position: 'relative' }}>
                <CardContent>
                    <Stack spacing={1} direction="column" alignItems="center">
                        <Button
                            variant="contained"
                            href={`https://osu.ppy.sh/beatmapsets/${data.beatmapSet.beatmapset_id}#${GetRulesetNameFromId(data.beatmap.ruleset_id)}/${data.beatmap.beatmap_id}`}
                            target="_blank"
                            fullWidth>osu! website</Button>
                        <Button
                            variant="contained"
                            href={`osu://b/${data.beatmap.beatmap_id}`}
                            fullWidth>osu!direct</Button>
                    </Stack>
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="h6">Difficulty</Typography>
                    {
                        data.difficulty ? (
                            <>
                                <Collapse in={data.difficulty != null} timeout="auto" unmountOnExit>
                                    <DifficultyRow label="Stars" value={`${FormatNumberWithPrecision(data.difficulty?.star_rating, 2)} ★`} diffLabel={GetDifficultyState(data.difficulty?.star_rating, "osu", "stars")} />
                                    {/* depending on the ruleset */}
                                    {
                                        data.beatmap.ruleset_id === 0 && (
                                            <>
                                                <DifficultyRow label="Aim" value={`${FormatNumberWithPrecision(data.difficulty?.aim_difficulty, 2)} ★`} diffLabel={GetDifficultyState(data.difficulty?.aim_difficulty, "osu", "aim")} />
                                                <DifficultyRow label="Speed" value={`${FormatNumberWithPrecision(data.difficulty?.speed_difficulty, 2)} ★`} diffLabel={GetDifficultyState(data.difficulty?.speed_difficulty, "osu", "speed")} />
                                                <DifficultyRow label="Speed notes" value={`${FormatNumberWithPrecision(data.difficulty?.speed_note_count, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.speed_note_count, "osu", "speed_notes")} />
                                                <DifficultyRow label="Slider factor" value={`${FormatNumberWithPrecision(data.difficulty?.slider_factor, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.slider_factor, "osu", "slider_factor")} />
                                                <DifficultyRow label="Difficult aim sliders" value={`${FormatNumberWithPrecision(data.difficulty?.aim_difficult_slider_count, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.aim_difficult_slider_count, "osu", "aim_difficult_sliders")} />
                                                <DifficultyRow label="Speed strain count" value={`${FormatNumberWithPrecision(data.difficulty?.speed_difficult_strain_count, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.speed_difficult_strain_count, "osu", "speed_difficult_strain_count")} />
                                                <DifficultyRow label="Aim strain count" value={`${FormatNumberWithPrecision(data.difficulty?.aim_difficult_slider_count, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.aim_difficult_slider_count, "osu", "aim_difficult_sliders")} />
                                            </>
                                        )
                                    }
                                    {
                                        data.beatmap.ruleset_id === 1 && (
                                            <>
                                                <DifficultyRow label="Rhythm" value={`${FormatNumberWithPrecision(data.difficulty?.rhythm_difficulty, 2)} ★`} diffLabel={GetDifficultyState(data.difficulty?.rhythm_difficulty, "taiko", "rhythm")} />
                                                <DifficultyRow label="Consistency" value={`${FormatNumberWithPrecision(data.difficulty?.consistency_factor, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.consistency_factor, "taiko", "consistency")} />
                                                <DifficultyRow label="Mono stamina factor" value={`${FormatNumberWithPrecision(data.difficulty?.mono_stamina_factor, 2)}`} diffLabel={GetDifficultyState(data.difficulty?.mono_stamina_factor, "taiko", "mono_stamina_factor")} />
                                            </>
                                        )
                                    }
                                </Collapse>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Difficulty attributes not found. Likely a temporary issue.</Typography>
                        )
                    }
                    <Divider sx={{ marginY: 2 }} />
                    <Typography variant="h6">Mappers</Typography>
                    {
                        (data.beatmap.owners?.length ?? 0) > 0 &&
                        <Stack spacing={1}>
                            <Typography variant="subtitle1" color="text.secondary">Set owner</Typography>
                            <PlayerLink data={data.beatmapSet.mapper} />
                            <Typography variant="subtitle1" color="text.secondary">Difficulty mappers ({FormatNumber(data.beatmap.owners?.length ?? 0)})</Typography>
                            {
                                data.beatmap.owners?.map((owner) => (
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

function GetDifficultyState(difficulty: number | null | undefined, ruleset: string, difficultyType: string): IDifficultyLabel | null {
    //first validate if typedDiff[ruleset] and typedDiff[ruleset][difficultyType] exist
    if (!typedDiff[ruleset] || !typedDiff[ruleset][difficultyType]) {
        return null;
    }

    //find the closest difficulty in the list, return its name and color
    //ie: diff = 3.4, list = [0.0, 3.0, 3.5, 4.0], should return 3.0
    //8 should return 4
    //2.2 should return 0.0
    //etc. basically find the closest lower or equal difficulty
    let closest: IDifficultyLabel | null = null;
    for (const diff of typedDiff[ruleset][difficultyType]) {
        if (diff.rating <= (difficulty ?? 0)) {
            closest = diff;
        } else {
            break;
        }
    }
    return closest;
}

function DifficultyRow({ label, value, diffLabel = null }: { label: string, value: string | number, diffLabel?: IDifficultyLabel | null }) {
    //if value is number, run precision formatting, otherwise just display
    //label cell as small as possible, value cell takes the rest of the space
    return (
        <>
            <Typography variant="body1" color="text.secondary">{label}</Typography>
            <Box component="span" display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>
                {
                    diffLabel && (
                        <Box component="span"
                            sx={{
                                bgcolor: diffLabel.color,
                                color: 'white',
                                borderRadius: 1,
                                px: 0.5,
                                py: 0.25,
                                fontSize: '0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {diffLabel.name}
                        </Box>
                    )
                }
            </Box>
        </>
    )
}

export default BeatmapSidebarRight;