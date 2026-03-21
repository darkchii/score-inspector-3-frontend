import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import type { IHitWindowsTaiko } from "../types";
import HitWindows from "./HitWindows";

const GREAT_WINDOW_RANGE = [50, 35, 20];
const OK_WINDOW_RANGE = [120, 80, 50];
const MISS_WINDOW_RANGE = [135, 95, 70];

class HitWindowsTaiko extends HitWindows implements IHitWindowsTaiko {
    great: number;
    ok: number;
    miss: number;

    constructor() {
        super();

        this.great = 0;
        this.ok = 0;
        this.miss = 0;
    }

    SetDifficulty(overallDifficulty: number) {
        this.great = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, GREAT_WINDOW_RANGE)) - 0.5;
        this.ok = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, OK_WINDOW_RANGE)) - 0.5;
        this.miss = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, MISS_WINDOW_RANGE)) - 0.5;
    }

    WindowFor(result: 'great' | 'ok' | 'miss'): number {
        switch(result) {
            case 'great':
                return this.great;
            case 'ok':
                return this.ok;
            case 'miss':
                return this.miss;
            default:
                return 0;
        }
    }
}

export default HitWindowsTaiko;