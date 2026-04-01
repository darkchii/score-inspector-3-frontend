import { useTheme } from "@emotion/react";
import type { IBeatmap, IBeatmapSet } from "../../types/types";
import { Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import YoutubeEmbed from "../YoutubeEmbed";
import PlayerLink from "../PlayerLink";
import { FormatNumber, GetRulesetNameFromId } from "../../util/Helper";

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

export default BeatmapSidebarRight;