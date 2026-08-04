import { GetRulesetId } from "../util/Helper";
import type { IBeatmap, IScore, IProfileRulesetStatisticsPacks } from "./types";

export class ProfileRulesetStatisticsPacks implements IProfileRulesetStatisticsPacks {
    packs: any[] = [];
    ruleset: string | null = null;
    
    constructor(beatmaps: IBeatmap[], packs: any, ruleset: string | null = null) {
        this.packs = [];
        this.ruleset = ruleset;

        this.processPacks(beatmaps, packs);
    }

    processPacks(beatmaps: IBeatmap[], packs: any) {
        //deepcopy packs, they are reused per ruleset and need ruleset-specific data
        let _packs = JSON.parse(JSON.stringify(packs));

        const beatmapIdMap: { [key: number]: IBeatmap } = {};
        for(const beatmap of beatmaps) {
            beatmapIdMap[beatmap.beatmap_id] = beatmap;
        }

        const beatmapSetIdMap: { [key: number]: IBeatmap[] } = {};
        for(const beatmap of beatmaps) {
            if(!beatmapSetIdMap[beatmap.beatmapset_id]) {
                beatmapSetIdMap[beatmap.beatmapset_id] = [];
            }
            beatmapSetIdMap[beatmap.beatmapset_id].push(beatmap);
        }

        for(const pack of _packs) {
            //first readjust to contain beatmap ids, not beatmapset ids
            pack.beatmap_ids = [];
            for(const beatmapsetId of pack.beatmapset_ids) {
                const bms = beatmapSetIdMap[beatmapsetId];
                if(bms) {
                    for(const bm of bms) {
                        pack.beatmap_ids.push(bm.beatmap_id);
                    }
                }
            }
            //remove beatmapset_ids
            delete pack.beatmapset_ids;

            //filter beatmap_ids to only those matching the ruleset, if applicable
            if(this.ruleset && this.ruleset !== 'all') {
                const rulesetId = GetRulesetId(this.ruleset);
                pack.beatmap_ids = pack.beatmap_ids.filter((bmId: number) => {
                    const bm = beatmapIdMap[bmId];
                    return bm && bm.ruleset_id === rulesetId;
                });
            }

            if(pack.beatmap_ids.length === 0) {
                //no beatmaps for this ruleset, skip
                continue;
            }

            this.packs.push(pack);
        }
    }

    processScores(scores: IScore[], beatmaps: IBeatmap[]) {
        //first list all unique beatmap ids from scores
        const playedBeatmapIds = new Set<number>();
        for(const score of scores) {
            playedBeatmapIds.add(score.beatmap_id);
        }

        const beatmapIdScoreMap: { [key: number]: IScore[] } = {};
        for(const score of scores) {
            if(!beatmapIdScoreMap[score.beatmap_id]) {
                beatmapIdScoreMap[score.beatmap_id] = [];
            }
            beatmapIdScoreMap[score.beatmap_id].push(score);
        }

        //then per pack, calculate % completion
        for(const pack of this.packs) {
            let completedCount = 0;
            let completedFcCount = 0;
            for(const beatmapId of pack.beatmap_ids) {
                if(playedBeatmapIds.has(beatmapId)) {
                    completedCount++;

                    //check for FC
                    if(beatmapIdScoreMap[beatmapId]) {
                        const scoresForBeatmap = beatmapIdScoreMap[beatmapId];
                        for(const score of scoresForBeatmap) {
                            if(score.is_fc) {
                                completedFcCount++;
                                break;
                            }
                        }
                    }
                }
            }
            pack.total = pack.beatmap_ids.length;
            pack.completed = completedCount;
            pack.completed_fc = completedFcCount;
            pack.completion = (completedCount / pack.beatmap_ids.length) * 100;
            pack.is_completed = (completedCount === pack.beatmap_ids.length);
            pack.is_completed_fc = (completedFcCount === pack.beatmap_ids.length);
        }
    }
}
