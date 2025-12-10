import { Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { GetRulesetIconFromId, TimeAgo } from "../Misc/Helper";
import { useScoreView } from "../Providers/ScoreViewProvider";
import Marquee from "./Marquee";

function ScoreCard({ score, title = null, value = null }) {
    const { loadScoreView } = useScoreView();

    if (!score) return (
        <>
            <Card sx={{ height: '100%', borderRadius: '11px', backgroundPosition: 'center', backgroundSize: 'auto', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <CardContent sx={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '10px' }}>
                    <Stack spacing={1}>
                        {
                            title && <Typography variant='h6' sx={{ fontSize: '0.9em' }}>{title} play</Typography>
                        }
                        <Typography variant='title' sx={{ fontSize: '1em' }}>No score found</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </>
    )

    return (
        <>
            <Card sx={{ height: '100%', borderRadius: '11px', backgroundPosition: 'center', backgroundSize: 'auto', backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/cover@2x.jpg)` }}>
                <CardContent sx={{ height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '11px' }}>
                    <Stack spacing={1}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={GetRulesetIconFromId(score.ruleset_id)} style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                            <Typography variant='h6' sx={{ fontSize: '0.9em' }}> {title} play</Typography>
                        </div>
                        <Marquee>
                            <Typography variant='title' sx={{ fontSize: '1em' }}>{score.beatmap.artist} - {score.beatmap.title} [{score.beatmap.version}]</Typography>
                        </Marquee>
                        <Typography variant='h5' sx={{ fontSize: '1.1em' }}>{value}</Typography>
                        <Typography sx={{ fontSize: '1em' }}>Played <Chip color="primary" label={TimeAgo(score.ended_at)} size="small"></Chip></Typography>
                        <Button startIcon={<VisibilityIcon />} onClick={() => loadScoreView(score)} variant='contained'>View score</Button>
                    </Stack>
                </CardContent>
            </Card>
        </>
    )
}

export default ScoreCard;