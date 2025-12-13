import { Typography } from "@mui/material";
import ScoreList from "../ScoreList";

function ScoreViewOtherScores({ score }) {
    return (
        <div style={{
        }}>
            {
                score.beatmap?.getScores().length > 0 ? (
                    <ScoreList scores={score.beatmap.getScores()} />
                ) : (
                    <Typography
                        variant="body1"
                        align="center"
                        color="textSecondary"
                        style={{ marginTop: '1em' }}
                    >
                        No other scores for this beatmap.
                    </Typography>
                )
            }
        </div>
    )
}

export default ScoreViewOtherScores;