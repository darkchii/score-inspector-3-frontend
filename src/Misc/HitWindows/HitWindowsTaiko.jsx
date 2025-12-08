import BeatmapDifficultyInfo from "../BeatmapDifficultyInfo";
import HitWindows from "./HitWindows";

const GREAT_WINDOW_RANGE = [50, 35, 20];
const OK_WINDOW_RANGE = [120, 80, 50];
const MISS_WINDOW_RANGE = [135, 95, 70];

class HitWindowsTaiko extends HitWindows {
    constructor() {
        super();

        this.great = null;
        this.ok = null;
        this.miss = null;
    }

    SetDifficulty(overallDifficulty) {
        this.great = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, GREAT_WINDOW_RANGE)) - 0.5;
        this.ok = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, OK_WINDOW_RANGE)) - 0.5;
        this.miss = Math.floor(BeatmapDifficultyInfo.DifficultyRange(overallDifficulty, MISS_WINDOW_RANGE)) - 0.5;
    }

    WindowFor(result) {
        switch(result) {
            case 'great':
                return this.great;
            case 'ok':
                return this.ok;
            case 'miss':
                return this.miss;
            default:
                return null;
        }
    }
}

export default HitWindowsTaiko;