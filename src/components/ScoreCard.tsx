import { Button, Chip, Stack, Typography } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { GetRulesetIconFromId, TimeAgo } from "../util/Helper";
import { useScoreView } from "../providers/ScoreViewProvider";
import Marquee from "./Marquee";
import scoreCardStyles from '../styles/score-card.module.less';
import { IScore } from "../types/types";
import { ReactElement } from "react";

function ScoreCard({ score, title = null, value = null }: {
    score: IScore | null,
    title?: string | ReactElement | null,
    value?: string | ReactElement | null,
}) {
    const { loadScoreView } = useScoreView();

    if (!score) return (
        <>
            <div className={scoreCardStyles['score-card']} >
                <div className={scoreCardStyles['score-card__content']}>
                    <Stack spacing={1}>
                        {
                            title && <Typography variant='h6' sx={{ fontSize: '0.9em' }}>{title} play</Typography>
                        }
                        <Typography variant='body2' sx={{ fontSize: '1em' }}>No score found</Typography>
                    </Stack>
                </div>
            </div>
        </>
    )

    return (
        <>
            <div className={scoreCardStyles['score-card']} style={{ backgroundImage: `url(https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapset_id}/covers/cover@2x.jpg)` }}>
                <div className={scoreCardStyles['score-card__content']}>
                    <Stack spacing={1}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={GetRulesetIconFromId(score.ruleset_id)} style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginRight: '0.3em' }} />
                            <Typography variant='h6' sx={{ fontSize: '0.9em' }}> {title} play</Typography>
                        </div>
                        <Marquee>
                            <Typography variant='body2' sx={{ fontSize: '1em' }}>{score.beatmap.artist} - {score.beatmap.title} [{score.beatmap.version}]</Typography>
                        </Marquee>
                        <Typography variant='h5' sx={{ fontSize: '1.1em' }}>{value}</Typography>
                        <span style={{ fontSize: '1em' }}>Played <Chip color="primary" label={TimeAgo(score.ended_at)} size="small"></Chip></span>
                        <Button startIcon={<VisibilityIcon />} onClick={() => loadScoreView(score)} variant='contained'>View score</Button>
                    </Stack>
                </div>
            </div>
        </>
    )
}

export default ScoreCard;