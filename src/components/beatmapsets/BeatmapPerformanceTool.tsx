import { useEffect, useRef, useState } from "react";
import type { IBeatmap, IRouteBeatmapResult, IScore, IScoreDifficulty, IScoreMod } from "../../types/types";
import { Alert, Box, Button, Divider, Typography } from "@mui/material";
import PerformanceModSelector, { type AdjustableSelectedMod } from "./performanceCalculator/PerformanceModSelector";
import { GetRulesetNameFromId, ShowNotification } from "../../util/Helper";
import Score from "../../types/Score";
import { useApi } from "../../providers/ApiProvider";
import ScoreViewBase from "../scoreView/ScoreViewBase";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import { useScoreView } from "../../providers/ScoreViewProvider";
import DifficultyBadge from "../DifficultyBadge";
import { GetScoreMultiplierCalculator } from "../../types/ScoreMultiplierCalculator";
import { ConvertStandardisedToClassic } from "../../util/ScoreHelper";

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
    const { getDifficulty, getUserLive, getBeatmapMaxStatistics } = useApi();
    const { loadScoreView } = useScoreView();

    const [resetKey, setResetKey] = useState(0); //used to reset settings when beatmap changes
    const [selectedModsAdjustable, setSelectedModsAdjustable] = useState<AdjustableSelectedMod[]>([]);
    const [difficulty, setDifficulty] = useState<number | null>(null);

    const [generatedScore, setGeneratedScore] = useState<IScore | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inFlightRequestRef = useRef(false);
    const pendingChangesRef = useRef(false);

    useEffect(() => {
        setResetKey((prev) => prev + 1);
        setSelectedModsAdjustable([]);
        setGeneratedScore(null);
    }, [data]);

    useEffect(() => {
        // Mark that we have pending changes
        pendingChangesRef.current = true;

        // Clear existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Create a hash from 'data', so that after fetching difficulty, if data changes, we can ignore it
        // because otherwise we don't need to wait for this data for any critical functionality
        // it's only used to display the star rating
        const dataHash = JSON.stringify({
            beatmap_id: data?.beatmap?.id,
            ruleset_id: data?.beatmap?.ruleset_id,
        });

        if (data && data.beatmap) {
            // Define the fetch function
            const performFetch = async () => {
                // If a request is already in flight, don't make a new one yet
                if (inFlightRequestRef.current) {
                    return;
                }

                try {
                    inFlightRequestRef.current = true;
                    pendingChangesRef.current = false;

                    const difficultyResponse = await getDifficulty(
                        data.beatmap!.id,
                        data.beatmap!.ruleset_id,
                        selectedModsAdjustable
                            .map(m => (m.selected ? m.mod : null))
                            .filter((m): m is IScoreMod => m !== null)
                    );

                    // Check if data changed while we were fetching
                    if (
                        JSON.stringify({
                            beatmap_id: data?.beatmap?.id,
                            ruleset_id: data?.beatmap?.ruleset_id,
                        }) !== dataHash
                    ) {
                        return;
                    }

                    setDifficulty(difficultyResponse?.star_rating || null);

                    // If there were changes while we were fetching, fetch again
                    if (pendingChangesRef.current) {
                        pendingChangesRef.current = false;
                        debounceTimeoutRef.current = setTimeout(performFetch, 0);
                    }
                } catch (e) {
                    console.error("Error fetching difficulty:", e);
                    ShowNotification("Error fetching difficulty", "error");
                } finally {
                    inFlightRequestRef.current = false;
                }
            };

            // Set a debounce timeout (300ms)
            debounceTimeoutRef.current = setTimeout(performFetch, 300);
        } else {
            setDifficulty(null);

        }

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [selectedModsAdjustable, data?.beatmap, getDifficulty]);

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
                const maxStatisticsResponse = await getBeatmapMaxStatistics(map.beatmap_id, GetRulesetNameFromId(map.ruleset_id));
                const user = await getUserLive(3, false);
                console.log(user);
                const _scoreBase = {
                    build_id: 50000, //force use of V2 score multiplier calculator
                    mods: mods,
                    beatmap_id: map.id,
                    ruleset_id: map.ruleset_id,
                    ruleset: map.ruleset,
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
                    // attr_diff: difficultyResponse, //TODO: fetch from api
                    scoreAttribute: {
                        attr_diff: difficultyResponse,
                    },
                    statistics: {
                        great: maxStatisticsResponse?.great || 0,
                    },
                    combo: map.max_combo || 0, //TODO: determine from stats, for now just set to max combo
                    ...defaultScoreData,
                };
                if (maxStatisticsResponse) {
                    for (const key in maxStatisticsResponse) {
                        if (Object.prototype.hasOwnProperty.call(maxStatisticsResponse, key)) {
                            const value = maxStatisticsResponse[key];
                            (_scoreBase as any)[`statistics_${key}`] = value;
                            (_scoreBase as any)[`maximum_statistics_${key}`] = value;
                        }
                    }
                }

                //todo; adjustable statistics and combo settings. For now we go for SS

                const _score: IScore = new Score(_scoreBase, map, user);
                //get all keys from 'maxStatisticsResponse',
                //and set score[statistics_{key}] = maxStatisticsResponse[key]
                const multiCalculator = GetScoreMultiplierCalculator(_score);
                const [multiplier, breakdown] = multiCalculator.Calculate();
                _score.score_multiplier = isNaN(multiplier) ? 1 : multiplier;
                _score.score_multiplier_breakdown = breakdown;

                //emulate ss score for now
                const standardisedScore = 1_000_000 * (_score.score_multiplier || 1);
                _score.total_score = standardisedScore;
                _score.implied_total_score = ConvertStandardisedToClassic(_score.ruleset_id, standardisedScore, map.count_circles + map.count_sliders + map.count_spinners); //convert to classic

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
            <Alert severity="info" sx={{ mb: 2 }}>
                Ability to adjust score statistics and combo will be implemented later.
            </Alert>
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