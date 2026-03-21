import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import type { IHitWindowsOsu } from "../types";
import HitWindows from "./HitWindows";

const GREAT_WINDOW_RANGE: number[] = [80, 50, 20];
const OK_WINDOW_RANGE: number[] = [140, 100, 60];
const MEH_WINDOW_RANGE: number[] = [200, 150, 100];

const MISS_WINDOW: number = 400;

class HitWindowsOsu extends HitWindows implements IHitWindowsOsu {
    great: number;
    ok: number;
    meh: number;

    constructor() {
        super();

        this.great = 0;
        this.ok = 0;
        this.meh = 0;
    }

    SetDifficulty(overallDifficulty: number) {
        this.great = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, GREAT_WINDOW_RANGE)) - 0.5;
        this.ok = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, OK_WINDOW_RANGE)) - 0.5;
        this.meh = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, MEH_WINDOW_RANGE)) - 0.5;
    }

    WindowFor(result: 'great' | 'ok' | 'meh' | 'miss') : number {
        switch(result) {
            case 'great':
                return this.great;
            case 'ok':
                return this.ok;
            case 'meh':
                return this.meh;
            case 'miss':
                return MISS_WINDOW;
            default:
                return 0;
        }
    }
}

export default HitWindowsOsu;