import { Typography } from "@mui/material";
import React from "react";
import NumberFlow from "@number-flow/react";
import ItemList from "../list/ItemList";
import ScoreListRow from "../list/ScoreListRow";
import { IScore } from "../../types/types";

function ScoreViewOtherScores({ score, active = null }: {
    score: IScore | null,
    active: boolean | null
}) {
    if(active === false) return null;
    if(!score?.beatmap || score.beatmap.getScores()?.length === 0) return null;

    return (
        <div>
            {
                (score.beatmap.getScores()?.length || 0) > 0 ? (
                    <React.Fragment>
                        <Typography variant="body2" align="center" style={{ marginBottom: '1em' }}>
                            <NumberFlow value={score.beatmap.getScores()?.length || 0} /> score{(score.beatmap.getScores()?.length || 0) !== 1 ? 's' : ''} for this beatmap.
                        </Typography>
                        <ItemList
                            items={score.beatmap.getScores('implied_pp') || []}
                            isCompact={true}
                            ItemListRowType={ScoreListRow}
                        />
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