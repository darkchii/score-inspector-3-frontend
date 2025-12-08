import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import HitWindows from "./HitWindows";

const GREAT_WINDOW_RANGE = [80, 50, 20];
const OK_WINDOW_RANGE = [140, 100, 60];
const MEH_WINDOW_RANGE = [200, 150, 100];

const MISS_WINDOW = 400;

class HitWindowsOsu extends HitWindows {
    constructor() {
        super();

        this.great = null;
        this.ok = null;
        this.meh = null;
    }

    SetDifficulty(overallDifficulty) {
        this.great = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, GREAT_WINDOW_RANGE)) - 0.5;
        this.ok = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, OK_WINDOW_RANGE)) - 0.5;
        this.meh = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, MEH_WINDOW_RANGE)) - 0.5;
    }

    WindowFor(result) {
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
                return null;
        }
    }
}

export default HitWindowsOsu;