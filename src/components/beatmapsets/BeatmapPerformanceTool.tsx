import { useEffect, useRef, useState } from "react";
import type { IBeatmap, IRouteBeatmapResult, IScore, IScoreDifficulty, IScoreMod } from "../../types/types";
import { Box, Button, Divider, Typography } from "@mui/material";
import PerformanceModSelector, { type AdjustableSelectedMod } from "./performanceCalculator/PerformanceModSelector";
import { ShowNotification } from "../../util/Helper";
import Score from "../../types/Score";
import { useApi } from "../../providers/ApiProvider";
import ScoreViewBase from "../scoreView/ScoreViewBase";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { useScoreView } from "../../providers/ScoreViewProvider";
import DifficultyBadge from "../DifficultyBadge";

const defaultScoreData = {
    user_id: 3,
    is_lazer: true,
    has_replay: false,
    passed: true, //with some settings impossible, but this has no bearing on results
    pp: 0, //generated pp is stored elsewhere in the score object, this is just api value
    preserve: true,
    processed: true,
    replay: false,
    type: 'solo_score'
}

function BeatmapPerformanceTool({ data }: { data: IRouteBeatmapResult | null }) {
    const { getDifficulty, getUserLive } = useApi();
    const { loadScoreView } = useScoreView();

    const [resetKey, setResetKey] = useState(0); //used to reset settings when beatmap changes
    const [selectedModsAdjustable, setSelectedModsAdjustable] = useState<AdjustableSelectedMod[]>([]);
    const [difficulty, setDifficulty] = useState<number | null>(null);

    const [generatedScore, setGeneratedScore] = useState<IScore | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setResetKey((prev) => prev + 1);
        setSelectedModsAdjustable([]);
        setGeneratedScore(null);
    }, [data]);

    useEffect(() => {
        //create a hash from 'data', so that after fetching difficulty, if data changes, we can ignore it
        //because otherwise we don't need to wait for this data for any critical functionality
        //it's only used to display the star rating
        const dataHash = JSON.stringify({
            beatmap_id: data?.beatmap?.id,
            ruleset_id: data?.beatmap?.ruleset_id,
        });
        if (data && data.beatmap) {
            (async () => {
                try {
                    const difficultyResponse = await getDifficulty(data.beatmap!.id, data.beatmap!.ruleset_id, selectedModsAdjustable.map(m => m.selected ? m.mod : null).filter(m => m) as IScoreMod[]);
                    if (JSON.stringify({
                        beatmap_id: data?.beatmap?.id,
                        ruleset_id: data?.beatmap?.ruleset_id,
                    }) !== dataHash) return;
                    setDifficulty(difficultyResponse?.star_rating || null);
                }
                catch (e) {
                    console.error("Error fetching difficulty:", e);
                    ShowNotification("Error fetching difficulty", "error");
                }
            })();
        } else {
            setDifficulty(null);
        }
    }, [selectedModsAdjustable, data?.beatmap]);

    if (!data || !data.beatmap) {
        return <Typography variant="h6" gutterBottom>
            No beatmap data available.
        </Typography>
    }

    const onRequestPerformance = () => {
        (async () => {
            setIsGenerating(true);
            try {
                const mods = selectedModsAdjustable.map(m => m.selected ? m.mod : null).filter(m => m) as IScoreMod[];
                const map: IBeatmap = data.beatmap!.clone(); //beatmap always exists here due to check
                map.mapper = (map.mapper as any)?.osuApi.username || map.mapper; //ensure mapper has username for score generation, this is required for some performance calculators that fetch additional data about the mapper
                const difficultyResponse = await getDifficulty(map.beatmap_id, map.ruleset_id, mods);
                const user = await getUserLive(3, false);
                console.log(user);
                const _score: IScore = new Score({
                    mods: mods,
                    beatmap_id: map.id,
                    ruleset_id: map.ruleset_id,
                    accuracy: 1, //TODO: user input
                    classic_total_score: 0, //TODO: generate? not sure, might not care
                    legacy_perfect: true, //TODO: determine from stats
                    //TODO: MAXIMUM HIT STATS, 0 for now
                    grade: 'X', //TODO: determine from stats
                    ended_at: new Date(), //no real reason for this to be accurate, just needs to exist
                    started_at: new Date(), //no real reason for this to be accurate, just needs to exist
                    //TODO: HIT STATS, 0 for now
                    total_score: 0, //TODO: generate? not sure, might not care
                    mod_acronyms: mods.map(m => m.acronym),
                    attr_diff: difficultyResponse, //TODO: fetch from api
                    ...defaultScoreData,
                }, map, user);
                _score.combo = _score.max_combo || 0; //TODO: determine from stats, for now just set to max combo
                console.log("Generating performance with score:", _score);
                setGeneratedScore(_score);

                if (_score) {
                    loadScoreView(_score);
                }
            } catch (e) {
                console.error("Error generating performance:", e);
                ShowNotification("Error generating performance", "error");
            } finally {
                setIsGenerating(false);
            }
        })();
    }

    return (
        <>
            <PerformanceModSelector
                key={resetKey}
                ruleset={data.beatmap.ruleset}
                onSelectionChange={setSelectedModsAdjustable}
                disabled={isGenerating}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button variant='contained' onClick={onRequestPerformance} disabled={isGenerating}>
                    {isGenerating ? "Calculating..." : "Calculate"}
                </Button>
                {
                    difficulty && (
                        <DifficultyBadge
                            difficulty={difficulty}
                        />
                    )
                }
            </Box>
        </>
    )
}

export default BeatmapPerformanceTool;