//Static class
class BeatmapDifficultyInfo {
    static DifficultyRange(difficulty: number, range = null) {
        if(!range) {
            return (difficulty - 5) / 5;
        }

        const min = range[0];
        const mid = range[1];
        const max = range[2];

        if(difficulty > 5){
            return mid + (max - mid) * BeatmapDifficultyInfo.DifficultyRange(difficulty);
        }

        if(difficulty < 5){
            return mid + (mid - min) * BeatmapDifficultyInfo.DifficultyRange(difficulty);
        }

        return mid;
    }

    static InverseDifficultyRange(difficultyValue: number, diff0: number, diff5: number, diff10: number) {
        return Math.sign(difficultyValue - diff5) === Math.sign(diff10-diff5)
            ? (difficultyValue - diff5) / (diff10 - diff5) * 5 + 5
            : (difficultyValue - diff5) / (diff5 - diff0) * 5 + 5;
    }
}

export default BeatmapDifficultyInfo;