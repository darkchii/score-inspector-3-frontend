import { Typography } from "@mui/material";
import ScoreList from "../ScoreList";
import React from "react";
import NumberFlow from "@number-flow/react";

function ScoreViewOtherScores({ score }) {
    return (
        <div>
            {
                score.beatmap?.getScores().length > 0 ? (
                    <React.Fragment>
                        <Typography variant="body2" align="center" style={{ marginBottom: '1em' }}>
                            <NumberFlow value={score.beatmap.getScores().length} /> score{score.beatmap.getScores().length !== 1 ? 's' : ''} for this beatmap.
                        </Typography>
                        <ScoreList scores={score.beatmap.getScores('implied_pp')} isCompact={true} />
                    </React.Fragment>
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