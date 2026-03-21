import { Box, Button, Collapse, Divider, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { LevelToTotalScore, TotalScoreToLevel } from "../../util/ScoreHelper";
import { FormatNumber } from "../../util/Helper";

function ToolLevelCalculator() {
    return (
        <Box>
            <ToolLevelCalculatorFromScoreSection />
            <Divider sx={{ my: 2 }} />
            <ToolLevelCalculatorFromLevelSection />
        </Box>
    );
}

function ToolLevelCalculatorFromScoreSection() {
    const [score, setScore] = useState<number>(0);
    const [result, setResult] = useState<number | null>(null);

    return (
        <>
            <Typography variant="subtitle2" gutterBottom>Calculate level from score</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 2 }}>
                {/* <input type="number" value={score} onChange={(e) => setScore(e.target.value)} /> */}
                <TextField label="Total Score" type="number" value={score} onChange={(e: any) => setScore(e.target.value)} />
                {/* <button onClick={() => setResult(TotalScoreToLevel(score))}>Calculate</button> */}
                <Button variant="contained" onClick={() => setResult(TotalScoreToLevel(score))}>Calculate</Button>
            </Box>
            <Collapse in={result !== null}>
                {
                    result !== null && (
                        <Typography variant="body1">Level: {FormatNumber(result)}</Typography>
                    )
                }
            </Collapse>
        </>
    )
}

function ToolLevelCalculatorFromLevelSection() {
    const [level, setLevel] = useState<number>(0);
    const [result, setResult] = useState<number | null>(null);
    return (
        <>
            <Typography variant="subtitle2" gutterBottom>Calculate score from level</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 2 }}>
                <TextField label="Level" type="number" value={level} onChange={(e: any) => setLevel(e.target.value)} />
                <Button variant="contained" onClick={() => setResult(LevelToTotalScore(level))}>Calculate</Button>
            </Box>
            <Collapse in={result !== null}>
                {
                    result !== null && (
                        <Typography variant="body1">Total Score: {FormatNumber(result)}</Typography>
                    )
                }
            </Collapse>
        </>
    )
}

export default ToolLevelCalculator;